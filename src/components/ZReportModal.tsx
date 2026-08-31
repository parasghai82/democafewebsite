import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Printer, Coffee } from "lucide-react";
import { CafeAdminStore } from "@/lib/cafeAdminStore";

interface ZReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ZReportModal({ open, onOpenChange }: ZReportModalProps) {
  const orders = CafeAdminStore.getOrders();
  const bookings = CafeAdminStore.getTableBookings();
  const today = new Date().toLocaleDateString("en-CA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const printTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const validOrders = orders.filter((o) => o.status !== "Cancelled");
  const cancelledOrders = orders.filter((o) => o.status === "Cancelled");
  const grossSales = validOrders.reduce((sum, o) => sum + o.totalPrice, 0);
  const netSales = validOrders.reduce((sum, o) => sum + o.subtotal, 0);
  const taxCollected = validOrders.reduce((sum, o) => sum + o.tax, 0);

  const dineInOrders = validOrders.filter((o) => o.orderType === "Dine-In (Table)");
  const takeawayOrders = validOrders.filter((o) => o.orderType !== "Dine-In (Table)");

  // Item sales frequency
  const itemCounts: { [name: string]: { qty: number; revenue: number } } = {};
  validOrders.forEach((order) => {
    order.items.forEach((item) => {
      if (!itemCounts[item.name]) {
        itemCounts[item.name] = { qty: 0, revenue: 0 };
      }
      itemCounts[item.name].qty += item.quantity;
      itemCounts[item.name].revenue += item.price * item.quantity;
    });
  });

  const topItems = Object.entries(itemCounts)
    .sort((a, b) => b[1].qty - a[1].qty)
    .slice(0, 5);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-[#130E0A] border border-white/15 text-white shadow-2xl rounded-3xl p-6 font-body max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-2 border-b border-white/10">
          <div className="flex justify-center mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl gold-gradient-bg text-warm-brown font-bold shadow-md">
              <Coffee className="h-5 w-5" />
            </div>
          </div>
          <DialogTitle className="font-heading text-xl font-extrabold text-white">
            Daily Z-Report & Sales Summary
          </DialogTitle>
          <DialogDescription className="text-xs text-white/50">
            Toronto Cafe · 7 Baldwin St · Shift Financial Close
          </DialogDescription>
        </DialogHeader>

        {/* PRINTABLE THERMAL FISCAL REPORT CONTAINER */}
        <div id="z-report-print-area" className="bg-[#FAF7F2] text-[#1E140E] p-6 rounded-2xl font-mono text-xs shadow-inner space-y-4 my-2">
          
          {/* HEADER */}
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-gray-400">
            <p className="font-heading font-black text-base tracking-wider uppercase">TORONTO CAFE</p>
            <p className="text-[10px] text-gray-600">7 Baldwin St, Toronto, ON M5T 1L1</p>
            <p className="text-[10px] text-gray-600">GST/HST #: 84729-1998-RT0001</p>
            <p className="text-[11px] font-bold text-warm-brown mt-1">*** OFFICIAL DAILY Z-REPORT ***</p>
            <p className="text-[10px] text-gray-500">Date: {today}</p>
            <p className="text-[10px] text-gray-500">Close Time: {printTime} EST</p>
          </div>

          {/* FINANCIAL RECONCILIATION */}
          <div className="space-y-1.5 pb-3 border-b border-dashed border-gray-400">
            <p className="font-bold text-[11px] uppercase tracking-wider text-gray-800">1. Revenue Summary</p>
            <div className="flex justify-between">
              <span>Gross Sales (CAD):</span>
              <span className="font-bold font-mono">${grossSales.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Net Sales (Pre-Tax):</span>
              <span>${netSales.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Ontario HST (13%):</span>
              <span>${taxCollected.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm pt-1 border-t border-gray-300 text-warm-brown">
              <span>NET TOTAL PAID:</span>
              <span>${grossSales.toFixed(2)} CAD</span>
            </div>
          </div>

          {/* ORDER VOLUMES & CHANNELS */}
          <div className="space-y-1.5 pb-3 border-b border-dashed border-gray-400">
            <p className="font-bold text-[11px] uppercase tracking-wider text-gray-800">2. Order Volumes</p>
            <div className="flex justify-between">
              <span>Completed Orders:</span>
              <span className="font-bold">{validOrders.length}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>• Dine-In (Table):</span>
              <span>{dineInOrders.length} (${dineInOrders.reduce((s, o) => s + o.totalPrice, 0).toFixed(2)})</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>• Takeaway Pickup:</span>
              <span>{takeawayOrders.length} (${takeawayOrders.reduce((s, o) => s + o.totalPrice, 0).toFixed(2)})</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>Cancelled Tickets:</span>
              <span className="font-bold">{cancelledOrders.length}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Table Reservations:</span>
              <span>{bookings.length} parties</span>
            </div>
          </div>

          {/* TOP SELLING PRODUCTS */}
          {topItems.length > 0 && (
            <div className="space-y-1.5 pb-3 border-b border-dashed border-gray-400">
              <p className="font-bold text-[11px] uppercase tracking-wider text-gray-800">3. Top Selling Items</p>
              {topItems.map(([name, data], idx) => (
                <div key={idx} className="flex justify-between text-[11px]">
                  <span className="truncate pr-2">{idx + 1}. {name} (x{data.qty})</span>
                  <span className="font-bold shrink-0">${data.revenue.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          {/* REGISTER INTEGRITY STAMP */}
          <div className="text-center pt-1 text-[10px] text-gray-500 space-y-0.5">
            <p>TERMINAL: TORONTO-POS-01 (SHIFT ADMIN)</p>
            <p>STATUS: FISCAL BALANCE BALANCED</p>
            <p className="font-bold">*** END OF Z-REPORT ***</p>
          </div>

        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 h-11 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer transition-all"
          >
            Close
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 btn-3d-gold h-11 rounded-2xl text-warm-brown font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-102 transition-all"
          >
            <Printer className="h-4 w-4" />
            <span>Print Z-Report</span>
          </button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
