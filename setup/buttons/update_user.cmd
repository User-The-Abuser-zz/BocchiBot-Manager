@echo off
setlocal

:check_choco
where choco >nul 2>nul
if %errorlevel% neq 0 (
    start .\setup\chocolatey-2.2.2.0.msi
    timeout /t 1 /nobreak >nul
    goto check_choco
)

:check_git
where git >nul 2>nul
if %errorlevel% neq 0 (
    if exist "%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" (
        powershell -Command "Start-Process 'cmd' -Verb RunAs -ArgumentList '/c choco install git -y'"
    ) else (
        runas /user:Administrator "cmd /c choco install git -y"
    )
    timeout /t 1 /nobreak >nul
    goto check_git
)

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

set "repoPath=https://github.com/User-The-Abuser/BocchiBot-Manager"

set "versionPath=https://raw.githubusercontent.com/User-The-Abuser/BocchiBot-Manager/main/setup/user/version.txt"

set "tempDir=%~dp0\repo_clone"

set "tempFile=%~dp0\latestversion.tmp"

certutil -urlcache -split -f "%versionPath%" "%tempFile%" >nul

set "latestversion="
< "%tempFile%" set /p latestversion=

del "%tempFile%" >nul 2>&1

echo Installed Version: %version%
echo Latest Version: %latestversion%
echo.
echo Please restart your PC before updating BocchiBot by User! Do you want to continue? (Y/N)

choice /c yn /n >nul

if errorlevel 2 (
    echo The script will exit.
    pause
    exit /b
)

echo Installing Update...
git clone "%repoPath%" "%tempDir%" >nul

set "database=%tempDir%\setup\user\database"
set "configjson=%tempDir%\setup\user\config.json"
rmdir /s /q %database%
del %configjson%

xcopy /E /I /Y /S /H "%tempDir%\setup\user\*" "%bocchiDir%"

rmdir /s /q "%tempDir%" >nul

set "version="
for /f "usebackq delims=" %%a in ("%versionFile%") do (
    set "version=%%a"
)

cd %bocchiDir%
npm update

echo Update complete!
echo Installed Version: %version%
echo Latest Version: %latestversion%

pause
