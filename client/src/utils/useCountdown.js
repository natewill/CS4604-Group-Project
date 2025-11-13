import { useState, useEffect } from "react";

export const useCountdown = (runDate, runTime) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const runDateTime = new Date(`${runDate} ${runTime}`);
      const diff = runDateTime - now;

      if (diff <= 0) return "Starting soon";

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      // Only show "Starting soon" if within 2 hours
      if (hours < 2 && days === 0) return "Starting soon";

      if (days > 0) return `${days}d`;
      if (hours > 0) return `${hours}h ${minutes}m`;
      return `${minutes}m`;
    };

    // Update immediately
    setTimeLeft(calculateTime());

    // Update every minute
    const interval = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 60000);

    return () => clearInterval(interval);
  }, [runDate, runTime]);

  return timeLeft;
};

