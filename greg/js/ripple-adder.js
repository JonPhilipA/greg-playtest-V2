import {ARITHMETIC_PLACEMENTS,INITIAL_CARRY_POSITION} from './arithmetic-component-art.js';
import './arithmetic-modules.js';
import {evaluate,validate} from './simulator.js';
import {testLegacyRipple} from './ripple-legacy.js';
export const RIPPLE_ID='ripple_adder';
export const legacyRipple=c=>Number.isInteger(c?.configuration?.rippleStage);
export const RIPPLE_POSITIONS=ARITHMETIC_PLACEMENTS;
const terminal=(id,type,x,y,register,bit)=>({id,type,label:id,x,y,width:1,fixed:true,rippleBit:true,register,bit});
export function rippleCircuit(){
 const nodes=[];
 for(const [register,type,x,top]of [['A','INPUT',36,78],['B','INPUT',36,350],['C','OUTPUT',1000,200]])for(let bit=0;bit<4;bit++)nodes.push(terminal(register+bit,type,x,top+44*bit,register,bit));
 nodes.push({id:'zero',type:'ZERO',label:'CIN = 0',...INITIAL_CARRY_POSITION,width:1,fixed:true,rippleZero:true});
 return {configuration:{rippleVersion:2},nodes,wires:[],layout:{ripple:true,width:1200,height:600}};
}
export function rippleSolution(){
 const c=rippleCircuit();for(let i=0;i<4;i++)c.nodes.push({id:'fa'+i,type:'FA1',...RIPPLE_POSITIONS[i]});
 const wire=(from,out,to,pin)=>c.wires.push({id:'ripple-'+c.wires.length,from,out,to,in:pin});
 for(let i=0;i<4;i++){wire('A'+i,0,'fa'+i,0);wire('B'+i,0,'fa'+i,1);wire(i?'fa'+(i-1):'zero',i?1:0,'fa'+i,2);wire('fa'+i,0,'C'+i,0);}return c;
}
export const rippleInputs=(A,B)=>Object.fromEntries(['A','B'].flatMap(r=>Array.from({length:4},(_,i)=>[r+i,((r==='A'?A:B)>>i)&1])));
export function rippleWord(values,register){const bits=Array.from({length:4},(_,i)=>values[register+i]);return bits.some(v=>v!==0&&v!==1)?null:bits.reduce((n,v,i)=>n|(v<<i),0);}
export function validateRippleShape(c){
 if(c?.configuration?.rippleVersion!==2||Object.keys(c.configuration).length!==1)throw Error('Invalid four-bit construction workspace.');
 const base=rippleCircuit(),fixed=c.nodes.filter(n=>n.fixed),gates=c.nodes.filter(n=>!n.fixed);
 if(fixed.length!==base.nodes.length||new Set(c.nodes.map(n=>n.id)).size!==c.nodes.length||gates.length>4)throw Error('Keep the fixed registers and use at most four Full Adders.');
 for(const n of base.nodes){const actual=c.nodes.find(q=>q.id===n.id);if(!actual||['type','width','fixed','rippleBit','rippleZero','register','bit'].some(k=>actual[k]!==n[k])||actual.value!==undefined||actual.faulty||actual.fabricatedId||actual.instanceId)throw Error('Keep the four independent bits in each register and the fixed zero source.');}
 if(gates.some(n=>n.type!=='FA1'||n.equipment||n.rippleRole||n.faulty||n.value!==undefined||n.heritageProp))throw Error('Place individual movable Full Adders from the toolbox.');
 validate(c,{partial:true});return 4;
}
export function testRipple(c){
 if(legacyRipple(c))return testLegacyRipple(c);
 const rows=[];try{
  validateRippleShape(c);let structure=c.nodes.filter(n=>!n.fixed).length===4?null:'Place all four Full Adders and connect their terminals.';
  try{validate(c);}catch(e){structure=e.message;}
  const vectors=[[1,2],[3,1],[5,3],[15,1],[10,5]];for(let A=0;A<16;A++)for(let B=0;B<16;B++)if(!vectors.some(v=>v[0]===A&&v[1]===B))vectors.push([A,B]);
  for(const [A,B]of vectors){const inputs=rippleInputs(A,B),sum=(A+B)&15,expected=Object.fromEntries(Array.from({length:4},(_,i)=>['C'+i,(sum>>i)&1]));let actual={},error=structure;
   try{actual=evaluate(c,inputs,{}, {partial:true}).outputs;}catch(e){error=e.message;}
   rows.push({inputs,expected,actual,pass:!error&&Object.keys(expected).every(id=>actual[id]===expected[id]),label:'Unsigned '+A+' + '+B,...(error?{error}:{})});
  }
  const pass=rows.every(r=>r.pass);return {pass,rows,error:pass?null:rows.find(r=>!r.pass)?.error||'Check each input bit, SUM lead and carry connection.'};
 }catch(e){return {pass:false,rows,error:e.message};}
}
const inputs=['A','B'].flatMap(r=>Array.from({length:4},(_,i)=>({id:r+i,type:'INPUT',label:r+i,width:1})));
export const RIPPLE_SPEC={id:RIPPLE_ID,room:'computation',title:'Four-Bit Ripple-Carry Adder',short:'ripple-carry adder',plate:'COMPUTATION LAB / P17',inputs,outputs:Array.from({length:4},(_,i)=>({id:'C'+i,type:'OUTPUT',label:'C'+i,width:1})),gates:['FA1'],source:rippleInputs(0,0),expected:bits=>{const sum=(rippleWord(bits,'A')+rippleWord(bits,'B'))&15;return Object.fromEntries(Array.from({length:4},(_,i)=>['C'+i,(sum>>i)&1]));},spec:'C = A + B (mod 16) · CIN = 0',problem:'Place four Full Adders. Connect the individual A/B bits, each SUM and the carry chain.',hints:['Each Full Adder handles one bit position. Start with the least significant bit.','Place four Full Adders in the central workspace.','Connect A0/B0 to bit 0, A1/B1 to bit 1, and so on.','Connect fixed zero to the first CIN, each COUT to the next CIN, and each SUM to its C bit.'],explanation:'Four individual Full Adders propagate carry from bit 0 toward bit 3. C0–C3 are the four-bit result. Any fifth bit does not fit: unsigned overflow wraps the result modulo 16. ADD4C packages the same chain with an external carry-in.',restored:'Four-bit addition restored. The four Full Adders can now be packaged as ADD4C.'};
export const RIPPLE_INTRO=["You've built a Full Adder! But that only handles one bit at a time.","What if we want to add two entire binary numbers? We can connect several Full Adders together.","Each Full Adder has two inputs, a carry-in, a sum output, and a carry-out.","The trick is connecting each carry-out to the next Full Adder's carry-in.","Start with bit 0, then work toward bit 3. Connect all four adders and see if you can make the numbers add up!"];
export const RIPPLE_OVERFLOW=["Wait a second! Fifteen plus one is sixteen, but our four-bit output shows zero.","That's because sixteen needs five binary bits. Our output only has room for four!","The extra bit doesn't fit, so the four-bit result wraps around. That's unsigned overflow."];
export const ADD4C_INTRO=["Perfect! You just built a four-bit ripple-carry adder.","Those four Full Adders work together to add two entire binary numbers.","Instead of rebuilding that circuit every time, we can package the whole thing into one component.","That's what ADD4C is: a four-bit adder with a carry-in."];
