@echo off
cd /d %~dp0\frontend\trading_system
call npm install
call npm run serve
