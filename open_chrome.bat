@echo off
cd /d "%~dp0"
start chrome "%~dp0frontend\index.html" || start "" "%~dp0frontend\index.html"
exit
