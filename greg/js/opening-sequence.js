// A single narrative element and clock; presentation never activates the core.
export const OPENING_LINES=Object.freeze(['You wake up in darkness.','The KESTREL has crashed on an unknown moon.','The ship is without power.']);
export const OPENING_INTERVAL=3.5;
export const OPENING_FADE=.4;
export const OPENING_BLACK_HOLD=.15;
export function openingOpacity(time){return Math.max(0,Math.min(1,time/OPENING_FADE,(OPENING_INTERVAL-time)/OPENING_FADE));}
const skipKey=key=>key==='Enter'?'Enter':[' ','Space','Spacebar'].includes(key)?'Space':null;
export class CrashOpening{
 constructor(host,{finish=()=>{},reduced=()=>false}={}){Object.assign(this,{host,finish,reduced});this.active=false;this.keys=new Set();this.pointers=new Set();this.cooldown=0;}
 get blocksInput(){return this.active||this.cooldown>0||this.keys.size>0||this.pointers.size>0;}
 start(){
  this.active=true;this.lastTickAt=null;this.elapsed=0;this.lineElapsed=0;this.blackElapsed=0;this.index=0;this.paintedIndex=-1;this.cooldown=0;this.keys.clear();this.pointers.clear();
  this.host.hidden=false;this.host.className='text-opening cinematic-opening'+(this.reduced()?' reduced':'');
  if(!this.caption){this.host.innerHTML='<p class="opening-text" role="status" aria-live="polite" aria-atomic="true"></p>';this.caption=this.host.querySelector('.opening-text');}
  this.host.tabIndex=-1;this.host.setAttribute('aria-description','Opening narrative. Press Enter or Space, or click or tap, to advance.');this.host.focus({preventScroll:true});this.paint();
 }
 paint(){
  const black=this.index>=OPENING_LINES.length;
  if(this.paintedIndex!==this.index){this.caption.style.opacity='0';this.caption.textContent=black?'':OPENING_LINES[this.index];this.paintedIndex=this.index;this.host.dataset.line=String(this.index);this.host.dataset.phase=black?'black':'narrative';}
  this.caption.style.opacity=String(black?0:openingOpacity(this.lineElapsed));
 }
 advance(){if(!this.active||this.index>=OPENING_LINES.length)return;this.lastTickAt=null;this.index++;this.lineElapsed=0;this.blackElapsed=0;this.paint();}
 tick(dt,now){
  const delta=Math.max(0,now===undefined?dt:this.lastTickAt===null?0:(now-this.lastTickAt)/1000);if(now!==undefined)this.lastTickAt=now;
  this.cooldown=Math.max(0,this.cooldown-delta);if(!this.active)return;
  this.elapsed+=delta;
  if(this.index>=OPENING_LINES.length){this.blackElapsed+=delta;if(this.blackElapsed>=OPENING_BLACK_HOLD)this.stop();return;}
  this.lineElapsed+=delta;
  while(this.lineElapsed>=OPENING_INTERVAL-1e-9){this.lineElapsed=Math.max(0,this.lineElapsed-OPENING_INTERVAL);this.index++;if(this.index>=OPENING_LINES.length){this.blackElapsed=0;this.lineElapsed=0;this.paint();return;}}
  this.paint();
 }
 keyDown(event){
  const key=skipKey(event.key);if(!key||event.ctrlKey||event.metaKey||event.altKey)return false;
  if(!this.active&&!this.keys.has(key)&&!this.blocksInput)return false;
  const held=this.keys.has(key);this.keys.add(key);if(this.active&&!held&&!event.repeat)this.advance();return true;
 }
 releaseInputs(){this.keys.clear();this.pointers.clear();this.cooldown=Math.max(this.cooldown,.3);}
 keyUp(key){this.keys.delete(skipKey(key));}
 pointerDown(id){if(this.blocksInput)this.pointers.add(id);}
 pointerUp(id){if(this.pointers.delete(id))this.cooldown=Math.max(this.cooldown,.25);}
 stop(){if(!this.active)return;this.active=false;this.cooldown=Math.max(this.cooldown,.3);this.host.hidden=true;this.finish();}
}
