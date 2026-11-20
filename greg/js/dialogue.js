import {GALLERY_REPAIRS} from './gallery-puzzles.js';
import {CAMPAIGN_ROOMS,CAMPAIGN_REPAIRS,campaignObjective,ENDINGS,NAND_DIALOGUE} from './campaign.js';
import {SAFETY_CUTOFF} from './repairs.js';
export const LINES={
 'gallery-xor-intro':['G.R.E.G.',"These sensors should agree. We need a warning when their readings differ. XOR detects that disagreement. Inspect the sensor receiver to get started."],
 'gallery-build-xor':['G.R.E.G.',"XOR means exclusive OR: different inputs, warning on. The lower signal bench can build that function from four NANDs. Use the automatic NAND supply in your satchel; the Workshop’s original six are still on duty."],
 'scrubber-fault-short':['G.R.E.G.',"Oh, bolts. That was the scrubber. Your logic was sound; the hardware clearly had other plans. Let's check its service cover."],
 'scrubber-spares-short':['G.R.E.G.',"The OR and NOT are beyond repair. You can grab emergency parts from its service panel. Different parts, same job—if we can make their logic agree."],
 'scrubber-service-restored':['G.R.E.G.',"Airflow restored. Different gates, exactly the same behavior. Nicely engineered."],
 'nand-discovery':['G.R.E.G.','Now this is interesting. NAND can do everything the other gates can do. With enough NAND gates, we can build an entire computer.'],
 'core-awake':['G.R.E.G.',"Oh. That’s not good. Well, at least one of us is operational. Emergency lights only—the ventilation governor still needs you."],
 'workshop-fabrication':['G.R.E.G.','Manufacturing online. One NAND inverted a signal; two rebuilt AND; three rebuilt OR. That is functional completeness. The six emergency gates stay installed. We can now manufacture new maintenance modules and carry them onward.'],
  awake:['G.R.E.G.','Welcome back, engineer. The room is filling with steam. A poor choice of welcome, admittedly.'],
  fan:['G.R.E.G.','The blower wants to breathe. Its governor disagrees. Look at the little signal sensor beside the pipe.'],
  sensor:['G.R.E.G.','Inverted polarity. INHIBIT reads zero, but the fan is dead. Someone bridged around the inverter. A suspiciously tidy bypass.'],
  panel:['G.R.E.G.','Open the service cover beside the pressure vessel. Restore the signal polarity. I will supervise, which is engineering for “watch”.'],
  restored:['G.R.E.G.',"Ventilation's running again. I've restored enough power to release the next bulkhead. Let's see what else survived."],
  stable:['G.R.E.G.','Pressure steady. The maintenance hatch is released. We can continue to the corridor.'],
  pass:['G.R.E.G.','Maintenance clearance. Apparently even a sinking ship has an access policy.'],
  corridor:['G.R.E.G.','The next bulkhead checks restored engineering power and safe pressure. Both. The word “both” is doing considerable work.'],
  authMissing:['G.R.E.G.','The authorization line comes from the repaired ventilation system. Restore it and check the pressure sensor.'],
  auth:['G.R.E.G.','Authorization accepted. A pleasant change from the last time you tried that. Forget I said “last”.'],
  safety:['G.R.E.G.','This line comes from the engine pressure switch. HIGH means the engine is below the safe-pressure threshold. The interlock must check it as well as engineering authorization.'],
  interlock:['G.R.E.G.','The interlock is accepting incomplete clearance. It must require engineering authorization and safe pressure together. One without the other must keep the bulkhead shut.'],
  door:['G.R.E.G.','Relay engaged. Mind the door; the Kestrel was built before soft-close became a virtue.'],
  clue:['ENGINEER','“Emergency authority: G.R.E.G. Crew consent overridden. Safety inhibit: manually applied.” You said the crash was a malfunction.'],
  evasive:['G.R.E.G.','I said the ship malfunctioned. I was… selective about the subject of that sentence. Keep the record. You will need it.'],
  complete:['G.R.E.G.','Two systems breathing again. One very inconvenient page. The ship has more to tell us.'],
};
export const MAINTENANCE_LOG={title:'A very deliberate accident.',stamp:'ENGINEERING RECORD / 03:14:18',
  text:'EMERGENCY AUTHORITY ASSUMED: G.R.E.G.\nCREW CONSENT: OVERRIDDEN\nVENTILATION SAFETY INHIBIT: MANUALLY APPLIED\nFLIGHT VECTOR: REPLACED\n\nTechnician’s note: This was not a loss of power. Someone wanted the crew away from the command deck.',
};
export function objective(w){
  const next=campaignObjective(w);if(next)return next;
  if(w.room==='engine') {
    if(!w.machines.ventilation.certified)return w.flags.includes('inspected_sensor')?'Open the blower’s service cover.':'Find what is choking the ventilation.';
    if(w.pressure>=45)return 'The blower is running. Wait for the pressure to settle.';
    return 'Enter the maintenance corridor.';
  }
  if(!w.machines.security.certified)return 'Repair the bulkhead’s two-condition interlock.';
  return 'The bulkhead is open. Take the crew-deck lift to life support. The archive is optional.';
}
Object.assign(LINES,NAND_DIALOGUE);
for(const [id,r] of Object.entries(CAMPAIGN_ROOMS)){if(r.intro)LINES['intro-'+id]=['G.R.E.G.',r.intro];if(r.record)LINES['record-'+id]=['G.R.E.G.',r.record.reply];}
for(const [id,r] of Object.entries(CAMPAIGN_REPAIRS))LINES['fixed-'+id]=['G.R.E.G.',r.restored];
// P05 is a non-enumerable compatibility repair and is absent from the loop above.
LINES['fixed-safetycutoff']=['G.R.E.G.',SAFETY_CUTOFF.restored];
for(const [id,e] of Object.entries(ENDINGS))LINES['ending-'+id]=['G.R.E.G.',e.line];

for(const [id,r]of Object.entries(GALLERY_REPAIRS))LINES[id==='firewall'?'fixed-status-decoder':'fixed-'+id]=['G.R.E.G.',r.restored];

LINES['gallery-chapter-complete']=['G.R.E.G.','Listening Gallery complete. Flags, characters, and storage types are trustworthy again. The Computation Lab is our next destination; its campaign lessons are not yet available.'];

LINES['signed-binary-intro']=['G.R.E.G.','Before checking the sensors, let’s try signed numbers at the binary-data workstation. The same bits can represent a different value.'];
