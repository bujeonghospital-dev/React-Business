import React from "react";
import { SurgeryScheduleData } from "@/utils/googleSheets";
import "./SurgeryDetailsModal.css";

interface SurgeryDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  surgeries: SurgeryScheduleData[];
  date: number;
  month: number;
  year: number;
  contactPerson: string;
  tableType?: "P" | "L"; // P = วันที่ได้นัดผ่าตัด, L = วันที่ผ่าตัด
}

export default function SurgeryDetailsModal({
  isOpen,
  onClose,
  surgeries,
  date,
  month,
  year,
  contactPerson,
  tableType = "P",
}: SurgeryDetailsModalProps) {
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

  const tableTitle =
    tableType === "P" ? "รายละเอียดนัดผ่าตัด" : "รายละเอียดผ่าตัดจริง";

  const formatCurrency = (amount: string) => {
    if (!amount) return "-";
    const num = parseFloat(amount.replace(/,/g, ""));
    if (isNaN(num)) return amount;
    return num.toLocaleString("th-TH", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{tableTitle}</h2>
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
            <span className="info-label">จำนวนนัด:</span>
            <span className="info-value highlight">
              {surgeries.length} รายการ
            </span>
          </div>
        </div>

        <div className="surgeries-list">
          {surgeries.map((surgery, index) => (
            <div key={index} className="surgery-card">
              <div className="card-header">
                <span className="card-number">#{index + 1}</span>
                <span className="card-name">{surgery.ชื่อ}</span>
              </div>

              <div className="card-body">
                <div className="detail-row">
                  <span className="detail-icon">👨‍⚕️</span>
                  <span className="detail-label">หมอ:</span>
                  <span className="detail-value">{surgery.หมอ || "-"}</span>
                </div>

                <div className="detail-row">
                  <span className="detail-icon">👤</span>
                  <span className="detail-label">ผู้ติดต่อ:</span>
                  <span className="detail-value">
                    {surgery.ผู้ติดต่อ || "-"}
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-icon">📞</span>
                  <span className="detail-label">เบอร์โทร:</span>
                  <span className="detail-value">
                    {surgery.เบอร์โทร || "-"}
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-icon">📅</span>
                  <span className="detail-label">
                    {tableType === "P" ? "วันที่นัด:" : "วันที่ผ่าตัด:"}
                  </span>
                  <span className="detail-value">
                    {tableType === "P"
                      ? surgery.วันที่ได้นัดผ่าตัด || "-"
                      : surgery.วันที่ผ่าตัด || "-"}
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-icon">🕐</span>
                  <span className="detail-label">เวลาที่นัด:</span>
                  <span className="detail-value">
                    {surgery.เวลาที่นัด || "-"}
                  </span>
                </div>

                <div className="detail-row highlight-row">
                  <span className="detail-icon">💰</span>
                  <span className="detail-label">ยอดนำเสนอ:</span>
                  <span className="detail-value amount">
                    {surgery.ยอดนำเสนอ
                      ? `${formatCurrency(surgery.ยอดนำเสนอ)} บาท`
                      : "-"}
                  </span>
                </div>
              </div>
            </div>
          ))}
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
