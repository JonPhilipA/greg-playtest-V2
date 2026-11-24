import {aluSolution} from './alu-foundation.js';
import {subtractorSolution} from './subtractor.js';
import {rippleSolution} from './ripple-adder.js';
import {GUIDE_SHEETS} from './blueprints.js';
import {REPAIRS} from './repairs.js';
import {createCircuit} from './puzzles.js';
import {isEarly,serviceState} from './curriculum-profile.js';
import {getPlayablePuzzle} from './puzzle-definitions.js';
import {isDataConsole} from './data-consoles.js';

const fromSheet=key=>({nodes:structuredClone(GUIDE_SHEETS[key].nodes),wires:structuredClone(GUIDE_SHEETS[key].wires)});
function construction(id){
 const graph={nodes:[],wires:[]};let serial=0;
 const wire=(from,to,input=0,out=0)=>graph.wires.push({from,to,in:input,out});
 const gate=(type,...sources)=>{const id='hint-'+(++serial);graph.nodes.push({id,type,x:300,y:240});sources.forEach((source,index)=>wire(source,id,index));return id;};
 if(id==='ventilation')wire(gate('NOT','A'),'Y');
 else if(id==='security')wire(gate('AND','A','B'),'Y');
 else if(id==='alarm')wire(gate('OR','A','B'),'Y');
 else if(id==='scrubber')return fromSheet('nor');
 else if(id==='safetycutoff')return fromSheet('nand');
 else if(id==='xorfab')return fromSheet('xor');
 else if(id==='navbits')return fromSheet('halfadder');
 else if(id==='demorgan'){const a=gate('NOT','A'),b=gate('NOT','B');wire(gate('AND',a,b),'Y');}
 else if(id==='nandnot')wire(gate('NAND','A','A'),'Y');
 else if(id==='nandand'){const n=gate('NAND','A','B');wire(gate('NAND',n,n),'Y');}
 else if(id==='nandor'){const a=gate('NAND','A','A'),b=gate('NAND','B','B');wire(gate('NAND',a,b),'Y');}
 else if(id==='sensordiff')wire(gate('XOR','A','B'),'Y');
 else if(id==='hull'){const ab=gate('AND','A','B'),ac=gate('AND','A','C'),bc=gate('AND','B','C');wire(gate('OR',gate('OR',ab,ac),bc),'Y');}
 else if(id==='firewall'){const a=gate('NOT','A'),b=gate('NOT','B');wire(gate('OR',a,b),'Y');wire(gate('AND',a,b),'Z');}
 else if(id==='trajectory'){const p=gate('XOR','A','B');wire(gate('XOR',p,'I'),'S');wire(gate('OR',gate('AND','A','B'),gate('AND',p,'I')),'C');}
 else if(id==='memory'){wire(gate('DFF','A','K'),'Y');wire(gate('DFF','B','K'),'Z');}
 else if(id==='reactor'){const low=gate('DFF'),high=gate('DFF');wire('K',low,1);wire('K',high,1);wire(gate('NOT',low),low);wire(gate('XOR',low,high),high);wire(low,'L');wire(high,'H');}
 else if(id==='alu'){const add=gate('ADD4','A','B'),xor=gate('XOR4','A','B');wire(gate('MUX4',add,xor,'M'),'Y');}
 else if(id==='flightmemory'){const sum=gate('XOR','A','B'),carry=gate('AND','A','B');wire(gate('DFF',gate('AND',sum,'E'),'K'),'S');wire(gate('DFF',gate('AND',carry,'E'),'K'),'C');}
 else if(id==='override'){wire(gate('AND','E','R'),'T');wire(gate('AND','E',gate('NOT','R')),'M');}
 else return null;
 return graph;
}

/** Advisory constructions only. Never returns live nodes or inventory identifiers. */
export function circuitHintDefinition(w,id){
 if(!getPlayablePuzzle(id,w)||!REPAIRS[id]||isDataConsole(id,w.circuits?.[id]))return null;
 const service=isEarly(w)&&id==='scrubber'&&serviceState(w)?.triggered,existing=isEarly(w)&&id==='sensordiff'&&w.foundation.curriculum.xorUseVersion!==1;
 const graph=id==='float_nav'?aluSolution():id==='addsub'?subtractorSolution():id==='ripple_adder'?rippleSolution():construction(service?'demorgan':id);if(!graph)return null;if(['ripple_adder','addsub','float_nav'].includes(id))graph.nodes=graph.nodes.filter(n=>!n.fixed&&!n.equipment);if(id==='float_nav')graph.wires=graph.wires.filter(w=>!w.panelInternal);
 const spec=REPAIRS[id],key=service?'service.scrubber.demorgan':id+(existing?':installed-xor':'');
 const counts={};for(const n of graph.nodes)counts[n.type]=(counts[n.type]||0)+1;
 return {id:key,key,puzzleId:id,...(id==='float_nav'?{fixedIds:['Abus','Bbus','Cbus','adder']} : {}),name:spec.title,inputs:spec.inputs.map(n=>n.id),outputs:spec.outputs.map(n=>n.id),...graph,counts,stages:[],existing};
}
export function hintExampleGraph(w,id){if(id==='float_nav')return aluSolution();if(id==='addsub')return subtractorSolution();if(id==='ripple_adder')return rippleSolution();const guide=circuitHintDefinition(w,id);if(!guide)return null;const graph=createCircuit(REPAIRS[id]);graph.nodes.push(...structuredClone(guide.nodes));graph.wires=guide.wires.map((wire,index)=>({...wire,id:'hint-wire-'+index}));return graph;}
const numbers=['zero','one','two','three','four','five','six','seven','eight'];
export function hintMessage(guide,level){
 if(!guide)return 'No verified construction guide is available for this panel.';
 if(guide.puzzleId==='float_nav')return REPAIRS.float_nav.hints[level-1]||'';
 if(guide.puzzleId==='addsub')return REPAIRS.addsub.hints[level-1]||'';
 if(guide.puzzleId==='ripple_adder')return ({1:'Each Full Adder handles one bit position. Start with the least significant bit.',2:'These four outlines suggest positions for your Full Adders. Place the components yourself.',3:'Connect A0 and B0 to the first stage, then A1/B1, A2/B2 and A3/B3 to their corresponding stages.',4:'Connect CIN = 0 to the first stage, each COUT to the next CIN, and each SUM to C0–C3. Follow the ghost wires and build the connections yourself.'})[level]||'';
 if(level===1){if(guide.key==='service.scrubber.demorgan')return 'Compare the original truth table with what each available component does. Can different parts reproduce the same four results?';if(guide.existing)return 'Use the one installed XOR comparator; no additional components are needed.';const names=Object.entries(guide.counts).map(([type,n])=>(numbers[n]||n)+' '+type+' gate'+(n===1?'':'s'));return "You'll need "+names.join(names.length===2?' and ':', ')+'.';}
 return ({2:'These golden outlines show one way to arrange the gates.',3:"Now I'll show you which gate belongs in each position.",4:"Here's how the terminals connect. You still need to build it."})[level]||'';
}
export function circuitHintView(w,id){const guide=circuitHintDefinition(w,id),saved=guide&&w.foundation.hintPreferences?.[guide.key];return saved?{...saved}:{unlocked:0,level:0,visible:true};}
export function setCircuitHintView(w,id,{level,visible=true}={}){
 const guide=circuitHintDefinition(w,id);if(!guide)throw Error('No implemented circuit guide exists for this panel.');
 if(!Number.isInteger(level)||level<0||level>4||typeof visible!=='boolean')throw Error('Invalid circuit hint level.');
 if(visible&&level>0){w.foundation.hintUsage??={version:0,revealed:{}};w.foundation.hintUsage.revealed[guide.key]=true;}
 const previous=circuitHintView(w,id);w.foundation.hintPreferences??={};w.foundation.hintPreferences[guide.key]={unlocked:Math.max(previous.unlocked,level),level,visible};
 return w.foundation.hintPreferences[guide.key];
}
