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
    async joinVoiceChannel(channel) {
        const guildId = channel.guild.id;
        
        // Si ya está conectado, desconectar primero
        if (this.connections.has(guildId)) {
            this.connections.get(guildId).destroy();
        }

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false
        });

        const player = createAudioPlayer();
        
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

        connection.subscribe(player);

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
            const ytdlpArgs = [
                '-f', 'bestaudio[ext=webm][acodec=opus]/bestaudio',
                '-o', '-', // salida a stdout
                '--no-playlist',
                song.url
            ];
            
            // Solo agregar cookies si el archivo existe y es válido
            try {
                const fs = require('fs');
                if (fs.existsSync('/app/cookies.txt')) {
                    ytdlpArgs.push('--cookies', '/app/cookies.txt');
                    console.log('🍪 Usando archivo de cookies');
                } else {
                    console.log('⚠️ Archivo de cookies no encontrado, continuando sin cookies');
                }
            } catch (error) {
                console.log('⚠️ Error al verificar cookies, continuando sin cookies:', error.message);
            }
            
            const ytdlp = spawn('yt-dlp', ytdlpArgs, { stdio: ['ignore', 'pipe', 'pipe'] }); // stderr ahora es 'pipe'

            ytdlp.on('error', (err) => {
                console.error('Error al lanzar yt-dlp:', err);
                this.playNext(guildId);
            });

            // Si yt-dlp falla con cookies, intentar sin cookies
            let retryWithoutCookies = false;
            ytdlp.stderr.on('data', (chunk) => {
                const stderr = chunk.toString();
                console.log('🔴 yt-dlp stderr:', stderr);
                
                // Si hay error de cookies, intentar sin cookies
                if (stderr.includes('invalid Netscape format cookies') || stderr.includes('failed to load cookies')) {
                    if (!retryWithoutCookies) {
                        retryWithoutCookies = true;
                        console.log('🔄 Reintentando sin cookies...');
                        ytdlp.kill('SIGKILL');
                        
                        // Intentar sin cookies
                        const ytdlpNoCookies = spawn('yt-dlp', [
                            '-f', 'bestaudio[ext=webm][acodec=opus]/bestaudio',
                            '-o', '-',
                            '--no-playlist',
                            song.url
                        ], { stdio: ['ignore', 'pipe', 'pipe'] });
                        
                        this.handleYtdlpProcess(ytdlpNoCookies, guildId, queue, player);
                    }
                }
            });

            this.handleYtdlpProcess(ytdlp, guildId, queue, player);

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

    // Limpiar recursos al desconectar
    cleanup(guildId) {
        this.queues.delete(guildId);
        this.connections.delete(guildId);
        this.players.delete(guildId);
    }

    // Método para manejar el proceso de yt-dlp
    handleYtdlpProcess(ytdlp, guildId, queue, player) {
        ytdlp.stdout.on('data', (chunk) => {
            console.log('🟢 yt-dlp está enviando datos de audio:', chunk.length);
        });
        
        ytdlp.stdout.on('end', () => {
            console.log('🔴 yt-dlp terminó de enviar datos (end)');
        });
        
        ytdlp.stderr.on('data', (chunk) => {
            console.log('🔴 yt-dlp stderr:', chunk.toString());
        });
        
        ytdlp.on('close', (code) => {
            console.log('🔴 yt-dlp proceso cerrado con código:', code);
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
    }
}

module.exports = new MusicManager(); 