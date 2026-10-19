# 观测面板

全站由 BaseLayout 挂载一个 ObserverDashboard，区域为总览、公告、AI、工具。发电保留独立按钮与现有渠道窗口。首页原活动宣传区和旧公告窗口退出首页；旧活动、工具、AI 独立浮动组件不再挂载。它们的历史兼容组件仍保留。

## 内容与排期

总览先展示最多两条观测者企划，再展示公告和最多两条官方活动。首条企划保留完整海报比例，第二条紧凑展示；没有活动时收起对应区域。官方信息直接链接来源原文。活动读取 `/api/activity-center?recommend=1&placement=dashboard`：后端合并原 home、floating 的精选及自动补位资格、去重并保持排序，原运营记录不改写。center 投放仍独立。效果报表位置为「观测面板」，原首页及浮窗汇总继续保留。

公告继续在 `src/content/announcements` 发布，使用现有 translationKey、pinned、autoOpen、order。新增正整数 reminderVersion，默认1；仅在重要修订确实需要再次提醒时由编辑者递增，普通文字修正保持版本。提醒使用 translationKey 与 reminderVersion，不随语言切换重复触发。只有当前精选同时启用 pinned 和 autoOpen 才是重要提醒。原公告历史页与锚点不变。

构建生成 `/{locale}/dashboard/announcements.json`，只含精选与最近两条摘要。全文分别在 `announcements/{translationKey}.json` 按需加载，沿用现有 Markdown 渲染及安全过滤。生产构建排除草稿；本机开发记录使用独立 preview 存储键。摘要中的「已展示」仅控制提示，不代表已读。

## 自动打开与交互

按浏览器本地日期，在无锚点首页开场真正完成后，首次访问打开总览；同日新的重要提醒版本可以补弹。开场结束通过 wiki-site-intro-complete 协调，取消旧固定延时。其他页面手动打开。用户先操作工具、打开其他窗口或开始浏览，取消当次自动提示。后台页面待可见才判断；返回缓存页面不会重新打断。社群旧锚点 #social-contact 优先打开工具区域。

原生 dialog 提供背景隔离、焦点范围、Esc、背景点击与关闭按钮；关闭恢复触发元素及原页面滚动位置。动画为 CSS 和 Web Animations API，减少动态效果和键盘操作即时切换。编辑器、游戏、PhotoSwipe 放大继续隐藏悬浮入口。

localStorage 按浏览器跨语言共享；失败时退至 sessionStorage；两者均不可写则只保留手动入口。预览与公开记录分开。关闭时不加载活动海报、公告全文或 AI 运行时。无 JavaScript 保留普通日历、公告、工具、发电链接。

AI 复用一个 AiChatWidget 的 embedded 模式，首次选择 AI 才动态加载控制器、聊天组件和模型连接；总览打开不初始化聊天。区域切换与面板关闭不销毁会话或取消请求；返回后草稿与串流继续。账号切换取消旧请求、清空旧消息与输入；浏览器 bfcache 返回保留 UI。真实模型、登录供应商与 Turnstile 的生产连通性需单独验证。

## 隔离验收

沿用维护入口的精确本机来源注册表，不使用生产 Cookie、模型或数据库。开发模式专用 `/__local__/dashboard` 可清除本机提示记录、模拟昨天、调整合成提醒版本；`/__local__/dashboard/viewport` 提供390px视口。两个路由仅在 WORKSPACE_ISOLATED=true 的开发服务器安装，不进入构建产物。

后端预览脚本可显式设置 ACTIVITY_PREVIEW_AI_FIXTURE=true，提供标明「本机合成」的 bootstrap、历史和 SSE；默认关闭，计数可从 `/__local__/fixtures` 查看。不调用真实模型。改期、取消、权限、缓存及统计口径继续按活动中心契约验证。

受影响测试包括 tests/dashboard.test.mjs、tests/reader-tools.test.mjs、tests/intro-skip.test.mjs 及后端 activity-center 测试。交付仍须执行 CONTRIBUTING 中的完整检查、实际手机/桌面开关与导航、公告去重、AI 草稿/串流/停止、账号及图库回归。截图须标明本机合成数据；本机通过不代表生产发布。
