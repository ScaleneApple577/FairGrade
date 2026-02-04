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
    <motion.nav
      className={cn("flex flex-col gap-1", className)}
      initial="initial"
      animate="animate"
    >
      {menuItems.map((item, index) => {
        const isActive = location.pathname === item.href;
        const Icon = item.icon;

        return (
          <MotionLink
            key={item.href}
            to={item.href}
            className={cn(
              "group relative flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 transition-colors overflow-hidden",
              isActive && "text-primary font-medium"
            )}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.3,
              delay: index * 0.05,
              ease: "easeOut",
            }}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            style={{
              transform: `skewX(${skew}deg)`,
            }}
          >
            {/* Animated background */}
            <motion.div
              className="absolute inset-0 rounded-lg"
              initial={{ scaleX: 0, originX: 0 }}
              animate={{
                scaleX: isActive ? 1 : 0,
                backgroundColor: isActive ? "hsl(var(--primary) / 0.1)" : "transparent",
              }}
              whileHover={{
                scaleX: 1,
                backgroundColor: "hsl(var(--primary) / 0.08)",
              }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            />

            {/* Active indicator bar */}
            <motion.div
              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-full bg-primary"
              initial={{ height: 0, opacity: 0 }}
              animate={{
                height: isActive ? "60%" : 0,
                opacity: isActive ? 1 : 0,
              }}
              transition={{ duration: 0.2 }}
            />

            {/* Icon */}
            {Icon && (
              <motion.div
                className="relative z-10"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-primary" : "text-slate-500 group-hover:text-primary"
                  )}
                />
              </motion.div>
            )}

            {/* Label */}
            <motion.span
              className={cn(
                "relative z-10 text-sm transition-colors",
                isActive ? "text-primary" : "group-hover:text-slate-900"
              )}
            >
              {item.label}
            </motion.span>

            {/* Arrow indicator on hover */}
            <motion.div
              className="relative z-10 ml-auto"
              initial={{ opacity: 0, x: -10 }}
              whileHover={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowRight
                className={cn(
                  "h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity",
                  isActive ? "text-primary" : "text-slate-400"
                )}
              />
            </motion.div>
          </MotionLink>
        );
      })}
    </motion.nav>
  );
};
