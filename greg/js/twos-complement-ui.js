import {DataConsoleUI} from './data-console-ui.js';
import {conversationMarkup} from './dialogue-presentation.js';
import {CONVERTER_SAMPLES,CONVERTER_DIALOGUE,converterSigned} from './twos-complement.js';
import {consoleCreditPreview} from './credit-visual.js';
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const binary=n=>n.toString(2).padStart(4,'0'),number=n=>String(n).replace('-','−');
const button=(action,label,disabled=false)=>`<button class="brass-button" data-converter="${action}" ${disabled?'disabled':''}>${label}</button>`;
/** The standard equipment-panel lifecycle and authoritative Test/Engage capabilities. */
export class TwosComplementUI extends DataConsoleUI{
 mount(){if(this.graph().configuration.step==='complete'&&!this.getWorld().machines[this.id].certified)this.result=this.test();super.mount();this.host.querySelector('.converter-dialog [data-converter="continue"]')?.focus({preventScroll:true});}
 render(){
  if(!this.active)return;
  const c=this.graph().configuration,n=CONVERTER_SAMPLES[c.stage],installed=this.getWorld().machines[this.id].certified,dialogue=CONVERTER_DIALOGUE[c.step],result=this.result;
  const step=['intro0','intro1','intro2','invert'].includes(c.step)?'1 · INVERT ALL FOUR BITS':['inverted','add'].includes(c.step)?'2 · ADD 1':'3 · VERIFY THE SIGNED RESULT';
  const equation=c.step==='invert'||c.step.startsWith('intro')?`+${n} = ${binary(n)}`:['inverted','add'].includes(c.step)?`${binary(n)} → ${binary(c.bits)}`:`${binary(n^15)} + 0001 = ${binary(c.bits)}`;
  const popup=result?`<section class="console-result converter-result" role="dialog" aria-modal="true" aria-label="Converter verification"><h3>${result.pass?'CONVERTER VERIFIED':'VERIFICATION FAILED'}</h3><p>${result.rows?.filter(r=>r.pass).length||0} / 3 CONVERSIONS PASSED</p><p>${esc(result.pass?'All three negations are correct. Engage the system to commit this lesson.':result.error||'Complete the physical conversions.')}</p>${result.pass&&!installed?consoleCreditPreview(this.getWorld(),this.id):''}<div class="window-actions">${result.pass&&!installed?button('engage','ENGAGE SYSTEM &amp; EXIT'):''}${button('review','REVIEW CONVERTER')}</div></section>`:'';
  this.host.innerHTML=`<section class="data-console converter-console" role="dialog" aria-modal="true" aria-label="Two's Complement Converter"><header class="console-title"><button class="console-close" data-converter="close" aria-label="Close converter">×</button><h2>Two's Complement Converter</h2><span class="system-status">P18 · ${installed?'CALIBRATED':['GUIDED EXAMPLE','INDEPENDENT CONVERSION','FINAL CHECK'][c.stage]}</span></header><main class="converter-machinery" ${dialogue||result?'inert aria-hidden="true"':''}><p class="converter-task">${installed?'NEGATION CALIBRATED':`CONVERT +${n} TO ${number(-n)} USING TWO'S COMPLEMENT.`}</p><div class="converter-register" aria-label="Four-bit register">${[...binary(c.bits)].map((bit,i)=>`<span><small>b${3-i}</small><strong data-converter-bit>${bit}</strong></span>`).join('')}</div><p class="converter-equation" data-converter-equation>${equation}</p><div class="converter-output"><small>SIGNED RESULT</small><strong data-converter-value>${number(converterSigned(c.bits))}</strong><span>4 BITS · RANGE −8 TO +7</span></div><p class="converter-step" role="status">${installed?'SYSTEM ENGAGED':c.step==='complete'?'ALL CONVERSIONS VERIFIED':step}</p><div class="converter-controls">${button('invert','INVERT BITS',installed||c.step!=='invert')}${button('add','ADD 1',installed||c.step!=='add')}${button('verify','VERIFY RESULT',installed||!['verify','complete'].includes(c.step))}</div><p class="converter-feedback" role="status">${esc(this.message||'Negate the value: invert every bit, then add 1. Keep only four bits.')}</p></main>${dialogue?`<div class="converter-dialog-backdrop"><section class="paper-window centered-conversation converter-dialog" role="dialog" aria-modal="true" aria-labelledby="converter-speaker"><button class="close-window" data-converter="close" aria-label="Close converter">×</button><div class="kicker">KESTREL / ARITHMETIC</div><h2 id="converter-speaker">G.R.E.G.</h2>${conversationMarkup('G.R.E.G.',dialogue)}<div class="window-actions">${button('continue','CONTINUE')}</div></section></div>`:''}${popup}</section>`;
  this.host.onclick=e=>{const b=e.target.closest('[data-converter]');if(b&&!b.disabled){e.stopPropagation();if(e.detail>1)return;this.action(b.dataset.converter);}};
  this.host.onkeydown=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();this.close();}if(e.repeat&&['Enter',' '].includes(e.key)){e.preventDefault();e.stopPropagation();}if(e.key==='Tab'){const root=this.host.querySelector('.converter-dialog,.converter-result')||this.host,items=[...root.querySelectorAll('button:not(:disabled)')].filter(b=>!b.closest('[inert]')),i=items.indexOf(document.activeElement);if(e.shiftKey&&i<=0||!e.shiftKey&&i===items.length-1){e.preventDefault();items[e.shiftKey?items.length-1:0]?.focus();}}};
  this.host.querySelector(dialogue?'[data-converter="continue"]':result?'.converter-result button':`[data-converter="${c.step==='invert'?'invert':c.step==='add'?'add':'verify'}"]:not(:disabled),.console-close`)?.focus({preventScroll:true});
 }
 action(action){
  if(!this.active)return;
  if(action==='close'){this.close();return;}
  if(action==='review'){this.result=null;this.render();return;}
  if(action==='engage'){
   const r=this.engage(this.result?.validationId);if(r.ok&&r.applied){this.persist();this.applied(r);return;}this.message=r.error;this.result=null;this.render();return;
  }
  if(action==='verify'&&this.graph().configuration.step==='complete'){this.result=this.test();this.persist();this.render();return;}
  const r=this.control(action);if(!r.ok){this.message=r.error;this.effect('S08');this.render();return;}
  this.message=null;this.persist();this.effect(action==='verify'?'S07':'S05');
  if(this.graph().configuration.step==='complete'){this.result=this.test();this.persist();if(this.result.pass)this.effect('S13');}
  this.render();
 }
}
