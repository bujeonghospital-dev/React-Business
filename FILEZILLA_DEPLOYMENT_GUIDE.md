# FileZilla Pro Connection Setup Guide for Project Deployment

## Overview

คู่มือนี้อธิบายวิธีการเชื่อมต่อระหว่างโปรเจค development กับ Windows Server ผ่าน FileZilla Pro สำหรับการ deploy และ sync ไฟล์

---

## Connection Configuration

### Server Details

| Setting  | Value                                     |
| -------- | ----------------------------------------- |
| Protocol | SFTP หรือ FTP (ขึ้นอยู่กับ server config) |
| Host     | 192.168.1.10                              |
| Username | Administrator                             |
| Port     | 22 (SFTP) หรือ 21 (FTP)                   |

---

## Step-by-Step Setup

### 1. Create a New Site in Site Manager

1. เปิด FileZilla Pro
2. ไปที่ **File → Site Manager** (หรือกด `Ctrl + S`)
3. คลิก **New Site**
4. ตั้งชื่อตามโปรเจค (เช่น `BJH-Production-Server`)

### 2. Configure Connection Settings

#### General Tab:

- **Protocol:** เลือก `SFTP - SSH File Transfer Protocol` (แนะนำ) หรือ `FTP`
- **Host:** `192.168.1.10`
- **Port:** ปล่อยว่างสำหรับ default หรือใส่ `22` สำหรับ SFTP
- **Logon Type:** `Normal`
- **User:** `Administrator`
- **Password:** ใส่รหัสผ่านของ server

#### Advanced Tab:

- **Default remote directory:** `/C:/Users/Administrator/React-Business_BJH`
- **Default local directory:** `C:\Users\Pac-Man45\OneDrive\Documents\GitHub\React-Business_BJH`

### 3. Transfer Settings (Optional)

- **Transfer Mode:** `Passive` (แนะนำสำหรับ firewall)
- **Limit simultaneous connections:** เปิดใช้ถ้า server มี connection limit

---

## Recommended Workflow for Next.js/React Projects

### Directory Structure Mapping

```
Local (Development)                    Remote (Server)
─────────────────────                  ─────────────────────
/React-Business_BJH                    /C:/inetpub/wwwroot/React-Business_BJH
  ├── .next/                             ├── .next/
  ├── public/                            ├── public/
  ├── src/                               ├── src/
  ├── node_modules/                      ├── node_modules/
  └── package.json                       └── package.json
```

### Files to Upload (Production Build)

หลังจากรัน `npm run build`:

- ✅ `.next/` folder (compiled output)
- ✅ `public/` folder (static assets)
- ✅ `package.json` และ `package-lock.json`
- ✅ `.env.production` (environment variables)
- ✅ `next.config.js`
- ✅ `src/` folder (source code)

### Files to Exclude

สร้าง filter ใน FileZilla เพื่อ exclude:

- ❌ `node_modules/` (install บน server แทน)
- ❌ `.git/`
- ❌ `.env.local`
- ❌ `*.log`

---

## Setting Up Synchronized Browsing

1. ใน **Site Manager → Advanced Tab**
2. เปิด **Synchronized Browsing**
3. ตั้ง local และ remote directories ให้ตรงกัน
4. ทำให้ทั้งสอง panel sync กันเมื่อ navigate

---

## Quick Deployment Checklist

- [ ] Build project locally: `npm run build`
- [ ] Connect to server via FileZilla
- [ ] Upload `.next/`, `public/`, และ config files
- [ ] Run `npm install --production` on server (ถ้าจำเป็น)
- [ ] Restart the application/IIS service

---

## SFTP vs FTP - เปรียบเทียบ

### SFTP คืออะไร?

**SFTP (SSH File Transfer Protocol)** คือโปรโตคอลสำหรับถ่ายโอนไฟล์ที่ทำงานผ่าน SSH ซึ่งมีการเข้ารหัสข้อมูลทั้งหมดระหว่างการส่ง

| คุณสมบัติ   | FTP                          | SFTP               |
| ----------- | ---------------------------- | ------------------ |
| การเข้ารหัส | ❌ ไม่มี (ส่งแบบ plain text) | ✅ เข้ารหัสทั้งหมด |
| Port        | 21                           | 22                 |
| ความปลอดภัย | ต่ำ                          | สูง                |
| รหัสผ่าน    | ส่งแบบไม่เข้ารหัส            | ส่งแบบเข้ารหัส     |
| Firewall    | ต้องเปิดหลาย port            | เปิดแค่ port 22    |

### เหมาะกับงานไหม?

| สถานการณ์                             | แนะนำ        |
| ------------------------------------- | ------------ |
| Server อยู่ใน LAN เดียวกัน (internal) | FTP ก็พอได้  |
| Server เข้าถึงผ่าน internet           | ต้องใช้ SFTP |
| ต้องการความปลอดภัยสูง                 | SFTP         |

> **หมายเหตุ:** เนื่องจาก `192.168.1.10` เป็น IP ภายใน (LAN) การใช้ FTP ก็ยังพอรับได้ แต่ถ้า server รองรับ SFTP แนะนำให้ใช้ SFTP ดีกว่าเพราะปลอดภัยกว่า

---

## Security Recommendations

1. ✅ ใช้ **SFTP** แทน plain FTP สำหรับ encrypted transfers
2. ✅ ใช้ **SSH key authentication** แทน password ถ้าเป็นไปได้
3. ✅ **จำกัด Administrator access** — สร้าง dedicated deployment user
4. ✅ เปิด **firewall rules** เพื่อจำกัด access เฉพาะ trusted IPs

---

## วิธีเช็คว่า Server รองรับอะไร

1. ลองเชื่อมต่อด้วย **SFTP (port 22)** ก่อน
2. ถ้าไม่ได้ ให้เปลี่ยนเป็น **FTP (port 21)**

### สำหรับ Windows Server:

- ถ้าเป็น Windows Server ปกติ → มักใช้ FTP เพราะ Windows ไม่ได้เปิด SSH มาให้โดย default
- ถ้าติดตั้ง **OpenSSH** บน server แล้ว → ใช้ SFTP ได้

---

## Troubleshooting

### Connection Failed

```
Error: Connection refused
```

**แก้ไข:**

- ตรวจสอบว่า FTP/SFTP service ทำงานอยู่บน server
- ตรวจสอบ firewall ว่าเปิด port 21 หรือ 22

### Authentication Failed

```
Error: Authentication failed
```

**แก้ไข:**

- ตรวจสอบ username และ password
- ตรวจสอบสิทธิ์ user ในการ access folder

### Timeout

```
Error: Connection timed out
```

**แก้ไข:**

- ลอง Passive mode แทน Active mode
- ตรวจสอบ network connectivity

---

## Related Files

- API routes: `src/app/api/`
- Environment check: `scripts/check-env-local.js`
- Database schema: `database-schema.sql`

---

_Last Updated: November 27, 2025_
