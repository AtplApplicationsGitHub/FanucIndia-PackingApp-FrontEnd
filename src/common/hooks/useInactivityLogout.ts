"use client";

import { useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

export function useInactivityLogout(
  timeoutMinutes: number = 120,
  isEnabled: boolean = true,
) {
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const logout = useCallback(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user?.id) {
          localStorage.removeItem(`printer_pref_${user.id}`);
        }
      } catch {}
    }
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("user");

    router.push("/login?reason=inactivity");
  }, [router]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    // Convert minutes to milliseconds
    const timeoutMs = timeoutMinutes * 60 * 1000;
    timerRef.current = setTimeout(logout, timeoutMs);
  }, [logout, timeoutMinutes]);

  useEffect(() => {
    // Do not set up the timer if the route is not protected (e.g., login page)
    if (!isEnabled) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
    ];

    resetTimer();

    events.forEach((event) => window.addEventListener(event, resetTimer));

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [resetTimer, isEnabled]);
}
