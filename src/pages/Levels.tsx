import { Icon, fa } from "../lib";
import { LEVELS } from "../data";
import type { Level } from "../questions";

export default function Levels({
  best,
  onStart,
  onLearn,
}: {
  best: Record<Level, number>;
  onStart: (lv: Level) => void;
  onLearn: () => void;
}) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="anim-fadeup mb-6 text-center">
        <h1 className="font-display text-3xl">انتخاب سطح بازی</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          یک سطح را انتخاب کن؛ بعد از پایان هر دور می‌توانی سطح دیگر را امتحان کنی.
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        {LEVELS.map((lv, i) => {
          const isSampad = lv.id === "sampad";
          return (
            <section
              key={lv.id}
              className={`card anim-fadeup relative flex flex-col p-6 ${isSampad ? "border-[var(--accent)]" : ""}`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {isSampad && (
                <span className="chip chip-accent absolute -top-3 right-5">
                  <Icon name="star" size={12} /> چالشی
                </span>
              )}
              <div className="mb-3 flex items-center gap-3">
                <span
                  className={`grid h-12 w-12 place-items-center rounded-2xl ${
                    isSampad
                      ? "bg-[var(--accent)] text-[var(--accent-contrast)]"
                      : "bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                  }`}
                >
                  {isSampad ? <Icon name="shield" size={24} /> : <Icon name="play" size={24} />}
                </span>
                <div>
                  <h2 className="font-display text-2xl leading-tight">سطح {lv.name}</h2>
                  <p className="text-xs text-[var(--muted)]">{lv.tagline}</p>
                </div>
              </div>

              <ul className="mb-4 flex flex-wrap gap-1.5">
                {lv.topics.map((t) => (
                  <li key={t} className="chip">
                    {t}
                  </li>
                ))}
              </ul>

              <div className="mb-4 grid grid-cols-3 gap-2 text-center">
                <div className="card-2 p-2">
                  <p className="font-display text-xl text-[var(--accent-strong)]">{fa(lv.count)}</p>
                  <p className="text-[10px] font-bold text-[var(--muted)]">سؤال</p>
                </div>
                <div className="card-2 p-2">
                  <p className="font-display text-xl text-[var(--accent-strong)]">~{fa(lv.minutes)}</p>
                  <p className="text-[10px] font-bold text-[var(--muted)]">دقیقه</p>
                </div>
                <div className="card-2 p-2">
                  <p className="font-display text-xl text-[var(--accent-strong)]">
                    {best[lv.id] > 0 ? fa(best[lv.id]) : "—"}
                  </p>
                  <p className="text-[10px] font-bold text-[var(--muted)]">رکورد تو</p>
                </div>
              </div>

              {isSampad && (
                <p className="mb-4 rounded-xl bg-[var(--panel-2)] p-2.5 text-[11px] leading-5 text-[var(--muted)]">
                  قبل از شروع، یک آموزش کوتاه درباره‌ی «کسرهای تلسکوپی» و «کسرهای مسلسل» با مثال
                  حل‌شده می‌بینی.
                </p>
              )}

              <button onClick={() => onStart(lv.id)} className={`btn mt-auto w-full !py-3 text-base ${isSampad ? "btn-accent" : "btn-soft"}`}>
                <Icon name="play" size={17} /> شروع بازی
              </button>
            </section>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-[var(--muted)]">
        هنوز مطمئن نیستی؟ <button onClick={onLearn} className="font-bold text-[var(--accent-strong)] underline underline-offset-4">اول آموزش را مرور کن</button>
      </p>
    </div>
  );
}
