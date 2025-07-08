const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Reproduce una canción de YouTube')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Nombre o URL de la canción')
                .setRequired(true)),
    async execute(interaction, client) {
        const query = interaction.options.getString('query');
        const channel = interaction.member.voice.channel;
        if (!channel) {
            return interaction.reply('¡Debes estar en un canal de voz!');
        }
        const player = client.player;
        const guildQueue = player.nodes.get(interaction.guild.id);
        try {
            await interaction.deferReply();
            const res = await player.play(channel, query, {
                nodeOptions: {
                    metadata: interaction
                }
            });
            return interaction.followUp(`🎶 Reproduciendo: **${res.track.title}**`);
        } catch (e) {
            console.error(e);
            return interaction.followUp('No se pudo reproducir la canción.');
        }
    }
}; 