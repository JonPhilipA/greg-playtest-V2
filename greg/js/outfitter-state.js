import {DEFAULT_COSMETICS,cosmeticItem} from './outfitter-catalog.js';
import {deductAuthorizedCredits} from './credits.js';
import {corePowered} from './opening-state.js';
export const createOutfitter=()=>({version:1,unlocked:false,owned:{engineer:['regular'],greg:['standard']},equipped:{...DEFAULT_COSMETICS}});
const beyondEngine=w=>(w.discovered||[]).some(r=>r!=='engine')||(w.flags||[]).includes('entered_corridor')||w.room!=='engine';
export const outfitterUnlocked=w=>corePowered(w)&&(w.foundation.outfitter?.unlocked===true||!!w.machines?.ventilation?.certified&&beyondEngine(w));
export function restoreOutfitter(w,saved){
 const o=createOutfitter();
 // No previous shared ownership or purchase system shipped: legacy palettes were preview-only.
 for(const character of Object.keys(DEFAULT_COSMETICS)){
  if(Array.isArray(saved?.owned?.[character]))o.owned[character]=[...new Set([DEFAULT_COSMETICS[character],...saved.owned[character].filter(id=>cosmeticItem(character,id))])];
  if(o.owned[character].includes(saved?.equipped?.[character]))o.equipped[character]=saved.equipped[character];
 }
 o.unlocked=saved?.unlocked===true||!!w.machines?.ventilation?.certified&&beyondEngine(w);w.foundation.outfitter=o;return o;
}
export function equippedCosmetic(w,character){const o=w.foundation?.outfitter,id=o?.equipped?.[character];return cosmeticItem(character,o?.owned?.[character]?.includes(id)?id:DEFAULT_COSMETICS[character]);}
/** Runs exclusively inside the existing cloned, persisted command transaction. */
export function outfitterCommand(w,c,transactionId){
 if(w.saveProtection?.blocked)throw Error('Recover the protected notebook before changing cosmetics.');
 if(!outfitterUnlocked(w))throw Error('Available after completing the Engine Room and entering the Maintenance Corridor.');
 const item=cosmeticItem(c.character,c.cosmeticId);if(!item)throw Error('Unknown character or cosmetic.');
 const o=w.foundation.outfitter,owned=o.owned[item.character];
 if(c.type==='BUY_COSMETIC'){
  if(owned.includes(item.id))return {duplicate:true,itemId:item.id,character:item.character};
  const purchaseId='outfitter:'+item.character+':'+item.id;
  const receipt=deductAuthorizedCredits(w,{purchaseId,amount:item.price},{authorize:()=>transactionId});
  owned.push(item.id);return {purchased:true,character:item.character,itemId:item.id,...receipt};
 }
 if(!owned.includes(item.id))throw Error('Purchase this appearance before equipping it.');
 if(o.equipped[item.character]===item.id)return {duplicate:true};
 o.equipped[item.character]=item.id;return {equipped:true,character:item.character,itemId:item.id};
}
