import {advanceGardenStress} from './garden-malfunction.js';
import {servicePending} from './curriculum-profile.js';
import {corePowered} from './opening-state.js';
import {fabricatorActive} from './fabrication.js';
import {createCompanion,updateCompanion} from './companion.js';
import {clampWorldX,cameraFromActor,followCamera,environmentWidth} from './exploration.js';
import {canAdvance,CAMPAIGN_ROOMS,nandDoors,nandPhase} from './campaign.js';
export class Animations {
  constructor(){this.time=0;this.fan=0;this.engineDoor=0;this.securityDoor=0;this.nandBackDoor=1;this.actor={x:247,target:247,facing:1,walking:false};}
  update(dt,w,reduced=false,moving=true){
    advanceGardenStress(this,w,dt,reduced);
    this.time+=dt;this.coreLever=(this.coreLever??Number(corePowered(w)))+(Number(corePowered(w))-(this.coreLever??Number(corePowered(w))))*Math.min(1,dt*6);moving=moving&&corePowered(w);
    const scrubberOn=w.machines.scrubber?.certified&&w.machines.scrubber.output===1;this.scrubberSpeed=(this.scrubberSpeed||0)+(Number(scrubberOn)-(this.scrubberSpeed||0))*Math.min(1,dt*3);this.scrubberAngle=(this.scrubberAngle||0)+dt*this.scrubberSpeed*6;
    this.fabricator=(this.fabricator||0)+(Number(fabricatorActive(w))-(this.fabricator||0))*(reduced?1:Math.min(1,dt*4));
    const running=w.machines.ventilation.output===1;
    if(running)this.fan+=dt*9;else if(w.machines.ventilation.status==='malfunctioning')this.fan=Math.floor(this.time*2)%2;
    const speed=reduced?1:Math.min(1,dt*3.2);
    this.engineDoor+=(Number(w.doors.engine)-this.engineDoor)*speed;
    this.securityDoor+=(Number(w.doors.security)-this.securityDoor)*speed;
    for(const key of ['engineDoor','securityDoor'])if(Math.abs(this[key]-Math.round(this[key]))<.015)this[key]=Math.round(this[key]);
    const nand=w.room==='relay'?nandDoors(w):null,release=nand?nand.forward:CAMPAIGN_ROOMS[w.room]?Number(canAdvance(w,w.room)):0,roomSpeed=nand?(reduced?1:Math.min(1,dt*7)):speed;
    this.campaignDoor=(this.campaignDoor??release)+(release-(this.campaignDoor??release))*roomSpeed;
    if(nand)this.nandBackDoor+=(nand.back-this.nandBackDoor)*roomSpeed;
    for(const key of ['campaignDoor','nandBackDoor'])if(Math.abs(this[key]-Math.round(this[key]))<.012)this[key]=Math.round(this[key]);
    const a=this.actor;if(!moving)a.target=a.x;a.target=clampWorldX(w,a.target);const delta=a.target-a.x;
    a.walking=Math.abs(delta)>.6;
    if(a.walking){a.facing=delta>0?1:-1;a.x+=Math.sign(delta)*Math.min(Math.abs(delta),dt*145);}else a.x=a.target;
    w.positions[w.room]=a.x;if(moving&&!this.cameraOverrideActive)this.cameraX=followCamera(w,this.cameraX||0,a.x,dt,reduced);
    this.companion??=createCompanion(a);updateCompanion(this.companion,a,dt,this.time,{camera:this.cameraOverrideActive?cameraFromActor(w,a.x):this.cameraX||0,width:environmentWidth(w),reduced});
  }
  enter(w){
    this.cameraOverrideActive=false;
    this.gardenStress=Number(servicePending(w));this.scrubberFailureTime=Infinity;
    this.coreLever=Number(corePowered(w));
    const nand=w.room==='relay'?nandDoors(w):null;
    this.campaignDoor=nand?nand.forward:Number(!!CAMPAIGN_ROOMS[w.room]&&canAdvance(w,w.room));this.nandBackDoor=nand?nand.back:1;
    this.fabricator=Number(fabricatorActive(w));
    const x=clampWorldX(w,w.positions[w.room]||70);this.cameraX=cameraFromActor(w,x);
    this.actor={x,target:nand&&nandPhase(w)==='entry'?Math.max(120,x):x,facing:1,walking:false};this.companion=createCompanion(this.actor);
  }
}
