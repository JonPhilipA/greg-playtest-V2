import {servicePending} from './curriculum-profile.js';
import {SFX_GAIN_BOOST,diagnosticRowNote,diagnosticSuccessNotes} from './diagnostic-music.js';
/** One gesture-started audio context, eighteen reusable industrial presets, no gameplay callbacks. */
const presets={
 S01:{name:'Hardware pickup',frequency:580,duration:.11,type:'triangle',group:'place'},
 S02:{name:'Module socket',frequency:270,duration:.12,type:'triangle',group:'place'},
 S03:{name:'Wire connect',frequency:960,duration:.09,type:'sine',group:'wire'},
 S04:{name:'Wire release',frequency:520,duration:.1,type:'triangle',group:'wire'},
 S05:{name:'Switch',frequency:350,duration:.07,type:'triangle',group:'switch'},
 S06:{name:'Diagnostic start',frequency:470,duration:.14,type:'sine'},
 S07:{name:'Test confirmation',frequency:660,duration:.28,type:'sine',gain:.18,priority:2},
 S08:{name:'Test error',frequency:195,duration:.18,type:'triangle',gain:.16,priority:2},
 S09:{name:'Clock/data pulse',frequency:780,duration:.08,type:'sine',group:'switch'},
 S10:{name:'Mechanical impact',frequency:160,duration:.24,type:'triangle',metal:true,gain:.28,priority:3},
 S11:{name:'Steam',frequency:1100,duration:.3,noise:true,gain:.23,priority:3},
 S12:{name:'Energize',frequency:180,duration:.55,type:'sine',rise:true,gain:.28,priority:3},
 S13:{name:'Unlock',frequency:740,duration:.34,type:'sine',metal:true,gain:.22,priority:3},
 S14:{name:'Drawing/relay',frequency:410,duration:.18,type:'triangle',noise:true,priority:2},
 S15:{name:'Motor/lock',frequency:75,duration:.36,type:'sawtooth',priority:2},
 S16:{name:'Hull ambience',ambient:true},S17:{name:'Damaged ambience',ambient:true},S18:{name:'Operational ambience',ambient:true},
};
export const SOUND_PRESETS=Object.freeze(Object.fromEntries(Object.entries(presets).map(([id,p])=>[id,Object.freeze({...p,...(!p.ambient&&id!=='S11'?{gain:(p.gain||.08)*SFX_GAIN_BOOST}:{})})])));
const aliases={click:'S05',door:'S15',repair:'S07',pickup:'S01',place:'S02',connect:'S03',disconnect:'S04',switch:'S05',test:'S06',pass:'S07',fail:'S08',clock:'S09',impact:'S10',steam:'S11',energize:'S12',unlock:'S13',blueprint:'S14'};
export class Audio {
 constructor(){this.ctx=null;this.muted=false;this.nodes={};this.settings={master:.7,sfx:.8,ambient:.35};this.voices=new Set();this.recent=[];this.cooldowns={};this.hidden=false;this.ducked=false;this.lastError=null;this.resumePending=null;}
 configure(settings={}){
  for(const key of ['master','sfx','ambient'])if(Number.isFinite(settings[key]))this.settings[key]=Math.max(0,Math.min(1,settings[key]));
  if(typeof settings.muted==='boolean')this.muted=settings.muted;
  this.applyGains();
 }
 applyGains(){try{if(!this.ctx)return;const t=this.ctx.currentTime;this.master.gain.setTargetAtTime(this.muted||this.hidden?0:.38*this.settings.master,t,.04);this.sfxGain.gain.setTargetAtTime(this.settings.sfx,t,.04);this.ambientGain.gain.setTargetAtTime(this.settings.ambient*(this.ducked?.4:1),t,.12);}catch{}}
 async start(muted=false,settings={}){
  this.muted=muted;this.configure(settings);
  const Context=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Context){this.lastError='Web Audio is unavailable in this browser.';return false;}
  try{
   if(this.ctx?.state==='closed'){this.cancelEffects();this.ctx=null;this.nodes={};}
   if(!this.ctx){
    const c=this.ctx=new Context();this.master=c.createGain();this.sfxGain=c.createGain();this.ambientGain=c.createGain();this.master.gain.value=0;this.master.connect(c.destination);this.ambientGain.connect(this.master);
    this.limiter=c.createDynamicsCompressor?.();if(this.limiter){for(const [key,value]of Object.entries({threshold:-1,knee:2,ratio:12,attack:.002,release:.12}))this.limiter[key].setValueAtTime(value,c.currentTime);this.sfxGain.connect(this.limiter);this.limiter.connect(this.master);}else this.sfxGain.connect(this.master);
    for(const [name,freq,type] of [['hull',47,'sine'],['fan',82,'sine'],['alarm',440,'triangle']]){
     const osc=c.createOscillator(),gain=c.createGain();osc.type=type;osc.frequency.value=freq;gain.gain.value=0;osc.connect(gain);gain.connect(this.ambientGain);osc.start();this.nodes[name]={osc,gain};
    }
    const buffer=c.createBuffer(1,Math.max(200,c.sampleRate*2),c.sampleRate),data=buffer.getChannelData(0);let seed=17;
    for(let i=0;i<data.length;i++){seed=(seed*16807)%2147483647;data[i]=(seed/2147483647-.5)*.5;}this.noiseBuffer=buffer;
    const noise=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();noise.buffer=buffer;noise.loop=true;filter.type='highpass';filter.frequency.value=950;noise.connect(filter);filter.connect(gain);gain.connect(this.ambientGain);gain.gain.value=0;noise.start();this.nodes.steam={gain,noise,filter};
   }
   if(this.ctx.state!=='running'){
    if(!this.resumePending){const context=this.ctx;let timer;
     // Invoke resume synchronously inside the trusted gesture, before awaiting anything.
     const resumed=context.resume();
     this.resumePending=Promise.race([resumed,new Promise((_,reject)=>{timer=globalThis.setTimeout(()=>reject(Error('Browser audio stayed suspended. Click Test Sound to retry.')),1200);})]).finally(()=>{globalThis.clearTimeout(timer);this.resumePending=null;});
    }
    try{await this.resumePending;}catch(error){this.lastError=error.message;return false;}
   }
   this.applyGains();const ready=this.ctx.state==='running';this.lastError=ready?null:'Audio context is '+this.ctx.state+'. Click Test Sound to retry.';return ready;
  }catch(error){this.lastError=error.message;try{this.ctx?.close?.();}catch{}this.ctx=null;this.nodes={};return false;}
 }
 status(){
  const context=this.ctx?.state||'not initialized';
  const reason=this.muted?'Sound is muted. Turn off Mute to hear the test.':this.settings.master===0?'Master volume is zero. Raise Master to hear the test.':this.settings.sfx===0?'Sound effects volume is zero. Raise Sound effects to hear the test.':this.hidden?'This page is hidden. Return to the game to hear sound.':context!=='running'?(this.lastError||'Audio is '+context+'. Click Test Sound to initialize or resume it.'):'';
  return {context,muted:this.muted,...this.settings,error:this.lastError,ready:context==='running'&&!reason,message:reason||'Audio is running. A metallic chime was sent at your selected volume.'};
 }
 async testSound(){
  await this.start(this.muted,this.settings);const status=this.status();if(!status.ready)return {ok:false,...status};
  const voice=this.effect('S13');return voice?{ok:true,...status}:{ok:false,...this.status(),message:this.lastError||'Audio could not schedule the chime. Retry Test Sound.'};
 }
 mute(value){this.muted=!!value;this.applyGains();}
 setDucked(value){if(this.ducked!==!!value){this.ducked=!!value;this.applyGains();}}
 setHidden(value){this.hidden=!!value;if(value)this.cancelEffects();this.applyGains();}
 setStartupHum(level){
  try{if(!this.ctx||this.hidden)return;const t=this.ctx.currentTime;this.nodes.hull.osc.frequency.setTargetAtTime(level===null?47:72+level*19,t,.18);this.nodes.hull.gain.gain.setTargetAtTime(level===null?0:level*.04,t,.18);}catch{}
 }
 update(w,t){
  try{if(!this.ctx||this.hidden)return;const now=this.ctx.currentTime,gardenEmergency=w.room==='life'&&servicePending(w),room=w.room==='engine'?1:.4,fan=w.room==='life'&&w.foundation?.earlyCurriculum?.version===1?w.machines.scrubber.certified&&w.machines.scrubber.output===1:w.machines.ventilation.output===1;
   this.nodes.hull.gain.gain.setTargetAtTime(.018*SFX_GAIN_BOOST,now,.2);
   this.nodes.fan.gain.gain.setTargetAtTime(fan?.045*room*SFX_GAIN_BOOST:0,now,.5);
   this.nodes.steam.gain.gain.setTargetAtTime(fan?0:.045*room,now,.4);
   this.nodes.alarm.gain.gain.setTargetAtTime(gardenEmergency?(Math.sin(t*3)>0?.036*SFX_GAIN_BOOST:0):!fan&&w.pressure>70&&Math.sin(t*5)>0?.022*room*SFX_GAIN_BOOST:0,now,.025);
   this.nodes.alarm.osc.frequency.setTargetAtTime(Math.sin(t*3)>0?440:330,now,.04);
  }catch{}
 }
 effect(kind='click',{variant=0,volume=1,diagnostic,index=0,count=1,intervalMs=180,pan=0,delayMs=0}={}){
  const id=aliases[kind]||kind,p=SOUND_PRESETS[id],c=this.ctx;
  if(!p||p.ambient||!c||this.muted||this.hidden||c.state!=='running')return false;
  const t=c.currentTime+Math.max(0,Math.min(1500,delayMs))/1000;for(const voice of [...this.voices])if(voice.end<=c.currentTime)voice.stop();
  const priority=p.priority||1,delay={wire:.08,switch:.06,place:.09}[p.group]||0;
  this.recent=this.recent.filter(n=>n>t-1);
  if(priority===1&&(this.recent.length>=10||(p.group&&t-(this.cooldowns[p.group]??-Infinity)<delay)))return false;
  if(this.voices.size>=6){const victim=[...this.voices].sort((a,b)=>a.priority-b.priority)[0];if(victim.priority>priority)return false;victim.stop();}
  const musical=id==='S07',failure=id==='S08'&&diagnostic==='failure',notes=musical?(diagnostic==='row'?[diagnosticRowNote(index,count,intervalMs)]:diagnosticSuccessNotes()):[{start:0,duration:failure?.14:p.duration,frequency:failure?98:p.frequency,gain:p.gain||.08,type:p.type}];
  const sources=[],filters=[],gains=[];let panner=null;let handle,remaining=0;
  try{
   if(c.createStereoPanner&&pan){panner=c.createStereoPanner();panner.pan.setValueAtTime(Math.max(-1,Math.min(1,pan)),t);panner.connect(this.sfxGain);filters.push(panner);}
   const level=Number.isFinite(volume)?Math.max(0,Math.min(1,volume)):1;
   for(const note of notes){
    const at=t+note.start,end=at+note.duration,gain=c.createGain();gains.push(gain);gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(Math.max(.0001,note.gain*level),at+Math.min(.008,note.duration*.18));gain.gain.exponentialRampToValueAtTime(.0001,end);gain.connect(panner||this.sfxGain);
    if(p.noise){const noise=c.createBufferSource(),filter=c.createBiquadFilter();noise.buffer=this.noiseBuffer;filter.type=id==='S14'?'bandpass':'highpass';filter.frequency.value=p.frequency;noise.connect(filter);filter.connect(gain);sources.push({node:noise,at,end});filters.push(filter);}
    if(!p.noise||id==='S14')for(const multiplier of p.metal?[1,1.47]:[1]){
     const osc=c.createOscillator();osc.type=note.type||'sine';const f=note.frequency*multiplier*(1+variant*.07);osc.frequency.setValueAtTime(f,at);
     if(!musical)osc.frequency.exponentialRampToValueAtTime(p.rise?f*2.2:id==='S13'?f*1.5:f*.62,end);
     osc.connect(gain);sources.push({node:osc,at,end});
    }
   }
   // One preset instance owns all three final notes; ending note one must not cancel the remaining notes.
   handle={id,priority,notes:notes.map(n=>({...n,gain:n.gain*level})),end:t+Math.max(...notes.map(n=>n.start+n.duration)),stop:()=>{
    if(!this.voices.has(handle))return;this.voices.delete(handle);
    for(const {node}of sources)try{node.stop?.();node.disconnect?.();}catch{}
    for(const node of [...filters,...gains])try{node.disconnect?.();}catch{}
   }};
   this.voices.add(handle);remaining=sources.length;
   for(const {node,at,end}of sources){node.onended=()=>{if(--remaining===0)handle.stop();};node.start(at);node.stop?.(end);}
   if(p.group)this.cooldowns[p.group]=t;if(priority===1)this.recent.push(t);return handle;
  }catch(error){if(handle)handle.stop();else{for(const {node}of sources)try{node.stop?.();node.disconnect?.();}catch{}for(const node of [...filters,...gains])try{node.disconnect?.();}catch{}}this.lastError=error.message;return false;}
 }
 scrubberFailure(pan=0){const handles=[this.effect('S15',{pan}),this.effect('S10',{pan,delayMs:150}),this.effect('S14',{pan,delayMs:430}),this.effect('S08',{pan,delayMs:540})].filter(Boolean);return {stop:()=>handles.forEach(h=>h.stop()),handles};}
 cancelEffects(){for(const voice of [...this.voices])voice.stop();}
}
