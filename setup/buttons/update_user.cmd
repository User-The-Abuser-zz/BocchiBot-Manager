@echo off
setlocal

set "configFile=.\setup\config.txt"

set "installDir="
for /f "usebackq delims=" %%a in ("%configFile%") do (
    set "installDir=%%a"
)

set "bocchiDir=%installDir%\BocchiBot"

set "versionFile=%installDir%\BocchiBot\version.txt"

set "version="
for /f "usebackq delims=" %%a in ("%versionFile%") do (
    set "version=%%a"
)

set "currentversionFile=.\setup\user\version.txt"

set "currentversion="
for /f "usebackq delims=" %%a in ("%currentversionFile%") do (
    set "currentversion=%%a"
)

set "updateDir=.\setup\update"

echo Installed Version: %version%
echo Current Version: %currentversion%
echo.
echo Please use "Force Stop PM2" before updating BocchiBot by User! Do you want to continue? (Y/N)

choice /c yn /n >nul

if errorlevel 2 (
    echo The script will exit.
    pause
    exit /b
)

echo Installing Update...
xcopy /E /I /Y /S /H "%updateDir%\*" "%bocchiDir%"

echo Update complete!
pause