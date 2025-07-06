const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Muestra la cola de reproducción actual'),

    async execute(interaction) {
        const guild = interaction.guild;
        const queue = interaction.client.musicQueues.get(guild.id);

        if (!queue || (queue.isQueueEmpty() && !queue.getCurrentTrack())) {
            return interaction.reply({
                content: '❌ No hay música en la cola!',
                ephemeral: true
            });
        }

        const currentTrack = queue.getCurrentTrack();
        const queueList = queue.getQueue();
        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle('🎵 Cola de Reproducción')
            .setTimestamp();

        // Mostrar canción actual
        if (currentTrack) {
            embed.addFields({
                name: '🎵 Reproduciendo ahora:',
                value: `**${currentTrack.title}**\nDuración: ${formatDuration(currentTrack.duration)}\nSolicitado por: ${currentTrack.requestedBy.username}`,
                inline: false
            });
        }

        // Mostrar cola
        if (queueList.length > 0) {
            let queueText = '';
            queueList.slice(0, 10).forEach((track, index) => {
                queueText += `**${index + 1}.** ${track.title} - ${formatDuration(track.duration)}\n`;
            });

            if (queueList.length > 10) {
                queueText += `\n... y ${queueList.length - 10} canciones más`;
            }

            embed.addFields({
                name: '📋 Próximas canciones:',
                value: queueText,
                inline: false
            });
        }

        embed.setFooter({ text: `Total: ${queueList.length} canciones en cola` });

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