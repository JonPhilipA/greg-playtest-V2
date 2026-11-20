import {equippedCosmetic} from './outfitter-state.js';
import {cosmeticMaterial} from './cosmetic-material.js';
import {prepareEquipment,drawEquipment} from './equipment-effects.js';
import {drawEngineer,EngineerVisualState,DEFAULT_ENGINEER_APPEARANCE} from './engineer-character.js';
import {openingEnvironment} from './opening-layout.js';
import {analysisEnvironment} from './development-environments.js';
import {drawAnalysisEnvironment} from './analysis-renderer.js';
import {corePowered} from './opening-state.js';
import {drawOpeningRoom} from './opening-renderer.js';
const worryWorkshop=w=>w.nandEvent?.failed&&!w.machines.nandnot?.certified;
import {extendedGarden} from './exploration.js';
import {drawGarden} from './garden-renderer.js';
import {drawWorkshop} from './workshop-renderer.js';
import {isEarly,serviceState} from './curriculum-profile.js';
import {drawCampaign} from './campaign-renderer.js';
import {CAMPAIGN_ROOMS,nandPhase} from './campaign.js';
import {machineInputs} from './world.js';
import {gregLife,lampLife} from './ambient-life.js';
import {isInventoryPilot,PICKUP_LOCATIONS,pickupAvailability} from './inventory-gameplay.js';
/** Scene composition only. Physics, progression and hitboxes are independent. */
export class Renderer {
  constructor(canvas,assets,{appearance=DEFAULT_ENGINEER_APPEARANCE,visual=new EngineerVisualState()}={}){this.engineerAppearance=appearance;this.engineerVisual=visual;this.canvas=canvas;this.ctx=canvas.getContext('2d');this.assets=assets;canvas.width=1920;canvas.height=1080;this.ctx.setTransform(4,0,0,4,0,0);this.ctx.imageSmoothingEnabled=true;}
  image(id,x,y,w,h){const img=this.assets.get(id),meta=this.assets.manifest.images[id];if(img)this.ctx.drawImage(img,x,y,w||meta.logicalSize?.[0]||img.width/4,h||meta.logicalSize?.[1]||img.height/4);}
  rect(x,y,w,h,color){this.ctx.fillStyle=color;this.ctx.fillRect(x,y,w,h);}
  text(s,x,y,color='#efe0bd',size=4,align='left'){const c=this.ctx;c.fillStyle=color;c.font=`bold ${size}px Arial,sans-serif`;c.textAlign=align;c.fillText(s,x,y);c.textAlign='left';}
  lamp(x,y,r,on,color='#ffb132'){const c=this.ctx;c.beginPath();c.arc(x,y,r+1,0,Math.PI*2);c.fillStyle='#20252e';c.fill();c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=on?color:'#65473a';c.fill();if(on){c.beginPath();c.arc(x-.4,y-.6,r*.45,0,Math.PI*2);c.fillStyle='#ffe6a2';c.fill();}}
  lantern(x,y,time,phase,reduced){
    const c=this.ctx,brightness=lampLife(time,phase,reduced);
    c.save();c.globalAlpha=brightness;this.image('lantern',x,y);
    const glow=c.createRadialGradient(x+16,y+27,2,x+16,y+27,23);
    glow.addColorStop(0,'#ffba4b');glow.addColorStop(1,'#ffba4b00');
    c.globalAlpha=.13*brightness;c.fillStyle=glow;c.fillRect(x-7,y+4,46,46);c.restore();
  }
  gauge(x,y,size,pressure){
    this.image('gauge',x,y,size,size);const s=size/52,c=this.ctx,a=(-210+pressure*2.7)*Math.PI/180,cx=x+26*s,cy=y+25.5*s;
    c.save();c.translate(cx,cy);c.rotate(a);c.beginPath();c.moveTo(-4*s,-1*s);c.lineTo(18*s,0);c.lineTo(-4*s,2.3*s);c.closePath();c.fillStyle='#bd382a';c.strokeStyle='#6e2c25';c.lineWidth=.7*s;c.fill();c.stroke();c.restore();
    c.beginPath();c.arc(cx,cy,2*s,0,Math.PI*2);c.fillStyle='#151d26';c.fill();c.beginPath();c.arc(cx,cy,1.1*s,0,Math.PI*2);c.fillStyle='#e7d8b6';c.fill();
  }
  door(id,frame,x,y,w,h,amount,fx,fy,fw,fh,archiveX=389,archiveY=128){const img=this.assets.get(id),c=this.ctx;this.rect(x,y,w,h,'#202b3a');this.rect(x+7,y+6,w-14,h-8,'#151f2e');this.rect(x,y+h-15,w,15,'#475263');c.strokeStyle='#677185';c.lineWidth=.8;c.beginPath();c.moveTo(x,y+h);c.lineTo(x+w*.33,y+h-15);c.moveTo(x+w,y+h);c.lineTo(x+w*.67,y+h-15);c.stroke();if(id==='bulkhead')this.image('archive',archiveX,archiveY);c.save();c.beginPath();c.rect(x,y,w,h);c.clip();const split=w/2,offset=amount*(split+2);c.drawImage(img,0,0,img.width/2,img.height,x-offset,y,split,h);c.drawImage(img,img.width/2,0,img.width/2,img.height,x+split+offset,y,split,h);c.restore();this.image(frame,fx,fy,fw,fh);}
  sprite(id,frame,fw,fh,x,y,scale=1,mirror=false){const c=this.ctx,img=this.assets.get(id),meta=this.assets.manifest.images[id];if(!img)return;const [sw,sh]=meta.frame;c.save();c.translate(x,y);if(mirror){c.scale(-1,1);c.translate(-fw*scale,0);}c.drawImage(img,frame*sw,0,sw,sh,0,0,fw*scale,fh*scale);c.restore();}
  engineer(animation,{x=animation.actor.x,floor=220,facing=this.engineerFrame?.facing||animation.actor.facing,pose=this.engineerFrame?.pose}={}){
    const resolved=drawEngineer(this.ctx,this.engineerAppearance,x,floor,pose,{facing});
    Object.assign(this.canvas.dataset,{engineerOutfit:resolved.outfit,engineerPalette:resolved.palette,engineerAction:this.engineerFrame?.action||'idle',engineerFloor:String(floor),engineerFacing:String(facing)});
  }
  greg(x,y,w,h,world,speaking,time=0,reduced=false,{mobile=false,walking=false,facing=1,appearance=null}={}){
    if(!mobile)this.image('greg',x,y,w,h);const c=this.ctx,s=w/40;c.save();c.translate(x,y);c.scale(s,s);
    const cosmetic=appearance||equippedCosmetic(world,'greg'),palette=cosmetic.palette;
    if(mobile){const glow=c.createRadialGradient(22,46,1,22,46,15);glow.addColorStop(0,'#e9bd6966');glow.addColorStop(1,'#e9bd6900');c.fillStyle=glow;c.fillRect(5,37,34,23);c.fillStyle=palette?palette.primary:'#273747';c.strokeStyle='#171e28';c.lineWidth=2;c.beginPath();c.roundRect(4,11,35,32,6);c.fill();const paint=cosmeticMaterial(c,cosmetic.effect);if(paint){c.fillStyle=paint;c.fill();}c.stroke();if(palette){c.fillStyle=palette.shellRegions?.upper||palette.secondary;c.fillRect(7,12,29,5);c.fillStyle=palette.shellRegions?.lower||palette.secondary;c.fillRect(7,palette.shellRegions?33:36,29,palette.shellRegions?8:5);if(palette.panels)palette.panels.forEach((color,i)=>{c.fillStyle=color;c.fillRect(8+i*5.6,12,5.6,5);c.fillRect(8+i*5.6,36,5.6,5);});}c.strokeStyle=palette?palette.trim:'#bd9258';c.lineWidth=1.8;c.strokeRect(8,15,27,23);for(const tx of [10,28]){c.fillStyle=palette?palette.secondary:'#394957';c.fillRect(tx,41,6,6);c.fillStyle=palette?palette.highlight:'#e5b966';c.fillRect(tx+1,45,4,2);c.fillStyle='#f4d79188';c.beginPath();c.ellipse(tx+3,49,2.5,reduced?2:2.6+Math.sin(time*8)*.6,0,0,Math.PI*2);c.fill();}c.strokeStyle=palette?(palette.details||palette.trim):'#b89861';c.lineWidth=2;c.beginPath();c.moveTo(4,26);c.lineTo(0,30);c.lineTo(3,34);c.moveTo(39,26);c.lineTo(43,30);c.lineTo(40,34);c.moveTo(22,11);c.lineTo(22,5);c.stroke();c.fillStyle=palette?palette.highlight:'#edc578';c.beginPath();c.arc(22,4,2,0,Math.PI*2);c.fill();}
    this.rect(12,19,21,16,'#242a33');c.strokeStyle='#f5cd73';c.lineWidth=1.2;c.lineCap='round';const worried=(world.room==='engine'&&!world.machines.ventilation.certified)||(world.room==='life'&&serviceState(world)?.triggered&&!serviceState(world)?.applied)||(world.room==='relay'&&worryWorkshop(world)),secret=world.flags.includes('chapter_complete')&&!world.ending&&!world.logs.includes('record_reactor');
    const life=gregLife(time,{reduced,phase:world.room==='engine'?0:1.7});
    c.save();c.translate(mobile?facing*.65:0,26.5+life.eyeY);c.scale(1,life.openness);c.translate(0,-26.5);c.shadowColor='#eebf61';c.shadowBlur=.7;
    c.beginPath();if(this.reaction==='surprised'){c.arc(18,26,2.4,0,Math.PI*2);c.moveTo(30,26);c.arc(28,26,2.4,0,Math.PI*2);}else if(this.reaction==='skeptical'){c.moveTo(15,25);c.lineTo(21,27);c.moveTo(25,27);c.lineTo(31,27);}else if(['approving','excited'].includes(this.reaction)){c.moveTo(15,27);c.quadraticCurveTo(18,21,21,27);c.moveTo(25,27);c.quadraticCurveTo(28,21,31,27);}else if(mobile&&walking){c.moveTo(15,26);c.lineTo(21,26-facing*.5);c.moveTo(25,26-facing*.5);c.lineTo(31,26);}else if(secret){c.moveTo(15,26);c.lineTo(21,27);c.moveTo(25,27);c.lineTo(31,26);}else if(worried&&!speaking){c.moveTo(15,28);c.lineTo(18,26);c.lineTo(21,28);c.moveTo(25,28);c.lineTo(28,26);c.lineTo(31,28);}else{c.moveTo(15,28);c.lineTo(18,24);c.lineTo(21,28);c.moveTo(25,28);c.lineTo(28,24);c.lineTo(31,28);}c.stroke();c.restore();if(speaking||this.reaction==='excited'){c.beginPath();c.moveTo(21,32);c.quadraticCurveTo(23,33.6+(reduced?0:Math.sin(time*8)*.35),25,32);c.stroke();}c.restore();
  }
  companion(w,a,{reduced=false,speaking=false}={}){
    const p=a.companion;if(!p||!corePowered(w)||(a.power&&a.power.drone<=0))return;const c=this.ctx,bounce=!reduced&&['approving','excited'].includes(this.reaction)?-Math.abs(Math.sin(a.time*7))*1.3:0;
    const waking=a.power?1-a.power.drone:0;c.save();if(a.power)c.globalAlpha=a.power.drone;c.translate(p.x+(138-p.x)*waking-(a.cameraX||0),p.y+(193-p.y)*waking+bounce);c.rotate(reduced?0:Math.max(-.08,Math.min(.08,p.vx*.0008)));this.greg(-9,0,18,23.4,w,speaking,a.time,reduced,{mobile:true,walking:p.walking,facing:w.room==='relay'&&a.fabricator>.05&&!p.walking?Math.sign(805-p.x)||1:p.facing});c.restore();
    this.canvas.dataset.companionX=p.x.toFixed(3);this.canvas.dataset.companionY=p.y.toFixed(3);
  }
  sign(s,x,y,w){const c=this.ctx;c.fillStyle='#151b23';c.beginPath();c.roundRect(x-1,y-1,w+2,12,1.8);c.fill();c.fillStyle='#c79a60';c.beginPath();c.roundRect(x,y,w,10,1);c.fill();this.text(s,x+w/2,y+7,'#1c232b',5,'center');}
  draw(w,a,{reduced=false,speaking=false,reaction=null,worldVisible=true}={}){
    if(w.foundation?.outfitter)this.engineerAppearance={cosmetic:equippedCosmetic(w,'engineer').id};
    this.canvas.dataset.engineerCosmetic=equippedCosmetic(w,'engineer').id;this.canvas.dataset.gregCosmetic=equippedCosmetic(w,'greg').id;
    prepareEquipment(this,w,a);
    this.engineerFrame=this.engineerVisual.current(w,a,{reduced,visible:worldVisible});
    if(analysisEnvironment(w)){this.reaction=reaction;drawAnalysisEnvironment(this,w,a,{reduced});this.companion(w,a,{reduced,speaking});return;}
    this.reaction=reaction;if(openingEnvironment(w)){drawOpeningRoom(this,w,a,{reduced,speaking});this.companion(w,a,{reduced,speaking});return;}if(w.room==='relay'){drawWorkshop(this,w,a,{reduced,speaking});this.companion(w,a,{reduced,speaking});return;}if(extendedGarden(w)){drawGarden(this,w,a,{reduced,speaking});this.companion(w,a,{reduced,speaking});return;}this.canvas.dataset.cameraX="0";this.canvas.dataset.worldX=a.actor.x.toFixed(3);this.canvas.dataset.worldWidth="480";const c=this.ctx,t=a.time;this.image(w.room,0,0,480,270);
    if(CAMPAIGN_ROOMS[w.room])drawCampaign(this,w,a,{reduced,speaking});
    else if(w.room==='engine'){
      this.image('enginePipes',0,0);this.lantern(18,39,t,0,reduced);this.lantern(343,39,t,5.6,reduced);this.image('toolbox',23,177);this.image('vent',73,82);
      const running=w.machines.ventilation.output===1;c.save();c.translate(122,138);c.rotate(reduced?0:running?a.fan*Math.PI/2:0);this.image('fan',-31,-31);c.restore();
      this.gauge(237,57,52,w.pressure);this.image('sensor',197,149);this.image('harness',241,158,78,46);this.image('vessel',295,71);c.save();c.globalAlpha=reduced ? .08 : .08+.035*Math.sin(t*4.3)+.02*Math.sin(t*10.7);this.rect(326,125,9,21,'#ffdc67');c.restore();this.image('panel',235,123);this.image('locker',322,161);
      this.door('engineHatch','engineFrame',378,90,88,116,a.engineDoor,364,80,112,128);this.sign('MAINTENANCE',385,68,73);
      this.lamp(156.5,125,1.7,!running,'#ef632f');this.lamp(156.5,134,1.7,w.pressure>45,'#eaba36');this.lamp(156.5,143,1.7,running,'#77b852');this.lamp(209,170,2,w.sensors.vent==='repaired'||reduced||Math.floor(t*3)%2===1,'#e47936');this.lamp(273,132,1.5,w.machines.ventilation.certified,'#e8aa3d');
      if(!w.flags.includes('pass_taken')&&w.pressure<45){this.rect(335,179,12,7,'#d7b474');this.rect(337,180,3,4,'#626e80');}
      if(!running){for(let i=0;i<6;i++){const p=reduced?i/6:(t*.32+i/6)%1;c.globalAlpha=(1-p)*.42;this.sprite('steam',Math.min(3,Math.floor(p*4)),16,16,184-p*21,124-p*30,1+p*.65);}c.globalAlpha=1;}
    }else{
      this.image('corridorPipes',0,0);this.lantern(60,39,t,2.9,reduced);this.lantern(426,39,t,9.2,reduced);this.rect(7,78,48,125,'#151d27');this.image('engineFrame',0,73,62,140);this.sign('ENGINEERING',6,62,51);this.gauge(235,115,40,w.pressure);
      this.image('harness',278,185,65,32);this.image('panel',274,156,45,54);this.image('reader',316,132);this.image('deckLift',142,131,64,78);this.lamp(201,172,1.8,w.machines.security.certified&&w.doors.security,'#e8b96a');this.door('bulkhead','securityFrame',364,86,80,124,a.securityDoor,354,75,106,140);this.sign('SECURE ARCHIVE',369,63,77);
      const actual=machineInputs(w,'security');this.lamp(329,142,2,actual.A,'#e6ad4b');this.lamp(255,159,2,actual.B,'#84bcb8');this.lamp(309,165,1.5,w.machines.security.certified,'#e8aa3d');if(actual.A){this.rect(322,155,15,9,'#d3b576');this.rect(324,156,4,5,'#60758c');}this.text('AUTH',319,181);this.text('SAFE',245,171);if(w.doors.security)this.text('ARCHIVE',385,198);
    }
    // Pilot supply props reuse the ship's existing toolbox/cabinet layers. Emergency stock is unpowered.
    if(isInventoryPilot(w)||isEarly(w))for(const [id,p]of Object.entries(PICKUP_LOCATIONS))if(p.room===w.room){
      if(id!=='engine.not')this.image(id==='garden.or'?'toolbox':'locker',p.x,p.y,p.w,p.h);
      const available=pickupAvailability(w,id).state==='available';this.lamp(p.x+p.w-4,p.y+5,1.4,available,'#edbe65');
      if(id==='garden.or'){this.rect(p.x+3,p.y+p.h,5,3,'#151b24');this.rect(p.x+p.w-8,p.y+p.h,5,3,'#151b24');}
    }
    drawEquipment(this,w,a,{reduced});
    c.save();if(w.room==='relay'){const phase=nandPhase(w);c.globalAlpha=phase==='blackout'?.06:phase==='emergency'?.62:1;}
    const actor=a.actor;c.fillStyle='#17202a66';c.beginPath();c.ellipse(actor.x,220,7,1.5,0,0,Math.PI*2);c.fill();this.engineer(a);c.restore();this.companion(w,a,{reduced,speaking});
  }
}
