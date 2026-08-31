import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CheckSquare, Sun, Moon, Sparkles, CheckCircle2, RotateCcw, ShieldCheck } from "lucide-react";

interface ShiftChecklistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ChecklistItem {
  id: string;
  text: string;
  category: "morning" | "closing";
  hint?: string;
}

const DEFAULT_ITEMS: ChecklistItem[] = [
  // Morning Opening
  { id: "m1", category: "morning", text: "Dial in Espresso Grinder & Calibrate (27-30s shot timing)", hint: "Target 18g in / 36g out" },
  { id: "m2", category: "morning", text: "Verify Milk Fridge Temperature (< 4.0°C / 39°F)", hint: "Food safety compliance check" },
  { id: "m3", category: "morning", text: "Stock Pastry Display Case & Sourdough Loaves", hint: "Check fresh delivery from bakery" },
  { id: "m4", category: "morning", text: "Fill Ice Bins & Clean Water Pitchers", hint: "Cold drink prep station" },
  { id: "m5", category: "morning", text: "Turn Storefront Website Status 🟢 ONLINE", hint: "Enables customer ordering" },
  
  // Night Closing
  { id: "c1", category: "closing", text: "Backflush Espresso Group Heads with Cafiza Detergent", hint: "3x 10s cycles per group" },
  { id: "c2", category: "closing", text: "Purge & Vacuum Coffee Bean Grinder Hoppers", hint: "Store beans in airtight containers" },
  { id: "c3", category: "closing", text: "Soak Steam Wands & Sanitize Milk Pitchers", hint: "Prevent milk stone buildup" },
  { id: "c4", category: "closing", text: "Export & Print Daily Z-Report for Shift Accounting", hint: "File with daily receipt bag" },
  { id: "c5", category: "closing", text: "Sweep Patio, Empty Bins & Turn Store Status 🔴 OFFLINE", hint: "Secure building for the night" },
];

export function ShiftChecklistModal({ open, onOpenChange }: ShiftChecklistModalProps) {
  const [checkedIds, setCheckedIds] = useState<{ [id: string]: boolean }>({});
  const [activeTab, setActiveTab] = useState<"morning" | "closing">("morning");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("toronto_cafe_shift_checklist");
      if (saved) {
        setCheckedIds(JSON.parse(saved));
      }
    } catch {
      // storage ignore
    }
  }, []);

  const toggleItem = (id: string) => {
    const next = { ...checkedIds, [id]: !checkedIds[id] };
    setCheckedIds(next);
    try {
      localStorage.setItem("toronto_cafe_shift_checklist", JSON.stringify(next));
    } catch {
      // storage ignore
    }
  };

  const handleReset = () => {
    setCheckedIds({});
    try {
      localStorage.removeItem("toronto_cafe_shift_checklist");
    } catch {
      // storage ignore
    }
  };

  const currentItems = DEFAULT_ITEMS.filter((i) => i.category === activeTab);
  const completedCount = currentItems.filter((i) => checkedIds[i.id]).length;
  const progressPercent = Math.round((completedCount / currentItems.length) * 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-[#130E0A] border border-white/15 text-white shadow-2xl rounded-3xl p-6 font-body">
        <DialogHeader className="text-left pb-3 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl gold-gradient-bg text-warm-brown font-bold shadow-md">
                <CheckSquare className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="font-heading text-lg font-extrabold text-white">
                  Barista Shift Checklist
                </DialogTitle>
                <DialogDescription className="text-xs text-white/50">
                  Standard Operating Procedures (SOP) · Toronto Cafe
                </DialogDescription>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              title="Reset checklist for next shift"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>
        </DialogHeader>

        {/* SHIFT TABS (MORNING VS NIGHT) */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={() => setActiveTab("morning")}
            className={`p-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
              activeTab === "morning"
                ? "bg-butter text-warm-brown border-butter font-black shadow-md"
                : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
            }`}
          >
            <Sun className="h-4 w-4 text-amber-500" />
            <span>🌅 Morning Opening (5 Tasks)</span>
          </button>

          <button
            onClick={() => setActiveTab("closing")}
            className={`p-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
              activeTab === "closing"
                ? "bg-butter text-warm-brown border-butter font-black shadow-md"
                : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
            }`}
          >
            <Moon className="h-4 w-4 text-blue-400" />
            <span>🌙 Night Closing (5 Tasks)</span>
          </button>
        </div>

        {/* PROGRESS BAR */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs font-bold text-white/70">
            <span>Shift Readiness:</span>
            <span className={progressPercent === 100 ? "text-emerald-400" : "text-butter"}>
              {completedCount} of {currentItems.length} completed ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                progressPercent === 100 ? "bg-emerald-400" : "gold-gradient-bg"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* CHECKLIST ITEMS */}
        <div className="space-y-2.5 pt-2 max-h-[45vh] overflow-y-auto pr-1">
          {currentItems.map((item) => {
            const isChecked = !!checkedIds[item.id];

            return (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                  isChecked
                    ? "bg-emerald-500/10 border-emerald-500/40 text-white"
                    : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                }`}
              >
                <div
                  className={`mt-0.5 h-5 w-5 rounded-lg flex items-center justify-center border transition-colors shrink-0 ${
                    isChecked
                      ? "bg-emerald-500 border-emerald-400 text-black font-black"
                      : "border-white/30 bg-black/20"
                  }`}
                >
                  {isChecked && <CheckCircle2 className="h-4 w-4" />}
                </div>

                <div className="space-y-0.5 flex-1">
                  <p className={`text-xs font-bold leading-snug ${isChecked ? "line-through text-white/50" : "text-white"}`}>
                    {item.text}
                  </p>
                  {item.hint && <p className="text-[10px] text-white/40">{item.hint}</p>}
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="pt-3 border-t border-white/10 flex justify-between items-center">
          <p className="text-[10px] text-white/40 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Logged to shift memory</span>
          </p>
          <button
            onClick={() => onOpenChange(false)}
            className="btn-3d-gold px-5 py-2 rounded-xl text-warm-brown font-black text-xs cursor-pointer shadow-md"
          >
            Done
          </button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
