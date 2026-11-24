import {arithmeticComponentSize,arithmeticPin,carrySourceSize,initialCarryFace,ARITHMETIC_PLACEMENTS,NOT4_PLACEMENT,positionInitialCarry} from './arithmetic-component-art.js';
import {aluCircuit,aluSize,aluPin,aluPortVisible} from './alu-foundation.js';
import {aluRegisters,aluModuleFace,aluBitFace,aluBusCable} from './alu-foundation-view.js';
import {subtractorCircuit} from './subtractor.js';
import {rippleBitFace,rippleRegisterHousings} from './ripple-view.js';
import {rippleCircuit} from './ripple-adder.js';
import {ports,evaluate,connect} from './simulator.js';
import {DEFAULT_PANEL_ART,panelBackground,nodeHousing,glassConduit,moduleFace} from './panel-art.js';
import {arrangeCircuit,emptyGatePosition,clampGate,overlaps} from './circuit-layout.js';
import {blueprintLayer} from './blueprint-overlay.js';
import {circuitHintLayer} from './circuit-hint-overlay.js';
import {wireSignal,changedWireSignals,changedInputSwitches} from './signal-view.js';
import {inputSwitchTarget,animateInputSwitch,stopInputSwitchAnimations} from './input-switch.js';
const NS='http://www.w3.org/2000/svg';
export const TERMINAL_HIT_RADIUS=32,WIRE_DROP_RADIUS=38;
export const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const size=n=>aluSize(n)||arithmeticComponentSize(n)||carrySourceSize(n)||(n.rippleBit?{w:176,h:40}:n.artStyle==='illustrated'?{w:n.fixed?176*(n.moduleScale||1):112,h:n.fixed?108*(n.moduleScale||1):n.type==='MUX4'?104:84}:({w:n.fixed?128:106,h:n.type==='MUX4'?88:68}));
export function pinPosition(n,side,index){const alu=aluPin(n,side,index);if(alu)return alu;const arithmetic=arithmeticPin(n,side,index);if(arithmetic)return arithmetic;if(n.rippleBit)return{x:n.x+(side==='outputs'?176:0),y:n.y+22};if(n.rippleZero)return{x:n.x+size(n).w,y:n.y+size(n).h/2};const p=ports(n)[side],{w,h}=size(n);return {x:n.x+(side==='outputs'?w:0),y:n.y+(n.fixed&&n.artStyle==='illustrated'?71.5*(n.moduleScale||1):p.length===1?h/2:18+index*(h-36)/(p.length-1))};}
const curve=(a,b)=>{const d=Math.max(38,Math.abs(b.x-a.x)*.38),sag=Math.min(22,Math.abs(b.x-a.x)*.055);return `M${a.x},${a.y} C${a.x+d},${a.y+sag} ${b.x-d},${b.y+sag} ${b.x},${b.y}`;};
/** Fit a read-only circuit without changing its installed component coordinates. */
export function fitCircuitViewport(editor){
 const boxes=editor.circuit.nodes.map(n=>({x:n.x,y:n.y,...size(n)}));
 for(const path of editor.svg.querySelectorAll('[data-wire]')){const b=path.getBBox();boxes.push({x:b.x,y:b.y,w:b.width,h:b.height});}
 if(boxes.length){const x=Math.min(...boxes.map(b=>b.x))-30,y=Math.min(...boxes.map(b=>b.y))-30,right=Math.max(...boxes.map(b=>b.x+b.w))+30,bottom=Math.max(...boxes.map(b=>b.y+b.h))+30;editor.svg.setAttribute('viewBox',[x,y,right-x,bottom-y].join(' '));}
}
export class Editor {
  constructor(svg,{circuit,inputs,state,onChange,onInput,onMessage,height=540,theme='original',trashTarget=null,onSelectionChange=()=>{},art=null,wirePalette=['#dc3037'],compact=false,width=1040,workbench=false,preserveLayout=false}) {
    Object.assign(this,{svg,circuit,inputs,state,onChange,onInput,onMessage,height,theme,trashTarget,onSelectionChange,wirePalette,compact,width,workbench});this.art=art||DEFAULT_PANEL_ART;this.pending=null;this.selected=null;this.drag=null;this.wiring=null;
    if(workbench){if(!preserveLayout&&!circuit.layout?.ripple)arrangeCircuit(circuit,width,height);this.view={x:0,y:0,width,height};
      svg.addEventListener('wheel',e=>{e.preventDefault();if(!this.drag&&!this.wiring)this.zoom(Math.exp(-e.deltaY*.0015),this.point(e));},{passive:false});
      svg.addEventListener('keydown',e=>{if(['+','=','-','0'].includes(e.key)){e.preventDefault();e.stopPropagation();if(e.key==='0')this.setView({x:0,y:0,width:this.width,height:this.height});else this.zoom(e.key==='-'?.8:1.25);}});
    }
    if(workbench)positionInitialCarry(circuit);
    if(theme==='illustrated'){
      const sources=circuit.nodes.filter(n=>n.fixed&&n.type==='INPUT'),sinks=circuit.nodes.filter(n=>n.fixed&&n.type==='OUTPUT');
      for(const n of circuit.nodes){this.styleNode(n);if(workbench){if(!n.fixed&&!n.rippleRole&&arithmeticComponentSize(n))clampGate(n,width,height);continue;}if(n.fixed){const group=n.type==='INPUT'?sources:sinks,index=group.indexOf(n);const {w,h}=size(n);n.x=n.type==='INPUT'?40:1000-w;n.y=compact?(group.length===1?(height-h)/2:10+index*(height-h-20)/(group.length-1)):(group.length===1?102:35+index*145);}else{const {w,h}=size(n);n.x=Math.max(185,Math.min(1040-w,n.x));n.y=Math.max(0,Math.min(height-h,n.y));}}
    }
    svg.addEventListener('pointerdown',e=>{if(this.readOnly){e.preventDefault();e.stopImmediatePropagation();}},true);
    svg.addEventListener('keydown',e=>{if(this.readOnly&&['Delete','Backspace','Enter',' '].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();}},true);
    svg.addEventListener('contextmenu',e=>{if(this.readOnly){e.preventDefault();e.stopImmediatePropagation();}},true);
    svg.addEventListener('pointerdown',e=>this.down(e));
    svg.addEventListener('pointermove',e=>this.move(e));
    svg.addEventListener('pointerup',e=>this.up(e));
    svg.addEventListener('pointercancel',()=>{this.cancelPan();this.cancelDrag();this.cancelWire();});
    svg.addEventListener('lostpointercapture',e=>{if(this.pan?.pointerId===e.pointerId)this.cancelPan();if(this.wiring?.pointerId===e.pointerId)this.cancelWire();if(this.drag?.pointerId===e.pointerId)this.cancelDrag();});
    svg.addEventListener('contextmenu',e=>{e.preventDefault();const id=e.target.closest('[data-node]')?.dataset.node,n=this.circuit.nodes.find(n=>n.id===id);if(n&&n.type!=='OUTPUT'){this.selected={type:'node',id:n.id};this.remove();}});
    svg.addEventListener('keydown',e=>{if(e.key==='Escape'){const wasWiring=!!this.pending||!!this.wiring||!!this.drag;this.cancelDrag();this.cancelWire();this.selected=null;this.render();if(wasWiring){e.preventDefault();e.stopPropagation();}}if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();e.stopPropagation();const pin=e.target.closest('[data-pin]');if(pin)this.disconnectTerminal(this.pinInfo(pin));else this.remove();}if(e.key==='Enter'||e.key===' '){const pin=e.target.closest('[data-pin]'),wire=e.target.closest('[data-wire]');if(pin){e.preventDefault();this.pin(pin);}else if(wire){e.preventDefault();this.selected={type:'wire',id:wire.dataset.wire};this.render();this.onMessage('Wire selected. Press Delete to remove it.');}else if(inputSwitchTarget(e,true)){e.preventDefault();this.onInput(this.circuit.nodes.find(n=>n.id===inputSwitchTarget(e,true).dataset.toggle));}}});
    this.committedCircuit=structuredClone(this.circuit);this.render();
  }
  setView(view){const width=Math.max(this.width/3,Math.min(this.width,view.width)),height=this.height*width/this.width;this.view={x:Math.max(0,Math.min(this.width-width,view.x)),y:Math.max(0,Math.min(this.height-height,view.y)),width,height};this.svg.setAttribute('viewBox',`${this.view.x} ${this.view.y} ${width} ${height}`);}
  zoom(factor,anchor){const v=this.view||{x:0,y:0,width:this.width,height:this.height},point=anchor||{x:v.x+v.width/2,y:v.y+v.height/2},width=Math.max(this.width/3,Math.min(this.width,v.width/factor)),ratio=width/v.width;this.setView({x:point.x-(point.x-v.x)*ratio,y:point.y-(point.y-v.y)*ratio,width});}
  cancelPan(){if(!this.pan)return;const id=this.pan.pointerId;this.pan=null;this.svg.classList.toggle('panning',false);if(this.svg.hasPointerCapture(id))this.svg.releasePointerCapture(id);}
  resizeWorkbench(height){
    if(this.readOnly||this.circuit.layout?.ripple||!this.workbench||Math.abs(height-this.height)<3)return;
    const old=this.height;this.height=height;for(const n of this.circuit.nodes.filter(n=>!n.fixed))n.y=n.y*height/old;
    this.circuit.layout={...this.circuit.layout,height};arrangeCircuit(this.circuit,this.width,height);
    const nodes=this.circuit.nodes;if(nodes.some((n,i)=>nodes.slice(i+1).some(other=>overlaps(n,other,4)))){delete this.circuit.layout;arrangeCircuit(this.circuit,this.width,height);}
    this.setView({x:0,y:0,width:this.width,height});this.render();
  }
  point(e){const p=this.svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(this.svg.getScreenCTM().inverse());}
  refresh(inputs,state){const before=this.values;this.inputs=inputs;this.state=state;const after=this.signals();this.changedSignals=changedWireSignals(this.circuit,before,after);this.signalUntil=(globalThis.performance?.now?.()||0)+280;this.render();}
  beginDiagnostic(){this.cancelPan();this.cancelDrag();this.cancelWire();this.readOnly=true;this.svg.setAttribute('aria-disabled','true');}
  stopDiagnosticAnimations(){stopInputSwitchAnimations(this.switchAnimations);this.switchAnimations=new Set();}
  showDiagnosticFrame(frame){
    const before=this.values;this.diagnosticFrame=frame;const after=this.signals();this.diagnosticChangedNodes=new Set([...after].filter(([id,values])=>JSON.stringify(before?.get(id))!==JSON.stringify(values)).map(([id])=>id));this.changedSignals=changedWireSignals(this.circuit,before,after);
    const duration=frame.reducedMotion?0:Math.max(0,frame.transitionMs??Math.min(130,(frame.intervalMs||400)*.25));this.signalUntil=(globalThis.performance?.now?.()||0)+duration;this.svg.style?.setProperty('--diagnostic-transition',duration+'ms');this.svg.dataset.diagnosticPass=String(frame.pass);this.render();
    if(this.circuit.layout?.ripple&&!frame.reducedMotion){
      const stages=[...after.keys()].filter(id=>this.circuit.nodes.some(n=>n.id===id&&n.type==='FA1')),ms=Math.min(200,frame.intervalMs*.65);
      stages.forEach((id,i)=>{if(after.get(id)?.[1]===1)for(const w of this.circuit.wires.filter(w=>w.from===id&&w.out===1&&w.in===2&&this.circuit.nodes.some(n=>n.id===w.to&&n.type==='FA1'))){const lead=this.svg.querySelector('[data-wire="'+w.id+'"]');lead?.animate?.([{filter:'brightness(1)'},{filter:'brightness(1.8)'},{filter:'brightness(1)'}],{duration:Math.max(40,ms/stages.length),delay:i*ms/stages.length});}});
    }
    if(duration)for(const change of changedInputSwitches(this.circuit,before,after)){
      const node=[...this.svg.querySelectorAll('[data-node]')].find(n=>n.dataset.node===change.id),knob=node?.querySelector('.switch-knob');if(!knob?.animate)continue;
      animateInputSwitch(knob,change.from,change.to,duration,this.switchAnimations);
    }
  }
  endDiagnostic(){this.stopDiagnosticAnimations();this.diagnosticFrame=null;this.readOnly=false;this.signalUntil=0;delete this.svg.dataset.diagnosticPass;this.svg.removeAttribute('aria-disabled');this.render();}

  signals(){if(this.diagnosticFrame)return new Map(this.diagnosticFrame.values);try{const faulty=new Set(this.circuit.nodes.filter(n=>n.faulty).map(n=>n.id)),graph=faulty.size?{...this.circuit,wires:this.circuit.wires.filter(w=>!faulty.has(w.from))}:this.circuit,values=evaluate(graph,this.inputs,this.state,{partial:true}).values;for(const id of faulty)values.set(id,[null]);return values;}catch{return new Map();}}
  render(){
    this.stopDiagnosticAnimations();
    this.svg.classList.toggle('wiring-active',!!this.wiring);
    this.svg.classList.toggle('dragging-gate',!!this.drag);
    const values=this.signals();this.values=values;
    const illustrated=this.theme==='illustrated',brass=this.theme==='brass'||illustrated;
    let html=`<defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" fill="${brass?'#68764a':'#2b3d50'}"/></pattern></defs><rect width="1040" height="${this.height}" fill="${brass?'#17271d':'#0c1621'}"/><rect width="1040" height="${this.height}" fill="url(#grid)"/><text x="32" y="24" fill="#61778c" font-size="10" letter-spacing="2">${brass?'TEST CONTACTS':'INPUT SOURCES'}</text><text x="447" y="24" fill="#435b72" font-size="10" letter-spacing="2">${brass?'GOVERNOR SOCKETS':'CIRCUIT WORKSPACE'}</text><text x="906" y="24" fill="#61778c" font-size="10" letter-spacing="2">${brass?'TO MACHINE':'OUTPUT DEVICES'}</text>`;
    if(brass)html=panelBackground(this.art,this.height,this.width);
    if(this.circuit.configuration?.rippleVersion===2||this.circuit.configuration?.subtractorVersion===1)html+=rippleRegisterHousings(values,{signed:!!this.circuit.layout?.subtractor});
    if(this.circuit.layout?.aluFoundation)html+=aluRegisters(values,this.circuit);
    if(this.blueprint&&!(this.hint?.level>0))html+=blueprintLayer(this.blueprint.sheet,this.circuit,{height:this.height,opacity:this.blueprint.opacity,pinPosition});
    const hints=circuitHintLayer(this.hint?.guide,this.circuit,{...this.hint,width:this.width,height:this.height,pinPosition,size,curve});html+=hints.markup;
    for(const w of this.circuit.wires){if(w.panelInternal)continue;
      const src=this.circuit.nodes.find(n=>n.id===w.from),dst=this.circuit.nodes.find(n=>n.id===w.to);if(!src||!dst)continue;
      const a=pinPosition(src,'outputs',w.out),b=pinPosition(dst,'inputs',w.in),path=curve(a,b);
      const tube=this.circuit.layout?.aluFoundation&&ports(src).outputs[w.out]?.width===4?aluBusCable(a,b,values.get(w.from)?.[w.out],curve):brass?glassConduit(path,a,b,{high:values.get(w.from)?.[w.out]>0,selected:this.selected?.id===w.id,color:this.wirePalette[this.circuit.wires.indexOf(w)%this.wirePalette.length]}):`<path d="${path}" class="wire ${values.get(w.from)?.[w.out]>0?'high':''} ${this.selected?.id===w.id?'selected':''}"/>`;
      const signal=wireSignal(this.circuit,values,w),traced=this.signalUntil>(globalThis.performance?.now?.()||0)&&this.changedSignals?.has(w.id);
      html+=`<g data-wire="${w.id}" data-carry-active="${src.type==='FA1'&&w.out===1&&dst.type==='FA1'&&w.in===2&&signal.value===1}" data-signal="${signal.state}" class="${this.circuit.layout?.ripple?(w.bench?'bench-lead':'carry-lead'):''} signal-${signal.state} ${traced?'signal-evaluated':''} ${hints.matchedWireIds.has(w.id)?'hint-matched-wire':''}" tabindex="0" role="button" aria-label="Wire from ${escapeHTML(src.label||src.type)} to ${escapeHTML(dst.label||dst.type)} · ${signal.label}"><title>${signal.label} · Logical evaluation; no physical propagation delay</title><path d="${path}" class="wire-hit"/>${tube}${this.selected?.id===w.id?`<text class="signal-label" x="${a.x+14}" y="${a.y-17}">${signal.label}</text>`:''}</g>`;
    }

    if(this.wiring){
      const {origin,point,target,valid}=this.wiring,node=this.circuit.nodes.find(n=>n.id===origin.id);
      const start=pinPosition(node,origin.side,origin.index);
      const end=target&&valid?pinPosition(this.circuit.nodes.find(n=>n.id===target.id),target.side,target.index):point;
      const d=origin.side==='outputs'?curve(start,end):curve(end,start);
      html+=brass?glassConduit(d,start,end,{preview:true,valid:!!target&&valid,invalid:!!target&&!valid}):`<path d="${d}" class="wire-preview ${target?(valid?'valid':'invalid'):''}" aria-hidden="true"/>`;
    }
    for(const n of this.circuit.nodes){
      const {w,h}=size(n),p=ports(n),value=n.faulty?null:values.get(n.id)?.[0];
      html+=`<g transform="translate(${n.x},${n.y})" class="node ${n.equipment?'installed-equipment':''} ${n.faulty?'faulty':''} ${n.fixed?'fixed':''} ${this.diagnosticFrame&&n.type==='INPUT'?'diagnostic-input':''} ${this.diagnosticFrame&&this.diagnosticChangedNodes?.has(n.id)&&n.type!=='INPUT'?'diagnostic-evaluated-node':''} ${value>0?'high':''} ${this.selected?.id===n.id?'selected':''}" data-node="${n.id}" aria-label="${escapeHTML(n.label||n.type)} component">${brass&&!n.rippleBit&&!n.rippleZero&&!n.aluModule&&!n.panelBus?nodeHousing(n,w,h,this.art,value):''}<rect class="node-shell" x="0" y="0" width="${w}" height="${h}" rx="${brass?0:5}"/>`;
      if(n.panelBus){}
      else if(n.aluModule)html+=aluModuleFace(n,values,this.circuit);
      else if(n.aluBit)html+=aluBitFace(n,value);
      else if(n.rippleBit)html+=rippleBitFace(n,value);
      else if(n.rippleZero)html+=initialCarryFace(n);
      else if(illustrated)html+=`<g transform="scale(${n.fixed?(n.moduleScale||1):1})">${moduleFace(n,value,escapeHTML)}</g>`;
      else if(n.fixed){
        html+=`<text class="terminal-label" x="12" y="21" fill="#a4bacb" font-size="10">${escapeHTML(n.label)}</text>`;
        const display=value===null||value===undefined?'—':n.width===4?value.toString(2).padStart(4,'0'):value;
        html+=`<rect x="10" y="28" width="${n.width===4?75:34}" height="28" rx="${brass?0:3}" fill="${brass?'#111820':(value>0?'#23463f':'#1c2c3c')}" class="${n.type==='INPUT'?'input-value':''}" ${n.type==='INPUT'?`data-toggle="${n.id}" role="button" tabindex="0" aria-label="Toggle ${escapeHTML(n.label)} value ${display}"`:''}/><text class="contact-value ${value>0?'energized':''}" x="${n.width===4?46:27}" y="47" text-anchor="middle" fill="${value>0?'#83ddba':'#829bb1'}" font-size="16">${display}</text>`;
        if(n.type==='INPUT'&&brass)html+=`<rect x="78" y="25" width="35" height="32" fill="transparent" class="mechanical-switch" data-toggle="${n.id}" role="button" tabindex="0" aria-label="Toggle ${escapeHTML(n.label)} switch"/>`;
        if(n.type==='INPUT'&&!brass)html+=`<text x="91" y="46" fill="#57758d" font-size="9">${n.role==='clock'?'CLK':'↻'}</text>`;
        else if(n.type==='OUTPUT')html+=`<circle class="pilot-lamp ${value>0?'energized':''}" cx="104" cy="42" r="5" fill="${brass?(value>0?'#ffc980':value===0?'#68523f':'#454a52'):(value>0?'#83ddba':value===0?'#55728c':'#344353')}"/>`;
      }else{
        html+=`<text x="53" y="${h/2+4}" text-anchor="middle" fill="#c7dce9" font-size="13" font-weight="bold">${n.type}</text><text x="53" y="${h-7}" text-anchor="middle" fill="#5f7e98" font-size="8">${n.id.toUpperCase()}</text>`;
      }
      if(this.diagnosticFrame&&!n.fixed){const out=values.get(n.id)||[],label=out.map(v=>v??'—').join('/'),chipX=n.type==='FA1'?62:w-38,chipY=n.type==='FA1'?55:4;html+=`<g class="diagnostic-gate-chip"><title>Evaluated outputs: ${escapeHTML(label)}</title><rect x="${chipX}" y="${chipY}" width="32" height="17" rx="3" fill="${out.some(v=>v>0)?'#eac783':'#26394d'}" stroke="#152536"/><text x="${chipX+16}" y="${chipY+12}" text-anchor="middle" fill="${out.some(v=>v>0)?'#233446':'#e4eaf0'}">${escapeHTML(label)}</text></g>`;}
      for(const side of ['inputs','outputs'])p[side].forEach((port,i)=>{if(this.circuit.layout?.aluFoundation&&!aluPortVisible(n,side,i))return;
        const pos=pinPosition(n,side,i),x=pos.x-n.x,y=pos.y-n.y,pending=this.pending?.id===n.id&&this.pending?.index===i&&side==='outputs';
        const v=side==='outputs'?values.get(n.id)?.[i]:(()=>{const wire=this.circuit.wires.find(q=>q.to===n.id&&q.in===i);return wire?values.get(wire.from)?.[wire.out]:null;})();
        if(!n.fixed&&!arithmeticComponentSize(n)&&!(n.aluModule&&n.type==='FAN4'))html+=`<text x="${side==='inputs'?9:w-9}" y="${y-5}" text-anchor="${side==='inputs'?'start':'end'}" fill="${n.type==='FA1'||n.aluModule?'#ffefc4':'#7696ae'}" font-size="${n.type==='FA1'||n.aluModule?12:8}" ${n.type==='FA1'?'style="paint-order:stroke;stroke:#24384b;stroke-width:2.5px;font-weight:bold"':''}>${port.name}</text>`;
        const connected=this.circuit.wires.some(w=>side==='inputs'?w.to===n.id&&w.in===i:w.from===n.id&&w.out===i);
        const attrs=`class="terminal ${connected?'connected':''}" data-pin="true" data-id="${n.id}" data-side="${side}" data-index="${i}" tabindex="0" role="button" aria-label="${escapeHTML(n.label||n.type)} ${side==='inputs'?'input':'output'} ${escapeHTML(port.name)}"`;
        const compatible=this.wiring&&this.wiring.origin.side!==side&&this.wiring.origin.width===port.width;
        const hovered=this.wiring?.target?.id===n.id&&this.wiring?.target?.side===side&&this.wiring?.target?.index===i;
        const cls=`pin ${v>0?'high':''} ${pending?'pending':''} ${compatible?'wire-compatible':''} ${hovered?(this.wiring.valid?'wire-drop-target':'wire-drop-invalid'):''}`;
        html+=`<g ${attrs}><title>${connected?'Click to disconnect this terminal. Drag to connect another wire.':'Drag to an opposite terminal to connect a wire.'}</title>${illustrated&&n.fixed&&n.type==='INPUT'&&!n.rippleBit?`<rect class="terminal-hit" x="${x-22}" y="${y-TERMINAL_HIT_RADIUS}" width="${TERMINAL_HIT_RADIUS+22}" height="${TERMINAL_HIT_RADIUS*2}" rx="14" fill="transparent"/>`:`<circle class="terminal-hit" cx="${x}" cy="${y}" r="${n.rippleBit?18:illustrated?TERMINAL_HIT_RADIUS:22}" fill="transparent"/>`}`;
        if(brass)html+=`<circle class="ceramic-socket" cx="${x}" cy="${y}" r="${illustrated?12:8}"/>`;
        if(hovered)html+=`<circle cx="${x}" cy="${y}" r="11" class="pin-drop-ring ${this.wiring.valid?'':'invalid'}"/>`;
        html+=port.width===4?`<rect class="${cls}" x="${x-5}" y="${y-5}" width="10" height="10" rx="1"/>`:`<circle class="${cls}" cx="${x}" cy="${y}" r="${illustrated?7:5}"/>`;
        html+='</g>';
      });html+='</g>';
    }
    this.svg.innerHTML=html;
    const selected=this.selected?.type==='node'?this.circuit.nodes.find(n=>n.id===this.selected.id&&!n.fixed):null;
    this.onSelectionChange?.(selected||null);
  }
  pin(el){
    if(this.readOnly)return false;
    const {id,side,index}=el.dataset,i=Number(index);
    if(side==='outputs') {this.pending={id,index:i};this.onMessage('Source selected. Focus an input pin and press Enter to connect.');}
    else if(this.pending){
      try{connect(this.circuit,{from:this.pending.id,out:this.pending.index,to:id,in:i});this.pending=null;this.selected=null;if(this.changed()!==false)this.onMessage('Wire connected. Signals update live.');}
      catch(e){this.onMessage(e.message,true);}
    }else this.onMessage('Drag a wire between opposite terminals, or use Tab and Enter to connect.');
    this.render();
  }
  down(e){
    if(e.button!==0||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey){this.lastGateClick=null;this.doubleClickGate=null;}
    if(this.workbench&&(e.button===1||(e.button===0&&e.altKey))){e.preventDefault();this.pan={pointerId:e.pointerId,x:e.clientX,y:e.clientY,view:{...this.view}};this.svg.setPointerCapture(e.pointerId);this.svg.classList.toggle('panning',true);return;}
    if(e.button!==0)return;
    if(this.wiring||this.drag)return;
    const previousGateClick=this.lastGateClick;this.lastGateClick=null;this.doubleClickGate=null;
    const toggle=inputSwitchTarget(e);
    if(toggle){const n=this.circuit.nodes.find(n=>n.id===toggle.dataset.toggle);if(n.type==='INPUT')this.onInput(n);return;}
    const pin=this.terminalAt(e,e.target,this.theme==='illustrated'?TERMINAL_HIT_RADIUS:22);
    if(pin){
      e.preventDefault();this.pending=null;this.selected=null;
      this.wiring={pointerId:e.pointerId,origin:pin,point:this.point(e),target:null,valid:false,start:{x:e.clientX,y:e.clientY},moved:false};
      this.svg.setPointerCapture(e.pointerId);this.render();
      this.onMessage('Keep holding and drag the wire to a highlighted opposite terminal. Release to connect.');return;
    }
    const node=e.target.closest('[data-node]');
    if(node){const n=this.circuit.nodes.find(n=>n.id===node.dataset.node);if(n.type==='OUTPUT')return;this.selected={type:'node',id:n.id};if(!n.fixed&&!n.rippleRole){const p=this.point(e);this.drag={id:n.id,dx:p.x-n.x,dy:p.y-n.y,pointerId:e.pointerId,start:{x:n.x,y:n.y},startScreen:{x:e.clientX,y:e.clientY},previousGateClick};this.svg.setPointerCapture(e.pointerId);}this.render();return;}
    const wire=e.target.closest('[data-wire]');
    this.selected=wire?{type:'wire',id:wire.dataset.wire}:null;this.pending=null;this.render();
  }
  pinInfo(el){
    const {id,side,index}=el.dataset,i=Number(index),node=this.circuit.nodes.find(n=>n.id===id);
    return {id,side,index:i,width:ports(node)[side][i].width};
  }
  terminalAt(e,element,radius){
    if(!element||!this.svg.contains(element))return null;
    const point=this.point(e);let nearest=null,distance=radius;
    for(const node of this.circuit.nodes)for(const side of ['inputs','outputs'])ports(node)[side].forEach((port,index)=>{
      if(this.circuit.layout?.aluFoundation&&!aluPortVisible(node,side,index))return;
      const pos=pinPosition(node,side,index),d=Math.hypot(point.x-pos.x,point.y-pos.y);
      if(d<distance){distance=d;nearest={id:node.id,side,index,width:port.width};}
    });
    return nearest;
  }
  dropTarget(e){
    // Capture routes events to the SVG; accept the nearest socket under/near the pointer.
    return this.terminalAt(e,this.svg.ownerDocument.elementFromPoint(e.clientX,e.clientY),this.theme==='illustrated'?WIRE_DROP_RADIUS:26);
  }
  move(e){
    if(this.pan){if(e.pointerId!==this.pan.pointerId)return;const r=this.svg.getBoundingClientRect(),p=this.pan;this.setView({x:p.view.x-(e.clientX-p.x)*p.view.width/r.width,y:p.view.y-(e.clientY-p.y)*p.view.height/r.height,width:p.view.width});return;}
    if(this.wiring){
      if(e.pointerId!==this.wiring.pointerId)return;
      if(Math.hypot(e.clientX-this.wiring.start.x,e.clientY-this.wiring.start.y)>6)this.wiring.moved=true;
      this.wiring.point=this.point(e);this.wiring.target=this.dropTarget(e);
      const {origin,target}=this.wiring;
      this.wiring.valid=!!target&&target.side!==origin.side&&target.width===origin.width;
      this.render();return;
    }
    if(!this.drag||e.pointerId!==this.drag.pointerId)return;
    if(this.drag.startScreen&&Math.hypot(e.clientX-this.drag.startScreen.x,e.clientY-this.drag.startScreen.y)>6)this.drag.moved=true;
    this.trashTarget?.classList.toggle('drag-over',this.overTrash(e));
    const n=this.circuit.nodes.find(n=>n.id===this.drag.id),p=this.point(e),{w,h}=size(n);
    if(this.workbench){n.x=Math.max(16,Math.min(this.width-w-16,p.x-this.drag.dx));n.y=Math.max(16,Math.min(this.height-h-16,p.y-this.drag.dy));this.render();return;}
    if((this.compact||this.theme==='illustrated')&&this.svg.getBoundingClientRect){const bounds=this.svg.getBoundingClientRect(),bottom=Math.max(bounds.bottom,this.trashTarget?.getBoundingClientRect().bottom||bounds.bottom),min=this.point({clientX:bounds.left,clientY:bounds.top}),max=this.point({clientX:bounds.right,clientY:bottom});n.x=Math.max(min.x,Math.min(max.x-w,p.x-this.drag.dx));n.y=Math.max(min.y,Math.min(max.y-h,p.y-this.drag.dy));this.render();return;}
    const illustrated=this.theme==='illustrated';n.x=Math.max(185,Math.min((illustrated?1040:880)-w,p.x-this.drag.dx));n.y=Math.max(illustrated?0:36,Math.min(this.height-(illustrated?0:26)-h,p.y-this.drag.dy));this.render();
  }
  up(e){
    if(this.pan?.pointerId===e.pointerId){this.cancelPan();return;}
    if(this.wiring){
      if(e.pointerId!==this.wiring.pointerId)return;
      const {origin,start,moved}=this.wiring,target=this.dropTarget(e);
      const clicked=!moved&&Math.hypot(e.clientX-start.x,e.clientY-start.y)<=6&&target?.id===origin.id&&target?.side===origin.side&&target?.index===origin.index;
      this.cancelWire();
      if(clicked){this.disconnectTerminal(origin);return;}
      if(!target){this.onMessage('Wire cancelled. Release on an opposite terminal to connect.');return;}
      if(target.side===origin.side){this.onMessage('Connect an output terminal to an input terminal.',true);return;}
      const source=origin.side==='outputs'?origin:target,destination=origin.side==='inputs'?origin:target;
      try{
        connect(this.circuit,{from:source.id,out:source.index,to:destination.id,in:destination.index});
        const accepted=this.changed();this.render();if(accepted!==false)this.onMessage('Wire connected. Signals update live.');
      }catch(error){this.onMessage(error.message,true);}
      return;
    }
    if(this.drag&&e.pointerId===this.drag.pointerId){
      const discard=this.overTrash(e),node=this.circuit.nodes.find(n=>n.id===this.drag.id);
      if(!discard&&this.workbench&&node)clampGate(node,this.width,this.height);
      if(!discard&&!this.workbench&&(this.compact||this.theme==='illustrated')&&node){const {w,h}=size(node);node.x=Math.max(185,Math.min(1040-w,node.x));node.y=Math.max(0,Math.min(this.height-h,node.y));}
      const moved=node&&(node.x!==this.drag.start?.x||node.y!==this.drag.start?.y);
      if(node&&!moved&&!this.drag.moved&&!discard&&!e.altKey&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey){
        // SVG redraws can suppress native click/dblclick events. Recognize two stationary body releases.
        const previous=this.drag.previousGateClick,click={node,x:e.clientX,y:e.clientY,time:e.timeStamp??performance.now()};
        this.doubleClickGate=previous?.node===node&&click.time-previous.time<=500&&Math.hypot(click.x-previous.x,click.y-previous.y)<=6?node.id:null;this.lastGateClick=click;
      }
      this.drag=null;this.trashTarget?.classList.remove('drag-over');
      if(this.svg.hasPointerCapture(e.pointerId))this.svg.releasePointerCapture(e.pointerId);
      if(discard)this.removeNode();else{if(moved)this.changed();this.render();if(this.doubleClickGate)this.doubleClick(e);}
    }
  }
  disconnectTerminal(pin){
    if(this.readOnly)return false;
    const before=this.circuit.wires.length;
    this.circuit.wires=this.circuit.wires.filter(w=>pin.side==='inputs'?!(w.to===pin.id&&w.in===pin.index):!(w.from===pin.id&&w.out===pin.index));
    const count=before-this.circuit.wires.length;
    this.pending=null;this.selected=null;
    if(count&&this.changed()===false){this.render();return;}
    this.render();this.onMessage(count?`${count===1?'Wire':'Wires'} disconnected. Drag from the terminal to reconnect.`:'No wire on this terminal. Drag to an opposite terminal to connect.');
  }
  overTrash(e){
    if(!this.trashTarget)return false;
    const r=this.trashTarget.getBoundingClientRect();return e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;
  }
  clear(){
    if(this.readOnly)return false;
    this.cancelDrag();this.cancelWire();
    const changed=this.circuit.wires.length>0||this.circuit.nodes.some(n=>!n.fixed);
    if(this.circuit.layout?.aluFoundation)this.circuit=aluCircuit();else if(this.circuit.layout?.subtractor)this.circuit=subtractorCircuit();else if(this.circuit.layout?.ripple)this.circuit=rippleCircuit();else{this.circuit.nodes=this.circuit.nodes.filter(n=>n.fixed||n.equipment);this.circuit.wires=[];}
    this.selected=null;this.pending=null;
    if(changed&&this.changed()===false){this.render();return;}
    this.render();this.onMessage(changed?(this.circuit.layout?.aluFoundation?'Upgrade cleared. The original working adder is restored.':'Panel cleared. Fixed terminals are ready for a new circuit.'):'Panel is already clear.');
  }
  removeNode(){
    if(this.readOnly)return false;
    const node=this.selected?.type==='node'&&this.circuit.nodes.find(n=>n.id===this.selected.id&&!n.fixed);
    if(!node){this.onMessage('Select a movable gate, then use the trash icon.');return;}
    if(this.remove()!==false)this.onMessage(`${node.type} gate removed with its attached wires.`);
  }
  doubleClick(e){
    if(this.readOnly||e.button!==0||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||this.drag||this.wiring||this.pan)return;
    // Rendering replaces SVG children between clicks; hit-test the current gate body.
    const target=this.svg.ownerDocument.elementFromPoint(e.clientX,e.clientY);
    if(!target||!this.svg.contains(target)||target.closest('[data-pin],[data-toggle],[data-wire]'))return;
    const id=target.closest('[data-node]')?.dataset.node,node=this.circuit.nodes.find(n=>n.id===id);
    if(!node||node.fixed||this.doubleClickGate!==id)return;
    e.preventDefault();e.stopPropagation();this.lastGateClick=null;this.doubleClickGate=null;
    this.selected={type:'node',id};this.removeNode();
  }
  cancelDrag(){
    this.lastGateClick=null;this.doubleClickGate=null;
    if(!this.drag)return;
    const {id,start,pointerId}=this.drag,node=this.circuit.nodes.find(n=>n.id===id);
    if(node&&start){node.x=start.x;node.y=start.y;}
    this.drag=null;this.trashTarget?.classList.remove('drag-over');
    if(this.svg.hasPointerCapture(pointerId))this.svg.releasePointerCapture(pointerId);
    this.render();
  }
  cancelWire(){
    const pointerId=this.wiring?.pointerId;this.wiring=null;this.pending=null;
    if(pointerId!==undefined&&this.svg.hasPointerCapture(pointerId))this.svg.releasePointerCapture(pointerId);
    this.render();
  }
  add(type,position){
    if(this.readOnly)return false;
    if(this.circuit.layout?.aluFoundation&&(!['XOR4','FAN4'].includes(type)||this.circuit.nodes.some(n=>n.type===type))){this.onMessage('Use one XOR4 and one FAN4 to upgrade the installed adder.',true);return false;}
    if(this.circuit.layout?.subtractor&&(!['FA1','NOT4'].includes(type)||this.circuit.nodes.filter(n=>!n.fixed&&n.type===type).length>=(type==='FA1'?4:1))){this.onMessage('Use four Full Adders and one NOT4. Remove a module to return it to the toolbox.',true);return false;}
    if(this.circuit.layout?.ripple&&!this.circuit.layout?.subtractor&&!this.circuit.layout?.aluFoundation&&this.circuit.nodes.filter(n=>!n.fixed).length>=4){this.onMessage('All four Full Adders are on the board. Remove one to return it to the toolbox.',true);return false;}
    if(this.circuit.nodes.filter(n=>!n.fixed).length>=32){this.onMessage('This panel supports up to 32 components.',true);return;}
    const count=this.circuit.nodes.filter(n=>!n.fixed).length;
    let id=`g${count+1}`;while(this.circuit.nodes.some(n=>n.id===id))id=`g${Number(id.slice(1))+1}`;
    this.circuit.nodes.push({id,type,x:position?Math.max(185,Math.min(765,position.x-53)):230+(count%4)*152,y:position?Math.max(36,Math.min(this.height-100,position.y-34)):Math.min(this.height-100,48+Math.floor(count/4)%5*90)});
    if(this.circuit.layout?.aluFoundation)this.circuit.nodes.at(-1).aluModule=true;
    if(this.theme==='illustrated'){const n=this.circuit.nodes.at(-1);this.styleNode(n);n.x=position?Math.max(250,Math.min(688,position.x-56)):360+(count%3)*145;n.y=position?Math.max(30,Math.min(this.height-104,position.y-42)):this.compact?Math.min(this.height-94,24+Math.floor(count/3)*96):102;}
    if(this.workbench){const n=this.circuit.nodes.at(-1),view=this.view||{x:0,y:0,width:this.width,height:this.height},pos=position?{x:position.x-size(n).w/2,y:position.y-size(n).h/2}:emptyGatePosition({nodes:this.circuit.nodes.slice(0,-1)},type,this.width,this.height,{x:view.x+view.width/2,y:view.y+view.height/2});Object.assign(n,pos);clampGate(n,this.width,this.height);}
    if(this.circuit.layout?.aluFoundation&&!position)Object.assign(this.circuit.nodes.at(-1),type==='XOR4'?{x:470,y:315}:{x:290,y:420});
    if(this.circuit.layout?.ripple&&!this.circuit.layout?.aluFoundation&&!position&&['FA1','NOT4'].includes(type)){const node=this.circuit.nodes.at(-1),suggestions=type==='NOT4'?[NOT4_PLACEMENT]:ARITHMETIC_PLACEMENTS;const slot=suggestions.find(p=>!this.circuit.nodes.slice(0,-1).some(other=>overlaps({...node,...p},other,8)));if(slot)Object.assign(node,slot);}
    this.selected={type:'node',id};this.changed();this.render();
  }
  remove(){
    if(this.readOnly)return false;
    if(!this.selected){this.onMessage('Select a wire or movable gate first, then delete.');return;}
    const {type,id}=this.selected;
    if(type==='node') {const n=this.circuit.nodes.find(n=>n.id===id);if(n?.equipment){this.onMessage(n.aluModule?'The installed ADD4C stays in the panel. Upgrade its B and CIN connections.':'The installed comparator stays in this diagnostic rack. Reconnect its sensor wires.');return false;}if(n?.fixed){this.onMessage('Panel terminals stay in place. Delete their wires to reconnect them.');return;}this.circuit.nodes=this.circuit.nodes.filter(n=>n.id!==id);this.circuit.wires=this.circuit.wires.filter(w=>w.from!==id&&w.to!==id);}
    else this.circuit.wires=this.circuit.wires.filter(w=>w.id!==id);
    this.selected=null;this.pending=null;const accepted=this.changed();this.render();return accepted;
  }
  changed(){
    if(this.readOnly)return false;
    const result=this.onChange(this.circuit);
    if(result?.ok===false){if(this.committedCircuit)this.circuit=structuredClone(this.committedCircuit);for(const n of this.circuit.nodes)if(this.theme==='illustrated')this.styleNode(n);this.selected=null;return false;}
    if(result?.circuit){this.circuit=structuredClone(result.circuit);for(const n of this.circuit.nodes)if(this.theme==='illustrated')this.styleNode(n);}
    this.committedCircuit=structuredClone(this.circuit);return true;
  }
  styleNode(node){Object.defineProperty(node,'artStyle',{value:'illustrated',configurable:true});Object.defineProperty(node,'moduleScale',{value:(this.compact&&!this.workbench&&node.fixed)? .78 : 1,configurable:true});}
}
