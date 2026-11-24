/** The P17 mechanism in local coordinates. Rotation affects hardware only, never labels. */
export const TOGGLE_COLORS=Object.freeze({
 on:'#408f52',outputOn:'#447392',off:'#1a2938',inactive:'#59616d',border:'#101924',
 actuator:'#bdc8d4',highlight:'#d7dce1',rim:'#f1ecdc',
 outputActuator:'#8898a8',outputHighlight:'#a3b0bd',outputRim:'#bdcbd5',
});
export function mechanicalToggle(value,{orientation='horizontal',output=false,inactive=false,pressure=false}={}){
 const high=value===1,c=TOGGLE_COLORS;
 const track=inactive?c.inactive:high?(output?c.outputOn:c.on):c.off;
 const mechanism=`<rect class="toggle-track" x="0" y="1" width="62" height="26" rx="13" fill="${track}" stroke="${c.border}" stroke-width="2"/><g class="switch-knob${pressure?' pressure-switch-lever':''}" data-switch-value="${high?1:0}" ${pressure?`style="transform:translateX(${high?32:0}px)"`:`transform="translate(${high?32:0} 0)"`}><circle cx="15" cy="14" r="14" fill="${output?c.outputActuator:c.actuator}" stroke="${c.border}" stroke-width="2.5"/><circle cx="14" cy="13" r="10" fill="${output?c.outputHighlight:c.highlight}" stroke="${output?c.outputRim:c.rim}"/></g>`;
 return `<g data-toggle-art="p17" data-switch-kind="${output?'output':'input'}" data-toggle-orientation="${orientation}"${orientation==='vertical'?' transform="translate(0 62) rotate(-90)"':''}>${mechanism}</g>`;
}
