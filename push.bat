@echo off
cd /d %~dp0

:: 获取当前时间作为默认 commit message
for /f "tokens=1-3 delims=/" %%a in ('date /t') do set mydate=%%c-%%a-%%b
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set mytime=%%a-%%b
set msg=Update on %mydate%_%mytime%

:: 用户可输入自定义 commit message
set /p usermsg=Enter commit message (leave blank for default): 
if not "%usermsg%"=="" (
    set msg=%usermsg%
)

:: 提交代码
git add .
git commit -m "%msg%"

echo.
echo ==============================
echo   Starting push...
echo ==============================

:: 首先尝试 SSH 推送
git push git@github.com:8CH6/8CH6.github.io.git main
if %errorlevel%==0 (
    echo.
    echo ✅ Push success via SSH!
    echo ==============================
    echo   Commit message: %msg%
    echo ==============================
    pause
    exit /b 0
)

:: 如果 SSH 推送失败，再尝试 HTTPS 推送
echo.
echo ❌ SSH push failed, trying HTTPS...
git push https://github.com/8CH6/8CH6.github.io.git main
if %errorlevel%==0 (
    echo.
    echo ✅ Push success via HTTPS!
    echo ==============================
    echo   Commit message: %msg%
    echo ==============================
) else (
    echo.
    echo ❌ Push failed via both SSH and HTTPS.
    echo 请检查网络、GitHub 账号/Token 或 VPN.
)

pause
