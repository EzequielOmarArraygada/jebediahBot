const { Shoukaku, Connectors } = require('shoukaku');
const { Kazagumo, Plugins } = require('kazagumo');
const { Client } = require('discord.js');

// El cliente de Discord debe ser pasado desde index.js
let client = null;

console.log('Configuración de Lavalink:', {
  host: process.env.LAVALINK_HOST,
  port: process.env.LAVALINK_PORT,
  password: process.env.LAVALINK_PASSWORD,
});

// Configuración de Shoukaku
const shoukaku = new Shoukaku(new Connectors.DiscordJS(client), [
  {
    name: 'lavalink',
    url: `${process.env.LAVALINK_HOST}:${process.env.LAVALINK_PORT}`,
    auth: process.env.LAVALINK_PASSWORD,
    secure: false
  }
]);

// Configuración de Kazagumo
const kazagumo = new Kazagumo({
  defaultSearchEngine: 'youtube',
  send: (guildId, payload) => {
    if (!client) return;
    const guild = client.guilds.cache.get(guildId);
    if (guild) guild.shard.send(payload);
  }
}, shoukaku);

// Logs básicos para debugging
shoukaku.on('ready', (name) => {
  console.log(`[Lavalink] Nodo ${name} conectado`);
});

shoukaku.on('error', (name, error) => {
  console.error(`[Lavalink] Error en nodo ${name}:`, error.message);
});

shoukaku.on('close', (name, code, reason) => {
  console.warn(`[Lavalink] Nodo ${name} desconectado: ${code} - ${reason}`);
});

function setClient(discordClient) {
  client = discordClient;
  // Actualizar el connector con el cliente
  shoukaku.connector.client = discordClient;
}

module.exports = { kazagumo, shoukaku, setClient }; 