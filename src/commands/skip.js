const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const musicManager = require('../utils/musicManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Salta a la siguiente canción'),

    async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return interaction.reply('❌ **Debes estar en un canal de voz para usar este comando.**');
        }

        const guildId = interaction.guild.id;
        const status = musicManager.getStatus(guildId);

        if (!status.currentSong) {
            return interaction.reply('❌ **No hay música reproduciéndose actualmente.**');
        }

        const skippedSong = status.currentSong;
        const success = musicManager.skip(guildId);

        if (success) {
            const embed = new EmbedBuilder()
                .setColor('#ff9900')
                .setTitle('⏭️ Canción saltada')
                .setDescription(`**${skippedSong.title}**`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } else {
            await interaction.reply('❌ **No se pudo saltar la canción.**');
        }
    },
}; 