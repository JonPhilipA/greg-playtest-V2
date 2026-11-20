import {createOutfitter} from './outfitter-state.js';
import {createCredits} from './credits.js';
import {restoreOpening} from './opening-state.js';
import {isEarly} from './curriculum-profile.js';
import {PUZZLES,COMPATIBILITY_PUZZLES,getPlayablePuzzle,CURRICULUM_REVISION} from './puzzle-definitions.js';
import {functionalSignature} from './circuit-revision.js';
import {hasInventoryLedger,recoverInventory} from './inventory.js';
import {LESSON_STAGES,lessonDefinition} from './lesson-controller.js';
export const SAVE_KEY='greg-steampunk-v3';
export const LEGACY_SAVE_KEY='greg-steampunk-v2';
export const ARCHIVE_SAVE_KEY='greg-adventure-v1';
export const SCHEMA_VERSION=3;
export const plain=value=>!!value&&typeof value==='object'&&!Array.isArray(value);
export function createFoundation(circuits,muted=false){
  return {
    exploration:{layoutVersion:1,workshopLayoutVersion:1},profile:'compatibility',revision:0,circuits:Object.fromEntries([...PUZZLES,...COMPATIBILITY_PUZZLES].filter(p=>circuits[p.id]&&(p.implemented||p.id==='safetycutoff')).map(p=>{const live=getPlayablePuzzle(p.id)||{contentVersion:1,validatorVersion:1};return [p.id,{functionalRevision:0,signature:functionalSignature(circuits[p.id]),contentVersion:live.contentVersion,validatorVersion:live.validatorVersion}];})),
    investigations:{},tested:{},applications:{},diagnostics:{},lessonProgress:{},hintPreferences:{},hintUsage:{version:1,revealed:{}},credits:createCredits(),outfitter:createOutfitter(),
    curriculum:{revision:CURRICULUM_REVISION,completed:{},concepts:{},certifications:{},catchUp:{},archives:{}},
    inventory:{instances:{},pickups:{},reservations:{},installed:{},suppressedPickups:[]},
    blueprints:{acquired:{},preferences:{}},components:{introduced:{},discovered:{},certified:{}},fabrication:{nand:false},
    dataInspector:{},processor:null,
    settings:{master:.7,sfx:.8,ambient:.35,muted:!!muted,reducedMotion:false},
    presentation:{version:2,seen:[],history:[],pending:[]},endingHistory:[],migration:null,
  };
}
export function parseSnapshot(raw){
  if(typeof raw!=='string'||!raw.length)throw Error('The stored notebook is empty.');
  if(raw.length>2_000_000)throw Error('The stored notebook exceeds the safe import size.');
  let p;try{p=JSON.parse(raw);}catch{throw Error('The stored notebook is not valid JSON.');}
  function safe(v,depth=0){if(depth>45)throw Error('The notebook is nested too deeply.');if(v&&typeof v==='object'){for(const k of Object.keys(v)){if(['__proto__','prototype','constructor'].includes(k))throw Error('The notebook contains an unsafe field.');safe(v[k],depth+1);}}}
  safe(p);if(!plain(p))throw Error('The notebook must be an object.');
  if(p.schemaVersion!==undefined&&p.schemaVersion!==3)throw Error('This notebook schema is not supported.');
  if(![1,2].includes(p.version))throw Error('This notebook version is not supported.');
  if(p.version===1&&p.completed!==undefined&&(!Array.isArray(p.completed)||p.completed.some(i=>!Number.isInteger(i)||i<0||i>13)))throw Error('Invalid archived completion list.');
  for(const k of ['machines','circuits','machineStates','sensors','doors','positions','foundation'])if(p[k]!==undefined&&!plain(p[k]))throw Error('Invalid notebook section: '+k);
  for(const k of ['flags','items','logs','discovered','dialogueSeen'])if(p[k]!==undefined&&(!Array.isArray(p[k])||p[k].some(v=>typeof v!=='string')))throw Error('Invalid notebook list: '+k);
  if(p.circuits)for(const [id,c]of Object.entries(p.circuits)){
    if(!plain(c)||!Array.isArray(c.nodes)||!Array.isArray(c.wires)||c.nodes.length>512||c.wires.length>2048)throw Error('Invalid circuit graph: '+id);
    for(const n of c.nodes)if(!plain(n)||typeof n.id!=='string'||typeof n.type!=='string')throw Error('Invalid circuit component: '+id);
    for(const w of c.wires)if(!plain(w)||typeof w.from!=='string'||typeof w.to!=='string'||!Number.isInteger(w.in)||!Number.isInteger(w.out))throw Error('Invalid wire: '+id);
  }
  if(p.schemaVersion===3&&!plain(p.foundation))throw Error('The version3 notebook is missing its foundation state.');
  return p;
}
export function normalizeFoundation(saved,w){
  const f=createFoundation(w.circuits,w.muted);
  if(!plain(saved))return f;
  if(saved.earlyCurriculum!==undefined){if(saved.earlyCurriculum?.version===1){f.earlyCurriculum={version:1,compatibility:'first-five-and-existing-workshop-adapter'};f.services=plain(saved.services)?structuredClone(saved.services):{};}else{w.saveProtection={blocked:true};w.loadIssue='Unsupported early curriculum state.';}}
  if(saved.exploration?.galleryRoomsVersion===1)f.exploration.galleryRoomsVersion=1;
  const integer=v=>Number.isSafeInteger(v)&&v>=0;
  f.revision=integer(saved.revision)?saved.revision:0;
  for(const id of Object.keys(f.circuits)){
    const m=saved.circuits?.[id];if(integer(m?.functionalRevision))f.circuits[id].functionalRevision=m.functionalRevision;
    f.investigations[id]=saved.investigations?.[id]===true;
    for(const key of (getPlayablePuzzle(id,w)||{investigationRequirements:['equipment:'+id]}).investigationRequirements)f.investigations[key]=saved.investigations?.[key]===true||f.investigations[id];
  }
  for(const key of ['tested','applications','diagnostics','lessonProgress','dataInspector'])if(plain(saved[key]))f[key]=structuredClone(saved[key]);
  const hintKeys=new Set([...PUZZLES.map(p=>p.id),'service.scrubber.demorgan','sensordiff:installed-xor']);
  if(plain(saved.hintPreferences))for(const [key,view]of Object.entries(saved.hintPreferences))if(hintKeys.has(key)&&plain(view)&&Number.isInteger(view.level)&&view.level>=0&&view.level<=4&&Number.isInteger(view.unlocked)&&view.unlocked>=view.level&&view.unlocked<=4&&typeof view.visible==='boolean')f.hintPreferences[key]={level:view.level,unlocked:view.unlocked,visible:view.visible};
  f.hintUsage={version:saved.hintUsage?.version===1&&plain(saved.hintUsage.revealed)?1:0,revealed:{}};
  if(plain(saved.hintUsage?.revealed))for(const [key,used]of Object.entries(saved.hintUsage.revealed))if(hintKeys.has(key)&&used===true)f.hintUsage.revealed[key]=true;
  // The physical ledger is explicitly staged; importing it never activates gameplay restrictions.
  for(const key of ['inventory','blueprints','components','fabrication','curriculum'])if(plain(saved[key]))f[key]={...f[key],...structuredClone(saved[key])};
  if(hasInventoryLedger(saved.inventory)){
    const recovered=recoverInventory(saved.inventory);f.inventory=recovered.inventory;
    if(recovered.blocked){w.loadIssue='The staged inventory has inconsistent ownership. Existing game progress was preserved; saving is blocked pending recovery.';w.saveProtection={blocked:true,message:w.loadIssue};}
  }
  if(saved.inventory!==undefined&&!plain(saved.inventory)){
    w.loadIssue='The inventory section is malformed. Existing game progress was preserved; saving is blocked pending recovery.';w.saveProtection={blocked:true,message:w.loadIssue};
  }
  if(saved.inventoryPilot!==undefined){
    if(saved.inventoryPilot?.version===1&&saved.inventoryPilot.kind==='finite-p01-p03')f.inventoryPilot={version:1,kind:'finite-p01-p03'};
    else{w.loadIssue='The inventory pilot marker is invalid.';w.saveProtection={blocked:true,message:w.loadIssue};}
  }
  if(saved.demoMode!==undefined){w.loadIssue='Developer demonstrations cannot be imported as a saved voyage.';w.saveProtection={blocked:true,message:w.loadIssue};}
  f.lessonProgress=Object.fromEntries(Object.entries(f.lessonProgress).filter(([id,p])=>lessonDefinition(id)&&plain(p)&&LESSON_STAGES.includes(p.stage)).map(([id,p])=>[id,{stage:p.stage,visited:Array.isArray(p.visited)?[...new Set(p.visited.filter(s=>LESSON_STAGES.includes(s)))]:[],path:p.path==='guided'?'guided':'independent',competency:p.competency===true}]));
  f.processor=saved.processor===null||plain(saved.processor)?structuredClone(saved.processor):null;
  if(plain(saved.migration))f.migration=structuredClone(saved.migration);
  if(plain(saved.settings)){
    for(const k of ['master','sfx','ambient'])if(Number.isFinite(saved.settings[k]))f.settings[k]=Math.max(0,Math.min(1,saved.settings[k]));
    f.settings.reducedMotion=saved.settings.reducedMotion===true;
  }
  f.settings.muted=w.muted;
  if(Array.isArray(saved.presentation?.seen))f.presentation.seen=saved.presentation.seen.filter(x=>typeof x==='string').slice(-256);
  if(Array.isArray(saved.presentation?.history))f.presentation.history=saved.presentation.history.filter(plain).slice(-128);
  if(saved.presentation?.version===2&&Array.isArray(saved.presentation.pending))f.presentation.pending=saved.presentation.pending.filter(id=>typeof id==='string'&&!f.presentation.seen.includes(id)&&f.presentation.history.some(e=>e.eventId===id&&['component.discovered','component.found'].includes(e.type))).slice(-128);
  // Never allow a saved profile or field to activate unimplemented content.
  f.profile='compatibility';
  for(const table of ['tested','applications','diagnostics'])for(const id of Object.keys(f[table]))if(!getPlayablePuzzle(id,{...w,foundation:f}))delete f[table][id];
  w.foundation=f;restoreOpening(saved.opening,w);return f;
}
