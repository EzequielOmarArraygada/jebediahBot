Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Desactivando inicio automático" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

try {
    # Verificar si existe la tarea
    $existingTask = Get-ScheduledTask -TaskName "JebediahBot" -ErrorAction SilentlyContinue
    
    if ($existingTask) {
        Write-Host "Eliminando tarea programada 'JebediahBot'..." -ForegroundColor Yellow
        Unregister-ScheduledTask -TaskName "JebediahBot" -Confirm:$false
        
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "    ¡Inicio automático desactivado!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "El bot ya no se iniciará automáticamente." -ForegroundColor White
        Write-Host ""
        Write-Host "Para iniciar manualmente:" -ForegroundColor White
        Write-Host "- Usar: pm2 resurrect" -ForegroundColor Gray
        Write-Host "- O ejecutar: .\start-bot.ps1" -ForegroundColor Gray
        Write-Host ""
    } else {
        Write-Host "No se encontró la tarea programada 'JebediahBot'." -ForegroundColor Yellow
        Write-Host "El inicio automático ya estaba desactivado." -ForegroundColor Green
    }
    
} catch {
    Write-Host ""
    Write-Host "Error al desactivar el inicio automático:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Intenta ejecutar PowerShell como administrador." -ForegroundColor Yellow
}

Read-Host "Presiona Enter para continuar..." 