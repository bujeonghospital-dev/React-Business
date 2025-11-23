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
  const [contactPersonOptions] = useState<
    Array<{ value: string; label: string }>
  >([
    { value: "ว่าน", label: "ว่าน" },
    { value: "จีน", label: "จีน" },
    { value: "สา", label: "สา" },
    { value: "เจ", label: "เจ" },
    { value: "พิดยา", label: "พิดยา" },
    { value: "มุข", label: "มุข" },
  ]);
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
    // Prevent duplicate submissions
    if (isLoading) return;

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

        // Call onSave immediately to update parent state
        onSave(result.data || customerData);

        // Wait for notification to display then close
        setTimeout(() => {
          setNotification((prev) => ({ ...prev, isOpen: false }));
          setTimeout(() => {
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
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden w-full max-w-4xl animate-slideUp transform transition-all">
        {/* Header with Gradient */}
        <div className="sticky top-0 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 p-6 flex justify-between items-center z-10 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-xl backdrop-blur-sm">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">
              เพิ่มข้อมูลลูกค้าใหม่
            </h1>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-xl transition-all duration-200 group"
          >
            <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div
          className="overflow-y-auto"
          style={{ maxHeight: "calc(90vh - 180px)" }}
        >
          {/* Main Content */}
          <div className="p-6 space-y-6">
            {/* Section 1: ข้อมูลพื้นฐาน */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-100 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  ข้อมูลพื้นฐาน
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {basicInfoFields.map((field) => {
                  return (
                    <div key={field.value} className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-cyan-600">
                        {field.label}
                      </label>
                      <input
                        type="text"
                        value={customerData[field.value] || ""}
                        onChange={(e) =>
                          handleFieldChange(field.value, e.target.value)
                        }
                        className="w-full px-4 py-3 border-2 border-cyan-200 bg-white rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none text-gray-900 font-medium placeholder:text-gray-400 transition-all duration-200 hover:border-cyan-300 shadow-sm hover:shadow-md"
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
                      <div key={field.value} className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-indigo-600">
                          {field.label} ⭐
                        </label>
                        <select
                          value={customerData[field.value] || ""}
                          onChange={(e) =>
                            handleFieldChange(field.value, e.target.value)
                          }
                          className="w-full px-4 py-3 border-2 border-indigo-200 bg-gradient-to-r from-white to-indigo-50 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none font-semibold text-gray-900 transition-all duration-200 hover:border-indigo-300 shadow-sm hover:shadow-md cursor-pointer"
                          style={{
                            backgroundColor: selectedStatus?.color
                              ? `${selectedStatus.color}25`
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
                          <div className="mt-2 animate-fadeIn">
                            <span
                              className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-xs font-bold text-black shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                              style={{ backgroundColor: selectedStatus.color }}
                            >
                              ✓ {selectedStatus.label}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  }

                  // Special handling for แหล่งที่มา field - use dropdown
                  if (field.label === "แหล่งที่มา") {
                    return (
                      <div key={field.value} className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-cyan-600">
                          {field.label} ⭐
                        </label>
                        <select
                          value={customerData[field.value] || ""}
                          onChange={(e) =>
                            handleFieldChange(field.value, e.target.value)
                          }
                          className="w-full px-4 py-3 border-2 border-cyan-200 bg-gradient-to-r from-white to-cyan-50 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none font-semibold text-gray-900 transition-all duration-200 hover:border-cyan-300 shadow-sm hover:shadow-md cursor-pointer"
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
                      <div key={field.value} className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-cyan-600">
                          {field.label} ⭐
                        </label>
                        <select
                          value={customerData[field.value] || ""}
                          onChange={(e) =>
                            handleFieldChange(field.value, e.target.value)
                          }
                          className="w-full px-4 py-3 border-2 border-cyan-200 bg-gradient-to-r from-white to-cyan-50 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none font-semibold text-gray-900 transition-all duration-200 hover:border-cyan-300 shadow-sm hover:shadow-md cursor-pointer"
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
                      <div key={field.value} className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-cyan-600">
                          {field.label} ⭐
                        </label>
                        <select
                          value={customerData[field.value] || ""}
                          onChange={(e) =>
                            handleFieldChange(field.value, e.target.value)
                          }
                          className="w-full px-4 py-3 border-2 border-cyan-200 bg-gradient-to-r from-white to-cyan-50 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none font-semibold text-gray-900 transition-all duration-200 hover:border-cyan-300 shadow-sm hover:shadow-md cursor-pointer"
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
                    <div key={field.value} className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-cyan-600">
                        {field.label}
                      </label>
                      <input
                        type="text"
                        value={customerData[field.value] || ""}
                        onChange={(e) =>
                          handleFieldChange(field.value, e.target.value)
                        }
                        className="w-full px-4 py-3 border-2 border-cyan-200 bg-white rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none text-gray-900 font-medium placeholder:text-gray-400 transition-all duration-200 hover:border-cyan-300 shadow-sm hover:shadow-md"
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
                      <div key={field.value} className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-cyan-600">
                          {field.label} ⭐
                        </label>
                        <select
                          value={customerData[field.value] || ""}
                          onChange={(e) =>
                            handleFieldChange(field.value, e.target.value)
                          }
                          className="w-full px-4 py-3 border-2 border-cyan-200 bg-gradient-to-r from-white to-cyan-50 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none font-semibold text-gray-900 transition-all duration-200 hover:border-cyan-300 shadow-sm hover:shadow-md cursor-pointer"
                        >
                          <option value="">เลือกผู้ติดต่อ</option>
                          {contactPersonOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  }

                  return (
                    <div key={field.value} className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2 transition-colors group-focus-within:text-cyan-600">
                        <span className="text-lg">📅</span>
                        {field.label}
                      </label>
                      <input
                        type="date"
                        value={customerData[field.value] || ""}
                        onChange={(e) =>
                          handleFieldChange(field.value, e.target.value)
                        }
                        className="w-full px-4 py-3 border-2 border-cyan-200 bg-gradient-to-r from-white to-cyan-50 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none text-gray-900 font-semibold hover:border-cyan-300 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
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
            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border border-red-100 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-gradient-to-b from-red-500 to-pink-500 rounded-full"></div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  สถานะ Consult
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {consultFields.map((field) => {
                  const isDateField = field.label.includes("วันที่");
                  const isAmountField = field.label === "ยอดนำเสนอ";

                  return (
                    <div key={field.value} className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2 transition-colors group-focus-within:text-red-600">
                        {isDateField && <span className="text-lg">📅</span>}
                        {isAmountField && <span className="text-lg">💰</span>}
                        {field.label}
                      </label>
                      <input
                        type={isDateField ? "date" : "text"}
                        value={customerData[field.value] || ""}
                        onChange={(e) =>
                          handleFieldChange(field.value, e.target.value)
                        }
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:border-transparent outline-none text-gray-900 font-semibold placeholder:text-gray-400 transition-all duration-200 shadow-sm hover:shadow-md ${
                          field.color === "bg-red-600"
                            ? "border-red-200 bg-gradient-to-r from-white to-red-50 focus:ring-red-400 hover:border-red-300"
                            : "border-cyan-200 bg-gradient-to-r from-white to-cyan-50 focus:ring-cyan-400 hover:border-cyan-300"
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
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  สถานะผ่าตัด
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {surgeryFields.map((field) => {
                  const isDateField = field.label.includes("วันที่");
                  const isTimeField = field.label.includes("เวลา");
                  const isDoctorField = field.label === "หมอ";

                  return (
                    <div key={field.value} className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2 transition-colors group-focus-within:text-purple-600">
                        {isDateField && <span className="text-lg">📅</span>}
                        {isTimeField && <span className="text-lg">⏰</span>}
                        {isDoctorField && <span className="text-lg">👨‍⚕️</span>}
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
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:border-transparent outline-none text-gray-900 font-semibold placeholder:text-gray-400 transition-all duration-200 shadow-sm hover:shadow-md ${
                          field.color === "bg-red-600"
                            ? "border-purple-200 bg-gradient-to-r from-white to-purple-50 focus:ring-purple-400 hover:border-purple-300"
                            : "border-cyan-200 bg-gradient-to-r from-white to-cyan-50 focus:ring-cyan-400 hover:border-cyan-300"
                        } ${
                          isDateField || isTimeField ? "cursor-pointer" : ""
                        }`}
                        style={
                          isDateField || isTimeField
                            ? { colorScheme: "light" }
                            : {}
                        }
                        placeholder={
                          !isDateField && !isTimeField
                            ? `กรอก${field.label}`
                            : ""
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Section 6: ข้อมูลเพิ่มเติม (Location) */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-100 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-gradient-to-b from-teal-500 to-cyan-500 rounded-full"></div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  ข้อมูลเพิ่มเติม
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {extraFields.map((field) => {
                  return (
                    <div key={field.value} className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2 transition-colors group-focus-within:text-teal-600">
                        {field.isTime && <span className="text-lg">⏰</span>}
                        {field.label === "Lat" && (
                          <span className="text-lg">📍</span>
                        )}
                        {field.label === "Long" && (
                          <span className="text-lg">📍</span>
                        )}
                        {field.label}
                      </label>
                      <input
                        type={field.isTime ? "time" : "text"}
                        value={customerData[field.value] || ""}
                        onChange={(e) =>
                          handleFieldChange(field.value, e.target.value)
                        }
                        className={`w-full px-4 py-3 border-2 border-teal-200 bg-gradient-to-r from-white to-teal-50 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none text-gray-900 font-semibold placeholder:text-gray-400 hover:border-teal-300 transition-all duration-200 shadow-sm hover:shadow-md ${
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
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-100 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-gradient-to-b from-amber-500 to-yellow-500 rounded-full"></div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                  หมายเหตุ
                </h2>
              </div>
              <div className="group">
                <textarea
                  value={customerData["หมายเหตุ"] || ""}
                  onChange={(e) =>
                    handleFieldChange("หมายเหตุ", e.target.value)
                  }
                  className="w-full px-4 py-3 border-2 border-amber-200 bg-gradient-to-br from-white to-amber-50 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none min-h-[150px] text-gray-900 font-medium placeholder:text-gray-400 hover:border-amber-300 transition-all duration-200 shadow-sm hover:shadow-md resize-none"
                  placeholder="📝 พิมพ์หมายเหตุ..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Gradient */}
        <div className="sticky bottom-0 bg-gradient-to-t from-gray-50 to-white border-t border-gray-200 p-6 flex justify-end gap-4 shadow-lg">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-8 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
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
