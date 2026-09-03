import { AdminAuthService } from "./adminAuth";

export interface BannedRecord {
  ip: string;
  bannedAt: number;
  bannedUntil: number; // 1 hour timestamp
  reason: string;
  formType: string;
}

interface SubmissionLog {
  timestamp: number;
  formType: string;
}

const STORAGE_KEYS = {
  BANNED_IPS: "toronto_cafe_banned_ips",
  SUBMISSION_LOGS: "toronto_cafe_ip_submission_logs",
  CACHED_IP: "toronto_cafe_cached_client_ip",
  DEVICE_FP: "toronto_cafe_device_fingerprint",
};

// 1 Hour Ban in milliseconds (60 minutes * 60 seconds * 1000 ms)
const BAN_DURATION_MS = 60 * 60 * 1000;

// Continuous spam limits:
// 3 submissions in 60 seconds OR 5 submissions in 3 minutes -> 1-HOUR BAN
const WINDOW_FAST_MS = 60 * 1000; // 1 minute
const MAX_FAST_SUBMISSIONS = 3;

const WINDOW_SLOW_MS = 3 * 60 * 1000; // 3 minutes
const MAX_SLOW_SUBMISSIONS = 5;

let inMemoryCachedIp: string | null = null;

export class IpRateLimiter {
  private static isBrowser(): boolean {
    return typeof window !== "undefined";
  }

  /**
   * Get or generate a local device fingerprint fallback
   */
  private static getDeviceFingerprint(): string {
    if (!this.isBrowser()) return "127.0.0.1";
    let fp = localStorage.getItem(STORAGE_KEYS.DEVICE_FP);
    if (!fp) {
      fp = "client_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now().toString(36);
      localStorage.setItem(STORAGE_KEYS.DEVICE_FP, fp);
    }
    return fp;
  }

  /**
   * Fetch current public IP of the user
   */
  static async getClientIp(): Promise<string> {
    if (!this.isBrowser()) return "127.0.0.1";
    if (inMemoryCachedIp) return inMemoryCachedIp;

    const storedCached = sessionStorage.getItem(STORAGE_KEYS.CACHED_IP);
    if (storedCached) {
      inMemoryCachedIp = storedCached;
      return storedCached;
    }

    try {
      // 1. Try local server endpoint
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch("/api/client-ip", { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data.ip && data.ip !== "127.0.0.1") {
          inMemoryCachedIp = data.ip;
          sessionStorage.setItem(STORAGE_KEYS.CACHED_IP, data.ip);
          return data.ip;
        }
      }
    } catch {
      // ignore
    }

    try {
      // 2. Fallback to public ipify service
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch("https://api.ipify.org?format=json", { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data.ip) {
          inMemoryCachedIp = data.ip;
          sessionStorage.setItem(STORAGE_KEYS.CACHED_IP, data.ip);
          return data.ip;
        }
      }
    } catch {
      // ignore
    }

    // 3. Fallback to local device fingerprint identifier
    const fallback = this.getDeviceFingerprint();
    inMemoryCachedIp = fallback;
    return fallback;
  }

  /**
   * Get all currently banned IPs from storage
   */
  static getBannedList(): BannedRecord[] {
    if (!this.isBrowser()) return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.BANNED_IPS);
      if (!raw) return [];
      const list: BannedRecord[] = JSON.parse(raw);
      const now = Date.now();
      // Auto-expire bans older than 1 hour
      const active = list.filter((item) => item.bannedUntil > now);
      if (active.length !== list.length) {
        localStorage.setItem(STORAGE_KEYS.BANNED_IPS, JSON.stringify(active));
      }
      return active;
    } catch {
      return [];
    }
  }

  /**
   * Check if current user is banned
   */
  static async checkBanStatus(): Promise<{
    isBanned: boolean;
    ip: string;
    remainingMinutes: number;
    reason?: string;
  }> {
    const ip = await this.getClientIp();
    const bannedList = this.getBannedList();
    const record = bannedList.find((b) => b.ip === ip);

    if (record && record.bannedUntil > Date.now()) {
      const remainingMinutes = Math.max(1, Math.ceil((record.bannedUntil - Date.now()) / (60 * 1000)));
      return {
        isBanned: true,
        ip,
        remainingMinutes,
        reason: record.reason,
      };
    }

    return {
      isBanned: false,
      ip,
      remainingMinutes: 0,
    };
  }

  /**
   * Record a form submission attempt. If continuous spam is detected, ban IP for 1 hour.
   */
  static async recordSubmission(formType: string = "General Form"): Promise<{
    allowed: boolean;
    isBanned: boolean;
    remainingMinutes: number;
    error?: string;
  }> {
    if (!this.isBrowser()) return { allowed: true, isBanned: false, remainingMinutes: 0 };

    const ip = await this.getClientIp();
    const banCheck = await this.checkBanStatus();

    if (banCheck.isBanned) {
      return {
        allowed: false,
        isBanned: true,
        remainingMinutes: banCheck.remainingMinutes,
        error: `🚫 Security Alert: Continuous form submissions detected from your IP (${ip}). You have been banned for 1 hour. Time remaining: ${banCheck.remainingMinutes} minute(s).`,
      };
    }

    // Retrieve recent submissions log for this IP
    let logsMap: Record<string, SubmissionLog[]> = {};
    try {
      const rawLogs = localStorage.getItem(STORAGE_KEYS.SUBMISSION_LOGS);
      if (rawLogs) logsMap = JSON.parse(rawLogs);
    } catch {
      logsMap = {};
    }

    const now = Date.now();
    const existingLogs = logsMap[ip] || [];

    // Filter to last 3 minutes only
    const recentLogs = existingLogs.filter((l) => now - l.timestamp <= WINDOW_SLOW_MS);
    recentLogs.push({ timestamp: now, formType });
    logsMap[ip] = recentLogs;

    try {
      localStorage.setItem(STORAGE_KEYS.SUBMISSION_LOGS, JSON.stringify(logsMap));
    } catch {
      // ignore storage errors
    }

    // Check Rule 1: 3 or more submissions within 60 seconds
    const fastLogs = recentLogs.filter((l) => now - l.timestamp <= WINDOW_FAST_MS);

    let shouldBan = false;
    let banReason = "";

    if (fastLogs.length >= MAX_FAST_SUBMISSIONS) {
      shouldBan = true;
      banReason = `Triggered rapid spam threshold: ${fastLogs.length} submissions within 60 seconds on "${formType}".`;
    } else if (recentLogs.length >= MAX_SLOW_SUBMISSIONS) {
      shouldBan = true;
      banReason = `Triggered continuous spam threshold: ${recentLogs.length} submissions within 3 minutes on "${formType}".`;
    }

    if (shouldBan) {
      const bannedUntil = now + BAN_DURATION_MS; // 1 hour ban
      const bannedList = this.getBannedList();

      const newBan: BannedRecord = {
        ip,
        bannedAt: now,
        bannedUntil,
        reason: banReason,
        formType,
      };

      const updatedBans = [...bannedList.filter((b) => b.ip !== ip), newBan];
      localStorage.setItem(STORAGE_KEYS.BANNED_IPS, JSON.stringify(updatedBans));

      // Add to audit logs
      AdminAuthService.addAuditLog(
        "LOGIN_FAILED",
        `[ANTI-SPAM FIREWALL] IP ${ip} banned for 1 hour. ${banReason}`
      );

      // Trigger custom event so active forms react immediately
      window.dispatchEvent(
        new CustomEvent("toronto_cafe_ip_banned", {
          detail: { ip, remainingMinutes: 60, reason: banReason },
        })
      );

      return {
        allowed: false,
        isBanned: true,
        remainingMinutes: 60,
        error: `🚫 Security Alert: Continuous form submissions detected from your IP (${ip}). You have been banned for 1 hour. Time remaining: 60 minute(s).`,
      };
    }

    return {
      allowed: true,
      isBanned: false,
      remainingMinutes: 0,
    };
  }

  /**
   * Super Admin action: Manually unban an IP
   */
  static unbanIp(ip: string): void {
    if (!this.isBrowser()) return;
    const current = this.getBannedList();
    const filtered = current.filter((b) => b.ip !== ip);
    localStorage.setItem(STORAGE_KEYS.BANNED_IPS, JSON.stringify(filtered));

    // Also clear submission log history for this IP
    try {
      const rawLogs = localStorage.getItem(STORAGE_KEYS.SUBMISSION_LOGS);
      if (rawLogs) {
        const logsMap = JSON.parse(rawLogs);
        delete logsMap[ip];
        localStorage.setItem(STORAGE_KEYS.SUBMISSION_LOGS, JSON.stringify(logsMap));
      }
    } catch {
      // ignore
    }

    AdminAuthService.addAuditLog(
      "LOGOUT",
      `[ANTI-SPAM FIREWALL] Super Admin manually unbanned IP ${ip}`,
      "SUPER_ADMIN"
    );

    window.dispatchEvent(new CustomEvent("toronto_cafe_ip_unbanned", { detail: { ip } }));
  }

  /**
   * Super Admin action: Manually ban an IP for 1 hour
   */
  static manualBan(ip: string, reason = "Manually banned by Super Admin"): void {
    if (!this.isBrowser() || !ip) return;
    const current = this.getBannedList();
    const now = Date.now();
    const newBan: BannedRecord = {
      ip: ip.trim(),
      bannedAt: now,
      bannedUntil: now + BAN_DURATION_MS,
      reason,
      formType: "Manual Admin Block",
    };
    const updated = [...current.filter((b) => b.ip !== ip.trim()), newBan];
    localStorage.setItem(STORAGE_KEYS.BANNED_IPS, JSON.stringify(updated));

    AdminAuthService.addAuditLog(
      "LOGIN_FAILED",
      `[ANTI-SPAM FIREWALL] Super Admin manually banned IP ${ip} for 1 hour`,
      "SUPER_ADMIN"
    );
  }
}
