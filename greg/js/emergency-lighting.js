// Localized light pools reveal the real room underneath a dark mask, never a flashing screen.
export function emergencyLighting(r,a,on){
 const power=a.power;if(on&&!power)return;
 const cam=a.cameraX||0,mask=r.emergencyMask??=(typeof OffscreenCanvas==='function'?new OffscreenCanvas(480,270):Object.assign(document.createElement('canvas'),{width:480,height:270})),m=mask.getContext('2d');
 m.clearRect(0,0,480,270);m.globalCompositeOperation='source-over';m.fillStyle=`rgba(2,6,13,${on?Math.max(0,.99-(power.ambient||0)*.95):.995})`;m.fillRect(0,0,480,270);
 m.globalCompositeOperation='destination-out';
 const pool=(x,y,radius,strength)=>{if(strength<=0)return;const g=m.createRadialGradient(x-cam,y,2,x-cam,y,radius);g.addColorStop(0,`rgba(0,0,0,${strength})`);g.addColorStop(1,'rgba(0,0,0,0)');m.fillStyle=g;m.fillRect(x-cam-radius,y-radius,radius*2,radius*2);};
 if(power)for(const [i,x]of [45,358,524].entries())pool(x,67,115,power.lamps[i]*.8);
 pool(86,155,55,on?.18:.04);if(on)pool(a.actor.x,204,27,.14);
 m.globalCompositeOperation='source-over';r.ctx.drawImage(mask,cam,0,480,270);
}
