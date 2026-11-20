import {CAMPAIGN_GALLERY_ENVIRONMENT} from './development-environments.js';
export const GALLERY_HOTSPOTS=Object.freeze([
 {id:'back',label:'Return to NAND Workshop',x:10,y:79,w:62,h:132,walk:70},
 {id:'repair-sensordiff',label:'Conflicting sensor receiver · P09',x:101,y:65,w:292,h:75,walk:265},
 {id:'repair-xorfab',label:'NAND signal-processing bench · P10',x:299,y:147,w:94,h:58,walk:352},
 {id:'repair-cryo_signed',label:'Cryogenic temperature decoder · P11',x:448,y:77,w:111,h:128,walk:505},
 {id:'repair-hull',label:'Hull sensor voter · P12',x:562,y:77,w:118,h:128,walk:622},
 {id:'signed-binary',label:'Signed Binary Tutorial · binary-data workstation',x:720,y:76,w:225,h:53,walk:828},
 {id:'repair-pressure_width',label:'Pressure register · P13',x:720,y:132,w:130,h:73,walk:786},
 {id:'repair-adc_precision',label:'ASCII Transmission Terminal · Unnumbered',x:994,y:146,w:116,h:58,walk:1052},
 {id:'repair-log_overflow',label:'Navigation logging machinery · P14',x:1115,y:146,w:166,h:58,walk:1195},
 {id:'watch-record',label:'Gallery watch record (optional)',x:1286,y:153,w:40,h:48,walk:1302},
 ...CAMPAIGN_GALLERY_ENVIRONMENT.hotspots.filter(h=>['preview-window','preview-exit'].includes(h.id)).map(h=>({...h,id:h.id==='preview-exit'?'gallery-exit':h.id.replace('preview-','planned-'),label:h.id==='preview-exit'?'Computation Lab · not yet available':h.label})),
]);
