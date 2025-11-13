/**
 * Yalecom API Types
 * ระบบ Webhook และ API สำหรับ Yalecom Integration
 */

// ==================== Webhook Types ====================

export interface YalecomWebhookPayload {
  call_id?: string;
  caller_number?: string; // เบอร์คนโทรเข้า
  callee_number?: string; // เบอร์ที่รับสาย (Queue Extension)
  queue_name?: string;
  queue_extension?: string;
  agent_id?: string;
  agent_name?: string;
  call_status?: string;
  timestamp?: string;
  direction?: "inbound" | "outbound";
  event_type?: "call_started" | "call_answered" | "call_ended" | "call_ringing";
}

// ==================== Robocall Types ====================

export interface RobocallRequest {
  phone_number: string;
  agent_id?: string;
  campaign_name?: string;
  message?: string;
  callback_url?: string; // URL สำหรับรับ callback เมื่อโทรสำเร็จ
}

export interface RobocallResponse {
  call_id: string;
  status: "กำลังดำเนินการ" | "สำเร็จ" | "ล้มเหลว";
  phone_number: string;
  timestamp: string;
}

// ==================== Queue Status Types ====================

export interface YalecomAgent {
  agent_id: string;
  agent_name: string;
  agent_queue_status:
    | "Waiting" // รอสาย
    | "Ringing" // กำลังดังสาย
    | "InCall" // กำลังคุยสาย
    | "Inbound" // รับสายเข้า
    | "Outbound" // โทรออก
    | "Dialing" // กำลังโทร
    | "Busy" // ไลน์ไม่ว่าง
    | "Offline"; // ออฟไลน์
  agent_outbound_callee_number: string; // เบอร์ที่โทรออกไป
  agent_queue_caller_number: string; // เบอร์ที่โทรเข้ามา
}

export interface YalecomQueueStatus {
  queue_name: string;
  queue_extension: string;
  waiting_calls_in_queue: number;
  agents: YalecomAgent[];
}

// ==================== Contact Record Types ====================

export interface ContactRecord {
  id: string;
  name: string; // ชื่อ Agent หรือ ลูกค้า
  company: string; // ชื่อ Queue หรือ บริษัท
  phone: string; // เบอร์โทรศัพท์
  email: string;
  status: "outgoing" | "received" | "waiting" | "sale";
  lastContact: string; // ISO timestamp
  notes: string;
  createdAt: string; // ISO timestamp
}

// ==================== API Response Types ====================

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: string;
}

// ==================== Status Configuration ====================

export type StatusType = "outgoing" | "received" | "waiting" | "sale" | "all";

export interface StatusConfig {
  label: string;
  color: string;
  lightColor: string;
  textColor: string;
  borderColor: string;
  icon: any; // Lucide Icon Component
  gradient: string;
}

// ==================== Mapping Status ====================

/**
 * แมปสถานะจาก Yalecom API เป็นสถานะใน Dashboard
 */
export const mapAgentStatusToContactStatus = (
  agentStatus: YalecomAgent["agent_queue_status"]
): ContactRecord["status"] => {
  switch (agentStatus) {
    // โทรออก
    case "Outbound":
    case "Dialing":
      return "outgoing";

    // รอสาย
    case "Ringing":
    case "Waiting":
      return "waiting";

    // SALE ติดต่อ
    case "InCall":
    case "Inbound":
    case "Busy":
      return "sale";

    // กรณีอื่นๆ
    case "Offline":
    default:
      return "waiting";
  }
};

// ==================== Webhook Event Types ====================

export type WebhookEventType =
  | "call_started"
  | "call_answered"
  | "call_ended"
  | "call_ringing";

export type CallDirection = "inbound" | "outbound";

// ==================== Utility Types ====================

export interface WebhookVerification {
  signature: string;
  timestamp: string;
  secret: string;
}
