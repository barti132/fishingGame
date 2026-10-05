import { STATE } from './config.js';

const $ = id => document.getElementById(id);

export const els = {
  stage: $('stage'),
  message: $('message'),
  actionBtn: $('actionBtn'),
  joy: $('joy'),
  joyKnob: $('joyKnob'),
  lakes: $('lakes'),
  lakeName: $('lakeName'),
  statCatches: $('statCatches'),
  statBest: $('statBest'),
  reel: $('reel'),
  reelTrack: $('reelTrack'),
  playerZone: $('playerZone'),
  fishIcon: $('fishIcon'),
  progressFill: $('progressFill'),
  modal: $('modal'),
  modalEmoji: $('modalEmoji'),
  modalTitle: $('modalTitle'),
  modalRarity: $('modalRarity'),
  modalSub: $('modalSub'),
  continueBtn: $('continueBtn')
};

export function showFatal(text){ els.message.textContent = text; }

export function renderStats(stats){
  els.statCatches.textContent = stats.catches;
  els.statBest.textContent = stats.bestWeight ? (stats.bestWeight.toFixed(2) + ' kg') : '—';
}

// ---- Transient message (shown in IDLE state only) ----
let msgText = '', msgUntil = 0;
export function setMessage(text, ttl){
  msgText = text;
  msgUntil = ttl ? performance.now() + ttl : 0;
}

// ---- HUD text / button state (written to the DOM only when changed) ----
const cache = { text:null, btn:null, disabled:null, hidden:null, urgent:null };
export function updateHud(state, nearShore, now){
  let text = '', btn = 'Zarzuć wędkę', disabled = false, hidden = false, urgent = false;
  switch(state){
    case STATE.IDLE:
      if(nearShore){ text = 'Naciśnij E, by zarzucić wędkę'; }
      else{ text = 'Podejdź do brzegu jeziora'; disabled = true; }
      if(msgUntil && now < msgUntil) text = msgText;
      break;
    case STATE.CASTING:
      text = 'Zarzucasz...'; hidden = true; break;
    case STATE.WAITING:
      text = 'Czekasz na branie...'; btn = 'Zwiń żyłkę'; break;
    case STATE.BITE:
      text = 'BIERZE! Zacinaj!'; btn = 'Zacinaj!'; urgent = true; break;
    case STATE.REELING:
      text = 'Utrzymaj rybę w złotej strefie'; hidden = true; break;
    default:
      text = ''; hidden = true;
  }
  if(cache.text !== text){ els.message.textContent = text; cache.text = text; }
  if(cache.btn !== btn){ els.actionBtn.textContent = btn; cache.btn = btn; }
  if(cache.disabled !== disabled){ els.actionBtn.disabled = disabled; cache.disabled = disabled; }
  if(cache.hidden !== hidden){ els.actionBtn.hidden = hidden; cache.hidden = hidden; }
  if(cache.urgent !== urgent){ els.actionBtn.classList.toggle('urgent', urgent); cache.urgent = urgent; }
}

// ---- Reeling minigame view ----
export const reelView = {
  trackHeight(){ return els.reelTrack.clientHeight || 240; },
  show(species, zoneH){
    els.fishIcon.textContent = species.emoji;
    els.playerZone.style.height = zoneH + 'px';
    els.reel.classList.add('active');
  },
  hide(){ els.reel.classList.remove('active'); },
  render(rs){
    els.fishIcon.style.top = rs.fishPos + 'px';
    els.playerZone.style.top = (rs.playerPos - rs.zoneH / 2) + 'px';
    els.progressFill.style.width = rs.progress + '%';
  }
};

// ---- Result modal ----
export const resultModal = {
  show(species, weightKg){
    els.modalEmoji.textContent = species.emoji;
    els.modalTitle.textContent = species.name + '!';
    els.modalSub.textContent = 'Waga: ' + weightKg.toFixed(2) + ' kg';
    els.modalRarity.textContent = species.rarity;
    els.modalRarity.className = 'rarity-tag rarity-' + species.rarity;
    els.modal.classList.add('show');
    els.continueBtn.focus();
  },
  hide(){
    els.modal.classList.remove('show');
    els.continueBtn.blur();
  }
};

// ---- Lake picker ----
export function renderLakes(lakes, activeId, onPick){
  els.lakes.textContent = '';
  lakes.forEach((lake, i) => {
    const b = document.createElement('button');
    b.className = 'lake-btn' + (lake.id === activeId ? ' active' : '');
    b.tabIndex = -1;
    b.textContent = (i + 1) + '. ' + lake.name;
    const small = document.createElement('small');
    small.textContent = lake.level;
    b.appendChild(small);
    b.addEventListener('click', () => { onPick(lake); b.blur(); });
    els.lakes.appendChild(b);
  });
}

export function renderLakeTitle(lake){
  els.lakeName.textContent = '';
  const b = document.createElement('b');
  b.textContent = lake.name;
  els.lakeName.append(b, ' · ' + lake.level);
}
