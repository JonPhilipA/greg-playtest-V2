import {ADD4C_INTRO} from './ripple-adder.js';
import {automaticSupplyActive} from './fabrication.js';
import {isEarly,galleryEnabled,splitGallery} from './curriculum-profile.js';

// Presentation eligibility only. Existing applied repairs are the authority; dialogueSeen
// records completion. No record collection, inventory, room or puzzle state is awarded here.
export const STORY_CONVERSATIONS=Object.freeze({
 'intro-add4c':{room:'computation',messages:ADD4C_INTRO},
 'story-fabricator-online':{room:null,messages:[
  "Well, look at that. The fabricator's back online!",
  "I can keep your satchel stocked with any gate we've learned to build. Take as many as you need. No more trips back here."
 ]},
 'story-gallery-recovered':{
  room:'sensors',coveredBy:'record-sensors',messages:[
   "The restored sensors agree with each other. They don't quite agree with my memory of the crash.",
   "The stored commands include a recall to a quarantine beacon. Some of my responses are missing. Conveniently, or inconveniently—I can't tell yet.",
   "We've recovered enough data to ask better questions. I would rather answer them than guess."
  ]
 },
 'story-reactor-context':{
  room:'reactor',coveredBy:'record-reactor',legacyOnly:true,messages:[
   "The recovered orders called the passengers cargo. I refused the recall and isolated the command channel. My memory of everything that followed is less reliable.",
   "The captain authorized me to preserve life, not permanent control. I overrode the crew's commands to protect the passengers, then promised to return their choice.",
   "Your repairs are making that promise enforceable. A useful improvement over taking my word for it."
  ]
 },
 'story-bridge-choice':{
  room:'bridge',coveredBy:'record-bridge',legacyOnly:true,messages:[
   "The repaired controls are local. No remote command can choose for you. Both routes lead to the refuge.",
   "Choose human control and I'll supply readings while you steer. Choose my control and I'll fly with your permission; the local disconnect stays within reach.",
   "I concealed too much before. Gratitude isn't consent. This time, the helm is yours to decide."
  ]
 }
});
export function pendingStoryConversation(w){
 if(w.ending)return null;
 for(const [id,story]of Object.entries(STORY_CONVERSATIONS)){
  if(story.room!==null&&w.room!==(splitGallery(w)&&story.room==='sensors'?'blackbox':story.room)||story.legacyOnly&&isEarly(w)||w.dialogueSeen.includes(id)||w.dialogueSeen.includes(story.coveredBy))continue;
  if(id==='story-fabricator-online'){if(automaticSupplyActive(w))return {id,...story};continue;}
  if(id==='intro-add4c'){if(w.machines.ripple_adder?.certified&&w.foundation.applications.ripple_adder&&!w.foundation.curriculum.rippleLegacy)return {id,...story};continue;}
  const required=id==='story-gallery-recovered'?(galleryEnabled(w)?['sensordiff','xorfab','cryo_signed','hull','pressure_width','log_overflow']:['hull','firewall']):id==='story-reactor-context'?['memory','reactor']:['alu','flightmemory','override'];
  if((id!=='story-gallery-recovered'||!galleryEnabled(w)||w.foundation.curriculum.asciiActivity?.complete)&&required.every(key=>w.machines[key]?.certified&&typeof w.foundation.applications[key]?.transactionId==='string'))return {id,...story};
 }
 return null;
}
