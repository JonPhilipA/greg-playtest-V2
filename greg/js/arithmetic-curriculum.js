import './arithmetic-modules.js';
import {rippleCircuit,validateRippleShape} from './ripple-adder.js';
import {galleryDataTest} from './gallery-data.js';
import {validateAsciiActivity} from './ascii-transmission.js';
import {galleryEnabled} from './curriculum-profile.js';
import {createCircuit} from './puzzles.js';
import {functionalSignature} from './circuit-revision.js';
import {testCircuit} from './validator.js';
import {CONVERTER_ID,converterCircuit,validateConverter} from './twos-complement.js';
export const ARITHMETIC_IDS=Object.freeze(['navbits','trajectory','ripple_adder',CONVERTER_ID,'addsub']);
const input=(id,label,width=1)=>({id,type:'INPUT',label,width});
export const ADDSUB_SPEC={id:'addsub',room:'computation',title:'Adder/Subtractor Circuit',short:'adder/subtractor',plate:'COMPUTATION LAB / P19',inputs:[input('A','A [3:0]',4),input('B','B [3:0]',4),input('M','SUB')],outputs:[{id:'Y',type:'OUTPUT',label:'RESULT [3:0]',width:4},{id:'C',type:'OUTPUT',label:'CARRY / NO BORROW',width:1}],gates:['FAN4','XOR4','ADD4C'],source:{A:3,B:2,M:0},expected:({A,B,M})=>{const n=A+(B^(M?15:0))+M;return {Y:n&15,C:n>>4};},spec:'RESULT = A + (B XOR {4×SUB}) + SUB (mod 16)',problem:'Build ADD/SUB hardware. Fan SUB to all four XOR positions and the full-adder carry-in. SUB 0 adds; SUB 1 subtracts by inverting B and adding 1.',hints:['P18 showed A − B = A + (~B) + 1. The same SUB control must cause both inversion and carry-in.','FAN4 repeats one control bit across four positions. XOR4 conditionally inverts B. ADD4C is four full-adder stages with an initial carry-in.','Connect SUB to FAN4 and ADD4C Cin; B and FAN4 to XOR4; A and XOR4 to ADD4C; route SUM and carry to the outputs.'],explanation:'Four ripple-connected full adders compute A + (B XOR a repeated SUB mask) + SUB. Addition uses unchanged B and Cin 0. Subtraction uses inverted B and Cin 1. Keep four sum bits; carry is the addition carry or subtraction no-borrow flag.',restored:'One datapath, two operations. Subtraction is addition of a negative representation.'};

/** Stable identities preserve earned work; numbers never identify saved repairs. */
export function initializeArithmetic(w,specs,saved=null){
 if(!galleryEnabled(w))return;
 const f=w.foundation,previous=saved?.foundation?.curriculum?.arithmeticVersion;
 if(previous!==undefined&&![1,2].includes(previous))throw Error('Unsupported arithmetic curriculum revision.');
 if(saved?.circuits?.firewall)f.curriculum.archives['retired:status-bitmask']??={graph:structuredClone(saved.circuits.firewall),machine:structuredClone(saved.machines?.firewall||{}),application:structuredClone(saved.foundation?.applications?.firewall||null),lesson:structuredClone(saved.foundation?.lessonProgress?.firewall||null),readOnly:true,retired:true};
 delete w.circuits.firewall;delete w.machines.firewall;delete w.machineStates.firewall;
 for(const table of ['circuits','investigations','tested','applications','diagnostics','lessonProgress','hintPreferences'])delete f[table].firewall;
 delete f.investigations['equipment:firewall'];delete f.curriculum.completed.firewall;
 for(const id of ARITHMETIC_IDS){
  if(!w.circuits[id]&&saved?.circuits?.[id]){
   w.circuits[id]=structuredClone(saved.circuits[id]);
   w.machines[id]={...saved.machines?.[id],certified:saved.machines?.[id]?.certified===true&&testCircuit(specs[id],w.circuits[id]).pass};
   if(saved.foundation?.circuits?.[id])f.circuits[id]=structuredClone(saved.foundation.circuits[id]);
   for(const key of [id,'equipment:'+id])f.investigations[key]=saved.foundation?.investigations?.[key]===true;
  }
  w.circuits[id]??=id===CONVERTER_ID?converterCircuit():id==='ripple_adder'?rippleCircuit():createCircuit(specs[id]);
  w.machines[id]??={status:'off',certified:false,output:0,outputs:{}};
  f.circuits[id]??={functionalRevision:0,signature:functionalSignature(w.circuits[id]),contentVersion:1,validatorVersion:1};
 }
 // No reliable separate subtraction tutorial exists. Only campaigns demonstrably
 // beyond this new lesson are grandfathered; the converter earns no retroactive money.
 const beyond=!previous&&saved&&(saved.machines?.addsub?.certified||saved.discovered?.some(r=>['navigation','reactor','bridge'].includes(r)));
 if(beyond&&!saved.circuits?.[CONVERTER_ID]){
  w.circuits[CONVERTER_ID]=converterCircuit();w.circuits[CONVERTER_ID].configuration={stage:2,step:'complete',bits:14,proofs:[13,11,14]};
  w.machines[CONVERTER_ID].certified=true;f.curriculum.completed[CONVERTER_ID]=true;
  f.curriculum.arithmeticGrandfathered={puzzleId:CONVERTER_ID,reason:'campaign-already-beyond-arithmetic',rewards:false};
 }
 validateConverter(w.circuits[CONVERTER_ID].configuration);validateRippleShape(w.circuits.ripple_adder);
 // Historical identities, never display numbers. Existing receipts and completed Full Adders stay intact.
 if(saved&&previous!==2){
  const advanced=saved.machines?.twos_complement?.certified||saved.machines?.addsub?.certified||saved.ending||['memory','reactor','alu','flightmemory','override'].some(id=>saved.machines?.[id]?.certified)||saved.discovered?.some(r=>['reactor','bridge'].includes(r));
  if(advanced)f.curriculum.rippleLegacy={version:1,reason:'campaign-already-beyond-ripple',rewards:false,practice:true};
  const asciiProof=(saved.machines?.adc_precision?.certified||saved.foundation?.curriculum?.completed?.adc_precision===true)&&saved.circuits?.adc_precision?.configuration?.bytes&&galleryDataTest('adc_precision',saved.circuits.adc_precision.configuration).pass;
  const ascii=asciiProof||advanced;
  if(ascii)f.curriculum.asciiActivity={version:1,stage:2,complete:true,origin:asciiProof?'historical-ascii':'legacy-progress',rewards:false};
 }
 f.curriculum.asciiActivity??={version:1,stage:0,complete:false};
 validateAsciiActivity(f.curriculum.asciiActivity);
 if(w.circuits.ripple_adder.configuration.rippleStage===4){
  const proof=f.curriculum.rippleTwoProof;
  if(proof?.version!==1||typeof proof.transactionId!=='string'||typeof proof.signature!=='string')throw Error('Missing two-adder carry proof.');
  const signed=JSON.parse(proof.signature),two=rippleCircuit(2);two.wires=signed.wires;
  if(functionalSignature(two)!==proof.signature||!testCircuit(specs.ripple_adder,two).pass)throw Error('Invalid two-adder carry proof.');
 }
 f.curriculum.arithmeticVersion=2;f.curriculum.revision=4;
}
