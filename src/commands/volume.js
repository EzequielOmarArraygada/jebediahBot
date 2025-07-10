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

        // Obtener el volumen (de comandos de voz o de texto)
        let newVolume;
        if (isVoiceCommand) {
            newVolume = voiceArgs[0]; // El primer argumento es el volumen
        } else {
            newVolume = interaction.options.getInteger('nivel');
        }

        const currentVolume = musicManager.setVolume(guildId, newVolume);
        const message = `✅ **Volumen cambiado a: ${currentVolume}%**`;

        if (isVoiceCommand) {
            console.log(`🎤 ${message}`);
        } else {
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🔊 Volumen ajustado')
                .setDescription(message)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    },
}; 