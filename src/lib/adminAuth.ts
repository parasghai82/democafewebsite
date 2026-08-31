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
  action: "LOGIN_SUCCESS" | "LOGIN_FAILED" | "PASSWORD_CHANGED" | "PIN_RESET" | "LOGOUT";
  ipAddress: string;
  userAgent: string;
  details?: string;
}

const STORAGE_KEYS = {
  ADMIN_ID: "toronto_cafe_admin_id",
  ADMIN_PASS: "toronto_cafe_admin_pass",
  SECURITY_PIN: "toronto_cafe_security_pin",
  SESSION: "toronto_cafe_admin_session",
  FAILED_ATTEMPTS: "toronto_cafe_failed_attempts",
  LOCKOUT_UNTIL: "toronto_cafe_lockout_until",
  AUDIT_LOGS: "toronto_cafe_audit_logs",
};

// Default High-Security Master Credentials
export const DEFAULT_CREDENTIALS = {
  ADMIN_ID: "admin@torontocafe.ca",
  ADMIN_PASS: "Baldwin#Heritage@1998!",
  SECURITY_PIN: "779922",
};

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
    0: "#EF4444", // Red
    1: "#F97316", // Orange
    2: "#EAB308", // Yellow
    3: "#10B981", // Emerald
    4: "#059669", // Dark Emerald
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

  // Get current Admin ID
  static getAdminId(): string {
    if (!this.isBrowser()) return DEFAULT_CREDENTIALS.ADMIN_ID;
    return localStorage.getItem(STORAGE_KEYS.ADMIN_ID) || DEFAULT_CREDENTIALS.ADMIN_ID;
  }

  // Get current Master Password
  static getAdminPassword(): string {
    if (!this.isBrowser()) return DEFAULT_CREDENTIALS.ADMIN_PASS;
    return localStorage.getItem(STORAGE_KEYS.ADMIN_PASS) || DEFAULT_CREDENTIALS.ADMIN_PASS;
  }

  // Get current Security PIN
  static getSecurityPin(): string {
    if (!this.isBrowser()) return DEFAULT_CREDENTIALS.SECURITY_PIN;
    return localStorage.getItem(STORAGE_KEYS.SECURITY_PIN) || DEFAULT_CREDENTIALS.SECURITY_PIN;
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

  // Attempt Login
  static login(id: string, pass: string, remember: boolean = false): { success: boolean; error?: string } {
    if (!this.isBrowser()) return { success: false, error: "Browser environment required" };

    const lockout = this.checkLockout();
    if (lockout.isLocked) {
      return {
        success: false,
        error: `Account locked due to consecutive failed attempts. Please wait ${lockout.remainingSeconds}s.`,
      };
    }

    const currentId = this.getAdminId();
    const currentPass = this.getAdminPassword();

    if (id.trim().toLowerCase() === currentId.trim().toLowerCase() && pass === currentPass) {
      // Reset failed attempts
      localStorage.removeItem(STORAGE_KEYS.FAILED_ATTEMPTS);
      localStorage.removeItem(STORAGE_KEYS.LOCKOUT_UNTIL);

      // Create session
      const sessionData = {
        adminId: currentId,
        token: "tok_" + Math.random().toString(36).substring(2) + Date.now().toString(36),
        loginAt: Date.now(),
        expiresAt: remember ? Date.now() + 7 * 24 * 60 * 60 * 1000 : Date.now() + 12 * 60 * 60 * 1000,
      };

      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData));
      this.addAuditLog("LOGIN_SUCCESS", `Logged in as ${currentId}`);

      return { success: true };
    } else {
      // Increment failed attempts
      const failed = parseInt(localStorage.getItem(STORAGE_KEYS.FAILED_ATTEMPTS) || "0", 10) + 1;
      localStorage.setItem(STORAGE_KEYS.FAILED_ATTEMPTS, failed.toString());

      this.addAuditLog("LOGIN_FAILED", `Failed login attempt for ID: ${id}`);

      if (failed >= 5) {
        const lockoutUntil = Date.now() + 60 * 1000; // 60s lockout
        localStorage.setItem(STORAGE_KEYS.LOCKOUT_UNTIL, lockoutUntil.toString());
        return {
          success: false,
          error: "Too many failed attempts! Account locked for 60 seconds.",
        };
      }

      return {
        success: false,
        error: `Invalid Admin ID or Password. (${5 - failed} attempts remaining before lockout)`,
      };
    }
  }

  // Verify Active Session
  static isAuthenticated(): boolean {
    if (!this.isBrowser()) return false;
    const sessionStr = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!sessionStr) return false;

    try {
      const session = JSON.parse(sessionStr);
      if (session.expiresAt && session.expiresAt > Date.now()) {
        return true;
      }
      // Expired
      this.logout();
      return false;
    } catch {
      return false;
    }
  }

  // Logout
  static logout(): void {
    if (!this.isBrowser()) return;
    this.addAuditLog("LOGOUT", "Admin session ended");
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  }

  // Update Credentials
  static updateCredentials(newId: string, newPass: string): { success: boolean; error?: string } {
    if (!this.isBrowser()) return { success: false, error: "Browser environment required" };

    if (!newId || newId.length < 3) {
      return { success: false, error: "Admin ID must be at least 3 characters long." };
    }

    const strength = evaluatePasswordStrength(newPass);
    if (strength.score < 3) {
      return {
        success: false,
        error: "Password is not strong enough! Must be at least 12 characters and include uppercase, lowercase, numbers, and symbols.",
      };
    }

    localStorage.setItem(STORAGE_KEYS.ADMIN_ID, newId.trim());
    localStorage.setItem(STORAGE_KEYS.ADMIN_PASS, newPass);

    this.addAuditLog("PASSWORD_CHANGED", `Admin ID/Password updated to ${newId}`);
    return { success: true };
  }

  // Reset Password via Security PIN
  static resetViaPin(pin: string, newPass: string): { success: boolean; error?: string } {
    if (!this.isBrowser()) return { success: false, error: "Browser environment required" };

    const currentPin = this.getSecurityPin();
    if (pin.trim() !== currentPin.trim()) {
      return { success: false, error: "Incorrect Security PIN." };
    }

    const strength = evaluatePasswordStrength(newPass);
    if (strength.score < 3) {
      return {
        success: false,
        error: "New password does not meet security criteria.",
      };
    }

    localStorage.setItem(STORAGE_KEYS.ADMIN_PASS, newPass);
    localStorage.removeItem(STORAGE_KEYS.FAILED_ATTEMPTS);
    localStorage.removeItem(STORAGE_KEYS.LOCKOUT_UNTIL);

    this.addAuditLog("PIN_RESET", "Password successfully reset via Security PIN");
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

  static addAuditLog(action: SecurityAuditLog["action"], details: string): void {
    if (!this.isBrowser()) return;
    try {
      const logs = this.getAuditLogs();
      const newLog: SecurityAuditLog = {
        id: "log_" + Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleString("en-US", { timeZone: "America/Toronto" }),
        action,
        ipAddress: "127.0.0.1 (Localhost)",
        userAgent: navigator.userAgent.substring(0, 45) + "...",
        details,
      };
      const updated = [newLog, ...logs.slice(0, 49)];
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }
}
