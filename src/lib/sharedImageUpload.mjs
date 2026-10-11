// Reuse the gallery's private staging and review API. A transfer never publishes
// an image. Keep the operation object on failure so retry uses the same batch.
export async function submitSharedImages(operation,{request,upload,onBatch=()=>{},onState=async()=>{},onPhase=()=>{}}){
 if(operation.submittedAttempt){const current=await request(`/batches/${operation.id}`);if(current.batch.status==='submitted')return {batchId:operation.id,status:'submitted'};operation.batch=current.batch;}
 if(!operation.batch){operation.batch=(await request('/batches','POST',{id:operation.id,kind:'photos'})).batch;onBatch(operation.batch);await onState(operation);}
 const saved=await request(`/batches/${operation.id}`,'PUT',{version:operation.batch.version,manifest:{kind:'photos',defaults:operation.metadata,photos:operation.files.map(file=>({fileId:file.id,metadata:{title:file.file.name}}))}});
 operation.batch=saved.batch;await onState(operation);
 const pending=operation.files.filter(file=>!file.staged);
 if(pending.length){
  onPhase('upload');
  const results=await upload(pending,operation.id);
  for(const result of results){const file=operation.files.find(file=>file.id===result.id);if(file&&!result.error)file.staged=true;}
  await onState(operation);
  const error=results.find(result=>result.error)?.error;
  if(error)throw error;
  if(operation.files.some(file=>!file.staged))throw Error('upload_incomplete');
 }
 operation.submittedAttempt=true;await onState(operation);onPhase('submit');
 try{return await request(`/batches/${operation.id}/submit`,'POST',{version:operation.batch.version});}
 catch(error){
  // A lost submit response must not generate another submission on retry.
  if(error.status===409){const current=await request(`/batches/${operation.id}`);if(current.batch.status==='submitted')return {batchId:operation.id,status:'submitted'};}
  throw error;
 }
}
