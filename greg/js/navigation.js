import {openingEnvironment,OPENING_STOPS} from './opening-layout.js';
import {analysisEnvironment} from './development-environments.js';
import {workstationStops} from './scene-workstations.js';
// Coordinates belong to the environment; navigation never authorizes an interaction.
export const ENVIRONMENT_STOPS=Object.freeze({
 relay:Object.freeze([{id:'entrance',label:'Workshop entrance',x:76},{id:'nand-stock',label:'Emergency NAND rack',x:158},{id:'lighting',label:'Lighting controller',x:415},{id:'rear-latch',label:'Rear-door control',x:486},{id:'fabrication',label:'Fabrication floor',x:778},{id:'forward',label:'Forward bulkhead',x:1048}]),
 life:Object.freeze([
  {id:'entrance',label:'Greenhouse entrance',x:70},
  {id:'monitor',label:'Atmospheric monitor',x:335},
  {id:'filtration',label:'Filtration entrance',x:500},
  {id:'scrubber',label:'Scrubber machinery',x:832},
  {id:'safety',label:'Emergency safety systems',x:1138},
  {id:'workshop',label:'NAND Workshop entrance',x:1315},
 ]),
});
const singleScreen=Object.freeze([{id:'left',label:'Left end',x:20},{id:'right',label:'Right end',x:457}]);
export function navigationStops(w){return workstationStops(w)??analysisEnvironment(w)?.stops??(openingEnvironment(w)?OPENING_STOPS[w.room]:w.room==='life'&&w.foundation?.demoMode?.kind==='nor-workbench'?singleScreen:ENVIRONMENT_STOPS[w.room]??singleScreen);}
export function nextNavigationStop(w,x,direction){
 const stops=navigationStops(w);return direction>0?stops.find(s=>s.x>x+.75)??null:[...stops].reverse().find(s=>s.x<x-.75)??null;
}
export function navigationOrigin(w,actor){return Math.abs(actor.target-actor.x)>.6&&navigationStops(w).some(s=>Math.abs(s.x-actor.target)<.75)?actor.target:actor.x;}
export function navigationKey(event){if(event.repeat||event.altKey||event.ctrlKey||event.metaKey)return 0;const key=event.key.length===1?event.key.toLowerCase():event.key;return ['a','ArrowLeft'].includes(key)?-1:['d','ArrowRight'].includes(key)?1:0;}

