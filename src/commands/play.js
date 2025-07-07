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
        const query = interaction.options.getString('query');
        const { guild, member } = interaction;

        if (!member.voice.channel) {
            return interaction.reply({ content: '❌ Debes estar en un canal de voz para usar este comando!', ephemeral: true });
        }

        await interaction.deferReply();

        let player = interaction.client.manager.players.get(guild.id);
        if (!player) {
            player = interaction.client.manager.create({
                guild: guild.id,
                voiceChannel: member.voice.channel.id,
                textChannel: interaction.channel.id,
                selfDeafen: true,
            });
            player.connect();
        }

        const res = await player.search(query, interaction.user);
        if (res.loadType === 'NO_MATCHES' || !res.tracks.length) {
            return interaction.editReply({ content: '❌ No se encontraron resultados.', ephemeral: true });
        }

        player.queue.add(res.tracks[0]);
        if (!player.playing && !player.paused && !player.queue.size) player.play();

        return interaction.editReply({ content: `🎶 Añadido: **${res.tracks[0].title}**` });
    },
}; 