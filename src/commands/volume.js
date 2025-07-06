const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Controla el volumen de la música')
        .addIntegerOption(option =>
            option.setName('level')
                .setDescription('Nivel de volumen (0-100)')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(100)),

    async execute(interaction) {
        const volume = interaction.options.getInteger('level');
        const guild = interaction.guild;
        const queue = interaction.client.musicQueues.get(guild.id);

        // Verificar si hay una cola de música
        if (!queue || !queue.getCurrentTrack()) {
            return interaction.reply({
                content: '❌ No hay música reproduciéndose actualmente!',
                ephemeral: true
            });
        }

        // Verificar si el usuario está en el mismo canal de voz
        if (!interaction.member.voice.channel) {
            return interaction.reply({
                content: '❌ Debes estar en un canal de voz para usar este comando!',
                ephemeral: true
            });
        }

        queue.setVolume(volume);

        const embed = new EmbedBuilder()
            .setColor('#f39c12')
            .setTitle('🔊 Volumen ajustado')
            .setDescription(`El volumen se ha establecido en **${volume}%**`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
}; 