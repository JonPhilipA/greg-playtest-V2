import {isEarly,serviceState} from './curriculum-profile.js';
import {CAMPAIGN_ROOMS,CAMPAIGN_REPAIRS,CAMPAIGN_ORDER,canAdvance,campaignRecord,serviceSlots,nandPhase,nandDoors} from './campaign.js';
import {machineInputs} from './world.js';

/** Composition of independent machinery; live lights/screens come from the actual circuit. */
export function drawCampaign(r,w,a,{reduced=false,speaking=false}={}){
  const room=CAMPAIGN_ROOMS[w.room];if(!room)return;
  const c=r.ctx,t=a.time,[first,second]=room.repairs,m1=w.machines[first],m2=w.machines[second];
  const isNand=w.room==='relay',phase=isNand?nandPhase(w):null,doors=isNand?nandDoors(w):null;
  const powered=!isNand||['ready','entry','sealing'].includes(phase)||w.machines.nandnot?.output===1;
  const outputs=id=>w.machines[id]?.outputs||{},value=(id,key)=>outputs(id)[key]??0;
  if(powered){r.lantern(46,37,t,1.2+CAMPAIGN_ORDER.indexOf(w.room),reduced);r.lantern(351,37,t,8.5,reduced);}
  // In the NAND workshop the independent entrance leaves close behind the engineer.
  if(isNand)r.door('engineHatch','engineFrame',5,97,47,110,a.nandBackDoor??doors.back,0,89,61,124);
  else{r.rect(5,97,47,110,'#152131');r.image('engineFrame',0,89,61,124);}
  r.sign(isNand?'ENTRY / AND':'BACK',8,78,43);

  if(w.room==='life')r.image('gardenRack',116,60,105,39);
  else if(w.room==='navigation'||w.room==='bridge')r.image('viewPort',116,58,112,46.5);
  else{
    r.rect(129,88,84,10,'#202c3b');r.text(w.room==='relay'?'NAND / UNIVERSAL SPARES':w.room==='sensors'?'LOCAL RECEIVERS':'CORE / FOUR PHASE',171,95,room.accent,3.9,'center');
  }
  r.image(room.machine,87,102,130,108);
  // Each repair has its own physical cabinet and wire harness; three-board rooms stay separate.
  for(const slot of serviceSlots(w.room,w)){
    const {id,x,y,w:width,h:height}=slot,scale=width/49;
    r.image('harness',x+3,y+height-20,54*scale,30*scale);
    r.image('panel',x,y,width,height);
    r.lamp(x+38*scale,y+9*scale,1.6*scale,w.machines[id].certified,'#e4b15d');
    r.text(CAMPAIGN_REPAIRS[id].short.toUpperCase(),x+width/2,214,'#e4d4b7',room.repairs.length>2?2.9:3.2,'center');
  }
  r.image('archive',274,90);r.lamp(301,98,1.5,w.logs.includes(campaignRecord(w.room)),'#99bdc7');
  r.text('WATCH RECORD',288,133,'#e1d7bd',3.5,'center');
  if(w.room==='life'){
    const running=m2.certified&&value(second,'Y')===1;
    for(const x of [122,182]){c.save();c.translate(x,138);c.rotate(reduced?0:isEarly(w)?(a.scrubberAngle||0):running?t*6:0);r.image('fan',-21,-21,42,42);c.restore();}
    r.lamp(208,112,2,m1.certified&&value(first,'Y')===1,'#e76244');
    r.lamp(208,121,2,m1.certified&&value(first,'Y')===0,'#d2b568');
    if(isEarly(w)&&serviceState(w)?.triggered&&!serviceState(w).applied){r.lamp(208,132,3,reduced||Math.sin(t*4)>.1,'#df654d');r.text('HARDWARE FAULT',152,214,'#f6b087',4,'center');}
    if(isEarly(w))r.lamp(365,160,2,w.machines.safetycutoff?.certified&&w.machines.safetycutoff.output===0,'#9dbb76');
    r.text(running?'FILTERS / RUNNING':'FILTERS / OFFLINE',152,203,room.accent,3.4,'center');
  }else if(w.room==='relay'){
    r.lamp(115,150,3,powered&&phase!=='blackout','\x23e2b56a');
    for(const [i,id] of ['nandnot','nandand','nandor'].entries())r.lamp(166+i*12,164,2,(w.machines[id].certified||!w.nandEvent?.failed)&&value(id,'Y')===1,'#e6b262');
    const status=phase==='blackout'?'MAIN SUPPLY / LOST':phase==='emergency'?'EMERGENCY / NAND SPARES':phase==='entry'||phase==='ready'?'CONTROLLERS / ONLINE':powered?'LIGHTING / RESTORED':'SUPPLY / ISOLATED';
    r.text(status,152,203,room.accent,3.1,'center');
  }else if(w.room==='sensors'){
    const cx=134,cy=149;
    if(m1.certified){const angle=reduced?-.7:t*.6;c.save();c.strokeStyle='#8eb4be';c.lineWidth=1.2;c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+Math.cos(angle)*29,cy+Math.sin(angle)*29);c.stroke();c.restore();}
    const sensors=machineInputs(w,first);for(const [i,key] of ['A','B','C'].entries())r.lamp(119+i*15,190,1.5,m1.certified&&sensors[key]===1,'#80afb4');
    r.lamp(196,126,2,m2.certified&&value(second,'Y')===1,'#e4ad62');r.lamp(196,142,2,m2.certified&&value(second,'Z')===1,'#86b7c2');
    r.text(m2.certified?'REMOTE COMMAND / ISOLATED':'REMOTE COMMAND / EXPOSED',152,203,room.accent,3.1,'center');
  }else if(w.room==='navigation'){
    if(m1.certified){c.save();c.strokeStyle=m2.certified?'#d1b875':'#6b9eb4';c.lineWidth=.9;c.beginPath();c.moveTo(106,137);c.lineTo(130,127);c.lineTo(154,136);c.lineTo(178,122);c.lineTo(192,132);c.stroke();for(const [x,y] of [[106,137],[130,127],[154,136],[178,122],[192,132]])r.lamp(x,y,1.1,true,'#d9c48b');c.restore();}
    r.text(m1.certified?`FIX ${value(first,'C')}${value(first,'S')}  COURSE ${value(second,'C')}${value(second,'S')}`:'STAR FIX / UNRESOLVED',152,179,'#d5e3db',4.8,'center');
  }else if(w.room==='reactor'){
    const phase=(value(second,'H')<<1)|value(second,'L');
    r.lamp(102,157,2,m1.certified&&value(first,'Y')===1,'#9cc6d0');r.lamp(102,172,2,m1.certified&&value(first,'Z')===1,'#9cc6d0');
    if(m2.certified){c.save();c.globalAlpha=reduced ? .26 : .26+Math.sin(t*3)*.04;r.rect(141,138,32,38,'#edac45');c.restore();}
    for(let i=0;i<4;i++)r.lamp(140+i*11,199,2,m2.certified&&i===phase,'#ffcb69');
    r.text(m2.certified?`PHASE ${phase.toString(2).padStart(2,'0')}`:'RESTART / HELD',157,188,'#e8d5ad',3.9,'center');
  }else if(w.room==='bridge'){
    r.text(m1.certified?String(value(first,'Y')).padStart(2,'0'):'—',119,189,'#d9dfd7',6,'center');
    r.text(w.ending?(value('override','M')?'CREW':'GREG'):room.repairs.every(id=>w.machines[id].certified)?'READY':'LOCK',184,189,'#e9d5a8',4.1,'center');
    if(w.machines.flightmemory?.certified)r.text(`Q ${value('flightmemory','C')}${value('flightmemory','S')}`,119,198,'#c5d5d2',3.2,'center');
    c.save();c.strokeStyle='#d8a856';c.lineWidth=2;c.beginPath();c.moveTo(152,190);c.lineTo(w.ending==='greg'?155:149,173);c.stroke();c.restore();
  }
  const open=isNand?!!doors.forward:canAdvance(w,w.room),amount=typeof a.campaignDoor==='number'?a.campaignDoor:Number(open);
  r.door('engineHatch','engineFrame',394,89,75,122,w.room==='bridge'?0:amount,386,84,91,130);
  const next=CAMPAIGN_ORDER[CAMPAIGN_ORDER.indexOf(w.room)+1];
  const names={relay:'NAND WORKSHOP',sensors:'SENSOR ARRAY',navigation:'CHART ROOM',reactor:'REACTOR CORE',bridge:'COMMAND BRIDGE'};
  r.sign(w.room==='bridge'?'HELM / LOCAL':names[next]||'CREW DECKS',392,73,78);
  r.lamp(431,84,1.4,open,'#b9d2b9');
  if(isNand){
    const outage=phase==='blackout',emergency=!powered&&!['ready','entry','sealing'].includes(phase);
    if(outage||emergency){
      c.save();c.fillStyle=outage?'#05080ded':'#090e1b75';c.fillRect(0,0,480,270);c.restore();
    }
    for(const [x,y] of [[64,116],[363,116]]){
      if(emergency&&!outage){
        const glow=c.createRadialGradient(x+11,y+9,1,x+11,y+9,34);
        glow.addColorStop(0,'#f5a34c55');glow.addColorStop(1,'#d9743600');
        c.save();c.fillStyle=glow;c.fillRect(x-23,y-25,68,68);c.restore();
      }
      c.save();c.globalAlpha=outage ? .08 : emergency?1:.35;r.image('emergencyLamp',x,y,22,18);c.restore();
    }

  }
}
