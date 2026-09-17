# 外部 API（HTTP）

Android 版在设备内提供三层 HTTP 能力：原生网关服务、内嵌 Node 在线接口，以及面向外部程序的外部 API 服务（含 WebSocket 事件广播）。

## 服务拓扑

```
Vue App ──> bridge.ts ──> KotlinApiServer (NanoHTTPD, :13962)
                              ├── /api/health            健康检查（含 nodeReady）
                              ├── /api/lanShare/*        局域网同步与网页播放控制
                              ├── /api/cache/db/*        SQLite 缓存查询（仅本机）
                              └── 代理 /api/* ──> 内嵌 Node API (:13233)
                                                    ├── 在线音乐接口
                                                    ├── 歌词获取
                                                    └── 插件运行时

外部程序 ──> 外部 API 服务 (默认 :6688, 可配置)
              ├── /api/external/*   REST 查询与控制
              └── WebSocket         播放事件订阅与指令下发
```

| 服务            | 端口              | 说明                                                           |
| --------------- | ----------------- | -------------------------------------------------------------- |
| KotlinApiServer | `13962`           | 原生网关：健康检查、局域网分享、缓存查询、代理内嵌 Node        |
| 内嵌 Node API   | `13233`           | Node.js Mobile（Node 12.19）：在线接口、歌词、插件运行时       |
| 外部 API 服务   | 默认 `6688`       | 独立服务，端口可在 1024–65535 间配置，带 token 鉴权            |

## 外部 API

在 **设置 → 网络与服务 → 外部 API** 中配置：

| 设置项         | 说明                                                     |
| -------------- | -------------------------------------------------------- |
| 允许外部控制   | 外部 API 总开关                                          |
| 启用 WebSocket | 外部应用可订阅播放事件并发送控制指令                     |
| 允许局域网访问 | 开启后局域网设备可通过本机 IP 访问，关闭时仅本机可访问   |
| 监听端口       | 1024–65535，端口被占用时会提示更换                       |

### REST 路由

| 路由                        | 方法       | 说明                             |
| --------------------------- | ---------- | -------------------------------- |
| `/api/external/info`        | GET        | 应用名称、版本、WS 客户端数      |
| `/api/external/status`      | GET        | 播放状态、进度、时长、音量       |
| `/api/external/volume`      | GET / POST | 查询 / 设置音量                  |
| `/api/external/now-playing` | GET        | 当前曲目信息                     |
| `/api/external/play`        | POST       | 播放                             |
| `/api/external/pause`       | POST       | 暂停                             |
| `/api/external/stop`        | POST       | 停止                             |
| `/api/external/seek`        | POST       | 跳转进度                         |
| `/api/external/next`        | POST       | 下一首                           |
| `/api/external/prev`        | POST       | 上一首                           |

路由与桌面版外部 API 对齐；启用 WebSocket 后可订阅播放事件并下发控制指令。

### 鉴权与暴露面

- 外部 API 由 `enabled` / `allowLan` / `token` 独立鉴权，未开启时返回 `403`；
- **局域网分享关闭时**，`13962` 端口对非本机请求一律拒绝（含静态资源与 `/api/health`），最小化暴露面；
- `/api/cache/db/*` 仅接受本机请求（供内嵌 Node 访问 SQLite 持久化缓存）。

::: warning 网络环境
开启「允许局域网访问」后，同网段设备即可触及相应服务，请避免在不可信网络（如公共 Wi-Fi）中开启，并妥善保管 token。
:::

## 就绪语义

内嵌 Node 运行时启动需要时间。**未就绪时 `apiFetch` 会直接 reject**，抛出 `[bridge] embedded API is not ready`，而不会返回软失败结果。自动化脚本应：

- 先请求 `GET /api/health`（返回 `{ ok, nodeReady }`）确认网关与 Node 就绪；
- 对 `/api/*` 业务调用做好重试与超时处理。

## 播放地址约定

Android 端的音频源**必须是 WebView 或 ExoPlayer 可安全访问的有效 URL**，例如 `/api/cache/song/play`、`/api/lanShare/audio`。**禁止**传入裸文件绝对路径或 `file://` 协议。

## 桌面版接口对照

桌面版 SPlayer-Next 另提供 MCP（Model Context Protocol）接口；**Android 版不提供 MCP**，外部控制统一走上述外部 API 服务。

## 示例

```bash
# 网关健康检查（本机）
curl http://127.0.0.1:13962/api/health

# 外部 API 查询播放状态（默认端口 6688）
curl http://127.0.0.1:6688/api/external/status

# 局域网内控制播放（需开启允许局域网访问）
curl -X POST http://192.168.1.20:6688/api/external/next
```
