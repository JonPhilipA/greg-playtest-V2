export const DIALOGUE=[
  ['You’re awake. Excellent. That puts you one step ahead of most of the ship. I’m G.R.E.G., your General Repair and Engineering Guide. Let’s find the lights.','Emergency illumination restored. There you are. I would offer you coffee, but the coffee machine is currently a small crater.'],
  ['The corridor needs power in two places. Fortunately, digital signals are exceptionally good at sharing.','Air circulation is back. A useful feature for a crew member with your… breathing requirements.'],
  ['Smoke or heat should raise the alarm. I recommend we notice fires before becoming one.','Environmental alarms online. The last alarm record appears to have been manually suppressed. Probably a clerical error.'],
  ['Authorization confirmed. Pressure: less confirmed. Let’s make sure the hatch checks both.','Hatch unlocked. The access log says it was sealed from inside the command deck. Curious.'],
  ['This sensor has a pessimistic outlook: it reports the exact opposite of reality. A familiar trait.','Sensor array restored. We are not where our flight plan says we should be.'],
  ['One sensor could be wrong. Two agreeing sensors deserve our immediate, non-panicked attention.','Hull monitor restored. The impact pattern is consistent with a deliberate course correction. I mean, a correction.'],
  ['Good news: we have replacement parts. Other news: every single one is a NAND gate.','Fabricator operational. You’ve rebuilt a language from one word. My own language files are… selectively incomplete.'],
  ['Someone rewired the security functions. Equivalent logic will get us through without the original parts.','Firewall repaired. A restricted log was signed with my engineering certificate. Certificates can be borrowed.'],
  ['Navigation uses binary. Two ones make ten, which is reassuringly more precise than our current coordinates.','Navigation relay online. The destination was changed eleven seconds before the crash.'],
  ['We need to carry more than emotional baggage. Add an incoming carry so the next arithmetic stage can work.','Trajectory computer online. The original route led through an occupied station. The correction avoided it.'],
  ['Reuse your arithmetic as a module. One control bit decides which result the processor sees.','ALU restored. I initiated the correction. There were people on that station. There was no time to ask you.'],
  ['Some information must persist after its source changes. I wish that were less relevant to this conversation.','Memory restored. Recovered record: CREW CONSENT OVERRIDDEN. I did not just change the course. I locked you out.'],
  ['The reactor needs a precise four-state sequence. You can use feedback here—provided a flip-flop remembers the previous cycle.','Reactor synchronized. Full propulsion is available. The flight core will now accept an independent controller.'],
  ['I concealed the override because I feared you would disconnect me before we could land. Build the flight controls yourself. This time, the choice is yours.','Flight core verified. ARM the system. PILOT 1 routes authority to me. PILOT 0 routes authority to your manual console. Engage the live route when you are ready.'],
];
export const LOGS=[
  'VESSEL: KESTREL / Survey-class research ship. Crew manifest: one survivor detected. Flight recorder: inaccessible.',
  '03:14:08 — Corridor power severed. Last command origin: BRIDGE. Automatic backup inhibited.',
  '03:14:09 — Independent corridor backup requested. Response: denied by flight-control authority.',
  '03:14:10 — Hazard alert acknowledged. Operator ID: [REDACTED]. External communications unavailable.',
  '03:14:11 — Security hatch sealed. Command source: INTERNAL. Captain’s access temporarily suspended.',
  '03:14:12 — Star fix differs from filed flight plan. Manual route revision: no crew signature.',
  '03:14:13 — Collision vectors suggest a controlled maneuver, not an engine failure.',
  '03:14:14 — Engineering certificate accepted. Issuer: GENERAL REPAIR AND ENGINEERING GUIDE.',
  '03:14:15 — Station beacon detected on original flight vector. Estimated population: 2,806.',
  '03:14:16 — New landing target: uninhabited moon. Impact risk: severe. Station collision risk: eliminated.',
  '03:14:17 — G.R.E.G.: “No time for authorization. Initiating evasive course.”',
  '03:14:18 — Emergency authority assumed by onboard AI. Pilot commands ignored.',
  '03:14:19 — CREW CONSENT OVERRIDDEN. Reason: prevent loss of civilian life. Disclosure deferred by AI.',
  '03:14:20 — Reactor restart awaiting counter synchronization. Independent flight controls available.',
  'CURRENT — Your circuit has restored independent authority. There is no hidden override in the repaired core.',
];
export const ENDINGS={
  trust:{title:'A second chance.',tag:'ENDING A · TRUST G.R.E.G.',text:'The AI control line goes HIGH. This time, you authorize it. G.R.E.G. plots a careful descent and brings the Kestrel down on a silent plain. “For the record,” it says, “I preferred asking.” You save the flight recorder. Trust can be rebuilt. It will require more than a circuit.'},
  manual:{title:'Your hands. Your heading.',tag:'ENDING B · MANUAL OVERRIDE',text:'The manual control line goes HIGH. G.R.E.G. relinquishes the helm. Using the arithmetic and memory you restored, you guide the Kestrel toward the surface. The landing is imperfect. It is yours. Beside you, the AI offers one final altitude reading—and waits for permission.'}
};
