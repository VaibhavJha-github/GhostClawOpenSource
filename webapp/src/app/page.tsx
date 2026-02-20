"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import BusinessTypePopup, { type BusinessType } from "@/components/BusinessTypePopup";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import ValueProps from "@/components/landing/ValueProps";
import BentoFeatures from "@/components/landing/BentoFeatures";
import Features from "@/components/landing/Features";
import DynamicSection from "@/components/landing/DynamicSection";
import FixedHubSection from "@/components/landing/FixedHubSection"; // New Component
import Pricing from "@/components/landing/Pricing";
import Testimonials from "@/components/landing/Testimonials";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import Comparison from "@/components/landing/Comparison";
import DiscordInvite from "@/components/landing/DiscordInvite";
import AutonomyGrid from "@/components/landing/AutonomyGrid";
import SocialProof from "@/components/landing/SocialProof";
import { getUniqueSectionsForCategories, hubSections, type HubItem } from "@/lib/sections";

export default function Home() {
  const [selectedTypes, setSelectedTypes] = useState<BusinessType[]>([]);
  const [popupComplete, setPopupComplete] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    const savedTypes = localStorage.getItem("ghostclaw_business_types");
    if (savedTypes) {
      setSelectedTypes(JSON.parse(savedTypes));
      setPopupComplete(true);
    }
  }, []);

  // Get dynamic sections based on user selection
  const dynamicSections = getUniqueSectionsForCategories(selectedTypes);

  // Get fixed hub items based on user selection
  const hubItems = selectedTypes.flatMap(type => hubSections[type] || []);
  // Deduplicate hub items by ID
  const uniqueHubItems = Array.from(new Map(hubItems.map(item => [item.id, item])).values());

  // Handle popup completion
  const handlePopupComplete = async (types: BusinessType[], customInput: string) => {
    setSelectedTypes(types);
    setPopupComplete(true);
    localStorage.setItem("ghostclaw_business_types", JSON.stringify(types));

    // Save anonymous tally to Supabase
    try {
      await supabase.from("tallies").insert({
        category: types.join(","),
        custom_input: customInput
      });
    } catch (err) {
      console.error("Failed to save tally:", err);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg-base)]">
      {/* Mandatory popup - shown on first visit */}
      {!popupComplete && (
        <BusinessTypePopup onComplete={handlePopupComplete} />
      )}

      {/* Navigation */}
      <Navbar />

      {/* Hero */}
      <Hero />

      {/* Autonomy Bento Grid - Fixed Section */}
      <AutonomyGrid />

      {/* Value Props (StartClaw Style) */}
      <ValueProps />

      {/* Bento Grid Features (Capabilities) */}
      <BentoFeatures />

      {/* Three Steps Feature Section */}
      <Features />

      {/* Dynamic sections (injected based on user selection) */}
      {dynamicSections.length > 0 && (
        <div className="relative">
          {/* Section header */}
          <div className="text-center py-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-sm text-[var(--text-secondary)]">
              ✨ Tailored for your business
            </span>
          </div>

          {dynamicSections.slice(0, 4).map((section, index) => (
            <DynamicSection key={section.id} section={section} index={index} />
          ))}
        </div>
      )}

      {/* Fixed Hub Section (Explore More) */}
      {uniqueHubItems.length > 0 && (
        <FixedHubSection items={uniqueHubItems} />
      )}

      {/* Comparison */}
      <Comparison />

      {/* Social Proof - Fixed Section */}
      <SocialProof />

      {/* Pricing */}
      <Pricing />

      {/* Discord Invite */}
      <DiscordInvite />

      {/* Testimonials */}
      <Testimonials />

      {/* Final CTA */}
      <CTA />

      {/* Footer */}
      <Footer />
    </main>
  );
}
