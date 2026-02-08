# Script para parar todos os serviços e o monitor do Agente CLI

Write-Host "🛑 Parando monitor e serviços..." -ForegroundColor Cyan

# 1. Parar o script de monitoramento
$currentPid = [System.Diagnostics.Process]::GetCurrentProcess().Id
Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match "monitor-agente.ps1" -and $_.ProcessId -ne $currentPid } | ForEach-Object { 
    Stop-Process -Id $_.ProcessId -Force 
    Write-Host "✅ Monitor encerrado." -ForegroundColor Green
}

# 2. Parar o Frontend (Vite/Nx)
Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match "nx serve" -or $_.Name -eq "node.exe" -and $_.CommandLine -match "vite" } | ForEach-Object { 
    Stop-Process -Id $_.ProcessId -Force 
    Write-Host "✅ Frontend encerrado." -ForegroundColor Green
}

# 3. Parar o Backend (Uvicorn)
Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match "uvicorn" -or $_.Name -match "python" -and $_.CommandLine -match "main:app" } | ForEach-Object { 
    Stop-Process -Id $_.ProcessId -Force 
    Write-Host "✅ Backend encerrado." -ForegroundColor Green
}

Write-Host "✨ Tudo limpo!" -ForegroundColor Green
