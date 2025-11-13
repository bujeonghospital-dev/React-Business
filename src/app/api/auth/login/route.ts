import { NextRequest, NextResponse } from 'next/server';
import { validateEmail } from '@/utils/validateEmail';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, rememberMe } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'กรุณากรอกอีเมลและรหัสผ่าน',
        },
        { status: 400 }
      );
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          message: 'รูปแบบอีเมลไม่ถูกต้อง',
        },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
        },
        { status: 400 }
      );
    }

    // Mock authentication - Replace with real authentication logic
    // For demo purposes, accept any email/password combination
    const mockUser = {
      id: '1',
      email: email,
      name: email.split('@')[0],
      avatar: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=dc2626&color=fff`,
    };

    const mockToken = 'mock-jwt-token-' + Date.now();

    // In production, you would:
    // 1. Query database for user with this email
    // 2. Compare hashed passwords
    // 3. Generate real JWT token
    // 4. Set secure HTTP-only cookie
    // 5. Return user data

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return NextResponse.json(
      {
        success: true,
        message: 'เข้าสู่ระบบสำเร็จ',
        user: mockUser,
        token: mockToken,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง',
      },
      { status: 500 }
    );
  }
}
