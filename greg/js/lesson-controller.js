import {rippleCircuit} from './ripple-adder.js';
import {isDataConsole,DATA_SPECS} from './data-consoles.js';
import {galleryCircuit} from './gallery-puzzles.js';
import {REPAIRS} from './repairs.js';
import {createCircuit} from './puzzles.js';
import {testCircuit} from './validator.js';
import {evaluate,step} from './simulator.js';

export const LESSON_STAGES=Object.freeze(['INVESTIGATE','LEARN','PRACTICE','BUILD','TEST','APPLY']);
const notes={cryo_signed:['Signed and unsigned interpretation',REPAIRS.cryo_signed.explanation],pressure_width:['Bit widths and unsigned ranges',REPAIRS.pressure_width.explanation],hull:['Majority logic','At least two sensors must report damage. AB OR AC OR BC includes three HIGH reports. Unlike XOR disagreement, one HIGH report is insufficient.'],sensordiff:['XOR · disagreement','XOR means exclusive OR: its output is 1 when the two inputs are different. Equal sensor readings (00 or 11) keep the warning off. Different readings (01 or 10) turn it on. Install the recovered physical XOR gate.'],xorfab:['XOR construction','Share NAND(A,B), create a branch from each input and the shared result, then NAND those branches. Four physical NANDs can construct exclusive OR.'],ventilation:['NOT','An inverter swaps 0 and 1. INHIBIT is a stop request; invert it to run the fan.'],security:['AND','An AND interlock requires both permissions. One HIGH input alone must not open the hatch.'],alarm:['OR','An OR alarm responds to either warning, including both together.'],scrubber:['NOR','Combine OR with inversion. Either inhibit stops the scrubber; only 00 permits it.'],nandnot:['NOT','Feed the same input into both NAND pins to invert it.'],nandand:['AND','NAND inverts AND. Invert that result with a second tied-input NAND.'],nandor:['OR','Invert each input with NAND, then combine the inverted inputs with NAND.']};
export function lessonDefinition(id,w){const p=w&&isDataConsole(id,w.circuits?.[id])?DATA_SPECS[id]:Object.hasOwn(REPAIRS,id)?REPAIRS[id]:null;return p?{id,title:p.title,concept:notes[id]?.[0]||p.title,text:notes[id]?.[1]||p.explanation||p.problem,requirement:p.spec,stages:LESSON_STAGES}:null;}
export function recordLesson(w,id,stage,{path}={}){
 if(!lessonDefinition(id,w)||!LESSON_STAGES.includes(stage))throw Error('Unknown lesson or stage.');
 const previous=w.foundation.lessonProgress[id]||{stage:'INVESTIGATE',visited:[],path:'independent'};
 const record={...previous,stage:stage==='TEST'&&previous.competency&&w.machines[id]?.certified?'APPLY':stage,visited:[...new Set([...previous.visited,stage])],path:path||previous.path};
 if(stage==='APPLY')record.competency=true;
 w.foundation.lessonProgress[id]=record;return record;
}
export function advanceLesson(w,id,stage,path='guided'){
 if(!w.foundation.investigations[id]||!['LEARN','PRACTICE','BUILD'].includes(stage)||!['guided','independent'].includes(path))throw Error('Inspect the equipment first; Test and Apply require the real circuit.');
 return recordLesson(w,id,stage,{path});
}
/** Disposable real simulator session. It has no world, persistence, inventory or reward API. */
export function createPractice(id){
 const spec=REPAIRS[id];if(!lessonDefinition(id))throw Error('This practice is not implemented.');
 return {id,scope:'practice',circuit:id==='ripple_adder'?rippleCircuit(4):id==='sensordiff'?galleryCircuit(id):createCircuit(spec),inputs:Object.fromEntries(spec.inputs.map(n=>[n.id,0])),state:{},
  edit(graph){if(graph.nodes.some(n=>n.instanceId))throw Error('Physical instances cannot enter practice.');this.circuit=structuredClone(graph);},
  toggle(inputId){const n=spec.inputs.find(n=>n.id===inputId);if(!n)throw Error('Unknown practice input.');this.inputs[inputId]=((this.inputs[inputId]||0)+1)%2**n.width;if(spec.sequential)try{this.state=step(this.circuit,this.inputs,this.state).state;}catch{}return this.inputs;},
  evaluate(){return evaluate(this.circuit,this.inputs,this.state,{partial:true});},
  test(){return {...testCircuit(spec,this.circuit),scope:'practice',canApply:false};},
 };
}
export function learnedConcepts(w){
 return Object.getOwnPropertyNames(REPAIRS).map(id=>[id,REPAIRS[id]]).filter(([id])=>!(id==='firewall'&&w.foundation.curriculum.arithmeticVersion>=1)&&(w.foundation.lessonProgress[id]?.visited?.includes('LEARN')||w.foundation.lessonProgress[id]?.competency||w.machines[id]?.certified)).map(([id])=>lessonDefinition(id,w));
}
export function conceptTruthTable(id,w){
 const p=Object.hasOwn(REPAIRS,id)?REPAIRS[id]:null;if(!p||isDataConsole(id,w?.circuits?.[id])||p.sequential||p.inputs.length>3||p.inputs.some(n=>n.width!==1))return null;
 return {inputs:p.inputs.map(n=>n.label),outputs:p.outputs.map(n=>n.label),rows:Array.from({length:2**p.inputs.length},(_,bits)=>{const inputs=Object.fromEntries(p.inputs.map((n,i)=>[n.id,(bits>>i)&1]));return {inputs:Object.values(inputs),outputs:Object.values(p.expected(inputs))};})};
}
