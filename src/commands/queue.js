const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const musicManager = require('../utils/musicManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Muestra la cola de reproducción actual'),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const status = musicManager.getStatus(guildId);

        if (status.queueLength === 0) {
            return interaction.reply('❌ **No hay canciones en la cola.**');
        }

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('📋 Cola de Reproducción')
            .setTimestamp();

        // Canción actual
        if (status.currentSong) {
            embed.addFields({
                name: '🎵 Reproduciendo ahora',
                value: `**${status.currentSong.title}**\n⏱️ ${formatDuration(status.currentSong.duration)} | 👤 ${status.currentSong.requestedBy?.username || 'Desconocido'}`
            });
        }

        // Próximas canciones (máximo 10)
        if (status.queueLength > 1) {
            const queue = musicManager.getQueue(guildId);
            const upcomingSongs = queue.songs.slice(1, 11); // Excluir la actual y limitar a 10
            
            let queueText = '';
            upcomingSongs.forEach((song, index) => {
                queueText += `${index + 1}. **${song.title}**\n⏱️ ${formatDuration(song.duration)} | 👤 ${song.requestedBy?.username || 'Desconocido'}\n\n`;
            });

            if (status.queueLength > 11) {
                queueText += `... y ${status.queueLength - 11} canciones más`;
            }

            embed.addFields({
                name: '📋 Próximas canciones',
                value: queueText
            });
        }

        // Información adicional
        embed.addFields(
            { name: '🔊 Volumen', value: `${status.volume}%`, inline: true },
            { name: '🔄 Loop', value: status.loop ? 'Activado' : 'Desactivado', inline: true },
            { name: '📊 Total de canciones', value: status.queueLength.toString(), inline: true }
        );

        await interaction.reply({ embeds: [embed] });
    },
};

function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
} 