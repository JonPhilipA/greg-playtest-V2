import {newWorld,certify,updateWorld,takePass,authorize,enterRoom,recoverLog,dispatchCommand} from './world.js';
import {createCircuit} from './puzzles.js';
import {REPAIRS} from './repairs.js';
let demoSequence=0;
function single(id,type){const c=createCircuit(REPAIRS[id]);c.nodes.push({id:'service',type,x:440,y:130});REPAIRS[id].inputs.forEach((n,index)=>c.wires.push({id:'input-'+index,from:n.id,out:0,to:'service',in:index}));c.wires.push({id:'output',from:'service',out:0,to:REPAIRS[id].outputs[0].id,in:0});return c;}
/** Explicit developer entry only. No load/save adapter, normal writer lease or future completion. */
export function createDemoSession(){
 const w=newWorld();
 if(!certify(w,'ventilation',single('ventilation','NOT')).applied)throw Error('Demo ventilation prerequisite failed.');
 for(let i=0;i<160;i++)updateWorld(w,.05);
 takePass(w);authorize(w);if(!certify(w,'security',single('security','AND')).applied)throw Error('Demo interlock prerequisite failed.');
 enterRoom(w,'corridor');recoverLog(w);enterRoom(w,'life');if(!certify(w,'alarm',single('alarm','OR')).applied)throw Error('Demo alarm prerequisite failed.');
 for(const command of [{type:'InitializeInventory'},{type:'CollectGate',pickupId:'garden.nor-kit'}]){const r=dispatchCommand(w,command);if(!r.ok)throw Error(r.error);}
 w.foundation.demoMode={version:1,kind:'nor-workbench',sessionId:'demo-'+(++demoSequence)+'-'+Date.now().toString(36)};
 return {world:w,scope:'demo',persistent:false,reset:()=>createDemoSession(),discard(){this.world=null;}};
}
