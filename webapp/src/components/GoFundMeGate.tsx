"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, HeartHandshake } from "lucide-react";

const GOFUNDME_URL = "https://gofund.me/ceb207b59";
const STORAGE_KEY = "ghostclaw_gofundme_gate_v1";

export default function GoFundMeGate() {
  const [locked, setLocked] = useState(true);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const unlocked = localStorage.getItem(STORAGE_KEY) === "1";
      setLocked(!unlocked);
    } catch {
      setLocked(true);
    } finally {
      setReady(true);
    }
  }, []);

  const openFundraiser = useCallback(() => {
    setError("");
    const win = window.open(GOFUNDME_URL, "_blank", "noopener,noreferrer");
    if (!win) {
      setError("Popup blocked. Allow popups, then try again.");
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // no-op
    }

    setLocked(false);
  }, []);

  if (!ready || !locked) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-2xl border border-orange-500/30 bg-[var(--bg-elevated)] shadow-2xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
        <div className="p-8">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center mb-6">
            <HeartHandshake className="w-7 h-7 text-orange-300" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-3">
            Help Me Get Some Hours Back
          </h2>
          <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">
            I made this free for everyone. If you want to support the project,
            please open the fundraiser page first.
          </p>

          <button
            type="button"
            onClick={openFundraiser}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-semibold transition-colors"
          >
            Open GoFundMe
            <ExternalLink className="w-4 h-4" />
          </button>

          {error && (
            <p className="mt-3 text-sm text-red-400">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}

