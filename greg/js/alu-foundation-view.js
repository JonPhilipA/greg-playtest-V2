import {rippleWord} from './ripple-adder.js';
import {rippleBitFace} from './ripple-view.js';
const binary=v=>Number.isInteger(v)?v.toString(2).padStart(4,'0'):'????';
const text=(x,y,content,size=13,color='#e9d3a3',extra='')=>`<text x="${x}" y="${y}" fill="${color}" text-anchor="middle" style="font:600 ${size}px monospace" ${extra}>${content}</text>`;
const word=(values,key)=>rippleWord(Object.fromEntries([...values].map(([id,v])=>[id,v[0]])),key);
export function aluRegisters(values,circuit){let s='<g class="alu-registers" pointer-events="none">';
 for(const [key,x,y]of [['A',28,24],['B',28,330],['C',992,150]]){const v=word(values,key),output=key==='C';
  s+=`<g data-alu-register="${key}"><rect x="${x}" y="${y}" width="184" height="294" rx="9" fill="#233547" stroke="#c0a366" stroke-width="2"/><rect x="${x+7}" y="${y+215}" width="170" height="65" rx="5" fill="#0c1b2b" stroke="#627286"/>`;
  s+=text(x+92,y+26,(output?'OUTPUT ':'INPUT ')+key,16)+text(x+92,y+245,binary(v),30,'#e5f4f5','data-binary="'+key+'"')+text(x+92,y+268,'DECIMAL: '+(v??'—'),15,'#bdd9de');
  if(output)s+=text(x+92,y+312,'SIGNED: '+(v===null?'—':v>7?'−'+(16-v):v),14,'#dbbd86');
  s+=text(x+(output?-25:210),y+116,'4-BIT',10,'#b6cfdd');
  for(let i=0;i<4;i++){const a=x+(output?0:158),b=x+(output?8:184),from=y+67+38*i,end=y+130;s+=`<path d="M${a} ${end} Q${b} ${end} ${b} ${from}" fill="none" stroke="${['#e8b94c','#61a8db','#bd82c6','#db795a'][i]}" stroke-width="2" opacity=".65"/>`;}
  s+='</g>';
 }
 const A=word(values,'A'),B=word(values,'B'),C=word(values,'C'),awire=circuit.wires.find(w=>w.to==='adder'&&w.in===0),bwire=circuit.wires.find(w=>w.to==='adder'&&w.in===1),bnode=circuit.nodes.find(n=>n.id===bwire?.from),cinWire=circuit.wires.find(w=>w.to==='adder'&&w.in===2),cin=values.get(cinWire?.from)?.[cinWire?.out],maskWire=bnode?.type==='XOR4'&&circuit.wires.find(w=>w.to===bnode.id&&w.in===1),mask=maskWire&&values.get(maskWire.from)?.[maskWire.out];
 const originalA=awire?.from==='Abus'&&awire.out===0,binput=bnode?.type==='XOR4'&&circuit.wires.find(w=>w.to===bnode.id&&w.in===0),originalB=bnode?.id==='Bbus'||binput?.from==='Bbus'&&binput.out===0,subtract=originalA&&originalB&&cin===1&&mask===15,add=originalA&&originalB&&cin===0&&(bnode?.id==='Bbus'||mask===0),equation=A===null||B===null||C===null?'CONNECT THE DATA PATH':add?`${A} + ${B} ${A+B>15?'≡':'='} ${C}`:subtract?`${A} − ${B} ${A<B?'≡':'='} ${C}`:'CHECK CONTROL AND CIN';
 s+=text(598,72,'SHARED ARITHMETIC HARDWARE',15)+text(598,105,equation,26,'#e5f4f5')+text(598,128,'4-BIT RESULT · MODULO 16',11,'#a7bdcb');
 // The signed pattern is always separate; equations never promise an unbounded result.
 s+=text(337,563,'SUB · OPERATION CONTROL',12)+text(338,633,'0: ADD / 1: SUBTRACT',11,'#a7bdcb');
 return s+'</g>';
}
export function aluModuleFace(n,values,circuit){const width=n.type==='ADD4C'?224:n.type==='XOR4'?208:144,height=n.type==='FAN4'?140:190;
 const input=i=>{const w=circuit.wires.find(w=>w.to===n.id&&w.in===i);return w?values.get(w.from)?.[w.out]:null;},out=values.get(n.id)?.[0];
 let s=`<rect width="${width}" height="${height}" rx="8" fill="#22384d" stroke="#d1ac64" stroke-width="3"/><rect x="7" y="7" width="${width-14}" height="${height-14}" rx="5" fill="none" stroke="#617184"/>`;
 for(const [x,y]of [[13,13],[width-13,13],[13,height-13],[width-13,height-13]])s+=`<circle cx="${x}" cy="${y}" r="3" fill="#bd9b5e"/>`;
 s+=text(width/2,29,n.type,20);
 if(n.type==='ADD4C'){
  s+=text(width/2,48,'4 × FULL ADDER',11,'#b9ceda');
  for(let i=0;i<4;i++)s+=`<g transform="translate(${22+i*47},71)"><rect width="39" height="44" rx="3" fill="#ad8445" stroke="#f2d597"/>${text(19,18,'FA'+i,11,'#172b3d')}${text(19,34,'+',17,'#172b3d')}</g>`;
  s+=text(width/2,137,'A '+binary(input(0))+' · B '+binary(input(1)),13,'#e5f4f5')+text(width/2,161,'CIN '+(input(2)??'—')+' → SUM '+binary(out),13,'#e5f4f5');
 }else if(n.type==='XOR4'){
  s+=text(width/2,46,'CONDITIONAL INVERTER',11,'#b9ceda');
  for(let i=0;i<4;i++){const value=input(1),b=input(0),v=out;s+=text(width/2,72+i*23,`${b==null?'?':(b>>i)&1}  ⊕  ${value==null?'?':(value>>i)&1}  →  ${v==null?'?':(v>>i)&1}`,16,v==null?'#8fa2b3':'#e8d39b');}
  s+=text(width/2,176,input(1)===0?'PASS B':input(1)===15?'INVERT B':'FOUR XOR CHANNELS',11);
 }else{
  s+=text(width/2,46,'CONTROL SPLITTER',10,'#b9ceda');
  s+=`<path d="M8 70H45M45 62V110M45 62H79M45 78H79M45 94H79M45 110H79" fill="none" stroke="${input(0)===1?'#f1ca73':'#7f94aa'}" stroke-width="3"/>`;
  for(let i=0;i<4;i++)s+=text(105,66+i*16,'SUB'+i+' '+(out==null?'?':(out>>i)&1),11,'#e8d39b','data-fan-lane="'+i+'"');
  s+=text(width/2,129,'ONE CONTROL · FOUR COPIES',8);
 }return s;
}
export const aluBitFace=(n,v)=>`<g transform="scale(.85227 .85)">${rippleBitFace(n,v)}</g>`;
/** Four independently evaluated lanes share a cable, not a single boolean glow. */
export function aluBusCable(a,b,value,curve){let s=`<path d="${curve(a,b)}" fill="none" stroke="#111c2a" stroke-width="18"/>`;
 for(let i=0;i<4;i++){const dy=(i-1.5)*3.5,bit=value==null?null:(value>>i)&1;s+=`<path data-bus-lane="${i}" data-bit="${bit??'unknown'}" d="${curve({...a,y:a.y+dy},{...b,y:b.y+dy})}" fill="none" stroke="${['#edb84c','#62aee0','#c185d2','#e37e61'][i]}" stroke-width="2.6" opacity="${bit===null?.35:bit?.98:.55}"/>`;}
 return s;
}
