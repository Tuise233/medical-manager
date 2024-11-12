# Medical Manager

## 简介

Medical Manager 是一个基于 Vue3.3、TypeScript、Vite5、Pinia、Element-Plus 开发的医疗管理系统。项目采用最新的前端技术栈,提供了丰富的功能组件和优秀的开发体验。

## 特性

- 💪 使用 Vue3.3 + TypeScript 开发，提供更好的类型检查和开发体验
- 🚀 基于 Vite5 构建，开发启动快，热更新迅速
- 📦 集成 Element-Plus UI 组件库，提供丰富的组件和主题定制
- 🔑 基于 RBAC 的权限管理，支持按钮级别的权限控制
- 🎨 支持主题切换、暗黑模式、灰色模式、色弱模式等
- 🌍 支持国际化多语言
- 📝 集成富文本编辑器
- 🔍 支持菜单搜索功能
- 📊 提供多种布局方式(经典、分栏、横向)
- 🛠️ 二次封装常用组件，提高开发效率

## 技术栈

- 编程语言：TypeScript 5.x
- 构建工具：Vite 5.x
- 前端框架：Vue 3.3.x
- 路由工具：Vue Router 4.x
- 状态管理：Pinia 2.x
- UI 框架：Element Plus 2.3.x
- CSS 预编译：Sass
- HTTP 工具：Axios
- Git Hook 工具：husky
- 代码规范：EditorConfig + Prettier + ESLint + Stylelint
- 提交规范：Commitizen + Commitlint

## 开发环境

- node >= 16.0.0
- pnpm >= 8.0.0

## 快速开始
```
bash

克隆项目
git clone https://github.com/your-username/medical-manager.git

进入项目目录
cd medical-manager

安装依赖
pnpm install

启动项目
pnpm run dev
```

## 项目构建
```
bash

构建开发环境
pnpm run build:dev

构建测试环境
pnpm run build:test

构建生产环境
pnpm run build:prod
```

## 代码检查
```
bash

eslint 检查
pnpm run lint

stylelint 检查
pnpm run lint:style

prettier 检查
pnpm run prettier
```

## 项目结构
```
medical-manager
├─ src
│ ├─ api # API 接口管理
│ ├─ assets # 静态资源
│ ├─ components # 全局组件
│ ├─ config # 全局配置
│ ├─ directives # 全局指令
│ ├─ hooks # 全局 hooks
│ ├─ layouts # 布局组件
│ ├─ routers # 路由管理
│ ├─ stores # 状态管理
│ ├─ styles # 全局样式
│ ├─ utils # 工具函数
│ └─ views # 页面组件
├─ .editorconfig # 编辑器配置
├─ .env # 环境变量
├─ .eslintrc.js # ESLint 配置
├─ .prettierrc.js # Prettier 配置
├─ .stylelintrc.js # Stylelint 配置
├─ tsconfig.json # TypeScript 配置
└─ vite.config.ts # Vite 配置
```

## 浏览器支持

推荐使用最新版的 Chrome、Edge、Firefox 等现代浏览器访问。

## 许可证

[MIT](./LICENSE)

## 联系作者

- Email: 2039203690@qq.com
- Github: [拉布拉马的Github](https://github.com/tuise233)
