import {GARDEN_INTERLOCK} from './room-door-layout.js';
import {sceneWorkstations} from './scene-workstations.js';
import {splitGallery} from './curriculum-profile.js';
import {equipmentSignal,equipmentReading,EquipmentFeedback} from './equipment-condition.js';
import {openingEnvironment} from './opening-layout.js';
import {analysisEnvironment,developmentEnvironment} from './development-environments.js';
import {extendedGarden} from './exploration.js';
import {serviceSlots,nandPhase} from './campaign.js';

// Anchors belong to real cabinets, not gates, pickups, archives or decoration.
const {panel:interlock}=GARDEN_INTERLOCK;
const opening={engine:[{id:'ventilation',x:394,y:129,screen:[371,145,33,8]}],corridor:[{id:'security',x:interlock.x+34,y:interlock.y+11,screen:[interlock.x+7,interlock.y+26,27,7]}]};
const garden=[{id:'alarm',x:380,y:146,screen:[356,154,30,8]},{id:'scrubber',x:867,y:126,screen:[843,173,35,7]},{id:'safetycutoff',x:1192,y:157,screen:[1157,171,37,8]}];
const workshop=[{id:'nandnot',x:455,y:134,screen:[431,151,29,7]},{id:'nandand',x:531,y:145,screen:[500,164,31,7]},{id:'nandor',x:1012,y:143,screen:[981,165,31,7]},{id:'fabricator',x:927,y:128,screen:[912,148,32,7]}];
const gallery=[{id:'sensordiff',x:185,y:149,screen:[245,136,64,8]},{id:'xorfab',x:379,y:190,screen:[313,159,63,8]},{id:'cryo_signed',x:471,y:183,screen:[476,148,78,8]},{id:'hull',x:659,y:183,screen:[587,109,83,8]},{id:'pressure_width',x:832,y:182,screen:[735,174,90,8]},{id:'firewall',x:927,y:181,screen:[866,169,64,8]},{id:'adc_precision',x:1097,y:185,screen:[1008,158,90,16]},{id:'log_overflow',x:1266,y:187,screen:[1125,162,78,9]}];
export function equipmentAnchors(w){
 if(developmentEnvironment(w))return [];
 if(splitGallery(w)&&analysisEnvironment(w))return (sceneWorkstations(w)||[]).filter(s=>s.puzzleId).map(s=>({id:s.puzzleId,x:s.x+s.w-5,y:s.y+s.h-5,screen:[s.x+4,s.y+s.h-13,s.w-12,6]}));
 if(openingEnvironment(w))return opening[w.room];
 if(w.room==='relay')return workshop;
 if(extendedGarden(w))return garden.filter(p=>w.machines[p.id]);
 if(analysisEnvironment(w))return gallery;
 if(w.room==='engine')return [{id:'ventilation',x:273,y:132,screen:[242,150,32,8]}];
 if(w.room==='corridor')return [{id:'security',x:309,y:165,screen:[281,178,31,8]}];
 return serviceSlots(w.room,w).map(p=>({id:p.id,x:p.x+p.w*.78,y:p.y+9,screen:[p.x+5,p.y+24,p.w-10,7]}));
}

export function prepareEquipment(r,w,a){
 const anchors=equipmentAnchors(w);r.equipmentAnchors=anchors;r.equipmentFeedback??=new EquipmentFeedback();r.equipmentStates=r.equipmentFeedback.update(w,a.time,anchors.map(p=>p.id));
 // Compact read-only instrumentation for Developer Mode and accessibility checks.
 const encoded=JSON.stringify(r.equipmentStates);if(r.canvas.dataset.equipmentStates!==encoded)r.canvas.dataset.equipmentStates=encoded;
 return anchors;
}

/** A few clipped screen marks and a physical LED; no particle allocation or world mutations. */
export function drawEquipment(r,w,a,{reduced=false}={}){
 if(w.room==='relay'&&nandPhase(w)==='blackout')return;
 const c=r.ctx,cam=a.cameraX||0;
 c.save();c.translate(-cam,0);
 for(const p of r.equipmentAnchors||equipmentAnchors(w)){
  if(p.x<cam-120||p.x>cam+540)continue;
  const state=r.equipmentStates[p.id];if(!state||state==='hidden')continue;
  const signal=equipmentSignal(state,a.time,{reduced,phase:p.x*.007}),[x,y,width,height]=p.screen,attention=signal.warning;
  c.save();
  if(attention){const glow=c.createRadialGradient(p.x,p.y,1,p.x,p.y,state==='critical'?25:17);glow.addColorStop(0,'#d94c3d36');glow.addColorStop(1,'#d94c3d00');c.globalAlpha=signal.lamp;c.fillStyle=glow;c.fillRect(p.x-25,p.y-25,50,50);c.globalAlpha=1;}
  r.rect(x-1,y-1,width+2,height+2,'#182331');c.strokeStyle='#697583';c.lineWidth=.35;c.strokeRect(x-1,y-1,width+2,height+2);
  r.rect(x,y,width,height,signal.glitch?'#342d32':'#101d29');
  const stable=state==='repaired'||state==='operating',label=equipmentReading(w,p.id,state);
  r.text(label,x+width/2,y+height*.7,signal.color,Math.min(3.1,width/(label.length*.57)),'center');
  if(signal.glitch){r.rect(x+2,y+height*.4,width-4,.5,'#c7877666');r.rect(x+width*.55,y+1,width*.22,.7,'#d8aa7466');}
  c.save();c.globalAlpha=signal.lamp;r.lamp(p.x,p.y,2.05,state!=='offline'&&state!=='locked',signal.color);c.restore();
  // A fixed engraved symbol keeps the condition understandable without color or flashing.
  r.text(attention?'!':stable?'✓':'–',p.x-5,p.y+1.4,attention?'#f0be90':stable?'#c6d6b4':'#a7a491',4,'center');
  const reaction=r.equipmentFeedback.reaction(p.id,a.time,reduced);
  if(reaction){c.globalAlpha=reaction*.7;c.strokeStyle='#b7dfac';c.lineWidth=.8;c.strokeRect(x-2,y-2,width+4,height+4);r.rect(x+width*reaction,y,.7,height,'#dfebbc');}
  c.restore();
 }
 c.restore();
}
