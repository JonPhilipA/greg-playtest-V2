import {knownComponentLessons,componentLesson,lessonRows} from './component-lessons.js';
import {COMPONENTS} from './components.js';
import {getBlueprint,GUIDE_SHEETS} from './blueprints.js';
import {learnedConcepts,lessonDefinition,conceptTruthTable} from './lesson-controller.js';
import {howToPlayMarkup} from './how-to-play.js';
import {gardenDecoderComplete} from './garden-decoder.js';
import {signedTutorialComplete} from './signed-binary.js';
import {serviceState} from './curriculum-profile.js';
import {REPAIRS} from './repairs.js';
import {isDataConsole} from './data-consoles.js';
export const MANUAL_CATEGORIES=Object.freeze([
 {id:'gates',name:'LOGIC GATES',icon:'gate'}, {id:'blueprints',name:'BLUEPRINTS',icon:'drawing'},
 {id:'data',name:'BINARY & DATA',icon:'binary'}, {id:'arithmetic',name:'ARITHMETIC',icon:'math'},
 {id:'systems',name:'COMPUTER SYSTEMS',icon:'chip'}, {id:'play',name:'HOW TO PLAY',icon:'info'},
]);
const expressions={NOT:'Y = NOT A',AND:'Y = A AND B',OR:'Y = A OR B',NOR:'Y = NOT (A OR B)',NAND:'Y = NOT (A AND B)',XOR:'Y = A XOR B'};
const classify=(id,w)=>['navbits','trajectory','ripple_adder','twos_complement','addsub'].includes(id)?'arithmetic':['cryo_signed','pressure_width','adc_precision','log_overflow'].includes(id)?'data':id==='firewall'?(isDataConsole(id,w.circuits[id])?'data':'gates'):['memory','reactor','alu','flightmemory','override'].includes(id)?'systems':'gates';
/** A read-only projection of existing knowledge receipts. No unlocks or writes. */
export function manualKnowledge(w){
 const articles=[],known=knownComponentLessons(w),lessons=learnedConcepts(w);
 const add=(category,id,title,kind,source,extra={})=>articles.push({category,id,title,kind,source,...extra});
 for(const id of known){const d=componentLesson(id),contextIds=[w.foundation.components.introduced?.[id]?.sourcePuzzleId,...(d.milestones||[])].filter(Boolean),context=contextIds.find(key=>w.machines[key]?.certified||w.foundation.investigations[key]);add('gates','gate:'+id,id+' GATE','gate',id,{explanation:d.explanation,expression:expressions[id],rows:lessonRows(id),inputs:d.inputs,outputs:d.outputs,context:context?lessonDefinition(context,w):null,contextExample:context?REPAIRS[context].problem:null});}
 for(const lesson of lessons){if(lesson.id==='twos_complement'&&!w.machines.twos_complement?.certified)continue;const gate=articles.find(a=>a.kind==='gate'&&[w.foundation.components.introduced?.[a.source]?.sourcePuzzleId,...(componentLesson(a.source).milestones||[])].includes(lesson.id));if(gate){gate.learnedSources??=[];gate.learnedSources.push({...lesson,truth:conceptTruthTable(lesson.id,w)});}else add(classify(lesson.id,w),'lesson:'+lesson.id,lesson.concept,'lesson',lesson.id,{lesson,truth:conceptTruthTable(lesson.id,w)});}
 const drawings=Object.keys(w.foundation.blueprints.acquired||{}).map(getBlueprint).filter(Boolean);
 for(const p of drawings)add('blueprints','drawing:'+p.id,p.name,'drawing',p.id,{blueprint:p,sheets:p.sheets.map(key=>GUIDE_SHEETS[key]).filter(Boolean)});
 for(const c of Object.values(w.foundation.components.certified||{}))if(COMPONENTS[c.componentId]&&c.sourceGraph)add('blueprints','design:'+c.componentId,'Certified '+COMPONENTS[c.componentId].name,'design',c.componentId,{certificate:c});
 if(w.machines.addsub?.certified&&w.foundation.applications.addsub)add('blueprints','circuit:addsub','Completed adder/subtractor circuit','completed-circuit','addsub',{graph:w.circuits.addsub});
 if(serviceState(w)?.applied){add('blueprints','demorgan:repair',"De Morgan's Law · Garden scrubber repair",'demorgan','repair');add('blueprints','demorgan:counterpart','De Morgan counterpart','demorgan','counterpart');}
 if(w.foundation.curriculum.asciiActivity?.complete)add('data','activity:ascii','ASCII and null-terminated strings','arithmetic-reference','ascii',{html:'<p>Binary values can represent characters through ASCII. 01001111 (79) = O; 01001011 (75) = K. Together they encode OK.</p><p>01001111 01001011 00000000 is a null-terminated string. The zero byte ends the string; it is not a printable letter, a space, or the character 0 (code 48).</p>'});
 if(w.machines.ripple_adder?.certified)add('arithmetic','reference:ripple','Four-Bit Ripple-Carry Adder','arithmetic-reference','ripple_adder',{html:'<p>FA0 handles bit 0. Its carry-out becomes FA1 carry-in; FA1 passes carry to FA2, then FA2 to FA3. C0 is the initial carry-in. S0–S3 form the four-bit result; C4 is separate.</p><p>0001 + 0010 = 0011. 0011 + 0001 = 0100. 0011 + 0101 = 1000. 1111 + 0001 = 0000 with C4 = 1. These are raw unsigned bit patterns; carry is not signed overflow.</p><p><strong>4-BIT ADDER · ADD4C</strong> packages the equivalent four Full Adders and accepts an initial Cin.</p>',graph:w.circuits.ripple_adder});
 const busKnown=w.machines.addsub?.certified||w.dialogueSeen.includes('problem-addsub-bus-v2');
 if(busKnown){add('arithmetic','reference:xor4','4-Bit XOR · XOR4','arithmetic-reference','XOR4',{html:'<p>XOR4 applies XOR independently to each pair of corresponding bits. Four ordinary XOR gates operate in parallel inside the module. XOR with 0 retains a bit; XOR with 1 flips it.</p>'});add('arithmetic','reference:fan4','Control Splitter · FAN4','arithmetic-reference','FAN4',{html:'<p>The control splitter replicates one input bit across four lanes. 0 becomes 0000; 1 becomes 1111. It is a control distributor, not an arithmetic operation.</p>'});}
 if(gardenDecoderComplete(w))add('data','tutorial:binary','Binary positional weights','tutorial','binary');
 if(signedTutorialComplete(w))add('data','tutorial:signed','Signed binary interpretation','tutorial','signed');
 // Reuse the consolidated Field Guide verbatim; split its existing sections into articles.
 for(const [index,m]of [...howToPlayMarkup(w).matchAll(/<h3>(.*?)<\/h3>([\s\S]*?)(?=<h3>|<\/details>)/g)].entries())add('play','play:'+index,m[1],'play',index,{html:m[2]});
 const events=w.foundation.presentation?.history||[];let recent=null;
 for(const event of [...events].reverse()){
  const candidate=['component.discovered','component.found'].includes(event.type)?'gate:'+event.parameters?.componentId:event.type==='machine.repaired'?'lesson:'+(event.puzzleId||event.parameters?.id):null;
  const entry=candidate&&articles.find(a=>a.id===candidate||a.kind==='gate'&&a.learnedSources?.some(l=>'lesson:'+l.id===candidate));if(entry){recent=entry;break;}
 }
 return {categories:MANUAL_CATEGORIES.map(category=>({...category,entries:articles.filter(a=>a.category===category.id)})),articles,stats:{gates:known.length,drawings:drawings.length,repaired:Object.values(w.machines).filter(m=>m.certified).length},recent};
}
export const manualArticle=(w,id)=>manualKnowledge(w).articles.find(a=>a.id===id)||null;
