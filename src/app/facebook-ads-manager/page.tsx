"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

// ปิด root layout
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    header, footer, nav.navbar, .layout-grid > :not(main) {
      display: none !important;
    }
    body {
      padding: 0 !important;
      margin: 0 !important;
    }
    main, .layout-grid {
      padding: 0 !important;
      margin: 0 !important;
    }
  `;
  document.head.appendChild(style);
}

interface Action {
  action_type: string;
  value: string;
}

interface AdInsight {
  ad_id: string;
  ad_name: string;
  adset_id: string;
  adset_name: string;
  campaign_id: string;
  campaign_name: string;
  spend: string;
  impressions: string;
  clicks: string;
  ctr: string;
  cpc: string;
  cpm: string;
  actions?: Action[];
  date_start: string;
  date_stop: string;
  reach?: string;
  frequency?: string;
  cost_per_action_type?: { action_type: string; value: string }[];
}

interface ApiResponse {
  success: boolean;
  data: AdInsight[];
  error?: string;
  details?: any;
}

type ViewMode = "campaigns" | "adsets" | "ads";
type StatusFilter = "all" | "active" | "paused" | "archived";

export default function FacebookAdsManagerPage() {
  const [insights, setInsights] = useState<AdInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("ads");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [dateRange, setDateRange] = useState("today");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [customDateStart, setCustomDateStart] = useState("");
  const [customDateEnd, setCustomDateEnd] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [googleSheetsData, setGoogleSheetsData] = useState<number>(0);
  const [googleSheetsLoading, setGoogleSheetsLoading] = useState(false);
  const [googleAdsData, setGoogleAdsData] = useState<number>(0);
  const [googleAdsLoading, setGoogleAdsLoading] = useState(false);
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [dailyDataLoading, setDailyDataLoading] = useState(false);

  const fetchInsights = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // ใช้ API ใหม่ที่รองรับ campaign, adset, ad level
      // รองรับ time_range และ action_breakdowns
      const levelParam =
        viewMode === "campaigns"
          ? "campaign"
          : viewMode === "adsets"
          ? "adset"
          : "ad";

      // สร้าง URL parameters
      let url = `/api/facebook-ads-campaigns?level=${levelParam}`;

      // ใช้ filtering เพื่อให้ API ส่งมาแค่ action_type ที่ต้องการ
      const filtering = JSON.stringify([
        {
          field: "action_type",
          operator: "IN",
          value: [
            "onsite_conversion.messaging_first_reply",
            "onsite_conversion.total_messaging_connection",
          ],
        },
      ]);
      url += `&filtering=${encodeURIComponent(filtering)}`;
      url += `&action_breakdowns=action_type`;

      // ถ้าเลือก custom date ให้ใช้ time_range แทน date_preset
      if (dateRange === "custom" && customDateStart && customDateEnd) {
        const timeRange = JSON.stringify({
          since: customDateStart,
          until: customDateEnd,
        });
        url += `&time_range=${encodeURIComponent(timeRange)}`;
      } else {
        url += `&date_preset=${dateRange}`;
      }

      const response = await fetch(url);

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "ไม่สามารถดึงข้อมูลได้");
      }

      // รวมข้อมูลที่ซ้ำกัน (กรณีที่ API ส่งข้อมูลเดียวกันมาหลายแถวเพราะ action_breakdowns)
      const uniqueData = new Map<string, AdInsight>();

      result.data.forEach((item) => {
        const key = item.ad_id || item.adset_id || item.campaign_id;

        if (uniqueData.has(key)) {
          // ถ้ามีข้อมูลนี้อยู่แล้ว ให้รวม actions เข้าด้วยกัน
          const existing = uniqueData.get(key)!;

          // รวม actions โดยบวกค่าเข้าด้วยกัน
          if (item.actions) {
            if (!existing.actions) {
              existing.actions = [];
            }
            item.actions.forEach((action) => {
              const existingAction = existing.actions!.find(
                (a) => a.action_type === action.action_type
              );
              if (!existingAction) {
                existing.actions!.push(action);
              } else {
                // บวกรวมค่าถ้ามี action_type เดียวกัน
                const existingValue = parseInt(existingAction.value || "0");
                const newValue = parseInt(action.value || "0");
                existingAction.value = (existingValue + newValue).toString();
              }
            });
          }
        } else {
          // ถ้ายังไม่มี ให้เพิ่มเข้าไป
          uniqueData.set(key, { ...item });
        }
      });

      setInsights(Array.from(uniqueData.values()));
      setLastUpdated(new Date());
      setCountdown(60); // รีเซ็ต countdown เมื่ออัพเดทข้อมูลสำเร็จ
    } catch (err) {
      console.error("Error fetching insights:", err);
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }, [dateRange, viewMode, customDateStart, customDateEnd]);

  const fetchGoogleSheetsData = useCallback(async () => {
    try {
      setGoogleSheetsLoading(true);

      // สร้าง URL parameters สำหรับ Google Sheets API
      let url = "/api/google-sheets-data";

      // ถ้าเลือก custom date ให้ใช้ time_range แทน date_preset
      if (dateRange === "custom" && customDateStart && customDateEnd) {
        const timeRange = JSON.stringify({
          since: customDateStart,
          until: customDateEnd,
        });
        url += `?time_range=${encodeURIComponent(timeRange)}`;
      } else {
        url += `?date_preset=${dateRange}`;
      }

      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error("Google Sheets error:", result.error);
        setGoogleSheetsData(0);
      } else {
        setGoogleSheetsData(result.total || 0);
      }
    } catch (err) {
      console.error("Error fetching Google Sheets data:", err);
      setGoogleSheetsData(0);
    } finally {
      setGoogleSheetsLoading(false);
    }
  }, [dateRange, customDateStart, customDateEnd]);

  const fetchDailyData = useCallback(async () => {
    try {
      setDailyDataLoading(true);

      // กำหนดช่วงเวลา 30 วันย้อนหลังแบบคงที่ (ไม่ขึ้นกับ dateRange ที่เลือก)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const since = startDate.toISOString().split("T")[0];
      const until = endDate.toISOString().split("T")[0];

      // ดึงข้อมูล Facebook Ads แบบรายวัน
      const timeRange = JSON.stringify({ since, until });
      const fbUrl = `/api/facebook-ads-campaigns?level=campaign&time_range=${encodeURIComponent(
        timeRange
      )}&time_increment=1&action_breakdowns=action_type`;

      const fbResponse = await fetch(fbUrl);
      const fbResult: ApiResponse = await fbResponse.json();

      if (!fbResponse.ok || !fbResult.success) {
        throw new Error(
          fbResult.error || "ไม่สามารถดึงข้อมูล Facebook Ads ได้"
        );
      }

      // จัดกลุ่มข้อมูลตามวันที่
      const dataByDate = new Map<string, any>();

      fbResult.data.forEach((item) => {
        const date = item.date_start;

        if (!dataByDate.has(date)) {
          dataByDate.set(date, {
            date,
            spend: 0,
            clicks: 0,
            impressions: 0,
            messagingFirstReply: 0,
            messagingConnection: 0,
            googleSheets: 0,
            googleAds: 0,
          });
        }

        const dayData = dataByDate.get(date)!;
        dayData.spend += parseFloat(item.spend || "0");
        dayData.clicks += parseInt(item.clicks || "0");
        dayData.impressions += parseInt(item.impressions || "0");

        if (item.actions) {
          item.actions.forEach((action) => {
            if (
              action.action_type === "onsite_conversion.messaging_first_reply"
            ) {
              dayData.messagingFirstReply += parseInt(action.value || "0");
            }
            if (
              action.action_type ===
              "onsite_conversion.total_messaging_connection"
            ) {
              dayData.messagingConnection += parseInt(action.value || "0");
            }
          });
        }
      });

      // ดึงข้อมูล Google Sheets รายวัน
      try {
        const sheetsTimeRange = JSON.stringify({ since, until });
        const sheetsUrl = `/api/google-sheets-data?time_range=${encodeURIComponent(
          sheetsTimeRange
        )}&daily=true`;

        const sheetsResponse = await fetch(sheetsUrl);
        const sheetsResult = await sheetsResponse.json();

        if (
          sheetsResponse.ok &&
          sheetsResult.success &&
          sheetsResult.dailyData
        ) {
          // รวมข้อมูล Google Sheets เข้ากับข้อมูลที่มีอยู่
          sheetsResult.dailyData.forEach((sheetDay: any) => {
            if (dataByDate.has(sheetDay.date)) {
              dataByDate.get(sheetDay.date)!.googleSheets = sheetDay.count || 0;
            } else {
              // ถ้ายังไม่มีวันนี้ในข้อมูล ให้เพิ่มเข้าไป
              dataByDate.set(sheetDay.date, {
                date: sheetDay.date,
                spend: 0,
                clicks: 0,
                impressions: 0,
                messagingFirstReply: 0,
                messagingConnection: 0,
                googleSheets: sheetDay.count || 0,
                googleAds: 0,
              });
            }
          });
        }
      } catch (sheetsErr) {
        console.error("Error fetching Google Sheets daily data:", sheetsErr);
        // ไม่ throw error เพราะเราต้องการให้แสดงข้อมูล FB Ads ต่อไป
      }

      // ดึงข้อมูล Google Ads รายวัน
      try {
        const adsUrl = `/api/google-ads?startDate=${since}&endDate=${until}&daily=true`;

        const adsResponse = await fetch(adsUrl);
        const adsResult = await adsResponse.json();

        if (adsResponse.ok && !adsResult.error && adsResult.dailyData) {
          // รวมข้อมูล Google Ads เข้ากับข้อมูลที่มีอยู่
          adsResult.dailyData.forEach((adsDay: any) => {
            if (dataByDate.has(adsDay.date)) {
              dataByDate.get(adsDay.date)!.googleAds = adsDay.clicks || 0;
            } else {
              // ถ้ายังไม่มีวันนี้ในข้อมูล ให้เพิ่มเข้าไป
              dataByDate.set(adsDay.date, {
                date: adsDay.date,
                spend: 0,
                clicks: 0,
                impressions: 0,
                messagingFirstReply: 0,
                messagingConnection: 0,
                googleSheets: 0,
                googleAds: adsDay.clicks || 0,
              });
            }
          });
        }
      } catch (adsErr) {
        console.error("Error fetching Google Ads daily data:", adsErr);
        // ไม่ throw error เพราะเราต้องการให้แสดงข้อมูล FB Ads ต่อไป
      }

      // แปลงเป็น array และเรียงตามวันที่
      const dailyArray = Array.from(dataByDate.values()).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setDailyData(dailyArray);
    } catch (err) {
      console.error("Error fetching daily data:", err);
      setDailyData([]);
    } finally {
      setDailyDataLoading(false);
    }
  }, []);

  const fetchGoogleAdsData = useCallback(async () => {
    try {
      setGoogleAdsLoading(true);

      // สร้าง URL parameters สำหรับ Google Ads API
      let url = "/api/google-ads";

      // ถ้าเลือก custom date ให้ส่ง startDate และ endDate
      if (dateRange === "custom" && customDateStart && customDateEnd) {
        url += `?startDate=${customDateStart}&endDate=${customDateEnd}`;
      } else {
        // แปลง date_preset เป็น startDate และ endDate
        const today = new Date();
        let startDate = "";
        let endDate = today.toISOString().split("T")[0];

        switch (dateRange) {
          case "today":
            startDate = endDate;
            break;
          case "yesterday":
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            startDate = endDate = yesterday.toISOString().split("T")[0];
            break;
          case "last_7d":
            const last7d = new Date(today);
            last7d.setDate(last7d.getDate() - 7);
            startDate = last7d.toISOString().split("T")[0];
            break;
          case "last_30d":
            const last30d = new Date(today);
            last30d.setDate(last30d.getDate() - 30);
            startDate = last30d.toISOString().split("T")[0];
            break;
          case "this_month":
            startDate = new Date(today.getFullYear(), today.getMonth(), 1)
              .toISOString()
              .split("T")[0];
            break;
          case "last_month":
            const lastMonth = new Date(
              today.getFullYear(),
              today.getMonth() - 1,
              1
            );
            const lastMonthEnd = new Date(
              today.getFullYear(),
              today.getMonth(),
              0
            );
            startDate = lastMonth.toISOString().split("T")[0];
            endDate = lastMonthEnd.toISOString().split("T")[0];
            break;
          default:
            startDate = endDate;
        }

        url += `?startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok || result.error) {
        console.error("Google Ads API Error:", {
          status: response.status,
          error: result.error,
          details: result.details,
          message: result.message,
        });
        setGoogleAdsData(0);
      } else {
        // นับรวม clicks ทั้งหมดจาก campaigns
        const totalClicks = result.summary?.totalClicks || 0;
        console.log("✅ Google Ads Data:", {
          totalClicks,
          campaigns: result.campaigns?.length || 0,
          dateRange: result.dateRange,
        });
        setGoogleAdsData(totalClicks);
      }
    } catch (err) {
      console.error("Error fetching Google Ads data:", err);
      setGoogleAdsData(0);
    } finally {
      setGoogleAdsLoading(false);
    }
  }, [dateRange, customDateStart, customDateEnd]);

  useEffect(() => {
    fetchInsights();
    fetchGoogleSheetsData();
    fetchGoogleAdsData();
    fetchDailyData();
  }, [
    fetchInsights,
    fetchGoogleSheetsData,
    fetchGoogleAdsData,
    fetchDailyData,
  ]);

  // Auto-refresh ทุก 1 นาที
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      console.log("🔄 Auto-refreshing all data...");
      fetchInsights();
      fetchGoogleSheetsData();
      fetchGoogleAdsData();
      fetchDailyData();
    }, 60000); // 60000ms = 1 นาที

    return () => clearInterval(refreshInterval);
  }, [
    fetchInsights,
    fetchGoogleSheetsData,
    fetchGoogleAdsData,
    fetchDailyData,
  ]);

  // Countdown timer
  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, []);

  // ปิด date picker เมื่อคลิกข้างนอก modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // ตรวจสอบว่าคลิกที่ overlay (พื้นที่มืด) เท่านั้น ไม่ใช่ใน modal
      if (showDatePicker && target.classList.contains("modal-overlay")) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDatePicker]);

  const formatNumber = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return isNaN(num)
      ? "—"
      : num.toLocaleString("th-TH", { maximumFractionDigits: 2 });
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return isNaN(num)
      ? "—"
      : `฿${num.toLocaleString("th-TH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
  };

  const formatPercentage = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return isNaN(num)
      ? "—"
      : `${num.toLocaleString("th-TH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}%`;
  };

  const getResultsByActionType = (
    actions: Action[] | undefined,
    actionType: string
  ) => {
    if (!actions) return 0;
    const action = actions.find((a) => a.action_type === actionType);
    return action ? parseInt(action.value || "0") : 0;
  };

  const getAverageCTR = () => {
    const totalCTR = insights.reduce(
      (sum, ad) => sum + parseFloat(ad.ctr || "0"),
      0
    );
    return insights.length > 0 ? totalCTR / insights.length : 0;
  };

  const getAverageCPC = () => {
    const totalCPC = insights.reduce(
      (sum, ad) => sum + parseFloat(ad.cpc || "0"),
      0
    );
    return insights.length > 0 ? totalCPC / insights.length : 0;
  };

  const getAverageCPM = () => {
    const totalCPM = insights.reduce(
      (sum, ad) => sum + parseFloat(ad.cpm || "0"),
      0
    );
    return insights.length > 0 ? totalCPM / insights.length : 0;
  };

  const filteredInsights = insights.filter((ad) => {
    // กรองตาม search query ถ้ามี
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        ad.ad_name.toLowerCase().includes(query) ||
        ad.campaign_name.toLowerCase().includes(query) ||
        ad.ad_id.includes(query)
      );
    }
    return true;
  });

  const getTotalSpend = () => {
    return filteredInsights.reduce(
      (sum, ad) => sum + parseFloat(ad.spend || "0"),
      0
    );
  };

  const getTotalImpressions = () => {
    return filteredInsights.reduce(
      (sum, ad) => sum + parseInt(ad.impressions || "0"),
      0
    );
  };

  const getTotalClicks = () => {
    return filteredInsights.reduce(
      (sum, ad) => sum + parseInt(ad.clicks || "0"),
      0
    );
  };

  const getTotalResults = () => {
    let total = 0;
    filteredInsights.forEach((ad) => {
      if (ad.actions) {
        // ดึงค่า onsite_conversion.messaging_first_reply (ผู้ติดต่อผ่านการส่งข้อความรายใหม่)
        const messagingAction = ad.actions.find(
          (action) =>
            action.action_type === "onsite_conversion.messaging_first_reply"
        );
        if (messagingAction) {
          const value = parseInt(messagingAction.value || "0");
          total += value;
        }
      }
    });
    return total;
  };

  const getTotalMessagingConnection = () => {
    let total = 0;
    filteredInsights.forEach((ad) => {
      if (ad.actions) {
        // ดึงค่า onsite_conversion.total_messaging_connection (การส่งข้อความเพื่อเริ่มการสนทนา)
        const messagingAction = ad.actions.find(
          (action) =>
            action.action_type ===
            "onsite_conversion.total_messaging_connection"
        );
        if (messagingAction) {
          const value = parseInt(messagingAction.value || "0");
          total += value;
        }
      }
    });
    return total;
  };

  const toggleRowSelection = (id: string) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedRows(newSelection);
  };

  const toggleAllRows = () => {
    if (selectedRows.size === insights.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(insights.map((ad) => ad.ad_id)));
    }
  };

  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
    if (value === "custom") {
      // ตั้งค่าวันที่เริ่มต้นเป็นวันนี้ก่อนเปิด date picker
      const today = new Date().toISOString().split("T")[0];
      if (!customDateStart) setCustomDateStart(today);
      if (!customDateEnd) setCustomDateEnd(today);
      setShowDatePicker(true);
    } else {
      setShowDatePicker(false);
    }
  };

  const applyCustomDateRange = () => {
    if (customDateStart && customDateEnd) {
      // ปิด date picker ก่อน
      setShowDatePicker(false);
      // ตั้งค่า dateRange ทีหลังเพื่อให้ useEffect ทำงาน
      setTimeout(() => {
        setDateRange("custom");
      }, 0);
    }
  };

  const getDateRangeLabel = () => {
    if (dateRange === "custom" && customDateStart && customDateEnd) {
      return `${customDateStart} ถึง ${customDateEnd}`;
    }
    const labels: Record<string, string> = {
      today: "วันนี้",
      yesterday: "เมื่อวาน",
      last_7d: "7 วันที่แล้ว",
      last_30d: "30 วันที่แล้ว",
      this_month: "เดือนนี้",
      last_month: "เดือนที่แล้ว",
    };
    return labels[dateRange] || "เลือกช่วงเวลา";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const isTokenError =
      error.includes("Access Token") || error.includes("FACEBOOK_ACCESS_TOKEN");
    const isProduction = process.env.NODE_ENV === "production";

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
          <div className="text-red-500 text-5xl mb-4 text-center">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
            เกิดข้อผิดพลาด
          </h2>
          <p className="text-gray-600 mb-6 text-center">{error}</p>

          {isTokenError && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    {isProduction
                      ? "วิธีแก้ไขสำหรับ Production"
                      : "วิธีแก้ไขสำหรับ Local Development"}
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    {isProduction ? (
                      <>
                        <p className="mb-2">
                          กรุณาตั้งค่า Environment Variables บน hosting
                          platform:
                        </p>
                        <ol className="list-decimal list-inside space-y-1 ml-2">
                          <li>เข้าสู่ Vercel/Netlify Dashboard</li>
                          <li>
                            ไปที่ Project Settings → Environment Variables
                          </li>
                          <li>
                            เพิ่ม:{" "}
                            <code className="bg-blue-100 px-1 rounded">
                              FACEBOOK_ACCESS_TOKEN
                            </code>
                          </li>
                          <li>
                            เพิ่ม:{" "}
                            <code className="bg-blue-100 px-1 rounded">
                              FACEBOOK_AD_ACCOUNT_ID
                            </code>
                          </li>
                          <li>Re-deploy โปรเจค</li>
                        </ol>
                        <p className="mt-3">
                          📚 อ่านคู่มือ:{" "}
                          <span className="font-semibold">
                            PRODUCTION_DEPLOYMENT.md
                          </span>
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="mb-2">
                          สร้างไฟล์{" "}
                          <code className="bg-blue-100 px-1 rounded">
                            .env.local
                          </code>{" "}
                          ในโฟลเดอร์ package/
                        </p>
                        <pre className="bg-gray-800 text-green-400 p-3 rounded mt-2 text-xs overflow-x-auto">
                          {`FACEBOOK_ACCESS_TOKEN=your_token_here
FACEBOOK_AD_ACCOUNT_ID=act_1234567890`}
                        </pre>
                        <p className="mt-2">
                          📚 ดูตัวอย่างที่:{" "}
                          <span className="font-semibold">
                            .env.local.example
                          </span>
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={fetchInsights}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              ลองอีกครั้ง
            </button>
            <a
              href="/api/facebook-ads-campaigns?level=campaign&date_preset=today"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded transition-colors text-center"
            >
              ทดสอบ API
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Calendar Date Picker */}
      {showDatePicker && (
        <div
          className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            // ปิด modal เมื่อคลิกที่ overlay เท่านั้น
            if (e.target === e.currentTarget) {
              setShowDatePicker(false);
            }
          }}
        >
          <div
            className="date-picker-container bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <svg
                  className="w-7 h-7 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                เลือกช่วงวันที่
              </h3>
              <button
                onClick={() => setShowDatePicker(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all text-2xl w-10 h-10 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Start Date Calendar */}
              <div>
                <label className="block text-base font-bold text-gray-700 mb-4">
                  📅 จากวันที่
                </label>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-300 shadow-md">
                  <input
                    type="date"
                    value={
                      customDateStart || new Date().toISOString().split("T")[0]
                    }
                    onChange={(e) => setCustomDateStart(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl text-lg font-medium focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500 cursor-pointer bg-white hover:border-blue-400 transition-all"
                    style={{ colorScheme: "light" }}
                    required
                  />
                </div>
              </div>

              {/* End Date Calendar */}
              <div>
                <label className="block text-base font-bold text-gray-700 mb-4">
                  📅 ถึงวันที่
                </label>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border-2 border-orange-300 shadow-md">
                  <input
                    type="date"
                    value={
                      customDateEnd || new Date().toISOString().split("T")[0]
                    }
                    onChange={(e) => setCustomDateEnd(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl text-lg font-medium focus:outline-none focus:ring-4 focus:ring-orange-300 focus:border-orange-500 cursor-pointer bg-white hover:border-orange-400 transition-all"
                    style={{ colorScheme: "light" }}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 justify-end">
              <button
                onClick={() => setShowDatePicker(false)}
                className="px-10 py-4 text-base border-2 border-gray-300 rounded-xl hover:bg-gray-100 transition-colors font-semibold text-gray-700 shadow-md hover:shadow-lg"
              >
                ยกเลิก
              </button>
              <button
                onClick={applyCustomDateRange}
                className="px-10 py-4 text-base bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                ✓ ตกลง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Mode Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex items-center justify-between">
          <div className="flex space-x-1">
            <button
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                viewMode === "campaigns"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
              }`}
              onClick={() => setViewMode("campaigns")}
            >
              แคมเปญ
            </button>
            <button
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                viewMode === "adsets"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
              }`}
              onClick={() => setViewMode("adsets")}
            >
              ชุดโฆษณา
            </button>
            <button
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                viewMode === "ads"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
              }`}
              onClick={() => setViewMode("ads")}
            >
              โฆษณา
            </button>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="font-medium">{getDateRangeLabel()}</span>
              </button>
            </div>
            <div className="h-4 w-px bg-gray-300"></div>
            <span className="text-gray-600">
              ผลลัพธ์จาก {filteredInsights.length} รายการ
            </span>
            <div className="h-4 w-px bg-gray-300"></div>
            <div className="flex items-center space-x-2 text-xs">
              <div className="flex items-center space-x-1">
                <div className="relative">
                  <svg
                    className={`w-4 h-4 text-green-500 ${
                      countdown <= 10 ? "animate-pulse" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  {countdown <= 5 && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                  )}
                </div>
                <span className="text-gray-600">
                  อัพเดทใน{" "}
                  <span className="font-semibold text-green-600">
                    {countdown}
                  </span>{" "}
                  วินาที
                </span>
              </div>
              {lastUpdated && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500">
                    อัพเดทล่าสุด:{" "}
                    {lastUpdated.toLocaleTimeString("th-TH", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                </>
              )}
              <button
                onClick={() => fetchInsights()}
                className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                title="รีเฟรชข้อมูลทันที"
              >
                <svg
                  className="w-4 h-4 text-blue-600 hover:text-blue-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Summary Cards */}
      {filteredInsights.length > 0 && (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-600 font-medium">
                  ข้อมูลเรียลไทม์
                </span>
              </div>
              {lastUpdated && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs text-gray-500">
                    อัพเดทอัตโนมัติทุก 1 นาที
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>อัพเดทครั้งถัดไปใน {countdown} วินาที</span>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-6">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200 shadow-sm relative overflow-hidden">
              {countdown <= 5 && (
                <div className="absolute top-0 right-0 w-20 h-20 bg-orange-200 rounded-full filter blur-xl opacity-50 animate-pulse"></div>
              )}
              <div className="text-sm text-orange-600 font-semibold mb-2 relative">
                จำนวนเงินที่ใช้จ่ายไป
              </div>
              <div className="text-3xl font-bold text-orange-900 relative">
                {formatCurrency(getTotalSpend())}
              </div>
              <div className="text-xs text-orange-500 mt-1 relative">
                Total Spend
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200 shadow-sm relative overflow-hidden">
              {countdown <= 5 && (
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200 rounded-full filter blur-xl opacity-50 animate-pulse"></div>
              )}
              <div className="text-sm text-blue-600 font-semibold mb-2 relative">
                ผู้ติดต่อผ่านการส่งข้อความรายใหม่
              </div>
              <div className="text-3xl font-bold text-blue-900 relative">
                {formatNumber(getTotalResults())}
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200 shadow-sm relative overflow-hidden">
              {countdown <= 5 && (
                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-200 rounded-full filter blur-xl opacity-50 animate-pulse"></div>
              )}
              <div className="text-sm text-purple-600 font-semibold mb-2 relative">
                การส่งข้อความเพื่อเริ่มการสนทนา
              </div>
              <div className="text-3xl font-bold text-purple-900 relative">
                {formatNumber(getTotalMessagingConnection())}
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200 shadow-sm relative overflow-hidden">
              {countdown <= 5 && (
                <div className="absolute top-0 right-0 w-20 h-20 bg-green-200 rounded-full filter blur-xl opacity-50 animate-pulse"></div>
              )}
              <div className="text-sm text-green-600 font-semibold mb-2 relative flex items-center gap-1">
                📊 ได้ชื่อได้เบอร์ (Google Sheets)
              </div>
              <div className="text-3xl font-bold text-green-900 relative">
                {googleSheetsLoading ? (
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
                ) : (
                  formatNumber(googleSheetsData)
                )}
              </div>
              <div className="text-xs text-green-500 mt-1 relative">
                จากชีท: เคสได้ชื่อเบอร์
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200 shadow-sm relative overflow-hidden">
              {countdown <= 5 && (
                <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-200 rounded-full filter blur-xl opacity-50 animate-pulse"></div>
              )}
              <div className="text-sm text-yellow-600 font-semibold mb-2 relative flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                ข้อมูลการคลิกของ Google Ads
              </div>
              <div className="text-3xl font-bold text-yellow-900 relative">
                {googleAdsLoading ? (
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-600"></div>
                ) : (
                  formatNumber(googleAdsData)
                )}
              </div>
              <div className="text-xs text-yellow-500 mt-1 relative">
                Total Clicks from Google Ads
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              disabled={selectedRows.size === 0}
              className={`px-4 py-2 rounded transition-colors text-sm font-medium ${
                selectedRows.size > 0
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  : "bg-gray-50 text-gray-400 cursor-not-allowed"
              }`}
            >
              แก้ไข
            </button>
            <button
              disabled={selectedRows.size === 0}
              className={`px-4 py-2 rounded transition-colors text-sm ${
                selectedRows.size > 0
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  : "bg-gray-50 text-gray-400 cursor-not-allowed"
              }`}
            >
              สร้างซ้ำ
            </button>
            <button
              disabled={selectedRows.size === 0}
              className={`px-4 py-2 rounded transition-colors text-sm ${
                selectedRows.size > 0
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  : "bg-gray-50 text-gray-400 cursor-not-allowed"
              }`}
            >
              การทดสอบ A/B
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm">
              ส่งออก
            </button>
            <select
              disabled={selectedRows.size === 0}
              className={`px-4 py-2 border border-gray-300 rounded transition-colors text-sm ${
                selectedRows.size > 0
                  ? "hover:bg-gray-50"
                  : "text-gray-400 cursor-not-allowed"
              }`}
            >
              <option>เพิ่มเติม ▼</option>
              <option>ลบ</option>
              <option>เก็บถาวร</option>
              <option>แชร์</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm flex items-center space-x-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              <span>คอลัมน์: กำหนดเอง</span>
            </button>
            <button className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm flex items-center space-x-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span>แผนภูมิ</span>
            </button>
            <button className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Daily Data Table - ตารางข้อมูลรายวัน */}
      <div className="bg-white mx-6 my-4 rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            📊 ข้อมูลรายวัน (30 วันย้อนหลัง)
          </h2>
          <p className="text-indigo-100 text-sm mt-1">
            สรุปผลการทำโฆษณาแต่ละวัน
          </p>
        </div>

        <div className="overflow-x-auto">
          {dailyDataLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mb-2"></div>
                <p className="text-gray-600 text-sm">
                  กำลังโหลดข้อมูลรายวัน...
                </p>
              </div>
            </div>
          ) : dailyData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg
                className="w-12 h-12 mx-auto mb-3 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p>ไม่มีข้อมูลรายวัน</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-indigo-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    วัน/เดือน/ปี
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-orange-700 uppercase tracking-wider">
                    <div className="flex items-center justify-end gap-2">
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      จำนวนเงินที่ใช้จ่ายไป
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-blue-700 uppercase tracking-wider">
                    <div className="flex items-center justify-end gap-2">
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      ผู้ติดต่อผ่านการส่งข้อความรายใหม่
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-purple-700 uppercase tracking-wider">
                    <div className="flex items-center justify-end gap-2">
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      การส่งข้อความเพื่อเริ่มการสนทนา
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-green-700 uppercase tracking-wider">
                    <div className="flex items-center justify-end gap-2">
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path
                          d="M11.318 12.545H7.91v-1.091h3.41v1.09zm0 2.182H7.91v-1.091h3.41v1.09zm0 2.182H7.91v-1.091h3.41v1.09zm6.819-4.364H14.728v-1.091h3.41v1.09zm0 2.182H14.728v-1.091h3.41v1.09zm0 2.182H14.728v-1.091h3.41v1.09zm0-10.909v2.182h-3.41V6h-3.818v2.182H7.91V6H2v16.364h20V6h-3.863zM20.727 21.09H3.273V10.364h17.454V21.09zm0-12.545H3.273V7.636h17.454v.91z"
                          fill="#0F9D58"
                        />
                      </svg>
                      ได้ชื่อได้เบอร์ (Google Sheets)
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-yellow-700 uppercase tracking-wider">
                    <div className="flex items-center justify-end gap-2">
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      ข้อมูลการคลิกของ Google Ads
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {dailyData.map((day, index) => (
                  <tr
                    key={day.date}
                    className={`hover:bg-indigo-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                        <span className="font-medium text-gray-900">
                          {new Date(day.date).toLocaleDateString("th-TH", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-orange-600">
                      {formatCurrency(day.spend)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-blue-600">
                      {formatNumber(day.messagingFirstReply)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-purple-600">
                      {formatNumber(day.messagingConnection)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-green-600">
                      {formatNumber(day.googleSheets)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-yellow-600">
                      {formatNumber(day.googleAds)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gradient-to-r from-indigo-100 to-purple-100 border-t-2 border-indigo-300">
                <tr>
                  <td className="px-4 py-4 font-bold text-indigo-900 text-base">
                    รวมทั้งหมด
                  </td>
                  <td className="px-4 py-4 text-right font-bold text-orange-700 text-base">
                    {formatCurrency(
                      dailyData.reduce((sum, day) => sum + day.spend, 0)
                    )}
                  </td>
                  <td className="px-4 py-4 text-right font-bold text-blue-700 text-base">
                    {formatNumber(
                      dailyData.reduce(
                        (sum, day) => sum + day.messagingFirstReply,
                        0
                      )
                    )}
                  </td>
                  <td className="px-4 py-4 text-right font-bold text-purple-700 text-base">
                    {formatNumber(
                      dailyData.reduce(
                        (sum, day) => sum + day.messagingConnection,
                        0
                      )
                    )}
                  </td>
                  <td className="px-4 py-4 text-right font-bold text-green-700 text-base">
                    {formatNumber(
                      dailyData.reduce((sum, day) => sum + day.googleSheets, 0)
                    )}
                  </td>
                  <td className="px-4 py-4 text-right font-bold text-yellow-700 text-base">
                    {formatNumber(
                      dailyData.reduce((sum, day) => sum + day.googleAds, 0)
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
