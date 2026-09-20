# Project Content

Projects are grouped by project type:

```text
arg/          ARG and narrative project records
labels/       label or studio records
exhibitions/  exhibition and event records
```

Use one folder per project and one Markdown file per locale:

```text
arg/kamitsubaki-city/zh.md
arg/kamitsubaki-city/ja.md
arg/kamitsubaki-city/en.md
```

The first folder level is used for classification and the project cards in `02. PROTOCOLS` are rendered automatically from these files.

Each Markdown file also maps to a detail route:

```text
/{locale}/projects/<category>/<project>
```

The display order is controlled by the `order` field in frontmatter.
