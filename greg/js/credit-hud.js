import {creditBalance} from './credits.js';
import {creditAmount} from './circuit-rewards.js';
import {creditEmblem} from './credit-visual.js';
export const compactCredits=value=>value>=1_000_000?new Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:2}).format(value):creditAmount(value);
export const creditHudMarkup=()=>`<div class="credit-hud" id="credit-hud" hidden><button type="button" class="credit-counter" aria-label="KESTREL Credits. Balance: 0" aria-expanded="false" aria-controls="credit-popover">${creditEmblem()}<span class="credit-balance" aria-hidden="true">0</span></button><span class="credit-gain" aria-hidden="true" hidden></span><div class="credit-popover" id="credit-popover" role="tooltip" hidden><strong>KESTREL CREDITS</strong><span>Balance: <b data-credit-exact>0</b></span><small data-credit-help>Earned by repairing ship systems.</small><button type="button" class="credit-popover-close" aria-label="Dismiss credit information">×</button></div><span class="credit-announcement" role="status" aria-live="polite" aria-atomic="true"></span></div>`;
/** Display interpolation is independent of the immediately committed authoritative balance. */
export class CreditHUD{
 constructor(root,{reduced=()=>false,effect=()=>{},openShop=null,shopAvailable=()=>false}={}){
  Object.assign(this,{root,reduced,effect,openShop,shopAvailable});this.button=root.querySelector('.credit-counter');this.label=root.querySelector('.credit-balance');this.popover=root.querySelector('.credit-popover');this.gain=root.querySelector('.credit-gain');this.announcement=root.querySelector('.credit-announcement');this.last=null;this.pending=null;
  this.button.onclick=e=>{e.stopPropagation();if(this.openShop&&this.shopAvailable()){this.show(false);if(this.openShop())return;}this.show(true);};this.popover.querySelector('button').onclick=e=>{e.stopPropagation();this.show(false);this.button.focus();};
  this.button.onpointerenter=e=>{if(e.pointerType!=='touch')this.show(true);};root.onpointerleave=()=>this.show(false);this.button.onfocus=()=>{if(this.button.matches(':focus-visible'))this.show(true);};root.onfocusout=e=>{if(!root.contains(e.relatedTarget))this.show(false);};
  root.onkeydown=e=>{if(e.key==='Escape'&&!this.popover.hidden){e.preventDefault();e.stopPropagation();this.show(false);}};
  document.addEventListener('pointerdown',e=>{if(!root.contains(e.target))this.show(false);});
  const anchor=root.parentElement.querySelector('.tool');this.resize=new ResizeObserver(()=>{root.style.setProperty('--credit-tool-height',anchor.offsetHeight+'px');this.paint(this.display??this.last??0);});this.resize.observe(anchor);
 }
 noteReward(receipt){if(receipt?.milestone>0)this.milestone=receipt.milestoneName;}
 motionReduced(){return this.reduced()||matchMedia('(prefers-reduced-motion: reduce)').matches;}
 show(open){if(this.root.hidden)open=false;this.popover.hidden=!open;this.button.setAttribute('aria-expanded',String(open));}
 paint(value){this.display=Math.round(value);const compact=matchMedia('(max-width: 850px)').matches;this.label.textContent=compact?compactCredits(this.display):creditAmount(this.display);}
 sync(w,{visible=true}={}){
  const next=creditBalance(w);this.root.dataset.reduced=String(this.motionReduced());this.root.hidden=!visible;if(!visible)this.show(false);
  if(w!==this.world){this.world=w;this.last=next;this.pending=null;this.milestone=null;this.stop();this.paint(next);this.gain.hidden=true;this.root.classList.remove('credit-earned','credit-milestone');}
  else if(next!==this.last){if(next>this.last)this.pending={from:this.pending?.from??this.display??this.last,to:next};else{this.stop();this.pending=null;this.milestone=null;this.paint(next);}this.last=next;}
  const exact=creditAmount(next),available=this.shopAvailable(),accessible='KESTREL Credits. Balance: '+exact+(this.openShop?available?'. Open Shop & Cosmetics.':'. Shop available after completing the Engine Room.':'');this.root.querySelector('[data-credit-help]').textContent=this.openShop?(available?'Earned by repairing ship systems. Select to open Shop & Cosmetics.':'Earned by repairing ship systems. Shop available after completing the Engine Room.'):'Earned by repairing ship systems.';
  if(this.openShop&&available)this.button.setAttribute('aria-haspopup','dialog');else this.button.removeAttribute('aria-haspopup');
  if(this.button.getAttribute('aria-label')!==accessible){this.button.setAttribute('aria-label',accessible);this.root.querySelector('[data-credit-exact]').textContent=exact;}
  if(visible&&this.pending&&!this.startFrame)this.startFrame=requestAnimationFrame(()=>{this.startFrame=null;if(this.root.hidden||this.root.closest('.hud')?.inert)return;const change=this.pending;if(change){this.pending=null;this.animate(change.from,change.to);}});
 }
 animate(from,to){
  this.stop();this.gain.textContent='+'+creditAmount(to-from);if(this.milestone){const label=document.createElement('small');label.textContent=this.milestone;this.gain.append(label);}this.root.classList.toggle('credit-milestone',!!this.milestone);this.milestone=null;this.gain.hidden=false;this.root.classList.add('credit-earned');this.effect();
  const finish=()=>{this.paint(to);this.announcement.textContent='KESTREL Credits balance: '+creditAmount(to);this.timer=setTimeout(()=>{this.gain.hidden=true;this.root.classList.remove('credit-earned','credit-milestone');},900);};
  if(this.motionReduced()){finish();return;}const start=performance.now();const tick=now=>{const t=Math.min(1,(now-start)/600);this.paint(from+(to-from)*(1-(1-t)**3));if(t<1)this.frame=requestAnimationFrame(tick);else{this.frame=null;finish();}};this.frame=requestAnimationFrame(tick);
 }
 stop(){if(this.startFrame)cancelAnimationFrame(this.startFrame);this.startFrame=null;if(this.frame)cancelAnimationFrame(this.frame);clearTimeout(this.timer);this.frame=null;this.gain.hidden=true;this.root.classList.remove('credit-earned','credit-milestone');}
}
