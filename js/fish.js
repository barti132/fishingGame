import { SPECIES } from './config.js';

export function pickSpecies(){
  const total = SPECIES.reduce((s, f) => s + f.weight, 0);
  let r = Math.random() * total;
  for(const f of SPECIES){
    r -= f.weight;
    if(r <= 0) return f;
  }
  return SPECIES[0];
}

export function rollWeight(species){
  return species.minKg + Math.random() * (species.maxKg - species.minKg);
}
