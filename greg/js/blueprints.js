import {isEngineeringDemo} from './session-mode.js';
import {isEarly,serviceState,taskId} from './curriculum-profile.js';
import {FINITE_BUDGETS} from './inventory.js';
import {REPAIRS} from './repairs.js';
const wire=(from,to,input=0,out=0)=>({from,to,in:input,out});
const gate=(id,type,x,y)=>({id,type,x,y});
export const GUIDE_SHEETS=Object.freeze({
 nand:{id:'nand',name:'AND + NOT → NAND',equation:'Y = NOT(A AND B)',contexts:['safetycutoff'],inputs:['A','B'],outputs:['Y'],nodes:[gate('combine','AND',415,240),gate('invert','NOT',665,240)],wires:[wire('A','combine'),wire('B','combine',1),wire('combine','invert'),wire('invert','Y')],stages:[{name:'Require both inputs',roles:['combine']},{name:'Invert the conjunction',roles:['invert']}]},
 nor:{id:'nor',name:'OR + NOT → NOR',equation:'Y = NOT(A OR B)',contexts:['scrubber'],inputs:['A','B'],outputs:['Y'],nodes:[gate('combine','OR',415,240),gate('invert','NOT',665,240)],wires:[wire('A','combine'),wire('B','combine',1),wire('combine','invert'),wire('invert','Y')],stages:[{name:'Combine the inhibits',roles:['combine']},{name:'Invert the combined signal',roles:['invert']}]},
 xor:{id:'xor',name:'Four-NAND XOR',equation:'Y = A XOR B',contexts:['xorfab'],inputs:['A','B'],outputs:['Y'],nodes:[gate('shared','NAND',300,240),gate('left','NAND',510,130),gate('right','NAND',510,350),gate('join','NAND',750,240)],wires:[wire('A','shared'),wire('B','shared',1),wire('A','left'),wire('shared','left',1),wire('B','right'),wire('shared','right',1),wire('left','join'),wire('right','join',1),wire('join','Y')],stages:[{name:'Shared NAND',roles:['shared']},{name:'Separate the differing cases',roles:['left','right']},{name:'Combine',roles:['join']}]},
 halfadder:{id:'halfadder',name:'Half-adder reference',equation:'S = A XOR B; C = A AND B',contexts:['navbits'],inputs:['A','B'],outputs:['S','C'],nodes:[gate('sum','XOR',500,170),gate('carry','AND',500,350)],wires:[wire('A','sum'),wire('B','sum',1),wire('A','carry'),wire('B','carry',1),wire('sum','S'),wire('carry','C')],stages:[{name:'Find the sum bit',roles:['sum']},{name:'Find the carry bit',roles:['carry']}]},
 mux:{id:'mux',name:'One-bit selector reference',equation:'Y = (NOT S AND A) OR (S AND B)',contexts:[],inputs:['A','B','S'],outputs:['Y'],nodes:[gate('invert','NOT',280,360),gate('a','AND',500,160),gate('b','AND',500,350),gate('join','OR',760,240)],wires:[wire('S','invert'),wire('A','a'),wire('invert','a',1),wire('B','b'),wire('S','b',1),wire('a','join'),wire('b','join',1),wire('join','Y')],stages:[{name:'Complement the select signal',roles:['invert']},{name:'Gate each path',roles:['a','b']},{name:'Combine the selected path',roles:['join']}]},
});
export const BLUEPRINTS=Object.freeze({
 'bp.gate.nor':{id:'bp.gate.nor',name:'Reusable NOR construction',componentId:'NOR',requires:[],sheets:['nor'],note:'Your OR + NOT construction. Reuse this reference where those gate types are permitted. It grants no loose NOR hardware; installed source parts remain installed.'},
 'bp.gate.nand':{id:'bp.gate.nand',name:'Reusable NAND construction',componentId:'NAND',requires:[],sheets:['nand'],note:'Your AND + NOT construction. This drawing grants no physical NAND gates and no fabrication permission. The Workshop still supplies six finite NAND gates.'},
 'bp.gate.xor':{id:'bp.gate.xor',name:'Reusable XOR construction',componentId:'XOR',requires:[],sheets:['xor'],note:'Your four-NAND XOR construction. Use owned or legitimately fabricated parts. This reference never substitutes XOR hardware for a NAND-only requirement.'},
 'bp.workshop':{id:'bp.workshop',name:'NAND universality fabrication folio',room:'relay',requires:['nandnot','nandand','nandor'],sheets:[],note:'NOT(A) = NAND(A,A). AND(A,B) = NAND(NAND(A,B),NAND(A,B)). OR(A,B) = NAND(NAND(A,A),NAND(B,B)). The authorized fabricator supplies ship-standard maintenance modules; these drawings do not create parts or certificates.'},
 'bp.xor':{id:'bp.xor',name:'XOR construction sheet',room:'relay',requires:['nandnot','nandand','nandor'],sheets:['xor']},
 'bp.arithmetic':{id:'bp.arithmetic',name:'Arithmetic construction folio',room:'navigation',requires:[],sheets:['halfadder'],note:'The half-adder reference covers sum and carry. The Computation Lab connects full addition, P18 negation, and the P19 ADD/SUB circuit; its completed circuit reference unlocks only after engagement.'},
 'bp.mux':{id:'bp.mux',name:'Signal routing drawing',room:'navigation',requires:[],sheets:['mux']},
 'bp.alu':{id:'bp.alu',name:'ALU maintenance drawing',room:'navigation',requires:[],sheets:[],note:'Four operations share an arithmetic/logic datapath and a selector. The gate-level four-operation guide belongs to the revised ALU package.'},
 'bp.storage':{id:'bp.storage',name:'Storage construction folio',room:'reactor',requires:[],sheets:[],note:'SR → D latch → master/slave DFF → register. Gate-level feedback lessons arrive with the storage package; this drawing grants no DFF.'},
 'bp.counter':{id:'bp.counter',name:'Counter phase drawing',room:'reactor',requires:[],sheets:[],note:'Q0 toggles each rising edge; Q1 toggles when the previous Q0 is 1. Capture both bits on the same clock.'},
 'bp.enable':{id:'bp.enable',name:'Enabled storage drawing',room:'reactor',requires:[],sheets:[],note:'Select between a new datapath result and the stored result before each capture. The revised enable/hold lesson remains unavailable.'},
 'demo.nor':{id:'demo.nor',name:'NOR composition drawing',room:'life',requires:[],sheets:['nor'],demoOnly:true},
});
export const getBlueprint=id=>typeof id==='string'&&Object.hasOwn(BLUEPRINTS,id)?BLUEPRINTS[id]:null;
export function blueprintAvailable(w,id){if(id==='bp.xor'&&w.foundation.curriculum.xorUseVersion===1&&!w.foundation.components.certified.XOR)return false;const p=getBlueprint(id);if(p?.componentId)return !!w.foundation.blueprints.acquired[id]&&!!w.foundation.components.certified[p.componentId];return !!p&&(!p.demoOnly||isEngineeringDemo(w))&&w.room===p.room&&p.requires.every(key=>w.machines[key]?.certified);}
export function availableBlueprints(w){return Object.values(BLUEPRINTS).filter(p=>blueprintAvailable(w,p.id));}
export function acquireBlueprint(w,id,transactionId){
 const p=getBlueprint(id);if(!blueprintAvailable(w,id))throw Error('Inspect the accessible drawing cabinet in its actual room first.');
 if(w.foundation.blueprints.acquired[id])return {duplicate:true};
 w.foundation.blueprints.acquired[id]={id,version:1,transactionId};return {blueprintId:id,name:p.name};
}
function reusableGuideFits(w,puzzleId,sheet){
 const spec=REPAIRS[puzzleId];if(!spec)return false;
 if(isEarly(w)&&puzzleId==='scrubber'&&serviceState(w)?.triggered)return false;
 const budget=FINITE_BUDGETS[taskId(w,puzzleId)],permitted=isEarly(w)&&budget?Object.keys(budget):spec.gates;
 return sheet.nodes.every(n=>permitted.includes(n.type))&&sheet.inputs.every(id=>spec.inputs.some(n=>n.id===id&&n.width===1))&&sheet.outputs.every(id=>spec.outputs.some(n=>n.id===id&&n.width===1));
}
export function eligibleGuides(w,puzzleId){return Object.keys(w.foundation.blueprints.acquired).flatMap(id=>{const p=getBlueprint(id);return p&&(!p.demoOnly||isEngineeringDemo(w))?p.sheets.filter(key=>p.componentId?reusableGuideFits(w,puzzleId,GUIDE_SHEETS[key]):GUIDE_SHEETS[key].contexts.includes(puzzleId)).map(sheetId=>({blueprintId:id,sheetId,...GUIDE_SHEETS[sheetId]})):[];});}
/** Knowledge receipt only; never a physical item or a fabrication entitlement. */
export function unlockConstructionBlueprint(w,componentId,transactionId){
 const id={NOR:'bp.gate.nor',NAND:'bp.gate.nand',XOR:'bp.gate.xor'}[componentId];if(!id||!w.foundation.components.certified[componentId])return false;
 if(w.foundation.blueprints.acquired[id])return false;
 w.foundation.blueprints.acquired[id]={id,version:1,transactionId};return true;
}
export function setBlueprintView(w,puzzleId,{blueprintId,sheetId,visible,opacity}){
 if(blueprintId===null){w.foundation.blueprints.preferences[puzzleId]={visible:false};return;}
 if(!eligibleGuides(w,puzzleId).some(g=>g.blueprintId===blueprintId&&g.sheetId===sheetId))throw Error('This drawing has not been acquired or is not appropriate to this panel.');
 if(typeof visible!=='boolean'||!Number.isFinite(opacity)||opacity<.08||opacity>.65)throw Error('Invalid drawing display settings.');
 w.foundation.blueprints.preferences[puzzleId]={blueprintId,sheetId,visible,opacity};
}
export function restoreBlueprints(w){
 const b=w.foundation.blueprints,acquired={},preferences={};
 for(const [id,r]of Object.entries(b?.acquired||{})){const p=getBlueprint(id);if(p&&!p.demoOnly&&(!p.componentId||w.foundation.components.certified[p.componentId])&&r?.id===id&&r.version===1&&typeof r.transactionId==='string')acquired[id]=r;}
 w.foundation.blueprints={acquired,preferences};
 for(const [id,p]of Object.entries(b?.preferences||{}))try{setBlueprintView(w,id,p);}catch{}
}
