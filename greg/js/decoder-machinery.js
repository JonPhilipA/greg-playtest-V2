import {binaryInputMarkup} from './binary-hardware.js';
import {DEFAULT_PANEL_ART,glassConduit} from './panel-art.js';
import {interpretationSelector} from './interpretation-selector.js';
export const decoderEscape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function decoderRegister({bits,count=8,mode='unsigned',weightsVisible=true,flash=false,interactive=false,art=DEFAULT_PANEL_ART}){
 let columns='';
 for(let i=0;i<count;i++){
  const bit=count-1-i,weight=2**bit,value=Number(!!(bits&weight)),contribution=i===0&&mode==='signed'?-weight:weight;
  const a={x:190,y:75.5},b={x:102,y:140},path=`M${a.x},${a.y} C212,${a.y} 212,125 ${b.x},${b.y}`;
  const label=(i===0&&contribution>0?'+':'')+String(contribution).replace('-','−');
  columns+=`<div class="p11-bit-column" data-register-column="${bit}" data-weight="${weight}"><span class="p11-bit-position">b${bit}</span>${weightsVisible?`<span class="p11-bit-weight ${value?'contributes':''} ${i===0&&flash?'weight-changed':''}" ${count===8?`data-register-weight="${bit}"`:`data-weight-label="${weight}"`}>${count===4?'WEIGHT ':''}${label}</span>`:'<span aria-hidden="true"></span>'}<svg class="board p11-bit-hardware" viewBox="0 0 204 148" ${interactive?'':'aria-hidden="true"'}><path class="p11-register-bus" d="M0 140H204"/><g class="signal-${value?'high':'low'}" ${count===8?`data-p11-signal="${bit}"`:`data-fixed-signal="${weight}"`} data-signal="${value}">${glassConduit(path,a,b,{high:!!value,color:mode==='signed'?'#339bc2':'#d3a246'})}</g><g class="p11-bit-module" transform="translate(14 4)" data-register-bit="${bit}">${binaryInputMarkup({id:count===8?'sensor-bit-'+bit:'binary-'+weight,label:'BIT '+bit,value,key:count===8?'sensor-'+bit:weight},art)}</g></svg></div>`;
 }
 return `<div class="p11-register-board" style="--register-columns:${count}" data-bit-count="${count}" role="group" aria-label="${interactive?'Interactive':'Fixed'} ${count}-bit register ${bits.toString(2).padStart(count,'0')}">${columns}</div>`;
}
export function decoderReadout({title,value,unit='',details='',status='AWAITING VERIFICATION',verified=false,equipmentArt='',valueAttribute='data-decoded-value',titleTag='small'}){
 const esc=decoderEscape;
 return `<section class="p11-equipment-output ${verified?'reading-verified':''}">${equipmentArt?`<div class="p11-equipment-icon">${equipmentArt}</div>`:''}<div class="numeric-display" aria-live="polite"><${titleTag} class="decoder-equipment-title">${esc(title)}</${titleTag}><div><strong ${valueAttribute}>${esc(value)}</strong>${unit?`<span>${esc(unit)}</span>`:''}</div></div>${details}<p class="p11-reading-status" role="status"><i aria-hidden="true"></i>${esc(status)}</p></section>`;
}
export function decoderAssembly({mode,scope,locked=false,output}){
 return `<div class="p11-decoder-stage"><svg class="p11-machine-connections" viewBox="0 0 1000 350" preserveAspectRatio="none" aria-hidden="true"><path d="M500 0V22H190V175H900" stroke="#0b1724" stroke-width="12" fill="none"/><path d="M500 0V22H190V175H900" stroke="#ba985d" stroke-width="7" fill="none"/><path d="M499 0V21H190V174H900" stroke="#f4d296" stroke-width="2" fill="none"/></svg>${interpretationSelector({mode,scope,locked,orientation:'vertical'})}${output}</div>`;
}
export function decoderRegisterHeading({binary,title='RAW SENSOR DATA',caption='8-BIT REGISTER · READ ONLY',tutorial=false}){
 return `<div class="p11-register-heading"><strong>${decoderEscape(title)}</strong><div class="binary-byte" ${tutorial?'data-binary-pattern':''} aria-label="Raw bits ${binary}">${[...binary].map(bit=>`<span><b>${bit}</b></span>`).join('')}</div><small>${decoderEscape(caption)}</small></div>`;
}
export function decoderGuidance({objective,message,status='',reaction='idle',tutorial=false}){
 return `<footer class="console-footer p11-guidance"><div class="console-progress puzzle-console-brief" role="status" aria-live="polite"><strong class="puzzle-objective" data-puzzle-objective>${decoderEscape(objective)}</strong><span>${decoderEscape(status)}</span></div><div class="binary-greg-status" data-reaction="${reaction}"><img src="./assets/sprites/greg-terminal.svg" alt="G.R.E.G."><p class="binary-feedback" data-puzzle-problem aria-live="polite"><strong>G.R.E.G.</strong> <span ${tutorial?'data-binary-dialogue':''}>${decoderEscape(message)}</span></p></div></footer>`;
}
