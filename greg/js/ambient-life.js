// Deterministic, local animation. Never changes machinery or puzzle state.
const smoothPulse=(time,center,halfWidth)=>{
  const distance=Math.abs(time-center);
  return distance>=halfWidth?0:(1+Math.cos(Math.PI*distance/halfWidth))/2;
};
export function gregLife(time,{reduced=false,phase=0}={}){
  if(reduced)return {openness:1,eyeY:0};
  const t=Math.max(0,time+phase),cycle=Math.floor(t/7.2),local=t%7.2;
  const center=3.9+Math.sin(cycle*2.17)*.55;
  const blink=Math.max(smoothPulse(local,center,.14),cycle%3===2?smoothPulse(local,center+.36,.11):0);
  return {openness:Math.max(.035,1-blink),eyeY:Math.sin(t*1.12)*.38+Math.sin(t*.43)*.16};
}
export function lampLife(time,phase=0,reduced=false){
  if(reduced)return 1;
  const t=Math.max(0,time+phase),local=t%17.3;
  // Gentle filament movement with a brief, soft dip; lamps never switch off.
  return .96+.018*Math.sin(t*3.1)+.012*Math.sin(t*11.7)-.16*smoothPulse(local,10.2,.23)-.07*smoothPulse(local,10.61,.14);
}
