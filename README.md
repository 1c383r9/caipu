# caipu — 家常菜谱手册

做饭小白的 AI Studio 做菜对话存档站，部署在 Cloudflare Pages

```
├── build.py               # 提取 aistudio 对话 → public/data/recipes.json
├── wrangler.toml          # Pages 配置（项目名 home-recipes）
└── public/                # 部署到 CF Pages 的静态站
    ├── index.html / style.css / app.js
    └── data/recipes.json  # 构建产物（由 build.py 生成）
```

数据源在本地 `~/Desktop/未命名文件夹/aistudio`（Google Drive 同步的对话导出），
所以 `recipes.json` 需在本地生成后提交——CF 构建机拿不到这份数据。

## 更新流程（有新做菜对话时）

1. `build.py` 的 `ITEMS` 列表加上新对话的文件名
2. 重建数据 + 部署：

```bash
./build.py                       # 或用 venv python 跑
npx wrangler pages deploy
```

3. 提交推送：

```bash
git add -A && git commit -m "加菜谱：xxx" && git push
```

## 本地预览

```bash
npx wrangler pages dev   # 或任何静态服务器指向 public/
```

