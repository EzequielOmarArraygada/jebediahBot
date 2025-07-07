require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');
const { manager, setClient } = require('./erela');
const http = require('http');

// Log de versiones para debugging
console.log('[DEBUG] Versiones de dependencias:');
console.log(`[DEBUG] erela.js: ${require('erela.js/package.json').version}`);
console.log(`[DEBUG] discord.js: ${require('discord.js/package.json').version}`);
console.log(`[DEBUG] Node.js: ${process.version}`);

// Configuración del cliente
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});


// Colecciones para comandos y colas de música
client.commands = new Collection();
client.musicQueues = new Map();

// Cargar comandos
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    }
}

// Cargar eventos
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// Manejo de errores
process.on('unhandledRejection', error => {
    console.error('Error no manejado:', error);
});

process.on('uncaughtException', error => {
    console.error('Excepción no capturada:', error);
});

setClient(client);
client.manager = manager;

client.on('raw', (d) => client.manager.updateVoiceState(d));

// Health check server - Railway asigna el puerto automáticamente
const PORT = process.env.PORT || 8080;

// Variable para trackear si el bot está listo
let botReady = false;

http.createServer((req, res) => {
  // Log de la petición para debugging
  console.log(`[HEALTH] Petición recibida: ${req.method} ${req.url}`);
  
  // Headers CORS para evitar problemas
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Respuesta del health check - siempre responde OK para evitar que Railway mate el contenedor
  const healthData = {
    status: botReady ? 'READY' : 'STARTING',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    lavalink: {
      connected: client.manager ? client.manager.nodes.size > 0 : false,
      nodes: client.manager ? Array.from(client.manager.nodes.values()).map(node => ({
        host: node.options.host,
        port: node.options.port,
        connected: node.connected
      })) : []
    }
  };
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(healthData, null, 2));
}).listen(PORT, () => {
  console.log(`Healthcheck server running on port ${PORT}`);
  console.log(`[HEALTH] Endpoint disponible en: http://localhost:${PORT}/`);
});

// Marcar el bot como listo cuando se conecte a Discord
client.once('ready', () => {
  console.log('✅ Jebediah#1533 está listo y conectado a Discord!');
  console.log('🎵 Bot de música activo en', client.guilds.cache.size, 'servidores');
  botReady = true;
  client.manager.init(client.user.id);
});

// Login del bot
client.login(process.env.DISCORD_TOKEN); 