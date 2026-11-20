// Future workstation associations are descriptions, never live repair handlers.
const stop=(id,label,x)=>Object.freeze({id,label,x});
const station=(id,label,x,y,w,h,walk,description)=>Object.freeze({id:'preview-'+id,label,x,y,w,h,walk,description});
const room=data=>Object.freeze({...data,stops:Object.freeze(data.stops),hotspots:Object.freeze(data.hotspots),objective:'ENVIRONMENT PREVIEW · Inspect the planned machinery. Puzzles remain in the active Listening Gallery; no campaign progress is granted.'});
export const GALLERY_SPLIT_ENVIRONMENTS=Object.freeze({
 gallery:room({roomId:'sensors',title:'The listening gallery',subtitle:'DECK 01 / COMMUNICATIONS OBSERVATORY',width:720,asset:'galleryObservatoryWorld',visual:'observatory',
  stops:[stop('entrance','NAND Workshop connection',64),stop('incoming','Incoming Signal Monitor',212),stop('array','Damaged exterior antenna',363),stop('reconstruction','Signal Reconstruction Bench',523),stop('exit','Environmental Test Bay connection',650)],
  hotspots:[
   station('entrance','NAND Workshop connection',10,80,56,130,64,'The existing Workshop lies aft. This future observatory entrance is an environment study only; the normal campaign still uses its original route.'),
   station('incoming','Incoming Signal Monitor · future P09',108,112,198,90,212,'Paired cyan and amber oscilloscopes receive the same antenna signal. P09 will eventually use this incoming monitor; the active puzzle and its physical XOR pickup have not moved.'),
   station('array','Observation window · damaged communications array',90,44,540,64,363,'A fractured antenna points across the airless lunar crater basin. The same starboard view shows KESTREL hull plating, a dark starfield and the ringed planet. This observation adds no story revelation.'),
   station('reconstruction','Signal Reconstruction Bench · future P10',424,120,197,82,523,'Suspended signal cables feed a reconstruction patch bench. The four-NAND XOR construction will eventually belong here; this preview cannot place gates, fabricate stock or certify repairs.'),
   station('exit','Environmental Test Bay connection',654,80,56,130,650,'This forward hatch marks the future Environmental Test Bay connection. It does not open a new normal-campaign route. Use Developer Mode Rooms to inspect the next environment.'),
  ]}),
 testbay:room({roomId:'testbay',title:'The environmental test bay',subtitle:'DECK 01 / PHYSICAL ENGINEERING',width:960,asset:'testBayWorld',visual:'testbay',
  stops:[stop('entrance','Listening Gallery connection',64),stop('training','Signed Binary training console',151),stop('cryo','Cryogenic test chamber',340),stop('motor','Motor testing stand',564),stop('pressure','Pressure and structural tests',792),stop('exit','Black Box Vault connection',890)],
  hotspots:[
   station('entrance','Listening Gallery connection',10,80,56,130,64,'The aft bulkhead will lead to the communications observatory. This isolated preview does not replace or release any existing campaign room.'),
   station('training','Signed Binary training console · future unnumbered tutorial',95,132,110,70,151,'A dedicated four-bit training console stands before the real diagnostic machinery. It is a separate physical station; the playable tutorial remains at its current Gallery workstation until migration.'),
   station('cryo','Cryogenic Testing Chamber · future P11 temperature',232,57,198,145,340,'A reinforced cylindrical chamber is held within a steel cradle. Frosted cooling pipes and cyan observation glass identify the temperature-testing equipment; P11 remains unchanged in the active Gallery.'),
   station('motor','Motor Testing Stand · future P11 motor speed',461,101,204,101,564,'A heavy motor, guarded shaft and coupling are bolted to a dedicated test frame. The speed pickup is physically separate from the chamber. The two existing P11 stages are not relocated or duplicated here.'),
   station('pressure','Pressure and Structural Testing · future P12–P13',702,67,169,135,792,'A pressure vessel, hydraulic hull coupon and three sensor pickups share a reinforced test rig. Analog gauges and tubing support future voter and register lessons; these preview inspections cannot run them.'),
   station('exit','Black Box Vault connection',894,80,56,130,890,'The reinforced forward connection will lead to the Black Box Vault. It remains a read-only inspection in this package, with no additional access requirement or campaign transition.'),
  ]}),
 blackbox:room({roomId:'blackbox',title:'The black box vault',subtitle:'DECK 01 / FLIGHT RECORDER ARCHIVE',width:864,asset:'blackBoxWorld',visual:'vault',
  stops:[stop('entrance','Environmental Test Bay connection',64),stop('recorder','Protected flight recorder',394),stop('recovery','Transmission recovery bench',609),stop('logs','Physical log cartridges',741),stop('exit','Computation Lab connection',794)],
  hotspots:[
   station('entrance','Environmental Test Bay connection',10,80,56,130,64,'A reinforced aft door isolates the recorder archive from the machinery bay. This preview does not move the campaign or create an access-card requirement.'),
   station('recorder','Protected flight-data recorder',269,52,250,150,394,'The crash-resistant recorder remains secured inside thick structural hoops. Its contents and G.R.E.G.’s damaged memory remain unresolved; inspecting it grants no record, reward or definitive explanation of the crash.'),
   station('recovery','ASCII Transmission Terminal · Unnumbered',555,99,114,103,609,'A recovery cradle accepts physical recording media and damaged signal connectors. The short unnumbered ASCII activity decodes two character bytes and identifies their null terminator.'),
   station('logs','Navigation log cartridge archive · P14',691,99,84,103,741,'Individual storage cartridges and a mechanical logging drum preserve flight history. P14 diagnoses integer ranges and narrowing at this physical logging station.'),
   station('exit','Computation Lab connection',798,80,56,130,794,'The forward mechanical door leads into the Computation Lab after the two Vault repairs are engaged. Its environment preview remains separate from saved progression.'),
  ]}),
});
