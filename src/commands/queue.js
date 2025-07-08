const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Muestra la cola de canciones'),
    async execute(interaction, client) {
        const player = client.player;
        const queue = player.nodes.get(interaction.guild.id);
        if (!queue || !queue.isPlaying()) {
            return interaction.reply('No hay música reproduciéndose.');
        }
        const tracks = queue.tracks.toArray();
        const current = queue.currentTrack;
        let response = `🎶 **Reproduciendo ahora:** ${current.title}\n`;
        if (tracks.length === 0) {
            response += '\nNo hay más canciones en la cola.';
        } else {
            response += '\n**En cola:**\n';
            tracks.slice(0, 10).forEach((track, i) => {
                response += `${i + 1}. ${track.title}\n`;
            });
            if (tracks.length > 10) {
                response += `...y ${tracks.length - 10} más.`;
            }
        }
        return interaction.reply(response);
    }
}; 