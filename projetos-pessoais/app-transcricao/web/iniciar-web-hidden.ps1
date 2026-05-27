param(
  [string]$WebDir
)

$ErrorActionPreference = 'Stop'
if (-not $WebDir) {
  $WebDir = Split-Path -Parent $MyInvocation.MyCommand.Path
}

$runtimeDir = Join-Path $WebDir '.runtime'
New-Item -ItemType Directory -Force -Path $runtimeDir | Out-Null

if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'ERRO: node nao encontrado no PATH.' }
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { throw 'ERRO: npm nao encontrado no PATH.' }
if (-not (Get-Command python -ErrorAction SilentlyContinue)) { throw 'ERRO: python nao encontrado no PATH.' }

if (-not (Test-Path (Join-Path $WebDir 'backend\main.py'))) { throw 'ERRO: backend\main.py nao encontrado.' }
if (-not (Test-Path (Join-Path $WebDir 'frontend\package.json'))) { throw 'ERRO: frontend\package.json nao encontrado.' }

$envLocal = Join-Path $WebDir 'frontend\.env.local'
if (-not (Test-Path $envLocal)) {
  Set-Content -Path $envLocal -Encoding utf8 -Value 'NEXT_PUBLIC_API_URL=http://localhost:8000'
}

$ports = @(8000,3000)
foreach ($port in $ports) {
  $pids = @(Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -Expand OwningProcess -Unique)
  foreach ($procId in $pids) {
    try { Stop-Process -Id $procId -Force -ErrorAction Stop } catch {}
  }
}

$pythonExe = 'python'
$venvPython = Join-Path $WebDir '..\.venv\Scripts\python.exe'
if (Test-Path $venvPython) { $pythonExe = $venvPython }

$backend = Start-Process -FilePath $pythonExe -ArgumentList @('-m','uvicorn','main:app','--reload','--host','127.0.0.1','--port','8000') -WorkingDirectory (Join-Path $WebDir 'backend') -WindowStyle Hidden -PassThru
Set-Content -Path (Join-Path $runtimeDir 'backend.pid') -Value $backend.Id

Start-Sleep -Seconds 2

$frontend = Start-Process -FilePath 'cmd.exe' -ArgumentList @('/c','npm run dev') -WorkingDirectory (Join-Path $WebDir 'frontend') -WindowStyle Hidden -PassThru
Set-Content -Path (Join-Path $runtimeDir 'frontend.pid') -Value $frontend.Id

Start-Sleep -Seconds 8
Start-Process 'http://localhost:3000' | Out-Null
Write-Output 'App iniciado.'
