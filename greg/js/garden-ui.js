import {damagedScrubberGraph} from './garden-malfunction.js';
import {Editor,fitCircuitViewport} from './editor.js';
import {evaluate} from './simulator.js';
import {serviceState,isEarly} from './curriculum-profile.js';
import {DEMORGAN_IDENTITY,DEMORGAN_COUNTERPART,DEMORGAN_HINTS} from './garden-service.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function counterpartGraphs(){
 const fixed=[{id:'A',type:'INPUT',label:'A',fixed:true,width:1},{id:'B',type:'INPUT',label:'B',fixed:true,width:1},{id:'Y',type:'OUTPUT',label:'Y',fixed:true,width:1}],graph=nodes=>({nodes:[...structuredClone(fixed),...nodes],wires:[]});
 const a=graph([{id:'and',type:'AND'},{id:'not',type:'NOT'}]),b=graph([{id:'na',type:'NOT'},{id:'nb',type:'NOT'},{id:'or',type:'OR'}]);
 const wire=(g,from,to,pin=0)=>g.wires.push({id:'w'+g.wires.length,from,to,out:0,in:pin});
 wire(a,'A','and');wire(a,'B','and',1);wire(a,'and','not');wire(a,'not','Y');
 wire(b,'A','na');wire(b,'B','nb');wire(b,'na','or');wire(b,'nb','or',1);wire(b,'or','Y');return [a,b];
}
export function deMorganTables(){
 const [second,other]=counterpartGraphs();return [0,1,2,3].map(i=>{const inputs={A:i>>1,B:i%2};return {...inputs,first:Number(!(inputs.A|inputs.B)),firstEquivalent:(1-inputs.A)&(1-inputs.B),second:evaluate(second,inputs).outputs.Y,secondEquivalent:evaluate(other,inputs).outputs.Y};});
}
export class GardenUI{
 constructor(caps){Object.assign(this,caps);}
 window(title,body){
  const host=document.querySelector('#monitor-host');
  if(host){host.innerHTML='<section class="test-monitor teaching-window service-window" role="dialog" aria-label="'+esc(title)+'"><header><h3>'+esc(title)+'</h3><button class="brass-button subtle" data-garden="close">Back to circuit</button></header>'+body+'</section>';this.bind(host);host.querySelector('button')?.focus();return host;}
  const earned=serviceState(this.getWorld())?.applied;
  this.paper(title,body,[{label:'Back to room',action:'close'}],earned?'BOOLEAN ALGEBRA / DE MORGAN':'KESTREL / HARDWARE HISTORY','demorgan');const root=document.querySelector('#overlay');this.bind(root);return root;
 }
 bind(host){host.onclick=e=>{const action=e.target.closest('[data-garden]')?.dataset.garden;if(!action)return;e.stopPropagation();if(action==='close'){host.innerHTML='';return;}if(action==='history')this.history();if(action==='lesson')this.lesson();if(action==='counterpart')this.counterpart();if(action==='hint'){const r=this.send({type:'SERVICE_HINT'});if(r.ok){this.feedback(r.hint);host.innerHTML='';}}};}
 help(){
  const s=serviceState(this.getWorld());this.window('Scrubber repair guidance','<p><strong>ORIGINAL FUNCTION: NOR</strong><br>AVAILABLE REPLACEMENTS: NOT ×2, AND ×1</p><p>The original circuit activated the scrubber only when neither warning was active. Compare the required truth table with the available components.</p><div class="teaching-actions"><button class="brass-button" data-garden="hint">Next hint</button><button class="brass-button subtle" data-garden="history">Inspect damaged original controller</button>'+(s.applied?'<button class="brass-button" data-garden="lesson">Compare the equivalent constructions</button>':'')+'</div>');
 }
 history(){
  const s=serviceState(this.getWorld());if(!s?.triggered)return;
  const host=this.window('Original scrubber — damaged hardware','<p>The original OR and NOT both failed. Their historical IDs and wiring are preserved; neither part can be reused.</p><svg class="lesson-board board" data-history-board viewBox="0 0 1200 560" aria-label="Read-only damaged original NOR controller"></svg><p>Original logical behavior before the hardware failed:</p>'+this.table(s.original.graph)+'<p class="teaching-note">This is a read-only historical reference. It cannot install, refund or reactivate damaged gates.</p>');
  const graph=damagedScrubberGraph(this.getWorld());this.draw(host.querySelector('[data-history-board]'),graph,{A:0,B:0});
 }
 table(graph,second=null){
  const rows=[0,1,2,3].map(i=>{const inputs={A:i>>1,B:i%2};let actual=evaluate(graph,inputs).outputs.Y;return '<tr><td>'+inputs.A+'</td><td>'+inputs.B+'</td><td>'+actual+'</td>'+(second?'<td>'+evaluate(second,inputs).outputs.Y+'</td>':'')+'</tr>';}).join('');
  return '<div class="manual-truth"><table><thead><tr><th>TOXIC / A</th><th>SERVICE / B</th><th>ORIGINAL</th>'+(second?'<th>REPLACEMENT</th>':'')+'</tr></thead><tbody>'+rows+'</tbody></table></div>';
 }
 draw(svg,graph,inputs){
  const editor=new Editor(svg,{circuit:structuredClone(graph),inputs:{...inputs},state:{},workbench:true,preserveLayout:!!graph.layout&&graph.nodes.some(n=>n.faulty),width:1200,height:560,theme:'illustrated',onChange:()=>({ok:false}),onInput:()=>{},onMessage:()=>{}});editor.beginDiagnostic();fitCircuitViewport(editor);return editor;
 }
 lesson(){
  const s=serviceState(this.getWorld());if(!s?.applied)return;this.send({type:'ACK_DEMORGAN'});
  const original=s.original.graph,replacement=s.certificate.sourceGraph;
  const host=this.window('Functional equivalence — De Morgan’s Law','<p><strong>G.R.E.G.</strong> “Interesting. Completely different components, but exactly the same behavior. Inverting OR is equivalent to ANDing the inverted inputs.”</p><p class="lesson-equation">'+DEMORGAN_IDENTITY+'</p><div class="service-signals"><button class="brass-button" data-compare-input="A">TOXIC = 0</button><button class="brass-button" data-compare-input="B">SERVICE = 0</button></div><div class="service-comparison"><section><h4>Original controller · historical</h4><p>NOT(A OR B)</p><svg class="lesson-board board" data-compare="original" viewBox="0 0 1200 560"></svg></section><section><h4>Replacement controller · installed</h4><p>NOT(A) AND NOT(B)</p><svg class="lesson-board board" data-compare="replacement" viewBox="0 0 1200 560"></svg></section></div>'+this.table(original,replacement)+'<p>The same function can have different physical implementations. Both original parts remain damaged; these drawings grant no hardware or manufacturing rights.</p><p><strong>Its counterpart:</strong> '+DEMORGAN_COUNTERPART+'</p><div class="teaching-actions"><button class="brass-button" data-garden="counterpart">Try the second law in temporary practice</button></div>');
  this.connectInputs(host,original,replacement);
 }
 counterpart(){
  if(!serviceState(this.getWorld())?.applied)return;const [a,b]=counterpartGraphs();
  const host=this.window('De Morgan counterpart · temporary practice','<p class="lesson-equation">'+DEMORGAN_COUNTERPART+'</p><p>Inverting AND gives OR with inverted inputs. Toggle either input and compare the actual two circuits.</p><p class="teaching-note">Temporary practice components. No physical inventory, certification or machinery changes.</p><div class="service-signals"><button class="brass-button" data-compare-input="A">A = 0</button><button class="brass-button" data-compare-input="B">B = 0</button></div><div class="service-comparison"><section><h4>NOT(A AND B)</h4><svg class="lesson-board board" data-compare="original" viewBox="0 0 1200 560"></svg></section><section><h4>NOT(A) OR NOT(B)</h4><svg class="lesson-board board" data-compare="replacement" viewBox="0 0 1200 560"></svg></section></div>'+this.table(a,b));this.connectInputs(host,a,b);
 }
 connectInputs(host,a,b){
  const inputs={A:0,B:0},first=this.draw(host.querySelector('[data-compare="original"]'),a,inputs),second=this.draw(host.querySelector('[data-compare="replacement"]'),b,inputs);
  host.querySelectorAll('[data-compare-input]').forEach(button=>button.onclick=()=>{const id=button.dataset.compareInput;inputs[id]=1-inputs[id];button.textContent=id+' = '+inputs[id];first.refresh({...inputs},{});second.refresh({...inputs},{});});
 }
}
