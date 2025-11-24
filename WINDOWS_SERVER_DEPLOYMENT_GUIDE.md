# Windows Server 2022 Deployment Guide

## วิธีการ Deploy Next.js Application บน Windows Server 2022

### ขั้นตอนที่ 1: ติดตั้ง Node.js

1. ดาวน์โหลด Node.js LTS version จาก https://nodejs.org/
2. ติดตั้งบน Windows Server
3. ตรวจสอบการติดตั้ง:

```powershell
node --version
npm --version
```

### ขั้นตอนที่ 2: Copy โปรเจคไปยัง Server

1. Copy ทั้งโฟลเดอร์ไปยัง Server (เช่น `C:\inetpub\wwwroot\react-business\`)
2. หรือใช้ Git:

```powershell
cd C:\inetpub\wwwroot\
git clone https://github.com/thanakon-film60/React-Business.git
cd React-Business
```

### ขั้นตอนที่ 3: ตั้งค่า Environment Variables

**วิธีที่ 1: ใช้ไฟล์ .env.production (แนะนำ)**

1. Copy ไฟล์ `.env.production` ไปยัง root directory ของโปรเจค
2. ตรวจสอบว่าไฟล์มีค่าที่ถูกต้อง

**วิธีที่ 2: ตั้งค่า System Environment Variables**

เปิด PowerShell แบบ Administrator:

```powershell
# Facebook Ads Configuration
[System.Environment]::SetEnvironmentVariable('FACEBOOK_ACCESS_TOKEN', 'EAAPb1ZBYCiNcBPzNxxSUntCZCTVHyl5AkAZBIiwCmDzrWKMLU4VEHJxRve7oqUDSaMs8om9pdVWFLzUdeTbTvkGPuTeuQ4KvGFizMy3VsSid8vgmjZB8OMoLySRmXxyAUpAwyyhSqOO8tSZAU6IYpxarsXBbZCDzFdy8u279HxSXtyWMpIolRtjJEWLdmfU5SwZCsP5', 'Machine')
[System.Environment]::SetEnvironmentVariable('FACEBOOK_AD_ACCOUNT_ID', 'act_454323590676166', 'Machine')

# Database Configuration
[System.Environment]::SetEnvironmentVariable('DATABASE_URL', 'postgresql://postgres:Bjh12345!!@n8n.bjhbangkok.com:5432/postgres', 'Machine')
[System.Environment]::SetEnvironmentVariable('DB_HOST', 'n8n.bjhbangkok.com', 'Machine')
[System.Environment]::SetEnvironmentVariable('DB_PORT', '5432', 'Machine')
[System.Environment]::SetEnvironmentVariable('DB_USER', 'postgres', 'Machine')
[System.Environment]::SetEnvironmentVariable('DB_PASSWORD', 'Bjh12345!!', 'Machine')
[System.Environment]::SetEnvironmentVariable('DB_NAME', 'postgres', 'Machine')
[System.Environment]::SetEnvironmentVariable('DB_SCHEMA', 'BJH-Server', 'Machine')

# Python API
[System.Environment]::SetEnvironmentVariable('PYTHON_API_URL', 'https://believable-ambition-production.up.railway.app', 'Machine')

# Google Services (Optional)
[System.Environment]::SetEnvironmentVariable('GOOGLE_SHEET_ID', '1OdHZNSlS-SrUpn4wIEn_6tegeVkv3spBfj-FyRRxg3Y', 'Machine')
```

### ขั้นตอนที่ 4: Build Application

```powershell
# ติดตั้ง dependencies
npm install

# Build application
npm run build
```

### ขั้นตอนที่ 5: เริ่มรัน Application

**วิธีที่ 1: รันด้วย npm start (Production Mode)**

```powershell
npm start
```

**วิธีที่ 2: ใช้ PM2 (Process Manager - แนะนำ)**

```powershell
# ติดตั้ง PM2
npm install -g pm2

# เริ่มรัน application
pm2 start npm --name "react-business" -- start

# ตั้งค่าให้รันอัตโนมัติเมื่อ restart server
pm2 startup windows
pm2 save
```

**วิธีที่ 3: ใช้ Windows Service (แนะนำสำหรับ Production)**

ติดตั้ง node-windows:

```powershell
npm install -g node-windows
```

สร้างไฟล์ `service-install.js`:

```javascript
var Service = require("node-windows").Service;

// Create a new service object
var svc = new Service({
  name: "React Business App",
  description: "React Business Next.js Application",
  script:
    "C:\\inetpub\\wwwroot\\React-Business\\node_modules\\next\\dist\\bin\\next",
  scriptOptions: "start",
  nodeOptions: ["--harmony", "--max_old_space_size=4096"],
  env: [
    {
      name: "NODE_ENV",
      value: "production",
    },
    {
      name: "PORT",
      value: "3000",
    },
  ],
});

// Listen for the "install" event
svc.on("install", function () {
  svc.start();
});

svc.install();
```

รันไฟล์:

```powershell
node service-install.js
```

### ขั้นตอนที่ 6: ตั้งค่า IIS Reverse Proxy (ถ้าใช้ IIS)

1. ติดตั้ง IIS URL Rewrite และ Application Request Routing (ARR)
2. เปิด IIS Manager
3. สร้างไฟล์ `web.config` ใน root directory:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="ReverseProxyInboundRule1" stopProcessing="true">
          <match url="(.*)" />
          <action type="Rewrite" url="http://localhost:3000/{R:1}" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

### ขั้นตอนที่ 7: เปิด Firewall Port

```powershell
# เปิด port 3000 (ถ้ารัน Next.js โดยตรง)
New-NetFirewallRule -DisplayName "Next.js Port 3000" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow

# หรือเปิด port 80/443 (ถ้าใช้ IIS)
New-NetFirewallRule -DisplayName "HTTP Port 80" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "HTTPS Port 443" -Direction Inbound -LocalPort 443 -Protocol TCP -Action Allow
```

### ขั้นตอนที่ 8: ตรวจสอบการทำงาน

1. เปิดเว็บเบราว์เซอร์
2. ไปที่ `http://your-server-ip:3000` หรือ `https://app.bjhbangkok.com`
3. ตรวจสอบว่าหน้า Facebook Ads Manager แสดงผลได้

### Troubleshooting

**ปัญหา: ไม่พบ Facebook Access Token**

ตรวจสอบ environment variables:

```powershell
# ตรวจสอบ environment variable
[System.Environment]::GetEnvironmentVariable('FACEBOOK_ACCESS_TOKEN', 'Machine')

# หรือใช้
Get-ChildItem Env: | Where-Object { $_.Name -like '*FACEBOOK*' }
```

**ปัญหา: Port 3000 ถูกใช้งานอยู่แล้ว**

```powershell
# ค้นหา process ที่ใช้ port 3000
Get-NetTCPConnection -LocalPort 3000 | Select-Object -Property OwningProcess

# หยุด process
Stop-Process -Id <PROCESS_ID> -Force
```

**ปัญหา: Database connection timeout**

ตรวจสอบว่า Windows Server สามารถเชื่อมต่อกับ PostgreSQL server ได้:

```powershell
Test-NetConnection -ComputerName n8n.bjhbangkok.com -Port 5432
```

### การ Update Application

```powershell
# หยุด service
pm2 stop react-business

# Pull code ใหม่
git pull origin main

# ติดตั้ง dependencies ใหม่ (ถ้ามี)
npm install

# Build ใหม่
npm run build

# เริ่มรัน service
pm2 start react-business
```

### การดู Logs

**ถ้าใช้ PM2:**

```powershell
pm2 logs react-business
```

**ถ้าใช้ Windows Service:**

- เปิด Event Viewer
- ไปที่ Windows Logs > Application
- ค้นหา logs จาก "React Business App"

### Performance Optimization

1. **เพิ่ม Memory สำหรับ Node.js:**

```powershell
$env:NODE_OPTIONS="--max-old-space-size=4096"
```

2. **Enable Compression ใน IIS** (ถ้าใช้ IIS)

3. **ตั้งค่า Caching:**
   - Static files ควร cache ที่ CDN หรือ IIS
   - API responses ควรมี proper cache headers

### Security

1. **Firewall:**

   - เปิดเฉพาะ port ที่จำเป็น
   - ใช้ VPN หรือ IP Whitelist สำหรับ admin access

2. **HTTPS:**

   - ติดตั้ง SSL Certificate
   - ใช้ Let's Encrypt หรือซื้อ SSL certificate

3. **Environment Variables:**
   - ไม่เก็บ sensitive data ใน code
   - ใช้ Windows Credential Manager หรือ Azure Key Vault

### Monitoring

1. **ใช้ PM2 Monitoring:**

```powershell
pm2 monit
```

2. **ตั้งค่า Windows Performance Monitor**

3. **ใช้ Application Insights หรือ New Relic**

## คำสั่งที่มีประโยชน์

```powershell
# ตรวจสอบ Next.js version
npx next --version

# Clear Next.js cache
Remove-Item -Recurse -Force .next

# ตรวจสอบ port ที่เปิดอยู่
Get-NetTCPConnection -State Listen

# ตรวจสอบ Node.js processes
Get-Process node

# Restart application (PM2)
pm2 restart react-business

# Check system resources
Get-Counter '\Processor(_Total)\% Processor Time'
Get-Counter '\Memory\Available MBytes'
```
