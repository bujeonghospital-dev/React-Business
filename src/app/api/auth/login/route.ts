import { NextRequest, NextResponse } from "next/server";
import { validateEmail } from "@/utils/validateEmail";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";

interface User {
  id: number;
  name: string;
  lname: string | null;
  username: string;
  password: string;
  status_rank: string;
  admin: boolean;
  id_role: number | null;
  id_dep: number | null;
  position: number | null;
  email: string | null;
  token: string | null;
  last_login: Date | null;
  delete_date: Date | null;
  role_name?: string;
  role_tag?: string;
  back_end?: boolean;
  department_name?: string;
  department_name_fix?: string;
  position_name?: string;
}

export async function POST(request: NextRequest) {
  const client = await pool.connect();

  try {
    const body = await request.json();
    const { email, password, rememberMe } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณากรอกอีเมล/ชื่อผู้ใช้และรหัสผ่าน",
        },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
        },
        { status: 400 }
      );
    }

    // Find user by email or username
    const userQuery = `
      SELECT 
        u.*,
        u.name AS fname,
        r.name AS role_name,
        r.tag AS role_tag,
        r.back_end,
        d.name AS department_name_fix,
        d.name_full_th AS department_name,
        p.name_full_th AS position_name
      FROM "user" u
      LEFT JOIN roles r ON u.id_role = r.id_role
      LEFT JOIN department d ON u.id_dep = d.id
      LEFT JOIN "position" p ON u.position = p.id
      WHERE (u.email = $1 OR u.username = $1)
        AND u.delete_date IS NULL
      LIMIT 1
    `;

    console.log("🔍 Searching for user with:", email);
    const userResult = await client.query(userQuery, [email]);
    console.log("📊 Query result:", userResult.rows.length, "rows found");

    if (userResult.rows.length === 0) {
      console.log("❌ User not found for:", email);
      return NextResponse.json(
        { success: false, message: `ไม่พบผู้ใช้งานในระบบ: ${email}` },
        { status: 401 }
      );
    }

    const user: User = userResult.rows[0];

    // Verify password - รองรับทั้ง bcrypt ($2b$) และ PHP password_hash ($2y$)
    let isPasswordValid = false;

    try {
      // แปลง $2y$ (PHP) เป็น $2b$ (Node.js) ถ้าจำเป็น
      const hashToCompare = user.password.startsWith("$2y$")
        ? user.password.replace("$2y$", "$2b$")
        : user.password;

      console.log("🔐 Password input:", password);
      console.log("🔑 Hash from DB:", user.password.substring(0, 20) + "...");
      console.log(
        "🔄 Hash to compare:",
        hashToCompare.substring(0, 20) + "..."
      );

      isPasswordValid = await bcrypt.compare(password, hashToCompare);
      console.log("✅ Password match result:", isPasswordValid);
    } catch (error) {
      console.error("❌ Password verification error:", error);
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "รหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    // Get user avatar
    const avatarQuery = `
      SELECT path, name_file
      FROM parth_file
      WHERE id_ref = $1 
        AND prefix = 'user_img' 
        AND delete_date IS NULL
      LIMIT 1
    `;

    const avatarResult = await client.query(avatarQuery, [user.id]);
    let avatarPath = "/images/user.png";

    if (avatarResult.rows.length > 0) {
      const avatar = avatarResult.rows[0];
      avatarPath = `${avatar.path}${avatar.name_file}`;
    }

    // Generate simple token (ในการใช้งานจริงควรใช้ JWT)
    const token = Buffer.from(
      `${user.id}:${Date.now()}:${Math.random()}`
    ).toString("base64");

    // Update last login and token
    await client.query(
      `UPDATE "user" 
       SET last_login = CURRENT_TIMESTAMP, token = $1 
       WHERE id = $2`,
      [token, user.id]
    );

    // Prepare user data (exclude sensitive info)
    const userData = {
      id: user.id,
      name: user.name,
      lname: user.lname,
      username: user.username,
      email: user.email,
      status_rank: user.status_rank,
      admin: user.admin,
      role_name: user.role_name || "",
      role_tag: user.role_tag || "",
      back_end: user.back_end || false,
      department_name: user.department_name || "ไม่ระบุ",
      department_name_fix: user.department_name_fix || "ไม่ระบุ",
      position_name: user.position_name || "ไม่ระบุ",
      avatar: avatarPath,
    };

    return NextResponse.json({
      success: true,
      message: `ยินดีต้อนรับ ${user.name}`,
      token,
      user: userData,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
