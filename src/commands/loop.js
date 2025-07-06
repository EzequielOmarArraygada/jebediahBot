const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Activa o desactiva la reproducción en bucle'),

    async execute(interaction) {
        const guild = interaction.guild;
        const queue = interaction.client.musicQueues.get(guild.id);

        // Verificar si hay una cola de música
        if (!queue || !queue.getCurrentTrack()) {
            return interaction.reply({
                content: '❌ No hay música reproduciéndose actualmente!',
                ephemeral: true
            });
        }

        // Verificar si el usuario está en el mismo canal de voz
        if (!interaction.member.voice.channel) {
            return interaction.reply({
                content: '❌ Debes estar en un canal de voz para usar este comando!',
                ephemeral: true
            });
        }

        const isLooping = queue.toggleLoop();

        const embed = new EmbedBuilder()
            .setColor(isLooping ? '#e74c3c' : '#2ecc71')
            .setTitle(isLooping ? '🔁 Loop activado' : '🔁 Loop desactivado')
            .setDescription(isLooping ? 
                'La canción actual se repetirá automáticamente.' : 
                'La reproducción en bucle ha sido desactivada.')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
}; 