import {DOOR_CENTERS,WALK_FLOOR} from './room-door-layout.js';
import {drawCorridor} from './corridor-renderer.js';
import {enginePartsGlow} from './p01-guide.js';
import {drawEquipment} from './equipment-effects.js';
import {corePowered,CORE_SWITCH} from './opening-state.js';
import {OPENING_WIDTHS,OPENING_PICKUPS} from './opening-layout.js';
import {pickupAvailability} from './inventory-gameplay.js';
import {emergencyLighting} from './emergency-lighting.js';

function coreSwitch(r,w,a,reduced){
 const c=r.ctx,{x,y,w:width,h}=CORE_SWITCH,on=corePowered(w),lever=a.coreLever??Number(on);
 c.fillStyle='#141e2c';c.strokeStyle='#bd9558';c.lineWidth=2;c.beginPath();c.roundRect(x,y,width,h,4);c.fill();c.stroke();
 r.text('G.R.E.G.',x+width/2,y+8,'#ffe1a3',5,'center');r.text('EMERGENCY CORE',x+width/2,y+15,'#e6cca1',3.3,'center');r.text('POWER',x+width/2,y+21,'#e6cca1',3.7,'center');
 r.rect(x+15,y+26,12,25,'#090f18');c.strokeStyle='#667185';c.lineWidth=2;c.strokeRect(x+15,y+26,12,25);
 c.strokeStyle='#d6b879';c.lineWidth=4;c.beginPath();c.moveTo(x+21,y+39);c.lineTo(x+21+(1-lever)*5,y+48-lever*17);c.stroke();
 c.fillStyle='#e5c183';c.strokeStyle='#1b2634';c.lineWidth=1.5;c.beginPath();c.roundRect(x+11+(1-lever)*5,y+44-lever*17,20,8,2);c.fill();c.stroke();
 r.lamp(x+7,y+55,2,on,on?'#eac46a':'#d96a48');r.text(on?'ON':'OFF',x+27,y+60,on?'#ffe2a0':'#efb89a',5,'center');
 if(!on){c.strokeStyle='#efcb84';c.globalAlpha=reduced?.8:.6+Math.sin(a.time*2)*.12;c.lineWidth=1;c.strokeRect(x-3,y-3,width+6,h+6);c.globalAlpha=1;}
}
export function drawOpeningRoom(r,w,a,{reduced=false}={}){
 const c=r.ctx,cam=a.cameraX||0,t=a.time,engine=w.room==='engine',on=corePowered(w),width=OPENING_WIDTHS[w.room];
 c.save();c.translate(-cam,0);r.image(engine?'engineScroll':'corridorScroll',0,0,width,270);
 if(engine){
  const running=w.machines.ventilation.output===1;
  c.save();c.translate(251,140);c.rotate(reduced?0:running?a.fan*Math.PI/2:a.power?.motor??0);r.image('fan',-43,-43,86,86);c.restore();
  r.image('toolbox',133,181);r.image('sensor',330,148);r.image('panel',365,124);r.image('harness',360,182,60,30);r.gauge(423,62,52,w.pressure);r.image('vessel',432,129,43,80);
  r.shipDoor(DOOR_CENTERS.engine,{amount:a.engineDoor,released:!!w.doors.engine&&w.machines.ventilation.certified,label:'MAINTENANCE'});
  for(const [i,x]of [29,342,508].entries()){c.save();c.globalAlpha=a.power?a.power.lamps[i]:!w.machines.ventilation.certified?.55:w.foundation.opening?.presentationVersion===2&&i===2?.35:1;r.lantern(x,38,t,x*.02,reduced||w.machines.ventilation.certified);c.restore();}
  if(a.power?.spark){c.strokeStyle='#f6d18c';c.lineWidth=1.2;for(const [dx,dy]of [[-7,-5],[6,-7],[9,3],[-4,6]]){c.beginPath();c.moveTo(348,66);c.lineTo(348+dx,66+dy);c.stroke();}}
  const ventilationState=r.equipmentStates.ventilation;r.lamp(309,120,2,ventilationState==='malfunctioning'&&(reduced||Math.sin(t*2.2)>-.5),'#e66a43');r.lamp(309,132,2,w.pressure>45,'#dbad46');r.lamp(309,144,2,running,'#81bc69');r.lamp(397,133,1.6,w.machines.ventilation.certified);
  if(on&&!running)for(let i=0;i<5;i++){const p=reduced?i/5:(t*.25+i/5)%1;c.globalAlpha=(1-p)*.35;r.sprite('steam',Math.min(3,Math.floor(p*4)),16,16,328-p*20,126-p*32,1+p*.5);}c.globalAlpha=1;
 }else{
  r.canvas.dataset.lockerContents=pickupAvailability(w,'corridor.and').state==='available'?'AND':'empty';r.image('corridorLocker',165,146,55,66);if(pickupAvailability(w,'corridor.and').state==='available')r.image('lockerAnd',181,171,23,18);
  drawCorridor(r,w,a,{reduced});
 }
 for(const [id,p]of Object.entries(OPENING_PICKUPS))if((engine&&id==='engine.not')||(!engine&&id==='corridor.and'))r.lamp(p.x+p.w-5,p.y+5,1.4,id==='engine.not'?enginePartsGlow(w,{powerRestoring:!!a.power}):pickupAvailability(w,id).state==='available');
 c.save();c.translate(cam,0);drawEquipment(r,w,a,{reduced});c.restore();
 const actor=a.actor;
 c.fillStyle='#10192888';c.beginPath();c.ellipse(actor.x,WALK_FLOOR,9,1.8,0,0,Math.PI*2);c.fill();
 if(!on){c.save();c.translate(actor.x+6,213);c.rotate(-Math.PI/2);r.engineer(a,{x:1,floor:16,facing:1});c.restore();}else{r.engineer(a);if(engine&&t<(a.coreThrowUntil||0)){c.strokeStyle='#d7ad74';c.lineWidth=2.5;c.beginPath();c.moveTo(actor.x-2,199);c.lineTo(CORE_SWITCH.x+26,154-(a.coreLever||0)*17);c.stroke();}}
 if(!engine)r.image('corridorNear',0,0,width,270);
 if(engine){
  // The pre-power drone is inert hardware, not a second active G.R.E.G. face.
  if(!on||a.power?.drone===0){r.rect(129,190,18,20,'#293748');r.rect(132,195,12,7,'#0b1420');}
  emergencyLighting(r,a,on);
  if(a.power&&a.power.monitor>0){c.globalAlpha=a.power.monitor;r.lamp(141,157,1.8,true);c.globalAlpha=1;}
  coreSwitch(r,w,a,reduced);
 }
 c.restore();
 r.canvas.dataset.cameraX=cam.toFixed(3);r.canvas.dataset.worldX=actor.x.toFixed(3);r.canvas.dataset.worldWidth=String(width);r.canvas.dataset.corePower=on?'on':'off';r.canvas.dataset.environment=engine?'engine-revised':'corridor-revised';
 r.canvas.dataset.partsBoxGlow=String(engine&&enginePartsGlow(w,{powerRestoring:!!a.power}));
 r.canvas.dataset.powerStage=a.power?String(a.power.stage):on?'ready':'off';
}
