"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import {
    LayoutDashboard,
    UserPlus,
    CreditCard,
    Settings,
    HelpCircle,
    LogOut,
    Plus,
    Loader2,
    Store
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

interface Employee {
    id: string;
    name: string;
    status: string;
    plan: "starter" | "professional" | "enterprise";
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading: authLoading, signOut } = useAuth();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loadingEmployees, setLoadingEmployees] = useState(true);

    // Load employees from Supabase
    const loadEmployees = useCallback(async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from("agents")
                .select("id, name, status, plan")
                .eq("user_id", user.id);

            if (error) {
                console.error("Failed to load employees:", error);
                return;
            }
            if (data) {
                setEmployees(data as Employee[]);
            }
        } catch (err) {
            console.error("Failed to load employees:", err);
        } finally {
            setLoadingEmployees(false);
        }
    }, [user]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login?redirect=" + encodeURIComponent(pathname));
            return;
        }
        if (user) {
            loadEmployees();
            // Poll every 15 seconds
            const interval = setInterval(loadEmployees, 15000);
            return () => clearInterval(interval);
        }
    }, [user, authLoading, loadEmployees, router, pathname]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "online":
            case "running":
                return "bg-green-500";
            case "deploying":
            case "pending":
            case "starting":
                return "bg-orange-500 animate-pulse";
            case "stopping":
                return "bg-orange-500 animate-pulse";
            case "offline":
            case "stopped":
                return "bg-gray-500";
            case "terminated":
                return "bg-red-500";
            default:
                return "bg-gray-500";
        }
    };

    const handleSignOut = async () => {
        await signOut();
        router.push("/login");
    };

    // Show loading while auth is resolving
    if (authLoading) {
        return (
            <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--text-muted)]" />
            </div>
        );
    }

    const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "User";
    const userEmail = user?.email || "";
    const userInitial = userName.charAt(0).toUpperCase();

    return (
        <div className="min-h-screen bg-[var(--bg-base)] flex">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 border-r border-white/5 flex flex-col bg-[var(--bg-surface)] relative z-20">
                {/* Logo */}
                <div className="h-14 flex items-center px-4 border-b border-white/5">
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/ghostclaw.png"
                            alt="GhostClaw Logo"
                            width={32}
                            height={32}
                            className="rounded-lg"
                        />
                        <span className="font-bold text-lg font-mono">GhostClaw</span>
                    </Link>
                </div>

                {/* Main nav */}
                <nav className="p-3 flex-1 overflow-y-auto">
                    <div className="text-xs font-medium text-[var(--text-dim)] uppercase tracking-wider px-3 mb-2">
                        Main
                    </div>

                    <Link
                        href="/dashboard"
                        className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ${pathname === "/dashboard"
                            ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/5"
                            : "text-[var(--text-muted)] hover:bg-white/5 hover:text-white hover:pl-4"
                            }`}
                    >
                        <LayoutDashboard className={`w-4 h-4 transition-colors ${pathname === "/dashboard" ? "text-orange-400" : "group-hover:text-orange-400"}`} />
                        <span className="font-mono text-sm">Dashboard</span>
                    </Link>

                    <Link
                        href="/dashboard/new"
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--text-muted)] hover:bg-white/5 hover:text-white transition-colors"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span className="font-mono">Add Employee</span>
                    </Link>

                    {/* Employees list */}
                    <div className="mt-4 space-y-1">
                        {loadingEmployees ? (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="w-4 h-4 animate-spin text-[var(--text-dim)]" />
                            </div>
                        ) : (
                            employees.map((employee) => (
                                <Link
                                    key={employee.id}
                                    href={`/dashboard/employees/${employee.id}`}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${pathname.includes(employee.id)
                                        ? "bg-white/10 text-white border border-white/5 shadow-inner"
                                        : "text-[var(--text-muted)] hover:bg-white/5 hover:text-white border border-transparent"
                                        }`}
                                >
                                    <div className="relative">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/80 to-amber-600/80 flex items-center justify-center text-white text-sm font-bold shadow-[0_0_10px_rgba(249,115,22,0.3)] group-hover:shadow-[0_0_15px_rgba(249,115,22,0.5)] transition-shadow">
                                            {employee.name.charAt(0)}
                                        </div>
                                        <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${getStatusColor(employee.status)} border-2 border-[var(--bg-base)]`} />
                                    </div>
                                    <span className="text-sm font-medium truncate font-mono">{employee.name}</span>
                                </Link>
                            ))
                        )}
                    </div>

                    {/* Skills Store */}
                    <div className="mt-6 pt-4 border-t border-white/5">
                        <Link
                            href="/dashboard/skills"
                            className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ${pathname === "/dashboard/skills"
                                ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/5"
                                : "text-[var(--text-muted)] hover:bg-white/5 hover:text-white hover:pl-4"
                                }`}
                        >
                            <Store className={`w-4 h-4 transition-colors ${pathname === "/dashboard/skills" ? "text-orange-400" : "group-hover:text-orange-400"}`} />
                            <span className="font-mono text-sm">Skills</span>
                        </Link>
                    </div>

                    {/* Account section */}
                    <div className="mt-6">
                        <div className="text-xs font-medium text-[var(--text-dim)] uppercase tracking-wider px-3 mb-2">
                            Account
                        </div>

                        <Link
                            href="/dashboard/billing"
                            className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ${pathname === "/dashboard/billing"
                                ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/5"
                                : "text-[var(--text-muted)] hover:bg-white/5 hover:text-white hover:pl-4"
                                }`}
                        >
                            <CreditCard className={`w-4 h-4 transition-colors ${pathname === "/dashboard/billing" ? "text-orange-400" : "group-hover:text-orange-400"}`} />
                            <span className="font-mono text-sm">Billing</span>
                        </Link>

                        <Link
                            href="/dashboard/settings"
                            className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ${pathname === "/dashboard/settings"
                                ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/5"
                                : "text-[var(--text-muted)] hover:bg-white/5 hover:text-white hover:pl-4"
                                }`}
                        >
                            <Settings className={`w-4 h-4 transition-colors ${pathname === "/dashboard/settings" ? "text-orange-400" : "group-hover:text-orange-400"}`} />
                            <span className="font-mono text-sm">Settings</span>
                        </Link>
                    </div>
                </nav>

                {/* Bottom section */}
                <div className="p-3 border-t border-white/5">
                    {/* Help link */}
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--text-muted)] hover:bg-white/5 hover:text-white transition-colors text-sm">
                        <HelpCircle className="w-4 h-4" />
                        <span className="font-mono">Need help? Contact us</span>
                    </button>

                    {/* User profile */}
                    <div
                        onClick={handleSignOut}
                        className="group flex items-center justify-between px-3 py-3 mt-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/5"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-orange-900/20 group-hover:scale-105 transition-transform">
                                {userInitial}
                            </div>
                            <div className="text-sm">
                                <div className="font-medium text-white font-mono group-hover:text-orange-400 transition-colors">{userName}</div>
                                <div className="text-[var(--text-dim)] text-xs truncate max-w-[120px]">{userEmail}</div>
                            </div>
                        </div>
                        <LogOut className="w-4 h-4 text-[var(--text-dim)] group-hover:text-red-400 transition-colors" />
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}
