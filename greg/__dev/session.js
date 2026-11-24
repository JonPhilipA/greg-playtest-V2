import {InventorySession} from '../js/inventory-session.js';
import {serialize,restore} from '../js/world.js';
import {validateInventory} from '../js/inventory.js';
import {validateFabrication} from '../js/fabrication.js';
import {isEarly} from '../js/curriculum-profile.js';
import {buildFixture} from './fixtures.js';
export const developerKey=mode=>mode==='legacy'?'greg-developer-legacy-v1':'greg-developer-curriculum-v1';
export class DeveloperSession{
 constructor({storage,locks,mode='curriculum'}={}){this.mode=mode==='legacy'?'legacy':'curriculum';this.key=developerKey(this.mode);this.storage=storage;this.writer=new InventorySession({storage,locks,key:this.key});const check=this.writer.check.bind(this.writer);this.writer.check=()=>{if(this.invalidSnapshot){this.writer.message='Developer snapshot preserved. Confirm RESET DEVELOPER SESSION before replacing it.';return false;}return check();};}
 async initialize(){await this.writer.acquire();if(!this.writer.active)throw Error(this.writer.message);const raw=this.writer.baseRaw;
  this.world=raw?restore(raw):await buildFixture('ventilation',{mode:this.mode});
  if(raw&&(this.world.saveProtection?.blocked||(isEarly(this.world)!==(this.mode==='curriculum')))){this.invalidSnapshot=true;this.world=await buildFixture('ventilation',{mode:this.mode});}
  this.writer.bind(this.world);if(!raw&&!this.save(this.world))throw Error(this.writer.message);return this.world;
 }
 allowReset(){this.invalidSnapshot=false;this.writer.message='';}
 bind(world){this.world=world;this.writer.bind(world);return world;}
 save(world){if(world.environmentPreview)return true;return this.writer.commit(world,w=>{validateFabrication(w);if(w.foundation.inventory.version&& !validateInventory(w.foundation.inventory).ok)throw Error('Invalid developer inventory.');const raw=serialize(w),check=restore(raw);if(check.saveProtection?.blocked)throw Error(check.loadIssue||'Invalid developer snapshot.');return raw;});}
 release(){this.writer.release();}
}
