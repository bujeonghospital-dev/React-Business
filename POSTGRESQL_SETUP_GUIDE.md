# PostgreSQL Database Setup Guide

## การตั้งค่า PostgreSQL Database

### ข้อมูลการเชื่อมต่อ

- **Host**: 192.168.1.19
- **Port**: 5432
- **User**: postgres
- **Password**: Bjh12345!!
- **Database**: postgres

### ขั้นตอนการติดตั้ง

#### 1. สร้างตาราง customers ในฐานข้อมูล

เชื่อมต่อไปยัง PostgreSQL และรัน SQL script:

```bash
psql -h 192.168.1.19 -p 5432 -U postgres -d postgres -f database-schema.sql
```

หรือคัดลอกคำสั่ง SQL จากไฟล์ `database-schema.sql` และรันใน pgAdmin หรือ SQL client อื่นๆ

#### 2. ติดตั้ง Dependencies

```bash
npm install pg @types/pg
```

#### 3. ไฟล์ที่สร้างขึ้น

- **`src/lib/db.ts`**: Database connection pool สำหรับเชื่อมต่อ PostgreSQL
- **`src/app/api/customer-data/route.ts`**: API endpoint สำหรับจัดการข้อมูลลูกค้า
- **`database-schema.sql`**: SQL script สำหรับสร้างตารางและ indexes

### API Endpoints

#### GET /api/customer-data

ดึงข้อมูลลูกค้าทั้งหมด

**Response:**

```json
{
  "success": true,
  "data": {
    "all_data": [
      ["id", "สถานะ", "ชื่อ", "เบอร์โทร", ...],
      [1, "ติดตาม", "ชื่อลูกค้า", "0812345678", ...],
      ...
    ]
  },
  "totalRecords": 100
}
```

#### POST /api/customer-data

จัดการข้อมูลลูกค้า (Create, Update, Delete)

**Update Customer:**

```json
{
  "action": "update",
  "data": {
    "id": 1,
    "สถานะ": "นัดแล้ว",
    "หมายเหตุ": "อัพเดทข้อมูล"
  }
}
```

**Create Customer:**

```json
{
  "action": "create",
  "data": {
    "สถานะ": "ติดตาม",
    "ชื่อ": "ลูกค้าใหม่",
    "เบอร์โทร": "0812345678",
    "ผู้ติดต่อ": "สา"
  }
}
```

**Delete Customer:**

```json
{
  "action": "delete",
  "data": {
    "id": 1
  }
}
```

### การใช้งาน

1. **เริ่มต้น Development Server:**

```bash
npm run dev
```

2. **เข้าถึงหน้า Customer All Data:**

```
http://localhost:3000/customer-all-data
```

3. **ตรวจสอบการเชื่อมต่อ:**
   ตรวจสอบ console ใน terminal ว่ามีข้อความ "Connected to PostgreSQL database"

### โครงสร้างตาราง customers

| Column Name             | Type          | Description              |
| ----------------------- | ------------- | ------------------------ |
| id                      | SERIAL        | Primary Key              |
| สถานะ                   | VARCHAR(255)  | สถานะลูกค้า              |
| แหล่งที่มา              | VARCHAR(255)  | แหล่งที่มาของลูกค้า      |
| ผลิตภัณฑ์ที่สนใจ        | TEXT          | ผลิตภัณฑ์ที่ลูกค้าสนใจ   |
| หมอ                     | VARCHAR(255)  | ชื่อหมอที่รับผิดชอบ      |
| ผู้ติดต่อ               | VARCHAR(255)  | ผู้ติดต่อ                |
| ชื่อ                    | VARCHAR(255)  | ชื่อลูกค้า               |
| เบอร์โทร                | VARCHAR(50)   | เบอร์โทรศัพท์            |
| หมายเหตุ                | TEXT          | หมายเหตุเพิ่มเติม        |
| วันที่ติดตามครั้งล่าสุด | DATE          | วันที่ติดตามล่าสุด       |
| วันที่ติดตามครั้งถัดไป  | DATE          | วันที่ติดตามครั้งถัดไป   |
| วันที่ Consult          | DATE          | วันที่นัด Consult        |
| วันที่ผ่าตัด            | DATE          | วันที่ผ่าตัด             |
| เวลาที่นัด              | TIME          | เวลาที่นัด               |
| วันที่ได้ชื่อ เบอร์     | DATE          | วันที่ได้รับชื่อและเบอร์ |
| วันที่ได้นัด consult    | DATE          | วันที่ได้รับนัด Consult  |
| วันที่ได้นัดผ่าตัด      | DATE          | วันที่ได้รับนัดผ่าตัด    |
| ยอดนำเสนอ               | DECIMAL(10,2) | ยอดเงินที่นำเสนอ         |
| รหัสลูกค้า              | VARCHAR(100)  | รหัสลูกค้า               |
| ติดดาว                  | VARCHAR(50)   | การติดดาว                |
| ประเทศ                  | VARCHAR(100)  | ประเทศ                   |
| เวลาให้เรียกรถ          | TIME          | เวลาให้เรียกรถ           |
| Lat                     | DECIMAL(10,8) | ละติจูด                  |
| Long                    | DECIMAL(11,8) | ลองจิจูด                 |
| created_at              | TIMESTAMP     | วันที่สร้างข้อมูล        |
| updated_at              | TIMESTAMP     | วันที่อัพเดทข้อมูล       |

### Indexes

ระบบได้สร้าง indexes สำหรับเพิ่มประสิทธิภาพการค้นหา:

- `idx_customer_status`: สำหรับค้นหาตามสถานะ
- `idx_customer_contact`: สำหรับค้นหาตามผู้ติดต่อ
- `idx_customer_phone`: สำหรับค้นหาตามเบอร์โทร
- `idx_customer_consult_date`: สำหรับค้นหาตามวันที่ Consult
- `idx_customer_surgery_date`: สำหรับค้นหาตามวันที่ผ่าตัด
- `idx_customer_follow_up_next`: สำหรับค้นหาตามวันที่ติดตามครั้งถัดไป

### การ Migrate ข้อมูลจาก Google Sheets

หากต้องการย้ายข้อมูลจาก Google Sheets มายัง PostgreSQL:

1. Export ข้อมูลจาก Google Sheets เป็น CSV
2. ใช้คำสั่ง `COPY` ใน PostgreSQL:

```sql
COPY customers("สถานะ", "ชื่อ", "เบอร์โทร", "ผู้ติดต่อ", ...)
FROM '/path/to/your/data.csv'
DELIMITER ','
CSV HEADER;
```

### Troubleshooting

#### ไม่สามารถเชื่อมต่อ Database ได้

1. ตรวจสอบว่า PostgreSQL กำลังทำงานอยู่
2. ตรวจสอบ firewall settings
3. ตรวจสอบว่า PostgreSQL ยอมรับ connections จากภายนอก
4. ตรวจสอบไฟล์ `pg_hba.conf` สำหรับ authentication settings

#### Error: "relation customers does not exist"

รัน SQL script `database-schema.sql` เพื่อสร้างตาราง

#### Error: Permission denied

ตรวจสอบว่า user 'postgres' มีสิทธิ์ในการเข้าถึงตาราง

### Security Note

⚠️ **คำเตือน**: อย่า commit ข้อมูล credentials (password, host) ไปยัง Git repository ในโปรดักชั่น ควรใช้ environment variables แทน

สร้างไฟล์ `.env.local`:

```
DB_HOST=192.168.1.19
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=Bjh12345!!
DB_NAME=postgres
```

แล้วอัพเดทไฟล์ `src/lib/db.ts`:

```typescript
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // ...
});
```
