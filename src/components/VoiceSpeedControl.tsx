"use client";

import { useEffect, useState } from "react";

export const VOICE_SPEED_PRESETS: Array<{ value: number; label: string }> = [
  { value: 0.75, label: "0.75× Sehr langsam" },
  { value: 0.85, label: "0.85× Langsam" },
  { value: 0.9, label: "0.9× Entspannt" },
  { value: 0.95, label: "0.95× Leicht langsam" },
  { value: 1.0, label: "1.0× Normal" },
  { value: 1.05, label: "1.05× Leicht flott" },
  { value: 1.1, label: "1.1× Standard" },
  { value: 1.15, label: "1.15× Flott" },
  { value: 1.2, label: "1.2× Schnell" },
  { value: 1.3, label: "1.3× Sehr schnell" },
  { value: 1.5, label: "1.5× Turbo" },
];

interface VoiceSpeedControlProps {
  value: number;
  onChange: (nextSpeed: number) => void;
  variant?: "light" | "dark";
}

export function VoiceSpeedControl({
  value,
  onChange,
  variant = "light",
}: VoiceSpeedControlProps) {
  const roundedVal = Number((value || 1.1).toFixed(2));
  const [inputText, setInputText] = useState(String(roundedVal));

  useEffect(() => {
    setInputText(String(Number((value || 1.1).toFixed(2))));
  }, [value]);

  const hasExactPreset = VOICE_SPEED_PRESETS.some(
    (p) => Math.abs(p.value - roundedVal) < 0.005
  );

  function commitCustomInput(raw: string) {
    const parsed = parseFloat(raw.replace(",", "."));
    if (Number.isNaN(parsed)) {
      setInputText(String(roundedVal));
      return;
    }
    const clamped = Number(Math.max(0.5, Math.min(2.0, parsed)).toFixed(2));
    setInputText(String(clamped));
    onChange(clamped);
  }

  const isDark = variant === "dark";

  return (
    <div
      className={`inline-flex items-center rounded-xl border text-xs overflow-hidden ${
        isDark
          ? "bg-white/10 border-white/15 text-white"
          : "bg-zinc-50 border-zinc-200 text-zinc-700"
      }`}
      title="Choose a preset speed or type any custom speed number (0.5× – 2.0×)"
    >
      <select
        value={roundedVal}
        onChange={(e) => {
          const next = Number(parseFloat(e.target.value).toFixed(2));
          setInputText(String(next));
          onChange(next);
        }}
        className={`px-2 py-1.5 font-medium focus:outline-none cursor-pointer ${
          isDark ? "bg-transparent text-white" : "bg-transparent text-zinc-700"
        }`}
      >
        {!hasExactPreset && (
          <option value={roundedVal} className="text-zinc-900">
            {roundedVal}× Custom
          </option>
        )}
        {VOICE_SPEED_PRESETS.map((p) => (
          <option key={p.value} value={p.value} className="text-zinc-900">
            {p.label}
          </option>
        ))}
      </select>

      <div
        className={`flex items-center border-l px-1.5 py-1 ${
          isDark
            ? "border-white/15 bg-black/20"
            : "border-zinc-200 bg-white"
        }`}
      >
        <input
          type="number"
          min={0.5}
          max={2.0}
          step={0.05}
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
            const num = parseFloat(e.target.value.replace(",", "."));
            if (!Number.isNaN(num) && num >= 0.5 && num <= 2.0) {
              onChange(Number(num.toFixed(2)));
            }
          }}
          onBlur={() => commitCustomInput(inputText)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitCustomInput(inputText);
            }
          }}
          aria-label="Custom voice speed multiplier"
          className={`w-12 text-center font-bold focus:outline-none ${
            isDark ? "bg-transparent text-amber-300" : "bg-transparent text-zinc-900"
          }`}
        />
        <span
          className={`text-[10px] font-bold select-none ${
            isDark ? "text-zinc-300" : "text-zinc-400"
          }`}
        >
          ×
        </span>
      </div>
    </div>
  );
}
