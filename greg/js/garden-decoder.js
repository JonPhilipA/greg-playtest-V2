import {isEarly} from './curriculum-profile.js';
export const GARDEN_BINARY_ID='garden.binary-decoder';
export const gardenDecoderComplete=w=>w.foundation?.curriculum?.concepts?.['decoder.foundation']===true;
export const freshGardenDecoder=()=>({version:1,stage:'explore',bits:0,explored:false,exploredMask:0,readCorrect:false,builtCorrect:false});
// Older saves have no interaction mask. Preserve their verified stages; reconcile unfinished exploration from its current switches.
export const gardenExplorationMask=s=>s.exploredMask??(s.explored?(s.stage==='explore'?s.bits:15):0);
export const gardenExplorationReady=s=>gardenExplorationMask(s).toString(2).replaceAll('0','').length>=2;
export function advanceGardenDecoder(state,command){
 const s=structuredClone(state);if(s.stage==='complete')return {state:s,pass:true,duplicate:true};
 if(command.action==='bits'){if(!['explore','build'].includes(s.stage)||!Number.isInteger(command.value)||command.value<0||command.value>15)throw Error('Use the four bit switches on this stage.');if(s.stage==='explore')s.exploredMask=gardenExplorationMask(s)|(s.bits^command.value);if(s.bits!==command.value)s.explored=true;s.bits=command.value;return {state:s};}
 if(command.action==='next'){if(s.stage!=='explore'||!gardenExplorationReady(s))throw Error('Try at least two different switches and watch their values add together.');s.stage='read';s.bits=13;return {state:s,pass:true};}
 if(command.action==='read'){if(s.stage!=='read')throw Error('Complete the current binary stage first.');if(command.answer!==13)return {state:s,pass:false,error:'Add the weights of the illuminated bits. Try again.'};s.readCorrect=true;s.stage='build';s.bits=0;return {state:s,pass:true};}
 if(command.action==='build'){if(s.stage!=='build'||!s.readCorrect)throw Error('Decode the sample reading first.');if(s.bits!==9)return {state:s,pass:false,error:'The illuminated weights must add to 9. Keep experimenting.'};s.stage='complete';s.builtCorrect=true;return {state:s,pass:true,completed:true};}
 throw Error('Unknown binary decoder control.');
}
export function gardenDecoderCommand(w,c){if(!isEarly(w)||w.room!=='life'||!w.machines.safetycutoff?.certified)throw Error('Restore P05, then use the Garden monitoring terminal.');const before=w.foundation.dataInspector.gardenBinary||freshGardenDecoder(),r=advanceGardenDecoder(before,c);w.foundation.dataInspector.gardenBinary=r.state;if(r.completed)w.foundation.curriculum.concepts['decoder.foundation']=true;return r;}
export function validateGardenDecoder(w){const s=w.foundation.dataInspector.gardenBinary;if(!s)return;if(s.version!==1||!['explore','read','build','complete'].includes(s.stage)||!Number.isInteger(s.bits)||s.bits<0||s.bits>15||typeof s.explored!=='boolean'||typeof s.readCorrect!=='boolean'||typeof s.builtCorrect!=='boolean'||(s.exploredMask!==undefined&&(!Number.isInteger(s.exploredMask)||s.exploredMask<0||s.exploredMask>15||(!s.explored&&s.exploredMask!==0)||(['read','build','complete'].includes(s.stage)&&!gardenExplorationReady(s))))||(['read','build','complete'].includes(s.stage)&&!s.explored)||(['build','complete'].includes(s.stage)&&!s.readCorrect)||(s.stage==='complete'&&(!s.builtCorrect||s.bits!==9||!gardenDecoderComplete(w))))throw Error('The Garden binary-decoder record needs recovery.');}
