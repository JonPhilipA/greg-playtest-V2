import {developmentPreviewKey} from './development-environments.js';
/** Release mode is built into the artifact, never selected by a URL parameter. */
export function launchMode(search,{development=false,publicRelease=false}={}){
 if(publicRelease)return {presentationPreview:null,developmentPreview:null,previewRequested:false,demoRequested:false,developerRequested:false,curriculumRequested:true,pilotRequested:false};
 const p=new URLSearchParams(search),presentationPreview=['title','opening'].includes(p.get('presentationPreview'))?p.get('presentationPreview'):null;
 const developmentPreview=development&&developmentPreviewKey(p.get('environmentPreview'));
 const previewRequested=!!presentationPreview||!!developmentPreview||['engine','corridor','garden','workshop'].includes(p.get('environmentPreview'));
 const demoRequested=!previewRequested&&p.get('engineeringDemo')==='1',developerRequested=development&&!previewRequested&&!demoRequested&&p.get('dev')==='1';
 const curriculumRequested=!previewRequested&&!demoRequested&&p.get('curriculum')==='1',pilotRequested=!previewRequested&&!curriculumRequested&&!demoRequested&&p.get('inventoryPilot')==='1';
 return {presentationPreview,developmentPreview,previewRequested,demoRequested,developerRequested,curriculumRequested,pilotRequested};
}
