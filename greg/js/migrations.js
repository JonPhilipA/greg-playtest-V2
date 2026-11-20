import {initializeArithmetic} from './arithmetic-curriculum.js';
import {awardRepairCredits} from './credits.js';
import {restoreOutfitter} from './outfitter-state.js';
import {restoreCredits} from './credits.js';
import {validateSignedBinary} from './signed-binary.js';
import {validateP01Guide} from './p01-guide.js';
import {validateGardenDecoder} from './garden-decoder.js';
import {restoreDecoderStages} from './decoder-stages.js';
import {initializeGallery} from './gallery-puzzles.js';
import {GALLERY_DATA_IDS} from './gallery-data.js';
import {restoreGalleryStages} from './gallery-data-stages.js';
import {restoreFabrication} from './fabrication.js';
import {isEarly,galleryEnabled,serviceState} from './curriculum-profile.js';
import {SAFETY_CUTOFF} from './repairs.js';
import {createCircuit} from './puzzles.js';
import {restoreEarlyState} from './garden-service.js';
import {LEVELS} from './puzzles.js';
import {REPAIRS} from './repairs.js';
import {testCircuit} from './validator.js';
import {createFoundation,normalizeFoundation,parseSnapshot} from './save-schema.js';
import {functionalSignature,sourceDigest} from './circuit-revision.js';
import {dependencySignature} from './progression.js';
import {getPlayablePuzzle} from './puzzle-definitions.js';
import {restoreComponentEvidence,inferComponentDiscoveries} from './components.js';
import {restoreBlueprints} from './blueprints.js';

export const ARCHIVE_V1_MAP=Object.freeze({2:'alarm',3:'security',4:'ventilation',5:'hull',6:'fabricator',7:'firewall',8:'navbits',9:'trajectory',10:'alu',11:'memory',12:'reactor',13:'override'});
function archiveWorld(p){
  const copy={version:2,campaignRevision:0,room:'engine',circuits:{},machines:{},machineStates:{},muted:p.muted===true};
  const completed=new Set(Array.isArray(p.completed)?p.completed:[]);
  for(const [index,id]of Object.entries(ARCHIVE_V1_MAP)){
    const c=p.circuits?.[index];
    if(c){copy.circuits[id]=structuredClone(c);copy.machines[id]={certified:completed.has(Number(index))&&testCircuit(LEVELS[Number(index)],c).pass};}
  }
  // Index0 lighting and index1 fan-out deliberately do not map to NOT or security.
  return copy;
}
function compositionProven(c){
  const incoming=(id,pin)=>c.wires.find(w=>w.to===id&&w.in===pin);
  const out=incoming('Y',0),not=c.nodes.find(n=>n.id===out?.from&&n.type==='NOT');
  const mid=not&&incoming(not.id,0),or=c.nodes.find(n=>n.id===mid?.from&&n.type==='OR');
  if(!or)return false;
  const a=incoming(or.id,0),b=incoming(or.id,1);
  return a?.out===0&&b?.out===0&&new Set([a.from,b.from]).size===2&&[a.from,b.from].every(id=>['A','B'].includes(id));
}
export function recordCompatibility(w,id){
  const f=w.foundation,m=w.machines[id];if(!m?.certified)return;
  const meta=f.circuits[id];
  f.curriculum.legacyEvidence||={};
  f.curriculum.legacyEvidence[id]={contentVersion:1,validatorVersion:1,signature:meta.signature,provenance:'compatibility-repair'};
  if(!['scrubber','trajectory','alu','memory','flightmemory'].includes(id))f.curriculum.completed[id]=true;
  if(id==='scrubber'){
    const proven=compositionProven(w.circuits[id]);f.curriculum.completed[id]=proven;
    f.curriculum.catchUp.scrubber={required:!proven,compositionProven:proven,kitId:'garden.nor-kit',allocationEligibility:proven?'suppressed':'eligible',claimed:f.curriculum.catchUp.scrubber?.claimed===true};
  }
  for(const [key,pickup]of [['ventilation','engine.not'],['security','corridor.and'],['alarm','garden.or']])if(id===key&&!f.inventory.suppressedPickups.includes(pickup))f.inventory.suppressedPickups.push(pickup);
  if(id==='scrubber'&&f.curriculum.completed.scrubber&&!f.inventory.suppressedPickups.includes('garden.nor-kit'))f.inventory.suppressedPickups.push('garden.nor-kit');
  if(['trajectory','alu','memory','flightmemory'].includes(id)){
    f.curriculum.catchUp[id]={required:true,targetContentVersion:2,reason:id==='memory'?'Gate-level SR/D/DFF construction is not proven.':id==='alu'?'Four-operation ALU requires construction and retest.':id==='flightmemory'?'Enable-and-hold semantics require a new test.':'Ripple/bus construction stage is not proven.'};
    f.curriculum.archives[id]||={graph:structuredClone(w.circuits[id]),contentVersion:1,signature:meta.signature,readOnly:true};
  }
  const committed=Object.entries({nandnot:1,nandand:2,nandor:3}).reduce((n,[key,count])=>n+(w.machines[key]?.certified?count:0),0);
  f.curriculum.catchUp.workshopStock={pickupId:'workshop.nand-cache',remainingAllocation:6-committed,heritageInstalled:committed,granted:false};
  if(committed===6&&!f.inventory.suppressedPickups.includes('workshop.nand-cache'))f.inventory.suppressedPickups.push('workshop.nand-cache');
}
export function migrateSnapshot(raw,{restoreLegacy}){
  const p=parseSnapshot(raw),digest=sourceDigest(raw),w=restoreLegacy(JSON.stringify(p.version===1?archiveWorld(p):structuredClone(p)));
  if(isEarly(p))initializeGallery(w,p);
  if(isEarly(p)){w.circuits.safetycutoff=structuredClone(p.circuits?.safetycutoff||createCircuit(SAFETY_CUTOFF));w.machines.safetycutoff={...(p.machines?.safetycutoff||{}),certified:p.machines?.safetycutoff?.certified===true&&testCircuit(SAFETY_CUTOFF,w.circuits.safetycutoff).pass};}
  w.foundation=p.schemaVersion===3?normalizeFoundation(p.foundation,w):createFoundation(w.circuits,w.muted);
  if(w.saveProtection?.blocked)w.saveProtection.originalSnapshot=raw;
  const f=w.foundation;if(p.schemaVersion!==3)f.hintUsage={version:0,revealed:{}};f.curriculum.xorUseVersion=galleryEnabled(p)&&p.foundation?.curriculum?.xorUseVersion===1?1:0;if(galleryEnabled(p))f.curriculum.galleryVersion=1;
  if(galleryEnabled(p)){
    if(p.foundation?.curriculum?.signedLessonVersion!==1&&w.machines.cryo_signed?.certified)f.dataInspector.signedBinaryLegacy=true;
    f.curriculum.signedLessonVersion=1;
    f.curriculum.galleryDataVersion=1;
    for(const id of GALLERY_DATA_IDS){
      if(p.foundation?.curriculum?.galleryDataVersion!==1){
        if(p.circuits?.[id])f.curriculum.archives['pre-gallery-data:'+id]={graph:structuredClone(p.circuits[id]),machine:structuredClone(p.machines?.[id]||{}),application:structuredClone(p.foundation?.applications?.[id]||null),readOnly:true,contentVersion:1};
        for(const table of ['tested','applications','diagnostics','lessonProgress'])delete f[table][id];delete f.curriculum.completed[id];
      }
      f.circuits[id]={...f.circuits[id],signature:functionalSignature(w.circuits[id]),contentVersion:2,validatorVersion:2};
    }
  }
  if(p.schemaVersion!==3)f.migration={version:1,sourceVersion:p.version,sourceDigest:digest,originalSnapshot:raw,unmappedArchiveIndices:p.version===1?[0,1].filter(i=>p.completed?.includes(i)):[]};
  initializeArithmetic(w,REPAIRS,p);
  for(const [id,meta]of Object.entries(f.circuits)){
    if(isEarly(w)&&id==='scrubber'&&serviceState(w)?.triggered)continue;
    const spec=getPlayablePuzzle(id,w),sig=functionalSignature(w.circuits[id]);meta.signature=sig;
    const a=f.applications[id];
    if(w.machines[id].certified){
      if(!a||a.signature!==sig||a.contentVersion!==spec.contentVersion||a.validatorVersion!==spec.validatorVersion||a.functionalRevision!==meta.functionalRevision||typeof a.transactionId!=='string')f.applications[id]={transactionId:'import-'+(f.migration?.sourceDigest||digest)+'-'+id,signature:sig,functionalRevision:meta.functionalRevision,contentVersion:spec.contentVersion,validatorVersion:spec.validatorVersion,provenance:'legacy-compatible'};
      recordCompatibility(w,id);
    }else delete f.applications[id];
    const d=f.diagnostics[id];
    if(d?.signature!==sig)delete f.diagnostics[id];
    const t=f.tested[id];
    if(!t?.pass||t.signature!==sig||t.functionalRevision!==meta.functionalRevision||t.contentVersion!==spec.contentVersion||t.validatorVersion!==spec.validatorVersion||!testCircuit(REPAIRS[id],w.circuits[id]).pass)delete f.tested[id];
  }
  for(const id of Object.keys(f.tested))if(f.tested[id].dependencyKey!==dependencySignature(w,id))delete f.tested[id];
  f.curriculum.catchUp.fabrication={required:true,missing:['safetycutoff'],grantsEntitlement:false};
  // Package1 records eligibility only. No finite instances, schematics or manufacturing rights are issued.
  if(p.schemaVersion!==3){f.fabrication.nand=false;f.components={introduced:{},discovered:{},certified:{}};f.blueprints={acquired:{},preferences:{}};}
  f.endingHistory=Array.from(new Set([...(Array.isArray(f.endingHistory)?f.endingHistory:[]),...(w.ending?[w.ending]:[])]));
  restoreComponentEvidence(w);restoreBlueprints(w);restoreEarlyState(w);restoreFabrication(w);inferComponentDiscoveries(w);restoreDecoderStages(w);restoreGalleryStages(w);validateGardenDecoder(w);validateP01Guide(w);validateSignedBinary(w);restoreCredits(w,p.foundation?.credits);restoreOutfitter(w,p.foundation?.outfitter);if(f.curriculum.arithmeticGrandfathered)awardRepairCredits(w,'twos_complement','historical-arithmetic',null,{previouslyApplied:true});return w;
}
