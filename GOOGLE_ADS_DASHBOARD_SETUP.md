# Google Ads Dashboard Setup Guide

## 📋 ภาพรวม

หน้า Google Ads Dashboard ที่สร้างขึ้นจะแสดงข้อมูลจาก Google Ads API ดังนี้:

### ข้อมูลที่แสดง:

- **คลิก (Clicks)** - จำนวนครั้งที่มีการคลิกโฆษณา
- **การแสดงผล (Impressions)** - จำนวนครั้งที่โฆษณาแสดง
- **CPC เฉลี่ย (Average CPC)** - ราคาเฉลี่ยต่อหนึ่งคลิก
- **ค่าใช้จ่าย (Cost)** - ค่าใช้จ่ายทั้งหมด
- **CTR (Click-Through Rate)** - อัตราการคลิกต่อการแสดงผล

## 🚀 การใช้งาน

### ขั้นตอนที่ 1: ติดตั้ง Google Ads API Library

```bash
npm install google-ads-api
```

### ขั้นตอนที่ 2: สร้าง Google Ads API Credentials

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. สร้าง Project ใหม่หรือเลือก Project ที่มีอยู่
3. เปิดใช้งาน Google Ads API
4. สร้าง OAuth 2.0 Credentials:
   - ไปที่ "Credentials" > "Create Credentials" > "OAuth 2.0 Client ID"
   - เลือก "Web application"
   - เพิ่ม Authorized redirect URIs: `http://localhost:3000/oauth2callback`
5. บันทึก Client ID และ Client Secret

### ขั้นตอนที่ 3: ขอ Developer Token

1. ไปที่ [Google Ads API Center](https://ads.google.com/aw/apicenter)
2. คลิก "Apply for Basic Access"
3. รอการอนุมัติ (อาจใช้เวลา 1-2 วัน)
4. บันทึก Developer Token

### ขั้นตอนที่ 4: สร้าง Refresh Token

สร้างสคริปต์สำหรับสร้าง Refresh Token:

```javascript
// scripts/generate-refresh-token.js
const { OAuth2Client } = require("google-auth-library");
const readline = require("readline");

const oauth2Client = new OAuth2Client(
  "YOUR_CLIENT_ID",
  "YOUR_CLIENT_SECRET",
  "http://localhost:3000/oauth2callback"
);

const scopes = ["https://www.googleapis.com/auth/adwords"];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: scopes,
});

console.log("Authorize this app by visiting this url:", authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter the code from that page here: ", async (code) => {
  rl.close();
  const { tokens } = await oauth2Client.getToken(code);
  console.log("Refresh Token:", tokens.refresh_token);
});
```

รันสคริปต์:

```bash
node scripts/generate-refresh-token.js
```

### ขั้นตอนที่ 5: ตั้งค่า Environment Variables

สร้างไฟล์ `.env.local` ในโฟลเดอร์ root:

```env
# Google Ads API Configuration
GOOGLE_ADS_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_ADS_CLIENT_SECRET=xxx
GOOGLE_ADS_DEVELOPER_TOKEN=xxx
GOOGLE_ADS_REFRESH_TOKEN=xxx
GOOGLE_ADS_CUSTOMER_ID=xxx-xxx-xxxx
```

**หมายเหตุ:**

- `GOOGLE_ADS_CUSTOMER_ID` คือ Customer ID ของบัญชี Google Ads (รูปแบบ: xxx-xxx-xxxx)
- ค้นหาได้จากมุมขวาบนของ Google Ads UI

### ขั้นตอนที่ 6: เปิดใช้งานโค้ดจริง

แก้ไขไฟล์ `src/app/api/google-ads/route.ts`:

1. เปิดคอมเมนต์ส่วนของการ import Google Ads API
2. เปิดคอมเมนต์โค้ดตัวอย่างที่มีการเชื่อมต่อจริง
3. ลบโค้ด mock data ออก

## 📊 GAQL (Google Ads Query Language)

### ตัวอย่าง Query พื้นฐาน:

```sql
SELECT
  campaign.id,
  campaign.name,
  metrics.clicks,
  metrics.impressions,
  metrics.average_cpc,
  metrics.cost_micros,
  metrics.ctr
FROM campaign
WHERE segments.date BETWEEN '2025-01-01' AND '2025-04-04'
```

### Fields ที่สำคัญ:

| Field                 | คำอธิบาย       | หน่วย                      |
| --------------------- | -------------- | -------------------------- |
| `campaign.id`         | ID ของแคมเปญ   | String                     |
| `campaign.name`       | ชื่อแคมเปญ     | String                     |
| `metrics.clicks`      | จำนวนคลิก      | Number                     |
| `metrics.impressions` | จำนวนการแสดงผล | Number                     |
| `metrics.average_cpc` | CPC เฉลี่ย     | Micros (1,000,000 = 1 THB) |
| `metrics.cost_micros` | ค่าใช้จ่าย     | Micros                     |
| `metrics.ctr`         | CTR            | Decimal (0.05 = 5%)        |

### การแปลงหน่วย:

```javascript
// Micros to THB
const costInTHB = cost_micros / 1000000;
const cpcInTHB = average_cpc / 1000000;

// CTR to Percentage
const ctrPercentage = ctr * 100;
```

## 🎨 การออกแบบ UI

Dashboard ประกอบด้วย:

1. **Header** - แสดงชื่อและปุ่มรีเฟรช
2. **Date Range Picker** - เลือกช่วงเวลาที่ต้องการดูข้อมูล
3. **Summary Cards** (4 cards):
   - คลิก (สีน้ำเงิน)
   - การแสดงผล (สีเขียว)
   - CPC เฉลี่ย (สีม่วง)
   - ค่าใช้จ่าย (สีส้ม)
4. **Campaign Table** - ตารางแสดงรายละเอียดแต่ละแคมเปญ
5. **Info Section** - ข้อมูลการเชื่อมต่อและคำแนะนำ

## 📱 Responsive Design

- **Mobile**: Cards แสดงแบบ 1 คอลัมน์
- **Tablet**: Cards แสดงแบบ 2 คอลัมน์
- **Desktop**: Cards แสดงแบบ 4 คอลัมน์

## 🔧 การปรับแต่ง

### เพิ่ม Metrics เพิ่มเติม:

แก้ไขไฟล์ `src/types/google-ads.ts`:

```typescript
export interface GoogleAdsCampaign {
  // ... existing fields
  conversions?: number;
  conversionRate?: number;
  costPerConversion?: number;
}
```

แก้ไข GAQL Query:

```sql
SELECT
  campaign.id,
  campaign.name,
  metrics.clicks,
  metrics.impressions,
  metrics.average_cpc,
  metrics.cost_micros,
  metrics.ctr,
  metrics.conversions,
  metrics.cost_per_conversion
FROM campaign
WHERE segments.date BETWEEN '2025-01-01' AND '2025-04-04'
```

## 🚦 การทดสอบ

### ใช้ Mock Data (ค่าเริ่มต้น):

เข้าไปที่: `http://localhost:3000/google-ads-dashboard`

Dashboard จะใช้ข้อมูลตัวอย่างที่สร้างไว้

### ทดสอบกับข้อมูลจริง:

1. ตั้งค่า Environment Variables
2. เปิดใช้งานโค้ดจริงใน API Route
3. Restart development server
4. เข้าไปที่ Dashboard

## 🐛 การแก้ไขปัญหา

### ปัญหา: "Invalid customer ID"

- ตรวจสอบว่า Customer ID อยู่ในรูปแบบที่ถูกต้อง (xxx-xxx-xxxx)
- ลบเครื่องหมาย `-` ออกใน API call

### ปัญหา: "Authentication error"

- ตรวจสอบ Client ID และ Client Secret
- สร้าง Refresh Token ใหม่

### ปัญหา: "Developer token invalid"

- ตรวจสอบว่า Developer Token ถูกอนุมัติแล้ว
- ตรวจสอบว่าใช้ Token ที่ถูกต้อง

## 📚 Resources

- [Google Ads API Documentation](https://developers.google.com/google-ads/api)
- [GAQL Reference](https://developers.google.com/google-ads/api/docs/query/overview)
- [Metrics Reference](https://developers.google.com/google-ads/api/fields/v17/metrics)
- [google-ads-api npm package](https://www.npmjs.com/package/google-ads-api)

## 📝 หมายเหตุ

- ข้อมูลจาก Google Ads API มีความล่าช้าประมาณ 3-5 ชั่วโมง
- ควรใช้ cache เพื่อลดจำนวนการเรียก API
- Google Ads API มี Rate Limits ตรวจสอบที่ [Quota Guidelines](https://developers.google.com/google-ads/api/docs/best-practices/quotas)
