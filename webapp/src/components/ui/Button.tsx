"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ButtonProps {
    children: ReactNode;
    variant?: "primary" | "secondary" | "ghost";
    size?: "sm" | "md" | "lg";
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
    type?: "button" | "submit";
}

export function Button({
    children,
    variant = "primary",
    size = "md",
    className = "",
    onClick,
    disabled = false,
    type = "button",
}: ButtonProps) {
    const baseStyles = "font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2";

    const variants = {
        primary: "bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5",
        secondary: "bg-transparent border border-zinc-700 text-white hover:border-purple-500 hover:bg-purple-500/10",
        ghost: "bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800",
    };

    const sizes = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg",
    };

    return (
        <motion.button
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
        >
            {children}
        </motion.button>
    );
}
