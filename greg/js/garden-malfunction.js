import {serviceState,servicePending} from './curriculum-profile.js';
/** Detached historical view. Retired hardware never enters the editable inventory draft. */
export function damagedScrubberGraph(w){
 const s=serviceState(w);if(!s?.original?.graph)return null;
 const graph=structuredClone(s.original.graph);for(const node of graph.nodes)if(!node.fixed)node.faulty=true;return graph;
}
export function needsScrubberInspection(w,id,{practice=false}={}){
 const s=serviceState(w);return !practice&&id==='scrubber'&&servicePending(w)&&!s.replacementStarted&&!s.draft.nodes.some(n=>!n.fixed);
}
/** Presentation state only; no simulation, inventory or progression authority. */
export function advanceGardenStress(a,w,dt,reduced=false){
 const target=Number(servicePending(w));a.gardenStress??=target;
 a.gardenStress=reduced?target:a.gardenStress+(target-a.gardenStress)*(1-Math.exp(-Math.max(0,dt)*(target?1.8:3)));
 if(Math.abs(a.gardenStress-target)<.002)a.gardenStress=target;
 if(Number.isFinite(a.scrubberFailureTime))a.scrubberFailureTime+=Math.max(0,dt);
}
