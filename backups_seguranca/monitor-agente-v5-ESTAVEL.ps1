# Monitor de Serviços - Ativo Real (v5 - Resposta Automática)
# Este script evita processos travados e gera um arquivo de status para o chat ler.

$WEB_PORT = 4200
$API_PORT = 8000
$BASE_DIR = "C:\Users\User\aqkin\aqkin"
$STATUS_FILE = "$BASE_DIR\scripts\agente-status.json"

function Update-Status {
    param($WebStatus, $ApiStatus, $Details)
    $w = if ($WebStatus) { "ONLINE" } else { "OFFLINE" }
    $a = if ($ApiStatus) { "ONLINE" } else { "OFFLINE" }
    $status = @{
        lastUpdate = (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
        web = $w
        api = $a
        message = $Details
    }
    $status | ConvertTo-Json | Out-File -FilePath $STATUS_FILE -Encoding utf8
}

# Verifica duplicidade
$currentPid = [System.Diagnostics.Process]::GetCurrentProcess().Id
$others = Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match "monitor-agente.ps1" -and $_.ProcessId -ne $currentPid }
if ($others) { exit }

Write-Host "🟢 Agente Monitor v5 Iniciado."

while ($true) {
    $webPort = Get-NetTCPConnection -LocalPort $WEB_PORT -ErrorAction SilentlyContinue | Where-Object { $_.State -eq "Listen" }
    $apiPort = Get-NetTCPConnection -LocalPort $API_PORT -ErrorAction SilentlyContinue | Where-Object { $_.State -eq "Listen" }
    
    $webProc = Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match "nx serve" -and $_.ProcessId -ne $currentPid }
    $apiProc = Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match "uvicorn" -and $_.ProcessId -ne $currentPid }

    $msg = "Aguardando novas instruções. Tudo operando conforme o planejado."

    # Se a porta está offline mas o processo existe -> ESTÁ TRAVADO
    if (-not $webPort -and $webProc) {
        $msg = "Detectado Frontend travado. Reiniciando para não te deixar sem resposta..."
        $webProc | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
    }
    
    if (-not $apiPort -and $apiProc) {
        $msg = "Detectado Backend travado. Reiniciando para garantir a fluidez..."
        $apiProc | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
    }

    # Reinício pro-ativo
    if (-not $webPort -and -not $webProc) {
        Start-Process pwsh -ArgumentList "-Command", "cd $BASE_DIR; npx nx serve web" -WindowStyle Hidden
        $msg = "Frontend iniciado."
    }
    
    if (-not $apiPort -and -not $apiProc) {
        Start-Process pwsh -ArgumentList "-Command", "cd $BASE_DIR\apps\api; python -m uvicorn main:app --port 8000" -WindowStyle Hidden
        $msg = "Backend iniciado."
    }

    Update-Status -WebStatus ($webPort -ne $null) -ApiStatus ($apiPort -ne $null) -Details $msg
    Start-Sleep -Seconds 20
}




