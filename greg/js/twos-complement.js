// Fixed-width negation is separate from the earlier signed-interpretation lesson.
export const CONVERTER_ID='twos_complement';
export const CONVERTER_SAMPLES=Object.freeze([3,5,2]);
export const CONVERTER_DIALOGUE=Object.freeze({
 intro0:"Now that you understand binary addition, there's another trick I should show you.",
 intro1:"Computers can represent negative numbers using two's complement.",
 intro2:"To negate a number, invert its bits and add 1. Let's try it.",
 inverted:"We've inverted the bits, but we're not finished.",
 explained:"That's negative three in four-bit two's complement. Invert every bit, then add 1. Any carry beyond four bits is discarded."
});
export const converterSigned=bits=>bits>=8?bits-16:bits;
export const freshConverter=()=>({stage:0,step:'intro0',bits:3,proofs:[]});
export const converterCircuit=()=>({nodes:[],wires:[],configuration:freshConverter()});
export function validateConverter(c){
 if(!c||Object.keys(c).sort().join(',')!=='bits,proofs,stage,step'||!Number.isInteger(c.stage)||c.stage<0||c.stage>2||!Array.isArray(c.proofs)||c.proofs.length>3||!Number.isInteger(c.bits)||c.bits<0||c.bits>15)throw Error('Invalid converter checkpoint.');
 const n=CONVERTER_SAMPLES[c.stage],expected=c.step==='complete'?3:c.stage;
 if(c.proofs.length!==expected||c.proofs.some((v,i)=>v!==((~CONVERTER_SAMPLES[i]+1)&15)))throw Error('Invalid converter evidence.');
 const allowed=c.stage===0?['intro0','intro1','intro2','invert','inverted','add','explained','verify']:['invert','add','verify',...(c.stage===2?['complete']:[])];
 const bits=['intro0','intro1','intro2','invert'].includes(c.step)?n:['inverted','add'].includes(c.step)?n^15:(~n+1)&15;
 if(!allowed.includes(c.step)||bits!==c.bits)throw Error('Invalid converter sequence or register.');return true;
}
export function advanceConverter(current,action){
 validateConverter(current);const c=structuredClone(current);
 if(c.step==='complete')throw Error('The converter is verified. Engage the system or close the panel.');
 if(action==='continue'){
  const next={intro0:'intro1',intro1:'intro2',intro2:'invert',inverted:'add',explained:'verify'}[c.step];
  if(!next)throw Error('Operate the physical converter control before continuing.');c.step=next;
 }else if(action==='invert'){
  if(c.step!=='invert')throw Error('Invert once, then add 1.');c.bits^=15;c.step=c.stage===0?'inverted':'add';
 }else if(action==='add'){
  if(c.step!=='add')throw Error('Invert all four bits before adding 1.');c.bits=(c.bits+1)&15;c.step=c.stage===0?'explained':'verify';
 }else if(action==='verify'){
  if(c.step!=='verify'||converterSigned(c.bits)!==-CONVERTER_SAMPLES[c.stage])throw Error('Complete inversion and addition before verifying the result.');
  c.proofs.push(c.bits);if(c.stage===2)c.step='complete';else{c.stage++;c.bits=CONVERTER_SAMPLES[c.stage];c.step='invert';}
 }else throw Error('Unknown converter control.');validateConverter(c);return c;
}
export function converterTest(c){
 try{validateConverter(c);const rows=CONVERTER_SAMPLES.map((n,i)=>({inputs:{positive:n},expected:{value:-n},actual:{value:c.proofs[i]===undefined?null:converterSigned(c.proofs[i])},pass:c.proofs[i]!==undefined&&converterSigned(c.proofs[i])===-n,label:'Negate +'+n}));return {rows,pass:c.step==='complete'&&rows.every(r=>r.pass),error:c.step==='complete'?null:'Complete all three physical conversions before engagement.'};}
 catch(e){return {pass:false,rows:[],error:e.message};}
}
export const CONVERTER_SPEC={id:CONVERTER_ID,room:'computation',title:"Two's Complement Converter",short:"two's complement converter",plate:'COMPUTATION LAB / P18',inputs:[],outputs:[],gates:[],source:{},spec:'Invert all four bits, then add 1 · signed range −8 to +7',problem:'Convert positive values to their additive inverses using the physical INVERT BITS and ADD 1 controls.',explanation:"In four-bit two's complement, negate a value by inverting every bit and adding 1, discarding carry beyond four bits. +3: 0011 → 1100 → 1101 = −3. The signed range is −8 to +7. The most negative value, −8, has no positive counterpart in this width.",hints:['Invert every bit first.','Add 1 only after inversion. Keep four bits; discard any extra carry.'],restored:'Negation calibrated. Build subtraction by adding a negative value at P19.'};
