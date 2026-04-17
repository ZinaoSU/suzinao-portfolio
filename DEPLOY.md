# 部署指南

## 仓库信息
- **GitHub**: https://github.com/ZinaoSU/suzinao-portfolio

## 前端部署 (Vercel)

### 步骤
1. 访问 [vercel.com](https://vercel.com) 并登录
2. 点击 **Add New** → **Project**
3. 导入 `suzinao-portfolio` 仓库
4. 配置：
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Root Directory**: `/`
5. 添加环境变量：
   ```
   VITE_API_BASE=https://your-railway-app.railway.app/api
   ```
6. 点击 **Deploy**

## 后端部署 (Railway)

### 步骤
1. 访问 [railway.app](https://railway.app) 并登录（GitHub 账号）
2. 点击 **New Project** → **Deploy from GitHub repo**
3. 选择 `suzinao-portfolio` 仓库
4. 在 **Settings** → **Variables** 添加：
   ```
   OPENAI_API_KEY=sk-your-key-here
   JWT_SECRET=your-super-secret-jwt-key-at-least-32-chars
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   ```
5. 在 **Settings** → **Start Command**：
   ```
   cd server && npm install && npx prisma db push && npm run build && npm start
   ```
6. 等待部署完成，获取后端 URL

## 数据库 (Neon PostgreSQL)

### 步骤
1. 访问 [neon.tech](https://neon.tech) 并注册
2. 创建新项目，获取 `DATABASE_URL`
3. 将 URL 填入 Railway 环境变量

## 环境变量说明

| 变量 | 说明 | 示例 |
|------|------|------|
| `OPENAI_API_KEY` | OpenAI API Key | `sk-xxx` |
| `JWT_SECRET` | JWT 密钥（至少32字符） | `your-secret-key-here` |
| `DATABASE_URL` | PostgreSQL 连接字符串 | `postgresql://...` |

## 部署后测试

1. 打开 Vercel 部署的网站
2. 滚动到 AI Lab 区域
3. 测试简历对话助手
4. 测试面试复盘助手（需登录）
