import {selectFeaturedAnnouncement} from './announcements.mjs';

export function dashboardAnnouncementIndex(entries,{includeDrafts=false}={}){
 const eligible=entries.filter(e=>includeDrafts||!e.data.draft),featured=selectFeaturedAnnouncement(eligible,{includeDrafts});
 const latest=eligible.filter(e=>e!==featured).sort((a,b)=>b.data.date.localeCompare(a.data.date)).slice(0,2);
 const items=[featured,...latest].filter(Boolean).map(e=>{
  const d=e.data,id=d.translationKey||e.id;
  return {id,title:d.title,summary:d.summary,date:d.date,type:d.type,draft:!!d.draft,pinned:!!d.pinned,important:!!d.pinned&&d.autoOpen!==false,reminderVersion:d.reminderVersion||1};
 });
 return {items,featuredId:items[0]?.id||'',preview:!!items[0]?.draft};
}
