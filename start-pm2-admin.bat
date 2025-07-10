@echo off
echo Iniciando PM2 con permisos de administrador...
powershell -Command "Start-Process powershell -Verb RunAs -ArgumentList '-Command', 'cd ''C:\Users\treze\Documents\GitHub\jebediahBot''; pm2 start src/index.js --name jebediah-bot'"
pause 