import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

/**
 * RouteProgressBar
 * Displays a sleek, YouTube / Linear-style animated gradient progress bar
 * at the top of the viewport whenever a route transition takes place.
 */
export default function RouteProgressBar() {
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Trigger transition animation on route change
    setIsNavigating(true);
    setProgress(25);

    const step1 = setTimeout(() => {
      setProgress(65);
    }, 70);

    const step2 = setTimeout(() => {
      setProgress(90);
    }, 160);

    const completeTimer = setTimeout(() => {
      setProgress(100);
      const hideTimer = setTimeout(() => {
        setIsNavigating(false);
        setProgress(0);
      }, 200);

      return () => clearTimeout(hideTimer);
    }, 280);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(completeTimer);
    };
  }, [location.pathname, location.search]);

  return (
    <AnimatePresence>
      {isNavigating && (
        <div
          aria-hidden="true"
          className="fixed left-0 top-0 z-[9999] h-[2.5px] w-full pointer-events-none overflow-hidden"
        >
          <motion.div
            initial={{ width: "0%", opacity: 0.9 }}
            animate={{ width: `${progress}%`, opacity: progress === 100 ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{
              width: { duration: 0.22, ease: "easeOut" },
              opacity: { duration: 0.2 },
            }}
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
          />
        </div>
      )}
    </AnimatePresence>
  );
}
