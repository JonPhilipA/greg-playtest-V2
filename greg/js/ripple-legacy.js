// Read-only validation of installed pre-redesign carry benches. Never used for new construction.
import './arithmetic-modules.js';
import {evaluate} from './simulator.js';
export const RIPPLE_ID='ripple_adder';
const terminal=(id,type,label,x,y,width=4)=>({id,type,label,x,y,width,fixed:true});
export function legacyRippleCircuit(stages=2){
 if(![2,4].includes(stages))throw Error('Invalid carry bench stage.');
 const c={configuration:{rippleStage:stages},nodes:[terminal('A','INPUT','A [3:0]',28,45),terminal('B','INPUT','B [3:0]',28,180),terminal('Y','OUTPUT','SUM [3:0]',760,444),terminal('C','OUTPUT','FINAL CARRY',974,45,1)],wires:[],layout:{ripple:true,width:1200,height:600}};
 const equipment=(id,type,label,x,y)=>c.nodes.push({id,type,label,x,y,equipment:true,rippleRole:true});
 equipment('bitsA','BITS4','A BIT LANES',244,40);equipment('bitsB','BITS4','B BIT LANES',244,168);equipment('zero','ZERO','C0 = 0',180,355);equipment('sum','SUM'+stages,'SUM BIT LANES',574,444);
 for(let i=0;i<stages;i++)equipment('fa'+i,'FA1','FA'+i+' · BIT '+i,stages===2?450+i*300:362+i*206,290);
 if(stages===2)for(const n of c.nodes.filter(n=>['A','B','Y'].includes(n.id))){n.displayBits=2;n.label=n.id==='Y'?'SUM [1:0]':n.id+' [1:0]';}
 const wire=(from,out,to,pin)=>c.wires.push({id:'bench-'+c.wires.length,from,out,to,in:pin,bench:true});
 wire('A',0,'bitsA',0);wire('B',0,'bitsB',0);wire('zero',0,'fa0',2);
 for(let i=0;i<stages;i++){wire('bitsA',i,'fa'+i,0);wire('bitsB',i,'fa'+i,1);wire('fa'+i,0,'sum',i);}
 wire('sum',0,'Y',0);wire('fa'+(stages-1),1,'C',0);return c;
}
const key=w=>[w.from,w.out,w.to,w.in].join(':');
/** Protect installed bench hardware, while carry routing remains actual editable wiring. */
export function validateLegacyRippleShape(c,previous=null){
 const stages=c?.configuration?.rippleStage;if(![2,4].includes(stages)||Object.keys(c.configuration).join()!=='rippleStage')throw Error('Invalid ripple bench checkpoint.');
 if(previous&&previous.configuration.rippleStage!==stages)throw Error('Verify the two-adder stage before expanding the bench.');
 const base=legacyRippleCircuit(stages);if(c.nodes.length!==base.nodes.length)throw Error('The installed Full Adder bench is protected.');
 for(const n of base.nodes){const p=c.nodes.find(v=>v.id===n.id);if(!p||['type','width','fixed','equipment','rippleRole'].some(k=>p[k]!==n[k])||p.faulty||p.instanceId||p.fabricatedId||p.value!==undefined)throw Error('Keep the installed bench modules and terminals.');}
 for(const w of base.wires)if(!c.wires.some(v=>key(v)===key(w)))throw Error('A/B, sum, and C0 leads are prewired. Only edit the carry links.');
 for(const w of c.wires)if(!base.wires.some(v=>key(v)===key(w))&&!(w.in===2&&Array.from({length:stages-1},(_,i)=>'fa'+(i+1)).includes(w.to)))throw Error('Connect the carry-out to the next stage carry-in.');
 return stages;
}
export function testLegacyRipple(c){
 const rows=[];try{const bits=validateLegacyRippleShape(c),mask=(1<<bits)-1;
  // Include the illustrative vectors first; exhaust the remaining input pairs as well.
  const vectors=[...new Map([[1,2],[3,1],[3,5],[15,1]].map(([A,B])=>[[(A&mask),(B&mask)].join(','),[A&mask,B&mask]])).values()];for(let A=0;A<=mask;A++)for(let B=0;B<=mask;B++)if(!vectors.some(v=>v[0]===A&&v[1]===B))vectors.push([A,B]);
  for(const [A,B]of vectors){const expected={Y:(A+B)&mask,C:(A+B)>>bits};let actual={},error=null;try{actual=evaluate(c,{A,B}).outputs;}catch(e){error=e.message;}rows.push({inputs:{A,B},expected,actual,pass:!error&&actual.Y===expected.Y&&actual.C===expected.C,label:'Unsigned '+A+' + '+B,...(error?{error}:{})});}
  const pass=rows.every(r=>r.pass);return {pass,rows,error:pass?null:rows.find(r=>!r.pass)?.error||'The carry chain does not produce the required sum and final carry.'};
 }catch(e){return {pass:false,rows,error:e.message};}
}
