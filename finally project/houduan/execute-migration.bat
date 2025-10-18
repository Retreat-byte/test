@echo off
echo ========================================
echo 数据库迁移执行脚本
echo ========================================
echo.

echo 请选择执行方式：
echo 1. 使用MySQL命令行客户端
echo 2. 使用MySQL Workbench
echo 3. 使用其他MySQL客户端工具
echo.

set /p choice="请输入选择 (1-3): "

if "%choice%"=="1" goto mysql_cli
if "%choice%"=="2" goto workbench
if "%choice%"=="3" goto other_tools
goto invalid_choice

:mysql_cli
echo.
echo 使用MySQL命令行客户端执行...
echo.
echo 请确保MySQL客户端已安装并添加到PATH环境变量中
echo.
echo 执行以下命令：
echo mysql -h localhost -P 3306 -u root -p123456 emotion_island
echo.
echo 然后在MySQL提示符下执行：
echo ALTER TABLE practice_history MODIFY COLUMN type enum('breathing','meditation','relaxation') NOT NULL COMMENT '练习类型(breathing=正念呼吸,meditation=冥想音频,relaxation=放松练习)';
echo.
pause
goto end

:workbench
echo.
echo 使用MySQL Workbench执行...
echo.
echo 1. 打开MySQL Workbench
echo 2. 连接到数据库：
echo    - Host: localhost
echo    - Port: 3306
echo    - Username: root
echo    - Password: 123456
echo    - Database: emotion_island
echo 3. 在查询窗口中执行以下SQL：
echo.
echo USE emotion_island;
echo ALTER TABLE practice_history MODIFY COLUMN type enum('breathing','meditation','relaxation') NOT NULL COMMENT '练习类型(breathing=正念呼吸,meditation=冥想音频,relaxation=放松练习)';
echo.
pause
goto end

:other_tools
echo.
echo 使用其他MySQL客户端工具执行...
echo.
echo 连接信息：
echo - Host: localhost
echo - Port: 3306
echo - Username: root
echo - Password: 123456
echo - Database: emotion_island
echo.
echo 执行以下SQL命令：
echo.
echo USE emotion_island;
echo ALTER TABLE practice_history MODIFY COLUMN type enum('breathing','meditation','relaxation') NOT NULL COMMENT '练习类型(breathing=正念呼吸,meditation=冥想音频,relaxation=放松练习)';
echo.
pause
goto end

:invalid_choice
echo 无效选择，请重新运行脚本
pause
goto end

:end
echo.
echo ========================================
echo 迁移完成后，请重启应用程序以生效
echo ========================================
pause
