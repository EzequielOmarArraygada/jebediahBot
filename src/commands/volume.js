const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const musicManager = require('../utils/musicManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Ajusta el volumen de la música')
        .addIntegerOption(option =>
            option.setName('nivel')
                .setDescription('Nivel de volumen (0-100)')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(100)),

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

        const newVolume = interaction.options.getInteger('nivel');
        const currentVolume = musicManager.setVolume(guildId, newVolume);

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🔊 Volumen ajustado')
            .setDescription(`**Volumen cambiado a: ${currentVolume}%**`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
}; 