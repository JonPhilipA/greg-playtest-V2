// Small static, deterministic materials, cached once per context and finish.
// Paint is clipped by the existing shell/suit geometry, including moving limbs.
const cache=new WeakMap();
export function cosmeticMaterial(ctx,effect){
 if(!effect)return null;let materials=cache.get(ctx);if(!materials){materials=new Map();cache.set(ctx,materials);}if(materials.has(effect))return materials.get(effect);
 const tile=document.createElement('canvas');tile.width=64;tile.height=64;const c=tile.getContext('2d');
 if(effect==='galaxy'){
  const g=c.createLinearGradient(0,0,64,64);g.addColorStop(0,'#111e5000');g.addColorStop(.45,'#cd6cbc66');g.addColorStop(.7,'#6c9be72a');g.addColorStop(1,'#2a174a22');c.fillStyle=g;c.fillRect(0,0,64,64);
  let seed=72041;for(let i=0;i<48;i++){seed=(seed*1664525+1013904223)>>>0;const x=seed%64;seed=(seed*1664525+1013904223)>>>0;const y=seed%64;c.fillStyle=i%3?'#d2dfff9a':'#8be4eecc';c.fillRect(x,y,i%8===0?1.1:.55,.55);}
 }else if(effect==='prismatic'){
  const g=c.createLinearGradient(0,0,32,22);['#ed719b88','#edbd6b77','#8acb9777','#69b2df77','#be8be477'].forEach((v,i)=>g.addColorStop(i/4,v));c.fillStyle=g;c.fillRect(0,0,64,64);
 }else if(effect==='gold'){
  const g=c.createLinearGradient(0,0,18,30);g.addColorStop(0,'#fff1bb00');g.addColorStop(.35,'#fff1bb66');g.addColorStop(.42,'#fff5cd99');g.addColorStop(.56,'#bc813300');g.addColorStop(1,'#77501b44');c.fillStyle=g;c.fillRect(0,0,64,64);
 }
 const pattern=ctx.createPattern(tile,'repeat');materials.set(effect,pattern);return pattern;
}
