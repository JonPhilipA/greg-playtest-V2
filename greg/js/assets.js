export class Assets {
  constructor(){this.images=new Map();this.manifest=null;}
  async load(){
    const response=await fetch(new URL('../assets/manifest.json',import.meta.url));
    if(!response.ok)throw Error('The ship’s artwork manifest could not be loaded.');
    this.manifest=await response.json();
    for(const id of ['gardenFar','gardenWorld','gardenNear','workshopWorld','workshopNand','engineScroll','corridorScroll','moonExterior','kestrelShip','titleBackdrop','corridorLocker','engineeringFrame','engineeringLeaf','lockerAnd'])if(!this.manifest.images?.[id]?.file)throw Error('Missing production artwork: '+id+'. Restore the complete dist/assets directory.');
    await Promise.all(Object.entries(this.manifest.images).map(async([id,entry])=>{
      const img=new Image();img.src=new URL(`../assets/${entry.file}`,import.meta.url).href;
      await img.decode();
      if(['gardenFar','gardenWorld','gardenNear','gardenFarStressed','gardenWorldStressed','gardenNearStressed','workshopWorld','galleryWorld','computationWorld','galleryObservatoryWorld','testBayWorld','blackBoxWorld'].includes(id)){
        const cache=typeof OffscreenCanvas==='function'?new OffscreenCanvas(img.width,img.height):document.createElement('canvas');
        cache.width=img.width;cache.height=img.height;cache.getContext('2d').drawImage(img,0,0);this.images.set(id,typeof cache.transferToImageBitmap==='function'?cache.transferToImageBitmap():cache);
      }else this.images.set(id,img);
    }));return this;
  }
  get(id){return this.images.get(id);}
}
