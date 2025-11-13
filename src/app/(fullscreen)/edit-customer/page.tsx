"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";

interface CustomerData {
  [key: string]: any;
}

const EditCustomerPage = () => {
  const router = useRouter();
  const [customerData, setCustomerData] = useState<CustomerData>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ดึงข้อมูลจาก URL params หรือ localStorage
    const params = new URLSearchParams(window.location.search);
    const customerId = params.get("id");

    if (customerId) {
      // ในอนาคต: ดึงข้อมูลจาก API
      const savedData = localStorage.getItem(`customer_${customerId}`);
      if (savedData) {
        setCustomerData(JSON.parse(savedData));
      }
    }
    setIsLoading(false);
  }, []);

  const handleFieldChange = (fieldName: string, value: any) => {
    setCustomerData({
      ...customerData,
      [fieldName]: value,
    });
  };

  const handleSave = async () => {
    try {
      // TODO: บันทึกข้อมูลไปยัง API
      alert("บันทึกข้อมูลสำเร็จ");
      localStorage.setItem(
        `customer_${customerData.id}`,
        JSON.stringify(customerData)
      );
      router.back();
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-gray-600">กำลังโหลด...</div>
      </div>
    );
  }

  const statusConsultOptions = [
    { value: "ยอดนำเสนอ", label: "ยอดนำเสนอ", color: "bg-cyan-500" },
    { value: "สถานะติดตอ", label: "สถานะติดตอ", color: "bg-cyan-500" },
    {
      value: "วันที่ได้ชื่อ เบอร์",
      label: "วันที่ได้ชื่อ เบอร์",
      color: "bg-cyan-500",
    },
    {
      value: "วันที่ได้นัด Consult",
      label: "วันที่ได้นัด Consult",
      color: "bg-red-600",
    },
    {
      value: "วันที่ได้นัดผ่าตัด",
      label: "วันที่ได้นัดผ่าตัด",
      color: "bg-red-600",
    },
  ];

  const statusContactOptions = [
    { value: "ผู้ติดต่อ", label: "ผู้ติดต่อ", color: "bg-cyan-500" },
    { value: "เพศ", label: "เพศ", color: "bg-cyan-500" },
    { value: "อายุ", label: "อายุ", color: "bg-cyan-500" },
    { value: "บ้านจากจังหวัด", label: "บ้านจากจังหวัด", color: "bg-cyan-500" },
    {
      value: "จะเดินทางมารพ.ยังไง",
      label: "จะเดินทางมารพ.ยังไง",
      color: "bg-cyan-500",
    },
    {
      value: "วันที่ได้ชื่อ เบอร์",
      label: "วันที่ได้ชื่อ เบอร์",
      color: "bg-red-600",
    },
  ];

  const consultContactOptions = [
    {
      value: "วันที่ได้ชื่อ เบอร์",
      label: "วันที่ได้ชื่อ เบอร์",
      color: "bg-cyan-500",
    },
    {
      value: "วันที่ได้นัด Consult",
      label: "วันที่ได้นัด Consult",
      color: "bg-red-600",
    },
    { value: "วันที่ Consult", label: "วันที่ Consult", color: "bg-red-600" },
    { value: "ยอดนำเสนอ", label: "ยอดนำเสนอ", color: "bg-cyan-500" },
  ];

  const surgeryContactOptions = [
    {
      value: "วันที่ได้นัดผ่าตัด",
      label: "วันที่ได้นัดผ่าตัด",
      color: "bg-red-600",
    },
    { value: "วันที่ผ่าตัด", label: "วันที่ผ่าตัด", color: "bg-red-600" },
    { value: "เวลาที่นัด", label: "เวลาที่นัด", color: "bg-red-600" },
    { value: "หมอ", label: "หมอ", color: "bg-cyan-500" },
  ];

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-3xl font-bold text-gray-800">
            แก้ไขข้อมูลลูกค้า
          </h1>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Section 1: HN และข้อมูลพื้นฐาน */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              รหัสลูกค้า (HN)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  รหัสลูกค้า
                </label>
                <input
                  type="text"
                  value={customerData.id || ""}
                  onChange={(e) => handleFieldChange("id", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อสุกลค้า
                </label>
                <input
                  type="text"
                  value={customerData.name || ""}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อเล่น
                </label>
                <input
                  type="text"
                  value={customerData.nickname || ""}
                  onChange={(e) =>
                    handleFieldChange("nickname", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: ข้อมูล Fields */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              ข้อมูลลูกค้า
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ผู้ติดต่อ
                </label>
                <input
                  type="text"
                  value={customerData.contact || ""}
                  onChange={(e) => handleFieldChange("contact", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เบอร์โทร
                </label>
                <input
                  type="tel"
                  value={customerData.phone || ""}
                  onChange={(e) => handleFieldChange("phone", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เพศ
                </label>
                <select
                  value={customerData.gender || ""}
                  onChange={(e) => handleFieldChange("gender", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">เลือก</option>
                  <option value="ชาย">ชาย</option>
                  <option value="หญิง">หญิง</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  อายุ
                </label>
                <input
                  type="number"
                  value={customerData.age || ""}
                  onChange={(e) => handleFieldChange("age", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: สถานะติดต่อ */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              สถานะติดต่อ
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {statusContactOptions.map((option) => (
                <div key={option.value}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {option.label}
                  </label>
                  <input
                    type="text"
                    value={customerData[option.value] || ""}
                    onChange={(e) =>
                      handleFieldChange(option.value, e.target.value)
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      option.color === "bg-red-600"
                        ? "border-red-300 bg-red-50"
                        : "border-cyan-300 bg-cyan-50"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: สถานะ Consult */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              สถานะ Consult
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {consultContactOptions.map((option) => (
                <div key={option.value}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {option.label}
                  </label>
                  <input
                    type="text"
                    value={customerData[option.value] || ""}
                    onChange={(e) =>
                      handleFieldChange(option.value, e.target.value)
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      option.color === "bg-red-600"
                        ? "border-red-300 bg-red-50"
                        : "border-cyan-300 bg-cyan-50"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: สถานะผ่าตัด */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              สถานะผ่าตัด
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {surgeryContactOptions.map((option) => (
                <div key={option.value}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {option.label}
                  </label>
                  <input
                    type="text"
                    value={customerData[option.value] || ""}
                    onChange={(e) =>
                      handleFieldChange(option.value, e.target.value)
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      option.color === "bg-red-600"
                        ? "border-red-300 bg-red-50"
                        : "border-cyan-300 bg-cyan-50"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 6: หมายเหตุ */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              หมายเหตุ
            </h2>
            <textarea
              value={customerData.notes || ""}
              onChange={(e) => handleFieldChange("notes", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[200px] bg-yellow-50"
              placeholder="พิมพ์หมายเหตุ..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mb-6">
            <button
              onClick={() => router.back()}
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
    </div>
  );
};

export default EditCustomerPage;
