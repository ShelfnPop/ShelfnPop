@echo off
setlocal

cd /d "%~dp0"

set "CODEX_NODE=C:\Users\mplat\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin"
set "CODEX_BIN=C:\Users\mplat\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin"
set "PATH=%CODEX_NODE%;%CODEX_BIN%;%PATH%"

echo.
echo Deploying Shelf-n-Pop web production...
echo This rebuilds the web app first so Expo does not reuse an old export.
echo.

echo Building fresh web bundle...
call .\node_modules\.bin\expo.cmd export -p web --clear
if errorlevel 1 goto deploy_failed

echo.
echo Publishing fresh bundle...
call .\node_modules\.bin\eas.cmd deploy --prod
if errorlevel 1 goto deploy_failed

echo.
echo Done. Open https://shelf-n-pop.expo.app and look for Shelf-n-Pop v4.0.0.
pause
exit /b 0

:deploy_failed
echo.
echo Deployment failed. Send Codex the error above and we will fix it.
pause
exit /b 1
