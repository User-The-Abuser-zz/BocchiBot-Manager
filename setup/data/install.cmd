@echo off
setlocal

set "configFile=%~dp0\config.txt"

set "installDir="
for /f "usebackq delims=" %%a in ("%configFile%") do (
    set "installDir=%%a"
)

choco list --local-only ffmpeg | findstr /C:"1 packages installed" > nul
if errorlevel 1 (
    echo ffmpeg is not installed, starting the installation...
    choco install ffmpeg -y
)

npm list -g --depth=0 | findstr /C:"pm2" > nul
if errorlevel 1 (
    echo pm2 is not installed, starting the installation...
    npm install -g pm2
)

cd %installDir%
git clone https://github.com/tesseract-ocr/tesseract

cd %installDir%\BocchiBot
setx /m PATH "C:\ProgramData\chocolatey\bin;%PATH%"
setx /m PATH "%installDir%\tesseract;%PATH%"

if exist "%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" (
    powershell -Command "Start-Process 'cmd' -Verb RunAs -ArgumentList '/c cd %installDir%\BocchiBot && npm install && del "%installDir%\install.cmd" && del "%installDir%\config.txt" && echo Installation complete! && pause'"
) else (
    runas /user:Administrator "cmd /c cd %installDir%\BocchiBot && npm install && del "%installDir%\install.cmd" && del "%installDir%\config.txt" && echo Installation complete! && pause"
)
