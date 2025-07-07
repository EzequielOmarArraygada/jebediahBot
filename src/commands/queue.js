const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Muestra la cola de reproducción actual'),

    async execute(interaction) {
        const guild = interaction.guild;
        const player = interaction.client.manager.players.get(guild.id);

        if (!player || (!player.queue.current && player.queue.size === 0)) {
            return interaction.reply({
                content: '❌ No hay música en la cola!',
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle('🎵 Cola de Reproducción')
            .setTimestamp();

        // Mostrar canción actual
        if (player.queue.current) {
            embed.addFields({
                name: '🎵 Reproduciendo ahora:',
                value: `**${player.queue.current.title}**\nDuración: ${formatDuration(player.queue.current.duration / 1000)}\nSolicitado por: ${player.queue.current.requester?.username || 'Desconocido'}`,
                inline: false
            });
        }

        // Mostrar cola
        if (player.queue.size > 0) {
            let queueText = '';
            player.queue.slice(0, 10).forEach((track, index) => {
                queueText += `**${index + 1}.** ${track.title} - ${formatDuration(track.duration / 1000)}\n`;
            });

            if (player.queue.size > 10) {
                queueText += `\n... y ${player.queue.size - 10} canciones más`;
            }

            embed.addFields({
                name: '📋 Próximas canciones:',
                value: queueText,
                inline: false
            });
        }

        embed.setFooter({ text: `Total: ${player.queue.size} canciones en cola` });

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