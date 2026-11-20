import {CONVERTER_ID,CONVERTER_SPEC,converterCircuit,validateConverter,converterTest} from './twos-complement.js';
import {GALLERY_DATA_IDS,GALLERY_DATA_SPECS,galleryDataCircuit,validateGalleryData,galleryDataTest} from './gallery-data.js';
// A historical firewall graph remains the legacy circuit case, never a status console.
export const DATA_IDS=Object.freeze([CONVERTER_ID,'cryo_signed','pressure_width','firewall',...GALLERY_DATA_IDS]);
export const isDataConsole=(id,graph)=>DATA_IDS.includes(id)&&(id!=='firewall'||graph===undefined||!!graph.configuration);
export const decodeByte=(raw,signed)=>signed&&raw>=128?raw-256:raw;
export const bitWeights=signed=>[signed?-128:128,64,32,16,8,4,2,1];
export const pressureReading=(pressure,width)=>({stored:pressure%(2**width),maximum:2**width-1,overflow:pressure>2**width-1});
export const DATA_SPECS={
 [CONVERTER_ID]:CONVERTER_SPEC,
 cryo_signed:{id:'cryo_signed',console:'decoder',room:'sensors',title:'Cryogenic Temperature Decoder',short:'cryogenic temperature decoder',plate:'KESTREL / P11 · DATA INTERPRETATION',inputs:[],outputs:[],gates:[],source:{},spec:'Same eight bits · two equipment types',problem:'G.R.E.G.: The cryogenic monitor reports an impossible temperature. The raw bits are intact. Check how this instrument interprets them.',explanation:'Unsigned eight-bit values span 0–255. Signed eight-bit two’s-complement values span −128–127: the most significant bit has weight −128 instead of +128. The computer’s data type determines the interpretation; the stored bits stay the same.',hints:['Compare the displayed reading with the equipment’s operating range.','Changing interpretation leaves all eight stored bits intact.','Compare the visible bit weights to see how the most significant bit contributes to the value.'],restored:'The same bits now mean the right thing for each instrument. Temperature and speed are trustworthy again.'},
 pressure_width:{id:'pressure_width',console:'register',room:'sensors',title:'Pressure Register',short:'pressure register',plate:'KESTREL / P13 · STORAGE CAPACITY',inputs:[],outputs:[],gates:[],source:{},spec:'Store 0–300 kPa · use the smallest sufficient width',problem:'G.R.E.G.: This pressure monitor needs to record values as high as 300 kPa. Its current register can’t store the full range.',explanation:'Each extra bit doubles the possible patterns. An unsigned n-bit register has 2^n states and maximum 2^n − 1. Eight bits lose the upper part of 300, storing 44; nine bits retain all readings through 300.',hints:['Compare the maximum value with the full required range, including 300.','Try 256 and 300 kPa at each width. Watch the stored value and overflow lamp.','Choose the smallest width that passes every reading. Extra unused capacity does not meet this engineering constraint.'],restored:'The pressure monitor retains its full range in the smallest sufficient register.'}
};
Object.assign(DATA_SPECS,GALLERY_DATA_SPECS);
export function dataCircuit(id){if(id===CONVERTER_ID)return converterCircuit();if(id==='firewall'||GALLERY_DATA_IDS.includes(id))return galleryDataCircuit(id);if(!isDataConsole(id))throw Error('Unknown data console.');return {nodes:[],wires:[],configuration:id==='cryo_signed'?{temperature:'unsigned',speed:'signed'}:{width:8}};}
export function validateDataShape(id,graph){
 if(!graph||graph.nodes?.length!==0||graph.wires?.length!==0)throw Error('Use the original console controls; this equipment does not accept loose gates.');
 const c=graph.configuration;
 if(!c||typeof c!=='object'||Array.isArray(c))throw Error('Console configuration is missing.');
 const keys=Object.keys(c).sort().join(',');
 if(id===CONVERTER_ID)return validateConverter(c);
 if(id==='firewall'||GALLERY_DATA_IDS.includes(id))return validateGalleryData(id,c);
 if(id==='cryo_signed'){if(keys!=='speed,temperature'||![c.temperature,c.speed].every(v=>['signed','unsigned'].includes(v)))throw Error('Select a valid interpretation for both channels.');}
 else if(id==='pressure_width'){if(keys!=='width'||![8,9,10].includes(c.width))throw Error('Select an offered register width.');}
 else throw Error('Unknown data console.');
 return c;
}
export function testDataConfiguration(id,graph){if(id===CONVERTER_ID)return converterTest(graph.configuration);
 const rows=[];try{const c=validateDataShape(id,graph);if(id==='firewall'||GALLERY_DATA_IDS.includes(id))return galleryDataTest(id,c);
  if(id==='cryo_signed')for(const [channel,signed,unit]of [['temperature',true,'°C'],['speed',false,'RPM']]){const expected={value:decodeByte(246,signed)},actual={value:decodeByte(246,c[channel]==='signed')};rows.push({inputs:{channel,raw:246},expected,actual,pass:c[channel]===(signed?'signed':'unsigned'),label:channel==='temperature'?'Cryogenic temperature · signed °C':'Equipment speed · unsigned RPM',unit});}
  else for(const pressure of [254,255,256,300]){const r=pressureReading(pressure,c.width);rows.push({inputs:{pressure},expected:{value:pressure,width:9},actual:{value:r.stored,width:c.width},pass:!r.overflow&&c.width===9,label:pressure+' kPa'});}
  const pass=rows.every(r=>r.pass);return {pass,rows,error:pass?null:id==='cryo_signed'?'Check each channel’s equipment type. Temperature must be signed; speed must be unsigned.':c.width===10?'All readings fit, but ten bits exceeds the minimum-width requirement. Choose the smallest sufficient register.':'Eight bits stop at 255. Readings above that range lose information; expand the register.'};
 }catch(e){return {pass:false,rows,error:e.message};}
}
