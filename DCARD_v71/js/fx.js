// ==========================================

// DCARD V28 — ВІЗУАЛЬНІ ЕФЕКТИ ТА АНІМАЦІЇ (js/fx.js)

// Кінематографічні сцени карт, аури, спалахи, шлейфи та підказки

// ==========================================

async function altarAwakeningIntro(myGame) {
 const tbl = $("tbl");
 const ringSvg = $("ring");
 const handEl = $("hand");
 const bannerEl = $("banner");
 const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
 if (reduce) return;

 const seats = P.map((_, i) => $("p" + i)).filter(Boolean);
 const handCards = handEl ? Array.from(handEl.children) : [];

 if (bannerEl) bannerEl.innerHTML = `<span class="pill" style="border-color:#d4a24a;color:#ffe9a0;letter-spacing:1.4px">${UI_IC.diamond} ПРОБУДЖЕННЯ ВІВТАРЯ ${UI_IC.diamond}</span>`;

 // 1. Пробудження кам'яного вівтаря та спалах рунічного кільця (0.0 – 0.50 с)
 const stRect = $("stage").getBoundingClientRect();
 const cx = stRect.left + stRect.width / 2;
 const cy = stRect.top + stRect.height / 2;
 snd("swap");
 shock(cx, cy, "#d4a24a", Math.min(stRect.width, stRect.height) * 0.78);
 ring(cx, cy, "#fde047", Math.min(stRect.width, stRect.height) * 0.62);
 sparkBurst(cx, cy, ["#fde047", "#d4a24a", "#3fa796", "#fff6d9"], 28, 130);

 const tblAnim = tbl && tbl.animate ? tbl.animate([
 { opacity: 0, transform: "scale(0.55)" },
 { opacity: 1, transform: "scale(1.03)", offset: 0.72 },
 { opacity: 1, transform: "scale(1)" }
 ], { duration: 480, easing: "cubic-bezier(.2,1.25,.4,1)", fill: "forwards" }).finished.catch(() => {}) : sl(480);

 const ringAnim = ringSvg && ringSvg.animate ? ringSvg.animate([
 { opacity: 0, transform: "scale(0.65) rotate(-60deg)" },
 { opacity: 0.55, transform: "scale(1.04) rotate(8deg)", offset: 0.65 },
 { opacity: 0.24, transform: "scale(1) rotate(0deg)" }
 ], { duration: 540, easing: "ease-out", fill: "forwards" }).finished.catch(() => {}) : sl(540);

 await sl(260);
 if (myGame !== gameId) return;

 // 2. Почергова поява геральдичних плашок гравців по колу + заповнення HP 0 -> 100 (0.26 – 0.82 с)
 const seatAnims = seats.map((s, idx) => new Promise(res => {
 setTimeout(() => {
 if (myGame !== gameId) { res(); return; }
 const C = seatC(idx);
 snd("thud");
 shock(C.x, C.y, idx === 0 ? "#fde047" : "#d4a24a", 115);
 sparkBurst(C.x, C.y, ["#fde047", "#d4a24a", "#ffffff"], 12, 65);
 const fillArc = s.querySelector(".hp-fill-arc");
 if (fillArc && fillArc.animate) {
 fillArc.animate([{ strokeDasharray: "0 226.2" }, { strokeDasharray: "169.65 226.2" }], { duration: 420, delay: 90, easing: "cubic-bezier(.2,.9,.3,1)", fill: "forwards" });
 }
 if (s.animate) {
 s.animate([
 { opacity: 0, transform: "translate(-50%, -50%) scale(0.55) translateY(-14px)" },
 { opacity: 1, transform: "translate(-50%, -50%) scale(1.08) translateY(2px)", offset: 0.68 },
 { opacity: 1, transform: "translate(-50%, -50%) scale(1) translateY(0)" }
 ], { duration: 340, easing: "cubic-bezier(.2,1.35,.4,1)", fill: "forwards" }).onfinish = res;
 } else {
 s.style.opacity = "1";
 res();
 }
 }, idx * 95);
 }));

 await Promise.all([tblAnim, ringAnim, ...seatAnims]);
 if (myGame !== gameId) return;

 // Очищаємо інлайн-стилі та WAAPI вівтаря й кільця, щоб працювали нескінченні CSS-анімації столу та стрілок
 if (tbl) { tbl.getAnimations?.().forEach(a => a.cancel()); tbl.style.opacity = ""; tbl.style.transform = ""; }
 if (ringSvg) { ringSvg.getAnimations?.().forEach(a => a.cancel()); ringSvg.style.opacity = ""; ringSvg.style.transform = ""; }
 seats.forEach(s => {
 s.style.opacity = "";
 s.style.transform = "";
 const fillArc = s.querySelector(".hp-fill-arc");
 if (fillArc) {
 fillArc.getAnimations?.().forEach(a => a.cancel());
 fillArc.setAttribute("stroke-dasharray", "169.65 226.2");
 }
 });

 // 3. Роздача карт із центру вівтаря суперникам та розкриття віяла твоєї руки (0.82 – 1.48 с)
 snd("throw");
 // Сорочки летять від центру вівтаря до кожного бота
 P.forEach((p, idx) => {
 if (idx === 0) return;
 const D = seatC(idx);
 for (let b = 0; b < 3; b++) {
 const mini = document.createElement("div");
 mini.className = `card back cback-${(typeof PROFILE !== "undefined" && PROFILE.cardBack) || "classic"}`;
 mini.style.cssText = `position:fixed;left:${cx - 18}px;top:${cy - 26}px;width:36px;height:52px;z-index:68;pointer-events:none;border-radius:6px`;
 mini.innerHTML = backSvg(CUR_ARENA && CUR_ARENA.blindCards ? "q" : ["d", "h", "s"][b % 3]);
 document.body.appendChild(mini);
 an(mini, [
 { transform: "translate(0,0) scale(0.5) rotate(-30deg)", opacity: 0 },
 { transform: `translate(${(D.x - cx) * 0.5}px,${(D.y - cy) * 0.5 - 24}px) scale(0.95) rotate(140deg)`, opacity: 1, offset: 0.45 },
 { transform: `translate(${D.x - cx}px,${D.y - cy}px) scale(0.45) rotate(320deg)`, opacity: 0 }
 ], 360, { delay: b * 55, easing: "cubic-bezier(.25,.8,.3,1)" }).then(() => mini.remove());
 }
 });

 // Твої 10 карт вилітають з центру вівтаря вниз у руку та пробігають золотим відблиском
 const cardAnims = handCards.map((c, idx) => new Promise(res => {
 setTimeout(() => {
 if (myGame !== gameId) { res(); return; }
 if (idx % 3 === 0) snd("throw");
 const r = c.getBoundingClientRect();
 const cardCx = r.left + r.width / 2;
 const cardCy = r.top + r.height / 2;
 const dx = cx - cardCx;
 const dy = cy - cardCy;
 const baseTf = getComputedStyle(c).transform;
 const tfEnd = baseTf && baseTf !== "none" ? baseTf : "translate(0px, 0px)";
 if (c.animate) {
 c.animate([
 { opacity: 0, transform: `translate(${dx}px, ${dy}px) scale(0.32) rotate(${(idx - 4.5) * 18}deg)` },
 { opacity: 1, transform: `translate(${dx * 0.15}px, ${dy * 0.15 - 12}px) scale(1.06) rotate(0deg)`, offset: 0.72 },
 { opacity: 1, transform: tfEnd }
 ], { duration: 360, easing: "cubic-bezier(.2,1.2,.35,1)", fill: "forwards" }).onfinish = () => {
 c.style.opacity = "";
 c.getAnimations?.().forEach(a => a.cancel());
 c.classList.add("intro-sheen");
 setTimeout(() => c.classList.remove("intro-sheen"), 580);
 res();
 };
 } else {
 c.style.opacity = "";
 res();
 }
 }, idx * 38);
 }));

 await Promise.all(cardAnims);
 if (myGame !== gameId) return;
 snd("heal");
 await sl(220);
}


function initArenaBg() {
 const bg = $("arena-bg");
 if (!bg || bg.dataset.ready) return;
 bg.dataset.ready = "1";
 // Тундра + завірюха зі сніжинок
 let snowHtml = "";
 const flakeSvg = `<svg viewBox="0 0 24 24" width="100%" height="100%"><g stroke="#e0f2fe" stroke-width="1.8" stroke-linecap="round"><path d="M12 2v20M3.5 7l17 10M20.5 7l-17 10"/><circle cx="12" cy="12" r="2.2" fill="#fff" stroke="none"/></g></svg>`;
 for (let i = 0; i < 36; i++) {
 const left = (Math.random() * 104 - 2).toFixed(1);
 const size = (8 + Math.random() * 11).toFixed(1);
 const dur = (4.5 + Math.random() * 5.5).toFixed(2);
 const del = (-Math.random() * 8).toFixed(2);
 const drift = ((Math.random() - 0.5) * 110).toFixed(0);
 const op = (0.35 + Math.random() * 0.55).toFixed(2);
 snowHtml += `<span class="ar-snow" style="left:${left}%;width:${size}px;height:${size}px;--dur:${dur}s;--del:${del}s;--drift:${drift}px;--op:${op}">${flakeSvg}</span>`;
 }
 const tundraSvg = `<svg class="tundra-horizon" viewBox="0 0 1200 320" preserveAspectRatio="none">
 <path d="M0 320 L0 185 L120 120 L250 175 L410 85 L580 165 L740 95 L910 170 L1070 110 L1200 175 L1200 320 Z" fill="#0d2840"/>
 <path d="M0 320 L0 230 Q180 195 360 235 T760 225 T1200 235 L1200 320 Z" fill="#133856"/>
 <path d="M0 320 L0 265 Q300 242 600 268 T1200 258 L1200 320 Z" fill="#1b4d72"/>
 </svg>`;

 // Мішаний ліс (ялинки + листяні крони) + бірюзовий туман + напівпрозорі знаки питання
 let qHtml = "";
 for (let i = 0; i < 20; i++) {
 const left = (4 + Math.random() * 92).toFixed(1);
 const top = (18 + Math.random() * 72).toFixed(1);
 const size = (16 + Math.random() * 24).toFixed(0);
 const dur = (5 + Math.random() * 5).toFixed(2);
 const del = (-Math.random() * 7).toFixed(2);
 const op = (0.16 + Math.random() * 0.28).toFixed(2);
 qHtml += `<span class="ar-qmark" style="left:${left}%;top:${top}%;font-size:${size}px;--dur:${dur}s;--del:${del}s;--op:${op}">?</span>`;
 }
 const forestSvg = `<svg class="forest-silhouette" viewBox="0 0 1200 360" preserveAspectRatio="none">
 <g fill="#062221">
 <!-- Ялинки -->
 <polygon points="70,360 115,150 160,360"/><polygon points="82,270 115,120 148,270"/>
 <polygon points="270,360 325,125 380,360"/><polygon points="285,250 325,95 365,250"/>
 <polygon points="830,360 885,130 940,360"/><polygon points="845,255 885,100 925,255"/>
 <polygon points="1040,360 1095,145 1150,360"/><polygon points="1055,265 1095,115 1135,265"/>
 <!-- Листяні дерева -->
 <rect x="192" y="235" width="12" height="125"/><circle cx="198" cy="210" r="46"/><circle cx="172" cy="226" r="34"/><circle cx="224" cy="224" r="36"/>
 <rect x="445" y="245" width="14" height="115"/><circle cx="452" cy="215" r="52"/><circle cx="420" cy="232" r="38"/><circle cx="482" cy="230" r="40"/>
 <rect x="725" y="240" width="14" height="120"/><circle cx="732" cy="212" r="50"/><circle cx="702" cy="228" r="36"/><circle cx="762" cy="228" r="38"/>
 <rect x="965" y="250" width="12" height="110"/><circle cx="971" cy="222" r="44"/><circle cx="946" cy="236" r="32"/><circle cx="996" cy="235" r="33"/>
 </g>
 <path d="M0 360 L0 315 Q300 295 600 318 T1200 310 L1200 360 Z" fill="#041716"/>
 </svg>`;

 // Болото Гідри: силуети очерету/коріння + болотяний туман + світлячки + отруйні бульбашки
 let fireflyHtml = "";
 for (let i = 0; i < 26; i++) {
 const left = (4 + Math.random() * 92).toFixed(1);
 const top = (12 + Math.random() * 78).toFixed(1);
 const sz = (4 + Math.random() * 5).toFixed(1);
 const dur = (5 + Math.random() * 6).toFixed(2);
 const del = (-Math.random() * 7).toFixed(2);
 const dx = ((Math.random() - 0.5) * 70).toFixed(0);
 const dy = (-20 - Math.random() * 45).toFixed(0);
 fireflyHtml += `<span class="ar-firefly" style="left:${left}%;top:${top}%;width:${sz}px;height:${sz}px;--dur:${dur}s;--del:${del}s;--dx:${dx}px;--dy:${dy}px"></span>`;
 }
 let sbubHtml = "";
 for (let i = 0; i < 18; i++) {
 const left = (6 + Math.random() * 88).toFixed(1);
 const bottom = (4 + Math.random() * 28).toFixed(1);
 const sz = (7 + Math.random() * 14).toFixed(0);
 const dur = (4.5 + Math.random() * 4.5).toFixed(2);
 const del = (-Math.random() * 6).toFixed(2);
 sbubHtml += `<span class="ar-sbubble" style="left:${left}%;bottom:${bottom}%;width:${sz}px;height:${sz}px;--dur:${dur}s;--del:${del}s"></span>`;
 }
 const swampSvg = `<svg class="swamp-horizon" viewBox="0 0 1200 320" preserveAspectRatio="none">
 <path d="M0 320 L0 230 Q220 205 460 238 T920 222 T1200 235 L1200 320 Z" fill="#062315"/>
 <path d="M0 320 L0 265 Q300 245 620 272 T1200 260 L1200 320 Z" fill="#04170d"/>
 <g stroke="#0a3620" stroke-width="4" fill="none" stroke-linecap="round">
 <path d="M90 320 Q82 240 65 180 M105 320 Q112 250 130 195 M118 320 Q125 265 142 225"/>
 <path d="M1060 320 Q1050 235 1030 175 M1080 320 Q1090 250 1112 190 M1096 320 Q1105 265 1126 220"/>
 </g>
 </svg>`;

 // Кривавий Колізей: античні колони, арки та кружляючі червоні пелюстки/іскри
 let petalHtml = "";
 for (let i = 0; i < 30; i++) {
 const left = (Math.random() * 102 - 1).toFixed(1);
 const dur = (5.5 + Math.random() * 5.5).toFixed(2);
 const del = (-Math.random() * 8).toFixed(2);
 const drift = ((Math.random() - 0.5) * 140).toFixed(0);
 const op = (0.4 + Math.random() * 0.55).toFixed(2);
 petalHtml += `<span class="ar-petal" style="left:${left}%;--dur:${dur}s;--del:${del}s;--drift:${drift}px;--op:${op}"></span>`;
 }
 const colosseumSvg = `<svg class="colosseum-bg" viewBox="0 0 1200 700" preserveAspectRatio="none">
 <defs>
 <linearGradient id="colGrad" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stop-color="#2a0810" stop-opacity="0.85"/>
 <stop offset="100%" stop-color="#0d0205" stop-opacity="0.95"/>
 </linearGradient>
 </defs>
 <g fill="url(#colGrad)" stroke="#7f1d1d" stroke-width="1.5">
 <rect x="42" y="80" width="44" height="540" rx="4"/>
 <rect x="30" y="65" width="68" height="20" rx="3"/>
 <rect x="30" y="615" width="68" height="24" rx="3"/>
 <rect x="132" y="120" width="36" height="500" rx="4" opacity="0.72"/>
 <rect x="122" y="106" width="56" height="17" rx="3" opacity="0.72"/>

 <rect x="1114" y="80" width="44" height="540" rx="4"/>
 <rect x="1102" y="65" width="68" height="20" rx="3"/>
 <rect x="1102" y="615" width="68" height="24" rx="3"/>
 <rect x="1032" y="120" width="36" height="500" rx="4" opacity="0.72"/>
 <rect x="1022" y="106" width="56" height="17" rx="3" opacity="0.72"/>
 </g>
 <path d="M0 700 L0 560 L1200 560 L1200 700 Z" fill="#120307"/>
 <g fill="#080103" stroke="#881337" stroke-width="1.2">
 <path d="M180 700 V615 A45 45 0 0 1 270 615 V700 Z"/>
 <path d="M350 700 V615 A45 45 0 0 1 440 615 V700 Z"/>
 <path d="M760 700 V615 A45 45 0 0 1 850 615 V700 Z"/>
 <path d="M930 700 V615 A45 45 0 0 1 1020 615 V700 Z"/>
 </g>
 </svg>`;


 // Дзеркальна арена: парячі кришталеві уламки з відблисками рун
 const shardShapes = [
 "12,2 28,8 22,30 4,22",
 "16,2 30,14 18,32 4,18",
 "8,4 28,4 24,28 6,24",
 "16,2 28,24 6,28"
 ];
 const runeGlyphs = ["M12 11l4 5-4 5M16 11l-4 5 4 5", "M11 16h10M16 11v10", "M12 12l8 8M20 12l-8 8", "M16 10l5 11H11z"];
 let mshardHtml = "";
 for (let i = 0; i < 22; i++) {
 const left = (3 + Math.random() * 94).toFixed(1);
 const top = (6 + Math.random() * 86).toFixed(1);
 const sz = (22 + Math.random() * 24).toFixed(0);
 const dur = (5.5 + Math.random() * 5.5).toFixed(2);
 const del = (-Math.random() * 7).toFixed(2);
 const dx = ((Math.random() - 0.5) * 32).toFixed(0);
 const dy = (-14 - Math.random() * 24).toFixed(0);
 const r0 = ((Math.random() - 0.5) * 40).toFixed(0);
 const r1 = (parseFloat(r0) + (Math.random() - 0.5) * 36).toFixed(0);
 const op = (0.35 + Math.random() * 0.4).toFixed(2);
 const poly = shardShapes[i % shardShapes.length];
 const rg = runeGlyphs[i % runeGlyphs.length];
 mshardHtml += `<span class="ar-mshard" style="left:${left}%;top:${top}%;width:${sz}px;height:${sz}px;--dur:${dur}s;--del:${del}s;--dx:${dx}px;--dy:${dy}px;--r0:${r0}deg;--r1:${r1}deg;--op:${op}"><svg viewBox="0 0 32 32" width="100%" height="100%"><polygon points="${poly}" fill="rgba(203,213,225,0.18)" stroke="#f8fafc" stroke-width="1.2"/><line x1="8" y1="8" x2="22" y2="22" stroke="rgba(255,255,255,0.65)" stroke-width="1"/><path d="${rg}" fill="none" stroke="#93c5fd" stroke-width="1.2" stroke-linecap="round" opacity="0.85"/></svg></span>`;
 }

 // Кузня Гефеста: вугільне горнило + висхідні розпечені іскри жару
 let emberHtml = "";
 for (let i = 0; i < 34; i++) {
  const left = (2 + Math.random() * 96).toFixed(1);
  const sz = (3 + Math.random() * 5.5).toFixed(1);
  const dur = (4.2 + Math.random() * 4.8).toFixed(2);
  const del = (-Math.random() * 7).toFixed(2);
  const drift = ((Math.random() - 0.5) * 90).toFixed(0);
  const op = (0.55 + Math.random() * 0.4).toFixed(2);
  emberHtml += `<span class="ar-ember" style="left:${left}%;width:${sz}px;height:${sz}px;--dur:${dur}s;--del:${del}s;--drift:${drift}px;--op:${op}"></span>`;
 }

 // Храм Світил: Денні сонячні промені/пилинки + Нічні зорі/туман
 let sunDustHtml = "";
 for (let i = 0; i < 24; i++) {
  const left = (4 + Math.random() * 92).toFixed(1);
  const top = (8 + Math.random() * 82).toFixed(1);
  const sz = (3.5 + Math.random() * 4.5).toFixed(1);
  const dur = (5 + Math.random() * 5).toFixed(2);
  const del = (-Math.random() * 6).toFixed(2);
  const dx = ((Math.random() - 0.5) * 50).toFixed(0);
  const dy = (-15 - Math.random() * 35).toFixed(0);
  sunDustHtml += `<span class="ar-sindust" style="left:${left}%;top:${top}%;width:${sz}px;height:${sz}px;--dur:${dur}s;--del:${del}s;--dx:${dx}px;--dy:${dy}px"></span>`;
 }
 let starHtml = "";
 for (let i = 0; i < 36; i++) {
  const left = (2 + Math.random() * 96).toFixed(1);
  const top = (3 + Math.random() * 68).toFixed(1);
  const sz = (2 + Math.random() * 3).toFixed(1);
  const dur = (2.8 + Math.random() * 4).toFixed(2);
  const del = (-Math.random() * 5).toFixed(2);
  starHtml += `<span class="ar-star" style="left:${left}%;top:${top}%;width:${sz}px;height:${sz}px;--dur:${dur}s;--del:${del}s"></span>`;
 }


 // Астральний вимір: космічна туманність та різнокольорові зірки веселки
 const astCols = ["#34d399", "#38bdf8", "#c084fc", "#fb7185", "#fde047"];
 let astStarHtml = "";
 for (let i = 0; i < 42; i++) {
  const left = (2 + Math.random() * 96).toFixed(1);
  const top = (3 + Math.random() * 92).toFixed(1);
  const sz = (2 + Math.random() * 3.2).toFixed(1);
  const dur = (3 + Math.random() * 4.5).toFixed(2);
  const del = (-Math.random() * 6).toFixed(2);
  const sc = astCols[i % astCols.length];
  astStarHtml += `<span class="ar-ast-star" style="left:${left}%;top:${top}%;width:${sz}px;height:${sz}px;--dur:${dur}s;--del:${del}s;--sc:${sc}"></span>`;
 }

 // Пантеон Титанів: античні золоті колони, небесні промені світла, золоті іскри та пір'їни
 const pantheonSvg = `<svg class="pantheon-bg" viewBox="0 0 1200 700" preserveAspectRatio="none">
  <defs>
   <linearGradient id="panColG" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="#fde68a" stop-opacity="0.28"/>
    <stop offset="45%" stop-color="#fef3c7" stop-opacity="0.52"/>
    <stop offset="100%" stop-color="#b45309" stop-opacity="0.32"/>
   </linearGradient>
  </defs>
  <g fill="url(#panColG)" stroke="#fde047" stroke-width="1.2" stroke-opacity="0.45">
   <rect x="48" y="70" width="42" height="550" rx="4"/>
   <rect x="34" y="54" width="70" height="18" rx="4"/>
   <rect x="34" y="618" width="70" height="22" rx="4"/>
   <rect x="135" y="110" width="32" height="510" rx="4" opacity="0.65"/>
   <rect x="125" y="96" width="52" height="15" rx="3" opacity="0.65"/>
   <rect x="1110" y="70" width="42" height="550" rx="4"/>
   <rect x="1096" y="54" width="70" height="18" rx="4"/>
   <rect x="1096" y="618" width="70" height="22" rx="4"/>
   <rect x="1033" y="110" width="32" height="510" rx="4" opacity="0.65"/>
   <rect x="1023" y="96" width="52" height="15" rx="3" opacity="0.65"/>
  </g>
 </svg>`;
 let featherHtml = "";
 for (let i = 0; i < 24; i++) {
  const left = (3 + Math.random() * 94).toFixed(1);
  const top = (6 + Math.random() * 84).toFixed(1);
  const sz = (10 + Math.random() * 12).toFixed(0);
  const dur = (6 + Math.random() * 6).toFixed(2);
  const del = (-Math.random() * 7).toFixed(2);
  const drift = ((Math.random() - 0.5) * 95).toFixed(0);
  const isFeather = i % 2 === 0;
  featherHtml += isFeather
   ? `<span class="ar-feather" style="left:${left}%;top:${top}%;width:${sz}px;height:${sz}px;--dur:${dur}s;--del:${del}s;--drift:${drift}px"><svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M20 4C12 5 6 11 4 20c5-1 11-5 14-12-2 1-4 1-6 1 3-2 6-4 8-5z" fill="#fef08a" opacity="0.75"/></svg></span>`
   : `<span class="ar-panspark" style="left:${left}%;top:${top}%;width:${(sz * 0.45).toFixed(1)}px;height:${(sz * 0.45).toFixed(1)}px;--dur:${dur}s;--del:${del}s;--drift:${drift}px"></span>`;
 }

 bg.innerHTML = `
 <div class="ar-layer ar-frost">${tundraSvg}${snowHtml}</div>
 <div class="ar-layer ar-forest">${forestSvg}<div class="forest-mist"></div>${qHtml}</div>
 <div class="ar-layer ar-swamp">${swampSvg}<div class="swamp-mist"></div>${fireflyHtml}${sbubHtml}</div>
 <div class="ar-layer ar-colosseum">${colosseumSvg}${petalHtml}</div>
 <div class="ar-layer ar-mirror">${mshardHtml}</div>
 <div class="ar-layer ar-forge"><div class="forge-smoke"></div>${emberHtml}</div>
 <div class="ar-layer ar-eclipse"><div class="ec-day"><div class="sun-rays"></div>${sunDustHtml}</div><div class="ec-night"><div class="night-mist"></div>${starHtml}</div></div>
 <div class="ar-layer ar-pantheon">${pantheonSvg}<div class="pantheon-rays"></div><div class="pantheon-clouds"></div>${featherHtml}</div>
 <div class="ar-layer ar-astral"><div class="astral-nebula"></div>${astStarHtml}</div>
 `;
}

function applyArena(arena) {
 initArenaBg();
 CUR_ARENA = arena;
 document.body.classList.remove("arena-permafrost", "arena-forest", "arena-swamp", "arena-colosseum", "arena-mirror", "arena-forge", "arena-eclipse", "arena-pantheon", "arena-astral", "phase-day", "phase-night", "ast-r0", "ast-r1", "ast-r2", "ast-r3", "ast-r4");
 const pill = $("arena-pill");
 if (!arena) {
 if (pill) { pill.className = ""; pill.textContent = ""; }
 return;
 }
 document.body.classList.add("arena-" + arena.id);
 if (arena.id === "eclipse" && typeof setEclipsePhase === "function") {
 setEclipsePhase("day", 1);
 } else if (arena.id === "astral" && typeof setAstralRarity === "function") {
 setAstralRarity(0, false);
 } else if (pill) {
 pill.className = "show " + arena.id;
 pill.innerHTML = `<span>${arena.icon}</span><span>${arena.name}</span><span style="opacity:.75">· ${arena.shortRule}</span>`;
 pill.title = `Арена «${arena.name}»: ${arena.rule}`;
 }
}

function reforgeAnvilFx(pIdx, cardIdx, newCard) {
 const C = seatC(pIdx);
 snd("anvil");
 shock(C.x, C.y, "#fb923c", 160);
 ring(C.x, C.y, "#fde047", 120);
 sparkBurst(C.x, C.y, ["#fef08a", "#fb923c", "#ef4444", "#ffffff"], 26, 125);
 pop(pIdx, newCard.b ? "ЗАГАРТОВАНО +8!" : `ПЕРЕКОВАНО: ${R[newCard.r].n.toUpperCase()}!`, "#fde047");
 if (pIdx === 0) {
 renderHand();
 const cardDom = $("hand") && $("hand").children[cardIdx];
 if (cardDom) {
  const r = cardDom.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  sparkBurst(cx, cy, ["#fef08a", "#fb923c", "#ffffff"], 24, 110);
  if (cardDom.animate) {
   cardDom.animate([
    { transform: "scale(1.25) rotate(-6deg)", filter: "brightness(2.4) drop-shadow(0 0 22px #fb923c)" },
    { transform: "scale(1) rotate(0deg)", filter: "brightness(1)" }
   ], { duration: 420, easing: "ease-out" });
  }
 }
 }
}

async function announceArenaIntro(arena, myGame) {
 const el = $("arena-announce");
 const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
 if (!el || !arena || reduce) return;
 el.style.background = arena.bg;
 el.style.color = arena.col;
 el.innerHTML = `
 <div class="aa-tag">АРЕНА БИТВИ</div>
 <div class="aa-ico">${arena.icon}</div>
 <div class="aa-title">${arena.name}</div>
 <div class="aa-rule">${arena.rule}</div>
 `;
 el.style.display = "flex";
 snd(arena.id === "permafrost" ? "ice" : "swap");
 if (el.animate) {
 await el.animate([
 { opacity: 0, transform: "scale(0.9)" },
 { opacity: 1, transform: "scale(1.02)", offset: 0.18 },
 { opacity: 1, transform: "scale(1)", offset: 0.8 },
 { opacity: 0, transform: "scale(1.06)" }
 ], { duration: 1550, easing: "ease-out" }).finished.catch(() => {});
 } else {
 await sl(1400);
 }
 if (myGame === gameId) el.style.display = "none";
}

function orb(x, y, col) {
 const elA = $("p" + x), elB = $("p" + y);
 if (!elA || !elB) return Promise.resolve();
 const A = elA.getBoundingClientRect(), B = elB.getBoundingClientRect();
 const o = document.createElement("div");
 o.className = "pt";
 o.style.cssText = `width:24px;height:24px;border-radius:50%;background:radial-gradient(${col},transparent 70%);box-shadow:0 0 22px ${col};left:${A.left + A.width / 2 - 12}px;top:${A.top + A.height / 2 - 12}px`;
 document.body.appendChild(o);
 if (!o.animate) { o.remove(); return sl(300); }
 return o.animate([
 { transform: "scale(.5)" },
 { transform: `translate(${B.left - A.left}px,${B.top - A.top}px) scale(1.4)` }
 ], { duration: 400, easing: "ease-in" }).finished.then(() => o.remove()).catch(() => o.remove());
}

// УНІКАЛЬНІ АНІМАЦІЇ ДЛЯ ВСІХ СПЕЦКАРТ

function ultFx(type) {
 const data = ULT_DATA[type];
 if (!data) return Promise.resolve();
 const d = document.createElement("div");
 d.className = "ult-ov";
 d.style.background = `radial-gradient(circle, ${data.bg} 0%, rgba(10,5,25,0.92) 65%, #020108 100%)`;
 d.style.color = data.col;
 d.innerHTML = `${SVG_IC[type]}<b>${data.name}</b><span>${data.desc}</span>`;
 snd(data.s);
 document.body.appendChild(d);
 if (!d.animate) { setTimeout(() => d.remove(), 1100); return sl(1100); }
 return d.animate([
 { opacity: 0, transform: "scale(0.85)" },
 { opacity: 1, transform: "scale(1.03)", offset: 0.22 },
 { opacity: 1, transform: "scale(1)", offset: 0.8 },
 { opacity: 0, transform: "scale(1.12)" }
 ], { duration: 1100, easing: "ease-out" }).finished.then(() => d.remove()).catch(() => d.remove());
}


// ===== САТАНЯ: ЗАСІДКА, УКУС, ВАМПІРИЗМ (ultFx("v")) =====
const SAT_JAW_TOP = `<svg viewBox="0 0 200 120" width="100%" height="100%" style="overflow:visible;display:block"><defs><linearGradient id="vFangGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fda4af" stop-opacity="0.9"/><stop offset="35%" stop-color="#f43f5e" stop-opacity="0.6"/><stop offset="100%" stop-color="#881337" stop-opacity="0.85"/></linearGradient><filter id="neonRedGlow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="glow"/><feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g filter="url(#neonRedGlow)" stroke="#ff2a55" stroke-width="1.8" stroke-linejoin="round"><path d="M 28 20 C 26 50 32 80 44 110 C 47 75 52 50 56 25 Z" fill="url(#vFangGrad)"/><path d="M 58 24 C 60 48 76 48 78 24 Z" fill="url(#vFangGrad)"/><path d="M 80 23 C 82 50 98 50 100 23 Z" fill="url(#vFangGrad)"/><path d="M 102 23 C 104 50 120 50 122 23 Z" fill="url(#vFangGrad)"/><path d="M 124 24 C 126 48 142 48 144 24 Z" fill="url(#vFangGrad)"/><path d="M 146 25 C 150 50 155 75 158 110 C 170 80 176 50 174 20 Z" fill="url(#vFangGrad)"/><path d="M 44 110 Q 42 125 45 132 Q 47 125 45 112" fill="#ef4444" stroke="#dc2626" stroke-width="1"/><path d="M 158 110 Q 160 128 157 135 Q 155 127 157 112" fill="#ef4444" stroke="#dc2626" stroke-width="1"/></g></svg>`;
const SAT_JAW_BOT = `<svg viewBox="0 0 180 100" width="100%" height="100%" style="overflow:visible;display:block"><g filter="url(#neonRedGlow)" stroke="#ff2a55" stroke-width="1.8" stroke-linejoin="round"><path d="M 26 80 C 30 55 35 35 40 10 C 44 35 48 55 52 80 Z" fill="url(#vFangGrad)"/><path d="M 54 78 C 56 60 70 60 72 78 Z" fill="url(#vFangGrad)"/><path d="M 74 77 C 76 58 88 58 90 77 Z" fill="url(#vFangGrad)"/><path d="M 92 77 C 94 58 106 58 108 77 Z" fill="url(#vFangGrad)"/><path d="M 110 78 C 112 60 126 60 128 78 Z" fill="url(#vFangGrad)"/><path d="M 130 80 C 134 55 138 35 142 10 C 147 35 152 55 156 80 Z" fill="url(#vFangGrad)"/></g></svg>`;

async function satFx(act, def, onBite, onDrain) {
 const A = seatC(act), D = seatC(def), cx = D.x, cy = D.y;
 const wrap = document.createElement("div");
 wrap.className = "vamp-fangs-wrap";
 wrap.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;width:0;height:0;z-index:75;pointer-events:none`;
 const mk = (html, l, t, w, h, origin) => {
 const e = document.createElement("div");
 e.style.cssText = `position:absolute;left:${l}px;top:${t}px;width:${w}px;height:${h}px;opacity:0;transform-origin:${origin};filter:drop-shadow(0 0 10px #ff2a55) drop-shadow(0 0 25px #e11d48)`;
 e.innerHTML = html; wrap.appendChild(e); return e;
 };
 const top = mk(SAT_JAW_TOP, -100, -130, 200, 120, "50% 0%");
 const bot = mk(SAT_JAW_BOT, -90, 25, 180, 100, "50% 100%");
 document.body.appendChild(wrap);
 // кривава віньєтка позаду жертви
 const vig = document.createElement("div");
 vig.style.cssText = `position:fixed;inset:0;z-index:55;pointer-events:none;opacity:0;background:radial-gradient(circle at ${cx}px ${cy}px, rgba(136,19,55,0) 0, rgba(76,5,25,.35) 26%, rgba(10,0,4,.8) 75%)`;
 document.body.appendChild(vig);
 if (vig.animate) vig.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: "forwards", easing: "ease-out" });
 // 1. Поява з неону (0.30 с): паща розкривається за спиною цілі
 snd("thud");
 await Promise.all([
 an(top, [{ transform: "translateY(-20px) scale(.9)", opacity: 0 }, { transform: "translateY(-55px) scale(1.15)", opacity: .95, filter: "drop-shadow(0 0 14px #ff2a55) drop-shadow(0 0 30px #e11d48) brightness(1.4)" }], 300, { easing: "cubic-bezier(.2,.8,.3,1)" }),
 an(bot, [{ transform: "translateY(20px) scale(.9)", opacity: 0 }, { transform: "translateY(45px) scale(1.15)", opacity: .95, filter: "drop-shadow(0 0 14px #ff2a55) drop-shadow(0 0 30px #e11d48) brightness(1.4)" }], 300, { easing: "cubic-bezier(.2,.8,.3,1)" })
 ]);
 // краплі крові скапують з іклів перед ударом
 [[-56, -75], [58, -75]].forEach(([dx, dy], k) => {
 const dr = document.createElement("div");
 dr.style.cssText = `position:fixed;left:${cx + dx}px;top:${cy + dy}px;width:6px;height:10px;margin:0 0 0 -3px;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;background:#dc2626;box-shadow:0 0 8px #ff2a55;z-index:76;pointer-events:none`;
 document.body.appendChild(dr);
 an(dr, [{ transform: "translateY(0)", opacity: 1 }, { transform: "translateY(46px)", opacity: 0 }], 260 + k * 40, { easing: "ease-in" }).then(() => dr.remove());
 });
 await sl(100);
 // 2. Хижий укус (75 мс)
 await Promise.all([
 an(top, [{ transform: "translateY(-55px) scale(1.15)" }, { transform: "translateY(38px) scale(1)" }], 75, { easing: "cubic-bezier(0.9, 0, 0.15, 1)" }),
 an(bot, [{ transform: "translateY(45px) scale(1.15)" }, { transform: "translateY(-42px) scale(1)" }], 75, { easing: "cubic-bezier(0.9, 0, 0.15, 1)" })
 ]);
 snd("slice"); setTimeout(() => snd("slice"), 60);
 onBite();
 shake($("p" + def));
 shock(cx, cy, "#ff2a55", 180);
 ring(cx, cy, "#ff2a55", 110);
 sparkBurst(cx, cy, ["#dc2626", "#ff2a55", "#fda4af", "#7f1d1d"], 20, 150);
 pop(def, "ВАМПІРИЗМ", "#ff2a55");
 await sl(140);
 // 3. Витягування крові: зуби розчиняються, 3 згустки летять дугою до власника
 const dissolve = [top, bot].map(e => an(e, [{ opacity: .95 }, { opacity: 0, filter: "drop-shadow(0 0 30px #881337) blur(10px)" }], 200, { easing: "ease-in" }));
 if (vig.animate) vig.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, fill: "forwards" });
 const orbs = [0, 1, 2].map(k => new Promise(res => {
 const off = (k - 1) * 80, d0 = k * 80;
 const o = document.createElement("div");
 o.style.cssText = "position:fixed;left:0;top:0;width:20px;height:20px;margin:-10px 0 0 -10px;border-radius:50%;z-index:76;pointer-events:none;opacity:0;background:radial-gradient(circle at 35% 35%,#fff1f2,#ff2a55 40%,#881337);box-shadow:0 0 16px #ff2a55,0 0 30px #e11d48";
 document.body.appendChild(o);
 const dx = A.x - cx, dy = A.y - cy, nl = Math.hypot(dx, dy) || 1, px = -dy / nl, py = dx / nl;
 const mx = cx + dx / 2 + px * off, my = cy + dy / 2 + py * off - 60, DUR = 520;
 let t0 = null, lastT = 0;
 const step = ts => {
 if (t0 === null) t0 = ts + d0;
 const u = (ts - t0) / DUR;
 if (u < 0) { requestAnimationFrame(step); return; }
 if (u >= 1) { o.remove(); burst(act, "#22c55e"); burst(act, "#ff2a55"); res(); return; }
 const e = u * u * (3 - 2 * u), iu = 1 - e;
 const x = iu * iu * cx + 2 * iu * e * mx + e * e * A.x, y = iu * iu * cy + 2 * iu * e * my + e * e * A.y;
 o.style.opacity = 1; o.style.left = x + "px"; o.style.top = y + "px"; o.style.transform = `scale(${1 - e * .25})`;
 if (ts - lastT > 22) {
 lastT = ts;
 const tr = document.createElement("div");
 tr.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;z-index:75;pointer-events:none;background:radial-gradient(circle,#ff2a55aa,#88133700 70%);box-shadow:0 0 12px #e11d48`;
 document.body.appendChild(tr);
 an(tr, [{ opacity: .9, transform: "scale(1)" }, { opacity: 0, transform: "scale(.2)" }], 300).then(() => tr.remove());
 }
 requestAnimationFrame(step);
 };
 if (!window.requestAnimationFrame) { setTimeout(() => { o.remove(); res(); }, DUR); return; }
 requestAnimationFrame(step);
 }));
 snd("heal");
 await Promise.all([...dissolve, ...orbs]);
 wrap.remove(); vig.remove();
 onDrain();
 const C = seatC(act);
 sparkBurst(C.x, C.y, ["#22c55e", "#4ade80", "#ff2a55", "#86efac"], 24, 100);
 shock(C.x, C.y, "#4ade80", 140);
}


// ===== ХУСКАД: «ЛЮТЬ» — заряд, один удар променем, вибух (сила залежить від шкоди) =====
async function huskadFx(act, def, strike, dmg) {
 const A = seatC(act), D = seatC(def), pl = $("p" + act), pd = $("p" + def);
 const f = Math.min(1.6, 0.7 + dmg * 0.011); // 20 шкоди ≈ 0.9, 80 шкоди ≈ 1.6
 const fa = (e, fr, o) => e.animate ? e.animate(fr, Object.assign({ fill: "forwards" }, o)).finished.catch(() => {}) : sl(o.duration || 0);
 const mk = css => { const e = document.createElement("div"); e.style.cssText = css; document.body.appendChild(e); return e; };
 // 1. Заряд (0.4 с): плашка пульсує, кільця стягуються до неї
 snd("thud"); setTimeout(() => snd("thud"), 180);
 if (pl && pl.animate) pl.animate([
 { filter: "brightness(1) drop-shadow(0 0 0px #ef4444)" },
 { filter: `brightness(1.35) drop-shadow(0 0 ${14 * f}px #ef4444)`, offset: .3 },
 { filter: `brightness(1.1) drop-shadow(0 0 ${6 * f}px #ef4444)`, offset: .5 },
 { filter: `brightness(1.5) drop-shadow(0 0 ${20 * f}px #ef4444)` }
 ], { duration: 400 });
 [0, 120, 240].forEach(t => setTimeout(() => {
 const r = mk(`position:fixed;left:${A.x - 70}px;top:${A.y - 70}px;width:140px;height:140px;border-radius:50%;border:${2 + f}px solid #ef4444;box-shadow:0 0 14px #ef4444, inset 0 0 14px #ef444488;z-index:70;pointer-events:none;opacity:0`);
 fa(r, [{ transform: "scale(2.1)", opacity: 0 }, { transform: "scale(1.5)", opacity: .9, offset: .4 }, { transform: "scale(.55)", opacity: 0 }], { duration: 300, easing: "ease-in" }).then(() => r.remove());
 }, t));
 await sl(400);
 // 2. Удар: один прямий багряний промінь від власника до цілі
 const dx = D.x - A.x, dy = D.y - A.y, len = Math.hypot(dx, dy), ang = Math.atan2(dy, dx) * 180 / Math.PI, th = 8 + 8 * f;
 const beam = mk(`position:fixed;left:${A.x}px;top:${A.y - th / 2}px;width:${len}px;height:${th}px;transform-origin:0 50%;transform:rotate(${ang}deg) scaleX(0);z-index:72;pointer-events:none;border-radius:${th}px;background:linear-gradient(90deg,rgba(239,68,68,0),#ef4444 30%,#fff1f1);box-shadow:0 0 18px #ef4444,0 0 36px #dc2626`);
 snd("whoosh");
 await fa(beam, [{ transform: `rotate(${ang}deg) scaleX(0)` }, { transform: `rotate(${ang}deg) scaleX(1)` }], { duration: 130, easing: "cubic-bezier(.9,0,1,1)" });
 // 3. Влучання
 strike();
 snd("shatter"); snd("slice");
 shock(D.x, D.y, "#ef4444", Math.round(130 * f));
 ring(D.x, D.y, "#fecaca", Math.round(90 * f));
 sparkBurst(D.x, D.y, ["#7f1d1d", "#ef4444", "#fecaca"], 10 + Math.round(14 * f), 100 + 60 * f);
 shake(pd);
 if (f > 1.25 && typeof bigImpact === "function") bigImpact(Math.round(12 * f));
 await fa(beam, [{ opacity: 1 }, { opacity: 0 }], { duration: 220 });
 beam.remove();
 await sl(120);
}

// ===== НОВІ КАРТИ: Ікло Фафніра (j), Кайдани Фантома (l), Мімікрія (c) =====
// Ікло Фафніра (j): анатомічне вигнуте драконяче ікло з кістяною емаллю, коренем у лусці та краплею отрути
SVG_IC.j = `<svg viewBox="0 0 36 36"><defs><linearGradient id="fangBody" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fef3c7"/><stop offset=".45" stop-color="#d6d3d1"/><stop offset=".8" stop-color="#57534e"/><stop offset="1" stop-color="#1c1917"/></linearGradient><linearGradient id="fangRoot" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#581c87"/><stop offset="1" stop-color="#1e1b4b"/></linearGradient><linearGradient id="fangVenom" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fde047"/><stop offset=".5" stop-color="#a855f7"/><stop offset="1" stop-color="#ec4899"/></linearGradient></defs><path d="M5 8C7 4 13 3 17 6L10 15C6 13 4 10 5 8Z" fill="url(#fangRoot)" stroke="#c084fc" stroke-width="1"/><path d="M8 10L13 7M6.5 13L11.5 10" stroke="#e9d5ff" stroke-width=".9" stroke-linecap="round"/><path d="M16 5.5C25 10 30.5 19 31 32C22 26.5 14 19.5 9.5 14Z" fill="url(#fangBody)" stroke="#f5f5f4" stroke-width="1.1" stroke-linejoin="round"/><path d="M14 9.5C21 13.5 26.5 21 28.5 29.5" stroke="#ffffff" stroke-width="1.3" fill="none" stroke-linecap="round" opacity=".85"/><path class="ic-pulse" d="M13 12.5C19 16.5 24 22.5 26.5 28" stroke="url(#fangVenom)" stroke-width="1.6" fill="none" stroke-linecap="round"/><path class="ic-drip" d="M31 32C32.4 33.8 32.8 34.6 31 35.5C29.2 34.6 29.6 33.8 31 32Z" fill="#a855f7" stroke="#f0abfc" stroke-width=".7"/></svg>`;

// Кайдани Фантома (l): прозорий неоново-бірюзовий замок і примарні кайдани
SVG_IC.l = `<svg viewBox="0 0 36 36"><defs><linearGradient id="cyLock" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ccfbf1" stop-opacity=".85"/><stop offset=".5" stop-color="#14b8a6" stop-opacity=".55"/><stop offset="1" stop-color="#0f766e" stop-opacity=".85"/></linearGradient></defs><g class="ic-pulse" stroke="#5eead4" stroke-width="1.8" fill="none" stroke-linecap="round"><path d="M2 7l9 7M34 7l-9 7M2 29l9-7M34 29l-9-7" stroke-dasharray="3 2"/></g><path d="M12.5 15v-4a5.5 5.5 0 0 1 11 0v4" fill="none" stroke="#99f6e4" stroke-width="2.4" stroke-linecap="round"/><rect x="9" y="15" width="18" height="14.5" rx="3.5" fill="url(#cyLock)" stroke="#5eead4" stroke-width="1.5"/><g class="ic-pulse"><circle cx="18" cy="20.5" r="2.1" fill="#042f2e" stroke="#99f6e4" stroke-width="1"/><path d="M17 22h2l.6 4.2h-3.2z" fill="#042f2e" stroke="#99f6e4" stroke-width=".8"/></g></svg>`;

// Хвиля прибою (H): закручена сапфірова морська хвиля з білою піною
SVG_IC.H = `<svg class="ic-wave" viewBox="0 0 36 36"><defs><linearGradient id="wvG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#38bdf8"/><stop offset=".5" stop-color="#0284c7"/><stop offset="1" stop-color="#1e3a8a"/></linearGradient></defs><path d="M3 26C7 22 10 15 17 11C23 7.5 29 9 30 14C31 18 27 20 24 18C21 16 22 12.5 25 12C21 11 16 14 15 19C14 23 18 26 24 25C28 24.5 31 22 33 19L33 30C24 33 11 33 3 30Z" fill="url(#wvG)" stroke="#bae6fd" stroke-width="1.1" stroke-linejoin="round"/><path d="M16 10.5C21 7 28 8 30 13M11 16C13 13 16 11 20 10.5" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/><g class="ic-spark" fill="#fff"><circle cx="29" cy="8" r="1.5"/><circle cx="32.5" cy="11.5" r="1.2"/><circle cx="25" cy="6.5" r="1"/><circle cx="8" cy="21" r="1.3"/></g></svg>`;

// Праща Давида (D): шкіряна праща із затиснутим круглим річковим каменем
SVG_IC.D = `<svg viewBox="0 0 36 36"><defs><radialGradient id="slRock" cx=".38" cy=".35" r=".7"><stop offset="0" stop-color="#e2e8f0"/><stop offset=".5" stop-color="#94a3b8"/><stop offset="1" stop-color="#334155"/></radialGradient><linearGradient id="slLth" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d97706"/><stop offset="1" stop-color="#78350f"/></linearGradient></defs><path d="M6 31C10 23 13 17 16 13M30 31C26 23 23 17 20 13" stroke="#92400e" stroke-width="2.2" fill="none" stroke-linecap="round"/><g class="ic-float"><path d="M11 16C14 21 22 21 25 16C23 22 13 22 11 16Z" fill="url(#slLth)" stroke="#fde68a" stroke-width=".9"/><circle cx="18" cy="12.5" r="6.2" fill="url(#slRock)" stroke="#f8fafc" stroke-width="1"/><path d="M15.5 10.5C16.5 9.5 18 9.2 19.5 9.8" stroke="#fff" stroke-width="1.1" fill="none" stroke-linecap="round" opacity=".8"/></g><g class="ic-spark" stroke="#fbbf24" stroke-width="1.2" stroke-linecap="round"><path d="M7 9l3 1.5M29 9l-3 1.5M18 3v2.5"/></g></svg>`;

// Смола Аїда (A): чорна в'язка крапля смоли з фіолетовим димом
SVG_IC.A = `<svg viewBox="0 0 36 36"><defs><radialGradient id="tarG" cx=".35" cy=".35" r=".75"><stop offset="0" stop-color="#52525b"/><stop offset=".45" stop-color="#18181b"/><stop offset="1" stop-color="#09090b"/></radialGradient></defs><g class="ic-smoke" fill="none" stroke="#c084fc" stroke-width="1.5" stroke-linecap="round" opacity=".85"><path d="M11 11C9 8 13 6 11 3"/><path d="M25 12C27 9 23 6 25 3"/><path d="M18 8C16 5 20 3 18 1"/></g><path d="M18 6C13 13 8 18 8 24.5A10 10 0 0 0 28 24.5C28 18 23 13 18 6Z" fill="url(#tarG)" stroke="#a855f7" stroke-width="1.4" stroke-linejoin="round"/><path d="M13 21C12 24 13.5 27 16 28" stroke="#e9d5ff" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".75"/><circle class="ic-pulse" cx="22" cy="25" r="1.4" fill="#c084fc" opacity=".8"/></svg>`;

// Лезо Хаоса (C): розколотий обсидіановий клинок із трьох нестабільних уламків та фіолетовою енергією
SVG_IC.C = `<svg class="chaos-svg" viewBox="0 0 36 36"><defs><linearGradient id="blade_chaos" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e9d5ff"/><stop offset="30%" stop-color="#4c1d95"/><stop offset="70%" stop-color="#1e1b4b"/><stop offset="100%" stop-color="#09090b"/></linearGradient><radialGradient id="core_chaos" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#e9d5ff" stop-opacity="0.95"/><stop offset="55%" stop-color="#9461c9" stop-opacity="0.65"/><stop offset="100%" stop-color="#2e1065" stop-opacity="0"/></radialGradient></defs><circle cx="18" cy="18" r="14" fill="url(#core_chaos)"/><g class="ch-top"><polygon points="28,4 21,9 24,14 29,11" fill="url(#blade_chaos)" stroke="#e9d5ff" stroke-width="0.9" stroke-linejoin="round"/><line x1="27.5" y1="5" x2="23" y2="11" stroke="#f8fafc" stroke-width="0.8" opacity="0.85"/></g><g class="ch-mid"><polygon points="20,11 13,17 16,22 23,16" fill="url(#blade_chaos)" stroke="#9461c9" stroke-width="1" stroke-linejoin="round"/><line x1="19.5" y1="12" x2="14.5" y2="18.5" stroke="#e9d5ff" stroke-width="0.8" opacity="0.8"/></g><g class="ch-bot"><polygon points="12,19 7,25 10,27 14,23" fill="url(#blade_chaos)" stroke="#9461c9" stroke-width="0.9" stroke-linejoin="round"/><path d="M5,24 L13,31 M7.5,27.5 L4,31" stroke="#9461c9" stroke-width="2" stroke-linecap="round"/><circle cx="4" cy="31" r="1.5" fill="#e9d5ff"/></g><g class="ch-arc" fill="none" stroke="#e9d5ff" stroke-width="1.1" stroke-linecap="round"><path d="M19,9 L21,12 L18,14"/><path d="M13,16 L15,19 L12,21"/><circle cx="25" cy="15" r="0.9" fill="#e9d5ff" stroke="none"/><circle cx="11" cy="14" r="0.8" fill="#9461c9" stroke="none"/><circle cx="22" cy="22" r="0.8" fill="#e9d5ff" stroke="none"/></g></svg>`;

// Камінь Сизифа (S): грубий круглий валун з тріщинами, стрілка вгору та перекреслений схил
SVG_IC.S = `<svg class="sisyphus-svg" viewBox="0 0 36 36"><defs><radialGradient id="sis_rock_g" cx="38%" cy="35%" r="65%"><stop offset="0%" stop-color="#94a3b8"/><stop offset="55%" stop-color="#475569"/><stop offset="100%" stop-color="#1e293b"/></radialGradient></defs><line x1="4" y1="31" x2="32" y2="19" stroke="#64748b" stroke-width="2" stroke-linecap="round"/><line x1="15" y1="22" x2="21" y2="29" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/><path d="M11 11V4M8 7l3-3 3 3" fill="none" stroke="#4ade80" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><g class="sis-rock"><circle cx="19" cy="17" r="9.5" fill="url(#sis_rock_g)" stroke="#cbd5e1" stroke-width="1.2"/><path d="M14 13l4 3-2 4M22 12l-2 4 3 3" fill="none" stroke="#0f172a" stroke-width="1.2" stroke-linecap="round"/></g></svg>`;

// Жало Скорпіона (P): вигнутий хвіст із жалом та зеленою краплею отрути
SVG_IC.P = `<svg class="scorp-svg" viewBox="0 0 36 36"><defs><linearGradient id="scorp_g" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stop-color="#1e3a8a"/><stop offset="55%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#93c5fd"/></linearGradient></defs><g class="sc-tail"><path d="M8 31C5 25 6 16 12 11C17 7 24 7 27 11C29 14 27 18 23 17C20 16 20 13 22 12" fill="none" stroke="url(#scorp_g)" stroke-width="4.5" stroke-linecap="round"/><path d="M22 12L28 8L24 15Z" fill="#e0f2fe" stroke="#38bdf8" stroke-width="0.8"/></g><circle class="sc-drop" cx="28" cy="13" r="2" fill="#4ade80"/></svg>`;

// Фіал Асклепія (F): скляний фіал із обвитою змією та світло-зеленою рідиною
SVG_IC.F = `<svg class="asclep-svg" viewBox="0 0 36 36"><defs><linearGradient id="asc_liq" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#86efac"/><stop offset="100%" stop-color="#16a34a"/></linearGradient></defs><rect x="14" y="4" width="8" height="4" rx="1.5" fill="#d97706" stroke="#fde68a" stroke-width="0.8"/><path d="M13 8h10l3 8v12a5 5 0 0 1-5 5h-6a5 5 0 0 1-5-5V16l3-8z" fill="rgba(186,230,253,0.18)" stroke="#bae6fd" stroke-width="1.4"/><path d="M11 20h14v8a4 4 0 0 1-4 4h-6a4 4 0 0 1-4-4v-8z" fill="url(#asc_liq)"/><path class="asc-snake" d="M10 27C7 24 29 22 25 18C21 15 10 14 14 10" fill="none" stroke="#fde047" stroke-width="2" stroke-linecap="round"/><circle cx="14" cy="10" r="1.6" fill="#fde047"/></svg>`;

// Панцир Черепахи (T): овальний панцир із шестикутними пластинами
SVG_IC.T = `<svg class="turtle-svg" viewBox="0 0 36 36"><defs><radialGradient id="turt_g" cx="45%" cy="40%" r="60%"><stop offset="0%" stop-color="#38bdf8"/><stop offset="65%" stop-color="#0369a1"/><stop offset="100%" stop-color="#0c4a6e"/></radialGradient></defs><ellipse cx="18" cy="18" rx="12.5" ry="14.5" fill="url(#turt_g)" stroke="#bae6fd" stroke-width="1.6"/><polygon points="18,10.5 23.5,13.8 23.5,20.2 18,23.5 12.5,20.2 12.5,13.8" fill="none" stroke="#e0f2fe" stroke-width="1.2"/><path d="M18 3.5v7M18 23.5v9M6.5 13l6 2M29.5 13l-6 2M6.5 23l6-2M29.5 23l-6-2" stroke="#bae6fd" stroke-width="1.1"/></svg>`;

// Батіг Фурії (W): батіг із трьома хвостами та іскрами
SVG_IC.W = `<svg class="fury-svg" viewBox="0 0 36 36"><rect x="5" y="25" width="4" height="8" rx="1.5" transform="rotate(35 7 29)" fill="#78350f" stroke="#fbbf24" stroke-width="0.8"/><g class="fur-whip" fill="none" stroke-linecap="round"><path d="M9 25C14 16 11 9 21 5" stroke="#c084fc" stroke-width="2.2"/><path d="M10 26C19 20 18 12 29 10" stroke="#9461c9" stroke-width="2.2"/><path d="M11 27C21 25 23 19 32 18" stroke="#7e22ce" stroke-width="2.2"/><circle class="fur-tip" cx="21" cy="5" r="1.8" fill="#fde047"/><circle class="fur-tip" cx="29" cy="10" r="1.8" fill="#fde047"/><circle class="fur-tip" cx="32" cy="18" r="1.8" fill="#fde047"/></g></svg>`;

// Колісниця Геліоса (G): колісниця з двома колесами і сонячним диском з променями
SVG_IC.G = `<svg class="helios-svg" viewBox="0 0 36 36"><defs><radialGradient id="hel_sun" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fef08a"/><stop offset="65%" stop-color="#f97316"/><stop offset="100%" stop-color="#dc2626"/></radialGradient></defs><circle cx="18" cy="11" r="6" fill="url(#hel_sun)" stroke="#fffbeb" stroke-width="1"/><g stroke="#fde047" stroke-width="1.4" stroke-linecap="round"><line x1="18" y1="2" x2="18" y2="4"/><line x1="10" y1="5" x2="12" y2="7"/><line x1="26" y1="5" x2="24" y2="7"/><line x1="8" y1="11" x2="10" y2="11"/><line x1="28" y1="11" x2="26" y2="11"/></g><path d="M7 18h18l4 7H9z" fill="#b91c1c" stroke="#fbbf24" stroke-width="1.3" stroke-linejoin="round"/><g class="hel-w1"><circle cx="12" cy="28" r="5" fill="#1e293b" stroke="#fbbf24" stroke-width="1.6"/><line x1="12" y1="23" x2="12" y2="33" stroke="#fbbf24" stroke-width="1"/><line x1="7" y1="28" x2="17" y2="28" stroke="#fbbf24" stroke-width="1"/></g><g class="hel-w2"><circle cx="24" cy="28" r="5" fill="#1e293b" stroke="#fbbf24" stroke-width="1.6"/><line x1="24" y1="23" x2="24" y2="33" stroke="#fbbf24" stroke-width="1"/><line x1="19" y1="28" x2="29" y2="28" stroke="#fbbf24" stroke-width="1"/></g></svg>`;

// Спис Ахілла (L): довгий спис із гострим наконечником і бронзовою обробкою
SVG_IC.L = `<svg class="achilles-svg" viewBox="0 0 36 36"><defs><linearGradient id="ach_tip" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stop-color="#b45309"/><stop offset="50%" stop-color="#fbbf24"/><stop offset="100%" stop-color="#ffffff"/></linearGradient></defs><line x1="5" y1="31" x2="24" y2="12" stroke="#78350f" stroke-width="2.6" stroke-linecap="round"/><rect x="20" y="12" width="4" height="4" transform="rotate(45 22 14)" fill="#d97706" stroke="#fef3c7" stroke-width="0.7"/><polygon points="33,3 21,10 26,15" fill="url(#ach_tip)" stroke="#fef08a" stroke-width="0.9" stroke-linejoin="round"/><line class="ach-glint" x1="31" y1="5" x2="24" y2="12" stroke="#ffffff" stroke-width="1.3" stroke-linecap="round"/></svg>`;

// Прокляття Ереба (E): чорна темна воронка з перевернутим серцем усередині
SVG_IC.E = `<svg class="erebus-svg" viewBox="0 0 36 36"><defs><radialGradient id="ere_bg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#09090b"/><stop offset="60%" stop-color="#3b0764"/><stop offset="100%" stop-color="#9333ea" stop-opacity="0"/></radialGradient></defs><circle cx="18" cy="18" r="16" fill="url(#ere_bg)"/><g class="ere-vort" fill="none" stroke="#a855f7" stroke-width="1.5" stroke-linecap="round"><path d="M18 4a14 14 0 0 1 14 14"/><path d="M32 18a14 14 0 0 1-14 14"/><path d="M18 32A14 14 0 0 1 4 18"/><path d="M4 18A14 14 0 0 1 18 4" stroke-dasharray="4 3"/></g><g class="ere-heart"><path d="M18 11c-4 3.5-7 6.5-7 10a4 4 0 0 0 7 2.5A4 4 0 0 0 25 21c0-3.5-3-6.5-7-10z" fill="#18181b" stroke="#f43f5e" stroke-width="1.5"/></g></svg>`;

// Чаша Геби (B): золота чаша з краплями та іскрою на дні
SVG_IC.B = `<svg class="hebe-svg" viewBox="0 0 36 36"><defs><linearGradient id="heb_gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fef08a"/><stop offset="50%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#92400e"/></linearGradient></defs><path d="M9 12h18c0 7-4 11-9 11s-9-4-9-11z" fill="url(#heb_gold)" stroke="#fffbeb" stroke-width="1.2"/><rect x="16.5" y="23" width="3" height="6" fill="#d97706"/><path d="M11 31h14l-2-2H13z" fill="url(#heb_gold)" stroke="#fffbeb" stroke-width="0.8"/><circle cx="18" cy="17" r="2.2" fill="#4ade80"/><circle class="heb-drop" cx="15" cy="7" r="1.4" fill="#86efac"/><circle class="heb-drop" cx="21" cy="5" r="1.2" fill="#fde047"/></svg>`;

// Кров Титана (K): крапля крові з тріщинами і титановим відблиском
SVG_IC.K = `<svg class="titan-svg" viewBox="0 0 36 36"><defs><radialGradient id="tit_g" cx="38%" cy="38%" r="65%"><stop offset="0%" stop-color="#fca5a5"/><stop offset="45%" stop-color="#dc2626"/><stop offset="100%" stop-color="#450a0a"/></radialGradient></defs><g class="tit-drop"><path d="M18 4C12 13 8 18 8 24a10 10 0 0 0 20 0c0-6-4-11-10-20z" fill="url(#tit_g)" stroke="#fecaca" stroke-width="1.4"/><path d="M14 20l4 3-2 5M21 18l-2 4 3 3" fill="none" stroke="#fef08a" stroke-width="1.1" stroke-linecap="round"/><path d="M13 18c-1 2.5-1 5 0 7" fill="none" stroke="#ffffff" stroke-width="1.4" stroke-linecap="round" opacity="0.8"/></g></svg>`;

// Терези Немезиди (N): класичні терези з золотою та сріблястою чашами
SVG_IC.N = `<svg class="nemesis-svg" viewBox="0 0 36 36"><rect x="16.8" y="6" width="2.4" height="24" rx="1" fill="#fbbf24"/><path d="M11 32h14l-2-2H13z" fill="#d97706" stroke="#fef3c7" stroke-width="0.8"/><circle cx="18" cy="6" r="2.2" fill="#fffbeb" stroke="#f59e0b" stroke-width="1"/><g class="nem-beam"><line x1="6" y1="11" x2="30" y2="11" stroke="#fde047" stroke-width="2" stroke-linecap="round"/><path d="M6 11L3 20h6zM30 11l-3 9h6z" fill="none" stroke="#cbd5e1" stroke-width="1"/><path d="M2 20h8a4 4 0 0 1-8 0z" fill="#fbbf24" stroke="#fffbeb" stroke-width="0.8"/><path d="M26 20h8a4 4 0 0 1-8 0z" fill="#cbd5e1" stroke="#f8fafc" stroke-width="0.8"/></g></svg>`;

// Анімація «Хвиля прибою» (H) — Варіант 1: Океанічний Вир / Водяний Торнадо (процедурні спіралі + 38 бульбашок без розтягування картинок)
async function waveSurfFx(act, isTide, onHeal) {
 const C = seatC(act), pl = $("p" + act);
 const W = 152, H = 164;
 const box = document.createElement("div");
 box.style.cssText = `position:fixed;left:${C.x - W / 2}px;top:${C.y - H / 2}px;width:${W}px;height:${H}px;z-index:73;pointer-events:none;filter:drop-shadow(0 0 14px #38bdf8) drop-shadow(0 0 26px #0284c7)`;
 // Генеруємо 4 процедурні спіральні струмені води, які закручуються знизу вгору навколо медальйона
 let streams = "";
 const cols = ["#e0f2fe", "#7dd3fc", "#38bdf8", "#0284c7"];
 for (let s = 0; s < 4; s++) {
 let d = "";
 const ph = s * (Math.PI / 2);
 for (let j = 0; j <= 44; j++) {
 const u = j / 44;
 const ang = ph + u * Math.PI * 3.4;
 const rad = (54 * (1 - u * 0.42)) + Math.sin(u * 12 + s) * 5;
 const x = W / 2 + Math.cos(ang) * rad;
 const y = (H - 18) - u * (H - 36) + Math.sin(ang) * 14 * (1 - u * 0.5);
 d += (j ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
 }
 const sw = isTide ? (5.2 - s * 0.7) : (4.2 - s * 0.6);
 streams += `<path class="wv-st" data-s="${s}" pathLength="1" stroke-dasharray="0.38 1" stroke-dashoffset="1" d="${d}" fill="none" stroke="${cols[s]}" stroke-width="${sw}" stroke-linecap="round"/>`;
 }
 box.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="overflow:visible">${streams}</svg>`;
 document.body.appendChild(box);
 snd("heal");

 // Анімуємо пробіг водяних струменів по спіралі вгору
 const pathAnims = Array.from(box.querySelectorAll(".wv-st")).map(p => {
 const s = +p.dataset.s;
 return p.animate ? p.animate([
 { strokeDashoffset: 1, opacity: 0.2 },
 { strokeDashoffset: 0.35, opacity: 1, offset: 0.45 },
 { strokeDashoffset: -0.45, opacity: 0 }
 ], { duration: 680, delay: s * 45, easing: "cubic-bezier(.22,.8,.32,1)", fill: "forwards" }).finished.catch(() => {}) : sl(680);
 });

 // Одночасно випускаємо густий висхідний потік із бульбашок і морської піни
 const bCount = isTide ? 40 : 28;
 for (let k = 0; k < bCount; k++) {
 const b = document.createElement("div");
 const sz = 4 + Math.random() * (isTide ? 10 : 7);
 const startX = C.x + (Math.random() - 0.5) * 92;
 const startY = C.y + 42 + Math.random() * 26;
 const sway = (Math.random() - 0.5) * 65;
 const lift = -(85 + Math.random() * 75);
 const isFoam = k % 3 === 0;
 b.style.cssText = `position:fixed;left:${startX - sz / 2}px;top:${startY - sz / 2}px;width:${sz}px;height:${sz}px;border-radius:50%;pointer-events:none;z-index:74;background:${isFoam ? "radial-gradient(circle,#fff,#bae6fd 70%,transparent)" : "radial-gradient(circle at 30% 30%,#fff,#7dd3fc 35%,#0284c7 80%,transparent)"};border:${isFoam ? "none" : "1px solid rgba(224,242,254,0.75)"};box-shadow:0 0 8px #38bdf8`;
 document.body.appendChild(b);
 an(b, [
 { transform: "translate(0,0) scale(0.3)", opacity: 0 },
 { transform: `translate(${sway * 0.5}px,${lift * 0.55}px) scale(1.1)`, opacity: 0.95, offset: 0.45 },
 { transform: `translate(${sway}px,${lift}px) scale(0.2)`, opacity: 0 }
 ], 520 + Math.random() * 280, { delay: Math.random() * 180, easing: "ease-out" }).then(() => b.remove());
 }

 await sl(340);
 onHeal();
 shock(C.x, C.y, isTide ? "#38bdf8" : "#4ade80", isTide ? 195 : 140);
 ring(C.x, C.y, "#bae6fd", isTide ? 150 : 110);
 if (isTide) {
 ring(C.x, C.y, "#0284c7", 185);
 sparkBurst(C.x, C.y, ["#ffffff", "#bae6fd", "#38bdf8", "#2dd4bf"], 30, 125);
 }
 if (pl && pl.animate) {
 pl.animate([
 { filter: "brightness(1) drop-shadow(0 0 0px #38bdf8)" },
 { filter: `brightness(1.28) drop-shadow(0 0 ${isTide ? 22 : 14}px #38bdf8)` },
 { filter: "brightness(1) drop-shadow(0 0 0px #38bdf8)" }
 ], { duration: 540, easing: "ease-out" });
 }
 await Promise.all(pathAnims);
 box.remove();
}

// Анімація «Праща Давида» (D): розкрут пращі та стрімкий постріл каменем
async function slingShotFx(act, def, isBonus, onHit) {
 const A = seatC(act), D = seatC(def);
 const dx = D.x - A.x, dy = D.y - A.y;
 const slg = fxBox(SVG_IC.D, 86, A.x, A.y);
 slg.style.zIndex = 72;
 slg.style.filter = isBonus ? "drop-shadow(0 0 16px #fbbf24)" : "drop-shadow(0 0 10px #94a3b8)";
 snd("throw");
 // Розкрут пращі на місці
 await an(slg, [
 { transform: "scale(.6) rotate(0deg)", opacity: 0 },
 { transform: "scale(1.1) rotate(360deg)", opacity: 1, offset: .5 },
 { transform: "scale(1.2) rotate(720deg)", opacity: 1 }
 ], 320, { easing: "ease-in" });
 slg.remove();
 // Політ річкового каменя
 const rock = document.createElement("div");
 const sz = isBonus ? 28 : 22;
 rock.style.cssText = `position:fixed;left:${A.x - sz / 2}px;top:${A.y - sz / 2}px;width:${sz}px;height:${sz}px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#f8fafc,#94a3b8 55%,#334155);border:2px solid ${isBonus ? "#fde047" : "#e2e8f0"};box-shadow:0 0 ${isBonus ? 22 : 12}px ${isBonus ? "#fbbf24" : "#94a3b8"};z-index:73;pointer-events:none`;
 document.body.appendChild(rock);
 const stop = trail(rock, isBonus ? "#fbbf24" : "#94a3b8");
 await an(rock, [
 { transform: "translate(0,0) scale(.8) rotate(0deg)" },
 { transform: `translate(${dx}px,${dy}px) scale(${isBonus ? 1.35 : 1.1}) rotate(540deg)` }
 ], 210, { easing: "cubic-bezier(.2,.8,.4,1)" });
 stop(); rock.remove();
 snd("hit", isBonus ? 30 : 18);
 if (isBonus) snd("shatter");
 onHit();
 shake($("p" + def));
 shock(D.x, D.y, isBonus ? "#fbbf24" : "#94a3b8", isBonus ? 175 : 130);
 sparkBurst(D.x, D.y, isBonus ? ["#fde047", "#fbbf24", "#ffffff", "#cbd5e1"] : ["#f8fafc", "#94a3b8", "#64748b"], isBonus ? 26 : 16, isBonus ? 130 : 90);
 if (isBonus) pop(def, "КРИТ −22!", "#fde047");
}

// Анімація «Смола Аїда» (A) — Варіант 3: Розрив Обсидіанової Сфери (жива куля рідкої темряви з димовим шлейфом + вибух на 25 чорно-неонових крапель + масляна плівка й осідання плашки)
async function pitchTarFx(act, def, onHit) {
 const A = seatC(act), D = seatC(def), pd = $("p" + def);
 const dx = D.x - A.x, dy = D.y - A.y;
 const dist = Math.hypot(dx, dy) || 1;
 const nx = -dy / dist, ny = dx / dist;
 const arc = 55;

 // Створюємо живу глянцеву обсидіанову сферу з неоново-фіолетовим ядром
 const orbEl = document.createElement("div");
 orbEl.style.cssText = `position:fixed;left:${A.x - 15}px;top:${A.y - 15}px;width:30px;height:30px;border-radius:50%;z-index:74;pointer-events:none;background:radial-gradient(circle at 32% 30%,#f3e8ff 0%,#c084fc 18%,#3b0764 48%,#09090b 82%);border:1.5px solid #a855f7;box-shadow:0 0 16px #a855f7,0 0 30px #581c87,inset 0 0 8px #e9d5ff`;
 document.body.appendChild(orbEl);
 snd("throw");

 // Політ по параболічній дузі з генерацією густого димово-смоляного шлейфу
 const DUR_MS = 380;
 await new Promise(res => {
 let t0 = null, lastP = 0;
 const step = now => {
 if (!t0) t0 = now;
 const u = Math.min(1, (now - t0) / DUR_MS);
 const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
 const curve = Math.sin(u * Math.PI) * arc;
 const cx = A.x + dx * e + nx * curve;
 const cy = A.y + dy * e + ny * curve;
 const sc = 0.75 + Math.sin(u * Math.PI) * 0.45;
 orbEl.style.left = (cx - 15) + "px";
 orbEl.style.top = (cy - 15) + "px";
 orbEl.style.transform = `scale(${sc.toFixed(2)})`;

 if (now - lastP > 18) {
 lastP = now;
 const sm = document.createElement("div");
 const sSz = 8 + Math.random() * 10;
 sm.style.cssText = `position:fixed;left:${cx + (Math.random() - 0.5) * 10 - sSz / 2}px;top:${cy + (Math.random() - 0.5) * 10 - sSz / 2}px;width:${sSz}px;height:${sSz}px;border-radius:50%;pointer-events:none;z-index:73;background:radial-gradient(circle,#18181b 30%,#7e22ce 70%,transparent);box-shadow:0 0 8px #a855f7`;
 document.body.appendChild(sm);
 an(sm, [
 { transform: "scale(1)", opacity: 0.85 },
 { transform: `translate(${(Math.random() - 0.5) * 22}px,${10 + Math.random() * 16}px) scale(0.2)`, opacity: 0 }
 ], 280, { easing: "ease-out" }).then(() => sm.remove());
 }
 if (u >= 1) res(); else requestAnimationFrame(step);
 };
 requestAnimationFrame(step);
 });
 orbEl.remove();

 // Імпакт: розрив обсидіанової сфери на 25 чорно-неонових крапель смоли
 snd("poison"); snd("thud");
 onHit();
 shock(D.x, D.y, "#a855f7", 170);
 ring(D.x, D.y, "#581c87", 130);

 for (let k = 0; k < 25; k++) {
 const dr = document.createElement("div");
 const w = 6 + Math.random() * 7;
 const ang = (k / 25) * Math.PI * 2 + (Math.random() - 0.5) * 0.25;
 const rad = 35 + Math.random() * 75;
 const tx = Math.cos(ang) * rad;
 const ty = Math.sin(ang) * rad + 28; // гравітаційне просідання крапель вниз
 dr.style.cssText = `position:fixed;left:${D.x - w / 2}px;top:${D.y - w / 2}px;width:${w}px;height:${w * 1.35}px;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;pointer-events:none;z-index:75;background:radial-gradient(circle at 35% 30%,#c084fc 0%,#18181b 55%,#09090b 100%);border:1px solid #a855f7;box-shadow:0 0 8px #9333ea`;
 document.body.appendChild(dr);
 an(dr, [
 { transform: "translate(0,0) scale(1.1)", opacity: 1 },
 { transform: `translate(${tx * 0.65}px,${ty * 0.5 - 12}px) scale(1)`, opacity: 0.95, offset: 0.45 },
 { transform: `translate(${tx}px,${ty + 22}px) scale(0.3)`, opacity: 0 }
 ], 480 + Math.random() * 240, { easing: "cubic-bezier(.2,.7,.3,1)" }).then(() => dr.remove());
 }

 // Масляна темна плівка з фіолетовим контуром і важке осідання медальйона вниз під вагою смоли
 if (pd && pd.animate) {
 pd.animate([
 { transform: "translate(-50%, -50%) translateY(0px) scale(1)", filter: "brightness(1)" },
 { transform: "translate(-50%, -50%) translateY(9px) scale(1.03, 0.94)", filter: "brightness(0.55) contrast(1.25) drop-shadow(0 0 18px #a855f7)", offset: 0.35 },
 { transform: "translate(-50%, -50%) translateY(5px) scale(1.01, 0.97)", filter: "brightness(0.75) drop-shadow(0 0 14px #9333ea)", offset: 0.7 },
 { transform: "translate(-50%, -50%) translateY(0px) scale(1)", filter: "brightness(1)" }
 ], { duration: 640, easing: "ease-out" });
 }
 pop(def, "УПОВІЛЬНЕНО!", "#c084fc");
 await sl(380);
}

// Мімікрія (c): розколота ртутно-золота маска двійника
SVG_IC.c = `<svg class="ic-float" viewBox="0 0 36 36"><defs><linearGradient id="mimL" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f8fafc"/><stop offset=".5" stop-color="#94a3b8"/><stop offset="1" stop-color="#334155"/></linearGradient><linearGradient id="mimR" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fef08a"/><stop offset=".55" stop-color="#f59e0b"/><stop offset="1" stop-color="#78350f"/></linearGradient></defs><path d="M18 3C10 3 6 8.5 6 16.5 6 25 11.5 31 18 33V3z" fill="url(#mimL)" stroke="#e2e8f0" stroke-width="1.1"/><path d="M18 3c8 0 12 5.5 12 13.5C30 25 24.5 31 18 33V3z" fill="url(#mimR)" stroke="#fde047" stroke-width="1.1"/><ellipse cx="12.5" cy="15.5" rx="2.8" ry="1.8" fill="#0f172a"/><circle class="ic-pulse" cx="12.5" cy="15.5" r="1" fill="#c084fc"/><ellipse cx="23.5" cy="15.5" rx="2.8" ry="1.8" fill="#0f172a"/><circle class="ic-pulse" cx="23.5" cy="15.5" r="1" fill="#fde047"/><path d="M11 23.5q3.5 3 7 0" stroke="#0f172a" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M18 23.5q3.5-2.5 7 0" stroke="#451a03" stroke-width="1.5" fill="none" stroke-linecap="round"/><path class="ic-spark" d="M18 1.5v33" stroke="#fff" stroke-width="1.3" stroke-dasharray="2 1.5"/></svg>`;

// ІКЛО ФАФНІРА (j): стрімкий випад ікла (−18 HP) або подвійний укус драконячих ікол у захисті (−25 HP)
const FAFNIR_BLADE_SVG = `<svg viewBox="0 0 120 120" style="overflow:visible"><defs><linearGradient id="fbG" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fffbeb"/><stop offset="40%" stop-color="#e7e5e4"/><stop offset="78%" stop-color="#44403c"/><stop offset="100%" stop-color="#0c0a09"/></linearGradient><linearGradient id="fbV" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fde047"/><stop offset="50%" stop-color="#c084fc"/><stop offset="100%" stop-color="#e11d48"/></linearGradient></defs><path d="M14 22C20 10 38 8 50 18L28 44C16 38 11 30 14 22Z" fill="#3b0764" stroke="#c084fc" stroke-width="2.5"/><path d="M46 16C78 30 98 60 104 106C70 88 42 64 26 42Z" fill="url(#fbG)" stroke="#ffffff" stroke-width="2.5" stroke-linejoin="round"/><path d="M40 30C64 44 82 68 92 94" stroke="url(#fbV)" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="104" cy="106" r="4.5" fill="#fde047"/></svg>`;

async function fafnirFx(act, def, isAmbush, onHit) {
 const A = seatC(act), D = seatC(def);
 const dx = D.x - A.x, dy = D.y - A.y;
 if (!isAmbush) {
 // Звичайна атака першим ходом (−18 HP): кидок вигнутого ікла по дузі + діагональний розріз
 const f = fxBox(FAFNIR_BLADE_SVG, 96, A.x, A.y);
 f.style.zIndex = 72;
 f.style.filter = "drop-shadow(0 0 14px #c084fc) drop-shadow(0 4px 8px #000)";
 const stop = trail(f, "#c084fc");
 snd("throw");
 await an(f, [
 { transform: "translate(0,0) scale(.5) rotate(-60deg)", opacity: 0 },
 { transform: `translate(${dx * .5}px,${dy * .5 - 55}px) scale(1.1) rotate(140deg)`, opacity: 1, offset: .55 },
 { transform: `translate(${dx}px,${dy}px) scale(1.2) rotate(320deg)`, opacity: 1 }
 ], 340, { easing: "cubic-bezier(.3,.1,.2,1)" });
 stop(); f.remove();
 snd("slice");
 onHit();
 const slLine = document.createElement("div");
 slLine.style.cssText = `position:fixed;left:${D.x - 75}px;top:${D.y - 3}px;width:150px;height:6px;background:linear-gradient(90deg,transparent,#fde047,#e879f9,#fff,transparent);box-shadow:0 0 18px #c084fc;z-index:73;pointer-events:none`;
 document.body.appendChild(slLine);
 an(slLine, [{ transform: "rotate(-35deg) scaleX(.2)", opacity: 1 }, { transform: "rotate(-35deg) scaleX(1.25)", opacity: 1, offset: .4 }, { transform: "rotate(-35deg) scaleX(1.5)", opacity: 0 }], 320).then(() => slLine.remove());
 shock(D.x, D.y, "#c084fc", 145);
 sparkBurst(D.x, D.y, ["#fde047", "#c084fc", "#ffffff"], 18, 100);
 return;
 }
 // ЗАСІДКА В ЗАХИСТІ (−25 HP): два гігантські драконячі ікла змикаються навхрест на цілі
 const vg = document.createElement("div");
 vg.style.cssText = `position:fixed;inset:0;z-index:68;pointer-events:none;opacity:0;background:radial-gradient(circle at ${D.x}px ${D.y}px, rgba(234,179,8,.18) 0, rgba(88,28,135,.38) 38%, rgba(9,5,18,.82) 78%)`;
 document.body.appendChild(vg);
 const f1 = fxBox(FAFNIR_BLADE_SVG, 134, D.x - 68, D.y - 78);
 const f2 = fxBox(FAFNIR_BLADE_SVG, 134, D.x + 68, D.y - 78);
 f1.style.zIndex = f2.style.zIndex = 73;
 f1.style.filter = f2.style.filter = "drop-shadow(0 0 18px #fde047) drop-shadow(0 0 28px #a855f7)";
 snd("thud");
 await Promise.all([
 an(vg, [{ opacity: 0 }, { opacity: 1 }], 220),
 an(f1, [{ transform: "translate(-35px,-40px) scale(.5) rotate(-25deg)", opacity: 0 }, { transform: "translate(0,0) scale(1.15) rotate(8deg)", opacity: 1 }], 220, { easing: "cubic-bezier(.2,1.4,.4,1)" }),
 an(f2, [{ transform: "translate(35px,-40px) scale(-.5,.5) rotate(-25deg)", opacity: 0 }, { transform: "translate(0,0) scale(-1.15,1.15) rotate(8deg)", opacity: 1 }], 220, { easing: "cubic-bezier(.2,1.4,.4,1)" })
 ]);
 // Блискавичне перехресне врізання в аватар
 snd("slice"); setTimeout(() => snd("shatter"), 45);
 await Promise.all([
 an(f1, [{ transform: "translate(0,0) scale(1.15) rotate(8deg)" }, { transform: "translate(62px,72px) scale(1.28) rotate(28deg)" }], 115, { easing: "cubic-bezier(.9,0,.1,1)" }),
 an(f2, [{ transform: "translate(0,0) scale(-1.15,1.15) rotate(8deg)" }, { transform: "translate(-62px,72px) scale(-1.28,1.28) rotate(28deg)" }], 115, { easing: "cubic-bezier(.9,0,.1,1)" })
 ]);
 onHit();
 crackTable();
 shake($("p" + def));
 // X-подібний золотисто-фіолетовий розріз
 [-38, 38].forEach(ang => {
 const cr = document.createElement("div");
 cr.style.cssText = `position:fixed;left:${D.x - 85}px;top:${D.y - 3}px;width:170px;height:6px;background:linear-gradient(90deg,transparent,#fde047,#f43f5e,#fff,#fde047,transparent);box-shadow:0 0 20px #fde047;z-index:74;pointer-events:none`;
 document.body.appendChild(cr);
 an(cr, [{ transform: `rotate(${ang}deg) scaleX(.2)`, opacity: 1 }, { transform: `rotate(${ang}deg) scaleX(1.3)`, opacity: 1, offset: .45 }, { transform: `rotate(${ang}deg) scaleX(1.6)`, opacity: 0 }], 360).then(() => cr.remove());
 });
 shock(D.x, D.y, "#fde047", 195);
 starburst(D.x, D.y, "#c084fc", 150);
 sparkBurst(D.x, D.y, ["#fde047", "#c084fc", "#f43f5e", "#ffffff"], 30, 140);
 pop(def, "ЗАСІДКА −25!", "#fde047");
 await Promise.all([
 an(f1, [{ opacity: 1 }, { opacity: 0, transform: "translate(85px,98px) scale(.9) rotate(35deg)" }], 250),
 an(f2, [{ opacity: 1 }, { opacity: 0, transform: "translate(-85px,98px) scale(-.9,.9) rotate(35deg)" }], 250),
 an(vg, [{ opacity: 1 }, { opacity: 0 }], 260)
 ]);
 f1.remove(); f2.remove(); vg.remove();
}

// КАЙДАНИ ФАНТОМА (l): політ бірюзового неонового кайдана + закриття прозорого неонового замка поверх суперника
async function shackleFx(act, def, onHit) {
 const A = seatC(act), D = seatC(def);
 const dx = D.x - A.x, dy = D.y - A.y, ang = Math.atan2(dy, dx) * 180 / Math.PI;
 // 1. Від того, хто кинув, до суперника простягається прозорий бірюзовий неоновий ланцюг
 const dist = Math.hypot(dx, dy) || 1, ux = dx / dist, uy = dy / dist;
 const sx = A.x + ux * 42, sy = A.y + uy * 42, clen = Math.max(50, dist - 84);
 const nl = Math.max(3, Math.round(clen / 20));
 let links = "";
 for (let k = 0; k < nl; k++) {
 const cxk = 12 + k * (clen - 24) / Math.max(1, nl - 1);
 links += k % 2 ? `<ellipse cx="${cxk}" cy="13" rx="5" ry="7"/>` : `<ellipse cx="${cxk}" cy="13" rx="11" ry="6.5"/>`;
 }
 const chain = document.createElement("div");
 chain.style.cssText = `position:fixed;left:${sx}px;top:${sy - 13}px;width:${clen}px;height:26px;z-index:71;pointer-events:none;transform-origin:0 50%;transform:rotate(${ang}deg);clip-path:inset(-24px 100% -24px -24px);filter:drop-shadow(0 0 8px #00f5d4) drop-shadow(0 0 16px #14b8a6)`;
 chain.innerHTML = `<svg viewBox="0 0 ${clen} 26" width="${clen}" height="26" style="overflow:visible"><g fill="rgba(45,212,191,0.16)" stroke="#5eead4" stroke-width="2.4">${links}</g></svg>`;
 document.body.appendChild(chain);
 snd("whoosh");
 await an(chain, [{ clipPath: "inset(-24px 100% -24px -24px)" }, { clipPath: "inset(-24px -24px -24px -24px)" }], 380, { easing: "cubic-bezier(.3,.7,.3,1)" });

 // 2. Влучання: бірюзові неонові ланцюги обплітають плашку, а поверх неї закривається прозорий неоновий замок
 onHit();
 snd("shield");
 const chains = document.createElement("div");
 chains.style.cssText = `position:fixed;left:${D.x - 54}px;top:${D.y - 62}px;width:108px;height:124px;z-index:72;pointer-events:none;filter:drop-shadow(0 0 12px #00f5d4)`;
 chains.innerHTML = `<svg viewBox="0 0 108 124"><g stroke="#5eead4" stroke-width="3.5" stroke-dasharray="8 5" fill="none" stroke-linecap="round" opacity=".88"><line x1="12" y1="22" x2="96" y2="96"/><line x1="96" y1="22" x2="12" y2="96"/><polygon points="8,18 100,18 100,92 54,118 8,92" stroke="#2dd4bf" stroke-width="2.4"/></g></svg>`;
 const lock = document.createElement("div");
 lock.style.cssText = `position:fixed;left:${D.x - 52}px;top:${D.y - 58}px;width:104px;height:116px;z-index:74;pointer-events:none;filter:drop-shadow(0 0 16px #00f5d4) drop-shadow(0 0 30px #14b8a6)`;
 lock.innerHTML = `<svg viewBox="0 0 100 112" style="overflow:visible">
 <g id="shackleArc" style="transform:translateY(-18px)">
 <path d="M30 48 V26 A20 20 0 0 1 70 26 V48" fill="none" stroke="#ccfbf1" stroke-width="6.5" stroke-linecap="round"/>
 <path d="M30 48 V26 A20 20 0 0 1 70 26 V48" fill="none" stroke="#2dd4bf" stroke-width="3.5" stroke-linecap="round"/>
 </g>
 <rect x="18" y="46" width="64" height="52" rx="12" fill="rgba(13,148,136,0.28)" stroke="#5eead4" stroke-width="3.5"/>
 <rect x="23" y="51" width="54" height="42" rx="8" fill="rgba(204,251,241,0.08)" stroke="#99f6e4" stroke-width="1.2" stroke-dasharray="4 3"/>
 <circle cx="50" cy="67" r="6.5" fill="rgba(4,47,46,0.85)" stroke="#ccfbf1" stroke-width="2.2"/>
 <path d="M46.5 72 H53.5 L55.5 86 H44.5 Z" fill="rgba(4,47,46,0.85)" stroke="#ccfbf1" stroke-width="2"/>
 </svg>`;
 document.body.append(chains, lock);
 const shackleArc = lock.querySelector("#shackleArc");
 await Promise.all([
 an(chains, [{ transform: "scale(1.45)", opacity: 0 }, { transform: "scale(1)", opacity: 1 }], 210, { easing: "ease-out" }),
 an(lock, [{ transform: "scale(1.35)", opacity: 0 }, { transform: "scale(1)", opacity: 0.95 }], 210, { easing: "cubic-bezier(.2,1.4,.4,1)" })
 ]);
 // Клацання замка: дужка різко опускається й замикається
 snd("stun");
 if (shackleArc && shackleArc.animate) {
 await shackleArc.animate([{ transform: "translateY(-18px)" }, { transform: "translateY(0px)" }], { duration: 110, fill: "forwards", easing: "cubic-bezier(.9,0,.1,1)" }).finished.catch(() => {});
 }
 shake($("p" + def));
 shock(D.x, D.y, "#2dd4bf", 180);
 ring(D.x, D.y, "#ccfbf1", 125);
 sparkBurst(D.x, D.y, ["#ccfbf1", "#5eead4", "#2dd4bf", "#0d9488"], 26, 120);
 pop(def, "ЗАМКНЕНО!", "#5eead4");
 await sl(300);
 await Promise.all([
 an(chain, [{ opacity: 1 }, { opacity: 0 }], 260),
 an(chains, [{ opacity: 1 }, { opacity: 0, transform: "scale(.92)" }], 260),
 an(lock, [{ opacity: 0.95, transform: "scale(1)" }, { opacity: 0, transform: "scale(1.18)" }], 260)
 ]);
 chain.remove(); chains.remove(); lock.remove();
}

// СПАЛЕННЯ КАРТИ ЗДОРОВ'Я БІРЮЗОВИМ ПОЛУМ'ЯМ (коли на гравці висять Кайдани Фантома)
async function burnHealCardFx(act, c) {
 const slot = T[act] && T[act].e;
 const C = seatC(act);
 let cx = C.x, cy = C.y;
 if (slot && slot.isConnected) {
 const r = slot.getBoundingClientRect();
 cx = r.left + r.width / 2;
 cy = r.top + r.height / 2;
 }
 const fl = document.createElement("div");
 fl.style.cssText = `position:fixed;left:${cx - 68}px;top:${cy - 92}px;width:136px;height:176px;z-index:76;pointer-events:none;filter:drop-shadow(0 0 18px #00f5d4) drop-shadow(0 0 32px #14b8a6)`;
 fl.innerHTML = `<svg viewBox="0 0 120 160" style="overflow:visible">
 <defs>
 <linearGradient id="cyFl1" x1="0" y1="1" x2="0" y2="0">
 <stop offset="0%" stop-color="#0f766e" stop-opacity=".95"/>
 <stop offset="45%" stop-color="#14b8a6" stop-opacity=".88"/>
 <stop offset="80%" stop-color="#5eead4" stop-opacity=".75"/>
 <stop offset="100%" stop-color="#ccfbf1" stop-opacity="0"/>
 </linearGradient>
 </defs>
 <path d="M18 148 C6 112 18 74 34 46 C32 70 44 76 46 48 C52 24 64 8 62 2 C76 24 82 52 74 74 C86 60 94 42 92 26 C108 58 112 104 98 148 Z" fill="url(#cyFl1)"/>
 <path d="M32 148 C26 118 36 88 50 64 C50 82 60 84 62 56 C72 78 78 104 72 122 C82 108 88 94 86 80 C94 104 92 130 84 148 Z" fill="#ccfbf1" opacity=".7"/>
 </svg>`;
 document.body.appendChild(fl);
 snd("thunder"); snd("shatter");
 const anims = [
 an(fl, [
 { transform: "scale(.4, .2) translateY(40px)", opacity: 0 },
 { transform: "scale(1.15, 1.2) translateY(-6px)", opacity: 1, offset: .45 },
 { transform: "scale(1.3, 1.45) translateY(-28px)", opacity: 0 }
 ], 680, { easing: "ease-out" })
 ];
 if (slot && slot.animate) {
 anims.push(slot.animate([
 { filter: "brightness(1)", transform: "scale(1)", opacity: 1 },
 { filter: "brightness(2.4) sepia(1) hue-rotate(130deg) saturate(4) drop-shadow(0 0 22px #00f5d4)", transform: "scale(1.08) rotate(-4deg)", opacity: 1, offset: .35 },
 { filter: "brightness(.3) grayscale(1) blur(3px)", transform: "scale(.55) translateY(-35px) rotate(10deg)", opacity: 0 }
 ], { duration: 640, fill: "forwards", easing: "ease-in" }).finished.catch(() => {}));
 }
 for (let k = 0; k < 22; k++) {
 const p = document.createElement("div");
 const sz = 5 + Math.random() * 8;
 p.style.cssText = `position:fixed;left:${cx + (Math.random() - .5) * 76}px;top:${cy + (Math.random() - .5) * 86}px;width:${sz}px;height:${sz * 1.5}px;border-radius:50% 50% 50% 50%/65% 65% 35% 35%;background:${["#ccfbf1", "#5eead4", "#2dd4bf", "#0d9488"][k % 4]};box-shadow:0 0 10px #00f5d4;z-index:77;pointer-events:none`;
 document.body.appendChild(p);
 an(p, [
 { transform: "translate(0,0) scale(1)", opacity: 1 },
 { transform: `translate(${(Math.random() - .5) * 70}px,-${65 + Math.random() * 75}px) scale(.15)`, opacity: 0 }
 ], 520 + Math.random() * 260, { easing: "ease-out" }).then(() => p.remove());
 }
 shock(cx, cy, "#2dd4bf", 165);
 pop(act, "ЗГОРІЛО В ПОЛУМ'Ї!", "#5eead4");
 burst(act, "#2dd4bf");
 await Promise.all(anims);
 fl.remove();
}

// МІМІКРІЯ (c): ртутне полум'я перетворює карту на столі на золоту копію ×1.25
async function mimicMorphFx(act, clonedCard) {
 const slot = T[act] && T[act].e;
 const C = seatC(act);
 snd("swap");
 sparkBurst(C.x, C.y, ["#fbbf24", "#e2e8f0", "#c084fc"], 22, 100);
 if (slot && slot.isConnected) {
 const r = slot.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
 shock(cx, cy, "#fbbf24", 150);
 sparkBurst(cx, cy, ["#ffffff", "#fde047", "#a855f7"], 26, 110);
 if (slot.animate) await slot.animate([
 { transform: "scale(1) rotateY(0deg)", filter: "brightness(1)" },
 { transform: "scale(1.22) rotateY(90deg)", filter: "brightness(2.8) drop-shadow(0 0 24px #fbbf24)" }
 ], { duration: 220, easing: "ease-in" }).finished.catch(() => {});
 const ne = cardEl(clonedCard, act);
 ne.classList.add("gold");
 const vEl = ne.querySelector(".v");
 if (vEl) vEl.innerHTML = cardLabel(clonedCard, P[act].hp) + " ×1.25";
 slot.replaceWith(ne);
 T[act].e = ne;
 if (ne.animate) await ne.animate([
 { transform: "scale(1.22) rotateY(-90deg)", filter: "brightness(2.5)" },
 { transform: "scale(1) rotateY(0deg)", filter: "brightness(1)" }
 ], { duration: 240, easing: "ease-out" }).finished.catch(() => {});
 }
 pop(act, `КОПІЯ ×1.25: ${cardName(clonedCard)}`, "#fde047");
 await sl(260);
}

// ===== БЛАГОСЛОВЕННЯ РА (карта «n»): сонячний промінь ~1.1 с =====
SVG_IC.n = `<svg viewBox="0 0 36 36"><defs><radialGradient id="snG" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fffbeb"/><stop offset=".55" stop-color="#fde047"/><stop offset="1" stop-color="#f59e0b"/></radialGradient></defs><g class="ic-spin" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" style="filter:drop-shadow(0 0 1.5px #f59e0b)"><path d="M18 2v5M18 29v5M2 18h5M29 18h5M6.7 6.7l3.5 3.5M25.8 25.8l3.5 3.5M29.3 6.7l-3.5 3.5M10.2 25.8l-3.5 3.5"/></g><circle class="ic-pulse" cx="18" cy="18" r="8" fill="url(#snG)" stroke="#fef3c7" stroke-width="1.2"/><path d="M14.5 17.5q1.2-1.2 2.4 0M19.1 17.5q1.2-1.2 2.4 0" stroke="#92400e" stroke-width="1" fill="none" stroke-linecap="round"/></svg>`;
SVG_IC.q = `<svg viewBox="0 0 36 36"><defs><radialGradient id="mdE" cx=".4" cy=".4" r=".65"><stop offset="0" stop-color="#d1fae5"/><stop offset=".55" stop-color="#34d399"/><stop offset="1" stop-color="#064e3b"/></radialGradient></defs><ellipse cx="18" cy="18" rx="15" ry="11" fill="#3f3f46" stroke="#71717a" stroke-width="1.4"/><path d="M5 18c2-3 6-3 8 0M23 18c2-3 6-3 8 0" stroke="#71717a" stroke-width="1" opacity=".6" fill="none"/><ellipse cx="18" cy="18" rx="10" ry="7.2" fill="url(#mdE)" stroke="#022c22" stroke-width="1"/><ellipse class="ic-pupil" cx="18" cy="18" rx="2.1" ry="6.4" fill="#022c22"/><g class="ic-sway" stroke="#4ade80" stroke-width="1.1" fill="none" opacity=".85"><path d="M3 11q4 2 2 7M33 11q-4 2-2 7M4 25q4-1 3-6M32 25q-4-1-3-6"/></g></svg>`;
SVG_IC.y = `<svg class="ic-chill" viewBox="0 0 36 36"><defs><linearGradient id="icN" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0f9ff"/><stop offset=".5" stop-color="#7dd3fc"/><stop offset="1" stop-color="#0369a1"/></linearGradient></defs><path d="M18 2L23 13L20 30L18 34L16 30L13 13L18 2Z" fill="url(#icN)" stroke="#e0f2fe" stroke-width="1"/><path d="M18 6v22" stroke="#fff" stroke-width="1" opacity=".55"/><g class="ic-spark"><path d="M9 9l3 3M27 9l-3 3M11 25l2-3M25 25l-2-3" stroke="#bae6fd" stroke-width="1.1" stroke-linecap="round"/></g></svg>`;
async function sunFx(act, onClean, onHeal) {
 const C = seatC(act), cx = C.x, cy = C.y;
 const pl = $("p" + act);
 const mk = css => { const e = document.createElement("div"); e.style.cssText = css; document.body.appendChild(e); return e; };
 const fa = (e, fr, o) => e.animate ? e.animate(fr, Object.assign({ fill: "forwards" }, o)).finished.catch(() => {}) : sl(o.duration);
 // 1. Сонячний стовп (0.45 с)
 const amb = mk("position:fixed;inset:0;z-index:55;pointer-events:none;opacity:0;background:radial-gradient(circle at " + cx + "px " + cy + "px, rgba(253,224,71,.25) 0, rgba(120,53,15,.35) 45%, rgba(30,10,0,.7) 100%)");
 const beamW = 150, beamH = cy + 50;
 const beam = mk(`position:fixed;left:${cx - beamW / 2}px;top:0;width:${beamW}px;height:${beamH}px;z-index:70;pointer-events:none;transform-origin:50% 0;opacity:0;background:linear-gradient(to bottom, rgba(255,255,255,.9), rgba(250,204,21,.65) 60%, transparent);clip-path:polygon(38% 0, 62% 0, 100% 100%, 0 100%);filter:blur(1px) drop-shadow(0 0 18px #fde047)`);
 const core = mk(`position:fixed;left:${cx - 26}px;top:0;width:52px;height:${beamH}px;z-index:71;pointer-events:none;opacity:0;background:linear-gradient(to bottom, rgba(255,255,255,.95), rgba(255,247,200,.5) 70%, transparent);filter:blur(4px)`);
 bell();
 fa(amb, [{ opacity: 0 }, { opacity: 1 }], { duration: 420, easing: "ease-out" });
 fa(core, [{ opacity: 0, transform: "scaleX(.2)" }, { opacity: .95, transform: "scaleX(1)" }], { duration: 420, easing: "ease-out" });
 const dust = setInterval(() => sparkBurst(cx + (Math.random() - .5) * 90, cy - 50 + Math.random() * 90, ["#fde047", "#fff7ae", "#fbbf24"], 4, 40), 70);
 await fa(beam, [{ transform: "scaleY(0)", opacity: 0 }, { transform: "scaleY(1)", opacity: 1 }], { duration: 420, easing: "cubic-bezier(.2,.9,.3,1)" });
 if (pl && pl.animate) pl.animate([{ filter: "brightness(1)" }, { filter: "brightness(1.7) saturate(1.2)" }, { filter: "brightness(1.15)" }], { duration: 450 });
 // 2. Спалення дебафів (0.25 с)
 shock(cx, cy, "#facc15", 160); ring(cx, cy, "#fde047", 120);
 const chips = pl ? Array.from(pl.querySelectorAll(".st.pz, .st.bn, .st.fz, .st.wk, .st.ib, .st.hb, .st.sl, .st.rh, .st.ds, .st.sc")) : [];
 chips.forEach(ch => {
 const r = ch.getBoundingClientRect();
 if (ch.animate) ch.animate([{ filter: "brightness(1)", opacity: 1, transform: "scale(1)" }, { filter: "brightness(4)", opacity: 1, transform: "scale(1.4)", offset: .5 }, { filter: "brightness(6)", opacity: 0, transform: "scale(.4)" }], { duration: 260, fill: "forwards" });
 sparkBurst(r.left + r.width / 2, r.top + r.height / 2, ["#fff", "#fde047", "#fbbf24"], 12, 70);
 });
 snd("shatter");
 pop(act, "ОЧИЩЕННЯ", "#fde047");
 onClean();
 await sl(250);
 // 3. Зцілення +40 HP (0.4 с): стовп згортається в ауру
 clearInterval(dust);
 fa(core, [{ opacity: .95 }, { opacity: 0 }], { duration: 320 });
 fa(amb, [{ opacity: 1 }, { opacity: 0 }], { duration: 400 });
 if (pl && pl.animate) pl.animate([{ filter: "drop-shadow(0 0 0px #fde047)" }, { filter: "brightness(1.3) drop-shadow(0 0 20px #fde047)" }, { filter: "drop-shadow(0 0 0px #fde047)" }], { duration: 480 });
 onHeal();
 sparkBurst(cx, cy, ["#fde047", "#4ade80", "#fff7ae"], 22, 90);
 await fa(beam, [{ transform: "scaleX(1)", opacity: 1 }, { transform: "scaleX(.15)", opacity: 0 }], { duration: 360, easing: "ease-in" });
 [amb, beam, core].forEach(e => e.remove());
}

// Постійна аура Шипа рози: сталева лоза строго по контуру .pl-banner-shield без вильоту за межі
function thornAuraSvg(w, h, uid) {
 const pad = 16, W = w + pad * 2, H = h + pad * 2, cx = W / 2;
 const defs = `<defs><linearGradient id="taS${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#050506"/><stop offset=".3" stop-color="#3f3f46"/><stop offset=".48" stop-color="#b4b4be"/><stop offset=".66" stop-color="#27272a"/><stop offset="1" stop-color="#050506"/></linearGradient></defs>`;
 const isMob = w <= 86;
 const shieldW = isMob ? 80 : 92;
 const shieldTop = isMob ? 14 : 16;
 const shieldH = Math.max(60, h - shieldTop);
 const hw = shieldW * 0.5 - 1;
 const topY = pad + shieldTop + shieldH * (1 / 98);
 const shoulderY = pad + shieldTop + shieldH * (10 / 98);
 const hipY = pad + shieldTop + shieldH * (73 / 98);
 const tipY = pad + shieldTop + shieldH * (96 / 98);
 const pts = [
  [cx, topY], [cx + hw - 8, topY], [cx + hw, shoulderY],
  [cx + hw, (shoulderY + hipY) * 0.5], [cx + hw, hipY],
  [cx + hw * 0.5, (hipY + tipY) * 0.5], [cx, tipY],
  [cx - hw * 0.5, (hipY + tipY) * 0.5], [cx - hw, hipY],
  [cx - hw, (shoulderY + hipY) * 0.5], [cx - hw, shoulderY], [cx - hw + 8, topY]
 ];
 const segs = [];
 let totalLen = 0;
 for (let s = 0; s < pts.length; s++) {
  const p1 = pts[s], p2 = pts[(s + 1) % pts.length];
  const dx = p2[0] - p1[0], dy = p2[1] - p1[1];
  const l = Math.hypot(dx, dy) || 1;
  segs.push({ p1, p2, l, nx: dy / l, ny: -dx / l, start: totalLen });
  totalLen += l;
 }
 const perim = (u, off) => {
  const target = ((u % 1) + 1) % 1 * totalLen;
  let seg = segs[segs.length - 1];
  for (let s = 0; s < segs.length; s++) {
   if (target <= segs[s].start + segs[s].l) { seg = segs[s]; break; }
  }
  const t = Math.min(1, Math.max(0, (target - seg.start) / seg.l));
  const bx = seg.p1[0] + (seg.p2[0] - seg.p1[0]) * t;
  const by = seg.p1[1] + (seg.p2[1] - seg.p1[1]) * t;
  return [bx + seg.nx * off, by + seg.ny * off, Math.atan2(seg.ny, seg.nx)];
 };
 let body = "", spk = "";
 [{ wv: 6, ph: 0, w: 3.0 }, { wv: 6, ph: Math.PI, w: 2.6 }, { wv: 9, ph: 1.1, w: 1.8 }].forEach((vn, k) => {
  let d = "";
  const N = 96;
  for (let j = 0; j <= N; j++) {
   const u = j / N;
   const wave = Math.sin(u * vn.wv * 2 * Math.PI + vn.ph) * 1.25;
   const [x, y, ang] = perim(u, wave);
   d += (j ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
   if (k < 2 && j % 8 === k * 4 && j < N) {
    const deg = ((ang * 180 / Math.PI) + 360) % 360;
    if (deg > 245 && deg < 295) continue;
    const slen = 5.0 + (j % 3) * 1.3, spread = (k ? 0.14 : -0.14);
    const sa = ang + spread;
    const tx = x + Math.cos(sa) * slen, ty = y + Math.sin(sa) * slen;
    const px = Math.cos(sa + 1.57) * 1.35, py = Math.sin(sa + 1.57) * 1.35;
    spk += `<polygon points="${(x + px).toFixed(1)},${(y + py).toFixed(1)} ${tx.toFixed(1)},${ty.toFixed(1)} ${(x - px).toFixed(1)},${(y - py).toFixed(1)}" fill="#18181b" stroke="#fb7185" stroke-width="0.85"/><circle cx="${tx.toFixed(1)}" cy="${ty.toFixed(1)}" r="1.1" fill="#fb7185"/>`;
   }
  }
  body += `<path d="${d}Z" stroke="#050506" stroke-width="${vn.w + 1.4}" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}Z" stroke="url(#taS${uid})" stroke-width="${vn.w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path pathLength="1" d="${d}Z" stroke="#71717a" stroke-width="${vn.w * .34}" fill="none" style="stroke-dasharray:.014 .014"/><path class="rl" d="${d}Z" stroke="#e11d48" stroke-width="0.95" fill="none" stroke-linecap="round"/>`;
 });
 return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs}${body}<g class="sg">${spk}</g></svg>`;
}
function syncThornAura(i, p, e) {
 const on = p.alive && p.thorn > 0; let ta = e.querySelector(".ta:not([data-off])");
 if (on && !ta) {
 const w = e.offsetWidth || 96, h = e.offsetHeight || 112;
 ta = document.createElement("div"); ta.className = "ta";
 ta.innerHTML = thornAuraSvg(w, h, i); e.appendChild(ta);
 if (ta.animate) ta.animate([{ opacity: 0, transform: "translate(-50%, -50%) scale(.9)" }, { opacity: 1, transform: "translate(-50%, -50%) scale(1)" }], { duration: 320, easing: "ease-out" });
 } else if (!on && ta) {
 ta.dataset.off = 1;
 const C = seatC(i);
 sparkBurst(C.x, C.y, ["#e11d48", "#fb7185", "#71717a", "#27272a"], 22, 95);
 burst(i, "#e11d48"); burst(i, "#991b1b");
 if (ta.animate) ta.animate([{ opacity: 1, transform: "translate(-50%, -50%) scale(1)", filter: "brightness(1.8) drop-shadow(0 0 18px #fb7185)" }, { opacity: 0, transform: "translate(-50%, -50%) scale(1.12)", filter: "brightness(.6)" }], { duration: 420, easing: "ease-out" }).onfinish = () => ta.remove(); else ta.remove();
 }
}

function turtleShellAuraSvg(uid) {
 // 1-в-1 повторює viewBox="0 0 92 98" і шлях .shield-bg-path без виходу за рамки плашки
 const shieldPath = "M 10,1 H 82 A 9,9 0 0 1 91,10 V 73 L 46,96 L 1,73 V 10 A 9,9 0 0 1 10,1 Z";
 const innerPath = "M 12,4 H 80 A 7,7 0 0 1 88,11 V 71.2 L 46,92.5 L 4,71.2 V 11 A 7,7 0 0 1 12,4 Z";
 return `<svg viewBox="0 0 92 98" preserveAspectRatio="none" style="width:100%;height:100%;display:block;overflow:visible">
 <defs>
 <clipPath id="shClip${uid}"><path d="${shieldPath}"/></clipPath>
 <linearGradient id="shDome${uid}" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stop-color="#7dd3fc" stop-opacity="0.34"/>
 <stop offset="48%" stop-color="#0284c7" stop-opacity="0.16"/>
 <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.42"/>
 </linearGradient>
 <linearGradient id="shRim${uid}" x1="0" y1="0" x2="1" y2="1">
 <stop offset="0%" stop-color="#e0f2fe"/>
 <stop offset="50%" stop-color="#38bdf8"/>
 <stop offset="100%" stop-color="#0284c7"/>
 </linearGradient>
 <pattern id="shHex${uid}" width="18" height="15.6" patternUnits="userSpaceOnUse">
 <polygon points="9,1 17,5 17,11.5 9,14.8 1,11.5 1,5" fill="none" stroke="#7dd3fc" stroke-width="0.85" stroke-opacity="0.48"/>
 </pattern>
 </defs>
 <g clip-path="url(#shClip${uid})">
 <path d="${shieldPath}" fill="url(#shDome${uid})"/>
 <path d="${shieldPath}" fill="url(#shHex${uid})" opacity="0.82"/>
 <g fill="none" stroke="#bae6fd" stroke-linecap="round" opacity="0.58">
 <polygon points="46,28 65,39 65,61 46,72 27,61 27,39" stroke-width="1.2" stroke-dasharray="4 3"/>
 <line x1="46" y1="1" x2="46" y2="28" stroke-width="1.2"/>
 <line x1="46" y1="72" x2="46" y2="96" stroke-width="1.2"/>
 <line x1="91" y1="28" x2="65" y2="39" stroke-width="1.1"/>
 <line x1="1" y1="28" x2="27" y2="39" stroke-width="1.1"/>
 <line x1="91" y1="73" x2="65" y2="61" stroke-width="1.1"/>
 <line x1="1" y1="73" x2="27" y2="61" stroke-width="1.1"/>
 </g>
 </g>
 <path d="${shieldPath}" fill="none" stroke="url(#shRim${uid})" stroke-width="2.4" stroke-linejoin="round"/>
 <path class="sh-ring" d="${innerPath}" fill="none" stroke="#bae6fd" stroke-width="1.2" stroke-linejoin="round" opacity="0.88"/>
 </svg>`;
}
function syncShellAura(i, p, e) {
 const on = p.alive && p.shellDef > 0;
 let sh = e.querySelector(".shell-aura:not([data-off])");
 if (on && !sh) {
 sh = document.createElement("div");
 sh.className = "shell-aura";
 sh.innerHTML = turtleShellAuraSvg(i);
 e.appendChild(sh);
 if (sh.animate) sh.animate([{ opacity: 0, transform: "translateX(-50%) scale(0.86)" }, { opacity: 1, transform: "translateX(-50%) scale(1)" }], { duration: 340, easing: "cubic-bezier(.2,1.35,.4,1)" });
 } else if (!on && sh) {
 sh.dataset.off = 1;
 const C = seatC(i);
 sparkBurst(C.x, C.y, ["#38bdf8", "#7dd3fc", "#e0f2fe", "#0284c7"], 22, 105);
 ring(C.x, C.y, "#38bdf8", 150);
 if (sh.animate) sh.animate([{ opacity: 1, transform: "translateX(-50%) scale(1)", filter: "brightness(1.8)" }, { opacity: 0, transform: "translateX(-50%) scale(1.12)", filter: "brightness(0.7)" }], { duration: 340, easing: "ease-out" }).onfinish = () => sh.remove();
 else sh.remove();
 }
}

/* ===== GHOST HP, СТАТУСИ, ЕФЕКТИ ЛЬОДУ ТА УДАРІВ ===== */
function clearGhosts() {
 document.querySelectorAll(".pl .gh, .pl .gt").forEach(x => { x.style.display = "none"; });
 document.querySelectorAll(".pl .hp-ghost-arc").forEach(a => { a.style.opacity = "0"; });
}
function setGhost(i, amt, kind, label) {
 const e = $("p" + i); if (!e || !P[i]) return;
 const maxH = P[i].maxHp || 100;
 const hp = Math.max(0, P[i].hp);
 const w = kind === "heal" ? Math.min(amt, maxH - hp) : Math.min(amt, hp);
 if (w <= 0) return;
 const arcLen = 169.65;
 const ghArc = e.querySelector(".hp-ghost-arc");
 if (ghArc) {
  const startHp = kind === "heal" ? hp : (hp - w);
  const startLen = (startHp / maxH) * arcLen;
  const spanLen = (w / maxH) * arcLen;
  ghArc.setAttribute("stroke", kind === "heal" ? "#4ade80" : kind === "pz" ? "#a3e635" : "#ff3b3b");
  ghArc.setAttribute("stroke-dasharray", `${spanLen.toFixed(1)} 226.2`);
  ghArc.setAttribute("stroke-dashoffset", (-startLen).toFixed(1));
  ghArc.style.opacity = "0.92";
 }
 const g = e.querySelector(".gh"), t = e.querySelector(".gt"); if (!g || !t) return;
 const lPct = ((kind === "heal" ? hp : hp - w) / maxH) * 100;
 const wPct = (w / maxH) * 100;
 const k = kind === "heal" ? " heal" : kind === "pz" ? " pz" : "";
 g.className = "gh" + k; g.style.display = "block"; g.style.left = lPct + "%"; g.style.width = wPct + "%";
 t.className = "gt" + k; t.textContent = label; t.style.display = "block";
 t.style.left = Math.max(16, Math.min(84, lPct + wPct / 2)) + "%";
}
// «привид» втраченого HP у момент удару: яскраво спалахує на місці, де щойно було здоров'я
function ghostFlash(i, v) {
 const e = $("p" + i); if (!e || !P[i]) return;
 const f = e.querySelector(".gf"); if (!f) return;
 const hp = P[i].hp, l = Math.max(0, hp), lost = Math.min(100, hp + v) - l;
 if (lost <= 0) return;
 f.style.left = l + "%"; f.style.width = lost + "%";
 f.classList.remove("on"); void f.offsetWidth; f.classList.add("on");
 clearTimeout(f._t); f._t = setTimeout(() => f.classList.remove("on"), 1050);
}
// передпоказ: наведення на карту малює привид шкоди/лікування на відповідній смужці
function previewCard(c) {
 clearGhosts();
 if (!P[0] || !P[0].alive || CU.a < 0 || CU.d < 0) return;
 const foe = CU.a === 0 ? CU.d : CU.a;
 if (foe < 0 || !P[foe] || !P[foe].alive) return;
 if (P[0].frost && isSp(c.t)) return;
 if (c.pz > 0) return;
 const k = P[0].frost ? .5 : 1;
 if (c.t === "C") {
 const minD = dmgAmt(Math.round((5 + (c.b || 0)) * k), c), maxD = dmgAmt(Math.round((35 + (c.b || 0)) * k), c);
 setGhost(foe, maxD, "dmg", `−${minD}..${maxD}`);
 }
 if ("dfvzxukboaqyjlDACSPWGLIJMOQRUVXYZ790αβγδεζηθικλμνξω".includes(c.t)) {
 let v = val(c, P[0].hp);
 if (c.t === "j" && ((CU.tar ? CU.a : CU.d) === 0)) v += 7;
 if (c.t === "D" && P[foe].hp > 80) v += 6;
 if (c.t === "Q" && hasAnyDebuff(P[foe])) v += 6;
 if (c.t === "W" && P[0].tookPrevDmg) v += 7;
 if (c.t === "L" && P[0].hp < 50) v += 8;
 if (c.t === "7" && P[foe].hp > P[0].hp) v += Math.min(14, Math.floor((P[foe].hp - P[0].hp) / 2));
 if (c.t === "ζ" && !hasAnyStatus(P[foe])) v += 4;
 if (c.t === "θ" && P[foe].hp <= 40) v += 8;
 if (c.t === "κ" && P[0].hp <= 50) v += 10;
 if (c.t === "ν" && (P[foe].healedInMatch || (P[foe].fx || []).some(f => f.t === "g"))) v += 8;
 if (c.t === "ξ") {
   const stCnt = Object.keys(EFFECT_DEFS).filter(key => EFFECT_DEFS[key].active(P[foe])).length + (P[foe].relicShield > 0 ? 1 : 0);
   if (stCnt >= 2) v += 15;
 }
 if (c.t === "x" && P[foe].hp <= 50) v *= 2;
 if (typeof hasRelic === "function") {
   if (hasRelic(0, "whetstone_ares") && c.r <= 1 && v > 0) v += 4;
   if (hasRelic(0, "blood_altar") && c.r >= 3 && v > 0) v += 12;
   if (hasRelic(0, "depth_silence") && ((CU.tar ? CU.a : CU.d) === 0) && v > 0) v += 6;
   if (hasRelic(0, "seal_berserk") && P[0].hp < 40 && v > 0) v = Math.round(v * 1.35);
 }
 const effK = (c.t === "η") ? 1 : k;
 v = dmgAmt(Math.round(v * effK), c);
 const charonExecPrev = (c.t === "ω" && P[foe].hp <= 35);
 if (P[foe].shellDef > 0 && v > 0 && c.t !== "ξ" && !charonExecPrev) v = Math.round(v * 0.75);
 if (c.t === "λ" && hasAnyDebuff(P[foe])) v += 12;
 if (charonExecPrev) v = Math.max(v, P[foe].hp);
 setGhost(foe, v, "dmg", charonExecPrev ? "СТРАТА" : ("−" + v + (v >= P[foe].hp ? " " : "")));
 if (c.t === "μ") setGhost(0, 8, "dmg", "−8 ВІДДАЧА");
 }
 if (isColosseumHex(c, P[0].hp)) {
 let hd = dmgAmt(Math.round(colosseumHexDmg(c, P[0].hp) * k), c);
 if (P[foe].shellDef > 0 && hd > 0) hd = Math.round(hd * 0.75);
 setGhost(foe, hd, "dmg", `−${hd}` + (hd >= P[foe].hp ? " " : ""));
 } else if ("hHF1234568TBKtnrπρστυφχψΓΔΦΩ".includes(c.t)) {
 let v = val(c, P[0].hp);
 if (c.t === "H" && P[0].hp < 40) v += 8;
 if (c.t === "6" && P[0].hp < 30) v += 7;
 if (c.t === "F" && !hasAnyDebuff(P[0])) v += 5;
 if (c.t === "τ" && !P[0].healedInMatch) v += 6;
 if (c.t === "υ" && P[0].hp < P[foe].hp) v += 7;
 if (c.t === "φ" && (P[foe].lastHeal || 0) > 0) v += Math.min(10, Math.round(P[foe].lastHeal * 0.25));
 if (c.t === "Γ" && P[0].attackedThisRound) v += 8;
 if (c.t === "Φ" && (P[0].fx || []).some(f => f.t === "b")) v += 10;
 if (P[0].revHeal > 0) setGhost(0, v, "dmg", `−${v}`);
 else {
   let hv = healAmt(v, c);
   if (typeof hasRelic === "function") {
     if (hasRelic(0, "depth_silence") && ((CU.tar ? CU.a : CU.d) === 0)) hv += 6;
     if (hasRelic(0, "cup_asclepius")) hv = Math.round(hv * 1.2);
   }
   const isDis = P[0].disorient > 0 && c.t !== "n";
   if (isDis) hv = Math.max(1, Math.round(hv * 0.5));
   setGhost(0, hv, "heal", "+" + hv + (isDis ? " (½)" : ""));
 }
 if (c.t === "Δ") setGhost(foe, 8, "dmg", "−8 (КІНЕЦЬ КОЛА)");
 }
 if (c.t === "p") { const tot = Math.ceil(15 * k) * (DUR[c.r] + durBonus()); setGhost(foe, tot, "pz", "ОТРУТА −" + tot); }
 if (c.t === "v") { const v = healAmt(Math.round(val(c, P[0].hp) * k), c); setGhost(0, v, "heal", "+" + v); }
 if (c.t === "0") { const v = healAmt(Math.round(15 * k), c); setGhost(0, v, "heal", "+" + v); }
 if (c.t === "Θ") { const td = dmgAmt(Math.round(val(c, P[0].hp) * (P[0].timeLock > 0 ? 0.8 : 1)), c); setGhost(foe, td, "dmg", `−${td} ОКОВИ`); }
 if (c.t === "Ψ") { const hd = dmgAmt(Math.round(val(c, P[0].hp) * (P[0].timeLock > 0 ? 0.8 : 1)), c); setGhost(foe, hd, "dmg", `−${hd}`); setGhost(0, 15, "dmg", (P[0].hp - 15 <= 35 && P[0].hp - 15 > 0) ? "−15 / +15" : "−15 ЖЕРТВА"); }
 if (c.t === "Σ") {
  if (P[foe].healedCardThisRound || P[foe].roundHealAmt > 0) { setGhost(foe, dmgAmt(16, c), "dmg", `−${dmgAmt(16, c)}`); setGhost(0, Math.max(1, Math.round((P[foe].roundHealAmt || 12) * 0.5)), "heal", "+50% ХІЛУ"); }
  else { setGhost(0, healAmt(12, c), "heal", `+${healAmt(12, c)}`); }
 }
 if (c.t === "9" && n > 2) {
   const sp = dmgAmt(Math.round(10 * k), c);
   P.forEach((op, oi) => { if (oi !== 0 && oi !== foe && op.alive) setGhost(oi, sp, "dmg", "−" + sp); });
 }
}

// ЄДИНИЙ РЕЄСТР СТАТУСІВ: чіткий поділ на ПОЗИТИВНІ (positive) та НЕГАТИВНІ (negative) ефекти

function showStTip(el) {
 const info = statusInfo(+el.dataset.p, el.dataset.k); if (!info) return;
 let t = $("tip");
 if (!t) { t = document.createElement("div"); t.id = "tip"; document.body.appendChild(t); }
 const r = el.getBoundingClientRect();
 t.innerHTML = `<b style="color:${ST_COL[el.dataset.k]}">${info.t}</b><br>${info.d}`;
 t.style.display = "block";
 t.style.left = Math.max(115, Math.min(innerWidth - 115, r.left + r.width / 2)) + "px";
 t.style.bottom = (innerHeight - r.top + 12) + "px";
}
(function () {
 const sx = $("seats"); let tt = 0;
 const hit_ = e => e.target && e.target.closest ? e.target.closest(".st") : null;
 sx.addEventListener("pointerover", e => { const c = hit_(e); if (c && e.pointerType === "mouse") showStTip(c); });
 sx.addEventListener("pointerout", e => { const c = hit_(e); if (c && e.pointerType === "mouse") hideTip(); });
 sx.addEventListener("click", e => { const c = hit_(e); if (!c) return; showStTip(c); clearTimeout(tt); tt = setTimeout(hideTip, 3800); });
})();

// ---- ефекти ударів: шлейф, іскри, ударні хвилі, зірка-вибух, ноти
function trail(e, col) {
 let on = true, last = 0;
 const step = now => {
 if (!on || !e.isConnected) return;
 if (now - last > 34) {
 last = now;
 const g = e.cloneNode(true);
 g.style.transform = getComputedStyle(e).transform;
 g.style.opacity = ".5"; g.style.zIndex = 58;
 g.style.filter = `drop-shadow(0 0 10px ${col}) blur(1.2px)`;
 document.body.appendChild(g);
 an(g, [{ opacity: .5 }, { opacity: 0 }], 340).then(() => g.remove());
 }
 requestAnimationFrame(step);
 };
 requestAnimationFrame(step);
 return () => { on = false; };
}
function sparkBurst(x, y, cols, n, spd) {
 for (let k = 0; k < n; k++) {
 const q = document.createElement("div"), c = cols[k % cols.length];
 const ang = Math.random() * 6.283, v = (spd || 90) * (.45 + Math.random() * .9), L = 9 + Math.random() * 15;
 q.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:${L}px;height:2.6px;margin:-1px 0 0 -${L}px;border-radius:2px;background:linear-gradient(90deg,transparent,${c});box-shadow:0 0 6px ${c};z-index:62;pointer-events:none`;
 document.body.appendChild(q);
 an(q, [
 { transform: `translate(0,0) rotate(${ang}rad) scaleX(1)`, opacity: 1 },
 { transform: `translate(${Math.cos(ang) * v}px,${Math.sin(ang) * v}px) rotate(${ang}rad) scaleX(.9)`, opacity: 1, offset: .55 },
 { transform: `translate(${Math.cos(ang) * v * 1.15}px,${Math.sin(ang) * v * 1.15 + 50}px) rotate(${ang + .6}rad) scaleX(.2)`, opacity: 0 }
 ], 520 + Math.random() * 300, { easing: "ease-out" }).then(() => q.remove());
 }
}
function starburst(x, y, col, sz) {
 const pts = [];
 for (let k = 0; k < 20; k++) { const a = k * Math.PI / 10, r = k % 2 ? 22 : 48; pts.push((Math.cos(a) * r).toFixed(1) + "," + (Math.sin(a) * r).toFixed(1)); }
 const e = fxBox(`<svg viewBox="-50 -50 100 100"><polygon points="${pts.join(" ")}" fill="${col}" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><circle r="14" fill="#fff"/></svg>`, sz, x, y);
 e.style.filter = `drop-shadow(0 0 16px ${col})`; e.style.zIndex = 61;
 an(e, [{ transform: "scale(.2) rotate(-25deg)", opacity: 1 }, { transform: "scale(1.1) rotate(6deg)", opacity: 1, offset: .35 }, { transform: "scale(1.45) rotate(14deg)", opacity: 0 }], 520, { easing: "ease-out" }).then(() => e.remove());
}
function shock(x, y, col, sz) {
 const e = document.createElement("div");
 e.style.cssText = `position:fixed;left:${x - sz / 2}px;top:${y - sz / 2}px;width:${sz}px;height:${sz}px;border-radius:50%;border:3px solid ${col};box-shadow:0 0 16px ${col},inset 0 0 14px ${col}66;z-index:59;pointer-events:none`;
 document.body.appendChild(e);
 an(e, [{ transform: "scale(.15,.06)", opacity: .95 }, { transform: "scale(1.7,.62)", opacity: 0 }], 620, { easing: "ease-out" }).then(() => e.remove());
 const f = document.createElement("div");
 f.style.cssText = `position:fixed;left:${x - sz * .6}px;top:${y - sz * .6}px;width:${sz * 1.2}px;height:${sz * 1.2}px;border-radius:50%;background:radial-gradient(#fff,${col}88 40%,transparent 70%);z-index:58;pointer-events:none`;
 document.body.appendChild(f);
 an(f, [{ transform: "scale(.3)", opacity: .9 }, { transform: "scale(1.6)", opacity: 0 }], 300, { easing: "ease-out" }).then(() => f.remove());
}
function notes(x, y, col, n) {
 const g = [
   `<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M10 18V5l9-2v4l-7 1.6V18" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/><circle cx="7.5" cy="18" r="2.8" fill="currentColor"/></svg>`,
   `<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M8 18V6l11-2v12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="5.8" cy="18" r="2.5" fill="currentColor"/><circle cx="16.8" cy="16" r="2.5" fill="currentColor"/></svg>`,
   `<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M7 18V6l12-2v12M7 10l12-2" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><circle cx="5" cy="18" r="2.3" fill="currentColor"/><circle cx="17" cy="16" r="2.3" fill="currentColor"/></svg>`
 ];
 for (let k = 0; k < n; k++) {
 const q = document.createElement("div");
 const sz = Math.round(18 + Math.random() * 10);
 q.innerHTML = g[k % 3];
 q.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:${sz}px;height:${sz}px;color:${col};filter:drop-shadow(0 0 7px ${col});z-index:62;pointer-events:none`;
 document.body.appendChild(q);
 const dx = (Math.random() - .5) * 110, dy = -(50 + Math.random() * 60);
 an(q, [{ transform: "translate(0,0) scale(.4) rotate(0)", opacity: 0 }, { transform: `translate(${dx * .5}px,${dy * .5}px) scale(1.1) rotate(${dx / 4}deg)`, opacity: 1, offset: .35 }, { transform: `translate(${dx}px,${dy}px) scale(.8) rotate(${dx / 2}deg)`, opacity: 0 }], 800 + Math.random() * 300, { easing: "ease-out" }).then(() => q.remove());
 }
}

// ---- лід
function frostShards(x, y, n, spd) {
 const cols = ["#ffffff", "#bae6fd", "#7dd3fc", "#e0f7ff"];
 for (let k = 0; k < n; k++) {
 const q = document.createElement("div"), w = 6 + Math.random() * 10;
 q.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:${w}px;height:${w * 1.6}px;background:linear-gradient(135deg,#fff,${cols[k % 4]});clip-path:polygon(50% 0,100% 100%,0 100%);z-index:62;pointer-events:none;filter:drop-shadow(0 0 4px #7dd3fc)`;
 document.body.appendChild(q);
 const ang = Math.random() * 6.283, v = (spd || 70) * (.5 + Math.random());
 an(q, [
 { transform: "translate(0,0) rotate(0)", opacity: 1 },
 { transform: `translate(${Math.cos(ang) * v}px,${Math.sin(ang) * v - 14}px) rotate(${Math.random() * 360}deg)`, opacity: 1, offset: .5 },
 { transform: `translate(${Math.cos(ang) * v * 1.2}px,${Math.sin(ang) * v + 60}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }
 ], 800 + Math.random() * 300, { easing: "ease-out" }).then(() => q.remove());
 }
}
function frostShatter(i) {
 const el = $("p" + i); if (!el) return;
 const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
 frostShards(x, y, 22, 90); frostShards(x, r.bottom, 8, 40);
 ring(x, y, "#bae6fd", 120); pop(i, "ЛЬОД ТРІСНУВ", "#bae6fd"); snd("shatter");
}
async function iceFx(a, d) {
 strikeArrow(a, d, "#7dd3fc");
 await orb(a, d, "#e0f7ff");
 const D = seatC(d);
 snd("ice");
 ring(D.x, D.y, "#e0f7ff", 150); ring(D.x, D.y, "#7dd3fc", 105);
 frostShards(D.x, D.y, 18, 85);
 burst(d, "#bae6fd"); burst(d, "#ffffff");
 pop(d, "ЗАМОРОЖЕНО", "#bae6fd");
 if ($("fl").animate) $("fl").animate([{ opacity: .35, boxShadow: "inset 0 0 90px 25px #7dd3fc" }, { opacity: 0, boxShadow: "inset 0 0 90px 25px #7dd3fc" }], { duration: 500 });
 await sl(350);
}

function showTip(c, e) {
 let t = $("tip");
 if (!t) { t = document.createElement("div"); t.id = "tip"; document.body.appendChild(t); }
 const r = e.getBoundingClientRect(), v = val(c, P[0] ? P[0].hp : 100);
 previewCard(c);
 const hexNote = isColosseumHex(c, P[0] ? P[0].hp : 100)
 ? `<br><span style="color:#fda4af">${UI_IC.blood} <b>Спрага Колізею (HP > 60):</b> лікування заблоковане — карта працює як слабка атака на <b>−${colosseumHexDmg(c, P[0].hp)} HP</b>!</span>`
 : "";
 t.innerHTML = `<b style="color:${R[c.r].c}">${cardName(c)}</b> <small>${R[c.r].n}</small><br>${DESC[c.t](c, v)}${hexNote}`;
 t.style.display = "block";
 t.style.left = Math.max(115, Math.min(innerWidth - 115, r.left + r.width / 2)) + "px";
 t.style.bottom = (innerHeight - r.top + 14) + "px";
}
function hideTip() { const t = $("tip"); if (t) t.style.display = "none"; }


function shake(e) {
 if (typeof SETTINGS !== 'undefined' && !SETTINGS.shake) return;
 if (!e || !e.animate) return;
 const isPl = e.classList && e.classList.contains("pl");
 const b = isPl ? "translate(-50%, -50%) " : "";
 e.animate([
 { transform: b + "translateX(0)" },
 { transform: b + "translateX(-7px)" },
 { transform: b + "translateX(7px)" },
 { transform: b + "translateX(-4px)" },
 { transform: b + "translateX(0)" }
 ], { duration: 360 });
}

function pop(i, t, col) {
 const el = $("p" + i);
 if (!el) return;
 const s = document.createElement("span");
 s.className = "pop";
 s.textContent = t;
 s.style.color = col;
 el.appendChild(s);
 if (s.animate) {
 s.animate([
 { transform: "translate(-50%,0) scale(.6)", opacity: 0 },
 { transform: "translate(-50%,-16px) scale(1.3)", opacity: 1, offset: .25 },
 { transform: "translate(-50%,-52px) scale(1)", opacity: 0 }
 ], { duration: 1150 }).onfinish = () => s.remove();
 } else {
 setTimeout(() => s.remove(), 1100);
 }
}

function burst(i, col) {
 const el = $("p" + i);
 if (!el) return;
 const r = el.getBoundingClientRect();
 for (let k = 0; k < 12; k++) {
 const p = document.createElement("div");
 p.className = "pt";
 p.style.background = col;
 p.style.left = r.left + r.width / 2 + "px";
 p.style.top = r.top + r.height / 2 + "px";
 document.body.appendChild(p);
 const a = Math.random() * 6.28, d = 30 + Math.random() * 52;
 if (p.animate) {
 p.animate([
 { transform: "translate(0,0) scale(1)", opacity: 1 },
 { transform: `translate(${Math.cos(a) * d}px,${Math.sin(a) * d}px) scale(0)`, opacity: 0 }
 ], { duration: 550 + Math.random() * 300 }).onfinish = () => p.remove();
 } else {
 p.remove();
 }
 }
}

function sliceSeat(i, e) {
 const par = e.parentNode, mk = clip => {
 const c = e.cloneNode(true);
 c.removeAttribute("id"); c.querySelectorAll("[id]").forEach(x => x.removeAttribute("id"));
 c.className = "pl pl-medallion banner-" + (P[i]?.bannerId || "obsidian"); c.style.clipPath = clip; c.style.zIndex = 6; par.appendChild(c); return c;
 };
 const a = mk("polygon(0 0,100% 0,0 100%)"), b = mk("polygon(100% 0,100% 100%,0 100%)");
 e.style.visibility = "hidden";
 const base = "translate(-50%,-50%)", end = "grayscale(1) brightness(.6)";
 if (a.animate) {
 const sl = document.createElement("div");
 sl.className = "slash"; sl.style.left = e.style.left; sl.style.top = e.style.top; par.appendChild(sl);
 sl.animate([{ transform: base + " rotate(-40deg) scaleX(0)", opacity: 1 }, { transform: base + " rotate(-40deg) scaleX(1)", opacity: 1, offset: .35 }, { transform: base + " rotate(-40deg) scaleX(1.1)", opacity: 0 }], { duration: 520 }).onfinish = () => sl.remove();
 a.animate([{ transform: base }, { transform: base, offset: .3 }, { transform: base + " translate(-22px,10px) rotate(-14deg)", filter: end, opacity: .55 }], { duration: 1100, fill: "forwards", easing: "ease-in" });
 b.animate([{ transform: base }, { transform: base, offset: .3 }, { transform: base + " translate(18px,26px) rotate(16deg)", filter: end, opacity: .55 }], { duration: 1100, fill: "forwards", easing: "ease-in" });
 }
 burst(i, "#ff3b3b"); burst(i, "#ffffff"); snd("slice");
 if ($("stage").animate) $("stage").animate([{ transform: "scale(1)" }, { transform: "scale(1.05) rotate(-.8deg)" }, { transform: "scale(1)" }], { duration: 500 });
}

const AURA = {};
function auraKill(i) { const A = AURA[i]; if (!A) return; [...A.stones, A.pz, A.skull].forEach(e => e && e.remove()); delete AURA[i]; }
function auraPart(x, y, css, dx, dy, ms) {
 const e = document.createElement("div");
 e.style.cssText = `position:fixed;left:${x}px;top:${y}px;pointer-events:none;z-index:11;${css}`;
 document.body.appendChild(e);
 if (e.animate) e.animate([{ transform: "translate(0,0) scale(1)", opacity: .9 }, { transform: `translate(${dx}px,${dy}px) scale(.2)`, opacity: 0 }], { duration: ms, easing: "ease-out" }).onfinish = () => e.remove(); else e.remove();
}
function auraLoop(now) {
 requestAnimationFrame(auraLoop);
 const menu = $("ov") && $("ov").style.display === "flex";
 if (!P || !P.length || menu) { Object.keys(AURA).forEach(auraKill); return; }
 P.forEach((p, i) => {
 const el = $("p" + i);
 const blad = !!(el && p.alive && p.fx && p.fx.some(x => x.blad));
 const pz = el && p.alive && p.fx ? p.fx.filter(x => x.t === "p").length : 0;
 const fz = !!(el && p.alive && p.frost);
 const slw = !!(el && p.alive && p.slow > 0);
 let A = AURA[i];
 if (!blad && !pz && !fz && !slw) { if (A) auraKill(i); return; }
 if (!A) A = AURA[i] = { stones: [], pz: null, skull: null, tt: [0, 0, 0], tb: 0 };
 const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
 const shEl = el.querySelector(".pl-banner-shield");
 const sr = shEl ? shEl.getBoundingClientRect() : r;
 if (fz && now - (A.tf || 0) > 190) {
 A.tf = now;
 const uX = (Math.random() - 0.5) * 2; // -1..1
 const edgeY = sr.bottom - (1 - Math.abs(uX)) * (sr.height * 0.22);
 auraPart(cx + uX * (sr.width * 0.42), edgeY, "width:4px;height:4px;border-radius:50%;background:radial-gradient(circle,#fff,#7dd3fc 60%,transparent);box-shadow:0 0 8px #7dd3fc", (Math.random() - .5) * 8, 16 + Math.random() * 16, 900);
 if (Math.random() < .35) auraPart(sr.left + 8 + Math.random() * (sr.width - 16), sr.top + 8 + Math.random() * (sr.height * 0.72), "width:8px;height:8px;background:#fff;clip-path:polygon(50% 0,60% 40%,100% 50%,60% 60%,50% 100%,40% 60%,0 50%,40% 40%);filter:drop-shadow(0 0 4px #7dd3fc)", 0, -10, 750);
 }
 if (slw && now - (A.tsl || 0) > 165) {
 A.tsl = now;
 const dw = 5.5 + Math.random() * 4;
 const uX = (Math.random() - 0.5) * 2; // -1..1 по V-подібному низу щита
 const dx0 = cx + uX * (sr.width * 0.42);
 const dy0 = sr.bottom - Math.abs(uX) * (sr.height * 0.22) - 2;
 auraPart(dx0, dy0, `width:${dw}px;height:${dw * 1.45}px;border-radius:50% 50% 50% 50%/65% 65% 35% 35%;background:radial-gradient(circle at 35% 30%,#c084fc 0%,#18181b 55%,#09090b 100%);border:1px solid #a855f7;box-shadow:0 0 8px #9333ea`, (Math.random() - .5) * 5, 22 + Math.random() * 20, 950);
 if (Math.random() < .55) {
 const sw = 9 + Math.random() * 8;
 auraPart(sr.left + 10 + Math.random() * (sr.width - 20), sr.top + sr.height * .35 + Math.random() * (sr.height * .45), `width:${sw}px;height:${sw}px;border-radius:50%;background:radial-gradient(circle,rgba(192,132,252,0.55),rgba(88,28,135,0.2) 65%,transparent);filter:blur(1px)`, (Math.random() - .5) * 14, -(18 + Math.random() * 18), 900);
 }
 }
 if (blad && !A.stones.length) {
 for (let k = 0; k < 3; k++) { const q = fxBox(SVG_IC.r, 24, 0, 0); q.style.filter = "drop-shadow(0 0 9px #ef4444)"; A.stones.push(q); }
 } else if (!blad && A.stones.length) { A.stones.forEach(q => q.remove()); A.stones = []; }
 A.stones.forEach((q, k) => {
 const a = now / 1500 + k * 2.094, d = (Math.sin(a) + 1) / 2;
 const x = cx + Math.cos(a) * (sr.width * .56 + 8), y = (cy + 4) + Math.sin(a) * (sr.height * .44 + 8) + Math.sin(now / 800 + k) * 2.5;
 q.style.left = x - 12 + "px"; q.style.top = y - 12 + "px";
 q.style.transform = `scale(${.72 + .36 * d}) rotate(${now / 40 + k * 60}deg)`;
 q.style.opacity = .62 + .38 * d; q.style.zIndex = d > .5 ? 12 : 11;
 if (now - A.tt[k] > 170) { A.tt[k] = now; auraPart(x - 2, y - 2, "width:5px;height:5px;border-radius:50%;background:#f87171;box-shadow:0 0 8px #ef4444", (Math.random() - .5) * 10, 14 + Math.random() * 10, 750); }
 });
 if (A.pz && !A.pz.isConnected) { A.pz = null; }
 if (A.skull) { A.skull.remove(); A.skull = null; }
 if (pz && !A.pz && el) {
 A.pz = document.createElement("div");
 A.pz.className = "pl-poison-overlay";
 A.pz.innerHTML = `<svg viewBox="0 0 92 98" width="100%" height="100%" preserveAspectRatio="none" style="overflow:visible"><path d="M 10,1 H 82 A 9,9 0 0 1 91,10 V 73 L 46,96 L 1,73 V 10 A 9,9 0 0 1 10,1 Z" fill="rgba(132,204,22,0.16)" stroke="#a3e635" stroke-width="2.4" stroke-linejoin="round"/></svg>`;
 el.appendChild(A.pz);
 } else if (!pz && A.pz) { A.pz.remove(); A.pz = null; }
 if (A.pz) {
 if (now - A.tb > 240 / Math.min(pz, 3)) {
 A.tb = now;
 const sz = 4.2 + Math.random() * 4.8;
 auraPart(sr.left + 14 + Math.random() * Math.max(8, sr.width - 28), sr.bottom - 18, `width:${sz}px;height:${sz}px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#ecfccb,#84cc16 60%,#3f6212);box-shadow:0 0 8px #84cc16`, (Math.random() - .5) * 16, -(30 + Math.random() * 32), 1150);
 }
 }
 });
}
requestAnimationFrame(auraLoop);

function seatC(i) { const pEl = $("p" + i); const r = pEl.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, t: r.top }; }
function fxBox(html, size, x, y) {
 const e = document.createElement("div");
 e.className = "fxs";
 e.style.cssText = `position:fixed;left:${x - size / 2}px;top:${y - size / 2}px;width:${size}px;height:${size}px;z-index:60;pointer-events:none;filter:drop-shadow(0 6px 10px #000a)`;
 e.innerHTML = html; document.body.appendChild(e); return e;
}
const an = (e, k, ms, o) => e.animate ? e.animate(k, { duration: ms, fill: "forwards", ...o }).finished.catch(() => {}) : sl(ms);
function ring(x, y, col, sz) {
 const e = document.createElement("div");
 e.style.cssText = `position:fixed;left:${x - sz / 2}px;top:${y - sz / 2}px;width:${sz}px;height:${sz}px;border-radius:50%;border:4px solid ${col};box-shadow:0 0 18px ${col};z-index:59;pointer-events:none`;
 document.body.appendChild(e);
 an(e, [{ transform: "scale(.2)", opacity: 1 }, { transform: "scale(2.2)", opacity: 0 }], 520).then(() => e.remove());
}
function squash(i) { const e = $("p" + i); if (e && e.animate) e.animate([{ transform: "translate(-50%, -50%) scale(1, 1)" }, { transform: "translate(-50%, -50%) scale(1.22, .62)" }, { transform: "translate(-50%, -50%) scale(.94, 1.08)" }, { transform: "translate(-50%, -50%) scale(1, 1)" }], { duration: 480 }); }
function dizzy(i) {
 const D = seatC(i), st = [];
 for (let k = 0; k < 3; k++) { const q = fxBox(UI_IC.star, 20, D.x, D.t - 6); q.style.fontSize = "18px"; q.style.textAlign = "center"; q.style.filter = "none"; st.push(q); }
 const t0 = performance.now();
 const step = now => {
 const t = now - t0;
 if (t > 1100) { st.forEach(q => q.remove()); return; }
 st.forEach((q, k) => { const a = t / 150 + k * 2.094; q.style.transform = `translate(${Math.cos(a) * 34}px,${Math.sin(a) * 9}px)`; q.style.opacity = t > 800 ? 1 - (t - 800) / 300 : 1; });
 requestAnimationFrame(step);
 };
 requestAnimationFrame(step);
}
const STICK_SVG = `<svg viewBox="0 0 40 40"><path d="M20 2V32" stroke="#fde68a" stroke-width="5" stroke-linecap="round"/><circle cx="20" cy="34" r="4.5" fill="#fff7d6"/></svg>`;

function crackTable() {
 const st = $("stage").getBoundingClientRect();
 const d = document.createElement("div");
 d.style.cssText = `position:fixed;left:${st.left}px;top:${st.top}px;width:${st.width}px;height:${st.height}px;pointer-events:none;z-index:7`;
 const paths = ["M50 50L38 22", "M50 50L70 14", "M50 50L80 60", "M50 50L28 74", "M50 50L14 48", "M38 22L30 8", "M70 14L84 4", "M80 60L94 74", "M28 74L18 92", "M14 48L2 40", "M70 14L62 2"];
 d.innerHTML = `<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%;height:100%">${paths.map(p => `<path d="${p}" stroke="#fef3c7" stroke-width="1.4" fill="none" opacity=".9" vector-effect="non-scaling-stroke" style="filter:drop-shadow(0 0 3px #000)"/>`).join("")}</svg>`;
 document.body.appendChild(d);
 an(d, [{ opacity: 0, transform: "scale(1.04)" }, { opacity: 1, transform: "scale(1)", offset: .08 }, { opacity: 1, offset: .7 }, { opacity: 0 }], 2000).then(() => d.remove());
}
async function panFx(a, d, onHit) {
 const A = seatC(a), D = seatC(d), dx = D.x - A.x, hy = D.t - 34 - A.y;
 const T = (x, y, sc, r) => `translate(${x}px,${y}px) scale(${sc}) rotate(${r}deg)`;
 const e = fxBox(PAN_SVG, 132, A.x, A.y);
 e.style.filter = "drop-shadow(0 0 14px #fbbf24) drop-shadow(0 6px 10px #000a)";
 snd("swap");
 await an(e, [{ transform: "scale(.2) rotate(50deg)", opacity: 0 }, { transform: "scale(1.25) rotate(-95deg)", opacity: 1 }], 280, { easing: "cubic-bezier(.2,1.4,.4,1)" });
 ring(A.x, A.y, "#fde68a", 90);
 await an(e, [{ transform: "scale(1.25) rotate(-95deg)" }, { transform: T(dx * .05, -30, 1.45, -135) }], 220, { easing: "ease-out" });
 const stop = trail(e, "#fbbf24");
 await an(e, [{ transform: T(dx * .05, -30, 1.45, -135) }, { transform: T(dx * .55, hy - 150, 1.6, -335), offset: .55 }, { transform: T(dx, hy - 110, 1.55, -430) }], 380, { easing: "ease-in" });
 snd("throw");
 await an(e, [{ transform: T(dx, hy - 110, 1.55, -430) }, { transform: T(dx, hy, 1.25, -560) }], 140, { easing: "cubic-bezier(.6,0,1,.5)" });
 stop();
 onHit();
 const ix = D.x, iy = D.t + 4;
 starburst(ix, iy, "#fde68a", 170);
 sparkBurst(ix, iy, ["#ffffff", "#fde68a", "#fbbf24"], 28, 140);
 shock(ix, iy + 10, "#fde68a", 140);
 ring(ix, iy, "#ffffff", 120);
 setTimeout(() => ring(ix, iy, "#fde68a", 150), 110);
 squash(d); burst(d, "#fde68a"); burst(d, "#ffffff");
 snd("stun"); bell(); pop(d, "ДЗИНЬ!", "#fde68a"); dizzy(d);
 await an(e, [{ transform: T(dx, hy, 1.25, -560) }, { transform: T(dx, hy - 7, 1.34, -546) }, { transform: T(dx, hy, 1.25, -572) }, { transform: T(dx, hy - 4, 1.3, -554) }, { transform: T(dx, hy, 1.25, -560) }], 260);
 const stop2 = trail(e, "#fbbf24");
 await an(e, [{ transform: T(dx, hy, 1.25, -560) }, { transform: T(dx + 60, hy - 70, 1.2, -700), opacity: 1, offset: .35 }, { transform: T(dx + 95, hy + 130, 1, -830), opacity: 0 }], 620, { easing: "ease-in" });
 stop2(); e.remove();
}
async function drumFx(a, d, onHit) {
 const A = seatC(a), D = seatC(d), cy = A.y - 80, dx = D.x - A.x, hy = D.t - 18 - cy;
 const e = fxBox(DRUM_SVG, 132, A.x, cy);
 const glow = k => `drop-shadow(0 0 ${12 + k * 4}px #f87171) drop-shadow(0 6px 10px #000a)`;
 e.style.filter = glow(0);
 const sticks = [-1, 1].map(sg => { const q = fxBox(STICK_SVG, 96, A.x + sg * 46, cy - 72); q.style.rotate = (-sg * 28) + "deg"; q.style.filter = "drop-shadow(0 0 8px #fde68a)"; return q; });
 await an(e, [{ transform: "scale(.1)", opacity: 0 }, { transform: "scale(1.25)", opacity: 1, offset: .7 }, { transform: "scale(1)", opacity: 1 }], 300);
 const gaps = [170, 150, 130, 115, 100, 90];
 for (let k = 0; k < 6; k++) {
 const c = k % 2 ? "#fde68a" : "#f87171", st = sticks[k % 2], sg = k % 2 ? 1 : -1;
 if (st.animate) st.animate([{ translate: "0 0" }, { translate: `${-sg * 6}px 36px`, rotate: (sg * -8) + "deg" }, { translate: "0 0" }], { duration: 200, easing: "ease-in" });
 await sl(gaps[k] - 20);
 snd("hit", 10 + k * 4); snd("thud");
 ring(A.x, cy, c, 90 + k * 8); shock(A.x, cy + 40, c, 110 + k * 12); burst(a, c);
 sparkBurst(A.x, cy + 10, [c, "#ffffff"], 6 + k, 60 + k * 10);
 notes(A.x, cy - 20, c, k > 3 ? 2 : 1);
 e.style.filter = glow(k + 1);
 await an(e, [{ transform: "scale(1)" }, { transform: `scale(${1.1 + k * .03}) rotate(${k % 2 ? -5 : 5}deg)`, offset: .35 }, { transform: "scale(1)" }], Math.max(110, gaps[k] + 20));
 }
 sticks.forEach(q => q.remove());
 await an(e, [{ transform: "scale(1)" }, { transform: "scale(1.4) rotate(-22deg)" }], 220);
 const stop = trail(e, "#f87171");
 await an(e, [{ transform: "scale(1.4) rotate(-22deg)" }, { transform: `translate(${dx}px,${hy}px) scale(1.4) rotate(520deg)` }], 420, { easing: "cubic-bezier(.5,0,1,.6)" });
 stop(); e.remove();
 onHit();
 const px = D.x, py = D.t - 20, cols = ["#b91c1c", "#fef3c7", "#7c2d12", "#fde68a"];
 for (let k = 0; k < 16; k++) {
 const q = document.createElement("div"), w = 8 + Math.random() * 12;
 q.style.cssText = `position:fixed;left:${px}px;top:${py}px;width:${w}px;height:${w * .5}px;background:${cols[k % 4]};clip-path:polygon(0 0,100% 30%,70% 100%);z-index:61;pointer-events:none`;
 document.body.appendChild(q);
 const ang = -Math.PI * Math.random(), v = 60 + Math.random() * 110;
 an(q, [{ transform: "translate(0,0) rotate(0)", opacity: 1 }, { transform: `translate(${Math.cos(ang) * v}px,${Math.sin(ang) * v - 20}px) rotate(${Math.random() * 400}deg)`, opacity: 1, offset: .45 }, { transform: `translate(${Math.cos(ang) * v * 1.4}px,${Math.sin(ang) * v + 120}px) rotate(${Math.random() * 800}deg)`, opacity: 0 }], 900, { easing: "ease-out" }).then(() => q.remove());
 }
 starburst(px, py + 12, "#f87171", 190);
 sparkBurst(px, py + 12, ["#ffffff", "#fde68a", "#f87171"], 30, 150);
 shock(px, py + 34, "#f87171", 160);
 notes(px, py, "#fecaca", 3);
 crackTable();
 squash(d); ring(px, D.t + 10, "#f87171", 140); burst(d, "#fef3c7"); burst(d, "#f87171");
 snd("thunder"); pop(d, "ТРЯСК!", "#fca5a5"); dizzy(d);
 await sl(450);
}
function bloodFx(i) {
 return new Promise(res => {
 const st = [];
 for (let k = 0; k < 3; k++) { const q = fxBox(SVG_IC.r, 30, 0, 0); q.style.filter = "drop-shadow(0 0 10px #ef4444)"; q.style.zIndex = 62; st.push(q); }
 const pl = $("p" + i);
 if (pl && pl.animate) pl.animate([{ filter: "drop-shadow(0 0 0px #ef4444)" }, { filter: "drop-shadow(0 0 18px #ef4444)" }, { filter: "drop-shadow(0 0 0px #ef4444)" }], { duration: 2600 });
 snd("poison");
 const T0 = performance.now(), TT = 2600;
 const step = now => {
 const t = now - T0, C = seatC(i), grow = Math.min(1, t / 400), out = t > TT - 500 ? (t - (TT - 500)) / 500 : 0;
 const Rr = 66 * grow * (1 - out) + 4;
 st.forEach((q, k) => {
 const a = t / 260 + k * 2.094;
 q.style.left = C.x + Math.cos(a) * Rr - 15 + "px";
 q.style.top = C.y + Math.sin(a) * Rr * .6 - 15 + "px";
 q.style.transform = `scale(${(.6 + .5 * grow) * (1 - out * .7)}) rotate(${t / 3 + k * 40}deg)`;
 });
 if (t < TT) requestAnimationFrame(step);
 else { st.forEach(q => q.remove()); burst(i, "#ef4444"); burst(i, "#fecaca"); res(); }
 };
 requestAnimationFrame(step);
 });
}
function legendFx(c) {
 const d = document.createElement("div");
 d.style.cssText = "position:fixed;inset:0;z-index:75;pointer-events:none;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;overflow:hidden;background:radial-gradient(circle,#ffd70055 0%,#0a0514ee 70%);text-align:center";
 d.innerHTML = `<div style="position:absolute;left:50%;top:50%;width:200vmax;height:200vmax;margin:-100vmax 0 0 -100vmax;background:repeating-conic-gradient(#ffd7002e 0 7deg,transparent 7deg 20deg);animation:winSpin 6s linear infinite"></div><div class="fxs" style="position:relative;width:110px;height:110px;filter:drop-shadow(0 0 30px #ffd700)">${iconFor(c)}</div><b style="position:relative;font:900 clamp(30px,10vw,56px) var(--font-display);letter-spacing:.1em;color:#fff3c4;text-shadow:0 0 22px #ffc83d,0 0 50px #ffae00,0 4px 0 #6b4300">ЛЕГЕНДАРНА!</b><span style="position:relative;font:700 18px var(--font-display);letter-spacing:.2em;color:#ffe9a0;text-transform:uppercase;text-shadow:0 2px 8px #000">${cardName(c)}</span>`;
 document.body.appendChild(d); snd("thunder");
 if (!d.animate) { setTimeout(() => d.remove(), 1400); return sl(1400); }
 const k = d.children;
 k[1].animate([{ transform: "scale(.2) rotate(-90deg)", opacity: 0 }, { transform: "scale(1.25) rotate(8deg)", opacity: 1, offset: .5 }, { transform: "scale(1) rotate(0)" }], { duration: 700, easing: "ease-out" });
 k[2].animate([{ transform: "scale(2.4)", opacity: 0 }, { transform: "scale(1)", opacity: 1 }], { duration: 480, delay: 150, fill: "backwards", easing: "cubic-bezier(.2,1.6,.4,1)" });
 bigImpact(40);
 return d.animate([{ opacity: 0 }, { opacity: 1, offset: .12 }, { opacity: 1, offset: .82 }, { opacity: 0 }], 1500).finished.then(() => d.remove()).catch(() => d.remove());
}
function bigImpact(v) {
 const amp = Math.min(18, 5 + v / 5);
 ["stage", "topbar", "banner", "log", "hand"].map($).filter(Boolean).forEach(e => {
 if (!e.animate) return;
 const kf = [0, 1, 2, 3, 4, 5, 6].map(k => { const f = 1 - k / 7, sg = k % 2 ? 1 : -1; return { translate: `${sg * amp * f}px ${-sg * amp * f * .6}px` }; });
 kf.push({ translate: "0 0" });
 e.animate(kf, { duration: 520, easing: "ease-out" });
 });
 const ms = Math.min(220, 70 + v * 2);
 HS += ms;
 setTimeout(() => {
 if (!document.getAnimations) return;
 const as = document.getAnimations().filter(a => a.playState === "running");
 as.forEach(a => a.pause());
 setTimeout(() => as.forEach(a => { try { a.play(); } catch (e) {} }), ms);
 }, 0);
}

function hit(y, v) {
 if (v > 0) {
 SESSION_PREV_DMG[y] = true;
 if (P[y]) P[y].tookNextDmg = true;
 }
 if (v >= 30) bigImpact(v);
 ghostFlash(y, v);
 pop(y, "−" + v, "#ff6b6b");
 burst(y, "#ff5555");
 shake($("table"));
 snd("hit", v);
 if ($("fl").animate) $("fl").animate([{ opacity: y === 0 ? .85 : .3 }, { opacity: 0 }], { duration: y === 0 ? 550 : 380 });
 if ($("stage").animate) $("stage").animate([{ transform: "scale(1)" }, { transform: `scale(${1 + Math.min(v, 50) / 500}) rotate(${(Math.random() - .5) * 1.4}deg)` }, { transform: "scale(1)" }], { duration: 420, easing: "ease-out" });
 if (v >= 25) {
 const b = document.createElement("div");
 b.className = "big";
 b.textContent = "−" + v;
 document.body.appendChild(b);
 if (b.animate) b.animate([{ transform: "translate(-50%,-50%) scale(.3)", opacity: 0 }, { transform: "translate(-50%,-50%) scale(1.5)", opacity: 1, offset: .25 }, { transform: "translate(-50%,-62%) scale(1)", opacity: 0 }], { duration: 1050, easing: "ease-out" }).onfinish = () => b.remove(); else setTimeout(() => b.remove(), 900);
 }
}

const getTcOff = () => (innerWidth < 520 ? 48 : 68);
function throwCard(p, c, slot, hid) {
 const tcOff = getTcOff();
 const w = document.createElement("div");
 w.className = "tc";
 w.style.left = `calc(50% + ${slot ? tcOff : -tcOff}px)`;
 w.style.top = "50%";
 const e = hid ? hidEl(c) : cardEl(c, p);
 const l = document.createElement("div");
 l.className = "who";
 l.textContent = (slot ? "ЗАХ: " : "АТК: ") + P[p].name;
 w.append(e, l);
 const tb = $("table");
 tb.appendChild(w);
 const tr = tb.getBoundingClientRect(), sr = $("p" + p).getBoundingClientRect();
 const dx = sr.left + sr.width / 2 - (tr.left + tr.width / 2 + (slot ? tcOff : -tcOff)), dy = sr.top + sr.height / 2 - (tr.top + tr.height / 2);
 const tilt = slot ? 6 : -6, col = hid ? (slot ? "#8fd0ff" : "#ff8a80") : R[c.r].c;
 const land = () => { w.classList.add("landed"); impact(w, col, !"dphg".includes(c.t)); };
 if (w.animate) {
 const kf = slot ? [
 { transform: `translate(-50%,-50%) translate(${dx}px,${dy}px) scale(.7) rotate(0deg)`, opacity: 0 },
 { opacity: 1, offset: .3 },
 { transform: `translate(-50%,-50%) translate(${-dx * .06}px,0) scale(1.12) rotate(${tilt * 1.8}deg)`, opacity: 1, offset: .86 },
 { transform: `translate(-50%,-50%) scale(1) rotate(${tilt}deg)`, opacity: 1 }
 ] : [
 { transform: `translate(-50%,-50%) translate(${dx}px,${dy}px) scale(.5) rotate(-300deg)`, opacity: 0 },
 { transform: `translate(-50%,-50%) translate(${dx * .45}px,${dy * .45 - 90}px) scale(1.5) rotate(-120deg)`, opacity: 1, offset: .45 },
 { transform: `translate(-50%,-50%) scale(1.2) rotate(${tilt}deg)`, opacity: 1, offset: .82 },
 { transform: `translate(-50%,-50%) scale(1) rotate(${tilt}deg)`, opacity: 1 }
 ];
 w.animate(kf, { duration: slot ? 640 : 780, easing: slot ? "cubic-bezier(.2,.8,.2,1)" : "cubic-bezier(.3,.7,.4,1)", fill: "forwards" }).onfinish = land;
 } else land();
 snd("throw");
 T[p] = { e };
}

function impact(w, col, sp) {
 const r = w.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
 if (!w.animate) return;
 const ring = document.createElement("div");
 ring.className = "pt";
 ring.style.cssText = `left:${x - 30}px;top:${y - 30}px;width:60px;height:60px;border-radius:50%;border:3px solid ${col};background:none;box-shadow:0 0 18px ${col}`;
 document.body.appendChild(ring);
 ring.animate([{ transform: "scale(.4)", opacity: .9 }, { transform: "scale(4.5)", opacity: 0 }], { duration: 650, easing: "ease-out" }).onfinish = () => ring.remove();
 for (let k = 0; k < 14; k++) {
 const d = document.createElement("div");
 d.className = "pt";
 d.style.cssText = `left:${x}px;top:${y + 30}px;background:${col}`;
 document.body.appendChild(d);
 const a = Math.random() * Math.PI - Math.PI, m = 40 + Math.random() * 60;
 d.animate([{ transform: "translate(0,0) scale(1)", opacity: 1 }, { transform: `translate(${Math.cos(a) * m}px,${Math.abs(Math.sin(a)) * -m * .5}px) scale(0)`, opacity: 0 }], { duration: 500 + Math.random() * 300 }).onfinish = () => d.remove();
 }
 $("stage").animate([{ transform: "translate(0,0) scale(1)" }, { transform: "translate(0,5px) scale(1.012)" }, { transform: "translate(0,-2px)" }, { transform: "translate(0,0) scale(1)" }], { duration: 320 });
 snd(sp ? "thunder" : "thud");
}

function strikeArrow(x, y, col) {
 const svg = $("arrows"), S = $("world").offsetWidth;
 svg.setAttribute("viewBox", `0 0 ${S} ${S}`);
 const [x1, y1] = getPlayerPos(x, S);
 const [x2, y2] = getPlayerPos(y, S);
 const L = Math.hypot(x2 - x1, y2 - y1) || 1, ux = (x2 - x1) / L, uy = (y2 - y1) / L, pd = 48, hl = 24;
 const tx = x2 - ux * pd, ty = y2 - uy * pd, bx = tx - ux * hl, by = ty - uy * hl;
 const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
 g.style.filter = `drop-shadow(0 0 7px ${col})`;
 g.innerHTML = `<line x1="${x1 + ux * pd}" y1="${y1 + uy * pd}" x2="${bx}" y2="${by}" stroke="${col}" stroke-width="7" stroke-linecap="round"/><polygon points="${tx},${ty} ${bx - uy * 13},${by + ux * 13} ${bx + uy * 13},${by - ux * 13}" fill="${col}"/>`;
 svg.appendChild(g);
 if (g.animate) g.animate([{ opacity: 0 }, { opacity: 1, offset: .2 }, { opacity: 1, offset: .7 }, { opacity: 0 }], { duration: 950 }).onfinish = () => g.remove(); else setTimeout(() => g.remove(), 900);
}

async function reveal(p, c) {
 if (!T[p] || !T[p].e) return;
 const o = T[p].e;
 if (o.animate) await o.animate([{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }], { duration: 160 }).finished;
 const e = cardEl(c, p);
 o.replaceWith(e);
 T[p].e = e;
 if (e.animate) await e.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: 160 }).finished;
}


function addFx(i, c, half, casterIdx = -1) {
 const isBasilisk = c.t === "p" && casterIdx >= 0 && typeof hasRelic === "function" && hasRelic(casterIdx, "fang_basilisk");
 const extraDur = isBasilisk ? 1 : 0;
 let regVal = healAmt(20);
 if (c.t === "g" && typeof hasRelic === "function" && hasRelic(i, "cup_asclepius")) {
   regVal = Math.round(regVal * 1.2);
 }
 P[i].fx.push({ t: c.t, v: c.t === "p" ? (half ? 8 : 15) : regVal, left: DUR[c.r] + durBonus() + extraDur, uncurable: isBasilisk });
 pop(i, c.t === "p" ? (isBasilisk ? "ОТРУТА ВАСИЛІСКА!" : "ОТРУЄНИЙ") : "ВІДНОВЛЕННЯ", c.t === "p" ? "#8bd35a" : "#4ade80");
 burst(i, c.t === "p" ? "#8bd35a" : "#4ade80");
 snd(c.t === "p" ? "poison" : "heal");
 upd();
}


// Преферанс: cine-рулетка 1.2 с (0–0.5 запуск, 0.5–0.7 фіксація, 0.7–1.2 розкриття масті)
function suitFx(S) {
 const idx = SUITS.indexOf(S), d = document.createElement("div");
 d.style.cssText = "position:fixed;inset:0;z-index:72;pointer-events:none;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle,#064e3be6,#020a06f7);border-top:9vh solid #000;border-bottom:9vh solid #000";
 const ring = document.createElement("div");
 ring.style.cssText = "position:relative;width:230px;height:230px;border-radius:50%;border:3px solid #fbbf24;box-shadow:0 0 40px #fbbf2466,inset 0 0 40px #fbbf2433";
 const tr = [], gl = SUITS.map((q, k) => {
 const g = document.createElement("div"), a = k * Math.PI / 2;
 tr[k] = `translate(${Math.sin(a) * 82}px,${-Math.cos(a) * 82}px)`;
 g.innerHTML = q.icon || UI_IC.suitSpade;
 g.style.cssText = `position:absolute;left:50%;top:50%;width:52px;height:52px;margin:-26px 0 0 -26px;display:flex;align-items:center;justify-content:center;color:${q.c};filter:drop-shadow(0 0 16px ${q.c});transform:${tr[k]}`;
 const svgEl = g.querySelector("svg");
 if (svgEl) { svgEl.style.width = "48px"; svgEl.style.height = "48px"; }
 ring.appendChild(g); return g;
 });
 const ar = document.createElement("div");
 ar.style.cssText = "position:absolute;left:50%;top:50%;width:6px;height:100px;margin:-100px 0 0 -3px;transform-origin:50% 100%;background:linear-gradient(#fde047,#f59e0b);border-radius:3px;box-shadow:0 0 14px #fbbf24";
 const nm = document.createElement("div");
 nm.style.cssText = "position:absolute;left:0;right:0;bottom:11vh;text-align:center;font:900 30px/1 var(--font-display);letter-spacing:3px";
 ring.appendChild(ar); d.append(ring, nm); document.body.appendChild(d); snd("swap");
 if (ring.animate) {
 ring.animate([{ transform: "scale(.2)", opacity: 0 }, { transform: "scale(1)", opacity: 1 }], { duration: 300, easing: "ease-out" });
 ar.animate([{ transform: "rotate(0deg)" }, { transform: `rotate(${720 + idx * 90}deg)` }], { duration: 700, easing: "cubic-bezier(.1,.8,.25,1)", fill: "forwards" });
 }
 return new Promise(r => setTimeout(() => {
 snd("shield"); ar.style.opacity = .3;
 gl.forEach((g, k) => { if (k !== idx) g.style.opacity = .08; });
 nm.innerHTML = `<span style="display:inline-flex;align-items:center;gap:10px;justify-content:center">${S.icon || ""}<span>${S.n}</span></span>`; nm.style.color = S.c; nm.style.textShadow = "0 0 20px " + S.c;
 if (gl[idx].animate) gl[idx].animate([{ transform: tr[idx] + " scale(1)" }, { transform: tr[idx] + " scale(4.5)", opacity: 1 }], { duration: 500, fill: "forwards", easing: "ease-out" });
 setTimeout(() => { d.remove(); r(); }, 520);
 }, 700));
}
// Піка: чорно-сталевий наконечник пробиває стіл
async function spikeFx(a, d, onHit) {
 const C = seatC(d), e = document.createElement("div");
 e.innerHTML = `<svg viewBox="0 0 40 120"><path d="M20 118L4 30 20 2l16 28z" fill="#1f2937" stroke="#a78bfa" stroke-width="2.5"/><path d="M20 116V6" stroke="#e5e7eb" stroke-width="1.5"/></svg>`;
 e.style.cssText = `position:fixed;left:${C.x - 40}px;top:${C.y - 170}px;width:80px;height:240px;z-index:63;pointer-events:none;filter:drop-shadow(0 0 16px #a78bfa)`;
 document.body.appendChild(e); snd("slice");
 if (e.animate) await e.animate([{ transform: "translateY(-80vh) scale(.6)", opacity: 0 }, { transform: "translateY(0) scale(1.1)", opacity: 1, offset: .7 }, { transform: "translateY(8px) scale(1)", opacity: 1 }], { duration: 420, easing: "ease-in" }).finished.catch(() => {});
 onHit(); snd("shatter"); crackTable();
 shock(C.x, C.y, "#a78bfa", 180); sparkBurst(C.x, C.y, ["#a78bfa", "#fff", "#ef4444"], 24, 110); starburst(C.x, C.y, "#7c3aed", 120);
 pop(d, "−40 HP ПІКА (ПРОБИВ)", "#f87171"); bigImpact(40);
 if (e.animate) await e.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260 }).finished.catch(() => {});
 e.remove();
}
// Мйольнір: кидок по дузі з обертанням → очищення в польоті → удар і блискавка в один кадр → відскок
async function mjolFx(a, d, onHit) {
 const A0 = seatC(a), D = seatC(d), W = innerWidth, H = innerHeight;
 const bars = document.createElement("div"), h = document.createElement("div"), cl = document.createElement("div");
 bars.style.cssText = "position:fixed;inset:0;z-index:2;pointer-events:none;border-top:9vh solid #000;border-bottom:9vh solid #000;background:#020617aa";
 cl.style.cssText = `position:fixed;left:${D.x - 150}px;top:${D.y - 130}px;width:300px;height:110px;z-index:69;pointer-events:none;opacity:0;background:radial-gradient(ellipse,#0f172a,#334155cc 55%,transparent 72%)`;
 h.innerHTML = SVG_IC.o;
 h.style.cssText = "position:fixed;left:0;top:0;width:130px;height:130px;margin:-65px 0 0 -65px;z-index:71;pointer-events:none;will-change:transform;opacity:0;filter:drop-shadow(0 0 22px #38bdf8)";
 document.body.append(bars, cl, h); snd("thunder");
 if (bars.animate) bars.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
 const sgn = A0.x < W / 2 ? 1 : -1;
 const P0 = [A0.x, A0.y], P1 = [(A0.x + D.x) / 2 + sgn * 170, Math.min(A0.y, D.y) - H * .5], P2 = [D.x, D.y];
 const pos = e => [(1 - e) * (1 - e) * P0[0] + 2 * (1 - e) * e * P1[0] + e * e * P2[0], (1 - e) * (1 - e) * P0[1] + 2 * (1 - e) * e * P1[1] + e * e * P2[1]];
 const T = 680, t0 = performance.now(); let cleansed = false, lastTrail = 0, fin;
 await new Promise(res => {
 const step = now => {
 const u = Math.min(1, (now - t0) / T), e = Math.pow(u, 2.1), p = pos(e);
 const rot = -200 + 1260 * e, sc = .55 + 1.05 * e;
 fin = `translate(${p[0]}px,${p[1]}px) rotate(${rot}deg) scale(${sc})`;
 h.style.transform = fin; h.style.opacity = Math.min(1, u * 8);
 if (now - lastTrail > 40) { lastTrail = now; sparkBurst(p[0], p[1], ["#7dd3fc", "#e0f2fe"], 2, 25); }
 if (u > .45 && !cleansed) {
 cleansed = true; cl.style.opacity = 1; snd("shatter");
 P[d].fx = P[d].fx.filter(x => x.t === "p" || x.t === "b"); P[d].thorn = 0; upd();
 const C = seatC(d); frostShards(C.x, C.y - 20, 14, 80); pop(d, "ОЧИЩЕННЯ", "#38bdf8");
 }
 if (u >= 1) res(); else requestAnimationFrame(step);
 };
 requestAnimationFrame(step);
 });
 // ===== ІМПАКТ: усе в одному кадрі =====
 onHit(); snd("thunder");
 const fl = document.createElement("div");
 fl.style.cssText = "position:fixed;inset:0;z-index:75;pointer-events:none;background:radial-gradient(circle,#fff 0,#e0f2fe 40%,#7dd3fc 100%)";
 const jit = n => (Math.random() - .5) * n;
 let bd = `M${D.x + jit(40)} -20`, y = -20;
 const steps = 9, br = [];
 for (let k = 1; k <= steps; k++) {
 y = -20 + (D.y + 20) * k / steps;
 const x = k === steps ? D.x : D.x + jit(70 * (1 - k / steps) + 8);
 bd += `L${x.toFixed(1)} ${y.toFixed(1)}`;
 if (k > 2 && k < steps && Math.random() < .6) br.push(`M${x.toFixed(1)} ${y.toFixed(1)}l${jit(150).toFixed(1)} ${(30 + Math.random() * 60).toFixed(1)}l${jit(60).toFixed(1)} ${(20 + Math.random() * 40).toFixed(1)}`);
 }
 const bz = document.createElement("div");
 bz.style.cssText = "position:fixed;inset:0;z-index:76;pointer-events:none;filter:drop-shadow(0 0 14px #38bdf8)";
 bz.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><g fill="none" stroke-linejoin="bevel" stroke-linecap="round"><path d="${bd}${br.join("")}" stroke="#38bdf8" stroke-width="11" opacity=".55"/><path d="${bd}" stroke="#fff" stroke-width="4"/><path d="${br.join("")}" stroke="#e0f2fe" stroke-width="2"/></g></svg>`;
 document.body.append(fl, bz);
 const C = seatC(d);
 crackTable(); bigImpact(45);
 shock(C.x, C.y, "#ffffff", 150); setTimeout(() => shock(C.x, C.y, "#7dd3fc", 250), 70); setTimeout(() => shock(C.x, C.y, "#38bdf8", 340), 150);
 sparkBurst(C.x, C.y, ["#38bdf8", "#fde047", "#fff"], 34, 140); frostShards(C.x, C.y, 22, 130); starburst(C.x, C.y, "#bae6fd", 150);
 shake($("p" + d));
 // відскок із вагою
 const bx = D.x + (A0.x - D.x) * .25, by = D.y - 110;
 const rb = h.animate ? h.animate([
 { transform: fin, opacity: 1 },
 { transform: `translate(${bx}px,${by}px) rotate(1500deg) scale(1.25)`, opacity: 1, offset: .5, easing: "cubic-bezier(.5,0,.9,.5)" },
 { transform: `translate(${bx + sgn * 40}px,${by + 80}px) rotate(1700deg) scale(.9)`, opacity: 0 }
 ], { duration: 520, easing: "cubic-bezier(.1,.7,.3,1)", fill: "forwards" }).finished.catch(() => {}) : sl(520);
 an(fl, [{ opacity: 1 }, { opacity: 0 }], 360).then(() => fl.remove());
 an(bz, [{ opacity: 1 }, { opacity: .2, offset: .25 }, { opacity: 1, offset: .4 }, { opacity: 0 }], 380).then(() => bz.remove());
 await rb;
 h.remove(); cl.remove();
 await an(bars, [{ opacity: 1 }, { opacity: 0 }], 200);
 bars.remove();
}
// Шип рози: сталеві лози-змії обвивають аватар знизу вгору, змикаються в кокон, з якого вистрілюють шипи
async function thornFx(i) {
 const pl = $("p" + i);
 const r = pl ? pl.getBoundingClientRect() : { left: 0, top: 0, width: 96, height: 112 };
 const C = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
 const pad = 26, W = r.width + pad * 2, H = r.height + pad * 2, cx = W / 2, cy = H / 2;
 const vg = document.createElement("div"), s = document.createElement("div");
 vg.style.cssText = `position:fixed;inset:0;z-index:61;pointer-events:none;background:radial-gradient(circle at ${C.x}px ${C.y}px,#e11d4833 0,#00000088 38%,#1a0004dd 100%)`;
 s.style.cssText = `position:fixed;left:${r.left - pad}px;top:${r.top - pad}px;width:${W}px;height:${H}px;z-index:62;pointer-events:none;filter:drop-shadow(0 0 12px #e11d48)`;
 const defs = `<defs><linearGradient id="thS" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#050506"/><stop offset=".3" stop-color="#3f3f46"/><stop offset=".48" stop-color="#b4b4be"/><stop offset=".66" stop-color="#27272a"/><stop offset="1" stop-color="#050506"/></linearGradient></defs>`;
 // Ширина щита звужується до вістря в нижніх 24%, повторюючи силует .pl-banner-shield
 const shieldHalfW = (t) => {
  const baseHw = r.width * 0.48;
  if (t < 0.24) return baseHw * (0.14 + 0.86 * (t / 0.24));
  return baseHw;
 };
 let body = "", sp = [];
 const vines = [{ ph: 0, tn: 2.3, w: 5.5 }, { ph: Math.PI, tn: 2.3, w: 5.5 }, { ph: Math.PI / 2, tn: 2.9, w: 3.8 }];
 vines.forEach((vn, k) => {
 let dd = "";
 for (let j = 0; j <= 64; j++) {
 const t = j / 64, ang = vn.ph + t * vn.tn * 2 * Math.PI;
 const curHw = shieldHalfW(t);
 const x = cx + (curHw + 3 * Math.sin(t * 28 + k)) * Math.sin(ang);
 const y = (H - pad + 2) - t * (H - 2 * pad - 10) + 2.2 * Math.cos(t * 20 + k);
 dd += (j ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
 if (j > 5 && j % 7 === 0 && j < 62) sp.push([x, y, k]);
 }
 body += `<g class="vz" data-k="${k}"><path pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" d="${dd}" stroke="#050506" stroke-width="${vn.w + 2.6}" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" d="${dd}" stroke="url(#thS)" stroke-width="${vn.w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" d="${dd}" stroke="#71717a" stroke-width="${vn.w * .35}" fill="none" stroke-linecap="round" style="stroke-dasharray:.012 .012"/><path class="rl" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" d="${dd}" stroke="#e11d48" stroke-width="1.3" fill="none" stroke-linecap="round" opacity=".85"/></g>`;
 });
 let spk = "";
 sp.forEach(([x, y, k]) => {
 const ang = Math.atan2((y - cy) * .55, x - cx), len = 14 + Math.random() * 10, tx = x + Math.cos(ang) * len, ty = y + Math.sin(ang) * len, nx = Math.cos(ang + 1.57) * 2.4, ny = Math.sin(ang + 1.57) * 2.4;
 spk += `<g class="sk" style="transform-origin:${x.toFixed(1)}px ${y.toFixed(1)}px"><polygon points="${(x + nx).toFixed(1)},${(y + ny).toFixed(1)} ${tx.toFixed(1)},${ty.toFixed(1)} ${(x - nx).toFixed(1)},${(y - ny).toFixed(1)}" fill="#18181b" stroke="#fb7185" stroke-width="1"/><circle cx="${tx.toFixed(1)}" cy="${ty.toFixed(1)}" r="2" fill="#fb7185"/></g>`;
 });
 s.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs}${body}<g class="sg">${spk}</g></svg>`;
 document.body.append(vg, s); snd("slice");
 if (vg.animate) vg.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, fill: "forwards" });
 // лози повзуть знизу вгору, кожна зі своїм запізненням і різким "ривком"
 s.querySelectorAll(".vz").forEach(g => {
 const k = +g.dataset.k;
 g.querySelectorAll("path").forEach(p => {
 if (p.animate && !p.getAttribute("style")) p.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: .35, offset: .55 }, { strokeDashoffset: 0 }], { duration: 780, delay: k * 130, fill: "forwards", easing: "cubic-bezier(.4,.1,.2,1)" });
 else if (p.animate) p.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 780, delay: k * 130, fill: "forwards" });
 });
 });
 setTimeout(() => { snd("shield"); burst(i, "#e11d48"); }, 600);
 // кокон стискається
 if (pl && pl.animate) pl.animate([{ transform: "translate(-50%, -50%) scale(1)" }, { transform: "translate(-50%, -50%) scale(.955)", offset: .45 }, { transform: "translate(-50%, -50%) scale(1.03)", offset: .75 }, { transform: "translate(-50%, -50%) scale(1)" }], { duration: 560, delay: 850, easing: "ease-in-out" });
 if (pl && pl.animate) pl.animate([{ filter: "drop-shadow(0 0 0px #e11d48)" }, { filter: "brightness(1.25) drop-shadow(0 0 18px #e11d48)" }, { filter: "drop-shadow(0 0 6px #e11d48)" }], { duration: 900, delay: 850, easing: "ease-out" });
 // шипи різко висуваються
 s.querySelectorAll(".sk").forEach((g, k) => g.animate && g.animate([{ transform: "scale(0)" }, { transform: "scale(1.3)", offset: .6 }, { transform: "scale(1)" }], { duration: 200, delay: 900 + k * 14, fill: "both", easing: "cubic-bezier(.2,.9,.3,1.2)" }));
 const sg = s.querySelector(".sg");
 if (sg && sg.animate) sg.animate([{ filter: "drop-shadow(0 0 2px #e11d48)" }, { filter: "drop-shadow(0 0 12px #fb7185)" }], { duration: 340, delay: 1000, iterations: 4, direction: "alternate" });
 s.querySelectorAll(".rl").forEach(p => p.animate && p.animate([{ opacity: .35 }, { opacity: 1 }], { duration: 340, delay: 900, iterations: 4, direction: "alternate" }));
 await sl(1000); shock(C.x, C.y, "#e11d48", 230); burst(i, "#14532d");
 await sl(500);
 an(s, [{ opacity: 1 }, { opacity: 0 }], 420).then(() => s.remove());
 an(vg, [{ opacity: 1 }, { opacity: 0 }], 420).then(() => vg.remove());
}
// Контрудар: 3 криваво-сталеві голки + яскравий спалах лози
function needlesFx(f, t) {
 const A = seatC(f), B = seatC(t), ang = Math.atan2(B.y - A.y, B.x - A.x);
 const pf = $("p" + f);
 if (pf) {
 const ta = pf.querySelector(".ta"), tv = pf.querySelector(".thorn-vine-sh");
 if (ta && ta.animate) ta.animate([{ filter: "brightness(1) drop-shadow(0 0 12px #e11d48)" }, { filter: "brightness(2.2) drop-shadow(0 0 26px #fb7185)" }, { filter: "brightness(1) drop-shadow(0 0 12px #e11d48)" }], { duration: 420 });
 if (tv && tv.animate) tv.animate([{ boxShadow: "inset 0 0 10px #881337cc" }, { boxShadow: "inset 0 0 26px #fb7185" }, { boxShadow: "inset 0 0 10px #881337cc" }], { duration: 420 });
 }
 snd("slice");
 for (let k = 0; k < 3; k++) {
 const n = document.createElement("div");
 n.style.cssText = `position:fixed;left:${A.x}px;top:${A.y + (k - 1) * 10}px;width:34px;height:4px;margin-left:-17px;border-radius:2px;background:linear-gradient(90deg,transparent,#fecaca,#991b1b);box-shadow:0 0 8px #e11d48;z-index:64;pointer-events:none`;
 document.body.appendChild(n);
 an(n, [{ transform: `translate(0,0) rotate(${ang}rad)`, opacity: 1 }, { transform: `translate(${B.x - A.x}px,${B.y - A.y}px) rotate(${ang}rad)`, opacity: 1 }], 300 + k * 60, { easing: "ease-in" }).then(() => n.remove());
 }
 setTimeout(() => { burst(t, "#991b1b"); shake($("p" + t)); }, 380);
 return sl(480);
}
// Горіння: стиск → вибух (із збереженням центрування translate(-50%, -50%))
async function burnFx(i) {
 const pl = $("p" + i);
 pop(i, "ГОРІННЯ", "#f97316"); snd("thunder");
 if (pl && pl.animate) await pl.animate([
 { transform: "translate(-50%, -50%) scale(1)" },
 { transform: "translate(-50%, -50%) scale(.93)", offset: .5 },
 { transform: "translate(-50%, -50%) scale(1.06)", offset: .75 },
 { transform: "translate(-50%, -50%) scale(1)" }
 ], { duration: 520 }).finished.catch(() => {});
 const C = seatC(i);
 shock(C.x, C.y, "#ea580c", 200); sparkBurst(C.x, C.y, ["#ea580c", "#fde047", "#7f1d1d"], 26, 100); starburst(C.x, C.y, "#f97316", 110);
 shake(pl);
}
// Трефа (Штраф): карта вилітає з руки ворога і розсипається на попіл
function ashFx(i, name) {
 const C = seatC(i), q = document.createElement("div");
 q.style.cssText = `position:fixed;left:${C.x - 22}px;top:${C.y - 30}px;width:44px;height:60px;border-radius:6px;background:linear-gradient(135deg,#065f46,#022c22);border:2px solid #fbbf24;z-index:63;pointer-events:none`;
 document.body.appendChild(q);
 an(q, [{ transform: "translateY(0) rotate(0) scale(1)", opacity: 1 }, { transform: "translateY(-70px) rotate(540deg) scale(1.2)", opacity: 1, offset: .6 }, { transform: "translateY(-30px) rotate(720deg) scale(.4)", opacity: 0 }], 900).then(() => q.remove());
 setTimeout(() => { sparkBurst(C.x, C.y - 60, ["#9ca3af", "#6b7280", "#374151"], 18, 60); snd("shatter"); }, 600);
 pop(i, "СКИДАННЯ: " + name, "#34d399");
}
// палаючі іскри та попіл над тими, хто горить
setInterval(() => {
 if (!P || !P.length) return;
 P.forEach((p, i) => {
 if (!p.alive || !p.fx || !p.fx.some(f => f.t === "b")) return;
 const e = $("p" + i); if (!e) return;
 const r = e.getBoundingClientRect(), q = document.createElement("div");
 q.style.cssText = `position:fixed;left:${r.left + Math.random() * r.width}px;top:${r.bottom - 8}px;width:5px;height:5px;border-radius:50%;background:${["#fde047", "#f97316", "#475569"][rnd(3)]};box-shadow:0 0 6px #f97316;z-index:60;pointer-events:none`;
 document.body.appendChild(q);
 an(q, [{ transform: "translateY(0)", opacity: 1 }, { transform: `translate(${(Math.random() - .5) * 30}px,-${60 + Math.random() * 50}px)`, opacity: 0 }], 900).then(() => q.remove());
 });
}, 260);

async function tickFx() {
 let unlocked = false, statusChanged = false;
 P.forEach(p => { if (p.noHeal > 0) { p.nhAge = (p.nhAge || 0) + 1; if (p.nhAge > 2) { p.noHeal = 0; p.nhAge = 0; statusChanged = true; } } });
 P.forEach(p => { if (p.disorient > 0) { p.dsAge = (p.dsAge || 0) + 1; if (p.dsAge > 1) { p.disorient = 0; p.dsAge = 0; statusChanged = true; } } });
 P.forEach(p => { (p.hand || []).forEach(c => { if (c.pz > 0) { c.pz--; if (!c.pz) unlocked = true; } }); });
 const hadEffects = P.some(p => p.alive && (p.fx.length || p.timeLock > 0));
 if (hadEffects) {
 $("banner").innerHTML = "Коло завершено — діють ефекти";
 const ev = [];
 for (let i = 0; i < n; i++) {
 const p = P[i];
 if (!p.alive || (!p.fx.length && !(p.timeLock > 0))) continue;
 const isTimeLocked = (p.timeLock || 0) > 0;
 if (isTimeLocked && p.fx.some(f => f.t === "p" || f.t === "b" || f.t === "g")) {
  pop(i, "ТАЙМЕРИ ЗАМОРОЖЕНО", "#7dd3fc");
  burst(i, "#7dd3fc");
  ev.push(`${p.name}: «Окови часу» заморозили лічильники ефектів на це коло!`);
 }
 let dm = 0, hl = 0, bn = 0, scDmg = 0, hestiaBlocked = false, burnBlocked = false;
 const hasActiveBurn = p.fx.some(f => f.t === "b");
 p.fx.forEach(f => {
  if (isTimeLocked && (f.t === "p" || f.t === "b" || f.t === "g")) return;
  if (f.wait > 0) { f.wait--; return; }
  if (f.t === "sc") { scDmg += f.v; }
  else if (f.t === "b") {
   if (p.burnImmune > 0) { burnBlocked = true; }
   else { dm += f.v; bn = 1; }
  }
  else if (f.t === "p") { dm += f.v; }
  else if (f.t === "g") {
   if (f.hestia && hasActiveBurn) { hestiaBlocked = true; }
   else { hl += f.v; }
  }
  f.left--;
 });
 p.fx = p.fx.filter(f => f.left > 0);
 if (hestiaBlocked) {
  pop(i, "ВОГНИЩЕ ЗГАСЛО (ГОРІННЯ)", "#fb923c");
  ev.push(`${p.name}: Іскра Гестії не лікує під час «Горіння»`);
 }
 if (burnBlocked) {
  pop(i, "ІМУНІТЕТ ДО ГОРІННЯ!", "#fb923c");
  burst(i, "#fb923c"); snd("shield");
  ev.push(`${p.name}: Кров Саламандри блокує шкоду «Горіння»!`);
 }
 if (hl && p.alive) {
 if (p.revHeal > 0) {
 p.revHeal = 0;
 await reverseHealImpact(i, hl);
 ev.push(`${p.name}: Прокляття Ереба обертає регенерацію на −${hl} HP!`);
 } else if (p.noHeal > 0) {
 p.noHeal = 0; p.nhAge = 0;
 pop(i, "ЗЦІЛЕННЯ СПАЛЕНО!", "#5eead4");
 burst(i, "#2dd4bf"); snd("shatter");
 ev.push(`${p.name}: кайдани спалюють +${hl} HP відновлення!`);
 } else {
 const finalHl = (typeof hasRelic === "function" && hasRelic(i, "cup_asclepius")) ? Math.round(hl * 1.2) : hl;
 p.hp = Math.min(p.maxHp || 100, p.hp + finalHl);
 if (typeof recordHeal === "function") recordHeal(i, finalHl, false);
 pop(i, "+" + finalHl, "#4ade80"); burst(i, "#4ade80"); snd("heal");
 ev.push(`${p.name} +${finalHl}`);
 }
 upd(); await sl(550);
 }
 if (dm && p.alive) {
 p.hp -= dm;
 if (bn) await burnFx(i); else { pop(i, "ОТРУТА", "#8bd35a"); burst(i, "#8bd35a"); burst(i, "#4d7c0f"); } hit(i, dm);
 ev.push(`${p.name} −${dm} (${bn ? "горіння/отрута" : "отрута"})`);
 if (p.hp <= 0 && (typeof resolveDeathOrSave === "function" ? resolveDeathOrSave(i, ev) : (p.hp = 0, p.alive = false, true))) { pop(i, "ВИБУВ", "#ef4444"); }
 upd(); await sl(650);
 }
 if (scDmg && p.alive) {
 p.hp -= scDmg;
 if (typeof sacrificialTickFx === "function") await sacrificialTickFx(i, scDmg);
 hit(i, scDmg);
 ev.push(`${p.name} −${scDmg} (Жертовний Кубок)`);
 if (p.hp <= 0 && (typeof resolveDeathOrSave === "function" ? resolveDeathOrSave(i, ev) : (p.hp = 0, p.alive = false, true))) { pop(i, "ВИБУВ", "#ef4444"); }
 upd(); await sl(600);
 }
 }
 ev.forEach(pushLog);
 await sl(500);
 }
 P.forEach(p => { if (p.burnImmune > 0) { p.burnImmune--; statusChanged = true; } if (p.timeLock > 0) { p.timeLock--; statusChanged = true; } });
 if (statusChanged) upd();
 if (unlocked && P[0]) renderHand();
}

// ===== АНІМАЦІЇ ДЛЯ 11 НОВИХ КАРТ =====

// 1. Камінь Сизифа (S): дуговий політ валуна, удар і 3 пилові хвилі (0.6 с)
// Подвійний клинок (Y): два швидкі удари поспіль
async function twinBladeFx(act, def, dmg) {
 const h1 = Math.ceil(dmg / 2), h2 = dmg - h1, sIdx = P[act].tourIdx ?? act;
 if (STAT[sIdx]) { STAT[sIdx].dmg += dmg; STAT[sIdx].big = Math.max(STAT[sIdx].big, dmg); }
 for (const hv of [h1, h2]) { strikeArrow(act, def, "#e2e8f0"); await orb(act, def, "#e2e8f0"); P[def].hp -= hv; hit(def, hv); await sl(140); }
}
async function sisyphusFx(act, def, onHit) {
 const A = seatC(act), D = seatC(def), dx = D.x - A.x, dy = D.y - A.y;
 const rk = fxBox(SVG_IC.S, 68, A.x, A.y);
 rk.style.zIndex = 72;
 snd("throw");
 await an(rk, [
 { transform: "translate(0,0) scale(0.75) rotate(0deg)", opacity: 0.9 },
 { transform: `translate(${dx * 0.5}px,${dy * 0.5 - 75}px) scale(1.25) rotate(180deg)`, opacity: 1, offset: 0.55 },
 { transform: `translate(${dx}px,${dy}px) scale(1.1) rotate(360deg)`, opacity: 1 }
 ], 380, { easing: "cubic-bezier(.35,.05,.75,.95)" });
 rk.remove();
 onHit();
 snd("thud");
 shake($("p" + def));
 [95, 135, 175].forEach((sz, idx) => {
 setTimeout(() => ring(D.x, D.y, "#94a3b8", sz), idx * 55);
 });
 sparkBurst(D.x, D.y, ["#cbd5e1", "#94a3b8", "#64748b"], 16, 85);
 await sl(220);
}

// 2. Жало Скорпіона (P): різкий випад хвоста, зелена хвиля по контуру (0.7 с)
async function scorpionFx(act, def, onHit) {
 const A = seatC(act), D = seatC(def), dx = D.x - A.x, dy = D.y - A.y;
 const st = fxBox(SVG_IC.P, 76, A.x, A.y);
 st.style.zIndex = 72;
 st.style.filter = "drop-shadow(0 0 12px #4ade80)";
 snd("slice");
 await an(st, [
 { transform: "translate(0,0) scale(0.7)", opacity: 0.8 },
 { transform: `translate(${dx * 0.85}px,${dy * 0.85}px) scale(1.3)`, opacity: 1, offset: 0.65 },
 { transform: `translate(${dx}px,${dy}px) scale(1.15)`, opacity: 0 }
 ], 360, { easing: "cubic-bezier(.15,.9,.3,1)" });
 st.remove();
 onHit();
 const pd = $("p" + def);
 if (pd && pd.animate) {
 pd.animate([
 { filter: "drop-shadow(0 0 0px #4ade80)" },
 { filter: "brightness(1.2) drop-shadow(0 0 16px #4ade80)" },
 { filter: "drop-shadow(0 0 0px #4ade80)" }
 ], { duration: 420 });
 }
 ring(D.x, D.y, "#4ade80", 130);
 sparkBurst(D.x, D.y, ["#4ade80", "#a3e635", "#38bdf8"], 18, 95);
 await sl(340);
}

// 3. Фіал Асклепія (F): виливається світло у картку власника; золотий відблиск при +21 (0.8 с)
async function asclepiusFx(act, boosted, onHeal) {
 const C = seatC(act), pl = $("p" + act);
 const fl = fxBox(SVG_IC.F, 76, C.x, C.y - 34);
 fl.style.zIndex = 73;
 fl.style.filter = boosted ? "drop-shadow(0 0 16px #fde047)" : "drop-shadow(0 0 12px #4ade80)";
 snd("heal");
 await an(fl, [
 { transform: "rotate(0deg) scale(0.8)", opacity: 0 },
 { transform: "rotate(-35deg) scale(1.15)", opacity: 1, offset: 0.4 },
 { transform: "rotate(-50deg) scale(1.1)", opacity: 0 }
 ], 450, { easing: "ease-out" });
 fl.remove();
 onHeal();
 const cols = boosted ? ["#fde047", "#fbbf24", "#86efac", "#ffffff"] : ["#86efac", "#4ade80", "#bbf7d0"];
 sparkBurst(C.x, C.y, cols, boosted ? 24 : 16, 95);
 ring(C.x, C.y, boosted ? "#fde047" : "#4ade80", boosted ? 150 : 120);
 if (pl && pl.animate && boosted) {
 pl.animate([
 { filter: "brightness(1)" },
 { filter: "brightness(1.55) drop-shadow(0 0 20px #fde047)" },
 { filter: "brightness(1)" }
 ], { duration: 420 });
 }
 await sl(350);
}

// 4. Панцир Черепахи (T): формування синього купола-панцира навколо гравця (0.65 с)
async function turtleFx(act, onHeal) {
 const C = seatC(act);
 const dome = fxBox(turtleShellAuraSvg("fx" + act), 126, C.x, C.y + 8);
 dome.style.zIndex = 74;
 dome.style.filter = "drop-shadow(0 0 22px #38bdf8) drop-shadow(0 0 38px #0284c7)";
 snd("shield");
 await an(dome, [
 { transform: "scale(0.25) rotate(-25deg)", opacity: 0 },
 { transform: "scale(1.16) rotate(6deg)", opacity: 1, offset: 0.55 },
 { transform: "scale(0.98) rotate(0deg)", opacity: 0.9 }
 ], 440, { easing: "cubic-bezier(.2,1.35,.4,1)" });
 dome.remove();
 onHeal();
 shock(C.x, C.y, "#38bdf8", 170);
 ring(C.x, C.y, "#7dd3fc", 145);
 sparkBurst(C.x, C.y, ["#38bdf8", "#7dd3fc", "#e0f2fe", "#0284c7"], 22, 105);
 await sl(180);
}

// 5. Батіг Фурії (W): дуговий удар батогом; червоні хвости + «+7» при посиленні (0.7 с)
async function furyWhipFx(act, def, boosted, onHit) {
 const A = seatC(act), D = seatC(def), dx = D.x - A.x, dy = D.y - A.y;
 const whipHtml = boosted
 ? SVG_IC.W.replace(/#c084fc|#9461c9|#7e22ce|#fde047/g, "#ef4444")
 : SVG_IC.W;
 const wh = fxBox(whipHtml, 88, A.x, A.y);
 wh.style.zIndex = 73;
 wh.style.filter = boosted ? "drop-shadow(0 0 16px #ef4444)" : "drop-shadow(0 0 12px #c084fc)";
 snd("slice");
 await an(wh, [
 { transform: "translate(0,0) rotate(-40deg) scale(0.8)", opacity: 0.8 },
 { transform: `translate(${dx * 0.6}px,${dy * 0.6 - 35}px) rotate(45deg) scale(1.3)`, opacity: 1, offset: 0.5 },
 { transform: `translate(${dx}px,${dy}px) rotate(110deg) scale(1.15)`, opacity: 0 }
 ], 380, { easing: "cubic-bezier(.2,.85,.3,1)" });
 wh.remove();
 onHit();
 snd("stun");
 shake($("p" + def));
 if (boosted) pop(act, "+7 ЛЮТЬ!", "#fde047");
 shock(D.x, D.y, boosted ? "#ef4444" : "#c084fc", boosted ? 165 : 135);
 sparkBurst(D.x, D.y, boosted ? ["#ef4444", "#fde047", "#fca5a5"] : ["#c084fc", "#fde047", "#e9d5ff"], 20, 110);
 await sl(320);
}

// 6. Колісниця Геліоса (G): таран колісницею + підпал (0.9 с)
async function heliosChariotFx(act, def, onHit) {
 const A = seatC(act), D = seatC(def), dx = D.x - A.x, dy = D.y - A.y;
 const ch = fxBox(SVG_IC.G, 92, A.x, A.y);
 ch.style.zIndex = 73;
 ch.style.filter = "drop-shadow(0 0 18px #f97316)";
 const stop = trail(ch, "#fb923c");
 snd("thunder");
 await an(ch, [
 { transform: "translate(0,0) scale(0.75)", opacity: 0.85 },
 { transform: `translate(${dx * 0.5}px,${dy * 0.5 - 20}px) scale(1.25)`, opacity: 1, offset: 0.5 },
 { transform: `translate(${dx}px,${dy}px) scale(1.35)`, opacity: 1 }
 ], 460, { easing: "cubic-bezier(.4,0,.9,1)" });
 stop(); ch.remove();
 onHit();
 shake($("p" + def));
 shock(D.x, D.y, "#f97316", 180);
 starburst(D.x, D.y, "#fde047", 130);
 sparkBurst(D.x, D.y, ["#f97316", "#fde047", "#ef4444"], 24, 125);
 await sl(440);
}

// 7. Спис Ахілла (L): прямий кидок; білий наконечник і «КРИТ!» при HP < 50 (0.6 / 0.9 с)
async function achillesSpearFx(act, def, isCrit, onHit) {
 const A = seatC(act), D = seatC(def), dx = D.x - A.x, dy = D.y - A.y;
 const ang = Math.atan2(dy, dx) * 180 / Math.PI + 45;
 const spHtml = isCrit
 ? SVG_IC.L.replace(/#b45309|#fbbf24/g, "#ffffff")
 : SVG_IC.L;
 const sp = fxBox(spHtml, isCrit ? 96 : 82, A.x, A.y);
 sp.style.zIndex = 73;
 sp.style.filter = isCrit ? "drop-shadow(0 0 20px #ffffff)" : "drop-shadow(0 0 12px #fbbf24)";
 const stop = trail(sp, isCrit ? "#ffffff" : "#fbbf24");
 snd("slice");
 await an(sp, [
 { transform: `translate(0,0) rotate(${ang}deg) scale(0.8)`, opacity: 0.9 },
 { transform: `translate(${dx}px,${dy}px) rotate(${ang}deg) scale(${isCrit ? 1.3 : 1.1})`, opacity: 1 }
 ], 280, { easing: "cubic-bezier(.15,.85,.25,1)" });
 stop(); sp.remove();
 onHit();
 shake($("p" + def));
 if (isCrit) {
 snd("thunder");
 pop(def, "КРИТ!", "#ffffff");
 shock(D.x, D.y, "#ffffff", 200);
 sparkBurst(D.x, D.y, ["#ffffff", "#fde047", "#ef4444"], 28, 140);
 ["stage", "topbar", "banner", "hand"].map($).filter(Boolean).forEach(el => {
 if (!el.animate) return;
 el.animate([
 { translate: "0 0" }, { translate: "-7px 4px" }, { translate: "7px -4px" },
 { translate: "-5px -3px" }, { translate: "4px 3px" }, { translate: "0 0" }
 ], { duration: 300, easing: "ease-out" });
 });
 await sl(600);
 } else {
 shock(D.x, D.y, "#fbbf24", 145);
 sparkBurst(D.x, D.y, ["#fbbf24", "#fde047", "#ef4444"], 16, 100);
 await sl(320);
 }
}

// 8. Прокляття Ереба (E): фіолетово-чорна хвиля + накладення зворотного зцілення (0.8 с)
async function erebusCurseFx(act, def, onHit) {
 const A = seatC(act), D = seatC(def), dx = D.x - A.x, dy = D.y - A.y;
 const wv = fxBox(SVG_IC.E, 84, A.x, A.y);
 wv.style.zIndex = 73;
 wv.style.filter = "drop-shadow(0 0 18px #9333ea)";
 snd("poison");
 await an(wv, [
 { transform: "translate(0,0) scale(0.6) rotate(0deg)", opacity: 0.8 },
 { transform: `translate(${dx}px,${dy}px) scale(1.35) rotate(-270deg)`, opacity: 1 }
 ], 420, { easing: "ease-in-out" });
 wv.remove();
 onHit();
 shock(D.x, D.y, "#9333ea", 165);
 sparkBurst(D.x, D.y, ["#9333ea", "#f43f5e", "#18181b"], 22, 105);
 pop(def, "ПРОКЛЯТТЯ ЕРЕБА!", "#c084fc");
 await sl(380);
}

// 9. Чаша Геби (B): золоте сяйво виливається на картку власника (0.8 с)
async function hebeCupFx(act, onHeal) {
 const C = seatC(act);
 const cup = fxBox(SVG_IC.B, 82, C.x, C.y - 36);
 cup.style.zIndex = 73;
 cup.style.filter = "drop-shadow(0 0 16px #fde047)";
 snd("heal");
 await an(cup, [
 { transform: "rotate(0deg) scale(0.75)", opacity: 0 },
 { transform: "rotate(32deg) scale(1.2)", opacity: 1, offset: 0.45 },
 { transform: "rotate(45deg) scale(1.1)", opacity: 0 }
 ], 450, { easing: "ease-out" });
 cup.remove();
 onHeal();
 ring(C.x, C.y, "#fde047", 145);
 sparkBurst(C.x, C.y, ["#fde047", "#4ade80", "#ffffff"], 22, 95);
 await sl(350);
}

// 10. Кров Титана (K): крапля розлітається на краплі до карти атаки в руці + «+8» (0.8 с)
async function titanBloodFx(act, boostedCardIdx, onHeal) {
 const C = seatC(act);
 const dr = fxBox(SVG_IC.K, 80, C.x, C.y);
 dr.style.zIndex = 73;
 dr.style.filter = "drop-shadow(0 0 16px #ef4444)";
 snd("heal");
 await an(dr, [
 { transform: "scale(0.6)", opacity: 0 },
 { transform: "scale(1.25)", opacity: 1, offset: 0.5 },
 { transform: "scale(1.45)", opacity: 0 }
 ], 360, { easing: "ease-out" });
 dr.remove();
 onHeal();
 sparkBurst(C.x, C.y, ["#ef4444", "#fde047", "#4ade80"], 20, 95);
 if (act === 0 && boostedCardIdx >= 0) {
 renderHand();
 const cardDom = $("hand") && $("hand").children[boostedCardIdx];
 if (cardDom) {
 const r = cardDom.getBoundingClientRect();
 const tx = r.left + r.width / 2, ty = r.top + r.height / 2;
 for (let m = 0; m < 6; m++) {
 const p = document.createElement("div");
 p.style.cssText = `position:fixed;left:${C.x}px;top:${C.y}px;width:7px;height:7px;border-radius:50%;background:#ef4444;box-shadow:0 0 8px #fde047;z-index:76;pointer-events:none`;
 document.body.appendChild(p);
 an(p, [
 { transform: "translate(0,0) scale(1)", opacity: 1 },
 { transform: `translate(${tx - C.x + (Math.random() - 0.5) * 18}px,${ty - C.y}px) scale(0.6)`, opacity: 0 }
 ], 380, { delay: m * 30, easing: "ease-in" }).then(() => p.remove());
 }
 if (cardDom.animate) {
 cardDom.animate([
 { filter: "brightness(1)", boxShadow: "0 0 0px #fbbf24" },
 { filter: "brightness(1.7)", boxShadow: "0 0 24px #fbbf24" },
 { filter: "brightness(1)", boxShadow: "0 0 0px #fbbf24" }
 ], { duration: 550 });
 }
 }
 }
 pop(act, "+8 АТАКА!", "#fde047");
 await sl(440);
}

// 11. Терези Немезиди (N): спільний шар лінії світла + збіг лічильника HP за 0.8 с (1.0 с)
async function nemesisScalesFx(act, def, targetHp) {
 const A = seatC(act), D = seatC(def);
 const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
 const sc = fxBox(SVG_IC.N, 110, innerWidth / 2, innerHeight / 2);
 sc.style.zIndex = 75;
 sc.style.filter = "drop-shadow(0 0 22px #fbbf24)";
 snd("swap");

 // Окремий шар анімації — лінія світла між картками гравця і суперника
 const lineSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
 lineSvg.setAttribute("viewBox", `0 0 ${innerWidth} ${innerHeight}`);
 lineSvg.style.cssText = "position:fixed;inset:0;width:100%;height:100%;z-index:74;pointer-events:none";
 lineSvg.innerHTML = `<defs><linearGradient id="nem_link_g" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#fbbf24"/><stop offset="50%" stop-color="#ffffff"/><stop offset="100%" stop-color="#38bdf8"/></linearGradient></defs><line x1="${A.x}" y1="${A.y}" x2="${D.x}" y2="${D.y}" stroke="url(#nem_link_g)" stroke-width="5" stroke-linecap="round" style="filter:drop-shadow(0 0 12px #fde047)"/>`;
 document.body.appendChild(lineSvg);

 if (!reduce && sc.animate) {
 sc.animate([
 { transform: "scale(0.5) rotate(-14deg)", opacity: 0 },
 { transform: "scale(1.15) rotate(10deg)", opacity: 1, offset: 0.35 },
 { transform: "scale(1.05) rotate(-5deg)", opacity: 1, offset: 0.65 },
 { transform: "scale(1) rotate(0deg)", opacity: 1 }
 ], { duration: 400, easing: "ease-out" });
 }

 const startA = P[act].hp, startD = P[def].hp;
 if (!reduce) {
 const t0 = performance.now(), dur = 800;
 await new Promise(res => {
 const step = now => {
 const u = Math.min(1, (now - t0) / dur);
 const ease = 1 - Math.pow(1 - u, 3);
 P[act].hp = Math.round(startA + (targetHp - startA) * ease);
 P[def].hp = Math.round(startD + (targetHp - startD) * ease);
 upd();
 if (u < 1) requestAnimationFrame(step);
 else res();
 };
 requestAnimationFrame(step);
 });
 }
 P[act].hp = targetHp;
 P[def].hp = targetHp;
 upd();

 shock(A.x, A.y, "#fbbf24", 150);
 shock(D.x, D.y, "#38bdf8", 150);
 pop(act, `РІВНОВАГА ${targetHp} HP`, "#fde047");
 pop(def, `РІВНОВАГА ${targetHp} HP`, "#bae6fd");
 await sl(200);
 sc.remove();
 lineSvg.remove();
}

// Ефект «зворотного» числа при Проклятті Ереба (спочатку червоний «−», потім число)
async function reverseHealImpact(i, dmg) {
 P[i].hp = Math.max(0, P[i].hp - dmg);
 hit(i, dmg);
 const el = $("p" + i);
 if (el) {
 const s = document.createElement("span");
 s.className = "pop";
 s.style.color = "#f43f5e";
 s.textContent = "−";
 el.appendChild(s);
 await sl(140);
 s.textContent = "−" + dmg;
 if (s.animate) {
 s.animate([
 { transform: "translate(-50%,-10px) scale(1.35)", opacity: 1 },
 { transform: "translate(-50%,-52px) scale(1)", opacity: 0 }
 ], { duration: 850 }).onfinish = () => s.remove();
 } else {
 setTimeout(() => s.remove(), 800);
 }
 }
 if (P[i].hp <= 0 && (typeof resolveDeathOrSave === "function" ? resolveDeathOrSave(i) : (P[i].hp = 0, P[i].alive = false, true))) { pop(i, "ВИБУВ", "#ef4444"); }
 upd();
}

// Анімація «Лезо Хаоса» (C): рулетка 5→35 (0.8 с), результат із відскоком та розсипанням на 3 уламки
async function chaosBladeFx(act, def, finalDmg, onHit) {
 const slot = T[act] && T[act].e;
 const D = seatC(def);
 const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
 const isWeak = finalDmg <= 10, isCrit = finalDmg >= 30;
 const vEl = slot ? slot.querySelector(".v") : null;
 const svgEl = slot ? slot.querySelector(".chaos-svg") : null;

 // 1. Лезо різко зупиняється та збільшується на 10%
 if (svgEl) {
 svgEl.style.animation = "none";
 if (!reduce && svgEl.animate) {
 svgEl.animate([{ transform: "scale(1)" }, { transform: "scale(1.1)" }], { duration: 120, fill: "forwards", easing: "ease-out" });
 } else {
 svgEl.style.transform = "scale(1.1)";
 }
 }

 // 2. Крутіння числа 5→35 (0.8 с) або миттєвий показ при prefers-reduced-motion
 if (!reduce && vEl) {
 snd("swap");
 const t0 = performance.now(), spinMs = 800;
 await new Promise(res => {
 const tick = now => {
 const u = Math.min(1, (now - t0) / spinMs);
 vEl.textContent = "−" + (rnd(31) + 5);
 if (u < 1) requestAnimationFrame(tick);
 else res();
 };
 requestAnimationFrame(tick);
 });
 }

 // 3. Фіксація фінального числа з невеликим відскоком
 if (vEl) {
 vEl.textContent = "−" + finalDmg;
 vEl.style.color = isCrit ? "#fde047" : isWeak ? "#94a3b8" : "#e9d5ff";
 if (!reduce && vEl.animate) {
 vEl.animate([
 { transform: "scale(1.45)" },
 { transform: "scale(0.9)" },
 { transform: "scale(1.08)" },
 { transform: "scale(1)" }
 ], { duration: 220, easing: "ease-out" });
 }
 }

 // 4. Снаряд та результат удару (5–10 промах, 11–29 звичайний фіолетовий, 30–35 крит)
 const orbCol = isCrit ? "#fbbf24" : isWeak ? "#94a3b8" : "#9461c9";
 strikeArrow(act, def, orbCol);
 if (!reduce) await orb(act, def, orbCol);
 onHit();

 if (isWeak) {
 // 5–10: сірий спалах, карта трясеться, напис «Промах»
 snd("stun");
 if (slot && !reduce) shake(slot);
 shock(D.x, D.y, "#94a3b8", 110);
 pop(def, "Промах...", "#94a3b8");
 if (!reduce && $("fl").animate) {
 $("fl").animate([
 { opacity: 0.35, boxShadow: "inset 0 0 90px 25px #64748b" },
 { opacity: 0, boxShadow: "inset 0 0 90px 25px #64748b" }
 ], { duration: 350 });
 }
 } else if (isCrit) {
 // 30–35: золотий спалах по краях рамки, струс екрана 0.3 с, напис «КРИТ!»
 snd("thunder"); snd("shatter");
 shock(D.x, D.y, "#fbbf24", 210);
 starburst(D.x, D.y, "#fde047", 150);
 sparkBurst(D.x, D.y, ["#fde047", "#fbbf24", "#e9d5ff", "#9461c9"], 28, 135);
 pop(def, "КРИТ!", "#fde047");
 if (!reduce && $("fl").animate) {
 $("fl").animate([
 { opacity: 0.75, boxShadow: "inset 0 0 90px 28px #fbbf24" },
 { opacity: 0, boxShadow: "inset 0 0 90px 28px #fbbf24" }
 ], { duration: 450 });
 }
 if (!reduce) {
 ["stage", "topbar", "banner", "hand"].map($).filter(Boolean).forEach(el => {
 if (!el.animate) return;
 el.animate([
 { translate: "0 0" },
 { translate: "-7px 4px" },
 { translate: "7px -4px" },
 { translate: "-5px -3px" },
 { translate: "4px 3px" },
 { translate: "0 0" }
 ], { duration: 300, easing: "ease-out" });
 });
 }
 } else {
 // 11–29: стандартний фіолетовий спалах
 shock(D.x, D.y, "#9461c9", 150);
 sparkBurst(D.x, D.y, ["#e9d5ff", "#9461c9", "#2e1065"], 18, 105);
 if (!reduce && $("fl").animate) {
 $("fl").animate([
 { opacity: 0.45, boxShadow: "inset 0 0 90px 25px #9461c9" },
 { opacity: 0, boxShadow: "inset 0 0 90px 25px #9461c9" }
 ], { duration: 400 });
 }
 }

 // 5. Після удару карта розсипається на 3 уламки, що розлітаються і зникають
 if (slot && slot.isConnected) {
 const r = slot.getBoundingClientRect();
 slot.style.opacity = "0";
 if (!reduce) {
 const clips = [
 "polygon(0 0, 100% 0, 48% 46%, 0 38%)",
 "polygon(100% 0, 100% 100%, 48% 46%)",
 "polygon(0 38%, 48% 46%, 100% 100%, 0 100%)"
 ];
 const dirs = [
 { x: -42, y: -38, rot: -26 },
 { x: 48, y: -18, rot: 28 },
 { x: -16, y: 46, rot: -18 }
 ];
 clips.forEach((clip, idx) => {
 const sh = slot.cloneNode(true);
 sh.style.cssText = `position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;margin:0;opacity:1;pointer-events:none;z-index:75;clip-path:${clip}`;
 document.body.appendChild(sh);
 an(sh, [
 { transform: "translate(0,0) rotate(0deg) scale(1)", opacity: 1 },
 { transform: `translate(${dirs[idx].x}px,${dirs[idx].y}px) rotate(${dirs[idx].rot}deg) scale(0.75)`, opacity: 0 }
 ], 420, { easing: "ease-out" }).then(() => sh.remove());
 });
 snd("shatter");
 await sl(380);
 }
 }
}


// ===== НОВІ КІНЕМАТОГРАФІЧНІ АНІМАЦІЇ ДЛЯ СТАРИХ КАРТ =====

// 1. ТРИЗУБ (d, r === 2): водяний вихор із золотим тризубом Посейдона
async function tridentVortexFx(act, def, onHit) {
 const A = seatC(act), D = seatC(def);
 const dx = D.x - A.x, dy = D.y - A.y;
 const ang = Math.atan2(dy, dx) * 180 / Math.PI + 90;
 const tr = fxBox(ART.d[2], 96, A.x, A.y);
 tr.style.zIndex = 74;
 tr.style.filter = "drop-shadow(0 0 18px #38bdf8) drop-shadow(0 0 28px #fbbf24)";
 const stop = trail(tr, "#38bdf8");
 snd("throw");
 await an(tr, [
 { transform: `translate(0,0) rotate(${ang}deg) scale(0.7)`, opacity: 0.85 },
 { transform: `translate(${dx * 0.5}px,${dy * 0.5 - 24}px) rotate(${ang}deg) scale(1.22)`, opacity: 1, offset: 0.55 },
 { transform: `translate(${dx}px,${dy}px) rotate(${ang}deg) scale(1.3)`, opacity: 1 }
 ], 330, { easing: "cubic-bezier(.2,.85,.3,1)" });
 stop();
 onHit();
 snd("heal"); snd("hit", 25);
 shake($("p" + def));

 // Тришаровий водяний вихор навколо цілі
 const vx = document.createElement("div");
 vx.style.cssText = `position:fixed;left:${D.x - 95}px;top:${D.y - 95}px;width:190px;height:190px;z-index:73;pointer-events:none;filter:drop-shadow(0 0 16px #38bdf8)`;
 vx.innerHTML = `<svg viewBox="0 0 190 190" width="190" height="190" style="overflow:visible">
 <circle cx="95" cy="95" r="76" fill="none" stroke="#38bdf8" stroke-width="5" stroke-dasharray="48 24 18 24" opacity="0.85"/>
 <circle cx="95" cy="95" r="56" fill="none" stroke="#7dd3fc" stroke-width="4" stroke-dasharray="34 20" opacity="0.9"/>
 <circle cx="95" cy="95" r="36" fill="none" stroke="#e0f2fe" stroke-width="3" stroke-dasharray="22 14"/>
 </svg>`;
 document.body.appendChild(vx);
 shock(D.x, D.y, "#38bdf8", 185);
 ring(D.x, D.y, "#7dd3fc", 145);
 sparkBurst(D.x, D.y, ["#e0f2fe", "#38bdf8", "#fde047", "#0284c7"], 26, 130);

 await Promise.all([
 an(vx, [
 { transform: "scale(0.35) rotate(0deg)", opacity: 0 },
 { transform: "scale(1.05) rotate(220deg)", opacity: 1, offset: 0.45 },
 { transform: "scale(1.35) rotate(420deg)", opacity: 0 }
 ], 540, { easing: "ease-out" }),
 an(tr, [
 { transform: `translate(${dx}px,${dy}px) rotate(${ang}deg) scale(1.3)`, opacity: 1 },
 { transform: `translate(${dx}px,${dy + 10}px) rotate(${ang}deg) scale(1.45)`, opacity: 0 }
 ], 420, { easing: "ease-out" })
 ]);
 vx.remove();
 tr.remove();
}

// 2. МЕЧ ТИТАНА (d, r === 4): падіння велетенського золотого клинка зверху з розломом столу
async function titanSwordFx(act, def, onHit) {
 const D = seatC(def);
 const vg = document.createElement("div");
 vg.style.cssText = `position:fixed;inset:0;z-index:70;pointer-events:none;opacity:0;background:radial-gradient(circle at ${D.x}px ${D.y}px, rgba(250,204,21,0.22) 0, rgba(15,23,42,0.55) 45%, rgba(3,4,10,0.85) 85%)`;
 const sw = document.createElement("div");
 sw.style.cssText = `position:fixed;left:${D.x - 65}px;top:${D.y - 230}px;width:130px;height:280px;z-index:75;pointer-events:none;filter:drop-shadow(0 0 22px #fbbf24) drop-shadow(0 0 42px #f59e0b)`;
 sw.innerHTML = `<svg viewBox="0 0 100 220" width="130" height="280" style="overflow:visible">
 <defs>
 <linearGradient id="tsBlade" x1="0" y1="0" x2="1" y2="0">
 <stop offset="0%" stop-color="#fef08a"/>
 <stop offset="50%" stop-color="#ffffff"/>
 <stop offset="100%" stop-color="#f59e0b"/>
 </linearGradient>
 </defs>
 <!-- Руків'я вгорі, вістря спрямоване вертикально вниз -->
 <circle cx="50" cy="14" r="8" fill="#fbbf24" stroke="#fef3c7" stroke-width="2"/>
 <rect x="44" y="20" width="12" height="32" rx="3" fill="#78350f" stroke="#fbbf24" stroke-width="1.5"/>
 <path d="M22 52 L50 60 L78 52 L82 64 L50 68 L18 64 Z" fill="#fbbf24" stroke="#fffbeb" stroke-width="1.8"/>
 <circle cx="50" cy="60" r="5" fill="#ef4444" stroke="#fde047" stroke-width="1.2"/>
 <polygon points="36,66 64,66 59,185 50,214 41,185" fill="url(#tsBlade)" stroke="#fef08a" stroke-width="2" stroke-linejoin="round"/>
 <line x1="50" y1="72" x2="50" y2="196" stroke="#d97706" stroke-width="2.5"/>
 </svg>`;
 document.body.append(vg, sw);
 snd("whoosh");
 an(vg, [{ opacity: 0 }, { opacity: 1 }], 220);

 // Вертикальне падіння велетенського клинка з неба
 await an(sw, [
 { transform: "translateY(-75vh) scale(0.75)", opacity: 0 },
 { transform: "translateY(0px) scale(1.12)", opacity: 1, offset: 0.78 },
 { transform: "translateY(14px) scale(1.05)", opacity: 1 }
 ], 340, { easing: "cubic-bezier(.75,0,1,1)" });

 onHit();
 snd("thunder"); snd("shatter");
 crackTable();
 shake($("p" + def));
 shock(D.x, D.y, "#fde047", 230);
 ring(D.x, D.y, "#fbbf24", 180);
 starburst(D.x, D.y, "#fde047", 175);
 sparkBurst(D.x, D.y, ["#ffffff", "#fde047", "#fbbf24", "#f97316"], 36, 155);
 if ($("fl").animate) {
 $("fl").animate([
 { opacity: 0.7, boxShadow: "inset 0 0 95px 30px #fbbf24" },
 { opacity: 0, boxShadow: "inset 0 0 95px 30px #fbbf24" }
 ], { duration: 480 });
 }
 await sl(220);
 await Promise.all([
 an(sw, [{ opacity: 1, transform: "translateY(14px) scale(1.05)" }, { opacity: 0, transform: "translateY(26px) scale(0.95)" }], 280),
 an(vg, [{ opacity: 1 }, { opacity: 0 }], 280)
 ]);
 sw.remove(); vg.remove();
}

// 3. ЩИТ ПЕРСЕЯ (m): фізичне дзеркало на столі з рикошетом снаряда назад у нападника
async function perseusMirrorFx(att, def, onReflect) {
 const A = seatC(att), D = seatC(def);
 const dx = A.x - D.x, dy = A.y - D.y;
 const len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len;
 // Позиція дзеркала прямо перед захисником на лінії атаки
 const mx = D.x + ux * 58, my = D.y + uy * 58;
 const ang = Math.atan2(dy, dx) * 180 / Math.PI + 90;

 const mir = document.createElement("div");
 mir.style.cssText = `position:fixed;left:${mx - 48}px;top:${my - 48}px;width:96px;height:96px;z-index:74;pointer-events:none;filter:drop-shadow(0 0 18px #e879f9) drop-shadow(0 0 32px #c084fc)`;
 mir.innerHTML = `<svg viewBox="0 0 100 100" width="96" height="96" style="overflow:visible">
 <defs>
 <linearGradient id="pmGlass" x1="0" y1="0" x2="1" y2="1">
 <stop offset="0%" stop-color="#ffffff" stop-opacity="0.92"/>
 <stop offset="40%" stop-color="#f5d0fe" stop-opacity="0.72"/>
 <stop offset="75%" stop-color="#a855f7" stop-opacity="0.55"/>
 <stop offset="100%" stop-color="#581c87" stop-opacity="0.88"/>
 </linearGradient>
 </defs>
 <polygon points="50,6 88,28 88,72 50,94 12,72 12,28" fill="url(#pmGlass)" stroke="#fae8ff" stroke-width="3.5"/>
 <polygon points="50,14 80,32 80,68 50,86 20,68 20,32" fill="none" stroke="#e879f9" stroke-width="1.4" stroke-dasharray="5 3"/>
 <line x1="28" y1="68" x2="66" y2="24" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" opacity="0.85"/>
 <line x1="38" y1="74" x2="72" y2="34" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.65"/>
 </svg>`;
 document.body.appendChild(mir);
 snd("shield");

 // Матеріалізація фізичного дзеркала перед захисником
 await an(mir, [
 { transform: `rotate(${ang}deg) scale(0.2)`, opacity: 0 },
 { transform: `rotate(${ang}deg) scale(1.15)`, opacity: 1, offset: 0.65 },
 { transform: `rotate(${ang}deg) scale(1)`, opacity: 1 }
 ], 240, { easing: "cubic-bezier(.2,1.4,.4,1)" });

 // Ворожий снаряд летить від нападника до дзеркала
 const proj = document.createElement("div");
 proj.style.cssText = `position:fixed;left:${A.x - 13}px;top:${A.y - 13}px;width:26px;height:26px;border-radius:50%;background:radial-gradient(circle,#fff,#f43f5e 45%,#881337);box-shadow:0 0 20px #f43f5e;z-index:75;pointer-events:none`;
 document.body.appendChild(proj);
 await an(proj, [
 { transform: "translate(0,0) scale(0.85)" },
 { transform: `translate(${mx - A.x}px,${my - A.y}px) scale(1.25)` }
 ], 220, { easing: "ease-in" });

 // Удар об дзеркало — сніп іскор, дзвін кришталю та розворот снаряда!
 snd("shatter");
 shock(mx, my, "#f5d0fe", 150);
 sparkBurst(mx, my, ["#ffffff", "#f5d0fe", "#e879f9", "#fde047"], 26, 125);
 an(mir, [
 { transform: `rotate(${ang}deg) scale(1)` },
 { transform: `rotate(${ang}deg) scale(1.24)`, filter: "brightness(2) drop-shadow(0 0 28px #fff)", offset: 0.35 },
 { transform: `rotate(${ang}deg) scale(1)` }
 ], 260);

 // Рикошет назад у нападника
 proj.style.background = "radial-gradient(circle,#fff,#e879f9 45%,#7e22ce)";
 proj.style.boxShadow = "0 0 24px #e879f9";
 strikeArrow(def, att, "#e879f9");
 await an(proj, [
 { transform: `translate(${mx - A.x}px,${my - A.y}px) scale(1.35)` },
 { transform: "translate(0,0) scale(1.1)" }
 ], 230, { easing: "cubic-bezier(.15,.85,.3,1)" });
 proj.remove();

 onReflect();
 shock(A.x, A.y, "#e879f9", 165);
 sparkBurst(A.x, A.y, ["#f5d0fe", "#e879f9", "#ffffff"], 22, 115);

 await an(mir, [{ opacity: 1, transform: `rotate(${ang}deg) scale(1)` }, { opacity: 0, transform: `rotate(${ang}deg) scale(0.6)` }], 220);
 mir.remove();
}

// 4. ДИВНА УГОДА (w): вихор карт через центр столу з обміном колод
async function weirdDealFx(act, def, onSwap) {
 const A = seatC(act), D = seatC(def);
 const st = $("stage").getBoundingClientRect();
 const cx = st.left + st.width / 2, cy = st.top + st.height / 2;

 // Містичний портал у центрі столу
 const portal = document.createElement("div");
 portal.style.cssText = `position:fixed;left:${cx - 85}px;top:${cy - 85}px;width:170px;height:170px;border-radius:50%;z-index:72;pointer-events:none;background:radial-gradient(circle,rgba(192,132,252,0.45) 0%,rgba(126,34,206,0.22) 55%,transparent 75%);border:2px dashed #c084fc;box-shadow:0 0 34px #a855f7,inset 0 0 24px #c084fc`;
 document.body.appendChild(portal);
 an(portal, [
 { transform: "scale(0.2) rotate(0deg)", opacity: 0 },
 { transform: "scale(1.1) rotate(180deg)", opacity: 1, offset: 0.5 },
 { transform: "scale(0.3) rotate(360deg)", opacity: 0 }
 ], 880, { easing: "ease-in-out" }).then(() => portal.remove());

 snd("swap");
 const cardsAnims = [];
 const pairs = [[A, D, "d"], [D, A, "h"]];
 pairs.forEach(([from, to, kind], side) => {
 for (let k = 0; k < 5; k++) {
 const mc = document.createElement("div");
 mc.className = `card back cback-${(typeof PROFILE !== "undefined" && PROFILE.cardBack) || "classic"}`;
 mc.style.cssText = `position:fixed;left:${from.x - 20}px;top:${from.y - 28}px;width:40px;height:56px;border-radius:7px;z-index:74;pointer-events:none;box-shadow:0 0 14px #c084fc`;
 mc.innerHTML = backSvg(k % 2 ? kind : "s");
 document.body.appendChild(mc);
 const ang = (side ? Math.PI : 0) + (k - 2) * 0.45;
 const orbX = cx + Math.cos(ang) * 56 - from.x;
 const orbY = cy + Math.sin(ang) * 56 - from.y;
 const endX = to.x - from.x;
 const endY = to.y - from.y;
 cardsAnims.push(
 an(mc, [
 { transform: "translate(0,0) scale(0.5) rotate(0deg)", opacity: 0 },
 { transform: `translate(${orbX}px,${orbY}px) scale(1.05) rotate(${side ? -220 : 220}deg)`, opacity: 1, offset: 0.5 },
 { transform: `translate(${endX}px,${endY}px) scale(0.55) rotate(${side ? -420 : 420}deg)`, opacity: 0 }
 ], 760, { delay: k * 45, easing: "cubic-bezier(.35,.05,.25,1)" }).then(() => mc.remove())
 );
 }
 });

 await sl(420);
 onSwap();
 shock(cx, cy, "#c084fc", 190);
 sparkBurst(cx, cy, ["#e9d5ff", "#c084fc", "#fde047", "#38bdf8"], 28, 125);
 await Promise.all(cardsAnims);
}

// Вихор Харибди (7): глибокий фіолетово-індиговий вир із зазубреними зубами по спіралі та сяючим ядром
SVG_IC["7"] = `<svg viewBox="0 0 36 36"><defs><radialGradient id="chCore" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#ffffff"/><stop offset="28%" stop-color="#e879f9"/><stop offset="65%" stop-color="#6b21a8"/><stop offset="100%" stop-color="#1e1b4b"/></radialGradient></defs><circle cx="18" cy="18" r="15.5" fill="url(#chCore)" stroke="#c084fc" stroke-width="1.3"/><g class="ic-spin" fill="none" stroke-linecap="round"><path d="M18 4a14 14 0 0 1 13.5 10.5A10.5 10.5 0 0 1 21 28a7.5 7.5 0 0 1-7-7.5 4.5 4.5 0 0 1 4.5-4.5" stroke="#e9d5ff" stroke-width="2"/><path d="M18 32A14 14 0 0 1 4.5 21.5 10.5 10.5 0 0 1 15 8a7.5 7.5 0 0 1 7 7.5" stroke="#a855f7" stroke-width="2.2"/><g fill="#f5d0fe" stroke="none"><polygon points="18,3 20,7 16,7"/><polygon points="32,18 28,20 28,16"/><polygon points="18,33 16,29 20,29"/><polygon points="4,18 8,16 8,20"/><polygon points="27,9 23,11 25,13"/><polygon points="9,27 13,25 11,23"/></g></g><circle class="ic-pulse" cx="18" cy="18" r="3.4" fill="#fff"/></svg>`;

// Лоза Діоніса (8): виноградна лоза з темно-фіолетовими гронами та золотим листям, що обвиває кубок
SVG_IC["8"] = `<svg viewBox="0 0 36 36"><defs><linearGradient id="dioCup" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fef08a"/><stop offset="55%" stop-color="#d97706"/><stop offset="100%" stop-color="#78350f"/></linearGradient></defs><path d="M10 8h16c0 7-3.5 11.5-8 11.5S10 15 10 8z" fill="url(#dioCup)" stroke="#fffbeb" stroke-width="1.1"/><rect x="16.6" y="19.5" width="2.8" height="8.5" fill="#d97706"/><path d="M11.5 31h13l-2-3h-9z" fill="url(#dioCup)" stroke="#fffbeb" stroke-width="0.8"/><path class="ic-sway" d="M6 28C8 19 14 15 22 13C27 12 30 9 31 6" fill="none" stroke="#4ade80" stroke-width="2.2" stroke-linecap="round"/><path d="M13 11c-3-2-6 0-5 3 2 1 4 0 5-3zM24 9c2-3 5-2 5 1-2 2-4 1-5-1z" fill="#fde047" stroke="#92400e" stroke-width="0.6"/><g class="ic-pulse" fill="#9333ea" stroke="#e9d5ff" stroke-width="0.6"><circle cx="24" cy="16" r="2.4"/><circle cx="28" cy="16" r="2.4"/><circle cx="26" cy="19.5" r="2.4"/><circle cx="23" cy="19.5" r="2.1"/><circle cx="25.5" cy="23" r="2.2"/></g></svg>`;

// Анімація «Вихор Харибди» (7): фіолетова спіральна воронка під плашкою ворога втягує медальйон углиб столу
async function charybdisFx(act, def, bonusDmg, onHit) {
 try {
  const D = seatC(def), pd = $("p" + def);
  strikeArrow(act, def, "#a855f7");
  await orb(act, def, "#c084fc");

  const W = 196, H = 196;
  const vort = document.createElement("div");
  vort.style.cssText = `position:fixed;left:${D.x - W / 2}px;top:${D.y - H / 2}px;width:${W}px;height:${H}px;z-index:71;pointer-events:none;filter:drop-shadow(0 0 18px #9333ea) drop-shadow(0 0 32px #4c1d95)`;
  vort.innerHTML = `<svg viewBox="0 0 200 200" width="${W}" height="${H}" style="overflow:visible">
   <circle cx="100" cy="100" r="82" fill="rgba(88,28,135,0.35)" stroke="#a855f7" stroke-width="4" stroke-dasharray="36 18"/>
   <circle cx="100" cy="100" r="60" fill="none" stroke="#c084fc" stroke-width="4.5" stroke-dasharray="28 14"/>
   <circle cx="100" cy="100" r="38" fill="none" stroke="#f5d0fe" stroke-width="3.5" stroke-dasharray="18 10"/>
   <circle cx="100" cy="100" r="18" fill="#090514" stroke="#e879f9" stroke-width="2.5"/>
  </svg>`;
  document.body.appendChild(vort);
  snd("poison"); snd("thud");

  const vAnim = an(vort, [
   { transform: "scale(0.25) rotate(0deg)", opacity: 0 },
   { transform: "scale(1.12) rotate(320deg)", opacity: 1, offset: 0.55 },
   { transform: "scale(0.85) rotate(640deg)", opacity: 0 }
  ], 640, { easing: "cubic-bezier(.3,.05,.2,1)" });

  if (pd && pd.animate) {
   pd.animate([
    { transform: "translate(-50%, -50%) scale(1) rotate(0deg)", filter: "brightness(1)" },
    { transform: "translate(-50%, -50%) scale(0.82) rotate(-8deg)", filter: "brightness(0.65) drop-shadow(0 0 24px #9333ea)", offset: 0.45 },
    { transform: "translate(-50%, -50%) scale(1.06) rotate(4deg)", filter: "brightness(1.3)", offset: 0.78 },
    { transform: "translate(-50%, -50%) scale(1) rotate(0deg)", filter: "brightness(1)" }
   ], { duration: 560, easing: "ease-out" });
  }

  await sl(280);
  onHit();
  shock(D.x, D.y, "#a855f7", bonusDmg > 0 ? 195 : 150);
  ring(D.x, D.y, "#e879f9", 140);
  sparkBurst(D.x, D.y, ["#e9d5ff", "#c084fc", "#7e22ce", "#312e81"], bonusDmg > 0 ? 28 : 18, 125);
  if (bonusDmg > 0) pop(def, `ПОЖИРАННЯ +${bonusDmg}!`, "#e879f9");
  await vAnim;
  vort.remove();
 } catch (err) {
  console.error("charybdisFx error:", err);
  onHit();
 }
}

// Анімація «Лоза Діоніса» (8): зелено-фіолетові пагони винограду обвивають плашку гравця, а хмарка пилку летить до ворога
async function dionysusVineFx(act, def, onApply) {
 const C = seatC(act), D = seatC(def), pl = $("p" + act);
 const vineBox = document.createElement("div");
 vineBox.style.cssText = `position:fixed;left:${C.x - 66}px;top:${C.y - 66}px;width:132px;height:132px;z-index:73;pointer-events:none;filter:drop-shadow(0 0 14px #a855f7)`;
 vineBox.innerHTML = `<svg viewBox="0 0 132 140" width="132" height="140" style="overflow:visible">
  <path d="M18,24 Q18,12 30,12 L102,12 Q114,12 114,24 L114,98 L66,128 L18,98 Z" fill="none" stroke="#4ade80" stroke-width="4" stroke-dasharray="24 12" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M23,27 Q23,17 33,17 L99,17 Q109,17 109,27 L109,95 L66,122 L23,95 Z" fill="none" stroke="#a855f7" stroke-width="3.2" stroke-dasharray="16 14" stroke-linecap="round" stroke-linejoin="round"/>
  <g fill="#9333ea" stroke="#fde047" stroke-width="1.1">
   <circle cx="24" cy="18" r="4.5"/><circle cx="108" cy="18" r="4.5"/><circle cx="112" cy="96" r="4.5"/><circle cx="20" cy="96" r="4.5"/><circle cx="66" cy="126" r="5"/>
  </g>
 </svg>`;
 document.body.appendChild(vineBox);
 snd("heal");

 const vAnim = an(vineBox, [
  { transform: "scale(0.4) rotate(-45deg)", opacity: 0 },
  { transform: "scale(1.08) rotate(35deg)", opacity: 1, offset: 0.55 },
  { transform: "scale(1.2) rotate(80deg)", opacity: 0 }
 ], 580, { easing: "ease-out" });

 // Хмарка фіолетового пилку летить у бік суперника
 if (P[def] && P[def].alive) {
  orb(act, def, "#c084fc").then(() => {
   sparkBurst(D.x, D.y, ["#e9d5ff", "#c084fc", "#fde047"], 16, 85);
  });
 }

 await sl(260);
 onApply();
 shock(C.x, C.y, "#a855f7", 150);
 sparkBurst(C.x, C.y, ["#4ade80", "#c084fc", "#fde047", "#ffffff"], 22, 100);
 if (pl && pl.animate) {
  pl.animate([
   { filter: "brightness(1)" },
   { filter: "brightness(1.35) drop-shadow(0 0 20px #a855f7)" },
   { filter: "brightness(1)" }
  ], { duration: 460 });
 }
 await vAnim;
 vineBox.remove();
}


// ===== ДЕСТРОЯР (9): Золотий вихор -> Спис-меч (-35 HP) -> Розкол на уламки (-10 HP іншим) =====
async function destroyerFx(act, def, otherIds, onMainHit, onSplashHit) {
 try {
  const A = seatC(act), D = seatC(def);
  const dx = D.x - A.x, dy = D.y - A.y;
  const ang = Math.atan2(dy, dx) * 180 / Math.PI;

  // 1. Золотий вихор над кастером і кристалізація масивної золотої стріли-меча
  const vort = document.createElement("div");
  vort.style.cssText = `position:fixed;left:${A.x - 62}px;top:${A.y - 62}px;width:124px;height:124px;z-index:72;pointer-events:none;filter:drop-shadow(0 0 18px #f59e0b)`;
  vort.innerHTML = `<svg viewBox="0 0 120 120" width="124" height="124" style="overflow:visible">
   <circle cx="60" cy="60" r="50" fill="rgba(245,158,11,0.16)" stroke="#fde047" stroke-width="3.5" stroke-dasharray="28 14"/>
   <circle cx="60" cy="60" r="34" fill="none" stroke="#fffbeb" stroke-width="2.5" stroke-dasharray="18 10"/>
   <circle cx="60" cy="60" r="18" fill="radial-gradient(#fffbeb,#f59e0b)" opacity="0.8"/>
  </svg>`;
  document.body.appendChild(vort);
  snd("swap");
  sparkBurst(A.x, A.y, ["#fffbeb", "#fde047", "#f59e0b"], 18, 85);

  const spear = document.createElement("div");
  spear.style.cssText = `position:fixed;left:${A.x - 66}px;top:${A.y - 26}px;width:132px;height:52px;z-index:75;pointer-events:none;transform-origin:50% 50%;filter:drop-shadow(0 0 18px #fde047) drop-shadow(0 0 32px #f59e0b)`;
  spear.innerHTML = `<svg viewBox="0 0 140 52" width="132" height="52" style="overflow:visible">
   <defs>
    <linearGradient id="desBladeG" x1="0" y1="0" x2="1" y2="0">
     <stop offset="0%" stop-color="#78350f"/>
     <stop offset="35%" stop-color="#f59e0b"/>
     <stop offset="72%" stop-color="#fde047"/>
     <stop offset="100%" stop-color="#fffbeb"/>
    </linearGradient>
   </defs>
   <!-- Хвостове оперення -->
   <polygon points="4,26 24,14 34,26 24,38" fill="#f59e0b" stroke="#fffbeb" stroke-width="1.4"/>
   <!-- Масивне древко -->
   <rect x="26" y="22.5" width="44" height="7" rx="3" fill="#78350f" stroke="#fde047" stroke-width="1.3"/>
   <!-- Гарда-хрестовина -->
   <polygon points="66,10 74,18 74,34 66,42 60,26" fill="#fde047" stroke="#fffbeb" stroke-width="1.4"/>
   <!-- Широке двосічне лезо-стріла -->
   <polygon points="72,14 114,16 138,26 114,36 72,38 78,26" fill="url(#desBladeG)" stroke="#fffbeb" stroke-width="1.8" stroke-linejoin="round"/>
   <line x1="76" y1="26" x2="132" y2="26" stroke="#fffbeb" stroke-width="2.2" opacity="0.95"/>
  </svg>`;
  document.body.appendChild(spear);

  await Promise.all([
   an(vort, [
    { transform: "scale(0.25) rotate(0deg)", opacity: 0 },
    { transform: "scale(1.12) rotate(210deg)", opacity: 1, offset: 0.65 },
    { transform: "scale(0.5) rotate(360deg)", opacity: 0 }
   ], 380, { easing: "ease-out" }),
   an(spear, [
    { transform: `rotate(${ang}deg) scale(0.2)`, opacity: 0 },
    { transform: `rotate(${ang}deg) scale(1.18)`, opacity: 1, offset: 0.72 },
    { transform: `rotate(${ang}deg) scale(1.05)`, opacity: 1 }
   ], 340, { easing: "cubic-bezier(.2,1.35,.4,1)" })
  ]);
  vort.remove();

  // 2. Прямий надшвидкісний удар у плашку основної цілі (−35 HP)
  const stopTrail = trail(spear, "#fde047");
  snd("throw");
  await an(spear, [
   { transform: `translate(0,0) rotate(${ang}deg) scale(1.05)` },
   { transform: `translate(${dx}px,${dy}px) rotate(${ang}deg) scale(1.22)` }
  ], 195, { easing: "cubic-bezier(.65,0,1,1)" });
  stopTrail();
  spear.remove();

  // Гучний металевий дзвін, золотий вибух, струс плашки та −35 HP
  snd("clang");
  bell();
  onMainHit();
  shake($("p" + def));
  crackTable();
  shock(D.x, D.y, "#fde047", 220);
  ring(D.x, D.y, "#fffbeb", 165);
  starburst(D.x, D.y, "#f59e0b", 165);
  sparkBurst(D.x, D.y, ["#fffbeb", "#fde047", "#f59e0b", "#78350f"], 34, 150);
  if ($("fl") && $("fl").animate) {
   $("fl").animate([
    { opacity: 0.58, boxShadow: "inset 0 0 95px 28px #f59e0b" },
    { opacity: 0, boxShadow: "inset 0 0 95px 28px #f59e0b" }
   ], { duration: 420 });
  }

  // 3. Розкол та осколковий залп (−10 HP іншим живим суперникам при 3–4 гравцях)
  if (otherIds && otherIds.length > 0) {
   await sl(150);
   snd("shatter");
   pop(def, "РОЗКОЛ!", "#fde047");
   ring(D.x, D.y, "#fde047", 190);

   const shardAnims = otherIds.map((oi, idx) => new Promise(res => {
    const O = seatC(oi);
    const sdx = O.x - D.x, sdy = O.y - D.y;
    const dist = Math.hypot(sdx, sdy) || 1;
    const nx = -sdy / dist, ny = sdx / dist;
    const arcDir = (idx % 2 === 0 ? 1 : -1) * Math.min(85, dist * 0.24);
    const mx = D.x + sdx * 0.5 + nx * arcDir;
    const my = D.y + sdy * 0.5 + ny * arcDir;

    // 2 гострі золоті уламки на кожного додаткового суперника
    const subAnims = [0, 1].map(k => new Promise(r2 => {
     const sh = document.createElement("div");
     const sz = k === 0 ? 34 : 24;
     sh.style.cssText = `position:fixed;left:${D.x - sz / 2}px;top:${D.y - sz / 2}px;width:${sz}px;height:${sz}px;z-index:76;pointer-events:none;filter:drop-shadow(0 0 12px #fde047)`;
     sh.innerHTML = `<svg viewBox="0 0 32 32" width="${sz}" height="${sz}"><polygon points="4,16 18,6 30,16 16,24" fill="#fde047" stroke="#fffbeb" stroke-width="1.6" stroke-linejoin="round"/><line x1="8" y1="16" x2="27" y2="16" stroke="#f59e0b" stroke-width="1.5"/></svg>`;
     document.body.appendChild(sh);
     const DUR = 360 + k * 65, delay = idx * 45 + k * 35;
     let t0 = null, lastSp = 0;
     const step = now => {
      if (t0 === null) t0 = now + delay;
      const u = (now - t0) / DUR;
      if (u < 0) { requestAnimationFrame(step); return; }
      if (u >= 1) { sh.remove(); r2(); return; }
      const e = u * u * (3 - 2 * u), iu = 1 - e;
      const offK = (k === 0 ? 1 : -0.6);
      const x = iu * iu * D.x + 2 * iu * e * (mx + nx * 16 * offK) + e * e * O.x;
      const y = iu * iu * D.y + 2 * iu * e * (my + ny * 16 * offK) + e * e * O.y;
      const rot = Math.atan2(O.y - y, O.x - x) * 180 / Math.PI;
      sh.style.left = (x - sz / 2) + "px";
      sh.style.top = (y - sz / 2) + "px";
      sh.style.transform = `rotate(${rot.toFixed(1)}deg) scale(${(1.1 - e * 0.15).toFixed(2)})`;
      if (now - lastSp > 32) {
       lastSp = now;
       sparkBurst(x, y, ["#fffbeb", "#fde047", "#f59e0b"], 2, 32);
      }
      requestAnimationFrame(step);
     };
     requestAnimationFrame(step);
    }));

    Promise.all(subAnims).then(() => {
     onSplashHit(oi);
     shake($("p" + oi));
     shock(O.x, O.y, "#fde047", 130);
     sparkBurst(O.x, O.y, ["#fffbeb", "#fde047", "#f59e0b"], 18, 95);
     res();
    });
   }));

   await Promise.all(shardAnims);
  }
  await sl(220);
 } catch (err) {
  console.error("destroyerFx error:", err);
  onMainHit();
  if (otherIds) otherIds.forEach(oi => onSplashHit(oi));
 }
}

// ===== РУКА МІДАСА (0): Золота хватка (-30 HP) -> Потік рідкого золота і монет -> Зцілення (+15 HP) =====
const MIDAS_OPEN_SVG = `<svg viewBox="0 0 120 120" width="136" height="136" style="overflow:visible"><defs><linearGradient id="mPalmO" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fef08a" stop-opacity="0.92"/><stop offset="50%" stop-color="#facc15" stop-opacity="0.76"/><stop offset="100%" stop-color="#991b1b" stop-opacity="0.82"/></linearGradient></defs><path d="M40 96 C30 88 26 74 28 58 L16 42 C13 38 18 32 23 34 L34 42 L36 16 C37 11 45 11 46 16 L49 38 L55 12 C56 7 64 7 65 12 L67 38 L76 15 C78 10 86 13 84 18 L79 44 L94 28 C98 24 104 29 101 34 L86 64 C82 80 76 92 64 98 C54 102 46 101 40 96 Z" fill="url(#mPalmO)" stroke="#fffbeb" stroke-width="2.4" stroke-linejoin="round"/><circle cx="58" cy="68" r="10" fill="#991b1b" fill-opacity="0.5" stroke="#fef08a" stroke-width="1.8"/><circle cx="58" cy="68" r="4" fill="#fde047"/></svg>`;
const MIDAS_FIST_SVG = `<svg viewBox="0 0 120 120" width="128" height="128" style="overflow:visible"><defs><linearGradient id="mPalmF" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fffbeb" stop-opacity="0.95"/><stop offset="45%" stop-color="#facc15" stop-opacity="0.88"/><stop offset="100%" stop-color="#991b1b" stop-opacity="0.92"/></linearGradient></defs><rect x="28" y="34" width="64" height="54" rx="18" fill="url(#mPalmF)" stroke="#fffbeb" stroke-width="2.6"/><path d="M36 36 v22 M52 34 v24 M68 34 v24 M84 36 v22" stroke="#991b1b" stroke-width="2.6" stroke-linecap="round"/><path d="M26 56 C26 48 38 46 50 52 L64 56 C70 58 68 68 60 68 L34 66 Z" fill="#f59e0b" stroke="#fef08a" stroke-width="2"/><circle cx="60" cy="74" r="7" fill="#991b1b" fill-opacity="0.55" stroke="#fef08a" stroke-width="1.6"/></svg>`;

async function midasFx(act, def, onHit, onHeal) {
 try {
  const A = seatC(act), D = seatC(def), pd = $("p" + def), pa = $("p" + act);

  // 1. Над плашкою суперника матеріалізується велетенська золота примарна долоня і стискається в кулак
  const hand = document.createElement("div");
  hand.style.cssText = `position:fixed;left:${D.x - 68}px;top:${D.y - 78}px;width:136px;height:136px;z-index:75;pointer-events:none;filter:drop-shadow(0 0 18px #facc15) drop-shadow(0 0 32px #b45309)`;
  hand.innerHTML = MIDAS_OPEN_SVG;
  document.body.appendChild(hand);
  snd("swap");

  await an(hand, [
   { transform: "scale(1.45) translateY(-28px)", opacity: 0 },
   { transform: "scale(1.12) translateY(-6px)", opacity: 0.94 }
  ], 250, { easing: "cubic-bezier(.2,.9,.3,1)" });

  // Миттєве стискання в кулак + перетворення плашки ворога на застигле холодне золото
  hand.innerHTML = MIDAS_FIST_SVG;
  snd("clang");
  if (pd) pd.classList.add("midas-gilded");
  ring(D.x, D.y, "#facc15", 130);
  await an(hand, [
   { transform: "scale(1.15)", opacity: 0.95 },
   { transform: "scale(0.82)", opacity: 1 }
  ], 130, { easing: "cubic-bezier(.85,0,.2,1)" });

  // Секунда застиглого холодного золота з металевим напруженням
  await sl(520);

  // Розбиття криваво-золотим спалахом на −30 HP
  hand.remove();
  if (pd) pd.classList.remove("midas-gilded");
  snd("shatter");
  onHit();
  shake(pd);
  shock(D.x, D.y, "#facc15", 205);
  ring(D.x, D.y, "#dc2626", 155);
  starburst(D.x, D.y, "#facc15", 145);
  sparkBurst(D.x, D.y, ["#fef08a", "#facc15", "#dc2626", "#991b1b"], 30, 140);
  pop(def, "ЗОЛОТА ХВАТКА!", "#facc15");

  // 2. Потік рідкого золота та сяючих золотих монет по плавній дузі в плашку кастера
  const sdx = A.x - D.x, sdy = A.y - D.y;
  const dist = Math.hypot(sdx, sdy) || 1;
  const nx = -sdy / dist, ny = sdx / dist;

  const coinCount = 8;
  const streamAnims = Array.from({ length: coinCount }, (_, k) => new Promise(res => {
   const isCoin = k % 2 === 0;
   const el = document.createElement("div");
   const sz = isCoin ? 15 : 11;
   el.style.cssText = isCoin
    ? `position:fixed;left:0;top:0;width:${sz}px;height:${sz}px;margin:${-sz / 2}px 0 0 ${-sz / 2}px;border-radius:50%;z-index:76;pointer-events:none;opacity:0;background:radial-gradient(circle at 35% 30%,#fffbeb 0%,#fde047 48%,#b45309 100%);border:1.5px solid #fef08a;box-shadow:0 0 12px #facc15,0 0 22px #f59e0b`
    : `position:fixed;left:0;top:0;width:${sz}px;height:${sz}px;margin:${-sz / 2}px 0 0 ${-sz / 2}px;border-radius:50%;z-index:75;pointer-events:none;opacity:0;background:radial-gradient(circle,#fffbeb,#facc15 55%,transparent);box-shadow:0 0 10px #fde047`;
   document.body.appendChild(el);
   const spread = ((k % 3) - 1) * 44;
   const mx = D.x + sdx * 0.5 + nx * (52 + spread);
   const my = D.y + sdy * 0.5 + ny * (52 + spread) - 28;
   const DUR = 480, delay = k * 42;
   let t0 = null, lastTr = 0;
   const step = now => {
    if (t0 === null) t0 = now + delay;
    const u = (now - t0) / DUR;
    if (u < 0) { requestAnimationFrame(step); return; }
    if (u >= 1) { el.remove(); res(); return; }
    const e = u * u * (3 - 2 * u), iu = 1 - e;
    const x = iu * iu * D.x + 2 * iu * e * mx + e * e * A.x;
    const y = iu * iu * D.y + 2 * iu * e * my + e * e * A.y;
    el.style.opacity = "1";
    el.style.left = x + "px";
    el.style.top = y + "px";
    el.style.transform = `scale(${(1.05 - e * 0.25).toFixed(2)}) rotateY(${Math.round(u * 540)}deg)`;
    if (isCoin && now - lastTr > 36) {
     lastTr = now;
     const tr = document.createElement("div");
     tr.style.cssText = `position:fixed;left:${x - 4}px;top:${y - 4}px;width:8px;height:8px;border-radius:50%;background:radial-gradient(circle,#fde047cc,transparent);z-index:74;pointer-events:none`;
     document.body.appendChild(tr);
     an(tr, [{ opacity: 0.85, transform: "scale(1)" }, { opacity: 0, transform: "scale(0.2)" }], 220).then(() => tr.remove());
    }
    requestAnimationFrame(step);
   };
   requestAnimationFrame(step);
  }));

  await Promise.all(streamAnims);

  // 3. Зцілення власника: тепле золотисто-смарагдове сяйво та дзвін монет (+15 HP)
  snd("coins");
  snd("heal");
  onHeal();
  shock(A.x, A.y, "#facc15", 155);
  ring(A.x, A.y, "#4ade80", 130);
  sparkBurst(A.x, A.y, ["#fde047", "#4ade80", "#fffbeb", "#f59e0b"], 26, 110);
  if (pa && pa.animate) {
   pa.animate([
    { filter: "brightness(1)" },
    { filter: "brightness(1.45) drop-shadow(0 0 22px #facc15) drop-shadow(0 0 32px #4ade80)" },
    { filter: "brightness(1)" }
   ], { duration: 480, easing: "ease-out" });
  }
  await sl(180);
 } catch (err) {
  console.error("midasFx error:", err);
  onHit();
  onHeal();
 }
}


// ============================================================================
// DCARD V62 — АНІМАЦІЇ ДЛЯ НОВИХ АНТИЧНО-МІФОЛОГІЧНИХ КАРТ АТАКИ (ζ..ω)
// ============================================================================

// 1. «Клинок Борея» (ζ): швидкий дуговий розріз із блакитним шлейфом; при бонусі крижинки та «−21 (МОРОЗ)»
async function boreasBladeFx(act, def, isBonus, finalDmg, onHit) {
 try {
  const A = seatC(act), D = seatC(def);
  const dx = D.x - A.x, dy = D.y - A.y;
  const ang = Math.atan2(dy, dx) * 180 / Math.PI + 45;
  const bl = fxBox(SVG_IC["ζ"], isBonus ? 96 : 82, A.x, A.y);
  bl.style.zIndex = 74;
  bl.style.filter = "drop-shadow(0 0 14px #38bdf8) drop-shadow(0 0 24px #bae6fd)";
  const stop = trail(bl, "#7dd3fc");
  snd("slice");
  await an(bl, [
   { transform: `translate(0,0) rotate(${ang - 40}deg) scale(0.75)`, opacity: 0.85 },
   { transform: `translate(${dx * 0.55}px,${dy * 0.55 - 38}px) rotate(${ang + 18}deg) scale(1.22)`, opacity: 1, offset: 0.55 },
   { transform: `translate(${dx}px,${dy}px) rotate(${ang + 65}deg) scale(1.15)`, opacity: 1 }
  ], 300, { easing: "cubic-bezier(.2,.85,.3,1)" });
  stop(); bl.remove();

  const slash = document.createElement("div");
  slash.style.cssText = `position:fixed;left:${D.x - 84}px;top:${D.y - 3}px;width:168px;height:6px;border-radius:99px;background:linear-gradient(90deg,transparent,#38bdf8,#e0f2fe,#ffffff,#38bdf8,transparent);box-shadow:0 0 18px #38bdf8;z-index:75;pointer-events:none`;
  document.body.appendChild(slash);
  an(slash, [
   { transform: "rotate(-32deg) scaleX(0.15)", opacity: 1 },
   { transform: "rotate(-32deg) scaleX(1.2)", opacity: 1, offset: 0.45 },
   { transform: "rotate(-32deg) scaleX(1.5)", opacity: 0 }
  ], 320, { easing: "ease-out" }).then(() => slash.remove());

  onHit();
  shake($("p" + def));
  shock(D.x, D.y, "#38bdf8", isBonus ? 175 : 135);
  sparkBurst(D.x, D.y, ["#ffffff", "#e0f2fe", "#7dd3fc", "#0284c7"], isBonus ? 24 : 14, isBonus ? 120 : 85);
  if (isBonus) {
   snd("ice");
   frostShards(D.x, D.y, 18, 95);
   ring(D.x, D.y, "#bae6fd", 145);
   pop(def, `−${finalDmg} (МОРОЗ)`, "#7dd3fc");
  }
  await sl(260);
 } catch (err) {
  console.error("boreasBladeFx error:", err);
  onHit();
 }
}

// 2. «Стріла Аполлона» (η): стрімкий прямий політ золото-бірюзової стріли зі світловим слідом
async function apolloArrowFx(act, def, ignoredDebuff, onHit) {
 try {
  const A = seatC(act), D = seatC(def);
  const dx = D.x - A.x, dy = D.y - A.y;
  const dist = Math.hypot(dx, dy) || 1;
  const ang = Math.atan2(dy, dx) * 180 / Math.PI;

  const beam = document.createElement("div");
  beam.style.cssText = `position:fixed;left:${A.x}px;top:${A.y - 3}px;width:${dist}px;height:6px;transform-origin:0 50%;transform:rotate(${ang}deg) scaleX(0);border-radius:99px;z-index:73;pointer-events:none;background:linear-gradient(90deg,rgba(45,212,191,0.1),#2dd4bf 35%,#fde047 75%,#ffffff);box-shadow:0 0 16px #fde047,0 0 26px #2dd4bf`;
  document.body.appendChild(beam);

  const arrow = fxBox(SVG_IC["η"], 84, A.x, A.y);
  arrow.style.zIndex = 75;
  arrow.style.filter = "drop-shadow(0 0 14px #fde047) drop-shadow(0 0 22px #2dd4bf)";
  const rot = ang + 45;
  snd("throw"); snd("slice");

  await Promise.all([
   an(beam, [
    { transform: `rotate(${ang}deg) scaleX(0)`, opacity: 0.9 },
    { transform: `rotate(${ang}deg) scaleX(1)`, opacity: 1 }
   ], 175, { easing: "cubic-bezier(.2,.9,.3,1)" }),
   an(arrow, [
    { transform: `translate(0,0) rotate(${rot}deg) scale(0.85)`, opacity: 1 },
    { transform: `translate(${dx}px,${dy}px) rotate(${rot}deg) scale(1.15)`, opacity: 1 }
   ], 175, { easing: "cubic-bezier(.2,.9,.3,1)" })
  ]);
  arrow.remove();

  onHit();
  shake($("p" + def));
  shock(D.x, D.y, "#fde047", 155);
  ring(D.x, D.y, "#2dd4bf", 120);
  sparkBurst(D.x, D.y, ["#ffffff", "#fef08a", "#2dd4bf", "#f59e0b"], 22, 115);
  if (ignoredDebuff) pop(act, "ЧИСТИЙ ПОСТРІЛ!", "#fde047");

  await an(beam, [{ opacity: 0.95 }, { opacity: 0 }], 340, { easing: "ease-out" });
  beam.remove();
 } catch (err) {
  console.error("apolloArrowFx error:", err);
  onHit();
 }
}

// 3. «Клеймо Мойр» (θ): фіолетова нитка долі над ціллю, розсікання світловою дугою; при ≤40 HP спалах і «−30 ДОЛЯ»
async function moiraiBrandFx(act, def, isFatal, finalDmg, onHit) {
 try {
  const D = seatC(def);
  const thread = document.createElement("div");
  thread.style.cssText = `position:fixed;left:${D.x - 115}px;top:${D.y - 4}px;width:230px;height:8px;z-index:74;pointer-events:none;filter:drop-shadow(0 0 10px #c084fc)`;
  thread.innerHTML = `<svg viewBox="0 0 230 8" width="230" height="8"><path d="M0 4 Q58 0 115 4 T230 4" fill="none" stroke="#f5d0fe" stroke-width="2.4" stroke-dasharray="6 3"/><line x1="0" y1="4" x2="230" y2="4" stroke="#a855f7" stroke-width="1.3"/></svg>`;
  document.body.appendChild(thread);
  snd("swap");

  await an(thread, [
   { transform: "scaleX(0.1)", opacity: 0 },
   { transform: "scaleX(1)", opacity: 1 }
  ], 260, { easing: "ease-out" });

  const arc = document.createElement("div");
  arc.style.cssText = `position:fixed;left:${D.x - 78}px;top:${D.y - 78}px;width:156px;height:156px;z-index:75;pointer-events:none;filter:drop-shadow(0 0 16px #e879f9)`;
  arc.innerHTML = `<svg viewBox="0 0 156 156" width="156" height="156"><path d="M22 134 Q78 24 134 22" fill="none" stroke="${isFatal ? "#ffffff" : "#e879f9"}" stroke-width="${isFatal ? 6 : 4}" stroke-linecap="round"/><path d="M26 130 Q78 28 130 26" fill="none" stroke="#a855f7" stroke-width="9" opacity="0.45" stroke-linecap="round"/></svg>`;
  document.body.appendChild(arc);
  snd("slice");
  if (isFatal) snd("shatter");

  await an(arc, [
   { transform: "scale(0.35) rotate(-45deg)", opacity: 0 },
   { transform: "scale(1.18) rotate(8deg)", opacity: 1, offset: 0.45 },
   { transform: "scale(1.32) rotate(22deg)", opacity: 0 }
  ], 280, { easing: "cubic-bezier(.2,.9,.3,1)" });
  arc.remove();

  an(thread, [
   { transform: "scaleX(1)", opacity: 1 },
   { transform: "scaleX(1.35) scaleY(0.2)", opacity: 0 }
  ], 220).then(() => thread.remove());

  onHit();
  shake($("p" + def));
  shock(D.x, D.y, isFatal ? "#e879f9" : "#a855f7", isFatal ? 210 : 150);
  ring(D.x, D.y, "#f5d0fe", isFatal ? 170 : 120);
  sparkBurst(D.x, D.y, ["#ffffff", "#f5d0fe", "#c084fc", "#7e22ce"], isFatal ? 32 : 18, isFatal ? 140 : 95);
  if (isFatal) {
   pop(def, `−${finalDmg} ДОЛЯ`, "#e879f9");
   if ($("fl") && $("fl").animate) {
    $("fl").animate([
     { opacity: 0.55, boxShadow: "inset 0 0 95px 28px #a855f7" },
     { opacity: 0, boxShadow: "inset 0 0 95px 28px #a855f7" }
    ], { duration: 420 });
   }
  }
  await sl(260);
 } catch (err) {
  console.error("moiraiBrandFx error:", err);
  onHit();
 }
}

// 4. «Вихор Скілли» (ι): фіолетова спіраль із бризками навколо цілі + іконка дезорієнтації
async function scyllaVortexFx(act, def, onHit) {
 try {
  const D = seatC(def), pd = $("p" + def);
  strikeArrow(act, def, "#c084fc");
  await orb(act, def, "#a855f7");

  const W = 186, H = 186;
  const spir = document.createElement("div");
  spir.style.cssText = `position:fixed;left:${D.x - W / 2}px;top:${D.y - H / 2}px;width:${W}px;height:${H}px;z-index:74;pointer-events:none;filter:drop-shadow(0 0 16px #a855f7)`;
  spir.innerHTML = `<svg viewBox="0 0 186 186" width="${W}" height="${H}" style="overflow:visible">
   <path d="M93 16 A77 77 0 1 1 20 120" fill="none" stroke="#c084fc" stroke-width="5" stroke-linecap="round"/>
   <path d="M93 36 A57 57 0 1 1 40 112" fill="none" stroke="#e879f9" stroke-width="4" stroke-linecap="round"/>
   <path d="M93 56 A37 37 0 1 1 60 106" fill="none" stroke="#f5d0fe" stroke-width="3" stroke-linecap="round"/>
  </svg>`;
  document.body.appendChild(spir);
  snd("poison"); snd("swap");

  const sAnim = an(spir, [
   { transform: "scale(0.3) rotate(0deg)", opacity: 0 },
   { transform: "scale(1.1) rotate(300deg)", opacity: 1, offset: 0.5 },
   { transform: "scale(1.3) rotate(600deg)", opacity: 0 }
  ], 580, { easing: "ease-out" });

  if (pd && pd.animate) {
   pd.animate([
    { transform: "translate(-50%, -50%) rotate(0deg)" },
    { transform: "translate(-50%, -50%) rotate(-10deg) scale(0.95)", offset: 0.35 },
    { transform: "translate(-50%, -50%) rotate(10deg) scale(1.04)", offset: 0.7 },
    { transform: "translate(-50%, -50%) rotate(0deg)" }
   ], { duration: 480 });
  }

  await sl(240);
  onHit();
  shock(D.x, D.y, "#c084fc", 165);
  sparkBurst(D.x, D.y, ["#f5d0fe", "#c084fc", "#38bdf8", "#7e22ce"], 26, 115);
  pop(def, "ДЕЗОРІЄНТАЦІЯ (−50% ХІЛ)", "#c084fc");
  await sAnim;
  spir.remove();
 } catch (err) {
  console.error("scyllaVortexFx error:", err);
  onHit();
 }
}

// 5. «Гнів Ареса» (κ): важкий діагональний розсіч багряним лезом зі струшуванням столу + багряна рамка при ≤50 HP
async function aresWrathFx(act, def, isEnraged, finalDmg, onHit) {
 try {
  const D = seatC(def);
  if (isEnraged && $("fl") && $("fl").animate) {
   $("fl").animate([
    { opacity: 0.85, boxShadow: "inset 0 0 110px 36px #dc2626" },
    { opacity: 0.3, boxShadow: "inset 0 0 90px 26px #991b1b", offset: 0.55 },
    { opacity: 0, boxShadow: "inset 0 0 90px 26px #dc2626" }
   ], { duration: 680 });
  }

  const sw = fxBox(SVG_IC["κ"], isEnraged ? 124 : 104, D.x - 58, D.y - 68);
  sw.style.zIndex = 75;
  sw.style.filter = isEnraged
   ? "drop-shadow(0 0 22px #ef4444) drop-shadow(0 0 38px #991b1b)"
   : "drop-shadow(0 0 14px #dc2626)";
  snd("whoosh");

  await an(sw, [
   { transform: "translate(-30px,-35px) rotate(-55deg) scale(0.7)", opacity: 0 },
   { transform: "translate(0,0) rotate(-32deg) scale(1.18)", opacity: 1, offset: 0.45 },
   { transform: "translate(82px,86px) rotate(48deg) scale(1.28)", opacity: 1 }
  ], 260, { easing: "cubic-bezier(.75,0,.15,1)" });

  const cut = document.createElement("div");
  cut.style.cssText = `position:fixed;left:${D.x - 105}px;top:${D.y - 5}px;width:210px;height:10px;border-radius:99px;background:linear-gradient(90deg,transparent,#7f1d1d,#ef4444,#fef08a,#ef4444,transparent);box-shadow:0 0 24px #dc2626;z-index:76;pointer-events:none`;
  document.body.appendChild(cut);
  an(cut, [
   { transform: "rotate(42deg) scaleX(0.15)", opacity: 1 },
   { transform: "rotate(42deg) scaleX(1.25)", opacity: 1, offset: 0.4 },
   { transform: "rotate(42deg) scaleX(1.55)", opacity: 0 }
  ], 380).then(() => cut.remove());

  snd("slice"); snd("thunder");
  onHit();
  crackTable();
  shake($("p" + def));
  shake($("table"));
  shock(D.x, D.y, "#dc2626", isEnraged ? 225 : 175);
  starburst(D.x, D.y, "#ef4444", isEnraged ? 165 : 125);
  sparkBurst(D.x, D.y, ["#fef08a", "#ef4444", "#991b1b", "#ffffff"], isEnraged ? 34 : 22, isEnraged ? 155 : 115);
  if (isEnraged) {
   bigImpact(42);
   pop(def, `ГНІВ АРЕСА −${finalDmg}!`, "#fca5a5");
  }
  await an(sw, [{ opacity: 1 }, { opacity: 0, transform: "translate(105px,110px) rotate(62deg) scale(0.9)" }], 220);
  sw.remove();
 } catch (err) {
  console.error("aresWrathFx error:", err);
  onHit();
 }
}

// 6. «Молот Тіфону» (λ): удар базальтовим молотом зверху + тріщини; при дебафі — розбиття статусів та магматичний спалах +12
async function typhonHammerFx(act, def, willShatter, onHit, onShatter) {
 try {
  const D = seatC(def);
  const hm = fxBox(SVG_IC["λ"], 124, D.x, D.y - 120);
  hm.style.zIndex = 75;
  hm.style.filter = "drop-shadow(0 0 20px #ea580c) drop-shadow(0 0 36px #dc2626)";
  snd("whoosh");

  await an(hm, [
   { transform: "translateY(-70px) rotate(-55deg) scale(0.8)", opacity: 0 },
   { transform: "translateY(-20px) rotate(-18deg) scale(1.22)", opacity: 1, offset: 0.45 },
   { transform: "translateY(112px) rotate(28deg) scale(1.18)", opacity: 1 }
  ], 300, { easing: "cubic-bezier(.75,0,1,1)" });

  snd("thud"); snd("thunder");
  onHit();
  crackTable();
  squash(def);
  shake($("p" + def));
  shock(D.x, D.y, "#ea580c", 190);
  sparkBurst(D.x, D.y, ["#fde047", "#f97316", "#dc2626", "#292524"], 28, 135);

  if (willShatter) {
   await sl(180);
   snd("shatter"); snd("thunder");
   if (onShatter) onShatter();
   shock(D.x, D.y, "#ef4444", 240);
   ring(D.x, D.y, "#fde047", 185);
   starburst(D.x, D.y, "#f97316", 170);
   sparkBurst(D.x, D.y, ["#ffffff", "#fde047", "#fb923c", "#dc2626"], 36, 165);
   pop(def, "РОЗБИТТЯ +12 МАГМА!", "#fde047");
  }

  await an(hm, [{ opacity: 1 }, { opacity: 0, transform: "translateY(125px) rotate(40deg) scale(0.9)" }], 240);
  hm.remove();
 } catch (err) {
  console.error("typhonHammerFx error:", err);
  onHit();
  if (willShatter && onShatter) onShatter();
 }
}

// 7. «Удар Горгони» (μ): прокол зі сплеском багряно-зелених крапель; частина летить назад до власника з −8 HP
async function gorgonStrikeFx(act, def, onHit, onRecoil) {
 try {
  const A = seatC(act), D = seatC(def);
  const dx = D.x - A.x, dy = D.y - A.y;
  const fg = fxBox(SVG_IC["μ"], 88, A.x, A.y);
  fg.style.zIndex = 74;
  fg.style.filter = "drop-shadow(0 0 14px #f43f5e) drop-shadow(0 0 20px #84cc16)";
  const stop = trail(fg, "#e11d48");
  snd("slice");

  await an(fg, [
   { transform: "translate(0,0) scale(0.75)", opacity: 0.9 },
   { transform: `translate(${dx}px,${dy}px) scale(1.22)`, opacity: 1 }
  ], 260, { easing: "cubic-bezier(.25,.9,.3,1)" });
  stop(); fg.remove();

  onHit();
  snd("poison");
  shake($("p" + def));
  shock(D.x, D.y, "#e11d48", 165);
  ring(D.x, D.y, "#84cc16", 130);
  sparkBurst(D.x, D.y, ["#e11d48", "#a3e635", "#fb7185", "#365314"], 28, 125);

  const drops = [0, 1, 2, 3].map(k => new Promise(res => {
   const dr = document.createElement("div");
   const col = k % 2 ? "#a3e635" : "#e11d48";
   dr.style.cssText = `position:fixed;left:${D.x - 6}px;top:${D.y - 6}px;width:12px;height:12px;border-radius:50%;background:radial-gradient(circle,#fff,${col} 55%,#1a2e05);box-shadow:0 0 10px ${col};z-index:75;pointer-events:none`;
   document.body.appendChild(dr);
   const offX = (k - 1.5) * 26, offY = -36 - (k % 2) * 18;
   an(dr, [
    { transform: "translate(0,0) scale(1)", opacity: 1 },
    { transform: `translate(${(A.x - D.x) * 0.5 + offX}px,${(A.y - D.y) * 0.5 + offY}px) scale(1.15)`, opacity: 1, offset: 0.5 },
    { transform: `translate(${A.x - D.x}px,${A.y - D.y}px) scale(0.7)`, opacity: 0.9 }
   ], 340, { delay: k * 35, easing: "ease-in-out" }).then(() => { dr.remove(); res(); });
  }));
  await Promise.all(drops);
  if (onRecoil) onRecoil();
  burst(act, "#84cc16");
  burst(act, "#e11d48");
  shake($("p" + act));
  await sl(180);
 } catch (err) {
  console.error("gorgonStrikeFx error:", err);
  onHit();
  if (onRecoil) onRecoil();
 }
}

// 8. «Кара Вогню» (ν): стрімкий вогняний метеор/спис згори з розльотом іскор та ударною хвилею
async function fireWrathFx(act, def, isBonus, onHit) {
 try {
  const D = seatC(def);
  const met = fxBox(SVG_IC["ν"], isBonus ? 124 : 104, D.x + 110, D.y - 180);
  met.style.zIndex = 75;
  met.style.filter = "drop-shadow(0 0 22px #f97316) drop-shadow(0 0 38px #ef4444)";
  const stop = trail(met, "#f97316");
  snd("whoosh"); snd("thunder");

  await an(met, [
   { transform: "translate(60px,-110px) rotate(135deg) scale(0.75)", opacity: 0 },
   { transform: "translate(-110px,180px) rotate(135deg) scale(1.3)", opacity: 1 }
  ], 270, { easing: "cubic-bezier(.7,0,1,1)" });
  stop(); met.remove();

  onHit();
  snd("thunder");
  crackTable();
  shake($("p" + def));
  shock(D.x, D.y, "#f97316", isBonus ? 235 : 185);
  ring(D.x, D.y, "#fde047", isBonus ? 190 : 140);
  starburst(D.x, D.y, "#ef4444", isBonus ? 175 : 135);
  sparkBurst(D.x, D.y, ["#ffffff", "#fef08a", "#fb923c", "#dc2626"], isBonus ? 36 : 24, isBonus ? 160 : 120);
  if (isBonus) pop(def, "+8 КАРА ВОГНЮ!", "#fde047");
  await sl(260);
 } catch (err) {
  console.error("fireWrathFx error:", err);
  onHit();
 }
}

// 9. «Длань Зевса» (ξ): затемнення сцени, вертикальний удар золотої блискавки, іскри та розсипання знятих ефектів
async function zeusHandFx(act, def, isBoosted, strippedColors, onHit) {
 try {
  const D = seatC(def), W = innerWidth, H = innerHeight;
  const vg = document.createElement("div");
  vg.style.cssText = `position:fixed;inset:0;z-index:70;pointer-events:none;opacity:0;background:radial-gradient(circle at ${D.x}px ${D.y}px, rgba(250,204,21,0.22) 0, rgba(15,23,42,0.72) 48%, rgba(2,4,12,0.92) 88%)`;
  document.body.appendChild(vg);
  snd("thunder");
  await an(vg, [{ opacity: 0 }, { opacity: 1 }], 220);

  const jit = k => (Math.random() - 0.5) * k;
  let bd = `M${D.x + jit(36)} -20`;
  const steps = 10, branches = [];
  for (let k = 1; k <= steps; k++) {
   const y = -20 + (D.y + 20) * k / steps;
   const x = k === steps ? D.x : D.x + jit(68 * (1 - k / steps) + 10);
   bd += `L${x.toFixed(1)} ${y.toFixed(1)}`;
   if (k > 2 && k < steps && Math.random() < 0.72) {
    branches.push(`M${x.toFixed(1)} ${y.toFixed(1)}l${jit(150).toFixed(1)} ${(35 + Math.random() * 55).toFixed(1)}l${jit(55).toFixed(1)} ${(20 + Math.random() * 40).toFixed(1)}`);
   }
  }
  const bolt = document.createElement("div");
  bolt.style.cssText = "position:fixed;inset:0;z-index:76;pointer-events:none;filter:drop-shadow(0 0 18px #facc15) drop-shadow(0 0 34px #38bdf8)";
  bolt.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><g fill="none" stroke-linejoin="bevel" stroke-linecap="round"><path d="${bd}${branches.join("")}" stroke="#facc15" stroke-width="${isBoosted ? 16 : 12}" opacity=".65"/><path d="${bd}" stroke="#ffffff" stroke-width="${isBoosted ? 6 : 4.5}"/><path d="${branches.join("")}" stroke="#fef08a" stroke-width="2.5"/></g></svg>`;

  const fl = document.createElement("div");
  fl.style.cssText = "position:fixed;inset:0;z-index:75;pointer-events:none;background:radial-gradient(circle,#ffffff 0,#fef08a 42%,#f59e0b 100%)";
  document.body.append(fl, bolt);

  onHit();
  snd("thunder"); snd("shatter");
  crackTable();
  bigImpact(isBoosted ? 60 : 45);
  shake($("p" + def));
  shock(D.x, D.y, "#ffffff", 180);
  setTimeout(() => shock(D.x, D.y, "#fde047", 270), 65);
  setTimeout(() => shock(D.x, D.y, "#38bdf8", 350), 130);
  starburst(D.x, D.y, "#fde047", 190);
  sparkBurst(D.x, D.y, ["#ffffff", "#fef08a", "#facc15", "#38bdf8"], 42, 175);

  const cols = (strippedColors && strippedColors.length) ? strippedColors : ["#38bdf8", "#4ade80", "#fde047"];
  if (strippedColors && strippedColors.length) {
   for (let k = 0; k < Math.min(14, strippedColors.length * 4); k++) {
    const sh = document.createElement("div");
    const col = cols[k % cols.length];
    sh.style.cssText = `position:fixed;left:${D.x - 6}px;top:${D.y - 6}px;width:12px;height:12px;border-radius:3px;background:${col};border:1px solid #fff;box-shadow:0 0 10px ${col};z-index:77;pointer-events:none`;
    document.body.appendChild(sh);
    const a = (Math.PI * 2 * k) / 14, dist = 70 + Math.random() * 85;
    an(sh, [
     { transform: "translate(0,0) scale(1.2) rotate(0deg)", opacity: 1 },
     { transform: `translate(${Math.cos(a) * dist}px,${Math.sin(a) * dist}px) scale(0.2) rotate(260deg)`, opacity: 0 }
    ], 560, { easing: "ease-out" }).then(() => sh.remove());
   }
   pop(def, "БАФИ ЗНЯТО!", "#fde047");
  }
  if (isBoosted) pop(def, "ГНІВ ОЛІМПУ +15!", "#ffffff");

  await Promise.all([
   an(fl, [{ opacity: 0.95 }, { opacity: 0 }], 360),
   an(bolt, [{ opacity: 1 }, { opacity: 0.25, offset: 0.25 }, { opacity: 1, offset: 0.45 }, { opacity: 0 }], 440)
  ]);
  fl.remove(); bolt.remove();
  await an(vg, [{ opacity: 1 }, { opacity: 0 }], 240);
  vg.remove();
 } catch (err) {
  console.error("zeusHandFx error:", err);
  onHit();
 }
}

// 10. «Кара Харона» (ω): примарний вихор Стіксу, проліт тіні весла та візуальне перетягування карти від цілі до власника
async function charonWrathFx(act, def, isExec, onHit, onSteal) {
 try {
  const A = seatC(act), D = seatC(def);
  const vg = document.createElement("div");
  vg.style.cssText = `position:fixed;inset:0;z-index:70;pointer-events:none;opacity:0;background:radial-gradient(circle at ${D.x}px ${D.y}px, rgba(250,204,21,0.16) 0, rgba(15,23,42,0.72) 45%, rgba(2,2,8,0.92) 86%)`;
  document.body.appendChild(vg);
  snd("swap");
  await an(vg, [{ opacity: 0 }, { opacity: 1 }], 220);

  const vort = document.createElement("div");
  vort.style.cssText = `position:fixed;left:${D.x - 98}px;top:${D.y - 98}px;width:196px;height:196px;z-index:73;pointer-events:none;filter:drop-shadow(0 0 18px #facc15)`;
  vort.innerHTML = `<svg viewBox="0 0 196 196" width="196" height="196"><circle cx="98" cy="98" r="80" fill="rgba(9,9,18,0.45)" stroke="#fde047" stroke-width="3.5" stroke-dasharray="30 16"/><circle cx="98" cy="98" r="56" fill="none" stroke="#94a3b8" stroke-width="3" stroke-dasharray="22 14"/><circle cx="98" cy="98" r="32" fill="none" stroke="#fef08a" stroke-width="2.5" stroke-dasharray="14 10"/></svg>`;
  document.body.appendChild(vort);
  const vAnim = an(vort, [
   { transform: "scale(0.3) rotate(0deg)", opacity: 0 },
   { transform: "scale(1.1) rotate(260deg)", opacity: 1, offset: 0.5 },
   { transform: "scale(1.28) rotate(520deg)", opacity: 0 }
  ], 680, { easing: "ease-out" });

  const oar = fxBox(SVG_IC["ω"], 118, D.x - 110, D.y - 40);
  oar.style.zIndex = 75;
  oar.style.filter = "drop-shadow(0 0 20px #fde047) drop-shadow(0 0 32px #000000)";
  snd("slice");
  await an(oar, [
   { transform: "translate(-40px,-20px) rotate(-35deg) scale(0.8)", opacity: 0 },
   { transform: "translate(110px,40px) rotate(12deg) scale(1.25)", opacity: 1, offset: 0.5 },
   { transform: "translate(220px,60px) rotate(35deg) scale(0.95)", opacity: 0 }
  ], 340, { easing: "cubic-bezier(.3,.85,.3,1)" });
  oar.remove();

  onHit();
  snd(isExec ? "thunder" : "clang");
  crackTable();
  shake($("p" + def));
  shock(D.x, D.y, "#fde047", isExec ? 240 : 190);
  sparkBurst(D.x, D.y, ["#fef08a", "#facc15", "#94a3b8", "#18181b"], isExec ? 38 : 26, 150);
  if (isExec) {
   bigImpact(55);
   pop(def, "СТІКС: СТРАТА!", "#fde047");
  }

  const stolenCard = (!isExec && onSteal) ? onSteal() : null;
  if (stolenCard) {
   const fly = document.createElement("div");
   fly.className = `card back cback-${(typeof PROFILE !== "undefined" && PROFILE.cardBack) || "classic"}`;
   fly.style.cssText = `position:fixed;left:${D.x - 24}px;top:${D.y - 34}px;width:48px;height:68px;border-radius:8px;z-index:77;pointer-events:none;box-shadow:0 0 20px #fde047`;
   fly.innerHTML = backSvg("s");
   document.body.appendChild(fly);
   snd("swap");
   await an(fly, [
    { transform: "translate(0,0) scale(0.7) rotate(-18deg)", opacity: 0.95 },
    { transform: `translate(${(A.x - D.x) * 0.5}px,${(A.y - D.y) * 0.5 - 55}px) scale(1.2) rotate(180deg)`, opacity: 1, offset: 0.5 },
    { transform: `translate(${A.x - D.x}px,${A.y - D.y}px) scale(0.65) rotate(360deg)`, opacity: 0 }
   ], 560, { easing: "cubic-bezier(.25,.8,.3,1)" });
   fly.remove();
   sparkBurst(A.x, A.y, ["#fde047", "#fffbeb", "#a855f7"], 20, 95);
   pop(act, `+КАРТА: ${cardName(stolenCard)}`, "#fde047");
   pop(def, "КАРТУ ВИКРАДЕНО!", "#94a3b8");
  }

  await vAnim;
  vort.remove();
  await an(vg, [{ opacity: 1 }, { opacity: 0 }], 220);
  vg.remove();
 } catch (err) {
  console.error("charonWrathFx error:", err);
  onHit();
 }
}



// ============================================================================
// DCARD V63 — АНІМАЦІЇ (VFX & SFX) ДЛЯ 12 АНТИЧНО-МІФОЛОГІЧНИХ КАРТ ЗДОРОВ'Я
// ============================================================================

const _isReducedMotion = () => !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

// 4. «Ключ Джерела» (τ): прохолодний блакитний струмінь із бульбашками знизу плашки; при бонусі — сріблясте кільце
async function springKeyFx(act, isBonus, hv, onHeal) {
 const nodes = [];
 try {
  const C = seatC(act), pl = $("p" + act);
  snd("water");
  if (_isReducedMotion()) {
   onHeal();
   burst(act, isBonus ? "#7dd3fc" : "#4ade80");
   await sl(180);
   return;
  }
  const jet = document.createElement("div");
  jet.style.cssText = `position:fixed;left:${C.x - 42}px;top:${C.y - 68}px;width:84px;height:136px;z-index:73;pointer-events:none;background:linear-gradient(0deg,rgba(2,132,199,0.75) 0%,rgba(56,189,248,0.65) 45%,rgba(224,242,254,0.85) 85%,transparent 100%);border-radius:42px 42px 24px 24px;filter:blur(1px) drop-shadow(0 0 16px #38bdf8)`;
  document.body.appendChild(jet); nodes.push(jet);
  const jAnim = an(jet, [
   { transform: "translateY(48px) scaleY(0.15) scaleX(0.6)", opacity: 0 },
   { transform: "translateY(-4px) scaleY(1.08) scaleX(1)", opacity: 0.95, offset: 0.45 },
   { transform: "translateY(-26px) scaleY(1.2) scaleX(0.8)", opacity: 0 }
  ], 540, { easing: "cubic-bezier(.2,.85,.3,1)" });

  const bCount = isBonus ? 24 : 15;
  for (let k = 0; k < bCount; k++) {
   const b = document.createElement("div");
   const sz = 4 + Math.random() * 8;
   b.style.cssText = `position:fixed;left:${C.x + (Math.random() - 0.5) * 70 - sz / 2}px;top:${C.y + 42 + Math.random() * 18}px;width:${sz}px;height:${sz}px;border-radius:50%;border:1px solid #e0f2fe;background:radial-gradient(circle at 30% 30%,#ffffff,#7dd3fc 50%,transparent);box-shadow:0 0 8px #38bdf8;z-index:74;pointer-events:none`;
   document.body.appendChild(b); nodes.push(b);
   an(b, [
    { transform: "translate(0,0) scale(0.4)", opacity: 0 },
    { transform: `translate(${(Math.random() - 0.5) * 44}px,-${68 + Math.random() * 62}px) scale(1.1)`, opacity: 0.95, offset: 0.55 },
    { transform: `translate(${(Math.random() - 0.5) * 58}px,-${115 + Math.random() * 55}px) scale(0.2)`, opacity: 0 }
   ], 520 + Math.random() * 240, { delay: Math.random() * 140, easing: "ease-out" }).then(() => b.remove());
  }

  await sl(260);
  onHeal();
  snd("heal");
  shock(C.x, C.y, isBonus ? "#e2e8f0" : "#38bdf8", isBonus ? 175 : 135);
  if (isBonus) {
   ring(C.x, C.y, "#f8fafc", 150);
   ring(C.x, C.y, "#7dd3fc", 190);
   sparkBurst(C.x, C.y, ["#ffffff", "#e2e8f0", "#7dd3fc", "#38bdf8"], 26, 115);
  } else {
   sparkBurst(C.x, C.y, ["#e0f2fe", "#38bdf8", "#4ade80"], 16, 85);
  }
  if (pl && pl.animate) {
   pl.animate([
    { filter: "brightness(1)" },
    { filter: `brightness(1.38) drop-shadow(0 0 20px ${isBonus ? "#e2e8f0" : "#38bdf8"})` },
    { filter: "brightness(1)" }
   ], { duration: 420 });
  }
  await jAnim;
 } catch (err) {
  console.error("springKeyFx error:", err);
  try { onHeal(); } catch (_) {}
 } finally {
  nodes.forEach(n => { try { n.remove(); } catch (_) {} });
 }
}

// 5. «Крила Зефіра» (υ): два м'які потоки повітря огинають плашку, підіймаючи пір'їнки та блакитні іскри
async function zephyrWingsFx(act, isBonus, hv, onHeal) {
 const nodes = [];
 try {
  const C = seatC(act), pl = $("p" + act);
  snd("wind");
  if (_isReducedMotion()) {
   onHeal();
   burst(act, "#7dd3fc");
   await sl(180);
   return;
  }
  const box = document.createElement("div");
  box.style.cssText = `position:fixed;left:${C.x - 86}px;top:${C.y - 86}px;width:172px;height:172px;z-index:73;pointer-events:none;filter:drop-shadow(0 0 12px #7dd3fc)`;
  box.innerHTML = `<svg viewBox="0 0 172 172" width="172" height="172" style="overflow:visible">
   <path class="zp-a" pathLength="1" stroke-dasharray="0.45 1" stroke-dashoffset="1" d="M22 128 C6 76 34 22 86 22 C138 22 162 66 146 118" fill="none" stroke="${isBonus ? "#ffffff" : "#bae6fd"}" stroke-width="${isBonus ? 5 : 3.6}" stroke-linecap="round"/>
   <path class="zp-b" pathLength="1" stroke-dasharray="0.45 1" stroke-dashoffset="1" d="M150 128 C166 76 138 22 86 22 C34 22 10 66 26 118" fill="none" stroke="#38bdf8" stroke-width="${isBonus ? 4.4 : 3.2}" stroke-linecap="round"/>
  </svg>`;
  document.body.appendChild(box); nodes.push(box);

  const pAnims = Array.from(box.querySelectorAll("path")).map((p, idx) =>
   p.animate ? p.animate([
    { strokeDashoffset: 1, opacity: 0.2 },
    { strokeDashoffset: 0.2, opacity: 1, offset: 0.5 },
    { strokeDashoffset: -0.5, opacity: 0 }
   ], { duration: 580, delay: idx * 70, easing: "ease-out", fill: "forwards" }).finished.catch(() => {}) : sl(580)
  );

  // Легкі пір'їнки підіймаються вгору
  for (let k = 0; k < (isBonus ? 10 : 6); k++) {
   const f = document.createElement("div");
   f.style.cssText = `position:fixed;left:${C.x + (Math.random() - 0.5) * 84}px;top:${C.y + 34}px;width:16px;height:16px;z-index:74;pointer-events:none;filter:drop-shadow(0 0 6px #7dd3fc)`;
   f.innerHTML = `<svg viewBox="0 0 20 20"><path d="M17 3C10 4 5 9 3 17c5-1 10-4 12-10-2 1-3 1-5 1 2-2 5-4 7-5z" fill="${k % 2 ? "#ffffff" : "#bae6fd"}"/></svg>`;
   document.body.appendChild(f); nodes.push(f);
   an(f, [
    { transform: "translate(0,0) rotate(-20deg) scale(0.5)", opacity: 0 },
    { transform: `translate(${(Math.random() - 0.5) * 76}px,-${65 + Math.random() * 55}px) rotate(${40 + Math.random() * 90}deg) scale(1.1)`, opacity: 0.95, offset: 0.5 },
    { transform: `translate(${(Math.random() - 0.5) * 96}px,-${115 + Math.random() * 55}px) rotate(${120 + Math.random() * 90}deg) scale(0.4)`, opacity: 0 }
   ], 620 + Math.random() * 200, { delay: k * 35, easing: "ease-out" }).then(() => f.remove());
  }

  await sl(260);
  onHeal();
  snd("heal");
  shock(C.x, C.y, isBonus ? "#e0f2fe" : "#7dd3fc", isBonus ? 185 : 135);
  sparkBurst(C.x, C.y, ["#ffffff", "#bae6fd", "#38bdf8", "#4ade80"], isBonus ? 26 : 16, isBonus ? 120 : 88);
  if (pl && pl.animate) {
   pl.animate([
    { filter: "brightness(1)" },
    { filter: `brightness(${isBonus ? 1.5 : 1.3}) drop-shadow(0 0 22px #bae6fd)` },
    { filter: "brightness(1)" }
   ], { duration: 420 });
  }
  await Promise.all(pAnims);
 } catch (err) {
  console.error("zephyrWingsFx error:", err);
  try { onHeal(); } catch (_) {}
 } finally {
  nodes.forEach(n => { try { n.remove(); } catch (_) {} });
 }
}

// 6. «Дзеркало Нікти» (φ): дзеркальний місячний відблиск по плашці + фіолетова хвиля зцілення
async function nyxMirrorFx(act, copyBonus, hv, onHeal) {
 const nodes = [];
 try {
  const C = seatC(act), pl = $("p" + act);
  snd("bloom");
  if (_isReducedMotion()) {
   onHeal();
   burst(act, "#c084fc");
   await sl(180);
   return;
  }
  const mir = document.createElement("div");
  mir.style.cssText = `position:fixed;left:${C.x - 56}px;top:${C.y - 68}px;width:112px;height:136px;border-radius:50%;z-index:74;pointer-events:none;border:2.5px solid #e2e8f0;background:radial-gradient(circle at 35% 30%,rgba(245,208,254,0.45),rgba(147,51,234,0.28) 55%,rgba(15,23,42,0.5) 100%);box-shadow:0 0 24px #a855f7,inset 0 0 18px #f5d0fe;overflow:hidden`;
  const glint = document.createElement("div");
  glint.style.cssText = `position:absolute;inset:-20px;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,0.85) 50%,transparent 70%)`;
  mir.appendChild(glint);
  document.body.appendChild(mir); nodes.push(mir);

  an(glint, [
   { transform: "translateX(-120px)" },
   { transform: "translateX(140px)" }
  ], 480, { easing: "ease-in-out" });

  const mAnim = an(mir, [
   { transform: "scale(0.45)", opacity: 0 },
   { transform: "scale(1.06)", opacity: 1, offset: 0.45 },
   { transform: "scale(1.22)", opacity: 0 }
  ], 580, { easing: "ease-out" });

  await sl(270);
  onHeal();
  snd("heal");
  shock(C.x, C.y, "#c084fc", copyBonus > 0 ? 185 : 145);
  ring(C.x, C.y, "#f5d0fe", copyBonus > 0 ? 155 : 115);
  sparkBurst(C.x, C.y, ["#ffffff", "#f5d0fe", "#c084fc", "#4ade80"], copyBonus > 0 ? 26 : 16, 110);
  if (pl && pl.animate) {
   pl.animate([
    { filter: "brightness(1)" },
    { filter: "brightness(1.42) drop-shadow(0 0 22px #c084fc)" },
    { filter: "brightness(1)" }
   ], { duration: 440 });
  }
  await mAnim;
 } catch (err) {
  console.error("nyxMirrorFx error:", err);
  try { onHeal(); } catch (_) {}
 } finally {
  nodes.forEach(n => { try { n.remove(); } catch (_) {} });
 }
}

// 7. «Іскра Гестії» (χ): теплі фіолетово-золоті іскри підіймаються навколо плашки + статус регенерації
async function hestiaSparkFx(act, hv, regV, hDur, onApply) {
 const nodes = [];
 try {
  const C = seatC(act), pl = $("p" + act);
  snd("heal");
  if (_isReducedMotion()) {
   onApply();
   burst(act, "#fbbf24");
   await sl(180);
   return;
  }
  const hearth = document.createElement("div");
  hearth.style.cssText = `position:fixed;left:${C.x - 64}px;top:${C.y - 64}px;width:128px;height:128px;border-radius:50%;z-index:73;pointer-events:none;background:radial-gradient(circle,rgba(254,240,138,0.45) 0%,rgba(245,158,11,0.32) 45%,rgba(147,51,234,0.28) 72%,transparent 100%)`;
  document.body.appendChild(hearth); nodes.push(hearth);
  const hAnim = an(hearth, [
   { transform: "scale(0.35)", opacity: 0 },
   { transform: "scale(1.15)", opacity: 1, offset: 0.45 },
   { transform: "scale(1.38)", opacity: 0 }
  ], 560, { easing: "ease-out" });

  for (let k = 0; k < 20; k++) {
   const sp = document.createElement("div");
   const sz = 4 + Math.random() * 6;
   const col = ["#fef08a", "#fbbf24", "#c084fc", "#f59e0b"][k % 4];
   sp.style.cssText = `position:fixed;left:${C.x + (Math.random() - 0.5) * 76}px;top:${C.y + 38 + Math.random() * 18}px;width:${sz}px;height:${sz}px;border-radius:50%;background:${col};box-shadow:0 0 10px ${col};z-index:74;pointer-events:none`;
   document.body.appendChild(sp); nodes.push(sp);
   an(sp, [
    { transform: "translate(0,0) scale(0.5)", opacity: 0 },
    { transform: `translate(${(Math.random() - 0.5) * 42}px,-${55 + Math.random() * 55}px) scale(1.2)`, opacity: 1, offset: 0.45 },
    { transform: `translate(${(Math.random() - 0.5) * 56}px,-${110 + Math.random() * 48}px) scale(0.2)`, opacity: 0 }
   ], 560 + Math.random() * 220, { delay: Math.random() * 140, easing: "ease-out" }).then(() => sp.remove());
  }

  await sl(260);
  onApply();
  shock(C.x, C.y, "#f59e0b", 150);
  ring(C.x, C.y, "#c084fc", 125);
  if (pl && pl.animate) {
   pl.animate([
    { filter: "brightness(1)" },
    { filter: "brightness(1.35) drop-shadow(0 0 20px #fbbf24)" },
    { filter: "brightness(1)" }
   ], { duration: 420 });
  }
  await hAnim;
 } catch (err) {
  console.error("hestiaSparkFx error:", err);
  try { onApply(); } catch (_) {}
 } finally {
  nodes.forEach(n => { try { n.remove(); } catch (_) {} });
 }
}

// 8. «Квітка Персефони» (ψ): пелюстки розкриваються навколо плашки, змиваючи 1 негативний статус
async function persephoneFlowerFx(act, willCleanse, onApply) {
 const nodes = [];
 try {
  const C = seatC(act), pl = $("p" + act);
  snd("bloom");
  if (_isReducedMotion()) {
   onApply();
   burst(act, "#e879f9");
   await sl(180);
   return;
  }
  const petalCount = 8;
  for (let k = 0; k < petalCount; k++) {
   const ang = (k / petalCount) * Math.PI * 2;
   const pt = document.createElement("div");
   pt.style.cssText = `position:fixed;left:${C.x - 10}px;top:${C.y - 16}px;width:20px;height:32px;border-radius:50% 50% 50% 50%/65% 65% 35% 35%;background:linear-gradient(180deg,#f5d0fe,#9333ea 65%,#3b0764);border:1px solid #fae8ff;box-shadow:0 0 12px #c084fc;z-index:74;pointer-events:none`;
   document.body.appendChild(pt); nodes.push(pt);
   const r1 = willCleanse ? 78 : 58;
   an(pt, [
    { transform: `rotate(${ang}rad) translateY(0) scale(0.3)`, opacity: 0 },
    { transform: `rotate(${ang + 0.3}rad) translateY(-${r1 * 0.65}px) scale(1.05)`, opacity: 1, offset: 0.48 },
    { transform: `rotate(${ang + 0.65}rad) translateY(-${r1}px) scale(0.35)`, opacity: 0 }
   ], 600, { easing: "cubic-bezier(.2,.85,.3,1)" }).then(() => pt.remove());
  }

  await sl(270);
  onApply();
  snd("heal");
  if (willCleanse) {
   snd("shatter");
   shock(C.x, C.y, "#fde047", 180);
   ring(C.x, C.y, "#e879f9", 145);
   sparkBurst(C.x, C.y, ["#ffffff", "#fde047", "#e879f9", "#4ade80"], 28, 120);
  } else {
   shock(C.x, C.y, "#c084fc", 140);
   sparkBurst(C.x, C.y, ["#f5d0fe", "#a855f7", "#4ade80"], 18, 90);
  }
  if (pl && pl.animate) {
   pl.animate([
    { filter: "brightness(1)" },
    { filter: `brightness(${willCleanse ? 1.5 : 1.32}) drop-shadow(0 0 22px #e879f9)` },
    { filter: "brightness(1)" }
   ], { duration: 440 });
  }
  await sl(300);
 } catch (err) {
  console.error("persephoneFlowerFx error:", err);
  try { onApply(); } catch (_) {}
 } finally {
  nodes.forEach(n => { try { n.remove(); } catch (_) {} });
 }
}

// 9. «Ехо Аркадії» (Γ): два фіолетові звукові кільця з відлунням навколо гравця
async function arcadiaEchoFx(act, hasEcho, hv, onHeal) {
 const nodes = [];
 try {
  const C = seatC(act), pl = $("p" + act);
  snd("wind");
  if (_isReducedMotion()) {
   onHeal();
   burst(act, "#c084fc");
   await sl(180);
   return;
  }
  for (let k = 0; k < (hasEcho ? 3 : 2); k++) {
   const wv = document.createElement("div");
   wv.style.cssText = `position:fixed;left:${C.x - 50}px;top:${C.y - 50}px;width:100px;height:100px;border-radius:50%;border:${k === 0 ? 3.5 : 2.5}px solid ${k === 2 ? "#fde047" : "#d8b4fe"};box-shadow:0 0 18px ${k === 2 ? "#facc15" : "#a855f7"};z-index:74;pointer-events:none`;
   document.body.appendChild(wv); nodes.push(wv);
   an(wv, [
    { transform: "scale(0.3)", opacity: 0.95 },
    { transform: `scale(${1.9 + k * 0.35})`, opacity: 0 }
   ], 560, { delay: k * 120, easing: "ease-out" }).then(() => wv.remove());
  }
  notes(C.x, C.y - 12, hasEcho ? "#fde047" : "#d8b4fe", hasEcho ? 6 : 3);
  await sl(240);
  onHeal();
  snd("heal");
  sparkBurst(C.x, C.y, hasEcho ? ["#fde047", "#e9d5ff", "#a855f7", "#4ade80"] : ["#e9d5ff", "#a855f7", "#4ade80"], hasEcho ? 24 : 15, 105);
  if (pl && pl.animate) {
   pl.animate([
    { filter: "brightness(1)" },
    { filter: "brightness(1.38) drop-shadow(0 0 20px #c084fc)" },
    { filter: "brightness(1)" }
   ], { duration: 420 });
  }
  await sl(300);
 } catch (err) {
  console.error("arcadiaEchoFx error:", err);
  try { onHeal(); } catch (_) {}
 } finally {
  nodes.forEach(n => { try { n.remove(); } catch (_) {} });
 }
}

// 10. «Жертовний Кубок» (Δ): рубіновий потік наповнює плашку гравця (+34 HP) + багряна нитка тягнеться до суперника
async function sacrificialCupFx(act, def, hv, drainDmg, onApply) {
 const nodes = [];
 try {
  const A = seatC(act), D = P[def] && P[def].alive ? seatC(def) : null, pa = $("p" + act);
  snd("heal");
  if (_isReducedMotion()) {
   onApply();
   burst(act, "#e11d48");
   await sl(180);
   return;
  }
  const cup = fxBox(SVG_IC["Δ"], 82, A.x, A.y - 26);
  cup.style.zIndex = 74;
  cup.style.filter = "drop-shadow(0 0 18px #e11d48)";
  nodes.push(cup);
  const cAnim = an(cup, [
   { transform: "scale(0.55) translateY(14px)", opacity: 0 },
   { transform: "scale(1.18) translateY(-6px)", opacity: 1, offset: 0.45 },
   { transform: "scale(1.05) translateY(-16px)", opacity: 0 }
  ], 520, { easing: "ease-out" });

  let lineAnim = Promise.resolve();
  if (D) {
   const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
   svg.setAttribute("viewBox", `0 0 ${innerWidth} ${innerHeight}`);
   svg.style.cssText = "position:fixed;inset:0;width:100%;height:100%;z-index:73;pointer-events:none;filter:drop-shadow(0 0 10px #f43f5e)";
   const mx = (A.x + D.x) / 2, my = (A.y + D.y) / 2 - 34;
   svg.innerHTML = `<path class="sc-thread" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" d="M${A.x} ${A.y} Q${mx} ${my} ${D.x} ${D.y}" fill="none" stroke="#f43f5e" stroke-width="3.2" stroke-linecap="round"/>`;
   document.body.appendChild(svg); nodes.push(svg);
   const pEl = svg.querySelector(".sc-thread");
   lineAnim = pEl && pEl.animate ? pEl.animate([
    { strokeDashoffset: 1, opacity: 0.9 },
    { strokeDashoffset: 0, opacity: 1, offset: 0.55 },
    { strokeDashoffset: 0, opacity: 0 }
   ], { duration: 640, easing: "ease-in-out", fill: "forwards" }).finished.catch(() => {}) : sl(640);
  }

  await sl(280);
  onApply();
  snd("poison");
  shock(A.x, A.y, "#e11d48", 165);
  ring(A.x, A.y, "#4ade80", 130);
  sparkBurst(A.x, A.y, ["#fb7185", "#e11d48", "#4ade80", "#ffe4e6"], 24, 110);
  if (D) {
   ring(D.x, D.y, "#f43f5e", 115);
   sparkBurst(D.x, D.y, ["#f43f5e", "#9f1239", "#fecdd3"], 14, 75);
  }
  if (pa && pa.animate) {
   pa.animate([
    { filter: "brightness(1)" },
    { filter: "brightness(1.38) drop-shadow(0 0 20px #e11d48)" },
    { filter: "brightness(1)" }
   ], { duration: 420 });
  }
  await Promise.all([cAnim, lineAnim]);
 } catch (err) {
  console.error("sacrificialCupFx error:", err);
  try { onApply(); } catch (_) {}
 } finally {
  nodes.forEach(n => { try { n.remove(); } catch (_) {} });
 }
}

async function sacrificialTickFx(targetIdx, drainDmg) {
 try {
  const C = seatC(targetIdx), pd = $("p" + targetIdx);
  pop(targetIdx, "ЖЕРТОВНИЙ КУБОК", "#f43f5e");
  snd("slice");
  if (!_isReducedMotion()) {
   shock(C.x, C.y, "#e11d48", 165);
   ring(C.x, C.y, "#fda4af", 125);
   sparkBurst(C.x, C.y, ["#e11d48", "#fb7185", "#881337"], 20, 100);
   shake(pd);
  }
  await sl(240);
 } catch (err) {
  console.error("sacrificialTickFx error:", err);
 }
}

// 11. «Кров Саламандри» (Φ): спалах багряного полум'я омиває гравця, гасить горіння та дає імунітет
async function salamanderBloodFx(act, wasBurning, hv, onApply) {
 const nodes = [];
 try {
  const C = seatC(act), pl = $("p" + act);
  snd("thunder");
  if (_isReducedMotion()) {
   onApply();
   burst(act, "#fb923c");
   await sl(180);
   return;
  }
  const ringEl = document.createElement("div");
  ringEl.style.cssText = `position:fixed;left:${C.x - 68}px;top:${C.y - 68}px;width:136px;height:136px;border-radius:50%;z-index:74;pointer-events:none;border:4px solid #fb923c;background:radial-gradient(circle,rgba(254,240,138,0.36) 0%,rgba(234,88,12,0.28) 55%,transparent 75%);box-shadow:0 0 28px #f97316,inset 0 0 20px #ef4444`;
  document.body.appendChild(ringEl); nodes.push(ringEl);
  const rAnim = an(ringEl, [
   { transform: "scale(0.35) rotate(0deg)", opacity: 0 },
   { transform: "scale(1.12) rotate(160deg)", opacity: 1, offset: 0.48 },
   { transform: "scale(1.42) rotate(320deg)", opacity: 0 }
  ], 580, { easing: "ease-out" });

  await sl(250);
  onApply();
  snd("heal");
  snd("shield");
  shock(C.x, C.y, "#f97316", wasBurning ? 200 : 155);
  ring(C.x, C.y, "#fde047", wasBurning ? 165 : 130);
  sparkBurst(C.x, C.y, ["#ffffff", "#fef08a", "#fb923c", "#dc2626", "#4ade80"], wasBurning ? 32 : 20, 125);
  if (pl && pl.animate) {
   pl.animate([
    { filter: "brightness(1)" },
    { filter: "brightness(1.48) drop-shadow(0 0 24px #fb923c)" },
    { filter: "brightness(1)" }
   ], { duration: 460 });
  }
  await rAnim;
 } catch (err) {
  console.error("salamanderBloodFx error:", err);
  try { onApply(); } catch (_) {}
 } finally {
  nodes.forEach(n => { try { n.remove(); } catch (_) {} });
 }
}

// 12. «Дерево Життя» (Ω): кінематографічний акцент, золоті гілки-світлові лінії проростають навколо медальйона
async function treeOfLifeFx(act, hv, regV, tDur, grantRoot, onApply) {
 const nodes = [];
 try {
  const C = seatC(act), pl = $("p" + act);
  snd("bloom");
  bell();
  if (_isReducedMotion()) {
   onApply();
   burst(act, "#fde047");
   await sl(200);
   return;
  }
  const vg = document.createElement("div");
  vg.style.cssText = `position:fixed;inset:0;z-index:69;pointer-events:none;opacity:0;background:radial-gradient(circle at ${C.x}px ${C.y}px,rgba(253,224,71,0.28) 0%,rgba(16,185,129,0.16) 34%,rgba(4,8,16,0.78) 82%)`;
  document.body.appendChild(vg); nodes.push(vg);
  an(vg, [{ opacity: 0 }, { opacity: 1 }], 240);

  const branches = document.createElement("div");
  branches.style.cssText = `position:fixed;left:${C.x - 105}px;top:${C.y - 110}px;width:210px;height:220px;z-index:74;pointer-events:none;filter:drop-shadow(0 0 18px #facc15) drop-shadow(0 0 32px #4ade80)`;
  branches.innerHTML = `<svg viewBox="0 0 210 220" width="210" height="220" style="overflow:visible">
   <g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path class="tl-b" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" d="M105 198 C105 162 66 156 54 114 C44 78 68 42 105 26" stroke="#fde047" stroke-width="4.2"/>
    <path class="tl-b" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" d="M105 198 C105 162 144 156 156 114 C166 78 142 42 105 26" stroke="#fde047" stroke-width="4.2"/>
    <path class="tl-b" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" d="M64 134 C44 126 30 108 26 86 M146 134 C166 126 180 108 184 86" stroke="#4ade80" stroke-width="3"/>
    <path class="tl-b" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" d="M105 198 C84 204 64 210 46 212 M105 198 C126 204 146 210 164 212" stroke="#fbbf24" stroke-width="3.2"/>
   </g>
   <circle cx="105" cy="26" r="8" fill="#fffbeb" opacity="0.9"/>
  </svg>`;
  document.body.appendChild(branches); nodes.push(branches);

  const bAnims = Array.from(branches.querySelectorAll(".tl-b")).map((p, idx) =>
   p.animate ? p.animate([
    { strokeDashoffset: 1, opacity: 0.3 },
    { strokeDashoffset: 0, opacity: 1 }
   ], { duration: 540, delay: idx * 55, easing: "cubic-bezier(.2,.85,.3,1)", fill: "forwards" }).finished.catch(() => {}) : sl(540)
  );

  await sl(380);
  onApply();
  snd("heal");
  shock(C.x, C.y, "#fde047", 230);
  ring(C.x, C.y, "#4ade80", 175);
  starburst(C.x, C.y, "#fef08a", 160);
  sparkBurst(C.x, C.y, ["#ffffff", "#fef08a", "#facc15", "#4ade80", "#a7f3d0"], 38, 155);
  if (pl && pl.animate) {
   pl.animate([
    { filter: "brightness(1)" },
    { filter: "brightness(1.65) drop-shadow(0 0 28px #fde047)" },
    { filter: "brightness(1)" }
   ], { duration: 560 });
  }
  await Promise.all(bAnims);
  await sl(200);
  await Promise.all([
   an(branches, [{ opacity: 1 }, { opacity: 0, transform: "scale(1.12)" }], 280),
   an(vg, [{ opacity: 1 }, { opacity: 0 }], 280)
  ]);
 } catch (err) {
  console.error("treeOfLifeFx error:", err);
  try { onApply(); } catch (_) {}
 } finally {
  nodes.forEach(n => { try { n.remove(); } catch (_) {} });
 }
}

// Порятунок від смерті «КОРІННЯ ЖИТТЯ» (пасив Дерева Життя при HP ≤ 0)
function lifeRootSaveFx(idx) {
 try {
  const C = seatC(idx), pl = $("p" + idx);
  snd("bloom");
  bell();
  pop(idx, "КОРІННЯ ЖИТТЯ! → 15 HP", "#fef08a");
  burst(idx, "#fde047");
  burst(idx, "#4ade80");
  if (_isReducedMotion()) return;

  const shield = document.createElement("div");
  shield.style.cssText = `position:fixed;left:${C.x - 74}px;top:${C.y - 78}px;width:148px;height:156px;z-index:78;pointer-events:none;filter:drop-shadow(0 0 22px #fde047) drop-shadow(0 0 38px #f59e0b)`;
  shield.innerHTML = `<svg viewBox="0 0 120 128" width="148" height="156" style="overflow:visible">
   <path d="M60 6 L108 26 V68 C108 98 86 116 60 124 C34 116 12 98 12 68 V26 Z" fill="rgba(250,204,21,0.28)" stroke="#fef08a" stroke-width="4"/>
   <path d="M60 24 V96 M60 54 L38 40 M60 54 L82 40 M60 84 L40 98 M60 84 L80 98" fill="none" stroke="#ffffff" stroke-width="3.2" stroke-linecap="round"/>
  </svg>`;
  document.body.appendChild(shield);
  shock(C.x, C.y, "#fde047", 240);
  ring(C.x, C.y, "#4ade80", 190);
  starburst(C.x, C.y, "#fde047", 175);
  sparkBurst(C.x, C.y, ["#ffffff", "#fef08a", "#facc15", "#4ade80"], 36, 155);
  if (pl && pl.animate) {
   pl.animate([
    { filter: "brightness(1)" },
    { filter: "brightness(2) drop-shadow(0 0 32px #fde047)" },
    { filter: "brightness(1)" }
   ], { duration: 680 });
  }
  an(shield, [
   { transform: "scale(0.35)", opacity: 0 },
   { transform: "scale(1.16)", opacity: 1, offset: 0.35 },
   { transform: "scale(1.02)", opacity: 0.95, offset: 0.72 },
   { transform: "scale(1.25)", opacity: 0 }
  ], 920, { easing: "ease-out" }).then(() => shield.remove()).catch(() => shield.remove());
 } catch (err) {
  console.error("lifeRootSaveFx error:", err);
 }
}


// ===== VFX ДЛЯ 5 НОВИХ СПЕЦКАРТ (V64) =====

// 1. Дзеркало Нарциса (Σ)
async function narcissusMirrorFx(act, def, stolen, onApply) {
 const a = seatC(act), d = seatC(def);
 const mx = (a.x + d.x) / 2, my = (a.y + d.y) / 2;
 const el = document.createElement("div");
 el.className = "fx-spec-overlay fx-narcissus";
 el.innerHTML = SVG_IC["Σ"];
 el.style.left = `${mx}px`;
 el.style.top = `${my}px`;
 document.body.appendChild(el);
 snd("shield");
 ring(mx, my, "#34d399", 110);
 await sl(260);
 if (stolen) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "fx-ariadne-svg");
  svg.innerHTML = `<path d="M ${d.x} ${d.y} Q ${mx} ${my - 48} ${a.x} ${a.y}" fill="none" stroke="#34d399" stroke-width="5" stroke-linecap="round" opacity="0.72"/><path d="M ${d.x} ${d.y} Q ${mx} ${my - 48} ${a.x} ${a.y}" fill="none" stroke="#fef08a" stroke-width="2" stroke-linecap="round"/>`;
  document.body.appendChild(svg);
  for (let i = 0; i < 12; i++) {
   const sp = document.createElement("div");
   sp.className = "fx-spark-dot";
   sp.style.background = i % 2 ? "#34d399" : "#fde047";
   sp.style.color = sp.style.background;
   sp.style.left = `${d.x}px`;
   sp.style.top = `${d.y}px`;
   document.body.appendChild(sp);
   const jx = (Math.random() - 0.5) * 32, jy = (Math.random() - 0.5) * 32;
   sp.animate([
    { transform: "translate(-50%,-50%) scale(1.25)", opacity: 1 },
    { transform: `translate(${(a.x - d.x) * 0.5 + jx}px, ${(a.y - d.y) * 0.5 - 32 + jy}px) scale(1.1)`, opacity: 1, offset: 0.5 },
    { transform: `translate(${a.x - d.x}px, ${a.y - d.y}px) scale(0.35)`, opacity: 0.9 }
   ], { duration: 420 + i * 22, easing: "cubic-bezier(.22,.8,.36,1)" }).finished.then(() => sp.remove()).catch(() => sp.remove());
  }
  await sl(340);
  svg.remove();
  starburst(d.x, d.y, "#fde047", 110);
  burst(def, "#fde047");
  burst(act, "#34d399");
  sparkBurst(a.x, a.y, ["#34d399", "#fde047", "#fffbeb"], 16, 85);
  snd("hit");
 } else {
  ring(a.x, a.y, "#34d399", 95);
  sparkBurst(a.x, a.y, ["#34d399", "#fde047", "#a7f3d0"], 16, 75);
  burst(act, "#34d399");
  snd("heal");
 }
 if (onApply) onApply();
 await sl(250);
 el.remove();
}

// 2. Кайдани Кроноса (Θ)
async function kronosChainsFx(act, def, onApply) {
 const d = seatC(def);
 const ringEl = document.createElement("div");
 ringEl.className = "fx-kronos-ring";
 ringEl.style.left = `${d.x}px`;
 ringEl.style.top = `${d.y}px`;
 ringEl.innerHTML = SVG_IC["Θ"];
 document.body.appendChild(ringEl);
 snd("ice");
 frostShards(d.x, d.y, 14, 80);
 ring(d.x, d.y, "#7dd3fc", 120);
 await sl(300);
 snd("shatter");
 burst(def, "#7dd3fc");
 if (onApply) onApply();
 const seatEl = $("p" + def);
 if (seatEl) {
  seatEl.classList.add("kronos-frozen-flash");
  setTimeout(() => seatEl.classList.remove("kronos-frozen-flash"), 950);
 }
 await sl(340);
 ringEl.remove();
}

// 3. Нить Аріадни (Λ)
async function ariadneThreadFx(act, def, statusType, onApply) {
 const a = seatC(act), d = seatC(def);
 const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
 svg.setAttribute("class", "fx-ariadne-svg");
 const cx = (a.x + d.x) / 2, cy = Math.min(a.y, d.y) - 70;
 svg.innerHTML = `<path d="M ${a.x} ${a.y} Q ${cx} ${cy} ${d.x} ${d.y}" fill="none" stroke="#fde047" stroke-width="3.2" stroke-linecap="round" stroke-dasharray="600" stroke-dashoffset="600"><animate attributeName="stroke-dashoffset" from="600" to="0" dur="0.38s" fill="freeze"/></path><circle cx="${d.x}" cy="${d.y}" r="36" fill="none" stroke="#facc15" stroke-width="2" stroke-dasharray="10 6" opacity="0.85"/>`;
 document.body.appendChild(svg);
 snd("swap");
 if (statusType) {
  const token = document.createElement("div");
  token.className = "fx-thread-token";
  token.innerHTML = statusType === "p" ? UI_IC.skull : UI_IC.fire;
  token.style.left = `${a.x}px`;
  token.style.top = `${a.y}px`;
  document.body.appendChild(token);
  token.animate([
   { transform: "translate(-50%,-50%) scale(1.25)", opacity: 1 },
   { transform: `translate(${(d.x - a.x) * 0.5}px, ${(d.y - a.y) * 0.5 - 45}px) scale(1.35)`, opacity: 1, offset: 0.5 },
   { transform: `translate(${d.x - a.x}px, ${d.y - a.y}px) scale(0.95)`, opacity: 1 }
  ], { duration: 430, easing: "ease-in-out" }).finished.then(() => token.remove()).catch(() => token.remove());
 }
 await sl(400);
 ring(a.x, a.y, "#fde047", 96);
 burst(act, "#fde047");
 if (statusType) burst(def, statusType === "p" ? "#a3e635" : "#fb923c");
 if (onApply) onApply();
 await sl(260);
 svg.remove();
}

// 4. Скипетр Аїда (Ψ)
async function hadesScepterFx(act, def, willRecoilHeal, onStrike, onRecoil) {
 const a = seatC(act), d = seatC(def);
 const mx = (a.x + d.x) / 2, my = (a.y + d.y) / 2 - 22;
 const el = document.createElement("div");
 el.className = "fx-spec-overlay fx-hades";
 el.innerHTML = SVG_IC["Ψ"];
 el.style.left = `${mx}px`;
 el.style.top = `${my}px`;
 document.body.appendChild(el);
 snd("thunder");
 await sl(300);
 const arc = document.createElementNS("http://www.w3.org/2000/svg", "svg");
 arc.setAttribute("class", "fx-ariadne-svg");
 const cx = (a.x + d.x) / 2, cy = Math.min(a.y, d.y) - 95;
 arc.innerHTML = `<path d="M ${a.x} ${a.y} Q ${cx} ${cy} ${d.x} ${d.y}" fill="none" stroke="#7e22ce" stroke-width="7.5" stroke-linecap="round" opacity="0.88"/><path d="M ${a.x} ${a.y} Q ${cx} ${cy} ${d.x} ${d.y}" fill="none" stroke="#f43f5e" stroke-width="2.8" stroke-linecap="round"/>`;
 document.body.appendChild(arc);
 burst(def, "#9333ea");
 burst(def, "#f43f5e");
 sparkBurst(d.x, d.y, ["#a855f7", "#f43f5e", "#1e1b4b"], 22, 110);
 snd("hit", 38);
 shake($("p" + def));
 if (onStrike) onStrike();
 await sl(290);
 arc.remove();
 if (willRecoilHeal) {
  const healRing = document.createElement("div");
  healRing.className = "fx-hades-heal-ring";
  healRing.style.left = `${a.x}px`;
  healRing.style.top = `${a.y}px`;
  document.body.appendChild(healRing);
  snd("heal");
  burst(act, "#c084fc");
  sparkBurst(a.x, a.y, ["#c084fc", "#f5d0fe", "#e11d48"], 16, 80);
  if (onRecoil) onRecoil();
  await sl(420);
  healRing.remove();
 }
 el.remove();
}

// 5. Колесо Фортуни (Π)
async function fortuneWheelFx(act, onApply) {
 const a = seatC(act);
 const el = document.createElement("div");
 el.className = "fx-spec-overlay fx-fortune-wheel";
 el.innerHTML = SVG_IC["Π"];
 el.style.left = "50%";
 el.style.top = "48%";
 document.body.appendChild(el);
 [0, 95, 195, 310, 445, 590].forEach(ms => setTimeout(() => snd("wheelTick"), ms));
 await sl(700);
 starburst(window.innerWidth / 2, window.innerHeight * 0.48, "#facc15", 130);
 sparkBurst(a.x, a.y, ["#fde047", "#f59e0b", "#fffbeb"], 24, 105);
 burst(act, "#facc15");
 snd("coins");
 if (onApply) onApply();
 await sl(300);
 el.remove();
}
