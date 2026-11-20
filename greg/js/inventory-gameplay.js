import {WORKSHOP_CACHE} from './workshop-layout.js';
import {fabricatedAvailable,usesFabricatedInventory,FABRICATION_TYPES,manufacturedSupply,fabricationTypes,automaticallySupplied} from './fabrication.js';
import {GARDEN_PICKUPS} from './exploration.js';
import {isEarly,SERVICE_ID,serviceState,taskId,editableGraph} from './curriculum-profile.js';
import {FINITE_GATES,FINITE_PICKUPS,FINITE_BUDGETS,GetAvailableGates,reduceInventory,validateInventory,recoverInventory} from './inventory.js';
import {functionalSignature} from './circuit-revision.js';
import {REPAIRS} from './repairs.js';
import {isEngineeringDemo} from './session-mode.js';

export const PILOT_PUZZLES=Object.freeze(['ventilation','security','alarm']);
export const isInventoryPilot=w=>w.foundation?.inventoryPilot?.version===1&&w.foundation.inventoryPilot.kind==='finite-p01-p03';
export const usesFiniteInventory=(w,id)=>(isEarly(w)&&['ventilation','security','alarm','scrubber','safetycutoff','nandnot','nandand','nandor'].includes(id))||(isEarly(w)&&id==='sensordiff'&&w.foundation.curriculum.xorUseVersion===1)||(isInventoryPilot(w)&&PILOT_PUZZLES.includes(id))||(isEngineeringDemo(w)&&id==='scrubber');
export const isPhysicalSession=w=>isEarly(w)||isInventoryPilot(w)||isEngineeringDemo(w);
export const pilotDraftId=id=>'pilot-'+id;
export const PICKUP_LOCATIONS=Object.freeze({
 'gallery.xor':{room:'sensors',name:'Loose XOR gate on the floor',x:145,y:193,w:42,h:30,walk:198},
 'engine.not':{room:'engine',name:'Red toolbox',x:23,y:177,w:41,h:31,walk:69},
 'corridor.and':{room:'corridor',name:'Outer supply cabinet',x:69,y:165,w:45,h:43,walk:112},
 'garden.or':{room:'life',name:'Loose OR gate · atmospheric monitor',...GARDEN_PICKUPS['garden.or']},
 'garden.nor-kit':{room:'life',name:'Filter service drawer',requires:'alarm',...GARDEN_PICKUPS['garden.nor-kit']},
 'garden.demorgan-kit':{room:'life',name:'Emergency electronics drawer',...GARDEN_PICKUPS['garden.demorgan-kit']},
 'garden.cutoff-kit':{room:'life',name:'Portable electronics case',requires:'scrubber',...GARDEN_PICKUPS['garden.cutoff-kit']},
 'workshop.nand-cache':{room:'relay',name:'Emergency spare-gate cabinet',...WORKSHOP_CACHE},
});
const check=(ok,message)=>{if(!ok)throw Error(message);};
export function pickupAvailability(w,id){
 const p=Object.hasOwn(PICKUP_LOCATIONS,id)?PICKUP_LOCATIONS[id]:null;
 if((!isInventoryPilot(w)&&!isEarly(w))||!p)return {ok:false,state:'unavailable',message:'Physical pickups are available only in the isolated inventory pilot.'};
 if(id==='gallery.xor'&&!w.foundation.inventory.pickups?.['gallery.xor'])return {ok:false,state:'unavailable',message:'This voyage uses the original installed comparator.'};
 if(id==='garden.demorgan-kit'&&(!isEarly(w)||!serviceState(w)?.triggered))return {ok:false,state:'locked',message:'This sealed drawer opens only during a scrubber hardware emergency.'};
 if(w.room!==p.room)return {ok:false,state:'unavailable',message:'Travel to the actual pickup first.'};
 if(p.requires&&!w.machines[p.requires]?.certified)return {ok:false,state:'locked',message:'Restore '+p.requires+' before opening this compartment.'};
 const remaining=FINITE_PICKUPS[id].filter(key=>w.foundation.inventory.instances[key]?.owner.kind==='world');
 return {ok:true,state:remaining.length?'available':'empty',remaining,message:remaining.length?'Components ready to collect.':'This compartment is empty.'};
}
export function inventoryRows(w,puzzleId){
 const i=w.foundation.inventory,policy=usesFiniteInventory(w,puzzleId)?FINITE_BUDGETS[taskId(w,puzzleId)]:null;
 const fabricated=Object.values(w.foundation.fabrication?.instances||{}),manufactured=usesFabricatedInventory(w,puzzleId);
 return [...new Set(['NOT','AND','OR','NAND',...fabricationTypes(w),...Object.values(i.instances||{}).map(g=>g.componentType),...fabricated.map(g=>g.componentType)])].map(type=>({type,available:GetAvailableGates(i,type).length+manufacturedSupply(w,type),automatic:automaticallySupplied(w,type),
  reserved:Object.values(i.instances||{}).filter(g=>g.componentType===type&&g.owner.kind==='draft').length+fabricated.filter(g=>g.componentType===type&&g.owner.kind==='draft').length,
  installed:Object.values(i.instances||{}).filter(g=>g.componentType===type&&g.owner.kind==='installed').length+fabricated.filter(g=>g.componentType===type&&g.owner.kind==='installed').length,
  permitted:manufactured?REPAIRS[puzzleId].gates.includes(type):!!policy?.[type],budget:policy?.[type]||0}));
}
export function initializePilot(w){
 reduceInventory(w,{type:'InitializeInventory'});
 w.foundation.inventoryPilot={version:1,kind:'finite-p01-p03'};
 for(const id of PILOT_PUZZLES)for(const node of w.circuits[id].nodes.filter(n=>!n.fixed)){node.faulty=true;node.heritageProp=true;}
 for(const id of PILOT_PUZZLES)w.foundation.circuits[id].signature=functionalSignature(w.circuits[id]);
 return w;
}
/** Reconcile the proposed graph and physical transfers inside the existing Edit transaction. */
export function reconcilePilotEdit(w,id,proposed,transactionId){
 if(!usesFiniteInventory(w,id))return [];
 const graph=editableGraph(w,id),ownerId=taskId(w,id),i=w.foundation.inventory;
 check(validateInventory(i).ok,'The physical ledger needs recovery.');
 const functional=functionalSignature(graph)!==functionalSignature(proposed);
 if(w.machines[id].certified&&functional)throw Error('Installed hardware is protected. Service removal stays locked until permanent safe routes are available. You may move modules without changing their wiring.');
 const ids=proposed.nodes.map(n=>n.id);check(new Set(ids).size===ids.length,'Duplicate circuit node ID.');
 const fixed=graph.nodes.filter(n=>n.fixed),nextFixed=proposed.nodes.filter(n=>n.fixed);
 check(functionalSignature({nodes:fixed,wires:[]})===functionalSignature({nodes:nextFixed,wires:[]})&&!nextFixed.some(n=>n.instanceId),'Fixed input/output fixtures must remain intact.');
 const events=[];let serial=0;
 const invoke=c=>reduceInventory(w,{requestId:transactionId+'-part-'+(++serial),...c});
 for(const old of graph.nodes.filter(n=>n.instanceId))if(!proposed.nodes.some(n=>n.id===old.id)){
  const g=i.instances[old.instanceId],o=g?.owner;
  check(o?.kind==='draft'&&o.puzzleId===ownerId,'Installed or foreign hardware cannot be returned as a draft.');
  invoke({type:'ReturnGate',instanceId:g.id,puzzleId:ownerId,draftId:o.draftId,nodeId:o.nodeId,token:o.token});events.push({type:'component.returned',instanceIds:[g.id]});
 }
 for(const node of proposed.nodes.filter(n=>!n.fixed)){
  const old=graph.nodes.find(n=>n.id===node.id);
  if(old?.instanceId){check(node.instanceId===old.instanceId&&node.type===old.type&&!node.faulty&&!node.heritageProp,'A physical node cannot change its instance or component type.');continue;}
  if(old?.heritageProp){check(node.type===old.type&&node.faulty===true&&node.heritageProp===true&&!node.instanceId,'A damaged chassis prop cannot become usable hardware.');continue;}
  check(!node.instanceId&&!node.heritageProp&&!node.faulty,'New nodes must reserve available physical hardware.');
  check(Object.hasOwn(FINITE_BUDGETS[ownerId],node.type),'This gate type is not permitted by the finite task budget.');
  const part=GetAvailableGates(i,node.type)[0];check(part,'No '+node.type+' gate is available. Collect its supply pickup or return a reserved gate.');
  invoke({type:'ReserveGate',instanceId:part.id,puzzleId:ownerId,draftId:pilotDraftId(ownerId),nodeId:node.id});node.instanceId=part.id;
  events.push({type:'component.placed',instanceIds:[part.id]});
 }
 // Bindings, including unchanged retained nodes, are verified before accepting the graph.
 validatePilotBindings(w,id,{allowProps:true,graph:proposed});
 return events;
}
export function validatePilotBindings(w,id,{allowProps=false,graph=editableGraph(w,id)}={}){
 if(!usesFiniteInventory(w,id))return true;
 check(validateInventory(w.foundation.inventory).ok,'The physical ledger needs recovery.');
 const ownerId=taskId(w,id),seen=new Set();
 const fixtures=[...REPAIRS[id].inputs,...REPAIRS[id].outputs],actual=graph.nodes.filter(n=>n.fixed);
 check(actual.length===fixtures.length&&fixtures.every(f=>actual.some(n=>n.id===f.id&&n.type===f.type&&(n.width||1)===f.width&&!n.instanceId)),'Only the original fixed input/output fixtures are allowed.');
 for(const node of graph.nodes.filter(n=>!n.fixed)){
  if(allowProps&&node.heritageProp&&(node.faulty||(isEarly(w)&&REPAIRS[id].originalGate&&!w.nandEvent.failed))&&!node.instanceId)continue;
  const g=w.foundation.inventory.instances[node.instanceId],o=g?.owner;
  check(g&&g.componentType===node.type&&!node.faulty&&!node.heritageProp&&['draft','installed'].includes(o?.kind)&&o.puzzleId===ownerId&&o.nodeId===node.id&&!seen.has(g.id),'Every usable gate must be backed by its own physical instance. Remove the damaged controller and use collected parts.');seen.add(g.id);
 }
 for(const g of Object.values(w.foundation.inventory.instances))if(['draft','installed'].includes(g.owner.kind)&&g.owner.puzzleId===ownerId)check(seen.has(g.id),'A physical reservation has no matching circuit node.');
 return true;
}
export function recoverPilotWorld(w){
 if(!isInventoryPilot(w))return w;
 try{
  const i=w.foundation.inventory;check(validateInventory(i).ok,'The pilot ledger needs recovery.');
  for(const g of Object.values(i.instances))if(g.owner.kind==='installed')check(PILOT_PUZZLES.includes(g.owner.puzzleId),'Only P01–P03 can own installed finite pilot hardware.');
  for(const g of Object.values(i.instances))if(g.owner.kind==='draft'){
   const o=g.owner;check(PILOT_PUZZLES.includes(o.puzzleId),'Only P01–P03 can own finite pilot drafts.');
   if(!w.circuits[o.puzzleId].nodes.some(n=>n.id===o.nodeId)){
    delete i.drafts[o.draftId].nodes[o.nodeId];
    w.circuits[o.puzzleId].wires=w.circuits[o.puzzleId].wires.filter(wire=>wire.from!==o.nodeId&&wire.to!==o.nodeId);
    const meta=w.foundation.circuits[o.puzzleId];meta.functionalRevision++;meta.signature=functionalSignature(w.circuits[o.puzzleId]);delete w.foundation.tested[o.puzzleId];
   }
  }
  const recovered=recoverInventory(i);w.foundation.inventory=recovered.inventory;check(!recovered.blocked,'The pilot ledger needs recovery.');
  for(const id of PILOT_PUZZLES){validatePilotBindings(w,id,{allowProps:true});if(Object.values(w.foundation.inventory.instances).some(g=>g.owner.kind==='installed'&&g.owner.puzzleId===id))check(w.machines[id].certified,'Installed pilot hardware has lost its machine certificate.');}
 }catch(e){w.loadIssue=e.message;w.saveProtection={blocked:true,message:e.message};}
 return w;
}
