# 🚀 วิธีการรัน Flutter Facebook Ads Manager App

## 📋 ขั้นตอนการรัน

### 1. ติดตั้ง Dependencies

```powershell
cd flutter_facebook_ads_app
flutter pub get
```

### 2. ตรวจสอบว่า Flutter พร้อมใช้งาน

```powershell
flutter doctor
```

### 3. เชื่อมต่ออุปกรณ์หรือเปิด Emulator

**สำหรับ Android:**

- เปิด Android Emulator จาก Android Studio
- หรือเชื่อมต่อโทรศัพท์ Android (เปิด USB Debugging)

**สำหรับ iOS (Mac only):**

- เปิด iOS Simulator
- หรือเชื่อมต่อ iPhone (ต้องมี Apple Developer Account)

**ตรวจสอบอุปกรณ์:**

```powershell
flutter devices
```

### 4. รันแอป

```powershell
flutter run
```

หรือเลือกอุปกรณ์เฉพาะ:

```powershell
flutter run -d <device-id>
```

### 5. Hot Reload (ขณะรัน)

- กด `r` - Hot reload (รีโหลดเฉพาะส่วนที่เปลี่ยน)
- กด `R` - Hot restart (รีสตาร์ทแอปทั้งหมด)
- กด `q` - ออกจากโหมด debug

## 🔧 การ Build APK/IPA

### Build Android APK (สำหรับติดตั้งบนโทรศัพท์)

```powershell
flutter build apk --release
```

ไฟล์จะอยู่ที่: `build\app\outputs\flutter-apk\app-release.apk`

### Build Android App Bundle (สำหรับ Play Store)

```powershell
flutter build appbundle --release
```

ไฟล์จะอยู่ที่: `build\app\outputs\bundle\release\app-release.aab`

### ติดตั้ง APK บนโทรศัพท์

```powershell
flutter install
```

## 🐛 แก้ปัญหาที่พบบ่อย

### 1. Gradle Build Failed

```powershell
cd android
./gradlew clean
cd ..
flutter clean
flutter pub get
```

### 2. iOS Build Failed (Mac)

```powershell
cd ios
pod deintegrate
pod install
cd ..
flutter clean
flutter pub get
```

### 3. Dependencies Error

```powershell
flutter pub cache repair
flutter pub get
```

### 4. Emulator ไม่ขึ้น

```powershell
# ตรวจสอบ emulator ที่มี
flutter emulators

# เปิด emulator
flutter emulators --launch <emulator-id>
```

## 📱 การทดสอบบนโทรศัพท์จริง

### Android

1. เปิด **Developer Options** บนโทรศัพท์
2. เปิด **USB Debugging**
3. เชื่อมต่อโทรศัพท์กับคอมพิวเตอร์
4. อนุญาตให้คอมพิวเตอร์เข้าถึง (กด Allow)
5. รัน `flutter devices` เพื่อตรวจสอบ
6. รัน `flutter run`

### iOS (Mac only)

1. เชื่อมต่อ iPhone กับ Mac
2. เปิด **Xcode** → **Preferences** → **Accounts** → เพิ่ม Apple ID
3. เปิดไฟล์ `ios/Runner.xcworkspace` ใน Xcode
4. เลือก iPhone เป็น Target Device
5. กด Run หรือใช้ `flutter run`

## 🎨 การปรับแต่ง App Icon และชื่อ

### เปลี่ยนชื่อแอป

**Android** - แก้ที่ `android/app/src/main/AndroidManifest.xml`:

```xml
<application
    android:label="ชื่อแอปของคุณ"
    ...>
```

**iOS** - แก้ที่ `ios/Runner/Info.plist`:

```xml
<key>CFBundleName</key>
<string>ชื่อแอปของคุณ</string>
```

### เปลี่ยน App Icon

1. เตรียมไฟล์ icon (1024x1024 px)
2. ใช้ [App Icon Generator](https://www.appicon.co/)
3. แทนที่ไฟล์ใน:
   - Android: `android/app/src/main/res/mipmap-*/`
   - iOS: `ios/Runner/Assets.xcassets/AppIcon.appiconset/`

## ⚡ การเพิ่มประสิทธิภาพ

### Build สำหรับ Production (เร็วและเบากว่า)

```powershell
flutter build apk --release --split-per-abi
```

### ตรวจสอบขนาดแอป

```powershell
flutter build apk --analyze-size
```

### Profile Mode (ทดสอบประสิทธิภาพ)

```powershell
flutter run --profile
```

## 📊 การ Debug

### เปิด DevTools

```powershell
flutter pub global activate devtools
flutter pub global run devtools
```

### ดู Logs

```powershell
flutter logs
```

### ตรวจสอบ Performance

```powershell
flutter run --profile
# จากนั้นเปิด DevTools
```

## 🔒 ข้อกำหนดด้านความปลอดภัย

### เพิ่ม API Key (ถ้ามี)

สร้างไฟล์ `.env` ที่ root:

```
API_BASE_URL=https://believable-ambition-production.up.railway.app/api
```

### Hide Sensitive Data

แก้ไข `.gitignore`:

```
.env
android/key.properties
ios/Runner/GoogleService-Info.plist
```

## 📦 การ Deploy

### Google Play Store

1. Build App Bundle: `flutter build appbundle --release`
2. Sign App Bundle (ต้องมี keystore)
3. Upload ไปที่ Play Console

### Apple App Store

1. Build iOS: `flutter build ios --release`
2. Open Xcode → Archive
3. Upload to App Store Connect

## 💡 Tips & Tricks

### ใช้ VS Code

- ติดตั้ง Extension: **Flutter** และ **Dart**
- กด `F5` เพื่อรันแอป
- ใช้ Hot Reload อัตโนมัติ

### ใช้ Android Studio

- เปิดโฟลเดอร์ `flutter_facebook_ads_app`
- เลือกอุปกรณ์ที่ต้องการรัน
- กดปุ่ม Run (▶️)

### คำสั่งที่ใช้บ่อย

```powershell
flutter clean          # ลบ cache และ build files
flutter pub get        # ติดตั้ง dependencies
flutter pub upgrade    # อัพเดท dependencies
flutter doctor -v      # ตรวจสอบ Flutter environment แบบละเอียด
flutter channel stable # เปลี่ยนไปใช้ stable channel
```

## 🎯 Quick Start (สำหรับคนรีบ)

```powershell
# 1. ติดตั้ง dependencies
cd flutter_facebook_ads_app
flutter pub get

# 2. รันแอป
flutter run

# 3. Build APK (ถ้าต้องการติดตั้งบนโทรศัพท์)
flutter build apk --release
```

---

**หมายเหตุ:** แอปนี้ต้องการการเชื่อมต่ออินเทอร์เน็ตเพื่อดึงข้อมูลจาก API

**ขึ้นไป แล้วเริ่มใช้งานได้เลย! 🚀**
