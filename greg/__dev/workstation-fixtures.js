import {buildFixture} from './fixtures.js';
import {SCENE_WORKSTATIONS} from '/js/scene-workstations.js';
import {puzzleIntroKey} from '/js/puzzle-explanations.js';
import {InventorySession} from '/js/inventory-session.js';
/** Real prerequisite commands and inventory, in disposable memory; never a second puzzle implementation. */
export async function buildWorkstationFixture(key,stationId=null){
 const stations=Object.hasOwn(SCENE_WORKSTATIONS,key)?SCENE_WORKSTATIONS[key]:null,station=stations?.find(s=>s.id===stationId)||(!stationId?stations?.[0]:null);
 if(!station)throw Error('Select a known scene workstation.');
 const w=await buildFixture(station.fixture);w.environmentPreview=key;w.environmentWorkstations=true;
 // The fixture uses the same physical and authoritative room as the production campaign.
 w.room=key==='gallery'?'sensors':key;w.positions[w.room]=stationId?station.walk:70;
 if(station.puzzleId)w.dialogueSeen=w.dialogueSeen.filter(id=>id!==puzzleIntroKey(station.puzzleId,w));
 if(!w.dialogueSeen.includes('story-fabricator-online'))w.dialogueSeen.push('story-fabricator-online');
 return w;
}
/** Preserve the exact transaction/lease boundary while all serialized results stay in private memory. */
export async function createWorkstationWriter(w,locks){
 const data=new Map(),writer=new InventorySession({storage:{getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)},locks,key:'greg-scene-fixture-'+globalThis.crypto.randomUUID()});
 await writer.acquire();if(!writer.active)throw Error(writer.message||'Cannot acquire a temporary fixture writer.');writer.bind(w);return writer;
}
