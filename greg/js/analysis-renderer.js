import {analysisDoorCenter,WALK_FLOOR} from './room-door-layout.js';
import {drawComputationLab} from './computation-renderer.js';
import {drawEquipment} from './equipment-effects.js';
import {PICKUP_LOCATIONS,pickupAvailability} from './inventory-gameplay.js';
import {analysisEnvironment,developmentEnvironment} from './development-environments.js';
import {drawGallerySplit} from './gallery-split-renderer.js';
function trace(c,x,y,w,h,time,color,phase=0){
 c.save();c.beginPath();c.rect(x,y,w,h);c.clip();c.strokeStyle='#9bc0cf22';c.lineWidth=.35;
 for(let i=1;i<6;i++){c.beginPath();c.moveTo(x+i*w/6,y);c.lineTo(x+i*w/6,y+h);c.stroke();}
 for(let i=1;i<4;i++){c.beginPath();c.moveTo(x,y+i*h/4);c.lineTo(x+w,y+i*h/4);c.stroke();}
 c.strokeStyle=color;c.lineWidth=1.1;c.lineJoin='round';c.beginPath();
 for(let i=0;i<=w;i++){const a=(i/w*4+time*.35+phase)*Math.PI*2,v=Math.sin(a)*.55+Math.sin(a*.5)*.15;const yy=y+h*.5-v*h*.37;i?c.lineTo(x+i,yy):c.moveTo(x+i,yy);}c.stroke();c.restore();
}
/** Same 480-unit camera, actor, companion and asset architecture as Garden/Workshop. */
export function drawAnalysisEnvironment(r,w,a,{reduced=false}={}){
 const env=analysisEnvironment(w),c=r.ctx,cam=a.cameraX||0,t=reduced?0:a.time;
 const img=r.assets.get(env.asset),scale=img.width/env.width;c.drawImage(img,cam*scale,0,480*scale,img.height,0,0,480,270);
 c.save();c.translate(-cam,0);
 const preview=!!developmentEnvironment(w);
 const back=analysisDoorCenter(env.width,false),forward=analysisDoorCenter(env.width,true);
 const labels={galleryWorld:['NAND WORKSHOP','COMPUTATION LAB'],galleryObservatoryWorld:['NAND WORKSHOP','TEST BAY'],testBayWorld:['LISTENING GALLERY','BLACK BOX VAULT'],blackBoxWorld:['TEST BAY','COMPUTATION LAB'],computationWorld:['BLACK BOX VAULT','NAVIGATION']};
 const [entryLabel,exitLabel]=labels[env.asset];
 r.shipDoor(back,{amount:1,label:entryLabel});
 r.shipDoor(forward,{amount:preview?0:a.campaignDoor,released:!preview&&!!a.campaignDoorTarget,label:exitLabel});
 if(env.visual){drawGallerySplit(r,a,env,{reduced,trace,world:w});}
 else if(env.roomId==='sensors'){
  if(!developmentEnvironment(w)){r.lamp(186,149,2.2,w.machines.sensordiff?.certified,'#8dc47b');r.lamp(379,190,2.2,w.machines.xorfab?.certified,'#e4b25c');r.text(w.machines.sensordiff?.certified?'DISAGREEMENT / ONLINE':'DISAGREEMENT / OFFLINE',279,142,'#e8be71',3,'center');}
  if(!developmentEnvironment(w)&&w.foundation.curriculum.xorUseVersion===1&&pickupAvailability(w,'gallery.xor').state==='available'){const p=PICKUP_LOCATIONS['gallery.xor'];r.image('looseXor',p.x+7,p.y+9,28,18);}
  const receiverFault=r.equipmentStates.sensordiff==='malfunctioning',rxTime=receiverFault&&!reduced?Math.floor(t*4)*.8:t;trace(c,206,88,73,47,rxTime,receiverFault?'#bc8773':'#80bfdb');trace(c,299,88,73,47,rxTime,receiverFault?'#d7a67d':'#e7b45e',receiverFault?.65:.2);
  for(let channel=0;channel<3;channel++)trace(c,466,93+channel*15,119,13,t*.55,['#89b8d0','#d6ae68','#ad92ba'][channel],channel*.13);
  const live=!developmentEnvironment(w);
  r.text(live?'A / B / C · DAMAGE':'RAW 1001 0110',631,104,'#8db7c5',3.4,'center');r.text(live?(w.machines.hull?.certified?'VOTER ONLINE':'VOTER / SERVICE'):'SAMPLE WORD',631,111,'#a4adb0',2.7,'center');
  if(live){r.text('RAW 1111 0110',524,143,'#8db7c5',3.3,'center');r.text(w.machines.cryo_signed?.certified?'CRYO −10°C / SPEED 246 RPM':'DECODER / SERVICE',524,151,'#e8be71',3,'center');r.lamp(659,183,2,w.machines.hull?.certified,'#dfaa5e');r.lamp(471,183,2,w.machines.cryo_signed?.certified,'#83d9e0');}
  r.text(live?'8 / 9 / 10':'8 / 16 / 32',777,153,'#e8be71',5,'center');r.text('WORD WIDTH',777,164,'#8aabba',3.2,'center');r.text(live?(w.machines.pressure_width?.certified?'9 BITS / 300 kPa RETAINED':'8 BITS / RANGE TRUNCATED'):'INSTRUMENT SAMPLE',777,177,'#8593a1',2.2,'center');
  r.text(w.machines.adc_precision?.certified?'RX / LINK STABLE':'RX / STANDBY',1053,161,'#d3b27a',3.5,'center');r.text('... / BUFFER WAIT',1053,169,'#86a7b5',3,'center');
  r.text('00 01 02 03',1161,165,'#8db7c6',3.8,'center');
  const cursor=reduced?0:Math.floor(t*2)%4;r.rect(1012+cursor*17,173,9,1.2,'#ddb76d');
 }else{drawComputationLab(r,w,a,{trace,reduced});}

 for(const x of (env.visual?{observatory:[75,633],testbay:[203,424,666,863],vault:[84,246,531,778]}[env.visual]:(env.roomId==='computation'?[84,877]:w.environmentPreview==='gallery'?[104,407,689,964,1338]:[79,304,600,870]))){c.save();c.globalAlpha=reduced?.04:.035+.008*Math.sin(t*1.3+x);const g=c.createRadialGradient(x+6,68,2,x+6,68,28);g.addColorStop(0,'#ffcc78');g.addColorStop(1,'#ffcc7800');c.fillStyle=g;c.fillRect(x-22,40,56,56);c.restore();}
 c.save();c.translate(cam,0);drawEquipment(r,w,a,{reduced});c.restore();
 const actor=a.actor;c.fillStyle='#101b2880';c.beginPath();c.ellipse(actor.x,WALK_FLOOR,7,1.5,0,0,Math.PI*2);c.fill();r.engineer(a);
 c.restore();r.canvas.dataset.environment=w.environmentPreview||({sensors:'gallery',testbay:'testbay',blackbox:'blackbox',computation:'computation'}[env.roomId])||(env.roomId==='sensors'?'gallery':'computation');r.canvas.dataset.worldWidth=String(env.width);r.canvas.dataset.cameraX=cam.toFixed(3);r.canvas.dataset.worldX=actor.x.toFixed(3);r.canvas.dataset.previewOnly=String(!!developmentEnvironment(w));r.canvas.dataset.workstations=String(w.environmentWorkstations===true);
}
