# AI Portal 主题系统实施计划

## 项目概述

基于6个原型图开发多主题切换系统，在设置中添加主题选择功能，同时保持现有功能（应用同步、聊天等）完整兼容。

## 6个主题风格定义

### 主题1: Organic Bento (有机便当风)

* **风格特点**: 温暖的大地色调，圆角卡片，手绘感

* **主色调**: 沙色(#FDFCF8), 陶土色(#E89A80), 鼠尾草绿(#A8C6AA), 海洋蓝(#8FB6C8)

* **字体**: DM Sans + Playfair Display

* **特点**: 2px边框，柔和阴影，网格背景

### 主题2: Cyberpunk Neon (赛博朋克霓虹)

* **风格特点**: 深色背景，霓虹发光效果，科技感

* **主色调**: 深紫(#0D0B14), 霓虹洋红(#FF00FF), 霓虹青(#00FFFF), 霓虹紫(#BC13FE)

* **字体**: Space Grotesk

* **特点**: 玻璃态效果，发光边框，动态渐变背景

### 主题3: Luxury Dark (奢华暗黑)

* **风格特点**: 高端商务感，金色点缀，优雅排版

* **主色调**: 炭黑(#121212), 金色(#D4AF37), 铜色(#B87333), 铂金(#E5E4E2)

* **字体**: DM Sans + Playfair Display

* **特点**: 金色渐变文字，精致边框，横向滚动卡片

### 主题4: Cyber-Tech (赛博科技)

* **风格特点**: 硬核科技风，扫描线效果，等宽字体

* **主色调**: 午夜蓝(#050A14), 霓虹青(#00F0FF), 霓虹红(#FF003C), 霓虹绿(#0AFF60)

* **字体**: Rajdhani + Share Tech Mono

* **特点**: 扫描线覆盖，六边形背景，状态指示器

### 主题5: Swiss Minimalist (瑞士极简)

* **风格特点**: 包豪斯风格，大胆色块，几何图形

* **主色调**: 瑞士红(#FF3B30), 瑞士蓝(#007AFF), 瑞士黄(#FFCC00), 黑白

* **字体**: Inter

* **特点**: 直角无圆角，粗边框，强烈对比

### 主题6: Pastel Dream ( pastel 梦幻)

* **风格特点**: 柔和粉彩，圆润设计，友好亲切

* **主色调**: 薰衣草紫(#E9D5FF), 桃色(#FECDD3), 薄荷绿(#CCFBF1), 天蓝(#BAE6FD)

* **字体**: Quicksand + Nunito

* **特点**: 大圆角，柔和阴影，渐变文字

## 实施步骤

### 阶段1: 创建主题系统基础设施

1. **创建主题配置类型定义** (`src/types/theme.ts`)

   * ThemeConfig 接口定义

   * 主题ID枚举

   * 颜色、字体、圆角、阴影等配置

2. **创建主题配置数据** (`src/data/themes.ts`)

   * 6个主题的完整配置对象

   * CSS变量映射

   * 字体URL配置

3. **创建主题状态管理** (`src/stores/theme.ts`)

   * Pinia store 管理当前主题

   * localStorage 持久化

   * 主题切换方法

### 阶段2: 创建主题样式系统

1. **扩展 Tailwind 配置** (`tailwind.config.js`)

   * 添加主题相关的颜色扩展

   * 添加自定义圆角、阴影

   * 配置字体族

2. **创建主题CSS变量文件** (`src/styles/themes.css`)

   * 为每个主题定义CSS变量

   * 动态主题切换的变量映射

3. **创建主题包装组件** (`src/components/ThemeProvider.vue`)

   * 监听主题变化

   * 动态应用CSS类

   * 字体加载管理

### 阶段3: 创建主题化组件

1. **创建主题化Header组件** (`src/components/themes/ThemeHeader.vue`)

   * 支持6种风格的Header

   * 根据当前主题渲染不同样式

2. **创建主题化FeatureTiles组件** (`src/components/themes/ThemeFeatureTiles.vue`)

   * Bento网格布局适配各主题

   * 卡片样式主题化

3. **创建主题化Footer组件** (`src/components/themes/ThemeFooter.vue`)

   * 页脚样式主题化

### 阶段4: 创建设置面板

1. **创建设置弹窗组件** (`src/components/SettingsModal.vue`)

   * 主题选择器UI

   * 主题预览缩略图

   * 设置持久化

2. **在Header中添加设置入口**

   * 设置按钮

   * 点击打开设置弹窗

### 阶段5: 整合与测试

1. **更新 HomePage.vue**

   * 集成 ThemeProvider

   * 根据主题渲染不同组件

2. **更新 App.vue**

   * 全局主题状态管理

3. **测试所有主题**

   * 验证所有功能正常工作

   * 验证主题切换流畅

   * 验证localStorage持久化

## 文件结构

```
src/
├── types/
│   └── theme.ts              # 主题类型定义
├── data/
│   └── themes.ts             # 主题配置数据
├── stores/
│   ├── auth.ts               # 现有认证store
│   └── theme.ts              # 新增主题store
├── styles/
│   └── themes.css            # 主题CSS变量
├── components/
│   ├── Header.vue            # 现有Header
│   ├── Footer.vue            # 现有Footer
│   ├── FeatureTiles.vue      # 现有FeatureTiles
│   ├── AssistantCard.vue     # 现有AssistantCard
│   ├── SettingsModal.vue     # 新增设置弹窗
│   └── themes/               # 主题化组件目录
│       ├── ThemeProvider.vue
│       ├── ThemeHeader.vue
│       ├── ThemeFeatureTiles.vue
│       └── ThemeFooter.vue
└── pages/
    └── HomePage.vue          # 更新以支持主题
```

## 兼容性保证

* 所有现有API调用保持不变

* 所有现有路由保持不变

* 认证逻辑完全保留

* 聊天功能完全保留

* 同步功能完全保留

* 响应式设计保持

## 技术要点

1. 使用CSS变量实现动态主题切换
2. 使用Pinia管理主题状态
3. 使用localStorage持久化用户选择
4. 懒加载主题特定字体
5. 平滑过渡动画
6. 保持原有组件接口不变

