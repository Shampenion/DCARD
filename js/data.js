// ==========================================

// DCARD V28 — МОДУЛЬ ДАНИХ (js/data.js)

// Рідкості, назви, SVG-ілюстрації, Кодекс, Арени та Статуси

// ==========================================

const R = [
 { n: "Зелена", c: "#3e9b5f", w: 34, d: 12, h: 10 },
 { n: "Синя", c: "#3b82c4", w: 28, d: 18, h: 15 },
 { n: "Фіолетова", c: "#9461c9", w: 20, d: 25, h: 22 },
 { n: "Червона", c: "#c4453f", w: 12, d: 35, h: 30 },
 { n: "Легендарна", c: "#e0b02c", w: 6, d: 50, h: 45 }
];

const NAMES = {
 d: ["Кремінь","Кинджал","Тризуб","Серп Ареса","Меч Титана"],
 h: ["Оливка","Амфора","Амброзія","Нектар","Золоте руно"],
 p: ["Цикута","Жовч","Жало Гідри","Кров Ехідни","Гідра Лерни"],
 g: ["Мирт","Лотос","Дар Гігеї","Мед Богів","Ікор богів"],
 s: "Егіда",
 v: "Сатаня",
 f: "Гефест",
 m: "Щит Персея",
 z: "Громовиця",
 x: "Танатос",
 u: "Хускад",
 w: "Дивна угода",
 k: "Сковорода",
 b: "Барабан",
 r: "Блад",
 i: "Крижаний Щит",
 o: "Мйольнір",
 a: "Аґнеястра",
 t: "Шип рози",
 e: "Преферанс",
 n: "Благословення Ра",
 q: "Око Медузи",
 y: "Крижана голка",
 j: "Ікло Фафніра",
 l: "Кайдани Фантома",
 c: "Мімікрія",
 H: "Хвиля прибою",
 D: "Праща Давида",
 A: "Смола Аїда",
 C: "Лезо Хаоса",
 S: "Камінь Сизифа",
 P: "Жало Скорпіона",
 F: "Фіал Асклепія",
 T: "Панцир Черепахи",
 W: "Батіг Фурії",
 G: "Колісниця Геліоса",
 L: "Спис Ахілла",
 E: "Прокляття Ереба",
 B: "Чаша Геби",
 K: "Кров Титана",
 N: "Терези Немезиди",
 I: "Палиця", J: "Ніж", M: "Сокира", O: "Кастет", Q: "Дротик", R: "Арбалет", U: "Лук", V: "Булава", X: "Молот", Y: "Подвійний клинок", Z: "Пробійник",
 1: "Яблуко", 2: "Хліб", 3: "Трави", 4: "Молоко", 5: "Настоянка", 6: "Аптечка",
 7: "Вихор Харибди", 8: "Лоза Діоніса",
 9: "Дестрояр", 0: "Рука Мідаса",
 α: "Праща Мисливця", β: "Клевок Гарпії", γ: "Удар Праці", δ: "Дротик Пельтаста", ε: "Шрам Найманця",
 ζ: "Клинок Борея", η: "Стріла Аполлона",
 θ: "Клеймо Мойр", ι: "Вихор Скілли",
 κ: "Гнів Ареса", λ: "Молот Тіфону", μ: "Удар Горгони", ν: "Кара Вогню",
 ξ: "Длань Зевса", ω: "Кара Харона",
 π: "Ячмінь", ρ: "Ромашка", σ: "Корінь Женьшеню",
 τ: "Ключ Джерела", υ: "Крила Зефіра",
 φ: "Дзеркало Нікти", χ: "Іскра Гестії", ψ: "Квітка Персефони", Γ: "Ехо Аркадії",
 Δ: "Жертовний Кубок", Φ: "Кров Саламандри",
 Ω: "Дерево Життя",
 Σ: "Дзеркало Нарциса",
 Θ: "Кайдани Кроноса",
 Λ: "Нить Аріадни",
 Ψ: "Скипетр Аїда",
 Π: "Колесо Фортуни"
};


// ===== КАСТОМНІ ВЕКТОРНІ ІКОНКИ ІНТЕРФЕЙСУ (БЕЗ СИСТЕМНИХ ЕМОДЗІ) =====
const UI_IC = {
 gear: `<svg class="ui-svg ui-lg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2v2.4M12 19.6V22M4.93 4.93l1.7 1.7M17.37 17.37l1.7 1.7M2 12h2.4M19.6 12H22M4.93 19.07l1.7-1.7M17.37 6.63l1.7-1.7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="12" r="7.2" fill="none" stroke="currentColor" stroke-width="1.3" stroke-dasharray="3 2.5"/></svg>`,
 book: `<svg class="ui-svg ui-lg" viewBox="0 0 24 24"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16z" fill="#fbbf24" fill-opacity="0.22" stroke="#fde047" stroke-width="1.8" stroke-linejoin="round"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" fill="none" stroke="#fde047" stroke-width="1.6"/><line x1="9" y1="7.5" x2="16" y2="7.5" stroke="#fef08a" stroke-width="1.6" stroke-linecap="round"/><line x1="9" y1="11" x2="14.5" y2="11" stroke="#fde047" stroke-width="1.4" stroke-linecap="round"/></svg>`,
 mirror: `<svg class="ui-svg" viewBox="0 0 24 24"><ellipse cx="12" cy="11" rx="6.5" ry="8.5" fill="#1e293b" stroke="#f8fafc" stroke-width="1.8"/><path d="M9 6.5L14 14M11.5 5.5L15 11" stroke="#cbd5e1" stroke-width="1.3" stroke-linecap="round"/><path d="M9.5 19.5h5M12 19.5v2" stroke="#cbd5e1" stroke-width="1.8" stroke-linecap="round"/></svg>`,
 menu: `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`,
 sndOn: `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
 sndOff: `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" opacity=".6"/><path d="M16 9l5 6M21 9l-5 6" stroke="#f87171" stroke-width="2.2" stroke-linecap="round"/></svg>`,
 trophy: `<svg class="ui-svg ui-lg" viewBox="0 0 24 24"><path d="M7 4h10v6a5 5 0 0 1-10 0V4z" fill="#facc15" stroke="#fef08a" stroke-width="1.2"/><path d="M7 6H4a2 2 0 0 0 0 4h3M17 6h3a2 2 0 0 1 0 4h-3" fill="none" stroke="#fbbf24" stroke-width="1.6"/><path d="M12 15v4M8 20h8" stroke="#fbbf24" stroke-width="2" stroke-linecap="round"/></svg>`,
 play: `<svg class="ui-svg ui-lg" viewBox="0 0 24 24"><polygon points="6,4 20,12 6,20" fill="currentColor"/></svg>`,
 swords: `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M5 19L19 5M15 5h4v4M19 19L5 5M9 5H5v4" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
 crown: `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M3 18h18l-1.5-10-4.5 4-3-6-3 6-4.5-4L3 18z" fill="#facc15" stroke="#fef08a" stroke-width="1"/></svg>`,
 timer: `<svg class="ui-svg" viewBox="0 0 24 24"><circle cx="12" cy="13" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 9v4l2.5 2M9 3h6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
 hourglass: `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M7 3h10M7 21h10M8 3c0 5 4 6 4 9s-4 4-4 9M16 3c0 5-4 6-4 9s4 4 4 9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><polygon points="10,18 14,18 12,14" fill="currentColor"/></svg>`,
 sun: `<svg class="ui-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.5" fill="#fde047"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2.2 2.2M16.8 16.8L19 19M19 5l-2.2 2.2M7.2 16.8L5 19" stroke="#fbbf24" stroke-width="2" stroke-linecap="round"/></svg>`,
 skull: `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M12 3a7 7 0 0 0-7 7c0 2.5 1.3 4.6 3.2 5.8V19h7.6v-3.2A7 7 0 0 0 19 10a7 7 0 0 0-7-7z" fill="#a3e635" stroke="#365314" stroke-width="1.2"/><circle cx="9.5" cy="10.5" r="1.5" fill="#1a2e05"/><circle cx="14.5" cy="10.5" r="1.5" fill="#1a2e05"/><path d="M10 16v3M14 16v3" stroke="#1a2e05" stroke-width="1.4"/></svg>`,
 fire: `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M12 2c2 4-2 6 0 10 2-1.5 3-4 3-4 3 3 4 7 1 11-2.5 3-8 3-10.5 0-2.5-3-1.5-8 2-11 0 2.5 2 3.5 2 3.5-1.5-3.5 0-7 2.5-9.5z" fill="#fb923c" stroke="#fef08a" stroke-width="1"/></svg>`,
 rose: `<svg class="ui-svg" viewBox="0 0 24 24"><circle cx="12" cy="10" r="5" fill="#e11d48" stroke="#fecdd3" stroke-width="1.2"/><path d="M12 15v6M12 18l-3-2M12 17l3-2" stroke="#4ade80" stroke-width="2" stroke-linecap="round"/></svg>`,
 heart: `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M12 20s-8-5-8-10.5C4 6.4 6.5 4 9.3 4c1.7 0 3.1.9 2.7 2.2C11.6 4.9 13 4 14.7 4 17.5 4 20 6.4 20 9.5 20 15 12 20 12 20z" fill="#f87171" stroke="#fecaca" stroke-width="1"/></svg>`,
 brokenHeart: `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M12 20s-8-5-8-10.5C4 6.4 6.5 4 9.3 4c1.7 0 3.1.9 2.7 2.2C12 4.9 13 4 14.7 4 17.5 4 20 6.4 20 9.5 20 15 12 20 12 20z" fill="#be123c" stroke="#fda4af" stroke-width="1"/><path d="M12 6l-2 4 3 3-2 5" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
 shield: `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M12 3L4 6.5v6c0 5.5 3.4 9.2 8 10.5 4.6-1.3 8-5 8-10.5v-6L12 3z" fill="#38bdf8" stroke="#e0f2fe" stroke-width="1.3"/></svg>`,
 snow: `<svg class="ui-svg" viewBox="0 0 24 24"><g stroke="#bae6fd" stroke-width="1.8" stroke-linecap="round"><path d="M12 2v20M3.5 7l17 10M20.5 7l-17 10"/><circle cx="12" cy="12" r="2.2" fill="#e0f2fe" stroke="none"/></g></svg>`,
 chain: `<svg class="ui-svg" viewBox="0 0 24 24"><g fill="none" stroke="#5eead4" stroke-width="2.1" stroke-linecap="round"><rect x="3" y="9" width="8" height="6" rx="3"/><rect x="13" y="9" width="8" height="6" rx="3"/><line x1="9" y1="12" x2="15" y2="12"/></g></svg>`,
 bolt: `<svg class="ui-svg" viewBox="0 0 24 24"><polygon points="13,2 5,14 11,14 10,22 19,10 13,10" fill="#facc15" stroke="#fef9c3" stroke-width="1"/></svg>`,
 plus: `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="#4ade80" stroke-width="2.6" stroke-linecap="round"/></svg>`,
 sparkle: `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M12 2l2.2 6.8L21 11l-6.8 2.2L12 20l-2.2-6.8L3 11l6.8-2.2z" fill="#fde047"/></svg>`,
 scale: `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M12 4v16M7 20h10M5 8h14M5 8l-2 5h4l-2-5zM19 8l-2 5h4l-2-5z" fill="none" stroke="#fbbf24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
 stone: `<svg class="ui-svg" viewBox="0 0 24 24"><polygon points="12,3 20,8 19,18 12,21 5,18 4,8" fill="#64748b" stroke="#cbd5e1" stroke-width="1.4"/><path d="M9 9l4 3-2 4" fill="none" stroke="#1e293b" stroke-width="1.5" stroke-linecap="round"/></svg>`,
 wave: `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M3 16c3-3 5-7 10-8 4-.8 7 1 7 3.5 0 2-2 3-3.5 2-1.5-1-1-3 .5-3.2-2.5-.5-5 1.5-5.5 4.2-.5 2.5 2 4 5.5 3.5 2.5-.4 4-1.5 4-1.5v4.5H3V16z" fill="#38bdf8" stroke="#bae6fd" stroke-width="1"/></svg>`,
 blood: `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M12 3C8.5 8.5 6 11.5 6 15a6 6 0 0 0 12 0c0-3.5-2.5-6.5-6-12z" fill="#e11d48" stroke="#fecdd3" stroke-width="1.2"/></svg>`,
 pillar: `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M5 5h14M6 8h12M7 8v10M12 8v10M17 8v10M5 19h14" fill="none" stroke="#e2b86b" stroke-width="1.8" stroke-linecap="round"/></svg>`,
 forest: `<svg class="ui-svg" viewBox="0 0 24 24"><polygon points="12,3 6,12 10,12 5,18 19,18 14,12 18,12" fill="#2dd4bf" stroke="#ccfbf1" stroke-width="1"/><line x1="12" y1="18" x2="12" y2="21" stroke="#5eead4" stroke-width="2"/></svg>`,
 mystery: `<svg class="ui-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="#5eead4" stroke-width="1.8"/><path d="M9.5 9.5a2.5 2.5 0 0 1 4.8.8c0 1.7-2.3 2.2-2.3 3.7" fill="none" stroke="#ccfbf1" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="17.2" r="1.2" fill="#ccfbf1"/></svg>`,
 star: `<svg class="ui-svg" viewBox="0 0 24 24"><polygon points="12,2 14.9,8.5 22,9.2 16.6,13.9 18.2,21 12,17.2 5.8,21 7.4,13.9 2,9.2 9.1,8.5" fill="#fde047" stroke="#f59e0b" stroke-width="1"/></svg>`,
 anvil: `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M4 11h13l3-2v4c0 2-2 3-5 3h-2l1.5 3v2H7.5v-2L9 16H7c-2 0-3-1-3-3v-2z" fill="#fb923c" stroke="#fed7aa" stroke-width="1.3"/><path d="M13 3l5 3-1.5 2.5-5-3z" fill="#e2e8f0"/></svg>`,
 eclipse: `<svg class="ui-svg" viewBox="0 0 24 24"><circle cx="10" cy="12" r="6.5" fill="#fbbf24"/><path d="M15.5 6.5a6.5 6.5 0 1 0 0 11 5.2 5.2 0 1 1 0-11z" fill="#a78bfa"/></svg>`,
 astral: `<svg class="ui-svg" viewBox="0 0 24 24"><defs><linearGradient id="astGr" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#34d399"/><stop offset="25%" stop-color="#38bdf8"/><stop offset="50%" stop-color="#c084fc"/><stop offset="75%" stop-color="#fb7185"/><stop offset="100%" stop-color="#fde047"/></linearGradient></defs><polygon points="12,2 14.8,9.2 22,12 14.8,14.8 12,22 9.2,14.8 2,12 9.2,9.2" fill="url(#astGr)" stroke="#ffffff" stroke-width="1"/><circle cx="12" cy="12" r="2.4" fill="#fff"/></svg>`,
 card: `<svg class="ui-svg" viewBox="0 0 24 24"><rect x="6" y="3" width="12" height="18" rx="2" fill="rgba(212,162,74,0.16)" stroke="currentColor" stroke-width="1.8"/><polygon points="12,8 14.6,12 12,16 9.4,12" fill="currentColor"/></svg>`,
 lock: `<svg class="ui-svg" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2" fill="rgba(15,23,42,0.5)" stroke="currentColor" stroke-width="1.8"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="16" r="1.4" fill="currentColor"/></svg>`,
 chest: `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M4 9.5C4 7.5 6.5 6 12 6s8 1.5 8 3.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19V9.5z" fill="rgba(251,191,36,0.18)" stroke="#fbbf24" stroke-width="1.7"/><path d="M4 12.5h16" stroke="#fde047" stroke-width="1.6"/><rect x="10.2" y="11" width="3.6" height="4" rx="0.8" fill="#fde047"/></svg>`,
 urn: `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M9 3h6l-1 3c2.5 1.2 4 3.5 4 6.5 0 3.5-2 6-3.5 7.5h-5C8 18.5 6 16 6 12.5 6 9.5 7.5 7.2 10 6L9 3z" fill="rgba(245,158,11,0.2)" stroke="#fbbf24" stroke-width="1.7" stroke-linejoin="round"/><path d="M7.5 11.5h9M8.5 14.5h7" stroke="#fde047" stroke-width="1.3"/></svg>`,
 eye: `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M2 12C5 6.8 8.5 4.5 12 4.5S19 6.8 22 12c-3 5.2-6.5 7.5-10 7.5S5 17.2 2 12z" fill="none" stroke="currentColor" stroke-width="1.9"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>`,
 exit: `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M14 4H6a1.5 1.5 0 0 0-1.5 1.5v13A1.5 1.5 0 0 0 6 20h8" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><path d="M11 12h9.5M17 8.5L20.5 12 17 15.5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
 skip: `<svg class="ui-svg" viewBox="0 0 24 24"><polygon points="4,5 12.5,12 4,19" fill="currentColor"/><polygon points="12.5,5 21,12 12.5,19" fill="currentColor"/></svg>`,
 palette: `<svg class="ui-svg" viewBox="0 0 24 24"><polygon points="12,2.5 21,12 12,21.5 3,12" fill="rgba(212,162,74,0.14)" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="2.6" fill="currentColor"/><path d="M12 2.5V6.5M12 17.5V21.5M3 12H7M17 12H21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
 gamepad: `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M6.5 7.5h11l3 6.5-2.8 4.5h-2.8l-1.9-2.8h-2l-1.9 2.8H6.3L3.5 14l3-6.5z" fill="rgba(212,162,74,0.12)" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8.5 11v3M7 12.5h3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="15.5" cy="11.5" r="1" fill="currentColor"/><circle cx="17.2" cy="13.2" r="1" fill="currentColor"/></svg>`,
 eco: `<svg class="ui-svg" viewBox="0 0 24 24"><rect x="3" y="7" width="15" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M20 10v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><rect x="6" y="9.8" width="4" height="4.4" rx="0.6" fill="currentColor"/></svg>`,
 sliders: `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><polygon points="9,4.5 11.5,7 9,9.5 6.5,7" fill="currentColor"/><polygon points="15,9.5 17.5,12 15,14.5 12.5,12" fill="currentColor"/><polygon points="10,14.5 12.5,17 10,19.5 7.5,17" fill="currentColor"/></svg>`,
 camera: `<svg class="ui-svg" viewBox="0 0 24 24"><rect x="3" y="6.5" width="13" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><polygon points="16,10 21,7 21,17 16,14" fill="currentColor"/></svg>`,
 wrench: `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M14.7 6.3a4.5 4.5 0 0 0-5.8 5.8L4 17l3 3 4.9-4.9a4.5 4.5 0 0 0 5.8-5.8l-2.6 2.6-2.8-2.8 2.4-2.8z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`,
 search: `<svg class="ui-svg" viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M15.8 15.8L20.5 20.5" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/></svg>`,
 chart: `<svg class="ui-svg" viewBox="0 0 24 24"><rect x="4" y="4" width="6.5" height="6.5" rx="1.2" fill="currentColor" opacity="0.9"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2" fill="currentColor" opacity="0.65"/></svg>`,
 scroll: `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M6 4h11a2.5 2.5 0 0 1 2.5 2.5V8H17v11.5a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 19V6.5A2.5 2.5 0 0 1 6 4z" fill="rgba(212,162,74,0.14)" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8 9h6M8 13h6M8 17h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
 map: `<svg class="ui-svg" viewBox="0 0 24 24"><polygon points="3,6 9,4 15,6 21,4 21,18 15,20 9,18 3,20" fill="rgba(52,211,153,0.14)" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 4v14M15 6v14" stroke="currentColor" stroke-width="1.5"/></svg>`,
 moon: `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M18.5 14.5A7.5 7.5 0 0 1 9.5 5.5a7.5 7.5 0 1 0 9 9z" fill="#c4b5fd" stroke="#a78bfa" stroke-width="1.4" stroke-linejoin="round"/></svg>`,
 compass: `<svg class="ui-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><polygon points="15.5,8.5 13.2,13.2 8.5,15.5 10.8,10.8" fill="currentColor"/></svg>`,
 bulb: `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.8c.6.5 1 1.2 1 2.2h5c0-1 .4-1.7 1-2.2A6 6 0 0 0 12 3z" fill="rgba(253,224,71,0.18)" stroke="#fde047" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
 dice: `<svg class="ui-svg" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3" fill="rgba(212,162,74,0.15)" stroke="currentColor" stroke-width="1.8"/><circle cx="9" cy="9" r="1.3" fill="currentColor"/><circle cx="15" cy="9" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="9" cy="15" r="1.3" fill="currentColor"/><circle cx="15" cy="15" r="1.3" fill="currentColor"/></svg>`,
 chalice: `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M6 4h12v4a6 6 0 0 1-12 0V4z" fill="rgba(225,29,72,0.25)" stroke="#fb7185" stroke-width="1.8"/><path d="M12 14v6M8 20h8" stroke="#fb7185" stroke-width="1.8" stroke-linecap="round"/></svg>`,
 mask: `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M4 6c4-2 12-2 16 0v5.5c0 4.8-3.4 8.2-8 9.5-4.6-1.3-8-4.7-8-9.5V6z" fill="rgba(212,162,74,0.14)" stroke="currentColor" stroke-width="1.8"/><path d="M8.5 10.5l2 1-2 1M15.5 10.5l-2 1 2 1M9.5 15.5c1.5 1 3.5 1 5 0" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
 heartGreen: `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M12 20s-8-5-8-10.5C4 6.4 6.5 4 9.3 4c1.7 0 3.1.9 2.7 2.2C11.6 4.9 13 4 14.7 4 17.5 4 20 6.4 20 9.5 20 15 12 20 12 20z" fill="#34d399" stroke="#a7f3d0" stroke-width="1.2"/></svg>`,
 close: `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`,
 check: `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M5 12.5l4.8 4.8L19 7.5" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
 diamond: `<svg class="ui-svg ui-orn" viewBox="0 0 24 24"><polygon points="12,3 15.2,8.8 21,12 15.2,15.2 12,21 8.8,15.2 3,12 8.8,8.8" fill="currentColor"/></svg>`,
 pen: `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M4 20l4.2-1.1L19 8.1 15.9 5 5.1 15.8 4 20z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/></svg>`,
 back: `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
 target: `<svg class="ui-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="2" fill="currentColor"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
 suitSpade: `<svg class="ui-svg ui-suit" viewBox="0 0 24 24"><path d="M12 2.5C8 8 4 10.5 4 14a4.2 4.2 0 0 0 6.8 3.2L9.2 21h5.6l-1.6-3.8A4.2 4.2 0 0 0 20 14c0-3.5-4-6-8-11.5z" fill="#a78bfa" stroke="#ede9fe" stroke-width="0.9"/></svg>`,
 suitHeart: `<svg class="ui-svg ui-suit" viewBox="0 0 24 24"><path d="M12 20.5s-8-5.2-8-10.7C4 6.6 6.5 4.2 9.3 4.2c1.6 0 2.7.8 2.7 2.1 0-1.3 1.1-2.1 2.7-2.1 2.8 0 5.3 2.4 5.3 5.6 0 5.5-8 10.7-8 10.7z" fill="#fb7185" stroke="#ffe4e6" stroke-width="0.9"/></svg>`,
 suitDiamond: `<svg class="ui-svg ui-suit" viewBox="0 0 24 24"><polygon points="12,2.5 19.5,12 12,21.5 4.5,12" fill="#fbbf24" stroke="#fef3c7" stroke-width="0.9"/></svg>`,
 suitClub: `<svg class="ui-svg ui-suit" viewBox="0 0 24 24"><circle cx="12" cy="7.5" r="3.8" fill="#34d399"/><circle cx="7.5" cy="13.2" r="3.8" fill="#34d399"/><circle cx="16.5" cy="13.2" r="3.8" fill="#34d399"/><polygon points="12,13 9.2,21 14.8,21" fill="#34d399"/></svg>`,
 orbGreen: `<svg class="ui-svg ui-orb" viewBox="0 0 16 16"><polygon points="8,1.5 14.5,8 8,14.5 1.5,8" fill="#3e9b5f" stroke="#a7f3d0" stroke-width="1.2"/></svg>`,
 orbBlue: `<svg class="ui-svg ui-orb" viewBox="0 0 16 16"><polygon points="8,1.5 14.5,8 8,14.5 1.5,8" fill="#3b82c4" stroke="#bae6fd" stroke-width="1.2"/></svg>`,
 orbPurple: `<svg class="ui-svg ui-orb" viewBox="0 0 16 16"><polygon points="8,1.5 14.5,8 8,14.5 1.5,8" fill="#9461c9" stroke="#e9d5ff" stroke-width="1.2"/></svg>`,
 orbRed: `<svg class="ui-svg ui-orb" viewBox="0 0 16 16"><polygon points="8,1.5 14.5,8 8,14.5 1.5,8" fill="#c4453f" stroke="#fecaca" stroke-width="1.2"/></svg>`,
 orbGold: `<svg class="ui-svg ui-orb" viewBox="0 0 16 16"><polygon points="8,1.5 14.5,8 8,14.5 1.5,8" fill="#e0b02c" stroke="#fef08a" stroke-width="1.2"/></svg>`,
 note: `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M9 18V6l11-2v12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6.5" cy="18" r="2.6" fill="currentColor"/><circle cx="17.5" cy="16" r="2.6" fill="currentColor"/></svg>`
,
 globe: `<svg class="ui-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><ellipse cx="12" cy="12" rx="4.2" ry="9" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M3.5 9h17M3.5 15h17" stroke="currentColor" stroke-width="1.4"/></svg>`,
 users: `<svg class="ui-svg" viewBox="0 0 24 24"><circle cx="9" cy="8.5" r="3.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3.5 19c.6-3.2 2.8-4.8 5.5-4.8s4.9 1.6 5.5 4.8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="16.5" cy="9.5" r="2.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M16 14.5c2.2.2 3.9 1.6 4.5 4.2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
 cloud: `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M7 18h10.5a4 4 0 0 0 .8-7.9A5.5 5.5 0 0 0 7.6 8.4 4.5 4.5 0 0 0 7 18z" fill="rgba(56,189,248,0.16)" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`,
 google: `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M20.5 12.2c0-.7-.1-1.3-.2-2H12v3.8h4.8c-.2 1.1-.8 2.1-1.8 2.8v2.3h2.9c1.7-1.6 2.6-3.9 2.6-6.9z" fill="#60a5fa"/><path d="M12 21c2.4 0 4.4-.8 5.9-2.2l-2.9-2.3c-.8.5-1.8.9-3 .9-2.3 0-4.3-1.6-5-3.7H4v2.4C5.5 19 8.5 21 12 21z" fill="#34d399"/><path d="M7 13.7c-.2-.5-.3-1.1-.3-1.7s.1-1.2.3-1.7V7.9H4A9 9 0 0 0 3 12c0 1.5.4 2.9 1 4.1l3-2.4z" fill="#fbbf24"/><path d="M12 6.6c1.3 0 2.5.4 3.4 1.3l2.6-2.6C16.4 3.8 14.4 3 12 3 8.5 3 5.5 5 4 7.9l3 2.4c.7-2.1 2.7-3.7 5-3.7z" fill="#f87171"/></svg>`,
 copy: `<svg class="ui-svg" viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>`,
 history: `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.5M4 4v4.5h4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 7.5v4.8l3.2 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`

};


UI_IC.spade = `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M12 3C8 8 4 11 4 14.5A4.5 4.5 0 0 0 10.5 18L9.5 21h5l-1-3A4.5 4.5 0 0 0 20 14.5C20 11 16 8 12 3z" fill="#a78bfa"/></svg>`;
UI_IC.club = `<svg class="ui-svg" viewBox="0 0 24 24"><circle cx="12" cy="7.5" r="4" fill="#34d399"/><circle cx="7.5" cy="13.5" r="4" fill="#34d399"/><circle cx="16.5" cy="13.5" r="4" fill="#34d399"/><path d="M10.5 15L9.5 21h5l-1-6z" fill="#34d399"/></svg>`;
UI_IC.diamond = `<svg class="ui-svg" viewBox="0 0 24 24"><polygon points="12,2 20,12 12,22 4,12" fill="#fbbf24"/></svg>`;
UI_IC.vortex = `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M12 3a9 9 0 1 1-8.5 12M12 6a6 6 0 1 1-5.4 8.5M12 9a3 3 0 1 1-2.5 4.5" fill="none" stroke="#c084fc" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="12" r="1.6" fill="#f5d0fe"/></svg>`;
UI_IC.wind = `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M3 9h11a3 3 0 1 0-2.8-4M3 13h15a2.5 2.5 0 1 1-2.3 3.5M4 17h7" fill="none" stroke="#7dd3fc" stroke-width="2" stroke-linecap="round"/></svg>`;
UI_IC.lyre = `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M7 5c-2 4-1 10 5 12 6-2 7-8 5-12M7 7h10M10 7v10M14 7v10M9 20h6" fill="none" stroke="#d8b4fe" stroke-width="1.8" stroke-linecap="round"/></svg>`;
UI_IC.fireShield = `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M12 3L5 6v6c0 5 3 8.2 7 9.5 4-1.3 7-4.5 7-9.5V6L12 3z" fill="#ea580c" fill-opacity=".3" stroke="#fdba74" stroke-width="1.6"/><path d="M12 7c1.4 2.4-1 3.8 0 6.2 1.2-.8 1.8-2 1.8-2 1.6 1.8 2 4 .2 5.6-1.4 1.3-4.2 1.3-5.4-.2-1.2-1.6-.6-4.2 1.2-5.8 0 1.4 1 2 1 2-.6-1.8 0-3.8 1.2-5.8z" fill="#fb923c"/></svg>`;
UI_IC.tree = `<svg class="ui-svg" viewBox="0 0 24 24"><circle cx="12" cy="9" r="6" fill="#facc15" fill-opacity=".35" stroke="#fef08a" stroke-width="1.5"/><path d="M12 9v11M12 13l-3-2.5M12 12l3-2M9 21c1.5-1.2 4.5-1.2 6 0" fill="none" stroke="#fde047" stroke-width="1.8" stroke-linecap="round"/></svg>`;
UI_IC.chalice = `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M6 4h12c0 5.5-2.5 9-6 9S6 9.5 6 4z" fill="#dc2626" stroke="#fecaca" stroke-width="1.4"/><path d="M12 13v6M8 20h8" stroke="#fca5a5" stroke-width="1.8" stroke-linecap="round"/></svg>`;
UI_IC.chrono = `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M7 3h10M7 21h10M8 3c0 5 4 6 4 9s-4 4-4 9M16 3c0 5-4 6-4 9s4 4 4 9" fill="none" stroke="#7dd3fc" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="12" r="2" fill="#e0f2fe"/></svg>`;
UI_IC.thread = `<svg class="ui-svg" viewBox="0 0 24 24"><circle cx="10" cy="13" r="6" fill="none" stroke="#fde047" stroke-width="1.8"/><path d="M6.5 10.5c2.5 1.5 5 1.5 7 0M6.5 15.5c2.5-1.5 5-1.5 7 0M15.5 10.5c3-2 5.5-.5 5 2.5-.4 2.5-3.2 3-4.5 1" fill="none" stroke="#facc15" stroke-width="1.6" stroke-linecap="round"/></svg>`;
UI_IC.scepter = `<svg class="ui-svg" viewBox="0 0 24 24"><path d="M12 21V9M9 4l1.5 5h3L15 4" fill="none" stroke="#c084fc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polygon points="12,5 14.2,8.5 12,11 9.8,8.5" fill="#f43f5e" stroke="#f5d0fe" stroke-width="0.9"/></svg>`;
UI_IC.wheel = `<svg class="ui-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" fill="none" stroke="#facc15" stroke-width="1.9"/><path d="M12 3.5v17M3.5 12h17M6 6l12 12M18 6L6 18" stroke="#fde047" stroke-width="1.2"/><circle cx="12" cy="12" r="2.2" fill="#fffbeb"/></svg>`;

// ===== ВЕКТОРНІ SVG-ГЕРБИ 5 ЛІГ («ДОРОГА ОЛІМПУ») =====
UI_IC.leagueBronze = `<svg class="ui-svg league-svg" viewBox="0 0 40 40"><defs><linearGradient id="lgBr1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f6c18b"/><stop offset="50%" stop-color="#b4632c"/><stop offset="100%" stop-color="#5a290c"/></linearGradient></defs><path d="M20 3L34 8.5V20c0 8.5-5.8 14.3-14 17C11.8 34.3 6 28.5 6 20V8.5L20 3z" fill="url(#lgBr1)" stroke="#fde2c4" stroke-width="1.6"/><path d="M20 7.5L30 11.4V20c0 6.2-4.1 10.6-10 12.7-5.9-2.1-10-6.5-10-12.7v-8.6L20 7.5z" fill="#2b1205" fill-opacity=".48" stroke="#d98a4e" stroke-width="1"/><path d="M13 15h14M15 17.5v8M20 17.5v8M25 17.5v8M13 26.5h14" stroke="#fde2c4" stroke-width="1.7" stroke-linecap="round"/></svg>`;
UI_IC.leagueSilver = `<svg class="ui-svg league-svg" viewBox="0 0 40 40"><defs><linearGradient id="lgSl1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f8fafc"/><stop offset="48%" stop-color="#94a3b8"/><stop offset="100%" stop-color="#334155"/></linearGradient></defs><path d="M20 3L34 8.5V20c0 8.8-5.8 14.5-14 17C11.8 34.5 6 28.8 6 20V8.5L20 3z" fill="url(#lgSl1)" stroke="#f1f5f9" stroke-width="1.7"/><path d="M20 7L30.5 11.2V20c0 6.5-4.3 11-10.5 13.1C13.8 31 9.5 26.5 9.5 20v-8.8L20 7z" fill="#0f172a" fill-opacity=".5" stroke="#cbd5e1" stroke-width="1.1"/><path d="M20 11v17M13.5 18.5L20 12l6.5 6.5M14.5 24h11" fill="none" stroke="#e2e8f0" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
UI_IC.leagueGold = `<svg class="ui-svg league-svg" viewBox="0 0 40 40"><defs><linearGradient id="lgGd1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fef9c3"/><stop offset="45%" stop-color="#eab308"/><stop offset="100%" stop-color="#854d0e"/></linearGradient></defs><path d="M20 2.5L34.5 8.5V20c0 9-6 14.8-14.5 17.5C11.5 34.8 5.5 29 5.5 20V8.5L20 2.5z" fill="url(#lgGd1)" stroke="#fef08a" stroke-width="1.7"/><circle cx="20" cy="19.5" r="8.5" fill="#422006" fill-opacity=".52" stroke="#fde047" stroke-width="1.2"/><path d="M13 24c-2-3.5-1.6-8.5 1.5-11.5M27 24c2-3.5 1.6-8.5-1.5-11.5" fill="none" stroke="#fef08a" stroke-width="1.7" stroke-linecap="round"/><polygon points="20,12 22.1,16.8 27,17.4 23.3,20.8 24.4,25.6 20,23 15.6,25.6 16.7,20.8 13,17.4 17.9,16.8" fill="#fef08a"/></svg>`;
UI_IC.leagueAmethyst = `<svg class="ui-svg league-svg" viewBox="0 0 40 40"><defs><linearGradient id="lgAm1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f5d0fe"/><stop offset="48%" stop-color="#9333ea"/><stop offset="100%" stop-color="#3b0764"/></linearGradient></defs><polygon points="20,2 35,10 33,26 20,38 7,26 5,10" fill="url(#lgAm1)" stroke="#f5d0fe" stroke-width="1.6" stroke-linejoin="round"/><polygon points="20,7 30,13 28.5,24 20,32.5 11.5,24 10,13" fill="#1e0638" fill-opacity=".58" stroke="#d8b4fe" stroke-width="1.1"/><polygon points="20,10.5 26,19.5 20,28.5 14,19.5" fill="#e879f9" stroke="#ffffff" stroke-width="1.2"/><line x1="20" y1="10.5" x2="20" y2="28.5" stroke="#fae8ff" stroke-width="1"/></svg>`;
UI_IC.leagueTitan = `<svg class="ui-svg league-svg" viewBox="0 0 40 40"><defs><linearGradient id="lgTi1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fffbeb"/><stop offset="30%" stop-color="#fbbf24"/><stop offset="65%" stop-color="#f43f5e"/><stop offset="100%" stop-color="#4c1d95"/></linearGradient></defs><polygon points="20,2 36,9 34,26.5 20,38 6,26.5 4,9" fill="url(#lgTi1)" stroke="#fef08a" stroke-width="1.8" stroke-linejoin="round"/><polygon points="20,6.5 31.5,12 30,24.5 20,33.5 10,24.5 8.5,12" fill="#090714" fill-opacity=".68" stroke="#fde047" stroke-width="1.1"/><path d="M12.5 23.5h15l1.5-9-4.5 3.6L20 11l-4.5 7.1-4.5-3.6 1.5 9z" fill="#fde047" stroke="#fffbeb" stroke-width="1" stroke-linejoin="round"/><circle cx="20" cy="20" r="2" fill="#f43f5e"/></svg>`;

const DUR = [2, 2, 3, 3, 4];
const BASE = { p: "d", g: "h" };
const cardName = c => { const t = BASE[c.t] || c.t; return Array.isArray(NAMES[t]) ? NAMES[t][c.r] : NAMES[t]; };

// НОВІ ДЕТАЛІЗОВАНІ SVG ІКОНКИ (ШЛЯХЕТНИЙ МЕЧ ТА АРТЕФАКТИ)
const SVG_IC = {
 d: `<svg viewBox="0 0 36 36"><defs><linearGradient id="wpShine" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fff" stop-opacity="0"/><stop offset="45%" stop-color="#fff" stop-opacity="0.85"/><stop offset="55%" stop-color="#e0f2fe" stop-opacity="0.95"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><clipPath id="swClip"><path d="M18 2L21 6L19 22L18 25L17 22L15 6L18 2z"/></clipPath><path d="M18 2L21 6L19 22L18 25L17 22L15 6L18 2z" fill="#f0f6fc" stroke="#7dd3fc" stroke-width="0.8"/><line x1="18" y1="4" x2="18" y2="23" stroke="#0284c7" stroke-width="0.9"/><g clip-path="url(#swClip)"><rect class="ic-glint" x="-6" y="-6" width="14" height="48" transform="rotate(28 18 18)" fill="url(#wpShine)"/></g><path d="M11 22L18 24L25 22L26 25L18 26L10 25L11 22z" fill="#fbbf24" stroke="#d97706" stroke-width="0.6"/><circle class="ic-pulse" cx="18" cy="24.5" r="1.6" fill="#ef4444"/><rect x="16.5" y="26" width="3" height="6.5" rx="1.2" fill="#78350f" stroke="#451a03" stroke-width="0.5"/><circle cx="18" cy="33.5" r="2.2" fill="#fbbf24" stroke="#d97706" stroke-width="0.6"/></svg>`,
 h: `<svg viewBox="0 0 36 36"><path d="M18 31s-12-7.4-12-16.5C6 9.4 10 6 14.2 6c2.6 0 4.8 1.4 3.8 3.5C17 7.4 19.2 6 21.8 6 26 6 30 9.4 30 14.5 30 23.6 18 31 18 31z" fill="#4ade80" stroke="#bbf7d0" stroke-width="1.5"/><path d="M15 16h6M18 13v6" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></svg>`,
 p: `<svg viewBox="0 0 36 36"><circle cx="18" cy="15" r="9" fill="#a3e635"/><rect x="13" y="21" width="10" height="6" rx="2" fill="#a3e635"/><circle cx="14.5" cy="15" r="2.3" fill="#1a2e05"/><circle cx="21.5" cy="15" r="2.3" fill="#1a2e05"/><path d="M16 24v3M20 24v3" stroke="#1a2e05" stroke-width="1.6"/></svg>`,
 g: `<svg viewBox="0 0 36 36"><path d="M28 8C14 8 8 16 8 28c12 0 20-6 20-20z" fill="#4ade80" stroke="#bbf7d0" stroke-width="1.5"/><path d="M9 27L24 12" stroke="#14532d" stroke-width="2" stroke-linecap="round"/></svg>`,
 s: `<svg viewBox="0 0 36 36"><path d="M18 4L6 9v9c0 8.5 5.1 15.8 12 18 6.9-2.2 12-9.5 12-18V9L18 4z" fill="#38bdf8" stroke="#e0f2fe" stroke-width="1.8"/><path d="M18 8v21" stroke="#fff" stroke-width="1.5" opacity=".6"/></svg>`,
 v: `<svg viewBox="0 0 36 36"><path d="M8 9h20l-4 14-6-6-6 6L8 9z" fill="#f43f5e" stroke="#ffe4e6" stroke-width="1.5"/><path d="M12 11l2 14 4-7M24 11l-2 14-4-7" fill="#fff"/></svg>`,
 f: `<svg viewBox="0 0 36 36"><path d="M19 3c2 6-3 9-1 14 3-2 4-6 4-6 5 4 7 10 3 16-3 5-11 6-15 1-4-5-2-12 3-17 0 4 3 5 3 5-2-5 0-10 3-13z" fill="#fb923c" stroke="#fef08a" stroke-width="1.4"/></svg>`,
 m: `<svg viewBox="0 0 36 36"><ellipse cx="18" cy="18" rx="11" ry="14" fill="#c084fc" stroke="#fae8ff" stroke-width="2"/><path d="M13 10l8 16M16 8l7 14" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>`,
 z: `<svg class="ic-bolt" viewBox="0 0 36 36"><path d="M21 3L8 20h9l-2 13 13-17h-9l2-13z" fill="#facc15" stroke="#fef9c3" stroke-width="1.5"/></svg>`,
 x: `<svg viewBox="0 0 36 36"><path d="M8 26C6 15 14 6 26 7c-7 4-11 10-12 20l-6-1z" fill="#e2e8f0" stroke="#fff" stroke-width="1.2"/><path d="M11 31L27 7" stroke="#f43f5e" stroke-width="3" stroke-linecap="round"/></svg>`,
 u: `<svg viewBox="0 0 36 36"><path class="ic-spin" d="M18 3l4 9 9-3-5 8 7 7-10 1-5 8-5-8-10-1 7-7-5-8 9 3 4-9z" fill="#ef4444" stroke="#fde047" stroke-width="1.6"/><circle class="ic-pulse" cx="18" cy="18" r="4.2" fill="#fef08a"/></svg>`,
 w: `<svg class="ic-swap" viewBox="0 0 36 36"><path d="M7 13h18l-4-4m4 4l-4 4M29 23H11l4-4m-4 4l4 4" fill="none" stroke="#c084fc" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`
};

// ===== ІКОНКИ: назва карти = малюнок на карті =====
SVG_IC.s = `<svg viewBox="0 0 36 36"><defs><radialGradient id="aeg" cx=".4" cy=".3" r=".9"><stop offset="0" stop-color="#7dd3fc"/><stop offset=".7" stop-color="#0369a1"/><stop offset="1" stop-color="#0c2a4a"/></radialGradient></defs><circle cx="18" cy="18" r="15.5" fill="url(#aeg)" stroke="#e0f2fe" stroke-width="1.8"/><circle class="ic-spin" cx="18" cy="18" r="12.4" fill="none" stroke="#bae6fd" stroke-width=".8" stroke-dasharray="2 1.6"/><g fill="none" stroke="#bae6fd" stroke-width="1.6" stroke-linecap="round"><path d="M12 12c-3-1-4-4-2-5M15 9.5c-1-3 1-5 3-4M21 9.5c1-3-1-5-3-4M24 12c3-1 4-4 2-5M10 16c-3 0-5-2-4-4M26 16c3 0 5-2 4-4"/></g><ellipse cx="18" cy="19.5" rx="6.2" ry="7" fill="#e0f2fe" stroke="#fff" stroke-width=".8"/><circle class="ic-pulse" cx="15.4" cy="18" r="1.6" fill="#0c2a4a"/><circle class="ic-pulse" cx="20.6" cy="18" r="1.6" fill="#0c2a4a"/><circle cx="15.8" cy="17.6" r=".5" fill="#fff"/><circle cx="21" cy="17.6" r=".5" fill="#fff"/><path d="M15 23c1.2 1 4.8 1 6 0" stroke="#0c2a4a" stroke-width="1.2" fill="none" stroke-linecap="round"/><path d="M16.5 23.4v1.6M19.5 23.4v1.6" stroke="#fff" stroke-width="1"/></svg>`;
SVG_IC.v = `<svg viewBox="0 0 36 36"><defs><linearGradient id="skB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#27272a"/><stop offset=".5" stop-color="#18181b"/><stop offset="1" stop-color="#09090b"/></linearGradient><linearGradient id="skT" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#991b1b"/><stop offset=".6" stop-color="#dc2626"/><stop offset="1" stop-color="#fca5a5"/></linearGradient><radialGradient id="skE" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff1f1"/><stop offset=".35" stop-color="#ef4444"/><stop offset="1" stop-color="#dc2626"/></radialGradient></defs><g style="filter:drop-shadow(0 0 1.4px #ef4444)"><path d="M12.4 27.6C5.6 28.4 2 22 3.2 12.6 5.6 18.6 8.8 21.2 13.4 22.8z" fill="url(#skT)" stroke="#7f1d1d" stroke-width=".5"/><path d="M23.6 27.6C30.4 28.4 34 22 32.8 12.6 30.4 18.6 27.2 21.2 22.6 22.8z" fill="url(#skT)" stroke="#7f1d1d" stroke-width=".5"/><path d="M4.6 15.2C4.4 18 5.6 20.4 7 22M31.4 15.2C31.6 18 30.4 20.4 29 22" fill="none" stroke="#fecaca" stroke-width=".5" opacity=".7" stroke-linecap="round"/></g><path d="M18 2.6C9.6 2.6 6.2 8.8 7 15.2 7.4 18.6 9 20.6 10.6 22.2V26.6Q10.6 28.2 12.2 28.2H23.8Q25.4 28.2 25.4 26.6V22.2C27 20.6 28.6 18.6 29 15.2 29.8 8.8 26.4 2.6 18 2.6z" fill="url(#skB)" stroke="#3f3f46" stroke-width=".8"/><path d="M12 6.4Q18 4 24 6.4" fill="none" stroke="#52525b" stroke-width=".7" opacity=".6" stroke-linecap="round"/><ellipse cx="13" cy="16" rx="3.6" ry="4" fill="#09090b"/><ellipse cx="23" cy="16" rx="3.6" ry="4" fill="#09090b"/><g class="ic-pulse" style="filter:drop-shadow(0 0 1.6px #dc2626)"><ellipse cx="13" cy="16.4" rx="2.3" ry="2.7" fill="url(#skE)"/><ellipse cx="23" cy="16.4" rx="2.3" ry="2.7" fill="url(#skE)"/></g><path d="M18 19.4L16.2 23.4H19.8z" fill="#000"/><path d="M13.8 24.8V28M16.6 24.8V28.2M19.4 24.8V28.2M22.2 24.8V28" stroke="#3f3f46" stroke-width=".9" stroke-linecap="round"/></svg>`;
SVG_IC.f = `<svg viewBox="0 0 36 36"><path d="M3 21h26c0 3-2 5-6 5h-2l2 3v4H12v-4l2-3h-3c-4 0-8-1-8-5z" fill="#64748b" stroke="#e2e8f0" stroke-width="1.2" stroke-linejoin="round"/><rect class="ic-pulse" x="8" y="18" width="17" height="3.2" rx="1.2" fill="#fb923c" stroke="#fde047" stroke-width=".6"/><g transform="rotate(-38 25 11)"><rect x="23.4" y="7" width="3.2" height="17" rx="1.2" fill="#8b5a2b" stroke="#451a03" stroke-width=".6"/><rect x="16" y="2" width="18" height="7.5" rx="1.6" fill="#475569" stroke="#e2e8f0" stroke-width="1"/><rect x="16" y="2" width="18" height="2.6" fill="#94a3b8"/></g><g class="ic-spark" stroke="#fde047" stroke-width="1.6" stroke-linecap="round"><path d="M11 15l-3-4M16 14v-5M5 16l-3-2"/></g><circle class="ic-spark s2" cx="14" cy="17" r="1.4" fill="#fff"/></svg>`;
SVG_IC.m = `<svg viewBox="0 0 36 36"><defs><linearGradient id="wpShine" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fff" stop-opacity="0"/><stop offset="45%" stop-color="#fff" stop-opacity="0.85"/><stop offset="55%" stop-color="#e0f2fe" stop-opacity="0.95"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><defs><radialGradient id="prs" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#fdf4ff"/><stop offset=".45" stop-color="#d8b4fe"/><stop offset="1" stop-color="#6b21a8"/></radialGradient><clipPath id="prsClip"><circle cx="18" cy="18" r="12"/></clipPath></defs><circle cx="18" cy="18" r="15.5" fill="#581c87" stroke="#fae8ff" stroke-width="1.8"/><circle cx="18" cy="18" r="12" fill="url(#prs)" stroke="#f5d0fe" stroke-width="1"/><g clip-path="url(#prsClip)"><rect class="ic-glint" x="-6" y="-6" width="14" height="48" transform="rotate(28 18 18)" fill="url(#wpShine)"/></g><path d="M9 25L23 8" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".75"/><path d="M13 28L27 12" stroke="#fff" stroke-width="1.3" stroke-linecap="round" opacity=".6"/><g class="ic-spin" fill="none" stroke="#6b21a8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M24 26a8 8 0 0 0 3-8"/><path d="M26.2 21L27 17.6 23.8 18.4"/></g><circle cx="18" cy="18" r="2.2" fill="#581c87" stroke="#fae8ff" stroke-width=".8"/></svg>`;
SVG_IC.x = `<svg viewBox="0 0 36 36"><defs><linearGradient id="wpShine" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fff" stop-opacity="0"/><stop offset="45%" stop-color="#fff" stop-opacity="0.85"/><stop offset="55%" stop-color="#e0f2fe" stop-opacity="0.95"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><defs><clipPath id="scClip"><path d="M25 7C14 2 5 8 3 18c7-5 14-6 22-5z"/></clipPath></defs><path d="M6 34L24 9" stroke="#2b1708" stroke-width="5" stroke-linecap="round"/><path d="M6 34L24 9" stroke="#92400e" stroke-width="3" stroke-linecap="round"/><path d="M25 7C14 2 5 8 3 18c7-5 14-6 22-5z" fill="#e2e8f0" stroke="#fff" stroke-width="1.1" stroke-linejoin="round"/><g clip-path="url(#scClip)"><rect class="ic-glint" x="-6" y="-6" width="14" height="48" transform="rotate(28 18 18)" fill="url(#wpShine)"/></g><path class="ic-pulse" d="M24 12C16 11 9 12 4.5 16.5" stroke="#f43f5e" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M25 7C15 3.6 8 7 5 12" stroke="#94a3b8" stroke-width=".9" fill="none"/><circle cx="25" cy="10" r="2.2" fill="#fbbf24" stroke="#92400e" stroke-width=".7"/><g class="ic-spark" fill="#e2e8f0" opacity=".75"><circle cx="31" cy="21" r="1.2"/><circle cx="28" cy="27" r=".9"/><circle cx="32" cy="29" r=".7"/></g></svg>`;
SVG_IC.i = `<svg viewBox="0 0 36 36"><defs><linearGradient id="icS" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f0f9ff"/><stop offset=".45" stop-color="#7dd3fc"/><stop offset="1" stop-color="#0369a1"/></linearGradient></defs><path d="M18 2L5 7.5V18c0 8.5 5.6 14.2 13 17 7.4-2.8 13-8.5 13-17V7.5z" fill="url(#icS)" stroke="#f0f9ff" stroke-width="1.6" stroke-linejoin="round"/><path d="M18 2L5 7.5V18c0 3 .6 5.6 1.7 7.8L18 18z" fill="#ffffff55"/><g class="ic-spin" stroke="#fff" stroke-width="1.7" stroke-linecap="round" fill="none"><path d="M18 9v18M10.2 13.5l15.6 9M25.8 13.5l-15.6 9"/><path d="M16 10.5l2 1.8 2-1.8M16 25.5l2-1.8 2 1.8M10.5 16.4l2.7.2-.7-2.6M25.5 19.6l-2.7-.2.7 2.6M10.5 19.6l2.7-.2-.7 2.6M25.5 16.4l-2.7.2.7-2.6"/></g><circle cx="18" cy="18" r="2" fill="#fff"/></svg>`;
SVG_IC.r = `<svg class="ic-float" viewBox="0 0 36 36"><path d="M18 2C13 11 6.5 16 6.5 23a11.5 11.5 0 0 0 23 0C29.5 16 23 11 18 2z" fill="#b91c1c" stroke="#fecaca" stroke-width="1.5" stroke-linejoin="round"/><path d="M18 2C23 11 29.5 16 29.5 23a11.5 11.5 0 0 1-11.5 11.5z" fill="#dc2626"/><path class="ic-pulse" d="M18 2L12 15l6 6 6-6z" fill="#f87171" opacity=".9"/><path d="M12 15l-5.2 6.5M24 15l5.2 6.5M12 15L18 34.5M24 15L18 34.5M12 15h12" stroke="#fecaca" stroke-width=".9" opacity=".65" fill="none"/><ellipse cx="12.5" cy="24" rx="2" ry="3.4" transform="rotate(18 12.5 24)" fill="#fff" opacity=".55"/></svg>`;

// Сковорода: чавун, клепаний держак, блиск, яєчня і пара
const panSvg = (egg) => `<svg viewBox="0 0 36 36"><defs><radialGradient id="pnB" cx=".38" cy=".32" r=".85"><stop offset="0" stop-color="#7b8798"/><stop offset=".55" stop-color="#27303d"/><stop offset="1" stop-color="#0b0f17"/></radialGradient><linearGradient id="pnH" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c98a4a"/><stop offset="1" stop-color="#5b3416"/></linearGradient></defs><path d="M21 21L33.5 8.5" stroke="#1a1208" stroke-width="6.4" stroke-linecap="round"/><path d="M21 21L33.5 8.5" stroke="url(#pnH)" stroke-width="4.6" stroke-linecap="round"/><path d="M20.5 21.5l4.2-4.2" stroke="#94a3b8" stroke-width="5.6" stroke-linecap="round"/><circle cx="26.4" cy="15.6" r=".9" fill="#fde68a"/><circle cx="29.6" cy="12.4" r=".9" fill="#fde68a"/><circle cx="14" cy="22" r="12.4" fill="url(#pnB)" stroke="#e2e8f0" stroke-width="2.2"/><circle cx="14" cy="22" r="9.4" fill="#0e131b" stroke="#475569" stroke-width=".9"/><circle class="pn-heat" cx="14" cy="22" r="8" fill="none" stroke="#fb923c" stroke-width="1.2" opacity=".6"/>${egg ? `<path d="M8.6 22.4c-.8-3.8 2.8-6 6-5 3.8-.8 6.2 2.6 4.2 5.8-1 3-5 4.2-8 3-1.2-.7-2-2-2.2-3.8z" fill="#fffbe6"/><circle cx="14.2" cy="21.6" r="2.9" fill="#fbbf24" stroke="#f59e0b" stroke-width=".5"/><circle cx="13.2" cy="20.6" r="1" fill="#fff" opacity=".9"/>` : ``}<path class="pn-sh" d="M4.6 17.4A10.4 10.4 0 0 1 12 11.6" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".7"/>${egg ? `<g fill="none" stroke="#e2e8f0" stroke-width="1.4" stroke-linecap="round"><path class="pn-st" d="M9 9c-2-2 2-3 0-5"/><path class="pn-st s2" d="M14 8c-2-2 2-3 0-5"/><path class="pn-st s3" d="M19 9c-2-2 2-3 0-5"/></g>` : ``}</svg>`;
SVG_IC.k = panSvg(true);
const PAN_SVG = panSvg(false);

// Барабан: червоний корпус, шнурівка, обручі, паличка-пара
const drumSvg = (sticks) => `<svg viewBox="0 0 36 36"><defs><linearGradient id="drB" x1="0" x2="1"><stop offset="0" stop-color="#7f1d1d"/><stop offset=".45" stop-color="#f05252"/><stop offset="1" stop-color="#6b1212"/></linearGradient><radialGradient id="drH" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#fffdf5"/><stop offset="1" stop-color="#f3e2b8"/></radialGradient><linearGradient id="drS" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff7d6"/><stop offset="1" stop-color="#d9a441"/></linearGradient></defs><path d="M4.5 16v11c0 3.2 6 5.2 13.5 5.2S31.5 30.2 31.5 27V16z" fill="url(#drB)" stroke="#fecaca" stroke-width="1.2"/><path d="M4.5 27c0 3.2 6 5.2 13.5 5.2S31.5 30.2 31.5 27" stroke="#cbd5e1" stroke-width="2.2" fill="none"/><path d="M6 17.6l4.2 12.6 4.2-12 4.2 12.6 4.2-12 4.2 12.6 3-9.6" stroke="#fde68a" stroke-width="1.3" fill="none" stroke-linejoin="round"/><g fill="#e2e8f0"><circle cx="6" cy="17.4" r="1"/><circle cx="12" cy="17.8" r="1"/><circle cx="18" cy="18" r="1"/><circle cx="24" cy="17.8" r="1"/><circle cx="30" cy="17.4" r="1"/></g><ellipse cx="18" cy="16" rx="14" ry="5.4" fill="url(#drH)" stroke="#cbd5e1" stroke-width="2.2"/><ellipse class="dr-hd" cx="18" cy="16" rx="10.4" ry="3.4" fill="none" stroke="#f3d99a" stroke-width=".9"/><ellipse class="dr-rp" cx="18" cy="16" rx="8" ry="2.6" fill="none" stroke="#ef4444" stroke-width="1.4"/>${sticks ? `<g class="dr-sl"><path d="M7 2.5l11 11.5" stroke="#6b4a1e" stroke-width="3.4" stroke-linecap="round"/><path d="M7 2.5l11 11.5" stroke="url(#drS)" stroke-width="2.2" stroke-linecap="round"/><circle cx="18.6" cy="14.4" r="2.1" fill="#fff7d6" stroke="#d9a441" stroke-width=".6"/></g><g class="dr-sr"><path d="M29 2.5L18 14" stroke="#6b4a1e" stroke-width="3.4" stroke-linecap="round"/><path d="M29 2.5L18 14" stroke="url(#drS)" stroke-width="2.2" stroke-linecap="round"/><circle cx="17.4" cy="14.4" r="2.1" fill="#fff7d6" stroke="#d9a441" stroke-width=".6"/></g>` : ``}</svg>`;
SVG_IC.b = drumSvg(true);
const DRUM_SVG = drumSvg(false);

// 20 унікальних малюнків: [шкода, здоров'я, отрута, відновлення] × 5 рідкостей
const ART = {
 d: [
 /* Кремінь */ `<svg viewBox="0 0 36 36"><path d="M5 25 9 12l9-8 11 4 5 12-7 10H12z" fill="#64748b" stroke="#e2e8f0" stroke-width="1.4" stroke-linejoin="round"/><path d="M9 12l9-8v13z" fill="#94a3b8"/><path d="M18 4l11 4-11 9z" fill="#cbd5e1"/><path d="M5 25l13-8-6 13z" fill="#475569"/><path d="M18 17l-6 13M18 17l11 3" stroke="#e2e8f0" stroke-width="1" opacity=".7" fill="none"/><g class="ic-spark" stroke="#fde047" stroke-width="1.8" stroke-linecap="round"><path d="M29 2.5l2 3M33.5 8l-3 1M25.5 1l.5 3.5"/></g><circle class="ic-spark s2" cx="31" cy="5.5" r="1.4" fill="#fff"/></svg>`,
 /* Кинджал */ `<svg viewBox="0 0 36 36"><defs><linearGradient id="wpShine" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fff" stop-opacity="0"/><stop offset="45%" stop-color="#fff" stop-opacity="0.85"/><stop offset="55%" stop-color="#e0f2fe" stop-opacity="0.95"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><defs><linearGradient id="dgb" x1="0" x2="1"><stop offset="0" stop-color="#f8fafc"/><stop offset=".5" stop-color="#cbd5e1"/><stop offset="1" stop-color="#64748b"/></linearGradient><clipPath id="dgClip"><path d="M18 1.5l4.5 6.5-1.3 13h-6.4L13.5 8z"/></clipPath></defs><g transform="rotate(32 18 18)"><path d="M18 1.5l4.5 6.5-1.3 13h-6.4L13.5 8z" fill="url(#dgb)" stroke="#fff" stroke-width=".9" stroke-linejoin="round"/><g clip-path="url(#dgClip)"><rect class="ic-glint" x="-6" y="-6" width="14" height="48" transform="rotate(28 18 18)" fill="url(#wpShine)"/></g><path d="M18 3v18" stroke="#64748b" stroke-width=".9"/><path d="M9 21.5q9 3 18 0l-1 3q-8 2-16 0z" fill="#fbbf24" stroke="#92400e" stroke-width=".8"/><rect x="16" y="24.5" width="4" height="7" rx="1.3" fill="#7f1d1d" stroke="#450a0a" stroke-width=".6"/><path d="M16 27h4M16 29.2h4" stroke="#fca5a5" stroke-width=".7"/><circle cx="18" cy="33.3" r="2.1" fill="#fbbf24" stroke="#92400e" stroke-width=".7"/><circle class="ic-pulse" cx="18" cy="23" r="1.2" fill="#ef4444"/></g></svg>`,
 /* Тризуб */ `<svg viewBox="0 0 36 36"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M8 7v7q0 7 10 7t10-7V7M18 7v27" stroke="#78350f" stroke-width="5"/><path d="M8 7v7q0 7 10 7t10-7V7M18 7v27" stroke="#fbbf24" stroke-width="2.8"/><path d="M18 9v23" stroke="#fef3c7" stroke-width=".9" opacity=".8"/></g><g class="ic-pulse" fill="#fbbf24" stroke="#fff7d6" stroke-width="1" stroke-linejoin="round"><path d="M18 .8l3.8 6.4h-7.6z"/><path d="M8 .8l3.8 6.4H4.2z"/><path d="M28 .8l3.8 6.4h-7.6z"/></g><rect class="ic-spark" x="15" y="23.3" width="6" height="2.4" rx="1" fill="#38bdf8" stroke="#e0f7ff" stroke-width=".6"/></svg>`,
 /* Серп Ареса */ `<svg viewBox="0 0 36 36"><defs><linearGradient id="wpShine" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fff" stop-opacity="0"/><stop offset="45%" stop-color="#fff" stop-opacity="0.85"/><stop offset="55%" stop-color="#e0f2fe" stop-opacity="0.95"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><defs><linearGradient id="srp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fecaca"/><stop offset=".5" stop-color="#ef4444"/><stop offset="1" stop-color="#7f1d1d"/></linearGradient><clipPath id="srClip"><path d="M13.5 21C7 11 14 2 27 3.5c4 .4 6.5 2.5 6.5 2.5C24 6.4 20 12 20.5 21z"/></clipPath></defs><path d="M6 33L16 19" stroke="#451a03" stroke-width="5.4" stroke-linecap="round"/><path d="M6 33L16 19" stroke="#92400e" stroke-width="3.4" stroke-linecap="round"/><path d="M8 30l3-1.2M11 26l3-1.2" stroke="#fcd34d" stroke-width=".9"/><path d="M13.5 21C7 11 14 2 27 3.5c4 .4 6.5 2.5 6.5 2.5C24 6.4 20 12 20.5 21z" fill="url(#srp)" stroke="#fff1f2" stroke-width="1.1" stroke-linejoin="round"/><g clip-path="url(#srClip)"><rect class="ic-glint" x="-6" y="-6" width="14" height="48" transform="rotate(28 18 18)" fill="url(#wpShine)"/></g><path d="M33 6C24 7 21 12 21.3 19" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".9"/><rect x="12.5" y="19.3" width="9" height="3.2" rx="1" transform="rotate(-38 17 21)" fill="#fbbf24" stroke="#92400e" stroke-width=".7"/></svg>`,
 /* Меч Титана */ SVG_IC.d
 ],
 h: [
 /* Оливка */ `<svg class="ic-sway" viewBox="0 0 36 36"><path d="M3 32C12 26 22 17 32 5" stroke="#6b4423" stroke-width="2.2" fill="none" stroke-linecap="round"/><g fill="#86efac" stroke="#14532d" stroke-width=".8" stroke-linejoin="round"><path d="M7 28c-2-6 1-10 6-11 1.4 5-1 9-6 11z"/><path d="M13 22c0-6 4-9.4 10-8.4-1 6-5 9.4-10 8.4z"/><path d="M20 15.5c-1-5 2-9 7.4-9 1 5-2.4 8.4-7.4 9z"/><path d="M11 25c3 4.4 8.6 4.4 12 0-4-1.2-8.4-1.2-12 0z"/></g><ellipse cx="22.6" cy="26.2" rx="3.8" ry="5.2" transform="rotate(-18 22.6 26.2)" fill="#3f6212" stroke="#d9f99d" stroke-width="1"/><ellipse cx="29.4" cy="18.6" rx="3.2" ry="4.4" transform="rotate(-18 29.4 18.6)" fill="#4d7c0f" stroke="#d9f99d" stroke-width="1"/><ellipse cx="21.4" cy="24.4" rx=".9" ry="1.7" fill="#fff" opacity=".6"/><ellipse cx="28.4" cy="17" rx=".8" ry="1.5" fill="#fff" opacity=".6"/></svg>`,
 /* Амфора */ `<svg viewBox="0 0 36 36"><defs><linearGradient id="amf" x1="0" x2="1"><stop offset="0" stop-color="#9a3412"/><stop offset=".45" stop-color="#fb923c"/><stop offset="1" stop-color="#7c2d12"/></linearGradient></defs><path d="M12.5 7C5 8 4 17 10.5 19.5M23.5 7C31 8 32 17 25.5 19.5" fill="none" stroke="#c2410c" stroke-width="2.4" stroke-linecap="round"/><path d="M13 3h10l-.6 3.4c.2 2.4 3.6 4.4 3.6 10.6 0 7.4-3.6 12-8 12s-8-4.6-8-12c0-6.2 3.4-8.2 3.6-10.6z" fill="url(#amf)" stroke="#fed7aa" stroke-width="1.3" stroke-linejoin="round"/><rect x="12" y="2" width="12" height="2.8" rx="1.2" fill="#c2410c" stroke="#fed7aa" stroke-width=".8"/><path d="M10.4 15h15.2M10.2 21.5h15.6" stroke="#1c0a02" stroke-width="1.6"/><path d="M11 18.2h2v-1h2v1h2v-1h2v1h2v-1h2v1h2" stroke="#1c0a02" stroke-width=".9" fill="none"/><path d="M14.5 28.4h7l.6 4H13.9z" fill="#9a3412" stroke="#fed7aa" stroke-width=".9" stroke-linejoin="round"/><path class="ic-pulse" d="M14 9c-1.4 3-1.2 11 .6 16" stroke="#fff" stroke-width="1.4" opacity=".6" fill="none" stroke-linecap="round"/></svg>`,
 /* Амброзія */ `<svg viewBox="0 0 36 36"><defs><linearGradient id="amb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fde68a"/><stop offset="1" stop-color="#b45309"/></linearGradient><radialGradient id="ambg" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fef3c7"/><stop offset="1" stop-color="#f59e0b" stop-opacity="0"/></radialGradient></defs><circle class="ic-pulse" cx="18" cy="13" r="12" fill="url(#ambg)" opacity=".8"/><circle cx="12.6" cy="14.6" r="4.6" fill="#fbbf24" stroke="#fffbeb" stroke-width="1"/><circle cx="23.4" cy="14.6" r="4.6" fill="#f59e0b" stroke="#fffbeb" stroke-width="1"/><circle cx="18" cy="10.4" r="5" fill="#fde68a" stroke="#fffbeb" stroke-width="1"/><path d="M18 5.5c.2-2 1.4-2.8 3-3" stroke="#4d7c0f" stroke-width="1.4" fill="none" stroke-linecap="round"/><path d="M6 17h24c0 6-4.6 10-12 10S6 23 6 17z" fill="url(#amb)" stroke="#fffbeb" stroke-width="1.4" stroke-linejoin="round"/><path d="M8.4 19.6h19.2" stroke="#fff7d6" stroke-width=".9" opacity=".7"/><path d="M16 27h4v4h-4z" fill="#d97706" stroke="#fffbeb" stroke-width=".8"/><path d="M11 31.4h14c0 1.4-3 2.2-7 2.2s-7-.8-7-2.2z" fill="#b45309" stroke="#fffbeb" stroke-width=".8"/><g fill="#fff"><path class="ic-spark" d="M30 6l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8z"/><path class="ic-spark s2" d="M5.5 5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z"/></g></svg>`,
 /* Нектар */ `<svg viewBox="0 0 36 36"><defs><linearGradient id="nct" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbbf24"/><stop offset="1" stop-color="#ec4899"/></linearGradient></defs><path d="M8 6h20c0 9-3.4 14.6-10 14.6S8 15 8 6z" fill="#e0f2fe" fill-opacity=".25" stroke="#f0f9ff" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 10h18c-.6 6-3.6 9.2-9 9.2S9.6 16 9 10z" fill="url(#nct)"/><path class="ic-wave" d="M9 10c3-1.4 6 1.2 9 0s6-1.4 9 0" stroke="#fff" stroke-width="1" fill="none" opacity=".7"/><path d="M16.6 20.4h2.8v8h-2.8z" fill="#fde68a" stroke="#b45309" stroke-width=".8"/><path d="M11 33c0-3 3-4.6 7-4.6s7 1.6 7 4.6z" fill="#fbbf24" stroke="#b45309" stroke-width=".9" stroke-linejoin="round"/><path d="M11.5 8.4c0 4 1 7 2.4 8" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".55" fill="none"/><path class="ic-drip" d="M31.5 1.6c1.8 2.8 2.8 4 2.8 5.6a2.8 2.8 0 0 1-5.6 0c0-1.6 1-2.8 2.8-5.6z" fill="#fbbf24" stroke="#fff7d6" stroke-width=".8"/></svg>`,
 /* Золоте руно */ `<svg viewBox="0 0 36 36"><defs><radialGradient id="fln" cx=".4" cy=".3" r=".9"><stop offset="0" stop-color="#fff3b0"/><stop offset=".6" stop-color="#f5b82e"/><stop offset="1" stop-color="#b45309"/></radialGradient></defs><path d="M6 6h24" stroke="#78350f" stroke-width="2.4" stroke-linecap="round"/><path class="ic-sway-top" d="M9 7c-1.4 4 0 7-2.4 9.6-2 2.4-.6 5.4 1.6 6.4-.6 3.2 2 5 4.6 4.4 1.4 2.8 5.2 3.4 7.4 1 2.4 1.8 6 .8 6.4-2.4 3 0 4.6-3 3.2-5.4 2.2-1.6 2-4.8-.2-6C29.2 14 28.4 10 27 7z" fill="url(#fln)" stroke="#fff7d6" stroke-width="1.2" stroke-linejoin="round"/><g fill="none" stroke="#b45309" stroke-width="1.1" stroke-linecap="round" opacity=".8"><path d="M12 13c1.4-1.6 3.4-.8 3 1"/><path d="M19 12c1.4-1.6 3.4-.8 3 1"/><path d="M14 20c1.4-1.6 3.4-.8 3 1"/><path d="M22 19c1.4-1.6 3.4-.8 3 1"/><path d="M17 26c1.4-1.6 3.4-.8 3 1"/></g><g fill="#fff"><path class="ic-spark" d="M30 12l.7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7z"/><path class="ic-spark s2" d="M6 20l.6 1.3 1.3.6-1.3.6-.6 1.3-.6-1.3-1.3-.6 1.3-.6z"/></g></svg>`
 ],
 p: [
 /* Цикута */ `<svg viewBox="0 0 36 36"><path d="M18 35V15" stroke="#4d7c0f" stroke-width="2.2" stroke-linecap="round"/><path d="M18 15L7 9M18 15L12 5.5M18 15V4M18 15l6-9.5M18 15l11-6" stroke="#65a30d" stroke-width="1.5" fill="none" stroke-linecap="round"/><g fill="#f7fee7" stroke="#bef264" stroke-width=".7"><circle cx="7" cy="9" r="2.6"/><circle cx="12" cy="5.5" r="2.6"/><circle cx="18" cy="4" r="2.8"/><circle cx="24" cy="5.5" r="2.6"/><circle cx="29" cy="9" r="2.6"/></g><g fill="#a3e635"><circle cx="7" cy="9" r=".9"/><circle cx="12" cy="5.5" r=".9"/><circle cx="18" cy="4" r=".9"/><circle cx="24" cy="5.5" r=".9"/><circle cx="29" cy="9" r=".9"/></g><path d="M18 27c-5-1-9 1-10 5 5 1 9-1 10-5zM18 24c5-1 9 1 10 5-5 1-9-1-10-5z" fill="#84cc16" stroke="#365314" stroke-width=".8" stroke-linejoin="round"/><g fill="#a855f7"><circle class="ic-pulse" cx="17.2" cy="20" r="1.2"/><circle class="ic-pulse" cx="18.9" cy="23" r="1.2"/><circle class="ic-pulse" cx="17.4" cy="30" r="1.2"/></g></svg>`,
 /* Жовч */ `<svg viewBox="0 0 36 36"><defs><linearGradient id="jvc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bef264"/><stop offset="1" stop-color="#3f6212"/></linearGradient></defs><path d="M14.4 3h7.2v6L28 24.4a8.4 8.4 0 0 1-7.8 11.2h-4.4A8.4 8.4 0 0 1 8 24.4L14.4 9z" fill="#ecfccb" fill-opacity=".2" stroke="#ecfccb" stroke-width="1.5" stroke-linejoin="round"/><path d="M10.4 22.6c3-1.8 5 1.4 7.6 0s4.4-1.8 7.6 0a6.6 6.6 0 0 1-6 11.2h-3.2a6.6 6.6 0 0 1-6-11.2z" fill="url(#jvc)"/><rect x="13.6" y="1" width="8.8" height="4" rx="1.4" fill="#92400e" stroke="#fde68a" stroke-width=".8"/><circle class="ic-bub" cx="15.5" cy="28" r="1.6" fill="#ecfccb" opacity=".85"/><circle class="ic-bub b2" cx="20.5" cy="26.2" r="1.1" fill="#ecfccb" opacity=".85"/><circle class="ic-bub b3" cx="19" cy="31" r="1.3" fill="#ecfccb" opacity=".85"/><path d="M12.4 24c-1.4 2-1.8 4.2-1.2 6" stroke="#fff" stroke-width="1.3" stroke-linecap="round" opacity=".5" fill="none"/><path class="ic-drip" d="M31 4c1.8 2.6 2.6 3.6 2.6 5a2.6 2.6 0 0 1-5.2 0c0-1.4.8-2.4 2.6-5z" fill="#a3e635" stroke="#ecfccb" stroke-width=".8"/></svg>`,
 /* Жало Гідри */ `<svg viewBox="0 0 36 36"><defs><linearGradient id="zhl" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#365314"/><stop offset=".6" stop-color="#84cc16"/><stop offset="1" stop-color="#ecfccb"/></linearGradient></defs><path d="M6 34C3 20 11 9 28 2.5c-6 8-8 17-6.6 31.5z" fill="url(#zhl)" stroke="#d9f99d" stroke-width="1.3" stroke-linejoin="round"/><path d="M9 29c.5-7 5-14 14-19.5" stroke="#fff" stroke-width="1.3" fill="none" stroke-linecap="round" opacity=".6"/><path d="M13 22l-4-1.4M12 27l-4.2-.6" stroke="#1a2e05" stroke-width="1.2" stroke-linecap="round"/><path d="M28.5 2.5l3.2 3.8" stroke="#ecfccb" stroke-width="1.6" stroke-linecap="round"/><path class="ic-drip" d="M30 9c1.4 2 2 2.8 2 3.8a2 2 0 0 1-4 0c0-1 .6-1.8 2-3.8z" fill="#a3e635" stroke="#f7fee7" stroke-width=".6"/><path class="ic-bub b2" d="M33 17c1 1.4 1.4 2 1.4 2.8a1.4 1.4 0 0 1-2.8 0c0-.8.4-1.4 1.4-2.8z" fill="#a3e635" stroke="#f7fee7" stroke-width=".6"/></svg>`,
 /* Кров Ехідни */ `<svg viewBox="0 0 36 36"><defs><linearGradient id="ehd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f87171"/><stop offset="1" stop-color="#7f1d1d"/></linearGradient></defs><path d="M18 2C12.6 11 6.6 16 6.6 23a11.4 11.4 0 0 0 22.8 0C29.4 16 23.4 11 18 2z" fill="url(#ehd)" stroke="#fecaca" stroke-width="1.4" stroke-linejoin="round"/><g class="ic-sway"><path d="M9.6 28c5 4 12 2.4 12.4-2.6.4-5-9.4-4-9-9.6.2-2.4 3-3.6 5-2.8" fill="none" stroke="#1a2e05" stroke-width="4.2" stroke-linecap="round"/><path d="M9.6 28c5 4 12 2.4 12.4-2.6.4-5-9.4-4-9-9.6.2-2.4 3-3.6 5-2.8" fill="none" stroke="#a3e635" stroke-width="2.6" stroke-linecap="round"/><path d="M11 25.6l1.4 1M15 28l.6-1.4M20.4 26.8l-.2-1.6" stroke="#365314" stroke-width="1" stroke-linecap="round"/><ellipse cx="18.2" cy="11.8" rx="3.2" ry="2.5" transform="rotate(-25 18.2 11.8)" fill="#bef264" stroke="#1a2e05" stroke-width=".8"/><circle cx="19" cy="11" r=".9" fill="#1a2e05"/><path d="M20.6 12.8l3 1.6M23.6 14.4l.8-1.2M23.6 14.4l.4 1.4" stroke="#fecaca" stroke-width=".9" fill="none" stroke-linecap="round"/></g></svg>`,
 /* Гідра Лерни */ `<svg viewBox="0 0 36 36"><g class="ic-sway"><g fill="none" stroke-linecap="round"><path d="M18 33C16 24 7 22 7.6 11.5M18 33V13M18 33C20 24 29 22 28.4 11.5" stroke="#14290a" stroke-width="6"/><path d="M18 33C16 24 7 22 7.6 11.5M18 33V13M18 33C20 24 29 22 28.4 11.5" stroke="#65a30d" stroke-width="3.6"/><path d="M18 31C17 25 9 23.6 8.6 13M18 31V15M18 31C19 25 27 23.6 27.4 13" stroke="#bef264" stroke-width=".9" opacity=".7"/></g><g stroke="#d9f99d" stroke-width="1" stroke-linejoin="round"><path d="M7.6 11.5c-3-1-4.4-4-2.4-6.2 2.4-2.4 6.6-1.4 7.2 1.6.6 2.6-1.6 4.8-4.8 4.6z" fill="#4d7c0f"/><path d="M18 13c-3.4 0-5-3-3.6-5.6 1.6-2.6 6-2.6 7.2 0 1.2 2.6-.2 5.6-3.6 5.6z" fill="#5c9412"/><path d="M28.4 11.5c3-1 4.4-4 2.4-6.2-2.4-2.4-6.6-1.4-7.2 1.6-.6 2.6 1.6 4.8 4.8 4.6z" fill="#4d7c0f"/></g><g class="ic-pulse" fill="#fde047"><circle cx="6.2" cy="6" r="1"/><circle cx="16.6" cy="7.6" r="1"/><circle cx="19.6" cy="7.6" r="1"/><circle cx="29.8" cy="6" r="1"/></g><g stroke="#fff" stroke-width=".9" stroke-linecap="round"><path d="M4.4 8.4l-1.4 1.6M32 8.4l1.4 1.6M17 12l-.6 1.6M19 12l.6 1.6"/></g></g><ellipse cx="18" cy="33" rx="8" ry="2.6" fill="#365314" stroke="#bef264" stroke-width=".8"/></svg>`
 ],
 g: [
 /* Мирт */ `<svg class="ic-sway" viewBox="0 0 36 36"><path d="M5 33C12 26 21 18 31 5" stroke="#166534" stroke-width="2" fill="none" stroke-linecap="round"/><g fill="#4ade80" stroke="#14532d" stroke-width=".8" stroke-linejoin="round"><path d="M8.6 28.6c-3.6 0-6.4-2.6-6.4-6 4 0 6.6 2.4 6.4 6z"/><path d="M10.6 29.4c0 3.6 2.6 5.4 6 5-.2-3.8-2.6-5.4-6-5z"/><path d="M14 24.4c-3.4-1.2-5-4.6-3.6-7.6 3.6 1.2 5 4.2 3.6 7.6z"/><path d="M16.4 24c1.6 3.2 4.8 4 7.6 2.4-1.4-3.2-4.4-4.2-7.6-2.4z"/><path d="M21 18.6c-2.8-2.2-3-6-.8-8.4 2.8 2.2 3 5.6.8 8.4z"/><path d="M22.4 19c2.6 1 5.4-.2 6.6-3-3-1.4-5.6-.4-6.6 3z"/></g><g><circle cx="29" cy="7.4" r="2.2" fill="#fff" stroke="#e5e7eb" stroke-width=".5"/><circle cx="31.6" cy="9.8" r="2.2" fill="#fff" stroke="#e5e7eb" stroke-width=".5"/><circle cx="26.6" cy="9.8" r="2.2" fill="#fff" stroke="#e5e7eb" stroke-width=".5"/><circle cx="27.4" cy="5.4" r="2.2" fill="#fff" stroke="#e5e7eb" stroke-width=".5"/><circle cx="31" cy="5.2" r="2.2" fill="#fff" stroke="#e5e7eb" stroke-width=".5"/><circle class="ic-spark" cx="29.2" cy="7.6" r="1.4" fill="#facc15"/><circle cx="15.8" cy="19.6" r="1.4" fill="#fff"/><circle cx="15.8" cy="19.6" r=".6" fill="#facc15"/></g></svg>`,
 /* Лотос */ `<svg viewBox="0 0 36 36"><defs><linearGradient id="ltp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbcfe8"/><stop offset="1" stop-color="#db2777"/></linearGradient></defs><path d="M3 28c5-3 10-3 15 0 5-3 10-3 15 0-4 5-11 7-15 7S7 33 3 28z" fill="#15803d" stroke="#86efac" stroke-width="1"/><g class="ic-pulse"><path d="M3.4 17c6 .4 11 3.4 14.6 9.6-7 2-13-1.4-14.6-9.6zM32.6 17c-6 .4-11 3.4-14.6 9.6 7 2 13-1.4 14.6-9.6z" fill="url(#ltp)" stroke="#fdf2f8" stroke-width="1" stroke-linejoin="round"/><path d="M9 8c6 1.8 9.4 7.4 9 18.6-8-1.8-12-8.6-9-18.6zM27 8c-6 1.8-9.4 7.4-9 18.6 8-1.8 12-8.6 9-18.6z" fill="url(#ltp)" stroke="#fdf2f8" stroke-width="1" stroke-linejoin="round"/><path d="M18 2c5.2 6 6.6 14 0 24.6C11.4 16 12.8 8 18 2z" fill="#f9a8d4" stroke="#fff" stroke-width="1.1" stroke-linejoin="round"/></g><path d="M18 6c-1.6 6-1.6 12 0 18" stroke="#fff" stroke-width=".9" opacity=".7" fill="none"/><circle class="ic-spark" cx="18" cy="24" r="1.8" fill="#fde047"/></svg>`,
 /* Дар Гігеї */ `<svg viewBox="0 0 36 36"><defs><linearGradient id="hgb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d1fae5"/><stop offset="1" stop-color="#059669"/></linearGradient></defs><path d="M6 15h24c0 6.6-4.6 10.6-12 10.6S6 21.6 6 15z" fill="url(#hgb)" stroke="#ecfdf5" stroke-width="1.4" stroke-linejoin="round"/><ellipse cx="18" cy="15" rx="12" ry="2.6" fill="#065f46" stroke="#ecfdf5" stroke-width="1.2"/><path d="M16.4 25.6h3.2v5h-3.2z" fill="#6ee7b7" stroke="#065f46" stroke-width=".8"/><path d="M10 31.6h16c0 1.4-3.4 2.4-8 2.4s-8-1-8-2.4z" fill="#10b981" stroke="#ecfdf5" stroke-width=".9"/><path d="M26.6 31c-9 .4-9-4.6-3.4-5.4 5.8-.8 4.2-5.6-1.6-6.4" fill="none" stroke="#1a2e05" stroke-width="4.2" stroke-linecap="round"/><path d="M26.6 31c-9 .4-9-4.6-3.4-5.4 5.8-.8 4.2-5.6-1.6-6.4" fill="none" stroke="#a3e635" stroke-width="2.6" stroke-linecap="round"/><ellipse cx="20" cy="11.2" rx="3.4" ry="2.6" transform="rotate(-22 20 11.2)" fill="#bef264" stroke="#1a2e05" stroke-width=".8"/><circle class="ic-pulse" cx="20.9" cy="10.5" r=".9" fill="#1a2e05"/><path d="M22.8 12.2l3 1M25.8 13.2l.8-1.1M25.8 13.2l.3 1.4" stroke="#fb7185" stroke-width=".9" fill="none" stroke-linecap="round"/><g fill="#fff"><path class="ic-spark" d="M8 7l.7 1.6 1.6.7-1.6.7L8 11.6l-.7-1.6-1.6-.7 1.6-.7z"/></g></svg>`,
 /* Мед Богів */ `<svg viewBox="0 0 36 36"><defs><linearGradient id="mdb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fde68a"/><stop offset=".55" stop-color="#f59e0b"/><stop offset="1" stop-color="#92400e"/></linearGradient></defs><path d="M7 13h22v14.6c0 3-4.4 5-11 5s-11-2-11-5z" fill="url(#mdb)" stroke="#fef3c7" stroke-width="1.4" stroke-linejoin="round"/><path d="M5 9.4h26V14H5z" fill="#d97706" stroke="#fef3c7" stroke-width="1.2" stroke-linejoin="round"/><path class="ic-drip" d="M9 14v6.2a2 2 0 0 0 4 0V14M19 14v9.4a2 2 0 0 0 4 0V14" fill="#fbbf24" stroke="#fef3c7" stroke-width=".9"/><path d="M18 19.4l3.2 1.9v3.8L18 27l-3.2-1.9v-3.8z" fill="#fff7d6" fill-opacity=".85" stroke="#92400e" stroke-width=".8" stroke-linejoin="round"/><path d="M18 21.6l1.4.9v1.6l-1.4.9-1.4-.9v-1.6z" fill="#f59e0b"/><path d="M11 6.4c1.2-2 3.4-2.4 4.8-1.2" stroke="#fde68a" stroke-width="1.4" fill="none" stroke-linecap="round"/><g fill="#fff"><path class="ic-spark" d="M30 2l.8 1.8 1.8.8-1.8.8L30 7.2l-.8-1.8-1.8-.8 1.8-.8z"/></g></svg>`,
 /* Ікор богів */ `<svg viewBox="0 0 36 36"><defs><radialGradient id="ikh" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff7d6" stop-opacity=".95"/><stop offset="1" stop-color="#f59e0b" stop-opacity="0"/></radialGradient><linearGradient id="ikd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffbeb"/><stop offset=".4" stop-color="#fcd34d"/><stop offset="1" stop-color="#b45309"/></linearGradient></defs><circle class="ic-pulse" cx="18" cy="19" r="16" fill="url(#ikh)"/><circle class="ic-spin" cx="18" cy="19" r="14" fill="none" stroke="#fde68a" stroke-width=".9" stroke-dasharray="1.6 2.6" opacity=".9"/><path class="ic-float" d="M18 4.5C13.4 12 8.6 16.2 8.6 22a9.4 9.4 0 0 0 18.8 0c0-5.8-4.8-10-9.4-17.5z" fill="url(#ikd)" stroke="#fff7d6" stroke-width="1.4" stroke-linejoin="round"/><ellipse cx="13.4" cy="22.4" rx="1.9" ry="3.6" transform="rotate(18 13.4 22.4)" fill="#fff" opacity=".7"/><g fill="#fff"><path class="ic-spark" d="M30 6l.9 2 2 .9-2 .9L30 11.8l-.9-2-2-.9 2-.9z"/><path class="ic-spark s2" d="M5 9l.7 1.5 1.5.7-1.5.7L5 13.4l-.7-1.5-1.5-.7 1.5-.7z"/><path class="ic-spark s3" d="M29 27l.6 1.3 1.3.6-1.3.6-.6 1.3-.6-1.3-1.3-.6 1.3-.6z"/></g></svg>`
 ]
};
const iconFor = c => (ART[c.t] && ART[c.t][c.r]) || SVG_IC[BASE[c.t] || c.t];

SVG_IC.o = `<svg viewBox="0 0 36 36"><ellipse cx="18" cy="6" rx="15" ry="5" fill="#1e293b" opacity=".8"/><rect x="16" y="14" width="4" height="20" rx="2" fill="#78350f" stroke="#451a03"/><rect x="4" y="5" width="28" height="12" rx="2" fill="#334155" stroke="#fbbf24" stroke-width="1.8"/><path d="M8 8h20M8 14h20" stroke="#fbbf24" stroke-width=".8" stroke-dasharray="2 2"/><path d="M22 5l-7 6h6l-5 6" stroke="#7dd3fc" stroke-width="1.8" fill="none" stroke-linecap="round"><animate attributeName="opacity" values="1;.2;1" dur=".7s" repeatCount="indefinite"/></path></svg>`;
SVG_IC.a = `<svg viewBox="0 0 36 36"><path d="M5 31L27 9" stroke="#fde68a" stroke-width="3" stroke-linecap="round"/><path class="ic-pulse" d="M24 5l8-1-1 8z" fill="#f97316" stroke="#fef08a" stroke-width="1.2"/><path class="ic-sway" d="M7 29c-3-4-2-8 1-11 0 3 2 4 2 4 1-3 3-5 3-8 4 4 4 10-2 15z" fill="#ef4444" stroke="#fb923c" stroke-width="1.2"/></svg>`;
SVG_IC.t = `<svg viewBox="0 0 36 36"><path d="M18 3l11 7-3 17-8 6-8-6-3-17z" fill="#27272a" stroke="#e11d48" stroke-width="1.5"/><path d="M8 30c4-6 2-12 8-18M28 30c-4-6-2-12-8-18" stroke="#166534" stroke-width="2" fill="none"/><g class="ic-rose"><circle cx="18" cy="15" r="6" fill="#e11d48" stroke="#fecdd3" stroke-width="1.2"/><circle cx="18" cy="15" r="2.2" fill="#9f1239"/></g><path class="ic-pulse" d="M6 24l5-2M30 24l-5-2M18 33v-4" stroke="#4ade80" stroke-width="2" stroke-linecap="round"/></svg>`;
SVG_IC.e = `<svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="16.5" fill="#064e3b" stroke="#fbbf24" stroke-width="2"/><g><animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur="8s" repeatCount="indefinite"/><circle cx="18" cy="18" r="9.5" fill="none" stroke="#fbbf2455" stroke-width=".8"/><path d="M18 4.8C16.2 7.2 14.8 8.3 14.8 9.8a1.8 1.8 0 0 0 2.8 1.4L17 12.6h2l-.6-1.4a1.8 1.8 0 0 0 2.8-1.4c0-1.5-1.4-2.6-3.2-5z" fill="#a78bfa"/><path d="M27.2 21.3s-3.3-2.1-3.3-4.2c0-1.3 1-2.2 2.1-2.2.7 0 1.2.4 1.2 1 0-.6.5-1 1.2-1 1.1 0 2.1.9 2.1 2.2 0 2.1-3.3 4.2-3.3 4.2z" fill="#fb7185"/><polygon points="18,23.6 21,27.5 18,31.4 15,27.5" fill="#fbbf24"/><g fill="#34d399"><circle cx="8.8" cy="15.8" r="1.7"/><circle cx="7" cy="18.2" r="1.7"/><circle cx="10.6" cy="18.2" r="1.7"/><polygon points="8.8,18.2 7.6,21.2 10,21.2"/></g></g></svg>`;

// ===== ІКОНКИ НОВИХ КАРТ (V28) =====
SVG_IC["I"] = `<svg viewBox="0 0 36 36"><path d="M8 29l11-14" stroke="#78350f" stroke-width="5" stroke-linecap="round"/><path d="M17 17c-2-6 3-12 10-12 3 6-1 12-8 13z" fill="#b45309" stroke="#fde68a" stroke-width="1.4" stroke-linejoin="round"/><path d="M8 29l11-14" stroke="#d97706" stroke-width="2" stroke-linecap="round"/></svg>`;
SVG_IC["J"] = `<svg viewBox="0 0 36 36"><path d="M27 5c3 5 1 11-5 16l-4-4C23 11 25 8 27 5z" fill="#e2e8f0" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/><path d="M18 17l4 4-9 9-4-4z" fill="#78350f" stroke="#fbbf24" stroke-width="1.2" stroke-linejoin="round"/><path d="M15 20l6-6" stroke="#475569" stroke-width="1.6"/></svg>`;
SVG_IC["M"] = `<svg viewBox="0 0 36 36"><path d="M9 31L26 8" stroke="#78350f" stroke-width="3.4" stroke-linecap="round"/><path d="M19 7c5-4 11-2 12 3-4 5-9 7-14 5 1-3 1-5 2-8z" fill="#94a3b8" stroke="#f1f5f9" stroke-width="1.4" stroke-linejoin="round"/><path d="M21 9c3 0 6 1 8 3" stroke="#fff" stroke-width="1.2" fill="none" opacity=".8"/></svg>`;
SVG_IC["O"] = `<svg viewBox="0 0 36 36"><rect x="5" y="14" width="26" height="9" rx="3" fill="#ca8a04" stroke="#fde68a" stroke-width="1.5"/><g fill="#1c1917" stroke="#fde68a" stroke-width="1.2"><circle cx="10" cy="18.5" r="2.6"/><circle cx="16" cy="18.5" r="2.6"/><circle cx="22" cy="18.5" r="2.6"/><circle cx="28" cy="18.5" r="2.6"/></g><path d="M7 23v5h5M5 14l3-4h20l3 4" fill="none" stroke="#fde68a" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
SVG_IC["Q"] = `<svg viewBox="0 0 36 36"><path d="M6 30L27 9" stroke="#94a3b8" stroke-width="2.4" stroke-linecap="round"/><path d="M26 6l6-1-1 6-4 1z" fill="#e2e8f0" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/><path d="M5 31l3-8 5 5zM9 27l2-6 4 4z" fill="#f43f5e" stroke="#fecdd3" stroke-width="1"/></svg>`;
SVG_IC["R"] = `<svg viewBox="0 0 36 36"><path d="M4 12c9 2 19 2 28 0-1 9-6 13-14 13S5 21 4 12z" fill="none" stroke="#a16207" stroke-width="3" stroke-linecap="round"/><path d="M18 8v26" stroke="#78350f" stroke-width="4" stroke-linecap="round"/><path d="M4 12l14 6 14-6" stroke="#e2e8f0" stroke-width="1.2" fill="none"/><path d="M18 5l-3 5h6z" fill="#e2e8f0" stroke="#fff" stroke-width="1"/></svg>`;
SVG_IC["U"] = `<svg viewBox="0 0 36 36"><path d="M10 4c14 4 14 24 0 28" fill="none" stroke="#a16207" stroke-width="3.2" stroke-linecap="round"/><path d="M10 4v28" stroke="#f1f5f9" stroke-width="1"/><path d="M6 18h24" stroke="#cbd5e1" stroke-width="1.8" stroke-linecap="round"/><path d="M31 18l-5-3v6z" fill="#e2e8f0" stroke="#fff" stroke-width="1"/><path d="M7 18l-3-3M7 18l-3 3" stroke="#f43f5e" stroke-width="1.6" stroke-linecap="round"/></svg>`;
SVG_IC["V"] = `<svg viewBox="0 0 36 36"><path d="M8 30l10-10" stroke="#78350f" stroke-width="4" stroke-linecap="round"/><circle cx="24" cy="12" r="7" fill="#64748b" stroke="#e2e8f0" stroke-width="1.6"/><path d="M24 2v3M24 19v3M14 12h3M31 12h3M17 5l2 2M31 19l-2-2M31 5l-2 2M17 19l2-2" stroke="#e2e8f0" stroke-width="2.2" stroke-linecap="round"/></svg>`;
SVG_IC["X"] = `<svg viewBox="0 0 36 36"><path d="M9 31L24 15" stroke="#78350f" stroke-width="4" stroke-linecap="round"/><g transform="rotate(-40 22 12)"><rect x="11" y="5" width="22" height="14" rx="2.5" fill="#475569" stroke="#e2e8f0" stroke-width="1.6"/><path d="M14 8h16" stroke="#fff" stroke-width="1.4" opacity=".6"/></g></svg>`;
SVG_IC["Y"] = `<svg viewBox="0 0 36 36"><path d="M6 6L30 30M30 6L6 30" stroke="#e2e8f0" stroke-width="3" stroke-linecap="round"/><path d="M22 30l8-8M6 22l8 8" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/><circle cx="31" cy="31" r="2" fill="#fbbf24"/><circle cx="5" cy="31" r="2" fill="#fbbf24"/></svg>`;
SVG_IC["Z"] = `<svg viewBox="0 0 36 36"><path d="M18 6L8 10v8c0 6 4 10 10 13 6-3 10-7 10-13v-8z" fill="#38bdf8" fill-opacity=".35" stroke="#7dd3fc" stroke-width="1.6"/><path d="M4 32L24 12" stroke="#cbd5e1" stroke-width="2.6" stroke-linecap="round"/><path d="M22 14l8-8" stroke="#a78bfa" stroke-width="3" stroke-linecap="round"/><path d="M29 3l4 4-6 1z" fill="#ddd6fe"/></svg>`;
SVG_IC["1"] = `<svg viewBox="0 0 36 36"><path d="M18 12c-4-4-12-2-12 7 0 8 6 14 12 14s12-6 12-14c0-9-8-11-12-7z" fill="#ef4444" stroke="#fecaca" stroke-width="1.5"/><path d="M18 12c0-3 1-5 3-7" stroke="#78350f" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M20 8c3-3 7-2 8 0-3 2-6 2-8 0z" fill="#4ade80" stroke="#bbf7d0" stroke-width="1"/><path d="M11 17c0-2 1-3 3-4" stroke="#fff" stroke-width="1.6" stroke-linecap="round" fill="none" opacity=".7"/></svg>`;
SVG_IC["2"] = `<svg viewBox="0 0 36 36"><path d="M5 17c0-6 6-9 13-9s13 3 13 9c0 2-1 3-2 3v8c0 2-1 3-3 3H10c-2 0-3-1-3-3v-8c-1 0-2-1-2-3z" fill="#d97706" stroke="#fde68a" stroke-width="1.5" stroke-linejoin="round"/><path d="M12 12l3 6M18 11l3 6M24 12l3 6" stroke="#fef3c7" stroke-width="1.8" stroke-linecap="round"/></svg>`;
SVG_IC["3"] = `<svg class="ic-sway" viewBox="0 0 36 36"><path d="M18 33V12" stroke="#166534" stroke-width="2" stroke-linecap="round"/><g fill="#4ade80" stroke="#14532d" stroke-width=".9" stroke-linejoin="round"><path d="M18 14C12 13 9 8 10 4c5 0 8 4 8 10z"/><path d="M18 14c6-1 9-6 8-10-5 0-8 4-8 10z"/><path d="M18 24c-6 0-9-4-9-8 5 0 8 3 9 8z"/><path d="M18 24c6 0 9-4 9-8-5 0-8 3-9 8z"/></g><path d="M14 31h8" stroke="#78350f" stroke-width="3" stroke-linecap="round"/></svg>`;
SVG_IC["4"] = `<svg viewBox="0 0 36 36"><path d="M14 3h8v6l4 6v16c0 1.5-1 2.5-2.5 2.5h-11C11 33.5 10 32.5 10 31V15l4-6z" fill="#f8fafc" fill-opacity=".9" stroke="#e0f2fe" stroke-width="1.5" stroke-linejoin="round"/><path d="M10 19h16v12c0 1.5-1 2.5-2.5 2.5h-11C11 33.5 10 32.5 10 31z" fill="#e2e8f0"/><rect x="14" y="2" width="8" height="3" rx="1" fill="#38bdf8"/><path d="M13 22v6" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>`;
SVG_IC["5"] = `<svg viewBox="0 0 36 36"><path d="M14 3h8M15 3v9L7 28c-1 3 1 5 4 5h14c3 0 5-2 4-5L21 12V3" fill="none" stroke="#fef3c7" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/><path d="M10 23h16l3 6c1 3-1 4-4 4H11c-3 0-5-1-4-4z" fill="#f59e0b" stroke="#fde68a" stroke-width="1"/><circle cx="16" cy="27" r="1.4" fill="#fef3c7"/><circle cx="21" cy="29" r="1" fill="#fef3c7"/></svg>`;
SVG_IC["6"] = `<svg viewBox="0 0 36 36"><path d="M13 9V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" fill="none" stroke="#e2e8f0" stroke-width="2"/><rect x="4" y="9" width="28" height="22" rx="3.5" fill="#f8fafc" stroke="#fecaca" stroke-width="1.6"/><path d="M18 14v12M12 20h12" stroke="#ef4444" stroke-width="4.5" stroke-linecap="round"/></svg>`;
SVG_IC["7"] = `<svg viewBox="0 0 36 36"><defs><radialGradient id="chCore" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#ffffff"/><stop offset="28%" stop-color="#e879f9"/><stop offset="65%" stop-color="#6b21a8"/><stop offset="100%" stop-color="#1e1b4b"/></radialGradient></defs><circle cx="18" cy="18" r="15.5" fill="url(#chCore)" stroke="#c084fc" stroke-width="1.3"/><g class="ic-spin" fill="none" stroke-linecap="round"><path d="M18 4a14 14 0 0 1 13.5 10.5A10.5 10.5 0 0 1 21 28a7.5 7.5 0 0 1-7-7.5 4.5 4.5 0 0 1 4.5-4.5" stroke="#e9d5ff" stroke-width="2"/><path d="M18 32A14 14 0 0 1 4.5 21.5 10.5 10.5 0 0 1 15 8a7.5 7.5 0 0 1 7 7.5" stroke="#a855f7" stroke-width="2.2"/><g fill="#f5d0fe" stroke="none"><polygon points="18,3 20,7 16,7"/><polygon points="32,18 28,20 28,16"/><polygon points="18,33 16,29 20,29"/><polygon points="4,18 8,16 8,20"/><polygon points="27,9 23,11 25,13"/><polygon points="9,27 13,25 11,23"/></g></g><circle class="ic-pulse" cx="18" cy="18" r="3.4" fill="#fff"/></svg>`;
SVG_IC["8"] = `<svg viewBox="0 0 36 36"><defs><linearGradient id="dioCup" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fef08a"/><stop offset="55%" stop-color="#d97706"/><stop offset="100%" stop-color="#78350f"/></linearGradient></defs><path d="M10 8h16c0 7-3.5 11.5-8 11.5S10 15 10 8z" fill="url(#dioCup)" stroke="#fffbeb" stroke-width="1.1"/><rect x="16.6" y="19.5" width="2.8" height="8.5" fill="#d97706"/><path d="M11.5 31h13l-2-3h-9z" fill="url(#dioCup)" stroke="#fffbeb" stroke-width="0.8"/><path class="ic-sway" d="M6 28C8 19 14 15 22 13C27 12 30 9 31 6" fill="none" stroke="#4ade80" stroke-width="2.2" stroke-linecap="round"/><path d="M13 11c-3-2-6 0-5 3 2 1 4 0 5-3zM24 9c2-3 5-2 5 1-2 2-4 1-5-1z" fill="#fde047" stroke="#92400e" stroke-width="0.6"/><g class="ic-pulse" fill="#9333ea" stroke="#e9d5ff" stroke-width="0.6"><circle cx="24" cy="16" r="2.4"/><circle cx="28" cy="16" r="2.4"/><circle cx="26" cy="19.5" r="2.4"/><circle cx="23" cy="19.5" r="2.1"/><circle cx="25.5" cy="23" r="2.2"/></g></svg>`;
SVG_IC["9"] = `<svg class="ic-destroyer" viewBox="0 0 36 36"><defs><linearGradient id="desGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fde047"/><stop offset="52%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#78350f"/></linearGradient><radialGradient id="desGlow" cx="50%" cy="52%" r="48%"><stop offset="0%" stop-color="#fffbeb" stop-opacity="1"/><stop offset="55%" stop-color="#fde047" stop-opacity="0.72"/><stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/></radialGradient></defs><circle cx="18" cy="18" r="13.5" fill="url(#desGlow)" opacity="0.58"/><g class="des-orbit"><polygon class="des-sh1" points="18,1.5 20.8,6.2 15.2,6.2" fill="#fde047" stroke="#fffbeb" stroke-width="0.6"/><polygon class="des-sh2" points="30.8,8 33.4,13 28.2,12" fill="#f59e0b" stroke="#fde047" stroke-width="0.6"/><polygon class="des-sh3" points="5.2,8 7.8,12 2.6,13" fill="#f59e0b" stroke="#fde047" stroke-width="0.6"/><polygon class="des-sh4" points="31.6,24.8 27.6,23.2 29.8,27.8" fill="#fde047" stroke="#78350f" stroke-width="0.6"/><polygon class="des-sh5" points="4.4,24.8 6.2,27.8 8.4,23.2" fill="#fde047" stroke="#78350f" stroke-width="0.6"/></g><g class="des-helm"><path d="M10.2 16.5C10.2 10.4 13.7 7.2 18 7.2s7.8 3.2 7.8 9.3v10.4l-4.7 3.5v-8.9h-6.2v8.9l-4.7-3.5V16.5z" fill="url(#desGold)" stroke="#fffbeb" stroke-width="1.15" stroke-linejoin="round"/><path d="M12.6 15.4h10.8v2.7h-4v8.4h-2.8v-8.4h-4z" fill="#451a03"/><path class="des-eye" d="M13.3 16.1h9.4v1.35h-4v6.7h-1.4v-6.7h-4z" fill="#fffbeb"/><path d="M11.4 12.2l2.6 1.8M24.6 12.2l-2.6 1.8M18 7.4v4.4" stroke="#fffbeb" stroke-width="0.9" stroke-linecap="round" opacity="0.88"/></g></svg>`;

// ===== 15 АНТИЧНО-МІФОЛОГІЧНИХ КАРТ АТАКИ (V62) =====
SVG_IC["α"] = `<svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15.2" fill="none" stroke="#6f9e82" stroke-width="1.4" opacity=".82"/><path d="M6 10c3.6 10.5 7.8 15.2 12 15.2s8.4-4.7 12-15.2" fill="none" stroke="#78350f" stroke-width="3.4" stroke-linecap="round"/><path d="M6 10c3.6 10.5 7.8 15.2 12 15.2s8.4-4.7 12-15.2" fill="none" stroke="#b45309" stroke-width="1.3" stroke-linecap="round" opacity=".75"/><ellipse cx="18" cy="24.6" rx="6.4" ry="3.2" fill="#6b3410" stroke="#d6b48a" stroke-width=".9"/><polygon points="18,15.5 23.2,19.4 21.4,24.6 14.6,24.6 12.8,19.4" fill="#334155" stroke="#94a3b8" stroke-width="1.15" stroke-linejoin="round"/><path d="M15.4 19.6l3-2.2 2 2.6" fill="none" stroke="#cbd5e1" stroke-width=".9" stroke-linecap="round"/></svg>`;
SVG_IC["β"] = `<svg viewBox="0 0 36 36"><path d="M7 11c4-5.5 11.5-7 17-3.5-4.2 1.2-6.4 3.2-7.4 5.2-3.2-1-6.5-1.2-9.6-1.7z" fill="#10b981" stroke="#a7f3d0" stroke-width="1" stroke-linejoin="round"/><path d="M5 17.5l6.5-3.2-2.6 6.2z" fill="#059669" stroke="#6ee7b7" stroke-width=".9" stroke-linejoin="round"/><path d="M8 15.5c4.5-5.8 14.5-6.6 23.5 1.8-5.2.8-10.2 3.2-13.2 9.7-2.2-4.4-5.2-7.5-10.3-11.5z" fill="#d97706" stroke="#fef3c7" stroke-width="1.25" stroke-linejoin="round"/><path d="M17.5 15c4.8 0 9.4 1 13.5 2.4-5.2 1.1-9.2 2.4-12.2 5.4" fill="#f59e0b" opacity=".82"/><circle cx="14.2" cy="14" r="1.45" fill="#064e3b" stroke="#6ee7b7" stroke-width=".6"/></svg>`;
SVG_IC["γ"] = `<svg viewBox="0 0 36 36"><path d="M8.5 31.5L19.5 17.5" stroke="#451a03" stroke-width="5" stroke-linecap="round"/><path d="M8.5 31.5L19.5 17.5" stroke="#92400e" stroke-width="2.6" stroke-linecap="round"/><g transform="rotate(-36 22 14)"><rect x="10.5" y="6.8" width="22" height="12.6" rx="2.2" fill="#64748b" stroke="#e2e8f0" stroke-width="1.3"/><rect x="11.5" y="7.8" width="20" height="3.2" rx="1" fill="#94a3b8" opacity=".65"/><path d="M14.5 9.5l3 4-2 4.2M25.5 8.5l-2 4.8 3 4.2" stroke="#1e293b" stroke-width="1.3" fill="none" stroke-linecap="round"/><circle cx="19" cy="14" r="1" fill="#cbd5e1"/><circle cx="23" cy="12" r=".9" fill="#334155"/></g></svg>`;
SVG_IC["δ"] = `<svg viewBox="0 0 36 36"><path d="M5 31L27 9" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round"/><path d="M7 29L25 11" stroke="#f1f5f9" stroke-width=".9" stroke-linecap="round"/><polygon points="31.5,4.5 20.5,8.8 27.2,15.5" fill="#cbd5e1" stroke="#ffffff" stroke-width="1.15" stroke-linejoin="round"/><line x1="23.8" y1="12.2" x2="30.5" y2="5.5" stroke="#475569" stroke-width="1"/><path d="M6.2 26.8l-3.4 5.4 5.4-3.4M10.4 22.6l-3.2 5.2 5.2-3.2" fill="#22c55e" stroke="#bbf7d0" stroke-width=".85" stroke-linejoin="round"/></svg>`;
SVG_IC["ε"] = `<svg viewBox="0 0 36 36"><path d="M6.5 29.5l6.2-6.2" stroke="#5c2d0c" stroke-width="4.4" stroke-linecap="round"/><path d="M10.8 20.8l4.4 4.4" stroke="#d97706" stroke-width="2.6" stroke-linecap="round"/><path d="M12.8 22.2C15.5 14 21 7.8 30.2 5c-1.2 7.8-4.8 13.6-11.2 17.5l-1.5-2.6-2.4 2.4-2.3-.1z" fill="#cbd5e1" stroke="#f8fafc" stroke-width="1.2" stroke-linejoin="round"/><path d="M21 15.2l2.6 2.1" stroke="#0f172a" stroke-width="1.8" stroke-linecap="round"/><path d="M15.8 19.2c3-5.2 7.2-9.4 12.2-12.2" fill="none" stroke="#4ade80" stroke-width="1" opacity=".78" stroke-linecap="round"/></svg>`;
SVG_IC["ζ"] = `<svg viewBox="0 0 36 36"><defs><linearGradient id="borG" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stop-color="#0284c7"/><stop offset="55%" stop-color="#7dd3fc"/><stop offset="100%" stop-color="#f0f9ff"/></linearGradient></defs><path d="M6.8 29.8l6-6" stroke="#1e3a8a" stroke-width="4.2" stroke-linecap="round"/><path d="M10.2 20.8l5 5" stroke="#bae6fd" stroke-width="2.6" stroke-linecap="round"/><path d="M13 22L28.2 4l2.8 1.2-5 8.8 2.2 1.8-6 5.2 1.2 2-8.2 1.8z" fill="url(#borG)" stroke="#e0f2fe" stroke-width="1.2" stroke-linejoin="round"/><path d="M15.8 20.2L27.4 6.8" stroke="#ffffff" stroke-width="1.15" opacity=".92" stroke-linecap="round"/><g class="ic-spark" stroke="#bae6fd" stroke-width="1.25" stroke-linecap="round"><path d="M8.5 10.5h4.2M10.6 8.4v4.2M26.4 21.5h4.2M28.5 19.4v4.2"/></g></svg>`;
SVG_IC["η"] = `<svg viewBox="0 0 36 36"><defs><linearGradient id="apG" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stop-color="#d97706"/><stop offset="55%" stop-color="#facc15"/><stop offset="100%" stop-color="#fef9c3"/></linearGradient></defs><circle class="ic-pulse" cx="27.5" cy="8.5" r="6.2" fill="#fde047" opacity=".3"/><path d="M6 30L28 8" stroke="url(#apG)" stroke-width="2.6" stroke-linecap="round"/><polygon points="32.5,3.5 21.8,7.2 28.8,14.2" fill="#fde047" stroke="#fffbeb" stroke-width="1.1" stroke-linejoin="round"/><path d="M5 31l2.2-8.2 6 6zM9.2 26.8l1.6-6.2 4.6 4.6z" fill="#2dd4bf" stroke="#ccfbf1" stroke-width=".9" stroke-linejoin="round"/><g class="ic-spark" stroke="#fef08a" stroke-width="1.1" stroke-linecap="round"><path d="M27.5 1.5v2M33 8.5h2"/></g></svg>`;
SVG_IC["θ"] = `<svg viewBox="0 0 36 36"><circle class="ic-pulse" cx="18" cy="18" r="14.2" fill="#a855f7" opacity=".22"/><path d="M3.5 23.5c7.5-8.5 21-3.5 29-12" fill="none" stroke="#f5d0fe" stroke-width="1.8" stroke-dasharray="3.2 2"/><path d="M9.5 8.5l17 17.5M26.5 8.5l-17 17.5" stroke="#c084fc" stroke-width="2.6" stroke-linecap="round"/><circle cx="10" cy="27.5" r="3.6" fill="none" stroke="#f5d0fe" stroke-width="1.8"/><circle cx="26" cy="27.5" r="3.6" fill="none" stroke="#f5d0fe" stroke-width="1.8"/><circle class="ic-spark" cx="18" cy="17.5" r="2.1" fill="#fde047"/></svg>`;
SVG_IC["ι"] = `<svg viewBox="0 0 36 36"><defs><radialGradient id="scyG" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#f5d0fe"/><stop offset="45%" stop-color="#9333ea"/><stop offset="100%" stop-color="#1e1b4b"/></radialGradient></defs><circle cx="18" cy="18" r="13.2" fill="url(#scyG)" stroke="#d8b4fe" stroke-width="1.2"/><g class="ic-spin" fill="none" stroke-linecap="round"><path d="M18 6a12 12 0 0 1 11 9A9 9 0 0 1 18 27a6 6 0 0 1-5-6" stroke="#f5d0fe" stroke-width="2"/><path d="M18 30A12 12 0 0 1 7 21" stroke="#c084fc" stroke-width="1.8"/><g fill="#e879f9" stroke="none"><polygon points="18,1 20.2,6 15.8,6"/><polygon points="33,10 27.8,12 29.8,15.5"/><polygon points="33,26 29.8,20.5 27.4,24"/><polygon points="18,35 15.8,30 20.2,30"/><polygon points="3,26 8.6,24 6.2,20.5"/><polygon points="3,10 6.2,15.5 8.6,12"/></g></g><circle class="ic-pulse" cx="18" cy="18" r="2.7" fill="#ffffff"/></svg>`;
SVG_IC["κ"] = `<svg viewBox="0 0 36 36"><defs><linearGradient id="arG" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fecaca"/><stop offset="48%" stop-color="#dc2626"/><stop offset="100%" stop-color="#7f1d1d"/></linearGradient></defs><circle class="ic-pulse" cx="18" cy="16" r="13.5" fill="#ef4444" opacity=".26"/><path d="M18 2l5.2 7.2-2.1 14.8h-6.2L12.8 9.2z" fill="url(#arG)" stroke="#fee2e2" stroke-width="1.15" stroke-linejoin="round"/><path d="M18 5v17M16.2 10l3.6 2-3.6 2.2" fill="none" stroke="#fde047" stroke-width="1.05" stroke-linecap="round"/><path d="M9.5 24h17l-2.2 3H11.7z" fill="#b45309" stroke="#fde68a" stroke-width=".9"/><rect x="16.3" y="27" width="3.4" height="5.8" rx="1" fill="#450a0a"/><circle cx="18" cy="33.5" r="2.1" fill="#f59e0b" stroke="#fef08a" stroke-width=".6"/></svg>`;
SVG_IC["λ"] = `<svg viewBox="0 0 36 36"><path d="M8 31l11-12" stroke="#451a03" stroke-width="4.6" stroke-linecap="round"/><path d="M8 31l11-12" stroke="#92400e" stroke-width="2" stroke-linecap="round"/><g transform="rotate(-38 22 13)"><rect x="10" y="5" width="23" height="14.2" rx="2.5" fill="#1c1917" stroke="#f97316" stroke-width="1.45"/><path class="ic-pulse" d="M12.8 12l4-3.2 3.2 4.2 5-4 4.2 3" fill="none" stroke="#ef4444" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 15.2l5-2.2 4 3" fill="none" stroke="#fde047" stroke-width="1.1" stroke-linecap="round"/></g><circle class="ic-spark" cx="30" cy="24.5" r="1.5" fill="#fde047"/><circle class="ic-spark s2" cx="8" cy="11.5" r="1.3" fill="#fb923c"/></svg>`;
SVG_IC["μ"] = `<svg viewBox="0 0 36 36"><defs><linearGradient id="grG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f43f5e"/><stop offset="100%" stop-color="#881337"/></linearGradient></defs><path d="M14 4h8v5l6 12a9 9 0 0 1-8 12h-4a9 9 0 0 1-8-12l6-12z" fill="#4c0519" fill-opacity=".68" stroke="#fda4af" stroke-width="1.4" stroke-linejoin="round"/><path d="M10.5 22c3-2 5 2 7.5 0s4.5-2 7.5 0a7 7 0 0 1-6.5 9.5h-2a7 7 0 0 1-6.5-9.5z" fill="url(#grG)"/><path d="M15.8 13.5l2.2 10.5 2.2-10.5z" fill="#f8fafc" stroke="#fecdd3" stroke-width=".6"/><circle class="ic-drip" cx="29.5" cy="12" r="2.3" fill="#a3e635" stroke="#ecfccb" stroke-width=".7"/><circle class="ic-bub" cx="15" cy="27" r="1.35" fill="#a3e635"/><circle class="ic-bub b2" cx="21" cy="25.5" r="1.05" fill="#bef264"/></svg>`;
SVG_IC["ν"] = `<svg viewBox="0 0 36 36"><defs><linearGradient id="frG" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stop-color="#991b1b"/><stop offset="55%" stop-color="#f97316"/><stop offset="100%" stop-color="#fef08a"/></linearGradient></defs><path class="ic-sway" d="M4.5 31.5c1-9.2 6-14.5 14.2-18.5 2-4 5.2-7 12.2-9-2 7.2-5 10.2-9 12.2-4 8-9.2 13.2-17.4 15.3z" fill="url(#frG)" stroke="#fed7aa" stroke-width="1.2" stroke-linejoin="round"/><path d="M9 27L28 8" stroke="#fffbeb" stroke-width="2.1" stroke-linecap="round"/><polygon points="32.5,3.5 22.8,7.2 28.8,13.2" fill="#fef08a" stroke="#ffffff" stroke-width="1" stroke-linejoin="round"/></svg>`;
SVG_IC["ξ"] = `<svg viewBox="0 0 36 36"><defs><radialGradient id="zeG" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fffbeb"/><stop offset="55%" stop-color="#facc15"/><stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/></radialGradient></defs><circle class="ic-pulse" cx="18" cy="18" r="16" fill="url(#zeG)" opacity=".58"/><path d="M7.5 10.5l4.2 4.8L18 8l6.3 7.3 4.2-4.8-2 10.2h-17z" fill="none" stroke="#fde047" stroke-width="1.45" stroke-linejoin="round" opacity=".88"/><polygon class="ic-bolt" points="21.2,2 9.8,19.2 17,19.2 14,34 27.2,14.8 19.2,14.8" fill="#fef08a" stroke="#ffffff" stroke-width="1.35" stroke-linejoin="round"/></svg>`;
SVG_IC["ω"] = `<svg viewBox="0 0 36 36"><defs><linearGradient id="chG" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fde047"/><stop offset="50%" stop-color="#a16207"/><stop offset="100%" stop-color="#18181b"/></linearGradient></defs><path d="M7 31L27 7" stroke="#facc15" stroke-width="2.6" stroke-linecap="round"/><path d="M23 4.8l7.2 5.2-5 8-6.2-5z" fill="url(#chG)" stroke="#fef08a" stroke-width="1.1" stroke-linejoin="round"/><path d="M9 17.2c0-7.2 4-11.2 9-11.2s9 4 9 11.2c-2 2-5 3-9 3s-7-1-9-3z" fill="#18181b" stroke="#fde047" stroke-width="1.35" stroke-linejoin="round"/><circle class="ic-pulse" cx="15" cy="14.2" r="1.45" fill="#fde047"/><circle class="ic-pulse" cx="21" cy="14.2" r="1.45" fill="#fde047"/><circle class="ic-float" cx="5.8" cy="12" r="1.4" fill="#fef9c3" opacity=".8"/><circle class="ic-float" cx="30.2" cy="25" r="1.4" fill="#fef9c3" opacity=".8"/></svg>`;
SVG_IC["0"] = `<svg class="ic-midas" viewBox="0 0 36 36"><defs><linearGradient id="midGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#facc15"/><stop offset="52%" stop-color="#d97706"/><stop offset="100%" stop-color="#991b1b"/></linearGradient><linearGradient id="midShine" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#ffffff" stop-opacity="0"/><stop offset="50%" stop-color="#fffbeb" stop-opacity="0.9"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient><clipPath id="midHandClip"><path d="M12.4 28.4c-2.3-1.8-3.4-5.2-3.2-9L6.8 15.5c-.6-.9.2-2.1 1.3-1.8l2.5 1.3.4-7.2c.1-1.2 1.7-1.4 2.1-.3l1.3 5.4 1.1-7.4c.2-1.2 1.9-1.2 2.1 0l1 6.8 2.1-6.2c.4-1.1 2-.8 1.9.4l-.8 7 3-4.6c.7-1 2.1-.2 1.7.9l-2.7 7.6c-.8 4.4-1.8 8.2-4.3 11.1-2.1 2.1-5.1 2.3-7.1-.1z"/></clipPath></defs><g class="mid-hand"><path d="M12.4 28.4c-2.3-1.8-3.4-5.2-3.2-9L6.8 15.5c-.6-.9.2-2.1 1.3-1.8l2.5 1.3.4-7.2c.1-1.2 1.7-1.4 2.1-.3l1.3 5.4 1.1-7.4c.2-1.2 1.9-1.2 2.1 0l1 6.8 2.1-6.2c.4-1.1 2-.8 1.9.4l-.8 7 3-4.6c.7-1 2.1-.2 1.7.9l-2.7 7.6c-.8 4.4-1.8 8.2-4.3 11.1-2.1 2.1-5.1 2.3-7.1-.1z" fill="url(#midGold)" stroke="#fef08a" stroke-width="1" stroke-linejoin="round"/><g clip-path="url(#midHandClip)"><rect class="mid-shine" x="-14" y="2" width="12" height="32" transform="rotate(20 18 18)" fill="url(#midShine)"/></g><circle cx="17.6" cy="21.4" r="3.1" fill="#991b1b" fill-opacity="0.55" stroke="#fef08a" stroke-width="0.9"/><circle cx="17.6" cy="21.4" r="1.2" fill="#fde047"/><path class="mid-veins" d="M17.6 18.2L16.5 9.6M19.5 19L21.5 10.2M15.4 19.6L12.6 10.6M20.4 20.6L25 14.2" stroke="#ef4444" stroke-width="0.75" stroke-linecap="round" opacity="0.82"/><circle cx="11.6" cy="6.6" r="1.15" fill="#fde047"/><circle cx="16.5" cy="4.8" r="1.2" fill="#facc15"/><circle cx="21.8" cy="6.2" r="1.15" fill="#fde047"/><circle cx="26.4" cy="10.4" r="1.05" fill="#facc15"/></g><path class="mid-drop" d="M17.6 29.8c1.1 1.6 1.5 2.4 0 3.6-1.5-1.2-1.1-2 0-3.6z" fill="#facc15" stroke="#fffbeb" stroke-width="0.55"/></svg>`;

// ===== 12 АНТИЧНО-МІФОЛОГІЧНИХ КАРТ ЗДОРОВ'Я (V63) =====
// 1. Ячмінь (π): золотистий колосок із вусами та смарагдовим акцентом
SVG_IC["π"] = `<svg class="ic-barley" viewBox="0 0 36 36"><defs><linearGradient id="brG" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fef08a"/><stop offset="55%" stop-color="#eab308"/><stop offset="100%" stop-color="#a16207"/></linearGradient></defs><g class="hl-sway"><path d="M18 33V10" stroke="#ca8a04" stroke-width="2" stroke-linecap="round"/><g stroke="#fde047" stroke-width=".9" stroke-linecap="round" opacity=".88"><path d="M16 11L12.5 3.5M18 9.5V2M20 11L23.5 3.5M14.5 16L10 9.5M21.5 16L26 9.5"/></g><g fill="url(#brG)" stroke="#fef9c3" stroke-width=".75"><ellipse cx="14.8" cy="22.5" rx="2.3" ry="3.8" transform="rotate(-24 14.8 22.5)"/><ellipse cx="21.2" cy="22.5" rx="2.3" ry="3.8" transform="rotate(24 21.2 22.5)"/><ellipse cx="14.8" cy="16.5" rx="2.2" ry="3.6" transform="rotate(-22 14.8 16.5)"/><ellipse cx="21.2" cy="16.5" rx="2.2" ry="3.6" transform="rotate(22 21.2 16.5)"/><ellipse cx="18" cy="11.2" rx="2.1" ry="3.5"/></g><path class="hl-glint" d="M18 31.5c-4.5-.8-7-3.4-7.6-6.8 3.6.5 6.1 2.6 7.6 6.8zM18 31.5c4.5-.8 7-3.4 7.6-6.8-3.6.5-6.1 2.6-7.6 6.8z" fill="#10b981" stroke="#a7f3d0" stroke-width=".85" stroke-linejoin="round"/><circle class="ic-spark" cx="25.5" cy="13" r="1.3" fill="#a7f3d0"/></g></svg>`;

// 2. Ромашка (ρ): біла польова квітка з жовтою серцевиною та листочками
SVG_IC["ρ"] = `<svg class="ic-chamomile" viewBox="0 0 36 36"><defs><radialGradient id="chCoreY" cx="40%" cy="35%" r="65%"><stop offset="0%" stop-color="#fef9c3"/><stop offset="55%" stop-color="#facc15"/><stop offset="100%" stop-color="#d97706"/></radialGradient></defs><path d="M18 34V22" stroke="#15803d" stroke-width="2.1" stroke-linecap="round"/><path d="M18 29c-4.5-.6-7.2-2.8-8-5.6 3.8-.2 6.6 1.6 8 5.6zM18 30.5c4.4-.6 7-2.6 7.8-5.4-3.6-.2-6.4 1.6-7.8 5.4z" fill="#22c55e" stroke="#bbf7d0" stroke-width=".8" stroke-linejoin="round"/><g class="hl-petal-sway"><g fill="#f8fafc" stroke="#cbd5e1" stroke-width=".75"><ellipse cx="18" cy="7.2" rx="2.7" ry="5.4"/><ellipse cx="18" cy="22.8" rx="2.7" ry="5.4"/><ellipse cx="10.2" cy="15" rx="5.4" ry="2.7"/><ellipse cx="25.8" cy="15" rx="5.4" ry="2.7"/><ellipse cx="12.5" cy="9.5" rx="2.6" ry="5" transform="rotate(-45 12.5 9.5)"/><ellipse cx="23.5" cy="20.5" rx="2.6" ry="5" transform="rotate(-45 23.5 20.5)"/><ellipse cx="23.5" cy="9.5" rx="2.6" ry="5" transform="rotate(45 23.5 9.5)"/><ellipse cx="12.5" cy="20.5" rx="2.6" ry="5" transform="rotate(45 12.5 20.5)"/></g><circle class="hl-core-glow" cx="18" cy="15" r="4.8" fill="url(#chCoreY)" stroke="#fef08a" stroke-width="1"/></g></svg>`;

// 3. Корінь Женьшеню (σ): гіллястий бежевий корінь із зеленим пагінцем угорі
SVG_IC["σ"] = `<svg class="ic-ginseng" viewBox="0 0 36 36"><defs><linearGradient id="ginG" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f5e6cc"/><stop offset="55%" stop-color="#d6b48a"/><stop offset="100%" stop-color="#8c6239"/></linearGradient></defs><g class="hl-breathe"><path d="M16 11h4c2 3.5 2.4 7.5 1.4 11 1.6 3 4.2 5.2 6.8 6.4-2.8.8-5.4-.4-7.4-2.4-.5 2.6-.2 5 1 7.2-2.2-.8-3.6-2.8-3.8-5.6-1.2 2.4-2.8 4.6-5.2 5.8.6-2.4 1-4.8 1.8-7.2-2.2 1.2-4.6 1.6-7 1 2.6-1.8 4.8-4.2 6.4-7.2-.8-3-.2-6.2 2-9z" fill="url(#ginG)" stroke="#fef3c7" stroke-width="1" stroke-linejoin="round"/><path d="M15.6 15h4.8M15.4 18.6h5.2M16.2 22h3.6" stroke="#78350f" stroke-width=".85" stroke-linecap="round" opacity=".55"/></g><g class="hl-sprout"><path d="M18 11.2V5.8" stroke="#16a34a" stroke-width="1.8" stroke-linecap="round"/><path d="M18 8C14.2 7.5 11.6 5.2 11.4 2.4c3.4-.2 5.8 1.6 6.6 5.6zM18 7.6c3.8-.5 6.4-2.8 6.6-5.6-3.4-.2-5.8 1.6-6.6 5.6z" fill="#4ade80" stroke="#dcfce7" stroke-width=".8" stroke-linejoin="round"/></g></svg>`;

// 4. Ключ Джерела (τ): блакитний водяний ключ/водоворот зі сріблястим кільцем
SVG_IC["τ"] = `<svg class="ic-springkey" viewBox="0 0 36 36"><defs><radialGradient id="spW" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#e0f2fe"/><stop offset="48%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#0369a1"/></radialGradient></defs><circle cx="18" cy="18" r="14.5" fill="url(#spW)" fill-opacity=".28" stroke="#7dd3fc" stroke-width="1.1"/><g class="hl-vortex-spin" fill="none" stroke-linecap="round"><path d="M18 4.5A13.5 13.5 0 0 1 31 15.5M18 31.5A13.5 13.5 0 0 1 5 20.5" stroke="#38bdf8" stroke-width="2.4"/><path d="M18 8.2A9.8 9.8 0 0 1 27.6 17M18 27.8A9.8 9.8 0 0 1 8.4 19" stroke="#bae6fd" stroke-width="1.8"/></g><g class="hl-silver-ring"><circle cx="18" cy="14" r="5.6" fill="#0c4a6e" fill-opacity=".65" stroke="#f8fafc" stroke-width="2"/><circle cx="18" cy="14" r="2.4" fill="#7dd3fc"/><path d="M18 19.6V30.5M18 25.5h4M18 29h3" stroke="#e2e8f0" stroke-width="2.2" stroke-linecap="round"/></g><circle class="ic-spark" cx="27.5" cy="9.5" r="1.4" fill="#ffffff"/></svg>`;

// 5. Крила Зефіра (υ): легке блакитне крило з повітряними вихорами
SVG_IC["υ"] = `<svg class="ic-zephyr" viewBox="0 0 36 36"><defs><linearGradient id="zepW" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ffffff"/><stop offset="48%" stop-color="#bae6fd"/><stop offset="100%" stop-color="#0284c7"/></linearGradient></defs><g class="hl-wind-flow" fill="none" stroke="#7dd3fc" stroke-width="1.5" stroke-linecap="round"><path d="M3.5 11.5c4.5-3 9-2.2 12 .2"/><path d="M4.5 26.5c5.5 2.4 11 1.6 16-2"/><path d="M23 30c3.6 1 7.2-.2 9.2-2.8"/></g><g class="hl-wing-flutter"><path d="M7 27C8 14 17 5.5 31.5 4.5c-2.6 5.2-6.2 8.2-10.5 9.6 3.8-.2 7.2.2 10 1.4-4 3.4-8.2 4.6-13 4.8 3 .6 5.6 1.4 8 2.6-4.8 3.2-11.2 4.8-19 4.1z" fill="url(#zepW)" stroke="#f0f9ff" stroke-width="1.15" stroke-linejoin="round"/><path d="M10.5 24c4.8-6.4 10.6-11.8 18-16.2" fill="none" stroke="#38bdf8" stroke-width="1.15" stroke-linecap="round" opacity=".8"/></g><circle class="ic-spark s2" cx="28" cy="11" r="1.2" fill="#e0f2fe"/></svg>`;

// 6. Дзеркало Нікти (φ): фіолетове овальне дзеркало в темній срібній оправі з місячним відблиском
SVG_IC["φ"] = `<svg class="ic-nyx" viewBox="0 0 36 36"><defs><radialGradient id="nyxG" cx="38%" cy="32%" r="70%"><stop offset="0%" stop-color="#f5d0fe"/><stop offset="42%" stop-color="#9333ea"/><stop offset="100%" stop-color="#1e1b4b"/></radialGradient><clipPath id="nyxClip"><ellipse cx="18" cy="15.5" rx="9.5" ry="12"/></clipPath></defs><circle class="ic-pulse" cx="18" cy="16" r="14.5" fill="#9333ea" opacity=".24"/><path d="M18 28.5V34M14 33.5h8" stroke="#94a3b8" stroke-width="2.2" stroke-linecap="round"/><ellipse cx="18" cy="15.5" rx="11.2" ry="13.5" fill="#1e293b" stroke="#cbd5e1" stroke-width="1.7"/><ellipse cx="18" cy="15.5" rx="9.2" ry="11.5" fill="url(#nyxG)" stroke="#d8b4fe" stroke-width=".9"/><g clip-path="url(#nyxClip)"><rect class="hl-moon-glint" x="-8" y="0" width="9" height="34" transform="rotate(24 18 16)" fill="#ffffff" opacity=".55"/></g><path d="M21 9.5a5.2 5.2 0 1 0 0 10.2 4.2 4.2 0 1 1 0-10.2z" fill="#fef9c3" opacity=".92"/><circle class="ic-spark" cx="11.5" cy="9.5" r="1.1" fill="#f5d0fe"/></svg>`;

// 7. Іскра Гестії (χ): фіолетово-бурштинове вогнище у чаші з трьома язиками полум'я
SVG_IC["χ"] = `<svg class="ic-hestia" viewBox="0 0 36 36"><defs><linearGradient id="hesFl" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="#7e22ce"/><stop offset="52%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#fef08a"/></linearGradient><linearGradient id="hesBowl" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#c084fc"/><stop offset="55%" stop-color="#581c87"/><stop offset="100%" stop-color="#1e1b4b"/></linearGradient></defs><g class="hl-flame-dance"><path d="M11 22c-2.6-3.8-2-8.2 1.4-11.2-.2 2.6 1 4.2 2.2 4.6-1-4.6 1-8.8 3.4-12.2 2.4 3.4 4.4 7.6 3.4 12.2 1.2-.4 2.4-2 2.2-4.6 3.4 3 4 7.4 1.4 11.2z" fill="url(#hesFl)" stroke="#fde68a" stroke-width="1" stroke-linejoin="round"/><path d="M15.2 21.5c-.8-2.6.4-5.4 2.8-8.2 2.4 2.8 3.6 5.6 2.8 8.2z" fill="#fffbeb" opacity=".88"/></g><path d="M7.5 21.5h21c-1 5.4-4.8 8.5-10.5 8.5S8.5 26.9 7.5 21.5z" fill="url(#hesBowl)" stroke="#e9d5ff" stroke-width="1.3" stroke-linejoin="round"/><path d="M13 32.5h10l-1.5-2.5h-7z" fill="#7e22ce" stroke="#fde047" stroke-width=".8"/><circle class="ic-bub" cx="12" cy="7.5" r="1.15" fill="#fde047"/><circle class="ic-bub b2" cx="24" cy="8.5" r="1.05" fill="#fb923c"/></svg>`;

// 8. Квітка Персефони (ψ): темно-фіолетовий гранатовий цвіт із золотою тичинкою та листям підземелля
SVG_IC["ψ"] = `<svg class="ic-persephone" viewBox="0 0 36 36"><defs><linearGradient id="perP" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e879f9"/><stop offset="55%" stop-color="#7e22ce"/><stop offset="100%" stop-color="#3b0764"/></linearGradient></defs><path d="M6 27c5-2.5 8.5-1.5 12 2.5 3.5-4 7-5 12-2.5-3.5 5-8 6.5-12 6.5S9.5 32 6 27z" fill="#1e1b4b" stroke="#6ee7b7" stroke-width="1" stroke-linejoin="round"/><g class="hl-bud-pulse"><path d="M6 17c5.5.4 9.6 3.8 12 10.5-6.8 1.2-11.2-2.6-12-10.5zM30 17c-5.5.4-9.6 3.8-12 10.5 6.8 1.2 11.2-2.6 12-10.5z" fill="url(#perP)" stroke="#f5d0fe" stroke-width="1" stroke-linejoin="round"/><path d="M10.5 9c5.2 2 8 7.5 7.5 18.5-6.6-2.2-10-8.8-7.5-18.5zM25.5 9c-5.2 2-8 7.5-7.5 18.5 6.6-2.2 10-8.8 7.5-18.5z" fill="url(#perP)" stroke="#f5d0fe" stroke-width="1" stroke-linejoin="round"/><path d="M18 3.5c4.6 5.5 5.4 13.5 0 23.5-5.4-10-4.6-18 0-23.5z" fill="#a855f7" stroke="#fae8ff" stroke-width="1.1" stroke-linejoin="round"/></g><g class="hl-stamen"><line x1="18" y1="23" x2="18" y2="11" stroke="#fde047" stroke-width="1.4" stroke-linecap="round"/><circle cx="18" cy="10.2" r="2.2" fill="#fde047" stroke="#fffbeb" stroke-width=".7"/><circle cx="14.8" cy="13.2" r="1.2" fill="#facc15"/><circle cx="21.2" cy="13.2" r="1.2" fill="#facc15"/></g></svg>`;

// 9. Ехо Аркадії (Γ): фіолетова ліра/сопілка з концентричними звуковими хвилями
SVG_IC["Γ"] = `<svg class="ic-arcadia" viewBox="0 0 36 36"><defs><linearGradient id="arcL" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f5d0fe"/><stop offset="55%" stop-color="#a855f7"/><stop offset="100%" stop-color="#4c1d95"/></linearGradient></defs><circle class="hl-sound-ring" cx="18" cy="18" r="14.2" fill="none" stroke="#d8b4fe" stroke-width="1.3" stroke-dasharray="5 3"/><circle class="hl-sound-ring r2" cx="18" cy="18" r="10.8" fill="none" stroke="#a855f7" stroke-width="1.2" stroke-dasharray="4 3"/><path d="M11 8c-3.2 6-1.8 14.2 7 18.5 8.8-4.3 10.2-12.5 7-18.5-1.5 1.8-2.8 3.2-3.5 4.8 1 4.6-.4 8.2-3.5 10.2-3.1-2-4.5-5.6-3.5-10.2-.7-1.6-2-3-3.5-4.8z" fill="url(#arcL)" stroke="#faf5ff" stroke-width="1.1" stroke-linejoin="round"/><line x1="10.5" y1="10.5" x2="25.5" y2="10.5" stroke="#fde047" stroke-width="1.8" stroke-linecap="round"/><g stroke="#fef08a" stroke-width=".95" opacity=".9"><line x1="15.5" y1="10.5" x2="15.5" y2="24"/><line x1="18" y1="10.5" x2="18" y2="25.2"/><line x1="20.5" y1="10.5" x2="20.5" y2="24"/></g><path d="M13 30.5h10l-1.5-3.2h-7z" fill="#6b21a8" stroke="#e9d5ff" stroke-width=".9"/></svg>`;

// 10. Жертовний Кубок (Δ): багряний кубок із краплею крові та гострими шипами по краях
SVG_IC["Δ"] = `<svg class="ic-chalice" viewBox="0 0 36 36"><defs><linearGradient id="sacC" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fb7185"/><stop offset="48%" stop-color="#be123c"/><stop offset="100%" stop-color="#4c0519"/></linearGradient></defs><g class="hl-thorn-gleam" fill="#fecdd3" stroke="#9f1239" stroke-width=".6"><polygon points="6,10 10,12 8.5,15.5"/><polygon points="30,10 26,12 27.5,15.5"/><polygon points="7,20 11.5,18.5 10.5,22.5"/><polygon points="29,20 24.5,18.5 25.5,22.5"/></g><path d="M9.5 11.5h17c-.4 7.5-3.6 12-8.5 12s-8.1-4.5-8.5-12z" fill="url(#sacC)" stroke="#fecdd3" stroke-width="1.35" stroke-linejoin="round"/><rect x="16.4" y="23.5" width="3.2" height="6.2" fill="#881337" stroke="#fda4af" stroke-width=".7"/><path d="M11 32.5h14l-2-3h-10z" fill="url(#sacC)" stroke="#fecdd3" stroke-width=".95" stroke-linejoin="round"/><path class="hl-blood-pulse" d="M18 3C15.5 6.8 14 8.6 14 10.6a4 4 0 0 0 8 0C22 8.6 20.5 6.8 18 3z" fill="#ef4444" stroke="#ffe4e6" stroke-width="1"/></svg>`;

// 11. Кров Саламандри (Φ): червоно-оранжева саламандра кільцем навколо вогняного ядра
SVG_IC["Φ"] = `<svg class="ic-salamander" viewBox="0 0 36 36"><defs><radialGradient id="salCore" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fffbeb"/><stop offset="45%" stop-color="#fb923c"/><stop offset="100%" stop-color="#dc2626"/></radialGradient></defs><circle class="hl-fire-core" cx="18" cy="18" r="7.5" fill="url(#salCore)" stroke="#fef08a" stroke-width="1.2"/><g class="hl-sal-shimmer" fill="none" stroke-linecap="round"><path d="M23.5 6.5A12.5 12.5 0 1 1 8.5 10.2" stroke="#7f1d1d" stroke-width="5.4"/><path d="M23.5 6.5A12.5 12.5 0 1 1 8.5 10.2" stroke="#f97316" stroke-width="3.4"/><path d="M23.5 6.5A12.5 12.5 0 1 1 8.5 10.2" stroke="#fef08a" stroke-width="1" stroke-dasharray="2.5 3.5"/></g><ellipse cx="10.2" cy="8.8" rx="3.8" ry="2.6" transform="rotate(-34 10.2 8.8)" fill="#ef4444" stroke="#fed7aa" stroke-width=".9"/><circle cx="9.6" cy="8.2" r=".95" fill="#fef08a"/><g stroke="#fb923c" stroke-width="1.6" stroke-linecap="round"><path d="M28.5 14l3.5-1.6M26.5 25.5l3 2.5M9.5 26l-3 2"/></g></svg>`;

// ===== 5 НОВИХ СПЕЦКАРТ (V64) =====
// 1. Дзеркало Нарциса (Σ): витончене сріблясто-золоте дзеркало в орнаменті зі смарагдово-золотим відблиском
SVG_IC["Σ"] = `<svg class="ic-narcissus" viewBox="0 0 36 36"><defs><linearGradient id="narFrame" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f8fafc"/><stop offset="46%" stop-color="#fde047"/><stop offset="100%" stop-color="#94a3b8"/></linearGradient><radialGradient id="narGlass" cx="38%" cy="32%" r="72%"><stop offset="0%" stop-color="#fef9c3"/><stop offset="42%" stop-color="#34d399"/><stop offset="100%" stop-color="#064e3b"/></radialGradient><linearGradient id="narGlintG" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#ffffff" stop-opacity="0"/><stop offset="50%" stop-color="#fef9c3" stop-opacity="0.95"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient><clipPath id="narClip"><ellipse cx="18" cy="15.2" rx="8.4" ry="10.6"/></clipPath></defs><path d="M18 28.2v5.3M13.5 33.4h9M14.8 29.8h6.4" stroke="url(#narFrame)" stroke-width="2" stroke-linecap="round"/><ellipse cx="18" cy="15.2" rx="11.2" ry="13.2" fill="#0f172a" stroke="url(#narFrame)" stroke-width="1.9"/><path d="M18 1.4l2.1 2.5-2.1 1.3-2.1-1.3zM6.2 15.2l2.2-1.7v3.4zM29.8 15.2l-2.2-1.7v3.4z" fill="#fde047"/><ellipse cx="18" cy="15.2" rx="8.4" ry="10.6" fill="url(#narGlass)" stroke="#a7f3d0" stroke-width="0.9"/><g clip-path="url(#narClip)"><rect class="sp-mirror-glint" x="-16" y="-2" width="10" height="36" fill="url(#narGlintG)"/></g><circle class="ic-spark" cx="13.6" cy="10.4" r="1.2" fill="#fef9c3"/><circle class="ic-spark s2" cx="22.4" cy="19.6" r="1.05" fill="#6ee7b7"/></svg>`;

// 2. Кайдани Кроноса (Θ): два перехрещені сталево-блакитні ланцюги з крижаним пісочним годинником у центрі
SVG_IC["Θ"] = `<svg class="ic-kronos" viewBox="0 0 36 36"><defs><linearGradient id="krIce" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e0f2fe"/><stop offset="52%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#1e3a8a"/></linearGradient></defs><g class="sp-kronos-chains" fill="none" stroke="#7dd3fc" stroke-width="2.05"><ellipse cx="8.5" cy="8.5" rx="4" ry="2.3" transform="rotate(45 8.5 8.5)"/><ellipse cx="13.6" cy="13.6" rx="4" ry="2.3" transform="rotate(45 13.6 13.6)"/><ellipse cx="22.4" cy="22.4" rx="4" ry="2.3" transform="rotate(45 22.4 22.4)"/><ellipse cx="27.5" cy="27.5" rx="4" ry="2.3" transform="rotate(45 27.5 27.5)"/><ellipse cx="27.5" cy="8.5" rx="4" ry="2.3" transform="rotate(-45 27.5 8.5)"/><ellipse cx="22.4" cy="13.6" rx="4" ry="2.3" transform="rotate(-45 22.4 13.6)"/><ellipse cx="13.6" cy="22.4" rx="4" ry="2.3" transform="rotate(-45 13.6 22.4)"/><ellipse cx="8.5" cy="27.5" rx="4" ry="2.3" transform="rotate(-45 8.5 27.5)"/></g><path d="M12.2 8.2h11.6M12.2 27.8h11.6M13.6 8.2c0 5.4 4.4 6.4 4.4 9.8s-4.4 4.4-4.4 9.8M22.4 8.2c0 5.4-4.4 6.4-4.4 9.8s4.4 4.4 4.4 9.8" fill="url(#krIce)" fill-opacity=".38" stroke="#e0f2fe" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"/><polygon points="15,26.2 21,26.2 18,21.4" fill="#bae6fd"/><polygon points="15.6,10.2 20.4,10.2 18,14.2" fill="#7dd3fc" opacity=".8"/><g class="sp-kronos-frost" fill="#e0f2fe"><polygon points="18,1.2 19.4,4.6 18,6 16.6,4.6"/><polygon points="34.8,18 31.4,19.4 30,18 31.4,16.6"/><polygon points="18,34.8 16.6,31.4 18,30 19.4,31.4"/><polygon points="1.2,18 4.6,16.6 6,18 4.6,19.4"/></g></svg>`;

// 3. Нить Аріадни (Λ): золотий клубок ниток, від якого тягнеться сяюча нитка у вигляді петлі
SVG_IC["Λ"] = `<svg class="ic-ariadne" viewBox="0 0 36 36"><defs><radialGradient id="arBall" cx="35%" cy="32%" r="68%"><stop offset="0%" stop-color="#fef9c3"/><stop offset="55%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#92400e"/></radialGradient></defs><path class="sp-thread-tail" d="M20.5 22.5c5.8 2.4 11 0 11.8-5.1.7-4.5-3.4-7.4-6.9-5.1-2.6 1.7-2 5.9 1.2 6.6 2.9.6 5.6-1.4 6.7-4.3" fill="none" stroke="#fef08a" stroke-width="2.1" stroke-linecap="round"/><g class="sp-yarn-spin"><circle cx="14.2" cy="19.5" r="9.4" fill="url(#arBall)" stroke="#fef08a" stroke-width="1.3"/><path d="M6.4 15.6c4.6 2.5 10.6 2.5 15.5-0.5M5.8 21.1c5.2-2.4 11-2.4 16.3 0.8M9.3 11.2c3.2 5.4 3.4 11.4 0.4 16.8M17.3 10.6c-2.6 5.4-2.4 11.6 0.8 17" fill="none" stroke="#78350f" stroke-width="1.15" opacity=".78" stroke-linecap="round"/><path d="M8.1 17.6c4.2 1.8 8.6 1.8 12.6-.4" fill="none" stroke="#fffbeb" stroke-width="1.05" opacity=".82" stroke-linecap="round"/></g><circle class="ic-spark" cx="31.8" cy="14.2" r="1.3" fill="#fffbeb"/></svg>`;

// 4. Скипетр Аїда (Ψ): чорний обсидіановий скіпетр із двозубцем та палаючим фіолетово-червоним каменем
SVG_IC["Ψ"] = `<svg class="ic-hades" viewBox="0 0 36 36"><defs><linearGradient id="hadObs" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#475569"/><stop offset="50%" stop-color="#0f172a"/><stop offset="100%" stop-color="#020617"/></linearGradient><radialGradient id="hadGem" cx="45%" cy="38%" r="62%"><stop offset="0%" stop-color="#fecdd3"/><stop offset="44%" stop-color="#e11d48"/><stop offset="100%" stop-color="#581c87"/></radialGradient></defs><path d="M18 34.2V16.2" stroke="url(#hadObs)" stroke-width="3.7" stroke-linecap="round"/><path d="M18 34.2V16.2" stroke="#94a3b8" stroke-width="0.7" stroke-linecap="round" opacity=".52"/><path d="M10.8 5.4c-1.8 4.9.7 10.7 7.2 11.8 6.5-1.1 9-6.9 7.2-11.8-1.2 4.3-3.1 7.3-7.2 8.1-4.1-.8-6-3.8-7.2-8.1z" fill="url(#hadObs)" stroke="#c084fc" stroke-width="1.25" stroke-linejoin="round"/><path d="M10.8 5.4L9.2 2.6l2.9 1.3M25.2 5.4l1.6-2.8-2.9 1.3" stroke="#e9d5ff" stroke-width="1.1" stroke-linecap="round"/><g class="sp-hades-gem"><circle cx="18" cy="10.8" r="6" fill="#9333ea" opacity=".36"/><polygon points="18,4.2 22.1,10.8 18,16 13.9,10.8" fill="url(#hadGem)" stroke="#f5d0fe" stroke-width="1.05" stroke-linejoin="round"/></g><circle class="sp-hades-spark" cx="11.6" cy="12" r="1.15" fill="#f43f5e"/><circle class="sp-hades-spark s2" cx="24.6" cy="9.2" r="1.15" fill="#c084fc"/></svg>`;

// 5. Колесо Фортуни (Π): золоте колесо з 8 секторами, рунами та стрілкою-покажчиком угорі
SVG_IC["Π"] = `<svg class="ic-fortune" viewBox="0 0 36 36"><defs><linearGradient id="fwGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fef9c3"/><stop offset="52%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#92400e"/></linearGradient></defs><g class="sp-wheel-rock"><circle cx="18" cy="19.2" r="13.2" fill="#1c1917" stroke="url(#fwGold)" stroke-width="2.6"/><circle class="sp-wheel-runes" cx="18" cy="19.2" r="10.3" fill="none" stroke="#fde047" stroke-width="1.1" stroke-dasharray="2.4 2.1"/><g stroke="url(#fwGold)" stroke-width="1.35"><line x1="18" y1="6.4" x2="18" y2="32"/><line x1="5.2" y1="19.2" x2="30.8" y2="19.2"/><line x1="9" y1="10.2" x2="27" y2="28.2"/><line x1="27" y1="10.2" x2="9" y2="28.2"/></g><path d="M18 19.2L13.6 8.2A12 12 0 0 1 22.4 8.2Z" fill="#facc15" fill-opacity=".28"/><circle cx="18" cy="19.2" r="3.4" fill="url(#fwGold)" stroke="#fffbeb" stroke-width="1"/></g><polygon points="18,8.4 15,2.2 21,2.2" fill="#fef08a" stroke="#92400e" stroke-width="0.85" stroke-linejoin="round"/></svg>`;

// 12. Дерево Життя (Ω): могутнє золоте дерево з розлогою кроною та сяючим корінням
SVG_IC["Ω"] = `<svg class="ic-lifetree" viewBox="0 0 36 36"><defs><radialGradient id="ltGlow" cx="50%" cy="46%" r="52%"><stop offset="0%" stop-color="#fffbeb" stop-opacity=".95"/><stop offset="52%" stop-color="#facc15" stop-opacity=".55"/><stop offset="100%" stop-color="#d97706" stop-opacity="0"/></radialGradient><linearGradient id="ltWood" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fef08a"/><stop offset="50%" stop-color="#eab308"/><stop offset="100%" stop-color="#92400e"/></linearGradient></defs><circle class="hl-tree-glow" cx="18" cy="17" r="16" fill="url(#ltGlow)"/><g class="hl-tree-crown"><circle cx="18" cy="11.5" r="6.8" fill="#facc15" fill-opacity=".35" stroke="#fef08a" stroke-width="1.1"/><circle cx="11.5" cy="14.5" r="5" fill="#eab308" fill-opacity=".35" stroke="#fde047" stroke-width="1"/><circle cx="24.5" cy="14.5" r="5" fill="#eab308" fill-opacity=".35" stroke="#fde047" stroke-width="1"/></g><path d="M18 28V11M18 17l-5.5-3.8M18 16.5l5.5-3.5M18 13.5l-3-3.5M18 13.5l3-3.5" fill="none" stroke="url(#ltWood)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path class="hl-tree-roots" d="M18 26.5c-2.5 2.4-6.2 4.2-10.5 4.8M18 26.5c-1.4 3-3 5.2-5 6.8M18 26.5c2.5 2.4 6.2 4.2 10.5 4.8M18 26.5c1.4 3 3 5.2 5 6.8" fill="none" stroke="#fde047" stroke-width="1.6" stroke-linecap="round"/><circle class="ic-spark" cx="10.5" cy="8.5" r="1.25" fill="#fffbeb"/><circle class="ic-spark s2" cx="26" cy="9" r="1.25" fill="#fffbeb"/><circle class="ic-spark s3" cx="18" cy="5.5" r="1.35" fill="#fef08a"/></svg>`;


const AVATARS = [
  {
    id: "crown",
    name: "Корона Олімпу",
    svg: `<svg class="av-svg" viewBox="0 0 64 64"><defs><radialGradient id="avBg0" cx="35%" cy="30%"><stop offset="0%" stop-color="#312e81"/><stop offset="65%" stop-color="#111827"/><stop offset="100%" stop-color="#030712"/></radialGradient><linearGradient id="avCr0" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fef08a"/><stop offset="55%" stop-color="#eab308"/><stop offset="100%" stop-color="#854d0e"/></linearGradient></defs><rect width="64" height="64" fill="url(#avBg0)"/><circle cx="14" cy="16" r="1.4" fill="#fde047" opacity=".8"/><circle cx="50" cy="14" r="1.6" fill="#fff" opacity=".75"/><circle cx="22" cy="11" r="1" fill="#bae6fd" opacity=".65"/><circle cx="44" cy="20" r="1.1" fill="#fde047" opacity=".7"/><path d="M12 46h40l4-22-12 9-12-16-12 16-12-9 4 22z" fill="url(#avCr0)" stroke="#fffbeb" stroke-width="1.6" stroke-linejoin="round"/><rect x="12" y="46" width="40" height="5.5" rx="2.5" fill="#ca8a04" stroke="#fef08a" stroke-width="1.1"/><circle cx="32" cy="16" r="2.8" fill="#fef08a"/><circle cx="20" cy="39" r="2.3" fill="#ef4444"/><circle cx="32" cy="39" r="2.7" fill="#38bdf8"/><circle cx="44" cy="39" r="2.3" fill="#ef4444"/></svg>`
  },
  {
    id: "hoplite",
    name: "Шолом Гопліта",
    svg: `<svg class="av-svg" viewBox="0 0 64 64"><defs><radialGradient id="avBg1" cx="40%" cy="25%"><stop offset="0%" stop-color="#64748b"/><stop offset="65%" stop-color="#1e293b"/><stop offset="100%" stop-color="#090d16"/></radialGradient><linearGradient id="avBr1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fde68a"/><stop offset="50%" stop-color="#d97706"/><stop offset="100%" stop-color="#78350f"/></linearGradient></defs><rect width="64" height="64" fill="url(#avBg1)"/><g opacity=".22" stroke="#e2e8f0" stroke-width="2"><line x1="10" y1="6" x2="10" y2="58"/><line x1="54" y1="6" x2="54" y2="58"/></g><path d="M18 16C26 5 44 7 50 22C41 18 29 18 18 16Z" fill="#e11d48" stroke="#fda4af" stroke-width="1.4"/><path d="M17 34c0-10.5 6.5-17 15-17s15 6.5 15 17v15l-9.5 4.5V38h-11v15.5L17 49V34z" fill="url(#avBr1)" stroke="#fef3c7" stroke-width="1.5" stroke-linejoin="round"/><path d="M21 34h8.5v4H21zM34.5 34H43v4h-8.5z" fill="#09090b"/></svg>`
  },
  {
    id: "oracle",
    name: "Око Оракула",
    svg: `<svg class="av-svg" viewBox="0 0 64 64"><defs><radialGradient id="avBg2" cx="50%" cy="50%"><stop offset="0%" stop-color="#065f46"/><stop offset="68%" stop-color="#042f2e"/><stop offset="100%" stop-color="#021410"/></radialGradient></defs><rect width="64" height="64" fill="url(#avBg2)"/><circle cx="32" cy="32" r="25" fill="none" stroke="#fbbf24" stroke-width="1.3" stroke-dasharray="4 3" opacity=".78"/><circle cx="32" cy="32" r="20" fill="none" stroke="#2dd4bf" stroke-width="1" stroke-dasharray="2 3" opacity=".6"/><path d="M8 32C16 18.5 48 18.5 56 32C48 45.5 16 45.5 8 32Z" fill="#09151b" stroke="#fde047" stroke-width="2.2"/><circle cx="32" cy="32" r="10.5" fill="#14b8a6" stroke="#ccfbf1" stroke-width="1.5"/><circle cx="32" cy="32" r="4.6" fill="#042f2e"/><circle cx="29" cy="29" r="2.2" fill="#fff"/></svg>`
  },
  {
    id: "wolf",
    name: "Вовк Ареса",
    svg: `<svg class="av-svg" viewBox="0 0 64 64"><defs><radialGradient id="avBg3" cx="50%" cy="35%"><stop offset="0%" stop-color="#991b1b"/><stop offset="65%" stop-color="#3b0712"/><stop offset="100%" stop-color="#0c0205"/></radialGradient><linearGradient id="avWf3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f8fafc"/><stop offset="55%" stop-color="#94a3b8"/><stop offset="100%" stop-color="#334155"/></linearGradient></defs><rect width="64" height="64" fill="url(#avBg3)"/><circle cx="32" cy="26" r="19" fill="#f43f5e" opacity=".32"/><path d="M17 14l7 11h16l7-11 2 19-7.5 13.5-9.5 6.5-9.5-6.5L15 33l2-19z" fill="url(#avWf3)" stroke="#f8fafc" stroke-width="1.4" stroke-linejoin="round"/><path d="M22.5 31l5 2.2-5 2.2zM41.5 31l-5 2.2 5 2.2z" fill="#ef4444"/><path d="M28.5 41.5h7L32 46z" fill="#0f172a"/></svg>`
  },
  {
    id: "crystal",
    name: "Кристал Ефіру",
    svg: `<svg class="av-svg" viewBox="0 0 64 64"><defs><radialGradient id="avBg4" cx="50%" cy="50%"><stop offset="0%" stop-color="#1e3a8a"/><stop offset="70%" stop-color="#0f172a"/><stop offset="100%" stop-color="#020617"/></radialGradient><linearGradient id="avCr4" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e0f2fe"/><stop offset="45%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#1d4ed8"/></linearGradient></defs><rect width="64" height="64" fill="url(#avBg4)"/><circle cx="16" cy="18" r="1.3" fill="#bae6fd" opacity=".75"/><circle cx="49" cy="16" r="1.5" fill="#fff" opacity=".8"/><circle cx="48" cy="46" r="1.2" fill="#7dd3fc" opacity=".7"/><polygon points="32,9 48,26 32,55 16,26" fill="url(#avCr4)" stroke="#e0f2fe" stroke-width="1.6" stroke-linejoin="round"/><polygon points="32,9 48,26 32,33 16,26" fill="#ffffff" opacity=".32"/><line x1="32" y1="9" x2="32" y2="55" stroke="#e0f2fe" stroke-width="1.2" opacity=".75"/></svg>`
  },
  {
    id: "helios",
    name: "Сонце Геліоса",
    svg: `<svg class="av-svg" viewBox="0 0 64 64"><defs><radialGradient id="avBg5" cx="50%" cy="50%"><stop offset="0%" stop-color="#d97706"/><stop offset="65%" stop-color="#78350f"/><stop offset="100%" stop-color="#1c0a02"/></radialGradient><radialGradient id="avSun5" cx="40%" cy="40%"><stop offset="0%" stop-color="#fffbeb"/><stop offset="55%" stop-color="#facc15"/><stop offset="100%" stop-color="#ea580c"/></radialGradient></defs><rect width="64" height="64" fill="url(#avBg5)"/><g stroke="#fde047" stroke-width="2.6" stroke-linecap="round"><path d="M32 7v8M32 49v8M7 32h8M49 32h8M14 14l5.5 5.5M44.5 44.5L50 50M50 14l-5.5 5.5M19.5 44.5L14 50"/></g><circle cx="32" cy="32" r="13.5" fill="url(#avSun5)" stroke="#fffbeb" stroke-width="1.6"/></svg>`
  },
  {
    id: "gorgon",
    name: "Маска Горгони",
    gloryReq: 150,
    svg: `<svg class="av-svg" viewBox="0 0 64 64"><defs><radialGradient id="avBgGorg" cx="50%" cy="40%"><stop offset="0%" stop-color="#115e59"/><stop offset="65%" stop-color="#042f2e"/><stop offset="100%" stop-color="#021110"/></radialGradient><linearGradient id="avGorgFace" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#d1fae5"/><stop offset="55%" stop-color="#34d399"/><stop offset="100%" stop-color="#065f46"/></linearGradient></defs><rect width="64" height="64" fill="url(#avBgGorg)"/><g fill="none" stroke="#10b981" stroke-width="2.4" stroke-linecap="round"><path d="M18 22c-6-4-7-10-2-13"/><path d="M46 22c6-4 7-10 2-13"/><path d="M14 34c-6-1-8-6-5-10"/><path d="M50 34c6-1 8-6 5-10"/><path d="M24 14c-2-5 1-8 5-8"/><path d="M40 14c2-5-1-8-5-8"/></g><path d="M20 24c0-7 5-11 12-11s12 4 12 11v12c0 8-5.5 14-12 16-6.5-2-12-8-12-16V24z" fill="url(#avGorgFace)" stroke="#ecfdf5" stroke-width="1.5"/><path d="M24 30l5 2-5 2zM40 30l-5 2 5 2z" fill="#fef08a"/><path d="M27 42c3 2.5 7 2.5 10 0" fill="none" stroke="#022c22" stroke-width="2" stroke-linecap="round"/></svg>`
  },
  {
    id: "zeus_eagle",
    name: "Орел Зевса",
    gloryReq: 400,
    svg: `<svg class="av-svg" viewBox="0 0 64 64"><defs><radialGradient id="avBgZeu" cx="50%" cy="35%"><stop offset="0%" stop-color="#1d4ed8"/><stop offset="65%" stop-color="#1e1b4b"/><stop offset="100%" stop-color="#09071a"/></radialGradient><linearGradient id="avZeuGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fef9c3"/><stop offset="55%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#92400e"/></linearGradient></defs><rect width="64" height="64" fill="url(#avBgZeu)"/><polygon points="34,5 25,22 32,22 28,36 41,18 33,18" fill="#fde047" opacity=".35"/><path d="M10 24l14 4 8-12 8 12 14-4-8 14 4 10-18-5-18 5 4-10-8-14z" fill="url(#avZeuGold)" stroke="#fffbeb" stroke-width="1.4" stroke-linejoin="round"/><polygon points="32,21 37,30 32,37 27,30" fill="#fef08a"/><circle cx="28.5" cy="27" r="1.6" fill="#0f172a"/><circle cx="35.5" cy="27" r="1.6" fill="#0f172a"/></svg>`
  },
  {
    id: "hades_helm",
    name: "Шолом Аїда",
    gloryReq: 850,
    svg: `<svg class="av-svg" viewBox="0 0 64 64"><defs><radialGradient id="avBgHad" cx="50%" cy="35%"><stop offset="0%" stop-color="#581c87"/><stop offset="65%" stop-color="#1e0936"/><stop offset="100%" stop-color="#07020e"/></radialGradient><linearGradient id="avHadMet" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#c084fc"/><stop offset="50%" stop-color="#4c1d95"/><stop offset="100%" stop-color="#1e1b4b"/></linearGradient></defs><rect width="64" height="64" fill="url(#avBgHad)"/><path d="M14 14l8 10 10-14 10 14 8-10-3 18v16l-15 7-15-7V32l-3-18z" fill="url(#avHadMet)" stroke="#e9d5ff" stroke-width="1.5" stroke-linejoin="round"/><path d="M21 34l9 3-4 4-5-3zM43 34l-9 3 4 4 5-3z" fill="#38bdf8"/><path d="M32 22v28" stroke="#d8b4fe" stroke-width="1.6" opacity=".7"/></svg>`
  },
  {
    id: "kronos",
    name: "Титан Кронос",
    gloryReq: 1400,
    svg: `<svg class="av-svg" viewBox="0 0 64 64"><defs><radialGradient id="avBgKro" cx="50%" cy="40%"><stop offset="0%" stop-color="#b91c1c"/><stop offset="55%" stop-color="#450a0a"/><stop offset="100%" stop-color="#09030b"/></radialGradient><linearGradient id="avKroCr" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fef08a"/><stop offset="50%" stop-color="#f97316"/><stop offset="100%" stop-color="#991b1b"/></linearGradient></defs><rect width="64" height="64" fill="url(#avBgKro)"/><circle cx="32" cy="32" r="24" fill="none" stroke="#fbbf24" stroke-width="1.4" stroke-dasharray="5 3" opacity=".75"/><path d="M16 46L12 20l11 8 9-16 9 16 11-8-4 26-16 8-16-8z" fill="url(#avKroCr)" stroke="#fffbeb" stroke-width="1.5" stroke-linejoin="round"/><polygon points="24,33 30,36 24,38" fill="#fef08a"/><polygon points="40,33 34,36 40,38" fill="#fef08a"/><circle cx="32" cy="24" r="3" fill="#fffbeb"/></svg>`
  }
];

const AV_SVG = AVATARS.map(a => a.svg);

const PL_BANNERS = [
  { id: "obsidian", name: "Темний Обсидіан", preview: "linear-gradient(180deg, #1a202c 0%, #0e121b 66%, #07090f 100%)" },
  { id: "marble",   name: "Античний Мармур", preview: "linear-gradient(155deg, #475569 0%, #1e293b 55%, #0f172a 100%)" },
  { id: "crimson",  name: "Багряний Оксамит", preview: "linear-gradient(165deg, #7f1d1d 0%, #450a0a 56%, #1c0404 100%)" },
  { id: "sapphire", name: "Сапфірова Безодня", preview: "linear-gradient(165deg, #1e3a8a 0%, #0f172a 58%, #04091a 100%)" },
  { id: "jade",     name: "Нефритовий Ліс", preview: "linear-gradient(165deg, #065f46 0%, #022c22 58%, #01130f 100%)" },
  { id: "bronze",   name: "Бронза Гефеста",    preview: "linear-gradient(165deg, #78350f 0%, #451a03 58%, #1c0a01 100%)" },
  { id: "frost",    name: "Крижаний Моноліт",  gloryReq: 250,  preview: "linear-gradient(160deg, #38bdf8 0%, #0369a1 52%, #082f49 100%)" },
  { id: "magma",    name: "Розпечена Магма",   gloryReq: 600,  preview: "linear-gradient(160deg, #f97316 0%, #991b1b 54%, #1c0505 100%)" },
  { id: "astral",   name: "Зоряний Астрал",    gloryReq: 1000, preview: "linear-gradient(155deg, #a855f7 0%, #312e81 52%, #09061a 100%)" },
  { id: "imperial", name: "Царський Лавр",     gloryReq: 1500, preview: "linear-gradient(155deg, #fde047 0%, #a16207 48%, #2e1503 100%)" }
];

// ===== СОРОЧКИ КАРТ, ТИТУЛИ, 5 ЛІГ ТА «ДОРОГА СЛАВИ» (15 ВІХ) =====
const CARD_BACKS = [
  {
    id: "classic",
    name: "Античний Обсидіан",
    desc: "Класична тильна сторона карт Арени",
    gloryReq: 0,
    preview: "linear-gradient(150deg, #1f2937 0%, #0f172a 60%, #050811 100%)",
    accent: "#d4af37"
  },
  {
    id: "meander",
    name: "Золотий Меандр",
    desc: "Царський античний орнамент із позолотою",
    gloryReq: 50,
    preview: "linear-gradient(150deg, #78350f 0%, #3b1904 55%, #120802 100%)",
    accent: "#fde047"
  },
  {
    id: "frost_back",
    name: "Кришталь Борея",
    desc: "Морозне срібло та крижані кристали півночі",
    gloryReq: 500,
    preview: "linear-gradient(150deg, #0ea5e9 0%, #0c4a6e 55%, #041525 100%)",
    accent: "#bae6fd"
  },
  {
    id: "astral_back",
    name: "Астральна Тканина",
    desc: "Зоряна вуаль небесного пантеону",
    gloryReq: 1150,
    preview: "linear-gradient(150deg, #7c3aed 0%, #2e1065 55%, #090318 100%)",
    accent: "#e879f9"
  },
  {
    id: "forge_back",
    name: "Полум'я Гефеста",
    desc: "Розжарені жили вулканічного золота",
    gloryReq: 1300,
    preview: "linear-gradient(150deg, #ea580c 0%, #7f1d1d 55%, #160404 100%)",
    accent: "#fdba74"
  }
];

const PROFILE_TITLES = [
  { id: "citizen_polis",   name: "Громадянин Поліса",   campaignLvl: 3,  color: "#34d399" },
  { id: "hoplite_cadet",   name: "Учень Фаланги",       campaignLvl: 6,  color: "#60a5fa" },
  { id: "vanguard_victor", name: "Підкорювач Сходів",   campaignLvl: 9,  color: "#fb923c" },
  { id: "polis_conqueror", name: "Підкорювач Поліса",   campaignLvl: 10, color: "#fde047" },
  { id: "title_storm",     name: "Гроза Арени",         gloryReq: 300,   color: "#38bdf8" },
  { id: "title_unbeaten",  name: "Непереможний",        gloryReq: 750,   color: "#f59e0b" },
  { id: "title_olympus",   name: "Володар Олімпу",      gloryReq: 1200,  color: "#e879f9" }
];

const TROPHY_LEAGUES = [
  { id: "bronze",   name: "Бронзова Агора",    min: 0,    max: 299,      color: "#d98a4e", glow: "rgba(217,138,78,.45)",  icon: () => UI_IC.leagueBronze },
  { id: "silver",   name: "Срібний Щит",       min: 300,  max: 599,      color: "#cbd5e1", glow: "rgba(203,213,225,.45)", icon: () => UI_IC.leagueSilver },
  { id: "gold",     name: "Золотий Лавр",      min: 600,  max: 999,      color: "#facc15", glow: "rgba(250,204,21,.50)",  icon: () => UI_IC.leagueGold },
  { id: "amethyst", name: "Аметистовий Олімп", min: 1000, max: 1499,     color: "#c084fc", glow: "rgba(192,132,252,.50)", icon: () => UI_IC.leagueAmethyst },
  { id: "titan",    name: "Пантеон Титанів",   min: 1500, max: Infinity, color: "#fbbf24", glow: "rgba(251,191,36,.62)",  icon: () => UI_IC.leagueTitan }
];

const GLORY_ROAD_REWARDS = [
  { id: "gl_50",   trophies: 50,   type: "cardBack", itemId: "meander",        label: "Золотий Меандр",    cat: "Сорочка карт" },
  { id: "gl_150",  trophies: 150,  type: "avatar",   itemId: "gorgon",         label: "Маска Горгони",     cat: "Аватар" },
  { id: "gl_250",  trophies: 250,  type: "banner",   itemId: "frost",          label: "Крижаний Моноліт",  cat: "Щит-Штандарт" },
  { id: "gl_300",  trophies: 300,  type: "title",    itemId: "title_storm",    label: "Гроза Арени",       cat: "Титул" },
  { id: "gl_400",  trophies: 400,  type: "avatar",   itemId: "zeus_eagle",     label: "Орел Зевса",        cat: "Аватар" },
  { id: "gl_500",  trophies: 500,  type: "cardBack", itemId: "frost_back",     label: "Кришталь Борея",    cat: "Сорочка карт" },
  { id: "gl_600",  trophies: 600,  type: "banner",   itemId: "magma",          label: "Розпечена Магма",   cat: "Щит-Штандарт" },
  { id: "gl_750",  trophies: 750,  type: "title",    itemId: "title_unbeaten", label: "Непереможний",      cat: "Титул" },
  { id: "gl_850",  trophies: 850,  type: "avatar",   itemId: "hades_helm",     label: "Шолом Аїда",        cat: "Аватар" },
  { id: "gl_1000", trophies: 1000, type: "banner",   itemId: "astral",         label: "Зоряний Астрал",    cat: "Щит-Штандарт" },
  { id: "gl_1150", trophies: 1150, type: "cardBack", itemId: "astral_back",    label: "Астральна Тканина", cat: "Сорочка карт" },
  { id: "gl_1200", trophies: 1200, type: "title",    itemId: "title_olympus",  label: "Володар Олімпу",    cat: "Титул" },
  { id: "gl_1300", trophies: 1300, type: "cardBack", itemId: "forge_back",     label: "Полум'я Гефеста",   cat: "Сорочка карт" },
  { id: "gl_1400", trophies: 1400, type: "avatar",   itemId: "kronos",         label: "Титан Кронос",      cat: "Аватар" },
  { id: "gl_1500", trophies: 1500, type: "banner",   itemId: "imperial",       label: "Царський Лавр",     cat: "Щит-Штандарт" }
];

const SPEC_POOL = ["s", "f", "m", "z", "x", "u", "w", "i", "e", "c", "N", "Σ", "Θ", "Λ", "Ψ", "Π"];
function isSp(t) { return !"dhpgkbroatvnqyjlHDACSPWGLFBKTEIJMOQRUVXYZ1234567890αβγδεζηθικλμνξωπρστυφχψΓΔΦΩ".includes(t); }

const $ = id => document.getElementById(id);

const CODEX_TACTICS = {
 d: [
 "Надійна базова атака для розвідки першим ходом або добивання без зайвого ризику.",
 "Збалансований удар середньої сили — добре пробиває слабкий захист на початку партії.",
 "Потужний фіолетовий удар із водяним вихором — змушує ворога витрачати щит або дорогий хіл.",
 "Один із найсильніших звичайних ударів — небезпечний навіть проти гравця з високим HP.",
 "Колосальна разова шкода (−50 HP): здатна переламати дуель одним влучанням зверху."
 ],
 p: [
 "Повільно виснажує ціль на 30 HP за 2 кола. Ідеально кидати на старті, доки у ворога немає очищення.",
 "Стабільна отрута на 2 кола, ефекти складаються з іншими токсинами.",
 "Довга отрута на 3 кола (45 HP сумарно) — створює постійний тиск на лікування суперника.",
 "Важкий токсин на 3 кола — змушує ворога шукати Благословення Ра або терміновий хіл.",
 "Найдовша отрута в грі (60 HP за 4 кола) — повільний вирок без очищення."
 ],
 h: [
 "Швидке базове лікування для вирівнювання дрібних розмінів.",
 "Середнє миттєве зцілення — допомагає вийти із зони добивання.",
 "Сильний фіолетовий хіл (+22 HP), здатний нівелювати середню атаку ворога.",
 "Потужне відновлення (+30 HP) у критичний момент дуелі.",
 "Найбільший миттєвий хіл у грі (+45 HP) — миттєво повертає в бій навіть із критичного стану."
 ],
 g: [
 "Дає +40 HP за 2 кола — вигідніше за миттєвий хіл, якщо ти не боїшся померти в цьому раунді.",
 "Плавна регенерація на 2 кола, добре поєднується із захисними картами.",
 "Тривала регенерація на 3 кола (+60 HP сумарно) — забезпечує перевагу в затяжному бою.",
 "Потужне відновлення (+60 HP за 3 кола), але вразливе до Прокляття Ереба чи Кайданів Фантома.",
 "Ефірне безсмертя (+80 HP за 4 кола) — робить тебе майже невразливим до періодичної шкоди."
 ],
 S: ["Дешева та надійна зелена карта прямого удару (13 HP), яка не залежить від жодних умов."],
 I: ["Найдешевший удар у грі (11 HP): проста палиця для розвідки першим ходом."],
 J: ["Тихий і швидкий зелений удар на 12 HP — без умов і сюрпризів."],
 M: ["Зелена карта прямого удару (13 HP): трохи важча за звичайний Кремінь."],
 O: ["Найсильніша зелена атака (14 HP) — близька дистанція без жодних умов."],
 Q: ["Б'є на 15 HP, а по ворогу під отрутою, горінням чи льодом — одразу на 21. Ідеальне продовження після дебафа."],
 R: ["Надійний синій постріл на 16 HP, який не залежить від жодних умов."],
 U: ["Синя атака на 17 HP — стабільна основа для будь-якої розкладки."],
 V: ["Шипована булава на 18 HP: збалансований синій удар."],
 X: ["Найсильніший простий синій удар (19 HP) — важкий молот без умов."],
 Y: ["Два швидкі удари по 12 HP поспіль — разом 24 HP одним ходом."],
 Z: ["Завдає 23 HP і прошиває Егіду: ворог не зможе заблокувати цей удар спецкартою."],
 1: ["Дешеве миттєве зцілення (+9 HP) для вирівнювання дрібних розмінів."],
 2: ["Просте зелене лікування (+11 HP) — трохи краще за Оливку."],
 3: ["Синє лікування на +14 HP — допомагає вийти із зони добивання."],
 4: ["Синє лікування на +16 HP без жодних умов."],
 5: ["Найсильніше просте синє лікування (+17 HP)."],
 6: ["Якщо твоє здоров'я нижче 30 HP, аптечка відновлює +20 HP замість +13."],
 y: ["Охолоджує ворога: не лише б'є на 14 HP, а й ріже його наступну атаку на 5 — чудово проти важких ударів."],
 D: ["Найкращий «опенер» на старті бою: якщо у цілі понад 80 HP, б'є критичними −22 HP замість −16."],
 P: ["Гібрид миттєвого удару (−10 HP) та отрути (−10×2 кола) — сумарно знімає 30 HP."],
 H: ["Карта-камбек: прибережи її до падіння нижче 40 HP, щоб отримати посилений приплив +26 HP."],
 F: ["Якщо на тобі немає отрути, горіння чи інших дебафів, відновлює +21 HP замість +16."],
 T: ["Дає +10 HP та накладає синій купол-панцир, який поглинає 25% шкоди від наступної атаки ворога."],
 j: ["Майстер засідки: при атаці першим б'є на 18 HP, але якщо ти захищаєшся (ходиш другим) — завдає нищівні 25 HP!"],
 l: ["Контр-хіл: б'є на 22 HP і накладає Кайдани Фантома — наступне лікування або регенерація ворога згорає у полум'ї."],
 A: ["Ламає чергу ходу: у своїй наступній дуелі уповільнений ворог втрачає атаку і змушений ходити другим."],
 C: ["Азартний обсидіановий клинок: викидає випадково від 5 до 35 шкоди (30–35 — золотий КРИТ!)."],
 W: ["Помста за отриманий удар: якщо в попередній дуелі ти отримав шкоду, батіг б'є на −28 HP замість −21."],
 a: ["Завдає 30 шкоди одразу та підпалює ціль ще на −15 HP наприкінці наступного кола (45 HP сумарно)."],
 q: ["Б'є на 22 HP та перетворює 1 випадкову карту в руці ворога на камінь на 2 кола (не спрацьовує, якщо залишиться менше 2 карт)."],
 G: ["Таран колісницею на 26 HP + підпал на −15 HP наприкінці наступного кола (41 HP сумарно)."],
 L: ["Зброя відчаю: коли твоє здоров'я падає нижче 50 HP, спис завдає критичні −42 HP замість −34."],
 E: ["Пастка проти лікування: завдає 14 HP і перетворює наступний хіл або регенерацію ворога на пряму шкоду по ньому ж!"],
 t: ["Відновлює +30 HP та оточує тебе лозою шипів на 2 удари — нападник отримує назад 35% своєї шкоди."],
 B: ["Мииттєво лікує на +28 HP та запускає регенерацію +10 HP на 2 кола (48 HP сумарного зцілення)."],
 K: ["Лікує на +25 HP та назавжди підсилює 1 випадкову карту атаки в твоїй руці на +8 шкоди."],
 o: ["Нищівний удар молотом на 40 HP, який розбиває щит/дзеркало цілі та розсіює всі її позитивні бафи."],
 v: ["Вампірський укус: витягує 25 HP із супротивника і передає +25 HP тобі (різниця в 50 HP за один хід!)."],
 k: ["Найвища фіксована разова шкода в грі (−60 HP) зі звуковим оглушенням."],
 b: ["Потужна ударна хвиля на −55 HP, що розколює стіл."],
 r: ["Інвестиція в довгий бій: +30 HP одразу та вічні +10 HP наприкінці кожного кола до кінця партії."],
 n: ["Повний порятунок: +40 HP і миттєве спалення всіх дебафів (отрути, горіння, льоду, смоли, кайданів, прокляття)."],
 s: ["Ідеальний захист: блокує пряму атаку або отруту та б'є у відповідь на 50% сили (або +6 HP, якщо ворог не атакував)."],
 m: ["Фізичне дзеркало на столі: відбиває 100% шкоди або отрути назад у того, хто атакував."],
 z: ["Швидкий розряд блискавки (75% шкоди), який оглушує ціль — якщо ти ходиш першим, ворог пропускає удар у відповідь."],
 x: ["Страта поранених: якщо у ворога залишилося ≤ 50 HP, шкода подвоюється (×2) — аж до 100 HP з легендарної карти!"],
 f: ["Посилений вогняний удар на 145% від базової сили рідкості."],
 u: ["Чим ближче ти до поразки, тим сильніший удар: шкода дорівнює 100 − твоє поточне HP."],
 w: ["Повний переворот партії: ти і твій опонент у дуелі міняєтеся всіма картами в руках через портал у центрі столу."],
 i: ["Заморожує ворога на його наступний хід: його шкода падає на 50%, а спецкарта повністю блокується кригою."],
 e: [`Азартна рулетка 4 мастей: ${UI_IC.suitSpade} −40 через щити · ${UI_IC.suitHeart} +30 HP і −30% сили ворогу · ${UI_IC.suitDiamond} −15 HP і +10 усій атаці в руці · ${UI_IC.suitClub} −20 HP і скидання карти ворога.`],
 c: ["Ртутне дзеркало: копіює карту, яку виклав опонент у цій дуелі, та розігрує її зі збільшеною силою 125% (×1.25)."],
 N: ["Абсолютний баланс: вирівнює HP між тобою та опонентом до спільного середнього значення."],
 7: ["Пожирання надлишку: б'є на −20 HP, а якщо у ворога більше здоров'я, ніж у тебе, додає половину різниці (до +14 HP, разом до −34 HP!)."],
 8: ["П'янкий туман: відновлює +16 HP одразу, дає регенерацію +8 HP на 2 кола (+32 HP сумарно) та ріже наступну атаку ворога на −5 HP."],
 9: ["Золота легендарка для масових боїв: завдає −35 HP основній цілі, а при 3–4 гравцях за столом розколюється на золоті уламки й додатково б'є всіх інших суперників по −10 HP."],
 0: ["Жадібний вампіризм: стискає суперника золотою хваткою на −30 HP і перетягує потік рідкого золота на +15 HP собі (сумарна перевага в 45 HP)."],
 α: ["Простий і надійний зелений удар (−11 HP) з пращі без зайвих умов."],
 β: ["Швидкий зелений удар гарпії (−12 HP) для впевненого старту дуелі."],
 γ: ["Важкий каменярський молот (−13 HP) — стабільна зелена атака."],
 δ: ["Влучний метальний дротик пельтаста (−14 HP) без залежності від статусів."],
 ε: ["Найсильніший чистий зелений удар (−15 HP) — гострий кривий ніж найманця."],
 ζ: ["Якщо ціль чиста (без жодних активних бафів чи дебафів), клинок б'є морозним бонусом на −21 HP замість −17 HP."],
 η: ["Надійна відповідь проти дебафів: пробиває охолодження, слабкість і мороз −50%, але зупиняється важкими щитами та дзеркалами."],
 θ: ["Фіолетовий фінішер: коли здоров'я ворога падає до ≤ 40 HP, нитка долі обривається й удар зростає з −22 до −30 HP."],
 ι: ["Завдає −24 HP та накладає «Дезорієнтацію» на 1 хід — наступна карта лікування ворога відновить лише половину здоров'я."],
 κ: ["Зброя берсерка: коли твоє здоров'я ≤ 50 HP, лють бога війни посилює удар із −32 до нищівних −42 HP."],
 λ: ["Ідеальний комбо-фінішер під отруту, горіння чи смолу: розбиває негативні статуси ворога і додає +12 чистої магматичної шкоди зверху!"],
 μ: ["Високий сумарний тиск (−28 HP + отрута −15×2 кола), але токсична віддача знімає −8 HP з тебе самого."],
 ν: ["Покарання для любителів лікування: якщо ворог уже лікувався в дуелі або має активну регенерацію, кара б'є на −44 HP замість −36 HP."],
 ξ: ["Ультимативний грім Олімпу (−45 HP): знімає всі щити, бар'єри й регенерацію цілі та додає +15 HP (−60 HP), якщо на ворогу було ≥ 2 активні ефекти."],
 ω: ["Вирок Стіксу (−40 HP): миттєво страчує ціль із ≤ 35 HP крізь дрібні щити, а якщо ворог виживає — викрадає 1 випадкову карту з його руки!"],
 π: ["Найдоступніше зелене зцілення (+8 HP) — зручне для м’якого темпу та вирівнювання HP без зайвих витрат бюджету."],
 ρ: ["Стабільна зелена квітка на +12 HP — перевершує базову Оливку без жодних умов."],
 σ: ["Найсильніше просте зелене лікування (+13 HP) для надійної підтримки на початку бою."],
 τ: ["Зіграй цю карту як свій найперший хіл у партії, щоб отримати підсилені +22 HP замість +16 HP!"],
 υ: ["Ідеальна карта для відіграшу: якщо твій запас здоров’я нижчий за ворожий, вітер Зефіра відновлює +22 HP."],
 φ: ["Контр-хід після великого лікування суперника: додає 25% від його останнього хілу (до +10 HP, разом до +29 HP)."],
 χ: ["Комбінація миттєвого лікування (+18 HP) та регенерації (+6 HP × 2 кола). Пильнуй: під час «Горіння» вогнище не лікує."],
 ψ: ["Рятівна карта при ≤ 45 HP: не лише відновлює +20 HP, а й миттєво знімає 1 активний дебаф, не чіпаючи твої бафи."],
 Γ: ["Комбо-хіл: після будь-якої твоєї атаки в поточному колі Ехо Аркадії дарує +25 HP замість +17 HP."],
 Δ: ["Потужний червоний хіл (+34 HP) із прихованим ударом у кінці кола (−8 HP ворогу) — здатен добити суперника після обміну."],
 Φ: ["Найкращий щит проти Аґнеястри та Колісниці Геліоса: гасить «Горіння» з бонусом +10 HP (+38 HP) і дає імунітет на 2 кола."],
 Ω: ["Велична легендарка виживання: +35 HP одразу, +12 HP × 3 кола та одноразовий порятунок від смерті («Коріння Життя» → 15 HP)."],
 Σ: ["Пастка на хіл та крадіжка темпу: якщо цього раунду ворог лікувався — забирає 50% його лікування собі й завдає −16 HP; якщо ні — відновлює +12 HP."],
 Θ: ["Контроль ходу: завдає −15 HP і накладає «Окови часу» на 1 раунд — лічильники отрути, горіння та регенерації цілі зупиняються, а сила/лікування зменшуються на 20%."],
 Λ: ["Перенаправлення та порятунок: зменшує вхідну шкоду в цій дуелі на 60% і переносить 1 твою активну отруту або горіння на опонента."],
 Ψ: ["Ризиковий розмін: жертвуєш 15 HP, щоб завдати нищівні −38 HP; якщо після жертви в тебе ≤ 35 HP, віддача темряви повертає +15 HP."],
 Π: ["Перезавантаження руки: оновлює твою руку новими картами й додає +15 до сили першої зіграної атаки або лікування в цьому раунді."]
};

const CODEX_ENTRIES = [
 // 0: ЗЕЛЕНА РІДКІСТЬ (r = 0, 1 бал)
 { t: "d", r: 0, cat: "dmg", tier: "Базова · 1 бал" },
 { t: "h", r: 0, cat: "heal", tier: "Базова · 1 бал" },
 { t: "p", r: 0, cat: "dmg", tier: "Базова (DoT) · 1 бал" },
 { t: "g", r: 0, cat: "heal", tier: "Базова (HoT) · 1 бал" },
 { t: "S", r: 0, cat: "dmg", tier: "Унікальна · 1 бал" },
 { t: "I", r: 0, cat: "dmg", tier: "Унікальна · 1 бал" },
 { t: "J", r: 0, cat: "dmg", tier: "Унікальна · 1 бал" },
 { t: "M", r: 0, cat: "dmg", tier: "Унікальна · 1 бал" },
 { t: "O", r: 0, cat: "dmg", tier: "Унікальна · 1 бал" },
 { t: "α", r: 0, cat: "dmg", tier: "Унікальна · 1 бал" },
 { t: "β", r: 0, cat: "dmg", tier: "Унікальна · 1 бал" },
 { t: "γ", r: 0, cat: "dmg", tier: "Унікальна · 1 бал" },
 { t: "δ", r: 0, cat: "dmg", tier: "Унікальна · 1 бал" },
 { t: "ε", r: 0, cat: "dmg", tier: "Унікальна · 1 бал" },
 { t: "1", r: 0, cat: "heal", tier: "Унікальна · 1 бал" },
 { t: "2", r: 0, cat: "heal", tier: "Унікальна · 1 бал" },
 { t: "π", r: 0, cat: "heal", tier: "Унікальна · 1 бал" },
 { t: "ρ", r: 0, cat: "heal", tier: "Унікальна · 1 бал" },
 { t: "σ", r: 0, cat: "heal", tier: "Унікальна · 1 бал" },


 // 1: СИНЯ РІДКІСТЬ (r = 1, 2 бали)
 { t: "d", r: 1, cat: "dmg", tier: "Базова · 2 бали" },
 { t: "h", r: 1, cat: "heal", tier: "Базова · 2 бали" },
 { t: "p", r: 1, cat: "dmg", tier: "Базова (DoT) · 2 бали" },
 { t: "g", r: 1, cat: "heal", tier: "Базова (HoT) · 2 бали" },
 { t: "y", r: 1, cat: "dmg", tier: "Унікальна · 2 бали" },
 { t: "D", r: 1, cat: "dmg", tier: "Унікальна · 2 бали" },
 { t: "P", r: 1, cat: "dmg", tier: "Унікальна · 2 бали" },
 { t: "H", r: 1, cat: "heal", tier: "Унікальна · 2 бали" },
 { t: "F", r: 1, cat: "heal", tier: "Унікальна · 2 бали" },
 { t: "T", r: 1, cat: "heal", tier: "Унікальна · 2 бали" },
 { t: "Q", r: 1, cat: "dmg", tier: "Унікальна · 2 бали" },
 { t: "R", r: 1, cat: "dmg", tier: "Унікальна · 2 бали" },
 { t: "U", r: 1, cat: "dmg", tier: "Унікальна · 2 бали" },
 { t: "V", r: 1, cat: "dmg", tier: "Унікальна · 2 бали" },
 { t: "X", r: 1, cat: "dmg", tier: "Унікальна · 2 бали" },
 { t: "ζ", r: 1, cat: "dmg", tier: "Унікальна · 2 бали" },
 { t: "η", r: 1, cat: "dmg", tier: "Унікальна · 2 бали" },
 { t: "3", r: 1, cat: "heal", tier: "Унікальна · 2 бали" },
 { t: "4", r: 1, cat: "heal", tier: "Унікальна · 2 бали" },
 { t: "5", r: 1, cat: "heal", tier: "Унікальна · 2 бали" },
 { t: "6", r: 1, cat: "heal", tier: "Унікальна · 2 бали" },
 { t: "τ", r: 1, cat: "heal", tier: "Унікальна · 2 бали" },
 { t: "υ", r: 1, cat: "heal", tier: "Унікальна · 2 бали" },


 // 2: ФІОЛЕТОВА РІДКІСТЬ (r = 2, 3 бали)
 { t: "d", r: 2, cat: "dmg", tier: "Базова · 3 бали" },
 { t: "h", r: 2, cat: "heal", tier: "Базова · 3 бали" },
 { t: "p", r: 2, cat: "dmg", tier: "Базова (DoT) · 3 бали" },
 { t: "g", r: 2, cat: "heal", tier: "Базова (HoT) · 3 бали" },
 { t: "j", r: 2, cat: "dmg", tier: "Епічна · 3 бали" },
 { t: "l", r: 2, cat: "dmg", tier: "Епічна · 3 бали" },
 { t: "A", r: 2, cat: "dmg", tier: "Епічна · 3 бали" },
 { t: "C", r: 2, cat: "dmg", tier: "Епічна · 3 бали" },
 { t: "W", r: 2, cat: "dmg", tier: "Епічна · 3 бали" },
 { t: "Y", r: 2, cat: "dmg", tier: "Епічна · 3 бали" },
 { t: "Z", r: 2, cat: "dmg", tier: "Епічна · 3 бали" },
 { t: "7", r: 2, cat: "dmg", tier: "Епічна · 3 бали" },
 { t: "θ", r: 2, cat: "dmg", tier: "Епічна · 3 бали" },
 { t: "ι", r: 2, cat: "dmg", tier: "Епічна · 3 бали" },
 { t: "8", r: 2, cat: "heal", tier: "Епічна · 3 бали" },
 { t: "φ", r: 2, cat: "heal", tier: "Епічна · 3 бали" },
 { t: "χ", r: 2, cat: "heal", tier: "Епічна · 3 бали" },
 { t: "ψ", r: 2, cat: "heal", tier: "Епічна · 3 бали" },
 { t: "Γ", r: 2, cat: "heal", tier: "Епічна · 3 бали" },
 { t: "s", r: 2, cat: "spec", tier: "Спецкарта (Фіолет.–Лег.)" },
 { t: "m", r: 2, cat: "spec", tier: "Спецкарта (Фіолет.–Лег.)" },
 { t: "z", r: 2, cat: "spec", tier: "Спецкарта (Фіолет.–Лег.)" },

 // 3: ЧЕРВОНА РІДКІСТЬ (r = 3, 4 бали)
 { t: "d", r: 3, cat: "dmg", tier: "Базова · 4 бали" },
 { t: "h", r: 3, cat: "heal", tier: "Базова · 4 бали" },
 { t: "p", r: 3, cat: "dmg", tier: "Базова (DoT) · 4 бали" },
 { t: "g", r: 3, cat: "heal", tier: "Базова (HoT) · 4 бали" },
 { t: "a", r: 3, cat: "dmg", tier: "Міфічна · 4 бали" },
 { t: "q", r: 3, cat: "dmg", tier: "Міфічна · 4 бали" },
 { t: "G", r: 3, cat: "dmg", tier: "Міфічна · 4 бали" },
 { t: "L", r: 3, cat: "dmg", tier: "Міфічна · 4 бали" },
 { t: "E", r: 3, cat: "dmg", tier: "Міфічна · 4 бали" },
 { t: "0", r: 3, cat: "dmg", tier: "Міфічна · 4 бали" },
 { t: "κ", r: 3, cat: "dmg", tier: "Міфічна · 4 бали" },
 { t: "λ", r: 3, cat: "dmg", tier: "Міфічна · 4 бали" },
 { t: "μ", r: 3, cat: "dmg", tier: "Міфічна · 4 бали" },
 { t: "ν", r: 3, cat: "dmg", tier: "Міфічна · 4 бали" },
 { t: "t", r: 3, cat: "heal", tier: "Міфічна · 4 бали" },
 { t: "B", r: 3, cat: "heal", tier: "Міфічна · 4 бали" },
 { t: "K", r: 3, cat: "heal", tier: "Міфічна · 4 бали" },
 { t: "Δ", r: 3, cat: "heal", tier: "Міфічна · 4 бали" },
 { t: "Φ", r: 3, cat: "heal", tier: "Міфічна · 4 бали" },
 { t: "x", r: 3, cat: "spec", tier: "Спецкарта (Фіолет.–Лег.)" },
 { t: "f", r: 3, cat: "spec", tier: "Спецкарта (Фіолет.–Лег.)" },
 { t: "u", r: 3, cat: "spec", tier: "Спецкарта (Фіолет.–Лег.)" },
 { t: "w", r: 3, cat: "spec", tier: "Спецкарта (Фіолет.–Лег.)" },
 { t: "i", r: 3, cat: "spec", tier: "Спецкарта (Фіолет.–Лег.)" },
 { t: "Σ", r: 3, cat: "spec", tier: "Червона Спецкарта" },
 { t: "Θ", r: 3, cat: "spec", tier: "Червона Спецкарта" },
 { t: "Λ", r: 3, cat: "spec", tier: "Червона Спецкарта" },

 // 4: ЛЕГЕНДАРНА РІДКІСТЬ (r = 4, 5 балів)
 { t: "d", r: 4, cat: "dmg", tier: "Легендарна · 5 балів" },
 { t: "h", r: 4, cat: "heal", tier: "Легендарна · 5 балів" },
 { t: "p", r: 4, cat: "dmg", tier: "Легендарна (DoT) · 5 балів" },
 { t: "g", r: 4, cat: "heal", tier: "Легендарна (HoT) · 5 балів" },
 { t: "o", r: 4, cat: "dmg", tier: "Позабюджетна Легендарка" },
 { t: "v", r: 4, cat: "dmg", tier: "Позабюджетна Легендарка" },
 { t: "k", r: 4, cat: "dmg", tier: "Позабюджетна Легендарка" },
 { t: "b", r: 4, cat: "dmg", tier: "Позабюджетна Легендарка" },
 { t: "9", r: 4, cat: "dmg", tier: "Позабюджетна Легендарка" },
 { t: "ξ", r: 4, cat: "dmg", tier: "Позабюджетна Легендарка" },
 { t: "ω", r: 4, cat: "dmg", tier: "Позабюджетна Легендарка" },
 { t: "r", r: 4, cat: "heal", tier: "Позабюджетна Легендарка" },
 { t: "n", r: 4, cat: "heal", tier: "Позабюджетна Легендарка" },
 { t: "Ω", r: 4, cat: "heal", tier: "Позабюджетна Легендарка" },
 { t: "e", r: 4, cat: "spec", tier: "Легендарна Спецкарта" },
 { t: "c", r: 4, cat: "spec", tier: "Легендарна Спецкарта" },
 { t: "N", r: 4, cat: "spec", tier: "Легендарна Спецкарта" },
 { t: "Ψ", r: 4, cat: "spec", tier: "Легендарна Спецкарта" },
 { t: "Π", r: 4, cat: "spec", tier: "Легендарна Спецкарта" }
];

const ARENA_CODEX_DETAILS = {
 classic: {
 vibe: "Кам'яний вівтар із темно-смарагдовим сукном і золотими рунами.",
 mech: "Жодних глобальних модифікаторів: усі карти працюють за своїми номінальними значеннями, сорочки показують категорію карти (атака / здоров'я / спец).",
 strat: "Чиста класика DCARD — спирайся на бюджет сили, контроль ініціативи та читання сорочок суперника."
 },
 permafrost: {
 vibe: "Засніжена тундра, завірюха та крижана шайба замість столу.",
 mech: "Усе відновлення здоров'я (прямий хіл, регенерація, вампіризм, Блад, укріплення щита) ослаблене на −30% (округляється в бік мінімум 1 HP).",
 strat: "Агресивна арена: відсидітися в обороні на лікуванні набагато важче, тому прямі атаки та отрута мають вищу цінність."
 },
 forest: {
 vibe: "Мішаний ліс у бірюзовому тумані, прозорий стіл і парячі знаки питання.",
 mech: "Приховані сорочки: замість червоної, зеленої чи золотої сорочки карти суперника викладаються у бірюзовій сорочці «?» до моменту розкриття.",
 strat: "Захисник більше не бачить заздалегідь, чи летить у нього атака чи хіл — ідеальна арена для блефу щитами та дзеркалами."
 },
 swamp: {
 vibe: "Болото Гідри з очеретом, кислотними рунами, світлячками та отруйними бульбашками.",
 mech: "Усі періодичні ефекти (Отрута, Жало Скорпіона, Відновлення, Чаша Геби) діють на +1 коло довше, а на старті бою всі гравці отримують +10 HP регенерації.",
 strat: "Карти DoT/HoT стають надзвичайно вигідними, а Благословення Ра різко зростає в ціні як єдиний спосіб зняти довгу отруту."
 },
 colosseum: {
 vibe: "Багряний античний Колізей із колонами, рунічним трикутником і пелюстками.",
 mech: "1) Прямі атаки дають 25% вампіризму від завданої шкоди. 2) Поки у гравця > 60 HP, його карти здоров'я перетворюються на багряні атаки на половину свого номіналу.",
 strat: "На високому HP неможливо «перелікуватися» про запас — доводиться атакувати, а коли здоров'я впаде до ≤ 60 HP, карти хілу повертаються у звичайний режим."
 },
 mirror: {
 vibe: "Поліроване сріблясто-кришталеве дзеркало у срібній оправі на тлі індигового космосу з уламками рун.",
 mech: "Абсолютна симетрія: на старті та при кожному поповненні колоди генерується один спільний набір із 10 карт (включно з однаковою спецкартою), і кожен отримує його точну копію.",
 strat: "Нуль рандому роздачі — ти точно знаєш кожну карту в руці суперника. Перемагає прорахунок таймінгів, виманювання щитів і контроль пріоритету."
 },
 forge: {
 vibe: "Темна базальтова плита з розпеченими тріщинами магми та ковальським рунічним колом на тлі вугільного горнила з летячими іскрами.",
 mech: `1) Усі прямі атаки завдають на +15% більше шкоди. 2) Раз за матч кожен дуелянт може натиснути кнопку «${UI_IC.anvil} Перекувати (1)» і перетворити 1 карту в руці на карту вищої рідкості (або загартувати легендарну на +8 сили).`,
 strat: "Вигідно перекувати слабку зелену/синю карту в критичний момент або перетворити червону карту на потужну позабюджетну легендарку, а також грати агресивно під бонусом +15% шкоди."
 },
 eclipse: {
 vibe: "Стародавнє святилище Сонця та Місяця, де кожні 2 кола золотий сонячний вівтар змінюється на глибокий сапфірово-фіолетовий сутінок із півмісяцем і зорями.",
 mech: "День (кола 1–2, 5–6...): лікування та регенерація посилені на +25%, але шкода ослаблена на −25%. Ніч (кола 3–4, 7–8...): шкода посилена на +25%, але лікування ослаблене на −25%.",
 strat: "У День бережи червоні удари й лікуйся на максимум, а в Ніч — переходь у тотальний наступ, адже лікування ріжеться на −25%."
 },
 pantheon: {
 vibe: "Величний біломармуровий вівтар із інкрустованими золотими сузір'ями, лавровим вінком по обідку та небесною височінню на заході сонця із золотими колонами й пір'їнами.",
 mech: "Поверх стандартної руки за Бюджетом сили кожен дуелянт безкоштовно (поза балами) отримує +1 випадкову Легендарну атаку та +1 випадкове Легендарне лікування (рука збільшується до 12 карт: 7 атаки + 4 лікування + 1 спецкарта).",
 strat: "Усі за столом мають потужні легендарні козирі: бережи Щит Персея, Егіду чи Громовицю під вирішальний обмін ультимейтами та будь готовий до миттєвого відхілу ворога."
 },
 astral: {
 vibe: "Нескінченний космічний простір із райдужним сузір'ям на столі, яке переливається всіма кольорами веселки та змінює колір кристала-призми щокола.",
 mech: `Сузір'я Рідкостей: щокола призма налаштовується на один із 5 кольорів рідкості (${UI_IC.orbGreen} Зелена &rarr; ${UI_IC.orbBlue} Синя &rarr; ${UI_IC.orbPurple} Фіолетова &rarr; ${UI_IC.orbRed} Червона &rarr; ${UI_IC.orbGold} Легендарна). Будь-яка карта цього кольору входить у резонанс і отримує +35% до сили шкоди або лікування!`,
 strat: "Не зливай усе підряд: у зелене коло навіть простий Кремінь або Оливка отримують +35% потужності, а в золоте коло легендарні артефакти стають нищівними."
 }
};


const BK = {
 d: ["#ff4a55", "#4a0b16", "#12030a"],
 h: ["#3ee07a", "#06381f", "#021209"],
 s: ["#ffd02a", "#4a3606", "#150e02"],
 q: ["#2dd4bf", "#0d4f4b", "#041c1b"]
};

// ===== СИСТЕМА ВИПАДКОВИХ АРЕН =====
const ARENAS = [
 {
 id: "classic",
 name: "Класична арена",
 icon: UI_IC.pillar,
 col: "#e2b86b",
 bg: "radial-gradient(circle, rgba(212,162,74,0.38) 0%, rgba(12,18,28,0.95) 68%, #04060a 100%)",
 shortRule: `${UI_IC.scale} Стандартні правила`,
 rule: "Звичайна дуель артефактів без модифікаторів",
 healMult: 1,
 blindCards: false
 },
 {
 id: "permafrost",
 name: "Вічні мерзлоти",
 icon: UI_IC.snow,
 col: "#7dd3fc",
 bg: "radial-gradient(circle, rgba(56,189,248,0.45) 0%, rgba(6,18,32,0.94) 68%, #02060c 100%)",
 shortRule: `${UI_IC.snow} Хіл −30%`,
 rule: "Усе відновлення здоров'я ослаблене на 30%",
 healMult: 0.70,
 blindCards: false
 },
 {
 id: "forest",
 name: "Таємний ліс",
 icon: UI_IC.forest,
 col: "#5eead4",
 bg: "radial-gradient(circle, rgba(45,212,191,0.42) 0%, rgba(5,26,25,0.94) 68%, #020a0a 100%)",
 shortRule: `${UI_IC.mystery} Карти приховані`,
 rule: "Невідомо, які карти кидає суперник (сорочка «?»)",
 healMult: 1,
 blindCards: true
 },
 {
 id: "swamp",
 name: "Болото Гідри",
 icon: UI_IC.skull,
 col: "#a3e635",
 bg: "radial-gradient(circle, rgba(132,204,22,0.42) 0%, rgba(6,24,14,0.95) 68%, #020805 100%)",
 shortRule: `${UI_IC.skull} Ефекти +1 коло · Старт +10 реген`,
 rule: "Отрута та Відновлення діють на +1 коло довше, а на старті всі отримують +10 HP регенерації",
 healMult: 1,
 blindCards: false,
 durBonus: 1
 },
 {
 id: "colosseum",
 name: "Кривавий Колізей",
 icon: UI_IC.blood,
 col: "#fb7185",
 bg: "radial-gradient(circle, rgba(225,29,72,0.46) 0%, rgba(28,6,12,0.95) 68%, #080204 100%)",
 shortRule: `${UI_IC.blood} 25% вампіризм · Хіл при >60 HP → атака`,
 rule: "Прямі атаки дають 25% вампіризму; поки HP > 60, карти здоров'я б'ють на половину номіналу",
 healMult: 1,
 blindCards: false,
 vampPct: 0.25
 },
 {
 id: "mirror",
 name: "Дзеркальна арена",
 icon: UI_IC.mirror,
 col: "#f8fafc",
 bg: "radial-gradient(circle, rgba(203,213,225,0.34) 0%, rgba(23,32,61,0.95) 68%, #060814 100%)",
 shortRule: `${UI_IC.mirror} Однакові 10 карт у всіх`,
 rule: "Усі гравці отримують точну копію одного набору з 10 карт — чиста психологія, блеф і таймінги",
 healMult: 1,
 blindCards: false,
 mirrorHands: true
 },
 {
 id: "forge",
 name: "Кузня Гефеста",
 icon: UI_IC.fire,
 col: "#fb923c",
 bg: "radial-gradient(circle, rgba(251,146,60,0.42) 0%, rgba(36,10,6,0.95) 68%, #0a0201 100%)",
 shortRule: `${UI_IC.fire} Шкода +15% · Перековка 1 карти`,
 rule: "Усі прямі атаки завдають на +15% більше шкоди; раз за матч можна перекувати 1 карту на +1 рідкість вище",
 dmgMult: 1.15,
 healMult: 1,
 blindCards: false
 },
 {
 id: "eclipse",
 name: "Храм Світил",
 icon: UI_IC.eclipse,
 col: "#fbbf24",
 bg: "radial-gradient(circle, rgba(251,191,36,0.38) 0%, rgba(25,19,61,0.95) 68%, #04040e 100%)",
 shortRule: `${UI_IC.sun} День: Хіл +25% / Шкода −25% · ${UI_IC.moon} Ніч: Шкода +25% / Хіл −25%`,
 rule: "Кожні 2 кола змінюється пора доби: День дає Хіл +25% і Шкоду −25%, Ніч дає Шкоду +25% і Хіл −25%",
 dmgMult: 0.75,
 healMult: 1.25,
 blindCards: false
 },
 {
 id: "pantheon",
 name: "Пантеон Титанів",
 icon: UI_IC.crown,
 col: "#fde047",
 bg: "radial-gradient(circle, rgba(253,224,71,0.44) 0%, rgba(56,34,10,0.94) 68%, #0c0602 100%)",
 shortRule: `${UI_IC.crown} +1 Легендарна атака · +1 Легендарний хіл (поза очками)`,
 rule: "Кожен дуелянт безкоштовно отримує +1 Легендарну карту шкоди та +1 Легендарну карту здоров'я поза бюджетом (12 карт у руці)",
 healMult: 1,
 blindCards: false,
 pantheonBonus: true
 },
 {
 id: "astral",
 name: "Астральний вимір",
 icon: UI_IC.astral,
 col: "#e879f9",
 bg: "radial-gradient(circle, rgba(192,132,252,0.42) 0%, rgba(20,16,52,0.95) 68%, #04030e 100%)",
 shortRule: `${UI_IC.astral} Сузір'я Рідкостей (+35% резонанс)`,
 rule: "Кристал-призма щокола змінює колір рідкості (Зелена → Синя → Фіолетова → Червона → Легендарна). Карти цього кольору б'ють/лікують на +35% сильніше!",
 healMult: 1,
 dmgMult: 1,
 blindCards: false
 }
];
let CUR_ARENA = null;
const astralResMult = c => (CUR_ARENA && CUR_ARENA.id === "astral" && c && typeof ASTRAL_RARITY !== "undefined" && c.r === ASTRAL_RARITY) ? 1.35 : 1;
const healAmt = (v, c = null) => Math.max(1, Math.round(v * (CUR_ARENA ? CUR_ARENA.healMult : 1) * astralResMult(c)));
const dmgAmt = (v, c = null) => Math.max(1, Math.round(v * (CUR_ARENA && CUR_ARENA.dmgMult ? CUR_ARENA.dmgMult : 1) * astralResMult(c)));
const durBonus = () => (CUR_ARENA && CUR_ARENA.durBonus) ? CUR_ARENA.durBonus : 0;
const HEAL_CARDS = "hgrtnHFBKT1234568πρστυφχψΓΔΦΩ";

const ULT_DATA = {
 s: { name: "ЕГІДА: НЕПОХИТНИЙ БАСТІОН", desc: "Повний блок атаки та нищівний контрудар!", col: "#38bdf8", bg: "rgba(56, 189, 248, 0.55)", s: "shield" },
 f: { name: "ГЕФЕСТ: МАГМА БОГІВ", desc: "Нищівне полум'я з бонусом +45% шкоди!", col: "#fb923c", bg: "rgba(251, 146, 60, 0.55)", s: "thunder" },
 m: { name: "ЩИТ ПЕРСЕЯ: ВІДБИТТЯ", desc: "100% шкоди або отрути дзеркально летить назад!", col: "#c084fc", bg: "rgba(192, 132, 252, 0.55)", s: "shield" },
 z: { name: "ГРОМОВИЦЯ: ШОКОВИЙ РОЗРЯД", desc: "Удар блискавкою та оглушення супротивника!", col: "#facc15", bg: "rgba(250, 204, 21, 0.55)", s: "stun" },
 x: { name: "ТАНАТОС: ЖНЕЦЬ ДУШ", desc: "Подвійна шкода по слабкому ворогу!", col: "#e2e8f0", bg: "rgba(226, 232, 240, 0.55)", s: "slice" },
 w: { name: "ДИВНА УГОДА: ОБМІН РУКАМИ", desc: "Повний обмін усіма картами між дуелянтами!", col: "#a855f7", bg: "rgba(168, 85, 247, 0.65)", s: "swap" },
 i: { name: "КРИЖАНИЙ ЩИТ: ВІЧНА МЕРЗЛОТА", desc: "Ворог слабшає вдвічі, а його спецкарта замерзає!", col: "#7dd3fc", bg: "rgba(125, 211, 252, 0.5)", s: "ice" },
 c: { name: "МІМІКРІЯ: РТУТНИЙ ДВІЙНИК", desc: "Копіює карту опонента з посиленням 125%!", col: "#fbbf24", bg: "rgba(251, 191, 36, 0.55)", s: "swap" },
 Σ: { name: "ДЗЕРКАЛО НАРЦИСА", desc: "Пастка на лікування: краде 50% хілу та б’є −16 HP, або дарує +12 HP!", col: "#34d399", bg: "rgba(52, 211, 153, 0.45)", s: "shield" },
 Θ: { name: "КАЙДАНИ КРОНОСА", desc: "−15 HP та «Окови часу»: таймери стоять, сила й хіл −20%!", col: "#7dd3fc", bg: "rgba(56, 189, 248, 0.5)", s: "ice" },
 Λ: { name: "НИТЬ АРІАДНИ", desc: "−60% вхідної шкоди в дуелі та перенесення дебафа ворогу!", col: "#fde047", bg: "rgba(250, 204, 21, 0.45)", s: "swap" },
 Ψ: { name: "СКИПЕТР АЇДА", desc: "Жертва −15 HP заради удару −38 HP і віддачі темряви при ≤ 35 HP!", col: "#e879f9", bg: "rgba(147, 51, 234, 0.58)", s: "thunder" },
 Π: { name: "КОЛЕСО ФОРТУНИ", desc: "Повне оновлення руки та +15 до першої атаки або лікування!", col: "#facc15", bg: "rgba(245, 158, 11, 0.55)", s: "coins" }
};

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



const EFFECT_DEFS = {
 // Позитивні ефекти (бафи — не знімаються Сонцем)
 sh: { kind: "positive", col: "#38bdf8", name: `${UI_IC.shield} Панцир Черепахи`, active: p => p.shellDef > 0 },
 th: { kind: "positive", col: "#e11d48", name: `${UI_IC.rose} Шипи`, active: p => p.thorn > 0 },
 bl: { kind: "positive", col: "#f87171", name: `${UI_IC.heart} Блад`, active: p => (p.fx || []).some(f => f.blad) },
 rg: { kind: "positive", col: "#4ade80", name: `${UI_IC.plus} Відновлення`, active: p => (p.fx || []).some(f => f.t === "g" && !f.blad) },
 bi: { kind: "positive", col: "#fb923c", name: `${UI_IC.fireShield} Імунітет до горіння`, active: p => (p.burnImmune || 0) > 0 },
 lr: { kind: "positive", col: "#fde047", name: `${UI_IC.tree} Коріння Життя`, active: p => (p.lifeRoot || 0) > 0 },
 fb: { kind: "positive", col: "#facc15", name: `${UI_IC.wheel} Благословення Фортуни`, active: p => (p.fortuneBonus || 0) > 0 },

 // Негативні ефекти (дебафи — перевіряються в hasAnyDebuff і повністю знімаються «Благословенням Ра»)
 fz: { kind: "negative", col: "#7dd3fc", name: `${UI_IC.snow} Крижаний Щит`, active: p => !!p.frost, clear: p => { p.frost = 0; } },
 pz: { kind: "negative", col: "#a3e635", name: `${UI_IC.skull} Отрута`, active: p => (p.fx || []).some(f => f.t === "p"), clear: p => { p.fx = (p.fx || []).filter(f => f.t !== "p" || f.uncurable); } },
 bn: { kind: "negative", col: "#fb923c", name: `${UI_IC.fire} Горіння`, active: p => (p.fx || []).some(f => f.t === "b"), clear: p => { p.fx = (p.fx || []).filter(f => f.t !== "b"); } },
 wk: { kind: "negative", col: "#fb7185", name: `${UI_IC.heart} Приборкання Чирви`, active: p => !!p.weak, clear: p => { p.weak = false; } },
 ib: { kind: "negative", col: "#7dd3fc", name: `${UI_IC.snow}${UI_IC.swords} Крижана голка`, active: p => (p.atkDebuff || 0) > 0, clear: p => { p.atkDebuff = 0; } },
 hb: { kind: "negative", col: "#2dd4bf", name: `${UI_IC.chain} Кайдани Фантома`, active: p => (p.noHeal || 0) > 0, clear: p => { p.noHeal = 0; p.nhAge = 0; } },
 sl: { kind: "negative", col: "#a855f7", name: `${UI_IC.hourglass} Смола Аїда`, active: p => (p.slow || 0) > 0, clear: p => { p.slow = 0; } },
 rh: { kind: "negative", col: "#f43f5e", name: `${UI_IC.brokenHeart} Зворотне зцілення`, active: p => (p.revHeal || 0) > 0, clear: p => { p.revHeal = 0; } },
 stn: { kind: "negative", col: "#94a3b8", name: `${UI_IC.stone} Скам'яніння карти`, active: p => (p.hand || []).some(c => (c.pz || 0) > 0), clear: p => { (p.hand || []).forEach(c => { c.pz = 0; }); } },
 ds: { kind: "negative", col: "#c084fc", name: `${UI_IC.vortex} Дезорієнтація`, active: p => (p.disorient || 0) > 0, clear: p => { p.disorient = 0; p.dsAge = 0; } },
 sc: { kind: "negative", col: "#f43f5e", name: `${UI_IC.chalice} Жертовна нитка`, active: p => (p.fx || []).some(f => f.t === "sc"), clear: p => { p.fx = (p.fx || []).filter(f => f.t !== "sc"); } },
 tl: { kind: "negative", col: "#38bdf8", name: `${UI_IC.chrono} Окови часу`, active: p => (p.timeLock || 0) > 0, clear: p => { p.timeLock = 0; } }
};
const ST_COL = Object.fromEntries(Object.entries(EFFECT_DEFS).map(([k, v]) => [k, v.col]));
const NEGATIVE_KEYS = Object.keys(EFFECT_DEFS).filter(k => EFFECT_DEFS[k].kind === "negative");
const hasAnyDebuff = p => !!p && NEGATIVE_KEYS.some(k => EFFECT_DEFS[k].active(p));
const hasAnyStatus = p => !!p && Object.keys(EFFECT_DEFS).some(k => EFFECT_DEFS[k].active(p));
function clearAllNegativeEffects(p) {
 if (!p) return;
 NEGATIVE_KEYS.forEach(k => EFFECT_DEFS[k].clear(p));
}


const SUITS = [{ k: "spade", icon: UI_IC.suitSpade, n: "МІЗЕР", c: "#a78bfa" }, { k: "heart", icon: UI_IC.suitHeart, n: "ВЗЯТКА", c: "#fb7185" }, { k: "diamond", icon: UI_IC.suitDiamond, n: "ЗОЛОТИЙ ЗАРЯД", c: "#fbbf24" }, { k: "club", icon: UI_IC.suitClub, n: "ШТРАФ", c: "#34d399" }];

// ===== ДАРИ ВІВТАРЯ (РОУГЛАЙК-РЕЛІКВІЇ ТУРНІРУ З УНІКАЛЬНИМИ SVG) =====
const RELIC_SVG = {
  cup_asclepius: `<svg viewBox="0 0 36 36"><defs><linearGradient id="rcAscG" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fef08a"/><stop offset="50%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#92400e"/></linearGradient><radialGradient id="rcAscE" cx="50%" cy="45%" r="55%"><stop offset="0%" stop-color="#a7f3d0"/><stop offset="55%" stop-color="#10b981"/><stop offset="100%" stop-color="#064e3b"/></radialGradient></defs><ellipse class="ic-pulse" cx="18" cy="9" rx="9.5" ry="3.5" fill="url(#rcAscE)" stroke="#6ee7b7" stroke-width="1"/><path d="M8.5 9h19c0 8.5-4.2 13-9.5 13S8.5 17.5 8.5 9z" fill="url(#rcAscG)" stroke="#fffbeb" stroke-width="1.2"/><rect x="16.4" y="22" width="3.2" height="7.5" fill="#d97706"/><path d="M11 32h14l-2-2.5H13z" fill="url(#rcAscG)" stroke="#fffbeb" stroke-width="0.9"/><path class="ic-sway" d="M23 30c-8 0-8.5-4.5-3.5-5.5 5-1 4-5.5-2-6.5-4.5-.8-5.5-4-1.5-6" fill="none" stroke="#34d399" stroke-width="2.4" stroke-linecap="round"/><circle cx="16" cy="11.5" r="1.7" fill="#a7f3d0" stroke="#064e3b" stroke-width="0.7"/></svg>`,

  whetstone_ares: `<svg viewBox="0 0 36 36"><defs><linearGradient id="rcWhetS" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#64748b"/><stop offset="55%" stop-color="#334155"/><stop offset="100%" stop-color="#0f172a"/></linearGradient><linearGradient id="rcWhetB" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stop-color="#cbd5e1"/><stop offset="50%" stop-color="#ffffff"/><stop offset="100%" stop-color="#94a3b8"/></linearGradient></defs><polygon points="5,26 24,14 31,20 12,32" fill="url(#rcWhetS)" stroke="#94a3b8" stroke-width="1.2" stroke-linejoin="round"/><path d="M11 25l4-2.5M17 21.5l3-2" stroke="#f43f5e" stroke-width="1.5" stroke-linecap="round"/><polygon points="7,12 27,6 29,11 9,17" fill="url(#rcWhetB)" stroke="#e2e8f0" stroke-width="1" stroke-linejoin="round"/><g class="ic-spark" stroke="#fde047" stroke-width="1.6" stroke-linecap="round"><path d="M21 15l3-4M25 16l4-1M18 14l-1-4"/><circle cx="24" cy="10" r="1.4" fill="#fff" stroke="none"/><circle cx="29" cy="14" r="1.2" fill="#fbbf24" stroke="none"/></g></svg>`,

  trap_hermes: `<svg viewBox="0 0 36 36"><defs><linearGradient id="rcHerS" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#7dd3fc"/><stop offset="50%" stop-color="#0284c7"/><stop offset="100%" stop-color="#1e3a8a"/></linearGradient><linearGradient id="rcHerW" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fef08a"/><stop offset="100%" stop-color="#d97706"/></linearGradient></defs><g class="ic-float"><path d="M9 13C4 10 2 6 3 4c4 1 7 4 8 7zM27 13c5-3 7-7 6-9-4 1-7 4-8 7z" fill="url(#rcHerW)" stroke="#fffbeb" stroke-width="0.9"/><path d="M18 5L9 9v8c0 6.5 3.8 11.5 9 13.5 5.2-2 9-7 9-13.5V9L18 5z" fill="url(#rcHerS)" stroke="#e0f2fe" stroke-width="1.4"/><polygon class="ic-pulse" points="19,10 14,18 18,18 16.5,25 22.5,16.5 18.5,16.5" fill="#fde047" stroke="#fff" stroke-width="0.6"/></g></svg>`,

  amulet_stamina: `<svg viewBox="0 0 36 36"><defs><linearGradient id="rcStamB" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f6c58e"/><stop offset="50%" stop-color="#b45309"/><stop offset="100%" stop-color="#451a03"/></linearGradient><radialGradient id="rcStamH" cx="45%" cy="40%" r="60%"><stop offset="0%" stop-color="#fda4af"/><stop offset="50%" stop-color="#e11d48"/><stop offset="100%" stop-color="#881337"/></radialGradient></defs><circle cx="18" cy="5.5" r="2.5" fill="none" stroke="#fde68a" stroke-width="1.6"/><polygon points="18,7.5 29,13 27,26 18,32.5 9,26 7,13" fill="url(#rcStamB)" stroke="#fde68a" stroke-width="1.4" stroke-linejoin="round"/><path class="ic-pulse" d="M18 27s-7-4.5-7-9.8c0-3 2.3-5 4.8-5 1.5 0 2.7.8 2.2 2.1-.5-1.3.7-2.1 2.2-2.1 2.5 0 4.8 2 4.8 5 0 5.3-7 9.8-7 9.8z" fill="url(#rcStamH)" stroke="#ffe4e6" stroke-width="1"/></svg>`,

  fang_basilisk: `<svg viewBox="0 0 36 36"><defs><linearGradient id="rcBasF" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fef9c3"/><stop offset="48%" stop-color="#d9f99d"/><stop offset="100%" stop-color="#365314"/></linearGradient></defs><path d="M7 9c2.5-4 8.5-5 12.5-1.5L12 17c-4-2-6.5-5-5-8z" fill="#1a2e05" stroke="#a3e635" stroke-width="1.2"/><path d="M18 7C26.5 11.5 31 20 31.5 31.5 22.5 26 15 19.5 11 14.5z" fill="url(#rcBasF)" stroke="#ecfccb" stroke-width="1.2" stroke-linejoin="round"/><path class="ic-pulse" d="M15 12c5.5 3.5 10 9 12.5 15" fill="none" stroke="#84cc16" stroke-width="2" stroke-linecap="round"/><path class="ic-drip" d="M31.5 31.5c1.6 2 2 3 0 4-2-1-1.6-2 0-4z" fill="#a3e635" stroke="#ecfccb" stroke-width="0.7"/></svg>`,

  blade_nosferatu: `<svg viewBox="0 0 36 36"><defs><linearGradient id="rcNosB" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stop-color="#881337"/><stop offset="50%" stop-color="#f43f5e"/><stop offset="100%" stop-color="#ffe4e6"/></linearGradient></defs><g transform="rotate(8 18 18)"><polygon points="18,3 23,11 20.5,24 15.5,24 13,11" fill="url(#rcNosB)" stroke="#fecdd3" stroke-width="1.1" stroke-linejoin="round"/><line x1="18" y1="5" x2="18" y2="23" stroke="#fff" stroke-width="1.1" opacity="0.8"/><path d="M10 24h16l-1.5 2.8h-13z" fill="#fbbf24" stroke="#78350f" stroke-width="0.9"/><rect x="16.2" y="26.8" width="3.6" height="5.5" rx="1.2" fill="#450a0a" stroke="#f43f5e" stroke-width="0.8"/></g><path class="ic-drip" d="M12 28c1.5 2.2 2 3.2 0 4.4-2-1.2-1.5-2.2 0-4.4z" fill="#e11d48" stroke="#fecdd3" stroke-width="0.7"/></svg>`,

  breath_boreas: `<svg viewBox="0 0 36 36"><defs><radialGradient id="rcBorG" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#ffffff"/><stop offset="55%" stop-color="#7dd3fc"/><stop offset="100%" stop-color="#0369a1"/></radialGradient></defs><g class="ic-spin" fill="none" stroke-linecap="round"><path d="M18 4a14 14 0 0 1 13.5 10.5A10 10 0 0 1 20 27.5" stroke="#bae6fd" stroke-width="2.4"/><path d="M18 32A14 14 0 0 1 4.5 21.5 10 10 0 0 1 16 8.5" stroke="#38bdf8" stroke-width="2.4"/></g><g class="ic-pulse" stroke="#e0f2fe" stroke-width="1.8" stroke-linecap="round"><line x1="18" y1="10" x2="18" y2="26"/><line x1="11" y1="14" x2="25" y2="22"/><line x1="25" y1="14" x2="11" y2="22"/><circle cx="18" cy="18" r="3" fill="url(#rcBorG)" stroke="none"/></g></svg>`,

  depth_silence: `<svg viewBox="0 0 36 36"><defs><linearGradient id="rcSilM" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ffffff"/><stop offset="55%" stop-color="#cbd5e1"/><stop offset="100%" stop-color="#475569"/></linearGradient></defs><g opacity="0.65" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"><line x1="10" y1="27" x2="16" y2="21"/><line x1="21" y1="16" x2="27" y2="10"/><line x1="15" y1="19" x2="22" y2="22" stroke="#f43f5e" stroke-width="1.5"/></g><path class="ic-float" d="M22 5.5A12.5 12.5 0 1 0 29.5 26 10 10 0 1 1 22 5.5z" fill="url(#rcSilM)" stroke="#f8fafc" stroke-width="1.2"/><g class="ic-spark" fill="#fde047"><circle cx="27" cy="9" r="1.4"/><circle cx="31" cy="15" r="1.1"/><circle cx="24" cy="15" r="1.2"/></g></svg>`,

  seal_berserk: `<svg viewBox="0 0 36 36"><defs><radialGradient id="rcBerG" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fef08a"/><stop offset="55%" stop-color="#f97316"/><stop offset="100%" stop-color="#991b1b"/></radialGradient></defs><circle class="ic-pulse" cx="18" cy="18" r="14" fill="url(#rcBerG)" fill-opacity="0.35" stroke="#fbbf24" stroke-width="1.8" stroke-dasharray="6 3"/><path d="M11 26L25 10M25 26L11 10" stroke="#fde047" stroke-width="2.6" stroke-linecap="round"/><path d="M18 6v24M13 11l5-5 5 5M13 25l5 5 5-5" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

  echo_altar: `<svg viewBox="0 0 36 36"><defs><radialGradient id="rcEchC" cx="40%" cy="35%" r="60%"><stop offset="0%" stop-color="#ffffff"/><stop offset="45%" stop-color="#fde047"/><stop offset="100%" stop-color="#b45309"/></radialGradient></defs><circle class="ic-spin" cx="18" cy="18" r="14.5" fill="none" stroke="#fde047" stroke-width="1.2" stroke-dasharray="4 3" opacity="0.75"/><circle class="ic-pulse" cx="18" cy="18" r="10.5" fill="none" stroke="#fef08a" stroke-width="1.5"/><polygon points="18,8 25,18 18,28 11,18" fill="url(#rcEchC)" stroke="#fffbeb" stroke-width="1.3"/><circle cx="18" cy="18" r="2.6" fill="#fff"/></svg>`,

  blood_altar: `<svg viewBox="0 0 36 36"><defs><linearGradient id="rcBldA" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#3f3f46"/><stop offset="100%" stop-color="#09090b"/></linearGradient></defs><path class="ic-pulse" d="M18 3c2 3.5-1.5 5.5 0 8.5 1.8-1.2 2.6-3.2 2.6-3.2 2.4 2.5 3.2 5.8.8 8.7-2 2.2-6.2 2.2-8.2 0-2-2.4-1.2-6.4 1.6-8.8 0 2 1.6 2.8 1.6 2.8-1.2-2.8 0-5.8 1.6-8z" fill="#f97316" stroke="#fde047" stroke-width="0.9"/><path d="M7 18h22l-2 13H9z" fill="url(#rcBldA)" stroke="#fbbf24" stroke-width="1.3" stroke-linejoin="round"/><rect x="5" y="16" width="26" height="3" rx="1" fill="#b45309" stroke="#fde047" stroke-width="0.9"/><path class="ic-pulse" d="M18 28.5s-4.5-2.8-4.5-6c0-1.8 1.4-3 3-3 1 0 1.8.5 1.5 1.3-.3-.8.5-1.3 1.5-1.3 1.6 0 3 1.2 3 3 0 3.2-4.5 6-4.5 6z" fill="#e11d48" stroke="#fda4af" stroke-width="0.8"/></svg>`,

  alchemical_crucible: `<svg viewBox="0 0 36 36"><defs><linearGradient id="rcAlcC" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fde047"/><stop offset="55%" stop-color="#d97706"/><stop offset="100%" stop-color="#78350f"/></linearGradient><linearGradient id="rcAlcG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e9d5ff"/><stop offset="50%" stop-color="#a855f7"/><stop offset="100%" stop-color="#581c87"/></linearGradient></defs><polygon class="ic-float" points="18,3 23,10 18,16 13,10" fill="url(#rcAlcG)" stroke="#f3e8ff" stroke-width="1.1"/><path d="M7 16h22c0 8.5-4.5 13-11 13S7 24.5 7 16z" fill="url(#rcAlcC)" stroke="#fffbeb" stroke-width="1.3"/><path d="M11 32h14l-2-3H13z" fill="#b45309" stroke="#fde047" stroke-width="0.9"/><g class="ic-spark" fill="#fde047"><circle cx="10" cy="9" r="1.4"/><circle cx="26" cy="8" r="1.5"/><circle cx="24" cy="13" r="1.1"/></g></svg>`
};

const ALTAR_RELICS = [
  // Бронзові дари
  { id: "cup_asclepius", tier: "bronze", tierName: "Бронзовий дар", name: "Кубок Асклепія", desc: "Усе твоє лікування та регенерація дають +20% HP.", icon: RELIC_SVG.cup_asclepius },
  { id: "whetstone_ares", tier: "bronze", tierName: "Бронзовий дар", name: "Оселок Ареса", desc: "Усі звичайні зелені та сині карти шкоди отримують +4 до атаки.", icon: RELIC_SVG.whetstone_ares },
  { id: "trap_hermes", tier: "bronze", tierName: "Бронзовий дар", name: "Пастка Гермеса", desc: "Першу атаку в кожному бою ти зустрічаєш із захисним щитом на 12 HP.", icon: RELIC_SVG.trap_hermes },
  { id: "amulet_stamina", tier: "bronze", tierName: "Бронзовий дар", name: "Амулет Витривалості", desc: "Збільшує твій максимальний та стартовий запас здоров’я зі 100 до 115 HP.", icon: RELIC_SVG.amulet_stamina },

  // Срібні дари
  { id: "fang_basilisk", tier: "silver", tierName: "Срібний дар", name: "Ікло Василіска", desc: "Отрута діє на +1 коло довше і не знімається звичайним очищенням.", icon: RELIC_SVG.fang_basilisk },
  { id: "blade_nosferatu", tier: "silver", tierName: "Срібний дар", name: "Клинок Носферату", desc: "Усі твої прямі атаки отримують +15% вампіризму.", icon: RELIC_SVG.blade_nosferatu },
  { id: "breath_boreas", tier: "silver", tierName: "Срібний дар", name: "Подих Борея", desc: "На початку кожного 3-го кола на випадкового ворога накладається Заморозка (−50% атаки).", icon: RELIC_SVG.breath_boreas },
  { id: "depth_silence", tier: "silver", tierName: "Срібний дар", name: "Глибина Тиші", desc: "Карти, зіграні в ролі Захисника (другим номером), отримують +6 до сили/хілу.", icon: RELIC_SVG.depth_silence },

  // Золоті / Прокляті дари
  { id: "seal_berserk", tier: "gold", tierName: "Золотий дар", name: "Печать Берсерка", desc: "Коли твоє здоров’я нижче 40 HP, усі твої атаки завдають +35% шкоди.", icon: RELIC_SVG.seal_berserk },
  { id: "echo_altar", tier: "gold", tierName: "Золотий дар", name: "Ехо Вівтаря", desc: "Раз за матч перша зіграна тобою Спецкарта не згорає, а повертається в руку.", icon: RELIC_SVG.echo_altar },
  { id: "blood_altar", tier: "gold", tierName: "Проклятий дар", name: "Кровавий Вівтар", desc: "Ти починаєш бій із 75 HP замість 100, але всі твої червоні та легендарні карти б’ють на +12 HP сильніше.", icon: RELIC_SVG.blood_altar },
  { id: "alchemical_crucible", tier: "gold", tierName: "Золотий дар", name: "Алхімічний Тигель", desc: "На старті кожного матчу 2 випадкові зелені карти в твоїй руці підвищуються до Фіолетових.", icon: RELIC_SVG.alchemical_crucible }
];

const RELIC_BY_ID = Object.fromEntries(ALTAR_RELICS.map(r => [r.id, r]));


// ===== КАМПАНІЯ «ШЛЯХ АРЕН» — ГЛАВА I: АРХІПЕЛАГ МАРМУРОВОГО ПОЛІСА (2000×1250 CROWNFALL OVERWORLD) =====
const CAMPAIGN_CHAPTER_1 = [
  {
    id: 1,
    lvl: 1,
    numLabel: "1",
    title: "Ворота Поліса",
    boss: "Новобранець",
    crestIdx: 1,
    bannerIdx: 0,
    hp: 70,
    shield: 0,
    x: 310,
    y: 990,
    next: [2],
    deck: [
      { t: "I", r: 0 }, // Палиця
      { t: "J", r: 0 }, // Ніж
      { t: "d", r: 0 }, // Кремінь
      { t: "M", r: 0 }, // Сокира
      { t: "O", r: 0 }, // Кастет
      { t: "S", r: 0 }, // Камінь Сизифа
      { t: "1", r: 0 }, // Яблуко
      { t: "2", r: 0 }, // Хліб
      { t: "h", r: 0 }, // Оливка
      { t: "g", r: 0 }  // Мирт
    ],
    rewardType: "banner",
    rewardId: "marble",
    rewardLabel: "Фон плашки: «Античний Мармур»",
    lore: "Перший крок на смарагдові схили Поліса. Переможи Новобранця у навчальній дуелі!"
  },
  {
    id: 2,
    lvl: 2,
    numLabel: "2",
    title: "Алея Колон",
    boss: "Списник",
    crestIdx: 1,
    bannerIdx: 1,
    hp: 75,
    shield: 0,
    x: 540,
    y: 990,
    next: [3, 11],
    deck: [
      { t: "J", r: 0 }, // Ніж
      { t: "d", r: 0 }, // Кремінь
      { t: "M", r: 0 }, // Сокира
      { t: "Q", r: 1 }, // Дротик
      { t: "d", r: 1 }, // Кинджал
      { t: "p", r: 0 }, // Цикута
      { t: "1", r: 0 }, // Яблуко
      { t: "h", r: 0 }, // Оливка
      { t: "3", r: 1 }, // Трави
      { t: "g", r: 0 }  // Мирт
    ],
    rewardType: "avatar",
    rewardId: "hoplite",
    rewardLabel: "Аватар: «Шолом Гопліта»",
    lore: "Серед мармурових колон Списник тримає дистанцію влучними дротиками."
  },
  {
    id: 11,
    lvl: 11,
    numLabel: "I",
    isSide: true,
    reqLvl: 2,
    title: "Занедбаний Вівтар",
    boss: "Тінь Статуї",
    crestIdx: 2,
    bannerIdx: 4,
    hp: 85,
    shield: 0,
    x: 340,
    y: 540,
    next: [],
    deck: [
      { t: "d", r: 0 }, // Кремінь
      { t: "O", r: 0 }, // Кастет
      { t: "p", r: 0 }, // Цикута
      { t: "p", r: 1 }, // Жовч
      { t: "y", r: 1 }, // Крижана голка
      { t: "S", r: 0 }, // Камінь Сизифа
      { t: "h", r: 0 }, // Оливка
      { t: "g", r: 0 }, // Мирт
      { t: "F", r: 1 }, // Фіал Асклепія
      { t: "m", r: 2 }  // Щит Персея
    ],
    rewardType: "banner",
    rewardId: "jade",
    rewardLabel: "Фон плашки: «Нефритовий Ліс»",
    lore: "Бічна таємна стежка до стародавнього смарагдового вівтаря!"
  },
  {
    id: 3,
    lvl: 3,
    numLabel: "3",
    title: "Оливковий Гай",
    boss: "Травник",
    crestIdx: 2,
    bannerIdx: 4,
    hp: 80,
    shield: 0,
    x: 740,
    y: 850,
    next: [4],
    deck: [
      { t: "d", r: 0 }, // Кремінь
      { t: "O", r: 0 }, // Кастет
      { t: "V", r: 1 }, // Булава
      { t: "p", r: 0 }, // Цикута
      { t: "P", r: 1 }, // Жало Скорпіона
      { t: "D", r: 1 }, // Праща Давида
      { t: "h", r: 0 }, // Оливка
      { t: "g", r: 0 }, // Мирт
      { t: "4", r: 1 }, // Молоко
      { t: "g", r: 1 }  // Лотос
    ],
    rewardType: "title",
    rewardId: "citizen_polis",
    rewardLabel: "Титул: «Громадянин Поліса»",
    lore: "Травник Поліса покладається на цілющі відвари — пробий його відновлення!"
  },
  {
    id: 4,
    lvl: 4,
    numLabel: "4",
    title: "Мармуровий Міст",
    boss: "Вартовий Воріт",
    crestIdx: 1,
    bannerIdx: 5,
    hp: 95,
    shield: 5,
    x: 960,
    y: 720,
    isBoss: true,
    next: [5],
    deck: [
      { t: "d", r: 1 }, // Кинджал
      { t: "V", r: 1 }, // Булава
      { t: "X", r: 1 }, // Молот
      { t: "Q", r: 1 }, // Дротик
      { t: "p", r: 1 }, // Жовч
      { t: "W", r: 2 }, // Батіг Фурії
      { t: "h", r: 1 }, // Амфора
      { t: "6", r: 1 }, // Аптечка
      { t: "F", r: 1 }, // Фіал Асклепія
      { t: "s", r: 2 }  // Егіда
    ],
    rewardType: "banner",
    rewardId: "bronze",
    rewardLabel: "Фон плашки: «Бронза Гефеста»",
    lore: "МІНІБОС МОСТУ! Вартовий Воріт охороняє переправу зі стартовим щитом +5."
  },
  {
    id: 5,
    lvl: 5,
    numLabel: "5",
    title: "Ринкова Агора",
    boss: "Бронзовий Боєць",
    crestIdx: 3,
    bannerIdx: 5,
    hp: 90,
    shield: 0,
    x: 1180,
    y: 720,
    next: [6, 12],
    deck: [
      { t: "M", r: 0 }, // Сокира
      { t: "V", r: 1 }, // Булава
      { t: "d", r: 1 }, // Кинджал
      { t: "R", r: 1 }, // Арбалет
      { t: "U", r: 1 }, // Лук
      { t: "y", r: 1 }, // Крижана голка
      { t: "2", r: 0 }, // Хліб
      { t: "h", r: 1 }, // Амфора
      { t: "5", r: 1 }, // Настоянка
      { t: "T", r: 1 }  // Панцир Черепахи
    ],
    rewardType: "avatar",
    rewardId: "wolf",
    rewardLabel: "Аватар: «Вовк Ареса»",
    lore: "На гамірній Агорі важкі булави та арбалети вирішують долю дуелі."
  },
  {
    id: 12,
    lvl: 12,
    numLabel: "II",
    isSide: true,
    reqLvl: 5,
    title: "Скарбниця Кузні",
    boss: "Хранитель Сувоїв",
    crestIdx: 4,
    bannerIdx: 3,
    hp: 95,
    shield: 0,
    x: 1180,
    y: 1030,
    next: [],
    deck: [
      { t: "R", r: 1 }, // Арбалет
      { t: "Z", r: 2 }, // Пробійник
      { t: "l", r: 2 }, // Кайдани Фантома
      { t: "C", r: 2 }, // Лезо Хаоса
      { t: "D", r: 1 }, // Праща Давида
      { t: "p", r: 1 }, // Жовч
      { t: "h", r: 1 }, // Амфора
      { t: "8", r: 2 }, // Лоза Діоніса
      { t: "T", r: 1 }, // Панцир Черепахи
      { t: "i", r: 2 }  // Крижаний Щит
    ],
    rewardType: "avatar",
    rewardId: "crystal",
    rewardLabel: "Аватар: «Кристал Ефіру»",
    lore: "Таємне сховище реліквій під склепінням Агори!"
  },
  {
    id: 6,
    lvl: 6,
    numLabel: "6",
    title: "Академія Гоплітів",
    boss: "Наставник Фаланги",
    crestIdx: 1,
    bannerIdx: 1,
    hp: 95,
    shield: 0,
    x: 1410,
    y: 720,
    next: [7],
    deck: [
      { t: "R", r: 1 }, // Арбалет
      { t: "U", r: 1 }, // Лук
      { t: "X", r: 1 }, // Молот
      { t: "Y", r: 2 }, // Подвійний клинок
      { t: "D", r: 1 }, // Праща Давида
      { t: "j", r: 2 }, // Ікло Фафніра
      { t: "3", r: 1 }, // Трави
      { t: "H", r: 1 }, // Хвиля прибою
      { t: "8", r: 2 }, // Лоза Діоніса
      { t: "i", r: 2 }  // Крижаний Щит
    ],
    rewardType: "title",
    rewardId: "hoplite_cadet",
    rewardLabel: "Титул: «Учень Фаланги»",
    lore: "Наставник майстерно володіє контратакою та Крижаним Щитом."
  },
  {
    id: 7,
    lvl: 7,
    numLabel: "7",
    title: "Збройова Кузня",
    boss: "Коваль Поліса",
    crestIdx: 5,
    bannerIdx: 5,
    hp: 100,
    shield: 0,
    x: 1670,
    y: 610,
    next: [8],
    deck: [
      { t: "V", r: 1 }, // Булава
      { t: "X", r: 1 }, // Молот
      { t: "Z", r: 2 }, // Пробійник
      { t: "d", r: 2 }, // Тризуб
      { t: "a", r: 3 }, // Аґнеястра
      { t: "C", r: 2 }, // Лезо Хаоса
      { t: "h", r: 1 }, // Амфора
      { t: "h", r: 2 }, // Амброзія
      { t: "T", r: 1 }, // Панцир Черепахи
      { t: "f", r: 2 }  // Гефест
    ],
    rewardType: "banner",
    rewardId: "crimson",
    rewardLabel: "Фон плашки: «Багряний Оксамит»",
    lore: "Свіжовикувані клинки ще пашать жаром у руках Коваля."
  },
  {
    id: 8,
    lvl: 8,
    numLabel: "8",
    title: "Кипарисовий Сад",
    boss: "Отруйник Агори",
    crestIdx: 2,
    bannerIdx: 4,
    hp: 100,
    shield: 0,
    x: 1670,
    y: 390,
    next: [9],
    deck: [
      { t: "d", r: 1 }, // Кинджал
      { t: "p", r: 1 }, // Жовч
      { t: "p", r: 2 }, // Жало Гідри
      { t: "P", r: 1 }, // Жало Скорпіона
      { t: "A", r: 2 }, // Смола Аїда
      { t: "l", r: 2 }, // Кайдани Фантома
      { t: "4", r: 1 }, // Молоко
      { t: "g", r: 2 }, // Дар Гігеї
      { t: "F", r: 1 }, // Фіал Асклепія
      { t: "m", r: 2 }  // Щит Персея
    ],
    rewardType: "avatar",
    rewardId: "oracle",
    rewardLabel: "Аватар: «Око Оракула»",
    lore: "Токсини та дзеркальні чари підстерігають у затінку кипарисів."
  },
  {
    id: 9,
    lvl: 9,
    numLabel: "9",
    title: "Мармурові Сходи",
    boss: "Преторіанець",
    crestIdx: 3,
    bannerIdx: 2,
    hp: 105,
    shield: 5,
    x: 1350,
    y: 315,
    next: [10],
    deck: [
      { t: "d", r: 2 }, // Тризуб
      { t: "Y", r: 2 }, // Подвійний клинок
      { t: "Z", r: 2 }, // Пробійник
      { t: "7", r: 2 }, // Вихор Харибди
      { t: "W", r: 2 }, // Батіг Фурії
      { t: "L", r: 3 }, // Спис Ахілла
      { t: "h", r: 2 }, // Амброзія
      { t: "B", r: 3 }, // Чаша Геби
      { t: "t", r: 3 }, // Шип рози
      { t: "z", r: 2 }  // Громовиця
    ],
    rewardType: "title",
    rewardId: "vanguard_victor",
    rewardLabel: "Титул: «Підкорювач Сходів»",
    lore: "Останній рубіж перед вершиною Капітолія. Преторіанець не знає жалю."
  },
  {
    id: 10,
    lvl: 10,
    numLabel: "10",
    title: "Капітолій Поліса",
    boss: "Центуріон",
    crestIdx: 0,
    bannerIdx: 2,
    hp: 110,
    shield: 15,
    x: 1690,
    y: 195,
    isBoss: true,
    next: [],
    deck: [
      { t: "d", r: 2 }, // Тризуб
      { t: "d", r: 3 }, // Серп Ареса
      { t: "Z", r: 2 }, // Пробійник
      { t: "G", r: 3 }, // Колісниця Геліоса
      { t: "L", r: 3 }, // Спис Ахілла
      { t: "E", r: 3 }, // Прокляття Ереба
      { t: "h", r: 2 }, // Амброзія
      { t: "h", r: 3 }, // Нектар
      { t: "K", r: 3 }, // Кров Титана
      { t: "s", r: 3 }  // Егіда
    ],
    rewardType: "title",
    rewardId: "polis_conqueror",
    rewardLabel: "Титул: «Підкорювач Поліса»",
    lore: "БОС ГЛАВИ I! Центуріон виходить на мармур Капітолія зі щитом +15."
  }
];
