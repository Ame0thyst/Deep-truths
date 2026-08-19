param (
    [string]$msg = "Auto-update Deep Truths"
)

# 1. Update Versi Cache di sw.js otomatis agar browser mendeteksi perubahan
Write-Host "Mendeteksi perubahan berkas dan memperbarui versi cache di sw.js..." -ForegroundColor Yellow
$swFile = "sw.js"
if (Test-Path $swFile) {
    $content = Get-Content $swFile -Raw
    # Mencari pola 'deep-truths-vX' dan menaikkan angka versi X
    if ($content -match "deep-truths-v(\d+)") {
        $oldVersion = $Matches[1]
        $newVersion = [int]$oldVersion + 1
        $content = $content -replace "deep-truths-v$oldVersion", "deep-truths-v$newVersion"
        Set-Content $swFile $content
        Write-Host "SUCCESS: Versi cache sw.js dinaikkan dari v$oldVersion ke v$newVersion" -ForegroundColor Green
    }
}

# 2. Push & Deploy ke Google Apps Script
Write-Host "Mengunggah backend ke Google Apps Script..." -ForegroundColor Cyan
clasp push -f
if ($LASTEXITCODE -eq 0) {
    Write-Host "Melakukan deploy release baru di Google Apps Script..." -ForegroundColor Cyan
    clasp deploy -i AKfycbygidUWlQ1ihBlOzWo24AOHHy3MCZz82oQmzrXSCrDYNq9qoOb5x7f8wR9QcenCJ-LMzA
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCCESS: Backend Google Apps Script berhasil diperbarui!" -ForegroundColor Green
    } else {
        Write-Warning "WARNING: Gagal melakukan deploy Apps Script."
    }
} else {
    Write-Warning "WARNING: Gagal melakukan clasp push."
}

# 3. Push ke GitHub Pages
Write-Host "Mengunggah frontend ke GitHub Pages..." -ForegroundColor Cyan
git add .
git commit -m $msg
git push
if ($LASTEXITCODE -eq 0) {
    Write-Host "SUCCESS: Repositori GitHub Pages berhasil diperbarui!" -ForegroundColor Green
    Write-Host "FINISH: Seluruh sistem Deep Truths selesai dideploy dan ter-update!" -ForegroundColor Yellow
} else {
    Write-Warning "WARNING: Gagal melakukan push ke GitHub."
}
