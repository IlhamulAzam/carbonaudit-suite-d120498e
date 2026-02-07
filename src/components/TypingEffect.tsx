import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface TypingEffectProps {
  text: string;
  delay?: number;
  speed?: number;
  className?: string;
}

export function TypingEffect({
  text,
  delay = 500,
  speed = 50,
  className = "",
}: TypingEffectProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayedText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          setIsComplete(true);
          clearInterval(interval);
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, delay, speed]);

  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: delay / 1000 }}
      className={className}
    >
      {displayedText}
      <span
        className={`inline-block w-[2px] h-[1em] bg-foreground ml-1 align-middle ${
          isComplete ? "opacity-0" : "animate-typing-cursor"
        }`}
      />
    </motion.p>
  );
}
