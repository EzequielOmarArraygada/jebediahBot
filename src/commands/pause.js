const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const musicManager = require('../utils/musicManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pausa la reproducción actual'),

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

        const success = musicManager.pause(guildId);

        if (success) {
            const embed = new EmbedBuilder()
                .setColor('#ffff00')
                .setTitle('⏸️ Reproducción pausada')
                .setDescription(`**${status.currentSong.title}**`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } else {
            await interaction.reply('❌ **No se pudo pausar la reproducción.**');
        }
    },
}; 