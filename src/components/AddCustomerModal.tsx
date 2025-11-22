"use client";
import { useState, useEffect } from "react";
import { X, Save, Loader2, Plus } from "lucide-react";
import { NotificationPopup } from "./NotificationPopup";

interface CustomerData {
  [key: string]: any;
}
interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CustomerData) => void;
}
export const AddCustomerModal = ({
  isOpen,
  onClose,
  onSave,
}: AddCustomerModalProps) => {
  const [customerData, setCustomerData] = useState<CustomerData>({});
  const [statusOptions, setStatusOptions] = useState<
    Array<{ value: string; label: string; color: string }>
  >([]);
  const [sourceOptions, setSourceOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [productOptions, setProductOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [countryOptions, setCountryOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  const fetchStatusOptions = async () => {
    try {
      const response = await fetch("/api/status-options");
      const result = await response.json();
      if (result.success && result.data) {
        setStatusOptions(result.data);
      } else {
        // Use fallback data when database is not accessible
        setStatusOptions([
          {
            value: "ติดตามต่อเนื่อง",
            label: "ติดตามต่อเนื่อง",
            color: "#FFD700",
          },
          { value: "ปิดการขาย", label: "ปิดการขาย", color: "#90EE90" },
          { value: "ยกเลิก", label: "ยกเลิก", color: "#FFB6C1" },
          { value: "รอตอบกลับ", label: "รอตอบกลับ", color: "#87CEEB" },
          {
            value: "ได้นัด Consult",
            label: "ได้นัด Consult",
            color: "#FFA500",
          },
          { value: "ได้นัดผ่าตัด", label: "ได้นัดผ่าตัด", color: "#FF6347" },
          { value: "ผ่าตัดแล้ว", label: "ผ่าตัดแล้ว", color: "#32CD32" },
        ]);
      }
    } catch (error) {
      console.error("Error fetching status options:", error);
      // Use fallback data on network error
      setStatusOptions([
        {
          value: "ติดตามต่อเนื่อง",
          label: "ติดตามต่อเนื่อง",
          color: "#FFD700",
        },
        { value: "ปิดการขาย", label: "ปิดการขาย", color: "#90EE90" },
        { value: "ยกเลิก", label: "ยกเลิก", color: "#FFB6C1" },
        { value: "รอตอบกลับ", label: "รอตอบกลับ", color: "#87CEEB" },
        { value: "ได้นัด Consult", label: "ได้นัด Consult", color: "#FFA500" },
        { value: "ได้นัดผ่าตัด", label: "ได้นัดผ่าตัด", color: "#FF6347" },
        { value: "ผ่าตัดแล้ว", label: "ผ่าตัดแล้ว", color: "#32CD32" },
      ]);
    }
  };

  const fetchSourceOptions = async () => {
    try {
      const response = await fetch("/api/source-options");
      const result = await response.json();
      if (result.success && result.data) {
        setSourceOptions(result.data);
      } else {
        // Use fallback data
        setSourceOptions([
          { value: "Facebook", label: "Facebook" },
          { value: "Instagram", label: "Instagram" },
          { value: "Google Ads", label: "Google Ads" },
          { value: "Line", label: "Line" },
          { value: "Walk-in", label: "Walk-in" },
          { value: "Referral", label: "Referral" },
        ]);
      }
    } catch (error) {
      console.error("Error fetching source options:", error);
      // Use fallback data
      setSourceOptions([
        { value: "Facebook", label: "Facebook" },
        { value: "Instagram", label: "Instagram" },
        { value: "Google Ads", label: "Google Ads" },
        { value: "Line", label: "Line" },
        { value: "Walk-in", label: "Walk-in" },
        { value: "Referral", label: "Referral" },
      ]);
    }
  };

  const fetchProductOptions = async () => {
    try {
      const response = await fetch("/api/product-options");
      const result = await response.json();
      if (result.success && result.data) {
        setProductOptions(result.data);
      } else {
        // Use fallback data
        setProductOptions([
          { value: "ตีตัวไล่ตัว", label: "ตีตัวไล่ตัว" },
          { value: "Sub brow lift", label: "Sub brow lift" },
          { value: "แก้ตาหมื่อตอนและแก้ว", label: "แก้ตาหมื่อตอนและแก้ว" },
          { value: "ตาสองชั้น", label: "ตาสองชั้น" },
          { value: "เสริมจมูก", label: "เสริมจมูก" },
          { value: "แก้จมูก", label: "แก้จมูก" },
          { value: "เสริมตาขาว", label: "เสริมตาขาว" },
          { value: "ลิฟหน้า", label: "ลิฟหน้า" },
          { value: "Skin", label: "Skin" },
        ]);
      }
    } catch (error) {
      console.error("Error fetching product options:", error);
      // Use fallback data
      setProductOptions([
        { value: "ตีตัวไล่ตัว", label: "ตีตัวไล่ตัว" },
        { value: "Sub brow lift", label: "Sub brow lift" },
        { value: "แก้ตาหมื่อตอนและแก้ว", label: "แก้ตาหมื่อตอนและแก้ว" },
        { value: "ตาสองชั้น", label: "ตาสองชั้น" },
        { value: "เสริมจมูก", label: "เสริมจมูก" },
        { value: "แก้จมูก", label: "แก้จมูก" },
        { value: "เสริมตาขาว", label: "เสริมตาขาว" },
        { value: "ลิฟหน้า", label: "ลิฟหน้า" },
        { value: "Skin", label: "Skin" },
      ]);
    }
  };

  const fetchCountryOptions = async () => {
    try {
      const response = await fetch("/api/country-options");
      const result = await response.json();
      if (result.success && result.data) {
        setCountryOptions(result.data);
      } else {
        // Use fallback data
        setCountryOptions([
          { value: "ไทย", label: "ไทย" },
          { value: "จีน", label: "จีน" },
          { value: "ญี่ปุ่น", label: "ญี่ปุ่น" },
          { value: "เกาหลี", label: "เกาหลี" },
          { value: "สิงคโปร์", label: "สิงคโปร์" },
          { value: "มาเลเซีย", label: "มาเลเซีย" },
          { value: "อื่นๆ", label: "อื่นๆ" },
        ]);
      }
    } catch (error) {
      console.error("Error fetching country options:", error);
      // Use fallback data
      setCountryOptions([
        { value: "ไทย", label: "ไทย" },
        { value: "จีน", label: "จีน" },
        { value: "ญี่ปุ่น", label: "ญี่ปุ่น" },
        { value: "เกาหลี", label: "เกาหลี" },
        { value: "สิงคโปร์", label: "สิงคโปร์" },
        { value: "มาเลเซีย", label: "มาเลเซีย" },
        { value: "อื่นๆ", label: "อื่นๆ" },
      ]);
    }
  };
  useEffect(() => {
    if (isOpen) {
      // Reset form when opening
      setCustomerData({});
      fetchStatusOptions();
      fetchSourceOptions();
      fetchProductOptions();
      fetchCountryOptions();
    }
  }, [isOpen]);
  const handleFieldChange = (fieldName: string, value: any) => {
    setCustomerData({
      ...customerData,
      [fieldName]: value,
    });
  };
  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/customer-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "create",
          data: customerData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setNotification({
          isOpen: true,
          type: "success",
          title: "✨ เพิ่มข้อมูลสำเร็จ!",
          message: "ข้อมูลลูกค้าใหม่ได้รับการเพิ่มเรียบร้อยแล้ว",
        });

        // Wait for notification to display then close
        setTimeout(() => {
          setNotification((prev) => ({ ...prev, isOpen: false }));
          setTimeout(() => {
            onSave(customerData);
            onClose();
          }, 300); // Wait for fade out animation
        }, 2000); // Show notification for 2 seconds
      } else {
        setNotification({
          isOpen: true,
          type: "error",
          title: "❌ เพิ่มข้อมูลไม่สำเร็จ!",
          message:
            result.error ||
            "เกิดข้อผิดพลาดในการเพิ่มข้อมูล กรุณาลองใหม่อีกครั้ง",
        });
        setTimeout(() => {
          setNotification((prev) => ({ ...prev, isOpen: false }));
        }, 3000);
      }
    } catch (error) {
      setNotification({
        isOpen: true,
        type: "error",
        title: "❌ เพิ่มข้อมูลไม่สำเร็จ!",
        message:
          "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต",
      });
      setTimeout(() => {
        setNotification((prev) => ({ ...prev, isOpen: false }));
      }, 3000);
    } finally {
      setIsLoading(false);
    }
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
      value: "แหล่งที่มา",
      label: "แหล่งที่มา",
      color: "bg-cyan-500",
    },
    {
      value: "ผลิตภัณฑ์ที่สนใจ",
      label: "ผลิตภัณฑ์ที่สนใจ",
      color: "bg-cyan-500",
    },
    { value: "ติดดาว", label: "ติดดาว", color: "bg-cyan-500" },
    { value: "ประเทศ", label: "ประเทศ", color: "bg-cyan-500" },
  ];
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
      value: "วันที่ได้ชื่อ เบอร์",
      label: "วันที่ได้ชื่อ เบอร์",
      color: "bg-red-600",
    },
    {
      value: "วันที่ได้นัด consult",
      label: "วันที่ได้นัด consult",
      color: "bg-red-600",
    },
    {
      value: "วันที่ Consult",
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
    {
      value: "เวลาให้เรียกรถ",
      label: "เวลาให้เรียกรถ",
      color: "bg-cyan-500",
      isTime: true,
    },
    { value: "Lat", label: "Lat", color: "bg-cyan-500", isTime: false },
    { value: "Long", label: "Long", color: "bg-cyan-500", isTime: false },
  ];
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto w-full max-w-4xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center z-10">
          <h1 className="text-2xl font-bold text-gray-800">
            เพิ่มข้อมูลลูกค้าใหม่
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
                return (
                  <div key={field.value}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={customerData[field.value] || ""}
                      onChange={(e) =>
                        handleFieldChange(field.value, e.target.value)
                      }
                      className="w-full px-4 py-2 border border-cyan-300 bg-cyan-50 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-gray-900 font-medium placeholder:text-gray-500"
                      placeholder={`กรอก${field.label}`}
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
                // Special handling for สถานะ field - use dropdown with colors
                if (field.label === "สถานะ") {
                  const selectedStatus = statusOptions.find(
                    (opt) => opt.value === customerData[field.value]
                  );
                  return (
                    <div key={field.value}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label} ⭐
                      </label>
                      <select
                        value={customerData[field.value] || ""}
                        onChange={(e) =>
                          handleFieldChange(field.value, e.target.value)
                        }
                        className="w-full px-4 py-2 border border-indigo-300 bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                        style={{
                          backgroundColor: selectedStatus?.color
                            ? `${selectedStatus.color}15`
                            : "white",
                        }}
                      >
                        <option value="">เลือกสถานะ</option>
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {selectedStatus && (
                        <div className="mt-2">
                          <span
                            className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-black shadow-sm"
                            style={{ backgroundColor: selectedStatus.color }}
                          >
                            {selectedStatus.label}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                }

                // Special handling for แหล่งที่มา field - use dropdown
                if (field.label === "แหล่งที่มา") {
                  return (
                    <div key={field.value}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label} ⭐
                      </label>
                      <select
                        value={customerData[field.value] || ""}
                        onChange={(e) =>
                          handleFieldChange(field.value, e.target.value)
                        }
                        className="w-full px-4 py-2 border border-cyan-300 bg-cyan-50 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none font-medium text-gray-900"
                      >
                        <option value="">เลือกแหล่งที่มา</option>
                        {sourceOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }

                // Special handling for ผลิตภัณฑ์ที่สนใจ field - use dropdown
                if (field.label === "ผลิตภัณฑ์ที่สนใจ") {
                  return (
                    <div key={field.value}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label} ⭐
                      </label>
                      <select
                        value={customerData[field.value] || ""}
                        onChange={(e) =>
                          handleFieldChange(field.value, e.target.value)
                        }
                        className="w-full px-4 py-2 border border-cyan-300 bg-cyan-50 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none font-medium text-gray-900"
                      >
                        <option value="">เลือกผลิตภัณฑ์</option>
                        {productOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }

                // Special handling for ประเทศ field - use dropdown
                if (field.label === "ประเทศ") {
                  return (
                    <div key={field.value}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label} ⭐
                      </label>
                      <select
                        value={customerData[field.value] || ""}
                        onChange={(e) =>
                          handleFieldChange(field.value, e.target.value)
                        }
                        className="w-full px-4 py-2 border border-cyan-300 bg-cyan-50 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none font-medium text-gray-900"
                      >
                        <option value="">เลือกประเทศ</option>
                        {countryOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }

                return (
                  <div key={field.value}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={customerData[field.value] || ""}
                      onChange={(e) =>
                        handleFieldChange(field.value, e.target.value)
                      }
                      className="w-full px-4 py-2 border border-cyan-300 bg-cyan-50 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-gray-900 font-medium placeholder:text-gray-500"
                      placeholder={`กรอก${field.label}`}
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
                const isDateField = field.label.includes("วันที่");

                if (field.label === "ผู้ติดต่อ") {
                  return (
                    <div key={field.value}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}
                      </label>
                      <input
                        type="text"
                        value={customerData[field.value] || ""}
                        onChange={(e) =>
                          handleFieldChange(field.value, e.target.value)
                        }
                        className="w-full px-4 py-2 border border-cyan-300 bg-cyan-50 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-gray-900 font-medium placeholder:text-gray-500"
                        placeholder={`กรอก${field.label}`}
                      />
                    </div>
                  );
                }

                return (
                  <div key={field.value}>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <span>📅</span>
                      {field.label}
                    </label>
                    <input
                      type="date"
                      value={customerData[field.value] || ""}
                      onChange={(e) =>
                        handleFieldChange(field.value, e.target.value)
                      }
                      className="w-full px-4 py-2 border border-cyan-300 bg-cyan-50 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-gray-900 font-medium hover:border-cyan-400 transition-colors cursor-pointer"
                      style={{
                        colorScheme: "light",
                      }}
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
                const isDateField = field.label.includes("วันที่");
                const isAmountField = field.label === "ยอดนำเสนอ";

                return (
                  <div key={field.value}>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      {isDateField && <span>📅</span>}
                      {isAmountField && <span>💰</span>}
                      {field.label}
                    </label>
                    <input
                      type={isDateField ? "date" : "text"}
                      value={customerData[field.value] || ""}
                      onChange={(e) =>
                        handleFieldChange(field.value, e.target.value)
                      }
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none text-gray-900 font-medium placeholder:text-gray-500 transition-colors ${
                        field.color === "bg-red-600"
                          ? "border-red-300 bg-red-50 focus:ring-red-500 hover:border-red-400"
                          : "border-cyan-300 bg-cyan-50 focus:ring-cyan-500 hover:border-cyan-400"
                      } ${isDateField ? "cursor-pointer" : ""}`}
                      style={isDateField ? { colorScheme: "light" } : {}}
                      placeholder={!isDateField ? `กรอก${field.label}` : ""}
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
                const isDateField = field.label.includes("วันที่");
                const isTimeField = field.label.includes("เวลา");
                const isDoctorField = field.label === "หมอ";

                return (
                  <div key={field.value}>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      {isDateField && <span>📅</span>}
                      {isTimeField && <span>⏰</span>}
                      {isDoctorField && <span>👨‍⚕️</span>}
                      {field.label}
                    </label>
                    <input
                      type={
                        isDateField ? "date" : isTimeField ? "time" : "text"
                      }
                      value={customerData[field.value] || ""}
                      onChange={(e) =>
                        handleFieldChange(field.value, e.target.value)
                      }
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none text-gray-900 font-medium placeholder:text-gray-500 transition-colors ${
                        field.color === "bg-red-600"
                          ? "border-red-300 bg-red-50 focus:ring-red-500 hover:border-red-400"
                          : "border-cyan-300 bg-cyan-50 focus:ring-cyan-500 hover:border-cyan-400"
                      } ${isDateField || isTimeField ? "cursor-pointer" : ""}`}
                      style={
                        isDateField || isTimeField
                          ? { colorScheme: "light" }
                          : {}
                      }
                      placeholder={
                        !isDateField && !isTimeField ? `กรอก${field.label}` : ""
                      }
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
                return (
                  <div key={field.value}>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      {field.isTime && <span>⏰</span>}
                      {field.label === "Lat" && <span>📍</span>}
                      {field.label === "Long" && <span>📍</span>}
                      {field.label}
                    </label>
                    <input
                      type={field.isTime ? "time" : "text"}
                      value={customerData[field.value] || ""}
                      onChange={(e) =>
                        handleFieldChange(field.value, e.target.value)
                      }
                      className={`w-full px-4 py-2 border border-cyan-300 bg-cyan-50 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-gray-900 font-medium placeholder:text-gray-500 hover:border-cyan-400 transition-colors ${
                        field.isTime ? "cursor-pointer" : ""
                      }`}
                      style={field.isTime ? { colorScheme: "light" } : {}}
                      placeholder={!field.isTime ? `กรอก${field.label}` : ""}
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
              className="w-full px-4 py-2 border border-yellow-400 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none min-h-[150px] bg-yellow-50 text-gray-900 font-medium placeholder:text-gray-500"
              placeholder="พิมพ์หมายเหตุ..."
            />
          </div>
        </div>
        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                กำลังเพิ่มข้อมูล...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                เพิ่มข้อมูล
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notification Popup */}
      <NotificationPopup
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </div>
  );
};
