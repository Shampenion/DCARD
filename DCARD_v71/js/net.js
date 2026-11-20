/* ==========================================================================
   DCARD V71 — SERVER BROWSER, WAITING LOBBY & MULTIPLAYER ENGINE (Firebase RTDB)
   Host-Authoritative синхронізація бою з ротацією столу під локального гравця.
   ========================================================================== */
(function () {
  "use strict";

  const MODE_META = {
    2: { id: "duel", label: "Дуель 1×1", max: 2 },
    3: { id: "tri", label: "Трикутник (3)", max: 3 },
    4: { id: "circle", label: "Коло (4)", max: 4 }
  };

  const NET = {
    active: false,
    inLobby: false,
    isHost: false,
    roomId: null,
    mySeat: 0,
    n: 2,
    roomData: null,
    _browserRef: null,
    _browserCb: null,
    _roomRef: null,
    _roomCb: null,
    _matchRef: null,
    _matchCb: null,
    _startedMatchId: null,
    _tab: "browse", // browse | create | lobby
    _createMode: 2,
    _createArena: "random",
    _createPrivate: false,
    _roomsCache: {}
  };

  window.NET = NET;

  function esc(s) {
    return String(s || "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function genRoomCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  }

  function myPlayerPayload(seat, isHost) {
    const nick = (typeof PROFILE !== "undefined" && PROFILE.name && PROFILE.name.trim()) ? PROFILE.name.trim().slice(0, 14) : "Дуелянт";
    return {
      uid: DCARD_FB.uid,
      nick,
      crest: (typeof PROFILE !== "undefined" ? Number(PROFILE.crest) || 0 : 0),
      banner: (typeof PROFILE !== "undefined" ? Number(PROFILE.banner) || 0 : 0),
      cardBack: (typeof PROFILE !== "undefined" && PROFILE.cardBack) ? PROFILE.cardBack : "classic",
      trophies: (typeof PROFILE !== "undefined" ? Number(PROFILE.trophies) || 0 : 0),
      seat,
      isHost: !!isHost,
      isBot: false,
      ready: !!isHost,
      joinedAt: Date.now()
    };
  }

  function stopBrowserListener() {
    if (NET._browserRef && NET._browserCb) {
      NET._browserRef.off("value", NET._browserCb);
    }
    NET._browserRef = null;
    NET._browserCb = null;
  }

  function stopRoomListener() {
    if (NET._roomRef && NET._roomCb) {
      NET._roomRef.off("value", NET._roomCb);
    }
    NET._roomRef = null;
    NET._roomCb = null;
  }

  async function leaveRoom(silent = false) {
    const rId = NET.roomId;
    const wasHost = NET.isHost;
    const seat = NET.mySeat;
    const wasPlaying = NET.active;

    stopRoomListener();
    NET.active = false;
    NET.inLobby = false;
    NET.isHost = false;
    NET.roomId = null;
    NET.mySeat = 0;
    NET.roomData = null;
    NET._startedMatchId = null;

    if (rId && window.DCARD_FB && DCARD_FB.ok && DCARD_FB.db) {
      try {
        const ref = DCARD_FB.db.ref(`rooms/${rId}`);
        ref.onDisconnect().cancel();
        if (wasHost && !wasPlaying) {
          await ref.remove();
        } else {
          await ref.child(`seats/${seat}`).onDisconnect().cancel();
          if (!wasPlaying) {
            await ref.child(`seats/${seat}`).remove();
          } else {
            await ref.child(`seats/${seat}/disconnected`).set(true);
          }
        }
      } catch (err) {
        console.warn("[DCARD_NET] leaveRoom error:", err);
      }
    }

    if (!silent && $("net-ov") && $("net-ov").classList.contains("show")) {
      NET._tab = "browse";
      renderNetModal();
      startBrowserListener();
    }
  }

  function startBrowserListener() {
    stopBrowserListener();
    if (!window.DCARD_FB || !DCARD_FB.ok || !DCARD_FB.db) return;
    const ref = DCARD_FB.db.ref("rooms");
    const cb = (snap) => {
      NET._roomsCache = snap.val() || {};
      if (NET._tab === "browse" && !NET.inLobby) {
        renderRoomsListOnly();
      }
    };
    NET._browserRef = ref;
    NET._browserCb = cb;
    ref.on("value", cb);
  }

  async function createRoom(titleInput) {
    await DCARD_FB.whenReady();
    if (!DCARD_FB.ok || !DCARD_FB.uid) {
      showNetError("Немає підключення до сервера Firebase.");
      return;
    }

    const maxP = NET._createMode || 2;
    const modeInfo = MODE_META[maxP] || MODE_META[2];
    const nick = (PROFILE.name && PROFILE.name.trim()) ? PROFILE.name.trim().slice(0, 14) : "Дуелянт";
    const cleanTitle = (titleInput || "").trim().slice(0, 26) || `Арена · ${nick}`;
    const roomId = genRoomCode();
    const roomRef = DCARD_FB.db.ref(`rooms/${roomId}`);

    const roomObj = {
      meta: {
        id: roomId,
        title: cleanTitle,
        hostUid: DCARD_FB.uid,
        hostName: nick,
        hostCrest: Number(PROFILE.crest) || 0,
        maxPlayers: maxP,
        modeLabel: modeInfo.label,
        arenaId: NET._createArena || "random",
        isPrivate: !!NET._createPrivate,
        status: "waiting",
        createdAt: Date.now()
      },
      seats: {
        0: myPlayerPayload(0, true)
      }
    };

    try {
      await roomRef.set(roomObj);
      roomRef.onDisconnect().remove();
      enterLobby(roomId, 0, true);
      if (typeof snd === "function") snd("swap");
    } catch (err) {
      console.warn("[DCARD_NET] createRoom error:", err);
      showNetError("Не вдалося створити кімнату: " + (err && err.message ? err.message : "перевір правила RTDB"));
    }
  }

  async function joinRoomByCode(rawCode) {
    await DCARD_FB.whenReady();
    if (!DCARD_FB.ok || !DCARD_FB.uid) {
      showNetError("Немає підключення до сервера Firebase.");
      return;
    }
    const code = String(rawCode || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    if (code.length < 4) {
      showNetError("Введи 4-значний код кімнати.");
      return;
    }

    const roomRef = DCARD_FB.db.ref(`rooms/${code}`);
    try {
      const snap = await roomRef.once("value");
      const data = snap.val();
      if (!data || !data.meta) {
        showNetError(`Кімнату «${code}» не знайдено або її вже закрито.`);
        return;
      }
      if (data.meta.status !== "waiting") {
        showNetError(`У кімнаті «${code}» бій уже триває.`);
        return;
      }

      const maxP = Number(data.meta.maxPlayers) || 2;
      const seats = data.seats || {};

      // Перевірка, чи ми вже в кімнаті
      for (let i = 0; i < maxP; i++) {
        if (seats[i] && seats[i].uid === DCARD_FB.uid) {
          enterLobby(code, i, i === 0);
          return;
        }
      }

      // Пошук вільного місця
      let freeSeat = -1;
      for (let i = 0; i < maxP; i++) {
        if (!seats[i]) { freeSeat = i; break; }
      }
      if (freeSeat < 0) {
        showNetError(`У кімнаті «${code}» немає вільних місць.`);
        return;
      }

      const seatRef = roomRef.child(`seats/${freeSeat}`);
      await seatRef.set(myPlayerPayload(freeSeat, false));
      seatRef.onDisconnect().remove();
      enterLobby(code, freeSeat, false);
      if (typeof snd === "function") snd("swap");
    } catch (err) {
      console.warn("[DCARD_NET] joinRoom error:", err);
      showNetError("Помилка входу в кімнату.");
    }
  }

  function enterLobby(roomId, mySeat, isHost) {
    stopBrowserListener();
    stopRoomListener();
    NET.roomId = roomId;
    NET.mySeat = mySeat;
    NET.isHost = isHost;
    NET.inLobby = true;
    NET.active = false;
    NET._tab = "lobby";
    NET._startedMatchId = null;

    const roomRef = DCARD_FB.db.ref(`rooms/${roomId}`);
    const cb = (snap) => {
      const data = snap.val();
      if (!data || !data.meta) {
        if (NET.inLobby) {
          NET.inLobby = false;
          NET.roomId = null;
          NET._tab = "browse";
          renderNetModal("Хост закрив кімнату.");
          startBrowserListener();
        }
        return;
      }
      NET.roomData = data;

      // Якщо хост запустив бій — синхронно стартуємо на всіх клієнтах!
      if (data.meta.status === "playing" && data.match && data.match.matchId && NET._startedMatchId !== data.match.matchId) {
        NET._startedMatchId = data.match.matchId;
        NET.inLobby = false;
        NET.active = true;
        NET.n = data.match.players.length;
        closeNetModal(true);
        if (typeof start === "function") {
          start(NET.n, {
            matchId: data.match.matchId,
            roomId: NET.roomId,
            mySeat: NET.mySeat,
            isHost: NET.isHost,
            arenaId: data.match.arenaId,
            startPtr: data.match.startPtr,
            players: data.match.players
          });
        }
        return;
      }

      if (NET.inLobby && $("net-ov") && $("net-ov").classList.contains("show")) {
        renderLobbyBody();
      }
    };
    NET._roomRef = roomRef;
    NET._roomCb = cb;
    roomRef.on("value", cb);
    renderNetModal();
  }

  async function toggleGuestReady() {
    if (!NET.roomId || !NET.roomData || NET.isHost) return;
    const cur = !!(NET.roomData.seats && NET.roomData.seats[NET.mySeat] && NET.roomData.seats[NET.mySeat].ready);
    await DCARD_FB.db.ref(`rooms/${NET.roomId}/seats/${NET.mySeat}/ready`).set(!cur);
    if (typeof snd === "function") snd("throw");
  }

  async function toggleBotAtSeat(seatIdx) {
    if (!NET.roomId || !NET.isHost || !NET.roomData) return;
    const seats = NET.roomData.seats || {};
    const existing = seats[seatIdx];
    const botNames = ["Тінь", "Кібер", "Лорд", "Вартовий"];
    if (existing && existing.isBot) {
      await DCARD_FB.db.ref(`rooms/${NET.roomId}/seats/${seatIdx}`).remove();
    } else if (!existing) {
      await DCARD_FB.db.ref(`rooms/${NET.roomId}/seats/${seatIdx}`).set({
        uid: "bot_" + seatIdx,
        nick: botNames[seatIdx % botNames.length] + " (Бот)",
        crest: (seatIdx + 2) % AV_SVG.length,
        banner: seatIdx % PL_BANNERS.length,
        cardBack: "classic",
        trophies: 0,
        seat: seatIdx,
        isHost: false,
        isBot: true,
        ready: true,
        joinedAt: Date.now()
      });
    }
    if (typeof snd === "function") snd("throw");
  }

  async function hostStartMatch() {
    if (!NET.roomId || !NET.isHost || !NET.roomData) return;
    const data = NET.roomData;
    const maxP = Number(data.meta.maxPlayers) || 2;
    const seatsObj = data.seats || {};
    const activeSeats = [];
    for (let i = 0; i < maxP; i++) {
      if (seatsObj[i]) activeSeats.push(Object.assign({ seat: i }, seatsObj[i]));
    }
    if (activeSeats.length < 2) {
      showNetError("Потрібно щонайменше 2 гравці (або додай бота).");
      return;
    }
    const unready = activeSeats.find(s => !s.isBot && !s.isHost && !s.ready);
    if (unready) {
      showNetError(`Очікуємо готовності гравця ${unready.nick}.`);
      return;
    }

    // Визначаємо арену та роздаємо початкові руки на боці хоста
    let chosenArena = (data.meta.arenaId && data.meta.arenaId !== "random")
      ? (ARENAS.find(a => a.id === data.meta.arenaId) || ARENAS[0])
      : ARENAS[Math.floor(Math.random() * ARENAS.length)];

    availableSpecs = [...SPEC_POOL].sort(() => Math.random() - 0.5);
    const mirrorMaster = chosenArena.id === "mirror" ? dealPool(0, chosenArena) : null;

    const playersPayload = activeSeats.map((s, idx) => {
      const hand = mirrorMaster ? JSON.parse(JSON.stringify(mirrorMaster)) : dealPool(idx, chosenArena);
      return {
        netSeat: idx,
        origSeat: s.seat,
        uid: s.uid,
        name: s.nick || `Гравець ${idx + 1}`,
        crestIdx: Number(s.crest) || 0,
        bannerIdx: Number(s.banner) || 0,
        cardBack: s.cardBack || "classic",
        isBot: !!s.isBot,
        hand
      };
    });

    // Переіндексуємо mySeat, якщо між слотами були прогалини
    const myIdx = playersPayload.findIndex(p => p.uid === DCARD_FB.uid);
    if (myIdx >= 0) NET.mySeat = myIdx;

    const matchPayload = {
      matchId: "m_" + Date.now() + "_" + Math.floor(Math.random() * 9999),
      arenaId: chosenArena.id,
      startPtr: Math.floor(Math.random() * playersPayload.length),
      players: playersPayload,
      moves: {},
      rng: {},
      refills: {}
    };

    const roomRef = DCARD_FB.db.ref(`rooms/${NET.roomId}`);
    await roomRef.child("match").set(matchPayload);
    await roomRef.child("meta/status").set("playing");
  }

  // ===== СИНХРОНІЗАЦІЯ ХОДІВ, РАНДОМУ ТА ДОБОРУ КАРТ ПІД ЧАС БОЮ =====
  async function publishMove(turnKey, netSeat, cardIdx, cardObj) {
    if (!NET.active || !NET.roomId) return;
    await DCARD_FB.db.ref(`rooms/${NET.roomId}/match/moves/${turnKey}_${netSeat}`).set({
      cardIdx,
      card: { t: cardObj.t, r: cardObj.r, b: cardObj.b || 0 },
      ts: Date.now()
    });
  }

  function awaitMove(turnKey, netSeat, myGame, fallbackFn) {
    return new Promise((resolve) => {
      if (!NET.active || !NET.roomId) return resolve(null);
      const ref = DCARD_FB.db.ref(`rooms/${NET.roomId}/match/moves/${turnKey}_${netSeat}`);
      let done = false;
      const finish = (val) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        ref.off("value", onVal);
        resolve(val);
      };
      const onVal = (snap) => {
        if (typeof gameId !== "undefined" && myGame !== gameId) return finish(null);
        const v = snap.val();
        if (v && typeof v.cardIdx === "number" && v.card) {
          finish(v);
        }
      };
      // Таймаут безпеки 32 с (якщо опонент відвалився — автохід)
      const timer = setTimeout(() => {
        if (done) return;
        if (NET.isHost && typeof fallbackFn === "function") {
          const fb = fallbackFn();
          if (fb) {
            publishMove(turnKey, netSeat, fb.cardIdx, fb.card).catch(() => {});
            finish(fb);
            return;
          }
        }
        finish(null);
      }, 32000);
      ref.on("value", onVal);
    });
  }

  async function syncRngInt(rngKey, maxVal, myGame) {
    if (!NET.active || !NET.roomId) return Math.floor(Math.random() * maxVal);
    const ref = DCARD_FB.db.ref(`rooms/${NET.roomId}/match/rng/${rngKey}`);
    if (NET.isHost) {
      const val = Math.floor(Math.random() * maxVal);
      await ref.set(val);
      return val;
    }
    return new Promise((resolve) => {
      let done = false;
      const finish = (v) => {
        if (done) return;
        done = true;
        clearTimeout(tm);
        ref.off("value", cb);
        resolve(v);
      };
      const cb = (snap) => {
        if (typeof gameId !== "undefined" && myGame !== gameId) return finish(0);
        const v = snap.val();
        if (typeof v === "number") finish(v);
      };
      const tm = setTimeout(() => finish(0), 12000);
      ref.on("value", cb);
    });
  }

  async function syncRefillHand(refillKey, dealFn, myGame) {
    if (!NET.active || !NET.roomId) return dealFn();
    const ref = DCARD_FB.db.ref(`rooms/${NET.roomId}/match/refills/${refillKey}`);
    if (NET.isHost) {
      const hand = dealFn();
      await ref.set(hand);
      return hand;
    }
    return new Promise((resolve) => {
      let done = false;
      const finish = (v) => {
        if (done) return;
        done = true;
        clearTimeout(tm);
        ref.off("value", cb);
        resolve(v);
      };
      const cb = (snap) => {
        if (typeof gameId !== "undefined" && myGame !== gameId) return finish(dealFn());
        const v = snap.val();
        if (Array.isArray(v) && v.length) finish(v);
      };
      const tm = setTimeout(() => finish(dealFn()), 12000);
      ref.on("value", cb);
    });
  }

  function finishOnlineMatch() {
    if (!NET.active) return;
    const rId = NET.roomId;
    const isH = NET.isHost;
    NET.active = false;
    NET.inLobby = false;
    stopRoomListener();
    if (rId && isH && window.DCARD_FB && DCARD_FB.ok && DCARD_FB.db) {
      setTimeout(() => {
        DCARD_FB.db.ref(`rooms/${rId}`).remove().catch(() => {});
      }, 4000);
    }
    NET.roomId = null;
    NET.isHost = false;
    NET.roomData = null;
    NET._startedMatchId = null;
  }

  // ===== UI БРАУЗЕРА СЕРВЕРІВ ТА ЛОБІ =====
  function showNetError(msg) {
    const el = $("net-err-box");
    if (!el) return;
    el.textContent = msg;
    el.style.display = "block";
    if (typeof snd === "function") snd("thud");
  }

  function openNetModal(prefillCode = "") {
    const ov = $("net-ov");
    if (!ov) return;
    if (typeof snd === "function") snd("throw");
    ov.setAttribute("aria-hidden", "false");
    ov.classList.add("show");

    if (!NET.inLobby) {
      NET._tab = "browse";
      renderNetModal();
      DCARD_FB.whenReady().then(() => {
        startBrowserListener();
        if (prefillCode) {
          const inp = $("net-join-code");
          if (inp) inp.value = prefillCode;
          joinRoomByCode(prefillCode);
        }
      });
    } else {
      renderNetModal();
    }
  }

  function closeNetModal(keepRoom = false) {
    const ov = $("net-ov");
    if (!ov) return;
    stopBrowserListener();
    if (!keepRoom && NET.inLobby) {
      leaveRoom(true);
    }
    ov.classList.remove("show");
    ov.setAttribute("aria-hidden", "true");
  }

  function renderRoomsListOnly() {
    const box = $("net-rooms-list");
    if (!box) return;
    const now = Date.now();
    const rooms = Object.values(NET._roomsCache || {}).filter((r) => {
      if (!r || !r.meta) return false;
      if (r.meta.status !== "waiting") return false;
      if (r.meta.isPrivate) return false;
      if (now - (r.meta.createdAt || 0) > 1000 * 60 * 60 * 3) return false; // старше 3 год ігноруємо
      return true;
    }).sort((a, b) => (b.meta.createdAt || 0) - (a.meta.createdAt || 0));

    if (!rooms.length) {
      box.innerHTML = `
        <div class="net-empty">
          ${UI_IC.globe}
          <b>Відкритих серверів зараз немає</b>
          <span>Створи власну кімнату або підключися до друга за 4-значним кодом.</span>
        </div>
      `;
      return;
    }

    box.innerHTML = rooms.map((r) => {
      const m = r.meta;
      const seats = r.seats || {};
      const cnt = Object.keys(seats).length;
      const maxP = Number(m.maxPlayers) || 2;
      const full = cnt >= maxP;
      const av = (typeof AV_SVG !== "undefined" && AV_SVG[m.hostCrest || 0]) ? AV_SVG[m.hostCrest || 0] : "";
      const arObj = m.arenaId && m.arenaId !== "random" ? ARENAS.find(a => a.id === m.arenaId) : null;
      const arLabel = arObj ? arObj.name : "Випадкова арена";
      return `
        <div class="net-room-card ${full ? "is-full" : ""}">
          <div class="nrc-av">${av}</div>
          <div class="nrc-info">
            <div class="nrc-top">
              <b>${esc(m.title)}</b>
              <span class="nrc-code">${esc(m.id)}</span>
            </div>
            <div class="nrc-sub">
              <span>Хост: ${esc(m.hostName)}</span>
              <span>· ${esc(m.modeLabel || "Дуель")}</span>
              <span>· ${esc(arLabel)}</span>
            </div>
          </div>
          <div class="nrc-right">
            <span class="nrc-cnt">${UI_IC.users} ${cnt}/${maxP}</span>
            <button type="button" class="net-join-btn" data-join-room="${esc(m.id)}" ${full ? "disabled" : ""}>
              ${full ? "Повна" : "Увійти"}
            </button>
          </div>
        </div>
      `;
    }).join("");

    box.querySelectorAll("[data-join-room]").forEach((btn) => {
      btn.onclick = () => joinRoomByCode(btn.getAttribute("data-join-room"));
    });
  }

  function renderLobbyBody() {
    const body = $("net-modal-body");
    if (!body || !NET.roomData || !NET.roomData.meta) return;
    const m = NET.roomData.meta;
    const maxP = Number(m.maxPlayers) || 2;
    const seats = NET.roomData.seats || {};
    const arObj = m.arenaId && m.arenaId !== "random" ? ARENAS.find(a => a.id === m.arenaId) : null;
    const arLabel = arObj ? arObj.name : "Випадкова арена";

    let filledCount = 0;
    let allReady = true;
    const seatCards = [];
    for (let i = 0; i < maxP; i++) {
      const s = seats[i];
      if (s) {
        filledCount++;
        if (!s.isBot && !s.isHost && !s.ready) allReady = false;
        const av = (typeof AV_SVG !== "undefined" && AV_SVG[s.crest || 0]) ? AV_SVG[s.crest || 0] : "";
        const isMe = s.uid === DCARD_FB.uid;
        seatCards.push(`
          <div class="lobby-seat filled ${s.ready ? "is-ready" : ""} ${isMe ? "is-me" : ""}">
            <div class="ls-av">${av}</div>
            <div class="ls-meta">
              <b>${esc(s.nick)}${s.isHost ? ` <span class="ls-host">${UI_IC.crown}</span>` : ""}</b>
              <span>${s.isBot ? "ШІ-суперник" : `${s.trophies || 0} ${UI_IC.trophy}`}</span>
            </div>
            <div class="ls-status">
              ${s.isHost
                ? `<span class="ls-pill host">Хост</span>`
                : s.isBot
                  ? (NET.isHost ? `<button type="button" class="ls-bot-rm" data-bot-seat="${i}">Прибрати</button>` : `<span class="ls-pill ready">Бот</span>`)
                  : `<span class="ls-pill ${s.ready ? "ready" : "wait"}">${s.ready ? `${UI_IC.check} Готовий` : "Очікує"}</span>`
              }
            </div>
          </div>
        `);
      } else {
        seatCards.push(`
          <div class="lobby-seat empty">
            <div class="ls-empty-ico">${UI_IC.users}</div>
            <div class="ls-meta">
              <b>Вільне місце #${i + 1}</b>
              <span>Поділися кодом ${esc(m.id)} із другом</span>
            </div>
            ${NET.isHost ? `<button type="button" class="ls-bot-add" data-bot-seat="${i}">+ Додати бота</button>` : ""}
          </div>
        `);
      }
    }

    const mySeatObj = seats[NET.mySeat];
    const amReady = !!(mySeatObj && mySeatObj.ready);
    const canStart = NET.isHost && filledCount >= 2 && allReady;

    body.innerHTML = `
      <div class="lobby-head-bar">
        <div class="lobby-code-box">
          <small>КОД КІМНАТИ</small>
          <div class="lobby-code-val">
            <b>${esc(m.id)}</b>
            <button type="button" class="lobby-copy-btn" id="btn-copy-code" title="Скопіювати код">${UI_IC.copy} Код</button>
            <button type="button" class="lobby-copy-btn" id="btn-copy-link" title="Скопіювати посилання-запрошення">${UI_IC.globe} Посилання</button>
          </div>
        </div>
        <div class="lobby-meta-tags">
          <span>${UI_IC.swords} ${esc(m.modeLabel || "Дуель")}</span>
          <span>${UI_IC.pillar} ${esc(arLabel)}</span>
          <span>${m.isPrivate ? `${UI_IC.lock} Приватна` : `${UI_IC.globe} Відкрита`}</span>
        </div>
      </div>

      <div class="net-err-box" id="net-err-box" style="display:none"></div>

      <div class="lobby-seats-grid">${seatCards.join("")}</div>

      <div class="lobby-footer">
        <button type="button" class="set-danger-btn" id="btn-lobby-leave">${UI_IC.exit} Покинути кімнату</button>
        ${NET.isHost
          ? `<button type="button" class="showcase-cta-btn gold-cta lobby-start-btn" id="btn-lobby-start" ${canStart ? "" : "disabled"}>${UI_IC.swords} ПОЧАТИ БІЙ (${filledCount}/${maxP})</button>`
          : `<button type="button" class="showcase-cta-btn ${amReady ? "emerald-cta" : "ruby-cta"} lobby-start-btn" id="btn-lobby-ready">${amReady ? `${UI_IC.check} ГОТОВИЙ` : "ПІДТВЕРДИТИ ГОТОВНІСТЬ"}</button>`
        }
      </div>
    `;

    if ($("btn-copy-code")) {
      $("btn-copy-code").onclick = () => {
        navigator.clipboard?.writeText(m.id).catch(() => {});
        $("btn-copy-code").innerHTML = `${UI_IC.check} Скопійовано`;
        setTimeout(() => { if ($("btn-copy-code")) $("btn-copy-code").innerHTML = `${UI_IC.copy} Код`; }, 1500);
      };
    }
    if ($("btn-copy-link")) {
      $("btn-copy-link").onclick = () => {
        const url = `${location.origin}${location.pathname}?room=${m.id}`;
        navigator.clipboard?.writeText(url).catch(() => {});
        $("btn-copy-link").innerHTML = `${UI_IC.check} Скопійовано`;
        setTimeout(() => { if ($("btn-copy-link")) $("btn-copy-link").innerHTML = `${UI_IC.globe} Посилання`; }, 1500);
      };
    }
    if ($("btn-lobby-leave")) $("btn-lobby-leave").onclick = () => leaveRoom(false);
    if ($("btn-lobby-start")) $("btn-lobby-start").onclick = () => hostStartMatch();
    if ($("btn-lobby-ready")) $("btn-lobby-ready").onclick = () => toggleGuestReady();
    body.querySelectorAll("[data-bot-seat]").forEach((btn) => {
      btn.onclick = () => toggleBotAtSeat(parseInt(btn.getAttribute("data-bot-seat"), 10));
    });
  }

  function renderNetModal(notice = "") {
    const ov = $("net-ov");
    if (!ov) return;
    const isLobby = NET.inLobby && NET._tab === "lobby";

    ov.innerHTML = `
      <div class="set-modal net-modal">
        <div class="set-head">
          <div class="set-title-wrap">
            <span class="set-ico-box">${UI_IC.globe}</span>
            <div>
              <div class="set-title">${isLobby ? "ЛОБІ МАТЧУ" : "БРАУЗЕР СЕРВЕРІВ"}</div>
              <div class="set-sub">${isLobby ? "Підготовка дуелянтів перед виходом на арену" : "Онлайн-дуелі з друзями в реальному часі"}</div>
            </div>
          </div>
          <button type="button" class="set-close-x" id="net-close" title="Закрити (Esc)">${UI_IC.close}</button>
        </div>

        ${!isLobby ? `
          <div class="net-tabs">
            <button type="button" class="net-tab ${NET._tab === "browse" ? "act" : ""}" data-ntab="browse">${UI_IC.globe} Відкриті сервери</button>
            <button type="button" class="net-tab ${NET._tab === "create" ? "act" : ""}" data-ntab="create">${UI_IC.swords} Створити кімнату</button>
          </div>
        ` : ""}

        <div class="set-body net-modal-body" id="net-modal-body"></div>
      </div>
    `;

    ov.onclick = (ev) => { if (ev.target === ov) closeNetModal(false); };
    if ($("net-close")) $("net-close").onclick = () => closeNetModal(false);

    ov.querySelectorAll("[data-ntab]").forEach((btn) => {
      btn.onclick = () => {
        NET._tab = btn.getAttribute("data-ntab");
        if (typeof snd === "function") snd("throw");
        renderNetModal();
        if (NET._tab === "browse") startBrowserListener();
      };
    });

    const body = $("net-modal-body");
    if (!body) return;

    if (isLobby) {
      renderLobbyBody();
      return;
    }

    if (NET._tab === "browse") {
      body.innerHTML = `
        <div class="net-code-join-bar">
          <input type="text" id="net-join-code" class="net-code-inp" maxlength="4" placeholder="КОД (напр. A7K2)" autocomplete="off">
          <button type="button" class="showcase-cta-btn gold-cta net-code-btn" id="btn-net-join-code">Увійти за кодом</button>
        </div>
        <div class="net-err-box" id="net-err-box" style="${notice ? "display:block" : "display:none"}">${esc(notice)}</div>
        <div class="set-sec-lbl">${UI_IC.users} АКТИВНІ КІМНАТИ</div>
        <div class="net-rooms-list" id="net-rooms-list">
          <div class="lb-loading">${UI_IC.sparkle} Пошук відкритих серверів...</div>
        </div>
      `;
      const codeInp = $("net-join-code");
      if (codeInp) {
        codeInp.oninput = () => { codeInp.value = codeInp.value.toUpperCase().replace(/[^A-Z0-9]/g, ""); };
        codeInp.onkeydown = (e) => { if (e.key === "Enter") joinRoomByCode(codeInp.value); };
      }
      if ($("btn-net-join-code")) {
        $("btn-net-join-code").onclick = () => joinRoomByCode(codeInp ? codeInp.value : "");
      }
      renderRoomsListOnly();
    } else {
      const arenaOpts = `<option value="random">Випадкова арена</option>` +
        ARENAS.map(a => `<option value="${a.id}" ${NET._createArena === a.id ? "selected" : ""}>${esc(a.name)}</option>`).join("");
      body.innerHTML = `
        <div class="net-err-box" id="net-err-box" style="display:none"></div>
        <div class="set-section">
          <div class="set-sec-lbl">${UI_IC.swords} НАЛАШТУВАННЯ КІМНАТИ</div>
          <div class="net-form-field">
            <label>Назва сервера</label>
            <input type="text" id="net-room-title" class="net-text-inp" maxlength="26" placeholder="Наприклад: Дуель на Олімпі">
          </div>
          <div class="net-form-field">
            <label>Кількість гравців</label>
            <div class="net-mode-row">
              ${[2, 3, 4].map(cnt => `
                <button type="button" class="net-mode-btn ${NET._createMode === cnt ? "act" : ""}" data-nmode="${cnt}">
                  <b>${cnt}</b><span>${MODE_META[cnt].label}</span>
                </button>
              `).join("")}
            </div>
          </div>
          <div class="net-form-field">
            <label>Арена</label>
            <select id="net-arena-sel" class="net-select">${arenaOpts}</select>
          </div>
          <div class="set-row">
            <div class="set-row-info">
              <b>Приватна кімната</b>
              <span>Не показувати в загальному списку — вхід лише за 4-значним кодом</span>
            </div>
            <label class="set-switch"><input type="checkbox" id="net-private-chk" ${NET._createPrivate ? "checked" : ""}><i></i></label>
          </div>
          <button type="button" class="showcase-cta-btn gold-cta net-create-submit" id="btn-net-create-go">
            ${UI_IC.crown} СТВОРИТИ ТА ВІДКРИТИ ЛОБІ
          </button>
        </div>
      `;
      body.querySelectorAll("[data-nmode]").forEach((btn) => {
        btn.onclick = () => {
          NET._createMode = parseInt(btn.getAttribute("data-nmode"), 10) || 2;
          body.querySelectorAll("[data-nmode]").forEach(b => b.classList.toggle("act", b === btn));
          if (typeof snd === "function") snd("throw");
        };
      });
      if ($("net-arena-sel")) {
        $("net-arena-sel").onchange = (e) => { NET._createArena = e.target.value; };
      }
      if ($("net-private-chk")) {
        $("net-private-chk").onchange = (e) => { NET._createPrivate = !!e.target.checked; };
      }
      if ($("btn-net-create-go")) {
        $("btn-net-create-go").onclick = () => {
          const ttl = $("net-room-title") ? $("net-room-title").value : "";
          createRoom(ttl);
        };
      }
    }
  }

  // Автоматичне відкриття кімнати за посиланням ?room=XXXX
  window.addEventListener("DOMContentLoaded", () => {
    try {
      const params = new URLSearchParams(location.search);
      const roomCode = params.get("room");
      if (roomCode && roomCode.trim().length >= 4) {
        setTimeout(() => openNetModal(roomCode.trim().toUpperCase()), 600);
      }
    } catch (_) {}
  });

  window.DCARD_NET = {
    openNetModal,
    closeNetModal,
    leaveRoom,
    publishMove,
    awaitMove,
    syncRngInt,
    syncRefillHand,
    finishOnlineMatch
  };
})();
