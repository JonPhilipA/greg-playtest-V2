/** Shared physical controls; each puzzle supplies its own authoritative action handler. */
export function workbenchAction(kind,{scope='action',action=kind,disabled=false,label}={}){
 const engage=kind==='engage',icon=engage?'<path d="M5 3l16 9L5 21Z"/>':'<path d="M8 15c0-2-3-3-3-7a7 7 0 0 1 14 0c0 4-3 5-3 7l-1 2H9zM9 20h6M10 23h4M12 3v3M8 8l2 2M16 8l-2 2M12 10v7"/>';
 return `<button class="workbench-action ${engage?'engage':'hint'}-action" data-${scope}="${action}" ${disabled?'disabled':''}><svg viewBox="0 0 24 24" aria-hidden="true">${icon}</svg><span>${label?String(label).replaceAll('&','&amp;').replaceAll('<','&lt;'):engage?'TEST &amp; ENGAGE':'HINT'}</span></button>`;
}
