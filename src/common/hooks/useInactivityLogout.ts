"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/common/lib/auth";

export function useInactivityLogout(timeoutMinutes = 10, enabled = true) { 
  const router = useRouter();
  const timeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {

    if (!enabled) {
      return;
    }

    const handleLogout = () => {
      logoutUser(); 
      router.push("/login?reason=session-expired");
    };

    const resetTimer = () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
      timeout.current = setTimeout(
        handleLogout,
        timeoutMinutes * 60 * 1000
      );
    };

    const events: (keyof WindowEventMap)[] = [
      "mousemove", "mousedown", "keydown", "touchstart", "scroll"
    ];

    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [router, timeoutMinutes, enabled]); 
}