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

// GET - Retrieve all contacts from Supabase
export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Supabase is not configured" },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let query = supabase
      .from("customer_contacts")
      .select("*")
      .order("created_at", { ascending: false });

    // Filter by status
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    // Filter by search query (search in name, company, phone, email)
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,company.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("❌ Supabase Error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Transform data to match frontend interface
    const transformedData = data.map((contact: any) => ({
      id: contact.id,
      name: contact.name,
      company: contact.company,
      phone: contact.phone,
      email: contact.email || "",
      status: contact.status,
      lastContact: contact.last_contact,
      notes: contact.notes || "",
      createdAt: contact.created_at,
    }));

    return NextResponse.json({
      success: true,
      data: transformedData,
      total: transformedData.length,
    });
  } catch (error: any) {
    console.error("❌ Server Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch contacts",
      },
      { status: 500 }
    );
  }
}

// POST - Create new contact in Supabase
export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Supabase is not configured" },
        { status: 500 }
      );
    }

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

    // Insert into Supabase
    const { data, error } = await supabase
      .from("customer_contacts")
      .insert([
        {
          name: body.name,
          company: body.company || "",
          phone: body.phone,
          email: body.email || null,
          status: body.status || "waiting",
          notes: body.notes || null,
          last_contact: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("❌ Supabase Insert Error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
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

    return NextResponse.json(
      {
        success: true,
        data: transformedData,
        message: "Contact created successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Server Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create contact",
      },
      { status: 500 }
    );
  }
}
