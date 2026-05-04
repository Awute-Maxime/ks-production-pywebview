@echo off
echo.
echo ================================================
echo    KS Production - Build PyInstaller
echo ================================================
echo.

set PYINST=py -3.11 -m PyInstaller

REM Nettoyage (build temp seulement, on garde les specs)
echo [1/4] Nettoyage...
if exist build_tmp rmdir /s /q build_tmp
if exist dist rmdir /s /q dist
echo OK

REM BUILD SERVEUR (utilise KS_Server.spec qui contient icone + options)
echo.
echo [2/4] Build KS_Server.exe ...
%PYINST% KS_Server.spec --distpath dist --workpath build_tmp --noconfirm

if %ERRORLEVEL% NEQ 0 (
    echo ERREUR Build Serveur!
    pause
    exit /b 1
)
echo KS_Server.exe OK

REM BUILD CLIENT
echo.
echo [3/4] Build KS_Client.exe ...
%PYINST% KS_Client.spec --distpath dist --workpath build_tmp --noconfirm

if %ERRORLEVEL% NEQ 0 (
    echo ERREUR Build Client!
    pause
    exit /b 1
)
echo KS_Client.exe OK

REM ORGANISATION : deplace vers sous-dossiers, supprime les doublons
echo.
echo [4/4] Organisation...

if not exist "dist\KS_Production_Server" mkdir "dist\KS_Production_Server"
copy "dist\KS_Server.exe" "dist\KS_Production_Server\" > nul
del /q "dist\KS_Server.exe"

if not exist "dist\KS_Production_Client" mkdir "dist\KS_Production_Client"
copy "dist\KS_Client.exe" "dist\KS_Production_Client\" > nul
copy "server_config.ini" "dist\KS_Production_Client\" > nul
del /q "dist\KS_Client.exe"

REM Supprimer les dossiers data parasites crees par PyInstaller
if exist "dist\data" rmdir /s /q "dist\data"

echo.
echo ================================================
echo  BUILD TERMINE !
echo  dist\KS_Production_Server\KS_Server.exe
echo  dist\KS_Production_Client\KS_Client.exe
echo ================================================
echo.
pause
