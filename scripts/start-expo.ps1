function Test-CommandExists {
    param($cmd)
    $null -ne (Get-Command $cmd -ErrorAction SilentlyContinue)
}

if (-not (Test-CommandExists node)) {
    Write-Error "Node is not installed. Run install-node-windows.ps1 first (as Administrator)."
    exit 1
}

Set-Location -Path (Resolve-Path (Join-Path $PSScriptRoot ".."))

Write-Host "Installing project dependencies (npm install)..." -ForegroundColor Cyan
& npm install
if ($LASTEXITCODE -ne 0) { Write-Error "npm install failed."; exit $LASTEXITCODE }

Write-Host "Starting Expo (npm start)..." -ForegroundColor Cyan
& npm start
