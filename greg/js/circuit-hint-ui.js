import {circuitHintDefinition,circuitHintView,hintMessage} from './circuit-hints.js';

/** One inline strip; the original HINT action never opens a monitor or modal. */
export class CircuitHintUI{
 constructor({host,id,getWorld,getEditor,send,persist,practice=false}){
  Object.assign(this,{host,id,getWorld,getEditor,send,persist,practice});this.guide=circuitHintDefinition(getWorld(),id);this.view=circuitHintView(getWorld(),id);
  this.strip=host.ownerDocument.createElement('div');this.strip.className='circuit-hint-guidance';this.strip.hidden=true;
  this.strip.innerHTML='<p role="status" aria-live="polite"></p><button type="button" data-circuit-hint="toggle">HIDE HINTS</button>';
  host.querySelector('.repair-instructions').append(this.strip);this.strip.querySelector('button').onclick=()=>this.show(this.view.level,!this.view.visible);this.render();
 }
 show(level,visible=true){
  if(!this.guide){this.strip.hidden=false;this.strip.querySelector('p').textContent=hintMessage(null,0);this.strip.querySelector('button').hidden=true;return false;}
  if(this.practice)this.view={unlocked:Math.max(this.view.unlocked,level),level,visible};
  else{const r=this.send({type:'SET_CIRCUIT_HINT',puzzleId:this.id,view:{level,visible}});if(!r.ok)return false;this.view=circuitHintView(this.getWorld(),this.id);this.persist();}
  this.render();return true;
 }
 next(){if(this.view.unlocked===4&&this.view.level===4&&this.view.visible)return;return this.show(Math.min(4,this.view.unlocked+1));}
 render(){
  const editor=this.getEditor(),active=this.view.level>0;
  this.host.querySelector('[data-action="hint"] span').textContent=active?'HINT '+this.view.level+'/4':'HINT';
  this.strip.hidden=!active;this.strip.parentElement.classList.toggle('has-circuit-hints',active);
  const message=this.view.visible?hintMessage(this.guide,this.view.level):'Guidance hidden; level '+this.view.unlocked+'/4 remains available.';
  this.strip.querySelector('p').textContent='G.R.E.G.: '+(editor?.damageInspection&&this.view.visible?'Clear the burned components first. ':'')+message;
  this.strip.querySelector('button').textContent=this.view.visible?'HIDE HINTS':'SHOW HINTS';
  if(editor){editor.hint={guide:this.guide,...this.view};editor.render();}
 }
}
