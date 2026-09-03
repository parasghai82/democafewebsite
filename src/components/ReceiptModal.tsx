import React from "react";
import { Printer, X, Coffee, CheckCircle, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CafeOrder } from "@/lib/cafeAdminStore";

export function ReceiptModal({
  order,
  open,
  onOpenChange,
}: {
  order: CafeOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#140E0A] border border-white/20 text-white max-w-sm rounded-3xl p-6 shadow-2xl font-body">
        <DialogHeader className="text-center space-y-1">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl gold-gradient-bg text-warm-brown font-bold shadow-md">
            <Coffee className="h-5 w-5" />
          </div>
          <DialogTitle className="font-heading text-lg font-black text-white tracking-tight">
            Toronto Cafe 1998
          </DialogTitle>
          <p className="text-[11px] text-white/60">
            7 Baldwin St, Baldwin Village, Toronto, ON
          </p>
          <p className="text-[10px] text-white/40">Tel: (647) 679-6375 · HST #: 83920-1998-RT0001</p>
        </DialogHeader>

        {/* THERMAL RECEIPT CONTAINER */}
        <div className="mt-3 p-4 rounded-2xl bg-black/60 border border-white/10 font-mono text-xs space-y-3">
          
          {/* ORDER & TIME */}
          <div className="border-b border-dashed border-white/20 pb-2 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-white/60">ORDER #:</span>
              <span className="font-bold text-butter">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">DATE/TIME:</span>
              <span className="text-white/80">{order.createdAt}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">GUEST:</span>
              <span className="text-white/90 font-bold">{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">TYPE:</span>
              <span className="text-amber-300 font-bold">
                {order.orderType} {order.tableNumber ? `(${order.tableNumber})` : order.pickupTime ? `(${order.pickupTime})` : ""}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">STATUS:</span>
              <span className={order.status === "Cancelled" ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>
                {order.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* ITEM BREAKDOWN */}
          <div className="space-y-1.5 py-1 text-xs">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start">
                <span className="text-white/90">
                  {item.quantity}x {item.name}
                </span>
                <span className="text-white font-bold ml-2">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* TOTALS & HST */}
          <div className="border-t border-dashed border-white/20 pt-2 space-y-1 text-xs">
            <div className="flex justify-between text-white/60 text-[11px]">
              <span>SUBTOTAL:</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white/60 text-[11px]">
              <span>HST (13%):</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-butter pt-1 border-t border-white/10">
              <span>TOTAL (CAD):</span>
              <span>${order.totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[10px] text-white/50 pt-0.5">
              <span>PAYMENT:</span>
              <span>{order.paymentMethod}</span>
            </div>
          </div>

          {/* BARCODE / FOOTER */}
          <div className="border-t border-dashed border-white/20 pt-2 text-center space-y-1 text-[10px] text-white/50">
            <p className="font-mono tracking-widest text-[9px] text-white/40">
              ||||| | |||| |||||| || | |||| ||||||
            </p>
            <p className="font-bold text-butter text-[11px]">📶 Guest WiFi: TorontoCafe_Guest</p>
            <p className="text-white/60">WiFi Password: <span className="font-bold text-white">baldwin1998</span></p>
            <p className="italic pt-1">Thank you for visiting Toronto Cafe! ✨</p>
          </div>

        </div>

        {/* PRINT ACTION BUTTON */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handlePrint}
            className="w-full btn-3d-gold h-11 rounded-xl font-bold text-xs text-warm-brown flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Printer className="h-4 w-4" />
            <span>Print Thermal Receipt / PDF</span>
          </button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
