import {DATA_SPECS,dataCircuit,isDataConsole,validateDataShape} from './data-consoles.js';
import {createCircuit,LEVELS} from './puzzles.js';
import {testCircuit} from './validator.js';
import {galleryEnabled,splitGallery} from './curriculum-profile.js';
import {GALLERY_DATA_IDS} from './gallery-data.js';
export const GALLERY_IDS=Object.freeze(['sensordiff','xorfab','cryo_signed','hull','pressure_width',...GALLERY_DATA_IDS]);
const input=(id,label)=>({id,type:'INPUT',label,width:1}),output={id:'Y',type:'OUTPUT',label:'DISAGREE',width:1};
export const GALLERY_REPAIRS={
 sensordiff:{id:'sensordiff',room:'sensors',title:'Conflicting Sensor Monitor',short:'Sensor disagreement monitor',plate:'LISTENING GALLERY / P09',inputs:[input('A','SENSOR A'),input('B','SENSOR B')],outputs:[output],gates:['XOR'],existingComponents:{comparator:'XOR','stray-inversion':'NOT'},source:{A:0,B:1},expected:({A,B})=>({Y:A^B}),spec:'ACTIVATE THE WARNING WHEN SENSOR A AND SENSOR B ARE DIFFERENT.',problem:'Collect the XOR gate from the floor beside the Gallery sensor receiver and install it. Equal sensors (00 or 11) keep the warning OFF; different sensors (01 or 10) turn it ON.',hints:['Toggle both sensors. Equal readings must produce 0; different readings must produce 1.','One physical XOR gate is lying on the floor beside the sensor receiver. XOR produces 1 only when its two inputs differ.','Place the recovered XOR. Connect one sensor to each input and its output to DISAGREE.'],explanation:'XOR means exclusive OR: exactly one input is 1. The recovered component stays installed in this monitor; learning its behavior does not unlock its construction blueprint.',restored:'Equal readings: quiet. Different readings: a warning. XOR means exclusive OR. Now we know what we want to build.'},
 xorfab:{id:'xorfab',room:'sensors',title:'XOR Fabrication',short:'Four-NAND XOR bench',plate:'LISTENING GALLERY / P10',inputs:[input('A','SENSOR A'),input('B','SENSOR B')],outputs:[output],gates:['NAND'],source:{A:0,B:1},expected:({A,B})=>({Y:A^B}),spec:'BUILD AN XOR FUNCTION USING FOUR NAND GATES. · OUTPUT 1 WHEN THE TWO INPUTS ARE DIFFERENT.',problem:'The recovered XOR is keeping the sensor monitor running. No spare ready-made XOR remains. Construct another disagreement function from four NAND gates. Use the automatic NAND supply in your satchel; the Workshop’s original six NANDs remain installed.',hints:['Start with a shared NAND(A,B) result. You may fan it out to more than one input.','NAND each original input with that shared result, creating two branches.','T = NAND(A,B); L = NAND(A,T); R = NAND(B,T); Y = NAND(L,R).'],explanation:'Four NANDs construct XOR: share NAND(A,B), form the two branches, then NAND them together.',restored:'Four NAND gates, one exclusive OR. Different parts, the exact disagreement behavior we measured.'},
};
Object.assign(GALLERY_REPAIRS,DATA_SPECS);
export function galleryCircuit(id,{legacy=false}={}){if(isDataConsole(id))return dataCircuit(id);const c=createCircuit(GALLERY_REPAIRS[id]||(id==='hull'?LEVELS[5]:null));if(id==='sensordiff'&&legacy){
 c.nodes.push({id:'comparator',type:'XOR',label:'Installed XOR comparator',equipment:true,x:740,y:230},{id:'stray-inversion',type:'NOT',label:'Stray input inverter',x:390,y:120});
 c.wires=[['A','stray-inversion',0],['stray-inversion','comparator',0],['B','comparator',1],['comparator','Y',0]].map(([from,to,pin],i)=>({id:'receiver-'+i,from,to,out:0,in:pin}));
 }return c;}
export function initializeGallery(w,snapshot=null){
 if(snapshot&&!galleryEnabled(snapshot))return w;
 if(!snapshot)w.foundation.exploration.galleryRoomsVersion=1;
 w.foundation.curriculum.galleryVersion=1;w.foundation.curriculum.galleryDataVersion=1;w.foundation.curriculum.signedLessonVersion=1;
 for(const id of GALLERY_IDS){const fresh=GALLERY_DATA_IDS.includes(id)&&(!snapshot||snapshot.foundation?.curriculum?.galleryDataVersion!==1),spec=GALLERY_REPAIRS[id]||LEVELS[5];w.circuits[id]=fresh?galleryCircuit(id):snapshot?.circuits?.[id]?structuredClone(snapshot.circuits[id]):w.circuits[id]||galleryCircuit(id,{legacy:!!snapshot&&snapshot.foundation?.curriculum?.xorUseVersion!==1});if(isDataConsole(id))validateDataShape(id,w.circuits[id]);const saved=!fresh&&snapshot?.machines?.[id];w.machines[id]=saved?{...saved,certified:saved.certified===true&&testCircuit(spec,w.circuits[id]).pass}:fresh?{status:'off',certified:false,output:0,outputs:{}}:w.machines[id]||{status:'off',certified:false,output:0,outputs:{}};}
 return w;
}
export function validateComparator(graph){
 const ids=new Set();for(const n of graph.nodes){if(ids.has(n.id))throw Error('Duplicate equipment identity.');ids.add(n.id);
 if(n.instanceId||n.fabricatedId||n.faulty||n.heritageProp)throw Error('The diagnostic equipment cannot claim loose or damaged hardware.');
 const fixture=['A','B'].includes(n.id)?n.type==='INPUT'&&n.fixed&&(n.width||1)===1:n.id==='Y'?n.type==='OUTPUT'&&n.fixed&&(n.width||1)===1:n.id==='comparator'?n.type==='XOR'&&n.equipment===true&&!n.fixed:n.id==='stray-inversion'?n.type==='NOT'&&!n.fixed&&!n.equipment:false;
 if(!fixture)throw Error('Use the existing protected XOR comparator and the original sensor fixtures. No loose XOR module is available.');}
 if(!['A','B','Y','comparator'].every(id=>ids.has(id)))throw Error('The installed comparator and fixed sensor terminals must remain.');return true;
}
export const isGalleryCurriculum=w=>galleryEnabled(w)&&(w.room==='sensors'||splitGallery(w)&&['testbay','blackbox'].includes(w.room));
