const WebSocket = require('ws');
const { Client } = require('discord.js');

// El cliente de Discord debe ser pasado desde index.js
let client = null;

console.log('Configuración de Lavalink:', {
  host: process.env.LAVALINK_HOST,
  port: process.env.LAVALINK_PORT,
  password: process.env.LAVALINK_PASSWORD,
});

// Implementación simple de Lavalink
class SimpleLavalink {
  constructor() {
    this.ws = null;
    this.connected = false;
    this.players = new Map();
  }

  connect() {
    const url = `ws://${process.env.LAVALINK_HOST}:${process.env.LAVALINK_PORT}`;
    console.log(`[Lavalink] Conectando a: ${url}`);
    
    this.ws = new WebSocket(url, {
      headers: {
        'Authorization': process.env.LAVALINK_PASSWORD,
        'User-Agent': 'JebediahBot/1.0.0'
      }
    });

    this.ws.on('open', () => {
      console.log('[Lavalink] Conexión establecida');
      this.connected = true;
    });

    this.ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        console.log('[Lavalink] Mensaje recibido:', message);
        this.handleMessage(message);
      } catch (error) {
        console.error('[Lavalink] Error parseando mensaje:', error);
      }
    });

    this.ws.on('error', (error) => {
      console.error('[Lavalink] Error de WebSocket:', error.message);
    });

    this.ws.on('close', (code, reason) => {
      console.warn(`[Lavalink] Conexión cerrada: ${code} - ${reason}`);
      this.connected = false;
    });
  }

  handleMessage(message) {
    switch (message.op) {
      case 'ready':
        console.log('[Lavalink] Servidor listo');
        break;
      case 'playerUpdate':
        console.log('[Lavalink] Player actualizado:', message.guildId);
        break;
      case 'stats':
        console.log('[Lavalink] Stats recibidos');
        break;
      default:
        console.log('[Lavalink] Mensaje no manejado:', message.op);
    }
  }

  send(op, data) {
    if (!this.connected || !this.ws) {
      console.error('[Lavalink] No conectado, no se puede enviar mensaje');
      return;
    }

    const payload = {
      op,
      ...data
    };

    console.log('[Lavalink] Enviando:', payload);
    this.ws.send(JSON.stringify(payload));
  }

  createPlayer(guildId, channelId) {
    if (!this.connected) {
      console.error('[Lavalink] No conectado, no se puede crear player');
      return null;
    }

    this.send('configureResuming', {
      key: guildId,
      timeout: 60
    });

    const player = {
      guildId,
      channelId,
      playing: false,
      queue: []
    };

    this.players.set(guildId, player);
    console.log(`[Lavalink] Player creado para guild: ${guildId}`);
    return player;
  }

  destroyPlayer(guildId) {
    this.players.delete(guildId);
    console.log(`[Lavalink] Player destruido para guild: ${guildId}`);
  }
}

const lavalink = new SimpleLavalink();

function setClient(discordClient) {
  client = discordClient;
  // Conectar a Lavalink cuando el bot esté listo
  client.once('ready', () => {
    lavalink.connect();
  });
}

module.exports = { lavalink, setClient }; 