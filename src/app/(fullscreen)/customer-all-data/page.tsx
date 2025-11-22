"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  RefreshCw,
  Download,
  ChevronUp,
  ChevronDown,
  Filter,
  X,
  Plus,
} from "lucide-react";
import { EditCustomerModal } from "@/components/EditCustomerModal";
import { AddCustomerModal } from "@/components/AddCustomerModal";
import UserMenu from "@/components/UserMenu";
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
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterColumn, setFilterColumn] = useState<string>("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [productFilter, setProductFilter] = useState<string>("all");
  const [showProductMenu, setShowProductMenu] = useState(false);
  const [contactFilter, setContactFilter] = useState<string>("all");
  const [showContactMenu, setShowContactMenu] = useState(false);
  const [showFollowUpLastMenu, setShowFollowUpLastMenu] = useState(false);
  const [followUpLastStart, setFollowUpLastStart] = useState<string>("");
  const [followUpLastEnd, setFollowUpLastEnd] = useState<string>("");
  const [showFollowUpNextMenu, setShowFollowUpNextMenu] = useState(false);
  const [followUpNextStart, setFollowUpNextStart] = useState<string>("");
  const [followUpNextEnd, setFollowUpNextEnd] = useState<string>("");
  const [showConsultMenu, setShowConsultMenu] = useState(false);
  const [consultStart, setConsultStart] = useState<string>("");
  const [consultEnd, setConsultEnd] = useState<string>("");
  const [showSurgeryMenu, setShowSurgeryMenu] = useState(false);
  const [surgeryStart, setSurgeryStart] = useState<string>("");
  const [surgeryEnd, setSurgeryEnd] = useState<string>("");
  const [showGetNameMenu, setShowGetNameMenu] = useState(false);
  const [getNameStart, setGetNameStart] = useState<string>("");
  const [getNameEnd, setGetNameEnd] = useState<string>("");
  const [showGetConsultApptMenu, setShowGetConsultApptMenu] = useState(false);
  const [getConsultApptStart, setGetConsultApptStart] = useState<string>("");
  const [getConsultApptEnd, setGetConsultApptEnd] = useState<string>("");
  const [showGetSurgeryApptMenu, setShowGetSurgeryApptMenu] = useState(false);
  const [getSurgeryApptStart, setGetSurgeryApptStart] = useState<string>("");
  const [getSurgeryApptEnd, setGetSurgeryApptEnd] = useState<string>("");
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
  const [statusOptions, setStatusOptions] = useState<
    Array<{ value: string; label: string; color: string }>
  >([]);
  const [tableSizeOptions, setTableSizeOptions] = useState<TableSizeOption[]>(
    []
  );
  const [showTableSizeMenu, setShowTableSizeMenu] = useState(false);
  const [tableSize, setTableSize] = useState<number>(500);
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
      // เอา 'id' ออกจาก headers เพราะไม่ต้องแสดงในตาราง
      const headers = result.columns.filter((col: string) => col !== "id");
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
          "สถานะ",
          "แหล่งที่มา",
          "ผลิตภัณฑ์ที่สนใจ",
          "หมอ",
          "ผู้ติดต่อ",
          "ชื่อ",
          "เบอร์โทร",
          "หมายเหตุ",
          "วันที่ติดตามครั้งล่าสุด",
          "วันที่ติดตามครั้งถัดไป",
          "วันที่ Consult",
          "วันที่ผ่าตัด",
          "เวลาที่นัด",
          "วันที่ได้ชื่อ เบอร์",
          "วันที่ได้นัด consult",
          "วันที่ได้นัดผ่าตัด",
          "ยอดนำเสนอ",
          "รหัสลูกค้า",
          "ติดดาว",
          "ประเทศ",
          "เวลาให้เรียกรถ",
          "Lat",
          "Long",
        ];
        const allHeadersSet = new Set<string>();
        const allHeaders: string[] = [];
        // First add headers in the desired order
        columnOrder.forEach((header) => {
          sanitizedTables.forEach((table) => {
            if (table.headers.includes(header) && !allHeadersSet.has(header)) {
              allHeadersSet.add(header);
              allHeaders.push(header);
            }
          });
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
        // Keep all rows that have at least one value in any header
        const filteredData = allData.filter((row) => {
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
  const filteredAndSortedData = useMemo(() => {
    if (tableData.length === 0) return [];
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
    const filterByDateRange = (
      columnName: string,
      startDate: string,
      endDate: string
    ) => {
      if (!startDate && !endDate) return;
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
          const start = startDate ? new Date(startDate) : null;
          const end = endDate ? new Date(endDate) : null;
          if (start && end) {
            return rowDate >= start && rowDate <= end;
          } else if (start) {
            return rowDate >= start;
          } else if (end) {
            return rowDate <= end;
          }
          return true;
        });
      }
    };
    filterByDateRange(
      "วันที่ติดตามครั้งล่าสุด",
      followUpLastStart,
      followUpLastEnd
    );
    filterByDateRange(
      "วันที่ติดตามครั้งถัดไป",
      followUpNextStart,
      followUpNextEnd
    );
    filterByDateRange("วันที่ Consult", consultStart, consultEnd);
    filterByDateRange("วันที่ผ่าตัด", surgeryStart, surgeryEnd);
    filterByDateRange("วันที่ได้ชื่อ เบอร์", getNameStart, getNameEnd);
    filterByDateRange(
      "วันที่ได้นัด Consult",
      getConsultApptStart,
      getConsultApptEnd
    );
    filterByDateRange(
      "วันที่ได้นัดผ่าตัด",
      getSurgeryApptStart,
      getSurgeryApptEnd
    );
    if (searchTerm) {
      filtered = filtered.filter((row) => {
        if (filterColumn === "all") {
          return tableData[0].headers.some((header) => {
            const value = row[header];
            return (
              value &&
              String(value).toLowerCase().includes(searchTerm.toLowerCase())
            );
          });
        } else {
          const value = row[filterColumn];
          return (
            value &&
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
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
    searchTerm,
    filterColumn,
    sortColumn,
    sortDirection,
    statusFilter,
    productFilter,
    contactFilter,
    followUpLastStart,
    currentUser,
    followUpLastEnd,
    followUpNextStart,
    followUpNextEnd,
    consultStart,
    consultEnd,
    surgeryStart,
    surgeryEnd,
    getNameStart,
    getNameEnd,
    getConsultApptStart,
    getConsultApptEnd,
    getSurgeryApptStart,
    getSurgeryApptEnd,
  ]);
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
    followUpLastStart,
    followUpLastEnd,
    followUpNextStart,
    followUpNextEnd,
    consultStart,
    consultEnd,
    surgeryStart,
    surgeryEnd,
    getNameStart,
    getNameEnd,
    getConsultApptStart,
    getConsultApptEnd,
    getSurgeryApptStart,
    getSurgeryApptEnd,
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
      <div className="w-full min-h-screen bg-gray-50 p-4 flex flex-col">
        {/* Header with User Menu */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              ข้อมูลลูกค้าทั้งหมด
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {currentUser &&
              currentUser.role_tag !== "superadmin" &&
              currentUser.role_tag !== "admin"
                ? `แสดงข้อมูลของ: ${currentUser.name}`
                : "แสดงข้อมูลทั้งหมด"}
            </p>
          </div>
          <UserMenu />
        </div>
        {/* Control Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="ค้นหา..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* Filter Column */}
            <div className="relative group">
              <button
                onClick={() => {
                  closeAllFilterMenus();
                  setShowFilterMenu(!showFilterMenu);
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-lg flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
              >
                <Filter className="w-4 h-4" />
                <span>
                  {filterColumn === "all" ? "ค้นหาทั้งหมด" : filterColumn}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    showFilterMenu ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </button>
              {showFilterMenu && (
                <div className="absolute top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-[240px] overflow-hidden">
                  <div className="max-h-64 overflow-y-auto">
                    <button
                      onClick={() => {
                        setFilterColumn("all");
                        setShowFilterMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-teal-50 transition-colors border-b border-gray-100 font-medium text-gray-900 text-sm"
                    >
                      ✓ ทั้งหมด
                    </button>
                    {tableData[0]?.headers.map((header) => (
                      <button
                        key={header}
                        onClick={() => {
                          setFilterColumn(header);
                          setShowFilterMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-teal-50 transition-colors border-b border-gray-100 text-gray-700 text-sm hover:text-teal-700"
                      >
                        {header}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Status Filter */}
            <div className="relative group">
              <button
                onClick={() => {
                  closeAllFilterMenus();
                  setShowStatusMenu(!showStatusMenu);
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white rounded-lg flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
              >
                <span>
                  สถานะ{" "}
                  {statusFilter !== "all" &&
                    `(${statusFilter.substring(0, 8)}...)`}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    showStatusMenu ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </button>
              {showStatusMenu && (
                <div className="absolute top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-[280px] overflow-hidden">
                  <div className="max-h-72 overflow-y-auto">
                    {statusOptions.map((status) => (
                      <button
                        key={status.value}
                        onClick={() => {
                          setStatusFilter(status.value);
                          setShowStatusMenu(false);
                        }}
                        className={`w-full text-left px-4 py-3 transition-all border-b border-gray-100 text-sm font-medium ${
                          statusFilter === status.value
                            ? `${status.color} shadow-sm`
                            : `bg-white text-gray-700 hover:${status.color}`
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
            <div className="relative group">
              <button
                onClick={() => {
                  closeAllFilterMenus();
                  setShowProductMenu(!showProductMenu);
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-lg flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
              >
                <span>
                  สินค้า{" "}
                  {productFilter !== "all" &&
                    `(${productFilter.substring(0, 8)}...)`}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    showProductMenu ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </button>
              {showProductMenu && (
                <div className="absolute top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-[240px] overflow-hidden">
                  <div className="max-h-64 overflow-y-auto">
                    {productOptions.map((product) => (
                      <button
                        key={product.value}
                        onClick={() => {
                          setProductFilter(product.value);
                          setShowProductMenu(false);
                        }}
                        className={`w-full text-left px-4 py-3 transition-colors border-b border-gray-100 text-sm font-medium ${
                          productFilter === product.value
                            ? "bg-indigo-50 text-indigo-700"
                            : "bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
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
            {/* Contact Filter - Only show for superadmin and admin */}
            {currentUser &&
              (currentUser.role_tag === "superadmin" ||
                currentUser.role_tag === "admin") && (
                <div className="relative group">
                  <button
                    onClick={() => {
                      closeAllFilterMenus();
                      setShowContactMenu(!showContactMenu);
                    }}
                    className="px-4 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-lg flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                  >
                    <span>
                      ผู้ติดต่อ{" "}
                      {contactFilter !== "all" && `(${contactFilter})`}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        showContactMenu ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </button>
                  {showContactMenu && (
                    <div className="absolute top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-[180px] overflow-hidden">
                      <div className="max-h-64 overflow-y-auto">
                        {contactOptions.map((contact) => (
                          <button
                            key={contact.value}
                            onClick={() => {
                              setContactFilter(contact.value);
                              setShowContactMenu(false);
                            }}
                            className={`w-full text-left px-4 py-3 transition-colors border-b border-gray-100 text-sm font-medium ${
                              contactFilter === contact.value
                                ? "bg-rose-50 text-rose-700"
                                : "bg-white text-gray-700 hover:bg-rose-50 hover:text-rose-700"
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
            {/* Date Filter 1: Follow Up Last */}
            <div className="relative group">
              <button
                onClick={() => {
                  closeAllFilterMenus();
                  setShowFollowUpLastMenu(!showFollowUpLastMenu);
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
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
                    d="M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>วันติดตาม-ล่าสุด</span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    showFollowUpLastMenu ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </button>
              {showFollowUpLastMenu && (
                <div className="absolute top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4 w-72">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2">
                        วันที่เริ่มต้น
                      </label>
                      <input
                        type="date"
                        value={followUpLastStart}
                        onChange={(e) => setFollowUpLastStart(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2">
                        วันที่สิ้นสุด
                      </label>
                      <input
                        type="date"
                        value={followUpLastEnd}
                        onChange={(e) => setFollowUpLastEnd(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Date Filter 2: Follow Up Next */}
            <div className="relative group">
              <button
                onClick={() => {
                  closeAllFilterMenus();
                  setShowFollowUpNextMenu(!showFollowUpNextMenu);
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white rounded-lg flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
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
                    d="M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>วันติดตาม-ถัดไป</span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    showFollowUpNextMenu ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </button>
              {showFollowUpNextMenu && (
                <div className="absolute top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4 w-72">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2">
                        วันที่เริ่มต้น
                      </label>
                      <input
                        type="date"
                        value={followUpNextStart}
                        onChange={(e) => setFollowUpNextStart(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200 text-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2">
                        วันที่สิ้นสุด
                      </label>
                      <input
                        type="date"
                        value={followUpNextEnd}
                        onChange={(e) => setFollowUpNextEnd(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200 text-sm transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Date Filter 3: Consult */}
            <div className="relative group">
              <button
                onClick={() => {
                  closeAllFilterMenus();
                  setShowConsultMenu(!showConsultMenu);
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-fuchsia-500 to-fuchsia-600 hover:from-fuchsia-600 hover:to-fuchsia-700 text-white rounded-lg flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
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
                    d="M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>วันที่ Consult</span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    showConsultMenu ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </button>
              {showConsultMenu && (
                <div className="absolute top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4 w-72">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2">
                        วันที่เริ่มต้น
                      </label>
                      <input
                        type="date"
                        value={consultStart}
                        onChange={(e) => setConsultStart(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 text-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2">
                        วันที่สิ้นสุด
                      </label>
                      <input
                        type="date"
                        value={consultEnd}
                        onChange={(e) => setConsultEnd(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 text-sm transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Date Filter 4: Surgery */}
            <div className="relative group">
              <button
                onClick={() => {
                  closeAllFilterMenus();
                  setShowSurgeryMenu(!showSurgeryMenu);
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
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
                    d="M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>วันที่ผ่าตัด</span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    showSurgeryMenu ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </button>
              {showSurgeryMenu && (
                <div className="absolute top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4 w-72">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2">
                        วันที่เริ่มต้น
                      </label>
                      <input
                        type="date"
                        value={surgeryStart}
                        onChange={(e) => setSurgeryStart(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2">
                        วันที่สิ้นสุด
                      </label>
                      <input
                        type="date"
                        value={surgeryEnd}
                        onChange={(e) => setSurgeryEnd(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-sm transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Date Filter 5: Get Name */}
            <div className="relative group">
              <button
                onClick={() => {
                  closeAllFilterMenus();
                  setShowGetNameMenu(!showGetNameMenu);
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
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
                    d="M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>วันได้ชื่อ</span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    showGetNameMenu ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </button>
              {showGetNameMenu && (
                <div className="absolute top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4 w-72">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2">
                        วันที่เริ่มต้น
                      </label>
                      <input
                        type="date"
                        value={getNameStart}
                        onChange={(e) => setGetNameStart(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2">
                        วันที่สิ้นสุด
                      </label>
                      <input
                        type="date"
                        value={getNameEnd}
                        onChange={(e) => setGetNameEnd(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Date Filter 6: Get Consult Appt */}
            <div className="relative group">
              <button
                onClick={() => {
                  closeAllFilterMenus();
                  setShowGetConsultApptMenu(!showGetConsultApptMenu);
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
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
                    d="M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>วันได้นัด Consult</span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    showGetConsultApptMenu ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </button>
              {showGetConsultApptMenu && (
                <div className="absolute top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4 w-72">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2">
                        วันที่เริ่มต้น
                      </label>
                      <input
                        type="date"
                        value={getConsultApptStart}
                        onChange={(e) => setGetConsultApptStart(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2">
                        วันที่สิ้นสุด
                      </label>
                      <input
                        type="date"
                        value={getConsultApptEnd}
                        onChange={(e) => setGetConsultApptEnd(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-sm transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Date Filter 7: Get Surgery Appt */}
            <div className="relative group">
              <button
                onClick={() => {
                  closeAllFilterMenus();
                  setShowGetSurgeryApptMenu(!showGetSurgeryApptMenu);
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white rounded-lg flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
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
                    d="M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>วันได้นัด ผ่าตัด</span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    showGetSurgeryApptMenu ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </button>
              {showGetSurgeryApptMenu && (
                <div className="absolute top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4 w-72">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2">
                        วันที่เริ่มต้น
                      </label>
                      <input
                        type="date"
                        value={getSurgeryApptStart}
                        onChange={(e) => setGetSurgeryApptStart(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2">
                        วันที่สิ้นสุด
                      </label>
                      <input
                        type="date"
                        value={getSurgeryApptEnd}
                        onChange={(e) => setGetSurgeryApptEnd(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-sm transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Pagination */}
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="500">500 แถว</option>
              <option value="2000">2000 แถว</option>
              <option value="3000">3000 แถว</option>
            </select>
            {/* Table Size */}
            <div className="relative group">
              <button
                onClick={() => {
                  closeAllFilterMenus();
                  setShowTableSizeMenu(!showTableSizeMenu);
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
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
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                </svg>
                <span>ขยายตาราง ({tableSize}px)</span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    showTableSizeMenu ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </button>
              {showTableSizeMenu && tableSizeOptions.length > 0 && (
                <div className="absolute top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-[180px] overflow-hidden">
                  <div className="max-h-64 overflow-y-auto">
                    {tableSizeOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => {
                          setTableSize(option.size_value);
                          setShowTableSizeMenu(false);
                        }}
                        className={`w-full text-left px-4 py-3 transition-colors border-b border-gray-100 text-sm font-medium ${
                          tableSize === option.size_value
                            ? "bg-amber-50 text-amber-700"
                            : "bg-white text-gray-700 hover:bg-amber-50 hover:text-amber-700"
                        }`}
                      >
                        {tableSize === option.size_value && "✓ "}
                        {option.size_label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium"
            >
              <Plus className="w-4 h-4" />
              เพิ่มข้อมูล
            </button>

            <button
              onClick={fetchData}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
              รีเฟรช
            </button>
            {/* Export */}
            <div className="flex gap-2">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Excel
              </button>
            </div>
          </div>
          {/* Active Filters Display */}
          {tableData.length > 0 && (
            <div className="mt-4 space-y-2">
              {/* Active Filters Tags */}
              {(searchTerm ||
                statusFilter !== "all" ||
                productFilter !== "all" ||
                contactFilter !== "all" ||
                followUpLastStart ||
                followUpLastEnd ||
                followUpNextStart ||
                followUpNextEnd ||
                consultStart ||
                consultEnd ||
                surgeryStart ||
                surgeryEnd ||
                getNameStart ||
                getNameEnd ||
                getConsultApptStart ||
                getConsultApptEnd ||
                getSurgeryApptStart ||
                getSurgeryApptEnd) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                      />
                    </svg>
                    <span className="text-sm font-semibold text-blue-900">
                      ฟิลเตอร์ที่ใช้งานอยู่:
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {searchTerm && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-teal-300 rounded-full text-xs font-medium text-teal-700 shadow-sm">
                        <span className="font-semibold">ค้นหา:</span>
                        <span className="max-w-[200px] truncate">
                          &quot;{searchTerm}&quot;
                        </span>
                        <button
                          onClick={() => setSearchTerm("")}
                          className="ml-1 hover:bg-teal-100 rounded-full p-0.5 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    {statusFilter !== "all" && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-cyan-300 rounded-full text-xs font-medium text-cyan-700 shadow-sm">
                        <span className="font-semibold">สถานะ:</span>
                        <span className="max-w-[150px] truncate">
                          {statusFilter}
                        </span>
                        <button
                          onClick={() => setStatusFilter("all")}
                          className="ml-1 hover:bg-cyan-100 rounded-full p-0.5 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    {productFilter !== "all" && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-indigo-300 rounded-full text-xs font-medium text-indigo-700 shadow-sm">
                        <span className="font-semibold">สินค้า:</span>
                        <span className="max-w-[150px] truncate">
                          {productFilter}
                        </span>
                        <button
                          onClick={() => setProductFilter("all")}
                          className="ml-1 hover:bg-indigo-100 rounded-full p-0.5 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    {contactFilter !== "all" && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-rose-300 rounded-full text-xs font-medium text-rose-700 shadow-sm">
                        <span className="font-semibold">ผู้ติดต่อ:</span>
                        <span>{contactFilter}</span>
                        <button
                          onClick={() => setContactFilter("all")}
                          className="ml-1 hover:bg-rose-100 rounded-full p-0.5 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    {(followUpLastStart || followUpLastEnd) && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-emerald-300 rounded-full text-xs font-medium text-emerald-700 shadow-sm">
                        <span className="font-semibold">วันติดตาม-ล่าสุด:</span>
                        <span>
                          {followUpLastStart || "..."} -{" "}
                          {followUpLastEnd || "..."}
                        </span>
                        <button
                          onClick={() => {
                            setFollowUpLastStart("");
                            setFollowUpLastEnd("");
                          }}
                          className="ml-1 hover:bg-emerald-100 rounded-full p-0.5 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    {(followUpNextStart || followUpNextEnd) && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-violet-300 rounded-full text-xs font-medium text-violet-700 shadow-sm">
                        <span className="font-semibold">วันติดตาม-ถัดไป:</span>
                        <span>
                          {followUpNextStart || "..."} -{" "}
                          {followUpNextEnd || "..."}
                        </span>
                        <button
                          onClick={() => {
                            setFollowUpNextStart("");
                            setFollowUpNextEnd("");
                          }}
                          className="ml-1 hover:bg-violet-100 rounded-full p-0.5 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    {(consultStart || consultEnd) && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-fuchsia-300 rounded-full text-xs font-medium text-fuchsia-700 shadow-sm">
                        <span className="font-semibold">วันที่ Consult:</span>
                        <span>
                          {consultStart || "..."} - {consultEnd || "..."}
                        </span>
                        <button
                          onClick={() => {
                            setConsultStart("");
                            setConsultEnd("");
                          }}
                          className="ml-1 hover:bg-fuchsia-100 rounded-full p-0.5 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    {(surgeryStart || surgeryEnd) && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-orange-300 rounded-full text-xs font-medium text-orange-700 shadow-sm">
                        <span className="font-semibold">วันที่ผ่าตัด:</span>
                        <span>
                          {surgeryStart || "..."} - {surgeryEnd || "..."}
                        </span>
                        <button
                          onClick={() => {
                            setSurgeryStart("");
                            setSurgeryEnd("");
                          }}
                          className="ml-1 hover:bg-orange-100 rounded-full p-0.5 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    {(getNameStart || getNameEnd) && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-blue-300 rounded-full text-xs font-medium text-blue-700 shadow-sm">
                        <span className="font-semibold">วันได้ชื่อ:</span>
                        <span>
                          {getNameStart || "..."} - {getNameEnd || "..."}
                        </span>
                        <button
                          onClick={() => {
                            setGetNameStart("");
                            setGetNameEnd("");
                          }}
                          className="ml-1 hover:bg-blue-100 rounded-full p-0.5 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    {(getConsultApptStart || getConsultApptEnd) && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-purple-300 rounded-full text-xs font-medium text-purple-700 shadow-sm">
                        <span className="font-semibold">
                          วันได้นัด Consult:
                        </span>
                        <span>
                          {getConsultApptStart || "..."} -{" "}
                          {getConsultApptEnd || "..."}
                        </span>
                        <button
                          onClick={() => {
                            setGetConsultApptStart("");
                            setGetConsultApptEnd("");
                          }}
                          className="ml-1 hover:bg-purple-100 rounded-full p-0.5 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    {(getSurgeryApptStart || getSurgeryApptEnd) && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-pink-300 rounded-full text-xs font-medium text-pink-700 shadow-sm">
                        <span className="font-semibold">วันได้นัด ผ่าตัด:</span>
                        <span>
                          {getSurgeryApptStart || "..."} -{" "}
                          {getSurgeryApptEnd || "..."}
                        </span>
                        <button
                          onClick={() => {
                            setGetSurgeryApptStart("");
                            setGetSurgeryApptEnd("");
                          }}
                          className="ml-1 hover:bg-pink-100 rounded-full p-0.5 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    {/* Clear All Button */}
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("all");
                        setProductFilter("all");
                        setContactFilter("all");
                        setFollowUpLastStart("");
                        setFollowUpLastEnd("");
                        setFollowUpNextStart("");
                        setFollowUpNextEnd("");
                        setConsultStart("");
                        setConsultEnd("");
                        setSurgeryStart("");
                        setSurgeryEnd("");
                        setGetNameStart("");
                        setGetNameEnd("");
                        setGetConsultApptStart("");
                        setGetConsultApptEnd("");
                        setGetSurgeryApptStart("");
                        setGetSurgeryApptEnd("");
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs font-medium shadow-sm transition-colors"
                    >
                      <X className="w-3 h-3" />
                      <span>ล้างทั้งหมด</span>
                    </button>
                  </div>
                </div>
              )}
              {/* Results Info */}
              <div className="text-sm text-gray-600">
                แสดง {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(
                  currentPage * itemsPerPage,
                  filteredAndSortedData.length
                )}{" "}
                จาก {filteredAndSortedData.length} รายการ
                {(searchTerm ||
                  statusFilter !== "all" ||
                  productFilter !== "all" ||
                  contactFilter !== "all" ||
                  followUpLastStart ||
                  followUpLastEnd ||
                  followUpNextStart ||
                  followUpNextEnd ||
                  consultStart ||
                  consultEnd ||
                  surgeryStart ||
                  surgeryEnd ||
                  getNameStart ||
                  getNameEnd ||
                  getConsultApptStart ||
                  getConsultApptEnd ||
                  getSurgeryApptStart ||
                  getSurgeryApptEnd) &&
                  ` (กรองจาก ${tableData[0].data.length} รายการทั้งหมด)`}
              </div>
            </div>
          )}
          {/* Pagination Controls */}
          {tableData.length > 0 && totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              {/* First Page */}
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="หน้าแรก"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                  />
                </svg>
              </button>
              {/* Previous Page */}
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                ← ก่อนหน้า
              </button>
              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {/* Show first page if not near it */}
                {currentPage > 3 && (
                  <>
                    <button
                      onClick={() => setCurrentPage(1)}
                      className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      1
                    </button>
                    {currentPage > 4 && (
                      <span className="px-2 text-gray-500">...</span>
                    )}
                  </>
                )}
                {/* Pages around current page */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    return (
                      page === currentPage ||
                      page === currentPage - 1 ||
                      page === currentPage + 1 ||
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    );
                  })
                  .map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg transition-all font-medium ${
                        page === currentPage
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-white border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                {/* Show last page if not near it */}
                {currentPage < totalPages - 2 && (
                  <>
                    {currentPage < totalPages - 3 && (
                      <span className="px-2 text-gray-500">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
              {/* Next Page */}
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                ถัดไป →
              </button>
              {/* Last Page */}
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="หน้าสุดท้าย"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 5l7 7-7 7M5 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
        {tableData.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
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
              style={{ maxHeight: `calc(100vh + ${tableSize}px)` }}
              onScroll={(e) => {
                const target = e.currentTarget;
                const topScroller =
                  target.previousElementSibling as HTMLElement;
                if (topScroller) {
                  topScroller.scrollLeft = target.scrollLeft;
                }
              }}
            >
              <table className="w-full border-collapse text-sm table-auto">
                <thead className="sticky top-0 z-30 bg-yellow-300">
                  <tr className="bg-yellow-300 border border-gray-400">
                    {tableData[0].headers.map((header, idx) => (
                      <th
                        key={idx}
                        onClick={() => handleSort(header)}
                        className="px-3 py-2 text-center text-xs font-bold text-gray-900 border-r border-gray-400 whitespace-nowrap cursor-pointer hover:bg-yellow-400 transition-colors"
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
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((row, rowIndex) => {
                    const absoluteIndex =
                      (currentPage - 1) * itemsPerPage + rowIndex;
                    const patternIndex = absoluteIndex % 4;
                    const isSelected = selectedRow === row;
                    // Pattern: white (0) → pink (1) → white (2) → purple-light (3)
                    let bgColor = "bg-white";
                    if (patternIndex === 1) {
                      bgColor = "bg-pink-200";
                    } else if (patternIndex === 3) {
                      bgColor = "bg-purple-200";
                    }
                    return (
                      <tr
                        key={rowIndex}
                        onClick={() => handleEditCustomer(row)}
                        className={`border border-gray-300 transition-all duration-200 cursor-pointer group ${
                          isSelected
                            ? "ring-4 ring-indigo-500 shadow-lg"
                            : bgColor
                        }`}
                        style={{
                          background: isSelected
                            ? "linear-gradient(to right, #dbeafe, #e0e7ff)"
                            : undefined,
                          boxShadow: isSelected
                            ? "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
                            : undefined,
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.background =
                              "linear-gradient(to right, #dbeafe, #e0e7ff)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.background = "";
                            e.currentTarget.style.boxShadow = "";
                          }
                        }}
                      >
                        {tableData[0].headers.map((header, colIdx) => {
                          const value = row[header];
                          const hasValue =
                            value !== undefined &&
                            value !== null &&
                            value !== "";
                          return (
                            <td
                              key={colIdx}
                              className="px-3 py-2 text-xs text-gray-900 border-r border-gray-300 text-center align-middle"
                              style={{ fontSize: "11px" }}
                            >
                              {hasValue ? (
                                <span className="block">{String(value)}</span>
                              ) : (
                                <span className="text-gray-400 block">-</span>
                              )}
                            </td>
                          );
                        })}
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
        onSave={handleAddCustomer}
      />
    </>
  );
};
export default CustomerAllDataPage;
