import {signedTutorialRequired} from './signed-binary.js';
import {gardenExitPhase} from './garden-exit.js';
import {gardenDecoderComplete} from './garden-decoder.js';
import {isEarly,galleryEnabled,serviceState,roomRepairIds,splitGallery,campaignRoute,puzzleRoom} from './curriculum-profile.js';
import {ACTIVE_PROFILE,getPuzzle,getPlayablePuzzle,ROOM_IDS,roomPuzzles} from './puzzle-definitions.js';
import {canonicalJSON} from './circuit-revision.js';
const result = (missing=[]) => ({ok:!missing.length,missing,message:missing.map(x=>x.message).join(' ')});
const definition=(id,profile,w)=>profile==='curriculum'?(()=>{const p=getPuzzle(id);return p&&{...p,roomId:puzzleRoom(w,id,p.roomId),roomAccessRequirements:{...p.roomAccessRequirements,roomId:puzzleRoom(w,id,p.roomAccessRequirements.roomId)}};})():getPlayablePuzzle(id,w);
export const isWorkshopBusy=w=>w.room==='relay'&&w.nandEvent?.triggered===true&&w.nandEvent.elapsed<2.6;
export function checkRepairStatus(w,id,{profile=ACTIVE_PROFILE}={}){
  return profile==='curriculum'||(isEarly(w)&&id==='scrubber') ? w.foundation?.curriculum?.completed?.[id]===true : w.machines?.[id]?.certified===true;
}
export function checkStoryRecords(w,ids=[]){return result(ids.filter(id=>!w.logs?.includes(id)).map(id=>({kind:'record',id,message:'Recover the '+id.replaceAll('_',' ')+' story record.'})));}
export function checkConcepts(w,concepts=[]){return result(concepts.filter(id=>!w.foundation?.curriculum?.concepts?.[id]).map(id=>({kind:'concept',id,message:'Complete the '+id+' demonstration or competency check.'})));}
export function checkPrerequisites(w,id,{profile=ACTIVE_PROFILE}={}){
  const p=definition(id,profile,w);
  if(!p)return result([{kind:'content',id,message:getPuzzle(id)?'This repair is planned for a later implementation package.':'Unknown puzzle.'}]);
  const missing=p.prerequisites.filter(dep=>!(dep==='ripple_adder'&&w.foundation.curriculum.rippleLegacy)&&!checkRepairStatus(w,dep,{profile})).map(dep=>({kind:'repair',id:dep,message:p.id==='xorfab'&&dep==='sensordiff'?'XOR construction requires the sensor disagreement lesson.':'Restore '+getPuzzle(dep).name+' first.'}));
  if(id==='log_overflow'&&galleryEnabled(w)&&!w.foundation.curriculum.asciiActivity?.complete)missing.push({kind:'concept',id:'ascii.transmission',message:'Calibrate the ASCII Transmission Terminal first.'});
  if(id==='cryo_signed'&&signedTutorialRequired(w))missing.push({kind:'concept',id:'decoder.signed',message:'Complete the Signed Binary Tutorial at the Environmental Test Bay training console.'});
  missing.push(...checkConcepts(w,p.conceptPrerequisites).missing);
  if((profile==='curriculum'||(galleryEnabled(w)&&['sensordiff','xorfab'].includes(id)))&&p.toolPolicy.requiresFabrication&&!w.foundation?.fabrication?.nand)missing.push({kind:'tool',id:'fabrication.nand',message:'The NAND fabrication system is not yet operational.'});
  for(const cert of p.requiredCertifications)if(!w.foundation?.curriculum?.certifications?.[cert])missing.push({kind:'certification',id:cert,message:'Construct and certify '+cert+' before this repair.'});
  return result(missing);
}
export function checkRoomRepairs(w,room,{profile=ACTIVE_PROFILE}={}){
  return result((((isEarly(w)&&room==='life')||(galleryEnabled(w)&&room==='sensors')||(splitGallery(w)&&['testbay','blackbox','computation','navigation'].includes(room)))?roomRepairIds(w,room,room==='life'?['alarm','scrubber']:[]).map(id=>getPlayablePuzzle(id,w)):roomPuzzles(room,profile)).filter(p=>!checkRepairStatus(w,p.id,{profile})).map(p=>({kind:'repair',id:p.id,message:'Restore '+p.name+' to release this room.'})));
}
export function checkRoomRelease(w,room,{profile=ACTIVE_PROFILE}={}){
  if(!ROOM_IDS.includes(room))return result([{kind:'room',id:room,message:'Unknown room.'}]);
  if(profile==='compatibility'&&room==='engine')return result(w.machines?.ventilation?.certified&&w.doors?.engine?[]:[{kind:'pressure',message:'Restore ventilation and wait for safe pressure.'}]);
  if(profile==='compatibility'&&room==='corridor')return result(w.machines?.security?.certified&&w.doors?.security?[]:[{kind:'repair',id:'security',message:'Restore the bulkhead interlock and maintain safe engine pressure.'}]);
  const missing=checkRoomRepairs(w,room,{profile}).missing.filter(m=>!(m.id==='ripple_adder'&&w.foundation.curriculum.rippleLegacy));
  if(room==='blackbox'&&galleryEnabled(w)&&!w.foundation.curriculum.asciiActivity?.complete)missing.push({kind:'concept',id:'ascii.transmission',message:'Complete the ASCII Transmission Terminal.'});
  if(galleryEnabled(w)&&room==='relay'&&!w.foundation.fabrication.nand)missing.push({kind:'tool',id:'fabrication.nand',message:'Authorize the Workshop fabricator before entering the Listening Gallery.'});
  if(galleryEnabled(w)&&!splitGallery(w)&&room==='sensors')missing.push({kind:'content',id:'gallery.next-package',message:'Listening Gallery curriculum complete through P16. The Computation Lab is not yet available in the campaign.'});
  if(splitGallery(w)&&room==='navigation'&&!w.foundation.curriculum.arithmeticGrandfathered&&!getPuzzle('mux').implemented)missing.push({kind:'content',id:'navigation.next-package',message:'Further ALU lessons remain planned; your arithmetic progress is saved.'});
  if(splitGallery(w)&&room==='testbay'&&signedTutorialRequired(w))missing.push({kind:'concept',id:'decoder.signed',message:'Complete the Signed Binary Tutorial in the Environmental Test Bay.'});
  if(isEarly(w)&&room==='life'&&gardenExitPhase(w)!=='released'&&!serviceState(w)?.triggered&&!gardenDecoderComplete(w))missing.push({kind:'concept',id:'decoder.foundation',message:'Calibrate the Garden Binary Data Decoder before departing.'});
  if(isEarly(w)&&room==='life'&&gardenExitPhase(w)!=='released')missing.push({kind:'service',id:'service.scrubber.demorgan',message:'Complete the scrubber emergency replacement before entering the NAND workshop.'});
  if(profile==='curriculum'&&room==='engine'&&!(w.pressure<45&&w.machines?.ventilation?.output===1))missing.push({kind:'pressure',message:'The live engine pressure is not safe.'});
  return result(missing);
}
export function checkRoomAccess(w,room,{profile=ACTIVE_PROFILE,local=false,allowAdjacent=false}={}){
  if(!ROOM_IDS.includes(room))return result([{kind:'room',id:room,message:'Unknown room.'}]);
  if(w.room===room)return result();
  if(local){
    if(allowAdjacent&&w.room==='engine'&&room==='corridor'&&checkRoomRelease(w,'engine',{profile}).ok)return result();
    return result([{kind:'room',id:room,message:'Travel to '+room+' and inspect its equipment first.'}]);
  }
  if(w.discovered?.includes(room))return result();
  const route=campaignRoute(w);if(!route.includes(room))return result([{kind:'room',id:room,message:'This room does not belong to this voyage.'}]);
  const index=route.indexOf(room),missing=[];
  for(const prior of route.slice(0,index))missing.push(...checkRoomRelease(w,prior,{profile}).missing);
  return result(missing);
}
export function dependencySignature(w,id){
  const seen=new Set(),items=[];
  function visit(key){for(const dep of getPlayablePuzzle(key,w)?.prerequisites||[]){if(seen.has(dep))continue;seen.add(dep);items.push([dep,w.foundation?.circuits?.[dep]?.functionalRevision||0,w.foundation?.circuits?.[dep]?.signature||'',checkRepairStatus(w,dep)]);visit(dep);}}
  visit(id);return canonicalJSON(items.sort((a,b)=>a[0].localeCompare(b[0])));
}
export function puzzleAvailability(w,id,{profile=ACTIVE_PROFILE,allowAdjacent=false,requireInvestigation=true}={}){
  const target=getPuzzle(id),p=definition(id,profile,w);
  if((!target?.implemented&&!(isEarly(w)&&id==='safetycutoff'))||!p)return {state:'UNAVAILABLE',reason:target?'This repair is planned for a later implementation package.':'Unknown puzzle.',missing:[{kind:'content',id}]};
  const access=checkRoomAccess(w,p.roomAccessRequirements.roomId,{profile,local:p.roomAccessRequirements.requiresLocalPresence,allowAdjacent});
  if(!access.ok)return {state:'UNAVAILABLE',reason:access.message,missing:access.missing};
  if(p.roomId==='relay'&&isWorkshopBusy(w))return {state:'UNAVAILABLE',reason:'Wait for the workshop emergency lighting to return.',missing:[{kind:'workshop'}]};
  if(isEarly(w)&&id==='scrubber'&&serviceState(w)?.triggered&&!serviceState(w).applied)return {state:serviceState(w).ticket?'TESTED':'BUILDABLE',reason:'The original repair is preserved; restore its failed hardware.',missing:[]};
  if(checkRepairStatus(w,id,{profile}))return {state:'APPLIED',reason:'This repair is installed.',missing:[]};
  const prereq=checkPrerequisites(w,id,{profile});
  if(!prereq.ok)return {state:'INVESTIGABLE',reason:prereq.message,missing:prereq.missing};
  const observations=p.investigationRequirements.filter(key=>!w.foundation?.investigations?.[key]);
  if(requireInvestigation&&observations.length)return {state:'INVESTIGABLE',reason:'Inspect '+p.name+' before opening its circuit.',missing:observations.map(key=>({kind:'investigation',id:key}))};
  const test=w.foundation?.tested?.[id],meta=w.foundation?.circuits?.[id];
  if(test?.pass&&test.signature===meta?.signature&&test.functionalRevision===meta?.functionalRevision&&test.contentVersion===p.contentVersion&&test.validatorVersion===p.validatorVersion&&test.dependencyKey===dependencySignature(w,id))return {state:'TESTED',reason:'Tests passed. Check the live machine conditions before Apply.',missing:[]};
  return {state:'BUILDABLE',reason:'Ready to construct and test.',missing:[]};
}
export function availableWorkOrders(w,room=w.room,options={}){
  return (isEarly(w)&&(room==='sensors'||splitGallery(w)&&['testbay','blackbox','computation','navigation'].includes(room))?roomRepairIds(w,room,[]).map(getPuzzle):roomPuzzles(room,options.profile||ACTIVE_PROFILE)).filter(p=>p.implemented).map(p=>({id:p.id,name:p.name,displayOrder:p.displayOrder,...puzzleAvailability(w,p.id,options)}));
}
export function canTravelTo(w,room){
  if(!ROOM_IDS.includes(room))return false;
  if(room===w.room)return true;
  const route=campaignRoute(w),current=route.indexOf(w.room),next=route.indexOf(room);if(current<0||next<0)return false;
  if(Math.abs(current-next)!==1)return false;
  if(w.room==='relay'&&w.nandEvent?.triggered){if(isWorkshopBusy(w))return false;if(next<current)return w.machines?.nandand?.certified===true&&w.machines.nandand.output===1;}
  return next<current||checkRoomRelease(w,w.room).ok;
}
