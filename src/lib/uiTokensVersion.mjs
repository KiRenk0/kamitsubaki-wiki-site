import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

export const uiTokensVersion=createHash('sha256')
  .update(readFileSync(resolve('public/ui-tokens.css')))
  .digest('hex')
  .slice(0,12);
