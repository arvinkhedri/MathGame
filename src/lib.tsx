import React, { useEffect, useState } from "react";

/* ---------- اعداد فارسی ---------- */
const FA_DIGITS = "۰۱۲۴۵۶۸۹";
export const fa = (n: number | string): string =>
  String(n).replace(/\d/g, (d) => FA_DIGITS[+d]);

/** تبدیل ارقام فارسی/عربی به انگلیسی (برای پردازش ورودی دستیار) */
export const toLatin = (s: string): string =>
  s
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-]/g, (d) => String("٠٢٣٤٦٧٨".indexOf(d)))
    .replace(/[−–]/g, "-");

/* ---------- حافظه‌ی محلی ---------- */
export function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
export function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* حافظه در دسترس نیست */
  }
}
export function useStored<T>(key: string, fallback: T) {
  const [v, setV] = useState<T>(() => load(key, fallback));
  const set = (nv: T | ((p: T) => T)) => {
    setV((prev) => {
      const val = typeof nv === "function" ? (nv as (p: T) => T)(prev) : nv;
      save(key, val);
      return val;
    });
  };
  return [v, set] as const;
}

/* ---------- تم و رنگ ---------- */
export type Theme = "light" | "dark";
export function applyTheme(t: Theme) {
  document.documentElement.dataset.theme = t;
}
/** رنگ متن خوانا روی رنگ پس‌زمینه‌ی داده‌شده */
export function accentContrast(hex: string): string {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.66 ? "#241a05" : "#ffffff";
}
export function withAlpha(hex: string, a: number): string {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
export function shade(hex: string, amt: number): string {
  const c = hex.replace("#", "");
  const f = (i: number) => {
    const v = Math.round(Math.min(255, Math.max(0, parseInt(c.slice(i, i + 2), 16) + amt * 255)));
    return v.toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(2)}${f(4)}`;
}

/* ---------- کاهش انیمیشن ---------- */
export function useReducedMotion() {
  const [r, setR] = useState(
    () => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fn = () => setR(mq.matches);
    mq.addEventListener?.("change", fn);
    return () => mq.removeEventListener?.("change", fn);
  }, []);
  return r;
}

/* ---------- رندر ریاضی ساده ----------
   گرامر: \tfrac{صورت}{مخرج}  و  \tsqrt{عدد}
   (در متن‌ها با کاراکتر tab + frac/sqrt نوشته می‌شود) */
export function MathText({ s, className = "" }: { s: string; className?: string }) {
  // نرمال‌سازی: توالی متنی \t (بک‌اسلش + t) را به کاراکتر tab تبدیل می‌کنیم
  const src = s.replace(/\\t/g, "\t");
  const out: React.ReactNode[] = [];
  let rest = src;
  let k = 0;
  let prevMath = false;
  // کاراکترهای «ریاضی» (اعداد، عملگرها، حروف لاتین و ...) — جهت LTR می‌گیرند
  const RUN = /^[\d\s×+−−÷/().,;…%≈²³=√⟹≠⌋a-zA-Z-]+/;
  while (rest.length) {
    const frac = rest.match(/^\tfrac\{([^{}]+)\}\{([^{}]+)\}/);
    if (frac) {
      out.push(
        <span key={k++} dir="ltr" className="math frac text-[0.92em]">
          <span>{fa(frac[1])}</span>
          <span>{fa(frac[2])}</span>
        </span>
      );
      rest = rest.slice(frac[0].length);
      prevMath = true;
      continue;
    }
    const sqrt = rest.match(/^\tsqrt\{([^{}]+)\}/);
    if (sqrt) {
      out.push(
        <span key={k++} dir="ltr" className="math sqrt">
          <span className="rad">√</span>
          <span className="rad-body">{fa(sqrt[1])}</span>
        </span>
      );
      rest = rest.slice(sqrt[0].length);
      prevMath = true;
      continue;
    }
    const run = rest.match(RUN);
    const trimmed = run ? run[0].trim() : "";
    const startsMath = run ? /^[\d√(a-zA-Z−-]/.test(trimmed) : false;
    if (run && (startsMath || (prevMath && trimmed.length > 0))) {
      out.push(
        <span key={k++} dir="ltr" className="math">
          {fa(run[0])}
        </span>
      );
      rest = rest.slice(run[0].length);
      prevMath = true;
      continue;
    }
    out.push(rest[0]);
    rest = rest.slice(1);
    prevMath = false;
  }
  return <span className={className}>{out}</span>;
}

/* ---------- آواتارها ---------- */
export type Avatar = { id: string; name: string; img?: string };
export function AvatarView({
  avatar,
  custom,
  size = 56,
  className = "",
}: {
  avatar: Avatar | undefined;
  custom?: string;
  size?: number;
  className?: string;
}) {
  const style = { width: size, height: size };
  const src = avatar?.id === "upload" ? custom : avatar?.img;
  if (src) {
    return (
      <img
        src={src}
        alt={avatar?.name ?? "آواتار"}
        style={style}
        className={`rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }
  return (
    <div
      style={{ ...style, fontSize: size * 0.42 }}
      className={`rounded-full grid place-items-center shrink-0 border-2 ${className}`}
    >
      <span className="font-display leading-none">
        {(avatar?.name ?? "؟").trim().charAt(0)}
      </span>
    </div>
  );
}

/* ---------- ستاره‌های امتیازدهی ---------- */
export function Stars({
  value,
  onChange,
  size = 26,
}: {
  value: number;
  onChange?: (n: number) => void;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="امتیاز از ۵">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={n === value}
          disabled={!onChange}
          onClick={() => onChange?.(n === value ? 0 : n)}
          className="p-0.5 transition-transform hover:scale-110 disabled:cursor-default"
        >
          <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 2.6l2.9 5.9 6.5.95-4.7 4.58 1.1 6.47L12 17.44 6.2 20.5l1.1-6.47L2.6 9.45l6.5-.95z"
              fill={n <= value ? "var(--accent)" : "none"}
              stroke={n <= value ? "var(--accent)" : "var(--muted)"}
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ))}
    </div>
  );
}

/* ---------- آیکون‌های کوچک ---------- */
export function Icon({ name, size = 20, className = "" }: { name: string; size?: number; className?: string }) {
  const paths: Record<string, React.ReactNode> = {
    home: <path d="M3 11l9-8 9 8v9a2 2 0 01-2 2h-4v-7h-6v7H5a2 2 0 01-2-2z" />,
    book: <path d="M4 4.5A2.5 2.5 0 016.5 2H20v18H6.5A2.5 2.5 0 004 22.5zm0 15A2.5 2.5 0 016.5 17H20" />,
    play: <path d="M7 4.5v15l13-7.5z" />,
    users: (
      <>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20c.8-3.4 3.4-5 6.5-5s5.7 1.6 6.5 5M16 4.6a3.5 3.5 0 010 6.8M18.5 15.4c1.7.7 2.7 2.2 3 4.6" />
      </>
    ),
    chat: <path d="M21 12a8.5 8.5 0 01-8.5 8.5c-1.5 0-3-.4-4.2-1.1L3 21l1.6-5.3A8.5 8.5 0 1121 12z" />,
    pen: <path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 013 3L8 19zm10.5-14.5l3 3" />,
    sun: (
      <>
        <circle cx="12" cy="12" r="4.5" />
        <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8" />
      </>
    ),
    moon: <path d="M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z" />,
    x: <path d="M5 5l14 14M19 5L5 19" />,
    check: <path d="M4 12.5l5 5L20 6.5" />,
    back: <path d="M9 5l7 7-7 7" />,
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    trophy: (
      <>
        <path d="M8 21h8M12 17v4M7 4h10v6a5 5 0 01-10 0z" />
        <path d="M7 5H4v2a4 4 0 004 4M17 5h3v2a4 4 0 01-4 4" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5.5l3.5 2" />
      </>
    ),
    trash: <path d="M4 7h16M9 7V4h6v3m-8 0l1 13h8l1-13" />,
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9.5a2.5 2.5 0 114 2c-.9.7-1.5 1.2-1.5 2.3M12 17.2v.1" />
      </>
    ),
    send: <path d="M3 11.5L21 3l-6.5 18-3-7.5z" />,
    plus: <path d="M12 5v14M5 12h14" />,
    star: <path d="M12 2.6l2.9 5.9 6.5.95-4.7 4.58 1.1 6.47L12 17.44 6.2 20.5l1.1-6.47L2.6 9.45l6.5-.95z" />,
    edit: <path d="M4 20h16M6 15.5L15.5 6a2 2 0 013 3L9 18.5l-4 1z" />,
    refresh: <path d="M20 12a8 8 0 11-2.3-5.6M20 3v5h-5" />,
    shield: <path d="M12 2l8 3.5v6c0 5-3.5 8.5-8 10.5-4.5-2-8-5.5-8-10.5v-6z" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name] ?? null}
    </svg>
  );
}
