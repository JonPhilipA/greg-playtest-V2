/** Replaceable cabinet art. These layers never own simulation state. */
const asset=file=>new URL(`../assets/${file}`,import.meta.url).href;
export const DEFAULT_PANEL_ART={board:asset('panels/service-board.svg'),gate:asset('objects/logic-valve.svg'),input:asset('objects/source-contact.svg'),output:asset('objects/output-contact.svg')};
export function panelBackground(art,height,width=1040){return `<image class="panel-art" href="${art.board}" width="${width}" height="${height}" preserveAspectRatio="none"/><g class="board-detail" pointer-events="none" aria-hidden="true"><defs><pattern id="engineering-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#b6c6db" stroke-width=".55" opacity=".1"/><path d="M0 0h5M0 0v5" stroke="#d8c79c" stroke-width=".8" opacity=".12"/></pattern></defs><rect x="22" y="22" width="${width-44}" height="${height-44}" fill="url(#engineering-grid)"/><path d="M${width*.32} 25v${height-50}M25 ${height*.67}h${width-50}" stroke="#182434" stroke-width="1" opacity=".16"/><text x="34" y="40" fill="#a8b9ce" opacity=".22" font-size="6" letter-spacing="1.5">KESTREL · LOGIC SERVICE / REV 03</text></g>`;}
export function gateSymbol(type,x=0,y=0,scale=1){
  let d='';const invert=['NOT','NAND','NOR','XNOR'].includes(type),kind=type==='NAND'?'AND':type==='NOR'?'OR':type==='XNOR'||type==='XOR4'?'XOR':type;
  if(kind==='NOT')d='<path d="M3 3L3 29L29 16Z"/><circle cx="33" cy="16" r="3"/>';
  else if(kind==='AND')d='<path d="M5 3h13a13 13 0 0 1 0 26H5Z"/><path d="M0 8h5M0 24h5"/>';
  else if(kind==='OR'||kind==='XOR')d=`<path d="M4 3Q17 2 32 16Q17 30 4 29Q14 16 4 3Z"/><path d="M0 8h7M0 24h7"/>${kind==='XOR'?'<path d="M0 3Q10 16 0 29"/>':''}`;
  else if(kind==='FA1')d='<rect x="3" y="3" width="30" height="26" rx="2"/><text x="18" y="14" text-anchor="middle" font-size="8" stroke="none" fill="currentColor">FULL</text><text x="18" y="24" text-anchor="middle" font-size="8" stroke="none" fill="currentColor">ADDER</text>';
  else if(kind==='ZERO')d='<path d="M18 1v14M4 15h28M9 21h18M14 27h8"/>';
  else if(kind==='BITS4')d='<path d="M0 16h12m0-12v24m0-24h22M12 12h22M12 20h22M12 28h22"/>';
  else if(['SUM2','SUM4'].includes(kind))d='<path d="M0 4h22M0 12h22M0 20h22M0 28h22M22 4v24m0-12h16"/>';
  else if(kind==='FAN4')d='<path d="M0 16h12m0-12v24m0-24h24M12 12h24M12 20h24M12 28h24"/>';
  else if(['ADD4','ADD4C'].includes(kind))d='<rect x="3" y="3" width="30" height="26" rx="2"/><path d="M18 9v14M11 16h14M0 9h3M0 23h3M33 10h5M33 23h5"/>';
  else if(kind==='MUX4')d='<path d="M5 2l27 5v18L5 30ZM0 8h5M0 24h5M32 16h6M18 28v6"/>';
  else d=`<rect x="3" y="3" width="30" height="26" rx="2"/><path d="M0 9h3M0 23h3M33 16h5"/><text x="18" y="21" text-anchor="middle" font-size="10" stroke="none" fill="currentColor">${type==='DFF'?'D':type==='MUX4'?'MUX':'+'}</text>`;
  if(invert&&kind!=='NOT')d+='<circle cx="36" cy="16" r="3"/>';
  return `<g transform="translate(${x} ${y}) scale(${scale})" class="gate-symbol" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${d}</g>`;
}
export function nodeHousing(node,w,h,art){return `<image class="panel-art" href="${node.fixed?(node.type==='INPUT'?art.input:art.output):art.gate}" width="${w}" height="${h}" preserveAspectRatio="none"/>`;}
export function moduleFace(n,value,escape){
  if(!n.fixed)return `${gateSymbol(n.type,37,15,.9)}${['FAN4','ADD4C'].includes(n.type)?'<text x="56" y="57" text-anchor="middle" fill="#29384b" font-size="8" font-weight="bold">'+n.type+'</text>':''}<text class="gate-name" x="56" y="75" text-anchor="middle">${n.faulty?'BURNT ':''}${escape(n.rippleRole?n.label:n.type==='FAN4'?'CONTROL SPLITTER':n.type==='ADD4C'?'4-BIT ADDER':n.type)}</text>${n.faulty?'<g class="burned-mark"><path d="M25 16l22 18-12 7 39 17M73 13L59 28l19 13-10 15"/></g>':''}`;
  const input=n.type==='INPUT',display=value===null||value===undefined?'—':n.width===4?value.toString(2).padStart(n.displayBits||4,'0'):value;
  const x=input?100:18,tx=input?18:90,cx=tx+17,offset=value>0?32:0;
  return `${n.role==='clock'?'<title>Toggle CLOCK from 0 to 1 to capture. Toggle back to 0 before the next rising edge.</title>':''}<text class="terminal-label" x="88" y="32" text-anchor="middle" ${n.label.length>14?'style="font-size:15px"':''}>${escape(n.label)}</text><rect x="${x}" y="49" width="50" height="43" rx="3" class="${input?'input-value':'output-value'}" ${input?`data-toggle="${n.id}" role="button" tabindex="0" aria-label="Toggle ${escape(n.label)} value ${display}"`:''}/><text style="${n.width===4?'font-size:17px':''}" class="contact-value ${value>0?'energized':''}" x="${x+25}" y="81" text-anchor="middle">${display}</text><g class="panel-art"><rect x="${tx+2}" y="58" width="62" height="27" rx="13" fill="${value>0?(input?'#408f52':'#b17c2c'):'#2e3745'}" stroke="#121a25" stroke-width="2"/><g class="switch-knob" data-switch-value="${value>0?1:0}" transform="translate(${offset} 0)"><circle cx="${cx}" cy="71.5" r="15" fill="#b6c1cf" stroke="#101924" stroke-width="3"/><circle cx="${cx-1}" cy="70" r="11.5" fill="#c7ced7" stroke="#f1f0e8" stroke-width="1.3"/></g></g>${input?`<text class="switch-position-label" x="${tx+12}" y="51" text-anchor="middle">0</text><text class="switch-position-label" x="${tx+55}" y="51" text-anchor="middle">1</text>`:''}${n.role==='clock'?'<text class="clock-caption" x="88" y="104" text-anchor="middle">0 → 1 · CAPTURE</text>':''}${input?`<rect x="18" y="54" width="66" height="36" rx="15" fill="transparent" class="mechanical-switch" data-toggle="${n.id}" role="button" tabindex="0" aria-label="Toggle ${escape(n.label)} switch"/>`:''}`;
}
// The jacket color is supplied independently of HIGH/LOW. No decorative clamps on playable leads.
export function glassConduit(path,a,b,{high=false,selected=false,preview=false,valid=false,invalid=false,color='#dc3037'}={}){
  const cl=preview?`wire-preview ${valid?'valid':''} ${invalid?'invalid':''}`:`wire ${high?'high':''} ${selected?'selected':''}`;
  return `<g class="insulated-cable ${preview?'conduit-preview':''}" style="--cable:${color}" ${preview?'aria-hidden="true"':''}><path d="${path}" class="cable-outline"/><path d="${path}" class="cable-shadow"/><path d="${path}" class="${cl}"/><path d="${path}" class="cable-highlight"/></g>`;
}
