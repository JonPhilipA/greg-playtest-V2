import {puzzleBrief} from './puzzle-explanations.js';
import {lessonDefinition,createPractice,LESSON_STAGES} from './lesson-controller.js';
import {COMPONENTS} from './components.js';
import {knownComponentLessons,componentLesson} from './component-lessons.js';
import {componentLessonMarkup,bindComponentLesson} from './component-lesson-ui.js';
import {availableBlueprints,getBlueprint,eligibleGuides,GUIDE_SHEETS} from './blueprints.js';
import {activeBlueprint,blueprintLayer,matchBlueprint} from './blueprint-overlay.js';
import {Editor,pinPosition,escapeHTML as esc} from './editor.js';
import {createCircuit} from './puzzles.js';
import {REPAIRS} from './repairs.js';

function referencePractice(id){
 const p=createPractice(id),type={ventilation:'NOT',security:'AND',alarm:'OR'}[id];
 if(id==='sensordiff'){const graph=structuredClone(p.circuit);graph.nodes=graph.nodes.filter(n=>n.id!=='stray-inversion');graph.nodes.push({id:'comparator',type:'XOR',x:560,y:220});graph.wires=[['A','comparator',0],['B','comparator',1],['comparator','Y',0]].map(([from,to,pin],i)=>({id:'reference-'+i,from,to,out:0,in:pin}));p.edit(graph);}
 if(type){const graph=createCircuit(REPAIRS[id]);graph.nodes.push({id:'reference',type,x:440,y:100});REPAIRS[id].inputs.forEach((n,index)=>graph.wires.push({id:'in-'+index,from:n.id,out:0,to:'reference',in:index}));graph.wires.push({id:'out',from:'reference',out:0,to:REPAIRS[id].outputs[0].id,in:0});p.edit(graph);}
 return p;
}
/** Existing overlay/drawer UI. The only mutation capability is the central command facade. */
export class TeachingUI{
 constructor(capabilities){Object.assign(this,capabilities);this.hints={};}
 window(title,body,{pagination='none'}={}){const host=document.querySelector('#monitor-host');if(!host)return;host.innerHTML=`<section class="test-monitor teaching-window" data-popup-pagination="${pagination}" role="dialog" aria-label="${esc(title)}"><header><img src="./assets/sprites/greg-terminal.svg" alt="G.R.E.G."><h3>${esc(title)}</h3><button class="brass-button subtle" data-teach="close">Back to circuit</button></header>${body}</section>`;this.bind(host);host.querySelector('button')?.focus();}
 bind(root){root.onclick=e=>{const b=e.target.closest('[data-teach]');if(b){e.stopPropagation();this.action(b.dataset.teach);}};}
 command(c){const r=this.dispatch(c);if(!r.ok)this.feedback(r.error,true);return r;}
 close(){const host=document.querySelector('#monitor-host');if(host)host.innerHTML='';}
 open(id){this.id=id;const w=this.getWorld(),lesson=lessonDefinition(id),progress=w.foundation.lessonProgress[id],brief=puzzleBrief(id,w);
  this.window('G.R.E.G. · Engineering help',`<div class="lesson-stages">${LESSON_STAGES.map(s=>`<span class="${progress?.visited?.includes(s)?'visited':''} ${progress?.stage===s?'current':''}">${s}</span>`).join('')}</div><p>${esc(brief?brief.broken+' '+brief.behavior:lesson.text)}</p><p class="puzzle-objective">OBJECTIVE: ${esc(brief?.objective||lesson.requirement)}</p><div class="teaching-actions"><button class="brass-button" data-teach="learn">Learn with G.R.E.G.</button><button class="brass-button" data-teach="practice">Practice safely</button><button class="brass-button" data-teach="independent">Build on a blank panel</button><button class="brass-button subtle" data-teach="hint">Next hint</button><button class="brass-button subtle" data-teach="guides">Optional drawings</button><button class="brass-button subtle" data-teach="manual">Engineering manual</button></div><p class="teaching-note">Learn and Practice are optional. A valid independent Build → Test → Apply earns the same result.</p>`);
 }
 learn(){const r=this.command({type:'ADVANCE_LESSON',puzzleId:this.id,stage:'LEARN',path:'guided'});if(!r.ok)return;const l=lessonDefinition(this.id),sandbox=referencePractice(this.id);this.speak?.(this.id);
  this.window('Learn · '+l.concept,`<p><strong>G.R.E.G.</strong> “${esc(l.text)}”</p><p>${esc(l.requirement)}</p><p class="teaching-note">Disposable logical demonstration. Toggle the actual input switches. Nothing here spends parts or installs machinery.</p><svg class="lesson-board board" viewBox="0 0 1040 300" aria-label="Disposable learning circuit"></svg><div class="teaching-actions"><button class="brass-button" data-teach="practice">Experiment in Practice</button><button class="brass-button subtle" data-teach="real-build">Return to real Build</button></div>`,{pagination:'pages'});
  const board=document.querySelector('.lesson-board');let editor;
  editor=new Editor(board,{circuit:sandbox.circuit,inputs:sandbox.inputs,state:sandbox.state,height:300,theme:'illustrated',onChange:c=>{try{sandbox.edit(c);return {ok:true,circuit:sandbox.circuit};}catch(e){return {ok:false,error:e.message};}},onInput:n=>{sandbox.toggle(n.id);editor.refresh(sandbox.inputs,sandbox.state);try{this.audio.effect('S05');}catch{}},onMessage:()=>{}});
 }
 guides(){const w=this.getWorld(),guides=eligibleGuides(w,this.id),editor=this.getEditor();
  if(!guides.length){this.window('Optional drawings',`<p>No acquired drawing applies to this panel. You can build independently with the functional requirements.</p><div class="teaching-actions"><button class="brass-button" data-teach="real-build">Back to Build</button><button class="brass-button subtle" data-teach="manual">Review acquired drawings</button></div>`);return;}
  const guide=guides[0],view=w.foundation.blueprints.preferences[this.id]||{visible:false,opacity:.28},progress=matchBlueprint(guide,editor.circuit);this.guide=guide;
  this.window('Blueprint · '+guide.name,`<p>${esc(guide.equation)}</p><p class="teaching-note">One reference construction. Position and topology are advisory; independent equivalents still pass.</p><label class="guide-opacity">Drawing opacity <input type="range" min="8" max="65" value="${Math.round(view.opacity*100)||28}" data-guide-opacity aria-label="Blueprint opacity"></label><ol>${progress.stages.map(s=>`<li>${s.matched?'✓ ':''}${esc(s.name)}</li>`).join('')}</ol><p>${progress.connected.filter(Boolean).length} / ${guide.wires.length} guide paths connected</p><div class="teaching-actions"><button class="brass-button" data-teach="toggle-guide">${view.visible?'Hide drawing':'Show drawing'}</button><button class="brass-button subtle" data-teach="no-guide">Continue independently</button></div>`);
  const range=document.querySelector('[data-guide-opacity]');range.oninput=()=>{if(editor.blueprint){editor.blueprint={sheet:guide,opacity:Number(range.value)/100};editor.render();}};range.onchange=()=>{const current=w.foundation.blueprints.preferences[this.id];this.setGuide(current?.visible??false,Number(range.value)/100);};
 }
 setGuide(visible,opacity){const r=this.command({type:'SET_BLUEPRINT_VIEW',puzzleId:this.id,view:{blueprintId:this.guide.blueprintId,sheetId:this.guide.sheetId,visible,opacity}});if(r.ok){const e=this.getEditor();e.blueprint=activeBlueprint(this.getWorld(),this.id);e.render();}return r;}
 manual(){this.openManual?.();}
 cabinet(){const choices=availableBlueprints(this.getWorld());this.paper('Optional drawing cabinet',`<p>These are optional technical drawings. Collection never creates gates or certificates.</p>${choices.length?choices.map(p=>`<p><button class="brass-button" data-teach="acquire:${p.id}">${this.getWorld().foundation.blueprints.acquired[p.id]?'Read':'Acquire'} ${esc(p.name)}</button></p>`).join(''):'<p>No accessible drawing is stored here. Inspect another deck’s maintenance cabinet when you reach it.</p>'}`, [{label:'Engineering manual',action:'manual'},{label:'Back to room',action:'close'}],'OPTIONAL SCHEMATICS','drawings');this.bind(document.querySelector('#overlay'));}
 componentReference(id){if(!knownComponentLessons(this.getWorld()).includes(id))return;const d=componentLesson(id);this.paper(d.name,componentLessonMarkup(id,{compact:true,construction:id!=='XOR'||!!this.getWorld().foundation.components.certified.XOR}),[{label:'Engineering Manual',action:'manual'},{label:'Back to room',action:'close'}],'KNOWN GATE / INTERACTIVE REFERENCE','component-lesson');bindComponentLesson(document.querySelector('#overlay'));}
 drawing(id){const p=getBlueprint(id);if(!p||!this.getWorld().foundation.blueprints.acquired[id])return;
  this.paper(p.name,`<p>${esc(p.note||'A reference construction. Build it with actual permitted components; the drawing is never functional hardware.')}</p>${p.sheets.map(key=>`<h3>${esc(GUIDE_SHEETS[key].name)}</h3><p>${esc(GUIDE_SHEETS[key].equation)}</p><svg class="drawing-preview" viewBox="0 0 1200 600" aria-label="Nonfunctional reference drawing">${blueprintLayer(GUIDE_SHEETS[key],{nodes:[...GUIDE_SHEETS[key].inputs.map((id,i)=>({id,type:'INPUT',fixed:true,x:40,y:130+i*110})),...GUIDE_SHEETS[key].outputs.map((id,i)=>({id,type:'OUTPUT',fixed:true,x:970,y:130+i*170}))],wires:[]},{pinPosition,height:600,opacity:.8})}</svg><ol>${GUIDE_SHEETS[key].stages.map(s=>`<li>${esc(s.name)}</li>`).join('')}</ol>`).join('')}`, [{label:'Engineering manual',action:'manual'},{label:'Back to room',action:'close'}],'ACQUIRED DRAWING · NO HARDWARE','drawing');}
 design(id){const c=this.getWorld().foundation.components.certified[id];if(!c)return;this.paper('Certified '+COMPONENTS[id].name,`<p><strong>${esc(COMPONENTS[id].equation)}</strong></p><p>${c.active?'Active certified artifact':'Historical construction; its machine needs repair'}. Manufacturing remains offline.</p><p>Source modules: ${c.sourceGraph.nodes.filter(n=>!n.fixed).map(n=>esc(n.type)).join(', ')}</p><p>Inputs: ${c.portMap.inputs.map(esc).join(', ')} · Outputs: ${c.portMap.outputs.map(esc).join(', ')}</p><p>${c.leafInstanceIds.length?'The casing retains these same installed physical parts: '+c.leafInstanceIds.map(esc).join(', '):'Compatibility source: no finite hardware refund.'}</p>`,[{label:'Engineering manual',action:'manual'},{label:'Back to room',action:'close'}],'VERIFIED SOURCE · VERSION '+c.version,'component');}
 action(action){
  if(action.startsWith('component-lesson:')){this.componentReference(action.slice(17));return;}
  if(action==='demorgan'){this.demorgan?.();return;}
  if(action==='close'){this.close();return;}if(action==='learn'){this.learn();return;}if(action==='guides'){this.guides();return;}if(action==='manual'){this.manual();return;}
  if(action==='hint'){const hints=[...(puzzleBrief(this.id,this.getWorld())?.hints||[]),...REPAIRS[this.id].hints];this.feedback(hints[(this.hints[this.id]||0)%hints.length]);this.hints[this.id]=(this.hints[this.id]||0)+1;this.close();return;}
  if(action==='practice'){if(this.command({type:'ADVANCE_LESSON',puzzleId:this.id,stage:'PRACTICE',path:'guided'}).ok)this.openPractice(this.id);return;}
  if(action==='real-build'){if(!this.command({type:'ADVANCE_LESSON',puzzleId:this.id,stage:'BUILD',path:this.getWorld().foundation.lessonProgress[this.id]?.path||'guided'}).ok)return;this.close();this.openProduction(this.id);return;}
  if(action==='independent'){if(this.command({type:'ADVANCE_LESSON',puzzleId:this.id,stage:'BUILD',path:'independent'}).ok)this.blankBuild(this.id);return;}
  if(action==='toggle-guide'){const view=this.getWorld().foundation.blueprints.preferences[this.id];if(this.setGuide(!view?.visible,view?.opacity||.28).ok)this.close();return;}
  if(action==='no-guide'){if(this.setGuide(false,this.getWorld().foundation.blueprints.preferences[this.id]?.opacity||.28).ok)this.close();return;}
  if(action.startsWith('acquire:')){const id=action.slice(8),r=this.command({type:'ACQUIRE_BLUEPRINT',blueprintId:id});if(r.ok){this.drawing(id);this.present(r.events);}return;}
  if(action.startsWith('drawing:'))this.drawing(action.slice(8));
  if(action.startsWith('design:'))this.design(action.slice(7));
 }
}
