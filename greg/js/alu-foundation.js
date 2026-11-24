import './arithmetic-modules.js';
import {evaluate,validate} from './simulator.js';
import {rippleInputs,rippleWord,RIPPLE_SPEC} from './ripple-adder.js';
export const ALU_ID='float_nav'; // Stable P20 save/reward identity; display numbers are not save keys.
export const aluInputs=(A=5,B=3,SUB=0)=>({...rippleInputs(A,B),SUB});
export const aluSize=n=>n.panelBus?{w:0,h:0}:n.aluBit?{w:150,h:34}:n.aluModule?({ADD4C:{w:224,h:190},XOR4:{w:208,h:190},FAN4:{w:144,h:140}}[n.type]):null;
export function aluPin(n,side,index){
 if(n.panelBus)return {x:n.x,y:n.y};
 if(n.aluBit)return {x:n.x+(side==='outputs'?150:0),y:n.y+19};
 if(!n.aluModule)return null;const {w}=aluSize(n);
 const y=n.type==='ADD4C'?(side==='outputs'?70:[48,96,154][index]):n.type==='XOR4'?(side==='outputs'?94:[48,144][index]):70;
 return {x:n.x+(side==='outputs'?w:0),y:n.y+y};
}
export const aluPortVisible=(n,side,index)=>(!n.aluBit||n.id==='SUB')&&(!n.panelBus||(n.panelBus==='C'?side==='inputs':side==='outputs'))&&!(n.aluModule&&n.type==='ADD4C'&&side==='outputs'&&index===1);
export function aluCircuit(){
 const nodes=[],wires=[];
 for(const [register,type,top]of [['A','INPUT',24],['B','INPUT',330],['C','OUTPUT',150]]){
  for(let bit=0;bit<4;bit++)nodes.push({id:register+bit,type,label:register+bit,x:register==='C'?1000:36,y:top+48+38*bit,width:1,fixed:true,rippleBit:true,aluBit:true,register,bit});
  nodes.push({id:register+'bus',type:register==='C'?'BITS4':'SUM4',label:register+' · 4-BIT BUS',x:register==='C'?992:212,y:top+130,fixed:true,panelBus:register});
  for(let i=0;i<4;i++)wires.push({id:'panel-'+register+i,from:register==='C'?'Cbus':register+i,out:register==='C'?i:0,to:register==='C'?register+i:register+'bus',in:register==='C'?0:i,panelInternal:true});
 }
 nodes.push({id:'SUB',type:'INPUT',label:'SUB · OPERATION CONTROL',x:250,y:580,width:1,fixed:true,rippleBit:true,aluBit:true},
  {id:'zero',type:'ZERO',label:'CONSTANT 0',x:575,y:580,width:1,fixed:true,rippleZero:true},
  {id:'adder',type:'ADD4C',label:'PACKAGED RIPPLE ADDER — ADD4C',x:730,y:180,equipment:true,rippleRole:true,aluModule:true});
 for(const [from,out,to,pin]of [['Abus',0,'adder',0],['Bbus',0,'adder',1],['zero',0,'adder',2],['adder',0,'Cbus',0]])wires.push({id:'initial-'+wires.length,from,out,to,in:pin});
 return {configuration:{aluFoundationVersion:1},nodes,wires,layout:{ripple:true,aluFoundation:true,width:1200,height:640}};
}
export function aluSolution(){const c=aluCircuit();c.nodes.push({id:'conditional',type:'XOR4',x:470,y:315,aluModule:true},{id:'control',type:'FAN4',x:290,y:420,aluModule:true});c.wires=c.wires.filter(w=>!['Bbus','zero'].includes(w.from));
 for(const [from,out,to,pin]of [['Bbus',0,'conditional',0],['SUB',0,'control',0],['control',0,'conditional',1],['conditional',0,'adder',1],['SUB',0,'adder',2]])c.wires.push({id:'upgrade-'+c.wires.length,from,out,to,in:pin});return c;}
/** Panel internals and the installed adder are equipment, not free fabricatable gates. */
export function validateAluShape(c){
 if(c?.configuration?.aluFoundationVersion!==1||Object.keys(c.configuration).length!==1)throw Error('Use the P20 arithmetic upgrade workspace.');
 const base=aluCircuit(),ids=new Set(base.nodes.map(n=>n.id)),player=c.nodes.filter(n=>!ids.has(n.id));
 if(new Set(c.nodes.map(n=>n.id)).size!==c.nodes.length||c.nodes.length!==base.nodes.length+player.length)throw Error('Keep the installed arithmetic panel.');
 for(const n of base.nodes){const p=c.nodes.find(v=>v.id===n.id);if(!p||['type','width','fixed','rippleBit','rippleZero','register','bit','panelBus','aluBit','aluModule','equipment','rippleRole'].some(k=>p[k]!==n[k])||p.value!==undefined||p.faulty||p.fabricatedId||p.instanceId)throw Error('Keep the fixed registers, SUB, zero source and installed ADD4C.');}
 const internals=base.wires.filter(w=>w.panelInternal);
 if(c.wires.filter(w=>w.panelInternal).length!==internals.length||internals.some(w=>!c.wires.some(p=>['id','from','out','to','in','panelInternal'].every(k=>p[k]===w[k]))))throw Error('Register wiring is internal equipment.');
 for(const w of c.wires.filter(w=>!w.panelInternal)){
  const from=c.nodes.find(n=>n.id===w.from),to=c.nodes.find(n=>n.id===w.to);
  if(!from||!to||!aluPortVisible(from,'outputs',w.out)||!aluPortVisible(to,'inputs',w.in))throw Error('Use the visible register bus sockets.');
 }
 if(player.some(n=>!['XOR4','FAN4'].includes(n.type)||n.fixed||n.equipment||n.rippleRole||n.faulty||n.value!==undefined||n.panelBus||n.heritageProp||n.instanceId||n.aluModule!==true||n.aluBit||n.rippleBit||n.rippleZero)||['XOR4','FAN4'].some(t=>player.filter(n=>n.type===t).length>1))throw Error('Add one XOR4 and one FAN4; reuse the installed adder.');
 validate(c,{partial:true});return true;
}
export function testAluFoundation(c){const rows=[];try{
 validateAluShape(c);let issue=null;try{validate(c);}catch(e){issue=e.message;}
 const vectors=[[5,3,0],[5,3,1],[3,5,0],[3,5,1],[15,1,0],[15,1,1],[7,2,0],[7,2,1]];
 for(let A=0;A<16;A++)for(let B=0;B<16;B++)for(let SUB=0;SUB<2;SUB++)if(!vectors.some(v=>v[0]===A&&v[1]===B&&v[2]===SUB))vectors.push([A,B,SUB]);
 for(const [A,B,SUB]of vectors){const inputs=aluInputs(A,B,SUB),result=(A+(B^(SUB?15:0))+SUB)&15,expected=Object.fromEntries([0,1,2,3].map(i=>['C'+i,(result>>i)&1]));let actual={},error=issue;try{actual=evaluate(c,inputs,{},{partial:true}).outputs;}catch(e){error=e.message;}
  rows.push({inputs,expected,actual,pass:!error&&Object.keys(expected).every(k=>expected[k]===actual[k]),label:A+(SUB?' − ':' + ')+B+' (mod 16)',...(error?{error}:{})});}
 const pass=rows.every(r=>r.pass);return {pass,rows,error:pass?null:rows.find(r=>!r.pass)?.error||'Check conditional B inversion and the SUB connection to CIN in both modes.'};
 }catch(e){return {pass:false,rows,error:e.message};}}
export const ALU_SPEC={...RIPPLE_SPEC,id:ALU_ID,room:'navigation',title:'Controllable Adder/Subtractor',short:'shared arithmetic',plate:'NAVIGATION CONTROL / P20',circuitFactory:aluCircuit,inputs:[...RIPPLE_SPEC.inputs,{id:'SUB',type:'INPUT',label:'SUB',width:1}],gates:['XOR4','FAN4'],source:aluInputs(),spec:'C = A + (B XOR {4×SUB}) + SUB (mod 16)',problem:'Upgrade the four-bit adder so SUB selects addition or subtraction.',expected:i=>{const r=(rippleWord(i,'A')+(rippleWord(i,'B')^(i.SUB?15:0))+i.SUB)&15;return Object.fromEntries([0,1,2,3].map(b=>['C'+b,(r>>b)&1]));},hints:[
 'XOR can act like a controllable NOT gate. What happens when you XOR a bit with 0? What about 1?',
 'Try replacing the direct connection from B to the adder with the XOR4 module.',
 "FAN4 can send the same SUB signal to all four XOR gates. The adder's carry-in also needs that signal.",
 'Keep A → ADD4C and ADD4C → C. Connect B → XOR4 → ADD4C.B, SUB → FAN4 → XOR4.MASK, and SUB → ADD4C.CIN.'
 ],explanation:'XOR conditionally inverts B. FAN4 broadcasts SUB without changing its value. The same SUB supplies CIN, so one packaged ripple adder adds or subtracts. C retains four bits modulo 16; its signed interpretation is separate.',restored:'One arithmetic unit, two operations. ALU arithmetic foundation restored.'};
export const ALU_INTRO=["Remember our adder and subtractor? They were almost the same circuit!","The only difference was that subtraction inverted B and started the carry-in at 1.","But a regular NOT gate always flips its input. What if we only want to flip it sometimes?","That's where XOR comes in! When one input is 0, XOR lets the other input pass through. When it's 1, XOR flips it!","So we can use one switch to tell our adder whether to add or subtract. Let's upgrade it!"];
export const ALU_COMPLETE=["Nice! Now one circuit can add AND subtract!","We didn't add a second arithmetic unit. We just changed how the existing adder receives its inputs.","That's one of the coolest things about computer hardware. A few control signals can make the same circuitry do different jobs!","And that's only the beginning of an ALU. Imagine using control signals to choose between arithmetic, logic, and even shifting bits!"];
