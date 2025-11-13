import { NextRequest, NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/utils/supabase/server";

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

// GET - Retrieve single contact by ID from Supabase
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Supabase is not configured" },
        { status: 500 }
      );
    }

    const { id } = await params;

    const { data, error } = await supabase
      .from("customer_contacts")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        {
          success: false,
          error: "Contact not found",
        },
        { status: 404 }
      );
    }

    // Transform data
    const transformedData = {
      id: data.id,
      name: data.name,
      company: data.company,
      phone: data.phone,
      email: data.email || "",
      status: data.status,
      lastContact: data.last_contact,
      notes: data.notes || "",
      createdAt: data.created_at,
    };

    return NextResponse.json({
      success: true,
      data: transformedData,
    });
  } catch (error: any) {
    console.error("❌ Server Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch contact",
      },
      { status: 500 }
    );
  }
}

// PUT - Update contact by ID in Supabase
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Supabase is not configured" },
        { status: 500 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.phone) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: name, phone",
        },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (body.email) {
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
    }

    // Update in Supabase
    const { data, error } = await supabase
      .from("customer_contacts")
      .update({
        name: body.name,
        company: body.company || "",
        phone: body.phone,
        email: body.email || null,
        status: body.status,
        notes: body.notes || null,
        last_contact: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      console.error("❌ Supabase Update Error:", error);
      return NextResponse.json(
        {
          success: false,
          error: error?.message || "Contact not found",
        },
        { status: error?.code === "PGRST116" ? 404 : 500 }
      );
    }

    // Transform response
    const transformedData = {
      id: data.id,
      name: data.name,
      company: data.company,
      phone: data.phone,
      email: data.email || "",
      status: data.status,
      lastContact: data.last_contact,
      notes: data.notes || "",
      createdAt: data.created_at,
    };

    return NextResponse.json({
      success: true,
      data: transformedData,
      message: "Contact updated successfully",
    });
  } catch (error: any) {
    console.error("❌ Server Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update contact",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete contact by ID from Supabase
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Supabase is not configured" },
        { status: 500 }
      );
    }

    const { id } = await params;

    const { data, error } = await supabase
      .from("customer_contacts")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        {
          success: false,
          error: "Contact not found",
        },
        { status: 404 }
      );
    }

    // Transform response
    const transformedData = {
      id: data.id,
      name: data.name,
      company: data.company,
      phone: data.phone,
      email: data.email || "",
      status: data.status,
      lastContact: data.last_contact,
      notes: data.notes || "",
      createdAt: data.created_at,
    };

    return NextResponse.json({
      success: true,
      data: transformedData,
      message: "Contact deleted successfully",
    });
  } catch (error: any) {
    console.error("❌ Server Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete contact",
      },
      { status: 500 }
    );
  }
}
