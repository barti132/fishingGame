import * as THREE from 'three';

export function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }

export function angleDiff(a, b){
  let d = a - b;
  while(d > Math.PI) d -= Math.PI * 2;
  while(d < -Math.PI) d += Math.PI * 2;
  return d;
}

// Seeded PRNG (mulberry32)
export function rng(seed){
  return function(){
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function mat(color){
  return new THREE.MeshPhongMaterial({ color, flatShading:true, shininess:4, specular:0x111111 });
}
