// Optional opt-in voyage state. Missing state means an already active legacy core.
export const CORE_SWITCH_ID='greg-emergency-core-switch';
export const CORE_SWITCH=Object.freeze({id:CORE_SWITCH_ID,label:'G.R.E.G. — EMERGENCY CORE POWER',x:62,y:111,w:42,h:66,walk:94});
export const hasOpening=w=>w?.foundation?.opening?.version===1;
export const corePowered=w=>!hasOpening(w)||w.foundation.opening.coreOn;
export const briefingPending=w=>hasOpening(w)&&w.foundation.opening.presentationVersion===2&&corePowered(w)&&!w.foundation.opening.briefingSeen;
export function initializeOpening(w,{active=false}={}){
 w.foundation.opening={version:1,coreOn:active,crashSeen:active,presentationVersion:2,briefingSeen:active,introIndex:active?4:0};w.positions.engine=94;return w;
}
export function restoreOpening(saved,w){
 if(saved===undefined)return;
 if(saved?.version!==1||typeof saved.coreOn!=='boolean'||typeof saved.crashSeen!=='boolean'||(!saved.coreOn&&w.room!=='engine')){
  w.loadIssue='The emergency-core checkpoint is invalid. The original notebook is protected.';w.saveProtection={blocked:true,message:w.loadIssue};return;
 }
 if(saved.introIndex!==undefined&&(!Number.isInteger(saved.introIndex)||saved.introIndex<0||saved.introIndex>4)){w.loadIssue='Invalid opening dialogue position.';w.saveProtection={blocked:true};return;}
 if(saved.presentationVersion!==undefined&&(![1,2].includes(saved.presentationVersion)||typeof saved.briefingSeen!=='boolean')){w.loadIssue='The opening presentation checkpoint is invalid.';w.saveProtection={blocked:true,message:w.loadIssue};return;}
 // Before this presentation package, active notebooks had no briefing obligation.
 w.foundation.opening=saved.presentationVersion===2?{version:1,coreOn:saved.coreOn,crashSeen:saved.crashSeen,presentationVersion:2,briefingSeen:saved.briefingSeen||w.machines.ventilation.certified,introIndex:saved.briefingSeen||w.machines.ventilation.certified?4:saved.introIndex||0}:{version:1,coreOn:true,crashSeen:true,presentationVersion:1,briefingSeen:true};
}
