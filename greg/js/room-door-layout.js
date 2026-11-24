// Shared coordinates for door frames, their interaction areas, and the walking plane.
export const WALK_FLOOR = 220;
export const FLOOR_SURFACES=Object.freeze({
 default:Object.freeze({back:205,front:228}),
 engine:Object.freeze({back:204,front:231}),
 corridor:Object.freeze({back:210,front:233}),
 compact:Object.freeze({back:204,front:228}),
});
export function floorSurface(w){
 if(w.environmentPreview)return FLOOR_SURFACES.default;
 if(w.foundation?.demoMode?.kind==='nor-workbench')return FLOOR_SURFACES.compact;
 return FLOOR_SURFACES[w.room]||(['navigation','reactor','bridge'].includes(w.room)?FLOOR_SURFACES.compact:FLOOR_SURFACES.default);
}
export const DOOR_WIDTH = 80;
export const DOOR_HEIGHT = 140;

export const DOOR_CENTERS = Object.freeze({
  engine: 590,
  compactEngine: 424,
  corridorBack: 43,
  corridorGarden: 813,
  gardenBack: 42,
  gardenWorkshop: 1374,
  workshopBack: 43,
  workshopForward: 1104,
  compactBack: 43,
  compactForward: 431,
});

export const GARDEN_INTERLOCK = Object.freeze({
  panel: {x:714,y:143,w:45,h:62,walk:737},
  reader: {x:722,y:89,w:28,h:47,walk:737},
});

export function doorBounds(center,floor=FLOOR_SURFACES.default.back) {
  return {x:center-DOOR_WIDTH/2,y:floor-DOOR_HEIGHT,w:DOOR_WIDTH,h:DOOR_HEIGHT};
}

export function doorHotspot(center,id,label,walk) {
  return {id,label,...doorBounds(center),walk};
}

export function analysisDoorCenter(width,forward) {
  return forward ? width-42 : 42;
}
