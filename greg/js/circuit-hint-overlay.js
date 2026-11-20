import {arrangeCircuit} from './circuit-layout.js';
import {matchBlueprint} from './blueprint-overlay.js';
import {gateSymbol} from './panel-art.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/** Same topology matcher, dimensions, pins and curves as the interactive editor. */
export function circuitHintLayer(guide,graph,{level=0,visible=true,width=1200,height=600,pinPosition,size,curve}={}){
 const matchedWireIds=new Set();if(!guide||!visible||level<2)return {markup:'',matchedWireIds};
 if(guide.puzzleId==='ripple_adder'){
  let markup='<g class="circuit-hint-overlay" pointer-events="none" aria-hidden="true">';
  for(let i=1;i<graph.configuration.rippleStage;i++){const src=graph.nodes.find(n=>n.id==='fa'+(i-1)),dst=graph.nodes.find(n=>n.id==='fa'+i),a=pinPosition(src,'outputs',1),b=pinPosition(dst,'inputs',2),wire=graph.wires.find(w=>w.from===src.id&&w.out===1&&w.to===dst.id&&w.in===2);
   if(wire)matchedWireIds.add(wire.id);for(const p of [a,b])markup+='<circle class="hint-terminal" cx="'+p.x+'" cy="'+p.y+'" r="13"/>';
   if(level>=4&&!wire)markup+='<path class="hint-ghost-wire" d="'+curve(a,b)+'"/>';
  }return {markup:markup+'</g>',matchedWireIds};
 }
 const progress=matchBlueprint(guide,graph),fixed=graph.nodes.filter(n=>n.fixed),layout={nodes:[...structuredClone(fixed),...structuredClone(guide.nodes)],wires:structuredClone(guide.wires)};
 arrangeCircuit(layout,width,height);
 const roles=guide.nodes.map(role=>{const actual=graph.nodes.find(n=>n.id===progress.map[role.id]);return {...(actual||layout.nodes.find(n=>n.id===role.id)),id:role.id,artStyle:'illustrated',matched:!!actual};});
 const node=id=>roles.find(n=>n.id===id)||graph.nodes.find(n=>n.id===progress.map[id]);
 let markup='<g class="circuit-hint-overlay" data-hint-level="'+level+'" pointer-events="none" aria-hidden="true">';
 if(level>=4)for(const [i,wire]of guide.wires.entries()){
  const from=node(wire.from),to=node(wire.to);if(!from||!to)continue;const a=pinPosition(from,'outputs',wire.out),b=pinPosition(to,'inputs',wire.in);
  if(progress.connected[i]){const actual=graph.wires.find(real=>real.from===progress.map[wire.from]&&real.to===progress.map[wire.to]&&real.in===wire.in&&real.out===wire.out);if(actual)matchedWireIds.add(actual.id);}
  else markup+='<path class="hint-ghost-wire" d="'+curve(a,b)+'"/>';
  for(const p of [a,b])markup+='<circle class="hint-terminal" cx="'+p.x+'" cy="'+p.y+'" r="9"/>';
 }
 for(const n of roles){const {w,h}=size(n);markup+='<g class="hint-placement '+(n.matched?'hint-existing':'')+'" data-hint-role="'+esc(n.id)+'" transform="translate('+n.x+' '+n.y+')"><rect class="hint-box" width="'+w+'" height="'+h+'" rx="5"/><path class="hint-corners" d="M0 12V0h12M'+(w-12)+' 0h12v12M'+w+' '+(h-12)+'v12h-12M12 '+h+'H0v-12"/>';
  if(level>=3&&!n.matched)markup+=gateSymbol(n.type,35,9,.9)+'<text class="hint-gate-label" x="'+w/2+'" y="'+(h-12)+'" text-anchor="middle">'+esc(n.type)+'</text>';
  markup+='</g>';
 }
 return {markup:markup+'</g>',matchedWireIds};
}
