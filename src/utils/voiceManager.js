const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource,
    AudioPlayerStatus,
    VoiceConnectionStatus,
    entersState
} = require('@discordjs/voice');
const { EventEmitter } = require('events');
const VoiceHandler = require('./voiceHandler');

class VoiceManager extends EventEmitter {
    constructor() {
        super();
        this.connections = new Map(); // guildId -> connection
        this.players = new Map(); // guildId -> player
        this.voiceHandler = new VoiceHandler();
        
        // Escuchar comandos de voz del VoiceHandler
        this.voiceHandler.on('voiceCommand', (data) => {
            this.handleVoiceCommand(data);
        });
    }

    // Unirse a un canal de voz
    async joinVoiceChannel(channel, guildId) {
        try {
            console.log(`🎵 Uniéndose al canal de voz: ${channel.name} en guild: ${guildId}`);
            
            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
                selfDeaf: false, // Importante: debe estar en false para escuchar
                selfMute: false
            });

            const player = createAudioPlayer();
            
            // Configurar el player
            player.on(AudioPlayerStatus.Idle, () => {
                console.log('🎵 Player está idle');
            });

            player.on(AudioPlayerStatus.Playing, () => {
                console.log('🎵 Reproduciendo música');
            });

            player.on('error', error => {
                console.error('Error en el player:', error);
            });

            // Conectar el player a la conexión
            connection.subscribe(player);

            // Esperar a que la conexión esté lista
            await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
            
            // Inicializar el handler de voz
            this.voiceHandler.initializeVoiceHandler(connection, guildId);
            
            // Guardar la conexión y player
            this.connections.set(guildId, connection);
            this.players.set(guildId, player);
            
            console.log(`✅ Conectado exitosamente al canal de voz`);
            
            return { connection, player };
        } catch (error) {
            console.error('Error uniéndose al canal de voz:', error);
            throw error;
        }
    }

    // Salir del canal de voz
    async leaveVoiceChannel(guildId) {
        const connection = this.connections.get(guildId);
        const player = this.players.get(guildId);
        
        if (connection) {
            connection.destroy();
            this.connections.delete(guildId);
        }
        
        if (player) {
            player.stop();
            this.players.delete(guildId);
        }
        
        console.log(`👋 Desconectado del canal de voz en guild: ${guildId}`);
    }

    // Obtener conexión de voz
    getConnection(guildId) {
        return this.connections.get(guildId);
    }

    // Obtener player
    getPlayer(guildId) {
        return this.players.get(guildId);
    }

    // Obtener conexión
    getConnection(guildId) {
        return this.connections.get(guildId);
    }

    // Verificar si está conectado
    isConnected(guildId, client = null) {
        const connection = this.connections.get(guildId);
        if (!connection) {
            return false;
        }
        
        // Verificar que la conexión esté realmente activa
        try {
            const isConnectionReady = connection.state.status === VoiceConnectionStatus.Ready;
            
            // Si tenemos acceso al client, verificar también el estado en Discord
            if (client && isConnectionReady) {
                const guild = client.guilds.cache.get(guildId);
                if (guild) {
                    const botMember = guild.members.cache.get(client.user.id);
                    if (botMember && botMember.voice.channel) {
                        // El bot está realmente en un canal de voz
                        return true;
                    } else {
                        // El bot no está en ningún canal de voz en Discord
                        console.log(`🔍 Bot no está en canal de voz en Discord para guild: ${guildId}`);
                        this.connections.delete(guildId);
                        this.players.delete(guildId);
                        return false;
                    }
                }
            }
            
            return isConnectionReady;
        } catch (error) {
            // Si hay error, la conexión no está activa
            console.log(`🔍 Error verificando conexión para guild: ${guildId}`, error.message);
            this.connections.delete(guildId);
            this.players.delete(guildId);
            return false;
        }
    }

    // Manejar comandos de voz
    async handleVoiceCommand(data) {
        const { command, userId, guildId } = data;
        
        console.log(`🎤 Ejecutando comando de voz: ${command.name} por usuario ${userId}`);
        
        // Emitir evento para que el bot principal ejecute el comando
        this.emit('executeVoiceCommand', {
            commandName: command.name,
            args: command.args,
            userId: userId,
            guildId: guildId
        });
    }

    // Reproducir audio
    async playAudio(guildId, audioResource) {
        const player = this.players.get(guildId);
        if (!player) {
            throw new Error('No hay player activo en este guild');
        }
        
        player.play(audioResource);
    }

    // Pausar reproducción
    pauseAudio(guildId) {
        const player = this.players.get(guildId);
        if (player) {
            player.pause();
        }
    }

    // Continuar reproducción
    resumeAudio(guildId) {
        const player = this.players.get(guildId);
        if (player) {
            player.unpause();
        }
    }

    // Detener reproducción
    stopAudio(guildId) {
        const player = this.players.get(guildId);
        if (player) {
            player.stop();
        }
    }

    // Configurar volumen
    setVolume(guildId, volume) {
        const player = this.players.get(guildId);
        if (player) {
            // El volumen se maneja en el AudioResource
            console.log(`🔊 Volumen configurado a ${volume}% en guild: ${guildId}`);
        }
    }

    // Limpiar conexiones muertas
    cleanupDeadConnections(client = null) {
        for (const [guildId, connection] of this.connections.entries()) {
            try {
                if (connection.state.status !== VoiceConnectionStatus.Ready) {
                    console.log(`🧹 Limpiando conexión muerta para guild: ${guildId}`);
                    this.connections.delete(guildId);
                    this.players.delete(guildId);
                    continue;
                }
                
                // Si tenemos client, verificar también el estado en Discord
                if (client) {
                    const guild = client.guilds.cache.get(guildId);
                    if (guild) {
                        const botMember = guild.members.cache.get(client.user.id);
                        if (!botMember || !botMember.voice.channel) {
                            console.log(`🧹 Bot no está en canal de voz en Discord para guild: ${guildId}`);
                            this.connections.delete(guildId);
                            this.players.delete(guildId);
                        }
                    }
                }
            } catch (error) {
                console.log(`🧹 Limpiando conexión corrupta para guild: ${guildId}`);
                this.connections.delete(guildId);
                this.players.delete(guildId);
            }
        }
    }
}

module.exports = VoiceManager; 