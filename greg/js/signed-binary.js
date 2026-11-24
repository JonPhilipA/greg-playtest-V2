import {advanceChallenge,startChallenge,validateChallenges} from './binary-challenges.js';
import {galleryEnabled,splitGallery} from './curriculum-profile.js';
export const SIGNED_BINARY_ID='gallery.signed-binary';
export const signedValue=bits=>bits>=8?bits-16:bits;
export const signedTutorialComplete=w=>w.foundation?.curriculum?.concepts?.['decoder.signed']===true;
export const signedTutorialSatisfied=w=>signedTutorialComplete(w)||w.foundation?.dataInspector?.signedBinaryLegacy===true||w.machines?.cryo_signed?.certified===true;
export const signedTutorialRequired=w=>galleryEnabled(w)&&w.foundation.curriculum.signedLessonVersion===1&&!signedTutorialSatisfied(w);
export const SIGNED_INTRO_MESSAGES=Object.freeze([
 "All four bits are ON. As an unsigned number, they're worth 8 + 4 + 2 + 1.",
 "That's 15. But the same four bits can mean something completely different.",
 null,
 "See that? The bits didn't change, but the number went from 15 to −1.",
 "In a signed four-bit number, the leftmost bit has a negative weight: −8 instead of +8.",
 "So 1111 becomes −8 + 4 + 2 + 1 = −1. Same bits. Different interpretation.",
 "Unsigned numbers can't represent negatives. Signed numbers can—but they give up some positive range."
]);
export const SIGNED_COMPARISON_CONTROLS=Object.freeze([{action:'continue-intro'},{action:'continue-intro'},{action:'mode',value:'signed'},...Array.from({length:4},()=>({action:'continue-intro'}))].map(Object.freeze));
export const guidedSignedExplore=s=>s.stage==='explore'&&s.introduction!==undefined&&s.introduction<7;
export const freshSignedBinary=({guided=true}={})=>({version:1,challengeVersion:2,challenge:0,stage:'explore',bits:guided?15:0,mode:'unsigned',exploredMask:0,readCorrect:false,builtCorrect:false,...(guided?{introduction:0}:{})});
export const signedExploreReady=s=>s.introduction!==undefined?s.introduction===7:(s.exploredMask&8)!==0&&[8,4,2,1].filter(b=>s.exploredMask&b).length>=2;
export function advanceSignedBinary(state,c){
 const s=structuredClone(state);if(s.stage==='complete')return {state:s,pass:true,duplicate:true};
 if(s.stage==='read'||s.stage==='build')return advanceChallenge(s,c);
 if(c.action==='continue-intro'){if(!guidedSignedExplore(s)||!SIGNED_INTRO_MESSAGES[s.introduction])throw Error(s.introduction===2?'Flip the interpretation switch from UNSIGNED to SIGNED.':'Complete the current tutorial step.');s.introduction++;return {state:s};}
 if(c.action==='bits'){if(guidedSignedExplore(s))throw Error('Keep all four bits ON; compare their interpretation.');if(!['explore','build'].includes(s.stage)||!Number.isInteger(c.value)||c.value<0||c.value>15)throw Error('Use the four binary switches in the current stage.');if(s.stage==='explore')s.exploredMask|=s.bits^c.value;s.bits=c.value;return {state:s};}
 if(c.action==='mode'){if(s.stage!=='explore'||!['signed','unsigned'].includes(c.value))throw Error('Compare interpretations during exploration.');if(guidedSignedExplore(s)&&s.introduction!==7){if(s.introduction!==2||s.mode!=='unsigned'||c.value!=='signed')throw Error('Follow G.R.E.G.’s explanation, then operate the interpretation switch.');s.introduction=3;}s.mode=c.value;return {state:s};}
 if(c.action==='next'){if(s.stage!=='explore'||!signedExploreReady(s))throw Error(s.introduction!==undefined?'Complete G.R.E.G.’s explanation and the interpretation switch comparison before continuing.':'Try the leftmost switch and another position before continuing.');startChallenge(s,0);return {state:s,pass:true};}
 throw Error('Unknown signed-binary control.');
}
export function signedBinaryCommand(w,c){if(!galleryEnabled(w)||w.room!==(splitGallery(w)?'testbay':'sensors')||!w.machines.xorfab?.certified||!w.foundation.applications.xorfab)throw Error('Complete P10, then use the Environmental Test Bay training console.');const saved=w.foundation.dataInspector.signedBinary,current=!saved||saved.stage==='explore'&&saved.introduction===undefined?freshSignedBinary():saved,r=advanceSignedBinary(current,c);w.foundation.dataInspector.signedBinary=r.state;if(r.completed)w.foundation.curriculum.concepts['decoder.signed']=true;return r;}
export function validateSignedBinary(w){const s=w.foundation.dataInspector.signedBinary;if(w.foundation.dataInspector.signedBinaryLegacy!==undefined&&typeof w.foundation.dataInspector.signedBinaryLegacy!=='boolean')throw Error('Invalid signed-lesson compatibility marker.');if(!s)return;if(s.introduction!==undefined&&(!Number.isInteger(s.introduction)||s.introduction<0||s.introduction>7||(s.stage!=='explore'&&s.introduction!==7)||(s.stage==='explore'&&s.introduction<7&&(s.bits!==15||(s.introduction<=2&&s.mode!=='unsigned')||(s.introduction>=3&&s.introduction<7&&s.mode!=='signed')))))throw Error('Invalid signed comparison checkpoint.');if(s.challengeVersion===2){validateChallenges(s,signedTutorialComplete(w));if(!['signed','unsigned'].includes(s.mode)||(s.stage!=='explore'&&s.mode!=='signed'))throw Error('Invalid signed interpretation.');return;}if(s.version!==1||!['explore','read','build','complete'].includes(s.stage)||!Number.isInteger(s.bits)||s.bits<0||s.bits>15||!['signed','unsigned'].includes(s.mode)||!Number.isInteger(s.exploredMask)||s.exploredMask<0||s.exploredMask>15||typeof s.readCorrect!=='boolean'||typeof s.builtCorrect!=='boolean'||(s.stage!=='explore'&&(!signedExploreReady(s)||s.mode!=='signed'))||(s.stage==='read'&&s.bits!==13)||(['build','complete'].includes(s.stage)&&!s.readCorrect)||(s.stage==='complete'&&(!s.builtCorrect||s.bits!==14||!signedTutorialComplete(w))))throw Error('The signed-binary lesson record needs recovery.');}
