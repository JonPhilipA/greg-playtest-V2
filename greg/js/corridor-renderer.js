import {machineInputs} from './world.js';
import {doorPose} from './room-door.js';
import {DOOR_CENTERS,GARDEN_INTERLOCK} from './room-door-layout.js';

export function drawCorridor(r,w,a,{reduced=false}={}){
 const live=machineInputs(w,'security');
 const released=!!w.doors.security;
 const pose=doorPose(a.securityDoor);
 const {panel,reader}=GARDEN_INTERLOCK;
 r.shipDoor(DOOR_CENTERS.corridorBack,{amount:1,label:'ENGINEERING'});
 r.gauge(340,104,42,w.pressure);
 r.lamp(382,157,1.8,live.B,'#86b8ab');
 r.image('panel',panel.x,panel.y,panel.w,panel.h);
 r.image('reader',reader.x,reader.y,reader.w,reader.h);
 r.lamp(reader.x+22,reader.y+7,1.8,live.A,'#e6bd76');
 r.shipDoor(DOOR_CENTERS.corridorGarden,{
  amount:a.securityDoor,released,label:'LIFE-SUPPORT GARDEN',trim:'#9eb390',
 });
 for(const x of [84,302,443,661])r.lantern(x,38,a.time,x*.02,reduced);
 Object.assign(r.canvas.dataset,{
  bulkhead:released?'open':'locked',bulkheadBolts:pose.bolts.toFixed(3),bulkheadLeaves:pose.leaves.toFixed(3),
  pressureSafe:String(!!live.B),authorization:String(!!live.A),
 });
}
