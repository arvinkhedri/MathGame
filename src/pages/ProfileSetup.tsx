import { useRef, useState } from "react";
import { AvatarView, Icon } from "../lib";
import { AVATARS } from "../data";
import type { Profile } from "../App";

export default function ProfileSetup({
  initial,
  onDone,
}: {
  initial?: Profile;
  onDone: (p: Profile) => void;
}) {
  const [firstName, setFirstName] = useState(initial?.firstName ?? "");
  const [lastName, setLastName] = useState(initial?.lastName ?? "");
  const [avatarId, setAvatarId] = useState(initial?.avatarId ?? "default");
  const [customImage, setCustomImage] = useState(initial?.customImage ?? "");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const valid = firstName.trim().length >= 2;
  const isUpload = avatarId === "upload";

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) {
      setError("حجم تصویر باید کمتر از ۲ مگابایت باشد.");
      return;
    }
    const r = new FileReader();
    r.onload = () => {
      setCustomImage(String(r.result));
      setAvatarId("upload");
      setError("");
    };
    r.onerror = () => setError("خواندن فایل تصویر مشکل داشت؛ دوباره تلاش کن.");
    r.readAsDataURL(f);
  };

  const submit = () => {
    if (!valid) {
      setError("برای ادامه، لطفاً نامت را کامل بنویس (حداقل ۲ حرف).");
      return;
    }
    if (isUpload && !customImage) {
      setError("تصویر بارگذاری نشد؛ می‌توانی از آواتارهای آماده استفاده کنی یا تصویر را دوباره انتخاب کنی.");
      return;
    }
    onDone({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      avatarId,
      customImage: isUpload ? customImage : "",
    });
  };

  return (
    <div className="anim-fadeup mx-auto w-full max-w-2xl px-4 py-8 sm:py-12">
      <div className="card p-5 sm:p-8">
        <div className="mb-1 flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)]">
            <span className="font-display text-xl leading-none">√π</span>
          </span>
          <div>
            <h1 className="font-display text-2xl leading-tight">
              {initial ? "ویرایش پروفایل" : "خوش اومدی به ریاضی‌بازی هشتم"}
            </h1>
            <p className="text-sm text-[var(--muted)]">
              {initial
                ? "نام یا آواتارت را عوض کن."
                : "اول پروفایلت را بساز؛ بعد آموزش و بازی شروع می‌شود."}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="fname">
              نام *
            </label>
            <input
              id="fname"
              className="input"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                setError("");
              }}
              placeholder="مثلاً: سارا"
              autoComplete="given-name"
            />
          </div>
          <div>
            <label className="label" htmlFor="lname">
              نام خانوادگی (اختیاری)
            </label>
            <input
              id="lname"
              className="input"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="مثلاً: احمدی"
              autoComplete="family-name"
            />
          </div>
        </div>

        <div className="mt-6">
          <span className="label">
            یک ریاضی‌دان برای خودت انتخاب کن <span className="font-normal">(یا تصویری بارگذاری کن)</span>
          </span>
          <div className="snap-row" role="listbox" aria-label="انتخاب آواتار">
            {AVATARS.map((a) => {
              const sel = avatarId === a.id;
              return (
                <button
                  key={a.id}
                  role="option"
                  aria-selected={sel}
                  onClick={() => {
                    setAvatarId(a.id);
                    setError("");
                  }}
                  className="flex w-[76px] flex-col items-center gap-1.5 rounded-2xl p-2 transition-colors hover:bg-[var(--panel-2)]"
                >
                  <span
                    className={`rounded-full p-[3px] transition-all ${
                      sel ? "bg-[var(--accent)] shadow-md" : "bg-transparent"
                    }`}
                  >
                    <AvatarView
                      avatar={a}
                      size={58}
                      className={`border-2 ${sel ? "border-transparent" : "border-[var(--line)]"}`}
                    />
                  </span>
                  <span
                    className={`w-full truncate text-center text-[11px] font-bold ${
                      sel ? "text-[var(--accent-strong)]" : "text-[var(--muted)]"
                    }`}
                  >
                    {a.name}
                  </span>
                  {sel && (
                    <span className="chip chip-accent !py-0 !text-[10px]">
                      <Icon name="check" size={10} /> انتخاب شد
                    </span>
                  )}
                </button>
              );
            })}

            {/* بارگذاری تصویر */}
            <button
              role="option"
              aria-selected={isUpload}
              onClick={() => {
                if (!isUpload) {
                  setAvatarId("upload");
                  setError("");
                }
                fileRef.current?.click();
              }}
              className="flex w-[76px] flex-col items-center gap-1.5 rounded-2xl p-2 transition-colors hover:bg-[var(--panel-2)]"
            >
              <span
                className={`grid place-items-center rounded-full border-2 p-[3px] ${
                  isUpload ? "bg-[var(--accent)]" : "border-transparent"
                }`}
              >
                {isUpload && customImage ? (
                  <img
                    src={customImage}
                    alt="تصویر انتخاب‌شده"
                    className="h-[58px] w-[58px] rounded-full object-cover border-2 border-transparent"
                  />
                ) : (
                  <span className="grid h-[58px] w-[58px] place-items-center rounded-full border-2 border-dashed border-[var(--line)] text-[var(--muted)]">
                    <Icon name="plus" size={22} />
                  </span>
                )}
              </span>
              <span
                className={`text-center text-[11px] font-bold ${
                  isUpload ? "text-[var(--accent-strong)]" : "text-[var(--muted)]"
                }`}
              >
                تصویر خودت
              </span>
              {isUpload && (
                <span className="chip chip-accent !py-0 !text-[10px]">
                  <Icon name="check" size={10} /> انتخاب شد
                </span>
              )}
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
          {isUpload && customImage && (
            <button
              onClick={() => {
                setAvatarId("default");
                setCustomImage("");
              }}
              className="mt-1 text-xs font-bold text-[var(--bad)] underline-offset-2 hover:underline"
            >
              حذف تصویر بارگذاری‌شده
            </button>
          )}
          <p className="mt-2 text-[11px] leading-5 text-[var(--muted)]">
            این تصویرها تصویرسازی‌های کارتونی‌اند، نه عکس تاریخی. اطلاعات پروفایل فقط در مرورگر خودت
            ذخیره می‌شود و به هیچ سروری ارسال نمی‌گردد.
          </p>
        </div>

        {error && (
          <div className="anim-pop mt-4 flex items-center gap-2 rounded-xl border border-[var(--bad)] bg-[color-mix(in_srgb,var(--bad)_10%,transparent)] px-3 py-2 text-sm font-bold text-[var(--bad)]" role="alert">
            <Icon name="help" size={16} />
            {error}
          </div>
        )}

        <button onClick={submit} disabled={!valid} className="btn btn-accent mt-6 w-full !py-3 text-base">
          <Icon name="check" size={18} />
          {initial ? "ذخیره تغییرات" : "ذخیره و ادامه"}
        </button>
        {!valid && (
          <p className="mt-2 text-center text-xs text-[var(--muted)]">
            برای ادامه، حداقل نامت را بنویس.
          </p>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-[var(--muted)]">
        ریاضی‌بازی پایه‌ی هشتم — طراحی و ساخت: آروین
      </p>
    </div>
  );
}
