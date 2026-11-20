import {COMPUTATION_AREAS,COMPUTATION_WIDTH} from './computation-layout.js';
import {galleryEnabled,splitGallery} from './curriculum-profile.js';
import {GALLERY_SPLIT_ENVIRONMENTS} from './gallery-split-layout.js';
// Preview definitions retain their isolated, read-only entry points. They do not register campaign rooms or unlock puzzles.
const stop=(id,label,x)=>Object.freeze({id,label,x});
const station=(id,label,x,y,w,h,walk,description)=>Object.freeze({id,label,x,y,w,h,walk,description});
// Frozen live layout until the puzzle-relocation package.
export const CAMPAIGN_GALLERY_ENVIRONMENT=Object.freeze({roomId:'sensors',title:'The listening gallery',subtitle:'DECK 01 / SIGNALS & DATA',width:1440,asset:'galleryWorld',
  objective:'Explore the signal receiver, data workstations and observation window. P09–P15 are playable in the curriculum voyage. This isolated preview grants no progress.',
  stops:Object.freeze([stop('entrance','Gallery entrance',70),stop('receiver','Signal receiver',265),stop('analysis','Sensor-analysis station',563),stop('binary','Binary data workstation',828),stop('communications','Communications terminal',1155),stop('exit','Computation Lab entrance',1360)]),
  hotspots:Object.freeze([
   station('preview-entrance','Workshop connection',10,79,62,132,70,'This aft hatch will connect to the NAND Workshop. Preview hatches do not change campaign rooms.'),
   station('preview-receiver','Signal receiver · P09–P10 campaign stations',101,65,292,139,265,'A receiver dish, paired oscilloscopes and a patching bench share the incoming sensor lines. The curriculum voyage uses this equipment to detect disagreement with XOR (P09), then construct XOR from NAND (P10). These isolated preview controls remain read-only.'),
   station('preview-analysis','Sensor-analysis console · P11–P12 campaign stations',448,77,232,128,563,'The campaign uses this console for signed/unsigned interpretation (P11) and hull-sensor majority logic (P12). This isolated environment preview remains read-only.'),
   station('preview-binary','Binary data workstation · P13 campaign',720,75,225,130,828,'The campaign uses the register bank for integer widths and ranges (P13). The adjacent retired status bank is ordinary equipment. This isolated preview grants no progress.'),
   station('preview-communications','Communications & logging · P14–P15 campaign',992,146,337,61,1155,'The communications terminal feeds a message buffer and logging drum. Campaign activities cover ASCII/C characters (P14) and unsigned narrowing and integer types (P15). Messages here are instrument samples, not recoverable story records.'),
   station('preview-window','Damaged antenna observation window',1059,46,274,95,1155,'Beyond the starboard glass: the same barren crater basin, broken exterior antenna, trailing cable and KESTREL hull plating. The antenna is visibly damaged; this observation grants no repair or story progress.'),
   station('preview-exit','Computation Lab connection',1369,79,62,132,1360,'The revised ship route will continue into the Computation Lab. Open its separate environment preview to inspect it. The live campaign route is unchanged.'),
  ])});
export const DEVELOPMENT_ENVIRONMENTS=Object.freeze({
 ...GALLERY_SPLIT_ENVIRONMENTS,
 computation:Object.freeze({roomId:'computation',title:'The computation lab',subtitle:'DECK 01 / ARITHMETIC ENGINEERING',width:COMPUTATION_WIDTH,asset:'computationWorld',
  objective:'Explore five arithmetic teaching benches and recovered engineering whiteboards. This isolated preview grants no campaign progress.',
  stops:Object.freeze([stop('entrance','Black Box Vault connection',70),...COMPUTATION_AREAS.map(a=>stop(a.id,'P'+a.number+' · '+a.label,a.station.walk)),stop('exit','Navigation Control entrance',1076)]),
  hotspots:Object.freeze([
   station('preview-entrance','Black Box Vault connection',9,79,62,132,70,'The aft connection leads back to the protected Black Box Vault. This isolated classroom preview does not travel or change a saved campaign.'),
   ...COMPUTATION_AREAS.map(a=>station('preview-'+a.id,'P'+a.number+' · '+a.label,a.station.x,a.station.y,a.station.w,a.station.h,a.station.walk,'An arithmetic teaching bench beneath an electronic engineering whiteboard. The campaign uses this equipment for its corresponding lesson; this isolated preview remains read-only.')),
   station('preview-exit','Navigation Control connection',1086,79,62,132,1076,'Navigation Control is the next planned physical connection. This preview does not relocate existing puzzles or open a new campaign route.'),
  ])}),
});
export const developmentEnvironment=w=>Object.hasOwn(DEVELOPMENT_ENVIRONMENTS,w?.environmentPreview)?DEVELOPMENT_ENVIRONMENTS[w.environmentPreview]:null;
export const developmentPreviewKey=value=>value==='sensors'?'gallery':Object.hasOwn(DEVELOPMENT_ENVIRONMENTS,value)?value:null;

// The live Gallery keeps its original authored layout; previews never grant campaign authority.
export const campaignAnalysisEnvironment=w=>splitGallery(w)?(w.room==='computation'?DEVELOPMENT_ENVIRONMENTS.computation:GALLERY_SPLIT_ENVIRONMENTS[{sensors:'gallery',testbay:'testbay',blackbox:'blackbox'}[w.room]])||null:null;
export const analysisEnvironment=w=>developmentEnvironment(w)||campaignAnalysisEnvironment(w)||(galleryEnabled(w)&&w.room==='sensors'?CAMPAIGN_GALLERY_ENVIRONMENT:null);
