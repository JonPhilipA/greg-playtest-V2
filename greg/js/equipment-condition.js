import {checkPrerequisites} from './progression.js';
import {getPlayablePuzzle} from './puzzle-definitions.js';
import {corePowered} from './opening-state.js';
import {servicePending} from './curriculum-profile.js';
import {fabricatorActive} from './fabrication.js';

/** Read-only environmental interpretation. Certificates and story flags remain authoritative. */
export function equipmentCondition(w,id){
 if(w.environmentPreview)return 'hidden';
 if(id==='fabricator')return w.room!=='relay'?'hidden':fabricatorActive(w)?'repaired':'offline';
 const p=getPlayablePuzzle(id,w);
 const room=p?.roomAccessRequirements?.roomId||p?.roomId;
 if(!p||room!==w.room||!w.machines?.[id])return 'hidden';
 if(!corePowered(w))return 'offline';
 if(id==='scrubber'&&servicePending(w))return 'critical';
 if(w.machines[id].certified)return 'repaired';
 // The Workshop controllers work until the scripted supply surge actually burns them.
 if(room==='relay')return w.nandEvent?.failed?'malfunctioning':'operating';
 const prerequisites=checkPrerequisites(w,id);
 if(!prerequisites.ok)return prerequisites.missing.some(m=>m.kind==='tool')?'offline':'locked';
 return 'malfunctioning';
}

export const EQUIPMENT_LABELS=Object.freeze({hidden:'',offline:'OFFLINE',locked:'STANDBY',operating:'ONLINE',malfunctioning:'FAULT',critical:'HW FAULT',repaired:'ONLINE'});
export const needsAttention=state=>state==='malfunctioning'||state==='critical';

const readings=Object.freeze({sensordiff:['SIGNAL MISMATCH','A / B MONITOR'],xorfab:['PATCH / ERROR','PATCH / VERIFIED'],hull:['VOTER / ERROR','VOTER / ONLINE'],firewall:['MASK / ERROR','STATUS / DECODED'],adc_precision:['RX / INVALID FRAME','RX / LINK STABLE'],log_overflow:['LOG / TRUNCATED','LOG / 260 STORED'],fabricator:['POWER / OFFLINE','AUTO SUPPLY']});
export function equipmentReading(w,id,state){
 if(!needsAttention(state)&&state!=='repaired'&&state!=='operating')return EQUIPMENT_LABELS[state]||'';
 // A partially calibrated two-stage decoder must show the player's real interpretations.
 if(id==='cryo_signed'){const c=w.circuits[id]?.configuration||{};return `CRYO ${c.temperature==='signed'?'−10':'+246'}°C / ${c.speed==='unsigned'?246:-10} RPM`;}
 if(id==='pressure_width'){const width=w.circuits[id]?.configuration?.width||8;return `${width} BITS / ${300%2**width} kPa`;}
 const reading=readings[id];return reading?reading[state==='repaired'||state==='operating'?1:0]:EQUIPMENT_LABELS[state]||'';
}

/** Slow, bounded warning pulse. Reduced motion keeps an unambiguous static warning. */
export function equipmentSignal(state,time,{reduced=false,phase=0}={}){
 const warning=needsAttention(state),cycle=((time+phase)%5+5)%5;
 return {warning,lamp:warning&&!reduced?.65+.35*(.5+.5*Math.cos((time+phase)*Math.PI*2/2.8)):1,
  glitch:state==='malfunctioning'&&!reduced&&cycle<.18,
  sparks:state==='critical'&&!reduced&&cycle<.12,
  color:warning?'#eb6b56':state==='repaired'||state==='operating'?'#8acb91':'#9b8969',
  label:EQUIPMENT_LABELS[state]||''};
}

/** Ephemeral feedback only: never serialized and never consulted by gameplay. */
export class EquipmentFeedback{
 constructor(){this.room=null;this.previous=new Map();this.restored=new Map();}
 update(w,time,ids){
  if(this.room!==w.room){this.room=w.room;this.previous.clear();this.restored.clear();}
  const states={};
  for(const id of ids){const next=equipmentCondition(w,id),before=this.previous.get(id);states[id]=next;
   if(before&&before!==next&&next==='repaired'&&(needsAttention(before)||before==='offline'))this.restored.set(id,time);
   this.previous.set(id,next);
  }
  return states;
 }
 reaction(id,time,reduced=false){const at=this.restored.get(id),elapsed=time-at;return reduced||at===undefined||elapsed<0||elapsed>.8?0:Math.sin(elapsed/.8*Math.PI);}
}
