@echo off
echo ============================================
echo RESETER SENHA DO WSL
echo ============================================
echo.
echo Abrindo terminal como root...
echo Digite uma NOVA SENHA quando pedir:
echo.

wsl --user root passwd

echo.
echo ============================================
echo ✅ Senha resetada!
echo ============================================
echo.
echo Agora tente instalar Docker novamente:
echo   powershell -ExecutionPolicy Bypass -File C:\Users\User\aqkin\aqkin\install-docker.ps1
echo.
pause
