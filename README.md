# 🎵 Jebediah Bot - Bot de Música para Discord

Un bot de Discord completo para reproducir música desde YouTube con comandos de voz y una interfaz moderna.

## ✨ Características

- 🎵 Reproducción de música desde YouTube
- 📋 Sistema de cola de reproducción
- 🔊 Control de volumen
- 🔁 Reproducción en bucle
- ⏭️ Saltar canciones
- 📱 Comandos slash modernos
- 🎨 Embeds visuales atractivos
- 🎤 Soporte para comandos de voz

## 🚀 Instalación

### Prerrequisitos

- Node.js 16.0.0 o superior
- npm o yarn
- Una aplicación de Discord con bot

### Pasos de instalación

1. **Clona el repositorio**
   ```bash
   git clone <tu-repositorio>
   cd jebediahBot
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**
   ```bash
   cp env.example .env
   ```
   
   Edita el archivo `.env` con tus credenciales:
   ```env
   DISCORD_TOKEN=tu_token_aqui
   CLIENT_ID=tu_client_id_aqui
   COMMAND_PREFIX=!
   MAX_QUEUE_SIZE=50
   DEFAULT_VOLUME=50
   ```

4. **Registra los comandos slash**
   ```bash
   node src/deploy-commands.js
   ```

5. **Inicia el bot**
   ```bash
   npm start
   ```

## 🔧 Configuración del Bot de Discord

### 1. Crear una aplicación en Discord

1. Ve a [Discord Developer Portal](https://discord.com/developers/applications)
2. Haz clic en "New Application"
3. Dale un nombre a tu aplicación
4. Ve a la sección "Bot"
5. Haz clic en "Add Bot"
6. Copia el token del bot (lo necesitarás para el archivo .env)

### 2. Configurar los permisos

En la sección "Bot" de tu aplicación:

1. Activa los siguientes "Privileged Gateway Intents":
   - Presence Intent
   - Server Members Intent
   - Message Content Intent

2. En "Bot Permissions", asegúrate de tener:
   - Send Messages
   - Use Slash Commands
   - Connect
   - Speak
   - Use Voice Activity

### 3. Invitar el bot a tu servidor

1. Ve a la sección "OAuth2" > "URL Generator"
2. Selecciona "bot" en Scopes
3. Selecciona los permisos mencionados arriba
4. Copia la URL generada y úsala para invitar el bot a tu servidor

## 🎮 Comandos Disponibles

| Comando | Descripción | Uso |
|---------|-------------|-----|
| `/play` | Reproduce música desde YouTube | `/play query: [URL o término]` |
| `/skip` | Salta la canción actual | `/skip` |
| `/stop` | Detiene la reproducción | `/stop` |
| `/queue` | Muestra la cola de reproducción | `/queue` |
| `/volume` | Controla el volumen | `/volume level: [0-100]` |
| `/loop` | Activa/desactiva el bucle | `/loop` |
| `/help` | Muestra la ayuda | `/help` |

## 🎵 Funcionalidades de Música

### Reproducción
- Soporte para URLs de YouTube directas
- Búsqueda por nombre de canción
- Reproducción automática de la siguiente canción
- Manejo de errores robusto

### Cola de Reproducción
- Límite configurable de canciones en cola
- Información detallada de cada canción
- Control de posición en cola

### Control de Audio
- Control de volumen (0-100%)
- Reproducción en bucle
- Saltar canciones
- Detener reproducción

## 🛠️ Desarrollo

### Estructura del proyecto

```
jebediahBot/
├── src/
│   ├── commands/          # Comandos slash
│   ├── events/            # Eventos del bot
│   ├── utils/             # Utilidades (MusicQueue)
│   ├── index.js           # Archivo principal
│   └── deploy-commands.js # Registro de comandos
├── package.json
├── env.example
└── README.md
```

### Scripts disponibles

- `npm start` - Inicia el bot
- `npm run dev` - Inicia el bot en modo desarrollo con nodemon
- `node src/deploy-commands.js` - Registra los comandos slash

## 🔧 Personalización

### Variables de entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `DISCORD_TOKEN` | Token del bot de Discord | Requerido |
| `CLIENT_ID` | ID del cliente de Discord | Requerido |
| `COMMAND_PREFIX` | Prefijo para comandos de texto | `!` |
| `MAX_QUEUE_SIZE` | Tamaño máximo de la cola | `50` |
| `DEFAULT_VOLUME` | Volumen por defecto | `50` |

### Modificar la clase MusicQueue

Puedes personalizar el comportamiento del bot editando `src/utils/MusicQueue.js`:

- Cambiar el volumen por defecto
- Modificar el comportamiento del bucle
- Agregar nuevas funcionalidades de audio

## 🐛 Solución de problemas

### Error: "Cannot find module '@discordjs/opus'"
```bash
npm install @discordjs/opus
```

### Error: "FFmpeg not found"
El bot incluye `ffmpeg-static` que debería manejar esto automáticamente. Si persiste:
```bash
npm install ffmpeg-static
```

### Error: "Bot no responde a comandos"
1. Verifica que el token sea correcto
2. Asegúrate de haber ejecutado `deploy-commands.js`
3. Verifica que el bot tenga los permisos necesarios

### Error: "No se puede reproducir audio"
1. Verifica que el bot esté en el canal de voz
2. Asegúrate de que el bot tenga permisos de "Connect" y "Speak"
3. Verifica tu conexión a internet

## 📝 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Si tienes problemas o preguntas:

1. Revisa la sección de solución de problemas
2. Abre un issue en GitHub
3. Contacta al desarrollador

---

¡Disfruta tu bot de música! 🎵 