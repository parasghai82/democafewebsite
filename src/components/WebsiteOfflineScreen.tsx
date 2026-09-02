import React from "react";
import { Link } from "@tanstack/react-router";
import {
  Coffee,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Navigation,
  Lock,
} from "lucide-react";
import { CafeAdminStore } from "@/lib/cafeAdminStore";
import catPom from "@/assets/cat-pom.png";

export function WebsiteOfflineScreen() {
  const settings = CafeAdminStore.getSettings();

  return (
    <div className="min-h-screen bg-[#120D0A] text-[#F5EBE1] flex flex-col justify-between font-body relative overflow-hidden selection:bg-butter selection:text-warm-brown">
      
      {/* Background ambient glowing orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[550px] w-[550px] rounded-full bg-butter/15 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 h-[400px] w-[400px] rounded-full bg-amber/10 blur-[150px] pointer-events-none" />

      {/* Top Brand Bar */}
      <header className="p-6 flex items-center justify-between max-w-5xl mx-auto w-full z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl gold-gradient-bg text-warm-brown shadow-lg">
            <Coffee className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-heading text-lg font-bold text-white tracking-tight">Toronto Cafe</h1>
            <p className="text-[11px] text-butter font-semibold">Baldwin Village · Est. 1998</p>
          </div>
        </div>

        {/* Offline Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-amber/40 bg-amber/15 px-3.5 py-1 text-xs font-bold text-amber shadow-sm">
          <span className="h-2 w-2 rounded-full bg-amber animate-pulse" />
          <span>Currently Offline</span>
        </div>
      </header>

      {/* Center Hero Card */}
      <main className="max-w-xl mx-auto px-6 py-12 text-center z-10 space-y-6">
        
        {/* Animated Mascot Container */}
        <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-butter/20 blur-xl animate-pulse" />
          <div className="relative rounded-3xl bg-white/10 border border-white/20 p-4 shadow-2xl backdrop-blur-md">
            <img
              src={catPom}
              alt="Toronto Cafe Mascot"
              className="h-20 w-20 object-contain mx-auto"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-bold text-butter">
            <Clock className="h-3.5 w-3.5" />
            <span>Expected Reopening: {settings.maintenanceReopenTime || "Soon"}</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {settings.maintenanceTitle || "Toronto Cafe is Temporarily Offline"}
          </h2>

          <p className="text-sm sm:text-base text-white/70 leading-relaxed max-w-md mx-auto">
            {settings.maintenanceMessage ||
              "We are currently paused for private event preparations and fresh roasting. We will be back online shortly!"}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="https://wa.me/14169771998"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto h-12 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-105"
          >
            <MessageCircle className="h-4 w-4 fill-white text-[#25D366]" />
            <span>Chat on WhatsApp</span>
          </a>

          <a
            href="tel:4169771998"
            className="w-full sm:w-auto h-12 px-6 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-105"
          >
            <Phone className="h-4 w-4" />
            <span>Call (416) 977-1998</span>
          </a>
        </div>

        <div className="pt-2 text-xs text-white/50 flex items-center justify-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-butter" />
          <span>7 Baldwin St, Baldwin Village, Toronto, ON</span>
        </div>

      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-white/40 border-t border-white/10 z-10 flex flex-col sm:flex-row items-center justify-between max-w-5xl mx-auto w-full gap-4">
        <p>© {new Date().getFullYear()} Toronto Cafe. All rights reserved.</p>
        <p className="text-[11px] text-white/30">Baldwin Village · Toronto, ON</p>
      </footer>

    </div>
  );
}
