// World geometry
export const LAKE_R = 14;
export const HALF = 44;
export const WATER_Y = -0.12;
export const SHORE_REACH = 3.6;
export const HORIZON = 0xf0b383;

export const STORAGE_KEY = 'lowisko_stats_v1';

export const STATE = { IDLE:'idle', CASTING:'casting', WAITING:'waiting', BITE:'bite', REELING:'reeling', RESULT:'result' };

export const SPECIES = [
  { name:'Płoć',     emoji:'🐟', rarity:'pospolita',    weight:38, minKg:0.10, maxKg:0.5,  zone:60, speed:0.9 },
  { name:'Okoń',     emoji:'🐠', rarity:'pospolita',    weight:32, minKg:0.10, maxKg:0.6,  zone:56, speed:1.0 },
  { name:'Leszcz',   emoji:'🐡', rarity:'niepospolita', weight:16, minKg:0.5,  maxKg:2.0,  zone:46, speed:1.2 },
  { name:'Karp',     emoji:'🐠', rarity:'niepospolita', weight:9,  minKg:1.0,  maxKg:4.5,  zone:42, speed:1.1 },
  { name:'Szczupak', emoji:'🦈', rarity:'rzadka',       weight:4,  minKg:1.5,  maxKg:6.0,  zone:34, speed:1.6 },
  { name:'Sum',      emoji:'🐊', rarity:'legendarna',   weight:1,  minKg:5.0,  maxKg:22.0, zone:26, speed:1.9 }
];

// Tunable difficulty (easy mode). Raise/lower to taste.
export const DIFFICULTY = {
  waitMinMs: 1500,     // time before a bite: min
  waitRangeMs: 2500,   // ...plus random range
  biteWindowMs: 2800,  // time to strike after the bite
  zoneScale: 1.5,      // multiplier for the golden zone height
  fishSpeedScale: 0.7, // multiplier for fish movement speed
  startProgress: 55,   // initial catch progress (0-100)
  gainPerSec: 32,      // progress gained while fish is in the zone
  drainPerSec: 7,      // progress lost while fish is outside the zone
  lift: -560,          // hook acceleration while holding
  gravity: 480,        // hook acceleration while released
  maxVel: 220          // hook speed cap
};
