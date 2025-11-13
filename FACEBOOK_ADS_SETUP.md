# 🎯 Facebook Ads API Integration Guide

## ขั้นตอนการตั้งค่า Facebook Marketing API

### 1️⃣ สร้าง Facebook App

1. **ไปที่**: https://developers.facebook.com/apps/
2. **คลิก**: "Create App"
3. **เลือก**: "Business" type
4. **กรอกข้อมูล**:
   - App Name: "Facebook Ads Dashboard"
   - App Contact Email: อีเมลของคุณ
5. **คลิก**: Create App
6. **บันทึก**:
   - App ID: `xxxxxxxxxx`
   - App Secret: `xxxxxxxxxx`

---

### 2️⃣ เพิ่ม Marketing API

1. ในหน้า App Dashboard
2. **คลิก**: "Add Product"
3. **เลือก**: "Marketing API"
4. **คลิก**: Set Up

---

### 3️⃣ ขอ Access Token

#### วิธีที่ 1: ใช้ Access Token Tool (แนะนำสำหรับทดสอบ)

1. **ไปที่**: https://developers.facebook.com/tools/accesstoken/
2. **เลือก**: App ที่สร้างไว้
3. **คลิก**: "Generate Access Token"
4. **เลือก Permissions**:
   - `ads_read`
   - `ads_management`
   - `business_management`
5. **คัดลอก**: User Access Token

#### วิธีที่ 2: แปลงเป็น Long-Lived Token (อายุ 60 วัน)

```bash
curl -i -X GET "https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id={app-id}&client_secret={app-secret}&fb_exchange_token={short-lived-token}"
```

---

### 4️⃣ หา Ad Account ID

1. **ไปที่**: https://business.facebook.com/
2. **เลือก**: Business Settings
3. **คลิก**: Accounts → Ad Accounts
4. **คัดลอก**: Ad Account ID (รูปแบบ: `act_1234567890`)

---

### 5️⃣ เพิ่ม Credentials ใน `.env.local`

```env
# Facebook Ads API Configuration
FACEBOOK_APP_ID=your_app_id_here
FACEBOOK_APP_SECRET=your_app_secret_here
FACEBOOK_ACCESS_TOKEN=your_access_token_here
FACEBOOK_AD_ACCOUNT_ID=act_your_account_id_here
```

---

### 6️⃣ ติดตั้ง Facebook Business SDK

```bash
npm install facebook-nodejs-business-sdk
```

---

### 7️⃣ ทดสอบ API

```javascript
const bizSdk = require("facebook-nodejs-business-sdk");
const AdAccount = bizSdk.AdAccount;
const Campaign = bizSdk.Campaign;

const access_token = "YOUR_ACCESS_TOKEN";
const app_secret = "YOUR_APP_SECRET";
const app_id = "YOUR_APP_ID";
const id = "act_YOUR_AD_ACCOUNT_ID";

const api = bizSdk.FacebookAdsApi.init(access_token);
const account = new AdAccount(id);

account.read([AdAccount.Fields.name, AdAccount.Fields.age]).then((account) => {
  console.log(account);
});
```

---

## 📊 ข้อมูลที่สามารถดึงได้

### Campaign Data

- Campaign Name
- Status (Active/Paused)
- Objective
- Budget
- Spend
- Results
- Cost per Result

### Ad Set Data

- Ad Set Name
- Budget
- Schedule
- Targeting
- Impressions
- Clicks
- CTR

### Ad Data

- Ad Name
- Creative
- Impressions
- Clicks
- Conversions
- CPC
- CPM
- CTR
- ROAS

---

## 🔗 API Endpoints ที่ใช้

### Get Campaigns

```
GET /{ad-account-id}/campaigns
```

### Get Campaign Insights

```
GET /{campaign-id}/insights
```

### Get Ad Sets

```
GET /{ad-account-id}/adsets
```

### Get Ads

```
GET /{ad-account-id}/ads
```

---

## ⚠️ ข้อควรระวัง

1. **Access Token หมดอายุ**:

   - Short-lived: 1-2 ชั่วโมง
   - Long-lived: 60 วัน
   - System User Token: ไม่หมดอายุ (แนะนำสำหรับ production)

2. **Rate Limits**:

   - 200 calls per hour per user
   - 4800 calls per day per app

3. **Permissions**:
   - ต้องได้รับอนุญาต `ads_read` และ `ads_management`
   - ต้องมีสิทธิ์เข้าถึง Ad Account

---

## 🚀 ขั้นตอนถัดไป

1. สร้าง Facebook App และได้ App ID + App Secret
2. ขอ Access Token
3. หา Ad Account ID
4. เพิ่มใน `.env.local`
5. ติดตั้ง SDK
6. สร้าง API route
7. ทดสอบดึงข้อมูล

---

## 📚 เอกสารเพิ่มเติม

- [Facebook Marketing API Docs](https://developers.facebook.com/docs/marketing-apis)
- [Business SDK for Node.js](https://github.com/facebook/facebook-nodejs-business-sdk)
- [Access Token Guide](https://developers.facebook.com/docs/facebook-login/guides/access-tokens)
- [Marketing API Quickstart](https://developers.facebook.com/docs/marketing-api/get-started)
