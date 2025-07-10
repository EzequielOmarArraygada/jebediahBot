const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const musicManager = require('../utils/musicManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pausa la reproducción actual'),

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
                return interaction.editReply(message);
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
                return interaction.editReply(message);
            }
        }

        const success = musicManager.pause(guildId);

        if (success) {
            const embed = new EmbedBuilder()
                .setColor('#ffff00')
                .setTitle('⏸️ Reproducción pausada')
                .setDescription(`**${status.currentSong.title}**`)
                .setTimestamp();

            const response = { embeds: [embed] };

            if (isVoiceCommand) {
                console.log(`🎤 Comando de voz ejecutado: Reproducción pausada - "${status.currentSong.title}"`);
            } else {
                await interaction.editReply(response);
            }
        } else {
            const message = '❌ **No se pudo pausar la reproducción.**';
            if (isVoiceCommand) {
                console.log(`🎤 ${message}`);
            } else {
                await interaction.editReply(message);
            }
        }
    },
}; 