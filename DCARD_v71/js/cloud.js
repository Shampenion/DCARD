/* ==========================================================================
   DCARD V71 — CLOUD PROFILE, GOOGLE SIGN-IN, MATCH HISTORY & HALL OF FAME
   ========================================================================== */
(function () {
  "use strict";

  let _saveTimer = null;
  let _syncingFromCloud = false;
  let _lastCloudSyncAt = 0;

  function safeObj(v) {
    return (v && typeof v === "object" && !Array.isArray(v)) ? v : {};
  }

  function safeArr(v) {
    if (Array.isArray(v)) return v;
    if (v && typeof v === "object") return Object.values(v);
    return [];
  }

  function uniqArr(a, b) {
    return Array.from(new Set([...safeArr(a), ...safeArr(b)]));
  }

  function mergeProfiles(localP, cloudP) {
    if (!cloudP || typeof cloudP !== "object") return localP;
    const mergedStars = Object.assign({}, safeObj(localP.campaignStars));
    const cStars = safeObj(cloudP.campaignStars);
    Object.keys(cStars).forEach((k) => {
      mergedStars[k] = Math.max(Number(mergedStars[k]) || 0, Number(cStars[k]) || 0);
    });

    const mergedUsage = Object.assign({}, safeObj(localP.cardUsage));
    const cUsage = safeObj(cloudP.cardUsage);
    Object.keys(cUsage).forEach((k) => {
      mergedUsage[k] = Math.max(Number(mergedUsage[k]) || 0, Number(cUsage[k]) || 0);
    });

    const localHist = safeArr(localP.history);
    const cloudHist = safeArr(cloudP.history);
    const histMap = new Map();
    [...localHist, ...cloudHist].forEach((h) => {
      if (h && h.ts) histMap.set(String(h.ts) + "_" + (h.mode || ""), h);
    });
    const mergedHist = Array.from(histMap.values())
      .sort((a, b) => (b.ts || 0) - (a.ts || 0))
      .slice(0, 15);

    const cloudWins = Number(cloudP.wins) || 0;
    const localWins = Number(localP.wins) || 0;
    const cloudTr = Number(cloudP.trophies) || 0;
    const localTr = Number(localP.trophies) || 0;
    const preferCloudMeta = (Number(cloudP.updatedAt) || 0) > (Number(localP.updatedAt) || 0) || (localP.name === "ТИ" && cloudP.name && cloudP.name !== "ТИ");

    return {
      name: preferCloudMeta ? String(cloudP.name || localP.name || "ТИ").slice(0, 14) : String(localP.name || "ТИ").slice(0, 14),
      crest: preferCloudMeta && Number.isInteger(cloudP.crest) ? cloudP.crest : (localP.crest || 0),
      banner: preferCloudMeta && Number.isInteger(cloudP.banner) ? cloudP.banner : (localP.banner || 0),
      cardBack: preferCloudMeta && typeof cloudP.cardBack === "string" ? cloudP.cardBack : (localP.cardBack || "classic"),
      activeTitle: preferCloudMeta && typeof cloudP.activeTitle === "string" ? cloudP.activeTitle : (localP.activeTitle || ""),
      wins: Math.max(localWins, cloudWins),
      games: Math.max(Number(localP.games) || 0, Number(cloudP.games) || 0),
      streak: (Number(cloudP.updatedAt) || 0) > (Number(localP.updatedAt) || 0) ? (Number(cloudP.streak) || 0) : (Number(localP.streak) || 0),
      bestHit: Math.max(Number(localP.bestHit) || 0, Number(cloudP.bestHit) || 0),
      cardUsage: mergedUsage,
      campaignMaxLvl: Math.max(Number(localP.campaignMaxLvl) || 1, Number(cloudP.campaignMaxLvl) || 1),
      campaignCleared: uniqArr(localP.campaignCleared, cloudP.campaignCleared),
      campaignStars: mergedStars,
      campaignRewards: uniqArr(localP.campaignRewards, cloudP.campaignRewards),
      trophies: Math.max(localTr, cloudTr),
      claimedRewards: uniqArr(localP.claimedRewards, cloudP.claimedRewards),
      history: mergedHist,
      updatedAt: Math.max(Number(localP.updatedAt) || 0, Number(cloudP.updatedAt) || 0, Date.now())
    };
  }

  function buildLeaderboardEntry() {
    if (typeof PROFILE === "undefined") return null;
    const autoRank = PROFILE.wins >= 15 ? "Чемпіон Олімпу" : PROFILE.wins >= 7 ? "Ветеран Арени" : PROFILE.wins >= 2 ? "Загартований Дуелянт" : "Шукач Слави";
    return {
      name: (PROFILE.name && PROFILE.name.trim()) ? PROFILE.name.trim().slice(0, 14) : "Дуелянт",
      crest: Number(PROFILE.crest) || 0,
      banner: Number(PROFILE.banner) || 0,
      trophies: Math.max(0, Number(PROFILE.trophies) || 0),
      wins: Math.max(0, Number(PROFILE.wins) || 0),
      games: Math.max(0, Number(PROFILE.games) || 0),
      streak: Math.max(0, Number(PROFILE.streak) || 0),
      title: PROFILE.activeTitle || autoRank,
      isGoogle: !!(window.DCARD_FB && DCARD_FB.isGoogle),
      updatedAt: Date.now()
    };
  }

  async function pullFromCloud() {
    if (!window.DCARD_FB || !DCARD_FB.ok || !DCARD_FB.uid || typeof PROFILE === "undefined") return;
    try {
      const snap = await DCARD_FB.db.ref(`users/${DCARD_FB.uid}/profile`).once("value");
      const cloudP = snap.val();
      if (cloudP) {
        _syncingFromCloud = true;
        const merged = mergeProfiles(PROFILE, cloudP);
        Object.assign(PROFILE, merged);
        try { localStorage.setItem(PROFILE_KEY, JSON.stringify(PROFILE)); } catch (_) {}
        _syncingFromCloud = false;
        _lastCloudSyncAt = Date.now();
        if (typeof renderBentoHub === "function" && $("ov") && $("ov").style.display !== "none" && !TOUR) {
          renderBentoHub();
        }
        if ($("profile-ov") && $("profile-ov").classList.contains("show") && typeof openProfileModal === "function") {
          openProfileModal();
        }
      }
      await pushToCloudNow();
    } catch (err) {
      console.warn("[DCARD_CLOUD] pull error:", err);
    }
  }

  async function pushToCloudNow() {
    if (_syncingFromCloud) return;
    if (!window.DCARD_FB || !DCARD_FB.ok || !DCARD_FB.uid || typeof PROFILE === "undefined") return;
    try {
      PROFILE.updatedAt = Date.now();
      const payload = JSON.parse(JSON.stringify(PROFILE));
      if (!Array.isArray(payload.history)) payload.history = [];
      payload.history = payload.history.slice(0, 15);
      await DCARD_FB.db.ref(`users/${DCARD_FB.uid}/profile`).set(payload);
      const lb = buildLeaderboardEntry();
      if (lb) {
        await DCARD_FB.db.ref(`leaderboard/${DCARD_FB.uid}`).set(lb);
      }
      _lastCloudSyncAt = Date.now();
    } catch (err) {
      console.warn("[DCARD_CLOUD] push error:", err);
    }
  }

  function scheduleSave() {
    if (_syncingFromCloud) return;
    clearTimeout(_saveTimer);
    _saveTimer = setTimeout(() => { pushToCloudNow(); }, 900);
  }

  function recordMatch(entry) {
    if (typeof PROFILE === "undefined") return;
    if (!Array.isArray(PROFILE.history)) PROFILE.history = [];
    const rec = {
      ts: Date.now(),
      mode: String(entry.mode || "Дуель"),
      won: !!entry.won,
      delta: Number(entry.delta) || 0,
      arena: String(entry.arena || "Арена"),
      foes: Array.isArray(entry.foes) ? entry.foes.slice(0, 3) : []
    };
    PROFILE.history.unshift(rec);
    if (PROFILE.history.length > 15) PROFILE.history = PROFILE.history.slice(0, 15);
    if (typeof saveProfile === "function") saveProfile();
  }

  async function signInWithGoogle() {
    if (!window.DCARD_FB || !DCARD_FB.ok || !DCARD_FB.auth) {
      alert("Немає з'єднання з сервером Firebase.");
      return;
    }
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      const cur = DCARD_FB.auth.currentUser;
      if (cur && cur.isAnonymous) {
        try {
          await cur.linkWithPopup(provider);
        } catch (linkErr) {
          if (linkErr && (linkErr.code === "auth/credential-already-in-use" || linkErr.code === "auth/email-already-in-use")) {
            await DCARD_FB.auth.signInWithPopup(provider);
          } else {
            throw linkErr;
          }
        }
      } else {
        await DCARD_FB.auth.signInWithPopup(provider);
      }
      if (typeof snd === "function") snd("swap");
      await pullFromCloud();
    } catch (err) {
      if (err && err.code === "auth/popup-closed-by-user") return;
      console.warn("[DCARD_CLOUD] Google sign-in error:", err);
      alert("Помилка входу через Google: " + (err && err.message ? err.message : "спробуй ще раз"));
    }
  }

  async function signOutGoogle() {
    if (!window.DCARD_FB || !DCARD_FB.auth) return;
    try {
      await DCARD_FB.auth.signOut();
      if (typeof snd === "function") snd("throw");
    } catch (err) {
      console.warn("[DCARD_CLOUD] Sign-out error:", err);
    }
  }

  function renderProfileCloudCardHtml() {
    const fb = window.DCARD_FB;
    const online = !!(fb && fb.ok && fb.uid);
    const isG = !!(fb && fb.isGoogle && fb.user);
    const email = isG && fb.user.email ? fb.user.email : "";
    const statusTxt = !online
      ? "Офлайн-режим (локальне збереження)"
      : isG
        ? `Синхронізовано з Google · ${email}`
        : "Гостьова хмарна сесія (прив'яжи Google для переносу на інші пристрої)";

    return `
      <div class="set-section cloud-prof-sec">
        <div class="set-sec-lbl">${UI_IC.cloud} ХМАРНЕ ЗБЕРЕЖЕННЯ ПРОГРЕСУ</div>
        <div class="cloud-auth-card ${isG ? "is-linked" : ""}">
          <div class="cloud-auth-info">
            <span class="cloud-dot ${online ? "on" : "off"}"></span>
            <div>
              <b>${isG ? "Акаунт Google підключено" : "Збереження прогресу"}</b>
              <span>${statusTxt}</span>
            </div>
          </div>
          <div class="cloud-auth-actions">
            ${isG
              ? `<button type="button" class="set-toggle-btn" id="btn-cloud-sync">${UI_IC.cloud} Оновити</button>
                 <button type="button" class="set-danger-btn" id="btn-cloud-signout">Вийти</button>`
              : `<button type="button" class="cloud-google-btn" id="btn-cloud-google">${UI_IC.google} Увійти через Google</button>`
            }
          </div>
        </div>
      </div>
    `;
  }

  function renderProfileHistoryHtml() {
    const hist = (typeof PROFILE !== "undefined" && Array.isArray(PROFILE.history)) ? PROFILE.history : [];
    const rows = hist.length
      ? hist.slice(0, 10).map((h) => {
          const d = new Date(h.ts || Date.now());
          const tm = `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
          const deltaTxt = h.delta > 0 ? `+${h.delta}` : h.delta < 0 ? `${h.delta}` : "";
          const foesTxt = (h.foes && h.foes.length) ? `vs ${h.foes.join(", ")}` : "";
          return `
            <div class="hist-row ${h.won ? "win" : "lose"}">
              <span class="hist-badge">${h.won ? UI_IC.trophy : UI_IC.skull}</span>
              <div class="hist-main">
                <b>${h.won ? "Перемога" : "Поразка"} · ${h.mode}</b>
                <span>${h.arena}${foesTxt ? " · " + foesTxt : ""}</span>
              </div>
              <div class="hist-right">
                ${deltaTxt ? `<b class="hist-delta ${h.delta > 0 ? "pos" : "neg"}">${deltaTxt} ${UI_IC.trophy}</b>` : ""}
                <small>${tm}</small>
              </div>
            </div>
          `;
        }).join("")
      : `<div class="hist-empty">Зіграй перший матч, щоб побачити історію боїв.</div>`;

    return `
      <div class="set-section">
        <div class="set-sec-lbl">${UI_IC.history} ОСТАННІ БОЇ</div>
        <div class="hist-list">${rows}</div>
      </div>
    `;
  }

  function bindProfileCloudEvents() {
    const gBtn = $("btn-cloud-google");
    if (gBtn) gBtn.onclick = () => signInWithGoogle();
    const outBtn = $("btn-cloud-signout");
    if (outBtn) outBtn.onclick = () => signOutGoogle();
    const syncBtn = $("btn-cloud-sync");
    if (syncBtn) syncBtn.onclick = async () => {
      syncBtn.disabled = true;
      await pullFromCloud();
      syncBtn.disabled = false;
      if (typeof snd === "function") snd("swap");
    };
  }

  // ===== ЗАЛА СЛАВИ (ГЛОБАЛЬНИЙ ТОП-50) =====
  async function openLeaderboardModal() {
    const ov = $("leaderboard-ov");
    if (!ov) return;
    if (typeof snd === "function") snd("throw");
    ov.setAttribute("aria-hidden", "false");
    ov.classList.add("show");
    ov.innerHTML = `
      <div class="set-modal lb-modal">
        <div class="set-head">
          <div class="set-title-wrap">
            <span class="set-ico-box">${UI_IC.trophy}</span>
            <div>
              <div class="set-title">ЗАЛА СЛАВИ</div>
              <div class="set-sub">Глобальний рейтинг дуелянтів DCARD (Топ-50)</div>
            </div>
          </div>
          <button type="button" class="set-close-x" id="lb-close" title="Закрити (Esc)">${UI_IC.close}</button>
        </div>
        <div class="set-body lb-body" id="lb-body">
          <div class="lb-loading">${UI_IC.sparkle} Завантаження рейтингу Олімпу...</div>
        </div>
      </div>
    `;
    ov.onclick = (ev) => { if (ev.target === ov) closeLeaderboardModal(); };
    if ($("lb-close")) $("lb-close").onclick = closeLeaderboardModal;

    await (window.DCARD_FB ? DCARD_FB.whenReady() : Promise.resolve());
    const body = $("lb-body");
    if (!body) return;

    if (!window.DCARD_FB || !DCARD_FB.ok || !DCARD_FB.db) {
      body.innerHTML = `<div class="lb-empty">Немає підключення до сервера. Перевір інтернет і спробуй ще раз.</div>`;
      return;
    }

    try {
      await pushToCloudNow();
      const snap = await DCARD_FB.db.ref("leaderboard").orderByChild("trophies").limitToLast(50).once("value");
      const raw = snap.val() || {};
      const list = Object.keys(raw).map((uid) => Object.assign({ uid }, raw[uid]));
      list.sort((a, b) => (b.trophies - a.trophies) || (b.wins - a.wins));

      if (!list.length) {
        body.innerHTML = `<div class="lb-empty">Зала Слави ще порожня — стань першим чемпіоном!</div>`;
        return;
      }

      const myUid = DCARD_FB.uid;
      body.innerHTML = `
        <div class="lb-list">
          ${list.map((p, idx) => {
            const rank = idx + 1;
            const isMe = p.uid === myUid;
            const av = (typeof AV_SVG !== "undefined" && AV_SVG[p.crest || 0]) ? AV_SVG[p.crest || 0] : "";
            const lg = typeof getLeagueForTrophies === "function" ? getLeagueForTrophies(p.trophies || 0) : null;
            const rankCls = rank === 1 ? "top1" : rank === 2 ? "top2" : rank === 3 ? "top3" : "";
            return `
              <div class="lb-row ${rankCls} ${isMe ? "is-me" : ""}">
                <div class="lb-rank">${rank <= 3 ? UI_IC.crown : ""}<span>#${rank}</span></div>
                <div class="lb-av">${av}</div>
                <div class="lb-info">
                  <b>${String(p.name || "Дуелянт").replace(/</g, "&lt;")}${isMe ? ' <em class="lb-you">ТИ</em>' : ""}</b>
                  <span>${lg ? lg.name : ""} · ${UI_IC.swords} ${p.wins || 0} перемог</span>
                </div>
                <div class="lb-tr">
                  <b>${p.trophies || 0} ${UI_IC.trophy}</b>
                  ${p.streak >= 2 ? `<small>${UI_IC.fire} ${p.streak}</small>` : ""}
                </div>
              </div>
            `;
          }).join("")}
        </div>
      `;
    } catch (err) {
      console.warn("[DCARD_CLOUD] Leaderboard load error:", err);
      body.innerHTML = `<div class="lb-empty">Не вдалося завантажити рейтинг: ${err && err.message ? err.message : "помилка доступу"}</div>`;
    }
  }

  function closeLeaderboardModal() {
    const ov = $("leaderboard-ov");
    if (!ov) return;
    ov.classList.remove("show");
    ov.setAttribute("aria-hidden", "true");
  }

  window.addEventListener("dcard:auth", () => {
    pullFromCloud();
  });

  window.DCARD_CLOUD = {
    scheduleSave,
    pushToCloudNow,
    pullFromCloud,
    recordMatch,
    signInWithGoogle,
    signOutGoogle,
    renderProfileCloudCardHtml,
    renderProfileHistoryHtml,
    bindProfileCloudEvents,
    openLeaderboardModal,
    closeLeaderboardModal
  };
})();
