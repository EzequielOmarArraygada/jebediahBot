const { SlashCommandBuilder } = require('discord.js');

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
        const player = interaction.client.manager.players.get(guild.id);

        if (!player || !player.queue.current) {
            return interaction.reply({
                content: '❌ No hay música reproduciéndose actualmente!',
                ephemeral: true
            });
        }

        if (!interaction.member.voice.channel) {
            return interaction.reply({
                content: '❌ Debes estar en un canal de voz para usar este comando!',
                ephemeral: true
            });
        }

        player.setVolume(volume);

        return interaction.reply({
            content: `🔊 Volumen ajustado a **${volume}%**`
        });
    },
}; 