import {renderCommunityPage} from '../../../_shared/communityPage.mjs';
export const onRequestGet=context=>context.params.id==='read'?context.env.ASSETS.fetch(context.request):renderCommunityPage(context,'series');
