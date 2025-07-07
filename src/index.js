require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');
const { kazagumo, shoukaku, setClient } = require('./erela');
const http = require('http');

// Log de versiones para debugging
console.log('[DEBUG] Versiones de dependencias:');
console.log(`[DEBUG] shoukaku: ${require('shoukaku/package.json').version}`);
console.log(`[DEBUG] kazagumo: ${require('kazagumo/package.json').version}`);
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
client.kazagumo = kazagumo;
client.shoukaku = shoukaku;

client.on('raw', (d) => shoukaku.connector.updateVoiceState(d));

// Health check server - Railway asigna el puerto automáticamente
const PORT = process.env.PORT || 8080;

http.createServer((req, res) => {
  // Log de la petición para debugging
  console.log(`[HEALTH] Petición recibida: ${req.method} ${req.url}`);
  
  // Respuesta simple del health check
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('OK');
}).listen(PORT, () => {
  console.log(`Healthcheck server running on port ${PORT}`);
});

// Marcar el bot como listo cuando se conecte a Discord
client.once('ready', () => {
  console.log('✅ Jebediah#1533 está listo y conectado a Discord!');
  console.log('🎵 Bot de música activo en', client.guilds.cache.size, 'servidores');
});

// Login del bot
client.login(process.env.DISCORD_TOKEN); 