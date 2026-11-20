import {rippleCircuit,testRipple,validateRippleShape} from './ripple-adder.js';
import {asciiCommand} from './ascii-transmission.js';
import {advanceConverter} from './twos-complement.js';
import {outfitterCommand,outfitterUnlocked} from './outfitter-state.js';
import {awardRepairCredits,pendingRepairCredits} from './credits.js';
import {campaignRecord} from './campaign.js';
import {signedBinaryCommand} from './signed-binary.js';
import {galleryStageProgress,verifyGalleryStage,invalidateGalleryStages} from './gallery-data-stages.js';
import {galleryEnabled} from './curriculum-profile.js';
import {p01GuideCommand} from './p01-guide.js';
import {gardenDecoderCommand} from './garden-decoder.js';
import {decoderProgress,verifyDecoderStage,invalidateDecoderStages} from './decoder-stages.js';
import {isDataConsole,validateDataShape} from './data-consoles.js';
import {corePowered,hasOpening,CORE_SWITCH_ID} from './opening-state.js';
import {fabricationCommand,reconcileFabricatedEdit,installFabricated,validateFabrication,ensureAutomaticSupply} from './fabrication.js';
import {isEarly,SERVICE_ID,serviceState,taskId,editableGraph} from './curriculum-profile.js';
import {checkEarlyCircuit,triggerBreakdown,serviceCommand} from './garden-service.js';
import {getPlayablePuzzle,getPuzzle} from './puzzle-definitions.js';
import {puzzleAvailability,checkPrerequisites,dependencySignature} from './progression.js';
import {functionalSignature,sourceDigest} from './circuit-revision.js';
import {REPAIRS} from './repairs.js';
import {testCircuit} from './validator.js';
import {step} from './simulator.js';
import {recordCompatibility} from './migrations.js';
import {INVENTORY_COMMANDS,reduceInventory} from './inventory.js';
import {isInventoryPilot,isPhysicalSession,usesFiniteInventory,pickupAvailability,reconcilePilotEdit,validatePilotBindings,pilotDraftId} from './inventory-gameplay.js';
import {recordLesson,advanceLesson} from './lesson-controller.js';
import {certifyConstruction,introduceComponent,introducePickup,invalidateComponentSource} from './components.js';
import {acquireBlueprint,setBlueprintView} from './blueprints.js';
import {circuitEditEvents} from './circuit-events.js';
import {setCircuitHintView} from './circuit-hints.js';

function recordPresentations(f,events){
 for(const e of events.filter(e=>['machine.repaired','story.record_discovered','component.discovered','component.found','component.certified','blueprint.acquired'].includes(e.type)))if(!f.presentation.history.some(x=>x.eventId===e.eventId))f.presentation.history.push(e);
 f.presentation.history=f.presentation.history.slice(-128);f.presentation.version=2;f.presentation.pending??=[];
 for(const e of events)if(['component.discovered','component.found'].includes(e.type)&&!f.presentation.seen.includes(e.eventId)&&!f.presentation.pending.includes(e.eventId))f.presentation.pending.push(e.eventId);
 f.presentation.pending=f.presentation.pending.filter(id=>!f.presentation.seen.includes(id)&&f.presentation.history.some(e=>e.eventId===id));
}
export const FUTURE_COMMANDS=Object.freeze(['UPDATE_LESSON','CLAIM_PICKUP','RESERVE_COMPONENT','RETURN_COMPONENT','CERTIFY_COMPONENT']);
const failure=(state,message,extra={})=>({ok:false,state,events:[],error:message,...extra});
/** Pure transactional boundary. Runtime hooks mutate only the cloned candidate. */
export function executeCommand(state,command,runtime){
  if(!command||typeof command.type!=='string')return failure(state,'A command type is required.');
  if(command.expectedRevision!==undefined&&command.expectedRevision!==state.foundation.revision)return failure(state,'The notebook changed. Reload the current state before retrying.');
  if(!corePowered(state)&&!['ACK_CRASH','ACTIVATE_EMERGENCY_CORE','SET_AUDIO_SETTINGS'].includes(command.type))return failure(state,'Activate G.R.E.G. at the emergency core switch first.');
  if(FUTURE_COMMANDS.includes(command.type))return failure(state,'This command belongs to a later implementation package.');
  const allowed=new Set(['BUY_COSMETIC','EQUIP_COSMETIC','MARK_MISSION_BRIEFING','ACK_CRASH','ACTIVATE_EMERGENCY_CORE','INVESTIGATE_PUZZLE','INSPECT','EDIT_CIRCUIT','TEST_CIRCUIT','APPLY_REPAIR','TOGGLE_INPUT','SET_DIAGNOSTIC','VERIFY_DECODER_STAGE','VERIFY_GALLERY_STAGE','GARDEN_BINARY_CONTROL','SIGNED_BINARY_CONTROL','CONVERTER_CONTROL','ADVANCE_RIPPLE','ASCII_CONTROL','P01_GUIDE','ADVANCE_OPENING_INTRO','TAKE_PASS','AUTHORIZE','RECOVER_LOG','RECOVER_RECORD','TRAVEL','FINISH_FLIGHT']);
  for(const type of ['SET_CIRCUIT_HINT','RECORD_CONSOLE_HINT','ADVANCE_LESSON','ACQUIRE_BLUEPRINT','SET_BLUEPRINT_VIEW','SET_AUDIO_SETTINGS','MARK_PRESENTATION_SEEN','TRIGGER_SCRUBBER_FAILURE','ACK_SERVICE_WARNING','INSPECT_SERVICE_CIRCUIT','START_SERVICE_REPLACEMENT','SERVICE_HINT','ACK_DEMORGAN','ACTIVATE_FABRICATOR','FABRICATE_COMPONENT'])allowed.add(type);
  if(!allowed.has(command.type)&&!INVENTORY_COMMANDS.includes(command.type))return failure(state,'Unknown game command.');
  try{
    const w=structuredClone(state),f=w.foundation,id=command.puzzleId,p=getPlayablePuzzle(id,w),events=[];
    const revision=f.revision+1,transactionId=(f.demoMode?.sessionId?f.demoMode.sessionId+'-':'')+'tx-'+revision+'-'+command.type.toLowerCase()+(id?'-'+id:'');
    const event=(type,parameters={})=>events.push({eventId:transactionId+':'+type+(type==='component.found'?':'+parameters.componentId:''), type,puzzleId:parameters.id||id||null,machineId:parameters.id||id||null,stateRevision:revision,transactionId,scope:['TOGGLE_INPUT','SET_DIAGNOSTIC','TEST_CIRCUIT'].includes(command.type)?'diagnostic':'live',parameters});
    const fail=(message,extra={})=>failure(state,message,extra);
    if(['BUY_COSMETIC','EQUIP_COSMETIC'].includes(command.type)){const result=outfitterCommand(w,command,transactionId);if(result.duplicate)return {ok:true,state,events:[],...result};f.revision=revision;event(result.purchased?'cosmetic.purchased':'cosmetic.equipped',result);return {ok:true,state:w,events,transactionId,...result};}
    if(INVENTORY_COMMANDS.includes(command.type)){
      if(w.saveProtection?.blocked)return fail('Recover the protected notebook before changing physical ownership.');
      if(isPhysicalSession(w)){
        if(!['CollectGate','CancelPlacement'].includes(command.type))return fail('Pilot ownership changes must be part of an editor edit or repair Apply.');
        if(command.type==='CancelPlacement')return {ok:true,state,events:[],cancelled:true,duplicate:true};
        const access=pickupAvailability(w,command.pickupId);if(!access.ok)return fail(access.message);
      }
      const result=reduceInventory(w,command,runtime);
      if(result.duplicate)return {ok:true,state,events:[],...result};
      if(isEarly(w)&&command.pickupId==='garden.demorgan-kit')serviceState(w).drawerCollected=true;
      f.revision=revision;
      events.push({eventId:transactionId+':inventory.changed',type:(isInventoryPilot(w)||isEarly(w))?'component.picked_up':'inventory.changed',scope:isInventoryPilot(w)?'inventory-pilot':'inventory-staged',stateRevision:revision,transactionId,parameters:{operation:command.type,instanceIds:result.collected||[]}});
      if(command.type==='CollectGate')for(const e of introducePickup(w,command.pickupId,result.collected||[],transactionId))event(e.type,e.parameters);
      recordPresentations(f,events);
      return {ok:true,state:w,events,transactionId,...result};
    }
    if(['ACTIVATE_FABRICATOR','FABRICATE_COMPONENT'].includes(command.type)){const result=fabricationCommand(w,command,transactionId);if(result.duplicate)return {ok:true,state,events:[],...result};f.revision=revision;event(result.activated?'fabrication.activated':'fabrication.completed',result);return {ok:true,state:w,events,transactionId,...result};}
    const accessible=()=>puzzleAvailability(command.type==='EDIT_CIRCUIT'&&command.compatibility&&w.discovered.includes(p.roomId)?{...w,room:p.roomId}:w,id,{allowAdjacent:command.compatibility===true,requireInvestigation:true});
    if(['INVESTIGATE_PUZZLE','EDIT_CIRCUIT','TEST_CIRCUIT','APPLY_REPAIR','TOGGLE_INPUT','SET_DIAGNOSTIC','ADVANCE_LESSON','SET_BLUEPRINT_VIEW','VERIFY_DECODER_STAGE','VERIFY_GALLERY_STAGE','CONVERTER_CONTROL','ADVANCE_RIPPLE'].includes(command.type)){
      if(!p)return fail(getPuzzle(id)?'This repair is planned for a later implementation package.':'Unknown puzzle.');
      const a=accessible();if(a.state==='UNAVAILABLE')return fail(a.reason);
      if(command.type!=='INVESTIGATE_PUZZLE'&&a.state==='INVESTIGABLE')return fail(a.reason);
    }
    if(isEarly(w)&&['TRIGGER_SCRUBBER_FAILURE','ACK_SERVICE_WARNING','INSPECT_SERVICE_CIRCUIT','START_SERVICE_REPLACEMENT','SERVICE_HINT','ACK_DEMORGAN'].includes(command.type)){
      const result=command.type==='TRIGGER_SCRUBBER_FAILURE'?triggerBreakdown(w,transactionId):serviceCommand(w,command,transactionId,runtime);
      if(result.duplicate)return {ok:true,state,events:[],duplicate:true};
      f.revision=revision;if(command.type==='TRIGGER_SCRUBBER_FAILURE')event('service.scrubber.failed',{id:'scrubber'});
      return {ok:true,state:w,events,transactionId,...result};
    }
    if(isEarly(w)&&id==='scrubber'&&serviceState(w)?.triggered&&['EDIT_CIRCUIT','TEST_CIRCUIT','APPLY_REPAIR'].includes(command.type)){
      const s=serviceState(w);if(!s.drawerCollected)return fail('Collect the emergency components before editing or testing the scrubber.');let result;
      if(command.type==='EDIT_CIRCUIT'){
        const graph=structuredClone(command.circuit),before=editableGraph(w,id);
        for(const e of reconcilePilotEdit(w,id,graph,transactionId))event(e.type,e);
        for(const e of circuitEditEvents(before,graph,{placement:false}))event(e.type,e.parameters||{});
        // CLEAR PANEL submits fixed terminals through the ordinary Edit transaction.
        // The retired original remains in history; it never participates in draft returns.
        if(!s.applied&&s.circuitInspected&&graph.nodes.every(n=>n.fixed)&&graph.wires.length===0)s.replacementStarted=true;
        const signature=functionalSignature(graph),functional=signature!==s.meta.signature;
        if(s.applied)w.circuits.scrubber=graph;else s.draft=graph;
        if(functional){s.meta.functionalRevision++;s.meta.signature=signature;s.ticket=null;s.validated=false;s.built=graph.nodes.filter(n=>!n.fixed).length===3;}
        result={functional,functionalRevision:s.meta.functionalRevision};
      }else{
        validatePilotBindings(w,id);const quote=command.type==='APPLY_REPAIR'?pendingRepairCredits(w,id):null;result=serviceCommand(w,command,transactionId,runtime);if(command.type==='APPLY_REPAIR'&&result.applied){const reward=awardRepairCredits(w,id,transactionId,quote);if(reward)event('credits.earned',reward);}
        if(result.duplicate)return {ok:true,state,events:[],...result};
        if(command.type==='TEST_CIRCUIT'){event('circuit.test_started');event(result.pass?'circuit.test_passed':'circuit.test_failed',{error:result.error});}
        else{event('service.equivalence.confirmed',{id});event('machine.repaired',{id,serviceId:SERVICE_ID});}
      }
      f.revision=revision;return {ok:true,state:w,events,transactionId,...result};
    }
    if(galleryEnabled(w)&&id==='adc_precision'&&['EDIT_CIRCUIT','TEST_CIRCUIT','APPLY_REPAIR','VERIFY_GALLERY_STAGE'].includes(command.type))return fail('Use the unnumbered ASCII Transmission Terminal.');
    let result={};
    const apply=id=>{
      validatePilotBindings(w,id);
      const spec=getPlayablePuzzle(id,w),meta=f.circuits[id],signature=functionalSignature(w.circuits[id]),ticket=f.tested[id];
      const prior=f.applications[id],previouslyApplied=!!(id==='ripple_adder'&&f.curriculum.rippleLegacy)||!!prior||f.lessonProgress[id]?.competency===true||!!f.curriculum.legacyEvidence?.[id];
      if(w.machines[id].certified&&prior?.signature===signature&&prior.contentVersion===spec.contentVersion&&prior.validatorVersion===spec.validatorVersion&&prior.functionalRevision===meta.functionalRevision)return {ok:true,duplicate:true,transactionId:prior.transactionId};
      const prereq=checkPrerequisites(w,id);if(!prereq.ok)return {ok:false,error:prereq.message};
      if(!ticket?.pass||ticket.signature!==signature||meta.signature!==signature||ticket.functionalRevision!==meta.functionalRevision||ticket.contentVersion!==spec.contentVersion||ticket.validatorVersion!==spec.validatorVersion||ticket.dependencyKey!==dependencySignature(w,id))return {ok:false,error:'This circuit or its prerequisites changed. Test the current revision before Apply.'};
      if(galleryEnabled(w)&&['firewall','adc_precision'].includes(id)&&!galleryStageProgress(w,id).complete)return fail('Verify both equipment stages before final testing or engagement.');
        if(id==='cryo_signed'&&!decoderProgress(w).complete)return {ok:false,error:'Verify both P11 sensor stages before engaging the system.'};
      if(command.validationId&&ticket.validationId!==command.validationId)return {ok:false,error:'The validation record is stale.'};
      if(id==='ripple_adder'&&(w.circuits[id].configuration.rippleStage!==4||!f.curriculum.rippleTwoProof))return {ok:false,error:'Complete both carry-chain stages before engagement.'};
      const tested=isEarly(w)?checkEarlyCircuit(w,id,w.circuits[id]):testCircuit(REPAIRS[id],w.circuits[id]);if(!tested.pass)return {ok:false,error:tested.error};
      if(id==='security'){
        const inputs=runtime.machineInputs(w,id);if(!inputs.A||!inputs.B)return {ok:false,error:!inputs.A?'Tests passed. Engage the ventilation repair to restore engineering authorization before engaging the bulkhead.':'Tests passed. Restore safe engine pressure before engaging the bulkhead.',pending:true};
      }
      const quote=pendingRepairCredits(w,id);
      runtime.installRepair(w,id,w.circuits[id]);
      f.applications[id]={transactionId,signature,functionalRevision:meta.functionalRevision,contentVersion:spec.contentVersion,validatorVersion:spec.validatorVersion,provenance:'package1-compatibility'};
      if(usesFiniteInventory(w,id)){
        const draftId=pilotDraftId(id),installed=reduceInventory(w,{type:'InstallGate',requestId:transactionId+'-install',puzzleId:id,draftId,expectedDraftRevision:f.inventory.drafts[draftId]?.revision},runtime);
        event('component.installed',{id,instanceIds:installed.installed});
      }
      installFabricated(w,id,transactionId);
      recordCompatibility(w,id);if(galleryEnabled(w)&&['navbits','trajectory','ripple_adder','twos_complement','addsub'].includes(id)){f.curriculum.completed[id]=true;if(id==='trajectory')delete f.curriculum.catchUp.trajectory;}
      recordLesson(w,id,'APPLY');
      if(isEarly(w)&&id==='sensordiff')f.curriculum.concepts['xor.disagreement']=true;
      if(isEarly(w)&&id==='xorfab')f.curriculum.certifications.XOR=true;
      for(const e of certifyConstruction(w,id,transactionId,{previouslyApplied}))event(e.type,e.parameters);
      for(const e of introduceComponent(w,id,transactionId,{previouslyApplied}))event(e.type,e.parameters);
      if(id==='nandor'&&ensureAutomaticSupply(w,transactionId).activated)event('fabrication.restored',{id,automatic:true,target:100});
      event('machine.repaired',{id,contentVersion:spec.contentVersion,validatorVersion:spec.validatorVersion,functionalRevision:meta.functionalRevision,sourceFingerprint:sourceDigest(signature)});
      const reward=awardRepairCredits(w,id,transactionId,quote,{previouslyApplied});if(reward)event('credits.earned',reward);
      return {ok:true,applied:true,transactionId,reward};
    };
    switch(command.type){
      case 'P01_GUIDE':result=p01GuideCommand(w,command);break;
      case 'ADVANCE_OPENING_INTRO':
        if(!hasOpening(w)||!corePowered(w))return fail('Activate the emergency core first.');
        if(f.opening.briefingSeen)return {ok:true,state,events:[],duplicate:true};
        f.opening.introIndex=Math.min(4,(f.opening.introIndex||0)+1);if(f.opening.introIndex===4)f.opening.briefingSeen=true;break;
      case 'MARK_MISSION_BRIEFING':
        if(!hasOpening(w)||f.opening.presentationVersion!==2||!corePowered(w))return fail('This voyage has no pending opening briefing.');
        if(f.opening.briefingSeen)return {ok:true,state,events:[],duplicate:true};
        f.opening.briefingSeen=true;f.opening.introIndex=4;break;
      case 'ACK_CRASH':
        if(!hasOpening(w))return fail('This voyage has no crash opening.');
        if(f.opening.crashSeen)return {ok:true,state,events:[],duplicate:true};
        f.opening.crashSeen=true;break;
      case 'ACTIVATE_EMERGENCY_CORE':
        if(!hasOpening(w)||w.room!=='engine'||command.targetId!==CORE_SWITCH_ID)return fail('Use the original Engine Room emergency switch.');
        if(f.opening.coreOn)return {ok:true,state,events:[],duplicate:true};
        f.opening.coreOn=true;f.opening.crashSeen=true;event('emergency.core_activated',{objectId:CORE_SWITCH_ID});break;
      case 'INVESTIGATE_PUZZLE':
        if(f.investigations[id])return {ok:true,state,events:[],duplicate:true};
        f.investigations[id]=true;for(const key of p.investigationRequirements)f.investigations[key]=true;runtime.inspect(w,id);recordLesson(w,id,'INVESTIGATE');result={investigated:true};break;
      case 'INSPECT':
        if(typeof command.targetId!=='string'||command.targetId.length>80)return fail('Invalid inspection target.');
        runtime.inspect(w,command.targetId);break;
      case 'EDIT_CIRCUIT':{
        if(id==='twos_complement')return fail('Operate the physical converter controls.');
        const graph=structuredClone(command.circuit);
        if(isDataConsole(id)&&(id!=='firewall'||galleryEnabled(w)))validateDataShape(id,graph);
        const before=w.circuits[id];if(id==='ripple_adder')validateRippleShape(graph,before);reconcileFabricatedEdit(w,id,graph,transactionId);
        for(const e of reconcilePilotEdit(w,id,graph,transactionId))event(e.type,{id,instanceIds:e.instanceIds});
        for(const e of circuitEditEvents(before,graph,{placement:!usesFiniteInventory(w,id)}))event(e.type,{id,...e.parameters});
        const signature=functionalSignature(graph),meta=f.circuits[id],functional=meta.signature!==signature;
        w.circuits[id]=graph;
        if(id==='cryo_signed')invalidateDecoderStages(w,before,graph);
        if(galleryEnabled(w)&&['firewall','adc_precision'].includes(id))invalidateGalleryStages(w,id,before,graph);
        if(functional){
          meta.functionalRevision++;meta.signature=signature;
          delete f.tested[id];delete f.applications[id];delete f.diagnostics[id];delete f.curriculum.completed[id];
          runtime.invalidateRepair(w,id);
          invalidateComponentSource(w,id);recordLesson(w,id,'BUILD');
          for(const key of Object.keys(f.tested))if(f.tested[key].dependencyKey!==dependencySignature(w,key))delete f.tested[key];
        }
        result={functional,functionalRevision:meta.functionalRevision};break;
      }
      case 'ASCII_CONTROL':result=asciiCommand(w,command);break;
      case 'ADVANCE_RIPPLE':{
        if(id!=='ripple_adder'||w.circuits[id].configuration.rippleStage!==2||w.machines[id].certified)return fail('The two-adder bench is not pending.');
        const proof=testRipple(w.circuits[id]);if(!proof.pass)return fail(proof.error);
        f.curriculum.rippleTwoProof={version:1,signature:functionalSignature(w.circuits[id]),transactionId};
        w.circuits[id]=rippleCircuit(4);const meta=f.circuits[id];meta.functionalRevision++;meta.signature=functionalSignature(w.circuits[id]);delete f.tested[id];delete f.diagnostics[id];result={expanded:true};break;
      }
      case 'CONVERTER_CONTROL':{
        if(id!=='twos_complement'||w.machines[id].certified)return fail('This converter is already installed or unavailable.');
        const c=advanceConverter(w.circuits[id].configuration,command.action);w.circuits[id].configuration=c;
        const meta=f.circuits[id];meta.functionalRevision++;meta.signature=functionalSignature(w.circuits[id]);delete f.tested[id];delete f.diagnostics[id];recordLesson(w,id,'BUILD');result={converter:c};break;
      }
      case 'SIGNED_BINARY_CONTROL':{const {state:decoder,...fields}=signedBinaryCommand(w,command);result={...fields,decoder};if(result.completed)event('lesson.completed',{id:'gallery.signed-binary'});break;}
      case 'GARDEN_BINARY_CONTROL':{const {state:decoder,...resultFields}=gardenDecoderCommand(w,command);result={...resultFields,decoder};if(result.completed)event('lesson.completed',{id:'garden.binary-decoder'});break;}
      case 'VERIFY_GALLERY_STAGE':{
        if(!galleryEnabled(w))return fail('This console belongs to the revised Gallery.');
        result=verifyGalleryStage(w,id,command.stage,transactionId);event(result.pass?'gallery.stage_verified':'gallery.stage_failed',{stage:result.stage});break;
      }
      case 'VERIFY_DECODER_STAGE':{
        if(id!=='cryo_signed')return fail('This equipment has no P11 sensor stages.');
        result=verifyDecoderStage(w,command.stage,transactionId);event(result.pass?'decoder.stage_verified':'decoder.stage_failed',{stage:result.stage});break;
      }
      case 'TEST_CIRCUIT':{
        if(galleryEnabled(w)&&['firewall','adc_precision'].includes(id)&&!galleryStageProgress(w,id).complete)return fail('Verify both equipment stages before final testing or engagement.');
        if(id==='cryo_signed'&&!decoderProgress(w).complete)return fail('Verify both P11 sensor stages before full-system verification.');
        validatePilotBindings(w,id);
        const signature=functionalSignature(w.circuits[id]),meta=f.circuits[id];
        if(signature!==meta.signature)return fail('Apply the circuit edit command before testing its new wiring.');
        const checked=isEarly(w)?checkEarlyCircuit(w,id,w.circuits[id]):testCircuit(REPAIRS[id],w.circuits[id]);event('circuit.test_started');
        if(checked.pass){
          f.tested[id]={pass:true,signature,functionalRevision:meta.functionalRevision,contentVersion:p.contentVersion,validatorVersion:p.validatorVersion,dependencyKey:dependencySignature(w,id),validationId:transactionId+':validation'};
          event('circuit.test_passed',{validationId:f.tested[id].validationId});
          recordLesson(w,id,'TEST');
        }else{delete f.tested[id];event('circuit.test_failed',{error:checked.error});}
        result={...checked,validationId:f.tested[id]?.validationId};break;
      }
      case 'APPLY_REPAIR':{
        result=apply(id);if(!result.ok)return fail(result.error,{pending:result.pending===true});
        if(result.duplicate)return {ok:true,state,events:[],...result};break;
      }
      case 'TOGGLE_INPUT':
      case 'SET_DIAGNOSTIC':{
        const node=w.circuits[id].nodes.find(n=>n.id===command.inputId&&n.type==='INPUT');
        if(command.type==='TOGGLE_INPUT'&&!node)return fail('Unknown diagnostic input.');
        const signature=functionalSignature(w.circuits[id]),previous=f.diagnostics[id]?.signature===signature?f.diagnostics[id]:{inputs:runtime.machineInputs(w,id),state:w.machineStates[id]||{},signature};
        const inputs={...previous.inputs},changes=[];
        const requested=command.type==='TOGGLE_INPUT'?{[node.id]:((inputs[node.id]||0)+1)%(id==='ripple_adder'&&w.circuits[id].configuration.rippleStage===2?4:2**(node.width||1))}:command.inputs;
        if(!requested||typeof requested!=='object'||Array.isArray(requested))return fail('Diagnostic input values are required.');
        for(const [key,value]of Object.entries(requested)){
          const pin=REPAIRS[id].inputs.find(n=>n.id===key);
          if(!pin||!Number.isInteger(value)||value<0||value>=2**pin.width)return fail('Invalid diagnostic value for '+key+'.');
          if(inputs[key]!==value)changes.push({inputId:key,before:inputs[key]||0,after:value});
          inputs[key]=value;
        }
        let next=structuredClone(previous.state),error=null;
        if(REPAIRS[id].sequential)try{next=step(w.circuits[id],inputs,next).state;}catch(e){error=e.message;}
        f.diagnostics[id]={inputs,state:next,signature,error};
        if(changes.length)event('input.toggled',{changes});
        const clock=REPAIRS[id].inputs.find(n=>n.role==='clock'),edge=clock&&changes.find(n=>n.inputId===clock.id&&!n.before&&n.after===1);
        if(edge&&!error)event('clock.rising_edge',{inputId:clock.id});
        result={diagnostic:f.diagnostics[id]};break;
      }
      case 'TAKE_PASS':if(!runtime.takePass(w))return fail('The maintenance pass cannot be collected until ventilation makes the locker safe.');break;
      case 'AUTHORIZE':
        if(!runtime.authorize(w))return fail('Collect the physical maintenance pass first.');
        // Backwards-compatible deferred engagement: only the real authorization action may
        // install a previously tested security repair, after checking all live conditions again.
        if(f.tested.security?.pass&&!w.machines.security.certified)apply('security');
        break;
      case 'RECOVER_LOG':{
        const known=w.logs.includes('override');
        if(!runtime.recoverLog(w))return fail('Open the actual security bulkhead before recovering this record.');
        if(!known)event('story.record_discovered',{recordId:'override'});break;
      }
      case 'RECOVER_RECORD':{
        const recordId=campaignRecord(command.roomId||w.room),known=w.logs.includes(recordId);
        if(!runtime.recoverRecord(w,command.roomId||w.room))return fail('Restore the local machinery before recovering its story record.');
        if(!known)event('story.record_discovered',{recordId});break;
      }
      case 'TRAVEL':if(!runtime.enterRoom(w,command.roomId))return fail('The adjoining route is not released yet.');if(outfitterUnlocked(w))f.outfitter.unlocked=true;break;
      case 'FINISH_FLIGHT':
        if(!runtime.engageFlight(w,command.route))return fail('Restore all current machines before choosing a pilot.');
        f.endingHistory=Array.from(new Set([...(f.endingHistory||[]),command.route]));break;
      case 'ADVANCE_LESSON':result={lesson:advanceLesson(w,id,command.stage,command.path)};break;
      case 'ACQUIRE_BLUEPRINT':
        result=acquireBlueprint(w,command.blueprintId,transactionId);
        if(result.duplicate)return {ok:true,state,events:[],duplicate:true};
        event('blueprint.acquired',{blueprintId:result.blueprintId,name:result.name});break;
      case 'SET_BLUEPRINT_VIEW':setBlueprintView(w,id,command.view);break;
      case 'RECORD_CONSOLE_HINT':
        if(!p||p.roomAccessRequirements.roomId!==w.room||!isDataConsole(id,w.circuits[id]))return fail('Open the local equipment console before requesting assistance.');
        f.hintUsage??={version:0,revealed:{}};f.hintUsage.revealed[id]=true;break;
      case 'SET_CIRCUIT_HINT':
        if(!p||p.roomAccessRequirements.roomId!==w.room)return fail('Open the local circuit before requesting hints.');
        result={hint:setCircuitHintView(w,id,command.view)};break;
      case 'SET_AUDIO_SETTINGS':{
        const settings=command.settings;if(!settings||typeof settings!=='object'||Array.isArray(settings))return fail('Audio settings are required.');
        for(const [key,value]of Object.entries(settings)){
          if(['master','sfx','ambient'].includes(key)){if(!Number.isFinite(value)||value<0||value>1)return fail('Volume must be between 0 and 1.');f.settings[key]=value;}
          else if(['muted','reducedMotion'].includes(key)){if(typeof value!=='boolean')return fail('Invalid preference.');f.settings[key]=value;if(key==='muted')w.muted=value;}
          else return fail('Unknown preference.');
        }break;
      }
      case 'MARK_PRESENTATION_SEEN':
        if(!f.presentation.history.some(e=>e.eventId===command.eventId&&['component.discovered','component.found','blueprint.acquired'].includes(e.type)))return fail('Unknown committed presentation.');
        if(f.presentation.seen.includes(command.eventId))return {ok:true,state,events:[],duplicate:true};
        f.presentation.seen.push(command.eventId);f.presentation.seen=f.presentation.seen.slice(-256);break;
    }
    validateFabrication(w);f.revision=revision;
    recordPresentations(f,events);
    return {ok:true,state:w,events,transactionId,...result};
  }catch(error){return failure(state,error.message||'The command could not be applied.');}
}
