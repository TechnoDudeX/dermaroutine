// useStreak — tracks daily step completion and calculates consecutive streak
// Storage:
//   localStorage['checkedToday'] = { date: "2026-04-02", keys: ["am-0", "pm-1", ...] }
//   localStorage['streakData']   = { "2026-04-02": true, "2026-04-01": true, ... }

import { useState, useEffect } from "react";

function toDateStr(d) {
  // Local date string "YYYY-MM-DD" (not UTC, so it matches the user's calendar day)
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dayBefore(dateStr) {
  const d = new Date(dateStr + "T12:00:00"); // noon avoids DST edge cases
  d.setDate(d.getDate() - 1);
  return toDateStr(d);
}

function calcStreak(streakData, todayStr, todayComplete) {
  let streak = 0;
  let cursor = todayStr;

  // If today is complete, include it; otherwise start counting from yesterday
  if (!todayComplete) {
    cursor = dayBefore(todayStr);
  }

  while (true) {
    const isToday = cursor === todayStr;
    const done = isToday ? todayComplete : !!streakData[cursor];
    if (done) {
      streak++;
      cursor = dayBefore(cursor);
    } else {
      break;
    }
  }

  return streak;
}

export function useStreak(todayData) {
  const totalSteps =
    (todayData?.am?.length ?? 0) + (todayData?.pm?.length ?? 0);

  // ── Checked state (resets each calendar day) ──────────────────
  const [checked, setChecked] = useState(() => {
    try {
      const raw = localStorage.getItem("checkedToday");
      if (!raw) return new Set();
      const parsed = JSON.parse(raw);
      if (parsed.date !== toDateStr(new Date())) return new Set();
      return new Set(parsed.keys);
    } catch {
      return new Set();
    }
  });

  // Persist checked state
  useEffect(() => {
    localStorage.setItem(
      "checkedToday",
      JSON.stringify({ date: toDateStr(new Date()), keys: [...checked] })
    );
  }, [checked]);

  const todayComplete = totalSteps > 0 && checked.size >= totalSteps;

  // ── Write to streakData when today becomes complete ───────────
  useEffect(() => {
    if (!todayComplete) return;
    try {
      const streakData = JSON.parse(
        localStorage.getItem("streakData") || "{}"
      );
      const todayStr = toDateStr(new Date());
      if (!streakData[todayStr]) {
        streakData[todayStr] = true;
        localStorage.setItem("streakData", JSON.stringify(streakData));
      }
    } catch {
      // ignore storage errors
    }
  }, [todayComplete]);

  // ── Toggle a single step ──────────────────────────────────────
  function toggleStep(slot, index) {
    const key = `${slot}-${index}`;
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  // ── Reset all steps for today ─────────────────────────────────
  function resetToday() {
    setChecked(new Set());
  }

  // ── Streak calculation ────────────────────────────────────────
  let streakData = {};
  try {
    streakData = JSON.parse(localStorage.getItem("streakData") || "{}");
  } catch {
    // ignore
  }

  const todayStr = toDateStr(new Date());
  const yesterdayStr = dayBefore(todayStr);
  const streak = calcStreak(streakData, todayStr, todayComplete);

  // hasPastHistory: any completed day strictly before today
  const hasPastHistory = Object.keys(streakData).some((d) => d < todayStr);
  const yesterdayDone = !!streakData[yesterdayStr];

  let streakStatus;
  if (streak > 0) {
    streakStatus = "active";
  } else if (hasPastHistory && !yesterdayDone) {
    streakStatus = "broken";
  } else {
    streakStatus = "zero";
  }

  return { checked, toggleStep, resetToday, todayComplete, streak, streakStatus, streakData, todayStr };
}
