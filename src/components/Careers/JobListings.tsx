"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Job {
  id: string;
  title: string;
  location: string;
  salary: string;
  type: string;
  category: string;
  postedDate: string;
  isUrgent?: boolean;
  hasOnlineInterview?: boolean;
}

const JobListings = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/jobs");
      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }
      const data = await response.json();
      setJobs(data.jobs || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("ไม่สามารถโหลดข้อมูลตำแหน่งงานได้ กรุณาลองใหม่อีกครั้ง");
      // Use fallback data
      setJobs(getFallbackJobs());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackJobs = (): Job[] => {
    return [
      {
        id: "1",
        title: "รองผจก./ผู้จัดการฝ่ายบริหารงบประมาณและต้นทุน",
        location: "อ.บางพลี จ.สมุทรปราการ",
        salary: "ตามโครงสร้างบริษัทฯ",
        type: "งานประจำ",
        category: "บริหารจัดการ",
        postedDate: "14 ต.ค. 68",
        isUrgent: false,
      },
      {
        id: "2",
        title: "เจ้าหน้าที่พัฒนาทรัพยากรบุคคล (ฝึกอบรม)",
        location: "อ.บางพลี จ.สมุทรปราการ",
        salary: "ตามประสบการณ์",
        type: "งานประจำ",
        category: "ทรัพยากรบุคคล",
        postedDate: "14 ต.ค. 68",
        isUrgent: false,
      },
      {
        id: "3",
        title: "เจ้าหน้าที่สรรหาว่าจ้าง",
        location: "อ.บางพลี จ.สมุทรปราการ",
        salary: "ตามประสบการณ์",
        type: "งานประจำ",
        category: "ทรัพยากรบุคคล",
        postedDate: "14 ต.ค. 68",
        isUrgent: true,
      },
      {
        id: "4",
        title: "เจ้าหน้าที่ขายและบริหารลูกค้าสัมพันธ์",
        location: "อ.บางพลี จ.สมุทรปราการ",
        salary: "ตามประสบการณ์",
        type: "งานประจำ",
        category: "ฝ่ายขาย",
        postedDate: "14 ต.ค. 68",
        isUrgent: false,
      },
      {
        id: "5",
        title: "ช่างเทคนิค (ช่างพิมพ์, ช่างไดคัท, ช่างเครื่องปะ)",
        location: "อ.บางพลี จ.สมุทรปราการ",
        salary: "ตามโครงสร้างบริษัทฯ",
        type: "งานประจำ",
        category: "ช่างเทคนิค",
        postedDate: "14 ต.ค. 68",
        isUrgent: true,
        hasOnlineInterview: true,
      },
      {
        id: "6",
        title: "วิศวกรจัดซื้อจัดหา",
        location: "อ.บางพลี จ.สมุทรปราการ",
        salary: "ตามโครงสร้างบริษัทฯ",
        type: "งานประจำ",
        category: "บริหารจัดการ",
        postedDate: "14 ต.ค. 68",
        isUrgent: false,
      },
      {
        id: "7",
        title: "ผู้จัดการฝ่ายผลิต",
        location: "อ.บางพลี จ.สมุทรปราการ",
        salary: "ตามโครงสร้างบริษัทฯ",
        type: "งานประจำ",
        category: "ฝ่ายผลิต",
        postedDate: "14 ต.ค. 68",
        isUrgent: false,
        hasOnlineInterview: true,
      },
      {
        id: "8",
        title: "วิศวกรการผลิต",
        location: "อ.บางพลี จ.สมุทรปราการ",
        salary: "ตามประสบการณ์ + โครงสร้างบริษัทฯ",
        type: "งานประจำ",
        category: "ฝ่ายผลิต",
        postedDate: "14 ต.ค. 68",
        isUrgent: false,
      },
      {
        id: "9",
        title: "เจ้าหน้าที่ประสานงานขาย",
        location: "อ.บางพลี จ.สมุทรปราการ",
        salary: "ตามโครงสร้างบริษัทฯ",
        type: "งานประจำ",
        category: "ฝ่ายขาย",
        postedDate: "14 ต.ค. 68",
        isUrgent: true,
        hasOnlineInterview: true,
      },
      {
        id: "10",
        title: "หัวหน้าฝ่ายวางแผนและควบคุมการผลิต",
        location: "อ.บางพลี จ.สมุทรปราการ",
        salary: "ตามโครงสร้างบริษัทฯ+ประสบการณ์",
        type: "งานประจำ",
        category: "ฝ่ายผลิต",
        postedDate: "14 ต.ค. 68",
        isUrgent: true,
      },
      {
        id: "11",
        title: "เจ้าหน้าที่ดูแลไดบอร์ด",
        location: "อ.บางพลี จ.สมุทรปราการ",
        salary: "ตามโครงสร้างบริษัทฯ",
        type: "งานประจำ",
        category: "อื่นๆ",
        postedDate: "14 ต.ค. 68",
        isUrgent: false,
      },
      {
        id: "12",
        title: "ช่างปรับตั้งเครื่องปะกาวออโต้",
        location: "อ.บางพลี จ.สมุทรปราการ",
        salary: "ตามโครงสร้างบริษัทฯ",
        type: "งานประจำ",
        category: "ช่างเทคนิค",
        postedDate: "14 ต.ค. 68",
        isUrgent: false,
        hasOnlineInterview: true,
      },
      {
        id: "13",
        title: "หัวหน้าแผนกบัญชี",
        location: "อ.บางพลี จ.สมุทรปราการ",
        salary: "ตามโครงสร้างบริษัทฯ",
        type: "งานประจำ",
        category: "บริหารจัดการ",
        postedDate: "14 ต.ค. 68",
        isUrgent: false,
      },
      {
        id: "14",
        title: "เจ้าหน้าที่ความปลอดภัย(จป.)/สิ่งแวดล้อม",
        location: "อ.บางพลี จ.สมุทรปราการ",
        salary: "ตามโครงสร้างบริษัทฯ",
        type: "งานประจำ",
        category: "อื่นๆ",
        postedDate: "14 ต.ค. 68",
        isUrgent: false,
      },
      {
        id: "15",
        title: "เจ้าหน้าวางแผนประสานงานขายและบริหารลูกค้าสัมพันธ์",
        location: "อ.บางพลี จ.สมุทรปราการ",
        salary: "ตามโครงสร้างบริษัทฯ",
        type: "งานประจำ",
        category: "ฝ่ายขาย",
        postedDate: "14 ต.ค. 68",
        isUrgent: false,
      },
    ];
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || job.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div id="job-listings" className="space-y-8">
      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="ค้นหาตำแหน่งงาน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
            />
          </div>
          <button
            onClick={fetchJobs}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-300"
          >
            🔄 รีเฟรช
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <p className="text-yellow-800">{error}</p>
        </div>
      )}

      {/* Job Cards */}
      <div className="grid grid-cols-1 gap-6">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              ไม่พบตำแหน่งงานที่คุณค้นหา
            </h3>
            <p className="text-gray-600">ลองค้นหาด้วยคำค้นหาอื่น</p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {job.title}
                          </h3>
                          {job.isUrgent && (
                            <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                              รับสมัครด่วน
                            </span>
                          )}
                          {job.hasOnlineInterview && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                              สัมภาษณ์ออนไลน์
                            </span>
                          )}
                        </div>
                        <div className="space-y-2 text-gray-600">
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-5 h-5 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-5 h-5 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span>เงินเดือน: {job.salary}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-5 h-5 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                            <span>{job.type}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 md:items-end">
                    <span className="text-sm text-gray-500">
                      {job.postedDate}
                    </span>
                    <div className="flex gap-2">
                      <a
                        href="https://www.jobthai.com/th/company/135063"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                      >
                        สมัครงาน
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    หมวดหมู่:{" "}
                    <span className="font-semibold text-gray-900">
                      {job.category}
                    </span>
                  </span>
                  <a
                    href="https://www.jobthai.com/th/company/135063"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                  >
                    ดูรายละเอียดเพิ่มเติม →
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Contact Information */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-8 text-white mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">ติดต่อสอบถามเพิ่มเติม</h3>
            <div className="space-y-3">
              <p className="flex items-center gap-3">
                <svg
                  className="w-6 h-6 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span>062-414-3555, 02-175-2201</span>
              </p>
              <p className="flex items-center gap-3">
                <svg
                  className="w-6 h-6 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                </svg>
                <span>ส่วนงานสรรหาและว่าจ้าง</span>
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-4">ที่อยู่บริษัท</h3>
            <p className="text-gray-300">
              เลขที่ 9/9 หมู่ที่ 6 ถนนกิ่งแก้ว 48
              <br />
              ตำบลราชาเทวะ อำเภอบางพลี
              <br />
              จังหวัดสมุทรปราการ 10540
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobListings;
