const { Manager } = require('erela.js');
const { Client } = require('discord.js');

// El cliente de Discord debe ser pasado desde index.js
let client = null;

console.log('Configuración de Lavalink:', {
  host: process.env.LAVALINK_HOST,
  port: process.env.LAVALINK_PORT,
  password: process.env.LAVALINK_PASSWORD,
});

const manager = new Manager({
  nodes: [
    {
      host: process.env.LAVALINK_HOST,
      port: Number(process.env.LAVALINK_PORT),
      password: process.env.LAVALINK_PASSWORD,
      secure: false, // Railway no usa SSL por defecto
      retryAmount: 3,
      retryDelay: 5000,
    },
  ],
  send(id, payload) {
    if (!client) return;
    const guild = client.guilds.cache.get(id);
    if (guild) guild.shard.send(payload);
  },
  // Configuración específica para Lavalink v3
  defaultSearchPlatform: "ytsearch",
  autoPlay: true,
});

manager.on('nodeConnect', node => console.log(`[Lavalink] Nodo conectado: ${node.options.host}:${node.options.port}`));
manager.on('nodeError', (node, error) => console.error(`[Lavalink] Error en nodo: ${node.options.host}:${node.options.port}`, error));
manager.on('nodeDisconnect', node => console.warn(`[Lavalink] Nodo desconectado: ${node.options.host}:${node.options.port}`));

function setClient(discordClient) {
  client = discordClient;
}

module.exports = { manager, setClient }; 