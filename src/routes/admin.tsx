import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
  Sparkles,
  Coffee,
  Calendar,
  Star,
  Mail,
  Settings,
  Plus,
  Trash2,
  Check,
  AlertTriangle,
  Clock,
  MapPin,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Copy,
  RefreshCw,
  Sliders,
  DollarSign,
  MessageCircle,
  FileText,
  Download,
  Phone,
  ArrowUpRight,
  Inbox,
  Power,
  ShoppingBag,
  Receipt,
  Utensils,
  CreditCard,
  Bell,
  Volume2,
  VolumeX,
  Zap,
  CheckCheck,
  ChefHat,
  Flame,
  CheckSquare,
  Printer,
  QrCode,
  Radar,
  Timer,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ReceiptModal } from "@/components/ReceiptModal";
import { ZReportModal } from "@/components/ZReportModal";
import { ShiftChecklistModal } from "@/components/ShiftChecklistModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AdminAuthService,
  evaluatePasswordStrength,
  type SecurityAuditLog,
} from "@/lib/adminAuth";
import {
  CafeAdminStore,
  type MenuItem,
  type CafeOrder,
  type CafeOrderItem,
  type TableBooking,
  type WhatsAppClickLog,
  type FormSubmission,
  type ReviewItem,
  type VIPSubscriber,
  type CafeSettings,
} from "@/lib/cafeAdminStore";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Staff Admin Portal — Toronto Cafe" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

type AdminTab = "overview" | "orders" | "bookings" | "messages" | "menu" | "security";

function playChime() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // audio block ignore
  }
}

function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [tick, setTick] = useState(0);

  // Auto-Refresh
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<number>(5);
  const [secondsLeft, setSecondsLeft] = useState<number>(5);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>(() =>
    new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  );
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [newNotification, setNewNotification] = useState<string | null>(null);

  const prevOrdersRef = useRef<number>(CafeAdminStore.getOrders().length);
  const prevBookingsRef = useRef<number>(CafeAdminStore.getTableBookings().length);
  const prevFormsRef = useRef<number>(CafeAdminStore.getFormSubmissions().length);

  useEffect(() => {
    setIsAuthenticated(AdminAuthService.isAuthenticated());

    const handleUpdate = () => triggerRefresh(false);
    window.addEventListener("cafe_store_updated", handleUpdate);
    return () => window.removeEventListener("cafe_store_updated", handleUpdate);
  }, []);

  const triggerRefresh = (isManual = false) => {
    if (isManual) {
      setIsManualRefreshing(true);
      setTimeout(() => setIsManualRefreshing(false), 500);
    }

    const currentOrders = CafeAdminStore.getOrders();
    const currentBookings = CafeAdminStore.getTableBookings();
    const currentForms = CafeAdminStore.getFormSubmissions();

    if (currentOrders.length > prevOrdersRef.current) {
      const latest = currentOrders[0];
      setNewNotification(`🔔 New Order: ${latest?.orderNumber || "Order"} ($${latest?.totalPrice?.toFixed(2) || "0.00"})`);
      if (soundEnabled) playChime();
      setTimeout(() => setNewNotification(null), 5000);
    } else if (currentBookings.length > prevBookingsRef.current) {
      const latest = currentBookings[0];
      setNewNotification(`🔔 New Reservation: ${latest?.name || "Guest"} (${latest?.guests} Guests)`);
      if (soundEnabled) playChime();
      setTimeout(() => setNewNotification(null), 5000);
    } else if (currentForms.length > prevFormsRef.current) {
      const latest = currentForms[0];
      setNewNotification(`🔔 New Inquiry: ${latest?.name} (${latest?.formType})`);
      if (soundEnabled) playChime();
      setTimeout(() => setNewNotification(null), 5000);
    }

    prevOrdersRef.current = currentOrders.length;
    prevBookingsRef.current = currentBookings.length;
    prevFormsRef.current = currentForms.length;

    setTick((t) => t + 1);
    setSecondsLeft(refreshInterval);
    setLastRefreshedAt(
      new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    );
  };

  useEffect(() => {
    if (!autoRefreshEnabled || !isAuthenticated) return;
    setSecondsLeft(refreshInterval);

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          triggerRefresh(false);
          return refreshInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefreshEnabled, refreshInterval, isAuthenticated]);

  const handleLoginSuccess = () => setIsAuthenticated(true);
  const handleLogout = () => {
    AdminAuthService.logout();
    setIsAuthenticated(false);
  };

  const handleWipeAllData = () => {
    if (confirm("Clear all Orders, Table Bookings, and Messages? This starts a fresh clean day.")) {
      CafeAdminStore.clearAllActivityData();
      triggerRefresh(true);
      alert("All data cleared successfully!");
    }
  };

  const settings = CafeAdminStore.getSettings();
  const isOnline = settings.isWebsiteOnline;

  const handleToggleWebsitePower = () => {
    const nextState = !isOnline;
    CafeAdminStore.toggleWebsiteOnline(nextState);
  };

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  const ordersCount = CafeAdminStore.getOrders().length;
  const activeOrdersCount = CafeAdminStore.getOrders().filter((o) => o.status === "New" || o.status === "Preparing").length;
  const bookingsCount = CafeAdminStore.getTableBookings().length;
  const messagesCount = CafeAdminStore.getFormSubmissions().length + CafeAdminStore.getWhatsAppClicks().length;

  return (
    <div className="min-h-screen bg-[#0C0806] text-[#F5EBE1] flex flex-col font-body selection:bg-butter selection:text-warm-brown">
      
      {/* FLOATING REAL-TIME NOTIFICATION BANNER */}
      {newNotification && (
        <div className="fixed top-4 right-4 z-50 animate-bounce shadow-2xl">
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber to-butter text-warm-brown font-heading font-black text-xs border border-white/80 shadow-[0_8px_30px_rgba(245,185,85,0.7)]">
            <Bell className="h-4 w-4 animate-spin shrink-0" />
            <span>{newNotification}</span>
            <button
              onClick={() => setNewNotification(null)}
              className="ml-2 text-warm-brown/70 hover:text-warm-brown text-sm font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* TOP ENTERPRISE HEADER */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#140E0B]/95 backdrop-blur-xl px-4 sm:px-6 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-md">
        
        {/* Brand & Shift Info */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl gold-gradient-bg text-warm-brown font-bold shadow-md ring-1 ring-white/20">
            <Coffee className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-lg font-black text-white tracking-tight">Toronto Cafe</h1>
              <span className="rounded-full bg-butter/20 border border-butter/40 text-butter px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                POS Enterprise
              </span>
            </div>
            <p className="text-[11px] text-white/50">Baldwin Village · 7 Baldwin St, Toronto, ON</p>
          </div>
        </div>

        {/* Live Controls & Telemetry */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          
          {/* STORE STATUS TOGGLE SWITCH */}
          <button
            onClick={handleToggleWebsitePower}
            className={`h-10 px-4 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
              isOnline
                ? "bg-emerald-500 hover:bg-emerald-600 text-black ring-1 ring-emerald-400/50 shadow-emerald-500/20"
                : "bg-red-500 hover:bg-red-600 text-white ring-1 ring-red-400/50 shadow-red-500/20 animate-pulse"
            }`}
            title="Toggle storefront availability for customers"
          >
            <Power className="h-3.5 w-3.5" />
            <span>{isOnline ? "STORE ONLINE" : "STORE OFFLINE"}</span>
          </button>

          {/* RADAR SYNC CHIP */}
          <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 px-3 py-1.5 rounded-xl text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <button
              onClick={() => triggerRefresh(true)}
              className="flex items-center gap-1.5 font-bold text-white hover:text-butter cursor-pointer transition-colors"
              title="Click to force live sync"
            >
              <Radar className={`h-3.5 w-3.5 text-butter ${isManualRefreshing ? "animate-spin" : "animate-pulse"}`} />
              <span className="hidden sm:inline text-white/60">Sync:</span>
              <span className="text-butter font-mono font-bold">{secondsLeft}s</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-1 rounded-lg cursor-pointer transition-colors ${
                soundEnabled ? "text-butter bg-butter/10" : "text-white/30 hover:text-white"
              }`}
              title={soundEnabled ? "Audio alerts enabled" : "Audio muted"}
            >
              {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            </button>
          </div>

          {/* User Profile Chip */}
          <div className="hidden xl:flex items-center gap-2 bg-white/[0.04] border border-white/10 px-3 py-1.5 rounded-xl text-xs">
            <User className="h-3.5 w-3.5 text-butter" />
            <span className="font-semibold text-white/80">{AdminAuthService.getAdminId()}</span>
          </div>

          <Link
            to="/"
            target="_blank"
            className="h-10 px-3.5 rounded-xl border border-white/15 bg-white/[0.04] text-white hover:bg-white/10 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <span>Live Site</span>
            <ExternalLink className="h-3.5 w-3.5 text-butter" />
          </Link>

          <button
            onClick={handleLogout}
            className="h-10 px-3.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>

        </div>
      </header>

      {/* DASHBOARD BODY */}
      <div className="flex-1 flex flex-col lg:flex-row">
        
        {/* CATEGORIZED ENTERPRISE SIDEBAR */}
        <aside className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-white/[0.08] bg-[#120D09]/95 p-4 space-y-5 select-none">
          
          {/* SECTION 1: OPERATIONS */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-black tracking-widest uppercase text-white/40 mb-1">
              Core Operations
            </p>
            
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === "overview"
                  ? "bg-butter text-warm-brown shadow-md ring-1 ring-butter/80"
                  : "text-white/70 hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              <TrendingUp className="h-4 w-4 shrink-0" />
              <span>1. Overview</span>
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === "orders"
                  ? "bg-butter text-warm-brown shadow-md ring-1 ring-butter/80"
                  : "text-white/70 hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Radar className="h-4 w-4 shrink-0" />
                <span>2. Orders Tracker</span>
              </div>
              {activeOrdersCount > 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse ${
                  activeTab === "orders" ? "bg-warm-brown text-butter" : "bg-emerald-500 text-black"
                }`}>
                  {activeOrdersCount} ACTIVE
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("bookings")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === "bookings"
                  ? "bg-butter text-warm-brown shadow-md ring-1 ring-butter/80"
                  : "text-white/70 hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 shrink-0" />
                <span>3. Tables</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === "bookings" ? "bg-warm-brown text-butter" : "bg-white/10 text-white/80"
              }`}>
                {bookingsCount}
              </span>
            </button>
          </div>

          {/* SECTION 2: GUEST ENGAGEMENT */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-black tracking-widest uppercase text-white/40 mb-1">
              Guest Engagement
            </p>

            <button
              onClick={() => setActiveTab("messages")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === "messages"
                  ? "bg-butter text-warm-brown shadow-md ring-1 ring-butter/80"
                  : "text-white/70 hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageCircle className="h-4 w-4 shrink-0 text-[#25D366]" />
                <span>4. Messages & Leads</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === "messages" ? "bg-warm-brown text-butter" : "bg-[#25D366]/20 text-[#25D366]"
              }`}>
                {messagesCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("menu")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === "menu"
                  ? "bg-butter text-warm-brown shadow-md ring-1 ring-butter/80"
                  : "text-white/70 hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              <Coffee className="h-4 w-4 shrink-0" />
              <span>5. Menu Stock</span>
            </button>

            <button
              onClick={() => setActiveTab("qrcodes")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === "qrcodes"
                  ? "bg-butter text-warm-brown shadow-md ring-1 ring-butter/80"
                  : "text-white/70 hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              <QrCode className="h-4 w-4 shrink-0 text-amber-300" />
              <span>6. Table QR Codes</span>
            </button>
          </div>

          {/* SECTION 3: SYSTEM & DATA */}
          <div className="space-y-1 pt-2 border-t border-white/[0.08]">
            <p className="px-3 text-[10px] font-black tracking-widest uppercase text-white/40 mb-1">
              System Settings
            </p>

            <button
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === "security"
                  ? "bg-butter text-warm-brown shadow-md ring-1 ring-butter/80"
                  : "text-white/70 hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>7. Master Security</span>
            </button>

            <button
              onClick={handleWipeAllData}
              className="w-full mt-2 py-2 px-3 rounded-xl border border-red-500/20 bg-red-500/[0.04] hover:bg-red-500/15 text-red-300 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <Trash2 className="h-3 w-3" />
              <span>Reset Daily Test Data</span>
            </button>
          </div>

        </aside>

        {/* MAIN PANEL VIEW */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {activeTab === "overview" && <SimpleOverviewTab onNavigate={setActiveTab} />}
          {activeTab === "orders" && <SimpleOrdersTab />}
          {activeTab === "bookings" && <SimpleBookingsTab />}
          {activeTab === "messages" && <SimpleMessagesTab />}
          {activeTab === "menu" && <SimpleMenuTab />}
          {activeTab === "qrcodes" && <TableQRCodesTab />}
          {activeTab === "security" && <SimpleSecurityTab onLogout={handleLogout} />}
        </main>

      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 1. SIMPLE & BEAUTIFUL LOGIN VIEW
// -------------------------------------------------------------
function AdminLogin({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    try {
      const res = await AdminAuthService.login(adminId, password, true);
      if (res.success) {
        onLoginSuccess();
      } else {
        setErrorMessage(res.error || "Incorrect ID or Password");
      }
    } catch {
      setErrorMessage("Authentication error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0A07] flex items-center justify-center p-4 relative overflow-hidden font-body selection:bg-butter selection:text-warm-brown">
      {/* Background Animated Ambient Glowing Orbs */}
      <div className="absolute -top-20 -left-20 h-96 w-96 rounded-full bg-butter/15 blur-[120px] pointer-events-none animate-float-3d" />
      <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-[#E08316]/15 blur-[140px] pointer-events-none animate-float-3d-fast" />
      <div className="absolute top-1/3 right-10 h-64 w-64 rounded-full bg-amber-500/10 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md animate-admin-enter">
        
        <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-[#1A120D]/95 backdrop-blur-2xl p-8 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-center space-y-6">
          
          {/* Logo with Steam Animation & Depth */}
          <div className="relative mx-auto flex h-18 w-18 items-center justify-center rounded-3xl gold-gradient-bg text-warm-brown shadow-[0_8px_30px_rgba(245,185,85,0.4)] animate-float-3d">
            <span className="absolute -top-3 left-3 h-3 w-1 rounded-full bg-warm-brown/70 animate-coffee-steam-1" />
            <span className="absolute -top-4 right-4 h-3.5 w-1 rounded-full bg-warm-brown/80 animate-coffee-steam-2" />
            <Coffee className="h-9 w-9 text-warm-brown transition-transform hover:scale-110 duration-300" />
          </div>

          <div className="space-y-1">
            <h2 className="font-heading text-3xl font-black text-white tracking-tight">Toronto Cafe POS</h2>
            <p className="text-xs text-white/60">Baldwin Village · Staff & Management Portal</p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs font-bold animate-bounce">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-xs font-bold text-white/70">Staff Admin ID</label>
              <Input
                type="text"
                required
                autoComplete="username"
                placeholder="Enter Staff ID / Email"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                className="bg-white/5 border-white/15 rounded-2xl text-white text-xs sm:text-sm h-12 focus:border-butter/60 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-white/70">Master Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/5 border-white/15 rounded-2xl text-white text-xs sm:text-sm h-12 pr-10 focus:border-butter/60 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white cursor-pointer transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-2xl bg-butter text-warm-brown font-extrabold text-sm cursor-pointer transition-all hover:scale-102 hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? "Verifying..." : "Sign In to POS"}
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 2. SIMPLE OVERVIEW TAB
// -------------------------------------------------------------
function SimpleOverviewTab({ onNavigate }: { onNavigate: (tab: AdminTab) => void }) {
  const [, setDataTick] = useState(0);
  const [zReportOpen, setZReportOpen] = useState(false);
  const [checklistOpen, setChecklistOpen] = useState(false);

  useEffect(() => {
    const sync = () => setDataTick((t) => t + 1);
    window.addEventListener("cafe_store_updated", sync);
    return () => window.removeEventListener("cafe_store_updated", sync);
  }, []);

  const settings = CafeAdminStore.getSettings();
  const orders = CafeAdminStore.getOrders();
  const bookings = CafeAdminStore.getTableBookings();
  const totalRevenue = orders.filter((o) => o.status !== "Cancelled").reduce((sum, o) => sum + o.totalPrice, 0);
  const activeOrders = orders.filter((o) => o.status === "New" || o.status === "Preparing").length;
  const cancelledOrders = orders.filter((o) => o.status === "Cancelled");
  const messagesCount = CafeAdminStore.getFormSubmissions().length + CafeAdminStore.getWhatsAppClicks().length;

  return (
    <div className="space-y-6 max-w-6xl text-left animate-admin-enter">
      
      {/* 4 GIANT METRIC CARDS WITH ANIMATED DEPTH */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. ORDERS CARD */}
        <div
          onClick={() => onNavigate("orders")}
          className="admin-card-hover p-6 rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-[#182B1D] to-[#121B14] cursor-pointer shadow-xl space-y-2 relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              Kitchen Queue
            </span>
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 group-hover:scale-110 group-hover:rotate-6 transition-transform">
              <ChefHat className="h-5 w-5" />
            </div>
          </div>
          <p className="font-heading text-4xl font-black text-white">{activeOrders}</p>
          <p className="text-xs text-emerald-300 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>Manage Kitchen POS</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </p>
        </div>

        {/* 2. REVENUE CARD */}
        <div className="admin-card-hover p-6 rounded-3xl border border-butter/30 bg-gradient-to-br from-[#2D2115] to-[#1B140F] shadow-xl space-y-2 group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-butter flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-butter animate-spin-slow" />
              Gross Revenue
            </span>
            <div className="p-2.5 rounded-2xl bg-butter/20 text-butter group-hover:scale-110 group-hover:-rotate-6 transition-transform">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="font-heading text-4xl font-black text-butter">${totalRevenue.toFixed(2)}</p>
          <p className="text-xs text-white/60 font-semibold">{orders.length - cancelledOrders.length} Paid & Completed</p>
        </div>

        {/* 3. TABLE RESERVATIONS CARD */}
        <div
          onClick={() => onNavigate("bookings")}
          className="admin-card-hover p-6 rounded-3xl border border-amber/30 bg-gradient-to-br from-[#291B10] to-[#18120C] cursor-pointer shadow-xl space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber">Table Bookings</span>
            <div className="p-2.5 rounded-2xl bg-amber/20 text-amber group-hover:scale-110 group-hover:rotate-6 transition-transform">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <p className="font-heading text-4xl font-black text-white">{bookings.length}</p>
          <p className="text-xs text-amber-300 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>View Floor Plan & Seats</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </p>
        </div>

        {/* 4. CANCELLED BY USER CARD */}
        <div
          onClick={() => onNavigate("orders")}
          className={`admin-card-hover p-6 rounded-3xl border transition-all cursor-pointer shadow-xl space-y-2 group ${
            cancelledOrders.length > 0
              ? "border-red-500/30 bg-gradient-to-br from-[#2D1414] to-[#1A0B0B]"
              : "border-white/10 bg-[#1A120D] opacity-60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-red-400">User Cancellations</span>
            <div className="p-2.5 rounded-2xl bg-red-500/20 text-red-400 group-hover:scale-110 group-hover:rotate-12 transition-transform">
              <XCircle className="h-5 w-5" />
            </div>
          </div>
          <p className="font-heading text-4xl font-black text-white">{cancelledOrders.length}</p>
          <p className="text-xs text-red-300 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            {cancelledOrders.length > 0 ? (
              <>
                <span>Review Cancelled Tickets</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </>
            ) : (
              "No Cancellations Today"
            )}
          </p>
        </div>

      </div>

      {/* DAILY OPERATIONAL TOOLS: Z-REPORT & SHIFT CHECKLIST */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* 1. EOD Z-REPORT CARD */}
        <div className="admin-card-hover p-6 rounded-3xl border border-white/15 bg-gradient-to-br from-[#1C140E] to-[#120D09] shadow-xl space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-butter/20 text-butter font-extrabold text-[10px] uppercase tracking-wider">
                Shift Financials
              </span>
              <Printer className="h-4 w-4 text-butter" />
            </div>
            <h3 className="font-heading text-lg font-black text-white">Daily EOD Z-Report</h3>
            <p className="text-xs text-white/60">
              1-click financial close with 13% Ontario HST, total gross sales (${totalRevenue.toFixed(2)} CAD), and thermal print preview.
            </p>
          </div>

          <button
            onClick={() => setZReportOpen(true)}
            className="btn-3d-gold h-11 w-full rounded-2xl font-heading font-black text-xs text-warm-brown flex items-center justify-center gap-2 cursor-pointer shadow-md hover:scale-102 transition-all"
          >
            <Printer className="h-4 w-4" />
            <span>Generate & Print Z-Report</span>
          </button>
        </div>

        {/* 2. BARISTA SHIFT CHECKLIST CARD */}
        <div className="admin-card-hover p-6 rounded-3xl border border-white/15 bg-gradient-to-br from-[#1C140E] to-[#120D09] shadow-xl space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold text-[10px] uppercase tracking-wider">
                Standard SOPs
              </span>
              <CheckSquare className="h-4 w-4 text-emerald-400" />
            </div>
            <h3 className="font-heading text-lg font-black text-white">Barista Shift Checklist</h3>
            <p className="text-xs text-white/60">
              Morning opening grinder calibration, milk fridge temperature audits, and night closing sanitation routines.
            </p>
          </div>

          <button
            onClick={() => setChecklistOpen(true)}
            className="h-11 w-full rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-heading font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md hover:scale-102 transition-all"
          >
            <CheckSquare className="h-4 w-4 text-butter" />
            <span>Open Shift Checklist</span>
          </button>
        </div>

      </div>

      {/* QUICK SHORTCUTS GRID */}
      <div className="p-6 rounded-3xl border border-white/10 bg-[#1A120D] shadow-xl space-y-4">
        <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-butter" />
          Quick Operations Hub
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { id: "orders", label: "Kitchen POS", icon: "📡", desc: "Live tickets" },
            { id: "bookings", label: "Tables", icon: "🛋️", desc: "Reservations" },
            { id: "messages", label: "Messages", icon: "💬", desc: `${messagesCount} leads` },
            { id: "menu", label: "Menu Stock", icon: "☕", desc: "Prices & stock" },
            { id: "qrcodes", label: "Table QRs", icon: "📱", desc: "Scan links" },
            { id: "security", label: "Security", icon: "🔒", desc: "Master pass" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as AdminTab)}
              className="admin-card-hover p-4 rounded-2xl border border-white/10 bg-white/5 hover:border-butter/50 flex flex-col items-center text-center space-y-1 cursor-pointer group"
            >
              <span className="text-2xl group-hover:scale-120 group-hover:-translate-y-1 transition-transform duration-300">
                {item.icon}
              </span>
              <p className="font-heading font-extrabold text-white text-xs group-hover:text-butter transition-colors">
                {item.label}
              </p>
              <p className="text-[10px] text-white/50">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* QUICK STATUS SWITCHER */}
      <div className="p-6 rounded-3xl border border-white/10 bg-[#1A120D] shadow-xl space-y-4">
        <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
          <Power className="h-5 w-5 text-butter" />
          Store Online / Offline Switch
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => CafeAdminStore.saveSettings({ ...settings, isWebsiteOnline: true })}
            className={`p-4 rounded-2xl border font-bold text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer hover:scale-102 ${
              settings.isWebsiteOnline
                ? "bg-emerald-500 text-black border-emerald-400 font-black shadow-lg shadow-emerald-500/20"
                : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
            }`}
          >
            <CheckCircle2 className="h-5 w-5" />
            <span>🟢 Store Open & Website Live</span>
          </button>

          <button
            onClick={() => CafeAdminStore.saveSettings({ ...settings, isWebsiteOnline: false })}
            className={`p-4 rounded-2xl border font-bold text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer hover:scale-102 ${
              !settings.isWebsiteOnline
                ? "bg-red-500 text-white border-red-400 font-black shadow-lg shadow-red-500/20 animate-pulse"
                : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
            }`}
          >
            <XCircle className="h-5 w-5" />
            <span>🔴 Store Closed / Maintenance Pause</span>
          </button>
        </div>
      </div>

      {/* MODALS */}
      <ZReportModal open={zReportOpen} onOpenChange={setZReportOpen} />
      <ShiftChecklistModal open={checklistOpen} onOpenChange={setChecklistOpen} />

    </div>
  );
}

// -------------------------------------------------------------
// 3. MULTI-COLUMN ORDERS & KITCHEN POS
// -------------------------------------------------------------
function SimpleOrdersTab() {
  const [orders, setOrders] = useState<CafeOrder[]>(CafeAdminStore.getOrders());
  const [viewMode, setViewMode] = useState<"table_columns" | "kanban_columns" | "rush_tiles">("table_columns");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [receiptOrder, setReceiptOrder] = useState<CafeOrder | null>(null);

  useEffect(() => {
    const sync = () => setOrders(CafeAdminStore.getOrders());
    window.addEventListener("cafe_store_updated", sync);
    return () => window.removeEventListener("cafe_store_updated", sync);
  }, []);

  const handleStatusChange = (id: string, status: CafeOrder["status"]) => {
    CafeAdminStore.updateOrderStatus(id, status);
    setOrders(CafeAdminStore.getOrders());
    if (status === "Ready" || status === "Completed") {
      playChime();
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this order?")) {
      CafeAdminStore.deleteOrder(id);
      setOrders(CafeAdminStore.getOrders());
    }
  };

  const handleAdminCancel = (order: CafeOrder) => {
    const reason = prompt(
      `Cancel Order ${order.orderNumber}?\n\nEnter message for customer tracking screen:\n(e.g., Item out of stock / Kitchen closing):`,
      "Item out of stock / Kitchen closing"
    );
    if (reason !== null) {
      CafeAdminStore.cancelOrderByAdmin(order.id, reason.trim() || "Kitchen cancelled order");
      setOrders(CafeAdminStore.getOrders());
    }
  };

  const cancelledOrdersCount = orders.filter((o) => o.status === "Cancelled").length;

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = filterStatus === "all" || o.status === filterStatus;
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl text-left animate-admin-enter">
      
      {/* TOP CONTROLS & VIEW SWITCHER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-extrabold text-white flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400" />
            </span>
            <Radar className="h-6 w-6 text-butter animate-pulse" />
            <span>Live Kitchen Orders Tracker ({orders.length})</span>
          </h2>
          <p className="text-xs text-white/60">Organized in structured columns with real-time kitchen tracking & cancellation alerts.</p>
        </div>

        {/* View Mode Toggle & Clear Button */}
        <div className="flex flex-wrap items-center gap-2">
          
          <div className="bg-black/40 p-1 rounded-2xl border border-white/10 flex items-center gap-1">
            <button
              onClick={() => setViewMode("table_columns")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "table_columns"
                  ? "bg-butter text-warm-brown font-extrabold shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <span>📋 Table</span>
            </button>

            <button
              onClick={() => setViewMode("kanban_columns")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "kanban_columns"
                  ? "bg-butter text-warm-brown font-extrabold shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <span>📌 Kanban</span>
            </button>

            <button
              onClick={() => setViewMode("rush_tiles")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "rush_tiles"
                  ? "bg-gradient-to-r from-amber to-butter text-warm-brown font-black shadow-md ring-1 ring-white/50"
                  : "text-amber-300 hover:text-white"
              }`}
            >
              <Flame className="h-3.5 w-3.5 text-amber-500" />
              <span>⚡ Rush Tiles</span>
            </button>
          </div>

          {orders.length > 0 && (
            <button
              onClick={() => {
                if (confirm("Clear all orders?")) {
                  CafeAdminStore.clearAllOrders();
                  setOrders([]);
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-red-500/15 text-red-300 border border-red-500/30 text-xs font-bold cursor-pointer hover:bg-red-500/25"
            >
              Clear All
            </button>
          )}

        </div>
      </div>

      {/* SEARCH & STATUS FILTER */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#1A120D] p-3.5 rounded-2xl border border-white/10">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Radar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-butter" />
          <Input
            type="text"
            placeholder="Live search by Order # (#TC-101), Guest Name, or Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-white/5 border-white/15 rounded-xl text-white placeholder:text-white/30 text-xs"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Orders" },
            { id: "New", label: "🟡 New" },
            { id: "Preparing", label: "🔥 Preparing" },
            { id: "Ready", label: "🟢 Ready" },
            { id: "Completed", label: "✅ Done" },
            {
              id: "Cancelled",
              label: `❌ Cancelled by User (${cancelledOrdersCount})`,
              badge: cancelledOrdersCount > 0,
            },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setFilterStatus(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                filterStatus === st.id
                  ? st.id === "Cancelled"
                    ? "bg-red-500 text-white font-extrabold shadow-sm"
                    : "bg-butter text-warm-brown font-extrabold shadow-sm"
                  : st.id === "Cancelled" && st.badge
                  ? "bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              <span>{st.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. COLUMN TABLE VIEW                                           */}
      {/* ============================================================== */}
      {viewMode === "table_columns" && (
        <div className="rounded-3xl border border-white/15 bg-[#17100B] overflow-hidden shadow-2xl">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <ShoppingBag className="h-12 w-12 text-butter mx-auto opacity-60" />
              <h3 className="font-heading text-lg font-bold text-white">No Orders Found</h3>
              <p className="text-xs text-white/50">Orders placed or cancelled will appear here in structured columns.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                
                {/* TABLE COLUMN HEADERS */}
                <thead>
                  <tr className="bg-black/50 border-b border-white/10 text-white/60 uppercase text-[10px] tracking-wider font-extrabold">
                    <th className="py-4 px-4">Order # & Time</th>
                    <th className="py-4 px-4">Customer Details</th>
                    <th className="py-4 px-4">Type / Location</th>
                    <th className="py-4 px-4 min-w-[200px]">Ordered Items & Notes</th>
                    <th className="py-4 px-4">Total</th>
                    <th className="py-4 px-4 min-w-[220px]">Stage Progression</th>
                    <th className="py-4 px-4 text-right">Actions</th>
                  </tr>
                </thead>

                {/* TABLE ROWS */}
                <tbody className="divide-y divide-white/10 font-body">
                  {filteredOrders.map((order) => {
                    const isCancelled = order.status === "Cancelled";

                    return (
                      <tr
                        key={order.id}
                        className={`hover:bg-white/5 transition-colors ${
                          isCancelled
                            ? "bg-red-500/10 border-l-4 border-l-red-500"
                            : order.status === "New"
                            ? "bg-amber-400/5"
                            : order.status === "Preparing"
                            ? "bg-butter/5"
                            : order.status === "Ready"
                            ? "bg-emerald-500/10"
                            : ""
                        }`}
                      >
                        
                        {/* Column 1: Order # & Time */}
                        <td className="py-4 px-4 align-top">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-sm font-black text-butter bg-butter/10 border border-butter/30 px-2 py-0.5 rounded-md inline-block">
                                {order.orderNumber}
                              </span>
                              {isCancelled && (
                                <span className="px-1.5 py-0.5 rounded bg-red-500/30 border border-red-500 text-red-300 text-[10px] font-black uppercase">
                                  Cancelled
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-white/50">{order.createdAt || "Just Now"}</p>
                            {isCancelled && order.cancelledAt && (
                              <p className="text-[10px] text-red-400 font-bold">
                                ⏱️ Cancelled: {order.cancelledAt}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Column 2: Customer Details */}
                        <td className="py-4 px-4 align-top">
                          <div className="space-y-0.5">
                            <p className="font-heading font-bold text-white text-sm">{order.customerName}</p>
                            <a
                              href={`tel:${order.customerPhone}`}
                              className="text-xs text-butter font-mono hover:underline flex items-center gap-1"
                            >
                              📞 {order.customerPhone}
                            </a>
                            {isCancelled && (
                              <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-extrabold">
                                👤 {order.cancelledBy === "Customer" ? "Cancelled by User" : "Cancelled by Staff"}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Column 3: Type & Location */}
                        <td className="py-4 px-4 align-top">
                          <div className="space-y-1">
                            <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white font-bold text-[11px] inline-block">
                              {order.orderType}
                            </span>
                            <p className="text-xs text-amber-300 font-bold">
                              {order.tableNumber || order.pickupTime || "Counter"}
                            </p>
                          </div>
                        </td>

                        {/* Column 4: Items Breakdown & Reason */}
                        <td className="py-4 px-4 align-top">
                          <div className="space-y-1 max-w-xs">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs font-semibold text-white/90">
                                <span>
                                  <span className="text-butter font-bold mr-1">{item.quantity}x</span>
                                  {item.name}
                                </span>
                                <span className="text-white/50 text-[11px] font-mono pl-2">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            ))}

                            {/* CANCEL REASON HIGHLIGHT */}
                            {isCancelled && (
                              <div className="mt-1.5 p-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-[11px] font-bold">
                                ⚠️ Reason: {order.cancelReason || order.notes || "Customer self-cancelled via online tracker"}
                              </div>
                            )}

                            {!isCancelled && order.notes && (
                              <p className="text-[10px] text-amber-300 italic pt-1 border-t border-white/10">
                                Note: {order.notes}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Column 5: Total */}
                        <td className="py-4 px-4 align-top">
                          <div className="space-y-0.5">
                            <span className={`font-heading font-extrabold text-base ${isCancelled ? "text-red-400 line-through" : "text-butter"}`}>
                              ${order.totalPrice.toFixed(2)}
                            </span>
                            <p className="text-[10px] text-white/50 uppercase">{isCancelled ? "Cancelled" : "CAD"}</p>
                          </div>
                        </td>

                        {/* Column 6: Stage Progression Buttons */}
                        <td className="py-4 px-4 align-top">
                          {isCancelled ? (
                            <div className="space-y-1.5">
                              <span className="px-3 py-1.5 rounded-xl bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-extrabold inline-flex items-center gap-1.5">
                                <XCircle className="h-3.5 w-3.5 text-red-400" />
                                <span>Order Cancelled</span>
                              </span>
                              <div>
                                <button
                                  onClick={() => handleStatusChange(order.id, "Preparing")}
                                  className="text-[10px] text-white/60 hover:text-butter underline cursor-pointer"
                                  title="Restore order to Kitchen Prep"
                                >
                                  ↩️ Re-open to Kitchen Prep
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <button
                                onClick={() => handleStatusChange(order.id, "Preparing")}
                                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                  order.status === "Preparing"
                                    ? "bg-amber-400 text-black font-extrabold shadow-md"
                                    : "bg-white/10 text-white/70 hover:bg-white/20"
                                }`}
                              >
                                <Flame className="h-3 w-3" />
                                <span>Prep</span>
                              </button>

                              <button
                                onClick={() => handleStatusChange(order.id, "Ready")}
                                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                  order.status === "Ready"
                                    ? "bg-emerald-500 text-black font-extrabold shadow-md animate-pulse"
                                    : "bg-white/10 text-white/70 hover:bg-white/20"
                                }`}
                              >
                                <Bell className="h-3 w-3" />
                                <span>Ready</span>
                              </button>

                              <button
                                onClick={() => handleStatusChange(order.id, "Completed")}
                                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                  order.status === "Completed"
                                    ? "bg-white/30 text-white font-extrabold"
                                    : "bg-white/10 text-white/70 hover:bg-white/20"
                                }`}
                              >
                                <CheckCheck className="h-3 w-3" />
                                <span>Done</span>
                              </button>

                              <button
                                onClick={() => handleAdminCancel(order)}
                                className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 transition-all cursor-pointer flex items-center gap-1"
                                title="Cancel this order"
                              >
                                <XCircle className="h-3 w-3 text-red-400" />
                                <span>Cancel</span>
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Column 7: Actions */}
                        <td className="py-4 px-4 align-top text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isCancelled ? (
                              <a
                                href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                                  `Hello ${order.customerName}! ☕ We saw you cancelled your Toronto Cafe order ${order.orderNumber}. Please let us know if you need any assistance or refund support!`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-xl bg-[#25D366] text-white hover:bg-[#20bd5a] cursor-pointer shadow-sm"
                                title="WhatsApp Customer (Cancellation Follow-up)"
                              >
                                <MessageCircle className="h-4 w-4 fill-white text-[#25D366]" />
                              </a>
                            ) : (
                              <a
                                href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                                  `Hello ${order.customerName}! ☕ Regarding your Toronto Cafe order ${order.orderNumber}...`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 cursor-pointer"
                                title="WhatsApp Customer"
                              >
                                <MessageCircle className="h-4 w-4" />
                              </a>
                            )}

                            <button
                              onClick={() => setReceiptOrder(order)}
                              className="p-2 rounded-xl bg-white/10 text-butter hover:bg-white/20 cursor-pointer"
                              title="Print Thermal Kitchen Ticket / Receipt"
                            >
                              <Printer className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => handleDelete(order.id)}
                              className="p-2 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
                              title="Delete Order"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. KANBAN COLUMNS BOARD VIEW                                   */}
      {/* ============================================================== */}
      {viewMode === "kanban_columns" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
          
          {/* STAGE COLUMN 1: NEW */}
          <div className="rounded-3xl border border-amber-400/30 bg-[#1E150F] p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-amber-400/20">
              <span className="text-xs font-black uppercase text-amber-300 flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
                1. New Orders
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-extrabold text-[11px]">
                {orders.filter((o) => o.status === "New").length}
              </span>
            </div>

            <div className="space-y-3">
              {orders
                .filter((o) => o.status === "New")
                .map((order) => (
                  <div key={order.id} className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2.5 shadow-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono text-xs font-black text-butter bg-butter/15 px-2 py-0.5 rounded-md">
                          {order.orderNumber}
                        </span>
                        <p className="font-heading font-bold text-white text-sm mt-1">{order.customerName}</p>
                        <p className="text-[11px] text-white/60">{order.orderType} ({order.tableNumber || order.pickupTime})</p>
                      </div>
                      <span className="font-heading font-black text-butter text-sm">${order.totalPrice.toFixed(2)}</span>
                    </div>

                    <div className="text-xs space-y-0.5 text-white/80 border-t border-white/10 pt-1.5">
                      {order.items.map((i, idx) => (
                        <p key={idx} className="flex justify-between text-[11px]">
                          <span>{i.quantity}x {i.name}</span>
                          <span className="text-white/40">${(i.price * i.quantity).toFixed(2)}</span>
                        </p>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleStatusChange(order.id, "Preparing")}
                        className="btn-3d-gold flex-1 py-2 rounded-xl font-bold text-xs text-warm-brown flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <Flame className="h-3.5 w-3.5" />
                        <span>Prep ➜</span>
                      </button>

                      <button
                        onClick={() => handleAdminCancel(order)}
                        className="py-2 px-3 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 font-bold text-xs cursor-pointer"
                        title="Cancel Order"
                      >
                        <XCircle className="h-3.5 w-3.5 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* STAGE COLUMN 2: PREPARING */}
          <div className="rounded-3xl border border-butter/30 bg-[#1D170E] p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-butter/20">
              <span className="text-xs font-black uppercase text-butter flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-amber-400" />
                2. In Kitchen (Prep)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-butter/20 text-butter font-extrabold text-[11px]">
                {orders.filter((o) => o.status === "Preparing").length}
              </span>
            </div>

            <div className="space-y-3">
              {orders
                .filter((o) => o.status === "Preparing")
                .map((order) => (
                  <div key={order.id} className="p-4 rounded-2xl bg-black/40 border border-butter/30 space-y-2.5 shadow-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono text-xs font-black text-butter bg-butter/15 px-2 py-0.5 rounded-md">
                          {order.orderNumber}
                        </span>
                        <p className="font-heading font-bold text-white text-sm mt-1">{order.customerName}</p>
                        <p className="text-[11px] text-white/60">{order.orderType} ({order.tableNumber || order.pickupTime})</p>
                      </div>
                      <span className="font-heading font-black text-butter text-sm">${order.totalPrice.toFixed(2)}</span>
                    </div>

                    <div className="text-xs space-y-0.5 text-white/80 border-t border-white/10 pt-1.5">
                      {order.items.map((i, idx) => (
                        <p key={idx} className="flex justify-between text-[11px]">
                          <span>{i.quantity}x {i.name}</span>
                          <span className="text-white/40">${(i.price * i.quantity).toFixed(2)}</span>
                        </p>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleStatusChange(order.id, "Ready")}
                        className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md animate-pulse"
                      >
                        <Bell className="h-3.5 w-3.5" />
                        <span>Mark Ready! ➜</span>
                      </button>

                      <button
                        onClick={() => handleAdminCancel(order)}
                        className="py-2 px-3 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 font-bold text-xs cursor-pointer"
                        title="Cancel Order"
                      >
                        <XCircle className="h-3.5 w-3.5 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* STAGE COLUMN 3: READY */}
          <div className="rounded-3xl border border-emerald-500/30 bg-[#122115] p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
              <span className="text-xs font-black uppercase text-emerald-400 flex items-center gap-1.5">
                <Bell className="h-3.5 w-3.5 text-emerald-400 animate-bounce" />
                3. Ready for Guest
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[11px]">
                {orders.filter((o) => o.status === "Ready").length}
              </span>
            </div>

            <div className="space-y-3">
              {orders
                .filter((o) => o.status === "Ready")
                .map((order) => (
                  <div key={order.id} className="p-4 rounded-2xl bg-black/40 border border-emerald-500/40 space-y-2.5 shadow-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono text-xs font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md">
                          {order.orderNumber}
                        </span>
                        <p className="font-heading font-bold text-white text-sm mt-1">{order.customerName}</p>
                        <p className="text-[11px] text-emerald-300 font-bold">{order.tableNumber || order.pickupTime}</p>
                      </div>
                      <span className="font-heading font-black text-emerald-400 text-sm">${order.totalPrice.toFixed(2)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <a
                        href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                          `Hello ${order.customerName}! ☕ Your Toronto Cafe order ${order.orderNumber} is freshly ready at the counter!`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 rounded-xl bg-[#25D366] text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <MessageCircle className="h-3.5 w-3.5 fill-white text-[#25D366]" />
                        <span>WhatsApp</span>
                      </a>

                      <button
                        onClick={() => handleStatusChange(order.id, "Completed")}
                        className="py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <CheckCheck className="h-3.5 w-3.5" />
                        <span>Done ➜</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* STAGE COLUMN 4: COMPLETED */}
          <div className="rounded-3xl border border-white/10 bg-[#16100B] p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-black uppercase text-white/60 flex items-center gap-1.5">
                <CheckCheck className="h-3.5 w-3.5 text-white/50" />
                4. Completed
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/60 font-extrabold text-[11px]">
                {orders.filter((o) => o.status === "Completed").length}
              </span>
            </div>

            <div className="space-y-3">
              {orders
                .filter((o) => o.status === "Completed")
                .slice(0, 10)
                .map((order) => (
                  <div key={order.id} className="p-3.5 rounded-2xl bg-black/30 border border-white/5 space-y-1.5 opacity-75">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono font-bold text-white/70">{order.orderNumber}</span>
                      <span className="text-butter font-bold">${order.totalPrice.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-white/80 font-bold">{order.customerName}</p>
                    <p className="text-[10px] text-white/40">{order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}</p>
                  </div>
                ))}
            </div>
          </div>

          {/* STAGE COLUMN 5: CANCELLED BY USER */}
          <div className="rounded-3xl border border-red-500/30 bg-[#201010] p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-red-500/20">
              <span className="text-xs font-black uppercase text-red-400 flex items-center gap-1.5">
                <XCircle className="h-3.5 w-3.5 text-red-400" />
                5. Cancelled by User
              </span>
              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-extrabold text-[11px]">
                {orders.filter((o) => o.status === "Cancelled").length}
              </span>
            </div>

            <div className="space-y-3">
              {orders
                .filter((o) => o.status === "Cancelled")
                .map((order) => (
                  <div key={order.id} className="p-4 rounded-2xl bg-black/50 border border-red-500/40 space-y-2.5 shadow-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono text-xs font-black text-red-300 bg-red-500/20 px-2 py-0.5 rounded-md">
                          {order.orderNumber}
                        </span>
                        <p className="font-heading font-bold text-white text-sm mt-1">{order.customerName}</p>
                        <p className="text-[11px] text-red-300 font-bold">📞 {order.customerPhone}</p>
                      </div>
                      <span className="font-heading font-black text-red-400 line-through text-sm">${order.totalPrice.toFixed(2)}</span>
                    </div>

                    <div className="p-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-200 text-[11px]">
                      <p className="font-bold">⚠️ Cancel Reason:</p>
                      <p className="italic">{order.cancelReason || order.notes || "Customer self-cancelled"}</p>
                      {order.cancelledAt && <p className="text-[10px] text-red-300/70 mt-1">Cancelled at {order.cancelledAt}</p>}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                          `Hello ${order.customerName}! ☕ We saw you cancelled order ${order.orderNumber}. Please let us know if you need any assistance or refund!`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 rounded-xl bg-[#25D366] text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <MessageCircle className="h-3.5 w-3.5 fill-white text-[#25D366]" />
                        <span>WhatsApp</span>
                      </a>

                      <button
                        onClick={() => handleStatusChange(order.id, "Preparing")}
                        className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
                        title="Reopen order to Kitchen Prep"
                      >
                        ↩️
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* 3. RUSH TOUCH TILES VIEW (BARISTA SPEED MODE)                  */}
      {/* ============================================================== */}
      {viewMode === "rush_tiles" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-amber-500 animate-pulse" />
              <span className="font-heading font-black text-sm text-amber-300">
                ⚡ KITCHEN RUSH MODE — Tap any card to advance stage
              </span>
            </div>
            <span className="text-xs text-white/60 font-mono">
              Active Queue: {filteredOrders.filter((o) => o.status !== "Completed" && o.status !== "Cancelled").length} Tickets
            </span>
          </div>

          {filteredOrders.filter((o) => o.status !== "Completed" && o.status !== "Cancelled").length === 0 ? (
            <div className="p-16 text-center rounded-3xl border border-white/10 bg-white/[0.03] space-y-3">
              <CheckCircle2 className="h-14 w-14 text-emerald-400 mx-auto animate-bounce" />
              <h3 className="font-heading text-xl font-bold text-white">Kitchen Queue Clear!</h3>
              <p className="text-xs text-white/50">All orders are completed. Ready for the next rush.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrders
                .filter((o) => o.status !== "Completed" && o.status !== "Cancelled")
                .map((order) => {
                  const isNew = order.status === "New";
                  const isPrep = order.status === "Preparing";
                  const isReady = order.status === "Ready";

                  return (
                    <div
                      key={order.id}
                      className={`admin-card-hover p-6 rounded-3xl border-2 flex flex-col justify-between space-y-4 shadow-2xl transition-all ${
                        isNew
                          ? "border-amber-400 bg-gradient-to-br from-[#2D2115] to-[#17100B]"
                          : isPrep
                          ? "border-butter bg-gradient-to-br from-[#2D2416] to-[#18130B]"
                          : "border-emerald-400 bg-gradient-to-br from-[#192B1D] to-[#121B14]"
                      }`}
                    >
                      {/* TICKET TOP HEADER */}
                      <div className="flex items-start justify-between pb-3 border-b border-white/10">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xl font-black text-butter bg-black/40 px-2.5 py-1 rounded-xl border border-white/20 inline-block">
                              {order.orderNumber}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                              isNew
                                ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                                : isPrep
                                ? "bg-butter/20 text-butter border border-butter/40"
                                : "bg-emerald-400/20 text-emerald-300 border border-emerald-400/40"
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="font-heading text-lg font-black text-white mt-1.5">{order.customerName}</p>
                          <p className="text-xs text-butter font-bold">
                            📍 {order.orderType} · {order.tableNumber || order.pickupTime || "Counter"}
                          </p>
                        </div>
                        <span className="font-heading font-black text-xl text-butter">${order.totalPrice.toFixed(2)}</span>
                      </div>

                      {/* ITEMS TO MAKE */}
                      <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs">
                        <p className="text-[10px] uppercase tracking-wider text-white/40 font-black">Barista Items Checklist:</p>
                        {order.items.map((i, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm font-bold text-white">
                            <span>
                              <span className="text-butter font-black mr-2 text-base">{i.quantity}x</span>
                              {i.name}
                            </span>
                            <span className="text-white/40 font-mono text-xs">${(i.price * i.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                        {order.notes && (
                          <p className="text-xs text-amber-300 italic pt-1.5 border-t border-white/10">
                            📝 Special Note: "{order.notes}"
                          </p>
                        )}
                      </div>

                      {/* GIANT 1-TAP STAGE PROGRESSION BUTTON */}
                      <div className="space-y-2 pt-2">
                        {isNew && (
                          <button
                            onClick={() => handleStatusChange(order.id, "Preparing")}
                            className="w-full h-14 rounded-2xl gold-gradient-bg text-warm-brown font-heading font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-102 transition-all"
                          >
                            <Flame className="h-5 w-5" />
                            <span>🔥 START PREP (To Preparing) ➜</span>
                          </button>
                        )}

                        {isPrep && (
                          <button
                            onClick={() => handleStatusChange(order.id, "Ready")}
                            className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-black font-heading font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-102 transition-all shadow-emerald-500/20"
                          >
                            <CheckCircle2 className="h-5 w-5" />
                            <span>🟢 MARK READY & CHIME ➜</span>
                          </button>
                        )}

                        {isReady && (
                          <button
                            onClick={() => handleStatusChange(order.id, "Completed")}
                            className="w-full h-14 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-heading font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-102 transition-all"
                          >
                            <CheckCheck className="h-5 w-5" />
                            <span>✅ GUEST PICKED UP (Complete) ➜</span>
                          </button>
                        )}

                        {/* AUXILIARY ACTIONS */}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => setReceiptOrder(order)}
                            className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Printer className="h-3 w-3" />
                            <span>Receipt</span>
                          </button>

                          <a
                            href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                              `Hello ${order.customerName}! ☕ Your Toronto Cafe order ${order.orderNumber} is freshly ready!`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2 rounded-xl bg-[#25D366] text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <MessageCircle className="h-3 w-3 fill-white text-[#25D366]" />
                            <span>WhatsApp</span>
                          </a>

                          <button
                            onClick={() => handleAdminCancel(order)}
                            className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold cursor-pointer"
                            title="Cancel order"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* THERMAL RECEIPT MODAL */}
      <ReceiptModal
        order={receiptOrder}
        open={!!receiptOrder}
        onOpenChange={(open) => !open && setReceiptOrder(null)}
      />

    </div>
  );
}

// -------------------------------------------------------------
// 4. SIMPLE TABLE BOOKINGS TAB
// -------------------------------------------------------------
function SimpleBookingsTab() {
  const [bookings, setBookings] = useState<TableBooking[]>(CafeAdminStore.getTableBookings());

  useEffect(() => {
    const sync = () => setBookings(CafeAdminStore.getTableBookings());
    window.addEventListener("cafe_store_updated", sync);
    return () => window.removeEventListener("cafe_store_updated", sync);
  }, []);

  const handleStatus = (id: string, status: TableBooking["status"]) => {
    CafeAdminStore.updateBookingStatus(id, status);
    setBookings(CafeAdminStore.getTableBookings());
  };

  return (
    <div className="space-y-6 max-w-5xl text-left animate-admin-enter">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-extrabold text-white flex items-center gap-2">
            <Calendar className="h-6 w-6 text-butter" />
            Table Reservations ({bookings.length})
          </h2>
          <p className="text-xs text-white/60">Guests who reserved seats across parlor, basement, and garden patio.</p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-white/10 bg-white/5 space-y-3">
          <Users className="h-12 w-12 text-butter mx-auto opacity-70" />
          <h3 className="font-heading text-lg font-bold text-white">No Table Bookings Yet</h3>
          <p className="text-xs text-white/50">When guests book a table on the website, their details appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookings.map((b) => (
            <div key={b.id} className="admin-card-hover p-6 rounded-3xl border border-white/15 bg-[#1B140F] shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-lg font-bold text-white">{b.name}</h3>
                  <p className="text-xs text-butter font-mono font-bold">{b.phone}</p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-butter/20 text-butter text-xs font-extrabold">
                  {b.guests} Guests
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-black/30 text-xs space-y-1 text-white/80">
                <p>📅 <span className="font-bold text-white">{b.date}</span> at <span className="font-bold text-butter">{b.time}</span></p>
                <p>📍 Location: <span className="font-bold text-white">{b.floorArea}</span></p>
                {b.specialRequest && <p className="italic text-white/60">"{b.specialRequest}"</p>}
              </div>

              <div className="flex items-center justify-between pt-2">
                <a
                  href={`https://wa.me/${b.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                    `Hi ${b.name}! ☕ Toronto Cafe confirming your table for ${b.guests} guests on ${b.date} at ${b.time}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 px-4 rounded-xl bg-[#25D366] text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <MessageCircle className="h-3.5 w-3.5 fill-white text-[#25D366]" />
                  <span>WhatsApp Guest</span>
                </a>

                <button
                  onClick={() => {
                    if (confirm("Delete reservation?")) {
                      CafeAdminStore.deleteTableBooking(b.id);
                      setBookings(CafeAdminStore.getTableBookings());
                    }
                  }}
                  className="p-2 text-white/40 hover:text-red-400 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// 5. SIMPLE MESSAGES & INQUIRIES TAB
// -------------------------------------------------------------
function SimpleMessagesTab() {
  const [forms, setForms] = useState<FormSubmission[]>(CafeAdminStore.getFormSubmissions());

  useEffect(() => {
    const sync = () => setForms(CafeAdminStore.getFormSubmissions());
    window.addEventListener("cafe_store_updated", sync);
    return () => window.removeEventListener("cafe_store_updated", sync);
  }, []);

  return (
    <div className="space-y-6 max-w-5xl text-left animate-admin-enter">
      <div>
        <h2 className="font-heading text-2xl font-extrabold text-white flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-[#25D366]" />
          Guest Messages & WhatsApp Inquiries
        </h2>
        <p className="text-xs text-white/60">Private event requests, catering buyouts, and WhatsApp interactions.</p>
      </div>

      <div className="space-y-4">
        {forms.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-white/10 bg-white/[0.03] space-y-3">
            <Inbox className="h-12 w-12 text-butter mx-auto opacity-60" />
            <h3 className="font-heading text-lg font-bold text-white">No Inquiries Yet</h3>
            <p className="text-xs text-white/50">Customer event inquiries and chat messages will appear here.</p>
          </div>
        ) : (
          forms.map((f) => {
            const cleanPhone = f.phone?.replace(/[^0-9]/g, "");

            return (
              <div key={f.id} className="admin-card-hover p-6 rounded-3xl border border-white/15 bg-[#1B140F] shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-butter/20 text-butter text-[10px] font-black uppercase tracking-wider">
                      {f.formType}
                    </span>
                    <span className="font-heading font-black text-white text-base">{f.name}</span>
                  </div>
                  <span className="text-xs text-white/40 font-mono">{f.createdAt || "Recent"}</span>
                </div>

                <p className="text-xs text-white/90 italic bg-black/40 p-3.5 rounded-2xl border border-white/10">
                  "{f.notes}"
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-white/10 text-xs text-white/60">
                  <div className="space-y-0.5">
                    <p>📧 <span className="text-white font-semibold">{f.email}</span></p>
                    <p>📞 <span className="text-butter font-mono font-bold">{f.phone}</span></p>
                  </div>

                  <div className="flex items-center gap-2">
                    {cleanPhone && cleanPhone.length >= 10 && (
                      <a
                        href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                          `Hello ${f.name}! ☕ Toronto Cafe following up on your ${f.formType}. How can we assist you today?`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-10 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                      >
                        <MessageCircle className="h-3.5 w-3.5 fill-white text-[#25D366]" />
                        <span>WhatsApp Reply</span>
                      </a>
                    )}

                    <a
                      href={`mailto:${f.email}?subject=Toronto Cafe - ${encodeURIComponent(f.formType)}`}
                      className="h-10 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
                    >
                      <Mail className="h-3.5 w-3.5 text-butter" />
                      <span>Reply Email</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 6. SIMPLE MENU & STOCK TOGGLE TAB
// -------------------------------------------------------------
function SimpleMenuTab() {
  const [menu, setMenu] = useState<MenuItem[]>(CafeAdminStore.getMenu());

  useEffect(() => {
    const sync = () => setMenu(CafeAdminStore.getMenu());
    window.addEventListener("cafe_store_updated", sync);
    return () => window.removeEventListener("cafe_store_updated", sync);
  }, []);

  const toggleStock = (id: string) => {
    CafeAdminStore.toggleItemStock(id);
    setMenu(CafeAdminStore.getMenu());
  };

  return (
    <div className="space-y-6 max-w-5xl text-left animate-admin-enter">
      <div>
        <h2 className="font-heading text-2xl font-extrabold text-white flex items-center gap-2">
          <Coffee className="h-6 w-6 text-butter" />
          Menu Stock (Tap to Toggle In-Stock / Sold Out)
        </h2>
        <p className="text-xs text-white/60">Tap any item button to immediately mark it as In Stock (Green) or Sold Out (Red).</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {menu.map((item) => (
          <div
            key={item.id}
            className={`admin-card-hover p-5 rounded-3xl border-2 transition-all shadow-lg flex items-center justify-between gap-4 ${
              item.inStock ? "border-emerald-500/30 bg-[#162419]" : "border-red-500/30 bg-[#251313]"
            }`}
          >
            <div>
              <h3 className="font-heading font-bold text-white text-base">{item.name}</h3>
              <p className="text-xs text-butter font-bold mt-0.5">${item.price.toFixed(2)} CAD</p>
              <p className="text-[11px] text-white/50 line-clamp-1 mt-0.5">{item.description}</p>
            </div>

            {/* BIG 1-TAP IN STOCK SWITCH */}
            <button
              onClick={() => toggleStock(item.id)}
              className={`h-12 px-5 rounded-2xl font-black text-xs cursor-pointer transition-all shrink-0 shadow-lg ${
                item.inStock
                  ? "bg-emerald-500 text-black shadow-emerald-500/30 hover:bg-emerald-600"
                  : "bg-red-500 text-white shadow-red-500/30 hover:bg-red-600"
              }`}
            >
              {item.inStock ? "🟢 IN STOCK" : "🔴 SOLD OUT"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 7. SIMPLE SECURITY & PASSWORD TAB
// -------------------------------------------------------------
function SimpleSecurityTab({ onLogout }: { onLogout: () => void }) {
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [msg, setMsg] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass.length < 12) {
      setMsg("⚠️ Password must be at least 12 characters");
      return;
    }
    if (newPass !== confirmPass) {
      setMsg("⚠️ Passwords do not match");
      return;
    }

    const res = await AdminAuthService.updateCredentials(AdminAuthService.getAdminId(), newPass);
    if (res.success) {
      setMsg("✅ Master Password updated and securely encrypted!");
      setNewPass("");
      setConfirmPass("");
    } else {
      setMsg(res.error || "⚠️ Failed to update password");
    }
  };

  return (
    <div className="space-y-6 max-w-md text-left animate-admin-enter">
      <div>
        <h2 className="font-heading text-2xl font-extrabold text-white flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-butter" />
          Master Password Settings
        </h2>
        <p className="text-xs text-white/60">Update your login password anytime.</p>
      </div>

      {msg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-bounce">
          {msg}
        </div>
      )}

      <form onSubmit={handleSave} className="p-6 rounded-3xl border border-white/10 bg-[#1B140F] space-y-4 shadow-xl">
        <div className="space-y-1">
          <label className="text-xs font-bold text-white/70">New Password</label>
          <Input
            type="password"
            required
            placeholder="Min 12 characters"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            className="bg-white/5 border-white/15 rounded-xl text-white text-xs h-11 focus:border-butter/60"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-white/70">Confirm Password</label>
          <Input
            type="password"
            required
            placeholder="Re-enter password"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
            className="bg-white/5 border-white/15 rounded-xl text-white text-xs h-11 focus:border-butter/60"
          />
        </div>

        <button
          type="submit"
          className="btn-3d-gold w-full h-12 rounded-xl font-bold text-xs text-warm-brown cursor-pointer shadow-md hover:scale-102 transition-transform"
        >
          Save New Password
        </button>
      </form>
    </div>
  );
}

// -------------------------------------------------------------
// 7. TABLE QR CODES & DINE-IN ORDERING LINKS
// -------------------------------------------------------------
function TableQRCodesTab() {
  const [copiedTable, setCopiedTable] = useState<string | null>(null);

  const tables = [
    { id: "Table 1 (Parlor)", name: "Table 1", area: "Ground Floor · Historic Parlor", icon: "☕" },
    { id: "Table 2 (Fireplace)", name: "Table 2", area: "Ground Floor · Fireplace Nook", icon: "🔥" },
    { id: "Table 3 (Library)", name: "Table 3", area: "Level 2 · Heritage Library Room", icon: "📚" },
    { id: "Table 4 (Vinyl Lounge)", name: "Table 4", area: "Level 2 · Vinyl Listening Lounge", icon: "🎵" },
    { id: "Table 5 (Attic Loft)", name: "Table 5", area: "Level 3 · Sunlit Attic Study", icon: "✨" },
    { id: "Patio Table A", name: "Patio Table A", area: "Outdoor · Leafy Garden Patio", icon: "🌿" },
    { id: "Patio Table B", name: "Patio Table B", area: "Outdoor · Leafy Garden Patio", icon: "🌿" },
    { id: "Basement Vault", name: "Basement Vault", area: "Lower Level · Cozy Speakeasy Booth", icon: "🗝️" },
  ];

  const getTableUrl = (tableId: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:8080";
    return `${origin}/?table=${encodeURIComponent(tableId)}`;
  };

  const handleCopy = (tableId: string) => {
    const url = getTableUrl(tableId);
    navigator.clipboard.writeText(url);
    setCopiedTable(tableId);
    setTimeout(() => setCopiedTable(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-6xl text-left animate-admin-enter">
      <div>
        <h2 className="font-heading text-2xl font-extrabold text-white flex items-center gap-2">
          <QrCode className="h-6 w-6 text-butter" />
          Table QR Codes & Direct Dine-In Ordering
        </h2>
        <p className="text-xs text-white/60">
          Guests can scan table QR codes with their phone cameras to order directly to their exact table.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tables.map((table) => {
          const url = getTableUrl(table.id);
          const isCopied = copiedTable === table.id;

          return (
            <div
              key={table.id}
              className="admin-card-hover p-5 rounded-3xl border border-white/10 bg-[#1A120D] hover:border-butter/40 transition-all flex flex-col justify-between space-y-4 shadow-xl group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{table.icon}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-butter/15 text-butter font-black text-[10px] uppercase">
                    Dine-In QR
                  </span>
                </div>

                <div>
                  <h3 className="font-heading font-extrabold text-white text-base">{table.name}</h3>
                  <p className="text-[11px] text-white/60">{table.area}</p>
                </div>

                {/* QR Visual Frame */}
                <div className="p-4 rounded-2xl bg-white text-black flex flex-col items-center justify-center space-y-2 shadow-inner my-2">
                  <div className="flex items-center justify-center h-28 w-28 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-2">
                    <QrCode className="h-24 w-24 text-black" />
                  </div>
                  <p className="text-[10px] font-black uppercase text-gray-700 tracking-wider">Scan to Order to {table.name}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => handleCopy(table.id)}
                  className={`w-full h-10 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    isCopied
                      ? "bg-emerald-500 text-black font-extrabold shadow-md"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
                >
                  {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-3.5 w-3.5 text-butter" />}
                  <span>{isCopied ? "Link Copied!" : "Copy Table Link"}</span>
                </button>

                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-9 rounded-xl border border-white/15 hover:border-butter/40 text-white/70 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-butter" />
                  <span>Test Table Ordering</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
