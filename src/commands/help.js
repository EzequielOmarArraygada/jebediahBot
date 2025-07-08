const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Muestra los comandos disponibles'),
    async execute(interaction) {
        const ayuda = `**Comandos disponibles:**\n\n` +
            `/play <canción o URL> — Reproduce una canción\n` +
            `/skip — Salta la canción actual\n` +
            `/stop — Detiene la música y sale del canal\n` +
            `/queue — Muestra la cola de canciones\n` +
            `/volume <0-100> — Ajusta el volumen\n` +
            `/help — Muestra este mensaje`;
        return interaction.reply(ayuda);
    }
}; 