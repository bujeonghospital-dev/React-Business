import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    // DROP ตารางเก่า
    const dropTableSQL = `DROP TABLE IF EXISTS customers CASCADE;`;

    // SQL สำหรับสร้างตาราง customers ใหม่
    const createTableSQL = `
      CREATE TABLE customers (
        id BIGSERIAL PRIMARY KEY,
        
        -- ข้อมูลพื้นฐาน
        status TEXT,
        source TEXT,
        interested_product TEXT,
        doctor TEXT,
        contact_staff TEXT,
        customer_name TEXT,
        phone TEXT,
        note TEXT,
        
        -- วันที่ต่างๆ
        last_followup TEXT,
        next_followup TEXT,
        consult_date TEXT,
        surgery_date TEXT,
        appointment_time TEXT,
        got_contact_date TEXT,
        booked_consult_date TEXT,
        booked_surgery_date TEXT,
        
        -- ข้อมูลทางการเงินและรหัส
        proposed_amount TEXT,
        customer_code TEXT,
        star_flag TEXT,
        
        -- ข้อมูลสถานที่
        country TEXT,
        car_call_time TEXT,
        lat DOUBLE PRECISION,
        long DOUBLE PRECISION,
        
        -- ข้อมูลเพิ่มเติม
        photo_note TEXT,
        gender TEXT,
        age INTEGER,
        occupation TEXT,
        from_province TEXT,
        travel_method TEXT,
        
        -- ข้อมูลการติดต่อ
        contact_prefer_date TEXT,
        contact_prefer_time TEXT,
        free_program TEXT,
        
        -- ข้อมูล Google Calendar
        event_id TEXT,
        html_link TEXT,
        ical_uid TEXT,
        log TEXT,
        
        -- ข้อมูล Doctor Calendar
        doc_calendar TEXT,
        doc_event_id TEXT,
        doc_html_link TEXT,
        doc_ical_uid TEXT,
        
        -- ข้อมูล LINE
        line_note TEXT,
        line_doctor_note TEXT,
        
        -- ข้อมูลการโทร
        ivr TEXT,
        transfer_to TEXT,
        status_call TEXT,
        
        -- Timestamps
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- สร้าง index สำหรับการค้นหาที่เร็วขึ้น
      CREATE INDEX idx_customer_status ON customers(status);
      CREATE INDEX idx_customer_contact ON customers(contact_staff);
      CREATE INDEX idx_customer_phone ON customers(phone);
      CREATE INDEX idx_customer_consult_date ON customers(consult_date);
      CREATE INDEX idx_customer_surgery_date ON customers(surgery_date);
      CREATE INDEX idx_customer_next_followup ON customers(next_followup);
      CREATE INDEX idx_customer_name ON customers(customer_name);
      CREATE INDEX idx_customer_code ON customers(customer_code);
    `;

    // สร้าง trigger function
    const createTriggerFunctionSQL = `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `;

    // สร้าง trigger
    const createTriggerSQL = `
      CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `;

    // รัน SQL commands
    await pool.query(dropTableSQL);
    console.log("✓ Old table dropped successfully");

    await pool.query(createTableSQL);
    console.log("✓ New table created successfully");

    await pool.query(createTriggerFunctionSQL);
    console.log("✓ Trigger function created successfully");

    await pool.query(createTriggerSQL);
    console.log("✓ Trigger created successfully");

    return NextResponse.json({
      success: true,
      message: "Database recreated successfully",
      details: {
        table: "customers",
        columns: 45,
        indexes: [
          "idx_customer_status",
          "idx_customer_contact",
          "idx_customer_phone",
          "idx_customer_consult_date",
          "idx_customer_surgery_date",
          "idx_customer_next_followup",
          "idx_customer_name",
          "idx_customer_code",
        ],
        trigger: "update_customers_updated_at",
      },
    });
  } catch (error: any) {
    console.error("Database recreate error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to recreate database",
        details: error.stack,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Use POST method to recreate database",
    warning: "This will DROP the existing customers table and recreate it",
    instructions:
      "Send a POST request to this endpoint to drop and recreate the customers table",
  });
}
