import { STORAGE_KEY } from './config.js';

export const stats = { catches:0, bestWeight:0, bestName:'' };

try{
  const saved = localStorage.getItem(STORAGE_KEY);
  if(saved){
    const parsed = JSON.parse(saved);
    if(parsed && typeof parsed.catches === 'number') Object.assign(stats, parsed);
  }
}catch(e){}

function save(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(stats)); }catch(e){}
}

export function recordCatch(species, weightKg){
  stats.catches += 1;
  if(weightKg > stats.bestWeight){ stats.bestWeight = weightKg; stats.bestName = species.name; }
  save();
}
