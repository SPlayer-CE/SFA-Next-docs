# 安装与更新

## 我该下载哪个 APK？

**无脑选 `arm64-v8a`**——绝大多数现代设备都是它。完整对照：

|       ABI       | 适用设备                       |   推荐度   |
| :-------------: | ------------------------------ | :--------: |
| **`arm64-v8a`** | 绝大多数现代手机 / 平板        | ⭐⭐⭐⭐⭐ |
|  `armeabi-v7a`  | 2015 年前的老旧 32 位 ARM 设备 |    ⭐⭐    |
|    `x86_64`     | Intel 平板、Android 模拟器     |     ⭐     |
|      `x86`      | 极少数 32 位 Intel 设备        |     ⭐     |

不确定时安装 CPU-Z 查看 ABI，或执行：

```bash
adb shell getprop ro.product.cpu.abi
```

## 提示「未知来源」/ 禁止安装

APK 未上架应用商店，系统会拦截侧载。在安装确认弹窗中选择 **允许本次安装**；若被跳转系统设置，请为浏览器 / 文件管理器开启「安装未知应用」。

## 解析包时出现问题

1. **系统版本过低**：最低要求 **Android 10（API 29）**，更低版本无法安装；
2. **ABI 不匹配**：换 `arm64-v8a` 重试；
3. **下载不完整**：核对 Release 中的 `.sha256` 校验文件；
4. **传输损坏**：避免经即时通讯软件传包，改用直连下载或 `adb install`。

## 首次启动很慢

应用内嵌 Node.js Mobile 运行时与 WebView 资源，首次启动需要解压与初始化；**版本升级后**还会自动清理 WebView 资源缓存（`clearWebViewCacheOnUpgrade`），升级后首启偏慢属正常现象。

## 覆盖安装失败

不同签名（如 Release 签名与本地自编译的调试签名）之间无法覆盖安装。请先备份设置与本地数据，卸载旧版后再安装。

## 安装后闪退

- 确认系统 WebView 组件不是过旧版本；
- 确认设备剩余存储充足；
- 抓取崩溃日志后[提交 Issue](https://github.com/SPlayer-CE/SPlayer-for-Android-Next/issues)：

  ```bash
  adb logcat -b crash > crash.log
  ```

Android 14+ 设备若在前台服务启动阶段闪退，请附完整 logcat（见 [调试与日志](/troubleshooting/debug)）。
