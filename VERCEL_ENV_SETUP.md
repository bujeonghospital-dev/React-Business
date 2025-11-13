# 🚀 การตั้งค่า Environment Variables บน Vercel

## สำหรับ Facebook Ads API

เมื่อ deploy บน Vercel คุณต้องตั้งค่า Environment Variables ดังนี้:

### ขั้นตอนการตั้งค่า:

1. **เข้าสู่ Vercel Dashboard**

   ```
   https://vercel.com/your-username/your-project-name
   ```

2. **ไปที่ Settings → Environment Variables**

   ```
   https://vercel.com/your-username/your-project-name/settings/environment-variables
   ```

3. **เพิ่มตัวแปรเหล่านี้:**

   | Variable Name            | Value               | Environment                      |
   | ------------------------ | ------------------- | -------------------------------- |
   | `FACEBOOK_APP_ID`        | `your-app-id`       | Production, Preview, Development |
   | `FACEBOOK_APP_SECRET`    | `your-app-secret`   | Production, Preview, Development |
   | `FACEBOOK_ACCESS_TOKEN`  | `your-access-token` | Production, Preview, Development |
   | `FACEBOOK_AD_ACCOUNT_ID` | `act_1234567890`    | Production, Preview, Development |

4. **Redeploy Project**
   - ไปที่ Deployments
   - คลิก "Redeploy" บน deployment ล่าสุด
   - หรือ push commit ใหม่เพื่อ trigger deployment อัตโนมัติ

---

## 🔑 วิธีขอ Facebook Credentials

### 1. Facebook App ID และ App Secret

1. ไปที่ https://developers.facebook.com/apps/
2. คลิก **"Create App"** หรือเลือก App ที่มีอยู่
3. ไปที่ **Settings → Basic**
4. คัดลอก:
   - **App ID** → `FACEBOOK_APP_ID`
   - **App Secret** (คลิก Show) → `FACEBOOK_APP_SECRET`

### 2. Access Token (แบบ Long-lived)

#### วิธีที่ 1: ใช้ Access Token Tool (ง่ายที่สุด)

1. ไปที่ https://developers.facebook.com/tools/accesstoken/
2. เลือก App ของคุณ
3. คัดลอก **User Token**
4. **แปลงเป็น Long-lived Token:**

```bash
curl -X GET "https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id={APP_ID}&client_secret={APP_SECRET}&fb_exchange_token={SHORT_LIVED_TOKEN}"
```

แทนที่:

- `{APP_ID}` = Facebook App ID ของคุณ
- `{APP_SECRET}` = Facebook App Secret ของคุณ
- `{SHORT_LIVED_TOKEN}` = Token ที่คัดลอกมา

#### วิธีที่ 2: ใช้ Facebook Graph API Explorer

1. ไปที่ https://developers.facebook.com/tools/explorer/
2. เลือก App ของคุณ
3. คลิก **"Get User Access Token"**
4. เลือก Permissions:
   - `ads_read`
   - `ads_management`
   - `business_management`
5. คลิก **"Generate Access Token"**
6. แปลงเป็น Long-lived Token ด้วยคำสั่งข้างบน

#### วิธีที่ 3: ใช้ System User (สำหรับ Production - แนะนำ)

1. ไปที่ Business Manager: https://business.facebook.com/settings/system-users
2. สร้าง System User ใหม่
3. กำหนดสิทธิ์ให้กับ Ad Account
4. สร้าง Token ที่ไม่หมดอายุ (Non-expiring)

### 3. Ad Account ID

1. ไปที่ https://business.facebook.com/settings/ad-accounts
2. เลือก Ad Account ที่ต้องการ
3. ดูที่ URL: `https://business.facebook.com/adsmanager/manage/accounts?act=1234567890`
4. Ad Account ID = `act_1234567890` (เก็บ `act_` ไว้ด้วย)

หรือ:

1. ไปที่ Facebook Ads Manager: https://adsmanager.facebook.com/
2. คลิกที่ชื่อ Ad Account มุมซ้ายบน
3. Account ID จะแสดงอยู่ด้านล่างชื่อ (เช่น `1234567890`)
4. เพิ่ม `act_` ข้างหน้า → `act_1234567890`

---

## ⚠️ ข้อควรระวัง

### Access Token Expiration

- **Short-lived Token**: หมดอายุใน 1-2 ชั่วโมง
- **Long-lived Token**: หมดอายุใน 60 วัน
- **Non-expiring Token** (System User): ไม่หมดอายุ แต่ควรใช้สำหรับ Production เท่านั้น

### การต่ออายุ Token อัตโนมัติ

สำหรับ Production ควรใช้:

1. **System User Token** (ไม่หมดอายุ)
2. หรือสร้างระบบ **Token Refresh** อัตโนมัติ

### ความปลอดภัย

- ❌ **อย่า** commit `.env.local` เข้า Git
- ❌ **อย่า** share Access Token กับคนอื่น
- ✅ **ใช้** Environment Variables บน Vercel
- ✅ **ใช้** System User Token สำหรับ Production
- ✅ **ตั้งค่า** Permissions ให้น้อยที่สุดที่จำเป็น

---

## 🧪 ทดสอบว่าตั้งค่าถูกต้อง

### ใน Local (ด้วย .env.local)

```bash
# ในโฟลเดอร์ package/
npm run dev

# เปิดเบราว์เซอร์
http://localhost:3000/api/facebook-ads
```

### บน Vercel (Production)

```bash
# หลังจาก deploy แล้ว
https://your-project.vercel.app/api/facebook-ads
```

ถ้าตั้งค่าถูกต้อง จะเห็น:

- ✅ ข้อมูล campaigns จาก Facebook Ads
- ✅ Status 200 OK

ถ้าตั้งค่าไม่ถูกต้อง จะเห็น:

- ❌ Error message พร้อมวิธีแก้ไข
- ❌ Status 503 Service Unavailable

---

## 📋 Checklist

- [ ] สร้าง Facebook App แล้ว
- [ ] ได้ App ID และ App Secret แล้ว
- [ ] ได้ Long-lived Access Token แล้ว (หรือ System User Token)
- [ ] ทราบ Ad Account ID แล้ว (รูปแบบ `act_xxxxxxxx`)
- [ ] เพิ่ม Environment Variables ใน Vercel แล้ว
- [ ] เลือก Environment: Production, Preview, Development
- [ ] Redeploy project แล้ว
- [ ] ทดสอบการทำงานแล้ว

---

## 🔗 Links ที่เป็นประโยชน์

- [Facebook Developers Console](https://developers.facebook.com/apps/)
- [Access Token Tool](https://developers.facebook.com/tools/accesstoken/)
- [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
- [Business Manager](https://business.facebook.com/settings/)
- [Marketing API Documentation](https://developers.facebook.com/docs/marketing-apis/)
- [Vercel Environment Variables Docs](https://vercel.com/docs/concepts/projects/environment-variables)

---

## 💡 Tips

1. **ใช้ System User Token สำหรับ Production**

   - ไม่หมดอายุ
   - ปลอดภัยกว่า User Access Token
   - จัดการได้ใน Business Manager

2. **แยก Environment ตาม Use Case**

   - **Development**: ใช้ Test Ad Account
   - **Preview**: ใช้ Staging Ad Account
   - **Production**: ใช้ Real Ad Account

3. **Monitor Token Status**

   - ตรวจสอบอายุของ Token เป็นประจำ
   - ตั้งค่า Alert เมื่อ Token ใกล้หมดอายุ

4. **Backup Credentials**
   - เก็บ credentials ไว้ใน Password Manager
   - สำรองไว้หลายที่ (ปลอดภัย)

---

**🎉 เมื่อตั้งค่าเสร็จแล้ว Facebook Ads API จะทำงานได้ทั้งใน Local และบน Vercel!**
