import {DOOR_CENTERS,doorBounds,doorHotspot,analysisDoorCenter,floorSurface,DOOR_HEIGHT} from './room-door-layout.js';
import {workstationHotspots,sceneWorkstation,sceneWorkstations} from './scene-workstations.js';
import {puzzleAvailability} from './progression.js';
import {equipmentCondition,EQUIPMENT_LABELS} from './equipment-condition.js';
import {gardenExitPhase} from './garden-exit.js';
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
export function roomHotspots(w,pose){
  if(!corePowered(w))return [{...CORE_SWITCH}];
  const environment=analysisEnvironment(w);
  const entries=workstationHotspots(w)??developmentEnvironment(w)?.hotspots??authoredHotspots(w);
  const backIds=['back','preview-entrance'];
  const forwardIds=['forward','preview-exit','gallery-exit'];
  return [...entries.filter(h=>h.id===CORE_SWITCH_ID||(h.id!=='greg'&&!h.id.startsWith('greg-'))).map(h=>{
    if(environment&&(backIds.includes(h.id)||forwardIds.includes(h.id))){
      return {...h,...doorBounds(analysisDoorCenter(environment.width,forwardIds.includes(h.id)),floorSurface(w).back)};
    }
    if([...backIds,...forwardIds,'return','onward','engine-door'].includes(h.id))return {...h,y:floorSurface(w).back-DOOR_HEIGHT};
    return h;
  }),companionHotspot(w,pose)];
}
function authoredHotspots(w){if(w.room==='navigation'&&w.circuits.float_nav)return [...ROOMS.navigation.hotspots.filter(h=>!h.id.startsWith('repair-')),...serviceSlots('navigation',w).map(({id,...slot})=>({id:'repair-'+id,label:CAMPAIGN_REPAIRS[id].short+' workstation',...slot}))];if(w.room==='computation'&&analysisEnvironment(w)&&!w.environmentPreview)return analysisEnvironment(w).hotspots.map(h=>h.id==='preview-entrance'?{...h,id:'back'}:h.id==='preview-exit'?{...h,id:'forward'}:h);if(isGalleryCurriculum(w))return [...GALLERY_HOTSPOTS,...(w.foundation.curriculum.xorUseVersion===1?[{...PICKUP_LOCATIONS['gallery.xor'],id:'pickup-gallery.xor',label:PICKUP_LOCATIONS['gallery.xor'].name,pickupId:'gallery.xor'}]:[])];if(openingEnvironment(w))return [...OPENING_HOTSPOTS[w.room],...((isInventoryPilot(w)||isEarly(w))?Object.entries(OPENING_PICKUPS).filter(([id])=>PICKUP_LOCATIONS[id].room===w.room).map(([id,p])=>({...p,id:'pickup-'+id,label:PICKUP_LOCATIONS[id].name,pickupId:id})):[])];if(w.room==='relay')return [...WORKSHOP_HOTSPOTS,...((isInventoryPilot(w)||isEarly(w))?[{...PICKUP_LOCATIONS['workshop.nand-cache'],id:'pickup-workshop.nand-cache',label:PICKUP_LOCATIONS['workshop.nand-cache'].name,pickupId:'workshop.nand-cache'}]:[])];if(extendedGarden(w)){const repairs=roomRepairIds(w,'life',CAMPAIGN_ROOMS.life.repairs);return [...GARDEN_HOTSPOTS.filter(h=>!h.id.startsWith('repair-')||repairs.includes(h.id.slice(7))),...((isInventoryPilot(w)||isEarly(w))?Object.entries(PICKUP_LOCATIONS).filter(([id,p])=>p.room==='life'&&(id!=='garden.demorgan-kit'||serviceState(w)?.triggered)).map(([id,p])=>({...p,...GARDEN_PICKUPS[id],id:'pickup-'+id,label:p.name,pickupId:id})):[])];}const base=ROOMS[w.room].hotspots;if(isEarly(w)&&w.room==='life')return [...base.filter(h=>!h.id.startsWith('repair-')),...serviceSlots('life',w).map(({id,...slot})=>({id:'repair-'+id,label:CAMPAIGN_REPAIRS[id].short+' service cover',...slot})),...Object.entries(PICKUP_LOCATIONS).filter(([id,p])=>p.room===w.room&&(id!=='garden.demorgan-kit'||serviceState(w)?.triggered)).map(([id,p])=>({...p,id:'pickup-'+id,label:p.name,pickupId:id}))];return [...base,...((isInventoryPilot(w)||isEarly(w))?Object.entries(PICKUP_LOCATIONS).filter(([id,p])=>p.room===w.room&&(id!=='garden.demorgan-kit'||isEarly(w))).map(([id,p])=>({...p,id:'pickup-'+id,label:p.name,pickupId:id})):[])];}
export const ROOMS={
  engine:{title:'The engine room',subtitle:'DECK 03 / AUXILIARY ENGINEERING',spawn:247,hotspots:[
    {id:'fan',label:'Ventilation blower',x:73,y:82,w:98,h:126,walk:156},
    {id:'sensor',label:'Scorched signal sensor',x:197,y:149,w:24,h:39,walk:207},
    {id:'gauge',label:'Pressure gauge',x:237,y:57,w:52,h:52,walk:250},
    {id:'vent-panel',label:'Blower service cover',x:235,y:123,w:49,h:59,walk:250},
    doorHotspot(DOOR_CENTERS.compactEngine,'engine-door','Maintenance hatch',357),
    {id:'greg',label:'Speak to G.R.E.G.',x:22,y:86,w:40,h:52,walk:69},
  ]},
  corridor:{title:'The maintenance corridor',subtitle:'DECK 03 / SERVICE PASSAGE',spawn:70,hotspots:OPENING_HOTSPOTS.corridor},
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
  if(id==='forward'&&w.room==='life'&&gardenExitPhase(w))return {locked:'calibration required',ready:'unlocked',emergency:'emergency lock',released:'released'}[gardenExitPhase(w)];
  if(id==='forward')return canAdvance(w,w.room)?'released':'sealed';
  if(id==='binary-decoder')return gardenDecoderComplete(w)?'calibration complete':w.machines.safetycutoff?.certified?'calibration required':'unpowered';
  if(id==='watch-record'&&isEarly(w)&&w.room==='life')return !w.machines.safetycutoff.certified?'monitor / unpowered':gardenDecoderComplete(w)?'binary decoder / calibrated':'binary decoder / calibrate';
  if(id==='watch-record')return repairedRoom(w,w.room)?(w.logs.includes('record_'+w.room)?'optional / recovered':'optional / unread'):'unpowered';
  if(id==='onward')return canTravelTo(w,'life')?'released':'locked';
  if(id==='engine-door')return canTravelTo(w,'corridor')?'released':'sealed';
  if(id==='reader')return w.machines.ventilation.certified?'authorized':'unpowered';
  if(id==='pressure')return w.pressure<45?'safe':'danger';
  if(id==='fan')return w.machines.ventilation.status;
  if(id==='sensor')return w.sensors.vent;
  return 'inspect';
}
for(const id of Object.keys(CAMPAIGN_ROOMS)){
  const r=CAMPAIGN_ROOMS[id];
  ROOMS[id]={title:r.title,subtitle:r.subtitle,spawn:70,hotspots:[
    doorHotspot(DOOR_CENTERS.compactBack,'back','Return to previous deck',84),
    {id:'machine-info',label:id==='bridge'?'Flight helm':r.title+' machinery',x:87,y:102,w:130,h:108,walk:159},
    ...serviceSlots(id).map(({id:key,...slot})=>({id:'repair-'+key,label:CAMPAIGN_REPAIRS[key].short+' service cover',...slot})),
    {id:'watch-record',label:'Watch record terminal',x:274,y:90,w:28,h:38,walk:287},
    doorHotspot(DOOR_CENTERS.compactForward,'forward',id==='bridge'?'Engage flight control':'Forward deck hatch',380),
    {id:'greg',label:'Speak to G.R.E.G.',x:75,y:55,w:34,h:44,walk:112},
  ]};
}
