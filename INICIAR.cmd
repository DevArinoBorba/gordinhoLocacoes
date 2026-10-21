@echo off
setlocal
cd /d "%~dp0"
set "RENTAL_NODE=C:\Program Files\nodejs\node.exe"
if not exist "%RENTAL_NODE%" set "RENTAL_NODE=node"
"%RENTAL_NODE%" scripts/start-local.mjs
pause
