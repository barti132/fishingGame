import { clamp } from './utils.js';

// Keyboard, pointer (camera drag / reel hold), wheel zoom and virtual joystick.
// hooks: { isResult(), isReeling(), onAction() }
export function createInput(canvas, joy, joyKnob, hooks){
  const view = { yaw:0, pitch:0.42, dist:9.5 };
  let keys = {};
  let holdKey = false, holdPtr = false;

  // ---- Keyboard ----
  window.addEventListener('keydown', e => {
    if(hooks.isResult()) return;
    if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].indexOf(e.code) >= 0) e.preventDefault();
    keys[e.code] = true;
    if(e.repeat) return;
    if(e.code === 'Space'){
      holdKey = true;
      if(!hooks.isReeling()) hooks.onAction();
    }else if(e.code === 'KeyE'){
      if(!hooks.isReeling()) hooks.onAction();
    }
  });
  window.addEventListener('keyup', e => {
    keys[e.code] = false;
    if(e.code === 'Space') holdKey = false;
  });
  window.addEventListener('blur', () => { keys = {}; holdKey = false; holdPtr = false; });

  // ---- Pointer: orbit camera, or hold to lift the hook while reeling ----
  let dragging = false, dragId = null, lastX = 0, lastY = 0, holdId = null;
  canvas.addEventListener('pointerdown', e => {
    try{ canvas.setPointerCapture(e.pointerId); }catch(err){}
    if(hooks.isReeling()){
      holdPtr = true; holdId = e.pointerId;
      return;
    }
    dragging = true; dragId = e.pointerId; lastX = e.clientX; lastY = e.clientY;
  });
  canvas.addEventListener('pointermove', e => {
    if(!dragging || e.pointerId !== dragId) return;
    view.yaw -= (e.clientX - lastX) * 0.0055;
    view.pitch = clamp(view.pitch + (e.clientY - lastY) * 0.004, 0.12, 1.2);
    lastX = e.clientX; lastY = e.clientY;
  });
  function endPointer(e){
    if(e.pointerId === dragId){ dragging = false; dragId = null; }
    if(e.pointerId === holdId){ holdPtr = false; holdId = null; }
  }
  canvas.addEventListener('pointerup', endPointer);
  canvas.addEventListener('pointercancel', endPointer);
  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    view.dist = clamp(view.dist + e.deltaY * 0.01, 5, 16);
  }, { passive:false });

  // ---- Joystick ----
  const joyVec = { x:0, y:0 };
  let joyId = null;
  function joyUpdate(e){
    const r = joy.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    let dx = e.clientX - cx, dy = e.clientY - cy;
    const max = r.width * 0.35;
    const len = Math.hypot(dx, dy);
    if(len > max){ dx = dx / len * max; dy = dy / len * max; }
    joyVec.x = dx / max; joyVec.y = dy / max;
    joyKnob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
  }
  joy.addEventListener('pointerdown', e => {
    joyId = e.pointerId;
    try{ joy.setPointerCapture(e.pointerId); }catch(err){}
    joyUpdate(e);
  });
  joy.addEventListener('pointermove', e => { if(e.pointerId === joyId) joyUpdate(e); });
  function joyEnd(e){
    if(e.pointerId !== joyId) return;
    joyId = null; joyVec.x = 0; joyVec.y = 0;
    joyKnob.style.transform = 'translate(0,0)';
  }
  joy.addEventListener('pointerup', joyEnd);
  joy.addEventListener('pointercancel', joyEnd);

  return {
    view,
    isHolding(){ return holdKey || holdPtr; },
    // Movement vector: f = forward, r = right, length clamped to 1
    getMove(){
      let f = 0, r = 0;
      if(keys.KeyW || keys.ArrowUp) f += 1;
      if(keys.KeyS || keys.ArrowDown) f -= 1;
      if(keys.KeyD || keys.ArrowRight) r += 1;
      if(keys.KeyA || keys.ArrowLeft) r -= 1;
      f += -joyVec.y; r += joyVec.x;
      const len = Math.hypot(f, r);
      if(len > 1){ f /= len; r /= len; }
      return { f, r };
    }
  };
}
