@echo off
if exist "%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" (
    START /MIN powershell -Command "Start-Process 'cmd' -Verb RunAs -ArgumentList '/c pm2 kill'"
) else (
    runas /user:Administrator "START /MIN cmd /c pm2 kill"
)
