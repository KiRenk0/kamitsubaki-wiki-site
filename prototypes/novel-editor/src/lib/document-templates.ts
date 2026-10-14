export const documentTemplates = [
  {
    type: "editorial-article",
    label: "文章",
    description: "整理资料、写人物侧写或研究文章。",
  },
  {
    type: "virtual-avatar",
    label: "虚拟艺人",
    description: "例如花譜、理芽等虚拟歌手。",
  },
  {
    type: "person",
    label: "人物",
    description: "现实艺人、创作者或工作人员。",
  },
  {
    type: "unit",
    label: "组合",
    description: "组合成员、活动资料与所属关系。",
  },
  {
    type: "software-voice",
    label: "音乐同位体",
    description: "声库、声源与所支持的演唱引擎。",
  },
  {
    type: "work-track",
    label: "歌曲",
    description: "演唱者、制作名单、歌词与视听。",
  },
  {
    type: "work-release",
    label: "唱片",
    description: "专辑、EP、发行资料与收录曲目。",
  },
  {
    type: "live-event",
    label: "演出",
    description: "演出时间、地点、阵容和相关资料。",
  },
  {
    type: "project",
    label: "企划",
    description: "游戏、跨媒体或其他创作企划。",
  },
  {
    type: "organization",
    label: "组织",
    description: "厂牌、工作室或其他相关机构。",
  },
  {
    type: "lore-concept",
    label: "设定",
    description: "世界观中的人物、地点或术语。",
  },
] as const;
export type DocumentTemplateType = (typeof documentTemplates)[number]["type"];
