// Shared vector outfit geometry. Pose, appearance and movement remain independent.
export const ENGINEER_CONCEPTS=Object.freeze({
 A:Object.freeze({id:'A',name:'Retro Mechanic',height:37,helmet:15.5,suit:'#bd7545',light:'#e6a16b',shade:'#784b35',trim:'#c9a568',navy:'#2b3c51',glove:2.1,boot:6.1,description:'Rounded brass-rimmed helmet, practical coveralls and a compact tool pouch.'}),
 B:Object.freeze({id:'B',name:'KESTREL Technician',height:38,helmet:14.5,suit:'#364c64',light:'#6a8296',shade:'#213247',trim:'#c4a26b',navy:'#263748',glove:1.9,boot:5.9,description:'Segmented protective suit, structural brass harness and a compact diagnostic pack.'}),
 C:Object.freeze({id:'C',name:'Cartoon Space Engineer',height:36.8,helmet:19,suit:'#cf834c',light:'#efb77b',shade:'#885336',trim:'#d6b375',navy:'#2e425a',glove:2.5,boot:7,description:'Oversized helmet, short jacket, generous gloves and unmistakable work boots.'}),
});
export const PREVIEW_ACTIONS=Object.freeze(['idle','left','right','face','operate','repair','surprised','celebrate','lookGreg']);
const blend=(a,b,t)=>a+(b-a)*t;
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
// Four distinct contact/passing poses, interpolated rather than stepped.
const GAIT=[[-.48,.46,0,0],[0,0,0,.8],[.46,-.48,0,0],[0,0,.8,0]];
export function engineerPose({time=0,walking=false,action='idle',elapsed=0,reduced=false}={}){
 const p={frontLeg:0,backLeg:0,frontLift:0,backLift:0,frontArm:-.08,backArm:.08,elbow:0,bob:0,head:0,lean:0,turn:0,tool:0,reach:0};
 if(walking){const phase=(reduced?0:time*2.15%1)*4,i=Math.floor(phase)%4,f=smooth(phase%1),v=GAIT[i].map((a,k)=>blend(a,GAIT[(i+1)%4][k],f));[p.frontLeg,p.backLeg,p.frontLift,p.backLift]=v;p.frontLift*=2;p.backLift*=2;p.frontArm=-v[0]*.9;p.backArm=-v[1]*.9;p.bob=-Math.abs(Math.sin(phase*Math.PI))*.24;return p;}
 if(!reduced){p.bob=-.11*(1+Math.sin(time*2));p.head=Math.sin(time*.67)*.025;p.lean=Math.sin(time*.75)*.014;}
 if(action==='face')p.turn=.65;
 if(action==='lookGreg'){p.turn=.35;p.head=-.08;}
 if(action==='operate'||action==='repair'){
  const t=reduced?1.3:elapsed,reach=smooth((t-.25)/.6)*(1-smooth((t-2.25)/.5));p.reach=reach;p.turn=reach*.55;p.frontArm=blend(-.08,-1.2,reach);p.elbow=reach*(-.38+(reduced?0:Math.sin(t*10)*.075));p.lean+=reach*.035;
  if(action==='repair'){p.tool=smooth((t-.05)/.35)*(1-smooth((t-2.55)/.3));if(t<.45){p.frontArm=blend(-.08,.45,smooth(t/.2));p.elbow=-.95*smooth(t/.2);}p.backArm=.22*reach;}
 }
 if(action==='surprised'){const v=reduced?1:Math.sin(Math.min(1,elapsed/.25)*Math.PI/2)*(1-smooth((elapsed-1.3)/.8));p.frontArm=-1.8*v;p.backArm=1.6*v;p.elbow=-.3*v;p.head=-.1*v;p.lean=-.06*v;}
 if(action==='celebrate'){const v=reduced?1:smooth(elapsed/.3)*(1-smooth((elapsed-1.5)/.6));p.frontArm=-2.5*v;p.elbow=-.5*v;p.backArm=.6*v;p.head=-.04*v;}
 return p;
}
export function frontHand(p){const a=p.frontArm,b=a+p.elbow;return {x:5-Math.sin(a)*6-Math.sin(b)*5,y:-23+p.bob+Math.cos(a)*6+Math.cos(b)*5};}
const OUTLINE='#152333';
function path(c,d,fill,stroke=OUTLINE,width=.65,paint=null){const p=new Path2D(d);if(fill){c.fillStyle=fill;c.fill(p);if(paint){c.fillStyle=paint;c.fill(p);}}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke(p);}}
function rr(c,x,y,w,h,r,fill,stroke=OUTLINE,width=.65){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function line(c,d,color,width=.5){path(c,d,null,color,width);}
function grad(c,x,y,w,h,a,b){const g=c.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,a);g.addColorStop(1,b);return g;}
function circle(c,x,y,r,fill,stroke=OUTLINE,width=.5){c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=fill;c.fill();if(stroke){c.lineWidth=width;c.strokeStyle=stroke;c.stroke();}}
const bodyRegion=(o,name)=>o.regions?.[name]?{...o,...o.regions[name]}:o;
function leg(c,o,x,angle,lift,back){
 const ankle=x-Math.sin(angle)*9,foot=-lift,knee=x-Math.sin(angle)*5.2,ky=-7;
 path(c,`M${x-1.8} -13 Q${x} -14 ${x+2} -12 L${knee+1.8} ${ky} L${ankle+1.6} ${foot-2.2} L${ankle-2} ${foot-2.2} L${knee-2} ${ky} Z`,grad(c,x,-13,3,11,back?o.shade:o.suit,back?o.navy:o.shade),OUTLINE,.65,o.paint);
 rr(c,knee-1.6,ky-.8,3.2,2, .6,o.regions?.joints||(back?o.navy:o.id==='A'?'#9e673f':o.trim),OUTLINE,.45);
 const w=o.boot;c.save();c.translate(ankle,foot);
 path(c,`M-2.25 -4 Q0 -4.8 2.1 -3.9 L2.3 -2.3 Q${w-2.8} -2.7 ${w-2.2} -1.3 L${w-2.1} -.4 Q1.4 .1 -2.7 -.3 L-2.8 -1.8 Z`,grad(c,-2,-4,4,4,o.bootLight||'#526071',o.bootColor||'#253447'));
 line(c,`M-2.4 -.6 L${w-2.4} -.6`,'#0b1928',.8);line(c,'M-1.7 -3 L1.8 -3',back?'#69717a':o.trim,.55);line(c,'M.4 -2.2 L1.2 -1.5 M1.5 -2.3 L2.3 -1.5','#97a1a9',.32);c.restore();
}
function arm(c,o,x,angle,elbow,back,tool){
 c.save();c.translate(x,-23);c.rotate(angle);
 path(c,'M-1.9 0 Q-2.4 -2 0 -2.3 Q2.5 -2 2.1 1 L1.8 6.3 Q0 7.3 -1.9 5.6 Z',grad(c,-2,0,4,7,back?o.shade:o.light,back?o.navy:o.suit),OUTLINE,.65,o.paint);
 if(o.id==='B')rr(c,-2,-1.2,4,2.7,.7,o.trim,OUTLINE,.4);else line(c,'M-1.6 .1 Q0 .8 1.8 .1',o.trim,.6);
 c.translate(0,6);c.rotate(elbow);rr(c,-1.8,-.8,3.6,4.8,1,o.regions?.joints||(back?o.shade:o.suit));
 rr(c,-2,3.4,4,1.3,.3,o.trim,OUTLINE,.4);
 const g=o.glove;path(c,`M${-g} 4.7 Q${-g-1} 5.9 ${-g+.1} 7.2 Q0 8.7 ${g} 7 L${g+.7} 5.8 Q${g+.5} 4.7 ${g-.1} 4.7 L${g-.1} 6 L${g-.6} 5 Z`,grad(c,-g,4,4,4,o.gloveLight||'#4c5d70',o.gloveColor||'#1b2b3f'));
 line(c,'M-.9 6.1 L.8 6.2','#8d969e',.4);
 if(tool){c.save();c.translate(.9,6.1);c.rotate(-Math.PI/2-angle-elbow);rr(c,-1,-1,5,2.1,.5,'#b7c0c5',OUTLINE,.5);rr(c,-.8,-.85,2,1.8,.25,o.trim,OUTLINE,.4);path(c,'M4 -.8 L6 -1.6 L6 -.5 L5.1 0 L6 .5 L6 1.5 L4 .8 Z','#b5c1ca',OUTLINE,.4);c.restore();}
 c.restore();
}
function helmet(c,o,p){
 c.save();c.translate(0,o.id==='C'?-29.4:-30.1);c.rotate(p.head);if(o.id==='C')c.scale(1,1.12);const w=o.helmet/2;
 const metal=grad(c,-w,-7,w*2,14,o.helmetLight||(o.id==='B'?'#6a7c8a':'#e4be82'),o.helmetShade||(o.id==='B'?'#263a51':'#9c714b'));
 if(o.id==='B'){
  path(c,'M-7 -4.6 L-4.2 -7.3 L3 -7.3 L7 -4.3 L7.7 2.8 L4.7 6.7 L-4.6 6.7 L-7.6 3 Z',metal);
  path(c,'M-5.7 -4.5 L-2.8 -6.3 L2.2 -6.3 L4.2 -4.9 L4.9 -3.4 L-5.4 -3.2 Z',o.navy,OUTLINE,.45);
  line(c,'M-5.4 -5.3 L-3.5 -4.2 M3.9 -5.5 L5.4 -3.7',o.trim,.8);
 }else{
  path(c,`M${-w} 1.8 L${-w} -1.6 C${-w} -8.3 ${w-2} -8.8 ${w} -2.3 L${w+.4} 2.3 Q${w} 7.4 0 7.1 Q${-w+1} 7.3 ${-w} 1.8 Z`,metal);
  path(c,`M${-w+1} -2.4 Q${-w+1} -6.4 -2 -6.9 L-1.5 -4.6 Q${-w+3} -4 ${-w+2.6} -1.7 Z`,o.id==='C'?o.suit:'#f5d7a2',null);
  line(c,`M${-w+1.4} 3.7 Q0 7 ${w-1} 3.3`,o.trim,1.15);
 }
 const left=-w+3+(p.turn*.8),right=w-.5-p.turn*2,glass=grad(c,left,-3,right-left,8,'#556f85','#132437');
 path(c,`M${left} -3.4 Q${right-1.5} -4.2 ${right} -2.5 L${right+.1} 1.9 Q${right-1} 4.4 ${left+.8} 3.1 Q${left-1.4} .2 ${left} -3.4 Z`,o.regions?.visorTrim||o.trim,OUTLINE,.6);
 path(c,`M${left+.6} -2.5 Q${right-1.2} -3.2 ${right-.8} -1.9 L${right-.8} 1.3 Q${right-1.4} 3.1 ${left+1.3} 2.3 Z`,glass,OUTLINE,.45);
 // Reflected light, never eyes or a face.
 path(c,`M${left+1.4} -1.9 L${left+4.5} -2.1 L${left+2.5} .6 L${left+1.3} .3 Z`,'#a3b7c255',null);
 if(o.accessories.helmetAttachment){rr(c,-w-1,-.8,2.7,4.5,1,o.navy);circle(c,-w+.3,1.4,.75,o.trim,OUTLINE,.35);}
 if(o.id==='C'){line(c,`M${-w+2} -4.7 L${-w+3} -5.2`,'#fff0cc',.8);rr(c,-3.2,5.6,6.4,2, .6,o.navy,OUTLINE,.45);}
 if(o.id==='B'){rr(c,5.1,3.1,2.2,1.5,.2,'#c57f4b',OUTLINE,.3);circle(c,-6.7,-3.5,.5,'#e9c883',null);}
 c.restore();
}
export function drawEngineerConcept(c,id,x,floor,pose,{facing=1,palette=null,accessories=null}={}){
 const base=ENGINEER_CONCEPTS[id];if(!base)throw Error('Unknown engineer concept: '+id);
 const o={...base,...(palette?{suit:palette.primary,light:palette.light,shade:palette.shade,navy:palette.secondary,trim:palette.trim,helmetLight:palette.helmetLight,helmetShade:palette.helmetShade,gloveColor:palette.gloves,gloveLight:palette.gloveLight,bootColor:palette.boots,bootLight:palette.bootLight,paint:palette.paint,panels:palette.panels,regions:palette.regions}:{}),accessories:accessories||{utilityBelt:true,toolPouch:true,helmetAttachment:true,backpack:id==='B'?'utility':'compact'}},p=pose||engineerPose(),s=o.height/38;
 c.save();c.translate(x,floor);c.scale(facing<0?-s:s,s);c.lineCap='round';c.lineJoin='round';
 // Use the same far-to-near depth order as the shoulders, including both boots.
 leg(c,bodyRegion(o.panels?{...o,shade:o.panels[2],navy:o.panels[3]}:o,'legs'),2.4,p.frontLeg,p.frontLift,true);leg(c,bodyRegion(o.panels?{...o,suit:o.panels[3],shade:o.panels[2]}:o,'legs'),-2.7,p.backLeg,p.backLift,false);
 c.translate(0,p.bob);c.rotate(p.lean);
 // Equipment sits behind the shoulders and remains legible at scene scale.
 if(o.accessories.backpack==='utility'){
  rr(c,-9.1,-25.5,5.7,13,1.4,grad(c,-9,-25,5,13,'#566b7f','#26394e'));rr(c,-9.2,-23.9,2.3,5,.6,o.trim);line(c,'M-7.9 -18 L-6.3 -18 M-7.9 -16.7 L-6.3 -16.7','#111f30',.55);line(c,'M-7 -25.6 L-7.5 -29',o.trim,.7);circle(c,-7.5,-29,.65,o.suit);
 }else if(o.accessories.backpack){rr(c,-8,-23.5,4.5,8.8,1.4,o.navy);line(c,'M-7 -21.5 L-4 -21.5',o.trim,.8);}
 // Facing right, the right-hand shoulder is the far arm. Mirror the complete
 // rig when facing left so the torso consistently occludes that far shoulder.
 arm(c,bodyRegion(o.panels?{...o,shade:o.panels[1],navy:o.panels[0]}:o,'arms'),5,p.frontArm,p.elbow,true,p.tool>.15);
 const chest=o.id==='C'?'M-5.2 -25 Q0 -27.2 5.2 -25 L6.4 -14 Q0 -11.4 -6.4 -14 Z':o.id==='B'?'M-5.4 -25 L-2.5 -26.3 L3.6 -26 L6 -23.6 L5.4 -13 L-5.6 -13 Z':'M-5 -25 Q0 -27 5.4 -24.8 L6.4 -13 Q0 -11.7 -6.3 -13 Z';
 const torso=bodyRegion(o,'torso');path(c,chest,grad(c,-5,-25,10,12,torso.light,torso.suit),OUTLINE,.65,o.paint);
 if(o.regions?.lowerTorso){const lower=o.regions.lowerTorso;c.save();c.clip(new Path2D(chest));c.fillStyle=grad(c,-6,-18,12,6,lower.light,lower.suit);c.fillRect(-7,-18,14,6);c.restore();line(c,chest,OUTLINE,.65);}
 if(o.id==='A'){
  path(c,'M-4.5 -24.5 L-1 -21 L2 -24.9 L4.4 -23.7 L1.4 -19.4 L-1.2 -19.1 L-4.9 -23 Z',o.navy,OUTLINE,.4);
  line(c,'M-1 -20 L-.8 -14.3','#efd39b',.55);rr(c,1.4,-20,3,3.5,.4,o.shade,OUTLINE,.4);line(c,'M1.8 -19.2 L4 -19.2',o.trim,.6);path(c,'M-4.5 -23.3 L2.8 -13.7 L4.2 -14.2 L-3.3 -24 Z','#79563e',OUTLINE,.4);
 }else if(o.id==='B'){
  path(c,'M-4.4 -23.5 L-2.6 -24.1 L-2.1 -14 L-3.8 -14 Z',o.trim,OUTLINE,.4);path(c,'M2.9 -24 L4.6 -23.3 L4.2 -14 L2.5 -14 Z',o.trim,OUTLINE,.4);
  rr(c,-1.4,-22.8,3.7,4.8,.5,o.navy,OUTLINE,.4);line(c,'M-.6 -21 L1.6 -21','#dfb46b',.65);circle(c,.5,-19.4,.45,'#8dbfc7',null);rr(c,-1.2,-16.3,3.4,1,.15,'#b67542',OUTLINE,.35);
 }else{
  path(c,'M-5 -24.8 L-1.1 -22.4 L2.5 -25.2 L5 -24.1 L2.6 -20.5 L-1.2 -20 L-5.4 -22.3 Z',o.navy,OUTLINE,.45);rr(c,-3.8,-19.5,6.2,3.7,.8,o.shade,OUTLINE,.4);line(c,'M-2.8 -18.5 L1.4 -18.5',o.trim,.6);circle(c,3.4,-17.2,.65,'#efd7a2',OUTLINE,.35);
 }
 if(o.accessories.utilityBelt){rr(c,-6.3,-14,12.6,2.5,.7,'#293a4e');rr(c,-1.6,-14.2,3.6,2.8,.45,o.trim,OUTLINE,.5);rr(c,-.5,-13.6,1.4,1.5,.1,'#3a4653',null);}
 if(o.accessories.toolPouch){rr(c,-7.2,-13.9,4.2,5.2,.65,o.id==='B'?o.navy:'#8c603e');path(c,'M-7.1 -13.7 L-3.1 -13.7 L-3.1 -11.9 L-7.1 -11.6 Z',o.trim,OUTLINE,.35);circle(c,-5.1,-12.3,.35,'#f5d494',null);}
 if(!p.tool){line(c,'M4.4 -14.3 L4.4 -17.4','#abb9c3',1);line(c,'M3.8 -17.5 L4.4 -16.8 L5 -17.5','#abb9c3',.7);}
 rr(c,-3.3,-27,6.7,2.1,.6,o.regions?.joints||o.navy,OUTLINE,.55);line(c,'M-2.5 -26.3 L2.6 -26.3',o.trim,.55);
 helmet(c,o,p);arm(c,bodyRegion(o.panels?{...o,light:o.panels[4],suit:o.panels[0]}:o,'arms'),-4.8,p.backArm,0,false,false);
 c.restore();
}
