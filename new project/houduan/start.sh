#!/bin/bash

# 情绪岛后端启动脚本

echo "🚀 启动情绪岛后端服务..."

# 检查Java版本
echo "📋 检查Java环境..."
java -version

# 检查Maven
echo "📋 检查Maven环境..."
mvn -version

# 构建项目
echo "🔨 构建项目..."
mvn clean package -DskipTests

# 检查构建结果
if [ $? -eq 0 ]; then
    echo "✅ 项目构建成功"
    
    # 启动应用
    echo "🚀 启动应用..."
    java -jar target/houduan-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev
    
else
    echo "❌ 项目构建失败"
    exit 1
fi

