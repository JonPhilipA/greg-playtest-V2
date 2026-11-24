import {DEVELOPMENT_BUILD} from './build-info.js';
import {doorBounds,FLOOR_SURFACES} from './room-door-layout.js';

export const DEFAULT_DOORWAY_TUNING=Object.freeze({brightness:.9,depth:1.5,warmth:0});
let doorwayTuning=DEFAULT_DOORWAY_TUNING;
export const getDoorwayTuning=()=>({...doorwayTuning});
export function setDoorwayTuning(values){
 if(!DEVELOPMENT_BUILD)return getDoorwayTuning();
 const next={...doorwayTuning};
 for(const [key,min,max] of [['brightness',0,2],['depth',.5,1.5],['warmth',0,1]]){
  if(values[key]===undefined)continue;
  if(!Number.isFinite(values[key]))throw Error('Invalid doorway '+key);
  next[key]=Math.max(min,Math.min(max,values[key]));
 }
 doorwayTuning=next;return getDoorwayTuning();
}
function surfaceColor(hex,warm=true){
 const {brightness,warmth}=doorwayTuning;
 const channels=[1,3,5].map(offset=>parseInt(hex.slice(offset,offset+2),16));
 const amber=[75,47,20],blend=warm?warmth*.25:0;
 return 'rgb('+channels.map((channel,i)=>Math.round(Math.min(255,(channel*(1-blend)+amber[i]*blend)*brightness))).join(',')+')';
}

export function advanceDoor(current,target,dt,reduced) {
  if(current==null || reduced) return target;
  const step=Math.min(.05,Math.max(0,dt))*2.4;
  const gap=target-current;
  return Math.abs(gap)<=step ? target : current+Math.sign(gap)*step;
}

export function doorPose(amount) {
  const progress=Math.max(0,Math.min(1,amount));
  return {bolts:Math.min(1,progress/.22),leaves:Math.max(0,(progress-.22)/.78)};
}

// Keep the recess geometry independent of the entrance light, which fades to black.
function drawPassage(r,x,y,w,h){
 const c=r.ctx,bottom=y+h,depth=doorwayTuning.depth;
 const rear={left:x+w*.16*depth,right:x+w*(1-.16*depth),top:y+h*.075*depth,bottom:bottom-h*.105*depth};
 const polygon=(points,fill)=>{
  c.fillStyle=fill;c.beginPath();
  points.forEach(([px,py],i)=>i?c.lineTo(px,py):c.moveTo(px,py));
  c.closePath();c.fill();
 };
 const shade=(x0,y0,x1,y1,near)=>{
  const gradient=c.createLinearGradient(x0,y0,x1,y1);
  gradient.addColorStop(0,surfaceColor(near));
  gradient.addColorStop(.72,surfaceColor('#070a0d',false));
  gradient.addColorStop(1,'#000000');return gradient;
 };
 r.rect(x,y,w,h,'#000000');
 polygon([[x,y],[rear.left,rear.top],[rear.left,rear.bottom],[x,bottom]],shade(x,y,rear.left,y,'#242d37'));
 polygon([[x+w,y],[rear.right,rear.top],[rear.right,rear.bottom],[x+w,bottom]],shade(x+w,y,rear.right,y,'#1e2731'));
 polygon([[x,y],[x+w,y],[rear.right,rear.top],[rear.left,rear.top]],shade(x,y,x,rear.top,'#28323d'));
 const floorShade=shade(x,bottom,x,rear.bottom,'#30373e');
 polygon([[x,bottom],[rear.left,rear.bottom],[rear.right,rear.bottom],[x+w,bottom]],floorShade);
 // Sparse floor joints inherit the same fade and stop at the dark end of the recess.
 c.lineWidth=.45;c.strokeStyle=shade(x,bottom,x,rear.bottom,'#41464a');c.beginPath();
 for(const t of [.32,.73]){
  const left=x+(rear.left-x)*t,right=x+w+(rear.right-x-w)*t,low=bottom+(rear.bottom-bottom)*t;
  c.moveTo(left,low);c.lineTo(right,low);
 }
 for(const t of [.33,.67]){
  c.moveTo(x+w*t,bottom);c.lineTo(rear.left+(rear.right-rear.left)*t,rear.bottom);
 }
 c.stroke();
}

/** Draw the Garden's illustrated maintenance door on the ship's shared walking plane. */
export function drawRoomDoor(r,center,{amount=0,released=amount>0,label,emergency=false,trim='#c49a61'}={}) {
  const floor=r.floorSurface?.back??FLOOR_SURFACES.default.back;
  const {x,y,w,h}=doorBounds(center,floor);
  const c=r.ctx,pose=doorPose(amount),leaf=r.assets.get('engineHatch');
  const left=x+5,top=y+8,width=w-10,height=h-9,split=width/2;
  const shift=pose.leaves*(split+2);
  c.save();
  c.beginPath();
  c.moveTo(x+10,y+1);
  c.lineTo(x+w-10,y+1);
  c.lineTo(x+w-1,y+13);
  c.lineTo(x+w-1,floor);
  c.lineTo(x+1,floor);
  c.lineTo(x+1,y+13);
  c.closePath();
  c.clip();
  r.rect(x,y,w,h,'#172434');
  drawPassage(r,left,top,width,height);
  c.save();
  c.beginPath();c.rect(left,top,width,height);c.clip();
  if(leaf) {
    c.drawImage(leaf,0,0,leaf.width/2,leaf.height,left-shift,top,split,height);
    c.drawImage(leaf,leaf.width/2,0,leaf.width/2,leaf.height,left+split+shift,top,split,height);
  }
  c.restore();
  r.image('engineFrame',x,y,w,h);
  for(const strike of [y+37,y+101]) {
    for(const [jamb,direction] of [[left,1],[left+width,-1]]) {
      const extension=5*(1-pose.bolts);
      r.rect(jamb-1,strike,2,5,'#14202a');
      r.rect(jamb+(direction<0?-extension:0),strike+1,extension,3,trim);
    }
  }
  c.restore();
  if(label) r.sign(label,x+1,y-15,w-2);
  r.lamp(x+w-9,y+12,1.7,true,emergency?'#e86c52':released?'#93c997':'#d29a62');
  if(pose.leaves===1&&released&&!emergency)return;
  const status=emergency?'EMERGENCY LOCK':released?'UNLOCKED':'LOCKED';
  r.rect(center-19,y+h-12,38,7,'#172530');
  r.text(status,center,y+h-7,emergency?'#f0b391':released?'#d7e9ce':'#e5c391',3.1,'center');
}
