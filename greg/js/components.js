import {unlockConstructionBlueprint} from './blueprints.js';
import {evaluate} from './simulator.js';
import {functionalSignature} from './circuit-revision.js';
import {componentLesson} from './component-lessons.js';
import {FINITE_GATES} from './inventory.js';

export const COMPONENTS=Object.freeze({
 NOR:{name:'NOR',equation:'NOR(A,B) = NOT(OR(A,B))'},NAND:{name:'NAND',equation:'NAND(A,B) = NOT(AND(A,B))'},
 NOT:{name:'NOT',equation:'NOT(A) = NAND(A,A)'},AND:{name:'AND',equation:'AND(A,B) = NOT(NAND(A,B))'},OR:{name:'OR',equation:'OR(A,B) = NAND(NOT A, NOT B)'},
 XOR:{name:'XOR',equation:'XOR(A,B) = A ≠ B'},HA1:{name:'Half adder',equation:'S = A XOR B; C = A AND B'},FA1:{name:'Full adder',equation:'S = A XOR B XOR Cin'},
 MUX1:{name:'Multiplexer',equation:'Y = (NOT S AND A) OR (S AND B)'},ADDSUB4:{name:'Adder/subtractor',equation:'Y = A + (B XOR SUB) + SUB'},DFF:{name:'D flip-flop',equation:'Capture D on rising CLK; hold otherwise'},ALU4:{name:'Arithmetic logic unit',equation:'Select a certified arithmetic or logic function'},
});
const FUNCTIONS=Object.freeze({NOR:'Outputs 1 only when both inputs are 0.',NAND:'Outputs 0 only when both inputs are 1.',NOT:'Inverts the input: 0 becomes 1, and 1 becomes 0.',AND:'Outputs 1 only when both inputs are 1.',OR:'Outputs 1 when either input, or both inputs, are 1.',XOR:'Outputs 1 when the inputs differ.',HA1:'Adds two bits, producing a sum bit and a carry bit.',FA1:'Adds two bits and a carry-in, producing sum and carry-out.',MUX1:'Routes one selected input to the output.',ADDSUB4:'Adds or subtracts four-bit values.',DFF:'Captures a bit on a rising clock edge and holds it between edges.',ALU4:'Selects an arithmetic or logic operation.'});
function introductoryProof(puzzleId,graph){
 const id={ventilation:'NOT',security:'AND',alarm:'OR',sensordiff:'XOR'}[puzzleId],d=componentLesson(id);if(!d)return null;
 try{const source=activeSource(graph),inputs=source.nodes.filter(n=>n.type==='INPUT'),outputs=source.nodes.filter(n=>n.type==='OUTPUT');if(inputs.length!==d.inputs.length||outputs.length!==1||inputs.some(n=>!d.inputs.includes(n.id)||(n.width||1)!==1))return null;for(let bits=0;bits<2**d.inputs.length;bits++){const values=Object.fromEntries(d.inputs.map((key,i)=>[key,(bits>>i)&1]));if(evaluate(source,values).outputs[outputs[0].id]!==d.evaluate(values)[id])return null;}return {id,source,signature:functionalSignature(graph)};}catch{return null;}
}
function validIntroduction(d,w){
 if(d?.kind==='pickup')return ['NOT','AND','OR','XOR'].includes(d.componentId)&&typeof d.transactionId==='string'&&Array.isArray(d.instanceIds)&&d.instanceIds.length>0&&d.instanceIds.every(id=>FINITE_GATES[id]?.componentType===d.componentId&&w.foundation.inventory.instances[id]?.componentType===d.componentId&&w.foundation.inventory.pickups[d.pickupId]?.includes(id));
 const proof=d?.kind==='introduction'&&introductoryProof(d.sourcePuzzleId,d.sourceGraph);return proof&&proof.id===d.componentId&&proof.signature===d.sourceSignature;
}
/** Called after the physical ledger commits a collection, never on placement or first use. */
export function introducePickup(w,pickupId,collected,transactionId,{historical=false}={}){
 const introduced=w.foundation.components.introduced??={},events=[];
 for(const id of ['NOT','AND','OR','XOR']){
  const instanceIds=collected.filter(key=>FINITE_GATES[key]?.componentType===id);if(!instanceIds.length||introduced[id]||w.foundation.components.discovered[id])continue;
  introduced[id]={componentId:id,kind:'pickup',transactionId,pickupId,instanceIds,sourcePuzzleId:{NOT:'ventilation',AND:'security',OR:'alarm',XOR:'sensordiff'}[id]};
  if(!historical)events.push({type:'component.found',parameters:{componentId:id,pickupId,instanceIds}});
 }
 return events;
}
export function pickupSnapshot(w,event){
 const id=event?.parameters?.componentId,d=w.foundation.components.introduced?.[id];
 if(event?.type!=='component.found'||d?.kind!=='pickup'||d.transactionId!==event.transactionId||d.pickupId!==event.parameters.pickupId||!validIntroduction(d,w))return null;
 return {eventId:event.eventId,componentId:id,name:id,description:id==='XOR'?'An XOR gate produces 1 when its inputs are different.':id==='NOT'?'A NOT gate reverses a signal. An input of 0 produces an output of 1.':componentLesson(id).explanation};
}
/** Function knowledge earned by P01–P03; it grants no constructed-source certificate. */
export function introduceComponent(w,puzzleId,transactionId,{previouslyApplied=false}={}){
 const proof=introductoryProof(puzzleId,w.circuits[puzzleId]);if(!proof)return [];
 const introduced=w.foundation.components.introduced??={};if(introduced[proof.id])return [];
 introduced[proof.id]={componentId:proof.id,kind:'introduction',transactionId,sourcePuzzleId:puzzleId,sourceSignature:proof.signature,sourceGraph:structuredClone(w.circuits[puzzleId]),equation:componentLesson(proof.id).explanation};
 return previouslyApplied?[]:[{type:'component.introduced',parameters:{componentId:proof.id,sourcePuzzleId:puzzleId,sourceSignature:proof.signature}}];
}
/** Old validated achievements unlock references silently, never queue historical animations. */
export function inferComponentDiscoveries(w){
 const f=w.foundation;
 for(const [pickupId,ids]of Object.entries(f.inventory.pickups||{}))if(Array.isArray(ids))introducePickup(w,pickupId,ids,'historical-pickup-'+pickupId,{historical:true});
 for(const puzzleId of ['ventilation','security','alarm','sensordiff'])if(w.machines[puzzleId]?.certified&&f.applications[puzzleId]?.signature===functionalSignature(w.circuits[puzzleId]))introduceComponent(w,puzzleId,f.applications[puzzleId].transactionId,{previouslyApplied:true});
 // Valid legacy applications may predate construction certificates. Infer silently.
 for(const [puzzleId,application]of Object.entries(f.applications)){
  if(!w.machines[puzzleId]?.certified||application.signature!==functionalSignature(w.circuits[puzzleId]))continue;
  const proof=recognizeConstruction(puzzleId,w.circuits[puzzleId]);
  if(proof&&!f.components.certified[proof.componentId])certifyConstruction(w,puzzleId,application.transactionId,{previouslyApplied:true});
 }
 for(const [id,c]of Object.entries(f.components.certified)){
  if(!f.components.discovered[id])f.components.discovered[id]={componentId:id,kind:'construction',transactionId:c.transactionId,sourcePuzzleId:c.sourcePuzzleId,equation:COMPONENTS[id].equation};
  unlockConstructionBlueprint(w,id,c.transactionId);
 }
 // Old first-use events remain in the audit history but can never reopen a construction reveal.
 f.presentation.pending=f.presentation.pending.filter(id=>{const event=f.presentation.history.find(e=>e.eventId===id);return !!discoverySnapshot(w,event)||!!pickupSnapshot(w,event);});
}
const NEW_GATE_MILESTONES=Object.freeze({scrubber:'NOR',safetycutoff:'NAND',xorfab:'XOR',navbits:'HA1',trajectory:'FA1'});

function activeSource(graph){
 const needed=new Set(),visiting=new Set();
 function visit(id){if(needed.has(id))return;if(visiting.has(id))throw Error('A combinational source cannot contain feedback.');const n=graph.nodes.find(n=>n.id===id);if(!n)throw Error('Missing source node.');visiting.add(id);for(const wire of graph.wires.filter(w=>w.to===id))visit(wire.from);visiting.delete(id);needed.add(id);}
 for(const n of graph.nodes.filter(n=>n.type==='OUTPUT'))visit(n.id);
 return {nodes:structuredClone(graph.nodes.filter(n=>needed.has(n.id))),wires:structuredClone(graph.wires.filter(w=>needed.has(w.from)&&needed.has(w.to)))};
}
export function recognizeConstruction(puzzleId,graph){
 if(['navbits','trajectory'].includes(puzzleId))return recognizeAdder(puzzleId,graph);
 const targets={scrubber:'NOR',safetycutoff:'NAND',nandnot:'NOT',nandand:'AND',nandor:'OR',xorfab:'XOR'},target=Object.hasOwn(targets,puzzleId)?targets[puzzleId]:null;if(!target)return null;
 try{
  const source=activeSource(graph),gates=source.nodes.filter(n=>!['INPUT','OUTPUT'].includes(n.type));
  if(target==='NOR'||target==='NAND'){if(gates.length<2||gates.some(n=>!['AND','OR','NOT'].includes(n.type)))return null;}
  else if(!gates.length||gates.some(n=>n.type!=='NAND')||(target==='XOR'&&gates.length!==4))return null;
  const inputs=source.nodes.filter(n=>n.type==='INPUT'),outputs=source.nodes.filter(n=>n.type==='OUTPUT');if(inputs.length!==(target==='NOT'?1:2)||outputs.length!==1||inputs.some(n=>(n.width||1)!==1))return null;
  const rows=[];
  for(let bits=0;bits<2**inputs.length;bits++){
   const values=Object.fromEntries(inputs.map((n,i)=>[n.id,(bits>>i)&1])),[a,b]=inputs.map(n=>values[n.id]),expected=target==='NOT'?1-a:target==='NOR'?Number(!(a||b)):target==='NAND'?Number(!(a&&b)):target==='AND'?(a&b):target==='XOR'?(a^b):(a|b),actual=evaluate(source,values).outputs[outputs[0].id];
   if(actual!==expected)return null;rows.push({inputs:values,actual,expected});
  }
  return {componentId:target,source,rows,signature:functionalSignature(graph),leafInstanceIds:[...new Set(gates.map(n=>n.instanceId||n.fabricatedId).filter(Boolean))].sort(),portMap:{inputs:inputs.map(n=>n.id),outputs:outputs.map(n=>n.id)}};
 }catch{return null;}
}
// These live milestones build the complete adder from gates, rather than reuse a packaged adder.
function recognizeAdder(puzzleId,graph){
 try{
  const source=activeSource(graph),full=puzzleId==='trajectory',componentId=full?'FA1':'HA1',keys=full?['A','B','I']:['A','B'],gates=source.nodes.filter(n=>!['INPUT','OUTPUT'].includes(n.type));
  const inputs=source.nodes.filter(n=>n.type==='INPUT'),outputs=source.nodes.filter(n=>n.type==='OUTPUT');
  if(gates.length<2||gates.some(n=>!['AND','OR','NOT','NAND','NOR','XOR','XNOR'].includes(n.type))||inputs.length!==keys.length||inputs.some(n=>!keys.includes(n.id)||(n.width||1)!==1)||outputs.length!==2||outputs.some(n=>!['S','C'].includes(n.id)||(n.width||1)!==1))return null;
  const rows=[];
  for(let bits=0;bits<2**keys.length;bits++){
   const values=Object.fromEntries(keys.map((key,i)=>[key,(bits>>i)&1])),sum=values.A+values.B+(values.I||0),expected={S:sum&1,C:sum>>1},actual=evaluate(source,values).outputs;
   if(actual.S!==expected.S||actual.C!==expected.C)return null;rows.push({inputs:values,actual,expected});
  }
  return {componentId,source,rows,signature:functionalSignature(graph),leafInstanceIds:[...new Set(gates.map(n=>n.instanceId).filter(Boolean))].sort(),portMap:{inputs:keys,outputs:['S','C']}};
 }catch{return null;}
}
/** Called only after trusted repair validation and ownership installation, within Apply. */
export function certifyConstruction(w,puzzleId,transactionId,{previouslyApplied=false}={}){
 const proof=recognizeConstruction(puzzleId,w.circuits[puzzleId]);if(!proof)return [];
 const f=w.foundation,id=proof.componentId,prior=f.components.certified[id],first=!f.components.discovered[id]&&(!f.components.introduced?.[id]||id==='XOR');
 const {source,...evidence}=proof;
 const certificate={...evidence,activeNodeIds:source.nodes.map(n=>n.id),version:1,contentVersion:f.circuits[puzzleId].contentVersion,validatorVersion:f.circuits[puzzleId].validatorVersion,sourcePuzzleId:puzzleId,transactionId,active:true,provenance:f.demoMode?'demo':f.earlyCurriculum?'early-curriculum':f.inventoryPilot?'inventory-pilot':'compatibility',manufacturing:false,sourceGraph:structuredClone(w.circuits[puzzleId])};
 // Packaging is an inspectable casing around the same source and leaves, never another item.
 certificate.package={componentId:id,leafInstanceIds:proof.leafInstanceIds,owner:'machine:'+puzzleId,sourceSignature:proof.signature};
 f.components.certified[id]=certificate;
 if(!f.components.discovered[id])f.components.discovered[id]={componentId:id,kind:'construction',transactionId,sourcePuzzleId:puzzleId,equation:COMPONENTS[id].equation};
 unlockConstructionBlueprint(w,id,transactionId);
 const events=[];if(!prior||prior.signature!==proof.signature||!prior.active)events.push({type:'component.certified',parameters:{componentId:id,sourcePuzzleId:puzzleId,sourceSignature:proof.signature}});
 if(first&&!previouslyApplied&&NEW_GATE_MILESTONES[puzzleId]===id)events.push({type:'component.discovered',parameters:{componentId:id,sourcePuzzleId:puzzleId,sourceSignature:proof.signature,leafInstanceIds:proof.leafInstanceIds}});
 return events;
}
export function invalidateComponentSource(w,puzzleId){for(const c of Object.values(w.foundation.components.certified))if(c?.sourcePuzzleId===puzzleId)c.active=false;}
export function restoreComponentEvidence(w){
 const f=w.foundation,plain=v=>v&&typeof v==='object'&&!Array.isArray(v),saved=f.components;f.components={introduced:plain(saved?.introduced)?saved.introduced:{},discovered:plain(saved?.discovered)?saved.discovered:{},certified:plain(saved?.certified)?saved.certified:{}};
 for(const [id,d]of Object.entries(f.components.discovered))if(validIntroduction(d,w)){f.components.introduced[id]??=d;delete f.components.discovered[id];}
 for(const [id,d]of Object.entries(f.components.introduced))if(!COMPONENTS[id]||!validIntroduction(d,w)||d.componentId!==id)delete f.components.introduced[id];
 for(const [id,c]of Object.entries(f.components.certified||{})){
  const proof=c&&recognizeConstruction(c.sourcePuzzleId,c.sourceGraph);
  if(!COMPONENTS[id]||c.version!==1||typeof c.transactionId!=='string'||!proof||proof.componentId!==id||proof.signature!==c.signature){delete f.components.certified[id];delete f.components.discovered[id];continue;}
  const meta=f.circuits[c.sourcePuzzleId];c.active=!!w.machines[c.sourcePuzzleId]?.certified&&functionalSignature(w.circuits[c.sourcePuzzleId])===c.signature&&f.applications[c.sourcePuzzleId]?.transactionId===c.transactionId&&c.contentVersion===meta?.contentVersion&&c.validatorVersion===meta?.validatorVersion;
  delete c.source;c.activeNodeIds=proof.source.nodes.map(n=>n.id);c.manufacturing=false;c.leafInstanceIds=proof.leafInstanceIds;c.package={componentId:id,leafInstanceIds:proof.leafInstanceIds,owner:'machine:'+c.sourcePuzzleId,sourceSignature:c.signature};
 }
 for(const id of Object.keys(f.components.discovered||{}))if(!COMPONENTS[id]||!f.components.certified[id])delete f.components.discovered[id];
}
export function discoverySnapshot(w,event){
 const id=event?.parameters?.componentId,c=w.foundation.components.certified[id],d=w.foundation.components.discovered[id];
 if(event?.type!=='component.discovered'||!d||!c||d.transactionId!==event.transactionId||NEW_GATE_MILESTONES[d.sourcePuzzleId]!==id||c.sourcePuzzleId!==d.sourcePuzzleId)return null;
 if(c.signature!==event.parameters.sourceSignature||recognizeConstruction(c.sourcePuzzleId,c.sourceGraph)?.signature!==c.signature)return null;
 return structuredClone({eventId:event.eventId,componentId:id,sourcePuzzleId:d.sourcePuzzleId,name:COMPONENTS[id].name,equation:COMPONENTS[id].equation,description:componentLesson(id)?.explanation||FUNCTIONS[id],source:activeSource(c.sourceGraph),leafInstanceIds:c.leafInstanceIds,sourceSignature:c.signature});
}

export function getCertifiedDesign(w,id){
 const c=w.foundation.components.certified[id],meta=c&&w.foundation.circuits[c.sourcePuzzleId];if(!c?.active||c.contentVersion!==meta?.contentVersion||c.validatorVersion!==meta?.validatorVersion||recognizeConstruction(c.sourcePuzzleId,c.sourceGraph)?.signature!==c.signature)return null;
 return structuredClone(c);
}
