import {resolveLocaleCopy} from './i18n.mjs';
import {entityLabels as labels} from './entityLabelData.mjs';

export function entityLabel(key,locale='zh'){const row=labels[key];return row?resolveLocaleCopy({zh:row[0],en:row[1],ja:row[2]},locale):key;}
