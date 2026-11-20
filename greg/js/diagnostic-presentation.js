import {completionEmblem} from './completion-visual.js';
import {rewardBreakdown} from './credit-visual.js';
import {puzzleFailure} from './puzzle-explanations.js';
import {diagnosticTiming,diagnosticTransitionMs} from './diagnostic-session.js';
const esc=s=>String(s??'—').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fields=values=>Object.entries(values||{}).map(([id,value])=>`${esc(id)} = ${esc(value)}`).join(' · ');
/** Presentation consumes the complete authoritative Test snapshot. Only onEngage may request Apply. */
export class DiagnosticPresentation{
 constructor(host,{developerInfo=false,effect=()=>false,reduced=()=>false,onMount=()=>{},onFrame=()=>{},onClose=()=>{},onExit=onClose,onResult=()=>{},onEngage=null,onExplain=null,schedule=(fn,ms)=>globalThis.setTimeout(fn,ms),unschedule=id=>globalThis.clearTimeout(id)}={}){
  Object.assign(this,{host,developerInfo,effect,reduced,onMount,onFrame,onClose,onExit,onResult,onEngage,onExplain,schedule,unschedule});this.active=false;this.timers=[];this.sounds=[];
 }
 sound(id,options){try{const voice=this.effect(id,options);if(voice?.stop)this.sounds.push(voice);return voice;}catch{return false;}}
 later(fn,ms){try{this.timers.push(this.schedule(()=>{if(this.active)try{fn();}catch{this.finish(true);}},ms));}catch{this.schedulerFailed=true;this.complete?this.showResults():this.finish(true);}}
 start(model,outcome){
  this.dispose(false);Object.assign(this,{model,outcome,active:true,complete:false,resultsVisible:false,reviewing:false,full:false,resultSent:false,schedulerFailed:false,failed:false,buzzed:false,rowSound:null,finalSound:null,current:-1,engaging:false,engaged:false});this.revealed=new Set();this.timing=diagnosticTiming(model.frames.length,{puzzleId:model.puzzleId});
  this.previousFocus=this.host.ownerDocument.activeElement;this.host.classList.add('diagnostic-modal');this.host.hidden=false;
  this.host.innerHTML=`<section class="verification-window" ${this.developerInfo?'aria-description="Actual evaluator results · no simulated propagation delay"':''} data-verification-window role="dialog" aria-modal="true" aria-label="Circuit verification"><header><div><small>KESTREL / CIRCUIT VERIFICATION</small><h3>${esc(model.title)}</h3>${model.objective?'<p class="verification-objective" data-puzzle-objective>OBJECTIVE: '+esc(model.objective)+'</p>':''}</div><button class="diagnostic-close" data-diagnostic="close" aria-label="Close diagnostic">×</button></header><div data-verification-progress></div><div class="verification-circuit"><svg id="diagnostic-board" class="board" data-verification-board role="img" aria-label="Read-only preview of your constructed circuit"></svg></div><div class="verification-summary" data-verification-summary hidden></div></section>`;
  this.slots={window:this.host.querySelector('[data-verification-window]'),progress:this.host.querySelector('[data-verification-progress]'),summary:this.host.querySelector('[data-verification-summary]')};this.render();
  try{this.unmount=this.onMount(this.host.querySelector('[data-verification-board]'),model);}catch{this.finish(true);}
  this.host.onclick=e=>{const action=e.target.closest('[data-diagnostic]')?.dataset.diagnostic;if(action==='skip')this.skip();else if(action==='close')this.close();else if(action==='exit')this.exit();else if(action==='engage')this.engage();else if(action==='review')this.reviewFailure();else if(action==='explain')this.onExplain?.();else if(action==='inspect'){this.full=!this.full;this.render();this.host.querySelector('[data-diagnostic="inspect"]')?.focus({preventScroll:true});}};
  this.host.onkeydown=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();this.close();}if(e.key==='Tab'){const buttons=[...(this.host.querySelectorAll?.('button:not([hidden]):not(:disabled)')||[])].filter(b=>b.getClientRects?b.getClientRects().length:!b.hidden),index=buttons.indexOf(this.host.ownerDocument.activeElement);if(buttons.length&&((e.shiftKey&&index<=0)||(!e.shiftKey&&index===buttons.length-1))){e.preventDefault();buttons[e.shiftKey?buttons.length-1:0].focus();}e.stopPropagation();}if(e.repeat&&['Enter',' '].includes(e.key))e.preventDefault();};
  this.host.querySelector('[data-diagnostic="skip"]')?.focus();this.sound('S06');
  for(let i=0;i<model.frames.length&&!this.complete;i++)this.later(()=>this.showFrame(i),this.timing.initialize+this.timing.starts[i]);
  if(!this.complete)this.later(()=>this.finish(),this.timing.initialize+this.timing.scan);
 }
 showFrame(index){
  const frame=this.model.frames[index];if(!frame||this.complete)return;this.current=frame.index;this.revealed.add(frame.index);
  const intervalMs=this.timing.durations[index],transitionMs=diagnosticTransitionMs(intervalMs,this.reduced());
  try{this.onFrame({...frame,intervalMs,transitionMs,reducedMotion:this.reduced()});}catch{}
  // DOM values and progress must be current before the matching sound starts.
  this.render();this.rowSound?.stop?.();this.rowSound=null;
  if(!frame.pass)this.failed=true;
  const audio=()=>{if(this.complete||this.current!==frame.index)return;if(!frame.pass){if(!this.buzzed){this.sound('S08',{diagnostic:'failure'});this.buzzed=true;}}else if(!this.failed)this.rowSound=this.sound('S07',{diagnostic:'row',index,count:this.model.frames.length,intervalMs});};
  if(transitionMs)this.later(audio,transitionMs);else audio();
 }
 firstFailure(){const index=this.model.rows.findIndex(row=>!row.pass);return index<0?null:{index,row:this.model.rows[index]};}
 progress(){
  const m=this.model,f=this.firstFailure(),shown=this.current>=0?m.rows[this.current]:null,count=this.current<0?0:m.frames.findIndex(frame=>frame.index===this.current)+1;
  return `<section class="diagnostic-progress ${this.complete?(m.pass?'verified':'failed'):''}" aria-label="Circuit verification progress"><div class="diagnostic-progress-copy" role="status" aria-live="polite">${this.reviewing&&f?`<strong>FAILED TEST · ${fields(f.row.inputs)}</strong><span>Expected ${fields(f.row.expected)} · Actual ${fields(f.row.actual)}</span>`:`<strong>${this.complete?(m.pass?'CIRCUIT VERIFIED':'VERIFICATION FAILED'):'VERIFYING CIRCUIT'} · ${this.complete?m.frames.length:count} / ${m.frames.length}</strong><span>${m.representative?`${m.total} required cases evaluated · representative sweep`:shown?fields(shown.inputs)+' → '+fields(shown.actual):'Watch the input switches and output indicators'}</span>`}</div><div class="diagnostic-beads" aria-hidden="true">${m.frames.map((frame,i)=>{const shown=this.complete||this.revealed.has(frame.index);return `<span data-progress-case="${frame.index}" class="${shown?(frame.pass?'pass':'fail'):'pending'} ${this.current===frame.index?'current':''}">${i+1}</span>`;}).join('')}</div><button class="brass-button subtle" data-diagnostic="${this.reviewing?'close':'skip'}">${this.reviewing?'RETURN TO CIRCUIT':'Skip animation'}</button></section>`;
 }
 table(){const m=this.model;return `<div class="diagnostic-table-wrap"><table><thead><tr>${m.sequential?'<th>EVENT</th>':''}${m.inputs.map(n=>'<th>'+esc(n.label)+'</th>').join('')}${m.outputs.map(n=>'<th>'+esc(n.label)+'<br>EXPECTED / ACTUAL</th>').join('')}<th>STATUS</th></tr></thead><tbody>${m.rows.map((row,i)=>`<tr data-diagnostic-row="${i}" class="${row.pass?'pass':'fail'}" aria-label="Test ${i+1}: ${row.pass?'PASS':'FAIL'}">${m.sequential?'<td>'+esc(row.label||'')+'</td>':''}${m.inputs.map(n=>'<td>'+esc(row.inputs[n.id])+'</td>').join('')}${m.outputs.map(n=>'<td><span class="expected">'+esc(row.expected[n.id])+'</span> / <b class="actual">'+esc(row.actual[n.id])+'</b></td>').join('')}<td>${row.pass?'✓ PASS':'✕ FAIL'}</td></tr>`).join('')}</tbody></table></div>`;}
 emblem(){return completionEmblem();}
 rewards(){return this.model.pass&&this.outcome.kind==='verified'?rewardBreakdown(this.model.rewardPreview):'';}
 render(){
  const focused=this.host.ownerDocument.activeElement?.dataset?.diagnostic;
  this.slots.window.classList.toggle('is-results',this.resultsVisible);this.slots.window.classList.toggle('is-complete',this.complete&&this.model.pass);this.slots.window.classList.toggle('is-reduced',this.reduced());this.slots.window.dataset.phase=this.resultsVisible?'results':this.reviewing?'review':'testing';
  this.slots.progress.hidden=this.resultsVisible;this.slots.summary.hidden=!this.resultsVisible;this.slots.progress.innerHTML=this.resultsVisible?'':this.progress();
  this.host.querySelector('.verification-window>header .diagnostic-close').hidden=this.resultsVisible;
  if(!this.resultsVisible){this.slots.summary.innerHTML='';if(focused)this.host.querySelector('[data-diagnostic="'+focused+'"]')?.focus({preventScroll:true});return;}
  const m=this.model,f=this.firstFailure(),engage=m.pass&&this.outcome.kind==='verified'&&this.onEngage,title=m.pass?'ALL TESTS PASSED!':'CIRCUIT TEST FAILED';
  this.slots.window.classList.toggle('truth-table-open',this.full);
  if(this.full){this.slots.summary.innerHTML=`<section class="verification-truth-view" role="region" aria-label="Evaluated truth table" data-popup-pagination="none"><header><div><small>ACTUAL EVALUATOR RESULTS</small><h3>TRUTH TABLE</h3><p>${m.passed} / ${m.total} TESTS PASSED · ${m.failed} FAILED</p></div><button class="completion-close" data-diagnostic="close" aria-label="Return to circuit">×</button></header>${this.table()}<div class="diagnostic-controls"><button class="brass-button" data-diagnostic="inspect">BACK TO RESULTS</button><button class="brass-button subtle" data-diagnostic="close">RETURN TO CIRCUIT</button></div></section>`;return;}
  const detail=engage?'Engage the system to apply this repair.':this.outcome.detail;
  this.slots.summary.innerHTML=`<section class="verification-result-copy completion-card ${m.pass?'completion-success':'completion-failure'}" role="region" aria-label="${m.pass?'Successful circuit verification':'Failed circuit verification'}" data-popup-kind="verification-results" data-popup-pagination="none" data-result="${m.pass?'pass':'fail'}"><button class="completion-close" data-diagnostic="close" aria-label="Return to circuit">×</button><small class="verification-status-label"><i aria-hidden="true"></i>KESTREL / ENGINEERING DIAGNOSTIC</small><h3 aria-live="polite">${title}</h3>${m.pass?this.emblem():'<div class="failure-indicator" aria-hidden="true">⚠</div>'}<h4 class="completion-puzzle">${esc(m.title)}</h4><p class="verification-score">${m.passed} / ${m.total} TESTS PASSED</p>${!m.pass?`<p class="verification-failed-count">${m.partial?"VALIDATION INCOMPLETE":m.failed+" TEST"+(m.failed===1?'':'S')+' FAILED'}</p>`:''}${m.partial?'<p class="diagnostic-note">Partial observations only. Authoritative validation rejected this circuit.</p>':''}${!m.pass&&f?`<div class="verification-failure"><strong>FAILED INPUT</strong><p class="verification-failed-input">${fields(f.row.inputs)}</p><dl><dt>EXPECTED OUTPUT</dt><dd>${fields(f.row.expected)}</dd><dt>ACTUAL OUTPUT</dt><dd>${fields(f.row.actual)}</dd></dl><p class="behavior-mismatch">${esc(puzzleFailure(m.puzzleId,f.row))}</p></div>`:''}${this.rewards()}${detail?`<p class="diagnostic-outcome ${this.outcome.kind}">${this.outcome.kind==='blocked'?'<strong>ENGAGEMENT BLOCKED · </strong>':''}${esc(detail)}</p>`:''}${m.error&&!f?'<p class="diagnostic-note">'+esc(m.error)+'</p>':''}${m.comparison?'<p class="diagnostic-note">Original: '+esc(m.comparison.original)+' · Replacement: '+esc(m.comparison.replacement)+'</p>':''}<div class="diagnostic-controls">${engage?`<button class="brass-button verification-engage" data-diagnostic="engage">${m.puzzleId==='ripple_adder'&&m.graph.configuration?.rippleStage===2?'EXPAND TO FOUR ADDERS':'ENGAGE SYSTEM'}</button>`:''}<button class="brass-button ${engage?'subtle':''}" data-diagnostic="inspect">VIEW TRUTH TABLE</button>${!m.pass||!engage?'<button class="brass-button subtle" data-diagnostic="close">RETURN TO CIRCUIT</button>':''}</div></section>`;
 }
 finish(immediate=false){
  if(!this.active||this.complete)return;this.clearTimers();this.rowSound?.stop?.();this.rowSound=null;this.complete=true;const last=this.model.frames.at(-1);
  if(last&&this.current!==last.index)try{this.onFrame({...last,intervalMs:100,transitionMs:0,reducedMotion:true});}catch{}this.current=last?.index??-1;this.render();
  if(!this.resultSent){this.resultSent=true;if(this.model.pass&&!this.failed)this.finalSound=this.sound('S07',{diagnostic:'success'});else if(!this.buzzed){this.sound('S08',{diagnostic:'failure'});this.failed=true;this.buzzed=true;}try{this.onResult(this.outcome);}catch{}}
  if(immediate||this.schedulerFailed)this.showResults();else this.later(()=>this.showResults(),this.timing.glow);
 }
 showResults(){if(!this.active)return;this.resultsVisible=true;this.render();this.host.querySelector(this.model.pass&&this.outcome.kind==='verified'&&this.onEngage?'[data-diagnostic="engage"]':'[data-diagnostic="inspect"]')?.focus({preventScroll:true});}
 engage(){
  if(!this.active||!this.complete||this.engaging||this.engaged||!this.model.pass||!this.onEngage||this.outcome.kind!=='verified')return;this.engaging=true;const button=this.host.querySelector('[data-diagnostic="engage"]');if(button)button.disabled=true;
  try{const outcome=this.onEngage();if(outcome)this.outcome=outcome;this.engaged=this.outcome.success;this.exit();}finally{this.engaging=false;}
 }
 reviewFailure(){const f=this.firstFailure(),frame=f&&this.model.frames.find(frame=>frame.index===f.index);if(!this.complete||!frame)return;this.reviewing=true;this.resultsVisible=false;this.current=frame.index;try{this.onFrame({...frame,intervalMs:160,transitionMs:0,reducedMotion:true});}catch{}this.render();this.host.querySelector('[data-diagnostic="close"]')?.focus();}
 clearTimers(){for(const timer of this.timers)try{this.unschedule(timer);}catch{}this.timers=[];}
 skip(){if(this.complete)return;this.clearTimers();this.finish();}
 close(){if(!this.active)return;this.dispose();}
 exit(){if(!this.active)return;this.dispose(false);this.onExit(this.outcome);}
 dispose(notify=true){
  const active=this.active;this.active=false;this.clearTimers();for(const sound of this.sounds)if(sound!==this.finalSound||!this.complete||this.failed)try{sound.stop();}catch{}this.sounds=[];
  this.host.closest('.workbench-main')?.classList.remove('diagnostic-open');try{this.unmount?.();}catch{}this.unmount=null;this.slots=null;this.host.classList.remove('diagnostic-modal','diagnostic-dock','diagnostic-expanded','diagnostic-results');this.host.hidden=false;this.host.innerHTML='';this.host.onclick=null;this.host.onkeydown=null;
  if(active&&notify){this.onClose(this.outcome);try{this.previousFocus?.isConnected&&this.previousFocus.focus({preventScroll:true});}catch{}}
 }
}
