import {floorSurface} from './room-door-layout.js';
import {ALU_COMPLETE,ALU_INTRO} from './alu-foundation.js';
import {legacyAddsub,SUBTRACTOR_COMPLETE} from './subtractor.js';
import {TwosComplementUI} from './twos-complement-ui.js';
import {FullscreenDisplay} from './fullscreen.js';
import {EngineeringManual} from './manual-ui.js';
import {pauseMenuMarkup,settingsMarkup,menuParentDestination} from './menu-ui.js';
import {OutfitterUI} from './outfitter-ui.js';
import {outfitterUnlocked} from './outfitter-state.js';
import {getPlayablePuzzle} from './puzzle-definitions.js';
import {sceneWorkstations,sceneWorkstation,workstationObjective} from './scene-workstations.js';
import {workbenchAction} from './workbench-controls.js';
import {CircuitHintUI} from './circuit-hint-ui.js';
import {pendingStoryConversation} from './story-milestones.js';
import {installPopupPagination,textPages} from './popup-pages.js';
import {AsciiTransmissionUI} from './ascii-transmission.js';
import {PRESSURE_COMPLETE} from './pressure-register-lesson.js';
import {rippleOverflowVisual} from './ripple-view.js';
import {ADD4C_INTRO,RIPPLE_OVERFLOW} from './ripple-adder.js';
import {arithmeticDialogueVisual,componentLabel} from './arithmetic-presentation.js';
import {importantDialogue,puzzleIntroduction,conversationMarkup} from './dialogue-presentation.js';
import {puzzleBrief,puzzleIntroKey} from './puzzle-explanations.js';
import {SignedBinaryUI} from './signed-binary-ui.js';
import {signedTutorialRequired,signedTutorialSatisfied} from './signed-binary.js';
import {GalleryDataUI} from './gallery-data-ui.js';
import {GALLERY_DATA_IDS} from './gallery-data.js';
import {p01Guided,p01Step,enginePartsGlow} from './p01-guide.js';
import {paintP01Guide} from './p01-guide-ui.js';
import {OPENING_MESSAGES} from './opening-intro.js';
import {GardenBinaryUI} from './garden-binary-ui.js';
import {gardenDecoderComplete} from './garden-decoder.js';
import {gardenExitPhase} from './garden-exit.js';
import {GardenEmergency} from './garden-emergency.js';
import {isDataConsole} from './data-consoles.js';
import {DataConsoleUI} from './data-console-ui.js';
import {launchMode} from './launch-mode.js';
import {createDeveloper} from './developer-bootstrap.js';
import * as buildInfo from './build-info.js';
import {EngineerVisualState} from './engineer-character.js';
import {PowerUpPresentation} from './power-up.js';
import {analysisEnvironment,developmentEnvironment} from './development-environments.js';
import {missionBriefingMarkup} from './mission-briefing.js';
import {titleMarkup,opensTitleMenu} from './title-screen.js';
import {corePowered,hasOpening,initializeOpening,CORE_SWITCH_ID,briefingPending} from './opening-state.js';
import {CrashOpening} from './opening-sequence.js';
import {fabricationEligible,fabricatorActive,fabricationTypes,FABRICATION_TYPES,fabricatedAvailable,manufacturedSupply,automaticallySupplied} from './fabrication.js';
import {nextNavigationStop,navigationOrigin,navigationKey} from './navigation.js';
import {extendedGarden,extendedEnvironment,environmentWidth,clampWorldX,pointerWorldX,visibleHotspot} from './exploration.js';
import {isEarly,SERVICE_ID,CURRICULUM_SAVE_KEY,serviceState,servicePending,editableGraph,roomRepairIds,campaignRoute,splitGallery} from './curriculum-profile.js';
import {panelSpec,bulkheadStarterCleanup,DEMORGAN_IDENTITY,SCRUBBER_PARTS_MESSAGES,DEMORGAN_COMPLETION_MESSAGES} from './garden-service.js';
import {damagedScrubberGraph,needsScrubberInspection} from './garden-malfunction.js';
import {isGalleryCurriculum} from './gallery-puzzles.js';
import {GardenUI} from './garden-ui.js';
import {CAMPAIGN_ROOMS,CAMPAIGN_REPAIRS,CAMPAIGN_ORDER,ALL_ROOM_IDS,campaignRecord,canAdvance,repairedRoom,completedRepairs,ENDINGS,REPAIR_COUNT,nandBusy,nandPhase,nandDoors} from './campaign.js';
import {Assets} from './assets.js';
import {Renderer} from './renderer.js';
import {Animations} from './animation.js';
import {Audio} from './audio.js';
import {gateSymbol} from './panel-art.js';
import {Editor,fitCircuitViewport,escapeHTML as esc} from './editor.js';
import {evaluate} from './simulator.js';
import {testCircuit} from './validator.js';
import {combinations} from './puzzles.js';
import {REPAIRS} from './repairs.js';
import {ROOMS,roomHotspots,hotspotState} from './hotspots.js';
import {LINES,MAINTENANCE_LOG,objective} from './dialogue.js';
import {newWorld,loadWorld,saveWorld,updateWorld,inspect,has,flag,takePass,authorize,enterRoom,editCircuit,machineInputs,canTravel,recoverCampaignRecord,flightReady,engageFlight,investigatePuzzle,puzzleAvailability,testRepair,applyRepair,toggleDiagnostic,setDiagnostic,newInventoryPilot,newCurriculum,newRevisedCurriculum,dispatchCommand} from './world.js';
import {isInventoryPilot,usesFiniteInventory,inventoryRows,PICKUP_LOCATIONS,pickupAvailability} from './inventory-gameplay.js';
import {FINITE_BUDGETS,FINITE_PICKUPS,FINITE_GATES} from './inventory.js';
import {InventorySession} from './inventory-session.js';
import {inventoryMarkup,componentCards,drawingInventoryMarkup} from './inventory-ui.js';
import {circuitEditEvents} from './circuit-events.js';
import {createPractice,lessonDefinition} from './lesson-controller.js';
import {activeBlueprint} from './blueprint-overlay.js';
import {getBlueprint,availableBlueprints,BLUEPRINTS} from './blueprints.js';
import {discoverySnapshot,pickupSnapshot} from './components.js';
import {DiscoveryPresentation} from './discovery-presentation.js';
import {GregReactions,presentOperation} from './presentation-events.js';
import {TeachingUI} from './teaching-ui.js';
import {createDemoSession} from './demo-session.js';
import {isEngineeringDemo} from './session-mode.js';
import {CreditHUD,creditHudMarkup} from './credit-hud.js';
import {circuitRewardPreview} from './circuit-rewards.js';
import {prepareDiagnostic,diagnosticOutcome} from './diagnostic-session.js';
import {DiagnosticPresentation} from './diagnostic-presentation.js';

const {DEVELOPMENT_BUILD,BUILD_ID,PUBLIC_RELEASE=false}=buildInfo;
const app=document.querySelector('#app');
const {presentationPreview,developmentPreview,previewRequested,demoRequested,developerRequested,curriculumRequested,pilotRequested}=launchMode(location.search,{development:DEVELOPMENT_BUILD,publicRelease:PUBLIC_RELEASE});
let developer=null;
let pilotSession=null;
let world=previewRequested?(presentationPreview?newWorld():newCurriculum()):demoRequested?newWorld():curriculumRequested?newRevisedCurriculum():pilotRequested?newInventoryPilot():developerRequested?newWorld():loadWorld(),started=false,overlayType=null,panel=null,editor=null,pendingInteraction=null;
if(previewRequested){initializeOpening(world,{active:!presentationPreview});if(developmentPreview)world.environmentPreview=developmentPreview;world.room=developmentEnvironment(world)?.roomId??(presentationPreview?'engine':{engine:'engine',corridor:'corridor',garden:'life',workshop:'relay'}[new URLSearchParams(location.search).get('environmentPreview')]);world.positions[world.room]=world.room==='engine'?94:70;}
let fullscreen=null,crash=null,power=null,introPending=false,titleUnlocked=false,startHandled=false,overlayReturnFocus=null;
let dataConsole=null,gardenBinary=null,armedGuidePart=null,lastWorldGuide=null;
let panelArt=null,practiceContext=null,presentation=null,teaching=null,gardenUI=null,diagnostic=null;
const reactions=new GregReactions(),engineerVisual=new EngineerVisualState();
let lineMessages=[],lineIndex=0,lineCentered=false,linePaused=false,dialogueTurn=0;
let circuitHints=null;
let scrubberModal=null;
let creditHud=null,outfitter=null,outfitterAssets=null,menuParent=null,manual=null,manualReturn=null;
let currentLine=null,lineAfter=null,lineTimer,saveTimer,hoverId=null,hintIndex=0,draggedPart=null,testResult=null;
const repairDialogue=[];
const audio=new Audio(),animations=new Animations();
const gardenEmergency=new GardenEmergency({animations,warning:showGardenEmergency,slam:()=>{animations.scrubberFailureTime=0;audio.scrubberFailure((850-animations.actor.x)/480);reactions.react('surprised');engineerVisual.play('surprised',world,animations);},finished:()=>{setInert();refreshHUD();}});
let queuedRoom=null,queuedPickupState=null,queuedIntent=null,transitioning=false,travelEpoch=0,edgeHover=0,toastTimer,engagementNoticeTimer;
let reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const icons={
  bag:'<path d="M5 8h14l2 12H3L5 8Z M8 8V5a4 4 0 0 1 8 0v3 M4 13h16 M10 12v4h4v-4"/>',
  book:'<path d="M4 3h14v18H4V3Z M7 3v18 M10 7h5 M10 11h5 M10 15h4"/>',
  sound:'<path d="M3 10h4l5-5v14l-5-5H3v-4Z M16 8a6 6 0 0 1 0 8 M19 5a10 10 0 0 1 0 14"/>',
  mute:'<path d="M3 10h4l5-5v14l-5-5H3v-4Z M16 9l6 6 M22 9l-6 6"/>',
  menu:'<path d="M4 6h16 M4 12h16 M4 18h16"/>',
};
const repairTotal=()=>Object.keys(world.machines).filter(id=>!(id==='adc_precision'&&world.foundation.curriculum.arithmeticVersion>=2)).length;
const svg=name=>`<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name]}</svg>`;

function present(events){
 for(const e of events||[])if(e.type==='credits.earned')creditHud?.noteReward(e.parameters);
  if(events?.some(event=>event.type==='machine.repaired'))engineerVisual.repairAfterPanel(world,animations);
  presentOperation(events,{audio,reactions,onPickup:event=>{
    const snapshot=pickupSnapshot(world,event);if(!snapshot||world.foundation.presentation.seen.includes(event.eventId))return;
    clearTimeout(lineTimer);document.querySelector('#dialogue').hidden=true;presentation?.play(snapshot,{kind:'pickup'});setInert();
  },onDiscovery:event=>{
    const snapshot=discoverySnapshot(world,event);if(!snapshot||world.foundation.presentation.seen.includes(event.eventId))return;
    clearTimeout(lineTimer);document.querySelector('#dialogue').hidden=true;
    if(!world.foundation.blueprints.preferences[event.puzzleId]?.visible&&snapshot.source.nodes.filter(n=>!n.fixed).length>2)reactions.react('surprised');
    if(editor&&panel===event.puzzleId){editor.beginDiagnostic();const ids=new Set(snapshot.source.nodes.filter(n=>!n.fixed).map(n=>n.id));for(const el of document.querySelectorAll('#circuit-board [data-node]'))if(ids.has(el.dataset.node))el.classList.add('discovery-source-node');editor.resizeObserver?.disconnect();overlayType='discovery';}
    presentation?.play(snapshot);setInert();
  },onBlueprint:event=>{
    const p=getBlueprint(event.parameters.blueprintId);if(!p||!world.foundation.blueprints.acquired[p.id]||world.foundation.presentation.seen.includes(event.eventId))return;
    dispatchCommand(world,{type:'MARK_PRESENTATION_SEEN',eventId:event.eventId});
    presentation?.play({eventId:event.eventId,name:p.name},{kind:'blueprint'});setInert();
  }});
}
function hasPendingDiscovery(){return !!world.foundation.presentation.pending?.length;}
function resumePendingDiscoveries(){
 if(previewRequested||!started||document.hidden||!corePowered(world)||power?.active||crash?.active||introPending||diagnostic?.active||presentation?.active||(overlayType&&overlayType!=='repair'))return false;
 const events=[];let cleaned=false;for(const id of [...(world.foundation.presentation.pending||[])]){const event=world.foundation.presentation.history.find(e=>e.eventId===id);if(event&&(discoverySnapshot(world,event)||pickupSnapshot(world,event)))events.push(event);else if(event){dispatchCommand(world,{type:'MARK_PRESENTATION_SEEN',eventId:id});persist(true);cleaned=true;}}
 if(events.length)present(events);else if(cleaned)setInert();return !!presentation?.active;
}
function resumeMilestoneStory(){
 if(previewRequested||!started||document.hidden||!corePowered(world)||introPending||power?.active||crash?.active||transitioning||overlayType||diagnostic?.active||presentation?.active||hasPendingDiscovery()||currentLine||repairDialogue.length||developer?.blocksGame)return false;
 if(serviceState(world)?.applied&&serviceState(world).discoveryPending){showScrubberDiscovery();return true;}
 const story=pendingStoryConversation(world);if(!story)return false;cancelMovement();LINES[story.id]=['G.R.E.G.',story.messages[0]];say(story.id,{messages:story.messages,centered:true});return true;
}
function completeDiscovery(snapshot,{kind}){
 if(previewRequested)return;const r=dispatchCommand(world,{type:'MARK_PRESENTATION_SEEN',eventId:snapshot.eventId});if(!r.ok)return;persist(true);
 if(kind!=='discovery'||r.duplicate)return;
 const id=snapshot.sourcePuzzleId,line=id==='firewall'&&isGalleryCurriculum(world)?'fixed-status-decoder':CAMPAIGN_REPAIRS[id]?'fixed-'+id:id==='ventilation'?'restored':world.doors.security?'door':'authMissing';
 if(!world.dialogueSeen.includes(line)&&currentLine!==line&&!repairDialogue.includes(line))repairDialogue.push(line);
 if(snapshot.componentId==='NAND'&&id==='safetycutoff'&&!world.dialogueSeen.includes('nand-discovery')&&!repairDialogue.includes('nand-discovery'))repairDialogue.unshift('nand-discovery');
}
function configureAudio(){audio.configure({...world.foundation.settings,muted:world.muted});reduced=matchMedia('(prefers-reduced-motion: reduce)').matches||world.foundation.settings.reducedMotion;document.documentElement.dataset.reducedMotion=String(reduced);const b=document.querySelector('[data-action="mute"]');if(b){b.innerHTML=svg(world.muted?'mute':'sound');b.setAttribute('aria-label',world.muted?'Enable sound':'Mute sound');}}
function saveCurrentWorld(){return developerRequested?developer?.save(world)===true:saveWorld(world);}
function persist(immediate=false){
  if(previewRequested)return;
  clearTimeout(saveTimer);
  if(isEngineeringDemo(world)){const el=document.querySelector('#saved');if(el){el.textContent='DEMO · not saved';el.classList.add('visible');}return;}
  const write=()=>{const ok=saveCurrentWorld(),el=document.querySelector('#saved');if(el){el.textContent=ok?(world.environmentWorkstations?'WORKSTATION TEST · not saved':developerRequested?'DEV session saved':isInventoryPilot(world)?'Inventory pilot saved':'Notebook saved'):(pilotSession?.message||'Storage unavailable — keep this tab open');el.classList.add('visible');setTimeout(()=>el.classList.remove('visible'),1600);}};
  if(immediate)write();else saveTimer=setTimeout(write,180);
}
function setInert(){const devLock=!!developer?.blocksGame;if(devLock)clearTimeout(lineTimer);const game=document.querySelector('#game');if(game)game.inert=devLock;const locked=devLock||gardenEmergency.active||!!power?.active||introPending||!!crash?.active||transitioning||!started||!!overlayType||presentation?.active||(nandBusy(world)&&!((isInventoryPilot(world)||isEarly(world))&&world.room==='relay'))||((pilotRequested||curriculumRequested)&&!pilotSession?.active)||pilotSession?.stale;if(locked)cancelMovement();document.querySelector('#overlay').inert=!!presentation?.active;const scrubberWorkbench=document.querySelector('#overlay > .workbench');if(scrubberWorkbench)scrubberWorkbench.inert=!!scrubberModal;document.querySelector('#title').inert=!started&&overlayType==='confirm';document.querySelector('#hotspots').inert=locked||hasPendingDiscovery();document.querySelector('.walk-layer').inert=locked||!corePowered(world);document.querySelector('.hud').inert=['pause','settings','outfitter','manual'].includes(overlayType)||lineCentered&&!linePaused||!!power?.active||introPending||!corePowered(world)||!!crash?.active||!started||gardenEmergency.active||!!diagnostic?.active||!!presentation?.active||hasPendingDiscovery();for(const b of document.querySelectorAll('[data-hotspot]'))b.disabled=(isInventoryPilot(world)||isEarly(world))&&nandBusy(world)&&b.dataset.hotspot!=='pickup-workshop.nand-cache';}
function refreshRoom(){
  const floor=floorSurface(world),walk=document.querySelector('.walk-layer');
  walk.style.top=(floor.back/270*100)+'%';walk.style.height=((floor.front-floor.back)/270*100)+'%';
  const room=analysisEnvironment(world)||ROOMS[world.room];
  document.querySelector('#room-title').textContent=room.title;
  document.querySelector('#room-subtitle').textContent=room.subtitle+(developerRequested&&world.environmentPreview?(sceneWorkstations(world)?' · WORKSTATION TEST / NOT SAVED':' · ENVIRONMENT PREVIEW'):'')+(isEngineeringDemo(world)?' · DEMO / NOT SAVED':isInventoryPilot(world)?' · INVENTORY PILOT':'');
  document.querySelector('#hotspots').innerHTML=roomHotspots(world,animations.companion).map(h=>`<button class="hotspot" data-hotspot="${h.id}" data-id="${h.id}" ${h.puzzleId?`data-puzzle="${h.puzzleId}"`:h.kind==='tutorial'?'data-tutorial="signed-binary"':''} data-state="${hotspotState(world,h.id)}" aria-description="${esc(hotspotState(world,h.id))}" aria-label="${esc(h.label)}" title="${esc(h.label)}" style="left:${h.x/480*100}%;top:${h.y/270*100}%;width:${h.w/480*100}%;height:${h.h/270*100}%"></button>`).join('');
  document.querySelector('#room-canvas').setAttribute('aria-label',sceneWorkstations(world)?'Illustrated '+analysisEnvironment(world).title+' with interactive workstations':isGalleryCurriculum(world)?'Illustrated Listening Gallery: sensor receiver, NAND signal bench, cryogenic decoder, hull voter, pressure register, future communications stations, Workshop return and closed Lab connection.':developmentEnvironment(world)?'Illustrated '+developmentEnvironment(world).title+' · read-only environment preview':CAMPAIGN_ROOMS[world.room]?'Illustrated '+CAMPAIGN_ROOMS[world.room].title+' with '+CAMPAIGN_ROOMS[world.room].repairs.length+(world.room==='relay'?' service covers, machinery, and workshop doors.':' service covers, machinery, watch record terminal and forward hatch.'):world.room==='engine'?'Illustrated engine room: brass blower, rising pressure gauge, steam leak, signal sensor, parts toolbox and maintenance hatch.':'Illustrated maintenance corridor: return hatch, engineering power monitor, pressure sensor, authorization controls beside the Life-Support Garden entrance.');
  hoverId=null;document.querySelector('#hover-label').textContent='';setInert();refreshHUD();syncExploration();
}
function refreshHUD(){
  creditHud?.sync(world,{visible:started&&corePowered(world)&&!power?.active&&!introPending&&!crash?.active&&(!document.querySelector('.hud').inert||['pause','settings','outfitter','manual'].includes(overlayType))});
  syncExploration();
  const guidedStep=refreshP01Guidance();
  const status=document.querySelector('#pilot-save-status');if(status){status.hidden=!pilotSession?.message;if(pilotSession?.message)status.querySelector('span').textContent=pilotSession.message;}
  document.querySelector('#game').dataset.openingState=!corePowered(world)?'off':power?.active?'startup':'ready';
  document.querySelector('#objective').textContent=power?.active?['EMERGENCY CORE / RELAY ENGAGED','DISTRIBUTION BUS / RESTARTING','EMERGENCY LIGHTS / STABILIZING','MAINTENANCE UNIT / BOOTING','EMERGENCY SYSTEMS ONLINE'][power.view?.stage||0]:!corePowered(world)?'Activate G.R.E.G. — EMERGENCY CORE POWER':workstationObjective(world)??developmentEnvironment(world)?.objective??(guidedStep?.objective||objective(world));
  for(const b of document.querySelectorAll('[data-hotspot]')){
    const state=hotspotState(world,b.dataset.hotspot);if(b.dataset.state!==state)b.dataset.state=state;
    if(b.dataset.hotspot==='pickup-engine.not')b.dataset.pickupGlow=String(enginePartsGlow(world,{powerRestoring:!!power?.active}));
  }
  if(hoverId){const h=roomHotspots(world,animations.companion).find(x=>x.id===hoverId);if(h)document.querySelector('#hover-label').textContent=`${h.label} · ${hotspotState(world,hoverId)}`;}
  for(const el of document.querySelectorAll('[data-pressure]'))el.textContent=Math.round(world.pressure);
  const readout=document.querySelector('#machine-readout');if(readout&&panel)readout.textContent=panel==='ventilation'?`BLOWER ${world.machines.ventilation.output?'RUNNING':'STOPPED'} / PRESSURE ${Math.round(world.pressure)}`:panel==='security'?`LIVE AUTH ${machineInputs(world,'security').A} / SAFE ${machineInputs(world,'security').B}`:`${world.machines[panel].certified?'SYSTEM VERIFIED':'REPAIR REQUIRED'} · ${completedRepairs(world)}/${repairTotal()} SYSTEMS`;
}
function resetLine(){clearTimeout(lineTimer);currentLine=null;lineAfter=null;lineMessages=[];lineIndex=0;lineCentered=false;linePaused=false;document.querySelector('#dialogue').hidden=true;}
function renderLine(){
 if(!currentLine||linePaused)return;clearTimeout(lineTimer);
 const [speaker]=LINES[currentLine]||['G.R.E.G.'],text=lineMessages[lineIndex]??document.querySelector('#line').textContent;
 if(lineCentered){
  if(overlayType&&overlayType!=='story-conversation')return;
  paper(speaker,conversationMarkup(speaker,text)+arithmeticDialogueVisual(currentLine,lineIndex,reduced)+(currentLine==='ripple-overflow'?rippleOverflowVisual(world.circuits.ripple_adder):'')+(currentLine==='scrubber-demorgan-discovery'&&lineIndex===1?'<p class="lesson-equation"><strong>'+esc(DEMORGAN_IDENTITY)+'</strong></p>':''),[{label:'CONTINUE',action:'continue-dialogue'}],(currentLine.startsWith('problem-')?'EQUIPMENT INTRODUCTION':'KESTREL / CONVERSATION')+' · '+(lineIndex+1)+' OF '+lineMessages.length,'story-conversation');
  const button=document.querySelector('[data-action="continue-dialogue"]');button.dataset.dialogueTurn=String(++dialogueTurn);button.focus({preventScroll:true});return;
 }
 document.querySelector('#speaker').textContent=speaker;document.querySelector('#line').textContent=text;
 const el=document.querySelector('#dialogue');el.scrollTop=0;el.hidden=!!overlayType;document.querySelector('.dialogue-hint').textContent=(lineMessages.length>1?(lineIndex+1)+' / '+lineMessages.length+' · ':'')+'CLICK TO CONTINUE';lineTimer=setTimeout(advanceLine,14000);
}
function say(id,{force=false,after=null,messages=null,centered=importantDialogue(id)}={}){
 if(!LINES[id]||(!force&&world.dialogueSeen.includes(id))){after?.();return;}
 if(linePaused&&currentLine!==id)resetLine();
 if(currentLine&&lineCentered){
  if(currentLine===id){linePaused=false;renderLine();return;}
  if(centered&&!repairDialogue.some(entry=>(typeof entry==='string'?entry:entry.id)===id))repairDialogue.push({id,options:{force,after,messages,centered}});
  return;
 }
 resetLine();currentLine=id;lineAfter=after;lineMessages=(messages||[LINES[id][1]]).flatMap(text=>textPages(text,Math.max(90,Math.min(250,Math.round(innerWidth*.25)))));lineCentered=centered;
 if(!centered&&!world.dialogueSeen.includes(id))world.dialogueSeen.push(id);
 renderLine();persist();
}
function sayTeaching(id){const lesson=lessonDefinition(id,world);if(!lesson||lineCentered&&!linePaused)return;resetLine();currentLine='lesson-'+id;lineMessages=textPages(lesson.text,Math.max(90,Math.min(250,Math.round(innerWidth*.25))));lineAfter=null;document.querySelector('#speaker').textContent='G.R.E.G.';document.querySelector('#line').textContent=lineMessages[0];document.querySelector('#dialogue').scrollTop=0;document.querySelector('#dialogue').hidden=!!overlayType;lineTimer=setTimeout(advanceLine,10000);}
function advanceLine(){
 if(lineCentered&&(linePaused||overlayType!=='story-conversation'))return;
 if(lineIndex+1<lineMessages.length){lineIndex++;renderLine();return;}
 const next=lineAfter,centered=lineCentered,id=currentLine;
 if(centered&&id&&!world.dialogueSeen.includes(id))world.dialogueSeen.push(id);
 resetLine();
 if(centered){overlayType='dialogue-finished';closeOverlay({deferDialogue:true});}
 if(centered)persist(true);next?.();flushRepairDialogue();
}
function flushRepairDialogue(){if(repairDialogue.length&&!currentLine&&!overlayType&&!presentation?.active&&!hasPendingDiscovery()){const entry=repairDialogue.shift();if(typeof entry==='string')say(entry,{force:true});else say(entry.id,{...entry.options,force:true});}}

function attention(id){document.querySelector(`[data-hotspot="${id}"]`)?.classList.add('attention');}

function paper(title,body,buttons=[],kicker='ENGINEER’S OBSERVATION',type='inspect'){
  const integrated=!!scrubberModal&&['pickup','story-conversation'].includes(type);
  if(!integrated){if(scrubberModal){scrubberModal.host.remove();scrubberModal=null;}outfitter?.dispose();outfitter=null;menuParent=null;}
  const navigational=action=>action==='close'||/^(find-|open-|forward-room|watch-record)/.test(action),simpleInspect=type==='inspect'&&buttons.every(b=>navigational(b.action));if(simpleInspect)buttons=[{label:buttons.length===1&&buttons[0].preserveLabel?buttons[0].label:'CLOSE',action:'close'}];
  if(!document.activeElement?.closest('#overlay'))overlayReturnFocus=document.activeElement;
  if(!integrated){diagnostic?.dispose(false);diagnostic=null;editor?.endDiagnostic();editor?.resizeObserver?.disconnect();editor=null;panel=null;practiceContext=null;}
  overlayType=type;pendingInteraction=null;
  if(!started&&type!=='confirm')document.querySelector('#title').hidden=true;
  const host=integrated?scrubberModal.host:document.querySelector('#overlay');host.hidden=false;
  host.innerHTML=`<section class="paper-window ${['opening-conversation','story-conversation'].includes(type)?'centered-conversation':['nand-briefing','service-warning','pilot-choice'].includes(type)?'conversation-window':''}" data-popup-kind="${type}" data-layout="${body.replace(/<[^>]*>/g,'').length<320&&buttons.length<=3?'compact':'full'}" role="dialog" aria-modal="true" aria-labelledby="paper-title"><button class="close-window" data-action="close" aria-label="Close inspection">×</button><div class="kicker">${esc(kicker)}</div><h2 id="paper-title">${esc(title)}</h2>${body}<div class="window-actions">${buttons.map((b,i)=>`<button class="brass-button ${i?'subtle':''}" data-action="${b.action}">${esc(b.label)}</button>`).join('')}</div></section>`;
  if(simpleInspect||['opening-conversation','story-conversation'].includes(type))host.querySelector('.close-window')?.remove();
  document.querySelector('#dialogue').hidden=true;setInert();
  const heading=host.querySelector('#paper-title');heading.tabIndex=-1;heading.focus({preventScroll:true});host.scrollTop=0;host.querySelector('.paper-window').scrollTop=0;
}
function closeOverlay({deferDialogue=false}={}){
  if(scrubberModal){closeScrubberModal();return;}
  // Cancelling a title child is presentation-only: retain its DOM and leave the voyage untouched.
  if(!started&&overlayType==='confirm'){
    const focus=overlayReturnFocus,host=document.querySelector('#overlay');
    overlayType=null;host.hidden=true;host.replaceChildren();overlayReturnFocus=null;setInert();
    if(focus?.isConnected&&focus.closest('#title'))focus.focus({preventScroll:true});
    else document.querySelector('#title [data-action="title-new"]')?.focus({preventScroll:true});
    return;
  }
  if(overlayType==='manual'){closeManual();return;}
  if(menuParentDestination(overlayType,menuParent)==='pause'){const action=overlayType==='outfitter'?'outfitter':'settings';pause();document.querySelector('.pause-window [data-action="'+action+'"]')?.focus({preventScroll:true});return;}
  menuParent=null;
  if(overlayType==='fabricator-lock'){showFabricator();return;}
  if(overlayType==='opening-conversation'){advanceOpeningIntro();return;}
  if(overlayType==='story-conversation'&&currentLine==='garden-exit-fault'&&gardenEmergency.phase==='warning'){advanceLine();return;}
  if(overlayType==='story-conversation')linePaused=true;
  armedGuidePart=null;
  const returnFromEmergency=overlayType==='garden-emergency';
  gardenBinary?.dispose();gardenBinary=null;
  dataConsole?.dispose();dataConsole=null;
  outfitter?.dispose();outfitter=null;
  const previous=overlayType;diagnostic?.dispose(false);diagnostic=null;editor?.endDiagnostic();presentation?.cancel();practiceContext=null;editor?.cancelPan();editor?.resizeObserver?.disconnect();overlayType=null;panel=null;editor=null;document.querySelector('#overlay').hidden=true;document.querySelector('#overlay').innerHTML='';
  if(returnFromEmergency)gardenEmergency.returnToEngineer(world);
  updateWorld(world,0);setInert();refreshHUD();if(started)persist();
  if(currentLine&&!linePaused&&!deferDialogue)renderLine();
  if(!started)title();
  if(previous==='settings'&&!started){document.querySelector('[data-action="settings"]')?.focus({preventScroll:true});overlayReturnFocus=null;}
  if(overlayReturnFocus?.isConnected)overlayReturnFocus.focus({preventScroll:true});else if(!started&&titleUnlocked&&previous!=='settings')document.querySelector('[data-action="title-new"]')?.focus({preventScroll:true});overlayReturnFocus=null;
  if(!deferDialogue)flushRepairDialogue();
}
function inspectObject(id){
  if(sceneWorkstations(world)){const station=sceneWorkstation(world,id);if(station){if(station.kind==='tutorial')openSignedBinary();else inspectCampaign('repair-'+station.puzzleId);return;}if(id.startsWith('pickup-')){inspectPickup(id.slice(7));return;}}
  if(id==='greg')engineerVisual.play('lookGreg',world,animations,{facing:Math.sign((animations.companion?.x??animations.actor.x)-animations.actor.x)||animations.actor.facing});
  if((previewRequested||(developerRequested&&developmentEnvironment(world)))&&!(presentationPreview&&id===CORE_SWITCH_ID)){const h=roomHotspots(world,animations.companion).find(h=>h.id===id),dev=developmentEnvironment(world);paper(h?.label||'Ship environment preview',dev?'<p>'+esc(h?.description||'G.R.E.G. accompanies the engineer using the existing follow and dialogue interactions. These machinery stations are planned, not playable puzzles.')+'</p><p>Read-only environment preview. No hardware, certifications, records or campaign progress are granted.</p>':'<p>This is the production ship environment. Walk with A/D or the arrow keys, click the floor, or use the brass edge arrows.</p><p>Preview inspections are read-only. No components, repairs, records or campaign progress are granted.</p>',[{label:'Back to environment preview',action:'close'}],dev?'PLANNED FUNCTIONALITY / ENVIRONMENT PREVIEW':'LOCAL ENVIRONMENT PREVIEW');return;}
  if(isGalleryCurriculum(world)&&id==='signed-binary'){openSignedBinary();return;}
  if(isGalleryCurriculum(world)&&id==='gallery-exit'){paper('Computation Lab connection','<p>'+esc(world.machines.log_overflow.certified?'LISTENING GALLERY COMPLETE. Your progress is saved through P15. Proceed to the Computation Lab for P16–P19.':'Complete the Listening Gallery workstations before proceeding toward the Computation Lab.')+'</p>',[{label:'CLOSE',action:'close'}],'KESTREL / CAMPAIGN CHECKPOINT');return;}
  if(isGalleryCurriculum(world)&&id.startsWith('planned-')){const h=roomHotspots(world).find(h=>h.id===id);paper(h?.label||'Future Gallery station','<p>'+esc(id==='planned-exit'?'The Computation Lab is not available in this package. Your Gallery progress is saved.':h?.description||'This equipment is reserved for a future lesson.')+'</p>',[{label:'Back to Gallery',action:'close'}],'GALLERY / FUTURE STATION');return;}
  if(id==='scene-observation'){const h=roomHotspots(world).find(h=>h.id===id);paper(h?.label||'Observation window','<p>'+esc(h?.description||'The damaged communications array is visible beyond the ship.')+'</p>',[{label:'CLOSE',action:'close'}]);return;}
  if(id===CORE_SWITCH_ID){
    if(!corePowered(world)){const result=dispatchCommand(world,{type:'ACTIVATE_EMERGENCY_CORE',targetId:id});if(!result.ok){feedback(result.error,true);return;}animations.coreThrowUntil=animations.time+.9;persist(true);power.start();animations.power=power.view;refreshRoom();}
    else paper('Emergency core — ON','<p>The temporary core powers G.R.E.G. and emergency diagnostics. The ship’s main systems still need repair.</p><p>The mechanical switch is protected during the voyage. It cannot be turned OFF while the ship depends on emergency control.</p>',[{label:'Back to room',action:'close'}],'G.R.E.G. / EMERGENCY CORE POWER');
    return;
  }
  const inspected=dispatchCommand(world,{type:'INSPECT',targetId:id});if(!inspected.ok){feedback(inspected.error,true);return;}
  if(id.startsWith('repair-')||['fan','sensor','gauge','vent-panel','reader','pressure','security-panel'].includes(id)){const target=roomHotspots(world,animations.companion).find(h=>h.id===id);engineerVisual.play('operate',world,animations,{facing:Math.sign((target?target.x+target.w/2:animations.actor.x+1)-animations.actor.x)||animations.actor.facing});}
  audio.effect();persist();
  if(id.startsWith('pickup-')){inspectPickup(id.slice(7));return;}
  if(CAMPAIGN_ROOMS[world.room]){inspectCampaign(id);return;}
  switch(id){
    case 'fan':
      paper('VENTILATION FAN',world.machines.ventilation.certified?'<p>The fan is ON. Ventilation is restoring safe pressure.</p>':'<p>The fan is OFF, but it needs to be ON.</p><p>The sensor is sending a 0 signal. We need to invert that signal so the fan receives a 1.</p><p class="inspection-objective"><strong>OBJECTIVE: INVERT THE SENSOR SIGNAL TO ACTIVATE THE FAN.</strong></p>',[{label:'CLOSE',action:'close'}],'VENTILATION / V-04');break;
    case 'sensor':
      paper('Someone bridged the inverter.',`<p>The sensor is labelled <strong>INHIBIT</strong>. Its 0 should enable the fan; its 1 should stop it. The replacement bridge sends that signal straight through.</p><p>The service cover beside the pressure vessel holds the damaged logic.</p>`,[{label:'Find the service cover',action:'find-vent-panel'}],'SCORCHED SIGNAL SENSOR');break;
    case 'gauge':
      paper('The needle tells the truth.',`<p>Pressure: <strong><span data-pressure>${Math.round(world.pressure)}</span> / 100</strong>.</p><p>${world.machines.ventilation.output?'The blower is relieving the pipe. Below 45, the pressure latch releases the maintenance hatch.':'The needle is climbing. The warning bell and steam leak will continue until the blower draws the pressure down.'}</p>`,[{label:'Back to room',action:'close'}],'AUXILIARY PRESSURE');break;
    case 'vent-panel':
      openPanel('ventilation');break;
    case 'engine-door':
      if(!canTravel(world,'corridor')){paper('The pressure latch is holding.',`<p>A mechanical safety catch holds the hatch shut. Its release line comes from the ventilation governor.</p><p>Pressure must settle below 45. Current reading: <strong><span data-pressure>${Math.round(world.pressure)}</span></strong>.</p>`,[{label:'Back to the machinery',action:'close'}],'MAINTENANCE HATCH');return;}
      travel('corridor');break;
    case 'return':travel('engine');break;
    case 'onward':
      if(canTravel(world,'life'))travel('life');
      else paper('The Garden door is interlocked.',`<p>The door requires engineering authorization and safe pressure. Live signals: AUTH = ${machineInputs(world,'security').A}; SAFE = ${machineInputs(world,'security').B}.</p><p>Inspect the authorization control box beside the doorway.</p>`,[{label:'Find the interlock cover',action:'find-security-panel'},{label:'Back to corridor',action:'close'}]);
      break;
    case 'reader':
      paper('Engineering authorization.',`<p>AUTH is <strong>${machineInputs(world,'security').A?'HIGH':'LOW'}</strong>. The engaged ventilation repair restores this power signal automatically. No maintenance pass is needed.</p><p>The interlock must also check safe pressure.</p>`,[{label:'CLOSE',action:'close'}],'ENGINEERING POWER MONITOR');break;
    case 'pressure':
      say('safety');paper('The other half of permission.',`<p>The pressure safety line is <strong>${machineInputs(world,'security').B?'HIGH / SAFE':'LOW / UNSAFE'}</strong>. It comes from the engine room, not from a collectible item.</p><p>The Garden door must check <em>both</em> signals. Its control box is mounted beside the doorway.</p>`,[{label:'Find the interlock cover',action:'find-security-panel'}],'PRESSURE SAFETY SENSOR');break;
    case 'security-panel':
      openPanel('security');break;
    case 'greg':
      if(world.room==='engine'){say(world.machines.ventilation.certified?'stable':has(world,'inspected_sensor')?'panel':'fan',{force:true});attention(world.machines.ventilation.certified?'engine-door':has(world,'inspected_sensor')?'vent-panel':'sensor');}
      else{say('interlock',{force:true});attention('security-panel');}break;
  }
}
function inspectPickup(id){
  const p=PICKUP_LOCATIONS[id],a=pickupAvailability(world,id);
  const types=(a.remaining||[]).reduce((counts,key)=>{const type=FINITE_GATES[key].componentType;counts[type]=(counts[type]||0)+1;return counts;},{});
  paper(p.name,'<p>'+esc(a.message)+'</p>'+pickupSummary(types,id==='workshop.nand-cache'),
    [...(a.ok&&a.state==='available'?[{label:'Collect components',action:'collect-'+id}]:[]),{label:scrubberModal?'Back to circuit':'Back to room',action:'close'}],'PHYSICAL SUPPLY','pickup');
}
function collectPickup(id){
  if(previewRequested)return;
  const result=dispatchCommand(world,{type:'CollectGate',pickupId:id});
  if(!result.ok&&scrubberModal){closeScrubberModal();feedback(result.error,true);return;}
  if(!result.ok){paper('Components unavailable.','<p>'+esc(result.error)+'</p>',[{label:'Reload safely',action:'reload'},{label:'Back to room',action:'close'}]);return;}
  persist(true);refreshRoom();
  const quantities=(result.collected||[]).reduce((a,key)=>{const type=FINITE_GATES[key].componentType;a[type]=(a[type]||0)+1;return a;},{});
  if(scrubberModal&&id==='garden.demorgan-kit'){present(result.events);showScrubberPartsDialogue();refreshPartStock();return;}
  closeOverlay();present(result.events);
  const firstTypes=new Set((result.events||[]).filter(e=>e.type==='component.found').map(e=>e.parameters.componentId)),copies=Object.entries(quantities).filter(([type])=>!firstTypes.has(type));
  const toast=document.querySelector('#pickup-toast');clearTimeout(toastTimer);toast.hidden=true;
  if(result.duplicate||copies.length){toast.innerHTML=result.duplicate?'This compartment is empty.':copies.map(([type,n])=>`<svg viewBox="0 0 40 34" aria-hidden="true">${gateSymbol(type)}</svg><span>+${n} ${type} GATE${n===1?'':'S'}</span>`).join('');toast.hidden=false;toastTimer=setTimeout(()=>{toast.hidden=true;},2400);}
}
// A child of the existing overlay: keep the editor, nodes and handlers mounted.
function beginScrubberModal(){
 if(scrubberModal)return;cancelMovement();const host=document.createElement('div');host.className='overlay scrubber-modal';host.dataset.scrubberModal='true';document.querySelector('#overlay').append(host);scrubberModal={host,focus:document.activeElement};setInert();
}
function closeScrubberModal(){
 const previous=scrubberModal;if(!previous)return;scrubberModal=null;previous.host.remove();overlayType='repair';syncScrubberActions();setInert();if(previous.focus?.isConnected)previous.focus.focus({preventScroll:true});
}
function syncScrubberActions(){
 if(panel!=='scrubber'||!servicePending(world))return;
 const service=serviceState(world),locked=!service.drawerCollected,host=document.querySelector('#overlay > .workbench');if(!host)return;
 const primary=host.querySelector('[data-action="test"],[data-action="grab-emergency-parts"]');primary.dataset.action=locked?'grab-emergency-parts':'test';primary.querySelector('span').textContent=locked?'GRAB EMERGENCY PARTS':'TEST & ENGAGE';primary.disabled=false;
 for(const action of ['clear-panel','monitor','hint'])host.querySelector('[data-action="'+action+'"]').disabled=locked;
 for(const button of host.querySelectorAll('[data-part]'))button.disabled=locked||!!editor.damageInspection;
 const explanation=puzzleBrief('scrubber',world);host.querySelector('[data-puzzle-objective]').textContent='OBJECTIVE: '+explanation.objective;host.querySelector('.repair-spec').textContent=explanation.constraint;
 feedback(locked?'Collect the emergency components directly from this panel.':'The original circuit activated the scrubber only when neither warning was active.');
}
function showScrubberPartsDialogue(){
 if(world.dialogueSeen.includes('scrubber-emergency-parts')){closeScrubberModal();return;}
 beginScrubberModal();overlayType=null;LINES['scrubber-emergency-parts']=['G.R.E.G.',SCRUBBER_PARTS_MESSAGES[0]];say('scrubber-emergency-parts',{messages:SCRUBBER_PARTS_MESSAGES,centered:true,after:syncScrubberActions});
}
function showScrubberDiscovery(){
 const service=serviceState(world);if(!service?.applied||!service.discoveryPending||service.explanationPresented)return;
 LINES['scrubber-demorgan-discovery']=['G.R.E.G.',DEMORGAN_COMPLETION_MESSAGES[0]];say('scrubber-demorgan-discovery',{messages:DEMORGAN_COMPLETION_MESSAGES,centered:true,force:true,after:()=>{const result=dispatchCommand(world,{type:'ACK_DEMORGAN'});if(result.ok)persist(true);resumeMilestoneStory();}});
}
function refreshPartStock(){
  if(!editor||!panel)return;
  for(const card of componentCards(world,panel,{practice:!!practiceContext,graph:editor.circuit})){
    const b=document.querySelector('[data-part="'+card.type+'"]');if(!b)continue;
    b.querySelector('.quantity-badge').textContent=card.badge;b.querySelector('.quantity-badge').classList.toggle('unlimited',!card.finite);b.setAttribute('aria-disabled',String(card.disabled));
    b.setAttribute('aria-label',card.type+' · '+(card.finite?card.quantity+' available':card.practice?'temporary practice supply':'compatibility supply'));
    b.title=(panel==='float_nav'&&['XOR4','FAN4'].includes(card.type)?(card.type==='XOR4'?'4-BIT CONDITIONAL INVERTER — XOR4: four XOR channels; MASK comes from FAN4. ':'CONTROL SPLITTER — FAN4: copy SUB to all four control lanes. '):'')+(card.finite?'Drag or click to place '+card.type+' · '+card.quantity+(card.automatic?' available · automatic supply':' loose'):card.practice?'Temporary practice parts; no stock is consumed':'Legacy compatibility supply; no manufacturing entitlement');
  }
}
function inspectCampaign(id){
  if(id==='repair-adc_precision'&&isGalleryCurriculum(world)){openAsciiTerminal();return;}
  if(id==='fabricator'){showFabricator();return;}
  const room={...CAMPAIGN_ROOMS[world.room],repairs:roomRepairIds(world,world.room,CAMPAIGN_ROOMS[world.room].repairs)},index=campaignRoute(world).indexOf(world.room);
  const needed=room.repairs.find(key=>!world.machines[key].certified);
  if(id.startsWith('repair-')){
    const key=id.slice(7);if(!room.repairs.includes(key))return;
    if(key==='scrubber'&&servicePending(world)){openPanel('scrubber');return;}
    const inspection=investigatePuzzle(world,key),availability=puzzleAvailability(world,key);
    if(!inspection.ok||!['BUILDABLE','TESTED','APPLIED'].includes(availability.state)){paper('This controller is waiting.','<p>'+esc(inspection.error||availability.reason)+'</p>',[{label:'Back to room',action:'close'}]);return;}
    openPanel(key);return;
  }
  if(id==='back'&&world.room==='relay'&&!nandDoors(world).back){paper('The entrance latch is sealed.','<p>The surge burned its AND controller. Rebuild that function with NAND gates to release the entrance.</p>',[{label:'Inspect entrance controller',action:'open-nandand'},{label:'Back to workshop',action:'close'}]);return;}
  if(id==='back'){travel(campaignRoute(world)[index-1]);return;}
  if(id==='greg'&&world.room==='relay'){showNandBriefing({force:true});return;}
  if(id==='greg'&&splitGallery(world)&&world.room==='navigation'){if(!world.machines.float_nav.certified)sayTeaching('float_nav');else paper('ALU arithmetic foundation restored','<p>One shared circuit now adds or subtracts. The later ALU construction and operation lessons remain planned.</p>',[{label:'CLOSE',action:'close'}]);return;}
  if(id==='greg'&&splitGallery(world)&&world.room==='computation'){const next=['navbits','trajectory','ripple_adder','twos_complement','addsub'].find(key=>!world.machines[key].certified);if(next)sayTeaching(next);else paper('Arithmetic complete','<p>Addition, negation, and subtraction are connected. Continue toward Navigation Control.</p>',[{label:'CLOSE',action:'close'}]);return;}
  if(id==='greg'&&isGalleryCurriculum(world)&&world.machines.xorfab?.certified){if(world.room==='blackbox'&&!world.foundation.curriculum.asciiActivity?.complete){LINES['intro-ascii']=['G.R.E.G.','The flight recorder stores character codes. Use the ASCII Transmission Terminal reference to read the message and identify its ending byte.'];say('intro-ascii',{force:true});return;}if(signedTutorialRequired(world)){say('signed-binary-intro',{force:true});return;}const next=['cryo_signed','hull','pressure_width','log_overflow'].find(key=>!world.machines[key].certified);sayTeaching(next||'pressure_width');return;}
  if(id==='greg'&&isGalleryCurriculum(world)){say(world.machines.sensordiff.certified?'gallery-build-xor':'gallery-xor-intro',{force:true});return;}
  if(id==='greg'||id.startsWith('greg-')){say((world.logs.includes(campaignRecord(world.room))?'record-':'intro-')+(splitGallery(world)&&['testbay','blackbox','computation'].includes(world.room)?'sensors':world.room),{force:true});return;}
  if(id==='binary-decoder'&&world.room==='life'){openGardenBinary();return;}
  if(id==='watch-record'&&world.room!=='relay'){
    if(!repairedRoom(world,world.room)){paper('The record terminal has no clean supply.','<p>Restore all local controllers to recover the watch record.</p>',[{label:'Open '+CAMPAIGN_REPAIRS[needed].short,action:'open-'+needed},{label:'Back to room',action:'close'}]);return;}
    recoverCampaignRecord(world);persist(true);showCampaignRecord(world.room);return;
  }
  if(id==='forward'){
    if(world.room==='life'&&gardenExitPhase(world)==='ready'){const failed=dispatchCommand(world,{type:'TRIGGER_SCRUBBER_FAILURE'});if(failed.ok&&!failed.duplicate){cancelMovement();gardenEmergency.start(world);persist(true);refreshRoom();setInert();}return;}
    if(world.room==='life'&&gardenExitPhase(world)==='emergency'){paper('WORKSHOP BULKHEAD LOCKED','<p>Inspect the failed scrubber controller. The air system must be safe before this bulkhead can release.</p>',[{label:'CLOSE',action:'close'}]);return;}
    if(world.room==='life'&&gardenExitPhase(world)==='locked'){paper('WORKSHOP ACCESS LOCKED','<p>Complete the Garden controllers and calibrate the Binary Data Decoder at the computer kiosk.</p>',[{label:'CLOSE',action:'close'}]);return;}
    if(world.room==='bridge'){showHelm();return;}
    if(canAdvance(world,world.room)){travel(campaignRoute(world)[index+1]);return;}
    const nextAction=world.room==='relay'&&!fabricatorActive(world)?{label:'Open fabricator',action:'open-fabricator'}:needed?{label:'Open '+CAMPAIGN_REPAIRS[needed].short,action:'open-'+needed}:world.room!=='relay'?{label:'Read watch record',action:'watch-record'}:null;
    paper('The forward latch is waiting.','<p>'+esc(objective(world))+'</p>',[...(nextAction?[nextAction]:[]),{label:'Back to room',action:'close'}]);return;
  }
  if(id==='machine-info'){
    if(world.room==='navigation'&&splitGallery(world))room.intro='Upgrade the existing four-bit adder: use SUB to select addition or subtraction with the same hardware.';
    if(world.room==='bridge'){showHelm();return;}
    paper(room.title, '<p>'+esc(room.intro)+'</p><ul>'+room.repairs.map(key=>'<li>'+esc(CAMPAIGN_REPAIRS[key].short)+': '+(world.machines[key].certified?'verified':'needs repair')+'</li>').join('')+'</ul>',world.room==='relay'?[{label:'Close Screen',action:'close',preserveLabel:true}]:[...room.repairs.map(key=>({label:'Open '+CAMPAIGN_REPAIRS[key].short,action:'open-'+key})),...(availableBlueprints(world).length?[{label:'Inspect drawing drawer',action:'drawings'}]:[]),{label:'Back to room',action:'close'}]);
  }
}
function openSignedBinary(practice=false,showCompleted=false){
 if(!isGalleryCurriculum(world)||splitGallery(world)&&world.room!=='testbay'||!world.machines.xorfab?.certified){paper('Binary-data workstation','<p>Complete the four-NAND XOR construction before calibrating signed binary.</p>',[{label:'CLOSE',action:'close'}]);return;}
 closeOverlay();overlayType='signed-binary';cancelMovement();const host=document.querySelector('#overlay');host.hidden=false;const local=practice||signedTutorialSatisfied(world);gardenBinary=new SignedBinaryUI(host,{practice:local,resumeComplete:showCompleted,art:panelArt,reduced:()=>reduced,getWorld:()=>world,send:c=>dispatchCommand(world,c),persist:()=>{if(!local)persist(true);},effect:(...args)=>audio.effect(...args),close:closeOverlay});gardenBinary.mount();document.querySelector('#dialogue').hidden=true;setInert();
}
function openGardenBinary(practice=false){
 if(world.room!=='life'||isEarly(world)&&!world.machines.safetycutoff?.certified){paper('Binary Data Decoder offline','<p>Restore the emergency safety cutoff before calibrating this terminal.</p>',[{label:'Back to Garden',action:'close'}]);return;}
 closeOverlay();overlayType='garden-binary';cancelMovement();const host=document.querySelector('#overlay');host.hidden=false;const local=practice||gardenDecoderComplete(world)||!isEarly(world);gardenBinary=new GardenBinaryUI(host,{practice:local,art:panelArt,reduced:()=>reduced,getWorld:()=>world,send:c=>{const r=dispatchCommand(world,c);if(r.ok&&r.completed){audio.effect('door');refreshHUD();}return r;},persist:()=>{if(!local)persist(true);},effect:(...args)=>audio.effect(...args),close:closeOverlay});gardenBinary.mount();document.querySelector('#dialogue').hidden=true;setInert();
}
function showGardenEmergency(){
 if(!servicePending(world)||world.room!=='life')return;
 dispatchCommand(world,{type:'ACK_SERVICE_WARNING'});persist(true);
 say('garden-exit-fault',{force:true,centered:true,messages:["Uh-oh. The scrubber just went offline. That bulkhead won't let us through until the air system is safe again.","We'd better check the scrubber controller. Something's definitely wrong."],after:()=>{gardenEmergency.returnToEngineer(world);setInert();}});
}

function showScrubberService(){openPanel('scrubber');}
function showFabricator(){
 const active=fabricatorActive(world),types=fabricationTypes(world);
 paper(active?'FABRICATOR ONLINE':'Fabricator offline',active?'<p><strong>AUTOMATIC COMPONENT SUPPLY ACTIVE</strong></p><p>Your satchel replenishes every unlocked gate. Components are available directly in each circuit editor; no return trips or manufacturing batches are needed.</p><div class="fabrication-grid">'+FABRICATION_TYPES.map(type=>'<button class="brass-button '+(types.includes(type)?'':'fabrication-locked')+'" data-action="fabricate-'+type+'" data-locked="'+!types.includes(type)+'" aria-label="'+type+(types.includes(type)?' · automatic supply · inspect':' · blueprint locked · inspect')+'"><svg viewBox="0 0 42 34" aria-hidden="true">'+gateSymbol(type)+'</svg>'+type+'<small>'+(types.includes(type)?manufacturedSupply(world,type)+' AVAILABLE · AUTO':'BLUEPRINT LOCKED')+'</small></button>').join('')+'</div>':'<p>Install all three NAND-only controllers. Engaging the final controller automatically restores the fabricator and component supply.</p>',[...(active?[{label:'Inspect fabrication blueprints',action:'drawings'}]:[]),{label:'Back to Workshop',action:'close'}],'WORKSHOP / AUTOMATIC MANUFACTURING','fabricator');
}
function activateFabricator(){const result=dispatchCommand(world,{type:'ACTIVATE_FABRICATOR'});if(result.ok){persist(true);showFabricator();}}
function manufacture(type){
 if(!fabricationTypes(world).includes(type)){paper('BLUEPRINT NOT UNLOCKED',"<p>We haven't learned how to manufacture this component yet.</p>",[{label:'CLOSE',action:'close'}],'WORKSHOP / '+type,'fabricator-lock');document.querySelector('.paper-window').classList.add('fabrication-lock-popup');return;}
 paper(type+' automatic supply','<p><strong>'+manufacturedSupply(world,type)+' AVAILABLE</strong> · AUTOMATIC COMPONENT SUPPLY ACTIVE</p><p>This construction is certified. Your satchel supplies modules wherever you build; installed hardware stays with its repair.</p>',[{label:'CLOSE',action:'close'}],'WORKSHOP / '+type,'fabricator-lock');
}

function showNandBriefing({force=false}={}){
 LINES['nand-briefing']=['G.R.E.G.','A supply surge burned the three controllers. Both doors have sealed. Emergency lighting is holding.'];
 say('nand-briefing',{force,messages:[LINES['nand-briefing'][1],'NAND is functionally complete: NAND gates alone can build every other Boolean logic function. We can replace the NOT, AND, and OR controllers with the spares in this workshop.'],after:()=>say('nand-memory',{force})});
}

function showCampaignRecord(room){
  const r=CAMPAIGN_ROOMS[room];if(!r?.record||!world.logs.includes(campaignRecord(room)))return;
  const next=campaignRoute(world)[campaignRoute(world).indexOf(room)+1];
  const storyRoom=room==='blackbox'?'sensors':room;
  if(!world.dialogueSeen.includes('record-'+storyRoom)){world.dialogueSeen.push('record-'+storyRoom);persist(true);}
  paper(r.record.title,'<pre>'+esc(r.record.text)+'</pre>',[{label:'Keep the record',action:'close'},...(world.room===room?[{label:room==='bridge'?'Approach the helm':'Continue to '+ROOMS[next].title,action:room==='bridge'?'helm':'forward-room'}]:[])],'KESTREL / WATCH RECORD','campaign-record');
}
function showHelm(choose=false){
  if(world.room!=='bridge')return;
  const story=pendingStoryConversation(world);if(story){closeOverlay({deferDialogue:true});resetLine();LINES[story.id]=['G.R.E.G.',story.messages[0]];say(story.id,{messages:story.messages,centered:true,after:()=>showHelm(choose)});return;}
  if(world.ending&&!choose){const e=ENDINGS[world.ending];paper(e.title,'<p>'+esc(e.text)+'</p><p><strong>'+repairTotal()+' / '+repairTotal()+' systems restored · '+world.logs.length+' optional records recovered</strong></p>',[{label:'Return to bridge',action:'close'},{label:'Ship notebook',action:'journal'},{label:'Review pilot selector',action:'pilot-choice'}],'THE KESTREL / REFUGE COURSE','ending');return;}
  if(!flightReady(world)){paper('The helm is still interlocked.','<p>'+esc(objective(world))+'</p><p>Every circuit must be restored before the crew authority selector can engage.</p>',[{label:'Back to bridge',action:'close'}]);return;}
  paper('Who takes the helm?','<p>The remote command channel is isolated. Both routes lead to the refuge. Your tested authority circuit will energize one pilot relay and keep the other LOW.</p><p><strong>Manual:</strong> the crew flies, with G.R.E.G. advising.<br><strong>G.R.E.G.:</strong> authorize him to fly, with your local disconnect retained.</p>',[{label:'Crew takes manual control',action:'fly-manual'},{label:'Authorize G.R.E.G.',action:'fly-greg'},{label:'Decide later',action:'close'}],'LOCAL CONSENT / AUTHORITY SELECTOR','pilot-choice');
}
function finishFlight(route){if(!engageFlight(world,route))return;persist(true);closeOverlay();audio.effect('repair');say('ending-'+route,{force:true});showHelm();}

function pickupSummary(types,slots=false){return '<div class="pickup-summary">'+Object.entries(types).map(([type,count])=>'<span class="pickup-part"><span class="pickup-chips">'+Array.from({length:slots?Math.min(6,count):1},()=>'<svg viewBox="0 0 40 34" aria-hidden="true">'+gateSymbol(type)+'</svg>').join('')+'</span><span>'+type+' GATE ×'+count+'</span></span>').join('')+'</div>';}
function cancelMovement(){pendingInteraction=null;queuedRoom=null;queuedPickupState=null;queuedIntent=null;animations.actor.target=animations.actor.x;animations.actor.walking=false;}
function canExplore(){return !gardenEmergency.active&&!developer?.blocksGame&&started&&corePowered(world)&&!power?.active&&!introPending&&!crash?.active&&!overlayType&&!presentation?.active&&!transitioning&&!pilotSession?.stale&&(!(pilotRequested||curriculumRequested)||pilotSession?.active)&&!nandBusy(world);}
function navigate(direction){if(!canExplore())return;const stop=nextNavigationStop(world,navigationOrigin(world,animations.actor),direction);if(stop)destination(stop.x);}
function destination(x){if(!canExplore())return;cancelMovement();animations.actor.target=clampWorldX(world,x);}
function syncExploration(){
 const cam=animations.cameraX||0,wide=extendedEnvironment(world),ready=canExplore();
 const byId=new Map(roomHotspots(world,animations.companion).map(h=>[h.id,h]));
 for(const b of document.querySelectorAll('[data-hotspot]')){
  const h=byId.get(b.dataset.hotspot);if(!h)continue;
  b.dataset.worldX=h.x;b.dataset.worldWidth=h.w;b.style.left=((h.x-cam)/480*100)+'%';if(h.id==='greg')b.style.top=(h.y/270*100)+'%';
  b.hidden=!visibleHotspot(h,cam);if(b.hidden)b.tabIndex=-1;else b.tabIndex=0;
 }
 for(const direction of [-1,1]){const b=document.querySelector('[data-edge="'+direction+'"]');if(!b)continue;const stop=nextNavigationStop(world,navigationOrigin(world,animations.actor),direction),available=wide&&ready&&!!stop;b.hidden=!available;if(stop){b.dataset.destination=stop.id;b.setAttribute('aria-label','Walk '+(direction<0?'left':'right')+' to '+stop.label);b.querySelector('.edge-label').textContent=stop.label;}b.classList.toggle('revealed',edgeHover===direction);}
}
function queueInteraction(id,{intent=null}={}){
 if(gardenEmergency.active||crash?.active||power?.active||introPending)return;
 if(!corePowered(world)){if(started&&id===CORE_SWITCH_ID&&!overlayType)inspectObject(id);return;}
 if(!started||overlayType||transitioning||presentation?.active||pilotSession?.stale||((pilotRequested||curriculumRequested)&&!pilotSession?.active)||(nandBusy(world)&&!((isInventoryPilot(world)||isEarly(world))&&id==='pickup-workshop.nand-cache')))return;
 const h=roomHotspots(world,animations.companion).find(x=>x.id===id);if(!h)return;
 cancelMovement();pendingInteraction=id;queuedRoom=world.room;queuedPickupState=h.pickupId?pickupAvailability(world,h.pickupId).state:null;queuedIntent=intent;animations.actor.target=clampWorldX(world,h.walk);document.querySelector('#hover-label').textContent=h.label;
}
function travel(room){
 if(transitioning||!canTravel(world,room))return;
 cancelMovement();if(lineCentered)resetLine();else advanceLine();audio.effect('door');const source=world.room,epoch=++travelEpoch;transitioning=true;setInert();
 const curtain=document.querySelector('#transition');curtain.classList.add('active');
 setTimeout(()=>{const valid=epoch===travelEpoch&&world.room===source&&!overlayType&&!presentation?.active&&canTravel(world,room);transitioning=false;curtain.classList.remove('active');if(!valid||!enterRoom(world,room)){setInert();return;}animations.enter(world);refreshRoom();persist(true);if(room==='corridor')say('corridor',{centered:false});},reduced?0:280);
}

function openAsciiTerminal(){
 if(!started||world.room!==(splitGallery(world)?'blackbox':'sensors'))return;
 if(!world.machines.pressure_width?.certified){paper('Terminal unavailable','<p>Complete the Pressure Register before decoding the transmission.</p>',[{label:'CLOSE',action:'close'}]);return;}
 resetLine();cancelMovement();dataConsole?.dispose();editor?.resizeObserver?.disconnect();editor=null;panel=null;overlayType='ascii';
 dataConsole=new AsciiTransmissionUI(document.querySelector('#overlay'),{getWorld:()=>world,send:c=>dispatchCommand(world,c),persist:()=>persist(true),close:closeOverlay});dataConsole.mount();setInert();
}
function openPanel(id,{practice=false}={}){
  if(id==='addsub'&&world.machines.addsub?.certified&&legacyAddsub(world.circuits.addsub))practice=true;
  if(id==='adc_precision'&&isEarly(world)&&world.foundation.curriculum.galleryVersion===1){openAsciiTerminal();return;}
  if(overlayType==='repair'&&panel===id&&Boolean(practiceContext)===practice)return;
  if(currentLine?.startsWith('p01-guide-'))resetLine();
  dataConsole?.dispose();dataConsole=null;
  if(previewRequested)return;
  if(!started||nandBusy(world)||world.room!==getPlayablePuzzle(id,world)?.roomAccessRequirements.roomId)return;
  const inspection=investigatePuzzle(world,id),availability=puzzleAvailability(world,id);
  if(!inspection.ok||!['BUILDABLE','TESTED','APPLIED'].includes(availability.state)){paper('Equipment unavailable','<p>'+esc(inspection.error||availability.reason||'Complete the required earlier repair before opening this equipment.')+'</p>',[{label:'CLOSE',action:'close'}],'KESTREL / REPAIR REQUIREMENTS');return;}
  if(id==='security'&&!practice){const cleared=bulkheadStarterCleanup(world);if(cleared&&editCircuit(world,id,cleared).ok)persist(true);}
  if(id==='pressure_width'&&!practice&&!world.machines.pressure_width.certified&&!world.dialogueSeen.includes(puzzleIntroKey(id,world))){
   const story=pendingStoryConversation(world);
   if(story?.id===puzzleIntroKey(id,world)){cancelMovement();LINES[story.id]=['G.R.E.G.',story.messages[0]];say(story.id,{messages:story.messages,centered:true});return;}
  }
  if(id==='float_nav'&&!practice&&!world.machines.float_nav.certified&&!world.dialogueSeen.includes(puzzleIntroKey(id,world))){const key=puzzleIntroKey(id,world);LINES[key]=['G.R.E.G.',ALU_INTRO[0]];say(key,{messages:ALU_INTRO,centered:true});return;}
  const introduction=id==='twos_complement'?null:puzzleIntroduction(id,world,{practice}),introKey=puzzleIntroKey(id,world);
  if(currentLine&&lineCentered){
   if(currentLine===introKey){linePaused=false;renderLine();return;}
   if(!linePaused){const previous=lineAfter,room=world.room,epoch=travelEpoch;lineAfter=()=>{previous?.();if(world.room===room&&travelEpoch===epoch&&!overlayType)openPanel(id,{practice});};return;}
   resetLine();
  }
  if(currentLine)resetLine();
  if(!overlayType&&introduction){
   LINES[introKey]=['G.R.E.G.',introduction.messages[0]];const room=world.room,epoch=travelEpoch;
   say(introKey,{messages:introduction.messages,centered:true,after:()=>{if(!overlayType&&world.room===room&&travelEpoch===epoch)openPanel(id,{practice});}});return;
  }

  if(!practice&&world.foundation.lessonProgress[id]?.stage==='INVESTIGATE')dispatchCommand(world,{type:'ADVANCE_LESSON',puzzleId:id,stage:'BUILD',path:'independent'});
  editor?.resizeObserver?.disconnect();practiceContext=practice?createPractice(id):null;panel=id;overlayType='repair';hintIndex=0;testResult=null;pendingInteraction=null;
  if(isDataConsole(id,world.circuits[id])){editor=null;const host=document.querySelector('#overlay');host.hidden=false;dataConsole=new (id==='twos_complement'?TwosComplementUI:GALLERY_DATA_IDS.includes(id)?GalleryDataUI:DataConsoleUI)(host,{id,art:panelArt,getWorld:()=>world,control:action=>dispatchCommand(world,{type:'CONVERTER_CONTROL',puzzleId:id,action}),edit:graph=>editCircuit(world,id,graph),test:()=>testRepair(world,id),hintUsed:()=>{const r=dispatchCommand(world,{type:'RECORD_CONSOLE_HINT',puzzleId:id});if(r.ok)persist(true);return r;},verifyStage:stage=>dispatchCommand(world,{type:id==='cryo_signed'?'VERIFY_DECODER_STAGE':'VERIFY_GALLERY_STAGE',puzzleId:id,stage}),engage:validationId=>applyRepair(world,id,validationId),effect:(...args)=>audio.effect(...args),reduced:()=>reduced,persist:()=>persist(true),close:closeOverlay,applied:r=>{closeOverlay();finishRepair(id,r.events||[],{pass:true});}});dataConsole.mount();setInert();return;}
  const damageView=needsScrubberInspection(world,id,{practice});
  const r=panelSpec(world,id),cards=componentCards(world,id,{practice,graph:practiceContext?.circuit}),finite=!practice&&cards.some(card=>card.finite),gateTypes=cards.map(card=>card.type),c=damageView?damagedScrubberGraph(world):structuredClone(practiceContext?.circuit||editableGraph(world,id)),diagnostic=practice?null:world.foundation.diagnostics[id],inputs={...(practiceContext?.inputs||diagnostic?.inputs||machineInputs(world,id))};
  const host=document.querySelector('#overlay');host.hidden=false;const explanation=puzzleBrief(id,world);
  host.innerHTML=`<section class="repair workbench" role="dialog" aria-modal="true" aria-label="${esc(r.title)} service panel"><header class="repair-top"><button class="repair-close" data-action="close" aria-label="Close service panel">×</button><h2>${practice?'Practice · ':isEngineeringDemo(world)?'Demo · ':''}${esc(r.title)}</h2><button class="repair-manual" data-action="manual" aria-label="Open Engineering Manual" title="Engineering Manual · return to this circuit">${svg('book')}</button><span class="header-hazard" aria-hidden="true"></span></header><div class="workbench-main"><div class="board-wrap"><svg id="circuit-board" class="board" viewBox="0 0 1200 600" role="group" tabindex="0" aria-label="Circuit workspace. Drag terminals to wire. Toggle CLOCK 0 to 1 to capture. Mouse wheel zooms, Alt-drag pans, 0 fits the board."></svg><button id="node-trash" class="board-trash" data-action="trash-node" aria-label="Delete selected gate" title="Drag a gate here to discard, or select a gate and click"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 10v7M14 10v7"/></svg></button></div><nav class="workbench-actions" aria-label="Circuit actions"><button id="clear-panel" class="workbench-action" data-action="clear-panel" title="Clear gates and wires; preserve fixed input and output modules"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 14L13 4l8 8-9 9H7l-4-4zM9 8l8 8M7 21h14"/></svg><span>CLEAR PANEL</span></button><button class="workbench-action" data-action="monitor"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 4v16M15 9v11M3 14h18"/></svg><span>TRUTH TABLE</span></button>${workbenchAction('engage',{action:'test'})}${workbenchAction('hint')}</nav></div><div class="repair-brief"><div class="repair-instructions"><strong class="puzzle-objective" data-puzzle-objective>OBJECTIVE: ${esc(explanation?.objective||r.problem)}</strong><p id="repair-feedback" class="repair-feedback" role="status" aria-live="polite">${esc(explanation?id==='float_nav'?explanation.intro:explanation.broken+' '+explanation.behavior:r.problem)}</p></div><strong class="repair-spec">${esc(explanation?.constraint||r.spec)}</strong></div><div class="repair-tray"><div class="parts-tray" style="--part-count:${gateTypes.length}"><span>${practice?'Temporary practice parts · no rewards':finite?'Physical components':isInventoryPilot(world)?'Compatibility supply · later puzzles remain unrestricted':'Spare Parts:'}</span>${gateTypes.map(g=>`<button draggable="true" class="part" data-part="${g}" title="Drag or click to place ${g}"><svg viewBox="0 0 42 34" aria-hidden="true">${gateSymbol(g)}</svg><span>${id==='float_nav'?(g==='XOR4'?'4-BIT CONDITIONAL INVERTER — XOR4':'CONTROL SPLITTER — FAN4'):componentLabel(g)}</span><b class="quantity-badge" aria-hidden="true">${cards.find(card=>card.type===g).badge}</b></button>`).join('')}</div></div><div id="monitor-host"></div></section>`;
  const board=host.querySelector('#circuit-board'),bounds=board.getBoundingClientRect(),height=id==='float_nav'?640:['ripple_adder','addsub'].includes(id)?600:Math.max(560,Math.round(1200*bounds.height/bounds.width));board.setAttribute('viewBox',`0 0 1200 ${height}`);
  editor=new Editor(board,{
    trashTarget:host.querySelector('#node-trash'),onSelectionChange:node=>{host.querySelector('#node-trash').classList.toggle('has-selection',!!node);},circuit:c,inputs,state:structuredClone(practiceContext?.state||diagnostic?.state||world.machineStates[id]||{}),height,width:1200,workbench:true,preserveLayout:(damageView&&!!c.layout)||['ripple_adder','addsub','float_nav'].includes(id),theme:'illustrated',art:panelArt,wirePalette:id==='ventilation'?['#e33239']:['#326dcc','#d8aa2d','#b154a5','#db563a','#d73742','#4a9a67'],
    onChange:()=>{if(practiceContext){try{const events=circuitEditEvents(practiceContext.circuit,editor.circuit);practiceContext.edit(editor.circuit);testResult=null;present(events);return {ok:true,circuit:practiceContext.circuit};}catch(e){feedback(e.message,true);return {ok:false};}}const result=editCircuit(world,id,editor.circuit);if(!result.ok){feedback(result.error,true);present([{type:'component.unavailable',parameters:{reason:result.error}}]);return result;}if(result.functional){editor.state={};editor.signalUntil=0;testResult=null;feedback('Circuit changed. Verify both signal states before engaging the machine.');}if(id==='ventilation'&&editor.circuit.nodes.some(n=>n.type==='NOT'))armedGuidePart=null;present(result.events);persist();refreshPartStock();return {...result,circuit:editableGraph(world,id)};},
    onInput:n=>{if(practiceContext){practiceContext.toggle(n.id);Object.assign(inputs,practiceContext.inputs);editor.refresh(inputs,practiceContext.state);present([{type:'input.toggled'}]);return;}const result=toggleDiagnostic(world,id,n.id);if(!result.ok){feedback(result.error,true);return;}Object.assign(inputs,result.diagnostic.inputs);editor.state=structuredClone(result.diagnostic.state);editor.refresh(inputs,editor.state);present(result.events);persist();feedback(n.role==='clock'?'Clock toggled. Only rising edges capture data.':'Logical evaluation updated immediately. Highlighted leads show their actual signal values.');},
    onMessage:feedback,
  });
  editor.blueprint=damageView?null:activeBlueprint(world,id);editor.render();
  const instance=editor;instance.resizeObserver=new ResizeObserver(()=>{if(editor!==instance)return;const r=board.getBoundingClientRect();if(r.width)instance.resizeWorkbench(Math.max(560,Math.round(1200*r.height/r.width)));});instance.resizeObserver.observe(board);
  document.querySelector('#dialogue').hidden=true;setInert();
  const wrap=host.querySelector('.board-wrap');
  wrap.addEventListener('dragover',e=>{if(draggedPart){e.preventDefault();e.dataTransfer.dropEffect='copy';}});
  wrap.addEventListener('drop',e=>{e.preventDefault();if(e.target.closest('#node-trash')){draggedPart=null;return;}const type=e.dataTransfer.getData('text/plain')||draggedPart;if(gateTypes.includes(type))editor.add(type,editor.point(e));draggedPart=null;});
  host.querySelectorAll('[data-part]').forEach(b=>{
    let drag=null,suppressClick=false;
    const cleanup=()=>{if(!drag)return;drag.ghost?.remove();wrap.classList.remove('accepts-part');b.classList.remove('placing-part');const id=drag.pointerId;drag=null;draggedPart=null;if(b.hasPointerCapture(id))b.releasePointerCapture(id);};
    b.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();selectP01Part(b.dataset.part);drag={pointerId:e.pointerId,x:e.clientX,y:e.clientY,moved:false};b.setPointerCapture(e.pointerId);});
    b.addEventListener('pointermove',e=>{
      if(!drag||drag.pointerId!==e.pointerId)return;
      if(!drag.moved&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>7){
        drag.moved=true;draggedPart=b.dataset.part;b.classList.add('placing-part');wrap.classList.add('accepts-part');
        drag.ghost=b.cloneNode(true);drag.ghost.removeAttribute('data-part');drag.ghost.removeAttribute('draggable');drag.ghost.setAttribute('aria-hidden','true');drag.ghost.className='part-ghost';host.appendChild(drag.ghost);
      }
      if(drag.ghost){drag.ghost.style.left=e.clientX+'px';drag.ghost.style.top=e.clientY+'px';}
    });
    b.addEventListener('pointerup',e=>{
      if(!drag||drag.pointerId!==e.pointerId)return;const moved=drag.moved,type=b.dataset.part;
      if(moved){const r=wrap.getBoundingClientRect(),t=host.querySelector('#node-trash').getBoundingClientRect(),inside=e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom,trash=e.clientX>=t.left&&e.clientX<=t.right&&e.clientY>=t.top&&e.clientY<=t.bottom;if(inside&&!trash)editor.add(type,editor.point(e));suppressClick=true;setTimeout(()=>{suppressClick=false;},0);}
      cleanup();
    });
    b.addEventListener('click',e=>{if(suppressClick){e.preventDefault();e.stopPropagation();suppressClick=false;}},true);
    b.addEventListener('pointercancel',cleanup);b.addEventListener('lostpointercapture',cleanup);
    b.addEventListener('dragstart',e=>e.preventDefault());
  });
  refreshPartStock();
  if(id==='ventilation'&&!practice&&p01Guided(world)){armedGuidePart=world.foundation.dataInspector.p01Guide?.selected?'NOT':null;host.querySelector('#clear-panel span').textContent='CLEAR CIRCUIT';board.addEventListener('click',e=>{if(armedGuidePart&&!e.target.closest('[data-node],[data-pin],[data-wire]')&&!editor.readOnly){e.preventDefault();e.stopImmediatePropagation();editor.add('NOT',editor.point(e));if(editor.circuit.nodes.some(n=>n.type==='NOT'))armedGuidePart=null;}},true);board.addEventListener('keydown',e=>{if(armedGuidePart&&e.target===board&&e.key==='Enter'){e.preventDefault();editor.add('NOT');if(editor.circuit.nodes.some(n=>n.type==='NOT'))armedGuidePart=null;}},true);}
  if(id==='float_nav')host.querySelector('.workbench').classList.add('ripple-construction','alu-foundation');
  if(id==='addsub')host.querySelector('.workbench').classList.add('subtractor-bench','ripple-construction');
  if(id==='ripple_adder')host.querySelector('.workbench').classList.add('ripple-construction');
  if(id==='hull'&&isGalleryCurriculum(world)){host.querySelector('.workbench').classList.add('hull-voter-console');host.querySelector('.repair-top h2').textContent='Hull Sensor Voter · A / B / C';host.querySelector('.repair-spec').textContent='THREE SENSORS · TWO OR MORE REPORTS';host.querySelector('#circuit-board').setAttribute('aria-label','Hull voting assembly. Toggle HULL A, HULL B and HULL C to experiment; wire real manufactured gates; verify all eight sensor combinations.');}
  if(id==='sensordiff'&&!practice&&world.foundation.curriculum.xorUseVersion!==1)host.querySelector('.parts-tray').innerHTML='<span>Installed diagnostic equipment · XOR comparator protected</span><small>Toggle the two sensors, inspect Truth Table, and reconnect their routing. No loose XOR gates are granted.</small>';
  if(damageView){
    dispatchCommand(world,{type:'INSPECT_SERVICE_CIRCUIT'});persist(true);editor.beginDiagnostic();editor.damageInspection=true;fitCircuitViewport(editor);board.removeAttribute('aria-disabled');board.setAttribute('aria-label','Damaged original scrubber controller. Inspect burned gates; wiring is read-only.');
    host.querySelector('.workbench').classList.add('damaged-controller-view');host.querySelector('#node-trash').hidden=true;
    host.querySelector('[data-action="test"]').disabled=true;
    for(const button of host.querySelectorAll('[data-part]'))button.disabled=true;
    feedback(serviceState(world).drawerCollected?'The original circuit activated the scrubber only when neither warning was active. Clear the burned hardware when you are ready.':'Collect the emergency components directly from this panel.');
    const inspect=node=>{const n=editor?.circuit.nodes.find(n=>n.id===node?.dataset.node);if(n?.faulty)feedback(n.type+' · '+n.id+': cracked casing, failed output (UNKNOWN). This retired part cannot be repaired or reused.');};
    board.addEventListener('click',e=>inspect(e.target.closest('[data-node]')));
    for(const node of board.querySelectorAll('.node.faulty')){node.setAttribute('tabindex','0');node.setAttribute('role','button');node.setAttribute('aria-label',node.getAttribute('aria-label')+' · damaged beyond repair');}
    board.addEventListener('keyup',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();inspect(e.target.closest('[data-node]'));}});

  }

  circuitHints=new CircuitHintUI({host,id,getWorld:()=>world,getEditor:()=>editor,send:c=>dispatchCommand(world,c),persist:()=>persist(true),practice});
  host.querySelector('.repair-close').focus();audio.effect();
  syncScrubberActions();
  const service=serviceState(world);if(!practice&&id==='scrubber'&&servicePending(world)&&service.drawerCollected&&!service.replacementStarted&&!world.dialogueSeen.includes('scrubber-emergency-parts'))showScrubberPartsDialogue();
}
function feedback(message,error=false){const el=document.querySelector('#repair-feedback');if(el){el.textContent=message;el.className=`repair-feedback ${error?'error':''}`;}}
function runTest(){
  if(!editor||!panel||diagnostic?.active||presentation?.active||editor.readOnly&&!editor.damageInspection||editor.drag||editor.wiring||scrubberModal)return;
  const id=panel,sourceEditor=editor,practice=!!practiceContext,serviceRun=isEarly(world)&&id==='scrubber'&&serviceState(world)?.triggered,graph=structuredClone(editor.circuit);
  testResult=practice?practiceContext.test():testRepair(world,id);
  // Test is authoritative now; Apply remains a separate explicit engagement transaction.
  let applied=null;
  if(!practice)persist(true);
  let model=Object.freeze({...prepareDiagnostic(panelSpec(world,id),graph,testResult),rewardPreview:circuitRewardPreview(world,id,{practice}),objective:puzzleBrief(id,world)?.objective});const outcome=diagnosticOutcome(model,null,{practice,awaitingEngage:!practice});
  if(serviceRun&&model.pass){model=Object.freeze({...model,comparison:{original:'NOT(A OR B)',replacement:'NOT(A) AND NOT(B)'}});}
  let events=[],viewer=null;
  sourceEditor.beginDiagnostic();sourceEditor.resizeObserver?.disconnect();
  const host=document.querySelector('#monitor-host'),main=document.querySelector('.workbench-main');
  main.append(host);document.querySelector('.repair-tray').inert=true;
  diagnostic=new DiagnosticPresentation(host,{developerInfo:developerRequested,effect:(...args)=>audio.effect(...args),reduced:()=>reduced,
    onMount:svg=>{
      viewer=new Editor(svg,{circuit:structuredClone(model.graph),inputs:{...sourceEditor.inputs},state:structuredClone(sourceEditor.state),height:sourceEditor.height,width:sourceEditor.width,workbench:true,theme:sourceEditor.theme,art:sourceEditor.art,wirePalette:sourceEditor.wirePalette,onChange:()=>({ok:false}),onInput:()=>{},onMessage:()=>{}});viewer.beginDiagnostic();
      fitCircuitViewport(viewer);
      svg.querySelectorAll('[tabindex]').forEach(n=>n.setAttribute('tabindex','-1'));
      return ()=>{viewer?.stopDiagnosticAnimations();viewer=null;};
    },
    onFrame:frame=>{if(editor===sourceEditor&&viewer){viewer.showDiagnosticFrame(frame);viewer.svg.querySelectorAll('[tabindex]').forEach(n=>n.setAttribute('tabindex','-1'));}},
    onEngage:practice?null:()=>{
      if(editor!==sourceEditor||panel!==id)return diagnosticOutcome(model,{ok:false,error:'The circuit editor changed. Test the current circuit again.'});

      applied=applyRepair(world,id,model.validationId);persist(true);
      events=[...(applied.events||[])].filter(e=>!e.type.startsWith('circuit.test_'));
      return diagnosticOutcome(model,applied);
    },
    onExplain:serviceRun&&outcome.success?()=>{diagnostic.close();gardenUI.lesson();}:null,
    onResult:result=>{reactions.react(model.pass?'approving':'skeptical');feedback(result.detail,!model.pass||result.kind==='blocked');},
    onExit:result=>{
      diagnostic=null;
      closeOverlay();
      if(result.kind==='stage-expanded'&&result.success){openPanel(id);return;}
      if(result.success)finishRepair(id,events,model);
      else{
        const notice=document.querySelector('#repair-response');clearTimeout(engagementNoticeTimer);
        notice.textContent='System not engaged. '+result.detail;notice.hidden=false;
        engagementNoticeTimer=setTimeout(()=>{notice.hidden=true;},8000);
      }
    },
    onClose:result=>{
      diagnostic=null;
      if(result.success){closeOverlay();if(result.kind==='stage-expanded')openPanel(id);else finishRepair(id,events,model);return;}
      if(sourceEditor.damageInspection)sourceEditor.beginDiagnostic();else sourceEditor.endDiagnostic();document.querySelector('.repair-tray')?.removeAttribute('inert');
      const workbench=document.querySelector('.workbench');if(workbench)workbench.append(host);
      if(editor!==sourceEditor)return;
      if(workbench)sourceEditor.resizeObserver?.observe(sourceEditor.svg);
      feedback(result.detail,!model.pass||result.kind==='blocked');setInert();
    }});
  diagnostic.start(model,outcome);setInert();
}
function finishRepair(id,events,model){
  // Close both editing layers before presenting any earned discovery or repair dialogue.
  if(events.some(e=>e.type==='service.equivalence.confirmed'))audio.effect('door');
  present(events);persist(true);
  if(id==='ripple_adder'&&!world.dialogueSeen.includes('intro-add4c')){LINES['ripple-overflow']=['G.R.E.G.',RIPPLE_OVERFLOW[0]];LINES['intro-add4c']=['G.R.E.G.',ADD4C_INTRO[0]];say('ripple-overflow',{messages:RIPPLE_OVERFLOW,centered:true,after:()=>say('intro-add4c',{messages:ADD4C_INTRO,centered:true})});setInert();return;}
  if(id==='pressure_width'&&!world.dialogueSeen.includes('story-pressure-register-complete')){LINES['story-pressure-register-complete']=['G.R.E.G.',PRESSURE_COMPLETE[0]];say('story-pressure-register-complete',{messages:PRESSURE_COMPLETE,centered:true});setInert();return;}
  if(id==='float_nav'&&!world.dialogueSeen.includes('story-alu-foundation-complete')){LINES['story-alu-foundation-complete']=['G.R.E.G.',ALU_COMPLETE[0]];say('story-alu-foundation-complete',{messages:ALU_COMPLETE,centered:true});setInert();return;}
  if(id==='addsub'&&!world.dialogueSeen.includes('story-subtractor-complete')){LINES['story-subtractor-complete']=['G.R.E.G.',SUBTRACTOR_COMPLETE[0]];say('story-subtractor-complete',{messages:SUBTRACTOR_COMPLETE,centered:true});setInert();return;}
  const statusMonitor=id==='firewall' &&isGalleryCurriculum(world);
  if(statusMonitor&&!reduced)document.querySelector('[data-hotspot="repair-firewall"]')?.animate([{boxShadow:'0 0 22px 5px #9ce7d788',background:'#a4edda22'},{boxShadow:'0 0 0 0 #9ce7d700',background:'transparent'}],{duration:750,easing:'ease-out'});
  if(events.some(e=>e.type==='service.equivalence.confirmed')&&serviceState(world)?.discoveryPending){showScrubberDiscovery();setInert();return;}
  if(pendingStoryConversation(world)){resumeMilestoneStory();setInert();return;}
  repairDialogue.push(events.some(e=>e.type==='service.equivalence.confirmed')?'scrubber-service-restored':statusMonitor?'fixed-status-decoder':CAMPAIGN_REPAIRS[id]?'fixed-'+id:id==='ventilation'?'restored':world.doors.security?'door':'authMissing');flushRepairDialogue();
  setInert();
}
function resumeDiscoveryBoard(){
  if(overlayType==='discovery'&&editor&&panel){overlayType='repair';editor.endDiagnostic();document.querySelectorAll('.discovery-source-node').forEach(el=>el.classList.remove('discovery-source-node'));editor.resizeObserver?.observe(editor.svg);setInert();}
  else if(overlayType==='discovery')closeOverlay();else setInert();
  if(currentLine&&!overlayType&&!linePaused)renderLine();
  flushRepairDialogue();
}
async function testSound(){
  const output=document.querySelector('#audio-diagnostic');if(!output)return;
  output.textContent='Initializing browser audio…';
  configureAudio();const result=await audio.testSound();if(!output.isConnected)return;
  output.textContent=result.message+' [Context: '+result.context+']';output.dataset.audioReady=String(result.ok);
}
function monitor(){
  if(editor?.damageInspection){gardenUI.history();return;}
  if(!editor||!panel||diagnostic?.active)return;const repair=panelSpec(world,panel);
  const rows=testResult?.rows?.length?testResult.rows:repair.sequential?testCircuit(repair,editor.circuit).rows:combinations(repair).map(inputs=>{
    let actual={};try{actual=evaluate(editor.circuit,inputs,{}, {partial:true}).outputs;}catch{}
    const expected=repair.expected(inputs);return {inputs,actual,expected,pass:Object.keys(expected).every(id=>actual[id]===expected[id])};
  });
  const host=document.querySelector('#monitor-host');
  host.innerHTML=`<section class="test-monitor" data-sequential="${!!repair.sequential}" role="dialog" aria-label="Diagnostic truth table"><h3>Truth Table</h3><p>${repair.sequential?'Clock trace from cleared memory. Each row follows the previous row.':'Every possible input combination. Click a row to set diagnostic inputs.'}</p><table><thead><tr>${repair.sequential?'<th>EVENT</th>':''}${repair.inputs.map(n=>`<th>${esc(n.label)}</th>`).join('')}${repair.outputs.map(n=>`<th>${esc(n.label)}<br>ACTUAL / REQUIRED</th>`).join('')}<th>RESULT</th></tr></thead><tbody>${rows.map((r,i)=>`<tr data-test-row="${i}" class="${r.pass?'pass':'fail'}">${repair.sequential?`<td>${esc(r.label||'')}</td>`:''}${repair.inputs.map(n=>`<td>${r.inputs[n.id]}</td>`).join('')}${repair.outputs.map(n=>`<td>${r.actual[n.id]??'—'} / ${r.expected[n.id]}</td>`).join('')}<td>${r.pass?'PASS':'FAIL'}</td></tr>`).join('')}</tbody></table><div class="window-actions"><button class="brass-button subtle" data-action="close-monitor">Back to circuit</button></div></section>`;
  if(!repair.sequential)host.querySelectorAll('[data-test-row]').forEach(row=>row.addEventListener('click',()=>{if(practiceContext){Object.assign(practiceContext.inputs,rows[Number(row.dataset.testRow)].inputs);Object.assign(editor.inputs,practiceContext.inputs);editor.refresh(editor.inputs,practiceContext.state);host.innerHTML='';return;}const updated=setDiagnostic(world,panel,rows[Number(row.dataset.testRow)].inputs);if(!updated.ok){feedback(updated.error,true);return;}Object.assign(editor.inputs,updated.diagnostic.inputs);editor.refresh(editor.inputs,editor.state);present(updated.events);persist();host.innerHTML='';feedback('Diagnostic inputs applied. Numbers and illuminated sockets show HIGH or LOW. Cable colors identify leads.');}));
}
function showRecord(first=false){
  paper(MAINTENANCE_LOG.title,`<pre>${esc(MAINTENANCE_LOG.text)}</pre><p>A line has been underlined in a different hand: <em>Ask the guide who gave the order.</em></p>`,[{label:first?'Keep the record':'Close notebook',action:'close'}],MAINTENANCE_LOG.stamp,first?'record':'journal-record');
}
function journal(){
  const list=[['Engine room',['ventilation']],['Maintenance corridor',['security']],...campaignRoute(world).slice(2).map(id=>[CAMPAIGN_ROOMS[id].title,roomRepairIds(world,id,CAMPAIGN_ROOMS[id].repairs)])];
  paper('The Kestrel’s repair ledger.','<p><strong>'+esc(objective(world))+'</strong></p><p>'+completedRepairs(world)+' / '+repairTotal()+' systems verified · '+world.logs.length+' / 7 records recovered</p><ul>'+list.map(([title,ids])=>'<li>'+esc(title)+': '+ids.filter(id=>isEarly(world)&&id==='scrubber'?world.foundation.curriculum.completed.scrubber:world.machines[id].certified).length+' / '+ids.length+'</li>').join('')+'</ul><p>Discovered: '+world.discovered.map(id=>esc(ROOMS[id]?.title||id)).join(' · ')+'</p>',[{label:'Engineering manual',action:'manual'},...(world.logs.includes('override')?[{label:'Read archive record',action:'record'}]:[]),...CAMPAIGN_ORDER.filter(id=>world.logs.includes(campaignRecord(id))).map(id=>({label:CAMPAIGN_ROOMS[id].record.title,action:'read-'+id})),{label:'Close notebook',action:'close'}],'ENGINEER’S POCKET NOTEBOOK','journal');
}

function inventory(){
  const carrying=world.items.includes('maintenance-pass');
  paper('A practical sort of baggage.',((isInventoryPilot(world)||isEarly(world)||isEngineeringDemo(world)||fabricatorActive(world))?'<p><strong>COMPONENTS</strong> · Counters show available parts, including automatic supply after the Workshop. Installed hardware stays with its machine.</p>'+inventoryMarkup(world,panel):'')+(carrying?'<div class="inventory-item"><span class="pass-art" aria-hidden="true"></span><p><strong>Maintenance pass</strong><br>Historical crew identification. Doors now use the repaired engineering power signal; this card is optional.</p></div>':'<p>Your components travel with you. Crew identification is optional; no access card is required.</p>')+drawingInventoryMarkup(world),[{label:'Back to room',action:'close'}],'LEATHER SATCHEL','inventory');
}
function openEngineeringManual(){
 if(manual||diagnostic?.active||presentation?.active)return;
 cancelMovement();clearTimeout(lineTimer);const host=document.querySelector('#overlay');
 manualReturn={type:overlayType,nodes:[...host.childNodes],hidden:host.hidden,focus:document.activeElement,scroll:host.scrollTop,onclick:host.onclick,onkeydown:host.onkeydown,onpointerdown:host.onpointerdown};
 host.replaceChildren();host.onclick=null;host.onkeydown=null;host.onpointerdown=null;host.hidden=false;host.scrollTop=0;
 overlayType='manual';document.querySelector('#dialogue').hidden=true;
 manual=new EngineeringManual(host,{getWorld:()=>world,close:closeOverlay});setInert();refreshHUD();
}
function closeManual(restore=true){
 manual?.dispose();manual=null;const previous=manualReturn;manualReturn=null;const host=document.querySelector('#overlay');host.replaceChildren();
 if(previous&&restore){host.replaceChildren(...previous.nodes);host.hidden=previous.hidden;host.onclick=previous.onclick;host.onkeydown=previous.onkeydown;host.onpointerdown=previous.onpointerdown;host.scrollTop=previous.scroll;overlayType=previous.type;}
 else{host.hidden=true;host.onclick=null;host.onkeydown=null;host.onpointerdown=null;overlayType=null;}
 setInert();refreshHUD();if(previous?.focus?.isConnected&&restore)previous.focus.focus({preventScroll:true});
 if(!overlayType&&currentLine&&!linePaused)renderLine();
}
function help(){teaching.manual();}
function openOutfitter(origin=overlayType==='pause'?'pause':'gameplay'){
 if(previewRequested||isEngineeringDemo(world)||!outfitterUnlocked(world))return;
 cancelMovement();outfitter?.dispose();clearTimeout(saveTimer);
 paper('SHOP & COSMETICS','',[],'CREW APPEARANCE SYSTEM','outfitter');menuParent=origin;
 outfitter=new OutfitterUI(document.querySelector('#overlay'),{world:()=>world,assets:outfitterAssets,reduced:()=>reduced,close:closeOverlay,command:command=>{
  const prior=structuredClone(world.foundation),r=dispatchCommand(world,command);
  if(r.ok&&!r.duplicate&&!(isEarly(world)||isInventoryPilot(world))&&!saveCurrentWorld()){world.foundation=prior;return {ok:false,error:'Purchase could not be saved. No credits were spent.'};}
  if(r.ok){refreshHUD();if(r.purchased)audio.effect('S13');}return r;
 }});
}
function menuPanel(kind,markup){
 paper('', '', [], 'CREW TERMINAL',kind);const host=document.querySelector('#overlay');host.innerHTML=markup;host.scrollTop=0;host.querySelector('h2').focus({preventScroll:true});setInert();fullscreen?.sync();
}
function pause(){
 if(!started){settings('title');return;}
 menuPanel('pause',pauseMenuMarkup({shopAvailable:!previewRequested&&!isEngineeringDemo(world)&&outfitterUnlocked(world)}));
}
function settings(origin=started?'pause':'title'){
 menuPanel('settings',settingsMarkup(world.foundation.settings,{muted:world.muted,reduced}));menuParent=origin;fullscreen?.sync();
 for(const range of document.querySelectorAll('[data-volume]'))range.oninput=()=>{const r=dispatchCommand(world,{type:'SET_AUDIO_SETTINGS',settings:{[range.dataset.volume]:Number(range.value)/100}});if(r.ok){document.querySelector('[data-volume-value="'+range.dataset.volume+'"]').textContent=range.value+'%';configureAudio();persist();}};
 for(const checkbox of document.querySelectorAll('[data-pref]'))checkbox.onchange=()=>{const r=dispatchCommand(world,{type:'SET_AUDIO_SETTINGS',settings:{[checkbox.dataset.pref]:checkbox.checked}});if(r.ok){configureAudio();persist();}};
}
function returnToMainMenu(){
 cancelMovement();clearTimeout(saveTimer);
 if(previewRequested&&!presentationPreview){location.href=location.pathname+'?presentationPreview=title';return;}
 if(isEngineeringDemo(world)){location.href=location.pathname;return;}
 if(!previewRequested&&!saveCurrentWorld()){paper('The voyage could not be saved.','<p>Your current progress is still open. Resolve the notebook storage issue before returning to the main menu.</p>',[{label:'Stay with this voyage',action:'close'}],'NOTEBOOK / SAVE UNAVAILABLE','pause');return;}
 clearTimeout(lineTimer);document.querySelector('#dialogue').hidden=true;overlayType=null;document.querySelector('#overlay').hidden=true;document.querySelector('#overlay').innerHTML='';overlayReturnFocus=null;started=false;titleUnlocked=true;title();document.querySelector('[data-action="title-continue"]')?.focus({preventScroll:true});
}
function hasCurrentVoyage(){return world.flags.length>0||world.foundation.opening?.crashSeen||!!world.saveProtection?.blocked;}
function hasCurriculumNotebook(){try{return !previewRequested&&!curriculumRequested&&!pilotRequested&&localStorage.getItem(CURRICULUM_SAVE_KEY)!==null;}catch{return false;}}
function showOpeningIntro(){
 if(!briefingPending(world)){introPending=false;setInert();return;}clearTimeout(lineTimer);currentLine=null;document.querySelector('#dialogue').hidden=true;introPending=true;const index=world.foundation.opening.introIndex||0;lineMessages=[];lineCentered=false;linePaused=false;lineAfter=null;
 paper('G.R.E.G.',conversationMarkup('G.R.E.G.',OPENING_MESSAGES[index]),[{label:'CONTINUE',action:'continue-opening'}],'G.R.E.G. / '+(index+1)+' OF 4','opening-conversation');document.querySelector('[data-action="continue-opening"]')?.focus({preventScroll:true});
}
function advanceOpeningIntro(){const r=dispatchCommand(world,{type:'ADVANCE_OPENING_INTRO'});if(!r.ok)return;persist(true);if(briefingPending(world))showOpeningIntro();else{overlayType='opening-finished';introPending=false;closeOverlay();}}
function p01Control(action){const r=dispatchCommand(world,{type:'P01_GUIDE',action});if(r.ok){persist(true);refreshHUD();}return r.ok;}
function selectP01Part(type){if(type==='NOT'&&armedGuidePart==='NOT'&&panel==='ventilation'&&p01Guided(world))return true;if(type!=='NOT'||panel!=='ventilation'||practiceContext||!p01Guided(world)||editor.circuit.nodes.some(n=>n.type==='NOT'))return false;if(p01Control('select'))armedGuidePart='NOT';refreshHUD();return true;}
function clearCurrentPanel(confirmed=false){if(!editor)return;if(editor.damageInspection){editor.endDiagnostic();if(editor.clear()===false){editor.beginDiagnostic();return;}persist(true);panel=null;openPanel('scrubber');return;}if(!confirmed&&panel==='ventilation'&&p01Guided(world)&&editor.circuit.nodes.some(n=>!n.fixed)){document.querySelector('#monitor-host').innerHTML='<section class="test-monitor teaching-window" role="dialog" aria-label="Confirm clear circuit"><h3>Clear your circuit?</h3><p>This returns placed parts and removes their wires. Fixed sensor and fan terminals remain.</p><button class="brass-button" data-action="p01-clear-confirm">CLEAR CIRCUIT</button><button class="brass-button subtle" data-action="p01-clear-cancel">CANCEL</button></section>';return;}editor.clear();armedGuidePart=null;if(panel==='ventilation'&&p01Guided(world))p01Control('workspace');}
function refreshP01Guidance(){
 const active=world.room==='engine'&&started&&!practiceContext&&(!panel||panel==='ventilation')&&!introPending&&!power?.active&&!previewRequested&&corePowered(world);const step=active?p01Step(world,{panel:panel==='ventilation',graph:editor?.circuit||world.circuits.ventilation,selected:!!armedGuidePart,testing:!!diagnostic?.active&&!diagnostic.complete,testResult}):null;
 paintP01Guide(document.querySelector('#game'),panel==='ventilation'?editor:null,step);
 if(!step&&currentLine?.startsWith('p01-guide-')){clearTimeout(lineTimer);currentLine=null;document.querySelector('#dialogue').hidden=true;}
 if(step?.hotspot&&!overlayType&&!presentation?.active&&!hasPendingDiscovery()&&lastWorldGuide!==step.id&&(!currentLine||currentLine.startsWith('p01-guide-'))){lastWorldGuide=step.id;resetLine();currentLine='p01-guide-'+step.id;lineMessages=textPages(step.message,Math.max(90,Math.min(250,Math.round(innerWidth*.25))));document.querySelector('#speaker').textContent='G.R.E.G.';document.querySelector('#line').textContent=lineMessages[0];document.querySelector('#dialogue').hidden=false;lineTimer=setTimeout(advanceLine,12000);}
 let skip=document.querySelector('#p01-skip-world');if(!skip){skip=document.createElement('button');skip.id='p01-skip-world';skip.dataset.action='skip-p01-guide';skip.textContent='SKIP GUIDED TUTORIAL';document.querySelector('.world-footer').append(skip);}skip.hidden=!step||!!overlayType;return step;
}
function showMissionBriefing(mandatory=false){
 if(mandatory){showOpeningIntro();return;}
 introPending=false;paper("WHAT YOU’LL LEARN",missionBriefingMarkup(),[{label:started?'Back to the ship':'Back to title',action:'close'}],'KESTREL / ENGINEERING ORIENTATION','learning-overview');
}
function unlockTitle(){titleUnlocked=true;title();document.querySelector('[data-action="'+(hasCurrentVoyage()?'title-continue':'title-new')+'"]').focus({preventScroll:true});}
function newFromTitle(){
 if(presentationPreview){world=initializeOpening(newWorld());animations.enter(world);refreshRoom();begin();return;}
 if(curriculumRequested||pilotRequested||developerRequested){if(hasCurrentVoyage())actions['new-confirm']();else begin();return;}
 location.href=location.pathname+'?curriculum=1&start=new';
}
function continueFromTitle(){
 if(hasCurriculumNotebook()){
  if(!hasCurrentVoyage()){location.href=location.pathname+'?curriculum=1';return;}
  paper('Choose a saved voyage','<p>Your legacy and curriculum notebooks are separate. Continuing either one keeps the other untouched.</p>',[{label:'Continue legacy voyage',action:'begin'},{label:'Continue curriculum voyage',action:'current-curriculum'},{label:'Back to title',action:'close'}],'KESTREL / SAVED VOYAGES');return;
 }
 begin();
}
function title(){
 // A routed New Voyage request must also reveal the real title controls on cancellation.
 if(!startHandled&&curriculumRequested&&new URLSearchParams(location.search).get('start')==='new')titleUnlocked=true;
 if(previewRequested&&!presentationPreview){started=true;document.querySelector('#title').hidden=true;setInert();return;}
 if(demoRequested&&!isEngineeringDemo(world)){document.querySelector('#title').className='title-screen';document.querySelector('#title').innerHTML='<div class="title-copy"><div class="kicker">ISOLATED ENGINEERING DEMONSTRATION</div><h1>G.R.E.G.</h1><p>Build OR + NOT → NOR using two genuine finite instances.</p><div class="title-actions"><button class="brass-button" data-action="begin-demo">Start isolated NOR workbench</button><button class="brass-button subtle" data-action="exit-demo">Return to saved game</button></div></div>';document.querySelector('#title').hidden=false;setInert();return;}
 if(pilotRequested){document.querySelector('#title').className='title-screen';document.querySelector('#title').innerHTML='<div class="title-copy"><h1>G.R.E.G.</h1><p>ISOLATED INVENTORY PILOT</p><button class="brass-button" data-action="begin">'+(hasCurrentVoyage()?'Return to the Kestrel':'Wake up')+'</button></div>';document.querySelector('#title').hidden=false;setInert();return;}
 const host=document.querySelector('#title');host.className='title-screen retro-title';host.innerHTML=titleMarkup({unlocked:titleUnlocked,canContinue:!presentationPreview&&(hasCurrentVoyage()||hasCurriculumNotebook()),mode:presentationPreview?'PRESENTATION PREVIEW / NO SAVE CHANGES':curriculumRequested?'CURRICULUM VOYAGE':'LEGACY VOYAGE / CURRICULUM AVAILABLE',issue:world.loadIssue||'',protectedSave:!!world.saveProtection?.blocked});host.hidden=false;setInert();fullscreen?.sync();
 if(!startHandled&&((curriculumRequested&&new URLSearchParams(location.search).get('start')==='new')||presentationPreview==='opening')){startHandled=true;titleUnlocked=true;queueMicrotask(()=>hasCurrentVoyage()?actions['new-confirm']():begin());}
}
async function begin(){
 if((pilotRequested||curriculumRequested)&&(!pilotSession?.active||pilotSession.stale||world.saveProtection?.blocked)){paper('Inventory save is protected.','<p>'+esc(pilotSession?.message||world.loadIssue||'The voyage needs its exclusive save lock.')+'</p>',[{label:'Reload safely',action:'reload'},{label:'Back',action:'back-title'}]);return;}
 started=true;document.querySelector('#title').hidden=true;configureAudio();await audio.start(world.muted,world.foundation.settings);
 if(hasOpening(world)&&!corePowered(world)){
  if(!world.foundation.opening.crashSeen){const ack=dispatchCommand(world,{type:'ACK_CRASH'});if(!ack.ok)return;persist(true);crash.start();}
  setInert();refreshHUD();if(!crash.active)document.querySelector('[data-hotspot="'+CORE_SWITCH_ID+'"]').focus({preventScroll:true});return;
 }
 if(overlayType)closeOverlay();flag(world,'awakened');setInert();if(currentLine&&!linePaused)renderLine();if(briefingPending(world)){showMissionBriefing(true);return;}if(resumePendingDiscoveries()){persist(true);return;}if(!isEngineeringDemo(world)&&!hasOpening(world))say('awake');if(!has(world,'inspected_sensor'))attention('sensor');persist();
}

const actions={
 outfitter:openOutfitter,settings:()=>settings(),'main-menu':returnToMainMenu,'title-menu':unlockTitle,'title-new':newFromTitle,'title-continue':continueFromTitle,'learn-overview':()=>showMissionBriefing(false),
  'activate-fabricator':activateFabricator,'open-fabricator':()=>{closeOverlay();queueInteraction('fabricator');},
  'investigate-emergency':closeOverlay,'garden-binary-practice':()=>openGardenBinary(true),
  'continue-dialogue':advanceLine,begin,close:closeOverlay,help,pause,journal,inventory,'current-curriculum':()=>{location.href=location.pathname+'?curriculum=1';},'open-safetycutoff':()=>{closeOverlay();queueInteraction('repair-safetycutoff');},'open-service':()=>{closeOverlay();queueInteraction('repair-scrubber',{intent:'service'});},'inspect-scrubber-history':()=>gardenUI.history(),'grab-emergency-parts':()=>{if(panel!=='scrubber'||!servicePending(world)||serviceState(world).drawerCollected)return;beginScrubberModal();inspectPickup('garden.demorgan-kit');},record:()=>showRecord(),reload:()=>location.reload(),manual:()=>teaching.manual(),drawings:()=>teaching.cabinet(),
  'begin-demo':async()=>{world=createDemoSession().world;animations.enter(world);refreshRoom();await begin();openPanel('scrubber');},
  'exit-demo':()=>{presentation?.cancel();location.href=location.pathname;},
  'export-save':()=>{const raw=world.saveProtection?.originalSnapshot||world.foundation.migration?.originalSnapshot;if(!raw)return;const url=URL.createObjectURL(new Blob([raw],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download='greg-original-notebook.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);},
  'find-sensor':()=>{closeOverlay();queueInteraction('sensor');},
  'find-vent-panel':()=>{closeOverlay();attention('vent-panel');},
  'find-security-panel':()=>{closeOverlay();attention('security-panel');},
  'take-pass':()=>{if(takePass(world)){closeOverlay();say('pass',{force:true});persist(true);}},
  'insert-pass':()=>{if(authorize(world)){closeOverlay();say('auth',{force:true});persist(true);}},
  'missing-pass':()=>{closeOverlay();say('authMissing',{force:true});attention('return');},
  mute:()=>{const r=dispatchCommand(world,{type:'SET_AUDIO_SETTINGS',settings:{muted:!world.muted}});if(!r.ok)return;configureAudio();const b=document.querySelector('[data-action="mute"]');b.innerHTML=svg(world.muted?'mute':'sound');b.setAttribute('aria-label',world.muted?'Enable sound':'Mute sound');persist();},
  test:runTest,monitor,'test-sound':testSound,
  'trash-node':()=>editor?.removeNode(),
  'clear-panel':clearCurrentPanel,'p01-clear-confirm':()=>{document.querySelector('#monitor-host').innerHTML='';clearCurrentPanel(true);},'p01-clear-cancel':()=>{document.querySelector('#monitor-host').innerHTML='';},'skip-p01-guide':()=>{p01Control('skip');armedGuidePart=null;},'p01-workspace-ready':()=>p01Control('workspace'),'continue-opening':advanceOpeningIntro,
  hint:()=>{if(panel&&editor&&!diagnostic?.active)circuitHints?.next();},
  'close-monitor':()=>{document.querySelector('#monitor-host').innerHTML='';},
  'new-confirm':()=>paper(isEngineeringDemo(world)?'Reset this demonstration?':'Begin a new voyage?',isEngineeringDemo(world)?'<p>This discards only the temporary NOR workbench. Normal and inventory-pilot saves stay untouched.</p>':'<p>This replaces this voyage’s repairs, Credits, cosmetics, recovered records, and pilot choice. Other voyage notebooks stay separate. Historical saves are kept separately.</p>',[{label:'Keep this voyage',action:'close'},{label:isEngineeringDemo(world)?'Reset demo':'Begin again',action:'new'}],isEngineeringDemo(world)?'ISOLATED DEMO':'NEW VOYAGE','confirm'),
  'back-title':()=>{closeOverlay();title();},
  new:()=>{const muted=world.muted,settings=structuredClone(world.foundation.settings);closeOverlay();presentation?.seen.clear();repairDialogue.length=0;world=demoRequested?createDemoSession().world:curriculumRequested?newRevisedCurriculum():pilotRequested?newInventoryPilot():newWorld();if(pilotSession)pilotSession.bind(world);world.muted=muted;world.foundation.settings={...settings,muted};animations.engineDoor=0;animations.securityDoor=0;animations.fan=0;animations.enter(world);refreshRoom();persist(true);begin();},
};

for(const id of Object.keys(BLUEPRINTS))actions['drawing-'+id]=()=>teaching.drawing(id);
for(const type of FABRICATION_TYPES)actions['fabricate-'+type]=()=>manufacture(type);
for(const id of Object.keys(FINITE_PICKUPS))actions['collect-'+id]=()=>collectPickup(id);
for(const id of Object.getOwnPropertyNames(CAMPAIGN_REPAIRS))actions['open-'+id]=()=>{closeOverlay();queueInteraction('repair-'+id);};
for(const id of CAMPAIGN_ORDER)actions['read-'+id]=()=>showCampaignRecord(id);
Object.assign(actions,{
  'watch-record':()=>{closeOverlay();queueInteraction('watch-record');},
  'forward-room':()=>{closeOverlay();queueInteraction('forward');},
  helm:()=>{closeOverlay();queueInteraction('machine-info');},
  'pilot-choice':()=>showHelm(true),'fly-manual':()=>finishFlight('manual'),'fly-greg':()=>finishFlight('greg'),
});

async function boot(){
  if(developerRequested){developer=await createDeveloper({storage:localStorage,locks:navigator.locks,mode:curriculumRequested?'curriculum':'legacy',buildId:BUILD_ID});world=await developer.initialize();pilotSession=developer.session.writer;}
  else if(pilotRequested||curriculumRequested){
    let storage;try{storage=globalThis.localStorage;}catch{}
    pilotSession=new InventorySession({storage,...(curriculumRequested?{key:CURRICULUM_SAVE_KEY}:{})});
    await pilotSession.acquire();
    world=loadWorld(storage,curriculumRequested?{curriculum:true}:{inventoryPilot:true});pilotSession.bind(world);
    if(!pilotSession.active)world.loadIssue=pilotSession.message;
  }
  const assets=await new Assets().load();
  panelArt={board:assets.get('serviceBoard').src,gate:assets.get('logicValve').src,input:assets.get('sourceContact').src,output:assets.get('outputContact').src};
  app.innerHTML=`<section class="game" id="game" aria-label="G.R.E.G. steampunk adventure"><canvas id="room-canvas" class="world-canvas"></canvas><div class="scene-shade"></div><div class="grain"></div><div class="walk-layer" aria-hidden="true"></div><div class="hotspots" id="hotspots" aria-label="Room machinery"></div><button class="edge-nav left" data-edge="-1" aria-label="Walk left toward previous Garden area" hidden><span aria-hidden="true">‹</span><span class="edge-label" aria-hidden="true"></span></button><button class="edge-nav right" data-edge="1" aria-label="Walk right toward next Garden area" hidden><span aria-hidden="true">›</span><span class="edge-label" aria-hidden="true"></span></button><div id="pickup-toast" class="pickup-toast" role="status" aria-live="polite" hidden></div><header class="hud"><div class="location"><small id="room-subtitle"></small><strong id="room-title"></strong></div><nav class="tools" aria-label="Adventure tools">${creditHudMarkup()}<button class="tool" data-action="inventory" title="Satchel (I)" aria-label="Open satchel">${svg('bag')}</button><button class="tool" data-action="manual" title="Engineering Manual" aria-label="Open Engineering Manual">${svg('book')}</button><button class="tool" data-action="mute" title="Sound (M)" aria-label="${world.muted?'Enable sound':'Mute sound'}">${svg(world.muted?'mute':'sound')}</button><button class="tool" data-action="pause" title="Pause (Esc)" aria-label="Pause game">${svg('menu')}</button></nav></header><div class="hover-label" id="hover-label" aria-live="polite"></div><section class="dialogue" id="dialogue" tabindex="0" role="button" aria-label="Continue dialogue" aria-live="polite" hidden><img src="./assets/sprites/greg-terminal.svg" alt=""><strong id="speaker"></strong><p id="line"></p><span class="dismiss">×</span><span class="dialogue-hint">CLICK TO CONTINUE</span></section><footer class="world-footer"><span class="objective" id="objective"></span><small>KESTREL / POINT &amp; CLICK</small></footer><span id="saved" class="saved" role="status"></span><div id="overlay" class="overlay" hidden></div><div id="title" class="title-screen"></div><div id="crash-opening" class="crash-opening" role="dialog" aria-label="KESTREL awakening" hidden></div><div class="transition" id="transition"></div><div id="presentation-host" class="presentation-host" hidden></div><div id="repair-response" class="repair-response" role="status" hidden></div>${previewRequested?'<div class="demo-banner">ENVIRONMENT PREVIEW · READ ONLY · A/D OR EDGE ARROWS · NO SAVE CHANGES</div>':''}${demoRequested?'<div class="demo-banner">DEMO · TEMPORARY SESSION · NO SAVED VOYAGE CHANGES</div>':''}${pilotRequested||curriculumRequested?'<aside id="pilot-save-status" class="pilot-save-status" role="alert" hidden><span></span><button class="brass-button" data-action="reload">Reload safely</button></aside>':''}</section>`;
  fullscreen=new FullscreenDisplay(app);
  // Anchor speech to the actual HUD, including wrapped room names and narrow screens.
  const game=document.querySelector('#game'),hud=game.querySelector('.hud');
  creditHud=new CreditHUD(document.querySelector('#credit-hud'),{openShop:()=>{if(overlayType||!started||previewRequested||isEngineeringDemo(world)||!outfitterUnlocked(world))return false;openOutfitter('gameplay');return true;},shopAvailable:()=>!previewRequested&&!isEngineeringDemo(world)&&outfitterUnlocked(world),reduced:()=>reduced,effect:()=>audio.effect('S13')});
  const positionDialogue=()=>game.style.setProperty('--hud-bottom',`${hud.offsetTop+hud.offsetHeight}px`);
  const dialogueLayout=new ResizeObserver(positionDialogue);dialogueLayout.observe(hud);dialogueLayout.observe(game);positionDialogue();
  power=new PowerUpPresentation({sound:(...args)=>audio.effect(...args),hum:level=>audio.setStartupHum(level),reduced:()=>reduced,finish:()=>{animations.power=null;showOpeningIntro();}});
  crash=new CrashOpening(document.querySelector('#crash-opening'),{sound:id=>audio.effect(id),reduced:()=>reduced,finish:()=>{cancelMovement();setInert();refreshHUD();document.querySelector('[data-hotspot="'+CORE_SWITCH_ID+'"]')?.focus({preventScroll:true});}});
  presentation=new DiscoveryPresentation(document.querySelector('#presentation-host'),{effect:(...args)=>audio.effect(...args),reduced:()=>reduced,onClose:resumeDiscoveryBoard,onComplete:completeDiscovery});
  installPopupPagination(document.body);
  teaching=new TeachingUI({openManual:openEngineeringManual,getWorld:()=>world,getEditor:()=>editor,dispatch:c=>dispatchCommand(world,c),feedback,paper,audio,present,speak:sayTeaching,openPractice:id=>openPanel(id,{practice:true}),openProduction:id=>openPanel(id),blankBuild:id=>{const graph=structuredClone(world.circuits[id]);graph.nodes=graph.nodes.filter(n=>n.fixed||n.equipment);graph.wires=[];const r=editCircuit(world,id,graph);if(r.ok){present(r.events);openPanel(id);}else feedback(r.error,true);}});
  gardenUI=new GardenUI({getWorld:()=>world,send:c=>{const r=dispatchCommand(world,c);if(r.ok)persist(true);else feedback(r.error,true);return r;},paper,feedback});
  teaching.demorgan=()=>gardenUI.lesson();
  configureAudio();
  outfitterAssets=assets;const renderer=new Renderer(document.querySelector('#room-canvas'),assets,{visual:engineerVisual});animations.enter(world);refreshRoom();title();
  if(DEVELOPMENT_BUILD)document.addEventListener('keydown',e=>{if(e.ctrlKey&&e.shiftKey&&e.key.toLowerCase()==='d'&&!e.repeat&&!e.target.closest('input,textarea,select,[contenteditable="true"]')){e.preventDefault();e.stopImmediatePropagation();if(developer)developer.toggle();else{const u=new URL(location.href);u.searchParams.set('dev','1');for(const key of ['engineeringDemo','inventoryPilot','environmentPreview','presentationPreview'])u.searchParams.delete(key);if(isEarly(world))u.searchParams.set('curriculum','1');location.assign(u.href);}}},{capture:true});
  if(developer){
    const replace=(next,openId=null)=>{if(manual)closeManual(false);
      scrubberModal=null;armedGuidePart=null;lastWorldGuide=null;gardenEmergency.cancel();gardenBinary?.dispose();gardenBinary=null;dataConsole?.dispose();dataConsole=null;clearTimeout(saveTimer);clearTimeout(lineTimer);diagnostic?.dispose(false);diagnostic=null;editor?.resizeObserver?.disconnect();editor?.endDiagnostic();editor=null;panel=null;practiceContext=null;presentation?.cancel(false);repairDialogue.length=0;resetLine();introPending=false;crash.active=false;crash.releaseInputs();power.active=false;audio.setStartupHum(null);travelEpoch++;transitioning=false;cancelMovement();overlayType=null;overlayReturnFocus=null;
      document.querySelector('#overlay').hidden=true;document.querySelector('#overlay').innerHTML='';document.querySelector('#dialogue').hidden=true;document.querySelector('#crash-opening').hidden=true;document.querySelector('#transition').classList.remove('active');
      world=next;pilotSession=developer.writerFor(world);pilotSession.bind(world);started=true;titleUnlocked=true;document.querySelector('#title').hidden=true;animations.enter(world);configureAudio();refreshRoom();setInert();if(openId)openPanel(openId);
    };
    started=true;titleUnlocked=true;document.querySelector('#title').hidden=true;
    developer.mount({getWorld:()=>world,replace,openPanel,lock:setInert,panel:()=>panel,hints:level=>editor&&panel===circuitHints?.id&&circuitHints.show(level,level!==0),story:()=>({currentLine,queued:repairDialogue.map(entry=>typeof entry==='string'?entry:entry.id),introPending,powerActive:power.active}),actor:()=>({x:animations.actor.x,camera:animations.cameraX||0}),effect:(...args)=>audio.effect(...args),startAudio:()=>audio.start(world.muted,world.foundation.settings),reduced:()=>reduced,panelArt:()=>panelArt,assets:()=>assets,signedTutorial:()=>openSignedBinary(false,true),introduction:showOpeningIntro,startPower:()=>{power.start();animations.power=power.view;setInert();},character:kind=>{cancelMovement();if(kind==='walk')animations.actor.target=clampWorldX(world,animations.actor.x+(animations.actor.x>200?-80:80));else if(kind.startsWith('greg-'))reactions.react(kind.slice(5));else engineerVisual.play(kind,world,animations);}});
  }
  const resumeAudio=()=>{if(started&&(!audio.ctx||audio.ctx.state!=='running'))void audio.start(world.muted,world.foundation.settings);};
  app.addEventListener('pointerdown',resumeAudio,{passive:true});app.addEventListener('keydown',resumeAudio);
  app.addEventListener('pointerdown',e=>crash?.pointerDown(e.pointerId),{capture:true});window.addEventListener('pointerup',e=>crash?.pointerUp(e.pointerId));window.addEventListener('pointercancel',e=>crash?.pointerUp(e.pointerId));window.addEventListener('keyup',e=>crash?.keyUp(e.key));window.addEventListener('blur',()=>crash?.releaseInputs());
  app.addEventListener('click',e=>{
    if(developer?.blocksGame)return;
    if(crash?.blocksInput){e.preventDefault();e.stopPropagation();if(crash.active)crash.advance();return;}
    if(!started&&!overlayType&&e.target.closest('.retro-title')&&!titleUnlocked){unlockTitle();return;}
    const action=e.target.closest('[data-action]');if(crash?.active||power?.active)return;if(action&&!corePowered(world)&&!['begin','mute','new','new-confirm','close','back-title','export-save','reload','title-menu','title-new','title-continue','learn-overview','pause','settings','test-sound','main-menu','current-curriculum'].includes(action.dataset.action))return;if(diagnostic?.active&&action&&action.dataset.action!=='close')return;if(action){if(action.dataset.action==='continue-opening'&&e.detail>1)return;if(action.dataset.action==='continue-dialogue'&&(e.detail>1||action.dataset.dialogueTurn!==String(dialogueTurn)))return;if(previewRequested&&!['close','mute','pause','inventory','journal','test-sound','learn-overview','main-menu','settings'].includes(action.dataset.action)&&!(presentationPreview&&['begin','title-menu','title-new','title-continue'].includes(action.dataset.action)))return;if(!['trash-node','clear-panel','test','mute','test-sound'].includes(action.dataset.action)&&!action.dataset.action.startsWith('collect-'))audio.effect();actions[action.dataset.action]?.();return;}
    const edge=e.target.closest('[data-edge]');if(edge){navigate(Number(edge.dataset.edge));return;}
    const part=e.target.closest('[data-part]');if(part&&editor){if(!selectP01Part(part.dataset.part))editor.add(part.dataset.part);return;}
    const hotspot=e.target.closest('[data-hotspot]');if(hotspot){queueInteraction(hotspot.dataset.hotspot);return;}
    if(e.target.closest('#dialogue')){advanceLine();return;}
    if(e.target.closest('.walk-layer')&&canExplore()){const r=document.querySelector('#room-canvas').getBoundingClientRect();destination(pointerWorldX(e.clientX,r,animations.cameraX||0,world));}
  });
  app.addEventListener('pointermove',e=>{const r=document.querySelector('#room-canvas').getBoundingClientRect(),x=(e.clientX-r.left)/r.width;edgeHover=x<.09?-1:x>.91?1:0;syncExploration();});
  app.addEventListener('pointerleave',()=>{edgeHover=0;syncExploration();});
  window.addEventListener('blur',cancelMovement);
  app.addEventListener('pointerover',e=>{const h=e.target.closest('[data-hotspot]');if(h){hoverId=h.dataset.hotspot;refreshHUD();}});
  app.addEventListener('pointerout',e=>{if(e.target.closest('[data-hotspot]')){hoverId=null;document.querySelector('#hover-label').textContent='';}});
  app.addEventListener('focusin',e=>{const h=e.target.closest('[data-hotspot]');if(h){hoverId=h.dataset.hotspot;refreshHUD();}});
  document.addEventListener('keydown',e=>{
    if(developer?.blocksGame)return;
    if(crash?.keyDown(e)){e.preventDefault();return;}
    if(overlayType&&e.key==='Tab'){const list=[...document.querySelectorAll('#overlay button:not(:disabled),#overlay input,#overlay select,#overlay [tabindex="0"]')].filter(x=>!x.closest('[inert]')&&x.getClientRects().length);const index=list.indexOf(document.activeElement);if(list.length&&((e.shiftKey&&index<=0)||(!e.shiftKey&&index===list.length-1))){e.preventDefault();list[e.shiftKey?list.length-1:0].focus();}return;}
    if(overlayType==='manual'){if(e.key==='Escape'){e.preventDefault();closeOverlay();}else if(['Delete','Backspace'].includes(e.key))e.preventDefault();return;}
    if(!started){if(overlayType){if(e.key==='Escape'){e.preventDefault();closeOverlay();}return;}if(!titleUnlocked&&opensTitleMenu(e)&&!pilotRequested&&!demoRequested){e.preventDefault();unlockTitle();}return;}
    if(['pause','settings','outfitter','manual'].includes(overlayType)&&e.key==='Escape'){e.preventDefault();closeOverlay();return;}
    if(gardenEmergency.active&&gardenEmergency.phase!=='warning')return;
    if(power?.active)return;
    if(overlayType==='story-conversation'&&e.key==='Escape'){e.preventDefault();if(['scrubber-demorgan-discovery','garden-exit-fault'].includes(currentLine)){advanceLine();return;}resetLine();overlayType='dialogue-cancelled';closeOverlay();return;}
    if(overlayType==='opening-conversation'&&['Enter',' '].includes(e.key)){e.preventDefault();if(!e.repeat)advanceOpeningIntro();return;}
    if(overlayType==='story-conversation'&&['Enter',' '].includes(e.key)){e.preventDefault();e.stopPropagation();if(!e.repeat)advanceLine();return;}
    if(overlayType==='opening-conversation'&&e.key==='Escape'){e.preventDefault();advanceOpeningIntro();return;}
    if(introPending&&e.key==='Escape'){e.preventDefault();return;}
    if(e.target.closest('#dialogue')&&['Enter',' '].includes(e.key)){e.preventDefault();advanceLine();return;}
    if(presentation?.active)return;
    if(!corePowered(world))return;
    if(diagnostic?.active){if(e.key==='Escape'){e.preventDefault();diagnostic.close();}return;}
    if(e.key==='Escape'){
      if(document.querySelector('.part-ghost')){document.querySelector('[data-part].placing-part')?.dispatchEvent(new Event('pointercancel'));e.preventDefault();return;}
      e.preventDefault();
      if(document.querySelector('.test-monitor'))actions['close-monitor']();
      else if(editor?.drag){editor.cancelDrag();}
      else if(editor?.pending||editor?.wiring){editor.cancelWire();}
      else if(overlayType)closeOverlay();else pause();return;
    }
    if((e.key==='Delete'||e.key==='Backspace')&&editor&&!e.target.closest('#circuit-board')){e.preventDefault();editor.remove();return;}
    if(!overlayType&&canExplore()&&!e.target.closest('input,textarea,select,[contenteditable="true"]')&&['a','d','ArrowLeft','ArrowRight'].includes(e.key.length===1?e.key.toLowerCase():e.key)){e.preventDefault();const direction=navigationKey(e);if(direction)navigate(direction);return;}
    if(!overlayType){if(e.key.toLowerCase()==='j')journal();if(e.key.toLowerCase()==='i')inventory();if(e.key.toLowerCase()==='m')actions.mute();}
  });
  let last=performance.now(),lastPaint=0,lastSave=0;
  function frame(now){
    const introDelta=Math.max(0,(now-last)/1000),dt=Math.min(.05,introDelta);last=now;
    if(!document.hidden){
      if(!developer?.blocksGame){crash?.tick(introDelta,performance.now());power?.tick(dt);}animations.power=power?.active?power.view:null;if(!developer?.blocksGame){resumePendingDiscoveries();resumeMilestoneStory();}
      if(started&&!developer?.blocksGame&&overlayType!=='pause'&&overlayType!=='settings'&&overlayType!=='manual'&&overlayType!=='confirm'&&overlayType!=='outfitter'){
        if(isEarly(world)&&world.room==='life'&&!overlayType&&!presentation?.active&&(!pendingInteraction||pendingInteraction==='forward')&&!currentLine&&!repairDialogue.length&&!hasPendingDiscovery()){

          if(!gardenEmergency.active&&servicePending(world)&&!serviceState(world).failureAnnounced)showGardenEmergency();
        }
        const wasStable=has(world,'pressure_stable'),wasBusy=nandBusy(world),previousNandPhase=nandPhase(world),faultAge=animations.scrubberFailureTime??Infinity;
        if(!previewRequested)updateWorld(world,dt,panel&&editor&&!practiceContext&&!diagnostic?.active&&!presentation?.active&&!servicePending(world)?{id:panel,inputs:editor.inputs,state:editor.state}:null);animations.update(dt,world,reduced,!power?.active&&!introPending&&!overlayType&&!presentation?.active&&!transitioning&&!gardenEmergency.active&&!pilotSession?.stale);
        gardenEmergency.tick(dt,world,reduced);animations.gardenEmergencyPhase=gardenEmergency.phase||'idle';

        if(wasBusy!==nandBusy(world))setInert();
        if(world.room==='relay'&&previousNandPhase!==nandPhase(world)&&nandPhase(world)==='blackout')engineerVisual.play('surprised',world,animations);
        if(world.room==='relay'&&previousNandPhase!==nandPhase(world)&&nandPhase(world)==='sealing')audio.effect('door');
        if(world.room==='relay'&&world.nandEvent.failed&&!nandBusy(world)&&!world.nandEvent.explained&&(!(isInventoryPilot(world)||isEarly(world))||(!overlayType&&pendingInteraction!=='pickup-workshop.nand-cache'))){world.nandEvent.explained=true;persist(true);showNandBriefing();}
        if(!wasStable&&has(world,'pressure_stable')){audio.effect('door');say('stable');persist(true);}
        if(pendingInteraction){const h=roomHotspots(world,animations.companion).find(h=>h.id===pendingInteraction),valid=h&&queuedRoom===world.room&&(!h.pickupId||pickupAvailability(world,h.pickupId).state===queuedPickupState);if(!valid)cancelMovement();else if(!animations.actor.walking&&!overlayType&&!presentation?.active){const id=pendingInteraction,intent=queuedIntent;cancelMovement();if(intent==='service')openPanel('scrubber');else inspectObject(id);}}
      }else animations.time+=dt;
      if(now-lastPaint>32){outfitter?.tick(dt);renderer.draw(world,animations,{reduced,speaking:!!currentLine&&!linePaused,reaction:reactions.current(),worldVisible:started&&!overlayType&&!presentation?.active&&!transitioning&&!introPending&&!power?.active});refreshHUD();audio.setDucked(!!currentLine&&!linePaused||!!presentation?.active||!!document.querySelector('.teaching-window'));if(corePowered(world)&&!power?.active)audio.update(world,animations.time);lastPaint=now;}
      if(started&&!previewRequested&&now-lastSave>2200){saveCurrentWorld();lastSave=now;}
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  window.addEventListener('pagehide',()=>{if(started&&!previewRequested)saveCurrentWorld();diagnostic?.close();presentation?.cancel();audio.setHidden(true);pilotSession?.release();});
  window.addEventListener('pageshow',e=>{if(e.persisted&&pilotRequested)location.reload();});
  document.addEventListener('visibilitychange',()=>{last=performance.now();if(crash)crash.lastTickAt=null;audio.setHidden(document.hidden);if(document.hidden){cancelMovement();diagnostic?.close();presentation?.cancel();if(started&&!previewRequested)saveCurrentWorld();}});
}
boot().catch(error=>{app.innerHTML=`<div class="loading">The Kestrel could not wake: ${esc(error.message)}<br>Serve the project over HTTP and reload.</div>`;console.error(error);});
