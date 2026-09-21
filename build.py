#!/usr/bin/env /Users/preston/Desktop/未命名文件夹/.venv/bin/python
# 从 aistudio（Google Drive）的 AI Studio 对话 JSON 提取做菜对话，
# 生成 public/data/recipes.json 供前端加载。
# 新增对话：往 ITEMS 里加文件名，重跑本脚本，再 wrangler pages deploy。
import json, os, re, datetime
import markdown

BASE = os.path.dirname(os.path.abspath(__file__))
AIS = os.path.expanduser("~/Desktop/未命名文件夹/aistudio")  # AI Studio 对话导出（Google Drive）
OUT = os.path.join(BASE, "public", "data", "recipes.json")

# 对话文件名（不分类，统一「食谱」标签；前端按时间倒序展示）
ITEMS = [
    "小白新手厨艺入门指南",
    "新手下厨：四材简易食谱",
    "小白下厨家常菜指南",
    "新手食材搭配与烹饪指南",
    "日常做饭食材采购指南",
    "小白新手油菜采购指南",
    "炒藕片食材选购指南",
    "水果选购与科学食用指南",
    "平菇炒肉新手指南",
    "平菇炒肉片烹饪指南",
    "娃娃菜平菇炒肉指南",
    "家常肉片炒菜花教程",
    "家常脆爽肉炒菜花",
    "零失败蒜蓉炒油菜教程",
    "新手莲藕零失败做法",
    "菜花炒肉甜味来源解析",
    "家常五花肉炖菜指南",
    "五花肉平菇豆腐一锅炖",
    "家常什锦炖肉片烹饪指南",
    "新手土豆炖鸡烹饪指南",
    "家常土豆炖芸豆做法",
    "酱香土豆焖肉制作教程",
    "新手零失败土豆烩菜",
    "娃娃菜豆腐肉片煲做法",
    "蒸锅温馒头的正确方法",
    "熟玉米蒸制加热指南",
    "小电锅断电安全指南",
    "电热锅防潮与按键维护",
]

md = markdown.Markdown(extensions=["tables", "sane_lists"])

recipes = []
for fname in ITEMS:
    path = os.path.join(AIS, fname)
    with open(path) as f:
        d = json.load(f)
    chunks = d.get("chunkedPrompt", {}).get("chunks", [])
    users, answers = [], []
    for c in chunks:
        t = (c.get("text") or "").strip()
        if not t:
            continue
        if c.get("role") == "user":
            users.append(t)
        elif c.get("role") == "model" and not c.get("isThought"):
            answers.append(t)
    if not answers:
        print(f"!! 跳过（无模型回复）：{fname}")
        continue
    mtime = os.stat(path).st_mtime
    date = datetime.datetime.fromtimestamp(mtime).strftime("%Y-%m-%d")
    answers_html = md.reset().convert("\n\n---\n\n".join(answers))
    recipes.append({
        "id": fname,                      # 兼作 hash 路由 key
        "title": fname,
        "date": date,
        "q": users[0] if users else "",
        "html": answers_html,             # markdown 已渲染，前端直接 innerHTML
        "raw": re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", answers_html)
                      + " " + " ".join(users)).lower(),  # 搜索用纯文本
        "turns": len(answers),
    })

recipes.sort(key=lambda r: r["date"], reverse=True)

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w") as f:
    json.dump(recipes, f, ensure_ascii=False)
print(f"OK {len(recipes)} recipes -> {OUT} ({os.path.getsize(OUT)//1024} KB)")
