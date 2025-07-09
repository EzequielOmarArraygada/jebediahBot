const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Reproduce una canción de YouTube')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Nombre o URL de la canción de YouTube')
                .setRequired(true)),
    async execute(interaction, client) {
        console.log(`[PLAY] Comando ejecutado por ${interaction.user.tag} con query: "${interaction.options.getString('query')}"`);
        
        const query = interaction.options.getString('query');
        const channel = interaction.member.voice.channel;
        
        if (!channel) {
            console.log(`[PLAY] Usuario ${interaction.user.tag} no está en un canal de voz`);
            return interaction.reply('¡Debes estar en un canal de voz!');
        }
        
        console.log(`[PLAY] Usuario en canal: ${channel.name} (${channel.id})`);
        
        const player = client.player;
        const guildQueue = player.nodes.get(interaction.guild.id);
        
        console.log(`[PLAY] Guild queue existente: ${guildQueue ? 'Sí' : 'No'}`);
        
        try {
            console.log(`[PLAY] Iniciando deferReply...`);
            await interaction.deferReply();
            console.log(`[PLAY] deferReply completado`);
            
            console.log(`[PLAY] Intentando reproducir: "${query}" en canal ${channel.name}`);
            console.log(`[PLAY] Channel ID: ${channel.id}`);
            console.log(`[PLAY] Guild ID: ${interaction.guild.id}`);
            
            const res = await player.play(channel, query, {
                nodeOptions: {
                    metadata: interaction,
                    leaveOnEmpty: false,
                    leaveOnEnd: false,
                    leaveOnStop: false
                }
            });
            
            console.log(`[PLAY] Reproducción exitosa: ${res.track.title}`);
            console.log(`[PLAY] Track URL: ${res.track.url}`);
            console.log(`[PLAY] Duración: ${res.track.duration}`);
            console.log(`[PLAY] Queue creada: ${res.queue ? 'Sí' : 'No'}`);
            if (res.queue) {
                console.log(`[PLAY] Queue tracks: ${res.queue.tracks.size}`);
            }
            
            return interaction.followUp(`🎶 Reproduciendo: **${res.track.title}**`);
        } catch (e) {
            console.error(`[PLAY] Error durante la reproducción:`, e);
            console.error(`[PLAY] Error stack:`, e.stack);
            console.error(`[PLAY] Error code:`, e.code);
            console.error(`[PLAY] Error message:`, e.message);
            
            return interaction.followUp('No se pudo reproducir la canción.');
        }
    }
}; 