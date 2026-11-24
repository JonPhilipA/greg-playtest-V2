import {mechanicalToggle} from './mechanical-toggle.js';
import {evaluate} from './simulator.js';
import {rippleWord,rippleInputs,legacyRipple} from './ripple-adder.js';
const text=(s,x,y,size=16,color='#e9dfc7')=>`<text x="${x}" y="${y}" text-anchor="middle" fill="${color}" style="font:bold ${size}px Arial,sans-serif">${s}</text>`;
export function rippleRegisterHousings(values,{signed=false}={}){
 let html='';
 for(const [name,x,y]of [['A',28,28],['B',28,300],['C',992,150]]){
  const bits=Object.fromEntries(Array.from({length:4},(_,i)=>[name+i,values.get(name+i)?.[0]])),word=rippleWord(bits,name),binary=[3,2,1,0].map(i=>bits[name+i]??'?').join('');
  const interpreted=signed&&name==='C',height=interpreted?282:258,reading=interpreted?name+' = '+binary:name+' = '+binary+' ('+(word??'—')+')';
  html+=`<g class="ripple-register" data-register="${name}" role="group" aria-label="${name==='C'?'OUTPUT':'INPUT'} ${name}"><rect x="${x+3}" y="${y+4}" width="184" height="${height}" rx="6" fill="#101c28"/><rect x="${x}" y="${y}" width="184" height="${height}" rx="6" fill="#394b5c" stroke="#a08a60" stroke-width="2"/><rect x="${x+7}" y="${y+7}" width="170" height="31" rx="3" fill="#182c3e"/>${text((name==='C'?'OUTPUT ':'INPUT ')+name,name==='A'?x+48:x+92,y+29,name==='A'?14:18)}<rect x="${x+8}" y="${y+226}" width="168" height="${interpreted?49:25}" rx="3" fill="#142432"/>${text(reading,x+92,y+244,15,'#b8e0dc')}${interpreted?text('UNSIGNED '+(word??'—')+' · SIGNED '+(word===null?'—':String(word>=8?word-16:word).replace('-','−')),x+92,y+265,10,'#e5cea0'):''}</g>`;
 }
 return html;
}
export function rippleBitFace(n,value){
 const input=n.type==='INPUT',display=value??'—';
 return `<rect x="3" y="2" width="168" height="38" rx="3" fill="#263a4c"/>${text(n.id,input?19:27,28,16)}<g transform="translate(48 8)">${mechanicalToggle(value,{output:!input})}</g><rect x="122" y="6" width="29" height="31" rx="3" fill="#101e2d"/>${text(display,136.5,29,20,value===1?'#ffdb94':'#bdc7ce')}${input?`<rect class="mechanical-switch" data-toggle="${n.id}" x="45" y="3" width="69" height="37" fill="transparent" role="button" tabindex="0" aria-label="Toggle ${n.id} value ${display}"/>`:''}`;
}

export function rippleOverflowVisual(c){
 try{const result=evaluate(c,legacyRipple(c)?{A:15,B:1}:rippleInputs(15,1)).outputs,word=legacyRipple(c)?result.Y:rippleWord(result,'C');if(word!==0)return '';
 return '<div class="arithmetic-package" role="img" aria-label="Actual constructed circuit: 1111 plus 0001 produces the four-bit output 0000"><span>A = 1111 (15)</span><span>+</span><span>B = 0001 (1)</span><strong>C = 0000 (0)</strong><small>16 = 10000 · Only four output bits fit.</small></div>';
 }catch{return '';}
}
