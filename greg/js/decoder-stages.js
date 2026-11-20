import {validateDataShape,testDataConfiguration} from './data-consoles.js';
const proofValid=(proof,mode)=>proof?.raw===246&&proof.mode===mode&&typeof proof.transactionId==='string'&&proof.transactionId.length>0;
/** Stage records describe verified interpretations, never physical components or puzzle rewards. */
export function decoderProgress(w){const c=w.circuits?.cryo_signed?.configuration||{},s=w.foundation?.dataInspector?.cryo_signed;const temperature=s?.version===1&&proofValid(s.temperature,'signed')&&c.temperature==='signed',speed=temperature&&proofValid(s.speed,'unsigned')&&c.speed==='unsigned';return {temperature:!!temperature,speed:!!speed,complete:!!speed,stage:temperature?'speed':'temperature'};}
export function invalidateDecoderStages(w,before,after){const s=w.foundation.dataInspector?.cryo_signed;if(!s)return;if(before.configuration.temperature!==after.configuration.temperature){delete s.temperature;delete s.speed;}else if(before.configuration.speed!==after.configuration.speed)delete s.speed;}
export function verifyDecoderStage(w,stage,transactionId){
 if(!['temperature','speed'].includes(stage))throw Error('Select a valid P11 sensor stage.');
 const c=validateDataShape('cryo_signed',w.circuits.cryo_signed),progress=decoderProgress(w);
 if(stage==='speed'&&!progress.temperature)throw Error('Restore the cryogenic temperature sensor before testing the motor sensor.');
 const row=testDataConfiguration('cryo_signed',w.circuits.cryo_signed).rows.find(r=>r.inputs.channel===stage),pass=row.pass;
 if(pass){const s=w.foundation.dataInspector.cryo_signed??={version:1};if(!progress[stage])s[stage]={raw:246,mode:c[stage],transactionId};}
 return {pass,rows:[row],stage,stageComplete:pass,overallVerified:false,error:pass?null:stage==='temperature'?'246°C is outside the −40°C to +60°C operating range. The raw sensor bits are intact; check their interpretation.':'−10 RPM is outside the 0–255 RPM operating range. Check how this equipment interprets the same raw bits.'};
}
/** Preserve old applied P11 repairs, but never infer a new repair from unverified settings. */
export function restoreDecoderStages(w){
 if(!w.circuits?.cryo_signed)return w;
 const f=w.foundation,s=f.dataInspector.cryo_signed,applied=w.machines.cryo_signed?.certified;
 if(s!==undefined){if(!s||s.version!==1||Object.keys(s).some(k=>!['version','temperature','speed'].includes(k)))throw Error('The P11 sensor-stage record needs recovery.');for(const [key,mode]of [['temperature','signed'],['speed','unsigned']])if(s[key]!==undefined&&!proofValid(s[key],mode))throw Error('The P11 sensor-stage proof is invalid.');if(s.speed&&!s.temperature)throw Error('The motor-stage proof has no prior temperature repair.');}
 if(s===undefined&&applied&&f.applications.cryo_signed&&testDataConfiguration('cryo_signed',w.circuits.cryo_signed).pass){const transactionId=f.applications.cryo_signed.transactionId;f.dataInspector.cryo_signed={version:1,temperature:{raw:246,mode:'signed',transactionId},speed:{raw:246,mode:'unsigned',transactionId}};}
 const progress=decoderProgress(w);if(applied&&!progress.complete)throw Error('A completed P11 repair is missing its two sensor proofs.');if(!progress.complete)delete f.tested.cryo_signed;return w;
}
