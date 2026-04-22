"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      setPercent(Math.round(latest * 100));
    });
  }, [scrollYProgress]);

  return (
    <>
      {/* Percentage Indicator */}
      <motion.div 
        className="fixed right-6 top-1/2 -translate-y-1/2 z-[100] flex flex-col items-center gap-4 hidden lg:flex"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
      >
        <span className="text-[10px] font-black uppercase tracking-[0.4em] [writing-mode:vertical-lr] opacity-20">Scroll Progress</span>
        <div className="h-40 w-[2px] bg-slate-500/10 rounded-full relative overflow-hidden">
          <motion.div 
            style={{ scaleY, originY: 0 }}
            className="absolute inset-0 bg-brand-blue"
          />
        </div>
        <span className="text-[10px] font-black tabular-nums text-brand-blue">{percent}%</span>
      </motion.div>

      {/* Top Bar for Mobile */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-brand-blue z-[1000] origin-left lg:hidden"
        style={{ scaleX: scrollYProgress }}
      />
    </>
  );
}
