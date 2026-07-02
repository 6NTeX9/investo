"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

interface ScrollAnimationProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

// ── FadeUp ────────────────────────────────────────────────────────────────────
export function FadeUp({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
}: ScrollAnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── FadeIn ────────────────────────────────────────────────────────────────────
export function FadeIn({
  children,
  className = "",
  delay = 0,
  duration = 0.5,
}: ScrollAnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── SlideIn ───────────────────────────────────────────────────────────────────
export function SlideIn({
  children,
  className = "",
  delay = 0,
  from = "left",
}: ScrollAnimationProps & { from?: "left" | "right" }) {
  const x = from === "left" ? -40 : 40;
  return (
    <motion.div
      initial={{ opacity: 0, x }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── StaggerContainer ──────────────────────────────────────────────────────────
export function StaggerContainer({
  children,
  className = "",
  delayChildren = 0,
  staggerChildren = 0.1,
}: ScrollAnimationProps & { delayChildren?: number; staggerChildren?: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: {},
        show: {
          transition: { delayChildren, staggerChildren },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── StaggerItem ───────────────────────────────────────────────────────────────
export function StaggerItem({
  children,
  className = "",
  duration = 0.55,
}: {
  children: React.ReactNode;
  className?: string;
  duration?: number;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Parallax ──────────────────────────────────────────────────────────────────
/** Moves child at a slower rate than scroll — use on hero images for depth */
export function Parallax({
  children,
  className = "",
  speed = 0.3,
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const rawY = useTransform(scrollYProgress, [0, 1], ["0%", `${speed * 100}%`]);
  const y = useSpring(rawY, { stiffness: 80, damping: 20, restDelta: 0.001 });

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div style={{ y }} className="will-change-transform h-full w-full">
        {children}
      </motion.div>
    </div>
  );
}

// ── ScaleIn ───────────────────────────────────────────────────────────────────
export function ScaleIn({
  children,
  className = "",
  delay = 0,
}: ScrollAnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Float (subtle infinite bob — use sparingly) ───────────────────────────────
export function Float({
  children,
  className = "",
  delay = 0,
  duration = 3,
  yDelta = 6,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yDelta?: number;
}) {
  return (
    <motion.div
      animate={{ y: [0, -yDelta, 0] }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: "reverse" as const,
        ease: "easeInOut",
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
