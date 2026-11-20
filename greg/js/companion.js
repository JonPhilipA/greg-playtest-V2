// Presentation-only pose. Never serialized and never used to authorize game commands.
import {clamp} from './exploration.js';
export function createCompanion(actor){return {x:Math.max(12,actor.x-actor.facing*22),y:173,vx:0,vy:0,facing:actor.facing,walking:false};}
export function updateCompanion(p,actor,dt,time,{camera=0,width=480,reduced=false}={}){
 const low=Math.max(12,camera+12),high=Math.min(width-12,camera+468),target=clamp(actor.x-actor.facing*(actor.walking?28:22),low,high);
 p.facing=actor.facing;p.walking=actor.walking;
 const y=173+(reduced?0:Math.sin(time*2.2)*.7+Math.sin(time*.81)*.25);
 if(reduced){p.x=target;p.y=y;p.vx=0;p.vy=0;return p;}
 let remaining=Math.min(.1,Math.max(0,dt));
 while(remaining>0){const step=Math.min(1/120,remaining);p.vx+=((target-p.x)*42-p.vx*9)*step;p.vy+=((y-p.y)*36-p.vy*8)*step;p.x+=p.vx*step;p.y+=p.vy*step;remaining-=step;}
 const bounded=clamp(p.x,low,high);if(bounded!==p.x)p.vx=0;p.x=bounded;return p;
}
export function companionHotspot(w,pose){
 const actorX=w.positions?.[w.room]??70,p=pose??createCompanion({x:actorX,facing:1});
 return {id:'greg',label:'Speak to G.R.E.G.',x:p.x-13,y:p.y-3,w:26,h:29,walk:actorX};
}

