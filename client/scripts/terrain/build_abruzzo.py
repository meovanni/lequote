"""Costruisce il diorama dell'Abruzzo per la sezione Territorio (una tantum, non nella build).

Lo stile è quello di un plastico in miniatura fotografato su un fondo bianco continuo: la regione
emerge dal bianco e ci sfuma ai confini, la luce (sole morbido, ombre, occlusione nelle valli) è
calcolata qui e "cotta" nella texture, così nel browser basta mostrarla.

Ingressi (scaricati a mano in una cartella):
  - tile Terrarium di AWS Terrain Tiles, zoom 10, x 548-554, y 376-381, nominate t_<x>_<y>.png
    https://s3.amazonaws.com/elevation-tiles-prod/terrarium/10/<x>/<y>.png
  - confini delle regioni di openpolis/geojson-italy (limits_IT_regions.geojson, CC BY 4.0)

Uscite in client/public/terrain/:
  - abruzzo-height.png: R e G sono la quota mostrata in metri (R*256 + G), già sfumata a zero fuori
    dalla regione
  - abruzzo-color.jpg: colori del paesaggio con la luce cotta
  - abruzzo-sea.png: quanto mare c'è in ogni punto (per lo strato d'acqua animato)
  - abruzzo.json: dimensioni, contorno, luoghi, direzione del sole, alberelli

Uso: python -I scripts/terrain/build_abruzzo.py <cartella-download> public/terrain
"""

import json
import math
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
from scipy.spatial import cKDTree

ZOOM = 10
TILES_X = range(548, 555)
TILES_Y = range(376, 382)
LON_MIN, LON_MAX = 12.95, 14.95
LAT_MIN, LAT_MAX = 41.62, 42.98
COLOR_W = 2048
HEIGHT_W = 1024
EXAGGERATION = 3
PLACES = {'roseto': (14.0158, 42.6745), 'cerchio': (13.6006, 42.0631)}

FLOOR = np.array([0xFC, 0xFC, 0xFB]) / 255
# Sole da sud-sud-est, basso come nelle foto dei plastici: rilievi in risalto, ombre lunghe.
SUN_AZIMUTH_DEG = 160
SUN_ELEVATION_DEG = 32
# Fuori dalla regione la terra scende a zero in questi km; dentro, dal confine, resta piena dopo FADE_IN.
FADE_OUT_KM, FADE_IN_KM = 3.0, 1.2
SEA_KM = 20

rng = np.random.default_rng(42)


def hex_rgb(value):
    return np.array([int(value[i:i + 2], 16) for i in (1, 3, 5)]) / 255


def smoothstep(edge0, edge1, x):
    t = np.clip((x - edge0) / (edge1 - edge0), 0, 1)
    return t * t * (3 - 2 * t)


def mercator_px(lon, lat):
    n = 256 * 2**ZOOM
    x = (lon + 180) / 360 * n
    r = np.radians(lat)
    y = (1 - np.log(np.tan(r) + 1 / np.cos(r)) / np.pi) / 2 * n
    return x, y


def load_mosaic(src):
    rows = []
    for ty in TILES_Y:
        row = []
        for tx in TILES_X:
            rgb = np.asarray(Image.open(src / f't_{tx}_{ty}.png').convert('RGB'), dtype=np.float64)
            row.append(rgb[..., 0] * 256 + rgb[..., 1] + rgb[..., 2] / 256 - 32768)
        rows.append(np.hstack(row))
    return np.vstack(rows), TILES_X[0] * 256, TILES_Y[0] * 256


def resample(mosaic, ox, oy, w, h):
    lons = LON_MIN + (np.arange(w) + 0.5) / w * (LON_MAX - LON_MIN)
    lats = LAT_MAX - (np.arange(h) + 0.5) / h * (LAT_MAX - LAT_MIN)
    lon_grid, lat_grid = np.meshgrid(lons, lats)
    px, py = mercator_px(lon_grid, lat_grid)
    return ndimage.map_coordinates(mosaic, [py - oy - 0.5, px - ox - 0.5], order=1, mode='nearest')


def region_mask(ring, w, h, scale=4):
    image = Image.new('L', (w * scale, h * scale), 0)
    poly = [((lon - LON_MIN) / (LON_MAX - LON_MIN) * w * scale, (LAT_MAX - lat) / (LAT_MAX - LAT_MIN) * h * scale) for lon, lat in ring]
    ImageDraw.Draw(image).polygon(poly, fill=255)
    return np.asarray(image.resize((w, h), Image.LANCZOS), dtype=np.float64) / 255


def smooth_noise(shape, sigma_px, rng):
    field = ndimage.gaussian_filter(rng.standard_normal(shape), sigma_px)
    return (field - field.mean()) / (field.std() + 1e-9)


def land_colors(meters, slope_deg, inside, km_px):
    """Copertura del suolo verosimile da quota, pendenza e rumore: campi a tessere in pianura,
    oliveti sulle colline basse, faggete, pascoli d'alta quota, roccia e cime chiare."""
    h, w = meters.shape
    patch = smooth_noise((h, w), 1.5 / km_px, rng)
    fine = smooth_noise((h, w), 0.35 / km_px, rng)

    # Tessere dei campi: celle di Voronoi di circa un chilometro, ognuna con la sua coltura.
    cells = int(w * h * km_px * km_px / 1.1)
    seeds = np.column_stack([rng.uniform(0, h, cells), rng.uniform(0, w, cells)])
    yy, xx = np.mgrid[0:h, 0:w]
    _, cell = cKDTree(seeds).query(np.column_stack([yy.ravel(), xx.ravel()]))
    crops = np.array([hex_rgb(c) for c in ['#b7c27f', '#a5b56d', '#cdc68e', '#c9b27a', '#9fae6a', '#d8cf9c', '#b39a72']])
    field_color = crops[rng.integers(0, len(crops), cells)][cell].reshape(h, w, 3)

    olive = hex_rgb('#97a174')
    forest = hex_rgb('#5a7a45')
    forest_light = hex_rgb('#6f8c50')
    pasture = hex_rgb('#aaa77a')
    rock = hex_rgb('#a39c90')
    snow = hex_rgb('#f3f2ee')
    sand = hex_rgb('#e4d8b8')

    color = field_color.copy()
    # Colline basse: oliveti mescolati ai campi.
    olive_w = smoothstep(40, 120, meters) * (1 - smoothstep(450, 650, meters)) * smoothstep(-0.3, 0.6, patch)
    color = color * (1 - olive_w[..., None]) + olive * olive_w[..., None]
    # Bosco: in quota e sui versanti ripidi, con chiazze più chiare.
    forest_w = smoothstep(650, 900, meters) * (1 - smoothstep(1650, 1850, meters))
    forest_w = np.maximum(forest_w, smoothstep(14, 22, slope_deg) * (1 - smoothstep(1650, 1850, meters)))
    forest_w = forest_w * smoothstep(-1.2, -0.2, patch + 0.6)
    forest_mix = forest * (1 - smoothstep(-1, 1, fine)[..., None]) + forest_light * smoothstep(-1, 1, fine)[..., None]
    color = color * (1 - forest_w[..., None]) + forest_mix * forest_w[..., None]
    # Piani carsici e conche d'alta quota restano pascolo; sopra il bosco, pascolo e poi roccia.
    pasture_w = smoothstep(1650, 1850, meters) * (1 - smoothstep(2150, 2350, meters))
    color = color * (1 - pasture_w[..., None]) + pasture * pasture_w[..., None]
    rock_w = np.maximum(smoothstep(2150, 2350, meters), smoothstep(30, 42, slope_deg))
    color = color * (1 - rock_w[..., None]) + rock * rock_w[..., None]
    snow_w = smoothstep(2380, 2550, meters + fine * 80)
    color = color * (1 - snow_w[..., None]) + snow * snow_w[..., None]
    sand_w = (1 - smoothstep(3, 12, meters)) * inside
    color = color * (1 - sand_w[..., None]) + sand * sand_w[..., None]
    # Grana fine, come l'erbetta dei plastici.
    return np.clip(color * (1 + 0.05 * fine[..., None]), 0, 1)


def soft_shadow(height_km, km_px, sun_dirs):
    """Ombra portata: per ogni direzione del sole si cammina sulla mappa delle quote e si vede se
    un rilievo copre il punto. Più direzioni vicine danno la penombra morbida."""
    h, w = height_km.shape
    total = np.zeros_like(height_km)
    for az, el in sun_dirs:
        dx, dy = math.sin(math.radians(az)), -math.cos(math.radians(az))
        rise = math.tan(math.radians(el)) * km_px
        lit = np.ones_like(height_km, dtype=bool)
        max_steps = int(min(260, height_km.max() / rise) + 1)
        for step in range(1, max_steps):
            ox, oy = int(round(dx * step)), int(round(dy * step))
            shifted = np.full_like(height_km, -1.0)
            ys = slice(max(0, -oy), h - max(0, oy))
            xs = slice(max(0, -ox), w - max(0, ox))
            yd = slice(max(0, oy), h - max(0, -oy))
            xd = slice(max(0, ox), w - max(0, -ox))
            shifted[ys, xs] = height_km[yd, xd]
            lit &= shifted < height_km + rise * step
        total += lit
    return total / len(sun_dirs)


def main(src, out):
    lat0 = (LAT_MIN + LAT_MAX) / 2
    width_km = (LON_MAX - LON_MIN) * 111.32 * math.cos(math.radians(lat0))
    height_km = (LAT_MAX - LAT_MIN) * 110.57
    color_h = round(COLOR_W * height_km / width_km)
    km_px = width_km / COLOR_W

    mosaic, ox, oy = load_mosaic(src)
    raw = resample(mosaic, ox, oy, COLOR_W, color_h)
    meters = np.clip(raw, 0, None)
    sea_raw = raw <= 0.5

    regions = json.loads((src / 'regions.geojson').read_text(encoding='utf-8'))
    ring = next(f for f in regions['features'] if f['properties']['reg_name'] == 'Abruzzo')['geometry']['coordinates'][0]
    mask = region_mask(ring, COLOR_W, color_h)
    inside = mask > 0.5
    signed_km = (ndimage.distance_transform_edt(inside) - ndimage.distance_transform_edt(~inside)) * km_px
    land = smoothstep(-FADE_OUT_KM, FADE_IN_KM, signed_km)

    shown_m = meters * land
    shown_km = shown_m / 1000 * EXAGGERATION

    # Mare: l'Adriatico davanti alla costa abruzzese, che sfuma nel bianco al largo.
    coast = inside & ndimage.binary_dilation(sea_raw, iterations=2)
    coast_km = ndimage.distance_transform_edt(~coast) * km_px
    sea = sea_raw * (1 - smoothstep(SEA_KM * 0.2, SEA_KM, coast_km)) * (1 - land)
    # Anche ai bordi dei dati il mare sfuma, invece di finire con un taglio dritto.
    yy, xx = np.mgrid[0:color_h, 0:COLOR_W]
    border_km = np.minimum.reduce([xx, COLOR_W - 1 - xx, yy, color_h - 1 - yy]) * km_px
    sea = sea * smoothstep(2, 14, border_km)
    sea = ndimage.gaussian_filter(sea.astype(float), 1.2 / km_px)

    gy, gx = np.gradient(shown_km, km_px)
    slope_deg = np.degrees(np.arctan(np.hypot(*np.gradient(meters / 1000, km_px))))
    normal = np.dstack([-gx, -gy, np.ones_like(gx)])
    normal /= np.linalg.norm(normal, axis=2, keepdims=True)
    az, el = math.radians(SUN_AZIMUTH_DEG), math.radians(SUN_ELEVATION_DEG)
    sun = np.array([math.sin(az) * math.cos(el), -math.cos(az) * math.cos(el), math.sin(el)])
    diffuse = np.clip(normal @ sun, 0, 1)

    # Ombre a metà risoluzione (sono morbide comunque), poi riportate su e sfocate.
    half = shown_km[::2, ::2]
    jitter = [(SUN_AZIMUTH_DEG + da, SUN_ELEVATION_DEG + de) for da in (-6, 0, 6) for de in (-3, 3)]
    shadow_half = soft_shadow(half, km_px * 2, jitter)
    shadow = ndimage.zoom(shadow_half, (color_h / half.shape[0], COLOR_W / half.shape[1]), order=1)[:color_h, :COLOR_W]
    shadow = ndimage.gaussian_filter(shadow, 0.25 / km_px)

    # Occlusione: le valli e i piedi dei rilievi prendono meno cielo.
    ao = np.ones_like(shown_km)
    for radius_km, strength in ((0.4, 1.0), (1.5, 0.6), (5, 0.3)):
        blurred = ndimage.gaussian_filter(shown_km, radius_km / km_px)
        ao -= strength * np.clip(blurred - shown_km, 0, None)
    ao = np.clip(ao, 0.7, 1)

    albedo = land_colors(meters, slope_deg, land, km_px)
    water = hex_rgb('#9cc0c6')
    base = FLOOR * (1 - land[..., None]) + albedo * land[..., None]
    base = base * (1 - sea[..., None]) + water * sea[..., None]

    light = (0.66 + 0.48 * diffuse * shadow)[..., None]
    warm = np.array([1.04, 1.0, 0.93])
    cool = np.array([0.93, 0.97, 1.05])
    tint = warm * shadow[..., None] + cool * (1 - shadow[..., None])
    lit = base * light * tint * ao[..., None]
    # Sul fondo bianco solo l'ombra del rilievo e il contatto, niente chiaroscuro.
    floor_shade = (0.93 + 0.07 * shadow) * (0.9 + 0.1 * ao)
    floor_lit = FLOOR * floor_shade[..., None]
    terrain_w = np.maximum(land, sea)[..., None]
    color = np.clip(floor_lit * (1 - terrain_w) + lit * terrain_w, 0, 1)

    trees = place_trees(meters, slope_deg, land, km_px)
    color = darken_under_trees(color, trees, km_px, color_h)

    out.mkdir(parents=True, exist_ok=True)
    Image.fromarray((color * 255).round().astype(np.uint8), 'RGB').save(out / 'abruzzo-color.jpg', quality=88, optimize=True, progressive=True)

    height_h = round(HEIGHT_W * height_km / width_km)
    small = ndimage.zoom(shown_m, (height_h / color_h, HEIGHT_W / COLOR_W), order=1)[:height_h, :HEIGHT_W]
    hm = np.clip(np.round(small), 0, 65535).astype(np.uint16)
    Image.fromarray(np.dstack([(hm >> 8).astype(np.uint8), (hm & 255).astype(np.uint8), np.zeros_like(hm, dtype=np.uint8)]), 'RGB').save(out / 'abruzzo-height.png', optimize=True)
    sea_small = ndimage.zoom(sea, (512 * height_km / width_km / color_h, 512 / COLOR_W), order=1)
    Image.fromarray((np.clip(sea_small, 0, 1) * 255).astype(np.uint8), 'L').save(out / 'abruzzo-sea.png', optimize=True)

    def to_uv(lon, lat):
        return [round((lon - LON_MIN) / (LON_MAX - LON_MIN), 4), round((LAT_MAX - lat) / (LAT_MAX - LAT_MIN), 4)]

    meta = {
        'source': 'AWS Terrain Tiles (Mapzen, SRTM e altri); confini: openpolis/geojson-italy, CC BY 4.0',
        'widthKm': round(width_km, 2),
        'heightKm': round(height_km, 2),
        'maxHeightM': int(hm.max()),
        'grid': [HEIGHT_W, height_h],
        'outline': [to_uv(lon, lat) for lon, lat in ring[::3]],
        'places': {name: to_uv(*coord) for name, coord in PLACES.items()},
        'sun': [round(float(v), 4) for v in (sun[0], sun[2], sun[1])],
        'trees': trees,
    }
    (out / 'abruzzo.json').write_text(json.dumps(meta, separators=(',', ':')), encoding='utf-8')
    print(f'colore {COLOR_W}x{color_h}, quote {HEIGHT_W}x{height_h}, alberi {len(trees)}')


def place_trees(meters, slope_deg, land, km_px):
    """Alberelli in miniatura: faggi tondi nei boschi, ulivi grigio-verdi sulle colline basse.
    [u, v, tipo (0 bosco, 1 ulivo), scala]"""
    h, w = meters.shape
    trees = []
    for kind, spacing_km, keep, test in (
        (0, 0.95, 0.75, lambda m, s: (m > 750) & (m < 1750) & (s < 34)),
        (1, 1.25, 0.45, lambda m, s: (m > 60) & (m < 480) & (s < 14)),
    ):
        step = spacing_km / km_px
        ys = np.arange(step / 2, h, step)
        xs = np.arange(step / 2, w, step)
        gy, gx = np.meshgrid(ys, xs, indexing='ij')
        gy = gy + rng.uniform(-0.45, 0.45, gy.shape) * step
        gx = gx + rng.uniform(-0.45, 0.45, gx.shape) * step
        iy = np.clip(gy.astype(int), 0, h - 1)
        ix = np.clip(gx.astype(int), 0, w - 1)
        ok = test(meters[iy, ix], slope_deg[iy, ix]) & (land[iy, ix] > 0.97) & (rng.uniform(0, 1, gy.shape) < keep)
        for y, x in zip(gy[ok], gx[ok]):
            trees.append([round(float(x / w), 4), round(float(y / h), 4), kind, round(float(rng.uniform(0.8, 1.25)), 2)])
    return trees


def darken_under_trees(color, trees, km_px, color_h):
    """Ombra di contatto sotto ogni alberello, spostata un poco dal sole."""
    h, w = color.shape[:2]
    stamp = np.zeros((h, w))
    az = math.radians(SUN_AZIMUTH_DEG)
    off_x, off_y = -math.sin(az) * 0.35 / km_px, math.cos(az) * 0.35 / km_px
    for u, v, _, _ in trees:
        x, y = int(u * w + off_x), int(v * h + off_y)
        if 0 <= x < w and 0 <= y < h:
            stamp[y, x] += 1
    stamp = ndimage.gaussian_filter(stamp, 0.28 / km_px)
    stamp = stamp / (stamp.max() + 1e-9)
    return color * (1 - 0.22 * np.clip(stamp * 2.2, 0, 1))[..., None]


if __name__ == '__main__':
    main(Path(sys.argv[1]), Path(sys.argv[2]))
