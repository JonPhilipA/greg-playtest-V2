import {drawEquipment} from './equipment-effects.js';
import {serviceState} from './curriculum-profile.js';
import {pickupAvailability} from './inventory-gameplay.js';
// All live parts use exactly the same world-to-screen transform as the hotspot layer.
export function drawGarden(r,w,a,{reduced,speaking}){
 const c=r.ctx,cam=a.cameraX||0,t=a.time,stress=a.gardenStress||0;
 const layer=(id,offset,width)=>{const img=r.assets.get(id),sx=Math.max(0,-offset),dx=Math.max(0,offset),visible=Math.min(480-dx,width-sx),scale=img.width/width;if(visible>0)c.drawImage(img,sx*scale,0,visible*scale,img.height,dx,0,visible,270);};
 const blend=(id,offset,width)=>{c.save();c.globalAlpha=1-stress;layer(id,offset,width);if(stress&&r.assets.get(id+'Stressed')){c.globalAlpha=stress;layer(id+'Stressed',offset,width);}c.restore();};
 blend('gardenFar',-80-cam*(reduced?1:.94),1600);blend('gardenWorld',-cam,1440);
 if(stress){c.save();c.globalAlpha=stress*.24;r.rect(0,33,480,195,'#050c18');c.restore();}
 c.save();c.translate(-cam,0);
 r.image('engineHatch',10,91,56,115);r.image('engineFrame',4,84,68,129);
 r.door('engineHatch','engineFrame',1338,92,72,116,a.campaignDoor,1329,82,91,133);
 const fault=!!serviceState(w)?.triggered&&!serviceState(w)?.applied;
 for(const x of [602,746])if(x>cam-50&&x<cam+530){
  c.save();c.translate(x,137);c.rotate(reduced?0:(fault?0:(a.scrubberAngle||0))*(x===602?1:-1));r.image('fan',-37,-37,74,74);c.restore();
  r.lamp(x+46,109,2.3,!fault&&w.machines.scrubber.certified,'#84b568');
 }
 if(cam<410){r.lamp(357,128,2.2,w.machines.alarm.certified,'#8acb91');r.lamp(386,128,2.2,r.equipmentStates.alarm==='malfunctioning'&&(reduced||Math.sin(t*2.2)>-.5),'#eb6b46');}
 if(cam<940&&cam+480>500){
  r.gauge(835,69,43,w.machines.scrubber.output?25:78);
  r.lamp(867,112,2.8,fault&&(reduced||Math.sin(t*2.7)>-.3),'#ef7147');
  if(fault){
   c.save();c.strokeStyle='#212731';c.lineWidth=1.5;r.rect(843,149,12,10,'#806643');r.rect(861,149,12,10,'#806643');c.beginPath();c.moveTo(846,150);c.lineTo(852,155);c.lineTo(850,158);c.moveTo(863,150);c.lineTo(870,154);c.lineTo(868,158);c.stroke();c.restore();
   r.text('HARDWARE FAULT',861,188,'#ffc278',3.6,'center');
   // Existing steam sprites, a slow vent plume, and sparse electrical sputtering.
   if(!reduced&&(a.scrubberFailureTime??Infinity)>.25)for(let i=0;i<5;i++){const p=(t*.24+i/5)%1;c.save();c.globalAlpha=(1-p)*.38;r.sprite('steam',Math.min(3,Math.floor(p*4)),16,16,822+p*14,145-p*40,.7+p*.8);c.restore();}
   if(!reduced&&Math.floor(t*3)%9===0){c.save();c.strokeStyle='#ffe49a';c.lineWidth=1.1;c.beginPath();for(let i=0;i<6;i++){const angle=i*Math.PI/3+t;c.moveTo(870+Math.cos(angle)*3,150+Math.sin(angle)*3);c.lineTo(870+Math.cos(angle)*(7+i%2*3),150+Math.sin(angle)*(7+i%2*3));}c.stroke();c.restore();}
  }
  r.lamp(918,173,1.6,pickupAvailability(w,'garden.demorgan-kit').state==='available','#efb64e');
 }
 if(cam+480>1030){r.lamp(1174,109,3,fault?(reduced||Math.sin(t*2.7)>0):w.machines.safetycutoff?.certified,fault?'#efae45':'#8ac66c');r.lamp(1193,109,3,r.equipmentStates.safetycutoff==='malfunctioning'&&(reduced||Math.sin(t*2.2)>-.5),'#eb6b56');}
 for(const [id,x,y] of [['garden.nor-kit',846,187],['garden.cutoff-kit',1074,199]])r.lamp(x,y,1.4,pickupAvailability(w,id).state==='available','#efc476');
 if(pickupAvailability(w,'garden.or').state==='available')r.image('looseOr',322,200,13,10);
 for(const x of [305,491,918,1295])if(x>cam-55&&x<cam+535){c.save();c.globalAlpha=fault?.35:1;r.lantern(x,35,t,x*.02,reduced);c.restore();if(fault){const pulse=reduced?.65:.48+.18*Math.sin(t*2.7+x);c.save();c.globalAlpha=pulse;const glow=c.createRadialGradient(x+6,51,3,x+6,51,68);glow.addColorStop(0,'#ee3c38aa');glow.addColorStop(1,'#ee3c3800');c.fillStyle=glow;c.fillRect(x-63,17,138,110);r.lamp(x+6,53,3.4,true,'#f15c50');c.restore();}}
 c.save();c.translate(cam,0);drawEquipment(r,w,a,{reduced});c.restore();
 const actor=a.actor;
 c.fillStyle='#15212c80';c.beginPath();c.ellipse(actor.x,220,7,1.5,0,0,Math.PI*2);c.fill();
 r.engineer(a);
 c.restore();blend('gardenNear',-cam*(reduced?1:1.025),1600);
 r.canvas.dataset.cameraX=cam.toFixed(3);r.canvas.dataset.worldX=actor.x.toFixed(3);r.canvas.dataset.worldWidth='1440';r.canvas.dataset.scrubberSpeed=(a.scrubberSpeed||0).toFixed(3);r.canvas.dataset.gardenStress=stress.toFixed(3);r.canvas.dataset.scrubberFault=String(fault);r.canvas.dataset.gardenEmergency=String(fault);r.canvas.dataset.cameraOverride=String(!!a.cameraOverrideActive);
}

