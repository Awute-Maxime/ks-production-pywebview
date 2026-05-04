@echo off
echo ========================================
echo  KS Production - Build Installers
echo ========================================

set ISCC="C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
if not exist %ISCC% set ISCC="C:\Program Files\Inno Setup 6\ISCC.exe"

if not exist %ISCC% (
    echo ERREUR: Inno Setup 6 non trouve.
    echo Installez-le depuis jrsoftware.org/isdl.php
    pause
    exit /b 1
)

if not exist "dist\KS_Production_Server\KS_Server.exe" (
    echo ERREUR: KS_Server.exe non trouve. Lancez build.bat d'abord.
    pause
    exit /b 1
)

if not exist "dist\KS_Production_Client\KS_Client.exe" (
    echo ERREUR: KS_Client.exe non trouve. Lancez build.bat d'abord.
    pause
    exit /b 1
)

mkdir installer_output 2>nul

echo.
echo [1/2] Compilation installeur Serveur...
%ISCC% KS_Server_Setup.iss
if errorlevel 1 ( echo ERREUR installeur serveur & pause & exit /b 1 )

echo.
echo [2/2] Compilation installeur Client...
%ISCC% KS_Client_Setup.iss
if errorlevel 1 ( echo ERREUR installeur client & pause & exit /b 1 )

echo.
echo ========================================
echo  SUCCES ! Installeurs generes dans :
echo  installer_output\KS_Server_Setup.exe
echo  installer_output\KS_Client_Setup.exe
echo ========================================
pause
