import {servePagefindAsset} from '../../../_shared/pagefindAsset.mjs';

export const onRequest=context=>servePagefindAsset(context,'fragment');
