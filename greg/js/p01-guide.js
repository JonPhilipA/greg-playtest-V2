import {isEarly} from './curriculum-profile.js';
import {testCircuit} from './validator.js';
import {REPAIRS} from './repairs.js';
import {corePowered,hasOpening} from './opening-state.js';
/** Guidance only. Availability and collection remain governed by the physical pickup. */
export function enginePartsGlow(w,{powerRestoring=false}={}){
 const instances=w.foundation?.inventory?.instances||{};
 if(w.room!=='engine'||instances['finite.not.01']?.owner.kind!=='world')return false;
 if(!hasOpening(w))return true; // Preserve older, non-opening pickup presentation.
 const ownsNot=Object.values(instances).some(g=>g.componentType==='NOT'&&['bag','draft','installed'].includes(g.owner.kind));
 return corePowered(w)&&!powerRestoring&&!w.machines.ventilation?.certified&&w.flags.includes('inspected_fan')&&!ownsNot;
}
export const freshP01Guide=()=>({version:1,skipped:false,workspace:false,selected:false});
export const p01Guided=w=>isEarly(w)&&!w.machines.ventilation?.certified&&w.foundation.dataInspector?.p01Guide?.skipped!==true;
export function p01GuideCommand(w,c){if(!isEarly(w)||w.room!=='engine')throw Error('P01 guidance belongs to the Engine Room.');const guide=w.foundation.dataInspector.p01Guide??=freshP01Guide();if(c.action==='skip')guide.skipped=true;else if(c.action==='workspace')guide.workspace=true;else if(c.action==='select'){const available=Object.values(w.foundation.inventory.instances).some(g=>g.componentType==='NOT'&&g.owner.kind==='bag');if(!available)throw Error('Collect the physical NOT gate from the red toolbox first.');guide.selected=true;}else throw Error('Unknown tutorial control.');return {guide};}
export function p01Step(w,{panel=false,graph=w.circuits.ventilation,selected=false,testing=false,testResult=null}={}){
 if(!p01Guided(w))return null;const prefs=w.foundation.dataInspector?.p01Guide||freshP01Guide(),not=graph.nodes.find(n=>n.type==='NOT'&&!n.faulty&&!n.heritageProp),owns=Object.values(w.foundation.inventory.instances).some(g=>g.componentType==='NOT'&&['bag','draft','installed'].includes(g.owner.kind)),valid=testCircuit(REPAIRS.ventilation,graph).pass;
 const step=(id,objective,message,extra={})=>({id,objective,message,notId:not?.id,...extra});
 if(!panel){if(!w.flags.includes('inspected_fan')&&!prefs.workspace&&!not&&!valid)return step('fan','INSPECT THE VENTILATION FAN',"Let's start with the ventilation fan. Click it to find out what's wrong.",{hotspot:'fan'});if(!owns&&!valid)return step('pickup','FIND A NOT GATE IN THE PARTS BOX.','The fan is receiving a 0, but it needs a 1. We can reverse the signal with a NOT gate. Check the nearby parts box.',{hotspot:enginePartsGlow(w)?'pickup-engine.not':null});return step('box','OPEN THE VENTILATION CIRCUIT BOX',"Now open the ventilation circuit box. That's where we'll change the signal.",{hotspot:'vent-panel'});}
 if(testing)return step('testing','WATCH YOUR CIRCUIT RESPOND','The diagnostic flips the sensor and checks the actual fan-control output.');
 if(valid){const ticket=w.foundation.tested.ventilation,meta=w.foundation.circuits.ventilation;if(ticket?.pass&&ticket.signature===meta.signature&&ticket.functionalRevision===meta.functionalRevision)return step('engage','ENGAGE THE REPAIR','Perfect. The circuit does exactly what we need. Now engage the system to activate the fan.',{selector:'[data-diagnostic="engage"]'});return step('test','TEST YOUR CIRCUIT',"The sensor sends 0. NOT changes it to 1. Click TEST & ENGAGE to check both sensor states.",{selector:'[data-action="test"]'});}
 if(!owns)return step('pickup','FIND A NOT GATE IN THE PARTS BOX.','The circuit box is accessible. Close it and collect the real NOT gate from the red toolbox.',{selector:'.repair-close'});
 if(!not&&!prefs.workspace){if(graph.wires.length||graph.nodes.some(n=>!n.fixed))return step('clear','CLEAR CIRCUIT',"This is the circuit board. Let's make sure we have a clean workspace. Click CLEAR CIRCUIT.",{selector:'#clear-panel'});return step('workspace','CIRCUIT BOARD READY','The board is already empty. Clear Circuit removes placed components and wiring; no clearing is needed now.',{continue:true});}
 if(!not)return selected||prefs.selected?step('place','PLACE THE NOT GATE','Now place the NOT gate onto the circuit board. Click the highlighted open area, or drag it from the toolbox.',{placement:true}):step('select','SELECT THE NOT GATE','Select the NOT gate from your available components.',{selector:'[data-part="NOT"]'});
 const connected=(from,to,pin=0)=>graph.wires.some(w=>w.from===from&&w.out===0&&w.to===to&&w.in===pin);
 if(!connected('A',not.id))return step('input','CONNECT SENSOR INPUT TO NOT GATE',"Connect the sensor's right terminal to the NOT gate's left input.",{connection:[['A','outputs',0],[not.id,'inputs',0]]});
 if(!connected(not.id,'Y'))return step('output','CONNECT NOT OUTPUT TO FAN',"Now connect the NOT gate's right output to the fan control terminal on the left of FAN.",{connection:[[not.id,'outputs',0],['Y','inputs',0]]});
 return step('check','CHECK YOUR WIRING',testResult?.error||'Keep the NOT connections and remove the extra or damaged wiring. Your construction is preserved.',{selector:'[data-action="test"]'});
}

export function validateP01Guide(w){const g=w.foundation.dataInspector?.p01Guide;if(g&&(g.version!==1||['skipped','workspace','selected'].some(key=>typeof g[key]!=='boolean')))throw Error('The P01 guidance preferences need recovery.');}
