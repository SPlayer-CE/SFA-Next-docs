# 贡献指南

感谢你对 SPlayer for Android Next 的关注！本指南介绍如何为项目做出贡献。

## 范围约定

- 本仓库（`SPlayer-CE/SPlayer-for-Android-Next`，默认分支 **`Android`**）接受 Android 端相关改动；
- 桌面端（Electron / Rust 原生模块）的问题与需求请提交到上游 [SPlayer-Next](https://github.com/SPlayer-Dev/SPlayer-Next)。

## 前置知识

| 技术              | 说明                          |
| ----------------- | ----------------------------- |
| **Vue 3 / TypeScript** | 界面与桥接层            |
| **Capacitor**     | Web → 原生桥接                |
| **Kotlin / Media3** | 播放、通知、歌词原生层、局域网服务 |
| **Node.js Mobile** | 内嵌在线 API 与插件运行时（Node 12.19 约束） |

## 开发环境

| 工具      | 版本要求                          |
| --------- | --------------------------------- |
| Node.js   | `>= 22`                           |
| pnpm      | `>= 10`                           |
| JDK       | `21`（Kotlin 校验必需，JDK 17 会报 `invalid source release: 21`） |
| Rust      | 仅桌面端原生模块需要              |

```bash
pnpm install          # postinstall 会自动修补 nodejs-mobile-cordova，缺失则 Android 构建必失败
```

## 常用命令

| 命令                          | 说明                                             |
| ----------------------------- | ------------------------------------------------ |
| `pnpm build:web`              | 构建 Android WebView 资源包至 `dist/capacitor`   |
| `pnpm cap:sync`               | 同步资源至 `android/`                            |
| `pnpm build:android:node`     | 打包内嵌 API 供 nodejs-mobile 使用               |
| `pnpm prepare:android:embedded` | 复制内嵌 Node 资源至 android 资源目录          |
| `pnpm build:android`          | 完整安卓构建流水线（上述四步串联）               |
| `pnpm android:check`          | Kotlin 静态检查与编译（ktlint + compileKotlin + detekt） |
| `pnpm android:format`         | Kotlin 代码格式化                                |
| `pnpm typecheck` / `lint` / `format` | TS 类型检查 / ESLint / Prettier            |
| `pnpm test:node` / `test:web` / `test:native` | 单元测试                        |

Web 预览（非原生容器，原生插件降级为 no-op 或 HTML 音频）：

```bash
pnpm exec vite --config vite.config.android.ts --host 0.0.0.0
```

真机一键构建安装：运行仓库根目录的 `SPlayer-for-Android-build-and-install-android-release.cmd`（自动检测 ADB 设备、构建、调试签名并安装启动）。

::: warning 不要跑桌面构建
除非需要桌面端 Electron 生产包，否则开发 Android 时**切勿运行 `pnpm build`**——它会触发 Rust 原生模块编译与 electron-vite 打包。
:::

## Git 工作流

1. Fork 仓库并从 **`Android`** 分支拉出功能分支；
2. 提交遵循 Conventional Commits，使用**中文单行摘要**：

   ```
   <type>: <摘要>
   ```

   常用 type：`feat` / `fix` / `perf` / `refactor` / `docs` / `test` / `chore`；
3. PR 目标分支为 **`Android`**，标题与首个 commit 一致，UI 改动附截图，一个 PR 只解决一个问题。

## 代码规范

- 业务注释**统一中文**；导出方法使用规范 JSDoc；
- 严禁无意义分隔线注释与显而易见的废话注释，仅在**设计原因不直观**时撰写；
- 拒绝为 1~2 处调用过度封装 Helper；不预设不可达分支的兜底；
- 弹窗体系 `SDialog` / `SDrawer` / `SPopover` 同时承载统一层级管理与 Android 特化（返回键关闭、防自动聚焦、悬停转点击降级），修改时切勿漏掉任一方逻辑；
- 向 `window.api` 新增方法必须同步在 `bridge.ts` 提供 Android 实现或 no-op；
- 内存纪律：图片按显示尺寸取用（模糊 / 取色 / 列表用 300px 缩略图）；模块级缓存必须有界（LRU / 计数驱逐）；后台与隐藏时静默高频推送与 RAF；
- 时间统一毫秒（ms），Rust / 原生秒值在边界处 `toMs()`；
- Prettier 风格：双引号、分号、100 字符宽、尾随逗号。

## 验证流程

| 改动类型        | 必跑检查                          |
| --------------- | --------------------------------- |
| TS / Vue        | `pnpm typecheck`                  |
| 代码风格        | `pnpm lint`                       |
| 有测试覆盖的模块 | `pnpm test:node` / `pnpm test:web` |
| Rust（桌面）    | `pnpm test:native`                |
| Kotlin          | `pnpm android:check`（JDK 21）    |

并在至少一台真机上验证改动；UI 改动请同时检查手机竖屏与横屏沉浸模式。

## 获取帮助

- 问题反馈：[GitHub Issues](https://github.com/SPlayer-CE/SPlayer-for-Android-Next/issues)；
- 桌面端问题请前往 [SPlayer-Next](https://github.com/SPlayer-Dev/SPlayer-Next)；
- 旧版 Android（非 Next）文档见 [legacy.sfa.l.cd](https://legacy.sfa.l.cd)。

感谢您的贡献！
