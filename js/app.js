import * as THREE from 'three';
import { STATE, LAKES } from './config.js';
import { getStats, getLastLakeId, setLastLakeId } from './stats.js';
import { els, renderStats, renderLakes, renderLakeTitle, updateHud, showFatal } from './ui.js';
import { createScene } from './scene.js';
import { buildWorld } from './world.js';
import { createPlayer } from './player.js';
import { createFishingProps } from './props.js';
import { createInput } from './input.js';
import { createGame } from './game.js';
import { updateCamera } from './camera.js';

export function start(){
  let ctx;
  try{
    ctx = createScene(els.stage);
  }catch(e){
    showFatal('Twoja przeglądarka nie obsługuje WebGL.');
    return;
  }
  const { renderer, canvas, scene, camera, sky, sunGroup, applyTheme } = ctx;

  const colliders = [];
  let lake = LAKES.find(l => l.id === getLastLakeId()) || LAKES[0];
  let world;

  const player = createPlayer(scene, colliders);
  const props = createFishingProps(scene);

  let game;
  const input = createInput(canvas, els.joy, els.joyKnob, {
    isResult:  () => game.state === STATE.RESULT,
    isReeling: () => game.state === STATE.REELING,
    onAction:  () => game.doAction(),
    onDigit:   n => { if(LAKES[n - 1]) switchLake(LAKES[n - 1]); }
  });
  game = createGame({ player, props, input, lake });

  function switchLake(next){
    if(world && next === lake) return;
    if(world) world.dispose();
    lake = next;
    setLastLakeId(lake.id);
    applyTheme(lake.theme);
    world = buildWorld(scene, lake, colliders);
    player.reset();
    game.setLake(lake);
    renderStats(getStats(lake.id));
    renderLakeTitle(lake);
    renderLakes(LAKES, lake.id, switchLake);
  }
  switchLake(lake);

  els.actionBtn.addEventListener('click', () => { game.doAction(); els.actionBtn.blur(); });
  els.continueBtn.addEventListener('click', () => game.dismissResult());

  const clock = new THREE.Clock();
  let time = 0;
  function frame(){
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, clock.getDelta());
    time += dt;
    world.updateWater(time);
    player.update(dt, { input:input.getMove(), camYaw:input.view.yaw, state:game.state, time });
    game.update(dt, time);
    props.updateRipples(dt);
    updateCamera(camera, input.view, player.position, sky, sunGroup);
    updateHud(game.state, player.nearShore(), performance.now());
    renderer.render(scene, camera);
  }
  frame();
}
