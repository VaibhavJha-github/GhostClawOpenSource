"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// Define the shape of our context
interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithGithub: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    signInWithGoogle: async () => { },
    signInWithGithub: async () => { },
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check for active session
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        };

        getSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);

                if (_event === 'SIGNED_IN') {
                    // Optional: Check if user exists in database and create if not
                    // const { data: profile } = await supabase.from('users').select('*').eq('id', session?.user.id).single();
                    // if (!profile) { ... create profile ... }
                    router.refresh();
                } else if (_event === 'SIGNED_OUT') {
                    router.push('/login');
                    router.refresh(); // Clear any server components expecting auth
                }
            }
        );

        return () => subscription.unsubscribe();
    }, [router]);

    const signInWithGoogle = async () => {
        // Preserve redirect param if on login page
        const params = new URLSearchParams(window.location.search);
        const redirectPath = params.get("redirect") || "/dashboard";
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}${redirectPath}`
            }
        });
        if (error) console.error("Error signing in with Google:", error.message);
    };

    const signInWithGithub = async () => {
        const params = new URLSearchParams(window.location.search);
        const redirectPath = params.get("redirect") || "/dashboard";
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "github",
            options: {
                redirectTo: `${window.location.origin}${redirectPath}`
            }
        });
        if (error) console.error("Error signing in with GitHub:", error.message);
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) console.error("Error signing out:", error.message);
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signInWithGoogle, signInWithGithub, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}
