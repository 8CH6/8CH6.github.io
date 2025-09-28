@echo off
cd /d %~dp0

:: 获取当前时间 (Windows 格式)
for /f "tokens=1-4 delims=/ " %%a in ('date /t') do (
    set mydate=%%a-%%b-%%c
)
for /f "tokens=1-2 delims=: " %%a in ('time /t') do (
    set mytime=%%a-%%b
)

:: 默认 commit message = 时间戳
set msg=Update on %mydate%_%mytime%

:: 允许用户输入自定义 commit message
set /p usermsg=Enter commit message (leave blank for default): 

if not "%usermsg%"=="" (
    set msg=%usermsg%
)

git add .
git commit -m "%msg%"
git push origin master

echo.
echo ==============================
echo   Pushed with message: %msg%
echo ==============================
pause
