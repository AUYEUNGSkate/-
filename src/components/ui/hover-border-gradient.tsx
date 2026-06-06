import { motion } from "motion/react";
import { useEffect, useState, type PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

type Direction = "TOP" | "LEFT" | "BOTTOM" | "RIGHT";

type HoverBorderGradientProps = {
  as?: "button" | "a" | "div";
  containerClassName?: string;
  className?: string;
  surfaceClassName?: string;
  duration?: number;
  clockwise?: boolean;
  href?: string;
  target?: string;
  rel?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  "aria-label"?: string;
};

export function HoverBorderGradient({
  children,
  containerClassName,
  className,
  surfaceClassName,
  as: Tag = "button",
  duration = 1,
  clockwise = true,
  ...props
}: PropsWithChildren<HoverBorderGradientProps>) {
  const [hovered, setHovered] = useState(false);
  const [direction, setDirection] = useState<Direction>("TOP");

  const rotateDirection = (currentDirection: Direction): Direction => {
    const directions: Direction[] = ["TOP", "LEFT", "BOTTOM", "RIGHT"];
    const currentIndex = directions.indexOf(currentDirection);
    const nextIndex = clockwise
      ? (currentIndex - 1 + directions.length) % directions.length
      : (currentIndex + 1) % directions.length;
    return directions[nextIndex];
  };

  const movingMap: Record<Direction, string> = {
    TOP: "radial-gradient(20.7% 50% at 50% 0%, hsl(200, 100%, 85%) 0%, rgba(255, 255, 255, 0) 100%)",
    LEFT: "radial-gradient(16.6% 43.1% at 0% 50%, hsl(212, 100%, 78%) 0%, rgba(255, 255, 255, 0) 100%)",
    BOTTOM: "radial-gradient(20.7% 50% at 50% 100%, hsl(190, 100%, 80%) 0%, rgba(255, 255, 255, 0) 100%)",
    RIGHT: "radial-gradient(16.2% 41.2% at 100% 50%, hsl(220, 100%, 78%) 0%, rgba(255, 255, 255, 0) 100%)"
  };

  const highlight = "radial-gradient(75% 181.15% at 50% 50%, rgba(76, 160, 255, 0.95) 0%, rgba(255, 255, 255, 0) 100%)";

  useEffect(() => {
    if (hovered) return;
    const interval = window.setInterval(() => {
      setDirection((prevState) => rotateDirection(prevState));
    }, duration * 1000);
    return () => window.clearInterval(interval);
  }, [duration, hovered]);

  return (
    <Tag
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative flex h-min w-fit items-center justify-center overflow-visible rounded-full p-px transition duration-500",
        containerClassName
      )}
      {...props}
    >
      <div
        className={cn(
          "relative z-10 w-auto rounded-[inherit] bg-slate-950 px-4 py-2 text-sm font-medium text-white",
          surfaceClassName,
          className
        )}
      >
        {children}
      </div>
      <motion.div
        className="absolute inset-0 z-0 overflow-hidden rounded-[inherit]"
        style={{
          filter: "blur(2px)",
          width: "100%",
          height: "100%"
        }}
        initial={{ background: movingMap[direction] }}
        animate={{
          background: hovered ? [movingMap[direction], highlight] : movingMap[direction]
        }}
        transition={{ ease: "linear", duration }}
      />
      <div className="absolute inset-[1.5px] rounded-[inherit] bg-slate-950/92" />
    </Tag>
  );
}
