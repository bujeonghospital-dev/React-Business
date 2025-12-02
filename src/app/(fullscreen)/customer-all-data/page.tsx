"use client";
import React, { useState, useEffect, useMemo, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  RefreshCw,
  Download,
  ChevronUp,
  ChevronDown,
  Filter,
  X,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { EditCustomerModal } from "@/components/EditCustomerModal";
import { AddCustomerModal } from "@/components/AddCustomerModal";
import UserMenu from "@/components/UserMenu";
import { getLatestUpdatedAt } from "@/app/api/customer-data/utils";
// Add custom styles for scrollbar (horizontal and vertical)
const customScrollbarStyle = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(219, 234, 254, 0.5);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, #3b82f6, #06b6d4);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(to bottom, #0284c7, #0891b2);
  }
  .custom-scrollbar-horizontal::-webkit-scrollbar {
    height: 8px;
    width: 8px;
  }
  .custom-scrollbar-horizontal::-webkit-scrollbar-track {
    background: rgba(219, 234, 254, 0.5);
    border-radius: 10px;
  }
  .custom-scrollbar-horizontal::-webkit-scrollbar-thumb {
    background: linear-gradient(to right, #3b82f6, #06b6d4);
    border-radius: 10px;
  }
  .custom-scrollbar-horizontal::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(to right, #0284c7, #0891b2);
  }
`;
interface TableData {
  tableNumber: number;
  headers: string[];
  rowCount: number;
  data: Record<string, any>[];
}
interface ApiResponse {
  success: boolean;
  error?: string;
  totalTables: number;
  tables: TableData[];
  rawData: {
    totalRows: number;
    totalColumns: number;
  };
}

interface TableSizeOption {
  id: number;
  size_value: number;
  size_label: string;
  sort_order: number;
}
const CustomerAllDataPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerType = searchParams.get("type"); // "existing" or "new"
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [lastUpdateTimestamp, setLastUpdateTimestamp] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filterColumn, setFilterColumn] = useState<string>("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [productFilter, setProductFilter] = useState<string>("all");
  const [showProductMenu, setShowProductMenu] = useState(false);
  const [contactFilter, setContactFilter] = useState<string>("all");
  const [showContactMenu, setShowContactMenu] = useState(false);
  const [showFollowUpLastMenu, setShowFollowUpLastMenu] = useState(false);
  const [followUpLastDate, setFollowUpLastDate] = useState<string>("");
  const [showFollowUpNextMenu, setShowFollowUpNextMenu] = useState(false);
  const [followUpNextDate, setFollowUpNextDate] = useState<string>("");
  const [showConsultMenu, setShowConsultMenu] = useState(false);
  const [consultDate, setConsultDate] = useState<string>("");
  const [showSurgeryMenu, setShowSurgeryMenu] = useState(false);
  const [surgeryDate, setSurgeryDate] = useState<string>("");
  const [showGetNameMenu, setShowGetNameMenu] = useState(false);
  const [getNameDate, setGetNameDate] = useState<string>("");
  const [showGetConsultApptMenu, setShowGetConsultApptMenu] = useState(false);
  const [getConsultApptDate, setGetConsultApptDate] = useState<string>("");
  const [showGetSurgeryApptMenu, setShowGetSurgeryApptMenu] = useState(false);
  const [getSurgeryApptDate, setGetSurgeryApptDate] = useState<string>("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(500);
  const [selectedRow, setSelectedRow] = useState<Record<string, any> | null>(
    null
  );
  const [editedRow, setEditedRow] = useState<Record<string, any> | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Record<
    string,
    any
  > | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [statusOptions, setStatusOptions] = useState<
    Array<{ value: string; label: string; color: string }>
  >([]);
  const [tableSizeOptions, setTableSizeOptions] = useState<TableSizeOption[]>(
    []
  );
  const [showTableSizeMenu, setShowTableSizeMenu] = useState(false);
  const [tableSize, setTableSize] = useState<number>(500);
  const tableDataRef = useRef<TableData[]>([]);
  const fetchData = async () => {
    try {
      setIsLoading(true);
      // ใช้ API endpoint ที่เชื่อมกับ n8n database
      const response = await fetch("/api/customer-data");
      const result = await response.json();
      if (
        !result.success ||
        !result.columns ||
        !result.data ||
        result.data.length === 0
      ) {
        return;
      }
      // API ตอนนี้ return format: { success: true, columns: [...], data: [{...}, {...}], ... }
      // ข้อมูลเป็น array of objects แล้ว ไม่ต้องแปลง
      // รวม 'id' ใน headers เพื่อแสดงในตาราง
      const headers = result.columns;
      const formattedData = result.data;
      const tables = [
        {
          tableNumber: 1,
          headers: headers,
          rowCount: formattedData.length,
          data: formattedData,
        },
      ];
      if (tables && tables.length > 0) {
        const sanitizedTables = tables.map((table: TableData) => {
          // Trim whitespace so columns with stray spaces still render and match filters
          const sanitizedHeaders = table.headers.map((header: string) =>
            header.trim()
          );
          const sanitizedData = table.data.map((row: Record<string, any>) => {
            const sanitizedRow: Record<string, any> = {};
            Object.entries(row).forEach(([key, value]) => {
              sanitizedRow[key.trim()] = value;
            });
            return sanitizedRow;
          });
          return {
            ...table,
            headers: sanitizedHeaders,
            data: sanitizedData,
            rowCount: sanitizedData.length,
          };
        });
        // Define the desired column order for consistency between table and form
        const columnOrder = [
          "ผู้ติดต่อ",
          "สถานะ",
          "ผลิตภัณฑ์ที่สนใจ",
          "ชื่อ",
          "เบอร์โทร",
          "เพศ",
          "แหล่งที่มา",
          "หมายเหตุ",
          "วันที่ได้ชื่อ เบอร์",
          "วันที่ติดตามครั้งล่าสุด",
          "วันที่ติดตามครั้งถัดไป",
          "วันที่ได้นัด consult",
          "วันที่ Consult",
          "วันที่ได้นัดผ่าตัด",
          "วันที่ผ่าตัด",
          "เวลาที่นัด",
          "หมอ",
          "ยอดนำเสนอ",
          "รหัสลูกค้า",
          "ติดดาว",
          "ประเทศ",
          "เวลาให้เรียกรถ",
          "Lat",
          "Long",
          "id",
        ];
        
        // Mandatory fields that should always be shown even if empty
        const mandatoryFields = [
          "สถานะ",
          "ผลิตภัณฑ์ที่สนใจ",
          "ชื่อ",
          "เบอร์โทร",
          "แหล่งที่มา",
          "เพศ",
        ];
        
        const allHeadersSet = new Set<string>();
        const allHeaders: string[] = [];
        
        // First add mandatory fields in the column order
        columnOrder.forEach((header) => {
          if (mandatoryFields.includes(header) && !allHeadersSet.has(header)) {
            allHeadersSet.add(header);
            allHeaders.push(header);
          }
        });
        
        // Then add other headers in the desired order that exist in data
        columnOrder.forEach((header) => {
          if (!allHeadersSet.has(header)) {
            sanitizedTables.forEach((table) => {
              if (table.headers.includes(header) && !allHeadersSet.has(header)) {
                allHeadersSet.add(header);
                allHeaders.push(header);
              }
            });
          }
        });
        // Then add any remaining headers not in the columnOrder
        sanitizedTables.forEach((table: TableData) => {
          table.headers.forEach((header: string) => {
            if (!allHeadersSet.has(header)) {
              allHeadersSet.add(header);
              allHeaders.push(header);
            }
          });
        });
        
        const filteredHeaders = allHeaders.filter((header: string) => {
          // Exclude specified columns
          const excludedColumns = [
            "รูป",
            "อายุ",
            "รหัสลูกค้า",
            "อาชีพ",
            "มาจากจังหวัด",
            "จะเดินทางมารพ.ยังไง",
            "Event ID",
            "htmlLink",
            "iCalUID",
            "Log",
            "Doc Calendar",
            "Doc Event ID",
            "Doc htmlLink",
            "Doc iCalUID",
            "line",
            "line หมอ",
            "IVR",
            "TRANSFER_TO",
            "status_call",
          ];
          if (excludedColumns.includes(header)) {
            return false;
          }
          // Always include mandatory fields
          if (mandatoryFields.includes(header)) {
            return true;
          }
          return sanitizedTables.some((table: TableData) => {
            return table.data.some(
              (row: Record<string, any>) =>
                row[header] !== undefined &&
                row[header] !== null &&
                row[header] !== ""
            );
          });
        });
        const allData: Record<string, any>[] = [];
        sanitizedTables.forEach((table: TableData) => {
          allData.push(...table.data);
        });
        // Filter by customer type based on CN number (cn column from OPD system)
        let typeFilteredData = allData;
        if (customerType === "existing") {
          // ลูกค้าเก่า - customers with CN number (opened OPD)
          typeFilteredData = allData.filter((row) => {
            const cnValue = row["cn"];
            return cnValue && cnValue.toString().trim() !== "";
          });
        } else if (customerType === "new") {
          // ลูกค้าใหม่ - customers without CN number (not opened OPD yet)
          typeFilteredData = allData.filter((row) => {
            const cnValue = row["cn"];
            return !cnValue || cnValue.toString().trim() === "";
          });
        }
        // Keep all rows that have at least one value in any header
        const filteredData = typeFilteredData.filter((row) => {
          return filteredHeaders.some((header) => {
            const value = row[header];
            return value !== undefined && value !== null && value !== "";
          });
        });
        const mergedTable: TableData = {
          tableNumber: 1,
          headers: filteredHeaders,
          rowCount: filteredData.length,
          data: filteredData,
        };
        setTableData([mergedTable]);
        const latestTimestamp = getLatestUpdatedAt(result.data);
        if (latestTimestamp) {
          setLastUpdateTimestamp(latestTimestamp);
        }
      } else {
        setTableData([]);
      }
    } catch (err) {
      // Error during fetch
    } finally {
      setIsLoading(false);
    }
  };
  const fetchStatusOptions = async () => {
    try {
      const response = await fetch("/api/status-options");
      const result = await response.json();
      if (result.success && result.data) {
        setStatusOptions(result.data);
      } else {
        console.error("Failed to fetch status options:", result.error);
        // Fallback to default if API fails
        setStatusOptions([
          {
            value: "all",
            label: "ทั้งหมด",
            color: "bg-gray-200 text-gray-800",
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching status options:", error);
      // Fallback to default if API fails
      setStatusOptions([
        { value: "all", label: "ทั้งหมด", color: "bg-gray-200 text-gray-800" },
      ]);
    }
  };

  const fetchTableSizeOptions = async () => {
    try {
      const response = await fetch("/api/table-size-options");
      const result = await response.json();
      if (result.success && result.data) {
        setTableSizeOptions(result.data);
      } else {
        console.error("Failed to fetch table size options:", result.error);
      }
    } catch (error) {
      console.error("Error fetching table size options:", error);
    }
  };
  const fetchRealtimeUpdates = useCallback(async () => {
    if (!lastUpdateTimestamp || tableDataRef.current.length === 0) {
      return;
    }
    try {
      const response = await fetch(
        `/api/customer-updates?since=${encodeURIComponent(lastUpdateTimestamp)}`
      );
      const result = await response.json();
      if (!response.ok || result.success === false) {
        return;
      }
      if (!Array.isArray(result.data) || result.data.length === 0) {
        return;
      }
      const currentTable = tableDataRef.current[0];
      if (!currentTable) {
        return;
      }
      const mergedMap = new Map<any, Record<string, any>>();
      currentTable.data.forEach((row) => {
        if (row.id !== undefined && row.id !== null) {
          mergedMap.set(row.id, row);
        }
      });
      result.data.forEach((incoming: Record<string, any>) => {
        if (incoming.id === undefined || incoming.id === null) {
          return;
        }
        const existing = mergedMap.get(incoming.id);
        mergedMap.set(
          incoming.id,
          existing ? { ...existing, ...incoming } : incoming
        );
      });
      const updatedData = Array.from(mergedMap.values());
      const mergedHeaders = [...currentTable.headers];
      (result.columns || []).forEach((column: string) => {
        if (!mergedHeaders.includes(column)) {
          mergedHeaders.push(column);
        }
      });
      setTableData([
        {
          ...currentTable,
          headers: mergedHeaders,
          data: updatedData,
          rowCount: updatedData.length,
        },
      ]);
      if (result.latestUpdatedAt) {
        setLastUpdateTimestamp(result.latestUpdatedAt);
      }
    } catch (error) {
      console.error("Error fetching realtime updates:", error);
    }
  }, [lastUpdateTimestamp]);
  useEffect(() => {
    tableDataRef.current = tableData;
  }, [tableData]);
  useEffect(() => {
    // Check authentication and get user data
    const checkAuth = () => {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        window.location.href = "/login";
        return;
      }
      const user = JSON.parse(userStr);
      setCurrentUser(user);
    };
    checkAuth();
    fetchData();
    fetchStatusOptions();
    fetchTableSizeOptions();
  }, []);
  useEffect(() => {
    if (!lastUpdateTimestamp || tableData.length === 0) {
      return;
    }
    fetchRealtimeUpdates();
    const interval = setInterval(fetchRealtimeUpdates, 8000);
    return () => clearInterval(interval);
  }, [lastUpdateTimestamp, fetchRealtimeUpdates, tableData.length]);

  // Debounce search term - only update after 300ms of no typing and when 3+ chars
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length >= 3 || searchTerm.length === 0) {
        setDebouncedSearchTerm(searchTerm);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Close all menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Close dropdowns when clicking outside the filter toolbar
      if (!target.closest('.filter-toolbar')) {
        closeAllFilterMenus();
      }
    };

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  // Helper function to format date values and remove timezone
  const formatDateValue = (value: any): string => {
    if (!value) return "";
    const strValue = String(value);

    // Check if value contains ISO date format with timezone (T...Z)
    if (strValue.includes("T") && strValue.includes("Z")) {
      try {
        // Extract just the date part (YYYY-MM-DD)
        const dateOnly = strValue.split("T")[0];
        return dateOnly;
      } catch (error) {
        return strValue;
      }
    }

    return strValue;
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };
  const handleEditRow = (row: Record<string, any>) => {
    setSelectedRow(row);
    setEditedRow({ ...row });
  };
  const handleFieldChange = (fieldName: string, value: any) => {
    if (editedRow) {
      setEditedRow({
        ...editedRow,
        [fieldName]: value,
      });
    }
  };
  const handleSaveRow = () => {
    if (editedRow) {
      // Data saved successfully
    }
  };
  const exportToCSV = () => {
    if (tableData.length === 0) return;
    const table = tableData[0];
    const headers = table.headers.join(",");
    const rows = filteredAndSortedData
      .map((row) =>
        table.headers
          .map((header) => {
            const value = row[header] || "";
            const stringValue = String(value).replace(/"/g, '""');
            return stringValue.includes(",") ? `"${stringValue}"` : stringValue;
          })
          .join(",")
      )
      .join("\n");
    const csv = `\ufeff${headers}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `customer_data_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const exportToExcel = () => {
    if (tableData.length === 0) return;
    const table = tableData[0];
    let html = '<html xmlns:x="urn:schemas-microsoft-com:office:excel">';
    html += '<head><meta charset="UTF-8"></head><body>';
    html += '<table border="1">';
    html += "<tr>";
    table.headers.forEach((header) => {
      html += `<th style="background-color: #fde047; font-weight: bold;">${header}</th>`;
    });
    html += "</tr>";
    filteredAndSortedData.forEach((row, idx) => {
      const bgColor = idx % 2 === 0 ? "#ffffff" : "#fbcfe8";
      html += `<tr style="background-color: ${bgColor};">`;
      table.headers.forEach((header) => {
        const value = row[header] || "-";
        html += `<td>${value}</td>`;
      });
      html += "</tr>";
    });
    html += "</table></body></html>";
    const blob = new Blob([html], { type: "application/vnd.ms-excel" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `customer_data_${new Date().toISOString().split("T")[0]}.xls`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handleEditCustomer = (row: Record<string, any>) => {
    console.log("🔧 Opening edit modal for:", row);
    setEditingCustomer(row);
    setIsEditModalOpen(true);
  };
  const handleSaveCustomer = async (updatedData: Record<string, any>) => {
    try {
      const response = await fetch("/api/customer-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "update",
          data: updatedData,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setIsEditModalOpen(false);
        // รีโหลดข้อมูลใหม่
        await fetchData();
      } else {
        console.error(`เกิดข้อผิดพลาด: ${result.error}`);
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  const handleAddCustomer = async (newData: Record<string, any>) => {
    try {
      const response = await fetch("/api/customer-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "create",
          data: newData,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setIsAddModalOpen(false);
        // รีโหลดข้อมูลใหม่
        await fetchData();
      } else {
        console.error(`เกิดข้อผิดพลาด: ${result.error}`);
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการเพิ่มข้อมูล");
    }
  };

  const handleDeleteMultiple = async () => {
    if (selectedIds.length === 0) {
      alert("กรุณาเลือกรายการที่ต้องการลบ");
      return;
    }

    const confirmMessage = `คุณต้องการลบข้อมูล ${selectedIds.length
      } รายการใช่หรือไม่?\n\nID ที่จะลบ: ${selectedIds.join(
        ", "
      )}\n\nการดำเนินการนี้ไม่สามารถย้อนกลับได้`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch("/api/customer-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "deleteMultiple",
          data: { ids: selectedIds },
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(`ลบข้อมูลสำเร็จ ${result.deletedCount} รายการ`);
        setSelectedIds([]);
        await fetchData();
      } else {
        alert(`เกิดข้อผิดพลาด: ${result.error}`);
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการลบข้อมูล:", error);
      alert("เกิดข้อผิดพลาดในการลบข้อมูล");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredAndSortedData.length) {
      setSelectedIds([]);
    } else {
      const allIds = filteredAndSortedData
        .map((row) => row["id"])
        .filter((id) => id != null);
      setSelectedIds(allIds);
    }
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((selectedId) => selectedId !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  const filteredAndSortedData = useMemo(() => {
    if (tableData.length === 0) return [];

    // Only consider search term active if it has 3+ characters
    const effectiveSearchTerm = debouncedSearchTerm.length >= 3 ? debouncedSearchTerm : "";

    // Check if any filter is active - if not, return empty for performance
    const hasActiveFilter =
      statusFilter !== "all" ||
      productFilter !== "all" ||
      contactFilter !== "all" ||
      followUpLastDate ||
      followUpNextDate ||
      consultDate ||
      surgeryDate ||
      getNameDate ||
      getConsultApptDate ||
      getSurgeryApptDate ||
      effectiveSearchTerm;

    // Return empty array if no filters applied (for mobile performance)
    if (!hasActiveFilter) return [];

    let filtered = [...tableData[0].data];
    // Filter by current user if not superadmin or admin
    if (
      currentUser &&
      currentUser.role_tag !== "superadmin" &&
      currentUser.role_tag !== "admin"
    ) {
      const contactColumnIndex = tableData[0].headers.findIndex(
        (h) =>
          h.toLowerCase().includes("ผู้ติดต่อ") ||
          h.toLowerCase().includes("contact") ||
          h.toLowerCase().includes("ติดต่อ")
      );
      if (contactColumnIndex !== -1) {
        const contactColumn = tableData[0].headers[contactColumnIndex];
        filtered = filtered.filter((row) => {
          const value = row[contactColumn];
          // Match by user's name
          return value && String(value).trim() === currentUser.name;
        });
      }
    }
    if (statusFilter !== "all") {
      const statusColumnIndex = tableData[0].headers.findIndex(
        (h) =>
          h.toLowerCase().includes("สถานะ") ||
          h.toLowerCase().includes("status")
      );
      if (statusColumnIndex !== -1) {
        const statusColumn = tableData[0].headers[statusColumnIndex];
        filtered = filtered.filter((row) => {
          const value = row[statusColumn];
          return value && String(value).trim() === statusFilter;
        });
      }
    }
    if (productFilter !== "all") {
      const productColumnIndex = tableData[0].headers.findIndex(
        (h) =>
          h.toLowerCase().includes("ผลิตภัณฑ์") ||
          h.toLowerCase().includes("product") ||
          h.toLowerCase().includes("สนใจ")
      );
      if (productColumnIndex !== -1) {
        const productColumn = tableData[0].headers[productColumnIndex];
        filtered = filtered.filter((row) => {
          const value = row[productColumn];
          if (value) {
            const products = String(value)
              .split(/[,\n]+/)
              .map((p) => p.trim());
            return products.some((p) => p === productFilter);
          }
          return false;
        });
      }
    }
    if (contactFilter !== "all") {
      const contactColumnIndex = tableData[0].headers.findIndex(
        (h) =>
          h.toLowerCase().includes("ผู้ติดต่อ") ||
          h.toLowerCase().includes("contact") ||
          h.toLowerCase().includes("ติดต่อ")
      );
      if (contactColumnIndex !== -1) {
        const contactColumn = tableData[0].headers[contactColumnIndex];
        filtered = filtered.filter((row) => {
          const value = row[contactColumn];
          return value && String(value).trim() === contactFilter;
        });
      }
    }
    const filterByDate = (columnName: string, dateValue: string) => {
      if (!dateValue) return;
      const dateColumnIndex = tableData[0].headers.findIndex(
        (h) => h.trim() === columnName
      );
      if (dateColumnIndex !== -1) {
        const dateColumn = tableData[0].headers[dateColumnIndex];
        filtered = filtered.filter((row) => {
          const value = row[dateColumn];
          if (!value) return false;
          const dateStr = String(value).trim();
          let rowDate: Date | null = null;
          const ddmmyyyyMatch = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
          if (ddmmyyyyMatch) {
            const [, day, month, year] = ddmmyyyyMatch;
            rowDate = new Date(
              parseInt(year),
              parseInt(month) - 1,
              parseInt(day)
            );
          } else if (dateStr.match(/\d{4}-\d{2}-\d{2}/)) {
            rowDate = new Date(dateStr);
          }
          if (!rowDate || isNaN(rowDate.getTime())) return false;
          const filterDate = new Date(dateValue);

          // Set time to start of day for comparison
          filterDate.setHours(0, 0, 0, 0);
          rowDate.setHours(0, 0, 0, 0);

          return rowDate.getTime() === filterDate.getTime();
        });
      }
    };
    filterByDate("วันที่ติดตามครั้งล่าสุด", followUpLastDate);
    filterByDate("วันที่ติดตามครั้งถัดไป", followUpNextDate);
    filterByDate("วันที่ Consult", consultDate);
    filterByDate("วันที่ผ่าตัด", surgeryDate);
    filterByDate("วันที่ได้ชื่อ เบอร์", getNameDate);
    filterByDate("วันที่ได้นัด Consult", getConsultApptDate);
    filterByDate("วันที่ได้นัดผ่าตัด", getSurgeryApptDate);
    // Use effective search term (only if 3+ characters)
    if (effectiveSearchTerm) {
      filtered = filtered.filter((row) => {
        if (filterColumn === "all") {
          return tableData[0].headers.some((header) => {
            const value = row[header];
            return (
              value &&
              String(value).toLowerCase().includes(effectiveSearchTerm.toLowerCase())
            );
          });
        } else {
          const value = row[filterColumn];
          return (
            value &&
            String(value).toLowerCase().includes(effectiveSearchTerm.toLowerCase())
          );
        }
      });
    }
    if (sortColumn) {
      filtered.sort((a, b) => {
        const aVal = a[sortColumn] || "";
        const bVal = b[sortColumn] || "";
        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        if (aStr < bStr) return sortDirection === "asc" ? -1 : 1;
        if (aStr > bStr) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [
    tableData,
    debouncedSearchTerm,
    filterColumn,
    sortColumn,
    sortDirection,
    statusFilter,
    productFilter,
    contactFilter,
    followUpLastDate,
    currentUser,
    followUpNextDate,
    consultDate,
    surgeryDate,
    getNameDate,
    getConsultApptDate,
    getSurgeryApptDate,
  ]);

  // Helper to check if any filter is active (for UI display)
  const hasActiveFilter = useMemo(() => {
    const effectiveSearch = debouncedSearchTerm.length >= 3;
    return (
      statusFilter !== "all" ||
      productFilter !== "all" ||
      contactFilter !== "all" ||
      followUpLastDate ||
      followUpNextDate ||
      consultDate ||
      surgeryDate ||
      getNameDate ||
      getConsultApptDate ||
      getSurgeryApptDate ||
      effectiveSearch
    );
  }, [statusFilter, productFilter, contactFilter, followUpLastDate, followUpNextDate, consultDate, surgeryDate, getNameDate, getConsultApptDate, getSurgeryApptDate, debouncedSearchTerm]);

  // Check if user is typing but hasn't reached minimum characters yet
  const isTypingSearch = searchTerm.length > 0 && searchTerm.length < 3;

  // Compact columns to show when filter/search is active
  const compactColumns = ["สถานะ", "ชื่อ", "เบอร์โทร", "ผลิตภัณฑ์ที่สนใจ"];

  // Get display headers based on filter state
  const displayHeaders = useMemo(() => {
    if (hasActiveFilter && tableData.length > 0) {
      return compactColumns.filter(col => tableData[0].headers.includes(col));
    }
    return tableData.length > 0 ? tableData[0].headers : [];
  }, [hasActiveFilter, tableData]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedData.slice(startIndex, endIndex);
  }, [filteredAndSortedData, currentPage, itemsPerPage]);
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);

  // ฟังก์ชันสำหรับปิดตัวกรองทั้งหมด
  const closeAllFilterMenus = () => {
    setShowFilterMenu(false);
    setShowStatusMenu(false);
    setShowProductMenu(false);
    setShowContactMenu(false);
    setShowFollowUpLastMenu(false);
    setShowFollowUpNextMenu(false);
    setShowConsultMenu(false);
    setShowSurgeryMenu(false);
    setShowGetNameMenu(false);
    setShowGetConsultApptMenu(false);
    setShowGetSurgeryApptMenu(false);
    setShowTableSizeMenu(false);
  };

  const contactOptions = [
    { value: "all", label: "ทั้งหมด" },
    { value: "สา", label: "สา" },
    { value: "เจ", label: "เจ" },
    { value: "พิดยา", label: "พิดยา" },
    { value: "ว่าน", label: "ว่าน" },
    { value: "จีน", label: "จีน" },
    { value: "มุก", label: "มุก" },
    { value: "ตั้งโอ๋", label: "ตั้งโอ๋" },
  ];
  const productOptions = [
    { value: "all", label: "ทั้งหมด" },
    { value: "ตีตัวไล่ตัว", label: "ตีตัวไล่ตัว" },
    { value: "Sub brow lift", label: "Sub brow lift" },
    { value: "แก้ตาหมื่อตอนและแก้ว", label: "แก้ตาหมื่อตอนและแก้ว" },
    { value: "ตาสองชั้น", label: "ตาสองชั้น" },
    { value: "เสริมจมูก", label: "เสริมจมูก" },
    { value: "แก้จมูก", label: "แก้จมูก" },
    { value: "เสร็จตาขาว", label: "เสร็จตาขาว" },
    { value: "ลิงหน้า", label: "ลิงหน้า" },
    { value: "Skin", label: "Skin" },
    { value: "ตื่อ", label: "ตื่อ" },
  ];
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    filterColumn,
    statusFilter,
    productFilter,
    contactFilter,
    followUpLastDate,
    followUpNextDate,
    consultDate,
    surgeryDate,
    getNameDate,
    getConsultApptDate,
    getSurgeryApptDate,
  ]);
  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <div className="text-gray-600">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }
  return (
    <>
      <style>{customScrollbarStyle}</style>
      <div className="w-full min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-3 flex flex-col">
        {/* Header - Back and Add buttons */}
        <div className="flex justify-between items-center mb-3">
          <button
            onClick={() => router.push("/customer-selection")}
            className="flex items-center justify-center w-11 h-11 bg-white hover:bg-slate-50 text-slate-600 rounded-xl transition-all shadow-sm border border-slate-200 active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          {/* Title showing customer type */}
          <div className="flex-1 text-center">
            <h1 className="text-lg font-semibold text-slate-700">
              {customerType === "existing" ? "ลูกค้าเก่า" : customerType === "new" ? "ลูกค้าใหม่" : "ลูกค้าทั้งหมด"}
            </h1>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center w-11 h-11 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl transition-all shadow-md active:scale-95"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาลูกค้า (พิมพ์อย่างน้อย 3 ตัวอักษร)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-sm ${isTypingSearch ? "border-yellow-400" : "border-slate-200"
                }`}
            />
            {isTypingSearch && (
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-yellow-600">
                +{3 - searchTerm.length}
              </span>
            )}
          </div>
        </div>

        {/* Mobile Filter Button & Active Count */}
        <div className="flex md:hidden items-center gap-2 mb-3">
          <button
            onClick={() => setShowFilterSheet(true)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all text-sm font-medium ${hasActiveFilter
              ? "bg-blue-500 text-white shadow-md"
              : "bg-white text-slate-600 border border-slate-200 shadow-sm"
              }`}
          >
            <Filter className="w-5 h-5" />
            <span>ตัวกรอง</span>
            {hasActiveFilter && (
              <span className="bg-white text-blue-500 px-2 py-0.5 rounded-full text-xs font-bold">
                {[
                  statusFilter !== "all",
                  productFilter !== "all",
                  contactFilter !== "all",
                  followUpLastDate,
                  followUpNextDate,
                  consultDate,
                  surgeryDate,
                  getNameDate,
                  getConsultApptDate,
                  getSurgeryApptDate,
                  searchTerm
                ].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Delete Button - Show when items selected */}
        {selectedIds.length > 0 && (
          <div className="mb-3 md:hidden">
            <button
              onClick={handleDeleteMultiple}
              disabled={isDeleting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 disabled:opacity-50 shadow-md"
            >
              <X className="w-4 h-4" />
              {isDeleting ? "กำลังลบ..." : `ลบรายการที่เลือก (${selectedIds.length})`}
            </button>
          </div>
        )}

        {/* Mobile Filter Bottom Sheet */}
        {showFilterSheet && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 transition-opacity"
              onClick={() => setShowFilterSheet(false)}
            />

            {/* Sheet */}
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] overflow-hidden animate-slide-up">
              {/* Handle */}
              <div className="flex justify-center py-3">
                <div className="w-10 h-1 bg-slate-300 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-4 pb-3 border-b border-slate-100">
                <h3 className="text-lg font-semibold text-slate-800">ตัวกรอง</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setStatusFilter("all");
                      setProductFilter("all");
                      setContactFilter("all");
                      setFollowUpLastDate("");
                      setFollowUpNextDate("");
                      setConsultDate("");
                      setSurgeryDate("");
                      setGetNameDate("");
                      setGetConsultApptDate("");
                      setGetSurgeryApptDate("");
                    }}
                    className="px-3 py-1.5 text-sm text-rose-500 hover:bg-rose-50 rounded-lg"
                  >
                    ล้างทั้งหมด
                  </button>
                  <button
                    onClick={() => setShowFilterSheet(false)}
                    className="p-2 hover:bg-slate-100 rounded-full"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
              </div>

              {/* Filter Content - Scrollable */}
              <div className="overflow-y-auto max-h-[calc(85vh-120px)] px-4 py-4">
                {/* Status Filter */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-slate-700 mb-2">สถานะ</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">ทั้งหมด</option>
                    {statusOptions.map((status) => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>

                {/* Product Filter */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-slate-700 mb-2">สินค้า</label>
                  <select
                    value={productFilter}
                    onChange={(e) => setProductFilter(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {productOptions.map((product) => (
                      <option key={product.value} value={product.value}>{product.label}</option>
                    ))}
                  </select>
                </div>

                {/* Contact Filter - Only for admin */}
                {currentUser && (currentUser.role_tag === "superadmin" || currentUser.role_tag === "admin") && (
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-slate-700 mb-2">ผู้ติดต่อ</label>
                    <select
                      value={contactFilter}
                      onChange={(e) => setContactFilter(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {contactOptions.map((contact) => (
                        <option key={contact.value} value={contact.value}>{contact.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Date Filters Section */}
                <div className="mb-2">
                  <label className="block text-sm font-medium text-slate-700 mb-3">กรองตามวันที่</label>

                  <div className="space-y-4">
                    {/* วันติดตาม-ล่าสุด */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 w-24 shrink-0">ติดตาม-ล่าสุด</span>
                      <input
                        type="date"
                        value={followUpLastDate}
                        onChange={(e) => setFollowUpLastDate(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {followUpLastDate && (
                        <button onClick={() => setFollowUpLastDate("")} className="p-1 text-rose-500">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* วันติดตาม-ถัดไป */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 w-24 shrink-0">ติดตาม-ถัดไป</span>
                      <input
                        type="date"
                        value={followUpNextDate}
                        onChange={(e) => setFollowUpNextDate(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {followUpNextDate && (
                        <button onClick={() => setFollowUpNextDate("")} className="p-1 text-rose-500">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* วันที่ Consult */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 w-24 shrink-0">วัน Consult</span>
                      <input
                        type="date"
                        value={consultDate}
                        onChange={(e) => setConsultDate(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {consultDate && (
                        <button onClick={() => setConsultDate("")} className="p-1 text-rose-500">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* วันที่ผ่าตัด */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 w-24 shrink-0">วันผ่าตัด</span>
                      <input
                        type="date"
                        value={surgeryDate}
                        onChange={(e) => setSurgeryDate(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {surgeryDate && (
                        <button onClick={() => setSurgeryDate("")} className="p-1 text-rose-500">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* วันได้ชื่อ */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 w-24 shrink-0">วันได้ชื่อ</span>
                      <input
                        type="date"
                        value={getNameDate}
                        onChange={(e) => setGetNameDate(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {getNameDate && (
                        <button onClick={() => setGetNameDate("")} className="p-1 text-rose-500">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* วันได้นัด Consult */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 w-24 shrink-0">ได้นัด Consult</span>
                      <input
                        type="date"
                        value={getConsultApptDate}
                        onChange={(e) => setGetConsultApptDate(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {getConsultApptDate && (
                        <button onClick={() => setGetConsultApptDate("")} className="p-1 text-rose-500">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* วันได้นัดผ่าตัด */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 w-24 shrink-0">ได้นัดผ่าตัด</span>
                      <input
                        type="date"
                        value={getSurgeryApptDate}
                        onChange={(e) => setGetSurgeryApptDate(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {getSurgeryApptDate && (
                        <button onClick={() => setGetSurgeryApptDate("")} className="p-1 text-rose-500">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              <div className="px-4 py-4 border-t border-slate-100 bg-white">
                <button
                  onClick={() => setShowFilterSheet(false)}
                  className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
                >
                  แสดงผลลัพธ์
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Filters - Hidden on mobile */}
        <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-4">
          <div className="flex flex-wrap items-center gap-3 mb-3 filter-toolbar">
            {/* Status Filter */}
            <div className="relative">
              <button
                onClick={() => {
                  closeAllFilterMenus();
                  setShowStatusMenu(!showStatusMenu);
                }}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm font-medium border ${statusFilter !== "all"
                  ? "bg-cyan-50 border-cyan-300 text-cyan-700"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
              >
                <span>สถานะ</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showStatusMenu ? "rotate-180" : ""}`} />
              </button>
              {showStatusMenu && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-50 min-w-[200px] overflow-hidden">
                  <div className="max-h-64 overflow-y-auto">
                    {statusOptions.map((status) => (
                      <button
                        key={status.value}
                        onClick={() => {
                          setStatusFilter(status.value);
                          setShowStatusMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 transition-all text-sm ${statusFilter === status.value
                          ? "bg-cyan-50 text-cyan-700 font-medium"
                          : "text-slate-600 hover:bg-slate-50"
                          }`}
                      >
                        {statusFilter === status.value && "✓ "}
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Product Filter */}
            <div className="relative">
              <button
                onClick={() => {
                  closeAllFilterMenus();
                  setShowProductMenu(!showProductMenu);
                }}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm font-medium border ${productFilter !== "all"
                  ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
              >
                <span>สินค้า</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showProductMenu ? "rotate-180" : ""}`} />
              </button>
              {showProductMenu && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-50 min-w-[200px] overflow-hidden">
                  <div className="max-h-64 overflow-y-auto">
                    {productOptions.map((product) => (
                      <button
                        key={product.value}
                        onClick={() => {
                          setProductFilter(product.value);
                          setShowProductMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 transition-all text-sm ${productFilter === product.value
                          ? "bg-indigo-50 text-indigo-700 font-medium"
                          : "text-slate-600 hover:bg-slate-50"
                          }`}
                      >
                        {productFilter === product.value && "✓ "}
                        {product.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Contact Filter - Only for admin */}
            {currentUser && (currentUser.role_tag === "superadmin" || currentUser.role_tag === "admin") && (
              <div className="relative">
                <button
                  onClick={() => {
                    closeAllFilterMenus();
                    setShowContactMenu(!showContactMenu);
                  }}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm font-medium border ${contactFilter !== "all"
                    ? "bg-rose-50 border-rose-300 text-rose-700"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <span>ผู้ติดต่อ</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showContactMenu ? "rotate-180" : ""}`} />
                </button>
                {showContactMenu && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-50 min-w-[180px] overflow-hidden">
                    <div className="max-h-64 overflow-y-auto">
                      {contactOptions.map((contact) => (
                        <button
                          key={contact.value}
                          onClick={() => {
                            setContactFilter(contact.value);
                            setShowContactMenu(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 transition-all text-sm ${contactFilter === contact.value
                            ? "bg-rose-50 text-rose-700 font-medium"
                            : "text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                          {contactFilter === contact.value && "✓ "}
                          {contact.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Date Filters */}
            <div className="relative">
              <button
                onClick={() => {
                  closeAllFilterMenus();
                  setShowFollowUpLastMenu(!showFollowUpLastMenu);
                }}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm font-medium border ${followUpLastDate
                  ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
              >
                <span>ติดตาม-ล่าสุด</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showFollowUpLastMenu ? "rotate-180" : ""}`} />
              </button>
              {showFollowUpLastMenu && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-3 w-64">
                  <input
                    type="date"
                    value={followUpLastDate}
                    onChange={(e) => setFollowUpLastDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  />
                  {followUpLastDate && (
                    <button onClick={() => setFollowUpLastDate("")} className="mt-2 w-full px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg">
                      ล้างตัวกรอง
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  closeAllFilterMenus();
                  setShowFollowUpNextMenu(!showFollowUpNextMenu);
                }}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm font-medium border ${followUpNextDate
                  ? "bg-violet-50 border-violet-300 text-violet-700"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
              >
                <span>ติดตาม-ถัดไป</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showFollowUpNextMenu ? "rotate-180" : ""}`} />
              </button>
              {showFollowUpNextMenu && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-3 w-64">
                  <input
                    type="date"
                    value={followUpNextDate}
                    onChange={(e) => setFollowUpNextDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
                  />
                  {followUpNextDate && (
                    <button onClick={() => setFollowUpNextDate("")} className="mt-2 w-full px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg">
                      ล้างตัวกรอง
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  closeAllFilterMenus();
                  setShowConsultMenu(!showConsultMenu);
                }}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm font-medium border ${consultDate
                  ? "bg-fuchsia-50 border-fuchsia-300 text-fuchsia-700"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
              >
                <span>Consult</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showConsultMenu ? "rotate-180" : ""}`} />
              </button>
              {showConsultMenu && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-3 w-64">
                  <input
                    type="date"
                    value={consultDate}
                    onChange={(e) => setConsultDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent text-sm"
                  />
                  {consultDate && (
                    <button onClick={() => setConsultDate("")} className="mt-2 w-full px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg">
                      ล้างตัวกรอง
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  closeAllFilterMenus();
                  setShowSurgeryMenu(!showSurgeryMenu);
                }}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm font-medium border ${surgeryDate
                  ? "bg-orange-50 border-orange-300 text-orange-700"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
              >
                <span>ผ่าตัด</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showSurgeryMenu ? "rotate-180" : ""}`} />
              </button>
              {showSurgeryMenu && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-3 w-64">
                  <input
                    type="date"
                    value={surgeryDate}
                    onChange={(e) => setSurgeryDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  />
                  {surgeryDate && (
                    <button onClick={() => setSurgeryDate("")} className="mt-2 w-full px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg">
                      ล้างตัวกรอง
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  closeAllFilterMenus();
                  setShowGetNameMenu(!showGetNameMenu);
                }}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm font-medium border ${getNameDate
                  ? "bg-teal-50 border-teal-300 text-teal-700"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
              >
                <span>วันได้ชื่อ</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showGetNameMenu ? "rotate-180" : ""}`} />
              </button>
              {showGetNameMenu && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-3 w-64">
                  <input
                    type="date"
                    value={getNameDate}
                    onChange={(e) => setGetNameDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  />
                  {getNameDate && (
                    <button onClick={() => setGetNameDate("")} className="mt-2 w-full px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg">
                      ล้างตัวกรอง
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  closeAllFilterMenus();
                  setShowGetConsultApptMenu(!showGetConsultApptMenu);
                }}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm font-medium border ${getConsultApptDate
                  ? "bg-sky-50 border-sky-300 text-sky-700"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
              >
                <span>ได้นัด Consult</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showGetConsultApptMenu ? "rotate-180" : ""}`} />
              </button>
              {showGetConsultApptMenu && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-3 w-64">
                  <input
                    type="date"
                    value={getConsultApptDate}
                    onChange={(e) => setGetConsultApptDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm"
                  />
                  {getConsultApptDate && (
                    <button onClick={() => setGetConsultApptDate("")} className="mt-2 w-full px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg">
                      ล้างตัวกรอง
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  closeAllFilterMenus();
                  setShowGetSurgeryApptMenu(!showGetSurgeryApptMenu);
                }}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm font-medium border ${getSurgeryApptDate
                  ? "bg-amber-50 border-amber-300 text-amber-700"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
              >
                <span>ได้นัดผ่าตัด</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showGetSurgeryApptMenu ? "rotate-180" : ""}`} />
              </button>
              {showGetSurgeryApptMenu && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-3 w-64">
                  <input
                    type="date"
                    value={getSurgeryApptDate}
                    onChange={(e) => setGetSurgeryApptDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                  />
                  {getSurgeryApptDate && (
                    <button onClick={() => setGetSurgeryApptDate("")} className="mt-2 w-full px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg">
                      ล้างตัวกรอง
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Clear All Filters */}
            {hasActiveFilter && (
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setProductFilter("all");
                  setContactFilter("all");
                  setFollowUpLastDate("");
                  setFollowUpNextDate("");
                  setConsultDate("");
                  setSurgeryDate("");
                  setGetNameDate("");
                  setGetConsultApptDate("");
                  setGetSurgeryApptDate("");
                }}
                className="px-4 py-2 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600"
              >
                ล้างทั้งหมด
              </button>
            )}
          </div>

          {/* Results count and delete button */}
          <div className="flex justify-between items-center pt-3 border-t border-slate-100">
            <span className="text-sm text-slate-600">
              <span className="font-medium">{filteredAndSortedData.length}</span> รายการ
            </span>
            {selectedIds.length > 0 && (
              <button
                onClick={handleDeleteMultiple}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                {isDeleting ? "กำลังลบ..." : `ลบรายการที่เลือก (${selectedIds.length})`}
              </button>
            )}
          </div>
        </div>

        {/* Pagination - Only show when filter is active (mobile) */}
        {hasActiveFilter &&
          tableData.length > 0 && totalPages > 1 && (
            <div className="flex md:hidden justify-center items-center gap-1 mb-3">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm disabled:opacity-50 shadow-sm"
              >
                ←
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${page === currentPage
                        ? "bg-blue-500 text-white shadow-md"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      {page}
                    </button>
                  );
                })}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="text-slate-400">...</span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm disabled:opacity-50 shadow-sm"
              >
                →
              </button>
            </div>
          )}

        {/* Desktop Pagination - Always show */}
        {tableData.length > 0 && totalPages > 1 && (
          <div className="hidden md:flex justify-center items-center gap-1 mb-3">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm disabled:opacity-50 shadow-sm"
            >
              ←
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${page === currentPage
                      ? "bg-blue-500 text-white shadow-md"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                  >
                    {page}
                  </button>
                );
              })}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="text-slate-400">...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm disabled:opacity-50 shadow-sm"
            >
              →
            </button>
          </div>
        )}

        {/* Mobile: Show message when no filter applied */}
        {!hasActiveFilter && (
          <div className="md:hidden flex-1 flex flex-col items-center justify-center py-16">
            <Filter className="w-16 h-16 text-slate-300 mb-4" />
            {isTypingSearch ? (
              <p className="text-slate-500 text-center text-sm">
                พิมพ์อีก {3 - searchTerm.length} ตัวอักษรเพื่อค้นหา
              </p>
            ) : (
              <p className="text-slate-500 text-center text-sm">กรุณาเลือกตัวกรองหรือพิมพ์อย่างน้อย 3 ตัวอักษรเพื่อค้นหา</p>
            )}
            <button
              onClick={() => setShowFilterSheet(true)}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              เลือกตัวกรอง
            </button>
          </div>
        )}

        {/* Data Table - Desktop always shows, Mobile only when filter active */}
        {hasActiveFilter &&
          tableData.length > 0 && (
            <div className="md:hidden bg-white rounded-lg shadow-md overflow-hidden mb-4">
              {/* Horizontal scrollbar on top */}
              <div
                className="overflow-x-auto custom-scrollbar-horizontal"
                style={{
                  overflowY: "hidden",
                  height: "12px",
                }}
                onScroll={(e) => {
                  const target = e.currentTarget;
                  const tableContainer = target.nextElementSibling as HTMLElement;
                  if (tableContainer) {
                    tableContainer.scrollLeft = target.scrollLeft;
                  }
                }}
              >
                <div
                  style={{
                    width: tableData[0].headers.length * 150 + "px",
                    height: "1px",
                  }}
                />
              </div>
              <div
                className="overflow-x-auto overflow-y-auto custom-scrollbar"
                style={{
                  maxHeight: `calc(100vh + ${tableSize}px)`,
                  position: "relative",
                }}
                onScroll={(e) => {
                  const target = e.currentTarget;
                  const topScroller =
                    target.previousElementSibling as HTMLElement;
                  if (topScroller) {
                    topScroller.scrollLeft = target.scrollLeft;
                  }
                }}
              >
                <table
                  className="w-full border-collapse text-sm table-auto"
                  style={{ position: "relative", zIndex: 1 }}
                >
                  <thead className="sticky top-0 z-30 bg-yellow-300">
                    <tr className="bg-yellow-300 border border-gray-400">
                      <th className="px-3 py-2 text-center font-bold text-gray-900 border-r border-gray-400">
                        <input
                          type="checkbox"
                          checked={
                            selectedIds.length === filteredAndSortedData.length &&
                            filteredAndSortedData.length > 0
                          }
                          onChange={handleToggleSelectAll}
                          className="w-4 h-4 cursor-pointer"
                          title="เลือกทั้งหมด"
                        />
                      </th>
                      {displayHeaders.map((header, idx) => {
                        // Define gradient colors for header date columns
                        const headerGradients: Record<string, string> = {
                          วันที่ติดตามครั้งล่าสุด:
                            "bg-gradient-to-r from-emerald-300 to-emerald-400",
                          วันที่ติดตามครั้งถัดไป:
                            "bg-gradient-to-r from-emerald-300 to-emerald-400",
                          "วันที่ Consult":
                            "bg-gradient-to-r from-fuchsia-300 to-fuchsia-400",
                          วันที่ผ่าตัด:
                            "bg-gradient-to-r from-orange-300 to-orange-400",
                          เวลาที่นัด:
                            "bg-gradient-to-r from-orange-300 to-orange-400",
                          "วันที่ได้ชื่อ เบอร์":
                            "bg-gradient-to-r from-blue-300 to-blue-400",
                          "วันที่ได้นัด consult":
                            "bg-gradient-to-r from-fuchsia-300 to-fuchsia-400",
                          วันที่ได้นัดผ่าตัด:
                            "bg-gradient-to-r from-orange-300 to-orange-400",
                        };

                        const headerGradient =
                          headerGradients[header] || "bg-yellow-300";
                        const hoverClass = headerGradients[header]
                          ? "hover:opacity-90"
                          : "hover:bg-yellow-400";

                        return (
                          <th
                            key={idx}
                            onClick={() => handleSort(header)}
                            className={`px-3 py-2 text-center text-xs font-bold text-gray-900 border-r border-gray-400 whitespace-nowrap cursor-pointer ${hoverClass} transition-all ${headerGradient}`}
                            style={{ fontSize: "11px" }}
                          >
                            <div className="flex items-center justify-center gap-1">
                              <span>{header}</span>
                              {sortColumn === header &&
                                (sortDirection === "asc" ? (
                                  <ChevronUp className="w-3 h-3" />
                                ) : (
                                  <ChevronDown className="w-3 h-3" />
                                ))}
                            </div>
                          </th>
                        );
                      })}
                      {/* View More column header - only show when filter is active */}
                      {hasActiveFilter && (
                        <th className="px-3 py-2 text-center text-xs font-bold text-gray-900 border-r border-gray-400 whitespace-nowrap bg-blue-300" style={{ fontSize: "11px" }}>
                          ดูเพิ่มเติม
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      console.log(
                        "📊 Rendering tbody with",
                        paginatedData.length,
                        "rows"
                      );
                      return null;
                    })()}
                    {paginatedData.map((row, rowIndex) => {
                      const absoluteIndex =
                        (currentPage - 1) * itemsPerPage + rowIndex;
                      const patternIndex = absoluteIndex % 4;
                      const rowId = row["id"];
                      const isChecked = selectedIds.includes(rowId);
                      // Pattern: white (0) → pink (1) → white (2) → purple-light (3)
                      let bgColor = "bg-white";
                      if (patternIndex === 1) {
                        bgColor = "bg-pink-200";
                      } else if (patternIndex === 3) {
                        bgColor = "bg-purple-200";
                      }

                      if (isChecked) {
                        bgColor = "bg-blue-100";
                      }

                      return (
                        <tr
                          key={rowIndex}
                          onClick={() => {
                            setEditingCustomer(row);
                            setIsEditModalOpen(true);
                          }}
                          className={`border border-gray-300 transition-all duration-200 group ${bgColor} hover:bg-blue-50 cursor-pointer`}
                        >
                          <td
                            className="px-3 py-2 border-r border-gray-300 text-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleSelect(rowId)}
                              className="w-4 h-4 cursor-pointer"
                            />
                          </td>
                          {displayHeaders.map((header, colIdx) => {
                            const value = row[header];
                            const hasValue =
                              value !== undefined &&
                              value !== null &&
                              value !== "";
                            const displayValue = formatDateValue(value);
                            const isNotesColumn = header === "หมายเหตุ";

                            // Define gradient colors for specific date columns
                            const dateColumns: Record<string, string> = {
                              วันที่ติดตามครั้งล่าสุด:
                                "bg-gradient-to-r from-emerald-100 to-emerald-200",
                              วันที่ติดตามครั้งถัดไป:
                                "bg-gradient-to-r from-emerald-100 to-emerald-200",
                              "วันที่ Consult":
                                "bg-gradient-to-r from-fuchsia-100 to-fuchsia-200",
                              วันที่ผ่าตัด:
                                "bg-gradient-to-r from-orange-100 to-orange-200",
                              เวลาที่นัด:
                                "bg-gradient-to-r from-orange-100 to-orange-200",
                              "วันที่ได้ชื่อ เบอร์":
                                "bg-gradient-to-r from-blue-100 to-blue-200",
                              "วันที่ได้นัด consult":
                                "bg-gradient-to-r from-fuchsia-100 to-fuchsia-200",
                              วันที่ได้นัดผ่าตัด:
                                "bg-gradient-to-r from-orange-100 to-orange-200",
                            };

                            const gradientClass = dateColumns[header] || "";
                            const isDateColumn = !!dateColumns[header];

                            return (
                              <td
                                key={colIdx}
                                className={`px-3 py-2 text-xs text-gray-900 border-r border-gray-300 text-center align-middle ${isNotesColumn ? "" : "whitespace-nowrap"
                                  } ${gradientClass}`}
                                style={{
                                  fontSize: "11px",
                                  minWidth: isNotesColumn
                                    ? "450px"
                                    : isDateColumn
                                      ? "80px"
                                      : undefined,
                                  maxWidth: isNotesColumn
                                    ? "450px"
                                    : isDateColumn
                                      ? "80px"
                                      : undefined,
                                }}
                              >
                                {hasValue ? (
                                  <span
                                    className={
                                      isNotesColumn
                                        ? "block text-left whitespace-pre-wrap break-words"
                                        : "block"
                                    }
                                  >
                                    {displayValue}
                                  </span>
                                ) : (
                                  <span className="text-gray-400 block">-</span>
                                )}
                              </td>
                            );
                          })}
                          {/* View More button - only show when filter is active */}
                          {hasActiveFilter && (
                            <td
                              className="px-3 py-2 text-center border-r border-gray-300"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => {
                                  setEditingCustomer(row);
                                  setIsEditModalOpen(true);
                                }}
                                className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                              >
                                ดูเพิ่มเติม
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        {/* Desktop: Show message when no filter applied */}
        {!hasActiveFilter && tableData.length > 0 && (
          <div className="hidden md:flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-sm border border-slate-200">
            <Filter className="w-16 h-16 text-slate-300 mb-4" />
            {isTypingSearch ? (
              <p className="text-slate-500 text-center text-sm">
                พิมพ์อีก {3 - searchTerm.length} ตัวอักษรเพื่อค้นหา
              </p>
            ) : (
              <p className="text-slate-500 text-center text-sm">กรุณาเลือกตัวกรองหรือพิมพ์อย่างน้อย 3 ตัวอักษรเพื่อค้นหา</p>
            )}
          </div>
        )}

        {/* Desktop Data Table - Only visible when filter is active */}
        {hasActiveFilter && tableData.length > 0 && (
          <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden mb-4">
            {/* Horizontal scrollbar on top */}
            <div
              className="overflow-x-auto custom-scrollbar-horizontal"
              style={{
                overflowY: "hidden",
                height: "12px",
              }}
              onScroll={(e) => {
                const target = e.currentTarget;
                const tableContainer = target.nextElementSibling as HTMLElement;
                if (tableContainer) {
                  tableContainer.scrollLeft = target.scrollLeft;
                }
              }}
            >
              <div
                style={{
                  width: tableData[0].headers.length * 150 + "px",
                  height: "1px",
                }}
              />
            </div>
            <div
              className="overflow-x-auto overflow-y-auto custom-scrollbar"
              style={{
                maxHeight: `calc(100vh + ${tableSize}px)`,
                position: "relative",
              }}
              onScroll={(e) => {
                const target = e.currentTarget;
                const topScroller = target.previousElementSibling as HTMLElement;
                if (topScroller) {
                  topScroller.scrollLeft = target.scrollLeft;
                }
              }}
            >
              <table
                className="w-full border-collapse text-sm table-auto"
                style={{ position: "relative", zIndex: 1 }}
              >
                <thead className="sticky top-0 z-30 bg-yellow-300">
                  <tr className="bg-yellow-300 border border-gray-400">
                    <th className="px-3 py-2 text-center font-bold text-gray-900 border-r border-gray-400">
                      <input
                        type="checkbox"
                        checked={
                          selectedIds.length === filteredAndSortedData.length &&
                          filteredAndSortedData.length > 0
                        }
                        onChange={handleToggleSelectAll}
                        className="w-4 h-4 cursor-pointer"
                        title="เลือกทั้งหมด"
                      />
                    </th>
                    {displayHeaders.map((header, idx) => (
                      <th
                        key={idx}
                        className="px-3 py-2 text-center font-bold text-gray-900 whitespace-nowrap border-r border-gray-400"
                      >
                        {header}
                      </th>
                    ))}
                    {/* View More column header */}
                    <th className="px-3 py-2 text-center font-bold text-gray-900 whitespace-nowrap border-r border-gray-400 bg-blue-300">
                      ดูเพิ่มเติม
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((row, rowIdx) => {
                    const rowId = row["ไอดี"] || row["id"] || rowIdx;
                    const isSelected = selectedIds.includes(rowId);
                    return (
                      <tr
                        key={rowIdx}
                        className={`border-b border-gray-200 ${isSelected ? "bg-blue-50" : rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } hover:bg-blue-100 transition-colors`}
                      >
                        <td
                          className="px-3 py-2 text-center border-r border-gray-200"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(rowId)}
                            className="w-4 h-4 cursor-pointer"
                          />
                        </td>
                        {displayHeaders.map((header, colIdx) => {
                          const value = row[header];
                          const hasValue = value !== undefined && value !== null && value !== "";
                          const displayValue = hasValue ? String(value) : "-";
                          return (
                            <td
                              key={colIdx}
                              className="px-3 py-2 text-center border-r border-gray-200 whitespace-nowrap"
                              style={{ fontSize: "11px" }}
                            >
                              {hasValue ? displayValue : <span className="text-gray-400">-</span>}
                            </td>
                          );
                        })}
                        {/* View More button */}
                        <td className="px-3 py-2 text-center border-r border-gray-200">
                          <button
                            onClick={() => {
                              setEditingCustomer(row);
                              setIsEditModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            ดูเพิ่มเติม
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <EditCustomerModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        customerData={editingCustomer || {}}
        onSave={handleSaveCustomer}
      />
      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          fetchData();
        }}
      />
    </>
  );
};

// Wrapper component with Suspense for useSearchParams
export default function CustomerAllDataPageWrapper() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-slate-500">กำลังโหลด...</div>
      </div>
    }>
      <CustomerAllDataPage />
    </Suspense>
  );
}
