import {servicePending} from './curriculum-profile.js';
import {cameraFromActor} from './exploration.js';
export const GARDEN_EXIT_TRIGGER_X=1248,WORKSHOP_STOP_X=1315,SCRUBBER_CAMERA_X=510;
export const approachingWorkshop=(w,actor)=>w.room==='life'&&actor.walking&&actor.x>=GARDEN_EXIT_TRIGGER_X&&actor.target>=WORKSHOP_STOP_X&&actor.target>actor.x;
const smooth=p=>p*p*(3-2*p);
/** Camera-only presentation. The engineer and companion keep their world coordinates. */
export class GardenEmergency{
 constructor({animations,warning,finished=()=>{}}){Object.assign(this,{animations,warning,finished});this.phase=null;}
 get active(){return !!this.phase;}
 start(w){if(this.active||!servicePending(w)||w.room!=='life')return false;const a=this.animations;a.actor.target=a.actor.x;a.actor.walking=false;a.cameraOverrideActive=true;this.room=w.room;this.phase='outbound';this.elapsed=0;this.from=a.cameraX;this.to=SCRUBBER_CAMERA_X;this.duration=Math.max(1,Math.min(1.5,1+Math.abs(this.to-this.from)/900));return true;}
 tick(dt,w,reduced=false){if(!this.active)return;if(w.room!==this.room||!servicePending(w)){this.cancel();return;}if(this.phase==='warning')return;if(this.phase==='reveal'){this.elapsed+=Math.max(0,dt);if(this.elapsed>=(reduced?.2:.5)){this.phase='warning';this.warning();}return;}this.elapsed+=Math.max(0,dt);const p=Math.min(1,this.elapsed/(reduced?.3:this.duration));this.animations.cameraX=this.from+(this.to-this.from)*smooth(p);if(p<1)return;if(this.phase==='outbound'){this.phase='reveal';this.elapsed=0;}else{this.cancel();this.finished();}}
 returnToEngineer(w){if(this.phase!=='warning')return;this.phase='return';this.elapsed=0;this.from=this.animations.cameraX;this.to=cameraFromActor(w,this.animations.actor.x);this.duration=1.2;}
 cancel(){this.phase=null;this.animations.cameraOverrideActive=false;}
}
