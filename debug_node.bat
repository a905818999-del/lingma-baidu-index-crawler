@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo 开始调试 Node.js 检测...

echo.
echo 测试 node -v:
node -v >nul 2>&1
set ERROR_LEVEL=%errorlevel%
echo errorlevel = %ERROR_LEVEL%

if %ERROR_LEVEL% equ 0 (
    echo 命令执行成功
    for /f "tokens=*" %%i in ('node -v') do (
        echo 版本: %%i
        set NODE_VERSION=%%i
    )
    echo NODE_VERSION=!NODE_VERSION!
    set NODE_FOUND=1
    echo NODE_FOUND=!NODE_FOUND!
) else (
    echo 命令执行失败
    set NODE_FOUND=0
    echo NODE_FOUND=!NODE_FOUND!
)

echo.
echo 最终结果:
echo NODE_FOUND=!NODE_FOUND!
echo NODE_VERSION=!NODE_VERSION!

echo.
echo 按任意键退出...
pause >nul