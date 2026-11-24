// Shared world-space anchors for the illustration, recovered notes, and real controls.
export const COMPUTATION_WIDTH=1156;
export const COMPUTATION_AREAS=Object.freeze([
 ['navbits',15,'BINARY ADDITION',100,188],
 ['trajectory',16,'CARRY PROPAGATION',296,384],
 ['ripple_adder',17,'RIPPLE-CARRY ADDITION',492,580],
 ['twos_complement',18,"TWO'S COMPLEMENT",688,776],
 ['addsub',19,'ARITHMETIC PROCESSING',884,972],
].map(([id,number,label,x,walk])=>Object.freeze({id,number,label,x,board:Object.freeze({x,y:65,w:176,h:73}),station:Object.freeze({x:x+8,y:145,w:160,h:44,walk}),scope:Object.freeze({x:x+12,y:151,w:35,h:18})})));
const notes={
  navbits:{title:'BINARY ADDITION',partial:['0 + 0 = 00','0 + 1 = 01','1 + 1 = __','SUM ?   CARRY ?'],full:['0 + 0 = 00','0 + 1 = 01','1 + 0 = 01','1 + 1 = 10','SUM = A XOR B','CARRY = A AND B']},
  trajectory:{title:'WHAT HAPPENS TO THE CARRY?',partial:['A + B + carry-in','01 + 01 = __','NEXT STAGE ← LOW BIT'],full:['0011 + 0001 = 0100','CARRY OUT → CARRY IN','S = A XOR B XOR Cin']},
  ripple_adder:{title:'RIPPLE-CARRY ADDITION',partial:['FA0   FA1   FA2   FA3','Cout → ? Cin','C0 = 0 · S0 S1 S2 S3'],full:['FA0 → FA1 → FA2 → FA3','Cout → next Cin','S[3:0] + C4','ADD4C = FOUR FULL ADDERS']},
  twos_complement:{title:"TWO'S COMPLEMENT",partial:['+5 = 0101','INVERT + ADD 1','0101 → ____ → ____','4-BIT SIGNED · −8 TO +7'],full:['+5 = 0101','INVERT','1010','ADD 1','−5 = 1011','4-BIT SIGNED · −8 TO +7']},
  addsub:{title:'SUBTRACTION THROUGH ADDITION',partial:['A − B = A + (−B)','ONE DATAPATH, TWO JOBS','HOW DO WE NEGATE B?'],full:['A − B = A + (~B) + 1','INVERT B · INITIAL CARRY 1','FOUR-BIT RESULT (mod 16)']},
 };
const states=Object.freeze(Object.fromEntries(Object.entries(notes).map(([id,n])=>[id,Object.freeze([false,true].map(complete=>Object.freeze({id,complete,title:id==='twos_complement'?(complete?"TWO'S COMPLEMENT":'NEGATIVE NUMBERS'):n.title,lines:Object.freeze([...(complete?n.full:n.partial)]),schematic:complete?'recovered':'unfinished'})))])));
export const computationBoard=(w,id)=>states[id]?.[Number(w.machines?.[id]?.certified===true)]||null;
