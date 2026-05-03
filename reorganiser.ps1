# Script de réorganisation KS Production
# Lance depuis PowerShell dans le dossier du projet

Write-Host "Reorganisation du projet KS Production..." -ForegroundColor Cyan

# 1. Creer les dossiers
New-Item -ItemType Directory -Force -Path "templates" | Out-Null
New-Item -ItemType Directory -Force -Path "static\uploads" | Out-Null
New-Item -ItemType Directory -Force -Path "static\img" | Out-Null
Write-Host "✅ Dossiers crees"

# 2. Deplacer les fichiers HTML vers templates/
Get-ChildItem -Filter "*.html" | Move-Item -Destination "templates\" -Force
Write-Host "✅ HTML deplaces vers templates/"

# 3. Deplacer les images PNG vers static/img/
Get-ChildItem -Filter "*.png" | Move-Item -Destination "static\img\" -Force
Write-Host "✅ PNG deplaces vers static/img/"

# 4. Deplacer les uploads si existants
if (Test-Path "uploads") {
    Get-ChildItem "uploads\*" | Move-Item -Destination "static\uploads\" -Force
    Remove-Item "uploads" -Force -Recurse
    Write-Host "✅ uploads deplaces vers static/uploads/"
}

Write-Host ""
Write-Host "Reorganisation terminee !" -ForegroundColor Green
Write-Host "Structure :"
Write-Host "  templates/ -> fichiers HTML"
Write-Host "  static/img/ -> images PNG"
Write-Host "  static/uploads/ -> logos et fichiers"
