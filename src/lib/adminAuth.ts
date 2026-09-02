export type UserRole = "SUPER_ADMIN" | "STAFF_ADMIN";

export interface PasswordStrength {
  score: number; // 0 to 4
  label: "Very Weak" | "Weak" | "Fair" | "Strong" | "Very Strong";
  color: string;
  hasMinLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  action: "LOGIN_SUCCESS" | "LOGIN_FAILED" | "PASSWORD_CHANGED" | "STAFF_PASSWORD_CHANGED" | "PIN_RESET" | "LOGOUT";
  ipAddress: string;
  userAgent: string;
  details?: string;
  role?: UserRole;
}

export interface AdminSession {
  adminId: string;
  role: UserRole;
  token: string;
  loginAt: number;
  expiresAt: number;
}

const STORAGE_KEYS = {
  SUPER_ADMIN_ID: "toronto_cafe_super_admin_id",
  SUPER_ADMIN_PASS_HASH: "toronto_cafe_super_admin_pass_hash",
  STAFF_ADMIN_ID: "toronto_cafe_staff_admin_id",
  STAFF_ADMIN_PASS_HASH: "toronto_cafe_staff_admin_pass_hash",
  SECURITY_PIN_HASH: "toronto_cafe_security_pin_hash",
  SESSION: "toronto_cafe_admin_session",
  FAILED_ATTEMPTS: "toronto_cafe_failed_attempts",
  LOCKOUT_UNTIL: "toronto_cafe_lockout_until",
  AUDIT_LOGS: "toronto_cafe_audit_logs",
};

// Default Credentials (Never stored in plaintext — SHA-256 only)
const DEFAULT_SUPER_ADMIN_ID = "admin@torontocafe.ca";
// SHA-256 of "Baldwin#Heritage@1998!"
const DEFAULT_SUPER_PASSWORD_HASH = "d9d8aa66f7b3967389267ab60fbedc406699e6ec699137dd65695b8b13f6ff4f";
// SHA-256 of "779922"
const DEFAULT_PIN_HASH = "77c9b1f97b27bafd2d666686133743c62543c1ec2677392ac43f4afdbd63d792";

const DEFAULT_STAFF_ADMIN_ID = "staff@torontocafe.ca";
// SHA-256 of "CafeStaff#Baldwin98"
const DEFAULT_STAFF_PASSWORD_HASH = "8879775a2f67872e4edcb813d64b6023599b93d3df4614f1fe811e2f5518bc15";

/**
 * Standard cryptographic SHA-256 hash using Web Crypto with pure JS fallback.
 */
export async function sha256(message: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  return jsSha256(message);
}

function jsSha256(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }
  let result = "";
  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;
  let hash = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];
  const wordsLength = (((asciiBitLength + 64) >>> 9) << 4) + 15;
  while (words.length <= wordsLength) words.push(0);
  for (i = 0; i < ascii.length; i++) {
    words[i >> 2] |= (ascii.charCodeAt(i) & 255) << ((3 - (i % 4)) * 8);
  }
  words[i >> 2] |= 0x80 << ((3 - (i % 4)) * 8);
  words[wordsLength] = asciiBitLength;
  for (let j = 0; j < words.length; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash.slice(0);
    hash = hash.slice(0, 8);
    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15],
        w2 = w[i - 2];
      const a = hash[0],
        e = hash[4];
      const temp1 =
        hash[7] +
        (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
        ((e & hash[5]) ^ (~e & hash[6])) +
        k[i] +
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] +
                (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                w[i - 7] +
                (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
              0);
      const temp2 =
        (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
      hash = [(temp1 + temp2) | 0, a, hash[1], hash[2], (hash[3] + temp1) | 0, e, hash[5], hash[6]];
    }
    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }
  for (i = 0; i < 8; i++) {
    for (let j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? "0" : "") + b.toString(16);
    }
  }
  return result;
}

// Evaluate Password Security Strength
export function evaluatePasswordStrength(password: string): PasswordStrength {
  const hasMinLength = password.length >= 12;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  let score = 0;
  if (password.length >= 8) score += 1;
  if (hasMinLength) score += 1;
  if (hasUpper && hasLower) score += 1;
  if (hasNumber && hasSpecial) score += 1;

  const labels: Record<number, PasswordStrength["label"]> = {
    0: "Very Weak",
    1: "Weak",
    2: "Fair",
    3: "Strong",
    4: "Very Strong",
  };

  const colors: Record<number, string> = {
    0: "#EF4444",
    1: "#F97316",
    2: "#EAB308",
    3: "#10B981",
    4: "#059669",
  };

  return {
    score,
    label: labels[score] || "Very Weak",
    color: colors[score] || "#EF4444",
    hasMinLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
  };
}

export class AdminAuthService {
  private static isBrowser(): boolean {
    return typeof window !== "undefined";
  }

  // Get Super Admin ID
  static getSuperAdminId(): string {
    if (!this.isBrowser()) return DEFAULT_SUPER_ADMIN_ID;
    return localStorage.getItem(STORAGE_KEYS.SUPER_ADMIN_ID) || DEFAULT_SUPER_ADMIN_ID;
  }

  // Backward compatibility helper
  static getAdminId(): string {
    return this.getSuperAdminId();
  }

  // Get Staff Admin ID
  static getStaffAdminId(): string {
    if (!this.isBrowser()) return DEFAULT_STAFF_ADMIN_ID;
    return localStorage.getItem(STORAGE_KEYS.STAFF_ADMIN_ID) || DEFAULT_STAFF_ADMIN_ID;
  }

  // Get Super Admin Password Hash
  private static getStoredSuperPasswordHash(): string {
    if (!this.isBrowser()) return DEFAULT_SUPER_PASSWORD_HASH;
    return localStorage.getItem(STORAGE_KEYS.SUPER_ADMIN_PASS_HASH) || DEFAULT_SUPER_PASSWORD_HASH;
  }

  // Get Staff Password Hash
  private static getStoredStaffPasswordHash(): string {
    if (!this.isBrowser()) return DEFAULT_STAFF_PASSWORD_HASH;
    return localStorage.getItem(STORAGE_KEYS.STAFF_ADMIN_PASS_HASH) || DEFAULT_STAFF_PASSWORD_HASH;
  }

  // Get Security PIN Hash (Super Admin recovery)
  private static getStoredPinHash(): string {
    if (!this.isBrowser()) return DEFAULT_PIN_HASH;
    return localStorage.getItem(STORAGE_KEYS.SECURITY_PIN_HASH) || DEFAULT_PIN_HASH;
  }

  // Check Lockout Status
  static checkLockout(): { isLocked: boolean; remainingSeconds: number } {
    if (!this.isBrowser()) return { isLocked: false, remainingSeconds: 0 };
    const lockoutUntil = parseInt(localStorage.getItem(STORAGE_KEYS.LOCKOUT_UNTIL) || "0", 10);
    const now = Date.now();

    if (lockoutUntil > now) {
      const remainingSeconds = Math.ceil((lockoutUntil - now) / 1000);
      return { isLocked: true, remainingSeconds };
    }

    return { isLocked: false, remainingSeconds: 0 };
  }

  // Current active session
  static getCurrentSession(): AdminSession | null {
    if (!this.isBrowser()) return null;
    const sessionStr = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!sessionStr) return null;
    try {
      const session = JSON.parse(sessionStr) as AdminSession;
      if (session.expiresAt && session.expiresAt > Date.now()) {
        return session;
      }
      this.logout();
      return null;
    } catch {
      return null;
    }
  }

  // Verify Active Session and Role
  static isAuthenticated(requiredRole?: UserRole): boolean {
    const session = this.getCurrentSession();
    if (!session) return false;
    if (!requiredRole) return true;
    if (requiredRole === "STAFF_ADMIN") {
      // Both Super Admin and Staff Admin can access Staff portal
      return true;
    }
    if (requiredRole === "SUPER_ADMIN") {
      // ONLY Super Admin can access Super Admin vault
      return session.role === "SUPER_ADMIN";
    }
    return false;
  }

  // Attempt Login for a specific portal role
  static async login(
    id: string,
    pass: string,
    portalRole: UserRole,
    remember: boolean = false
  ): Promise<{ success: boolean; role?: UserRole; error?: string }> {
    if (!this.isBrowser()) return { success: false, error: "Browser environment required" };

    const lockout = this.checkLockout();
    if (lockout.isLocked) {
      return {
        success: false,
        error: `Account locked due to consecutive failed attempts. Please wait ${lockout.remainingSeconds}s.`,
      };
    }

    const inputId = id.trim().toLowerCase();
    const inputHash = await sha256(pass);

    const superId = this.getSuperAdminId().trim().toLowerCase();
    const superHash = this.getStoredSuperPasswordHash();

    const staffId = this.getStaffAdminId().trim().toLowerCase();
    const staffHash = this.getStoredStaffPasswordHash();

    let authenticatedRole: UserRole | null = null;
    let authenticatedId = "";

    // 1. Check Super Admin credentials
    if (inputId === superId && inputHash === superHash) {
      authenticatedRole = "SUPER_ADMIN";
      authenticatedId = this.getSuperAdminId();
    }
    // 2. Check Staff Admin credentials
    else if (inputId === staffId && inputHash === staffHash) {
      if (portalRole === "SUPER_ADMIN") {
        return {
          success: false,
          error: "Staff credentials cannot access the Super Admin Master Vault.",
        };
      }
      authenticatedRole = "STAFF_ADMIN";
      authenticatedId = this.getStaffAdminId();
    }

    if (authenticatedRole) {
      // Reset failed attempts
      localStorage.removeItem(STORAGE_KEYS.FAILED_ATTEMPTS);
      localStorage.removeItem(STORAGE_KEYS.LOCKOUT_UNTIL);

      const sessionData: AdminSession = {
        adminId: authenticatedId,
        role: authenticatedRole,
        token: "tok_" + Math.random().toString(36).substring(2) + Date.now().toString(36),
        loginAt: Date.now(),
        expiresAt: remember ? Date.now() + 7 * 24 * 60 * 60 * 1000 : Date.now() + 12 * 60 * 60 * 1000,
      };

      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData));
      this.addAuditLog("LOGIN_SUCCESS", `Signed into ${portalRole} as ${authenticatedId}`, authenticatedRole);

      return { success: true, role: authenticatedRole };
    } else {
      const failed = parseInt(localStorage.getItem(STORAGE_KEYS.FAILED_ATTEMPTS) || "0", 10) + 1;
      localStorage.setItem(STORAGE_KEYS.FAILED_ATTEMPTS, failed.toString());

      this.addAuditLog("LOGIN_FAILED", `Failed login attempt for ID: ${id} on ${portalRole}`);

      if (failed >= 5) {
        const lockoutUntil = Date.now() + 60 * 1000;
        localStorage.setItem(STORAGE_KEYS.LOCKOUT_UNTIL, lockoutUntil.toString());
        return {
          success: false,
          error: "Too many failed attempts! Portal locked for 60 seconds.",
        };
      }

      return {
        success: false,
        error: `Invalid Credentials. (${5 - failed} attempts remaining before lockout)`,
      };
    }
  }

  // Logout
  static logout(): void {
    if (!this.isBrowser()) return;
    this.addAuditLog("LOGOUT", "Session ended");
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  }

  // Update Super Admin Credentials
  static async updateCredentials(newId: string, newPass: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isBrowser()) return { success: false, error: "Browser environment required" };

    if (!newId || newId.length < 3) {
      return { success: false, error: "Super Admin ID must be at least 3 characters long." };
    }

    const strength = evaluatePasswordStrength(newPass);
    if (strength.score < 3) {
      return {
        success: false,
        error: "Password is not strong enough! Must be at least 12 characters and include uppercase, lowercase, numbers, and symbols.",
      };
    }

    const newPassHash = await sha256(newPass);
    localStorage.setItem(STORAGE_KEYS.SUPER_ADMIN_ID, newId.trim());
    localStorage.setItem(STORAGE_KEYS.SUPER_ADMIN_PASS_HASH, newPassHash);

    this.addAuditLog("PASSWORD_CHANGED", `Super Admin ID/Password updated for ${newId}`, "SUPER_ADMIN");
    return { success: true };
  }

  // Update Staff Admin Credentials (managed by Super Admin)
  static async updateStaffCredentials(newId: string, newPass: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isBrowser()) return { success: false, error: "Browser environment required" };

    if (!newId || newId.length < 3) {
      return { success: false, error: "Staff ID must be at least 3 characters long." };
    }

    if (newPass.length < 8) {
      return { success: false, error: "Staff Password must be at least 8 characters long." };
    }

    const newPassHash = await sha256(newPass);
    localStorage.setItem(STORAGE_KEYS.STAFF_ADMIN_ID, newId.trim());
    localStorage.setItem(STORAGE_KEYS.STAFF_ADMIN_PASS_HASH, newPassHash);

    this.addAuditLog("STAFF_PASSWORD_CHANGED", `Staff credentials updated for ${newId}`, "SUPER_ADMIN");
    return { success: true };
  }

  // Reset Super Admin via Security PIN
  static async resetViaPin(pin: string, newPass: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isBrowser()) return { success: false, error: "Browser environment required" };

    const storedPinHash = this.getStoredPinHash();
    const inputPinHash = await sha256(pin.trim());
    if (inputPinHash !== storedPinHash) {
      return { success: false, error: "Incorrect Security PIN." };
    }

    const strength = evaluatePasswordStrength(newPass);
    if (strength.score < 3) {
      return {
        success: false,
        error: "New password does not meet security criteria.",
      };
    }

    const newPassHash = await sha256(newPass);
    localStorage.setItem(STORAGE_KEYS.SUPER_ADMIN_PASS_HASH, newPassHash);
    localStorage.removeItem(STORAGE_KEYS.FAILED_ATTEMPTS);
    localStorage.removeItem(STORAGE_KEYS.LOCKOUT_UNTIL);

    this.addAuditLog("PIN_RESET", "Super Admin password reset via Security PIN", "SUPER_ADMIN");
    return { success: true };
  }

  // Audit Logs
  static getAuditLogs(): SecurityAuditLog[] {
    if (!this.isBrowser()) return [];
    try {
      const logsStr = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (!logsStr) return [];
      return JSON.parse(logsStr);
    } catch {
      return [];
    }
  }

  static addAuditLog(action: SecurityAuditLog["action"], details: string, role?: UserRole): void {
    if (!this.isBrowser()) return;
    try {
      const logs = this.getAuditLogs();
      const newLog: SecurityAuditLog = {
        id: "log_" + Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleString("en-US", { timeZone: "America/Toronto" }),
        action,
        ipAddress: "127.0.0.1 (Localhost)",
        userAgent: (typeof navigator !== "undefined" ? navigator.userAgent.substring(0, 45) : "Server") + "...",
        details,
        role,
      };
      const updated = [newLog, ...logs.slice(0, 49)];
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }
}
