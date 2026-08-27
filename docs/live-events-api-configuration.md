# 实时活动 API 配置指南

站点是纯静态 Astro 应用。实时活动小组件和活动日历都由浏览器直接请求外部 API，不经过本站服务器，也不会把任何私密凭据藏在服务端。

## 1. 前端配置

新增的公开环境变量为：

```dotenv
PUBLIC_EVENTS_API_BASE=https://events-api.example.com
```

- 变量只填写 API 基地址，不要包含末尾 `/`，也不要包含 `/v1/events`。
- 未配置时默认使用 `https://api.kamitsubaki.wiki`。
- `PUBLIC_` 变量会被编译到公开的 JavaScript 中，因此严禁在这里放 API Key、Bearer Token 或其他秘密。
- 本地开发可把变量写入未提交的 `.env.local`，部署时应在托管平台的环境变量设置中配置，然后重新构建站点。仓库根目录的 `.env.example` 是可入库的模板，复制为 `.env.local` 后按需修改即可。

配置后运行：

```bash
pnpm check
pnpm test
pnpm build
```

首页“观测动态”仍以日本标准时间判断“今日”并请求 `date` 参数，但每条活动会同时显示：

- 访问者浏览器当前时区的日期和时间（例如 `Asia/Hong_Kong`）；
- 日本标准时间（JST，`Asia/Tokyo`）的日期和时间。

小组件顶部时钟按访问设备当前设置的时区显示本地日期与时间，左侧使用该时刻的 GMT 偏移标记（例如 `GMT+08:00`），并在每个整分钟自动刷新。

成功取得并校验响应后，首页小组件会把当天活动写入浏览器 `localStorage`。缓存按 API 基地址、语言和 JST 日期隔离；后续无法连接 API 时，会显示最后一次成功同步的本机缓存并继续每 30 秒重试。缓存损坏、被禁用或尚不存在时，仍显示普通的不可用提示。缓存只包含公开活动字段，不包含凭据或用户信息。

## 2. API 端点

前端请求以下端点：

```http
GET {PUBLIC_EVENTS_API_BASE}/v1/events
```

支持两种查询方式：

```http
# 首页小组件：获取日本时间某一天
GET /v1/events?date=2026-08-16&locale=zh

# 日历页面：获取闭区间内的活动
GET /v1/events?from=2026-08-01&to=2026-08-31&locale=ja
```

参数约定：

| 参数 | 必填 | 格式 | 说明 |
| --- | --- | --- | --- |
| `date` | 与日期范围二选一 | `YYYY-MM-DD` | 日本标准时间下的单日查询 |
| `from` | 与 `to` 同时提供 | `YYYY-MM-DD` | 查询开始日期，包含当天 |
| `to` | 与 `from` 同时提供 | `YYYY-MM-DD` | 查询结束日期，包含当天 |
| `locale` | 是 | `zh`、`zh-tw`、`zh-hk`、`ja`、`en` | 返回内容优先使用的语言 |

日期范围建议限制在 42 天以内。前端日历目前每次只请求一个自然月。

## 3. 响应格式

成功响应应返回 JSON 对象：

```json
{
  "events": [
    {
      "id": "kaf-youtube-20260816",
      "title": "花譜 YouTube Live",
      "artist": "花譜",
      "location": "YouTube",
      "startAt": "2026-08-16T20:00:00+09:00",
      "endAt": "2026-08-16T21:30:00+09:00",
      "allDay": false,
      "status": "upcoming",
      "url": "https://www.youtube.com/watch?v=example"
    }
  ],
  "updatedAt": "2026-08-16T09:15:00Z"
}
```

`events` 也可以直接作为顶层数组返回，但推荐使用对象格式，方便以后增加分页、来源摘要和缓存信息。

字段约定：

| 字段 | 必填 | 类型 | 说明 |
| --- | --- | --- | --- |
| `id` | 推荐 | string | 稳定且跨刷新不变的活动 ID |
| `title` | 是 | string | 已分析、去重后的活动标题 |
| `artist` | 否 | string | 主要相关艺人或组合 |
| `location` | 否 | string | 平台、场馆或城市 |
| `startAt` | 是 | ISO 8601 string | 必须包含明确时区；推荐 `+09:00` |
| `endAt` | 否 | ISO 8601 string | 必须包含明确时区 |
| `allDay` | 否 | boolean | 全天活动设为 `true` |
| `status` | 否 | string | `live`、`upcoming`、`ended`、`cancelled`；其他值按 `upcoming` 展示 |
| `url` | 否 | string | 官方详情页，仅接受 `http` 或 `https` |

无活动时返回 `200` 和空数组，不要返回 `404`：

```json
{ "events": [], "updatedAt": "2026-08-16T09:15:00Z" }
```

## 4. 跨域与缓存

由于请求由访客浏览器直接发起，API 必须支持 CORS。生产环境建议：

```http
Access-Control-Allow-Origin: https://kamitsubaki.wiki
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Accept
Cache-Control: public, max-age=20, s-maxage=25, stale-while-revalidate=60
Content-Type: application/json; charset=utf-8
```

预览环境可显式加入对应域名。不要在生产环境反射任意 `Origin`，也不需要允许 Cookie；前端使用 `credentials: omit`。

页面可见时，小组件和日历每 30 秒请求一次。页面进入后台时轮询与当前请求会停止，恢复可见后立即刷新。因此 API 应支持短时缓存、请求合并和合理的频率限制。

## 5. 数据采集与分析建议

外部 API 应在服务端完成采集，不要让浏览器直接抓取 YouTube、X、Bilibili 或票务站点：

1. 通过官方 API、RSS、iCalendar 或允许抓取的公开页面获取候选记录。
2. 标准化艺人名称、时区、开始/结束时间和官方链接。
3. 以官方活动 ID 或“艺人 + 开始时间 + 平台”生成稳定 ID，并进行跨来源去重。
4. 优先保留艺人、主办方和官方票务渠道的信息；保存来源和抓取时间供后端审计。
5. 将推断内容与已确认内容分开。只有确认日期的活动才进入当前接口；不确定时间不要伪造。
6. 对标题等文本做长度限制和清理。前端使用 `textContent` 渲染，但后端仍应拒绝异常负载。

建议由定时任务每 5–15 分钟采集一次，在直播开始前后提高频率，并在活动结束后保留历史记录，日历才能查询过去活动。

## 6. 错误处理

- 参数错误返回 `400`；超出允许日期范围返回 `422`。
- 频率限制返回 `429`，并附 `Retry-After`。
- 临时上游故障返回 `503`；不要返回结构不完整的伪成功数据。
- 前端遇到非 `2xx`、无效 JSON 或无效 `events` 结构时，会显示本地化回退文案，不会抛出未处理异常。
- API 未部署时无需修改前端；默认地址请求失败后会自然进入回退状态。

## 7. 部署拓扑：本地与云服务器统一入口

前端应固定指向公网 HTTPS 域名 `https://api.kamitsubaki.wiki`（即代码内置默认值），API 实际运行在本地还是云服务器由路由层决定，前端与构建配置无需区分。

**为什么 `localhost` 不能进入正式构建：**

1. 本站是纯静态站点，API 请求由每位访客的浏览器直接发起。把 `http://localhost:8787` 编译进产物后，访客请求的是他们自己的本机，而非 API 所在的机器。
2. `https://kamitsubaki.wiki` 页面向 `http://` 地址发起的请求会被浏览器按混合内容（mixed content）拦截。
3. 前端 `buildEventsUrl` 使用不带 base 的 `new URL()`，只接受绝对 URL，相对路径（如 `/api`）会直接抛错。

**两种部署场景共用同一配置 `PUBLIC_EVENTS_API_BASE=https://api.kamitsubaki.wiki`：**

| 场景 | 路由方式 | 说明 |
| --- | --- | --- |
| API 部署在云服务器 | DNS / 反向代理将 `api.kamitsubaki.wiki` 指向服务器实例 | 服务器需配置有效 TLS 证书，直接对外提供 HTTPS |
| API 运行在本地 | 用隧道工具把本机服务映射到同一域名，例如 `cloudflared tunnel` 或 frp 将本地 `8787` 端口暴露为 `api.kamitsubaki.wiki` | 隧道终止于公网入口，访客无需能直连本地机器 |

两种场景下 API 都必须按第 4 节要求为 `https://kamitsubaki.wiki` 提供正确的 CORS 头。

**构建与变量来源：**

- `.env.local` 被 `.gitignore` 排除、不会入库，仅用于本机覆盖。
- 托管平台应设置环境变量 `PUBLIC_EVENTS_API_BASE=https://api.kamitsubaki.wiki`；不设置时自动使用代码内置的相同默认值。
- `PUBLIC_` 变量在构建期内联到产物中，修改后必须重新构建并部署才会生效。

## 8. 上线检查

可先用下面的命令验证 API，再配置站点：

```bash
curl -i "https://events-api.example.com/v1/events?date=2026-08-16&locale=zh"
curl -i "https://events-api.example.com/v1/events?from=2026-08-01&to=2026-08-31&locale=en"
```

检查响应时确认：状态码为 `200`、`Content-Type` 正确、浏览器来源获得正确 CORS 头、所有时间带时区、空结果使用空数组。随后设置 `PUBLIC_EVENTS_API_BASE`、重新构建并分别打开 `/zh/` 与 `/zh/events`；断网测试应显示回退文案，切换后台 30 秒后不应继续发出请求。
