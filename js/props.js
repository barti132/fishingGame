import * as THREE from 'three';
import { WATER_Y } from './config.js';
import { mat } from './utils.js';

const LINE_N = 20;

// Bobber, fishing line, "!" bite marker and water ripples.
export function createFishingProps(scene){
  // ---- Bobber ----
  const bobber = new THREE.Group();
  const bobTop = new THREE.Mesh(
    new THREE.SphereGeometry(0.17, 10, 8, 0, Math.PI*2, 0, Math.PI/2),
    new THREE.MeshPhongMaterial({ color:0xd8453a, flatShading:true, side:THREE.DoubleSide })
  );
  const bobBot = new THREE.Mesh(
    new THREE.SphereGeometry(0.17, 10, 8, 0, Math.PI*2, Math.PI/2, Math.PI/2),
    new THREE.MeshPhongMaterial({ color:0xf6ecd9, flatShading:true, side:THREE.DoubleSide })
  );
  const bobStick = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.3, 5), mat(0xd8453a));
  bobStick.position.y = 0.3;
  bobber.add(bobTop, bobBot, bobStick);
  bobber.visible = false;
  scene.add(bobber);

  // ---- Line ----
  const lineGeo = new THREE.BufferGeometry();
  const linePos = new Float32Array(LINE_N * 3);
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
  const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color:0xf6ecd9, transparent:true, opacity:0.85 }));
  line.frustumCulled = false;
  line.visible = false;
  scene.add(line);

  // Draw a sagging line from the rod tip to the bobber.
  function setLine(tip, sag){
    const ex = bobber.position.x, ey = bobber.position.y + 0.32, ez = bobber.position.z;
    for(let i = 0; i < LINE_N; i++){
      const t = i / (LINE_N - 1);
      linePos[i*3]     = tip.x + (ex - tip.x) * t;
      linePos[i*3 + 1] = tip.y + (ey - tip.y) * t - sag * 4 * t * (1 - t);
      linePos[i*3 + 2] = tip.z + (ez - tip.z) * t;
    }
    lineGeo.attributes.position.needsUpdate = true;
  }

  // ---- "!" sprite ----
  const bang = (function(){
    const cv = document.createElement('canvas');
    cv.width = cv.height = 128;
    const cx = cv.getContext('2d');
    cx.font = '800 110px "Baloo 2", sans-serif';
    cx.textAlign = 'center';
    cx.textBaseline = 'middle';
    cx.lineWidth = 14;
    cx.strokeStyle = '#3a2410';
    cx.strokeText('!', 64, 70);
    cx.fillStyle = '#e8b73b';
    cx.fillText('!', 64, 70);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map:new THREE.CanvasTexture(cv), transparent:true, depthTest:false }));
    sp.scale.set(1.3, 1.3, 1);
    sp.renderOrder = 10;
    sp.visible = false;
    return sp;
  })();
  scene.add(bang);

  // ---- Ripples ----
  const ripples = [];
  function addRipple(x, z, size){
    const m = new THREE.Mesh(
      new THREE.RingGeometry(0.25, 0.32, 28),
      new THREE.MeshBasicMaterial({ color:0xffffff, transparent:true, opacity:0.7, side:THREE.DoubleSide, depthWrite:false })
    );
    m.rotation.x = -Math.PI/2;
    m.position.set(x, WATER_Y + 0.05, z);
    m.userData = { age:0, life:1.4, size:size || 3 };
    scene.add(m);
    ripples.push(m);
  }
  function updateRipples(dt){
    for(let i = ripples.length - 1; i >= 0; i--){
      const r = ripples[i];
      r.userData.age += dt;
      const k = r.userData.age / r.userData.life;
      if(k >= 1){
        scene.remove(r);
        r.geometry.dispose(); r.material.dispose();
        ripples.splice(i, 1);
      }else{
        const s = 1 + k * r.userData.size;
        r.scale.set(s, s, s);
        r.material.opacity = 0.7 * (1 - k);
      }
    }
  }

  return {
    bobber, bang,
    setLine, addRipple, updateRipples,
    showRig(){ bobber.visible = true; line.visible = true; },
    hideRig(){ bobber.visible = false; line.visible = false; },
    showBang(){ bang.visible = true; },
    hideBang(){ bang.visible = false; }
  };
}
