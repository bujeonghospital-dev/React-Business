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
  name: "BJH BANGKOK",
  shortName: "ฆสพ.สบส : ๔๖๒๗ / ๒๕๖๘",
  headquarters: {
    title: "BJH BANGKOK",
    address: "กรุงเทพมหานคร",
    phone: "02-095-4799",
    phone2: "086-411-4262",
    email: "",
    coordinates: { lat: 13.7563, lng: 100.5018 },
  },
  workingHours: {
    everyday: "เปิดทุกวัน: 11:00 - 20:00 น.",
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
  const currentLocation = COMPANY_INFO.headquarters;
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50">
      {/* Hero Section */}
      <div className="relative h-[400px] overflow-hidden" style={{ background: "linear-gradient(135deg, #3BA8A6 0%, #4AC0BF 50%, #5DD3D2 100%)" }}>
        <div className="absolute inset-0 bg-black/20" />
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
              ยินดีให้บริการและตอบทุกคำถามเกี่ยวกับบริการศัลยกรรมของเรา
              <br />
              พร้อมดูแลความงามของคุณ
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
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <MapPin className="w-6 h-6 text-teal-600" />
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
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Phone className="w-6 h-6 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Call Center
                      </h3>
                      <p className="text-gray-600">
                        <a href={`tel:${currentLocation.phone}`} className="hover:text-teal-600">{currentLocation.phone}</a>
                      </p>
                      <p className="text-gray-600">
                        <a href={`tel:${currentLocation.phone2}`} className="hover:text-teal-600">{currentLocation.phone2}</a>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 group">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <MessageSquare className="w-6 h-6 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        ช่องทางติดต่อ
                      </h3>
                      <div className="flex gap-3">
                        <a
                          href="https://www.facebook.com/bjhbangkok"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-600 hover:text-teal-700 transition-colors"
                        >
                          Facebook
                        </a>
                        <a
                          href="https://lin.ee/D9KIJyb"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-600 hover:text-teal-700 transition-colors"
                        >
                          LINE
                        </a>
                        <a
                          href="https://m.me/bjhbangkok"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-600 hover:text-teal-700 transition-colors"
                        >
                          Messenger
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 group">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Clock className="w-6 h-6 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        เวลาทำการ
                      </h3>
                      <div className="text-gray-600 space-y-1 text-sm">
                        <p className="text-teal-600 font-medium">
                          {COMPANY_INFO.workingHours.everyday}
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
              <div className="p-4" style={{ background: "linear-gradient(90deg, #3BA8A6 0%, #4AC0BF 100%)" }}>
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
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
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
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
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
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
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
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
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
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none resize-none"
                    placeholder="รายละเอียดที่ต้องการสอบถามหรือติดต่อ"
                  />
                </div>
                {/* Submit Status */}
                {submitStatus.type && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl ${submitStatus.type === "success"
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
                  className="w-full text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(90deg, #3BA8A6 0%, #4AC0BF 100%)" }}
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
          className="mt-16 rounded-2xl shadow-2xl overflow-hidden"
          style={{ background: "linear-gradient(135deg, #3BA8A6 0%, #4AC0BF 50%, #5DD3D2 100%)" }}
        >
          <div className="p-8 md:p-12 text-white text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              พร้อมให้บริการคุณ
            </h2>
            <p className="text-lg md:text-xl mb-6 max-w-3xl mx-auto">
              ทีมแพทย์ผู้เชี่ยวชาญของเรายินดีให้คำปรึกษาและตอบทุกคำถาม
              <br />
              เกี่ยวกับบริการศัลยกรรมความงามมาตรฐานสากล
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href={`tel:${COMPANY_INFO.headquarters.phone}`}
                className="bg-white font-semibold px-8 py-3 rounded-xl hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
                style={{ color: "#4AC0BF" }}
              >
                <Phone className="w-5 h-5" />
                โทรหาเรา
              </a>
              <a
                href="https://lin.ee/D9KIJyb"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-transparent border-2 border-white text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors inline-flex items-center gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                แชทกับเรา
              </a>
            </div>
          </div>
        </motion.div>
      </Container>
    </div>
  );
};
export default ContactInquiryPage;
