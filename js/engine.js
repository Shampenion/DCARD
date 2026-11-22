// ==========================================

// DCARD V28 — ІГРОВИЙ РУШІЙ (js/engine.js)

// Стан партії, Бюджет сили, віяло руки, ШІ ботів, цикл дуелей та турнір

// ==========================================

const rnd = k => Math.floor(Math.random() * k);
let HS = 0;
const sl = ms => { const x = HS; HS = 0; return new Promise(r => setTimeout(r, ms + x)); };

const VOL = { m: .5, s: 1 };
let MU = null, P = [], n = 4, ptr = 0, turn = 1, gameId = 0, res = null, T = {}, CU = { a: -1, d: -1 }, AC, mute = false, cam = 0;
let SESSION_PREV_DMG = {}; // пам'ять сеансу про отриману шкоду для Батога Фурії (не скидається між партіями)
let isPaused = false;
let STAT = [], TOUR = null, CAMPAIGN = null;
let tourElimPromptShown = false, tourSpectating = false, endFxTimer = null, tartarusTimers = [];

// ===== ПОМІЧНИКИ ДЛЯ «ДАРІВ ВІВТАРЯ» =====
const hasRelic = (pIdx, relicId) => {
  if (!TOUR || !Array.isArray(TOUR.relics)) return false;
  const p = P[pIdx];
  const tIdx = p ? (p.tourIdx ?? pIdx) : pIdx;
  return Array.isArray(TOUR.relics[tIdx]) && TOUR.relics[tIdx].includes(relicId);
};

const getPlayerRelics = (pIdx) => {
  if (!TOUR || !Array.isArray(TOUR.relics)) return [];
  const p = P[pIdx];
  const tIdx = p ? (p.tourIdx ?? pIdx) : pIdx;
  return (TOUR.relics[tIdx] || []).map(id => RELIC_BY_ID[id]).filter(Boolean);
};

function applyRelicHealBonus(pIdx, baseHeal, isSecondActor = false) {
  let hv = baseHeal;
  if (isSecondActor && hasRelic(pIdx, "depth_silence")) hv += 6;
  if (hasRelic(pIdx, "cup_asclepius")) hv = Math.round(hv * 1.2);
  return hv;
}

function rollThreeRelics(excludeIds = []) {
  const pool = ALTAR_RELICS.filter(r => !excludeIds.includes(r.id));
  const weights = { bronze: 50, silver: 35, gold: 15 };
  const picked = [];
  const avail = [...pool];
  while (picked.length < 3 && avail.length) {
    const totalW = avail.reduce((s, r) => s + (weights[r.tier] || 20), 0);
    let roll = Math.random() * totalW, idx = 0;
    for (let i = 0; i < avail.length; i++) {
      roll -= (weights[avail[i].tier] || 20);
      if (roll <= 0) { idx = i; break; }
    }
    picked.push(avail.splice(idx, 1)[0]);
  }
  return picked;
}

// ===== ПРОФІЛЬ ДУЕЛЯНТА (localStorage) =====
const PROFILE_KEY = "dcard_duelist_profile_v1";
let PROFILE = (() => {
  try {
    const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
    if (saved && typeof saved === "object") {
      return {
        name: String(saved.name || "ТИ").slice(0, 14),
        crest: Number.isInteger(saved.crest) ? Math.max(0, Math.min(AVATARS.length - 1, saved.crest)) : 0,
        banner: Number.isInteger(saved.banner) ? Math.max(0, Math.min(PL_BANNERS.length - 1, saved.banner)) : 0,
        wins: Number(saved.wins) || 0,
        games: Number(saved.games) || 0,
        streak: Number(saved.streak) || 0,
        bestHit: Number(saved.bestHit) || 0,
        cardUsage: saved.cardUsage && typeof saved.cardUsage === "object" ? saved.cardUsage : {},
        campaignMaxLvl: Math.max(1, Math.min(10, Number(saved.campaignMaxLvl) || 1)),
        campaignCleared: Array.isArray(saved.campaignCleared) ? saved.campaignCleared : [],
        campaignStars: saved.campaignStars && typeof saved.campaignStars === "object" ? saved.campaignStars : {},
        campaignRewards: Array.isArray(saved.campaignRewards) ? saved.campaignRewards : [],
        activeTitle: String(saved.activeTitle || ""),
        trophies: Math.max(0, Number(saved.trophies) || 0),
        claimedRewards: Array.isArray(saved.claimedRewards) ? saved.claimedRewards : [],
        cardBack: typeof saved.cardBack === "string" && CARD_BACKS.some(cb => cb.id === saved.cardBack) ? saved.cardBack : "classic",
        history: Array.isArray(saved.history) ? saved.history.slice(0, 15) : [],
        updatedAt: Number(saved.updatedAt) || 0
      };
    }
  } catch (e) {}
  return { name: "ТИ", crest: 0, banner: 0, wins: 0, games: 0, streak: 0, bestHit: 0, cardUsage: {}, campaignMaxLvl: 1, campaignCleared: [], campaignStars: {}, campaignRewards: [], activeTitle: "", trophies: 0, claimedRewards: [], cardBack: "classic", history: [], updatedAt: 0 };
})();

function saveProfile() {
  PROFILE.updatedAt = Date.now();
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(PROFILE)); } catch (e) {}
  if (window.DCARD_CLOUD && typeof window.DCARD_CLOUD.scheduleSave === "function") window.DCARD_CLOUD.scheduleSave();
}

function getFavoriteCard() {
  const entries = Object.entries(PROFILE.cardUsage || {});
  if (!entries.length) return { t: "d", r: 3 };
  entries.sort((a, b) => b[1] - a[1]);
  const [t, rStr] = entries[0][0].split(":");
  const r = parseInt(rStr, 10);
  return { t: t || "d", r: Number.isNaN(r) ? 3 : r };
}

function trackCardPlayed(c) {
  if (!c || !c.t) return;
  const key = `${c.t}:${c.r ?? 0}`;
  PROFILE.cardUsage[key] = (PROFILE.cardUsage[key] || 0) + 1;
  saveProfile();
}

// ===== СИСТЕМА КУБКІВ, 5 ЛІГ ТА «ДОРОГИ ОЛІМПУ» =====
let MATCH_ELIM_ORDER = [];
let _backSvgUid = 0;

function getLeagueForTrophies(tr = PROFILE.trophies || 0) {
  return TROPHY_LEAGUES.find(l => tr >= l.min && tr <= l.max) || TROPHY_LEAGUES[0];
}

function getNextGloryMilestone(tr = PROFILE.trophies || 0) {
  return GLORY_ROAD_REWARDS.find(m => tr < m.trophies) || null;
}

function getUnclaimedGloryRewards() {
  const tr = PROFILE.trophies || 0;
  const claimed = PROFILE.claimedRewards || [];
  return GLORY_ROAD_REWARDS.filter(m => tr >= m.trophies && !claimed.includes(m.id));
}

function getGloryLockInfo(type, itemId) {
  // 1. Перевірка Дороги Олімпу
  const m = GLORY_ROAD_REWARDS.find(r => r.type === type && r.itemId === itemId);
  if (m) {
    const unlocked = (PROFILE.claimedRewards || []).includes(m.id);
    return { locked: !unlocked, source: "glory", req: m.trophies, milestone: m, badge: `${m.trophies} ${UI_IC.trophy}` };
  }
  // 2. Перевірка нагород кампанії «Шлях Арен» (аватари, щити, титули)
  if (typeof CAMPAIGN_CHAPTER_1 !== "undefined") {
    const campNode = CAMPAIGN_CHAPTER_1.find(n => n.rewardType === type && n.rewardId === itemId);
    if (campNode) {
      const cleared = PROFILE.campaignCleared || [];
      const unlocked = cleared.includes(campNode.lvl);
      const shortBadge = campNode.isSide ? `${UI_IC.star} Таємн.` : `Рів. ${campNode.lvl}`;
      return { locked: !unlocked, source: "campaign", req: campNode.lvl, campNode, badge: shortBadge };
    }
  }
  return { locked: false, source: null, req: 0, milestone: null, campNode: null, badge: "" };
}

function sanitizeLockedProfileCosmetics() {
  let changed = false;
  const cleared = Array.isArray(PROFILE.campaignCleared) ? PROFILE.campaignCleared : [];
  if (typeof CAMPAIGN_CHAPTER_1 !== "undefined") {
    const validCampaignRewards = CAMPAIGN_CHAPTER_1
      .filter(n => cleared.includes(n.lvl))
      .map(n => n.rewardId);
    const prevR = Array.isArray(PROFILE.campaignRewards) ? PROFILE.campaignRewards : [];
    const filtered = prevR.filter(id => validCampaignRewards.includes(id));
    validCampaignRewards.forEach(id => { if (!filtered.includes(id)) filtered.push(id); });
    if (filtered.length !== prevR.length || filtered.some((v, i) => v !== prevR[i])) {
      PROFILE.campaignRewards = filtered;
      changed = true;
    }
  }
  const curAv = AVATARS[PROFILE.crest || 0];
  if (curAv && getGloryLockInfo("avatar", curAv.id).locked) {
    const firstFree = AVATARS.findIndex(a => !getGloryLockInfo("avatar", a.id).locked);
    PROFILE.crest = firstFree >= 0 ? firstFree : 0;
    changed = true;
  }
  const curBn = PL_BANNERS[PROFILE.banner || 0];
  if (curBn && getGloryLockInfo("banner", curBn.id).locked) {
    const firstFree = PL_BANNERS.findIndex(b => !getGloryLockInfo("banner", b.id).locked);
    PROFILE.banner = firstFree >= 0 ? firstFree : 0;
    changed = true;
  }
  if (PROFILE.cardBack && getGloryLockInfo("cardBack", PROFILE.cardBack).locked) {
    PROFILE.cardBack = "classic";
    changed = true;
  }
  if (PROFILE.activeTitle) {
    const tObj = PROFILE_TITLES.find(t => t.name === PROFILE.activeTitle);
    if (tObj && getGloryLockInfo("title", tObj.id).locked) {
      PROFILE.activeTitle = "";
      changed = true;
    }
  }
  if (changed) saveProfile();
}
sanitizeLockedProfileCosmetics();

function applyTrophyResult(mode, opts = {}) {
  const before = Math.max(0, Number(PROFILE.trophies) || 0);
  let baseDelta = 0;
  let streakBonus = 0;
  let newbieShield = false;

  if (mode === "tournament") {
    if (opts.tourOutcome === "champion") baseDelta = 65;
    else if (opts.tourOutcome === "finalist") baseDelta = 25;
    else baseDelta = -10;
  } else {
    const cnt = opts.playersCount || 2;
    const place = opts.place || 2;
    if (cnt === 2) {
      baseDelta = place === 1 ? 20 : -12;
    } else if (cnt === 3) {
      baseDelta = place === 1 ? 30 : place === 2 ? 8 : -14;
    } else {
      baseDelta = place === 1 ? 40 : place === 2 ? 15 : place === 3 ? -5 : -15;
    }
  }

  // Бонус +5 кубків за серію від 2 перемог поспіль
  if (opts.wonMatch && (PROFILE.streak || 0) >= 2) {
    streakBonus = 5;
  }

  let totalDelta = baseDelta + streakBonus;

  // Захист новачка: поки trophies < 200, кубки при поразці не віднімаються
  if (totalDelta < 0 && before < 200) {
    totalDelta = 0;
    newbieShield = true;
  }

  const after = Math.max(0, before + totalDelta);
  const realDelta = after - before;
  PROFILE.trophies = after;
  saveProfile();

  return { before, after, delta: realDelta, baseDelta, streakBonus, newbieShield };
}

function buildTrophyDeltaHtml(res) {
  if (!res) return "";
  if (res.newbieShield) {
    return `
      <div class="mtd-badge shield">
        <span class="mtd-ico">${UI_IC.shield}</span>
        <span class="mtd-val">0 ${UI_IC.trophy}</span>
        <span class="mtd-note">Захист новачка (&lt; 200 ${UI_IC.trophy})</span>
      </div>`;
  }
  const pos = res.delta > 0;
  const zero = res.delta === 0;
  const cls = pos ? "pos" : zero ? "neu" : "neg";
  const sign = pos ? "+" : "";
  const extra = res.streakBonus > 0 ? `<span class="mtd-note">${UI_IC.fire} Серія +${res.streakBonus} ${UI_IC.trophy}</span>` : "";
  return `
    <div class="mtd-badge ${cls}">
      <span class="mtd-val">${sign}${res.delta} ${UI_IC.trophy}</span>
      ${extra}
    </div>`;
}

// ===== ПОВНІ НАЛАШТУВАННЯ ГРИ (localStorage) =====
const SETTINGS_KEY = "dcard_settings_v2";
const GFX_PRESETS = {
  low:   { label: "ЕКОНОМІЯ", particles: false, blur: false, glow: false, cardIdle: false, mapAnim: false, cine: false },
  med:   { label: "60 FPS",   particles: false, blur: false, glow: true,  cardIdle: true,  mapAnim: false, cine: true  },
  high:  { label: "ВИСОКА",   particles: true,  blur: true,  glow: true,  cardIdle: true,  mapAnim: true,  cine: true  },
  ultra: { label: "УЛЬТРА",   particles: true,  blur: true,  glow: true,  cardIdle: true,  mapAnim: true,  cine: true  }
};

function defaultSettings() {
  const isMob = window.matchMedia?.("(max-width: 767px)").matches;
  const preset = isMob ? "med" : "high";
  const p = GFX_PRESETS[preset];
  return {
    vm: 50,
    vs: 100,
    mute: false,
    preset,
    gfx: (preset === "low" || preset === "med") ? "perf" : "high",
    particles: p.particles,
    blur: p.blur,
    glow: p.glow,
    cardIdle: p.cardIdle,
    mapAnim: p.mapAnim,
    shake: true,
    cine: p.cine
  };
}

let SETTINGS = (() => {
  const def = defaultSettings();
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || localStorage.getItem("dcard_settings_v1") || "null");
    if (saved && typeof saved === "object") {
      const preset = ["low", "med", "high", "ultra", "custom"].includes(saved.preset)
        ? saved.preset
        : (saved.gfx === "perf" ? "med" : def.preset);
      const pDef = GFX_PRESETS[preset] || GFX_PRESETS.high;
      return {
        vm: typeof saved.vm === "number" ? Math.max(0, Math.min(100, saved.vm)) : def.vm,
        vs: typeof saved.vs === "number" ? Math.max(0, Math.min(100, saved.vs)) : def.vs,
        mute: !!saved.mute,
        preset,
        gfx: (preset === "low" || preset === "med") ? "perf" : "high",
        particles: typeof saved.particles === "boolean" ? saved.particles : pDef.particles,
        blur: typeof saved.blur === "boolean" ? saved.blur : pDef.blur,
        glow: typeof saved.glow === "boolean" ? saved.glow : pDef.glow,
        cardIdle: typeof saved.cardIdle === "boolean" ? saved.cardIdle : pDef.cardIdle,
        mapAnim: typeof saved.mapAnim === "boolean" ? saved.mapAnim : pDef.mapAnim,
        shake: saved.shake !== false,
        cine: typeof saved.cine === "boolean" ? saved.cine : pDef.cine
      };
    }
  } catch (e) {}
  return def;
})();

function saveSettings() {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(SETTINGS)); } catch (e) {}
}

function applySettings() {
  VOL.m = SETTINGS.vm / 100;
  VOL.s = SETTINGS.vs / 100;
  mute = !!SETTINGS.mute;
  if (typeof setVol === "function") setVol();

  SETTINGS.gfx = (SETTINGS.preset === "low" || SETTINGS.preset === "med" || (!SETTINGS.particles && !SETTINGS.blur)) ? "perf" : "high";
  const b = document.body.classList;
  b.toggle("gfx-perf", SETTINGS.gfx === "perf");
  b.toggle("gfx-no-particles", !SETTINGS.particles);
  b.toggle("gfx-no-blur", !SETTINGS.blur);
  b.toggle("gfx-no-glow", !SETTINGS.glow);
  b.toggle("gfx-no-card-idle", !SETTINGS.cardIdle);
  b.toggle("gfx-no-map-anim", !SETTINGS.mapAnim);
  b.toggle("gfx-no-cine", !SETTINGS.cine);
  b.toggle("no-shake", !SETTINGS.shake);

  const campOv = $("campaign-ov");
  if (campOv) {
    campOv.classList.toggle("cf-lite-mode", !SETTINGS.mapAnim || SETTINGS.preset === "low");
  }

  if ($("vm")) $("vm").value = SETTINGS.vm;
  if ($("vs")) $("vs").value = SETTINGS.vs;
  if ($("vmute")) $("vmute").innerHTML = mute ? `${UI_IC.sndOff} Звук вимкнено` : `${UI_IC.sndOn} Звук увімкнено`;
  if ($("btn-mute")) $("btn-mute").innerHTML = mute ? UI_IC.sndOff : UI_IC.sndOn;
}

function openSettings() {
  const ov = $("settings-ov");
  if (!ov) return;
  syncSettingsUI();
  ov.classList.add("open");
  ov.setAttribute("aria-hidden", "false");
  document.body.classList.add("settings-open");
  snd("swap");
}

function closeSettings() {
  const ov = $("settings-ov");
  if (!ov || !ov.classList.contains("open")) return;
  ov.classList.remove("open");
  ov.setAttribute("aria-hidden", "true");
  document.body.classList.remove("settings-open");
  snd("throw");
}

function syncSettingsUI() {
  const vm = $("set-vm"), vs = $("set-vs");
  if (vm) { vm.value = SETTINGS.vm; if ($("set-vm-val")) $("set-vm-val").textContent = SETTINGS.vm + "%"; }
  if (vs) { vs.value = SETTINGS.vs; if ($("set-vs-val")) $("set-vs-val").textContent = SETTINGS.vs + "%"; }
  const mBtn = $("set-mute-btn");
  if (mBtn) {
    mBtn.innerHTML = SETTINGS.mute ? `${UI_IC.sndOff} Вимкнено` : `${UI_IC.sndOn} Увімкнено`;
    mBtn.classList.toggle("act", !SETTINGS.mute);
  }
  const setChk = (id, val) => { const el = $(id); if (el) el.checked = !!val; };
  setChk("set-particles", SETTINGS.particles);
  setChk("set-blur", SETTINGS.blur);
  setChk("set-glow", SETTINGS.glow);
  setChk("set-card-idle", SETTINGS.cardIdle);
  setChk("set-map-anim", SETTINGS.mapAnim);
  setChk("set-shake-chk", SETTINGS.shake);
  setChk("set-cine", SETTINGS.cine);

  document.querySelectorAll("#set-preset-grid [data-preset]").forEach(btn => {
    btn.classList.toggle("act", btn.getAttribute("data-preset") === SETTINGS.preset);
  });
  const badge = $("set-preset-badge");
  if (badge) {
    badge.textContent = GFX_PRESETS[SETTINGS.preset]?.label || "ВЛАСНІ";
  }
}

(function initSettingsEvents() {
  const fab = $("global-settings-fab");
  if (fab) fab.onclick = (ev) => {
    ev.stopPropagation();
    const ov = $("settings-ov");
    if (ov && ov.classList.contains("open")) closeSettings();
    else openSettings();
  };

  const closeBtn = $("set-close");
  if (closeBtn) closeBtn.onclick = closeSettings;

  const ov = $("settings-ov");
  if (ov) ov.onclick = (ev) => {
    if (ev.target === ov) closeSettings();
  };

  // Перемикач вкладок налаштувань
  const tabsWrap = $("set-tabs");
  if (tabsWrap) {
    tabsWrap.onclick = (ev) => {
      const btn = ev.target && ev.target.closest ? ev.target.closest("[data-stab]") : null;
      if (!btn) return;
      const tab = btn.getAttribute("data-stab");
      tabsWrap.querySelectorAll("[data-stab]").forEach(b => b.classList.toggle("act", b === btn));
      document.querySelectorAll("#settings-ov [data-spane]").forEach(p => {
        p.classList.toggle("act", p.getAttribute("data-spane") === tab);
      });
      snd("throw");
    };
  }

  // Пресети графіки
  const presetGrid = $("set-preset-grid");
  if (presetGrid) {
    presetGrid.onclick = (ev) => {
      const btn = ev.target && ev.target.closest ? ev.target.closest("[data-preset]") : null;
      if (!btn) return;
      const key = btn.getAttribute("data-preset");
      const p = GFX_PRESETS[key];
      if (!p) return;
      SETTINGS.preset = key;
      SETTINGS.particles = p.particles;
      SETTINGS.blur = p.blur;
      SETTINGS.glow = p.glow;
      SETTINGS.cardIdle = p.cardIdle;
      SETTINGS.mapAnim = p.mapAnim;
      SETTINGS.cine = p.cine;
      saveSettings(); applySettings(); syncSettingsUI();
      snd("swap");
    };
  }

  // Індивідуальні тумблери графіки та камери
  const bindGfxChk = (id, prop, affectsPreset = true) => {
    const el = $(id);
    if (!el) return;
    el.onchange = () => {
      SETTINGS[prop] = !!el.checked;
      if (affectsPreset) SETTINGS.preset = "custom";
      saveSettings(); applySettings(); syncSettingsUI();
      snd("throw");
    };
  };
  bindGfxChk("set-particles", "particles", true);
  bindGfxChk("set-blur", "blur", true);
  bindGfxChk("set-glow", "glow", true);
  bindGfxChk("set-card-idle", "cardIdle", true);
  bindGfxChk("set-map-anim", "mapAnim", true);
  bindGfxChk("set-shake-chk", "shake", false);
  bindGfxChk("set-cine", "cine", false);

  const vm = $("set-vm");
  if (vm) vm.oninput = () => {
    SETTINGS.vm = parseInt(vm.value, 10) || 0;
    if ($("set-vm-val")) $("set-vm-val").textContent = SETTINGS.vm + "%";
    saveSettings(); applySettings();
  };
  const vs = $("set-vs");
  if (vs) vs.oninput = () => {
    SETTINGS.vs = parseInt(vs.value, 10) || 0;
    if ($("set-vs-val")) $("set-vs-val").textContent = SETTINGS.vs + "%";
    saveSettings(); applySettings();
  };
  const mBtn = $("set-mute-btn");
  if (mBtn) mBtn.onclick = () => {
    SETTINGS.mute = !SETTINGS.mute;
    saveSettings(); applySettings(); syncSettingsUI();
    if (!SETTINGS.mute) snd("throw");
  };

  const defBtn = $("set-reset-defaults");
  if (defBtn) defBtn.onclick = () => {
    SETTINGS = defaultSettings();
    saveSettings(); applySettings(); syncSettingsUI();
    snd("swap");
  };

  const resetBtn = $("set-reset-prof");
  if (resetBtn) resetBtn.onclick = () => {
    if (resetBtn.dataset.confirm !== "1") {
      resetBtn.dataset.confirm = "1";
      resetBtn.textContent = "Точно скинути?";
      setTimeout(() => {
        if (resetBtn) { resetBtn.dataset.confirm = ""; resetBtn.textContent = "Скинути"; }
      }, 3000);
      return;
    }
    resetBtn.dataset.confirm = "";
    resetBtn.textContent = "Скинути";
    PROFILE.wins = 0; PROFILE.games = 0; PROFILE.streak = 0; PROFILE.bestHit = 0; PROFILE.cardUsage = {};
    saveProfile();
    renderBentoHub("Статистику дуелянта скинуто");
    snd("shatter");
  };

  // Клавіша Escape закриває активні модалки
  window.addEventListener("keydown", (ev) => {
    if (ev.key !== "Escape") return;
    if ($("reward-reveal-ov")?.classList.contains("open")) { closeRewardRevealModal(); return; }
    if ($("glory-ov")?.classList.contains("open")) { closeGloryModal(); return; }
    if ($("profile-ov")?.classList.contains("open")) { closeProfileModal(); return; }
    if ($("settings-ov")?.classList.contains("open")) { closeSettings(); return; }
    if ($("codex-ov")?.classList.contains("open")) {
      $("codex-ov").classList.remove("open");
      $("codex-ov").setAttribute("aria-hidden", "true");
      snd("throw");
    }
  });
})();

let BENTO_PLAYERS = 2;

const TB_HTML = `
 <button class="mode-btn" data-players="4" data-tour="2"><b><svg class="ui-svg ui-lg" viewBox="0 0 24 24"><path d="M7 4h10v6a5 5 0 0 1-10 0V4z" fill="#facc15" stroke="#fef08a" stroke-width="1.2"/><path d="M7 6H4a2 2 0 0 0 0 4h3M17 6h3a2 2 0 0 1 0 4h-3" fill="none" stroke="#fbbf24" stroke-width="1.6"/><path d="M12 15v4M8 20h8" stroke="#fbbf24" stroke-width="2" stroke-linecap="round"/></svg></b><span>Турнір до 2</span></button>
 <button class="mode-btn codex-btn" data-codex="1"><b>${UI_IC.book}</b><span>Кодекс DCARD</span></button>`;

let availableSpecs = []; // Пул для унікальних спецкарт без повторів
let REFORGE_MODE = false;
let ECLIPSE_PHASE = "day";
let ECLIPSE_ROUND = 1;
let ASTRAL_RARITY = 0;
const ASTRAL_META = [
  { name: "Смарагдове сяйво (Зелені)", col: "#3e9b5f", dot: UI_IC.orbGreen },
  { name: "Сапфірове сяйво (Сині)", col: "#3b82c4", dot: UI_IC.orbBlue },
  { name: "Аметистове сяйво (Фіолетові)", col: "#9461c9", dot: UI_IC.orbPurple },
  { name: "Рубінове сяйво (Червоні)", col: "#c4453f", dot: UI_IC.orbRed },
  { name: "Сонячне золото (Легендарні)", col: "#e0b02c", dot: UI_IC.orbGold }
];

function setAstralRarity(rIdx, announce = false) {
  if (!CUR_ARENA || CUR_ARENA.id !== "astral") return;
  ASTRAL_RARITY = ((rIdx % 5) + 5) % 5;
  document.body.classList.remove("ast-r0", "ast-r1", "ast-r2", "ast-r3", "ast-r4");
  document.body.classList.add("ast-r" + ASTRAL_RARITY);
  const meta = ASTRAL_META[ASTRAL_RARITY];
  const pill = $("arena-pill");
  if (pill) {
    pill.className = "show astral";
    pill.style.setProperty("--ast-c", meta.col);
    pill.innerHTML = `<span>${UI_IC.astral}</span><span>Астральний вимір · ${meta.dot} ${R[ASTRAL_RARITY].n}</span><span style="opacity:.85">· +35%</span>`;
    pill.title = `Астральний вимір — Сузір'я Рідкостей: ${meta.name}. Усі карти цієї рідкості отримують +35% сили!`;
  }
  if (announce) {
    snd("swap");
    const st = $("stage");
    if (st && typeof shock === "function" && typeof sparkBurst === "function") {
      const sr = st.getBoundingClientRect();
      const cx = sr.left + sr.width / 2, cy = sr.top + sr.height / 2;
      shock(cx, cy, meta.col, Math.min(sr.width, sr.height) * 0.65);
      sparkBurst(cx, cy, [meta.col, "#ffffff", "#e879f9"], 22, 110);
    }
    pushLog(`Сузір'я змінило колір: ${meta.name} (+35% до сили).`);
  }
  upd();
}

function updateReforgeUI() {
 const bar = $("reforge-bar"), btn = $("btn-reforge"), cnt = $("reforge-cnt");
 if (!bar || !btn || !cnt) return;
 const isForge = !!(CUR_ARENA && CUR_ARENA.id === "forge");
 bar.style.display = isForge ? "flex" : "none";
 if (!isForge) { REFORGE_MODE = false; return; }
 const left = (P[0] && P[0].alive) ? (P[0].reforgeLeft || 0) : 0;
 cnt.textContent = left;
 btn.disabled = left <= 0 || !res;
 if (left <= 0 || !res) REFORGE_MODE = false;
 btn.classList.toggle("active", REFORGE_MODE);
 const h = $("hand");
 if (h) h.classList.toggle("reforge-pick", REFORGE_MODE);
}

if ($("btn-reforge")) {
 $("btn-reforge").onclick = () => {
  if (!CUR_ARENA || CUR_ARENA.id !== "forge" || !P[0] || (P[0].reforgeLeft || 0) <= 0 || !res) return;
  REFORGE_MODE = !REFORGE_MODE;
  updateReforgeUI();
  pushLog(REFORGE_MODE ? "Обери карту в руці, щоб перекувати її на +1 рідкість вище." : "Перековку скасовано.");
 };
}

function executeReforge(pIdx, cardIdx) {
 const p = P[pIdx];
 if (!p || (p.reforgeLeft || 0) <= 0) return false;
 const oldC = p.hand[cardIdx];
 if (!oldC || oldC.pz > 0 || isSp(oldC.t)) return false;

 p.reforgeLeft--;
 const isHeal = HEAL_CARDS.includes(oldC.t);
 let newC;
 if (oldC.r >= 4) {
  newC = Object.assign({}, oldC, { b: (oldC.b || 0) + 8 });
 } else if (oldC.r === 3) {
  const legPool = isHeal ? ["r", "n", "Ω"] : ["k", "b", "o", "v", "9", "ξ", "ω"];
  newC = { t: legPool[rnd(legPool.length)], r: 4 };
 } else {
  const nextR = oldC.r + 1;
  const cat = isHeal ? "heal" : "dmg";
  const candidates = CODEX_ENTRIES.filter(e => e.r === nextR && e.cat === cat && !p.hand.some(h => h.t === e.t && h.r === e.r));
  const pick = candidates.length ? candidates[rnd(candidates.length)] : { t: isHeal ? "h" : "d", r: nextR };
  newC = { t: pick.t, r: pick.r };
 }
 p.hand[cardIdx] = newC;
 if (pIdx === 0) REFORGE_MODE = false;
 updateReforgeUI();
 if (typeof reforgeAnvilFx === "function") reforgeAnvilFx(pIdx, cardIdx, newC);
 pushLog(`${p.name} перековує «${cardName(oldC)}» → «${cardName(newC)}» (${R[newC.r].n}).`);
 return true;
}

function setEclipsePhase(phase, roundInPhase = 1) {
 if (!CUR_ARENA || CUR_ARENA.id !== "eclipse") return;
 ECLIPSE_PHASE = phase;
 document.body.classList.remove("phase-day", "phase-night");
 document.body.classList.add("phase-" + phase);
 CUR_ARENA.healMult = phase === "day" ? 1.25 : 0.75;
 CUR_ARENA.dmgMult = phase === "night" ? 1.25 : 0.75;
 const pill = $("arena-pill");
 if (pill) {
  pill.className = "show eclipse " + phase;
  pill.innerHTML = phase === "day"
   ? `<span>${UI_IC.sun}</span><span>Храм Світил · День (${roundInPhase}/2)</span><span style="opacity:.85">· Хіл +25% / Шкода −25%</span>`
   : `<span>${UI_IC.moon}</span><span>Храм Світил · Ніч (${roundInPhase}/2)</span><span style="opacity:.85">· Шкода +25% / Хіл −25%</span>`;
  pill.title = `Арена «Храм Світил»: День (Хіл +25%, Шкода −25%) / Ніч (Шкода +25%, Хіл −25%)`;
 }
 upd();
}


function rr(minR = 0) {
 let x = Math.random() * 100, s = 0;
 for (let i = 0; i < 5; i++) {
 s += R[i].w;
 if (x < s) return Math.max(minR, i);
 }
 return minR;
}

const val = (c, h) => val0(c, h) + (c.b && "dfvzxukboaqyjlDACSPWGLIJMOQRUVXYZ790αβγδεζηθικλμνξωΘΨ".includes(c.t) ? c.b : 0);
function val0(c, ownerHp = 100) {
 const b = R[c.r];
 if (c.t === "d") return b.d;
 if (c.t === "h") return b.h;
 if (c.t === "p") return 15;
 if (c.t === "g") return 20;
 if (c.t === "f") return Math.round(b.d * 1.45);
 if (c.t === "v") return 25; // Сатаня: фіксовано −25 ворогу / +25 собі
 if (c.t === "z") return Math.round(b.d * 0.75);
 if (c.t === "x") return b.d;
 if (c.t === "s") return Math.round(b.d * 0.5);
 if (c.t === "u") return Math.max(0, 100 - ownerHp);
 if (c.t === "k") return 60;
 if (c.t === "b") return 55;
 if (c.t === "r") return 30;
 if (c.t === "i") return 30;
 if (c.t === "o") return 40;
 if (c.t === "a" || c.t === "t") return 30;
 if (c.t === "n") return 40;
 if (c.t === "q") return 22;
 if (c.t === "y") return 14;
 if (c.t === "j") return 18; // Ікло Фафніра: 18 базово / 25 у захисті
 if (c.t === "l") return 22; // Кайдани Фантома: 22 шкоди + блок хілу
 if (c.t === "H") return 18; // Хвиля прибою: +18 HP (+26 при <40 HP)
 if (c.t === "D") return 16; // Праща Давида: −16 HP (−22 якщо у ворога >80 HP)
 if (c.t === "A") return 10; // Смола Аїда: −10 HP + втрата пріоритету
 if (c.t === "C") return c.rolled || 20; // Лезо Хаоса: середнє значення для оцінки ботом до кидку (5–35)
 if (c.t === "S") return 13; // Камінь Сизифа: −13 HP
 if (c.t === "I") return 11;
 if (c.t === "J") return 12;
 if (c.t === "M") return 13;
 if (c.t === "O") return 14;
 if (c.t === "Q") return 15; // Дротик: −15 (−21 якщо ціль під дебафом)
 if (c.t === "R") return 16;
 if (c.t === "U") return 17;
 if (c.t === "V") return 18;
 if (c.t === "X") return 19;
 if (c.t === "Y") return 24; // Подвійний клинок: 2 удари по −12
 if (c.t === "Z") return 23; // Пробійник: −23, ігнорує блок Егіди
 if (c.t === "1") return 9;
 if (c.t === "2") return 11;
 if (c.t === "3") return 14;
 if (c.t === "4") return 16;
 if (c.t === "5") return 17;
 if (c.t === "6") return 13; // Аптечка: +13 (+20 якщо HP < 30)

 if (c.t === "P") return 10; // Жало Скорпіона: −10 HP + отрута −10 на 2 кола
 if (c.t === "F") return 16; // Фіал Асклепія: +16 HP (+21 без дебафів)
 if (c.t === "T") return 10; // Панцир Черепахи: +10 HP + щит −25% вхідної шкоди
 if (c.t === "W") return 21; // Батіг Фурії: −21 HP (−28 якщо отримував шкоду в попередній дуелі)
 if (c.t === "G") return 26; // Колісниця Геліоса: −26 HP + підпал −15
 if (c.t === "L") return 34; // Спис Ахілла: −34 HP (−42 якщо HP < 50)
 if (c.t === "E") return 14; // Прокляття Ереба: −14 HP + зворотне зцілення
 if (c.t === "B") return 28; // Чаша Геби: +28 HP + регенерація +10 на 2 кола
 if (c.t === "K") return 25; // Кров Титана: +25 HP + підсилення карти атаки на +8
 if (c.t === "7") return 20; // Вихор Харибди: −20 HP + половина різниці HP (до +14)
 if (c.t === "8") return 16; // Лоза Діоніса: +16 HP + реген +8×2 кола + −5 атаці ворога
 if (c.t === "9") return 35; // Дестрояр: −35 HP основній цілі (+ −10 HP іншим суперникам при 3–4 гравцях)
 if (c.t === "0") return 30; // Рука Мідаса: −30 HP супернику та +15 HP власнику
 if (c.t === "α") return 11; // Праща Мисливця
 if (c.t === "β") return 12; // Клевок Гарпії
 if (c.t === "γ") return 13; // Удар Праці
 if (c.t === "δ") return 14; // Дротик Пельтаста
 if (c.t === "ε") return 15; // Шрам Найманця
 if (c.t === "ζ") return 17; // Клинок Борея (−21 без статусів на цілі)
 if (c.t === "η") return 19; // Стріла Аполлона (ігнорує легке зниження шкоди)
 if (c.t === "θ") return 22; // Клеймо Мойр (−30 при ≤40 HP цілі)
 if (c.t === "ι") return 24; // Вихор Скілли (+ Дезорієнтація −50% хілу)
 if (c.t === "κ") return 32; // Гнів Ареса (−42 при ≤50 HP власника)
 if (c.t === "λ") return 34; // Молот Тіфону (+12 чистої шкоди при розбитті дебафа)
 if (c.t === "μ") return 28; // Удар Горгони (+ отрута −15×2, віддача −8 HP)
 if (c.t === "ν") return 36; // Кара Вогню (−44 якщо ворог лікувався)
 if (c.t === "ξ") return 45; // Длань Зевса (знімає бафи/щити, −60 при ≥2 статусах)
 if (c.t === "ω") return 40; // Кара Харона (страта при ≤35 HP або крадіжка карти)
 if (c.t === "π") return 8;  // Ячмінь
 if (c.t === "ρ") return 12; // Ромашка
 if (c.t === "σ") return 13; // Корінь Женьшеню
 if (c.t === "τ") return 16; // Ключ Джерела (+6 якщо перша карта здоров'я в бою)
 if (c.t === "υ") return 15; // Крила Зефіра (+7 якщо менше HP, ніж у ворога)
 if (c.t === "φ") return 19; // Дзеркало Нікти (+25% від останнього хілу ворога, макс +10)
 if (c.t === "χ") return 18; // Іскра Гестії (+6×2 реген, без лікування під час Горіння)
 if (c.t === "ψ") return 20; // Квітка Персефони (при ≤45 HP знімає 1 дебаф)
 if (c.t === "Γ") return 17; // Ехо Аркадії (+8 якщо вже атакував цього кола)
 if (c.t === "Δ") return 34; // Жертовний Кубок (−8 HP ворогу наприкінці кола)
 if (c.t === "Φ") return 28; // Кров Саламандри (імунітет до Горіння 2 кола, +10 якщо гориш)
 if (c.t === "Ω") return 35; // Дерево Життя (+12×3 реген + Коріння Життя 1 раз за бій)
 if (c.t === "Σ") return 16; // Дзеркало Нарциса (крадіжка 50% хілу + 16 шкоди / або +12 HP)
 if (c.t === "Θ") return 15; // Кайдани Кроноса (15 шкоди + Окови часу)
 if (c.t === "Λ") return 0;  // Нить Аріадни (−60% шкоди + перенесення дебафа)
 if (c.t === "Ψ") return 38; // Скипетр Аїда (−15 HP собі, −38 HP цілі, +15 при ≤35 HP)
 if (c.t === "Π") return 15; // Колесо Фортуни (нова рука + 15 до першої дії)
 return 0;
}

// Перемішування унікальних спецкарт без повторів
// БЮДЖЕТ СИЛИ: зелена 1 · синя 2 · фіолетова 3 · червона 4 · легендарна 5 балів (r + 1)
const BUDGET_MIN = 19, BUDGET_MAX = 21; // сума 9 карт (6 шкоди + 3 здоров'я); спецкарта в бюджет не входить
function buildNine() {
 const dmg = Array.from({ length: 6 }, () => ({ t: Math.random() < 0.78 ? "d" : "p", fixed: false }));
 const hl = Array.from({ length: 3 }, () => ({ t: Math.random() < 0.75 ? "h" : "g", fixed: false }));
 const fix = (arr, t, r) => { const c = arr.filter(x => !x.fixed); if (!c.length) return; const s = c[rnd(c.length)]; s.t = t; s.r = r; s.fixed = true; };
 // ЛЕГЕНДАРКА ПОЗА БЮДЖЕТОМ: з ймовірністю 35% одна зі слотів стає легендарною і не рахується в бюджет
 if (Math.random() < 0.15) {
 const slots = [...dmg, ...hl];
 const s = slots[rnd(slots.length)];
 const pool = dmg.includes(s) ? ["k", "b", "o", "v", "9", "ξ", "ω"] : ["r", "n", "Ω"];
 s.t = pool[rnd(pool.length)]; s.r = 4; s.fixed = true; s.leg = true;
 }
 const dmgCands = [
  ["I", 0, 0.14], ["J", 0, 0.14], ["M", 0, 0.14], ["O", 0, 0.14], ["S", 0, 0.22],
  ["α", 0, 0.18], ["β", 0, 0.18], ["γ", 0, 0.18], ["δ", 0, 0.18], ["ε", 0, 0.18],
  ["Q", 1, 0.14], ["R", 1, 0.14], ["U", 1, 0.14], ["V", 1, 0.14], ["X", 1, 0.14],
  ["y", 1, 0.22], ["D", 1, 0.22], ["P", 1, 0.24], ["ζ", 1, 0.24], ["η", 1, 0.24],
  ["Y", 2, 0.14], ["Z", 2, 0.14], ["7", 2, 0.18], ["j", 2, 0.22], ["l", 2, 0.20],
  ["A", 2, 0.20], ["C", 2, 0.20], ["W", 2, 0.22], ["θ", 2, 0.24], ["ι", 2, 0.24],
  ["a", 3, 0.18], ["q", 3, 0.18], ["G", 3, 0.18], ["L", 3, 0.18], ["E", 3, 0.18], ["0", 3, 0.18],
  ["κ", 3, 0.20], ["λ", 3, 0.20], ["μ", 3, 0.20], ["ν", 3, 0.20]
 ];
 for (let i = dmgCands.length - 1; i > 0; i--) { const j = rnd(i + 1); const tmp = dmgCands[i]; dmgCands[i] = dmgCands[j]; dmgCands[j] = tmp; }
 dmgCands.forEach(([t, r, prob]) => { if (Math.random() < prob) fix(dmg, t, r); });
 const healCands = [
  ["1", 0, 0.11], ["2", 0, 0.11], ["π", 0, 0.13], ["ρ", 0, 0.13], ["σ", 0, 0.13],
  ["3", 1, 0.10], ["4", 1, 0.10], ["5", 1, 0.10], ["6", 1, 0.11],
  ["H", 1, 0.14], ["F", 1, 0.15], ["T", 1, 0.15], ["τ", 1, 0.16], ["υ", 1, 0.16],
  ["8", 2, 0.13], ["φ", 2, 0.15], ["χ", 2, 0.15], ["ψ", 2, 0.15], ["Γ", 2, 0.15],
  ["t", 3, 0.13], ["B", 3, 0.13], ["K", 3, 0.13], ["Δ", 3, 0.15], ["Φ", 3, 0.15]
 ];
 for (let i = healCands.length - 1; i > 0; i--) { const j = rnd(i + 1); const tmp = healCands[i]; healCands[i] = healCands[j]; healCands[j] = tmp; }
 healCands.forEach(([t, r, prob]) => { if (Math.random() < prob) fix(hl, t, r); });
 const all = [...dmg, ...hl], free = all.filter(x => !x.fixed);
 const fixedPts = all.filter(x => x.fixed && !x.leg).reduce((a, x) => a + x.r + 1, 0);
 const target = BUDGET_MIN + rnd(BUDGET_MAX - BUDGET_MIN + 1), need = target - fixedPts;
 if (need < free.length || need > 5 * free.length) return null;
 const pts = free.map(() => 1);
 for (let extra = need - free.length; extra > 0; extra--) {
 const cand = pts.map((p, i) => i).filter(i => pts[i] < 5);
 const wts = cand.map(i => 6 - pts[i]);
 let x = Math.random() * wts.reduce((a, b) => a + b, 0), pick = cand[cand.length - 1];
 for (let k = 0; k < cand.length; k++) { x -= wts[k]; if (x < 0) { pick = cand[k]; break; } }
 pts[pick]++;
 }
 free.forEach((x, i) => { x.r = pts[i] - 1; });
 const keys = new Set(all.map(x => x.t + x.r));
 if (keys.size !== all.length) return null;
 if (!all.some(x => x.r <= 1)) return null;
 if (all.filter(x => x.r === 4).length > 3) return null;
 return all.map(x => ({ t: x.t, r: x.r }));
}
function dealPool(playerIdx, arenaOverride = null) {
 const ar = arenaOverride || CUR_ARENA;
 let h = null;
 for (let k = 0; k < 400 && !h; k++) h = buildNine();
 if (!h) h = [["d", 0], ["d", 1], ["d", 2], ["p", 0], ["p", 2], ["p", 3], ["h", 0], ["h", 1], ["g", 2]].map(([t, r]) => ({ t, r })); // запасна рука (сума 20)

 // Арена «Пантеон Титанів»: +1 позабюджетна Легендарна атака та +1 позабюджетний Легендарний хіл (12 карт)
 if (ar && ar.id === "pantheon") {
  const legAtkPool = ["d", "p", "k", "b", "o", "v", "9", "ξ", "ω"];
  const legHealPool = ["h", "g", "r", "n", "Ω"];
  const availAtk = legAtkPool.filter(t => !h.some(x => x.t === t && x.r === 4));
  const availHeal = legHealPool.filter(t => !h.some(x => x.t === t && x.r === 4));
  const pickAtk = (availAtk.length ? availAtk : legAtkPool)[rnd((availAtk.length ? availAtk : legAtkPool).length)];
  const pickHeal = (availHeal.length ? availHeal : legHealPool)[rnd((availHeal.length ? availHeal : legHealPool).length)];
  h.push({ t: pickAtk, r: 4, leg: true });
  h.push({ t: pickHeal, r: 4, leg: true });
 }

 // Видаємо строго унікальну спецкарту кожному гравцеві
 if (!availableSpecs || !availableSpecs.length) {
 availableSpecs = [...SPEC_POOL].sort(() => Math.random() - 0.5);
 }
 const specType = availableSpecs.pop() || SPEC_POOL[rnd(SPEC_POOL.length)];
 const specR = (specType === "e" || specType === "c" || specType === "N" || specType === "Ψ" || specType === "Π") ? 4 : (specType === "Σ" || specType === "Θ" || specType === "Λ") ? 3 : rr(2);
 h.push({ t: specType, r: specR });

 const ord = { d: 0, p: 0, I: 0, J: 0, M: 0, O: 0, Q: 0, R: 0, U: 0, V: 0, X: 0, Y: 0, Z: 0, 7: 0, 9: 0, 0: 0, α: 0, β: 0, γ: 0, δ: 0, ε: 0, ζ: 0, η: 0, θ: 0, ι: 0, κ: 0, λ: 0, μ: 0, ν: 0, ξ: 0, ω: 0, k: 0, b: 0, o: 0, a: 0, v: 0, q: 0, y: 0, j: 0, l: 0, D: 0, A: 0, C: 0, S: 0, P: 0, W: 0, G: 0, L: 0, E: 0, h: 1, g: 1, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 8: 1, r: 1, t: 1, n: 1, H: 1, F: 1, T: 1, B: 1, K: 1, π: 1, ρ: 1, σ: 1, τ: 1, υ: 1, φ: 1, χ: 1, ψ: 1, Γ: 1, Δ: 1, Φ: 1, Ω: 1 };
 return h.sort((a, b) => (ord[a.t] !== undefined ? ord[a.t] : 2) - (ord[b.t] !== undefined ? ord[b.t] : 2) || a.r - b.r);
}

function cardLabel(c, ownerHp = 100) {
 const v = val(c, ownerHp);
 if (isColosseumHex(c, ownerHp)) {
 return "−" + dmgAmt(colosseumHexDmg(c, ownerHp), c) + UI_IC.blood;
 }
 const db = durBonus();
 if (c.t === "o") return "−" + dmgAmt(v, c);
 if (c.t === "a") return "−" + dmgAmt(v, c) + "+" + UI_IC.fire + "15";
 if (c.t === "t") return "+" + healAmt(30, c) + UI_IC.rose;
 if (c.t === "e") return UI_IC.spade + UI_IC.heart + UI_IC.diamond + UI_IC.club;
 if (c.t === "n") return "+" + healAmt(40, c) + UI_IC.sun;
 if (c.t === "q") return "−" + dmgAmt(v, c) + UI_IC.stone;
 if (c.t === "y") return "−" + dmgAmt(v, c) + UI_IC.snow + UI_IC.swords;
 if (c.t === "j") return "−" + dmgAmt(v, c) + "/−" + dmgAmt(v + 7, c) + UI_IC.shield;
 if (c.t === "l") return "−" + dmgAmt(v, c) + UI_IC.chain;
 if (c.t === "c") return "×1.25";
 if (c.t === "H") return "+" + healAmt(v, c) + "/+" + healAmt(26, c) + UI_IC.wave;
 if (c.t === "D") return "−" + dmgAmt(v, c) + "/−" + dmgAmt(v + 6, c) + UI_IC.stone;
 if (c.t === "A") return "−" + dmgAmt(v, c) + UI_IC.hourglass;
 if (c.t === "C") return c.rolled ? ("−" + dmgAmt(c.rolled, c)) : "?–?";
 if (c.t === "S") return "−" + dmgAmt(v, c);
 if ("IJMORUVX".includes(c.t)) return "−" + dmgAmt(v, c);
 if (c.t === "Q") return "−" + dmgAmt(v, c) + "/−" + dmgAmt(v + 6, c);
 if (c.t === "Y") return "−" + dmgAmt(v / 2, c) + "×2";
 if (c.t === "Z") return "−" + dmgAmt(v, c) + UI_IC.swords;
 if ("12345".includes(c.t)) return "+" + healAmt(v, c);
 if (c.t === "6") return "+" + healAmt(v, c) + "/+" + healAmt(v + 7, c) + UI_IC.plus;
 if (c.t === "P") return "−" + dmgAmt(v, c) + "+" + UI_IC.skull + "10×" + (2 + db);
 if (c.t === "F") return "+" + healAmt(v, c) + "/+" + healAmt(21, c);
 if (c.t === "T") return "+" + healAmt(v, c) + UI_IC.shield + "25%";
 if (c.t === "W") return "−" + dmgAmt(v, c) + "/−" + dmgAmt(v + 7, c);
 if (c.t === "G") return "−" + dmgAmt(v, c) + "+" + UI_IC.fire + "15";
 if (c.t === "L") return "−" + dmgAmt(v, c) + "/−" + dmgAmt(v + 8, c);
 if (c.t === "E") return "−" + dmgAmt(v, c) + UI_IC.brokenHeart;
 if (c.t === "B") return "+" + healAmt(v, c) + "+" + UI_IC.sparkle + healAmt(10, c) + "×" + (2 + db);
 if (c.t === "K") return "+" + healAmt(v, c) + "+8" + UI_IC.swords;
 if (c.t === "7") return "−" + dmgAmt(v, c) + "..−" + dmgAmt(v + 14, c);
 if (c.t === "8") return `+${healAmt(v, c)}+${healAmt(8, c)}×${2 + db} <span class="v-dmg">−5</span>`;
 if (c.t === "9") return "−" + dmgAmt(v, c) + "/−" + dmgAmt(10, c);
 if (c.t === "0") return `<span class="v-dmg">−${dmgAmt(v, c)}</span><span class="v-heal">+${healAmt(15, c)}</span>`;
 if ("αβγδε".includes(c.t)) return "−" + dmgAmt(v, c);
 if (c.t === "ζ") return "−" + dmgAmt(v, c) + "/−" + dmgAmt(v + 4, c) + UI_IC.snow;
 if (c.t === "η") return "−" + dmgAmt(v, c) + UI_IC.sun;
 if (c.t === "θ") return "−" + dmgAmt(v, c) + "/−" + dmgAmt(v + 8, c) + UI_IC.sparkle;
 if (c.t === "ι") return "−" + dmgAmt(v, c) + UI_IC.vortex;
 if (c.t === "κ") return "−" + dmgAmt(v, c) + "/−" + dmgAmt(v + 10, c) + UI_IC.blood;
 if (c.t === "λ") return "−" + dmgAmt(v, c) + "/+12" + UI_IC.fire;
 if (c.t === "μ") return "−" + dmgAmt(v, c) + "+" + UI_IC.skull + "15×" + (2 + db);
 if (c.t === "ν") return "−" + dmgAmt(v, c) + "/−" + dmgAmt(v + 8, c) + UI_IC.fire;
 if (c.t === "ξ") return "−" + dmgAmt(v, c) + "/−" + dmgAmt(v + 15, c) + UI_IC.bolt;
 if (c.t === "ω") return "−" + dmgAmt(v, c) + UI_IC.skull;
 if ("πρσ".includes(c.t)) return "+" + healAmt(v, c);
 if (c.t === "τ") return "+" + healAmt(v, c) + "/+" + healAmt(v + 6, c) + UI_IC.wave;
 if (c.t === "υ") return "+" + healAmt(v, c) + "/+" + healAmt(v + 7, c) + UI_IC.wind;
 if (c.t === "φ") return "+" + healAmt(v, c) + "+25%" + UI_IC.mirror;
 if (c.t === "χ") return "+" + healAmt(v, c) + "+" + healAmt(6, c) + "×" + (2 + db);
 if (c.t === "ψ") return "+" + healAmt(v, c) + UI_IC.sparkle;
 if (c.t === "Γ") return "+" + healAmt(v, c) + "/+" + healAmt(v + 8, c) + UI_IC.lyre;
 if (c.t === "Δ") return `<span class="v-heal">+${healAmt(v, c)}</span><span class="v-dmg">−8</span>`;
 if (c.t === "Φ") return "+" + healAmt(v, c) + "/+" + healAmt(v + 10, c) + UI_IC.fireShield;
 if (c.t === "Ω") return "+" + healAmt(v, c) + "+" + healAmt(12, c) + "×" + (3 + db);
 if (c.t === "N") return UI_IC.scale + " HP";
 if (c.t === "Σ") return `<span class="v-dmg">−${dmgAmt(16, c)}</span><span class="v-heal">+${healAmt(12, c)}</span>`;
 if (c.t === "Θ") return "−" + dmgAmt(v, c) + UI_IC.chrono;
 if (c.t === "Λ") return "−60%" + UI_IC.thread;
 if (c.t === "Ψ") return "−" + dmgAmt(v, c) + UI_IC.scepter;
 if (c.t === "Π") return "+15" + UI_IC.wheel;
 if (c.t === "d" || c.t === "f") return "−" + dmgAmt(v, c);
 if (c.t === "h") return "+" + healAmt(v, c);
 if (c.t === "p") return "−15×" + (DUR[c.r] + db);
 if (c.t === "g") return "+" + healAmt(20, c) + "×" + (DUR[c.r] + db);
 if (c.t === "v") return `<span class="v-dmg">−${dmgAmt(v, c)}</span><span class="v-heal">+${healAmt(v, c)}</span>`;
 if (c.t === "s") return "БЛОК " + dmgAmt(v, c);
 if (c.t === "m") return "100%";
 if (c.t === "z") return "ШОК " + dmgAmt(v, c);
 if (c.t === "x") return dmgAmt(v, c) + "×2";
 if (c.t === "u") return "−" + dmgAmt(v, c);
 if (c.t === "w") return "ОБМІН";
 if (c.t === "k" || c.t === "b") return "−" + dmgAmt(v, c);
 if (c.t === "r") return "+" + healAmt(30, c) + "+" + healAmt(10, c);
 if (c.t === "i") return "ХОЛОД";
 return v;
}

let _octFrameUid = 0;

const FX_MINI_SVG = {
 drop: `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M12 3C8.5 8.2 6 11.4 6 15a6 6 0 0 0 12 0c0-3.6-2.5-6.8-6-12z" fill="#34d399" stroke="#a7f3d0" stroke-width="1.3"/><path d="M9.5 14.5c0 1.6 1 2.8 2.4 3.2" fill="none" stroke="#ecfdf5" stroke-width="1.4" stroke-linecap="round"/></svg>`,
 leaf: `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M19 5C10 5 5 10 5 19c9 0 14-5 14-14z" fill="#34d399" stroke="#a7f3d0" stroke-width="1.3"/><path d="M6 18L16 8" stroke="#064e3b" stroke-width="1.6" stroke-linecap="round"/></svg>`
};

const SPEC_BADGE_HTML = `<span class="spec-badge" title="Унікальна спецкарта"><svg viewBox="0 0 20 20" aria-hidden="true"><polygon points="10,1.2 18.8,10 10,18.8 1.2,10" fill="rgba(28,16,2,0.55)" stroke="currentColor" stroke-width="1.5"/><path d="M10 4.2l1.35 3.85 3.85 1.35-3.85 1.35L10 14.6l-1.35-3.85-3.85-1.35 3.85-1.35z" fill="currentColor"/></svg><span>СПЕЦ</span></span>`;

function specOctFrameSvg() {
 const uid = ++_octFrameUid;
 return `<svg class="spec-oct-frame" viewBox="0 0 100 144" preserveAspectRatio="none" aria-hidden="true">
  <defs>
   <linearGradient id="octRim${uid}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#fef08a"/>
    <stop offset="35%" stop-color="#f59e0b"/>
    <stop offset="70%" stop-color="#a855f7"/>
    <stop offset="100%" stop-color="#fbbf24"/>
   </linearGradient>
   <linearGradient id="octMetal${uid}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#4c3368" stop-opacity="0.85"/>
    <stop offset="50%" stop-color="#1e152c" stop-opacity="0.9"/>
    <stop offset="100%" stop-color="#6b4512" stop-opacity="0.85"/>
   </linearGradient>
  </defs>
  <polygon points="14,1.2 86,1.2 98.8,14 98.8,130 86,142.8 14,142.8 1.2,130 1.2,14" fill="none" stroke="url(#octRim${uid})" stroke-width="2.6" stroke-linejoin="miter"/>
  <polygon points="16.5,4.5 83.5,4.5 95.5,16.5 95.5,127.5 83.5,139.5 16.5,139.5 4.5,127.5 4.5,16.5" fill="none" stroke="url(#octMetal${uid})" stroke-width="2.2"/>
  <polygon points="18,6.5 82,6.5 93.5,18 93.5,126 82,137.5 18,137.5 6.5,126 6.5,18" fill="none" stroke="rgba(253,224,71,0.42)" stroke-width="0.9"/>
  <circle cx="15.5" cy="5" r="1.4" fill="#fde68a"/>
  <circle cx="84.5" cy="5" r="1.4" fill="#fde68a"/>
  <circle cx="84.5" cy="139" r="1.4" fill="#fde68a"/>
  <circle cx="15.5" cy="139" r="1.4" fill="#fde68a"/>
 </svg>`;
}

function cardEffectMeta(c, hexed = false) {
 if (hexed) return { kind: "dmg", ic: UI_IC.blood, tip: "Кров Колізею" };
 const t = c.t;
 if (isSp(t)) {
  const spMap = {
   s: { ic: UI_IC.shield, tip: "Блок і контрудар" },
   f: { ic: UI_IC.fire, tip: "Вогняний удар" },
   m: { ic: UI_IC.mirror, tip: "Відбиття 100%" },
   z: { ic: UI_IC.bolt, tip: "Шок / оглушення" },
   x: { ic: UI_IC.skull, tip: "Страта ×2" },
   u: { ic: UI_IC.blood, tip: "Лють" },
   w: { ic: UI_IC.sparkle, tip: "Обмін руками" },
   i: { ic: UI_IC.snow, tip: "Заморозка" },
   e: { ic: UI_IC.spade, tip: "Рулетка мастей" },
   c: { ic: UI_IC.mirror, tip: "Копія ×1.25" },
   N: { ic: UI_IC.scale, tip: "Рівновага HP" },
   Σ: { ic: UI_IC.mirror, tip: "Пастка на хіл / +12 HP" },
   Θ: { ic: UI_IC.chrono, tip: "Окови часу (−20%)" },
   Λ: { ic: UI_IC.thread, tip: "−60% шкоди + перенос дебафа" },
   Ψ: { ic: UI_IC.scepter, tip: "Жертва 15 HP → −38" },
   Π: { ic: UI_IC.wheel, tip: "Нова рука +15" }
  };
  const m = spMap[t] || { ic: UI_IC.sparkle, tip: "Спецефект" };
  return { kind: "spec", ic: m.ic, tip: m.tip };
 }
 const isDmg = "dpkboavqyjlDACSPWGLEIJMOQRUVXYZ790αβγδεζηθικλμνξω".includes(t);
 if (isDmg) {
  if ("aG".includes(t)) return { kind: "dmg", ic: UI_IC.fire, tip: "Горіння" };
  if ("pPQ".includes(t)) return { kind: "dmg", ic: UI_IC.skull, tip: t === "Q" ? "Крит по дебафу" : "Отрута" };
  if ("qSD".includes(t)) return { kind: "dmg", ic: UI_IC.stone, tip: t === "q" ? "Скам'яніння" : "Удар каменем" };
  if (t === "y") return { kind: "dmg", ic: UI_IC.snow, tip: "Ослаблення −5" };
  if (t === "l") return { kind: "dmg", ic: UI_IC.chain, tip: "Блок зцілення" };
  if (t === "A") return { kind: "dmg", ic: UI_IC.hourglass, tip: "Уповільнення" };
  if (t === "E") return { kind: "dmg", ic: UI_IC.brokenHeart, tip: "Зворотний хіл" };
  if ("v0W".includes(t)) return { kind: "dmg", ic: UI_IC.blood, tip: t === "W" ? "Кровотеча / помста" : "Вампіризм" };
  if (t === "j") return { kind: "dmg", ic: UI_IC.shield, tip: "Засідка в захисті" };
  if ("ob".includes(t)) return { kind: "dmg", ic: UI_IC.bolt, tip: t === "o" ? "Розсіювання" : "Ударна хвиля" };
  if (t === "7") return { kind: "dmg", ic: UI_IC.wave, tip: "Пожирання HP" };
  if (t === "C") return { kind: "dmg", ic: UI_IC.sparkle, tip: "Хаос 5–35" };
  if (t === "ζ") return { kind: "dmg", ic: UI_IC.snow, tip: "+4 без статусів" };
  if (t === "η") return { kind: "dmg", ic: UI_IC.sun, tip: "Ігнорує ослаблення" };
  if (t === "θ") return { kind: "dmg", ic: UI_IC.sparkle, tip: "−30 при ≤40 HP" };
  if (t === "ι") return { kind: "dmg", ic: UI_IC.vortex, tip: "Дезорієнтація −50% хілу" };
  if (t === "κ") return { kind: "dmg", ic: UI_IC.blood, tip: "+10 при ≤50 HP" };
  if (t === "λ") return { kind: "dmg", ic: UI_IC.fire, tip: "Розбиття +12 чистої" };
  if (t === "μ") return { kind: "dmg", ic: UI_IC.skull, tip: "Отрута −15×2 / віддача −8" };
  if (t === "ν") return { kind: "dmg", ic: UI_IC.fire, tip: "+8 за хіл ворога" };
  if (t === "ξ") return { kind: "dmg", ic: UI_IC.bolt, tip: "Зняття бафів +15" };
  if (t === "ω") return { kind: "dmg", ic: UI_IC.skull, tip: "Страта ≤35 / крадіжка" };
  return { kind: "dmg", ic: UI_IC.swords, tip: "Прямий удар" };
 }
 // Карти хілу / лікування (завжди смарагдова рамка)
 if ("gB8".includes(t)) return { kind: "heal", ic: FX_MINI_SVG.leaf, tip: "Регенерація" };
 if (t === "r") return { kind: "heal", ic: UI_IC.heart, tip: "Вічний реген" };
 if (t === "T") return { kind: "heal", ic: UI_IC.shield, tip: "Панцир −25%" };
 if (t === "t") return { kind: "heal", ic: UI_IC.rose, tip: "Шипи 35%" };
 if (t === "n") return { kind: "heal", ic: UI_IC.sun, tip: "Очищення + хіл" };
 if (t === "H") return { kind: "heal", ic: UI_IC.wave, tip: "Приплив" };
 if (t === "K") return { kind: "heal", ic: UI_IC.swords, tip: "Хіл + баф +8" };
 if ("πρσ".includes(t)) return { kind: "heal", ic: UI_IC.plus, tip: "Прямий хіл" };
 if (t === "τ") return { kind: "heal", ic: UI_IC.wave, tip: "+6 якщо перший хіл" };
 if (t === "υ") return { kind: "heal", ic: UI_IC.wind, tip: "+7 якщо HP нижче ворога" };
 if (t === "φ") return { kind: "heal", ic: UI_IC.mirror, tip: "+25% від останнього хілу ворога" };
 if (t === "χ") return { kind: "heal", ic: FX_MINI_SVG.leaf, tip: "Реген +6×2 (без Горіння)" };
 if (t === "ψ") return { kind: "heal", ic: UI_IC.sparkle, tip: "Зняття 1 дебафа при ≤45 HP" };
 if (t === "Γ") return { kind: "heal", ic: UI_IC.lyre, tip: "+8 після атаки цього кола" };
 if (t === "Δ") return { kind: "heal", ic: UI_IC.chalice, tip: "−8 HP ворогу в кінці кола" };
 if (t === "Φ") return { kind: "heal", ic: UI_IC.fireShield, tip: "Імунітет до Горіння / +10" };
 if (t === "Ω") return { kind: "heal", ic: UI_IC.tree, tip: "Реген +12×3 + Коріння Життя" };
 if ("h123456F".includes(t)) return { kind: "heal", ic: t === "F" ? FX_MINI_SVG.drop : UI_IC.plus, tip: "Миттєвий хіл" };
 return { kind: "heal", ic: FX_MINI_SVG.drop, tip: "Лікування" };
}

function buildCardInnerHtml(c, hp, hexed, sp) {
 const bdg = c.t === "p" ? `<i class="bdg">${SVG_IC.p}</i>` : c.t === "g" ? `<i class="bdg">${SVG_IC.g}</i>` : "";
 const fx = cardEffectMeta(c, hexed);
 const fxPill = `<span class="fx-pill fx-${fx.kind}" title="${fx.tip}">${fx.ic}</span>`;
 const specChrome = sp ? `${specOctFrameSvg()}${SPEC_BADGE_HTML}` : "";
 const rTag = sp ? "" : `<span class="r-tag" style="--rc:${R[c.r].c}">${R[c.r].n}</span>`;
 return `${specChrome}${rTag}<span class="ic">${iconFor(c)}${bdg}</span><div class="v-wrap"><span class="v">${cardLabel(c, hp)}</span>${fxPill}</div><small>${cardName(c)}</small>`;
}

function cardEl(c, ownerIdx = 0) {
 const e = document.createElement("div");
 const sp = isSp(c.t);
 const hp = P[ownerIdx] ? P[ownerIdx].hp : 100;
 const hexed = isColosseumHex(c, hp);
 const isAstRes = !!(CUR_ARENA && CUR_ARENA.id === "astral" && c.r === ASTRAL_RARITY);
 e.className = "card r" + c.r + " t" + (hexed ? "d" : "kboavqyjlDACSPWGLEIJMOQRUVXYZ790αβγδεζηθικλμνξω".includes(c.t) ? "d" : "rtnHFBKT1234568πρστυφχψΓΔΦΩ".includes(c.t) ? "h" : BASE[c.t] || c.t) + ("kbrovncN9ξωΩΨΠ".includes(c.t) ? " leg leg-" + c.t : "") + (c.t === "0" ? " midas-card" : "") + (hexed ? " crimson-hex" : "") + (isAstRes ? " astral-res" : "") + (sp ? " spec" : "") + (c.t === "i" ? " ice" : "") + (c.b ? " gold" : "");
 e.style.setProperty("--c", sp ? "#f59e0b" : R[c.r].c);
 e.innerHTML = buildCardInnerHtml(c, hp, hexed, sp);
 if (c.pz > 0) {
 e.classList.add("stone");
 e.insertAdjacentHTML("beforeend", `<div class="stoneov"><span class="stlock">${UI_IC.stone}</span><span class="sttmr">${UI_IC.hourglass}${c.pz}</span></div>`);
 }
 return e;
}

function hidEl(c, styleOverride = null) {
 const e = document.createElement("div");
 const k = (CUR_ARENA && CUR_ARENA.blindCards)
 ? "q"
 : ("dpkboavqyjlDACSPWGLEIJMOQRUVXYZ790αβγδεζηθικλμνξω".includes(c.t) ? "d" : "hgrtnHFBKT1234568πρστυφχψΓΔΦΩ".includes(c.t) ? "h" : "s");
 const backId = styleOverride || (PROFILE && PROFILE.cardBack) || "classic";
 e.className = `card back cback-${backId}`;
 e.innerHTML = backSvg(k, backId);
 return e;
}

const alive = () => P.map((p, i) => p.alive ? i : -1).filter(i => i >= 0);

function tgt(i) {
 let j = i;
 do { j = (j + 1) % n; } while (!P[j].alive);
 return j;
}

function initFanCardParallax() {
  document.querySelectorAll("#ov .fan-artifact-card").forEach(card => {
    if (card.dataset.tiltReady) return;
    card.dataset.tiltReady = "1";
    card.addEventListener("pointermove", ev => {
      const r = card.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const nx = Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width));
      const ny = Math.max(0, Math.min(1, (ev.clientY - r.top) / r.height));
      card.style.setProperty("--mx", `${(nx * 100).toFixed(1)}%`);
      card.style.setProperty("--my", `${(ny * 100).toFixed(1)}%`);
    });
  });
}

function buildPlayerPlaqueHtml({ id = "", nick = "ТИ", crestIdx = 0, bannerIdx = 0, hpText = `100 ${UI_IC.heart} · 10 ${UI_IC.card}`, relicsHtml = "", iciclesHtml = "", isMenuPreview = false }) {
  const bId = (PL_BANNERS[bannerIdx] && PL_BANNERS[bannerIdx].id) || "obsidian";
  const avSvg = AV_SVG[crestIdx] || AV_SVG[0];
  const uid = id || "prev";
  // 10 сегментів по 10 HP на дузі 270° (r=36, довжина дуги 169.65px: 10 сегментів × (13.465px заповнення + 3.5px проміжок))
  const arcLen = 169.65;
  const segMaskId = `hp-seg-mask-${uid}`;
  return `
    <div class="pl pl-medallion banner-${bId}${isMenuPreview ? " pl-preview-card" : ""}" ${id ? `id="${id}"` : ""} data-banner-id="${bId}">
      <!-- Античний геральдичний Щит-Штандарт (полотно скіна позаду медальйона, HP і нікнейму) -->
      <div class="pl-banner-shield" aria-hidden="true">
        <svg class="shield-frame-svg" viewBox="0 0 92 98" preserveAspectRatio="none">
          <path class="shield-bg-path" d="M 10,1 H 82 A 9,9 0 0 1 91,10 V 73 L 46,96 L 1,73 V 10 A 9,9 0 0 1 10,1 Z"/>
          <path class="shield-inner-path" d="M 12,5 H 80 A 7,7 0 0 1 87,12 V 70.5 L 46,91.5 L 5,70.5 V 12 A 7,7 0 0 1 12,5 Z"/>
        </svg>
      </div>
      <div class="ice-sh"></div>
      <div class="thorn-vine-sh"></div>
      <div class="role-tag" ${id ? `id="rt${id.replace("p", "")}"` : ""} style="display:none"></div>

      <!-- Круглий медальйон: декоративна оправа + 10-сегментна дуга HP + круглий аватар -->
      <div class="pl-disc">
        <svg class="pl-hp-svg" viewBox="0 0 84 84" aria-hidden="true">
          <defs>
            <mask id="${segMaskId}">
              <circle cx="42" cy="42" r="36" fill="none" stroke="#ffffff" stroke-width="7" stroke-dasharray="13.465 3.5" transform="rotate(135 42 42)"/>
            </mask>
          </defs>
          <!-- Підкладка на 10 поділок -->
          <circle class="hp-track" cx="42" cy="42" r="36" fill="none" stroke="rgba(5, 8, 15, 0.9)" stroke-width="6" stroke-dasharray="${arcLen} 226.2" mask="url(#${segMaskId})" transform="rotate(135 42 42)"/>
          <!-- Привид попереднього перегляду шкоди/хілу на дузі -->
          <circle class="hp-ghost-arc" id="gh-arc-${uid}" cx="42" cy="42" r="36" fill="none" stroke="#ff3b3b" stroke-width="6" stroke-dasharray="0 226.2" mask="url(#${segMaskId})" transform="rotate(135 42 42)" style="opacity:0"/>
          <!-- Активна 10-сегментна дуга HP (1 сегмент = 10 HP) -->
          <circle class="hp-fill-arc" cx="42" cy="42" r="36" fill="none" stroke="hsl(120, 82%, 48%)" stroke-width="6" stroke-dasharray="${arcLen} 226.2" mask="url(#${segMaskId})" transform="rotate(135 42 42)"/>
        </svg>
        <div class="pl-av-wrap" ${isMenuPreview ? 'id="prof-medallion" title="Натисни, щоб змінити аватар"' : ""}>${avSvg}</div>
        ${iciclesHtml}
      </div>

      <!-- Компактна капсула HP · Карт на полотні щита -->
      <div class="pl-hp-pill">
        <small>${hpText}</small>
        <div class="barw" style="display:none"><div class="bar"><i></i><u class="gh"></u><u class="gf"></u></div><em class="gt"></em></div>
      </div>

      <!-- Охайна табличка нікнейму на нижній частині щита-штандарта -->
      ${isMenuPreview ? `
        <div class="pl-nick pl-nick-edit" title="Натисни, щоб змінити нікнейм">
          <input type="text" class="pl-nick-input" id="prof-name-inp" maxlength="14" value="${nick.replace(/"/g, "&quot;")}" aria-label="Нікнейм гравця">
          <span class="pl-nick-pen">${UI_IC.pen}</span>
        </div>
      ` : `<div class="pl-nick"><b>${nick}</b></div>`}

      <!-- Статус-ефекти вертикальним стовпчиком по правому краю щита -->
      <div class="sts pl-side-sts"></div>

      <!-- Покращення вівтаря (Дари Вівтаря) по лівому краю щита -->
      <div class="relic-slots pl-altar-relics">${relicsHtml}</div>
    </div>
  `;
}


function buildCampaignPlayerDeck(lvl) {
  const effectiveLvl = lvl === 11 ? 3 : lvl === 12 ? 6 : lvl;
  const dmgPool = effectiveLvl <= 3
    ? [{ t: "I", r: 0 }, { t: "J", r: 0 }, { t: "d", r: 0 }, { t: "M", r: 0 }, { t: "O", r: 0 }, { t: "S", r: 0 }, { t: "p", r: 0 }, { t: "d", r: 1 }]
    : effectiveLvl <= 7
    ? [{ t: "d", r: 1 }, { t: "V", r: 1 }, { t: "Q", r: 1 }, { t: "R", r: 1 }, { t: "U", r: 1 }, { t: "D", r: 1 }, { t: "y", r: 1 }, { t: "p", r: 1 }, { t: "j", r: 2 }]
    : [{ t: "d", r: 2 }, { t: "Y", r: 2 }, { t: "Z", r: 2 }, { t: "W", r: 2 }, { t: "A", r: 2 }, { t: "7", r: 2 }, { t: "p", r: 2 }, { t: "d", r: 3 }, { t: "L", r: 3 }];
  const healPool = effectiveLvl <= 3
    ? [{ t: "1", r: 0 }, { t: "2", r: 0 }, { t: "h", r: 0 }, { t: "g", r: 0 }, { t: "3", r: 1 }]
    : effectiveLvl <= 7
    ? [{ t: "h", r: 1 }, { t: "4", r: 1 }, { t: "5", r: 1 }, { t: "6", r: 1 }, { t: "F", r: 1 }, { t: "T", r: 1 }, { t: "H", r: 1 }]
    : [{ t: "h", r: 2 }, { t: "g", r: 2 }, { t: "8", r: 2 }, { t: "F", r: 1 }, { t: "T", r: 1 }, { t: "B", r: 3 }];
  const specPool = effectiveLvl <= 4
    ? [{ t: "s", r: 2 }, { t: "m", r: 2 }, { t: "i", r: 2 }]
    : effectiveLvl <= 8
    ? [{ t: "s", r: 2 }, { t: "m", r: 2 }, { t: "z", r: 2 }, { t: "f", r: 3 }, { t: "u", r: 3 }]
    : [{ t: "s", r: 3 }, { t: "m", r: 3 }, { t: "z", r: 3 }, { t: "x", r: 3 }, { t: "n", r: 4 }];

  const pickUnique = (pool, count) => [...pool].sort(() => Math.random() - 0.5).slice(0, count);
  const chosen = [...pickUnique(dmgPool, 6), ...pickUnique(healPool, 3), ...pickUnique(specPool, 1)];
  const ord = { d: 0, p: 0, I: 0, J: 0, M: 0, O: 0, Q: 0, R: 0, U: 0, V: 0, X: 0, Y: 0, Z: 0, 7: 0, 9: 0, 0: 0, α: 0, β: 0, γ: 0, δ: 0, ε: 0, ζ: 0, η: 0, θ: 0, ι: 0, κ: 0, λ: 0, μ: 0, ν: 0, ξ: 0, ω: 0, k: 0, b: 0, o: 0, a: 0, v: 0, q: 0, y: 0, j: 0, l: 0, D: 0, A: 0, C: 0, S: 0, P: 0, W: 0, G: 0, L: 0, E: 0, h: 1, g: 1, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 8: 1, r: 1, t: 1, n: 1, H: 1, F: 1, T: 1, B: 1, K: 1, π: 1, ρ: 1, σ: 1, τ: 1, υ: 1, φ: 1, χ: 1, ψ: 1, Γ: 1, Δ: 1, Φ: 1, Ω: 1 };
  return chosen.sort((a, b) => (ord[a.t] !== undefined ? ord[a.t] : 2) - (ord[b.t] !== undefined ? ord[b.t] : 2) || a.r - b.r);
}

function isCampaignNodeUnlocked(node) {
  const maxLvl = PROFILE.campaignMaxLvl || 1;
  if (node.isSide) {
    return (PROFILE.campaignCleared || []).includes(node.reqLvl);
  }
  return node.lvl <= maxLvl;
}

let _pxCam = null;

function stopCampaignCam() {
  if (_pxCam) {
    if (_pxCam.raf) cancelAnimationFrame(_pxCam.raf);
    if (_pxCam.cleanup) _pxCam.cleanup();
    _pxCam = null;
  }
}

function openCampaignMap(focusLvl = null) {
  const ov = $("campaign-ov");
  if (!ov) return;
  window._cfZoomedLvl = focusLvl !== null ? focusLvl : null;
  window._cfShowChests = false;
  ov.classList.add("open");
  ov.setAttribute("aria-hidden", "false");
  renderCampaignMap();
  snd("swap");
}

function closeCampaignMap() {
  const ov = $("campaign-ov");
  if (!ov) return;
  stopCampaignCam();
  window._cfZoomedLvl = null;
  window._cfShowChests = false;
  ov.classList.remove("open");
  ov.setAttribute("aria-hidden", "true");
  snd("throw");
}

function campaignSparkBurst(x, y, cols) {
  const isPerf = (typeof SETTINGS !== "undefined" && SETTINGS.gfx === "perf") || window.matchMedia?.("(max-width: 767px)").matches;
  const count = isPerf ? 7 : 12;
  for (let k = 0; k < count; k++) {
    const p = document.createElement("div");
    const sz = 4 + (k % 2) * 2.5;
    const col = cols[k % cols.length];
    const ang = (Math.PI * 2 * k) / count + (Math.random() - 0.5) * 0.3;
    const dist = 26 + Math.random() * 40;
    const dx = Math.cos(ang) * dist;
    const dy = Math.sin(ang) * dist;
    p.style.cssText = `position:fixed;left:${x - sz / 2}px;top:${y - sz / 2}px;width:${sz}px;height:${sz}px;border-radius:50%;background:${col};z-index:120;pointer-events:none;will-change:transform,opacity`;
    document.body.appendChild(p);
    if (p.animate) {
      p.animate([
        { transform: "translate3d(0,0,0) scale(1.15)", opacity: 1 },
        { transform: `translate3d(${dx.toFixed(1)}px,${dy.toFixed(1)}px,0) scale(0.2)`, opacity: 0 }
      ], { duration: 420, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }).onfinish = () => p.remove();
    } else {
      setTimeout(() => p.remove(), 420);
    }
  }
}

// Побудова ортогональних рейок Crownfall із чіткими 45° зрізами на згинах та координатами заклепок
function buildCrownfallRailPath(pts, chamfer = 18) {
  if (!pts || pts.length < 2) return { d: "", bends: [] };
  if (pts.length === 2) {
    return { d: `M ${pts[0][0]} ${pts[0][1]} L ${pts[1][0]} ${pts[1][1]}`, bends: [] };
  }
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  const bends = [];
  for (let i = 1; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    const dx1 = x1 - x0, dy1 = y1 - y0;
    const dx2 = x2 - x1, dy2 = y2 - y1;
    const l1 = Math.hypot(dx1, dy1) || 1;
    const l2 = Math.hypot(dx2, dy2) || 1;
    const ch = Math.min(chamfer, l1 * 0.35, l2 * 0.35);
    const ax = x1 - (dx1 / l1) * ch;
    const ay = y1 - (dy1 / l1) * ch;
    const bx = x1 + (dx2 / l2) * ch;
    const by = y1 + (dy2 / l2) * ch;
    d += ` L ${ax.toFixed(1)} ${ay.toFixed(1)} L ${bx.toFixed(1)} ${by.toFixed(1)}`;
    bends.push([(ax + bx) / 2, (ay + by) / 2]);
  }
  const last = pts[pts.length - 1];
  d += ` L ${last[0]} ${last[1]}`;
  return { d, bends };
}

// Ортогональні маршрути між усіма 12 вузлами на карті 2000×1250
const CROWNFALL_EDGE_WAYPOINTS = {
  "1-2":  [[310, 990], [540, 990]],
  "2-3":  [[540, 990], [740, 990], [740, 850]],
  "2-11": [[540, 990], [540, 740], [340, 740], [340, 540]],
  "3-4":  [[740, 850], [740, 720], [960, 720]],
  "4-5":  [[960, 720], [1180, 720]],
  "5-12": [[1180, 720], [1180, 1030]],
  "5-6":  [[1180, 720], [1410, 720]],
  "6-7":  [[1410, 720], [1670, 720], [1670, 610]],
  "7-8":  [[1670, 610], [1670, 390]],
  "8-9":  [[1670, 390], [1350, 390], [1350, 315]],
  "9-10": [[1350, 315], [1350, 195], [1690, 195]]
};

function getRewardMiniVisual(node) {
  if (node.rewardType === "banner") {
    const bn = PL_BANNERS.find(b => b.id === node.rewardId);
    return `<span class="cf-rw-swatch" style="background:${bn ? bn.preview : "linear-gradient(135deg,#475569,#0f172a)"}"></span>`;
  }
  if (node.rewardType === "avatar") {
    const av = AVATARS.find(a => a.id === node.rewardId);
    return `<span class="cf-rw-av">${av ? av.svg : AV_SVG[0]}</span>`;
  }
  return `<span class="cf-rw-crown">${UI_IC.crown}</span>`;
}

function getHeroHomeNode() {
  const maxLvl = PROFILE.campaignMaxLvl || 1;
  const cleared = PROFILE.campaignCleared || [];
  if (window._cfZoomedLvl) {
    const sel = CAMPAIGN_CHAPTER_1.find(n => n.lvl === window._cfZoomedLvl);
    if (sel && isCampaignNodeUnlocked(sel)) return sel;
  }
  const frontier = CAMPAIGN_CHAPTER_1.find(n => !n.isSide && n.lvl === maxLvl);
  if (frontier) return frontier;
  const lastDone = [...CAMPAIGN_CHAPTER_1].reverse().find(n => cleared.includes(n.lvl));
  return lastDone || CAMPAIGN_CHAPTER_1[0];
}

function moveHeroTokenToNode(node) {
  const token = $("cf-hero-token");
  if (!token || !node) return;
  token.style.left = node.x + "px";
  token.style.top = node.y + "px";
  token.classList.remove("is-gliding");
  void token.offsetWidth;
  token.classList.add("is-gliding");
}

function updateCampaignNodeSelectionUI() {
  const zoomedLvl = window._cfZoomedLvl;
  const root = document.querySelector(".cf-ow-root");
  if (root) root.classList.toggle("is-zoomed", !!zoomedLvl);

  document.querySelectorAll(".cf-ow-node[data-cfnode]").forEach(btn => {
    const lvl = parseInt(btn.getAttribute("data-cfnode"), 10);
    btn.classList.toggle("is-selected", lvl === zoomedLvl);
  });

  document.querySelectorAll(".cf-trophy-item[data-cfnode]").forEach(btn => {
    const lvl = parseInt(btn.getAttribute("data-cfnode"), 10);
    btn.classList.toggle("is-selected", lvl === zoomedLvl);
  });

  const hint = $("cf-hint-bar");
  if (hint) hint.classList.toggle("is-hidden", !!zoomedLvl);

  const heroNode = getHeroHomeNode();
  moveHeroTokenToNode(heroNode);

  const cardSlot = $("cf-zoom-card-slot");
  if (!cardSlot) return;

  const curNode = zoomedLvl ? CAMPAIGN_CHAPTER_1.find(n => n.lvl === zoomedLvl) : null;
  if (!curNode) {
    const existing = cardSlot.querySelector(".cf-duel-card");
    if (existing) {
      existing.classList.add("is-closing");
      setTimeout(() => {
        if (!window._cfZoomedLvl && cardSlot) cardSlot.innerHTML = "";
      }, 220);
    } else {
      cardSlot.innerHTML = "";
    }
    return;
  }

  const curUnlocked = isCampaignNodeUnlocked(curNode);
  const starsMap = PROFILE.campaignStars || {};
  const cleared = PROFILE.campaignCleared || [];
  const isDone = cleared.includes(curNode.lvl);
  const stCount = starsMap[curNode.lvl] || (isDone ? 3 : 0);
  const rewardClaimed = (PROFILE.campaignRewards || []).includes(curNode.rewardId);
  const bossAvSvg = AV_SVG[curNode.crestIdx] || AV_SVG[0];
  const bossBn = PL_BANNERS[curNode.bannerIdx] || PL_BANNERS[0];

  const starsHtml = `<div class="cf-dc-stars" title="Зірки рівня (${stCount}/3)">${[1, 2, 3].map(i => `<span class="${i <= stCount ? "lit" : ""}">${UI_IC.star}</span>`).join("")}</div>`;

  const enemyWeapons = curNode.deck.slice(0, 6).map(c => `
    <span class="cf-dc-wpn" style="--rc:${R[c.r].c}" title="${cardName(c)} (${R[c.r].n})">
      ${iconFor(c)}<span>${cardName(c)}</span>
    </span>
  `).join("");

  const badgeText = curNode.isSide
    ? `${UI_IC.diamond} ТАЄМНЕ ВИПРОБУВАННЯ`
    : curNode.lvl === 10
    ? `${UI_IC.crown} БОС ГЛАВИ I`
    : curNode.isBoss
    ? `${UI_IC.shield} МІНІБОС ПЕРЕПРАВИ`
    : `РІВЕНЬ ${curNode.lvl} · ГЛАВА I`;

  const lockHint = curNode.isSide
    ? `${UI_IC.lock} Пройди рівень ${curNode.reqLvl}`
    : `${UI_IC.lock} Пройди рівень ${Math.max(1, curNode.lvl - 1)}`;

  cardSlot.innerHTML = `
    <div class="cf-duel-card ${curNode.isBoss ? "is-boss-card" : ""} ${curNode.isSide ? "is-side-card" : ""}" id="cf-duel-card">
      <div class="cf-dc-drag-pill" aria-hidden="true"></div>
      <div class="cf-dc-top">
        <span class="cf-dc-badge">${badgeText}</span>
        <button type="button" class="cf-dc-close" id="btn-cf-unzoom" title="Закрити">${UI_IC.close}</button>
      </div>

      <div class="cf-dc-hero">
        <div class="cf-dc-portrait" style="background:${bossBn.preview}">
          <div class="cf-dc-portrait-ring">${bossAvSvg}</div>
        </div>
        <div class="cf-dc-hero-info">
          <h3 class="cf-dc-title">${curNode.title}</h3>
          <div class="cf-dc-boss-name">${curNode.boss}</div>
          <div class="cf-dc-stats-row">
            <span class="cf-dc-stat hp">${UI_IC.heart} ${curNode.hp} HP</span>
            ${curNode.shield ? `<span class="cf-dc-stat sh">${UI_IC.shield} +${curNode.shield}</span>` : ""}
            ${starsHtml}
          </div>
        </div>
      </div>

      <p class="cf-dc-lore">«${curNode.lore}»</p>

      <div class="cf-dc-sec-lbl">${UI_IC.swords} АРСЕНАЛ СУПЕРНИКА</div>
      <div class="cf-dc-wpns">${enemyWeapons}</div>

      <div class="cf-dc-reward ${rewardClaimed ? "is-claimed" : ""}">
        <div class="cf-dc-rw-ico">${getRewardMiniVisual(curNode)}</div>
        <div class="cf-dc-rw-text">
          <small>${rewardClaimed ? `ТРОФЕЙ ОТРИМАНО ${UI_IC.check}` : "НАГОРОДА ЗА ПЕРЕМОГУ"}</small>
          <b>${curNode.rewardLabel}</b>
        </div>
      </div>

      <button type="button" class="cf-dc-fight-btn" id="btn-cf-fight" ${!curUnlocked ? "disabled" : ""}>
        ${!curUnlocked ? lockHint : isDone ? `${UI_IC.swords} ПЕРЕГРАТИ БІЙ` : `${UI_IC.swords} У БІЙ!`}
      </button>
    </div>
  `;

  const unzoomBtn = $("btn-cf-unzoom");
  if (unzoomBtn) {
    unzoomBtn.onclick = (ev) => {
      ev.stopPropagation();
      selectCampaignNode(null, true);
    };
  }

  const fightBtn = $("btn-cf-fight");
  if (fightBtn) {
    fightBtn.onclick = (ev) => {
      ev.stopPropagation();
      if (!curUnlocked) return;
      CAMPAIGN = { chapter: 1, lvl: curNode.lvl };
      TOUR = null;
      isPaused = false;
      closeCampaignMap();
      start(2);
    };
  }
}

function updateCampaignChestsUI() {
  const slot = $("cf-chests-slot");
  if (!slot) return;
  if (!window._cfShowChests) {
    slot.innerHTML = "";
    return;
  }
  const starsMap = PROFILE.campaignStars || {};
  const totalStars = Object.values(starsMap).reduce((s, v) => s + (Number(v) || 0), 0);
  slot.innerHTML = `
    <div class="cf-chests-pop" id="cf-chests-pop">
      <div class="cf-cp-head">
        <span>${UI_IC.diamond} СКРИНІ МАРМУРОВОГО ПОЛІСА</span>
        <button type="button" class="cf-dc-close" id="btn-cf-chests-close">${UI_IC.close}</button>
      </div>
      <div class="cf-ms-row ${totalStars >= 9 ? "ready" : ""}">
        <span class="cf-ms-ico">${UI_IC.chest}</span>
        <div class="cf-ms-info"><b>Скриня Новобранця</b><small>Шолом Гопліта</small></div>
        <span class="cf-ms-req">${totalStars >= 9 ? `${UI_IC.check} 9${UI_IC.star}` : `${totalStars}/9${UI_IC.star}`}</span>
      </div>
      <div class="cf-ms-row ${totalStars >= 21 ? "ready" : ""}">
        <span class="cf-ms-ico">${UI_IC.urn}</span>
        <div class="cf-ms-info"><b>Скарб Агори</b><small>Нефритовий Ліс</small></div>
        <span class="cf-ms-req">${totalStars >= 21 ? `${UI_IC.check} 21${UI_IC.star}` : `${totalStars}/21${UI_IC.star}`}</span>
      </div>
      <div class="cf-ms-row ${totalStars >= 33 ? "ready" : ""}">
        <span class="cf-ms-ico">${UI_IC.crown}</span>
        <div class="cf-ms-info"><b>Лавр Центуріона</b><small>Підкорювач Поліса</small></div>
        <span class="cf-ms-req">${totalStars >= 33 ? `${UI_IC.check} 33${UI_IC.star}` : `${totalStars}/33${UI_IC.star}`}</span>
      </div>
    </div>
  `;
  const closeC = $("btn-cf-chests-close");
  if (closeC) {
    closeC.onclick = (ev) => {
      ev.stopPropagation();
      window._cfShowChests = false;
      snd("throw");
      updateCampaignChestsUI();
    };
  }
}

function selectCampaignNode(lvl, zoomBackOut = false) {
  const prevLvl = window._cfZoomedLvl;
  window._cfZoomedLvl = lvl;
  window._cfShowChests = false;
  updateCampaignChestsUI();
  updateCampaignNodeSelectionUI();

  if (!_pxCam) return;
  if (lvl) {
    const node = CAMPAIGN_CHAPTER_1.find(n => n.lvl === lvl);
    if (node) {
      const vw = _pxCam.vw();
      const vh = _pxCam.vh();
      const isMob = vw < 840;
      const targetScale = isMob ? 0.92 : 1.15;
      const anchorX = isMob ? vw * 0.5 : (265 + (vw - 265 - 385) * 0.5);
      const anchorY = isMob ? vh * 0.30 : vh * 0.48;
      _pxCam.flyTo(node.x, node.y, targetScale, anchorX, anchorY);
    }
    snd("swap");
  } else if (zoomBackOut && prevLvl) {
    const node = CAMPAIGN_CHAPTER_1.find(n => n.lvl === prevLvl);
    const overviewScale = _pxCam.overviewScale();
    const isMob = _pxCam.vw() < 840;
    const anchorX = isMob ? _pxCam.vw() * 0.5 : (_pxCam.vw() + 240) * 0.5;
    if (node) {
      _pxCam.flyTo(node.x, node.y, overviewScale, anchorX, _pxCam.vh() * 0.5);
    } else {
      _pxCam.resetView();
    }
    snd("throw");
  }
}

// Легка 2.5D векторна карта 2000×1250 без важких SVG-фільтрів (<filter>), що гальмують GPU на мобільних
function buildCrownfallWorldSvg(cleared, liteMode = false) {
  const nodeById = Object.fromEntries(CAMPAIGN_CHAPTER_1.map(n => [n.id, n]));
  let railsLocked = "";
  let railsActive = "";
  let railsSide = "";
  let rivetsSvg = "";

  CAMPAIGN_CHAPTER_1.forEach(src => {
    (src.next || []).forEach(dstId => {
      const dst = nodeById[dstId];
      if (!dst) return;
      const key = `${src.id}-${dst.id}`;
      const pts = CROWNFALL_EDGE_WAYPOINTS[key] || [[src.x, src.y], [dst.x, src.y], [dst.x, dst.y]];
      const { d, bends } = buildCrownfallRailPath(pts, 18);
      const isSide = !!dst.isSide;
      const isOpen = cleared.includes(src.lvl) && isCampaignNodeUnlocked(dst);

      railsLocked += `
        <path d="${d}" fill="none" stroke="#060c14" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>
        <path d="${d}" fill="none" stroke="#1e293b" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="${d}" fill="none" stroke="#334155" stroke-width="5.5" stroke-dasharray="10 8" stroke-linecap="round"/>
      `;

      if (isSide) {
        railsSide += `
          <path d="${d}" fill="none" stroke="${isOpen ? "#581c87" : "#2e1065"}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" opacity="${isOpen ? "0.95" : "0.65"}"/>
          <path d="${d}" fill="none" stroke="${isOpen ? "#c084fc" : "#6b21a8"}" stroke-width="${isOpen ? "5.5" : "3.5"}" stroke-linecap="round" stroke-linejoin="round"/>
          ${(isOpen && !liteMode) ? `<path class="cf-rail-flow-side" d="${d}" fill="none" stroke="#f5d0fe" stroke-width="2.5" stroke-dasharray="14 22" stroke-linecap="round"/>` : ""}
        `;
      } else if (isOpen) {
        railsActive += `
          <path d="${d}" fill="none" stroke="#451a03" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="${d}" fill="none" stroke="url(#cfGoldRailGrad)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="${d}" fill="none" stroke="#fef9c3" stroke-width="3" stroke-linecap="round" opacity="0.82"/>
          ${!liteMode ? `<path class="cf-rail-flow-gold" d="${d}" fill="none" stroke="#ffffff" stroke-width="2.8" stroke-dasharray="16 28" stroke-linecap="round"/>` : ""}
        `;
      }

      bends.forEach(([bx, by]) => {
        const strokeCol = isSide ? (isOpen ? "#e879f9" : "#7e22ce") : (isOpen ? "#fef08a" : "#64748b");
        const fillCol = isSide ? "#3b0764" : (isOpen ? "#b45309" : "#1e293b");
        rivetsSvg += `
          <g transform="translate(${bx.toFixed(1)},${by.toFixed(1)})">
            <circle r="6.5" fill="#070d16" opacity="0.8"/>
            <circle r="5" fill="${fillCol}" stroke="${strokeCol}" stroke-width="1.6"/>
          </g>
        `;
      });
    });
  });

  const oliveTrees = liteMode
    ? [[185, 865, 1.0], [455, 845, 0.9], [685, 765, 0.95], [795, 920, 1.0], [1085, 580, 1.0], [1345, 855, 1.0], [1525, 805, 0.9], [1055, 865, 0.95]]
    : [
        [185, 865, 1.05], [225, 825, 0.9], [415, 880, 1.0], [455, 845, 0.85], [645, 795, 1.1],
        [685, 765, 0.92], [795, 920, 1.05], [835, 875, 0.88], [625, 930, 0.95], [715, 965, 1.0],
        [1040, 610, 0.95], [1085, 580, 1.08], [1305, 595, 0.95], [1345, 855, 1.05], [1485, 845, 1.0],
        [1525, 805, 0.85], [1055, 865, 1.0], [1015, 920, 0.92], [1280, 965, 0.95]
      ];
  const cypressTrees = liteMode
    ? [[1555, 370, 1.0], [1740, 345, 1.0], [1235, 345, 1.0], [1445, 185, 1.0], [260, 520, 0.92], [415, 515, 0.95]]
    : [
        [1520, 415, 1.0], [1555, 370, 1.1], [1595, 325, 1.0], [1740, 345, 1.05], [1780, 395, 0.95],
        [1755, 445, 1.0], [1460, 290, 0.95], [1235, 345, 1.05], [1215, 290, 0.95], [1445, 185, 1.0],
        [1805, 255, 1.0], [260, 520, 0.92], [415, 515, 0.95], [385, 465, 0.85]
      ];

  const treesSvg = oliveTrees.map(([x, y, s]) => `
    <g transform="translate(${x},${y}) scale(${s})">
      <ellipse cx="6" cy="13" rx="16" ry="8" fill="#041512" opacity="0.45"/>
      <rect x="-2.5" y="2" width="5" height="11" rx="1.5" fill="#4e3424"/>
      <circle cx="-7" cy="-2" r="12" fill="#1b4d3e"/>
      <circle cx="7" cy="-1" r="11" fill="#174236"/>
      <circle cx="0" cy="-8" r="14" fill="#2a6b54"/>
    </g>
  `).join("") + cypressTrees.map(([x, y, s]) => `
    <g transform="translate(${x},${y}) scale(${s})">
      <ellipse cx="5" cy="13" rx="10" ry="5" fill="#031110" opacity="0.48"/>
      <rect x="-2" y="4" width="4" height="9" fill="#3f2718"/>
      <path d="M 0 -26 C 10 -13 11 2 0 8 C -11 2 -10 -13 0 -26 Z" fill="#1b5949"/>
    </g>
  `).join("");

  const waveCoords = liteMode
    ? [[240, 340], [780, 290], [660, 620], [880, 1080], [1480, 1060], [1100, 160]]
    : [[140, 290], [240, 340], [640, 390], [780, 290], [870, 560], [660, 620],
       [170, 740], [880, 1080], [960, 960], [1480, 1060], [1810, 920], [1860, 540]];
  const seaWaves = waveCoords.map(([x, y], idx) => `
    <path class="cf-sea-wave" style="animation-delay:${(-idx * 0.6).toFixed(2)}s" d="M ${x - 26} ${y} Q ${x - 13} ${y - 5} ${x} ${y} T ${x + 26} ${y}" fill="none" stroke="#5eead4" stroke-width="1.6" stroke-linecap="round" opacity="0.24"/>
  `).join("");

  return `
    <svg class="cf-world-svg" viewBox="0 0 2000 1250" width="2000" height="1250" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="cfSeaBg" cx="52%" cy="48%" r="65%">
          <stop offset="0%" stop-color="#0f3c4c"/>
          <stop offset="52%" stop-color="#092735"/>
          <stop offset="100%" stop-color="#04121b"/>
        </radialGradient>
        <radialGradient id="cfShallowGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#2dd4bf" stop-opacity="0.28"/>
          <stop offset="100%" stop-color="#0d9488" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="cfCliffDark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#334155"/>
          <stop offset="55%" stop-color="#1e293b"/>
          <stop offset="100%" stop-color="#0b111c"/>
        </linearGradient>
        <linearGradient id="cfGrass1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#2d5f4e"/>
          <stop offset="60%" stop-color="#1e4439"/>
          <stop offset="100%" stop-color="#142f2a"/>
        </linearGradient>
        <linearGradient id="cfGrass2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#366c56"/>
          <stop offset="65%" stop-color="#224c3e"/>
          <stop offset="100%" stop-color="#17352e"/>
        </linearGradient>
        <linearGradient id="cfBasalt" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#3a2d36"/>
          <stop offset="100%" stop-color="#120d14"/>
        </linearGradient>
        <linearGradient id="cfMarbleTop" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#eae2ce"/>
          <stop offset="60%" stop-color="#cfc3a8"/>
          <stop offset="100%" stop-color="#a89b80"/>
        </linearGradient>
        <linearGradient id="cfMarbleWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#9e9278"/>
          <stop offset="100%" stop-color="#5c5343"/>
        </linearGradient>
        <linearGradient id="cfGoldRailGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#d97706"/>
          <stop offset="50%" stop-color="#facc15"/>
          <stop offset="100%" stop-color="#eab308"/>
        </linearGradient>
        <linearGradient id="cfCapitolRoof" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fef08a"/>
          <stop offset="50%" stop-color="#f59e0b"/>
          <stop offset="100%" stop-color="#92400e"/>
        </linearGradient>
        <radialGradient id="cfLavaGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#f97316" stop-opacity="0.58"/>
          <stop offset="100%" stop-color="#ea580c" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="cfArcaneGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#c084fc" stop-opacity="0.55"/>
          <stop offset="100%" stop-color="#0d9488" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="cfSunAura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fde047" stop-opacity="0.38"/>
          <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
        </radialGradient>
      </defs>

      <!-- 1. ГЛИБОКЕ МОРЕ ТА РОЗА ВІТРІВ -->
      <rect width="2000" height="1250" fill="url(#cfSeaBg)"/>
      <g transform="translate(1820, 1085)" opacity="0.2">
        <circle r="72" fill="none" stroke="#fde047" stroke-width="1.2" stroke-dasharray="4 4"/>
        <polygon points="0,-68 9,-9 68,0 9,9 0,68 -9,9 -68,0 -9,-9" fill="#fde047" opacity="0.45"/>
      </g>
      ${seaWaves}

      <!-- 2. МІЛКОВОДДЯ -->
      <ellipse cx="500" cy="965" rx="440" ry="260" fill="url(#cfShallowGlow)"/>
      <ellipse cx="340" cy="540" rx="195" ry="155" fill="url(#cfShallowGlow)"/>
      <ellipse cx="1370" cy="770" rx="480" ry="360" fill="url(#cfShallowGlow)"/>
      <ellipse cx="1520" cy="275" rx="440" ry="240" fill="url(#cfShallowGlow)"/>

      <!-- 3. ОСТРІВ I: ПІВДЕННА ГАВАНЬ ТА ОЛИВКОВІ СХИЛИ (Рівні 1–3) -->
      <g>
        <path class="cf-foam" d="M 118 980 C 110 850 220 770 390 775 C 510 778 585 735 710 740 C 815 745 865 820 845 925 C 825 1030 740 1120 570 1138 C 380 1158 140 1110 118 980 Z" fill="none" stroke="#5eead4" stroke-width="2.5" stroke-dasharray="18 14" opacity="0.34"/>
        <path d="M 135 985 C 128 875 235 805 395 810 C 515 814 590 772 708 776 C 805 780 848 845 830 945 C 812 1042 732 1126 570 1142 C 392 1160 155 1112 135 985 Z" fill="url(#cfCliffDark)"/>
        <path d="M 142 1015 L 220 1095 L 440 1140 L 660 1122 L 808 1018 L 828 945 L 790 1005 L 650 1078 L 435 1094 L 225 1052 Z" fill="#09101a" opacity="0.5"/>
        <path d="M 142 945 C 138 840 242 778 398 782 C 515 785 592 744 708 748 C 802 752 842 812 825 906 C 808 998 725 1075 568 1090 C 395 1106 160 1062 142 945 Z" fill="url(#cfGrass1)" stroke="#4c8c72" stroke-width="2"/>
      </g>

      <!-- Тераса Оливкового Гаю (Рівень 3) -->
      <g>
        <path d="M 625 832 C 625 785 680 764 745 768 C 804 772 822 815 814 868 C 806 916 742 938 682 928 C 638 920 625 878 625 832 Z" fill="#1b3a34"/>
        <path d="M 630 818 C 630 774 682 754 744 758 C 800 762 816 802 808 852 C 800 896 740 916 684 908 C 642 900 630 860 630 818 Z" fill="url(#cfGrass2)" stroke="#5ba385" stroke-width="1.5"/>
        <g transform="translate(658, 902) rotate(-18)">
          <rect x="0" y="0" width="38" height="26" rx="2" fill="#8b8270" stroke="#474137" stroke-width="1.2"/>
          <line x1="2" y1="7" x2="36" y2="7" stroke="#d9d0bc" stroke-width="2"/>
          <line x1="2" y1="15" x2="36" y2="15" stroke="#d9d0bc" stroke-width="2"/>
        </g>
      </g>

      <!-- Причал Південної Гавані та трирема -->
      <g transform="translate(132, 1020)">
        <rect x="0" y="14" width="112" height="24" rx="3" fill="#6b4426" stroke="#3b2210" stroke-width="2"/>
        <g transform="translate(-26, 48) rotate(-12)">
          <path d="M 0 12 C 18 -2 68 -2 92 12 C 74 26 22 26 0 12 Z" fill="#5c3318" stroke="#d4a24a" stroke-width="1.8"/>
          <rect x="34" y="4" width="22" height="16" rx="3" fill="#991b1b" stroke="#fde047" stroke-width="1.2"/>
          <line x1="45" y1="-8" x2="45" y2="28" stroke="#fef08a" stroke-width="2.2"/>
        </g>
      </g>

      <!-- Біломармурова Площа Воріт Поліса (Рівень 1 + Алея Колон 2) -->
      <g>
        <rect x="200" y="925" width="405" height="122" rx="14" fill="url(#cfMarbleWall)"/>
        <rect x="200" y="915" width="405" height="120" rx="14" fill="url(#cfMarbleTop)" stroke="#f5eedc" stroke-width="2"/>
        <g transform="translate(245, 962)">
          <circle r="30" fill="#a89b80" stroke="#f5eedc" stroke-width="2.5"/>
          <circle r="22" fill="#0e7490" stroke="#67e8f9" stroke-width="1.5"/>
          <circle r="10" fill="#22d3ee" opacity="0.5"/>
        </g>
        <g>
          ${[385, 430, 475, 520, 565].map(cx => `
            <circle cx="${cx}" cy="932" r="8" fill="#f8f4e8" stroke="#a89b80" stroke-width="1.8"/>
            <circle cx="${cx}" cy="1020" r="8" fill="#f8f4e8" stroke="#a89b80" stroke-width="1.8"/>
          `).join("")}
        </g>
        <g transform="translate(278, 868) rotate(-8)">
          <polygon points="0,4 50,0 52,36 2,38" fill="#c2593b" stroke="#f6e6cc" stroke-width="1.6"/>
        </g>
        <g transform="translate(342, 858) rotate(5)">
          <polygon points="0,2 44,0 46,32 2,34" fill="#e5d5b5" stroke="#8f7a5a" stroke-width="1.6"/>
        </g>
      </g>

      <!-- 4. ТАЄМНИЙ ОСТРІВ: ЗАНЕДБАНИЙ ВІВТАР (Рівень 11) -->
      <g>
        <path class="cf-foam" d="M 218 555 C 208 475 268 420 348 424 C 428 428 476 484 468 558 C 460 628 395 668 322 664 C 254 660 226 615 218 555 Z" fill="none" stroke="#c084fc" stroke-width="2.2" stroke-dasharray="14 12" opacity="0.38"/>
        <path d="M 232 560 C 224 490 278 442 348 446 C 418 450 458 498 450 562 C 442 624 388 656 324 652 C 264 648 238 608 232 560 Z" fill="url(#cfCliffDark)"/>
        <path d="M 236 534 C 228 468 280 426 346 430 C 414 434 452 478 444 538 C 436 594 386 624 324 620 C 266 616 242 580 236 534 Z" fill="#18353b" stroke="#5eead4" stroke-width="1.8"/>
        <circle cx="340" cy="540" r="76" fill="url(#cfArcaneGlow)"/>
        <circle cx="340" cy="540" r="56" fill="none" stroke="#c084fc" stroke-width="1.6" stroke-dasharray="7 5" opacity="0.72"/>
        <polygon points="340,468 354,492 340,510 326,492" fill="#34d399" stroke="#ecfdf5" stroke-width="1.6"/>
      </g>

      <!-- 5. ОСТРІВ II: ЦЕНТРАЛЬНА АГОРА, АКАДЕМІЯ, КУЗНЯ ТА ПІВДЕННА СКАРБНИЦЯ (Рівні 5–7, 12) -->
      <g>
        <path class="cf-foam" d="M 995 660 C 1020 535 1210 492 1425 508 C 1610 522 1815 548 1835 665 C 1852 768 1755 868 1595 886 C 1455 902 1355 918 1308 1030 C 1272 1118 1192 1152 1118 1132 C 1035 1110 1022 995 1035 892 C 982 842 978 742 995 660 Z" fill="none" stroke="#5eead4" stroke-width="2.5" stroke-dasharray="18 14" opacity="0.34"/>
        <path d="M 1012 675 C 1035 562 1215 524 1425 538 C 1598 550 1796 575 1814 680 C 1830 778 1738 874 1588 892 C 1448 908 1350 924 1302 1035 C 1268 1115 1192 1146 1122 1126 C 1046 1104 1038 996 1048 896 C 998 848 996 752 1012 675 Z" fill="url(#cfCliffDark)"/>
        <path d="M 1018 642 C 1040 534 1218 498 1422 512 C 1592 524 1788 548 1806 648 C 1820 738 1732 828 1585 844 C 1445 860 1344 878 1296 986 C 1262 1062 1192 1094 1124 1076 C 1052 1056 1044 956 1054 858 C 1004 812 1002 718 1018 642 Z" fill="url(#cfGrass1)" stroke="#4d8f75" stroke-width="2"/>
        <path d="M 1542 528 C 1658 532 1788 558 1804 648 C 1816 716 1756 792 1658 820 C 1575 812 1534 744 1530 662 C 1528 602 1532 558 1542 528 Z" fill="url(#cfBasalt)" stroke="#fb923c" stroke-width="1.5" stroke-opacity="0.45"/>
      </g>

      <!-- Мармуровий Міст (Рівень 4) -->
      <g>
        <rect x="852" y="756" width="32" height="32" rx="4" fill="#334155"/>
        <rect x="944" y="756" width="32" height="34" rx="4" fill="#334155"/>
        <rect x="1036" y="756" width="32" height="32" rx="4" fill="#334155"/>
        <rect x="802" y="742" width="298" height="22" rx="4" fill="url(#cfMarbleWall)"/>
        <rect x="802" y="688" width="298" height="58" rx="6" fill="url(#cfMarbleTop)" stroke="#f8f2e4" stroke-width="2.2"/>
        ${[[832, 684], [832, 748], [1068, 684], [1068, 748]].map(([bx, by]) => `
          <circle cx="${bx}" cy="${by}" r="8.5" fill="#78350f" stroke="#fde047" stroke-width="2"/>
          <circle cx="${bx}" cy="${by}" r="4" fill="#fb923c"/>
        `).join("")}
      </g>

      <!-- Ринкова Агора (Рівень 5) -->
      <g>
        <rect x="1088" y="646" width="218" height="154" rx="14" fill="url(#cfMarbleWall)"/>
        <rect x="1088" y="638" width="218" height="150" rx="14" fill="url(#cfMarbleTop)" stroke="#f5eedc" stroke-width="2"/>
        <polygon points="1098,600 1152,594 1156,630 1102,634" fill="#4f46e5" stroke="#e0e7ff" stroke-width="1.5"/>
        <polygon points="1176,590 1232,588 1234,624 1178,626" fill="#b45309" stroke="#fef3c7" stroke-width="1.5"/>
        <polygon points="1248,604 1296,600 1298,634 1250,636" fill="#be123c" stroke="#ffe4e6" stroke-width="1.5"/>
        <path d="M 1110 632 Q 1190 662 1280 634" fill="none" stroke="#fef08a" stroke-width="1.4" opacity="0.85"/>
        <polygon points="1145,642 1157,645 1149,656" fill="#34d399"/>
        <polygon points="1182,647 1195,648 1188,660" fill="#fbbf24"/>
        <polygon points="1220,645 1232,643 1227,656" fill="#f43f5e"/>
      </g>

      <!-- Скарбниця Кузні (Рівень 12) -->
      <g transform="translate(1180, 1030)">
        <circle r="66" fill="url(#cfArcaneGlow)" opacity="0.75"/>
        <polygon points="-58,-44 58,-44 66,34 0,58 -66,34" fill="#1e293b" stroke="#94a3b8" stroke-width="2.2"/>
        <polygon points="-46,-34 46,-34 52,24 0,44 -52,24" fill="#0f172a" stroke="#c084fc" stroke-width="1.5" stroke-dasharray="6 4"/>
      </g>

      <!-- Академія Гоплітів (Рівень 6) -->
      <g transform="translate(1410, 720)">
        <circle r="76" fill="#7c725d" stroke="#eae2ce" stroke-width="3"/>
        <circle r="62" fill="#b8a98a" stroke="#6b614e" stroke-width="2"/>
        <circle r="48" fill="#c9a870" stroke="#7c5d32" stroke-width="1.5"/>
      </g>

      <!-- Збройова Кузня Гефеста (Рівень 7) -->
      <g transform="translate(1670, 610)">
        <circle cx="52" cy="12" r="88" fill="url(#cfLavaGlow)"/>
        <path d="M 35 -25 L 72 4 L 106 -12 M 64 26 L 96 58 L 118 46" fill="none" stroke="#f97316" stroke-width="4" stroke-linecap="round"/>
        <polygon points="34,-48 112,-34 104,24 28,14" fill="#3b262a" stroke="#fb923c" stroke-width="2"/>
        <circle cx="72" cy="-10" r="18" fill="#181214" stroke="#f97316" stroke-width="2.5"/>
        <circle cx="72" cy="-10" r="9" fill="#fde047"/>
      </g>

      <!-- 6. ОСТРІВ III: ПІВНІЧНИЙ ПІК КАПІТОЛІЯ (Рівні 8–10) -->
      <g>
        <rect x="1636" y="438" width="68" height="126" rx="5" fill="url(#cfMarbleWall)"/>
        <rect x="1642" y="438" width="56" height="126" rx="4" fill="url(#cfMarbleTop)" stroke="#f8f2e4" stroke-width="2"/>
        <path class="cf-foam" d="M 1110 300 C 1115 165 1275 82 1515 74 C 1735 68 1898 135 1905 268 C 1912 396 1812 486 1650 488 C 1495 490 1385 452 1265 446 C 1162 440 1106 382 1110 300 Z" fill="none" stroke="#5eead4" stroke-width="2.5" stroke-dasharray="18 14" opacity="0.36"/>
        <path d="M 1126 312 C 1132 186 1286 108 1518 102 C 1726 96 1882 158 1888 280 C 1894 398 1798 476 1648 478 C 1498 480 1392 444 1274 438 C 1178 432 1122 384 1126 312 Z" fill="url(#cfCliffDark)"/>
        <path d="M 1132 280 C 1138 158 1290 86 1516 80 C 1722 74 1874 134 1880 248 C 1886 356 1792 432 1646 434 C 1498 436 1394 402 1278 396 C 1184 390 1128 346 1132 280 Z" fill="url(#cfGrass2)" stroke="#5ba385" stroke-width="2"/>
        <path d="M 1275 215 C 1275 135 1415 95 1615 96 C 1785 98 1855 152 1848 242 C 1842 320 1745 352 1595 344 C 1445 336 1275 305 1275 215 Z" fill="url(#cfMarbleWall)"/>
        <path d="M 1275 198 C 1275 122 1415 84 1615 86 C 1785 88 1852 140 1846 226 C 1840 302 1745 332 1595 324 C 1445 316 1275 286 1275 198 Z" fill="url(#cfMarbleTop)" stroke="#fffbeb" stroke-width="2.4"/>
      </g>

      <!-- Мармурові Сходи (Рівень 9) -->
      <g transform="translate(1316, 286)">
        <rect x="0" y="0" width="68" height="72" rx="4" fill="#9e9278" stroke="#f8f2e4" stroke-width="1.8"/>
        ${[12, 24, 36, 48, 60].map(sy => `<line x1="4" y1="${sy}" x2="64" y2="${sy}" stroke="#f5eedc" stroke-width="2.2"/>`).join("")}
      </g>

      <!-- Золотий Капітолій Поліса (Рівень 10) -->
      <g transform="translate(1690, 180)">
        <circle r="130" fill="url(#cfSunAura)"/>
        <rect x="-102" y="-76" width="204" height="128" rx="8" fill="#8f826a" stroke="#fef3c7" stroke-width="2"/>
        <rect x="-90" y="-66" width="180" height="108" rx="6" fill="#dfd5be" stroke="#fde047" stroke-width="2"/>
        ${[-74, -44, -14, 16, 46, 74].map(cx => `
          <rect x="${cx - 6}" y="-28" width="12" height="62" rx="2" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2"/>
        `).join("")}
        <polygon points="-96,-28 0,-88 96,-28" fill="url(#cfCapitolRoof)" stroke="#fffbeb" stroke-width="2.4" stroke-linejoin="round"/>
        <polygon points="-70,-34 0,-74 70,-34" fill="#78350f" stroke="#fde047" stroke-width="1.5"/>
        <circle cx="0" cy="-50" r="9" fill="#fef08a"/>
      </g>

      <!-- Гаї -->
      <g>${treesSvg}</g>

      <!-- 7. НАЗВИ РЕГІОНІВ -->
      <g class="cf-region-labels" pointer-events="none">
        <g transform="translate(435, 1084)">
          <rect x="-98" y="-14" width="196" height="28" rx="14" fill="rgba(7,12,22,0.86)" stroke="rgba(212,162,74,0.55)" stroke-width="1.3"/>
          <text y="4" text-anchor="middle" fill="#f5e6c4" font-family="'Cormorant Garamond', Georgia, serif" font-size="12" font-weight="800" letter-spacing="2">ПІВДЕННА ГАВАНЬ</text>
        </g>
        <g transform="translate(340, 444)">
          <rect x="-86" y="-13" width="172" height="26" rx="13" fill="rgba(16,8,30,0.86)" stroke="rgba(192,132,252,0.58)" stroke-width="1.3"/>
          <text y="4" text-anchor="middle" fill="#e9d5ff" font-family="'Cormorant Garamond', Georgia, serif" font-size="11" font-weight="800" letter-spacing="1.8">ТАЄМНИЙ ВІВТАР</text>
        </g>
        <g transform="translate(1200, 566)">
          <rect x="-92" y="-14" width="184" height="28" rx="14" fill="rgba(7,12,22,0.86)" stroke="rgba(212,162,74,0.55)" stroke-width="1.3"/>
          <text y="4" text-anchor="middle" fill="#f5e6c4" font-family="'Cormorant Garamond', Georgia, serif" font-size="12" font-weight="800" letter-spacing="2">РИНКОВА АГОРА</text>
        </g>
        <g transform="translate(1690, 775)">
          <rect x="-88" y="-13" width="176" height="26" rx="13" fill="rgba(24,10,8,0.86)" stroke="rgba(251,146,60,0.6)" stroke-width="1.3"/>
          <text y="4" text-anchor="middle" fill="#ffedd5" font-family="'Cormorant Garamond', Georgia, serif" font-size="11" font-weight="800" letter-spacing="1.8">ЗБРОЙОВА КУЗНЯ</text>
        </g>
        <g transform="translate(1515, 118)">
          <rect x="-112" y="-14" width="224" height="28" rx="14" fill="rgba(18,12,4,0.88)" stroke="rgba(253,224,71,0.72)" stroke-width="1.5"/>
          <text y="4" text-anchor="middle" fill="#fef08a" font-family="'Cormorant Garamond', Georgia, serif" font-size="12.5" font-weight="900" letter-spacing="2.2">АКРОПОЛЬ КАПІТОЛІЯ</text>
        </g>
      </g>

      <!-- 8. ОРТОГОНАЛЬНІ РЕЙКИ ПРОГРЕСУ -->
      <g class="cf-rails-layer">
        ${railsLocked}
        ${railsSide}
        ${railsActive}
        ${rivetsSvg}
      </g>
    </svg>
  `;
}

function renderCampaignMap() {
  const ov = $("campaign-ov");
  if (!ov) return;
  stopCampaignCam();

  const isLowPower = (typeof SETTINGS !== "undefined" && (!SETTINGS.mapAnim || SETTINGS.preset === "low" || SETTINGS.gfx === "perf")) || window.matchMedia?.("(max-width: 767px)").matches;
  ov.classList.toggle("cf-lite-mode", !!isLowPower);

  const maxLvl = PROFILE.campaignMaxLvl || 1;
  const cleared = PROFILE.campaignCleared || [];
  const starsMap = PROFILE.campaignStars || {};
  const rewardsEarned = PROFILE.campaignRewards || [];
  const totalStars = Object.values(starsMap).reduce((s, v) => s + (Number(v) || 0), 0);
  const maxStars = CAMPAIGN_CHAPTER_1.length * 3;
  const mainClearedCount = CAMPAIGN_CHAPTER_1.filter(n => !n.isSide && cleared.includes(n.lvl)).length;
  const mainPct = Math.round((mainClearedCount / 10) * 100);
  const starPct = Math.round((totalStars / maxStars) * 100);

  const heroNode = getHeroHomeNode();
  const heroAvSvg = AV_SVG[PROFILE.crest || 0] || AV_SVG[0];

  const nodesHtml = CAMPAIGN_CHAPTER_1.map(n => {
    const isDone = cleared.includes(n.lvl);
    const unlocked = isCampaignNodeUnlocked(n);
    const isCurrent = unlocked && !isDone && !n.isSide && n.lvl === maxLvl;
    const isMajor = !!(n.isBoss || n.isSide);
    const stCount = starsMap[n.lvl] || (isDone ? 3 : 0);
    const rewardClaimed = rewardsEarned.includes(n.rewardId);
    const stateCls = isDone ? "is-done" : unlocked ? "is-current" : "is-locked";
    const starsHtml = isDone
      ? `<div class="cf-nd-stars">${[1, 2, 3].map(idx => `<span class="${idx <= stCount ? "lit" : ""}">${UI_IC.star}</span>`).join("")}</div>`
      : "";

    const chestHtml = isMajor
      ? `<span class="cf-map-chest ${rewardClaimed ? "claimed" : unlocked ? "ready" : "locked"}" title="${n.rewardLabel}">${rewardClaimed ? UI_IC.check : UI_IC.chest}</span>`
      : "";

    const innerGlyph = !unlocked
      ? `<span class="cf-nd-lock">${UI_IC.lock}</span>`
      : n.lvl === 10
      ? `<span class="cf-nd-glyph">${UI_IC.crown}</span>`
      : n.lvl === 4
      ? `<span class="cf-nd-glyph">${UI_IC.shield}</span>`
      : n.isSide
      ? `<span class="cf-nd-glyph">${UI_IC.diamond}</span>`
      : isDone
      ? `<span class="cf-nd-check">${UI_IC.check}</span>`
      : `<span class="cf-nd-num">${n.numLabel}</span>`;

    return `
      <button type="button"
        class="cf-ow-node ${isMajor ? "is-citadel" : "is-diamond"} ${stateCls} ${n.isBoss ? "is-boss" : ""} ${n.isSide ? "is-side" : ""}"
        data-cfnode="${n.lvl}"
        style="left:${n.x}px; top:${n.y}px;"
        title="${n.title} — ${n.boss}">
        ${starsHtml}
        ${!isLowPower ? `<span class="cf-nd-halo" aria-hidden="true"></span>` : ""}
        <div class="cf-nd-frame">
          <div class="cf-nd-inner">${innerGlyph}</div>
        </div>
        ${chestHtml}
        <div class="cf-nd-label">
          ${n.isBoss ? `<span class="cf-nd-crown-mini">${UI_IC.crown}</span>` : ""}
          <span>${n.boss}</span>
        </div>
      </button>
    `;
  }).join("");

  const trophiesHtml = CAMPAIGN_CHAPTER_1.map(n => {
    const owned = rewardsEarned.includes(n.rewardId);
    const unlocked = isCampaignNodeUnlocked(n);
    return `
      <button type="button"
        class="cf-trophy-item ${owned ? "is-owned" : unlocked ? "is-avail" : "is-locked"} ${n.isSide ? "is-side" : ""}"
        data-cfnode="${n.lvl}"
        title="${n.rewardLabel} (${n.isSide ? "Таємний рівень" : `Рівень ${n.lvl}`}: ${n.title})">
        <div class="cf-tr-vis">${getRewardMiniVisual(n)}</div>
        <span class="cf-tr-tag">${owned ? UI_IC.check : n.numLabel}</span>
      </button>
    `;
  }).join("");

  const moteCount = isLowPower ? 6 : 16;
  const motesHtml = Array.from({ length: moteCount }, (_, idx) => {
    const mx = 140 + ((idx * 251) % 1720);
    const my = 110 + ((idx * 173) % 1030);
    const msz = 4 + (idx % 2) * 2.5;
    const dur = (6 + (idx % 3) * 1.8).toFixed(1);
    const del = (-(idx * 0.8) % 7).toFixed(2);
    const dx = ((idx % 2 ? 1 : -1) * (18 + (idx % 3) * 10));
    const dy = -(22 + (idx % 3) * 14);
    return `<span class="cf-mote" style="left:${mx}px;top:${my}px;width:${msz}px;height:${msz}px;--dur:${dur}s;--del:${del}s;--dx:${dx}px;--dy:${dy}px"></span>`;
  }).join("");

  const worldSvg = buildCrownfallWorldSvg(cleared, !!isLowPower);

  ov.innerHTML = `
    <div class="cf-ow-root">
      <aside class="cf-act-banner">
        <div class="cf-ab-top-row">
          <button type="button" class="cf-ab-back" id="btn-cf-close">${UI_IC.back} МЕНЮ</button>
          <span class="cf-ab-live-pill">АКТИВНА</span>
          <button type="button" class="cf-ab-mob-chest ${totalStars >= 9 ? "has-ready" : ""}" id="btn-cf-chests-mob" title="Скрині Поліса">${UI_IC.chest}</button>
        </div>

        <div class="cf-ab-title-block">
          <div class="cf-ab-eyebrow">ШЛЯХ АРЕН · ГЛАВА I</div>
          <h2 class="cf-ab-title">МАРМУРОВИЙ ПОЛІС</h2>
        </div>

        <div class="cf-ab-progress">
          <div class="cf-ab-prog-item">
            <div class="cf-ab-prog-lbl"><span>${UI_IC.pillar} Арени</span><b>${mainClearedCount}/10</b></div>
            <div class="cf-ab-bar"><i style="width:${mainPct}%"></i></div>
          </div>
          <div class="cf-ab-prog-item">
            <div class="cf-ab-prog-lbl"><span>${UI_IC.star} Зірки</span><b class="gold">${totalStars}/${maxStars}</b></div>
            <div class="cf-ab-bar gold"><i style="width:${starPct}%"></i></div>
          </div>
        </div>

        <div class="cf-ab-milestones">
          <div class="cf-ab-sec-hdr">${UI_IC.diamond} СКРИНІ НАГОРОД</div>
          <div class="cf-ms-row ${totalStars >= 9 ? "ready" : ""}">
            <span class="cf-ms-ico">${UI_IC.chest}</span>
            <div class="cf-ms-info"><b>Скриня Новобранця</b><small>Шолом Гопліта</small></div>
            <span class="cf-ms-req">${totalStars >= 9 ? UI_IC.check : `9${UI_IC.star}`}</span>
          </div>
          <div class="cf-ms-row ${totalStars >= 21 ? "ready" : ""}">
            <span class="cf-ms-ico">${UI_IC.urn}</span>
            <div class="cf-ms-info"><b>Скарб Агори</b><small>Нефритовий Ліс</small></div>
            <span class="cf-ms-req">${totalStars >= 21 ? UI_IC.check : `21${UI_IC.star}`}</span>
          </div>
          <div class="cf-ms-row ${totalStars >= 33 ? "ready" : ""}">
            <span class="cf-ms-ico">${UI_IC.crown}</span>
            <div class="cf-ms-info"><b>Лавр Центуріона</b><small>Підкорювач Поліса</small></div>
            <span class="cf-ms-req">${totalStars >= 33 ? UI_IC.check : `33${UI_IC.star}`}</span>
          </div>
        </div>
      </aside>

      <div id="cf-chests-slot"></div>

      <div class="cf-cam-controls" aria-label="Керування камерою">
        <button type="button" class="cf-cam-btn" id="btn-cam-in" title="Наблизити (+)">+</button>
        <button type="button" class="cf-cam-btn" id="btn-cam-out" title="Віддалити (−)">−</button>
        <button type="button" class="cf-cam-btn" id="btn-cam-reset" title="Центрувати на герої">${UI_IC.target}</button>
      </div>

      <div class="cf-viewport" id="cf-viewport">
        <div class="cf-world" id="cf-world" style="width:2000px; height:1250px;">
          ${worldSvg}
          <div class="cf-motes-layer" aria-hidden="true">${motesHtml}</div>

          <div class="cf-hero-token" id="cf-hero-token" style="left:${heroNode.x}px; top:${heroNode.y}px;" aria-hidden="true">
            <div class="cf-ht-aura"></div>
            <div class="cf-ht-crown">${UI_IC.crown}</div>
            <div class="cf-ht-disc">${heroAvSvg}</div>
            <div class="cf-ht-pin"></div>
          </div>

          ${nodesHtml}
        </div>
      </div>

      <div id="cf-zoom-card-slot"></div>

      <div class="cf-trophy-rail" id="cf-trophy-rail">
        <div class="cf-tr-hdr">
          <span>ГЛАВА I</span>
          <b>ТРОФЕЇ (${rewardsEarned.length}/${CAMPAIGN_CHAPTER_1.length})</b>
        </div>
        <div class="cf-tr-list">${trophiesHtml}</div>
      </div>

      <div class="cf-hint-bar" id="cf-hint-bar">Клікни на вузол · Коліщатко / 2 пальці — зум · Перетягуй архіпелаг</div>
    </div>
  `;

  initCampaignCameraAndEvents();
  if (window._cfZoomedLvl) {
    selectCampaignNode(window._cfZoomedLvl, false);
  }
}

function initCampaignCameraAndEvents() {
  const closeBtn = $("btn-cf-close");
  if (closeBtn) closeBtn.onclick = closeCampaignMap;

  const chestsMobBtn = $("btn-cf-chests-mob");
  if (chestsMobBtn) {
    chestsMobBtn.onclick = (ev) => {
      ev.stopPropagation();
      window._cfShowChests = !window._cfShowChests;
      snd("throw");
      updateCampaignChestsUI();
    };
  }

  document.querySelectorAll(".cf-trophy-item[data-cfnode]").forEach(btn => {
    btn.onclick = (ev) => {
      ev.stopPropagation();
      const lvl = parseInt(btn.getAttribute("data-cfnode"), 10) || 1;
      selectCampaignNode(lvl, false);
    };
  });

  const vp = $("cf-viewport");
  const world = $("cf-world");
  if (!vp || !world) return;

  const MAP_W = 2000, MAP_H = 1250;
  const vw = () => vp.clientWidth || window.innerWidth;
  const vh = () => vp.clientHeight || window.innerHeight;
  const minScale = () => Math.max(0.42, Math.min(vw() / MAP_W, vh() / MAP_H) * 0.92);
  const overviewScale = () => Math.max(minScale(), Math.min(0.95, Math.max(vw() / MAP_W, vh() / MAP_H) * 0.86));
  const MAX_SCALE = 2.05;

  const clampTarget = (tx, ty, sc) => {
    const w = vw(), h = vh();
    const scaledW = MAP_W * sc;
    const scaledH = MAP_H * sc;
    const isDesktop = w >= 840;
    const padLeft = isDesktop ? 310 : Math.min(110, w * 0.18);
    const padRight = isDesktop ? 400 : Math.min(110, w * 0.18);
    const padTop = isDesktop ? 90 : 120;
    const padBottom = isDesktop ? 140 : 190;
    let cx, cy;
    if (scaledW <= w - (isDesktop ? 260 : 0)) {
      cx = isDesktop ? 250 + (w - 250 - scaledW) / 2 : (w - scaledW) / 2;
    } else {
      cx = Math.max(w - scaledW - padRight, Math.min(padLeft, tx));
    }
    if (scaledH <= h) {
      cy = (h - scaledH) / 2;
    } else {
      cy = Math.max(h - scaledH - padBottom, Math.min(padTop, ty));
    }
    return { x: cx, y: cy };
  };

  const focusNode = getHeroHomeNode();
  const initSc = overviewScale();
  const isDeskInit = vw() >= 840;
  const initAnchorX = isDeskInit ? (vw() + 240) * 0.5 : vw() * 0.5;
  const initPos = clampTarget(initAnchorX - focusNode.x * initSc, vh() * 0.52 - focusNode.y * initSc, initSc);

  let dirty = true;
  let lastAppliedStr = "";
  const applyWorldTransform = () => {
    const str = `translate3d(${cam.x.toFixed(1)}px, ${cam.y.toFixed(1)}px, 0) scale(${cam.scale.toFixed(3)})`;
    if (str !== lastAppliedStr) {
      lastAppliedStr = str;
      world.style.transform = str;
    }
  };

  const cam = {
    x: initPos.x, y: initPos.y, scale: initSc * 0.92,
    tx: initPos.x, ty: initPos.y, tscale: initSc,
    vx: 0, vy: 0,
    isDragging: false,
    isPinching: false,
    raf: 0,
    vw, vh, overviewScale,
    flyTo(wx, wy, sc, anchorX, anchorY) {
      const clampedSc = Math.max(minScale(), Math.min(MAX_SCALE, sc));
      const ax = anchorX !== undefined ? anchorX : vw() * 0.5;
      const ay = anchorY !== undefined ? anchorY : vh() * 0.5;
      const clamped = clampTarget(ax - wx * clampedSc, ay - wy * clampedSc, clampedSc);
      cam.vx = 0; cam.vy = 0;
      cam.tscale = clampedSc;
      cam.tx = clamped.x;
      cam.ty = clamped.y;
      dirty = true;
    },
    zoomAt(screenX, screenY, factor) {
      const nextSc = Math.max(minScale(), Math.min(MAX_SCALE, cam.tscale * factor));
      const ratio = nextSc / cam.tscale;
      const rawTx = screenX - (screenX - cam.tx) * ratio;
      const rawTy = screenY - (screenY - cam.ty) * ratio;
      const clamped = clampTarget(rawTx, rawTy, nextSc);
      cam.vx = 0; cam.vy = 0;
      cam.tscale = nextSc;
      cam.tx = clamped.x;
      cam.ty = clamped.y;
      dirty = true;
    },
    resetView() {
      const n = getHeroHomeNode();
      const isDesk = vw() >= 840;
      const ax = isDesk ? (vw() + 240) * 0.5 : vw() * 0.5;
      cam.flyTo(n.x, n.y, overviewScale(), ax, vh() * 0.5);
    }
  };

  applyWorldTransform();

  let lastTime = performance.now();
  const loop = (now) => {
    const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
    lastTime = now;

    const hasVel = !cam.isDragging && !cam.isPinching && (Math.abs(cam.vx) > 0.5 || Math.abs(cam.vy) > 0.5);
    if (hasVel) {
      dirty = true;
      cam.tx += cam.vx * dt;
      cam.ty += cam.vy * dt;
      const cl = clampTarget(cam.tx, cam.ty, cam.tscale);
      if (cl.x !== cam.tx) cam.vx *= 0.3;
      if (cl.y !== cam.ty) cam.vy *= 0.3;
      cam.tx = cl.x; cam.ty = cl.y;
      const decay = Math.pow(0.0018, dt);
      cam.vx *= decay;
      cam.vy *= decay;
    }

    const dx = cam.tx - cam.x;
    const dy = cam.ty - cam.y;
    const ds = cam.tscale - cam.scale;

    if (dirty || cam.isDragging || cam.isPinching || Math.abs(dx) > 0.08 || Math.abs(dy) > 0.08 || Math.abs(ds) > 0.0005) {
      const smooth = (cam.isDragging || cam.isPinching) ? 1 - Math.exp(-34 * dt) : 1 - Math.exp(-11 * dt);
      cam.x += dx * smooth;
      cam.y += dy * smooth;
      cam.scale += ds * smooth;
      applyWorldTransform();
      if (!cam.isDragging && !cam.isPinching && !hasVel && Math.abs(cam.tx - cam.x) <= 0.08 && Math.abs(cam.ty - cam.y) <= 0.08 && Math.abs(cam.tscale - cam.scale) <= 0.0005) {
        cam.x = cam.tx;
        cam.y = cam.ty;
        cam.scale = cam.tscale;
        applyWorldTransform();
        dirty = false;
      }
    }

    cam.raf = requestAnimationFrame(loop);
  };
  cam.raf = requestAnimationFrame(loop);

  const pointers = new Map();
  let dragStartX = 0, dragStartY = 0, startTx = 0, startTy = 0;
  let lastMoveX = 0, lastMoveY = 0, lastMoveT = 0;
  let movedDist = 0;
  let pinchDist0 = 0, pinchScale0 = 1, pinchMidWorldX = 0, pinchMidWorldY = 0;
  let lastTapTime = 0, lastTapX = 0, lastTapY = 0;
  let downNodeBtn = null;
  let capturedPid = null;
  let lastNodeActivateAt = 0;

  const activateCampaignNode = (nodeBtn) => {
    if (!nodeBtn) return;
    const now = performance.now();
    if (now - lastNodeActivateAt < 220) return;
    lastNodeActivateAt = now;
    const r = nodeBtn.getBoundingClientRect();
    campaignSparkBurst(r.left + r.width / 2, r.top + r.height / 2, ["#fde047", "#34d399", "#ffffff", "#fbbf24"]);
    const lvl = parseInt(nodeBtn.getAttribute("data-cfnode"), 10) || 1;
    if (window._cfZoomedLvl === lvl) {
      selectCampaignNode(null, true);
    } else {
      selectCampaignNode(lvl, false);
    }
  };

  const getPinchInfo = () => {
    const pts = Array.from(pointers.values());
    const dx = pts[1].x - pts[0].x;
    const dy = pts[1].y - pts[0].y;
    return {
      dist: Math.hypot(dx, dy) || 1,
      mx: (pts[0].x + pts[1].x) / 2,
      my: (pts[0].y + pts[1].y) / 2
    };
  };

  const isOverlayUI = (target) => !!(
    target && target.closest &&
    (target.closest(".cf-duel-card") || target.closest(".cf-chests-pop") || target.closest(".cf-act-banner") || target.closest(".cf-trophy-rail") || target.closest(".cf-cam-controls"))
  );

  const onPointerDown = (e) => {
    if (isOverlayUI(e.target)) return;
    if (e.button !== undefined && e.button !== 0 && e.pointerType === "mouse") return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size === 1) {
      downNodeBtn = e.target && e.target.closest ? e.target.closest(".cf-ow-node[data-cfnode]") : null;
      cam.isDragging = true;
      cam.isPinching = false;
      cam.vx = 0; cam.vy = 0;
      dragStartX = lastMoveX = e.clientX;
      dragStartY = lastMoveY = e.clientY;
      lastMoveT = performance.now();
      startTx = cam.tx;
      startTy = cam.ty;
      movedDist = 0;
      dirty = true;
    } else if (pointers.size === 2) {
      downNodeBtn = null;
      cam.isDragging = false;
      cam.isPinching = true;
      cam.vx = 0; cam.vy = 0;
      const info = getPinchInfo();
      pinchDist0 = info.dist;
      pinchScale0 = cam.tscale;
      pinchMidWorldX = (info.mx - cam.tx) / cam.tscale;
      pinchMidWorldY = (info.my - cam.ty) / cam.tscale;
      dirty = true;
    }
  };

  const onPointerMove = (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size === 2 && cam.isPinching) {
      const info = getPinchInfo();
      const nextSc = Math.max(minScale(), Math.min(MAX_SCALE, pinchScale0 * (info.dist / pinchDist0)));
      const cl = clampTarget(info.mx - pinchMidWorldX * nextSc, info.my - pinchMidWorldY * nextSc, nextSc);
      cam.tscale = nextSc;
      cam.tx = cl.x;
      cam.ty = cl.y;
      movedDist = 999;
      dirty = true;
    } else if (pointers.size === 1 && cam.isDragging) {
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      movedDist = Math.max(movedDist, Math.hypot(dx, dy));
      if (movedDist > 6 && capturedPid === null) {
        downNodeBtn = null;
        capturedPid = e.pointerId;
        try { vp.setPointerCapture(e.pointerId); } catch (_) {}
      }
      if (movedDist <= 6) return;
      const cl = clampTarget(startTx + dx, startTy + dy, cam.tscale);
      cam.tx = cl.x;
      cam.ty = cl.y;
      dirty = true;

      const now = performance.now();
      const dtMs = Math.max(8, now - lastMoveT);
      cam.vx = ((e.clientX - lastMoveX) / dtMs) * 1000;
      cam.vy = ((e.clientY - lastMoveY) / dtMs) * 1000;
      lastMoveX = e.clientX;
      lastMoveY = e.clientY;
      lastMoveT = now;
    }
  };

  const onPointerUp = (e) => {
    const wasPinch = cam.isPinching;
    const savedNode = downNodeBtn;
    downNodeBtn = null;
    pointers.delete(e.pointerId);
    if (capturedPid === e.pointerId) {
      capturedPid = null;
      try { vp.releasePointerCapture(e.pointerId); } catch (_) {}
    }

    if (pointers.size < 2) cam.isPinching = false;
    if (pointers.size === 1) {
      const rem = Array.from(pointers.values())[0];
      cam.isDragging = true;
      dragStartX = lastMoveX = rem.x;
      dragStartY = lastMoveY = rem.y;
      startTx = cam.tx;
      startTy = cam.ty;
      dirty = true;
      return;
    }

    cam.isDragging = false;
    if (performance.now() - lastMoveT > 90) { cam.vx = 0; cam.vy = 0; }
    dirty = true;

    if (!wasPinch && movedDist < 10) {
      const hitEl = document.elementFromPoint ? document.elementFromPoint(e.clientX, e.clientY) : null;
      const nodeBtn = savedNode
        || (e.target && e.target.closest ? e.target.closest(".cf-ow-node[data-cfnode]") : null)
        || (hitEl && hitEl.closest ? hitEl.closest(".cf-ow-node[data-cfnode]") : null);
      if (nodeBtn) {
        activateCampaignNode(nodeBtn);
        return;
      }

      if (window._cfShowChests) {
        window._cfShowChests = false;
        updateCampaignChestsUI();
        return;
      }
      if (window._cfZoomedLvl) {
        selectCampaignNode(null, true);
        return;
      }

      const now = performance.now();
      if (now - lastTapTime < 300 && Math.hypot(e.clientX - lastTapX, e.clientY - lastTapY) < 42) {
        const targetFactor = cam.tscale < 1.15 ? 1.55 : (overviewScale() / cam.tscale);
        cam.zoomAt(e.clientX, e.clientY, targetFactor);
        lastTapTime = 0;
      } else {
        lastTapTime = now;
        lastTapX = e.clientX;
        lastTapY = e.clientY;
      }
    }
  };

  const onNodeClickFallback = (e) => {
    if (movedDist >= 10) return;
    const nodeBtn = e.target && e.target.closest ? e.target.closest(".cf-ow-node[data-cfnode]") : null;
    if (nodeBtn) {
      e.stopPropagation();
      activateCampaignNode(nodeBtn);
    }
  };

  const onWheel = (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.16 : 1 / 1.16;
    cam.zoomAt(e.clientX, e.clientY, factor);
  };

  const onResize = () => {
    const cl = clampTarget(cam.tx, cam.ty, Math.max(minScale(), cam.tscale));
    cam.tx = cl.x; cam.ty = cl.y;
    cam.tscale = Math.max(minScale(), cam.tscale);
    dirty = true;
  };

  vp.addEventListener("pointerdown", onPointerDown);
  vp.addEventListener("pointermove", onPointerMove);
  vp.addEventListener("pointerup", onPointerUp);
  vp.addEventListener("pointercancel", onPointerUp);
  vp.addEventListener("click", onNodeClickFallback);
  vp.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("resize", onResize);

  const btnIn = $("btn-cam-in");
  const btnOut = $("btn-cam-out");
  const btnReset = $("btn-cam-reset");
  if (btnIn) btnIn.onclick = (e) => { e.stopPropagation(); cam.zoomAt(vw() / 2, vh() / 2, 1.28); snd("throw"); };
  if (btnOut) btnOut.onclick = (e) => { e.stopPropagation(); cam.zoomAt(vw() / 2, vh() / 2, 1 / 1.28); snd("throw"); };
  if (btnReset) btnReset.onclick = (e) => {
    e.stopPropagation();
    window._cfZoomedLvl = null;
    updateCampaignNodeSelectionUI();
    cam.resetView();
    snd("swap");
  };

  cam.cleanup = () => {
    vp.removeEventListener("pointerdown", onPointerDown);
    vp.removeEventListener("pointermove", onPointerMove);
    vp.removeEventListener("pointerup", onPointerUp);
    vp.removeEventListener("pointercancel", onPointerUp);
    vp.removeEventListener("click", onNodeClickFallback);
    vp.removeEventListener("wheel", onWheel);
    window.removeEventListener("resize", onResize);
  };
  _pxCam = cam;
}

function openProfileModal() {
  const ov = $("profile-ov");
  if (!ov) return;
  renderProfileModal();
  ov.classList.add("open");
  ov.setAttribute("aria-hidden", "false");
  snd("swap");
}

function closeProfileModal() {
  const ov = $("profile-ov");
  if (!ov) return;
  ov.classList.remove("open");
  ov.setAttribute("aria-hidden", "true");
  snd("throw");
  if ($("ov") && $("ov").style.display !== "none") {
    renderBentoHub("");
  }
}

function renderProfileModal() {
  const ov = $("profile-ov");
  if (!ov) return;
  const fav = getFavoriteCard();
  const favName = cardName(fav);
  const favIcon = iconFor(fav);
  const favRarityCol = (R[fav.r] && R[fav.r].c) ? R[fav.r].c : "#fbbf24";
  const winRate = PROFILE.games > 0 ? Math.round((PROFILE.wins / PROFILE.games) * 100) : 0;
  const autoRank = PROFILE.wins >= 15 ? "Чемпіон Олімпу" : PROFILE.wins >= 7 ? "Ветеран Арени" : PROFILE.wins >= 2 ? "Загартований Дуелянт" : "Шукач Слави";
  const rankTitle = PROFILE.activeTitle || autoRank;
  const curLeague = getLeagueForTrophies(PROFILE.trophies || 0);

  const lockTipFor = (lock, name) => {
    if (!lock.locked) return name;
    if (lock.source === "campaign" && lock.campNode) {
      const cn = lock.campNode;
      return cn.isSide
        ? `Заблоковано: Таємне випробування «${cn.title}» у «Шляху Арен»`
        : `Заблоковано: пройди рівень ${cn.lvl} («${cn.title}») у «Шляху Арен»`;
    }
    return `Заблоковано: потрібно ${lock.req} кубків на Дорозі Олімпу`;
  };
  const lockDataAttr = (lock) => lock.locked ? `${lock.source}:${lock.req}` : "";

  const avatarBtns = AVATARS.map((av, idx) => {
    const lock = getGloryLockInfo("avatar", av.id);
    const tip = lockTipFor(lock, av.name);
    const clsSrc = lock.locked && lock.source === "campaign" ? " is-camp-lock" : "";
    return `
      <button type="button" class="av-pick-btn ${PROFILE.crest === idx ? "act" : ""} ${lock.locked ? "is-locked" + clsSrc : ""}"
              data-crest="${idx}" data-locked="${lockDataAttr(lock)}" title="${tip}">
        ${av.svg}
        ${lock.locked ? `<span class="cos-lock-badge${clsSrc}">${UI_IC.lock} ${lock.source === "campaign" ? (lock.campNode?.isSide ? UI_IC.star : "Р." + lock.req) : lock.req}</span>` : ""}
      </button>`;
  }).join("");

  const bannerBtns = PL_BANNERS.map((bn, idx) => {
    const lock = getGloryLockInfo("banner", bn.id);
    const tip = lockTipFor(lock, bn.name);
    const clsSrc = lock.locked && lock.source === "campaign" ? " is-camp-lock" : "";
    return `
      <button type="button" class="bn-pick-btn banner-${bn.id} ${(PROFILE.banner || 0) === idx ? "act" : ""} ${lock.locked ? "is-locked" + clsSrc : ""}"
              data-banner="${idx}" data-locked="${lockDataAttr(lock)}" title="${tip}">
        <span class="bn-swatch" style="background:${bn.preview}"></span>
        <span class="bn-lbl">${bn.name}</span>
        ${lock.locked ? `<span class="cos-lock-tag${clsSrc}">${UI_IC.lock} ${lock.badge}</span>` : ""}
      </button>`;
  }).join("");

  const curBack = CARD_BACKS.find(c => c.id === (PROFILE.cardBack || "classic")) || CARD_BACKS[0];
  const cardBackBtns = CARD_BACKS.map(cb => {
    const lock = getGloryLockInfo("cardBack", cb.id);
    const tip = lock.locked ? lockTipFor(lock, cb.name) : `${cb.name} — ${cb.desc}`;
    return `
      <button type="button" class="cb-pick-btn ${(PROFILE.cardBack || "classic") === cb.id ? "act" : ""} ${lock.locked ? "is-locked" : ""}"
              data-cback="${cb.id}" data-locked="${lockDataAttr(lock)}" title="${tip}">
        <span class="cb-mini-card cback-${cb.id}">${backSvg("s", cb.id)}</span>
        <span class="cb-meta">
          <span class="cb-lbl">${cb.name}</span>
          ${lock.locked ? `<span class="cos-lock-tag">${UI_IC.lock} ${lock.badge}</span>` : `<span class="cb-sub">${(PROFILE.cardBack || "classic") === cb.id ? "Обрано" : "Доступно"}</span>`}
        </span>
      </button>`;
  }).join("");

  const titleBtns = [
    { id: "", name: "Авто-ранг", locked: false, source: null, req: 0, badge: "", campNode: null, color: "#cbd5e1" },
    ...PROFILE_TITLES.map(t => {
      const lock = getGloryLockInfo("title", t.id);
      return { ...t, locked: lock.locked, source: lock.source, req: lock.req, badge: lock.badge, campNode: lock.campNode };
    })
  ].map(t => {
    const val = t.id ? t.name : "";
    const isAct = (PROFILE.activeTitle || "") === val;
    const tip = lockTipFor(t, t.name);
    const clsSrc = t.locked && t.source === "campaign" ? " is-camp-lock" : "";
    return `
      <button type="button" class="ttl-pick-btn ${isAct ? "act" : ""} ${t.locked ? "is-locked" + clsSrc : ""}"
              data-title-val="${val}" data-locked="${lockDataAttr(t)}"
              style="--ttl-c:${t.color}" title="${tip}">
        <span>${t.locked ? `${UI_IC.lock} ` : `${UI_IC.diamond} `}${t.name}</span>
        ${t.locked ? `<small>${t.badge}</small>` : ""}
      </button>`;
  }).join("");

  const livePlaqueHtml = buildPlayerPlaqueHtml({
    id: "menu-pl-preview",
    nick: PROFILE.name || "ТИ",
    crestIdx: PROFILE.crest || 0,
    bannerIdx: PROFILE.banner || 0,
    hpText: `100 ${UI_IC.heart} · 10 ${UI_IC.card}`,
    isMenuPreview: true
  });

  ov.innerHTML = `
    <div class="set-modal prof-modal">
      <div class="set-head">
        <div class="set-title-wrap">
          <span class="set-ico">${UI_IC.shield}</span>
          <div>
            <div class="set-title">ПРОФІЛЬ ДУЕЛЯНТА</div>
            <div class="set-sub">Статистика, ліга, аватари, щити, сорочки та титули</div>
          </div>
        </div>
        <button type="button" class="icon-btn" id="prof-close">${UI_IC.close}</button>
      </div>

      <div class="set-body prof-modal-body">
        <div class="prof-hero-row">
          <div class="dock-live-plaque-wrap">
            ${livePlaqueHtml}
          </div>
          <div class="prof-hero-meta">
            <div class="prof-badges-line">
              <div class="prof-rank-pill" id="prof-rank-pill">${UI_IC.diamond} ${rankTitle}</div>
              <button type="button" class="prof-league-mini" id="prof-open-glory" style="--lg-col:${curLeague.color}" title="Відкрити Дорогу Олімпу">
                ${curLeague.icon()}<span>${PROFILE.trophies || 0} ${UI_IC.trophy} · ${curLeague.name}</span>
              </button>
            </div>
            <div class="prof-stats-grid-4">
              <div class="dock-stat">
                <span class="ds-lbl">Перемоги</span>
                <b class="ds-val">${PROFILE.wins} <small>(${winRate}%)</small></b>
              </div>
              <div class="dock-stat">
                <span class="ds-lbl">Серія</span>
                <b class="ds-val">${UI_IC.fire} ${PROFILE.streak}</b>
              </div>
              <div class="dock-stat">
                <span class="ds-lbl">Макс. удар</span>
                <b class="ds-val">${PROFILE.bestHit > 0 ? "−" + PROFILE.bestHit : "—"}</b>
              </div>
              <div class="dock-stat fav-stat" style="--fav-c:${favRarityCol}">
                <span class="ds-lbl">Улюблена</span>
                <b class="ds-val ds-fav">${favIcon}<span>${favName}</span></b>
              </div>
            </div>
          </div>
        </div>

        ${window.DCARD_CLOUD ? DCARD_CLOUD.renderProfileCloudCardHtml() : ""}
        <div class="prof-lock-hint" id="prof-lock-hint" style="display:none"></div>

        <div class="set-section">
          <div class="set-sec-lbl">${UI_IC.mask} АВАТАР <span class="prof-sec-cur" id="prof-av-cur">(${AVATARS[PROFILE.crest || 0]?.name || "Корона Олімпу"})</span></div>
          <div class="av-picker-row prof-av-grid" id="av-picker-row">${avatarBtns}</div>
        </div>

        <div class="set-section">
          <div class="set-sec-lbl">${UI_IC.shield} СКІН ЩИТА-ШТАНДАРТА <span class="prof-sec-cur" id="prof-bn-cur">(${PL_BANNERS[PROFILE.banner || 0]?.name || "Темний Обсидіан"})</span></div>
          <div class="bn-picker-row prof-bn-grid" id="bn-picker-row">${bannerBtns}</div>
        </div>

        <div class="set-section">
          <div class="set-sec-lbl">${UI_IC.card} СОРОЧКА КАРТ <span class="prof-sec-cur" id="prof-cb-cur">(${curBack.name})</span></div>
          <div class="cb-picker-grid" id="cb-picker-row">${cardBackBtns}</div>
        </div>

        <div class="set-section">
          <div class="set-sec-lbl">${UI_IC.crown} ТИТУЛ ПІД НІКНЕЙМ</div>
          <div class="ttl-picker-row" id="ttl-picker-row">${titleBtns}</div>
        </div>
        ${window.DCARD_CLOUD ? DCARD_CLOUD.renderProfileHistoryHtml() : ""}
      </div>
    </div>
  `;

  ov.onclick = (ev) => {
    if (ev.target === ov) closeProfileModal();
  };
  const closeBtn = $("prof-close");
  if (closeBtn) closeBtn.onclick = closeProfileModal;
  if (window.DCARD_CLOUD) DCARD_CLOUD.bindProfileCloudEvents();

  const openGlBtn = $("prof-open-glory");
  if (openGlBtn) {
    openGlBtn.onclick = () => {
      closeProfileModal();
      openGloryModal();
    };
  }

  const showLockHint = (lockSpec, btn) => {
    snd("thud");
    btn.classList.remove("lock-shake");
    void btn.offsetWidth;
    btn.classList.add("lock-shake");
    const hint = $("prof-lock-hint");
    if (!hint) return;
    const [src, rawReq] = String(lockSpec || "").split(":");
    const req = Number(rawReq || lockSpec || 0);
    hint.style.display = "flex";
    if (src === "campaign") {
      const cn = typeof CAMPAIGN_CHAPTER_1 !== "undefined" ? CAMPAIGN_CHAPTER_1.find(n => n.lvl === req) : null;
      const lvlDesc = cn
        ? (cn.isSide ? `таємне випробування <b>«${cn.title}»</b>` : `рівень <b>${cn.lvl} («${cn.title}»)</b>`)
        : `рівень <b>${req}</b>`;
      hint.innerHTML = `${UI_IC.map} Пройди ${lvlDesc} у кампанії <b>«Шлях Арен»</b>, щоб отримати цю нагороду.`;
    } else {
      const diff = Math.max(0, req - (PROFILE.trophies || 0));
      hint.innerHTML = diff > 0
        ? `${UI_IC.lock} Потрібно <b>${req} ${UI_IC.trophy}</b> на «Дорозі Олімпу» (залишилось ще <b>${diff} ${UI_IC.trophy}</b>).`
        : `${UI_IC.sparkle} Поріг <b>${req} ${UI_IC.trophy}</b> досягнуто! Забери цю нагороду на <b>«Дорозі Олімпу»</b>.`;
    }
  };

  const nameInp = $("prof-name-inp");
  if (nameInp) {
    nameInp.oninput = () => {
      PROFILE.name = (nameInp.value || "").slice(0, 14);
      saveProfile();
    };
    nameInp.onblur = () => {
      if (!PROFILE.name.trim()) PROFILE.name = "ТИ";
      nameInp.value = PROFILE.name;
      saveProfile();
    };
  }

  const refreshLivePreview = () => {
    const prevEl = $("menu-pl-preview");
    if (!prevEl) return;
    const bId = (PL_BANNERS[PROFILE.banner || 0] && PL_BANNERS[PROFILE.banner || 0].id) || "obsidian";
    prevEl.className = `pl pl-medallion banner-${bId} pl-preview-card`;
    prevEl.setAttribute("data-banner-id", bId);
    const avWrap = prevEl.querySelector(".pl-av-wrap");
    if (avWrap) avWrap.innerHTML = AV_SVG[PROFILE.crest || 0] || AV_SVG[0];
    if ($("prof-av-cur")) $("prof-av-cur").textContent = `(${AVATARS[PROFILE.crest || 0]?.name || ""})`;
    if ($("prof-bn-cur")) $("prof-bn-cur").textContent = `(${PL_BANNERS[PROFILE.banner || 0]?.name || ""})`;
    const cbObj = CARD_BACKS.find(c => c.id === (PROFILE.cardBack || "classic")) || CARD_BACKS[0];
    if ($("prof-cb-cur")) $("prof-cb-cur").textContent = `(${cbObj.name})`;
    if ($("prof-rank-pill")) $("prof-rank-pill").innerHTML = `${UI_IC.diamond} ${PROFILE.activeTitle || autoRank}`;
  };

  ov.querySelectorAll("[data-crest]").forEach(btn => {
    btn.onclick = (ev) => {
      ev.stopPropagation();
      const lockReq = btn.getAttribute("data-locked");
      if (lockReq) { showLockHint(lockReq, btn); return; }
      PROFILE.crest = parseInt(btn.getAttribute("data-crest"), 10) || 0;
      saveProfile();
      refreshLivePreview();
      ov.querySelectorAll("[data-crest]").forEach(b => b.classList.toggle("act", b === btn));
      snd("throw");
    };
  });

  ov.querySelectorAll("[data-banner]").forEach(btn => {
    btn.onclick = (ev) => {
      ev.stopPropagation();
      const lockReq = btn.getAttribute("data-locked");
      if (lockReq) { showLockHint(lockReq, btn); return; }
      PROFILE.banner = parseInt(btn.getAttribute("data-banner"), 10) || 0;
      saveProfile();
      refreshLivePreview();
      ov.querySelectorAll("[data-banner]").forEach(b => b.classList.toggle("act", b === btn));
      snd("throw");
    };
  });

  ov.querySelectorAll("[data-cback]").forEach(btn => {
    btn.onclick = (ev) => {
      ev.stopPropagation();
      const lockReq = btn.getAttribute("data-locked");
      if (lockReq) { showLockHint(lockReq, btn); return; }
      PROFILE.cardBack = btn.getAttribute("data-cback") || "classic";
      saveProfile();
      refreshLivePreview();
      ov.querySelectorAll("[data-cback]").forEach(b => {
        const isMe = b === btn;
        b.classList.toggle("act", isMe);
        const sub = b.querySelector(".cb-sub");
        if (sub) sub.textContent = isMe ? "Обрано" : "Доступно";
      });
      snd("throw");
    };
  });

  ov.querySelectorAll("[data-title-val]").forEach(btn => {
    btn.onclick = (ev) => {
      ev.stopPropagation();
      const lockReq = btn.getAttribute("data-locked");
      if (lockReq) { showLockHint(lockReq, btn); return; }
      PROFILE.activeTitle = btn.getAttribute("data-title-val") || "";
      saveProfile();
      refreshLivePreview();
      ov.querySelectorAll("[data-title-val]").forEach(b => b.classList.toggle("act", b === btn));
      snd("throw");
    };
  });

  const med = $("prof-medallion");
  if (med) {
    med.onclick = () => {
      const unlockedIdxs = AVATARS.map((av, idx) => (!getGloryLockInfo("avatar", av.id).locked ? idx : -1)).filter(i => i >= 0);
      if (!unlockedIdxs.length) return;
      const curPos = unlockedIdxs.indexOf(PROFILE.crest || 0);
      PROFILE.crest = unlockedIdxs[(curPos + 1) % unlockedIdxs.length];
      saveProfile();
      refreshLivePreview();
      ov.querySelectorAll("[data-crest]").forEach(b => b.classList.toggle("act", parseInt(b.getAttribute("data-crest"), 10) === PROFILE.crest));
      snd("throw");
    };
  }
}

// ===== МОДАЛЬНЕ ВІКНО «ДОРОГА ОЛІМПУ» (GLORY ROAD) =====
let _rewardRevealDoneCb = null;

function closeRewardRevealModal() {
  const ov = $("reward-reveal-ov");
  if (!ov || !ov.classList.contains("open")) return;
  ov.classList.remove("open");
  ov.setAttribute("aria-hidden", "true");
  setTimeout(() => { if (!ov.classList.contains("open")) ov.innerHTML = ""; }, 260);
  const cb = _rewardRevealDoneCb;
  _rewardRevealDoneCb = null;
  if (typeof cb === "function") cb();
}

function showRewardRevealModal(reward, opts = {}) {
  const ov = $("reward-reveal-ov");
  if (!ov || !reward) {
    if (typeof opts.onClose === "function") opts.onClose();
    return;
  }
  _rewardRevealDoneCb = opts.onClose || null;

  const type = reward.type;
  const itemId = reward.itemId;
  const label = reward.label || "Нова нагорода";
  const catMap = {
    cardBack: "СОРОЧКА КАРТ",
    avatar: "НОВИЙ АВАТАР",
    banner: "ЩИТ-ШТАНДАРТ",
    title: "ПОЧЕСНИЙ ТИТУЛ"
  };
  const catLabel = reward.cat ? String(reward.cat).toUpperCase() : (catMap[type] || "НАГОРОДА");
  const sourceLabel = opts.sourceLabel || "ДОРОГА ОЛІМПУ";
  const subText = opts.subtitle || "Додано до твоєї колекції в Профілі";

  let showcaseHtml = "";
  let accentCol = "#fde047";
  if (type === "cardBack") {
    const cbObj = CARD_BACKS.find(c => c.id === itemId);
    accentCol = cbObj?.accent || "#fde047";
    showcaseHtml = `
      <div class="rr-stage rr-type-cardBack">
        <div class="rr-burst-ring"></div>
        <div class="rr-card-3d-wrap">
          <div class="rr-card-3d cback-${itemId}">
            ${backSvg("s", itemId)}
            <span class="rr-card-sheen"></span>
          </div>
        </div>
      </div>`;
  } else if (type === "avatar") {
    const av = AVATARS.find(a => a.id === itemId);
    accentCol = "#38bdf8";
    showcaseHtml = `
      <div class="rr-stage rr-type-avatar">
        <div class="rr-burst-ring"></div>
        <div class="rr-burst-ring r2"></div>
        <div class="rr-avatar-orb">
          <div class="rr-avatar-inner">${av ? av.svg : AV_SVG[0]}</div>
          <span class="rr-orbit-star s1">${UI_IC.diamond}</span>
          <span class="rr-orbit-star s2">${UI_IC.diamond}</span>
          <span class="rr-orbit-star s3">${UI_IC.star}</span>
        </div>
      </div>`;
  } else if (type === "banner") {
    const bn = PL_BANNERS.find(b => b.id === itemId);
    accentCol = "#f59e0b";
    showcaseHtml = `
      <div class="rr-stage rr-type-banner">
        <div class="rr-burst-ring"></div>
        <div class="rr-shield-drop banner-${itemId}">
          <div class="rr-shield-body" style="background:${bn ? bn.preview : "#1e293b"}">
            <span class="rr-shield-sheen"></span>
          </div>
        </div>
      </div>`;
  } else {
    const tObj = PROFILE_TITLES.find(x => x.id === itemId);
    accentCol = tObj?.color || "#fde047";
    showcaseHtml = `
      <div class="rr-stage rr-type-title">
        <div class="rr-burst-ring"></div>
        <div class="rr-title-ribbon" style="--ttl-c:${accentCol}">
          <span class="rr-ribbon-orn">${UI_IC.diamond}</span>
          <b>«${label}»</b>
          <span class="rr-ribbon-orn">${UI_IC.diamond}</span>
        </div>
      </div>`;
  }

  const alreadyEquipped = isGloryRewardEquipped({ type, itemId, label });

  ov.innerHTML = `
    <div class="rr-backdrop"></div>
    <div class="rr-rays" style="--rr-col:${accentCol}"></div>
    <div class="rr-modal" style="--rr-col:${accentCol}">
      <div class="rr-eyebrow">${UI_IC.diamond} ${sourceLabel} · ВИ ОТРИМАЛИ ${UI_IC.diamond}</div>
      <div class="rr-cat">${catLabel}</div>
      ${showcaseHtml}
      <h2 class="rr-name">${label}</h2>
      <p class="rr-sub">${subText}</p>
      <div class="rr-actions">
        ${!alreadyEquipped ? `<button type="button" class="rr-btn rr-btn-equip" id="rr-equip-btn">${UI_IC.sparkle} Одягти одразу</button>` : ""}
        <button type="button" class="rr-btn ${alreadyEquipped ? "rr-btn-equip" : "rr-btn-close"}" id="rr-ok-btn">${alreadyEquipped ? `${UI_IC.check} Чудово!` : "В колекцію"}</button>
      </div>
    </div>
  `;

  ov.classList.add("open");
  ov.setAttribute("aria-hidden", "false");

  snd("win");
  snd("coins");
  if (typeof bell === "function") setTimeout(() => bell(), 140);

  requestAnimationFrame(() => {
    const stageEl = ov.querySelector(".rr-stage");
    if (stageEl) {
      spawnGlorySparks(stageEl);
      setTimeout(() => { if (ov.classList.contains("open")) spawnGlorySparks(stageEl); }, 320);
    }
  });

  const equipBtn = $("rr-equip-btn");
  if (equipBtn) {
    equipBtn.onclick = () => {
      equipGloryReward({ type, itemId, label });
      if ($("glory-ov")?.classList.contains("open")) renderGloryModal();
      if ($("profile-ov")?.classList.contains("open")) renderProfileModal();
      closeRewardRevealModal();
    };
  }
  const okBtn = $("rr-ok-btn");
  if (okBtn) okBtn.onclick = () => { snd("throw"); closeRewardRevealModal(); };
  ov.onclick = (ev) => {
    if (ev.target === ov || ev.target.classList.contains("rr-backdrop")) {
      snd("throw");
      closeRewardRevealModal();
    }
  };
}

function updateGloryTrackFill(ov, tr) {
  if (!ov) return;
  const line = ov.querySelector(".glory-track-line");
  const fill = ov.querySelector(".glory-track-fill");
  const dots = Array.from(ov.querySelectorAll(".glory-node .gn-dot"));
  const count = GLORY_ROAD_REWARDS.length;
  if (!line || !fill || !dots.length || !count) return;

  const lineRect = line.getBoundingClientRect();
  if (!lineRect.width) return;

  const centers = dots.map(d => {
    const r = d.getBoundingClientRect();
    return (r.left + r.width / 2) - lineRect.left;
  });

  let fillPx = 0;
  if (tr <= 0) {
    fillPx = 0;
  } else if (tr >= GLORY_ROAD_REWARDS[count - 1].trophies) {
    fillPx = centers[count - 1];
  } else if (tr < GLORY_ROAD_REWARDS[0].trophies) {
    const frac = tr / Math.max(1, GLORY_ROAD_REWARDS[0].trophies);
    fillPx = centers[0] * frac;
  } else {
    let passedIdx = 0;
    for (let i = 0; i < count; i++) {
      if (tr >= GLORY_ROAD_REWARDS[i].trophies) passedIdx = i;
    }
    const prevT = GLORY_ROAD_REWARDS[passedIdx].trophies;
    const nextT = GLORY_ROAD_REWARDS[passedIdx + 1].trophies;
    const segFrac = (tr - prevT) / Math.max(1, nextT - prevT);
    fillPx = centers[passedIdx] + (centers[passedIdx + 1] - centers[passedIdx]) * segFrac;
  }
  fill.style.width = `${Math.max(0, Math.min(lineRect.width, fillPx)).toFixed(1)}px`;
}

function openGloryModal() {
  const ov = $("glory-ov");
  if (!ov) return;
  renderGloryModal();
  ov.classList.add("open");
  ov.setAttribute("aria-hidden", "false");
  snd("swap");
  requestAnimationFrame(() => {
    updateGloryTrackFill(ov, PROFILE.trophies || 0);
    const strip = ov.querySelector(".glory-strip-scroll");
    const target = ov.querySelector(".glory-node.can-claim") || ov.querySelector(".glory-node.is-next") || ov.querySelector(".glory-node:last-child");
    if (strip && target) {
      strip.scrollTo({ left: Math.max(0, target.offsetLeft - strip.clientWidth / 2 + target.clientWidth / 2), behavior: "smooth" });
    }
  });
}

function closeGloryModal() {
  const ov = $("glory-ov");
  if (!ov) return;
  ov.classList.remove("open");
  ov.setAttribute("aria-hidden", "true");
  snd("throw");
  if ($("ov") && $("ov").style.display !== "none") {
    renderBentoHub("");
  }
}

function spawnGlorySparks(anchorEl) {
  if (!anchorEl) return;
  const r = anchorEl.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  for (let i = 0; i < 24; i++) {
    const sp = document.createElement("span");
    sp.className = "glory-spark-pt";
    const ang = (Math.PI * 2 * i) / 24 + (Math.random() - 0.5) * 0.35;
    const dist = 42 + Math.random() * 72;
    sp.style.left = `${cx}px`;
    sp.style.top = `${cy}px`;
    sp.style.setProperty("--dx", `${Math.cos(ang) * dist}px`);
    sp.style.setProperty("--dy", `${Math.sin(ang) * dist - 18}px`);
    sp.style.setProperty("--sz", `${4 + Math.random() * 5}px`);
    document.body.appendChild(sp);
    setTimeout(() => sp.remove(), 840);
  }
}

function isGloryRewardEquipped(m) {
  if (m.type === "avatar") {
    const idx = AVATARS.findIndex(a => a.id === m.itemId);
    return idx >= 0 && PROFILE.crest === idx;
  }
  if (m.type === "banner") {
    const idx = PL_BANNERS.findIndex(b => b.id === m.itemId);
    return idx >= 0 && PROFILE.banner === idx;
  }
  if (m.type === "cardBack") return (PROFILE.cardBack || "classic") === m.itemId;
  if (m.type === "title") {
    const t = PROFILE_TITLES.find(x => x.id === m.itemId);
    return (!!t && PROFILE.activeTitle === t.name) || (!!m.label && PROFILE.activeTitle === m.label);
  }
  return false;
}

function equipGloryReward(m) {
  if (m.type === "avatar") {
    const idx = AVATARS.findIndex(a => a.id === m.itemId);
    if (idx >= 0) PROFILE.crest = idx;
  } else if (m.type === "banner") {
    const idx = PL_BANNERS.findIndex(b => b.id === m.itemId);
    if (idx >= 0) PROFILE.banner = idx;
  } else if (m.type === "cardBack") {
    PROFILE.cardBack = m.itemId;
  } else if (m.type === "title") {
    const t = PROFILE_TITLES.find(x => x.id === m.itemId);
    if (t) PROFILE.activeTitle = t.name;
    else if (m.label) PROFILE.activeTitle = m.label;
  }
  saveProfile();
  snd("anvil");
}

function renderGloryRewardPreview(m) {
  if (m.type === "avatar") {
    const av = AVATARS.find(a => a.id === m.itemId);
    return `<div class="gn-prev gn-prev-av">${av ? av.svg : AV_SVG[0]}</div>`;
  }
  if (m.type === "banner") {
    const bn = PL_BANNERS.find(b => b.id === m.itemId);
    return `<div class="gn-prev gn-prev-bn"><div class="gn-shield-mini banner-${m.itemId}" style="background:${bn ? bn.preview : "#111"}"></div></div>`;
  }
  if (m.type === "cardBack") {
    return `<div class="gn-prev gn-prev-cb"><div class="gn-card-mini cback-${m.itemId}">${backSvg("s", m.itemId)}</div></div>`;
  }
  const t = PROFILE_TITLES.find(x => x.id === m.itemId);
  return `<div class="gn-prev gn-prev-ttl" style="--ttl-c:${t ? t.color : "#fde047"}"><span>«${m.label}»</span></div>`;
}

function renderGloryModal() {
  const ov = $("glory-ov");
  if (!ov) return;
  const tr = PROFILE.trophies || 0;
  const curLeague = getLeagueForTrophies(tr);
  const claimed = PROFILE.claimedRewards || [];
  const nextMile = getNextGloryMilestone(tr);

  const count = GLORY_ROAD_REWARDS.length;
  const nodeW = window.innerWidth <= 767 ? 148 : 164;
  const nodeGap = 16;
  const stepPx = nodeW + nodeGap;
  const firstCenterPx = nodeW / 2;
  const totalTrackPx = firstCenterPx + Math.max(0, count - 1) * stepPx;
  let fillPct = 0;
  if (tr <= 0) {
    fillPct = 0;
  } else if (tr >= GLORY_ROAD_REWARDS[count - 1].trophies) {
    fillPct = 100;
  } else if (tr < GLORY_ROAD_REWARDS[0].trophies) {
    const frac = tr / Math.max(1, GLORY_ROAD_REWARDS[0].trophies);
    fillPct = (firstCenterPx * frac / totalTrackPx) * 100;
  } else {
    let passedIdx = 0;
    for (let i = 0; i < count; i++) {
      if (tr >= GLORY_ROAD_REWARDS[i].trophies) passedIdx = i;
    }
    const prevT = GLORY_ROAD_REWARDS[passedIdx].trophies;
    const nextT = GLORY_ROAD_REWARDS[passedIdx + 1].trophies;
    const segFrac = (tr - prevT) / Math.max(1, nextT - prevT);
    const posPx = firstCenterPx + (passedIdx + segFrac) * stepPx;
    fillPct = Math.max(0, Math.min(100, (posPx / totalTrackPx) * 100));
  }

  const leaguesStrip = TROPHY_LEAGUES.map(lg => {
    const isCur = lg.id === curLeague.id;
    const isDone = tr > lg.max;
    return `
      <div class="gl-league-chip ${isCur ? "cur" : ""} ${isDone ? "done" : ""}" style="--lg-col:${lg.color}">
        <span class="gllc-ico">${lg.icon()}</span>
        <span class="gllc-txt">
          <b>${lg.name}</b>
          <small>${lg.max === Infinity ? `${lg.min}+` : `${lg.min}–${lg.max}`} ${UI_IC.trophy}</small>
        </span>
      </div>`;
  }).join("");

  const nodesHtml = GLORY_ROAD_REWARDS.map(m => {
    const reached = tr >= m.trophies;
    const isClaimed = claimed.includes(m.id);
    const canClaim = reached && !isClaimed;
    const isNext = nextMile && nextMile.id === m.id;
    const equipped = isClaimed && isGloryRewardEquipped(m);

    let actionBtn = "";
    if (canClaim) {
      actionBtn = `<button type="button" class="gn-btn claim" data-gl-claim="${m.id}">${UI_IC.sparkle} Забрати</button>`;
    } else if (isClaimed) {
      actionBtn = equipped
        ? `<button type="button" class="gn-btn equipped" disabled>${UI_IC.check} Одягнено</button>`
        : `<button type="button" class="gn-btn equip" data-gl-equip="${m.id}">Одягти</button>`;
    } else {
      actionBtn = `<div class="gn-lock-pill">${UI_IC.lock} ${m.trophies} ${UI_IC.trophy}</div>`;
    }

    return `
      <div class="glory-node ${reached ? "reached" : ""} ${canClaim ? "can-claim" : ""} ${isClaimed ? "claimed" : ""} ${isNext ? "is-next" : ""}">
        <div class="gn-milestone-tag">${m.trophies} ${UI_IC.trophy}</div>
        <div class="gn-dot"><i></i></div>
        <div class="gn-card">
          <div class="gn-cat">${m.cat}</div>
          ${renderGloryRewardPreview(m)}
          <div class="gn-name">${m.label}</div>
          ${actionBtn}
        </div>
      </div>`;
  }).join("");

  const prevScroll = ov.querySelector(".glory-strip-scroll")?.scrollLeft || 0;

  ov.innerHTML = `
    <div class="glory-modal">
      <div class="glory-head">
        <div class="glory-league-banner" style="--lg-col:${curLeague.color};--lg-glow:${curLeague.glow}">
          <div class="glb-crest">${curLeague.icon()}</div>
          <div class="glb-info">
            <div class="glb-eyebrow">ДОРОГА ОЛІМПУ · ПОТОЧНА ЛІГА</div>
            <div class="glb-title">${curLeague.name}</div>
            <div class="glb-sub">
              ${tr < 200 ? `${UI_IC.shield} Захист новачка активний: до 200 ${UI_IC.trophy} кубки при поразці не списуються` : `${UI_IC.fire} Серія від 2 перемог поспіль додає бонус +5 ${UI_IC.trophy} до нагороди`}
            </div>
          </div>
          <div class="glb-counter">
            <span class="glbc-num">${UI_IC.trophy} ${tr}</span>
            <small>${nextMile ? `До «${nextMile.label}»: ще ${nextMile.trophies - tr} ${UI_IC.trophy}` : "Усі віхи Олімпу підкорено!"}</small>
          </div>
        </div>
        <button type="button" class="set-close-x" id="glory-close" title="Закрити (Esc)">${UI_IC.close}</button>
      </div>

      <div class="glory-leagues-bar">${leaguesStrip}</div>

      <div class="glory-strip-scroll">
        <div class="glory-track-wrap">
          <div class="glory-track-line">
            <div class="glory-track-fill" style="width:${fillPct.toFixed(1)}%"></div>
          </div>
          <div class="glory-nodes-row">${nodesHtml}</div>
        </div>
      </div>
    </div>
  `;

  if (prevScroll > 0) {
    const st = ov.querySelector(".glory-strip-scroll");
    if (st) st.scrollLeft = prevScroll;
  }

  ov.onclick = (ev) => { if (ev.target === ov) closeGloryModal(); };
  const gClose = $("glory-close");
  if (gClose) gClose.onclick = closeGloryModal;

  requestAnimationFrame(() => updateGloryTrackFill(ov, tr));

  ov.querySelectorAll("[data-gl-claim]").forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute("data-gl-claim");
      const m = GLORY_ROAD_REWARDS.find(x => x.id === id);
      if (!m || (PROFILE.trophies || 0) < m.trophies) return;
      if (!PROFILE.claimedRewards.includes(id)) PROFILE.claimedRewards.push(id);
      saveProfile();
      spawnGlorySparks(btn);
      renderGloryModal();
      showRewardRevealModal(m, {
        sourceLabel: `ДОРОГА ОЛІМПУ · ${m.trophies} ${UI_IC.trophy}`,
        subtitle: "Нову нагороду розблоковано та додано до твоєї колекції!"
      });
    };
  });

  ov.querySelectorAll("[data-gl-equip]").forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute("data-gl-equip");
      const m = GLORY_ROAD_REWARDS.find(x => x.id === id);
      if (!m) return;
      equipGloryReward(m);
      renderGloryModal();
    };
  });
}

function renderBentoHub(resultTitle = "") {
  const root = $("bento-root");
  if (!root) return;
  const hasActiveGame = P.length && alive().length > 1 && isPaused;
  const rankTitle = PROFILE.activeTitle || (PROFILE.wins >= 15 ? "Чемпіон Олімпу" : PROFILE.wins >= 7 ? "Ветеран Арени" : PROFILE.wins >= 2 ? "Загартований Дуелянт" : "Шукач Слави");
  const avSvg = AV_SVG[PROFILE.crest || 0] || AV_SVG[0];
  const pNick = (PROFILE.name && PROFILE.name.trim()) ? PROFILE.name.trim() : "ТИ";
  const curTr = PROFILE.trophies || 0;
  const curLeague = getLeagueForTrophies(curTr);
  const nextMile = getNextGloryMilestone(curTr);
  const passedMiles = GLORY_ROAD_REWARDS.filter(m => curTr >= m.trophies);
  const prevMileTr = passedMiles.length ? passedMiles[passedMiles.length - 1].trophies : 0;
  const goalTr = nextMile ? nextMile.trophies : 1500;
  const tpPct = nextMile
    ? Math.max(0, Math.min(100, Math.round(((curTr - prevMileTr) / Math.max(1, goalTr - prevMileTr)) * 100)))
    : 100;
  const unclaimedCnt = getUnclaimedGloryRewards().length;

  const battleBgParticles = `
    <div class="battle-fx-bg" aria-hidden="true">
      <div class="bfx-card c1">${SVG_IC.d}</div>
      <div class="bfx-card c2">${SVG_IC.a}</div>
      <div class="bfx-card c3">${SVG_IC.x}</div>
      <div class="bfx-spark s1"></div>
      <div class="bfx-spark s2"></div>
      <div class="bfx-spark s3"></div>
      <div class="bfx-spark s4"></div>
    </div>
  `;

  const tourBgParticles = `
    <div class="tour-fx-bg" aria-hidden="true">
      <div class="tfx-crown t1">${UI_IC.crown}</div>
      <div class="tfx-crown t2">${UI_IC.crown}</div>
      <div class="tfx-crown t3">${UI_IC.trophy}</div>
      <div class="tfx-coin m1"></div>
      <div class="tfx-coin m2"></div>
      <div class="tfx-coin m3"></div>
      <div class="tfx-star st1">${UI_IC.sparkle}</div>
      <div class="tfx-star st2">${UI_IC.star}</div>
    </div>
  `;

  root.innerHTML = `
    <!-- ВЕРХНЯ МОБІЛЬНА ІГРОВА ПАНЕЛЬ: КНОПКА ПРОФІЛЮ ЗЛІВА + ЛОГО + КОМПАКТНІ ІКОНКИ СПРАВА -->
    <div class="fan-top-bar">
      <div class="hub-game-bar">
        <div class="hub-left-cluster">
          <button type="button" class="hub-prof-pill" id="btn-open-profile" title="Відкрити Профіль, статистику та скіни">
            <span class="hpp-av">${avSvg}</span>
            <span class="hpp-info">
              <b class="hpp-nick">${pNick}</b>
              <small class="hpp-sub">${UI_IC.swords} ${PROFILE.wins} · ${rankTitle}</small>
            </span>
          </button>

          <button type="button" class="trophy-pill ${unclaimedCnt > 0 ? "has-claim" : ""}" id="btn-open-glory"
                  style="--lg-col:${curLeague.color};--lg-glow:${curLeague.glow}"
                  title="Дорога Олімпу · ${curLeague.name}${unclaimedCnt > 0 ? ` (Доступно нагород: ${unclaimedCnt})` : ""}">
            <span class="tp-league-ico">${curLeague.icon()}</span>
            <span class="tp-body">
              <span class="tp-top">
                <b class="tp-val">${curTr}</b>
                <small class="tp-goal">${nextMile ? `/ ${goalTr}` : "MAX"}</small>
              </span>
              <span class="tp-bar"><i style="width:${tpPct}%"></i></span>
            </span>
            ${unclaimedCnt > 0 ? `<span class="tp-badge">${unclaimedCnt}</span>` : ""}
          </button>
        </div>

        <div class="bento-logo-wrap hub-brand-center">
          <h1 class="bento-logo">DCARD</h1>
        </div>

        <div class="hub-top-tools">
          <button type="button" class="hub-ico-btn online-ico-btn" id="card-online" title="Мережева гра · Браузер серверів" aria-label="Онлайн">
            ${UI_IC.globe}<span class="hib-lbl">Онлайн</span>
          </button>
          <button type="button" class="hub-ico-btn lb-ico-btn" id="card-leaderboard" title="Зала Слави · Топ-50 гравців" aria-label="Рейтинг">
            ${UI_IC.trophy}<span class="hib-lbl">Топ</span>
          </button>
          <button type="button" class="hub-ico-btn codex-ico-btn" id="card-codex" title="Кодекс Артефактів (${CODEX_ENTRIES.length} записів)" aria-label="Кодекс">
            ${UI_IC.book}<span class="hib-lbl">Кодекс</span>
          </button>
          <button type="button" class="hub-ico-btn settings-ico-btn" id="card-settings" title="Налаштування гри" aria-label="Налаштування">
            ${UI_IC.gear}<span class="hib-lbl">Налаштування</span>
          </button>
        </div>
      </div>

      ${resultTitle ? `<div class="bento-res-banner">${resultTitle}</div>` : ""}
      ${hasActiveGame ? `
        <div class="bento-resume-bar">
          <span>${UI_IC.swords} Поточний бій на паузі</span>
          <button type="button" class="bento-resume-btn" id="btn-resume">${UI_IC.play} Продовжити</button>
        </div>
      ` : ""}
    </div>

    <!-- ЦЕНТРАЛЬНИЙ ЯРУС: 3 ГОЛОВНІ КАРТИ-РЕЖИМИ (ВЕРТИКАЛЬНО НА ТЕЛЕФОНІ / ВІЯЛО НА ПК) -->
    <div class="artifact-fan-stage">
      <div class="fan-altar-glow" aria-hidden="true"></div>

      <div class="artifact-fan-hand">
        <!-- 1. ШВИДКА ДУЕЛЬ -->
        <div class="fan-artifact-card ruby-artifact left-fan" id="showcase-duel" data-rot="-3.5">
          <div class="fac-inner-frame"></div>
          <div class="fac-corner-rune tl">${UI_IC.swords}</div>
          <div class="fac-corner-rune tr">I</div>
          ${battleBgParticles}

          <div class="fac-content">
            <div class="sc-badge ruby-badge">${UI_IC.swords} ШВИДКИЙ МАТЧ</div>

            <div class="fac-art-medallion ruby-emblem">
              <div class="fac-ring-orbit"></div>
              ${UI_IC.swords}
            </div>

            <div class="fac-title-block">
              <div class="fac-title">ШВИДКА ДУЕЛЬ</div>
              <div class="fac-divider ruby-div"></div>
              <div class="fac-desc">Випадкова арена та збалансована колода за Бюджетом сили</div>
            </div>

            <div class="fac-bottom-controls">
              <div class="player-seg ruby-seg" role="group" aria-label="Кількість гравців">
                <button type="button" class="pseg-btn ${BENTO_PLAYERS === 2 ? "act" : ""}" data-pcount="2">
                  <b>2</b><span>Дуель</span>
                </button>
                <button type="button" class="pseg-btn ${BENTO_PLAYERS === 3 ? "act" : ""}" data-pcount="3">
                  <b>3</b><span>Трикутник</span>
                </button>
                <button type="button" class="pseg-btn ${BENTO_PLAYERS === 4 ? "act" : ""}" data-pcount="4">
                  <b>4</b><span>Коло</span>
                </button>
              </div>
              <button type="button" class="showcase-cta-btn ruby-cta" id="btn-quick-fight">${UI_IC.swords} У БІЙ</button>
            </div>
          </div>
        </div>

        <!-- 2. ТУРНІР ДО 2 ПЕРЕМОГ -->
        <div class="fan-artifact-card gold-artifact right-fan" id="card-tour" role="button" tabindex="0" data-rot="3.5">
          <div class="fac-inner-frame"></div>
          <div class="fac-corner-rune tl">${UI_IC.crown}</div>
          <div class="fac-corner-rune tr">II</div>
          <div class="sc-sheen"></div>
          ${tourBgParticles}

          <div class="fac-content">
            <div class="sc-badge gold-badge">${UI_IC.crown} ЧЕМПІОНСЬКИЙ РЕЖИМ</div>

            <div class="fac-art-medallion gold-emblem">
              <div class="fac-ring-orbit"></div>
              ${UI_IC.trophy}
            </div>

            <div class="fac-title-block">
              <div class="fac-title">ТУРНІР ДО 2 ПЕРЕМОГ</div>
              <div class="fac-divider gold-div"></div>
              <div class="fac-desc">4 гравці · Нова арена щораунду · Дари Вівтаря · Фінал 1×1</div>
            </div>

            <div class="fac-bottom-controls">
              <div class="tour-perks-strip">
                <span>${UI_IC.pillar} Зміна арен</span>
                <span>${UI_IC.diamond} Дари Вівтаря</span>
                <span>${UI_IC.swords} Фінал 1×1</span>
              </div>
              <button type="button" class="showcase-cta-btn gold-cta" id="btn-tour-start">${UI_IC.crown} ПОЧАТИ ТУРНІР</button>
            </div>
          </div>
        </div>

        <!-- 3. СЮЖЕТНА КАМПАНІЯ «ШЛЯХ АРЕН» -->
        <div class="fan-artifact-card emerald-artifact mid-fan" id="card-campaign" role="button" tabindex="0" data-rot="0">
          <div class="fac-inner-frame"></div>
          <div class="fac-corner-rune tl">${UI_IC.pillar}</div>
          <div class="fac-corner-rune tr">III</div>
          <div class="sc-sheen"></div>
          <div class="emerald-fx-bg" aria-hidden="true">
            <div class="efx-leaf l1">${UI_IC.diamond}</div>
            <div class="efx-leaf l2">${UI_IC.diamond}</div>
            <div class="efx-orb o1"></div>
            <div class="efx-orb o2"></div>
          </div>

          <div class="fac-content">
            <div class="sc-badge emerald-badge">${UI_IC.map} PvE-КАМПАНІЯ · ГЛАВА I</div>

            <div class="fac-art-medallion emerald-emblem">
              <div class="fac-ring-orbit"></div>
              ${UI_IC.pillar}
            </div>

            <div class="fac-title-block">
              <div class="fac-title">ШЛЯХ АРЕН</div>
              <div class="fac-divider emerald-div"></div>
              <div class="fac-desc">Мармуровий Поліс · 12 вузлів із босами, зірками та нагородами</div>
            </div>

            <div class="fac-bottom-controls">
              <div class="emerald-perks-strip">
                <span>${UI_IC.pillar} Глава I: ${(PROFILE.campaignCleared || []).filter(x => x <= 10).length}/10</span>
                <span>${UI_IC.crown} Бос: Центуріон</span>
              </div>
              <button type="button" class="showcase-cta-btn emerald-cta" id="btn-campaign-open">${UI_IC.map} ВІДКРИТИ КАРТУ</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  bindMenuButtons();
}

function bindMenuButtons() {
  initFanCardParallax();

  const profBtn = $("btn-open-profile");
  if (profBtn) {
    profBtn.onclick = () => openProfileModal();
  }

  const gloryBtn = $("btn-open-glory");
  if (gloryBtn) {
    gloryBtn.onclick = () => openGloryModal();
  }
  const onlineBtn = $("card-online");
  if (onlineBtn) {
    onlineBtn.onclick = () => { if (window.DCARD_NET) DCARD_NET.openNetModal(); };
  }
  const lbBtn = $("card-leaderboard");
  if (lbBtn) {
    lbBtn.onclick = () => { if (window.DCARD_CLOUD) DCARD_CLOUD.openLeaderboardModal(); };
  }

  document.querySelectorAll("[data-pcount]").forEach(btn => {
    btn.onclick = (ev) => {
      ev.stopPropagation();
      BENTO_PLAYERS = parseInt(btn.getAttribute("data-pcount"), 10) || 2;
      document.querySelectorAll("[data-pcount]").forEach(b => b.classList.toggle("act", b === btn));
      snd("throw");
    };
  });

  const launchQuickDuel = () => {
    isPaused = false;
    TOUR = null;
    CAMPAIGN = null;
    start(BENTO_PLAYERS);
  };

  const quickBtn = $("btn-quick-fight");
  if (quickBtn) {
    quickBtn.onclick = (ev) => {
      ev.stopPropagation();
      launchQuickDuel();
    };
  }

  const launchTournament = () => {
    isPaused = false;
    CAMPAIGN = null;
    const kk = 4;
    const pName = (PROFILE.name && PROFILE.name.trim()) ? PROFILE.name.trim() : "ТИ";
    TOUR = { target: 2, wins: Array(kk).fill(0), round: 1, n: kk, names: [pName, "Тінь", "Кібер", "Лорд"], finalists: null, stat: null, usedArenas: [], relics: Array.from({ length: kk }, () => []), rerollsLeft: 1, offeredRelics: null, selectedRelicId: null, botGrantedRound: 0 };
    start(kk);
  };

  const tourCard = $("card-tour");
  if (tourCard) {
    tourCard.onclick = (ev) => {
      ev.stopPropagation();
      launchTournament();
    };
  }
  const tourBtn = $("btn-tour-start");
  if (tourBtn) {
    tourBtn.onclick = (ev) => {
      ev.stopPropagation();
      launchTournament();
    };
  }

  const campCard = $("card-campaign");
  if (campCard) {
    campCard.onclick = (ev) => {
      ev.stopPropagation();
      openCampaignMap();
    };
  }
  const campBtn = $("btn-campaign-open");
  if (campBtn) {
    campBtn.onclick = (ev) => {
      ev.stopPropagation();
      openCampaignMap();
    };
  }

  const codexCard = $("card-codex");
  if (codexCard) {
    codexCard.onclick = () => openCodex();
  }

  const settingsBtn = $("card-settings");
  if (settingsBtn) {
    settingsBtn.onclick = () => openSettings();
  }

  document.querySelectorAll("[data-players]").forEach(btn => {
    btn.onclick = () => {
      isPaused = false;
      const kk = parseInt(btn.getAttribute("data-players"), 10);
      const pName = (PROFILE.name && PROFILE.name.trim()) ? PROFILE.name.trim() : "ТИ";
      TOUR = btn.hasAttribute("data-tour") ? { target: 2, wins: Array(kk).fill(0), round: 1, n: kk, names: [pName, "Тінь", "Кібер", "Лорд"].slice(0, kk), finalists: null, stat: null, usedArenas: [], relics: Array.from({ length: kk }, () => []), rerollsLeft: 1, offeredRelics: null, selectedRelicId: null, botGrantedRound: 0 } : null;
      start(kk);
    };
  });

  document.querySelectorAll("[data-codex]").forEach(btn => {
    btn.onclick = () => openCodex();
  });

  const resBtn = $("btn-resume");
  if (resBtn) {
    resBtn.onclick = () => {
      isPaused = false;
      $("ov").style.display = "none";
    };
  }

  // Надійне делегування кліків на ПК та телефоні для всіх карток і кнопок меню
  const root = $("bento-root");
  if (root && !root.dataset.delegated) {
    root.dataset.delegated = "1";
    root.addEventListener("click", (ev) => {
      const target = ev.target && ev.target.closest ? ev.target : null;
      if (!target) return;
      if (target.closest("#btn-campaign-open") || target.closest("#card-campaign")) {
        ev.preventDefault();
        openCampaignMap();
      } else if (target.closest("#btn-tour-start") || target.closest("#card-tour")) {
        ev.preventDefault();
        launchTournament();
      } else if (target.closest("#btn-quick-fight")) {
        ev.preventDefault();
        launchQuickDuel();
      } else if (target.closest("#btn-open-profile")) {
        ev.preventDefault();
        openProfileModal();
      } else if (target.closest("#card-codex")) {
        ev.preventDefault();
        openCodex();
      } else if (target.closest("#card-settings")) {
        ev.preventDefault();
        openSettings();
      }
    });
  }
}

let CX_CAT = "all";
let CX_RARITY = "all";
let CX_QUERY = "";

function renderCodexArenas(grid, q = "") {
  const list = ARENAS.filter(ar => {
    if (!q) return true;
    const det = ARENA_CODEX_DETAILS[ar.id] || {};
    const hay = `${ar.name} ${ar.shortRule} ${ar.rule} ${det.mech || ""} ${det.strat || ""}`.toLowerCase();
    return hay.includes(q);
  });
  const cnt = $("cx-count");
  if (cnt) cnt.textContent = `Знайдено арен: ${list.length}`;
  if (!list.length) {
    grid.innerHTML = `<div class="cx-empty">Нічого не знайдено за запитом «${q}»</div>`;
    return;
  }
  list.forEach(ar => {
    const det = ARENA_CODEX_DETAILS[ar.id] || { vibe: "", mech: ar.rule, strat: "" };
    const card = document.createElement("div");
    card.className = "cx-arena-card";
    card.style.setProperty("--ac", ar.col);
    card.innerHTML = `
      <div class="cx-ar-top">
        <div class="cx-ar-ico">${ar.icon}</div>
        <div>
          <div class="cx-ar-name">${ar.name}</div>
          <div class="cx-ar-short">${ar.shortRule}</div>
        </div>
      </div>
      <div class="cx-ar-box">
        <div class="cx-ar-row"><b>${UI_IC.gear} Механіка та модифікатори:</b> ${det.mech}</div>
        <div class="cx-ar-row"><b>${UI_IC.palette} Атмосфера столу:</b> ${det.vibe}</div>
        <div class="cx-ar-row" style="border-color:color-mix(in srgb, var(--ac) 35%, transparent)"><b>${UI_IC.compass} Тактична порада:</b> ${det.strat}</div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function renderCodexRules(grid, q = "") {
  const sections = [
    {
      title: "1. Ціль гри та базові параметри",
      items: [
        "<b>Стартове здоров'я:</b> кожен гравець починає партію зі <b>100 HP</b> (максимум здоров'я також обмежений 100 HP).",
        "<b>Умова перемоги:</b> звести HP усіх суперників за столом до <b>0</b> і залишитися останнім вижившим.",
        "<b>Режими гри:</b> Дуель (2 гравці), Трикутник (3 гравці), Коло (4 гравці) та Турнір до 2 перемог (із фінальною дуеллю 1 на 1 при нічиїй за очками)."
      ]
    },
    {
      title: "2. Склад руки та Бюджет Сили",
      items: [
        "<b>Формула 10 карт:</b> кожна рука складається з <b>6 карт шкоди</b>, <b>3 карт здоров'я</b> та <b>1 унікальної спецкарти</b>.",
        "<b>Бюджет сили (19–21 бал):</b> кожна рідкість коштує від 1 до 5 балів (Зелена = 1, Синя = 2, Фіолетова = 3, Червона = 4, Легендарна = 5). Сума 9 базових карт завжди балансується в межах 19–21 бала.",
        "<b>Поповнення колоди:</b> коли у живого гравця закінчуються всі 10 карт (hand = 0), на початку його наступного ходу автоматично роздається нова десятка карт."
      ]
    },
    {
      title: "3. Кругові дуелі та пріоритет ходу",
      items: [
        "<b>Ланцюжок дуелей:</b> гра відбувається по колу. У своїй фазі ти атакуєш сусіда ліворуч (ходиш першим), а коли черга доходить до сусіда праворуч — він атакує тебе першим.",
        "<b>Порядок розіграшу:</b> перший гравець викладає карту закритою (видно лише тип сорочки: червона — атака, зелена — здоров'я, золота — спец), другий відповідає своєю картою, після чого обидві відкриваються.",
        "<b>Смертельний удар:</b> дія першого гравця застосовується першою. Якщо ти знизив HP захисника до 0 до його ходу — він вибуває і не встигає зіграти свою карту."
      ]
    },
    {
      title: "4. Позитивні ефекти (Бафи)",
      items: [
        `<b>${UI_IC.shield} Панцир Черепахи (25%):</b> поглинає 25% шкоди від наступної вхідної атаки.`,
        `<b>${UI_IC.rose} Шипи (35%):</b> діють на 2 вхідні удари — повертають 35% отриманої шкоди назад нападнику.`,
        `<b>${UI_IC.plus} Відновлення (HoT):</b> лікує наприкінці кожного кола (Мирт, Лотос, Дар Гігеї, Мед Богів, Ікор богів, Чаша Геби).`,
        `<b>${UI_IC.heart} Блад (∞):</b> вічна регенерація +10 HP наприкінці кожного кола до кінця партії.`,
        `<b>${UI_IC.fire}${UI_IC.shield} Імунітет до горіння (Кров Саламандри):</b> блокує накладання та шкоду статусу «Горіння» на 2 кола.`,
        `<b>${UI_IC.forest} Коріння Життя (Дерево Життя):</b> пасивний порятунок 1 раз за партію — якщо HP падає до 0, герой виживає з 15 HP.`
      ]
    },
    {
      title: "5. Негативні ефекти (Дебафи)",
      items: [
        `<b>${UI_IC.skull} Отрута (DoT) та ${UI_IC.fire} Горіння:</b> знімають HP наприкінці кожного кола. Кілька отрут складаються між собою.`,
        `<b>${UI_IC.snow} Крижаний Щит:</b> на наступний хід цілі її шкода ріжеться на 50%, а спецкарти блокуються.`,
        `<b>${UI_IC.hourglass} Смола Аїда (Уповільнення):</b> у наступній дуелі уповільнений гравець втрачає пріоритет і ходить другим, навіть якщо мав атакувати.`,
        `<b>${UI_IC.chain} Кайдани Фантома та ${UI_IC.brokenHeart} Прокляття Ереба:</b> Кайдани спалюють наступне зцілення гравця, а Прокляття Ереба обертає наступне лікування у пряму шкоду по ньому ж.`,
        `<b>${UI_IC.stone} Око Медузи та ${UI_IC.snow}${UI_IC.swords} Крижана голка:</b> Медуза блокує 1 карту в руці на 2 кола, а Крижана голка зменшує наступну атаку на −5 HP.`,
        `<b>${UI_IC.chalice} Жертовна нитка (Жертовний Кубок):</b> відкладена шкода −8 HP цілі наприкінці поточного кола.`
      ]
    },
    {
      title: "6. Взаємодія щитів, дзеркал і очищення",
      items: [
        "<b>Егіда (s):</b> блокує пряму атаку або отруту та б'є у відповідь на 50% базової сили (або дає +6 HP, якщо ворог не атакував).",
        "<b>Щит Персея (m):</b> повністю відбиває 100% шкоди або отрути назад в атакуючого.",
        `<b>Пробиття та розсіювання:</b> ${UI_IC.suitSpade} Піка з Преферансу пробиває будь-який щит чи дзеркало, а Мйольнір (o) миттєво розсіює всі бафи цілі та знищує її захист.`,
        "<b>Благословення Ра (n):</b> знімає <b>усі негативні ефекти</b> (включно з заморозкою та скам'янінням карт у руці), але не чіпає позитивні бафи."
      ]
    }
  ];
  const filtered = q
    ? sections.filter(s => (s.title + " " + s.items.join(" ")).toLowerCase().includes(q))
    : sections;
  const cnt = $("cx-count");
  if (cnt) cnt.textContent = `Розділів правил: ${filtered.length}`;
  if (!filtered.length) {
    grid.innerHTML = `<div class="cx-empty">Нічого не знайдено за запитом «${q}»</div>`;
    return;
  }
  const wrap = document.createElement("div");
  wrap.className = "cx-rules-wrap";
  filtered.forEach(sec => {
    const el = document.createElement("div");
    el.className = "cx-rule-card";
    el.innerHTML = `<h3>${sec.title}</h3><ul>${sec.items.map(li => `<li>${li}</li>`).join("")}</ul>`;
    wrap.appendChild(el);
  });
  grid.appendChild(wrap);
}

function renderCodex(filter = CX_CAT) {
  CX_CAT = filter;
  const grid = $("cx-grid");
  if (!grid) return;
  grid.innerHTML = "";
  const q = (CX_QUERY || "").trim().toLowerCase();

  const rBar = $("cx-rarity-bar");
  const isCardTab = !["arenas", "rules"].includes(filter);
  if (rBar) rBar.style.display = isCardTab ? "flex" : "none";

  if (filter === "arenas") { renderCodexArenas(grid, q); return; }
  if (filter === "rules") { renderCodexRules(grid, q); return; }

  const savedArena = CUR_ARENA;
  CUR_ARENA = null;

  const items = CODEX_ENTRIES
    .filter(it => filter === "all" ? true : it.cat === filter)
    .filter(it => CX_RARITY === "all" ? true : String(it.r) === String(CX_RARITY))
    .filter(it => {
      if (!q) return true;
      const c = { t: it.t, r: it.r };
      const v = val(c, 100);
      const nm = cardName(c) || "";
      const ds = DESC[c.t] ? DESC[c.t](c, v) : "";
      const tacArr = CODEX_TACTICS[c.t];
      const tac = Array.isArray(tacArr) ? (tacArr[c.r] || tacArr[0] || "") : "";
      return `${nm} ${R[it.r].n} ${it.tier} ${ds} ${tac}`.toLowerCase().includes(q);
    })
    .sort((a, b) => a.r - b.r);

  const cnt = $("cx-count");
  if (cnt) cnt.textContent = `Карт: ${items.length}`;

  if (!items.length) {
    CUR_ARENA = savedArena;
    grid.innerHTML = `<div class="cx-empty">За твоїм фільтром карт не знайдено</div>`;
    return;
  }

  const raritySub = [
    "1 бал у бюджеті сили · Базові інструменти та стабільний старт",
    "2 бали у бюджеті сили · Тактичні модифікатори, контроль і бонуси",
    "3 бали у бюджеті сили · Епічні артефакти та базова група спецкарт",
    "4 бали у бюджеті сили · Міфічні руйнівні карти, прокляття та бафи",
    "5 балів або позабюджетний бонус · Наймогутніші реліквії Олімпу"
  ];

  let lastRarity = -1;
  items.forEach(it => {
    if (it.r !== lastRarity) {
      lastRarity = it.r;
      const hdr = document.createElement("div");
      hdr.className = "cx-sec-hdr";
      hdr.style.setProperty("--rc", R[it.r].c);
      hdr.innerHTML = `
        <div class="cx-sec-title"><span class="cx-sec-dot"></span>Рідкість ${it.r + 1}/5: ${R[it.r].n}</div>
        <div class="cx-sec-meta">${raritySub[it.r]}</div>
      `;
      grid.appendChild(hdr);
    }

    const c = { t: it.t, r: it.r };
    const sp = isSp(c.t);
    const col = sp ? "#f59e0b" : R[c.r].c;
    const badgeTxt = sp ? "СПЕЦ · Артефакт" : R[c.r].n;
    const catTxt = sp ? `${UI_IC.bolt} Спецкарта` : it.cat === "dmg" ? `${UI_IC.swords} Атака` : `${UI_IC.heartGreen} Здоров'я`;
    const v = val(c, 100);
    const rawLabel = cardLabel(c, 100);
    const descHtml = DESC[c.t] ? DESC[c.t](c, v) : "";

    const tacArr = CODEX_TACTICS[c.t];
    const tacTxt = Array.isArray(tacArr) ? (tacArr[c.r] || tacArr[0]) : "";

    const row = document.createElement("div");
    row.className = "cx-item";
    row.style.setProperty("--rc", col);

    const card = document.createElement("div");
    card.className = "card r" + c.r + " t" + ("kboavqyjlDACSPWGLEIJMOQRUVXYZ790αβγδεζηθικλμνξω".includes(c.t) ? "d" : "rtnHFBKT1234568πρστυφχψΓΔΦΩ".includes(c.t) ? "h" : BASE[c.t] || c.t) + ("kbrovncN9ξωΩΨΠ".includes(c.t) ? " leg leg-" + c.t : "") + (c.t === "0" ? " midas-card" : "") + (sp ? " spec" : "") + (c.t === "i" ? " ice" : "");
    card.style.setProperty("--c", col);
    card.innerHTML = buildCardInnerHtml(c, 100, false, sp);

    const meta = document.createElement("div");
    meta.className = "cx-meta";
    meta.innerHTML = `
      <div class="cx-meta-top">
        <span class="cx-name">${cardName(c)}</span>
        <span class="cx-badge" style="--rc:${col}">${badgeTxt}</span>
      </div>
      <div class="cx-stats">
        <span class="cx-stat-pill">${catTxt}</span>
        <span class="cx-stat-pill hi">${it.tier}</span>
      </div>
      <div class="cx-desc">${descHtml}</div>
      ${tacTxt ? `<div class="cx-tac">${UI_IC.bulb} ${tacTxt}</div>` : ""}
    `;
    row.append(card, meta);
    grid.appendChild(row);
  });

  CUR_ARENA = savedArena;
}

function openCodex() {
  const ov = $("codex-ov");
  if (!ov) return;
  CX_CAT = "all";
  CX_RARITY = "all";
  CX_QUERY = "";
  const inp = $("cx-search");
  if (inp) inp.value = "";
  const clr = $("cx-search-clear");
  if (clr) clr.style.display = "none";
  ov.classList.add("open");
  ov.setAttribute("aria-hidden", "false");
  document.querySelectorAll("#cx-tabs .cx-tab").forEach(t => t.classList.toggle("act", t.dataset.cat === "all"));
  document.querySelectorAll("#cx-rarity-bar .cx-rpill").forEach(p => p.classList.toggle("act", p.dataset.r === "all"));
  renderCodex("all");
  snd("swap");
}

(function initCodexEvents() {
  const closeBtn = $("cx-close");
  if (closeBtn) closeBtn.onclick = () => {
    const ov = $("codex-ov");
    if (ov) { ov.classList.remove("open"); ov.setAttribute("aria-hidden", "true"); }
    snd("throw");
  };
  const tabs = $("cx-tabs");
  if (tabs) tabs.onclick = ev => {
    const btn = ev.target && ev.target.closest ? ev.target.closest(".cx-tab") : null;
    if (!btn) return;
    tabs.querySelectorAll(".cx-tab").forEach(x => x.classList.remove("act"));
    btn.classList.add("act");
    renderCodex(btn.dataset.cat || "all");
    if ($("cx-grid")) $("cx-grid").scrollTop = 0;
    snd("throw");
  };
  const rBar = $("cx-rarity-bar");
  if (rBar) rBar.onclick = ev => {
    const btn = ev.target && ev.target.closest ? ev.target.closest(".cx-rpill") : null;
    if (!btn) return;
    CX_RARITY = btn.dataset.r || "all";
    rBar.querySelectorAll(".cx-rpill").forEach(x => x.classList.toggle("act", x === btn));
    renderCodex(CX_CAT);
    snd("throw");
  };
  const inp = $("cx-search");
  const clr = $("cx-search-clear");
  if (inp) {
    inp.oninput = () => {
      CX_QUERY = inp.value || "";
      if (clr) clr.style.display = CX_QUERY ? "flex" : "none";
      renderCodex(CX_CAT);
    };
  }
  if (clr) {
    clr.onclick = () => {
      CX_QUERY = "";
      if (inp) { inp.value = ""; inp.focus(); }
      clr.style.display = "none";
      renderCodex(CX_CAT);
    };
  }
  const grid = $("cx-grid");
  const topBtn = $("cx-top-btn");
  if (grid && topBtn) {
    grid.addEventListener("scroll", () => {
      topBtn.classList.toggle("show", grid.scrollTop > 260);
    }, { passive: true });
    topBtn.onclick = () => {
      grid.scrollTo({ top: 0, behavior: "smooth" });
      snd("throw");
    };
  }
})();

function showMenu() {
  isPaused = true;
  $("ov").style.display = "flex";
  renderBentoHub("");
}

$("btn-menu").onclick = showMenu;
if ($("btn-tour-skip")) $("btn-tour-skip").onclick = () => exitTourRoundEarly();
if ($("top-codex")) $("top-codex").onclick = () => openCodex();
if ($("top-settings")) $("top-settings").onclick = () => openSettings();
$("btn-mute").onclick = () => { const v = $("vp"); v.style.display = v.style.display === "none" ? "flex" : "none"; };
$("vm").oninput = () => { SETTINGS.vm = parseInt($("vm").value, 10) || 0; saveSettings(); applySettings(); };
$("vs").oninput = () => { SETTINGS.vs = parseInt($("vs").value, 10) || 0; saveSettings(); applySettings(); };
$("vmute").onclick = () => { SETTINGS.mute = !SETTINGS.mute; saveSettings(); applySettings(); };
applySettings();
renderBentoHub();

function start(k, onlineCfg = null) {
 gameId++;
 const myGame = gameId;
 MATCH_ELIM_ORDER = [];
 n = k; ptr = rnd(n); turn = 1; res = null; P = []; isPaused = false;
 tourElimPromptShown = false; setTourSpectating(false); hideEndOverlays();
 clearTurnTimer(); LOGH.length = 0; renderLog();
 availableSpecs = [...SPEC_POOL].sort(() => Math.random() - 0.5);
 const botNames = ["Тінь", "Кібер", "Лорд"];
 const myNick = (PROFILE.name && PROFILE.name.trim()) ? PROFILE.name.trim() : "ТИ";
 const allNames = [myNick, ...botNames];
 const roster = (TOUR && TOUR.finalists && TOUR.finalists.length === 2)
 ? TOUR.finalists
 : Array.from({ length: k }, (_, i) => i);
 n = roster.length;
 ptr = rnd(n);

 const campNode = (CAMPAIGN && CAMPAIGN.chapter === 1)
   ? (CAMPAIGN_CHAPTER_1.find(x => x.lvl === CAMPAIGN.lvl) || CAMPAIGN_CHAPTER_1[0])
   : null;

 let chosenArena;
 if (onlineCfg) {
   TOUR = null;
   CAMPAIGN = null;
   chosenArena = ARENAS.find(a => a.id === onlineCfg.arenaId) || ARENAS[0];
 } else if (campNode) {
   chosenArena = ARENAS.find(a => a.id === "classic") || ARENAS[0];
 } else if (TOUR) {
   if (!Array.isArray(TOUR.usedArenas)) TOUR.usedArenas = [];
   let pool = ARENAS.filter(a => !TOUR.usedArenas.includes(a.id));
   if (!pool.length) {
     const lastId = TOUR.usedArenas[TOUR.usedArenas.length - 1];
     TOUR.usedArenas = lastId ? [lastId] : [];
     pool = ARENAS.filter(a => a.id !== lastId);
   }
   chosenArena = pool[rnd(pool.length)];
   TOUR.usedArenas.push(chosenArena.id);
 } else {
   chosenArena = ARENAS[rnd(ARENAS.length)];
 }

 const mirrorMasterStart = (!onlineCfg && chosenArena.id === "mirror") ? dealPool(0, chosenArena) : null;
 if (onlineCfg) {
   n = onlineCfg.players.length;
   const myS = onlineCfg.mySeat || 0;
   ptr = (onlineCfg.startPtr - myS + n) % n;
   for (let i = 0; i < n; i++) {
     const cSeat = (myS + i) % n;
     const op = onlineCfg.players[cSeat];
     const bIdx = Number(op.bannerIdx) || 0;
     P.push({
       name: op.name || `Гравець ${cSeat + 1}`,
       tourIdx: i,
       netSeat: op.netSeat ?? cSeat,
       isBot: !!op.isBot,
       crestIdx: Number(op.crestIdx) || 0,
       bannerIdx: bIdx,
       bannerId: (PL_BANNERS[bIdx] && PL_BANNERS[bIdx].id) || "obsidian",
       hp: 100,
       maxHp: 100,
       relicShield: 0,
       echoUsed: false,
       hand: JSON.parse(JSON.stringify(op.hand || [])),
       fx: [],
       alive: true,
       frost: 0,
       reforgeLeft: chosenArena.id === "forge" ? 1 : 0,
       tookPrevDmg: false,
       disorient: 0,
       dsAge: 0,
       healedInMatch: false,
       lastHeal: 0,
       attackedThisRound: false,
       burnImmune: 0,
       lifeRoot: 0,
       lifeRootUsed: false,
       timeLock: 0,
       fortuneBonus: 0,
       fortuneKeep: 0,
       roundHealAmt: 0,
       healedCardThisRound: false
     });
   }
 } else {
 for (let i = 0; i < n; i++) {
 const tidx = roster[i];
 let startHand;
 if (campNode && tidx === 1) {
   startHand = JSON.parse(JSON.stringify(campNode.deck));
 } else if (campNode && tidx === 0) {
   startHand = buildCampaignPlayerDeck(campNode.lvl);
 } else if (mirrorMasterStart) {
   startHand = JSON.parse(JSON.stringify(mirrorMasterStart));
 } else {
   startHand = dealPool(i, chosenArena);
 }
 // Алхімічний Тигель: 2 випадкові зелені карти стають Фіолетовими (r = 2)
 if (TOUR && Array.isArray(TOUR.relics?.[tidx]) && TOUR.relics[tidx].includes("alchemical_crucible")) {
   const greens = startHand.filter(c => c.r === 0 && !isSp(c.t));
   greens.sort(() => Math.random() - 0.5).slice(0, 2).forEach(c => {
     const isHeal = HEAL_CARDS.includes(c.t);
     const pool = CODEX_ENTRIES.filter(e => e.r === 2 && e.cat === (isHeal ? "heal" : "dmg"));
     if (pool.length) { const up = pool[rnd(pool.length)]; c.t = up.t; c.r = 2; }
     else c.r = 2;
   });
 }
 const hasStamina = !!(TOUR && TOUR.relics?.[tidx]?.includes("amulet_stamina"));
 const hasBloodAltar = !!(TOUR && TOUR.relics?.[tidx]?.includes("blood_altar"));
 const hasHermes = !!(TOUR && TOUR.relics?.[tidx]?.includes("trap_hermes"));
 const isCampBoss = !!(campNode && tidx === 1);
 const maxHpVal = isCampBoss ? campNode.hp : (hasStamina ? 115 : 100);
 const initHpVal = isCampBoss ? campNode.hp : (hasBloodAltar ? 75 : maxHpVal);
 const isMe = tidx === 0;
 const botCrestIdx = isMe ? (PROFILE.crest || 0) : isCampBoss ? campNode.crestIdx : ((tidx + rnd(AV_SVG.length)) % AV_SVG.length);
 const botBannerIdx = isMe ? (PROFILE.banner || 0) : isCampBoss ? campNode.bannerIdx : ((tidx + rnd(PL_BANNERS.length)) % PL_BANNERS.length);
 P.push({
 name: isCampBoss ? campNode.boss : (allNames[tidx] || (i ? botNames[i - 1] : myNick)),
 tourIdx: tidx,
 crestIdx: botCrestIdx,
 bannerIdx: botBannerIdx,
 bannerId: (PL_BANNERS[botBannerIdx] && PL_BANNERS[botBannerIdx].id) || "obsidian",
 hp: initHpVal,
 maxHp: maxHpVal,
 relicShield: isCampBoss ? (campNode.shield || 0) : (hasHermes ? 12 : 0),
 echoUsed: false,
 hand: startHand,
 fx: [],
 alive: true,
 frost: 0,
 reforgeLeft: chosenArena.id === "forge" ? 1 : 0,
 tookPrevDmg: !!SESSION_PREV_DMG[tidx],
 disorient: 0,
 dsAge: 0,
 healedInMatch: false,
 lastHeal: 0,
 attackedThisRound: false,
 burnImmune: 0,
 lifeRoot: 0,
 lifeRootUsed: false,
 timeLock: 0,
 fortuneBonus: 0,
 fortuneKeep: 0,
 roundHealAmt: 0,
 healedCardThisRound: false
 });
 }
 }
 $("ov").style.display = "none";
 // Повністю очищаємо попередній стіл, карти на столі та стрілки ще до показу Арени
 CU = { a: -1, d: -1 };
 arrowKey = "";
 T = {};
 $("table").innerHTML = "";
 $("arrows").innerHTML = "";
 $("banner").innerHTML = "";
 REFORGE_MODE = false; ECLIPSE_PHASE = 'day'; ECLIPSE_ROUND = 1; ASTRAL_RARITY = 0;
 if (chosenArena) chosenArena._mirrorDecks = {};
 applyArena(chosenArena);
 updateReforgeUI();
 STAT = TOUR && TOUR.stat ? TOUR.stat : Array.from({ length: TOUR ? TOUR.n : n }, () => ({ dmg: 0, big: 0, specs: 0 }));
 if (TOUR) TOUR.stat = STAT;
 snd("throw");
 musicStart();
 const ICICLES = `<svg class="icicles" viewBox="0 0 100 26" preserveAspectRatio="none"><defs><linearGradient id="icg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#bae6fd"/><stop offset="1" stop-color="#38bdf8" stop-opacity=".55"/></linearGradient></defs><path d="M0 0H100V4L96 4 93 16 90 4 84 4 81 24 78 4 70 4 67 12 64 4 55 4 52 20 49 4 40 4 37 14 34 4 26 4 23 26 20 4 12 4 9 12 6 4 0 4Z" fill="url(#icg)" stroke="#e8f8ff" stroke-width=".8" stroke-linejoin="round"/><path d="M81 6L81.4 20M23 6L23.4 22M52 6L52.3 16" stroke="#fff" stroke-width=".9" opacity=".9"/><circle class="dr" cx="81" cy="25" r="1.4" fill="#e0f7ff"/><circle class="dr dr2" cx="23" cy="27" r="1.4" fill="#e0f7ff"/></svg>`;
 $("seats").innerHTML = P.map((p, i) => {
 const rIcons = getPlayerRelics(i).map(r =>
   `<span class="relic-badge tier-${r.tier}" data-p="${i}" data-rid="${r.id}" title="${r.name} (${r.tierName}): ${r.desc}">${r.icon}</span>`
 ).join("");
 return buildPlayerPlaqueHtml({
   id: `p${i}`,
   nick: p.name,
   crestIdx: p.crestIdx ?? 0,
   bannerIdx: p.bannerIdx ?? 0,
   hpText: `${p.hp} ${UI_IC.heart} · ${p.hand.length} ${UI_IC.card}`,
   relicsHtml: rIcons,
   iciclesHtml: ICICLES,
   isMenuPreview: false
 });
 }).join("");
 cam = 0;
 place();
 focus(0);
 renderHand();
 upd();

 // Одразу ховаємо стіл, кільце, плашки та карти ДО показу назви Арени!
 const tbl = $("tbl");
 const ringSvg = $("ring");
 const handEl = $("hand");
 const seats = P.map((_, i) => $("p" + i)).filter(Boolean);
 const handCards = handEl ? Array.from(handEl.children) : [];
 const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
 if (!reduce) {
 if (tbl) { tbl.style.opacity = "0"; tbl.style.transform = "scale(0.55)"; }
 if (ringSvg) { ringSvg.style.opacity = "0"; ringSvg.style.transform = "scale(0.65) rotate(-60deg)"; }
 seats.forEach(s => {
 s.style.opacity = "0";
 s.style.transform = "translate(-50%, -50%) scale(0.55)";
 const fillArc = s.querySelector(".hp-fill-arc");
 if (fillArc) fillArc.setAttribute("stroke-dasharray", "0 226.2");
 });
 handCards.forEach(c => { c.style.opacity = "0"; });
 }

 (async () => {
 await announceArenaIntro(chosenArena, myGame);
 if (myGame !== gameId) return;
 await altarAwakeningIntro(myGame);
 if (myGame !== gameId) return;
 if (chosenArena && chosenArena.id === "swamp") {
 P.forEach((p, idx) => {
 p.fx.push({ t: "g", v: 10, left: 1 });
 pop(idx, "+10 РЕГЕН", "#a3e635");
 burst(idx, "#a3e635");
 });
 snd("heal");
 upd();
 await sl(420);
 }
 if (myGame === gameId) run(myGame);
 })();
}

// ВАРІАНТ 1: «Пробудження Вівтаря» (Магічно-ритуальний старт матчу ~1.5 с — запускається ПІСЛЯ назви Арени)

function getPlayerPos(i, S) {
 const a = i * 2 * Math.PI / n;
 const rad = (innerWidth < 520 ? 0.34 : 0.38) * S;
 return [
 S / 2 - rad * Math.sin(a),
 S / 2 + rad * Math.cos(a)
 ];
}

function place() {
 const S = Math.min($("stage").clientWidth, $("stage").clientHeight) || 300;
 const w = $("world");
 w.style.width = w.style.height = S + "px";
 let ch = "";
 for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8, x = S / 2 + .3 * S * Math.cos(a), y = S / 2 + .3 * S * Math.sin(a); ch += `<path d="M-6 -8L5 0L-6 8" transform="translate(${x} ${y}) rotate(${a * 180 / Math.PI + 90})" fill="none" stroke="#e2b86bcc" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`; }
 $("ring").setAttribute("viewBox", `0 0 ${S} ${S}`);
 $("ring").innerHTML = `<g class="ring-rotor" style="transform-origin:${S / 2}px ${S / 2}px"><animateTransform attributeName="transform" type="rotate" from="0 ${S / 2} ${S / 2}" to="360 ${S / 2} ${S / 2}" dur="22s" repeatCount="indefinite"/>${ch}</g>`;
 P.forEach((p, i) => {
 const [px, py] = getPlayerPos(i, S);
 const e = $("p" + i);
 if (!e) return;
 e.style.left = px + "px";
 e.style.top = py + "px";
 });
}

function focus(i) {
 const w = $("world"), S = w.offsetWidth, a = i * 2 * Math.PI / n;
 const dx = .38 * S * Math.sin(a) * .06, dy = -.38 * S * Math.cos(a) * .06;
 w.style.transform = `translate(${dx}px, ${dy}px) rotateX(16deg) scale(.97)`;
}


const isColosseumHex = (c, ownerHp = 100) => !!(c && (c._colHex || (CUR_ARENA && CUR_ARENA.id === "colosseum" && ownerHp > 60 && HEAL_CARDS.includes(c.t))));
function colosseumHexDmg(c, ownerHp = 100) {
 if (c && c._colHexDmg) return c._colHexDmg;
 let base = val(c, ownerHp);
 if (c.t === "H" && ownerHp < 40) base += 8;
 if (c.t === "6" && ownerHp < 30) base += 7;
 return Math.max(1, Math.round(base * 0.5));
}


function blob(c, N, amp, jag) {
 let pts = [];
 for (let k = 0; k < N; k++) {
 const t = 2 * Math.PI * k / N, cx = Math.cos(t), sy = Math.sin(t);
 const o = jag ? (k % 2 ? -amp : amp) : amp * Math.sin(k * 1.7);
 pts.push((50 + (40 + o) * Math.sign(cx) * Math.pow(Math.abs(cx), .55)).toFixed(1) + "," + (70 + (58 + o) * Math.sign(sy) * Math.pow(Math.abs(sy), .55)).toFixed(1));
 }
 return `<polygon points="${pts.join(" ")}" fill="none" stroke="${c}" stroke-width="1.4" stroke-linejoin="round"/>`;
}
function backSvg(k, styleId = null) {
 const st = styleId || (typeof PROFILE !== "undefined" && PROFILE && PROFILE.cardBack) || "classic";
 const [origC, origM, origB] = BK[k] || BK.s;
 const themePal = {
   meander:     ["#fde047", "#5c2b06", "#160902", "#f59e0b"],
   frost_back:  ["#bae6fd", "#0c4a6e", "#041426", "#38bdf8"],
   astral_back: ["#e879f9", "#3b0764", "#090318", "#a855f7"],
   forge_back:  ["#fdba74", "#7f1d1d", "#180404", "#f97316"]
 };
 const pal = themePal[st];
 const c = origC;
 const borderCol = pal ? pal[0] : origC;
 const m = pal ? pal[1] : origM;
 const b = pal ? pal[2] : origB;
 const id = `b${k}_${++_backSvgUid}`;
 const q = f => ["", "translate(100 0) scale(-1 1)", "translate(0 140) scale(1 -1)", "translate(100 140) scale(-1 -1)"].map(t => `<g transform="${t}">${f}</g>`).join("");
 let corner = "", frame = "", emb = "", customDeco = "";

 if (st === "meander") {
   customDeco = `<rect x="7.5" y="7.5" width="85" height="125" rx="3" fill="none" stroke="#fde047" stroke-width="1.3" stroke-dasharray="6 2 2 2" opacity=".75"/>` +
     q(`<path d="M9 9h14v5h-9v5h5v-2" fill="none" stroke="#fde047" stroke-width="1.4" opacity=".85"/>`);
 } else if (st === "frost_back") {
   customDeco = `<g stroke="#bae6fd" stroke-opacity=".35" stroke-width="1"><polygon points="50,14 84,70 50,126 16,70" fill="none"/><polygon points="50,24 76,70 50,116 24,70" fill="none"/></g>` +
     q(`<path d="M10 10L24 10M10 10L10 24M10 10L20 20" stroke="#e0f2fe" stroke-width="1.3" opacity=".8"/>`);
 } else if (st === "astral_back") {
   customDeco = `<g fill="none" stroke="#e879f9" stroke-opacity=".4"><circle cx="50" cy="70" r="42" stroke-dasharray="3 4"/><ellipse cx="50" cy="70" rx="40" ry="18" transform="rotate(-28 50 70)"/><ellipse cx="50" cy="70" rx="40" ry="18" transform="rotate(28 50 70)"/></g>` +
     `<g fill="#fae8ff" opacity=".85"><circle cx="20" cy="24" r="1.4"/><circle cx="80" cy="28" r="1.3"/><circle cx="22" cy="116" r="1.5"/><circle cx="78" cy="112" r="1.2"/><circle cx="50" cy="18" r="1.7"/><circle cx="50" cy="122" r="1.7"/></g>`;
 } else if (st === "forge_back") {
   customDeco = `<g fill="none" stroke="#fb923c" stroke-opacity=".45" stroke-width="1.2"><path d="M12 36L34 52L20 76L36 96"/><path d="M88 36L66 52L80 76L64 96"/><polygon points="50,14 86,34 86,106 50,126 14,106 14,34" stroke="#fde047" stroke-opacity=".45"/></g>`;
 }

 if (k === "d") {
 corner = q(`<path d="M5 5H27Q11 10 5 27Z" fill="url(#${id}a)"/><circle cx="8.5" cy="8.5" r="1.6" fill="#fff"/>`);
 frame = blob(borderCol, 56, 5, true);
 emb = `<g transform="rotate(40 50 70)"><polygon points="50,32 56,46 55,87 45,87 44,46" fill="url(#${id}s)" stroke="#fff" stroke-width=".6"/><line x1="50" y1="40" x2="50" y2="84" stroke="#ffffff99" stroke-width="1"/><rect x="36" y="87" width="28" height="6" rx="3" fill="#ffd9a0" stroke="#7a4a10" stroke-width=".6"/><rect x="46.5" y="93" width="7" height="14" rx="2" fill="#5a1620"/><circle cx="50" cy="110" r="4" fill="${c}" stroke="#fff" stroke-width=".8"/></g>`;
 } else if (k === "h") {
 corner = q(`<rect x="6" y="6" width="16" height="16" rx="2" fill="none" stroke="${borderCol}" stroke-width="1.6"/><rect x="10" y="10" width="8" height="8" fill="${c}"/>`);
 frame = blob(borderCol, 72, 3.2, false);
 emb = `<path d="M41 47h18v19h19v18H59v19H41V84H22V66h19z" fill="url(#${id}s)" stroke="#fff" stroke-width=".8"/><path d="M45 52h10v19h19v8H55v19H45V79H26v-8h19z" fill="#ffffff55"/><g fill="#fff"><circle cx="50" cy="42" r="2"/><circle cx="50" cy="108" r="2"/><circle cx="17" cy="75" r="2"/><circle cx="83" cy="75" r="2"/></g>`;
 } else if (k === "q") {
 corner = q(`<path d="M5 5H27Q11 10 5 27Z" fill="url(#${id}a)"/><circle cx="8.5" cy="8.5" r="1.6" fill="#ccfbf1"/>`);
 frame = blob(borderCol, 64, 3.8, false) + `<circle cx="50" cy="70" r="31" fill="none" stroke="${borderCol}" stroke-dasharray="4 3" stroke-width="1.1"/>`;
 emb = `<path d="M40 54 C40 43 60 43 60 54 C60 62 50 64 50 73" fill="none" stroke="url(#${id}s)" stroke-width="7.5" stroke-linecap="round"/><path d="M40 54 C40 43 60 43 60 54 C60 62 50 64 50 73" fill="none" stroke="#ffffff" stroke-width="1.4" stroke-linecap="round" opacity="0.75"/><circle cx="50" cy="87" r="4.6" fill="url(#${id}s)" stroke="#ffffff" stroke-width="1"/>`;
 } else {
 corner = q(`<path d="M5 5L27 10L18 14L29 25L25 29L14 18L10 27Z" fill="url(#${id}a)"/>`);
 let r = ""; for (let t = 0; t < 24; t++) { const a = t * Math.PI / 12, l = t % 2 ? 40 : 46; r += `<line x1="${50 + 30 * Math.cos(a)}" y1="${70 + 30 * Math.sin(a)}" x2="${50 + l * Math.cos(a)}" y2="${70 + l * Math.sin(a) * 1.4}" stroke="${borderCol}" stroke-opacity=".55" stroke-width="1"/>`; }
 frame = r + `<circle cx="50" cy="70" r="33" fill="none" stroke="${borderCol}" stroke-dasharray="3 3" stroke-width="1"/>`;
 emb = `<polygon points="50,40 77,88 23,88" fill="url(#${id}s)" stroke="#fff" stroke-width=".7"/><polygon points="50,100 23,52 77,52" fill="url(#${id}s)" fill-opacity=".85" stroke="#fff" stroke-width=".7"/><polygon points="50,58 62,78 38,78" fill="${b}" fill-opacity=".6"/><circle cx="50" cy="70" r="3" fill="#fff"/>`;
 }
 return `<svg viewBox="0 0 100 140" preserveAspectRatio="none" style="width:100%;height:100%;display:block"><defs>
<linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${m}"/><stop offset="1" stop-color="${b}"/></linearGradient>
<linearGradient id="${id}a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="${borderCol}"/><stop offset="1" stop-color="${m}"/></linearGradient>
<linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="${c}"/><stop offset="1" stop-color="${m}"/></linearGradient>
<radialGradient id="${id}d"><stop offset="0" stop-color="${c}" stop-opacity=".6"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>
<pattern id="${id}p" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0H8M0 0V8" stroke="${borderCol}" stroke-opacity=".14" stroke-width=".6"/></pattern></defs>
<rect width="100" height="140" fill="url(#${id}g)"/><rect width="100" height="140" fill="url(#${id}p)"/>
<rect x="2.5" y="2.5" width="95" height="135" rx="6" fill="none" stroke="${borderCol}" stroke-width="1.6"/><rect x="5" y="5" width="90" height="130" rx="4" fill="none" stroke="${borderCol}" stroke-opacity=".42" stroke-width=".6"/>
${customDeco}${frame}<circle cx="50" cy="70" r="38" fill="url(#${id}d)"/>${corner}${emb}
<g fill="#fff"><circle cx="30" cy="30" r=".9"/><circle cx="72" cy="40" r=".7"/><circle cx="26" cy="108" r=".8"/><circle cx="76" cy="104" r="1"/></g></svg>`;
}

// ВИПРАВЛЕНО: Стрілка використовує точні координати getPlayerPos
let arrowKey = "";
function drawArrow() {
 const key = CU.a + ">" + CU.d + (CU.tar ? ":T" : ""); if (key === arrowKey) return; arrowKey = key;
 const svg = $("arrows"), S = $("world").offsetWidth;
 svg.setAttribute("viewBox", `0 0 ${S} ${S}`);
 if (CU.a < 0 || CU.d < 0) { svg.innerHTML = ""; return; }
 // Якщо діє Смола Аїда (CU.tar), стрілка світиться фіолетовим і вказує на уповільненого гравця (бо тепер ходять НА нього)
 const fromIdx = CU.tar ? CU.d : CU.a;
 const toIdx = CU.tar ? CU.a : CU.d;
 const [x1, y1] = getPlayerPos(fromIdx, S);
 const [x2, y2] = getPlayerPos(toIdx, S);
 const L = Math.hypot(x2 - x1, y2 - y1) || 1, ux = (x2 - x1) / L, uy = (y2 - y1) / L, pd = 54;
 const col = CU.tar ? "#c084fc" : (CU.a === 0 ? "#ff5a4d" : CU.d === 0 ? "#4db8ff" : "#aeb8e8");
 const glowW = CU.tar ? 10 : 6;
 const glowOp = CU.tar ? 0.65 : 0.35;
 svg.innerHTML = `<defs><marker id="ah" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="${col}"/></marker><filter id="gl"><feGaussianBlur stdDeviation="${CU.tar ? 4.5 : 3}"/></filter></defs>
 <line x1="${x1 + ux * pd}" y1="${y1 + uy * pd}" x2="${x2 - ux * pd}" y2="${y2 - uy * pd}" stroke="${CU.tar ? '#9333ea' : col}" stroke-width="${glowW}" opacity="${glowOp}" filter="url(#gl)"/>
 <line class="adash" x1="${x1 + ux * pd}" y1="${y1 + uy * pd}" x2="${x2 - ux * pd}" y2="${y2 - uy * pd}" stroke="${col}" stroke-width="${CU.tar ? 3.8 : 3}" stroke-dasharray="12 10" marker-end="url(#ah)"/>`;
}
window.onresize = () => { if (P.length) { place(); arrowKey = ""; drawArrow(); layoutWheel($("hand")); } if ($("glory-ov")?.classList.contains("open")) updateGloryTrackFill($("glory-ov"), PROFILE.trophies || 0); };


function upd() {
 setTimeout(drawArrow, 0);
 if (MU && P) MU.tense = P.some(p => p.alive && p.hp < 35);
 P.forEach((p, i) => {
 const e = $("p" + i);
 if (!e) return;
 const h = Math.max(0, p.hp);
 const isEffAtt = CU.tar ? (i === CU.d) : (i === CU.a);
 const isEffDef = CU.tar ? (i === CU.a) : (i === CU.d);
 e.className = "pl pl-medallion banner-" + (p.bannerId || "obsidian") + (p.alive ? "" : " dead") + (isEffAtt ? " att" : isEffDef ? " def" : "") + (p.alive && p.frost ? " frozen" : "") + (p.alive && p.fx.some(f => f.t === "b") ? " burn" : "") + (p.alive && p.fx.some(f => f.t === "p") ? " poisoned" : "") + (p.alive && p.thorn > 0 ? " thorn has-thorns" : "") + (p.alive && p.shellDef > 0 ? " has-shell" : "") + (p.alive && p.slow > 0 ? " tar-slowed" : "") + (p.alive && p.revHeal > 0 ? " rev-heal" : "") + (p.alive && p.disorient > 0 ? " disoriented" : "") + (p.alive && p.burnImmune > 0 ? " burn-immune" : "") + (p.alive && p.lifeRoot > 0 ? " has-life-root" : "") + (p.alive && p.fx.some(f => f.t === "sc") ? " sac-cursed" : "");
 syncThornAura(i, p, e);
 syncShellAura(i, p, e);
 const rt = $("rt" + i);
 if (rt) {
 if (isEffAtt && p.alive) { rt.style.display = "block"; rt.className = "role-tag tag-att"; rt.innerHTML = CU.tar ? `${UI_IC.bolt} ПЕРЕХОПЛЕННЯ` : "АТАКУЄ"; }
 else if (isEffDef && p.alive) { rt.style.display = "block"; rt.className = "role-tag tag-def"; rt.innerHTML = (CU.tar && i === CU.a) ? `${UI_IC.hourglass} ЗАХИСТ` : "ЗАХИСТ"; }
 else { rt.style.display = "none"; }
 }
 const maxH = p.maxHp || 100;
 const pct = Math.min(100, Math.max(0, (h / maxH) * 100));
 const arcLen = 169.65;
 const fillDash = ((pct / 100) * arcLen).toFixed(1);
 const arcCol = `hsl(${Math.round(pct * 1.2)}, 82%, 48%)`;
 const fillArc = e.querySelector(".hp-fill-arc");
 if (fillArc) {
   fillArc.setAttribute("stroke-dasharray", `${fillDash} 226.2`);
   fillArc.setAttribute("stroke", arcCol);
 }
 const b = e.querySelector("i");
 if (b) { b.style.width = pct + "%"; b.style.background = arcCol; }
 const sts = e.querySelector(".sts"), shtml = stsHtml(i, p);
 if (sts && e._sig !== shtml) { e._sig = shtml; sts.innerHTML = shtml; }
 const shTxt = p.relicShield > 0 ? ` ${UI_IC.shield}${p.relicShield}` : "";
 e.querySelector("small").innerHTML = `${h} ${UI_IC.heart}${shTxt} · ${p.hand.length} ${UI_IC.card}`;
 if (!p.alive && !p.sliced) { p.sliced = true; sliceSeat(i, e); }
 });
 renderHand();
}


function recordHeal(pIdx, amt, markMatchHeal = false) {
 const p = P[pIdx];
 if (!p) return;
 if (amt > 0) {
  p.lastHeal = amt;
  p.roundHealAmt = (p.roundHealAmt || 0) + amt;
 }
 if (markMatchHeal) {
  p.healedInMatch = true;
  p.healedCardThisRound = true;
 }
}

function resolveDeathOrSave(idx, evArr = null) {
 const p = P[idx];
 if (!p || p.hp > 0) return false;
 if (p.lifeRoot > 0 && !p.lifeRootUsed) {
  p.lifeRoot = 0;
  p.lifeRootUsed = true;
  p.hp = Math.min(p.maxHp || 100, 15);
  p.alive = true;
  recordHeal(idx, p.hp, false);
  if (typeof lifeRootSaveFx === "function") lifeRootSaveFx(idx);
  const msg = `${p.name}: «Коріння Життя» рятує від загибелі (HP → ${p.hp})!`;
  if (evArr) evArr.push(msg); else pushLog(msg);
  upd();
  return false;
 }
 const wasAlive = !!p.alive;
 p.hp = 0;
 p.alive = false;
 if (wasAlive) {
  const deadId = p.tourIdx ?? idx;
  if (!MATCH_ELIM_ORDER.includes(deadId)) MATCH_ELIM_ORDER.push(deadId);
 }
 return true;
}

function cleanseOneDebuff(idx, fzMap = null) {
 const p = P[idx];
 if (!p) return null;
 const order = NEGATIVE_KEYS.filter(k => {
  if (!EFFECT_DEFS[k].active(p)) return false;
  if (k === "pz" && !(p.fx || []).some(f => f.t === "p" && !f.uncurable)) return false;
  return true;
 });
 if (!order.length) return null;
 const pickedKey = order[0];
 const hadFrost = pickedKey === "fz" && !!p.frost;
 EFFECT_DEFS[pickedKey].clear(p);
 if (hadFrost) {
  if (fzMap) fzMap[idx] = false;
  if (typeof frostShatter === "function") frostShatter(idx);
 }
 if (pickedKey === "stn" && idx === 0) renderHand();
 return { key: pickedKey, name: EFFECT_DEFS[pickedKey].name };
}

const DESC = {
 o: (c, v) => `Легендарна: ${v} шкоди. Миттєво розсіює всі бафи цілі (відновлення, шипи) і руйнує її щит чи дзеркало.`,
 a: (c, v) => `Червона карта: ${v} шкоди одразу + «Горіння»: ще −15 HP наприкінці наступного кола.`,
 t: () => `Червона карта: +${healAmt(30)} HP та бар'єр «Шипи» ${UI_IC.rose} 35%: наступні 2 удари повертають 35% шкоди нападнику.`,
 e: () => `Легендарний ультимейт: рулетка мастей. ${UI_IC.suitSpade} −40 (пробиває щит) · ${UI_IC.suitHeart} +${healAmt(30)} HP, ворог −30% на наступну дію · ${UI_IC.suitDiamond} −15 і +10 до карт атаки в руці · ${UI_IC.suitClub} −20 і скидання випадкової карти ворога.`,
 n: () => `Легендарна: +${healAmt(40)} HP собі та повне спалення всіх дебафів — отрути, горіння, заморозки й слабкості — сонячним світлом.`,
 q: (c, v) => `Завдає ${v} шкоди й перетворює 1 випадкову карту в руці ворога на камінь на 2 кола — її не можна розіграти.`,
 y: (c, v) => `Завдає ${v} шкоди й охолоджує ціль: її наступна атака ослаблена на 5.`,
 j: (c, v) => `Епічна: завдає ${v} шкоди при атаці першим або ${v + 7} шкоди із засідки, якщо ти захищаєшся (ходиш другим у дуелі)!`,
 l: (c, v) => `Епічна: завдає ${v} прямої шкоди та накладає «Блок зцілення» ${UI_IC.chain} — наступне лікування чи регенерація ворога згорає.`,
 c: () => `Спецкарта-дзеркало: копіює карту, яку обрав опонент у цій дуелі, та розігрує її з силою 125% (×1.25)!`,
 H: (c, v) => `Синя карта здоров'я: відновлює +${healAmt(v)} HP; якщо твоє здоров'я нижче 40 HP, дає додатково +${healAmt(26) - healAmt(v)} HP (разом +${healAmt(26)} HP).`,
 D: (c, v) => `Синя карта шкоди: завдає −${v} HP; якщо у ворога більше 80 HP, шкода зростає до −${v + 6} HP.`,
 A: (c, v) => `Епічна карта шкоди: завдає −${v} HP одразу та накладає «Уповільнення» ${UI_IC.hourglass} — у наступній дуелі дія ворога втрачає пріоритет (він ходить другим).`,
 C: () => `Фіолетова карта: від 5 до 35 шкоди. Чим вище — тим сильніше`,
 S: (c, v) => `Зелена карта: завдає ${v} прямої шкоди кам'яним валуном.`,
 P: (c, v) => `Синя карта: завдає ${v} шкоди одразу та накладає отруту −10 HP на ${2 + durBonus()} кола.`,
 F: (c, v) => `Синя карта здоров'я: відновлює +${healAmt(v)} HP, або +${healAmt(21)} HP, якщо на тобі немає жодного дебафа.`,
 T: (c, v) => `Синя карта здоров'я: відновлює +${healAmt(v)} HP та огортає тебе синім «Панцирем» ${UI_IC.shield} −25%: наступна атака суперника завдасть на 25% менше шкоди.`,
 W: (c, v) => `Фіолетова карта: завдає ${v} шкоди, або ${v + 7} шкоди, якщо ти вже отримував шкоду в попередній дуелі.`,
 G: (c, v) => `Червона карта: завдає ${v} шкоди одразу та підпалює ціль (${UI_IC.fire} −15 HP наприкінці наступного кола).`,
 L: (c, v) => `Червона карта: завдає ${v} шкоди, або критичні ${v + 8} шкоди, якщо твоє здоров'я нижче 50 HP.`,
 E: (c, v) => `Червона карта: завдає ${v} шкоди та накладає «Зворотне зцілення» ${UI_IC.brokenHeart} на 1 хід — наступний хіл ворога завдасть йому шкоди замість лікування.`,
 B: (c, v) => `Червона карта здоров'я: відновлює +${healAmt(v)} HP одразу та накладає регенерацію +${healAmt(10)} HP щокола протягом ${2 + durBonus()} кіл.`,
 K: (c, v) => `Червона карта здоров'я: відновлює +${healAmt(v)} HP та підсилює 1 випадкову карту атаки в твоїй руці на +8 шкоди.`,
 N: () => `Спецкарта рівноваги: вирівнює здоров'я між тобою і суперником до спільного середнього значення.`,
 d: (c, v) => `Завдає ${v} прямої шкоди цілі.`,
 p: (c) => `Отрута: −15 HP щокола протягом ${DUR[c.r] + durBonus()} кіл. Ефекти складаються. Щит блокує, Дзеркало повертає.`,
 h: (c, v) => `Одразу відновлює +${healAmt(v)} HP.`,
 g: (c) => `Відновлення: +${healAmt(20)} HP щокола протягом ${DUR[c.r] + durBonus()} кіл.`,
 s: (c, v) => `Блокує удар і б'є у відповідь на ${v}. Якщо ворог не атакує — +${healAmt(6)} HP.`,
 v: (c, v) => `Завдає ${v} шкоди й лікує тебе на ${healAmt(v)}.`,
 f: (c, v) => `Потужний вогняний удар: ${v} шкоди.`,
 I: (c, v) => `Зелена карта: завдає ${v} прямої шкоди палицею.`,
 J: (c, v) => `Зелена карта: завдає ${v} прямої шкоди гострим ножем.`,
 M: (c, v) => `Зелена карта: завдає ${v} прямої шкоди важкою сокирою.`,
 O: (c, v) => `Зелена карта: завдає ${v} прямої шкоди латунним кастетом.`,
 R: (c, v) => `Синя карта: завдає ${v} прямої шкоди болтом арбалета.`,
 U: (c, v) => `Синя карта: завдає ${v} прямої шкоди стрілою з лука.`,
 V: (c, v) => `Синя карта: завдає ${v} прямої шкоди шипованою булавою.`,
 X: (c, v) => `Синя карта: завдає ${v} прямої шкоди ударом молота.`,
 Q: (c, v) => `Синя карта: завдає ${v} шкоди, або ${v + 6}, якщо ціль під будь-яким дебафом.`,
 Y: (c, v) => `Фіолетова карта: два швидкі удари по ${v / 2} шкоди поспіль (разом ${v}).`,
 Z: (c, v) => `Фіолетова карта: завдає ${v} шкоди та пробиває блок Егіди — захисна спецкарта її не зупиняє.`,
 1: (c, v) => `Зелена карта здоров'я: відновлює +${healAmt(v)} HP.`,
 2: (c, v) => `Зелена карта здоров'я: відновлює +${healAmt(v)} HP.`,
 3: (c, v) => `Синя карта здоров'я: відновлює +${healAmt(v)} HP.`,
 4: (c, v) => `Синя карта здоров'я: відновлює +${healAmt(v)} HP.`,
 5: (c, v) => `Синя карта здоров'я: відновлює +${healAmt(v)} HP.`,
 6: (c, v) => `Синя карта здоров'я: відновлює +${healAmt(v)} HP; якщо твоє здоров'я нижче 30 HP, дає +${healAmt(v + 7)} HP.`,
 7: (c, v) => `Фіолетова карта: завдає ${v} прямої шкоди; якщо у суперника більше HP, ніж у тебе, додатково знімає половину різниці (до +14 HP, разом до ${v + 14}).`,
 8: (c, v) => `Фіолетова карта здоров'я: відновлює +${healAmt(v)} HP одразу, накладає регенерацію +${healAmt(8)} HP на ${2 + durBonus()} кола та зменшує силу наступної атаки ворога на −5 HP.`,
 9: (c, v) => `Легендарна карта: завдає ${v} прямої шкоди основній цілі; якщо за столом більше двох гравців, клинок розколюється на золоті уламки й додатково вражає всіх інших суперників по ${dmgAmt(10, c)} HP.`,
 0: (c, v) => `Червона карта: завдає ${v} шкоди супернику золотою хваткою та миттєво відновлює +${healAmt(15, c)} HP власнику.`,
 α: (c, v) => `Зелена карта: завдає ${v} прямої шкоди каменем із мисливської пращі.`,
 β: (c, v) => `Зелена карта: завдає ${v} прямої шкоди гострим дзьобом гарпії.`,
 γ: (c, v) => `Зелена карта: завдає ${v} прямої шкоди масивним гранітним молотком муляра.`,
 δ: (c, v) => `Зелена карта: завдає ${v} прямої шкоди легким метальним дротиком пельтаста.`,
 ε: (c, v) => `Зелена карта: завдає ${v} прямої шкоди зазубреним кривим ножем найманця.`,
 ζ: (c, v) => `Синя карта: завдає ${v} шкоди, або ${v + 4} шкоди (МОРОЗ), якщо на цілі немає жодних активних статусів.`,
 η: (c, v) => `Синя карта: завдає ${v} шкоди та ігнорує легкі ослаблення атаки (охолодження, слабкість, мороз −50%), але не пробиває важкі щити й дзеркала.`,
 θ: (c, v) => `Фіолетова карта: завдає ${v} шкоди; якщо у ворога ≤ 40 HP, нитка долі обривається й удар завдає фатальні ${v + 8} шкоди.`,
 ι: (c, v) => `Фіолетова карта: завдає ${v} шкоди та накладає «Дезорієнтацію» ${UI_IC.vortex} на 1 хід — наступна карта лікування ворога відновить лише 50% від номіналу.`,
 κ: (c, v) => `Червона карта: завдає ${v} шкоди; якщо у тебе самого ≤ 50 HP, лють бога війни додає +10 HP (разом ${v + 10} шкоди).`,
 λ: (c, v) => `Червона карта: завдає ${v} шкоди; якщо на ворогу висить будь-який негативний статус, розбиває його й завдає +12 HP чистої магматичної шкоди зверху.`,
 μ: (c, v) => `Червона карта: завдає ${v} шкоди та накладає Отруту (−15 HP на ${2 + durBonus()} кола), але знімає −8 HP із самого нападника через токсичну віддачу.`,
 ν: (c, v) => `Червона карта: завдає ${v} шкоди; якщо ворог у цій дуелі вже розігрував лікування/регенерацію або має активний хіл, завдає ще +8 HP (разом ${v + 8}).`,
 ξ: (c, v) => `Легендарна карта: удар блискавкою на ${v} шкоди, який знімає всі позитивні бафи, щити й регенерацію цілі; якщо у ворога було ≥ 2 активні статуси/бафи — завдає додаткові +15 HP (разом ${v + 15}).`,
 ω: (c, v) => `Легендарна карта: завдає ${v} шкоди; якщо у ворога ≤ 35 HP — миттєво добиває крізь дрібні щити. Якщо ворог виживає — забирає 1 випадкову карту з його руки тобі.`,
 π: (c, v) => `Зелена карта здоров’я: миттєво відновлює +${healAmt(v, c)} HP золотим колоском ячменю.`,
 ρ: (c, v) => `Зелена карта здоров’я: миттєво відновлює +${healAmt(v, c)} HP польовою ромашкою.`,
 σ: (c, v) => `Зелена карта здоров’я: миттєво відновлює +${healAmt(v, c)} HP цілющим коренем женьшеню.`,
 τ: (c, v) => `Синя карта здоров’я: відновлює +${healAmt(v, c)} HP; якщо це твоя перша карта лікування в бою, додає ще +${healAmt(6, c)} HP (разом +${healAmt(v + 6, c)} HP).`,
 υ: (c, v) => `Синя карта здоров’я: відновлює +${healAmt(v, c)} HP; якщо твоє поточне HP нижче, ніж у ворога, відновлює +${healAmt(v + 7, c)} HP.`,
 φ: (c, v) => `Фіолетова карта здоров’я: відновлює +${healAmt(v, c)} HP та копіює 25% від останнього лікування суперника в цьому бою як бонус (до +${healAmt(10, c)} HP).`,
 χ: (c, v) => `Фіолетова карта здоров’я: відновлює +${healAmt(v, c)} HP одразу та запалює тепле вогнище на +${healAmt(6, c)} HP щокола (${2 + durBonus()} кола), але не лікує в кола під дією «Горіння».`,
 ψ: (c, v) => `Фіолетова карта здоров’я: відновлює +${healAmt(v, c)} HP; якщо твоє здоров’я ≤ 45 HP, знімає 1 активний негативний статус, не чіпаючи позитивні бафи.`,
 Γ: (c, v) => `Фіолетова карта здоров’я: відновлює +${healAmt(v, c)} HP; якщо ти вже розігрував карту атаки цього кола, додає +${healAmt(8, c)} HP (разом +${healAmt(v + 8, c)} HP).`,
 Δ: (c, v) => `Червона карта здоров’я: миттєво відновлює +${healAmt(v, c)} HP та накладає жертву, яка забирає −8 HP у суперника наприкінці поточного кола.`,
 Φ: (c, v) => `Червона карта здоров’я: відновлює +${healAmt(v, c)} HP та дає імунітет до «Горіння» на 2 кола; якщо ти вже гориш, гасить полум’я й додає +${healAmt(10, c)} HP (разом +${healAmt(v + 10, c)} HP).`,
 Ω: (c, v) => `Легендарна карта здоров’я: миттєво відновлює +${healAmt(v, c)} HP, дає регенерацію +${healAmt(12, c)} HP на ${3 + durBonus()} кола та пасив «Коріння Життя» (1 раз за бій рятує при падінні HP до 0, відновлюючи до 15 HP).`,
 m: () => `Повністю відбиває шкоду або отруту назад в атакуючого.`,
 z: (c, v) => `Завдає ${v} шкоди й оглушує ціль: вона пропускає свій хід.`,
 x: (c, v) => `Завдає ${v} шкоди, а ${v * 2}, якщо у цілі ≤50 HP.`,
 u: (c, v) => `Ультимейт «Хускад»: шкода дорівнює твоєму втраченому HP (100 − HP = ${v}).`,
 w: () => `Ультимейт «Дивна угода»: ви з опонентом міняєтеся всіма картами на руках!`,
 k: (c, v) => `Легендарна карта шкоди: Сковорода б’є ціль по голові на ${v} шкоди.`,
 b: (c, v) => `Легендарна карта шкоди: барабан гримить і розбивається об голову цілі на ${v} шкоди.`,
 i: () => `Крижаний Щит: на наступний хід ворога його карти шкоди діють лише на 50% сили, а спецкарту він викласти не може — вона блокується.`,
 r: () => `Легендарна карта здоров’я: +${healAmt(30)} HP одразу і +${healAmt(10)} HP щокола до кінця гри. Навколо тебе повільно літають три криваві камені.`,
 Σ: (c) => `Червона спецкарта: якщо у поточному раунді опонент грав карту лікування — забирає 50% цього лікування собі та завдає йому ${dmgAmt(16, c)} шкоди; якщо не лікувався — дає тобі +${healAmt(12, c)} HP.`,
 Θ: (c, v) => `Червона спецкарта: завдає ${dmgAmt(v, c)} шкоди та накладає «Окови часу» на 1 раунд — лічильники всіх активних ефектів цілі (отрута, горіння, регенерація) не рухаються цього кола, а її бонуси до сили й лікування зменшуються на 20%.`,
 Λ: () => `Червона спецкарта: зменшує вхідну шкоду в поточній дуелі на 60% і дозволяє передати 1 свій активний негативний статус (отруту або горіння) опоненту.`,
 Ψ: (c, v) => `Легендарна спецкарта: ти втрачаєш 15 HP, але завдаєш ${dmgAmt(v, c)} шкоди; якщо після цього у тебе залишилося ≤ 35 HP, додатково відновлюєш +${healAmt(15, c)} HP (ефект віддачі темряви).`,
 Π: () => `Легендарна спецкарта: оновлює твою руку новими картами й дає +15 до сили першої зіграної атаки або лікування в цьому раунді.`
};


function stsHtml(i, p) {
 if (!p.alive) return "";
 const fx = p.fx || [], out = [];
 const tlCls = p.timeLock > 0 ? " time-locked" : "";
 const chip = (k, ic, txt, extra, cls = "") => `<span class="st ${k}${cls}" data-p="${i}" data-k="${k}"><em>${ic}</em>${txt}${extra || ""}</span>`;
 if (p.shellDef > 0) out.push(chip("sh", UI_IC.shield, "25%"));
 if (p.frost) out.push(chip("fz", UI_IC.snow, "1"));
 if (fx.some(f => f.t === "b")) out.push(chip("bn", UI_IC.fire, "1", "", tlCls));
 if (p.thorn > 0) out.push(chip("th", UI_IC.rose, "35%"));
 if (p.weak) out.push(chip("wk", UI_IC.heart, "30%"));
 if (p.atkDebuff) out.push(chip("ib", UI_IC.snow + UI_IC.swords, String(p.atkDebuff)));
 if (p.noHeal > 0) out.push(chip("hb", UI_IC.chain, String(p.noHeal)));
 if (p.slow > 0) out.push(chip("sl", UI_IC.hourglass, String(p.slow)));
 if (p.revHeal > 0) out.push(chip("rh", UI_IC.brokenHeart, String(p.revHeal)));
 if (p.disorient > 0) out.push(chip("ds", UI_IC.vortex, String(p.disorient)));
 const pz = fx.filter(f => f.t === "p");
 if (pz.length) out.push(chip("pz", UI_IC.skull, Math.max(...pz.map(f => f.left)), pz.length > 1 ? `<span class="x">×${pz.length}</span>` : "", tlCls));
 if (fx.some(f => f.blad)) out.push(chip("bl", UI_IC.heart, "∞"));
 if (p.burnImmune > 0) out.push(chip("bi", UI_IC.fireShield, String(p.burnImmune)));
 if (p.lifeRoot > 0) out.push(chip("lr", UI_IC.tree, "1"));
 const scFx = fx.filter(f => f.t === "sc");
 if (scFx.length) out.push(chip("sc", UI_IC.chalice, String(scFx.reduce((a, f) => a + f.v, 0))));
 const rg = fx.filter(f => f.t === "g" && !f.blad);
 if (rg.length) out.push(chip("rg", UI_IC.plus, Math.max(...rg.map(f => f.left)), rg.length > 1 ? `<span class="x">×${rg.length}</span>` : "", tlCls));
 if (p.timeLock > 0) out.push(chip("tl", UI_IC.chrono, String(p.timeLock)));
 if (p.fortuneBonus > 0) out.push(chip("fb", UI_IC.wheel, `+${p.fortuneBonus}`));
 return out.join("");
}
function statusInfo(i, k) {
 const p = P[i]; if (!p) return null;
 const fx = p.fx || [];
 if (k === "sh") return { t: `${UI_IC.shield} Панцир Черепахи`, d: "Позитивний ефект: наступна атака суперника по тобі завдасть на 25% менше шкоди." };
 if (k === "fz") return { t: `${UI_IC.snow} Крижаний Щит`, d: "На наступний хід цього гравця його карти шкоди діють лише на 50% сили, а спецкарту він викласти не може — вона блокується. Потім лід тріскає." };
 if (k === "pz") {
 const z = fx.filter(f => f.t === "p"); if (!z.length) return null;
 const dm = z.reduce((a, f) => a + f.v, 0), L = Math.max(...z.map(f => f.left));
 return { t: `${UI_IC.skull} Отрута`, d: `−${dm} HP наприкінці кожного кола. Залишилось кіл: ${L}${z.length > 1 ? ` (накладень: ${z.length}, вони складаються)` : ""}. Число на іконці зменшується щокола. Щит блокує отруту, Щит Персея повертає її.` };
 }
 if (k === "bn") return { t: `${UI_IC.fire} Горіння`, d: "Аґнеястра: горіння завдасть −15 HP наприкінці наступного кола." };
 if (k === "th") return { t: `${UI_IC.rose} Шипи`, d: `Наступні удари (залишилось: ${p.thorn}) повертають 35% шкоди нападнику.` };
 if (k === "wk") return { t: `${UI_IC.heart} Приборкання Чирви`, d: "Наступна дія ослаблена на 30% (шкода або лікування)." };
 if (k === "ib") return { t: `${UI_IC.snow}${UI_IC.swords} Крижана голка`, d: `Наступна атака цього гравця ослаблена на ${p.atkDebuff}. Знімається після першого удару.` };
 if (k === "hb") return { t: `${UI_IC.chain} Кайдани Фантома`, d: "Блок зцілення: наступне лікування або регенерація цього гравця повністю згорає без відновлення HP." };
 if (k === "sl") return { t: `${UI_IC.hourglass} Смола Аїда (Уповільнення)`, d: "Наступна дія цього гравця втрачає пріоритет: у своїй наступній дуелі він ходить другим, навіть якщо мав атакувати першим." };
 if (k === "rh") return { t: `${UI_IC.brokenHeart} Зворотне зцілення (Прокляття Ереба)`, d: "Наступне лікування чи регенерація цього гравця перетворюється на пряму шкоду!" };
 if (k === "ds") return { t: `${UI_IC.vortex} Дезорієнтація (Вихор Скілли)`, d: "Наступна карта лікування цього гравця відновить лише 50% від номіналу." };
 if (k === "tl") return { t: `${UI_IC.chrono} Окови часу (Кайдани Кроноса)`, d: "Лічильники всіх активних ефектів цілі (отрута, горіння, регенерація) не рухаються цього кола, а її сила й лікування зменшуються на 20%." };
 if (k === "fb") return { t: `${UI_IC.wheel} Благословення Фортуни (Колесо Фортуни)`, d: `Перша зіграна атака або карта лікування отримає +${p.fortuneBonus} до сили.` };
 if (k === "bl") return { t: `${UI_IC.heart} Блад`, d: "+10 HP наприкінці кожного кола до кінця гри. Знак ∞ — ефект вічний, таймера немає." };
 if (k === "bi") return { t: `${UI_IC.fireShield} Імунітет до горіння (Кров Саламандри)`, d: `Позитивний ефект: блокує накладання та шкоду «Горіння». Залишилось кіл: ${p.burnImmune}.` };
 if (k === "lr") return { t: `${UI_IC.tree} Коріння Життя (Дерево Життя)`, d: "Позитивний пасив (1 раз за партію): якщо твоє здоров’я впаде до 0, ти не гинеш — HP миттєво відновлюється до 15, а ефект згорає." };
 if (k === "sc") {
 const z = fx.filter(f => f.t === "sc"); if (!z.length) return null;
 const dm = z.reduce((a, f) => a + f.v, 0);
 return { t: `${UI_IC.chalice} Жертовна нитка (Жертовний Кубок)`, d: `Відкладене виснаження: наприкінці поточного кола зніме −${dm} HP.` };
 }
 if (k === "rg") {
 const z = fx.filter(f => f.t === "g" && !f.blad); if (!z.length) return null;
 const hl = z.reduce((a, f) => a + f.v, 0), L = Math.max(...z.map(f => f.left));
 const hasHestia = z.some(f => f.hestia);
 return { t: `${UI_IC.plus} Відновлення`, d: `+${hl} HP наприкінці кожного кола. Залишилось кіл: ${L}.${hasHestia ? " Вогнище Гестії не лікує під час «Горіння»." : ""} Число на іконці зменшується щокола.` };
 }
 return null;
}

function initWheel(h) {
 if (window.innerWidth <= 767) return;
 if (h.dataset.wheel) return;
 h.dataset.wheel = "1";
 let down = false, dragged = false, sx = 0, sy = 0, s0 = 0, pid = null, lastX = 0, lastT = 0, vel = 0, flickUpCard = null;

 h.addEventListener("wheel", ev => {
 if (isDesktopHand()) return;
 ev.preventDefault();
 const d = Math.abs(ev.deltaX) > Math.abs(ev.deltaY) ? ev.deltaX : ev.deltaY;
 const maxIdx = Math.max(0, h.children.length - 1);
 h._sel = Math.max(-0.35, Math.min(maxIdx + 0.35, (h._sel ?? 0) + d / 65));
 layoutWheel(h);
 clearTimeout(h._wt);
 h._wt = setTimeout(() => snapWheel(h, h._sel), 130);
 }, { passive: false });

 h.addEventListener("pointerdown", ev => {
 if (isDesktopHand()) return;
 down = true; dragged = false; pid = ev.pointerId;
 sx = lastX = ev.clientX; sy = ev.clientY; s0 = h._sel ?? 0; lastT = performance.now(); vel = 0;
 flickUpCard = ev.target && ev.target.closest ? ev.target.closest(".card") : null;
 });
 h.addEventListener("pointermove", ev => {
 if (!down || isDesktopHand()) return;
 const dx = ev.clientX - sx, dy = ev.clientY - sy;
 if (!dragged && dy < -38 && Math.abs(dy) > Math.abs(dx) * 1.4 && flickUpCard) {
 down = false;
 hideTip();
 flickUpCard.click();
 flickUpCard = null;
 return;
 }
 if (!dragged && Math.abs(dx) > 6) {
 dragged = true;
 h.classList.add("dragging");
 try { h.setPointerCapture(pid); } catch (e) {}
 }
 if (!dragged) return;
 const now = performance.now();
 vel = (ev.clientX - lastX) / Math.max(1, now - lastT);
 lastX = ev.clientX; lastT = now;
 const maxIdx = Math.max(0, h.children.length - 1);
 let next = s0 - dx / WHEEL_PX;
 if (next < 0) next *= 0.35;
 else if (next > maxIdx) next = maxIdx + (next - maxIdx) * 0.35;
 h._sel = next;
 layoutWheel(h);
 });
 const release = () => {
 if (!down) return;
 down = false;
 if (!dragged) return;
 h.classList.remove("dragging");
 h.dataset.justDragged = "1";
 setTimeout(() => { delete h.dataset.justDragged; }, 0);
 if (performance.now() - lastT > 80) vel = 0;
 snapWheel(h, (h._sel ?? 0) - vel * 160 / WHEEL_PX);
 };
 h.addEventListener("pointerup", release);
 h.addEventListener("pointercancel", release);
 h.addEventListener("click", ev => {
 if (h.dataset.justDragged) { ev.stopPropagation(); ev.preventDefault(); }
 }, true);
}

function layoutWheel(h) {
 initWheel(h);
 const cards = [...h.children];
 const n = cards.length;
 if (!n) return;

 // На ПК (768px+): усі карти відкрито в один ряд без прокрутки та обрізання
 if (isDesktopHand()) {
 const mid = (n - 1) / 2;
 cards.forEach((el, i) => {
 const diff = i - mid;
 const rot = diff * 1.6;
 const y = Math.pow(Math.abs(diff), 1.6) * 0.9;
 el.classList.remove("active-fan");
 el.style.removeProperty("--wx");
 el.style.setProperty("--wy", y.toFixed(1) + "px");
 el.style.setProperty("--wr", rot.toFixed(2) + "deg");
 el.style.setProperty("--ws", "1");
 el.style.zIndex = String(i + 1);
 el.style.opacity = "1";
 el.style.pointerEvents = "";
 });
 return;
 }

 // На телефоні (<768px): чистий 4-слотовий док зі свайпом (без віяла)
 cards.forEach((el, i) => {
  el.classList.remove("active-fan");
  el.style.removeProperty("--wx");
  el.style.removeProperty("--wy");
  el.style.removeProperty("--wr");
  el.style.removeProperty("--ws");
  el.style.zIndex = String(i + 1);
  el.style.opacity = "1";
  el.style.pointerEvents = "";
 });
}

function snapWheel(h, to) {
 if (isDesktopHand()) return;
 const n = h.children.length;
 h._sel = Math.max(0, Math.min(Math.max(0, n - 1), Math.round(to)));
 layoutWheel(h);
}

let _pickedCardIdx = -1;

function renderHand() {
 clearGhosts();
 const h = $("hand");
 h.innerHTML = "";
 _pickedCardIdx = -1;
 if (!P[0] || (P[0].tourIdx ?? 0) !== 0) { h.style.display = "none"; return; }
 h.style.display = "";
 const total = P[0].hand.length;
 if (h._sel === undefined || total >= 10) {
  h._sel = (total - 1) / 2;
 } else {
  h._sel = Math.max(0, Math.min(Math.max(0, total - 1), Math.round(h._sel)));
 }

 const isMobile = () => window.innerWidth <= 767;

 P[0].hand.forEach((c, i) => {
  const e = cardEl(c, 0), grp = t => "dpkboavqyjlDACSPWGLEIJMOQRUVXYZ790αβγδεζηθικλμνξω".includes(t) ? 0 : "hgrtnHFBKT1234568πρστυφχψΓΔΦΩ".includes(t) ? 1 : 2;
  if (i && grp(c.t) !== grp(P[0].hand[i - 1].t)) e.classList.add("gap");
  e.style.zIndex = String(i + 1);
  if (P[0].frost && isSp(c.t)) { e.classList.add("frz"); e.insertAdjacentHTML("beforeend", `<u class="frzov">${UI_IC.snow}</u>`); }
  e.onpointerenter = () => { if (!isMobile()) previewCard(c); };
  let lp = 0, tm = 0, sx = 0, sy = 0;
  e.oncontextmenu = ev => ev.preventDefault();
  e.onpointerdown = ev => { lp = 0; sx = ev.clientX; sy = ev.clientY; tm = setTimeout(() => { lp = 1; showTip(c, e); }, 420); };
  e.onpointermove = ev => { if (Math.hypot(ev.clientX - sx, ev.clientY - sy) > 10) { clearTimeout(tm); hideTip(); } };
  e.onpointerup = e.onpointercancel = e.onpointerleave = () => { clearTimeout(tm); hideTip(); if (!isMobile()) clearGhosts(); };
  e.onclick = ev => {
   ev.stopPropagation();
   if (lp) { lp = 0; return; }
   if (REFORGE_MODE && res) {
    if (c.pz > 0 || isSp(c.t)) { shake(e); pop(0, "НЕ МОЖНА ПЕРЕКУВАТИ", "#fb923c"); snd("stun"); return; }
    executeReforge(0, i);
    return;
   }
   if (c.pz > 0) { shake(e); pop(0, "СКАМ'ЯНІННЯ", "#94a3b8"); snd("stun"); return; }
   if (res && P[0].frost && isSp(c.t) && P[0].hand.some(x => !isSp(x.t))) { shake(e); pop(0, "ЗАМОРОЖЕНО", "#7dd3fc"); snd("shatter"); return; }

   if (isMobile() && res) {
    if (_pickedCardIdx !== i) {
     Array.from(h.children).forEach(el => el.classList.remove("picked-card"));
     _pickedCardIdx = i;
     e.classList.add("picked-card");
     previewCard(c);
     snd("throw");
     return;
    }
   }

   _pickedCardIdx = -1;
   clearGhosts();
   if (res) {
    const r = res;
    res = null;
    h.className = "off";
    r(i);
   }
  };
  h.appendChild(e);
 });

 if (!h.dataset.outsideClear) {
  h.dataset.outsideClear = "1";
  document.addEventListener("click", ev => {
   if (_pickedCardIdx !== -1 && !ev.target.closest("#hand .card")) {
    _pickedCardIdx = -1;
    Array.from(h.children).forEach(el => el.classList.remove("picked-card"));
    clearGhosts();
   }
  });
 }

 layoutWheel(h);
}

function bot(p, seen) {
 if (CUR_ARENA && CUR_ARENA.id === "forge" && (P[p].reforgeLeft || 0) > 0) {
  const candidates = P[p].hand.map((c, idx) => ({ c, idx })).filter(x => !x.c.pz && !isSp(x.c.t));
  if (candidates.length) {
   candidates.sort((a, b) => a.c.r - b.c.r);
   if (candidates[0].c.r <= 2 || Math.random() < 0.45) {
    executeReforge(p, candidates[0].idx);
   }
  }
 }
 const h = P[p].hand;
 let ix = h.map((_, i) => i).filter(i => !(h[i].pz > 0));
 if (!ix.length) { // аварійний випадок: усі карти скам'яніли — знімаємо чари з найближчої до розблокування
 let bi = 0, bp = Infinity;
 h.forEach((c, i) => { if ((c.pz || 0) < bp) { bp = c.pz || 0; bi = i; } });
 h[bi].pz = 0;
 ix = [bi];
 }
 // заморожений бот не може викласти спецкарту
 if (P[p].frost) { const nz = ix.filter(i => !isSp(h[i].t)); if (nz.length) ix = nz; }
 const f = types => ix.filter(i => types.includes(h[i].t));
 const colHex = !!(CUR_ARENA && CUR_ARENA.id === "colosseum" && P[p].hp > 60);
 const hl = colHex ? [] : f("hgrtnHFBKT1234568πρστυφχψΓΔΦΩ"), df = f("smiΛ"), at = f("dpfvzxuwkbioaqyjlcDACSPWGLENIJMOQRUVXYZ790αβγδεζηθικλμνξωΣΘΨΠ").concat(colHex ? f("hgrtnHFBKT1234568πρστυφχψΓΔΦΩ") : []);
 const foeIdx = CU.a === p ? CU.d : CU.a;
 const foeP = (foeIdx >= 0 && P[foeIdx]) ? P[foeIdx] : null;
 const isBurning = (P[p].fx || []).some(x => x.t === "b");
 const botHealScore = idx => {
  const c = h[idx];
  let s = val(c, P[p].hp) * astralResMult(c);
  if (c.t === "τ" && !P[p].healedInMatch) s += 6;
  if (c.t === "υ" && foeP && P[p].hp < foeP.hp) s += 7;
  if (c.t === "φ" && foeP && foeP.lastHeal > 0) s += Math.min(10, Math.round(foeP.lastHeal * 0.25));
  if (c.t === "χ") s += isBurning ? -4 : 11;
  if (c.t === "ψ" && P[p].hp <= 45 && hasAnyDebuff(P[p])) s += 14;
  if (c.t === "Γ" && P[p].attackedThisRound) s += 8;
  if (c.t === "Δ") s += 8;
  if (c.t === "Φ") s += isBurning ? 18 : 2;
  if (c.t === "Ω") s += 26;
  return s;
 };

 const uIdx = ix.find(i => h[i].t === "u");
 if (uIdx !== undefined && P[p].hp <= 55) return uIdx;
 const jIdx = ix.find(i => h[i].t === "j");
 if (jIdx !== undefined && seen && Math.random() < 0.75) return jIdx;
 const cIdx = ix.find(i => h[i].t === "c");
 if (cIdx !== undefined && (seen === "d" || seen === "x") && Math.random() < 0.65) return cIdx;

 const eIdx = ix.find(i => h[i].t === "e");
 if (eIdx !== undefined && Math.random() < 0.5) return eIdx;
 const nIdx = ix.find(i => h[i].t === "n");
 if (!colHex && nIdx !== undefined && (P[p].hp <= 60 || P[p].frost || P[p].weak || P[p].fx.some(f => f.t === "p" || f.t === "b"))) return nIdx;
 const salIdx = !colHex ? ix.find(i => h[i].t === "Φ") : undefined;
 if (salIdx !== undefined && isBurning && P[p].hp <= 80 && Math.random() < 0.85) return salIdx;
 const persIdx = !colHex ? ix.find(i => h[i].t === "ψ") : undefined;
 if (persIdx !== undefined && P[p].hp <= 45 && hasAnyDebuff(P[p]) && Math.random() < 0.8) return persIdx;
 const treeIdx = !colHex ? ix.find(i => h[i].t === "Ω") : undefined;
 if (treeIdx !== undefined && P[p].hp <= 52 && Math.random() < 0.85) return treeIdx;
 const wIdx = ix.find(i => h[i].t === "w");
 if (wIdx !== undefined && Math.random() < 0.45) return wIdx;
 const narIdx = ix.find(i => h[i].t === "Σ");
 if (narIdx !== undefined && ((foeP && (foeP.healedCardThisRound || foeP.roundHealAmt > 0)) || seen === "h") && Math.random() < 0.85) return narIdx;
 const krIdx = ix.find(i => h[i].t === "Θ");
 if (krIdx !== undefined && foeP && (foeP.fx || []).length > 0 && Math.random() < 0.72) return krIdx;
 const arIdx = ix.find(i => h[i].t === "Λ");
 if (arIdx !== undefined && ((P[p].fx || []).some(x => x.t === "p" || x.t === "b") || seen === "d") && Math.random() < 0.78) return arIdx;
 const hadIdx = ix.find(i => h[i].t === "Ψ");
 if (hadIdx !== undefined && P[p].hp > 18 && P[p].hp <= 52 && Math.random() < 0.8) return hadIdx;
 const fwIdx = ix.find(i => h[i].t === "Π");
 if (fwIdx !== undefined && h.length >= 3 && Math.random() < 0.52) return fwIdx;

 if (df.length && (seen === "d" || seen === "x") && Math.random() < 0.75) return df[0];
 if (hl.length && P[p].hp <= 58 && Math.random() < 0.72) {
 hl.sort((a, b) => botHealScore(b) - botHealScore(a));
 return hl[0];
 }
 const pool = at.concat(df).filter(i => h[i].t !== "u" || P[p].hp <= 75);
 if (!pool.length) return hl[0] !== undefined ? hl[0] : ix[0];
 pool.sort((a, b) => (val(h[b], P[p].hp) * astralResMult(h[b])) - (val(h[a], P[p].hp) * astralResMult(h[a])));
 return pool[Math.random() < 0.65 ? 0 : rnd(pool.length)];
}

// ІСТОРІЯ ХОДІВ: останні 10 подій, прокручується
const LOGH = [];
function pushLog(t) {
 if (!t || LOGH[LOGH.length - 1] === t) return;
 LOGH.push(t);
 if (LOGH.length > 10) LOGH.shift();
 renderLog();
}
function renderLog() {
 const L = $("log");
 L.innerHTML = "";
 LOGH.forEach(t => { const d = document.createElement("div"); d.className = "logl"; d.textContent = t; L.appendChild(d); });
 L.scrollTop = L.scrollHeight;
}

// ТАЙМЕР ХОДУ: якщо гравець не обрав карту, вона обирається автоматично
const TURN_LIMIT = 25; // секунд на хід
let TMR = null, TMR_LEFT = 0;
function clearTurnTimer() {
 if (TMR) clearInterval(TMR);
 TMR = null;
 const el = document.getElementById("tmr");
 if (el) el.remove();
}
function startTurnTimer(seen) {
 clearTurnTimer();
 TMR_LEFT = TURN_LIMIT;
 const el = document.createElement("span");
 el.id = "tmr"; el.className = "tmr";
 el.innerHTML = `${UI_IC.timer} ${TMR_LEFT}с`;
 $("banner").appendChild(el);
 TMR = setInterval(() => {
 if (isPaused) return;
 TMR_LEFT--;
 el.innerHTML = `${UI_IC.timer} ${Math.max(TMR_LEFT, 0)}с`;
 el.classList.toggle("warn", TMR_LEFT <= 5);
 if (TMR_LEFT <= 0) {
 clearTurnTimer();
 pushLog("Час вийшов — карту обрано автоматично");
 res(bot(0, seen));
 }
 }, 1000);
}

function pick(p, seen) {
 if ((P[p].tourIdx ?? p) !== 0) { updateReforgeUI(); return sl(550).then(() => bot(p, seen)); }
 pushLog(seen
 ? `Суперник поклав: ${seen === "q" ? "невідому карту (Таємний ліс)" : seen === "d" ? "карту шкоди" : seen === "h" ? "карту здоров’я" : "спецкарту"}. Твоя відповідь!`
 : "Твоя атака (1-й хід у дуелі) — обери карту!");
 $("hand").className = "";
 if (P[0].frost) pushLog("Ти заморожений: спецкарти заблоковані, а шкода діє на 50%!");
 return new Promise(r => {
 res = v => { clearTurnTimer(); updateReforgeUI(); r(v); };
 updateReforgeUI();
 startTurnTimer(seen);
 });
}


async function fight(a, d, pl) {
 const ev = [];
 let stunned = { [a]: false, [d]: false };
 const shown = {};
 // «заморожені на початку бою»: їхній хід — це і є «наступний хід ворога»
 const fz = { [a]: !!P[a].frost, [d]: !!P[d].frost };
 const ariadneMap = { [a]: !!(pl[a] && pl[a].t === "Λ" && !fz[a]), [d]: !!(pl[d] && pl[d].t === "Λ" && !fz[d]) };
 const narcissusCut = { [a]: false, [d]: false };
 const thaw = p => { if (fz[p] && P[p].frost) { P[p].frost = 0; frostShatter(p); } };
 let steps = [{ act: a, def: d }, { act: d, def: a }];
 if (CU.tar) {
 // Смола Аїда спрацювала на хід атакуючого `a`: він захищається другим, а `d` атакує його першим!
 // (Важливо: якщо смола висить на захиснику `d`, вона НЕ зникає, бо `d` зараз не атакує, і збережеться до його власного ходу!)
 P[a].slow = 0;
 steps = [{ act: d, def: a }, { act: a, def: d }];
 pop(a, "ВТРАТА АТАКИ!", "#c084fc");
 pop(d, "КОНТРАТАКА ПЕРШИМ!", "#fde047");
 snd("swap");
 ev.push(`${P[a].name} скутий Смолою Аїда — замість атаки він захищається від ${P[d].name}!`);
 upd();
 }

 for (const { act, def } of steps) {
 if (P[act].hp <= 0 || !P[act].alive) break;

 if (stunned[act]) {
 pop(act, "ОГЛУШЕНИЙ", "#facc15");
 snd("stun");
 ev.push(`${P[act].name} пропускає хід`);
 thaw(act);
 upd();
 await sl(650);
 continue;
 }

 let c = pl[act];
 let mimicMult = 1;
 const half = !!fz[act];

 // Крижаний Щит: спецкарта замороженого гравця блокується повністю
 if (half && isSp(c.t)) {
 pop(act, "ЗАБЛОКОВАНО", "#7dd3fc");
 snd("shatter");
 frostShards(seatC(act).x, seatC(act).y, 14, 70);
 ev.push(`${P[act].name}: «${cardName(c)}» заблоковано кригою`);
 thaw(act);
 upd();
 await sl(750);
 continue;
 }

 const sIdxA = P[act].tourIdx ?? act; if (SPEC_POOL.includes(c.t) && STAT[sIdxA]) STAT[sIdxA].specs++;
 const opp0 = pl[def];
 // спецкарта замороженого суперника не діє (не блокує і не відбиває)
 let opp = (fz[def] && isSp(opp0.t)) ? { t: "_", r: opp0.r } : opp0;
 let dmg = 0, suit = "", sc = "#fff", vDrained = false, charybdisBonus = 0;
 let boreasBonus = false, apolloIgnored = false, moiraiFatal = false, aresEnraged = false, typhonShatter = false, fireWrathBonus = false, zeusBoosted = false, zeusStrippedCols = [], charonExec = false;

 if (!"dhpgkbroatvnqyjlHDACSPWGLFBKTENIJMOQRUVXYZ1234567890αβγδεζηθικλμνξωπρστυφχψΓΔΦΩ".includes(c.t) && !shown[act]) {
 shown[act] = true;
 await ultFx(c.t);
 }
 // МІМІКРІЯ (c): копіює карту опонента з коефіцієнтом 125%
 if (c.t === "c") {
 const oppCard = pl[def];
 if (oppCard && oppCard.t !== "c") {
 c = Object.assign({}, oppCard, { b: Math.round((oppCard.b || 0) * 1.25) });
 mimicMult = 1.25;
 await mimicMorphFx(act, c);
 ev.push(`${P[act].name}: Мімікрія копіює «${cardName(oppCard)}» (×1.25)!`);
 } else {
 c = { t: "d", r: 3 };
 mimicMult = 1.25;
 await mimicMorphFx(act, c);
 ev.push(`${P[act].name}: Мімікрія завдає ртутного удару!`);
 }
 }
 if ((c._colHex || ["p", "d", "f", "v", "z", "x", "u", "k", "b", "a", "q", "y", "j", "l", "D", "A", "C", "S", "P", "W", "G", "L", "E", "I", "J", "M", "O", "Q", "R", "U", "V", "X", "Y", "Z", "7", "9", "0", "α", "β", "γ", "δ", "ε", "ζ", "η", "θ", "ι", "κ", "λ", "μ", "ν", "ξ", "ω"].includes(c.t)) && (opp.t === "s" || opp.t === "m") && !shown[def]) {
 shown[def] = true;
 await ultFx(opp.t);
 }

 if (c.t === "Z" && opp.t === "s") { opp = { t: "_", r: opp.r }; pop(def, "БЛОК ПРОБИТО", "#a78bfa"); }
 const wk = P[act].weak;
 if (wk) {
  P[act].weak = false;
  if (c.t === "η") { apolloIgnored = true; pop(act, "ІГНОР СЛАБКОСТІ", "#fde047"); }
  else pop(act, "−30% POW", "#fb7185");
 }
 if (c.t === "o") {
 P[def].fx = P[def].fx.filter(x => x.t === "p" || x.t === "b"); P[def].thorn = 0; P[def].shellDef = 0;
 if (opp.t === "s" || opp.t === "m") { opp = { t: "_", r: opp.r }; pop(def, "ЗАХИСТ ЗНИЩЕНО", "#38bdf8"); }
 ev.push(`${P[act].name}: Мйольнір розсіює бафи ${P[def].name}`);
 }
 if (c.t === "ξ") {
  const stKeys = Object.keys(EFFECT_DEFS).filter(k => EFFECT_DEFS[k].active(P[def]));
  const zeusCount = stKeys.length + (P[def].relicShield > 0 ? 1 : 0) + ((opp.t === "s" || opp.t === "m") ? 1 : 0);
  zeusBoosted = zeusCount >= 2;
  if (P[def].shellDef > 0) zeusStrippedCols.push("#38bdf8");
  if (P[def].thorn > 0) zeusStrippedCols.push("#e11d48");
  if (P[def].relicShield > 0) zeusStrippedCols.push("#7dd3fc");
  if ((P[def].fx || []).some(x => x.t === "g")) zeusStrippedCols.push("#4ade80");
  if (opp.t === "s" || opp.t === "m") zeusStrippedCols.push("#fde047");
  P[def].fx = P[def].fx.filter(x => x.t === "p" || x.t === "b");
  P[def].thorn = 0; P[def].shellDef = 0; P[def].relicShield = 0;
  if (opp.t === "s" || opp.t === "m") { opp = { t: "_", r: opp.r }; pop(def, "БАР'ЄР ЗНИЩЕНО", "#fde047"); }
  if (zeusStrippedCols.length) ev.push(`${P[act].name}: Длань Зевса розсіює всі бафи й щити ${P[def].name}!`);
 }
 if (c.t === "e") {
 const sIdx = (window.NET && NET.active && window.DCARD_NET) ? await DCARD_NET.syncRngInt(`t${turn}_${P[act].netSeat}_suit`, 4, gameId) : rnd(4);
 const S = SUITS[sIdx % 4]; suit = S.k; sc = S.c; await suitFx(S);
 if (suit === "spade" && (opp.t === "s" || opp.t === "m")) { opp = { t: "_", r: opp.r }; pop(def, "ЩИТ ПРОБИТО", "#a78bfa"); }
 ev.push(`${P[act].name}: Преферанс ${S.k} ${S.n}`);
 }
 if (c.t === "i") {
 await iceFx(act, def);
 P[def].frost = 1;
 if (act === a) fz[d] = true;
 ev.push(`${P[act].name} заморожує ${P[def].name}: його наступна карта шкоди −50%, спецкарту викласти не зможе`);
 upd();
 await sl(650);
 continue;
 }

 if (c.t === "N") {
 const avgHp = Math.max(1, Math.round((P[act].hp + P[def].hp) / 2));
 await nemesisScalesFx(act, def, avgHp);
 ev.push(`${P[act].name}: Терези Немезиди вирівнюють здоров'я до ${avgHp} HP!`);
 thaw(act);
 upd();
 await sl(550);
 continue;
 }

 if (c.t === "w") {
 await weirdDealFx(act, def, () => {
 const tmp = P[act].hand;
 P[act].hand = P[def].hand;
 P[def].hand = tmp;
 pop(act, "ОБМІН!", "#c084fc");
 pop(def, "ОБМІН!", "#c084fc");
 burst(act, "#c084fc");
 burst(def, "#c084fc");
 upd();
 });
 ev.push(`${P[act].name} міняється картами з ${P[def].name}!`);
 thaw(act);
 upd();
 await sl(320);
 continue;
 }

 // 2. ДЗЕРКАЛО НАРЦИСА (Σ): пастка на лікування / крадіжка темпу
 if (c.t === "Σ") {
  const oppWillHeal = !fz[def] && !opp0._colHex && HEAL_CARDS.includes(opp0.t);
  const foeHealedNow = !!P[def].healedCardThisRound || (P[def].roundHealAmt || 0) > 0 || oppWillHeal;
  if (foeHealedNow) {
   let stolenBase = P[def].roundHealAmt || 0;
   if (stolenBase <= 0 && oppWillHeal) {
    stolenBase = Math.max(10, healAmt(val(opp0, P[def].hp), opp0));
    narcissusCut[def] = true;
   }
   let stolen = Math.max(1, Math.round(stolenBase * 0.5));
   let nDmg = val(c, P[act].hp);
   if (mimicMult !== 1) { nDmg = Math.round(nDmg * mimicMult); stolen = Math.round(stolen * mimicMult); }
   if (P[act].fortuneBonus > 0) {
    nDmg += P[act].fortuneBonus;
    P[act].fortuneBonus = 0; P[act].fortuneKeep = 0;
    pop(act, "+15 ФОРТУНА!", "#facc15");
   }
   if (wk) nDmg = Math.round(nDmg * 0.7);
   if (P[act].timeLock > 0) { nDmg = Math.max(1, Math.round(nDmg * 0.8)); stolen = Math.max(1, Math.round(stolen * 0.8)); pop(act, "ОКОВИ −20%", "#7dd3fc"); }
   nDmg = dmgAmt(nDmg, c);
   if (ariadneMap[def] && nDmg > 0) {
    const cut = Math.round(nDmg * 0.6);
    nDmg = Math.max(0, nDmg - cut);
    pop(def, `НИТЬ −60% (−${cut})`, "#fde047");
   }
   await narcissusMirrorFx(act, def, true, () => {
    if (P[act].noHeal > 0) {
     P[act].noHeal = 0; P[act].nhAge = 0;
     pop(act, "ЗЦІЛЕННЯ ЗАБЛОКОВАНО!", "#5eead4"); burst(act, "#2dd4bf"); snd("shatter");
    } else {
     P[act].hp = Math.min(P[act].maxHp || 100, P[act].hp + stolen);
     recordHeal(act, stolen, false);
     pop(act, `+${stolen} КРАДІЖКА`, "#34d399");
    }
    const sIdxD = P[act].tourIdx ?? act;
    if (STAT[sIdxD]) { STAT[sIdxD].dmg += nDmg; STAT[sIdxD].big = Math.max(STAT[sIdxD].big, nDmg); }
    if (sIdxD === 0 && nDmg > PROFILE.bestHit) { PROFILE.bestHit = nDmg; saveProfile(); }
    P[def].hp -= nDmg;
    hit(def, nDmg);
   });
   ev.push(`${P[act].name}: Дзеркало Нарциса краде +${stolen} HP з лікування ${P[def].name} і завдає −${nDmg} HP!`);
   if (P[def].hp <= 0 && resolveDeathOrSave(def, ev)) { upd(); break; }
  } else {
   let hSelf = applyRelicHealBonus(act, healAmt(Math.round(12 * mimicMult * (wk ? 0.7 : 1)), c), act === steps[1].act);
   if (P[act].fortuneBonus > 0) {
    hSelf += P[act].fortuneBonus;
    P[act].fortuneBonus = 0; P[act].fortuneKeep = 0;
    pop(act, "+15 ФОРТУНА!", "#facc15");
   }
   if (P[act].timeLock > 0) { hSelf = Math.max(1, Math.round(hSelf * 0.8)); pop(act, "ОКОВИ −20%", "#7dd3fc"); }
   await narcissusMirrorFx(act, def, false, () => {
    if (P[act].noHeal > 0) {
     P[act].noHeal = 0; P[act].nhAge = 0;
     pop(act, "ЗЦІЛЕННЯ ЗАБЛОКОВАНО!", "#5eead4"); burst(act, "#2dd4bf"); snd("shatter");
    } else {
     P[act].hp = Math.min(P[act].maxHp || 100, P[act].hp + hSelf);
     recordHeal(act, hSelf, true);
     pop(act, `+${hSelf} HP`, "#34d399");
    }
   });
   ev.push(`${P[act].name}: Дзеркало Нарциса дарує +${hSelf} HP.`);
  }
  thaw(act);
  upd();
  await sl(520);
  continue;
 }

 // 3. КАЙДАНИ КРОНОСА (Θ): −15 HP + «Окови часу» на 1 раунд
 if (c.t === "Θ") {
  P[act].attackedThisRound = true;
  let kDmg = val(c, P[act].hp);
  if (mimicMult !== 1) kDmg = Math.round(kDmg * mimicMult);
  if (P[act].fortuneBonus > 0) {
   kDmg += P[act].fortuneBonus;
   P[act].fortuneBonus = 0; P[act].fortuneKeep = 0;
   pop(act, "+15 ФОРТУНА!", "#facc15");
  }
  if (wk) kDmg = Math.round(kDmg * 0.7);
  if (P[act].timeLock > 0) { kDmg = Math.max(1, Math.round(kDmg * 0.8)); pop(act, "ОКОВИ −20%", "#7dd3fc"); }
  kDmg = dmgAmt(kDmg, c);
  if (P[def].relicShield > 0 && kDmg > 0) {
   const abs = Math.min(P[def].relicShield, kDmg);
   P[def].relicShield -= abs; kDmg -= abs;
   pop(def, `ЩИТ ГЕРМЕСА −${abs}`, "#38bdf8"); snd("shield");
  }
  if (P[def].shellDef > 0 && kDmg > 0) {
   const blocked = Math.max(1, Math.round(kDmg * 0.25));
   kDmg = Math.max(0, kDmg - blocked); P[def].shellDef = 0;
   pop(def, `ПАНЦИР −25% (−${blocked})`, "#38bdf8"); snd("shield");
  }
  if (ariadneMap[def] && kDmg > 0) {
   const cut = Math.round(kDmg * 0.6);
   kDmg = Math.max(0, kDmg - cut);
   pop(def, `НИТЬ −60% (−${cut})`, "#fde047");
  }
  if (opp.t === "s") {
   const counter = dmgAmt(val(opp, P[def].hp), opp);
   pop(def, "БЛОК!", "#3fb8a8"); burst(def, "#3fb8a8"); snd("shield");
   await sl(300);
   P[act].hp -= counter;
   await orb(def, act, "#3fb8a8");
   hit(act, counter);
   ev.push(`${P[def].name} блокує Кайдани Кроноса та б’є у відповідь −${counter}`);
   if (P[act].hp <= 0 && resolveDeathOrSave(act, ev)) { upd(); break; }
  } else if (opp.t === "m") {
   await perseusMirrorFx(act, def, () => {
    pop(def, "ВІДБИТТЯ!", "#e879f9"); burst(def, "#e879f9");
    P[act].hp -= kDmg; hit(act, kDmg);
    P[act].timeLock = 1;
   });
   ev.push(`${P[def].name} відбиває Кайдани Кроноса (−${kDmg} HP та Окови часу) назад у ${P[act].name}!`);
   if (P[act].hp <= 0 && resolveDeathOrSave(act, ev)) { upd(); break; }
  } else {
   await kronosChainsFx(act, def, () => {
    const sIdxD = P[act].tourIdx ?? act;
    if (STAT[sIdxD]) { STAT[sIdxD].dmg += kDmg; STAT[sIdxD].big = Math.max(STAT[sIdxD].big, kDmg); }
    if (sIdxD === 0 && kDmg > PROFILE.bestHit) { PROFILE.bestHit = kDmg; saveProfile(); }
    P[def].hp -= kDmg;
    hit(def, kDmg);
    P[def].timeLock = 1;
    pop(def, "ОКОВИ ЧАСУ!", "#7dd3fc");
   });
   ev.push(`${P[act].name}: Кайдани Кроноса завдають −${kDmg} HP та сковують ${P[def].name} «Оковами часу» (таймери зупинено, сила/хіл −20%)!`);
   if (P[def].hp <= 0 && resolveDeathOrSave(def, ev)) { upd(); break; }
  }
  thaw(act);
  upd();
  await sl(520);
  continue;
 }

 // 4. НИТЬ АРІАДНИ (Λ): −60% вхідної шкоди в дуелі + перенесення 1 отрути або горіння
 if (c.t === "Λ") {
  const idxNeg = (P[act].fx || []).findIndex(f => f.t === "p" || f.t === "b");
  let movedFx = null;
  if (idxNeg >= 0) movedFx = P[act].fx.splice(idxNeg, 1)[0];
  await ariadneThreadFx(act, def, movedFx ? movedFx.t : null, () => {
   if (movedFx && P[def].alive) {
    P[def].fx.push(movedFx);
    pop(def, movedFx.t === "p" ? "ОТРУТА ПЕРЕДАНА!" : "ГОРІННЯ ПЕРЕДАНЕ!", "#fde047");
   }
   pop(act, "НИТЬ −60%", "#fde047");
  });
  ev.push(movedFx
   ? `${P[act].name}: Нить Аріадни знижує вхідну шкоду на 60% і перетягує ${movedFx.t === "p" ? "Отруту" : "Горіння"} на ${P[def].name}!`
   : `${P[act].name}: Нить Аріадни огортає золотим захистом (−60% вхідної шкоди у цій дуелі).`);
  thaw(act);
  upd();
  await sl(520);
  continue;
 }

 // 6. СКИПЕТР АЇДА (Ψ): −15 HP собі, −38 HP ворогу; при ≤ 35 HP +15 HP віддача темряви
 if (c.t === "Ψ") {
  P[act].attackedThisRound = true;
  let hDmg = val(c, P[act].hp);
  if (mimicMult !== 1) hDmg = Math.round(hDmg * mimicMult);
  if (P[act].fortuneBonus > 0) {
   hDmg += P[act].fortuneBonus;
   P[act].fortuneBonus = 0; P[act].fortuneKeep = 0;
   pop(act, "+15 ФОРТУНА!", "#facc15");
  }
  if (wk) hDmg = Math.round(hDmg * 0.7);
  if (P[act].timeLock > 0) { hDmg = Math.max(1, Math.round(hDmg * 0.8)); pop(act, "ОКОВИ −20%", "#7dd3fc"); }
  hDmg = dmgAmt(hDmg, c);
  if (P[def].relicShield > 0 && hDmg > 0) {
   const abs = Math.min(P[def].relicShield, hDmg);
   P[def].relicShield -= abs; hDmg -= abs;
   pop(def, `ЩИТ ГЕРМЕСА −${abs}`, "#38bdf8"); snd("shield");
  }
  if (P[def].shellDef > 0 && hDmg > 0) {
   const blocked = Math.max(1, Math.round(hDmg * 0.25));
   hDmg = Math.max(0, hDmg - blocked); P[def].shellDef = 0;
   pop(def, `ПАНЦИР −25% (−${blocked})`, "#38bdf8"); snd("shield");
  }
  if (ariadneMap[def] && hDmg > 0) {
   const cut = Math.round(hDmg * 0.6);
   hDmg = Math.max(0, hDmg - cut);
   pop(def, `НИТЬ −60% (−${cut})`, "#fde047");
  }
  const willRecoilHeal = (P[act].hp - 15) > 0 && (P[act].hp - 15) <= 35;
  if (opp.t === "s") {
   P[act].hp -= 15;
   pop(act, "−15 ЖЕРТВА", "#f43f5e");
   const counter = dmgAmt(val(opp, P[def].hp), opp);
   pop(def, "БЛОК!", "#3fb8a8"); burst(def, "#3fb8a8"); snd("shield");
   await sl(300);
   P[act].hp -= counter;
   await orb(def, act, "#3fb8a8");
   hit(act, counter);
   ev.push(`${P[def].name} блокує Скипетр Аїда та б’є у відповідь −${counter}`);
  } else if (opp.t === "m") {
   P[act].hp -= 15;
   pop(act, "−15 ЖЕРТВА", "#f43f5e");
   await perseusMirrorFx(act, def, () => {
    pop(def, "ВІДБИТТЯ!", "#e879f9"); burst(def, "#e879f9");
    P[act].hp -= hDmg; hit(act, hDmg);
   });
   ev.push(`${P[def].name} відбиває Скипетр Аїда (−${hDmg} HP) назад у ${P[act].name}!`);
  } else {
   await hadesScepterFx(act, def, willRecoilHeal,
    () => {
     P[act].hp -= 15;
     pop(act, "−15 ЖЕРТВА", "#f43f5e");
     const sIdxD = P[act].tourIdx ?? act;
     if (STAT[sIdxD]) { STAT[sIdxD].dmg += hDmg; STAT[sIdxD].big = Math.max(STAT[sIdxD].big, hDmg); }
     if (sIdxD === 0 && hDmg > PROFILE.bestHit) { PROFILE.bestHit = hDmg; saveProfile(); }
     P[def].hp -= hDmg;
     hit(def, hDmg);
    },
    () => {
     if (P[act].hp > 0 && P[act].hp <= 35) {
      let rec = healAmt(15, c);
      if (P[act].timeLock > 0) rec = Math.max(1, Math.round(rec * 0.8));
      if (P[act].noHeal > 0) {
       P[act].noHeal = 0; P[act].nhAge = 0;
       pop(act, "ЗЦІЛЕННЯ ЗАБЛОКОВАНО!", "#5eead4"); burst(act, "#2dd4bf"); snd("shatter");
      } else {
       P[act].hp = Math.min(P[act].maxHp || 100, P[act].hp + rec);
       recordHeal(act, rec, false);
       pop(act, `+${rec} ВІДДАЧА ТЕМРЯВИ`, "#c084fc");
       ev.push(`${P[act].name}: віддача темряви повертає +${rec} HP!`);
      }
     }
    }
   );
   ev.push(`${P[act].name}: Скипетр Аїда (жертва −15 HP) вражає ${P[def].name} на −${hDmg} HP!`);
  }
  if (P[act].hp <= 0) resolveDeathOrSave(act, ev);
  if (P[def].hp <= 0) resolveDeathOrSave(def, ev);
  thaw(act);
  upd();
  await sl(540);
  if (!P[act].alive || !P[def].alive) break;
  continue;
 }

 // 7. КОЛЕСО ФОРТУНИ (Π): оновлює руку новими картами + дає +15 до першої атаки або лікування
 if (c.t === "Π") {
  await fortuneWheelFx(act, () => {
   const count = Math.max(1, P[act].hand.length);
   const fresh = dealPool(act, CUR_ARENA).filter(x => x.t !== "Π");
   P[act].hand = fresh.slice(0, count);
   P[act].fortuneBonus = 15;
   P[act].fortuneKeep = 1;
   pop(act, "НОВА РУКА · +15!", "#facc15");
   if ((P[act].tourIdx ?? act) === 0) renderHand();
  });
  ev.push(`${P[act].name}: Колесо Фортуни оновлює руку та дає +15 до першої атаки або лікування!`);
  thaw(act);
  upd();
  await sl(540);
  continue;
 }


 if (half && "dpfvzxukboaqyjlDACSPWGLEIJMOQRUVXYZ790αβγδεζθικλμνξω".includes(c.t)) pop(act, "−50%", "#7dd3fc");
 if (half && c.t === "η") { apolloIgnored = true; pop(act, "ІГНОР МОРОЗУ", "#fde047"); }

 if (c.t === "p") {
 P[act].attackedThisRound = true;
 if (opp.t === "s") {
 pop(def, "БЛОК!", "#3fb8a8"); burst(def, "#3fb8a8"); snd("shield");
 ev.push(`${P[def].name} блокує отруту`);
 } else {
 const victim = opp.t === "m" ? act : def;
 await orb(act, victim, "#8bd35a");
 addFx(victim, c, half, act);
 ev.push(opp.t === "m" ? `${P[def].name} дзеркалить отруту в ${P[act].name}!` : `${P[act].name} отруює ${P[def].name}${half ? " (слабше)" : ""}`);
 }
 }
 if (!c._colHex && c.t === "g") {
 P[act].healedInMatch = true;
 P[act].healedCardThisRound = true;
 addFx(act, c);
 if (P[act].fx.length) {
  const lastFxG = P[act].fx[P[act].fx.length - 1];
  if (P[act].fortuneBonus > 0) {
   lastFxG.v += P[act].fortuneBonus;
   P[act].fortuneBonus = 0; P[act].fortuneKeep = 0;
   pop(act, "+15 ФОРТУНА!", "#facc15");
  }
  if (P[act].timeLock > 0) {
   lastFxG.v = Math.max(1, Math.round(lastFxG.v * 0.8));
   pop(act, "ОКОВИ −20%", "#7dd3fc");
  }
  P[act].roundHealAmt = (P[act].roundHealAmt || 0) + lastFxG.v;
 }
 if (P[act].disorient > 0 && P[act].fx.length) {
  P[act].disorient = 0; P[act].dsAge = 0;
  const lastFx = P[act].fx[P[act].fx.length - 1];
  lastFx.v = Math.max(1, Math.round(lastFx.v * 0.5));
  pop(act, "ДЕЗОРІЄНТАЦІЯ −50%", "#c084fc");
  ev.push(`${P[act].name}: Дезорієнтація послаблює відновлення вдвічі (+${lastFx.v} HP/коло)`);
 } else {
  ev.push(`${P[act].name} відновлення (${DUR[c.r] + durBonus()} кола)`);
 }
 }

 if (c._colHex || ["d", "f", "v", "z", "x", "u", "k", "b", "o", "a", "e", "q", "y", "j", "l", "D", "A", "C", "S", "P", "W", "G", "L", "E", "I", "J", "M", "O", "Q", "R", "U", "V", "X", "Y", "Z", "7", "9", "0", "α", "β", "γ", "δ", "ε", "ζ", "η", "θ", "ι", "κ", "λ", "μ", "ν", "ξ", "ω"].includes(c.t)) {
 if (c.t !== "e" || suit !== "heart") P[act].attackedThisRound = true;
 if (c.t === "C") c.rolled = rnd(31) + 5;
 dmg = c._colHex ? c._colHexDmg : val(c, P[act].hp);
 const secondActor = steps[1].act;
 if (c.t === "j" && act === secondActor) dmg += 7; // Ікло Фафніра: 18 базово / 25 у захисті (+7)
 if (c.t === "W" && P[act].tookPrevDmg) dmg += 7; // Батіг Фурії: −21 базово / −28 якщо отримував шкоду в попередній дуелі (+7)
 if (c.t === "L" && P[act].hp < 50) dmg += 8; // Спис Ахілла: −34 базово / −42 якщо свого HP < 50 (+8)
 if (c.t === "7" && P[def].hp > P[act].hp) {
  charybdisBonus = Math.min(14, Math.floor((P[def].hp - P[act].hp) / 2));
  dmg += charybdisBonus;
 }
 if (c.t === "ζ" && !hasAnyStatus(P[def])) { boreasBonus = true; dmg += 4; }
 if (c.t === "θ" && P[def].hp <= 40) { moiraiFatal = true; dmg += 8; }
 if (c.t === "κ" && P[act].hp <= 50) { aresEnraged = true; dmg += 10; }
 if (c.t === "λ" && hasAnyDebuff(P[def])) { typhonShatter = true; }
 if (c.t === "ν" && (P[def].healedInMatch || (P[def].fx || []).some(f => f.t === "g"))) { fireWrathBonus = true; dmg += 8; }
 if (c.t === "ξ" && zeusBoosted) { dmg += 15; }
 if (c.t === "ω" && P[def].hp <= 35 && opp.t !== "s" && opp.t !== "m") { charonExec = true; }
 const dSlingBonus = (c.t === "D" && P[def].hp > 80);
 if (c.t === "Q" && hasAnyDebuff(P[def])) dmg += 6; // Дротик: +6 по цілі під дебафом
 if (dSlingBonus) dmg += 6; // Праща Давида: +6 шкоди (разом 22), якщо у ворога > 80 HP
 if (c.t === "e") dmg = { spade: 40, heart: 0, diamond: 15, club: 20 }[suit];
 if (mimicMult !== 1 && dmg > 0) dmg = Math.round(dmg * mimicMult);
 if (P[act].fortuneBonus > 0 && dmg > 0) {
  dmg += P[act].fortuneBonus;
  P[act].fortuneBonus = 0; P[act].fortuneKeep = 0;
  pop(act, "+15 ФОРТУНА!", "#facc15");
 }
 if (wk && dmg > 0 && c.t !== "η") dmg = Math.round(dmg * .7);
 if (P[act].timeLock > 0 && dmg > 0) {
  dmg = Math.max(1, Math.round(dmg * 0.8));
  pop(act, "ОКОВИ −20%", "#7dd3fc");
 }
 if (c.t === "x" && P[def].hp <= 50) dmg *= 2;
 if (hasRelic(act, "whetstone_ares") && c.r <= 1 && dmg > 0) dmg += 4;
 if (hasRelic(act, "blood_altar") && c.r >= 3 && dmg > 0) dmg += 12;
 if (hasRelic(act, "depth_silence") && act === secondActor && dmg > 0) dmg += 6;
 if (hasRelic(act, "seal_berserk") && P[act].hp < 40 && dmg > 0) dmg = Math.round(dmg * 1.35);
 if (CUR_ARENA && CUR_ARENA.dmgMult && CUR_ARENA.dmgMult !== 1 && dmg > 0) dmg = Math.max(1, Math.round(dmg * CUR_ARENA.dmgMult));
 if (CUR_ARENA && CUR_ARENA.id === "astral" && c.r === ASTRAL_RARITY && dmg > 0) {
  dmg = Math.max(1, Math.round(dmg * 1.35));
  pop(act, "РЕЗОНАНС +35%!", ASTRAL_META[ASTRAL_RARITY].col);
 }
 if (half && c.t !== "η") dmg = Math.round(dmg / 2);
 if (P[act].atkDebuff && dmg > 0) {
  if (c.t === "η") {
   apolloIgnored = true;
   pop(act, "ІГНОР ОХОЛОДЖЕННЯ", "#fde047");
   P[act].atkDebuff = 0;
  } else {
   dmg = Math.max(0, dmg - P[act].atkDebuff);
   pop(act, "−" + P[act].atkDebuff, "#7dd3fc");
   P[act].atkDebuff = 0;
  }
 }
 if (P[def].relicShield > 0 && dmg > 0 && !charonExec) {
   const abs = Math.min(P[def].relicShield, dmg);
   P[def].relicShield -= abs;
   dmg -= abs;
   pop(def, `ЩИТ ГЕРМЕСА −${abs}`, "#38bdf8");
   snd("shield");
   ev.push(`${P[def].name}: Пастка Гермеса поглинає ${abs} шкоди`);
 }
 if (P[def].shellDef > 0 && dmg > 0 && !charonExec) {
 const blocked = Math.max(1, Math.round(dmg * 0.25));
 dmg = Math.max(0, dmg - blocked);
 P[def].shellDef = 0;
 pop(def, `ПАНЦИР −25% (−${blocked})`, "#38bdf8");
 snd("shield");
 ev.push(`${P[def].name}: Панцир Черепахи поглинає 25% шкоди (−${blocked})`);
 }
 if (ariadneMap[def] && dmg > 0 && !charonExec) {
  const cut = Math.round(dmg * 0.6);
  dmg = Math.max(0, dmg - cut);
  pop(def, `НИТЬ −60% (−${cut})`, "#fde047");
  ev.push(`${P[def].name}: Нить Аріадни зменшує шкоду на 60% (−${cut})`);
 }
 if (charonExec) {
  dmg = Math.max(dmg, P[def].hp);
 }
 }

 if (c.t === "s" && !opp._colHex && !["d", "p", "f", "v", "z", "x", "u", "k", "b", "o", "a", "e", "q", "y", "j", "l", "D", "A", "C", "S", "P", "W", "G", "L", "E", "I", "J", "M", "O", "Q", "R", "U", "V", "X", "Y", "Z", "7", "9", "0", "α", "β", "γ", "δ", "ε", "ζ", "η", "θ", "ι", "κ", "λ", "μ", "ν", "ξ", "ω", "Θ", "Ψ"].includes(opp.t)) {
 const shH = applyRelicHealBonus(act, healAmt(6, c), act === steps[1].act);
 P[act].hp = Math.min(P[act].maxHp || 100, P[act].hp + shH);
 recordHeal(act, shH, false);
 pop(act, `+${shH} HP`, "#3fb8a8");
 snd("shield");
 ev.push(`${P[act].name} укріплює щит (+${shH} HP)`);
 }

 if (dmg > 0) {
 if (opp.t === "s") {
 const counter = dmgAmt(val(opp, P[def].hp), opp);
 pop(def, "БЛОК!", "#3fb8a8");
 burst(def, "#3fb8a8");
 snd("shield");
 await sl(300);
 P[act].hp -= counter;
 await orb(def, act, "#3fb8a8");
 hit(act, counter);
 ev.push(`${P[def].name} блокує та б’є у відповідь −${counter}`);
 if (P[act].hp <= 0 && resolveDeathOrSave(act, ev)) { upd(); break; }
 } else if (opp.t === "m") {
 await perseusMirrorFx(act, def, () => {
 pop(def, "ВІДБИТТЯ!", "#e879f9");
 burst(def, "#e879f9");
 P[act].hp -= dmg;
 hit(act, dmg);
 });
 ev.push(`${P[def].name} дзеркалить −${dmg} назад у ${P[act].name}!`);
 if (P[act].hp <= 0 && resolveDeathOrSave(act, ev)) { upd(); break; }
 } else {
 const orbCol = c.t === "e" ? sc : c.t === "o" ? "#38bdf8" : c.t === "a" ? "#f97316" : c.t === "u" ? "#ef4444" : c.t === "f" ? "#fb923c" : c.t === "z" ? "#facc15" : c.t === "x" ? "#f43f5e" : "#6fe0cf";
 const strike = () => { const sIdxD = P[act].tourIdx ?? act; if (STAT[sIdxD]) { STAT[sIdxD].dmg += dmg; STAT[sIdxD].big = Math.max(STAT[sIdxD].big, dmg); }
 if (sIdxD === 0 && dmg > PROFILE.bestHit) { PROFILE.bestHit = dmg; saveProfile(); } P[def].hp -= dmg; hit(def, dmg); };
 if (c.t === "o") await mjolFx(act, def, strike);
 else if (c.t === "e" && suit === "spade") await spikeFx(act, def, strike);
 else if (c.t === "v") {
 let hv = val(c, P[act].hp);
 if (wk) hv = Math.round(hv * .7);
 if (half) hv = Math.round(hv / 2);
 hv = applyRelicHealBonus(act, healAmt(hv, c), act === steps[1].act);
 await satFx(act, def, strike, () => {
 vDrained = true;
 if (P[act].noHeal > 0) {
 P[act].noHeal = 0; P[act].nhAge = 0;
 pop(act, "ЗЦІЛЕННЯ ЗАБЛОКОВАНО!", "#5eead4"); burst(act, "#2dd4bf"); snd("shatter");
 upd();
 ev.push(`${P[act].name}: Кайдани Фантома спалюють вампіризм`);
 return;
 }
 P[act].hp = Math.min(P[act].maxHp || 100, P[act].hp + hv);
 recordHeal(act, hv, false);
 pop(act, "+" + hv + " HP", "#4ade80");
 burst(act, "#4ade80"); burst(act, "#dc2626");
 upd();
 ev.push(`${P[act].name} +${hv} HP (вампіризм)`);
 });
 }
 else if (c.t === "u") await huskadFx(act, def, strike, dmg);
 else if (c.t === "k") await panFx(act, def, strike);
 else if (c.t === "b") await drumFx(act, def, strike);
 else if (c.t === "j") await fafnirFx(act, def, act === steps[1].act, strike);
 else if (c.t === "l") await shackleFx(act, def, strike);
 else if (c.t === "D") await slingShotFx(act, def, P[def].hp > 80, strike);
 else if (c.t === "A") await pitchTarFx(act, def, strike);
 else if (c.t === "C") await chaosBladeFx(act, def, dmg, strike);
 else if (c.t === "S") await sisyphusFx(act, def, strike);
 else if (c.t === "Y") await twinBladeFx(act, def, dmg);
 else if (c.t === "P") await scorpionFx(act, def, strike);
 else if (c.t === "W") await furyWhipFx(act, def, !!P[act].tookPrevDmg, strike);
 else if (c.t === "G") await heliosChariotFx(act, def, strike);
 else if (c.t === "L") await achillesSpearFx(act, def, P[act].hp < 50, strike);
 else if (c.t === "E") await erebusCurseFx(act, def, strike);
 else if (c.t === "7") await charybdisFx(act, def, charybdisBonus, strike);
 else if (c.t === "9") {
 const otherIds = n > 2 ? P.map((p, idx) => (idx !== act && idx !== def && p.alive) ? idx : -1).filter(idx => idx >= 0) : [];
 let splashBase = 10;
 if (mimicMult !== 1) splashBase = Math.round(splashBase * mimicMult);
 if (wk) splashBase = Math.round(splashBase * .7);
 if (CUR_ARENA && CUR_ARENA.dmgMult && CUR_ARENA.dmgMult !== 1) splashBase = Math.max(1, Math.round(splashBase * CUR_ARENA.dmgMult));
 if (CUR_ARENA && CUR_ARENA.id === "astral" && c.r === ASTRAL_RARITY) splashBase = Math.max(1, Math.round(splashBase * 1.35));
 if (half) splashBase = Math.round(splashBase / 2);
 await destroyerFx(act, def, otherIds, strike, (oi) => {
  if (!P[oi] || !P[oi].alive) return;
  let sd = splashBase;
  if (P[oi].relicShield > 0 && sd > 0) {
   const abs = Math.min(P[oi].relicShield, sd);
   P[oi].relicShield -= abs; sd -= abs;
   pop(oi, `ЩИТ −${abs}`, "#38bdf8");
  }
  if (sd > 0) {
   const sIdxD = P[act].tourIdx ?? act;
   if (STAT[sIdxD]) STAT[sIdxD].dmg += sd;
   P[oi].hp -= sd;
   hit(oi, sd);
   ev.push(`${P[act].name} (уламок Дестрояра) −${sd} → ${P[oi].name}`);
   if (P[oi].hp <= 0 && resolveDeathOrSave(oi, ev)) {
    pop(oi, "ВИБУВ", "#ef4444");
    ev.push(`${P[oi].name} гине від осколків Дестрояра!`);
   }
   upd();
  }
 });
 }
 else if (c.t === "0") {
 let hv = 15;
 if (mimicMult !== 1) hv = Math.round(hv * mimicMult);
 if (wk) hv = Math.round(hv * .7);
 if (half) hv = Math.round(hv / 2);
 hv = applyRelicHealBonus(act, healAmt(hv, c), act === steps[1].act);
 await midasFx(act, def, strike, () => {
  if (!P[act] || !P[act].alive) return;
  if (P[act].revHeal > 0) {
   P[act].revHeal = 0;
   reverseHealImpact(act, hv);
   ev.push(`${P[act].name}: Прокляття Ереба обертає золото Мідаса на −${hv} HP!`);
   return;
  }
  if (P[act].noHeal > 0) {
   P[act].noHeal = 0; P[act].nhAge = 0;
   pop(act, "ЗЦІЛЕННЯ ЗАБЛОКОВАНО!", "#5eead4"); burst(act, "#2dd4bf"); snd("shatter");
   upd();
   ev.push(`${P[act].name}: Кайдани Фантома спалюють зцілення Руки Мідаса`);
   return;
  }
  P[act].hp = Math.min(P[act].maxHp || 100, P[act].hp + hv);
  recordHeal(act, hv, false);
  pop(act, "+" + hv + " HP", "#fde047");
  burst(act, "#4ade80"); burst(act, "#facc15");
  upd();
  ev.push(`${P[act].name}: Рука Мідаса +${hv} HP`);
 });
 }
 else if (c.t === "ζ") await boreasBladeFx(act, def, boreasBonus, dmg, strike);
 else if (c.t === "η") await apolloArrowFx(act, def, apolloIgnored, strike);
 else if (c.t === "θ") await moiraiBrandFx(act, def, moiraiFatal, dmg, strike);
 else if (c.t === "ι") await scyllaVortexFx(act, def, strike);
 else if (c.t === "κ") await aresWrathFx(act, def, aresEnraged, dmg, strike);
 else if (c.t === "λ") await typhonHammerFx(act, def, typhonShatter, strike, () => {
  const hadFr = !!P[def].frost;
  clearAllNegativeEffects(P[def]);
  if (hadFr) { fz[def] = false; frostShatter(def); }
  if (def === 0) renderHand();
  const sIdxD = P[act].tourIdx ?? act;
  if (STAT[sIdxD]) { STAT[sIdxD].dmg += 12; STAT[sIdxD].big = Math.max(STAT[sIdxD].big, dmg + 12); }
  if (sIdxD === 0 && (dmg + 12) > PROFILE.bestHit) { PROFILE.bestHit = dmg + 12; saveProfile(); }
  P[def].hp -= 12;
  hit(def, 12);
  ev.push(`${P[act].name}: Молот Тіфону розбиває дебафи ${P[def].name} і завдає +12 чистої шкоди!`);
  upd();
 });
 else if (c.t === "μ") await gorgonStrikeFx(act, def, strike, () => {
  if (!P[act] || !P[act].alive) return;
  P[act].hp -= 8;
  hit(act, 8);
  pop(act, "−8 ВІДДАЧА", "#a3e635");
  ev.push(`${P[act].name} отримує −8 HP токсичної віддачі від Удару Горгони`);
  if (P[act].hp <= 0 && resolveDeathOrSave(act, ev)) { pop(act, "ВИБУВ", "#ef4444"); }
  upd();
 });
 else if (c.t === "ν") await fireWrathFx(act, def, fireWrathBonus, strike);
 else if (c.t === "ξ") await zeusHandFx(act, def, zeusBoosted, zeusStrippedCols, strike);
 else if (c.t === "ω") await charonWrathFx(act, def, charonExec, strike, () => {
  if (!P[def] || P[def].hp <= 0 || !P[def].hand.length || P[act].hand.length >= 12) return null;
  const stolen = P[def].hand.splice(rnd(P[def].hand.length), 1)[0];
  stolen.pz = 0;
  P[act].hand.push(stolen);
  ev.push(`${P[act].name}: Кара Харона забирає «${cardName(stolen)}» з руки ${P[def].name}!`);
  upd();
  return stolen;
 });
 else if (c.t === "d" && c.r === 2) await tridentVortexFx(act, def, strike);
 else if (c.t === "d" && c.r === 4) await titanSwordFx(act, def, strike);
 else { strikeArrow(act, def, c._colHex ? "#fb7185" : orbCol); await orb(act, def, c._colHex ? "#fb7185" : orbCol); strike(); }
 ev.push(`${P[act].name} (${c._colHex ? "" + cardName(c) : cardName(c)}) −${dmg}${half ? " (лід)" : ""} → ${P[def].name}`);
 if (hasRelic(act, "blade_nosferatu") && dmg > 0 && P[act].alive) {
   const nosfH = Math.max(1, Math.round(dmg * 0.15));
   if (P[act].revHeal > 0) {
     P[act].revHeal = 0;
     await reverseHealImpact(act, nosfH);
     ev.push(`${P[act].name}: Прокляття Ереба обертає вампіризм Носферату на −${nosfH} HP!`);
   } else if (P[act].noHeal > 0) {
     P[act].noHeal = 0; P[act].nhAge = 0;
     pop(act, "ВАМПІРИЗМ СПАЛЕНО!", "#5eead4");
   } else {
     P[act].hp = Math.min(P[act].maxHp || 100, P[act].hp + nosfH);
     recordHeal(act, nosfH, false);
     pop(act, `+${nosfH} HP (НОСФЕРАТУ)`, "#fb7185");
     burst(act, "#e11d48");
     ev.push(`${P[act].name}: Клинок Носферату +${nosfH} HP`);
   }
   upd();
 }
 if (CUR_ARENA && CUR_ARENA.vampPct && dmg > 0 && P[act].alive) {
 const vampH = Math.max(1, Math.round(dmg * CUR_ARENA.vampPct));
 if (P[act].revHeal > 0) {
 P[act].revHeal = 0;
 await reverseHealImpact(act, vampH);
 ev.push(`${P[act].name}: Прокляття Ереба обертає вампіризм на −${vampH} HP!`);
 } else if (P[act].noHeal > 0) {
 P[act].noHeal = 0; P[act].nhAge = 0;
 pop(act, "ВАМПІРИЗМ СПАЛЕНО!", "#5eead4"); burst(act, "#2dd4bf"); snd("shatter");
 } else {
 P[act].hp = Math.min(P[act].maxHp || 100, P[act].hp + vampH);
 recordHeal(act, vampH, false);
 pop(act, `+${vampH} HP`, "#fb7185");
 burst(act, "#e11d48"); snd("heal");
 ev.push(`${P[act].name}: Спрага Колізею +${vampH} HP (вампіризм 25%)`);
 }
 upd();
 }

 if ((c.t === "a" || c.t === "G") && P[def].hp > 0) {
  if (P[def].burnImmune > 0) {
   pop(def, "ІМУНІТЕТ ДО ГОРІННЯ!", "#fb923c"); burst(def, "#fb923c"); snd("shield");
   ev.push(`${P[def].name}: Кров Саламандри блокує «Горіння»!`);
  } else {
   P[def].fx.push({ t: "b", v: 15, left: 1, wait: 1 }); // шкода — наприкінці НАСТУПНОГО кола
   pop(def, "ПІДПАЛЕНО", "#f97316"); burst(def, "#ea580c"); burst(def, "#fde047"); snd("thunder"); upd();
  }
 }
 if (c.t === "P" && P[def].hp > 0) {
 const isBas = hasRelic(act, "fang_basilisk");
 const pDur = 2 + durBonus() + (isBas ? 1 : 0);
 P[def].fx.push({ t: "p", v: 10, left: pDur, uncurable: isBas });
 pop(def, `ОТРУТА −10×${pDur}`, "#8bd35a"); burst(def, "#8bd35a"); snd("poison"); upd();
 }
 if (c.t === "E" && P[def].hp > 0) {
 P[def].revHeal = 1;
 upd();
 }
 if (c.t === "e" && suit === "club") { pop(def, "−20 HP ТРЕФА", "#34d399"); burst(def, "#10b981"); }
 if (P[def].thorn > 0 && P[def].hp > 0 && dmg > 0) {
 const rf = Math.round(dmg * .35); P[def].thorn--;
 pop(def, "ШИПИ", "#e11d48"); await needlesFx(def, act);
 P[act].hp -= rf; hit(act, rf); pop(act, "−" + rf + " HP", "#ef4444"); ev.push(`${P[def].name}: шипи повертають −${rf}`);
 if (P[act].hp <= 0 && resolveDeathOrSave(act, ev)) { pop(act, "ВИБУВ", "#ef4444"); upd(); break; }
 upd();
 }
 if (c.t === "z" && P[def].hp > 0) {
 stunned[def] = true;
 pop(def, "ШОК!", "#facc15");
 }
 if (c.t === "q" && P[def].hp > 0) {
 const free = P[def].hand.map((x, ii) => ii).filter(ii => !(P[def].hand[ii].pz > 0));
 if (free.length >= 2) {
 const idx = free[rnd(free.length)], tc = P[def].hand[idx];
 tc.pz = 2;
 pop(def, "СКАМ'ЯНІННЯ", "#34d399"); burst(def, "#34d399"); snd("shatter");
 ev.push(`${P[act].name}: Око Медузи скам'янює «${cardName(tc)}» в руці ${P[def].name} на 2 кола`);
 if (def === 0) renderHand();
 } else {
 ev.push(`${P[act].name}: Око Медузи — у ${P[def].name} лишилась би без жодної карти, тож ефект не спрацював`);
 }
 }
 if (c.t === "l" && P[def].hp > 0) {
 P[def].noHeal = 1; P[def].nhAge = 0;
 ev.push(`${P[act].name}: Кайдани Фантома блокують наступне зцілення ${P[def].name}!`);
 upd();
 }
 if (c.t === "y" && P[def].hp > 0) {
 P[def].atkDebuff = (P[def].atkDebuff || 0) + 5;
 pop(def, "−5 НА АТАЦІ", "#7dd3fc"); burst(def, "#7dd3fc");
 ev.push(`${P[act].name}: Крижана голка послаблює наступну атаку ${P[def].name} на 5`);
 }
 if (c.t === "A" && P[def].hp > 0) {
 P[def].slow = 1;
 ev.push(`${P[act].name}: Смола Аїда уповільнює ${P[def].name} — наступна дія втрачає пріоритет!`);
 upd();
 }
 if (c.t === "ι" && P[def].hp > 0) {
 P[def].disorient = 1; P[def].dsAge = 0;
 ev.push(`${P[act].name}: Вихор Скілли накладає Дезорієнтацію на ${P[def].name} (наступний хіл −50%)!`);
 upd();
 }
 if (c.t === "μ" && P[def].hp > 0) {
 const isBas = hasRelic(act, "fang_basilisk");
 const gDur = 2 + durBonus() + (isBas ? 1 : 0);
 P[def].fx.push({ t: "p", v: 15, left: gDur, uncurable: isBas });
 pop(def, `ОТРУТА −15×${gDur}`, "#8bd35a"); burst(def, "#8bd35a"); snd("poison");
 ev.push(`${P[act].name}: Удар Горгони отруює ${P[def].name} (−15×${gDur})`);
 upd();
 }
 if (P[act].hp <= 0 && resolveDeathOrSave(act, ev)) {
 upd();
 break;
 }

 if (P[def].hp <= 0 && resolveDeathOrSave(def, ev)) {
 pop(def, "ВИБУВ", "#ef4444");
 ev.push(`${P[def].name} гине до свого ходу!`);
 upd();
 break;
 }
 }
 }

 // Прокляття Ереба: наступне зцілення гравця завдає йому шкоди замість лікування
 if (!c._colHex && P[act].revHeal > 0 && ("hgrtnHFBK1234568πρστυφχψΓΔΦΩ".includes(c.t) || (c.t === "e" && suit === "heart") || (c.t === "v" && !vDrained))) {
 const wasFirstH = !P[act].healedInMatch;
 P[act].healedInMatch = true;
 P[act].revHeal = 0;
 let revDmg = val(c, P[act].hp);
 if (c.t === "F" && !hasAnyDebuff(P[act])) revDmg += 5;
 if (c.t === "H" && P[act].hp < 40) revDmg += 8;
 if (c.t === "6" && P[act].hp < 30) revDmg += 7;
 if (c.t === "τ" && wasFirstH) revDmg += 6;
 if (c.t === "υ" && P[act].hp < P[def].hp) revDmg += 7;
 if (c.t === "φ" && (P[def].lastHeal || 0) > 0) revDmg += Math.min(10, Math.round(P[def].lastHeal * 0.25));
 if (c.t === "Γ" && P[act].attackedThisRound) revDmg += 8;
 if (c.t === "Φ" && (P[act].fx || []).some(f => f.t === "b")) revDmg += 10;
 if (c.t === "e") revDmg = 30;
 if (c.t === "g" || c.t === "B") revDmg = 20;
 revDmg = Math.round(revDmg * mimicMult * (wk ? 0.7 : 1));
 await reverseHealImpact(act, revDmg);
 ev.push(`${P[act].name}: Прокляття Ереба обертає «${cardName(c)}» на −${revDmg} HP!`);
 thaw(act); upd(); await sl(450);
 continue;
 }
 // Якщо гравець скутий Кайданами Фантома — будь-яке його лікування згорає
 if (!c._colHex && P[act].noHeal > 0 && ("hgrtnHFBK1234568πρστυφχψΓΔΦΩ".includes(c.t) || (c.t === "e" && suit === "heart") || (c.t === "v" && !vDrained))) {
 P[act].healedInMatch = true;
 P[act].noHeal = 0; P[act].nhAge = 0;
 await burnHealCardFx(act, c);
 ev.push(`${P[act].name}: Кайдани Фантома спалюють бірюзовим полум'ям «${cardName(c)}»!`);
 thaw(act); upd(); await sl(450);
 continue;
 }
 const applyDisorientHeal = (pIdx, baseHv) => {
 P[pIdx].healedInMatch = true;
 P[pIdx].healedCardThisRound = true;
 let finalHv = baseHv;
 if (P[pIdx].fortuneBonus > 0) {
  finalHv += P[pIdx].fortuneBonus;
  P[pIdx].fortuneBonus = 0; P[pIdx].fortuneKeep = 0;
  pop(pIdx, "+15 ФОРТУНА!", "#facc15");
 }
 if (P[pIdx].timeLock > 0) {
  finalHv = Math.max(1, Math.round(finalHv * 0.8));
  pop(pIdx, "ОКОВИ −20%", "#7dd3fc");
 }
 if (narcissusCut[pIdx]) {
  narcissusCut[pIdx] = false;
  finalHv = Math.max(1, Math.round(finalHv * 0.5));
  pop(pIdx, "НАРЦИС −50%", "#34d399");
 }
 if (P[pIdx].disorient > 0) {
  P[pIdx].disorient = 0; P[pIdx].dsAge = 0;
  finalHv = Math.max(1, Math.round(finalHv * 0.5));
  pop(pIdx, "ДЕЗОРІЄНТАЦІЯ −50%", "#c084fc");
  ev.push(`${P[pIdx].name}: Дезорієнтація зменшує лікування вдвічі (+${finalHv} HP)`);
 }
 recordHeal(pIdx, finalHv, true);
 return finalHv;
 };
 if (!c._colHex && c.t === "F" && P[act].alive) {
 const noDebuff = !hasAnyDebuff(P[act]);
 let hv = val(c, P[act].hp) + (noDebuff ? 5 : 0);
 hv = applyDisorientHeal(act, applyRelicHealBonus(act, healAmt(Math.round(hv * mimicMult * (wk ? 0.7 : 1)), c), act === steps[1].act));
 await asclepiusFx(act, noDebuff, () => {
 P[act].hp = Math.min(P[act].maxHp || 100, P[act].hp + hv);
 pop(act, noDebuff ? `+${hv} HP` : `+${hv} HP`, noDebuff ? "#fde047" : "#4ade80");
 upd();
 });
 ev.push(`${P[act].name}: Фіал Асклепія +${hv} HP${noDebuff ? " (без дебафів!)" : ""}`);
 }
 if (!c._colHex && c.t === "T" && P[act].alive) {
 let hv = applyDisorientHeal(act, applyRelicHealBonus(act, healAmt(Math.round(val(c, P[act].hp) * mimicMult * (wk ? 0.7 : 1)), c), act === steps[1].act));
 await turtleFx(act, () => {
 P[act].hp = Math.min(P[act].maxHp || 100, P[act].hp + hv);
 P[act].shellDef = 1;
 pop(act, `+${hv} HP`, "#4ade80");
 pop(act, "${UI_IC.shield} −25% ШКОДИ", "#38bdf8");
 upd();
 });
 ev.push(`${P[act].name}: Панцир Черепахи +${hv} HP та синій панцир (−25% шкоди від наступної атаки)`);
 }
 if (!c._colHex && c.t === "8" && P[act].alive) {
  let hv = applyDisorientHeal(act, applyRelicHealBonus(act, healAmt(Math.round(val(c, P[act].hp) * mimicMult * (wk ? 0.7 : 1)), c), act === steps[1].act));
  const regV = healAmt(8, c);
  const dDur = 2 + durBonus();
  await dionysusVineFx(act, def, () => {
   P[act].hp = Math.min(P[act].maxHp || 100, P[act].hp + hv);
   P[act].fx.push({ t: "g", v: regV, left: dDur });
   if (P[def].alive) {
    P[def].atkDebuff = (P[def].atkDebuff || 0) + 5;
   }
   pop(act, `+${hv} HP`, "#4ade80");
   pop(act, `+${regV}×${dDur}`, "#c084fc");
   if (P[def].alive) pop(def, "−5 НА АТАЦІ", "#c084fc");
   upd();
  });
  ev.push(`${P[act].name}: Лоза Діоніса +${hv} HP, реген +${regV}×${dDur} та −5 до наступної атаки ${P[def].name}`);
 }
 if (!c._colHex && c.t === "B" && P[act].alive) {
 let hv = applyDisorientHeal(act, applyRelicHealBonus(act, healAmt(Math.round(val(c, P[act].hp) * mimicMult * (wk ? 0.7 : 1)), c), act === steps[1].act));
 const regV = healAmt(10, c);
 const bDur = 2 + durBonus();
 await hebeCupFx(act, () => {
 P[act].hp = Math.min(P[act].maxHp || 100, P[act].hp + hv);
 P[act].fx.push({ t: "g", v: regV, left: bDur });
 pop(act, `+${hv} HP`, "#4ade80");
 pop(act, `+${regV}×${bDur}`, "#fde047");
 upd();
 });
 ev.push(`${P[act].name}: Чаша Геби +${hv} HP та регенерація +${regV} на ${bDur} кола`);
 }
 if (!c._colHex && c.t === "K" && P[act].alive) {
 let hv = applyDisorientHeal(act, applyRelicHealBonus(act, healAmt(Math.round(val(c, P[act].hp) * mimicMult * (wk ? 0.7 : 1)), c), act === steps[1].act));
 const atkCards = P[act].hand.map((x, idx) => idx).filter(idx => "dfvzxukboaqyjlDACSPWGLIJMOQRUVXYZ790αβγδεζηθικλμνξω".includes(P[act].hand[idx].t));
 const pickIdx = atkCards.length ? atkCards[rnd(atkCards.length)] : -1;
 if (pickIdx >= 0) P[act].hand[pickIdx].b = (P[act].hand[pickIdx].b || 0) + 8;
 await titanBloodFx(act, pickIdx, () => {
 P[act].hp = Math.min(P[act].maxHp || 100, P[act].hp + hv);
 pop(act, `+${hv} HP`, "#4ade80");
 upd();
 });
 ev.push(`${P[act].name}: Кров Титана +${hv} HP${pickIdx >= 0 ? ` та +8 до «${cardName(P[act].hand[pickIdx])}»` : ""}`);
 }
 if (!c._colHex && c.t === "n" && P[act].alive) {
 await sunFx(act, () => {
 const hadFrost = !!P[act].frost;
 clearAllNegativeEffects(P[act]);
 if (hadFrost) { fz[act] = false; frostShatter(act); }
 if (act === 0) renderHand();
 upd();
 }, () => {
 const sunH = applyRelicHealBonus(act, healAmt(40, c), act === steps[1].act);
 recordHeal(act, sunH, true);
 P[act].hp = Math.min(P[act].maxHp || 100, P[act].hp + sunH);
 pop(act, `+${sunH} HP`, "#4ade80"); burst(act, "#4ade80"); snd("heal");
 upd();
 });
 ev.push(`${P[act].name}: Благословення Ра +${healAmt(40)} HP, усі негативні ефекти спалено`);
 }
 if (!c._colHex && c.t === "t" && P[act].alive) {
 await thornFx(act);
 const thH = applyDisorientHeal(act, applyRelicHealBonus(act, healAmt(Math.round(30 * (wk ? .7 : 1)), c), act === steps[1].act));
 P[act].hp = Math.min(P[act].maxHp || 100, P[act].hp + thH); P[act].thorn = 2;
 pop(act, `+${thH}`, "#4ade80"); pop(act, "ШИПИ 35%", "#fb7185"); snd("heal"); upd();
 ev.push(`${P[act].name}: Шип рози +30 HP, бар'єр шипів`);
 }
 if (c.t === "e" && P[act].alive) {
 if (suit === "heart") {
 const prH = applyDisorientHeal(act, applyRelicHealBonus(act, healAmt(Math.round(30 * (wk ? .7 : 1)), c), act === steps[1].act));
 P[act].hp = Math.min(P[act].maxHp || 100, P[act].hp + prH);
 const C = seatC(act); sparkBurst(C.x, C.y, ["#e11d48", "#4ade80", "#fb7185"], 20, 80);
 pop(act, `+${prH} HP`, "#4ade80"); burst(act, "#e11d48"); snd("heal");
 if (P[def].alive) { await orb(act, def, "#e11d48"); P[def].weak = true; pop(def, "ВЗЯТКА −30%", "#fb7185"); burst(def, "#e11d48"); }
 }
 if (suit === "diamond") {
 P[act].hand.forEach(x => { if ("dfvzxukboaqyjlDACSPWGLIJMOQRUVXYZ790αβγδεζηθικλμνξω".includes(x.t)) x.b = (x.b || 0) + 10; });
 const C = seatC(act); sparkBurst(C.x, C.y, ["#fbbf24", "#fde047", "#fff"], 30, 110);
 pop(act, "+10 АТАКА", "#fbbf24"); burst(act, "#fbbf24"); snd("heal");
 }
 if (suit === "club" && P[def].alive && P[def].hand.length) {
 const dc = P[def].hand.splice(rnd(P[def].hand.length), 1)[0];
 ashFx(def, cardName(dc));
 }
 upd();
 }
 if (!c._colHex && c.t === "r" && P[act].alive) {
 await bloodFx(act);
 bell();
 const blH = applyDisorientHeal(act, applyRelicHealBonus(act, healAmt(30, c), act === steps[1].act)), blReg = applyRelicHealBonus(act, healAmt(10, c), false);
 P[act].hp = Math.min(P[act].maxHp || 100, P[act].hp + blH);
 P[act].fx.push({ t: "g", v: blReg, left: 999, blad: true });
 pop(act, `+${blH}`, "#ef4444"); snd("heal");
 ev.push(`${P[act].name}: Блад +${blH} HP, далі +${blReg} щокола до кінця гри`);
 }
 if (!c._colHex && c.t === "H" && P[act].hp > 0) {
 const isTide = P[act].hp < 40;
 let hv = val(c, P[act].hp) + (isTide ? 8 : 0);
 hv = Math.round(hv * mimicMult);
 if (wk) hv = Math.round(hv * .7);
 hv = applyDisorientHeal(act, applyRelicHealBonus(act, healAmt(hv, c), act === steps[1].act));
 await waveSurfFx(act, isTide, () => {
 P[act].hp = Math.min(P[act].maxHp || 100, P[act].hp + hv);
 pop(act, isTide ? `+${hv} ПРИПЛИВ!` : `+${hv} HP`, isTide ? "#38bdf8" : "#4ade80");
 burst(act, "#38bdf8");
 upd();
 });
 ev.push(`${P[act].name} (Хвиля прибою) +${hv} HP${isTide ? " (приплив)" : ""}`);
 }

 if (!c._colHex && c.t === "τ" && P[act].alive) {
  const isFirstHeal = !P[act].healedInMatch;
  let rawV = val(c, P[act].hp) + (isFirstHeal ? 6 : 0);
  let hv = applyDisorientHeal(act, applyRelicHealBonus(act, healAmt(Math.round(rawV * mimicMult * (wk ? 0.7 : 1)), c), act === steps[1].act));
  await springKeyFx(act, isFirstHeal, hv, () => {
   P[act].hp = Math.min(P[act].maxHp || 100, P[act].hp + hv);
   pop(act, isFirstHeal ? `+${hv} HP (+6 ПЕРШИЙ!)` : `+${hv} HP`, isFirstHeal ? "#7dd3fc" : "#4ade80");
   upd();
  });
  ev.push(`${P[act].name}: Ключ Джерела +${hv} HP${isFirstHeal ? " (перший хіл у бою!)" : ""}`);
 }
 if (!c._colHex && c.t === "υ" && P[act].alive) {
  const isBehind = P[def] && P[act].hp < P[def].hp;
  let rawV = val(c, P[act].hp) + (isBehind ? 7 : 0);
  let hv = applyDisorientHeal(act, applyRelicHealBonus(act, healAmt(Math.round(rawV * mimicMult * (wk ? 0.7 : 1)), c), act === steps[1].act));
  await zephyrWingsFx(act, isBehind, hv, () => {
   P[act].hp = Math.min(P[act].maxHp || 100, P[act].hp + hv);
   pop(act, isBehind ? `+${hv} HP (ЗЕФІР +7!)` : `+${hv} HP`, isBehind ? "#bae6fd" : "#4ade80");
   upd();
  });
  ev.push(`${P[act].name}: Крила Зефіра +${hv} HP${isBehind ? " (менше HP за ворога!)" : ""}`);
 }
 if (!c._colHex && c.t === "φ" && P[act].alive) {
  const foeLast = (P[def] && P[def].lastHeal > 0) ? P[def].lastHeal : 0;
  const copyBonus = foeLast > 0 ? Math.min(10, Math.round(foeLast * 0.25)) : 0;
  let rawV = val(c, P[act].hp) + copyBonus;
  let hv = applyDisorientHeal(act, applyRelicHealBonus(act, healAmt(Math.round(rawV * mimicMult * (wk ? 0.7 : 1)), c), act === steps[1].act));
  await nyxMirrorFx(act, copyBonus, hv, () => {
   P[act].hp = Math.min(P[act].maxHp || 100, P[act].hp + hv);
   pop(act, copyBonus > 0 ? `+${hv} HP (КОПІЯ +${copyBonus})` : `+${hv} HP`, copyBonus > 0 ? "#e879f9" : "#4ade80");
   upd();
  });
  ev.push(`${P[act].name}: Дзеркало Нікти +${hv} HP${copyBonus > 0 ? ` (+${copyBonus} з останнього хілу ${P[def].name})` : ""}`);
 }
 if (!c._colHex && c.t === "χ" && P[act].alive) {
  let hv = applyDisorientHeal(act, applyRelicHealBonus(act, healAmt(Math.round(val(c, P[act].hp) * mimicMult * (wk ? 0.7 : 1)), c), act === steps[1].act));
  const regV = healAmt(6, c);
  const hDur = 2 + durBonus();
  await hestiaSparkFx(act, hv, regV, hDur, () => {
   P[act].hp = Math.min(P[act].maxHp || 100, P[act].hp + hv);
   P[act].fx.push({ t: "g", v: regV, left: hDur, hestia: true });
   pop(act, `+${hv} HP`, "#4ade80");
   pop(act, `ВОГНИЩЕ +${regV}×${hDur}`, "#fbbf24");
   upd();
  });
  ev.push(`${P[act].name}: Іскра Гестії +${hv} HP та вогнище +${regV}×${hDur} (не лікує при Горінні)`);
 }
 if (!c._colHex && c.t === "ψ" && P[act].alive) {
  const canCleanse = P[act].hp <= 45;
  let hv = applyDisorientHeal(act, applyRelicHealBonus(act, healAmt(Math.round(val(c, P[act].hp) * mimicMult * (wk ? 0.7 : 1)), c), act === steps[1].act));
  let cleansed = null;
  await persephoneFlowerFx(act, canCleanse && hasAnyDebuff(P[act]), () => {
   P[act].hp = Math.min(P[act].maxHp || 100, P[act].hp + hv);
   if (canCleanse) cleansed = cleanseOneDebuff(act, fz);
   pop(act, `+${hv} HP`, "#4ade80");
   if (cleansed) pop(act, "ЗНЯТО ДЕБАФ!", "#e879f9");
   upd();
  });
  ev.push(`${P[act].name}: Квітка Персефони +${hv} HP${cleansed ? " та знято 1 негативний ефект!" : ""}`);
 }
 if (!c._colHex && c.t === "Γ" && P[act].alive) {
  const hasEcho = !!P[act].attackedThisRound;
  let rawV = val(c, P[act].hp) + (hasEcho ? 8 : 0);
  let hv = applyDisorientHeal(act, applyRelicHealBonus(act, healAmt(Math.round(rawV * mimicMult * (wk ? 0.7 : 1)), c), act === steps[1].act));
  await arcadiaEchoFx(act, hasEcho, hv, () => {
   P[act].hp = Math.min(P[act].maxHp || 100, P[act].hp + hv);
   pop(act, hasEcho ? `+${hv} HP (ЕХО +8!)` : `+${hv} HP`, hasEcho ? "#d8b4fe" : "#4ade80");
   upd();
  });
  ev.push(`${P[act].name}: Ехо Аркадії +${hv} HP${hasEcho ? " (бонус після атаки цього кола!)" : ""}`);
 }
 if (!c._colHex && c.t === "Δ" && P[act].alive) {
  let hv = applyDisorientHeal(act, applyRelicHealBonus(act, healAmt(Math.round(val(c, P[act].hp) * mimicMult * (wk ? 0.7 : 1)), c), act === steps[1].act));
  const drainDmg = Math.max(1, Math.round(8 * mimicMult));
  await sacrificialCupFx(act, def, hv, drainDmg, () => {
   P[act].hp = Math.min(P[act].maxHp || 100, P[act].hp + hv);
   if (P[def] && P[def].alive) {
    P[def].fx.push({ t: "sc", v: drainDmg, left: 1, src: act });
    pop(def, `ЖЕРТВА −${drainDmg}`, "#f43f5e");
   }
   pop(act, `+${hv} HP`, "#4ade80");
   upd();
  });
  ev.push(`${P[act].name}: Жертовний Кубок +${hv} HP${P[def] && P[def].alive ? ` (забере −${drainDmg} HP у ${P[def].name} наприкінці кола)` : ""}`);
 }
 if (!c._colHex && c.t === "Φ" && P[act].alive) {
  const wasBurning = (P[act].fx || []).some(f => f.t === "b");
  let rawV = val(c, P[act].hp) + (wasBurning ? 10 : 0);
  let hv = applyDisorientHeal(act, applyRelicHealBonus(act, healAmt(Math.round(rawV * mimicMult * (wk ? 0.7 : 1)), c), act === steps[1].act));
  await salamanderBloodFx(act, wasBurning, hv, () => {
   if (wasBurning) P[act].fx = P[act].fx.filter(f => f.t !== "b");
   P[act].hp = Math.min(P[act].maxHp || 100, P[act].hp + hv);
   P[act].burnImmune = Math.max(P[act].burnImmune || 0, 2);
   pop(act, wasBurning ? `+${hv} HP (ПОЛУМ'Я ЗГАШЕНО!)` : `+${hv} HP`, wasBurning ? "#fde047" : "#4ade80");
   pop(act, "ІМУНІТЕТ ДО ГОРІННЯ (2)", "#fb923c");
   upd();
  });
  ev.push(`${P[act].name}: Кров Саламандри +${hv} HP${wasBurning ? " (Горіння знято!)" : ""} та імунітет до Горіння на 2 кола`);
 }
 if (!c._colHex && c.t === "Ω" && P[act].alive) {
  let hv = applyDisorientHeal(act, applyRelicHealBonus(act, healAmt(Math.round(val(c, P[act].hp) * mimicMult * (wk ? 0.7 : 1)), c), act === steps[1].act));
  const regV = healAmt(12, c);
  const tDur = 3 + durBonus();
  const grantRoot = !P[act].lifeRootUsed;
  await treeOfLifeFx(act, hv, regV, tDur, grantRoot, () => {
   P[act].hp = Math.min(P[act].maxHp || 100, P[act].hp + hv);
   P[act].fx.push({ t: "g", v: regV, left: tDur });
   if (grantRoot) P[act].lifeRoot = 1;
   pop(act, `+${hv} HP`, "#4ade80");
   pop(act, `+${regV}×${tDur}`, "#fde047");
   if (grantRoot) pop(act, "КОРІННЯ ЖИТТЯ", "#fef08a");
   upd();
  });
  ev.push(`${P[act].name}: Дерево Життя +${hv} HP, реген +${regV}×${tDur}${grantRoot ? " та захист від смерті «Коріння Життя»!" : ""}`);
 }
 if (!c._colHex && ("h123456πρσ".includes(c.t) || (c.t === "v" && !vDrained)) && P[act].hp > 0) {
 let hv = Math.round(val(c, P[act].hp) * mimicMult);
 if (c.t === "6" && P[act].hp < 30) hv += Math.round(7 * mimicMult);
 if (wk) hv = Math.round(hv * .7);
 if (half && c.t === "v") hv = Math.round(hv / 2);
 hv = applyDisorientHeal(act, applyRelicHealBonus(act, healAmt(hv, c), act === steps[1].act));
 P[act].hp = Math.min(P[act].maxHp || 100, P[act].hp + hv);
 pop(act, "+" + hv, "#4ade80");
 burst(act, "#4ade80");
 snd("heal");
 ev.push(`${P[act].name} +${hv} HP`);
 }

 thaw(act);
 upd();
 await sl(650);
 }

 (ev.length ? ev : ["Спокійний обмін ходами"]).forEach(pushLog);
 await sl(750);
}

function setTourSpectating(active) {
  tourSpectating = !!active;
  const skipBtn = $("btn-tour-skip");
  if (skipBtn) {
    skipBtn.style.display = (tourSpectating && !!TOUR) ? "inline-flex" : "none";
  }
}

function clearTartarusFx() {
  tartarusTimers.forEach(id => clearTimeout(id));
  tartarusTimers = [];
  document.body.classList.remove("fx-tartarus-collapse");
  document.querySelectorAll(".tartarus-debris-layer").forEach(el => el.remove());
  document.querySelectorAll(".pl-molten-cracks").forEach(el => el.remove());
  document.querySelectorAll(".pl.pl-tartarus-victim, .pl.pl-tartarus-sink").forEach(el => {
    el.classList.remove("pl-tartarus-victim", "pl-tartarus-sink");
  });
  const ashField = $("lose-ash-field");
  if (ashField) ashField.innerHTML = "";
}

function hideEndOverlays() {
  if (endFxTimer) { clearTimeout(endFxTimer); endFxTimer = null; }
  clearTartarusFx();
  const winOv = $("win-ov");
  const loseOv = $("lose-ov");
  if (winOv) winOv.classList.remove("show");
  if (loseOv) loseOv.classList.remove("show", "interactive");
  const actBox = $("lose-actions");
  if (actBox) actBox.style.display = "none";
  document.body.classList.remove("fx-victory-slowmo");
  const tbl = $("tbl"), ringEl = $("ring"), stage = $("stage");
  if (tbl) tbl.classList.remove("fx-table-triumph");
  if (ringEl) ringEl.classList.remove("fx-table-triumph");
  if (stage) stage.classList.remove("fx-defeat-shake");
}

function getSeatScreenPoint(idx) {
  if (idx >= 0 && typeof seatC === "function" && $("p" + idx)) {
    const pt = seatC(idx);
    if (pt && Number.isFinite(pt.x) && Number.isFinite(pt.y)) return pt;
  }
  const el = idx >= 0 ? $("p" + idx) : null;
  if (el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
}

function populateLoseAshField() {
  const field = $("lose-ash-field");
  if (!field) return;
  field.innerHTML = "";
  const count = (typeof SETTINGS !== "undefined" && SETTINGS.particles === false) ? 10 : 28;
  for (let i = 0; i < count; i++) {
    const f = document.createElement("span");
    const isEmber = i % 3 === 0;
    f.className = isEmber ? "ash-flake ember" : "ash-flake";
    f.style.setProperty("--ax", (Math.random() * 100).toFixed(1) + "%");
    f.style.setProperty("--as", (isEmber ? (3 + Math.random() * 4) : (4 + Math.random() * 6)).toFixed(1) + "px");
    f.style.setProperty("--drift", ((Math.random() - 0.5) * 90).toFixed(1) + "px");
    f.style.setProperty("--dur", (3.2 + Math.random() * 3.4).toFixed(2) + "s");
    f.style.setProperty("--del", (Math.random() * 2.2).toFixed(2) + "s");
    f.style.setProperty("--op", (isEmber ? (0.72 + Math.random() * 0.28) : (0.38 + Math.random() * 0.35)).toFixed(2));
    field.appendChild(f);
  }
}

function spawnTartarusDebris(pt) {
  const layer = document.createElement("div");
  layer.className = "tartarus-debris-layer";
  layer.style.setProperty("--dx0", pt.x + "px");
  layer.style.setProperty("--dy0", pt.y + "px");

  const polys = [
    "polygon(12% 4%, 92% 14%, 80% 94%, 6% 78%)",
    "polygon(22% 0%, 100% 28%, 74% 100%, 0% 66%)",
    "polygon(4% 18%, 84% 4%, 96% 86%, 20% 96%)",
    "polygon(18% 8%, 94% 22%, 68% 96%, 4% 72%)"
  ];

  // 1) Темні уламки плашки, що розсипаються й важко падають униз
  for (let i = 0; i < 16; i++) {
    const sh = document.createElement("span");
    sh.className = "t-shard";
    sh.style.setProperty("--sw", (10 + Math.random() * 14).toFixed(1) + "px");
    sh.style.setProperty("--sh", (9 + Math.random() * 13).toFixed(1) + "px");
    sh.style.setProperty("--poly", polys[i % polys.length]);
    sh.style.setProperty("--ox", ((Math.random() - 0.5) * 76).toFixed(1) + "px");
    sh.style.setProperty("--oy", ((Math.random() - 0.5) * 68).toFixed(1) + "px");
    sh.style.setProperty("--vx", ((Math.random() - 0.5) * 120).toFixed(1) + "px");
    sh.style.setProperty("--vy", (95 + Math.random() * 125).toFixed(1) + "px");
    sh.style.setProperty("--rot", (((Math.random() > 0.5 ? 1 : -1) * (80 + Math.random() * 160))).toFixed(0) + "deg");
    sh.style.setProperty("--dur", (0.85 + Math.random() * 0.55).toFixed(2) + "s");
    sh.style.setProperty("--del", Math.floor(Math.random() * 140) + "ms");
    layer.appendChild(sh);
  }

  // 2) Попіл та тліючі іскри, що повільно підіймаються вгору з місця краху
  const ashCount = (typeof SETTINGS !== "undefined" && SETTINGS.particles === false) ? 12 : 26;
  for (let i = 0; i < ashCount; i++) {
    const ash = document.createElement("span");
    const isEmber = i % 2 === 0;
    ash.className = isEmber ? "t-ash ember" : "t-ash";
    ash.style.setProperty("--as", (isEmber ? (3.5 + Math.random() * 4) : (4.5 + Math.random() * 6)).toFixed(1) + "px");
    ash.style.setProperty("--ox", ((Math.random() - 0.5) * 86).toFixed(1) + "px");
    ash.style.setProperty("--oy", ((Math.random() - 0.5) * 62).toFixed(1) + "px");
    ash.style.setProperty("--drift", ((Math.random() - 0.5) * 84).toFixed(1) + "px");
    ash.style.setProperty("--rise", (130 + Math.random() * 185).toFixed(1) + "px");
    ash.style.setProperty("--dur", (1.9 + Math.random() * 1.6).toFixed(2) + "s");
    ash.style.setProperty("--del", Math.floor(Math.random() * 420) + "ms");
    ash.style.setProperty("--op", (isEmber ? (0.78 + Math.random() * 0.22) : (0.45 + Math.random() * 0.35)).toFixed(2));
    layer.appendChild(ash);
  }

  document.body.appendChild(layer);
  const rmId = setTimeout(() => layer.remove(), 3900);
  tartarusTimers.push(rmId);
}

function triggerTartarusDefeat(targetIdx) {
  clearTartarusFx();
  const pt = getSeatScreenPoint(targetIdx);
  const loseOv = $("lose-ov");
  if (loseOv) {
    loseOv.style.setProperty("--hit-x", pt.x + "px");
    loseOv.style.setProperty("--hit-y", pt.y + "px");
  }

  // 1. Стіл втрачає барви — перехід у холодний монохром/попіл
  document.body.classList.add("fx-tartarus-collapse");

  // 2. Розпечені тріщини по медальйону гравця
  const seatEl = targetIdx >= 0 ? $("p" + targetIdx) : null;
  if (seatEl) {
    seatEl.classList.add("pl-tartarus-victim");
    const svgNS = "http://www.w3.org/2000/svg";
    const crackSvg = document.createElementNS(svgNS, "svg");
    crackSvg.setAttribute("class", "pl-molten-cracks");
    crackSvg.setAttribute("viewBox", "0 0 120 140");
    crackSvg.setAttribute("preserveAspectRatio", "none");
    crackSvg.innerHTML =
      '<g fill="none" stroke-linecap="round" stroke-linejoin="round">' +
        '<path class="mc-glow" d="M60 66 L36 32 L14 8 M60 66 L88 28 L112 10 M60 66 L98 78 L118 98 M60 66 L74 112 L94 138 M60 66 L32 98 L8 128 M60 66 L16 62 L2 52"/>' +
        '<path class="mc-core" d="M60 66 L36 32 L14 8 M60 66 L88 28 L112 10 M60 66 L98 78 L118 98 M60 66 L74 112 L94 138 M60 66 L32 98 L8 128 M60 66 L16 62 L2 52"/>' +
      '</g>';
    seatEl.appendChild(crackSvg);
  }

  const canShake = typeof SETTINGS === "undefined" || SETTINGS.shake !== false;
  if (canShake && typeof shake === "function" && seatEl) {
    shake(seatEl);
  }
  const stage = $("stage");
  if (canShake && stage) {
    stage.classList.remove("fx-defeat-shake");
    void stage.offsetWidth;
    stage.classList.add("fx-defeat-shake");
    tartarusTimers.push(setTimeout(() => stage.classList.remove("fx-defeat-shake"), 440));
  }

  // 3. Плашка важко осідає й розсипається на темні уламки та тліючий попіл
  tartarusTimers.push(setTimeout(() => {
    if (seatEl) seatEl.classList.add("pl-tartarus-sink");
    spawnTartarusDebris(pt);
  }, 220));
}

function exitTourRoundEarly() {
  if (!TOUR) return;
  gameId++;
  isPaused = false;
  clearTurnTimer();
  setTourSpectating(false);
  hideEndOverlays();
  document.body.classList.remove("cine");
  CU = { a: -1, d: -1 };
  const handEl = $("hand");
  if (handEl) handEl.classList.add("off");
  const bannerEl = $("banner");
  if (bannerEl) bannerEl.innerHTML = "";

  const liveBots = alive().filter(i => (P[i].tourIdx ?? i) !== 0);
  const fallbackBots = P.map((_, i) => i).filter(i => (P[i].tourIdx ?? i) !== 0);
  const pool = liveBots.length ? liveBots : fallbackBots;

  let chosenIdx = pool[0];
  if (pool.length > 1) {
    const totalW = pool.reduce((s, i) => s + Math.max(10, P[i].hp || 10), 0);
    let roll = Math.random() * totalW;
    for (const i of pool) {
      roll -= Math.max(10, P[i].hp || 10);
      if (roll <= 0) { chosenIdx = i; break; }
    }
  }
  if (chosenIdx != null && P[chosenIdx]) {
    const tWinner = P[chosenIdx].tourIdx ?? chosenIdx;
    TOUR.wins[tWinner] = (TOUR.wins[tWinner] || 0) + 1;
  }

  PROFILE.games++;
  PROFILE.streak = 0;
  saveProfile();

  const W = TOUR.wins;
  const champ = W.findIndex(x => x >= TOUR.target);
  if (champ >= 0) {
    snd("swap");
    return tourScreen();
  }

  const oneWinPlayers = W.map((wins, idx) => wins === 1 ? idx : -1).filter(idx => idx >= 0);
  if (oneWinPlayers.length === 2 && !oneWinPlayers.includes(0)) {
    TOUR.finalists = oneWinPlayers;
    const simFinalChamp = oneWinPlayers[rnd(oneWinPlayers.length)];
    TOUR.wins[simFinalChamp] = (TOUR.wins[simFinalChamp] || 0) + 1;
    snd("swap");
    return tourScreen();
  }

  snd("swap");
  return tourScreen();
}

function showTourDefeatChoice(myIdx, myGame) {
  return new Promise(resolve => {
    const loseOv = $("lose-ov");
    const subEl = $("lose-sub");
    const pillEl = $("lose-trophy-pill");
    const actBox = $("lose-actions");
    const watchBtn = $("btn-lose-watch");
    const exitBtn = $("btn-lose-exit");

    if (!loseOv || !actBox || !watchBtn || !exitBtn) {
      resolve("watch");
      return;
    }

    if (endFxTimer) { clearTimeout(endFxTimer); endFxTimer = null; }
    if (pillEl) { pillEl.innerHTML = ""; pillEl.classList.remove("show"); }
    const _tartarusLines = ["Твій вогонь згас у безодні Тартару", "Хроніки не збережуть це ім'я", "Арена поглинула чергового дуелянта", "Твій клинок зламано в цьому раунді"];
    if (subEl) subEl.textContent = _tartarusLines[Math.floor(Math.random() * _tartarusLines.length)];
    actBox.style.display = "flex";

    triggerTartarusDefeat(myIdx);
    populateLoseAshField();
    snd("tartarus");

    loseOv.classList.remove("show", "interactive");
    endFxTimer = setTimeout(() => {
      if (myGame !== gameId) return;
      void loseOv.offsetWidth;
      loseOv.classList.add("show", "interactive");
    }, 240);

    const cleanup = () => {
      watchBtn.onclick = null;
      exitBtn.onclick = null;
      hideEndOverlays();
    };

    watchBtn.onclick = () => {
      if (myGame !== gameId) return resolve("aborted");
      snd("swap");
      cleanup();
      setTourSpectating(true);
      isPaused = false;
      resolve("watch");
    };

    exitBtn.onclick = () => {
      if (myGame !== gameId) return resolve("aborted");
      cleanup();
      exitTourRoundEarly();
      resolve("exit");
    };
  });
}

async function checkTourPlayerEliminated(myGame) {
  if (!TOUR || tourElimPromptShown || myGame !== gameId) return false;
  const myIdx = P.findIndex((p, i) => (p.tourIdx ?? i) === 0);
  if (myIdx < 0) return false;
  const me = P[myIdx];
  if (!me || (me.alive && me.hp > 0)) return false;
  if (alive().length <= 1) return false;

  tourElimPromptShown = true;
  isPaused = true;
  const handEl = $("hand");
  if (handEl) handEl.classList.add("off");
  const choice = await showTourDefeatChoice(myIdx, myGame);
  return choice === "exit" || choice === "aborted" || myGame !== gameId;
}

async function run(myGame) {
 let lastA = -1, ROUND_NUM = 1;
 while (myGame === gameId) {
 while (isPaused) await sl(200);
 while (!P[ptr].alive) ptr = (ptr + 1) % n;
 const a = ptr;
 if (a <= lastA) {
 lastA = -1;
 await tickFx();
 P.forEach(p => {
  p.attackedThisRound = false;
  p.roundHealAmt = 0;
  p.healedCardThisRound = false;
  if (p.fortuneKeep > 0) { p.fortuneKeep--; }
  else if (p.fortuneBonus > 0) { p.fortuneBonus = 0; }
 });
 if (myGame !== gameId) return;
 if (alive().length <= 1) return end();
 if (await checkTourPlayerEliminated(myGame)) return;
 if (CUR_ARENA && CUR_ARENA.id === "eclipse") {
  ECLIPSE_ROUND++;
  const phaseIdx = Math.floor((ECLIPSE_ROUND - 1) / 2) % 2;
  const roundInPhase = ((ECLIPSE_ROUND - 1) % 2) + 1;
  const nextPhase = phaseIdx === 0 ? "day" : "night";
  const changed = nextPhase !== ECLIPSE_PHASE;
  setEclipsePhase(nextPhase, roundInPhase);
  if (changed) {
   snd(nextPhase === "day" ? "heal" : "thunder");
   pushLog(nextPhase === "day"
    ? "Світанок у Храмі Світил: лікування +25%, шкода −25%."
    : "Опустилася Ніч у Храмі Світил: шкода +25%, лікування −25%.");
  }
 }
 if (CUR_ARENA && CUR_ARENA.id === "astral") {
  setAstralRarity((ASTRAL_RARITY + 1) % 5, true);
 }
 ROUND_NUM++;
 if (ROUND_NUM % 3 === 0) {
  P.forEach((p, idx) => {
   if (p.alive && hasRelic(idx, "breath_boreas")) {
    const foes = P.map((_, fi) => fi).filter(fi => fi !== idx && P[fi].alive);
    if (foes.length) {
     const target = foes[rnd(foes.length)];
     P[target].frost = 1;
     pop(target, "ПОДИХ БОРЕЯ!", "#7dd3fc");
     pushLog(`${p.name}: Подих Борея заморожує ${P[target].name}!`);
     upd();
    }
   }
  });
 }
 continue;
 }
 lastA = a;
 const d = tgt(a);

 for (let idx = 0; idx < P.length; idx++) {
 const p = P[idx];
 if (p.alive && p.hand.length === 0) {
  p.refillCount = (p.refillCount || 0) + 1;
  if (window.NET && NET.active && window.DCARD_NET) {
   const rKey = `r${p.refillCount}_s${p.netSeat ?? idx}`;
   p.hand = await DCARD_NET.syncRefillHand(rKey, () => dealPool(idx, CUR_ARENA), myGame);
   if (myGame !== gameId) return;
  } else if (CUR_ARENA && CUR_ARENA.id === "mirror") {
   if (!CUR_ARENA._mirrorDecks) CUR_ARENA._mirrorDecks = {};
   if (!CUR_ARENA._mirrorDecks[p.refillCount]) {
    CUR_ARENA._mirrorDecks[p.refillCount] = dealPool(0, CUR_ARENA);
   }
   p.hand = JSON.parse(JSON.stringify(CUR_ARENA._mirrorDecks[p.refillCount]));
  } else if (CAMPAIGN && CAMPAIGN.chapter === 1 && (P[idx].tourIdx ?? idx) === 1) {
   const cNode = CAMPAIGN_CHAPTER_1.find(x => x.lvl === CAMPAIGN.lvl);
   p.hand = cNode ? JSON.parse(JSON.stringify(cNode.deck)) : dealPool(idx, CUR_ARENA);
  } else if (CAMPAIGN && CAMPAIGN.chapter === 1 && (P[idx].tourIdx ?? idx) === 0) {
   p.hand = buildCampaignPlayerDeck(CAMPAIGN.lvl);
  } else {
   p.hand = dealPool(idx, CUR_ARENA);
  }
  if ((P[idx].tourIdx ?? idx) === 0) renderHand();
  pop(idx, `+${p.hand.length} КАРТ`, "#e0b86a");
 }
 }

 const tarActive = P[a].slow > 0;
 CU = { a, d, tar: tarActive };
 upd();
 $("table").querySelectorAll(".tc").forEach(x => x.remove());
 T = {};
 const aIsMe = (P[a].tourIdx ?? a) === 0, dIsMe = (P[d].tourIdx ?? d) === 0;
 if (tarActive) {
 pop(a, "СМОЛА: ЗАХИСТ!", "#c084fc");
 snd("poison");
 $("banner").innerHTML = aIsMe
 ? `<span class="pill def" style="border-color:#c084fc;box-shadow:0 0 18px #a855f788">${UI_IC.hourglass} СМОЛА АЇДА: Ти втратив атаку і ЗАХИЩАЄШСЯ від <b>${P[d].name}</b>!</span>`
 : dIsMe
 ? `<span class="pill att" style="border-color:#c084fc;box-shadow:0 0 18px #a855f788">${UI_IC.hourglass} ${P[a].name} у смолі — ТИ АТАКУЄШ ЙОГО ПЕРШИМ!</span>`
 : `<span class="pill" style="border-color:#c084fc;color:#e9d5ff">${UI_IC.hourglass} ${P[a].name} у смолі ← атакує <b>${P[d].name}</b></span>`;
 } else {
 $("banner").innerHTML = aIsMe ? `<span class="pill att">ТИ АТАКУЄШ → <b>${P[d].name}</b></span>` : dIsMe ? `<span class="pill def">ТИ ЗАХИЩАЄШСЯ від <b>${P[a].name}</b></span>` : `<span class="pill">${P[a].name} vs ${P[d].name}</span>`;
 }

 const pl = {};
 let seen = "";
 const duelOrder = tarActive ? [d, a] : [a, d];
 for (const [k, p] of duelOrder.entries()) {
 while (isPaused) await sl(200);
 if (myGame !== gameId) return;
 focus(p);
 await sl(650);
 let i, c;
 if (window.NET && NET.active && window.DCARD_NET) {
   const turnKey = `t${turn}_k${k}`;
   const cSeat = P[p].netSeat ?? p;
   if (p === 0) {
     i = await pick(0, seen);
     if (myGame !== gameId) return;
     c = P[0].hand.splice(i, 1)[0];
     await DCARD_NET.publishMove(turnKey, cSeat, i, c);
   } else if (P[p].isBot && NET.isHost) {
     await sl(520);
     if (myGame !== gameId) return;
     i = bot(p, seen);
     c = P[p].hand.splice(i, 1)[0];
     await DCARD_NET.publishMove(turnKey, cSeat, i, c);
   } else {
     pushLog(`Очікуємо хід ${P[p].name}...`);
     const mv = await DCARD_NET.awaitMove(turnKey, cSeat, myGame, () => {
       const bi = bot(p, seen);
       return { cardIdx: bi, card: P[p].hand[bi] };
     });
     if (myGame !== gameId) return;
     if (mv && mv.card) {
       const safeIdx = Math.max(0, Math.min(P[p].hand.length - 1, mv.cardIdx));
       P[p].hand.splice(safeIdx, 1);
       c = Object.assign({}, mv.card);
     } else {
       i = bot(p, seen);
       c = P[p].hand.splice(i, 1)[0];
     }
   }
 } else {
   i = await pick(p, seen);
   while (isPaused) await sl(200);
   if (myGame !== gameId) return;
   c = P[p].hand.splice(i, 1)[0];
 }
 if (isSp(c.t) && hasRelic(p, "echo_altar") && !P[p].echoUsed) {
   P[p].echoUsed = true;
   P[p].hand.push(Object.assign({}, c));
   pop(p, "ЕХО ВІВТАРЯ!", "#fde047");
   pushLog(`${P[p].name}: Ехо Вівтаря повертає «${cardName(c)}» у руку!`);
 }
 if ((P[p].tourIdx ?? p) === 0) trackCardPlayed(c);
 if (isColosseumHex(c, P[p].hp)) {
 c._colHex = true;
 c._colHexDmg = colosseumHexDmg(c, P[p].hp);
 }
 pl[p] = c;
 if ((P[p].tourIdx ?? p) === 0) renderHand();
 throwCard(p, c, k, (P[p].tourIdx ?? p) !== 0);
 seen = (CUR_ARENA && CUR_ARENA.blindCards) ? "q" : ((c._colHex || "dpkboavqyjlDACSPWGLEIJMOQRUVXYZ790αβγδεζηθικλμνξω".includes(c.t)) ? "d" : "hgrtnHFBKT1234568πρστυφχψΓΔΦΩ".includes(c.t) ? "h" : "x");
 upd();
 await sl(750);
 }

 for (const p of duelOrder) {
 if ((P[p].tourIdx ?? p) !== 0) await reveal(p, pl[p]);
 }
 await sl(380);
 document.body.classList.add("cine");
 await fight(a, d, pl);
 document.body.classList.remove("cine");
 if (myGame !== gameId) return;

 P.forEach((p, idx) => {
 p.tookPrevDmg = !!p.tookNextDmg;
 p.tookNextDmg = false;
 if (p.tookPrevDmg) SESSION_PREV_DMG[idx] = true;
 });
 if (alive().length <= 1) return end();
 if (await checkTourPlayerEliminated(myGame)) return;
 ptr = (a + 1) % n;
 turn++;
 await sl(450);
 }
}

function endFx(win, who, done, trophyRes = null) {
 hideEndOverlays();
 const ov = $(win ? "win-ov" : "lose-ov");
 const pillEl = $(win ? "win-trophy-pill" : "lose-trophy-pill");
 if (pillEl) {
   pillEl.innerHTML = trophyRes ? buildTrophyDeltaHtml(trophyRes) : "";
   pillEl.classList.toggle("show", !!trophyRes);
 }
 if (win) {
   const subEl = $("win-sub");
   if (subEl) subEl.textContent = who || "Арена підкорена";
   document.body.classList.add("fx-victory-slowmo");
   const tbl = $("tbl"), ringEl = $("ring");
   if (tbl) tbl.classList.add("fx-table-triumph");
   if (ringEl) ringEl.classList.add("fx-table-triumph");

   endFxTimer = setTimeout(() => {
     document.body.classList.remove("fx-victory-slowmo");
     ov.classList.remove("show");
     void ov.offsetWidth;
     ov.classList.add("show");
     endFxTimer = setTimeout(() => {
       hideEndOverlays();
       done();
     }, 2250);
   }, 300);
 } else {
   const myIdx = P.findIndex((p, i) => (p.tourIdx ?? i) === 0);
   const subEl = $("lose-sub");
   if (subEl) subEl.textContent = who || "Тебе перемогли";
   const actBox = $("lose-actions");
   if (actBox) actBox.style.display = "none";

   triggerTartarusDefeat(myIdx >= 0 ? myIdx : 0);
   populateLoseAshField();
   ov.classList.remove("show", "interactive");
   endFxTimer = setTimeout(() => {
     void ov.offsetWidth;
     ov.classList.add("show");
     endFxTimer = setTimeout(() => {
       hideEndOverlays();
       done();
     }, 2550);
   }, 240);
 }
}

function end() {
 CU = { a: -1, d: -1 };
 setTourSpectating(false);
 upd();
 const gid = gameId;
 const a = alive().sort((x, y) => P[y].hp - P[x].hp);
 const myNick = (PROFILE.name && PROFILE.name.trim()) ? PROFILE.name.trim() : "ТИ";
 let t = "", w = 0;
 let newlyUnlockedCampaignReward = null;
 const iAmInMatch = P.some(p => (p.tourIdx ?? 0) === 0);
 const topTourIdx = a.length ? (P[a[0]].tourIdx ?? a[0]) : -1;

 if (!a.length) {
   t = "Нічия!";
   if (iAmInMatch) { PROFILE.games++; PROFILE.streak = 0; saveProfile(); }
 } else if (topTourIdx === 0) {
   t = `${myNick} ПЕРЕМІГ!`;
   w = 1;
   if (iAmInMatch) { PROFILE.games++; PROFILE.wins++; PROFILE.streak++; }
   let wonCampaignLvl = null;
   if (CAMPAIGN && CAMPAIGN.chapter === 1) {
     const cNode = CAMPAIGN_CHAPTER_1.find(x => x.lvl === CAMPAIGN.lvl);
     if (cNode) {
       wonCampaignLvl = cNode.lvl;
       const myFinalHp = P[0] ? P[0].hp : 100;
       const earnedStars = myFinalHp >= 65 ? 3 : myFinalHp >= 30 ? 2 : 1;
       PROFILE.campaignStars[cNode.lvl] = Math.max(PROFILE.campaignStars[cNode.lvl] || 0, earnedStars);
       if (!PROFILE.campaignCleared.includes(cNode.lvl)) PROFILE.campaignCleared.push(cNode.lvl);
       if (!PROFILE.campaignRewards.includes(cNode.rewardId)) {
         PROFILE.campaignRewards.push(cNode.rewardId);
         const cleanLabel = cNode.rewardLabel
           .replace(/^[^:]+:\s*/, "")
           .replace(/[«»]/g, "")
           .trim();
         const catLabel = cNode.rewardType === "avatar" ? "Аватар"
           : cNode.rewardType === "banner" ? "Щит-Штандарт"
           : cNode.rewardType === "cardBack" ? "Сорочка карт"
           : "Титул";
         newlyUnlockedCampaignReward = {
           type: cNode.rewardType,
           itemId: cNode.rewardId,
           label: cleanLabel,
           cat: catLabel,
           nodeTitle: cNode.title,
           earnedStars
         };
       }
       if (!cNode.isSide) {
         PROFILE.campaignMaxLvl = Math.min(10, Math.max(PROFILE.campaignMaxLvl || 1, cNode.lvl + 1));
         window._selCampaignLvl = PROFILE.campaignMaxLvl;
       }
       t = `${UI_IC.trophy} ${cNode.title} (${earnedStars} ${UI_IC.star})! Отримано: ${cNode.rewardLabel}`;
     }
   }
   if (iAmInMatch) saveProfile();
 } else {
   t = `Переміг ${P[a[0]].name}`;
   if (iAmInMatch) { PROFILE.games++; PROFILE.streak = 0; saveProfile(); }
 }

 const winner = a.length === 1 ? a[0] : -1;
 if (TOUR && winner >= 0) {
   const tWinner = P[winner].tourIdx ?? winner;
   TOUR.wins[tWinner]++;
 }

 // Нарахування та списання кубків для Швидкої дуелі / Трикутника / Кола
 let trophyRes = null;
 if (!TOUR && !CAMPAIGN && iAmInMatch) {
   let myPlace = P.length;
   if (topTourIdx === 0) {
     myPlace = 1;
   } else {
     const myElimPos = MATCH_ELIM_ORDER.indexOf(0);
     if (myElimPos >= 0) {
       myPlace = Math.max(2, P.length - myElimPos);
     } else {
       const ranked = P.map((pl, idx) => ({ id: pl.tourIdx ?? idx, hp: pl.hp })).sort((x, y) => y.hp - x.hp);
       myPlace = Math.max(1, ranked.findIndex(x => x.id === 0) + 1);
     }
   }
   trophyRes = applyTrophyResult("quick", {
     playersCount: P.length,
     place: myPlace,
     wonMatch: w === 1
   });
 }
 const _wasOnlineMatch = !!(window.NET && NET.active);
 if (window.DCARD_CLOUD && iAmInMatch && !TOUR) {
   const foes = P.filter((_, idx) => idx !== 0).map(pl => pl.name);
   DCARD_CLOUD.recordMatch({
     mode: _wasOnlineMatch ? "Онлайн-бій" : CAMPAIGN ? "Шлях Арен" : (P.length === 2 ? "Дуель 1×1" : P.length === 3 ? "Трикутник" : "Коло"),
     won: w === 1,
     delta: trophyRes ? trophyRes.delta : 0,
     arena: CUR_ARENA ? CUR_ARENA.name : "Арена",
     foes
   });
 }
 if (_wasOnlineMatch && window.DCARD_NET) {
   DCARD_NET.finishOnlineMatch();
 }

 snd(w ? "win" : "tartarus");
 const menu = () => {
   if (gid !== gameId) return;
   if (TOUR) return tourScreen();
   const wasCampaign = !!CAMPAIGN;
   CAMPAIGN = null;
   $("ov").style.display = "flex";
   renderBentoHub(t);
   if (wasCampaign) {
     openCampaignMap(window._selCampaignLvl || PROFILE.campaignMaxLvl || 1);
     if (newlyUnlockedCampaignReward) {
       const rw = newlyUnlockedCampaignReward;
       setTimeout(() => {
         showRewardRevealModal(rw, {
           sourceLabel: `ШЛЯХ АРЕН · ${rw.nodeTitle} (${rw.earnedStars} ${UI_IC.star})`,
           subtitle: "Трофей за перемогу на арені додано до твоєї колекції!",
           onClose: () => renderCampaignMap()
         });
       }, 260);
     }
   }
 };
 if (!a.length) {
   if (trophyRes) endFx(false, "Нічия!", menu, trophyRes);
   else menu();
 } else {
   const winTitleSub = CAMPAIGN
     ? "Арена підкорена"
     : TOUR
       ? ((TOUR.finalists && TOUR.finalists.length === 2) ? "Чемпіон фіналу" : "Раунд підкорено")
       : (P.length === 2 ? "Чемпіон дуелі" : "Арена підкорена");
   endFx(!!w, topTourIdx === 0 ? winTitleSub : `Переміг ${P[a[0]].name}`, menu, trophyRes);
 }
}

function tourScreen() {
 const W = TOUR.wins;
 const champ = W.findIndex(x => x >= TOUR.target);
 const oneWinPlayers = W.map((wins, idx) => wins === 1 ? idx : -1).filter(idx => idx >= 0);
 if (champ < 0 && oneWinPlayers.length === 2) {
   TOUR.finalists = oneWinPlayers;
 }
 const myNick = (PROFILE.name && PROFILE.name.trim()) ? PROFILE.name.trim() : "ТИ";
 const names = TOUR.names || [myNick, "Тінь", "Кібер", "Лорд"];

 // Боти отримують по 1 випадковому Дару між раундами
 if (champ < 0 && TOUR.botGrantedRound !== TOUR.round) {
   TOUR.botGrantedRound = TOUR.round;
   for (let bi = 1; bi < TOUR.n; bi++) {
     const owned = TOUR.relics[bi] || [];
     const avail = ALTAR_RELICS.filter(r => !owned.includes(r.id));
     if (avail.length) owned.push(avail[rnd(avail.length)].id);
     TOUR.relics[bi] = owned;
   }
 }

 const ov = $("ov");
 const root = $("bento-root");
 ov.style.display = "flex";

 // Підсумкова статистика відображається ТІЛЬКИ в самому кінці турніру
 if (champ >= 0) {
   const isChamp = champ === 0;
   const isFinalist = !isChamp && ((TOUR.finalists && TOUR.finalists.includes(0)) || W[0] >= 1);
   const tourOutcome = isChamp ? "champion" : isFinalist ? "finalist" : "eliminated";
   const tourTrophyRes = applyTrophyResult("tournament", { tourOutcome, wonMatch: isChamp });
   if (window.DCARD_CLOUD) DCARD_CLOUD.recordMatch({ mode: "Турнір", won: isChamp, delta: tourTrophyRes ? tourTrophyRes.delta : 0, arena: "Турнір Олімпу", foes: names.slice(1) });
   const tourTrophyHtml = `<div class="tour-trophy-wrap">${buildTrophyDeltaHtml(tourTrophyRes)}</div>`;

   const rows = names.map((nm, i) => {
     const badge = champ === i ? " " + UI_IC.crown : "";
     const rBadges = (TOUR.relics?.[i] || []).map(id => {
       const r = RELIC_BY_ID[id];
       return r ? `<span class="relic-mini tier-${r.tier}" title="${r.name}: ${r.desc}">${r.icon}</span>` : "";
     }).join("");
     return `<tr${champ === i ? ' style="color:#fde047;font-weight:800"' : ""}><td>${nm}${badge} ${rBadges}</td><td>${W[i]} / ${TOUR.target}</td><td>${STAT[i].dmg}</td><td>${STAT[i].big}</td><td>${STAT[i].specs}</td></tr>`;
   }).join("");
   const table = `<table class="tour-tbl"><tr><th>Гравець</th><th>Перемоги</th><th>Шкода</th><th>Макс. удар</th><th>Спецкарт</th></tr>${rows}</table>`;
   const name = names[champ];
   const winHeadline = (champ === 0 && name.trim().toUpperCase() === "ТИ")
     ? "ТИ ПЕРЕМІГ У ТУРНІРІ!"
     : `${name} виграє турнір!`;
   TOUR = null;
   if (root) {
     root.innerHTML = `
       <div class="tour-hub tour-final-reveal">
         <h1 class="res">${UI_IC.trophy} ${winHeadline}</h1>
         ${tourTrophyHtml}
         ${table}
         <div class="tour-hub-actions">
           <button type="button" class="battle-start-btn tour-hub-btn" id="btn-tour-hub">${UI_IC.pillar} В Головне Меню</button>
         </div>
       </div>
     `;
     $("btn-tour-hub").onclick = () => {
       snd("swap");
       renderBentoHub(`${UI_IC.trophy} Чемпіон турніру: ${name}`);
     };
   }
   return;
 }

 const myOwned = TOUR.relics[0] || [];
 const isFreshOffer = !TOUR.offeredRelics;
 if (isFreshOffer) {
   TOUR.offeredRelics = rollThreeRelics(myOwned);
 }
 let selectedRelicId = TOUR.selectedRelicId || null;
 const isFinal = !!(TOUR.finalists && TOUR.finalists.length === 2);
 const nextRoundNum = TOUR.round + 1;

 const bindDraftEvents = (animateEntrance = false) => {
   const f1 = isFinal ? names[TOUR.finalists[0]] : "";
   const f2 = isFinal ? names[TOUR.finalists[1]] : "";

   // Поточний рахунок перемог без проміжної статистики шкоди/ударів
   const scorePills = names.map((nm, i) => {
     const isFin = isFinal && TOUR.finalists.includes(i);
     const rBadges = (TOUR.relics?.[i] || []).map(id => {
       const r = RELIC_BY_ID[id];
       return r ? `<span class="relic-mini tier-${r.tier}" title="${r.name}: ${r.desc}">${r.icon}</span>` : "";
     }).join("");
     return `<div class="tour-score-chip ${isFin ? "fin" : ""}">
       <span class="tsc-name">${nm}</span>
       <span class="tsc-wins">${W[i]}/${TOUR.target}</span>
       ${rBadges ? `<span class="tsc-relics">${rBadges}</span>` : ""}
     </div>`;
   }).join("");

   const cardsHtml = TOUR.offeredRelics.map((r, idx) => `
     <div class="relic-tablet tier-${r.tier} ${r.id === "blood_altar" ? "cursed-blood" : ""} ${selectedRelicId === r.id ? "picked" : ""} ${animateEntrance ? "altar-enter" : ""}"
          style="${animateEntrance ? `--stagger:${idx * 115}ms` : ""}"
          data-relic="${r.id}">
       <div class="rt-sheen"></div>
       <div class="rt-tier">${r.tierName}</div>
       <div class="rt-ico">${r.icon}</div>
       <div class="rt-name">${r.name}</div>
       <div class="rt-desc">${r.desc}</div>
     </div>
   `).join("");

   root.innerHTML = `
     <div class="tour-hub">
       <div class="tour-stage-header">
         <div class="tour-round-done">РАУНД ${TOUR.round} ЗАВЕРШЕНО</div>
         <h1 class="res tour-next-banner">
           ${isFinal ? `${UI_IC.swords} ФІНАЛЬНА ДУЕЛЬ 1 НА 1` : `НАСТУПНИЙ: РАУНД ${nextRoundNum}`}
         </h1>
         ${isFinal ? `<div class="tour-finalists-sub"><b>${f1}</b> проти <b>${f2}</b> · Вирішальний бій</div>` : ""}
       </div>

       <div class="tour-score-strip">${scorePills}</div>

       <div class="altar-draft-zone ${animateEntrance ? "altar-zone-reveal" : ""}">
         <div class="altar-draft-title">${UI_IC.diamond} ОБЕРИ 1 ДАР ВІВТАРЯ ДО КІНЦЯ ТУРНІРУ ${UI_IC.diamond}</div>
         <div class="relic-grid">${cardsHtml}</div>
         <div class="tour-hub-actions">
           ${TOUR.rerollsLeft > 0 ? `<button type="button" class="icon-btn reroll-btn" id="btn-reroll-relics">${UI_IC.dice} Оновити вибір (${TOUR.rerollsLeft})</button>` : ""}
           <button type="button" class="battle-start-btn" id="btn-next" ${!selectedRelicId ? "disabled style='opacity:.45;cursor:not-allowed'" : ""}>
             ${isFinal ? `${UI_IC.swords} Почати фінал` : `${UI_IC.play} В бій · Раунд ${nextRoundNum}`}
           </button>
         </div>
       </div>
     </div>
   `;

   if (animateEntrance) {
     snd("swap");
     setTimeout(() => { if (typeof bell === "function") bell(); }, 180);
   }

   root.querySelectorAll(".relic-tablet").forEach(el => {
     el.onclick = () => {
       selectedRelicId = el.getAttribute("data-relic");
       TOUR.selectedRelicId = selectedRelicId;
       snd("anvil");
       bindDraftEvents(false);
     };
   });

   const rerollBtn = $("btn-reroll-relics");
   if (rerollBtn) {
     rerollBtn.onclick = () => {
       if (TOUR.rerollsLeft <= 0) return;
       TOUR.rerollsLeft--;
       const prevIds = TOUR.offeredRelics.map(x => x.id);
       TOUR.offeredRelics = rollThreeRelics([...myOwned, ...prevIds]);
       selectedRelicId = null;
       TOUR.selectedRelicId = null;
       snd("throw");
       bindDraftEvents(true);
     };
   }

   $("btn-next").onclick = () => {
     if (!selectedRelicId) return;
     TOUR.relics[0].push(selectedRelicId);
     TOUR.offeredRelics = null;
     TOUR.selectedRelicId = null;
     TOUR.round++;
     start(isFinal ? 2 : TOUR.n);
   };
 };

 if (!root) return;

 // Етап 1: спочатку показуємо кінематографічний напис переходу раунду, а через 0.6 с — виїзд скрижалей
 if (isFreshOffer) {
   const f1 = isFinal ? names[TOUR.finalists[0]] : "";
   const f2 = isFinal ? names[TOUR.finalists[1]] : "";
   root.innerHTML = `
     <div class="tour-hub tour-intermission">
       <div class="tour-stage-header tour-hero-pop">
         <div class="tour-round-done">РАУНД ${TOUR.round} ЗАВЕРШЕНО</div>
         <h1 class="res tour-next-banner">
           ${isFinal ? `${UI_IC.swords} ФІНАЛЬНА ДУЕЛЬ 1 НА 1` : `НАСТУПНИЙ: РАУНД ${nextRoundNum}`}
         </h1>
         ${isFinal ? `<div class="tour-finalists-sub"><b>${f1}</b> проти <b>${f2}</b> · Вирішальний бій</div>` : ""}
       </div>
     </div>
   `;
   snd("thunder");
   setTimeout(() => {
     if (!TOUR) return;
     bindDraftEvents(true);
   }, 620);
 } else {
   bindDraftEvents(false);
 }
}


// ===== СИСТЕМА ЕМОЦІЙ ТА ФРАЗ (DCARD V72) =====
const EMOTES_DATA = [
  { id: "laugh", label: "Ха-ха!", sfx: "coins", svg: `<svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" fill="#facc15" stroke="#fef08a" stroke-width="1.6"/><path d="M10 14l3.5-2.2L15 14M26 14l-3.5-2.2L21 14" fill="none" stroke="#1e293b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 20c1.5 6 14.5 6 16 0z" fill="#7f1d1d" stroke="#1e293b" stroke-width="1.4"/><path d="M13 24c2-1.6 8-1.6 10 0" fill="#fb7185"/><circle cx="7.5" cy="18" r="2.2" fill="#38bdf8"/><circle cx="28.5" cy="18" r="2.2" fill="#38bdf8"/></svg>` },
  { id: "angry", label: "Злість", sfx: "thud", svg: `<svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" fill="#ef4444" stroke="#fca5a5" stroke-width="1.6"/><path d="M10 12l6 3M26 12l-6 3" stroke="#1e293b" stroke-width="2.4" stroke-linecap="round"/><circle cx="13" cy="17.5" r="2" fill="#1e293b"/><circle cx="23" cy="17.5" r="2" fill="#1e293b"/><path d="M12 25c2.5-3 9.5-3 12 0" fill="none" stroke="#1e293b" stroke-width="2.2" stroke-linecap="round"/></svg>` },
  { id: "cry", label: "Біль", sfx: "ice", svg: `<svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" fill="#38bdf8" stroke="#bae6fd" stroke-width="1.6"/><path d="M11 14c1.2-1 2.8-1 4 0M21 14c1.2-1 2.8-1 4 0" fill="none" stroke="#0f172a" stroke-width="2" stroke-linecap="round"/><path d="M11.5 16v9M24.5 16v9" stroke="#e0f2fe" stroke-width="3" stroke-linecap="round"/><path d="M13 25c2-2.5 8-2.5 10 0" fill="none" stroke="#0f172a" stroke-width="2.2" stroke-linecap="round"/></svg>` },
  { id: "thumb", label: "Гарна гра!", sfx: "heal", svg: `<svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" fill="#10b981" stroke="#a7f3d0" stroke-width="1.6"/><path d="M13 18v9H9v-9h4zm2 0l3.5-7.5c1-1.5 3-1 3 1V16h4.5c1.5 0 2.5 1.3 2.2 2.8l-1.2 6c-.3 1.3-1.4 2.2-2.7 2.2H15v-9z" fill="#fef08a" stroke="#064e3b" stroke-width="1.3" stroke-linejoin="round"/></svg>` },
  { id: "shock", label: "Ого!", sfx: "swap", svg: `<svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" fill="#f59e0b" stroke="#fde68a" stroke-width="1.6"/><circle cx="12.5" cy="15" r="3" fill="#fff" stroke="#1e293b" stroke-width="1.2"/><circle cx="12.5" cy="15" r="1.2" fill="#0f172a"/><circle cx="23.5" cy="15" r="3" fill="#fff" stroke="#1e293b" stroke-width="1.2"/><circle cx="23.5" cy="15" r="1.2" fill="#0f172a"/><ellipse cx="18" cy="24.5" rx="3.4" ry="4.4" fill="#1e293b"/></svg>` },
  { id: "skull", label: "GG", sfx: "shatter", svg: `<svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" fill="#334155" stroke="#cbd5e1" stroke-width="1.6"/><path d="M18 7a8.5 8.5 0 0 0-8.5 8.5c0 3 1.5 5.4 3.8 6.8V26h9.4v-3.7A8.5 8.5 0 0 0 26.5 15.5 8.5 8.5 0 0 0 18 7z" fill="#f8fafc"/><circle cx="14.5" cy="16" r="2.2" fill="#0f172a"/><circle cx="21.5" cy="16" r="2.2" fill="#0f172a"/><path d="M15.5 23v3M18 23v3M20.5 23v3" stroke="#0f172a" stroke-width="1.4"/></svg>` }
];

const EMOTE_PHRASES = ["Ха-ха!", "Гарна гра!", "Ой...", "Тобі кінець!", "Пощастило!", "Дякую!"];
let EMOTES_MUTED = false;
let _lastEmoteAt = 0;

function showEmoteBubble(pIdx, content, isSvg = false, sfxName = "swap") {
  if (EMOTES_MUTED && pIdx !== 0) return;
  const seat = $("p" + pIdx);
  if (!seat) return;
  seat.querySelectorAll(".emote-bubble").forEach(b => b.remove());
  const b = document.createElement("div");
  b.className = "emote-bubble" + (isSvg ? " is-svg" : "");
  if (isSvg) b.innerHTML = content;
  else b.textContent = content;
  seat.appendChild(b);
  if (sfxName) snd(sfxName);
  setTimeout(() => b.remove(), 2250);
}

function triggerBotEmoteReply() {
  if (EMOTES_MUTED || !P || P.length < 2) return;
  const liveBots = P.map((p, i) => (i > 0 && p.alive) ? i : -1).filter(i => i >= 0);
  if (!liveBots.length || Math.random() > 0.55) return;
  const botIdx = liveBots[rnd(liveBots.length)];
  setTimeout(() => {
    if (!P[botIdx] || !P[botIdx].alive) return;
    if (Math.random() < 0.65) {
      const em = EMOTES_DATA[rnd(EMOTES_DATA.length)];
      showEmoteBubble(botIdx, em.svg, true, em.sfx);
    } else {
      const ph = EMOTE_PHRASES[rnd(EMOTE_PHRASES.length)];
      showEmoteBubble(botIdx, ph, false, "throw");
    }
  }, 650 + rnd(600));
}

(function initEmoteUI() {
  const fab = $("emote-fab");
  const panel = $("emote-panel");
  const svgGrid = $("em-svg-grid");
  const phrGrid = $("em-phrases-grid");
  const muteBtn = $("em-mute-btn");
  if (!fab || !panel || !svgGrid || !phrGrid) return;

  svgGrid.innerHTML = EMOTES_DATA.map(em =>
    `<button type="button" class="em-btn" data-em-id="${em.id}" title="${em.label}">${em.svg}</button>`
  ).join("");

  phrGrid.innerHTML = EMOTE_PHRASES.map(ph =>
    `<button type="button" class="em-phrase-btn" data-em-ph="${ph}">${ph}</button>`
  ).join("");

  fab.onclick = (ev) => {
    ev.stopPropagation();
    const open = panel.classList.toggle("open");
    panel.setAttribute("aria-hidden", open ? "false" : "true");
    snd("throw");
  };

  if (muteBtn) {
    muteBtn.onclick = (ev) => {
      ev.stopPropagation();
      EMOTES_MUTED = !EMOTES_MUTED;
      muteBtn.classList.toggle("muted", EMOTES_MUTED);
      muteBtn.textContent = EMOTES_MUTED ? "Боти: ВИМК" : "Боти: ВКЛ";
      snd("throw");
    };
  }

  svgGrid.onclick = (ev) => {
    const btn = ev.target.closest("[data-em-id]");
    if (!btn) return;
    const now = Date.now();
    if (now - _lastEmoteAt < 1200) return;
    _lastEmoteAt = now;
    const em = EMOTES_DATA.find(x => x.id === btn.dataset.emId);
    if (!em) return;
    panel.classList.remove("open");
    showEmoteBubble(0, em.svg, true, em.sfx);
    triggerBotEmoteReply();
  };

  phrGrid.onclick = (ev) => {
    const btn = ev.target.closest("[data-em-ph]");
    if (!btn) return;
    const now = Date.now();
    if (now - _lastEmoteAt < 1200) return;
    _lastEmoteAt = now;
    panel.classList.remove("open");
    showEmoteBubble(0, btn.dataset.emPh, false, "swap");
    triggerBotEmoteReply();
  };

  document.addEventListener("click", (ev) => {
    if (panel.classList.contains("open") && !panel.contains(ev.target) && ev.target !== fab && !fab.contains(ev.target)) {
      panel.classList.remove("open");
      panel.setAttribute("aria-hidden", "true");
    }
  });

  // Автоматично показуємо кнопку емоцій під час бою і ховаємо в головному меню
  setInterval(() => {
    const inMenu = $("ov") && $("ov").style.display !== "none";
    const inGame = P && P.length > 0 && !inMenu;
    fab.classList.toggle("show", !!inGame);
    if (!inGame) panel.classList.remove("open");
  }, 300);
})();
