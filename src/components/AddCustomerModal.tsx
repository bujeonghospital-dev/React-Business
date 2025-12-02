"use client";
import { useState, useEffect } from "react";
import { X, Save, Loader2, User, FileText, ClipboardCheck, Briefcase, Calendar, Star } from "lucide-react";
import { NotificationPopup } from "./NotificationPopup";

interface AddCustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type TabType = "contact" | "opd" | "consent" | "service" | "appointment";

interface ThaiProvince {
    id: number;
    name_th: string;
    name_en: string;
}

interface ThaiDistrict {
    id: number;
    province_id: number;
    name_th: string;
    name_en: string;
}

interface ThaiSubDistrict {
    id: number;
    district_id: number;
    name_th: string;
    name_en: string;
    zip_code: number | string | null;
}

const THAI_DATA_BASE_URL =
    "https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master/api/latest";

export const AddCustomerModal = ({
    isOpen,
    onClose,
    onSuccess,
}: AddCustomerModalProps) => {
    const [activeTab, setActiveTab] = useState<TabType>("contact");
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState({
        isOpen: false,
        type: "success" as "success" | "error",
        title: "",
        message: "",
    });

    // Form state - Contact Information (matching EditCustomerModal fields)
    const [formData, setFormData] = useState({
        // Personal Info
        status: "",
        prefix: "",
        name: "",
        surname: "",
        nickname: "",
        gender: "",
        star_flag: "",
        // Contact Info
        phone: "",
        email: "",
        lineid: "",
        facebook: "",
        country: "",
        // Business Info
        source: "",
        interested_product: "",
        contact_staff: "",
        proposed_amount: "",
        // Follow-up Dates
        got_contact_date: "",
        last_followup: "",
        next_followup: "",
        // Consult/Surgery Dates
        consult_date: "",
        booked_consult_date: "",
        surgery_date: "",
        booked_surgery_date: "",
        appointment_time: "",
        // Notes
        note: "",
    });

    // OPD form state
    const [opdData, setOpdData] = useState({
        locno: "",
        province: "",
        amphur: "",
        tumbon: "",
        zipcode: "",
    });

    // Consent form state
    const [consentData, setConsentData] = useState({
        weight: "",
        height: "",
        hasChronic: false,
        chronicDiseaseDetail: "",
        hasDrugAllergy: false,
        drugAllergyDetail: "",
        medicalConsent: "",
        acceptPdpa: "",
        acceptMedia: "",
    });

    // Options from API
    const [statusOptions, setStatusOptions] = useState<Array<{ value: string; label: string; color: string }>>([]);
    const [sourceOptions, setSourceOptions] = useState<Array<{ value: string; label: string }>>([]);
    const [productOptions, setProductOptions] = useState<Array<{ value: string; label: string }>>([]);
    const [countryOptions, setCountryOptions] = useState<Array<{ value: string; label: string }>>([]);
    const [contactPersonOptions, setContactPersonOptions] = useState<Array<{ value: string; label: string }>>([]);

    // Thai address data
    const [thaiProvinces, setThaiProvinces] = useState<ThaiProvince[]>([]);
    const [thaiDistricts, setThaiDistricts] = useState<ThaiDistrict[]>([]);
    const [thaiSubdistricts, setThaiSubdistricts] = useState<ThaiSubDistrict[]>([]);
    const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
    const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
    const [selectedSubdistrictId, setSelectedSubdistrictId] = useState<number | null>(null);
    const [thaiAddressLoading, setThaiAddressLoading] = useState(false);

    // Fallback data for when API is unavailable
    const fallbackStatusOptions = [
        { value: "ติดตามต่อเนื่อง", label: "ติดตามต่อเนื่อง", color: "#FFD700" },
        { value: "ปิดการขาย", label: "ปิดการขาย", color: "#90EE90" },
        { value: "ยกเลิก", label: "ยกเลิก", color: "#FFB6C1" },
        { value: "รอตอบกลับ", label: "รอตอบกลับ", color: "#87CEEB" },
        { value: "ได้นัด Consult", label: "ได้นัด Consult", color: "#FFA500" },
        { value: "ได้นัดผ่าตัด", label: "ได้นัดผ่าตัด", color: "#FF6347" },
        { value: "ผ่าตัดแล้ว", label: "ผ่าตัดแล้ว", color: "#32CD32" },
    ];

    const fallbackSourceOptions = [
        { value: "Facebook", label: "Facebook" },
        { value: "Instagram", label: "Instagram" },
        { value: "Google Ads", label: "Google Ads" },
        { value: "Line", label: "Line" },
        { value: "Walk-in", label: "Walk-in" },
        { value: "Referral", label: "Referral" },
    ];

    const fallbackProductOptions = [
        { value: "ตีตัวไล่ตัว", label: "ตีตัวไล่ตัว" },
        { value: "Sub brow lift", label: "Sub brow lift" },
        { value: "แก้ตาหมื่อตอนและแก้ว", label: "แก้ตาหมื่อตอนและแก้ว" },
        { value: "ตาสองชั้น", label: "ตาสองชั้น" },
        { value: "เสริมจมูก", label: "เสริมจมูก" },
        { value: "แก้จมูก", label: "แก้จมูก" },
        { value: "เสริมตาขาว", label: "เสริมตาขาว" },
        { value: "ลิฟหน้า", label: "ลิฟหน้า" },
        { value: "Skin", label: "Skin" },
    ];

    const fallbackCountryOptions = [
        { value: "ไทย", label: "ไทย" },
        { value: "จีน", label: "จีน" },
        { value: "ญี่ปุ่น", label: "ญี่ปุ่น" },
        { value: "เกาหลี", label: "เกาหลี" },
        { value: "สิงคโปร์", label: "สิงคโปร์" },
        { value: "มาเลเซีย", label: "มาเลเซีย" },
        { value: "อินโดนีเซีย", label: "อินโดนีเซีย" },
        { value: "เวียดนาม", label: "เวียดนาม" },
        { value: "ฟิลิปปินส์", label: "ฟิลิปปินส์" },
        { value: "พม่า", label: "พม่า" },
        { value: "อื่นๆ", label: "อื่นๆ" },
    ];

    const fallbackContactPersonOptions = [
        { value: "ไม่ระบุ", label: "ไม่ระบุ" },
    ];

    // Fetch options on mount
    useEffect(() => {
        if (!isOpen) return;

        const fetchStatusOptions = async () => {
            try {
                const response = await fetch("/api/status-options");
                const result = await response.json();
                if (result.success && result.data) {
                    setStatusOptions(result.data);
                } else {
                    setStatusOptions(fallbackStatusOptions);
                }
            } catch (error) {
                console.error("Failed to fetch status options:", error);
                setStatusOptions(fallbackStatusOptions);
            }
        };

        const fetchSourceOptions = async () => {
            try {
                const response = await fetch("/api/source-options");
                const result = await response.json();
                if (result.success && result.data) {
                    setSourceOptions(result.data);
                } else {
                    setSourceOptions(fallbackSourceOptions);
                }
            } catch (error) {
                console.error("Failed to fetch source options:", error);
                setSourceOptions(fallbackSourceOptions);
            }
        };

        const fetchProductOptions = async () => {
            try {
                const response = await fetch("/api/product-options");
                const result = await response.json();
                if (result.success && result.data) {
                    setProductOptions(result.data);
                } else {
                    setProductOptions(fallbackProductOptions);
                }
            } catch (error) {
                console.error("Failed to fetch product options:", error);
                setProductOptions(fallbackProductOptions);
            }
        };

        const fetchCountryOptions = async () => {
            try {
                const response = await fetch("/api/country-options");
                const result = await response.json();
                if (result.success && result.data) {
                    setCountryOptions(result.data);
                } else {
                    setCountryOptions(fallbackCountryOptions);
                }
            } catch (error) {
                console.error("Failed to fetch country options:", error);
                setCountryOptions(fallbackCountryOptions);
            }
        };

        const fetchContactPersonOptions = async () => {
            try {
                const response = await fetch("/api/n-staff");
                const result = await response.json();
                if (result.success && result.data) {
                    // Transform n_staff data to option format
                    setContactPersonOptions(result.data.map((staff: { nickname: string; code: string }) => ({
                        value: staff.nickname,
                        label: staff.nickname,
                    })));
                } else {
                    setContactPersonOptions(fallbackContactPersonOptions);
                }
            } catch (error) {
                console.error("Failed to fetch contact person options:", error);
                setContactPersonOptions(fallbackContactPersonOptions);
            }
        };

        // Fetch all options
        fetchStatusOptions();
        fetchSourceOptions();
        fetchProductOptions();
        fetchCountryOptions();
        fetchContactPersonOptions();
    }, [isOpen]);

    // Fetch Thai address data
    useEffect(() => {
        if (!isOpen) return;

        const fetchThaiData = async () => {
            setThaiAddressLoading(true);
            try {
                const [provincesRes, districtsRes, subdistrictsRes] = await Promise.all([
                    fetch(`${THAI_DATA_BASE_URL}/province.json`),
                    fetch(`${THAI_DATA_BASE_URL}/district.json`),
                    fetch(`${THAI_DATA_BASE_URL}/sub_district.json`),
                ]);

                if (provincesRes.ok) {
                    const provinces = await provincesRes.json();
                    setThaiProvinces(provinces);
                }
                if (districtsRes.ok) {
                    const districts = await districtsRes.json();
                    setThaiDistricts(districts);
                }
                if (subdistrictsRes.ok) {
                    const subdistricts = await subdistrictsRes.json();
                    setThaiSubdistricts(subdistricts);
                }
            } catch (error) {
                console.error("Failed to fetch Thai address data:", error);
            } finally {
                setThaiAddressLoading(false);
            }
        };

        fetchThaiData();
    }, [isOpen]);

    // Filter districts by province
    const filteredDistricts = selectedProvinceId
        ? thaiDistricts.filter((d) => d.province_id === selectedProvinceId)
        : [];

    // Filter subdistricts by district
    const filteredSubdistricts = selectedDistrictId
        ? thaiSubdistricts.filter((s) => s.district_id === selectedDistrictId)
        : [];

    const handleProvinceSelect = (provinceId: string) => {
        const id = provinceId ? parseInt(provinceId) : null;
        setSelectedProvinceId(id);
        setSelectedDistrictId(null);
        setSelectedSubdistrictId(null);

        const province = thaiProvinces.find((p) => p.id === id);
        setOpdData((prev) => ({
            ...prev,
            province: province?.name_th || "",
            amphur: "",
            tumbon: "",
            zipcode: "",
        }));
    };

    const handleDistrictSelect = (districtId: string) => {
        const id = districtId ? parseInt(districtId) : null;
        setSelectedDistrictId(id);
        setSelectedSubdistrictId(null);

        const district = thaiDistricts.find((d) => d.id === id);
        setOpdData((prev) => ({
            ...prev,
            amphur: district?.name_th || "",
            tumbon: "",
            zipcode: "",
        }));
    };

    const handleSubdistrictSelect = (subdistrictId: string) => {
        const id = subdistrictId ? parseInt(subdistrictId) : null;
        setSelectedSubdistrictId(id);

        const subdistrict = thaiSubdistricts.find((s) => s.id === id);
        setOpdData((prev) => ({
            ...prev,
            tumbon: subdistrict?.name_th || "",
            zipcode: subdistrict?.zip_code?.toString() || "",
        }));
    };

    const handleSave = async () => {
        // Validate mandatory fields: ชื่อ, สถานะ, เบอร์โทร, เพศ, แหล่งที่มา, ผลิตภัณฑ์ที่สนใจ
        const missingFields: string[] = [];
        if (!formData.name.trim()) missingFields.push("ชื่อ");
        if (!formData.status) missingFields.push("สถานะ");
        if (!formData.phone.trim()) missingFields.push("เบอร์โทร");
        if (!formData.gender) missingFields.push("เพศ");
        if (!formData.source) missingFields.push("แหล่งที่มา");
        if (!formData.interested_product) missingFields.push("ผลิตภัณฑ์ที่สนใจ");

        if (missingFields.length > 0) {
            setNotification({
                isOpen: true,
                type: "error",
                title: "ข้อมูลไม่ครบ",
                message: `กรุณากรอกข้อมูลที่จำเป็น: ${missingFields.join(", ")}`,
            });
            return;
        }

        setIsLoading(true);
        try {
            const customerPayload = {
                // Personal Info
                prefix: formData.prefix,
                name: formData.name,
                surname: formData.surname,
                nickname: formData.nickname,
                gender: formData.gender,
                star_flag: formData.star_flag === "ติดดาว" ? 1 : 0,
                status: formData.status,
                // Contact Info
                phone: formData.phone,
                email: formData.email,
                lineid: formData.lineid,
                facebook: formData.facebook,
                country: formData.country,
                // Business Info
                source: formData.source,
                interested_product: formData.interested_product,
                contact_staff: formData.contact_staff,
                proposed_amount: formData.proposed_amount || null,
                // Follow-up Dates
                got_contact_date: formData.got_contact_date || null,
                last_followup: formData.last_followup || null,
                next_followup: formData.next_followup || null,
                // Consult/Surgery Dates
                consult_date: formData.consult_date || null,
                booked_consult_date: formData.booked_consult_date || null,
                surgery_date: formData.surgery_date || null,
                booked_surgery_date: formData.booked_surgery_date || null,
                appointment_time: formData.appointment_time || null,
                // Notes
                note: formData.note,
                // OPD data
                locno: opdData.locno,
                province: opdData.province,
                amphur: opdData.amphur,
                tumbon: opdData.tumbon,
                zipcode: opdData.zipcode,
            };

            const response = await fetch("/api/customer-add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(customerPayload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to save customer");
            }

            setNotification({
                isOpen: true,
                type: "success",
                title: "สำเร็จ",
                message: "บันทึกข้อมูลลูกค้าเรียบร้อยแล้ว",
            });

            // Reset form
            setFormData({
                status: "",
                prefix: "",
                name: "",
                surname: "",
                nickname: "",
                gender: "",
                star_flag: "",
                phone: "",
                email: "",
                lineid: "",
                facebook: "",
                country: "",
                source: "",
                interested_product: "",
                contact_staff: "",
                proposed_amount: "",
                got_contact_date: "",
                last_followup: "",
                next_followup: "",
                consult_date: "",
                booked_consult_date: "",
                surgery_date: "",
                booked_surgery_date: "",
                appointment_time: "",
                note: "",
            });
            setOpdData({
                locno: "",
                province: "",
                amphur: "",
                tumbon: "",
                zipcode: "",
            });
            setActiveTab("contact");

            setTimeout(() => {
                onSuccess();
            }, 1500);
        } catch (error: any) {
            setNotification({
                isOpen: true,
                type: "error",
                title: "เกิดข้อผิดพลาด",
                message: error.message || "ไม่สามารถบันทึกข้อมูลได้",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const tabs = [
        { id: "contact" as TabType, label: "Contact Information", icon: User },
        { id: "opd" as TabType, label: "OPD", icon: FileText },
        { id: "consent" as TabType, label: "Consent", icon: ClipboardCheck },
        { id: "service" as TabType, label: "บริการ", icon: Briefcase },
        { id: "appointment" as TabType, label: "นัดหมาย", icon: Calendar },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden w-full max-w-4xl animate-slideUp transform transition-all">
                {/* Header with Gradient */}
                <div className="sticky top-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 z-10 shadow-lg">
                    {/* Close button - top right */}
                    <div className="absolute top-3 right-3">
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-xl transition-all duration-200 group"
                        >
                            <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-200" />
                        </button>
                    </div>

                    {/* Centered Tabs */}
                    <div className="flex justify-center items-center gap-1 sm:gap-2 px-4 py-4">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex flex-col sm:flex-row items-center justify-center gap-1 px-3 sm:px-4 py-2 sm:py-2.5 ${activeTab === tab.id
                                        ? "bg-white/30 shadow-inner"
                                        : "bg-white/10 hover:bg-white/20"
                                    } text-white rounded-xl transition-all duration-200 min-w-[60px] sm:min-w-[80px]`}
                                title={tab.label}
                            >
                                <tab.icon className="w-5 h-5" />
                                <span className="text-xs sm:text-sm font-medium hidden sm:block">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto" style={{ maxHeight: "calc(90vh - 180px)" }}>
                    <div className="p-6 space-y-6">
                        {/* Contact Information Tab */}
                        {activeTab === "contact" && (
                            <>
                                {/* Section 1: Personal Info */}
                                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
                                        <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                                            ข้อมูลส่วนตัว
                                        </h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        {/* Status */}
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">สถานะ <span className="text-red-500">*</span></label>
                                            <select
                                                value={formData.status}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                                                className={`w-full pl-4 pr-8 py-3 border-2 ${!formData.status ? 'border-red-300' : 'border-cyan-200'} bg-white rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none cursor-pointer`}
                                            >
                                                <option value="">เลือกสถานะ</option>
                                                {statusOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>{option.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {/* Prefix */}
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">คำนำหน้า</label>
                                            <select
                                                value={formData.prefix}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, prefix: e.target.value }))}
                                                className="w-full pl-4 pr-8 py-3 border-2 border-cyan-200 bg-white rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none cursor-pointer"
                                            >
                                                <option value="">เลือกคำนำหน้า</option>
                                                <option value="นาย">นาย</option>
                                                <option value="นาง">นาง</option>
                                                <option value="นางสาว">นางสาว</option>
                                                <option value="Mr.">Mr.</option>
                                                <option value="Mrs.">Mrs.</option>
                                                <option value="Ms.">Ms.</option>
                                            </select>
                                        </div>
                                        {/* Name */}
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อ <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                                className={`w-full px-4 py-3 border-2 ${!formData.name.trim() ? 'border-red-300' : 'border-cyan-200'} bg-white rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none`}
                                                placeholder="กรอกชื่อ"
                                            />
                                        </div>
                                        {/* Surname */}
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">นามสกุล</label>
                                            <input
                                                type="text"
                                                value={formData.surname}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, surname: e.target.value }))}
                                                className="w-full px-4 py-3 border-2 border-cyan-200 bg-white rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none"
                                                placeholder="กรอกนามสกุล"
                                            />
                                        </div>
                                        {/* Nickname */}
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อเล่น</label>
                                            <input
                                                type="text"
                                                value={formData.nickname}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, nickname: e.target.value }))}
                                                className="w-full px-4 py-3 border-2 border-cyan-200 bg-white rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none"
                                                placeholder="กรอกชื่อเล่น"
                                            />
                                        </div>
                                        {/* Gender */}
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">เพศ <span className="text-red-500">*</span></label>
                                            <select
                                                value={formData.gender}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, gender: e.target.value }))}
                                                className={`w-full pl-4 pr-8 py-3 border-2 ${!formData.gender ? 'border-red-300' : 'border-cyan-200'} bg-white rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none cursor-pointer`}
                                            >
                                                <option value="">เลือกเพศ</option>
                                                <option value="ชาย">ชาย</option>
                                                <option value="หญิง">หญิง</option>
                                                <option value="อื่นๆ">อื่นๆ</option>
                                            </select>
                                        </div>
                                        {/* Star Flag */}
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">ติดดาว</label>
                                            <button
                                                type="button"
                                                onClick={() => setFormData((prev) => ({ ...prev, star_flag: prev.star_flag === "ติดดาว" ? "" : "ติดดาว" }))}
                                                className="w-full px-4 py-3 border-2 border-cyan-200 bg-white rounded-xl hover:border-cyan-300 transition-all duration-200 flex items-center justify-center gap-2"
                                            >
                                                <Star className={`w-6 h-6 ${formData.star_flag === "ติดดาว" ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`} />
                                                <span className="text-sm font-medium text-gray-700">
                                                    {formData.star_flag === "ติดดาว" ? "ติดดาวแล้ว" : "คลิกเพื่อติดดาว"}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Contact Info */}
                                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                                        <h2 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                            ข้อมูลติดต่อ
                                        </h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Phone */}
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">เบอร์โทร <span className="text-red-500">*</span></label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                                                className={`w-full px-4 py-3 border-2 ${!formData.phone.trim() ? 'border-red-300' : 'border-indigo-200'} bg-white rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none`}
                                                placeholder="กรอกเบอร์โทร"
                                            />
                                        </div>
                                        {/* Email */}
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">อีเมล</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                                                className="w-full px-4 py-3 border-2 border-indigo-200 bg-white rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none"
                                                placeholder="กรอกอีเมล"
                                            />
                                        </div>
                                        {/* Line ID */}
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">ไลน์ไอดี</label>
                                            <input
                                                type="text"
                                                value={formData.lineid}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, lineid: e.target.value }))}
                                                className="w-full px-4 py-3 border-2 border-indigo-200 bg-white rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none"
                                                placeholder="กรอกไลน์ไอดี"
                                            />
                                        </div>
                                        {/* Facebook */}
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">เฟสบุ๊ค</label>
                                            <input
                                                type="text"
                                                value={formData.facebook}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, facebook: e.target.value }))}
                                                className="w-full px-4 py-3 border-2 border-indigo-200 bg-white rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none"
                                                placeholder="กรอกเฟสบุ๊ค"
                                            />
                                        </div>
                                        {/* Country */}
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">ประเทศ</label>
                                            <select
                                                value={formData.country}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))}
                                                className="w-full pl-4 pr-8 py-3 border-2 border-indigo-200 bg-white rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none cursor-pointer"
                                            >
                                                <option value="">เลือกประเทศ</option>
                                                {countryOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>{option.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3: Business Info */}
                                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></div>
                                        <h2 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                            ข้อมูลธุรกิจ
                                        </h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        {/* Source */}
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">แหล่งที่มา <span className="text-red-500">*</span></label>
                                            <select
                                                value={formData.source}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, source: e.target.value }))}
                                                className={`w-full pl-4 pr-8 py-3 border-2 ${!formData.source ? 'border-red-300' : 'border-emerald-200'} bg-white rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none cursor-pointer`}
                                            >
                                                <option value="">เลือกแหล่งที่มา</option>
                                                {sourceOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>{option.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {/* Interested Product */}
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">ผลิตภัณฑ์ที่สนใจ <span className="text-red-500">*</span></label>
                                            <select
                                                value={formData.interested_product}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, interested_product: e.target.value }))}
                                                className={`w-full pl-4 pr-8 py-3 border-2 ${!formData.interested_product ? 'border-red-300' : 'border-emerald-200'} bg-white rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none cursor-pointer`}
                                            >
                                                <option value="">เลือกผลิตภัณฑ์</option>
                                                {productOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>{option.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {/* Contact Staff */}
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">ผู้ติดต่อ</label>
                                            <select
                                                value={formData.contact_staff}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, contact_staff: e.target.value }))}
                                                className="w-full pl-4 pr-8 py-3 border-2 border-emerald-200 bg-white rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none cursor-pointer"
                                            >
                                                <option value="">เลือกผู้ติดต่อ</option>
                                                {contactPersonOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>{option.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {/* Proposed Amount */}
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">ยอดนำเสนอ</label>
                                            <input
                                                type="number"
                                                value={formData.proposed_amount}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, proposed_amount: e.target.value }))}
                                                className="w-full px-4 py-3 border-2 border-emerald-200 bg-white rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none"
                                                placeholder="กรอกยอดนำเสนอ"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 4: วันที่ติดตาม */}
                                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
                                        <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                                            วันที่ติดตาม
                                        </h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Got Contact Date */}
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                <span>📅</span> วันที่ได้ชื่อ เบอร์
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.got_contact_date}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, got_contact_date: e.target.value }))}
                                                className="w-full px-4 py-3 border-2 border-cyan-200 bg-white rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none cursor-pointer"
                                            />
                                        </div>
                                        {/* Last Follow-up */}
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                <span>📅</span> วันที่ติดตามครั้งล่าสุด
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.last_followup}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, last_followup: e.target.value }))}
                                                className="w-full px-4 py-3 border-2 border-cyan-200 bg-white rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none cursor-pointer"
                                            />
                                        </div>
                                        {/* Next Follow-up */}
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                <span>📅</span> วันที่ติดตามครั้งถัดไป
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.next_followup}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, next_followup: e.target.value }))}
                                                className="w-full px-4 py-3 border-2 border-cyan-200 bg-white rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 5: วันที่ Consult */}
                                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-violet-500 rounded-full"></div>
                                        <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                                            วันที่ Consult
                                        </h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Booked Consult Date */}
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                <span>📅</span> วันที่ได้นัด consult
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.booked_consult_date}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, booked_consult_date: e.target.value }))}
                                                className="w-full px-4 py-3 border-2 border-purple-200 bg-white rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none cursor-pointer"
                                            />
                                        </div>
                                        {/* Consult Date */}
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                <span>📅</span> วันที่ Consult
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.consult_date}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, consult_date: e.target.value }))}
                                                className="w-full px-4 py-3 border-2 border-purple-200 bg-white rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 6: วันที่ผ่าตัด */}
                                <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-6 border border-rose-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-1 h-6 bg-gradient-to-b from-rose-500 to-pink-500 rounded-full"></div>
                                        <h2 className="text-lg font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                                            วันที่ผ่าตัด
                                        </h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Booked Surgery Date */}
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                <span>📅</span> วันที่ได้นัดผ่าตัด
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.booked_surgery_date}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, booked_surgery_date: e.target.value }))}
                                                className="w-full px-4 py-3 border-2 border-rose-200 bg-white rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none cursor-pointer"
                                            />
                                        </div>
                                        {/* Surgery Date */}
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                <span>📅</span> วันที่ผ่าตัด
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.surgery_date}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, surgery_date: e.target.value }))}
                                                className="w-full px-4 py-3 border-2 border-rose-200 bg-white rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none cursor-pointer"
                                            />
                                        </div>
                                        {/* Appointment Time */}
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                <span>⏰</span> เวลาที่นัด
                                            </label>
                                            <input
                                                type="time"
                                                value={formData.appointment_time}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, appointment_time: e.target.value }))}
                                                className="w-full px-4 py-3 border-2 border-rose-200 bg-white rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 6: Notes */}
                                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-1 h-6 bg-gradient-to-b from-amber-500 to-yellow-500 rounded-full"></div>
                                        <h2 className="text-lg font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                                            หมายเหตุ
                                        </h2>
                                    </div>
                                    <textarea
                                        value={formData.note}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, note: e.target.value }))}
                                        className="w-full px-4 py-3 border-2 border-amber-200 bg-white rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none min-h-[120px] resize-none"
                                        placeholder="📝 พิมพ์หมายเหตุ..."
                                    />
                                </div>
                            </>
                        )}

                        {/* OPD Tab */}
                        {activeTab === "opd" && (
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                                    <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                        ข้อมูล OPD - ที่อยู่
                                    </h2>
                                </div>
                                {thaiAddressLoading && (
                                    <p className="text-xs text-emerald-600 mb-4">กำลังโหลดข้อมูลจังหวัด/อำเภอ/ตำบล...</p>
                                )}
                                <div className="space-y-4">
                                    <div className="group">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">บ้านเลขที่</label>
                                        <input
                                            type="text"
                                            value={opdData.locno}
                                            onChange={(e) => setOpdData((prev) => ({ ...prev, locno: e.target.value }))}
                                            className="w-full px-4 py-3 border-2 border-blue-200 bg-white rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
                                            placeholder="ระบุบ้านเลขที่"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">จังหวัด</label>
                                            <select
                                                value={selectedProvinceId ? String(selectedProvinceId) : ""}
                                                onChange={(e) => handleProvinceSelect(e.target.value)}
                                                className="w-full pl-4 pr-8 py-3 border-2 border-blue-200 bg-white rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none cursor-pointer"
                                            >
                                                <option value="">เลือกจังหวัด</option>
                                                {thaiProvinces.map((province) => (
                                                    <option key={province.id} value={province.id}>{province.name_th}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">อำเภอ / เขต</label>
                                            <select
                                                value={selectedDistrictId ? String(selectedDistrictId) : ""}
                                                onChange={(e) => handleDistrictSelect(e.target.value)}
                                                disabled={!filteredDistricts.length}
                                                className="w-full pl-4 pr-8 py-3 border-2 border-blue-200 bg-white rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none cursor-pointer disabled:bg-gray-100"
                                            >
                                                <option value="">เลือกอำเภอ / เขต</option>
                                                {filteredDistricts.map((district) => (
                                                    <option key={district.id} value={district.id}>{district.name_th}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">ตำบล / แขวง</label>
                                            <select
                                                value={selectedSubdistrictId ? String(selectedSubdistrictId) : ""}
                                                onChange={(e) => handleSubdistrictSelect(e.target.value)}
                                                disabled={!filteredSubdistricts.length}
                                                className="w-full pl-4 pr-8 py-3 border-2 border-blue-200 bg-white rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none cursor-pointer disabled:bg-gray-100"
                                            >
                                                <option value="">เลือกตำบล / แขวง</option>
                                                {filteredSubdistricts.map((subdistrict) => (
                                                    <option key={subdistrict.id} value={subdistrict.id}>{subdistrict.name_th}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">รหัสไปรษณีย์</label>
                                            <input
                                                type="text"
                                                value={opdData.zipcode}
                                                readOnly
                                                className="w-full px-4 py-3 border-2 border-blue-200 bg-gray-100 rounded-xl outline-none text-gray-700"
                                                placeholder="รหัสไปรษณีย์ (อัตโนมัติ)"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Consent Tab */}
                        {activeTab === "consent" && (
                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></div>
                                    <h2 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                        Consent Form
                                    </h2>
                                </div>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">น้ำหนัก (kg)</label>
                                            <input
                                                type="text"
                                                value={consentData.weight}
                                                onChange={(e) => setConsentData((prev) => ({ ...prev, weight: e.target.value }))}
                                                className="w-full px-4 py-3 border-2 border-emerald-200 bg-white rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none"
                                                placeholder="ระบุน้ำหนัก"
                                            />
                                        </div>
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">ส่วนสูง (cm)</label>
                                            <input
                                                type="text"
                                                value={consentData.height}
                                                onChange={(e) => setConsentData((prev) => ({ ...prev, height: e.target.value }))}
                                                className="w-full px-4 py-3 border-2 border-emerald-200 bg-white rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none"
                                                placeholder="ระบุส่วนสูง"
                                            />
                                        </div>
                                    </div>
                                    <div className="group">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                            <input
                                                type="checkbox"
                                                checked={consentData.hasChronic}
                                                onChange={(e) => setConsentData((prev) => ({ ...prev, hasChronic: e.target.checked }))}
                                                className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-400"
                                            />
                                            มีโรคประจำตัว
                                        </label>
                                        {consentData.hasChronic && (
                                            <input
                                                type="text"
                                                value={consentData.chronicDiseaseDetail}
                                                onChange={(e) => setConsentData((prev) => ({ ...prev, chronicDiseaseDetail: e.target.value }))}
                                                className="w-full px-4 py-3 border-2 border-emerald-200 bg-white rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none mt-2"
                                                placeholder="ระบุโรคประจำตัว"
                                            />
                                        )}
                                    </div>
                                    <div className="group">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                            <input
                                                type="checkbox"
                                                checked={consentData.hasDrugAllergy}
                                                onChange={(e) => setConsentData((prev) => ({ ...prev, hasDrugAllergy: e.target.checked }))}
                                                className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-400"
                                            />
                                            มีประวัติแพ้ยา
                                        </label>
                                        {consentData.hasDrugAllergy && (
                                            <input
                                                type="text"
                                                value={consentData.drugAllergyDetail}
                                                onChange={(e) => setConsentData((prev) => ({ ...prev, drugAllergyDetail: e.target.value }))}
                                                className="w-full px-4 py-3 border-2 border-emerald-200 bg-white rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none mt-2"
                                                placeholder="ระบุยาที่แพ้"
                                            />
                                        )}
                                    </div>
                                    <div className="group">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">ยินยอมรับการรักษา</label>
                                        <select
                                            value={consentData.medicalConsent}
                                            onChange={(e) => setConsentData((prev) => ({ ...prev, medicalConsent: e.target.value }))}
                                            className="w-full px-4 py-3 border-2 border-emerald-200 bg-white rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none cursor-pointer"
                                        >
                                            <option value="">เลือก</option>
                                            <option value="ยินยอม">ยินยอม</option>
                                            <option value="ไม่ยินยอม">ไม่ยินยอม</option>
                                        </select>
                                    </div>
                                    <div className="group">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">ยอมรับ PDPA</label>
                                        <select
                                            value={consentData.acceptPdpa}
                                            onChange={(e) => setConsentData((prev) => ({ ...prev, acceptPdpa: e.target.value }))}
                                            className="w-full px-4 py-3 border-2 border-emerald-200 bg-white rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none cursor-pointer"
                                        >
                                            <option value="">เลือก</option>
                                            <option value="ยอมรับ">ยอมรับ</option>
                                            <option value="ไม่ยอมรับ">ไม่ยอมรับ</option>
                                        </select>
                                    </div>
                                    <div className="group">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">ยินยอมเผยแพร่สื่อ</label>
                                        <select
                                            value={consentData.acceptMedia}
                                            onChange={(e) => setConsentData((prev) => ({ ...prev, acceptMedia: e.target.value }))}
                                            className="w-full px-4 py-3 border-2 border-emerald-200 bg-white rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none cursor-pointer"
                                        >
                                            <option value="">เลือก</option>
                                            <option value="ยอมรับ">ยอมรับ</option>
                                            <option value="ไม่ยอมรับ">ไม่ยอมรับ</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Service Tab */}
                        {activeTab === "service" && (
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                                    <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                        บริการ
                                    </h2>
                                </div>
                                <div className="text-center py-12 text-gray-500">
                                    <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                    <p className="text-lg font-medium">กรุณาบันทึกข้อมูลลูกค้าก่อน</p>
                                    <p className="text-sm mt-2">หลังจากบันทึกแล้ว สามารถเพิ่มบริการได้ในหน้าแก้ไขข้อมูล</p>
                                </div>
                            </div>
                        )}

                        {/* Appointment Tab */}
                        {activeTab === "appointment" && (
                            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></div>
                                    <h2 className="text-lg font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                                        นัดหมาย
                                    </h2>
                                </div>
                                <div className="text-center py-12 text-gray-500">
                                    <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                    <p className="text-lg font-medium">กรุณาบันทึกข้อมูลลูกค้าก่อน</p>
                                    <p className="text-sm mt-2">หลังจากบันทึกแล้ว สามารถเพิ่มนัดหมายได้ในหน้าแก้ไขข้อมูล</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gradient-to-t from-gray-50 to-white border-t border-gray-200 p-4 sm:p-5 flex justify-center gap-4 shadow-lg">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-6 sm:px-8 py-2.5 sm:py-3 border-2 border-gray-300 rounded-xl text-gray-700 text-sm sm:text-base font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50"
                    >
                        ยกเลิก
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm sm:text-base font-semibold rounded-xl transition-all duration-200 disabled:opacity-70 shadow-lg hover:shadow-xl"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                กำลังบันทึก...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                บันทึก
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Notification Popup */}
            <NotificationPopup
                isOpen={notification.isOpen}
                onClose={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
                type={notification.type}
                title={notification.title}
                message={notification.message}
            />
        </div>
    );
};
