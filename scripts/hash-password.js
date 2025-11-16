const bcrypt = require("bcryptjs");

// สร้างรหัสผ่านที่เข้ารหัสแล้ว
const password = "admin123"; // เปลี่ยนเป็นรหัสผ่านที่ต้องการ
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);

console.log("========================================");
console.log("Password Hash Generator");
console.log("========================================");
console.log("Password:", password);
console.log("Hash:", hash);
console.log("========================================");
console.log("\nCopy hash นี้ไปใส่ในฐานข้อมูล:\n");
console.log(hash);
console.log("\n========================================");
