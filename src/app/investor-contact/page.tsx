"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Send, User, Building2 } from "lucide-react";
import Container from "@/components/Container";

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

// Contact Card Component
interface ContactCardProps {
  name: string;
  position: string;
  department: string;
  phone: string;
  variant?: "blue" | "gradient";
}

const ContactCard: React.FC<ContactCardProps> = ({
  name,
  position,
  department,
  phone,
  variant = "blue",
}) => {
  const bgClass =
    variant === "gradient"
      ? "bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-500"
      : "bg-gradient-to-br from-blue-900 to-blue-800";

  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ scale: 1.03, y: -5 }}
      className={`${bgClass} rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 group`}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1 group-hover:text-cyan-200 transition-colors">
              {name}
            </h3>
            <p className="text-sm opacity-90 mb-2">{position}</p>
          </div>
          <User className="w-8 h-8 opacity-30 group-hover:opacity-50 transition-opacity" />
        </div>

        <div className="border-t border-white/20 pt-3">
          <p className="text-sm font-medium mb-3 opacity-90">{department}</p>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 flex-shrink-0" />
            <a
              href={`tel:${phone}`}
              className="hover:text-cyan-200 transition-colors"
            >
              {phone}
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Contact Form Component
const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    organization: "",
    email: "",
    phone: "",
    message: "",
    acceptPolicy: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "กรุณากรอกชื่อ-นามสกุล";
    }

    if (!formData.organization.trim()) {
      newErrors.organization = "กรุณากรอกชื่อหน่วยงาน";
    }

    if (!formData.email.trim()) {
      newErrors.email = "กรุณากรอกอีเมล";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "กรุณากรอกเบอร์โทรศัพท์";
    }

    if (!formData.message.trim()) {
      newErrors.message = "กรุณากรอกข้อความ";
    }

    if (!formData.acceptPolicy) {
      newErrors.acceptPolicy = "กรุณายอมรับนโยบายความเป็นส่วนตัว";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Implement actual form submission
      await new Promise((resolve) => setTimeout(resolve, 2000));

      alert("ส่งข้อความสำเร็จ! เราจะติดต่อกลับโดยเร็วที่สุด");

      // Reset form
      setFormData({
        name: "",
        organization: "",
        email: "",
        phone: "",
        message: "",
        acceptPolicy: false,
      });
    } catch (error) {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInUp}
      className="bg-white rounded-3xl shadow-2xl p-8 md:p-12"
    >
      <div className="text-center mb-10">
        <div className="inline-block mx-auto mb-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            แบบฟอร์มติดต่อนักลงทุนสัมพันธ์
          </h2>
          <div className="w-full h-1 bg-gradient-to-r from-blue-600 to-cyan-500 mx-auto rounded-full" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            ชื่อ-นามสกุล <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.name ? "border-red-500" : "border-gray-300"
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
            placeholder="กรอกชื่อ-นามสกุล"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Organization Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            ชื่อหน่วยงาน <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="organization"
            value={formData.organization}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.organization ? "border-red-500" : "border-gray-300"
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
            placeholder="กรอกชื่อหน่วยงาน"
          />
          {errors.organization && (
            <p className="mt-1 text-sm text-red-500">{errors.organization}</p>
          )}
        </div>

        {/* Email and Phone Fields */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              อีเมล <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
              placeholder="example@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              เบอร์โทรศัพท์ <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.phone ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
              placeholder="0x-xxxx-xxxx"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
            )}
          </div>
        </div>

        {/* Message Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            ข้อความ <span className="text-red-500">*</span>
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={5}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.message ? "border-red-500" : "border-gray-300"
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none`}
            placeholder="กรอกข้อความที่ต้องการสอบถาม..."
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-500">{errors.message}</p>
          )}
        </div>

        {/* Privacy Policy Checkbox */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            name="acceptPolicy"
            checked={formData.acceptPolicy}
            onChange={handleChange}
            className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
          />
          <label className="text-sm text-gray-700 flex-1">
            ข้อมูลส่วนบุคคลของท่านจะถูกเก็บรักษาเป็นความลับ ตาม{" "}
            <a
              href="/privacy-policy"
              className="text-blue-600 hover:text-blue-800 underline font-semibold"
            >
              นโยบายความเป็นส่วนตัว
            </a>{" "}
            และเพื่อความสะดวกในการติดต่อกลับ / เพื่อให้บริการข้อมูลข่าวสารอื่นๆ
            ที่อาจเกิดขึ้นในภายหลัง
          </label>
        </div>
        {errors.acceptPolicy && (
          <p className="text-sm text-red-500 -mt-3">{errors.acceptPolicy}</p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-full hover:from-blue-700 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              กำลังส่ง...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              ส่งข้อความติดต่อกลับ
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};

// Main Page Component
export default function InvestorContactPage() {
  const contactPersons: ContactCardProps[] = [
    {
      name: "บริษัท ไทยบรรจุภัณฑ์และการพิมพ์ จำกัด (มหาชน)",
      position: "ฝ่ายนักลงทุนสัมพันธ์",
      department: "นักลงทุนสัมพันธ์",
      phone: "02-xxx-xxxx",
      variant: "gradient",
    },
    {
      name: "คุณศิริพร เพ็ชรพินิจ",
      position: "หัวหน้านักลงทุนสัมพันธ์",
      department: "นักลงทุนสัมพันธ์",
      phone: "02-xxx-xxxx",
      variant: "blue",
    },
    {
      name: "คุณสมชาย นามสมมุติ",
      position: "นักลงทุนสัมพันธ์อาวุโส",
      department: "นักลงทุนสัมพันธ์",
      phone: "02-xxx-xxxx",
      variant: "blue",
    },
    {
      name: "คุณปิยะนุช แก้วสีดา",
      position: "นักลงทุนสัมพันธ์",
      department: "นักลงทุนสัมพันธ์",
      phone: "02-xxx-xxxx",
      variant: "blue",
    },
    {
      name: "คุณสุจินต์ ศรีประเสริฐ",
      position: "เจ้าหน้าที่นักลงทุนสัมพันธ์",
      department: "นักลงทุนสัมพันธ์",
      phone: "02-xxx-xxxx",
      variant: "blue",
    },
    {
      name: "คุณวิภาวี จันทร์เจริญ",
      position: "ผู้ช่วยนักลงทุนสัมพันธ์",
      department: "นักลงทุนสัมพันธ์",
      phone: "02-xxx-xxxx",
      variant: "blue",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-12 mt-5">
      <Container>
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-block mx-auto mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              ติดต่อนักลงทุนสัมพันธ์
            </h1>
            <div className="w-full h-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full" />
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            ทีมนักลงทุนสัมพันธ์ของเรายินดีให้บริการข้อมูลและตอบข้อซักถามเกี่ยวกับการลงทุนและผลการดำเนินงานของบริษัท
          </p>
        </motion.div>

        {/* Company Contact Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="mb-16"
        >
          <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-shrink-0">
                <Building2 className="w-16 h-16 text-cyan-300" />
              </div>
              <div className="flex-1 space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold">
                  บริษัท ไทยบรรจุภัณฑ์และการพิมพ์ จำกัด (มหาชน)
                </h2>
                <div className="grid md:grid-cols-2 gap-4 text-sm md:text-base">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 flex-shrink-0 mt-1 text-cyan-300" />
                    <div>
                      <p className="font-semibold mb-1">ที่อยู่</p>
                      <p className="opacity-90">
                        เลขที่ 55/1 หมู่ 2 ถนนบางนา-ตราด กม.23 ตำบลบางโฉลง
                        อำเภอบางพลี จังหวัดสมุทรปราการ 10540
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 flex-shrink-0 mt-1 text-cyan-300" />
                    <div>
                      <p className="font-semibold mb-1">โทรศัพท์</p>
                      <p className="opacity-90">02-xxx-xxxx (สายด่วน)</p>
                      <p className="opacity-90">
                        02-xxx-xxxx ถึง xx (อัตโนมัติ)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 flex-shrink-0 mt-1 text-cyan-300" />
                    <div>
                      <p className="font-semibold mb-1">อีเมล</p>
                      <a
                        href="mailto:ir@tpp.co.th"
                        className="opacity-90 hover:text-cyan-200 transition-colors underline"
                      >
                        ir@tpp.co.th
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Cards Grid */}
        {/* <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
            ทีมนักลงทุนสัมพันธ์
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contactPersons.map((person, index) => (
              <ContactCard key={index} {...person} />
            ))}
          </div>
        </motion.div> */}

        {/* Contact Form Section */}
        <ContactForm />

        {/* Additional Info Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="mt-16 bg-blue-50 rounded-2xl p-8 border border-blue-100"
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            เวลาทำการ
          </h3>
          <div className="text-center text-gray-700">
            <p className="text-lg font-semibold mb-2">
              วันจันทร์ - วันเสาร์ เวลา 08:30 - 17:30 น.
            </p>
            <p className="text-sm text-gray-600">
              (ยกเว้นวันหยุดนักขัตฤกษ์และวันหยุดพิเศษ)
            </p>
          </div>
        </motion.div>
      </Container>
    </div>
  );
}
