# 🚀 Quick Start - Google Ads Dashboard

## เริ่มต้นใช้งานด่วน (5 นาที)

### 1. เข้าใช้งาน Dashboard

```bash
npm run dev
```

เปิดเบราว์เซอร์และไปที่: **http://localhost:3000/google-ads-dashboard**

Dashboard จะแสดงข้อมูลตัวอย่าง (mock data) ทันที

### 2. ดูข้อมูลที่แสดง

✅ **คลิก (110)** - จำนวนคลิกทั้งหมด  
✅ **การแสดงผล (1.47K)** - จำนวนครั้งที่โฆษณาแสดง  
✅ **CPC เฉลี่ย (฿9.94)** - ราคาเฉลี่ยต่อหนึ่งคลิก  
✅ **ค่าใช้จ่าย (฿1.09K)** - ค่าใช้จ่ายรวม

### 3. Features

- 📊 **4 Summary Cards** พร้อม animation
- 📅 **Date Range Picker** เลือกช่วงเวลา
- 📈 **Campaign Table** แสดงรายละเอียดแต่ละแคมเปญ
- 🔄 **Auto Refresh** รีเฟรชข้อมูลได้
- 📱 **Responsive Design** รองรับทุกอุปกรณ์

---

## 🔌 เชื่อมต่อข้อมูลจริง (ต้องใช้เวลา 30 นาที)

ถ้าต้องการเชื่อมต่อกับ Google Ads จริง ดูรายละเอียดเพิ่มเติมที่:

📖 **[GOOGLE_ADS_DASHBOARD_SETUP.md](./GOOGLE_ADS_DASHBOARD_SETUP.md)**

### สรุปขั้นตอน:

1. ติดตั้ง: `npm install google-ads-api`
2. สร้าง OAuth 2.0 credentials
3. ขอ Developer Token
4. สร้าง Refresh Token
5. ตั้งค่า `.env.local`
6. เปิดใช้งานโค้ดจริงใน `src/app/api/google-ads/route.ts`

---

## 📂 ไฟล์ที่สร้าง

```
src/
├── app/
│   ├── google-ads-dashboard/
│   │   └── page.tsx                      # หน้าหลัก Dashboard
│   └── api/
│       └── google-ads/
│           └── route.ts                  # API endpoint
├── components/
│   └── GoogleAds/
│       ├── MetricCard.tsx                # Card แสดงยอดรวม
│       ├── CampaignTable.tsx             # ตารางแคมเปญ
│       └── DateRangePicker.tsx           # เลือกวันที่
└── types/
    └── google-ads.ts                     # TypeScript types

scripts/
└── generate-google-ads-refresh-token.js  # สร้าง refresh token

GOOGLE_ADS_DASHBOARD_SETUP.md             # คู่มือตั้งค่าแบบละเอียด
GOOGLE_ADS_QUICK_START.md                 # คู่มือเริ่มต้นด่วน
```

---

## 🎨 UI Design Features

### Color Scheme

- **Blue** (คลิก) - #0066ff
- **Green** (การแสดงผล) - #10b981
- **Purple** (CPC) - #8b5cf6
- **Orange** (ค่าใช้จ่าย) - #f59e0b

### Animations

- ✨ Fade in/out
- 🎭 Slide animations
- 📊 Scale effects
- 🔄 Spin on loading

### Responsive Breakpoints

- Mobile: < 768px (1 column)
- Tablet: 768px - 1024px (2 columns)
- Desktop: > 1024px (4 columns)

---

## 🔧 การปรับแต่ง

### เปลี่ยนสีของ Cards

แก้ไขใน `src/components/GoogleAds/MetricCard.tsx`:

```tsx
const colorClasses = {
  blue: { bg: 'from-blue-500 to-blue-600', ... },
  // เพิ่มสีใหม่
  red: { bg: 'from-red-500 to-red-600', ... },
};
```

### เพิ่ม Metrics ใหม่

1. แก้ไข `src/types/google-ads.ts`
2. เพิ่ม field ใน GAQL query
3. เพิ่ม MetricCard ในหน้าหลัก

### เปลี่ยน Date Range เริ่มต้น

แก้ไขใน `src/app/google-ads-dashboard/page.tsx`:

```tsx
const [dateRange, setDateRange] = useState<DateRangeFilter>({
  startDate: "2025-01-01", // เปลี่ยนวันที่เริ่มต้น
  endDate: "2025-04-04", // เปลี่ยนวันที่สิ้นสุด
});
```

---

## 📱 Screenshots

### Desktop View

- 4 columns layout
- Full table with all columns
- Spacious design

### Mobile View

- Single column cards
- Scrollable table
- Touch-friendly buttons

---

## 🐛 Troubleshooting

### หน้าไม่โหลด

```bash
# ลองรีสตาร์ท dev server
npm run dev
```

### ข้อมูลไม่แสดง

- ตรวจสอบ Console ในเบราว์เซอร์ (F12)
- ตรวจสอบว่า API route ทำงาน: http://localhost:3000/api/google-ads

### การ build ไม่สำเร็จ

```bash
# ลบ .next และ node_modules
rm -rf .next node_modules
npm install
npm run build
```

---

## 📚 API Reference

### GET /api/google-ads

**Query Parameters:**

- `startDate` (optional): วันเริ่มต้น (format: YYYY-MM-DD)
- `endDate` (optional): วันสิ้นสุด (format: YYYY-MM-DD)

**Response:**

```json
{
  "campaigns": [
    {
      "id": "12345678901",
      "name": "แคมเปญสินค้า",
      "clicks": 45,
      "impressions": 650,
      "averageCpc": 10.5,
      "cost": 472.5,
      "ctr": 6.92
    }
  ],
  "summary": {
    "totalClicks": 110,
    "totalImpressions": 1470,
    "averageCpc": 9.94,
    "totalCost": 1089.5,
    "averageCtr": 7.88
  },
  "dateRange": {
    "startDate": "2025-01-01",
    "endDate": "2025-04-04"
  }
}
```

---

## 💡 Tips

1. **Performance**: ใช้ cache สำหรับข้อมูลที่ไม่เปลี่ยนบ่อย
2. **Security**: อย่าเปิดเผย API credentials
3. **Rate Limits**: ระวัง rate limits ของ Google Ads API
4. **Data Freshness**: ข้อมูลจาก Google Ads API มีความล่าช้า 3-5 ชั่วโมง

---

## 📞 Support

- 📖 Documentation: [GOOGLE_ADS_DASHBOARD_SETUP.md](./GOOGLE_ADS_DASHBOARD_SETUP.md)
- 🔗 Google Ads API: https://developers.google.com/google-ads/api
- 📧 Issues: Create an issue in the repository

---

## ✅ Checklist

- [x] Dashboard สร้างเสร็จแล้ว
- [x] แสดงข้อมูล mock data ได้
- [x] Responsive design
- [x] Date range picker
- [x] Animations
- [ ] เชื่อมต่อ Google Ads API จริง (optional)
- [ ] Add caching
- [ ] Add error boundaries
- [ ] Add unit tests

---

**สร้างเมื่อ:** พฤศจิกายน 2025  
**เวอร์ชัน:** 1.0.0  
**ความต้องการ:** Next.js 15+, React 19+
