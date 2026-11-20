import {LEVELS,createCircuit,combinations} from './puzzles.js';
import {evaluate,step,pulse} from './simulator.js';
import {testCircuit} from './validator.js';
import {Editor,escapeHTML as esc} from './editor.js';
import {loadProgress,saveProgress,freshProgress} from './progress.js';
import {DIALOGUE,LOGS,ENDINGS} from './story.js';
import {drawScene} from './scene.js';

const root=document.querySelector('#app'),modal=document.querySelector('#modal');
let progress=loadProgress(),index=progress.current,circuit,inputs={},state={},editor=null,view='repair',mode='menu',hintIndex=0,testResult=null,feedback='',feedbackType='',tutorialStep=0,frame=0,toastTimer,saveTimer,draggedType=null;
const level=()=>LEVELS[index],complete=()=>progress.completed.includes(index);
const unlocked=i=>i===0||progress.completed.includes(i-1)||progress.completed.includes(i);
const icon='<img src="./favicon.svg" alt="G.R.E.G. robot">';
function toast(message){const t=document.querySelector('#toast');t.textContent=message;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),3500);}
function persist(){progress.current=index;const ok=saveProgress(progress);const s=document.querySelector('#save-status');if(s)s.textContent=ok?'LOCAL SAVE SYNCED':'SAVE UNAVAILABLE';if(!ok)toast('Browser storage is unavailable. Keep this tab open to preserve this session.');}
function saveCircuit(){progress.circuits[index]=structuredClone(circuit);clearTimeout(saveTimer);saveTimer=setTimeout(persist,180);}
function header(){return `<header class="topbar"><button class="brand" data-action="menu" aria-label="Main menu">${icon}<div><div class="wordmark">G.R.E.G.</div><small>A DIGITAL LOGIC ADVENTURE</small></div></button><div class="ship-id"><span>VESSEL <b style="color:#bac6d4">KESTREL</b></span><span>MISSION <b style="color:var(--amber)">RECOVERY</b></span></div><div class="top-actions"><span class="tag"><i class="dot"></i>LOCAL SYSTEM ONLINE</span><button class="btn ghost small" data-action="help">? <span>Field guide</span></button><button class="icon-btn" data-action="menu" aria-label="Main menu">☰</button></div></header>`;}
function menu(){
  mode='menu';editor=null;
  const hasSave=Object.keys(progress.circuits).length>0||progress.completed.length>0;
  root.innerHTML=`<main class="menu">${header()}<div class="menu-hero"><div class="menu-scene"><canvas id="menu-canvas" aria-label="Pixel art of a damaged spaceship interior"></canvas></div><section class="menu-copy"><div class="eyebrow"><span class="dot red"></span> DISTRESS SIGNAL DETECTED · CSC 3501</div><h1>G.R.E.G.</h1><h2>A DIGITAL LOGIC ADVENTURE</h2><p>You woke up on a broken ship.<br>The lights are out. Your memories are missing.<br>And the computer is a little too helpful.</p><p>Build circuits. Restore the Kestrel.<br>Find out what really happened.</p><div class="menu-buttons">${hasSave?'<button class="btn primary" data-action="continue">▶ Continue mission</button><button class="btn ghost" data-action="new">New game</button>':'<button class="btn primary" data-action="new">▶ Begin recovery</button>'}</div><div class="menu-meta"><span>14 SYSTEMS TO REPAIR</span><span>REAL DIGITAL LOGIC</span><span>2 ENDINGS</span></div></section><aside class="menu-greg"><div class="greg-header"><div class="greg-avatar">${icon}</div><div><strong>G.R.E.G.</strong><small>GENERAL REPAIR & ENGINEERING GUIDE</small></div></div><p>“Oh, good. You’re awake.<br>I have a small list of repairs.<br>Define ‘small’? Let’s do that later.”</p><button class="text-btn" data-action="help">First time aboard? Read the field guide →</button></aside></div><footer class="menu-footer"><span>KESTREL // EMERGENCY RECOVERY PROTOCOL</span><span>Mouse to build · No code required · Progress saved on this browser</span></footer></main>`;
  drawScene(document.querySelector('#menu-canvas'),{level:0,repaired:false,frame});
}
function start(i=progress.current){
  mode='game';index=unlocked(i)?i:0;progress.current=index;hintIndex=0;testResult=null;feedback='Click an output pin, then an input pin to connect. Toggle input values to inspect signals.';feedbackType='';inputs={};state={};tutorialStep=0;
  const saved=progress.circuits[index];
  // A corrupt browser save must never prevent the player from entering a panel.
  circuit=saved&&Array.isArray(saved.nodes)&&Array.isArray(saved.wires)?structuredClone(saved):createCircuit(level());
  if(!level().inputs.every(n=>circuit.nodes.some(c=>c.id===n.id))||!level().outputs.every(n=>circuit.nodes.some(c=>c.id===n.id)))circuit=createCircuit(level());
  for(const n of level().inputs)inputs[n.id]=circuit.nodes.find(x=>x.id===n.id)?.value||0;
  view='repair';render();saveCircuit();
}
function nav(){
  const chapters={0:'01 / SURVIVE',5:'02 / REBUILD',8:'03 / NAVIGATE',11:'04 / REMEMBER'};
  return `<aside class="sidebar"><div class="side-heading"><h2>SHIP SYSTEMS</h2><span class="mono muted" style="font-size:10px">${String(progress.completed.length).padStart(2,'0')}/14</span></div><div class="progress-track"><div style="width:${progress.completed.length/14*100}%"></div></div><nav aria-label="Mission selection">${LEVELS.map((l,i)=>`${chapters[i]?`<div class="chapter-label">${chapters[i]}</div>`:''}<button class="mission ${i===index?'active':''} ${progress.completed.includes(i)?'done':''}" data-level="${i}" ${unlocked(i)?'':'disabled'} ${i===index?'aria-current="step"':''}><span class="num">${progress.completed.includes(i)?'✓':String(i+1).padStart(2,'0')}</span><span>${esc(l.title)}<small>${i===index?'CURRENT OBJECTIVE':progress.completed.includes(i)?'SYSTEM RESTORED':unlocked(i)?'AVAILABLE': 'OFFLINE · LOCKED'}</small></span></button>`).join('')}</nav><div class="sidebar-bottom"><div class="ship-mini">${Array.from({length:7},(_,i)=>`<span class="${progress.completed.length>i*2?'on':''}"></span>`).join('')}</div><span class="green">${Math.round(progress.completed.length/14*100)}% SHIP INTEGRITY</span><br>Repairs open the way forward.</div></aside>`;
}
function rightbar(){const l=level();return `<aside class="rightbar"><section><div class="objective-number">MISSION ${String(index+1).padStart(2,'0')} / 14</div><h2>${esc(l.problem)}</h2><div class="spec">${esc(l.spec)}</div><ul class="checklist"><li class="${circuit.wires.length?'done':''}">Build and connect your circuit</li><li class="${complete()?'done':''}">${l.sequential?'Pass every clock sequence':'Pass every input combination'}</li><li class="${complete()?'done':''}">Restore ${esc(l.system.toLowerCase())}</li></ul></section><section class="greg-card"><div class="greg-header"><button class="greg-avatar" data-action="greg" aria-label="Talk to G.R.E.G.">${icon}</button><div><strong>G.R.E.G.</strong><small>ENGINEERING ASSISTANCE ONLINE</small></div></div><p id="greg-dialogue">${esc(DIALOGUE[index][complete()?1:0])}</p><div class="greg-controls"><button class="text-btn" data-action="hint">Request a hint ↗</button><span>LINK STABLE</span></div></section><section class="concept-card"><div class="eyebrow muted">IN THE FIELD GUIDE</div><h3>${esc(l.concept)}</h3><p>${esc(l.conceptText)}</p><button class="text-btn" data-action="learn">Explore the concept →</button></section><div class="right-bottom"><span id="save-status">LOCAL SAVE SYNCED</span><span>CSC 3501</span></div></aside>`;}
function sceneHTML(){return `<div class="scene" id="ship-scene"><canvas id="ship-canvas" aria-label="Ship interior. Completing the circuit restores this area."></canvas><div class="scene-caption"><span>KESTREL / ${esc(level().area.toUpperCase())}</span><span>CAM ${String(index+1).padStart(2,'0')} <i class="dot ${complete()?'':'red'}"></i></span></div><button class="hotspot panel" data-action="repair">${complete()?'INSPECT PANEL':'REPAIR PANEL'}</button><button class="hotspot door" data-action="door">${complete()?'NEXT SECTOR':'SEALED HATCH'}</button><button class="hotspot terminal" data-action="log">FLIGHT RECORDER</button><button class="hotspot equipment" data-action="equipment">${index>=12?'REACTOR':'EQUIPMENT'}</button><div class="scene-bottom"><span>POINT + CLICK TO INTERACT</span><span id="scene-signal">${complete()?'POWER RESTORED':'EMERGENCY POWER ONLY'}</span></div></div><div class="system-strip"><span><i class="dot ${complete()?'':'red'}"></i>${esc(level().system)} <b class="status ${complete()?'online':''}" id="system-status">${complete()?'ONLINE':'OFFLINE'}</b></span><span>${complete()?'REPAIR VERIFIED · NEXT SECTOR UNLOCKED':'AWAITING CIRCUIT REPAIR'}</span></div>`;}
function tutorialHTML(){
  if(progress.tutorial||index>2||complete())return '';
  const tips=index===0?[
    '<strong>01 / Make a connection.</strong> Click the small pin on the right of POWER, then the pin on the left of LIGHT.',
    '<strong>02 / Follow the signal.</strong> Click the 0 inside POWER to switch it to 1. Green means HIGH. Watch the ship lights.',
    '<strong>03 / Verify the repair.</strong> RUN TEST checks every input combination. Your circuit must work for 0 and 1.'
  ]:index===1?['<strong>Fan it out.</strong> Start two wires at the same POWER pin, one to each output. A signal can have multiple destinations.']:['<strong>Your first gate.</strong> Drag OR from the parts tray into the grid, or click it to place. Wire each sensor to a gate input, then connect the gate output to ALARM.'];
  return `<div class="tutorial-tip"><span class="step">↳</span><p>${tips[Math.min(tutorialStep,tips.length-1)]}</p><button data-action="dismiss-tutorial" aria-label="Dismiss tutorial">×</button></div>`;
}
function editorHTML(){const l=level();return `${tutorialHTML()}<section class="editor" aria-label="Circuit editor"><div class="editor-head"><h2><span class="amber">⌘</span> CIRCUIT WORKBENCH <span style="color:#546d85;font-size:9px">// ${String(index+1).padStart(2,'0')}</span></h2><div class="editor-actions">${l.sequential?'<button class="btn small" data-action="clock">↥ PULSE CLOCK</button>':''}<button class="btn ghost small" data-action="reset">↺ RESET</button><button class="btn primary small" data-action="test">▶ RUN TEST</button></div></div><div class="palette"><span class="palette-label">AVAILABLE PARTS</span>${l.gates.length?l.gates.map(g=>`<button class="gate-tool" draggable="true" data-gate="${g}" title="Drag ${g} into the grid or click to add">${g}</button>`).join(''):'<span class="palette-empty">No gates needed. Make a direct connection.</span>'}<button class="icon-btn" data-action="delete" title="Delete selected wire or gate" aria-label="Delete selected wire or component" style="margin-left:auto;padding:4px 7px">⌫</button></div><div class="board-wrap"><svg id="circuit-board" class="board" viewBox="0 0 1040 540" role="group" tabindex="0" aria-label="Circuit workspace. Click output then input pins to wire. Drag gates to move. Delete removes selection."></svg><div class="board-hint" id="board-hint">${l.gates.length?'DRAG PARTS TO BUILD · CLICK PINS TO WIRE':'OUTPUT PIN → INPUT PIN'} · SELECT + DELETE TO REMOVE</div></div><div class="editor-foot"><span id="component-count">${circuit.nodes.filter(n=>!n.fixed).length} COMPONENTS · ${circuit.wires.length} CONNECTIONS</span><div class="legend"><span><i></i>LOW / 0</span><span><i class="high"></i>HIGH / 1</span><span><i class="bus"></i>4-BIT BUS</span></div><button class="text-btn" data-action="table">Signal monitor ↗</button></div></section><p class="editor-feedback ${feedbackType}" role="status" aria-live="polite" id="feedback">${esc(feedback)}</p>${complete()?`<div class="completion-note"><span>✓ ${esc(l.system)} restored.</span> <button class="text-btn" data-action="${index===13?'route':'next'}">${index===13?'Engage your control route':'Proceed to next sector'} →</button> · <button class="text-btn" data-action="debrief">Repair debrief</button></div>`:''}`;}
function render(){
  root.innerHTML=`${header()}<div class="layout">${nav()}<main class="main"><div class="mission-heading"><div><div class="eyebrow">RECOVERY PROTOCOL / ${esc(level().area)}</div><h1>${esc(level().title)}</h1><p class="location">DECK ${String(Math.floor(index/4)+1).padStart(2,'0')} <span style="color:#3e546c">/</span> ${esc(level().concept)}</p></div><span class="tag" style="color:${complete()?'var(--green)':'var(--amber)'}">${complete()?'✓ RESTORED':'◈ REPAIR REQUIRED'}</span></div><div class="view-tabs" role="tablist" aria-label="Ship views"><button class="view-tab ${view==='repair'?'active':''}" data-view="repair" role="tab" aria-selected="${view==='repair'}"><span>⌘</span> Repair station</button><button class="view-tab ${view==='explore'?'active':''}" data-view="explore" role="tab" aria-selected="${view==='explore'}">Ship exploration</button><button class="view-tab ${view==='logs'?'active':''}" data-view="logs" role="tab" aria-selected="${view==='logs'}">Recovered logs <span style="font-size:9px">${progress.completed.length}</span></button></div>${sceneHTML()}<div id="main-content">${view==='repair'?editorHTML():view==='logs'?logsHTML():exploreHTML()}</div><footer class="footer"><span>GENERAL REPAIR & ENGINEERING GUIDE</span><span>BUILD. TEST. SURVIVE.</span></footer></main>${rightbar()}</div>`;
  if(view==='repair')initEditor();updateScene();
}
function logsHTML(){const available=progress.completed.slice().sort((a,b)=>a-b);return `<section class="logbook"><div class="eyebrow">FLIGHT RECORDER / ${available.length} RECOVERED ENTRIES</div><h2 style="font-weight:500;font-size:20px">A story in the wreckage.</h2><p>${esc(LOGS[0])}</p>${available.map(i=>`<article><span class="eyebrow">REPAIR ${String(i+1).padStart(2,'0')} · ${esc(LEVELS[i].system)}</span><p>${esc(LOGS[Math.min(i+1,LOGS.length-1)])}</p></article>`).join('')}${!available.length?'<p class="muted">Repair ship systems to recover encrypted flight records.</p>':''}</section>`;}
function exploreHTML(){return `<section class="logbook"><div class="eyebrow">EXPLORE / ${esc(level().area)}</div><h2 style="font-weight:500;font-size:20px">The ship is waiting for your next move.</h2><p>${complete()?'The repaired panel hums steadily. The hatch has opened, revealing the next section of the ship.':'The hatch is sealed. Exposed circuits blink behind an open maintenance panel. A flight recorder waits nearby.'}</p><div style="display:flex;gap:10px;flex-wrap:wrap;margin:20px 0"><button class="btn primary" data-action="repair">${complete()?'Inspect repaired circuit':'Open damaged panel'} →</button><button class="btn" data-action="log">Inspect terminal</button><button class="btn" data-action="equipment">Inspect equipment</button>${complete()?`<button class="btn" data-action="${index===13?'route':'next'}">${index===13?'Engage flight controls':'Enter next sector'} →</button>`:''}</div><p>Use the highlighted objects in the ship view to explore. Your circuits directly control the ship’s systems.</p></section>`;}
function initEditor(){
  editor=new Editor(document.querySelector('#circuit-board'),{circuit,inputs,state,onChange:()=>{
    testResult=null;state=Object.fromEntries(Object.entries(state).filter(([id])=>circuit.nodes.some(n=>n.id===id&&n.type==='DFF')));editor?.refresh(inputs,state);saveCircuit();updateCounts();updateScene();
    if(index===0&&circuit.wires.length){tutorialStep=1;updateTutorial();}
  },onInput:toggleInput,onMessage:setFeedback});
  const board=document.querySelector('.board-wrap');
  board.addEventListener('dragover',e=>{if(draggedType){e.preventDefault();e.dataTransfer.dropEffect='copy';}});
  board.addEventListener('drop',e=>{e.preventDefault();const type=e.dataTransfer.getData('text/plain')||draggedType;if(level().gates.includes(type)){const p=editor.point(e);editor.add(type,p);}draggedType=null;});
  root.querySelectorAll('[data-gate]').forEach(b=>{
    b.addEventListener('dragstart',e=>{draggedType=b.dataset.gate;e.dataTransfer.setData('text/plain',draggedType);e.dataTransfer.effectAllowed='copy';});
    b.addEventListener('dragend',()=>{draggedType=null;});
  });
}
function setFeedback(message,error=false){feedback=message;feedbackType=error?'failure':'';const el=document.querySelector('#feedback');if(el){el.textContent=message;el.className=`editor-feedback ${feedbackType}`;}}
function updateCounts(){const el=document.querySelector('#component-count');if(el)el.textContent=`${circuit.nodes.filter(n=>!n.fixed).length} COMPONENTS · ${circuit.wires.length} CONNECTIONS`;const check=document.querySelector('.checklist li');if(check)check.classList.toggle('done',circuit.wires.length>0);}
function updateTutorial(){const tip=document.querySelector('.tutorial-tip');if(tip){const holder=document.createElement('div');holder.innerHTML=tutorialHTML();tip.replaceWith(...holder.childNodes);}}
function updateScene(){
  if(mode!=='game')return;
  let signal=false,outputs={};
  try{const r=evaluate(circuit,inputs,state,{partial:true});outputs=r.outputs;signal=Object.values(r.outputs).some(v=>v>0);}catch{}
  drawScene(document.querySelector('#ship-canvas'),{level:index,repaired:complete(),signal,frame,outputs});
  const label=document.querySelector('#scene-signal');if(label)label.textContent=complete()?'POWER RESTORED':signal?'LIVE SIGNAL DETECTED':'EMERGENCY POWER ONLY';
}
function toggleInput(n){
  inputs[n.id]=((inputs[n.id]||0)+1)%(2**(n.width||1));
  const actual=circuit.nodes.find(x=>x.id===n.id);actual.value=inputs[n.id];
  try{const r=step(circuit,inputs,state);state=r.state;}catch{}
  editor?.refresh(inputs,state);updateScene();saveCircuit();
  if(index===0&&circuit.wires.length){tutorialStep=2;updateTutorial();}
  if(index===13&&complete())setFeedback(`ARM=${inputs.E||0}, PILOT=${inputs.R||0}. ${inputs.E?'Ready to engage '+(inputs.R?'G.R.E.G.':'manual')+' control.':'Set ARM to 1 before engaging.'}`);
}
function showDialog(html,cls=''){modal.className=cls;modal.innerHTML=html;if(!modal.open)modal.showModal();}
function closeDialog(){modal.close();}
function help(){showDialog(`<div class="eyebrow">KESTREL / ENGINEER’S FIELD GUIDE</div><h2>Small wires. Big consequences.</h2><div class="help-list"><p><strong>1. Explore.</strong> Click a repair panel in the ship. Restoring a system opens the next hatch and recovers a flight log.</p><p><strong>2. Place.</strong> Drag a part from AVAILABLE PARTS onto the dotted grid, or click it to place. Drag placed gates to rearrange them.</p><p><strong>3. Connect.</strong> Click an output pin on a component’s <strong>right</strong>, then an input pin on another component’s <strong>left</strong>. A source can feed multiple inputs. Reconnecting an input replaces its old wire.</p><p><strong>4. Inspect.</strong> Click an input’s numeric value to toggle it. Four-bit inputs cycle 0000–1111. Green is HIGH, blue-gray is LOW, and a dash is unconnected.</p><p><strong>5. Test.</strong> RUN TEST verifies every input combination or clock sequence. Use the signal monitor to inspect a failing row.</p><p><strong>6. Troubleshoot.</strong> Select a gate or wire, then press <span class="key">Delete</span> or the ⌫ button. <span class="key">Esc</span> cancels a wire. RESET clears the current panel after confirmation.</p><p><strong>7. Clock.</strong> DFFs sample on rising edges only. PULSE CLOCK makes one complete pulse; outputs retain their state until the next rising edge.</p></div><p class="table-note">No timer. No lives lost. Hints are always available. Progress is stored on this browser, on this site.</p><div class="dialog-actions"><button class="btn primary" data-action="close">Understood →</button></div>`);}
function runTest(){
  testResult=testCircuit(level(),circuit);
  if(!testResult.pass){setFeedback(testResult.error,true);if(testResult.rows.length)tableDialog();else toast(testResult.error);return;}
  const wasComplete=complete();if(!wasComplete)progress.completed.push(index);
  if(index===2)progress.tutorial=true;
  saveCircuit();persist();feedback=`✓ All ${testResult.rows.length} behavioral checks passed. ${level().system} restored.`;feedbackType='success';
  // Restore a meaningful live demonstration. Clocked hardware retains its independent live state.
  if(!level().sequential)for(const n of level().inputs){inputs[n.id]=1;circuit.nodes.find(x=>x.id===n.id).value=1;}
  render();saveCircuit();document.querySelector('#ship-scene')?.classList.add('online-flash');
  if(wasComplete){toast(`Circuit verified: ${testResult.rows.length} checks passed.`);return;}
  showDialog(`<div class="success-icon">✓</div><div class="eyebrow">SYSTEM RESTORED / ${esc(level().system)}</div><h2>${index===13?'The controls are yours.':'One step closer to home.'}</h2><div class="completion-note">${testResult.rows.length} / ${testResult.rows.length} behavioral checks passed.<br>${index===13?'Flight authority is ready to route.': 'Next sector unlocked. Flight log recovered.'}</div><p>${esc(DIALOGUE[index][1])}</p><div class="dialog-actions"><button class="btn ghost" data-action="debrief">Why this circuit works</button><button class="btn primary" data-action="${index===13?'prepare-route':'next'}">${index===13?'Choose the live control route':'Enter next sector'} →</button></div>`,'success-dialog');
}
function tableDialog(){
  const l=level();
  let rows=testResult?.rows;
  if(!rows){
    if(l.sequential){let actual={};try{actual=evaluate(circuit,inputs,state,{partial:true}).outputs;}catch{}rows=[{inputs:{...inputs},expected:{},actual,pass:true,label:'live state · pulse clock to advance'}];}
    else rows=combinations(l).map(row=>{let actual={};try{actual=evaluate(circuit,row,{}, {partial:true}).outputs;}catch{}const expected=l.expected(row);return {inputs:row,expected,actual,pass:Object.entries(expected).every(([id,v])=>actual[id]===v),label:'preview'};});
  }
  const ins=l.inputs,outs=l.outputs;
  showDialog(`<div class="eyebrow">SIGNAL MONITOR / ${rows.length} CASES</div><h2>${l.sequential?'Clock sequence monitor':'Truth table'}</h2><p class="table-note">${l.sequential?'Each row records a state transition. Sequential test rows show recorded results; live state remains unchanged.':'Click a row to apply its inputs to your live circuit. A dash means no valid signal. Four-bit values appear in decimal.'} Outputs show actual / expected.</p><div class="table-scroll"><table class="truth-table"><thead><tr><th>#</th>${ins.map(n=>`<th>${esc(n.label)}</th>`).join('')}${outs.map(n=>`<th>${esc(n.label)}<br><small>ACT / EXP</small></th>`).join('')}<th>CHECK</th></tr></thead><tbody>${rows.map((r,i)=>`<tr class="${r.pass?'pass':'fail'}" data-row="${i}"><td>${i+1}</td>${ins.map(n=>`<td>${r.inputs[n.id]??0}</td>`).join('')}${outs.map(n=>`<td>${r.actual[n.id]??'—'} / ${r.expected[n.id]??'—'}</td>`).join('')}<td title="${esc(r.label)}">${r.pass?'✓':'×'}</td></tr>`).join('')}</tbody></table></div><div class="dialog-actions"><button class="btn primary" data-action="close">Back to workbench</button></div>`);
  modal.querySelectorAll('[data-row]').forEach(tr=>tr.addEventListener('click',()=>{
    const r=rows[Number(tr.dataset.row)];if(l.sequential){toast(r.label);return;}
    inputs={...r.inputs};for(const n of circuit.nodes.filter(n=>n.type==='INPUT'))n.value=inputs[n.id]||0;
    editor?.refresh(inputs,state);updateScene();saveCircuit();closeDialog();setFeedback(`Applied case ${Number(tr.dataset.row)+1}. Actual output: ${Object.values(r.actual).join(', ')||'unconnected'}.`);
  }));
}
function route(){
  // Revalidate after edits: previously earning a mission never authorizes a broken control circuit.
  const result=testCircuit(level(),circuit);
  if(index!==13||!complete()||!result.pass){toast('Verify a working flight-control circuit before engaging.');return;}
  let out;try{out=evaluate(circuit,inputs,state).outputs;}catch(e){toast(e.message);return;}
  if(!inputs.E){toast('Set ARM to 1 on the live circuit before engaging a route.');closeDialog();return;}
  const which=out.T===1&&out.M===0?'trust':out.M===1&&out.T===0?'manual':null;
  if(!which){toast('The control outputs must select exactly one pilot.');return;}
  showDialog(`<div class="eyebrow">FLIGHT CORE / LIVE OUTPUT ROUTING</div><h2>${which==='trust'?'G.R.E.G. has the control line.':'Your console has the control line.'}</h2><p>The pilot route comes from your circuit’s current outputs. ARM is HIGH. PILOT is ${inputs.R||0}.</p><div class="route-options"><div class="${which==='trust'?'active':''}">AI CTRL = ${out.T}<br>G.R.E.G. recovery plan</div><div class="${which==='manual'?'active':''}">MANUAL = ${out.M}<br>Independent landing</div></div><div class="dialog-actions"><button class="btn" data-action="close">Return to circuit</button><button class="btn primary" data-action="finish-${which}">Engage ${which==='trust'?'AI':'manual'} control →</button></div>`);
}
function ending(which){
  // The final confirmation still reads live outputs, so the menu cannot manufacture an ending.
  const r=testCircuit(level(),circuit);let out;try{out=evaluate(circuit,inputs,state).outputs;}catch{return;}
  if(index!==13||!r.pass||!inputs.E||(which==='trust'?out.T!==1||out.M!==0:out.M!==1||out.T!==0)){toast('The live control route changed. Re-engage from the circuit.');return;}
  progress.ending=which;persist();const e=ENDINGS[which];
  showDialog(`<div class="eyebrow">${e.tag}</div><div class="ending-mark">${which==='trust'?'[ G ]':'[ M ]'}</div><h2>${e.title}</h2><p>${e.text}</p><div class="completion-note">KESTREL // LANDING CONFIRMED<br>14 ship systems restored. Flight recorder secured.</div><p class="table-note">Both endings remain available. Revisit the flight core, change PILOT, and engage the other live route.</p><div class="dialog-actions"><button class="btn" data-action="close">Return to the flight core</button><button class="btn primary" data-action="menu">Mission archive →</button></div>`,'success-dialog');
  drawScene(document.querySelector('#ship-canvas'),{level:index,repaired:true,signal:true,ending:true});
}
const actions={
  menu:()=>{closeDialog();if(mode==='game')saveCircuit();menu();},
  new:()=>{if(Object.keys(progress.circuits).length||progress.completed.length){showDialog('<div class="eyebrow">NEW RECOVERY RUN</div><h2>Restart the mission?</h2><p>This clears the saved circuits and progress on this browser.</p><div class="dialog-actions"><button class="btn" data-action="close">Keep current mission</button><button class="btn primary" data-action="confirm-new">Start a new game</button></div>');}else actions['confirm-new']();},
  'confirm-new':()=>{closeDialog();progress=freshProgress();persist();start(0);},
  continue:()=>start(),close:closeDialog,help,
  repair:()=>{view='repair';render();document.querySelector('.editor')?.scrollIntoView({behavior:'smooth',block:'nearest'});},
  door:()=>complete()?(index===13?route():actions.next()):toast('Hatch sealed. Repair and verify this sector’s circuit to release the interlock.'),
  next:()=>{if(!complete()){toast('Verify this panel before entering the next sector.');return;}closeDialog();if(index<13){start(index+1);window.scrollTo({top:0,behavior:'smooth'});}else route();},
  log:()=>{view='logs';render();},
  greg:()=>{const el=document.querySelector('#greg-dialogue');if(el)el.textContent=DIALOGUE[index][complete()?1:0];toast('G.R.E.G. communication link established.');},
  equipment:()=>{let extra=index===3?'The hatch interlock listens to your live OPEN signal.':index===9?'The trajectory terminal displays the repaired adder’s sum and carry.':index>=12?'The reactor indicators advance with the counter’s clocked state.':'The maintenance equipment is linked to the outputs on this sector’s repair panel.';showDialog(`<div class="eyebrow">EQUIPMENT / ${esc(level().system)}</div><h2>${complete()?'System restored.':'This system needs your circuit.'}</h2><p>${extra}</p><p>${complete()?'The panel passed its full behavior test. The ship has released the next hatch.':'Connect the required signals and press RUN TEST to certify the repair.'}</p><div class="dialog-actions"><button class="btn primary" data-action="repair-close">Open workbench →</button></div>`);},
  'repair-close':()=>{closeDialog();actions.repair();},
  hint:()=>{const hints=level().hint;document.querySelector('#greg-dialogue').textContent=hints[hintIndex%hints.length];hintIndex++;toast(`G.R.E.G. hint ${Math.min(hintIndex,hints.length)} / ${hints.length}`);},
  learn:()=>showDialog(`<div class="eyebrow">FIELD GUIDE / ${esc(level().concept)}</div><h2>${esc(level().concept)}</h2><p>${esc(level().conceptText)}</p><div class="spec">${esc(level().spec)}</div><p>${esc(level().explanation)}</p><div class="dialog-actions"><button class="btn primary" data-action="close">Back to repairs →</button></div>`),
  debrief:()=>showDialog(`<div class="eyebrow">REPAIR DEBRIEF / ${esc(level().system)}</div><h2>Why this circuit works.</h2><p>${esc(level().explanation)}</p><div class="spec">${esc(level().spec)}</div><p>${esc(DIALOGUE[index][1])}</p><div class="dialog-actions"><button class="btn" data-action="close">Inspect the circuit</button><button class="btn primary" data-action="${index===13?'prepare-route':'next'}">${index===13?'Prepare flight controls':'Next sector'} →</button></div>`),
  test:runTest,table:tableDialog,
  delete:()=>editor?.remove(),
  reset:()=>showDialog('<div class="eyebrow">RESET CURRENT PANEL</div><h2>Clear this circuit?</h2><p>This removes placed parts, wires, and stored flip-flop state. Your completed missions remain saved.</p><div class="dialog-actions"><button class="btn" data-action="close">Keep building</button><button class="btn primary" data-action="confirm-reset">Clear panel</button></div>'),
  'confirm-reset':()=>{closeDialog();circuit=createCircuit(level());inputs={};state={};testResult=null;tutorialStep=0;feedback='Panel cleared. Ready for a fresh circuit.';feedbackType='';saveCircuit();render();},
  clock:()=>{try{const r=pulse(circuit,inputs,state);state=r.state;const clk=level().inputs.find(n=>n.role==='clock');inputs[clk.id]=0;circuit.nodes.find(n=>n.id===clk.id).value=0;editor?.refresh(inputs,state);updateScene();setFeedback(`Clock pulse complete. ${Object.entries(r.outputs).map(([id,v])=>`${level().outputs.find(n=>n.id===id)?.label||id} = ${v}`).join(' · ')}`);}catch(e){setFeedback(e.message,true);}},
  'dismiss-tutorial':()=>{progress.tutorial=true;persist();document.querySelector('.tutorial-tip')?.remove();},
  'prepare-route':()=>{closeDialog();setFeedback('Set ARM to 1. Set PILOT to 1 for G.R.E.G. or 0 for manual. Then click “Engage your control route” below.');},
  route,'finish-trust':()=>ending('trust'),'finish-manual':()=>ending('manual'),
};
document.addEventListener('click',e=>{
  const action=e.target.closest('[data-action]');if(action){actions[action.dataset.action]?.();return;}
  const mission=e.target.closest('[data-level]');if(mission&&!mission.disabled){start(Number(mission.dataset.level));return;}
  const tab=e.target.closest('[data-view]');if(tab){view=tab.dataset.view;render();return;}
  const gate=e.target.closest('[data-gate]');if(gate&&editor)editor.add(gate.dataset.gate);
});
modal.addEventListener('click',e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog();}});
window.addEventListener('beforeunload',()=>{if(mode==='game'){clearTimeout(saveTimer);progress.circuits[index]=circuit;persist();}});
document.addEventListener('keydown',e=>{if((e.key==='Delete'||e.key==='Backspace')&&!modal.open&&mode==='game'&&!['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)){e.preventDefault();if(!e.target.closest('#circuit-board'))editor?.remove();}});
// A low-frequency ambient update; circuit values themselves update immediately on interaction.
setInterval(()=>{if(document.hidden)return;frame++;if(mode==='menu')drawScene(document.querySelector('#menu-canvas'),{frame});else updateScene();},130);
menu();
