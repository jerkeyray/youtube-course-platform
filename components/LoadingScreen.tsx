"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoadingScreenProps {
  variant?: "fullscreen" | "contained" | "inline";
  text?: string;
  className?: string;
}

export default function LoadingScreen({
  variant = "fullscreen",
  text = "Loading...",
  className = "",
}: LoadingScreenProps) {
  const containerVariants = {
    fullscreen:
      "fixed inset-0 z-50 flex flex-col items-center justify-center bg-blue-50/80 backdrop-blur-sm",
    contained:
      "w-full h-full min-h-[200px] flex flex-col items-center justify-center bg-blue-50/50 rounded-lg",
    inline: "flex items-center justify-center py-4",
  };

  // Animation for the dots
  const dotsVariants = {
    animate: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const dotVariants = {
    initial: { y: 0, opacity: 0.4 },
    animate: {
      y: [0, -10, 0],
      opacity: [0.4, 1, 0.4],
      transition: {
        repeat: Infinity,
        duration: 1,
      },
    },
  };

  // Animation for the "loading" text
  const textVariants = {
    initial: { opacity: 0.7 },
    animate: {
      opacity: [0.7, 1, 0.7],
      transition: {
        repeat: Infinity,
        duration: 2,
      },
    },
  };

  return (
    <div className={cn(containerVariants[variant], className)}>
      <div className="flex flex-col items-center gap-6">
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-bold text-blue-600 mb-1">Yudoku</h1>
          <div className="h-1 w-16 bg-blue-400 rounded-full mb-3"></div>
        </div>

        <motion.div
          className="flex items-center justify-center gap-2"
          variants={dotsVariants}
          initial="initial"
          animate="animate"
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              variants={dotVariants}
              className="w-3 h-3 rounded-full bg-blue-500"
            />
          ))}
        </motion.div>

        {text && (
          <motion.p
            variants={textVariants}
            initial="initial"
            animate="animate"
            className="text-blue-700 font-medium mt-2"
          >
            {text}
          </motion.p>
        )}
      </div>
    </div>
  );
}
