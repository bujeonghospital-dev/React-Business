const bcrypt = require("bcryptjs");

// Hash ที่เก็บใน Supabase (ที่คุณเห็นใน console)
const hashFromDB =
  "$2b$10$eSYOZAnS8bRtyaL9L./zUuEqYQ3qIZWIhrIlYGejq4LAE91Uy44G6";

console.log("=".repeat(60));
console.log("🔍 ตรวจสอบรหัสผ่าน");
console.log("=".repeat(60));

// ทดสอบรหัสผ่านหลายแบบ
const passwords = ["admin1234", "admin123", "Admin1234", "ADMIN1234"];

passwords.forEach((password) => {
  const isMatch = bcrypt.compareSync(password, hashFromDB);
  console.log(`\n🔐 Password: "${password}"`);
  console.log(`✅ Match: ${isMatch ? "✓ ถูกต้อง!" : "✗ ไม่ถูกต้อง"}`);
});

console.log("\n" + "=".repeat(60));
console.log('🔑 สร้าง Hash ใหม่สำหรับ "admin1234"');
console.log("=".repeat(60));

// สร้าง hash ใหม่
const newPassword = "admin1234";
const newHash = bcrypt.hashSync(newPassword, 10);

console.log(`\n📝 Password: ${newPassword}`);
console.log(`🔐 Hash ใหม่: ${newHash}`);
console.log(
  `✅ ทดสอบ Compare: ${
    bcrypt.compareSync(newPassword, newHash) ? "✓ ถูกต้อง!" : "✗ ผิดพลาด"
  }`
);

console.log("\n" + "=".repeat(60));
console.log("📋 คำสั่ง SQL สำหรับอัพเดท Supabase:");
console.log("=".repeat(60));
console.log(`\nUPDATE "user" 
SET password = '${newHash}'
WHERE email = 'admin@example.com';`);

console.log("\n" + "=".repeat(60));
