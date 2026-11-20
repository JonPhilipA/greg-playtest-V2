// Display only: no world, save, camera or puzzle capabilities.
export const fullscreenIcon=active=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${active?'M3 9h6V3M15 3v6h6M21 15h-6v6M9 21v-6H3':'M9 3H3v6M15 3h6v6M21 15v6h-6M9 21H3v-6'}"/></svg>`;
export const fullscreenControl=({compact=false,placement='title'}={})=>`<button type="button" class="fullscreen-control ${compact?(placement==='pause'?'menu-fullscreen':'title-fullscreen'):'brass-button'}" data-fullscreen aria-label="Enter fullscreen" aria-pressed="false" title="Enter fullscreen">${fullscreenIcon(false)}${compact?'':'<span data-fullscreen-label>ENTER FULLSCREEN</span>'}</button><p class="fullscreen-status ${compact?(placement==='pause'?'menu-display-status':'title-display-status'):''}" data-fullscreen-status role="status" aria-live="polite"></p>`;
export class FullscreenDisplay{
 constructor(root,{doc=root.ownerDocument,now=()=>performance.now()}={}){
  Object.assign(this,{root,doc,now});this.pending=false;this.message='';this.exitEscapeUntil=0;this.escapeHeld=false;
  this.click=e=>{const button=e.target.closest?.('[data-fullscreen]');if(!button||!root.contains(button))return;e.preventDefault();e.stopImmediatePropagation();if(!button.disabled)void this.toggle();};
  this.change=()=>{if(!doc.fullscreenElement&&!this.pending)this.exitEscapeUntil=now()+250;this.message='';this.sync();};
  this.escape=e=>{if(e.key==='Escape'&&(doc.fullscreenElement||now()<this.exitEscapeUntil||e.repeat&&this.escapeHeld)){
   this.escapeHeld=true;e.stopImmediatePropagation(); // Leave the browser's default Escape action intact.
  }};
  this.release=e=>{if(e.key==='Escape')this.escapeHeld=false;};
  root.addEventListener('click',this.click,true);doc.addEventListener('fullscreenchange',this.change);doc.addEventListener('keydown',this.escape,true);doc.addEventListener('keyup',this.release,true);this.sync();
 }
 supported(){return typeof this.root.requestFullscreen==='function'&&typeof this.doc.exitFullscreen==='function'&&this.doc.fullscreenEnabled!==false;}
 sync(){
  const active=!!this.doc.fullscreenElement,supported=this.supported(),label=active?'Exit fullscreen':'Enter fullscreen';
  for(const button of this.root.querySelectorAll('[data-fullscreen]')){
   button.disabled=this.pending||!supported;button.setAttribute('aria-label',label);button.setAttribute('aria-pressed',String(active));button.title=supported?label:'Fullscreen is unavailable in this browser.';
   button.querySelector('svg')?.remove();button.insertAdjacentHTML('afterbegin',fullscreenIcon(active));const text=button.querySelector('[data-fullscreen-label]');if(text)text.textContent=label.toUpperCase();
  }
  for(const status of this.root.querySelectorAll('[data-fullscreen-status]'))status.textContent=this.message||(!supported?'Fullscreen is unavailable in this browser.':'');
 }
 async toggle(){
  if(this.pending)return false;if(!this.supported()){this.sync();return false;}
  this.pending=true;this.message='';this.sync();
  try{
   // Called synchronously from the click handler, preserving transient user activation.
   if(this.doc.fullscreenElement)await this.doc.exitFullscreen();else await this.root.requestFullscreen();
   return true;
  }catch{this.message='Fullscreen could not be changed. You can keep playing in this window.';return false;}
  finally{this.pending=false;this.sync();}
 }
 dispose(){this.root.removeEventListener('click',this.click,true);this.doc.removeEventListener('fullscreenchange',this.change);this.doc.removeEventListener('keydown',this.escape,true);this.doc.removeEventListener('keyup',this.release,true);}
}
