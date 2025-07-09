require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { Player } = require('discord-player');
const { YouTubeExtractor, DefaultExtractors } = require('@discord-player/extractor');
const fs = require('fs');
const path = require('path');
const http = require('http');

async function main() {
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent
        ]
    });

    client.commands = new Collection();
    const player = new Player(client, {
        ytdlOptions: {
            quality: 'highestaudio',
            highWaterMark: 1 << 25
        },
        connectionTimeout: 999999,
        bufferingTimeout: 999999
    });
    
    // Configurar cookie de YouTube si está disponible
    if (process.env.YOUTUBE_COOKIE) {
        console.log('[INIT] Cookie de YouTube configurada');
        player.options.youtubeCookie = process.env.YOUTUBE_COOKIE;
    } else {
        console.log('[INIT] No se encontró cookie de YouTube');
    }
    
    client.player = player;

    console.log('[INIT] Player creado, registrando extractores por defecto...');
    // Registrar extractores por defecto (YouTube, SoundCloud, etc.)
    await player.extractors.loadMulti(DefaultExtractors);
    console.log('[INIT] Extractores por defecto registrados exitosamente');

    // Agregar listeners para eventos del Player
    player.events.on('playerStart', (queue, track) => {
        console.log(`[PLAYER] Iniciando reproducción: ${track.title}`);
        console.log(`[PLAYER] Track URL: ${track.url}`);
        console.log(`[PLAYER] Duración: ${track.duration}`);
        console.log(`[PLAYER] Queue size: ${queue.tracks.size}`);
    });

    player.events.on('playerError', (queue, error) => {
        console.error(`[PLAYER] Error en reproducción:`, error);
        console.error(`[PLAYER] Error stack:`, error.stack);
        console.error(`[PLAYER] Error code:`, error.code);
    });

    player.events.on('playerSkip', (queue, track) => {
        console.log(`[PLAYER] Canción saltada: ${track.title}`);
    });

    player.events.on('playerFinish', (queue, track) => {
        console.log(`[PLAYER] Canción terminada: ${track.title}`);
        console.log(`[PLAYER] Tracks restantes en cola: ${queue.tracks.size}`);
    });

    player.events.on('connectionCreate', (queue) => {
        console.log(`[PLAYER] Conexión de voz creada en: ${queue.channel.name}`);
        console.log(`[PLAYER] Channel ID: ${queue.channel.id}`);
        console.log(`[PLAYER] Guild ID: ${queue.guild.id}`);
    });

    player.events.on('connectionDestroy', (queue) => {
        console.log(`[PLAYER] Conexión de voz destruida en: ${queue.channel.name}`);
        console.log(`[PLAYER] Channel ID: ${queue.channel.id}`);
    });

    player.events.on('debug', (message) => {
        console.dir(message, { depth: null });
    });

    player.events.on('error', (error) => {
        console.error(`[PLAYER ERROR] Error general:`, error);
    });

    // Cargar comandos
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        client.commands.set(command.data.name, command);
    }

    client.once('ready', () => {
        console.log(`Bot listo como ${client.user.tag}`);
    });

    client.on('interactionCreate', async interaction => {
        if (!interaction.isChatInputCommand()) return;
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            await command.execute(interaction, client);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Hubo un error al ejecutar el comando.', ephemeral: true });
        }
    });

    client.login(process.env.TOKEN);

    // Servidor HTTP mínimo para health check (Railway)
    const PORT = process.env.PORT; // Sin valor por defecto
    http.createServer((req, res) => {
      console.log(`[HEALTHCHECK] ${req.method} ${req.url} desde ${req.socket.remoteAddress}`);
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('OK');
    }).listen(PORT, '0.0.0.0', () => {
      console.log(`Healthcheck server running on port ${PORT}`);
    });
}

main(); 