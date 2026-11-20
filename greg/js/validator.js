import {testRipple} from './ripple-adder.js';
import {isDataConsole,testDataConfiguration} from './data-consoles.js';
import {evaluate,step,pulse} from './simulator.js';
import {combinations} from './puzzles.js';
/** Validate behavior, never the shape or gate arrangement of the player's network. */
export function testCircuit(level,circuit) {
  if(level.id==='ripple_adder')return testRipple(circuit);
  if(isDataConsole(level.id,circuit))return testDataConfiguration(level.id,circuit);
  const rows=[];
  const check=(inputs,expected,actual,label)=>{
    const pass=Object.entries(expected).every(([id,v])=>actual[id]===v);
    rows.push({inputs,expected,actual,pass,label});
  };
  try {
    if(circuit.nodes.some(n=>n.faulty))throw Error('A burned component remains. Remove the damaged part and replace it with spare NAND gates.');
    if(circuit.nodes.filter(n=>n.type==='OUTPUT').length!==level.outputs.length)throw Error('This panel has an unexpected number of output terminals. Reset the panel to restore its required contacts.');
    if(level.id==='addsub')for(const type of ['FAN4','XOR4','ADD4C'])if(!circuit.nodes.some(n=>n.type===type))throw Error('This datapath requires CONTROL SPLITTER (FAN4), XOR4 and ADD4C.');
    const allowed=new Set(level.gates);
    for(const n of circuit.nodes) if(!['INPUT','OUTPUT'].includes(n.type)&&!allowed.has(n.type)&&level.existingComponents?.[n.id]!==n.type) throw Error(`${n.type} is not available on this panel.`);
    // Fixed terminals are part of the panel, not editable truth-table metadata.
    for(const n of [...level.inputs,...level.outputs]) {
      const found=circuit.nodes.find(x=>x.id===n.id);
      if(!found||found.type!==n.type||(found.width||1)!==n.width) throw Error('A required panel terminal is missing or changed.');
    }
    if(!level.sequential) {
      for(const inputs of combinations(level)) check(inputs,level.expected(inputs),evaluate(circuit,inputs).outputs,'truth table');
    } else {
      let state={},r;
      const sample=(inputs,expected,label,clock=false)=>{
        r=clock ? pulse(circuit,inputs,state) : step(circuit,inputs,state);
        state=r.state; check(inputs,expected,r.outputs,label);
      };
      if(level.sequential==='register') {
        let stored={Y:0,Z:0};
        sample({A:0,B:0,K:0},stored,'power-on reset');
        for(const [A,B] of [[1,0],[0,1],[1,1],[0,0],[1,0],[1,1]]) {
          sample({A,B,K:0},stored,'data changes, clock LOW');
          stored={Y:A,Z:B}; sample({A,B,K:1},stored,'rising edge captures');
          sample({A:1-A,B:1-B,K:1},stored,'held HIGH retains');
          sample({A:1-A,B:1-B,K:0},stored,'falling edge retains');
        }
      } else if(level.sequential==='counter') {
        sample({K:0},{L:0,H:0},'initial 00');
        for(let cycle=1;cycle<=12;cycle++) {
          const expect={L:cycle%2,H:(cycle>>1)&1};
          sample({K:1},expect,`cycle ${cycle}: rising edge`);
          sample({K:1},expect,'held HIGH: no extra count');
          sample({K:0},expect,'falling edge: retain');
        }
      } else if(level.sequential==='flight-register'){
        let stored={S:0,C:0};sample({A:0,B:0,E:0,K:0},stored,'power-on reset');
        for(const {A,B,E} of combinations(level)){
          sample({A,B,E,K:0},stored,'data changes, clock LOW');stored={S:E&(A^B),C:E&A&B};
          sample({A,B,E,K:1},stored,'rising edge captures armed arithmetic');
          sample({A:1-A,B:1-B,E:1-E,K:1},stored,'held HIGH retains');
          sample({A:1-A,B:1-B,E:1-E,K:0},stored,'falling edge retains');
        }
      } else {
        let stored={S:0,C:0};
        sample({A:0,B:0,E:0,K:0,R:0},{...stored,T:0,M:0},'power-on reset');
        // Exhaust the 4-bit data/control input space and verify edge and hold behavior.
        for(const {A,B,E,R} of combinations(level)) {
          const route={T:E&R,M:E&(1-R)};
          sample({A,B,E,R,K:0},{...stored,...route},'data and route before clock');
          stored={S:E&(A^B),C:E&A&B};
          sample({A,B,E,R,K:1},{...stored,...route},'capture armed arithmetic');
          sample({A:1-A,B:1-B,E,R,K:1},{...stored,...route},'held HIGH retains arithmetic');
          sample({A:1-A,B:1-B,E,R,K:0},{...stored,...route},'falling edge retains arithmetic');
        }
      }
    }
    const pass=rows.every(r=>r.pass);
    return {pass,rows,error:pass?null:`${rows.filter(r=>!r.pass).length} case(s) differ from the required behavior. Select a red row to inspect.`};
  } catch(e) {return {pass:false,rows,error:e.message};}
}
