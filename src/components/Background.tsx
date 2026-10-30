import { useEffect, useRef } from "react";
import { useReducedMotion } from "../lib";

/**
 * پس‌زمینه‌ی انیمیشنی: نمادهای ریاضی و اعداد به‌آرامی بالا می‌روند
 * و محو می‌شوند. با prefers-reduced-motion و موبایل سازگار است.
 */
const SYMBOLS = ["π", "√", "∑", "÷", "×", "۷", "۳", "Δ", "۲", "۹", "φ", "+", "٪", "∞", "۱"];

type P = {
  x: number;
  y: number;
  s: number;
  v: number;
  a: number;
  max: number;
  t: string;
  rot: number;
  wob: number;
};

export default function Background() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let raf = 0;
    const DPR = Math.min(2, window.devicePixelRatio || 1);

    const resize = () => {
      w = cv.clientWidth;
      h = cv.clientHeight;
      cv.width = Math.max(1, Math.floor(w * DPR));
      cv.height = Math.max(1, Math.floor(h * DPR));
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const count = Math.min(24, Math.max(10, Math.floor(window.innerWidth / 60)));
    const spawn = (anyY: boolean): P => ({
      x: Math.random() * w,
      y: anyY ? Math.random() * h : h + 50,
      s: 14 + Math.random() * 26,
      v: 0.06 + Math.random() * 0.16,
      a: 0,
      max: 0.05 + Math.random() * 0.1,
      t: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      rot: (Math.random() - 0.5) * 0.4,
      wob: Math.random() * Math.PI * 2,
    });
    const parts = Array.from({ length: count }, () => spawn(true));

    const ink = () =>
      document.documentElement.dataset.theme === "dark"
        ? "148, 160, 214"
        : "72, 66, 130";

    const paint = (staticMode: boolean) => {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        ctx.save();
        ctx.translate(p.x + Math.sin(p.wob) * 16, p.y);
        ctx.rotate(p.rot + (staticMode ? 0 : Math.sin(p.wob) * 0.05));
        ctx.font = `${p.s}px Vazirmatn, sans-serif`;
        ctx.fillStyle = `rgba(${ink()}, ${p.a})`;
        ctx.fillText(p.t, 0, 0);
        ctx.restore();
      }
    };

    if (reduced) {
      for (const p of parts) p.a = p.max * 0.8;
      paint(true);
      const onResize = () => {
        resize();
        paint(true);
      };
      window.addEventListener("resize", onResize);
      return () => {
        window.removeEventListener("resize", onResize);
        window.removeEventListener("resize", resize);
      };
    }

    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(40, now - last) / 16.7;
      last = now;
      for (const p of parts) {
        p.y -= p.v * dt;
        p.wob += 0.006 * dt;
        p.a += (p.max - p.a) * 0.005 * dt;
        if (p.y < -60) Object.assign(p, spawn(false));
      }
      paint(false);
      raf = requestAnimationFrame(tick);
    };
    if (!document.hidden) raf = requestAnimationFrame(tick);
    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [reduced]);

  return (
    <canvas
      ref={ref}
      className="fixed inset-0 h-full w-full pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
