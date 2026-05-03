@echo off
echo.
echo ================================================
echo    KS Production - Build PyInstaller
echo ================================================
echo.

set PYINST=py -3.11 -m PyInstaller

REM Nettoyage
echo [1/4] Nettoyage...
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist
del /q *.spec 2>nul
echo OK

REM BUILD SERVEUR
echo.
echo [2/4] Build KS_Server.exe ...
%PYINST% main.py --name "KS_Server" --onefile --windowed --add-data "templates;templates" --add-data "static;static" --add-data "database.py;." --hidden-import "sqlalchemy.dialects.sqlite" --hidden-import "sqlalchemy.orm" --hidden-import "flask" --hidden-import "flask_sqlalchemy" --hidden-import "werkzeug" --hidden-import "jinja2" --hidden-import "reportlab" --hidden-import "webview" --hidden-import "webview.platforms.winforms" --collect-all "webview" --collect-all "weasyprint" --collect-all "reportlab" --noconfirm

if %ERRORLEVEL% NEQ 0 (
    echo ERREUR Build Serveur!
    pause
    exit /b 1
)
echo KS_Server.exe OK

REM BUILD CLIENT
echo.
echo [3/4] Build KS_Client.exe ...
%PYINST% client.py --name "KS_Client" --onefile --windowed --add-data "static;static" --hidden-import "webview" --hidden-import "webview.platforms.winforms" --collect-all "webview" --noconfirm

if %ERRORLEVEL% NEQ 0 (
    echo ERREUR Build Client!
    pause
    exit /b 1
)
echo KS_Client.exe OK

REM ORGANISATION
echo.
echo [4/4] Organisation...

if not exist "dist\KS_Production_Server" mkdir "dist\KS_Production_Server"
copy "dist\KS_Server.exe" "dist\KS_Production_Server\" > nul

if not exist "dist\KS_Production_Client" mkdir "dist\KS_Production_Client"
copy "dist\KS_Client.exe" "dist\KS_Production_Client\" > nul
copy "server_config.ini" "dist\KS_Production_Client\" > nul

echo.
echo ================================================
echo  BUILD TERMINE !
echo  dist\KS_Production_Server\KS_Server.exe
echo  dist\KS_Production_Client\KS_Client.exe
echo ================================================
echo.
pause
