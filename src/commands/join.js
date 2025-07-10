const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const musicManager = require('../utils/musicManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('El bot se une al canal de voz y activa los comandos de voz'),

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

        try {
            // Limpiar conexiones muertas antes de verificar
            voiceManager.cleanupDeadConnections(interaction.client);
            
            // Verificar si ya está conectado
            if (voiceManager.isConnected(guildId, interaction.client)) {
                const message = '✅ **Ya estoy conectado al canal de voz y escuchando comandos.**';
                console.log(`🎤 ${message}`);
                if (isVoiceCommand) {
                    return;
                } else {
                    return interaction.editReply(message);
                }
            }

            // Unirse al canal de voz
            await voiceManager.joinVoiceChannel(voiceChannel, guildId);

            const message = `✅ **Me he unido al canal:** ${voiceChannel.name}`;
            console.log(`🎤 ${message}`);

            if (isVoiceCommand) {
                // Para comandos de voz, enviar un embed simple
                const embed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('🎤 Bot conectado y escuchando')
                    .setDescription(message)
                    .addFields(
                        { name: '🔑 Palabra clave', value: '`jebe`', inline: true },
                        { name: '🎵 Comandos disponibles', value: 'Ver lista abajo', inline: true }
                    )
                    .setTimestamp();
                
                const sentMessage = await interaction.reply({ embeds: [embed] });
                // Guardar referencia del mensaje para poder borrarlo después
                if (sentMessage && sentMessage.message) {
                    musicManager.setConnectionMessage(guildId, sentMessage.message);
                }
            } else {
                // Para comandos de texto, enviar el embed completo
                const embed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('🎤 Bot conectado y escuchando')
                    .setDescription(message)
                    .addFields(
                        { name: '🔑 Palabra clave', value: '`jebe`', inline: true },
                        { name: '🎵 Comandos disponibles', value: 'Ver lista abajo', inline: true },
                        { name: '📝 Ejemplos', value: '`jebe reproduce enemy`\n`jebe pausa`\n`jebe siguiente`', inline: false }
                    )
                    .addFields(
                        { name: '🎵 Comandos de reproducción', value: '• `jebe reproduce [canción]`\n• `jebe play [canción]`', inline: true },
                        { name: '⏯️ Comandos de control', value: '• `jebe pausa` / `pause`\n• `jebe continúa` / `resume`\n• `jebe siguiente` / `skip`\n• `jebe detén` / `stop`', inline: true },
                        { name: '📋 Comandos de información', value: '• `jebe cola` / `queue`\n• `jebe volumen [número]` / `volume`', inline: true }
                    )
                    .setTimestamp();

                const sentMessage = await interaction.editReply({ embeds: [embed] });
                // Guardar referencia del mensaje para poder borrarlo después
                if (sentMessage) {
                    musicManager.setConnectionMessage(guildId, sentMessage);
                }
            }

        } catch (error) {
            console.error('Error uniéndose al canal de voz:', error);
            const errorMessage = '❌ **Error al unirse al canal de voz. Verifica que tengo permisos para conectarme.**';
            if (isVoiceCommand) {
                console.log(`🎤 ${errorMessage}`);
            } else {
                await interaction.editReply(errorMessage);
            }
        }
    },
}; 