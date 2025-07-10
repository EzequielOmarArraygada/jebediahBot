# Script para iniciar Jebediah Bot en segundo plano
Write-Host "Iniciando Jebediah Bot en segundo plano..." -ForegroundColor Green

# Cambiar al directorio del proyecto
Set-Location "C:\Users\treze\Documents\GitHub\jebediahBot"

# Iniciar el bot en segundo plano
Start-Process -FilePath "node" -ArgumentList "src/index.js" -WindowStyle Hidden

Write-Host "Bot iniciado en segundo plano!" -ForegroundColor Green
Write-Host "Para ver los logs, ejecuta: Get-Process | Where-Object {`$_.ProcessName -eq 'node'}" -ForegroundColor Yellow
Write-Host "Para detener el bot, ejecuta: Stop-Process -Name 'node' -Force" -ForegroundColor Yellow 