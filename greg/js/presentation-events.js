export class GregReactions{
 constructor(now=()=>performance.now()){this.now=now;this.until=0;this.kind=null;}
 react(kind){if(!['skeptical','approving','excited','surprised'].includes(kind))return;this.kind=kind;this.until=this.now()+2200;}
 current(){return this.now()<this.until?this.kind:null;}
}
/** One primary cue per accepted transaction. It cannot call commands or change a graph. */
export function presentOperation(events,{audio,reactions,onDiscovery=()=>{},onBlueprint=()=>{},onPickup=()=>{}}={}){
 const has=type=>events?.some(e=>e.type===type),cue=id=>{try{audio?.effect(id);}catch{}},react=kind=>{try{reactions?.react(kind);}catch{}};
 if(has('component.found')){cue('S01');react('excited');for(const event of events)if(event.type==='component.found')try{onPickup(event);}catch{}return;}
 if(has('component.discovered')||has('blueprint.acquired')){if(has('component.discovered'))react('excited');for(const event of events)try{if(event.type==='component.discovered')onDiscovery(event);else if(event.type==='blueprint.acquired')onBlueprint(event);}catch{}return;}
 if(has('machine.repaired')){cue('S12');react('approving');}
 else if(has('circuit.test_failed')){cue('S08');react('skeptical');}
 else if(has('circuit.test_passed')){cue('S07');react('approving');}
 else if(has('clock.rising_edge'))cue('S09');
 else if(has('input.toggled'))cue('S05');
 else if(has('component.picked_up'))cue('S01');
 else if(has('component.returned')||has('component.removed')||has('panel.cleared')||has('wire.disconnected'))cue('S04');
 else if(has('wire.connected'))cue('S03');
 else if(has('component.placed'))cue('S02');
 else if(has('component.unavailable'))cue('S08');
 else if(has('circuit.test_started'))cue('S06');
}
