// Reference demonstrations are local UI state, never inventory or fabrication authority.
const lesson=(id,inputs,outputs,explanation,evaluate,extra={})=>Object.freeze({id,name:id+' Gate',symbol:id,inputs:Object.freeze(inputs),outputs:Object.freeze(outputs),explanation,evaluate,demo:'combinational',...extra});
export const COMPONENT_LESSONS=Object.freeze({
 NOT:lesson('NOT',['A'],['NOT'],'A NOT gate inverts its input: 0 becomes 1, and 1 becomes 0.',({A})=>({NOT:1-A}),{milestones:['ventilation','nandnot']}),
 AND:lesson('AND',['A','B'],['AND'],'An AND gate outputs 1 only when both inputs are 1.',({A,B})=>({AND:A&B}),{milestones:['security','nandand']}),
 OR:lesson('OR',['A','B'],['OR'],'An OR gate outputs 1 when either input, or both inputs, are 1.',({A,B})=>({OR:A|B}),{milestones:['alarm','nandor']}),
 NOR:lesson('NOR',['A','B'],['OR','NOR'],'A NOR gate outputs 1 only when both inputs are 0.',({A,B})=>({OR:A|B,NOR:1-(A|B)}),{construction:'Combine OR followed by NOT. The result is NOR: the inverted output of OR.',comparison:'NOR = NOT OR',milestones:['scrubber']}),
 XOR:lesson('XOR',['A','B'],['XOR'],'XOR = EXCLUSIVE OR. XOR outputs 1 when its inputs are different.',({A,B})=>({XOR:A^B}),{construction:'Four NAND gates form XOR: share NAND(A,B), gate each input with that shared result, then NAND the two branches.',comparison:'XOR = four NAND gates',milestones:['xorfab']}),
 NAND:lesson('NAND',['A','B'],['AND','NAND'],'A NAND gate outputs 0 only when both inputs are 1.',({A,B})=>({AND:A&B,NAND:1-(A&B)}),{construction:'Combine AND followed by NOT. The result is NAND: the inverted output of AND.',comparison:'NAND = NOT AND',milestones:['safetycutoff']}),
});
export const componentLesson=id=>Object.hasOwn(COMPONENT_LESSONS,id)?COMPONENT_LESSONS[id]:null;
export function lessonRows(id){const d=componentLesson(id);if(!d||d.demo!=='combinational')return [];return Array.from({length:2**d.inputs.length},(_,bits)=>{const inputs=Object.fromEntries(d.inputs.map((key,i)=>[key,(bits>>(d.inputs.length-1-i))&1]));return {inputs,outputs:d.evaluate(inputs)};});}
export function lessonFrame(id,inputs){const d=componentLesson(id);if(!d||d.demo!=='combinational')return null;const values=Object.fromEntries(d.inputs.map(key=>[key,Number(inputs[key]===1)]));return {inputs:values,outputs:d.evaluate(values),row:d.inputs.reduce((n,key)=>n*2+values[key],0)};}
export const knownComponentLessons=w=>Object.keys(COMPONENT_LESSONS).filter(id=>w.foundation.components.introduced?.[id]||w.foundation.components.discovered[id]);
