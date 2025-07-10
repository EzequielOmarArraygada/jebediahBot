Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Configurando inicio automático" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Obtener la ruta actual
$currentDir = Get-Location
$pm2Command = "pm2 resurrect"

Write-Host "Directorio actual: $currentDir" -ForegroundColor Yellow
Write-Host "Comando PM2: $pm2Command" -ForegroundColor Yellow
Write-Host ""

# Verificar si ya existe la tarea
$existingTask = Get-ScheduledTask -TaskName "JebediahBot" -ErrorAction SilentlyContinue

if ($existingTask) {
    Write-Host "La tarea JebediahBot ya existe. ¿Deseas reemplazarla? (S/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -eq "S" -or $response -eq "s") {
        Unregister-ScheduledTask -TaskName "JebediahBot" -Confirm:$false
        Write-Host "Tarea anterior eliminada." -ForegroundColor Green
    } else {
        Write-Host "Operación cancelada." -ForegroundColor Red
        exit
    }
}

try {
    # Crear la acción
    $action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c cd /d `"$currentDir`" && $pm2Command"
    
    # Crear el trigger (al inicio de sesión)
    $trigger = New-ScheduledTaskTrigger -AtLogOn
    
    # Configurar el usuario actual
    $principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Highest
    
    # Configurar la tarea
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
    
    # Registrar la tarea
    Register-ScheduledTask -TaskName "JebediahBot" -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description "Inicia Jebediah Music Bot con PM2"
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "    ¡Configuración exitosa!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "El bot se iniciará automáticamente cuando:" -ForegroundColor White
    Write-Host "- Inicies sesión en Windows" -ForegroundColor Gray
    Write-Host "- Reinicies la computadora" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Comandos útiles:" -ForegroundColor White
    Write-Host "- Verificar tarea: Get-ScheduledTask -TaskName 'JebediahBot'" -ForegroundColor Gray
    Write-Host "- Eliminar tarea: Unregister-ScheduledTask -TaskName 'JebediahBot'" -ForegroundColor Gray
    Write-Host "- Ver estado PM2: pm2 status" -ForegroundColor Gray
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "Error al configurar el inicio automático:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Intenta ejecutar PowerShell como administrador." -ForegroundColor Yellow
}

Read-Host "Presiona Enter para continuar..." 