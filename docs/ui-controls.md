# 共用按钮与表单控件

这些 Astro 封装采用 daisyUI 5 的样式，保留原生 HTML 元素和网站主题。新增页面优先使用它们；字段标签、说明、错误信息和业务脚本仍由页面负责。

```astro
---
import WorkspaceButton from '../components/WorkspaceButton.astro';
import WorkspaceControl from '../components/WorkspaceControl.astro';
---
<form>
  <label for="title">标题</label>
  <WorkspaceControl id="title" name="title" required maxlength="200" />
  <label>类型
    <WorkspaceControl as="select" name="type">
      <option value="">全部</option>
      <option value="song">歌曲</option>
    </WorkspaceControl>
  </label>
  <label>摘要
    <WorkspaceControl as="textarea" name="summary" rows={4}>默认内容</WorkspaceControl>
  </label>
  <label><WorkspaceControl type="checkbox" name="details" />显示更多信息</label>
  <WorkspaceButton type="submit" tone="primary">提交</WorkspaceButton>
  <WorkspaceButton type="reset" tone="quiet">重置</WorkspaceButton>
</form>
```

## 行为约定

- `WorkspaceButton` 支持 `primary`、`secondary`（默认）、`quiet`。`href` 会生成链接；按钮默认 `type="button"`，表单提交和 `method="dialog"` 关闭动作应明确写 `type="submit"`。
- 禁用链接去掉 `href`，保留 `aria-disabled="true"` 和 `tabindex="-1"`；禁用按钮保留原生 `disabled`。原有 `data-*`、`aria-*`、`form` 等属性直接传给元素。
- `WorkspaceControl` 默认生成 `<input>`，通过 `as="select"` / `as="textarea"` 生成原生选择框和多行文本框。`rows` / `cols` 使用数字表达式，例如 `rows={4}`。
- 保留原生 `name`、`value`、`checked`、`required`、`pattern`、`maxlength`、`autocomplete`、`list` 与键盘行为；不插入额外 DOM 容器、不增加客户端初始化脚本。
- 错误状态使用 `aria-invalid="true"`，并通过 `aria-describedby` 关联页面中的错误说明。
- `file`、`hidden`、`radio`、`range` 沿用原生或专用控件；富文本正文、代码编辑器、命令面板、实体卡片和导航项使用各自的实现。

## 样式约定

- daisyUI 使用 `dui-` 前缀，关闭内置主题。每个共用控件自身带有 `data-ui-kit`，可在 WorkspaceShell 内外独立使用。
- `src/styles/uiKit.css` 是网站样式适配层，负责主题变量、按钮层级、焦点、禁用状态和移动字号。不要在每个页面重新定义控件的完整基础样式。
- 保留工作台和编辑器的桌面密度；手机宽度下，输入和选择框使用 16px 字号，普通按钮和文本控件至少 44px 高。多行文本框保留 `rows` 和纵向缩放。
- 工作台工具栏和投稿面板的旧基础规则仅适用于未迁移的原生控件；布局、分组、选中状态和动态内容继续沿用现有 CSS。
- 五种语言的控件文字仍从页面的原有词典取得。

开发时可在 `/zh/ui-preview/` 查看原有控件、daisyUI 原始控件和共用封装的状态。该页面不生成生产路由。
