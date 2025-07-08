const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Detiene la música y sale del canal de voz'),
    async execute(interaction, client) {
        const player = client.player;
        const queue = player.nodes.get(interaction.guild.id);
        if (!queue || !queue.isPlaying()) {
            return interaction.reply('No hay música reproduciéndose.');
        }
        queue.delete();
        return interaction.reply('⏹️ Música detenida y bot desconectado.');
    }
}; 