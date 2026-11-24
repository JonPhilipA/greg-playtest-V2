import {recognizeConstruction} from './components.js';
import {validateComparator} from './gallery-puzzles.js';
import {isEarly,serviceState} from './curriculum-profile.js';
import {functionalSignature} from './circuit-revision.js';
import {REPAIRS} from './repairs.js';
import {testCircuit} from './validator.js';
import {validateInventory,FINITE_PICKUPS} from './inventory.js';
export const FABRICATION_TYPES=Object.freeze(['NAND','NOT','AND','OR','NOR','XOR','XNOR','DFF','MUX4','ADD4','XOR4','FAN4','ADD4C','FA1','NOT4']);
const firstEight=['ventilation','security','alarm','scrubber','safetycutoff','nandnot','nandand','nandor'];
const demand=(ok,message)=>{if(!ok)throw Error(message);};
export function fabricationEligible(w){
 for(const [id,count]of [['nandnot',1],['nandand',2],['nandor',3]]){
  const graph=w.circuits[id],meta=w.foundation.circuits[id],proof=w.foundation.applications[id],gates=graph?.nodes.filter(n=>!n.fixed)||[];
  if(!w.machines[id]?.certified||!proof||proof.signature!==functionalSignature(graph)||proof.signature!==meta.signature||!testCircuit(REPAIRS[id],graph).pass)return false;
  if(isEarly(w)&&(!validateInventory(w.foundation.inventory).ok||gates.length!==count||gates.some(n=>n.type!=='NAND'||!FINITE_PICKUPS['workshop.nand-cache'].includes(n.instanceId)||w.foundation.inventory.instances[n.instanceId]?.owner.kind!=='installed'||w.foundation.inventory.instances[n.instanceId]?.owner.puzzleId!==id)))return false;
 }
 return !isEarly(w)||serviceState(w)?.applied===true;
}
export const FABRICATION_MILESTONES=Object.freeze({NOT:{source:'nandnot'},AND:{source:'nandand'},OR:{source:'nandor'},NOR:{source:'scrubber',blueprint:'bp.gate.nor'},NAND:{source:'safetycutoff',blueprint:'bp.gate.nand'},XOR:{source:'xorfab',blueprint:'bp.gate.xor'}});
export function fabricationUnlocked(w,type){
 if(type==='NOT4')return w.machines.twos_complement?.certified===true&&fabricationUnlocked(w,'NOT');
 if(type==='ADD4C'&&!w.machines.ripple_adder?.certified&&!w.foundation.curriculum.rippleLegacy)return false;
 if(['FA1','FAN4','ADD4C','XOR4'].includes(type)){if(!w.machines.trajectory?.certified)return false;const source=type==='XOR4'?'xorfab':'trajectory',key=type==='XOR4'?'XOR':'FA1',c=w.foundation.components.certified[key];return !!c?.active&&w.machines[source]?.certified===true&&w.foundation.applications[source]?.transactionId===c.transactionId&&recognizeConstruction(source,c.sourceGraph)?.componentId===key;}
 const rule=FABRICATION_MILESTONES[type],f=w.foundation,c=f.components.certified[type],d=f.components.discovered[type];if(!rule||!c||!d||c.sourcePuzzleId!==rule.source||c.transactionId!==d.transactionId||f.applications[rule.source]?.transactionId!==c.transactionId||!w.machines[rule.source]?.certified)return false;
 const proof=recognizeConstruction(c.sourcePuzzleId,c.sourceGraph);return !!proof&&proof.componentId===type&&proof.signature===c.signature&&(!rule.blueprint||f.blueprints.acquired[rule.blueprint]?.transactionId===c.transactionId);
}
export const fabricationTypes=w=>FABRICATION_TYPES.filter(type=>fabricationUnlocked(w,type));
export const fabricatorActive=w=>w.foundation.fabrication?.version===1&&w.foundation.fabrication.nand===true;
export const AUTOMATIC_SUPPLY_TARGET=100;
export const automaticSupplyActive=w=>fabricatorActive(w)&&w.foundation.fabrication.autoSupply?.version===1&&w.foundation.fabrication.autoSupply.target===AUTOMATIC_SUPPLY_TARGET&&!w.saveProtection?.blocked&&fabricationEligible(w);
export const automaticallySupplied=(w,type)=>automaticSupplyActive(w)&&fabricationUnlocked(w,type);
/** A replenishing reserve is a capability, not a hundred unused hardware records. */
export const manufacturedSupply=(w,type)=>Math.max(fabricatedAvailable(w,type).length,automaticallySupplied(w,type)?(type==='FA1'?4:type==='NOT4'?1:AUTOMATIC_SUPPLY_TARGET):0);
export function ensureAutomaticSupply(w,transactionId){
 if(!fabricationEligible(w))return {activated:false};
 const f=w.foundation.fabrication;
 if(!fabricatorActive(w)){
  demand(f.version===undefined&&!Object.keys(f.instances||{}).length&&!Object.keys(f.receipts||{}).length,'Existing manufactured hardware needs recovery.');
  Object.assign(f,{version:1,nand:true,activatedBy:transactionId,serial:0,instances:{},receipts:{}});
 }
 if(f.autoSupply){validateFabrication(w);return {activated:false};}
 f.autoSupply={version:1,target:AUTOMATIC_SUPPLY_TARGET,activatedBy:transactionId};
 w.foundation.curriculum.catchUp.fabrication={required:false,missing:[],grantsEntitlement:true};
 validateFabrication(w);return {activated:true};
}
export const usesFabricatedInventory=(w,id)=>fabricatorActive(w)&&!!REPAIRS[id]&&!firstEight.includes(id)&&id!=='sensordiff'&&(isEarly(w)||w.circuits[id]?.nodes.some(n=>n.fabricatedId));
export const fabricatedAvailable=(w,type)=>Object.values(w.foundation.fabrication?.instances||{}).filter(g=>g.owner.kind==='bag'&&(!type||g.componentType===type));
export function validateFabrication(w){
 const f=w.foundation.fabrication;if(f?.version===undefined)return true;demand(f.version===1,'Unsupported fabrication inventory version.');
 demand(f.nand===true&&fabricationEligible(w),'The fabricator has no valid Workshop authorization.');
 if(f.autoSupply)demand(f.autoSupply.version===1&&f.autoSupply.target===AUTOMATIC_SUPPLY_TARGET&&typeof f.autoSupply.activatedBy==='string','Unsupported automatic supply metadata.');
 demand(Number.isSafeInteger(f.serial)&&f.serial>=0&&f.serial<=(f.autoSupply?16384:4096)&&f.instances&&typeof f.instances==='object'&&!Array.isArray(f.instances)&&f.receipts&&typeof f.receipts==='object'&&!Array.isArray(f.receipts),'Malformed fabrication inventory.');
 demand(Object.keys(f.instances).length===f.serial,'Fabricated instance sequence is incomplete.');
 const claims=new Set();
 for(let n=1;n<=f.serial;n++){
  const id='fabricated.'+n,g=f.instances[id],o=g?.owner;
  demand(g?.id===id&&FABRICATION_TYPES.includes(g.componentType)&&g.source==='workshop.fabricator'&&typeof g.transactionId==='string'&&o,'Invalid manufactured provenance.');
  demand(['bag','draft','installed'].includes(o.kind),'Unknown manufactured owner.');
  demand(Object.keys(o).length===(o.kind==='bag'?1:o.kind==='draft'?3:4),'Conflicting manufactured ownership fields.');
  if(o.kind!=='bag'){
   const key=o.puzzleId+':'+o.nodeId,node=w.circuits[o.puzzleId]?.nodes.find(n=>n.id===o.nodeId);
   demand(!claims.has(key)&&!firstEight.includes(o.puzzleId)&&node?.fabricatedId===id&&node.type===g.componentType,'Manufactured ownership/graph mismatch.');claims.add(key);
   if(o.kind==='installed')demand(w.machines[o.puzzleId]?.certified&&w.foundation.applications[o.puzzleId]?.transactionId===o.transactionId,'Manufactured installation has no valid certificate.');
  }
 }
 for(const [puzzleId,c]of Object.entries(w.circuits))for(const node of c.nodes.filter(n=>n.fabricatedId)){const g=f.instances[node.fabricatedId];demand(g&&g.owner.kind!=='bag'&&g.owner.puzzleId===puzzleId&&g.owner.nodeId===node.id&&g.componentType===node.type,'Foreign manufactured circuit claim.');}
 const batches=new Set();for(const [key,r]of Object.entries(f.receipts)){demand(/^[\w.:-]{1,100}$/.test(key)&&r&&typeof r.transactionId==='string'&&FABRICATION_TYPES.includes(r.type)&&Array.isArray(r.ids)&&r.ids.length>0&&r.ids.every(id=>f.instances[id]?.componentType===r.type&&f.instances[id].transactionId===r.transactionId),'Invalid fabrication receipt.');for(const id of r.ids){demand(!batches.has(id),'A manufactured instance belongs to two batches.');batches.add(id);}}
 demand(batches.size===f.serial,'A manufactured instance has no production receipt.');
 return true;
}
export function fabricationCommand(w,c,transactionId){
 demand(!w.saveProtection?.blocked,'Recover the protected notebook before manufacturing.');
 demand(w.room==='relay'&&w.nandEvent?.elapsed>=2.6,'Use the actual Workshop fabricator after emergency stabilization.');
 demand(fabricationEligible(w),'Complete and install all three NAND-only controllers first.');
 if(c.type==='ACTIVATE_FABRICATOR'){
  if(fabricatorActive(w)){validateFabrication(w);return {duplicate:true};}
  return ensureAutomaticSupply(w,transactionId);
 }
 demand(fabricatorActive(w),'Activate the authorized fabricator first.');validateFabrication(w);
 const f=w.foundation.fabrication;
 demand(typeof c.requestId==='string'&&/^[\w.:-]{1,100}$/.test(c.requestId)&&!['constructor','prototype','__proto__'].includes(c.requestId),'A unique fabrication request ID is required.');
 demand(FABRICATION_TYPES.includes(c.componentType)&&Number.isInteger(c.quantity)&&c.quantity>=1&&c.quantity<=12,'Select a supported component and a quantity from 1 to 12.');
 const prior=Object.hasOwn(f.receipts,c.requestId)?f.receipts[c.requestId]:null;if(prior){demand(prior.type===c.componentType&&prior.ids.length===c.quantity,'This request belongs to a different fabrication batch.');return {duplicate:true,created:[...prior.ids]};}
 demand(fabricationUnlocked(w,c.componentType),'Blueprint not unlocked. Continue repairing the KESTREL to unlock this design.');
 demand(f.serial+c.quantity<=4096,'The notebook component limit has been reached.');
 const ids=[];for(let i=0;i<c.quantity;i++){const id='fabricated.'+(++f.serial);f.instances[id]={id,componentType:c.componentType,source:'workshop.fabricator',transactionId,owner:{kind:'bag'}};ids.push(id);}
 f.receipts[c.requestId]={type:c.componentType,ids,transactionId};validateFabrication(w);return {created:ids,componentType:c.componentType};
}
export function reconcileFabricatedEdit(w,id,graph,transactionId){
 if(isEarly(w)&&id==='sensordiff'&&w.foundation.curriculum.xorUseVersion!==1){validateComparator(graph);demand(!w.machines[id].certified||functionalSignature(w.circuits[id])===functionalSignature(graph),'Installed comparator routing is protected.');return;}
 if(!usesFabricatedInventory(w,id))return;
 validateFabrication(w);const before=w.circuits[id],f=w.foundation.fabrication,changed=functionalSignature(before)!==functionalSignature(graph);
 demand(!w.machines[id].certified||!changed,'Installed manufactured hardware is protected. You may move it without changing its wiring.');
 for(const old of before.nodes.filter(n=>n.fabricatedId))if(!graph.nodes.some(n=>n.id===old.id)){const g=f.instances[old.fabricatedId];demand(g.owner.kind==='draft','Installed manufactured hardware cannot be returned.');g.owner={kind:'bag'};}
 for(const node of graph.nodes.filter(n=>!n.fixed&&!n.rippleRole)){
  const old=before.nodes.find(n=>n.id===node.id);
  if(old){demand(node.fabricatedId===old.fabricatedId&&node.type===old.type,'A manufactured module cannot change identity or type.');continue;}
  demand(!node.fabricatedId&&!node.instanceId&&!node.faulty&&!node.heritageProp&&REPAIRS[id].gates.includes(node.type),'New fabricated module metadata is invalid.');
  let g=fabricatedAvailable(w,node.type)[0];
  if(!g&&automaticallySupplied(w,node.type)){
   demand(typeof transactionId==='string'&&f.serial<16384,'The manufactured identity ledger needs recovery.');
   const partId='fabricated.'+(++f.serial);g={id:partId,componentType:node.type,source:'workshop.fabricator',transactionId,owner:{kind:'bag'}};
   f.instances[partId]=g;f.receipts['auto-'+partId]={type:node.type,ids:[partId],transactionId};
  }
  demand(g,'No owned '+node.type+' module is available. Its construction blueprint must be unlocked before automatic supply.');g.owner={kind:'draft',puzzleId:id,nodeId:node.id};node.fabricatedId=g.id;
 }
}
export function installFabricated(w,id,transactionId){
 if(!usesFabricatedInventory(w,id))return;
 for(const node of w.circuits[id].nodes.filter(n=>n.fabricatedId)){const g=w.foundation.fabrication.instances[node.fabricatedId];demand(g?.owner.kind==='draft'||g?.owner.kind==='installed','The manufactured module is not reserved.');g.owner={kind:'installed',puzzleId:id,nodeId:node.id,transactionId};}
 validateFabrication(w);
}
export function restoreFabrication(w){
 try{validateFabrication(w);ensureAutomaticSupply(w,'restore-p08-'+w.foundation.applications.nandor?.transactionId);if(fabricatorActive(w))w.foundation.curriculum.catchUp.fabrication={required:false,missing:[],grantsEntitlement:true};}catch(error){w.loadIssue=error.message;w.saveProtection={blocked:true,message:error.message};}
}

