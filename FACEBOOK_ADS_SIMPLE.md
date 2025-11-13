# 🚀 วิธีง่ายที่สุด: ใช้ Facebook Graph API Explorer

## ไม่ต้องสร้าง App! ใช้ได้ทันที

---

## 📋 ขั้นตอนที่ 1: ขอ Access Token

### 1. เปิด Graph API Explorer

🔗 https://developers.facebook.com/tools/explorer/

### 2. เลือก Permissions

คลิกที่ **"Permissions"** แล้วเลือก:

- ✅ `ads_read`
- ✅ `read_insights`
- ✅ `ads_management` (ถ้าต้องการ)

### 3. Generate Access Token

- คลิก **"Generate Access Token"**
- ล็อกอิน Facebook
- อนุญาตการเข้าถึง
- **คัดลอก Token** ที่ได้

### 4. แปลงเป็น Long-Lived Token (อายุ 60 วัน)

เปิด URL นี้ใน Chrome (แทนค่า{...}):

```
https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id={ยังไม่มี}&client_secret={ยังไม่มี}&fb_exchange_token={short-lived-token}
```

**หมายเหตุ**: ถ้าไม่มี App ID และ App Secret ให้ใช้ Short-Lived Token ไปก่อน (อายุ 1-2 ชั่วโมง)

---

## 📋 ขั้นตอนที่ 2: หา Ad Account ID

### 1. เปิด Facebook Business Manager

🔗 https://business.facebook.com/settings/ad-accounts

### 2. คัดลอก Ad Account ID

- คลิกที่ Ad Account ที่ต้องการ
- เห็น ID รูปแบบ: **`act_1234567890`**
- **คัดลอก** ทั้งหมดรวม `act_`

---

## 📋 ขั้นตอนที่ 3: เพิ่มใน .env.local

เพิ่ม 2 บรรทัดนี้:

```env
# Facebook Ads API (ไม่ต้องมี App ID/Secret)
FACEBOOK_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FACEBOOK_AD_ACCOUNT_ID=act_1234567890
```

---

## 📋 ขั้นตอนที่ 4: ใช้งาน

Dashboard จะเรียก API endpoint ใหม่:

```
/api/facebook-ads-simple
```

**ไม่ต้องติดตั้ง SDK อะไรเพิ่ม!** ใช้ fetch API โดยตรง

---

## 🎯 สรุปง่ายๆ

1. **ขอ Token**: https://developers.facebook.com/tools/explorer/
   - เลือก Permissions: `ads_read`, `read_insights`
   - Generate Token
2. **หา Account ID**: https://business.facebook.com/settings/ad-accounts
   - คัดลอก `act_xxxxxxxxxx`
3. **เพิ่มใน `.env.local`**:

   ```
   FACEBOOK_ACCESS_TOKEN=your_token_here
   FACEBOOK_AD_ACCOUNT_ID=act_your_id_here
   ```

4. **เปลี่ยน API endpoint** ใน Dashboard จาก:

   ```typescript
   /api/abcefkoo - ads;
   ```

   เป็น:

   ```typescript
   /api/abcefkoo - ads - simple;
   ```

5. **Restart server**: `npm run dev`

---

## ⚠️ ข้อควรระวัง

### Access Token อายุสั้น

- Short-Lived Token: อายุ 1-2 ชั่วโมง
- Long-Lived Token: อายุ 60 วัน (ต้องมี App ID/Secret)
- แนะนำ: สร้าง Token ใหม่ทุกครั้งที่หมดอายุ

### Permissions

ต้องมีอย่างน้อย:

- `ads_read` - อ่านข้อมูล Ads
- `read_insights` - อ่าน Insights/รายงาน

---

## 🔗 ลิงก์ที่ใช้

- [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
- [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/)
- [Business Manager](https://business.facebook.com/)
- [Graph API Documentation](https://developers.facebook.com/docs/graph-api/)

---

## ✅ เริ่มได้เลย!

1. เปิด: https://developers.facebook.com/tools/explorer/
2. เลือก Permissions → Generate Token
3. คัดลอก Token และ Ad Account ID
4. เพิ่มใน `.env.local`
5. เปลี่ยน API endpoint
6. Restart และทดสอบ! 🚀
