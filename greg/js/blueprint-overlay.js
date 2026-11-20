import {GUIDE_SHEETS,eligibleGuides} from './blueprints.js';
import {gateSymbol} from './panel-art.js';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/** Advisory topology matching, independent of node positions, instance IDs and validation. */
export function matchBlueprint(sheet,graph){
 const fixed={...Object.fromEntries(sheet.inputs.map((id,i)=>[id,graph.nodes.find(n=>n.id===id&&n.type==='INPUT')?.id||graph.nodes.filter(n=>n.type==='INPUT')[i]?.id])),...Object.fromEntries(sheet.outputs.map((id,i)=>[id,graph.nodes.find(n=>n.id===id&&n.type==='OUTPUT')?.id||graph.nodes.filter(n=>n.type==='OUTPUT')[i]?.id]))};
 let best={map:fixed,score:-1,connected:[]},attempts=0;
 function search(index,map,used){
  if(++attempts>4096)return;
  if(index===sheet.nodes.length){const connected=sheet.wires.map(w=>!!map[w.from]&&!!map[w.to]&&graph.wires.some(real=>real.from===map[w.from]&&real.to===map[w.to]&&real.in===w.in&&real.out===w.out)),score=connected.filter(Boolean).length*10+Object.values(map).filter(Boolean).length;if(score>best.score)best={map:{...map},score,connected};return;}
  const role=sheet.nodes[index];for(const n of [...graph.nodes.filter(n=>n.type===role.type&&!n.fixed&&!n.faulty&&!used.has(n.id)).slice(0,12),null]){map[role.id]=n?.id;if(n)used.add(n.id);search(index+1,map,used);if(n)used.delete(n.id);}delete map[role.id];
 }
 search(0,{...fixed},new Set());return {...best,complete:best.connected.length===sheet.wires.length&&best.connected.every(Boolean),stages:sheet.stages.map(s=>({...s,matched:s.roles.every(id=>!!best.map[id])&&sheet.wires.every((wire,index)=>!(s.roles.includes(wire.to)||(s.roles.includes(wire.from)&&sheet.outputs.includes(wire.to)))||best.connected[index])}))};
}
export function blueprintLayer(sheet,graph,{height=600,opacity=.28,pinPosition}={}){
 const progress=matchBlueprint(sheet,graph),fake=sheet.nodes.map(n=>({...n,y:n.y*height/600,artStyle:'illustrated'})),anchors=[...sheet.inputs,...sheet.outputs].map(id=>graph.nodes.find(n=>n.id===progress.map[id])).filter(Boolean),all=[...fake,...anchors];
 let html=`<g class="blueprint-overlay" data-blueprint="${escape(sheet.id)}" data-guide-complete="${progress.complete}" style="opacity:${opacity}" pointer-events="none" aria-hidden="true">`;
 for(const [index,w]of sheet.wires.entries()){
  const from=all.find(n=>n.id===w.from)||graph.nodes.find(n=>n.id===progress.map[w.from]),to=all.find(n=>n.id===w.to)||graph.nodes.find(n=>n.id===progress.map[w.to]);if(!from||!to)continue;
  const a=pinPosition(from,'outputs',w.out),b=pinPosition(to,'inputs',w.in),d=Math.max(45,Math.abs(b.x-a.x)*.4);html+=`<path class="guide-wire ${progress.connected[index]?'matched':''}" d="M${a.x} ${a.y}C${a.x+d} ${a.y} ${b.x-d} ${b.y} ${b.x} ${b.y}"/>`;
 }
 for(const n of fake)html+=`<g class="guide-role ${progress.map[n.id]?'matched':''}" transform="translate(${n.x} ${n.y})"><rect width="112" height="84" rx="6"/>${gateSymbol(n.type,35,9,.9)}<text x="56" y="66" text-anchor="middle">${escape(n.type)}</text></g>`;
 for(const n of anchors)html+=`<text class="guide-pin-label" x="${n.x+25}" y="${n.y-12}">${escape(n.label||n.id)}</text>`;
 html+=`<text x="290" y="${height-25}" class="guide-caption">REFERENCE · ${escape(sheet.name)} · ${progress.connected.filter(Boolean).length}/${sheet.wires.length} paths</text></g>`;
 return html;
}
export function activeBlueprint(w,id){const view=w.foundation.blueprints.preferences[id];return view?.visible&&eligibleGuides(w,id).some(g=>g.blueprintId===view.blueprintId&&g.sheetId===view.sheetId)?{sheet:GUIDE_SHEETS[view.sheetId],opacity:view.opacity}:null;}
