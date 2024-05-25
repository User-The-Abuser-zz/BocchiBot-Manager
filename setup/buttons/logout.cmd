@echo off
setlocal

set "configFile=.\setup\config.txt"

set "installDir="
for /f "usebackq delims=" %%a in ("%configFile%") do (
    set "installDir=%%a"
)

echo Please use "Force Stop" before logout BocchiBot WhatsApp session! Do you want to continue? (Y/N)
choice /c yn /n >nul

if errorlevel 2 (
    echo The script will exit.
    pause
    exit /b
)

if exist "%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" (
    powershell -Command "Start-Process 'cmd' -Verb RunAs -ArgumentList '/c rmdir /s /q %installDir%\BocchiBot\_IGNORE_BocchiBot'"
) else (
    runas /user:Administrator "cmd /c rmdir /s /q %installDir%\BocchiBot\_IGNORE_BocchiBot"
)
