// Presentation-only pagination. Original controls/nodes survive page changes; no game commands.
const skipKinds=new Set(['manual','inventory','journal','pause','fabricator','fabricator-lock','drawings','drawing']);
export const scrollablePopup=kind=>skipKinds.has(kind);
const readingKinds=new Set(['story-conversation','opening-conversation','component-lesson','help','mission-briefing','learn-overview','demorgan']);
/** Paging is a reading policy, never an automatic layout repair for results or action menus. */
export function paginatedPopup(root){
 if(!root||root.matches?.('.verification-result-copy,.verification-window,.console-result,.discovery-dialog')||root.closest?.('.verification-window'))return false;
 const mode=root.dataset?.popupPagination,kind=root.dataset?.popupKind;
 if(mode==='none'||mode==='staged'||scrollablePopup(kind))return false;
 return mode==='pages'||readingKinds.has(kind)||root.matches?.('.console-help')===true;
}
export function textPages(text,limit=240){
 const words=String(text).split(/\s+/).filter(Boolean),pages=[];let page='';
 for(const word of words){if(page&&page.length+word.length+1>limit){pages.push(page);page='';}page+=(page?' ':'')+word;}if(page)pages.push(page);return pages.length?pages:[''];
}
const visible=el=>!el.hidden&&el.getClientRects().length>0;
function textParts(node,limit){
 const text=node.textContent;if(text.length<=limit)return [node];const out=[];let start=0;
 // Ranges retain inline emphasis/code/link markup, rather than discarding it for plain text.
 const locate=offset=>{const walker=node.ownerDocument.createTreeWalker(node,4);let n,total=0;while((n=walker.nextNode())){if(total+n.length>=offset)return [n,offset-total];total+=n.length;}return [node,node.childNodes.length];};
 while(start<text.length){let end=Math.min(text.length,start+limit);if(end<text.length){const space=text.slice(start,end).search(/\s+\S*$/);if(space>0)end=start+space+1;}const range=node.ownerDocument.createRange(),a=locate(start),b=locate(end);range.setStart(...a);range.setEnd(...b);const part=node.cloneNode(false);part.removeAttribute('id');part.append(range.cloneContents());out.push(part);start=end;}return out;
}
export function paginatePopup(root){
 if(!root?.ownerDocument?.createElement||!paginatedPopup(root)||root.popupPages||!visible(root))return root?.popupPages||null;
 const doc=root.ownerDocument,original=[...root.children],initialFocus=root.contains(doc.activeElement)?doc.activeElement:null,isPaper=root.matches('.paper-window'),isDiscovery=root.matches('.discovery-dialog');
 const headerNodes=original.filter(n=>n.matches(isPaper?'.close-window,.kicker,h2':isDiscovery?'.discovery-copy':'header,h3,.verification-status-label'));
 const footerNodes=original.filter(n=>n.matches('.window-actions,.discovery-actions,.diagnostic-controls'));
 const nodes=original.filter(n=>!headerNodes.includes(n)&&!footerNodes.includes(n));
 const make=cls=>{const el=doc.createElement('div');el.className=cls;return el;},header=make('popup-page-header'),body=make('popup-page-body'),footer=make('popup-page-footer'),actions=make('popup-page-actions'),nav=doc.createElement('nav');nav.className='popup-page-navigation';nav.setAttribute('aria-label','Message pages');
 nav.innerHTML='<button type="button" class="brass-button subtle" data-popup-page="back">BACK</button><span role="status" aria-live="polite"></span><button type="button" class="brass-button" data-popup-page="next">CONTINUE</button>';
 header.append(...headerNodes);actions.append(...footerNodes);footer.append(nav,actions);root.replaceChildren(header,body,footer);root.classList.add('paged-popup');
 let pages=[],index=0,disposed=false,frame=0;const tables=new Map(),containers=new Map();
 const restoreTables=()=>{for(const [table,rows]of tables)table.tBodies[0]?.replaceChildren(...rows);tables.clear();for(const [container,children]of containers)container.replaceChildren(...children);containers.clear();};
 const show=(next,focus=false)=>{index=Math.max(0,Math.min(next,pages.length-1));pages.forEach((page,i)=>{page.hidden=i!==index;page.inert=i!==index;});nav.hidden=pages.length<=1;nav.querySelector('[data-popup-page="back"]').hidden=index===0;nav.querySelector('[data-popup-page="next"]').hidden=index===pages.length-1;nav.querySelector('span').textContent='PAGE '+(index+1)+' / '+pages.length;actions.hidden=index<pages.length-1;root.dataset.popupPage=String(index+1);root.dataset.popupPages=String(pages.length);if(focus)(index<pages.length-1?nav.querySelector('[data-popup-page="next"]'):actions.querySelector('button'))?.focus({preventScroll:true});};
 const layout=()=>{
  if(disposed||!root.isConnected||!visible(root))return;const focus=root.contains(doc.activeElement)?doc.activeElement:initialFocus;restoreTables();body.replaceChildren(...nodes);actions.hidden=false;nav.hidden=false;
  const game=doc.querySelector('#game'),bounds=game?.getBoundingClientRect(),parent=root.closest('.developer-replay-content')?.getBoundingClientRect();let maximum=Math.max(160,Math.min(bounds?.height||innerHeight,parent?.height||innerHeight,innerHeight)-28);
  const verification=root.closest('.verification-window');if(verification){const style=getComputedStyle(verification),headerHeight=verification.querySelector(':scope>header')?.getBoundingClientRect().height||0;maximum=Math.min(maximum,Math.max(180,verification.clientHeight-headerHeight-140-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom)-2*(parseFloat(style.rowGap)||0)-12));}
  root.style.setProperty('--popup-max-height',maximum+'px');
  const css=getComputedStyle(root),padding=parseFloat(css.paddingTop)+parseFloat(css.paddingBottom)+parseFloat(css.borderTopWidth)+parseFloat(css.borderBottomWidth),budget=Math.max(50,maximum-padding-header.getBoundingClientRect().height-Math.max(footer.getBoundingClientRect().height,48)-18);
  body.replaceChildren();pages=[];let page;const newPage=()=>{page=make('popup-page');body.append(page);pages.push(page);return page;};newPage();
  const append=node=>{page.append(node);if(page.getBoundingClientRect().height>budget+1&&page.children.length>1){node.remove();newPage().append(node);}};
  const insert=node=>{
   page.append(node);const tooTall=page.getBoundingClientRect().height>budget+1;node.remove();
   if(tooTall&&node.matches('p,pre,blockquote')&&!node.querySelector('button,input,svg,img')){
    let parts=[node],limit=Math.max(40,Math.round(node.textContent.length*.65));while(limit>=40){parts=textParts(node,limit);page.append(parts[0]);const fits=page.getBoundingClientRect().height<=budget+1;parts[0].remove();if(fits||parts.length<=1)break;limit=Math.floor(limit*.65);}for(const part of parts)append(part);return;
   }
   if(tooTall&&node.matches('ul,ol')){for(const item of [...node.children]){const list=node.cloneNode(false);list.append(item.cloneNode(true));insert(list.firstElementChild.tagName==='LI'?Object.assign(doc.createElement('p'),{innerHTML:item.innerHTML}):list);}return;}
   if(tooTall&&node.matches('table,.console-result-rows,.teaching-actions,.briefing-topics,.service-comparison,.discovery-source')){
    if(node.matches('table')){const rows=[...node.tBodies[0].rows],rowHeight=rows[0]?.getBoundingClientRect().height||32,count=Math.max(1,Math.floor((budget-45)/rowHeight));tables.set(node,rows);for(let i=0;i<rows.length;i+=count){const t=node.cloneNode(false);t.removeAttribute('id');if(node.tHead)t.append(node.tHead.cloneNode(true));const tb=doc.createElement('tbody');tb.append(...rows.slice(i,i+count));t.append(tb);append(t);}}else{const children=[...node.children];containers.set(node,children);for(const child of children)insert(child);}return;
   }
   append(node);
  };
  for(const node of nodes)if(node.hidden)body.append(node);else insert(node);if(pages.length>1&&pages.at(-1).children.length===0){pages.pop().remove();}show(index);if(focus&&root.contains(focus)){if(visible(focus))focus.focus({preventScroll:true});else (index<pages.length-1?nav.querySelector('[data-popup-page="next"]'):actions.querySelector('button'))?.focus({preventScroll:true});}
 };
 const next=()=>show(index+1,true),back=()=>show(index-1,true);
 const click=e=>{const button=e.target.closest('button[data-popup-page]');if(button&&root.contains(button)){e.preventDefault();e.stopImmediatePropagation();if(e.detail<=1)(button.dataset.popupPage==='back'?back:next)();}else if(e.detail>1&&footer.contains(e.target)){e.preventDefault();e.stopImmediatePropagation();}};
 const key=e=>{if(e.key==='Tab'){const controls=[...root.querySelectorAll('button:not(:disabled),input,select,[tabindex="0"]')].filter(visible),at=controls.indexOf(doc.activeElement);if(controls.length&&((e.shiftKey&&at<=0)||(!e.shiftKey&&at===controls.length-1))){e.preventDefault();e.stopImmediatePropagation();controls[e.shiftKey?controls.length-1:0].focus();}return;}if(!['Enter',' '].includes(e.key))return;const control=e.target.closest('button[data-popup-page]');if(control||index<pages.length-1&&!e.target.closest('button,input,select,textarea,[role="button"]')){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)(control?.dataset.popupPage==='back'?back:next)();}};
 root.addEventListener('click',click,true);root.addEventListener('keydown',key,true);
 const resize=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(layout);};globalThis.addEventListener?.('resize',resize);root.addEventListener('load',resize,true);
 const controller={next,back,get hasNext(){return index<pages.length-1;},get pageCount(){return pages.length;},layout,dispose(restore=true){disposed=true;cancelAnimationFrame(frame);globalThis.removeEventListener?.('resize',resize);root.removeEventListener('load',resize,true);root.removeEventListener('click',click,true);root.removeEventListener('keydown',key,true);restoreTables();if(restore){root.replaceChildren(...original);root.classList.remove('paged-popup');delete root.dataset.popupPage;delete root.dataset.popupPages;}delete root.popupPages;}};
 root.popupPages=controller;layout();return controller;
}
/** One shared enhancer catches existing paper, instructional and result renderers. */
export function installPopupPagination(host){
 const tracked=new Set();let scheduled=false;
 const scan=()=>{scheduled=false;for(const root of tracked)if(!root.isConnected||!paginatedPopup(root)){root.popupPages?.dispose(root.isConnected);tracked.delete(root);}
  for(const root of host.querySelectorAll('.paper-window,.discovery-dialog,.teaching-window,.console-help,.console-result,.verification-result-copy')){
   if(root.popupPages||!visible(root)||!paginatedPopup(root)||root.querySelector('.diagnostic-table-wrap'))continue;
   if(paginatePopup(root))tracked.add(root);
  }
 };
 const observer=new MutationObserver(()=>{if(!scheduled){scheduled=true;queueMicrotask(scan);}});observer.observe(host,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','data-phase','data-discovery-page','data-popup-pagination']});scan();
 return ()=>{observer.disconnect();for(const root of tracked)root.popupPages?.dispose();};
}
