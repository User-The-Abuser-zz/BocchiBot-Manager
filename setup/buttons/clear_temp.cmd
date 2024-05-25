@echo off
setlocal

set "configFile=.\setup\config.txt"

set "installDir="
for /f "usebackq delims=" %%a in ("%configFile%") do (
    set "installDir=%%a"
)

set "folder=%installDir%\BocchiBot\temp"
set "folder_video=%installDir%\BocchiBot\temp\video"
set "folder_audio=%installDir%\BocchiBot\temp\audio"

if exist "%folder%" (
    del /q /f "%folder%\*" > nul 2>&1
) 

if exist "%folder_video%" (
    del /q /f "%folder_video%\*" > nul 2>&1
) 

if exist "%folder_audio%" (
    del /q /f "%folder_audio%\*" > nul 2>&1
) 
