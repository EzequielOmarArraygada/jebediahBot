# 🎤 Comandos de Voz - Jebediah Bot

## 📋 Descripción

El bot ahora incluye un sistema de comandos de voz que permite controlar la música usando comandos hablados. El sistema utiliza la palabra clave "jebediah" para activar los comandos.

## 🔧 Configuración

### 1. Configurar Google Speech-to-Text

Para que los comandos de voz funcionen, necesitas configurar Google Speech-to-Text:

1. **Crear proyecto en Google Cloud Console:**
   - Ve a [Google Cloud Console](https://console.cloud.google.com/)
   - Crea un nuevo proyecto o selecciona uno existente
   - Habilita la API de Speech-to-Text

2. **Crear Service Account:**
   - Ve a "IAM & Admin" > "Service Accounts"
   - Crea una nueva cuenta de servicio
   - Descarga el archivo JSON de credenciales

3. **Configurar credenciales:**
   - Renombra el archivo descargado a `google-credentials.json`
   - Colócalo en la raíz del proyecto
   - O configura la variable de entorno `GOOGLE_APPLICATION_CREDENTIALS`

### 2. Instalar dependencias

```bash
npm install
```

### 3. Variables de entorno

Asegúrate de tener estas variables en tu `.env`:

```env
DISCORD_TOKEN=tu_token_del_bot
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
```

## 🎵 Comandos de Voz Disponibles

### Comandos de Reproducción
- **`jebediah reproduce [canción]`** - Reproduce una canción
- **`jebediah play [canción]`** - Reproduce una canción (en inglés)

### Comandos de Control
- **`jebediah pausa`** - Pausa la reproducción
- **`jebediah pause`** - Pausa la reproducción (en inglés)
- **`jebediah continúa`** - Continúa la reproducción
- **`jebediah resume`** - Continúa la reproducción (en inglés)
- **`jebediah siguiente`** - Salta a la siguiente canción
- **`jebediah skip`** - Salta a la siguiente canción (en inglés)
- **`jebediah detén`** - Detiene la reproducción
- **`jebediah stop`** - Detiene la reproducción (en inglés)

### Comandos de Información
- **`jebediah cola`** - Muestra la cola de reproducción
- **`jebediah queue`** - Muestra la cola de reproducción (en inglés)
- **`jebediah volumen [número]`** - Ajusta el volumen (0-100)
- **`jebediah volume [número]`** - Ajusta el volumen (en inglés)

## 🚀 Cómo Usar

### 1. Activar comandos de voz
```
/join
```
El bot se unirá al canal de voz y comenzará a escuchar comandos.

### 2. Usar comandos de voz
Simplemente habla en el canal de voz usando la palabra clave "jebediah":

**Ejemplos:**
- "jebediah reproduce enemy"
- "jebediah pausa"
- "jebediah siguiente"
- "jebediah volumen 80"

### 3. Desactivar comandos de voz
```
/leave
```
El bot saldrá del canal de voz y dejará de escuchar comandos.

## ⚙️ Comandos de Texto Nuevos

### `/join`
- **Descripción:** El bot se une al canal de voz y activa los comandos de voz
- **Uso:** Debes estar en un canal de voz

### `/leave`
- **Descripción:** El bot sale del canal de voz y desactiva los comandos de voz
- **Uso:** No requiere estar en canal de voz

## 🔍 Cómo Funciona

1. **Detección de Actividad:** El bot detecta cuando alguien habla en el canal
2. **Grabación de Audio:** Captura el audio mientras la persona habla
3. **Speech-to-Text:** Convierte el audio a texto usando Google Speech-to-Text
4. **Detección de Palabra Clave:** Busca la palabra "jebediah" en el texto
5. **Procesamiento de Comando:** Mapea el resto del texto a comandos
6. **Ejecución:** Ejecuta el comando correspondiente

## 🛠️ Solución de Problemas

### El bot no responde a comandos de voz
1. Verifica que esté conectado al canal de voz (`/join`)
2. Asegúrate de decir "jebediah" claramente
3. Verifica que las credenciales de Google estén configuradas
4. Revisa los logs del bot para errores

### Error de credenciales de Google
1. Verifica que el archivo `google-credentials.json` existe
2. Asegúrate de que la API de Speech-to-Text esté habilitada
3. Verifica que la cuenta de servicio tenga permisos

### El bot no se une al canal
1. Verifica que tengas permisos para conectar el bot
2. Asegúrate de estar en un canal de voz
3. Verifica que el bot tenga permisos de voz

## 📊 Logs y Debugging

El bot registra información detallada sobre los comandos de voz:

```
🎤 Usuario 123456789 empezó a hablar
🎤 Texto detectado: "jebediah reproduce enemy"
✅ Palabra clave detectada! Procesando comando: "jebediah reproduce enemy"
🎵 Ejecutando comando de voz: play con argumentos: enemy
🎤 Comando de voz ejecutado: Reproduciendo "Enemy - Imagine Dragons"
```

## 🔒 Privacidad y Seguridad

- El audio se procesa temporalmente y no se almacena
- Solo se procesa audio cuando se detecta la palabra clave
- Los comandos de voz tienen las mismas restricciones que los comandos de texto
- El bot solo responde a comandos que contengan "jebediah"

## 🎯 Consejos para Mejor Reconocimiento

1. **Habla claramente** y a un volumen normal
2. **Usa la palabra clave** "jebediah" al inicio
3. **Evita ruido de fondo** excesivo
4. **Espera un momento** después de decir "jebediah" antes del comando
5. **Usa comandos simples** y directos

## 🔄 Actualizaciones Futuras

- Soporte para más idiomas
- Comandos de voz más complejos
- Configuración de palabra clave personalizable
- Notificaciones de voz
- Integración con más servicios de speech-to-text 