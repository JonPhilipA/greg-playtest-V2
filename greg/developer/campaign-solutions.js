import {solution} from './solutions.js';
import {REPAIRS} from '../js/repairs.js';
import {createCircuit} from '../js/puzzles.js';
import {connect} from '../js/simulator.js';
const mapping={alarm:2,hull:5,firewall:7,navbits:8,trajectory:9,memory:11,reactor:12,alu:10};
export function campaignSolution(id){
  if(id in mapping)return solution(mapping[id]);
  const c=createCircuit(REPAIRS[id]);let count=0;
  const wire=(from,to,pin=0)=>connect(c,{from,to,out:0,in:pin});
  const gate=(type,...sources)=>{const name='g'+(++count);c.nodes.push({id:name,type,x:260+(count-1)%3*160,y:24+Math.floor((count-1)/3)*110});sources.forEach((from,i)=>wire(from,name,i));return name;};
  if(id==='nandnot')wire(gate('NAND','A','A'),'Y');
  else if(id==='nandand'){const n=gate('NAND','A','B');wire(gate('NAND',n,n),'Y');}
  else if(id==='nandor')wire(gate('NAND',gate('NAND','A','A'),gate('NAND','B','B')),'Y');
  else if(id==='flightmemory'){
    const sum=gate('XOR','A','B'),carry=gate('AND','A','B');
    wire(gate('DFF',gate('AND',sum,'E'),'K'),'S');wire(gate('DFF',gate('AND',carry,'E'),'K'),'C');
  }else if(id==='override'){wire(gate('AND','E','R'),'T');wire(gate('AND','E',gate('NOT','R')),'M');}
  else{const type=id==='ventilation'?'NOT':id==='security'?'AND':'NOR';wire(gate(type,...(type==='NOT'?['A']:['A','B'])),'Y');}
  return c;
}
