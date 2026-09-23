export function galleryQueueSummary(sets,files){
 const staged=files.filter(f=>f.state==='staged').length,failed=files.filter(f=>f.state==='failed').length;
 const issues=[];for(const set of sets){if(!set.character)issues.push({set:set.id,field:'character',message:`${set.title}：请选择角色`});if(!files.some(f=>f.set===set.id))issues.push({set:set.id,field:'images',message:`${set.title}：请添加本组照片`});}
 for(const file of files){if(file.decodeError)issues.push({set:file.set,file:file.id,message:`${file.file.name}：无法读取图片`});if(file.state!=='staged'&&file.fileInfo)issues.push({set:file.set,file:file.id,message:`${file.fileInfo.name}：需要重新选择本机文件`});}
 return {total:files.length,staged,failed,pending:files.length-staged,issues,ready:files.length>0&&staged===files.length&&issues.length===0};
}
