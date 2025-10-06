@echo off
chcp 65001 >nul

echo 测试 Node.js 和 npm:

echo.
echo Node.js 版本:
node -v

echo.
echo npm 版本:
npm -v

echo.
echo Node.js 路径:
where node

echo.
echo npm 路径:
where npm

echo.
echo 按任意键退出...
pause >nul