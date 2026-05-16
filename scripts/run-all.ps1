Write-Host "Run-All: will try to install Node (if needed), start an AVD (optional), then install deps and start Expo." -ForegroundColor Cyan

function Run-ScriptIfExists($path) {
    if (Test-Path $path) {
        Write-Host "Running $path" -ForegroundColor Green
        & $path
        return $LASTEXITCODE
    } else {
        Write-Host "$path not found, skipping." -ForegroundColor Yellow
        return 0
    }
}

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition

# 1) Install node (may require admin)
$code = Run-ScriptIfExists (Join-Path $scriptRoot "install-node-windows.ps1")
if ($code -ne 0) {
    Write-Warning "Node installer reported an issue (exit code $code). You may need to complete installation manually or restart your terminal."
    $continue = Read-Host "Continue anyway? (y/N)"
    if ($continue -notmatch '^[Yy]') { Write-Host 'Aborting.'; exit $code }
}

# 2) Optional: start AVD
Write-Host "Would you like to start an Android emulator now? (y/N)" -ForegroundColor Cyan
$ans = Read-Host
if ($ans -match '^[Yy]') {
    Run-ScriptIfExists (Join-Path $scriptRoot "start-avd.ps1")
}

# 3) Install deps and start Expo
Run-ScriptIfExists (Join-Path $scriptRoot "start-expo.ps1")
