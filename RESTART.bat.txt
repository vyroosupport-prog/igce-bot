@echo off
echo Restarting bot...
taskkill /F /IM node.exe
timeout /t 3
npm start
pause