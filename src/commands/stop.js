const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const musicManager = require('../utils/musicManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Detiene la reproducción y limpia la cola'),

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

        const success = musicManager.stop(guildId);

        if (success) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('⏹️ Reproducción detenida')
                .setDescription('**La música se ha detenido y la cola ha sido limpiada.**')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } else {
            await interaction.reply('❌ **No se pudo detener la reproducción.**');
        }
    },
}; 