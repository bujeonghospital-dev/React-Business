"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";

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

interface OPDServiceGroup {
  groupcode: string;
  groupname: string;
}

interface OPDServiceItem {
  itemcode: string;
  itemname: string;
  saleprice: number;
}

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500";

const compactInputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500";

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

interface SelectedServiceEntry {
  id: string;
  itemcode: string;
  itemname: string;
  salesprice: number;
  chargePrice: string;
  chargePercent: string;
  discountPrice: string;
  discountPercent: string;
}

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatCurrencyDisplay = (value: number) =>
  Number.isFinite(value) ? currencyFormatter.format(value) : "0.00";

const formatDecimalInputValue = (value: number) =>
  Number.isFinite(value) ? value.toFixed(2) : "";

const parseMonetaryInputValue = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return 0;
  }
  const numeric = Number(trimmed);
  return Number.isFinite(numeric) ? numeric : 0;
};

const normalizeSalepriceValue = (value: number | string | null | undefined) => {
  if (value === null || value === undefined) {
    return 0;
  }
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const calculateServiceEntryTotal = (entry: SelectedServiceEntry) => {
  const baseAmount = Number.isFinite(entry.salesprice) ? entry.salesprice : 0;
  const chargeAmount = parseMonetaryInputValue(entry.chargePrice);
  const discountAmount = parseMonetaryInputValue(entry.discountPrice);
  return baseAmount + chargeAmount - discountAmount;
};

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
  const [opdGroups, setOpdGroups] = useState<OPDServiceGroup[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupsError, setGroupsError] = useState<string | null>(null);
  const [selectedOpdGroupCode, setSelectedOpdGroupCode] = useState<string>("");
  const [groupServiceItems, setGroupServiceItems] = useState<OPDServiceItem[]>([]);
  const [serviceDrawerVisible, setServiceDrawerVisible] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [serviceSearchTerm, setServiceSearchTerm] = useState("");
  const [selectedServices, setSelectedServices] = useState<SelectedServiceEntry[]>([]);
  const latestServiceFetchGroupRef = useRef<string | null>(null);

  const basicSectionRef = useRef<HTMLDivElement | null>(null);
  const documentsSectionRef = useRef<HTMLDivElement | null>(null);
  const addressSectionRef = useRef<HTMLDivElement | null>(null);
  const advancedSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setFrontPreview(form?.idcardFrontImage || "");
    setBackPreview(form?.idcardBackImage || "");
  }, [form?.idcardFrontImage, form?.idcardBackImage]);

  useEffect(() => {
    let cancelled = false;
    const fetchGroups = async () => {
      setGroupsLoading(true);
      setGroupsError(null);
      try {
        const response = await fetch("/api/b-item-groups");
        const result = await response.json();
        if (!response.ok || result.success === false) {
          throw new Error(result.error || "ไม่พบกลุ่มขาย OPD");
        }
        if (cancelled) {
          return;
        }
        setOpdGroups(Array.isArray(result.data) ? result.data : []);
      } catch (error: any) {
        if (cancelled) {
          return;
        }
        setGroupsError(error?.message || "ไม่สามารถโหลดกลุ่มขาย OPD ได้");
      } finally {
        if (cancelled) {
          return;
        }
        setGroupsLoading(false);
      }
    };

    fetchGroups();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadServicesForGroup = async (groupCode: string) => {
    if (!groupCode) {
      setGroupServiceItems([]);
      return;
    }
    latestServiceFetchGroupRef.current = groupCode;
    setServicesLoading(true);
    setServiceError(null);
    setGroupServiceItems([]);
    try {
      const response = await fetch(
        `/api/b-item-services?groupCode=${encodeURIComponent(groupCode)}`
      );
      const result = await response.json();
      if (!response.ok || result.success === false) {
        throw new Error(result.error || "ไม่พบรายการบริการ");
      }
      if (latestServiceFetchGroupRef.current !== groupCode) {
        return;
      }
      const normalizedItems = Array.isArray(result.data)
        ? result.data.map((item: OPDServiceItem) => ({
          ...item,
          saleprice: normalizeSalepriceValue(item.saleprice),
        }))
        : [];
      setGroupServiceItems(normalizedItems as OPDServiceItem[]);
    } catch (error: any) {
      if (latestServiceFetchGroupRef.current !== groupCode) {
        return;
      }
      setServiceError(error?.message || "ไม่สามารถโหลดรายการบริการได้");
    } finally {
      if (latestServiceFetchGroupRef.current === groupCode) {
        setServicesLoading(false);
      }
    }
  };

  const handleGroupSelect = (groupCode: string) => {
    setSelectedOpdGroupCode(groupCode);
    setServiceSearchTerm("");
    setServiceError(null);
    if (!groupCode) {
      setGroupServiceItems([]);
      setServiceDrawerVisible(false);
      return;
    }
    loadServicesForGroup(groupCode);
    setServiceDrawerVisible(true);
  };

  const handleOpenServiceDrawer = () => {
    setServiceDrawerVisible(true);
    setServiceError(null);
    if (selectedOpdGroupCode) {
      loadServicesForGroup(selectedOpdGroupCode);
    }
  };

  const handleCloseServiceDrawer = () => {
    setServiceDrawerVisible(false);
    setServiceSearchTerm("");
    setServiceError(null);
  };

  const updateSelectedServiceEntry = (
    id: string,
    updater: (entry: SelectedServiceEntry) => SelectedServiceEntry
  ) => {
    setSelectedServices((current) =>
      current.map((entry) => (entry.id === id ? updater(entry) : entry))
    );
  };

  const handleChargePriceChange = (id: string, value: string) => {
    updateSelectedServiceEntry(id, (entry) => {
      const trimmed = value.trim();
      const numeric = Number(trimmed);
      const hasValue = trimmed.length > 0 && Number.isFinite(numeric);
      const nextPercent =
        hasValue && entry.salesprice > 0
          ? formatDecimalInputValue((numeric / entry.salesprice) * 100)
          : "";
      return {
        ...entry,
        chargePrice: value,
        chargePercent: nextPercent,
      };
    });
  };

  const handleChargePercentChange = (id: string, value: string) => {
    updateSelectedServiceEntry(id, (entry) => {
      const trimmed = value.trim();
      const numeric = Number(trimmed);
      const hasValue = trimmed.length > 0 && Number.isFinite(numeric);
      const nextPrice =
        hasValue && entry.salesprice > 0
          ? formatDecimalInputValue((entry.salesprice * numeric) / 100)
          : "";
      return {
        ...entry,
        chargePrice: nextPrice,
        chargePercent: value,
      };
    });
  };

  const handleDiscountPriceChange = (id: string, value: string) => {
    updateSelectedServiceEntry(id, (entry) => {
      const trimmed = value.trim();
      const numeric = Number(trimmed);
      const hasValue = trimmed.length > 0 && Number.isFinite(numeric);
      const nextPercent =
        hasValue && entry.salesprice > 0
          ? formatDecimalInputValue((numeric / entry.salesprice) * 100)
          : "";
      return {
        ...entry,
        discountPrice: value,
        discountPercent: nextPercent,
      };
    });
  };

  const handleDiscountPercentChange = (id: string, value: string) => {
    updateSelectedServiceEntry(id, (entry) => {
      const trimmed = value.trim();
      const numeric = Number(trimmed);
      const hasValue = trimmed.length > 0 && Number.isFinite(numeric);
      const nextPrice =
        hasValue && entry.salesprice > 0
          ? formatDecimalInputValue((entry.salesprice * numeric) / 100)
          : "";
      return {
        ...entry,
        discountPrice: nextPrice,
        discountPercent: value,
      };
    });
  };

  const handleAddService = (item: OPDServiceItem) => {
    setSelectedServices((current) => {
      if (current.some((entry) => entry.itemcode === item.itemcode)) {
        return current;
      }
      return [
        ...current,
        {
          id: `${item.itemcode}-${Date.now()}`,
          itemcode: item.itemcode,
          itemname: item.itemname,
          salesprice: normalizeSalepriceValue(item.saleprice),
          chargePrice: "",
          chargePercent: "",
          discountPrice: "",
          discountPercent: "",
        },
      ];
    });
  };

  const handleRemoveServiceEntry = (id: string) => {
    setSelectedServices((current) => current.filter((entry) => entry.id !== id));
  };

  const selectedOpdGroup = useMemo(
    () => opdGroups.find((group) => group.groupcode === selectedOpdGroupCode) ?? null,
    [opdGroups, selectedOpdGroupCode]
  );

  const selectedServicesTotals = useMemo(
    () =>
      selectedServices.reduce(
        (acc, entry) => {
          const baseAmount = Number.isFinite(entry.salesprice) ? entry.salesprice : 0;
          const chargeAmount = parseMonetaryInputValue(entry.chargePrice);
          const discountAmount = parseMonetaryInputValue(entry.discountPrice);
          const netAmount = baseAmount + chargeAmount - discountAmount;
          acc.baseTotal += baseAmount;
          acc.chargeTotal += chargeAmount;
          acc.discountTotal += discountAmount;
          acc.netTotal += netAmount;
          return acc;
        },
        { baseTotal: 0, chargeTotal: 0, discountTotal: 0, netTotal: 0 }
      ),
    [selectedServices]
  );

  const filteredServiceItems = useMemo(() => {
    if (!serviceSearchTerm.trim()) {
      return groupServiceItems;
    }
    const lowerTerm = serviceSearchTerm.trim().toLowerCase();
    return groupServiceItems.filter(
      (item) =>
        item.itemname.toLowerCase().includes(lowerTerm) ||
        item.itemcode.toLowerCase().includes(lowerTerm)
    );
  }, [groupServiceItems, serviceSearchTerm]);

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
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleOpenServiceDrawer}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:from-emerald-600 hover:to-teal-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                บริการ/ขาย
                {selectedServices.length > 0 && (
                  <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/30 text-xs font-bold">
                    {selectedServices.length}
                  </span>
                )}
              </button>
              {groupsLoading && (
                <span className="text-xs text-gray-500">กำลังโหลดกลุ่ม...</span>
              )}
              {groupsError && (
                <span className="text-xs text-red-500">{groupsError}</span>
              )}
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

      {/* OPD Service Popup Modal */}
      {serviceDrawerVisible && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div
            className="relative w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-5 text-white">
              <div>
                <h2 className="text-2xl font-bold">บริการ OPD</h2>
                <p className="mt-1 text-sm text-white/80">
                  เลือกบริการและกำหนด Charge / Discount
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseServiceDrawer}
                className="rounded-full bg-white/20 p-2 transition hover:bg-white/30"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Group selector */}
            <div className="border-b bg-gray-50 px-8 py-4">
              <div className="flex flex-wrap items-center gap-4">
                <label className="text-sm font-semibold text-gray-700">กลุ่มบริการ:</label>
                <select
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  value={selectedOpdGroupCode}
                  onChange={(e) => handleGroupSelect(e.target.value)}
                >
                  <option value="">เลือกกลุ่มบริการ</option>
                  {opdGroups.map((group) => (
                    <option key={group.groupcode} value={group.groupcode}>
                      {group.groupname}
                    </option>
                  ))}
                </select>
                {selectedServices.length > 0 && (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                    เลือกแล้ว {selectedServices.length} รายการ
                  </span>
                )}
              </div>
            </div>

            {/* Two-column content */}
            <div className="grid max-h-[65vh] grid-cols-1 gap-0 md:grid-cols-2">
              {/* Left: Selected services */}
              <div className="flex flex-col border-r border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 max-h-[65vh]">
                <div className="border-b bg-white/80 px-6 py-4">
                  <h3 className="text-lg font-bold text-gray-800">
                    📝 บริการที่เลือก
                  </h3>
                  <p className="text-xs text-gray-500">
                    {selectedServices.length} รายการ
                    {selectedOpdGroup && ` · ${selectedOpdGroup.groupname}`}
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  {selectedServices.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <div className="mb-3 text-5xl">📂</div>
                      <p className="text-sm text-gray-500">
                        ยังไม่มีบริการที่เลือก
                      </p>
                      <p className="text-xs text-gray-400">
                        เลือกจากรายการทางขวามือ
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {selectedServices.map((entry) => (
                          <div
                            key={entry.id}
                            className="rounded-2xl border border-white bg-white p-4 shadow-md transition hover:shadow-lg"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-semibold text-gray-800">
                                  {entry.itemname}
                                </p>
                                <p className="text-xs text-gray-500">
                                  รหัส {entry.itemcode} · ราคา {formatCurrencyDisplay(entry.salesprice)}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveServiceEntry(entry.id)}
                                className="ml-2 rounded-full bg-red-100 p-1.5 text-red-600 transition hover:bg-red-200"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-3">
                              <div className="rounded-xl bg-emerald-50 p-3">
                                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                                  Charge
                                </p>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="บาท"
                                    value={entry.chargePrice}
                                    onChange={(e) => handleChargePriceChange(entry.id, e.target.value)}
                                    className="w-full rounded-lg border border-emerald-200 bg-white px-2 py-1.5 text-sm focus:border-emerald-400 focus:outline-none"
                                  />
                                  <input
                                    type="text"
                                    placeholder="%"
                                    value={entry.chargePercent}
                                    onChange={(e) => handleChargePercentChange(entry.id, e.target.value)}
                                    className="w-16 rounded-lg border border-emerald-200 bg-white px-2 py-1.5 text-center text-sm focus:border-emerald-400 focus:outline-none"
                                  />
                                </div>
                              </div>
                              <div className="rounded-xl bg-rose-50 p-3">
                                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-rose-700">
                                  Discount
                                </p>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="บาท"
                                    value={entry.discountPrice}
                                    onChange={(e) => handleDiscountPriceChange(entry.id, e.target.value)}
                                    className="w-full rounded-lg border border-rose-200 bg-white px-2 py-1.5 text-sm focus:border-rose-400 focus:outline-none"
                                  />
                                  <input
                                    type="text"
                                    placeholder="%"
                                    value={entry.discountPercent}
                                    onChange={(e) => handleDiscountPercentChange(entry.id, e.target.value)}
                                    className="w-16 rounded-lg border border-rose-200 bg-white px-2 py-1.5 text-center text-sm focus:border-rose-400 focus:outline-none"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="mt-3 flex items-center justify-between rounded-2xl border border-indigo-100 bg-indigo-50/40 px-3 py-2 text-sm font-semibold text-indigo-600">
                              <span>ยอดสุทธิ</span>
                              <span>{formatCurrencyDisplay(calculateServiceEntryTotal(entry))}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 rounded-2xl border border-dashed border-indigo-200 bg-white/80 px-4 py-3 text-sm text-gray-600 shadow-inner">
                        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-gray-500">
                          <span>สรุปยอด</span>
                          <span>{selectedServices.length} รายการ</span>
                        </div>
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between">
                            <span>รวมราคาพื้นฐาน</span>
                            <span className="font-semibold text-gray-700">
                              {formatCurrencyDisplay(selectedServicesTotals.baseTotal)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>รวมค่า Charge</span>
                            <span className="font-semibold text-gray-700">
                              {formatCurrencyDisplay(selectedServicesTotals.chargeTotal)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>รวมส่วนลด</span>
                            <span className="font-semibold text-gray-700">
                              {formatCurrencyDisplay(selectedServicesTotals.discountTotal)}
                            </span>
                          </div>
                          <div className="flex justify-between text-base font-semibold text-indigo-600">
                            <span>ยอดสุทธิทั้งหมด</span>
                            <span>{formatCurrencyDisplay(selectedServicesTotals.netTotal)}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Right: Available services */}
              <div className="flex flex-col bg-white max-h-[65vh]">
                <div className="border-b px-6 py-4">
                  <h3 className="text-lg font-bold text-gray-800">
                    📜 รายการบริการ
                  </h3>
                  {selectedOpdGroup && (
                    <p className="text-xs text-gray-500">{selectedOpdGroup.groupname}</p>
                  )}
                </div>
                <div className="px-6 py-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="🔍 ค้นหาบริการ..."
                      value={serviceSearchTerm}
                      onChange={(e) => setServiceSearchTerm(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-6 pb-4">
                  {servicesLoading && (
                    <div className="flex items-center justify-center py-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
                    </div>
                  )}
                  {serviceError && (
                    <p className="py-4 text-center text-sm text-red-600">{serviceError}</p>
                  )}
                  {!servicesLoading && !serviceError && filteredServiceItems.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="mb-2 text-4xl">💭</div>
                      <p className="text-sm text-gray-500">ไม่พบรายการบริการ</p>
                    </div>
                  )}
                  <div className="space-y-2">
                    {filteredServiceItems.map((item) => {
                      const alreadyAdded = selectedServices.some(
                        (entry) => entry.itemcode === item.itemcode
                      );
                      return (
                        <div
                          key={item.itemcode}
                          className={`flex items-center justify-between rounded-xl border px-4 py-3 transition ${alreadyAdded
                            ? "border-emerald-200 bg-emerald-50"
                            : "border-gray-100 bg-gray-50 hover:border-indigo-200 hover:bg-indigo-50"
                            }`}
                        >
                          <div>
                            <p className="font-medium text-gray-800">{item.itemname}</p>
                            <p className="text-xs text-gray-500">ราคา
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatCurrencyDisplay(item.saleprice)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddService(item)}
                            disabled={alreadyAdded}
                            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${alreadyAdded
                              ? "bg-emerald-200 text-emerald-700"
                              : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow hover:shadow-md"
                              }`}
                          >
                            {alreadyAdded ? "✓ เลือกแล้ว" : "เพิ่ม"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t bg-gray-50 px-8 py-4">
              <p className="text-sm text-gray-600">
                เลือกแล้ว <span className="font-bold text-indigo-600">{selectedServices.length}</span> รายการ
                <span className="mx-2 hidden text-xs text-gray-400 md:inline">·</span>
                <span className="mr-1">ยอดสุทธิ</span>
                <span className="font-bold text-indigo-600">
                  {formatCurrencyDisplay(selectedServicesTotals.netTotal)}
                </span>
              </p>
              <button
                type="button"
                onClick={handleCloseServiceDrawer}
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2.5 font-semibold text-white shadow-lg transition hover:from-indigo-700 hover:to-purple-700"
              >
                เสร็จสิ้น
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
