/** Shared activation targeting and the editor's existing 32-unit lever travel. No state ownership. */
export function inputSwitchTarget(event,keyboard=false){return keyboard?(event.target?.dataset?.toggle?event.target:null):event.target?.closest?.('[data-toggle]');}
export function animateInputSwitch(knob,from,to,duration,animations){
 if(!duration||!knob?.animate)return;
 knob.dataset.switchFrom=String(from);knob.dataset.switchTo=String(to);knob.classList.add('switch-moving');
 const animation=knob.animate([{transform:'translateX('+from*32+'px)'},{transform:'translateX('+to*32+'px)'}],{duration,easing:'cubic-bezier(.2,.7,.3,1)'});animations.add(animation);
 animation.finished.then(()=>{animations.delete(animation);knob.classList.remove('switch-moving');},()=>{animations.delete(animation);});return animation;
}
export function stopInputSwitchAnimations(animations){for(const animation of animations||[])try{animation.cancel();}catch{}animations?.clear();}
