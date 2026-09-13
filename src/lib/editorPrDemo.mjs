export const submissionLabels = {open:'待审核',changes:'需要修改',merged:'已合并 · 发布中',published:'已发布',failed:'部署失败',closed:'已关闭'};
export const isOpen = entry => !!entry && ['open','changes'].includes(entry.status);
export function submitRevision(previous, snapshot, summary, source, number) {
  if (previous && previous.path !== snapshot.path) throw new Error('投稿词条不匹配。');
  if (previous && !isOpen(previous)) throw new Error('这份投稿已结束，请先在“我的投稿”中查看结果。');
  if (!summary.trim()) throw new Error('请填写修改说明。');
  if (previous?.content === snapshot.content) throw new Error('内容与上次提交相同，请先在编辑器中修改。');
  return {...snapshot, number:previous?.number ?? number, revision:(previous?.revision||0)+1, summary:summary.trim(), source, status:'open', checks:'pending', approved:false, comments:previous?.comments||[]};
}
export function diffLines(before, after) {
  const a=before.split('\n'), b=after.split('\n');let start=0,tail=0;
  while(start<Math.min(a.length,b.length)&&a[start]===b[start])start++;
  while(tail<Math.min(a.length-start,b.length-start)&&a[a.length-1-tail]===b[b.length-1-tail])tail++;
  return [...a.slice(start,a.length-tail).map((text,i)=>({type:'removed',line:start+i+1,text})),...b.slice(start,b.length-tail).map((text,i)=>({type:'added',line:start+i+1,text}))];
}
