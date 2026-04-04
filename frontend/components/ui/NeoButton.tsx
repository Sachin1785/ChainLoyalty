'use client';

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";

interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "pink" | "green" | "blue" | "red";
  size?: "sm" | "md" | "lg";
}

export function NeoButton({ 
  className, 
  variant = "primary", 
  size = "md", 
  ...props 
}: NeoButtonProps) {
  
  const variants = {
    primary: "bg-white text-black",
    secondary: "bg-neo-yellow text-black",
    pink: "bg-neo-pink text-black",
    green: "bg-neo-green text-black",
    blue: "bg-neo-blue text-black",
    red: "bg-neo-red text-white",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, x: -2, y: -2 }}
      whileTap={{ x: 2, y: 2 }}
      className={cn(
        "neo-btn",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
