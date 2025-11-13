import crypto from "crypto";

/**
 * Verify Yalecom Webhook Signature
 * ตรวจสอบความถูกต้องของ webhook request
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(payload);
    const calculatedSignature = hmac.digest("hex");

    // ใช้ timingSafeEqual เพื่อป้องกัน timing attacks
    const signatureBuffer = Buffer.from(signature, "hex");
    const calculatedBuffer = Buffer.from(calculatedSignature, "hex");

    return crypto.timingSafeEqual(
      new Uint8Array(signatureBuffer),
      new Uint8Array(calculatedBuffer)
    );
  } catch (error) {
    console.error("Error verifying webhook signature:", error);
    return false;
  }
}

/**
 * Generate Webhook Signature
 * สร้าง signature สำหรับทดสอบ webhook
 */
export function generateWebhookSignature(
  payload: string,
  secret: string
): string {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  return hmac.digest("hex");
}

/**
 * Format Phone Number
 * จัดรูปแบบเบอร์โทรศัพท์ให้เป็นมาตรฐาน
 */
export function formatPhoneNumber(phone: string): string {
  // ลบอักขระที่ไม่ใช่ตัวเลข
  const cleaned = phone.replace(/\D/g, "");

  // ถ้าขึ้นต้นด้วย 66 แปลงเป็น 0
  if (cleaned.startsWith("66")) {
    return "0" + cleaned.slice(2);
  }

  return cleaned;
}

/**
 * Validate Thai Phone Number
 * ตรวจสอบว่าเบอร์โทรเป็นเบอร์ไทยที่ถูกต้องหรือไม่
 */
export function validateThaiPhoneNumber(phone: string): boolean {
  const cleaned = formatPhoneNumber(phone);

  // เบอร์ไทยต้องขึ้นต้นด้วย 0 และมี 10 หลัก
  return /^0\d{9}$/.test(cleaned);
}

/**
 * Parse Webhook Timestamp
 * แปลง timestamp จาก webhook เป็น Date object
 */
export function parseWebhookTimestamp(timestamp?: string): Date {
  if (!timestamp) {
    return new Date();
  }

  try {
    return new Date(timestamp);
  } catch (error) {
    console.error("Error parsing timestamp:", error);
    return new Date();
  }
}

/**
 * Format Duration
 * จัดรูปแบบระยะเวลาเป็น "MM:SS" หรือ "HH:MM:SS"
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  return `${minutes.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

/**
 * Sanitize Contact Data
 * ทำความสะอาดข้อมูล contact ก่อนบันทึก
 */
export function sanitizeContactData(data: any) {
  return {
    ...data,
    phone: formatPhoneNumber(data.phone || ""),
    email: (data.email || "").toLowerCase().trim(),
    name: (data.name || "").trim(),
    company: (data.company || "").trim(),
    notes: (data.notes || "").trim(),
  };
}

/**
 * Check if agent is available
 * ตรวจสอบว่า agent พร้อมรับสายหรือไม่
 */
export function isAgentAvailable(status: string): boolean {
  return status === "Waiting" || status === "Available";
}

/**
 * Get call status emoji
 * ดึง emoji สำหรับแสดงสถานะการโทร
 */
export function getCallStatusEmoji(status: string): string {
  const emojiMap: Record<string, string> = {
    Waiting: "⏳",
    Ringing: "📞",
    InCall: "☎️",
    Inbound: "📲",
    Outbound: "📤",
    Dialing: "🔄",
    Busy: "🔴",
    Offline: "⚫",
  };

  return emojiMap[status] || "❓";
}

/**
 * Calculate call statistics
 * คำนวณสถิติการโทร
 */
export function calculateCallStats(contacts: any[]) {
  const total = contacts.length;
  const outgoing = contacts.filter((c) => c.status === "outgoing").length;
  const received = contacts.filter((c) => c.status === "received").length;
  const waiting = contacts.filter((c) => c.status === "waiting").length;
  const sale = contacts.filter((c) => c.status === "sale").length;

  return {
    total,
    outgoing,
    received,
    waiting,
    sale,
    outgoingRate: total > 0 ? (outgoing / total) * 100 : 0,
    receivedRate: total > 0 ? (received / total) * 100 : 0,
    waitingRate: total > 0 ? (waiting / total) * 100 : 0,
    saleRate: total > 0 ? (sale / total) * 100 : 0,
  };
}
