import { NextRequest, NextResponse } from "next/server";

// Types
interface ContactRecord {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  status: "outgoing" | "received" | "waiting" | "sale";
  lastContact: string;
  notes: string;
  createdAt: string;
}

// In-memory storage (ในการใช้งานจริง ควรใช้ Database)
let contacts: ContactRecord[] = [
  {
    id: "1",
    name: "คุณสมชาย ใจดี",
    company: "บริษัท ABC จำกัด",
    phone: "089-xxx-xxxx",
    email: "somchai@abc.com",
    status: "outgoing",
    lastContact: new Date().toISOString(),
    notes: "สอบถามเกี่ยวกับราคาสินค้า",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "2",
    name: "คุณสมหญิง รักดี",
    company: "บริษัท XYZ จำกัด",
    phone: "081-xxx-xxxx",
    email: "somying@xyz.com",
    status: "received",
    lastContact: new Date(Date.now() - 3600000).toISOString(),
    notes: "ต้องการข้อมูลเพิ่มเติม",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

// GET - Retrieve all contacts
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let filteredContacts = [...contacts];

    // Filter by status
    if (status && status !== "all") {
      filteredContacts = filteredContacts.filter((c) => c.status === status);
    }

    // Filter by search query
    if (search) {
      const searchLower = search.toLowerCase();
      filteredContacts = filteredContacts.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.company.toLowerCase().includes(searchLower) ||
          c.phone.includes(search) ||
          c.email.toLowerCase().includes(searchLower)
      );
    }

    // Sort by last contact date (most recent first)
    filteredContacts.sort(
      (a, b) =>
        new Date(b.lastContact).getTime() - new Date(a.lastContact).getTime()
    );

    return NextResponse.json({
      success: true,
      data: filteredContacts,
      total: filteredContacts.length,
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch contacts",
      },
      { status: 500 }
    );
  }
}

// POST - Create new contact
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.phone || !body.email) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: name, phone, email",
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email format",
        },
        { status: 400 }
      );
    }

    // Create new contact
    const newContact: ContactRecord = {
      id: Date.now().toString(),
      name: body.name,
      company: body.company || "",
      phone: body.phone,
      email: body.email,
      status: body.status || "waiting",
      lastContact: new Date().toISOString(),
      notes: body.notes || "",
      createdAt: new Date().toISOString(),
    };

    contacts.push(newContact);

    return NextResponse.json(
      {
        success: true,
        data: newContact,
        message: "Contact created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating contact:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create contact",
      },
      { status: 500 }
    );
  }
}
