/** Pure circuit model. Wires carry unsigned bit values; widths are checked at both ends. */
const bit = name => ({ name, width: 1 });
const bus = name => ({ name, width: 4 });
const binary = fn => ({ inputs: [bit('A'), bit('B')], outputs: [bit('Y')], compute: ([a,b]) => [Number(fn(!!a, !!b))] });
export const TYPES = {
  AND: binary((a,b) => a && b), OR: binary((a,b) => a || b),
  NAND: binary((a,b) => !(a && b)), NOR: binary((a,b) => !(a || b)),
  XOR: binary((a,b) => a !== b), XNOR: binary((a,b) => a === b),
  NOT: { inputs: [bit('A')], outputs: [bit('Y')], compute: ([a]) => [Number(!a)] },
  DFF: { inputs: [bit('D'), bit('CLK')], outputs: [bit('Q')], sequential: true },
  ADD4: { inputs: [bus('A'), bus('B')], outputs: [bus('SUM'), bit('C')], compute: ([a,b]) => rippleAdd(a,b) },
  XOR4: { inputs: [bus('A'), bus('B')], outputs: [bus('Y')], compute: ([a,b]) => [a ^ b] },
  MUX4: { inputs: [bus('A'), bus('B'), bit('S')], outputs: [bus('Y')], compute: ([a,b,s]) => [s ? b : a] },
};
export function fullAdder(a,b,cin) {const p=a^b;return [p^cin,(a&b)|(cin&p)];}
export function rippleAdd(a,b,carryIn=0) {
  let sum=0, carry=carryIn;
  for(let i=0;i<4;i++) {
    const [s,c]=fullAdder((a>>i)&1,(b>>i)&1,carry);
    sum |= s<<i;carry=c;
  }
  return [sum,carry];
}
export function ports(node) {
  if(node.type==='INPUT') return { inputs:[], outputs:[{name:node.label, width:node.width||1}] };
  if(node.type==='OUTPUT') return { inputs:[{name:node.label, width:node.width||1}], outputs:[] };
  if(!TYPES[node.type]) throw new CircuitError(`Unknown component: ${node.type}.`);
  return TYPES[node.type];
}
export class CircuitError extends Error { constructor(message){super(message); this.name='CircuitError';} }
export function validate(circuit,{partial=false}={}) {
  const nodes=new Map();
  for(const n of circuit.nodes) {
    if(nodes.has(n.id)) throw new CircuitError(`Duplicate component ID: ${n.id}.`);
    nodes.set(n.id,n); ports(n);
  }
  const incoming=new Map();
  for(const w of circuit.wires) {
    const src=nodes.get(w.from), dst=nodes.get(w.to);
    if(!src||!dst) throw new CircuitError('A wire points to a missing component.');
    const out=ports(src).outputs[w.out], input=ports(dst).inputs[w.in];
    if(!out||!input) throw new CircuitError('Invalid pin. Connect an output to an input.');
    if(out.width!==input.width) throw new CircuitError(`Signal width mismatch: ${out.width}-bit → ${input.width}-bit.`);
    const key=`${w.to}:${w.in}`;
    if(incoming.has(key)) throw new CircuitError(`${dst.label||dst.type}: an input can have only one driver.`);
    incoming.set(key,w);
  }
  for(const n of nodes.values()) for(let i=0;i<ports(n).inputs.length;i++) {
    if(!partial&&!incoming.has(`${n.id}:${i}`)) throw new CircuitError(`${n.label||n.type}: connect input ${ports(n).inputs[i].name}.`);
  }
  return {nodes,incoming};
}
/** DFF outputs cut the dependency graph. Only combinational cycles are forbidden. */
export function evaluate(circuit, inputs={}, state={}, {partial=false}={}) {
  const {nodes,incoming}=validate(circuit,{partial}), values=new Map(), visiting=new Set();
  function read(id) {
    if(values.has(id)) return values.get(id);
    const n=nodes.get(id);
    if(visiting.has(id)) throw new CircuitError('Combinational feedback loop. Put a flip-flop in the feedback path.');
    visiting.add(id);
    let result;
    if(n.type==='INPUT') result=[Number(inputs[id] ?? n.value ?? 0) & ((1<<(n.width||1))-1)];
    else if(n.type==='DFF') result=[state[id]?.q ?? 0];
    else {
      const args=ports(n).inputs.map((_,i)=> {const w=incoming.get(`${id}:${i}`);return w ? read(w.from)[w.out] : null;});
      result=n.type==='OUTPUT' ? args : args.some(v=>v===null) ? ports(n).outputs.map(()=>null) : TYPES[n.type].compute(args);
    }
    visiting.delete(id); values.set(id,result); return result;
  }
  for(const id of nodes.keys()) read(id);
  const outputs={};
  for(const n of nodes.values()) if(n.type==='OUTPUT') outputs[n.id]=values.get(n.id)[0];
  return {values,outputs};
}
/** Sample every DFF against the same old state, then commit together on rising edges. */
export function step(circuit,inputs={},state={}) {
  const before=evaluate(circuit,inputs,state), {incoming}=validate(circuit), next={...state};
  for(const n of circuit.nodes.filter(n=>n.type==='DFF')) {
    const d=incoming.get(`${n.id}:0`), clk=incoming.get(`${n.id}:1`);
    const clock=before.values.get(clk.from)[clk.out], old=state[n.id]||{q:0,clock:0};
    next[n.id]={q:!old.clock&&clock ? before.values.get(d.from)[d.out] : old.q, clock};
  }
  return {state:next,...evaluate(circuit,inputs,next)};
}
export function pulse(circuit,inputs={},state={}) {
  const clock=circuit.nodes.find(n=>n.type==='INPUT'&&n.role==='clock');
  if(!clock) throw new CircuitError('This panel has no clock source.');
  let r=step(circuit,{...inputs,[clock.id]:0},state);
  r=step(circuit,{...inputs,[clock.id]:1},r.state);
  return step(circuit,{...inputs,[clock.id]:0},r.state);
}
export function connect(circuit,wire) {
  const src=circuit.nodes.find(n=>n.id===wire.from),dst=circuit.nodes.find(n=>n.id===wire.to);
  if(!src||!dst) throw new CircuitError('Component not found.');
  const out=ports(src).outputs[wire.out],input=ports(dst).inputs[wire.in];
  if(!out||!input) throw new CircuitError('Select an output pin, then an input pin.');
  if(out.width!==input.width) throw new CircuitError(`Use a ${input.width}-bit signal for this input.`);
  // Rewiring an occupied destination replaces its old wire; fan-out remains unlimited.
  circuit.wires=circuit.wires.filter(w=>!(w.to===wire.to&&w.in===wire.in));
  circuit.wires.push({...wire,id:wire.id||`w${Date.now()}-${Math.random().toString(16).slice(2)}`});
}
