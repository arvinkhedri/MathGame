import { useState } from "react";
import { Stars, Icon, fa, load, save } from "../lib";

type Note = { stars: number; text: string; date: string };
const KEY = "m8.feedback";

export default function Feedback() {
  const [stars, setStars] = useState(0);
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);
  const [notes, setNotes] = useState<Note[]>(() => load<Note[]>(KEY, []));

  const MAX = 800;

  const submit = () => {
    if (status === "sending") return;
    if (!text.trim()) {
      setStatus("error");
      setError("متن نظرت خالی است؛ چند کلمه بنویس تا نظر ثبت شود.");
      return;
    }
    setStatus("sending");
    setError("");
    // حالت نمونه: ذخیره در حافظه‌ی محلی. برای ثبت مشترک، به‌جای این بخش
    // درخواست POST به /api/feedback (واسطِ سمت سرور) بفرست.
    window.setTimeout(() => {
      try {
        const note: Note = {
          stars,
          text: text.trim(),
          date: new Date().toLocaleDateString("fa-IR"),
        };
        const next = [note, ...load<Note[]>(KEY, [])].slice(0, 20);
        save(KEY, next);
        setNotes(next);
        setStatus("ok");
        setText("");
        setStars(0);
        setPreview(false);
      } catch {
        setStatus("error");
        setError("ثبت نظر مشکل داشت؛ حافظه‌ی مرورگر در دسترس نیست. دوباره تلاش کن.");
      }
    }, 700);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="anim-fadeup mb-6">
        <h1 className="font-display text-3xl">ثبت نظر و پیشنهاد</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          درباره‌ی بازی هرچه تو دلت است بنویس؛ نظرت را قبل از ارسال بازبینی کن.
        </p>
      </header>

      <div className="card anim-fadeup p-5 sm:p-6" style={{ animationDelay: "80ms" }}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <span className="label !mb-0">امتیاز (اختیاری)</span>
          <Stars value={stars} onChange={() => setStatus("idle")} />
        </div>

        <label className="label" htmlFor="fb">
          نظر یا پیشنهادت
        </label>
        <textarea
          id="fb"
          className="input min-h-32 resize-y leading-7"
          value={text}
          maxLength={MAX}
          onChange={(e) => {
            setText(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          placeholder="مثلاً: دوست دارم سؤال‌های بیشتری از روش غربال داشته باشد…"
        />
        <div className="mt-1 flex justify-end text-[11px] text-[var(--muted)]">
          {fa(text.length)} / {fa(MAX)}
        </div>

        <button
          onClick={() => setPreview((p) => !p)}
          disabled={!text.trim()}
          className="btn btn-ghost mt-1 w-full !py-2 text-sm"
        >
          <Icon name="pen" size={15} />
          {preview ? "پایان بازبینی" : "بازبینی پیش از ارسال"}
        </button>

        {preview && (
          <div className="anim-pop mt-3 rounded-xl border border-dashed border-[var(--line)] bg-[var(--panel-2)] p-3.5">
            <p className="mb-1 text-[11px] font-bold text-[var(--muted)]">آنچه ارسال می‌شود:</p>
            <div className="mb-2 flex items-center gap-2">
              <Stars value={stars} size={16} />
              {stars === 0 && <span className="text-[11px] text-[var(--muted)]">بدون امتیاز</span>}
            </div>
            <p className="whitespace-pre-wrap text-sm leading-7">{text || "—"}</p>
          </div>
        )}

        {status === "error" && (
          <div className="anim-pop mt-3 flex items-start gap-2 rounded-xl border border-[var(--bad)] bg-[color-mix(in_srgb,var(--bad)_8%,transparent)] px-3 py-2.5 text-sm font-bold leading-6 text-[var(--bad)]" role="alert">
            <Icon name="help" size={16} className="mt-1 shrink-0" />
            <span>
              {error}
              <button onClick={submit} className="mx-1 underline underline-offset-4">
                تلاش دوباره
              </button>
            </span>
          </div>
        )}
        {status === "ok" && (
          <div className="anim-pop mt-3 flex items-center gap-2 rounded-xl border border-[var(--ok)] bg-[color-mix(in_srgb,var(--ok)_10%,transparent)] px-3 py-2.5 text-sm font-bold text-[var(--ok)]" role="status">
            <Icon name="check" size={16} />
            نظرت ثبت شد؛ ممنون که بازخورد دادی!
          </div>
        )}

        <button
          onClick={submit}
          disabled={status === "sending"}
          className="btn btn-accent mt-4 w-full !py-3"
        >
          {status === "sending" ? (
            <>
              <Icon name="refresh" size={16} className="animate-spin" /> در حال ثبت…
            </>
          ) : (
            <>
              <Icon name="send" size={16} className="-scale-x-100" /> ثبت نظر
            </>
          )}
        </button>

        <p className="mt-3 text-[11px] leading-5 text-[var(--muted)]">
          فقط متن نظر (و امتیاز اختیاری) ارسال می‌شود؛ نام کامل و تصویر پروفایل همراه نظر فرستاده
          نمی‌شود. در این نسخه‌ی نمونه نظرها در حافظه‌ی محلی مرورگر ثبت می‌شوند؛ برای ثبت مشترک، محل
          اتصال به واسطِ سرور (<code dir="ltr">/api/feedback</code>) در همین فایل پیش‌بینی شده است.
        </p>
      </div>

      {notes.length > 0 && (
        <div className="card anim-fadeup mt-5 p-5" style={{ animationDelay: "140ms" }}>
          <h2 className="mb-3 text-sm font-extrabold text-[var(--muted)]">
            نظرات ثبت‌شده در این مرورگر ({fa(notes.length)})
          </h2>
          <ul className="space-y-2.5">
            {notes.slice(0, 5).map((n, i) => (
              <li key={i} className="card-2 p-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <Stars value={n.stars} size={14} />
                  <span className="text-[10px] text-[var(--muted)]">{n.date}</span>
                </div>
                <p className="text-sm leading-7">{n.text}</p>
              </li>
            ))}
          </ul>
          <button
            onClick={() => {
              setNotes([]);
              save(KEY, []);
            }}
            className="mt-3 text-xs font-bold text-[var(--bad)] underline-offset-2 hover:underline"
          >
            پاک‌کردن نظرات محلی
          </button>
        </div>
      )}
    </div>
  );
}
