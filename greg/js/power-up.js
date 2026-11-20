// A disposable timeline; authoritative power is already committed ON.
const clamp=x=>Math.max(0,Math.min(1,x));
export const POWER_DURATION=7.2;
export function powerUpView(seconds,{reduced=false}={}){
 const t=reduced?seconds*POWER_DURATION/2.8:seconds,pulse=(start,end,value)=>t>=start&&t<end?value:0;
 const lamps=reduced?[clamp(t/3),clamp((t-1)/3),clamp((t-2)/4)*.35]:[t<3.1?pulse(.25,.65,.5)+pulse(1.2,1.65,.32):clamp((t-3.1)/.8),t<4.5?pulse(1.8,2.2,.45)+pulse(3.5,3.9,.6)+pulse(4.2,4.5,.5):clamp((t-4.5)/.9),clamp((t-4.8)/1.2)*.35];
 return {elapsed:t,stage:t<.9?0:t<3.1?1:t<5.2?2:t<6.7?3:4,ambient:reduced?.02+clamp(t/7.2)*.98:t<3.1?.018+t*.012:.06+clamp((t-3.1)/4.1)*.94,lamps,drone:clamp((t-5.2)/1.25),monitor:clamp((t-4.7)/.6),spark:!reduced&&t>=2.55&&t<2.78,motor:!reduced&&t>=1.8&&t<2.7?Math.sin((t-1.8)*3)*.22:0,hum:.18+clamp(t/7.2)*.34+(reduced?0:Math.sin(t*2.1)*.035)};
}
export class PowerUpPresentation{
 constructor({sound=()=>{},hum=()=>{},finish=()=>{},reduced=()=>false}={}){Object.assign(this,{sound,hum,finish,reduced});this.active=false;this.view=null;}
 start(){if(this.active)return;this.active=true;this.elapsed=0;this.nextCue=0;this.isReduced=this.reduced();this.tick(0);}
 tick(dt){if(!this.active)return;this.elapsed+=Math.max(0,dt);this.view=powerUpView(this.elapsed,{reduced:this.isReduced});const cues=this.isReduced?[[0,'S10',.55],[2,'S14',.25],[5.2,'S12',.38]]:[[0,'S10',.6],[.9,'S14',.35],[1.8,'S15',.3],[2.55,'S03',.22],[3.5,'S05',.32],[4.5,'S14',.3],[5.2,'S12',.4]];while(this.nextCue<cues.length&&this.view.elapsed>=cues[this.nextCue][0]){const [,id,volume]=cues[this.nextCue++];this.sound(id,{volume});}this.hum(this.view.hum);if(this.elapsed>=(this.isReduced?2.8:POWER_DURATION))this.stop();}
 stop(){if(!this.active)return;this.active=false;this.view=null;this.hum(null);this.finish();}
}
