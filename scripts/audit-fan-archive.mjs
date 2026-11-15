import {getArchiveSnapshot} from '../src/lib/archiveSnapshot.mjs';
import {archiveModules} from '../src/lib/archiveResearch.mjs';

// Read-only inventory. Coverage describes this snapshot, never the entire history.
const snapshot=await getArchiveSnapshot();
const tracks=snapshot.entities.filter(row=>row.type==='work-track');
const lives=snapshot.entities.filter(row=>row.type==='live-event');
const releases=snapshot.entities.filter(row=>row.type==='work-release');
const editions=releases.flatMap(row=>(row.facts.editions || []).map(edition=>({entityId:row.id,...edition})));
const count=(rows,predicate)=>rows.filter(predicate).length;
const report={version:1,snapshot:snapshot.snapshot,modules:archiveModules,
 coverage:{entities:snapshot.entities.length,relations:snapshot.relations.length,events:snapshot.events.length,
  songs:{total:tracks.length,withCredits:count(tracks,row=>row.facts.credits?.length),withRecordedMedia:count(tracks,row=>row.media?.length),withBpm:count(tracks,row=>row.facts.genome?.bpm),withSourcedTags:count(tracks,row=>row.facts.genome?.tags?.length)},
  lives:{total:lives.length,withSetlists:count(lives,row=>row.facts.setlist?.length),withCompleteSetlists:count(lives,row=>row.facts.setlistStatus==='complete'),withCoordinates:count(lives,row=>row.facts.venue?.coordinates),withTickets:count(lives,row=>row.facts.liveInfo?.tickets?.length)},
  physical:{items:snapshot.physical.length,editions:editions.length,withBarcode:count([...snapshot.physical,...editions],row=>row.barcode)},
  sources:{entities:count(snapshot.entities,row=>row.facts.sources?.length),fieldClaims:snapshot.evidence.length},
  visuals:{withDates:snapshot.entities.flatMap(row=>row.facts.visualHistory || []).filter(row=>row.date).length},
 },
 unresolved:{relations:snapshot.issues.filter(row=>row.kind==='unresolved-relation'),factDrift:snapshot.issues.filter(row=>row.kind==='fact-drift'),identities:snapshot.issues.filter(row=>row.kind==='unverified-record'),fieldClaims:snapshot.evidence.filter(row=>row.status!=='reviewed').map(({id,entityId,field,status,sourceIds,note})=>({id,entityId,field,status,sourceIds,note}))},
 acceptance:{local:'See the dated QA report for commands and actual results.',online:'Not assessed by this read-only inventory. Record environment and normal-account validation separately.',device:'Real camera, media provider and physical-device acceptance remain separate from fixtures.'},
};
console.log(JSON.stringify(report,null,2));
if(report.unresolved.relations.length)process.exitCode=1;
