import {gardenDecoderComplete} from './garden-decoder.js';

export function drawGardenKiosk(r,w){
 const complete=gardenDecoderComplete(w);
 r.image('gardenBinaryKiosk',1242,100,76,106);
 r.text(complete?'CALIBRATION COMPLETE':'BINARY CALIBRATION',1280,126,'#a7e1e9',3.5,'center');
 r.text(complete?'ONLINE':'0000',1280,141,'#99dce5',8,'center');
 r.text(complete?'SYSTEM ONLINE':'CALIBRATION REQUIRED',1280,153,complete?'#acddbb':'#e5bd78',3,'center');
 r.lamp(1311,109,1.7,true,complete?'#86c394':'#d2a65a');
 r.canvas.dataset.binaryKiosk=complete?'calibrated':'required';
}
