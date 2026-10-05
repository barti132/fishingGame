import { STORAGE_KEY, LEGACY_STORAGE_KEY, LAKES } from './config.js';

// { lastLake: id, lakes: { [id]: { catches, bestWeight, bestName } } }
const data = { lastLake: LAKES[0].id, lakes: {} };

function empty(){ return { catches:0, bestWeight:0, bestName:'' }; }

try{
  const saved = localStorage.getItem(STORAGE_KEY);
  if(saved){
    const parsed = JSON.parse(saved);
    if(parsed && typeof parsed.lakes === 'object'){ Object.assign(data, parsed); }
  }else{
    // migrate single-lake stats from v1 into the first lake
    const legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) || 'null');
    if(legacy && typeof legacy.catches === 'number') data.lakes[LAKES[0].id] = legacy;
  }
}catch(e){}

function save(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }catch(e){}
}

export function getStats(lakeId){
  if(!data.lakes[lakeId]) data.lakes[lakeId] = empty();
  return data.lakes[lakeId];
}

export function getLastLakeId(){ return data.lastLake; }
export function setLastLakeId(id){ data.lastLake = id; save(); }

export function recordCatch(lakeId, species, weightKg){
  const s = getStats(lakeId);
  s.catches += 1;
  if(weightKg > s.bestWeight){ s.bestWeight = weightKg; s.bestName = species.name; }
  save();
  return s;
}
