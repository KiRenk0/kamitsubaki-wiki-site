# 图片投稿页面排版统一 — 2026-10-03

分支：V3.0.0-ui-optimization。本轮修改保留工作区已有改动，未部署。

## 页面

- `/[locale]/gallery/manage/?mode=sets`：上方紧凑设定目录，左侧共用资料、右侧图片；基本信息、来源与使用依据、选填补充分区。选填补充默认折叠。
- `/[locale]/gallery/manage/photos/`：左侧整批共用资料，右侧照片；明确单张覆盖资料的作用范围。
- `/[locale]/gallery/manage/legacy/`：左侧资料、右侧文件选择和预览；提交历史独立在下方。沿用原表单字段与提交逻辑。
- `/[locale]/gallery/classify/`：左侧分类建议，右侧选中的照片。

共用 `SubmissionPanel.astro`、`submissionLayout.css` 和五语言引导文案。900px 以下按资料、图片的顺序堆叠；520px 以下字段单列。设定图片卡片的单张补充默认折叠，缩略图接入已有大图查看器。

## 验证

- 前端测试：544/544 通过，日志 `/tmp/wiki-submission-tests.log`。
- Astro check：559 文件，0 errors、0 warnings、86 hints，日志 `/tmp/wiki-submission-check-final.log`。
- 完整 `pnpm build` 通过，包括内容校验、简繁生成和图库清单校验。内容校验有 1036 项既有警告、0 错误。最终日志 `/tmp/wiki-submission-build-final.log`。
- 4 个相关样式表通过 Lightning CSS 解析。
- 检查五种语言 × 四个入口的 20 份生成 HTML：两栏顺序、原有表单字段、文件选择器与序列化引导文案完整；脚本 `/tmp/check-submission-layout.py`。
- 本地应用内浏览器 `/zh/design/creation/` 读取到了资料、图片两栏和分区文案。1280px 视口下两栏顶部均为 578.48px，宽分别为 520.20px、635.80px。

## 未验证边界

应用内浏览器随后多次出现点击、重新载入和连接超时。图片卡片展开、大图预览与手机端实际点击验收尚未通过；静态样式和 HTML 检查不替代这些交互验收。没有执行真实账号上传、投稿或审核，也没有上线。
