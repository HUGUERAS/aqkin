@echo off
REM ============================================
REM Script: Instala Docker via WSL
REM ============================================

echo.
echo 🐳 Instalando Docker no WSL...
echo.

REM Reiniciar WSL primeiro
echo Reiniciando WSL...
wsl --shutdown

timeout /t 2

REM Instalar Docker
echo Instalando Docker via apt...
wsl bash -c "sudo apt-get update && sudo apt-get install -y docker.io docker-compose"

if errorlevel 1 (
    echo.
    echo ❌ Erro na instalação.
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Docker instalado!
echo.
pause
