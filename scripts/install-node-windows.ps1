Param(
    [switch]$Force
)

function Test-CommandExists {
    param($cmd)
    $null -ne (Get-Command $cmd -ErrorAction SilentlyContinue)
}

if (Test-CommandExists node -and -not $Force) {
    Write-Host ('Node is already installed: ' + (node -v))
    exit 0
}

Write-Host 'Installing Node.js (LTS). This script will try winget, then choco, then fallback to MSI download.' -ForegroundColor Cyan

if (Test-CommandExists winget) {
    Write-Host 'Using winget to install Node.js LTS...' -ForegroundColor Green
    Start-Process -FilePath "winget" -ArgumentList "install -e --id OpenJS.NodeJS.LTS" -NoNewWindow -Wait
} elseif (Test-CommandExists choco) {
    Write-Host 'Using Chocolatey to install Node.js LTS...' -ForegroundColor Green
    Start-Process -FilePath "choco" -ArgumentList "install nodejs-lts -y" -NoNewWindow -Wait
} else {
    Write-Host 'No winget/choco found - downloading Node.js LTS MSI...' -ForegroundColor Yellow
    try {
        $index = Invoke-RestMethod -Uri "https://nodejs.org/dist/index.json" -UseBasicParsing
        $latestLts = $index | Where-Object { $_.lts } | Select-Object -First 1
        if (-not $latestLts) { throw "Could not determine latest LTS version." }
        $version = $latestLts.version
        $msiName = "node-$version-x64.msi"
        $msiUrl = "https://nodejs.org/dist/$version/$msiName"
        $msiPath = Join-Path $env:TEMP $msiName

        Write-Host ('Downloading ' + $msiUrl) -ForegroundColor Green
        Invoke-WebRequest -Uri $msiUrl -OutFile $msiPath -UseBasicParsing

        Write-Host 'Running MSI installer (requires admin). An installer window should open; follow prompts to complete installation.' -ForegroundColor Green
        Start-Process -FilePath $msiPath -Wait
    } catch {
        Write-Error ("Automatic download/install failed: " + $_)
        Write-Host 'Please install Node.js manually from https://nodejs.org/en/download/' -ForegroundColor Red
        exit 1
    }
}

# Verify install
Start-Sleep -Seconds 2
if (Test-CommandExists node) {
    Write-Host ('Node installed: ' + (node -v)) -ForegroundColor Green
    Write-Host ('npm version: ' + (npm -v)) -ForegroundColor Green
    Write-Host 'You may need to restart your terminal session for PATH changes to take effect.' -ForegroundColor Yellow
    exit 0
} else {
    Write-Warning 'Node was not detected on PATH. Attempting to locate installed node.exe in common locations...'

    $candidateDirs = @(
        'C:\\Program Files\\nodejs',
        "$env:ProgramFiles\\nodejs",
        "$env:ProgramFiles(x86)\\nodejs",
        "$env:LOCALAPPDATA\\Programs\\nodejs",
        "$env:USERPROFILE\\AppData\\Local\\Programs\\nodejs"
    ) | Where-Object { $_ -and (Test-Path $_) }

    $found = $null
    foreach ($d in $candidateDirs) {
        $nodePath = Join-Path $d 'node.exe'
        if (Test-Path $nodePath) { $found = $d; break }
    }

    if (-not $found) {
        # try locating anywhere under Program Files and LocalAppData (limited depth)
        $searchRoots = @($env:ProgramFiles, $env:LOCALAPPDATA)
        foreach ($root in $searchRoots) {
            if (-not (Test-Path $root)) { continue }
            try {
                $hit = Get-ChildItem -Path $root -Filter node.exe -Recurse -ErrorAction SilentlyContinue -Depth 3 | Select-Object -First 1
                if ($hit) { $found = $hit.DirectoryName; break }
            } catch { }
        }
    }

    if ($found) {
        Write-Host ('Found node at: ' + $found) -ForegroundColor Green
        # Add to user PATH if not already present
        $userPath = [Environment]::GetEnvironmentVariable('Path','User')
        if (-not $userPath) { $userPath = '' }
        if ($userPath -notlike "*${found}*") {
            $newPath = $userPath.TrimEnd(';') + ';' + $found
            try {
                [Environment]::SetEnvironmentVariable('Path', $newPath, 'User')
                Write-Host 'Added node install folder to user PATH. Restart your terminal to pick up the change.' -ForegroundColor Yellow
                exit 0
            } catch {
                Write-Warning 'Failed to update user PATH automatically. Please add "' + $found + '" to your PATH manually and restart the terminal.'
                exit 2
            }
        } else {
            Write-Host 'Node folder already present in user PATH.' -ForegroundColor Green
            exit 0
        }
    } else {
        Write-Error 'Node was not detected after install. Restart terminal and try again, or install manually: https://nodejs.org/en/download/'
        exit 2
    }
}
