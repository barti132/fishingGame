import * as THREE from 'three';
import { LAKE_R, HALF, SHORE_REACH, STATE } from './config.js';
import { clamp, angleDiff, mat } from './utils.js';
import { START_Z } from './world.js';

const ROD_BASE = -0.7;
const JACKET = 0xc65b4a;

function box(w, h, d, color){
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
  m.castShadow = true;
  return m;
}

function limb(x, y, w, h, d, color, pivotY){
  const g = new THREE.Group();
  g.position.set(x, y, 0);
  const m = box(w, h, d, color);
  m.position.y = pivotY;
  g.add(m);
  return g;
}

// Low-poly angler with a fishing rod. Owns movement, collisions and animation.
export function createPlayer(scene, colliders){
  const group = new THREE.Group();

  const legL = limb(-0.17, 0.8, 0.28, 0.8, 0.3, 0x4a3b2c, -0.4);
  const legR = limb( 0.17, 0.8, 0.28, 0.8, 0.3, 0x4a3b2c, -0.4);
  group.add(legL, legR);

  const torso = box(0.74, 0.8, 0.42, JACKET); torso.position.y = 1.2; group.add(torso);
  const head = box(0.5, 0.5, 0.5, 0xf0c9a0); head.position.y = 1.85; group.add(head);
  const eyeL = box(0.07, 0.07, 0.04, 0x2a1d10); eyeL.position.set(-0.12, 1.88, 0.26); group.add(eyeL);
  const eyeR = box(0.07, 0.07, 0.04, 0x2a1d10); eyeR.position.set(0.12, 1.88, 0.26); group.add(eyeR);

  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.06, 8), mat(0xe8b73b));
  brim.position.y = 2.12; brim.castShadow = true; group.add(brim);
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.3, 0.28, 8), mat(0xe8b73b));
  crown.position.y = 2.27; crown.castShadow = true; group.add(crown);

  const armL = limb(-0.48, 1.55, 0.2, 0.7, 0.22, JACKET, -0.3);
  const armR = limb( 0.48, 1.55, 0.2, 0.7, 0.22, JACKET, -0.3);
  armR.rotation.x = -0.9;
  group.add(armL, armR);

  const rodPivot = new THREE.Group();
  rodPivot.position.set(0.42, 1.1, 0.42);
  rodPivot.rotation.x = ROD_BASE;
  const rodGeo = new THREE.CylinderGeometry(0.025, 0.045, 2.6, 6);
  rodGeo.rotateX(Math.PI / 2);
  rodGeo.translate(0, 0, 1.3);
  const rod = new THREE.Mesh(rodGeo, mat(0x3b2a1a));
  rod.castShadow = true;
  rodPivot.add(rod);
  const rodTip = new THREE.Object3D();
  rodTip.position.set(0, 0, 2.6);
  rodPivot.add(rodTip);
  group.add(rodPivot);

  group.position.set(0, 0, START_Z);
  group.rotation.y = Math.PI;
  scene.add(group);

  let targetYaw = group.rotation.y;
  let walkT = 0, walkAmp = 0;

  function resolveCollisions(){
    const p = group.position;
    const d = Math.hypot(p.x, p.z);
    const minD = LAKE_R + 0.35;
    if(d < minD){
      if(d < 0.0001){ p.x = 0; p.z = minD; }
      else{ const k = minD / d; p.x *= k; p.z *= k; }
    }
    for(const c of colliders){
      const dx = p.x - c.x, dz = p.z - c.z;
      const dd = Math.hypot(dx, dz);
      const m = c.r + 0.45;
      if(dd < m && dd > 0.0001){
        p.x = c.x + dx / dd * m;
        p.z = c.z + dz / dd * m;
      }
    }
    p.x = clamp(p.x, -(HALF - 1), HALF - 1);
    p.z = clamp(p.z, -(HALF - 1), HALF - 1);
  }

  // input: { f, r } in [-1,1]; camYaw: orbit camera yaw; state: game STATE; time: seconds
  function update(dt, { input, camYaw, state, time }){
    let moving = false;
    if(state === STATE.IDLE && (Math.abs(input.f) > 0.01 || Math.abs(input.r) > 0.01)){
      const sy = Math.sin(camYaw), cy = Math.cos(camYaw);
      const dx = -sy * input.f + cy * input.r;
      const dz = -cy * input.f - sy * input.r;
      const len = Math.hypot(dx, dz) || 1;
      const speed = 5.2 * Math.min(1, Math.hypot(input.f, input.r));
      group.position.x += dx / len * speed * dt;
      group.position.z += dz / len * speed * dt;
      targetYaw = Math.atan2(dx, dz);
      moving = true;
      resolveCollisions();
    }
    group.rotation.y += angleDiff(targetYaw, group.rotation.y) * Math.min(1, dt * 12);

    walkT += dt * (moving ? 10 : 0);
    walkAmp += ((moving ? 1 : 0) - walkAmp) * Math.min(1, dt * 10);
    legL.rotation.x = Math.sin(walkT) * 0.7 * walkAmp;
    legR.rotation.x = -Math.sin(walkT) * 0.7 * walkAmp;
    armL.rotation.x = -Math.sin(walkT) * 0.6 * walkAmp;
    group.position.y = Math.abs(Math.sin(walkT)) * 0.06 * walkAmp;

    let rodTarget = ROD_BASE;
    let rodRate = 6;
    if(state === STATE.CASTING){ rodTarget = -0.35; rodRate = 10; }
    else if(state === STATE.REELING){ rodTarget = -0.95 + Math.sin(time * 18) * 0.06; rodRate = 12; }
    rodPivot.rotation.x += (rodTarget - rodPivot.rotation.x) * Math.min(1, dt * rodRate);
  }

  return {
    group,
    position: group.position,
    rodTip,
    update,
    nearShore(){ return Math.hypot(group.position.x, group.position.z) < LAKE_R + SHORE_REACH; },
    faceYaw(yaw){ targetYaw = yaw; },
    windUpRod(){ rodPivot.rotation.x = -1.5; }
  };
}
