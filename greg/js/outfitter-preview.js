import {Renderer} from './renderer.js';
import {engineerPose} from './engineer-concepts.js';
// Shared production draw calls; only framing differs between cards and full-body previews.
export function renderCosmeticFrame(renderer,item,world,{width,height,pixelRatio=1,portrait=false,time=0,reduced=true}={}){
 const c=renderer.ctx;c.setTransform(pixelRatio,0,0,pixelRatio,0,0);c.clearRect(0,0,width,height);c.save();
 if(portrait){
  const scale=Math.min(width,height)/32;
  if(item.character==='engineer'){c.translate(width/2,41*scale);c.scale(scale,scale);}
  else{const s=Math.min(width/52,height/62);c.translate(width/2-22*s,height/2-29*s);c.scale(s,s);}
 }else if(item.character==='engineer'){
  const scale=Math.max(.25,Math.min((width-28)/32,(height-24)/46));
  const floor=(height-46*scale)/2+41*scale;
  c.fillStyle='#08162566';c.beginPath();c.ellipse(width/2,floor+2*scale,8*scale,1.2*scale,0,0,Math.PI*2);c.fill();
  c.translate(width/2,floor);c.scale(scale,scale);
 }else{
  const scale=Math.max(.2,Math.min((width-30)/55,(height-24)/65)),top=(height-60*scale)/2;
  c.fillStyle='#08162566';c.beginPath();c.ellipse(width/2,top+58*scale,12*scale,1.7*scale,0,0,Math.PI*2);c.fill();
  c.translate(width/2-22*scale,top+(reduced?0:Math.sin(time*2.2)*.6)*scale);c.scale(scale,scale);
 }
 if(item.character==='engineer'){
  renderer.engineerAppearance={cosmetic:item.id};renderer.engineer({actor:{x:0,facing:1}},{x:0,floor:0,facing:1,pose:engineerPose({time,reduced})});
 }else renderer.greg(0,0,40,52,world,false,time,reduced,{mobile:true,appearance:item});
 c.restore();renderer.canvas.dataset.previewCharacter=item.character;renderer.canvas.dataset.previewCosmetic=item.id;
}
const portraits=new Map();let scratch=null,generated=0;
/** At most 28 small cached surfaces for this catalog. Never called from the animation tick. */
export function cosmeticPortrait(item,world,assets){
 const key=JSON.stringify([item.character,item.id,item.palette,item.effect]);if(portraits.has(key))return portraits.get(key);
 if(!scratch){scratch=new Renderer(document.createElement('canvas'),assets);scratch.canvas.width=128;scratch.canvas.height=128;scratch.reaction='approving';}
 renderCosmeticFrame(scratch,item,world,{width:128,height:128,portrait:true});
 const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;canvas.getContext('2d').drawImage(scratch.canvas,0,0);portraits.set(key,canvas);generated++;return canvas;
}
export const cosmeticPortraitStats=()=>({cached:portraits.size,generated});
