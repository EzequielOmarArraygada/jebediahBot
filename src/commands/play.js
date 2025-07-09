const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const musicManager = require('../utils/musicManager');
const play = require('play-dl');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Reproduce música desde YouTube')
        .addStringOption(option =>
            option.setName('url_o_busqueda')
                .setDescription('URL de YouTube o término de búsqueda')
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply();

        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return interaction.editReply('❌ **Debes estar en un canal de voz para usar este comando.**');
        }

        const query = interaction.options.getString('url_o_busqueda');
        const guildId = interaction.guild.id;

        try {
            let song;
            console.log(`🔍 Buscando: "${query}"`);

            if (play.yt_validate(query) === 'video') {
                // Si es URL directa, obtener info básica
                const info = await play.video_basic_info(query);
                song = {
                    title: info.video_details.title,
                    duration: parseInt(info.video_details.durationInSec),
                    url: query,
                    thumbnail: info.video_details.thumbnails?.[0]?.url,
                    requestedBy: interaction.user
                };
            } else {
                // Si es búsqueda por texto
                const searchResults = await play.search(query, { limit: 1 });
                if (searchResults.length === 0) {
                    return interaction.editReply('❌ **No se encontraron resultados para tu búsqueda.**');
                }
                const firstVideo = searchResults[0];
                song = {
                    title: firstVideo.title,
                    duration: firstVideo.durationInSec || 0,
                    url: firstVideo.url,
                    thumbnail: firstVideo.thumbnails?.[0]?.url,
                    requestedBy: interaction.user
                };
            }

            // Conectar al canal de voz si no está conectado
            if (!musicManager.connections.has(guildId)) {
                await musicManager.joinVoiceChannel(voiceChannel);
            }

            // Agregar a la cola
            const position = await musicManager.addToQueue(guildId, song, interaction.user);

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🎵 Canción agregada a la cola')
                .setDescription(`**${song.title}**`)
                .addFields(
                    { name: '⏱️ Duración', value: formatDuration(song.duration), inline: true },
                    { name: '👤 Solicitado por', value: interaction.user.toString(), inline: true },
                    { name: '📋 Posición en cola', value: position.toString(), inline: true }
                )
                .setThumbnail(song.thumbnail)
                .setTimestamp();

            if (position === 1) {
                embed.setDescription(`🎵 **Reproduciendo ahora:** ${song.title}`);
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('❌ Error en comando play:', error);
            console.error('🔍 Stack trace:', error.stack);
            await interaction.editReply('❌ **Error al reproducir la música. Verifica que la URL sea válida o intenta con otra búsqueda.**');
        }
    },
};

function formatDuration(seconds) {
    if (!seconds || isNaN(seconds)) return 'Desconocido';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
} 