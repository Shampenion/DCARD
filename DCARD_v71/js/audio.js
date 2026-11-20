// ==========================================

// DCARD V28 — АУДІО-РУШІЙ (js/audio.js)

// Процедурні звукові ефекти, реверберація та динамічний саундтрек

// ==========================================

function snd(t, v) {
 if (mute) return;
 try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); AC.resume(); } catch (e) { return; }
 if (!AC.bus) {
 const m = AC.createGain(); m.gain.value = VOL.s * .9; m.connect(AC.destination); AC.master = m;
 const cv = AC.createConvolver(), len = AC.sampleRate * 1.8, buf = AC.createBuffer(2, len, AC.sampleRate);
 for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
 cv.buffer = buf; AC.cv = cv;
 const wet = AC.createGain(); wet.gain.value = .32; cv.connect(wet); wet.connect(m);
 const bus = AC.createGain(); bus.connect(m); bus.connect(cv); AC.bus = bus;
 const nb = AC.createBuffer(1, AC.sampleRate, AC.sampleRate), nd = nb.getChannelData(0);
 for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
 AC.nbuf = nb;
 }
 const O = (f, d, ty = "sine", vol = .15, to = f, dl = 0) => {
 const o = AC.createOscillator(), g = AC.createGain(), s0 = AC.currentTime + dl;
 o.type = ty; o.frequency.setValueAtTime(f, s0); o.frequency.exponentialRampToValueAtTime(Math.max(30, to), s0 + d);
 g.gain.setValueAtTime(vol, s0); g.gain.exponentialRampToValueAtTime(.001, s0 + d);
 o.connect(g); g.connect(AC.bus); o.start(s0); o.stop(s0 + d);
 };
 const N = (d, vol, f1, f2, ty = "bandpass", dl = 0, q = 1) => {
 const src = AC.createBufferSource(), fl = AC.createBiquadFilter(), g = AC.createGain(), t0 = AC.currentTime + dl;
 src.buffer = AC.nbuf; src.loop = true; fl.type = ty; fl.Q.value = q;
 fl.frequency.setValueAtTime(f1, t0); fl.frequency.exponentialRampToValueAtTime(Math.max(40, f2), t0 + d);
 g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(.001, t0 + d);
 src.connect(fl); fl.connect(g); g.connect(AC.bus); src.start(t0); src.stop(t0 + d + .05);
 };
 const p = Math.min(1, (v || 20) / 50);
 const E = {
 throw: () => { N(.2, .16, 400, 2600, "bandpass", 0, 1.2); O(340, .1, "triangle", .08, 140); },
 wheelTick: () => { O(1650, .035, "triangle", .12, 920); N(.025, .09, 3200, 1400, "bandpass", 0, 2.5); },

 anvil: () => { N(.08, .28, 6000, 1800, "highpass"); O(1480, .45, "triangle", .16, 1440); O(2960, .38, "sine", .1, 2920, .01); O(180, .25, "sine", .32, 55); },
 clang: () => { N(.12, .32, 6500, 1400, "highpass"); O(1180, .65, "triangle", .18, 1140); O(2360, .55, "sine", .11, 2320, .01); O(3540, .4, "sine", .06, 3480, .02); O(135, .36, "sine", .38, 42); },
 coins: () => [2093, 2637, 3136, 3520, 4186].forEach((f, i) => { O(f, .32, "sine", .08, f * 1.01, i * .055); O(f * 1.5, .24, "triangle", .035, f * 1.48, i * .055 + .01); }),
 hit: () => { N(.14, .22, 5000, 900, "highpass"); O(1900, .35 + p * .7, "triangle", .06 + p * .05, 1750); O(2870, .3 + p * .5, "sine", .04, 2800, .01); O(150 - p * 60, .25 + p * 1.1, "sine", .3 + p * .35, 34, .02); N(.12 + p * .4, .15 + p * .2, 900, 60, "lowpass", .02); },
 thud: () => { O(95, .32, "sine", .45, 38); O(230, .09, "square", .13, 70); },
 poison: () => { N(.9, .09, 3500, 7000, "highpass"); O(220, .5, "sawtooth", .05, 90); N(.4, .06, 600, 200, "bandpass", .2, 4); },
 heal: () => [880, 1109, 1319, 1760].forEach((f, i) => { O(f, .7, "sine", .09, f, i * .08); O(f * 2, .5, "sine", .03, f * 2, i * .08); }),
 water: () => { N(.32, .12, 900, 2600, "bandpass", 0, 2.2); [740, 988, 1319, 1480].forEach((f, i) => O(f, .42, "sine", .085, f * 1.06, i * .065)); },
 wind: () => { N(.55, .14, 520, 1900, "bandpass", 0, 1.8); [659, 880, 1175].forEach((f, i) => O(f, .45, "triangle", .055, f * 1.03, i * .07)); },
 bloom: () => [587, 740, 880, 1175, 1480].forEach((f, i) => { O(f, .65, "sine", .08, f * 1.01, i * .055); O(f * 2, .45, "triangle", .025, f * 2, i * .055); }),
 thunder: () => { N(.1, .3, 8000, 2000, "highpass"); N(1.8, .4, 500, 50, "lowpass", .05, .7); O(55, 1.6, "sine", .45, 28, .05); },
 shield: () => { N(.08, .25, 5000, 3000, "highpass"); O(1250, .55, "square", .05, 1180); O(1870, .7, "sine", .06, 1850); O(310, .3, "triangle", .12, 200); },
 stun: () => { O(600, .18, "sawtooth", .16, 180); O(920, .22, "square", .12, 220, .06); },
 swap: () => [330, 495, 660, 990].forEach((f, i) => O(f, .35, "sine", .14, f * 1.25, i * .07)),
 slice: () => { N(.22, .3, 7000, 1200, "highpass"); O(2400, .5, "sawtooth", .05, 1900, .05); O(110, 1, "sine", .4, 30, .1); N(.6, .2, 500, 80, "lowpass", .1); },
 ice: () => { N(.3, .16, 9000, 3000, "highpass"); [2093, 2637, 3136, 4186].forEach((f, i) => O(f, .5, "sine", .06, f * .985, i * .05)); O(170, .35, "triangle", .12, 80); },
 shatter: () => { N(.22, .3, 8000, 1500, "highpass"); [3520, 2794, 4186].forEach((f, i) => O(f, .16, "square", .035, f * .5, i * .03)); O(120, .2, "triangle", .12, 60); },
 win: () => [523, 659, 784, 1047].forEach((f, i) => O(f, .5, "triangle", .14, f, i * .13)),
 lose: () => [392, 330, 262, 196].forEach((f, i) => O(f, .5, "sawtooth", .1, f * .9, i * .15)),
 tartarus: () => { N(.22, .26, 4400, 950, "bandpass", 0, 1.5); O(170, .28, "triangle", .22, 54, 0); O(94, .58, "sine", .42, 34, .22); N(.48, .24, 680, 110, "lowpass", .22, .85); O(64, 2.6, "sine", .36, 32, .05); O(48, 2.4, "triangle", .16, 30, .14); O(96, 1.9, "sawtooth", .045, 56, .2); N(2.5, .22, 240, 52, "lowpass", .08, .85); }
 };
 if (E[t]) E[t]();
}


function setVol() {
 if (AC && AC.master) AC.master.gain.value = mute ? 0 : VOL.s * .9;
 if (MU) MU.mg.gain.value = mute ? 0 : VOL.m * .3;
}
function musicStart() {
 snd("init");
 if (!AC || !AC.cv || MU) return;
 const mg = AC.createGain(); mg.gain.value = VOL.m * .3; mg.connect(AC.destination); mg.connect(AC.cv);
 MU = { mg, tense: false };
 const prog = [[261.63, 329.63, 392], [220, 261.63, 329.63], [174.61, 220, 261.63], [196, 246.94, 293.66]];
 const voice = (f, ty, vol, atk, dur, fq) => {
 const o = AC.createOscillator(), g = AC.createGain(), fl = AC.createBiquadFilter(), t0 = AC.currentTime;
 o.type = ty; o.frequency.value = f; fl.type = "lowpass"; fl.frequency.value = fq;
 g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + atk); g.gain.linearRampToValueAtTime(0, t0 + dur);
 o.connect(fl); fl.connect(g); g.connect(mg); o.start(t0); o.stop(t0 + dur + .1);
 };
 const kick = () => {
 const o = AC.createOscillator(), g = AC.createGain(), t0 = AC.currentTime;
 o.frequency.setValueAtTime(90, t0); o.frequency.exponentialRampToValueAtTime(45, t0 + .14);
 g.gain.setValueAtTime(.5, t0); g.gain.exponentialRampToValueAtTime(.001, t0 + .2);
 o.connect(g); g.connect(mg); o.start(t0); o.stop(t0 + .22);
 };
 let ci = 0, st = 0;
 const tick = () => {
 const ch = prog[ci % 4], tn = MU.tense;
 if (st % 8 === 0) { ch.forEach((f, k) => voice(f, k ? "triangle" : "sine", .07, .8, 4.2, 2200)); voice(ch[0] / 2, "sine", .12, .3, 4, 400); ci++; }
 voice(ch[[0, 1, 2, 1][st % 4]] * (tn ? 4 : 2), "sine", .045, .01, 1.1, 4000);
 if (st % 8 === 6) voice(ch[2] * 4, "triangle", .03, .02, 1.6, 5000);
 if (tn && st % 2 === 0) kick();
 st++;
 setTimeout(tick, tn ? 300 : 460);
 };
 tick();
}

const WHEEL_PX = 46; // пікселів свайпу на одну карту у віялі (тільки для телефону)
const isDesktopHand = () => matchMedia("(min-width: 768px)").matches;


function bell() {
 if (mute) return;
 try {
 AC = AC || new (window.AudioContext || window.webkitAudioContext)(); AC.resume();
 const t = AC.currentTime;
 [[1, .18], [2.76, .08], [5.4, .04]].forEach(([m, g]) => {
 const o = AC.createOscillator(), G = AC.createGain();
 o.type = "sine"; o.frequency.value = 1568 * m;
 G.gain.setValueAtTime(g, t); G.gain.exponentialRampToValueAtTime(.0008, t + 1.8);
 o.connect(G); G.connect(AC.destination); o.start(t); o.stop(t + 1.9);
 });
 } catch (e) {}
}