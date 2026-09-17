# 原生与桥接

Android 版的原生能力由 **Kotlin（Capacitor 插件 + Media3）** 与 **内嵌 Node.js Mobile** 共同承担；桌面版的 Rust 原生模块**不打包进 Android 端**。

## 桥接架构

Android 是基于 Capacitor 的构建目标，通过 `src/services/bridge.ts` 抹平平台差异：

```
Vue App -> bridge.ts -> Capacitor 插件 / KotlinApiServer (:13962)
  -> AndroidNativePlaybackPlugin -> PlaybackManager -> Media3 ExoPlayer
  -> KotlinApiServer (:13962) -> Node.js Mobile API (:13233) 处理在线请求
```

`main.ts` 在 Android 端将 `bridge` 挂载为 `window.api`。**任何向 `window.api` 新增的方法，都必须在 `bridge.ts` 中同步提供 Android 端实现或降级空实现（no-op）**，否则设备运行时会因找不到方法而崩溃。

## Capacitor 插件一览

`MainActivity.kt` 注册以下插件：

| 插件                        | 职责                                             |
| --------------------------- | ------------------------------------------------ |
| `AndroidNativePlaybackPlugin` | 起播 / 暂停 / 跳转 / 音量 / 均衡器 / 灵动岛悬浮歌词 / 前台服务控制 |
| `AndroidClipboardPlugin`    | 剪贴板读写                                       |
| `AndroidAppIconPlugin`      | 应用图标相关能力                                 |
| `AndroidLocalLyricPlugin`   | SAF 歌词目录、字体导入与外挂歌词检索             |
| `AndroidMainLyricPlugin`    | 全屏歌词原生 Canvas 渲染层                       |
| `AndroidDownloadPlugin`     | 下载目录授权与下载任务                           |
| `AndroidCachePlugin`        | 封面 / 歌词等缓存管理                            |
| `AndroidSongCachePlugin`    | 音频流缓存                                       |
| `AndroidLanSharePlugin`     | 局域网分享与跨端同步                             |
| `AndroidLibraryPlugin`      | 本地音乐库扫描与管理（SAF + SQLite）             |
| `ApiServerPlugin`           | KotlinApiServer 生命周期控制                     |
| `ExternalApiPlugin`         | 外部 API 服务门控                                |

## 播放线程模型

`PlaybackManager.kt` 拥有专属 `HandlerThread("SPlayerPlayback", Process.THREAD_PRIORITY_AUDIO)`，统一驱动 ExoPlayer、MediaSession 与 Media3 `DefaultPreloadManager`（预载下一曲开头 10s）：

- 跨线程交互严格通过 `runOnPlaybackThread`（异步）与 `onPlaybackThread`（同步锁）收口；
- 跨线程状态读取使用 volatile 线程安全快照；
- **ExoPlayer、MediaSession 与 PreloadManager 只能在该线程操作**，禁止从主线程或 Capacitor 桥接线程直接触碰；
- `PlaybackUrlResolver.kt` 对音源候选并行竞速，缩短切歌延迟；
- `PlaybackService.kt` 在 `onCreate` 中立即于主线程以轻量占位通知升级为前台服务，规避 Android 14+ 的前台服务启动超时（FGS Timeout）崩溃，就绪后再更新为 MediaStyle 完整通知；
- `webViewVisible` 机制：App 切后台时静默高频频谱 / 进度推送以节省功耗。

## 原生歌词层

- `AndroidMainLyricPlugin.kt` + `MainPlayerLyricOverlayView.kt`：全屏歌词 Canvas 原生渲染，叠加在 WebView 之上；
- `LyricBlurController.kt` 逐行模糊规范：
  - 模糊位图 LRU 缓存预算上限为最大堆内存的 1/8（16MB~48MB）；
  - 0.5x 降采样渲染（计算开销降至 1/8，视觉近无损）；
  - 档位过渡采用「起点档 + 目标档」双位图叠化，禁止逐帧新建位图；
  - API 31+ 对退场直绘行启用 `RenderNode` + `RenderEffect` GPU 硬件模糊（最多 3 个实例）；
- `AndroidMainLyricHost.vue` 使用模块级所有权令牌 `activeKotlinHostToken`，解决横竖屏旋转重建时旧实例 `clear()` 晚于新实例 `setLyrics()` 导致歌词被清空的竞态；
- 原生歌词层默认吞噬触摸事件，竖屏快捷弹窗通过 `touchExclusionSelector` 逐帧上报 DOM 物理像素矩形注册避让区。

## 内嵌 Node.js Mobile

- 入口 `API/mobile-entry.ts`，经 `scripts/build-android-node.ts` 打包为 ES2019 CJS；
- 内嵌运行时为 **Node 12.19.0**：无全局 fetch、不支持 `node:` 协议前缀（由 esbuild 插件剥离）；
- **禁止劫持全局 DNS**：切勿在 `mobile-entry.ts` 中猴子补丁篡改 `dns.lookup`，否则 `listen(13233, "127.0.0.1")` 可能被 Fake-IP 代理篡改导致绑定失败；DNS 覆盖收敛于 `API/public-dns.ts` 的 Agent 级控制；
- `postinstall` 必须执行 `tsx scripts/patch-nodejs-mobile-cordova.ts`，否则 Android 构建必定失败。

## WebView 规范

- `MainActivity` 在 `attachBaseContext` 中强制锁定 `config.fontScale = 1.0f`，防止系统字体放大破坏排版；
- 版本升级（versionCode 变动）时通过 `clearWebViewCacheOnUpgrade` 清除 WebView 资源缓存；
- 横屏沉浸模式同时隐藏状态栏与手势导航条（`PREF_IMMERSIVE_LANDSCAPE`）。

## 移动端动效纪律（FullPlayerMobile）

- 严禁对 `width`、`font-size` 等引发 Layout Reflow 的属性做动画，一律使用 `transform: translate3d(...) scale(...)` 与 `opacity`；
- 文本缩放基准矩形选字号较大的一侧（从大到小 scale 保持清晰）；
- 伴随图标用透明度渐隐 + 相邻文字平移覆盖，不压缩宽度；
- `onBeforeUnmount` 必须清理动画定时器与 `cancelAnimationFrame`；
- 不参与飞行的副信息在起飞前淡出、返回时淡入。

## 桌面端原生模块（不包含于 Android）

桌面版的 Rust 原生模块（`audio-engine`、`audio-capture`、`media-ctrl`、`taskbar-lyric`、`taskbar-thumbnail`、`opencc`）**不打包进 Android 端**——Android 的播放与系统集成由 Kotlin 原生实现。相关文档见桌面版站点 [splayer-next.imsyy.top](https://splayer-next.imsyy.top/) 的「原生模块」页。
