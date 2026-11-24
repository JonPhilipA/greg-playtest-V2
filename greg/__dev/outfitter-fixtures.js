import {buildFixture} from './fixtures.js';
import {dispatchCommand} from '/js/world.js';
import {InventorySession} from '/js/inventory-session.js';
import {OUTFITTER_CATALOG} from '/js/outfitter-catalog.js';
export const OUTFITTER_FIXTURES=Object.freeze([
 ['locked','Outfitter · locked / P01 unfinished'],['unlocked','Outfitter · first Corridor visit'],['low','Outfitter · 100 credits'],['high','Outfitter · 100,000 credits'],
 ['engineer','Outfitter · all engineer palettes'],['greg','Outfitter · all G.R.E.G. palettes'],['purchase','Outfitter · ready to purchase'],['maybe-later','Outfitter · Bubblegum owned, not equipped'],['equip-now','Outfitter · Galaxy + Rose equipped'],
]);
/** Isolated Developer Mode fixtures only. No normal-save key or production grant API. */
export async function buildOutfitterFixture(id){
 if(!OUTFITTER_FIXTURES.some(([key])=>key===id))throw Error('Unknown Outfitter fixture.');
 const w=await buildFixture(id==='locked'?'p01-ready':'security');if(id==='locked')return w;
 const amount=['engineer','greg'].includes(id)?OUTFITTER_CATALOG[id].reduce((n,item)=>n+item.price,1000):id==='equip-now'?200000:id==='low'?100:['unlocked','purchase'].includes(id)?1250:100000,c=w.foundation.credits;
 c.claims.ventilation.base=amount;c.claims.ventilation.bonus=0;c.claims.ventilation.total=amount;c.balance=amount;
 const data=new Map(),writer=new InventorySession({key:'outfitter-fixture-memory',storage:{getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)},locks:{request:async(n,o,fn)=>fn({name:n})}});await writer.acquire();writer.bind(w);
 const send=command=>{const r=dispatchCommand(w,command);if(!r.ok)throw Error(r.error);return r;};
 try{
  const buy=(character,cosmeticId)=>send({type:'BUY_COSMETIC',character,cosmeticId}),equip=(character,cosmeticId)=>send({type:'EQUIP_COSMETIC',character,cosmeticId});
  if(['engineer','greg'].includes(id))for(const item of OUTFITTER_CATALOG[id])if(item.price)buy(id,item.id);
  if(id==='maybe-later')buy('engineer','pink');
  if(id==='equip-now'){buy('engineer','galaxy');buy('greg','rose');equip('engineer','galaxy');equip('greg','rose');}
  return w;
 }finally{writer.release();}
}
