import {hasOpening,CORE_SWITCH} from './opening-state.js';
export const openingEnvironment=w=>hasOpening(w)&&['engine','corridor'].includes(w.room);
export const OPENING_WIDTHS=Object.freeze({engine:640,corridor:864});
export const OPENING_PICKUPS=Object.freeze({
 'engine.not':{x:133,y:181,w:41,h:31,walk:153},
 'corridor.and':{x:165,y:146,w:55,h:66,walk:194},
});
export const OPENING_STOPS=Object.freeze({
 engine:[{id:'core',label:'Emergency core',x:94},{id:'blower',label:'Ventilation fan',x:251},{id:'governor',label:'Blower governor',x:354},{id:'pressure',label:'Pressure plant',x:450},{id:'hatch',label:'Maintenance hatch',x:558}],
 corridor:[{id:'entry',label:'Engineering entrance',x:75},{id:'supply',label:'Maintenance supplies',x:194},{id:'monitor',label:'Pressure monitor',x:437},{id:'authorization',label:'Authorization station',x:560},{id:'archive',label:'Secure archive',x:728},{id:'lift',label:'Garden lift',x:806}],
});
export const OPENING_HOTSPOTS=Object.freeze({
 engine:[CORE_SWITCH,{id:'fan',label:'Ventilation turbine',x:190,y:77,w:130,h:132,walk:251},{id:'sensor',label:'Scorched signal sensor',x:330,y:148,w:25,h:40,walk:342},{id:'vent-panel',label:'Ventilation circuit box',x:365,y:124,w:49,h:59,walk:354},{id:'gauge',label:'Pressure gauge',x:423,y:62,w:52,h:52,walk:450},{id:'locker',label:'Engineer’s locker',x:486,y:165,w:48,h:47,walk:505},{id:'engine-door',label:'Maintenance hatch',x:552,y:84,w:80,h:127,walk:558}],
 corridor:[{id:'return',label:'Return to engine room',x:6,y:78,w:58,h:136,walk:75},{id:'pressure',label:'Pressure safety sensor',x:419,y:111,w:40,h:45,walk:437},{id:'security-panel',label:'Interlock service cover',x:480,y:154,w:45,h:54,walk:495},{id:'reader',label:'Authorization reader',x:548,y:128,w:33,h:50,walk:560},{id:'security-door',label:'Security bulkhead',x:671,y:78,w:92,h:134,walk:650},{id:'archive',label:'Maintenance archive (optional)',x:716,y:128,w:29,h:38,walk:728},{id:'onward',label:'Crew-deck lift',x:779,y:111,w:72,h:98,walk:806}],
});
