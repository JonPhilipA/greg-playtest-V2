import {manualKnowledge,manualArticle} from './manual-data.js';
import {gateSymbol} from './panel-art.js';
import {COMPONENTS} from './components.js';
import {Editor,fitCircuitViewport,escapeHTML as esc} from './editor.js';
import {isDataConsole} from './data-consoles.js';
import {dataReferenceMarkup,bindDataReferences} from './data-console-ui.js';
import {GALLERY_DATA_IDS} from './gallery-data.js';
import {galleryDataReference} from './gallery-data-ui.js';
import {serviceState} from './curriculum-profile.js';
import {DEMORGAN_IDENTITY,DEMORGAN_COUNTERPART} from './garden-service.js';
import {deMorganTables,counterpartGraphs} from './garden-ui.js';
import {GateReference,BinaryReference,gateDemoMarkup,binaryDemoMarkup,constructionReference} from './manual-demos.js';
const icons={gate:'<path d="M6 5h6a7 7 0 0 1 0 14H6ZM2 8h4M2 16h4M19 12h3"/>',drawing:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M6 8h5v4h7M11 12v5M6 17h12"/>',binary:'<text x="1" y="17" stroke="none" fill="currentColor" font-size="14">01</text>',math:'<path d="M4 7h8M8 3v8M13 17h8"/>',chip:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v1"/>'};
const icon=id=>`<svg viewBox="0 0 24 24" aria-hidden="true">${icons[id]}</svg>`;
const table=(headers,rows,label)=>`<div class="manual-table"><table aria-label="${esc(label)}"><thead><tr>${headers.map(h=>`<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(v=>`<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const quantities=graph=>Object.entries(graph.nodes.filter(n=>!n.fixed).reduce((counts,n)=>(counts[n.type]=(counts[n.type]||0)+1,counts),{})).map(([type,n])=>`${n} × ${esc(type)}`).join(' · ')||'Fixed terminals only';
const graphPreview=(title,index)=>`<figure class="manual-diagram"><figcaption>${esc(title)}</figcaption><svg class="board" data-manual-graph="${index}" role="img" aria-label="${esc(title)} read-only circuit"></svg></figure>`;
export class EngineeringManual{
 constructor(host,{getWorld,close,initial=null}={}){
  Object.assign(this,{host,getWorld,close});this.category=null;this.article=null;this.drawings=[];this.demos=[];
  host.innerHTML=`<section class="engineering-manual" role="dialog" aria-modal="true" aria-labelledby="manual-title"><header class="manual-top"><div><small>RECOVERED KNOWLEDGE / READ-ONLY REFERENCE</small><h2 id="manual-title" tabindex="-1">ENGINEERING MANUAL</h2></div><button class="manual-close" data-action="close" aria-label="Close Engineering Manual">×</button></header><div class="manual-body"><aside class="manual-navigation"><button class="manual-home-link" data-manual-home>OVERVIEW</button><nav aria-label="Manual categories"></nav><div class="manual-topic-nav"><h3>AVAILABLE ENTRIES</h3><div class="manual-topics" role="navigation" aria-label="Unlocked topics"></div></div></aside><section class="manual-viewer" aria-labelledby="manual-article-title"><header class="manual-article-header"><small></small><h3 id="manual-article-title" tabindex="-1"></h3></header><div class="manual-article-content"></div></section></div></section>`;
  this.listener=e=>{const b=e.target.closest('[data-manual-category],[data-manual-entry],[data-manual-home]');if(!b)return;e.stopPropagation();if(b.hasAttribute('data-manual-home'))this.home();else if(b.dataset.manualCategory)this.selectCategory(b.dataset.manualCategory);else this.selectArticle(b.dataset.manualEntry);};host.addEventListener('click',this.listener);
  if(initial&&manualArticle(getWorld(),initial))this.selectArticle(initial);else this.home();host.querySelector('#manual-title').focus({preventScroll:true});
 }
 navigation(){
  const model=manualKnowledge(this.getWorld());this.host.querySelector('.manual-navigation nav').innerHTML=model.categories.map(c=>`<button data-manual-category="${c.id}" aria-expanded="${this.category===c.id}" ${this.category===c.id?'aria-current="true"':''}>${icon(c.icon)}<span>${esc(c.name)}</span><small>${c.entries.length}</small></button>`).join('');
  const category=model.categories.find(c=>c.id===this.category),topics=this.host.querySelector('.manual-topics');
  topics.innerHTML=category?(category.entries.length?category.entries.map(a=>`<button data-manual-entry="${esc(a.id)}" ${a.id===this.article?'aria-current="page"':''}>${esc(a.title)}</button>`).join(''):'<p>No entries recovered yet.</p>'):'<p>Choose a category to browse your recovered references.</p>';
  this.host.querySelector('.manual-home-link').setAttribute('aria-current',this.article||this.category?'false':'page');return model;
 }
 clearDiagrams(){for(const demo of this.demos)demo.dispose();this.demos=[];for(const drawing of this.drawings){drawing.resizeObserver?.disconnect();drawing.stopDiagnosticAnimations();}this.drawings=[];}
 show(title,kicker,html){
  this.clearDiagrams();this.host.querySelector('#manual-article-title').textContent=title;this.host.querySelector('.manual-article-header small').textContent=kicker;
  const content=this.host.querySelector('.manual-article-content');content.innerHTML=html;content.scrollTop=0;return content;
 }
 home(){
  this.category=null;this.article=null;const model=this.navigation();this.show('ENGINEERING MANUAL','REFERENCE OVERVIEW',`<p class="manual-intro">Your recovered knowledge and engineering schematics.</p><div class="manual-stats"><div><strong>${model.stats.gates}</strong><span>KNOWN GATES</span></div><div><strong>${model.stats.drawings}</strong><span>ACQUIRED DRAWINGS</span></div><div><strong>${model.stats.repaired}</strong><span>SYSTEMS REPAIRED</span></div></div>${model.recent?`<section class="manual-recent"><h4>RECENTLY LEARNED</h4><button data-manual-entry="${esc(model.recent.id)}">${esc(model.recent.title)}</button></section>`:''}<p>Choose a category on the left. This reference expands as you learn functions, certify constructions and acquire drawings.</p><p class="manual-advisory">Knowledge, drawing ownership, physical components and fabrication permission are separate. Reading this manual never grants hardware or completes a repair.</p>`);
 }
 selectCategory(id){
  const category=manualKnowledge(this.getWorld()).categories.find(c=>c.id===id);if(!category)return;this.category=id;this.article=null;this.navigation();this.host.querySelector('.manual-topics').scrollTop=0;
  this.show(category.name,'REFERENCE CATEGORY',category.entries.length?`<p>${category.entries.length} recovered ${category.entries.length===1?'entry':'entries'}.</p><div class="manual-entry-grid">${category.entries.map(a=>`<button data-manual-entry="${esc(a.id)}">${esc(a.title)}</button>`).join('')}</div>`:'<p>No entries recovered in this category yet. References appear here when their existing lessons or drawings are earned.</p>');
 }
 selectArticle(id){
  const w=this.getWorld(),a=manualArticle(w,id);if(!a)return;this.article=id;this.category=a.category;this.navigation();let html='',graphs=[];
  if(a.kind==='gate'){
   html=`<div class="manual-gate-intro"><svg viewBox="-3 -3 48 40" role="img" aria-label="${esc(a.title)} symbol">${gateSymbol(a.source)}</svg><div><p class="manual-equation">${esc(a.expression)}</p><p>${esc(a.explanation)}</p></div></div>${gateDemoMarkup()}${a.context?`<section class="manual-application"><h4>ABOARD THE SHIP · ${esc(a.context.title)}</h4><p>${esc(a.contextExample)}</p><p class="manual-equation">${esc(a.context.requirement)}</p></section>`:''}`;
   const links=manualKnowledge(w).articles.filter(b=>b.category==='blueprints'&&(b.certificate?.componentId===a.source||b.blueprint?.componentId===a.source));if(links.length)html+=`<div class="manual-blueprint-links">${links.map(b=>`<button data-manual-entry="${esc(b.id)}">${esc(b.title)}</button>`).join('')}</div>`;
   if(a.learnedSources?.length)html+=`<details class="manual-related"><summary>Learned aboard the ship</summary>${a.learnedSources.map(l=>`<h4>${esc(l.title)}</h4><p>${esc(l.text)}</p><p class="manual-equation">${esc(l.requirement)}</p>${l.truth?table([...l.truth.inputs,...l.truth.outputs],l.truth.rows.map(r=>[...r.inputs,...r.outputs]),l.title+' learned truth table'):''}`).join('')}</details>`;
  }else if(a.kind==='lesson'){
   const l=a.lesson;html=`<p class="manual-equation">${esc(l.requirement)}</p><p>${esc(l.text)}</p>${a.truth?table([...a.truth.inputs,...a.truth.outputs],a.truth.rows.map(r=>[...r.inputs,...r.outputs]),l.concept+' truth table'):''}`;
   if(l.id==='twos_complement')html+='<p>Fixed-width example: +3 = 0011 → invert to 1100 → add 0001 → 1101 = −3. Four-bit signed range: −8 to +7. Discard carry beyond four bits.</p>';
   else if(isDataConsole(l.id,w.circuits[l.id]))html+=GALLERY_DATA_IDS.includes(l.id)?galleryDataReference(l.id):dataReferenceMarkup(l.id);
  }else if(a.kind==='arithmetic-reference'){html=a.html;if(a.graph){graphs=[a.graph];html+=graphPreview('Your completed four-stage carry chain',0);}}else if(a.kind==='play')html=a.html;
  else if(a.kind==='tutorial'){
   html=a.source==='binary'?'<p>Each binary position has a weight. Moving left doubles that weight. Add the weights of the active bits to read the value.</p><p>In the Garden decoder, 1101 represents 8 + 4 + 1 = 13. Decimal 9 uses 1001.</p>':'<p>The bits stay the same when their interpretation changes. In a signed four-bit register, the leftmost weight is negative.</p><p>The signed tutorial demonstrated −8 + 4 + 1 = −3 and −8 + 4 + 2 = −2. Four-bit signed values range from −8 to 7; unsigned values range from 0 to 15.</p>';
   html+=binaryDemoMarkup(a.source==='signed');
  }else if(a.kind==='completed-circuit'){graphs=[a.graph];html='<p class="manual-status">YOUR ENGAGED ARITHMETIC CIRCUIT</p>'+(a.graph.configuration?.subtractorVersion?'<p>A − B = A + NOT(B) + 1 (mod 16). Four independent NOT4 channels invert B; constant one starts the Full Adder carry chain. C has four result bits, interpreted as unsigned 0–15 or signed −8 to +7.</p>':'<p>Historical controllable ADD/SUB hardware: XOR-controlled inversion and the initial carry-in share SUB.</p>')+graphPreview(a.title,0);
  }else if(a.kind==='drawing'){
   const p=a.blueprint;html=`<p class="manual-status">ACQUIRED CONSTRUCTION DRAWING</p>${p.note?`<p>${esc(p.note)}</p>`:''}`;
   for(const sheet of a.sheets){const index=graphs.length;graphs.push(constructionReference(sheet));html+=`<h4>${esc(sheet.name)}</h4><p class="manual-equation">${esc(sheet.equation)}</p><p>Components: ${quantities({nodes:sheet.nodes})}</p>${graphPreview(sheet.name,index)}<ol>${sheet.stages.map(s=>`<li>${esc(s.name)}</li>`).join('')}</ol>`;}
   if(!a.sheets.length)html+='<p>This acquired folio records its existing written construction notes.</p>';
  }else if(a.kind==='design'){
   const c=a.certificate;graphs=[c.sourceGraph];html=`<p class="manual-status">${c.active?'ACTIVE CERTIFIED ARTIFACT':'HISTORICAL CERTIFIED SOURCE'}</p><p class="manual-equation">${esc(COMPONENTS[c.componentId].equation)}</p><p>Components: ${quantities(c.sourceGraph)}</p>${graphPreview('Your certified '+COMPONENTS[c.componentId].name+' source',0)}<p>Inputs: ${c.portMap.inputs.map(esc).join(', ')} · Outputs: ${c.portMap.outputs.map(esc).join(', ')}</p><p>${c.leafInstanceIds.length?'Installed source parts: '+c.leafInstanceIds.map(esc).join(', '):'Compatibility source: no finite hardware refund.'}</p><p>${c.active?'This is the certified construction recorded by its repair.':'The historical proof is retained; its machinery currently needs repair.'} Fabrication continues to follow the existing authorization rules.</p>`;
  }else if(a.kind==='demorgan'){
   const s=serviceState(w),first=a.source==='repair';graphs=first?[s.original.graph,s.certificate.sourceGraph]:counterpartGraphs();html=`<p class="manual-equation">${esc(first?DEMORGAN_IDENTITY:DEMORGAN_COUNTERPART)}</p><p>${first?'The Garden scrubber repair demonstrated that both circuits produce identical outputs for every input combination. The scrubber runs when neither warning is active. This is equivalent to requiring warning A to be inactive AND warning B to be inactive. Two NOT gates and one AND gate preserve the original NOR behavior.':'Inverting AND is equivalent to OR with both inputs inverted.'}</p><div class="manual-comparison">${graphs.map((g,i)=>graphPreview(first?(i?'Equivalent: NOT A, NOT B → AND':'Original design: OR → NOT'):(i?'Equivalent construction':'Inverted conjunction'),i)).join('')}</div>${table(['A','B','ORIGINAL','EQUIVALENT'],deMorganTables().map(r=>[r.A,r.B,first?r.first:r.second,first?r.firstEquivalent:r.secondEquivalent]),'De Morgan equivalent outputs')}<p>These references grant no components, installation rights or new certifications. The original damaged parts remain historical hardware.</p>`;
  }
  const content=this.show(a.title,a.kind==='play'?'HOW TO PLAY':this.category.toUpperCase()+' / RECOVERED REFERENCE',html+(a.category==='blueprints'?'<p class="manual-advisory">Reference only. Owning this knowledge does not grant loose parts or manufacturing permission.</p>':''));
  bindDataReferences(content);
  if(a.kind==='gate')this.demos.push(new GateReference(content.querySelector('.manual-gate-demo'),a.source));
  if(a.kind==='tutorial')this.demos.push(new BinaryReference(content.querySelector('.manual-binary-demo'),a.source==='signed'));
  for(const svg of content.querySelectorAll('[data-manual-graph]')){const graph=structuredClone(graphs[Number(svg.dataset.manualGraph)]);const drawing=new Editor(svg,{circuit:graph,inputs:Object.fromEntries(graph.nodes.filter(n=>n.type==='INPUT').map(n=>[n.id,0])),state:{},width:1200,height:560,workbench:true,theme:'illustrated',onChange:()=>({ok:false}),onInput:()=>{},onMessage:()=>{}});drawing.beginDiagnostic();fitCircuitViewport(drawing);svg.querySelectorAll('[tabindex]').forEach(el=>el.removeAttribute('tabindex'));svg.querySelectorAll('[role="button"]').forEach(el=>el.removeAttribute('role'));svg.querySelectorAll('[data-pin] title,[data-wire] title').forEach(el=>el.remove());this.drawings.push(drawing);}
  this.host.querySelector('#manual-article-title').focus({preventScroll:true});
 }
 dispose(){this.clearDiagrams();this.host.removeEventListener('click',this.listener);}
}
