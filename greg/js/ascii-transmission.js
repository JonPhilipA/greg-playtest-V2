import {galleryEnabled,splitGallery} from './curriculum-profile.js';
export const ASCII_TERMINATOR="That last byte isn't another letter. It's the null terminator. It tells the computer where the string ends.";
export function validateAsciiActivity(a){if(!a||a.version!==1||![0,1,2].includes(a.stage)||a.complete!==(a.stage===2))throw Error('Invalid ASCII activity checkpoint.');return a;}
export function asciiCommand(w,c){
 if(!galleryEnabled(w)||w.room!==(splitGallery(w)?'blackbox':'sensors')||!w.machines.pressure_width?.certified)throw Error('Use the Vault transmission terminal after the Pressure Register.');
 const a=validateAsciiActivity(w.foundation.curriculum.asciiActivity);
 if(a.complete)return {duplicate:true,complete:true};
 if(c.action==='decode'){
  if(a.stage!==0)throw Error('Identify the final terminator byte next.');
  if(typeof c.answer!=='string'||c.answer.trim().toUpperCase()!=='OK')return {correct:false,message:'Use the reference: O is 01001111; K is 01001011.'};
  a.stage=1;return {correct:true,stage:1};
 }
 if(c.action==='terminator'){
  if(a.stage!==1)throw Error('Decode the two character bytes first.');
  if(c.index!==2)return {correct:false,message:'A null terminator has value zero. Select the all-zero byte.'};
  a.stage=2;a.complete=true;w.foundation.curriculum.concepts['ascii.transmission']=true;return {correct:true,complete:true};
 }
 throw Error('Unknown ASCII terminal control.');
}
/** Compact equipment UI; practice has no world writes, inventory or Credits path. */
export class AsciiTransmissionUI{
 constructor(host,{getWorld,send,persist,close}){Object.assign(this,{host,getWorld,send,persist,close});this.practice=getWorld().foundation.curriculum.asciiActivity.complete;this.stage=this.practice?0:getWorld().foundation.curriculum.asciiActivity.stage;this.message='';}
 mount(){this.render();this.host.onclick=e=>{const b=e.target.closest('[data-ascii]');if(!b)return;const action=b.dataset.ascii;if(action==='close')return this.close();if(action==='practice'){this.stage=0;this.practice=true;this.message='';return this.render();}const answer=this.host.querySelector('[data-ascii-answer]')?.value;let r;
  if(this.practice){r=action==='decode'?{correct:answer?.trim().toUpperCase()==='OK'}:{correct:Number(b.dataset.index)===2};if(r.correct)this.stage++;else r.message=action==='decode'?'Compare the bytes with the compact reference.':'Select the zero byte.';}
  else{r=this.send({type:'ASCII_CONTROL',action,answer,index:Number(b.dataset.index)});if(r.ok){this.stage=this.getWorld().foundation.curriculum.asciiActivity.stage;this.persist();}}
  this.message=r.error||r.message||'';this.render();};this.host.onkeydown=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();this.close();}};this.host.querySelector('input,button')?.focus();}
 render(){this.host.hidden=false;this.host.innerHTML=`<section class="ascii-terminal" role="dialog" aria-modal="true" aria-label="ASCII Transmission Terminal"><header><div><small>KESTREL / FLIGHT RECORDER · ${this.practice?'PRACTICE':'UNNUMBERED ACTIVITY'}</small><h2>ASCII TRANSMISSION TERMINAL</h2></div><button class="brass-button subtle" data-ascii="close" aria-label="Close ASCII terminal">×</button></header>${this.stage===2?'<div class="ascii-screen"><h3>TRANSMISSION DECODED</h3><strong>OK</strong><p>Two character bytes, followed by a null byte that ends the string.</p></div><p>Reference saved in the Engineering Manual. Next: P14 Navigation Log Overflow.</p><button class="brass-button" data-ascii="close">CLOSE TERMINAL</button> <button class="brass-button subtle" data-ascii="practice">PRACTICE AGAIN</button>':`<p class="ascii-greg"><strong>G.R.E.G.</strong> ${this.stage===0?'Each eight-bit value can represent a character. ASCII maps binary values to characters; use the reference to read these two bytes.':ASCII_TERMINATOR}</p><div class="ascii-screen"><small>${this.stage===0?'RECEIVED CHARACTER BYTES':'SELECT THE STRING TERMINATOR'}</small><div class="ascii-bytes">${['01001111','01001011',...(this.stage===1?['00000000']:[])].map((v,i)=>this.stage===1?'<button class="brass-button subtle" data-ascii="terminator" data-index="'+i+'" aria-label="Select byte '+i+': '+v+'">'+v+'</button>':'<span>'+v+'</span>').join('')}</div></div><aside class="ascii-reference">COMPACT ASCII REFERENCE<br><b>01001111 = O · 79</b><b>01001011 = K · 75</b><b>00000000 = NUL · 0</b><small>Printable “0” is 00110000 (48), a different value.</small></aside>${this.stage===0?'<label>Decoded message <input data-ascii-answer maxlength="2" autocomplete="off" aria-label="Decoded ASCII message"></label> <button class="brass-button" data-ascii="decode">DECODE MESSAGE</button>':''}`}<p role="status">${this.message}</p></section>`;}
 dispose(){this.host.onclick=null;this.host.onkeydown=null;}
}
