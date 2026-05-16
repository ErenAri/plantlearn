function Test-CommandExists {
    param($cmd)
    $null -ne (Get-Command $cmd -ErrorAction SilentlyContinue)
}

$sdkRoot = $Env:ANDROID_SDK_ROOT
if (-not $sdkRoot) { $sdkRoot = $Env:ANDROID_HOME }

if (-not $sdkRoot) {
    Write-Error "ANDROID_SDK_ROOT or ANDROID_HOME not set. Set the Android SDK path and retry. Example: setx ANDROID_SDK_ROOT 'C:\\Users\\<you>\\AppData\\Local\\Android\\Sdk'"
    exit 1
}

$emulatorPath = Join-Path $sdkRoot "emulator\emulator.exe"
if (-not (Test-Path $emulatorPath)) {
    Write-Error "emulator.exe not found at $emulatorPath. Ensure Android SDK 'emulator' component is installed.";
    exit 2
}

Write-Host "Available AVDs:" -ForegroundColor Cyan
& "$emulatorPath" -list-avds | ForEach-Object { Write-Host $_ }

$avd = Read-Host "Enter AVD name to start (or press Enter to cancel)"
if ([string]::IsNullOrWhiteSpace($avd)) { Write-Host "Cancelled"; exit 0 }

Write-Host "Starting AVD: $avd ..." -ForegroundColor Cyan
Start-Process -FilePath $emulatorPath -ArgumentList "-avd `"$avd`"" -NoNewWindow

Write-Host "AVD start command issued. It can take some time for the emulator to boot." -ForegroundColor Yellow
