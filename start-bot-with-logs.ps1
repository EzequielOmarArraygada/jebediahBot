# Script para iniciar Jebediah Bot con logs
Write-Host "Iniciando Jebediah Bot con logs..." -ForegroundColor Green

# Cambiar al directorio del proyecto
Set-Location "C:\Users\treze\Documents\GitHub\jebediahBot"

# Crear directorio de logs si no existe
if (!(Test-Path "logs")) {
    New-Item -ItemType Directory -Name "logs"
}

$logFile = "logs\bot.log"
$logFileError = "logs\bot.log.error"

Write-Host "Logs se guardarán en: $logFile" -ForegroundColor Yellow

# Iniciar el bot y redirigir la salida al archivo de log (sobrescribe cada vez)
Start-Process -FilePath "node" -ArgumentList "src/index.js" -RedirectStandardOutput $logFile -RedirectStandardError $logFileError -WindowStyle Hidden

Write-Host "Bot iniciado! Para ver los logs en tiempo real, ejecuta:" -ForegroundColor Green
Write-Host "Get-Content $logFile -Wait" -ForegroundColor Yellow
Write-Host "Para detener el bot, ejecuta: npm run stop:background" -ForegroundColor Yellow 