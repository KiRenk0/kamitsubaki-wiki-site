# KAMITSUBAKI FAN WIKI 全域系统架构总览 (Architecture Overview)

> **版本**：v2.0.0 (Master Overview)  
> **文档定位**：全站最高层级系统设计总纲与索引导航  
> **适用范围**：KAMITSUBAKI FAN WIKI 整体数据模型与工程开发  

---

## 一、 顶层产品三大支柱总图

```text
========================================================================================================================
                                             【 KAMITSUBAKI FAN WIKI 】
                                         非官方观测数据库 · 全景架构体系
========================================================================================================================
                                                        │
         ┌──────────────────────────────────────────────┼──────────────────────────────────────────────┐
         ▼                                              ▼                                              ▼
 ┌───────────────────────────────┐              ┌───────────────────────────────┐              ┌───────────────────────────────┐
 │   【 1. 客观百科资料库 】      │              │    【 2. 研究与深度专栏 】     │              │    【 3. 全景纪元时间轴 】     │
 │       OBJECTIVE DATABASE      │              │      RESEARCH & EDITORIAL     │              │       MASTER CHRONICLE        │
 ├───────────────────────────────┤              ├───────────────────────────────┤              ├───────────────────────────────┤
 │ • 严谨事实性 / 参数化词条     │              │ • 深度长篇特稿 / 考据专栏     │              │ • 跨越 8 年历史事件流式呈现   │
 │ • Markdown + Frontmatter 单文 │              │ • 资本 MBO / 艺术哲学 / 商业  │              │ • 独立 Feature Data 架构      │
 │ • 人物/音乐/企划/演出/世界观   │              │ • 多源争议事实交叉消解报告     │              │ • 四大叙事轨道与多维实时筛选  │
 └───────────────────────────────┘              └───────────────────────────────┘              └───────────────────────────────┘
```

---

## 二、 全站数据二元分工总图

整个 Wiki 的数据分为两大物理体系：

```text
KAMITSUBAKI FAN WIKI
│
├─ A. CONTENT ENTRIES (百科独立词条与专栏)
│   │  采用【Markdown + YAML Frontmatter】单文件结构
│   │  规则：一个实体 × 一个语言 = 1个 Markdown 文件
│   │
│   ├── People (个人歌手、创作者、管理团队)
│   ├── Units (演艺音乐组合)
│   ├── Isotopes (音乐同位体声学软件)
│   ├── Songs (单曲作品与乐谱元数据)
│   ├── Releases (唱片出版物与原声大碟)
│   ├── Lives (现场演出与大型活动)
│   ├── Organizations (机构、工作室与厂牌)
│   ├── Projects (企划宇宙与多媒体 IP)
│   ├── Lore (世界观名词与设定住民)
│   └── Articles (深度研究与考据专栏)
│
└─ B. FEATURE DATA (大型功能型数据集)
    │  采用【结构化聚合 YAML】，不强制一条记录一个 Markdown
    │
    ├── Chronicle (全景时间轴数据，按年份存放于 src/data/chronicle/{year}.yml)
    └── Reference Gallery (设定资料图库数据，按主体存放于 src/data/galleries/{subject}.yml)
```

---

## 三、 多语言维护与自动繁简管线

```text
                    zh.md (人工维护唯一主源)
                      │
            Traditional Converter (OpenCC 词汇映射管道)
               /              \
              ▼                ▼
         zh-tw.md           zh-hk.md
       (AUTO-GENERATED)   (AUTO-GENERATED)

            ja.md              en.md
         (人工维护原案)      (人工维护翻译)
```

- **核心原则**：繁体中文（`zh-tw` / `zh-hk`）统一在构建期由 `zh.md` 自动转换生成，严禁手动维护繁体副本。

---

## 四、 全站实体图谱流向拓扑 (Entity Graph)

```text
                           Entity Registry
                                  │
                 ┌────────────────┼────────────────┐
                 │                │                │
                 ▼                ▼                ▼
          Content Entries      Chronicle        Gallery
                 │                │                │
                 │                │                │
              花譜 (KAF)        事件 (Event)     设定图 (Image)
                 │                │                │
       ┌─────────┼───────┐        │                │
       ▼         ▼       ▼        ▼                ▼
      V.W.P     可不     廻花    怪歌现场事件     廻花演出设定图
       │
       ▼
     Releases / Songs
       │
       ├─ Credits ➔ 创作者 (カンザキイオリ / PALOW.)
       ├─ Genre ➔ 曲风 (literature-rock)
       └─ Tracklist ➔ 唱片收录反向索引
```

---

## 五、 设计规范文档导航索引

| 文档名称 | 文件路径 | 核心职责 |
| :--- | :--- | :--- |
| **全域架构总览** | `docs/architecture-overview.md` | [当前文档] 全景大图、数据二元分工、实体图谱与多语言管线 |
| **分类重构主案** | `docs/category-optimization/classification-master-plan.md` | 顶层三大支柱、前台主导航设计、七大百科域分类边界 |
| **详细展开架构** | `docs/category-optimization/classification-detailed-map.md` | 全实体详细展开图、映射对照关系、中立性清洗全录 |
| **内容元数据规范** | `docs/category-optimization/metadata-schema-v2.md` | 11 大 Content Entry 的 Frontmatter 字段表、关系系统、11 组完整实战示例 |
| **功能数据集规范** | `docs/category-optimization/feature-data-architecture.md` | Chronicle 与 Reference Gallery 的专属 Schema、注册表、筛选交互与实战 YAML |
| **深度脑暴探索** | `docs/brainstorming/` | 五大创新功能的前期概念性 UX 探讨（已正式收拢至上方规范中） |
