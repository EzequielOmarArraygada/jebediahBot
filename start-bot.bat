@echo off
echo ========================================
echo    Jebediah Music Bot - Iniciando
echo ========================================
echo.

REM Verificar si PM2 está instalado
pm2 --version >nul 2>&1
if %errorlevel% neq 0 (
    echo PM2 no está instalado. Instalando...
    npm install -g pm2
    echo.
)

REM Crear directorio de logs si no existe
if not exist "logs" mkdir logs

REM Iniciar el bot con PM2
echo Iniciando bot con PM2...
pm2 start ecosystem.config.js

echo.
echo ========================================
echo    Bot iniciado correctamente!
echo ========================================
echo.
echo Comandos útiles:
echo - Ver logs: pm2 logs jebediah-bot
echo - Reiniciar: pm2 restart jebediah-bot
echo - Detener: pm2 stop jebediah-bot
echo - Monitorear: pm2 monit
echo.
pause 