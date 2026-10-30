import { useEffect, useRef, useState } from "react";
import { Icon, MathText, fa } from "../lib";
import { buildRound, type Level, type Q } from "../questions";

type Phase = "intro" | "play" | "result";
type QResult = { ok: boolean; gained: number; byTime: boolean } | null;

const RING = 2 * Math.PI * 19;

export default function Game({
  level,
  best,
  onBest,
  onNav,
}: {
  level: Level;
  best: number;
  onBest: (lv: Level, score: number) => void;
  onNav: (s: "levels" | "learn" | "home" | "mathem" | "assistant" | "feedback") => void;
}) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [questions, setQuestions] = useState<Q[]>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [correctN, setCorrectN] = useState(0);
  const [wrongN, setWrongN] = useState(0);
  const [leftMs, setLeftMs] = useState(0);
  const [totalLeft, setTotalLeft] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [sieveSel, setSieveSel] = useState<Set<number>>(new Set());
  const [result, setResult] = useState<QResult>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [exitAsk, setExitAsk] = useState(false);

  const leftMsRef = useRef(0);
  const doneRef = useRef(false);

  const q = questions[idx];
  const isSampad = level === "sampad";

  const setLeft = (v: number) => {
    leftMsRef.current = v;
    setLeftMs(v);
  };

  const start = () => {
    setQuestions(buildRound(level));
    setIdx(0);
    setScore(0);
    setCorrectN(0);
    setWrongN(0);
    setTotalLeft(0);
    setPicked(null);
    setSieveSel(new Set());
    setResult(null);
    doneRef.current = false;
    setPhase("play");
  };

  const finishQ = (ok: boolean, byTime: boolean) => {
    if (doneRef.current || !q) return;
    doneRef.current = true;
    const secs = Math.max(0, Math.ceil(leftMsRef.current / 1000));
    const gained = ok ? 100 + secs * 2 : 0;
    setResult({ ok, gained, byTime });
    setScore((s) => s + gained);
    if (ok) setCorrectN((n) => n + 1);
    else setWrongN((n) => n + 1);
    setTotalLeft((t) => t + secs);
  };

  /* تایمر */
  useEffect(() => {
    if (phase !== "play" || !q || result) return;
    doneRef.current = false;
    const total = q.time * 1000;
    const t0 = performance.now();
    setLeft(total);
    const id = window.setInterval(() => {
      const left = total - (performance.now() - t0);
      if (left <= 0) {
        setLeft(0);
        finishQ(false, true);
      } else {
        setLeft(left);
      }
    }, 100);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, idx, result]);

  const next = () => {
    if (idx + 1 >= questions.length) {
      if (score > best) onBest(level, score);
      setPhase("result");
    } else {
      setIdx((i) => i + 1);
      setPicked(null);
      setSieveSel(new Set());
      setResult(null);
    }
  };

  const pickOption = (i: number) => {
    if (result || !q) return;
    setPicked(i);
    finishQ(i === q.correct, false);
  };

  const toggleSieve = (n: number) => {
    if (result) return;
    setSieveSel((prev) => {
      const s = new Set(prev);
      if (s.has(n)) s.delete(n);
      else s.add(n);
      return s;
    });
  };

  const submitSieve = () => {
    if (result || !q || sieveSel.size === 0) return;
    const correctSet = new Set(q.sievePrimes ?? []);
    const ok =
      sieveSel.size === correctSet.size && [...sieveSel].every((n) => correctSet.has(n));
    finishQ(ok, false);
  };

  /* ---------- ورودی دور ---------- */
  if (phase === "intro") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="card anim-fadeup p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <span className={`grid h-12 w-12 place-items-center rounded-2xl ${isSampad ? "bg-[var(--accent)] text-[var(--accent-contrast)]" : "bg-[var(--accent-soft)] text-[var(--accent-strong)]"}`}>
              {isSampad ? <Icon name="shield" size={24} /> : <Icon name="play" size={24} />}
            </span>
            <div>
              <h1 className="font-display text-2xl leading-tight">
                {isSampad ? "آماده‌ی چالش سمپاد؟" : "آماده‌ی بازی؟"}
              </h1>
              <p className="text-sm text-[var(--muted)]">
                سطح <b className="text-[var(--accent-strong)]">{isSampad ? "سمپاد" : "معمولی"}</b> — {fa(questions.length || (isSampad ? 12 : 10))} سؤال، تایمر روی هر سؤال
              </p>
            </div>
          </div>

          <ul className="mb-5 space-y-2 text-sm leading-7">
            <li className="flex items-start gap-2">
              <Icon name="clock" size={16} className="mt-1 shrink-0 text-[var(--accent-strong)]" />
              هر سؤال تایمر خودش را دارد؛ پاسخ درست +۱۰۰ امتیاز و هر ثانیه‌ی باقی‌مانده +۲ امتیاز.
            </li>
            <li className="flex items-start gap-2">
              <Icon name="check" size={16} className="mt-1 shrink-0 text-[var(--accent-strong)]" />
              بعد از هر سؤال، پاسخ درست و یک توضیح کوتاه آموزشی می‌بینی.
            </li>
            <li className="flex items-start gap-2">
              <Icon name="book" size={16} className="mt-1 shrink-0 text-[var(--accent-strong)]" />
              هر زمان از دکمه‌ی «بازگشت به آموزش‌ها» می‌توانی مفاهیم را مرور کنی.
            </li>
          </ul>

          {isSampad && (
            <div className="mb-5 space-y-3">
              <h2 className="font-display text-lg">آموزش کوتاه قبل از شروع</h2>
              <div className="card-2 p-4">
                <p className="mb-2 text-sm font-extrabold text-[var(--accent-strong)]">۱) کسر تلسکوپی</p>
                <p className="mb-2 text-sm leading-7">
                  کلیدش این تساوی است:
                  <span className="mx-1">
                    <MathText s="1/(n(n+1)) = 1/n − 1/(n+1)" />
                  </span>
                  در یک جمع بلند، جمله‌های وسط حذف می‌شوند.
                </p>
                <div className="rounded-xl bg-[var(--panel)] p-3 text-sm leading-8">
                  <MathText s="1/(2×3) + 1/(3×4) + 1/(4×5) = (1/2 − 1/3) + (1/3 − 1/4) + (1/4 − 1/5) = 1/2 − 1/5 = 3/10" />
                </div>
              </div>
              <div className="card-2 p-4">
                <p className="mb-2 text-sm font-extrabold text-[var(--accent-strong)]">۲) کسر مسلسل</p>
                <p className="mb-2 text-sm leading-7">
                  [a ; b , c] یعنی <MathText s="a + 1/(b + 1/c)" /> — از انتها شروع کن.
                </p>
                <div className="rounded-xl bg-[var(--panel)] p-3 text-sm leading-8">
                  <MathText s="[3 ; 2 , 5] = 3 + 1/(2 + 1/5) = 3 + 1/(11/5) = 3 + 5/11 = 38/11" />
                </div>
              </div>
            </div>
          )}

          <button onClick={start} className="btn btn-accent w-full !py-3.5 text-lg">
            <Icon name="play" size={20} /> شروع بازی
          </button>
          <div className="mt-3 flex gap-2">
            <button onClick={() => onNav("learn")} className="btn btn-ghost flex-1 !py-2 text-sm">
              <Icon name="book" size={15} /> بازگشت به آموزش‌ها
            </button>
            <button onClick={() => onNav("levels")} className="btn btn-ghost flex-1 !py-2 text-sm">
              <Icon name="shield" size={15} /> تغییر سطح
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- نتیجه ---------- */
  if (phase === "result") {
    const total = questions.length;
    const pct = total ? correctN / total : 0;
    const msg =
      pct >= 0.9
        ? "فوق‌العاده بود! تو واقعاً استعدادت را نشان دادی."
        : pct >= 0.7
          ? "عالی بود! با کمی تمرین رکوردت را می‌شکنی."
          : pct >= 0.5
            ? "خوب پیش رفتی؛ یک دور دیگر که رکوردت بالا می‌رود."
            : "اشکالی ندارد؛ اول آموزش را مرور کن و دوباره بیا، حتماً بهتر می‌شود.";
    const isNewBest = score > 0 && score >= best;
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="card anim-pop p-6 text-center sm:p-8">
          <span className="chip chip-accent mb-3">
            <Icon name="trophy" size={13} /> پایان دور — سطح {isSampad ? "سمپاد" : "معمولی"}
          </span>
          <p className="text-sm font-bold text-[var(--muted)]">امتیاز نهایی</p>
          <p className="font-display text-6xl leading-tight text-[var(--accent-strong)]">{fa(score)}</p>
          {isNewBest && (
            <p className="anim-pulse-soft mt-1 text-sm font-extrabold text-[var(--accent-strong)]">
              رکورد جدید!
            </p>
          )}
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{msg}</p>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="card-2 p-3">
              <p className="font-display text-2xl" style={{ color: "var(--ok)" }}>
                {fa(correctN)}
              </p>
              <p className="text-[11px] font-bold text-[var(--muted)]">پاسخ درست</p>
            </div>
            <div className="card-2 p-3">
              <p className="font-display text-2xl" style={{ color: "var(--bad)" }}>
                {fa(wrongN)}
              </p>
              <p className="text-[11px] font-bold text-[var(--muted)]">پاسخ نادرست</p>
            </div>
            <div className="card-2 p-3">
              <p className="font-display text-2xl text-[var(--accent-strong)]">{fa(totalLeft)}</p>
              <p className="text-[11px] font-bold text-[var(--muted)]">ثانیه‌ی باقی‌مانده</p>
            </div>
          </div>

          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <button onClick={start} className="btn btn-accent !py-3">
              <Icon name="refresh" size={17} /> شروع دوباره
            </button>
            <button onClick={() => onNav("levels")} className="btn btn-ghost !py-3">
              <Icon name="shield" size={17} /> تغییر سطح
            </button>
            <button onClick={() => onNav("learn")} className="btn btn-ghost !py-3">
              <Icon name="book" size={17} /> بازگشت به آموزش‌ها
            </button>
            <button onClick={() => onNav("home")} className="btn btn-ghost !py-3">
              <Icon name="home" size={17} /> صفحه‌ی خانه
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- در حال بازی ---------- */
  if (!q) return null;
  const prog = leftMs / (q.time * 1000);
  const danger = !result && prog < 0.3;
  const correctSet = new Set(q.sievePrimes ?? []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6">
      {/* نوار بالایی */}
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => setExitAsk(true)}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[var(--line)] bg-[var(--panel)] text-[var(--muted)] hover:text-[var(--bad)]"
          aria-label="خروج از بازی"
          title="خروج از بازی"
        >
          <Icon name="x" size={16} />
        </button>
        <span className="chip !text-xs">
          سؤال {fa(idx + 1)} از {fa(questions.length)}
        </span>
        <span className="chip chip-accent !text-xs">
          {isSampad ? "سطح سمپاد" : "سطح معمولی"}
        </span>
        <span className="chip !text-xs">
          <Icon name="trophy" size={12} /> {fa(score)}
        </span>
        <button
          onClick={() => setHelpOpen(true)}
          className="mr-auto grid h-9 w-9 place-items-center rounded-xl border border-[var(--line)] bg-[var(--panel)] text-[var(--muted)] hover:text-[var(--accent)]"
          aria-label="راهنما"
          title="راهنما"
        >
          <Icon name="help" size={17} />
        </button>
        {/* تایمر */}
        <div className="relative h-[46px] w-[46px] shrink-0" title="زمان باقی‌مانده">
          <svg width="46" height="46" viewBox="0 0 46 46" className="-rotate-90">
            <circle cx="23" cy="23" r="19" fill="none" stroke="var(--line)" strokeWidth="4" />
            <circle
              cx="23"
              cy="23"
              r="19"
              fill="none"
              stroke={danger ? "var(--bad)" : "var(--accent)"}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={RING}
              strokeDashoffset={RING * (1 - Math.max(0, prog))}
              className="transition-[stroke-dashoffset] duration-100 ease-linear"
            />
          </svg>
          <span
            className={`absolute inset-0 grid place-items-center text-sm font-extrabold ${
              danger ? "text-[var(--bad)]" : ""
            }`}
          >
            {fa(Math.ceil(leftMs / 1000))}
          </span>
        </div>
      </div>

      {/* سؤال */}
      <div className="card anim-fadeup p-5 sm:p-6" key={q.uid}>
        <span className="chip chip-accent mb-3 !text-[11px]">{q.topic}</span>
        <h2 className="text-lg font-extrabold leading-8 sm:text-xl">
          <MathText s={q.prompt} />
        </h2>
        {q.math && (
          <p className="mt-3 rounded-xl bg-[var(--panel-2)] p-3 text-center text-2xl">
            <MathText s={q.math} />
          </p>
        )}

        {q.mode === "choice" && (
          <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
            {q.options!.map((op, i) => {
              const isCorrect = result && i === q.correct;
              const isWrongPick = result && picked === i && i !== q.correct;
              return (
                <button
                  key={i}
                  onClick={() => pickOption(i)}
                  disabled={!!result}
                  className={`rounded-xl border-2 px-4 py-3.5 text-right text-base font-bold transition-all ${
                    isCorrect
                      ? "border-transparent bg-[var(--ok)] text-white"
                      : isWrongPick
                        ? "border-transparent bg-[var(--bad)] text-white"
                        : result
                          ? "border-[var(--line)] opacity-50"
                          : "border-[var(--line)] bg-[var(--panel)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] active:scale-[0.98]"
                  }`}
                >
                  <MathText s={op} />
                </button>
              );
            })}
          </div>
        )}

        {q.mode === "sieve" && (
          <div className="mt-5">
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {q.sieve!.map((n) => {
                const sel = sieveSel.has(n);
                const showCorrect = result && correctSet.has(n);
                const showWrongPick = result && sel && !correctSet.has(n);
                return (
                  <button
                    key={n}
                    onClick={() => toggleSieve(n)}
                    disabled={!!result}
                    className={`relative rounded-xl border-2 py-3 text-center font-display text-xl transition-all ${
                      showCorrect
                        ? "border-transparent bg-[var(--ok)] text-white"
                        : showWrongPick
                          ? "border-transparent bg-[var(--bad)] text-white"
                          : sel
                            ? "border-transparent bg-[var(--accent)] text-[var(--accent-contrast)]"
                            : "border-[var(--line)] bg-[var(--panel)] hover:border-[var(--accent)]"
                    } ${result ? "opacity-90" : "active:scale-95"}`}
                  >
                    {fa(n)}
                    {sel && !result && (
                      <span className="absolute left-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-[var(--accent-contrast)] text-[var(--accent)]">
                        <Icon name="check" size={10} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {!result && (
              <button
                onClick={submitSieve}
                disabled={sieveSel.size === 0}
                className="btn btn-accent mt-4 w-full !py-2.5"
              >
                <Icon name="check" size={16} /> ثبت انتخاب ({fa(sieveSel.size)} عدد)
              </button>
            )}
          </div>
        )}

        {/* بازخورد */}
        {result && (
          <div
            className="anim-pop mt-5 rounded-2xl border-2 p-4"
            style={{
              borderColor: result.ok ? "var(--ok)" : "var(--bad)",
              background: result.ok
                ? "color-mix(in srgb, var(--ok) 10%, transparent)"
                : "color-mix(in srgb, var(--bad) 8%, transparent)",
            }}
          >
            <p className="flex items-center gap-2 font-display text-lg" style={{ color: result.ok ? "var(--ok)" : "var(--bad)" }}>
              <Icon name={result.ok ? "check" : "x"} size={20} />
              {result.ok
                ? `آفرین! درست بود  (+${fa(result.gained)})`
                : result.byTime
                  ? "وقت تمام شد!"
                  : "نادرست بود."}
            </p>
            <p className="mt-2 text-sm font-extrabold">
              پاسخ درست: <MathText s={q.answerText} />
            </p>
            <div className="mt-2 space-y-1.5">
              {q.explain.map((line, i) => (
                <p key={i} className="text-sm leading-7 text-[var(--muted)]">
                  <MathText s={line} />
                </p>
              ))}
            </div>
            <button onClick={next} className="btn btn-accent mt-4 w-full !py-2.5">
              {idx + 1 >= questions.length ? "دیدن نتیجه" : "سؤال بعدی"}
              <Icon name="arrow" size={16} className="-scale-x-100" />
            </button>
          </div>
        )}
      </div>

      {/* راهنما */}
      {helpOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setHelpOpen(false)}>
          <div className="card anim-pop w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-3 flex items-center gap-2 font-display text-xl">
              <Icon name="help" size={20} className="text-[var(--accent-strong)]" /> راهنما
            </h3>
            <ul className="space-y-2 text-sm leading-7">
              <li>• روی گزینه‌ی درست کلیک کن؛ تایمر همان لحظه متوقف می‌شود.</li>
              <li>• در سؤال‌های غربال، همه‌ی اعداد اول را انتخاب کن و «ثبت انتخاب» را بزن.</li>
              <li>• امتیاز هر پاسخ درست: ۱۰۰ + (۲ × ثانیه‌های باقی‌مانده).</li>
              <li>• پاسخ نادرست یا تمام‌شدن زمان، امتیاز آن سؤال را از دست می‌دهد.</li>
              <li>• بعد از هر سؤال توضیح آموزشی می‌بینی؛ با دقت بخوان!</li>
            </ul>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setHelpOpen(false)} className="btn btn-accent flex-1 !py-2 text-sm">
                فهمیدم
              </button>
              <button onClick={() => onNav("learn")} className="btn btn-ghost flex-1 !py-2 text-sm">
                مرور آموزش
              </button>
            </div>
          </div>
        </div>
      )}

      {/* تأیید خروج */}
      {exitAsk && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setExitAsk(false)}>
          <div className="card anim-pop w-full max-w-sm p-5 text-center" onClick={(e) => e.stopPropagation()}>
            <p className="font-display text-lg">خارج از بازی شوی؟</p>
            <p className="mt-1 text-sm text-[var(--muted)]">پیشرفت این دور ذخیره نمی‌شود.</p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  setExitAsk(false);
                  onNav("levels");
                }}
                className="btn btn-ghost flex-1 !py-2 text-sm"
                style={{ color: "var(--bad)", borderColor: "var(--bad)" }}
              >
                خروج
              </button>
              <button onClick={() => setExitAsk(false)} className="btn btn-accent flex-1 !py-2 text-sm">
                ادامه‌ی بازی
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
