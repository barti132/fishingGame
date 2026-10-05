// World geometry (shared by all lakes)
export const LAKE_R = 14;
export const HALF = 44;
export const WATER_Y = -0.12;
export const SHORE_REACH = 3.6;

export const STORAGE_KEY = 'lowisko_stats_v2';
export const LEGACY_STORAGE_KEY = 'lowisko_stats_v1';

export const STATE = { IDLE:'idle', CASTING:'casting', WAITING:'waiting', BITE:'bite', REELING:'reeling', RESULT:'result' };

// Baseline difficulty (the easy lake). Lakes override individual values.
const BASE_DIFFICULTY = {
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

// species: weight = spawn weight, zone = golden zone size (px), speed = fish agility
export const LAKES = [
  {
    id: 'zatoka',
    name: 'Zielona Zatoka',
    level: 'Łatwy',
    seed: 20260,
    theme: {
      horizon: 0xf0b383, fogNear: 40, fogFar: 170,
      skyTop: 0x2b3a6b, skyMid: 0x9a739a,
      sunColor: 0xffc98a, sunCore: 0xffe3ad, sunHalo: 0xffb866,
      hemiSky: 0xffdcb8, hemiGround: 0x3b4a2c,
      ground: 0x6f9a4a, sand: 0xe3c88f, wall: 0xb89c66, bed: 0x1b5568,
      water: 0x2b93b3, waterOpacity: 0.86, waterSpecular: 0xffe1b0,
      trees: { normal:[0x3f7a47, 0x4a8a50, 0x58985a], autumn:[0xc9733a, 0xd98a3d, 0xe3a14a], autumnChance: 0.14, count: 42 },
      hills: 0x4d6b45
    },
    difficulty: { ...BASE_DIFFICULTY },
    species: [
      { name:'Płoć',     emoji:'🐟', rarity:'pospolita',    weight:38, minKg:0.10, maxKg:0.5,  zone:60, speed:0.9 },
      { name:'Okoń',     emoji:'🐠', rarity:'pospolita',    weight:32, minKg:0.10, maxKg:0.6,  zone:56, speed:1.0 },
      { name:'Leszcz',   emoji:'🐡', rarity:'niepospolita', weight:16, minKg:0.5,  maxKg:2.0,  zone:46, speed:1.2 },
      { name:'Karp',     emoji:'🐠', rarity:'niepospolita', weight:9,  minKg:1.0,  maxKg:4.5,  zone:42, speed:1.1 },
      { name:'Szczupak', emoji:'🦈', rarity:'rzadka',       weight:4,  minKg:1.5,  maxKg:6.0,  zone:34, speed:1.6 },
      { name:'Sum',      emoji:'🐊', rarity:'legendarna',   weight:1,  minKg:5.0,  maxKg:22.0, zone:26, speed:1.9 }
    ]
  },
  {
    id: 'staw',
    name: 'Mglisty Staw',
    level: 'Średni',
    seed: 4417,
    theme: {
      horizon: 0xb9c9cf, fogNear: 22, fogFar: 105,
      skyTop: 0x5d7a8c, skyMid: 0xa4b8bf,
      sunColor: 0xdfe8ea, sunCore: 0xf4f7f2, sunHalo: 0xcfdcdc,
      hemiSky: 0xd6e4e6, hemiGround: 0x34493a,
      ground: 0x56794f, sand: 0xb9b38f, wall: 0x8c8466, bed: 0x14403f,
      water: 0x3f7f86, waterOpacity: 0.9, waterSpecular: 0xe8f2f2,
      trees: { normal:[0x2f5f43, 0x386c4a, 0x437a52], autumn:[0xb0803a, 0xc2923f, 0xd0a54c], autumnChance: 0.3, count: 52 },
      hills: 0x3f5a4c
    },
    difficulty: {
      ...BASE_DIFFICULTY,
      waitMinMs: 2500, waitRangeMs: 3500, biteWindowMs: 2000,
      zoneScale: 1.15, fishSpeedScale: 1.0,
      startProgress: 45, gainPerSec: 30, drainPerSec: 11
    },
    species: [
      { name:'Wzdręga',  emoji:'🐟', rarity:'pospolita',    weight:36, minKg:0.15, maxKg:0.7,  zone:58, speed:1.0 },
      { name:'Lin',      emoji:'🐡', rarity:'pospolita',    weight:28, minKg:0.4,  maxKg:1.8,  zone:50, speed:0.9 },
      { name:'Węgorz',   emoji:'🐍', rarity:'niepospolita', weight:18, minKg:0.5,  maxKg:2.5,  zone:40, speed:1.5 },
      { name:'Sandacz',  emoji:'🐠', rarity:'niepospolita', weight:11, minKg:1.0,  maxKg:5.0,  zone:36, speed:1.4 },
      { name:'Boleń',    emoji:'🦈', rarity:'rzadka',       weight:5,  minKg:2.0,  maxKg:7.0,  zone:30, speed:1.8 },
      { name:'Sum olbrzymi', emoji:'🐊', rarity:'legendarna', weight:2, minKg:8.0,  maxKg:35.0, zone:22, speed:2.1 }
    ]
  },
  {
    id: 'gorskie',
    name: 'Górskie Oko',
    level: 'Trudny',
    seed: 9051,
    theme: {
      horizon: 0x7d8fb0, fogNear: 30, fogFar: 140,
      skyTop: 0x0e1a3d, skyMid: 0x4a4f86,
      sunColor: 0x9fb4ff, sunCore: 0xe6ecff, sunHalo: 0x8fa2e8,
      hemiSky: 0x9aa9d8, hemiGround: 0x2a3340,
      ground: 0x7a8a76, sand: 0xaaa393, wall: 0x7a7468, bed: 0x0d3150,
      water: 0x1f6a98, waterOpacity: 0.88, waterSpecular: 0xcfe0ff,
      trees: { normal:[0x234a4a, 0x2b5857, 0x346665], autumn:[0x234a4a, 0x2b5857, 0x346665], autumnChance: 0, count: 36 },
      hills: 0x56607a
    },
    difficulty: {
      ...BASE_DIFFICULTY,
      waitMinMs: 3000, waitRangeMs: 4500, biteWindowMs: 1500,
      zoneScale: 0.9, fishSpeedScale: 1.35,
      startProgress: 35, gainPerSec: 28, drainPerSec: 15
    },
    species: [
      { name:'Pstrąg potokowy', emoji:'🐟', rarity:'pospolita',    weight:38, minKg:0.15, maxKg:0.8, zone:52, speed:1.3 },
      { name:'Lipień',          emoji:'🐠', rarity:'niepospolita', weight:28, minKg:0.3,  maxKg:1.5, zone:44, speed:1.5 },
      { name:'Pstrąg tęczowy',  emoji:'🐡', rarity:'niepospolita', weight:18, minKg:0.5,  maxKg:3.0, zone:38, speed:1.6 },
      { name:'Golec',           emoji:'🐟', rarity:'rzadka',       weight:10, minKg:0.4,  maxKg:2.0, zone:32, speed:1.9 },
      { name:'Głowacica',       emoji:'🦈', rarity:'rzadka',       weight:5,  minKg:3.0,  maxKg:12.0, zone:26, speed:2.0 },
      { name:'Taimień',         emoji:'🐉', rarity:'legendarna',   weight:1,  minKg:10.0, maxKg:40.0, zone:20, speed:2.4 }
    ]
  }
];
