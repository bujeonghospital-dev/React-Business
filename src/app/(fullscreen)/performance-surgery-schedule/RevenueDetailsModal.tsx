import React from "react";
import { NClinicData } from "@/utils/databaseNClinic";
import { RevenueFutureData } from "@/utils/databaseRevenueFuture";
import "./SurgeryDetailsModal.css";
interface RevenueDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  nClinicData: NClinicData[];
  futureData: RevenueFutureData[];
  date: number;
  month: number;
  year: number;
  contactPerson: string;
}
export default function RevenueDetailsModal({
  isOpen,
  onClose,
  nClinicData,
  futureData,
  date,
  month,
  year,
  contactPerson,
}: RevenueDetailsModalProps) {
  if (!isOpen) return null;
  const monthNames = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];
  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return "-";
    return amount.toLocaleString("th-TH", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      const day = date.getDate();
      const month = date.getMonth();
      const year = date.getFullYear();
      return `${day} ${monthNames[month]} ${year + 543}`;
    } catch {
      return dateStr;
    }
  };
  // Calculate total revenue
  const totalRevenue =
    nClinicData.reduce((sum, item) => sum + (item.income || 0), 0) +
    futureData.reduce((sum, item) => sum + (item.proposed_amount || 0), 0);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>รายละเอียดประมาณการรายรับ</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-info">
          <div className="info-row">
            <span className="info-label">วันที่:</span>
            <span className="info-value">
              {date} {monthNames[month]} {year + 543}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">ผู้ติดต่อ:</span>
            <span className="info-value">{contactPerson}</span>
          </div>
          <div className="info-row">
            <span className="info-label">จำนวนรายการ:</span>
            <span className="info-value highlight">
              {nClinicData.length + futureData.length} รายการ
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">ยอดรวมทั้งหมด:</span>
            <span className="info-value highlight amount">
              {formatCurrency(totalRevenue)} บาท
            </span>
          </div>
        </div>
        <div className="surgeries-list">
          {/* N_Clinic Data (sale_date <= today) */}
          {nClinicData.length > 0 && (
            <div className="data-section">
              <h3 className="section-title">
                📊 ข้อมูลที่เสร็จแล้ว (N_Clinic) - {nClinicData.length} รายการ
              </h3>
              {nClinicData.map((item, index) => (
                <div key={`clinic-${index}`} className="surgery-card">
                  <div className="card-header">
                    <span className="card-number">#{index + 1}</span>
                    <span className="card-name">
                      {item.income_display_name || "ไม่ระบุ"}
                    </span>
                  </div>
                  <div className="card-body">
                    <div className="detail-row">
                      <span className="detail-icon">👤</span>
                      <span className="detail-label">ชื่อลูกค้า:</span>
                      <span className="detail-value">
                        {item.income_display_name || "-"}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-icon">👥</span>
                      <span className="detail-label">ผู้ติดต่อ:</span>
                      <span className="detail-value">
                        {item.staff_display_name || "-"}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-icon">📅</span>
                      <span className="detail-label">วันที่นัดผ่าตัด:</span>
                      <span className="detail-value">
                        {formatDate(item.income_date)}
                      </span>
                    </div>
                    <div className="detail-row highlight-row">
                      <span className="detail-icon">💰</span>
                      <span className="detail-label">ราคาที่เสนอ:</span>
                      <span className="detail-value amount">
                        {formatCurrency(item.income)} บาท
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Future Revenue Data (surgery_date >= today) */}
          {futureData.length > 0 && (
            <div className="data-section">
              <h3 className="section-title">
                📅 ข้อมูลนัดในอนาคต (Future Revenue) - {futureData.length}{" "}
                รายการ
              </h3>
              {futureData.map((item, index) => (
                <div key={`future-${index}`} className="surgery-card">
                  <div className="card-header">
                    <span className="card-number">
                      #{nClinicData.length + index + 1}
                    </span>
                    <span className="card-name">
                      {item.customer_name || "ไม่ระบุ"}
                    </span>
                  </div>
                  <div className="card-body">
                    <div className="detail-row">
                      <span className="detail-icon">👤</span>
                      <span className="detail-label">ชื่อลูกค้า:</span>
                      <span className="detail-value">
                        {item.customer_name || "-"}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-icon">👨‍⚕️</span>
                      <span className="detail-label">หมอ:</span>
                      <span className="detail-value">{item.doctor || "-"}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-icon">👥</span>
                      <span className="detail-label">ผู้ติดต่อ:</span>
                      <span className="detail-value">
                        {item.contact_staff || "-"}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-icon">📞</span>
                      <span className="detail-label">เบอร์โทร:</span>
                      <span className="detail-value">{item.phone || "-"}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-icon">📅</span>
                      <span className="detail-label">วันที่นัดผ่าตัด:</span>
                      <span className="detail-value">
                        {formatDate(item.surgery_date)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-icon">🕐</span>
                      <span className="detail-label">เวลานัด:</span>
                      <span className="detail-value">
                        {item.appointment_time || "-"}
                      </span>
                    </div>
                    <div className="detail-row highlight-row">
                      <span className="detail-icon">💰</span>
                      <span className="detail-label">ราคาที่เสนอ:</span>
                      <span className="detail-value amount">
                        {formatCurrency(item.proposed_amount)} บาท
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {nClinicData.length === 0 && futureData.length === 0 && (
            <div className="empty-state">
              <p>ไม่มีข้อมูลรายรับในวันนี้</p>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="close-footer-button" onClick={onClose}>
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
