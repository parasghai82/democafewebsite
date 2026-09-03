import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Sparkles,
  CheckCircle2,
  Send,
  MessageCircle,
  Coffee,
  Check,
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
import { Textarea } from "@/components/ui/textarea";
import { CafeAdminStore, type TableBooking } from "@/lib/cafeAdminStore";
import { IpRateLimiter } from "@/lib/ipRateLimiter";

interface TableBookingModalProps {
  children?: React.ReactNode;
  defaultFloor?: TableBooking["floorArea"];
}

export function TableBookingModal({ children, defaultFloor = "Any Available Space" }: TableBookingModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("12:00 PM");
  const [guests, setGuests] = useState("2");
  const [floorArea, setFloorArea] = useState<TableBooking["floorArea"]>(defaultFloor);
  const [specialRequest, setSpecialRequest] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [banError, setBanError] = useState<string | null>(null);

  React.useEffect(() => {
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

  const handleSubmit = async (e: React.FormEvent, viaWhatsApp: boolean = false) => {
    e.preventDefault();
    if (!name || !phone) return;

    // Continuous spam prevention (1-Hour Ban)
    const rateCheck = await IpRateLimiter.recordSubmission("Table Reservation");
    if (!rateCheck.allowed) {
      setBanError(rateCheck.error || "Too many submissions. Your IP is blocked for 1 hour.");
      return;
    }

    const bookingDate = date || new Date().toISOString().split("T")[0];

    // 1. Record in Admin Panel
    CafeAdminStore.addTableBooking({
      name,
      phone,
      email: email || "Not provided",
      date: bookingDate,
      time,
      guests: parseInt(guests, 10) || 2,
      floorArea,
      specialRequest: specialRequest || undefined,
      bookedVia: viaWhatsApp ? "WhatsApp Fast Book" : "Website Form",
    });

    CafeAdminStore.logWhatsAppClick({
      buttonLocation: "Table Booking Modal",
      intent: "Table Reservation",
    });

    // 2. Send complete details to WhatsApp
    const message = encodeURIComponent(
      `Hello Toronto Cafe! ☕ Here is my Table Reservation from the website:\n\n` +
      `• Guest Name: ${name}\n` +
      `• Phone Number: ${phone}\n` +
      `• Email: ${email || "Not provided"}\n` +
      `• Party Size: ${guests} Guests\n` +
      `• Reservation Date: ${bookingDate}\n` +
      `• Time: ${time}\n` +
      `• Preferred Seating: ${floorArea}\n` +
      `• Special Notes: ${specialRequest || "None"}`
    );
    window.open(`https://wa.me/14169771998?text=${message}`, "_blank");

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setOpen(false);
      setName("");
      setPhone("");
      setEmail("");
      setSpecialRequest("");
    }, 3500);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <button className="btn-3d-gold inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-bold text-warm-brown cursor-pointer shadow-md">
            <Calendar className="h-4 w-4" />
            <span>Book a Table</span>
          </button>
        )}
      </DialogTrigger>

      <DialogContent className="bg-[#1C1510] border border-white/15 text-white max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl">
        <DialogHeader className="text-left space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-butter/30 bg-butter/10 px-3 py-1 text-xs font-bold text-butter w-fit">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Baldwin Village Table Reservation</span>
          </div>
          <DialogTitle className="font-heading text-2xl font-bold text-white tracking-tight">
            Reserve Your House Table
          </DialogTitle>
          <DialogDescription className="text-xs text-white/60">
            Choose your preferred Victorian house level: Sunlit Parlor, Quiet Basement Nook, or Garden Patio.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center space-y-3 animate-fadeIn">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h3 className="font-heading text-xl font-bold text-white">Table Reserved!</h3>
            <p className="text-xs text-white/70 max-w-xs mx-auto">
              Thank you, {name}! Your reservation request for {guests} guests at {time} has been sent to our barista counter.
            </p>
          </div>
        ) : (
          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4 text-left pt-2">
            
            {/* Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-white/80">Full Name *</label>
                <Input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/5 border-white/15 rounded-xl text-white text-xs h-10"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-white/80">Phone Number (WhatsApp) *</label>
                <Input
                  type="tel"
                  required
                  placeholder="(416) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-white/5 border-white/15 rounded-xl text-white text-xs h-10"
                />
              </div>
            </div>

            {/* Email & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-white/80">Email (Optional)</label>
                <Input
                  type="email"
                  placeholder="your.email@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border-white/15 rounded-xl text-white text-xs h-10"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-white/80">Reservation Date *</label>
                <Input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-white/5 border-white/15 rounded-xl text-white text-xs h-10"
                />
              </div>
            </div>

            {/* Time Slot & Party Size */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-white/80">Time Slot</label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full h-10 px-3 bg-[#261D16] border border-white/15 rounded-xl text-white text-xs font-semibold"
                >
                  <option value="9:00 AM">9:00 AM (Fresh Morning Bakes)</option>
                  <option value="10:30 AM">10:30 AM (Coffee & Study)</option>
                  <option value="12:00 PM">12:00 PM (Lunch Brioche)</option>
                  <option value="1:30 PM">1:30 PM (Sunlit Parlor)</option>
                  <option value="3:00 PM">3:00 PM (Afternoon Matcha)</option>
                  <option value="4:30 PM">4:30 PM (Garden Patio Tea)</option>
                  <option value="6:00 PM">6:00 PM (Evening Candlelight)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-white/80">Party Size</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full h-10 px-3 bg-[#261D16] border border-white/15 rounded-xl text-white text-xs font-semibold"
                >
                  <option value="1">1 Guest (Solo / Laptop)</option>
                  <option value="2">2 Guests (Cozy Table)</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4 Guests (Parlor Booth)</option>
                  <option value="5">5 Guests</option>
                  <option value="6">6+ Guests (Garden Large)</option>
                </select>
              </div>
            </div>

            {/* Floor Preference */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-white/80">Preferred Floor / Space</label>
              <select
                value={floorArea}
                onChange={(e) => setFloorArea(e.target.value as any)}
                className="w-full h-10 px-3 bg-[#261D16] border border-white/15 rounded-xl text-white text-xs font-semibold"
              >
                <option value="Garden Terrace Patio">🌿 Garden Terrace Patio (Leafy Oasis · Dog Friendly)</option>
                <option value="Main Floor Parlor">☀️ Main Floor Parlor (Sunlit Bay Windows · Social)</option>
                <option value="Basement Reading Nook">📖 Basement Reading Nook (Quiet · Cozy Lamplight)</option>
                <option value="Any Available Space">✨ Any First Available Space</option>
              </select>
            </div>

            {/* Special Request */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-white/80">Special Occasion / Dietary Notes</label>
              <Textarea
                rows={2}
                placeholder="e.g. Birthday celebration, high-chair needed, dog with us, outlet for study..."
                value={specialRequest}
                onChange={(e) => setSpecialRequest(e.target.value)}
                className="bg-white/5 border-white/15 rounded-xl text-white text-xs resize-none"
              />
            </div>

            {/* BAN WARNING BANNER */}
            {banError && (
              <div className="p-3.5 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs font-bold flex items-start gap-2.5 animate-pulse">
                <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold text-red-300">Submission Blocked</p>
                  <p className="text-[11px] text-red-200/90 font-normal mt-0.5">{banError}</p>
                </div>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              <button
                type="submit"
                disabled={Boolean(banError)}
                className="btn-3d-gold h-11 rounded-xl font-bold text-xs text-warm-brown flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Check className="h-4 w-4" />
                <span>Confirm Reservation</span>
              </button>

              <button
                type="button"
                disabled={Boolean(banError)}
                onClick={(e) => handleSubmit(e, true)}
                className="h-11 rounded-xl font-bold text-xs text-white bg-[#25D366] hover:bg-[#20bd5a] flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all hover:scale-102 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <MessageCircle className="h-4 w-4 fill-white text-[#25D366]" />
                <span>Book via WhatsApp</span>
              </button>
            </div>

          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
