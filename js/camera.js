// Orbit camera follow: view = { yaw, pitch, dist } (mutated by input.js).
export function updateCamera(camera, view, target, sky, sunGroup){
  const cp = Math.cos(view.pitch), sp = Math.sin(view.pitch);
  const tx = target.x, ty = target.y + 1.6, tz = target.z;
  camera.position.set(
    tx + Math.sin(view.yaw) * cp * view.dist,
    ty + sp * view.dist,
    tz + Math.cos(view.yaw) * cp * view.dist
  );
  camera.lookAt(tx, ty, tz);
  sky.position.copy(camera.position);
  sunGroup.position.copy(camera.position);
}
