"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

type MenuItem = {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
};

interface MenuVerticalProps {
  menuItems: MenuItem[];
  color?: string;
  skew?: number;
  className?: string;
}

const MotionLink = motion.create(Link);

export const MenuVertical = ({
  menuItems = [],
  color = "hsl(var(--primary))",
  skew = 0,
  className,
}: MenuVerticalProps) => {
  const location = useLocation();

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      {menuItems.map((item, index) => {
        const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
        const Icon = item.icon;

        return (
          <motion.div
            key={`${item.href}-${index}`}
            className={cn(
              "group/nav flex items-center gap-2 cursor-pointer",
              isActive ? "text-primary" : "text-slate-600"
            )}
            initial="initial"
            whileHover="hover"
            animate={isActive ? "hover" : "initial"}
          >
            {/* Sliding Arrow */}
            <motion.div
              variants={{
                initial: { x: "-100%", opacity: 0 },
                hover: { x: 0, opacity: 1 },
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="z-0"
              style={{ color: isActive ? color : color }}
            >
              <ArrowRight strokeWidth={2.5} className="size-5" />
            </motion.div>

            {/* Icon + Label */}
            <MotionLink
              to={item.href}
              variants={{
                initial: { x: -28, color: "inherit" },
                hover: { x: 0, color, skewX: skew },
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={cn(
                "font-medium text-sm no-underline flex items-center gap-3",
                isActive && "font-semibold"
              )}
            >
              {Icon && <Icon className="h-5 w-5" />}
              <span>{item.label}</span>
            </MotionLink>
          </motion.div>
        );
      })}
    </div>
  );
};
