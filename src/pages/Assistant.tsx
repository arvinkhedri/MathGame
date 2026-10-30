import { useEffect, useRef, useState } from "react";
import { Icon, MathText, useReducedMotion } from "../lib";
import {
  SUGGESTIONS,
  askAssistant,
  resetAssistantCtx,
  type CancelToken,
  type ChatMsg,
} from "../assistant";

const GREETING =
  "سلام! من دستیار ریاضی‌بازی‌ام. درباره‌ی اعداد اول و مرکب، گویا و گنگ، روش غربال، رادیکال‌ها، کسرهای تلسکوپی و کسرهای مسلسل هر سوالی داری بپرس؛ مرحله‌به‌مرحله و با مثال توضیح می‌دهم.";

function Bubble({ m, onRetry }: { m: ChatMsg; onRetry?: () => void }) {
  const isUser = m.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-start flex-row-reverse" : ""}`}>
      {!isUser && (
        <span className="ml-2 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-[var(--accent-contrast)]">
          <Icon name="chat" size={15} />
        </span>
      )}
      <div
        className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-8 ${
          isUser
            ? "rounded-tr-md bg-[var(--accent)] text-[var(--accent-contrast)]"
            : m.error
              ? "rounded-tl-md border border-[var(--bad)] bg-[color-mix(in_srgb,var(--bad)_8%,transparent)]"
              : "rounded-tl-md bg-[var(--panel)] border border-[var(--line)]"
        }`}
      >
        {isUser ? (
          m.text
        ) : m.error ? (
          <div>
            <p className="flex items-center gap-2 font-bold text-[var(--bad)]">
              <Icon name="help" size={15} /> ارتباط با دستیار برقرار نشد.
            </p>
            {onRetry && (
              <button onClick={onRetry} className="btn btn-ghost mt-2 !px-3 !py-1 text-xs">
                <Icon name="refresh" size={13} /> تلاش دوباره
              </button>
            )}
          </div>
        ) : (
          m.text.split("\n").map((line, i) => (
            <p key={i} className={line === "---" ? "mx-auto my-1 w-16 border-t border-[var(--line)]" : ""}>
              {line === "---" ? null : <MathText s={line} />}
            </p>
          ))
        )}
      </div>
    </div>
  );
}

export default function Assistant() {
  const [msgs, setMsgs] = useState<ChatMsg[]>([{ role: "assistant", text: GREETING }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const cancelRef = useRef<CancelToken | null>(null);
  const lastUserRef = useRef<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "end" });
  }, [msgs, busy, reduced]);

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || busy) return;
    lastUserRef.current = text;
    setMsgs((m) => [...m, { role: "user", text }]);
    setInput("");
    setBusy(true);
    const token: CancelToken = { cancelled: false };
    cancelRef.current = token;
    try {
      const reply = await askAssistant(text, token);
      if (!token.cancelled) setMsgs((m) => [...m, { role: "assistant", text: reply }]);
    } catch (e) {
      if ((e as Error).message === "cancelled") return;
      setMsgs((m) => [...m, { role: "assistant", text: "error", error: true }]);
    } finally {
      if (cancelRef.current === token) {
        cancelRef.current = null;
        setBusy(false);
      }
    }
  };

  const cancel = () => {
    if (cancelRef.current) cancelRef.current.cancelled = true;
    setBusy(false);
  };

  const retry = () => {
    if (lastUserRef.current) {
      setMsgs((m) => m.filter((x) => !x.error));
      void send(lastUserRef.current!);
    }
  };

  const clear = () => {
    cancel();
    setMsgs([{ role: "assistant", text: GREETING }]);
    resetAssistantCtx();
  };

  return (
    <div className="mx-auto flex h-[calc(100dvh-140px)] max-w-3xl flex-col px-4 py-4 sm:px-6">
      <div className="card flex flex-1 flex-col overflow-hidden">
        {/* سربرگ */}
        <div className="flex items-center gap-2 border-b border-[var(--line)] p-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)]">
            <Icon name="chat" size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-lg leading-tight">دستیار هوش مصنوعی ریاضی</h1>
            <p className="text-[11px] text-[var(--muted)]">پاسخ‌ها مرحله‌به‌مرحله و مناسب پایه‌ی هشتم</p>
          </div>
          <button
            onClick={clear}
            className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--line)] text-[var(--muted)] transition-colors hover:border-[var(--bad)] hover:text-[var(--bad)]"
            title="پاک‌کردن گفت‌وگو"
            aria-label="پاک‌کردن گفت‌وگو"
          >
            <Icon name="trash" size={16} />
          </button>
        </div>

        {/* پیام‌ها */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {msgs.map((m, i) => (
            <Bubble key={i} m={m} onRetry={m.error ? retry : undefined} />
          ))}

          {busy && (
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--accent)] text-[var(--accent-contrast)]">
                <Icon name="chat" size={15} />
              </span>
              <div className="flex items-center gap-1.5 rounded-2xl rounded-tr-md border border-[var(--line)] bg-[var(--panel)] px-4 py-3">
                <span className="text-xs font-bold text-[var(--muted)]">در حال پاسخ‌گویی</span>
                <span className="dot h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                <span className="dot h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                <span className="dot h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                <button onClick={cancel} className="mr-2 text-[11px] font-bold text-[var(--bad)] underline-offset-2 hover:underline">
                  لغو
                </button>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* پیشنهادات */}
        <div className="flex gap-1.5 overflow-x-auto border-t border-[var(--line)] px-3 pt-2 pb-1">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => void send(s)}
              disabled={busy}
              className="chip shrink-0 transition-colors hover:border-[var(--accent)] hover:text-[var(--accent-strong)] disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>

        {/* ورودی */}
        <form
          className="flex gap-2 p-3"
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
        >
          <input
            className="input !py-2.5"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="مثلاً: عدد ۴۱ اول است؟"
            aria-label="پیام به دستیار"
          />
          <button type="submit" disabled={busy || !input.trim()} className="btn btn-accent !px-4 !py-2.5" aria-label="ارسال">
            <Icon name="send" size={18} className="-scale-x-100" />
          </button>
        </form>
      </div>

      {/* توضیح حالت نمونه */}
      <details className="card mt-3 p-4 text-xs leading-6 text-[var(--muted)]">
        <summary className="cursor-pointer font-extrabold text-[var(--text)]">
          درباره‌ی اتصال هوش مصنوعی (حالت نمونه)
        </summary>
        <div className="mt-2 space-y-1.5">
          <p>
            در این نسخه، دستیار از یک <b>پاسخ‌دهنده‌ی محلیِ آماده</b> استفاده می‌کند تا همه‌ی قابلیت‌ها
            (گفت‌وگو، راهنمایی مرحله‌ای، «نشان بده»، لغو و پاک‌کردن) قابل‌آزمون باشند.
          </p>
          <p>
            برای اتصال به سرویس واقعی: ۱) یک واسطِ سمت سرور بسازید (مثلاً <code dir="ltr">/api/assistant</code>)؛
            ۲) کلید API را <b>فقط در محیطِ سرور</b> نگه دارید، هرگز در کد سمت مرورگر؛ ۳) در فایل{" "}
            <code dir="ltr">src/assistant.ts</code> بدنه‌ی تابع <code dir="ltr">askAssistant</code> را به
            یک <code dir="ltr">fetch</code> به آن واسط تغییر دهید. راهنمای دقیق در ابتدای همان فایل نوشته شده است.
          </p>
        </div>
      </details>
    </div>
  );
}
