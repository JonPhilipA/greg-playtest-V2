import {ports} from './simulator.js';
export function wireSignal(graph,values,wire){
 const value=values.get(wire.from)?.[wire.out],node=graph.nodes.find(n=>n.id===wire.from);let width=1;try{width=ports(node).outputs[wire.out].width;}catch{}
 if(value===undefined||value===null)return {state:'unknown',label:'? · UNKNOWN',value:null};
 return {state:value>0?'high':'low',label:width>1?'BUS '+value.toString(2).padStart(width,'0'):value?'1 · HIGH':'0 · LOW',value};
}
export function changedWireSignals(graph,previous,current){return new Set(graph.wires.filter(w=>previous?.get(w.from)?.[w.out]!==current.get(w.from)?.[w.out]).map(w=>w.id));}
/** Only actual binary input changes move a physical switch. Unknowns and bus words do not tween. */
export function changedInputSwitches(circuit,before,after){
 return circuit.nodes.filter(n=>n.type==='INPUT'&&(n.width||1)===1).flatMap(n=>{
  const from=before?.get(n.id)?.[0],to=after?.get(n.id)?.[0];return [0,1].includes(from)&&[0,1].includes(to)&&from!==to?[{id:n.id,from,to}]:[];
 });
}
