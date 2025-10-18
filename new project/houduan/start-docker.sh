#!/bin/bash

# 情绪岛Docker启动脚本

echo "🐳 启动情绪岛Docker服务..."

# 检查Docker
echo "📋 检查Docker环境..."
docker --version
docker-compose --version

# 停止现有容器
echo "🛑 停止现有容器..."
docker-compose down

# 构建并启动服务
echo "🔨 构建并启动服务..."
docker-compose up --build -d

# 检查服务状态
echo "📊 检查服务状态..."
docker-compose ps

# 显示日志
echo "📝 显示应用日志..."
docker-compose logs -f backend

