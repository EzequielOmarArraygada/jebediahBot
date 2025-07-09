# 🎵 Jebediah Music Bot

Un bot de música para Discord que reproduce música desde YouTube usando Node.js y discord.js.

## ✨ Características

- 🎵 Reproducción de música desde YouTube
- 📋 Cola de reproducción
- ⏯️ Controles básicos (play, pause, resume, skip, stop)
- 🔊 Control de volumen
- 🔍 Búsqueda por URL o términos
- 📊 Información detallada de canciones
- 🎨 Embeds visuales atractivos

## 🚀 Instalación

### Prerrequisitos

- Node.js 16.0.0 o superior
- Una aplicación de Discord con bot configurado

### Pasos de instalación

1. **Clonar el repositorio**
   ```bash
   git clone <tu-repositorio>
   cd jebediahBot
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp env.example .env
   ```
   
   Edita el archivo `.env` y agrega:
   ```
   DISCORD_TOKEN=tu_token_del_bot
   CLIENT_ID=tu_client_id
   ```

4. **Registrar comandos slash**
   ```bash
   npm run deploy
   ```

5. **Ejecutar el bot**
   ```bash
   npm start
   ```

## 🎮 Comandos

| Comando | Descripción | Uso |
|---------|-------------|-----|
| `/play` | Reproduce música desde YouTube | `/play url_o_busqueda: Never Gonna Give You Up` |
| `/pause` | Pausa la reproducción actual | `/pause` |
| `/resume` | Reanuda la reproducción pausada | `/resume` |
| `/skip` | Salta a la siguiente canción | `/skip` |
| `/stop` | Detiene la reproducción y limpia la cola | `/stop` |
| `/queue` | Muestra la cola de reproducción | `/queue` |
| `/volume` | Ajusta el volumen (0-100) | `/volume nivel: 50` |

## 🔧 Configuración del Bot de Discord

1. Ve a [Discord Developer Portal](https://discord.com/developers/applications)
2. Crea una nueva aplicación
3. Ve a la sección "Bot" y crea un bot
4. Copia el token y agrégalo a tu `.env`
5. Ve a "OAuth2" > "URL Generator"
6. Selecciona los scopes: `bot` y `applications.commands`
7. Selecciona los permisos del bot:
   - Send Messages
   - Use Slash Commands
   - Connect
   - Speak
   - Use Voice Activity
8. Usa la URL generada para invitar el bot a tu servidor

## 🏗️ Estructura del Proyecto

```
jebediahBot/
├── src/
│   ├── commands/          # Comandos slash
│   │   ├── play.js
│   │   ├── pause.js
│   │   ├── resume.js
│   │   ├── skip.js
│   │   ├── stop.js
│   │   ├── queue.js
│   │   └── volume.js
│   ├── utils/
│   │   └── musicManager.js # Gestor de música
│   ├── index.js           # Archivo principal
│   └── deploy-commands.js # Registro de comandos
├── package.json
├── env.example
└── README.md
```

## 🚀 Despliegue en Railway

1. Conecta tu repositorio a Railway
2. Configura las variables de entorno:
   - `DISCORD_TOKEN`
   - `CLIENT_ID`
3. Railway detectará automáticamente que es un proyecto Node.js
4. El bot se desplegará automáticamente

## 📦 Dependencias Principales

- **discord.js**: Framework principal para bots de Discord
- **@discordjs/voice**: Manejo de audio y conexiones de voz
- **ytdl-core**: Descarga y streaming de YouTube
- **@discordjs/opus**: Codec de audio
- **ffmpeg-static**: Binarios de FFmpeg para procesamiento de audio

## 🐛 Solución de Problemas

### Error de FFmpeg
Si tienes problemas con FFmpeg, asegúrate de que `ffmpeg-static` esté instalado:
```bash
npm install ffmpeg-static
```

### Error de Opus
Si tienes problemas con el codec Opus:
```bash
npm install @discordjs/opus
```

### Permisos del Bot
Asegúrate de que el bot tenga todos los permisos necesarios en tu servidor de Discord.

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🙏 Agradecimientos

- [discord.js](https://discord.js.org/) - Framework de Discord
- [ytdl-core](https://github.com/fent/node-ytdl-core) - Descarga de YouTube
- [@discordjs/voice](https://github.com/discordjs/voice) - Sistema de voz 