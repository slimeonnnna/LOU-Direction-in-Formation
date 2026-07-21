# LOU / Direction in Formation

An open-source editorial portfolio template for people whose careers are still taking shape.

一个面向“仍在成长中的人”的开源编辑式个人作品集模板。

[Live Demo / 在线预览](https://lou-direction-in-formation.vercel.app/)

---

## English

### About

Direction in Formation is a responsive personal portfolio template built around progression rather than self-promotion. It replaces the usual résumé dashboard, skill-pill wall, and inflated metrics with a continuous narrative about experience, turning points, selected work, and capabilities in formation.

The included demo uses Lou's SEO career story, but the structure can be adapted for developers, designers, marketers, researchers, writers, and other independent professionals.

### Design features

- Editorial Chinese and Latin typography
- Asymmetric twelve-column grid
- Warm paper palette with one restrained accent colour
- A continuous SVG path linked to scroll progress and pointer movement
- Narrative chapters instead of conventional résumé cards
- Responsive mobile composition rather than a compressed desktop layout
- Keyboard-accessible navigation and visible focus states
- `prefers-reduced-motion` support
- No animation or UI dependency beyond React and CSS

### Customize the template

The main demo content and section structure live in:

- `app/page.tsx` — navigation, story, projects, capabilities, and contact details
- `app/globals.css` — colour system, typography, grid, interaction, and responsive styles
- `app/layout.tsx` — page metadata and document language

Start by replacing the demo copy in `app/page.tsx`. Then update the colour variables at the top of `app/globals.css` and the metadata in `app/layout.tsx`.

### Development

Requires Node.js `>=22.13.0`.

```bash
npm install
npm run dev
```

Validation:

```bash
npm run build
npm run lint
```

### Stack

- React 19
- Next.js / Vinext
- TypeScript
- CSS and inline SVG
- Cloudflare-compatible deployment output

---

## 中文

### 项目简介

Direction in Formation 是一个响应式开源个人作品集模板。它不把个人经历做成简历面板、技能标签墙或夸张的数据展示，而是通过起点、转折、项目、能力与当下方向，讲清楚一个人如何逐渐变得更完整。

仓库中的演示内容使用 Lou 的 SEO 从业经历，但整体结构同样适用于开发者、设计师、营销从业者、研究者、写作者及其他独立职业者。

### 设计特点

- 具有编辑感的中西文排版
- 非对称十二栏网格
- 暖纸张底色与单一克制强调色
- 随滚动进度和指针轻微响应的连续 SVG 路径
- 用完整叙事章节替代普通履历卡片
- 针对手机重新组织版面，而非简单压缩桌面端
- 支持键盘导航与清晰的焦点状态
- 支持 `prefers-reduced-motion` 动效降级
- 除 React 与 CSS 外，不依赖额外动效或 UI 库

### 如何改成你的作品集

主要内容与样式位于：

- `app/page.tsx` — 导航、个人故事、项目、能力与联系方式
- `app/globals.css` — 配色、字体、网格、交互与响应式样式
- `app/layout.tsx` — 页面标题、描述和文档语言

建议先替换 `app/page.tsx` 中的演示文案，再修改 `app/globals.css` 顶部的颜色变量，最后更新 `app/layout.tsx` 中的页面信息。

### 本地运行

需要 Node.js `>=22.13.0`。

```bash
npm install
npm run dev
```

构建与检查：

```bash
npm run build
npm run lint
```

## License / 许可证

Released under the [MIT License](LICENSE).

本项目基于 [MIT License](LICENSE) 开源，可自由使用、修改和分发，但请保留原始许可证与版权声明。
