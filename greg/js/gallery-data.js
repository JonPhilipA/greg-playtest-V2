// Bounded educational equipment models. No C execution or physical gate ownership.
export const GALLERY_DATA_IDS=Object.freeze(['adc_precision','log_overflow']);
export const STATUS_SYSTEMS=Object.freeze(['Antenna','Communications','Hull','Cooling','Engine','Radiation','Pressure','Auxiliary']);
export const binaryByte=n=>n.toString(2).padStart(8,'0');
export const asciiCharacter=n=>n===0?'\\0':n===32?'SPACE':String.fromCharCode(n);
export function boundedMessage(bytes){const end=bytes.indexOf(0);return String.fromCharCode(...bytes.slice(0,end<0?bytes.length:end));}
export const INTEGER_TYPES=Object.freeze({uint8_t:{bits:8,signed:false,min:0,max:255},int8_t:{bits:8,signed:true,min:-128,max:127},uint16_t:{bits:16,signed:false,min:0,max:65535},int16_t:{bits:16,signed:true,min:-32768,max:32767}});
export function storedInteger(value,type){const t=INTEGER_TYPES[type];if(!t||!Number.isSafeInteger(value))throw Error('Invalid integer storage request.');const fits=value>=t.min&&value<=t.max;return {value:t.signed?(fits?value:null):((value%(2**t.bits))+2**t.bits)%(2**t.bits),fits,...t};}
const base=(id,number,title,problem,spec,explanation,hints,restored)=>({id,console:'gallery-data',room:'sensors',title,short:title,plate:'KESTREL / P'+number+' · DATA SYSTEMS',inputs:[],outputs:[],gates:[],source:{},problem,spec,explanation,hints,restored});
export const GALLERY_DATA_SPECS={
 firewall:base('firewall',14,'Sensor Status Decoder','G.R.E.G.: Eight systems share this status byte. Isolate only Hull and Cooling warnings, then repair the Cooling flag setter.','ISOLATE HULL + COOLING · THEN SET COOLING',
  'A byte can hold eight independent flags. Bitwise AND (&) keeps selected bit positions; bitwise OR (|) sets selected bits without clearing others. These are bitwise operators, not logical && or ||.',
  ['Match each requested system to its labeled bit position.','AND keeps a position only when its mask bit is 1. OR forces mask positions ON.','Hull is b5 and Cooling is b4. The setter must affect only Cooling.'], 'STATUS MONITOR RESTORED'),
 adc_precision:base('adc_precision',14,'Corrupted Transmission','G.R.E.G.: The header says GO, but the receiver prints GO!XY. Inspect the bytes, then repair the bounded character buffer.','DECODE A CHARACTER · TERMINATE THE MESSAGE GO',
  "In this lesson, bytes and char are eight bits and character codes use ASCII. Each char stores a character code. A C string ends at its first null byte ('\\0', code 0). Printable '0' is code 48. Our six-byte buffer has a defined final terminator; reading outside a real array is not modeled or safe.",
  ['Select each stored byte and compare its binary, decimal, and character views.','The header expects two letters. The following slot should end the string.','Null is 00000000. Printable zero is 00110000; a space is 00100000.'], 'TRANSMISSION DECODER RESTORED'),
 log_overflow:base('log_overflow',14,'Navigation Log Overflow','G.R.E.G.: The calculation is correct; the saved value is wrong. Choose the smallest offered unsigned storage type for every result from 0 to 300.','PRESERVE 0–300 · SMALLEST SUITABLE UNSIGNED TYPE',
  'Lesson target: 32-bit int, eight-bit bytes, and C17 conversion rules. The int constants 250 + 10 evaluate to 260 before storage. uint8_t conversion reduces 260 modulo 256 to 4. uint16_t retains it. Out-of-range conversion to a signed type is implementation-defined in this model; no portable result is promised. Signed arithmetic overflow is undefined behavior, not guaranteed wraparound.',
  ['Follow the pipeline: does the value change during calculation or storage?','Eight unsigned bits stop at 255. Signed types do not meet this equipment specification.','Compare the two unsigned options. Pick the smallest one whose maximum reaches 300.'], 'NAVIGATION LOGGING RESTORED')
};
export function galleryDataCircuit(id){const configuration=id==='firewall'?{isolateMask:0,setMask:0}:id==='adc_precision'?{recognition:0,bytes:[71,79,33,88,89,0]}:id==='log_overflow'?{type:'uint8_t'}:null;if(!configuration)throw Error('Unknown Gallery data console.');return {nodes:[],wires:[],configuration};}
export function validateGalleryData(id,c){
 const keys=Object.keys(c).sort().join(',');
 if(id==='firewall'){if(keys!=='isolateMask,setMask'||![c.isolateMask,c.setMask].every(v=>Number.isInteger(v)&&v>=0&&v<=255))throw Error('Masks must be eight-bit values.');}
 else if(id==='adc_precision'){if(keys!=='bytes,recognition'||![0,48,71,79].includes(c.recognition)||!Array.isArray(c.bytes)||c.bytes.length!==6||c.bytes.some(n=>!Number.isInteger(n)||n<0||n>127)||c.bytes[5]!==0)throw Error('Use the six-byte ASCII buffer and its protected final null byte.');}
 else if(id==='log_overflow'){if(keys!=='type'||!Object.hasOwn(INTEGER_TYPES,c.type))throw Error('Choose an offered integer storage type.');}
 else throw Error('Unknown Gallery data console.');return c;
}
export function galleryDataRows(id,c,stage=null){
 validateGalleryData(id,c);const rows=[];
 if(id==='firewall'){
  // Exhaust all bytes, including flags absent in the example. A coincidental output is insufficient.
  for(const operation of stage?[stage]:['isolate','set'])for(let status=0;status<256;status++){const isolate=operation==='isolate',mask=isolate?c.isolateMask:c.setMask,expected=isolate?status&48:status|16,actual=isolate?status&mask:status|mask;rows.push({inputs:{status,operation},expected:{value:expected},actual:{value:actual},pass:actual===expected,label:(isolate?'AND':'OR')+' '+binaryByte(status)});}
 }else if(id==='adc_precision'){
  if(!stage||stage==='encoding')rows.push({inputs:{binary:'01001111'},expected:{value:79},actual:{value:c.recognition},pass:c.recognition===79,label:'ASCII recognition · O'});
  if(!stage||stage==='buffer'){const expected=[71,79,0,88,89,0];for(let i=0;i<6;i++)rows.push({inputs:{index:i},expected:{value:expected[i]},actual:{value:c.bytes[i]},pass:c.bytes[i]===expected[i],label:'Buffer ['+i+'] · '+(i===2?'null terminator':'preserve stored byte')});}
 }else for(const [a,b]of [[0,0],[120,7],[245,10],[250,6],[250,10],[290,10]]){const value=a+b,saved=storedInteger(value,c.type);rows.push({inputs:{a,b},expected:{value,type:'uint16_t'},actual:{value:saved.value,type:c.type},pass:!saved.signed&&saved.fits&&saved.value===value,label:a+' + '+b+' → '+(saved.value===null?'no portable signed value':saved.value)});}
 return rows;
}
export function galleryDataTest(id,c,stage=null){try{const rows=galleryDataRows(id,c,stage),pass=rows.length>0&&rows.every(r=>r.pass);return {pass,rows,error:pass?null:id==='firewall'?'Keep exactly the requested bit positions. Other active or inactive flags must not leak through.':id==='adc_precision'?"Match the ASCII code, put null after GO, and preserve every other byte. '0' and SPACE do not terminate the message.":'Select the smallest offered unsigned type that preserves every result through 300.'};}catch(e){return {pass:false,rows:[],error:e.message};}}
