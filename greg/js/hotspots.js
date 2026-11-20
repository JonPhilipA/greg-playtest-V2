import {workstationHotspots,sceneWorkstation,sceneWorkstations} from './scene-workstations.js';
import {puzzleAvailability} from './progression.js';
import {equipmentCondition,EQUIPMENT_LABELS} from './equipment-condition.js';
import {gardenDecoderComplete} from './garden-decoder.js';
import {canTravelTo} from './progression.js';
import {openingEnvironment,OPENING_HOTSPOTS,OPENING_PICKUPS} from './opening-layout.js';
import {GALLERY_HOTSPOTS} from './gallery-layout.js';
import {isGalleryCurriculum} from './gallery-puzzles.js';
import {analysisEnvironment,developmentEnvironment} from './development-environments.js';
import {corePowered,CORE_SWITCH_ID,CORE_SWITCH} from './opening-state.js';
import {WORKSHOP_HOTSPOTS} from './workshop-layout.js';
import {companionHotspot} from './companion.js';
import {extendedGarden,GARDEN_HOTSPOTS,GARDEN_PICKUPS} from './exploration.js';
import {isEarly,serviceState,roomRepairIds} from './curriculum-profile.js';
// Hitboxes are authored separately from every sprite and background.
import {CAMPAIGN_ROOMS,CAMPAIGN_REPAIRS,CAMPAIGN_ORDER,canAdvance,repairedRoom,serviceSlots,nandDoors} from './campaign.js';
import {isInventoryPilot,PICKUP_LOCATIONS,pickupAvailability} from './inventory-gameplay.js';
export function roomHotspots(w,pose){if(!corePowered(w))return [{...CORE_SWITCH}];return [...(workstationHotspots(w)??developmentEnvironment(w)?.hotspots??authoredHotspots(w)).map(h=>isEarly(w)&&w.room==='life'&&h.id==='watch-record'?{...h,label:'Garden monitoring terminal · Binary Data Decoder'}:h).filter(h=>h.id===CORE_SWITCH_ID||(h.id!=='greg'&&!h.id.startsWith('greg-'))),companionHotspot(w,pose)];}
function authoredHotspots(w){if(w.room==='computation'&&analysisEnvironment(w)&&!w.environmentPreview)return analysisEnvironment(w).hotspots.map(h=>h.id==='preview-entrance'?{...h,id:'back'}:h.id==='preview-exit'?{...h,id:'forward'}:h);if(isGalleryCurriculum(w))return [...GALLERY_HOTSPOTS,...(w.foundation.curriculum.xorUseVersion===1?[{...PICKUP_LOCATIONS['gallery.xor'],id:'pickup-gallery.xor',label:PICKUP_LOCATIONS['gallery.xor'].name,pickupId:'gallery.xor'}]:[])];if(openingEnvironment(w))return [...OPENING_HOTSPOTS[w.room],...((isInventoryPilot(w)||isEarly(w))?Object.entries(OPENING_PICKUPS).filter(([id])=>PICKUP_LOCATIONS[id].room===w.room).map(([id,p])=>({...p,id:'pickup-'+id,label:PICKUP_LOCATIONS[id].name,pickupId:id})):[])];if(w.room==='relay')return [...WORKSHOP_HOTSPOTS,...((isInventoryPilot(w)||isEarly(w))?[{...PICKUP_LOCATIONS['workshop.nand-cache'],id:'pickup-workshop.nand-cache',label:PICKUP_LOCATIONS['workshop.nand-cache'].name,pickupId:'workshop.nand-cache'}]:[])];if(extendedGarden(w)){const repairs=roomRepairIds(w,'life',CAMPAIGN_ROOMS.life.repairs);return [...GARDEN_HOTSPOTS.filter(h=>!h.id.startsWith('repair-')||repairs.includes(h.id.slice(7))),...((isInventoryPilot(w)||isEarly(w))?Object.entries(PICKUP_LOCATIONS).filter(([id,p])=>p.room==='life'&&(id!=='garden.demorgan-kit'||serviceState(w)?.triggered)).map(([id,p])=>({...p,...GARDEN_PICKUPS[id],id:'pickup-'+id,label:p.name,pickupId:id})):[])];}const base=ROOMS[w.room].hotspots;if(isEarly(w)&&w.room==='life')return [...base.filter(h=>!h.id.startsWith('repair-')),...serviceSlots('life',w).map(({id,...slot})=>({id:'repair-'+id,label:CAMPAIGN_REPAIRS[id].short+' service cover',...slot})),...Object.entries(PICKUP_LOCATIONS).filter(([id,p])=>p.room===w.room&&(id!=='garden.demorgan-kit'||serviceState(w)?.triggered)).map(([id,p])=>({...p,id:'pickup-'+id,label:p.name,pickupId:id}))];return [...base,...((isInventoryPilot(w)||isEarly(w))?Object.entries(PICKUP_LOCATIONS).filter(([id,p])=>p.room===w.room&&(id!=='garden.demorgan-kit'||isEarly(w))).map(([id,p])=>({...p,id:'pickup-'+id,label:p.name,pickupId:id})):[])];}
export const ROOMS={
  engine:{title:'The engine room',subtitle:'DECK 03 / AUXILIARY ENGINEERING',spawn:247,hotspots:[
    {id:'fan',label:'Ventilation blower',x:73,y:82,w:98,h:126,walk:156},
    {id:'sensor',label:'Scorched signal sensor',x:197,y:149,w:24,h:39,walk:207},
    {id:'gauge',label:'Pressure gauge',x:237,y:57,w:52,h:52,walk:250},
    {id:'vent-panel',label:'Blower service cover',x:235,y:123,w:49,h:59,walk:250},
    {id:'locker',label:'Engineer’s locker',x:322,y:161,w:48,h:47,walk:330},
    {id:'engine-door',label:'Maintenance hatch',x:374,y:84,w:94,h:126,walk:357},
    {id:'greg',label:'Speak to G.R.E.G.',x:22,y:86,w:40,h:52,walk:69},
  ]},
  corridor:{title:'The maintenance corridor',subtitle:'DECK 03 / SERVICE PASSAGE',spawn:70,hotspots:[
    {id:'return',label:'Return to engine room',x:3,y:67,w:58,h:147,walk:61},
    {id:'reader',label:'Authorization reader',x:316,y:132,w:27,h:41,walk:309},
    {id:'pressure',label:'Pressure safety sensor',x:235,y:115,w:40,h:45,walk:239},
    {id:'security-panel',label:'Interlock service cover',x:274,y:156,w:45,h:54,walk:287},
    {id:'security-door',label:'Security bulkhead',x:357,y:80,w:92,h:133,walk:344},
    {id:'archive',label:'Maintenance archive · optional',x:387,y:126,w:29,h:38,walk:402},
    {id:'greg',label:'Speak to G.R.E.G.',x:86,y:78,w:30,h:39,walk:112},
  ]},
};
export function hotspotState(w,id){
  if(sceneWorkstations(w)){const station=sceneWorkstation(w,id);if(station?.kind==='tutorial')return w.foundation.curriculum.concepts['decoder.signed']?'training / practice':'training / calibrate';if(station?.puzzleId==='adc_precision')return w.foundation.curriculum.asciiActivity?.complete?'training / practice':'training / decode';if(station?.puzzleId){const state=puzzleAvailability(w,station.puzzleId).state;return state==='APPLIED'?'repaired / online':state==='BUILDABLE'||state==='TESTED'?'fault / inspect':'standby / prerequisites';}if(id.startsWith('pickup-'))return pickupAvailability(w,id.slice(7)).state;}
  if(developmentEnvironment(w))return id==='greg'?'preview assistance':'planned · read only';
  if(isGalleryCurriculum(w)&&id.startsWith('planned-'))return 'planned · no progress';
  if(id===CORE_SWITCH_ID)return corePowered(w)?'ON · emergency core protected':'OFF · activate emergency power';
  if(id.startsWith('pickup-'))return pickupAvailability(w,id.slice(7)).state;
  if(id==='repair-scrubber'&&serviceState(w)?.triggered&&!serviceState(w).applied)return 'hardware fault';
  if(id.startsWith('repair-')){const state=equipmentCondition(w,id.slice(7));return state==='repaired'?'repaired / online':EQUIPMENT_LABELS[state]?.toLowerCase()||'inspect';}
  if(id==='vent-panel'||id==='security-panel'||id==='fabricator')return EQUIPMENT_LABELS[equipmentCondition(w,id==='vent-panel'?'ventilation':id==='security-panel'?'security':'fabricator')]?.toLowerCase()||'inspect';
  if(id==='back'&&w.room==='relay')return nandDoors(w).back?'released':'sealed';
  if(id==='forward')return canAdvance(w,w.room)?'released':'sealed';
  if(id==='watch-record'&&isEarly(w)&&w.room==='life')return !w.machines.safetycutoff.certified?'monitor / unpowered':gardenDecoderComplete(w)?'binary decoder / calibrated':'binary decoder / calibrate';
  if(id==='watch-record')return repairedRoom(w,w.room)?(w.logs.includes('record_'+w.room)?'optional / recovered':'optional / unread'):'unpowered';
  if(id==='onward')return canTravelTo(w,'life')?'released':'locked';
  if(id==='engine-door')return w.doors.engine?'released':'sealed';
  if(id==='security-door')return w.doors.security?'open':'locked';
  if(id==='reader')return w.machines.ventilation.certified?'authorized':'unpowered';
  if(id==='pressure')return w.pressure<45?'safe':'danger';
  if(id==='fan')return w.machines.ventilation.status;
  if(id==='sensor')return w.sensors.vent;
  if(id==='archive')return w.doors.security?'accessible':'behind bulkhead';
  if(id==='locker')return 'optional / crew identification';
  return 'inspect';
}
ROOMS.corridor.hotspots.push({id:'onward',label:'Crew-deck lift',x:142,y:131,w:64,h:78,walk:171});
for(const id of Object.keys(CAMPAIGN_ROOMS)){
  const r=CAMPAIGN_ROOMS[id];
  ROOMS[id]={title:r.title,subtitle:r.subtitle,spawn:70,hotspots:[
    {id:'back',label:'Return to previous deck',x:3,y:91,w:53,h:120,walk:61},
    {id:'machine-info',label:id==='bridge'?'Flight helm':r.title+' machinery',x:87,y:102,w:130,h:108,walk:159},
    ...serviceSlots(id).map(({id:key,...slot})=>({id:'repair-'+key,label:CAMPAIGN_REPAIRS[key].short+' service cover',...slot})),
    {id:'watch-record',label:'Watch record terminal',x:274,y:90,w:28,h:38,walk:287},
    {id:'forward',label:id==='bridge'?'Engage flight control':'Forward deck hatch',x:394,y:87,w:75,h:126,walk:380},
    {id:'greg',label:'Speak to G.R.E.G.',x:75,y:55,w:34,h:44,walk:112},
  ]};
}
