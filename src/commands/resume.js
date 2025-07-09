const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const musicManager = require('../utils/musicManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Reanuda la reproducción pausada'),

    async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return interaction.reply('❌ **Debes estar en un canal de voz para usar este comando.**');
        }

        const guildId = interaction.guild.id;
        const status = musicManager.getStatus(guildId);

        if (!status.currentSong) {
            return interaction.reply('❌ **No hay música en la cola para reanudar.**');
        }

        const success = musicManager.resume(guildId);

        if (success) {
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('▶️ Reproducción reanudada')
                .setDescription(`**${status.currentSong.title}**`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } else {
            await interaction.reply('❌ **No se pudo reanudar la reproducción.**');
        }
    },
}; 