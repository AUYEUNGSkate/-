import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

type HoverItem = {
  title: string;
  description: string;
  link?: string;
  meta?: string;
  onClick?: () => void;
};

export function HoverEffect({
  items,
  className
}: {
  items: HoverItem[];
  className?: string;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className={cn("grid grid-cols-1 gap-3 py-2 md:grid-cols-2 xl:grid-cols-3", className)}>
      {items.map((item, index) => {
        const Wrapper = item.onClick ? "button" : "a";
        return (
          <Wrapper
            key={`${item.title}-${index}`}
            {...(item.onClick ? { type: "button", onClick: item.onClick } : { href: item.link ?? "#" })}
            className="group relative block h-full w-full cursor-pointer p-2 text-left"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <AnimatePresence>
              {hoveredIndex === index ? (
                <motion.span
                  className="absolute inset-0 block h-full w-full rounded-3xl bg-white/8"
                  layoutId="hoverBackground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: 0.15 } }}
                  exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.2 } }}
                />
              ) : null}
            </AnimatePresence>
            <Card>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
              {item.meta ? <p className="mt-5 text-xs uppercase tracking-[0.24em] text-sky-200/70">{item.meta}</p> : null}
            </Card>
          </Wrapper>
        );
      })}
    </div>
  );
}

export function Card({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative z-20 h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950/82 p-4 backdrop-blur-xl transition-colors group-hover:border-sky-300/30",
        className
      )}
    >
      <div className="relative z-50 p-4">{children}</div>
    </div>
  );
}

export function CardTitle({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <h4 className={cn("mt-1 font-semibold tracking-[0.01em] text-slate-50", className)}>{children}</h4>;
}

export function CardDescription({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <p className={cn("mt-4 text-sm leading-6 text-slate-300", className)}>{children}</p>;
}
