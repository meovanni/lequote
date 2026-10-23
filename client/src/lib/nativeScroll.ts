// Telefoni, tablet e schermi stretti: niente snap, niente animazioni legate allo scroll, niente
// sezioni pinnate. Su WebKit (Safari e Firefox su iPhone) lo scroll inerziale veloce con un
// cambio di direzione faceva saltare la pagina in un altro punto. Lo stesso testo è ripetuto
// nelle @media dei fogli di stile (styles/global.css, Reveal, Hero, Miele, Footer,
// Territorio): la CSS non può importarlo, se cambia va cambiato anche lì.
export const NATIVE_SCROLL_QUERY = '(pointer: coarse), (hover: none), (max-width: 1024px)'
