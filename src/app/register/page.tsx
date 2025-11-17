"use client";

import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  User,
  Phone,
  Building2,
  Briefcase,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Department {
  id: number;
  name: string;
  name_full_th: string;
}

interface Position {
  id: number;
  name_full_th: string;
}

interface RegisterFormData {
  name: string;
  lname: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  department?: number;
  position?: number;
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    lname: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    phone: "",
    department: undefined,
    position: undefined,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errors, setErrors] = useState<
    Partial<Record<keyof RegisterFormData | "general", string>>
  >({});
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch departments and positions on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("🔄 Fetching departments and positions...");

        const [deptResponse, posResponse] = await Promise.all([
          fetch("/api/departments"),
          fetch("/api/positions"),
        ]);

        console.log("📦 Departments response status:", deptResponse.status);
        console.log("📦 Positions response status:", posResponse.status);

        const deptData = await deptResponse.json();
        const posData = await posResponse.json();

        console.log("📊 Departments data:", deptData);
        console.log("📊 Positions data:", posData);

        if (deptData.success && deptData.data) {
          setDepartments(deptData.data);
          console.log(`✅ Loaded ${deptData.data.length} departments`);
        } else {
          console.error("❌ Failed to load departments:", deptData.message);
        }

        if (posData.success && posData.data) {
          setPositions(posData.data);
          console.log(`✅ Loaded ${posData.data.length} positions`);
        } else {
          console.error("❌ Failed to load positions:", posData.message);
        }
      } catch (error) {
        console.error("❌ Error fetching data:", error);
        setErrors((prev) => ({
          ...prev,
          general: "ไม่สามารถโหลดข้อมูลแผนกและตำแหน่งได้ กรุณาลองใหม่อีกครั้ง",
        }));
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

  // Real-time validation
  const validateField = (field: keyof RegisterFormData, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case "name":
        if (!value.trim()) {
          newErrors.name = "กรุณากรอกชื่อ";
        } else {
          delete newErrors.name;
        }
        break;

      case "lname":
        if (!value.trim()) {
          newErrors.lname = "กรุณากรอกนามสกุล";
        } else {
          delete newErrors.lname;
        }
        break;

      case "email":
        if (!value) {
          newErrors.email = "กรุณากรอกอีเมล";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
        } else {
          delete newErrors.email;
        }
        break;

      case "username":
        if (!value) {
          newErrors.username = "กรุณากรอกชื่อผู้ใช้";
        } else if (value.length < 3) {
          newErrors.username = "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร";
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          newErrors.username = "ชื่อผู้ใช้ใช้ได้เฉพาะ a-z, 0-9 และ _";
        } else {
          delete newErrors.username;
        }
        break;

      case "password":
        if (!value) {
          newErrors.password = "กรุณากรอกรหัสผ่าน";
        } else if (value.length < 6) {
          newErrors.password = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
        } else {
          delete newErrors.password;
          // Check confirm password match
          if (formData.confirmPassword && value !== formData.confirmPassword) {
            newErrors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
          } else if (formData.confirmPassword) {
            delete newErrors.confirmPassword;
          }
        }
        break;

      case "confirmPassword":
        if (!value) {
          newErrors.confirmPassword = "กรุณายืนยันรหัสผ่าน";
        } else if (value !== formData.password) {
          newErrors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
        } else {
          delete newErrors.confirmPassword;
        }
        break;
    }

    setErrors(newErrors);
  };

  const validateSelectField = (
    field: keyof RegisterFormData,
    value: number | undefined
  ) => {
    const newErrors = { ...errors };

    if (field === "department") {
      if (!value) {
        newErrors.department = "กรุณาเลือกแผนก";
      } else {
        delete newErrors.department;
      }
    } else if (field === "position") {
      if (!value) {
        newErrors.position = "กรุณาเลือกตำแหน่ง";
      } else {
        delete newErrors.position;
      }
    }

    setErrors(newErrors);
  };

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
    if (errors.general) {
      setErrors((prev) => {
        const { general, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSelectChange = (
    field: keyof RegisterFormData,
    value: number | undefined
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    validateSelectField(field, value);
    if (errors.general) {
      setErrors((prev) => {
        const { general, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");

    // Validate all required fields
    const newErrors: Partial<Record<keyof RegisterFormData, string>> = {};

    if (!formData.name.trim()) newErrors.name = "กรุณากรอกชื่อ";
    if (!formData.lname.trim()) newErrors.lname = "กรุณากรอกนามสกุล";

    if (!formData.email) {
      newErrors.email = "กรุณากรอกอีเมล";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
    }

    if (!formData.username) {
      newErrors.username = "กรุณากรอกชื่อผู้ใช้";
    } else if (formData.username.length < 3) {
      newErrors.username = "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร";
    }

    if (!formData.password) {
      newErrors.password = "กรุณากรอกรหัสผ่าน";
    } else if (formData.password.length < 6) {
      newErrors.password = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "กรุณายืนยันรหัสผ่าน";
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
    }

    if (!formData.department) {
      newErrors.department = "กรุณาเลือกแผนก";
    }

    if (!formData.position) {
      newErrors.position = "กรุณาเลือกตำแหน่ง";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(data.message);

        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setErrors({ general: data.message });
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrors({
        general: "เกิดข้อผิดพลาดในการสมัครสมาชิก กรุณาลองใหม่อีกครั้ง",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-red-50 via-white to-red-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        {/* Logo/Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
              PAKKU GROUP
            </h1>
          </Link>
        </motion.div>

        {/* Register Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl p-8 border border-red-100"
        >
          {/* Card Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              สมัครสมาชิก
            </h2>
            <p className="text-gray-600">สร้างบัญชีใหม่เพื่อเข้าใช้งานระบบ</p>
          </div>

          {/* Success Message */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-green-800 text-sm">{successMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* General Error Message */}
          <AnimatePresence>
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm">{errors.general}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields - Grid 2 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  ชื่อ <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    onBlur={(e) => validateField("name", e.target.value)}
                    className={`block w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      errors.name
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-red-500 focus:border-red-500"
                    }`}
                    placeholder="สมชาย"
                    disabled={isLoading}
                  />
                </div>
                <AnimatePresence>
                  {errors.name && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="mt-2 text-sm text-red-600 flex items-center gap-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {errors.name}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Last Name */}
              <div>
                <label
                  htmlFor="lname"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  นามสกุล <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="lname"
                    value={formData.lname}
                    onChange={(e) => handleInputChange("lname", e.target.value)}
                    onBlur={(e) => validateField("lname", e.target.value)}
                    className={`block w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      errors.lname
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-red-500 focus:border-red-500"
                    }`}
                    placeholder="ใจดี"
                    disabled={isLoading}
                  />
                </div>
                <AnimatePresence>
                  {errors.lname && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="mt-2 text-sm text-red-600 flex items-center gap-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {errors.lname}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                อีเมล <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  onBlur={(e) => validateField("email", e.target.value)}
                  className={`block w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    errors.email
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-red-500 focus:border-red-500"
                  }`}
                  placeholder="example@company.com"
                  disabled={isLoading}
                />
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="mt-2 text-sm text-red-600 flex items-center gap-1"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                ชื่อผู้ใช้ <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="username"
                  value={formData.username}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                  onBlur={(e) => validateField("username", e.target.value)}
                  className={`block w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    errors.username
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-red-500 focus:border-red-500"
                  }`}
                  placeholder="username123"
                  disabled={isLoading}
                />
              </div>
              <AnimatePresence>
                {errors.username && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="mt-2 text-sm text-red-600 flex items-center gap-1"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {errors.username}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Password Fields - Grid 2 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  รหัสผ่าน <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    onBlur={(e) => validateField("password", e.target.value)}
                    className={`block w-full pl-12 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      errors.password
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-red-500 focus:border-red-500"
                    }`}
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="mt-2 text-sm text-red-600 flex items-center gap-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {errors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  ยืนยันรหัสผ่าน <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    onBlur={(e) =>
                      validateField("confirmPassword", e.target.value)
                    }
                    className={`block w-full pl-12 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      errors.confirmPassword
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-red-500 focus:border-red-500"
                    }`}
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <AnimatePresence>
                  {errors.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="mt-2 text-sm text-red-600 flex items-center gap-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {errors.confirmPassword}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Department & Position - Required Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Department */}
              <div>
                <label
                  htmlFor="department"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  แผนก <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="department"
                    value={formData.department || ""}
                    onChange={(e) =>
                      handleSelectChange(
                        "department",
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    onBlur={(e) =>
                      validateSelectField(
                        "department",
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    className={`block w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all appearance-none bg-white ${
                      errors.department
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-red-500 focus:border-red-500"
                    }`}
                    disabled={isLoading || isLoadingData}
                  >
                    <option value="">เลือกแผนก</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name_full_th}
                      </option>
                    ))}
                  </select>
                </div>
                <AnimatePresence>
                  {errors.department && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="mt-2 text-sm text-red-600 flex items-center gap-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {errors.department}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Position */}
              <div>
                <label
                  htmlFor="position"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  ตำแหน่ง <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="position"
                    value={formData.position || ""}
                    onChange={(e) =>
                      handleSelectChange(
                        "position",
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    onBlur={(e) =>
                      validateSelectField(
                        "position",
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    className={`block w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all appearance-none bg-white ${
                      errors.position
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-red-500 focus:border-red-500"
                    }`}
                    disabled={isLoading || isLoadingData}
                  >
                    <option value="">เลือกตำแหน่ง</option>
                    {positions.map((pos) => (
                      <option key={pos.id} value={pos.id}>
                        {pos.name_full_th}
                      </option>
                    ))}
                  </select>
                </div>
                <AnimatePresence>
                  {errors.position && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="mt-2 text-sm text-red-600 flex items-center gap-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {errors.position}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Phone - Optional Field */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                เบอร์โทรศัพท์
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                  placeholder="081-234-5678"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || Object.keys(errors).length > 0}
              className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-xl hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>กำลังสมัครสมาชิก...</span>
                </>
              ) : (
                <span>สมัครสมาชิก</span>
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-8 text-center text-sm text-gray-600">
            มีบัญชีอยู่แล้ว?{" "}
            <Link
              href="/login"
              className="font-medium text-red-600 hover:text-red-700 transition-colors"
            >
              เข้าสู่ระบบ
            </Link>
          </p>
        </motion.div>

        {/* Footer Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 text-center text-sm text-gray-500"
        >
          การสมัครสมาชิกแสดงว่าคุณยินยอมตาม{" "}
          <Link
            href="/terms"
            className="text-red-600 hover:text-red-700 transition-colors"
          >
            เงื่อนไขการใช้งาน
          </Link>{" "}
          และ{" "}
          <Link
            href="/privacy"
            className="text-red-600 hover:text-red-700 transition-colors"
          >
            นโยบายความเป็นส่วนตัว
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
