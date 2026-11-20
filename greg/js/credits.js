import {circuitRewardPreview} from './circuit-rewards.js';
import {SERVICE_ID,serviceState} from './curriculum-profile.js';
import {ECONOMY_VERSION,PUZZLE_REWARDS,noHintsCredits} from './economy.js';
export const createCredits=()=>({version:1,balance:0,claims:{},spends:{}});
const amount=n=>Number.isSafeInteger(n)&&n>=0;
const plain=v=>v&&typeof v==='object'&&!Array.isArray(v);
const key=s=>typeof s==='string'&&s.length>0&&s.length<240&&!['__proto__','prototype','constructor'].includes(s);
export const creditBalance=w=>amount(w?.foundation?.credits?.balance)?w.foundation.credits.balance:0;
export const canAffordCredits=(w,cost)=>amount(cost)&&cost>0&&creditBalance(w)>=cost;
export function validateCredits(c){
 if(!plain(c)||c.version!==1||!amount(c.balance)||!plain(c.claims)||!plain(c.spends))throw Error('Invalid KESTREL Credits ledger.');
 let earned=0,spent=0;const ids=new Set(),milestones=new Set();
 for(const [id,r]of Object.entries(c.claims)){
  if(!key(id)||!plain(r)||r.repairKey!==id||!['earned','historical'].includes(r.kind)||!key(r.completionId)||!amount(r.base)||!amount(r.bonus)||!amount(r.milestone??0)||!amount(r.total)||r.total!==r.base+r.bonus+(r.milestone??0)||r.kind==='historical'&&r.total!==0||r.kind==='earned'&&r.total===0||ids.has(r.completionId))throw Error('Invalid or duplicated repair credit receipt.');
  if(r.milestone>0){if(!key(r.milestoneId)||!key(r.milestoneName)||milestones.has(r.milestoneId))throw Error('Invalid or duplicated engineering milestone receipt.');milestones.add(r.milestoneId);}
  ids.add(r.completionId);earned+=r.total;if(!amount(earned))throw Error('Credit receipts exceed the safe integer range.');
 }
 for(const [id,r]of Object.entries(c.spends)){if(!key(id)||!plain(r)||r.purchaseId!==id||!amount(r.amount)||r.amount===0||!key(r.authorizationId))throw Error('Invalid authorized credit purchase.');spent+=r.amount;if(!amount(spent))throw Error('Credit purchases exceed the safe integer range.');}
 if(earned-spent!==c.balance)throw Error('KESTREL Credits balance does not match its receipts.');return true;
}
export function restoreCredits(w,saved){
 try{
  if(saved!==undefined){validateCredits(saved);w.foundation.credits=structuredClone(saved);return;}
  const c=createCredits();
  for(const [id,m]of Object.entries(w.machines))if(m.certified||w.foundation.applications[id]||w.foundation.curriculum.legacyEvidence?.[id]||w.foundation.lessonProgress[id]?.competency)historical(c,id);
  const s=serviceState(w);if(s?.original?.certificate)historical(c,'scrubber');if(s?.applied)historical(c,SERVICE_ID);
  w.foundation.credits=c;
 }catch(e){w.foundation.credits=createCredits();w.saveProtection={blocked:true};w.loadIssue=e.message+' Your original notebook is preserved for recovery.';}
}
function historical(c,id){c.claims[id]={kind:'historical',repairKey:id,completionId:'before-credits:'+id,base:0,bonus:0,total:0};}
/** Only called inside the cloned authoritative Apply transaction, after installation succeeds. */
export function awardRepairCredits(w,id,transactionId,quote,{previouslyApplied=false}={}){
 const c=w.foundation.credits,repairKey=id==='scrubber'&&serviceState(w)?.triggered?SERVICE_ID:id;validateCredits(c);
 if(c.claims[repairKey])return null;
 if(previouslyApplied){historical(c,repairKey);return null;}
 const application=repairKey===SERVICE_ID?serviceState(w)?.application:w.foundation.applications[id];
 if(!w.machines[id]?.certified||application?.transactionId!==transactionId)throw Error('Credits require the committed repair application.');
 const configuration=PUZZLE_REWARDS[id];if(!quote||repairKey!==id||!configuration)return null;
 if(quote.base!==configuration.base||!amount(quote.bonus)||![0,noHintsCredits(configuration.base)].includes(quote.bonus)||!amount(quote.milestone)||!amount(quote.total)||quote.total!==quote.base+quote.bonus+quote.milestone||quote.total===0)throw Error('Invalid repair credit amount.');
 const m=configuration.milestone;
 if(quote.milestone>0&&(!m||m.id!==quote.milestoneId||m.amount!==quote.milestone))throw Error('Invalid milestone reward.');
 const restored=m?.condition!=='fabrication-restored'||w.foundation.fabrication?.nand===true&&w.foundation.fabrication.activatedBy===transactionId&&w.foundation.fabrication.autoSupply?.version===1;
 const milestone=quote.milestone>0&&restored&&!Object.values(c.claims).some(r=>r.milestoneId===m.id)?quote.milestone:0,total=quote.base+quote.bonus+milestone;
 if(!amount(c.balance+total))throw Error('Invalid repair credit amount.');
 const previousBalance=c.balance,receipt={kind:'earned',economyVersion:ECONOMY_VERSION,repairKey,completionId:transactionId+':machine.repaired',base:quote.base,bonus:quote.bonus,milestone,milestoneId:milestone?m.id:null,milestoneName:milestone?m.name:null,total};
 c.claims[repairKey]=receipt;c.balance+=receipt.total;validateCredits(c);return {...receipt,amount:receipt.total,previousBalance,balance:c.balance};
}
export const pendingRepairCredits=(w,id)=>circuitRewardPreview(w,id);
/** Spending boundary: validated transactions supply their own purchase authorization. */
export function deductAuthorizedCredits(w,{purchaseId,amount:cost},{authorize}={}){
 if(typeof authorize!=='function')throw Error('A purchase requires authoritative authorization.');
 if(!key(purchaseId)||!amount(cost)||cost===0)throw Error('Invalid credit purchase.');
 const c=w.foundation.credits;validateCredits(c);const prior=c.spends[purchaseId];
 if(prior){if(prior.amount!==cost)throw Error('Purchase identifier was reused with another cost.');return {duplicate:true,balance:c.balance};}
 const authorizationId=authorize({purchaseId,amount:cost,world:w});if(!key(authorizationId))throw Error('Purchase was not authorized.');
 if(!canAffordCredits(w,cost))throw Error('Insufficient KESTREL Credits.');
 c.spends[purchaseId]={purchaseId,amount:cost,authorizationId};c.balance-=cost;validateCredits(c);return {balance:c.balance,spent:cost};
}
