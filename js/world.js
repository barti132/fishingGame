import * as THREE from 'three';
import { LAKE_R, HALF, WATER_Y } from './config.js';
import { rng, mat, angleDiff } from './utils.js';

export const START_Z = LAKE_R + 6;

export function waveH(x, z, t){
  return Math.sin(x*0.45 + t*1.1)*0.035 + Math.cos(z*0.55 + t*0.9)*0.035;
}

// Ground with a circular hole, lake, shore, trees, hills and rocks.
// Returns { colliders, updateWater(t) }.
export function buildWorld(scene){
  const colliders = [];
  const rand = rng(20260);

  buildTerrain(scene);
  const updateWater = buildWater(scene);
  buildTrees(scene, rand, colliders);
  buildHills(scene, rand);
  buildRocks(scene, rand, colliders);

  return { colliders, updateWater };
}

function buildTerrain(scene){
  const G = 200;
  const groundShape = new THREE.Shape();
  groundShape.moveTo(-G,-G); groundShape.lineTo(G,-G); groundShape.lineTo(G,G); groundShape.lineTo(-G,G); groundShape.lineTo(-G,-G);
  const hole = new THREE.Path();
  hole.absarc(0, 0, LAKE_R, 0, Math.PI*2, true);
  groundShape.holes.push(hole);
  const ground = new THREE.Mesh(new THREE.ShapeGeometry(groundShape, 64), mat(0x6f9a4a));
  ground.rotation.x = -Math.PI/2;
  ground.receiveShadow = true;
  scene.add(ground);

  const sand = new THREE.Mesh(new THREE.RingGeometry(LAKE_R - 0.05, LAKE_R + 1.6, 64), mat(0xe3c88f));
  sand.rotation.x = -Math.PI/2;
  sand.position.y = 0.03;
  sand.receiveShadow = true;
  scene.add(sand);

  const lakeWall = new THREE.Mesh(
    new THREE.CylinderGeometry(LAKE_R, LAKE_R, 1.3, 48, 1, true),
    new THREE.MeshPhongMaterial({ color:0xb89c66, flatShading:true, side:THREE.BackSide })
  );
  lakeWall.position.y = -0.65;
  scene.add(lakeWall);

  const lakeBed = new THREE.Mesh(new THREE.CircleGeometry(LAKE_R, 48), mat(0x1b5568));
  lakeBed.rotation.x = -Math.PI/2;
  lakeBed.position.y = -1.3;
  scene.add(lakeBed);
}

function buildWater(scene){
  const geo = new THREE.PlaneGeometry(LAKE_R*2 + 4, LAKE_R*2 + 4, 36, 36);
  const material = new THREE.MeshPhongMaterial({
    color:0x2b93b3, transparent:true, opacity:0.86, shininess:90, specular:0xffe1b0, flatShading:true
  });
  const water = new THREE.Mesh(geo, material);
  water.rotation.x = -Math.PI/2;
  water.position.y = WATER_Y;
  scene.add(water);

  const pos = geo.attributes.position;
  return function updateWater(t){
    for(let i = 0; i < pos.count; i++){
      pos.setZ(i, waveH(pos.getX(i), -pos.getY(i), t));
    }
    pos.needsUpdate = true;
  };
}

function makeTree(scene, rand, x, z, s, castShadow){
  const g = new THREE.Group();
  const autumn = rand() < 0.14;
  const cols = autumn ? [0xc9733a, 0xd98a3d, 0xe3a14a] : [0x3f7a47, 0x4a8a50, 0x58985a];
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 1.4, 6), mat(0x6b4226));
  trunk.position.y = 0.7; g.add(trunk);
  const c1 = new THREE.Mesh(new THREE.ConeGeometry(1.5, 2.2, 7), mat(cols[0])); c1.position.y = 2.2; g.add(c1);
  const c2 = new THREE.Mesh(new THREE.ConeGeometry(1.15, 2.0, 7), mat(cols[1])); c2.position.y = 3.4; g.add(c2);
  const c3 = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.7, 7), mat(cols[2])); c3.position.y = 4.5; g.add(c3);
  g.children.forEach(m => { m.castShadow = !!castShadow; });
  g.position.set(x, 0, z);
  g.scale.setScalar(s);
  g.rotation.y = rand() * Math.PI * 2;
  scene.add(g);
}

function buildTrees(scene, rand, colliders){
  const placed = [];
  let tries = 0;
  while(placed.length < 42 && tries < 800){
    tries++;
    const tx = (rand()*2 - 1) * (HALF - 2);
    const tz = (rand()*2 - 1) * (HALF - 2);
    if(Math.hypot(tx, tz) < LAKE_R + 5) continue;
    if(Math.hypot(tx, tz - START_Z) < 5) continue;
    if(placed.some(p => Math.hypot(tx - p.x, tz - p.z) < 3.2)) continue;
    const ts = 0.8 + rand() * 0.7;
    makeTree(scene, rand, tx, tz, ts, true);
    placed.push({ x:tx, z:tz });
    colliders.push({ x:tx, z:tz, r:0.55 * ts });
  }
  // outer forest (not reachable, no shadows to keep it cheap)
  for(let i = 0; i < 40; i++){
    const a = rand() * Math.PI * 2;
    const rad = 50 + rand() * 28;
    makeTree(scene, rand, Math.cos(a) * rad, Math.sin(a) * rad, 1.0 + rand() * 0.9, false);
  }
}

function buildHills(scene, rand){
  for(let i = 0; i < 14; i++){
    const a = (i / 14) * Math.PI * 2 + rand() * 0.3;
    const r = 115 + rand() * 30;
    const h = 18 + rand() * 18;
    const hill = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 5), mat(0x4d6b45));
    hill.scale.set(26 + rand() * 20, h, 26 + rand() * 20);
    hill.position.set(Math.cos(a) * r, h / 2 - 1, Math.sin(a) * r);
    scene.add(hill);
  }
}

// rocks along the shore (leave the start area open)
function buildRocks(scene, rand, colliders){
  for(let i = 0; i < 14; i++){
    const a = (i / 14) * Math.PI * 2 + rand() * 0.3;
    if(Math.abs(angleDiff(a, Math.PI/2)) < 0.6) continue;
    const r = LAKE_R + 1.4 + rand() * 1.4;
    const s = 0.5 + rand() * 0.6;
    const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), mat(rand() < 0.5 ? 0x8d8a82 : 0x76736c));
    rock.scale.set(s * (1 + rand()*0.4), s * 0.7, s * (1 + rand()*0.4));
    rock.position.set(Math.cos(a) * r, 0.15, Math.sin(a) * r);
    rock.rotation.y = rand() * 3;
    rock.castShadow = true; rock.receiveShadow = true;
    scene.add(rock);
    colliders.push({ x:rock.position.x, z:rock.position.z, r:s * 0.9 });
  }
}
