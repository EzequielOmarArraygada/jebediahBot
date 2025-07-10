const { createReadStream } = require('fs');
const { pipeline } = require('stream');
const { promisify } = require('util');
const speech = require('@google-cloud/speech');
const prism = require('prism-media');
const wav = require('wav');
const { EventEmitter } = require('events');

class VoiceHandler extends EventEmitter {
    constructor() {
        super();
        // Configurar Google Speech-to-Text con el archivo específico
        this.speechClient = new speech.SpeechClient({
            keyFilename: './jebediah-a549271db02b.json'
        });
        
        this.hotword = 'jebe';
        this.isListening = false;
        this.audioBuffers = new Map();
        this.speakingUsers = new Set();
        this.audioStreams = new Map(); // Para limpiar streams
        this.opusDecoders = new Map(); // Para limpiar decoders
    }

    // Inicializar el handler de voz para una conexión
    initializeVoiceHandler(voiceConnection, guildId) {
        console.log(`🎤 Inicializando handler de voz para guild: ${guildId}`);
        
        // Escuchar cuando alguien empieza a hablar
        voiceConnection.receiver.speaking.on('start', (userId) => {
            this.handleSpeakingStart(userId, voiceConnection, guildId);
        });

        // Escuchar cuando alguien deja de hablar
        voiceConnection.receiver.speaking.on('end', (userId) => {
            this.handleSpeakingEnd(userId, voiceConnection, guildId);
        });
    }

    // Manejar cuando alguien empieza a hablar
    async handleSpeakingStart(userId, voiceConnection, guildId) {
        if (this.speakingUsers.has(userId)) return;
        
        this.speakingUsers.add(userId);
        
        // Limpiar streams anteriores si existen
        this.cleanupUserStreams(userId);
        
        // Crear buffer para almacenar audio
        this.audioBuffers.set(userId, []);
        
        // Crear stream de audio
        const audioStream = voiceConnection.receiver.subscribe(userId, {
            end: {
                behavior: 'manual'
            }
        });

        // Aumentar el límite de listeners para evitar warnings
        audioStream.setMaxListeners(20);
        
        // Procesar el audio
        const opusDecoder = new prism.opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 });
        opusDecoder.setMaxListeners(20);
        
        // Guardar referencias para limpieza
        this.audioStreams.set(userId, audioStream);
        this.opusDecoders.set(userId, opusDecoder);
        
        audioStream.pipe(opusDecoder).on('data', (chunk) => {
            const buffer = this.audioBuffers.get(userId);
            if (buffer) {
                buffer.push(chunk);
            }
        });

        audioStream.on('end', () => {
            console.log(`🔚 Stream de audio terminado para usuario ${userId}`);
            this.processAudioBuffer(userId, guildId);
        });

        audioStream.on('error', (error) => {
            console.error(`❌ Error en stream de audio para usuario ${userId}:`, error);
        });
    }

    // Manejar cuando alguien deja de hablar
    handleSpeakingEnd(userId, voiceConnection, guildId) {
        this.speakingUsers.delete(userId);
        
        // Procesar el buffer inmediatamente cuando el usuario deja de hablar
        setTimeout(() => {
            this.processAudioBuffer(userId, guildId);
        }, 1000); // Aumentar delay para capturar más audio
        
        // Limpiar streams después de un breve delay
        setTimeout(() => {
            this.cleanupUserStreams(userId);
        }, 1000);
    }

    // Limpiar streams de un usuario específico
    cleanupUserStreams(userId) {
        const audioStream = this.audioStreams.get(userId);
        const opusDecoder = this.opusDecoders.get(userId);
        
        if (audioStream) {
            audioStream.destroy();
            this.audioStreams.delete(userId);
        }
        
        if (opusDecoder) {
            opusDecoder.destroy();
            this.opusDecoders.delete(userId);
        }
    }

    // Procesar el buffer de audio
    async processAudioBuffer(userId, guildId) {
        const audioBuffer = this.audioBuffers.get(userId);
        if (!audioBuffer || audioBuffer.length === 0) {
            this.audioBuffers.delete(userId);
            return;
        }

        try {
            // Convertir audio a formato compatible con Google Speech
            const audioData = Buffer.concat(audioBuffer);
            
            // Verificar que el audio tenga suficiente duración (mínimo 0.5 segundos)
            const minBytes = 48000 * 2 * 2 * 0.5; // 48kHz, 16-bit, stereo, 0.5 segundos
            if (audioData.length < minBytes) {
                return;
            }
            
            // Convertir stereo a mono para mejor reconocimiento
            const monoAudio = this.convertStereoToMono(audioData);
            const text = await this.convertSpeechToText(monoAudio);
            
            if (text) {
                await this.processVoiceCommand(text, userId, guildId);
            }
        } catch (error) {
            console.error('Error procesando audio:', error);
        } finally {
            this.audioBuffers.delete(userId);
        }
    }

    // Convertir speech a texto usando Google Speech-to-Text
    async convertSpeechToText(audioData) {
        try {
            const request = {
                audio: {
                    content: audioData.toString('base64')
                },
                config: {
                    encoding: 'LINEAR16',
                    sampleRateHertz: 48000,
                    languageCode: 'es-ES',
                    model: 'default',
                    useEnhanced: true,
                    enableAutomaticPunctuation: true,
                    enableWordTimeOffsets: false,
                    enableWordConfidence: true,
                    maxAlternatives: 3,
                    audioChannelCount: 1,
                    enableSeparateRecognitionPerChannel: false,
                    speechContexts: [{
                        phrases: [
                            'jebe', 'jebediah', 'jeb', 'jeve', 'reproduce', 'pausa', 'continúa', 'siguiente', 
                            'detén', 'frenate', 'frena', 'cola', 'volumen', 'play', 'pause', 'resume', 
                            'skip', 'stop', 'queue', 'volume', 'música', 'canción', 'track', 'enemy',
                            'nos vemos', 'adiós', 'chao', 'salir', 'leave'
                        ],
                        boost: 20.0
                    }]
                }
            };

            const [response] = await this.speechClient.recognize(request);
            
            if (!response.results || response.results.length === 0) {
                return null;
            }
            
            const transcription = response.results
                .map(result => result.alternatives[0].transcript)
                .join(' ');

            return transcription.toLowerCase().trim();
        } catch (error) {
            console.error('❌ Error en speech-to-text:', error);
            return null;
        }
    }

    // Procesar comando de voz
    async processVoiceCommand(text, userId, guildId) {
        // Verificar si contiene la palabra clave (más flexible)
        const hasHotword = text.includes(this.hotword) || 
                          text.includes('jebediah') || 
                          text.includes('jeb') ||
                          text.includes('jeve') ||
                          text.includes('jebe');
        
        if (!hasHotword) {
            // Verificar si hay un comando válido sin palabra clave (modo de prueba)
            const command = this.mapVoiceToTextCommand(text);
            if (command) {
                console.log(`🎤 Comando detectado: ${command.name} - "${text}"`);
                this.emit('voiceCommand', { command, userId, guildId });
            }
            return;
        }

        // Extraer el comando después de la palabra clave (más flexible)
        const commandText = text.replace(/jebe|jebediah|jeb|jeve/gi, '').trim();
        
        // Mapear comandos de voz a comandos de texto
        const command = this.mapVoiceToTextCommand(commandText);
        
        if (command) {
            console.log(`🎤 Comando de voz: ${command.name} - "${text}"`);
            // Emitir evento para que el bot principal ejecute el comando
            this.emit('voiceCommand', { command, userId, guildId });
        }
    }

    // Mapear comandos de voz a comandos de texto
    mapVoiceToTextCommand(voiceCommand) {
        const command = voiceCommand.toLowerCase();
        
        // Comandos de reproducción
        if (command.includes('reproduce') || command.includes('play')) {
            const query = command.replace(/reproduce|play/gi, '').trim();
            return { name: 'play', args: [query] };
        }
        
        // Comandos de control
        if (command.includes('pausa') || command.includes('pause')) {
            return { name: 'pause', args: [] };
        }
        
        if (command.includes('continúa') || command.includes('resume')) {
            return { name: 'resume', args: [] };
        }
        
        if (command.includes('siguiente') || command.includes('skip')) {
            return { name: 'skip', args: [] };
        }
        
        if (command.includes('detén') || command.includes('stop') || command.includes('frenate') || command.includes('frena')) {
            return { name: 'stop', args: [] };
        }
        
        // Comando para salir del canal de voz
        if (command.includes('nos vemos') || command.includes('adiós') || command.includes('chao') || command.includes('salir') || command.includes('leave')) {
            return { name: 'leave', args: [] };
        }
        
        // Comandos de información
        if (command.includes('cola') || command.includes('queue')) {
            return { name: 'queue', args: [] };
        }
        
        if (command.includes('volumen') || command.includes('volume')) {
            // Extraer número del comando
            const volumeMatch = command.match(/(\d+)/);
            const volume = volumeMatch ? parseInt(volumeMatch[1]) : 50;
            return { name: 'volume', args: [volume] };
        }
        
        return null;
    }

    // Convertir audio stereo a mono
    convertStereoToMono(stereoBuffer) {
        const monoBuffer = Buffer.alloc(stereoBuffer.length / 2);
        
        for (let i = 0; i < stereoBuffer.length; i += 4) {
            // Leer muestras de 16-bit de ambos canales
            const left = stereoBuffer.readInt16LE(i);
            const right = stereoBuffer.readInt16LE(i + 2);
            
            // Promedio de ambos canales
            const mono = Math.round((left + right) / 2);
            
            // Escribir muestra mono de 16-bit
            monoBuffer.writeInt16LE(mono, i / 2);
        }
        
        return monoBuffer;
    }
}

module.exports = VoiceHandler; 