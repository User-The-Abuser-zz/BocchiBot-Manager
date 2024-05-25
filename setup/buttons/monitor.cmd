@echo off
if exist "%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" (
    START /MIN powershell -Command "Start-Process 'cmd' -Verb RunAs -ArgumentList '/c mode con: cols=200 lines=200 && pm2 monit'"
) else (
    runas /user:Administrator "START /MIN cmd /c mode con: cols=200 lines=50 && pm2 monit"
)
