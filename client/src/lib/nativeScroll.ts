// Telefoni, tablet e schermi stretti: niente snap, niente animazioni legate allo scroll, niente
// sezioni pinnate. Su WebKit (Safari e Firefox su iPhone) lo scroll inerziale veloce con un
// cambio di direzione faceva saltare la pagina in un altro punto. Lo stesso testo è ripetuto
// nelle @media dei fogli di stile (styles/global.css, Reveal, Hero, Miele, Footer,
// Territorio): la CSS non può importarlo, se cambia va cambiato anche lì.
export const NATIVE_SCROLL_QUERY = '(pointer: coarse), (hover: none), (max-width: 1024px)'

/**
 * Altezza dello schermo fissata all'apertura (--screen, in <head> prima del disegno). Su Firefox e
 * Chrome per iPhone la barra del browser che compare e sparisce a ogni cambio di direzione
 * ridimensiona la pagina, svh compreso: le sezioni alte uno schermo cambiavano altezza tutte
 * insieme e la pagina saltava. Si aggiorna solo se cambia la larghezza (rotazione del telefono).
 */
export const STABLE_SCREEN_SCRIPT = `(function(){if(!matchMedia(${JSON.stringify(NATIVE_SCROLL_QUERY)}).matches)return;var r=document.documentElement,w=0;function f(){if(innerWidth===w)return;w=innerWidth;r.style.setProperty('--screen',innerHeight+'px')}f();addEventListener('resize',f)})()`
