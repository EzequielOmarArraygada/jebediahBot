@echo off
echo ========================================
echo    Configurando inicio automatico
echo ========================================
echo.

REM Verificar si se ejecuta como administrador
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Este script requiere permisos de administrador.
    echo.
    echo Haciendo clic en "Si" se ejecutara como administrador.
    echo.
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

echo Ejecutando como administrador...
echo.

REM Obtener la ruta actual
set "CURRENT_DIR=%~dp0"
set "CURRENT_DIR=%CURRENT_DIR:~0,-1%"

echo Configurando tarea programada...
echo.

REM Crear la tarea programada usando PowerShell
powershell -Command "& { $action = New-ScheduledTaskAction -Execute 'cmd.exe' -Argument '/c cd /d \"%CURRENT_DIR%\" && pm2 resurrect'; $trigger = New-ScheduledTaskTrigger -AtLogOn; $principal = New-ScheduledTaskPrincipal -UserId '%USERNAME%' -LogonType Interactive -RunLevel Highest; $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable; Register-ScheduledTask -TaskName 'JebediahBot' -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description 'Inicia Jebediah Music Bot con PM2' }"

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo    ¡Configuracion exitosa!
    echo ========================================
    echo.
    echo El bot se iniciara automaticamente cuando:
    echo - Inicies sesion en Windows
    echo - Reinicies la computadora
    echo.
    echo Para desactivar el inicio automatico:
    echo .\disable-autostart.ps1
    echo.
    echo Para verificar la tarea:
    echo Get-ScheduledTask -TaskName "JebediahBot"
    echo.
) else (
    echo.
    echo Error al configurar el inicio automatico.
    echo.
)

pause 