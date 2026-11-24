export const INITIAL_CARRY_POSITION=Object.freeze({x:118,y:32});
export function positionInitialCarry(c){
 if(c?.configuration?.rippleVersion!==2&&c?.configuration?.subtractorVersion!==1)return;
 const one=c.configuration.subtractorVersion===1,n=c.nodes.find(n=>n.id===(one?'one':'zero')&&n.fixed&&n.type===(one?'ONE':'ZERO'));
 if(n)Object.assign(n,INITIAL_CARRY_POSITION,{label:one?'CIN = 1':'CIN = 0'});
}
/** Shared physical geometry for artwork, sockets, hit testing, dragging and hints. */
export const INITIAL_CARRY_SIZE=Object.freeze({w:94,h:34});
export const carrySourceSize=n=>n.rippleZero?(n.label==='CIN = 0'||n.label==='CIN = 1'?INITIAL_CARRY_SIZE:{w:n.type==='ONE'?112:88,h:50}):null;
export const FULL_ADDER_SIZE=Object.freeze({w:156,h:120});
export const NOT4_SIZE=Object.freeze({w:200,h:164});
export const ARITHMETIC_PLACEMENTS=Object.freeze([{x:480,y:100},{x:720,y:100},{x:480,y:310},{x:720,y:310}]);
export const NOT4_PLACEMENT=Object.freeze({x:245,y:340});
export const arithmeticComponentSize=n=>n.type==='FA1'?FULL_ADDER_SIZE:n.type==='NOT4'?NOT4_SIZE:null;
export function arithmeticPin(n,side,index){
 const bounds=arithmeticComponentSize(n);if(!bounds)return null;
 return {x:n.x+(side==='outputs'?bounds.w:0),y:n.y+(n.type==='NOT4'?32+34*index:side==='inputs'?[42,76,110][index]:[42,110][index])};
}
const label=(s,x,y,size=14,anchor='start')=>`<text x="${x}" y="${y}" text-anchor="${anchor}" fill="#243547" style="fill:#243547;font:bold ${size}px Arial,sans-serif">${s}</text>`;
const bolts=(w,h)=>[[10,10],[w-10,10],[10,h-10],[w-10,h-10]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2.8" fill="#8c6a38" stroke="#f2d69e" stroke-width="1"/><path d="M${x-1.5} ${y+1.5}l3-3" stroke="#243547" stroke-width="1"/>`).join('');
export function arithmeticComponentFace(n){
 if(n.type==='FA1')return `<g class="full-adder-face">${bolts(156,120)}<rect x="12" y="5" width="132" height="28" rx="3" fill="#24384a" stroke="#99733b"/><text x="78" y="26" text-anchor="middle" fill="#f9e4b6" style="font:bold 19px Arial">FULL ADDER</text>${label('A',23,48,18)}${label('B',23,82,18)}${label('CIN',23,115,18)}${label('SUM',133,48,18,'end')}${label('COUT',133,115,18,'end')}</g>`;
 if(n.type==='NOT4')return `<g class="not4-face">${bolts(200,164)}<rect x="48" y="6" width="104" height="24" rx="3" fill="#24384a" stroke="#99733b"/><text x="100" y="25" text-anchor="middle" fill="#f9e4b6" style="font:bold 19px Arial">NOT4</text><g class="not4-symbol" fill="none" stroke="#243547" stroke-width="4" stroke-linejoin="round"><path d="M65 48V116L128 82Z"/><circle cx="136" cy="82" r="7"/></g>${[0,1,2,3].map(i=>`<g class="not4-channel" data-channel="${i}">${label('B'+i,21,37+34*i,13)}${label('¬B'+i,179,37+34*i,13,'end')}</g>`).join('')}${label('4-BIT INVERTER',100,155,13,'middle')}</g>`;
 return '';
}

export function initialCarryFace(n){
 const {w,h}=carrySourceSize(n),compact=h===INITIAL_CARRY_SIZE.h;
 return `<rect width="${w}" height="${h}" rx="${compact?3:5}" fill="${compact?'#182c3e':'#2f4254'}" stroke="${compact?'#72818a':'#b29b69'}" stroke-width="${compact?1:2}"/><text x="${compact?43:w/2}" y="${compact?22:31}" text-anchor="middle" fill="#f1d79a" style="font:bold ${compact?14:15}px Arial">CIN = ${n.type==='ONE'?1:0}</text>`;
}
