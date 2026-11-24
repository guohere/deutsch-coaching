"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Brain,
  CalendarRange,
  Compass,
  Layers,
  Menu,
  MessageCircle,
  Mic,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import {
  installMobileAudioUnlockListener,
  unlockMobileAudio,
} from "@/lib/speech";

interface QuickStatus {
  provider: string;
  currentLevel: string;
  targetLevel: string;
  goalTitle: string;
}

const NAV_ITEMS = [
  { href: "/", label: "Today", icon: Compass },
  { href: "/chat", label: "Free Chat", icon: MessageCircle },
  { href: "/exercises", label: "Exercises", icon: Layers },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/plan", label: "Study Plan", icon: CalendarRange },
  { href: "/memory", label: "Memory", icon: Brain },
  { href: "/settings", label: "Settings", icon: Settings },
];

const MOBILE_PRIMARY_TABS = [
  { href: "/", label: "Today", icon: Compass },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/exercises", label: "Exercises", icon: Layers },
  { href: "/plan", label: "Plan", icon: CalendarRange },
];

const MOBILE_MORE_ITEMS = [
  { href: "/progress", label: "Progress", desc: "Readiness & exam mastery scores", icon: BarChart3 },
  { href: "/memory", label: "Memory", desc: "Tracked bottlenecks & saved vocab", icon: Brain },
  { href: "/settings", label: "Settings", desc: "AI model, iPhone voice & Whisper", icon: Settings },
];

const PROVIDER_LABELS: Record<string, { label: string; dot: string }> = {
  gemini: { label: "Gemini AI", dot: "bg-emerald-500" },
  groq: { label: "Groq AI", dot: "bg-emerald-500" },
  ollama: { label: "Local Ollama", dot: "bg-teal-500" },
  demo: { label: "Demo Coach", dot: "bg-amber-500" },
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [status, setStatus] = useState<QuickStatus | null>(null);
  const [starting, setStarting] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);

  useEffect(() => {
    installMobileAudioUnlockListener();
  }, []);

  useEffect(() => {
    setMobileMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    let active = true;
    // Only fetch the ultra-light 150-byte status endpoint on initial mount (or when entering/leaving settings)
    // instead of downloading the entire 250KB database on every page switch!
    if (status && pathname !== "/settings") return;
    fetch("/api/state?lite=1")
      .then((r) => r.json())
      .then((data) => {
        if (!active || !data?.profile) return;
        setStatus({
          provider: data.aiConfig?.provider ?? "demo",
          currentLevel: data.profile.currentLevel,
          targetLevel: data.profile.targetLevel,
          goalTitle: data.profile.goalTitle,
        });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [pathname, status]);

  async function handleQuickStart() {
    if (starting) return;
    unlockMobileAudio();
    setStarting(true);
    setMobileMoreOpen(false);
    try {
      const res = await fetch("/api/sessions/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data?.session?.id) {
        router.push(`/session/${data.session.id}`);
      }
    } finally {
      setStarting(false);
    }
  }

  const providerMeta =
    PROVIDER_LABELS[status?.provider ?? "demo"] ?? PROVIDER_LABELS.demo;
  const isSessionPage = pathname.startsWith("/session/");
  const isChatPage = pathname.startsWith("/chat");
  const isMoreActive = MOBILE_MORE_ITEMS.some((item) =>
    pathname.startsWith(item.href)
  );

  return (
    <div className="min-h-dvh flex flex-col md:flex-row">
      {/* Mobile Compact Top Header (iPhone & Mobile Web) */}
      {!isSessionPage && (
        <header className="md:hidden fixed top-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 pt-safe">
          <div className="px-4 h-14 flex items-center justify-between gap-2">
            <Link href="/" className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 text-amber-400 flex items-center justify-center shadow-xs shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm tracking-tight text-zinc-900 leading-none truncate">
                  SprachCoach
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5 truncate">
                  {status
                    ? `${status.currentLevel} → ${status.targetLevel} · ${providerMeta.label}`
                    : "Proactive German AI"}
                </div>
              </div>
            </Link>

            <button
              onClick={handleQuickStart}
              disabled={starting}
              className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 active:scale-95 text-white text-xs font-semibold px-3.5 py-2 shadow-xs transition cursor-pointer disabled:opacity-60 shrink-0"
            >
              <Mic className="w-3.5 h-3.5 text-amber-400" />
              <span>{starting ? "Starting..." : "Talk Now"}</span>
            </button>
          </div>
        </header>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-zinc-200/80 bg-white/95 backdrop-blur-sm z-30">
        <div className="p-6 flex flex-col h-full">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 text-amber-400 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-lg tracking-tight text-zinc-900 leading-none">
                SprachCoach
              </div>
              <div className="text-xs text-zinc-500 mt-1">
                Proactive German AI
              </div>
            </div>
          </Link>

          <button
            onClick={handleQuickStart}
            disabled={starting}
            className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-3 px-4 shadow-sm transition cursor-pointer disabled:opacity-60"
          >
            <Mic className="w-4 h-4 text-amber-400" />
            <span>{starting ? "Preparing Coach..." : "Talk Now"}</span>
          </button>

          <nav className="mt-6 space-y-1 flex-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? "bg-amber-50 text-zinc-900 border border-amber-200/70"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-amber-600" : "text-zinc-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Learner & AI Status Footer */}
          <div className="pt-4 border-t border-zinc-200/80 space-y-2.5">
            {status && (
              <div className="px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200/70">
                <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
                  Active Path
                </div>
                <div className="text-xs font-semibold text-zinc-800 mt-0.5 truncate">
                  {status.currentLevel} → {status.targetLevel} · {status.goalTitle}
                </div>
              </div>
            )}

            <Link
              href="/settings"
              className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-zinc-100 transition text-xs text-zinc-600"
            >
              <span className="flex items-center gap-2 font-medium">
                <span className={`w-2 h-2 rounded-full ${providerMeta.dot}`} />
                {providerMeta.label}
              </span>
              <span className="text-zinc-400">Switch</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 md:pl-64 ${
          isSessionPage
            ? "pb-0 md:pb-6"
            : isChatPage
            ? "pt-[calc(3.5rem+env(safe-area-inset-top))] md:pt-0 pb-20 md:pb-6"
            : "pt-[calc(3.5rem+env(safe-area-inset-top))] md:pt-0 pb-24 md:pb-10"
        }`}
      >
        <div
          className={
            isSessionPage
              ? "max-w-5xl mx-auto px-2.5 sm:px-6 pt-2 sm:pt-5"
              : isChatPage
              ? "max-w-5xl mx-auto px-2.5 sm:px-8 pt-2.5 sm:py-6"
              : "max-w-5xl mx-auto px-3.5 sm:px-8 py-4 sm:py-8"
          }
        >
          {children}
        </div>
      </main>

      {/* Mobile "More" Slide-Up Sheet */}
      {mobileMoreOpen && !isSessionPage && (
        <div className="md:hidden fixed inset-0 z-40 flex flex-col justify-end">
          <div
            onClick={() => setMobileMoreOpen(false)}
            className="absolute inset-0 bg-zinc-950/45 backdrop-blur-[2px]"
          />
          <div className="relative z-10 rounded-t-3xl bg-white border-t border-zinc-200 shadow-2xl px-4 pt-3 pb-safe space-y-3">
            <div className="w-10 h-1 rounded-full bg-zinc-300 mx-auto" />
            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="font-bold text-sm text-zinc-900">
                  More &amp; Settings
                </div>
                {status && (
                  <div className="text-xs text-zinc-500">
                    {status.currentLevel} → {status.targetLevel} · {status.goalTitle}
                  </div>
                )}
              </div>
              <button
                onClick={() => setMobileMoreOpen(false)}
                className="p-2 rounded-full bg-zinc-100 text-zinc-600 cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {MOBILE_MORE_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMoreOpen(false)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border transition ${
                      active
                        ? "bg-amber-50 border-amber-200 text-zinc-900"
                        : "bg-zinc-50/80 border-zinc-200/80 text-zinc-800 active:bg-zinc-100"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        active
                          ? "bg-amber-400/30 text-amber-900"
                          : "bg-white border border-zinc-200 text-zinc-700"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold">{item.label}</div>
                      <div className="text-xs text-zinc-500 truncate">
                        {item.desc}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200/70 text-xs text-zinc-600">
              <span className="flex items-center gap-2 font-medium">
                <span className={`w-2 h-2 rounded-full ${providerMeta.dot}`} />
                Active Engine: {providerMeta.label}
              </span>
              <Link
                href="/settings"
                onClick={() => setMobileMoreOpen(false)}
                className="font-semibold text-amber-700"
              >
                Configure →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Mobile 5-Tab Bottom Navigation Bar */}
      {!isSessionPage && (
        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-zinc-200 z-30 px-1 pt-1.5 pb-safe">
          <div className="grid grid-cols-5 items-center">
            {MOBILE_PRIMARY_TABS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-xl text-[11px] font-medium transition ${
                    isActive ? "text-amber-700 font-semibold" : "text-zinc-500"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <button
              type="button"
              onClick={() => setMobileMoreOpen((v) => !v)}
              className={`flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-xl text-[11px] font-medium transition cursor-pointer ${
                mobileMoreOpen || isMoreActive
                  ? "text-amber-700 font-semibold"
                  : "text-zinc-500"
              }`}
            >
              <Menu className="w-5 h-5" />
              <span>More</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
