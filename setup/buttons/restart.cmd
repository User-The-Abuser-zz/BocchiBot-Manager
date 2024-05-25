@echo off
setlocal

set "configFile=.\setup\config.txt"

set "installDir="
for /f "usebackq delims=" %%a in ("%configFile%") do (
    set "installDir=%%a"
)

if exist "%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" (
    START /MIN powershell -Command "Start-Process 'cmd' -Verb RunAs -ArgumentList '/c pm2 delete index && mode con: cols=200 lines=200 && cd /d %installDir%\BocchiBot && pm2 start index && pm2 monit'"
) else (
    runas /user:Administrator "START /MIN cmd /c pm2 delete index && mode con: cols=200 lines=200 && cd /d %installDir%\BocchiBot && pm2 start index && pm2 monit"
)
