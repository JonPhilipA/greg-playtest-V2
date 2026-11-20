import {cosmeticMaterial} from './cosmetic-material.js';
import {engineerPose,drawEngineerConcept} from './engineer-concepts.js';
import {resolveEngineerAppearance,DEFAULT_ENGINEER_APPEARANCE} from './engineer-cosmetics.js';
export {DEFAULT_ENGINEER_APPEARANCE};
export function drawEngineer(ctx,appearance,x,floor,pose,{facing=1}={}){
 const resolved=resolveEngineerAppearance(appearance);
 drawEngineerConcept(ctx,resolved.geometry,x,floor,pose,{facing,palette:{...resolved.colors,paint:cosmeticMaterial(ctx,resolved.effect)},accessories:resolved.accessories});return resolved;
}
const DURATIONS=Object.freeze({operate:2.8,repair:3,celebrate:2.1,surprised:2.1,lookGreg:1.8});
/** Ephemeral presentation state. It observes the actor; it never moves or serializes it. */
export class EngineerVisualState{
 constructor(){this.active=null;this.pendingRepair=null;}
 play(action,world,animation,{facing=animation.actor.facing}={}){
  if(!Object.hasOwn(DURATIONS,action))return false;
  this.active={action,world,room:world.room,start:animation.time,x:animation.actor.x,facing};return true;
 }
 repairAfterPanel(world,animation){this.pendingRepair={world,room:world.room,x:animation.actor.x};}
 current(world,animation,{reduced=false,visible=true}={}){
  const a=animation.actor,t=animation.time;
  if(this.active&&(this.active.world!==world||this.active.room!==world.room||t<this.active.start))this.active=null;
  if(this.pendingRepair&&(this.pendingRepair.world!==world||this.pendingRepair.room!==world.room||Math.abs(this.pendingRepair.x-a.x)>1))this.pendingRepair=null;
  if(a.walking){this.active=null;return {action:'walking',facing:a.facing,pose:engineerPose({time:t,walking:!reduced,reduced})};}
  if(visible&&this.pendingRepair){this.pendingRepair=null;this.play('repair',world,animation);}
  if(this.active&&t-this.active.start>=DURATIONS[this.active.action]){
   const repair=this.active.action==='repair';this.active=null;if(repair)this.play('celebrate',world,animation);
  }
  const action=this.active?.action||'idle',elapsed=this.active?t-this.active.start:0;
  return {action,facing:this.active?.facing||a.facing,pose:engineerPose({time:t,action,elapsed,reduced})};
 }
}
