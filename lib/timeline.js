/* ------------------------------------------------------------------ */
/*  Скролл-таймлайн. Вся хореография страницы описана сегментами:      */
/*  имя + длина в экранах (1 = 100vh скролла).                         */
/* ------------------------------------------------------------------ */

export const SEGMENTS = [
  ["heroHold", 0.35],   // хиро стоит
  ["heroFade", 1.0],    // ячейки «шахматкой» исчезают
  ["mainIn", 0.7],      // блок принципов приезжает снизу
  ["p1", 0.7],          // (1) медиа как продукт
  ["p2", 0.9],          // (2) контент как основа
  ["p3", 0.9],          // (3) дизайн как система
  ["skillsIn", 0.8],    // что мы умеем, пункт (1)
  ["skillsRun", 3.0],   // пункты (2)–(6), картинка меняется
  ["workIn", 0.7],      // как мы работаем
  ["workRun", 1.8],     // пункты (1)–(4) подъезжают
  ["clientsIn", 0.8],   // нам доверяют
  ["logosRun", 3.2],    // логотипы мотаются вверх
  ["contactsIn", 1.0],  // шторка контактов
  ["tail", 0.35],       // финальная пауза
];

const starts = {};
let acc = 0;
for (const [name, len] of SEGMENTS) {
  starts[name] = { start: acc, len };
  acc += len;
}

export const TOTAL = acc;

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

/* Локальный прогресс сегмента: 0 до его начала, 1 после конца */
export function seg(p, name) {
  const s = starts[name];
  return clamp01((p - s.start) / s.len);
}

export function after(p, name) {
  const s = starts[name];
  return p >= s.start + s.len;
}

export function before(p, name) {
  return p < starts[name].start;
}

export function segStart(name) {
  return starts[name].start;
}

/* Детерминированный «хаотичный» порядок исчезания ячеек хиро */
export function shuffledOrder(n, seed = 137) {
  const arr = Array.from({ length: n }, (_, i) => i);
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
