# 部署指南 - 苏梓铙个人作品集网站

## 方式一：静态文件部署（推荐）

### 步骤 1：构建生产版本

```bash
cd suzinao-portfolio
npm run build
```

构建完成后，`dist/` 目录包含所有静态文件。

### 步骤 2：上传文件到服务器

使用 SCP/SFTP 上传 `dist/` 目录内容到服务器：

```bash
scp -r dist/* user@your-server:/var/www/portfolio/
```

### 步骤 3：配置 Nginx

将 `nginx.conf` 文件内容添加到 Nginx 配置：

```bash
# 方法1：直接复制到 Nginx 配置目录
sudo cp nginx.conf /etc/nginx/sites-available/portfolio
sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/

# 方法2：追加到主配置文件
sudo cat nginx.conf | sudo tee -a /etc/nginx/nginx.conf
```

### 步骤 4：重载 Nginx

```bash
sudo nginx -t  # 测试配置语法
sudo systemctl reload nginx
```

### 步骤 5：配置域名和 SSL（可选）

1. 在阿里云/腾讯云控制台添加域名解析
2. 申请 SSL 证书（Let's Encrypt 免费）
3. 按照 nginx.conf 中 HTTPS 配置示例启用 SSL

---

## 方式二：Docker 部署

### Dockerfile

```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 构建和运行

```bash
docker build -t portfolio .
docker run -d -p 8080:80 --name portfolio portfolio
```

---

## 方式三：Vercel/Netlify 部署（最简单）

### Vercel

1. 注册 [Vercel](https://vercel.com)
2. 导入 GitHub 仓库或直接上传 `dist/` 文件夹
3. 自动部署，获得免费 SSL

### Netlify

1. 注册 [Netlify](https://netlify.com)
2. 拖拽 `dist/` 文件夹到部署区域
3. 自动部署，获得免费 SSL

---

## 常见问题

### 1. 页面刷新 404

确保 Nginx 配置中的 `try_files` 指令正确：

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### 2. 静态资源加载失败

检查 Nginx 的 `root` 路径是否与实际文件路径一致。

### 3. 跨域问题

如果 API 调用有跨域问题，可在 Nginx 添加：

```nginx
add_header 'Access-Control-Allow-Origin' '*';
```

---

## 备案提醒

如果使用国内服务器（阿里云/腾讯云），需要：
- ICP 备案
- 公安联网备案

部署前请确保已完成备案流程。

---

## 项目结构

```
suzinao-portfolio/
├── dist/                 # 生产构建输出
├── src/
│   ├── components/       # React 组件
│   │   ├── layout/       # 布局组件
│   │   ├── sections/     # 页面区块
│   │   └── ui/           # UI 原子组件
│   ├── data/             # 数据文件
│   │   └── i18n/         # 中英文翻译
│   ├── hooks/            # 自定义 Hooks
│   └── App.tsx           # 主应用
├── nginx.conf            # Nginx 配置文件
└── package.json
```

---

## 联系方式

如有问题，请联系：suzinao.apply@gmail.com
