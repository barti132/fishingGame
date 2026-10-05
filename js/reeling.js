import { clamp } from './utils.js';

const TARGET_MARGIN = 14;

// Pure reeling-minigame logic (no DOM). Positions are in track pixels.
// `difficulty` is the current lake's difficulty object.
export function createReel(species, trackH, difficulty){
  const zoneH = Math.min(trackH * 0.5, species.zone * difficulty.zoneScale);
  const rs = {
    species,
    difficulty,
    trackH,
    zoneH,
    fishPos: trackH * 0.5,
    fishTarget: trackH * 0.5,
    playerPos: trackH * 0.5,
    playerVel: 0,
    progress: difficulty.startProgress
  };
  pickNewFishTarget(rs);
  return rs;
}

function pickNewFishTarget(rs){
  rs.fishTarget = TARGET_MARGIN + Math.random() * (rs.trackH - TARGET_MARGIN * 2);
}

// Advances the minigame. Returns 'win', 'lose' or null while still in progress.
export function stepReel(rs, dt, holding){
  const D = rs.difficulty;
  const diff = rs.fishTarget - rs.fishPos;
  rs.fishPos += diff * Math.min(1, dt * 2.2 * rs.species.speed * D.fishSpeedScale);
  if(Math.abs(diff) < 4) pickNewFishTarget(rs);

  const accel = holding ? D.lift : D.gravity;
  rs.playerVel = clamp(rs.playerVel + accel * dt, -D.maxVel, D.maxVel);
  rs.playerPos += rs.playerVel * dt;

  const zoneHalf = rs.zoneH / 2;
  if(rs.playerPos < zoneHalf){ rs.playerPos = zoneHalf; rs.playerVel = 0; }
  if(rs.playerPos > rs.trackH - zoneHalf){ rs.playerPos = rs.trackH - zoneHalf; rs.playerVel = 0; }

  const within = Math.abs(rs.fishPos - rs.playerPos) < zoneHalf;
  rs.progress = clamp(rs.progress + (within ? D.gainPerSec : -D.drainPerSec) * dt, 0, 100);

  if(rs.progress >= 100) return 'win';
  if(rs.progress <= 0) return 'lose';
  return null;
}
