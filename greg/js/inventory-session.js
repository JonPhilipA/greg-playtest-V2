/** Browser writer lease and exact snapshot precondition; separate from inventory quantities. */
export const PILOT_SAVE_KEY='greg-inventory-pilot-v1';
const sessions=new WeakMap();
export const pilotSessionFor=w=>sessions.get(w);
export class InventorySession{
 constructor({storage,locks=globalThis.navigator?.locks,key=PILOT_SAVE_KEY}={}){this.storage=storage;this.locks=locks;this.key=key;this.active=false;this.stale=false;this.message='';this.baseRaw=null;}
 async acquire(){
  if(this.active)return true;
  if(!this.locks?.request){this.message='This browser cannot safely lock the inventory save. Use a browser with Web Locks support.';return false;}
  return new Promise(resolve=>{
   this.task=this.locks.request('greg-writer:'+this.key,{mode:'exclusive',ifAvailable:true},async lock=>{
    if(!lock){this.message='This inventory save is active in another tab. Close that tab, then reload here.';resolve(false);return;}
    try{this.baseRaw=this.storage.getItem(this.key);this.active=true;resolve(true);await new Promise(done=>{this.unlock=done;});}catch(e){this.message='Inventory storage is unavailable: '+e.message;resolve(false);}finally{this.active=false;}
   }).catch(e=>{this.message='The inventory save lock failed: '+e.message;resolve(false);});
  });
 }
 bind(w){sessions.set(w,this);return w;}
 check(){
  if(!this.active||this.stale){this.message||='This inventory save is active in another tab. Reload safely to continue.';return false;}
  try{if(this.storage.getItem(this.key)!==this.baseRaw){this.stale=true;this.message='The inventory save changed in another tab. Reload the current state; counts will not be merged.';return false;}return true;}
  catch(e){this.message='Inventory storage is unavailable: '+e.message;return false;}
 }
 commit(w,serialize){
  if(!this.check())return false;
  try{const raw=serialize(w);this.storage.setItem(this.key,raw);if(this.storage.getItem(this.key)!==raw){this.stale=true;this.message='The inventory save could not be verified. Reload the current state.';return false;}this.baseRaw=raw;this.message='';return true;}
  catch(e){this.message='Inventory changes were not committed: '+e.message;return false;}
 }
 release(){this.active=false;this.unlock?.();this.unlock=null;}
}
