const { createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const play = require('play-dl');
const ytdl = require('ytdl-core');

class MusicQueue {
    constructor(guildId) {
        this.guildId = guildId;
        this.queue = [];
        this.currentTrack = null;
        this.player = createAudioPlayer();
        this.connection = null;
        this.volume = 50;
        this.loop = false;
        this.isPlaying = false;

        // Configurar eventos del reproductor
        this.player.on(AudioPlayerStatus.Idle, () => {
            this.playNext();
        });

        this.player.on(AudioPlayerStatus.Playing, () => {
            this.isPlaying = true;
        });

        this.player.on('error', error => {
            console.error('Error en el reproductor de audio:', error);
            this.playNext();
        });
    }

    async addTrack(query, requestedBy) {
        try {
            let track;
            let video;
            let url;
            let thumbnail;
            let duration;

            // Verificar si es una URL de YouTube
            if (play.yt_validate(query) === 'video') {
                video = await play.video_info(query);
                url = video.video_details.url || video.video_details.link || query;
                thumbnail = video.video_details.thumbnails?.[0]?.url || '';
                duration = video.video_details.durationInSec || 0;
                if (!url) throw new Error('No se pudo obtener la URL del video.');
                track = {
                    title: video.video_details.title,
                    url,
                    duration,
                    thumbnail,
                    requestedBy: requestedBy
                };
            } else {
                // Buscar en YouTube
                const searchResults = await play.search(query, { limit: 1 });
                if (!searchResults.length) {
                    throw new Error('No se encontraron resultados para la búsqueda');
                }
                video = searchResults[0];
                url = video.url || video.link;
                thumbnail = video.thumbnails?.[0]?.url || '';
                duration = video.durationInSec || 0;
                if (!url) throw new Error('No se pudo obtener la URL del video.');
                track = {
                    title: video.title,
                    url,
                    duration,
                    thumbnail,
                    requestedBy: requestedBy
                };
            }

            this.queue.push(track);
            return track;
        } catch (error) {
            console.error('Error al agregar track:', error);
            throw error;
        }
    }

    async playNext() {
        if (this.queue.length === 0) {
            this.currentTrack = null;
            this.isPlaying = false;
            return;
        }

        if (this.loop && this.currentTrack) {
            // Si está en loop, volver a agregar la canción actual
            this.queue.push(this.currentTrack);
        }

        this.currentTrack = this.queue.shift();

        try {
            // Log para depuración
            console.log('Intentando reproducir track:', this.currentTrack);
            if (!this.currentTrack.url) {
                throw new Error('No se pudo obtener la URL del video para reproducir.');
            }
            let resource;
            try {
                // Intentar con play-dl
                const stream = await play.stream(this.currentTrack.url);
                if (!stream || !stream.stream) {
                    throw new Error('No se pudo obtener el stream de audio con play-dl.');
                }
                resource = createAudioResource(stream.stream, {
                    inputType: stream.type,
                    inlineVolume: true
                });
            } catch (err) {
                console.warn('Fallo play-dl, intentando con ytdl-core:', err);
                // Intentar con ytdl-core
                const ytdlStream = ytdl(this.currentTrack.url, {
                    filter: 'audioonly',
                    quality: 'highestaudio',
                    highWaterMark: 1 << 25
                });
                resource = createAudioResource(ytdlStream, {
                    inlineVolume: true
                });
            }

            resource.volume.setVolume(this.volume / 100);
            this.player.play(resource);

            if (this.connection) {
                this.connection.subscribe(this.player);
            }
        } catch (error) {
            console.error('Error al reproducir:', error);
            // Avisar en consola y saltar a la siguiente canción
            this.playNext();
        }
    }

    skip() {
        this.player.stop();
    }

    stop() {
        this.queue = [];
        this.currentTrack = null;
        this.player.stop();
        this.isPlaying = false;
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(100, volume));
        if (this.player.state.status === AudioPlayerStatus.Playing) {
            this.player.state.resource.volume.setVolume(this.volume / 100);
        }
    }

    toggleLoop() {
        this.loop = !this.loop;
        return this.loop;
    }

    getQueue() {
        return this.queue;
    }

    getCurrentTrack() {
        return this.currentTrack;
    }

    getQueueLength() {
        return this.queue.length;
    }

    isQueueEmpty() {
        return this.queue.length === 0;
    }
}

module.exports = MusicQueue; 