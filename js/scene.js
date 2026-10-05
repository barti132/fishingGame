import * as THREE from 'three';
import { HORIZON } from './config.js';

// Renderer, scene, camera, sky dome, sun and lights.
// Throws if WebGL is unavailable.
export function createScene(stage){
  const renderer = new THREE.WebGLRenderer({ antialias:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const canvas = renderer.domElement;
  stage.insertBefore(canvas, stage.firstChild);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(HORIZON, 40, 170);
  const camera = new THREE.PerspectiveCamera(55, 1, 0.3, 600);

  // ---- Sky dome + sun ----
  const sunDir = new THREE.Vector3(-0.5, 0.38, -0.75).normalize();
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(300, 24, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite:false,
      uniforms:{
        topC:{ value:new THREE.Color(0x2b3a6b) },
        midC:{ value:new THREE.Color(0x9a739a) },
        botC:{ value:new THREE.Color(HORIZON) }
      },
      vertexShader:'varying float vY; void main(){ vY = normalize(position).y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader:'uniform vec3 topC; uniform vec3 midC; uniform vec3 botC; varying float vY; void main(){ float h = clamp(vY,0.0,1.0); vec3 c = mix(botC, midC, smoothstep(0.0,0.22,h)); c = mix(c, topC, smoothstep(0.18,0.75,h)); if(vY < 0.0) c = botC; gl_FragColor = vec4(c,1.0); }'
    })
  );
  sky.renderOrder = -1;
  scene.add(sky);

  const sunGroup = new THREE.Group();
  const sunCore = new THREE.Mesh(new THREE.SphereGeometry(12, 16, 12), new THREE.MeshBasicMaterial({ color:0xffe3ad, fog:false }));
  const sunHalo = new THREE.Mesh(new THREE.SphereGeometry(26, 16, 12), new THREE.MeshBasicMaterial({ color:0xffb866, transparent:true, opacity:0.25, depthWrite:false, fog:false }));
  sunCore.position.copy(sunDir).multiplyScalar(260);
  sunHalo.position.copy(sunDir).multiplyScalar(260);
  sunGroup.add(sunCore); sunGroup.add(sunHalo);
  scene.add(sunGroup);

  // ---- Lights ----
  scene.add(new THREE.HemisphereLight(0xffdcb8, 0x3b4a2c, 0.75));
  const sunLight = new THREE.DirectionalLight(0xffc98a, 0.95);
  sunLight.position.copy(sunDir).multiplyScalar(70);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  const sc = sunLight.shadow.camera;
  sc.left = -55; sc.right = 55; sc.top = 55; sc.bottom = -55; sc.near = 1; sc.far = 200;
  sunLight.shadow.bias = -0.0007;
  scene.add(sunLight);

  function resize(){
    const w = stage.clientWidth, h = stage.clientHeight;
    if(!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  if(window.ResizeObserver) new ResizeObserver(resize).observe(stage);
  window.addEventListener('resize', resize);
  resize();

  return { renderer, canvas, scene, camera, sky, sunGroup };
}
