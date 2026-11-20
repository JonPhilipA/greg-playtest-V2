import {openingEnvironment,OPENING_WIDTHS} from './opening-layout.js';
import {analysisEnvironment} from './development-environments.js';
import {WORKSHOP_WIDTH} from './workshop-layout.js';
import {isEngineeringDemo} from './session-mode.js';
import {nextNavigationStop} from './navigation.js';
export const VIEW_WIDTH=480,VIEW_HEIGHT=270,GARDEN_WIDTH=1440,LAYOUT_VERSION=1;
export const GARDEN_AREAS=Object.freeze([190,720,1190]);
export const GARDEN_HOTSPOTS=Object.freeze([
 {id:'back',label:'Return to previous deck',x:8,y:89,w:60,h:122,walk:73},
 {id:'repair-alarm',label:'Atmospheric alarm service cover',x:350,y:140,w:43,h:48,walk:335},
 {id:'machine-info',label:'The life-support garden machinery',x:546,y:85,w:253,h:106,walk:637},
 {id:'repair-scrubber',label:'Scrubber permissive service cover',x:837,y:120,w:48,h:61,walk:832},
 {id:'repair-safetycutoff',label:'Safety cutoff service cover',x:1150,y:149,w:54,h:55,walk:1138},
 {id:'watch-record',label:'Watch record terminal',x:1253,y:140,w:30,h:39,walk:1244},
 {id:'forward',label:'Forward deck hatch',x:1332,y:87,w:85,h:126,walk:1315},
 {id:'greg',label:'Speak to G.R.E.G.',x:288,y:77,w:32,h:42,walk:290},
 {id:'greg-filtration',label:'Speak to G.R.E.G. at filtration',x:506,y:61,w:32,h:42,walk:512},
 {id:'greg-emergency',label:'Speak to G.R.E.G. at emergency systems',x:1245,y:72,w:32,h:42,walk:1244},
]);
export const GARDEN_PICKUPS=Object.freeze({
 'garden.or':{x:311,y:185,w:38,h:27,walk:324},
 'garden.nor-kit':{x:801,y:184,w:50,h:25,walk:809},
 'garden.demorgan-kit':{x:884,y:169,w:43,h:40,walk:905},
 'garden.cutoff-kit':{x:1035,y:187,w:45,h:32,walk:1045},
});
export const extendedGarden=w=>w.room==='life'&&!isEngineeringDemo(w);
export const extendedWorkshop=w=>w.room==='relay';
export const environmentWidth=w=>analysisEnvironment(w)?.width??(openingEnvironment(w)?OPENING_WIDTHS[w.room]:extendedGarden(w)?GARDEN_WIDTH:extendedWorkshop(w)?WORKSHOP_WIDTH:VIEW_WIDTH);
export const extendedEnvironment=w=>environmentWidth(w)>VIEW_WIDTH;
export const clamp=(x,min,max)=>Math.max(min,Math.min(max,x));
export const clampWorldX=(w,x)=>clamp(Number.isFinite(x)?x:70,20,environmentWidth(w)-20-(extendedEnvironment(w)?0:3));
export const cameraFromActor=(w,x)=>clamp(x-VIEW_WIDTH/2,0,environmentWidth(w)-VIEW_WIDTH);
export function followCamera(w,current,x,dt,reduced=false){
 const max=environmentWidth(w)-VIEW_WIDTH;
 if(!max)return 0;
 const screen=x-current;
 const target=screen>288?x-288:screen<192?x-192:current;
 return clamp(reduced?target:current+(target-current)*(1-Math.exp(-12*Math.max(0,dt))),0,max);
}
export const worldToScreen=(x,camera)=>x-camera;
export function pointerWorldX(clientX,rect,camera,w){
 return clampWorldX(w,(clientX-rect.left)/rect.width*VIEW_WIDTH+camera);
}
export function nextArea(w,x,direction){
 return nextNavigationStop(w,x,direction)?.x??x;
}
export function visibleHotspot(h,camera){return h.x+h.w>camera&&h.x<camera+VIEW_WIDTH;}

