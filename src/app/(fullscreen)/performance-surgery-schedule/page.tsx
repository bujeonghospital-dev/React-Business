"use client";

import React, { useState, useEffect } from "react";
import "./styles.css";
import SurgeryDetailsModal from "./SurgeryDetailsModal";
import RevenueDetailsModal from "./RevenueDetailsModal";
import {
  SurgeryScheduleData,
  CONTACT_PERSON_MAPPING,
} from "@/utils/googleSheets";
// Import Database API functions (แทน Python API)
import {
  fetchSurgeryScheduleFromDatabase,
  countDatabaseSurgeriesByDateAndPerson,
  calculateDatabaseRevenueByDateAndPerson,
} from "@/utils/databaseFilmData";
import {
  fetchSurgeryActualFromDatabase,
  countDatabaseActualSurgeriesByDate,
  calculateDatabaseActualRevenue,
} from "@/utils/databaseActualSurgery";
// import {
//   fetchSaleIncentiveFromDatabase,
//   calculateDailyRevenueByPerson,
//   SaleIncentiveData,
// } from "@/utils/databaseSaleIncentive";
import {
  fetchRevenueFutureFromDatabase,
  calculateDailyRevenueByPersonFuture,
  RevenueFutureData,
} from "@/utils/databaseRevenueFuture";
import {
  fetchNClinicFromDatabase,
  calculateDailyRevenueByPersonNClinic,
  NClinicData,
} from "@/utils/databaseNClinic";

export default function PerformanceSurgerySchedule() {
  // State for selected month and year
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // State for surgery data
  const [surgeryData, setSurgeryData] = useState<SurgeryScheduleData[]>([]);
  const [surgeryActualData, setSurgeryActualData] = useState<
    SurgeryScheduleData[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countMap, setCountMap] = useState<
    Map<string, Map<number, SurgeryScheduleData[]>>
  >(new Map());
  const [countMapL, setCountMapL] = useState<
    Map<string, Map<number, SurgeryScheduleData[]>>
  >(new Map());
  // const [revenueMap, setRevenueMap] = useState<
  //   Map<string, Map<number, number>>
  // >(new Map());
  const [filmRevenueMap, setFilmRevenueMap] = useState<
    Map<string, Map<number, number>>
  >(new Map());
  const [filmRevenueMapNClinic, setFilmRevenueMapNClinic] = useState<
    Map<string, Map<number, number>>
  >(new Map());
  // const [saleIncentiveData, setSaleIncentiveData] = useState<
  //   SaleIncentiveData[]
  // >([]);
  const [revenueFutureData, setRevenueFutureData] = useState<
    RevenueFutureData[]
  >([]);
  const [nClinicData, setNClinicData] = useState<NClinicData[]>([]);
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

  // Revenue Modal state
  const [revenueModalOpen, setRevenueModalOpen] = useState(false);
  const [selectedNClinicData, setSelectedNClinicData] = useState<NClinicData[]>(
    []
  );
  const [selectedFutureData, setSelectedFutureData] = useState<
    RevenueFutureData[]
  >([]);

  // Function to load surgery schedule data from Database
  const loadData = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    try {
      // Fetch surgery schedule data from Database (แทน Python API/Google Sheets)
      const data = await fetchSurgeryScheduleFromDatabase();
      setSurgeryData(data);

      // Fetch surgery actual data (L table)
      const actualData = await fetchSurgeryActualFromDatabase();
      setSurgeryActualData(actualData);

      setLastUpdated(new Date());
    } catch (error: any) {
      setError(error.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Function to load N_SaleIncentive data separately from Database (DISABLED - ใช้ bjh_all_leads แทน)
  // const loadSaleIncentiveData = async () => {
  //   try {
  //     const saleData = await fetchSaleIncentiveFromDatabase();
  //     console.log("📊 Sale Incentive Data Loaded:", {
  //       totalRecords: saleData.length,
  //       sampleRecords: saleData.slice(0, 3),
  //       uniquePersons: [...new Set(saleData.map((d) => d.sale_person))],
  //       monthYearCounts: saleData.reduce((acc: any, d) => {
  //         const key = `${d.year}-${d.month}`;
  //         acc[key] = (acc[key] || 0) + 1;
  //         return acc;
  //       }, {}),
  //     });
  //     setSaleIncentiveData(saleData);
  //     console.log("✅ Loaded N_SaleIncentive data from Database");
  //   } catch (error: any) {
  //     console.error("❌ Error loading N_SaleIncentive data:", error);
  //     // Don't set error state - let revenue table just be empty
  //     setSaleIncentiveData([]);
  //   }
  // };

  // Function to load N_Clinic Revenue data (sale_date <= today)
  const loadNClinicData = async () => {
    try {
      console.log(
        "🔄 Starting to load N_Clinic data (n_saleIncentive + n_staff + bjh_all_leads - sale_date <= today)..."
      );
      const clinicData = await fetchNClinicFromDatabase();
      console.log("💰 N_Clinic Data Loaded:", {
        totalRecords: clinicData.length,
        sampleRecords: clinicData.slice(0, 5),
        uniqueContactStaff: [
          ...new Set(clinicData.map((d) => d.contact_staff || "ไม่ระบุ")),
        ],
        sampleData: clinicData.slice(0, 5).map((d) => ({
          contact_staff: d.contact_staff,
          sale_date: d.sale_date,
          proposed_amount: d.proposed_amount,
          item_name: d.item_name,
        })),
      });
      setNClinicData(clinicData);
      console.log("✅ Loaded N_Clinic data (sale_date <= today)");
    } catch (error: any) {
      console.error("❌ Error loading N_Clinic data:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
      // Don't set error state - let revenue table just be empty
      setNClinicData([]);
    }
  };

  // Function to load Future Revenue data (surgery_date >= today)
  const loadRevenueFutureData = async () => {
    try {
      console.log(
        "🔄 Starting to load Revenue data (bjh_all_leads - surgery_date >= today)..."
      );
      const futureData = await fetchRevenueFutureFromDatabase();
      console.log("💰 Revenue Data Loaded (bjh_all_leads - Future only):", {
        totalRecords: futureData.length,
        sampleRecords: futureData.slice(0, 5),
        uniqueContactStaff: [
          ...new Set(futureData.map((d) => d.contact_staff || "ไม่ระบุ")),
        ],
        sampleData: futureData.slice(0, 5).map((d) => ({
          contact_staff: d.contact_staff,
          surgery_date: d.surgery_date,
          doctor: d.doctor,
          customer_name: d.customer_name,
          phone: d.phone,
          proposed_amount: d.proposed_amount,
          appointment_time: d.appointment_time,
        })),
      });
      setRevenueFutureData(futureData);
      console.log(
        "✅ Loaded Revenue data (bjh_all_leads - surgery_date >= today)"
      );
    } catch (error: any) {
      console.error("❌ Error loading Revenue data:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
      // Don't set error state - let revenue table just be empty
      setRevenueFutureData([]);
    }
  };

  // Fetch surgery data when component mounts
  useEffect(() => {
    (async () => {
      await loadData();
    })();
  }, []);

  // Fetch N_SaleIncentive data when component mounts or when month/year changes (DISABLED)
  // useEffect(() => {
  //   (async () => {
  //     await loadSaleIncentiveData();
  //   })();
  // }, [selectedMonth, selectedYear]);

  // Fetch N_Clinic data when component mounts or when month/year changes
  useEffect(() => {
    (async () => {
      await loadNClinicData();
    })();
  }, [selectedMonth, selectedYear]);

  // Fetch Future Revenue data when component mounts or when month/year changes
  useEffect(() => {
    (async () => {
      await loadRevenueFutureData();
    })();
  }, [selectedMonth, selectedYear]);

  // Auto-refresh surgery data every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      await loadData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Auto-refresh N_SaleIncentive data every 30 seconds (DISABLED)
  // useEffect(() => {
  //   const interval = setInterval(async () => {
  //     await loadSaleIncentiveData();
  //   }, 30000); // 30 seconds

  //   return () => clearInterval(interval);
  // }, []);

  // Auto-refresh N_Clinic data every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      await loadNClinicData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Auto-refresh Future Revenue data every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      await loadRevenueFutureData();
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

  // Update count maps when data or date changes
  useEffect(() => {
    if (surgeryData.length > 0) {
      // P table - วันที่ได้นัดผ่าตัด (Database)
      const newCountMap = countDatabaseSurgeriesByDateAndPerson(
        surgeryData,
        selectedMonth,
        selectedYear
      );

      setCountMap(newCountMap);
    }
  }, [surgeryData, selectedMonth, selectedYear]);

  // Update N_Clinic revenue map - ใช้ proposed_amount จาก n_clinic (sale_date <= today)
  useEffect(() => {
    console.log("🔄 Processing N_Clinic RevenueMap (sale_date <= today)...", {
      nClinicDataLength: nClinicData.length,
      selectedMonth,
      selectedYear,
      firstFewRecords: nClinicData.slice(0, 3).map((d) => ({
        sale_date: d.sale_date,
        contact_staff: d.contact_staff,
        proposed_amount: d.proposed_amount,
      })),
    });

    if (nClinicData.length > 0) {
      const newNClinicRevenueMap = calculateDailyRevenueByPersonNClinic(
        nClinicData,
        selectedMonth,
        selectedYear
      );

      console.log("🔍 N_Clinic Revenue Map Debug:", {
        mapSize: newNClinicRevenueMap.size,
        persons: Array.from(newNClinicRevenueMap.keys()),
        allData: Array.from(newNClinicRevenueMap.entries()).map(
          ([person, dayMap]) => ({
            person,
            totalDays: dayMap.size,
            days: Array.from(dayMap.entries()).slice(0, 10),
            totalRevenue: Array.from(dayMap.values()).reduce(
              (sum, val) => sum + val,
              0
            ),
          })
        ),
      });

      setFilmRevenueMapNClinic(newNClinicRevenueMap);
    } else {
      console.log("⚠️ No N_Clinic data to process, clearing map");
      setFilmRevenueMapNClinic(new Map());
    }
  }, [nClinicData, selectedMonth, selectedYear]);

  // Update film revenue map - ใช้ proposed_amount จาก bjh_all_leads (surgery_date >= today)
  useEffect(() => {
    console.log(
      "🔄 Processing filmRevenueMap (bjh_all_leads - Future surgeries)...",
      {
        futureDataLength: revenueFutureData.length,
        selectedMonth,
        selectedYear,
        firstFewRecords: revenueFutureData.slice(0, 3).map((d) => ({
          surgery_date: d.surgery_date,
          contact_staff: d.contact_staff,
          proposed_amount: d.proposed_amount,
        })),
      }
    );

    if (revenueFutureData.length > 0) {
      // ใช้ proposed_amount และ contact_staff จาก bjh_all_leads (surgery_date >= today)
      const newFilmRevenueMap = calculateDailyRevenueByPersonFuture(
        revenueFutureData,
        selectedMonth,
        selectedYear
      );

      console.log("🔍 Film Revenue Map Debug (bjh_all_leads - Future):", {
        mapSize: newFilmRevenueMap.size,
        persons: Array.from(newFilmRevenueMap.keys()),
        allData: Array.from(newFilmRevenueMap.entries()).map(
          ([person, dayMap]) => ({
            person,
            totalDays: dayMap.size,
            days: Array.from(dayMap.entries()).slice(0, 10),
            totalRevenue: Array.from(dayMap.values()).reduce(
              (sum, val) => sum + val,
              0
            ),
          })
        ),
      });

      setFilmRevenueMap(newFilmRevenueMap);
    } else {
      console.log("⚠️ No future revenue data to process, clearing map");
      setFilmRevenueMap(new Map());
    }
  }, [revenueFutureData, selectedMonth, selectedYear]);

  // Update L table count map when surgery actual data changes
  useEffect(() => {
    if (surgeryActualData.length > 0) {
      // L table - วันที่ผ่าตัด (Surgery Actual Database)
      const newCountMapL = countDatabaseActualSurgeriesByDate(
        surgeryActualData,
        selectedMonth,
        selectedYear
      );

      setCountMapL(newCountMapL);
    }
  }, [surgeryActualData, selectedMonth, selectedYear]);

  // Update revenue map when N_SaleIncentive data changes (DISABLED - ใช้ filmRevenueMap จาก bjh_all_leads แทน)
  // useEffect(() => {
  //   if (saleIncentiveData.length > 0) {
  //     // Revenue table - ประมาณการรายรับจากข้อมูลจริง (N_SaleIncentive)
  //     const newRevenueMap = calculateDailyRevenueByPerson(
  //       saleIncentiveData,
  //       selectedMonth,
  //       selectedYear
  //     );

  //     console.log("🔍 Revenue Map Debug:", {
  //       mapSize: newRevenueMap.size,
  //       persons: Array.from(newRevenueMap.keys()),
  //       sampleData: Array.from(newRevenueMap.entries())
  //         .slice(0, 2)
  //         .map(([person, dayMap]) => ({
  //           person,
  //           days: Array.from(dayMap.entries()),
  //         })),
  //     });

  //     setRevenueMap(newRevenueMap);
  //   } else {
  //     // Clear revenue map if no data
  //     setRevenueMap(new Map());
  //   }
  // }, [saleIncentiveData, selectedMonth, selectedYear]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Handle revenue cell click to open revenue modal
  const handleRevenueCellClick = (day: number, rowId: string) => {
    const contactPerson = CONTACT_PERSON_MAPPING[rowId];
    if (!contactPerson) return;

    // Parse date function
    const parseDateStr = (dateStr: string | undefined): Date | null => {
      if (!dateStr) return null;
      try {
        return new Date(dateStr);
      } catch {
        return null;
      }
    };

    // Filter N_Clinic data for this day and person
    const filteredNClinic = nClinicData.filter((item) => {
      const date = parseDateStr(item.sale_date);
      if (!date) return false;

      const itemDay = date.getDate();
      const itemMonth = date.getMonth();
      const itemYear = date.getFullYear();

      if (
        itemMonth !== selectedMonth ||
        itemYear !== selectedYear ||
        itemDay !== day
      ) {
        return false;
      }

      // For จีน row, include both จีน and มุก
      if (rowId === "105-จีน") {
        return item.contact_staff === "จีน" || item.contact_staff === "มุก";
      }

      return item.contact_staff === contactPerson;
    });

    // Filter Future Revenue data for this day and person
    const filteredFuture = revenueFutureData.filter((item) => {
      const date = parseDateStr(item.surgery_date);
      if (!date) return false;

      const itemDay = date.getDate();
      const itemMonth = date.getMonth();
      const itemYear = date.getFullYear();

      if (
        itemMonth !== selectedMonth ||
        itemYear !== selectedYear ||
        itemDay !== day
      ) {
        return false;
      }

      // For จีน row, include both จีน and มุก
      if (rowId === "105-จีน") {
        return item.contact_staff === "จีน" || item.contact_staff === "มุก";
      }

      return item.contact_staff === contactPerson;
    });

    if (filteredNClinic.length === 0 && filteredFuture.length === 0) return;

    // Find the display name from pScheduleRows
    const rowInfo = pScheduleRows.find((r) => r.id === rowId);
    const displayName = rowInfo ? rowInfo.name : contactPerson;

    setSelectedNClinicData(filteredNClinic);
    setSelectedFutureData(filteredFuture);
    setSelectedDate(day);
    setSelectedContactPerson(displayName);
    setRevenueModalOpen(true);
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

  // Get revenue for a specific cell (รวมข้อมูลจาก 2 API: N_Clinic + Future Revenue)
  const getCellRevenue = (day: number, rowId: string): number => {
    const contactPerson = CONTACT_PERSON_MAPPING[rowId];
    if (!contactPerson) {
      console.warn(`⚠️ No contact person mapping for rowId: ${rowId}`);
      return 0;
    }

    let totalRevenue = 0;

    // Debug: ตรวจสอบทั้ง 2 maps
    if (day === 1) {
      console.log(`🔍 Debug getCellRevenue for day ${day}, rowId ${rowId}:`, {
        rowId,
        contactPerson,
        nClinicMapSize: filmRevenueMapNClinic.size,
        futureMapSize: filmRevenueMap.size,
        nClinicMapKeys: Array.from(filmRevenueMapNClinic.keys()),
        futureMapKeys: Array.from(filmRevenueMap.keys()),
      });
    }

    // รวมข้อมูลจาก N_Clinic (sale_date <= today)
    if (filmRevenueMapNClinic.size > 0) {
      if (rowId === "105-จีน") {
        const jinRevenue = filmRevenueMapNClinic.get("จีน")?.get(day) || 0;
        const mukRevenue = filmRevenueMapNClinic.get("มุก")?.get(day) || 0;
        totalRevenue += jinRevenue + mukRevenue;
      } else {
        const revenue = filmRevenueMapNClinic.get(contactPerson)?.get(day) || 0;
        totalRevenue += revenue;
      }
    }

    // รวมข้อมูลจาก Future Revenue (surgery_date >= today)
    if (filmRevenueMap.size > 0) {
      if (rowId === "105-จีน") {
        const jinRevenue = filmRevenueMap.get("จีน")?.get(day) || 0;
        const mukRevenue = filmRevenueMap.get("มุก")?.get(day) || 0;
        totalRevenue += jinRevenue + mukRevenue;
      } else {
        const revenue = filmRevenueMap.get(contactPerson)?.get(day) || 0;
        totalRevenue += revenue;
      }
    }

    if (day === 1 && totalRevenue > 0) {
      console.log(
        `💰 Total Revenue for ${rowId} (${contactPerson}) day ${day}:`,
        {
          nClinic:
            rowId === "105-จีน"
              ? (filmRevenueMapNClinic.get("จีน")?.get(day) || 0) +
                (filmRevenueMapNClinic.get("มุก")?.get(day) || 0)
              : filmRevenueMapNClinic.get(contactPerson)?.get(day) || 0,
          future:
            rowId === "105-จีน"
              ? (filmRevenueMap.get("จีน")?.get(day) || 0) +
                (filmRevenueMap.get("มุก")?.get(day) || 0)
              : filmRevenueMap.get(contactPerson)?.get(day) || 0,
          totalRevenue,
        }
      );
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
                <li>ตรวจสอบว่า PostgreSQL Database กำลังทำงานอยู่</li>
                <li>
                  ตรวจสอบ Environment Variables (Settings → Environment
                  Variables):
                  <br />- <code>DB_HOST</code>
                  <br />- <code>DB_PORT</code>
                  <br />- <code>DB_USER</code>
                  <br />- <code>DB_PASSWORD</code>
                  <br />- <code>DB_NAME</code>
                </li>
                <li>
                  ตรวจสอบว่ามีตาราง <code>surgery_schedule</code> และ{" "}
                  <code>sale_incentive</code> ในฐานข้อมูล
                </li>
                <li>
                  รันคำสั่ง SQL schema: <code>surgery-schedule-schema.sql</code>
                </li>
                <li>ลอง Redeploy Vercel อีกครั้ง</li>
              </ol>
            </div>
            <button
              onClick={async () => {
                await loadData();
                await loadNClinicData();
                await loadRevenueFutureData();
              }}
              className="retry-button"
            >
              ลองใหม่อีกครั้ง
            </button>
          </div>
        </div>
      )}

      {/* Table - วันที่ได้นัดผ่า P */}
      <div className="table-section ">
        <div className="table-wrapper">
          <table className="schedule-table">
            <thead>
              <tr>
                <th className="header-cell name-header" rowSpan={2}>
                  จำนวนที่ได้นัดผ่าตัด
                </th>
                {days.map((day) => (
                  <th
                    key={`p-day-${day}`}
                    className={`header-cell day-header  ${
                      isWeekday(day) ? "weekday-header" : ""
                    }`}
                    style={{ width: "62px" }}
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
                {days.map((day) => (
                  <th
                    key={`l-day-${day}`}
                    className={`header-cell day-header ${
                      isWeekday(day) ? "weekday-header" : ""
                    }`}
                    style={{ width: "62px" }}
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
                {days.map((day) => (
                  <th
                    key={`revenue-day-${day}`}
                    className={`header-cell day-header ${
                      isWeekday(day) ? "weekday-header" : ""
                    }`}
                    style={{ width: "62px" }}
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
                  {days.map((day) => {
                    const revenue = getCellRevenue(day, row.id);
                    return (
                      <td
                        key={`revenue-cell-${row.id}-${day}`}
                        className={`data-cell ${
                          revenue > 0 ? "has-data revenue-cell" : ""
                        }`}
                        onClick={() =>
                          revenue > 0 && handleRevenueCellClick(day, row.id)
                        }
                        title={
                          revenue > 0
                            ? `คลิกเพื่อดูรายละเอียด\nยอดรวม: ${formatCurrency(
                                revenue
                              )} บาท`
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

      {/* Revenue Details Modal */}
      <RevenueDetailsModal
        isOpen={revenueModalOpen}
        onClose={() => setRevenueModalOpen(false)}
        nClinicData={selectedNClinicData}
        futureData={selectedFutureData}
        date={selectedDate}
        month={selectedMonth}
        year={selectedYear}
        contactPerson={selectedContactPerson}
      />
    </div>
  );
}
