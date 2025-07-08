const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Salta la canción actual'),
    async execute(interaction, client) {
        const player = client.player;
        const queue = player.nodes.get(interaction.guild.id);
        if (!queue || !queue.isPlaying()) {
            return interaction.reply('No hay música reproduciéndose.');
        }
        const currentTrack = queue.currentTrack;
        const success = queue.node.skip();
        if (success) {
            return interaction.reply(`⏭️ Saltando: **${currentTrack.title}**`);
        } else {
            return interaction.reply('No se pudo saltar la canción.');
        }
    }
}; 