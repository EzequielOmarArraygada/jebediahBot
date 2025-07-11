const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource,
    AudioPlayerStatus,
    VoiceConnectionStatus,
    entersState
} = require('@discordjs/voice');
const { spawn } = require('child_process');

// Configurar opusscript para discord.js
const { getVoiceConnection } = require('@discordjs/voice');
const { OpusScript } = require('opusscript');

class MusicManager {
    constructor() {
        this.queues = new Map(); // Map<GuildId, Queue>
        this.connections = new Map(); // Map<GuildId, VoiceConnection>
        this.players = new Map(); // Map<GuildId, AudioPlayer>
        this.connectionMessages = new Map(); // Map<GuildId, Message> - Para guardar el mensaje de conexión
    }

    // Estructura de la cola
    createQueue() {
        return {
            songs: [],
            volume: 100,
            playing: false,
            loop: false
        };
    }

    // Obtener o crear cola para un servidor
    getQueue(guildId) {
        if (!this.queues.has(guildId)) {
            this.queues.set(guildId, this.createQueue());
        }
        return this.queues.get(guildId);
    }

    // Conectar al canal de voz
    async joinVoiceChannel(channel, existingConnection = null) {
        const guildId = channel.guild.id;
        
        // Si ya está conectado, desconectar primero
        if (this.connections.has(guildId)) {
            this.connections.get(guildId).destroy();
        }

        let connection;
        let player;

        if (existingConnection) {
            // Usar conexión existente (del VoiceManager)
            connection = existingConnection;
            player = createAudioPlayer();
            
            // Configurar eventos del reproductor
            player.on(AudioPlayerStatus.Idle, () => {
                this.playNext(guildId);
            });

            player.on(AudioPlayerStatus.Playing, () => {
                const queue = this.getQueue(guildId);
                queue.playing = true;
            });

            player.on('error', error => {
                console.error('Error en el reproductor de audio:', error);
                this.playNext(guildId);
            });

            connection.subscribe(player);
            
            console.log(`✅ Usando conexión existente para reproducción de música`);
        } else {
            // Crear nueva conexión
            connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
                selfDeaf: false,
                selfMute: false
            });

            player = createAudioPlayer();
            
            connection.on(VoiceConnectionStatus.Ready, () => {
                console.log(`✅ Conectado al canal de voz: ${channel.name}`);
            });

            connection.on(VoiceConnectionStatus.Disconnected, async () => {
                try {
                    await Promise.race([
                        entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                        entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                    ]);
                } catch (error) {
                    connection.destroy();
                    this.connections.delete(guildId);
                    this.players.delete(guildId);
                    console.log(`❌ Desconectado del canal de voz: ${channel.name}`);
                }
            });

            // Configurar eventos del reproductor
            player.on(AudioPlayerStatus.Idle, () => {
                this.playNext(guildId);
            });

            player.on(AudioPlayerStatus.Playing, () => {
                const queue = this.getQueue(guildId);
                queue.playing = true;
            });

            player.on('error', error => {
                console.error('Error en el reproductor de audio:', error);
                this.playNext(guildId);
            });

            connection.subscribe(player);
        }

        this.connections.set(guildId, connection);
        this.players.set(guildId, player);

        return connection;
    }

    // Agregar canción a la cola
    async addToQueue(guildId, song, requestedBy) {
        const queue = this.getQueue(guildId);
        song.requestedBy = requestedBy;
        queue.songs.push(song);

        // Si no está reproduciendo, empezar
        if (!queue.playing) {
            this.play(guildId);
        }

        return queue.songs.length;
    }

    // Reproducir música
    async play(guildId) {
        const queue = this.getQueue(guildId);
        const player = this.players.get(guildId);

        if (!player || queue.songs.length === 0) {
            queue.playing = false;
            return;
        }

        const song = queue.songs[0];
        
        try {
            console.log('🔗 URL para reproducir (yt-dlp):', song.url);
            // Lanzar yt-dlp como proceso externo para obtener el stream de audio
            const ytdlp = spawn('yt-dlp', [
                '-f', 'bestaudio[ext=webm][acodec=opus]/bestaudio',
                '-o', '-', // salida a stdout
                '--no-playlist',
                song.url
            ], { stdio: ['ignore', 'pipe', 'ignore'] });

            ytdlp.on('error', (err) => {
                console.error('Error al lanzar yt-dlp:', err);
                this.playNext(guildId);
            });

            const resource = createAudioResource(ytdlp.stdout, {
                inputType: 'webm/opus',
                inlineVolume: true
            });

            resource.volume.setVolume(queue.volume / 100);
            player.play(resource);
            queue.playing = true;

            player.once(AudioPlayerStatus.Idle, () => {
                ytdlp.kill('SIGKILL');
            });

        } catch (error) {
            console.error('Error al reproducir (yt-dlp):', error);
            this.playNext(guildId);
        }
    }

    // Reproducir siguiente canción
    playNext(guildId) {
        const queue = this.getQueue(guildId);
        
        if (queue.songs.length === 0) {
            queue.playing = false;
            return;
        }

        if (queue.loop) {
            // Mover la primera canción al final
            const song = queue.songs.shift();
            queue.songs.push(song);
        } else {
            // Remover la primera canción
            queue.songs.shift();
        }

        this.play(guildId);
    }

    // Pausar/Reanudar
    pause(guildId) {
        const player = this.players.get(guildId);
        const queue = this.getQueue(guildId);
        
        if (player && queue.playing) {
            player.pause();
            queue.playing = false;
            return true;
        }
        return false;
    }

    resume(guildId) {
        const player = this.players.get(guildId);
        const queue = this.getQueue(guildId);
        
        if (player && !queue.playing && queue.songs.length > 0) {
            player.unpause();
            queue.playing = true;
            return true;
        }
        return false;
    }

    // Saltar canción
    skip(guildId) {
        const player = this.players.get(guildId);
        if (player) {
            player.stop();
            return true;
        }
        return false;
    }

    // Detener reproducción
    stop(guildId) {
        const player = this.players.get(guildId);
        const queue = this.getQueue(guildId);
        
        if (player) {
            player.stop();
            queue.songs = [];
            queue.playing = false;
            return true;
        }
        return false;
    }

    // Cambiar volumen
    setVolume(guildId, volume) {
        const queue = this.getQueue(guildId);
        queue.volume = Math.max(0, Math.min(100, volume));
        return queue.volume;
    }

    // Obtener estado actual
    getStatus(guildId) {
        const queue = this.getQueue(guildId);
        const player = this.players.get(guildId);
        
        return {
            playing: queue.playing,
            currentSong: queue.songs[0] || null,
            queueLength: queue.songs.length,
            volume: queue.volume,
            loop: queue.loop
        };
    }

    // Verificar si ya hay una conexión activa
    hasConnection(guildId) {
        return this.connections.has(guildId);
    }

    // Limpiar recursos al desconectar
    cleanup(guildId) {
        this.queues.delete(guildId);
        this.connections.delete(guildId);
        this.players.delete(guildId);
    }

    // Guardar referencia del mensaje de conexión
    setConnectionMessage(guildId, message) {
        this.connectionMessages.set(guildId, message);
    }

    // Obtener y borrar el mensaje de conexión
    async deleteConnectionMessage(guildId) {
        const message = this.connectionMessages.get(guildId);
        if (message) {
            try {
                await message.delete();
                console.log(`🗑️ Mensaje de conexión borrado para guild: ${guildId}`);
            } catch (error) {
                console.error(`❌ Error borrando mensaje de conexión: ${error.message}`);
            }
            this.connectionMessages.delete(guildId);
        }
    }
}

module.exports = new MusicManager(); 