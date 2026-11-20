const KEY='greg-adventure-v1';
export function freshProgress(){return {version:1,completed:[],current:0,circuits:{},ending:null,tutorial:false};}
export function loadProgress(){
  try {
    const p=JSON.parse(localStorage.getItem(KEY));
    if(!p||p.version!==1||!Array.isArray(p.completed)) return freshProgress();
    return {...freshProgress(),...p,completed:p.completed.filter(i=>Number.isInteger(i)&&i>=0&&i<14),current:Math.max(0,Math.min(13,Number(p.current)||0)),circuits:p.circuits&&typeof p.circuits==='object'?p.circuits:{}};
  } catch{return freshProgress();}
}
export function saveProgress(p){try{localStorage.setItem(KEY,JSON.stringify(p));return true;}catch{return false;}}
