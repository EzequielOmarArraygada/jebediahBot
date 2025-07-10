# Jebediah Music Bot

Bot de música para Discord con capacidades de comandos de voz usando Google Speech-to-Text.

## Características

- 🎵 Reproducción de música desde YouTube
- 🎤 Comandos de voz con reconocimiento de habla
- 🔊 Detección de palabra clave "jebe" o "jebediah"
- 🎮 Comandos de música: play, pause, resume, skip, stop
- 🎧 Soporte para canales de voz de Discord

## Instalación

1. Clona el repositorio:
```bash
git clone <tu-repositorio>
cd jebediahBot
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
   - Copia `.env.example` a `.env`
   - Agrega tu token de Discord
   - Configura las credenciales de Google Cloud

4. Registra los comandos de Discord:
```bash
npm run deploy
```

## Uso

### Opción 1: Ejecución directa
```bash
npm start
```

### Opción 2: Ejecución en segundo plano (recomendado)
```bash
npm run start:background
```

### Opción 3: Ejecución con logs
```bash
npm run start:with-logs
```

## Gestión del Bot

### 🚀 **Iniciar el bot**

```bash
# Inicio directo (con ventana visible)
npm start

# Inicio en segundo plano (recomendado)
npm run start:background

# Inicio con logs guardados en archivo
npm run start:with-logs
```

### 🛑 **Detener el bot**

```bash
# Detener todos los procesos del bot
npm run stop:background
```

### 🔄 **Reiniciar/Actualizar el bot**

```bash
# Opción 1: Detener y volver a iniciar
npm run stop:background
npm run start:background

# Opción 2: Iniciar con logs para debugging
npm run start:with-logs
```

### 📊 **Ver logs y estado**

```bash
# Ver procesos activos de Node.js
npm run logs:background

# Ver los últimos 50 logs del bot
npm run logs:tail

# Ver logs en tiempo real (después de usar start:with-logs)
Get-Content logs\bot_YYYY-MM-DD_HH-mm-ss.log -Wait
```

### 🔴 **Logs en tiempo real (en vivo):**

**Opción 1 - Recomendada:**
```bash
# 1. Inicia el bot con logs guardados
npm run start:with-logs

# 2. En otra ventana de PowerShell, ejecuta:
Get-Content logs\bot_*.log -Wait
```

**Opción 2 - Directo:**
```bash
# Los logs aparecen directamente en la ventana
npm start
```

### 🔧 **Comandos de desarrollo**

```bash
# Modo desarrollo con auto-reload
npm run dev

# Registrar comandos de Discord
npm run deploy
```

## Comandos de Voz

El bot responde a comandos de voz cuando detecta la palabra clave "jebe" o "jebediah":

- "jebe play [canción]" - Reproduce una canción
- "jebe pause" - Pausa la reproducción
- "jebe resume" - Reanuda la reproducción
- "jebe skip" - Salta a la siguiente canción
- "jebe stop" / "jebe frenate" - Detiene la reproducción
- "jebe nos vemos" - El bot sale del canal de voz

## Comandos de Discord

- `/join` - El bot se une al canal de voz
- `/leave` - El bot sale del canal de voz
- `/play <canción>` - Reproduce una canción
- `/pause` - Pausa la reproducción
- `/resume` - Reanuda la reproducción
- `/skip` - Salta a la siguiente canción
- `/stop` - Detiene la reproducción

## Solución de Problemas

### 🚫 **Error de PM2 en Windows**
Si encuentras errores de permisos con PM2, usa los scripts alternativos:
- `npm run start:background` en lugar de `npm run pm2:start`
- `npm run stop:background` en lugar de `npm run pm2:stop`

### 🎤 **Problemas de Comandos de Voz**
- Asegúrate de que el bot tenga permisos para acceder al micrófono
- Verifica que las credenciales de Google Cloud estén configuradas correctamente
- El bot debe estar en el mismo canal de voz que tú
- Habla claramente y cerca del micrófono

### 🔧 **Problemas de Inicio**
- Si el bot no inicia, verifica que no haya otro proceso usando el puerto
- Usa `npm run logs:background` para ver si hay procesos activos
- Si hay errores, usa `npm run start:with-logs` para ver logs detallados

### 🎵 **Problemas de Música**
- Verifica que el bot tenga permisos de "Conectar" y "Hablar" en el servidor
- Asegúrate de estar en un canal de voz antes de usar comandos
- Si la música no reproduce, intenta con una URL directa de YouTube

### 🔄 **Reinicio Automático**
El bot está configurado para iniciarse automáticamente con Windows. Si necesitas desactivarlo:
1. Abre "Programador de tareas" (`taskschd.msc`)
2. Busca la tarea "JebediahBot"
3. Haz clic derecho → "Deshabilitar"

## Dependencias

- Discord.js v14
- @discordjs/voice
- @google-cloud/speech
- play-dl
- prism-media
- ffmpeg-static

## Licencia

MIT 