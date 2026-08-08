# start.ps1 — start TailorSent Ops + Cloudflare Tunnel
# Usage: .\start.ps1                    (quick tunnel, random URL)
#        .\start.ps1 -Tunnel tailor-sent-ops   (named tunnel, requires setup)

param(
    [string]$Tunnel = "",
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

if (-not $SkipBuild) {
    Write-Host "Building Next.js..." -ForegroundColor Cyan
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Build failed" }
}

Write-Host "Starting Next.js server on port 3000..." -ForegroundColor Green
$nextProcess = Start-Process -FilePath "npm" -ArgumentList "start" -PassThru -NoNewWindow

Start-Sleep -Seconds 4

try {
    if ($Tunnel) {
        Write-Host "Starting named Cloudflare Tunnel: $Tunnel" -ForegroundColor Yellow
        Write-Host "Configure hostname in ~/.cloudflared/config.yml" -ForegroundColor DarkGray
        cloudflared tunnel run $Tunnel
    } else {
        Write-Host "Starting Cloudflare quick tunnel (random *.trycloudflare.com URL)..." -ForegroundColor Yellow
        Write-Host "For a stable domain, run: .\start.ps1 -Tunnel <name>" -ForegroundColor DarkGray
        cloudflared tunnel --url http://localhost:3000
    }
} finally {
    Write-Host "`nShutting down Next.js..." -ForegroundColor Cyan
    if ($nextProcess -and -not $nextProcess.HasExited) {
        Stop-Process -Id $nextProcess.Id -Force -ErrorAction SilentlyContinue
    }
    # Kill any orphaned node/next processes on port 3000
    Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue |
        ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
}
