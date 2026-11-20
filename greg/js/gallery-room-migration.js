import {galleryEnabled} from './curriculum-profile.js';
// Reconcile location only after circuits, applications and inventory have been restored.
// No completion, concept, reward, discovery or story state is written here.
const rooms={sensors:720,testbay:960,blackbox:864,computation:1156};
const stops=[['sensordiff','sensors',212],['xorfab','sensors',523],['cryo_signed','testbay',438],['hull','testbay',742],['pressure_width','testbay',835],['adc_precision','blackbox',609],['log_overflow','blackbox',741]];
export function migrateGalleryRooms(w,saved=null){
 if(!galleryEnabled(w)||w.saveProtection?.blocked)return w;
 const previous=saved?.foundation?.exploration?.galleryRoomsVersion===1;
 w.foundation.exploration.galleryRoomsVersion=1;
 if(saved&&!previous&&saved.room==='sensors'){
  const next=stops.find(([id])=>id==='adc_precision'?!w.foundation.curriculum.asciiActivity?.complete:!w.machines[id]?.certified);
  const tutorial=next?.[0]==='cryo_signed'&&!w.foundation.curriculum.concepts['decoder.signed']&&!w.foundation.dataInspector.signedBinaryLegacy;
  const room=tutorial?'testbay':next?.[1]||'blackbox',x=tutorial?151:next?.[2]||794;
  w.room=room;w.positions[room]=x;
  // The old combined room already contained these activities. Record only legitimately
  // reachable physical rooms, without changing their repair-release requirements.
  for(const key of ['sensors',...(room!=='sensors'?['testbay']:[]),...(room==='blackbox'?['blackbox']:[])])if(!w.discovered.includes(key))w.discovered.push(key);
 }
 for(const [room,width]of Object.entries(rooms)){
  if(saved&&!previous&&room!==w.room)w.positions[room]=70;
  w.positions[room]=Math.max(20,Math.min(width-20,Number.isFinite(w.positions[room])?w.positions[room]:70));
 }
 return w;
}
