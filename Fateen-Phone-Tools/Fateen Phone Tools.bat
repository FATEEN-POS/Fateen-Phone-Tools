@echo off
cd /d "%~dp0"
where node >nul 2>nul || (echo Node.js is not installed: https://nodejs.org & pause & exit /b)
if not exist "node_modules\ws" (
  echo Installing packages, this can take a minute...
  call npm install
  if not exist "node_modules\ws" (
    echo Full install failed, retrying without optional packages...
    call npm install --omit=optional
  )
)
if not exist "node_modules\ws" (
  echo.
  echo [X] Could not install the required packages. Read the error above and send it to Claude.
  pause & exit /b
)
if not exist "node_modules\@nut-tree-fork" echo Note: Link Pad mouse and keyboard need nut-js. Later run: npm install @nut-tree-fork/nut-js
node server.js
pause
