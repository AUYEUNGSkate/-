# 本地开发与终端说明

## 推荐终端

Windows 环境优先使用 Git Bash，避免 PowerShell 因执行策略拦截 `npm.ps1`。

已确认 Git Bash 可用路径：

```txt
C:\Program Files\Git\bin\bash.exe
```

## Git Bash 常用命令

在 Git Bash 中进入项目：

```bash
cd /e/热点工具
```

安装依赖：

```bash
npm install
```

启动前端和后端开发服务：

```bash
npm run dev
```

启动定时扫描 worker：

```bash
npm run worker
```

手动扫描一次：

```bash
npm run scan
```

运行测试：

```bash
npm test
```

构建：

```bash
npm run build
```

## PowerShell 兜底

如果必须在 PowerShell 中运行，使用 `npm.cmd`，不要直接用 `npm`：

```powershell
& 'D:\Node.js\npm.cmd' install
& 'D:\Node.js\npm.cmd' run dev
& 'D:\Node.js\npm.cmd' test
& 'D:\Node.js\npm.cmd' run build
```

## OpenRouter 配置

复制 `.env.example` 为 `.env`，填入真实 Key：

```env
OPEN_ROUTER=你的_key
AI_MODE=openrouter
```

不要把 `.env` 提交到仓库，也不要把真实 Key 写进前端代码。
