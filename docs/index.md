---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "SPlayer for Android Next"
  text: "听音乐，本该如此"
  tagline: SPlayer-Next 的 Android 版本 · Capacitor + Kotlin 原生播放 + 内嵌 Node 插件运行时 · 开发与测试进行中
  image:
    src: /favicon.png
    alt: SPlayer for Android Next
  actions:
    - theme: brand
      text: 立即下载
      link: /download
    - theme: alt
      text: 使用指南
      link: /guide
    - theme: alt
      text: GitHub
      link: https://github.com/SPlayer-CE/SPlayer-for-Android-Next

features:
  - title: 🎵 原生播放引擎
    details: Media3 ExoPlayer 由专属播放线程统一驱动，预载下一曲开头 10 秒；插件音源候选并行竞速，极速缩短切歌延迟，均衡器与频谱一应俱全
  - title: 📝 全格式歌词
    details: LRC / QRC / YRC / KRC / TTML / lys / ass / srt 全格式解析，逐字高亮与翻译音译；全屏歌词由原生 Canvas 渲染，支持逐行模糊
  - title: 🌐 流媒体服务
    details: 接入 Subsonic / Navidrome / Jellyfin / Emby 等自建流媒体服务器，多服务器管理、自动连接，随时访问你的私有曲库
  - title: 🧩 插件系统
    details: 内嵌 Node.js Mobile 运行时承载插件沙箱，兼容 lx-music 脚本，可扩展音源、反向控制与歌曲菜单
  - title: 📡 局域网与外部控制
    details: 原生 NanoHTTPD 服务（端口 13962）提供局域网同步、网页端播放控制与受限外部 API 访问
  - title: 📂 本地音乐库
    details: SAF 目录授权 + 原生 SQLite 扫描管理，jaudiotagger 读取标签与封面，按歌曲 / 专辑 / 歌手浏览
---

::: tip 与桌面版 SPlayer-Next 的关系
本项目是 [SPlayer-Next](https://github.com/SPlayer-Dev/SPlayer-Next) 的 **Android 版本**，共享同一套 Vue 界面与插件生态；桌面端（Windows / macOS / Linux）请前往 SPlayer-Next，其文档见 [splayer-next.imsyy.top](https://splayer-next.imsyy.top/)。
:::

::: tip 旧版 Android 文档
上一代 Android 移植版（SPlayer for Android，Capacitor + ExoPlayer 重构版）的文档见 [legacy.sfa.l.cd](https://legacy.sfa.l.cd)。两个项目相互独立，本版并非其升级分支。
:::

::: warning 最低系统要求
仅支持 **Android 10（API 29）及以上**（minSdk 29 / targetSdk 36）。项目当前处于开发与测试阶段，功能与稳定性仍在快速演进。
:::

::: warning 官方分发域名与防骗声明
本项目的首要分发渠道为 GitHub 仓库；下列域名为开发组授权的**二级分发域名**，仅用于文档访问与下载分发：

- Next Android 版文档：`next.sfa.l.cd`
- 旧版 Android 文档：`legacy.sfa.l.cd`

除上述域名与 GitHub 仓库外，**以 `l.cd` 为根域的任何其他子域（包括但不限于 `sfa.l.cd` 下的其他子域）均与本项目及其开发组无关**，亦从未被授权分发安装包、发布项目公告或提供任何形式的付费、代理与「客服」服务。

请谨防仿冒站点、二次打包或篡改的安装包，以及任何以项目名义进行的收费募集。**因访问或信任非官方渠道而产生的一切纠纷、损失或法律风险，均由当事人自行承担，本项目及其开发组概不负责。**
:::
