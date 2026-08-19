Write-Host "Starting deployment to Google Apps Script..." -ForegroundColor Cyan
clasp push
if ($LASTEXITCODE -eq 0) {
    Write-Host "Deployment successful!" -ForegroundColor Green
} else {
    Write-Host "Deployment failed with exit code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}
