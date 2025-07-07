const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Detiene la reproducción y limpia la cola'),

    async execute(interaction) {
        try {
            const { guild, member } = interaction;

            if (!member.voice.channel) {
                return interaction.reply({ content: '❌ Debes estar en un canal de voz para usar este comando!', flags: 64 });
            }

            await interaction.deferReply();

            // Validar lavalink y players
            if (!interaction.client.lavalink || !interaction.client.lavalink.connected || !interaction.client.lavalink.players) {
                return interaction.editReply({ content: '❌ El servidor de música no está disponible en este momento.', flags: 64 });
            }

            // Obtener player
            const player = interaction.client.lavalink.players.get(guild.id);
            if (!player) {
                return interaction.editReply({ content: '❌ No hay nada reproduciéndose.', flags: 64 });
            }

            // Destruir player
            interaction.client.lavalink.destroyPlayer(guild.id);

            return interaction.editReply({ content: '⏹️ Reproducción detenida y cola limpiada.', flags: 64 });
            
        } catch (error) {
            console.error('[ERROR] Error en comando stop:', error);
            return interaction.editReply({ content: '❌ Ocurrió un error al procesar el comando.', flags: 64 });
        }
    },
}; 