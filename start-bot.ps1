Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Jebediah Music Bot - Iniciando" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si PM2 está instalado
try {
    pm2 --version | Out-Null
    Write-Host "PM2 encontrado ✓" -ForegroundColor Green
} catch {
    Write-Host "PM2 no está instalado. Instalando..." -ForegroundColor Yellow
    npm install -g pm2
    Write-Host ""
}

# Crear directorio de logs si no existe
if (!(Test-Path "logs")) {
    New-Item -ItemType Directory -Name "logs"
    Write-Host "Directorio de logs creado ✓" -ForegroundColor Green
}

# Iniciar el bot con PM2
Write-Host "Iniciando bot con PM2..." -ForegroundColor Yellow
pm2 start ecosystem.config.js

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "    Bot iniciado correctamente!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Comandos útiles:" -ForegroundColor White
Write-Host "- Ver logs: pm2 logs jebediah-bot" -ForegroundColor Gray
Write-Host "- Reiniciar: pm2 restart jebediah-bot" -ForegroundColor Gray
Write-Host "- Detener: pm2 stop jebediah-bot" -ForegroundColor Gray
Write-Host "- Monitorear: pm2 monit" -ForegroundColor Gray
Write-Host ""
Read-Host "Presiona Enter para continuar..." 