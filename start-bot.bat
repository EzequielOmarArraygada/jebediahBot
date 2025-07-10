@echo off
echo Iniciando Jebediah Bot con logs...
echo.
echo Para ver los logs en tiempo real, ejecuta: Get-Content logs\bot.log -Wait
echo Para detener el bot, presiona Ctrl+C
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0start-bot-with-logs.ps1"
pause 