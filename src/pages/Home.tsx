import { AvatarView, Icon, fa } from "../lib";
import { AVATARS, findAvatar } from "../data";
import type { Profile } from "../App";
import type { Level } from "../questions";

export default function Home({
  profile,
  best,
  onNav,
}: {
  profile: Profile;
  best: Record<Level, number>;
  onNav: (s: "learn" | "levels" | "mathem" | "assistant" | "feedback") => void;
}) {
  const name = profile.firstName?.trim();
  const avatar = findAvatar(profile.avatarId);
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ");

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr]">
        {/* معرفی — سمت راست */}
        <section className="card anim-fadeup relative overflow-hidden p-6 sm:p-8">
          <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-[var(--accent-soft)]" aria-hidden="true" />
          <span className="chip chip-accent mb-4">
            <Icon name="star" size={13} /> پایه‌ی هشتم • بازی آموزشی ریاضی
          </span>
          <h1 className="font-display text-3xl leading-snug sm:text-4xl">
            {name ? (
              <>
                سلام <span className="text-[var(--accent-strong)]">{name}</span>! آماده‌ای ریاضی رو
                کشف کنی؟
              </>
            ) : (
              "سلام! آماده‌ای ریاضی رو کشف کنی؟"
            )}
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-8 text-[var(--muted)]">
            اول مفهوم‌ها رو یاد بگیر، بعد توی چالش‌های ریاضی رکورد بزن! سطح معمولی یا سمپاد رو انتخاب
            کن و ببین در برابر زمان چند امتیاز می‌گیری.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button onClick={() => onNav("learn")} className="btn btn-accent !px-6 !py-3 text-base">
              <Icon name="book" size={19} /> شروع با آموزش
            </button>
            <button onClick={() => onNav("levels")} className="btn btn-ghost !px-5 !py-3">
              <Icon name="play" size={17} /> مستقیم بروم سر بازی
            </button>
          </div>

          <div className="mt-7 flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--panel-2)] p-3">
            <AvatarView avatar={avatar} custom={profile.customImage} size={46} className="border-2 border-[var(--line)]" />
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold">{fullName || "دانش‌آموز عزیز"}</p>
              <p className="text-xs text-[var(--muted)]">
                همراه با <span className="font-bold text-[var(--accent-strong)]">{avatar.name}</span>
              </p>
            </div>
            <div className="mr-auto flex items-center gap-1.5">
              <span className="chip">
                <Icon name="clock" size={12} /> تایمر
              </span>
              <span className="chip">
                <Icon name="trophy" size={12} /> امتیاز
              </span>
            </div>
          </div>
        </section>

        {/* ستون دوم */}
        <div className="flex flex-col gap-5">
          {/* رکوردها */}
          <section className="card anim-fadeup p-5" style={{ animationDelay: "60ms" }}>
            <h2 className="mb-3 flex items-center gap-2 font-display text-lg">
              <Icon name="trophy" size={18} className="text-[var(--accent-strong)]" /> رکوردهای تو
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  ["normal", "معمولی"],
                  ["sampad", "سمپاد"],
                ] as [Level, string][]
              ).map(([lv, label]) => (
                <div key={lv} className="card-2 p-3 text-center">
                  <p className="text-[11px] font-bold text-[var(--muted)]">رکورد {label}</p>
                  <p className="font-display text-2xl text-[var(--accent-strong)]">
                    {best[lv] > 0 ? fa(best[lv]) : "—"}
                  </p>
                </div>
              ))}
            </div>
            <button onClick={() => onNav("levels")} className="btn btn-soft mt-3 w-full !py-2 text-sm">
              <Icon name="play" size={15} /> ثبت رکورد جدید
            </button>
          </section>

          {/* ریاضی‌دان‌ها */}
          <section className="card anim-fadeup p-5" style={{ animationDelay: "120ms" }}>
            <h2 className="mb-3 flex items-center gap-2 font-display text-lg">
              <Icon name="users" size={18} className="text-[var(--accent-strong)]" /> ریاضی‌دان‌ها و
              داستان مبحث‌ها
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              {AVATARS.slice(1, 7).map((a) => (
                <button key={a.id} onClick={() => onNav("mathem")} title={a.name} className="transition-transform hover:-translate-y-1" aria-label={`داستان ${a.name}`}>
                  <AvatarView avatar={a} size={44} className="border-2 border-[var(--line)]" />
                </button>
              ))}
              <span className="mr-1 text-xs leading-5 text-[var(--muted)]">
                هر مبحث را ریاضی‌دانِ خودش
                <br />
                برایت روایت می‌کند.
              </span>
            </div>
            <button onClick={() => onNav("mathem")} className="btn btn-ghost mt-3 w-full !py-2 text-sm">
              <Icon name="book" size={15} /> خواندن داستان‌ها
            </button>
          </section>

          {/* نشان سمپاد (جای‌نگهدار) */}
          <section className="card anim-fadeup flex items-center gap-3 p-4" style={{ animationDelay: "180ms" }}>
            <span
              className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-2 border-dashed border-[var(--line)] text-[var(--muted)]"
              title="جای‌نگهدار لوگوی سمپاد"
              aria-label="جای‌نگهدار لوگوی سمپاد"
            >
              <Icon name="shield" size={26} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-extrabold">
                سطح <span className="text-[var(--accent-strong)]">سمپاد</span>
              </p>
              <p className="text-[11px] leading-5 text-[var(--muted)]">
                جای‌نگهدار قابل‌تعویض: لوگوی رسمی را در مسیر{" "}
                <code dir="ltr" className="rounded bg-[var(--panel-2)] px-1 py-0.5">public/logo-sampad.svg</code>{" "}
                قرار دهید.
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* پیوندهای سریع */}
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <button onClick={() => onNav("assistant")} className="card anim-fadeup flex items-center gap-3 p-4 text-right transition-colors hover:border-[var(--accent)]" style={{ animationDelay: "220ms" }}>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-strong)]">
            <Icon name="chat" size={22} />
          </span>
          <span>
            <span className="block text-sm font-extrabold">دستیار هوش مصنوعی</span>
            <span className="block text-xs text-[var(--muted)]">مبحثت را بپرس، مرحله‌به‌مرحله یاد بگیر</span>
          </span>
        </button>
        <button onClick={() => onNav("learn")} className="card anim-fadeup flex items-center gap-3 p-4 text-right transition-colors hover:border-[var(--accent)]" style={{ animationDelay: "260ms" }}>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-strong)]">
            <Icon name="book" size={22} />
          </span>
          <span>
            <span className="block text-sm font-extrabold">آموزش مباحث</span>
            <span className="block text-xs text-[var(--muted)]">اول، صحیح، گویا، گنگ، اول و مرکب</span>
          </span>
        </button>
        <button onClick={() => onNav("feedback")} className="card anim-fadeup flex items-center gap-3 p-4 text-right transition-colors hover:border-[var(--accent)]" style={{ animationDelay: "300ms" }}>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-strong)]">
            <Icon name="pen" size={22} />
          </span>
          <span>
            <span className="block text-sm font-extrabold">ثبت نظر و پیشنهاد</span>
            <span className="block text-xs text-[var(--muted)]">نظرت را درباره‌ی بازی بنویس</span>
          </span>
        </button>
      </div>
    </div>
  );
}
