const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Ajusta el volumen de la música')
        .addIntegerOption(option =>
            option.setName('valor')
                .setDescription('Volumen (0-100)')
                .setRequired(true)),
    async execute(interaction, client) {
        const valor = interaction.options.getInteger('valor');
        if (valor < 0 || valor > 100) {
            return interaction.reply('El volumen debe estar entre 0 y 100.');
        }
        const player = client.player;
        const queue = player.nodes.get(interaction.guild.id);
        if (!queue || !queue.isPlaying()) {
            return interaction.reply('No hay música reproduciéndose.');
        }
        queue.node.setVolume(valor);
        return interaction.reply(`🔊 Volumen ajustado a ${valor}%`);
    }
}; 