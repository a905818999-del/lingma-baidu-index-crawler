@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
TITLE 百度指数数据抓取工具 - 一键启动脚本
COLOR 0A

REM 获取脚本所在目录的完整路径
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

REM 检查是否具有管理员权限
net session >nul 2>&1
if !errorlevel! neq 0 (
    echo [%date% %time%] 需要管理员权限运行此脚本
    echo 正在请求管理员权限...
    
    REM 创建临时VBS脚本来请求管理员权限
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    echo UAC.ShellExecute "%~s0", "", "", "runas", 1 >> "%temp%\getadmin.vbs"
    "%temp%\getadmin.vbs"
    del "%temp%\getadmin.vbs"
    exit /b
)

echo ==================================================
echo        百度指数数据抓取工具 - 一键启动脚本
echo ==================================================
echo.

echo [%date% %time%] 开始执行脚本...
echo.
echo [1/6] 检查系统环境...
echo.

REM 刷新环境变量
call :RefreshEnvVars

REM 检查 Node.js 是否安装
echo [%date% %time%] 正在检查 Node.js 环境...
set NODE_FOUND=0
set NODE_VERSION=

REM 多种方式检测 Node.js
where node >nul 2>&1
if !errorlevel! equ 0 (
    for /f "tokens=*" %%i in ('node -v 2^>nul') do (
        set NODE_VERSION=%%i
        set NODE_FOUND=1
    )
)

if !NODE_FOUND! equ 0 (
    echo [%date% %time%] ❌ 错误: 未检测到 Node.js
    echo    请先安装 Node.js (版本 14+^)
    echo    方法1: 访问 https://nodejs.org 下载并安装 LTS 版本
    echo    方法2: 如果您已安装 Node.js，请检查是否已添加到系统 PATH 环境变量
    echo.
    echo    是否需要脚本尝试自动下载并安装 Node.js？(Y/N^)
    choice /c YN /m "选择"
    if errorlevel 2 (
        echo.
        echo 请按任意键退出...
        pause >nul
        exit /b 1
    ) else (
        echo.
        echo [%date% %time%] 正在尝试自动安装 Node.js...
        
        REM 检测系统架构
        if "%PROCESSOR_ARCHITECTURE%"=="AMD64" (
            echo [%date% %time%] 检测到 64 位系统
            set NODE_ARCH=x64
        ) else (
            echo [%date% %time%] 检测到 32 位系统
            set NODE_ARCH=x86
        )
        
        REM 设置最新的 Node.js LTS 版本
        set "NODE_VERSION=20.11.1"
        set "NODE_DOWNLOAD_URL=https://nodejs.org/dist/v%NODE_VERSION%/node-v%NODE_VERSION%-win-%NODE_ARCH%.msi"
        
        echo [%date% %time%] 正在下载 Node.js v%NODE_VERSION% (%NODE_ARCH%^)...
        
        REM 创建临时目录
        if not exist "temp" mkdir temp
        cd temp
        
        REM 尝试使用 curl 下载（Windows 10 及以上默认包含）
        echo [%date% %time%] 尝试使用 curl 下载...
        curl -L -# -o nodejs.msi "%NODE_DOWNLOAD_URL%"
        
        if not exist "nodejs.msi" (
            echo [%date% %time%] curl 下载失败，尝试使用 PowerShell...
            powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%NODE_DOWNLOAD_URL%' -OutFile 'nodejs.msi'" >nul 2>&1
        )
        
        if exist "nodejs.msi" (
            echo [%date% %time%] 正在安装 Node.js，请稍候...
            echo 这可能需要几分钟时间，请不要关闭窗口...
            
            REM 使用 msiexec 安装，并等待完成
            start /wait msiexec /i nodejs.msi /quiet /norestart
            
            if !errorlevel! equ 0 (
                echo [%date% %time%] ✅ Node.js 安装成功
                cd ..
                rmdir /s /q temp
                
                REM 刷新环境变量
                call :RefreshEnvVars
                
                echo.
                echo Node.js 安装完成，正在验证安装...
                timeout /t 5 /nobreak >nul
                
                where node >nul 2>&1
                if !errorlevel! equ 0 (
                    echo [%date% %time%] ✅ Node.js 安装验证成功
                    for /f "tokens=*" %%i in ('node -v 2^>nul') do set NODE_VERSION=%%i
                    echo 已安装 Node.js 版本: !NODE_VERSION!
                    echo.
                    goto :CheckNPM
                ) else (
                    echo [%date% %time%] ⚠️ Node.js 已安装但需要重启命令行
                    echo 请关闭此窗口并重新运行脚本
                    echo.
                    echo 请按任意键退出...
                    pause >nul
                    exit /b 0
                )
            ) else (
                echo [%date% %time%] ❌ Node.js 安装失败
                cd ..
                rmdir /s /q temp
                echo 请尝试手动安装：
                echo 1. 访问 https://nodejs.org
                echo 2. 下载 LTS 版本
                echo 3. 右键安装包以管理员身份运行
                echo.
                echo 请按任意键退出...
                pause >nul
                exit /b 1
            )
        ) else (
            echo [%date% %time%] ❌ 下载 Node.js 失败
            cd ..
            rmdir /s /q temp
            echo 请检查以下问题：
            echo 1. 网络连接是否正常
            echo 2. 是否被防火墙阻止
            echo 3. 是否有足够的磁盘空间
            echo.
            echo 建议：
            echo 1. 使用浏览器访问 https://nodejs.org
            echo 2. 手动下载并安装 LTS 版本
            echo.
            echo 请按任意键退出...
            pause >nul
            exit /b 1
        )
    )
) else (
    echo [%date% %time%] ✅ Node.js 已安装
    echo Node.js 版本: !NODE_VERSION!
)

:CheckNPM
echo.
REM 检查 npm 是否可用
echo [%date% %time%] 正在检查 npm...
set NPM_FOUND=0
set NPM_VERSION=

where npm >nul 2>&1
if !errorlevel! equ 0 (
    for /f "tokens=*" %%i in ('npm -v 2^>nul') do (
        set NPM_VERSION=%%i
        set NPM_FOUND=1
    )
)

if !NPM_FOUND! equ 0 (
    echo [%date% %time%] ❌ 错误: 未检测到 npm
    echo    请确保已正确安装 Node.js
    echo.
    echo 请按任意键退出...
    pause >nul
    exit /b 1
) else (
    echo [%date% %time%] ✅ npm 已安装
    echo npm 版本: !NPM_VERSION!
)

echo.
echo [2/6] 正在安装项目依赖...
echo 这可能需要几分钟时间，请耐心等待...
echo.
call npm install
if !errorlevel! neq 0 (
    echo [%date% %time%] ❌ 错误: 依赖安装失败
    echo    请检查网络连接或手动运行 "npm install"
    echo.
    echo 请按任意键退出...
    pause >nul
    exit /b 1
) else (
    echo [%date% %time%] ✅ 依赖安装完成
)

echo.
echo [3/6] 检查 Playwright Firefox 浏览器...
echo.

REM 检查Firefox浏览器安装路径
if exist "%USERPROFILE%\AppData\Local\ms-playwright\firefox-1490" (
    echo [%date% %time%] ✅ Playwright Firefox 浏览器已安装
) else (
    echo [%date% %time%] 正在安装 Playwright Firefox 浏览器...
    call npx playwright install firefox
    if !errorlevel! neq 0 (
        echo [%date% %time%] ⚠️  警告: Playwright 浏览器安装可能存在问题
        echo    您可以稍后手动运行 "npx playwright install firefox"
        echo.
    ) else (
        echo [%date% %time%] ✅ Playwright Firefox 浏览器安装完成
    )
)

echo.
echo [4/6] 准备启动服务器...
echo ==================================================
echo.

REM 检查并清理端口3000
echo [%date% %time%] Checking port status...
set PORT_CLEARED=0

REM 先尝试使用非强制方式结束进程
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000"') do (
    echo [%date% %time%] Port 3000 is in use by process %%a
    
    REM 尝试正常结束进程
    echo [%date% %time%] Attempting to end process normally...
    taskkill /PID %%a >nul 2>&1
    if !errorlevel! equ 0 (
        echo [%date% %time%] Process ended successfully
        set PORT_CLEARED=1
    ) else (
        REM 如果正常结束失败，尝试强制结束
        echo [%date% %time%] Normal termination failed, attempting force...
        taskkill /F /PID %%a >nul 2>&1
        if !errorlevel! equ 0 (
            echo [%date% %time%] Process force terminated
            set PORT_CLEARED=1
        ) else (
            echo [%date% %time%] Cannot terminate process
            echo Please try one of the following:
            echo 1. Close the application using port 3000 manually
            echo 2. Run this script as administrator
            echo 3. Modify server.js to use a different port
            echo.
            echo Press any key to exit...
            pause >nul
            exit /b 1
        )
    )
    timeout /t 2 /nobreak >nul
)

if !PORT_CLEARED! equ 1 (
    echo [%date% %time%] ✅ 端口3000已释放
    timeout /t 2 /nobreak >nul
)

echo [%date% %time%] 服务器即将在 http://localhost:3000 上运行
echo.
echo [5/6] 启动服务器...
echo 按 Ctrl+C 可以停止服务器
echo.
start "" http://localhost:3000
call npm start
if !errorlevel! neq 0 (
    echo.
    echo [6/6] 服务器已停止运行或发生错误
) else (
    echo.
    echo [6/6] 服务器已正常退出
)

echo.
echo 脚本执行完成
echo.
echo 按任意键退出...
pause >nul
exit /b 0

:RefreshEnvVars
REM 刷新环境变量函数
for /f "tokens=2*" %%a in ('reg query "HKLM\System\CurrentControlSet\Control\Session Manager\Environment" /v Path') do set "PATH=%%b"
for /f "tokens=2*" %%a in ('reg query "HKCU\Environment" /v Path') do set "PATH=!PATH!;%%b"
goto :eof