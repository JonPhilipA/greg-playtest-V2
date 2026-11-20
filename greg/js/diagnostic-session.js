import {evaluate,step} from './simulator.js';
import {functionalSignature} from './circuit-revision.js';

export const DIAGNOSTIC_TIMING=Object.freeze({initialize:120,scanBudget:2200,glow:180});
export function diagnosticTiming(count,{puzzleId}={}){
 const n=Math.max(1,Math.trunc(count)||1),intro=['ventilation','security','alarm'].includes(puzzleId);let durations;
 if(intro)durations=Array.from({length:n},(_,i)=>Math.round(680-100*i/Math.max(1,n-1)));
 else if(n===4)durations=[550,470,410,360];
 else if(n<4)durations=Array.from({length:n},(_,i)=>Math.round(550-150*i/Math.max(1,n-1)));
 else{const budget=n>=8?DIAGNOSTIC_TIMING.scanBudget:1790,weights=Array.from({length:n},(_,i)=>1.35-.6*i/Math.max(1,n-1)),sum=weights.reduce((a,b)=>a+b,0);durations=weights.map(v=>budget*v/sum);}
 let scan=0;const starts=durations.map(duration=>{const start=scan;scan+=duration;return start;});
 return {initialize:DIAGNOSTIC_TIMING.initialize,durations,starts,scan,row:scan/n,glow:DIAGNOSTIC_TIMING.glow};
}
export const diagnosticTransitionMs=(interval,reduced=false)=>reduced?0:Math.round(Math.max(45,Math.min(130,interval*.25)));

const freeze=value=>{if(value&&typeof value==='object'){for(const child of Object.values(value))freeze(child);Object.freeze(value);}return value;};
const clone=value=>structuredClone(value);
function observe(graph,inputs){
 const faulty=new Set(graph.nodes.filter(n=>n.faulty).map(n=>n.id));
 const readable=faulty.size?{...graph,wires:graph.wires.filter(w=>!faulty.has(w.from))}:graph;
 const result=evaluate(readable,inputs,{}, {partial:true});for(const id of faulty)result.values.set(id,[null]);return result;
}
function selectRows(rows,limit){
 if(rows.length<=limit)return rows.map((_,i)=>i);
 const ids=new Set([0,rows.length-1]);
 for(let i=1;i<limit;i++)ids.add(Math.round(i*(rows.length-1)/(limit-1)));
 // A bounded representative trace must include an actual failing case when present.
 const failed=rows.findIndex(r=>!r.pass);
 if(failed>=0&&!ids.has(failed)){const replace=[...ids].find(i=>i!==0&&i!==rows.length-1);ids.delete(replace);ids.add(failed);}
 return [...ids].sort((a,b)=>a-b).slice(0,limit);
}
function observations(spec,graph,limit){
 const total=spec.inputs.filter(n=>n.role!=='clock').reduce((n,p)=>n*2**p.width,1);
 if(!Number.isSafeInteger(total)||total>65536)return [];
 const indexes=total<=limit?Array.from({length:total},(_,i)=>i):Array.from({length:limit},(_,i)=>Math.round(i*(total-1)/(limit-1)));
 return indexes.map(index=>{
  let value=index;const inputs={};for(const n of [...spec.inputs].reverse()){if(n.role==='clock')continue;inputs[n.id]=value%2**n.width;value=Math.floor(value/2**n.width);}
  let actual={};try{actual=observe(graph,inputs).outputs;}catch{}
  const expected=spec.expected(inputs);return {inputs,expected,actual,pass:Object.entries(expected).every(([id,v])=>actual[id]===v),label:'partial observation'};
 });
}
/** Read-only adapter around an already completed authoritative Test. Never grants a ticket or calls Apply. */
export function prepareDiagnostic(spec,circuit,result,{limit=8}={}){
 const graph=clone(circuit),authoritativeRows=clone(result.rows||[]),partial=!spec.sequential&&!authoritativeRows.length;
 const rows=partial?observations(spec,graph,16):authoritativeRows;
 const selected=spec.id==='ripple_adder'?[...new Set([0,1,2,3,...selectRows(rows,Math.max(2,Math.min(16,limit)-4))])].filter(i=>i<rows.length):selectRows(rows,Math.max(2,Math.min(16,limit))),wanted=new Set(selected),frames=[];
 let state={};
 for(let index=0;index<rows.length;index++){
  const row=rows[index];let evaluation;
  try{evaluation=spec.sequential?step(graph,row.inputs,state):observe(graph,row.inputs);if(spec.sequential)state=evaluation.state;}
  catch{evaluation={values:new Map(),outputs:{}};}
  if(wanted.has(index))frames.push({index,inputs:clone(row.inputs),values:[...evaluation.values].map(([id,values])=>[id,[...values]]),state:clone(state),pass:row.pass});
 }
 const total=authoritativeRows.length;
 return freeze({puzzleId:spec.id||null,signature:functionalSignature(graph),graph,inputs:clone(spec.inputs),outputs:clone(spec.outputs),title:spec.title,sequential:!!spec.sequential,
  rows,frames,pass:result.ok!==false&&result.pass===true,error:result.error||null,partial,total,
  passed:authoritativeRows.filter(r=>r.pass).length,failed:authoritativeRows.filter(r=>!r.pass).length,
  representative:frames.length<rows.length,validationId:result.validationId||null});
}
/** Result text distinguishes functional proof, authoritative Apply, temporary practice and partial observation. */
export function diagnosticOutcome(model,applied,{practice=false,awaitingEngage=false}={}){
 if(!model.pass)return {kind:'failed',success:false,title:'DIAGNOSTIC FAILED',detail:model.failed?`${model.failed} test${model.failed===1?'':'s'} failed. Review the failed test or return to editing.`:model.error||'The circuit differs from the required behavior.'};
 if(practice)return {kind:'practice',success:false,title:'PRACTICE DIAGNOSTIC: PASSED',detail:'Practice passed. No certificate or installation was granted. Return to real Build through Hint.'};
 if(awaitingEngage)return {kind:'verified',success:false,title:'CIRCUIT VERIFIED',detail:'All required tests passed. Engage the system to apply this repair.'};
 if(!applied?.ok)return {kind:'blocked',success:false,title:'TEST PASSED · REPAIR NOT APPLIED',detail:applied?.error||'The repair could not be applied.'};
 return {kind:'applied',success:true,title:'SYSTEM DIAGNOSTIC: PASSED',detail:applied.duplicate?'Previously applied repair verified.':'Repair applied. Physical machinery is energized.'};
}
