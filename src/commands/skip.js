const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Salta a la siguiente canción'),
    async execute(interaction) {
        try {
            const { guild, member } = interaction;

            if (!member.voice.channel) {
                return interaction.reply({ content: '❌ Debes estar en un canal de voz para usar este comando!', ephemeral: true });
            }

            await interaction.deferReply();

            // Verificar que Lavalink esté conectado
            if (!interaction.client.lavalink.connected) {
                return interaction.editReply({ content: '❌ El servidor de música no está disponible en este momento.', ephemeral: true });
            }

            // Obtener player
            const player = interaction.client.lavalink.players.get(guild.id);
            if (!player || !player.playing) {
                return interaction.editReply({ content: '❌ No hay música reproduciéndose.', ephemeral: true });
            }

            // Por ahora, solo confirmar que el comando funciona
            return interaction.editReply({ content: '⏭️ Comando skip recibido.\n\n⚠️ Funcionalidad en desarrollo.' });
            
        } catch (error) {
            console.error('[ERROR] Error en comando skip:', error);
            return interaction.editReply({ content: '❌ Ocurrió un error al procesar el comando.', ephemeral: true });
        }
    },
}; 