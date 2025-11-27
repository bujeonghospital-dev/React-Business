"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import VisitListPanel from "../../../components/VisitListPanel";
import VisitForm, { VisitFormMode } from "../../../components/VisitForm";

export interface CustomerFormData {
  recordno?: string;
  code: string;
  cn: string;
  prefix: string;
  name: string;
  surname: string;
  nickname: string;
  gender: string;
  idcard: string;
  birthdate: string;
  registerdate: string;
  member: string;
  cusgroup: string;
  mobilephone: string;
  email: string;
  lineid: string;
  facebook: string;
  medianame: string;
  disease: string;
  allergic: string;
  displayname: string;
  locno: string;
  soi: string;
  road: string;
  moo: string;
  tumbon: string;
  amphur: string;
  province: string;
  zipcode: string;
  country: string;
  address: string;
  ownercode: string;
  ownername: string;
  binddate: string;
  idcardLaserCode?: string;
  idcardIssueDate?: string;
  idcardExpireDate?: string;
  idcardProvinceNative?: string;
  idcardDistrictNative?: string;
  idcardSubdistrictNative?: string;
  idcardFrontImage?: string;
  idcardBackImage?: string;
}

export interface LeadSummary {
  id: number;
  name: string;
  phone: string;
  status: string;
  interestedProduct: string;
}

export interface StaffOption {
  code: string;
  nickname: string;
}

interface CustomerRegistrationModalProps {
  visible: boolean;
  loading: boolean;
  saving: boolean;
  exists: boolean;
  form: CustomerFormData | null;
  error: string | null;
  message: string | null;
  lead: LeadSummary | null;
  staffOptions: StaffOption[];
  staffLoading: boolean;
  staffError: string | null;
  onClose: () => void;
  onChange: (field: keyof CustomerFormData, value: string) => void;
  onSubmit: () => void;
}

type SectionStatus = {
  label: string;
  className: string;
};

type SectionNavItem = {
  id: string;
  label: string;
  ref: RefObject<HTMLDivElement | null>;
  status: SectionStatus;
  requiresAdvanced?: boolean;
};

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500";

const labelClass = "block text-sm font-semibold text-gray-700";

const genderOptions = [
  { label: "เลือกเพศ", value: "" },
  { label: "ชาย", value: "M" },
  { label: "หญิง", value: "F" },
  { label: "ไม่ระบุ", value: "X" },
];

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

interface ThaiAdministrativeData {
  provinces: ThaiProvince[];
  districts: ThaiDistrict[];
  subdistricts: ThaiSubDistrict[];
}

const THAI_DATA_BASE_URL =
  "https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master/api/latest";

let thaiAdministrativeCache: ThaiAdministrativeData | null = null;
let thaiAdministrativePromise: Promise<ThaiAdministrativeData> | null = null;

async function fetchThaiAdministrativeData(): Promise<ThaiAdministrativeData> {
  if (thaiAdministrativeCache) {
    return thaiAdministrativeCache;
  }

  if (!thaiAdministrativePromise) {
    thaiAdministrativePromise = Promise.all([
      fetch(`${THAI_DATA_BASE_URL}/province.json`).then((response) => {
        if (!response.ok) {
          throw new Error("ไม่สามารถโหลดข้อมูลจังหวัดได้");
        }
        return response.json() as Promise<ThaiProvince[]>;
      }),
      fetch(`${THAI_DATA_BASE_URL}/district.json`).then((response) => {
        if (!response.ok) {
          throw new Error("ไม่สามารถโหลดข้อมูลอำเภอได้");
        }
        return response.json() as Promise<ThaiDistrict[]>;
      }),
      fetch(`${THAI_DATA_BASE_URL}/sub_district.json`).then((response) => {
        if (!response.ok) {
          throw new Error("ไม่สามารถโหลดข้อมูลตำบลได้");
        }
        return response.json() as Promise<ThaiSubDistrict[]>;
      }),
    ]).then(([provinces, districts, subdistricts]) => {
      const payload: ThaiAdministrativeData = {
        provinces,
        districts,
        subdistricts,
      };
      thaiAdministrativeCache = payload;
      return payload;
    });
  }

  return thaiAdministrativePromise;
}

const provinceLegacyOptionValue = "__province_legacy__";
const districtLegacyOptionValue = "__district_legacy__";
const subdistrictLegacyOptionValue = "__subdistrict_legacy__";

function normalizeName(value: string | null | undefined) {
  return value ? value.trim().toLowerCase() : "";
}

function matchesAdministrativeName(
  candidate: { name_th: string; name_en: string },
  target: string
) {
  const normalizedTarget = normalizeName(target);
  if (!normalizedTarget) {
    return false;
  }
  return (
    normalizeName(candidate.name_th) === normalizedTarget ||
    normalizeName(candidate.name_en) === normalizedTarget
  );
}

export default function CustomerRegistrationModal({
  visible,
  loading,
  saving,
  exists,
  form,
  error,
  message,
  lead,
  staffOptions,
  staffLoading,
  staffError,
  onClose,
  onChange,
  onSubmit,
}: CustomerRegistrationModalProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [frontPreview, setFrontPreview] = useState<string>("");
  const [backPreview, setBackPreview] = useState<string>("");
  const [addressDataLoading, setAddressDataLoading] = useState(false);
  const [addressDataError, setAddressDataError] = useState<string | null>(null);
  const [thaiProvinces, setThaiProvinces] = useState<ThaiProvince[]>([]);
  const [thaiDistricts, setThaiDistricts] = useState<ThaiDistrict[]>([]);
  const [thaiSubdistricts, setThaiSubdistricts] = useState<ThaiSubDistrict[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  const [selectedSubdistrictId, setSelectedSubdistrictId] = useState<number | null>(null);
  const [baselineForm, setBaselineForm] = useState<CustomerFormData | null>(null);
  const previousFormIdentityRef = useRef<string | null>(null);

  const basicSectionRef = useRef<HTMLDivElement | null>(null);
  const documentsSectionRef = useRef<HTMLDivElement | null>(null);
  const addressSectionRef = useRef<HTMLDivElement | null>(null);
  const advancedSectionRef = useRef<HTMLDivElement | null>(null);
  const visitSectionRef = useRef<HTMLDivElement | null>(null);

  const [visitPanelOpen, setVisitPanelOpen] = useState(false);
  const [visitRefreshSignal, setVisitRefreshSignal] = useState(0);
  const [visitFormConfig, setVisitFormConfig] = useState<{ mode: VisitFormMode; vn?: string } | null>(null);
  const openVisitForm = (mode: VisitFormMode, vn?: string) => {
    setVisitPanelOpen(true);
    setVisitFormConfig({ mode, vn });
  };
  const refreshVisitList = () => setVisitRefreshSignal((prev) => prev + 1);

  useEffect(() => {
    setFrontPreview(form?.idcardFrontImage || "");
    setBackPreview(form?.idcardBackImage || "");
  }, [form?.idcardFrontImage, form?.idcardBackImage]);

  const formIdentity = useMemo(
    () => `${form?.cn ?? ""}::${form?.code ?? ""}`,
    [form?.cn, form?.code]
  );

  useEffect(() => {
    if (!visible) {
      previousFormIdentityRef.current = null;
      setBaselineForm(null);
      return;
    }

    if (!form) {
      return;
    }

    if (previousFormIdentityRef.current !== formIdentity || !baselineForm) {
      setBaselineForm({ ...form });
      previousFormIdentityRef.current = formIdentity;
    }
  }, [visible, form, formIdentity, baselineForm]);

  const normalizedCountryValue = normalizeName(form?.country ?? "Thailand");
  const treatAsThailand =
    !form?.country ||
    normalizedCountryValue === "thailand" ||
    normalizedCountryValue === "ไทย" ||
    normalizedCountryValue === "th";

  useEffect(() => {
    if (!visible || !treatAsThailand) {
      return;
    }

    if (thaiProvinces.length && thaiDistricts.length && thaiSubdistricts.length) {
      return;
    }

    let cancelled = false;
    setAddressDataLoading(true);

    fetchThaiAdministrativeData()
      .then((data) => {
        if (cancelled) {
          return;
        }
        setThaiProvinces(data.provinces);
        setThaiDistricts(data.districts);
        setThaiSubdistricts(data.subdistricts);
        setAddressDataError(null);
      })
      .catch((error: any) => {
        if (cancelled) {
          return;
        }
        setAddressDataError(error?.message || "ไม่สามารถโหลดข้อมูลที่อยู่ประเทศไทยได้");
      })
      .finally(() => {
        if (cancelled) {
          return;
        }
        setAddressDataLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [visible, treatAsThailand, thaiProvinces.length, thaiDistricts.length, thaiSubdistricts.length]);

  useEffect(() => {
    if (!treatAsThailand) {
      setSelectedProvinceId(null);
      setSelectedDistrictId(null);
      setSelectedSubdistrictId(null);
    }
  }, [treatAsThailand]);

  useEffect(() => {
    if (!treatAsThailand || !thaiProvinces.length || !form?.province) {
      if (!form?.province) {
        setSelectedProvinceId(null);
      }
      return;
    }

    const match = thaiProvinces.find((province) =>
      matchesAdministrativeName(province, form.province)
    );

    setSelectedProvinceId(match ? match.id : null);
  }, [form?.province, treatAsThailand, thaiProvinces]);

  useEffect(() => {
    if (!treatAsThailand || !thaiDistricts.length) {
      return;
    }

    if (!selectedProvinceId) {
      setSelectedDistrictId(null);
      return;
    }

    if (!form?.amphur) {
      setSelectedDistrictId(null);
      return;
    }

    const match = thaiDistricts.find(
      (district) =>
        district.province_id === selectedProvinceId &&
        matchesAdministrativeName(district, form.amphur)
    );

    setSelectedDistrictId(match ? match.id : null);
  }, [form?.amphur, treatAsThailand, thaiDistricts, selectedProvinceId]);

  useEffect(() => {
    if (!treatAsThailand || !thaiSubdistricts.length) {
      return;
    }

    if (!selectedDistrictId) {
      setSelectedSubdistrictId(null);
      return;
    }

    if (!form?.tumbon) {
      setSelectedSubdistrictId(null);
      return;
    }

    const match = thaiSubdistricts.find(
      (subdistrict) =>
        subdistrict.district_id === selectedDistrictId &&
        matchesAdministrativeName(subdistrict, form.tumbon)
    );

    setSelectedSubdistrictId(match ? match.id : null);
  }, [form?.tumbon, treatAsThailand, thaiSubdistricts, selectedDistrictId]);

  const provinceOptions = useMemo(() => {
    return thaiProvinces.map((province) => ({
      id: province.id,
      label: `${province.name_th} (${province.name_en})`,
    }));
  }, [thaiProvinces]);

  const districtOptions = useMemo(() => {
    if (!selectedProvinceId) {
      return [] as Array<{ id: number; label: string }>;
    }

    return thaiDistricts
      .filter((district) => district.province_id === selectedProvinceId)
      .map((district) => ({
        id: district.id,
        label: `${district.name_th} (${district.name_en})`,
      }));
  }, [thaiDistricts, selectedProvinceId]);

  const subdistrictOptions = useMemo(() => {
    if (!selectedDistrictId) {
      return [] as Array<{ id: number; label: string }>;
    }

    return thaiSubdistricts
      .filter((subdistrict) => subdistrict.district_id === selectedDistrictId)
      .map((subdistrict) => ({
        id: subdistrict.id,
        label: `${subdistrict.name_th} (${subdistrict.name_en})`,
      }));
  }, [thaiSubdistricts, selectedDistrictId]);

  const handleProvinceSelect = (provinceIdValue: string) => {
    if (provinceIdValue === provinceLegacyOptionValue) {
      return;
    }

    if (!provinceIdValue) {
      setSelectedProvinceId(null);
      setSelectedDistrictId(null);
      setSelectedSubdistrictId(null);
      onChange("province", "");
      onChange("amphur", "");
      onChange("tumbon", "");
      onChange("zipcode", "");
      return;
    }

    const numericId = Number(provinceIdValue);

    if (!Number.isFinite(numericId)) {
      return;
    }

    const province = thaiProvinces.find((item) => item.id === numericId);

    setSelectedProvinceId(numericId);
    setSelectedDistrictId(null);
    setSelectedSubdistrictId(null);
    onChange("province", province?.name_th || "");
    onChange("amphur", "");
    onChange("tumbon", "");
    onChange("zipcode", "");
  };

  const handleDistrictSelect = (districtIdValue: string) => {
    if (districtIdValue === districtLegacyOptionValue) {
      return;
    }

    if (!districtIdValue) {
      setSelectedDistrictId(null);
      setSelectedSubdistrictId(null);
      onChange("amphur", "");
      onChange("tumbon", "");
      onChange("zipcode", "");
      return;
    }

    const numericId = Number(districtIdValue);

    if (!Number.isFinite(numericId)) {
      return;
    }

    const district = thaiDistricts.find((item) => item.id === numericId);

    setSelectedDistrictId(numericId);
    setSelectedSubdistrictId(null);
    onChange("amphur", district?.name_th || "");
    onChange("tumbon", "");
    onChange("zipcode", "");
  };

  const handleSubdistrictSelect = (subdistrictIdValue: string) => {
    if (subdistrictIdValue === subdistrictLegacyOptionValue) {
      return;
    }

    if (!subdistrictIdValue) {
      setSelectedSubdistrictId(null);
      onChange("tumbon", "");
      onChange("zipcode", "");
      return;
    }

    const numericId = Number(subdistrictIdValue);

    if (!Number.isFinite(numericId)) {
      return;
    }

    const subdistrict = thaiSubdistricts.find((item) => item.id === numericId);

    setSelectedSubdistrictId(numericId);
    onChange("tumbon", subdistrict?.name_th || "");

    if (subdistrict?.zip_code !== null && subdistrict?.zip_code !== undefined) {
      const zipValue = String(subdistrict.zip_code).trim();
      if (zipValue) {
        onChange("zipcode", zipValue);
      }
    }
  };

  const shouldUseThaiDropdowns =
    treatAsThailand &&
    thaiProvinces.length > 0 &&
    thaiDistricts.length > 0 &&
    thaiSubdistricts.length > 0 &&
    !addressDataError;

  const ownernameValue = form?.ownername?.trim() || "";
  const ownercodeValue = form?.ownercode?.trim() || "";

  useEffect(() => {
    if (!visible || !ownernameValue || ownercodeValue) {
      return;
    }

    const match = staffOptions.find((option) => option.nickname === ownernameValue);
    if (match) {
      onChange("ownercode", match.code);
      if (match.nickname !== ownernameValue) {
        onChange("ownername", match.nickname);
      }
    }
  }, [visible, ownernameValue, ownercodeValue, staffOptions, onChange]);

  const handleIdCardImageChange = (side: "front" | "back", file?: File) => {
    if (!file) {
      if (side === "front") {
        setFrontPreview("");
        onChange("idcardFrontImage", "");
      } else {
        setBackPreview("");
        onChange("idcardBackImage", "");
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (side === "front") {
        setFrontPreview(result);
        onChange("idcardFrontImage", result);
      } else {
        setBackPreview(result);
        onChange("idcardBackImage", result);
      }
    };
    reader.readAsDataURL(file);
  };

  const updateFields = (payload: Partial<CustomerFormData>) => {
    Object.entries(payload).forEach(([field, value]) => {
      onChange(field as keyof CustomerFormData, typeof value === "string" ? value : "");
    });
  };

  if (!visible || !form) {
    return null;
  }

  const getFieldValue = (data: CustomerFormData | null, field: keyof CustomerFormData) =>
    data && typeof data[field] === "string" ? (data[field] as string) : "";

  const isFieldDirty = (field: keyof CustomerFormData) => {
    if (!baselineForm) {
      return Boolean(getFieldValue(form, field));
    }
    return getFieldValue(baselineForm, field) !== getFieldValue(form, field);
  };

  const buildSectionStatus = (fields: Array<keyof CustomerFormData>): SectionStatus => {
    if (!baselineForm) {
      const hasAnyValue = fields.some((field) => Boolean(getFieldValue(form, field)));
      return hasAnyValue
        ? { label: "กำลังกำหนด", className: "bg-sky-100 text-sky-700" }
        : { label: "รอกรอก", className: "bg-gray-200 text-gray-700" };
    }

    const dirty = fields.some((field) => isFieldDirty(field));
    return dirty
      ? { label: "ข้อมูลใหม่", className: "bg-emerald-100 text-emerald-700" }
      : { label: "ตรงกับฐานข้อมูล", className: "bg-gray-100 text-gray-600" };
  };

  const statusBadgeBaseClass =
    "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold shadow-sm";

  const basicFields: Array<keyof CustomerFormData> = [
    "cn",
    "registerdate",
    "prefix",
    "name",
    "surname",
    "nickname",
    "gender",
    "birthdate",
    "mobilephone",
    "email",
    "lineid",
    "facebook",
    "medianame",
    "displayname",
    "ownercode",
    "ownername",
  ];

  const documentsFields: Array<keyof CustomerFormData> = [
    "country",
    "idcardFrontImage",
    "idcardBackImage",
  ];

  const addressFields: Array<keyof CustomerFormData> = [
    "province",
    "amphur",
    "tumbon",
    "zipcode",
  ];

  const advancedMemberFields: Array<keyof CustomerFormData> = [
    "recordno",
    "idcard",
    "binddate",
    "cusgroup",
    "member",
  ];

  const advancedHealthFields: Array<keyof CustomerFormData> = ["disease", "allergic"];

  const advancedHomeFields: Array<keyof CustomerFormData> = ["locno", "moo", "soi", "road"];

  const advancedCardFields: Array<keyof CustomerFormData> = [
    "idcardLaserCode",
    "idcardIssueDate",
    "idcardExpireDate",
  ];

  const advancedNativeFields: Array<keyof CustomerFormData> = [
    "idcardProvinceNative",
    "idcardDistrictNative",
    "idcardSubdistrictNative",
  ];

  const basicStatus = buildSectionStatus(basicFields);
  const documentsStatus = buildSectionStatus(documentsFields);
  const addressStatus = buildSectionStatus(addressFields);
  const memberStatus = buildSectionStatus(advancedMemberFields);
  const healthStatus = buildSectionStatus(advancedHealthFields);
  const homeStatus = buildSectionStatus(advancedHomeFields);
  const cardStatus = buildSectionStatus(advancedCardFields);
  const nativeStatus = buildSectionStatus(advancedNativeFields);
  const advancedStatus = buildSectionStatus([
    ...advancedMemberFields,
    ...advancedHealthFields,
    ...advancedHomeFields,
    ...advancedCardFields,
    ...advancedNativeFields,
  ]);

  const visitStatus: SectionStatus = {
    label: "Visit",
    className: "bg-blue-100 text-blue-800",
  };

  const sectionNavItems: SectionNavItem[] = [
    { id: "basic", label: "ข้อมูลลูกค้า", ref: basicSectionRef, status: basicStatus },
    {
      id: "documents",
      label: "เอกสาร / ทั่วไป",
      ref: documentsSectionRef,
      status: documentsStatus,
    },
    { id: "address", label: "ที่อยู่ปัจจุบัน", ref: addressSectionRef, status: addressStatus },
    {
      id: "advanced",
      label: "รายละเอียดเพิ่มเติม",
      ref: advancedSectionRef,
      status: advancedStatus,
      requiresAdvanced: true,
    },
    { id: "visits", label: "Visit", ref: visitSectionRef, status: visitStatus },
  ];

  const scrollToSection = (target: RefObject<HTMLDivElement | null>) => {
    const element = target.current;
    if (!element) {
      return;
    }
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSectionNavClick = (item: SectionNavItem) => {
    if (item.requiresAdvanced && !showAdvanced) {
      setShowAdvanced(true);
      setTimeout(() => scrollToSection(item.ref), 160);
      return;
    }
    scrollToSection(item.ref);
  };

  const setIfEmpty = (field: keyof CustomerFormData, value: string | undefined | null) => {
    if (!value) {
      return;
    }
    if (getFieldValue(form, field)) {
      return;
    }
    onChange(field, value);
  };

  const handleAutoFillFromLead = () => {
    if (!lead) {
      return;
    }

    const trimmedName = lead.name?.trim();
    if (trimmedName) {
      const prefixMatch = trimmedName.match(/^(คุณ|นาย|นาง|นส\.|นพ\.|พญ\.|ดช\.|ดญ\.)/);
      let remainingName = trimmedName;
      if (prefixMatch) {
        setIfEmpty("prefix", prefixMatch[0]);
        remainingName = remainingName.replace(prefixMatch[0], "").trim();
      }

      const nameParts = remainingName.split(/\s+/).filter(Boolean);
      if (nameParts.length === 1) {
        setIfEmpty("name", nameParts[0]);
      } else if (nameParts.length > 1) {
        setIfEmpty("name", nameParts[0]);
        setIfEmpty("surname", nameParts.slice(1).join(" "));
      }
      setIfEmpty("nickname", nameParts[0]);
      setIfEmpty("displayname", trimmedName);
    }

    setIfEmpty("mobilephone", lead.phone);
    setIfEmpty("cusgroup", lead.status);
    setIfEmpty("medianame", lead.interestedProduct);
    setIfEmpty("country", "Thailand");
  };

  const handleResetToDefault = () => {
    if (!baselineForm) {
      return;
    }
    updateFields({ ...baselineForm });
  };

  const autoFillDisabled = !lead;
  const resetDisabled = !baselineForm;

  const hasMatchingOwnercode = Boolean(
    ownercodeValue && staffOptions.some((option) => option.code === ownercodeValue)
  );
  const legacyOwnerOptionValue = "__legacy__";
  const ownerSelectValue = hasMatchingOwnercode
    ? ownercodeValue
    : ownernameValue
      ? legacyOwnerOptionValue
      : "";
  const prefixOptions = [
    "คุณ",
    "นาย",
    "นาง",
    "นส.",
    "นพ.",
    "พญ.",
    "ดช.",
    "ดญ.",
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="max-h-[95vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-gradient-to-br from-white via-blue-50 to-indigo-100 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-white/40 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div>
            <h2 className="text-2xl font-bold">
              {exists ? "แก้ไขข้อมูลลูกค้า" : "ลงทะเบียนลูกค้า"}
            </h2>
            {lead && (
              <p className="mt-1 text-sm text-blue-100">
                #{lead.id} · {lead.name} · {lead.phone} · {lead.status} · {lead.interestedProduct}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-white/20 p-2 transition hover:bg-white/30"
            aria-label="ปิดกล่องลงทะเบียน"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="sticky top-0 z-10 border-b border-white/60 bg-white/70 px-6 py-3 backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <nav className="flex flex-wrap gap-2">
              {sectionNavItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSectionNavClick(item)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-indigo-400 hover:text-indigo-600"
                >
                  <span>{item.label}</span>
                  <span className={`${statusBadgeBaseClass} ${item.status.className}`}>
                    {item.status.label}
                  </span>
                </button>
              ))}
            </nav>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleAutoFillFromLead}
                disabled={autoFillDisabled}
                className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
                title={lead ? "เติมข้อมูลจากข้อมูลลูกค้า" : "ไม่มีข้อมูลลูกค้าให้เติม"}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                </svg>
                เติมข้อมูลอัตโนมัติ
              </button>
              <button
                type="button"
                onClick={handleResetToDefault}
                disabled={resetDisabled}
                className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white/80 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-indigo-400 hover:text-indigo-600 disabled:cursor-not-allowed disabled:text-gray-400"
                title="คืนค่าตามฐานข้อมูล"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12a7.5 7.5 0 0112.618-5.303L18 7.5m0-3v3h-3M19.5 12a7.5 7.5 0 01-12.618 5.303L6 16.5m0 3v-3h3"
                  />
                </svg>
                คืนค่าจากฐานข้อมูล
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6 px-6 py-5">
          {loading && (
            <div className="rounded-xl bg-white/80 p-4 text-sm text-blue-700 shadow">
              กำลังโหลดข้อมูลลูกค้าจากฐานข้อมูล...
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-100 p-4 text-sm text-red-700 shadow">
              {error}
            </div>
          )}

          <div
            ref={visitSectionRef}
            className="space-y-3 rounded-2xl border border-blue-200 bg-white/80 p-5 shadow-sm"
          >
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Visit</h3>
                <p className="text-sm text-gray-600">
                  ดูประวัติการเข้าพบหรือเยี่ยมลูกค้ารายนี้ และเชื่อมต่อกับระบบ Visit
                </p>
              </div>
              {form?.cn ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setVisitPanelOpen((prev) => !prev)}
                    className="inline-flex items-center gap-2 rounded-full border border-blue-300 bg-white px-4 py-2 text-sm font-semibold text-blue-600 shadow-sm transition hover:border-blue-500"
                  >
                    {visitPanelOpen ? "ซ่อน Visit" : "ดู Visit ทั้งหมด"}
                  </button>
                  <button
                    type="button"
                    onClick={() => openVisitForm("create")}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:from-blue-700 hover:to-indigo-700"
                  >
                    เพิ่ม Visit
                  </button>
                </div>
              ) : (
                <span className="text-sm font-medium text-gray-500 md:text-right">
                  กำลังโหลด CN...
                </span>
              )}
            </div>

            {visitPanelOpen && form?.cn && (
              <div className="space-y-4">
                <VisitListPanel
                  cn={form.cn}
                  allowDelete
                  refreshSignal={visitRefreshSignal}
                  onRowClick={(visit) => openVisitForm("edit", visit.vn)}
                  onDeleteSuccess={refreshVisitList}
                />
                {visitFormConfig && (
                  <div className="rounded-2xl border border-dashed border-blue-300 bg-blue-50 p-5">
                    <VisitForm
                      mode={visitFormConfig.mode}
                      cn={form.cn}
                      vn={visitFormConfig.vn}
                      onSaved={() => {
                        refreshVisitList();
                        setVisitFormConfig(null);
                      }}
                      onCancel={() => setVisitFormConfig(null)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              onSubmit();
            }}
            className="space-y-6"
          >
            <div className="space-y-4 rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800">ข้อมูลลูกค้า</h3>

              <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className={labelClass}>CN (รหัสลูกค้า)</label>
                  <input
                    type="text"
                    className={`${inputClass} bg-gray-100`}
                    value={form.cn}
                    readOnly
                  />
                </div>
                <div>
                  <label className={labelClass}>วันที่ลงทะเบียน</label>
                  <input
                    type="date"
                    className={inputClass}
                    value={form.registerdate}
                    onChange={(event) => onChange("registerdate", event.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass}>คำนำหน้า</label>
                  <select
                    className={inputClass}
                    value={form.prefix || ""}
                    onChange={(event) => onChange("prefix", event.target.value)}
                  >
                    <option value="" disabled>
                      เลือกคำนำหน้า
                    </option>

                    {prefixOptions.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>ชื่อ</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={form.name}
                    onChange={(event) => onChange("name", event.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>นามสกุล</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={form.surname}
                    onChange={(event) => onChange("surname", event.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass}>ชื่อเล่น</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={form.nickname}
                    onChange={(event) => onChange("nickname", event.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>เพศ</label>
                  <select
                    className={inputClass}
                    value={form.gender}
                    onChange={(event) => onChange("gender", event.target.value)}
                  >
                    {genderOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>วันเกิด</label>
                  <input
                    type="date"
                    className={inputClass}
                    value={form.birthdate}
                    onChange={(event) => onChange("birthdate", event.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass}>เบอร์โทรหลัก</label>
                  <input
                    type="tel"
                    className={inputClass}
                    value={form.mobilephone}
                    onChange={(event) => onChange("mobilephone", event.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>อีเมล</label>
                  <input
                    type="email"
                    className={inputClass}
                    value={form.email}
                    onChange={(event) => onChange("email", event.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>LINE ID</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={form.lineid}
                    onChange={(event) => onChange("lineid", event.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass}>Facebook</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={form.facebook}
                    onChange={(event) => onChange("facebook", event.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>ช่องทางสื่อ</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={form.medianame}
                    onChange={(event) => onChange("medianame", event.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>ชื่อลูกค้า (ใช้แสดง)</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={form.displayname}
                    onChange={(event) => onChange("displayname", event.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>ชื่อผู้ดูแล</label>
                  <select
                    className={inputClass}
                    value={ownerSelectValue}
                    onChange={(event) => {
                      const selectedCode = event.target.value;
                      if (selectedCode === legacyOwnerOptionValue) {
                        return;
                      }
                      if (!selectedCode) {
                        onChange("ownercode", "");
                        onChange("ownername", "");
                        return;
                      }

                      const selectedStaff = staffOptions.find((option) => option.code === selectedCode);
                      onChange("ownercode", selectedCode);
                      onChange("ownername", selectedStaff?.nickname || "");
                    }}
                    disabled={staffLoading && staffOptions.length === 0}
                  >
                    <option value="">เลือกชื่อผู้ดูแล</option>
                    {!hasMatchingOwnercode && ownernameValue && (
                      <option value={legacyOwnerOptionValue} disabled>
                        {`ข้อมูลเดิม: ${ownernameValue}`}
                      </option>
                    )}
                    {staffOptions.map((option) => (
                      <option key={option.code} value={option.code}>
                        {option.nickname}
                      </option>
                    ))}
                  </select>
                  {staffLoading && staffOptions.length === 0 && (
                    <p className="mt-1 text-xs text-blue-600">กำลังโหลดรายชื่อผู้ดูแล...</p>
                  )}
                  {!staffLoading && staffError && (
                    <p className="mt-1 text-xs text-red-600">{staffError}</p>
                  )}
                  {!staffLoading && !staffError && !ownercodeValue && ownernameValue && (
                    <p className="mt-1 text-xs text-amber-600">
                      ข้อมูลเดิม: {ownernameValue} (ไม่พบในรายชื่อพนักงาน)
                    </p>
                  )}
                </div>

              </section>
              <div>
                <label className={labelClass}>ประเทศ</label>
                <input
                  type="text"
                  className={inputClass}
                  value={form.country}
                  onChange={(event) => onChange("country", event.target.value)}
                  placeholder="เช่น Thailand"
                />
              </div>
              <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div>
                  <label className={labelClass}>จังหวัด</label>
                  {shouldUseThaiDropdowns ? (
                    <select
                      className={inputClass}
                      value={
                        selectedProvinceId
                          ? String(selectedProvinceId)
                          : form.province
                            ? provinceLegacyOptionValue
                            : ""
                      }
                      onChange={(event) => handleProvinceSelect(event.target.value)}
                      disabled={addressDataLoading}
                    >
                      <option value="">เลือกจังหวัด</option>
                      {!selectedProvinceId && form.province && (
                        <option value={provinceLegacyOptionValue} disabled>
                          {`ข้อมูลเดิม: ${form.province}`}
                        </option>
                      )}
                      {provinceOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      className={inputClass}
                      value={form.province}
                      onChange={(event) => onChange("province", event.target.value)}
                    />
                  )}
                  {addressDataLoading && treatAsThailand && (
                    <p className="mt-1 text-xs text-blue-600">กำลังโหลดจังหวัด...</p>
                  )}
                  {addressDataError && treatAsThailand && (
                    <p className="mt-1 text-xs text-red-600">{addressDataError}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>อำเภอ/เขต</label>
                  {shouldUseThaiDropdowns ? (
                    <select
                      className={inputClass}
                      value={
                        selectedDistrictId
                          ? String(selectedDistrictId)
                          : form.amphur
                            ? districtLegacyOptionValue
                            : ""
                      }
                      onChange={(event) => handleDistrictSelect(event.target.value)}
                      disabled={!selectedProvinceId || addressDataLoading}
                    >
                      <option value="">เลือกอำเภอ/เขต</option>
                      {!selectedDistrictId && form.amphur && (
                        <option value={districtLegacyOptionValue} disabled>
                          {`ข้อมูลเดิม: ${form.amphur}`}
                        </option>
                      )}
                      {districtOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      className={inputClass}
                      value={form.amphur}
                      onChange={(event) => onChange("amphur", event.target.value)}
                    />
                  )}
                </div>
                <div>
                  <label className={labelClass}>ตำบล/แขวง</label>
                  {shouldUseThaiDropdowns ? (
                    <select
                      className={inputClass}
                      value={
                        selectedSubdistrictId
                          ? String(selectedSubdistrictId)
                          : form.tumbon
                            ? subdistrictLegacyOptionValue
                            : ""
                      }
                      onChange={(event) => handleSubdistrictSelect(event.target.value)}
                      disabled={!selectedDistrictId || addressDataLoading}
                    >
                      <option value="">เลือกตำบล/แขวง</option>
                      {!selectedSubdistrictId && form.tumbon && (
                        <option value={subdistrictLegacyOptionValue} disabled>
                          {`ข้อมูลเดิม: ${form.tumbon}`}
                        </option>
                      )}
                      {subdistrictOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      className={inputClass}
                      value={form.tumbon}
                      onChange={(event) => onChange("tumbon", event.target.value)}
                    />
                  )}
                </div>
                <div>
                  <label className={labelClass}>รหัสไปรษณีย์</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={form.zipcode}
                    onChange={(event) => onChange("zipcode", event.target.value)}
                  />
                </div>
              </section>
            </div>

            <div className="space-y-4 rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800">เอกสารและข้อมูลทั่วไป</h3>

              <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-xl border border-dashed border-indigo-300 bg-white/80 p-4">
                  <div className="flex items-center justify-between">
                    <label className={`${labelClass} text-indigo-700`}>
                      ภาพหน้าบัตรประชาชน
                    </label>
                    {frontPreview && (
                      <button
                        type="button"
                        onClick={() => handleIdCardImageChange("front")}
                        className="text-xs font-semibold text-indigo-600 underline-offset-2 hover:underline"
                      >
                        ลบภาพ
                      </button>
                    )}
                  </div>
                  <div className="mt-3 flex flex-col items-center gap-3">
                    <div className="h-32 w-full overflow-hidden rounded-lg border border-indigo-200 bg-indigo-50">
                      {frontPreview ? (
                        <img
                          src={frontPreview}
                          alt="Thai ID front"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-indigo-400">
                          ยังไม่มีภาพหน้าบัตร
                        </div>
                      )}
                    </div>
                    <label className="w-full cursor-pointer rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-center text-sm font-semibold text-white shadow hover:from-indigo-600 hover:to-purple-600">
                      อัปโหลดภาพหน้าบัตร
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) =>
                          handleIdCardImageChange("front", event.target.files?.[0])
                        }
                      />
                    </label>
                  </div>
                </div>
                <div className="rounded-xl border border-dashed border-indigo-300 bg-white/80 p-4">
                  <div className="flex items-center justify-between">
                    <label className={`${labelClass} text-indigo-700`}>
                      ภาพหลังบัตรประชาชน
                    </label>
                    {backPreview && (
                      <button
                        type="button"
                        onClick={() => handleIdCardImageChange("back")}
                        className="text-xs font-semibold text-indigo-600 underline-offset-2 hover:underline"
                      >
                        ลบภาพ
                      </button>
                    )}
                  </div>
                  <div className="mt-3 flex flex-col items-center gap-3">
                    <div className="h-32 w-full overflow-hidden rounded-lg border border-indigo-200 bg-indigo-50">
                      {backPreview ? (
                        <img
                          src={backPreview}
                          alt="Thai ID back"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-indigo-400">
                          ยังไม่มีภาพหลังบัตร
                        </div>
                      )}
                    </div>
                    <label className="w-full cursor-pointer rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-center text-sm font-semibold text-white shadow hover:from-indigo-600 hover:to-purple-600">
                      อัปโหลดภาพหลังบัตร
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) =>
                          handleIdCardImageChange("back", event.target.files?.[0])
                        }
                      />
                    </label>
                  </div>
                </div>
              </section>
            </div>



            <div className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-inner">
              <button
                type="button"
                onClick={() => setShowAdvanced((state) => !state)}
                className="flex w-full items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-3 text-left text-white shadow"
              >
                <div>
                  <p className="text-sm font-semibold">
                    {showAdvanced ? "ซ่อน" : "แสดง"} รายละเอียดเพิ่มเติม
                  </p>
                  <p className="text-xs text-purple-100">
                    ข้อมูลสมาชิก, เอกสาร, โรคประจำตัว และที่อยู่แบบละเอียด
                  </p>
                </div>
                <svg
                  className={`h-5 w-5 transition-transform duration-200 ${showAdvanced ? "rotate-180" : "rotate-0"
                    }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showAdvanced && (
                <div className="mt-4 space-y-6">
                  <div className="space-y-3">
                    <h4 className="text-base font-semibold text-gray-800">ข้อมูลสมาชิก</h4>

                    <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <label className={labelClass}>เลขที่ภายใน (recordno)</label>
                        <input
                          type="text"
                          className={inputClass}
                          value={form.recordno || ""}
                          onChange={(event) => onChange("recordno", event.target.value)}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>เลขบัตรประชาชน / Passport</label>
                        <input
                          type="text"
                          className={inputClass}
                          value={form.idcard}
                          onChange={(event) => onChange("idcard", event.target.value)}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>วันที่ bind/sync</label>
                        <input
                          type="date"
                          className={inputClass}
                          value={form.binddate}
                          onChange={(event) => onChange("binddate", event.target.value)}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>กลุ่มลูกค้า</label>
                        <input
                          type="text"
                          className={inputClass}
                          value={form.cusgroup}
                          onChange={(event) => onChange("cusgroup", event.target.value)}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>รหัสสมาชิก</label>
                        <input
                          type="text"
                          className={inputClass}
                          value={form.member}
                          onChange={(event) => onChange("member", event.target.value)}
                        />
                      </div>
                    </section>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-base font-semibold text-gray-800">ข้อมูลสุขภาพ</h4>

                    <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className={labelClass}>โรคประจำตัว</label>
                        <textarea
                          className={`${inputClass} min-h-[80px]`}
                          value={form.disease}
                          onChange={(event) => onChange("disease", event.target.value)}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>ประวัติแพ้ยา/อาหาร/อื่น ๆ</label>
                        <textarea
                          className={`${inputClass} min-h-[80px]`}
                          value={form.allergic}
                          onChange={(event) => onChange("allergic", event.target.value)}
                        />
                      </div>
                    </section>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-base font-semibold text-gray-800">ที่อยู่ตามทะเบียนบ้าน</h4>

                    <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
                      <div>
                        <label className={labelClass}>เลขที่</label>
                        <input
                          type="text"
                          className={inputClass}
                          value={form.locno}
                          onChange={(event) => onChange("locno", event.target.value)}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>หมู่</label>
                        <input
                          type="text"
                          className={inputClass}
                          value={form.moo}
                          onChange={(event) => onChange("moo", event.target.value)}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>ซอย</label>
                        <input
                          type="text"
                          className={inputClass}
                          value={form.soi}
                          onChange={(event) => onChange("soi", event.target.value)}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>ถนน</label>
                        <input
                          type="text"
                          className={inputClass}
                          value={form.road}
                          onChange={(event) => onChange("road", event.target.value)}
                        />
                      </div>
                    </section>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-base font-semibold text-gray-800">ข้อมูลบัตรประชาชน</h4>

                    <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <label className={labelClass}>Laser Code (หลังบัตร)</label>
                        <input
                          type="text"
                          className={inputClass}
                          value={form.idcardLaserCode || ""}
                          onChange={(event) =>
                            onChange("idcardLaserCode", event.target.value)
                          }
                        />
                      </div>
                      <div>
                        <label className={labelClass}>วันที่ออกบัตร</label>
                        <input
                          type="date"
                          className={inputClass}
                          value={form.idcardIssueDate || ""}
                          onChange={(event) =>
                            onChange("idcardIssueDate", event.target.value)
                          }
                        />
                      </div>
                      <div>
                        <label className={labelClass}>วันที่หมดอายุ</label>
                        <input
                          type="date"
                          className={inputClass}
                          value={form.idcardExpireDate || ""}
                          onChange={(event) =>
                            onChange("idcardExpireDate", event.target.value)
                          }
                        />
                      </div>
                    </section>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-base font-semibold text-gray-800">ภูมิลำเนาตามบัตร</h4>

                    <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <label className={labelClass}>จังหวัด (ตามบัตร)</label>
                        <input
                          type="text"
                          className={inputClass}
                          value={form.idcardProvinceNative || ""}
                          onChange={(event) =>
                            onChange("idcardProvinceNative", event.target.value)
                          }
                        />
                      </div>
                      <div>
                        <label className={labelClass}>อำเภอ/เขต (ตามบัตร)</label>
                        <input
                          type="text"
                          className={inputClass}
                          value={form.idcardDistrictNative || ""}
                          onChange={(event) =>
                            onChange("idcardDistrictNative", event.target.value)
                          }
                        />
                      </div>
                      <div>
                        <label className={labelClass}>ตำบล/แขวง (ตามบัตร)</label>
                        <input
                          type="text"
                          className={inputClass}
                          value={form.idcardSubdistrictNative || ""}
                          onChange={(event) =>
                            onChange("idcardSubdistrictNative", event.target.value)
                          }
                        />
                      </div>
                    </section>
                  </div>
                </div>

              )}
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              {message && (
                <span className="text-sm font-semibold text-emerald-700">
                  {message}
                </span>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg bg-white px-5 py-2 font-semibold text-gray-700 shadow hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2 font-semibold text-white shadow-lg transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={saving}
                >
                  {saving ? "กำลังบันทึก..." : exists ? "อัปเดตข้อมูล" : "บันทึกข้อมูล"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
