@echo off
echo ========================================
echo    Configurando inicio automatico
echo ========================================
echo.

REM Obtener la ruta actual
set "CURRENT_DIR=%~dp0"
set "CURRENT_DIR=%CURRENT_DIR:~0,-1%"

REM Crear el comando para iniciar PM2
set "PM2_COMMAND=pm2 resurrect"

echo Configurando tarea programada...
echo.

REM Crear la tarea programada
schtasks /create /tn "JebediahBot" /tr "cmd /c cd /d \"%CURRENT_DIR%\" && %PM2_COMMAND%" /sc onlogon /ru "%USERNAME%" /f

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
    echo schtasks /delete /tn "JebediahBot" /f
    echo.
    echo Para verificar la tarea:
    echo schtasks /query /tn "JebediahBot"
    echo.
) else (
    echo.
    echo Error al configurar el inicio automatico.
    echo Intenta ejecutar como administrador.
    echo.
)

pause 