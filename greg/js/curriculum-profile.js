export const SERVICE_ID='service.scrubber.demorgan';
export const CURRICULUM_SAVE_KEY='greg-curriculum-v1';
export const EARLY_IDS=Object.freeze(['ventilation','security','alarm','scrubber','safetycutoff']);
export const isEarly=w=>w?.foundation?.earlyCurriculum?.version===1;
// Existing advanced adapter voyages retain their original Gallery route. Fresh and P08-only
// notebooks enter the new curriculum; an explicit version keeps future packages unambiguous.
export const galleryEnabled=w=>isEarly(w)&&(w.foundation.curriculum?.galleryVersion===1||(w.foundation.curriculum?.galleryVersion!==0&&!w.machines?.hull?.certified&&!w.machines?.firewall?.certified&&!w.discovered?.some(id=>['navigation','reactor','bridge'].includes(id))));
export const serviceState=w=>w?.foundation?.services?.[SERVICE_ID];
export const servicePending=w=>!!serviceState(w)?.triggered&&!serviceState(w).applied;
export const taskId=(w,id)=>isEarly(w)&&id==='scrubber'&&serviceState(w)?.triggered?SERVICE_ID:id;
export const editableGraph=(w,id)=>id==='scrubber'&&servicePending(w)?serviceState(w).draft:w.circuits[id];
export const roomRepairIds=(w,room,legacy)=>isEarly(w)?room==='life'?[...legacy,'safetycutoff']:room==='navigation'&&splitGallery(w)?['float_nav']:splitGallery(w)&&GALLERY_ROOM_REPAIRS[room]?GALLERY_ROOM_REPAIRS[room]:room==='sensors'&&galleryEnabled(w)?['sensordiff','xorfab','cryo_signed','hull','pressure_width','adc_precision','log_overflow']:legacy:legacy;

// One route adapter for the revised voyage; legacy campaigns retain their original room order.
export const LEGACY_ROUTE=Object.freeze(['engine','corridor','life','relay','sensors','navigation','reactor','bridge']);
export const GALLERY_ROUTE=Object.freeze(['engine','corridor','life','relay','sensors','testbay','blackbox','computation','navigation','reactor','bridge']);
export const splitGallery=w=>galleryEnabled(w)&&w.foundation?.exploration?.galleryRoomsVersion===1;
export const campaignRoute=w=>splitGallery(w)?GALLERY_ROUTE:LEGACY_ROUTE;
export const GALLERY_ROOM_REPAIRS=Object.freeze({sensors:Object.freeze(['sensordiff','xorfab']),testbay:Object.freeze(['cryo_signed','hull','pressure_width']),blackbox:Object.freeze(['log_overflow']),computation:Object.freeze(['navbits','trajectory','ripple_adder','twos_complement','addsub'])});
export const puzzleRoom=(w,id,fallback)=>splitGallery(w)&&id==='adc_precision'?'blackbox':splitGallery(w)?Object.keys(GALLERY_ROOM_REPAIRS).find(room=>GALLERY_ROOM_REPAIRS[room].includes(id))||fallback:fallback;
