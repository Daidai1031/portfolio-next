# 彻底清理缓存脚本
# 保存为 clean.bat 然后运行

@echo off
echo 正在彻底清理缓存...

REM 停止所有 Node 进程
taskkill /F /IM node.exe 2>nul

REM 删除所有缓存文件夹
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist .turbo rmdir /s /q .turbo

REM 清理 npm 缓存
npm cache clean --force

echo 清理完成！
echo 现在运行: npm run dev

pause
