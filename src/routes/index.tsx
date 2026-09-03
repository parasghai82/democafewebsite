import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef, type ReactNode } from "react";
import {
  MapPin,
  Clock,
  Instagram,
  Coffee,
  Calendar,
  CalendarDays,
  ArrowDown,
  Sparkles,
  Star,
  CheckCircle2,
  Send,
  Navigation,
  Heart,
  Award,
  Wifi,
  Music,
  ArrowUp,
  Mail,
  Dog,
  ExternalLink,
  Volume2,
  Check,
  ShoppingBag,
  AlertTriangle,
} from "lucide-react";
import { IpRateLimiter } from "@/lib/ipRateLimiter";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { Label } from "@/components/ui/label";
import { CafeAdminStore, type MenuItem } from "@/lib/cafeAdminStore";

import { TableBookingModal } from "@/components/TableBookingModal";
import { WhatsAppQuickWidget } from "@/components/WhatsAppQuickWidget";
import { WebsiteOfflineScreen } from "@/components/WebsiteOfflineScreen";
import { CartOrderDrawer } from "@/components/CartOrderDrawer";
import { OrderTrackingModal } from "@/components/OrderTrackingModal";
import { ActiveOrderFloatingBanner } from "@/components/ActiveOrderFloatingBanner";

import heroHouse from "../assets/hero-house.jpg";
import interiorNook from "../assets/interior-nook.jpg";
import basementNook from "../assets/basement-nook.jpg";
import gardenPatio from "../assets/garden-patio.jpg";
import drinks from "../assets/drinks.jpg";
import bakedGoods from "../assets/baked-goods.jpg";
import catPom from "../assets/cat-pom.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Toronto Cafe — Cozy Historic House Café in Baldwin Village" },
      {
        name: "description",
        content:
          "Toronto Cafe at 7 Baldwin St in Baldwin Village. Specialty espresso, ceremonial matcha, Hong Kong silk milk tea, and fresh house-baked pastries in a cozy 3-level heritage house.",
      },
      {
        property: "og:title",
        content: "Toronto Cafe — Cozy Historic House Café in Baldwin Village",
      },
      {
        property: "og:description",
        content:
          "Specialty espresso, ceremonial matcha, Hong Kong-inspired drinks and artisan house-baked pastries in a charming heritage house with leafy garden patio.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: heroHouse },
      {
        name: "twitter:title",
        content: "Toronto Cafe — Cozy Historic House Café in Baldwin Village",
      },
      {
        name: "twitter:description",
        content:
          "Specialty espresso, ceremonial matcha, Hong Kong-inspired drinks and artisan house-baked pastries in a charming heritage house with leafy garden patio.",
      },
      { name: "twitter:image", content: heroHouse },
    ],
  }),
  component: Index,
});

const ADDRESS = "7 Baldwin St, Toronto, ON M5T 1L7";
const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(ADDRESS)}`;
const INSTAGRAM_URL = "https://instagram.com/torontocafe";

function useCafeStatus() {
  const [status, setStatus] = useState<{
    isOpen: boolean;
    label: string;
    subtext: string;
  }>({
    isOpen: true,
    label: "Open Now",
    subtext: "Closes at 7:00 PM",
  });

  useEffect(() => {
    function updateStatus() {
      const settings = CafeAdminStore.getSettings();

      if (settings.statusOverride === "open") {
        setStatus({
          isOpen: true,
          label: "Open Now (Admin Override)",
          subtext: "Serving hot bakes & drinks",
        });
        return;
      }

      if (settings.statusOverride === "closed") {
        setStatus({
          isOpen: false,
          label: "Closed (Staff Notice)",
          subtext: "Reopening soon",
        });
        return;
      }

      if (settings.statusOverride === "rush") {
        setStatus({
          isOpen: true,
          label: "Peak Rush Hour",
          subtext: "Limited patio seating available",
        });
        return;
      }

      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "America/Toronto",
        weekday: "short",
        hour: "numeric",
        minute: "numeric",
        hour12: false,
      };
      const formatter = new Intl.DateTimeFormat([], options);
      const parts = formatter.formatToParts(now);
      const weekday = parts.find((p) => p.type === "weekday")?.value || "";
      const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
      const minute = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);
      const currentDec = hour + minute / 60;

      const isWeekend = weekday === "Sat" || weekday === "Sun";
      const openTime = isWeekend ? 9 : 8;
      const closeTime = isWeekend ? 20 : 19;

      if (currentDec >= openTime && currentDec < closeTime) {
        setStatus({
          isOpen: true,
          label: "Open Today",
          subtext: isWeekend ? "Open until 8:00 PM" : "Open until 7:00 PM",
        });
      } else {
        setStatus({
          isOpen: false,
          label: "Closed Now",
          subtext: isWeekend ? "Opens 9:00 AM" : "Opens 8:00 AM tomorrow",
        });
      }
    }

    updateStatus();
    window.addEventListener("cafe_store_updated", updateStatus);
    const interval = setInterval(updateStatus, 60000);
    return () => {
      window.removeEventListener("cafe_store_updated", updateStatus);
      clearInterval(interval);
    };
  }, []);

  return status;
}

/**
 * 3D Interactive Card Component with dynamic perspective tilt,
 * realistic physics, and mouse-following specular light glare.
 */
interface TiltCard3DProps {
  children: ReactNode;
  className?: string;
  glare?: boolean;
  maxTilt?: number;
  perspective?: number;
  scale?: number;
  depthShadow?: boolean;
}

function TiltCard3D({
  children,
  className = "",
  glare = true,
  maxTilt = 12,
  perspective = 1000,
  scale = 1.025,
  depthShadow = true,
}: TiltCard3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50, glareOpacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({ x: rotateX, y: rotateY, glareX, glareY, glareOpacity: 0.35 });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0, glareX: 50, glareY: 50, glareOpacity: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: `${perspective}px`,
      }}
      className={`transition-all duration-300 ${className}`}
    >
      <div
        style={{
          transform: isHovered
            ? `rotateX(${tilt.x.toFixed(2)}deg) rotateY(${tilt.y.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`
            : "rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
          transformStyle: "preserve-3d",
          transition: isHovered
            ? "transform 0.08s ease-out"
            : "transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}
        className={`relative h-full w-full rounded-2xl ${
          depthShadow ? "shadow-3d-card shadow-3d-card-hover" : ""
        }`}
      >
        {children}
        {glare && (
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300 overflow-hidden"
            style={{
              opacity: tilt.glareOpacity,
              background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, 0.75) 0%, rgba(245, 185, 85, 0.15) 40%, transparent 70%)`,
              transform: "translateZ(55px)",
            }}
          />
        )}
      </div>
    </div>
  );
}

/**
 * 3D Tactile Golden Button with rising steam wisps, liquid crema shimmer,
 * pulsing golden glow, and real mechanical click depth.
 */
function CoffeeDirectionsButton({
  className = "",
  size = "lg",
}: {
  className?: string;
  size?: "sm" | "lg";
}) {
  const isLarge = size === "lg";

  return (
    <a
      href={DIRECTIONS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`group btn-3d-gold inline-flex items-center justify-center overflow-hidden rounded-full font-heading font-bold text-warm-brown cursor-pointer ${
        isLarge
          ? "px-8 py-3.5 text-base sm:text-lg"
          : "px-5 py-2 text-xs sm:text-sm"
      } ${className}`}
    >
      {/* Liquid Crema Shimmer Sweep */}
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/70 to-transparent animate-coffee-shimmer pointer-events-none" />

      {/* Coffee Cup with Rising Steam Animation */}
      <span className="relative mr-2.5 flex items-center justify-center">
        {/* Steam Wisp 1 */}
        <span className="absolute -top-2.5 left-0.5 h-2.5 w-0.5 rounded-full bg-warm-brown/85 animate-coffee-steam-1 pointer-events-none" />
        {/* Steam Wisp 2 */}
        <span className="absolute -top-3.5 left-2 h-3 w-0.5 rounded-full bg-warm-brown/95 animate-coffee-steam-2 pointer-events-none" />

        {/* Coffee Cup Icon with gentle hover tilt */}
        <Coffee className="h-5 w-5 text-warm-brown transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" />
      </span>

      {/* Label and MapPin / Navigation indicator */}
      <span className="relative z-10 flex items-center gap-2 tracking-tight font-bold">
        <span>Get Directions</span>
        <Navigation className="h-4 w-4 text-warm-brown transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5" />
      </span>
    </a>
  );
}

function Index() {
  const [settings, setSettings] = useState(() => CafeAdminStore.getSettings());

  useEffect(() => {
    const handleUpdate = () => {
      setSettings(CafeAdminStore.getSettings());
    };
    window.addEventListener("cafe_store_updated", handleUpdate);
    return () => window.removeEventListener("cafe_store_updated", handleUpdate);
  }, []);

  // When admin turns website OFF, show luxury maintenance screen
  if (!settings.isWebsiteOnline) {
    return <WebsiteOfflineScreen />;
  }

  return (
    <div className="min-h-screen bg-background font-body text-foreground selection:bg-butter selection:text-warm-brown">
      <Header />
      <main>
        <Hero />
        <Atmosphere />
        <InteractiveMenu />
        <Reviews />
        <VisitUs />
        <Events />
      </main>
      <Footer />
      
      {/* Floating Active Order Live Tracker */}
      <ActiveOrderFloatingBanner />

      {/* Floating WhatsApp Quick Chat Bar */}
      <WhatsAppQuickWidget />
    </div>
  );
}

function Header() {
  const status = useCafeStatus();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/85 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-2xl gold-gradient-bg shadow-[0_2px_12px_rgba(245,185,85,0.4)] transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
            <Coffee className="h-5 w-5 text-warm-brown" />
          </span>
          <span className="font-heading text-xl font-bold tracking-tight text-foreground group-hover:text-butter transition-colors">
            Toronto Cafe
          </span>
        </Link>

        {/* Live Open / Closed Pill */}
        <div className="hidden lg:flex items-center gap-2 rounded-full border border-border/80 bg-card/90 px-3.5 py-1 text-xs shadow-inner">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              status.isOpen
                ? "bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.9)]"
                : "bg-amber-400"
            }`}
          />
          <span className="font-bold text-foreground">{status.label}</span>
          <span className="text-muted-foreground/60">·</span>
          <span className="text-muted-foreground">{status.subtext}</span>
        </div>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <a
            href="#house"
            className="text-muted-foreground transition-colors hover:text-butter"
          >
            The House
          </a>
          <a href="#menu" className="text-muted-foreground transition-colors hover:text-butter">
            Menu
          </a>
          <a
            href="#reviews"
            className="text-muted-foreground transition-colors hover:text-butter"
          >
            Reviews
          </a>
          <a
            href="#visit"
            className="text-muted-foreground transition-colors hover:text-butter"
          >
            Visit
          </a>
          <a
            href="#events"
            className="text-muted-foreground transition-colors hover:text-butter"
          >
            Events
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <OrderTrackingModal />
          <CartOrderDrawer />
          <TableBookingModal />
          <CoffeeDirectionsButton size="sm" className="hidden sm:inline-flex" />
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const status = useCafeStatus();

  return (
    <section className="relative overflow-hidden">
      {/* Background Image with Warm Soft Vignette */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src={heroHouse}
          alt="Toronto Cafe exterior at Baldwin Village with charming patio seating, string lights, and warm ambient glow"
          width={1920}
          height={1088}
          className="h-full w-full object-cover scale-105 transition-transform duration-1000 opacity-25"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
      </div>

      {/* Decorative ambient glowing 3D light orbs */}
      <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-butter/20 blur-[130px] pointer-events-none animate-ambient-glow" />
      <div className="absolute top-1/3 right-10 h-[450px] w-[450px] rounded-full bg-amber/15 blur-[140px] pointer-events-none" />

      <div className="relative mx-auto flex min-h-[86vh] max-w-6xl items-center px-4 py-16 sm:px-6 lg:py-24">
        <div className="grid w-full items-center gap-12 lg:grid-cols-12 lg:gap-8">
          
          {/* Left Column: 3D Typography & Actions */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left">
            <div className="inline-flex items-center gap-2 mb-4 w-fit rounded-full border border-butter/30 bg-card/90 px-4 py-1.5 backdrop-blur-md shadow-sm">
              <span className="inline-block h-2 w-2 rounded-full bg-butter animate-pulse" />
              <p className="font-heading text-xs sm:text-sm font-bold tracking-widest text-butter uppercase">
                Baldwin Village · Established 1998
              </p>
            </div>

            <h1 className="font-heading text-4xl sm:text-6xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-foreground">
              A century-old house crafting{" "}
              <span className="gold-gradient-text drop-shadow-[0_2px_12px_rgba(201,118,22,0.25)]">
                exceptional
              </span>{" "}
              coffee & quiet moments.
            </h1>
            <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-muted-foreground font-normal">
              Specialty single-origin espresso, ceremonial Uji matcha, Hong Kong milk tea, and fresh
              house-baked pastries served across three cozy heritage levels, secret book nooks, and a leafy
              garden patio.
            </p>

            {/* 3D Feature Pills */}
            <div className="mt-8 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-foreground font-semibold">
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card/90 px-3.5 py-2 shadow-sm backdrop-blur-md transition-all hover:scale-105 hover:border-butter/50">
                <Sparkles className="h-4 w-4 text-butter" /> 3 Historic Levels
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card/90 px-3.5 py-2 shadow-sm backdrop-blur-md transition-all hover:scale-105 hover:border-matcha/50">
                <Sparkles className="h-4 w-4 text-matcha" /> Garden Terrace Patio
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card/90 px-3.5 py-2 shadow-sm backdrop-blur-md transition-all hover:scale-105 hover:border-amber/50">
                <Sparkles className="h-4 w-4 text-amber" /> Fresh Baked at 7:30 AM
              </span>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <TableBookingModal>
                <button className="btn-3d-gold rounded-full px-7 py-3.5 text-base font-bold text-warm-brown flex items-center gap-2 cursor-pointer shadow-lg hover:scale-105 transition-transform">
                  <Calendar className="h-5 w-5" />
                  <span>Reserve Table</span>
                </button>
              </TableBookingModal>

              <CoffeeDirectionsButton size="lg" />

              <Button
                asChild
                size="lg"
                variant="outline"
                className="glass-panel-3d rounded-full px-6 py-3.5 text-base font-bold text-foreground hover:text-butter hover:border-butter/50 transition-all duration-300 shadow-sm"
              >
                <a href="#menu">
                  <Sparkles className="mr-2 h-4 w-4 text-butter" />
                  Digital Menu
                </a>
              </Button>
            </div>
          </div>

          {/* Right Column: Interactive 3D Holographic Showcase Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              
              {/* Pulsing 3D Ambient Ground Shadow */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-4/5 h-12 rounded-[50%] bg-black/15 blur-xl animate-shadow-pulse pointer-events-none" />

              <TiltCard3D maxTilt={15} scale={1.04} className="w-full">
                <div className="relative overflow-hidden rounded-3xl glass-panel-3d p-3.5 preserve-3d shadow-xl">
                  
                  {/* Photo with 3D Depth Frame */}
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                    <img
                      src={heroHouse}
                      alt="Toronto Cafe 3-level heritage house exterior at Baldwin Village"
                      width={800}
                      height={600}
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-50" />

                    {/* 3D Floating Live Badge */}
                    <div
                      style={{ transform: "translateZ(45px)" }}
                      className="absolute top-3.5 left-3.5 inline-flex items-center gap-2 rounded-full border border-border bg-card/95 px-3 py-1 text-xs font-bold shadow-md backdrop-blur-md"
                    >
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                      <span className="text-foreground">{status.label}</span>
                    </div>

                    {/* 3D Floating Steam Cup Icon */}
                    <div
                      style={{ transform: "translateZ(55px)" }}
                      className="absolute top-3.5 right-3.5 flex h-10 w-10 items-center justify-center rounded-2xl gold-gradient-bg text-warm-brown shadow-[0_4px_16px_rgba(201,118,22,0.35)] animate-float-3d-fast"
                    >
                      <Coffee className="h-5 w-5" />
                    </div>
                  </div>

                  {/* 3D Floating Card Info Overlay */}
                  <div className="p-4 preserve-3d" style={{ transform: "translateZ(30px)" }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-heading text-lg font-bold text-foreground">
                          Historic 3-Level House
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          7 Baldwin St, Baldwin Village
                        </p>
                      </div>

                      {/* 3D Floating Star Rating Badge */}
                      <div
                        style={{ transform: "translateZ(50px)" }}
                        className="flex items-center gap-1.5 rounded-xl border border-butter/30 bg-butter/10 px-3 py-1.5 backdrop-blur-md shadow-sm"
                      >
                        <Star className="h-4 w-4 fill-butter text-butter" />
                        <span className="text-xs font-bold text-butter">4.9</span>
                        <span className="text-[10px] text-muted-foreground">(1.2k)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TiltCard3D>
            </div>
          </div>

        </div>
      </div>

      <a
        href="#house"
        className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 text-muted-foreground transition-colors hover:text-butter md:block"
        aria-label="Scroll to the house section"
      >
        <ArrowDown className="h-6 w-6 animate-bounce text-butter" />
      </a>
    </section>
  );
}

function Atmosphere() {
  const spaces = [
    {
      title: "Main floor parlor",
      badge: "Sunlit & Social",
      badgeClass: "bg-card/95 text-amber border-amber/40 shadow-md",
      description:
        "Warm vintage timber floors, large bay windows, natural afternoon light, and cozy seating ideal for laptop work or catching up with friends.",
      image: interiorNook,
      alt: "Cozy main floor seating with students working and warm afternoon light",
    },
    {
      title: "Basement reading nook",
      badge: "Intimate & Quiet",
      badgeClass: "bg-card/95 text-terracotta border-terracotta/40 shadow-md",
      description:
        "Dim, atmospheric exposed brick nooks, antique rugs, soft incandescent lamplight, and tucked-away tables for book lovers and quiet conversations.",
      image: basementNook,
      alt: "Intimate basement café nook with exposed brick and soft lamplight",
    },
    {
      title: "Garden terrace patio",
      badge: "Leafy Sanctuary",
      badgeClass: "bg-card/95 text-matcha border-matcha/40 shadow-md",
      description:
        "A secluded lush garden oasis out back. Surrounded by greenery, string lights, and bistro tables for sunny mornings and breezy summer evenings.",
      image: gardenPatio,
      alt: "Peaceful garden patio behind the café with string lights and bistro tables",
    },
  ];

  return (
    <section id="house" className="relative bg-cream py-20 sm:py-28 border-y border-border/50 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-butter/5 blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="inline-block h-2 w-2 rounded-full bg-butter" />
            <p className="font-heading text-sm font-bold tracking-widest text-butter uppercase">
              The Experience
            </p>
          </div>
          <h2 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Three floors, three distinct moods
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Our converted 19th-century Victorian house was designed to let you choose your own
            corner depending on your mood and pace.
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {spaces.map((space) => (
            <TiltCard3D key={space.title} maxTilt={12} scale={1.03} className="h-full">
              <article className="group relative h-full overflow-hidden rounded-3xl glass-panel-3d preserve-3d">
                <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl">
                  <img
                    src={space.image}
                    alt={space.alt}
                    width={1200}
                    height={800}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-transparent to-transparent opacity-70" />
                  
                  {/* 3D Floating Badge popping out */}
                  <span
                    style={{ transform: "translateZ(45px)" }}
                    className={`absolute top-3.5 left-3.5 rounded-full px-3.5 py-1 text-xs font-bold backdrop-blur-md border shadow-xl ${space.badgeClass}`}
                  >
                    {space.badge}
                  </span>
                </div>
                
                <div className="p-6 preserve-3d" style={{ transform: "translateZ(25px)" }}>
                  <h3 className="font-heading text-xl font-bold text-foreground group-hover:text-butter transition-colors">
                    {space.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                    {space.description}
                  </p>
                </div>
              </article>
            </TiltCard3D>
          ))}
        </div>
      </div>
    </section>
  );
}

interface MenuItem {
  name: string;
  price: string;
  description: string;
  tags?: string[];
  specialty?: boolean;
}

const MENU_DATA: Record<string, { label: string; items: MenuItem[] }> = {
  coffee: {
    label: "Espresso & Coffee",
    items: [
      {
        name: "Signature Baldwin Cortado",
        price: "$5.25",
        description:
          "Equal parts rich double espresso & textured oat milk, crowned with raw cinnamon sugar.",
        tags: ["House Specialty", "Dairy-Free Option"],
        specialty: true,
      },
      {
        name: "Spanish Honey Latte",
        price: "$6.50",
        description:
          "Double shot espresso, sweet condensed milk, Ontario raw wildflower honey, steamed whole milk.",
        tags: ["Best Seller"],
        specialty: true,
      },
      {
        name: "Single-Origin Pour Over",
        price: "$5.75",
        description:
          "Rotating micro-lot beans from top Canadian artisan roasters with tasting notes card.",
        tags: ["Single Origin"],
      },
      {
        name: "Salted Caramel Cold Foam Brew",
        price: "$6.75",
        description:
          "18-hour slow-steeped dark roast topped with thick sea-salt caramel cream cloud.",
        tags: ["House Specialty"],
        specialty: true,
      },
      {
        name: "Hong Kong Silk Milk Tea",
        price: "$5.50",
        description:
          "Traditional Ceylon black tea blend brewed in silk sack filter, rich evaporated milk.",
        tags: ["Heritage Recipe"],
        specialty: true,
      },
      {
        name: "Madagascar Vanilla Bean Flat White",
        price: "$6.00",
        description: "Double ristretto, house-made real vanilla bean reduction, velvety microfoam.",
        tags: ["Organic Vanilla"],
      },
    ],
  },
  matcha: {
    label: "Matcha & Tea Bar",
    items: [
      {
        name: "Ceremonial Uji Matcha Einspänner",
        price: "$7.25",
        description:
          "First-harvest ceremonial matcha whisked to order, layered over milk and topped with rich sweet whipped cream.",
        tags: ["House Specialty"],
        specialty: true,
      },
      {
        name: "Strawberry Matcha Cloud",
        price: "$7.50",
        description:
          "House strawberry compote, organic oat milk, and cold-frothed ceremonial green tea.",
        tags: ["Best Seller", "Vegan"],
        specialty: true,
      },
      {
        name: "Roasted Hojicha Latte",
        price: "$6.25",
        description: "Deeply roasted Kyoto green tea with smoky caramel and hazelnut aroma.",
        tags: ["Low Caffeine", "Vegan"],
      },
      {
        name: "Sparkling Yuzu Blossom Tea",
        price: "$6.50",
        description: "Japanese yuzu fruit puree, sparkling jasmine green tea, fresh garden mint.",
        tags: ["Refreshing", "Vegan"],
      },
      {
        name: "Lavender Bergamot Fog",
        price: "$5.75",
        description:
          "Organic Earl Grey loose leaf tea, organic lavender blossom syrup, steamed vanilla oat milk.",
        tags: ["Cozy"],
      },
    ],
  },
  bakery: {
    label: "Fresh Bakes",
    items: [
      {
        name: "Cardamom Kouign-Amann",
        price: "$5.50",
        description:
          "Laminated caramelized pastry with flaky layers, crushed green cardamom & flaky sea salt.",
        tags: ["House Specialty"],
        specialty: true,
      },
      {
        name: "Almond Frangipane Croissant",
        price: "$6.00",
        description:
          "Twice-baked pure butter croissant stuffed with rich almond cream & toasted sliced almonds.",
        tags: ["Fresh Baked Daily"],
      },
      {
        name: "Miso Dark Chocolate Brownie",
        price: "$4.75",
        description:
          "Ultra-fudgy 70% dark chocolate brownie swirled with organic sweet white miso.",
        tags: ["Gluten-Free"],
      },
      {
        name: "Sharp Cheddar & Scallion Scone",
        price: "$5.00",
        description:
          "Golden buttermilk scone baked with 2-year aged Ontario cheddar & charred scallions.",
        tags: ["Savory Bake"],
      },
      {
        name: "Matcha White Chocolate Cookie",
        price: "$4.25",
        description:
          "Thick soft-baked cookie with ceremonial matcha dough and chunks of Belgian white chocolate.",
        tags: ["Sweet Treat"],
      },
    ],
  },
  kitchen: {
    label: "Savory Kitchen",
    items: [
      {
        name: "Prosciutto & Black Fig Brioche",
        price: "$12.50",
        description:
          "San Daniele prosciutto, mission fig jam, French double-cream brie, peppery baby arugula.",
        tags: ["House Specialty"],
        specialty: true,
      },
      {
        name: "Smoked Salmon & Herb Tartine",
        price: "$13.50",
        description:
          "Toasted sourdough, whipped dill cream cheese, caper berries, pickled shallots, lemon zest.",
        tags: ["Signature"],
      },
      {
        name: "Truffled Free-Range Egg Salad",
        price: "$10.50",
        description:
          "Creamy free-range egg salad, black truffle emulsion, crisp microgreens on toasted milk bread.",
        tags: ["Vegetarian"],
      },
      {
        name: "Avocado & Citrus Sumac Toast",
        price: "$9.75",
        description:
          "Mashed Hass avocado, sumac lemon dressing, toasted hemp seeds, radishes on seeded sourdough.",
        tags: ["Vegan"],
      },
    ],
  },
};

function InteractiveMenu() {
  return (
    <section id="menu" className="relative bg-background py-20 sm:py-28 overflow-hidden">
      <div className="absolute bottom-10 left-10 h-96 w-96 rounded-full bg-butter/5 blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-butter" />
              <p className="font-heading text-sm font-bold tracking-widest text-butter uppercase">
                Artisan Offerings
              </p>
            </div>
            <h2 className="mt-2 font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Made with intention, served slowly
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            All syrups are made in-house. Pastries baked fresh every morning by 7:30 AM. Oat,
            almond, and dairy milk options available.
          </p>
        </div>

        {/* 3D Visual Teaser Banners */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <TiltCard3D maxTilt={8} scale={1.02}>
            <div className="group relative overflow-hidden rounded-3xl glass-panel-3d p-4 flex items-center gap-4 preserve-3d">
              <img
                src={drinks}
                alt="Specialty drinks at Toronto Cafe"
                className="h-20 w-20 rounded-2xl object-cover transition-transform duration-500 group-hover:scale-108 shadow-md"
              />
              <div className="preserve-3d" style={{ transform: "translateZ(20px)" }}>
                <span className="text-[11px] font-bold uppercase tracking-wider text-butter">Signature Drinks</span>
                <h3 className="font-heading text-base font-bold text-foreground">
                  Specialty Craft Flight
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Espresso, ceremonial Uji matcha & Hong Kong silk milk tea crafted by seasoned baristas.
                </p>
              </div>
            </div>
          </TiltCard3D>

          <TiltCard3D maxTilt={8} scale={1.02}>
            <div className="group relative overflow-hidden rounded-3xl glass-panel-3d p-4 flex items-center gap-4 preserve-3d">
              <img
                src={bakedGoods}
                alt="House bakes at Toronto Cafe"
                className="h-20 w-20 rounded-2xl object-cover transition-transform duration-500 group-hover:scale-108 shadow-md"
              />
              <div className="preserve-3d" style={{ transform: "translateZ(20px)" }}>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber">Daily Hearth</span>
                <h3 className="font-heading text-base font-bold text-foreground">
                  Morning Oven Fresh
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Flaky butter croissants, cardamom Kouign-Amann, and savory brioche straight from the oven.
                </p>
              </div>
            </div>
          </TiltCard3D>
        </div>

        {/* 3D Interactive Menu Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="coffee" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto p-2 glass-panel-3d rounded-2xl gap-2 shadow-lg border border-border/80">
              {Object.entries(MENU_DATA).map(([key, data]) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="py-3.5 px-4 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-card/70 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FBD982] data-[state=active]:via-[#F5AB38] data-[state=active]:to-[#DF7F14] data-[state=active]:text-[#1A120C] data-[state=active]:font-extrabold data-[state=active]:shadow-[0_4px_18px_rgba(201,118,22,0.3),0_1px_2px_rgba(0,0,0,0.05)] data-[state=active]:border data-[state=active]:border-white/80"
                >
                  {data.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(MENU_DATA).map(([key, data]) => (
              <TabsContent key={key} value={key} className="mt-8">
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {data.items.map((item) => (
                    <TiltCard3D key={item.name} maxTilt={10} scale={1.03} className="h-full">
                      <div className="group relative flex h-full flex-col justify-between rounded-2xl glass-panel-3d p-5.5 transition-all duration-300 preserve-3d shadow-sm">
                        <div style={{ transform: "translateZ(25px)" }}>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-heading text-base font-bold text-foreground group-hover:text-butter transition-colors">
                              {item.name}
                            </h4>
                            <span
                              style={{ transform: "translateZ(35px)" }}
                              className="shrink-0 font-heading text-sm font-bold text-butter px-2.5 py-0.5 rounded-lg bg-butter/10 border border-butter/30 shadow-xs"
                            >
                              {item.price}
                            </span>
                          </div>
                          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                            {item.description}
                          </p>
                        </div>

                        <div className="space-y-3 pt-3 border-t border-border/60">
                          {item.tags && item.tags.length > 0 && (
                            <div
                              style={{ transform: "translateZ(30px)" }}
                              className="flex flex-wrap gap-1.5"
                            >
                              {item.tags.map((tag) => {
                                let tagClass = "bg-muted text-muted-foreground border-border/60";
                                if (tag === "House Specialty" || tag === "Best Seller") {
                                  tagClass = "bg-butter/10 text-butter border-butter/30 font-bold";
                                } else if (
                                  tag === "Vegan" ||
                                  tag === "Low Caffeine" ||
                                  tag === "Refreshing" ||
                                  tag === "Organic Vanilla"
                                ) {
                                  tagClass = "bg-matcha/10 text-matcha border-matcha/30 font-bold";
                                } else {
                                  tagClass =
                                    "bg-terracotta/10 text-terracotta border-terracotta/30 font-bold";
                                }

                                return (
                                  <span
                                    key={tag}
                                    className={`rounded-md px-2 py-0.5 text-[10px] border shadow-xs ${tagClass}`}
                                  >
                                    {tag}
                                  </span>
                                );
                              })}
                            </div>
                          )}

                          {/* 1-Click Add to Bag button */}
                          <button
                            type="button"
                            onClick={() => {
                              window.dispatchEvent(
                                new CustomEvent("toronto_cafe_add_to_cart", {
                                  detail: {
                                    id: "m_" + item.name.toLowerCase().replace(/[^a-z0-9]/g, "_"),
                                    name: item.name,
                                    category: key as any,
                                    price: parseFloat(item.price.replace("$", "")) || 5.5,
                                    description: item.description,
                                    tags: item.tags || [],
                                    inStock: true,
                                  },
                                })
                              );
                            }}
                            className="w-full py-2.5 rounded-xl border border-butter/40 bg-butter/10 hover:bg-butter text-butter hover:text-warm-brown font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs hover:scale-102"
                          >
                            <ShoppingBag className="h-3.5 w-3.5" />
                            <span>Add to Order Bag</span>
                          </button>
                        </div>
                      </div>
                    </TiltCard3D>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </section>
  );
}

function Reviews() {
  const reviews = [
    {
      quote:
        "A true sanctuary in Baldwin Village. The three distinct house levels and lush rear garden patio make it easily one of Toronto's most charming neighborhood cafes.",
      author: "Toronto Life",
      role: "City & Dining Guide",
      rating: 5,
    },
    {
      quote:
        "The Strawberry Matcha Cloud and Cardamom Kouign-Amann are out of this world. My absolute favorite corner to read in the basement nook.",
      author: "Sarah Lin",
      role: "Kensington Resident",
      rating: 5,
    },
    {
      quote:
        "Super fast WiFi, incredible single-origin espresso, and warm staff that actually know your order. The garden patio under the fairy lights is pure magic.",
      author: "Marcus Vance",
      role: "U of T Graduate",
      rating: 5,
    },
  ];

  return (
    <section id="reviews" className="relative bg-cream py-20 sm:py-28 border-y border-border/50 overflow-hidden">
      <div className="absolute top-1/2 left-1/3 h-80 w-80 rounded-full bg-butter/5 blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center justify-center gap-1.5 text-butter mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="h-4.5 w-4.5 fill-butter text-butter drop-shadow-[0_0_10px_rgba(245,185,85,0.7)]"
              />
            ))}
          </div>
          <h2 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Loved by the neighborhood
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            From morning espresso runs to late afternoon study sessions and weekend garden brunches.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {reviews.map((rev) => (
            <TiltCard3D key={rev.author} maxTilt={10} scale={1.03} className="h-full">
              <div className="flex h-full flex-col justify-between rounded-3xl glass-panel-3d p-6.5 transition-all duration-300 preserve-3d">
                <div style={{ transform: "translateZ(25px)" }}>
                  <div className="flex gap-1 text-butter">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-butter text-butter" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-foreground/90 italic font-light">
                    "{rev.quote}"
                  </p>
                </div>
                <div
                  style={{ transform: "translateZ(35px)" }}
                  className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between"
                >
                  <div>
                    <p className="font-heading text-sm font-bold text-foreground">{rev.author}</p>
                    <p className="text-xs text-muted-foreground">{rev.role}</p>
                  </div>
                  <span className="text-butter/30 text-3xl font-serif select-none">❝</span>
                </div>
              </div>
            </TiltCard3D>
          ))}
        </div>
      </div>
    </section>
  );
}

function VisitUs() {
  const status = useCafeStatus();

  return (
    <section id="visit" className="relative bg-sand py-20 sm:py-28 overflow-hidden">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="font-heading text-sm font-bold tracking-widest text-butter uppercase">
              Location & Hours
            </p>
            <h2 className="mt-3 font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Come visit the house
            </h2>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              <strong className="font-bold text-foreground">Toronto Cafe</strong> lives at 7 Baldwin
              Street in Baldwin Village. We're a 3-minute stroll from Kensington Market, the AGO,
              and the University of Toronto St. George campus.
            </p>

            {/* Live status badge inside visit section */}
            <div className="mt-6 inline-flex items-center gap-2.5 rounded-2xl glass-panel-3d px-4 py-2.5 text-sm shadow-md">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  status.isOpen
                    ? "bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.9)]"
                    : "bg-amber-400"
                }`}
              />
              <span className="font-bold text-foreground">{status.label}:</span>
              <span className="text-muted-foreground">{status.subtext}</span>
            </div>

            <div className="mt-8 space-y-5">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl gold-gradient-bg text-warm-brown shadow-[0_4px_16px_rgba(245,185,85,0.4)]">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-foreground">Address</h3>
                  <p className="text-sm text-muted-foreground">{ADDRESS}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl gold-gradient-bg text-warm-brown shadow-[0_4px_16px_rgba(245,185,85,0.4)]">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-foreground">Weekly Hours</h3>
                  <p className="text-sm text-muted-foreground">
                    Monday – Friday: 8:00 AM – 7:00 PM
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Saturday – Sunday: 9:00 AM – 8:00 PM
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <CoffeeDirectionsButton size="lg" />
              <Button
                asChild
                size="lg"
                variant="outline"
                className="glass-panel-3d rounded-full px-6 py-3.5 text-base font-bold text-foreground hover:text-butter hover:border-butter/50 transition-all shadow-md"
              >
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                  <Instagram className="mr-2 h-5 w-5 text-butter" />
                  Follow @torontocafe
                </a>
              </Button>
            </div>
          </div>

          <div className="relative">
            <TiltCard3D maxTilt={10} scale={1.02}>
              <div className="overflow-hidden rounded-3xl glass-panel-3d p-3 shadow-2xl preserve-3d">
                <div className="relative overflow-hidden rounded-2xl">
                  <iframe
                    title="Toronto Cafe location map"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2886.508366457036!2d-79.39338592346116!3d43.65543285240153!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882b34c95bdb86c5%3A0x9504bad7651b0b1e!2s7%20Baldwin%20St%2C%20Toronto%2C%20ON%20M5T%201L7!5e0!3m2!1sen!2sca!4v1704067200000!5m2!1sen!2sca"
                    width="100%"
                    height="420"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-xl"
                  />
                  {/* Floating 3D Map Pin Pill */}
                  <div
                    style={{ transform: "translateZ(45px)" }}
                    className="absolute top-4 left-4 flex items-center gap-2 rounded-xl border border-butter/40 bg-background/90 px-3.5 py-1.5 text-xs font-bold text-foreground shadow-xl backdrop-blur-md"
                  >
                    <MapPin className="h-4 w-4 text-butter" />
                    <span>Baldwin Village, Toronto</span>
                  </div>
                </div>
              </div>
            </TiltCard3D>
          </div>
        </div>
      </div>
    </section>
  );
}

function Events() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [banError, setBanError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    eventType: "private_event",
    guests: "15-30",
    date: "",
    notes: "",
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    // 1-Hour Ban Protection
    const rateCheck = await IpRateLimiter.recordSubmission(
      formData.eventType === "catering" ? "Catering Request" : "Private Event Buyout"
    );
    if (!rateCheck.allowed) {
      setBanError(rateCheck.error || "Too many submissions. Your IP is blocked for 1 hour.");
      return;
    }

    // 1. Record in Admin Panel
    CafeAdminStore.addFormSubmission({
      formType: formData.eventType === "catering" ? "Catering Request" : "Private Event Buyout",
      name: formData.name,
      email: formData.email || "Not specified",
      phone: formData.phone || "Not specified",
      date: formData.date || undefined,
      guests: formData.guests ? parseInt(formData.guests.split("-")[0], 10) || 15 : undefined,
      notes: formData.notes || "No additional notes",
    });

    CafeAdminStore.logWhatsAppClick({
      buttonLocation: "Events Inquiry Form",
      intent: "Private Event Buyout",
    });

    // 2. Dispatch complete details to WhatsApp
    const msg = encodeURIComponent(
      `Hello Toronto Cafe! ☕ Here is an Event / Catering Inquiry from the website:\n\n` +
      `• Name: ${formData.name}\n` +
      `• Phone: ${formData.phone || "Not provided"}\n` +
      `• Email: ${formData.email || "Not provided"}\n` +
      `• Service: ${formData.eventType}\n` +
      `• Guests: ${formData.guests}\n` +
      `• Date: ${formData.date || "Flexible"}\n` +
      `• Notes: ${formData.notes || "None"}`
    );
    window.open(`https://wa.me/14169771998?text=${msg}`, "_blank");

    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({
      name: "",
      phone: "",
      email: "",
      eventType: "private_event",
      guests: "15-30",
      date: "",
      notes: "",
    });
    setOpen(false);
  };

  return (
    <section id="events" className="relative bg-background py-20 sm:py-28 border-t border-border/50 overflow-hidden">
      <div className="absolute top-1/2 right-1/4 h-80 w-80 rounded-full bg-butter/5 blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl gold-gradient-bg text-warm-brown shadow-[0_6px_20px_rgba(245,185,85,0.45)] animate-float-3d">
            <CalendarDays className="h-7 w-7" />
          </div>
        </div>
        <h2 className="mt-5 font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Private events, celebrations & catering
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Rent out the garden patio, book our intimate basement library room, or order morning
          pastry & coffee boxes for your studio or office.
        </p>

        <div className="mt-8 flex justify-center">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button
                className="btn-3d-gold rounded-full px-8 py-4 text-base sm:text-lg font-bold text-warm-brown flex items-center justify-center cursor-pointer shadow-xl"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Inquire About Private Events & Catering
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg glass-panel-3d border-border text-foreground shadow-2xl rounded-3xl">
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl font-bold text-foreground">
                  Host an Event at Toronto Cafe
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Tell us about your gathering or catering request. Your details will be sent to our staff admin & WhatsApp.
                </DialogDescription>
              </DialogHeader>

              {submitted ? (
                <div className="py-8 text-center space-y-4">
                  <div className="flex justify-center">
                    <CheckCircle2 className="h-12 w-12 text-butter animate-bounce" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-foreground">
                    Inquiry Received & Sent!
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Thank you, <strong className="text-foreground">{formData.name || "friend"}</strong>. Your request has been recorded in our Admin panel and sent to our WhatsApp team!
                  </p>
                  <button
                    onClick={handleReset}
                    className="btn-3d-gold rounded-full px-6 py-2.5 font-bold text-warm-brown shadow-md cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5 text-left">
                      <Label htmlFor="name" className="text-xs font-semibold">
                        Your Name *
                      </Label>
                      <Input
                        id="name"
                        required
                        placeholder="e.g. Alex Chen"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-background/80 border-border focus-visible:ring-butter rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5 text-left">
                      <Label htmlFor="phone" className="text-xs font-semibold">
                        Phone Number (WhatsApp) *
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        placeholder="(416) 977-1998"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="bg-background/80 border-border focus-visible:ring-butter rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5 text-left">
                      <Label htmlFor="email" className="text-xs font-semibold">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="alex@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-background/80 border-border focus-visible:ring-butter rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5 text-left">
                      <Label htmlFor="eventType" className="text-xs font-semibold">
                        Occasion / Service
                      </Label>
                      <select
                        id="eventType"
                        className="w-full rounded-xl border border-border bg-background/80 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-butter"
                        value={formData.eventType}
                        onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                      >
                        <option value="private_event">Full House / Patio Buyout</option>
                        <option value="birthday">Birthday / Celebration</option>
                        <option value="catering">Office Catering & Pastry Boxes</option>
                        <option value="workshop">Study / Book Club / Workshop</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5 text-left">
                      <Label htmlFor="guests" className="text-xs font-semibold">
                        Estimated Guests
                      </Label>
                      <select
                        id="guests"
                        className="w-full rounded-xl border border-border bg-background/80 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-butter"
                        value={formData.guests}
                        onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                      >
                        <option value="1-10">Small group (1–10)</option>
                        <option value="15-30">Medium party (15–30)</option>
                        <option value="30-60">Large gathering (30–60)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5 text-left">
                      <Label htmlFor="date" className="text-xs font-semibold">
                        Preferred Date
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="bg-background/80 border-border focus-visible:ring-butter rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <Label htmlFor="notes" className="text-xs font-semibold">
                      Additional Details / Dietary Requests
                    </Label>
                    <Textarea
                      id="notes"
                      rows={3}
                      placeholder="Tell us about special drink requests, setup preferences, or timings..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="bg-background/80 border-border focus-visible:ring-butter rounded-xl resize-none"
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

                  <div className="pt-2 flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-full">
                      Cancel
                    </Button>
                    <button
                      type="submit"
                      disabled={Boolean(banError)}
                      className="btn-3d-gold rounded-full px-6 py-2.5 font-bold text-warm-brown flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Send className="h-4 w-4" />
                      <span>Submit & Send to WhatsApp</span>
                    </button>
                  </div>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const status = useCafeStatus();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [newsletterError, setNewsletterError] = useState<string | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  const [localTime, setLocalTime] = useState("");

  useEffect(() => {
    IpRateLimiter.checkBanStatus().then((res) => {
      if (res.isBanned) {
        setNewsletterError(`Blocked for 1 hour (${res.remainingMinutes}m remaining).`);
      }
    });
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;

    const rateCheck = await IpRateLimiter.recordSubmission("VIP Coffee Club");
    if (!rateCheck.allowed) {
      setNewsletterError(rateCheck.error || "Too many submissions. IP blocked for 1 hour.");
      return;
    }

    CafeAdminStore.addSubscriber(newsletterEmail);
    setNewsletterSubmitted(true);
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "America/Toronto",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      };
      setLocalTime(new Intl.DateTimeFormat([], options).format(now));
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);


  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative border-t border-border/80 bg-gradient-to-b from-cream via-sand/60 to-cream pt-16 pb-12 overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 right-10 h-96 w-96 rounded-full bg-butter/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 h-96 w-96 rounded-full bg-amber/10 blur-[140px] pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        
        {/* TOP INTERACTIVE VIP COFFEE CLUB BANNER */}
        <div className="relative overflow-hidden rounded-3xl glass-panel-3d p-6 sm:p-10 mb-16 shadow-xl border border-white/80">
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-butter/15 blur-2xl pointer-events-none" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 text-left space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-butter/40 bg-butter/10 px-3 py-1 text-xs font-bold text-butter">
                <Sparkles className="h-3.5 w-3.5 text-butter" />
                <span>Baldwin Village Coffee Club</span>
              </div>
              <h3 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
                Get a fresh house pastry on your next visit.
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                Join our neighborhood circle for secret seasonal drink recipes, quiet reading nook hours, and invitations to weekend garden tastings.
              </p>
            </div>

            <div className="lg:col-span-5">
              {newsletterSubmitted ? (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-butter/15 border border-butter/30 text-foreground">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-butter text-warm-brown font-bold shadow-md">
                    <Check className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-heading text-sm font-bold text-foreground">You're on the list!</p>
                    <p className="text-xs text-muted-foreground">
                      Show this confirmation to our barista for your welcome pastry.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {newsletterError && (
                    <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 text-xs font-semibold flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                      <span>{newsletterError}</span>
                    </div>
                  )}
                  <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        required
                        disabled={Boolean(newsletterError)}
                        placeholder="Enter your email..."
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        className="pl-10 h-12 bg-background/90 border-border/80 rounded-2xl focus-visible:ring-butter shadow-inner text-sm disabled:opacity-40"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={Boolean(newsletterError)}
                      className="btn-3d-gold h-12 px-6 rounded-2xl font-bold text-sm text-warm-brown shrink-0 cursor-pointer shadow-md flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span>Join Club</span>
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MAIN FOUR-COLUMN FOOTER GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-14 border-b border-border/70">
          
          {/* Column 1: Brand & Mascot (4 cols) */}
          <div className="lg:col-span-4 space-y-5 text-left">
            <div className="flex items-center gap-3.5">
              <div className="relative rounded-2xl bg-card border border-border/80 p-2 shadow-md hover:scale-105 transition-transform">
                <img
                  src={catPom}
                  alt="Toronto Cafe mascots"
                  width={64}
                  height={64}
                  loading="lazy"
                  className="h-12 w-12 object-contain"
                />
              </div>
              <div>
                <h4 className="font-heading text-xl font-bold text-foreground tracking-tight">Toronto Cafe</h4>
                <p className="text-xs text-butter font-semibold">Baldwin Village · Est. 1998</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              A 3-level heritage Victorian house serving specialty single-origin espresso, ceremonial Uji matcha, and fresh morning bakery in downtown Toronto.
            </p>

            {/* Live Cafe Status Pill */}
            <div className="inline-flex items-center gap-2 rounded-2xl glass-panel-3d px-3.5 py-2 text-xs shadow-xs border border-border/70">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  status.isOpen
                    ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                    : "bg-amber-400"
                }`}
              />
              <span className="font-bold text-foreground">{status.label}</span>
              <span className="text-muted-foreground/60">·</span>
              <span className="text-muted-foreground">Toronto Time: {localTime || "8:00 AM"}</span>
            </div>

            {/* Social Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                title="Follow on Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-card border border-border/80 text-foreground hover:text-butter hover:border-butter/50 hover:scale-105 transition-all shadow-xs"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href={DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                title="Get Google Maps Directions"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-card border border-border/80 text-foreground hover:text-butter hover:border-butter/50 hover:scale-105 transition-all shadow-xs"
              >
                <Navigation className="h-4 w-4" />
              </a>
              <a
                href="mailto:hello@torontocafe.ca"
                title="Email Toronto Cafe"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-card border border-border/80 text-foreground hover:text-butter hover:border-butter/50 hover:scale-105 transition-all shadow-xs"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Column 2: The House & Experience (3 cols) */}
          <div className="lg:col-span-3 space-y-4 text-left">
            <h5 className="font-heading text-sm font-bold uppercase tracking-wider text-foreground">
              The House
            </h5>
            <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
              <li>
                <a href="#house" className="hover:text-butter transition-colors flex items-center gap-1.5">
                  <span>Main Floor Parlor (Sunlit)</span>
                </a>
              </li>
              <li>
                <a href="#house" className="hover:text-butter transition-colors flex items-center gap-1.5">
                  <span>Basement Reading Nook</span>
                </a>
              </li>
              <li>
                <a href="#house" className="hover:text-butter transition-colors flex items-center gap-1.5">
                  <span>Leafy Garden Terrace Patio</span>
                </a>
              </li>
              <li>
                <a href="#menu" className="hover:text-butter transition-colors flex items-center gap-1.5">
                  <span>Artisan Drink & Bake Menu</span>
                </a>
              </li>
              <li>
                <a href="#events" className="hover:text-butter transition-colors flex items-center gap-1.5">
                  <span>Private Events & Full Buyouts</span>
                </a>
              </li>
              <li>
                <a href="#events" className="hover:text-butter transition-colors flex items-center gap-1.5">
                  <span>Office Catering & Pastry Boxes</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Location & Amenities (2 cols) */}
          <div className="lg:col-span-2 space-y-4 text-left">
            <h5 className="font-heading text-sm font-bold uppercase tracking-wider text-foreground">
              Location & Info
            </h5>
            <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
              <li className="font-medium text-foreground">
                {ADDRESS}
              </li>
              <li className="flex items-center gap-1.5 text-xs">
                <MapPin className="h-3.5 w-3.5 text-butter shrink-0" />
                <span>3m from Kensington</span>
              </li>
              <li className="flex items-center gap-1.5 text-xs">
                <MapPin className="h-3.5 w-3.5 text-butter shrink-0" />
                <span>4m from AGO</span>
              </li>
              <li className="flex items-center gap-1.5 text-xs">
                <Wifi className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>Gigabit WiFi on all floors</span>
              </li>
              <li className="flex items-center gap-1.5 text-xs">
                <Dog className="h-3.5 w-3.5 text-amber shrink-0" />
                <span>Dog-friendly patio</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Hours & Ambient Music Player (3 cols) */}
          <div className="lg:col-span-3 space-y-4 text-left">
            <h5 className="font-heading text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-butter" />
              <span>Weekly Hours</span>
            </h5>
            
            <div className="space-y-1 text-xs sm:text-sm text-muted-foreground">
              <p className="flex justify-between">
                <span className="font-semibold text-foreground">Mon – Fri:</span>
                <span>8:00 AM – 7:00 PM</span>
              </p>
              <p className="flex justify-between">
                <span className="font-semibold text-foreground">Sat – Sun:</span>
                <span>9:00 AM – 8:00 PM</span>
              </p>
              <p className="text-[11px] text-butter pt-1 font-medium">
                ★ Pastries baked fresh daily at 7:30 AM
              </p>
            </div>

            {/* Now Playing in Cafe Lo-Fi Widget */}
            <div className="pt-2">
              <div className="rounded-2xl bg-card/90 border border-border/80 p-3 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-butter flex items-center gap-1">
                    <Music className="h-3 w-3 text-butter animate-bounce" />
                    <span>Now Playing in House</span>
                  </span>
                  
                  {/* Equalizer Wave Animation */}
                  <div className="flex items-end gap-0.5 h-3">
                    <span className="w-0.5 h-2 bg-butter animate-pulse" />
                    <span className="w-0.5 h-3 bg-amber animate-pulse delay-75" />
                    <span className="w-0.5 h-1.5 bg-butter animate-pulse delay-150" />
                    <span className="w-0.5 h-2.5 bg-matcha animate-pulse delay-100" />
                  </div>
                </div>

                <p className="text-xs font-bold text-foreground truncate">
                  Rainy Morning in Baldwin · Jazz & Lo-Fi
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Toronto Cafe House Vinyl Rotation
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* BOTTOM COPYRIGHT & BACK TO TOP BAR */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Toronto Cafe. All rights reserved. Handcrafted with ❤️ in Baldwin Village.</p>

          <div className="flex items-center gap-5">
            <a href="#menu" className="hover:text-butter transition-colors">
              Dietary & Allergen Guide
            </a>
            <span>·</span>
            <a href="#visit" className="hover:text-butter transition-colors">
              Directions
            </a>
            <span>·</span>
            
            {/* Tactile Back to Top Button */}
            <button
              onClick={scrollToTop}
              title="Scroll back to top"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-warm-brown bg-butter/20 hover:bg-butter/30 px-3 py-1.5 rounded-full transition-all cursor-pointer shadow-2xs hover:scale-105"
            >
              <span>Top</span>
              <ArrowUp className="h-3 w-3 text-warm-brown" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
