@echo off
echo Installing Chrome...
npx puppeteer browsers install chrome
echo.
echo Installing dependencies...
npm install
echo.
echo All fixed! Run START.bat
pause