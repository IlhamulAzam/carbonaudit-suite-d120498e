import { motion } from "framer-motion";
import { Leaf } from "lucide-react";

interface CarboLogoProps {
  size?: "sm" | "md" | "lg";
  animate?: boolean;
}

const sizeClasses = {
  sm: "text-xl",
  md: "text-3xl",
  lg: "text-5xl",
};

const iconSizes = {
  sm: 20,
  md: 28,
  lg: 40,
};

export function CarboLogo({ size = "md", animate = false }: CarboLogoProps) {
  if (animate) {
    return (
      <motion.div
        className="flex items-center gap-2"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="relative">
          <Leaf size={iconSizes[size]} className="text-primary" strokeWidth={2} />
        </div>
        <span className={`font-semibold tracking-tight ${sizeClasses[size]}`}>
          Carbo<span className="text-primary">AI</span>
        </span>
      </motion.div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Leaf size={iconSizes[size]} className="text-primary" strokeWidth={2} />
      </div>
      <span className={`font-semibold tracking-tight ${sizeClasses[size]}`}>
        Carbo<span className="text-primary">AI</span>
      </span>
    </div>
  );
}
