import React, { useState, useEffect, useRef } from "react";
import {
  Compass,
  Radar,
  Navigation,
  Activity,
  Search,
  CheckCircle2,
  Clock,
  Coffee,
  ShoppingBag,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  XCircle,
  MessageCircle,
  ArrowRight,
  RefreshCw,
  Trash2,
  Utensils,
  Sparkles,
  Printer,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CafeAdminStore, type CafeOrder } from "@/lib/cafeAdminStore";
import { ReceiptModal } from "@/components/ReceiptModal";

export function OrderTrackingModal({ defaultOrderNumber }: { defaultOrderNumber?: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeOrder, setActiveOrder] = useState<CafeOrder | null>(null);
  const [phoneOrders, setPhoneOrders] = useState<CafeOrder[]>([]);
  const [searched, setSearched] = useState(false);
  const [cancelToast, setCancelToast] = useState(false);
  const [adminCancelToast, setAdminCancelToast] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const previousStatusRef = useRef<string | null>(null);

  // Play audio chime for attention
  const playAlertChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
      osc.frequency.setValueAtTime(440, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {
      // Audio not permitted or blocked
    }
  };

  // Listen to global open tracking events
  useEffect(() => {
    const handleOpenTrack = (e: any) => {
      const orderNum = e.detail?.orderNumber || defaultOrderNumber;
      if (orderNum) {
        setQuery(orderNum);
        lookupOrder(orderNum);
      }
      setOpen(true);
    };

    window.addEventListener("toronto_cafe_open_tracking", handleOpenTrack);
    return () => window.removeEventListener("toronto_cafe_open_tracking", handleOpenTrack);
  }, [defaultOrderNumber]);

  // 1-minute countdown ticker for cancellation window
  useEffect(() => {
    if (!activeOrder) return;
    const updateSecs = () => {
      const sec = CafeAdminStore.getRemainingCancelSeconds(activeOrder);
      setRemainingSeconds(sec);
    };
    updateSecs();
    const timer = setInterval(updateSecs, 1000);
    return () => clearInterval(timer);
  }, [activeOrder]);

  // Live polling for status updates while modal is open & detect admin cancel notification
  useEffect(() => {
    if (!open || !activeOrder) return;
    previousStatusRef.current = activeOrder.status;

    const interval = setInterval(() => {
      const fresh = CafeAdminStore.getOrderByNumber(activeOrder.orderNumber);
      if (fresh) {
        // If staff just cancelled the order live
        if (
          previousStatusRef.current !== "Cancelled" &&
          fresh.status === "Cancelled" &&
          fresh.cancelledBy === "Admin"
        ) {
          playAlertChime();
          setAdminCancelToast(fresh.cancelReason || "Kitchen requested cancellation");
          setTimeout(() => setAdminCancelToast(null), 8000);
        }
        previousStatusRef.current = fresh.status;
        setActiveOrder(fresh);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [open, activeOrder?.orderNumber]);

  // Auto-initialize with latest placed order when modal opens
  useEffect(() => {
    if (open && !activeOrder) {
      try {
        const lastOrderNum = localStorage.getItem("toronto_cafe_last_order");
        const lastPhone = localStorage.getItem("toronto_cafe_last_phone");
        if (lastOrderNum) {
          const found = CafeAdminStore.getOrderByNumber(lastOrderNum);
          if (found) {
            setActiveOrder(found);
            setQuery(found.orderNumber);
            return;
          }
        }
        if (lastPhone) {
          const matches = CafeAdminStore.getOrdersByPhone(lastPhone);
          if (matches.length > 0) {
            setActiveOrder(matches[0]);
            setPhoneOrders(matches);
            setQuery(lastPhone);
            return;
          }
        }
      } catch (e) {
        // localStorage ignore
      }

      // Fallback: If any orders exist in store, display the most recent one
      const all = CafeAdminStore.getOrders();
      if (all.length > 0) {
        setActiveOrder(all[0]);
        setQuery(all[0].orderNumber);
      }
    }
  }, [open, activeOrder]);

  const lookupOrder = (searchStr?: string) => {
    const term = (searchStr !== undefined ? searchStr : query).trim();
    if (!term) return;

    setSearched(true);
    const byNumber = CafeAdminStore.getOrderByNumber(term);
    if (byNumber) {
      setActiveOrder(byNumber);
      setPhoneOrders([]);
      return;
    }

    const byPhone = CafeAdminStore.getOrdersByPhone(term);
    if (byPhone.length > 0) {
      setActiveOrder(byPhone[0]);
      setPhoneOrders(byPhone);
    } else {
      setActiveOrder(null);
      setPhoneOrders([]);
    }
  };

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (val.trim().length >= 2) {
      const byNum = CafeAdminStore.getOrderByNumber(val);
      if (byNum) {
        setActiveOrder(byNum);
        setPhoneOrders([]);
        setSearched(true);
        return;
      }
      const byPh = CafeAdminStore.getOrdersByPhone(val);
      if (byPh.length > 0) {
        setActiveOrder(byPh[0]);
        setPhoneOrders(byPh);
        setSearched(true);
        return;
      }
    }
  };

  const handleManualRefresh = () => {
    if (!activeOrder) return;
    setIsRefreshing(true);
    setTimeout(() => {
      const fresh = CafeAdminStore.getOrderByNumber(activeOrder.orderNumber);
      if (fresh) setActiveOrder(fresh);
      setIsRefreshing(false);
    }, 400);
  };

  const handleCancelOrder = () => {
    if (!activeOrder) return;
    if (
      confirm(
        `Are you sure you want to cancel order ${activeOrder.orderNumber}? (Within 1-minute window)`
      )
    ) {
      const res = CafeAdminStore.cancelOrderByCustomer(
        activeOrder.orderNumber,
        "Customer self-cancelled within 1 minute limit"
      );
      if (res.success) {
        setActiveOrder({ ...activeOrder, status: "Cancelled", cancelledBy: "Customer" });
        setCancelToast(true);
        setTimeout(() => setCancelToast(false), 4000);
      } else {
        alert(res.error || "Unable to cancel order");
      }
    }
  };

  const handleDoNewOrder = () => {
    setOpen(false);
    window.dispatchEvent(new CustomEvent("toronto_cafe_add_to_cart", { detail: null }));
  };

  const getStepProgress = (status: CafeOrder["status"]) => {
    switch (status) {
      case "New":
        return 1;
      case "Preparing":
        return 2;
      case "Ready":
        return 3;
      case "Completed":
        return 4;
      case "Cancelled":
        return 0;
      default:
        return 1;
    }
  };

  const currentStep = activeOrder ? getStepProgress(activeOrder.status) : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="inline-flex items-center gap-2 rounded-full border border-butter/30 bg-butter/10 hover:bg-butter/20 px-3.5 py-1.5 text-xs font-bold text-white transition-all cursor-pointer shadow-sm hover:scale-105 group"
          title="Track Live Order Status & Kitchen Progress"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <Radar className="h-3.5 w-3.5 text-butter transition-transform group-hover:rotate-45" />
          <span className="text-white group-hover:text-butter transition-colors">Track Order</span>
        </button>
      </DialogTrigger>

      <DialogContent className="bg-[#19120D] border border-white/15 text-white max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto font-body">
        <DialogHeader className="text-left space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-butter/30 bg-butter/10 px-2.5 py-0.5 text-[11px] font-bold text-butter w-fit">
            <Radar className="h-3 w-3 text-butter animate-pulse" />
            <span>Live Kitchen Radar & Order Tracker</span>
          </div>
          <DialogTitle className="font-heading text-xl font-bold text-white tracking-tight">
            Track or Cancel Your Order
          </DialogTitle>
          <DialogDescription className="text-xs text-white/60">
            Check real-time preparation status, table delivery, or cancel your order.
          </DialogDescription>
        </DialogHeader>

        {/* SEARCH BAR */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            lookupOrder();
          }}
          className="flex gap-2 pt-1"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
            <Input
              type="text"
              placeholder="Enter Order # (e.g. #TC-101) or Phone Number..."
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              className="pl-9 h-10 bg-white/5 border-white/15 rounded-xl text-white placeholder:text-white/30 text-xs"
            />
          </div>
          <button
            type="submit"
            className="btn-3d-gold h-10 px-4 rounded-xl font-bold text-xs text-warm-brown cursor-pointer shrink-0 shadow-md"
          >
            Find Order
          </button>
        </form>

        {/* RECENT PHONE MATCHES */}
        {phoneOrders.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[10px] text-white/50 shrink-0">Your Orders:</span>
            {phoneOrders.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setActiveOrder(o)}
                className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeOrder?.id === o.id
                    ? "bg-butter text-warm-brown shadow-sm"
                    : "bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                <span className="font-mono">{o.orderNumber}</span>
                {o.status === "Cancelled" ? (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-md font-extrabold ${
                      o.cancelledBy === "Admin"
                        ? "bg-red-500 text-white"
                        : "bg-red-500/20 text-red-300 border border-red-500/30"
                    }`}
                  >
                    {o.cancelledBy === "Admin" ? "⚠️ Staff Cancelled" : "👤 Cancelled"}
                  </span>
                ) : (
                  <span className="text-[9px] opacity-70">({o.status})</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* LIVE POPUP NOTIFICATION WHEN ADMIN CANCELS ORDER */}
        {adminCancelToast && (
          <div className="p-3.5 rounded-2xl bg-red-600 border-2 border-amber-400 text-white text-xs font-bold flex items-start gap-2.5 animate-bounce shadow-2xl">
            <AlertTriangle className="h-5 w-5 text-amber-300 shrink-0 mt-0.5" />
            <div>
              <p className="font-heading font-black text-sm text-amber-200 uppercase tracking-wide">
                📢 Kitchen Staff Cancellation Alert
              </p>
              <p className="text-white font-semibold">
                Your order was cancelled by cafe staff: <span className="underline italic">"{adminCancelToast}"</span>
              </p>
            </div>
          </div>
        )}

        {/* TOAST ON CUSTOMER CANCEL */}
        {cancelToast && (
          <div className="p-3.5 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
            <XCircle className="h-5 w-5 text-red-400 shrink-0" />
            <div>
              <p className="font-heading font-extrabold text-sm">Order Cancelled Successfully</p>
              <p className="text-[11px] text-white/70 font-normal">Our barista kitchen has been notified to stop preparation.</p>
            </div>
          </div>
        )}

        {/* ACTIVE ORDER DETAILS CARD */}
        {activeOrder ? (
          <div className="space-y-4 pt-2">
            
            {/* TICKET HEADER */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-bold text-butter">{activeOrder.orderNumber}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      activeOrder.status === "New"
                        ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                        : activeOrder.status === "Preparing"
                        ? "bg-butter/20 text-butter border border-butter/40 animate-pulse"
                        : activeOrder.status === "Ready"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse"
                        : activeOrder.status === "Completed"
                        ? "bg-white/20 text-white"
                        : "bg-red-500 text-white shadow-md font-black"
                    }`}
                  >
                    ● {activeOrder.status === "Cancelled" && activeOrder.cancelledBy === "Admin" ? "CANCELLED BY STAFF" : activeOrder.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] text-white/60 mt-0.5">
                  Guest: <span className="text-white font-bold">{activeOrder.customerName}</span> · {activeOrder.orderType}{" "}
                  {activeOrder.tableNumber ? `(${activeOrder.tableNumber})` : activeOrder.pickupTime ? `(${activeOrder.pickupTime})` : ""}
                </p>
              </div>

              <button
                type="button"
                onClick={handleManualRefresh}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-butter cursor-pointer transition-all"
                title="Refresh Live Status"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-butter" : ""}`} />
              </button>
            </div>

            {/* LIVE STEPPER PROGRESS (if not cancelled) */}
            {activeOrder.status !== "Cancelled" ? (
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                <div className="flex justify-between items-center text-[11px] font-bold">
                  <span className={currentStep >= 1 ? "text-butter font-extrabold" : "text-white/30"}>
                    1. Received
                  </span>
                  <span className={currentStep >= 2 ? "text-butter font-extrabold" : "text-white/30"}>
                    2. Kitchen Prep
                  </span>
                  <span className={currentStep >= 3 ? "text-emerald-400 font-extrabold" : "text-white/30"}>
                    3. Ready
                  </span>
                  <span className={currentStep >= 4 ? "text-white font-extrabold" : "text-white/30"}>
                    4. Enjoy
                  </span>
                </div>

                {/* Progress bar line */}
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#FBD982] via-[#F5AB38] to-emerald-400 transition-all duration-500 rounded-full"
                    style={{
                      width:
                        currentStep === 1
                          ? "25%"
                          : currentStep === 2
                          ? "55%"
                          : currentStep === 3
                          ? "85%"
                          : "100%",
                    }}
                  />
                </div>

                <p className="text-[11px] text-white/70 italic text-center pt-0.5">
                  {activeOrder.status === "New" && "Ticket received at kitchen display. Baristas will start preparation momentarily."}
                  {activeOrder.status === "Preparing" && "🔥 Baristas are currently grinding, brewing, and warming your order!"}
                  {activeOrder.status === "Ready" && "🎉 Your order is freshly prepared and ready for table pickup / counter collection!"}
                  {activeOrder.status === "Completed" && "✨ Order completed. Thank you for visiting Toronto Cafe!"}
                </p>
              </div>
            ) : activeOrder.cancelledBy === "Admin" ? (
              /* DEDICATED STAFF CANCELLATION NOTIFICATION CARD */
              <div className="p-4 rounded-2xl bg-gradient-to-br from-red-950 via-[#260D0C] to-amber-950/80 border-2 border-red-500/80 shadow-2xl space-y-3 animate-fadeIn">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 shrink-0">
                    <AlertTriangle className="h-6 w-6 animate-pulse text-amber-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500 text-white font-black text-[10px] uppercase tracking-wider shadow-sm">
                      ⚠️ Kitchen Staff Notice
                    </div>
                    <h4 className="font-heading font-black text-base text-white">
                      Order Cancelled by Toronto Cafe Staff
                    </h4>
                    <p className="text-xs text-white/70">
                      Time: <span className="font-mono text-amber-300 font-bold">{activeOrder.cancelledAt || "Recently"}</span>
                    </p>
                  </div>
                </div>

                {/* REASON BOX */}
                <div className="p-3.5 rounded-xl bg-black/60 border border-red-500/40 space-y-1.5">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-butter" />
                    <span>Message from Barista & Kitchen:</span>
                  </p>
                  <p className="text-xs font-bold text-red-200 leading-relaxed pl-1">
                    "{activeOrder.cancelReason || "Kitchen requested cancellation (e.g. freshly baked item out of stock / closing)"}"
                  </p>
                </div>

                {/* REFUND / PAYMENT REASSURANCE */}
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center gap-2 font-semibold">
                  <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>No charges applied or 100% full refund initiated. We apologize for the inconvenience!</span>
                </div>
              </div>
            ) : (
              /* CUSTOMER SELF-CANCELLATION CARD */
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-center text-xs text-red-200 font-semibold space-y-1">
                <p className="font-heading font-bold text-sm text-red-300">🚫 You Cancelled This Order</p>
                <p className="text-[11px] text-white/60">
                  Cancelled at <span className="font-mono text-white font-bold">{activeOrder.cancelledAt || "Recently"}</span> (Within 1-minute window).
                </p>
              </div>
            )}

            {/* ORDER ITEMS BREAKDOWN */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Ordered Items</p>
              <div className="divide-y divide-white/5">
                {activeOrder.items.map((item, idx) => (
                  <div key={idx} className="py-1.5 flex justify-between items-center">
                    <span className="text-white font-semibold">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-mono text-butter font-bold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-white/10 flex justify-between items-center font-bold text-sm text-butter">
                <span>Total Amount:</span>
                <span>${activeOrder.totalPrice.toFixed(2)} CAD</span>
              </div>
            </div>

            {/* 1-MINUTE TIME-LIMITED CUSTOMER CANCEL ACTION */}
            {activeOrder.status !== "Completed" && activeOrder.status !== "Cancelled" && (
              remainingSeconds > 0 ? (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-black text-amber-300">
                      <Clock className="h-4 w-4 animate-spin text-amber-400" />
                      <span>1-Minute Cancellation Window Active</span>
                    </div>
                    <p className="text-[11px] text-white/70 mt-0.5">
                      You can cancel within <span className="text-butter font-extrabold font-mono text-xs">{remainingSeconds}s</span> before kitchen brewing starts.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelOrder}
                    className="h-10 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md shrink-0 transition-all hover:scale-102"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Cancel Order ({remainingSeconds}s)</span>
                  </button>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2.5 text-xs text-white/70">
                  <Clock className="h-4 w-4 text-amber-400 shrink-0" />
                  <div>
                    <p className="font-bold text-white">🔒 Cancellation Window Closed (1-Minute Limit)</p>
                    <p className="text-[11px] text-white/50">Our baristas have started grinding, brewing, and warming your order.</p>
                  </div>
                </div>
              )
            )}

            {/* ACTION BUTTONS (REORDER / WHATSAPP) */}
            <div className="space-y-2 pt-1">
              
              <button
                type="button"
                onClick={handleDoNewOrder}
                className="w-full btn-3d-gold h-11 rounded-xl font-bold text-xs text-warm-brown flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Place a New Order</span>
              </button>

              {/* Print Receipt Button & WhatsApp Action */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShowReceipt(true)}
                  className="h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-white/10"
                >
                  <Printer className="h-3.5 w-3.5 text-butter" />
                  <span>View / Print Receipt</span>
                </button>

                {/* WhatsApp Support Button */}
                <a
                  href={CafeAdminStore.getWhatsAppLink(
                    activeOrder.status === "Cancelled" && activeOrder.cancelledBy === "Admin"
                      ? `Hi Toronto Cafe! ☕ I received a notification that my order ${activeOrder.orderNumber} was cancelled by staff. Please assist me.`
                      : `Hi Toronto Cafe! ☕ I have a question regarding my order ${activeOrder.orderNumber}.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-[#25D366]/30"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>

            </div>

          </div>
        ) : searched ? (
          <div className="py-8 text-center space-y-2">
            <AlertCircle className="h-8 w-8 text-amber-400 mx-auto opacity-70" />
            <p className="font-heading font-bold text-white text-sm">Order Not Found</p>
            <p className="text-xs text-white/50 max-w-xs mx-auto">
              Please double-check your Order Number (e.g. #TC-101) or Phone Number, or click below to place a new order.
            </p>
            <button
              type="button"
              onClick={handleDoNewOrder}
              className="btn-3d-gold h-10 px-5 rounded-xl font-bold text-xs text-warm-brown cursor-pointer mt-2 shadow-md"
            >
              Start a New Order
            </button>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-white/40">
            Enter your order number or phone above to view live kitchen preparation progress or cancel your order.
          </div>
        )}

        {/* THERMAL RECEIPT MODAL */}
        <ReceiptModal
          order={activeOrder}
          open={showReceipt}
          onOpenChange={setShowReceipt}
        />

      </DialogContent>
    </Dialog>
  );
}
