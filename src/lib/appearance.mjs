export const themeStorageKey='kamitsubaki-theme';
export const accentStorageKey='kamitsubaki-interface-accent';
export const themeValues=['light','dark','system'];
export const accentValues=['mono','blue','violet','amber'];
export const normalizeTheme=value=>themeValues.includes(value)?value:'system';
export const normalizeAccent=value=>accentValues.includes(value)?value:'mono';
export const resolveTheme=(preference,dark)=>normalizeTheme(preference)==='system'?(dark?'dark':'light'):normalizeTheme(preference);
