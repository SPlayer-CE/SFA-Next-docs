import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "SPlayer for Android Next",
  description: "下一代 SPlayer 的 Android 版本",
  lang: "zh-CN",
  ignoreDeadLinks: true,
  head: [
    ["link", { rel: "icon", href: "/favicon.png" }],
    ["meta", { name: "author", content: "SPlayer-CE" }],
    [
      "meta",
      {
        name: "keywords",
        content: "SPlayer,SPlayer-Next,SPlayer for Android Next,音乐播放器,云音乐,Capacitor,Vue3,Android",
      },
    ],
    ["meta", { name: "theme-color", content: "#3d7be0" }],
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "/favicon.png",
    siteTitle: "SPlayer for Android Next",
    nav: [
      { text: "首页", link: "/" },
      { text: "下载", link: "/download" },
      { text: "使用指南", link: "/guide" },
      {
        text: "开发",
        items: [
          { text: "原生与桥接", link: "/native" },
          { text: "插件开发", link: "/plugins/" },
          { text: "外部 API", link: "/api" },
          { text: "类型参考", link: "/types" },
          { text: "贡献指南", link: "/contributing" },
        ],
      },
      {
        text: "关于",
        items: [
          { text: "用户协议", link: "/agreement" },
          { text: "隐私策略", link: "/privacy" },
          { text: "旧版 Android 文档", link: "https://legacy.sfa.l.cd" },
        ],
      },
      { text: "GitHub", link: "https://github.com/SPlayer-CE/SPlayer-for-Android-Next" },
    ],

    sidebar: [
      {
        text: "指南",
        items: [
          { text: "下载", link: "/download" },
          { text: "使用指南", link: "/guide" },
          { text: "流媒体服务", link: "/streaming" },
          { text: "插件使用", link: "/plugins-usage" },
          { text: "用户协议", link: "/agreement" },
          { text: "隐私策略", link: "/privacy" },
        ],
      },
      {
        text: "接口",
        items: [{ text: "外部 API（HTTP）", link: "/api" }],
      },
      {
        text: "开发",
        items: [
          { text: "原生与桥接", link: "/native" },
          {
            text: "插件开发",
            items: [
              { text: "总览与架构", link: "/plugins/" },
              { text: "音源插件", link: "/plugins/source" },
              { text: "控制插件", link: "/plugins/control" },
              { text: "插件更新", link: "/plugins/update" },
            ],
          },
          { text: "类型参考", link: "/types" },
          { text: "贡献指南", link: "/contributing" },
        ],
      },
      {
        text: "故障排查",
        items: [
          { text: "安装与更新", link: "/troubleshooting/install" },
          { text: "播放与后台", link: "/troubleshooting/playback" },
          { text: "歌词问题", link: "/troubleshooting/lyrics" },
          { text: "调试与日志", link: "/troubleshooting/debug" },
        ],
      },
    ],

    outline: {
      level: [2, 3],
      label: "文章目录",
    },

    search: {
      provider: "local",
      options: {
        translations: {
          button: { buttonText: "搜索文档", keySelector: "Ctrl+K" },
          modal: {
            noResultsText: "没有找到相关结果",
            resetButtonTitle: "清除查询条件",
            footer: { selectText: "选择", navigateText: "切换", closeText: "关闭" },
          },
        },
      },
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/SPlayer-CE/SPlayer-for-Android-Next" },
    ],

    footer: {
      message:
        '基于 AGPL-3.0 许可发布 | <a href="/agreement">用户协议</a> | <a href="/privacy">隐私策略</a>',
      copyright: "Copyright © 2025-present SPlayer-CE",
    },

    docFooter: {
      prev: "上一页",
      next: "下一页",
    },

    darkModeSwitchLabel: "外观",
    sidebarMenuLabel: "菜单",
    returnToTopLabel: "回到顶部",
  },
});
