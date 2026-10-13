import {renderCommunityPage} from '../../../_shared/communityPage.mjs';
export const onRequestGet=context=>['apply','read'].includes(context.params.id)?context.env.ASSETS.fetch(context.request):renderCommunityPage(context,'activity');
