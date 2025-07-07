const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Reproduce música usando Lavalink')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Nombre o URL de la canción')
                .setRequired(true)),
    async execute(interaction) {
        try {
            const query = interaction.options.getString('query');
            const { guild, member } = interaction;

            if (!member.voice.channel) {
                return interaction.reply({ content: '❌ Debes estar en un canal de voz para usar este comando!', ephemeral: true });
            }

            await interaction.deferReply();

            // Verificar que Lavalink esté conectado
            if (!interaction.client.lavalink.connected) {
                return interaction.editReply({ content: '❌ El servidor de música no está disponible en este momento.', ephemeral: true });
            }

            // Obtener o crear player
            let player = interaction.client.lavalink.players.get(guild.id);
            if (!player) {
                player = interaction.client.lavalink.createPlayer(guild.id, member.voice.channel.id);
                if (!player) {
                    return interaction.editReply({ content: '❌ No se pudo crear el reproductor de música.', ephemeral: true });
                }
            }

            // Por ahora, solo confirmar que el comando funciona
            return interaction.editReply({ content: `🎶 Comando recibido: **${query}**\n\n⚠️ Funcionalidad de reproducción en desarrollo.` });
            
        } catch (error) {
            console.error('[ERROR] Error en comando play:', error);
            return interaction.editReply({ content: '❌ Ocurrió un error al procesar el comando.', ephemeral: true });
        }
    },
}; 