# React Business - Facebook Ads Manager

## 📱 Mobile Responsive Update (v2.0.0)

✅ **รองรับมือถือทุกรุ่น!** เว็บไซต์ได้รับการปรับปรุงด้วย ScaledCanvas และ Responsive Web Design

👉 **คู่มือสำหรับมือถือ:** [FACEBOOK_ADS_MOBILE_RESPONSIVE_GUIDE.md](./FACEBOOK_ADS_MOBILE_RESPONSIVE_GUIDE.md)  
👉 **การทดสอบมือถือ:** [MOBILE_TESTING_CHECKLIST.md](./MOBILE_TESTING_CHECKLIST.md)

### 🎯 Features

- ✅ รองรับ iPhone, iPad, Android ทุกรุ่น
- ✅ Responsive Design ด้วย ScaledCanvas
- ✅ Touch-friendly Interface (44x44px buttons)
- ✅ Horizontal Scroll Tables
- ✅ Portrait & Landscape Support
- ✅ Auto-refresh ทุก 1 นาที

### 📱 Quick Mobile Testing

```bash
# Windows PowerShell
.\test-mobile.ps1
```

---

## 🚀 Quick Start for Production

**มีปัญหาเรื่อง "ไม่พบ Access Token" บน Production?**

👉 อ่านคู่มือด่วน: [QUICK_START_PRODUCTION.md](./package/QUICK_START_PRODUCTION.md)

### ✅ สำหรับ Production (Vercel/Netlify)

1. ตั้งค่า Environment Variables ใน platform dashboard
2. ไม่ต้องแก้โค้ด!

```bash
# Required
FACEBOOK_ACCESS_TOKEN=your_token
FACEBOOK_AD_ACCOUNT_ID=act_1234567890
```

📖 **อ่านคู่มือเพิ่มเติม:**

- [PRODUCTION_DEPLOYMENT.md](./package/PRODUCTION_DEPLOYMENT.md) - คู่มือฉบับเต็ม
- [VERCEL_ENV_SETUP.md](./package/VERCEL_ENV_SETUP.md) - การตั้งค่า Vercel

### 🧪 ตรวจสอบการตั้งค่า

```bash
# ทดสอบว่าตั้งค่าครบหรือยัง
curl https://your-project.vercel.app/api/check-env
```

---

## 🏃‍♂️ Local Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd React-Business/package

# 2. Install dependencies
npm install

# 3. สร้างไฟล์ .env.local (copy from .env.local.example)
cp .env.local.example .env.local

# 4. แก้ไขค่าใน .env.local
# เพิ่ม FACEBOOK_ACCESS_TOKEN และ FACEBOOK_AD_ACCOUNT_ID

# 5. Run development server
npm run dev
```

Open http://localhost:3000

---

## 📁 Project Structure

```
package/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── check-env/          # ตรวจสอบ env vars
│   │   │   ├── facebook-ads-campaigns/
│   │   │   ├── facebook-ads-insights/
│   │   │   ├── google-ads/
│   │   │   └── google-sheets-data/
│   │   ├── facebook-ads-manager/   # Dashboard หลัก
│   │   └── ...
│   └── components/
├── .env.local.example              # Template สำหรับ local
├── PRODUCTION_DEPLOYMENT.md        # คู่มือ production
├── QUICK_START_PRODUCTION.md       # คู่มือด่วน
└── VERCEL_ENV_SETUP.md             # Vercel setup
```

---

## 🔧 Features

- ✅ Facebook Ads Manager Dashboard
- ✅ Real-time data updates (auto-refresh every 1 minute)
- ✅ Campaign/AdSet/Ad level insights
- ✅ Google Sheets integration
- ✅ Google Ads integration
- ✅ Custom date range picker
- ✅ Export data

---

## 📚 Documentation

| Document                                                                 | Description                      |
| ------------------------------------------------------------------------ | -------------------------------- |
| [QUICK_START_PRODUCTION.md](./package/QUICK_START_PRODUCTION.md)         | เริ่มต้น deploy ใน 10 นาที       |
| [PRODUCTION_DEPLOYMENT.md](./package/PRODUCTION_DEPLOYMENT.md)           | คู่มือ deploy ฉบับเต็ม           |
| [VERCEL_ENV_SETUP.md](./package/VERCEL_ENV_SETUP.md)                     | การตั้งค่า Environment Variables |
| [FACEBOOK_ADS_SETUP.md](./package/FACEBOOK_ADS_SETUP.md)                 | การตั้งค่า Facebook Ads API      |
| [GOOGLE_ADS_DASHBOARD_SETUP.md](./package/GOOGLE_ADS_DASHBOARD_SETUP.md) | การตั้งค่า Google Ads            |

---

## 🐛 Troubleshooting

### ❌ "ไม่พบ Access Token"

**Local Development:**

```bash
# สร้างไฟล์ .env.local
echo "FACEBOOK_ACCESS_TOKEN=your_token" >> .env.local
echo "FACEBOOK_AD_ACCOUNT_ID=act_123456" >> .env.local
```

**Production (Vercel):**

1. Vercel Dashboard → Settings → Environment Variables
2. เพิ่ม `FACEBOOK_ACCESS_TOKEN` และ `FACEBOOK_AD_ACCOUNT_ID`
3. Re-deploy

### ❌ "Invalid OAuth access token"

Token หมดอายุ → สร้าง Long-lived token ใหม่:

```bash
curl "https://graph.facebook.com/v24.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=SHORT_LIVED_TOKEN"
```

---

## 🔐 Security

- ✅ ใช้ Environment Variables (ไม่ hardcode secrets)
- ✅ `.env.local` ถูกละเว้นโดย `.gitignore`
- ✅ API routes รองรับทั้ง development และ production
- ✅ Error messages แยกตาม environment

---

## 📊 API Endpoints

| Endpoint                      | Description                    |
| ----------------------------- | ------------------------------ |
| `/api/check-env`              | ตรวจสอบ environment variables  |
| `/api/facebook-ads-campaigns` | Facebook Ads insights          |
| `/api/facebook-ads-insights`  | Facebook Ads insights (legacy) |
| `/api/google-ads`             | Google Ads data                |
| `/api/google-sheets-data`     | Google Sheets data             |

---

## 🎯 Deployment

### Vercel (แนะนำ)

```bash
# CLI
vercel --prod

# หรือ GitHub Integration (auto-deploy)
git push origin main
```

### Netlify

```bash
netlify deploy --prod
```

---

## 📝 License

MIT

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 💡 Tips

- 🔄 ใช้ Long-lived tokens (อายุ 60 วัน)
- 📅 Rotate tokens ทุก 30-60 วัน
- 🔍 Monitor logs ใน Vercel Dashboard
- 📊 ใช้ `/api/check-env` เช็คการตั้งค่า

---

**Made with ❤️ for efficient Facebook Ads management**
