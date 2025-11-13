# Facebook Ads API - ตัวอย่างการใช้งาน

## 🎯 API Endpoint

```
GET /api/facebook-ads-campaigns
```

## 📋 Query Parameters ทั้งหมด

| Parameter           | Type          | Required | Default | Description                              |
| ------------------- | ------------- | -------- | ------- | ---------------------------------------- |
| `level`             | string        | No       | `ad`    | ระดับข้อมูล: `campaign`, `adset`, `ad`   |
| `date_preset`       | string        | No       | `today` | ช่วงเวลาแบบ preset                       |
| `time_range`        | string (JSON) | No       | -       | ช่วงเวลาแบบกำหนดเอง (ใช้แทน date_preset) |
| `time_increment`    | number        | No       | -       | แยกข้อมูลตามวัน (1 = ทีละวัน)            |
| `fields`            | string        | No       | (auto)  | Fields ที่ต้องการดึง                     |
| `action_breakdowns` | string        | No       | -       | แยก actions ตาม type                     |

## 🔥 ตัวอย่างการใช้งาน

### 1. ดึงข้อมูลวันนี้ (date_preset)

```typescript
// แบบง่าย - ใช้ date_preset
const response = await fetch(
  "/api/facebook-ads-campaigns?level=ad&date_preset=today"
);
const data = await response.json();
```

### 2. ดึงข้อมูลวันที่กำหนดเอง (time_range)

```typescript
// ระบุวันที่เอง - เหมือนที่คุณส่งมา
const timeRange = JSON.stringify({
  since: "2025-11-04",
  until: "2025-11-04",
});

const response = await fetch(
  `/api/facebook-ads-campaigns?level=ad&time_range=${encodeURIComponent(
    timeRange
  )}&time_increment=1`
);
const data = await response.json();
```

### 3. ดึงข้อมูลพร้อม action_breakdowns

```typescript
// แยก actions ตาม type
const response = await fetch(
  "/api/facebook-ads-campaigns?level=ad&date_preset=today&action_breakdowns=action_type"
);
const data = await response.json();
```

### 4. ดึงข้อมูลช่วง 7 วัน แยกทีละวัน

```typescript
const timeRange = JSON.stringify({
  since: "2025-10-28",
  until: "2025-11-04",
});

const response = await fetch(
  `/api/facebook-ads-campaigns?level=ad&time_range=${encodeURIComponent(
    timeRange
  )}&time_increment=1&action_breakdowns=action_type`
);
const data = await response.json();
```

### 5. ดึงข้อมูล Campaign level เดือนนี้

```typescript
const response = await fetch(
  "/api/facebook-ads-campaigns?level=campaign&date_preset=this_month"
);
const data = await response.json();
```

### 6. กำหนด Fields เอง

```typescript
const fields = "ad_id,ad_name,spend,impressions,clicks,ctr,cpc,actions";
const response = await fetch(
  `/api/facebook-ads-campaigns?level=ad&date_preset=today&fields=${fields}`
);
const data = await response.json();
```

## 📊 URL แบบเต็ม (เหมือนที่คุณส่งมา)

```typescript
// แปลง URL ที่คุณส่งมาให้เป็น API call
const timeRange = JSON.stringify({
  since: "2025-11-04",
  until: "2025-11-04",
});

const fields =
  "ad_id,ad_name,adset_id,adset_name,campaign_id,campaign_name,spend,impressions,clicks,ctr,cpc,cpm,actions";

const url =
  `/api/facebook-ads-campaigns?` +
  `level=ad&` +
  `fields=${fields}&` +
  `action_breakdowns=action_type&` +
  `time_range=${encodeURIComponent(timeRange)}&` +
  `time_increment=1`;

const response = await fetch(url);
const data = await response.json();
```

## 🎨 ตัวอย่าง Response

```json
{
  "success": true,
  "level": "ad",
  "date_preset": null,
  "data": [
    {
      "ad_id": "123456789",
      "ad_name": "LIVE - Thruplay",
      "adset_id": "987654321",
      "adset_name": "Ad Set Name",
      "campaign_id": "456789123",
      "campaign_name": "Campaign Name",
      "spend": "500.00",
      "impressions": "10000",
      "clicks": "500",
      "ctr": "5.0",
      "cpc": "1.0",
      "cpm": "50.0",
      "reach": "8000",
      "frequency": "1.25",
      "actions": [
        {
          "action_type": "onsite_conversion.messaging_first_reply",
          "value": "10"
        },
        {
          "action_type": "link_click",
          "value": "450"
        },
        {
          "action_type": "post_engagement",
          "value": "600"
        }
      ],
      "date_start": "2025-11-04",
      "date_stop": "2025-11-04"
    }
  ],
  "summary": {
    "total_spend": 500.0,
    "total_impressions": 10000,
    "total_reach": 8000,
    "total_clicks": 500,
    "total_results": 1060
  },
  "paging": null
}
```

## 📅 Date Preset Options

- `today` - วันนี้
- `yesterday` - เมื่อวาน
- `last_7d` - 7 วันที่แล้ว
- `last_30d` - 30 วันที่แล้ว
- `this_week_mon_today` - สัปดาห์นี้ (จันทร์-วันนี้)
- `this_week_sun_today` - สัปดาห์นี้ (อาทิตย์-วันนี้)
- `last_week_mon_sun` - สัปดาห์ที่แล้ว
- `this_month` - เดือนนี้
- `last_month` - เดือนที่แล้ว

## 🔧 Time Range Format

```json
{
  "since": "YYYY-MM-DD",
  "until": "YYYY-MM-DD"
}
```

ตัวอย่าง:

```javascript
const timeRange = JSON.stringify({
  since: "2025-11-01",
  until: "2025-11-04",
});
```

## ⚠️ สิ่งที่ต้องระวัง

1. **ไม่สามารถใช้ `date_preset` และ `time_range` พร้อมกัน** - เลือกใช้อย่างใดอย่างหนึ่ง
2. **time_range ต้อง encode** - ใช้ `encodeURIComponent()` เพื่อ encode JSON string
3. **time_increment** - ใช้ได้เฉพาะกับ `time_range` เท่านั้น ไม่ใช่กับ `date_preset`
4. **action_breakdowns** - ใช้เพื่อแยกข้อมูล actions ให้ละเอียดขึ้น

## 💡 Tips

### ดึงข้อมูลแบบ Real-time

```typescript
// ใช้ today เพื่อดูข้อมูล real-time
const response = await fetch(
  "/api/facebook-ads-campaigns?level=ad&date_preset=today"
);
```

### ดึงข้อมูลเปรียบเทียบ

```typescript
// ดึง 2 ช่วงเวลาแยกกัน แล้วเอามาเปรียบเทียบ
const today = await fetch(
  "/api/facebook-ads-campaigns?level=ad&date_preset=today"
);
const yesterday = await fetch(
  "/api/facebook-ads-campaigns?level=ad&date_preset=yesterday"
);
```

### ดึงข้อมูลทุกระดับ

```typescript
// ดึง 3 ระดับพร้อมกัน
const campaigns = await fetch(
  "/api/facebook-ads-campaigns?level=campaign&date_preset=today"
);
const adsets = await fetch(
  "/api/facebook-ads-campaigns?level=adset&date_preset=today"
);
const ads = await fetch(
  "/api/facebook-ads-campaigns?level=ad&date_preset=today"
);
```

## 🚀 ใช้ใน Component

```typescript
"use client";

import { useEffect, useState } from "react";

export default function AdsReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const timeRange = JSON.stringify({
          since: "2025-11-04",
          until: "2025-11-04",
        });

        const response = await fetch(
          `/api/facebook-ads-campaigns?level=ad&time_range=${encodeURIComponent(
            timeRange
          )}&time_increment=1&action_breakdowns=action_type`
        );

        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Facebook Ads Report</h1>
      <p>Total Spend: ฿{data?.summary?.total_spend}</p>
      <p>Total Impressions: {data?.summary?.total_impressions}</p>
      {/* แสดงข้อมูลต่อ */}
    </div>
  );
}
```

## 📝 หมายเหตุ

- API นี้จะดึงข้อมูลจาก Facebook Graph API v24.0
- ข้อมูลจะถูก cache ตาม Facebook API policy
- สามารถดึงข้อมูลได้สูงสุด 500 รายการต่อครั้ง
- หากมีข้อมูลเกิน 500 จะมี `paging.next` สำหรับดึงข้อมูลชุดถัดไป
