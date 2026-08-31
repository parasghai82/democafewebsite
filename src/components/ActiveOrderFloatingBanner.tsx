import React, { useState, useEffect } from "react";
import { Radar, Clock, X, ChevronRight } from "lucide-react";
import { CafeAdminStore, type CafeOrder } from "@/lib/cafeAdminStore";

export function ActiveOrderFloatingBanner() {
  const [activeOrder, setActiveOrder] = useState<CafeOrder | null>(null);
  const [remainingSecs, setRemainingSecs] = useState<number>(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkOrder = () => {
      try {
        const lastOrderNum = localStorage.getItem("toronto_cafe_last_order");
        if (lastOrderNum) {
          const order = CafeAdminStore.getOrderByNumber(lastOrderNum);
          if (order && order.status !== "Completed") {
            setActiveOrder(order);
            const sec = CafeAdminStore.getRemainingCancelSeconds(order);
            setRemainingSecs(sec);
            return;
          }
        }
      } catch {
        // ignore
      }
      setActiveOrder(null);
    };

    checkOrder();
    const interval = setInterval(checkOrder, 2000);
    window.addEventListener("cafe_store_updated", checkOrder);
    return () => {
      clearInterval(interval);
      window.removeEventListener("cafe_store_updated", checkOrder);
    };
  }, []);

  if (!activeOrder || dismissed) return null;

  const handleOpen = () => {
    window.dispatchEvent(
      new CustomEvent("toronto_cafe_open_tracking", {
        detail: { orderNumber: activeOrder.orderNumber },
      })
    );
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 max-w-sm w-[calc(100vw-40px)] sm:w-auto animate-bounce-subtle">
      <div className="flex items-center gap-3 p-3 pl-3.5 pr-2.5 rounded-2xl bg-[#1D140D]/95 border border-butter/40 backdrop-blur-lg text-white shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
        
        {/* Pulsing Beacon */}
        <div className="relative flex h-3 w-3 shrink-0">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              activeOrder.status === "Cancelled"
                ? "bg-red-400"
                : activeOrder.status === "Ready"
                ? "bg-emerald-400"
                : "bg-amber-400"
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-3 w-3 ${
              activeOrder.status === "Cancelled"
                ? "bg-red-500"
                : activeOrder.status === "Ready"
                ? "bg-emerald-500"
                : "bg-amber-500"
            }`}
          />
        </div>

        {/* Info text */}
        <button
          type="button"
          onClick={handleOpen}
          className="text-left cursor-pointer flex-1"
        >
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-butter">{activeOrder.orderNumber}</span>
            <span
              className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-md ${
                activeOrder.status === "Cancelled"
                  ? "bg-red-500/20 text-red-300"
                  : activeOrder.status === "Ready"
                  ? "bg-emerald-500/20 text-emerald-300 animate-pulse"
                  : "bg-amber-400/20 text-amber-300"
              }`}
            >
              {activeOrder.status}
            </span>
          </div>

          <p className="text-[11px] text-white/70 flex items-center gap-1 mt-0.5">
            {activeOrder.status === "Cancelled" ? (
              <span className="text-red-300">Order cancelled · Tap details</span>
            ) : remainingSecs > 0 ? (
              <span>
                Cancel window: <strong className="text-butter">{remainingSecs}s</strong>
              </span>
            ) : (
              <span>Kitchen preparing order · Tap to view</span>
            )}
            <ChevronRight className="h-3 w-3 text-butter inline" />
          </p>
        </button>

        {/* Dismiss button */}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 cursor-pointer"
          title="Dismiss banner"
        >
          <X className="h-3.5 w-3.5" />
        </button>

      </div>
    </div>
  );
}
