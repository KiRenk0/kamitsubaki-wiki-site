# Beta 工作区

本任务使用独立目录 `F:\kamitsubaki-wiki-site-beta`，本机检出并继续提交到 `beta`；任务分支 `task/20261115-beta-roadmap` 保留首批实现的提交位置。基于远端 beta 合入 origin/main 的 `d29886af1`。原目录 `F:\kamitsubaki-wiki-site` 的 main 与 Nearby 工作由原任务管理，本任务没有覆盖其文件。两个目录各自拥有依赖、构建、缓存与临时文件；Git 对象共享，工作文件独立。

使用 `.node-version` 指定的 Node.js 22.23.4 和 pnpm 11.1.1：

```sh
pnpm install --frozen-lockfile
pnpm dev:beta
pnpm build:beta
pnpm archive:audit
```

Beta 本机入口是 `http://127.0.0.1:18430/zh/`。上述 beta 命令把 API 固定到 `127.0.0.1:18431`，账号 companion 固定到 `127.0.0.1:18432`，并启用现有隔离来源注册表。未启动本机服务时，账号与社区功能会显示不可用；不使用生产账号或生产数据作为替代。不要将 main 的 `.env`、数据库、Cookie 或凭据复制到此目录。

目前没有 beta 专用线上环境。社区的本地 fixture／workerd 检查、正式账号联调、第三方播放器和真实相机验收分别记录；本地测试通过不表示已经上线。旧 `dev:online` 和 `build:online` 为既有正式服务联调命令，不用于本任务的 beta 本机预览。

当前范围见 [roadmap](docs/v3/fan-archive-roadmap.md)，最新证据见[第二批验收](qa/2026-11-15-beta-roadmap/continuation-acceptance.md)，[首批验收](qa/2026-11-15-beta-roadmap/acceptance.md)保留历史结果。完整资料覆盖与未解决差异见[审计报告](qa/2026-11-15-beta-roadmap/archive-audit.json)。
