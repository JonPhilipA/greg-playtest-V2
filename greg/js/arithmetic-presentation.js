import {gateSymbol} from './panel-art.js';
export const componentLabel=type=>({NOT4:'4-BIT INVERTER · NOT4',FA1:'FULL ADDER',FAN4:'CONTROL SPLITTER · FAN4',XOR4:'4-BIT XOR · XOR4',ADD4C:'4-BIT ADDER · ADD4C'}[type]||type);
export const ADDSUB_INTRO=[
 'You already know XOR. XOR4 is the same idea, but applied to four bits at once.',
 'Each bit passes through its own XOR gate. We just package all four into one module.',
 'We also need one switch to control all four XOR gates at once.',
 'This splitter takes one control signal and sends a copy to every bit position.',
 'Now we have everything we need. We know how to add four-bit numbers, and we know how to make a number negative.',
 'What if we used the same adder to perform both addition and subtraction?',
 'A − B = A + NOT(B) + 1',
 'The SUB switch will decide whether the circuit adds normally or prepares B for subtraction.'
];
const module=(name,id)=>`<div class="packaged-module"><svg viewBox="-4 -4 48 40" aria-hidden="true">${gateSymbol(id)}</svg><strong>${name}</strong><small>${id}</small></div>`;
/** Explanatory grouping only: no finished ADD/SUB wiring and no state mutation. */
export function arithmeticDialogueVisual(key,index,reduced=false){
 let inside='';
 if(key==='intro-add4c'){const stages=[0,1,2,3].map(i=>'<span class="mini-stage">FA'+i+'</span>').join('<span aria-hidden="true">→</span>');inside=index<2?stages:index===2?'<div class="source-stage-bank">'+stages+'</div>'+module('4-BIT ADDER','ADD4C'):module('4-BIT ADDER','ADD4C')+'<span>Four Full Adders<br>with carry-in</span>';}
 else if(key?.startsWith('problem-addsub-bus-v2')&&index<=1)inside=Array.from({length:4},(_,i)=>'<span class="mini-stage">XOR · b'+i+'</span>').join('')+'<span aria-hidden="true">⇒</span>'+module('4-BIT XOR','XOR4');
 else if(key?.startsWith('problem-addsub-bus-v2')&&index<=3)inside='<span>SUB · 0 / 1</span><span aria-hidden="true">→</span>'+module('CONTROL SPLITTER','FAN4')+'<span aria-hidden="true">→</span><strong>0 → 0000<br>1 → 1111</strong>';
 else return '';
 return '<div class="arithmetic-package '+(reduced?'reduced':'')+(key==='intro-add4c'&&index===2?' packaging':'')+'" role="img" aria-label="'+(key==='intro-add4c'?'Four Full Adders packaged as a four-bit adder':index<=1?'Four independent XOR bit lanes packaged as XOR4':'SUB control replicated to four identical lanes')+'">'+inside+'</div>';
}
