import TomSelect from 'tom-select/base';
import clearButton from 'tom-select/plugins/clear_button/plugin.js';
import {autoUpdate} from '@floating-ui/dom';
import {positionEditorSurface} from './editorPopover.mjs';
TomSelect.define('clear_button',clearButton);
if(typeof window!=='undefined'){
window.CommunityTomSelect=TomSelect;
window.CommunityLocationWatch=autoUpdate;
window.CommunityLocationPosition=positionEditorSurface;

}
