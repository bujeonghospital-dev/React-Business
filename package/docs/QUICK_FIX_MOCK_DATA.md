# 🚀 Quick Fix - ใช้งานได้ทันที

## วิธีแก้ปัญหาด่วน (ใช้ Mock Data)

หากต้องการให้หน้าแสดงผลได้ทันทีโดยไม่ต้องรอแก้ API ให้ทำตามขั้นตอนนี้:

### ขั้นตอนที่ 1: สร้างไฟล์ Mock Data

สร้างไฟล์ใหม่: `src/data/mockStockData.ts`

```typescript
export interface StockData {
  symbol: string;
  last: number;
  change: number;
  percentChange: number;
  high: number;
  low: number;
  volume: number;
  value: number;
  prior: number;
  marketStatus: string;
}

export const MOCK_STOCKS: StockData[] = [
  {
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
  },
  {
    symbol: "PTT",
    last: 38.5,
    change: 0.75,
    percentChange: 1.99,
    high: 39.0,
    low: 37.75,
    volume: 320000000,
    value: 12450250000,
    prior: 37.75,
    marketStatus: "CLOSED",
  },
  {
    symbol: "KBANK",
    last: 142.0,
    change: -1.5,
    percentChange: -1.04,
    high: 144.0,
    low: 141.5,
    volume: 58500000,
    value: 8320500000,
    prior: 143.5,
    marketStatus: "CLOSED",
  },
  {
    symbol: "CPALL",
    last: 65.25,
    change: 0.5,
    percentChange: 0.77,
    high: 66.0,
    low: 64.5,
    volume: 120000000,
    value: 7890750000,
    prior: 64.75,
    marketStatus: "CLOSED",
  },
  {
    symbol: "AOT",
    last: 68.0,
    change: 1.25,
    percentChange: 1.87,
    high: 68.5,
    low: 66.75,
    volume: 95000000,
    value: 6543200000,
    prior: 66.75,
    marketStatus: "CLOSED",
  },
  {
    symbol: "ADVANC",
    last: 185.0,
    change: 2.5,
    percentChange: 1.37,
    high: 186.0,
    low: 182.5,
    volume: 35000000,
    value: 6475000000,
    prior: 182.5,
    marketStatus: "CLOSED",
  },
  {
    symbol: "TRUE",
    last: 4.8,
    change: -0.1,
    percentChange: -2.04,
    high: 4.92,
    low: 4.78,
    volume: 950000000,
    value: 4560000000,
    prior: 4.9,
    marketStatus: "CLOSED",
  },
  {
    symbol: "SCB",
    last: 98.5,
    change: 1.0,
    percentChange: 1.03,
    high: 99.5,
    low: 97.5,
    volume: 42000000,
    value: 4137000000,
    prior: 97.5,
    marketStatus: "CLOSED",
  },
  {
    symbol: "BDMS",
    last: 25.75,
    change: 0.25,
    percentChange: 0.98,
    high: 26.0,
    low: 25.5,
    volume: 155000000,
    value: 3991250000,
    prior: 25.5,
    marketStatus: "CLOSED",
  },
  {
    symbol: "CPALL",
    last: 65.25,
    change: 0.5,
    percentChange: 0.77,
    high: 66.0,
    low: 64.5,
    volume: 58000000,
    value: 3784500000,
    prior: 64.75,
    marketStatus: "CLOSED",
  },
];

export function findStockBySymbol(symbol: string): StockData | undefined {
  return MOCK_STOCKS.find(
    (stock) => stock.symbol.toUpperCase() === symbol.toUpperCase()
  );
}

export function getTopStocksByValue(count: number = 10): StockData[] {
  return [...MOCK_STOCKS].sort((a, b) => b.value - a.value).slice(0, count);
}
```

### ขั้นตอนที่ 2: อัพเดต Page Component

แก้ไขใน `src/app/investor-financials/page.tsx`:

#### แก้ในส่วน StockMarketWidget:

```typescript
import { MOCK_STOCKS, findStockBySymbol } from "@/data/mockStockData";

// ใน useEffect ของ StockMarketWidget
useEffect(() => {
  const fetchStockData = async () => {
    try {
      setLoading(true);
      setError(null);

      // ลอง API ก่อน
      try {
        const response = await fetch(`/api/stock?symbol=${symbol}`);
        if (response.ok) {
          const data: ApiResponse = await response.json();
          if (data.data && Array.isArray(data.data) && data.data.length > 0) {
            setStockData(data.data[0]);
            setLoading(false);
            return;
          }
        }
      } catch (apiError) {
        console.log("API not available, using mock data");
      }

      // ใช้ Mock Data ถ้า API ไม่ได้
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

#### แก้ในส่วน MarketOverview:

```typescript
import { MOCK_STOCKS, getTopStocksByValue } from "@/data/mockStockData";

// ใน useEffect ของ MarketOverview
useEffect(() => {
  const fetchMarketData = async () => {
    try {
      setLoading(true);

      // ลอง API ก่อน
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
            setLoading(false);
            return;
          }
        }
      } catch (apiError) {
        console.log("API not available, using mock data");
      }

      // ใช้ Mock Data ถ้า API ไม่ได้
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

## หรือแก้แบบง่ายสุด - Comment API แล้วใช้ Mock เลย

### สำหรับ StockMarketWidget:

```typescript
useEffect(() => {
  const fetchStockData = async () => {
    setLoading(true);

    // Mock data สำหรับทดสอบ
    setTimeout(() => {
      const mockData = {
        symbol: symbol,
        last: Math.random() * 50 + 20,
        change: Math.random() * 2 - 1,
        percentChange: Math.random() * 4 - 2,
        high: Math.random() * 50 + 25,
        low: Math.random() * 50 + 15,
        volume: Math.random() * 100000000,
        value: Math.random() * 1000000000,
        prior: Math.random() * 50 + 20,
        marketStatus: "CLOSED",
      };
      setStockData(mockData);
      setLoading(false);
    }, 500);
  };

  fetchStockData();
  const interval = setInterval(fetchStockData, 300000);
  return () => clearInterval(interval);
}, [symbol]);
```

### สำหรับ MarketOverview:

```typescript
useEffect(() => {
  const fetchMarketData = async () => {
    setLoading(true);

    // Mock data สำหรับทดสอบ
    setTimeout(() => {
      const mockStocks = [
        "PTT",
        "KBANK",
        "CPALL",
        "AOT",
        "TVO",
        "ADVANC",
        "TRUE",
        "SCB",
        "BDMS",
        "GULF",
      ].map((symbol) => ({
        symbol,
        last: Math.random() * 100 + 10,
        change: Math.random() * 4 - 2,
        percentChange: Math.random() * 5 - 2.5,
        high: Math.random() * 100 + 15,
        low: Math.random() * 100 + 5,
        volume: Math.random() * 200000000,
        value: Math.random() * 10000000000,
        prior: Math.random() * 100 + 10,
        marketStatus: "CLOSED",
      }));

      setMarketData(mockStocks);
      setLoading(false);
    }, 500);
  };

  fetchMarketData();
  const interval = setInterval(fetchMarketData, 300000);
  return () => clearInterval(interval);
}, []);
```

## ผลลัพธ์

หลังจากแก้ไขตามวิธีใดวิธีหนึ่งข้างต้น:

✅ หน้าจะแสดงข้อมูลได้ทันที  
✅ ไม่มี CORS error  
✅ ไม่ต้องรอ API response  
✅ UI ทำงานได้สมบูรณ์  
✅ สามารถเปลี่ยน stock symbol ได้

## ข้อดี/ข้อเสียของแต่ละวิธี

### วิธีที่ 1: Mock Data แบบมี Fallback

**ข้อดี:**

- ลอง API ก่อน
- ถ้า API ได้ก็ใช้ข้อมูลจริง
- ถ้า API ไม่ได้ก็ใช้ Mock

**ข้อเสีย:**

- Code ยาวกว่า
- ต้องสร้างไฟล์ Mock Data

### วิธีที่ 2: Mock Data เลย (แบบง่าย)

**ข้อดี:**

- แก้ไขง่ายสุด
- Copy-Paste ได้เลย
- ทำงานได้ทันที

**ข้อเสีย:**

- ไม่ได้ข้อมูลจริง
- ข้อมูลไม่ update

## แนะนำ

📌 **สำหรับการทดสอบ:** ใช้วิธีที่ 2 (Mock Data แบบง่าย)  
📌 **สำหรับ Production:** ใช้วิธีที่ 1 (มี Fallback) หรือแก้ API ให้ใช้งานได้

---

**ต้องการความช่วยเหลือ?** บอกข้อความ error ที่เห็นใน Console และผมจะช่วยแก้ให้เฉพาะเจาะจง!
