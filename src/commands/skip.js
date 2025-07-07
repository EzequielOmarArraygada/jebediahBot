const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Salta la canción actual'),

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

        const current = player.queue.current;
        player.stop();

        return interaction.reply({
            content: `⏭️ Canción saltada: **${current.title}**`
        });
    },
}; 