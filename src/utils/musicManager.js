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
            console.log('🎵 Título de la canción:', song.title);
            console.log('⏱️ Duración:', song.duration, 'segundos');
            
            // Lanzar yt-dlp como proceso externo para obtener el stream de audio
            const ytdlpArgs = [
                '-f', '140/251/250/249',
                '-o', '-', // salida a stdout
                '--no-playlist',
                '--no-check-certificates',
                '--user-agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                '--extractor-args', 'youtube:player_client=web',
                '--no-cache-dir',
                '--verbose',
                song.url
            ];
            
            console.log('🚀 Comando yt-dlp:', 'yt-dlp', ytdlpArgs.join(' '));
            
            // Solo agregar cookies si el archivo existe y es válido
            try {
                const fs = require('fs');
                if (fs.existsSync('/app/cookies.txt')) {
                    ytdlpArgs.push('--cookies', '/app/cookies.txt');
                    console.log('🍪 Usando archivo de cookies');
                    
                    // Verificar contenido del archivo de cookies
                    const cookieContent = fs.readFileSync('/app/cookies.txt', 'utf8');
                    console.log('📄 Tamaño del archivo cookies.txt:', cookieContent.length, 'caracteres');
                    console.log('📄 Primeras líneas de cookies.txt:', cookieContent.split('\n').slice(0, 3).join('\n'));
                } else {
                    console.log('⚠️ Archivo de cookies no encontrado, continuando sin cookies');
                }
            } catch (error) {
                console.log('⚠️ Error al verificar cookies, continuando sin cookies:', error.message);
            }
            
            console.log('🔧 Argumentos finales de yt-dlp:', ytdlpArgs);
            
            const ytdlp = spawn('yt-dlp', ytdlpArgs, { stdio: ['ignore', 'pipe', 'pipe'] }); // stderr ahora es 'pipe'

            ytdlp.on('error', (err) => {
                console.error('❌ Error al lanzar yt-dlp:', err);
                console.error('❌ Detalles del error:', {
                    code: err.code,
                    signal: err.signal,
                    message: err.message,
                    stack: err.stack
                });
                this.playNext(guildId);
            });

            // Si yt-dlp falla con cookies, intentar sin cookies
            let retryWithoutCookies = false;
            let errorBuffer = '';
            let dataReceived = false;
            let startTime = Date.now();
            
            console.log('⏱️ Iniciando proceso yt-dlp a las:', new Date().toISOString());
            
            ytdlp.stderr.on('data', (chunk) => {
                const stderr = chunk.toString();
                errorBuffer += stderr;
                console.log('🔴 yt-dlp stderr:', stderr);
                
                // Si hay error de cookies, intentar sin cookies
                if (stderr.includes('invalid Netscape format cookies') || stderr.includes('failed to load cookies')) {
                    if (!retryWithoutCookies) {
                        retryWithoutCookies = true;
                        console.log('🔄 Error de cookies detectado, reintentando sin cookies...');
                        console.log('🔄 Buffer de errores acumulado:', errorBuffer);
                        ytdlp.kill('SIGKILL');
                        
                        // Intentar sin cookies
                        const ytdlpNoCookies = spawn('yt-dlp', [
                            '-f', '140/251/250/249',
                            '-o', '-',
                            '--no-playlist',
                            '--no-check-certificates',
                            '--user-agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                            '--extractor-args', 'youtube:player_client=web',
                            '--no-cache-dir',
                            '--verbose',
                            song.url
                        ], { stdio: ['ignore', 'pipe', 'pipe'] });
                        
                        console.log('🔄 Iniciando proceso sin cookies...');
                        this.handleYtdlpProcess(ytdlpNoCookies, guildId, queue, player, timeout);
                    }
                }
                
                // Si hay error de formato, intentar con formato más básico
                if (stderr.includes('Requested format is not available') || stderr.includes('No video formats found')) {
                    if (!retryWithoutCookies) {
                        retryWithoutCookies = true;
                        console.log('🔄 Error de formato detectado, reintentando con formato básico...');
                        console.log('🔄 Buffer de errores acumulado:', errorBuffer);
                        ytdlp.kill('SIGKILL');
                        
                        // Intentar con formato más básico
                        const ytdlpBasic = spawn('yt-dlp', [
                            '-f', 'worstaudio',
                            '-o', '-',
                            '--no-playlist',
                            '--no-check-certificates',
                            '--user-agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                            '--extractor-args', 'youtube:player_client=web',
                            '--no-cache-dir',
                            song.url
                        ], { stdio: ['ignore', 'pipe', 'pipe'] });
                        
                        console.log('🔄 Iniciando proceso con formato básico...');
                        this.handleYtdlpProcess(ytdlpBasic, guildId, queue, player, timeout);
                    }
                }
                
                // Si hay error de bot detection, intentar sin cookies y con diferentes opciones
                if (stderr.includes('Sign in to confirm you\'re not a bot')) {
                    if (!retryWithoutCookies) {
                        retryWithoutCookies = true;
                        console.log('🔄 Bot detection detectado, intentando método alternativo...');
                        console.log('🔄 Buffer de errores acumulado:', errorBuffer);
                        ytdlp.kill('SIGKILL');
                        
                        // Intentar con método alternativo sin cookies
                        const ytdlpAlternative = spawn('yt-dlp', [
                            '-f', 'bestaudio',
                            '-o', '-',
                            '--no-playlist',
                            '--no-check-certificates',
                            '--user-agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                            '--extractor-args', 'youtube:player_client=web',
                            '--no-cache-dir',
                            '--no-cookies',
                            song.url
                        ], { stdio: ['ignore', 'pipe', 'pipe'] });
                        
                        console.log('🔄 Iniciando proceso alternativo sin cookies...');
                        this.handleYtdlpProcess(ytdlpAlternative, guildId, queue, player, timeout);
                    }
                }
            });

            // Agregar timeout para evitar que se quede colgado
            const timeout = setTimeout(() => {
                console.log('⏰ TIMEOUT ALCANZADO - Matando proceso yt-dlp después de 30 segundos');
                console.log('⏰ Estado del proceso al timeout:', {
                    pid: ytdlp.pid,
                    killed: ytdlp.killed,
                    exitCode: ytdlp.exitCode
                });
                ytdlp.kill('SIGKILL');
                this.playNext(guildId);
            }, 30000); // 30 segundos

            this.handleYtdlpProcess(ytdlp, guildId, queue, player, timeout);

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
    handleYtdlpProcess(ytdlp, guildId, queue, player, timeout = null) {
        let dataReceived = false;
        let totalDataReceived = 0;
        let startTime = Date.now();
        
        console.log('🎯 Iniciando handleYtdlpProcess...');
        
        ytdlp.stdout.on('data', (chunk) => {
            if (!dataReceived) {
                dataReceived = true;
                console.log('🟢 ¡PRIMER DATO RECIBIDO! yt-dlp está enviando datos de audio');
                console.log('⏱️ Tiempo transcurrido desde inicio:', Date.now() - startTime, 'ms');
            }
            totalDataReceived += chunk.length;
            console.log('🟢 yt-dlp enviando datos de audio:', chunk.length, 'bytes (total:', totalDataReceived, 'bytes)');
        });
        
        ytdlp.stdout.on('end', () => {
            console.log('🔴 yt-dlp terminó de enviar datos (end)');
            console.log('📊 Resumen de datos recibidos:', {
                totalBytes: totalDataReceived,
                timeElapsed: Date.now() - startTime,
                dataReceived: dataReceived
            });
        });
        
        ytdlp.stderr.on('data', (chunk) => {
            const stderr = chunk.toString();
            console.log('🔴 yt-dlp stderr:', stderr);
            
            // Detectar patrones específicos en stderr
            if (stderr.includes('Downloading')) {
                console.log('📥 Detectado: Descarga en progreso');
            }
            if (stderr.includes('ERROR')) {
                console.log('❌ Detectado: Error en stderr');
            }
            if (stderr.includes('WARNING')) {
                console.log('⚠️ Detectado: Advertencia en stderr');
            }
        });
        
        ytdlp.on('close', (code) => {
            console.log('🔴 yt-dlp proceso cerrado con código:', code);
            console.log('📊 Estado final del proceso:', {
                exitCode: code,
                dataReceived: dataReceived,
                totalDataReceived: totalDataReceived,
                timeElapsed: Date.now() - startTime
            });
            
            if (timeout) {
                clearTimeout(timeout);
                console.log('⏰ Timeout limpiado');
            }
            
            if (code !== 0 && !dataReceived) {
                console.log('❌ Proceso terminó con error y sin datos recibidos');
            }
        });

        try {
            console.log('🎵 Creando AudioResource...');
            const resource = createAudioResource(ytdlp.stdout, {
                inputType: 'arbitrary',
                inlineVolume: true
            });

            console.log('🔊 Configurando volumen:', queue.volume / 100);
            resource.volume.setVolume(queue.volume / 100);
            
            console.log('▶️ Iniciando reproducción...');
            player.play(resource);
            queue.playing = true;
            console.log('✅ Reproducción iniciada correctamente');

            player.once(AudioPlayerStatus.Idle, () => {
                console.log('🛑 AudioPlayerStatus.Idle - Deteniendo yt-dlp');
                ytdlp.kill('SIGKILL');
            });
            
            player.on('error', (error) => {
                console.error('❌ Error en AudioPlayer:', error);
                ytdlp.kill('SIGKILL');
            });
            
        } catch (error) {
            console.error('❌ Error al crear AudioResource:', error);
            ytdlp.kill('SIGKILL');
        }
    }
}

module.exports = new MusicManager(); 