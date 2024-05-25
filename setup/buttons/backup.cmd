@echo off
setlocal enabledelayedexpansion

set "configFile=.\setup\config.txt"

set "installDir="
for /f "usebackq delims=" %%a in ("%configFile%") do (
    set "installDir=%%a"
)

for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set "datum_zeit=%%I"
set "aktuelles_datum=!datum_zeit:~0,4!-!datum_zeit:~4,2!-!datum_zeit:~6,2!_!datum_zeit:~8,2!-!datum_zeit:~10,2!-!datum_zeit:~12,2!"

set "source=%installDir%\BocchiBot\database"
set "config_source=%installDir%\BocchiBot\config.json"
set "backup_base_dir=%USERPROFILE%\Desktop\BocchiBot Backup"
set "backup_dir=%backup_base_dir%\Backup_%aktuelles_datum%"

mkdir "%backup_dir%" > nul 2>&1
xcopy /s /i /y "%source%" "%backup_dir%\database\" > nul 2>&1
copy /y "%config_source%" "%backup_dir%\config.json" > nul 2>&1
