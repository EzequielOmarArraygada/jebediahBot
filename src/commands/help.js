const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Muestra información sobre los comandos disponibles'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#9b59b6')
            .setTitle('🎵 Jebediah Bot - Comandos de Música')
            .setDescription('Aquí tienes todos los comandos disponibles para controlar la música:')
            .addFields(
                {
                    name: '🎵 /play',
                    value: 'Reproduce música desde YouTube\nUso: `/play query: [URL o término de búsqueda]`',
                    inline: false
                },
                {
                    name: '⏭️ /skip',
                    value: 'Salta la canción actual',
                    inline: false
                },
                {
                    name: '⏹️ /stop',
                    value: 'Detiene la reproducción y limpia la cola',
                    inline: false
                },
                {
                    name: '📋 /queue',
                    value: 'Muestra la cola de reproducción actual',
                    inline: false
                },
                {
                    name: '🔊 /volume',
                    value: 'Controla el volumen de la música\nUso: `/volume level: [0-100]`',
                    inline: false
                },
                {
                    name: '🔁 /loop',
                    value: 'Activa o desactiva la reproducción en bucle',
                    inline: false
                },
                {
                    name: '❓ /help',
                    value: 'Muestra esta información de ayuda',
                    inline: false
                }
            )
            .addFields({
                name: '💡 Consejos',
                value: '• Puedes usar URLs de YouTube o buscar por nombre\n• Debes estar en un canal de voz para usar los comandos\n• El bot soporta colas de hasta 50 canciones\n• El volumen por defecto es 50%',
                inline: false
            })
            .setFooter({ text: 'Jebediah Bot - Tu DJ personal de Discord' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
}; 