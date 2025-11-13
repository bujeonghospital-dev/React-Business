# 🚀 คู่มือการ Deploy โปรเจค Facebook Ads Manager ไปยัง Production

## 📋 ขั้นตอนการ Deploy

### 1. ตรวจสอบไฟล์ที่จำเป็น

ก่อน deploy ให้แน่ใจว่ามีไฟล์เหล่านี้:

```
package/
├── .env.local (ใช้สำหรับ local development เท่านั้น - ห้าม commit)
├── .env.local.example (template สำหรับทีม)
├── .gitignore (ต้องมี .env.local อยู่ในนี้)
└── VERCEL_ENV_SETUP.md (คู่มือการตั้งค่า)
```

### 2. ตรวจสอบ .gitignore

ตรวจสอบว่าไฟล์ `.gitignore` มีบรรทัดนี้:

```
# local env files
.env*.local
.env.local
```

**⚠️ สำคัญ:** ห้าม commit ไฟล์ `.env.local` ขึ้น Git เด็ดขาด!

### 3. การตั้งค่าบน Vercel

#### ขั้นตอนที่ 1: เข้าสู่ Vercel Dashboard

1. ไปที่ https://vercel.com
2. Login ด้วย GitHub account
3. เลือกโปรเจคของคุณ

#### ขั้นตอนที่ 2: ตั้งค่า Environment Variables

1. ไปที่ **Settings → Environment Variables**
2. เพิ่ม Environment Variables ตามตารางด้านล่าง:

| Variable Name                | Example Value                          | Required    | Environment                      |
| ---------------------------- | -------------------------------------- | ----------- | -------------------------------- |
| `FACEBOOK_ACCESS_TOKEN`      | `EAAxxxxxx...`                         | ✅ Yes      | Production, Preview, Development |
| `FACEBOOK_AD_ACCOUNT_ID`     | `act_1234567890`                       | ✅ Yes      | Production, Preview, Development |
| `GOOGLE_ADS_CLIENT_ID`       | `12345-xxx.apps.googleusercontent.com` | ⚠️ Optional | Production, Preview, Development |
| `GOOGLE_ADS_CLIENT_SECRET`   | `GOCSPX-xxxxx`                         | ⚠️ Optional | Production, Preview, Development |
| `GOOGLE_ADS_DEVELOPER_TOKEN` | `xxxxx`                                | ⚠️ Optional | Production, Preview, Development |
| `GOOGLE_ADS_REFRESH_TOKEN`   | `1//0gxxxx`                            | ⚠️ Optional | Production, Preview, Development |
| `GOOGLE_ADS_CUSTOMER_ID`     | `1234567890`                           | ⚠️ Optional | Production, Preview, Development |
| `GOOGLE_SA_CLIENT_EMAIL`     | `xxx@xxx.iam.gserviceaccount.com`      | ⚠️ Optional | Production, Preview, Development |
| `GOOGLE_SA_PRIVATE_KEY`      | `-----BEGIN PRIVATE KEY-----\n...`     | ⚠️ Optional | Production, Preview, Development |
| `GOOGLE_SHEET_ID`            | `1OdHZN...`                            | ⚠️ Optional | Production, Preview, Development |

#### ขั้นตอนที่ 3: ตั้งค่า Environment

สำหรับแต่ละ Variable ให้เลือก Environment ที่ต้องการ:

- ✅ **Production** - สำหรับเว็บไซต์จริง
- ✅ **Preview** - สำหรับ PR และ branch deployments
- ✅ **Development** - สำหรับ `vercel dev` (local)

### 4. วิธีหา Facebook Access Token และ Ad Account ID

#### Facebook Access Token

1. ไปที่ https://developers.facebook.com/tools/explorer/
2. เลือก App ของคุณ
3. Request Permissions:
   - `ads_read`
   - `ads_management`
   - `read_insights`
4. คลิก **Generate Access Token**
5. แนะนำ: ขอ **Long-lived Token** (60 วัน) โดย:
   ```bash
   https://graph.facebook.com/v24.0/oauth/access_token?
     grant_type=fb_exchange_token&
     client_id={your-app-id}&
     client_secret={your-app-secret}&
     fb_exchange_token={short-lived-token}
   ```

#### Facebook Ad Account ID

1. ไปที่ https://business.facebook.com/
2. เลือก **Business Settings → Accounts → Ad Accounts**
3. เลือก Ad Account ที่ต้องการ
4. คัดลอก Account ID (รูปแบบ: `act_1234567890`)

### 5. Deploy ด้วย Vercel CLI

```bash
# 1. ติดตั้ง Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Link โปรเจค
cd package
vercel link

# 4. ตั้งค่า Environment Variables จาก CLI (ถ้าต้องการ)
vercel env add FACEBOOK_ACCESS_TOKEN
# ป้อนค่า token เมื่อถูกถาม
# เลือก environments: Production, Preview, Development

# 5. Deploy
vercel --prod
```

### 6. Deploy ด้วย GitHub (แนะนำ)

1. Push code ขึ้น GitHub:

   ```bash
   git add .

   git push origin main
   ```

2. Vercel จะ auto-deploy ทันทีที่มี commit ใหม่!

3. ตรวจสอบ deployment:
   - ไปที่ Vercel Dashboard → Deployments
   - ดูสถานะและ logs

### 7. ทดสอบ Production

หลัง deploy สำเร็จ ให้ทดสอบ:

```
# ทดสอบ API
https://your-project.vercel.app/api/facebook-ads-campaigns?level=campaign&date_preset=today

# ทดสอบหน้า Dashboard
https://your-project.vercel.app/facebook-ads-manager
```

## 🔧 Troubleshooting

### ปัญหา: ไม่พบ Access Token บน Production

**อาการ:** แสดงข้อความ "ไม่พบ Facebook Access Token"

**วิธีแก้:**

1. ตรวจสอบว่าตั้งค่า `FACEBOOK_ACCESS_TOKEN` ใน Vercel แล้ว
2. ตรวจสอบว่าเลือก Environment เป็น **Production** ✅
3. Re-deploy โปรเจค:
   ```bash
   vercel --prod --force
   ```

### ปัญหา: Token หมดอายุ

**อาการ:** API ส่ง error "Invalid OAuth access token"

**วิธีแก้:**

1. สร้าง Long-lived Token ใหม่ (ดูขั้นตอนด้านบน)
2. อัพเดท `FACEBOOK_ACCESS_TOKEN` ใน Vercel
3. Re-deploy:
   ```bash
   vercel --prod
   ```

### ปัญหา: CORS Error

**อาการ:** ไม่สามารถเรียก API จาก client-side ได้

**วิธีแก้:** เพิ่ม CORS headers ใน API route:

```typescript
// ใน route.ts
export async function GET(request: NextRequest) {
  const response = NextResponse.json({...});

  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  return response;
}
```

## 📊 Monitoring & Logs

### ดู Logs บน Vercel

1. ไปที่ Vercel Dashboard
2. เลือก Deployment
3. คลิกแท็บ **Logs** หรือ **Functions**
4. ดู real-time logs

### ดู Analytics

1. ไปที่ **Analytics** ใน Vercel
2. ดูข้อมูล:
   - Page views
   - Performance metrics
   - Error rates

## 🔐 Security Best Practices

1. **ห้าม hardcode secrets** ในโค้ด
2. **ใช้ Environment Variables** เสมอ
3. **ใช้ Long-lived tokens** แทน short-lived
4. **Rotate tokens** เป็นประจำทุก 30-60 วัน
5. **จำกัด permissions** เฉพาะที่จำเป็น
6. **ตรวจสอบ logs** เป็นประจำ

## 📚 เอกสารเพิ่มเติม

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Facebook Marketing API](https://developers.facebook.com/docs/marketing-apis)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

## ✅ Checklist ก่อน Deploy

- [ ] ตรวจสอบ `.env.local` ไม่อยู่ใน Git
- [ ] ตั้งค่า Environment Variables ใน Vercel ครบถ้วน
- [ ] ทดสอบ API ใน local ผ่าน
- [ ] สร้าง Long-lived Facebook Access Token แล้ว
- [ ] ตรวจสอบ Ad Account ID ถูกต้อง
- [ ] อ่านเอกสาร VERCEL_ENV_SETUP.md แล้ว
- [ ] Commit และ Push code ขึ้น GitHub
- [ ] ทดสอบ Production URL หลัง Deploy

## 🎉 สรุป

เมื่อตั้งค่าครบถ้วนแล้ว:

- ✅ Facebook Ads API จะทำงานได้ทั้งใน Local และ Production
- ✅ Environment Variables ถูกแยกออกจากโค้ด (ปลอดภัย)
- ✅ Auto-deploy ทุกครั้งที่ push code
- ✅ Monitoring และ Logs พร้อมใช้งาน

---

**หมายเหตุ:** ไฟล์นี้สร้างขึ้นเพื่อช่วยในการ deploy Facebook Ads Manager ไปยัง production environment
