import * as THREE from 'three';
import { STATE } from './config.js';
import { stats } from './stats.js';
import { els, renderStats, updateHud, showFatal } from './ui.js';
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
  const { renderer, canvas, scene, camera, sky, sunGroup } = ctx;

  renderStats(stats);

  const world = buildWorld(scene);
  const player = createPlayer(scene, world.colliders);
  const props = createFishingProps(scene);

  let game;
  const input = createInput(canvas, els.joy, els.joyKnob, {
    isResult:  () => game.state === STATE.RESULT,
    isReeling: () => game.state === STATE.REELING,
    onAction:  () => game.doAction()
  });
  game = createGame({ player, props, input });

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
