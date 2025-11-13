# 🚀 Deploy to Vercel - Environment Variables Setup

## 📋 Environment Variables ที่ต้องเพิ่มใน Vercel

ไปที่: https://vercel.com/your-project/settings/environment-variables

เพิ่ม 3 ตัวนี้:

---

### 1️⃣ GOOGLE_SPREADSHEET_ID

```
Name: GOOGLE_SPREADSHEET_ID
Value: 1OdHZNSlS-SrUpn4wIEn_6tegeVkv3spBfj-FyRRxg3Y
```

---

### 2️⃣ GOOGLE_SERVICE_ACCOUNT_EMAIL

```
Name: GOOGLE_SERVICE_ACCOUNT_EMAIL
Value: web-sheets-reader@name-tel-dev.iam.gserviceaccount.com
```

---

### 3️⃣ GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY

```
Name: GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
Value: (คัดลอกทั้งหมดด้านล่าง - รวม -----BEGIN และ -----END)
```

**⚠️ สำคัญ**: คัดลอกทั้งหมดตามนี้ (รวมขึ้นบรรทัดใหม่):

```
-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCZ97WjLIORTUMU
pAh6tEiL9iktiTN8TbwdlAO3lin58vAIMkeAqYxTswV+ewS4Uw3wgABZZyDREfKG
iX9er5C3MYQm08g6J8ZUbuYDVHL2aPcxJ2lfG7XzOTOeq7QhSxTZwLVAf4RAdV0m
bPyZHDToFoUwNgrXqys6/66eE3MocbN+RHLxHTO22ufKiRUN0gk3wYbYq5LDmT+f
OyfrViuTFWcnAnMHtHjfIPNsnpYXNqXOkpOFY2PvgGntcwoZKB/Eud4mYW8e0Dn1
oe5C+KEcljrxsianyfkRZRv17rW9xwu9kQ0RzqkZsuL7Ga8L22FrIrPmnx24Huns
25wtioC/AgMBAAECggEABTHBM/8VdTp5D+I00wbwB6DHZNzjGsd4mDrdIT10rxUO
GgiwNtwBevVoMwstbpaGut1mpZ2AEu2bFAThgi1EIZoPDkxIzgV3gHO5WNVph3yl
Ekh1GptRuSHt5uV+Dz18N5hzxPhIWvBasygsIXI9KrNPzP+VwA7rR3NGzdh0IyId
c7MVDTMA3exlLAeEfMzOoAwVz2a6jYueHs4pXAJqTg/dCTOqOwR6DqQJKn93jrwz
advMDrQFe7JQbfzAti5RcPvxA8n7qTsprpEZGZ4oYfKcNRumKQPxQpuBA7I+s/LC
BpmbCb5HJllLHuPxnDHNkxUYDgzhMobikpmjTFQqOQKBgQDSr/6Tz2wq4j1vdQob
xssxljEZGZY6M+NUUa8yny/6qQyHBwgAFBp1I4gj2Kd8l9yphMUAggzBf05m77sO
0MeUmBCRZx/GnN6FHQ48IhIynBMGcNEL1E59jWhscnnod4rwUUf9cG6IT5vvyXLG
i5a2i8e9ZxaftHvhWQIbMUtFdQKBgQC7FNb6ij0gV+J3eWzZ+pMfyCdtsKnnLSh4
DFPIlbLVRfK/0Dy+XTstoh0PMqH9zS/SmVKe4YUojLOtCz6O6njm9OyvxjQs0yEw
MCK6f3dk4TGPFGfY3h9m15xlgP6nvNxbLc3odGoZEzbaKcVq285cuycw8+eF1yp9
dsNmlx0C4wKBgHPQDJfBqEr2bCDtbC4Sm7VZQwnyF7NMvISoFi80dBJMhLdgtRQd
+OE1M+vId2C0tbZ1Zjk+Q7bFvRo2Y1PkjiDvagQTdNMffe4cJ6wEao5pXsfmkfL3
tGGtrp4WW07fD3/EnlcBS7EgWa54xN/A8YrM0XIazcPiWUppPBAoi6DVAoGAGZdn
NQyWAgejph5JIqRhXdaediXViBcoUwu0plq8BOq1o0GUHaJZRwvHF94gRLy9zvxE
ThGhioN8zK4eF6TBdy6H9h+R4ZPcFWBwT7zCE12uztjGv+bautHBxizYKQ/vwNVK
NoM+REHZngxawhxhZVQAr3Sd9jQRzunhHvaK9GsCgYANcQ/IJJgWR8DcaMRTG5Zx
ez2xeda/4GXQ5pq2R0DTSfW985s/f1/4ms0FOsJHB8SrXPobyOgQBJVP1Lg2faUW
CHkHcDaQUJnGo8/i0+g6QOQJcBKaoPzeyiNSkg4/u55rXKagPtNWOyl9VCUNYbmJ
fPCvcFPqJVxMt92O5J3B7Q==
-----END PRIVATE KEY-----
```

---

## 📝 วิธีเพิ่ม Environment Variables ใน Vercel

### ขั้นตอนที่ 1: เข้าสู่ Project Settings

1. ไปที่ https://vercel.com
2. เลือก Project ของคุณ
3. คลิก **Settings** (ด้านบน)
4. เลือก **Environment Variables** (เมนูซ้าย)

### ขั้นตอนที่ 2: เพิ่ม Environment Variables

สำหรับแต่ละตัวแปร:

1. คลิกปุ่ม **Add New** หรือ **+ New Variable**
2. ใส่ **Name** (ชื่อตัวแปร)
3. ใส่ **Value** (ค่า)
4. เลือก Environment:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. คลิก **Save**

### ⚠️ หมายเหตุสำคัญสำหรับ Private Key:

**ตัวเลือกที่ 1: คัดลอกทั้งหมด (แนะนำ)**

- คัดลอกทั้ง Private Key รวม `-----BEGIN PRIVATE KEY-----` และ `-----END PRIVATE KEY-----`
- วางใน Value field ของ Vercel
- Vercel จะจัดการ newlines อัตโนมัติ

**ตัวเลือกที่ 2: ใช้ \n (ถ้าตัวเลือก 1 ไม่ได้)**

- แทนที่ขึ้นบรรทัดใหม่ด้วย `\n`
- จะได้เป็นบรรทัดเดียวยาวๆ:

```
-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhki...\n-----END PRIVATE KEY-----\n
```

---

## 🔄 ขั้นตอนที่ 3: Redeploy

หลังจากเพิ่ม Environment Variables แล้ว:

1. ไปที่แท็บ **Deployments**
2. เลือก deployment ล่าสุด
3. คลิก **⋮** (three dots)
4. เลือก **Redeploy**
5. เลือก **Use existing Build Cache** (ถ้ามี)
6. คลิก **Redeploy**

หรือ:

```bash
# Push code ใหม่เพื่อ trigger deployment
git commit --allow-empty -m "Trigger redeploy with new env vars"
git push
```

---

## ✅ ตรวจสอบว่าทำงาน

หลัง deploy เสร็จ:

1. เปิด production URL ของคุณ
2. ไปที่ `/performance-surgery-schedule`
3. ควรเห็นข้อมูลโหลดขึ้นมา

---

## 🔍 Debug ถ้าไม่ทำงาน

### 1. ตรวจสอบ Environment Variables

- ไปที่ Vercel Settings > Environment Variables
- ตรวจสอบว่ามีครบ 3 ตัว
- ตรวจสอบชื่อตัวแปรว่าสะกดถูกต้อง (ไม่มีช่องว่างหรือตัวอักษรพิเศษ)

### 2. ตรวจสอบ Logs

- ไปที่ Vercel Dashboard > Deployments
- เลือก deployment ล่าสุด
- คลิก **View Function Logs**
- ดู error messages

### 3. ตรวจสอบว่า Google Sheet ถูกแชร์แล้ว

- เปิด Google Sheet
- คลิก "แชร์"
- ตรวจสอบว่ามี `web-sheets-reader@name-tel-dev.iam.gserviceaccount.com`
- สิทธิ์: Viewer

### 4. Test API Route

เปิด: `https://your-domain.vercel.app/api/surgery-schedule`

ถ้าทำงานจะเห็น JSON response พร้อมข้อมูล

---

## 📚 สรุปสั้นๆ

**3 Environment Variables:**

1. `GOOGLE_SPREADSHEET_ID` = `1OdHZNSlS-SrUpn4wIEn_6tegeVkv3spBfj-FyRRxg3Y`
2. `GOOGLE_SERVICE_ACCOUNT_EMAIL` = `web-sheets-reader@name-tel-dev.iam.gserviceaccount.com`
3. `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` = (Private key ทั้งหมด รวม BEGIN/END)

**แชร์ Google Sheet กับ:**
`web-sheets-reader@name-tel-dev.iam.gserviceaccount.com` (Viewer)

**Redeploy หลังตั้งค่า:**
Vercel > Deployments > Redeploy

---

**เสร็จแล้ว!** 🎉

Production URL จะสามารถเข้าถึง Google Sheet ได้แล้ว
