const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Salta la canción actual'),

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

        const currentTrack = queue.getCurrentTrack();
        queue.skip();

        const embed = new EmbedBuilder()
            .setColor('#ff6b6b')
            .setTitle('⏭️ Canción saltada')
            .setDescription(`**${currentTrack.title}**`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
}; 