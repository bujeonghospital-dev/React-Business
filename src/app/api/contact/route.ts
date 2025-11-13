import { NextRequest, NextResponse } from "next/server";

// Interface สำหรับข้อมูลที่รับจากฟอร์ม
interface ContactFormData {
  name: string;
  company?: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone number (Thai format)
function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[0-9]{8,10}$/;
  return phoneRegex.test(phone.replace(/[-\s]/g, ""));
}

export async function POST(request: NextRequest) {
  try {
    // 1. รับข้อมูลจาก request body
    const data: ContactFormData = await request.json();

    // 2. Validate ข้อมูลที่จำเป็น
    if (
      !data.name ||
      !data.email ||
      !data.phone ||
      !data.subject ||
      !data.message
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "กรุณากรอกข้อมูลให้ครบถ้วน",
        },
        { status: 400 }
      );
    }

    // 3. Validate รูปแบบอีเมล
    if (!isValidEmail(data.email)) {
      return NextResponse.json(
        {
          success: false,
          error: "รูปแบบอีเมลไม่ถูกต้อง",
        },
        { status: 400 }
      );
    }

    // 4. Validate รูปแบบเบอร์โทร
    if (!isValidPhone(data.phone)) {
      return NextResponse.json(
        {
          success: false,
          error: "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง",
        },
        { status: 400 }
      );
    }

    // 5. ตรวจสอบความยาวข้อความ
    if (data.message.length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: "ข้อความต้องมีอย่างน้อย 10 ตัวอักษร",
        },
        { status: 400 }
      );
    }

    // 6. Log ข้อมูลเพื่อ debug (ในการใช้งานจริงควรลบออก)
    console.log("📧 รับข้อมูลติดต่อใหม่:", {
      name: data.name,
      company: data.company || "ไม่ระบุ",
      email: data.email,
      phone: data.phone,
      subject: data.subject,
      timestamp: new Date().toISOString(),
    });

    // ==========================================
    // TODO: เชื่อมต่อกับ Service ต่างๆ ด้านล่าง
    // ==========================================

    // 7. ส่งอีเมลแจ้งเตือน (ใช้ Nodemailer, SendGrid, หรือ Resend)
    // await sendEmailNotification(data);

    // 8. บันทึกข้อมูลลง Database (ถ้าต้องการ)
    // await saveToDatabase(data);

    // 9. ส่งไปยัง CRM หรือ External API (ถ้าต้องการ)
    // await sendToCRM(data);

    // 10. ส่ง Auto-reply ไปหาผู้ส่ง
    // await sendAutoReply(data.email, data.name);

    // ==========================================

    // 11. ส่ง Response สำเร็จกลับไป
    return NextResponse.json(
      {
        success: true,
        message: "ส่งข้อความสำเร็จ! เราจะติดต่อกลับโดยเร็วที่สุด",
        data: {
          id: `contact_${Date.now()}`, // สร้าง ID ชั่วคราว
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    // จัดการ Error
    console.error("❌ Error in contact API:", error);

    return NextResponse.json(
      {
        success: false,
        error: "เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง",
      },
      { status: 500 }
    );
  }
}

// ==========================================
// ฟังก์ชันตัวอย่างสำหรับส่งอีเมล
// ==========================================

/*
// ติดตั้ง: npm install nodemailer
// ติดตั้ง: npm install -D @types/nodemailer

import nodemailer from "nodemailer";

async function sendEmailNotification(data: ContactFormData) {
  // สร้าง transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // เช่น smtp.gmail.com
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: false, // true สำหรับ port 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // ส่งอีเมลแจ้งเตือนไปหาทีมงาน
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: "marketingcenter@tpppack.com", // อีเมลปลายทาง
    subject: `📩 ติดต่อใหม่: ${data.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">มีผู้ติดต่อใหม่จากเว็บไซต์</h2>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>ชื่อ-นามสกุล:</strong> ${data.name}</p>
          <p><strong>บริษัท/องค์กร:</strong> ${data.company || "ไม่ระบุ"}</p>
          <p><strong>อีเมล:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
          <p><strong>เบอร์โทรศัพท์:</strong> <a href="tel:${data.phone}">${data.phone}</a></p>
          <p><strong>หัวข้อ:</strong> ${data.subject}</p>
        </div>

        <div style="margin: 20px 0;">
          <strong>ข้อความ:</strong>
          <p style="white-space: pre-wrap; background: #fff; padding: 15px; border-left: 4px solid #1e40af; margin-top: 10px;">
            ${data.message}
          </p>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="color: #6b7280; font-size: 12px;">
          ส่งจากเว็บไซต์ Thai Packaging & Printing<br>
          ${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}
        </p>
      </div>
    `,
  });

  console.log("✅ ส่งอีเมลแจ้งเตือนสำเร็จ");
}

async function sendAutoReply(email: string, name: string) {
  const transporter = nodemailer.createTransport({
    // ... config เดียวกับด้านบน
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "ขอบคุณที่ติดต่อ Thai Packaging & Printing",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">สวัสดีคุณ ${name}</h2>
        
        <p>ขอบคุณที่ติดต่อเรา เราได้รับข้อความของคุณแล้ว</p>
        
        <p>ทีมงานของเราจะติดต่อกลับภายใน 1-2 วันทำการ</p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <div style="color: #6b7280; font-size: 14px;">
          <p><strong>บริษัท ไทยบรรจุภัณฑ์และการพิมพ์ จำกัด (มหาชน)</strong></p>
          <p>โทร: (+66) 2-529-0099</p>
          <p>อีเมล: marketingcenter@tpppack.com</p>
        </div>
      </div>
    `,
  });
}
*/

// ==========================================
// ฟังก์ชันตัวอย่างสำหรับใช้ SendGrid
// ==========================================

/*
// ติดตั้ง: npm install @sendgrid/mail

import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

async function sendEmailNotification(data: ContactFormData) {
  await sgMail.send({
    to: "marketingcenter@tpppack.com",
    from: process.env.EMAIL_FROM!, // ต้องเป็นอีเมลที่ verify แล้วใน SendGrid
    subject: `📩 ติดต่อใหม่: ${data.subject}`,
    html: `
      // ... HTML template เดียวกับด้านบน
    `,
  });
}
*/

// ==========================================
// ฟังก์ชันตัวอย่างสำหรับบันทึกลง Database
// ==========================================

/*
// ตัวอย่างใช้ Prisma

import { prisma } from "@/lib/prisma";

async function saveToDatabase(data: ContactFormData) {
  await prisma.contactForm.create({
    data: {
      name: data.name,
      company: data.company,
      email: data.email,
      phone: data.phone,
      subject: data.subject,
      message: data.message,
      createdAt: new Date(),
    },
  });
}
*/

// ==========================================
// Rate Limiting (ป้องกัน spam)
// ==========================================

/*
// ติดตั้ง: npm install @upstash/ratelimit @upstash/redis

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"), // 3 ครั้งต่อชั่วโมง
});

// ใช้งานใน API handler:
const identifier = request.ip ?? "anonymous";
const { success } = await ratelimit.limit(identifier);

if (!success) {
  return NextResponse.json(
    { error: "คุณส่งข้อความบ่อยเกินไป กรุณาลองใหม่ภายหลัง" },
    { status: 429 }
  );
}
*/
