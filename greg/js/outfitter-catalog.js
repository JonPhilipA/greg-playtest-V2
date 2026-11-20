import {COSMETIC_PRICES} from './economy.js';
// One configurable catalog. Historical receipts retain the price actually paid.
const colors=(primary,secondary,trim,highlight,extra={})=>Object.freeze({primary,secondary,trim,highlight,...extra});
const item=(character,id,name,palette,effect=null)=>Object.freeze({character,id,name,price:COSMETIC_PRICES[character][id],palette,effect});
const e=(...args)=>item('engineer',...args),g=(...args)=>item('greg',...args);
export const OUTFITTER_CATALOG=Object.freeze({
 engineer:Object.freeze([
  e('regular','Regular',null),
  e('navy','Midnight Navy',colors('#263a56','#4d6981','#c1d2de','#8faec5')),
  e('pink','Bubblegum',colors('#e979b2','#f5b6d6','#fff0d4','#ffcee8')),
  e('plumber','Plumber',colors('#ca4547','#315dc1','#e8c996','#f18a7b',{gloves:'#eee3cf',boots:'#79513b',regions:{torso:'#315dc1',arms:'#ca4547',lowerTorso:'#315dc1',legs:'#315dc1',visorTrim:'#e8c996'}})),
  e('miner','Miner',colors('#32acb1','#386ca4','#b69972','#8be0d6',{gloves:'#d1d1c5',boots:'#70523e',regions:{torso:'#32acb1',arms:'#32acb1',lowerTorso:'#386ca4',legs:'#386ca4'}})),
  e('scout','Star Scout',colors('#3e7954','#e0d7bb','#c7a253','#8db28b')),
  e('speedster','Speedster',colors('#2585e7','#345b8e','#e8f1f3','#8bcdf4',{gloves:'#eee8d8',boots:'#cf4642',regions:{torso:'#2585e7',arms:'#2585e7',legs:'#2585e7'}})),
  e('hazmat','Hazmat',colors('#e3bb36','#394553','#e68132','#f6dd85',{regions:{lowerTorso:'#394553',legs:'#394553'}})),
  e('nebula','Nebula',colors('#62468c','#ad438b','#6bd5e0','#af8ad4')),
  e('shadow','Shadow Circuit',colors('#28313f','#485567','#62d3dc','#73879a')),
  e('ranger','Orbital Ranger',colors('#66794a','#303d3d','#899073','#9dae75',{gloves:'#303d3d',boots:'#303d3d',regions:{torso:'#66794a',arms:'#66794a',legs:'#66794a',joints:'#303d3d',visorTrim:'#bcab6d'}})),
  e('gold','Golden Engineer',colors('#c6a24c','#866038','#f6d991','#ffe8b2'),'gold'),
  e('prismatic','Prismatic',colors('#c7667e','#6389cf','#ead577','#bce2db',{panels:['#d66b82','#e6b85e','#79b483','#579fc5','#9470b8']}),'prismatic'),
  e('galaxy','Galaxy Paint',colors('#303c74','#754d9d','#c16da8','#83dbe3'),'galaxy'),
 ]),
 greg:Object.freeze([
  g('standard','Standard',null),
  g('deepsea','Deep Sea',colors('#243d5b','#54718c','#a6c0d0','#b9dbea')),
  g('rose','Rose Circuit',colors('#b95187','#eaa8c9','#f5ddbb','#ffd1e3')),
  g('redline','Redline',colors('#aa3e43','#365ca1','#dfc3a4','#f18b76',{shellRegions:{upper:'#aa3e43',lower:'#365ca1'}})),
  g('orebot','Ore Bot',colors('#279d9e','#3d69a1','#9a7757','#9be1d3')),
  g('scoutsignal','Scout Signal',colors('#3c7153','#bfc8ac','#d0ae64','#b5d8b9')),
  g('velocity','Velocity',colors('#246fc8','#bc4e4b','#c5d6e1','#9ce3f1')),
  g('caution','Caution Bot',colors('#c9a83b','#343e48','#dc8039','#f8df8c')),
  g('void','Void Glow',colors('#59417b','#9f498d','#6acfdc','#bc8fda')),
  g('stealth','Stealth Module',colors('#293341','#151f2a','#5cc9d6','#91e0e5')),
  g('guardian','Guardian Shell',colors('#64734a','#38413c','#38413c','#b4a26e',{details:'#b4a26e'})),
  g('gilded','Gilded',colors('#c3a052','#856338','#f0cf7d','#ffe8ac'),'gold'),
  g('spectrum','Spectrum',colors('#7771b4','#639fc0','#e2bd63','#bce4dc',{panels:['#d56f88','#e1ae63','#80bb87','#66a7d3','#a27dca']}),'prismatic'),
  g('cosmos','Cosmos',colors('#413969','#69488b','#b7659c','#87d6df'),'galaxy'),
 ]),
});
export const DEFAULT_COSMETICS=Object.freeze({engineer:'regular',greg:'standard'});
export const cosmeticItem=(character,id)=>Object.hasOwn(OUTFITTER_CATALOG,character)?OUTFITTER_CATALOG[character].find(item=>item.id===id)||null:null;
