export const UNSIGNED_CHALLENGES=Object.freeze([
 {stage:'read',bits:5,value:5,weights:true},
 {stage:'build',bits:11,value:11,weights:true},
 {stage:'read',bits:6,value:6,weights:false},
 {stage:'build',bits:13,value:13,weights:false},
]);
export const SIGNED_CHALLENGES=Object.freeze([
 {stage:'read',bits:13,value:-3,weights:true},
 {stage:'build',bits:10,value:-6,weights:true},
 {stage:'read',bits:14,value:-2,weights:false},
 {stage:'build',bits:11,value:-5,weights:false},
]);
export const challengeList=s=>s.mode===undefined?UNSIGNED_CHALLENGES:SIGNED_CHALLENGES;
export const currentChallenge=s=>challengeList(s)[s.challenge??(s.stage==='build'?1:0)];
// Completed legacy lessons retain their milestone. Unfinished lessons resume at their equivalent challenge.
export function challengeState(state){
 const s=structuredClone(state);
 if(s.stage==='complete'||s.challengeVersion===2)return s;
 s.challengeVersion=2;s.challenge=s.stage==='build'?1:0;
 s.exploredMask??=s.explored?15:0;
 if(s.stage==='read')s.bits=currentChallenge(s).bits;
 return s;
}
export function startChallenge(s,index){
 s.challengeVersion=2;s.challenge=index;
 const challenge=currentChallenge(s);s.stage=challenge.stage;s.bits=challenge.stage==='read'?challenge.bits:0;
 if(s.mode!==undefined)s.mode='signed';
 return s;
}
export function advanceChallenge(state,c){
 const s=challengeState(state),challenge=currentChallenge(s);
 if(c.action==='bits'){
  if(s.stage!=='build'||!Number.isInteger(c.value)||c.value<0||c.value>15)throw Error('Use the switches during a representation challenge.');
  s.bits=c.value;return {state:s};
 }
 if(c.action!==s.stage)throw Error('Complete the current binary challenge first.');
 const pass=s.stage==='read'?c.answer===challenge.value:s.bits===challenge.bits;
 if(!pass)return {state:s,pass:false,error:'Check the bit weights and try again.'};
 if(s.stage==='read')s.readCorrect=true;
 if(s.challenge===3){s.builtCorrect=true;s.stage='complete';return {state:s,pass:true,completed:true};}
 startChallenge(s,s.challenge+1);return {state:s,pass:true};
}
export function validateChallenges(s,complete){
 const list=challengeList(s);
 if(s.version!==1||typeof s.readCorrect!=='boolean'||typeof s.builtCorrect!=='boolean'||!Number.isInteger(s.exploredMask)||s.exploredMask<0||s.exploredMask>15)throw Error('Invalid binary lesson record.');
 if(s.stage==='explore'&&s.challenge!==0)throw Error('Invalid exploration checkpoint.');
 if(!Number.isInteger(s.challenge)||s.challenge<0||s.challenge>3||!Number.isInteger(s.bits)||s.bits<0||s.bits>15)throw Error('Invalid binary challenge checkpoint.');
 if(s.stage==='complete'){
  if(s.challenge!==3||!s.readCorrect||!s.builtCorrect||s.bits!==list[3].bits||!complete)throw Error('Invalid binary completion checkpoint.');
 }else if(s.stage!=='explore'){
  if(s.stage!==list[s.challenge].stage||(s.stage==='read'&&s.bits!==list[s.challenge].bits)||(s.challenge>0&&!s.readCorrect))throw Error('Invalid binary challenge progress.');
 }
}
export function challengeGuidance(s){
 if(s.stage==='complete')return 'All four challenges passed. Binary calibration complete!';
 if(s.stage==='explore')return null;
 return [
 s.mode===undefined?'The weights are 8, 4, 2, and 1. Add the weights of the bits that are ON to read the decimal number.':'The signed weights are −8, 4, 2, and 1. Add the weights of the bits that are ON to read the decimal number.',
 "Now let's do it the other way around. I'll give you a number, and you figure out which bits to turn on.",
 "You're getting the hang of this! Let's try it again without the weights marked.",
 'Build the requested number using the unmarked positions. Use Hint if you need the weights again.',
 ][s.challenge??0];
}
