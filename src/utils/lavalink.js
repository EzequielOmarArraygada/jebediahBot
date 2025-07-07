const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function searchYouTubeLavalink(query) {
    const host = process.env.LAVALINK_HOST;
    const port = process.env.LAVALINK_PORT;
    const password = process.env.LAVALINK_PASSWORD;
    const url = `http://${host}:${port}/loadtracks?identifier=ytsearch:${encodeURIComponent(query)}`;

    console.log('[Lavalink][DEBUG] URL:', url);
    const res = await fetch(url, {
        headers: {
            'Authorization': password,
            'Accept': 'application/json',
        }
    });
    console.log('[Lavalink][DEBUG] Status:', res.status, res.statusText);
    console.log('[Lavalink][DEBUG] Headers:', JSON.stringify(Object.fromEntries(res.headers.entries()), null, 2));
    if (!res.ok) throw new Error('No se pudo buscar en Lavalink');
    const data = await res.json();
    console.log('[Lavalink][DEBUG] Respuesta búsqueda:', JSON.stringify(data, null, 2));
    return data.tracks && data.tracks.length > 0 ? data.tracks : [];
}

module.exports = { searchYouTubeLavalink }; 