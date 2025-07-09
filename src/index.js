require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { Player } = require('discord-player');
const { DefaultExtractors } = require('@discord-player/extractor');
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
        }
    });
    client.player = player;

    console.log('[INIT] Player creado, registrando extractores...');
    // Registrar extractores por defecto (YouTube será el preferido)
    await player.extractors.loadMulti(DefaultExtractors);
    console.log('[INIT] Extractores registrados exitosamente');

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