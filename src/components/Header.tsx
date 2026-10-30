import { useEffect, useRef, useState } from "react";
import { AvatarView, Icon, fa } from "../lib";
import { ACCENT_PRESETS, DEFAULT_ACCENT, findAvatar } from "../data";
import type { Profile } from "../App";
import type { Theme } from "../lib";

type Screen =
  | "profile"
  | "home"
  | "learn"
  | "levels"
  | "game"
  | "mathem"
  | "assistant"
  | "feedback";

const NAV: { id: Screen; label: string; icon: string }[] = [
  { id: "home", label: "خانه", icon: "home" },
  { id: "learn", label: "آموزش", icon: "book" },
  { id: "levels", label: "بازی", icon: "play" },
  { id: "mathem", label: "ریاضی‌دان‌ها", icon: "users" },
  { id: "assistant", label: "دستیار", icon: "chat" },
  { id: "feedback", label: "نظرات", icon: "pen" },
];

export default function Header({
  screen,
  onNav,
  profile,
  onEditProfile,
  theme,
  setTheme,
  accent,
  setAccent,
  best,
}: {
  screen: Screen;
  onNav: (s: Screen) => void;
  profile: Profile;
  onEditProfile: () => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  accent: string;
  setAccent: (a: string) => void;
  best: { normal: number; sampad: number };
}) {
  const [open, setOpen] = useState(false);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const avatar = findAvatar(profile.avatarId);
  const isDefaultAccent = accent.toLowerCase() === DEFAULT_ACCENT.toLowerCase();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--panel)_82%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-2 sm:px-5">
        {/* لوگو */}
        <button
          onClick={() => onNav("home")}
          className="flex items-center gap-2 rounded-xl px-1.5 py-1 transition-colors hover:opacity-80"
          aria-label="خانه"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] shadow-md">
            <span className="font-display text-lg leading-none">√π</span>
          </span>
          <span className="hidden flex-col items-start leading-tight sm:flex">
            <span className="font-display text-lg leading-none">ریاضی‌بازی هشتم</span>
            <span className="text-[11px] text-[var(--muted)]">ساخته: آروین</span>
          </span>
        </button>

        {/* منو */}
        <nav className="mx-auto flex items-center gap-0.5 overflow-x-auto rounded-xl" aria-label="منوی اصلی">
          {NAV.map((n) => {
            const active = screen === n.id || (n.id === "levels" && screen === "game");
            return (
              <button
                key={n.id}
                onClick={() => onNav(n.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[13px] font-bold transition-colors sm:text-sm ${
                  active
                    ? "bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                    : "text-[var(--muted)] hover:bg-[var(--panel-2)] hover:text-[var(--text)]"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <Icon name={n.icon} size={16} />
                <span>{n.label}</span>
                {n.id === "levels" && (best.normal + best.sampad > 0 && (
                  <span className="chip chip-accent hidden md:inline-flex !px-1.5 !py-0 !text-[10px]">
                    <Icon name="trophy" size={11} /> {fa(Math.max(best.normal, best.sampad))}
                  </span>
                ))}
              </button>
            );
          })}
        </nav>

        {/* کنترل‌های ظاهر */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--line)] bg-[var(--panel)] text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
            title={theme === "dark" ? "حالت روشن" : "حالت تاریک"}
            aria-label="تغییر حالت روشن/تاریک"
          >
            <Icon name={theme === "dark" ? "sun" : "moon"} size={18} />
          </button>

          <div className="relative" ref={popRef}>
            <button
              onClick={() => setOpen((o) => !o)}
              className="h-9 w-9 rounded-xl border border-[var(--line)] bg-[var(--panel)] transition-transform hover:scale-105"
              style={{ background: `linear-gradient(135deg, var(--accent) 50%, var(--panel) 50%)` }}
              title="رنگ اصلی رابط"
              aria-label="انتخاب رنگ اصلی"
            />
            {open && (
              <div className="anim-pop card absolute left-0 top-11 w-60 p-3" dir="rtl">
                <p className="mb-2 text-xs font-bold text-[var(--muted)]">رنگ اصلی رابط کاربری</p>
                <div className="grid grid-cols-6 gap-1.5">
                  {ACCENT_PRESETS.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setAccent(p.value)}
                      className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                        accent.toLowerCase() === p.value.toLowerCase()
                          ? "border-[var(--text)]"
                          : "border-transparent"
                      }`}
                      style={{ background: p.value }}
                      title={p.name}
                      aria-label={p.name}
                    />
                  ))}
                </div>
                <label className="mt-3 flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-dashed border-[var(--line)] px-2.5 py-2 text-xs font-bold text-[var(--muted)] hover:border-[var(--accent)]">
                  <span>رنگ دلخواه</span>
                  <input
                    type="color"
                    value={accent}
                    onChange={(e) => setAccent(e.target.value)}
                    className="h-7 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
                    aria-label="انتخاب رنگ دلخواه"
                  />
                </label>
                <button
                  onClick={() => setAccent(DEFAULT_ACCENT)}
                  disabled={isDefaultAccent}
                  className="btn btn-ghost mt-2 w-full !py-1.5 text-xs"
                >
                  <Icon name="refresh" size={14} /> بازگشت به رنگ پیش‌فرض
                </button>
              </div>
            )}
          </div>

          {/* پروفایل */}
          <button
            onClick={onEditProfile}
            className="mr-1 flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--panel)] py-1 pl-3 pr-1 transition-colors hover:border-[var(--accent)]"
            title="ویرایش پروفایل"
          >
            <AvatarView avatar={avatar} custom={profile.customImage} size={30} className="border border-[var(--line)]" />
            <span className="hidden max-w-24 truncate text-xs font-bold md:block">
              {profile.firstName}
            </span>
            <Icon name="edit" size={13} className="text-[var(--muted)]" />
          </button>
        </div>
      </div>
    </header>
  );
}
