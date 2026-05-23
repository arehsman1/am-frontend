import { useEffect, useRef, useState } from "react";
import { REQUEST_COOLDOWN_SECONDS, DAILY_REQUEST_LIMIT } from "@/lib/intent";

/**
 * UI-only anti-spam: 30s cooldown per send + a daily counter (resets on reload — mock).
 * {REQUEST_COOLDOWN} {DAILY_LIMIT}
 */
export const useRequestCooldown = () => {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [sentToday, setSentToday] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(() => () => { if (timer.current) window.clearInterval(timer.current); }, []);

  const trigger = () => {
    setSentToday((n) => n + 1);
    setSecondsLeft(REQUEST_COOLDOWN_SECONDS);
    if (timer.current) window.clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { if (timer.current) window.clearInterval(timer.current); return 0; }
        return s - 1;
      });
    }, 1000);
  };

  const limitReached = sentToday >= DAILY_REQUEST_LIMIT;
  return { secondsLeft, sentToday, limitReached, trigger, dailyLimit: DAILY_REQUEST_LIMIT };
};
