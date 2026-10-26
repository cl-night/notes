# 个人笔记站

纯静态站点：没有后端、没有数据库，所有页面都是构建时生成的 HTML。
源笔记在仓库根目录的 `notes/`，构建脚本把它们转换成 `site/`。

## 本地预览

在仓库根目录执行：

```bash
python -m http.server 8080 --directory site
```

然后打开 <http://localhost:8080>。

局域网内其他电脑访问（同一 WiFi）：

```bash
python -m http.server 8080 --directory site --bind 0.0.0.0
```

用 `ipconfig` 查到本机局域网 IP，访问 `http://<IP>:8080`（Windows 防火墙可能弹窗，选择允许）。

## 更新笔记

1. 在 `notes/` 新建或修改 `.md`，开头可以带 front matter：

```markdown
---
title: "笔记标题"
slug: my-note
date: 2026-10-26
tags: [STM32, 学习笔记]
summary: 一句话摘要。
---

# 正文标题
```

2. 在仓库根目录运行构建：

```bash
node tools/build-site.mjs
```

Windows 上也可以双击 `tools/build-site.cmd`。

3. 重新部署 `site/`（见下）。

## 图片与笔记互链

- 图片放在 `site/assets/images/`，笔记里用 `../assets/images/xxx.png`（笔记页在 `site/notes/` 下）。构建不会删除 `assets/`，重新构建后图片仍在。
- 链接其他笔记用 `<slug>.html`（同一 `notes/` 目录），例如 `stm32-course-map.html`。
- 想改站点名、副标题、作者：改 `tools/build-site.mjs` 顶部的 `SITE` 对象，再重新构建。

## 部署到公网（任选一种）

构建产物在 `site/`，它不依赖任何服务器端程序。

### 方式 1：Netlify Drop（最快，无需命令行）

1. 打开 <https://app.netlify.com/drop>。
2. 把整个 `site/` 文件夹拖进去。
3. 几秒后会得到一个 `https://xxx.netlify.app` 地址；注册免费账号可以保留并改名。

### 方式 2：GitHub Pages（长期、免费）

1. 在 GitHub 新建仓库（例如 `notes`），把 `site/` 里的**内容**上传到仓库根目录（不是把 `site` 文件夹本身放进去）。
2. 仓库 Settings → Pages → Build and deployment → Source 选 `Deploy from a branch`，分支 `main`，目录 `/ (root)`。
3. 保存后地址是 `https://<用户名>.github.io/notes/`。
4. 以后更新：重新构建、上传覆盖即可。

注意：公开仓库 + Pages 意味着**笔记是公开的**。私人笔记请改用带访问控制的托管，或只部署到局域网。

### 方式 3：Cloudflare Pages

1. 打开 Cloudflare Dashboard → Workers & Pages → Create → Pages → Upload assets。
2. 上传 `site/` 里的内容，得到 `https://xxx.pages.dev`。

### 方式 4：自己的服务器 / NAS

把 `site/` 放到 Nginx、Caddy、宝塔或 NAS 的静态目录即可，不需要 Node。

## 目录结构

```
site/
  index.html          首页（笔记列表、搜索、标签筛选）
  notes/<slug>.html   每篇笔记的静态页
  assets/style.css    样式
  assets/app.js       主题、搜索、目录、阅读进度
  assets/favicon.svg  图标
```

`site/` 是生成目录；不要直接改里面的 HTML，改 `notes/` 后重新构建。
