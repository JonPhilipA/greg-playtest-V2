import {REPAIRS} from './repairs.js';
import {LEGACY_REPAIRS} from './campaign.js';
import {testCircuit} from './validator.js';
import {createCircuit} from './puzzles.js';
import {connect} from './simulator.js';

/** Keep only the circuitry feeding the selected outputs; node ids retain saved DFF state. */
export function projectCircuit(circuit,definition,outputMap){
  const needed=new Set(definition.inputs.map(n=>n.id)),visit=id=>{
    if(needed.has(id)&&!circuit.nodes.some(n=>n.id===id&&n.type!=='INPUT'))return;
    if(visited.has(id))return;visited.add(id);needed.add(id);
    for(const wire of circuit.wires.filter(w=>w.to===id))visit(wire.from);
  },visited=new Set();
  for(const id of Object.keys(outputMap))visit(id);
  const fixed=new Map([...definition.inputs,...definition.outputs].map(n=>[n.id,n]));
  const nodes=circuit.nodes.filter(n=>needed.has(n.id)).map(n=>{
    const id=outputMap[n.id]||n.id,copy={...n,id};if(fixed.has(id))Object.assign(copy,fixed.get(id),{fixed:true});
    return copy;
  });
  for(const n of definition.inputs)if(!nodes.some(x=>x.id===n.id))nodes.push({...n,x:32,y:44,fixed:true,value:0});
  const wires=circuit.wires.filter(w=>needed.has(w.from)&&needed.has(w.to)).map(w=>({...w,from:outputMap[w.from]||w.from,to:outputMap[w.to]||w.to}));
  return {nodes,wires};
}
function authorityFallback(){
  const c=createCircuit(REPAIRS.override);
  for(const [id,type,x] of [['ai','AND',300],['not','NOT',300],['manual','AND',500]])c.nodes.push({id,type,x,y:id==='not'?190:60});
  for(const [from,to,pin] of [['E','ai',0],['R','ai',1],['R','not',0],['E','manual',0],['not','manual',1],['ai','T',0],['manual','M',0]])connect(c,{from,to,out:0,in:pin});
  return c;
}
export function migrateLegacySave(p){
  if(p.campaignRevision>=4)return p;
  p.circuits||={};p.machines||={};p.machineStates||={};
  const fabricator=p.circuits.fabricator,legacyOverride=p.circuits.override;
  const validFabricator=!!(fabricator&&p.machines.fabricator?.certified&&testCircuit(LEGACY_REPAIRS.fabricator,fabricator).pass);
  if(validFabricator){
    for(const [id,out] of [['nandnot','N'],['nandand','Y'],['nandor','Z']]){
      const c=projectCircuit(fabricator,REPAIRS[id],{[out]:'Y'});
      p.circuits[id]=c;p.machines[id]={certified:testCircuit(REPAIRS[id],c).pass,status:'repaired'};
    }
    p.nandEvent={triggered:true,failed:true,elapsed:3,explained:true};
  }
  if(legacyOverride?.nodes?.filter(n=>n.type==='OUTPUT').length>2){
    const valid=!!(p.machines.override?.certified&&testCircuit(LEGACY_REPAIRS.override,legacyOverride).pass);
    const memory=projectCircuit(legacyOverride,REPAIRS.flightmemory,{S:'S',C:'C'});
    let authority=projectCircuit(legacyOverride,REPAIRS.override,{T:'T',M:'M'});
    if(valid&&!testCircuit(REPAIRS.override,authority).pass)authority=authorityFallback();
    p.circuits.flightmemory=memory;p.circuits.override=authority;
    p.machines.flightmemory={certified:valid&&testCircuit(REPAIRS.flightmemory,memory).pass};
    p.machines.override={certified:valid&&testCircuit(REPAIRS.override,authority).pass};
    p.machineStates.flightmemory=p.machineStates.override||{};p.machineStates.override={};
  }
  p.campaignRevision=4;return p;
}
