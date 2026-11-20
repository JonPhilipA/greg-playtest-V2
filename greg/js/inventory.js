/** Package 2A: staged physical ledger. No editor, pickup UI or fabrication side effects. */
import {canonicalJSON} from './circuit-revision.js';

const freeze=value=>{Object.values(value).forEach(v=>{if(v&&typeof v==='object')freeze(v);});return Object.freeze(value);};
export const FINITE_PICKUPS=freeze({
  'engine.not':['finite.not.01'],
  'corridor.and':['finite.and.01'],
  'garden.or':['finite.or.01'],
  'garden.nor-kit':['finite.or.02','finite.not.02'],
  'garden.cutoff-kit':['finite.and.02','finite.not.03'],
  'garden.demorgan-kit':['finite.not.04','finite.not.05','finite.and.03'],
  'workshop.nand-cache':Array.from({length:6},(_,i)=>'finite.nand.0'+(i+1)),
  'gallery.xor':['finite.xor.01'],
});
export const FINITE_GATES=freeze(Object.fromEntries(Object.entries(FINITE_PICKUPS).flatMap(([pickupId,ids])=>ids.map(id=>[id,{id,componentType:id.split('.')[1].toUpperCase(),sourcePickupId:pickupId}]))));
export const FINITE_BUDGETS=freeze({ventilation:{NOT:1},security:{AND:1},alarm:{OR:1},scrubber:{OR:1,NOT:1},safetycutoff:{AND:1,NOT:1},nandnot:{NAND:1},nandand:{NAND:2},nandor:{NAND:3},sensordiff:{XOR:1},'service.scrubber.demorgan':{NOT:2,AND:1}});
export const INVENTORY_COMMANDS=Object.freeze(['InitializeInventory','CollectGate','ReserveGate','ReturnGate','CancelPlacement','ClearInventoryDraft','InstallGate','ReleaseGate']);
const own=(o,k)=>!!o&&Object.hasOwn(o,k);
const object=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
const integer=n=>Number.isSafeInteger(n)&&n>=0;
const identifier=s=>typeof s==='string'&&/^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,119}$/.test(s)&&!['constructor','prototype','__proto__'].includes(s);
const requireThat=(ok,message)=>{if(!ok)throw Error(message);};
const clone=o=>structuredClone(o);

export function createInventory(){
  return {engineVersion:1,mode:'staged',revision:0,
    instances:Object.fromEntries(Object.entries(FINITE_GATES).filter(([,g])=>g.sourcePickupId!=='gallery.xor').map(([id,g])=>[id,{...g,condition:'usable',owner:{kind:'world',pickupId:g.sourcePickupId}}])),
    pickups:Object.fromEntries(Object.keys(FINITE_PICKUPS).filter(id=>id!=='gallery.xor').map(id=>[id,[]])),drafts:{},installations:{},retirements:{},receipts:{},suppressedPickups:[],
    recovery:{log:[],quarantined:[],blocked:false}};
}
/** A room supply allocation, never a loose grant. Older comparator voyages keep their original manifest. */
export function initializeGallerySupply(w){
  if(w.foundation.curriculum.xorUseVersion!==1||w.foundation.curriculum.galleryVersion!==1)return;
  const i=w.foundation.inventory;if(Object.hasOwn(i.instances,'finite.xor.01'))return;
  requireThat(validateInventory(i).ok,'The physical ledger needs recovery.');
  i.instances['finite.xor.01']={...FINITE_GATES['finite.xor.01'],condition:'usable',owner:{kind:'world',pickupId:'gallery.xor'}};
  i.pickups['gallery.xor']=[];i.revision++;
}
export function hasInventoryLedger(value){
  return object(value)&&(['engineVersion','mode','drafts','installations','receipts','recovery'].some(key=>own(value,key))||['instances','pickups','reservations','installed'].some(key=>own(value,key)&&(!object(value[key])||Object.keys(value[key]).length>0)));
}
export function GetAvailableGates(inventory,componentType){
  if(!validateInventory(inventory).ok)return [];
  return clone(Object.values(inventory.instances).filter(g=>g.owner.kind==='bag'&&g.condition==='usable'&&(!componentType||g.componentType===componentType)));
}
export function GetGateOwnership(inventory,instanceId){
  return own(FINITE_GATES,instanceId)&&own(inventory?.instances,instanceId)?clone(inventory.instances[instanceId].owner):null;
}
const bindingMatches=(g,owner,node)=>node&&node.instanceId===g.id&&node.type===g.componentType&&node.token===owner.token;

/** Strict checks for both command candidates and persisted snapshots. Counts are always derived. */
export function validateInventory(i){
  const errors=[];
  const check=(ok,message)=>{if(!ok)errors.push(message);};
  if(!object(i)||i.engineVersion!==1||i.mode!=='staged')return {ok:false,errors:['Unsupported inventory version or mode.']};
  check(integer(i.revision),'Invalid inventory revision.');
  for(const key of ['instances','pickups','drafts','installations','receipts'])check(object(i[key]),'Invalid inventory section: '+key);
  check(object(i.recovery)&&Array.isArray(i.recovery.log)&&Array.isArray(i.recovery.quarantined)&&i.recovery.blocked===false,'Inventory recovery is blocked or malformed.');
  check(Array.isArray(i.suppressedPickups)&&i.suppressedPickups.every(x=>own(FINITE_PICKUPS,x)),'Invalid heritage pickup metadata.');
  if(errors.length)return {ok:false,errors};
  const gallery=own(i.instances,'finite.xor.01');
  check(Object.keys(i.instances).length===(gallery?17:16),'The finite ledger must match its sixteen-part manifest and optional Gallery supply.');
  check(own(i.pickups,'gallery.xor')===gallery,'The Gallery supply manifest is incomplete.');
  const tokens=new Set(),claims=new Map(),usage={};
  for(const [pickupId,ids]of Object.entries(i.pickups)){
    check(own(FINITE_PICKUPS,pickupId)&&Array.isArray(ids),'Unknown or malformed pickup.');
    if(!Array.isArray(ids))continue;
    check(new Set(ids).size===ids.length,'Duplicate pickup claim.');
    for(const id of ids){check(FINITE_PICKUPS[pickupId]?.includes(id),'Pickup provenance mismatch.');claims.set(id,(claims.get(id)||0)+1);}
  }
  for(const id of Object.keys(FINITE_PICKUPS).filter(id=>id!=='gallery.xor'||gallery))check(own(i.pickups,id),'Missing pickup record.');
  for(const [id,g]of Object.entries(i.instances)){
    const source=own(FINITE_GATES,id)?FINITE_GATES[id]:null;
    if(!source||!object(g)){check(false,'Unknown finite instance: '+id);continue;}
    check(g.id===id&&g.componentType===source.componentType&&g.sourcePickupId===source.sourcePickupId,'Immutable instance provenance changed: '+id);
    check(['usable','damaged'].includes(g.condition),'Invalid gate condition: '+id);
    const o=g.owner;
    if(!object(o)){check(false,'Missing owner: '+id);continue;}
    check(claims.get(id)===(o.kind==='world'?undefined:1),'Claim/ownership mismatch: '+id);
    if(o.kind==='world')check(o.pickupId===source.sourcePickupId&&Object.keys(o).length===2,'World owner mismatch: '+id);
    else if(o.kind==='bag')check(Object.keys(o).length===1,'Bag has conflicting ownership: '+id);
    else if(['draft','installed'].includes(o.kind)){
      check(g.condition==='usable','Unusable gate bound to circuit: '+id);
      check(identifier(o.draftId)&&identifier(o.puzzleId)&&identifier(o.nodeId)&&identifier(o.token),'Invalid circuit ownership reference: '+id);
      check(Object.keys(o).length===5,'Conflicting circuit ownership: '+id);
      check(!tokens.has(o.token),'Duplicate reservation token.');tokens.add(o.token);
      const holder=o.kind==='draft'?i.drafts[o.draftId]:i.installations[o.puzzleId];
      check(holder?.puzzleId===o.puzzleId&&holder?.draftId===o.draftId&&bindingMatches(g,o,holder?.nodes?.[o.nodeId]),'Missing matching '+o.kind+' node: '+id);
      if(o.kind==='installed')check(identifier(holder?.installationToken)&&identifier(holder?.certificateId),'Invalid installation authority: '+id);
      usage[o.puzzleId]||={};usage[o.puzzleId][g.componentType]=(usage[o.puzzleId][g.componentType]||0)+1;
    }else if(o.kind==='retired'){
      const r=i.retirements?.[id],h=i.installations[o.puzzleId];check(g.condition==='damaged'&&r?.instanceId===id&&r.reason==='scrubber-hardware-failure'&&typeof r.transactionId==='string'&&canonicalJSON(r.previousOwner)===canonicalJSON({...o,kind:'installed'})&&h?.valid===false&&bindingMatches(g,o,h?.nodes?.[o.nodeId]),'Invalid damaged hardware history: '+id);
    }else check(false,'Unknown owner kind: '+id);
  }
  for(const id of Object.keys(FINITE_GATES).filter(id=>id!=='finite.xor.01'||gallery))check(own(i.instances,id),'Missing finite instance: '+id);
  for(const [table,kind]of [['drafts','draft'],['installations','installed']])for(const [key,h]of Object.entries(i[table])){
    if(!object(h)||!object(h.nodes)){check(false,'Malformed '+kind+' container.');continue;}
    check(identifier(key)&&identifier(h.draftId)&&own(FINITE_BUDGETS,h.puzzleId)&&integer(h.revision),'Invalid '+kind+' container.');
    check(table==='drafts'?key===h.draftId:key===h.puzzleId,'Mismatched container ID.');
    check(table==='drafts'?['draft','installed','cleared'].includes(h.status):typeof h.valid==='boolean','Invalid container status.');
    if(table==='drafts'&&h.status!=='draft')check(!Object.keys(h.nodes).length,'Closed draft still owns nodes.');
    for(const [nodeId,node]of Object.entries(h.nodes)){
      const g=i.instances[node?.instanceId],o=g?.owner;
      check(identifier(nodeId)&&(o?.kind===kind||(kind==='installed'&&o?.kind==='retired'&&g.condition==='damaged'&&h.valid===false))&&o.draftId===h.draftId&&o.puzzleId===h.puzzleId&&o.nodeId===nodeId&&bindingMatches(g,o,node),'Duplicate or foreign node claim: '+nodeId);
    }
  }
  for(const [puzzleId,types]of Object.entries(usage))for(const [type,n]of Object.entries(types))check(n<=(FINITE_BUDGETS[puzzleId]?.[type]||0),'Finite task budget exceeded: '+puzzleId);
  for(const [id,r]of Object.entries(i.receipts))check(identifier(id)&&object(r)&&typeof r.fingerprint==='string'&&object(r.result),'Invalid command receipt.');
  return {ok:!errors.length,errors};
}

/** Recovery trusts the single ledger owner; extra graph claims never refund a second part. */
export function recoverInventory(saved){
  const i=clone(saved),log=[],quarantined=[];
  if(object(i)&&i.engineVersion===1&&object(i.instances)&&object(i.pickups)){
    const added=FINITE_PICKUPS['garden.demorgan-kit'];
    if(Object.keys(i.instances).length===13&&added.every(id=>!own(i.instances,id))&&!own(i.pickups,'garden.demorgan-kit')&&Object.keys(FINITE_GATES).filter(id=>id!=='finite.xor.01'&&!added.includes(id)).every(id=>own(i.instances,id))){
      for(const id of added)i.instances[id]={...FINITE_GATES[id],condition:'usable',owner:{kind:'world',pickupId:'garden.demorgan-kit'}};
      i.pickups['garden.demorgan-kit']=[];i.revision++;log.push({reason:'manifest-v2-emergency-kit-added',instanceIds:added});
    }
    i.retirements??={};
  }
  if(object(i)&&i.engineVersion===1&&object(i.instances)&&object(i.drafts)&&object(i.installations)&&object(i.recovery)&&Array.isArray(i.recovery.log)&&Array.isArray(i.recovery.quarantined)){
    for(const [id,g]of Object.entries(i.instances))if(!own(FINITE_GATES,id)){quarantined.push({reason:'unknown-instance',id,record:clone(g)});delete i.instances[id];}
    for(const [table,kind]of [['drafts','draft'],['installations','installed']])for(const h of Object.values(i[table]))if(object(h?.nodes))for(const [nodeId,node]of Object.entries(h.nodes)){
      const g=i.instances[node?.instanceId],o=g?.owner;
      if((o?.kind!==kind&&!(kind==='installed'&&o?.kind==='retired'&&g.condition==='damaged'&&h.valid===false))||o.draftId!==h.draftId||o.puzzleId!==h.puzzleId||o.nodeId!==nodeId||!bindingMatches(g,o,node)){
        quarantined.push({reason:'foreign-node-claim',kind,nodeId,record:clone(node)});delete h.nodes[nodeId];
        if(kind==='installed')h.valid=false;
      }
    }
    for(const g of Object.values(i.instances))if(g?.owner?.kind==='draft'){
      const o=g.owner,d=i.drafts[o.draftId];
      if(!bindingMatches(g,o,d?.nodes?.[o.nodeId])){
        g.owner={kind:'bag'};log.push({reason:'lost-draft-node-returned',instanceId:g.id,token:o.token});
        if(d&&integer(d.revision))d.revision++;
      }
    }
    if(log.length||quarantined.length){i.recovery.log.push(...log);i.recovery.quarantined.push(...quarantined);if(integer(i.revision))i.revision++;}
  }
  const validation=validateInventory(i);
  if(!validation.ok&&object(i)){
    i.recovery={...(object(i.recovery)?i.recovery:{}),blocked:true,errors:validation.errors};
    // Heritage migration may append suppression metadata even while the physical ledger is blocked.
    if(!Array.isArray(i.suppressedPickups))i.suppressedPickups=[];
  }
  return {inventory:i,blocked:!validation.ok,issues:[...log.map(x=>x.reason),...quarantined.map(x=>x.reason),...validation.errors]};
}

/** Called only inside executeCommand's cloned candidate transaction. */
export function reduceInventory(w,c,runtime={}){
  if(c.type==='InitializeInventory'){
    if(w.foundation.inventory?.engineVersion===1){requireThat(validateInventory(w.foundation.inventory).ok,'The inventory needs recovery.');return {duplicate:true};}
    requireThat(w.foundation.inventory?.engineVersion===undefined,'Unsupported inventory cannot be reset.');
    requireThat(!hasInventoryLedger(w.foundation.inventory),'Existing physical records cannot be reset by initialization.');
    const heritage=w.foundation.inventory?.suppressedPickups||[];
    w.foundation.inventory=createInventory();w.foundation.inventory.suppressedPickups=clone(heritage);
    requireThat(validateInventory(w.foundation.inventory).ok,'Invalid heritage inventory metadata.');
    return {initialized:true,staged:true};
  }
  const i=w.foundation.inventory;
  requireThat(validateInventory(i).ok,'Initialize a valid staged inventory before using physical parts.');
  requireThat(i.revision<Number.MAX_SAFE_INTEGER,'The inventory revision limit was reached.');
  if(c.expectedInventoryRevision!==undefined)requireThat(c.expectedInventoryRevision===i.revision,'The inventory revision is stale.');
  const fingerprint=canonicalJSON(Object.fromEntries(Object.entries(c).filter(([k])=>!['requestId','expectedRevision','expectedInventoryRevision'].includes(k))));
  const usesReceipt=!['CollectGate','CancelPlacement'].includes(c.type)||!!c.token;
  if(usesReceipt){
    requireThat(identifier(c.requestId),'A unique requestId is required.');
    if(own(i.receipts,c.requestId)){const prior=i.receipts[c.requestId];requireThat(prior.fingerprint===fingerprint,'This requestId belongs to another operation.');return {...clone(prior.result),duplicate:true};}
  }
  const gate=()=>{requireThat(own(FINITE_GATES,c.instanceId),'Unknown physical gate instance.');return i.instances[c.instanceId];};
  const draft=()=>{requireThat(identifier(c.draftId)&&own(i.drafts,c.draftId),'Unknown circuit draft.');const d=i.drafts[c.draftId];requireThat(d.puzzleId===c.puzzleId,'The draft belongs to another puzzle.');return d;};
  let result={},changed=true;
  switch(c.type){
    case 'CollectGate':{
      requireThat(own(FINITE_PICKUPS,c.pickupId),'Unknown physical pickup.');
      requireThat(own(i.pickups,c.pickupId),'This supply is not allocated to this voyage.');
      const ids=c.instanceId?[c.instanceId]:FINITE_PICKUPS[c.pickupId];
      requireThat(ids.every(id=>FINITE_PICKUPS[c.pickupId].includes(id)),'The gate does not belong to this pickup.');
      const pending=ids.filter(id=>!i.pickups[c.pickupId].includes(id));
      if(!pending.length)return {duplicate:true,collected:[]};
      requireThat(pending.every(id=>i.instances[id].owner.kind==='world'),'Pickup ownership changed.');
      for(const id of pending){i.instances[id].owner={kind:'bag'};i.pickups[c.pickupId].push(id);}
      result={collected:clone(pending)};break;
    }
    case 'ReserveGate':{
      const g=gate();requireThat(identifier(c.draftId)&&identifier(c.nodeId)&&own(FINITE_BUDGETS,c.puzzleId),'Invalid draft, node or finite puzzle.');
      requireThat(g.owner.kind==='bag'&&g.condition==='usable','This gate is not available in the bag.');
      const used=Object.values(i.instances).filter(x=>['draft','installed'].includes(x.owner.kind)&&x.owner.puzzleId===c.puzzleId&&x.componentType===g.componentType).length;
      requireThat(used<(FINITE_BUDGETS[c.puzzleId][g.componentType]||0),'This task cannot consume stock allocated to other repairs.');
      let d=i.drafts[c.draftId];
      if(!d){d={draftId:c.draftId,puzzleId:c.puzzleId,revision:0,status:'draft',nodes:{}};i.drafts[c.draftId]=d;}
      requireThat(d.puzzleId===c.puzzleId&&d.status!=='installed'&&!own(d.nodes,c.nodeId),'The draft or node is already owned.');
      const token='reserve-'+(i.revision+1)+'-'+g.id;
      g.owner={kind:'draft',draftId:c.draftId,puzzleId:c.puzzleId,nodeId:c.nodeId,token};
      d.nodes[c.nodeId]={instanceId:g.id,type:g.componentType,token};d.status='draft';d.revision++;
      result={instanceId:g.id,token,draftRevision:d.revision};break;
    }
    case 'CancelPlacement':
      if(!c.token)return {cancelled:true,duplicate:true};
      // A client that reserved early must cancel the exact reservation token.
    case 'ReturnGate':{
      const g=gate(),d=draft(),o=g.owner;
      requireThat(o.kind==='draft'&&o.draftId===c.draftId&&o.puzzleId===c.puzzleId&&o.nodeId===c.nodeId&&o.token===c.token,'This reservation is stale or belongs to another owner.');
      delete d.nodes[c.nodeId];d.revision++;g.owner={kind:'bag'};result={returned:[g.id]};break;
    }
    case 'ClearInventoryDraft':{
      const d=draft();requireThat(d.status!=='installed','Installed machinery cannot be cleared as a draft.');
      requireThat(c.expectedDraftRevision===d.revision,'The draft changed before Clear.');
      const ids=Object.values(d.nodes).map(n=>n.instanceId);
      for(const id of ids)i.instances[id].owner={kind:'bag'};
      d.nodes={};d.status='cleared';d.revision++;result={returned:ids};break;
    }
    case 'InstallGate':{
      const d=draft();requireThat(d.status==='draft'&&Object.keys(d.nodes).length,'There are no reserved gates to install.');
      requireThat(c.expectedDraftRevision===d.revision,'The draft changed after validation.');
      requireThat(!Object.keys(i.installations[c.puzzleId]?.nodes||{}).length,'This machine already owns installed hardware.');
      const proof=runtime.inventoryInstallProof?.(w,clone(d));
      requireThat(proof&&identifier(proof.certificateId)&&proof.draftRevision===d.revision,'A trusted completion proof for the current draft is required.');
      const token='install-'+(i.revision+1)+'-'+c.puzzleId;
      i.installations[c.puzzleId]={draftId:d.draftId,puzzleId:d.puzzleId,revision:0,nodes:clone(d.nodes),certificateId:proof.certificateId,installationToken:token,valid:true};
      const ids=Object.values(d.nodes).map(n=>n.instanceId);
      for(const id of ids)i.instances[id].owner.kind='installed';
      d.nodes={};d.status='installed';d.revision++;
      result={installed:ids,installationToken:token,certificateId:proof.certificateId};break;
    }
    case 'ReleaseGate':{
      requireThat(c.authorized===true,'Explicit installed-service authorization is required.');
      const g=gate(),o=g.owner,h=i.installations[c.puzzleId];
      requireThat(o.kind==='installed'&&o.puzzleId===c.puzzleId&&h?.installationToken===c.installationToken,'This installed gate belongs to another machine or service session.');
      const safety=runtime.inventoryReleasePermission?.(w,clone(h));
      requireThat(safety?.permanentForwardRelease===true&&safety?.safeBacktracking===true,'Installed service requires a permanent room release and a safe recovery route.');
      delete h.nodes[o.nodeId];h.valid=false;h.revision++;g.owner={kind:'bag'};
      result={released:[g.id],invalidatedCertificate:h.certificateId};break;
    }
    default:changed=false;throw Error('Unknown inventory operation.');
  }
  if(changed){i.revision++;if(usesReceipt)i.receipts[c.requestId]={fingerprint,result:clone(result)};}
  const validated=validateInventory(i);requireThat(validated.ok,validated.errors.join(' '));
  return result;
}


/** Trusted service transaction only: retain the original owner and container, never refund a failed gate. */
export function retireScrubberHardware(w,transactionId){
 const i=w.foundation.inventory,h=i.installations.scrubber,ids=['finite.or.02','finite.not.02'];
 requireThat(validateInventory(i).ok&&h?.valid,'The original scrubber installation is missing.');
 requireThat(Object.values(h.nodes).length===2&&ids.every(id=>i.instances[id]?.owner.kind==='installed'&&i.instances[id].owner.puzzleId==='scrubber'),'The original finite OR/NOT source is required.');
 i.retirements??={};
 for(const id of ids){const g=i.instances[id];i.retirements[id]={instanceId:id,reason:'scrubber-hardware-failure',transactionId,previousOwner:clone(g.owner)};g.condition='damaged';g.owner={...g.owner,kind:'retired'};}
 h.valid=false;h.revision++;i.revision++;requireThat(validateInventory(i).ok,'Damaged hardware retirement failed validation.');return ids;
}
