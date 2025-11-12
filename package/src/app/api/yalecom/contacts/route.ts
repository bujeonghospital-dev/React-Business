import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/yalecom/contacts
 * ดึงข้อมูลการติดต่อจาก Yalecom API
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // TODO: เชื่อมต่อกับ Yalecom API จริง
    // ตอนนี้ใช้ Mock Data ก่อน

    const mockContacts = [
      {
        id: "1",
        customerName: "คุณสมชาย ใจดี",
        phoneNumber: "089-123-4567",
        remarks: "สนใจผลิตภัณฑ์บรรจุภัณฑ์",
        status: "incoming",
        contactDate: new Date().toISOString(),
        company: "บริษัท ABC จำกัด",
        email: "somchai@abc.com",
      },
      {
        id: "2",
        customerName: "คุณสมหญิง รักษ์ดี",
        phoneNumber: "081-234-5678",
        remarks: "ติดตามผลการสั่งซื้อ",
        status: "outgoing",
        contactDate: new Date().toISOString(),
        company: "บริษัท XYZ จำกัด",
        email: "somying@xyz.com",
      },
      {
        id: "3",
        customerName: "คุณประภาส สว่างไสว",
        phoneNumber: "092-345-6789",
        remarks: "ขอใบเสนอราคา",
        status: "pending",
        contactDate: new Date().toISOString(),
      },
      {
        id: "4",
        customerName: "คุณวิชัย มั่นคง",
        phoneNumber: "085-456-7890",
        remarks: "สอบถามข้อมูลสินค้า",
        status: "completed",
        contactDate: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "5",
        customerName: "คุณนิภา สดใส",
        phoneNumber: "094-567-8901",
        remarks: "ขอดูตัวอย่างสินค้า",
        status: "incoming",
        contactDate: new Date().toISOString(),
        company: "ร้านค้าปลีก 123",
      },
    ];

    // Filter by status if provided
    let filteredContacts = mockContacts;
    if (status && status !== "all") {
      filteredContacts = filteredContacts.filter((c) => c.status === status);
    }

    // Filter by search if provided
    if (search) {
      const searchLower = search.toLowerCase();
      filteredContacts = filteredContacts.filter(
        (c) =>
          c.customerName.toLowerCase().includes(searchLower) ||
          c.phoneNumber.includes(search) ||
          c.remarks.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredContacts,
      total: filteredContacts.length,
    });
  } catch (error) {
    console.error("Error fetching Yalecom contacts:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch contacts",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/yalecom/contacts
 * สร้างรายการติดต่อใหม่
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.customerName || !body.phoneNumber) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          message: "customerName and phoneNumber are required",
        },
        { status: 400 }
      );
    }

    // TODO: บันทึกข้อมูลลง Database หรือ Yalecom API
    // ตอนนี้ส่งกลับข้อมูลที่ได้รับมา

    const newContact = {
      id: Date.now().toString(),
      customerName: body.customerName,
      phoneNumber: body.phoneNumber,
      remarks: body.remarks || "",
      status: body.status || "pending",
      contactDate: new Date().toISOString(),
      company: body.company,
      email: body.email,
    };

    return NextResponse.json({
      success: true,
      data: newContact,
      message: "Contact created successfully",
    });
  } catch (error) {
    console.error("Error creating contact:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create contact",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
