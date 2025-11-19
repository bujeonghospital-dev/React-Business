"use client";

import { useEffect, useState, useCallback } from "react";

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

export default function FacebookAdsManagerPage() {
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
  const [selectedPlatform, setSelectedPlatform] = useState<
    "facebook" | "tiktok" | "googlead"
  >("facebook");

  const fetchInsights = useCallback(
    async (isBackgroundRefresh = false) => {
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
          } else {
            uniqueData.set(key, { ...item });
          }
        });

        setInsights(Array.from(uniqueData.values()));
      } catch (err) {
        console.error("Error fetching insights:", err);
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      } finally {
        if (!isBackgroundRefresh) {
          setLoading(false);
        }
      }
    },
    [dateRange, viewMode, customDateStart, customDateEnd]
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
        console.error("Google Ads error:", result.error);
        setGoogleAdsData(0);
      } else {
        const totalClicks = result.summary?.totalClicks || 0;
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
    const loadAllData = async () => {
      await Promise.all([
        fetchInsights(),
        fetchGoogleSheetsData(),
        fetchGoogleAdsData(),
      ]);
    };
    loadAllData();
  }, [fetchInsights, fetchGoogleSheetsData, fetchGoogleAdsData]);

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

  const filteredInsights = insights;

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
              onClick={() => fetchInsights(false)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              ลองอีกครั้ง
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Platform Tabs */}
      <div className="bg-white shadow-sm">
        <div className="px-6 py-3 flex items-center space-x-2">
          <button
            onClick={() => setSelectedPlatform("facebook")}
            className={`px-8 py-3 rounded-xl font-bold text-base transition-all ${
              selectedPlatform === "facebook"
                ? "bg-blue-600 text-white shadow-lg transform scale-105"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Facebook
          </button>
          <button
            onClick={() => setSelectedPlatform("tiktok")}
            className={`px-8 py-3 rounded-xl font-bold text-base transition-all ${
              selectedPlatform === "tiktok"
                ? "bg-black text-white shadow-lg transform scale-105"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            TikTok
          </button>
          <button
            onClick={() => setSelectedPlatform("googlead")}
            className={`px-8 py-3 rounded-xl font-bold text-base transition-all ${
              selectedPlatform === "googlead"
                ? "bg-yellow-500 text-white shadow-lg transform scale-105"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Google Ad
          </button>
        </div>
      </div>

      {/* Calendar Date Picker */}
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
            className="date-picker-container bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full"
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

      {/* Main Content Layout */}
      <div className="px-6 py-6">
        {/* Performance Cards + TOP 5 Ads */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          {/* Left Section - Performance Cards */}
          <div className="col-span-5">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Performance
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {/* ใช้ข่ายรวม */}
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                  <div className="text-lg font-medium mb-2">ใช้ข่ายรวม</div>
                  <div className="text-3xl font-bold">{getTotalResults()}</div>
                </div>

                {/* อินบอกซ์ */}
                <div className="bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl p-6 text-white shadow-lg">
                  <div className="text-lg font-medium mb-2">อินบอกซ์</div>
                  <div className="text-3xl font-bold">
                    {getTotalMessagingConnection()}
                  </div>
                </div>

                {/* ยอดเกิดเหลือ */}
                <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
                  <div className="text-lg font-medium mb-2">ยอดเกิดเหลือ</div>
                  <div className="text-3xl font-bold">
                    {googleSheetsLoading ? (
                      <span className="text-2xl">⏳</span>
                    ) : (
                      googleSheetsData
                    )}
                  </div>
                </div>

                {/* ซื้อ - เมธร์ */}
                <div className="bg-gradient-to-br from-sky-400 to-sky-600 rounded-xl p-6 text-white shadow-lg">
                  <div className="text-lg font-medium mb-2">ซื้อ - เมธร์</div>
                  <div className="text-3xl font-bold">
                    {googleAdsLoading ? (
                      <span className="text-2xl">⏳</span>
                    ) : (
                      googleAdsData
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - TOP 5 Ads Performance */}
          <div className="col-span-7">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                TOP 5 Ads Performance
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-2 font-semibold text-gray-700">
                        Ad Image
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700">
                        Results
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700">
                        CPC
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700">
                        CTR
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700">
                        Thruplay
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700">
                        Spent
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInsights
                      .sort(
                        (a, b) =>
                          getResultsByActionType(
                            b.actions,
                            "onsite_conversion.messaging_first_reply"
                          ) -
                          getResultsByActionType(
                            a.actions,
                            "onsite_conversion.messaging_first_reply"
                          )
                      )
                      .slice(0, 5)
                      .map((ad) => (
                        <tr
                          key={ad.ad_id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4 px-2">
                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                              <span className="text-2xl">🖼️</span>
                            </div>
                          </td>
                          <td className="py-4 px-2 font-semibold text-gray-800">
                            {getResultsByActionType(
                              ad.actions,
                              "onsite_conversion.messaging_first_reply"
                            )}
                          </td>
                          <td className="py-4 px-2 text-gray-700">
                            {formatCurrency(ad.cpc)}
                          </td>
                          <td className="py-4 px-2 text-gray-700">
                            {formatPercentage(ad.ctr)}
                          </td>
                          <td className="py-4 px-2 text-gray-700">
                            {formatNumber(ad.impressions)}
                          </td>
                          <td className="py-4 px-2 text-gray-700">
                            {formatCurrency(ad.spend)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Report Ad Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 px-6 py-4">
            <h2 className="text-2xl font-bold text-white">Report Ad</h2>
          </div>

          {/* Table Controls */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Date
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">
                  Amount Spent
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">
                  New Messaging
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">
                  Start a Conversation
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">
                  Phone Lead
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={dateRange}
                  onChange={(e) => handleDateRangeChange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="today">วันนี้</option>
                  <option value="yesterday">เมื่อวาน</option>
                  <option value="last_7d">7 วันที่แล้ว</option>
                  <option value="last_30d">30 วันที่แล้ว</option>
                  <option value="this_month">เดือนนี้</option>
                  <option value="last_month">เดือนที่แล้ว</option>
                  <option value="custom">กำหนดเอง</option>
                </select>
              </div>
            </div>
          </div>

          {/* View Mode Tabs */}
          <div className="px-6 py-3 bg-white border-b border-gray-200">
            <div className="flex space-x-1">
              <button
                className={`px-5 py-2 text-sm font-medium rounded-lg transition-colors ${
                  viewMode === "campaigns"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                }`}
                onClick={() => setViewMode("campaigns")}
              >
                แคมเปญ
              </button>
              <button
                className={`px-5 py-2 text-sm font-medium rounded-lg transition-colors ${
                  viewMode === "adsets"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                }`}
                onClick={() => setViewMode("adsets")}
              >
                ชุดโฆษณา
              </button>
              <button
                className={`px-5 py-2 text-sm font-medium rounded-lg transition-colors ${
                  viewMode === "ads"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                }`}
                onClick={() => setViewMode("ads")}
              >
                โฆษณา
              </button>
            </div>
          </div>

          {/* Main Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Campaign Name
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">
                    Spent
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">
                    Results
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">
                    CPC
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">
                    CTR
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">
                    Impressions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredInsights.map((ad) => (
                  <tr
                    key={ad.ad_id}
                    className="border-b border-gray-100 hover:bg-blue-50 transition-colors"
                  >
                    <td className="py-3 px-4 text-gray-700">{ad.date_start}</td>
                    <td className="py-3 px-4 text-gray-800 font-medium">
                      {ad.campaign_name || ad.adset_name || ad.ad_name}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-700">
                      {formatCurrency(ad.spend)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-800">
                      {getResultsByActionType(
                        ad.actions,
                        "onsite_conversion.messaging_first_reply"
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-700">
                      {formatCurrency(ad.cpc)}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-700">
                      {formatPercentage(ad.ctr)}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-700">
                      {formatNumber(ad.impressions)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
