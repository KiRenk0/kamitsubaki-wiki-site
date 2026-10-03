export function removeChronicleSourceRow(form,row){
 if(form.querySelectorAll('[data-source-row]').length===1){
  row.querySelectorAll('input').forEach(input=>{input.value='';});
 }else row.remove();
}
