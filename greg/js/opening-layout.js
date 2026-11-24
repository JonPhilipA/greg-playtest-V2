import {DOOR_CENTERS,GARDEN_INTERLOCK,doorHotspot} from './room-door-layout.js';
import {hasOpening,CORE_SWITCH} from './opening-state.js';
export const openingEnvironment=w=>w.room==='corridor'||hasOpening(w)&&w.room==='engine';
export const OPENING_WIDTHS=Object.freeze({engine:640,corridor:864});
export const OPENING_PICKUPS=Object.freeze({
 'engine.not':{x:133,y:181,w:41,h:31,walk:153},
 'corridor.and':{x:165,y:146,w:55,h:66,walk:194},
});
export const OPENING_STOPS=Object.freeze({
 engine:[{id:'core',label:'Emergency core',x:94},{id:'blower',label:'Ventilation fan',x:251},{id:'governor',label:'Blower governor',x:354},{id:'pressure',label:'Pressure plant',x:450},{id:'hatch',label:'Maintenance hatch',x:558}],
 corridor:[{id:'entry',label:'Engineering entrance',x:75},{id:'supply',label:'Maintenance supplies',x:194},{id:'monitor',label:'Pressure monitor',x:355},{id:'authorization',label:'Garden interlock',x:GARDEN_INTERLOCK.panel.walk},{id:'life-support',label:'Life Support entrance',x:806}],
});
export const OPENING_HOTSPOTS=Object.freeze({
 engine:[CORE_SWITCH,{id:'fan',label:'Ventilation turbine',x:190,y:77,w:130,h:132,walk:251},{id:'sensor',label:'Scorched signal sensor',x:330,y:148,w:25,h:40,walk:342},{id:'vent-panel',label:'Ventilation circuit box',x:365,y:124,w:49,h:59,walk:354},{id:'gauge',label:'Pressure gauge',x:423,y:62,w:52,h:52,walk:450},doorHotspot(DOOR_CENTERS.engine,'engine-door','Maintenance hatch',558)],
 corridor:[
  doorHotspot(DOOR_CENTERS.corridorBack,'return','Return to engine room',75),
  {id:'pressure',label:'Pressure safety sensor',x:340,y:104,w:42,h:56,walk:355},
  {id:'security-panel',label:'Garden authorization control box',...GARDEN_INTERLOCK.panel},
  {id:'reader',label:'Engineering authorization monitor',...GARDEN_INTERLOCK.reader},
  doorHotspot(DOOR_CENTERS.corridorGarden,'onward','Life-Support Garden entrance',806),
 ],
});
