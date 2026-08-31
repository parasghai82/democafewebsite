import React, { useState } from "react";
import { MessageCircle, X, Sparkles, Send, Coffee } from "lucide-react";
import { CafeAdminStore } from "@/lib/cafeAdminStore";

export function WhatsAppQuickWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState("");

  const handleOpenWhatsApp = (presetText?: string, location: "Floating Quick Chat" | "Header WhatsApp" = "Floating Quick Chat") => {
    const textToSend = presetText || customMsg || "Hello Toronto Cafe! ☕ I have a question about the menu / table availability today.";
    
    CafeAdminStore.logWhatsAppClick({
      buttonLocation: location,
      intent: presetText?.includes("Table") ? "Table Reservation" : presetText?.includes("Menu") ? "Menu Order & Takeaway" : "General Chat",
    });

    if (customMsg) {
      CafeAdminStore.addFormSubmission({
        formType: "WhatsApp Live Chat Inquiry",
        name: "Website Visitor",
        email: "Via WhatsApp",
        phone: "Live Chat",
        notes: customMsg,
      });
    }

    const encoded = encodeURIComponent(textToSend);
    window.open(`https://wa.me/14169771998?text=${encoded}`, "_blank");
    setIsOpen(false);
    setCustomMsg("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-auto">
      
      {/* QUICK CHAT POPOVER */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 rounded-3xl border border-white/15 bg-[#1C1510]/95 backdrop-blur-2xl p-5 shadow-2xl text-left text-white animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#25D366] text-white shadow-md">
                <MessageCircle className="h-5 w-5 fill-white text-[#25D366]" />
              </div>
              <div>
                <p className="font-heading text-sm font-bold text-white">Toronto Cafe WhatsApp</p>
                <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Barista Team Online
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-xs text-white/70 py-3 leading-relaxed">
            Welcome to Toronto Cafe at Baldwin Village! How can our barista help you right now?
          </p>

          {/* Quick preset buttons */}
          <div className="space-y-1.5 mb-3">
            <button
              onClick={() => handleOpenWhatsApp("Hi! Are there patio tables available right now?")}
              className="w-full text-left p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/90 transition-all cursor-pointer truncate"
            >
              🌿 Check live patio table availability
            </button>
            <button
              onClick={() => handleOpenWhatsApp("Hi! What are today's fresh baked pastries at the house?")}
              className="w-full text-left p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/90 transition-all cursor-pointer truncate"
            >
              🥐 Inquire today's fresh bakery bakes
            </button>
            <button
              onClick={() => handleOpenWhatsApp("Hi! I'd like to place an artisan coffee takeaway order.")}
              className="w-full text-left p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/90 transition-all cursor-pointer truncate"
            >
              ☕ Quick takeaway order to pick up
            </button>
          </div>

          {/* Custom Message input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleOpenWhatsApp(customMsg);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="Type your message..."
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              className="flex-1 h-10 px-3 bg-white/5 border border-white/15 rounded-xl text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-emerald-400"
            />
            <button
              type="submit"
              className="h-10 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center cursor-pointer shadow-md transition-transform hover:scale-105"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* FLOATING ACTION TRIGGER */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Chat on WhatsApp"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_25px_rgba(37,211,102,0.4)] hover:scale-110 transition-all duration-300 cursor-pointer"
      >
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-400 border-2 border-[#120D0A]" />
        </span>
        <MessageCircle className="h-7 w-7 fill-white text-[#25D366]" />
      </button>

    </div>
  );
}
