import { localEditor } from "./editorConfig.mjs";
export const isLocalEditorMode = () =>
  localEditor && /\/contribute\/editor\/?$/.test(location.pathname);
