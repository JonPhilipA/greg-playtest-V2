import {mechanicalToggle,TOGGLE_COLORS} from './mechanical-toggle.js';
import {glassConduit} from './panel-art.js';
import {pressureReading} from './data-consoles.js';
import {completionEmblem} from './completion-visual.js';
import {consoleCreditPreview} from './credit-visual.js';
const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');

const widthLabel=width=>width+' '+(width===1?'BIT':'BITS');
const binaryPattern=stored=>stored.toString(2).padStart(16,'0');
const sensorNeedle=pressure=>'rotate('+(-128+pressure/300*256)+' 26 26)';
const lossMessage='DATA LOST · current reading truncated';

function pressureSlider({action,id,label,value,min,max,unit,readout,disabled}) {
 const mark=n=>action==='width'?widthLabel(n):n+' '+unit;
 const current=mark(value);
 return `<section class="pressure-control pressure-${action}-control">
   <label for="${id}">${label}</label><output ${readout} for="${id}">${current}</output>
   <div class="pressure-range"><span>${mark(min)}</span><input id="${id}" data-console="${action}" type="range" min="${min}" max="${max}" step="1" value="${value}" aria-valuetext="${current}" ${disabled?'disabled':''}><span>${mark(max)}</span></div>
 </section>`;
}

function pressureSensor(pressure) {
 return `<div class="pressure-sensor">
   <svg viewBox="0 0 52 52" aria-hidden="true">
     <circle cx="26" cy="26" r="24" fill="#171f2a" stroke="#c39d60" stroke-width="3"/>
     <circle cx="26" cy="26" r="19" fill="#dbc59d" stroke="#917342" stroke-width="2"/>
     <path d="M15 34l-3 2m0-10H9m6-8-3-2m9-3-1-3m6 3V9m6 4 1-3m4 8 3-2m0 10h3m-6 8 3 2" fill="none" stroke="#4d4030" stroke-width="1.4" stroke-linecap="round"/>
     <path data-pressure-needle d="M26 27V15" transform="${sensorNeedle(pressure)}" stroke="#1d4a6a" stroke-width="2.6" stroke-linecap="round"/>
     <circle cx="26" cy="26" r="3" fill="#293b4a"/>
     <text x="26" y="39" text-anchor="middle" fill="#534330" font-size="7" font-weight="bold">kPa</text>
   </svg><strong>PRESSURE SENSOR</strong>
 </div>`;
}

// Non-interactive harnesses use the same layered leads as the circuit board.
function pressureLead(type,color) {
 return `<svg class="pressure-lead pressure-lead-${type}" viewBox="0 0 48 24" aria-hidden="true">
   ${glassConduit('M19 0v8q0 4 5 6t5 6v4',null,null,{color})}
 </svg>`;
}

/** Sensor-driven levers share a single housing. */
function indicator(bit,stored,width) {
 const enabled=bit<width,value=(stored>>bit)&1;
 return `<div class="memory-cell ${enabled?'enabled':'dormant'}${enabled&&value?' high':''}${bit===width-1?' first-active':''}" data-bit="${bit}" data-bit-value="${enabled?value:'inactive'}" role="img" aria-label="b${bit} · weight ${2**bit} · ${enabled?value:'disabled'}">
   <span class="pressure-bit-display" aria-hidden="true">${enabled?value:'—'}</span>
   <svg class="pressure-bit-toggle" viewBox="-2 -2 32 66" data-orientation="vertical" data-switch-value="${value}" aria-hidden="true">${mechanicalToggle(value,{orientation:'vertical',output:true,inactive:!enabled,pressure:true})}</svg>
   <b class="pressure-bit-label" aria-hidden="true">b${bit}</b><span class="pressure-bit-weight" aria-hidden="true">${(2**bit).toLocaleString('en-US')}</span>
 </div>`;
}

export function pressureRegisterMarkup(c,{pressure=300,locked=false,testing=false}={}) {
 const reading=pressureReading(pressure,c.width);
 const bits=Array.from({length:16},(_,i)=>indicator(15-i,reading.stored,c.width)).join('');
 return `${pressureSlider({action:'pressure',id:'pressure-sample',label:'Simulated pressure',value:pressure,min:0,max:300,unit:'kPa',readout:'data-pressure-readout',disabled:testing})}
 <div class="pressure-source">${pressureSensor(pressure)}${pressureLead('sensor','#bd914e')}</div>
 <section class="pressure-hardware">
   <div class="pressure-register-shell">
     <header class="pressure-hardware-label"><strong>Pressure register</strong><span data-active-bits>${c.width} active / 16 positions</span><small>Read-only bits</small></header>
     <div class="pressure-bit-bank" role="group" aria-label="Sixteen storage positions, b15 through b0">${bits}</div>
     <div class="pressure-binary"><span>Stored pattern</span> <code data-stored-binary>${binaryPattern(reading.stored)}</code></div>
   </div>
 </section>
 <section class="pressure-sample-readings${reading.overflow?' overflow':''}" aria-label="Compare pressure readings">
   ${pressureLead('output','#5c8ca9')}
   <div class="pressure-meter"><small>Sensor input</small><strong data-actual-pressure><b data-pressure-value>${pressure}</b> <span>kPa</span></strong></div>
   <div class="pressure-meter"><small>Stored value · output</small><strong data-stored-value>${reading.stored}</strong></div>
   <p data-storage-status role="status">${reading.overflow?lossMessage:''}</p>
 </section>
 ${pressureSlider({action:'width',id:'pressure-width',label:'Register width',value:c.width,min:1,max:16,readout:'data-width-readout',disabled:locked})}`;
}

/** Keep both sliders and all sixteen mechanisms mounted for real lever transitions. */
export function updatePressureRegister(root,c,{pressure}) {
 const reading=pressureReading(pressure,c.width);
 for(const cell of root.querySelectorAll('.memory-cell')){
   const bit=Number(cell.dataset.bit),enabled=bit<c.width,value=(reading.stored>>bit)&1;
   cell.classList.toggle('enabled',enabled);
   cell.classList.toggle('dormant',!enabled);
   cell.classList.toggle('high',enabled&&value===1);
   cell.classList.toggle('first-active',bit===c.width-1);
   cell.dataset.bitValue=enabled?value:'inactive';
   cell.setAttribute('aria-label','b'+bit+' · weight '+2**bit+' · '+(enabled?value:'disabled'));
   cell.querySelector('.pressure-bit-display').textContent=enabled?value:'—';
   cell.querySelector('.pressure-bit-toggle').dataset.switchValue=value;
   cell.querySelector('.toggle-track').setAttribute('fill',enabled?(value?TOGGLE_COLORS.outputOn:TOGGLE_COLORS.off):TOGGLE_COLORS.inactive);
   const lever=cell.querySelector('.switch-knob');
   lever.dataset.switchValue=value;
   lever.style.transform='translateX('+(32*value)+'px)';
 }
 root.querySelector('[data-pressure-value]').textContent=pressure;
 root.querySelector('[data-stored-value]').textContent=reading.stored;
 root.querySelector('[data-pressure-needle]').setAttribute('transform',sensorNeedle(pressure));
 root.querySelector('.pressure-sample-readings').classList.toggle('overflow',reading.overflow);
 const status=root.querySelector('[data-storage-status]'),message=reading.overflow?lossMessage:'';
 if(status.textContent!==message)status.textContent=message;
 root.querySelector('[data-active-bits]').textContent=c.width+' active / 16 positions';
 root.querySelector('[data-stored-binary]').textContent=binaryPattern(reading.stored);
 for(const [action,value,label] of [['width',c.width,widthLabel(c.width)],['pressure',pressure,pressure+' kPa']]){
   const slider=root.querySelector('input[data-console="'+action+'"]');
   slider.value=value;
   slider.setAttribute('aria-valuetext',label);
   root.querySelector('output[for="'+slider.id+'"]').textContent=label;
 }
}

/** Existing shared navy/brass completion composition; no reward or repair side effects. */
export function pressureCompletion(w,result){
 const pass=result.pass,failed=result.rows.find(r=>!r.pass),score=result.rows.filter(r=>r.pass).length;
 const detail=pass?'The smallest sufficient register preserves all required readings. Engage to apply this configuration.':result.error;
 return `<div class="verification-window p13-completion-overlay is-results"><div class="verification-summary"><section class="verification-result-copy completion-card ${pass?'completion-success':'completion-failure'}" role="dialog" aria-modal="true" aria-label="Pressure configuration verification results"><button class="completion-close" data-console="return" aria-label="Review configuration">×</button><small class="verification-status-label">KESTREL / REGISTER DIAGNOSTIC</small><h3>${pass?'ALL TESTS PASSED!':'CONFIGURATION NOT VERIFIED'}</h3>${pass?completionEmblem():''}<h4 class="completion-puzzle">${pass?'PRESSURE REGISTER VERIFIED':'CHECK REGISTER CAPACITY &amp; EFFICIENCY'}</h4><p class="verification-score">${score} / ${result.rows.length} TESTS PASSED</p><p>${esc(detail)}</p><details class="pressure-test-results"><summary>REVIEW ALL ${result.rows.length} TEST RESULTS</summary><div>${result.rows.map(r=>'<p class="'+(r.pass?'pass':'fail')+'">'+(r.pass?'✓ ':'✕ ')+r.inputs.pressure+' kPa · expected '+r.expected.value+' / stored '+r.actual.value+' · '+r.actual.width+' bits</p>').join('')}</div></details>${failed?'<p>First failed check: '+failed.inputs.pressure+' kPa · stored '+failed.actual.value+' · width '+failed.actual.width+' bits.</p>':''}${pass?consoleCreditPreview(w,'pressure_width'):''}<div class="diagnostic-controls">${pass?'<button class="brass-button verification-engage" data-console="engage">ENGAGE SYSTEM &amp; EXIT</button>':''}<button class="brass-button subtle" data-console="return">${pass?'REVIEW CONFIGURATION':'RETURN TO CONFIGURATION'}</button></div></section></div></div>`;
}
