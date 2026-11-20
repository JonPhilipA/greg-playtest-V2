import {ports} from './simulator.js';
export const BOARD_WIDTH=1200,BOARD_HEIGHT=600,LAYOUT_VERSION=1;
export const TRASH_BOUNDS={x:1040,y:516,w:144,h:68};
const dimensions=n=>({w:n.fixed?176:112,h:n.fixed?108:n.type==='MUX4'?104:84});
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
export function clampGate(n,width=BOARD_WIDTH,height=BOARD_HEIGHT){
  const {w,h}=dimensions(n);n.x=clamp(n.x,224,width-w-16);n.y=clamp(n.y,16,height-h-16);
  if(n.x+w>TRASH_BOUNDS.x-12&&n.y+h>height-Math.max(96,height*.145))n.y=height-Math.max(98,height*.145)-h;
  return n;
}
export function overlaps(a,b,gap=16){const x=dimensions(a),y=dimensions(b);return a.x<b.x+y.w+gap&&a.x+x.w+gap>b.x&&a.y<b.y+y.h+gap&&a.y+x.h+gap>b.y;}
/** Reflow legacy graphs once; subsequent opens retain the player's chosen module positions. */
export function arrangeCircuit(circuit,width=BOARD_WIDTH,height=BOARD_HEIGHT){
  const inputs=circuit.nodes.filter(n=>n.fixed&&n.type==='INPUT'),outputs=circuit.nodes.filter(n=>n.fixed&&n.type==='OUTPUT');
  for(const [group,x] of [[inputs,28],[outputs,width-204]]){
    const top=group===outputs?44:28,bottom=group===outputs?height-Math.max(216,height*.14+132):height-136;
    group.forEach((n,i)=>{n.x=x;n.y=group.length===1?(height-108)/2:top+i*(bottom-top)/(group.length-1);});
  }
  if(circuit.layout?.version===LAYOUT_VERSION&&circuit.layout.width===width&&circuit.layout.height===height){for(const n of circuit.nodes.filter(n=>!n.fixed))clampGate(n,width,height);return circuit;}
  const gates=circuit.nodes.filter(n=>!n.fixed),byId=new Map(circuit.nodes.map(n=>[n.id,n])),memo=new Map(),visiting=new Set();
  const depth=id=>{
    const n=byId.get(id);if(!n||n.fixed||n.type==='DFF')return 0;
    if(memo.has(id))return memo.get(id);if(visiting.has(id))return 0;visiting.add(id);
    const deps=circuit.wires.filter(w=>w.to===id).map(w=>depth(w.from));const d=1+Math.max(0,...deps);
    visiting.delete(id);memo.set(id,d);return d;
  };
  const combinational=gates.filter(n=>n.type!=='DFF'),maxDepth=Math.max(0,...combinational.map(n=>depth(n.id)));
  const columns=new Map();for(const n of gates){const d=n.type==='DFF'?maxDepth+1:depth(n.id);const k=Math.min(4,Math.max(0,d-1));if(!columns.has(k))columns.set(k,[]);columns.get(k).push(n);}
  const keys=[...columns.keys()].sort((a,b)=>a-b),left=272,right=width-364;
  keys.forEach((key,index)=>{
    const column=columns.get(key);column.sort((a,b)=>{
      const score=n=>{const deps=circuit.wires.filter(w=>w.to===n.id&&ports(n).inputs[w.in]?.name!=='CLK').map(w=>byId.get(w.from)).filter(Boolean);return deps.length?deps.reduce((s,d)=>s+(d.y||0),0)/deps.length:0;};
      return score(a)-score(b)||a.id.localeCompare(b.id,undefined,{numeric:true});
    });
    column.forEach((n,i)=>{const {h}=dimensions(n);n.x=keys.length===1?(left+right)/2:left+index*(right-left)/(keys.length-1);const spacing=column.length>1?Math.min(192,(height-h-64)/(column.length-1)):0;n.y=(height-h-spacing*(column.length-1))/2+i*spacing;clampGate(n,width,height);});
  });
  circuit.layout={version:LAYOUT_VERSION,width,height};return circuit;
}
export function emptyGatePosition(circuit,type,width=BOARD_WIDTH,height=BOARD_HEIGHT,center={x:width/2,y:height/2}){
  const {w,h}=dimensions({type}),origin=clampGate({type,x:center.x-w/2,y:center.y-h/2},width,height),positions=[{x:origin.x,y:origin.y}];
  for(let y=40;y<=height-h-16;y+=116)for(let x=272;x<=width-344;x+=144)positions.push({x,y});
  positions.sort((a,b)=>Math.hypot(a.x-origin.x,a.y-origin.y)-Math.hypot(b.x-origin.x,b.y-origin.y));
  return positions.find(position=>!circuit.nodes.some(n=>overlaps({type,...position},n)))||{x:origin.x,y:origin.y};
}

