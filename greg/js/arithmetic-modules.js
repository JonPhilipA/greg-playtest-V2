import {TYPES,rippleAdd,fullAdder} from './simulator.js';
// Register the Lab's bus casings through the existing extensible type table.
// Their arithmetic delegates to the original ripple adder; the simulator stays intact.
TYPES.FAN4={inputs:[{name:'SUB',width:1}],outputs:[{name:'MASK',width:4}],compute:([sub])=>[sub?15:0]};
TYPES.ADD4C={inputs:[{name:'A',width:4},{name:'B',width:4},{name:'Cin',width:1}],outputs:[{name:'SUM',width:4},{name:'C',width:1}],compute:([a,b,cin])=>rippleAdd(a,b,cin)};
TYPES.FA1={inputs:['A','B','Cin'].map(name=>({name,width:1})),outputs:['S','Cout'].map(name=>({name,width:1})),compute:([a,b,c])=>fullAdder(a,b,c)};
TYPES.BITS4={inputs:[{name:'BUS',width:4}],outputs:[0,1,2,3].map(i=>({name:'b'+i,width:1})),compute:([v])=>[0,1,2,3].map(i=>(v>>i)&1)};
for(const bits of [2,4])TYPES['SUM'+bits]={inputs:Array.from({length:bits},(_,i)=>({name:'S'+i,width:1})),outputs:[{name:'SUM',width:4}],compute:values=>[values.reduce((n,v,i)=>n|(v<<i),0)]};
TYPES.ZERO={inputs:[],outputs:[{name:'C0',width:1}],compute:()=>[0]};
