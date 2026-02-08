# Monitor de Serviços - Ativo Real (Versão SEGURA - Sem Loop de Janelas)
# Este script gerencia o Frontend e Backend sem abrir múltiplas janelas.

$WEB_PORT = 4200
$API_PORT = 8000
$BASE_DIR = "C:\Users\User\aqkin\aqkin"

# Verifica se já existe OUTRA instância deste script rodando para evitar duplicidade
$currentPid = [System.Diagnostics.Process]::GetCurrentProcess().Id
$others = Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match "monitor-agente.ps1" -and $_.ProcessId -ne $currentPid }
if ($others) {
    Write-Host "⚠️ Já existe um monitor rodando. Encerrando esta instância." -ForegroundColor Red
    exit
}

function Watch-Service {
    param($Name, $Port, $Command, $WorkDir, $Tag)
    
    # 1. Verifica se a porta está em uso (o serviço está rodando)
    $activePort = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Where-Object { $_.State -eq "Listen" }
    
    # 2. Verifica se o processo específico já existe pelo comando/tag para evitar abrir 2x o mesmo
    $activeProc = Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match $Tag -and $_.ProcessId -ne $currentPid }

    if (-not $activePort -and -not $activeProc) {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] 🚀 $Name não detectado. Iniciando..." -ForegroundColor Yellow
        
        # Inicia MINIMIZADO e sem criar nova janela persistente que cause loop
        Start-Process pwsh -ArgumentList "-Command", "cd $WorkDir; $Command" -WindowStyle Hidden
    }
}

Write-Host "==========================================" -ForegroundColor Green
Write-Host "   AGENTE CLI MONITOR v3 (SILENCIOSO)" -ForegroundColor Green
Write-Host "   Monitorando Web ($WEB_PORT) e API ($API_PORT)" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

while ($true) {
    # Monitorar Frontend (Vite/Nx)
    Watch-Service -Name "Frontend" -Port $WEB_PORT -Command "npx nx serve web" -WorkDir $BASE_DIR -Tag "nx serve"
    
    # Monitorar Backend (Uvicorn)
    Watch-Service -Name "Backend" -Port $API_PORT -Command "uvicorn main:app --port 8000" -WorkDir "$BASE_DIR\apps\api" -Tag "uvicorn"
    
    Start-Sleep -Seconds 30
}


