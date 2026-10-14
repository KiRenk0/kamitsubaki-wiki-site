export function formatCommunityLocation(activity,locale='zh',convert=value=>value){
 const country=activity.country?new Intl.DisplayNames([locale],{type:'region'}).of(activity.country):'';
 const label=key=>locale.startsWith('zh')&&activity.locationLabels?.[key]?convert(activity.locationLabels[key]):convert(activity[key]||'');
 return [country,label('subdivision'),label('city'),convert(activity.venue||'')].filter((value,index,all)=>value&&all.indexOf(value)===index).join(' · ');
}
