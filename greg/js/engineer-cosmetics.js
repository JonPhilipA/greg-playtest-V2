import {cosmeticItem} from './outfitter-catalog.js';
// Shared appearance resolver. Ownership is enforced by the campaign Outfitter commands.
const outfit=(name,geometry,defaultPalette,backpack)=>Object.freeze({name,geometry,defaultPalette,accessories:Object.freeze({utilityBelt:true,toolPouch:true,backpack,helmetAttachment:true})});
export const ENGINEER_OUTFITS=Object.freeze({
 retroMechanic:outfit('Retro Mechanic','A','orange','compact'),
 kestrelTechnician:outfit('KESTREL Technician','B','navy','utility'),
});
const palette=(primary,secondary,helmet,trim,gloves='#25374c',boots='#28394c',extra={})=>Object.freeze({primary,secondary,helmet,trim,gloves,boots,...extra});
export const ENGINEER_PALETTES=Object.freeze({
 orange:palette('#bd7545','#2b3c51','#b38b58','#c9a568','#26384d','#293b50',{light:'#e6a16b',shade:'#784b35',helmetLight:'#e4be82',helmetShade:'#9c714b'}),
 navy:palette('#364c64','#263748','#344b62','#c4a26b','#26384d','#28394c',{light:'#6a8296',shade:'#213247',helmetLight:'#6a7c8a',helmetShade:'#263a51'}),
 pink:palette('#e783ad','#e4e7ec','#ebadc7','#c8a367','#23364d','#25384e'),
 yellow:palette('#cca84d','#35485b','#d9ba66','#d7b77b'),
 red:palette('#b8594c','#d6dbe0','#b96b60','#c5a367'),
 purple:palette('#77628d','#34435c','#847199','#c7a56d'),
 gold:palette('#b99b58','#263b54','#cbb376','#e4ca8a'),
});
export const DEFAULT_ENGINEER_APPEARANCE=Object.freeze({outfit:'retroMechanic',palette:'orange'});
const mix=(hex,target,t)=>'#'+[1,3,5].map(i=>Math.round(parseInt(hex.slice(i,i+2),16)*(1-t)+target*t).toString(16).padStart(2,'0')).join('');
const regionCache=new WeakMap();
function regionColors(palette){
 if(!palette.regions)return null;if(regionCache.has(palette))return regionCache.get(palette);
 const result={};for(const [name,color]of Object.entries(palette.regions))result[name]=['joints','visorTrim'].includes(name)?color:{suit:color,light:mix(color,255,.25),shade:mix(color,12,.3),navy:mix(color,12,.38)};
 regionCache.set(palette,result);return result;
}
export function resolveEngineerAppearance(selection){
 const outfitId=Object.hasOwn(ENGINEER_OUTFITS,selection?.outfit)?selection.outfit:DEFAULT_ENGINEER_APPEARANCE.outfit,o=ENGINEER_OUTFITS[outfitId];
 const paletteId=Object.hasOwn(ENGINEER_PALETTES,selection?.palette)?selection.palette:o.defaultPalette,p=ENGINEER_PALETTES[paletteId];
 const cosmetic=cosmeticItem('engineer',selection?.cosmetic);if(cosmetic?.palette){const q=cosmetic.palette;return {...resolveEngineerAppearance({outfit:outfitId,palette:paletteId}),cosmetic:cosmetic.id,name:cosmetic.name,effect:cosmetic.effect,colors:{...q,helmet:q.helmet||q.primary,gloves:q.gloves||q.secondary,boots:q.boots||q.secondary,regions:regionColors(q),light:q.highlight,shade:mix(q.primary,12,.3),helmetLight:mix(q.helmet||q.primary,255,.32),helmetShade:mix(q.helmet||q.primary,12,.25),gloveLight:mix(q.gloves||q.secondary,255,.24),bootLight:mix(q.boots||q.secondary,255,.22)}};}
 return {outfit:outfitId,palette:paletteId,geometry:o.geometry,name:o.name,accessories:o.accessories,colors:{...p,light:p.light||mix(p.primary,255,.25),shade:p.shade||mix(p.primary,12,.32),helmetLight:p.helmetLight||mix(p.helmet,255,.3),helmetShade:p.helmetShade||mix(p.helmet,15,.24),gloveLight:mix(p.gloves,255,.2),bootLight:mix(p.boots,255,.22)}};
}
export const ENGINEER_PREVIEW_VARIANTS=Object.freeze({
 A:Object.freeze({outfit:'retroMechanic',palette:'orange',label:'Retro Mechanic — Orange'}),
 B:Object.freeze({outfit:'kestrelTechnician',palette:'navy',label:'KESTREL Technician — Navy'}),
 P:Object.freeze({outfit:'retroMechanic',palette:'pink',label:'Retro Mechanic — Pink'}),
});
