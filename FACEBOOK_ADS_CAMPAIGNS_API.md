# Facebook Ads Campaigns API

API endpoint สำหรับดึงข้อมูล Facebook Ads ในระดับ Campaign, Ad Set หรือ Ad พร้อมข้อมูล Insights

## Endpoint

```
GET /api/facebook-ads-campaigns
```

## Query Parameters

### Required Parameters

ไม่มี (ใช้ค่า default)

### Optional Parameters

| Parameter     | Type   | Default          | Description                                         |
| ------------- | ------ | ---------------- | --------------------------------------------------- |
| `level`       | string | `campaign`       | ระดับของข้อมูลที่ต้องการ: `campaign`, `adset`, `ad` |
| `date_preset` | string | `today`          | ช่วงเวลาที่ต้องการดูข้อมูล                          |
| `fields`      | string | (default fields) | Fields ที่ต้องการดึงจาก API                         |

### Date Preset Options

- `today` - วันนี้
- `yesterday` - เมื่อวาน
- `last_7d` - 7 วันที่แล้ว
- `last_30d` - 30 วันที่แล้ว
- `this_month` - เดือนนี้
- `last_month` - เดือนที่แล้ว
- `this_week_mon_today` - สัปดาห์นี้ (จันทร์-วันนี้)
- `this_week_sun_today` - สัปดาห์นี้ (อาทิตย์-วันนี้)
- `last_week_mon_sun` - สัปดาห์ที่แล้ว (จันทร์-อาทิตย์)

## Response Format

### Success Response

```json
{
  "success": true,
  "level": "campaign",
  "date_preset": "today",
  "data": [
    {
      "id": "123456789",
      "name": "Campaign Name",
      "status": "ACTIVE",
      "objective": "OUTCOME_ENGAGEMENT",
      "daily_budget": "500.00",
      "lifetime_budget": null,
      "budget_remaining": "450.00",
      "spend": "50.00",
      "impressions": "1000",
      "reach": "800",
      "clicks": "50",
      "ctr": "5.0",
      "cpc": "1.0",
      "cpm": "50.0",
      "frequency": "1.25",
      "actions": [
        {
          "action_type": "onsite_conversion.messaging_first_reply",
          "value": "10"
        },
        {
          "action_type": "omni_purchase",
          "value": "2"
        }
      ],
      "cost_per_action_type": [
        {
          "action_type": "omni_purchase",
          "value": "25.00"
        }
      ],
      "conversions": [
        {
          "action_type": "omni_purchase",
          "value": "2"
        }
      ]
    }
  ],
  "summary": {
    "total_spend": 50.0,
    "total_impressions": 1000,
    "total_reach": 800,
    "total_clicks": 50,
    "total_results": 12
  },
  "paging": {
    "cursors": {
      "before": "...",
      "after": "..."
    },
    "next": "https://graph.facebook.com/..."
  }
}
```

### Error Response

```json
{
  "error": "ไม่สามารถดึงข้อมูลจาก Facebook Ads API ได้",
  "details": {
    "error": {
      "message": "Error message from Facebook",
      "type": "OAuthException",
      "code": 190
    }
  }
}
```

## ตัวอย่างการใช้งาน

### 1. ดึงข้อมูล Campaigns วันนี้

```typescript
const response = await fetch(
  "/api/facebook-ads-campaigns?level=campaign&date_preset=today"
);
const data = await response.json();
console.log(data);
```

### 2. ดึงข้อมูล Ad Sets 7 วันที่แล้ว

```typescript
const response = await fetch(
  "/api/facebook-ads-campaigns?level=adset&date_preset=last_7d"
);
const data = await response.json();
console.log(data);
```

### 3. ดึงข้อมูล Ads เดือนนี้

```typescript
const response = await fetch(
  "/api/facebook-ads-campaigns?level=ad&date_preset=this_month"
);
const data = await response.json();
console.log(data);
```

### 4. ดึงข้อมูลพร้อมกำหนด Fields เอง

```typescript
const fields =
  "campaign_id,campaign_name,status,objective,budget_remaining,daily_budget";
const response = await fetch(
  `/api/facebook-ads-campaigns?level=campaign&date_preset=today&fields=${fields}`
);
const data = await response.json();
console.log(data);
```

## Data Fields ที่ได้

### Campaign/AdSet/Ad Fields (Base Fields)

- `id` - ID ของ Campaign/AdSet/Ad
- `name` - ชื่อ
- `status` - สถานะ (ACTIVE, PAUSED, DELETED, etc.)
- `objective` - วัตถุประสงค์ของ Campaign
- `daily_budget` - งบประมาณต่อวัน
- `lifetime_budget` - งบประมาณตลอดชีพ
- `budget_remaining` - งบประมาณที่เหลือ
- `start_time` - เวลาเริ่มต้น
- `stop_time` - เวลาสิ้นสุด
- `created_time` - เวลาที่สร้าง
- `updated_time` - เวลาที่อัปเดตล่าสุด

### Insights Fields (Performance Data)

- `spend` - เงินที่ใช้ไป
- `impressions` - การแสดงผล
- `reach` - การเข้าถึง (Unique)
- `clicks` - จำนวนคลิก
- `ctr` - Click-Through Rate (%)
- `cpc` - Cost Per Click
- `cpm` - Cost Per 1000 Impressions
- `cpp` - Cost Per 1000 People Reached
- `frequency` - ความถี่ (เฉลี่ย)
- `unique_clicks` - คลิก Unique
- `unique_ctr` - Unique CTR (%)
- `actions` - การกระทำทั้งหมด (array)
- `cost_per_action_type` - ค่าใช้จ่ายต่อการกระทำ (array)
- `conversions` - Conversions (array)
- `cost_per_conversion` - ค่าใช้จ่ายต่อ Conversion
- `action_values` - มูลค่าของการกระทำ (array)

## Action Types (ตัวอย่าง)

- `onsite_conversion.messaging_first_reply` - การตอบกลับข้อความครั้งแรก
- `onsite_conversion.total_messaging_connection` - การเชื่อมต่อผ่านข้อความทั้งหมด
- `omni_purchase` - การซื้อ (Omni)
- `link_click` - คลิกลิงก์
- `post_engagement` - การมีส่วนร่วมกับโพสต์
- `page_engagement` - การมีส่วนร่วมกับเพจ
- `post_reaction` - ปฏิกิริยาต่อโพสต์
- `comment` - แสดงความคิดเห็น
- `post` - แชร์โพสต์
- `video_view` - ดูวิดีโอ
- `landing_page_view` - ดูหน้า Landing Page

## Environment Variables Required

```bash
# .env.local
FACEBOOK_ACCESS_TOKEN=your_access_token_here
FACEBOOK_AD_ACCOUNT_ID=act_1234567890
```

## Error Codes

| Status | Description                                            |
| ------ | ------------------------------------------------------ |
| 200    | Success                                                |
| 400    | Bad Request - ข้อมูลที่ส่งมาไม่ถูกต้อง                 |
| 401    | Unauthorized - Access Token ไม่ถูกต้องหรือหมดอายุ      |
| 403    | Forbidden - ไม่มีสิทธิ์เข้าถึง Ad Account              |
| 404    | Not Found - ไม่พบข้อมูล                                |
| 500    | Internal Server Error - เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์ |

## Notes

- API จะดึงข้อมูลทั้ง Base Fields และ Insights พร้อมกัน
- ข้อมูล Insights จะถูก flatten ให้อยู่ในระดับเดียวกับ Base Fields เพื่อง่ายต่อการเข้าถึง
- หาก Insights ไม่สามารถดึงได้ จะใช้ค่า default (0 หรือ array ว่าง)
- API รองรับ Pagination ผ่าน `paging.next` ใน response
- ข้อมูล Summary จะรวมยอดทั้งหมดของข้อมูลที่ดึงมา

## Related APIs

- `/api/facebook-ads-insights` - API เดิมสำหรับดึงข้อมูล Insights อย่างเดียว
- `/api/facebook-ads-simple` - API แบบง่ายสำหรับดึงข้อมูลพื้นฐาน
