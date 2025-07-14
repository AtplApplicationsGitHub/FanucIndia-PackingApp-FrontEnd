"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useAutoLogout(timeoutMinutes = 10) {
  const router = useRouter();
  const timeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    function handleLogout() {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      toast.error("Session expired due to inactivity. Please log in again.", {
        duration: 4000, 
      });
      router.push("/login");
    }

    function resetTimer() {
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = setTimeout(handleLogout, timeoutMinutes * 60 * 1000);
    }

    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      if (timeout.current) clearTimeout(timeout.current);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [router, timeoutMinutes]);
}
