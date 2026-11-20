import {sceneWorkstations,workstationSceneKey,WORKSTATION_PICKUP} from './scene-workstations.js';
import {pickupAvailability} from './inventory-gameplay.js';
/** Restrained instrument life in scene coordinates. Preview effects own no game state. */
export function drawGallerySplit(r,a,env,{reduced=false,trace,world}){
 const c=r.ctx,t=reduced?0:a.time;
 if(env.visual==='observatory'){
  trace(c,120,133,76,30,t,'#89c7dd');trace(c,212,133,76,30,t,'#dfb574',.18);
  r.lamp(604,166,1.4,true,'#d9b574');
 }else if(env.visual==='testbay'){
  // A guarded test coupling and faint vapor close to the frosted cooling line.
  c.save();c.translate(633,148);c.rotate(reduced?0:t*.65);c.strokeStyle='#9aabb1';c.lineWidth=1.5;c.beginPath();c.moveTo(-7,0);c.lineTo(7,0);c.moveTo(0,-7);c.lineTo(0,7);c.stroke();c.restore();
  if(!reduced)for(let i=0;i<4;i++){const phase=(t*.14+i*.23)%1;c.save();c.globalAlpha=(1-phase)*.1;c.fillStyle='#c3e0e5';c.beginPath();c.ellipse(246+Math.sin(t*.3+i)*2,97-phase*15,3+phase*2,2+phase*3,0,0,Math.PI*2);c.fill();c.restore();}
  r.lamp(380,184,1.2,true,'#9bd7de');
 }else if(env.visual==='vault'){
  r.text('SHIP STATUS',164,139,'#b99b6b',3.4,'center');r.text('RECOVERY / IDLE',595,137,'#c5a975',2.6,'center');
  c.save();c.globalAlpha=reduced?.8:.7+Math.sin(t*.8)*.15;r.lamp(406,116,1.3,true,'#dfae61');c.restore();
 }
 if(sceneWorkstations(world)){
  if(workstationSceneKey(world)==='gallery'&&pickupAvailability(world,'gallery.xor').state==='available')r.image('looseXor',WORKSTATION_PICKUP.x+3,WORKSTATION_PICKUP.y+6,28,18);
  for(const station of sceneWorkstations(world)){if(station.puzzleId)r.lamp(station.x+station.w-5,station.y+station.h-5,1.2,true,world.machines[station.puzzleId]?.certified?'#91c58e':'#d1a15b');}
 }
}
