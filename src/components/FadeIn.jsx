import { motion } from "framer-motion";
import { useState } from "react";

export default function FadeIn({
  children,
  delay = 0,
  y = 24,
  className = "",
  preserveOpacity = false,
}) {
  const [hasAnimated, setHasAnimated] = useState(false);

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        y,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      onAnimationComplete={() => {
        setHasAnimated(true);
      }}
      style={
        preserveOpacity && hasAnimated ? { opacity: undefined } : undefined
      }
    >
      {children}
    </motion.div>
  );
}
