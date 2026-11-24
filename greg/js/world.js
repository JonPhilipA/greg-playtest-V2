import {initializeArithmetic} from './arithmetic-curriculum.js';
import {converterSigned} from './twos-complement.js';
import {migrateGalleryRooms} from './gallery-room-migration.js';
import {initializeGallerySupply} from './inventory.js';
import {storedInteger,boundedMessage} from './gallery-data.js';
import {isDataConsole,decodeByte,pressureReading} from './data-consoles.js';
import {initializeOpening,corePowered} from './opening-state.js';
import {validateFabrication} from './fabrication.js';
import {isEarly,galleryEnabled,SERVICE_ID,CURRICULUM_SAVE_KEY,serviceState,taskId} from './curriculum-profile.js';
import {initializeEarly,serviceInstallProof,restoreEarlyState} from './garden-service.js';
import {evaluate,pulse} from './simulator.js';
import {testCircuit} from './validator.js';
import {REPAIRS,damagedCircuit,existingController} from './repairs.js';
import {migrateLegacySave} from './save-migration.js';
import {ALL_ROOM_IDS,CAMPAIGN_ROOMS,CAMPAIGN_ORDER,campaignRecord,canAdvance,repairedRoom,nandBusy,nandDoors} from './campaign.js';

import {executeCommand} from './commands.js';
import {createFoundation,SAVE_KEY,LEGACY_SAVE_KEY,ARCHIVE_SAVE_KEY,parseSnapshot} from './save-schema.js';
import {migrateSnapshot} from './migrations.js';
import {canTravelTo,puzzleAvailability} from './progression.js';
import {functionalSignature} from './circuit-revision.js';
import {hasInventoryLedger,validateInventory} from './inventory.js';
import {initializePilot,isInventoryPilot,recoverPilotWorld,validatePilotBindings} from './inventory-gameplay.js';
import {PILOT_SAVE_KEY,pilotSessionFor} from './inventory-session.js';
import {isEngineeringDemo} from './session-mode.js';
export {SAVE_KEY};
export {puzzleAvailability};
export function newWorld(){
  const w={
    schemaVersion:3,version:2,campaignRevision:4,nandEvent:{triggered:false,failed:false,elapsed:0,explained:false},room:'engine',discovered:['engine'],doors:{engine:false,security:false},
    machines:Object.fromEntries(Object.keys(REPAIRS).map(id=>[id,{status:'off',certified:false,output:0,outputs:{}}])),
    circuits:Object.fromEntries(Object.keys(REPAIRS).map(id=>[id,REPAIRS[id].originalGate?existingController(id):damagedCircuit(id)])),machineStates:{},
    sensors:{vent:'broken',authorization:'empty',pressure:'unread'},pressure:94,
    flags:[],dialogueSeen:[],items:[],logs:[],positions:Object.fromEntries(ALL_ROOM_IDS.map(id=>[id,id==='engine'?247:70])),
    muted:false,ending:null,reactorClock:0,
  };
  w.foundation=createFoundation(w.circuits,w.muted);return w;
}
export const newCurriculum=()=>{const w=initializeEarly(newWorld());initializeArithmetic(w,REPAIRS);return w;};
export const newRevisedCurriculum=()=>initializeOpening(newCurriculum());
export const newInventoryPilot=()=>initializePilot(newWorld());
export function flag(w,id){if(!w.flags.includes(id))w.flags.push(id);}
export const has=(w,id)=>w.flags.includes(id);
export function machineInputs(w,id){
  if(isEarly(w)&&id==='safetycutoff')return {A:Number(w.sensors.airflow!==0),B:Number(w.sensors.coolant!==0)};
  if(isEarly(w)&&id==='scrubber')return {A:Number(w.sensors.toxic===1),B:Number(w.sensors.scrubberService===1||w.machines.safetycutoff?.output===1)};
  if(id==='ventilation')return {A:0};
  if(id==='security')return {A:Number(w.machines.ventilation.certified),B:Number(w.pressure<45&&w.machines.ventilation.output===1)};
  if(id==='override'&&w.ending)return {E:1,R:Number(w.ending==='greg')};
  return {...REPAIRS[id].source};
}
function outputs(w,id,inputs,state){
  try{return evaluate(w.circuits[id],inputs||machineInputs(w,id),state||w.machineStates[id]||{}).outputs;}
  catch{return Object.fromEntries(REPAIRS[id].outputs.map(n=>[n.id,0]));}
}
export function circuitOutput(w,id,override){const result=outputs(w,id,override);return result.Y??result[REPAIRS[id].outputs[0].id]??0;}
export function updateWorld(w,dt,diagnostic=null){
  if(!corePowered(w))return w;
  if(w.room==='relay'&&w.nandEvent.triggered){
    w.nandEvent.elapsed=Math.min(3,w.nandEvent.elapsed+Math.min(dt,.5));
    if(w.nandEvent.elapsed>=1.5&&!w.nandEvent.failed){
      w.nandEvent.failed=true;
      for(const id of CAMPAIGN_ROOMS.relay.repairs)if(!w.machines[id].certified){w.circuits[id]=damagedCircuit(id);if(isEarly(w))for(const n of w.circuits[id].nodes.filter(n=>!n.fixed))n.heritageProp=true;w.machines[id].status='malfunctioning';}
    }
  }
  const v=w.machines.ventilation;v.output=v.certified?circuitOutput(w,'ventilation',diagnostic?.id==='ventilation'?diagnostic.inputs:null):0;
  const target=v.output?27:96;w.pressure=Math.max(0,Math.min(100,w.pressure+(target-w.pressure)*(1-Math.exp(-Math.min(dt,.5)*.7))));
  if(v.certified)v.status=v.output?'running':'repaired';
  if(v.output&&w.pressure<45){w.doors.engine=true;flag(w,'pressure_stable');}
  const s=w.machines.security;s.output=s.certified?circuitOutput(w,'security',diagnostic?.id==='security'?diagnostic.inputs:null):0;
  s.status=s.certified?(s.output?'running':'repaired'):s.status;w.doors.security=s.output===1;
  for(const id of Object.keys(w.machines).filter(id=>REPAIRS[id]&&!['ventilation','security'].includes(id)).sort((a,b)=>a==='safetycutoff'?-1:b==='safetycutoff'?1:0)){
    const m=w.machines[id],diag=diagnostic?.id===id;
    if(isDataConsole(id,w.circuits[id])){m.outputs={value:id==='twos_complement'?converterSigned(w.circuits[id].configuration.bits):id==='cryo_signed'?decodeByte(246,w.circuits[id].configuration.temperature==='signed'):id==='pressure_width'?pressureReading(300,w.circuits[id].configuration.width).stored:id==='firewall'?(182&w.circuits[id].configuration.isolateMask):id==='log_overflow'?storedInteger(260,w.circuits[id].configuration.type).value:boundedMessage(w.circuits[id].configuration.bytes)};m.output=m.certified?1:0;if(m.certified)m.status='running';continue;}
    if(id==='reactor'&&m.certified&&!diag){w.reactorClock+=Math.min(dt,.5);if(w.reactorClock>=.8){w.reactorClock-=.8;try{w.machineStates[id]=pulse(w.circuits[id],machineInputs(w,id),w.machineStates[id]||{}).state;}catch{}}}
    const beforeSurge=REPAIRS[id].originalGate&&w.room==='relay'&&w.nandEvent.triggered&&!w.nandEvent.failed;
    m.outputs=m.certified||beforeSurge?outputs(w,id,diag?diagnostic.inputs:null,diag?diagnostic.state:null):Object.fromEntries(REPAIRS[id].outputs.map(n=>[n.id,0]));
    m.output=m.outputs.Y??m.outputs[REPAIRS[id].outputs[0].id]??0;m.status=m.certified?'running':m.status;
  }
  return w;
}
function inspectRaw(w,id){flag(w,'inspected_'+id);if(id==='sensor')w.machines.ventilation.status=w.machines.ventilation.certified?w.machines.ventilation.status:'malfunctioning';if(id==='pressure')w.sensors.pressure=w.pressure<45?'safe':'danger';}
function takePassRaw(w){
  if(!w.machines.ventilation.certified||w.pressure>=45)return false;
  if(!w.items.includes('maintenance-pass')&&w.sensors.authorization!=='authorized')w.items.push('maintenance-pass');flag(w,'pass_taken');return true;
}
function authorizeRaw(w){if(w.sensors.authorization==='authorized')return true;if(!w.items.includes('maintenance-pass'))return false;w.items=w.items.filter(id=>id!=='maintenance-pass');w.sensors.authorization='authorized';flag(w,'pass_installed');return true;}
export const canTravel=(w,room)=>canTravelTo(w,room);
function enterRoomRaw(w,room){if(!canTravel(w,room))return false;w.room=room;if(room==='sensors'&&isEarly(w))initializeGallerySupply(w);if(!w.discovered.includes(room))w.discovered.push(room);flag(w,'entered_'+room);if(room==='relay'&&!w.nandEvent.triggered){w.nandEvent={triggered:true,failed:false,elapsed:0,explained:false};updateWorld(w,0);}return true;}
function invalidateRepair(w,id){
  w.machineStates[id]={};w.machines[id].certified=false;w.machines[id].status='malfunctioning';w.ending=null;updateWorld(w,0);
}
function installRepair(w,id,circuit){
  w.circuits[id]=structuredClone(circuit);w.machines[id].certified=true;w.machines[id].status='repaired';w.machineStates[id]={};
  if(id==='ventilation')w.sensors.vent='repaired';
  if(id==='memory'||id==='flightmemory')w.machineStates[id]=pulse(w.circuits[id],machineInputs(w,id),{}).state;
  flag(w,id+'_repaired');updateWorld(w,0);
}
function recoverLogRaw(w){if(!w.doors.security)return false;if(!w.logs.includes('override'))w.logs.push('override');flag(w,'log_recovered');flag(w,'chapter_complete');return true;}
function recoverRecordRaw(w,room=w.room){
  if(!CAMPAIGN_ROOMS[room]?.record||room!==w.room||!repairedRoom(w,room)||nandBusy(w))return false;
  const id=campaignRecord(room);if(!w.logs.includes(id))w.logs.push(id);flag(w,id);return true;
}
export function flightReady(w){return Object.values(w.machines).every(m=>m.certified);}
function engageFlightRaw(w,route){
  if(w.room!=='bridge'||!['manual','greg'].includes(route)||!flightReady(w))return false;
  const inputs={A:1,B:1,E:1,K:0,R:Number(route==='greg')};
  try{
    const r=pulse(w.circuits.flightmemory,inputs,w.machineStates.flightmemory||{}),authority=outputs(w,'override',{E:1,R:Number(route==='greg')});
    if(authority.T!==Number(route==='greg')||authority.M!==Number(route==='manual')||r.outputs.S!==0||r.outputs.C!==1)return false;
    w.machineStates.flightmemory=r.state;w.ending=route;flag(w,'voyage_complete');updateWorld(w,0);return true;
  }catch{return false;}
}
export function serialize(w){
  const {saveProtection,loadIssue,...data}=w;
  return JSON.stringify({...data,schemaVersion:3,foundation:{...w.foundation,settings:{...w.foundation.settings,muted:w.muted}}});
}
function restoreLegacy(raw){
  try{
    let p=JSON.parse(raw);const w=newWorld();if(p?.version!==2)return w;p=migrateLegacySave(p);
    w.room=ALL_ROOM_IDS.includes(p.room)?p.room:'engine';
    for(const key of ['discovered','flags','dialogueSeen','items','logs'])w[key]=Array.isArray(p[key])?p[key].filter(x=>typeof x==='string'):w[key];
    w.discovered=w.discovered.filter(id=>ALL_ROOM_IDS.includes(id));if(!w.discovered.includes('engine'))w.discovered.unshift('engine');
    w.doors={engine:p.doors?.engine===true,security:false};w.sensors={...w.sensors,...p.sensors};
    w.pressure=Number.isFinite(p.pressure)?Math.max(0,Math.min(100,p.pressure)):94;
    for(const room of ALL_ROOM_IDS)if(Number.isFinite(p.positions?.[room]))w.positions[room]=Math.max(20,Math.min(p.foundation?.opening?.version===1&&room==='engine'?620:room==='corridor'?844:room==='life'&&p.foundation?.exploration?.layoutVersion===1?1420:room==='relay'&&p.foundation?.exploration?.workshopLayoutVersion===1?1132:galleryEnabled(p)&&room==='sensors'?1420:room==='testbay'||room==='computation'?940:room==='blackbox'?844:457,p.positions[room]));
    w.muted=p.muted===true;
    if(p.nandEvent?.triggered)w.nandEvent={triggered:true,failed:p.nandEvent.failed===true,elapsed:Number.isFinite(p.nandEvent.elapsed)?Math.max(0,Math.min(3,p.nandEvent.elapsed)):0,explained:p.nandEvent.explained===true};
    for(const id of Object.keys(REPAIRS)){
      const c=p.circuits?.[id];if(c&&Array.isArray(c.nodes)&&Array.isArray(c.wires)){const allowedOutputs=new Set(REPAIRS[id].outputs.map(n=>n.id)),removed=new Set(c.nodes.filter(n=>n.type==='OUTPUT'&&!allowedOutputs.has(n.id)).map(n=>n.id));w.circuits[id]={...c,nodes:c.nodes.filter(n=>!removed.has(n.id)),wires:c.wires.filter(q=>!removed.has(q.from)&&!removed.has(q.to))};}
      const requested=p.machines?.[id]?.certified===true;w.machines[id].certified=requested&&testCircuit(REPAIRS[id],w.circuits[id]).pass;
      w.machines[id].status=w.machines[id].certified?'repaired':p.machines?.[id]?.status==='malfunctioning'?'malfunctioning':'off';
      w.machineStates[id]={};for(const node of w.circuits[id].nodes.filter(n=>n.type==='DFF')){const state=p.machineStates?.[id]?.[node.id];if(state)w.machineStates[id][node.id]={q:Number(state.q===1),clock:Number(state.clock===1)};}
    }
    if(w.room==='relay'&&!w.nandEvent.triggered)w.nandEvent={triggered:true,failed:false,elapsed:0,explained:false};
    updateWorld(w,0);if(!w.discovered.includes(w.room))w.room='engine';
    if(p.ending&&flightReady(w)){const room=w.room;w.room='bridge';engageFlight(w,p.ending);w.room=room;}
    return w;
  }catch{return newWorld();}
}
const runtime={inspect:inspectRaw,takePass:takePassRaw,authorize:authorizeRaw,enterRoom:enterRoomRaw,recoverLog:recoverLogRaw,recoverRecord:recoverRecordRaw,engageFlight:engageFlightRaw,machineInputs,installRepair,invalidateRepair,
  inventoryInstallProof(w,draft){
    if(draft.puzzleId===SERVICE_ID)return serviceInstallProof(w,draft);
    const id=draft.puzzleId,application=w.foundation.applications[id],meta=w.foundation.circuits[id],graph=w.circuits[id];
    if(!w.machines[id]?.certified||!application||!meta||application.signature!==functionalSignature(graph)||meta.signature!==application.signature||application.functionalRevision!==meta.functionalRevision||application.contentVersion!==meta.contentVersion||application.validatorVersion!==meta.validatorVersion||!testCircuit(REPAIRS[id],graph).pass)return null;
    const gates=graph.nodes.filter(n=>!['INPUT','OUTPUT'].includes(n.type));
    if(gates.length!==Object.keys(draft.nodes).length||gates.some(n=>draft.nodes[n.id]?.type!==n.type))return null;
    return {certificateId:application.transactionId,draftRevision:draft.revision};
  },
  // Live permanent service latches belong to Package 2 integration. Caller flags cannot bypass them.
  inventoryReleasePermission(){return null;},
};
function pilotSnapshot(w){
  if(w.saveProtection?.blocked)throw Error('Recover the protected inventory notebook before saving.');
  for(const id of isEarly(w)?Object.keys(w.machines):['ventilation','security','alarm'])validatePilotBindings(w,id,{allowProps:true});
  if(isEarly(w))restoreEarlyState(w);
  const raw=serialize(w);parseSnapshot(raw);return raw;
}
export function dispatchCommand(w,command){
  if((isInventoryPilot(w)||isEarly(w))&&w.saveProtection?.blocked)return {ok:false,state:w,events:[],error:w.loadIssue||'Recover the protected inventory notebook before continuing.'};
  const session=(isInventoryPilot(w)||isEarly(w))?pilotSessionFor(w):null;
  if((isInventoryPilot(w)||isEarly(w))&&((typeof window!=='undefined'&&!session)||(session&&!session.check())))return {ok:false,state:w,events:[],error:session?.message||'Acquire the inventory save lock before editing this pilot.'};
  const result=executeCommand(w,command,runtime);
  if(result.ok&&result.state!==w&&session&&!session.commit(result.state,pilotSnapshot))return {ok:false,state:w,events:[],error:session.message};
  if(result.ok&&result.state!==w)Object.assign(w,result.state);
  return {...result,state:w};
}
export const inspect=(w,targetId)=>dispatchCommand(w,{type:'INSPECT',targetId}).ok;
export const investigatePuzzle=(w,puzzleId)=>dispatchCommand(w,{type:'INVESTIGATE_PUZZLE',puzzleId});
export const takePass=w=>dispatchCommand(w,{type:'TAKE_PASS'}).ok;
export const authorize=w=>dispatchCommand(w,{type:'AUTHORIZE'}).ok;
export const enterRoom=(w,roomId)=>dispatchCommand(w,{type:'TRAVEL',roomId}).ok;
export const recoverLog=w=>dispatchCommand(w,{type:'RECOVER_LOG'}).ok;
export const recoverCampaignRecord=(w,roomId=w.room)=>dispatchCommand(w,{type:'RECOVER_RECORD',roomId}).ok;
export const engageFlight=(w,route)=>dispatchCommand(w,{type:'FINISH_FLIGHT',route}).ok;
export const editCircuit=(w,puzzleId,circuit)=>dispatchCommand(w,{type:'EDIT_CIRCUIT',puzzleId,circuit,compatibility:true});
export const testRepair=(w,puzzleId)=>dispatchCommand(w,{type:'TEST_CIRCUIT',puzzleId});
export const applyRepair=(w,puzzleId,validationId)=>dispatchCommand(w,{type:'APPLY_REPAIR',puzzleId,validationId});
export const toggleDiagnostic=(w,puzzleId,inputId)=>dispatchCommand(w,{type:'TOGGLE_INPUT',puzzleId,inputId});
export const setDiagnostic=(w,puzzleId,inputs)=>dispatchCommand(w,{type:'SET_DIAGNOSTIC',puzzleId,inputs});
// Legacy API retains current fixtures/playability while all actual transitions use commands.
// In compatibility mode security can be staged from the accessible engine hatch. Engagement
// still waits for a real pass and safe pressure, unlike the historical certify implementation.
export function certify(w,puzzleId,circuit){
  for(const command of [{type:'INVESTIGATE_PUZZLE',puzzleId},{type:'EDIT_CIRCUIT',puzzleId,circuit}]){
    const r=dispatchCommand(w,{...command,compatibility:true});if(!r.ok)return {pass:false,rows:[],error:r.error};
  }
  const tested=dispatchCommand(w,{type:'TEST_CIRCUIT',puzzleId,compatibility:true});
  if(!tested.ok||!tested.pass)return {pass:false,rows:tested.rows||[],error:tested.error};
  const applied=dispatchCommand(w,{type:'APPLY_REPAIR',puzzleId,validationId:tested.validationId,compatibility:true});
  return {pass:true,rows:tested.rows,error:applied.ok?null:applied.error,applied:applied.ok,pending:applied.pending===true};
}
export function restore(raw){
  try{const w=recoverPilotWorld(migrateSnapshot(raw,{restoreLegacy}));migrateGalleryRooms(w,parseSnapshot(raw));if(w.saveProtection?.blocked)w.saveProtection.originalSnapshot=raw;return w;}
  catch(error){const w=newWorld();w.loadIssue=error.message;w.saveProtection={blocked:true,originalSnapshot:typeof raw==='string'?raw:'',message:error.message};return w;}
}
export function loadWorld(storage,options={}){
  try{
    storage??=globalThis.localStorage;
    if(options.curriculum){const raw=storage.getItem(CURRICULUM_SAVE_KEY);if(raw==null)return newRevisedCurriculum();const w=restore(raw);if(!isEarly(w)){w.saveProtection={blocked:true,originalSnapshot:raw};w.loadIssue='This is not a valid curriculum notebook.';}return w;}
    if(options.inventoryPilot){const raw=storage.getItem(PILOT_SAVE_KEY);if(raw==null)return newInventoryPilot();const w=restore(raw);if(!isInventoryPilot(w)){w.loadIssue='This slot is not a valid inventory pilot. Its original snapshot is protected.';w.saveProtection={blocked:true,originalSnapshot:raw};}return w;}
    const current=storage.getItem(SAVE_KEY);if(current!==null&&current!==undefined){const w=restore(current);if(isInventoryPilot(w)){w.loadIssue='An inventory pilot was found in the normal slot. Reload its isolated pilot URL; this snapshot is protected.';w.saveProtection={blocked:true,originalSnapshot:current};}return w;}
    const legacy=storage.getItem(LEGACY_SAVE_KEY);if(legacy!==null&&legacy!==undefined)return restore(legacy);
    if(options.importArchive){const archived=storage.getItem(ARCHIVE_SAVE_KEY);if(archived!==null&&archived!==undefined)return restore(archived);}
    return newWorld();
  }catch(error){const w=newWorld();w.loadIssue='Storage is unavailable. Keep this tab open. '+error.message;w.saveProtection={needsRecoveryRead:true};return w;}
}
export function saveWorld(w,storage){
  try{validateFabrication(w);}catch{return false;}
  if(isEngineeringDemo(w))return false;
  if(w.saveProtection?.blocked)return false;
  if(!w.foundation.inventory||typeof w.foundation.inventory!=='object'||Array.isArray(w.foundation.inventory))return false;
  if(hasInventoryLedger(w.foundation.inventory)&&!validateInventory(w.foundation.inventory).ok)return false;
  if(isInventoryPilot(w)||isEarly(w)){
    return pilotSessionFor(w)?.commit(w,pilotSnapshot)===true;
  }
  try{
    storage??=globalThis.localStorage;
    if(typeof storage.getItem!=='function'||typeof storage.setItem!=='function')return false;
    if(w.saveProtection?.needsRecoveryRead){
      if(typeof storage.getItem!=='function')return false;
      if(storage.getItem(SAVE_KEY)!=null||storage.getItem(LEGACY_SAVE_KEY)!=null){w.loadIssue='An existing notebook is available again. Reload it before saving this session.';return false;}
      delete w.saveProtection;
    }
    const candidate=serialize(w);parseSnapshot(candidate);
    storage.setItem(SAVE_KEY,candidate);
    return storage.getItem(SAVE_KEY)===candidate;
  }catch{return false;}
}
