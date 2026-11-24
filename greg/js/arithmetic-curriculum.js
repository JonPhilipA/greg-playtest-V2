import {validateAluShape} from './alu-foundation.js';
import {subtractorCircuit,validateSubtractorShape,legacyAddsub} from './subtractor.js';
import './arithmetic-modules.js';
import {legacyRippleCircuit,validateLegacyRippleShape} from './ripple-legacy.js';
import {rippleCircuit,validateRippleShape,legacyRipple} from './ripple-adder.js';
import {galleryDataTest} from './gallery-data.js';
import {validateAsciiActivity} from './ascii-transmission.js';
import {galleryEnabled} from './curriculum-profile.js';
import {createCircuit} from './puzzles.js';
import {functionalSignature} from './circuit-revision.js';
import {testCircuit} from './validator.js';
import {CONVERTER_ID,converterCircuit,validateConverter} from './twos-complement.js';
export const ARITHMETIC_IDS=Object.freeze(['navbits','trajectory','ripple_adder',CONVERTER_ID,'addsub','float_nav']);
export {SUBTRACTOR_SPEC as ADDSUB_SPEC} from './subtractor.js';

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
  w.circuits[id]??=id===CONVERTER_ID?converterCircuit():id==='ripple_adder'?rippleCircuit():id==='addsub'?subtractorCircuit():createCircuit(specs[id]);
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
 if(legacyRipple(w.circuits.ripple_adder)&&!w.machines.ripple_adder.certified){
  f.curriculum.archives['p17:carry-bench-v1']??={graph:structuredClone(w.circuits.ripple_adder),machine:structuredClone(w.machines.ripple_adder),readOnly:true,retired:true};
  w.circuits.ripple_adder=rippleCircuit();const meta=f.circuits.ripple_adder;meta.functionalRevision++;meta.signature=functionalSignature(w.circuits.ripple_adder);
  for(const table of ['tested','diagnostics','applications'])delete f[table].ripple_adder;
  delete f.curriculum.rippleTwoProof;
 }
 if(legacyAddsub(w.circuits.addsub)&&!w.machines.addsub.certified){
  f.curriculum.archives['p19:controlled-addsub-v1']??={graph:structuredClone(w.circuits.addsub),machine:structuredClone(w.machines.addsub),application:structuredClone(f.applications.addsub||null),readOnly:true,retired:true};
  for(const part of Object.values(f.fabrication?.instances||{}))if(part.owner?.puzzleId==='addsub'){const node=w.circuits.addsub.nodes.find(n=>n.id===part.owner.nodeId);if(part.owner.kind!=='draft'||node?.fabricatedId!==part.id||node.type!==part.componentType)throw Error('Historical P19 hardware ownership needs recovery.');part.owner={kind:'bag'};}
  w.circuits.addsub=subtractorCircuit();const meta=f.circuits.addsub;meta.functionalRevision++;meta.signature=functionalSignature(w.circuits.addsub);
  for(const table of ['tested','applications','diagnostics'])delete f[table].addsub;
  delete f.curriculum.completed.addsub;
 }
 validateAluShape(w.circuits.float_nav);
 if(!legacyAddsub(w.circuits.addsub))validateSubtractorShape(w.circuits.addsub);
 validateConverter(w.circuits[CONVERTER_ID].configuration);if(legacyRipple(w.circuits.ripple_adder))validateLegacyRippleShape(w.circuits.ripple_adder);else validateRippleShape(w.circuits.ripple_adder);
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
 if(legacyRipple(w.circuits.ripple_adder)&&w.circuits.ripple_adder.configuration.rippleStage===4){
  const proof=f.curriculum.rippleTwoProof;
  if(proof?.version!==1||typeof proof.transactionId!=='string'||typeof proof.signature!=='string')throw Error('Missing two-adder carry proof.');
  const signed=JSON.parse(proof.signature),two=legacyRippleCircuit(2);two.wires=signed.wires;
  if(functionalSignature(two)!==proof.signature||!testCircuit(specs.ripple_adder,two).pass)throw Error('Invalid two-adder carry proof.');
 }
 f.curriculum.arithmeticVersion=2;f.curriculum.revision=4;
}
