export interface MenuItem {
  id: string;
  name: string;
  category: "coffee" | "matcha" | "bakery" | "savory";
  price: number;
  description: string;
  tags: string[];
  inStock: boolean;
  isHouseSpecial?: boolean;
}

export interface CafeOrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  options?: string;
}

export interface CafeOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  orderType: "Dine-In (Table)" | "Takeaway Pickup" | "Patio Express";
  tableNumber?: string;
  pickupTime?: string;
  items: CafeOrderItem[];
  subtotal: number;
  tax: number;
  totalPrice: number;
  paymentMethod: "Pay at Barista Counter" | "Interac / Card on Pickup" | "Cash on Arrival";
  notes?: string;
  status: "New" | "Preparing" | "Ready" | "Completed" | "Cancelled";
  cancelledBy?: "Customer" | "Admin";
  cancelledAt?: string;
  cancelReason?: string;
  createdAt: string;
  createdTimestamp?: number;
}

export interface TableBooking {
  id: string;
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  guests: number;
  floorArea: "Main Floor Parlor" | "Basement Reading Nook" | "Garden Terrace Patio" | "Any Available Space";
  specialRequest?: string;
  status: "Confirmed" | "Arrived" | "Completed" | "Cancelled";
  bookedAt: string;
  bookedVia: "Website Form" | "WhatsApp Fast Book";
}

export interface WhatsAppClickLog {
  id: string;
  timestamp: string;
  buttonLocation: "Floating Quick Chat" | "Header WhatsApp" | "Table Booking Modal" | "Menu Order Button" | "Footer Contact";
  intent: "Table Reservation" | "Menu Order & Takeaway" | "Private Event Inquiry" | "General Chat";
  device: string;
  pageUrl: string;
}

export interface FormSubmission {
  id: string;
  formType: "Private Event Buyout" | "Catering Request" | "VIP Coffee Club" | "General Contact";
  name: string;
  email: string;
  phone: string;
  date?: string;
  guests?: number;
  notes: string;
  createdAt: string;
  status: "New" | "Contacted" | "Completed" | "Archived";
}

export interface EventInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  guests: number;
  type: "Whole House Buyout" | "Garden Patio Party" | "Basement Book Club" | "Other";
  notes: string;
  createdAt: string;
  status: "Pending" | "Confirmed" | "Completed" | "Declined";
}

export interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  date: string;
  text: string;
  verified: boolean;
  featured: boolean;
  response?: string;
}

export interface VIPSubscriber {
  id: string;
  email: string;
  joinedAt: string;
  voucherClaimed: boolean;
}

export interface CafeSettings {
  isWebsiteOnline: boolean; // Master Power Switch (ON / OFF)
  maintenanceTitle: string;
  maintenanceMessage: string;
  maintenanceReopenTime: string;
  statusOverride: "auto" | "open" | "closed" | "rush";
  announcement: string;
  showAnnouncement: boolean;
  phone: string;
  whatsappNumber: string;
  address: string;
  hoursMonFri: string;
  hoursSatSun: string;
}

const DEFAULT_MENU: MenuItem[] = [
  {
    id: "m_cortado",
    name: "Signature Baldwin Cortado",
    category: "coffee",
    price: 5.25,
    description: "Equal parts espresso and textured oat microfoam with cinnamon sugar.",
    tags: ["House Special", "Oat Milk"],
    inStock: true,
    isHouseSpecial: true,
  },
  {
    id: "m_matcha_latte",
    name: "Ceremonial Uji Matcha Latte",
    category: "matcha",
    price: 6.75,
    description: "Organic first-harvest Kyoto matcha, steamed oat milk, vanilla.",
    tags: ["Kyoto Direct", "Antioxidants"],
    inStock: true,
    isHouseSpecial: true,
  },
  {
    id: "m_hk_tea",
    name: "Hong Kong Silk Milk Tea",
    category: "coffee",
    price: 5.50,
    description: "Traditional pulled Ceylon tea blend with evaporated milk.",
    tags: ["Authentic", "Bold"],
    inStock: true,
  },
  {
    id: "m_croissant",
    name: "Cardamom Almond Croissant",
    category: "bakery",
    price: 5.75,
    description: "Twice-baked butter croissant with frangipane cream and cardamom dust.",
    tags: ["Baked Fresh", "Contains Nuts"],
    inStock: true,
    isHouseSpecial: true,
  },
  {
    id: "m_scone",
    name: "Earl Grey Blueberry Scone",
    category: "bakery",
    price: 4.85,
    description: "Infused with bergamot tea leaves and fresh wild Ontario blueberries.",
    tags: ["House Recipe"],
    inStock: true,
  },
  {
    id: "m_brioche",
    name: "Truffle Prosciutto Brioche",
    category: "savory",
    price: 9.50,
    description: "Warm house brioche with Italian prosciutto, gruyère, and truffle honey.",
    tags: ["Warm Savory", "Chef Pick"],
    inStock: true,
  },
];

// Clean empty default collections
const DEFAULT_ORDERS: CafeOrder[] = [];
const DEFAULT_BOOKINGS: TableBooking[] = [];
const DEFAULT_WHATSAPP_CLICKS: WhatsAppClickLog[] = [];
const DEFAULT_FORM_SUBMISSIONS: FormSubmission[] = [];
const DEFAULT_SUBSCRIBERS: VIPSubscriber[] = [];

const DEFAULT_REVIEWS: ReviewItem[] = [
  {
    id: "rev_1",
    author: "Hannah K. (Local Resident)",
    rating: 5,
    date: "2 days ago",
    text: "The basement reading nook is the best-kept secret in Toronto! Quiet, warm, and the cardamom croissant was still warm from the morning bake.",
    verified: true,
    featured: true,
  },
  {
    id: "rev_2",
    author: "David L. (Coffee Connoisseur)",
    rating: 5,
    date: "1 week ago",
    text: "Best cortado in Baldwin Village. The milk texture was silky smooth and the staff treat you like old friends. 10/10.",
    verified: true,
    featured: true,
  },
  {
    id: "rev_3",
    author: "Amina M. (U of T Student)",
    rating: 5,
    date: "2 weeks ago",
    text: "Fast fiber Wi-Fi on the parlor floor and the leafy backyard patio is an absolute urban oasis.",
    verified: true,
    featured: true,
  },
];

const DEFAULT_SETTINGS: CafeSettings = {
  isWebsiteOnline: true,
  maintenanceTitle: "Toronto Cafe is Temporarily Offline",
  maintenanceMessage: "We are currently closed for a private heritage event & seasonal kitchen updates. We look forward to welcoming you back soon!",
  maintenanceReopenTime: "Tomorrow at 8:00 AM",
  statusOverride: "auto",
  announcement: "🌿 Sunny Patio Open All Day · Fresh Cardamom Bakes at 7:30 AM",
  showAnnouncement: true,
  phone: "(416) 977-1998",
  whatsappNumber: "1234567890",
  address: "7 Baldwin St, Baldwin Village, Toronto, ON M5T 1L7",
  hoursMonFri: "8:00 AM – 7:00 PM",
  hoursSatSun: "9:00 AM – 8:00 PM",
};

const STORE_KEYS = {
  ORDERS: "toronto_cafe_store_orders",
  MENU: "toronto_cafe_store_menu",
  BOOKINGS: "toronto_cafe_store_bookings",
  WHATSAPP_CLICKS: "toronto_cafe_store_wa_clicks",
  FORM_SUBMISSIONS: "toronto_cafe_store_form_submissions",
  REVIEWS: "toronto_cafe_store_reviews",
  SUBSCRIBERS: "toronto_cafe_store_subscribers",
  SETTINGS: "toronto_cafe_store_settings",
};

export class CafeAdminStore {
  private static isBrowser(): boolean {
    return typeof window !== "undefined";
  }

  // --- ORDERS & KITCHEN POS ---
  static getOrders(): CafeOrder[] {
    if (!this.isBrowser()) return DEFAULT_ORDERS;
    try {
      const data = localStorage.getItem(STORE_KEYS.ORDERS);
      return data ? JSON.parse(data) : DEFAULT_ORDERS;
    } catch {
      return DEFAULT_ORDERS;
    }
  }

  static saveOrders(orders: CafeOrder[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORE_KEYS.ORDERS, JSON.stringify(orders));
    window.dispatchEvent(new Event("cafe_store_updated"));
  }

  static addOrder(order: Omit<CafeOrder, "id" | "orderNumber" | "createdAt" | "status">): CafeOrder {
    const orders = this.getOrders();
    const orderNum = "#TC-" + Math.floor(1000 + Math.random() * 9000);
    const now = Date.now();
    const newOrder: CafeOrder = {
      ...order,
      id: "ord_" + now.toString(36),
      orderNumber: orderNum,
      status: "New",
      createdAt: new Date().toLocaleString("en-US", { timeZone: "America/Toronto" }),
      createdTimestamp: now,
    };
    this.saveOrders([newOrder, ...orders]);
    return newOrder;
  }

  static getRemainingCancelSeconds(order: CafeOrder): number {
    if (order.status === "Completed" || order.status === "Cancelled") return 0;
    let created = order.createdTimestamp;
    if (!created && order.createdAt) {
      const parsed = new Date(order.createdAt).getTime();
      if (!isNaN(parsed)) created = parsed;
    }
    if (!created) {
      // Default to 60s window if missing
      return 60;
    }
    const elapsed = Math.floor((Date.now() - created) / 1000);
    const remaining = 60 - elapsed;
    return remaining > 0 ? remaining : 0;
  }

  static updateOrderStatus(id: string, status: CafeOrder["status"]): void {
    const orders = this.getOrders();
    const updated = orders.map((o) => (o.id === id ? { ...o, status } : o));
    this.saveOrders(updated);
  }

  static deleteOrder(id: string): void {
    const orders = this.getOrders();
    const updated = orders.filter((o) => o.id !== id);
    this.saveOrders(updated);
  }

  static getOrderByNumber(orderNumber: string): CafeOrder | undefined {
    const orders = this.getOrders();
    if (!orderNumber) return undefined;
    const q = orderNumber.trim().toLowerCase();
    const cleanQ = q.replace(/[^a-z0-9]/g, "");
    const digitsOnly = q.replace(/[^0-9]/g, "");

    return orders.find((o) => {
      const oNum = o.orderNumber.toLowerCase();
      const cleanONum = oNum.replace(/[^a-z0-9]/g, "");
      const oId = o.id.toLowerCase();
      const cleanId = oId.replace(/[^a-z0-9]/g, "");

      if (oNum === q || oId === q) return true;
      if (cleanONum === cleanQ || cleanId === cleanQ) return true;
      if (digitsOnly && digitsOnly.length >= 2 && cleanONum.includes(digitsOnly)) return true;
      if (cleanQ.length >= 3 && (cleanONum.includes(cleanQ) || cleanId.includes(cleanQ))) return true;

      return false;
    });
  }

  static getOrdersByPhone(phone: string): CafeOrder[] {
    const orders = this.getOrders();
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (!cleanPhone) return [];
    return orders.filter((o) => {
      const targetPhone = o.customerPhone.replace(/[^0-9]/g, "");
      return targetPhone.includes(cleanPhone) || cleanPhone.includes(targetPhone);
    });
  }

  static cancelOrderByCustomer(
    idOrNumber: string,
    reason?: string,
    forceAdmin = false
  ): { success: boolean; error?: string } {
    const orders = this.getOrders();
    const targetOrder = this.getOrderByNumber(idOrNumber) || orders.find((o) => o.id === idOrNumber);

    if (!targetOrder) {
      return { success: false, error: "Order not found. Please verify your order number." };
    }

    if (targetOrder.status === "Completed") {
      return { success: false, error: "This order has already been completed." };
    }

    if (targetOrder.status === "Cancelled") {
      return { success: false, error: "This order is already cancelled." };
    }

    // 1-MINUTE TIME LIMIT VALIDATION FOR CUSTOMER
    if (!forceAdmin) {
      const remainingSeconds = this.getRemainingCancelSeconds(targetOrder);
      if (remainingSeconds <= 0) {
        return {
          success: false,
          error: "Cancellation window has closed (1-minute limit expired). Kitchen preparation has already started. Please message us on WhatsApp for assistance.",
        };
      }
    }

    const updated = orders.map((o) => {
      if (o.id === targetOrder.id) {
        return {
          ...o,
          status: "Cancelled" as const,
          cancelledBy: (forceAdmin ? "Admin" : "Customer") as any,
          cancelledAt: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          cancelReason: reason || (forceAdmin ? "Staff cancelled" : "Customer self-cancelled within 1 min"),
          notes: reason ? `${o.notes ? o.notes + " | " : ""}Cancelled: ${reason}` : o.notes,
        };
      }
      return o;
    });

    this.saveOrders(updated);
    return { success: true };
  }

  static cancelOrderByAdmin(idOrNumber: string, reason?: string): boolean {
    const res = this.cancelOrderByCustomer(
      idOrNumber,
      reason || "Kitchen requested cancellation (item out of stock / closing)",
      true
    );
    return res.success;
  }

  static clearAllOrders(): void {
    this.saveOrders([]);
  }

  // --- TABLE BOOKINGS ---
  static getTableBookings(): TableBooking[] {
    if (!this.isBrowser()) return DEFAULT_BOOKINGS;
    try {
      const data = localStorage.getItem(STORE_KEYS.BOOKINGS);
      return data ? JSON.parse(data) : DEFAULT_BOOKINGS;
    } catch {
      return DEFAULT_BOOKINGS;
    }
  }

  static saveTableBookings(bookings: TableBooking[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORE_KEYS.BOOKINGS, JSON.stringify(bookings));
    window.dispatchEvent(new Event("cafe_store_updated"));
  }

  static addTableBooking(booking: Omit<TableBooking, "id" | "bookedAt" | "status">): TableBooking {
    const bookings = this.getTableBookings();
    const newBooking: TableBooking = {
      ...booking,
      id: "tb_" + Date.now().toString(36),
      status: "Confirmed",
      bookedAt: new Date().toLocaleString("en-US", { timeZone: "America/Toronto" }),
    };
    this.saveTableBookings([newBooking, ...bookings]);
    return newBooking;
  }

  static updateBookingStatus(id: string, status: TableBooking["status"]): void {
    const bookings = this.getTableBookings();
    const updated = bookings.map((b) => (b.id === id ? { ...b, status } : b));
    this.saveTableBookings(updated);
  }

  static deleteTableBooking(id: string): void {
    const bookings = this.getTableBookings();
    const updated = bookings.filter((b) => b.id !== id);
    this.saveTableBookings(updated);
  }

  static clearAllBookings(): void {
    this.saveTableBookings([]);
  }

  // --- WHATSAPP CLICKS ---
  static getWhatsAppClicks(): WhatsAppClickLog[] {
    if (!this.isBrowser()) return DEFAULT_WHATSAPP_CLICKS;
    try {
      const data = localStorage.getItem(STORE_KEYS.WHATSAPP_CLICKS);
      return data ? JSON.parse(data) : DEFAULT_WHATSAPP_CLICKS;
    } catch {
      return DEFAULT_WHATSAPP_CLICKS;
    }
  }

  static logWhatsAppClick(click: Omit<WhatsAppClickLog, "id" | "timestamp" | "device" | "pageUrl">): void {
    if (!this.isBrowser()) return;
    const clicks = this.getWhatsAppClicks();
    const newClick: WhatsAppClickLog = {
      ...click,
      id: "wa_" + Date.now().toString(36),
      timestamp: new Date().toLocaleString("en-US", { timeZone: "America/Toronto" }),
      device: navigator.userAgent.includes("Mobi") ? "Mobile Device" : "Desktop Browser",
      pageUrl: window.location.href,
    };
    localStorage.setItem(STORE_KEYS.WHATSAPP_CLICKS, JSON.stringify([newClick, ...clicks.slice(0, 99)]));
    window.dispatchEvent(new Event("cafe_store_updated"));
  }

  static clearAllWhatsAppClicks(): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORE_KEYS.WHATSAPP_CLICKS, JSON.stringify([]));
    window.dispatchEvent(new Event("cafe_store_updated"));
  }

  // --- FORM SUBMISSIONS ---
  static getFormSubmissions(): FormSubmission[] {
    if (!this.isBrowser()) return DEFAULT_FORM_SUBMISSIONS;
    try {
      const data = localStorage.getItem(STORE_KEYS.FORM_SUBMISSIONS);
      return data ? JSON.parse(data) : DEFAULT_FORM_SUBMISSIONS;
    } catch {
      return DEFAULT_FORM_SUBMISSIONS;
    }
  }

  static addFormSubmission(submission: Omit<FormSubmission, "id" | "createdAt" | "status">): FormSubmission {
    const submissions = this.getFormSubmissions();
    const newSub: FormSubmission = {
      ...submission,
      id: "form_" + Date.now().toString(36),
      createdAt: new Date().toLocaleString("en-US", { timeZone: "America/Toronto" }),
      status: "New",
    };
    if (this.isBrowser()) {
      localStorage.setItem(STORE_KEYS.FORM_SUBMISSIONS, JSON.stringify([newSub, ...submissions]));
      window.dispatchEvent(new Event("cafe_store_updated"));
    }
    return newSub;
  }

  static updateFormSubmissionStatus(id: string, status: FormSubmission["status"]): void {
    const subs = this.getFormSubmissions();
    const updated = subs.map((s) => (s.id === id ? { ...s, status } : s));
    if (this.isBrowser()) {
      localStorage.setItem(STORE_KEYS.FORM_SUBMISSIONS, JSON.stringify(updated));
      window.dispatchEvent(new Event("cafe_store_updated"));
    }
  }

  static clearAllFormSubmissions(): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORE_KEYS.FORM_SUBMISSIONS, JSON.stringify([]));
    window.dispatchEvent(new Event("cafe_store_updated"));
  }

  // --- MENU ITEMS ---
  static getMenu(): MenuItem[] {
    if (!this.isBrowser()) return DEFAULT_MENU;
    try {
      const data = localStorage.getItem(STORE_KEYS.MENU);
      return data ? JSON.parse(data) : DEFAULT_MENU;
    } catch {
      return DEFAULT_MENU;
    }
  }

  static saveMenu(items: MenuItem[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORE_KEYS.MENU, JSON.stringify(items));
    window.dispatchEvent(new Event("cafe_store_updated"));
  }

  static toggleItemStock(id: string): void {
    const menu = this.getMenu();
    const updated = menu.map((item) => (item.id === id ? { ...item, inStock: !item.inStock } : item));
    this.saveMenu(updated);
  }

  static addMenuItem(item: Omit<MenuItem, "id">): void {
    const menu = this.getMenu();
    const newItem: MenuItem = {
      ...item,
      id: "m_" + Date.now().toString(36),
    };
    this.saveMenu([newItem, ...menu]);
  }

  static updateMenuItem(id: string, updates: Partial<MenuItem>): void {
    const menu = this.getMenu();
    const updated = menu.map((item) => (item.id === id ? { ...item, ...updates } : item));
    this.saveMenu(updated);
  }

  static deleteMenuItem(id: string): void {
    const menu = this.getMenu();
    const updated = menu.filter((item) => item.id !== id);
    this.saveMenu(updated);
  }

  // --- REVIEWS ---
  static getReviews(): ReviewItem[] {
    if (!this.isBrowser()) return DEFAULT_REVIEWS;
    try {
      const data = localStorage.getItem(STORE_KEYS.REVIEWS);
      return data ? JSON.parse(data) : DEFAULT_REVIEWS;
    } catch {
      return DEFAULT_REVIEWS;
    }
  }

  static saveReviews(reviews: ReviewItem[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORE_KEYS.REVIEWS, JSON.stringify(reviews));
    window.dispatchEvent(new Event("cafe_store_updated"));
  }

  static toggleFeaturedReview(id: string): void {
    const reviews = this.getReviews();
    const updated = reviews.map((r) => (r.id === id ? { ...r, featured: !r.featured } : r));
    this.saveReviews(updated);
  }

  // --- VIP SUBSCRIBERS ---
  static getSubscribers(): VIPSubscriber[] {
    if (!this.isBrowser()) return DEFAULT_SUBSCRIBERS;
    try {
      const data = localStorage.getItem(STORE_KEYS.SUBSCRIBERS);
      return data ? JSON.parse(data) : DEFAULT_SUBSCRIBERS;
    } catch {
      return DEFAULT_SUBSCRIBERS;
    }
  }

  static addSubscriber(email: string): void {
    const subs = this.getSubscribers();
    if (subs.some((s) => s.email.toLowerCase() === email.toLowerCase())) return;
    const newSub: VIPSubscriber = {
      id: "sub_" + Date.now().toString(36),
      email,
      joinedAt: new Date().toLocaleString("en-US", { timeZone: "America/Toronto" }),
      voucherClaimed: false,
    };
    if (this.isBrowser()) {
      localStorage.setItem(STORE_KEYS.SUBSCRIBERS, JSON.stringify([newSub, ...subs]));
      window.dispatchEvent(new Event("cafe_store_updated"));
    }
  }

  static clearAllSubscribers(): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORE_KEYS.SUBSCRIBERS, JSON.stringify([]));
    window.dispatchEvent(new Event("cafe_store_updated"));
  }

  // --- GLOBAL RESET ALL ACTIVITY DATA ---
  static clearAllActivityData(): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORE_KEYS.ORDERS, JSON.stringify([]));
    localStorage.setItem(STORE_KEYS.BOOKINGS, JSON.stringify([]));
    localStorage.setItem(STORE_KEYS.FORM_SUBMISSIONS, JSON.stringify([]));
    localStorage.setItem(STORE_KEYS.WHATSAPP_CLICKS, JSON.stringify([]));
    localStorage.setItem(STORE_KEYS.SUBSCRIBERS, JSON.stringify([]));
    window.dispatchEvent(new Event("cafe_store_updated"));
  }

  // --- SETTINGS ---
  static getSettings(): CafeSettings {
    if (!this.isBrowser()) return DEFAULT_SETTINGS;
    try {
      const data = localStorage.getItem(STORE_KEYS.SETTINGS);
      if (!data) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(data);
      if (parsed.whatsappNumber === "+14169771998" || parsed.whatsappNumber === "14169771998") {
        parsed.whatsappNumber = "1234567890";
      }
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  static saveSettings(settings: CafeSettings): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORE_KEYS.SETTINGS, JSON.stringify(settings));
    window.dispatchEvent(new Event("cafe_store_updated"));
  }

  static toggleWebsiteOnline(isOnline: boolean): void {
    const settings = this.getSettings();
    this.saveSettings({ ...settings, isWebsiteOnline: isOnline });
  }

  static getWhatsAppCleanNumber(): string {
    const raw = this.getSettings().whatsappNumber || "1234567890";
    const clean = raw.replace(/[^0-9]/g, "");
    if (clean === "14169771998" || !clean) {
      return "1234567890";
    }
    return clean;
  }

  static getWhatsAppLink(message?: string): string {
    const cleanNum = this.getWhatsAppCleanNumber();
    if (!message) return `https://wa.me/${cleanNum}`;
    return `https://wa.me/${cleanNum}?text=${encodeURIComponent(message)}`;
  }
}
