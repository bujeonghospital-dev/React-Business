"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  User,
  Building2,
  MessageSquare,
  Loader2,
} from "lucide-react";
import Container from "@/components/Container";
import Image from "next/image";
import GoogleMapComponent from "@/components/GoogleMap";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Company Information
const COMPANY_INFO = {
  name: "บริษัท ไทยบรรจุภัณฑ์และการพิมพ์ จำกัด (มหาชน)",
  shortName: "Thai Packaging and Printing Public Company Limited",
  headquarters: {
    title: "สำนักงานใหญ่",
    address:
      "9/9 หมู่ 6 ถนนกิ่งแก้ว ตำบลราชาเทวะ อำเภอบางพลี จังหวัดสมุทรปราการ 10540",
    phone: "02-175-2201-8",
    fax: "(+66) 2-529-1254",
    email: "marketingcenter@tpppack.com",
    coordinates: { lat: 13.685984091307898, lng: 100.72794861574249 },
  },
  factory: {
    title: "โรงงาน",
    address:
      "9/9 หมู่ 6 ถนนกิ่งแก้ว ตำบลราชาเทวะ อำเภอบางพลี จังหวัดสมุทรปราการ 10540",
    phone: "02-175-2201-8",
    fax: "(+66) 2-529-1254",
    email: "marketingcenter@tpppack.com",
    coordinates: { lat: 13.685984091307898, lng: 100.72794861574249 },
  },
  workingHours: {
    weekdays: "จันทร์ - ศุกร์: 8:30 - 17:30 น.",
    saturday: "เสาร์: 8:30 - 17:30 น.",
    sunday: "วันอาทิตย์และวันหยุดนักขัตฤกษ์: ปิดทำการ",
  },
};

// Form Component
interface FormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const ContactInquiryPage = () => {
  const [activeTab, setActiveTab] = useState<"headquarters" | "factory">(
    "headquarters"
  );
  const [formData, setFormData] = useState<FormData>({
    name: "",
    company: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      // เรียก API เพื่อส่งข้อมูล
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to send message");
      }

      setSubmitStatus({
        type: "success",
        message:
          result.message || "ส่งข้อความสำเร็จ! เราจะติดต่อกลับโดยเร็วที่สุด",
      });

      // Reset form
      setFormData({
        name: "",
        company: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentLocation =
    activeTab === "headquarters"
      ? COMPANY_INFO.headquarters
      : COMPANY_INFO.factory;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      {/* Hero Section */}
      <div className="relative h-[400px] bg-gradient-to-br from-red-900 via-red-800 to-red-700 overflow-hidden">
        <div className="absolute inset-0 bg-black/30" />
        <Image
          src="/images/team/TPP_HOME.png"
          alt="Contact Us"
          fill
          className="object-cover mix-blend-overlay"
          priority
        />
        <Container>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.8 }}
            className="relative z-10 h-[400px] flex flex-col justify-center items-center text-center text-white"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-2xl">
              ติดต่อเรา
            </h1>
            <p className="text-lg md:text-xl max-w-2xl drop-shadow-lg">
              ยินดีให้บริการและตอบทุกคำถามเกี่ยวกับผลิตภัณฑ์และบริการของเรา
              <br />
              พร้อมสร้างความประทับใจให้กับคุณ
            </p>
          </motion.div>
        </Container>
      </div>

      <Container className="py-16">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12"
        >
          {/* Left Column - Company Information & Map */}
          <motion.div variants={fadeInUp} className="space-y-8">
            {/* Location Tabs */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("headquarters")}
                  className={`flex-1 py-4 px-6 font-semibold transition-all duration-300 ${
                    activeTab === "headquarters"
                      ? "bg-gradient-to-r from-red-600 to-red-700 text-white"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {COMPANY_INFO.headquarters.title}
                </button>
                <button
                  onClick={() => setActiveTab("factory")}
                  className={`flex-1 py-4 px-6 font-semibold transition-all duration-300 ${
                    activeTab === "factory"
                      ? "bg-gradient-to-r from-red-600 to-red-700 text-white"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {COMPANY_INFO.factory.title}
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Company Name */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {COMPANY_INFO.name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {COMPANY_INFO.shortName}
                  </p>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <div className="flex items-start gap-4 group">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <MapPin className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        ที่อยู่
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {currentLocation.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 group">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Phone className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        โทรศัพท์
                      </h3>
                      <p className="text-gray-600">{currentLocation.phone}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        โทรสาร: {currentLocation.fax}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 group">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Mail className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        อีเมล
                      </h3>
                      <a
                        href={`mailto:${currentLocation.email}`}
                        className="text-red-600 hover:text-red-700 hover:underline transition-colors"
                      >
                        {currentLocation.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 group">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Clock className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        เวลาทำการ
                      </h3>
                      <div className="text-gray-600 space-y-1 text-sm">
                        <p>{COMPANY_INFO.workingHours.weekdays}</p>
                        <p>{COMPANY_INFO.workingHours.saturday}</p>
                        <p className="text-red-600">
                          {COMPANY_INFO.workingHours.sunday}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Map */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="aspect-video relative">
                <GoogleMapComponent
                  center={currentLocation.coordinates}
                  zoom={15}
                  markerPosition={currentLocation.coordinates}
                  markerTitle={currentLocation.title}
                />
              </div>
              <div className="p-4 bg-gradient-to-r from-red-600 to-red-700">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${currentLocation.coordinates.lat},${currentLocation.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white font-semibold hover:underline flex items-center justify-center gap-2"
                >
                  <MapPin className="w-5 h-5" />
                  ดูเส้นทางใน Google Maps
                </a>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Contact Form */}
          <motion.div variants={fadeInUp}>
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 sticky top-24">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  แบบฟอร์มการติดต่อ
                </h2>
                <p className="text-gray-600">
                  กรอกข้อมูลด้านล่างและเราจะติดต่อกลับโดยเร็วที่สุด
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    ชื่อ-นามสกุล <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none"
                      placeholder="กรอกชื่อ-นามสกุล"
                    />
                  </div>
                </div>

                {/* Company */}
                <div>
                  <label
                    htmlFor="company"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    บริษัท/องค์กร
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none"
                      placeholder="กรอกชื่อบริษัท (ถ้ามี)"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    อีเมล <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none"
                      placeholder="example@email.com"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none"
                      placeholder="0X-XXXX-XXXX"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    หัวข้อ <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none"
                      placeholder="เรื่องที่ต้องการติดต่อ"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    ข้อความ <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none resize-none"
                    placeholder="รายละเอียดที่ต้องการสอบถามหรือติดต่อ"
                  />
                </div>

                {/* Submit Status */}
                {submitStatus.type && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl ${
                      submitStatus.type === "success"
                        ? "bg-green-50 text-green-800 border border-green-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    {submitStatus.message}
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold py-4 px-6 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      กำลังส่ง...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      ส่งข้อความ
                    </>
                  )}
                </motion.button>

                <p className="text-sm text-gray-500 text-center">
                  เราจะตอบกลับภายใน 1-2 วันทำการ
                </p>
              </form>
            </div>
          </motion.div>
        </motion.div>

        {/* Additional Information Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 bg-gradient-to-r from-red-600 via-red-700 to-red-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="p-8 md:p-12 text-white text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              พร้อมให้บริการคุณ
            </h2>
            <p className="text-lg md:text-xl mb-6 max-w-3xl mx-auto">
              ทีมงานผู้เชี่ยวชาญของเรายินดีให้คำปรึกษาและตอบทุกคำถามเกี่ยวกับผลิตภัณฑ์
              <br />
              และบริการด้านบรรจุภัณฑ์และงานพิมพ์คุณภาพสูง
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href={`tel:${COMPANY_INFO.headquarters.phone}`}
                className="bg-white text-red-600 font-semibold px-8 py-3 rounded-xl hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
              >
                <Phone className="w-5 h-5" />
                โทรหาเรา
              </a>
              <a
                href={`mailto:${COMPANY_INFO.headquarters.email}`}
                className="bg-transparent border-2 border-white text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors inline-flex items-center gap-2"
              >
                <Mail className="w-5 h-5" />
                ส่งอีเมล
              </a>
            </div>
          </div>
        </motion.div>
      </Container>
    </div>
  );
};

export default ContactInquiryPage;
