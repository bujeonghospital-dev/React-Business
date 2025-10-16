# ✅ สรุปการแก้ไขให้ใช้งานได้

## สิ่งที่ได้แก้ไขแล้ว

### 1. ✅ เปลี่ยนจาก Direct API → Proxy API

- **เดิม:** เรียก `https://marketplace.set.or.th/api/public/realtime-data/stock` โดยตรง (มีปัญหา CORS)
- **ใหม่:** เรียก `/api/stock` ผ่าน Next.js API Route (แก้ CORS แล้ว)

### 2. ✅ เพิ่ม Error Handling

- แสดงข้อความ error ที่ชัดเจน
- มี Loading state
- มีข้อความเมื่อไม่มีข้อมูล

### 3. ✅ สร้าง Mock Data (สำรอง)

- สร้างไฟล์ `src/data/mockStockData.ts`
- ใช้ได้เมื่อ API ไม่ available

## วิธีใช้งาน

### วิธีที่ 1: ใช้ API จริง (แนะนำ)

#### ขั้นตอน:

1. เปิด Terminal (PowerShell)
2. รันคำสั่ง:

```powershell
cd "c:\Users\Thanakron\Documents\GitHub\React-Business\package"
npm run dev
```

3. เปิด browser ไปที่:

```
http://localhost:3000/investor-financials
```

4. ทดสอบ API:

```
http://localhost:3000/api/stock?symbol=TVO
```

### วิธีที่ 2: ใช้ Mock Data (ถ้า API ไม่ทำงาน)

ถ้า API ยังไม่ทำงาน ให้ใช้ Mock Data ชั่วคราว:

#### แก้ไขไฟล์ `src/app/investor-financials/page.tsx`:

ด้านบนสุดของไฟล์ เพิ่ม import:

```typescript
import { findStockBySymbol, getTopStocksByValue } from "@/data/mockStockData";
```

#### แก้ StockMarketWidget useEffect:

แทนที่:

```typescript
useEffect(() => {
  const fetchStockData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/stock?symbol=${symbol}`);
      // ... rest of code
    }
  };
  // ...
}, [symbol]);
```

ด้วย:

```typescript
useEffect(() => {
  const fetchStockData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try API first
      try {
        const response = await fetch(`/api/stock?symbol=${symbol}`);
        if (response.ok) {
          const data: ApiResponse = await response.json();
          if (data.data && Array.isArray(data.data) && data.data.length > 0) {
            setStockData(data.data[0]);
            return;
          }
        }
      } catch (apiError) {
        console.log("API not available, using mock data");
      }

      // Use mock data as fallback
      const mockStock = findStockBySymbol(symbol);
      if (mockStock) {
        setStockData(mockStock);
      } else {
        setError(`ไม่พบข้อมูลหุ้น ${symbol}`);
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  fetchStockData();
  const interval = setInterval(fetchStockData, 300000);
  return () => clearInterval(interval);
}, [symbol]);
```

#### แก้ MarketOverview useEffect:

แทนที่:

```typescript
useEffect(() => {
  const fetchMarketData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/stock");
      // ... rest of code
    }
  };
  // ...
}, []);
```

ด้วย:

```typescript
useEffect(() => {
  const fetchMarketData = async () => {
    try {
      setLoading(true);

      // Try API first
      try {
        const response = await fetch("/api/stock");
        if (response.ok) {
          const data: ApiResponse = await response.json();
          if (data.data && Array.isArray(data.data)) {
            const topStocks = data.data
              .filter((stock) => stock.value > 0)
              .sort((a, b) => b.value - a.value)
              .slice(0, 10);
            setMarketData(topStocks);
            return;
          }
        }
      } catch (apiError) {
        console.log("API not available, using mock data");
      }

      // Use mock data as fallback
      setMarketData(getTopStocksByValue(10));
    } catch (err) {
      console.error("Market data error:", err);
      setMarketData(getTopStocksByValue(10));
    } finally {
      setLoading(false);
    }
  };

  fetchMarketData();
  const interval = setInterval(fetchMarketData, 300000);
  return () => clearInterval(interval);
}, []);
```

## ตรวจสอบว่าใช้งานได้หรือไม่

### 1. เช็ค Browser Console

กด `F12` → ไปที่ Console tab → ดูว่ามี error อะไร

### 2. เช็ค Network Tab

กด `F12` → ไปที่ Network tab → ดูว่า request `/api/stock` มี status code เท่าไหร่

### 3. ทดสอบ API โดยตรง

เปิด browser ไปที่: `http://localhost:3000/api/stock`

ถ้าเห็น JSON response แสดงว่า API ทำงาน

## ปัญหาที่อาจพบและวิธีแก้

### ❌ ปัญหา: npm run dev ไม่ทำงาน

**แก้ไข:**

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
npm run dev
```

### ❌ ปัญหา: CORS Error

**แก้ไข:** ✅ แก้แล้วโดยใช้ `/api/stock` แทน direct API call

### ❌ ปัญหา: API ไม่ return ข้อมูล

**แก้ไข:** ใช้ Mock Data (วิธีที่ 2 ด้านบน)

### ❌ ปัญหา: หน้าแสดงแต่ไม่มีข้อมูล

**สาเหตุอาจเป็น:**

1. ตลาดปิด (นอกเวลา 9:30-16:30 ICT)
2. API ช้า
3. Network issue

**แก้ไข:**

- รอสักครู่แล้ว refresh
- ใช้ Mock Data
- เช็ค Console/Network tab

## ไฟล์ที่เกี่ยวข้อง

```
src/
├── app/
│   ├── api/
│   │   └── stock/
│   │       └── route.ts          ✅ API Proxy
│   └── investor-financials/
│       └── page.tsx               ✅ Main Page (แก้ไขแล้ว)
└── data/
    └── mockStockData.ts           ✅ Mock Data (สำรอง)

docs/
├── TROUBLESHOOTING.md             📖 คู่มือแก้ปัญหา
├── QUICK_FIX_MOCK_DATA.md         📖 วิธีใช้ Mock Data
├── SET_API_INTEGRATION.md         📖 เอกสารเต็ม
└── README_SET_API.md              📖 Quick Start
```

## Quick Commands

```powershell
# ติดตั้ง dependencies
npm install

# รัน development server
npm run dev

# Build for production
npm run build

# ตรวจสอบ port 3000
netstat -an | findstr :3000
```

## การทดสอบ

### Test 1: ทดสอบ API Route

```
http://localhost:3000/api/stock
```

ควรเห็น JSON array ของหุ้นทั้งหมด

### Test 2: ทดสอบหุ้นเฉพาะ

```
http://localhost:3000/api/stock?symbol=TVO
```

ควรเห็นข้อมูลหุ้น TVO

### Test 3: ทดสอบหน้า

```
http://localhost:3000/investor-financials
```

ควรเห็นหน้าพร้อมข้อมูลหุ้น

## สรุป

### ✅ ที่ทำไปแล้ว:

1. สร้าง API Proxy ที่ `/api/stock`
2. แก้ไข page.tsx ให้เรียก proxy แทน direct API
3. เพิ่ม Error Handling
4. สร้าง Mock Data สำรอง
5. สร้างเอกสารครบถ้วน

### 📝 ที่ต้องทำ (เลือก 1 ใน 2):

**วิธีที่ 1:** รัน `npm run dev` และใช้ API จริง  
**วิธีที่ 2:** แก้ code ให้ใช้ Mock Data (copy code จากด้านบน)

### 🎯 เป้าหมาย:

เปิดหน้า `/investor-financials` แล้วเห็นข้อมูลหุ้น TVO พร้อมกราฟและตาราง

## ต้องการความช่วยเหลือ?

บอกผมว่า:

1. รัน `npm run dev` แล้วเห็นอะไร?
2. เปิด `http://localhost:3000/api/stock` แล้วเห็นอะไร?
3. Console ใน browser แสดง error อะไร?
4. Network tab แสดง status code เท่าไหร่?

จะได้ช่วยแก้ให้เฉพาะจุดครับ! 🚀
