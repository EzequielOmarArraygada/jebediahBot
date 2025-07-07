const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Activa o desactiva la reproducción en bucle'),

    async execute(interaction) {
        const guild = interaction.guild;
        const player = interaction.client.manager.players.get(guild.id);

        if (!player || !player.queue.current) {
            return interaction.reply({
                content: '❌ No hay música reproduciéndose actualmente!',
                ephemeral: true
            });
        }

        if (!interaction.member.voice.channel) {
            return interaction.reply({
                content: '❌ Debes estar en un canal de voz para usar este comando!',
                ephemeral: true
            });
        }

        // Alternar el modo de repetición de la canción actual
        player.setTrackRepeat(!player.trackRepeat);
        const isLooping = player.trackRepeat;

        return interaction.reply({
            content: isLooping ? '🔁 Loop activado: la canción actual se repetirá.' : '🔁 Loop desactivado: reproducción normal.'
        });
    },
}; 