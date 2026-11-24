import {gardenExitPhase} from './garden-exit.js';
import {GALLERY_IDS,initializeGallery,validateComparator} from './gallery-puzzles.js';
import {validatePilotBindings} from './inventory-gameplay.js';
import {SERVICE_ID,EARLY_IDS,isEarly,serviceState,servicePending,taskId,editableGraph} from './curriculum-profile.js';
import {REPAIRS} from './repairs.js';
import {createCircuit} from './puzzles.js';
import {testCircuit} from './validator.js';
import {evaluate} from './simulator.js';
import {functionalSignature} from './circuit-revision.js';
import {reduceInventory,retireScrubberHardware,FINITE_PICKUPS,validateInventory} from './inventory.js';
import {recognizeConstruction} from './components.js';

export const DEMORGAN_HINTS=Object.freeze([
 'The original controller only activates when neither inhibit signal is present. What must each input look like before an AND gate could reproduce that behavior?',
 'Try reversing the two inputs individually before combining them.',
 'Connect TOXIC and SERVICE to separate NOT gates. Feed both inverted signals into AND, then connect AND to SCRUB.'
]);
export const DEMORGAN_IDENTITY='NOT (A OR B) = (NOT A) AND (NOT B)';
export const DEMORGAN_COUNTERPART='NOT(A AND B) = NOT(A) OR NOT(B)';
export const SCRUBBER_PARTS_MESSAGES=Object.freeze([
 "Well, that's inconvenient. These aren't the same components that broke.",
 "We have two NOT gates and an AND gate, but the original circuit used an OR and a NOT.",
 "I bet there's a way to make these do the exact same thing. I just can't remember how..."
]);
export const DEMORGAN_INTRO_MESSAGES=SCRUBBER_PARTS_MESSAGES;
export const DEMORGAN_COMPLETION_MESSAGES=Object.freeze([
 "Oh! It's coming back to me. That's De Morgan's Law!",
 "It says that NOT (A OR B) is the same as (NOT A) AND (NOT B).",
 "So instead of combining the warnings with OR and then inverting the result, we inverted each warning first and combined them with AND.",
 "Different components. Same behavior. Nice work!"
]);
const requireThat=(ok,text)=>{if(!ok)throw Error(text);};
export function panelSpec(w,id){
 const base=REPAIRS[id];if(!isEarly(w))return base;
 if(id==='security')return {...base,problem:'Build the bulkhead interlock on the empty panel. OPEN must be 1 only when AUTH and SAFE are both 1.',hints:['Both permissions must be HIGH together. Which gate requires both inputs?','Place AND. Connect AUTH and SAFE to its left pins; connect its right output to OPEN.','AUTH comes from restored engineering power. SAFE comes from the real pressure sensor. The test switches let you check all four combinations.']};
 if(id==='sensordiff'&&w.foundation.curriculum.xorUseVersion!==1)return {...base,gates:[],problem:'The existing XOR comparator has an extra inversion on one sensor. Remove that inversion and reconnect the original sensors.',hints:['Matching readings must keep the warning OFF; different readings must turn it ON.','Trace the extra NOT on SENSOR A. The installed comparator remains protected.','Remove the stray NOT and connect both sensors directly to the existing XOR comparator.']};
 if(id==='scrubber'&&serviceState(w)?.triggered)return {...base,title:'Scrubber controller — emergency repair',gates:['NOT','AND'],spec:'ORIGINAL FUNCTION: NOR · REPLACEMENTS: NOT ×2, AND ×1',problem:'Reproduce the original controller’s behavior using the emergency hardware.',hints:DEMORGAN_HINTS};
 if(id==='scrubber')return {...base,gates:['OR','NOT'],hints:['The scrubber runs only when neither inhibit is present.','Combine both inhibits with OR, then invert the result.','Wire TOXIC and SERVICE to OR. Connect OR to NOT, then NOT to SCRUB.']};
 return base;
}
/** Only the untouched, obsolete P02 prop may be cleared from an older curriculum save. */
export function bulkheadStarterCleanup(w){
 if(!isEarly(w)||w.machines.security?.certified)return null;
 const c=w.circuits.security,gates=c.nodes.filter(n=>!n.fixed),gate=gates[0];
 if(gates.length!==1||gate.id!=='damaged'||gate.type!=='OR'||!gate.faulty||!gate.heritageProp||gate.instanceId||gate.equipment)return null;
 const wires=[['old-a','A','damaged',0],['old-b','B','damaged',1],['old-y','damaged','Y',0]];
 if(c.nodes.length!==4||c.wires.length!==3||!wires.every(([id,from,to,input])=>c.wires.some(q=>q.id===id&&q.from===from&&q.to===to&&q.out===0&&q.in===input)))return null;
 const graph=structuredClone(c);graph.nodes=graph.nodes.filter(n=>n.fixed);graph.wires=[];return graph;
}
export function initializeEarly(w){
 w.foundation.curriculum.xorUseVersion=1;
 w.foundation.earlyCurriculum={version:1,compatibility:'first-five-and-existing-workshop-adapter'};
 initializeGallery(w);for(const id of GALLERY_IDS)w.foundation.circuits[id]={functionalRevision:0,signature:functionalSignature(w.circuits[id]),contentVersion:['firewall','adc_precision','log_overflow'].includes(id)?2:1,validatorVersion:['firewall','adc_precision','log_overflow'].includes(id)?2:1};
 w.sensors.airflow=1;w.sensors.coolant=1;w.sensors.toxic=0;w.sensors.scrubberService=0;
 w.foundation.services={};reduceInventory(w,{type:'InitializeInventory'});
 w.circuits.security=createCircuit(REPAIRS.security);
 const p=REPAIRS.safetycutoff;w.circuits.safetycutoff=createCircuit(p);w.machines.safetycutoff={certified:false,status:'off',output:0,outputs:{}};w.foundation.circuits.safetycutoff={signature:functionalSignature(w.circuits.safetycutoff),functionalRevision:0,contentVersion:1,validatorVersion:1};
 for(const id of EARLY_IDS){for(const n of w.circuits[id].nodes.filter(n=>!n.fixed)){n.faulty=true;n.heritageProp=true;}w.foundation.circuits[id].signature=functionalSignature(w.circuits[id]);}
 for(const id of ['nandnot','nandand','nandor'])for(const n of w.circuits[id].nodes.filter(n=>!n.fixed))n.heritageProp=true;
 return w;
}
function contributingIds(graph){
 const found=new Set(),visiting=new Set();function visit(id){if(found.has(id))return;requireThat(!visiting.has(id),'Combinational feedback is not permitted.');visiting.add(id);for(const w of graph.wires.filter(w=>w.to===id))visit(w.from);visiting.delete(id);found.add(id);}for(const n of graph.nodes.filter(n=>n.type==='OUTPUT'))visit(n.id);return found;
}
export function checkEarlyCircuit(w,id,graph=editableGraph(w,id)){
 const spec=panelSpec(w,id),checked=testCircuit(spec,graph);if(!checked.pass)return checked;
 try{
  if(isEarly(w)&&id==='sensordiff'){if(w.foundation.curriculum.xorUseVersion===1){validatePilotBindings(w,id);const gates=graph.nodes.filter(n=>!n.fixed);requireThat(gates.length===1&&gates[0].type==='XOR','Install the single recovered XOR gate in the sensor monitor.');}else validateComparator(graph);}
  if(isEarly(w)&&id==='xorfab'){const gates=graph.nodes.filter(n=>!n.fixed),active=contributingIds(graph);requireThat(gates.length===4&&gates.every(n=>n.type==='NAND'&&active.has(n.id)&&n.fabricatedId),'Construct XOR with exactly four contributing, legitimately manufactured NAND gates.');}
  if(isEarly(w)&&['scrubber','safetycutoff'].includes(id)){
   const service=id==='scrubber'&&serviceState(w)?.triggered,gates=graph.nodes.filter(n=>!n.fixed),active=contributingIds(graph),types=gates.map(n=>n.type).sort();
   const needed=service?['AND','NOT','NOT']:id==='scrubber'?['NOT','OR']:['AND','NOT'];
   requireThat(JSON.stringify(types)===JSON.stringify(needed.sort())&&gates.every(n=>active.has(n.id)),'Every permitted physical gate must contribute to the output; use the declared composition budget.');
   if(service)requireThat(gates.every(n=>FINITE_PICKUPS['garden.demorgan-kit'].includes(n.instanceId))&&new Set(gates.map(n=>n.instanceId)).size===3,'Use the three actual emergency-drawer instances.');
  }
  if(isEarly(w)&&['nandnot','nandand','nandor'].includes(id)){const gates=graph.nodes.filter(n=>!n.fixed),required={nandnot:1,nandand:2,nandor:3}[id],active=contributingIds(graph);requireThat(gates.length===required&&gates.every(n=>n.type==='NAND'&&active.has(n.id)),'Use exactly '+required+' physical NAND gates, all contributing to the output.');}
  return checked;
 }catch(e){return {...checked,pass:false,error:e.message};}
}
export function canBreakScrubber(w){return w.room==='life'&&gardenExitPhase(w)==='ready'&&w.positions.life>=1248;}
export function triggerBreakdown(w,transactionId){
 if(serviceState(w)?.triggered)return {duplicate:true};
 requireThat(canBreakScrubber(w),'Complete the finite repairs and Binary Data Decoder, then approach the Workshop exit.');
 const proof=recognizeConstruction('scrubber',w.circuits.scrubber);requireThat(proof?.componentId==='NOR'&&checkEarlyCircuit(w,'scrubber',w.circuits.scrubber).pass,'The original NOR source is not proven.');
 const original={graph:structuredClone(w.circuits.scrubber),certificate:structuredClone(w.foundation.components.certified.NOR),application:structuredClone(w.foundation.applications.scrubber),meta:structuredClone(w.foundation.circuits.scrubber)};
 const retired=retireScrubberHardware(w,transactionId);
 for(const n of w.circuits.scrubber.nodes)if(retired.includes(n.instanceId))n.faulty=true;
 const draft=createCircuit({...REPAIRS.scrubber,gates:['NOT','AND']});
 w.foundation.services??={};w.foundation.services[SERVICE_ID]={version:1,triggered:true,failureTransaction:transactionId,failureAnnounced:false,cinematicVersion:1,drawerCollected:false,built:false,validated:false,applied:false,explanationPresented:false,hintIndex:0,original,draft,meta:{signature:functionalSignature(draft),functionalRevision:0},ticket:null,application:null,certificate:null};
 w.foundation.components.certified.NOR.active=false;w.foundation.components.certified.NOR.historical=true;
 w.machines.scrubber={...w.machines.scrubber,certified:false,status:'hardware-fault',output:0,outputs:{Y:0}};w.foundation.curriculum.completed.scrubber=true;
 return {retired};
}
export function serviceCommand(w,c,tx,runtime){
 const s=serviceState(w);requireThat(isEarly(w)&&s?.triggered,'Inspect the failed scrubber first.');
 if(c.type==='ACK_SERVICE_WARNING'){if(s.failureAnnounced)return {duplicate:true};s.failureAnnounced=true;return {};}
 if(c.type==='INSPECT_SERVICE_CIRCUIT'){requireThat(w.room==='life'&&!s.applied,'Inspect the damaged scrubber in the Garden.');if(s.circuitInspected)return {duplicate:true};s.circuitInspected=true;return {};}
 if(c.type==='START_SERVICE_REPLACEMENT'){requireThat(w.room==='life'&&!s.applied&&s.circuitInspected&&s.drawerCollected,'Inspect the damaged controller and collect the emergency parts first.');if(s.replacementStarted)return {duplicate:true};s.replacementStarted=true;return {};}
 if(c.type==='SERVICE_HINT'){w.foundation.hintUsage??={version:0,revealed:{}};w.foundation.hintUsage.revealed[SERVICE_ID]=true;const hint=DEMORGAN_HINTS[Math.min(s.hintIndex,2)];s.hintIndex=Math.min(3,s.hintIndex+1);return {hint};}
 if(c.type==='ACK_DEMORGAN'){requireThat(s.applied&&s.certificate,'Build and apply the equivalent controller first.');s.explanationPresented=true;s.discoveryPending=false;w.foundation.curriculum.concepts.demorgan=true;w.foundation.curriculum.workshopReferences={...(w.foundation.curriculum.workshopReferences||{}),nandor:{lesson:SERVICE_ID,text:'Remember how we rebuilt the scrubber without the original components? An OR function from NAND gates uses the same equivalence idea.'}};return {};}
 if(c.type==='TEST_CIRCUIT'){
  const checked=checkEarlyCircuit(w,'scrubber');s.validated=checked.pass;
  if(checked.pass)s.ticket={signature:functionalSignature(editableGraph(w,'scrubber')),revision:s.meta.functionalRevision,validationId:tx+':service-validation'};else s.ticket=null;
  return {...checked,validationId:s.ticket?.validationId};
 }
 if(c.type==='APPLY_REPAIR'){
  if(s.applied)return {ok:true,duplicate:true,transactionId:s.application.transactionId};
  const graph=s.draft,signature=functionalSignature(graph);requireThat(s.ticket&&s.ticket.signature===signature&&s.ticket.revision===s.meta.functionalRevision&&(!c.validationId||c.validationId===s.ticket.validationId),'The service validation is stale. Test the current replacement.');
  requireThat(checkEarlyCircuit(w,'scrubber',graph).pass,'The replacement no longer matches NOR.');
  s.application={transactionId:tx,signature,validationId:s.ticket.validationId};runtime.installRepair(w,'scrubber',graph);
  s.certificate={version:1,sourceGraph:structuredClone(graph),signature,transactionId:tx,leafInstanceIds:[...FINITE_PICKUPS['garden.demorgan-kit']],originalSignature:functionalSignature(s.original.graph),rows:testCircuit(REPAIRS.scrubber,graph).rows,manufacturing:false};
  const owner=SERVICE_ID,draftId='pilot-'+owner;
  const installed=reduceInventory(w,{type:'InstallGate',puzzleId:owner,draftId,expectedDraftRevision:w.foundation.inventory.drafts[draftId]?.revision,requestId:tx+'-service-install'},runtime);
  s.applied=true;s.validated=true;s.built=true;s.discoveryPending=true;w.foundation.curriculum.completed.scrubber=true;
  return {ok:true,applied:true,installed:installed.installed,equivalence:true};
 }
 throw Error('Unknown service operation.');
}
export function serviceInstallProof(w,draft){
 const s=serviceState(w);if(draft.puzzleId!==SERVICE_ID||!s?.application||!s.certificate||!w.machines.scrubber.certified||s.application.signature!==functionalSignature(w.circuits.scrubber)||!checkEarlyCircuit(w,'scrubber',w.circuits.scrubber).pass)return null;
 const nodes=w.circuits.scrubber.nodes.filter(n=>!n.fixed);if(nodes.length!==3||nodes.some(n=>draft.nodes[n.id]?.instanceId!==n.instanceId))return null;
 return {certificateId:s.application.transactionId,draftRevision:draft.revision};
}
export function restoreEarlyState(w){
 if(!isEarly(w))return w;const s=serviceState(w);
 requireThat(validateInventory(w.foundation.inventory).ok,'The sixteen-part ledger needs recovery.');
 for(const id of [...EARLY_IDS,'nandnot','nandand','nandor',...(w.foundation.curriculum.xorUseVersion===1?['sensordiff']:[])]){
  validatePilotBindings(w,id,{allowProps:true});
  if(w.machines[id]?.certified&&!(id==='scrubber'&&s?.triggered)){requireThat(checkEarlyCircuit(w,id,w.circuits[id]).pass&&w.foundation.applications[id]?.signature===functionalSignature(w.circuits[id]),'A certified finite machine has no valid source proof.');for(const n of w.circuits[id].nodes.filter(n=>!n.fixed))requireThat(w.foundation.inventory.instances[n.instanceId]?.owner.kind==='installed','Certified hardware is not installed.');}
 }
 if(!s?.triggered)return w;
 requireThat(s.version===1&&w.machines.safetycutoff?.certified,'The service event has no legitimate NAND milestone.');
 const proof=recognizeConstruction('scrubber',s.original?.graph);
 requireThat(proof?.componentId==='NOR'&&JSON.stringify(proof.leafInstanceIds)===JSON.stringify(['finite.not.02','finite.or.02'])&&s.original.certificate.signature===proof.signature,'The original NOR evidence is missing.');
 for(const id of ['finite.not.02','finite.or.02']){const g=w.foundation.inventory.instances[id],n=s.original.graph.nodes.find(node=>node.instanceId===id);requireThat(g?.condition==='damaged'&&g.owner.kind==='retired'&&n?.id===g.owner.nodeId&&n.type===g.componentType,'Damaged scrubber ownership is inconsistent.');}
 w.foundation.components.certified.NOR={...structuredClone(s.original.certificate),active:false,historical:true,manufacturing:false};
 w.foundation.curriculum.completed.scrubber=true;
 s.drawerCollected=FINITE_PICKUPS['garden.demorgan-kit'].every(id=>w.foundation.inventory.pickups['garden.demorgan-kit'].includes(id));
 if(s.applied){
  const c=s.certificate;requireThat(c?.version===1&&c.signature===functionalSignature(w.circuits.scrubber)&&c.signature===functionalSignature(c.sourceGraph)&&s.application?.signature===c.signature&&w.foundation.inventory.installations[SERVICE_ID]?.certificateId===s.application.transactionId&&checkEarlyCircuit(w,'scrubber',w.circuits.scrubber).pass,'The applied service proof is invalid.');
  w.machines.scrubber.certified=true;
 }else{w.machines.scrubber.certified=false;w.machines.scrubber.status='hardware-fault';if(s.ticket?.signature!==functionalSignature(s.draft))s.ticket=null;s.validated=!!s.ticket;}
 return w;
}
