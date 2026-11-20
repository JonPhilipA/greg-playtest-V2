import {COMPUTATION_AREAS} from './computation-layout.js';
import {DEVELOPMENT_ENVIRONMENTS} from './development-environments.js';
import {splitGallery} from './curriculum-profile.js';
import {GALLERY_SPLIT_ENVIRONMENTS} from './gallery-split-layout.js';
// Physical scene coordinates are independent of permanent puzzle IDs and campaign room access.
const station=(puzzleId,label,x,y,w,h,walk,fixture=puzzleId)=>Object.freeze({id:'station-'+puzzleId,puzzleId,label,x,y,w,h,walk,fixture,kind:'repair'});
const environmentFor=key=>GALLERY_SPLIT_ENVIRONMENTS[key]||DEVELOPMENT_ENVIRONMENTS[key];
export const SCENE_WORKSTATIONS=Object.freeze({
 gallery:Object.freeze([
  station('sensordiff','P09 · Conflicting Sensor Monitor',114,127,180,50,212,'p09-before'),
  station('xorfab','P10 · XOR Construction / Signal Reconstruction',432,135,181,42,523,'p10-initial'),
 ]),
 testbay:Object.freeze([
  Object.freeze({id:'station-signed-binary',kind:'tutorial',label:'Signed Binary Tutorial · Training Console',x:103,y:135,w:94,h:40,walk:151,fixture:'signed-explore'}),
  station('cryo_signed','P11 · Cryogenic & Motor Diagnostics',416,123,44,49,438),
  station('hull','P12 · Hull Sensor Voter / Structural Test',708,145,68,50,742),
  station('pressure_width','P13 · Pressure Register / Vessel Instrument',800,119,70,44,835),
 ]),
 computation:Object.freeze(COMPUTATION_AREAS.map(a=>station(a.id,'P'+a.number+' · '+({navbits:'Half Adder',trajectory:'Full Adder',ripple_adder:'Four-Bit Ripple-Carry Adder',twos_complement:"Two’s Complement Converter",addsub:'Adder/Subtractor Circuit'}[a.id]),a.station.x,a.station.y,a.station.w,a.station.h,a.station.walk))),
 blackbox:Object.freeze([
  station('adc_precision','ASCII Transmission Terminal · Unnumbered',561,116,102,59,609),
  station('log_overflow','P14 · Navigation Log Overflow / Data Recovery',697,121,70,31,741),
 ]),
});
export const WORKSTATION_PICKUP=Object.freeze({id:'pickup-gallery.xor',pickupId:'gallery.xor',label:'Loose XOR gate on the floor',name:'Loose XOR gate on the floor',x:96,y:196,w:34,h:26,walk:142});
export const workstationSceneKey=w=>w?.environmentWorkstations===true&&Object.hasOwn(SCENE_WORKSTATIONS,w.environmentPreview)?w.environmentPreview:w?.environmentPreview?null:splitGallery(w)?({sensors:'gallery',testbay:'testbay',blackbox:'blackbox',computation:'computation'}[w.room]||null):null;
export const sceneWorkstations=w=>SCENE_WORKSTATIONS[workstationSceneKey(w)]||null;
export const sceneWorkstation=(w,id)=>sceneWorkstations(w)?.find(s=>s.id===id)||null;
export function workstationHotspots(w){
 const stations=sceneWorkstations(w);if(!stations)return null;
 const env=environmentFor(workstationSceneKey(w)),inspections=env.hotspots.filter(h=>['preview-entrance','preview-exit','preview-array','preview-recorder'].includes(h.id));
 const authored=w.environmentWorkstations?inspections:inspections.map(h=>h.id==='preview-entrance'?{...h,id:'back',label:env.stops[0].label}:h.id==='preview-exit'?{...h,id:'forward',label:env.stops.at(-1).label}:h.id==='preview-recorder'?{...h,id:'watch-record',label:'Flight recorder · optional command trace'}:{...h,id:'scene-observation'});
 return [...authored,...stations,...(workstationSceneKey(w)==='gallery'&&w.foundation?.curriculum?.xorUseVersion===1?[WORKSTATION_PICKUP]:[])];
}
export function workstationStops(w){
 const stations=sceneWorkstations(w);if(!stations)return null;
 const env=environmentFor(workstationSceneKey(w));
 return [env.stops[0],...(workstationSceneKey(w)==='gallery'&&(!w.foundation||w.foundation.curriculum?.xorUseVersion===1)?[{id:'xor-pickup',label:'Loose XOR gate',x:WORKSTATION_PICKUP.walk}]:[]),...stations.map(s=>({id:s.id,label:s.label,x:s.walk})),env.stops.at(-1)];
}
export function workstationObjective(w){
 const stations=sceneWorkstations(w);if(!stations||!w.environmentWorkstations)return null;
 const next=stations.find(s=>s.kind==='tutorial'?!w.foundation.curriculum.concepts['decoder.signed']:!w.machines[s.puzzleId]?.certified);
 return next?'WORKSTATION TEST · '+next.label+' · Temporary fixture; not saved.':'ROOM WORKSTATIONS COMPLETE · Temporary fixture; campaign route unchanged.';
}
