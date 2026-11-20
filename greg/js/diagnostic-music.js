/** Shared musical plans for the existing Audio engine. Seconds, Hz and linear envelope gains. */
export const SFX_GAIN_BOOST=1.45;
const MAJOR_STEPS=Object.freeze([0,2,4,5,7,9,11,12,14,16,17,19,21,23,24,26]);
export const midiFrequency=midi=>440*2**((midi-69)/12);
export function diagnosticRowNote(index,count,intervalMs=180){
 const total=Math.max(1,Math.min(16,Math.trunc(count)||1)),i=Math.max(0,Math.min(total-1,Math.trunc(index)||0));
 const step=total===1?0:Math.round(i*Math.min(15,total+2)/(total-1));
 return {frequency:midiFrequency(48+MAJOR_STEPS[step]),start:0,duration:Math.min(.1,Math.max(.022,intervalMs*.00072)),gain:.055*SFX_GAIN_BOOST,type:'triangle'};
}
export function diagnosticSuccessNotes(){
 return [{midi:72,start:0,duration:.11,gain:.15},{midi:76,start:.12,duration:.13,gain:.17},{midi:79,start:.26,duration:.36,gain:.18}].map(({midi,...note})=>({...note,frequency:midiFrequency(midi),gain:note.gain*SFX_GAIN_BOOST,type:'sine'}));
}
