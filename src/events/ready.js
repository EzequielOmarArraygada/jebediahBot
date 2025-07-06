const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`✅ ${client.user.tag} está listo y conectado a Discord!`);
        console.log(`🎵 Bot de música activo en ${client.guilds.cache.size} servidores`);
        
        // Establecer estado del bot
        client.user.setActivity('🎵 /play para música', { type: 'LISTENING' });
    },
}; 