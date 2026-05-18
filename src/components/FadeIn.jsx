import { motion } from "framer-motion";
import { useState } from "react";

export default function FadeIn({
  children,
  delay = 0,
  y = 24,
  className = "",
  preserveOpacity = false,
  as = "div",
}) {
  const [hasAnimated, setHasAnimated] = useState(false);

  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      initial={{
        opacity: preserveOpacity ? undefined : 0,
        y,
      }}
      whileInView={{
        opacity: preserveOpacity ? undefined : 1,
        y: 0,
      }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      onViewportEnter={() => {
        if (!hasAnimated) {
          setHasAnimated(true);
        }
      }}
      animate={preserveOpacity && hasAnimated ? { y: 0 } : undefined}
    >
      {children}
    </MotionTag>
  );
}
