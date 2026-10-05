import * as THREE from 'three';
import { STATE, WATER_Y, LAKE_R, DIFFICULTY } from './config.js';
import { pickSpecies, rollWeight } from './fish.js';
import { createReel, stepReel } from './reeling.js';
import { waveH } from './world.js';
import { recordCatch, stats } from './stats.js';
import { setMessage, renderStats, reelView, resultModal } from './ui.js';

const CAST_DUR = 0.75;

// Fishing state machine: IDLE -> CASTING -> WAITING -> BITE -> REELING -> RESULT.
export function createGame({ player, props, input }){
  let state = STATE.IDLE;
  let time = 0;
  let timers = [];
  let castT = 0;
  let rippleCd = 0;
  let reel = null;

  const castTarget = new THREE.Vector3();
  const nearPt = new THREE.Vector3();
  const bobPos = new THREE.Vector3();
  const tipPos = new THREE.Vector3();
  const tmp = new THREE.Vector3();

  const { bobber, bang } = props;

  function clearTimers(){ timers.forEach(clearTimeout); timers = []; }
  function after(ms, fn){ timers.push(setTimeout(fn, ms)); }
  function bobberWaterY(x, z){ return WATER_Y + waveH(x, z, time) + 0.02; }

  function resetToIdle(){
    clearTimers();
    state = STATE.IDLE;
    props.hideRig();
    props.hideBang();
    reelView.hide();
    reel = null;
  }

  // ---- Transitions ----
  function startCast(){
    const px = player.position.x, pz = player.position.z;
    const d = Math.hypot(px, pz) || 1;
    const ux = px / d, uz = pz / d;
    const landR = LAKE_R - (3.5 + Math.random() * 5.5);
    castTarget.set(ux * landR, WATER_Y, uz * landR);
    nearPt.set(ux * (LAKE_R - 1.2), WATER_Y, uz * (LAKE_R - 1.2));
    player.faceYaw(Math.atan2(-ux, -uz));
    state = STATE.CASTING;
    castT = 0;
    player.windUpRod();
    player.rodTip.getWorldPosition(tipPos);
    bobber.position.copy(tipPos);
    props.showRig();
  }

  function triggerBite(){
    if(state !== STATE.WAITING) return;
    state = STATE.BITE;
    props.showBang();
    rippleCd = 0;
    after(DIFFICULTY.biteWindowMs, () => {
      resetToIdle();
      setMessage('Ryba zerwała się i uciekła...', 2500);
    });
  }

  function hookFish(){
    clearTimers();
    props.hideBang();
    startReeling();
  }

  function startReeling(){
    state = STATE.REELING;
    reel = createReel(pickSpecies(), reelView.trackHeight());
    reelView.show(reel.species, reel.zoneH);
    props.addRipple(bobPos.x, bobPos.z, 3.5);
    rippleCd = 0;
  }

  function finishReeling(success){
    const species = reel.species;
    reelView.hide();
    if(success){
      landFish(species);
    }else{
      resetToIdle();
      setMessage('Żyłka puściła... ryba uciekła.', 2500);
    }
  }

  function landFish(species){
    const w = rollWeight(species);
    recordCatch(species, w);
    renderStats(stats);

    state = STATE.RESULT;
    reel = null;
    props.hideRig();
    props.addRipple(bobPos.x, bobPos.z, 4);
    resultModal.show(species, w);
  }

  // ---- Public actions ----
  function doAction(){
    if(state === STATE.IDLE){
      if(player.nearShore()) startCast();
      else setMessage('Podejdź bliżej brzegu jeziora.', 1800);
    }else if(state === STATE.WAITING){
      resetToIdle();
      setMessage('Zwinięto żyłkę.', 1800);
    }else if(state === STATE.BITE){
      hookFish();
    }
  }

  function dismissResult(){
    resultModal.hide();
    resetToIdle();
  }

  // ---- Per-frame ----
  function update(dt, t){
    time = t;
    if(state === STATE.IDLE || state === STATE.RESULT) return;
    player.rodTip.getWorldPosition(tipPos);

    switch(state){
      case STATE.CASTING: updateCasting(dt); break;
      case STATE.WAITING: updateWaiting(); break;
      case STATE.BITE:    updateBite(dt); break;
      case STATE.REELING: updateReeling(dt); break;
    }
  }

  function updateCasting(dt){
    castT += dt;
    const k = Math.min(1, castT / CAST_DUR);
    bobber.position.set(
      tipPos.x + (castTarget.x - tipPos.x) * k,
      tipPos.y + (WATER_Y - tipPos.y) * k + Math.sin(Math.PI * k) * 3.2,
      tipPos.z + (castTarget.z - tipPos.z) * k
    );
    props.setLine(tipPos, 0.25);
    if(k >= 1){
      state = STATE.WAITING;
      bobPos.copy(castTarget);
      props.addRipple(bobPos.x, bobPos.z, 3);
      after(DIFFICULTY.waitMinMs + Math.random() * DIFFICULTY.waitRangeMs, triggerBite);
    }
  }

  function updateWaiting(){
    bobber.position.set(bobPos.x, bobberWaterY(bobPos.x, bobPos.z) + Math.sin(time * 2) * 0.015, bobPos.z);
    props.setLine(tipPos, 0.7);
  }

  function updateBite(dt){
    bobber.position.set(
      bobPos.x + Math.sin(time * 45) * 0.05,
      bobberWaterY(bobPos.x, bobPos.z) - 0.12 + Math.sin(time * 30) * 0.04,
      bobPos.z + Math.cos(time * 38) * 0.05
    );
    bang.position.set(bobPos.x, WATER_Y + 1.5 + Math.sin(time * 10) * 0.08, bobPos.z);
    rippleCd -= dt;
    if(rippleCd <= 0){ props.addRipple(bobPos.x, bobPos.z, 2.2); rippleCd = 0.45; }
    props.setLine(tipPos, 0.4);
  }

  function updateReeling(dt){
    const result = stepReel(reel, dt, input.isHolding());
    reelView.render(reel);
    if(result){ finishReeling(result === 'win'); return; }

    tmp.copy(castTarget).lerp(nearPt, reel.progress * 0.008);
    bobPos.lerp(tmp, Math.min(1, dt * 5));
    bobber.position.set(
      bobPos.x + Math.sin(time * 31) * 0.06,
      bobberWaterY(bobPos.x, bobPos.z) - 0.04,
      bobPos.z + Math.cos(time * 27) * 0.06
    );
    rippleCd -= dt;
    if(rippleCd <= 0){ props.addRipple(bobPos.x, bobPos.z, 2.6); rippleCd = 0.35; }
    props.setLine(tipPos, 0.05);
  }

  return {
    get state(){ return state; },
    doAction, dismissResult, update
  };
}
