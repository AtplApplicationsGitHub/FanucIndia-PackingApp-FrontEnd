"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

const easeCurve = [0.2, 0.8, 0.2, 1] as [number, number, number, number];

const pageTransition = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    rotateX: -10,
    filter: "blur(4px)",
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    rotateX: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: easeCurve,
      delay: 0.1,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -20,
    rotateX: 10,
    filter: "blur(4px)",
    transition: {
      duration: 0.4,
      ease: easeCurve,  
    },
  },
};

export default function AnimatedPage({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}
