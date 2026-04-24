@echo off
REM ================================================================
REM build.bat — Génère KS_Production.exe avec PyInstaller
REM Double-cliquer pour lancer le build
REM ================================================================

echo.
echo ===================================
echo   BUILD KS Production Desktop
echo ===================================
echo.

REM Installer les dépendances si nécessaire
pip install -r requirements_desktop.txt

echo.
echo [1/2] Nettoyage des anciens builds...
rmdir /s /q build 2>nul
rmdir /s /q dist 2>nul
del KS_Production.spec 2>nul

echo.
echo [2/2] Génération du .exe...
pyinstaller ^
    --name "KS_Production" ^
    --windowed ^
    --onefile ^
    --icon "static\img\favicon.ico" ^
    --add-data "templates;templates" ^
    --add-data "static;static" ^
    --hidden-import "webview" ^
    --hidden-import "flask" ^
    --hidden-import "flask_sqlalchemy" ^
    --hidden-import "reportlab" ^
    --hidden-import "sqlalchemy" ^
    --hidden-import "werkzeug" ^
    main.py

echo.
echo ===================================
if exist "dist\KS_Production.exe" (
    echo   SUCCES ! Fichier cree :
    echo   dist\KS_Production.exe
) else (
    echo   ERREUR : Le build a echoue.
    echo   Verifiez les messages ci-dessus.
)
echo ===================================
echo.
pause
