import {usesFabricatedInventory,fabricatedAvailable,manufacturedSupply,automaticallySupplied} from './fabrication.js';
import {taskId} from './curriculum-profile.js';
import {inventoryRows,usesFiniteInventory} from './inventory-gameplay.js';
import {GetAvailableGates,FINITE_BUDGETS} from './inventory.js';
import {REPAIRS} from './repairs.js';
import {gateSymbol} from './panel-art.js';
import {getBlueprint} from './blueprints.js';

export function quantityBadge(quantity,{unlimited=false,authorized=false,compatibility=false,practice=false}={}){
 if(unlimited&&authorized)return '∞';
 return String(Math.max(0,Number.isSafeInteger(quantity)?quantity:0));
}
export function componentCards(w,puzzleId,{practice=false,graph=null}={}){
 const p=Object.hasOwn(REPAIRS,puzzleId)?REPAIRS[puzzleId]:null;if(!p)return [];
 if(!practice&&puzzleId==='sensordiff'&&w.foundation.curriculum.xorUseVersion!==1)return [];
 const manufactured=!practice&&usesFabricatedInventory(w,puzzleId),finite=!practice&&(usesFiniteInventory(w,puzzleId)||manufactured),types=finite&&!manufactured?Object.keys(FINITE_BUDGETS[taskId(w,puzzleId)]):p.gates;
 if(puzzleId==='float_nav')return ['XOR4','FAN4'].map(type=>{const quantity=Math.max(0,1-(graph||w.circuits[puzzleId]).nodes.filter(n=>n.type===type).length);return {type,quantity,finite:true,practice,automatic:manufactured&&automaticallySupplied(w,type),disabled:!quantity||!practice&&w.machines[puzzleId].certified,badge:String(quantity)};});
 if(puzzleId==='addsub')return ['FA1','NOT4'].map(type=>{const limit=type==='FA1'?4:1,placed=(graph||w.circuits[puzzleId]).nodes.filter(n=>!n.fixed&&n.type===type).length,quantity=Math.max(0,limit-placed);return {type,quantity,finite:true,practice,automatic:manufactured&&automaticallySupplied(w,type),disabled:!quantity||!practice&&w.machines[puzzleId].certified,badge:String(quantity)};});
 if(puzzleId==='ripple_adder')return [{type:'FA1',quantity:Math.max(0,4-(graph||w.circuits[puzzleId]).nodes.filter(n=>!n.fixed).length),finite:true,practice,automatic:manufactured&&automaticallySupplied(w,'FA1'),disabled:!practice&&w.machines[puzzleId].certified||(graph||w.circuits[puzzleId]).nodes.filter(n=>!n.fixed).length>=4,badge:String(Math.max(0,4-(graph||w.circuits[puzzleId]).nodes.filter(n=>!n.fixed).length))}];
 return types.map(type=>{const quantity=manufactured?manufacturedSupply(w,type):finite?GetAvailableGates(w.foundation.inventory,type).length:0;return {type,quantity,automatic:manufactured&&automaticallySupplied(w,type),finite,practice,compatibility:!finite&&!practice,disabled:finite&&(!quantity||w.machines[puzzleId].certified),badge:quantityBadge(quantity,{unlimited:!finite,authorized:!finite})};});
}
export function inventoryMarkup(w,puzzleId){
 const rows=inventoryRows(w,puzzleId).filter(r=>puzzleId?r.permitted:r.available+r.reserved+r.installed>0);
 return rows.length?'<div class="physical-inventory" aria-label="Physical components">'+rows.map(r=>`<div class="stock-card ${r.available?'':'unavailable'}" data-stock="${r.type}" data-available="${r.available}" data-reserved="${r.reserved}" data-installed="${r.installed}" title="${r.type}: ${r.available} ${r.automatic?'automatically supplied':'loose'}, ${r.reserved} in drafts, ${r.installed} installed"><svg viewBox="0 0 42 34" aria-hidden="true">${gateSymbol(r.type)}</svg><strong>${r.type}</strong><b class="quantity-badge" aria-label="${r.available} available for placement">${r.available}</b></div>`).join('')+'</div>':'<p class="stock-empty">No loose components collected yet.</p>';
}
export function drawingInventoryMarkup(w){
 const drawings=Object.keys(w.foundation.blueprints.acquired).map(getBlueprint).filter(Boolean);
 return drawings.length?'<h3>Optional drawings</h3><div class="teaching-actions">'+drawings.map(p=>`<button class="brass-button subtle" data-action="drawing-${p.id}">Read ${p.name}</button>`).join('')+'</div>':'';
}
/** Retained Package 2 adapter; the general presentation bridge supplies the preset per accepted event. */
export function presentInventoryEvents(events,{effect=()=>{},onEvent=()=>{}}={}){
 for(const e of events||[])if(e.type.startsWith('component.')){
  try{onEvent(structuredClone(e));}catch{}
  const id={'component.picked_up':'S01','component.placed':'S02','component.returned':'S04'}[e.type];
  if(id)try{effect(id);}catch{}
 }
}
