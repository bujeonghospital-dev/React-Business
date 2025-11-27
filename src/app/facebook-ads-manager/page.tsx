"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FacebookProvider, EmbeddedPost } from "react-facebook";

// Declare Facebook SDK types
declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

// Facebook SDK Initialization
if (typeof window !== "undefined") {
  window.fbAsyncInit = function () {
    if (window.FB) {
      window.FB.init({
        xfbml: true,
        version: "v18.0",
      });
    }
  };

  if (!document.getElementById("facebook-jssdk")) {
    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = "https://connect.facebook.net/th_TH/sdk.js";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
  }
}

// CSS Styles
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    header, footer, nav.navbar, .layout-grid > :not(main) {
      display: none !important;
    }
    body {
      padding: 0 !important;
      margin: 0 !important;
      overflow-x: hidden !important;
    }
    main, .layout-grid {
      padding: 0 !important;
      margin: 0 !important;
    }
    @media (max-width: 640px) {
      .min-h-screen {
        min-height: 100vh !important;
      }
    }
    @media (max-width: 768px) {
      .overflow-x-auto {
        overflow-x: auto !important;
        -webkit-overflow-scrolling: touch !important;
      }
    }
    .modal-overlay {
      backdrop-filter: blur(8px);
      animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .video-modal-container {
      animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { 
        opacity: 0;
        transform: translateY(30px) scale(0.95);
      }
      to { 
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `;
  document.head.appendChild(style);
}

interface Action {
  action_type: string;
  value: string;
}

interface AdCreative {
  id: string;
  thumbnail_url?: string;
  image_url?: string;
  video_id?: string;
  object_story_spec?: any;
  effective_object_story_id?: string;
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
  conversions?: Action[];
  date_start: string;
  date_stop: string;
  reach?: string;
  frequency?: string;
  cost_per_action_type?: { action_type: string; value: string }[];
  creative?: AdCreative;
}

interface ApiResponse {
  success: boolean;
  data: AdInsight[];
  error?: string;
  details?: any;
}

type ViewMode = "campaigns" | "adsets" | "ads";

export default function FacebookAdsManagerPage() {
  const router = useRouter();
  const [insights, setInsights] = useState<AdInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("ads");
  const [dateRange, setDateRange] = useState("today");
  const [customDateStart, setCustomDateStart] = useState("");
  const [customDateEnd, setCustomDateEnd] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [googleSheetsData, setGoogleSheetsData] = useState<number>(0);
  const [googleSheetsLoading, setGoogleSheetsLoading] = useState(false);
  const [googleAdsData, setGoogleAdsData] = useState<number>(0);
  const [googleAdsLoading, setGoogleAdsLoading] = useState(false);
  const [facebookBalance, setFacebookBalance] = useState<number>(0);
  const [facebookBalanceLoading, setFacebookBalanceLoading] = useState(false);
  const [phoneCountData, setPhoneCountData] = useState<{
    total: number;
    datesWithData: number;
  }>({ total: 0, datesWithData: 0 });
  const [phoneCountLoading, setPhoneCountLoading] = useState(false);
  const [adCreatives, setAdCreatives] = useState<Map<string, AdCreative>>(
    new Map()
  );
  const [creativesLoading, setCreativesLoading] = useState(false);
  const [selectedAdForPreview, setSelectedAdForPreview] =
    useState<AdInsight | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [topAdsSortBy, setTopAdsSortBy] = useState<"leads" | "cost" | "phone">(
    "leads"
  );
  const [dailySummaryData, setDailySummaryData] = useState<AdInsight[]>([]);
  const [dailySummaryLoading, setDailySummaryLoading] = useState(false);
  const [phoneLeadsData, setPhoneLeadsData] = useState<{
    [date: string]: number;
  }>({});
  const [phoneLeadsLoading, setPhoneLeadsLoading] = useState(false);
  const [topAdsPhoneLeads, setTopAdsPhoneLeads] = useState<Map<string, number>>(
    new Map()
  );
  const [topAdsPhoneLeadsLoading, setTopAdsPhoneLeadsLoading] = useState(false);
  const [topAdsLimit, setTopAdsLimit] = useState<5 | 10 | 15 | 20 | 30 | "all">(
    20
  );
  const [adsetDetailsData, setAdsetDetailsData] = useState<any[]>([]);
  const [adsetDetailsLoading, setAdsetDetailsLoading] = useState(false);
  const [selectedAdDetail, setSelectedAdDetail] = useState<AdInsight | null>(
    null
  );
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Re-parse Facebook SDK when modal opens
  useEffect(() => {
    if (showVideoModal && typeof window !== "undefined" && window.FB) {
      setTimeout(() => {
        if (window.FB) {
          window.FB.XFBML.parse();
        }
      }, 100);
    }
  }, [showVideoModal, selectedAdForPreview]);

  const fetchAdCreatives = useCallback(async (adIds: string[]) => {
    setCreativesLoading(true);
    try {
      const creativesMap = new Map<string, AdCreative>();
      for (const adId of adIds) {
        try {
          const response = await fetch(
            `/api/facebook-ads-creative?ad_id=${adId}`
          );
          const result = await response.json();
          if (result.success && result.data) {
            creativesMap.set(adId, result.data);
          }
        } catch (error) {
          // Error fetching creative
        }
      }
      setAdCreatives(new Map(creativesMap));
    } catch (error) {
      // Fatal error
    } finally {
      setCreativesLoading(false);
    }
  }, []);

  const fetchTopAdsPhoneLeads = useCallback(
    async (adIds: string[]) => {
      try {
        setTopAdsPhoneLeadsLoading(true);
        const adIdsParam = adIds.join(",");

        const today = new Date();
        let startDate: string;
        let endDate: string = today.toISOString().split("T")[0];

        if (dateRange === "custom" && customDateStart && customDateEnd) {
          startDate = customDateStart;
          endDate = customDateEnd;
        } else {
          let start: Date;
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
              start = new Date(today);
              start.setDate(start.getDate() - 7);
              startDate = start.toISOString().split("T")[0];
              break;
            case "last_14d":
              start = new Date(today);
              start.setDate(start.getDate() - 14);
              startDate = start.toISOString().split("T")[0];
              break;
            case "last_30d":
              start = new Date(today);
              start.setDate(start.getDate() - 30);
              startDate = start.toISOString().split("T")[0];
              break;
            case "this_month":
              start = new Date(today.getFullYear(), today.getMonth(), 1);
              startDate = start.toISOString().split("T")[0];
              break;
            case "last_month":
              start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
              const lastMonthEnd = new Date(
                today.getFullYear(),
                today.getMonth(),
                0
              );
              startDate = start.toISOString().split("T")[0];
              endDate = lastMonthEnd.toISOString().split("T")[0];
              break;
            default:
              startDate = endDate;
          }
        }

        const response = await fetch(
          `/api/facebook-ads-phone-leads-sql?ad_ids=${adIdsParam}&date_start=${startDate}&date_end=${endDate}`
        );
        const result = await response.json();
        if (result.success && result.data) {
          const phoneLeadsMap = new Map<string, number>();
          Object.keys(result.data).forEach((adId) => {
            phoneLeadsMap.set(adId, result.data[adId]);
          });
          setTopAdsPhoneLeads(new Map(phoneLeadsMap));
        }
      } catch (error) {
        setTopAdsPhoneLeads(new Map());
      } finally {
        setTopAdsPhoneLeadsLoading(false);
      }
    },
    [dateRange, customDateStart, customDateEnd]
  );

  const fetchInsights = useCallback(
    async (isBackgroundRefresh = false, retryCount = 0) => {
      try {
        if (!isBackgroundRefresh) {
          setLoading(true);
        }
        setError(null);
        const levelParam =
          viewMode === "campaigns"
            ? "campaign"
            : viewMode === "adsets"
            ? "adset"
            : "ad";
        let url = `https://believable-ambition-production.up.railway.app/api/facebook-ads-campaigns?level=${levelParam}`;
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

        if (
          response.status === 403 &&
          result.error?.includes("Application request limit reached")
        ) {
          const retryDelay = Math.min(30000 * Math.pow(2, retryCount), 120000);
          setError(
            `⏳ API Rate Limit - จะรีเฟรชอัตโนมัติในอีก ${
              retryDelay / 1000
            } วินาที... (ครั้งที่ ${retryCount + 1})`
          );

          setTimeout(() => {
            if (retryCount < 3) {
              fetchInsights(isBackgroundRefresh, retryCount + 1);
            } else {
              setError(
                "❌ API Rate Limit - เกินจำนวนครั้งที่กำหนด กรุณารอสักครู่แล้วลองใหม่อีกครั้ง"
              );
              setLoading(false);
            }
          }, retryDelay);

          return;
        }

        if (!response.ok || !result.success) {
          throw new Error(result.error || "ไม่สามารถดึงข้อมูลได้");
        }
        const uniqueData = new Map<string, AdInsight>();
        result.data.forEach((item) => {
          const key = item.ad_id || item.adset_id || item.campaign_id;
          if (uniqueData.has(key)) {
            const existing = uniqueData.get(key)!;
            if (item.actions) {
              if (!existing.actions) existing.actions = [];
              item.actions.forEach((action) => {
                const existingAction = existing.actions!.find(
                  (a) => a.action_type === action.action_type
                );
                if (existingAction) {
                  existingAction.value = String(
                    parseInt(existingAction.value || "0") +
                      parseInt(action.value || "0")
                  );
                } else {
                  existing.actions!.push({ ...action });
                }
              });
            }
            if (item.conversions) {
              if (!existing.conversions) existing.conversions = [];
              item.conversions.forEach((conversion) => {
                const existingConversion = existing.conversions!.find(
                  (c) => c.action_type === conversion.action_type
                );
                if (existingConversion) {
                  existingConversion.value = String(
                    parseInt(existingConversion.value || "0") +
                      parseInt(conversion.value || "0")
                  );
                } else {
                  existing.conversions!.push({ ...conversion });
                }
              });
            }
          } else {
            uniqueData.set(key, { ...item });
          }
        });
        const insightsArray = Array.from(uniqueData.values());
        setInsights(insightsArray);

        const allAdIds = insightsArray
          .filter((item) => item.ad_id)
          .map((item) => item.ad_id);
        if (allAdIds.length > 0) {
          fetchAdCreatives(allAdIds);
          fetchTopAdsPhoneLeads(allAdIds);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      } finally {
        if (!isBackgroundRefresh) {
          setLoading(false);
        }
      }
    },
    [
      dateRange,
      viewMode,
      customDateStart,
      customDateEnd,
      fetchAdCreatives,
      fetchTopAdsPhoneLeads,
    ]
  );

  const fetchGoogleSheetsData = useCallback(async () => {
    try {
      setGoogleSheetsLoading(true);
      let url =
        "https://believable-ambition-production.up.railway.app/api/google-sheets-data";
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
        setGoogleSheetsData(0);
      } else {
        setGoogleSheetsData(result.total || 0);
      }
    } catch (err) {
      setGoogleSheetsData(0);
    } finally {
      setGoogleSheetsLoading(false);
    }
  }, [dateRange, customDateStart, customDateEnd]);

  const fetchGoogleAdsData = useCallback(async () => {
    try {
      setGoogleAdsLoading(true);
      let url =
        "https://believable-ambition-production.up.railway.app/api/google-ads";
      if (dateRange === "custom" && customDateStart && customDateEnd) {
        url += `?startDate=${customDateStart}&endDate=${customDateEnd}`;
      } else {
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
        setGoogleAdsData(0);
      } else {
        const totalClicks = result.summary?.totalClicks || 0;
        setGoogleAdsData(totalClicks);
      }
    } catch (err) {
      setGoogleAdsData(0);
    } finally {
      setGoogleAdsLoading(false);
    }
  }, [dateRange, customDateStart, customDateEnd]);

  const fetchFacebookBalance = useCallback(async () => {
    try {
      setFacebookBalanceLoading(true);
      const response = await fetch("/api/facebook-ads-balance");
      const result = await response.json();
      if (!response.ok || !result.success) {
        setFacebookBalance(0);
      } else {
        setFacebookBalance(result.data.available_balance || 0);
      }
    } catch (err) {
      setFacebookBalance(0);
    } finally {
      setFacebookBalanceLoading(false);
    }
  }, []);

  const fetchPhoneCount = useCallback(async () => {
    try {
      setPhoneCountLoading(true);

      const today = new Date();
      let startDate: string;
      let endDate: string = today.toISOString().split("T")[0];

      if (dateRange === "custom" && customDateStart && customDateEnd) {
        startDate = customDateStart;
        endDate = customDateEnd;
      } else {
        let start: Date;
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
            start = new Date(today);
            start.setDate(start.getDate() - 7);
            startDate = start.toISOString().split("T")[0];
            break;
          case "last_14d":
            start = new Date(today);
            start.setDate(start.getDate() - 14);
            startDate = start.toISOString().split("T")[0];
            break;
          case "last_30d":
            start = new Date(today);
            start.setDate(start.getDate() - 30);
            startDate = start.toISOString().split("T")[0];
            break;
          case "this_month":
            start = new Date(today.getFullYear(), today.getMonth(), 1);
            startDate = start.toISOString().split("T")[0];
            break;
          case "last_month":
            start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const lastMonthEnd = new Date(
              today.getFullYear(),
              today.getMonth(),
              0
            );
            startDate = start.toISOString().split("T")[0];
            endDate = lastMonthEnd.toISOString().split("T")[0];
            break;
          default:
            startDate = endDate;
        }
      }

      const response = await fetch(`/api/phone-count`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        setPhoneCountData({ total: 0, datesWithData: 0 });
      } else {
        let total = 0;
        let datesCount = 0;

        Object.keys(result.data || {}).forEach((dateStr) => {
          if (dateStr >= startDate && dateStr <= endDate) {
            total += result.data[dateStr];
            datesCount++;
          }
        });

        setPhoneCountData({
          total: total,
          datesWithData: datesCount,
        });
      }
    } catch (err) {
      setPhoneCountData({ total: 0, datesWithData: 0 });
    } finally {
      setPhoneCountLoading(false);
    }
  }, [dateRange, customDateStart, customDateEnd]);

  const fetchPhoneLeadsData = useCallback(async () => {
    try {
      setPhoneLeadsLoading(true);
      const response = await fetch(`/api/facebook-ads-phone-leads`);
      const result = await response.json();
      if (result.success && result.data) {
        setPhoneLeadsData(result.data);
      } else {
        setPhoneLeadsData({});
      }
    } catch (err) {
      setPhoneLeadsData({});
    } finally {
      setPhoneLeadsLoading(false);
    }
  }, []);

  const fetchAdsetDetailsData = useCallback(async () => {
    try {
      setAdsetDetailsLoading(true);
      const url =
        "https://graph.facebook.com/v24.0/act_454323590676166/insights?level=adset&fields=adset_id,adset_name,campaign_id,campaign_name,spend,impressions,clicks,ctr,cpc,cpm,actions&action_breakdowns=action_type&date_preset=today&access_token=EAAPb1ZBYCiNcBPzNxxSUntCZCTVHyl5AkAZBIiwCmDzrWKMLU4VEHJxRve7oqUDSaMs8om9pdVWFLzUdeTbTvkGPuTeuQ4KvGFizMy3VsSid8vgmjZB8OMoLySRmXxyAUpAwyyhSqOO8tSZAU6IYpxarsXBbZCDzFdy8u279HxSXtyWMpIolRtjJEWLdmfU5SwZCsP5";
      const response = await fetch(url);
      const result = await response.json();
      if (result.data) {
        setAdsetDetailsData(result.data);
      } else {
        setAdsetDetailsData([]);
      }
    } catch (err) {
      setAdsetDetailsData([]);
    } finally {
      setAdsetDetailsLoading(false);
    }
  }, []);

  const fetchDailySummaryData = useCallback(async () => {
    try {
      setDailySummaryLoading(true);
      const url = `https://believable-ambition-production.up.railway.app/api/facebook-ads-campaigns?level=ad&date_preset=last_30d&time_increment=1`;
      const response = await fetch(url);
      const result: ApiResponse = await response.json();
      if (!response.ok || !result.success) {
        setDailySummaryData([]);
      } else {
        setDailySummaryData(result.data || []);
        fetchPhoneLeadsData();
      }
    } catch (err) {
      setDailySummaryData([]);
    } finally {
      setDailySummaryLoading(false);
    }
  }, [fetchPhoneLeadsData]);

  useEffect(() => {
    const loadAllData = async () => {
      try {
        await Promise.all([
          fetchInsights(),
          fetchGoogleSheetsData(),
          fetchGoogleAdsData(),
          fetchFacebookBalance(),
          fetchPhoneCount(),
          fetchDailySummaryData(),
          fetchAdsetDetailsData(),
        ]);
      } catch (error) {
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        setLoading(false);
      }
    };
    loadAllData();

    const refreshInterval = setInterval(() => {
      Promise.all([
        fetchInsights(true),
        fetchGoogleSheetsData(),
        fetchGoogleAdsData(),
        fetchFacebookBalance(),
        fetchPhoneCount(),
        fetchDailySummaryData(),
        fetchAdsetDetailsData(),
      ]);
    }, 120000);

    return () => {
      clearInterval(refreshInterval);
    };
  }, [
    fetchInsights,
    fetchGoogleSheetsData,
    fetchGoogleAdsData,
    fetchFacebookBalance,
    fetchPhoneCount,
    fetchDailySummaryData,
    fetchAdsetDetailsData,
  ]);

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

  const getTotalResults = () => {
    let total = 0;
    insights.forEach((ad) => {
      if (ad.actions) {
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
    insights.forEach((ad) => {
      if (ad.actions) {
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

  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
    if (value === "custom") {
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
      setShowDatePicker(false);
      setTimeout(() => {
        setDateRange("custom");
      }, 0);
    }
  };

  const getTopAdsFilteredInsights = useCallback(() => {
    return insights;
  }, [insights]);

  const filteredInsights = insights;

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-6"></div>
          <p className="text-gray-700 text-xl font-semibold">
            กำลังโหลดข้อมูล...
          </p>
          <p className="text-gray-500 text-sm mt-2">โปรดรอสักครู่</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
          <div className="text-red-500 text-5xl mb-4 text-center">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
            เกิดข้อผิดพลาด
          </h2>
          <p className="text-gray-600 mb-6 text-center">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                fetchInsights(false);
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              ลองอีกครั้ง
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3">
        <button
          onClick={() => router.push("/home")}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg font-medium text-sm"
        >
          <span className="text-lg">←</span>
          <span>กลับไปหน้าหลัก</span>
        </button>
      </div>

      {/* Top Navigation Bar with Date Range Tabs */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="px-3 sm:px-6 py-3">
          {/* Desktop View: Tabs */}
          <div className="hidden md:flex items-center space-x-2">
            <button className="px-3 sm:px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-xs sm:text-sm">
              📊 ช่องควบคุม
            </button>
            {[
              "today",
              "yesterday",
              "last_7d",
              "last_14d",
              "last_30d",
              "this_month",
            ].map((range) => (
              <button
                key={range}
                onClick={() => handleDateRangeChange(range)}
                className={`px-6 py-2 rounded-lg transition-colors font-medium text-sm ${
                  dateRange === range
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {range === "today" && "วันนี้"}
                {range === "yesterday" && "เมื่อวาน"}
                {range === "last_7d" && "7 วัน"}
                {range === "last_14d" && "14 วัน"}
                {range === "last_30d" && "30 วัน"}
                {range === "this_month" && "เดือนนี้"}
              </button>
            ))}
            <button
              onClick={() => handleDateRangeChange("custom")}
              className={`px-6 py-2 rounded-lg transition-colors font-medium text-sm ${
                dateRange === "custom"
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              🗓️ กำหนดเอง
            </button>
            {dateRange === "custom" && customDateStart && customDateEnd && (
              <span className="text-xs text-gray-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200 font-medium ml-2">
                {customDateStart} ถึง {customDateEnd}
              </span>
            )}
          </div>

          {/* Mobile View: Dropdown */}
          <div className="md:hidden space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">📅</span>
              <select
                value={dateRange}
                onChange={(e) => handleDateRangeChange(e.target.value)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700 font-medium text-sm"
              >
                <option value="today">วันนี้</option>
                <option value="yesterday">เมื่อวาน</option>
                <option value="last_7d">7 วันที่ผ่านมา</option>
                <option value="last_14d">14 วันที่ผ่านมา</option>
                <option value="last_30d">30 วันที่ผ่านมา</option>
                <option value="this_month">เดือนนี้</option>
                <option value="custom">🗓️ กำหนดเอง</option>
              </select>
            </div>
            {dateRange === "custom" && customDateStart && customDateEnd && (
              <div className="text-xs text-gray-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200 font-medium">
                {customDateStart} ถึง {customDateEnd}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Calendar Date Picker Modal */}
      {showDatePicker && (
        <div
          className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDatePicker(false);
            }
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-gray-800">
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
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl text-lg font-medium focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500"
                  />
                </div>
              </div>
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
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl text-lg font-medium focus:outline-none focus:ring-4 focus:ring-orange-300 focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex space-x-4 justify-end">
              <button
                onClick={() => setShowDatePicker(false)}
                className="px-10 py-4 text-base border-2 border-gray-300 rounded-xl hover:bg-gray-100 transition-colors font-semibold text-gray-700"
              >
                ยกเลิก
              </button>
              <button
                onClick={applyCustomDateRange}
                className="px-10 py-4 text-base bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold"
              >
                ✓ ตกลง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal - ตารางข้อมูลแบบละเอียด */}
      {showDetailModal && selectedAdDetail && (
        <div
          className="modal-overlay fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDetailModal(false);
              setSelectedAdDetail(null);
            }
          }}
        >
          <div
            className="video-modal-container bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white">
                  รายละเอียดโฆษณา
                </h3>
                <p className="text-sm text-blue-100 mt-1">
                  {selectedAdDetail.adset_name}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedAdDetail(null);
                }}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all text-2xl w-10 h-10 flex items-center justify-center ml-4"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {/* ตารางข้อมูลละเอียด */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        รายการ
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        การกระทำสำเร็จแบบ On-Facebook
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        ต้นทุนต่อผลลัพธ์
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        จำนวนครั้งที่แสดงผล
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        การเข้าถึง
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        ความถี่
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        จำนวนเงินที่ใช้
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        สิ้นสุด
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        ต้นทุนต่อ 1,000 คนที่เข้าถึง (CPM)
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        ผลลัพธ์
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        ต้นทุนต่อผลลัพธ์
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        CTR (อัตราการคลิกผ่าน) ทั้งหมด
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        CPC (ต้นทุนต่อการคลิกลิงก์) ทั้งหมด
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        การคลิก (ทั้งหมด)
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        การตั้งค่า
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-blue-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-800">
                        {selectedAdDetail.adset_name || "—"}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center text-gray-700">
                        {getResultsByActionType(
                          selectedAdDetail.actions,
                          "onsite_conversion.messaging_first_reply"
                        ) || "—"}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center text-gray-700">
                        {(() => {
                          const cost = selectedAdDetail.cost_per_action_type?.find(
                            (c) => c.action_type === "onsite_conversion.messaging_first_reply"
                          );
                          return cost ? formatCurrency(cost.value) : "—";
                        })()}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center text-gray-700">
                        {formatNumber(selectedAdDetail.impressions)}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center text-gray-700">
                        {selectedAdDetail.reach ? formatNumber(selectedAdDetail.reach) : "—"}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center text-gray-700">
                        {selectedAdDetail.frequency ? formatNumber(selectedAdDetail.frequency) : "—"}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center font-semibold text-blue-700">
                        {formatCurrency(selectedAdDetail.spend)}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center text-gray-700">
                        {selectedAdDetail.date_stop || "—"}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center text-gray-700">
                        {formatCurrency(selectedAdDetail.cpm)}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center font-semibold text-green-700">
                        {getResultsByActionType(
                          selectedAdDetail.actions,
                          "onsite_conversion.total_messaging_connection"
                        ) || "—"}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center text-gray-700">
                        {(() => {
                          const cost = selectedAdDetail.cost_per_action_type?.find(
                            (c) => c.action_type === "onsite_conversion.total_messaging_connection"
                          );
                          return cost ? formatCurrency(cost.value) : "—";
                        })()}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center text-gray-700">
                        {formatPercentage(selectedAdDetail.ctr)}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center text-gray-700">
                        {formatCurrency(selectedAdDetail.cpc)}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center text-gray-700">
                        {formatNumber(selectedAdDetail.clicks)}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center text-gray-700">
                        {selectedAdDetail.campaign_name || "—"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {showVideoModal && selectedAdForPreview && (
        <div
          className="modal-overlay fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowVideoModal(false);
              setSelectedAdForPreview(null);
            }
          }}
        >
          <div
            className="video-modal-container bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 truncate">
                  {selectedAdForPreview.ad_name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Campaign: {selectedAdForPreview.campaign_name}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowVideoModal(false);
                  setSelectedAdForPreview(null);
                }}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all text-2xl w-10 h-10 flex items-center justify-center ml-4"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              {/* Video/Post Preview */}
              <div className="mb-6">
                {(() => {
                  const creative = adCreatives.get(selectedAdForPreview.ad_id);
                  const effectiveStoryId = creative?.effective_object_story_id;
                  const videoId =
                    creative?.object_story_spec?.video_data?.video_id ||
                    creative?.video_id;
                  const thumbnailUrl =
                    creative?.thumbnail_url ||
                    creative?.object_story_spec?.video_data?.image_url ||
                    creative?.image_url;

                  if (effectiveStoryId) {
                    const postUrl = `https://www.facebook.com/${effectiveStoryId.replace(
                      "_",
                      "/posts/"
                    )}`;
                    return (
                      <div className="space-y-4">
                        <div className="bg-white rounded-xl overflow-hidden shadow-lg">
                          <FacebookProvider appId="1086145253509335">
                            <EmbeddedPost
                              href={postUrl}
                              width="100%"
                              showText={true}
                            />
                          </FacebookProvider>
                        </div>
                        <div className="flex justify-center">
                          <a
                            href={postUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-lg"
                          >
                            <span>📱</span>
                            <span>เปิดดูโพสต์เต็มรูปแบบใน Facebook</span>
                          </a>
                        </div>
                      </div>
                    );
                  }

                  if (videoId && thumbnailUrl) {
                    return (
                      <div className="space-y-4">
                        <div className="rounded-xl overflow-hidden bg-gray-100 shadow-lg relative">
                          <img
                            src={thumbnailUrl}
                            alt={selectedAdForPreview.ad_name}
                            className="w-full h-auto"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                            <div className="text-white text-6xl">▶️</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <a
                            href={`https://www.facebook.com/reel/${videoId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-lg text-sm sm:text-base"
                          >
                            <span>🎬</span>
                            <span>ดูเป็น Reel</span>
                          </a>
                          <a
                            href={`https://www.facebook.com/watch/?v=${videoId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors font-medium shadow-lg text-sm sm:text-base"
                          >
                            <span>▶️</span>
                            <span>ดูเป็น Video</span>
                          </a>
                        </div>
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                          <p className="text-blue-700 text-sm font-medium">
                            📹 Video ID: {videoId}
                          </p>
                          <p className="text-blue-600 text-xs mt-1">
                            คลิกปุ่มด้านบนเพื่อเปิดดูวิดีโอใน Facebook
                          </p>
                        </div>
                      </div>
                    );
                  }

                  if (thumbnailUrl) {
                    return (
                      <div className="rounded-xl overflow-hidden bg-gray-100 shadow-lg">
                        <img
                          src={thumbnailUrl}
                          alt={selectedAdForPreview.ad_name}
                          className="w-full h-auto"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      </div>
                    );
                  }

                  return (
                    <div className="aspect-video bg-gray-200 rounded-xl flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-6xl mb-4 block">🎬</span>
                        <p className="text-gray-600">ไม่พบวิดีโอหรือรูปภาพ</p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Ad Performance Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Spent</div>
                  <div className="text-xl font-bold text-blue-700">
                    {formatCurrency(selectedAdForPreview.spend)}
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Results</div>
                  <div className="text-xl font-bold text-green-700">
                    {getResultsByActionType(
                      selectedAdForPreview.actions,
                      "onsite_conversion.messaging_first_reply"
                    )}
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">CPC</div>
                  <div className="text-xl font-bold text-purple-700">
                    {formatCurrency(selectedAdForPreview.cpc)}
                  </div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">CTR</div>
                  <div className="text-xl font-bold text-orange-700">
                    {formatPercentage(selectedAdForPreview.ctr)}
                  </div>
                </div>
              </div>

              {/* Ad Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Ad Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Impressions:</span>
                    <span className="font-medium">
                      {formatNumber(selectedAdForPreview.impressions)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Clicks:</span>
                    <span className="font-medium">
                      {formatNumber(selectedAdForPreview.clicks)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">CPM:</span>
                    <span className="font-medium">
                      {formatCurrency(selectedAdForPreview.cpm)}
                    </span>
                  </div>
                  {selectedAdForPreview.reach && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reach:</span>
                      <span className="font-medium">
                        {formatNumber(selectedAdForPreview.reach)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {selectedAdForPreview.date_start}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="px-3 sm:px-6 py-3 sm:py-6">
        {/* Performance Cards Row */}
        <div className="mb-3 sm:mb-6">
          <div className="flex flex-row gap-3 sm:gap-4">
            {/* ใช้จ่ายรวม */}
            <div className="flex-1 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-2xl">
              <div className="text-sm sm:text-base lg:text-lg font-semibold mb-2 flex items-center gap-2 opacity-90">
                💰 ใช้จ่ายรวม
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold">
                {formatCurrency(
                  insights.reduce(
                    (sum, ad) => sum + parseFloat(ad.spend || "0"),
                    0
                  )
                )}
              </div>
            </div>

            {/* New Inbox & Total Inbox */}
            <div className="flex-1 bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-600 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-2xl">
              <div className="flex gap-4">
                <div>
                  <div className="text-xs sm:text-sm lg:text-base font-semibold opacity-90 mb-1">
                    New Inbox
                  </div>
                  <div className="text-lg sm:text-xl lg:text-3xl font-bold">
                    {getTotalResults()}
                  </div>
                </div>
                <div>
                  <div className="text-xs sm:text-sm lg:text-base font-semibold opacity-90 mb-1">
                    Total Inbox
                  </div>
                  <div className="text-lg sm:text-xl lg:text-3xl font-bold">
                    {getTotalMessagingConnection()}
                  </div>
                </div>
              </div>
            </div>

            {/* เงินคงเหลือ */}
            <div className="flex-1 bg-gradient-to-br from-emerald-500 via-emerald-600 to-green-600 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-2xl">
              <div className="text-sm sm:text-base lg:text-lg font-semibold mb-2 flex items-center gap-2 opacity-90">
                💵 เงินคงเหลือ
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold">
                {facebookBalanceLoading ? (
                  <span className="text-2xl">⏳</span>
                ) : (
                  `฿${facebookBalance.toLocaleString("th-TH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                )}
              </div>
            </div>

            {/* ชื่อ - เบอร์ */}
            <div className="flex-1 bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-2xl">
              <div className="text-sm sm:text-base lg:text-lg font-semibold mb-2 flex items-center gap-2 opacity-90">
                📞 ชื่อ - เบอร์
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold">
                {phoneCountLoading ? (
                  <span className="text-2xl">⏳</span>
                ) : (
                  <div>
                    <div>{phoneCountData.total.toLocaleString()}</div>
                    <div className="text-[10px] sm:text-xs opacity-80 mt-1 font-normal">
                      {phoneCountData.datesWithData} รายการ
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Grid: Two TOP Ads tables + Daily Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 mt-4 sm:mt-8">
          {/* TOP Ads Table -  */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-100 mt-4 sm:mt-8">
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 sm:px-8 py-4 sm:py-8 relative overflow-hidden">
                <h2 className="text-xl sm:text-3xl font-bold text-white flex items-center justify-between gap-2 sm:gap-3 relative z-10">
                  <span>📋ชุดโฆษณา</span>
                  <span className="md:hidden text-xs font-normal opacity-75">
                    👉 เลื่อนดูเพิ่ม
                  </span>
                </h2>
              </div>

              {/* Main Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-max">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      {/* <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm whitespace-nowrap">
                        รูป
                      </th> */}
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm whitespace-nowrap">
                        ชื่อโฆษณา
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm whitespace-nowrap">
                        แคมเปญ
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm whitespace-nowrap">
                        ใช้จ่าย
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm whitespace-nowrap">
                        รายใหม่
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm whitespace-nowrap">
                        เริ่มสนทนา
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm whitespace-nowrap">
                        ต้นทุน/สนทนา
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInsights.map((ad) => {
                      const creative = adCreatives.get(ad.ad_id);
                      const messagingFirstReply = getResultsByActionType(
                        ad.actions,
                        "onsite_conversion.messaging_first_reply"
                      );
                      const messagingConnection = getResultsByActionType(
                        ad.actions,
                        "onsite_conversion.total_messaging_connection"
                      );
                      const costPerMessagingConnection =
                        ad.cost_per_action_type?.find(
                          (cost) =>
                            cost.action_type ===
                            "onsite_conversion.total_messaging_connection"
                        );

                      return (
                        <tr
                          key={ad.ad_id}
                          className="border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedAdDetail(ad);
                            setShowDetailModal(true);
                          }}
                        >
                          <td className="py-3 px-4 text-center text-gray-800 font-medium text-sm">
                            <div className="min-w-[150px] max-w-[200px] truncate">
                              {ad.adset_name || "—"}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center text-gray-600 text-sm">
                            <div className="min-w-[120px] max-w-[180px] truncate">
                              {ad.campaign_name || "—"}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center font-semibold text-blue-700 text-sm">
                            {formatCurrency(ad.spend)}
                          </td>
                          <td className="py-3 px-4 text-center font-semibold text-green-700 text-sm">
                            {messagingFirstReply}
                          </td>
                          <td className="py-3 px-4 text-center font-semibold text-teal-700 text-sm">
                            {messagingConnection}
                          </td>
                          <td className="py-3 px-4 text-center text-gray-700 text-sm">
                            {costPerMessagingConnection
                              ? formatCurrency(costPerMessagingConnection.value)
                              : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* TOP Ads Table - Right */}
          <div className="lg:col-span-6">
            <TopAdsTable
              title={`🏆 TOP ${
                topAdsLimit === "all" ? "ทั้งหมด" : topAdsLimit
              } Ads`}
              insights={getTopAdsFilteredInsights()}
              adCreatives={adCreatives}
              topAdsSortBy={topAdsSortBy}
              setTopAdsSortBy={setTopAdsSortBy}
              topAdsLimit={topAdsLimit}
              setTopAdsLimit={setTopAdsLimit}
              topAdsPhoneLeads={topAdsPhoneLeads}
              topAdsPhoneLeadsLoading={topAdsPhoneLeadsLoading}
              creativesLoading={creativesLoading}
              getResultsByActionType={getResultsByActionType}
              formatCurrency={formatCurrency}
              formatNumber={formatNumber}
              setSelectedAdForPreview={setSelectedAdForPreview}
              setShowVideoModal={setShowVideoModal}
            />
          </div>

          {/* Daily Summary Table */}
          <div className="lg:col-span-12">
            <DailySummaryTable
              dailySummaryData={dailySummaryData}
              dailySummaryLoading={dailySummaryLoading}
              phoneLeadsData={phoneLeadsData}
              phoneLeadsLoading={phoneLeadsLoading}
              getResultsByActionType={getResultsByActionType}
              formatCurrency={formatCurrency}
            />
          </div>
        </div>

        {/* Report Ad Table */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-100 mt-4 sm:mt-8">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 sm:px-8 py-4 sm:py-8 relative overflow-hidden">
            <h2 className="text-xl sm:text-3xl font-bold text-white flex items-center justify-between gap-2 sm:gap-3 relative z-10">
              <span>📋 Report ย้อนหลัง 30 วัน</span>
              <span className="md:hidden text-xs font-normal opacity-75">
                👉 เลื่อนดูเพิ่ม
              </span>
            </h2>
          </div>

          {/* View Mode Tabs */}
          <div className="px-3 sm:px-6 py-3 sm:py-4 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex space-x-1 overflow-x-auto">
                {(["campaigns", "adsets", "ads"] as ViewMode[]).map((mode) => (
                  <button
                    key={mode}
                    className={`px-3 sm:px-5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                      viewMode === mode
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                    }`}
                    onClick={() => setViewMode(mode)}
                  >
                    {mode === "campaigns" && "แคมเปญ"}
                    {mode === "adsets" && "ชุดโฆษณา"}
                    {mode === "ads" && "โฆษณา"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm whitespace-nowrap">
                    รูป
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm whitespace-nowrap">
                    ชื่อโฆษณา
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm whitespace-nowrap">
                    แคมเปญ
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm whitespace-nowrap">
                    ใช้จ่าย
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm whitespace-nowrap">
                    รายใหม่
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm whitespace-nowrap">
                    เริ่มสนทนา
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm whitespace-nowrap">
                    ต้นทุน/สนทนา
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredInsights.map((ad) => {
                  const creative = adCreatives.get(ad.ad_id);
                  const messagingFirstReply = getResultsByActionType(
                    ad.actions,
                    "onsite_conversion.messaging_first_reply"
                  );
                  const messagingConnection = getResultsByActionType(
                    ad.actions,
                    "onsite_conversion.total_messaging_connection"
                  );
                  const costPerMessagingConnection =
                    ad.cost_per_action_type?.find(
                      (cost) =>
                        cost.action_type ===
                        "onsite_conversion.total_messaging_connection"
                    );

                  return (
                    <tr
                      key={ad.ad_id}
                      className="border-b border-gray-100 hover:bg-blue-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex justify-center items-center">
                          {creative &&
                          (creative.thumbnail_url || creative.image_url) ? (
                            <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0">
                              <img
                                src={
                                  creative.thumbnail_url || creative.image_url
                                }
                                alt="Ad preview"
                                className="w-full h-full object-cover rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => {
                                  setSelectedAdForPreview(ad);
                                  setShowVideoModal(true);
                                }}
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-size='12'%3ENo Image%3C/text%3E%3C/svg%3E";
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                              <span className="text-gray-400 text-sm">📷</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-gray-800 font-medium text-sm">
                        <div className="min-w-[150px] max-w-[200px] truncate">
                          {ad.ad_name || "—"}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-gray-600 text-sm">
                        <div className="min-w-[120px] max-w-[180px] truncate">
                          {ad.campaign_name || "—"}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-blue-700 text-sm">
                        {formatCurrency(ad.spend)}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-green-700 text-sm">
                        {messagingFirstReply}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-teal-700 text-sm">
                        {messagingConnection}
                      </td>
                      <td className="py-3 px-4 text-center text-gray-700 text-sm">
                        {costPerMessagingConnection
                          ? formatCurrency(costPerMessagingConnection.value)
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ Sub Components ============

interface TopAdsTableProps {
  title: string;
  insights: AdInsight[];
  adCreatives: Map<string, AdCreative>;
  topAdsSortBy: "leads" | "cost" | "phone";
  setTopAdsSortBy: (value: "leads" | "cost" | "phone") => void;
  topAdsLimit: 5 | 10 | 15 | 20 | 30 | "all";
  setTopAdsLimit: (value: 5 | 10 | 15 | 20 | 30 | "all") => void;
  topAdsPhoneLeads: Map<string, number>;
  topAdsPhoneLeadsLoading: boolean;
  creativesLoading: boolean;
  getResultsByActionType: (
    actions: Action[] | undefined,
    actionType: string
  ) => number;
  formatCurrency: (value: string | number) => string;
  formatNumber: (value: string | number) => string;
  setSelectedAdForPreview: (ad: AdInsight | null) => void;
  setShowVideoModal: (show: boolean) => void;
}

function TopAdsTable({
  title,
  insights,
  adCreatives,
  topAdsSortBy,
  setTopAdsSortBy,
  topAdsLimit,
  setTopAdsLimit,
  topAdsPhoneLeads,
  topAdsPhoneLeadsLoading,
  creativesLoading,
  getResultsByActionType,
  formatCurrency,
  formatNumber,
  setSelectedAdForPreview,
  setShowVideoModal,
}: TopAdsTableProps) {
  const sortedAds = [...insights].sort((a, b) => {
    if (topAdsSortBy === "leads") {
      const totalInboxA = getResultsByActionType(
        a.actions,
        "onsite_conversion.total_messaging_connection"
      );
      const totalInboxB = getResultsByActionType(
        b.actions,
        "onsite_conversion.total_messaging_connection"
      );
      return totalInboxB - totalInboxA;
    } else if (topAdsSortBy === "phone") {
      const phoneLeadsA = topAdsPhoneLeads.get(a.ad_id) || 0;
      const phoneLeadsB = topAdsPhoneLeads.get(b.ad_id) || 0;
      return phoneLeadsB - phoneLeadsA;
    } else {
      const costA = a.cost_per_action_type?.find(
        (cost) =>
          cost.action_type === "onsite_conversion.total_messaging_connection"
      );
      const costB = b.cost_per_action_type?.find(
        (cost) =>
          cost.action_type === "onsite_conversion.total_messaging_connection"
      );
      const valueA = costA ? parseFloat(costA.value) : Infinity;
      const valueB = costB ? parseFloat(costB.value) : Infinity;
      return valueA - valueB;
    }
  });

  const displayedAds =
    topAdsLimit === "all" ? sortedAds : sortedAds.slice(0, topAdsLimit);

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 border border-gray-100">
      <div className="flex flex-col gap-3 mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
          {title}
        </h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <div className="flex gap-2 flex-1">
            <button
              onClick={() => setTopAdsSortBy("leads")}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all ${
                topAdsSortBy === "leads"
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              💬 Total Inbox (มาก → น้อย)
            </button>
            <button
              onClick={() => setTopAdsSortBy("phone")}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all ${
                topAdsSortBy === "phone"
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              📞 ชื่อ - เบอร์ (มาก → น้อย)
            </button>
            <button
              onClick={() => setTopAdsSortBy("cost")}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all ${
                topAdsSortBy === "cost"
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              💰 ต้นทุน (น้อย → มาก)
            </button>
          </div>
          <select
            value={topAdsLimit}
            onChange={(e) => {
              const value = e.target.value;
              setTopAdsLimit(
                value === "all"
                  ? "all"
                  : (Number(value) as 5 | 10 | 15 | 20 | 30)
              );
            }}
            className="flex-1 sm:flex-none sm:min-w-[140px] px-3 py-2 rounded-lg font-medium text-xs sm:text-sm bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-800 hover:from-yellow-500 hover:to-orange-500 transition-all border-2 border-yellow-500 shadow-lg cursor-pointer"
          >
            <option value={5}>⭐ Top 5</option>
            <option value={10}>⭐ Top 10</option>
            <option value={15}>⭐ Top 15</option>
            <option value={20}>⭐ Top 20</option>
            <option value={30}>⭐ Top 30</option>
            <option value="all">⭐ Top ทั้งหมด</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        {creativesLoading && adCreatives.size === 0 && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4 rounded">
            <p className="text-blue-700 text-sm font-medium">
              ⏳ กำลังโหลดรูปภาพโฆษณา...
            </p>
          </div>
        )}
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-center py-2 px-1 font-semibold text-gray-700 text-sm">
                #
              </th>
              <th className="text-center py-2 px-1 font-semibold text-gray-700 text-sm">
                Ad
              </th>
              <th className="text-center py-2 px-1 font-semibold text-gray-700 text-sm">
                จ่าย
              </th>
              <th className="text-center py-2 px-1 font-semibold text-gray-700 text-sm">
                New
              </th>
              <th className="text-center py-2 px-1 font-semibold text-gray-700 text-sm">
                Total
              </th>
              <th className="text-center py-2 px-1 font-semibold text-gray-700 text-sm">
                📞
              </th>
              <th className="text-center py-2 px-1 font-semibold text-gray-700 text-sm">
                Cost
              </th>
            </tr>
          </thead>
          <tbody>
            {displayedAds.map((ad, index) => {
              const creative = adCreatives.get(ad.ad_id);
              const thumbnailUrl =
                creative?.thumbnail_url || creative?.image_url;

              return (
                <tr
                  key={ad.ad_id}
                  className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:via-purple-50 hover:to-pink-50 transition-all"
                >
                  <td className="py-2 px-1 text-center">
                    <div className="text-gray-700 font-bold text-lg">
                      {index + 1}
                    </div>
                  </td>
                  <td className="py-2 px-1 text-center">
                    <div
                      className="relative group cursor-pointer flex justify-center items-center"
                      onClick={() => {
                        setSelectedAdForPreview(ad);
                        setShowVideoModal(true);
                      }}
                    >
                      {thumbnailUrl ? (
                        <img
                          src={thumbnailUrl}
                          alt="Ad"
                          className="w-16 h-16 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
                          onError={(e) => {
                            e.currentTarget.src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-size='12'%3ENo Image%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-xs">📷</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-1 text-center text-gray-700 font-semibold text-base">
                    {formatCurrency(ad.spend)}
                  </td>
                  <td className="py-2 px-1 text-center font-semibold text-green-700 text-base">
                    {getResultsByActionType(
                      ad.actions,
                      "onsite_conversion.messaging_first_reply"
                    )}
                  </td>
                  <td className="py-2 px-1 text-center font-semibold text-blue-700 text-base">
                    {getResultsByActionType(
                      ad.actions,
                      "onsite_conversion.total_messaging_connection"
                    )}
                  </td>
                  <td className="py-2 px-1 text-center font-semibold text-purple-700 text-base">
                    {topAdsPhoneLeadsLoading ? (
                      <span className="text-sm">⏳</span>
                    ) : (
                      topAdsPhoneLeads.get(ad.ad_id) || 0
                    )}
                  </td>
                  <td className="py-2 px-1 text-center text-gray-700 text-base">
                    {(() => {
                      const costPerMessaging = ad.cost_per_action_type?.find(
                        (cost) =>
                          cost.action_type ===
                          "onsite_conversion.total_messaging_connection"
                      );
                      return costPerMessaging
                        ? formatCurrency(costPerMessaging.value)
                        : "—";
                    })()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface DailySummaryTableProps {
  dailySummaryData: AdInsight[];
  dailySummaryLoading: boolean;
  phoneLeadsData: { [date: string]: number };
  phoneLeadsLoading: boolean;
  getResultsByActionType: (
    actions: Action[] | undefined,
    actionType: string
  ) => number;
  formatCurrency: (value: string | number) => string;
}

function DailySummaryTable({
  dailySummaryData,
  dailySummaryLoading,
  phoneLeadsData,
  phoneLeadsLoading,
  getResultsByActionType,
  formatCurrency,
}: DailySummaryTableProps) {
  // Process daily data
  const dailyData = new Map<
    string,
    { spend: number; newInbox: number; totalInbox: number }
  >();
  dailySummaryData.forEach((ad) => {
    const date = ad.date_start;
    const existing = dailyData.get(date) || {
      spend: 0,
      newInbox: 0,
      totalInbox: 0,
    };
    existing.spend += parseFloat(ad.spend || "0");
    existing.newInbox += getResultsByActionType(
      ad.actions,
      "onsite_conversion.messaging_first_reply"
    );
    existing.totalInbox += getResultsByActionType(
      ad.actions,
      "onsite_conversion.total_messaging_connection"
    );
    dailyData.set(date, existing);
  });

  const sortedDates = Array.from(dailyData.keys()).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );
  const last30Days = sortedDates.slice(1, 31);

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 px-4 sm:px-8 py-4 sm:py-6 relative overflow-hidden">
        <h2 className="text-lg sm:text-2xl font-bold text-white flex items-center justify-between gap-2 sm:gap-3 relative z-10">
          <span>📅 สรุปรายวัน (ย้อนหลัง 30 วัน)</span>
          <span className="md:hidden text-xs font-normal opacity-75">
            👉 เลื่อนดู
          </span>
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-max">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-center font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 text-sm whitespace-nowrap">
                วันที่
              </th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-center font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 text-sm whitespace-nowrap">
                ใช้จ่ายรวม
              </th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-center font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 text-sm whitespace-nowrap">
                New Inbox
              </th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-center font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 text-sm whitespace-nowrap">
                Total Inbox
              </th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-center font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 text-sm whitespace-nowrap">
                ชื่อ - เบอร์
              </th>
            </tr>
          </thead>
          <tbody>
            {dailySummaryLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
                  <p className="text-gray-600 mt-2">
                    กำลังโหลดข้อมูลย้อนหลัง 30 วัน...
                  </p>
                </td>
              </tr>
            ) : last30Days.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  ไม่มีข้อมูลในช่วง 30 วันที่ผ่านมา
                </td>
              </tr>
            ) : (
              last30Days.map((date) => {
                const data = dailyData.get(date)!;
                const totalPhoneLeads = phoneLeadsData[date] || 0;
                return (
                  <tr
                    key={date}
                    className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-colors"
                  >
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-center font-medium text-gray-900 border-b border-gray-200 text-base sm:text-lg whitespace-nowrap">
                      {new Date(date).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-center font-semibold text-blue-600 border-b border-gray-200 text-base sm:text-lg whitespace-nowrap">
                      {formatCurrency(data.spend)}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-center font-semibold text-green-600 border-b border-gray-200 text-base sm:text-lg">
                      {data.newInbox}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-center font-semibold text-teal-600 border-b border-gray-200 text-base sm:text-lg">
                      {data.totalInbox}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-center font-semibold text-purple-600 border-b border-gray-200 text-base sm:text-lg">
                      {phoneLeadsLoading ? (
                        <span className="text-gray-400">⏳</span>
                      ) : totalPhoneLeads > 0 ? (
                        totalPhoneLeads.toLocaleString()
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
