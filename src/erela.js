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
      secure: false,
    },
  ],
  send(id, payload) {
    if (!client) return;
    const guild = client.guilds.cache.get(id);
    if (guild) guild.shard.send(payload);
  },
});

// Logs detallados para debugging
manager.on('nodeConnect', node => {
  console.log(`[Lavalink] Nodo conectado: ${node.options.host}:${node.options.port}`);
  console.log(`[DEBUG] Versión de erela.js: ${require('erela.js/package.json').version}`);
  
  // Log del WebSocket para debugging
  if (node.ws) {
    node.ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        console.log(`[DEBUG] Mensaje recibido de Lavalink:`, message);
      } catch (e) {
        console.log(`[DEBUG] Mensaje no-JSON recibido:`, data.toString());
      }
    });
  }
});

manager.on('nodeError', (node, error) => {
  console.error(`[Lavalink] Error en nodo: ${node.options.host}:${node.options.port}`, error);
  console.error(`[DEBUG] Stack trace completo:`, error.stack);
  
  // Log adicional para entender el contexto del error
  if (error.message && error.message.includes('Unexpected op')) {
    console.error(`[DEBUG] Error de protocolo detectado. Posible incompatibilidad de versiones.`);
    console.error(`[DEBUG] erela.js versión: ${require('erela.js/package.json').version}`);
    console.error(`[DEBUG] Lavalink versión esperada: v3.x`);
  }
});

manager.on('nodeDisconnect', node => {
  console.warn(`[Lavalink] Nodo desconectado: ${node.options.host}:${node.options.port}`);
  console.log(`[DEBUG] Razón de desconexión: ${node.disconnectReason || 'Desconocida'}`);
});

// Logs adicionales para eventos del manager
manager.on('playerCreate', player => {
  console.log(`[DEBUG] Player creado para guild: ${player.guild}`);
});

manager.on('playerDestroy', player => {
  console.log(`[DEBUG] Player destruido para guild: ${player.guild}`);
});

manager.on('trackStart', (player, track) => {
  console.log(`[DEBUG] Track iniciado: ${track.title} en guild: ${player.guild}`);
});

manager.on('trackEnd', (player, track) => {
  console.log(`[DEBUG] Track terminado: ${track.title} en guild: ${player.guild}`);
});

function setClient(discordClient) {
  client = discordClient;
}

module.exports = { manager, setClient }; 