import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  onClick?: () => void;
  featured?: boolean;
  accentColor?: "blue" | "orange";
}

interface CategoryListProps {
  cards: CategoryCardProps[];
  accentColor?: "blue" | "orange";
}

const CategoryCard = ({
  title,
  subtitle,
  icon: Icon,
  onClick,
  featured = false,
  accentColor = "blue",
}: CategoryCardProps) => {
  const accentClasses = {
    blue: {
      border: "hover:border-blue-500",
      shadow: "hover:shadow-blue-500/20",
      bracket: "bg-blue-500",
      icon: "text-blue-500",
    },
    orange: {
      border: "hover:border-orange-500",
      shadow: "hover:shadow-orange-500/20",
      bracket: "bg-orange-500",
      icon: "text-orange-500",
    },
  };

  const accent = accentClasses[accentColor];

  return (
    <motion.div
      onClick={onClick}
      className={cn(
        "relative group cursor-pointer overflow-hidden rounded-lg",
        "bg-zinc-900 border border-zinc-800 transition-all duration-300",
        accent.border,
        accent.shadow,
        "hover:shadow-lg",
        featured && "ring-1 ring-offset-2 ring-offset-black",
        featured && (accentColor === "blue" ? "ring-blue-500/50" : "ring-orange-500/50")
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {/* Corner brackets */}
      <div className={cn("absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 rounded-tl-lg opacity-0 group-hover:opacity-100 transition-opacity", accentColor === "blue" ? "border-blue-500" : "border-orange-500")} />
      <div className={cn("absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity", accentColor === "blue" ? "border-blue-500" : "border-orange-500")} />
      <div className={cn("absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity", accentColor === "blue" ? "border-blue-500" : "border-orange-500")} />
      <div className={cn("absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 rounded-br-lg opacity-0 group-hover:opacity-100 transition-opacity", accentColor === "blue" ? "border-blue-500" : "border-orange-500")} />

      <div className="p-4 md:p-5 flex items-center gap-4">
        <div className={cn(
          "flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300",
          "bg-zinc-800 group-hover:scale-110",
          accentColor === "blue" ? "group-hover:bg-blue-500/20" : "group-hover:bg-orange-500/20"
        )}>
          <Icon className={cn("w-6 h-6 transition-colors", accent.icon)} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-base md:text-lg truncate group-hover:text-white transition-colors">
            {title}
          </h3>
          <p className="text-zinc-400 text-sm truncate">
            {subtitle}
          </p>
        </div>

        <motion.div
          className={cn("flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity", accent.icon)}
          initial={{ x: -10 }}
          whileHover={{ x: 0 }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.div>
      </div>

      {featured && (
        <div className={cn(
          "absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-medium",
          accentColor === "blue" ? "bg-blue-500/20 text-blue-400" : "bg-orange-500/20 text-orange-400"
        )}>
          Featured
        </div>
      )}
    </motion.div>
  );
};

export const CategoryList = ({ cards, accentColor = "blue" }: CategoryListProps) => {
  return (
    <div className="space-y-3">
      {cards.map((card, index) => (
        <CategoryCard
          key={index}
          {...card}
          accentColor={accentColor}
        />
      ))}
    </div>
  );
};

export default CategoryList;
