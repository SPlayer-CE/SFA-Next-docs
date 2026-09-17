# 调试与日志

## 抓取日志

内嵌 Node 运行时的输出重定向到 logcat，原生播放层与局域网服务同样输出诊断日志：

```bash
# 全量
adb logcat > splayer-next.log

# 只看崩溃
adb logcat -b crash > crash.log

# 过滤本应用进程
adb logcat --pid=$(adb shell pidof top.imsyy.splayer_next)
```

包名为 `top.imsyy.splayer_next`。重点关注：播放线程（`SPlayerPlayback`）、`KotlinApiServer`、内嵌 Node 运行时输出。

## 服务就绪检查

设备 shell 或同网段设备（开启局域网分享时）可探测服务状态：

```bash
# 网关健康检查，nodeReady 表示内嵌 Node 已就绪
curl http://127.0.0.1:13962/api/health
```

`nodeReady: false` 持续不变时，多为内嵌 Node 启动失败，请附 logcat 反馈。

## WebView 远程调试

Release 包默认关闭 WebView 调试。自编译调试包可在 `capacitor.config.ts` 中开启 `webContentsDebuggingEnabled`，随后在 Chrome 访问 `chrome://inspect` 调试前端页面与 `bridge` 调用。

## 插件调试

Android 端没有桌面版独立的插件 host 子进程与 DevTools 体验：

- 插件的 `console.*` / `splayer.log.*` 输出汇入内嵌运行时日志，经 logcat 查看；
- 修改脚本后在 **设置 → 插件管理** 重新导入即可原地替换；
- 状态为「错误」的插件会在卡片下方显示错误码与原因，对照 [插件总览 · 错误码](/plugins/#错误码)。

## 缓存与存储

- 音频流缓存、封面与歌词缓存可在 **设置 → 本地与缓存** 中查看与清理；
- SQLite 缓存数据库仅允许本机经 `/api/cache/db/*` 访问；
- 升级版本后 WebView 资源缓存会自动清理，无需手动处理。

## 反馈 Checklist

提交 [Issue](https://github.com/SPlayer-CE/SPlayer-for-Android-Next/issues) 前请确认：

- [ ] 已搜索是否存在相同 Issue；
- [ ] 问题出现在 **Android 版**而非桌面版（桌面版问题请去 [SPlayer-Next](https://github.com/SPlayer-Dev/SPlayer-Next)）；
- [ ] 已在最新 Release 上复现且步骤稳定；
- [ ] 附上：**应用版本、设备型号、Android 版本、ABI、复现步骤**；
- [ ] 崩溃或播放异常附 `adb logcat` 输出（崩溃类加 `-b crash`）。
