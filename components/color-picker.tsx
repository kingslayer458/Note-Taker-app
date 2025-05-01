"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ColorPickerProps {
  selectedColor: string
  onSelectColor: (color: string) => void
}

const COLORS = [
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#ef4444", // Red
  "#f97316", // Orange
  "#eab308", // Yellow
  "#22c55e", // Green
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#64748b", // Slate
]

export default function ColorPicker({ selectedColor, onSelectColor }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {COLORS.map((color) => (
        <motion.button
          key={color}
          type="button"
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onSelectColor(color)}
          className={cn(
            "w-8 h-8 rounded-full cursor-pointer transition-all duration-200",
            selectedColor === color ? "ring-2 ring-offset-2 ring-slate-400 dark:ring-slate-600" : "",
          )}
          style={{ backgroundColor: color }}
          aria-label={`Select color ${color}`}
        />
      ))}
    </div>
  )
}
