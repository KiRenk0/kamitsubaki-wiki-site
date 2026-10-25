import {setLoadingStatus} from './loadingStatus.mjs';
import TomSelect from 'tom-select/base';
import clearButton from 'tom-select/plugins/clear_button/plugin.js';
import {autoUpdate} from '@floating-ui/dom';
import {positionEditorSurface} from './editorPopover.mjs';
import {DateTime} from 'luxon';
TomSelect.define('clear_button',clearButton);
if(typeof window!=='undefined'){
window.CommunityTomSelect=TomSelect;
window.CommunityLoadingStatus=setLoadingStatus;
window.CommunityLocationWatch=autoUpdate;
window.CommunityLocationPosition=(reference,surface,options)=>positionEditorSurface(reference,surface,{...options,matchReferenceWidth:true});
window.CommunityDateTime=DateTime;

}
