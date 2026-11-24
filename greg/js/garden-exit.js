import {isEarly,serviceState} from './curriculum-profile.js';
import {gardenDecoderComplete} from './garden-decoder.js';

/** One derived state; unlocking a door never authorizes travel past an uncommitted repair. */
export function gardenExitPhase(w){
 if(!isEarly(w))return null;
 const service=serviceState(w);
 if(service?.applied)return 'released';
 if(service?.triggered)return 'emergency';
 // Historical voyages that already passed this room retain access, without grants or new flags.
 if(w.discovered?.includes('relay'))return 'released';
 return gardenDecoderComplete(w)&&w.machines.safetycutoff?.certified&&w.foundation.applications.safetycutoff&&w.machines.scrubber?.certified&&w.foundation.components.certified.NOR?.sourcePuzzleId==='scrubber'?'ready':'locked';
}
export const gardenExitUnlocked=w=>['ready','released'].includes(gardenExitPhase(w));
