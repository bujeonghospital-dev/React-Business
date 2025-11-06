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

// In-memory storage (ต้องเหมือนกับ route.ts หลัก)
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
];

// GET - Retrieve single contact by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const contact = contacts.find((c) => c.id === id);

    if (!contact) {
      return NextResponse.json(
        {
          success: false,
          error: "Contact not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error("Error fetching contact:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch contact",
      },
      { status: 500 }
    );
  }
}

// PUT - Update contact by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const contactIndex = contacts.findIndex((c) => c.id === id);

    if (contactIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: "Contact not found",
        },
        { status: 404 }
      );
    }

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

    // Update contact
    const updatedContact: ContactRecord = {
      ...contacts[contactIndex],
      name: body.name,
      company: body.company || "",
      phone: body.phone,
      email: body.email,
      status: body.status || contacts[contactIndex].status,
      lastContact: new Date().toISOString(),
      notes: body.notes || "",
    };

    contacts[contactIndex] = updatedContact;

    return NextResponse.json({
      success: true,
      data: updatedContact,
      message: "Contact updated successfully",
    });
  } catch (error) {
    console.error("Error updating contact:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update contact",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete contact by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const contactIndex = contacts.findIndex((c) => c.id === id);

    if (contactIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: "Contact not found",
        },
        { status: 404 }
      );
    }

    // Remove contact
    const deletedContact = contacts.splice(contactIndex, 1)[0];

    return NextResponse.json({
      success: true,
      data: deletedContact,
      message: "Contact deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting contact:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete contact",
      },
      { status: 500 }
    );
  }
}
