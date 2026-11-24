import {ALU_SPEC} from './alu-foundation.js';
import {RIPPLE_SPEC} from './ripple-adder.js';
import {ADDSUB_SPEC} from './arithmetic-curriculum.js';
// The original simulator and behavior validator are shared with the first release.
import {GALLERY_REPAIRS} from './gallery-puzzles.js';
import {createCircuit} from './puzzles.js';
import {CAMPAIGN_REPAIRS} from './campaign.js';
export const REPAIRS = {
  ventilation: {
    id:'ventilation',room:'engine', title:'Ventilation governor', plate:'KESTREL ENGINEERING / V-04',
    inputs:[{id:'A',type:'INPUT',label:'INHIBIT',width:1}],
    outputs:[{id:'Y',type:'OUTPUT',label:'FAN',width:1}], gates:['NOT','NAND'],
    expected:({A})=>({Y:1-A}), spec:'FAN = NOT INHIBIT',
    problem:'The sensor line is inverted. Run the blower when INHIBIT is 0; stop it when INHIBIT is 1.',
    hints:['The copper bridge sends the sensor straight to the motor. Disconnect it by clicking either connected terminal.','Put a NOT gate between INHIBIT and FAN. Drag a wire from an output terminal onto an input terminal and release.','A NAND gate with both inputs connected to INHIBIT is also a valid inverter.'],
    explanation:'An inverter swaps 0 and 1. Your repair restores the motor’s correct signal polarity.',
    source:{A:0},
  },
  security: {
    id:'security',room:'corridor', title:'Bulkhead interlock', plate:'KESTREL ENGINEERING / S-12',
    inputs:[{id:'A',type:'INPUT',label:'AUTH',width:1},{id:'B',type:'INPUT',label:'SAFE',width:1}],
    outputs:[{id:'Y',type:'OUTPUT',label:'OPEN',width:1}], gates:['AND','NOT','NOR','OR'],
    expected:({A,B})=>({Y:A&B}), spec:'OPEN = AUTH AND SAFE',
    problem:'The bulkhead must open only with an authorized pass AND safe engine pressure. The damaged OR gate accepts either condition.',
    hints:['An OR gate is unsafe here: it opens the hatch if just one permission is HIGH. Select it and use the bottom-right trash.','Place AND. Connect AUTH and SAFE to its left pins; connect its right output to OPEN.','The test switches are diagnostic inputs. Back in the corridor, AUTH comes from the pass reader and SAFE comes from the real pressure sensor.'],
    explanation:'AND is a safety interlock: both independent permissions must be HIGH. Any equivalent safe circuit is accepted.',
    source:{A:0,B:0},
  },
};
export function damagedCircuit(id) {
  if(REPAIRS[id].originalGate)return existingController(id,true);
  const c=createCircuit(REPAIRS[id]);
  if(id==='ventilation')c.wires.push({id:'damaged-bridge',from:'A',out:0,to:'Y',in:0});
  else if(id==='security') {
    c.nodes.push({id:'damaged',type:'OR',x:440,y:83});
    c.wires.push({id:'old-a',from:'A',out:0,to:'damaged',in:0},{id:'old-b',from:'B',out:0,to:'damaged',in:1},{id:'old-y',from:'damaged',out:0,to:'Y',in:0});
  }
  return c;
}
Object.assign(REPAIRS,CAMPAIGN_REPAIRS);
export function existingController(id,broken=false){
  const r=REPAIRS[id],c=createCircuit(r);
  c.nodes.push({id:'original',type:r.originalGate,label:(broken?'Burned ':'Existing ')+r.originalGate,x:440,y:100,...(broken?{faulty:true}:{})});
  r.inputs.forEach((n,i)=>c.wires.push({id:'original-input-'+i,from:n.id,out:0,to:'original',in:i}));
  if(!broken)c.wires.push({id:'original-output',from:'original',out:0,to:'Y',in:0});
  return c;
}


export const SAFETY_CUTOFF={id:'safetycutoff',room:'life',title:'Emergency safety cutoff',short:'Safety cutoff',plate:'LIFE SUPPORT / L-03',inputs:[{id:'A',type:'INPUT',label:'AIRFLOW',width:1},{id:'B',type:'INPUT',label:'COOLANT',width:1}],outputs:[{id:'Y',type:'OUTPUT',label:'INHIBIT',width:1}],gates:['AND','NOT'],source:{A:1,B:1},expected:({A,B})=>({Y:Number(!(A&B))}),spec:'INHIBIT = NOT (AIRFLOW AND COOLANT)',problem:'Inhibit the pump unless both safety signals are HIGH. Build NAND from AND followed by NOT.',hints:['What is the opposite of requiring both signals?','Combine the two signals with AND, then invert the result.','Connect both inputs to AND. Connect AND to NOT, then NOT to INHIBIT.'],explanation:'NAND is AND followed by inversion.',restored:'A working cutoff. And an air filter that has chosen a rather inconvenient moment to object.'};
Object.defineProperty(REPAIRS,'safetycutoff',{value:SAFETY_CUTOFF,enumerable:false});
Object.defineProperty(CAMPAIGN_REPAIRS,'safetycutoff',{value:SAFETY_CUTOFF,enumerable:false});

for(const [id,spec]of Object.entries(GALLERY_REPAIRS)){if(id==='firewall')continue;Object.defineProperty(REPAIRS,id,{value:spec,enumerable:false});Object.defineProperty(CAMPAIGN_REPAIRS,id,{value:spec,enumerable:false});}

Object.defineProperty(REPAIRS,'ripple_adder',{value:RIPPLE_SPEC,enumerable:false});
Object.defineProperty(CAMPAIGN_REPAIRS,'ripple_adder',{value:RIPPLE_SPEC,enumerable:false});
Object.defineProperty(REPAIRS,'addsub',{value:ADDSUB_SPEC,enumerable:false});
Object.defineProperty(CAMPAIGN_REPAIRS,'addsub',{value:ADDSUB_SPEC,enumerable:false});

Object.defineProperty(REPAIRS,'float_nav',{value:ALU_SPEC,enumerable:false});
Object.defineProperty(CAMPAIGN_REPAIRS,'float_nav',{value:ALU_SPEC,enumerable:false});
