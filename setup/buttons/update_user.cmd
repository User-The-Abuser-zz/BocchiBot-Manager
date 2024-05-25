@echo off
setlocal

set "configFile=.\setup\config.txt"

set "installDir="
for /f "usebackq delims=" %%a in ("%configFile%") do (
    set "installDir=%%a"
)

set "versionFile=%installDir%\BocchiBot\version.txt"

set "version=N/A"
if exist "%versionFile%" (
    for /f "usebackq delims=" %%a in ("%versionFile%") do (
        set "version=%%a"
    )
)

set "latestversionFile=.\setup\user\version.txt"

set "latestversion=N/A"
if exist "%latestversionFile%" (
    for /f "usebackq delims=" %%a in ("%latestversionFile%") do (
        set "latestversion=%%a"
    )
)

set "bocchiDir=%installDir%\BocchiBot"
set "updateDir=.\setup\update"

echo Installed Version: %version%
echo Latest Version: %latestversion%
echo.
echo Please use "Force Stop PM2" before updating BocchiBot by User! Do you want to continue? (Y/N)

choice /c yn /n >nul

if errorlevel 2 (
    echo The script will exit.
    pause
    exit /b
)

if exist "%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" (
    powershell -Command "Start-Process 'cmd' -Verb RunAs -ArgumentList 'echo Installing Update... && /c xcopy /E /I /Y /S /H "%updateDir%\*" "%bocchiDir%" && npm update && echo Update complete! && pause'"
) else (
    runas /user:Administrator "cmd /c echo Installing Update... && xcopy /E /I /Y /S /H "%updateDir%\*" "%bocchiDir%" && npm update && echo Update complete! && pause"
)
