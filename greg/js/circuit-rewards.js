import {isEarly,serviceState,SERVICE_ID} from './curriculum-profile.js';
import {PUZZLE_REWARDS,noHintsCredits} from './economy.js';
export const creditAmount=value=>new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(value);
export function circuitRewardPreview(w,id,{practice=false}={}){
 const service=isEarly(w)&&id==='scrubber'&&serviceState(w)?.triggered,key=service?SERVICE_ID:id;
 const configuration=PUZZLE_REWARDS[id];
 // The exact campaign budget consists of the 29 numbered repairs. Historical
 // unnumbered payouts remain in receipts; practice and maintenance are not farmable.
 if(practice||service||id==='ripple_adder'&&(w.foundation.curriculum.rippleLegacy||w.circuits[id]?.configuration?.rippleStage===2)||!configuration||w.foundation.credits?.claims?.[key]||w.machines[id]?.certified)return null;
 const usage=w.foundation.hintUsage,keys=Object.keys(usage?.revealed||{}),used=keys.some(k=>(k===key||k.startsWith(key+':'))&&usage.revealed[k])||Boolean(service&&serviceState(w).hintIndex>0);
 // An old save without coverage cannot prove an independent solution. Preserve its
 // progress and offer the base preview only; never invent historical hint eligibility.
 const noHints=usage?.version===1&&!used;
 const m=configuration.milestone,claimed=m&&Object.values(w.foundation.credits?.claims||{}).some(r=>r.milestoneId===m.id),available=m&&!claimed&&(m.condition!=='fabrication-restored'||!w.foundation.fabrication?.nand),milestone=available?m.amount:0,base=configuration.base,bonus=noHints?noHintsCredits(base):0;
 return Object.freeze({provisional:false,base,bonus,milestone,milestoneId:milestone?m.id:null,milestoneName:milestone?m.name:null,total:base+bonus+milestone,noHints});
}
