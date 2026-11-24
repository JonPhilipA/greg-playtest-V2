import {DOOR_CENTERS,doorHotspot} from './room-door-layout.js';
export const WORKSHOP_WIDTH=1152;
export const WORKSHOP_HOTSPOTS=Object.freeze([
 doorHotspot(DOOR_CENTERS.workshopBack,'back','Return to Life-Support Garden',76),
 {id:'repair-nandnot',label:'Lighting inverter service cover',x:424,y:126,w:46,h:66,walk:415},
 {id:'repair-nandand',label:'Entrance AND latch service cover',x:493,y:137,w:48,h:65,walk:486},
 {id:'machine-info',label:'Workshop electrical distribution',x:209,y:74,w:196,h:123,walk:285},
 {id:'fabricator',label:'Component fabricator',x:662,y:75,w:285,h:126,walk:778},
 {id:'repair-nandor',label:'Forward OR latch service cover',x:973,y:135,w:48,h:66,walk:970},
 doorHotspot(DOOR_CENTERS.workshopForward,'forward','Listening Gallery entrance',1048),
]);
export const WORKSHOP_CACHE={x:121,y:116,w:71,h:88,walk:158};

