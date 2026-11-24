import {ARITHMETIC_PLACEMENTS,NOT4_PLACEMENT,INITIAL_CARRY_POSITION} from './arithmetic-component-art.js';
import './arithmetic-modules.js';
import {evaluate,validate} from './simulator.js';
import {rippleCircuit,rippleInputs,rippleWord,RIPPLE_SPEC} from './ripple-adder.js';
import {testLegacyAddsub} from './addsub-legacy.js';
export const legacyAddsub=c=>!c?.configuration?.subtractorVersion;
export const SUBTRACTOR_POSITIONS=ARITHMETIC_PLACEMENTS;
export function subtractorCircuit(){const c=rippleCircuit();c.configuration={subtractorVersion:1};c.layout.subtractor=true;c.nodes=c.nodes.filter(n=>n.id!=='zero');c.nodes.push({id:'one',type:'ONE',label:'CIN = 1',...INITIAL_CARRY_POSITION,width:1,fixed:true,rippleZero:true});return c;}
export function subtractorSolution(){const c=subtractorCircuit();for(let i=0;i<4;i++)c.nodes.push({id:'fa'+i,type:'FA1',...SUBTRACTOR_POSITIONS[i]});c.nodes.push({id:'invert',type:'NOT4',...NOT4_PLACEMENT});
 const wire=(from,out,to,pin)=>c.wires.push({id:'subtract-'+c.wires.length,from,out,to,in:pin});
 for(let i=0;i<4;i++){wire('A'+i,0,'fa'+i,0);wire('B'+i,0,'invert',i);wire('invert',i,'fa'+i,1);wire(i?'fa'+(i-1):'one',i?1:0,'fa'+i,2);wire('fa'+i,0,'C'+i,0);}return c;}
export function validateSubtractorShape(c){
 if(c?.configuration?.subtractorVersion!==1||Object.keys(c.configuration).length!==1)throw Error('Use the four-bit subtractor workspace.');
 const base=subtractorCircuit(),fixed=c.nodes.filter(n=>n.fixed),gates=c.nodes.filter(n=>!n.fixed);
 if(fixed.length!==13||new Set(c.nodes.map(n=>n.id)).size!==c.nodes.length||gates.filter(n=>n.type==='FA1').length>4||gates.filter(n=>n.type==='NOT4').length>1)throw Error('Use four Full Adders and one NOT4; keep all fixed register terminals.');
 for(const n of base.nodes){const p=c.nodes.find(v=>v.id===n.id);if(!p||['type','width','fixed','rippleBit','rippleZero','register','bit'].some(k=>p[k]!==n[k])||p.value!==undefined||p.faulty||p.fabricatedId||p.instanceId)throw Error('Keep the twelve independent register bits and immutable constant one.');}
 if(gates.some(n=>!['FA1','NOT4'].includes(n.type)||n.equipment||n.rippleRole||n.faulty||n.value!==undefined||n.heritageProp))throw Error('Only Full Adders and the four-channel NOT4 are available.');validate(c,{partial:true});return true;
}
export function testSubtractor(c){if(legacyAddsub(c))return testLegacyAddsub(c);const rows=[];try{
 validateSubtractorShape(c);let error=c.nodes.filter(n=>!n.fixed).length===5?null:'Place four Full Adders and one NOT4, then wire their independent terminals.';try{validate(c);}catch(e){error=e.message;}
 const vectors=[[5,3],[3,5],[7,2],[0,1],[4,4],[9,3]];for(let A=0;A<16;A++)for(let B=0;B<16;B++)if(!vectors.some(v=>v[0]===A&&v[1]===B))vectors.push([A,B]);
 for(const [A,B]of vectors){const inputs=rippleInputs(A,B),bits=(A-B+16)%16,expected=Object.fromEntries([0,1,2,3].map(i=>['C'+i,(bits>>i)&1]));let actual={},issue=error;try{actual=evaluate(c,inputs,{}, {partial:true}).outputs;}catch(e){issue=e.message;}rows.push({inputs,expected,actual,pass:!issue&&Object.keys(expected).every(k=>actual[k]===expected[k]),label:A+' − '+B+' (mod 16)',...(issue?{error:issue}:{})});}
 const pass=rows.every(r=>r.pass);return {rows,pass,error:pass?null:rows.find(r=>!r.pass)?.error||'Check B inversion, the starting one, carry chain and SUM connections.'};
 }catch(e){return {pass:false,rows,error:e.message};}}
export const SUBTRACTOR_SPEC={...RIPPLE_SPEC,circuitFactory:subtractorCircuit,id:'addsub',title:'Four-Bit Subtractor',short:'four-bit subtractor',plate:'COMPUTATION LAB / P19',gates:['FA1','NOT4'],spec:'C = A + NOT(B) + 1 (mod 16)',problem:"Invert B with NOT4, start CIN at one, and connect the four Full Adders. Signed four-bit interpretation spans −8 to +7.",expected:inputs=>{const bits=(rippleWord(inputs,'A')-rippleWord(inputs,'B')+16)%16;return Object.fromEntries([0,1,2,3].map(i=>['C'+i,(bits>>i)&1]));},explanation:"Subtraction adds the two's complement of B: invert its four bits and add one through the initial carry. C keeps the lowest four SUM bits. Signed interpretation is −8 through +7; patterns outside the unbounded mathematical result wrap modulo 16.",hints:["Subtraction works by adding the two's complement of B.",'Place the four-bit NOT module between INPUT B and the Full Adders.',"Remember that two's complement requires adding one. What should the first carry-in receive?",'Connect A to the adders, B through NOT4, constant one to the first CIN, each COUT to the next CIN and each SUM to C.'],restored:'Four-bit subtraction restored: invert B and start the carry at one.'};
export const SUBTRACTOR_INTRO=["Remember the four-bit adder we built? Turns out we can use almost the same circuit to subtract!","In the last lesson, we learned that flipping every bit and adding one gives us the two's complement.","So instead of building completely new hardware, let's invert B and feed a 1 into the first carry-in.","Then connect the four Full Adders just like before. Let's see if we can make this thing subtract!"];
export const SUBTRACTOR_COMPLETE=["Nice! You just turned our four-bit adder into a subtractor.","We didn't need completely different arithmetic hardware. We just inverted B and changed the starting carry to one!","Now here's a thought... what if we could switch between addition and subtraction without rebuilding the circuit?"];
