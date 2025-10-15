# การใช้งาน Google Maps Web Components (Advanced Markers)

## ภาพรวม

โปรเจกต์ได้ถูกอัปเกรดให้ใช้ Google Maps Web Components แทน iframe ซึ่งมีข้อดี:

- ✅ ประสิทธิภาพดีกว่า (โหลดเร็วกว่า)
- ✅ การปรับแต่งสูง (Customizable markers)
- ✅ Responsive ดีกว่า
- ✅ ไม่มีปัญหา CORS
- ✅ รองรับทุก domain (ไม่ต้องกังวลเรื่อง iframe restrictions)

## ไฟล์ที่เกี่ยวข้อง

1. **`src/components/GoogleMap.tsx`** - Google Maps Component หลัก
2. **`src/types/google-maps.d.ts`** - TypeScript type definitions
3. **`src/app/contact-inquiry/page.tsx`** - หน้าติดต่อเราที่ใช้งาน Map

## การใช้งาน Component

### Basic Usage

```tsx
import GoogleMapComponent from "@/components/GoogleMap";

function MyPage() {
  return (
    <GoogleMapComponent
      center={{ lat: 13.685984091307898, lng: 100.72794861574249 }}
      zoom={15}
      markerPosition={{ lat: 13.685984091307898, lng: 100.72794861574249 }}
      markerTitle="สำนักงานใหญ่"
    />
  );
}
```

### Props

| Prop             | Type                           | Required | Default         | Description                     |
| ---------------- | ------------------------------ | -------- | --------------- | ------------------------------- |
| `center`         | `{ lat: number, lng: number }` | Yes      | -               | จุดศูนย์กลางของแผนที่           |
| `zoom`           | `number`                       | No       | `15`            | ระดับการซูม (1-20)              |
| `markerPosition` | `{ lat: number, lng: number }` | Yes      | -               | ตำแหน่งของ marker               |
| `markerTitle`    | `string`                       | No       | `"Location"`    | ชื่อของ marker                  |
| `mapId`          | `string`                       | No       | `"DEMO_MAP_ID"` | Map ID จาก Google Cloud Console |

## การตั้งค่า API Key

API Key ถูกตั้งค่าใน `.env.local`:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyB0WCRvbI_4fgT7mDCyxMFCFov9VDF2LB0
```

### APIs ที่ต้องเปิดใช้งานใน Google Cloud Console:

1. **Maps JavaScript API** (สำหรับ Web Components)
2. **Maps Embed API** (สำหรับ fallback)

## การใช้งานบน Domain

Web Components จะทำงานได้บนทุก domain ที่คุณกำหนดใน Google Cloud Console:

### ขั้นตอนการตั้งค่า Domain:

1. ไปที่ [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. เลือก API Key ของคุณ
3. ในส่วน **Application restrictions** → เลือก **HTTP referrers (web sites)**
4. เพิ่ม domains:

```
http://localhost:3000/*
https://yourdomain.com/*
https://*.yourdomain.com/*
https://www.yourdomain.com/*
```

5. Save

## ตัวอย่างการใช้งาน - Multiple Locations

```tsx
const locations = [
  {
    id: 1,
    name: "สำนักงานใหญ่",
    coordinates: { lat: 13.685984091307898, lng: 100.72794861574249 },
  },
  {
    id: 2,
    name: "โรงงาน",
    coordinates: { lat: 13.685984091307898, lng: 100.72794861574249 },
  },
];

function ContactPage() {
  const [activeLocation, setActiveLocation] = useState(locations[0]);

  return (
    <div>
      <GoogleMapComponent
        center={activeLocation.coordinates}
        zoom={15}
        markerPosition={activeLocation.coordinates}
        markerTitle={activeLocation.name}
      />
    </div>
  );
}
```

## Custom Map ID (Optional)

หากต้องการปรับแต่ง style ของแผนที่:

1. ไปที่ [Google Cloud Console - Map Management](https://console.cloud.google.com/google/maps-apis/studio/maps)
2. สร้าง Map ID ใหม่
3. ปรับแต่ง style ตามต้องการ
4. Copy Map ID
5. ใช้ใน component:

```tsx
<GoogleMapComponent
  mapId="YOUR_CUSTOM_MAP_ID"
  // ... other props
/>
```

## การเพิ่ม Multiple Markers

ต้องแก้ไข `GoogleMap.tsx`:

```tsx
// เพิ่มใน props
markers?: Array<{ position: { lat: number; lng: number }; title: string }>;

// ใน HTML template
{markers?.map((marker, index) => `
  <gmp-advanced-marker
    position="${marker.position.lat},${marker.position.lng}"
    title="${marker.title}"
  ></gmp-advanced-marker>
`).join('')}
```

## การแก้ไขปัญหาทั่วไป

### 1. แผนที่ไม่แสดง

**ตรวจสอบ:**

- API Key ถูกต้อง
- Maps JavaScript API เปิดใช้งานแล้ว
- Domain ตั้งค่าใน restrictions แล้ว
- เช็ค Console (F12) ดู error

### 2. "RefererNotAllowedMapError"

**แก้ไข:**

- เพิ่ม domain ปัจจุบันใน HTTP referrers restrictions
- ตรวจสอบว่าใช้ `http://` หรือ `https://` ถูกต้อง

### 3. Marker ไม่แสดง

**ตรวจสอบ:**

- พิกัดถูกต้อง (lat: -90 to 90, lng: -180 to 180)
- Map ID ถูกต้อง (ใช้ "DEMO_MAP_ID" สำหรับทดสอบ)

### 4. TypeScript Errors

**แก้ไข:**

- ตรวจสอบว่ามีไฟล์ `src/types/google-maps.d.ts`
- Restart TypeScript server: `Ctrl+Shift+P` → `TypeScript: Restart TS Server`

## Performance Tips

1. **Lazy Loading**: Component จะโหลด script อัตโนมัติเมื่อจำเป็น
2. **Caching**: Browser จะ cache script ของ Google Maps
3. **Single Instance**: Script จะโหลดครั้งเดียวต่อ page

## ข้อมูลเพิ่มเติม

- [Google Maps Web Components Documentation](https://developers.google.com/maps/documentation/web-components)
- [Advanced Markers Guide](https://developers.google.com/maps/documentation/javascript/advanced-markers)
- [Pricing](https://developers.google.com/maps/billing-and-pricing/pricing)

## การ Deploy

เมื่อ deploy:

1. ตรวจสอบว่า `.env.local` ไม่ถูก commit (อยู่ใน .gitignore)
2. ตั้งค่า Environment Variable บน hosting platform:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key
   ```
3. เพิ่ม production domain ใน Google Cloud Console restrictions

## ติดต่อสอบถาม

หากมีปัญหาหรือต้องการความช่วยเหลือ กรุณาติดต่อทีมพัฒนา
