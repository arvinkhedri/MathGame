import { useState } from "react";
import { Icon, MathText } from "../lib";
import { NARRATORS } from "../data";

export default function Mathematicians({ onPlay }: { onPlay: () => void }) {
  const [open, setOpen] = useState<string>(NARRATORS[0].id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="anim-fadeup mb-6 text-center">
        <h1 className="font-display text-3xl">ریاضی‌دان‌ها و داستان مبحث‌ها</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-[var(--muted)]">
          هر مبحث را ریاضی‌دانی که با آن ارتباط دارد برایت روایت می‌کند. این تصویرها تصویرسازی‌های
          کارتونی‌اند، نه عکس تاریخی. راوی دلخواهت را انتخاب کن یا مستقیم برو سر بازی.
        </p>
      </header>

      <div className="space-y-3">
        {NARRATORS.map((n, i) => {
          const active = open === n.id;
          return (
            <section key={n.id} className="card anim-fadeup overflow-hidden" style={{ animationDelay: `${i * 40}ms` }}>
              <button
                onClick={() => setOpen(active ? "" : n.id)}
                className="flex w-full items-center gap-3 p-4 text-right transition-colors hover:bg-[var(--panel-2)]"
                aria-expanded={active}
              >
                {n.avatar ? (
                  <img src={n.avatar} alt={n.person} className="h-14 w-14 shrink-0 rounded-full border-2 border-[var(--line)] object-cover" />
                ) : (
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] font-display text-2xl text-[var(--accent-strong)]">
                    {n.person.charAt(0)}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-lg leading-tight">{n.person}</span>
                    <span className="chip !text-[10px]">{n.topic}</span>
                  </span>
                  <span className="mt-1 block truncate text-[11px] font-bold text-[var(--accent-strong)]">{n.role}</span>
                </span>
                <Icon
                  name="back"
                  size={18}
                  className={`shrink-0 text-[var(--muted)] transition-transform ${active ? "rotate-90" : "-rotate-90"}`}
                />
              </button>

              {active && (
                <div className="anim-fadeup border-t border-[var(--line)] p-4 sm:p-5">
                  <div className="space-y-2.5">
                    {n.story.map((p, j) => (
                      <p key={j} className="text-sm leading-8">
                        <MathText s={p} />
                      </p>
                    ))}
                  </div>

                  <div className="card-2 mt-4 p-3.5">
                    <p className="mb-2 text-xs font-extrabold text-[var(--accent-strong)]">
                      <MathText s={n.exampleTitle} />
                    </p>
                    <div className="space-y-1.5">
                      {n.example.map((line, j) => (
                        <p key={j} className="text-sm leading-8">
                          <MathText s={line} />
                        </p>
                      ))}
                    </div>
                  </div>

                  {n.fact && (
                    <p className="mt-3 flex items-start gap-2 rounded-xl bg-[var(--accent-soft)] p-3 text-xs leading-6 text-[var(--accent-strong)]">
                      <Icon name="star" size={14} className="mt-0.5 shrink-0" />
                      <MathText s={n.fact} />
                    </p>
                  )}
                  {n.caution && (
                    <p className="mt-3 flex items-start gap-2 rounded-xl bg-[var(--panel-2)] p-3 text-xs leading-6 text-[var(--muted)]">
                      <Icon name="help" size={14} className="mt-0.5 shrink-0" />
                      <MathText s={n.caution} />
                    </p>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>

      <div className="mt-8 flex flex-col items-center gap-2 pb-4 sm:flex-row sm:justify-center">
        <button onClick={onPlay} className="btn btn-accent w-full max-w-xs !py-3 text-base sm:w-auto sm:!px-8">
          <Icon name="play" size={18} /> مستقیم بروم سر بازی؟
        </button>
      </div>
    </div>
  );
}
