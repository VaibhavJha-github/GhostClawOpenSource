"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    glow?: boolean;
}

export function Card({ children, className = "", hover = true, glow = false }: CardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={hover ? { y: -4, scale: 1.01 } : {}}
            className={`
        relative bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6
        backdrop-blur-sm transition-all duration-300
        ${hover ? "hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10" : ""}
        ${glow ? "shadow-lg shadow-purple-500/20" : ""}
        ${className}
      `}
        >
            {children}
        </motion.div>
    );
}

interface GradientCardProps {
    children: ReactNode;
    className?: string;
}

export function GradientCard({ children, className = "" }: GradientCardProps) {
    return (
        <div className={`relative group ${className}`}>
            {/* Gradient border effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-2xl opacity-30 group-hover:opacity-50 blur transition duration-300" />
            <div className="relative bg-zinc-900 rounded-2xl p-6">
                {children}
            </div>
        </div>
    );
}
