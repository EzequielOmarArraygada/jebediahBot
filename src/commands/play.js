const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const musicManager = require('../utils/musicManager');
const play = require('play-dl');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Reproduce música desde YouTube')
        .addStringOption(option =>
            option.setName('url_o_busqueda')
                .setDescription('URL de YouTube o término de búsqueda')
                .setRequired(true)),

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

        // Obtener la consulta (query)
        const query = isVoiceCommand ? voiceArgs[0] : interaction.options.getString('url_o_busqueda');
        const guildId = interaction.guildId || interaction.guild.id;

        if (!query || query.trim() === '') {
            const message = '❌ **Debes especificar una canción para reproducir.**';
            if (isVoiceCommand) {
                console.log(`🎤 ${message}`);
                return;
            } else {
                return interaction.editReply(message);
            }
        }

        try {
            let song;
            console.log(`🔍 Buscando: "${query}"`);

            if (play.yt_validate(query) === 'video') {
                // Si es URL directa, obtener info básica
                const info = await play.video_basic_info(query);
                song = {
                    title: info.video_details.title,
                    duration: parseInt(info.video_details.durationInSec),
                    url: query,
                    thumbnail: info.video_details.thumbnails?.[0]?.url,
                    requestedBy: isVoiceCommand ? { id: interaction.userId, toString: () => `<@${interaction.userId}>` } : interaction.user
                };
            } else {
                // Si es búsqueda por texto
                const searchResults = await play.search(query, { limit: 1 });
                if (searchResults.length === 0) {
                    const message = '❌ **No se encontraron resultados para tu búsqueda.**';
                    if (isVoiceCommand) {
                        console.log(`🎤 ${message}`);
                        return;
                    } else {
                        return interaction.editReply(message);
                    }
                }
                const firstVideo = searchResults[0];
                song = {
                    title: firstVideo.title,
                    duration: firstVideo.durationInSec || 0,
                    url: firstVideo.url,
                    thumbnail: firstVideo.thumbnails?.[0]?.url,
                    requestedBy: isVoiceCommand ? { id: interaction.userId, toString: () => `<@${interaction.userId}>` } : interaction.user
                };
            }

            // Conectar al canal de voz si no está conectado
            if (!musicManager.connections.has(guildId)) {
                await musicManager.joinVoiceChannel(voiceChannel);
            }

            // Agregar a la cola
            const position = await musicManager.addToQueue(guildId, song, song.requestedBy);

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🎵 Canción agregada a la cola')
                .setDescription(`**${song.title}**`)
                .addFields(
                    { name: '⏱️ Duración', value: formatDuration(song.duration), inline: true },
                    { name: '👤 Solicitado por', value: song.requestedBy.toString(), inline: true },
                    { name: '📋 Posición en cola', value: position.toString(), inline: true }
                )
                .setThumbnail(song.thumbnail)
                .setTimestamp();

            if (position === 1) {
                embed.setDescription(`🎵 **Reproduciendo ahora:** ${song.title}`);
            }

            const response = { embeds: [embed] };

            if (isVoiceCommand) {
                console.log(`🎤 Comando de voz ejecutado: Reproduciendo "${song.title}"`);
                // Para comandos de voz, podríamos enviar un mensaje al canal de texto
                // o usar una notificación de voz
            } else {
                await interaction.editReply(response);
            }

        } catch (error) {
            console.error('❌ Error en comando play:', error);
            console.error('🔍 Stack trace:', error.stack);
            const errorMessage = '❌ **Error al reproducir la música. Verifica que la URL sea válida o intenta con otra búsqueda.**';
            
            if (isVoiceCommand) {
                console.log(`🎤 ${errorMessage}`);
            } else {
                await interaction.editReply(errorMessage);
            }
        }
    },
};

function formatDuration(seconds) {
    if (!seconds || isNaN(seconds)) return 'Desconocido';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
} 