/** Reference solutions for test coverage only. The game never compares against these layouts. */
import {LEVELS,createCircuit} from '/js/puzzles.js';
import {connect} from '/js/simulator.js';
export function solution(index){
  const c=createCircuit(LEVELS[index]);let count=0;
  const wire=(src,dst,pin=0,out=0)=>connect(c,{from:src,to:dst,in:pin,out});
  const gate=(type,...sources)=>{const id=`g${++count}`;c.nodes.push({id,type,x:220+(count-1)%4*155,y:45+Math.floor((count-1)/4)*95});sources.forEach((src,i)=>wire(Array.isArray(src)?src[0]:src,id,i,Array.isArray(src)?src[1]:0));return id;};
  if(index===0)wire('A','Y');
  if(index===1){wire('A','Y');wire('A','Z');}
  if(index===2)wire(gate('OR','A','B'),'Y');
  if(index===3)wire(gate('AND','A','B'),'Y');
  if(index===4)wire(gate('NOT','A'),'Y');
  if(index===5){const ab=gate('AND','A','B'),ac=gate('AND','A','C'),bc=gate('AND','B','C');wire(gate('OR',gate('OR',ab,ac),bc),'Y');}
  if(index===6){const na=gate('NAND','A','A'),nb=gate('NAND','B','B'),ab=gate('NAND','A','B');wire(na,'N');wire(gate('NAND',ab,ab),'Y');wire(gate('NAND',na,nb),'Z');}
  if(index===7){const a=gate('NOT','A'),b=gate('NOT','B');wire(gate('OR',a,b),'Y');wire(gate('AND',a,b),'Z');}
  if(index===8){wire(gate('XOR','A','B'),'S');wire(gate('AND','A','B'),'C');}
  if(index===9){const p=gate('XOR','A','B');wire(gate('XOR',p,'I'),'S');wire(gate('OR',gate('AND','A','B'),gate('AND',p,'I')),'C');}
  if(index===10){const add=gate('ADD4','A','B'),xor=gate('XOR4','A','B');wire(gate('MUX4',add,xor,'M'),'Y');}
  if(index===11){wire(gate('DFF','A','K'),'Y');wire(gate('DFF','B','K'),'Z');}
  if(index===12){const low=gate('DFF'),high=gate('DFF');wire('K',low,1);wire('K',high,1);wire(gate('NOT',low),low);wire(gate('XOR',low,high),high);wire(low,'L');wire(high,'H');}
  if(index===13){const sum=gate('XOR','A','B'),carry=gate('AND','A','B');wire(gate('DFF',gate('AND',sum,'E'),'K'),'S');wire(gate('DFF',gate('AND',carry,'E'),'K'),'C');wire(gate('AND','E','R'),'T');wire(gate('AND','E',gate('NOT','R')),'M');}
  return c;
}
