import { useEffect, useState } from "react";
import {
  applyTheme,
  accentContrast,
  withAlpha,
  shade,
  useStored,
  type Theme,
} from "./lib";
import { DEFAULT_ACCENT } from "./data";
import Background from "./components/Background";
import Header from "./components/Header";
import ProfileSetup from "./pages/ProfileSetup";
import Home from "./pages/Home";
import Learn from "./pages/Learn";
import Levels from "./pages/Levels";
import Game from "./pages/Game";
import Mathematicians from "./pages/Mathematicians";
import Assistant from "./pages/Assistant";
import Feedback from "./pages/Feedback";
import type { Level } from "./questions";

export type Profile = {
  firstName: string;
  lastName: string;
  avatarId: string;
  customImage: string;
};

export type Screen =
  | "profile"
  | "home"
  | "learn"
  | "levels"
  | "game"
  | "mathem"
  | "assistant"
  | "feedback";

type Best = Record<Level, number>;

export default function App() {
  const [profile, setProfile] = useStored<Profile | null>("m8.profile", null);
  const [editProfile, setEditProfile] = useState(false);
  const [theme, setTheme] = useStored<Theme>("m8.theme", "light");
  const [accent, setAccent] = useStored<string>("m8.accent", DEFAULT_ACCENT);
  const [screen, setScreen] = useState<Screen>("home");
  const [level, setLevel] = useState<Level>("normal");
  const [best, setBest] = useStored<Best>("m8.best", { normal: 0, sampad: 0 });

  /* اعمال تم و رنگ */
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);
  useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty("--accent", accent);
    r.setProperty("--accent-contrast", accentContrast(accent));
    r.setProperty("--accent-soft", withAlpha(accent, 0.16));
    r.setProperty("--accent-strong", theme === "dark" ? shade(accent, 0.18) : shade(accent, -0.12));
  }, [accent, theme]);

  const nav = (s: Screen) => {
    setEditProfile(false);
    setScreen(s);
    window.scrollTo({ top: 0 });
  };

  const startLevel = (lv: Level) => {
    setLevel(lv);
    nav("game");
  };

  const showProfile = !profile || editProfile;

  return (
    <div className="relative min-h-dvh">
      <Background />
      <div className="relative z-10 flex min-h-dvh flex-col">
        {!showProfile && (
          <Header
            screen={screen}
            onNav={nav}
            profile={profile!}
            onEditProfile={() => setEditProfile(true)}
            theme={theme}
            setTheme={setTheme}
            accent={accent}
            setAccent={setAccent}
            best={best}
          />
        )}

        <main className="flex-1">
          {showProfile ? (
            <ProfileSetup
              key={editProfile ? "edit" : "new"}
              initial={profile ?? undefined}
              onDone={(p) => {
                const wasNew = !profile;
                setProfile(p);
                setEditProfile(false);
                if (wasNew) setScreen("home");
              }}
            />
          ) : screen === "home" ? (
            <Home profile={profile!} best={best} onNav={(s) => nav(s)} />
          ) : screen === "learn" ? (
            <Learn onGoLevels={() => nav("levels")} />
          ) : screen === "levels" ? (
            <Levels best={best} onStart={startLevel} onLearn={() => nav("learn")} />
          ) : screen === "game" ? (
            <Game
              key={level}
              level={level}
              best={best[level]}
              onBest={(lv, sc) => setBest((b) => ({ ...b, [lv]: Math.max(b[lv], sc) }))}
              onNav={(s) => nav(s)}
            />
          ) : screen === "mathem" ? (
            <Mathematicians onPlay={() => nav("levels")} />
          ) : screen === "assistant" ? (
            <Assistant />
          ) : (
            <Feedback />
          )}
        </main>

        <footer className="relative z-10 border-t border-[var(--line)] py-4 text-center text-xs text-[var(--muted)]">
          ریاضی‌بازی پایه‌ی هشتم — طراحی و ساخت: <b className="text-[var(--accent-strong)]">آروین</b>
          <span className="mx-2">•</span>
          آواتارها تصویرسازی کارتونی‌اند، نه عکس تاریخی
        </footer>
      </div>
    </div>
  );
}
