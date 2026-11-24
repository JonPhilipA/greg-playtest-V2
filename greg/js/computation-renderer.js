import {rippleWord} from './ripple-adder.js';
import {COMPUTATION_AREAS,computationBoard} from './computation-layout.js';
import {converterSigned} from './twos-complement.js';
const ink='#26474d',teal='#366c6e',rust='#a16b4d';
function write(c,s,x,y,size=6,color=ink,align='left'){
 c.font=`bold ${size}px "Segoe Print", "Comic Sans MS", cursive`;c.textAlign=align;c.fillStyle=color;c.fillText(s,x,y,160);c.textAlign='left';
}
function stroke(c,points,color=ink,width=.65,dashed=false){c.beginPath();c.strokeStyle=color;c.lineWidth=width;c.setLineDash(dashed?[2,1.7]:[]);points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();c.setLineDash([]);}
function arrow(c,x,y,toX,toY,color=teal,dashed=false){
 stroke(c,[[x,y],[toX,toY]],color,.65,dashed);const angle=Math.atan2(toY-y,toX-x),d=2.3;stroke(c,[[toX-d*Math.cos(angle-.5),toY-d*Math.sin(angle-.5)],[toX,toY],[toX-d*Math.cos(angle+.5),toY-d*Math.sin(angle+.5)]],color);
}
function box(c,x,y,w,h,label){stroke(c,[[x+.4,y],[x+w,y+.5],[x+w-.4,y+h],[x,y+h-.3],[x+.4,y]],teal);write(c,label,x+w/2,y+h*.7,4.5,ink,'center');}
function halfGate(c,x,y,xor){
 c.beginPath();c.strokeStyle=ink;c.lineWidth=.7;
 if(xor){c.moveTo(x,y);c.quadraticCurveTo(x+8,y+5,x,y+10);c.quadraticCurveTo(x+9,y+11,x+16,y+5);c.quadraticCurveTo(x+9,y-1,x,y);c.moveTo(x-2,y);c.quadraticCurveTo(x+6,y+5,x-2,y+10);}
 else{c.moveTo(x,y);c.lineTo(x+7,y);c.bezierCurveTo(x+18,y,x+18,y+10,x+7,y+10);c.lineTo(x,y+10);c.closePath();}c.stroke();
}
function half(c,m){
 for(const [i,line]of m.lines.slice(0,m.complete?4:3).entries())write(c,line,11,26+i*8.2,6.3);
 if(m.complete){
  write(c,'A',101,25,4.5);write(c,'B',111,25,4.5);halfGate(c,121,28,true);halfGate(c,121,46,false);
  stroke(c,[[102,27],[102,30],[121,30]]);stroke(c,[[112,27],[112,36],[121,36]]);stroke(c,[[102,30],[102,48],[121,48]]);stroke(c,[[112,36],[112,54],[121,54]]);
  stroke(c,[[137,33],[147,33]]);stroke(c,[[137,51],[147,51]]);write(c,'S',150,35,4.7);write(c,'C',150,53,4.7);
  write(c,m.lines[4],11,62,5.5,teal);write(c,m.lines[5],11,69,5.5,teal);
  c.beginPath();c.ellipse(47,50.8,10,4.2,.06,0,Math.PI*2);c.strokeStyle=rust;c.lineWidth=.6;c.stroke();
 }else{box(c,109,29,41,20,'A + B ?');write(c,'SUM ?',110,59,5.2,teal);write(c,'CARRY ?',110,68,5.2,teal);stroke(c,[[11,58],[85,59]],rust,.5,true);}
}
function full(c,m){
 write(c,m.lines[0],10,26,6.2);
 box(c,32,35,37,15,m.complete?'FULL ADDER':'NEXT BIT ?');box(c,104,35,37,15,m.complete?'FULL ADDER':'LOW BIT ?');
 arrow(c,104,42,69,42,teal,!m.complete);write(c,m.complete?'Cout → Cin':'carry ?',86,37,4.2,rust,'center');
 if(m.complete){write(c,'A B Cin',122,32,4.3);arrow(c,122,32,122,35);write(c,'S',122,55,4.5);write(c,'HIGH BIT ← LOW BIT',86,61,5.1,teal,'center');write(c,m.lines[2],10,69,5.3);}
 else{write(c,m.lines[1],10,61,6.2);write(c,'Where does the extra 1 go?',10,69,4.9,rust);}
}
function ripple(c,m){
 for(let i=0;i<4;i++){box(c,8+i*41,30,30,17,'FA'+i);if(i<3)arrow(c,38+i*41,38,49+i*41,38,teal,!m.complete);write(c,'S'+i,23+i*41,57,5,ink,'center');arrow(c,23+i*41,47,23+i*41,51);}
 write(c,m.complete?'Cout → next Cin · C0 = 0':'Connect the missing carry links',88,26,4.7,rust,'center');write(c,m.complete?'ADD4C = FOUR FULL ADDERS':'S0 S1 S2 S3 · separate C4',88,69,4.7,teal,'center');
}
function complement(c,m){
 if(m.complete){write(c,m.lines[0],88,25,7,ink,'center');write(c,'INVERT',54,35,4.5,teal);arrow(c,88,29,88,37);write(c,'1010',88,44,7,ink,'center');write(c,'ADD 1',54,54,4.5,teal);arrow(c,88,48,88,56);write(c,'−5 = 1011',88,64,7,ink,'center');write(c,'4-BIT SIGNED · −8 TO +7',88,70,3.5,teal,'center');}
 else{write(c,m.lines[0],88,28,7,ink,'center');write(c,m.lines[1],88,43,6,teal,'center');write(c,m.lines[2],88,56,6.3,ink,'center');write(c,m.lines[3],88,68,4.5,rust,'center');}
}
function subtract(c,m){
 write(c,m.lines[0],88,26,6.8,ink,'center');
 if(m.complete){
  write(c,'A',20,39,5);arrow(c,28,37,88,37);box(c,88,33,55,22,'FA ×4');
  write(c,'B',20,51,5);arrow(c,28,49,40,49);box(c,40,43,27,12,'XOR4');arrow(c,67,49,88,49);
  write(c,'SUB',159,62,4.5,rust,'center');stroke(c,[[159,57],[159,29],[55,29],[55,43]],rust);arrow(c,159,46,143,46,rust);write(c,'Cin',148,43,3.6,rust);
  arrow(c,116,55,116,60);write(c,'SUM',124,61,4.1);write(c,'SUB 0: A+B',10,64,4.7,teal);write(c,'SUB 1: A+(~B)+1',10,70,4.7,teal);
 }else{write(c,'B',22,46,5);arrow(c,29,44,47,44);box(c,47,35,32,18,'?');arrow(c,79,44,95,44);box(c,95,35,48,18,'ADDER');write(c,'MODE ?',159,62,4.5,rust,'center');write(c,m.lines[1],10,63,5.2,teal);write(c,m.lines[2],10,70,5.2);}
}
/** Read-only scenery. Only existing committed repair state recovers the full notes. */
export function drawComputationLab(r,w,a,{trace,reduced=false}={}){
 const c=r.ctx,models=[];
 for(const area of COMPUTATION_AREAS){
  const model=computationBoard(w,area.id);models.push(model);const b=area.board;
  c.save();c.translate(b.x,b.y);c.beginPath();c.rect(3,3,b.w-6,b.h-5);c.clip();
  write(c,model.title,b.w/2,13,area.id==='addsub'?5.1:area.id==='trajectory'?5.35:6.2,ink,'center');stroke(c,[[11,16],[b.w-12,16.7]],rust,.55);
  ({navbits:half,trajectory:full,ripple_adder:ripple,twos_complement:complement,addsub:subtract}[area.id])(c,model);
  c.restore();
  const s=area.scope;
  if(area.id==='addsub'){
   const value=w.machines?.addsub?.certified?(w.circuits?.addsub?.configuration?.subtractorVersion?rippleWord(w.machines.addsub.outputs||{},'C'):w.machines.addsub.outputs?.Y):undefined;
   r.rect(s.x,s.y,s.w,s.h,'#102836');r.text('RESULT [3:0]',s.x+s.w/2,s.y+5,'#a2c4bc',2.9,'center');r.text(Number.isInteger(value)?value.toString(2).padStart(4,'0'):'—',s.x+s.w/2,s.y+14,'#a7e1cd',6.6,'center');
  }else trace(c,s.x,s.y,s.w,s.h,reduced?0:a.time*.4,'#90c6bd',area.number*.11);
  if(area.id==='twos_complement'){
   const bits=w.circuits?.twos_complement?.configuration?.bits;
   if(Number.isInteger(bits)){
    r.rect(area.x+65,149,58,13,'#102836');r.text(bits.toString(2).padStart(4,'0').split('').join(' '),area.x+94,158,'#a7e1cd',6,'center');
    r.rect(area.x+67,167,55,5,'#3c505e');r.text('SIGNED '+String(converterSigned(bits)).replace('-','−'),area.x+94,171,'#b7d7ca',3.8,'center');
   }
  }
  // Soft desk-lamp pools stay behind the engineer and companion.
 }
 for(const x of [672,866]){c.save();const g=c.createRadialGradient(x+8,158,1,x+8,158,22);g.addColorStop(0,'#efd19b1c');g.addColorStop(1,'#efd19b00');c.fillStyle=g;c.fillRect(x-15,140,46,38);c.restore();}
 // Inspectable rendering metadata is derived, never written into the voyage save.
 const key=models.map(m=>Number(m.complete)).join('');if(r.computationBoardKey!==key){r.canvas.dataset.computationBoards=JSON.stringify(models);r.computationBoardKey=key;}
}
