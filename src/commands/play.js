const { SlashCommandBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Configuración Lavalink
const host = process.env.LAVALINK_HOST;
const port = process.env.LAVALINK_PORT;
const password = process.env.LAVALINK_PASSWORD;
const sessionId = 'jebediah-session'; // Puedes cambiarlo si quieres

async function searchYouTubeLavalink(query) {
    const url = `http://${host}:${port}/v4/loadtracks?identifier=ytsearch:${encodeURIComponent(query)}`;
    const res = await fetch(url, {
        headers: {
            'Authorization': password,
            'Accept': 'application/json',
        }
    });
    if (!res.ok) throw new Error('No se pudo buscar en Lavalink');
    const data = await res.json();
    return data.tracks && data.tracks.length > 0 ? data.tracks : [];
}

async function playTrackLavalink(guildId, track) {
    const url = `http://${host}:${port}/v4/sessions/${sessionId}/players/${guildId}/play`;
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': password,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            track: track.encoded
        })
    });
    if (!res.ok) throw new Error('No se pudo reproducir el track');
    return await res.json();
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Reproduce música usando Lavalink v4')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Nombre o URL de la canción')
                .setRequired(true)),
    async execute(interaction) {
        try {
            const query = interaction.options.getString('query');
            const { guild, member } = interaction;

            if (!member.voice.channel) {
                return interaction.reply({ content: '❌ Debes estar en un canal de voz para usar este comando!', flags: 64 });
            }

            await interaction.deferReply();

            // Buscar canción en YouTube usando Lavalink v4
            const tracks = await searchYouTubeLavalink(query);
            if (!tracks.length) {
                return interaction.editReply({ content: '❌ No se encontraron resultados en YouTube.', flags: 64 });
            }
            const track = tracks[0];

            // Reproducir el track usando la API REST de Lavalink v4
            await playTrackLavalink(guild.id, track);

            return interaction.editReply({ content: `🎶 Reproduciendo: **${track.info.title}**\n${track.info.uri}`, flags: 64 });
        } catch (error) {
            console.error('[ERROR] Error en comando play:', error);
            return interaction.editReply({ content: '❌ Ocurrió un error al procesar el comando.', flags: 64 });
        }
    }
}; 