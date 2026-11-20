/** Code-drawn pixel environment: no network assets, scales crisply on every display. */
const mechanisms=new WeakMap();
export function drawScene(canvas,{level=0,repaired=false,signal=false,frame=0,ending=false,outputs={}}={}) {
  if(!canvas) return;
  canvas.width=640;canvas.height=232;
  const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;
  const rect=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
  const line=(pts,color,width=1)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();};
  const poly=(pts,color)=>{c.fillStyle=color;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
  const text=(s,x,y,color='#526b80',size=6)=>{c.fillStyle=color;c.font=`${size}px monospace`;c.fillText(s,x,y);};
  const live=level<2?signal:repaired||signal, glow=live?'#83ddba':'#db765f',deep=live?'#263f40':'#362b2b';
  rect(0,0,640,232,'#060d17');
  // Distant stars seen through the cracked forward observation window.
  rect(206,34,206,90,'#07121f');
  let seed=291;
  for(let i=0;i<60;i++){seed=(seed*16807)%2147483647;const x=210+seed%198;seed=(seed*16807)%2147483647;const y=36+seed%85;rect(x,y,seed%3===0?2:1,1,seed%2?'#345369':'#587286');}
  c.fillStyle='#29394f';c.beginPath();c.arc(342,98,32,0,Math.PI*2);c.fill();c.fillStyle='#1b2a3d';c.beginPath();c.arc(351,91,29,0,Math.PI*2);c.fill();
  rect(206,32,206,4,'#3e5364');rect(206,120,206,5,'#253f51');rect(206,34,5,90,'#324c5f');rect(408,34,5,90,'#324c5f');rect(306,34,4,90,'#2d4357');
  // Hull walls, beams, floor perspective.
  poly([[0,0],[125,32],[125,154],[0,224]],'#111f2e');poly([[640,0],[521,32],[521,154],[640,224]],'#102030');
  poly([[0,0],[640,0],[521,32],[125,32]],'#152331');poly([[0,232],[125,153],[521,153],[640,232]],'#152332');
  for(let y=171;y<232;y+=19)line([[0,y],[640,y]],'#283949');
  for(let x=-80;x<760;x+=74)line([[320+(x-320)*.36,153],[x,232]],'#2b3c4d');
  for(let x=137;x<511;x+=27){rect(x,157,16,2,'#34495a');rect(x,160,16,1,'#07111c');}
  rect(123,29,5,126,'#304757');rect(518,29,5,126,'#304757');
  for(let x=0;x<640;x+=107){poly([[x,0],[x+14,0],[141+(x-141)*.72,30],[130+(x-130)*.72,30]],'#263949');}
  for(let x=145;x<510;x+=80){rect(x,20,48,3,'#324457');rect(x+5,24,38,2,live?'#8bb5ae':'#694a3e');}
  // Exposed side wall plating, conduits and warning strips.
  for(let i=0;i<5;i++){const x=7+i*22;line([[x,25],[x,172]],'#243b50',2);rect(x+3,35+i*2,14,40,'#15293a');line([[x+2,111],[x+16,107]],'#32485b');}
  for(let i=0;i<4;i++){rect(531+i*24,42,16,112,'#172b3b');rect(535+i*24,50,2,86,'#2b4050');}
  line([[16,103],[58,96],[58,65],[120,65]],'#53606a',3);line([[540,62],[588,62],[588,126],[633,139]],'#3c5263',3);
  // Repair cabinet, opened electronics, pixel wires.
  rect(144,48,52,91,'#090f18');rect(142,46,56,3,'#50616b');rect(142,49,3,90,'#53616a');rect(195,49,3,90,'#314451');rect(144,137,54,3,'#405466');
  rect(149,56,41,61,'#142a30');
  for(let i=0;i<5;i++){line([[152,62+i*10],[164+(i%2)*8,62+i*10],[164+(i%2)*8,68+i*10],[187,68+i*10]],i%2?'#35575d':'#49786c');rect(156+i%3*10,63+i*10,7,5,'#263b42');}
  rect(152,122,35,9,'#23323e');for(let i=0;i<4;i++)rect(156+i*8,124,3,4,i===frame%4?glow:'#42535c');
  rect(146,40,49,4,'#654a38');text('REPAIR // 01',150,38,'#c39768',5);
  // Rear door: sliding panels physically separate when the ship system is restored.
  rect(439,37,67,113,'#080e17');rect(434,33,78,5,'#415366');rect(434,37,5,113,'#3b5063');rect(507,37,5,113,'#3b5063');rect(439,149,68,4,'#42576a');
  const doorOpen=level===3?signal:repaired, target=doorOpen?21:0, now=performance.now();
  const mech=mechanisms.get(canvas)||{gap:0,updated:now};
  const reduced=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  mech.gap=reduced?target:mech.gap+(target-mech.gap)*Math.min(1,(now-mech.updated)/230);
  if(Math.abs(mech.gap-target)<.2)mech.gap=target;
  mech.updated=now;mechanisms.set(canvas,mech);
  const gap=Math.round(mech.gap);
  rect(440-gap,40,31,105,'#293c4d');rect(474+gap,40,31,105,'#25394a');
  rect(443-gap,44,25,4,'#354c5d');rect(477+gap,44,25,4,'#354c5d');rect(469-gap,44,2,97,'#526174');rect(474+gap,44,2,97,'#526174');
  for(let y=65;y<140;y+=20){rect(445-gap,y,20,2,'#1a2d3d');rect(480+gap,y,20,2,'#172a38');}
  rect(459,29,30,3,glow);rect(523,87,9,16,'#1e3441');rect(525,91,5,4,glow);text(repaired?'ACCESS GRANTED':'SECTOR LOCKED',438,24,repaired?'#83ddba':'#c18768',5);
  // Medical pod on the left, floor crates and a small survivor.
  poly([[25,150],[39,126],[74,120],[87,133],[72,180],[40,188]],'#233849');poly([[34,151],[45,132],[69,128],[77,136],[63,174],[44,179]],'#294958');poly([[41,151],[50,137],[63,134],[67,139],[58,166],[46,170]],'#406470');
  rect(26,177,8,23,'#304c5b');rect(66,171,8,20,'#304c5b');rect(32,185,39,5,'#182b3a');rect(32,147,5,3,live?'#83ddba':'#955d5a');
  rect(547,169,42,27,'#2d3c49');rect(551,173,34,19,'#22323e');rect(554,174,4,16,'#4b5b64');rect(576,174,4,16,'#4b5b64');text('K-07',560,185,'#8f896b',5);
  rect(590,181,30,22,'#263947');rect(592,183,26,3,'#4b5964');
  // Navigation console with changing screens / reactor state.
  rect(266,139,94,15,'#33495b');poly([[271,126],[352,126],[360,140],[266,140]],'#223e51');rect(277,128,28,9,live?'#32726b':'#344c61');rect(312,128,33,9,live?'#345e7a':'#29414d');
  for(let i=0;i<5;i++){rect(280+i*4,131,2,3,live?'#8bd8bb':'#65746d');rect(315+i*5,130,3,1,'#7dacc0');}rect(273,154,7,14,'#263f51');rect(345,154,7,14,'#263f51');
  // Hanging cables, broken floor sparking wire and emergency strobes.
  line([[90,0],[91,41],[108,61],[106,87]],'#050b12',4);line([[94,0],[96,38],[113,57],[111,88]],'#45606b');
  line([[373,0],[373,21],[386,35],[382,49]],'#080c14',4);line([[375,0],[375,20],[389,36],[384,51]],'#3d5260');
  line([[112,207],[151,196],[176,200],[202,187],[231,191]],'#050c14',3);line([[112,205],[150,194],[176,198],[201,185],[230,189]],'#5c665f');
  if(!live&&frame%5===0){rect(231,188,3,2,'#f6c078');rect(237,185,2,1,'#f1c991');}
  for(const x of [129,416]) {rect(x,63,5,18,deep);rect(x+1,66,3,10,glow);}
  // Player silhouette in orange engineering coveralls.
  rect(389,171,13,4,'#080d14');rect(391,139,9,11,'#3c4e5b');rect(390,141,11,6,'#9e9a88');rect(391,142,10,3,'#173b50');
  rect(389,151,14,15,'#b48a61');rect(393,151,6,10,'#cda272');rect(385,152,4,13,'#8e755b');rect(403,153,4,11,'#b78b61');rect(389,165,5,12,'#314a5b');rect(398,165,5,12,'#314a5b');rect(387,177,8,3,'#131f2c');rect(398,177,8,3,'#131f2c');
  if(level>=8){text(repaired?'NAV // ONLINE':'NAV // OFFLINE',276,118,glow,5);text(Object.entries(outputs).map(([id,v])=>`${id}:${v??'-'}`).join(' '),277,124,'#8bbbc8',4);}
  if(level===2||level===5){rect(218,44,11,6,outputs.Y&&frame%4<2?'#f17d83':'#3e353e');text('HAZARD',215,40,'#8c7080',4);}
  if(level===11){for(let i=0;i<2;i++){rect(217+i*15,81,10,12,(i?outputs.Z:outputs.Y)?'#83ddba':'#304558');}text('Q1 Q0',216,77,'#6a9aaa',5);}
  if(level===13){rect(221,83,25,15,outputs.T?'#336d60':'#24394b');rect(251,83,25,15,outputs.M?'#62603e':'#24394b');text('AI',226,93,outputs.T?'#83ddba':'#698193',6);text('MAN',254,93,outputs.M?'#f6c078':'#698193',6);}
  if(level===12){const count=(outputs.L||0)+2*(outputs.H||0);for(let i=0;i<4;i++)rect(216+i*10,137,6,7,i===count?'#83ddba':'#314552');text(`SEQ ${count.toString(2).padStart(2,'0')}`,213,132,'#83ddba',5);}
  // Atmosphere: vignette and restrained pools of light.
  const gradient=c.createRadialGradient(320,105,30,320,105,365);gradient.addColorStop(0,'#00000000');gradient.addColorStop(1,'#020710b0');c.fillStyle=gradient;c.fillRect(0,0,640,232);
  if(live){const g=c.createRadialGradient(174,88,0,174,88,115);g.addColorStop(0,'#83ddba10');g.addColorStop(1,'#83ddba00');c.fillStyle=g;c.fillRect(50,0,250,220);}
  text(`KESTREL / DECK ${String(Math.floor(level/4)+1).padStart(2,'0')}`,15,221,'#547084',5);
  if(ending)text('DESCENT VECTOR // CONFIRMED',250,214,'#83ddba',6);
}
