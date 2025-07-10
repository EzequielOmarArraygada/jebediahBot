const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const musicManager = require('../utils/musicManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Detiene la reproducción y limpia la cola'),

    async execute(interaction, voiceManager, voiceArgs = null) {
        // Determinar si es un comando de voz o texto
        const isVoiceCommand = voiceArgs !== null;
        
        if (!isVoiceCommand) {
            await interaction.deferReply();
        }

        // Obtener el canal de voz del usuario
        let voiceChannel;
        if (isVoiceCommand) {
            // Para comandos de voz, necesitamos obtener el canal de voz del usuario
            const guild = interaction.client.guilds.cache.get(interaction.guildId);
            const member = await guild.members.fetch(interaction.userId);
            voiceChannel = member.voice.channel;
        } else {
            voiceChannel = interaction.member.voice.channel;
        }

        if (!voiceChannel) {
            const message = '❌ **Debes estar en un canal de voz para usar este comando.**';
            if (isVoiceCommand) {
                console.log(`🎤 ${message}`);
                return;
            } else {
                return interaction.reply(message);
            }
        }

        const guildId = interaction.guildId || interaction.guild.id;
        const status = musicManager.getStatus(guildId);

        if (!status.currentSong) {
            const message = '❌ **No hay música reproduciéndose actualmente.**';
            if (isVoiceCommand) {
                console.log(`🎤 ${message}`);
                return;
            } else {
                return interaction.reply(message);
            }
        }

        const success = musicManager.stop(guildId);

        if (success) {
            const message = '✅ **La música se ha detenido y la cola ha sido limpiada.**';
            if (isVoiceCommand) {
                console.log(`🎤 ${message}`);
            } else {
                const embed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('⏹️ Reproducción detenida')
                    .setDescription(message)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
            }
        } else {
            const errorMessage = '❌ **No se pudo detener la reproducción.**';
            if (isVoiceCommand) {
                console.log(`🎤 ${errorMessage}`);
            } else {
                await interaction.reply(errorMessage);
            }
        }
    },
}; 