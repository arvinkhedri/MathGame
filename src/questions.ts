/* ============================================================
   سوال‌ساز بازی
   مقادیر عددی در هر دور تصادفی ساخته می‌شوند و پاسخ/راه‌حل
   هر سوال به‌صورت برنامه‌ای محاسبه می‌شود تا از صحت ریاضی
   در هر تکرار مطمئن باشیم.
   ============================================================ */

export type Level = "normal" | "sampad";

export type Q = {
  uid: string;
  topic: string;
  prompt: string;
  math?: string;
  mode: "choice" | "sieve";
  options?: string[];
  correct?: number;
  sieve?: number[];
  sievePrimes?: number[];
  answerText: string;
  explain: string[];
  time: number;
};

let UID = 0;
const uid = () => `q${Date.now().toString(36)}-${UID++}`;

const rnd = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/* ---------- ابزار ریاضی ---------- */
export const isPrime = (n: number): boolean => {
  if (n < 2) return false;
  if (n % 2 === 0) return n === 2;
  for (let d = 3; d * d <= n; d += 2) if (n % d === 0) return false;
  return true;
};
const factorPair = (n: number): [number, number] | null => {
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return [d, n / d];
  return null;
};
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
const fr = (n: number, d: number) => {
  const g = gcd(Math.abs(n) || 1, Math.abs(d));
  n /= g;
  d /= g;
  if (d < 0) {
    d = -d;
    n = -n;
  }
  return { n, d, s: d === 1 ? String(n) : `\\tfrac{${n}}{${d}}` };
};
const SQ = (n: number) => `\\tsqrt{${n}}`;

/* ---------- ۱) اول یا مرکب ---------- */
function qPrimeComposite(): Q {
  const useOne = Math.random() < 0.18;
  const x = useOne ? 1 : rnd(2, 97);
  const options = ["اول", "مرکب", "نه اول است و نه مرکب"];
  const correct = x === 1 ? 2 : isPrime(x) ? 0 : 1;
  let explain: string[];
  if (x === 1) {
    explain = [
      "عدد ۱ فقط یک مقسوم‌علیه دارد (خودش)؛ برای «اول» بودن دقیقاً دو مقسوم‌علیه لازم است.",
      "پس ۱ نه اول است و نه مرکب.",
    ];
  } else if (isPrime(x)) {
    explain = [
      `عدد ${x} فقط بر ۱ و خودش بخش‌پذیر است؛ یعنی دقیقاً ۲ مقسوم‌علیه دارد.`,
      "بنابراین یک عدد اول است.",
    ];
  } else {
    const f = factorPair(x)!;
    explain = [
      `عدد ${x} بر ${f[0]} (و ${f[1]}) هم بخش‌پذیر است: ${x} = ${f[0]} × ${f[1]}.`,
      "چون مقسوم‌علیه‌ای غیر از ۱ و خودش دارد، مرکب است.",
    ];
  }
  return {
    uid: uid(),
    topic: "اعداد اول و مرکب",
    prompt: useOne ? "عدد ۱ اول است، مرکب است، یا هیچ‌کدام؟" : `عدد ${x} اول است یا مرکب؟`,
    mode: "choice",
    options,
    correct,
    answerText: options[correct],
    explain,
    time: 18,
  };
}

/* ---------- ۲) غربال: انتخاب اعداد اول از مجموعه ---------- */
function qSieve(hard = false): Q {
  const lo = rnd(1, 40);
  const span = hard ? 34 : 24;
  const count = hard ? 12 : 9;
  const pool: number[] = [];
  for (let n = lo; n <= lo + span; n++) pool.push(n);
  const allP = pool.filter(isPrime);
  const allC = pool.filter((n) => n > 1 && !isPrime(n));
  const np = Math.min(allP.length, rnd(3, hard ? 5 : 4));
  const nums = shuffle(allP).slice(0, np).concat(shuffle(allC).slice(0, count - np));
  const correctSet = nums.filter(isPrime);
  return {
    uid: uid(),
    topic: "روش غربال",
    prompt: "کدام‌یک از این اعداد اول‌اند؟ همه‌ی آن‌ها را با کلیک نشانه‌گذاری کن و عددهای مرکب را کنار بگذار.",
    mode: "sieve",
    sieve: shuffle(nums),
    sievePrimes: correctSet,
    answerText: correctSet.join("، "),
    explain: [
      "قانون: عددی اول است که بزرگ‌تر از ۱ باشد و فقط بر ۱ و خودش بخش‌پذیر باشد.",
      `اعداد اول این مجموعه: ${correctSet.join("، ")}.`,
      "یادآوری: عدد ۱ (اگر باشد) نه اول است و نه مرکب.",
    ],
    time: hard ? 40 : 30,
  };
}

/* ---------- ۳) گویا یا گنگ ---------- */
type RI = { show: string; kind: "q" | "i"; why: string };
const RI_ITEMS: RI[] = [
  { show: SQ(2), kind: "i", why: "۲ مربع کامل نیست، پس \tfrac{}{}" + SQ(2) + " اعشاریِ بی‌نهایت و غیرتکرارشونده دارد." },
  { show: SQ(3), kind: "i", why: "۳ مربع کامل نیست، پس \tfrac{}{}" + SQ(3) + " کسر نمی‌شود." },
  { show: SQ(5), kind: "i", why: "۵ مربع کامل نیست، پس \tfrac{}{}" + SQ(5) + " گنگ است (≈ ۲٫۲۳۶۰۶…)." },
  { show: SQ(7), kind: "i", why: "۷ مربع کامل نیست، پس \tfrac{}{}" + SQ(7) + " گنگ است." },
  { show: SQ(10), kind: "i", why: "۱۰ مربع کامل نیست، پس \tfrac{}{}" + SQ(10) + " گنگ است." },
  { show: SQ(12), kind: "i", why: "۱۲ مربع کامل نیست؛ \tfrac{}{}" + SQ(12) + " = 2" + SQ(3) + " که باز هم گنگ است." },
  { show: SQ(18), kind: "i", why: "۱۸ مربع کامل نیست؛ \tfrac{}{}" + SQ(18) + " = 3" + SQ(2) + " و چون \tfrac{}{}" + SQ(2) + " گنگ است، حاصل هم گنگ است." },
  { show: SQ(24), kind: "i", why: "۲۴ مربع کامل نیست؛ \tfrac{}{}" + SQ(24) + " = 2" + SQ(6) + " که گنگ است." },
  { show: SQ(50), kind: "i", why: "۵۰ مربع کامل نیست؛ \tfrac{}{}" + SQ(50) + " = 5" + SQ(2) + " که گنگ است." },
  { show: SQ(4), kind: "q", why: "\tfrac{}{}" + SQ(4) + " = ۲ ، یک عدد صحیح است و ۲ = ۲/۱ ، پس گویاست." },
  { show: SQ(9), kind: "q", why: "\tfrac{}{}" + SQ(9) + " = ۳ ، پس گویاست. رادیکال بودن همیشه به‌معنای گنگ نیست!" },
  { show: SQ(16), kind: "q", why: "\tfrac{}{}" + SQ(16) + " = ۴ ، پس گویاست." },
  { show: SQ(25), kind: "q", why: "\tfrac{}{}" + SQ(25) + " = ۵ ، پس گویاست." },
  { show: SQ(36), kind: "q", why: "\tfrac{}{}" + SQ(36) + " = ۶ ، پس گویاست." },
  { show: SQ(64), kind: "q", why: "\tfrac{}{}" + SQ(64) + " = ۸ ، پس گویاست." },
  { show: "π", kind: "i", why: "اعشاریِ π بی‌نهایت و بدون هیچ تکراری است: 3.14159265… — کسری از دو عدد صحیح نمی‌شود." },
  { show: "\\tfrac{22}{7}", kind: "q", why: "این کسر، نزدیک‌شده‌ی معروفِ π است، اما خودش یک کسر از دو عدد صحیح است؛ پس گویا." },
  { show: "3.14", kind: "q", why: "اعشاری متناهی است: 3.14 = 314/100 ، پس گویاست." },
  { show: "0.333…", kind: "q", why: "اعشاری تکرارشونده است و برابر 1/3 — پس گویا." },
  { show: "0.25", kind: "q", why: "اعشاری متناهی است و برابر 1/4 — پس گویا." },
  { show: "\\tfrac{7}{3}", kind: "q", why: "خودِ تعریف: کسر از دو عدد صحیح (مخرج ≠ ۰) — پس گویا." },
  { show: "-5", kind: "q", why: "هر عدد صحیح گویاست: −5 = −5/1 ." },
  { show: "0", kind: "q", why: "صفر هم گویاست: 0 = 0/1 ." },
];
function qRationalIrrational(): Q {
  const it = pick(RI_ITEMS);
  return {
    uid: uid(),
    topic: "گویا و گنگ",
    prompt: `عدد ${it.show} گویاست یا گنگ؟`,
    math: it.show,
    mode: "choice",
    options: ["گویا", "گنگ"],
    correct: it.kind === "q" ? 0 : 1,
    answerText: it.kind === "q" ? "گویا" : "گنگ",
    explain: [
      it.why,
      it.kind === "q"
        ? "عدد گویا = عددی که به شکل k/n (n ≠ ۰) نوشته می‌شود؛ اعشاری‌اش متناهی یا تکرارشونده است."
        : "عدد گنگ = عدد حقیقی که کسر نمی‌شود؛ اعشاری‌اش بی‌نهایت و بدون تکرار است.",
    ],
    time: 18,
  };
}

/* ---------- ۴) بزرگ‌ترین فاکتور اول ---------- */
const SMALL_PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31];
function qLPF(): Q | null {
  for (let t = 0; t < 30; t++) {
    const p = pick(SMALL_PRIMES);
    const q = pick(SMALL_PRIMES);
    if (p === q) continue;
    const x = p * q;
    if (x > 130) continue;
    const ans = Math.max(p, q);
    const rest = shuffle(SMALL_PRIMES.filter((v) => v !== ans)).slice(0, 3).map(String);
    const options = shuffle([String(ans), ...rest]);
    return {
      uid: uid(),
      topic: "فاکتورهای اول",
      prompt: `بزرگ‌ترین فاکتور اول عدد ${x} کدام است؟`,
      mode: "choice",
      options,
      correct: options.indexOf(String(ans)),
      answerText: String(ans),
      explain: [
        `${x} = ${p} × ${q} و هر دو عدد اول‌اند.`,
        `پس فاکتورهای اولِ ${x} عبارت‌اند از ${p} و ${q}؛ بزرگ‌ترین آن‌ها ${ans} است.`,
      ],
      time: 22,
    };
  }
  return null;
}

/* ---------- ۵) شمارش اعداد اول در بازه ---------- */
function qPrimeCount(): Q {
  const a = rnd(1, 30);
  const b = a + rnd(10, 25);
  const found: number[] = [];
  for (let n = a; n <= b; n++) if (isPrime(n)) found.push(n);
  const c = found.length;
  const distract = shuffle([c - 2, c - 1, c + 1, c + 2].filter((v) => v >= 0 && v !== c)).slice(0, 3);
  let extra = 4;
  while (distract.length < 3) distract.push(extra++);
  const options = shuffle([String(c), ...distract.map((v) => String(v))]);
  return {
    uid: uid(),
    topic: "تعداد اعداد اول",
    prompt: `در بازه‌ی ${a} تا ${b} (با خودِ این دو عدد) چند عدد اول وجود دارد؟`,
    mode: "choice",
    options,
    correct: options.indexOf(String(c)),
    answerText: String(c),
    explain: [
      `اعداد اولِ این بازه: ${found.join("، ")}.`,
      `پس ${c} عدد اول داریم.`,
    ],
    time: 24,
  };
}

/* ---------- ۶) عضویت در مجموعه ---------- */
const SETS = [
  {
    name: "عددهای طبیعی",
    inSet: () => String(rnd(0, 50)),
    out: ["-3", "\\tfrac{3}{4}", SQ(2), "π", "-0.5", "\\tfrac{7}{3}"],
  },
  {
    name: "عددهای صحیح",
    inSet: () => String(rnd(-30, 40)),
    out: ["\\tfrac{3}{4}", SQ(2), "π", "0.25", "\\tfrac{7}{3}"],
  },
  {
    name: "عددهای گویا",
    inSet: () => pick(["\\tfrac{7}{3}", "0.75", "-8", "12", "0.333…"]),
    out: [SQ(2), "π", SQ(7), SQ(50)],
  },
  {
    name: "عددهای گنگ",
    inSet: () => pick([SQ(2), "π", SQ(5), SQ(10), SQ(30)]),
    out: ["\\tfrac{3}{4}", "-8", "0.25", SQ(9), "\\tfrac{22}{7}"],
  },
];
function qMembership(): Q {
  const s = pick(SETS);
  const good = s.inSet();
  const bad = shuffle(s.out).slice(0, 3);
  const options = shuffle([good, ...bad]);
  return {
    uid: uid(),
    topic: "عضویت در مجموعه",
    prompt: `کدام‌یک از این اعداد عضو مجموعه‌ی ${s.name} است؟`,
    mode: "choice",
    options,
    correct: options.indexOf(good),
    answerText: options[options.indexOf(good)],
    explain: [
      `عدد درست در تعریفِ ${s.name} جا می‌گیرد؛ بقیه گزینه‌ها خلافش هستند.`,
      "هر عدد طبیعی، صحیح است و هر عدد صحیح، گویاست — اما برعکس این جمله‌ها درست نیست.",
    ],
    time: 20,
  };
}

/* ---------- ۷) کسرهای تلسکوپی (سمپاد) ---------- */
function qTelescope(): Q {
  if (Math.random() < 0.5) {
    const n = rnd(3, 10);
    const correct = fr(n, n + 1);
    const options = shuffle([correct.s, fr(n - 1, n).s, fr(n + 1, n).s, "1"]);
    return {
      uid: uid(),
      topic: "کسرهای تلسکوپی",
      prompt: `مجموع \tfrac{1}{1×2} + \tfrac{1}{2×3} + … + \tfrac{1}{${n}×${n + 1}} را حساب کن.`,
      mode: "choice",
      options,
      correct: options.indexOf(correct.s),
      answerText: correct.s,
      explain: [
        "برای هر k داریم: 1/(k×(k+1)) = 1/k − 1/(k+1) — این رازِ روش تلسکوپی است.",
        "وقتی همه را جمع می‌کنیم، جمله‌های وسط یک‌به‌یک حذف می‌شوند و فقط ۱ و −1/(n+1) می‌مانند.",
        `پس جواب: 1 − 1/(${n + 1}) = ${n}/${n + 1} .`,
      ],
      time: 40,
    };
  }
  const a = rnd(2, 5);
  const t = rnd(2, 4);
  const b = a + t - 1;
  const terms = [];
  for (let k = a; k <= b; k++) terms.push(`\\tfrac{1}{${k}×${k + 1}}`);
  const correct = fr(b + 1 - a, a * (b + 1));
  const cand = [
    fr(b + 2 - a, a * (b + 1)),
    fr(b + 1 - a, a * (b + 2)),
    fr(1, a),
    fr(b + 1 - a - 1, a * (b + 1)),
    fr(1, a + 1),
    fr(b + 1, a),
  ]
    .map((f) => f.s)
    .filter((s) => s !== correct.s && f_n(s) > 0);
  const seen = new Set<string>([correct.s]);
  const opts: string[] = [];
  for (const s of shuffle(cand)) {
    if (!seen.has(s)) {
      seen.add(s);
      opts.push(s);
    }
    if (opts.length === 3) break;
  }
  const options = shuffle([correct.s, ...opts]);
  return {
    uid: uid(),
    topic: "کسرهای تلسکوپی",
    prompt: `مجموع ${terms.join(" + ")} را حساب کن.`,
    mode: "choice",
    options,
    correct: options.indexOf(correct.s),
    answerText: correct.s,
    explain: [
      `هر جمله را باز می‌کنیم: 1/(k×(k+1)) = 1/k − 1/(k+1).`,
      `جمله‌های میان‌بُری حذف می‌شوند و فقط دو سر می‌ماند: 1/${a} − 1/${b + 1}.`,
      `حاصل: ${correct.s}.`,
    ],
    time: 45,
  };
}
const f_n = (s: string) => (s.includes("\\tfrac") ? parseInt(s.split("{")[1] ?? "0", 10) : parseInt(s, 10));

/* ---------- ۸) کسرهای مسلسل (سمپاد) ---------- */
function qContFrac(): Q {
  if (Math.random() < 0.45) {
    const options = ["[1 ; 2 , 2 , 2 , …]", "[1 ; 1 , 1 , 1 , …]", "[2 ; 2 , 2 , 2 , …]", "[1 ; 3 , 3 , 3 , …]"];
    const order = shuffle(options);
    return {
      uid: uid(),
      topic: "کسرهای مسلسل",
      prompt: `کدام کسر مسلسل هم‌ارز ${SQ(2)} است؟`,
      mode: "choice",
      options: order,
      correct: order.indexOf(options[0]),
      answerText: options[0],
      explain: [
        "فرض کن x = [1 ; 2 , 2 , …]؛ پس x = 1 + 1/(2 + 1/(2 + …)).",
        "بخش تکرارشونده: y = 2 + 1/y ⟹ y² − 2y − 1 = 0 ⟹ y = 1 + √2 (ریشه‌ی مثبت).",
        "آنگاه x = 1 + 1/(1 + √2) = 1 + (√2 − 1) = √2 .",
      ],
      time: 40,
    };
  }
  const a = rnd(2, 5);
  const b = rnd(2, 4);
  const c = rnd(2, 6);
  const correct = fr(a * (b * c + 1) + c, b * c + 1);
  const wrongs = [
    fr(a * (b * c + 1) + c + 1, b * c + 1),
    fr(a * (b * c + 1) + c - 1, b * c + 1),
    fr(a * (b * c + 1) + c, b * c + 2),
    fr(a * b * c + a + b, b * c),
  ]
    .map((f) => f.s)
    .filter((s) => s !== correct.s);
  const seen = new Set([correct.s]);
  const picks: string[] = [];
  for (const s of shuffle(wrongs)) {
    if (!seen.has(s)) {
      seen.add(s);
      picks.push(s);
    }
    if (picks.length === 3) break;
  }
  const options = shuffle([correct.s, ...picks]);
  return {
    uid: uid(),
    topic: "کسرهای مسلسل",
    prompt: `مقدار کسر مسلسل [${a} ; ${b} , ${c}] را به‌صورت یک کسر ساده پیدا کن.`,
    mode: "choice",
    options,
    correct: options.indexOf(correct.s),
    answerText: correct.s,
    explain: [
      `از انتها شروع کن: ${b} + 1/${c} = ${(b * c + 1)}/${c}.`,
      `معکوسِ آن: ${c}/(${b * c + 1}).`,
      `در انتها: ${a} + ${c}/(${b * c + 1}) = ${correct.s}.`,
    ],
    time: 45,
  };
}

/* ---------- ۹) مجموع دو عدد اول (سمپاد) ---------- */
function qPrimeSum(): Q | null {
  const target = 4 + 2 * rnd(10, 28);
  let correctPair: [number, number] | null = null;
  for (let p = 2; p <= target / 2; p++) {
    if (isPrime(p) && isPrime(target - p)) {
      correctPair = [p, target - p];
      break;
    }
  }
  if (!correctPair) return null;
  const wrongs: [number, number][] = [];
  let guard = 0;
  while (wrongs.length < 3 && guard++ < 300) {
    const x = rnd(2, 40);
    const y = rnd(2, 40);
    if (x === y) continue;
    if (isPrime(x) && isPrime(y)) continue; // نباید هر دو اول باشند
    const pair = [Math.min(x, y), Math.max(x, y)] as [number, number];
    if (pair[0] === correctPair[0] && pair[1] === correctPair[1]) continue;
    if (wrongs.some((w) => w[0] === pair[0] && w[1] === pair[1])) continue;
    wrongs.push(pair);
  }
  if (wrongs.length < 3) return null;
  const all = shuffle([{ p: correctPair, ok: true }, ...wrongs.map((p) => ({ p, ok: false }))]);
  const options = all.map((o) => `${o.p[0]} + ${o.p[1]}`);
  const [pa, pb] = correctPair;
  return {
    uid: uid(),
    topic: "مجموع دو عدد اول",
    prompt: "کدام‌یک از این جمع‌ها، مجموع دو عدد اول است؟",
    mode: "choice",
    options,
    correct: all.findIndex((o) => o.ok),
    answerText: `${pa} + ${pb}`,
    explain: [
      `در گزینه‌ی درست، هر دو عدد فقط بر ۱ و خودش بخش‌پذیر است: ${pa} و ${pb} هر دو اول‌اند.`,
      "در گزینه‌های دیگر، دست‌کم یکی از اعداد مرکب است (فاکتور اول دارد).",
    ],
    time: 35,
  };
}

/* ---------- ۱۰) بزرگ‌ترین عدد اول کوچک‌تر از n (سمپاد) ---------- */
function qPrimeBelow(hard = false): Q {
  const n = rnd(50, hard ? 200 : 130);
  let p = n - 1;
  while (!isPrime(p)) p--;
  const options = shuffle([p, p - 1, p + 1, p + 3].map(String));
  const between: string[] = [];
  for (let x = p + 1; x < n && between.length < 6; x++) {
    const f = factorPair(x);
    if (f) between.push(`${x} = ${f[0]} × ${f[1]}`);
  }
  return {
    uid: uid(),
    topic: "اعداد اول نزدیک‌به",
    prompt: `بزرگ‌ترین عدد اولِ کوچک‌تر از ${n} کدام است؟`,
    mode: "choice",
    options,
    correct: options.indexOf(String(p)),
    answerText: String(p),
    explain: [
      `عدد ${p} اول است (تا √${p} هیچ مقسوم‌علیه‌ای ندارد).`,
      between.length ? `اعداد بین ${p} و ${n} مرکب‌اند: ${between.join("، ")}.` : `اعداد بین ${p} و ${n} مرکب‌اند.`,
    ],
    time: 35,
  };
}

/* ---------- ساخت دور ---------- */
const GEN_NORMAL: (() => Q | null)[] = [
  qPrimeComposite,
  () => qSieve(false),
  qRationalIrrational,
  qLPF,
  qPrimeCount,
  qMembership,
  () => qSieve(false),
  qRationalIrrational,
];
const GEN_SAMPAD: (() => Q | null)[] = [
  qPrimeComposite,
  () => qSieve(true),
  qRationalIrrational,
  qLPF,
  qPrimeCount,
  qTelescope,
  qContFrac,
  qPrimeSum,
  qPrimeBelow,
  qMembership,
];

export function buildRound(level: Level): Q[] {
  const gens = level === "normal" ? GEN_NORMAL : GEN_SAMPAD;
  const count = level === "normal" ? 10 : 12;
  const qs: Q[] = [];
  let i = 0;
  let guard = 0;
  while (qs.length < count && guard++ < 600) {
    const gen = gens[i % gens.length];
    i++;
    const q = gen();
    if (!q) continue;
    const last = qs[qs.length - 1];
    if (last && last.topic === q.topic && Math.random() < 0.65) continue;
    qs.push(q);
  }
  // تضمین حضور مباحث اختصاصی سمپاد
  if (level === "sampad") {
    if (!qs.some((q) => q.topic === "کسرهای تلسکوپی")) qs.push(qTelescope());
    if (!qs.some((q) => q.topic === "کسرهای مسلسل")) qs.push(qContFrac());
  }
  return qs.slice(0, count);
}
