# 🎵 Jebediah Music Bot - Despliegue Local

## Opciones para mantener el bot corriendo localmente

### 🚀 Opción 1: PM2 (Recomendada)

PM2 es un gestor de procesos que mantiene tu aplicación corriendo y la reinicia automáticamente.

#### Instalación:
```bash
npm install -g pm2
```

#### Uso rápido:
```bash
# Iniciar el bot
npm run pm2:start

# Ver logs en tiempo real
npm run pm2:logs

# Reiniciar el bot
npm run pm2:restart

# Detener el bot
npm run pm2:stop

# Monitorear recursos
npm run pm2:monit
```

#### Scripts automáticos:
- **Windows**: Doble clic en `start-bot.bat`
- **PowerShell**: Ejecutar `.\start-bot.ps1`

### 🔄 Opción 2: Forever

Alternativa más simple a PM2.

#### Instalación:
```bash
npm install -g forever
```

#### Uso:
```bash
# Iniciar
npm run forever:start

# Detener
npm run forever:stop

# Reiniciar
npm run forever:restart
```

### 🛠️ Opción 3: Nodemon (Desarrollo)

Para desarrollo con recarga automática:

```bash
npm run dev
```

### 📊 Monitoreo de recursos

#### Con PM2:
```bash
# Dashboard interactivo
pm2 monit

# Estadísticas
pm2 status

# Logs en tiempo real
pm2 logs jebediah-bot --lines 100
```

#### Verificar uso de memoria:
```bash
# En Windows PowerShell
Get-Process node | Select-Object ProcessName, Id, WorkingSet, CPU

# En CMD
tasklist /fi "imagename eq node.exe"
```

### 🔧 Configuración optimizada

El archivo `ecosystem.config.js` está configurado con:
- **Límite de memoria**: 200MB (se reinicia si excede)
- **Reinicio automático**: En caso de errores
- **Logs organizados**: En carpeta `logs/`
- **Máximo 10 reinicios**: Para evitar loops infinitos

### 📁 Estructura de logs

```
logs/
├── combined.log    # Todos los logs
├── out.log         # Salida estándar
└── error.log       # Errores
```

### 🚨 Solución de problemas

#### Bot no inicia:
```bash
# Verificar logs
pm2 logs jebediah-bot

# Reiniciar completamente
pm2 delete jebediah-bot
pm2 start ecosystem.config.js
```

#### Alto uso de memoria:
- El bot se reiniciará automáticamente si excede 200MB
- Verificar con `pm2 monit`

#### Problemas de audio:
- Verificar que FFmpeg esté instalado
- Revisar logs de errores en `logs/error.log`

### 💡 Tips para producción local

1. **Iniciar con Windows**: Usar `start-bot.bat` para inicio automático
2. **Monitoreo**: Usar `pm2 monit` para ver recursos en tiempo real
3. **Logs**: Revisar `logs/` para debugging
4. **Reinicio**: El bot se reinicia automáticamente si se cae

### 🔄 Migración a Railway

Cuando estés listo para Railway:
1. Mantén la rama `main` para Railway
2. Usa esta rama local para desarrollo
3. Mergea cambios cuando estén probados localmente 