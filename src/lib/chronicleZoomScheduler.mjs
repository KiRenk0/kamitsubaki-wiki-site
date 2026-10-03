/** Coalesce zoom painting and URL writes while a slider or pinch gesture is active. */
export function createChronicleZoomScheduler({render,commit,requestFrame=requestAnimationFrame,cancelFrame=cancelAnimationFrame,setTimer=setTimeout,clearTimer=clearTimeout,delay=300}){
 let frame=null,timer=null,pending=null;
 const paint=()=>{frame=null;const anchor=pending;pending=null;render(anchor);};
 const finish=()=>{if(timer===null)return;clearTimer(timer);timer=null;commit();};
 const cancel=()=>{if(timer!==null)clearTimer(timer);timer=null;if(frame!==null)cancelFrame(frame);frame=null;pending=null;};
 const schedule=anchor=>{pending=anchor;if(frame===null)frame=requestFrame(paint);if(timer!==null)clearTimer(timer);timer=setTimer(()=>{timer=null;commit();},delay);};
 return {schedule,finish,cancel,hasPending:()=>timer!==null};
}
