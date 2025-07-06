const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const MusicQueue = require('../utils/MusicQueue');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Reproduce música desde YouTube')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('URL de YouTube o término de búsqueda')
                .setRequired(true)),

    async execute(interaction) {
        const query = interaction.options.getString('query');
        const member = interaction.member;
        const guild = interaction.guild;

        // Verificar si el usuario está en un canal de voz
        if (!member.voice.channel) {
            return interaction.reply({
                content: '❌ Debes estar en un canal de voz para usar este comando!',
                ephemeral: true
            });
        }

        await interaction.deferReply();

        try {
            // Obtener o crear la cola de música para este servidor
            let queue = interaction.client.musicQueues.get(guild.id);
            if (!queue) {
                queue = new MusicQueue(guild.id);
                interaction.client.musicQueues.set(guild.id, queue);
            }

            // Conectar al canal de voz si no está conectado
            if (!queue.connection) {
                queue.connection = joinVoiceChannel({
                    channelId: member.voice.channel.id,
                    guildId: guild.id,
                    adapterCreator: guild.voiceAdapterCreator,
                });
            }

            // Agregar la canción a la cola
            const track = await queue.addTrack(query, interaction.user);

            // Crear embed de respuesta
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🎵 Canción agregada a la cola')
                .setDescription(`**${track.title}**`)
                .setThumbnail(track.thumbnail)
                .addFields(
                    { name: 'Duración', value: formatDuration(track.duration), inline: true },
                    { name: 'Solicitado por', value: track.requestedBy.username, inline: true },
                    { name: 'Posición en cola', value: `#${queue.getQueueLength()}`, inline: true }
                )
                .setTimestamp();

            // Si no hay nada reproduciéndose, comenzar a reproducir
            if (!queue.isPlaying && queue.getCurrentTrack() === null) {
                await queue.playNext();
                embed.setTitle('🎵 Reproduciendo ahora');
                embed.setColor('#ff6b6b');
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error en comando play:', error);
            await interaction.editReply({
                content: `❌ Error al reproducir: ${error.message}`,
                ephemeral: true
            });
        }
    },
};

function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
} 