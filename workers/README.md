# 日记上传功能部署指南

## 已完成的修改

### 1. 新增文件
- `workers/diary-upload-worker.js` - Cloudflare Worker 后端 API
- `workers/wrangler.toml` - Worker 配置文件

### 2. 修改的文件
- `.github/workflows/hexo-deploy.yml` - 添加了 `workflow_dispatch` 触发器
- `source/tools/Daynote.html` - 添加了日记编辑器界面

---

## 部署步骤

### 步骤 1: 创建 GitHub Personal Access Token

1. 访问 https://github.com/settings/tokens?type=beta
2. 点击 **"Generate new token"**
3. 设置：
   - Token name: `diary-upload`
   - Expiration: 选择一个合适的过期时间
   - Repository access: 选择 **"Only select repositories"**，然后选择 `ysunyang979-sys/blog`
   - Permissions → Repository permissions → **Contents**: Read and write
4. 点击 **"Generate token"** 并复制 token

### 步骤 2: 部署 Cloudflare Worker

在 PowerShell 中运行：

```powershell
cd e:\Tools\Written\workers

# 安装 wrangler（如果还没有）
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 设置环境变量（密钥）
wrangler secret put GITHUB_TOKEN
# 粘贴你的 GitHub PAT

wrangler secret put DIARY_PASSWORD
# 输入: 358966OoOo

# 部署 Worker
wrangler deploy
```

### 步骤 3: 更新前端配置

部署成功后，你会得到一个 Worker URL（如 `https://diary-upload.xxx.workers.dev`）。

编辑 `source/tools/Daynote.html`，将第 322 行的 `WORKER_URL` 更新为你的实际 URL：

```javascript
const WORKER_URL = "https://diary-upload.your-subdomain.workers.dev";
```

### 步骤 4: 推送更改

```powershell
cd e:\Tools\Written
git add .
git commit -m "添加日记上传功能"
git push
```

---

## 使用方法

1. 在手机或电脑浏览器访问博客的日记页面
2. 输入密码解锁页面
3. 点击右下角的 ✏️ 按钮打开编辑器
4. 输入日记标题和内容
5. 点击 **"📤 上传到 GitHub"** 按钮
6. 等待几分钟，博客会自动更新

---

## 故障排除

| 问题 | 解决方案 |
|------|----------|
| "密码错误" | 检查 Worker 的 DIARY_PASSWORD 环境变量 |
| "GitHub API 错误" | 检查 GITHUB_TOKEN 是否有效且有正确权限 |
| "网络错误" | 检查 Worker URL 是否正确，CORS 是否配置 |
| 上传成功但博客没更新 | 检查 GitHub Actions 是否正常运行 |
