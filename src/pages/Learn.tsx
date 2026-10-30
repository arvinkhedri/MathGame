import { useState } from "react";
import { Icon, MathText, fa } from "../lib";
import { SIEVE_STEPS, TOPICS } from "../data";

const CHAIN: { s: string; t: string }[] = [
  { s: "ℕ", t: "طبیعی" },
  { s: "ℤ", t: "صحیح" },
  { s: "ℚ", t: "گویا" },
  { s: "ℝ", t: "حقیقی (گویا + گنگ)" },
];

export default function Learn({ onGoLevels }: { onGoLevels: () => void }) {
  const [step, setStep] = useState(0);
  const st = SIEVE_STEPS[step];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="anim-fadeup mb-6">
        <h1 className="font-display text-3xl">آموزش پیش از بازی</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          توضیح‌ها کوتاه و ساده است؛ بعد از مطالعه، «مطالعه کردم؛ انتخاب سطح» را بزن. هر زمان می‌توانی
          از منوی «آموزش» برگردی.
        </p>
      </header>

      {/* کارت مباحث */}
      <div className="grid gap-4 md:grid-cols-2">
        {TOPICS.map((tp, i) => (
          <section key={tp.id} className="card anim-fadeup p-5" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="mb-2 flex items-center gap-2">
              <span className="font-display rounded-xl bg-[var(--accent-soft)] px-3 py-1 text-sm text-[var(--accent-strong)]" dir="ltr">
                {tp.symbol}
              </span>
              <h2 className="font-display text-xl">{tp.title}</h2>
            </div>
            <p className="text-sm leading-7">
              <MathText s={tp.define} />
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-[var(--muted)]">مثال‌ها:</span>
              {tp.examples.map((e, j) => (
                <span key={j} className="chip !font-semibold">
                  <MathText s={e} />
                </span>
              ))}
            </div>
            <p className="mt-3 rounded-xl bg-[var(--panel-2)] p-2.5 text-xs leading-6 text-[var(--muted)]">
              <MathText s={`تفاوت: ${tp.diff}`} />
            </p>
          </section>
        ))}

        {/* رابطه‌ی مجموعه‌ها */}
        <section className="card anim-fadeup p-5 md:col-span-2" style={{ animationDelay: "300ms" }}>
          <h2 className="mb-3 font-display text-lg">رشته‌ی مجموعه‌ها</h2>
          <div className="flex flex-wrap items-center gap-2">
            {CHAIN.map((c, i) => (
              <span key={c.s} className="flex items-center gap-2">
                <span className="card-2 flex items-center gap-2 px-3 py-2">
                  <span dir="ltr" className="font-display text-lg text-[var(--accent-strong)]">
                    {c.s}
                  </span>
                  <span className="text-xs font-bold">{c.t}</span>
                </span>
                {i < CHAIN.length - 1 && (
                  <span dir="ltr" className="font-display text-xl text-[var(--muted)]">
                    ⊂
                  </span>
                )}
              </span>
            ))}
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">
            یعنی هر طبیعی، صحیح است؛ هر صحیح، گویاست؛ و هر گویا، حقیقی است — اما برعکس درست نیست.
          </p>
        </section>
      </div>

      {/* روش غربال تعاملی */}
      <section className="card anim-fadeup mt-6 p-5 sm:p-6" style={{ animationDelay: "350ms" }}>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-xl">
            روش غربال اراتوستن — <span className="text-[var(--accent-strong)]">مرحله‌به‌مرحله</span>
          </h2>
          <span className="chip">
            مثال: اعداد اول از ۲ تا ۳۰
          </span>
        </div>
        <p className="mb-4 rounded-xl bg-[var(--accent-soft)] p-3 text-sm font-bold leading-7 text-[var(--accent-strong)]" aria-live="polite">
          {st.title}: {st.text}
        </p>

        <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-10">
          {Array.from({ length: 29 }, (_, i) => i + 2).map((n) => {
            const marked = st.mark.includes(n);
            const prime = st.prime.includes(n);
            return (
              <div
                key={n}
                className={`grid aspect-square place-items-center rounded-lg border text-sm font-extrabold transition-all duration-300 ${
                  marked
                    ? "border-[var(--line)] bg-[var(--panel-2)] text-[var(--muted)] line-through opacity-50"
                    : prime
                      ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-contrast)] shadow-md"
                      : "border-[var(--line)] bg-[var(--panel)]"
                }`}
              >
                {fa(n)}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setStep((s) => Math.min(SIEVE_STEPS.length - 1, s + 1))}
            disabled={step === SIEVE_STEPS.length - 1}
            className="btn btn-accent !px-5 !py-2 text-sm"
          >
            <Icon name="arrow" size={15} /> گام بعدی
          </button>
          <button onClick={() => setStep(0)} className="btn btn-ghost !px-4 !py-2 text-sm">
            <Icon name="refresh" size={14} /> از نو
          </button>
          <span className="text-xs text-[var(--muted)]">
            گام {fa(step + 1)} از {fa(SIEVE_STEPS.length)}
          </span>
        </div>
        <p className="mt-3 text-xs leading-6 text-[var(--muted)]">
          نکته: به جای امتحان بخش‌پذیریِ تک‌تکِ اعداد، فقط باید مضرب‌های هر عدد اولِ پیدا شده را حذف
          کنی — همین‌جوری اعداد اول مثل دانه‌های گندم از آذها «غربال» می‌شوند. (عدد {fa(1)} در این
          جدول نیست چون نه اول است و نه مرکب.)
        </p>
      </section>

      <div className="mt-8 flex justify-center pb-4">
        <button onClick={onGoLevels} className="btn btn-accent w-full max-w-md !py-3.5 text-lg">
          <Icon name="check" size={20} /> مطالعه کردم؛ انتخاب سطح
        </button>
      </div>
    </div>
  );
}
