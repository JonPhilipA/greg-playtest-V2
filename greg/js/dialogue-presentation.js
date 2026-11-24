import {RIPPLE_INTRO} from './ripple-adder.js';
import {puzzleBrief,puzzleIntroKey} from './puzzle-explanations.js';

// Presentation policy only. The existing currentLine/lineAfter queue owns conversations.
const important=new Set(['awake','core-awake','corridor','clue','evasive','complete','nand-memory','nand-discovery','nand-briefing','workshop-fabrication','gallery-xor-intro','gallery-build-xor','gallery-chapter-complete','signed-binary-intro','scrubber-fault-short','scrubber-spares-short']);
export const importantDialogue=id=>important.has(id)||/^(story-|problem-|intro-|record-|ending-)/.test(id);
export function puzzleIntroduction(id,w,{practice=false}={}){
 if(['addsub','float_nav','pressure_width'].includes(id))return null; // The nearby workstation conversation returns to exploration.
 if(id==='adc_precision'&&w.foundation?.curriculum?.arithmeticVersion>=2)return null;
 const key=puzzleIntroKey(id,w),brief=puzzleBrief(id,w),service=id==='scrubber'&&w.foundation?.services?.['service.scrubber.demorgan']?.triggered;
 const completed=service?w.foundation.services['service.scrubber.demorgan'].applied:w.machines[id]?.certified||w.foundation?.curriculum?.completed?.[id];
 if(service||practice||!brief||completed||w.dialogueSeen.includes(key))return null;
 const messages=id==='ripple_adder'?RIPPLE_INTRO:id==='alarm'?[
  "The Garden has two atmospheric hazard sensors. Unfortunately, the alarm isn't responding correctly.",
  'The alarm needs to activate whenever either sensor detects danger. If neither sensor detects danger, it should stay off.'
 ]:['sensordiff','xorfab'].includes(id)?[brief.broken,brief.intro]:[brief.broken,brief.behavior];
 return {key,messages};
}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/** The opening and later conversations share the same portrait/text component. */
export function conversationMarkup(speaker,text){return '<div class="opening-intro-speaker">'+(speaker==='G.R.E.G.'?'<img src="./assets/sprites/greg-terminal.svg" alt="G.R.E.G.">':'<span class="conversation-speaker-badge" aria-hidden="true">'+esc(speaker)+'</span>')+'<p>'+esc(text)+'</p></div>';}
