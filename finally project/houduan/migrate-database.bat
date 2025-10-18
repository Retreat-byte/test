@echo off
echo ========================================
echo 数据库迁移脚本：添加relaxation练习类型
echo ========================================
echo.

echo 正在执行数据库迁移...
echo.

REM 尝试使用Docker执行迁移
echo 尝试使用Docker执行迁移...
docker exec -i emotion-island-mysql mysql -u root -p123456 < src/main/resources/sql/migration_add_relaxation_type.sql

if %errorlevel% neq 0 (
    echo Docker迁移失败，尝试直接连接MySQL...
    echo 请手动执行以下SQL命令：
    echo.
    echo USE emotion_island;
    echo ALTER TABLE practice_history MODIFY COLUMN type enum('breathing','meditation','relaxation') NOT NULL COMMENT '练习类型(breathing=正念呼吸,meditation=冥想音频,relaxation=放松练习)';
    echo.
    pause
) else (
    echo 数据库迁移完成！
)

echo.
echo ========================================
echo 迁移完成！
echo ========================================
pause
