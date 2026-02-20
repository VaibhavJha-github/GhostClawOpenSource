"use client";

import { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, className = "", ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`
              w-full bg-zinc-900/50 border border-zinc-700 rounded-xl
              px-4 py-3 text-white placeholder-zinc-500
              focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20
              transition-all duration-200
              ${icon ? "pl-12" : ""}
              ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}
              ${className}
            `}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="mt-2 text-sm text-red-400">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";
