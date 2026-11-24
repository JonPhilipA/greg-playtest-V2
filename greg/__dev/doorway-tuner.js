import {DEFAULT_DOORWAY_TUNING,getDoorwayTuning,setDoorwayTuning} from '../js/room-door.js';

const controls=[
 ['brightness','Interior brightness',0,2],
 ['depth','Recess depth',.5,1.5],
 ['warmth','Lighting warmth',0,1],
];
export function openDoorwayTuner(){
 let panel=document.querySelector('#doorway-tuner');
 if(panel){panel.hidden=false;panel.querySelector('input').focus();return;}
 panel=document.createElement('aside');
 panel.id='doorway-tuner';panel.setAttribute('aria-label','Developer doorway tuning');
 panel.innerHTML='<header><strong>DOORWAY TUNING</strong><button data-doorway="close" aria-label="Close doorway tuning">×</button></header>'+
 controls.map(([key,label,min,max])=>'<label for="doorway-'+key+'">'+label+'<output for="doorway-'+key+'" data-doorway-value="'+key+'"></output></label><input id="doorway-'+key+'" data-doorway-slider="'+key+'" type="range" min="'+min+'" max="'+max+'" step="0.05">').join('')+
 '<div class="doorway-tuner-actions"><button data-doorway="reset">RESET</button><button data-doorway="copy">COPY SETTINGS</button></div><p role="status" aria-live="polite">Live preview · current session</p><textarea hidden readonly aria-label="Doorway settings to copy"></textarea>';
 document.body.append(panel);
 const refresh=()=>{
  const settings=getDoorwayTuning();
  for(const [key] of controls){
   const input=panel.querySelector('[data-doorway-slider="'+key+'"]');
   input.value=settings[key];input.setAttribute('aria-valuetext',settings[key].toFixed(2));
   panel.querySelector('[data-doorway-value="'+key+'"]').textContent=settings[key].toFixed(2);
  }
 };
 panel.oninput=e=>{
  const key=e.target.dataset.doorwaySlider;if(!key)return;
  setDoorwayTuning({[key]:Number(e.target.value)});refresh();
  panel.querySelector('[role="status"]').textContent='Live preview · current session';
  panel.querySelector('textarea').hidden=true;
 };
 panel.onclick=async e=>{
  const action=e.target.closest('[data-doorway]')?.dataset.doorway;
  if(action==='close'){panel.hidden=true;return;}
  if(action==='reset'){
   setDoorwayTuning(DEFAULT_DOORWAY_TUNING);refresh();
   panel.querySelector('textarea').hidden=true;
   panel.querySelector('[role="status"]').textContent='Current doorway defaults restored.';return;
  }
  if(action!=='copy')return;
  const text=JSON.stringify(getDoorwayTuning(),null,2);
  try{
   await navigator.clipboard.writeText(text);
   panel.querySelector('[role="status"]').textContent='Doorway settings copied.';
  }catch{
   const fallback=panel.querySelector('textarea');fallback.value=text;fallback.hidden=false;fallback.focus();fallback.select();
   panel.querySelector('[role="status"]').textContent='Press Ctrl+C to copy the selected settings.';
  }
 };
 panel.onkeydown=e=>{
  e.stopPropagation();
  if(e.key==='Escape'){panel.hidden=true;document.querySelector('#developer-badge')?.focus();}
 };
 refresh();panel.querySelector('input').focus();
}
