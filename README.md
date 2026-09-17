# SPlayer for Android Next 文档站

[SPlayer for Android Next](https://github.com/SPlayer-CE/SPlayer-for-Android-Next) 的官方文档站点，基于 [VitePress](https://vitepress.dev/) 构建，结构与视觉仿照桌面版文档站 [splayer-next.imsyy.top](https://splayer-next.imsyy.top/)。

- 站点内容：下载、使用指南、流媒体服务、插件使用与开发、外部 API、原生与桥接、故障排查、用户协议与隐私策略；
- 旧版 Android（非 Next）文档见 [legacy.sfa.l.cd](https://legacy.sfa.l.cd)，其源码归档于本工作区的 `sfa-docs/` 目录。

## 快速开始

```bash
pnpm install

pnpm docs:dev       # 本地开发服务器
pnpm docs:build     # 生产构建 → docs/.vitepress/dist
pnpm docs:preview   # 预览生产构建
```

环境要求：Node.js >= 20、pnpm >= 10（pnpm 11 的构建脚本白名单见 `pnpm-workspace.yaml` 的 `allowBuilds`）。

## 目录结构

```
├── docs/
│   ├── .vitepress/
│   │   ├── config.mts            # 站点配置（导航 / 侧边栏 / 搜索 / 页脚）
│   │   ├── components/
│   │   │   └── DownloadPage.vue  # 下载页：动态拉取 GitHub Release 并按 ABI 分组
│   │   └── theme/                # 品牌色与主题扩展
│   ├── public/                   # favicon 等静态资源
│   ├── plugins/                  # 插件开发文档（复用仓库官方文本）
│   ├── troubleshooting/          # 故障排查
│   └── *.md                      # 各页面
├── package.json
└── pnpm-workspace.yaml
```

## 内容约定

- 文档事实以应用仓库源码为准（设置项名称、端口、ABI、最低系统版本等均经核对）；
- 用户协议与隐私策略为项目官方法律文本，原样维护，不作 paraphrase；
- 下载页通过 GitHub API 实时获取 Release 资产（`SPlayer-Next-v{version}-{abi}.apk`），无需手动更新版本号。

## 官方域名与防骗声明

本项目的首要分发渠道为 GitHub 仓库；`next.sfa.l.cd` 与 `legacy.sfa.l.cd` 为开发组授权的**二级分发域名**，仅用于文档访问与下载分发。**以 `l.cd` 为根域的任何其他子域均与本项目及其开发组无关**，亦从未被授权分发安装包或提供付费、「客服」等服务。请谨防仿冒站点与二次打包安装包；因使用非官方渠道产生的一切损失由当事人自行承担，本项目及其开发组概不负责。

## 许可证

基于 [AGPL-3.0](./LICENSE) 许可发布，与上游项目保持一致。
