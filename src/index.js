const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const play = require('play-dl');
const ffmpeg = require('ffmpeg-static');
const VoiceManager = require('./utils/voiceManager');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Colección para comandos
client.commands = new Collection();

// Inicializar VoiceManager
const voiceManager = new VoiceManager();

// Cargar comandos
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[ADVERTENCIA] El comando en ${filePath} no tiene las propiedades "data" o "execute" requeridas.`);
    }
}

// Manejar eventos de comandos
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No se encontró el comando ${interaction.commandName}`);
        return;
    }

    try {
        await command.execute(interaction, voiceManager);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: '¡Hubo un error al ejecutar este comando!', ephemeral: true });
        } else {
            await interaction.reply({ content: '¡Hubo un error al ejecutar este comando!', ephemeral: true });
        }
    }
});

// Manejar comandos de voz
voiceManager.on('executeVoiceCommand', async (data) => {
    const { commandName, args, userId, guildId } = data;
    
    try {
        console.log(`🎤 Ejecutando comando de voz: ${commandName} con args: ${args}`);
        
        // Obtener el comando correspondiente
        const command = client.commands.get(commandName);
        if (!command) {
            console.error(`Comando de voz no encontrado: ${commandName}`);
            return;
        }
        
        // Obtener el guild y el usuario
        const guild = client.guilds.cache.get(guildId);
        const user = await client.users.fetch(userId);
        
        if (!guild) {
            console.error(`Guild no encontrado: ${guildId}`);
            return;
        }
        
        // Buscar un canal de texto apropiado para enviar la respuesta
        const textChannel = guild.channels.cache.find(channel => 
            channel.type === 0 && // 0 = canal de texto
            channel.permissionsFor(client.user).has('SendMessages')
        );
        
        if (!textChannel) {
            console.error(`No se encontró un canal de texto apropiado en ${guild.name}`);
            return;
        }
        
        // Crear una interacción simulada para el comando de voz
        const mockInteraction = {
            guildId: guildId,
            guild: guild,
            userId: userId,
            user: user,
            client: client,
            voiceManager: voiceManager,
            channel: textChannel,
            reply: async (content) => {
                if (content.embeds) {
                    await textChannel.send({ embeds: content.embeds });
                } else if (content.content) {
                    await textChannel.send(content.content);
                } else {
                    await textChannel.send(content);
                }
            },
            editReply: async (content) => {
                if (content.embeds) {
                    await textChannel.send({ embeds: content.embeds });
                } else if (content.content) {
                    await textChannel.send(content.content);
                } else {
                    await textChannel.send(content);
                }
            },
            followUp: async (content) => {
                if (content.embeds) {
                    await textChannel.send({ embeds: content.embeds });
                } else if (content.content) {
                    await textChannel.send(content.content);
                } else {
                    await textChannel.send(content);
                }
            }
        };
        
        // Ejecutar el comando con los argumentos de voz
        await command.execute(mockInteraction, voiceManager, args);
        
    } catch (error) {
        console.error('Error ejecutando comando de voz:', error);
    }
});

// Evento cuando el bot está listo
client.once('ready', () => {
    console.log(`✅ ${client.user.tag} está en línea!`);
    console.log(`🎵 Bot de música listo para reproducir`);
    console.log(`🎤 Sistema de comandos de voz activado`);
    console.log(`🔑 Palabra clave: "jebe"`);
});

// Manejo de errores
client.on('error', error => {
    console.error('Error del cliente Discord:', error);
});

process.on('unhandledRejection', error => {
    console.error('Promesa rechazada no manejada:', error);
});

// Conectar el bot
client.login(process.env.DISCORD_TOKEN); 

// Mantener el proceso vivo en Railway
setInterval(() => {}, 1000 * 60 * 60); 