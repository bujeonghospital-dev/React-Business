const bcrypt = require("bcryptjs");

// Hash จาก Supabase (ที่คุณเห็นใน console log)
const currentHash =
  "$2b$10$eSYOZAnS8bRtyaL9L./zUuEqYQ3qIZWIhrIlYGejq4LAE91Uy44G6";

console.log("🔍 ทดสอบรหัสผ่านกับ Hash ที่มีอยู่:\n");

// ลองรหัสผ่านต่างๆ
const testPasswords = [
  "admin123",
  "admin1234",
  "Admin123",
  "Admin1234",
  "password",
  "123456",
];

let found = false;
testPasswords.forEach((pwd) => {
  const match = bcrypt.compareSync(pwd, currentHash);
  console.log(
    `${match ? "✅" : "❌"} "${pwd}": ${match ? "ถูกต้อง!" : "ไม่ตรงกัน"}`
  );
  if (match) found = true;
});

if (!found) {
  console.log("\n⚠️  ไม่มีรหัสผ่านไหนตรงกับ Hash นี้!");
  console.log('💡 ต้องสร้าง Hash ใหม่สำหรับ "admin1234"\n');

  // สร้าง hash ใหม่
  const correctPassword = "admin1234";
  const correctHash = bcrypt.hashSync(correctPassword, 10);

  console.log('🔑 Hash ใหม่สำหรับ "admin1234":');
  console.log(correctHash);
  console.log(
    "\n✅ ทดสอบ:",
    bcrypt.compareSync(correctPassword, correctHash) ? "ถูกต้อง!" : "ผิด"
  );

  console.log("\n📋 SQL Command สำหรับ Supabase:");
  console.log("─".repeat(60));
  console.log(
    `UPDATE "user" SET password = '${correctHash}' WHERE email = 'admin@example.com';`
  );
  console.log("─".repeat(60));
}
