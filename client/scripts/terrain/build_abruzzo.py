"""Costruisce il rilievo dell'Abruzzo per la sezione Territorio (una tantum, non nella build).

Ingressi (scaricati a mano in una cartella):
  - tile Terrarium di AWS Terrain Tiles, zoom 9, x 274-277, y 188-190, nominate t_<x>_<y>.png
    https://s3.amazonaws.com/elevation-tiles-prod/terrarium/9/<x>/<y>.png
  - confini delle regioni di openpolis/geojson-italy (limits_IT_regions.geojson, CC BY 4.0)

Uscite in client/public/terrain/:
  - abruzzo-height.png: R e G sono la quota in metri (R*256 + G), B è la maschera della regione
  - abruzzo.json: dimensioni in km, quota massima, contorno della regione e luoghi in coordinate 0-1

Uso: python -I scripts/terrain/build_abruzzo.py <cartella-download> public/terrain
"""

import json
import math
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ZOOM = 9
TILES_X = range(274, 278)
TILES_Y = range(188, 191)
LON_MIN, LON_MAX = 12.95, 14.95
LAT_MIN, LAT_MAX = 41.62, 42.98
OUT_W = 512
PLACES = {
    'roseto': (14.0158, 42.6745),
    'cerchio': (13.6006, 42.0631),
}


def mercator_px(lon, lat):
    """Pixel globali (zoom ZOOM) di una coordinata."""
    n = 256 * 2**ZOOM
    x = (lon + 180) / 360 * n
    r = math.radians(lat)
    y = (1 - math.log(math.tan(r) + 1 / math.cos(r)) / math.pi) / 2 * n
    return x, y


def load_mosaic(src: Path):
    rows = []
    for ty in TILES_Y:
        row = []
        for tx in TILES_X:
            rgb = np.asarray(Image.open(src / f't_{tx}_{ty}.png').convert('RGB'), dtype=np.float64)
            row.append(rgb[..., 0] * 256 + rgb[..., 1] + rgb[..., 2] / 256 - 32768)
        rows.append(np.hstack(row))
    return np.vstack(rows), TILES_X[0] * 256, TILES_Y[0] * 256


def sample(mosaic, x, y):
    """Bilineare su array di coordinate."""
    x0 = np.clip(np.floor(x).astype(int), 0, mosaic.shape[1] - 2)
    y0 = np.clip(np.floor(y).astype(int), 0, mosaic.shape[0] - 2)
    fx, fy = x - x0, y - y0
    top = mosaic[y0, x0] * (1 - fx) + mosaic[y0, x0 + 1] * fx
    bottom = mosaic[y0 + 1, x0] * (1 - fx) + mosaic[y0 + 1, x0 + 1] * fx
    return top * (1 - fy) + bottom * fy


def to_uv(lon, lat):
    return (lon - LON_MIN) / (LON_MAX - LON_MIN), (LAT_MAX - lat) / (LAT_MAX - LAT_MIN)


def simplify(points, min_km):
    """Tiene un punto ogni min_km circa: basta per una linea di contorno sottile."""
    kept = [points[0]]
    for p in points[1:]:
        last = kept[-1]
        dx = (p[0] - last[0]) * 111.32 * math.cos(math.radians(42.3))
        dy = (p[1] - last[1]) * 110.57
        if math.hypot(dx, dy) >= min_km:
            kept.append(p)
    return kept + [points[0]]


def main(src: Path, out: Path):
    lat0 = (LAT_MIN + LAT_MAX) / 2
    width_km = (LON_MAX - LON_MIN) * 111.32 * math.cos(math.radians(lat0))
    height_km = (LAT_MAX - LAT_MIN) * 110.57
    out_h = round(OUT_W * height_km / width_km)

    mosaic, ox, oy = load_mosaic(src)
    lons = LON_MIN + (np.arange(OUT_W) + 0.5) / OUT_W * (LON_MAX - LON_MIN)
    lats = LAT_MAX - (np.arange(out_h) + 0.5) / out_h * (LAT_MAX - LAT_MIN)
    lon_grid, lat_grid = np.meshgrid(lons, lats)
    px, py = np.vectorize(mercator_px)(lon_grid, lat_grid)
    heights = np.clip(sample(mosaic, px - ox, py - oy), 0, 65535)

    regions = json.loads((src / 'regions.geojson').read_text(encoding='utf-8'))
    abruzzo = next(f for f in regions['features'] if f['properties']['reg_name'] == 'Abruzzo')
    ring = abruzzo['geometry']['coordinates'][0]

    scale = 4
    mask_img = Image.new('L', (OUT_W * scale, out_h * scale), 0)
    poly = [(u * OUT_W * scale, v * out_h * scale) for u, v in (to_uv(lon, lat) for lon, lat in ring)]
    ImageDraw.Draw(mask_img).polygon(poly, fill=255)
    mask = np.asarray(mask_img.resize((OUT_W, out_h), Image.LANCZOS), dtype=np.uint8)

    h = np.round(heights).astype(np.uint16)
    rgb = np.dstack([(h >> 8).astype(np.uint8), (h & 255).astype(np.uint8), mask])
    out.mkdir(parents=True, exist_ok=True)
    Image.fromarray(rgb, 'RGB').save(out / 'abruzzo-height.png', optimize=True)

    outline = [[round(c, 4) for c in to_uv(lon, lat)] for lon, lat in simplify(ring, 0.6)]
    meta = {
        'source': 'AWS Terrain Tiles (Mapzen, SRTM e altri); confini: openpolis/geojson-italy, CC BY 4.0',
        'widthKm': round(width_km, 2),
        'heightKm': round(height_km, 2),
        'maxHeightM': int(h.max()),
        'grid': [OUT_W, out_h],
        'outline': outline,
        'places': {name: [round(c, 4) for c in to_uv(*coord)] for name, coord in PLACES.items()},
    }
    (out / 'abruzzo.json').write_text(json.dumps(meta, separators=(',', ':')), encoding='utf-8')
    print(f'{OUT_W}x{out_h}, {width_km:.1f}x{height_km:.1f} km, max {h.max()} m, contorno {len(outline)} punti')


if __name__ == '__main__':
    main(Path(sys.argv[1]), Path(sys.argv[2]))
