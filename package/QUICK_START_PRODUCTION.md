# ⚡ Quick Start: Deploy to Production

## 🎯 สิ่งที่ต้องมีก่อน Deploy

1. ✅ Facebook Access Token (Long-lived)
2. ✅ Facebook Ad Account ID
3. ✅ GitHub Account
4. ✅ Vercel Account (ฟรี)

---

## 📦 Option 1: Deploy ด้วย Vercel (แนะนำ - ง่ายที่สุด)

### Step 1: Push Code ขึ้น GitHub

```bash
cd package
git add .
git commit -m "feat: add facebook ads manager"
git push origin main
```

### Step 2: เชื่อมต่อ GitHub กับ Vercel

1. ไปที่ https://vercel.com
2. คลิก **Add New Project**
3. Import จาก GitHub → เลือก repository นี้
4. เลือก **package** เป็น Root Directory
5. คลิก **Deploy** (ยังไม่ต้องใส่ Environment Variables)

### Step 3: ตั้งค่า Environment Variables

หลัง deploy สำเร็จครั้งแรก:

1. ไปที่ **Project Settings → Environment Variables**
2. เพิ่มตัวแปรเหล่านี้:

```bash
FACEBOOK_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxx
FACEBOOK_AD_ACCOUNT_ID=act_1234567890
```

3. เลือก Environment ทั้งหมด:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

### Step 4: Re-deploy

1. ไปที่ **Deployments**
2. คลิก **... (three dots)** ที่ deployment ล่าสุด
3. เลือก **Redeploy**

### Step 5: ทดสอบ

```
https://your-project.vercel.app/facebook-ads-manager
```

✅ **Done!** ตอนนี้โปรเจคพร้อมใช้งานแล้ว

---

## 🖥️ Option 2: Deploy ด้วย Vercel CLI

### Step 1: ติดตั้ง Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login

```bash
vercel login
```

### Step 3: Deploy

```bash
cd package
vercel
```

ตอบคำถาม:

- Set up and deploy? **Y**
- Which scope? เลือก account ของคุณ
- Link to existing project? **N**
- What's your project's name? `react-business` (หรือชื่อที่ต้องการ)
- In which directory is your code located? `./`

### Step 4: เพิ่ม Environment Variables

```bash
vercel env add FACEBOOK_ACCESS_TOKEN
# ป้อน token ของคุณ
# เลือก: Production, Preview, Development (ทั้งหมด)

vercel env add FACEBOOK_AD_ACCOUNT_ID
# ป้อน act_1234567890
# เลือก: Production, Preview, Development (ทั้งหมด)
```

### Step 5: Deploy to Production

```bash
vercel --prod
```

✅ **Done!**

---

## 🔑 วิธีหา Facebook Credentials

### หา Access Token

**วิธีที่ 1: ใช้ Graph API Explorer (ง่าย แต่ token หมดอายุเร็ว)**

1. ไปที่ https://developers.facebook.com/tools/explorer/
2. เลือก App ของคุณ
3. Permissions → เพิ่ม:
   - `ads_read`
   - `ads_management`
   - `read_insights`
4. คลิก **Generate Access Token**
5. คัดลอก token

**วิธีที่ 2: สร้าง Long-lived Token (แนะนำ - token อายุ 60 วัน)**

หลังจากได้ short-lived token จากวิธีที่ 1:

```bash
curl -X GET "https://graph.facebook.com/v24.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=SHORT_LIVED_TOKEN"
```

Replace:

- `YOUR_APP_ID` - หาได้ที่ Facebook Developers → Your App → Settings
- `YOUR_APP_SECRET` - หาได้ที่ Facebook Developers → Your App → Settings → Basic
- `SHORT_LIVED_TOKEN` - token จากวิธีที่ 1

### หา Ad Account ID

1. ไปที่ https://business.facebook.com/
2. Business Settings → Accounts → Ad Accounts
3. เลือก Ad Account
4. คัดลอก Account ID (ตัวเลข)
5. เพิ่ม `act_` ข้างหน้า → `act_1234567890`

---

## 🔍 ตรวจสอบว่า Deploy สำเร็จ

### Test API Endpoint

```bash
curl "https://your-project.vercel.app/api/facebook-ads-campaigns?level=campaign&date_preset=today"
```

**ถ้าสำเร็จ** จะเห็น:

```json
{
  "success": true,
  "data": [...],
  "summary": {...}
}
```

**ถ้าไม่สำเร็จ** จะเห็น:

```json
{
  "success": false,
  "error": "ไม่พบ Facebook Access Token",
  ...
}
```

### Test Dashboard

เปิด: `https://your-project.vercel.app/facebook-ads-manager`

ถ้าเห็นข้อมูลโฆษณา = **สำเร็จ!** 🎉

---

## 🐛 แก้ปัญหาเบื้องต้น

### ❌ Error: "ไม่พบ Access Token"

**สาเหตุ:** ยังไม่ได้ตั้งค่า Environment Variables

**วิธีแก้:**

1. ตรวจสอบว่าเพิ่ม `FACEBOOK_ACCESS_TOKEN` ใน Vercel แล้ว
2. Re-deploy โปรเจค

### ❌ Error: "Invalid OAuth access token"

**สาเหตุ:** Token หมดอายุหรือผิด

**วิธีแก้:**

1. สร้าง Token ใหม่ (ดูวิธีด้านบน)
2. Update `FACEBOOK_ACCESS_TOKEN` ใน Vercel
3. Re-deploy

### ❌ Error: "Ad Account not found"

**สาเหตุ:** Ad Account ID ผิด

**วิธีแก้:**

1. ตรวจสอบ Ad Account ID (ต้องมี `act_` ข้างหน้า)
2. Update `FACEBOOK_AD_ACCOUNT_ID` ใน Vercel
3. Re-deploy

---

## 📊 Monitor & Logs

### ดู Logs แบบ Real-time

```bash
vercel logs your-project.vercel.app
```

### ดู Logs ใน Dashboard

1. Vercel Dashboard → Your Project
2. Deployments → เลือก deployment
3. Tab **Logs** หรือ **Functions**

---

## 🔄 Auto-Deployment

หลังจากตั้งค่าเสร็จแล้ว:

1. แก้ไขโค้ด
2. Commit และ Push ขึ้น GitHub
3. Vercel **auto-deploy** ให้อัตโนมัติ! 🚀

```bash
git add .
git commit -m "update: improve dashboard"
git push origin main
```

→ เช็คสถานะที่ Vercel Dashboard

---

## ✅ Checklist

- [ ] สร้าง Facebook App แล้ว
- [ ] ได้ Long-lived Access Token แล้ว
- [ ] ได้ Ad Account ID แล้ว (รูปแบบ act_xxxxxx)
- [ ] Push code ขึ้น GitHub แล้ว
- [ ] เชื่อมต่อ Vercel กับ GitHub แล้ว
- [ ] ตั้งค่า Environment Variables ครบถ้วน
- [ ] Deploy สำเร็จ
- [ ] ทดสอบ API ผ่าน
- [ ] ทดสอบ Dashboard ผ่าน

---

## 📚 เอกสารเพิ่มเติม

- 📖 [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md) - คู่มือฉบับเต็ม
- 📖 [VERCEL_ENV_SETUP.md](./VERCEL_ENV_SETUP.md) - การตั้งค่า Environment Variables
- 📖 [FACEBOOK_ADS_SETUP.md](./FACEBOOK_ADS_SETUP.md) - การตั้งค่า Facebook Ads API

---

## 🎉 สรุป

**3 ขั้นตอนสำคัญ:**

1. 🔑 **ได้ Credentials** (Token + Account ID)
2. ⚙️ **ตั้งค่า Environment Variables** ใน Vercel
3. 🚀 **Deploy** และทดสอบ

**เวลาที่ใช้:** ~10-15 นาที

**ไม่ต้องแก้โค้ด** - ใช้ Environment Variables เท่านั้น!

---

💡 **Pro Tip:** บันทึก Token และ Account ID ไว้ในที่ปลอดภัย (เช่น 1Password, LastPass) เพื่อใช้ในอนาคต
