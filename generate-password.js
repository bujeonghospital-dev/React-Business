const bcrypt = require("bcryptjs");

// สร้าง hash ใหม่สำหรับ password: admin123
const password = "admin123";
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);

console.log("========================================");
console.log("Password:", password);
console.log("New Hash:", hash);
console.log("========================================");
console.log("\nSQL Command:");
console.log(
  `UPDATE "user" SET password = '${hash}' WHERE email = 'admin@example.com';`
);
console.log("========================================");

// ทดสอบว่า compare ได้ไหม
const isMatch = bcrypt.compareSync(password, hash);
console.log("\nTest Compare:", isMatch ? "✅ PASS" : "❌ FAIL");
