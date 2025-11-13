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
} from "lucide-react";
import { EditCustomerModal } from "@/components/EditCustomerModal";

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

const CustomerAllDataPage = () => {
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/google-sheets-all-data");
      const result: ApiResponse = await response.json();
      if (!result.success) return;
      if (result.tables && result.tables.length > 0) {
        const sanitizedTables = result.tables.map((table) => {
          // Trim whitespace so columns with stray spaces still render and match filters
          const sanitizedHeaders = table.headers.map((header) => header.trim());
          const sanitizedData = table.data.map((row) => {
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
        sanitizedTables.forEach((table) => {
          table.headers.forEach((header) => {
            if (!allHeadersSet.has(header)) {
              allHeadersSet.add(header);
              allHeaders.push(header);
            }
          });
        });

        const filteredHeaders = allHeaders.filter((header) => {
          return sanitizedTables.some((table) => {
            return table.data.some(
              (row) =>
                row[header] !== undefined &&
                row[header] !== null &&
                row[header] !== ""
            );
          });
        });
        const allData: Record<string, any>[] = [];
        sanitizedTables.forEach((table) => {
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
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
      alert("ข้อมูลถูกบันทึกสำเร็จ (เพิ่มแอป API สำหรับบันทึกลงฐานข้อมูล)");
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

  const handleSaveCustomer = (updatedData: Record<string, any>) => {
    // TODO: บันทึกข้อมูลไปยัง API
    console.log("Saved customer data:", updatedData);
    alert("บันทึกข้อมูลสำเร็จ");
    setIsEditModalOpen(false);
  };

  const filteredAndSortedData = useMemo(() => {
    if (tableData.length === 0) return [];
    let filtered = [...tableData[0].data];

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

  const contactOptions = [
    { value: "all", label: "ทั้งหมด" },
    { value: "สา", label: "สา" },
    { value: "เจ", label: "เจ" },
    { value: "พิชยา", label: "พิชยา" },
    { value: "ว่าน", label: "ว่าน" },
    { value: "จีน", label: "จีน" },
    { value: "นุช", label: "นุช" },
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

  const statusOptions = [
    { value: "all", label: "ทั้งหมด", color: "bg-gray-200 text-gray-800" },
    // { value: "สถานะ", label: "สถานะ", color: "bg-yellow-400 text-black" },
    {
      value: "ซื้อแล้ว รอนัดหมาย (Online)",
      label: "ซื้อแล้ว รอนัดหมาย (Online)",
      color: "bg-green-500 text-black",
    },
    {
      value: "นัดแล้ว",
      label: "นัดแล้ว",
      color: "bg-white text-gray-900 border border-gray-300",
    },
    {
      value: "เป็นลูกค้าแล้ว",
      label: "เป็นลูกค้าแล้ว",
      color: "bg-blue-900 text-black",
    },
    {
      value: "Consult แล้วรอตัดสินใจ",
      label: "Consult แล้วรอตัดสินใจ",
      color: "bg-purple-500 text-black",
    },
    { value: "ยกเลิกนัด", label: "ยกเลิกนัด", color: "bg-gray-500 text-black" },
    {
      value: "เลื่อน นัดรอนัดใหม่",
      label: "เลื่อน นัดรอนัดใหม่",
      color: "bg-blue-600 text-black",
    },
    {
      value: "โอนราคาแล้ว",
      label: "โอนราคาแล้ว",
      color: "bg-purple-400 text-black",
    },
    { value: "ติดตาม", label: "ติดตาม", color: "bg-red-500 text-black" },
    {
      value: "สนใจ รอนัดหมาย (Online)",
      label: "สนใจ รอนัดหมาย (Online)",
      color: "bg-yellow-500 text-black",
    },
    {
      value: "ไม่สนใจ",
      label: "ไม่สนใจ",
      color: "bg-orange-500 text-black",
    },
    {
      value: "สนใจ รอนัดหมาย",
      label: "สนใจ รอนัดหมาย",
      color: "bg-teal-500 text-black",
    },
    {
      value: "ติดตาม",
      label: "ติดตาม",
      color: "bg-pink-400 text-black",
    },
    {
      value: "นัด Consult",
      label: "นัด Consult",
      color: "bg-indigo-500 text-black",
    },
    {
      value: "นัดพร้อมทำ",
      label: "นัดพร้อมทำ",
      color: "bg-gray-400 text-black",
    },
    {
      value: "Consultแล้วรอทำ",
      label: "Consultแล้วรอทำ",
      color: "bg-gray-500 text-black",
    },
    {
      value: "ลูกค้าติดปัญหา",
      label: "ลูกค้าติดปัญหา",
      color: "bg-gray-400 text-black",
    },
    {
      value: "นัด Consult (VDO)",
      label: "นัด Consult (VDO)",
      color: "bg-gray-500 text-black",
    },
    {
      value: "เบอร์ติดต่อไม่ได้",
      label: "เบอร์ติดต่อไม่ได้",
      color: "bg-gray-400 text-black",
    },
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
        {/* Detail Panel - Top */}

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
                onClick={() => setShowFilterMenu(!showFilterMenu)}
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
                onClick={() => setShowStatusMenu(!showStatusMenu)}
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
                onClick={() => setShowProductMenu(!showProductMenu)}
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

            {/* Contact Filter */}
            <div className="relative group">
              <button
                onClick={() => setShowContactMenu(!showContactMenu)}
                className="px-4 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-lg flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
              >
                <span>
                  ผู้ติดต่อ {contactFilter !== "all" && `(${contactFilter})`}
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

            {/* Date Filter 1: Follow Up Last */}
            <div className="relative group">
              <button
                onClick={() => setShowFollowUpLastMenu(!showFollowUpLastMenu)}
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
                onClick={() => setShowFollowUpNextMenu(!showFollowUpNextMenu)}
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
                onClick={() => setShowConsultMenu(!showConsultMenu)}
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
                onClick={() => setShowSurgeryMenu(!showSurgeryMenu)}
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
                onClick={() => setShowGetNameMenu(!showGetNameMenu)}
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
                onClick={() =>
                  setShowGetConsultApptMenu(!showGetConsultApptMenu)
                }
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
                onClick={() =>
                  setShowGetSurgeryApptMenu(!showGetSurgeryApptMenu)
                }
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

            {/* Refresh */}
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

          {/* Results Info */}
          {tableData.length > 0 && (
            <div className="mt-3 text-sm text-gray-600">
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
          )}
        </div>

        {tableData.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4 flex-1 flex flex-col">
            <div
              className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar custom-scrollbar-horizontal"
              style={{ order: -1 }}
            >
              <table className="w-full border-collapse text-sm">
                <thead className="sticky top-0 z-20">
                  <tr className="bg-yellow-300 border border-gray-400">
                    {tableData[0].headers.map((header, idx) => (
                      <th
                        key={idx}
                        onClick={() => handleSort(header)}
                        className="px-3 py-2 text-center text-xs font-bold text-gray-900 border-r border-gray-400 whitespace-nowrap cursor-pointer hover:bg-yellow-400 transition-colors"
                        style={{ fontSize: "11px", minWidth: "150px" }}
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
                        className={`border border-gray-300 hover:bg-blue-50 transition-all cursor-pointer ${
                          isSelected
                            ? "ring-4 ring-blue-500 bg-blue-100"
                            : bgColor
                        }`}
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
                              style={{ fontSize: "11px", minWidth: "150px" }}
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
    </>
  );
};

export default CustomerAllDataPage;
