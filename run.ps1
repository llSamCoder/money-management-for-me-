Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  SAMEER'S MONEY MANAGER" -ForegroundColor Yellow
Write-Host "  Personal Finance Control Center" -ForegroundColor White
Write-Host "  'Your Money. Your Control. Your Future.'" -ForegroundColor Yellow
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Launching Sameer's Wealth Terminal..." -ForegroundColor Green

Set-Location $PSScriptRoot
Start-Process "http://localhost:8000"
python backend\server.py
