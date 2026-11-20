import {OUTFITTER_CATALOG,cosmeticItem} from './outfitter-catalog.js';
import {creditBalance} from './credits.js';
import {creditEmblem} from './credit-visual.js';
import {Renderer} from './renderer.js';
import {renderCosmeticFrame,cosmeticPortrait} from './outfitter-preview.js';
const number=n=>n.toLocaleString('en-US');
export function cosmeticsForView(world,character,view){const owned=world.foundation.outfitter.owned[character];return OUTFITTER_CATALOG[character].filter(item=>owned.includes(item.id)===(view==='closet'));}
export class OutfitterUI{
 constructor(host,{world,assets,command,close,reduced=()=>false}={}){
  Object.assign(this,{host,world,assets,command,close,reduced});this.character='engineer';this.view='shop';this.selected=null;this.selections=new Map();this.time=0;this.confirmation=null;
  host.innerHTML=`<section class="outfitter-window" role="dialog" aria-modal="true" aria-labelledby="outfitter-title"><header><div><small>CREW APPEARANCE SYSTEM</small><h2 id="outfitter-title" tabindex="-1">SHOP &amp; COSMETICS</h2></div><div class="outfitter-balance">${creditEmblem({decorative:true})}<strong></strong><span>Credits</span></div><button class="close-window" data-outfit="close" aria-label="Close Outfitter">×</button></header><nav class="outfitter-views" role="tablist" aria-label="Cosmetic collections"><button role="tab" id="outfit-view-shop" data-outfit="view" data-view="shop" aria-controls="outfit-body">SHOP</button><button role="tab" id="outfit-view-closet" data-outfit="view" data-view="closet" aria-controls="outfit-body">CLOSET</button></nav><nav class="outfitter-characters" role="tablist" aria-label="Character catalogs"><button role="tab" id="outfit-tab-engineer" data-outfit="tab" data-character="engineer" aria-controls="outfit-catalog">ENGINEER SUITS</button><button role="tab" id="outfit-tab-greg" data-outfit="tab" data-character="greg" aria-controls="outfit-catalog">G.R.E.G. SHELLS</button></nav><div class="outfitter-body" id="outfit-body" role="tabpanel"><section class="outfitter-collection"><p class="outfitter-count"></p><div class="outfitter-catalog" id="outfit-catalog" role="tabpanel"></div></section><section class="outfitter-preview"><div class="outfitter-stage"><canvas aria-label="Selected appearance preview" role="img"></canvas></div><div class="outfitter-selection"></div><div class="outfitter-action"></div><p class="outfitter-status" role="status" aria-live="polite"></p></section></div><footer>Appearance only · Your equipment and abilities stay the same.</footer></section>`;
  this.renderer=new Renderer(host.querySelector('.outfitter-stage canvas'),assets);
  this.resize=new ResizeObserver(()=>{const stage=host.querySelector('.outfitter-stage');this.width=stage.clientWidth;this.height=stage.clientHeight;this.pixelRatio=Math.min(2,devicePixelRatio||1);this.renderer.canvas.width=Math.max(1,Math.round(this.width*this.pixelRatio));this.renderer.canvas.height=Math.max(1,Math.round(this.height*this.pixelRatio));this.tick(0);});this.resize.observe(host.querySelector('.outfitter-stage'));
  this.listener=e=>{const b=e.target.closest('[data-outfit]');if(b&&!b.disabled)this.act(b);};host.addEventListener('click',this.listener);
  this.keyListener=e=>{if(e.target.getAttribute('role')!=='tab'||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const group=e.target.closest('[role="tablist"]'),tabs=[...group.querySelectorAll('[role="tab"]')],index=tabs.indexOf(e.target),next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(index+(e.key==='ArrowLeft'?-1:1)+tabs.length)%tabs.length,b=tabs[next];if(b.dataset.view)this.switchView(b.dataset.view);else this.tab(b.dataset.character);this.host.querySelector('#'+b.id).focus();};host.addEventListener('keydown',this.keyListener);
  this.render();host.querySelector('h2').focus({preventScroll:true});
 }
 remember(){if(this.selected)this.selections.set(this.view+':'+this.character,this.selected);}
 navigate(view,character){this.remember();this.view=view;this.character=character;this.selected=this.selections.get(view+':'+character)||null;this.confirmation=null;this.render();this.host.querySelector('.outfitter-status').textContent='';this.host.querySelector('.outfitter-catalog').scrollTop=0;}
 tab(character){this.navigate(this.view,character);}
 switchView(view){this.navigate(view,this.character);}
 render(){
  const w=this.world(),o=w.foundation.outfitter,balance=creditBalance(w),items=cosmeticsForView(w,this.character,this.view);
  if(!items.some(item=>item.id===this.selected))this.selected=items.find(item=>item.id===o.equipped[this.character])?.id||items[0]?.id||o.equipped[this.character];
  const item=cosmeticItem(this.character,this.selected),owned=o.owned[this.character].includes(item.id),equipped=o.equipped[this.character]===item.id;this.remember();
  this.host.querySelector('.outfitter-balance strong').textContent=number(balance);
  for(const tab of this.host.querySelectorAll('[role="tab"]')){const active=tab.dataset.view?tab.dataset.view===this.view:tab.dataset.character===this.character;tab.setAttribute('aria-selected',active);tab.tabIndex=active?0:-1;}
  this.host.querySelector('#outfit-body').setAttribute('aria-labelledby','outfit-view-'+this.view);
  const catalog=this.host.querySelector('.outfitter-catalog'),scroll=catalog.scrollTop;catalog.setAttribute('aria-labelledby','outfit-tab-'+this.character);
  this.host.querySelector('.outfitter-count').textContent=items.length+' '+(this.view==='shop'?'available appearances':'collected appearances');
  catalog.innerHTML=items.length?items.map(i=>`<button class="outfitter-card" data-outfit="select" data-id="${i.id}" aria-pressed="${i.id===item.id}"><canvas class="outfit-portrait" width="128" height="128" aria-hidden="true" data-portrait="${i.id}"></canvas><span class="outfit-card-copy"><strong>${i.name}</strong><span>${this.view==='closet'?(o.equipped[this.character]===i.id?'EQUIPPED':'OWNED'):number(i.price)+' Credits'}</span></span></button>`).join(''):'<div class="outfitter-empty"><strong>Collection complete</strong><p>You own every appearance for this character. Find them in your Closet.</p><button class="brass-button" data-outfit="closet">OPEN CLOSET</button></div>';
  for(const canvas of catalog.querySelectorAll('[data-portrait]'))canvas.getContext('2d').drawImage(cosmeticPortrait(cosmeticItem(this.character,canvas.dataset.portrait),w,this.assets),0,0);catalog.scrollTop=scroll;
  this.host.querySelector('.outfitter-selection').innerHTML=`<small>${this.character==='engineer'?'ENGINEER SUIT':'G.R.E.G. SHELL'}</small><h3>${item.name}</h3><span>${equipped?'CURRENTLY EQUIPPED':owned?'OWNED · EQUIP FOR FREE':number(item.price)+' Credits'}</span>`;
  const target=this.host.querySelector('.outfitter-action');
  if(this.confirmation){const c=this.confirmation;target.innerHTML=`<section class="outfitter-confirmation" aria-label="Purchase complete"><strong>PURCHASE COMPLETE!</strong><span>${cosmeticItem(c.character,c.itemId).name} ${c.character==='engineer'?'suit':'shell'} unlocked</span><small>${number(c.spent)} CREDITS SPENT</small><div><button class="brass-button" data-outfit="equip-now">EQUIP NOW</button><button class="brass-button subtle" data-outfit="later">MAYBE LATER</button></div></section>`;}
  else if(!items.length)target.innerHTML='<button class="brass-button outfit-primary" data-outfit="closet">OPEN CLOSET</button>';
  else target.innerHTML=`<button class="brass-button outfit-primary" data-outfit="${owned?'equip':'buy'}" ${equipped||!owned&&balance<item.price?'disabled':''}>${equipped?'EQUIPPED':owned?'EQUIP':balance<item.price?'INSUFFICIENT CREDITS':'BUY — '+number(item.price)+' CREDITS'}</button>`;
  this.renderer.canvas.setAttribute('aria-label',(this.character==='engineer'?'Engineer':'G.R.E.G.')+' full-body preview: '+item.name);this.tick(0);
 }
 focusAction(){(this.host.querySelector('.outfit-primary:not(:disabled)')||this.host.querySelector(`[data-id="${this.selected}"]`)||this.host.querySelector('[data-outfit="closet"]'))?.focus({preventScroll:true});}
 act(b){
  if(b.dataset.outfit==='close'){this.close();return;}
  if(b.dataset.outfit==='view'||b.dataset.outfit==='closet'){this.switchView(b.dataset.view||'closet');return;}
  if(b.dataset.outfit==='tab'){this.tab(b.dataset.character);return;}
  if(b.dataset.outfit==='select'){this.selected=b.dataset.id;this.confirmation=null;this.render();this.host.querySelector('.outfitter-status').textContent='';this.host.querySelector(`[data-id="${this.selected}"]`).focus({preventScroll:true});return;}
  if(b.dataset.outfit==='later'){this.confirmation=null;this.render();this.focusAction();return;}
  const buy=b.dataset.outfit==='buy',c=b.dataset.outfit==='equip-now'?this.confirmation:{character:this.character,itemId:this.selected};if(!c)return;
  const r=this.command({type:buy?'BUY_COSMETIC':'EQUIP_COSMETIC',character:c.character,cosmeticId:c.itemId});
  if(!r.ok){this.host.querySelector('.outfitter-status').textContent=r.error;return;}
  if(buy){this.view='closet';this.character=c.character;this.selected=c.itemId;}
  this.confirmation=buy&&r.purchased?r:null;this.render();this.host.querySelector('.outfitter-status').textContent=buy?(r.duplicate?'Already owned.':'Purchase saved. Added to Closet.'):'Appearance equipped.';
  if(this.confirmation)this.host.querySelector('[data-outfit="equip-now"]').focus({preventScroll:true});else this.focusAction();
 }
 tick(dt){
  this.time+=Math.min(.05,dt);if(!this.width||!this.height)return;
  renderCosmeticFrame(this.renderer,cosmeticItem(this.character,this.selected),this.world(),{width:this.width,height:this.height,pixelRatio:this.pixelRatio,time:this.time,reduced:this.reduced()||matchMedia('(prefers-reduced-motion: reduce)').matches});
 }
 dispose(){this.resize.disconnect();this.host.removeEventListener('click',this.listener);this.host.removeEventListener('keydown',this.keyListener);}
}
