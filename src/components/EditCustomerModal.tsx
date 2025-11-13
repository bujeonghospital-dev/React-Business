"use client";

import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";

interface CustomerData {
  [key: string]: any;
}

interface EditCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerData: CustomerData;
  onSave: (data: CustomerData) => void;
}

export const EditCustomerModal = ({
  isOpen,
  onClose,
  customerData: initialData,
  onSave,
}: EditCustomerModalProps) => {
  const [customerData, setCustomerData] = useState<CustomerData>({});

  useEffect(() => {
    if (initialData) {
      setCustomerData({ ...initialData });
    }
  }, [initialData, isOpen]);

  const handleFieldChange = (fieldName: string, value: any) => {
    setCustomerData({
      ...customerData,
      [fieldName]: value,
    });
  };

  const handleSave = () => {
    onSave(customerData);
    onClose();
  };

  if (!isOpen) return null;

  // ฟิลด์แถวที่ 1: ข้อมูลพื้นฐาน (สีฟ้า)
  const basicInfoFields = [
    { value: "ชื่อ", label: "ชื่อ", color: "bg-cyan-500" },
    { value: "รหัสลูกค้า", label: "รหัสลูกค้า", color: "bg-cyan-500" },
    { value: "เบอร์โทร", label: "เบอร์โทร", color: "bg-cyan-500" },
  ];

  // ฟิลด์แถวที่ 2: ข้อมูลเพิ่มเติม (สีฟ้า)
  const additionalInfoFields = [
    { value: "สถานะ", label: "สถานะ", color: "bg-cyan-500" },
    {
      value: "  แหล่งที่มา",
      label: "แหล่งที่มา",
      color: "bg-cyan-500",
    },
    {
      value: " ผลิตภัณฑ์ที่สนใจ",
      label: "ผลิตภัณฑ์ที่สนใจ",
      color: "bg-cyan-500",
    },
    { value: "ติดดาว", label: "ติดดาว", color: "bg-cyan-500" },
    { value: "ประเทศ", label: "ประเทศ", color: "bg-cyan-500" },
  ];

  // ตรวจสอบว่าข้อมูลมีฟิลด์ไหนจริง และใช้ชื่อที่ถูกต้อง
  const getActualFieldName = (fieldValue: string) => {
    // หาชื่อฟิลด์จริงจากข้อมูล
    const keys = Object.keys(customerData);
    const trimmedFieldValue = fieldValue.trim();

    // หาฟิลด์ที่ตรงกัน (ไม่คำนึงถึงช่องว่าง)
    const actualField = keys.find(
      (key) => key.trim().toLowerCase() === trimmedFieldValue.toLowerCase()
    );

    return actualField || fieldValue;
  };

  // ฟิลด์แถวที่ 3: ติดต่อและติดตาม (สีฟ้า)
  const contactFollowUpFields = [
    { value: "ผู้ติดต่อ", label: "ผู้ติดต่อ", color: "bg-cyan-500" },
    {
      value: "วันที่ติดตามครั้งล่าสุด",
      label: "วันที่ติดตามครั้งล่าสุด",
      color: "bg-cyan-500",
    },
    {
      value: "วันที่ติดตามครั้งถัดไป",
      label: "วันที่ติดตามครั้งถัดไป",
      color: "bg-cyan-500",
    },
  ];

  // ฟิลด์แถวที่ 4: Consult (สีแดง 3 + สีฟ้า 1)
  const consultFields = [
    {
      value: "วันที่ได้ชื่อ เบอร์ ",
      label: "วันที่ได้ชื่อ เบอร์",
      color: "bg-red-600",
    },
    {
      value: "วันที่ได้นัด consult",
      label: "วันที่ได้นัด consult",
      color: "bg-red-600",
    },
    {
      value: "  วันที่ Consult",
      label: "วันที่ Consult",
      color: "bg-red-600",
    },
    { value: "ยอดนำเสนอ", label: "ยอดนำเสนอ", color: "bg-cyan-500" },
  ];

  // ฟิลด์แถวที่ 5: ผ่าตัด (สีแดง 3 + สีฟ้า 1)
  const surgeryFields = [
    {
      value: "วันที่ได้นัดผ่าตัด",
      label: "วันที่ได้นัดผ่าตัด",
      color: "bg-red-600",
    },
    { value: "วันที่ผ่าตัด", label: "วันที่ผ่าตัด", color: "bg-red-600" },
    { value: "เวลาที่นัด", label: "เวลาที่นัด", color: "bg-red-600" },
    { value: "หมอ", label: "หมอ", color: "bg-cyan-500" },
  ];

  // ฟิลด์เพิ่มเติม
  const extraFields = [
    { value: "เวลาให้เรียกรถ", label: "เวลาให้เรียกรถ", color: "bg-cyan-500" },
    { value: "Lat", label: "Lat", color: "bg-cyan-500" },
    { value: "Long", label: "Long", color: "bg-cyan-500" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto w-full max-w-4xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center z-10">
          <h1 className="text-2xl font-bold text-gray-800">
            แก้ไขข้อมูลลูกค้า
          </h1>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* Section 1: ข้อมูลพื้นฐาน */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              ข้อมูลพื้นฐาน
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {basicInfoFields.map((field) => {
                const actualFieldName = getActualFieldName(field.value);
                return (
                  <div key={field.value}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={customerData[actualFieldName] || ""}
                      onChange={(e) =>
                        handleFieldChange(actualFieldName, e.target.value)
                      }
                      className="w-full px-4 py-2 border border-cyan-300 bg-cyan-50 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: ข้อมูลเพิ่มเติม */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              ข้อมูลเพิ่มเติม
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {additionalInfoFields.map((field) => {
                const actualFieldName = getActualFieldName(field.value);
                return (
                  <div key={field.value}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={customerData[actualFieldName] || ""}
                      onChange={(e) =>
                        handleFieldChange(actualFieldName, e.target.value)
                      }
                      className="w-full px-4 py-2 border border-cyan-300 bg-cyan-50 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: ติดต่อและติดตาม */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              ติดต่อและติดตาม
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {contactFollowUpFields.map((field) => {
                const actualFieldName = getActualFieldName(field.value);
                return (
                  <div key={field.value}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={customerData[actualFieldName] || ""}
                      onChange={(e) =>
                        handleFieldChange(actualFieldName, e.target.value)
                      }
                      className="w-full px-4 py-2 border border-cyan-300 bg-cyan-50 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: สถานะ Consult */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              สถานะ Consult
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {consultFields.map((field) => {
                const actualFieldName = getActualFieldName(field.value);
                return (
                  <div key={field.value}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={customerData[actualFieldName] || ""}
                      onChange={(e) =>
                        handleFieldChange(actualFieldName, e.target.value)
                      }
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none ${
                        field.color === "bg-red-600"
                          ? "border-red-300 bg-red-50 focus:ring-red-500"
                          : "border-cyan-300 bg-cyan-50 focus:ring-cyan-500"
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 5: สถานะผ่าตัด */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              สถานะผ่าตัด
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {surgeryFields.map((field) => {
                const actualFieldName = getActualFieldName(field.value);
                return (
                  <div key={field.value}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={customerData[actualFieldName] || ""}
                      onChange={(e) =>
                        handleFieldChange(actualFieldName, e.target.value)
                      }
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none ${
                        field.color === "bg-red-600"
                          ? "border-red-300 bg-red-50 focus:ring-red-500"
                          : "border-cyan-300 bg-cyan-50 focus:ring-cyan-500"
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 6: ข้อมูลเพิ่มเติม (Location) */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              ข้อมูลเพิ่มเติม
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {extraFields.map((field) => {
                const actualFieldName = getActualFieldName(field.value);
                return (
                  <div key={field.value}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={customerData[actualFieldName] || ""}
                      onChange={(e) =>
                        handleFieldChange(actualFieldName, e.target.value)
                      }
                      className="w-full px-4 py-2 border border-cyan-300 bg-cyan-50 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 7: หมายเหตุ */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              หมายเหตุ
            </h2>
            <textarea
              value={customerData["หมายเหตุ"] || ""}
              onChange={(e) => handleFieldChange("หมายเหตุ", e.target.value)}
              className="w-full px-4 py-2 border border-yellow-400 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none min-h-[150px] bg-yellow-50"
              placeholder="พิมพ์หมายเหตุ..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
          >
            <Save className="w-4 h-4" />
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
};
