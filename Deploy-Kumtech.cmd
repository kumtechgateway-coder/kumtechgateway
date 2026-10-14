@echo off
setlocal
cd /d "%~dp0"

echo.
echo Kumtech Gateway Projects deployment
echo Project: kumtechgateway-237
echo.

call npx --yes firebase-tools login
if errorlevel 1 (
  echo.
  echo Firebase login did not complete. No website changes were deployed.
  pause
  exit /b 1
)

call npx --yes firebase-tools deploy --only hosting --project kumtechgateway-237
if errorlevel 1 (
  echo.
  echo Deployment failed. The existing live website remains unchanged.
  pause
  exit /b 1
)

echo.
echo Deployment complete: https://kumtechgateway.com
pause
endlocal
