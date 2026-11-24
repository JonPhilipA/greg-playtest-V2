import {DOOR_CENTERS,WALK_FLOOR} from './room-door-layout.js';
import {drawEquipment} from './equipment-effects.js';
import {nandPhase,nandDoors} from './campaign.js';
import {fabricatorActive,fabricatedAvailable,automaticSupplyActive} from './fabrication.js';
import {WORKSHOP_WIDTH} from './workshop-layout.js';
export function drawWorkshop(r,w,a,{reduced=false}={}){
 const c=r.ctx,cam=a.cameraX||0,t=a.time,phase=nandPhase(w),doors=nandDoors(w),active=fabricatorActive(w),q=a.fabricator||0;
 const power=['ready','entry','sealing'].includes(phase)||(w.machines.nandnot.certified&&w.machines.nandnot.output===1);
 const img=r.assets.get('workshopWorld');c.drawImage(img,cam*4,0,480*4,img.height,0,0,480,270);
 c.save();c.translate(-cam,0);
 r.shipDoor(DOOR_CENTERS.workshopBack,{amount:a.nandBackDoor,released:!!doors.back,label:'GARDEN'});
 r.shipDoor(DOOR_CENTERS.workshopForward,{amount:a.campaignDoor,released:!!doors.forward,label:'LISTENING GALLERY'});
 for(let i=0;i<6;i++){const id='finite.nand.0'+(i+1),owned=w.foundation.inventory.instances?.[id]?.owner.kind==='world',x=130+(i%2)*29,y=131+Math.floor(i/2)*21;if(owned)r.image('workshopNand',x+1,y+1,22,14);else{r.rect(x+4,y+5,16,5,'#202f3e');r.text('—',x+12,y+11,'#526272',4,'center');}}
 r.lamp(445,132,2.2,power,'#f3d07b');r.lamp(534,144,2,w.machines.nandand.certified,'#94bc8b');r.lamp(1013,142,2,w.machines.nandor.certified,'#9aca94');
 if(q>.01){const glow=c.createRadialGradient(805,137,3,805,137,67);glow.addColorStop(0,'#8fd6e6');glow.addColorStop(1,'#79bed200');c.save();c.globalAlpha=q*.28;c.fillStyle=glow;c.fillRect(742,101,128,70);c.restore();r.image('workshopNand',792,136,24,16);}
 for(const [bx,dir]of [[686,1],[907,-1]]){
  const shift=reduced?0:Math.sin(t*1.7+(dir>0?0:1.5))*q*2,ex=bx+dir*(12+q*30),ey=124-q*20,tx=bx+dir*(18+q*76),ty=156-q*12+shift;
  c.save();c.lineCap='round';for(const [color,width]of [['#111c28',13],['#637386',9],['#b5a17d',2]]){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(bx,134);c.lineTo(ex,ey);c.lineTo(tx,ty);c.stroke();}
  for(const [x,y]of [[bx,134],[ex,ey],[tx,ty]]){c.fillStyle='#c49b5f';c.strokeStyle='#14202c';c.lineWidth=1.4;c.beginPath();c.arc(x,y,4.5,0,Math.PI*2);c.fill();c.stroke();r.lamp(x,y,1.4,q>.8,'#8ecdd0');}
  c.strokeStyle='#d4b174';c.lineWidth=2;c.beginPath();c.moveTo(tx-4,ty+4);c.lineTo(tx-4,ty+10);c.moveTo(tx+4,ty+4);c.lineTo(tx+4,ty+10);c.stroke();c.restore();
 }
 c.save();c.beginPath();c.rect(660,184,277,14);c.clip();for(let i=0;i<20;i++){const x=660+((i*18+(active&&!reduced?t*16:0))%280);r.rect(x,185,8,2,'#4c6171');}if(active)for(let i=0;i<3;i++){const x=663+((i*86+(reduced?0:t*13))%250);r.image('workshopNand',x,189,14,9);}c.restore();
 r.text(active?'AUTHORIZED':'RESTRICTED',928,150,active?'#e6c274':'#a0afbd',2.7,'center');
 if(active)r.text(automaticSupplyActive(w)?'AUTO SUPPLY':fabricatedAvailable(w).length+' LOOSE',928,166,'#c2d5dc',2.7,'center');
 if(power)for(const x of [80,397,610,941,1038])if(x>cam-35&&x<cam+500)r.lantern(x,36,t,x*.01,reduced);
 const actor=a.actor;c.fillStyle='#101b2780';c.beginPath();c.ellipse(actor.x,WALK_FLOOR,7,1.5,0,0,Math.PI*2);c.fill();r.engineer(a);c.restore();
 const darkness=phase==='blackout'?.87:!power?.58:phase==='sealing'&&!reduced?(Math.sin(t*20)>0?.12:.32):0;if(darkness){c.save();c.globalAlpha=darkness;r.rect(0,0,480,270,'#020914');c.restore();}
 c.save();c.translate(-cam,0);
 for(const x of [84,471,624,1018]){const on=!power&&phase!=='blackout';c.save();c.globalAlpha=on?1:.18;r.image('emergencyLamp',x,78,22,18);if(on){const g=c.createRadialGradient(x+11,87,2,x+11,87,27);g.addColorStop(0,'#ffab3d33');g.addColorStop(1,'#ffab3d00');c.fillStyle=g;c.fillRect(x-16,60,54,54);}c.restore();}
 if(!reduced&&w.nandEvent.failed&&!w.machines.nandnot.certified&&t%9<.16){c.strokeStyle='#f5c577';c.lineWidth=1;c.beginPath();c.moveTo(309,91);c.lineTo(300,86);c.moveTo(309,91);c.lineTo(316,83);c.moveTo(309,91);c.lineTo(312,97);c.stroke();}
 c.restore();drawEquipment(r,w,a,{reduced});r.canvas.dataset.worldWidth=String(WORKSHOP_WIDTH);r.canvas.dataset.cameraX=cam.toFixed(3);r.canvas.dataset.worldX=actor.x.toFixed(3);r.canvas.dataset.workshopPhase=phase;r.canvas.dataset.fabricator=active?'active':'restricted';r.canvas.dataset.lighting=power?'main':'emergency';
}

