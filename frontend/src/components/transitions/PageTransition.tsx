import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type PageTransitionVariant = "fade-up" | "fade" | "slide" | "scale";

export interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  variant?: PageTransitionVariant;
  /**
   * Optional custom delay before entrance animation starts (in seconds).
   * Default is 0.
   */
  delay?: number;
}

const variantsMap = {
  "fade-up": {
    initial: { opacity: 0, y: 14, scale: 0.995 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.995 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { opacity: 0, x: -16 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 16 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
  },
};

/**
 * PageTransition wrapper component
 * Provides smooth, GPU-accelerated page entrance and exit animations
 * with automatic fallback for users requesting reduced motion.
 */
export default function PageTransition({
  children,
  className,
  variant = "fade-up",
  delay = 0,
}: PageTransitionProps) {
  const shouldReduceMotion = useReducedMotion();

  // If user prefers reduced motion, disable transforms and use a subtle quick fade
  const activeVariants = shouldReduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : variantsMap[variant] || variantsMap["fade-up"];

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={activeVariants}
      transition={{
        duration: shouldReduceMotion ? 0.15 : 0.28,
        delay,
        ease: [0.22, 1, 0.36, 1], // Standard cubic bezier for smooth, snappy deceleration
      }}
      className={cn("w-full will-change-[transform,opacity]", className)}
    >
      {children}
    </motion.div>
  );
}
