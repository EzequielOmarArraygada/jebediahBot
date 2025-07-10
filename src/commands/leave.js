const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const musicManager = require('../utils/musicManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('El bot sale del canal de voz y desactiva los comandos de voz'),

    async execute(interaction, voiceManager, voiceArgs = null) {
        // Determinar si es un comando de voz o texto
        const isVoiceCommand = voiceArgs !== null;
        
        if (!isVoiceCommand) {
            await interaction.deferReply();
        }

        const guildId = interaction.guildId || interaction.guild.id;

        try {
            // Verificar si está conectado
            if (!voiceManager.isConnected(guildId)) {
                const message = '❌ **No estoy conectado a ningún canal de voz.**';
                if (isVoiceCommand) {
                    console.log(`🎤 ${message}`);
                    return;
                } else {
                    return interaction.editReply(message);
                }
            }

            // Borrar el mensaje de conexión si existe
            await musicManager.deleteConnectionMessage(guildId);

            // Salir del canal de voz
            await voiceManager.leaveVoiceChannel(guildId);

            const message = '✅ **He salido del canal de voz y desactivado los comandos de voz.**';
            
            if (isVoiceCommand) {
                console.log(`🎤 ${message}`);
            } else {
                const embed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('👋 Bot desconectado')
                    .setDescription(message)
                    .addFields(
                        { name: '🎤 Estado', value: 'Desconectado', inline: true },
                        { name: '🔇 Comandos de voz', value: 'Desactivados', inline: true }
                    )
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
            }

        } catch (error) {
            console.error('Error saliendo del canal de voz:', error);
            const errorMessage = '❌ **Error al salir del canal de voz.**';
            if (isVoiceCommand) {
                console.log(`🎤 ${errorMessage}`);
            } else {
                await interaction.editReply(errorMessage);
            }
        }
    },
}; 