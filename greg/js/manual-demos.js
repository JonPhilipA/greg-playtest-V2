// Temporary reference models: these helpers deliberately accept no campaign or command capabilities.
import {TYPES,evaluate} from './simulator.js';
import {Editor,fitCircuitViewport,escapeHTML as esc} from './editor.js';
import {fourBitSwitchMarkup,BINARY_WEIGHTS} from './binary-hardware.js';
import {gardenBinaryView} from './garden-binary-ui.js';
import {signedBinaryView} from './signed-binary-ui.js';
import {animateInputSwitch,stopInputSwitchAnimations} from './input-switch.js';
const reducedMotion=()=>document.documentElement.dataset.reducedMotion==='true'||matchMedia('(prefers-reduced-motion: reduce)').matches;
const palette=['#326dcc','#d8aa2d','#dc3037','#b154a5'];
const wire=(from,to,input=0,index=0)=>({id:'reference-wire-'+index,from,to,in:input,out:0});
const terminal=(id,type,x,y)=>({id,type,label:id,fixed:true,width:1,x,y,artStyle:'illustrated'});
/** Use the simulator for both the live output and the reference table. */
export function gateReference(type){
 const spec=TYPES[type];if(!spec?.compute||spec.inputs.some(p=>p.width!==1)||spec.outputs.length!==1)throw Error('No combinational bit reference for '+type);
 const inputs=spec.inputs.map(p=>p.name),graph={nodes:[...inputs.map((id,i)=>terminal(id,'INPUT',20,20+i*140)),{id:'gate',type,x:290,y:95},terminal('Y','OUTPUT',485,80)],wires:[...inputs.map((id,i)=>wire(id,'gate',i,i)),wire('gate','Y',0,inputs.length)]};
 const rows=Array.from({length:2**inputs.length},(_,i)=>{const values=Object.fromEntries(inputs.map((id,j)=>[id,(i>>(inputs.length-1-j))&1]));return {inputs:values,output:evaluate(graph,values).outputs.Y};});
 return {type,inputs,graph,rows};
}
export function constructionReference(sheet){
 return {nodes:[...sheet.inputs.map((id,i)=>terminal(id,'INPUT',30,65+i*150)),...sheet.nodes.map(n=>({...n,artStyle:'illustrated'})),...sheet.outputs.map((id,i)=>terminal(id,'OUTPUT',980,150+i*170))],wires:sheet.wires.map((w,i)=>({...w,id:'drawing-wire-'+i}))};
}
export const gateDemoMarkup=()=>'<section class="manual-gate-demo" aria-label="Interactive gate reference"><div><p class="manual-demo-caption">FLIP THE INPUTS · LIVE CIRCUIT</p><div class="manual-demo-hardware"><svg class="board" role="group" aria-label="Temporary gate demonstration"></svg></div><p class="manual-demo-status" role="status" aria-live="polite"></p></div><div class="manual-live-table manual-table"></div></section>';
function scrubHardware(svg,inputs){
 svg.removeAttribute('aria-disabled');
 svg.querySelectorAll('[tabindex]').forEach(el=>el.removeAttribute('tabindex'));
 svg.querySelectorAll('[role="button"]').forEach(el=>{el.removeAttribute('role');el.removeAttribute('aria-label');});
 svg.querySelectorAll('[data-pin] title,[data-wire] title').forEach(el=>el.remove());
 for(const node of svg.querySelectorAll('[data-node]'))if(inputs.includes(node.dataset.node)){
  node.dataset.manualInput=node.dataset.node;node.setAttribute('role','switch');node.setAttribute('tabindex','0');
  node.setAttribute('aria-label','Input '+node.dataset.node);node.setAttribute('aria-checked',String(node.classList.contains('high')));
 }
}
export class GateReference{
 constructor(root,type){
  this.root=root;this.model=gateReference(type);this.inputs=Object.fromEntries(this.model.inputs.map(id=>[id,0]));this.animations=new Set();
  const svg=root.querySelector('svg');this.editor=new Editor(svg,{circuit:this.model.graph,inputs:this.inputs,state:{},width:680,height:290,workbench:true,preserveLayout:true,theme:'illustrated',wirePalette:palette,onInput:()=>{},onChange:()=>({ok:false}),onMessage:()=>{}});this.editor.beginDiagnostic();
  root.querySelector('.manual-live-table').innerHTML=`<table aria-label="${esc(type)} truth table"><thead><tr><th scope="col"><span class="sr-only">Current inputs</span></th>${this.model.inputs.map(id=>`<th scope="col">${id}</th>`).join('')}<th scope="col">${esc(type)}</th></tr></thead><tbody>${this.model.rows.map((r,i)=>`<tr data-reference-row="${i}"><th scope="row"><span class="manual-row-marker" aria-hidden="true">›</span><span class="sr-only">Selected</span></th>${this.model.inputs.map(id=>`<td>${r.inputs[id]}</td>`).join('')}<td><strong>${r.output}</strong></td></tr>`).join('')}</tbody></table>`;
  this.pointer=e=>{if(e.target.closest('[data-manual-input]'))e.stopPropagation();};
  this.activate=e=>{const node=e.target.closest('[data-manual-input]');if(!node||e.type==='keydown'&&!['Enter',' '].includes(e.key))return;e.preventDefault();e.stopPropagation();if(e.repeat)return;this.toggle(node.dataset.manualInput);};
  root.addEventListener('pointerdown',this.pointer,true);root.addEventListener('click',this.activate,true);root.addEventListener('keydown',this.activate,true);
  this.observer=new ResizeObserver(()=>this.layout());this.observer.observe(root.querySelector('.manual-demo-hardware'));this.layout();
 }
 layout(){
  const narrow=this.root.querySelector('.manual-demo-hardware').clientWidth<360,n=this.model.graph.nodes,one=this.model.inputs.length===1;
  n.filter(x=>x.type==='INPUT').forEach((x,i)=>{x.x=narrow?(one?95:12+i*190):20;x.y=narrow?20:(one?85:20+i*140);});
  Object.assign(n.find(x=>x.id==='gate'),{x:narrow?135:290,y:narrow?180:95});Object.assign(n.find(x=>x.id==='Y'),{x:narrow?102:485,y:narrow?325:80});
  this.root.classList.toggle('is-narrow',narrow);this.editor.refresh(this.inputs,{});fitCircuitViewport(this.editor);scrubHardware(this.editor.svg,this.model.inputs);this.updateTable();
 }
 updateTable(){
  const index=this.model.inputs.reduce((n,id)=>n*2+this.inputs[id],0),output=this.editor.values.get('Y')[0];
  for(const row of this.root.querySelectorAll('[data-reference-row]')){const active=Number(row.dataset.referenceRow)===index;row.classList.toggle('is-active',active);if(active)row.setAttribute('aria-current','true');else row.removeAttribute('aria-current');row.querySelector('th').setAttribute('aria-label',active?'Current inputs':'');row.querySelector('th .sr-only').textContent=active?'Current inputs':'';}
  this.root.querySelector('.manual-demo-status').textContent=this.model.inputs.map(id=>id+' = '+this.inputs[id]).join(' · ')+' → '+this.model.type+' = '+output;
 }
 toggle(id){
  stopInputSwitchAnimations(this.animations);const before=this.inputs[id];this.inputs[id]=1-before;this.editor.refresh(this.inputs,{});fitCircuitViewport(this.editor);scrubHardware(this.editor.svg,this.model.inputs);this.updateTable();
  const node=this.editor.svg.querySelector(`[data-manual-input="${id}"]`);node.focus({preventScroll:true});
  if(!reducedMotion())animateInputSwitch(node.querySelector('.switch-knob'),before,this.inputs[id],100,this.animations);
 }
 dispose(){this.observer.disconnect();stopInputSwitchAnimations(this.animations);this.editor.stopDiagnosticAnimations();this.root.removeEventListener('pointerdown',this.pointer,true);this.root.removeEventListener('click',this.activate,true);this.root.removeEventListener('keydown',this.activate,true);}
}
export const binaryDemoMarkup=signed=>`<section class="manual-binary-demo" aria-label="Temporary binary register"><div class="manual-bit-register"></div>${signed?'<div class="manual-interpretation" role="group" aria-label="Register interpretation"><button data-reference-mode="unsigned">UNSIGNED</button><button data-reference-mode="signed">SIGNED</button></div>':''}<div class="manual-binary-result" role="status" aria-live="polite"></div></section>`;
export class BinaryReference{
 constructor(root,signed=false){
  this.root=root;this.signed=signed;this.state={bits:signed?13:0,mode:'unsigned',stage:'explore'};this.animations=new Set();
  this.activate=e=>{const bit=e.target.closest('[data-reference-bit]'),mode=e.target.closest('[data-reference-mode]');if(!bit&&!mode||e.type==='keydown'&&!['Enter',' '].includes(e.key))return;
   // Native buttons already synthesize a click on keyboard activation.
   if(mode&&e.type==='keydown')return;e.preventDefault();e.stopPropagation();if(e.repeat)return;
   const old=this.state.bits;if(bit)this.state.bits^=Number(bit.dataset.referenceBit);else this.state.mode=mode.dataset.referenceMode;
   this.render(bit?Number(bit.dataset.referenceBit):mode.dataset.referenceMode,old);
  };root.addEventListener('click',this.activate);root.addEventListener('keydown',this.activate);this.render();
 }
 render(focus=null,old=this.state.bits){
  stopInputSwitchAnimations(this.animations);const v=this.signed?signedBinaryView(this.state):gardenBinaryView(this.state),weights=v.positionalWeights||BINARY_WEIGHTS;
  this.root.querySelector('.manual-bit-register').innerHTML=BINARY_WEIGHTS.map((weight,i)=>`<svg class="board manual-bit" viewBox="-5 -30 186 143" role="switch" tabindex="0" data-reference-bit="${weight}" aria-label="Bit ${3-i}, weight ${esc(weights[i])}" aria-checked="${!!(v.bits&weight)}"><text x="88" y="-12" class="manual-bit-weight" text-anchor="middle">${esc(weights[i])}</text>${fourBitSwitchMarkup(weight,Number(!!(v.bits&weight)))}</svg>`).join('');
  this.root.querySelectorAll('[data-toggle]').forEach(el=>{el.removeAttribute('tabindex');el.removeAttribute('role');el.removeAttribute('aria-label');});
  this.root.querySelectorAll('[data-reference-mode]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.referenceMode===this.state.mode)));
  this.root.querySelector('.manual-binary-result').innerHTML=`<span><small>BINARY REGISTER</small><strong>${v.binary}</strong></span><span><small>${this.state.mode.toUpperCase()} DECIMAL</small><strong data-reference-decimal>${esc(v.decimal)}</strong></span><p>${esc(v.expression)} = ${esc(v.decimal)}</p>`;
  if(focus!==null)this.root.querySelector(typeof focus==='number'?`[data-reference-bit="${focus}"]`:`[data-reference-mode="${focus}"]`).focus({preventScroll:true});
  if(old!==v.bits&&!reducedMotion())for(const w of BINARY_WEIGHTS.filter(w=>(old^v.bits)&w))animateInputSwitch(this.root.querySelector(`[data-reference-bit="${w}"] .switch-knob`),Number(!!(old&w)),Number(!!(v.bits&w)),100,this.animations);
 }
 dispose(){stopInputSwitchAnimations(this.animations);this.root.removeEventListener('click',this.activate);this.root.removeEventListener('keydown',this.activate);}
}
