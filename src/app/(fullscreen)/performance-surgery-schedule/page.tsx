"use client";

import React, { useState, useEffect } from "react";
import "./styles.css";
import SurgeryDetailsModal from "./SurgeryDetailsModal";
import {
  SurgeryScheduleData,
  CONTACT_PERSON_MAPPING,
} from "@/utils/googleSheets";
import {
  fetchSurgeryScheduleFromPythonAPI,
  countPythonApiSurgeriesByDateAndPerson,
  countPythonApiSurgeriesByActualDateAndPerson,
  calculateRevenueByDateAndPerson,
} from "@/utils/pythonApiFilmData";
import {
  fetchSaleIncentiveFromPythonAPI,
  calculateDailyRevenueByPerson,
  SaleIncentiveData,
} from "@/utils/saleIncentiveApi";

export default function PerformanceSurgerySchedule() {
  // State for selected month and year
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // State for surgery data
  const [surgeryData, setSurgeryData] = useState<SurgeryScheduleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countMap, setCountMap] = useState<
    Map<string, Map<number, SurgeryScheduleData[]>>
  >(new Map());
  const [countMapL, setCountMapL] = useState<
    Map<string, Map<number, SurgeryScheduleData[]>>
  >(new Map());
  const [revenueMap, setRevenueMap] = useState<
    Map<string, Map<number, number>>
  >(new Map());
  const [filmRevenueMap, setFilmRevenueMap] = useState<
    Map<string, Map<number, number>>
  >(new Map());
  const [saleIncentiveData, setSaleIncentiveData] = useState<
    SaleIncentiveData[]
  >([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // KPI Data State (ข้อมูล KPI ที่กำหนดเอง ไม่ได้เชื่อมกับ Google Sheets)
  // Note: kpiToDate จะถูกคำนวณอัตโนมัติจากจำนวนวันทำงานที่ผ่านมา
  const [kpiData, setKpiData] = useState<{
    [key: string]: {
      kpiMonth: number;
      kpiToDate: number;
      actual: number;
    };
  }>({
    "105-จีน": { kpiMonth: 40, kpiToDate: 0, actual: 5 },
    "107-เจ": { kpiMonth: 40, kpiToDate: 0, actual: 0 },
    "108-ว่าน": { kpiMonth: 40, kpiToDate: 0, actual: 0 },
    "109-ไม่ระบุ": { kpiMonth: 0, kpiToDate: 0, actual: 0 },
  });

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSurgeries, setSelectedSurgeries] = useState<
    SurgeryScheduleData[]
  >([]);
  const [selectedDate, setSelectedDate] = useState(1);
  const [selectedContactPerson, setSelectedContactPerson] = useState("");
  const [selectedTableType, setSelectedTableType] = useState<"P" | "L">("P");

  // Function to load surgery schedule data from Python API
  const loadData = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    try {
      // Fetch surgery schedule data from Python API (Google Sheets)
      const data = await fetchSurgeryScheduleFromPythonAPI();
      setSurgeryData(data);

      setLastUpdated(new Date());
    } catch (error: any) {
      setError(error.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Function to load N_SaleIncentive data separately (NOT combined with surgery data)
  const loadSaleIncentiveData = async () => {
    try {
      const saleData = await fetchSaleIncentiveFromPythonAPI();
      setSaleIncentiveData(saleData);
      console.log("✅ Loaded N_SaleIncentive data separately");
    } catch (error: any) {
      console.error("❌ Error loading N_SaleIncentive data:", error);
      // Don't set error state - let revenue table just be empty
      setSaleIncentiveData([]);
    }
  };

  // Fetch surgery data when component mounts
  useEffect(() => {
    (async () => {
      await loadData();
    })();
  }, []);

  // Fetch N_SaleIncentive data when component mounts or when month/year changes
  useEffect(() => {
    (async () => {
      await loadSaleIncentiveData();
    })();
  }, [selectedMonth, selectedYear]);

  // Auto-refresh surgery data every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      await loadData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Auto-refresh N_SaleIncentive data every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      await loadSaleIncentiveData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Get number of days in selected month
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Check if a day is a weekday (Monday-Friday)
  const isWeekday = (day: number): boolean => {
    const date = new Date(selectedYear, selectedMonth, day);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    return dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday
  };

  // Calculate number of weekdays (Mon-Fri) from start of month to current date
  const calculateWeekdaysToDate = (): number => {
    const today = new Date();
    const todayDate = today.getDate();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();

    // If viewing a future month/year, return 0 (haven't reached yet)
    if (
      selectedYear > todayYear ||
      (selectedYear === todayYear && selectedMonth > todayMonth)
    ) {
      return 0;
    }

    // If viewing a past month/year, return total weekdays in that month
    if (
      selectedYear < todayYear ||
      (selectedYear === todayYear && selectedMonth < todayMonth)
    ) {
      let weekdayCount = 0;
      const totalDays = getDaysInMonth(selectedMonth, selectedYear);
      for (let day = 1; day <= totalDays; day++) {
        if (isWeekday(day)) {
          weekdayCount++;
        }
      }
      return weekdayCount;
    }

    // If viewing current month/year, count up to today
    let weekdayCount = 0;
    for (let day = 1; day <= todayDate; day++) {
      if (isWeekday(day)) {
        weekdayCount++;
      }
    }
    return weekdayCount;
  };

  // Update count maps and film revenue when data or date changes
  useEffect(() => {
    if (surgeryData.length > 0) {
      // P table - วันที่ได้นัดผ่าตัด (Python API)
      const newCountMap = countPythonApiSurgeriesByDateAndPerson(
        surgeryData,
        selectedMonth,
        selectedYear
      );

      // L table - วันที่ผ่าตัด (Python API)
      const newCountMapL = countPythonApiSurgeriesByActualDateAndPerson(
        surgeryData,
        selectedMonth,
        selectedYear
      );

      // Revenue from Film Data (ยอดนำเสนอ)
      const newFilmRevenueMap = calculateRevenueByDateAndPerson(
        surgeryData,
        selectedMonth,
        selectedYear
      );

      setCountMap(newCountMap);
      setCountMapL(newCountMapL);
      setFilmRevenueMap(newFilmRevenueMap);
    }
  }, [surgeryData, selectedMonth, selectedYear]);

  // Update revenue map when N_SaleIncentive data changes
  useEffect(() => {
    if (saleIncentiveData.length > 0) {
      // Revenue table - ประมาณการรายรับจากข้อมูลจริง (N_SaleIncentive)
      const newRevenueMap = calculateDailyRevenueByPerson(
        saleIncentiveData,
        selectedMonth,
        selectedYear
      );

      setRevenueMap(newRevenueMap);
    } else {
      // Clear revenue map if no data
      setRevenueMap(new Map());
    }
  }, [saleIncentiveData, selectedMonth, selectedYear]);

  // Update KPI To Date and Actual based on weekdays passed in current month
  useEffect(() => {
    const weekdaysToDate = calculateWeekdaysToDate();
    const totalWeekdaysInMonth = days.filter((day) => isWeekday(day)).length;

    // Update kpiToDate and actual for all rows
    setKpiData((prevData) => {
      const updatedData = { ...prevData };
      Object.keys(updatedData).forEach((key) => {
        // Calculate actual count - sum of all counts (total performance)
        let actualCount = 0;
        days.forEach((day) => {
          const count = getCellCount(day, key, "P");
          actualCount += count; // Sum up all the counts
        });

        if (updatedData[key].kpiMonth > 0) {
          // Calculate proportional KPI based on weekdays passed
          updatedData[key] = {
            ...updatedData[key],
            kpiToDate: Math.round(
              (updatedData[key].kpiMonth / totalWeekdaysInMonth) *
                weekdaysToDate
            ),
            actual: actualCount,
          };
        } else {
          updatedData[key] = {
            ...updatedData[key],
            actual: actualCount,
          };
        }
      });
      return updatedData;
    });
  }, [selectedMonth, selectedYear, days.length, countMap]);

  // Month names in Thai
  const monthNames = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];

  // Generate year options (current year and +/- 2 years)
  const yearOptions = Array.from(
    { length: 5 },
    (_, i) => currentDate.getFullYear() - 2 + i
  );

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(parseInt(e.target.value));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(parseInt(e.target.value));
  };

  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  // Handle cell click to open modal
  const handleCellClick = (
    day: number,
    rowId: string,
    tableType: "P" | "L"
  ) => {
    const contactPerson = CONTACT_PERSON_MAPPING[rowId];
    if (!contactPerson) return;

    const personMap = tableType === "P" ? countMap : countMapL;

    let surgeries: SurgeryScheduleData[] = [];

    // For จีน row, combine จีน and มุก data
    if (rowId === "105-จีน") {
      const jinMap = personMap.get("จีน");
      const mukMap = personMap.get("มุก");

      const jinSurgeries = jinMap?.get(day) || [];
      const mukSurgeries = mukMap?.get(day) || [];

      surgeries = [...jinSurgeries, ...mukSurgeries];
    } else {
      const surgeryMap = personMap.get(contactPerson);
      if (!surgeryMap) return;
      surgeries = surgeryMap.get(day) || [];
    }

    if (surgeries.length === 0) return;

    // Find the display name from pScheduleRows
    const rowInfo = pScheduleRows.find((r) => r.id === rowId);
    const displayName = rowInfo ? rowInfo.name : contactPerson;

    setSelectedSurgeries(surgeries);
    setSelectedDate(day);
    setSelectedContactPerson(displayName);
    setSelectedTableType(tableType);
    setModalOpen(true);
  };

  // Get count for a specific cell
  const getCellCount = (
    day: number,
    rowId: string,
    tableType: "P" | "L"
  ): number => {
    const contactPerson = CONTACT_PERSON_MAPPING[rowId];
    if (!contactPerson) return 0;

    const personMap = tableType === "P" ? countMap : countMapL;

    // For จีน row, combine จีน and มุก data
    if (rowId === "105-จีน") {
      const jinMap = personMap.get("จีน");
      const mukMap = personMap.get("มุก");

      const jinSurgeries = jinMap?.get(day) || [];
      const mukSurgeries = mukMap?.get(day) || [];

      return jinSurgeries.length + mukSurgeries.length;
    }

    const surgeryMap = personMap.get(contactPerson);
    if (!surgeryMap) return 0;

    const surgeries = surgeryMap.get(day);
    return surgeries ? surgeries.length : 0;
  };

  // Get revenue for a specific cell (รวมจาก Film Data + N_SaleIncentive)
  const getCellRevenue = (day: number, rowId: string): number => {
    const contactPerson = CONTACT_PERSON_MAPPING[rowId];
    if (!contactPerson) return 0;

    let totalRevenue = 0;

    // For จีน row, combine จีน and มุก revenue from BOTH sources
    if (rowId === "105-จีน") {
      // Revenue from N_SaleIncentive
      const jinSaleMap = revenueMap.get("จีน");
      const mukSaleMap = revenueMap.get("มุก");
      const jinSaleRevenue = jinSaleMap?.get(day) || 0;
      const mukSaleRevenue = mukSaleMap?.get(day) || 0;

      // Revenue from Film Data (ยอดนำเสนอ)
      const jinFilmMap = filmRevenueMap.get("จีน");
      const mukFilmMap = filmRevenueMap.get("มุก");
      const jinFilmRevenue = jinFilmMap?.get(day) || 0;
      const mukFilmRevenue = mukFilmMap?.get(day) || 0;

      totalRevenue =
        jinSaleRevenue + mukSaleRevenue + jinFilmRevenue + mukFilmRevenue;
    } else {
      // Revenue from N_SaleIncentive
      const salePersonMap = revenueMap.get(contactPerson);
      const saleRevenue = salePersonMap?.get(day) || 0;

      // Revenue from Film Data (ยอดนำเสนอ)
      const filmPersonMap = filmRevenueMap.get(contactPerson);
      const filmRevenue = filmPersonMap?.get(day) || 0;

      totalRevenue = saleRevenue + filmRevenue;
    }

    return totalRevenue;
  };

  // Calculate KPI Diff (Actual - KPI To Date)
  const calculateDiff = (rowId: string): number => {
    const data = kpiData[rowId];
    if (!data) return 0;
    // For "105-จีน & มุก", multiply kpiToDate by 2
    const adjustedKpiToDate =
      rowId === "105-จีน" ? data.kpiToDate * 2 : data.kpiToDate;
    return data.actual - adjustedKpiToDate;
  };

  // Format number as Thai currency
  const formatCurrency = (amount: number): string => {
    if (amount === 0) return "";
    return amount.toLocaleString("th-TH");
  };

  // Data for table (วันที่ได้นัดผ่า P)
  const pScheduleRows = [
    { id: "105-จีน", name: "105-จีน & มุก" },
    { id: "107-เจ", name: "107-เจ" },
    { id: "108-ว่าน", name: "108-ว่าน" },
  ];

  return (
    <div className="surgery-schedule-container">
      <div className="schedule-header">
        <h1>Performance - นัดผ่าตัด</h1>

        {/* Calendar Controls */}
        <div className="calendar-controls">
          <button onClick={handlePreviousMonth} className="nav-button">
            ◀ เดือนก่อน
          </button>

          <div className="date-selectors">
            <select
              value={selectedMonth}
              onChange={handleMonthChange}
              className="month-select"
            >
              {monthNames.map((month, index) => (
                <option key={index} value={index}>
                  {month}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={handleYearChange}
              className="year-select"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year + 543} {/* Convert to Buddhist Era */}
                </option>
              ))}
            </select>
          </div>

          <button onClick={handleNextMonth} className="nav-button">
            เดือนถัดไป ▶
          </button>
        </div>

        <div className="selected-month-display">
          <strong>
            เดือน {monthNames[selectedMonth]} {selectedYear + 543}
          </strong>
          <span className="days-count"> ({daysInMonth} วัน)</span>
          {calculateWeekdaysToDate() > 0 && (
            <span className="weekdays-count">
              {" "}
              | 🗓️ วันทำงานที่ผ่านมา: {calculateWeekdaysToDate()} วัน
            </span>
          )}
        </div>

        {/* Data Info and Refresh Button */}
        <div className="data-info">
          <div className="update-time">
            {lastUpdated && (
              <>
                <span className="update-label">อัพเดทล่าสุด:</span>
                <span className="update-value">
                  {lastUpdated.toLocaleTimeString("th-TH", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </>
            )}
            {surgeryData.length > 0 && (
              <span className="data-count">
                📊 ข้อมูลนัดผ่าตัด: {surgeryData.length} รายการ
                {saleIncentiveData.length > 0 && (
                  <> | 💰 ข้อมูลรายรับ: {saleIncentiveData.length} รายการ</>
                )}
                {" (Python API - Google Sheets)"}
              </span>
            )}
          </div>
          <button
            onClick={async () => await loadData(true)}
            className="refresh-button"
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <span className="refresh-spinner">⟳</span> กำลังอัพเดท...
              </>
            ) : (
              <>🔄 รีเฟรชข้อมูล</>
            )}
          </button>
        </div>
      </div>

      {/* Team Summary Dashboard */}
      {!isLoading && !error && (
        <div className="team-summary-dashboard">
          {pScheduleRows.map((row, index) => {
            const pActual = kpiData[row.id]?.actual || 0;
            const pDiff = calculateDiff(row.id);
            const pKpiToDate = kpiData[row.id]?.kpiToDate || 0;

            // Calculate L table actual
            let lActual = 0;
            days.forEach((day) => {
              lActual += getCellCount(day, row.id, "L");
            });

            // Calculate revenue actual
            let revenueActual = 0;
            days.forEach((day) => {
              revenueActual += getCellRevenue(day, row.id);
            });

            // Calculate L diff (using same KPI as P table)
            const lDiff = lActual - pKpiToDate;
            const lKpiToDate = pKpiToDate;

            // Calculate revenue diff
            // For "105-จีน & มุก", multiply KPI by 2
            const revenueKpiToDate =
              row.id === "105-จีน"
                ? pKpiToDate * 2 * 25000
                : pKpiToDate * 25000;
            const revenueDiff = revenueActual - revenueKpiToDate;

            // Different color for each team
            const teamColors = [
              "team-color-1", // 105-จีน & มุก
              "team-color-2", // 107-เจ
              "team-color-3", // 108-ว่าน
            ];

            return (
              <div
                key={row.id}
                className={`team-summary-card ${teamColors[index]}`}
              >
                <div className="team-summary-header">
                  <h3>{row.name}</h3>
                </div>
                <div className="team-summary-body">
                  <div className="summary-metric">
                    <div className="metric-label">รายรับ</div>
                    <div className="metric-row">
                      <div className="metric-item">
                        <div className="metric-title">KPI to date</div>
                        <div className="metric-value">
                          {formatCurrency(revenueKpiToDate)}
                        </div>
                      </div>
                      <div className="metric-item">
                        <div className="metric-title">Actual</div>
                        <div className="metric-value">
                          {formatCurrency(revenueActual)}
                        </div>
                      </div>
                      <div className="metric-item">
                        <div className="metric-title">Diff</div>
                        <div
                          className={`metric-value ${
                            revenueDiff >= 0 ? "positive" : "negative"
                          }`}
                        >
                          {revenueDiff >= 0 ? "+" : "−"}
                          {formatCurrency(Math.abs(revenueDiff))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="summary-metric">
                    <div className="metric-label">จำนวนผ่าตัด</div>
                    <div className="metric-row">
                      <div className="metric-item">
                        <div className="metric-title">KPI to date</div>
                        <div className="metric-value">
                          {row.id === "105-จีน" ? pKpiToDate * 2 : pKpiToDate}
                        </div>
                      </div>
                      <div className="metric-item">
                        <div className="metric-title">Actual</div>
                        <div className="metric-value">{pActual}</div>
                      </div>
                      <div className="metric-item">
                        <div className="metric-title">Diff</div>
                        <div
                          className={`metric-value ${
                            pDiff >= 0 ? "positive" : "negative"
                          }`}
                        >
                          {pDiff >= 0 ? "+" : "−"}
                          {Math.abs(pDiff)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* <div className="summary-metric">
                    <div className="metric-label">ว่าน</div>
                    <div className="metric-row">
                      <div className="metric-item">
                        <div className="metric-title">KPI to date</div>
                        <div className="metric-value">{lKpiToDate}</div>
                      </div>
                      <div className="metric-item">
                        <div className="metric-title">Actual</div>
                        <div className="metric-value">{lActual}</div>
                      </div>
                      <div className="metric-item">
                        <div className="metric-title">Diff</div>
                        <div
                          className={`metric-value ${
                            lDiff >= 0 ? "positive" : "negative"
                          }`}
                        >
                          {lDiff >= 0 ? "+" : ""}
                          {lDiff.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  </div> */}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>กำลังโหลดข้อมูล...</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error-display">
          <div className="error-icon">⚠️</div>
          <div className="error-content">
            <h3>เกิดข้อผิดพลาด</h3>
            <p>{error}</p>
            <div className="error-help">
              <strong>แนะนำการแก้ไข:</strong>
              <ol>
                <li>
                  ตรวจสอบว่า Python API บน Railway กำลังทำงานอยู่:
                  <br />
                  <code>
                    https://believable-ambition-production.up.railway.app/health
                  </code>
                </li>
                <li>
                  ตรวจสอบ Environment Variables ใน Railway (Settings →
                  Variables):
                  <br />- <code>GOOGLE_SPREADSHEET_ID</code>
                  <br />- <code>GOOGLE_SERVICE_ACCOUNT_EMAIL</code>
                  <br />- <code>GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY</code>
                </li>
                <li>
                  ตรวจสอบ Environment variable ใน Vercel (Settings → Environment
                  Variables):
                  <br />
                  <code>PYTHON_API_URL</code> =
                  https://believable-ambition-production.up.railway.app
                </li>
                <li>
                  ตรวจสอบว่า Service Account มีสิทธิ์เข้าถึง Google Sheet "Film
                  data"
                </li>
                <li>ลอง Redeploy Railway และ Vercel อีกครั้ง</li>
              </ol>
            </div>
            <button
              onClick={async () => {
                await loadData();
                await loadSaleIncentiveData();
              }}
              className="retry-button"
            >
              ลองใหม่อีกครั้ง
            </button>
          </div>
        </div>
      )}

      {/* Table - วันที่ได้นัดผ่า P */}
      <div className="table-section">
        <div className="table-wrapper">
          <table className="schedule-table">
            <thead>
              <tr>
                <th className="header-cell name-header" rowSpan={2}>
                  จำนวนที่ได้นัดผ่าตัด
                </th>
                <th className="header-cell kpi-header">KPI Month</th>
                <th className="header-cell kpi-header">KPI To Date</th>
                <th className="header-cell kpi-header">Actual</th>
                <th className="header-cell kpi-header">Diff</th>
                {days.map((day) => (
                  <th
                    key={`p-day-${day}`}
                    className={`header-cell day-header ${
                      isWeekday(day) ? "weekday-header" : ""
                    }`}
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pScheduleRows.map((row, rowIndex) => (
                <tr
                  key={`p-row-${row.id}`}
                  className={rowIndex % 2 === 0 ? "even-row" : "odd-row"}
                >
                  <td className="name-cell">{row.name}</td>
                  <td className="kpi-cell">
                    {kpiData[row.id]?.kpiMonth
                      ? row.id === "105-จีน"
                        ? kpiData[row.id].kpiMonth * 2
                        : kpiData[row.id].kpiMonth
                      : ""}
                  </td>
                  <td className="kpi-cell">
                    {kpiData[row.id]?.kpiToDate
                      ? row.id === "105-จีน"
                        ? kpiData[row.id].kpiToDate * 2
                        : kpiData[row.id].kpiToDate
                      : ""}
                  </td>
                  <td className="kpi-cell">{kpiData[row.id]?.actual || ""}</td>
                  <td className="kpi-cell diff-cell">
                    {(() => {
                      if (kpiData[row.id]?.kpiToDate > 0) {
                        const diff = calculateDiff(row.id);
                        const diffColor = diff >= 0 ? "green" : "red";
                        return (
                          <span
                            style={{ color: diffColor, fontWeight: "bold" }}
                          >
                            {diff >= 0 ? "+" : "−"}
                            {Math.abs(diff)}
                          </span>
                        );
                      }
                      return "";
                    })()}
                  </td>
                  {days.map((day) => {
                    const count = getCellCount(day, row.id, "P");
                    return (
                      <td
                        key={`p-cell-${row.id}-${day}`}
                        className={`data-cell ${count > 0 ? "has-data" : ""}`}
                        onClick={() =>
                          count > 0 && handleCellClick(day, row.id, "P")
                        }
                        title={
                          count > 0
                            ? `คลิกเพื่อดูรายละเอียด (${count} รายการ)`
                            : ""
                        }
                      >
                        {count > 0 && (
                          <span className="count-badge">{count}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table - วันที่ผ่าตัด L */}
      <div className="table-section">
        <div className="table-wrapper">
          <table className="schedule-table">
            <thead>
              <tr>
                <th className="header-cell name-header" rowSpan={2}>
                  จำนวนผ่าตัด L
                </th>
                <th className="header-cell kpi-header">KPI Month</th>
                <th className="header-cell kpi-header">KPI To Date</th>
                <th className="header-cell kpi-header">Actual</th>
                <th className="header-cell kpi-header">Diff</th>
                {days.map((day) => (
                  <th
                    key={`l-day-${day}`}
                    className={`header-cell day-header ${
                      isWeekday(day) ? "weekday-header" : ""
                    }`}
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pScheduleRows.map((row, rowIndex) => (
                <tr
                  key={`l-row-${row.id}`}
                  className={rowIndex % 2 === 0 ? "even-row" : "odd-row"}
                >
                  <td className="name-cell">{row.name}</td>
                  <td className="kpi-cell">
                    {kpiData[row.id]?.kpiMonth
                      ? row.id === "105-จีน"
                        ? kpiData[row.id].kpiMonth * 2
                        : kpiData[row.id].kpiMonth
                      : ""}
                  </td>
                  <td className="kpi-cell">
                    {kpiData[row.id]?.kpiToDate
                      ? row.id === "105-จีน"
                        ? kpiData[row.id].kpiToDate * 2
                        : kpiData[row.id].kpiToDate
                      : ""}
                  </td>
                  <td className="kpi-cell">{kpiData[row.id]?.actual || ""}</td>
                  <td className="kpi-cell diff-cell">
                    {(() => {
                      if (kpiData[row.id]?.kpiToDate > 0) {
                        const diff = calculateDiff(row.id);
                        const diffColor = diff >= 0 ? "green" : "red";
                        return (
                          <span
                            style={{ color: diffColor, fontWeight: "bold" }}
                          >
                            {diff >= 0 ? "+" : "−"}
                            {Math.abs(diff)}
                          </span>
                        );
                      }
                      return "";
                    })()}
                  </td>
                  {days.map((day) => {
                    const count = getCellCount(day, row.id, "L");
                    return (
                      <td
                        key={`l-cell-${row.id}-${day}`}
                        className={`data-cell ${count > 0 ? "has-data" : ""}`}
                        onClick={() =>
                          count > 0 && handleCellClick(day, row.id, "L")
                        }
                        title={
                          count > 0
                            ? `คลิกเพื่อดูรายละเอียด (${count} รายการ)`
                            : ""
                        }
                      >
                        {count > 0 && (
                          <span className="count-badge">{count}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table - ประมาณการรายรับ */}
      <div className="table-section">
        <div className="table-wrapper">
          <table className="schedule-table">
            <thead>
              <tr>
                <th className="header-cell name-header" rowSpan={2}>
                  ประมาณการรายรับ
                </th>
                <th className="header-cell kpi-header">KPI Month</th>
                <th className="header-cell kpi-header">KPI To Date</th>
                <th className="header-cell kpi-header">Actual</th>
                <th className="header-cell kpi-header">Diff</th>
                {days.map((day) => (
                  <th
                    key={`revenue-day-${day}`}
                    className={`header-cell day-header ${
                      isWeekday(day) ? "weekday-header" : ""
                    }`}
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pScheduleRows.map((row, rowIndex) => (
                <tr
                  key={`revenue-row-${row.id}`}
                  className={rowIndex % 2 === 0 ? "even-row" : "odd-row"}
                >
                  <td className="name-cell">{row.name}</td>
                  <td className="kpi-cell">
                    {kpiData[row.id]?.kpiMonth
                      ? formatCurrency(
                          (row.id === "105-จีน"
                            ? kpiData[row.id].kpiMonth * 2
                            : kpiData[row.id].kpiMonth) * 25000
                        )
                      : ""}
                  </td>
                  <td className="kpi-cell">
                    {kpiData[row.id]?.kpiToDate > 0
                      ? formatCurrency(
                          (row.id === "105-จีน"
                            ? kpiData[row.id].kpiToDate * 2
                            : kpiData[row.id].kpiToDate) * 25000
                        )
                      : ""}
                  </td>
                  <td className="kpi-cell">
                    {(() => {
                      // Calculate total revenue for this row
                      let totalRevenue = 0;
                      days.forEach((day) => {
                        totalRevenue += getCellRevenue(day, row.id);
                      });
                      return totalRevenue > 0
                        ? formatCurrency(totalRevenue)
                        : "";
                    })()}
                  </td>
                  <td className="kpi-cell diff-cell">
                    {(() => {
                      if (kpiData[row.id]?.kpiToDate > 0) {
                        // Calculate total revenue for this row
                        let totalRevenue = 0;
                        days.forEach((day) => {
                          totalRevenue += getCellRevenue(day, row.id);
                        });
                        // For "105-จีน & มุก", multiply KPI by 2
                        const kpiToDateAmount =
                          row.id === "105-จีน"
                            ? kpiData[row.id].kpiToDate * 2 * 25000
                            : kpiData[row.id].kpiToDate * 25000;
                        const diff = totalRevenue - kpiToDateAmount;
                        const diffColor = diff >= 0 ? "green" : "red";
                        return (
                          <span
                            style={{ color: diffColor, fontWeight: "bold" }}
                          >
                            {diff >= 0 ? "+" : "−"}
                            {formatCurrency(Math.abs(diff))}
                          </span>
                        );
                      }
                      return "";
                    })()}
                  </td>
                  {days.map((day) => {
                    const revenue = getCellRevenue(day, row.id);
                    const count = getCellCount(day, row.id, "P");
                    return (
                      <td
                        key={`revenue-cell-${row.id}-${day}`}
                        className={`data-cell ${
                          revenue > 0 ? "has-data revenue-cell" : ""
                        }`}
                        onClick={() =>
                          count > 0 && handleCellClick(day, row.id, "P")
                        }
                        title={
                          revenue > 0
                            ? `คลิกเพื่อดูรายละเอียด\nยอดรวม: ${formatCurrency(
                                revenue
                              )} บาท\nจำนวน: ${count} รายการ`
                            : ""
                        }
                      >
                        {revenue > 0 && (
                          <span className="revenue-badge">
                            {formatCurrency(revenue)}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Surgery Details Modal */}
      <SurgeryDetailsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        surgeries={selectedSurgeries}
        date={selectedDate}
        month={selectedMonth}
        year={selectedYear}
        contactPerson={selectedContactPerson}
        tableType={selectedTableType}
      />
    </div>
  );
}
