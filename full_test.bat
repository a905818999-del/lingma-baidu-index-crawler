@echo off
chcp 65001 >nul

echo ==================================================
echo 测试 Node.js 和 npm 检测逻辑
echo ==================================================

echo.
echo [1/8] 测试 node -v
node -v >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ node -v 成功
    for /f "tokens=*" %%i in ('node -v') do echo    版本: %%i
) else (
    echo ❌ node -v 失败
)

echo.
echo [2/8] 测试 node --version
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ node --version 成功
    for /f "tokens=*" %%i in ('node --version') do echo    版本: %%i
) else (
    echo ❌ node --version 失败
)

echo.
echo [3/8] 测试 where node
where node >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ where node 成功
    for /f "tokens=*" %%i in ('where node') do echo    路径: %%i
) else (
    echo ❌ where node 失败
)

echo.
echo [4/8] 测试 npm -v
npm -v >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ npm -v 成功
    for /f "tokens=*" %%i in ('npm -v') do echo    版本: %%i
) else (
    echo ❌ npm -v 失败
)

echo.
echo [5/8] 测试 npm --version
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ npm --version 成功
    for /f "tokens=*" %%i in ('npm --version') do echo    版本: %%i
) else (
    echo ❌ npm --version 失败
)

echo.
echo [6/8] 测试 where npm
where npm >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ where npm 成功
    for /f "tokens=*" %%i in ('where npm') do echo    路径: %%i
) else (
    echo ❌ where npm 失败
)

echo.
echo [7/8] 测试 node 命令是否存在
node >nul 2>&1
if %errorlevel% gtr 1 (
    echo ❌ node 命令不存在或无法运行
) else (
    echo ✅ node 命令可以正常运行
)

echo.
echo [8/8] 测试 npm 命令是否存在
npm >nul 2>&1
if %errorlevel% gtr 1 (
    echo ❌ npm 命令不存在或无法运行
) else (
    echo ✅ npm 命令可以正常运行
)

echo.
echo 测试完成！
echo.
echo 按任意键退出...
pause >nul