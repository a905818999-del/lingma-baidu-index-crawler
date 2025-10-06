@echo off
TITLE 百度指数数据抓取工具 - 一键启动脚本
COLOR 0A

echo ==================================================
echo        百度指数数据抓取工具 - 一键启动脚本
echo ==================================================
echo.

echo 检查系统环境...
echo.

REM 检查 Node.js 是否安装
echo 正在检查 Node.js 环境...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未检测到 Node.js
    echo    请先安装 Node.js (版本 12+)
    echo    访问 https://nodejs.org 下载并安装
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Node.js 已安装
    node --version
)

echo.
REM 检查 npm 是否可用
echo 正在检查 npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未检测到 npm
    echo    请确保已正确安装 Node.js
    echo.
    pause
    exit /b 1
) else (
    echo ✅ npm 已安装
    npm --version
)

echo.
echo 正在安装项目依赖...
echo 这可能需要几分钟时间，请耐心等待...
echo.
npm install
if %errorlevel% neq 0 (
    echo ❌ 错误: 依赖安装失败
    echo    请检查网络连接或手动运行 "npm install"
    echo.
    pause
    exit /b 1
) else (
    echo ✅ 依赖安装完成
)

echo.
echo 正在安装 Playwright Firefox 浏览器...
echo.
npx playwright install firefox
if %errorlevel% neq 0 (
    echo ⚠️  警告: Playwright 浏览器安装可能存在问题
    echo    您可以稍后手动运行 "npx playwright install firefox"
    echo.
) else (
    echo ✅ Playwright Firefox 浏览器安装完成
)

echo.
echo ==================================================
echo 准备启动服务器...
echo ==================================================
echo.
echo 服务器即将在 http://localhost:3000 上运行
echo.
echo 请在浏览器中访问 http://localhost:3000 使用应用
echo.
echo 按任意键启动服务器...
pause >nul

echo.
echo 启动服务器...
echo 按 Ctrl+C 可以停止服务器
echo.
npm start

echo.
echo 脚本执行完成
pause