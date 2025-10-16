# 🔧 วิธีแก้ไขปัญหาและทดสอบ Stock API

## ปัญหาที่พบบ่อย

### 1. CORS Error

**อาการ:** Console แสดง "CORS policy blocked"

**แก้ไข:** ✅ แก้ไขแล้ว - ใช้ `/api/stock` แทนการเรียก API โดยตรง

### 2. PowerShell Script Execution Error

**อาการ:** ไม่สามารถรัน `npm run dev` ได้

**แก้ไข:**

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
```

## วิธีทดสอบ

### ขั้นตอนที่ 1: เริ่ม Development Server

```powershell
cd "c:\Users\Thanakron\Documents\GitHub\React-Business\package"
npm run dev
```

### ขั้นตอนที่ 2: ทดสอบ API Endpoint

เปิดเบราว์เซอร์และทดสอบ URLs ต่อไปนี้:

#### ทดสอบ API Proxy (ทั้งหมด)

```
http://localhost:3000/api/stock
```

#### ทดสอบหุ้น TVO

```
http://localhost:3000/api/stock?symbol=TVO
```

#### ทดสอบหุ้น PTT

```
http://localhost:3000/api/stock?symbol=PTT
```

### ขั้นตอนที่ 3: ทดสอบหน้า Investor Financials

```
http://localhost:3000/investor-financials
```

## วิธีแก้ไขหากยังใช้งานไม่ได้

### ตรวจสอบ 1: API Route มีอยู่หรือไม่

ดูที่ `src/app/api/stock/route.ts` ต้องมีไฟล์นี้

### ตรวจสอบ 2: เช็ค Console ใน Browser

1. กด F12 เปิด DevTools
2. ไปที่ tab Console
3. ดูข้อความ error
4. ไปที่ tab Network
5. ดูว่า `/api/stock` ถูกเรียกหรือไม่

### ตรวจสอบ 3: ตรวจสอบ API Response

ใช้ PowerShell:

```powershell
# Test API endpoint
Invoke-WebRequest -Uri "http://localhost:3000/api/stock?symbol=TVO" -Method GET
```

หรือใช้ cURL:

```bash
curl http://localhost:3000/api/stock?symbol=TVO
```

## สิ่งที่แก้ไขแล้ว

### ✅ 1. เปลี่ยนจากการเรียก API โดยตรงเป็น Proxy

```typescript
// เดิม (มีปัญหา CORS)
fetch("https://marketplace.set.or.th/api/public/realtime-data/stock");

// ใหม่ (ใช้ Proxy)
fetch("/api/stock?symbol=TVO");
```

### ✅ 2. เพิ่ม Error Handling ที่ดีขึ้น

- แสดงข้อความ error ที่เข้าใจง่าย
- แสดง loading state
- แสดงข้อความเมื่อไม่มีข้อมูล

### ✅ 3. เพิ่มการตรวจสอบ Response

- ตรวจสอบว่า data เป็น array
- ตรวจสอบว่ามีข้อมูลหรือไม่
- แสดง error message ที่ชัดเจน

## ตัวอย่าง Response ที่ถูกต้อง

### Success Response

```json
{
  "data": [
    {
      "symbol": "TVO",
      "last": 24.5,
      "change": 0.5,
      "percentChange": 2.08,
      "high": 25.0,
      "low": 24.0,
      "volume": 15500000,
      "value": 380250000,
      "prior": 24.0,
      "marketStatus": "OPEN"
    }
  ]
}
```

### Error Response

```json
{
  "error": "Stock symbol XYZ not found"
}
```

## การ Debug

### 1. เช็คว่า Server รันอยู่หรือไม่

```powershell
netstat -an | findstr :3000
```

### 2. ดู Server Logs

ดูที่ Terminal ที่รัน `npm run dev`

### 3. ทดสอบ API ด้วย Browser

เปิด `http://localhost:3000/api/stock` ใน browser ควรเห็น JSON response

### 4. ตรวจสอบ Network Tab

1. เปิด DevTools (F12)
2. ไปที่ Network tab
3. Refresh หน้า
4. ดู request ที่ชื่อ `stock`
5. เช็ค Status Code (ควรเป็น 200)
6. เช็ค Response

## หาก API ยัง Error

### Plan B: ใช้ข้อมูล Mock แทน

แก้ไขใน `page.tsx`:

```typescript
// เพิ่มที่ด้านบนของ component
const MOCK_DATA = {
  symbol: "TVO",
  last: 24.5,
  change: 0.5,
  percentChange: 2.08,
  high: 25.0,
  low: 24.0,
  volume: 15500000,
  value: 380250000,
  prior: 24.0,
  marketStatus: "CLOSED",
};

// ใน useEffect
useEffect(() => {
  const fetchStockData = async () => {
    try {
      setLoading(true);

      // ลองใช้ API ก่อน
      try {
        const response = await fetch(`/api/stock?symbol=${symbol}`);
        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.length > 0) {
            setStockData(data.data[0]);
            return;
          }
        }
      } catch (apiError) {
        console.log("API error, using mock data", apiError);
      }

      // ถ้า API ไม่ได้ ใช้ mock data
      setStockData({ ...MOCK_DATA, symbol });
    } catch (err) {
      setError("กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  fetchStockData();
}, [symbol]);
```

## ติดต่อขอความช่วยเหลือ

หากยังแก้ไม่ได้ ให้บอก:

1. Error message จาก Console
2. Network tab status code
3. Terminal output
4. Screenshot ของปัญหา

## Quick Test Commands

```powershell
# 1. ตรวจสอบ Node version
node --version

# 2. ตรวจสอบ npm version
npm --version

# 3. ติดตั้ง dependencies
npm install

# 4. Build project
npm run build

# 5. รัน development server
npm run dev
```

## Next Steps

1. ✅ รัน `npm run dev`
2. ✅ เปิด `http://localhost:3000/api/stock`
3. ✅ ดู response ใน browser
4. ✅ เปิด `http://localhost:3000/investor-financials`
5. ✅ ทดสอบเปลี่ยน stock symbol

---

**หมายเหตุ:** หากตลาดหุ้นปิด (นอกเวลา 9:30-16:30 ICT) data อาจไม่ update แต่ควรยังแสดงข้อมูลได้
