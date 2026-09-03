import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Coffee,
  MessageCircle,
  Clock,
  Send,
  Utensils,
  AlertTriangle,
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
import { CafeAdminStore, type CafeOrderItem, type MenuItem } from "@/lib/cafeAdminStore";
import { IpRateLimiter } from "@/lib/ipRateLimiter";

export function CartOrderDrawer() {
  const [open, setOpen] = useState(false);
  const [cart, setCart] = useState<CafeOrderItem[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [orderType, setOrderType] = useState<"Dine-In (Table)" | "Takeaway Pickup">("Dine-In (Table)");
  const [tableNumber, setTableNumber] = useState("Table 1 (Parlor)");
  const [pickupTime, setPickupTime] = useState("In 15 Minutes");
  const [notes, setNotes] = useState("");
  const [submittedOrder, setSubmittedOrder] = useState<string | null>(null);
  const [banError, setBanError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      IpRateLimiter.checkBanStatus().then((status) => {
        if (status.isBanned) {
          setBanError(
            `🚫 Security Lockout: Multiple rapid submissions detected from your IP (${status.ip}). Submissions are blocked for 1 hour (${status.remainingMinutes}m remaining).`
          );
        } else {
          setBanError(null);
        }
      });
    }
  }, [open]);

  // Detect URL ?table= query parameter on scan
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const params = new URLSearchParams(window.location.search);
        const tableParam = params.get("table");
        if (tableParam) {
          setOrderType("Dine-In (Table)");
          setTableNumber(decodeURIComponent(tableParam));
        }
      } catch (err) {
        // ignore
      }
    }
  }, []);

  // Global event listener for "Add to Bag" from any menu card
  useEffect(() => {
    const handleAddEvent = (e: any) => {
      const item: MenuItem = e.detail;
      if (item) {
        addItem(item);
      }
      setOpen(true);
    };

    window.addEventListener("toronto_cafe_add_to_cart", handleAddEvent);
    return () => window.removeEventListener("toronto_cafe_add_to_cart", handleAddEvent);
  }, []);

  const addItem = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.id);
      if (existing) {
        return prev.map((i) => (i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [
        ...prev,
        {
          menuItemId: item.id,
          name: item.name,
          quantity: 1,
          price: item.price,
        },
      ];
    });
  };

  const updateQuantity = (menuItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.menuItemId === menuItemId) {
            const nextQty = i.quantity + delta;
            return nextQty > 0 ? { ...i, quantity: nextQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CafeOrderItem[]
    );
  };

  const removeItem = (menuItemId: string) => {
    setCart((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.13;
  const total = subtotal + tax;
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmitOrder = async (e: React.FormEvent, viaWhatsApp = false) => {
    e.preventDefault();
    if (!name || !phone || cart.length === 0) return;

    // Rate limit check
    const rateCheck = await IpRateLimiter.recordSubmission("Online Cart Order");
    if (!rateCheck.allowed) {
      setBanError(rateCheck.error || "Too many submissions. Your IP is blocked for 1 hour.");
      return;
    }

    const newOrder = CafeAdminStore.addOrder({
      customerName: name,
      customerPhone: phone,
      orderType,
      tableNumber: orderType === "Dine-In (Table)" ? tableNumber : undefined,
      pickupTime: orderType === "Takeaway Pickup" ? pickupTime : undefined,
      items: cart,
      subtotal,
      tax,
      totalPrice: total,
      paymentMethod: "Pay at Barista Counter",
      notes: notes || undefined,
    });

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("toronto_cafe_last_order", newOrder.orderNumber);
        localStorage.setItem("toronto_cafe_last_phone", phone);
      } catch (err) {
        // storage ignored
      }
    }

    CafeAdminStore.logWhatsAppClick({
      buttonLocation: "Menu Order Button",
      intent: "Menu Order & Takeaway",
    });

    const itemList = cart
      .map((i) => `• ${i.quantity}x ${i.name} ($${(i.price * i.quantity).toFixed(2)})`)
      .join("\n");
    const msg =
      `Hello Toronto Cafe! ☕ Here is my new order ${newOrder.orderNumber}:\n\n` +
      `${itemList}\n\n` +
      `• Order Type: ${orderType} (${orderType === "Dine-In (Table)" ? tableNumber : pickupTime})\n` +
      `• Subtotal: $${subtotal.toFixed(2)}\n` +
      `• HST (13%): $${tax.toFixed(2)}\n` +
      `• Total: $${total.toFixed(2)} CAD\n` +
      `• Guest: ${name} (${phone})\n` +
      `• Notes: ${notes || "None"}`;
    window.open(CafeAdminStore.getWhatsAppLink(msg), "_blank");

    setSubmittedOrder(newOrder.orderNumber);
    setTimeout(() => {
      setSubmittedOrder(null);
      setCart([]);
      setOpen(false);
      setNotes("");
    }, 6000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="relative inline-flex items-center gap-2 rounded-full border border-butter/40 bg-butter/10 hover:bg-butter/20 px-3.5 py-1.5 text-xs font-bold text-butter transition-all cursor-pointer shadow-sm hover:scale-105"
          title="View Order Bag"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Bag</span>
          {totalItemCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-butter text-warm-brown text-[11px] font-extrabold shadow-sm animate-pulse">
              {totalItemCount}
            </span>
          )}
        </button>
      </DialogTrigger>

      <DialogContent className="bg-[#1A120D] border border-white/15 text-white max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto font-body">
        <DialogHeader className="text-left space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-butter/30 bg-butter/10 px-2.5 py-0.5 text-[11px] font-bold text-butter w-fit">
            <Coffee className="h-3 w-3" />
            <span>Toronto Cafe · Baldwin Village</span>
          </div>
          <DialogTitle className="font-heading text-xl font-bold text-white tracking-tight">
            Your Order Bag
          </DialogTitle>
          <DialogDescription className="text-xs text-white/60">
            Freshly prepared handcrafted drinks & bakes.
          </DialogDescription>
        </DialogHeader>

        {submittedOrder ? (
          <div className="py-6 text-center space-y-3 animate-fadeIn">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h3 className="font-heading text-xl font-bold text-white">Order Placed: {submittedOrder}</h3>
            <p className="text-xs text-white/70 max-w-xs mx-auto">
              Thank you, <span className="text-butter font-bold">{name}</span>! Your order has been sent to our barista kitchen.
            </p>
            <p className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1 rounded-full w-fit mx-auto">
              ⏱️ Ready in ~5–10 Minutes
            </p>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  const orderNum = submittedOrder;
                  setSubmittedOrder(null);
                  setCart([]);
                  setOpen(false);
                  window.dispatchEvent(
                    new CustomEvent("toronto_cafe_open_tracking", {
                      detail: { orderNumber: orderNum },
                    })
                  );
                }}
                className="btn-3d-gold h-11 px-5 rounded-xl font-bold text-xs text-warm-brown flex items-center justify-center gap-2 cursor-pointer w-full shadow-md"
              >
                <Clock className="h-4 w-4" />
                <span>Track Order Live ({submittedOrder})</span>
              </button>
            </div>
          </div>
        ) : cart.length === 0 ? (
          <div className="py-10 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-white/40 border border-white/10">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <p className="font-heading text-base font-bold text-white">Your Bag is Empty</p>
            <p className="text-xs text-white/50 max-w-xs mx-auto">
              Click <span className="text-butter font-semibold">"Add to Order Bag"</span> on any menu item to start your order.
            </p>
          </div>
        ) : (
          <form onSubmit={(e) => handleSubmitOrder(e, false)} className="space-y-4 text-left pt-1">
            
            {/* ITEMIZED CART LIST */}
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div
                  key={item.menuItemId}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs"
                >
                  <div className="flex-1 pr-2">
                    <p className="font-bold text-white text-xs">{item.name}</p>
                    <p className="text-[10px] text-butter">${item.price.toFixed(2)}</p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.menuItemId, -1)}
                      className="h-6 w-6 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-4 text-center font-bold text-xs text-white">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.menuItemId, 1)}
                      className="h-6 w-6 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.menuItemId)}
                      className="h-6 w-6 rounded-md text-white/40 hover:text-red-400 flex items-center justify-center cursor-pointer ml-0.5"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="w-14 text-right font-bold text-white text-xs pl-2">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* SIMPLE 2-OPTION TOGGLE: DINE-IN vs TAKEAWAY */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="grid grid-cols-2 gap-2 bg-black/30 p-1 rounded-2xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setOrderType("Dine-In (Table)")}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    orderType === "Dine-In (Table)"
                      ? "bg-butter text-warm-brown font-extrabold shadow-sm"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <Utensils className="h-3.5 w-3.5" />
                  <span>Dine-In (Table)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOrderType("Takeaway Pickup")}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    orderType === "Takeaway Pickup"
                      ? "bg-butter text-warm-brown font-extrabold shadow-sm"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <span>Takeaway (Pickup)</span>
                </button>
              </div>

              {/* TABLE OR TIME SELECTOR */}
              {orderType === "Dine-In (Table)" ? (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-white/70">Select Table</label>
                  <select
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="w-full h-10 px-3 bg-[#241B15] border border-white/15 rounded-xl text-white text-xs font-semibold"
                  >
                    <option value="Table 1 (Parlor Window)">Table 1 (Parlor Window)</option>
                    <option value="Table 2 (Parlor Center)">Table 2 (Parlor Center)</option>
                    <option value="Table 3 (Fireplace Nook)">Table 3 (Fireplace Nook)</option>
                    <option value="Table 4 (Basement Reading)">Table 4 (Basement Reading Nook)</option>
                    <option value="Table 5 (Basement Sofa)">Table 5 (Basement Sofa)</option>
                    <option value="Table 6 (Garden Patio)">Table 6 (Garden Patio)</option>
                    <option value="Table 7 (Patio Canopy)">Table 7 (Patio Canopy)</option>
                  </select>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-white/70">Pickup Time</label>
                  <select
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full h-10 px-3 bg-[#241B15] border border-white/15 rounded-xl text-white text-xs font-semibold"
                  >
                    <option value="In 10 Minutes">In 10 Minutes</option>
                    <option value="In 15 Minutes">In 15 Minutes</option>
                    <option value="In 30 Minutes">In 30 Minutes</option>
                    <option value="In 1 Hour">In 1 Hour</option>
                  </select>
                </div>
              )}
            </div>

            {/* NAME & PHONE */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-white/70">Your Name *</label>
                <Input
                  type="text"
                  required
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/5 border-white/15 rounded-xl text-white text-xs h-9.5"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-white/70">Phone Number *</label>
                <Input
                  type="tel"
                  required
                  placeholder="(416) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-white/5 border-white/15 rounded-xl text-white text-xs h-9.5"
                />
              </div>
            </div>

            {/* OPTIONAL NOTES */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-white/60">Special Request (Optional)</label>
              <Input
                type="text"
                placeholder="e.g. Oat milk, warm up pastry..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-white/5 border-white/15 rounded-xl text-white text-xs h-9"
              />
            </div>

            {/* TOTAL & SUBMIT BUTTONS */}
            <div className="pt-2 border-t border-white/10 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/60">Total ({totalItemCount} items incl. HST):</span>
                <span className="font-heading font-bold text-base text-butter">${total.toFixed(2)} CAD</span>
              </div>

              {/* BAN WARNING BANNER */}
              {banError && (
                <div className="p-3.5 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs font-bold flex items-start gap-2.5 animate-pulse">
                  <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-extrabold text-red-300">Ordering Blocked</p>
                    <p className="text-[11px] text-red-200/90 font-normal mt-0.5">{banError}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="submit"
                  disabled={Boolean(banError)}
                  className="btn-3d-gold h-11 rounded-xl font-bold text-xs text-warm-brown flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Place Order</span>
                </button>

                <button
                  type="button"
                  disabled={Boolean(banError)}
                  onClick={(e) => handleSubmitOrder(e, true)}
                  className="h-11 rounded-xl font-bold text-xs text-white bg-[#25D366] hover:bg-[#20bd5a] flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <MessageCircle className="h-3.5 w-3.5 fill-white text-[#25D366]" />
                  <span>WhatsApp</span>
                </button>
              </div>

              {/* DIRECT LINK TO TRACK OR CANCEL PREVIOUS ORDER */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    window.dispatchEvent(new CustomEvent("toronto_cafe_open_tracking", { detail: null }));
                  }}
                  className="text-[11px] text-white/50 hover:text-butter underline cursor-pointer transition-colors"
                >
                  Already placed an order? Track or Cancel your order here ➜
                </button>
              </div>
            </div>

          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
