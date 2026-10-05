export function pickSpecies(lake){
  const list = lake.species;
  const total = list.reduce((s, f) => s + f.weight, 0);
  let r = Math.random() * total;
  for(const f of list){
    r -= f.weight;
    if(r <= 0) return f;
  }
  return list[0];
}

export function rollWeight(species){
  return species.minKg + Math.random() * (species.maxKg - species.minKg);
}
