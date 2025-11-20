# 📱 Mobile Testing Checklist

## ✅ Pre-Deployment Testing

### **1. Visual Testing**

- [ ] หน้าจอโหลดสมบูรณ์บนมือถือ
- [ ] Navigation ปุ่มแสดงเป็น Dropdown บนมือถือ
- [ ] ตารางมี Horizontal Scroll ที่ทำงาน
- [ ] Cards แสดงเป็น Single Column บนมือถือ
- [ ] Modal เปิด-ปิดได้ปกติ
- [ ] รูปภาพโหลดถูกต้อง
- [ ] วิดีโอเล่นได้บนมือถือ

### **2. Interaction Testing**

- [ ] ปุ่มทั้งหมดกดได้ (min 44x44px)
- [ ] Dropdown ทำงานปกติ
- [ ] Date Picker เปิดได้บนมือถือ
- [ ] Scroll ทำงานได้ลื่น (Touch Scrolling)
- [ ] Modal ปิดได้เมื่อกดนอกพื้นที่
- [ ] Table แนวนอน Scroll ได้

### **3. Orientation Testing**

- [ ] Portrait Mode ทำงานปกติ
- [ ] Landscape Mode ทำงานปกติ
- [ ] หมุนหน้าจอไม่เกิด Layout Shift
- [ ] Content ปรับตัวอัตโนมัติ

### **4. Performance Testing**

- [ ] หน้าเว็บโหลดไม่เกิน 3 วินาที
- [ ] ไม่มี Layout Shift ขณะโหลด
- [ ] Smooth Scrolling
- [ ] Animation ไม่กระตุก
- [ ] API Call ทำงานรวดเร็ว

---

## 🧪 Device Testing Matrix

### **iOS Devices**

- [ ] iPhone SE (375x667)
- [ ] iPhone 6/7/8 (375x667)
- [ ] iPhone X/XS (375x812)
- [ ] iPhone 11 (414x896)
- [ ] iPhone 12/13 (390x844)
- [ ] iPhone 14/15 (393x852)
- [ ] iPhone 14/15 Pro Max (430x932)
- [ ] iPad Mini (768x1024)
- [ ] iPad Air (820x1180)
- [ ] iPad Pro 11" (834x1194)
- [ ] iPad Pro 12.9" (1024x1366)

### **Android Devices**

- [ ] Samsung Galaxy S9 (360x740)
- [ ] Samsung Galaxy S10 (360x760)
- [ ] Samsung Galaxy S20 (360x800)
- [ ] Samsung Galaxy S21 (360x800)
- [ ] Samsung Galaxy Note (412x915)
- [ ] Google Pixel 4 (353x745)
- [ ] Google Pixel 5 (393x851)
- [ ] OnePlus 8 (412x915)
- [ ] Xiaomi Mi 11 (360x780)

### **Tablet Devices**

- [ ] Samsung Galaxy Tab S7 (800x1280)
- [ ] Lenovo Tab M10 (800x1280)
- [ ] Amazon Fire HD 10 (800x1280)

---

## 🌐 Browser Testing

### **iOS Browsers**

- [ ] Safari iOS
- [ ] Chrome iOS
- [ ] Firefox iOS
- [ ] Edge iOS

### **Android Browsers**

- [ ] Chrome Android
- [ ] Firefox Android
- [ ] Samsung Internet
- [ ] Edge Android
- [ ] Opera Mobile

---

## 🔍 Feature-Specific Testing

### **Date Range Selector**

- [ ] Dropdown แสดงบนมือถือ
- [ ] เลือกวันที่ได้
- [ ] Custom Date Picker เปิดได้
- [ ] Apply Date ทำงาน
- [ ] แสดงช่วงวันที่ที่เลือกถูกต้อง

### **Performance Cards**

- [ ] แสดงเป็น Single Column บนมือถือ
- [ ] ตัวเลขอ่านได้ชัด
- [ ] Icon แสดงครบ
- [ ] Background Gradient แสดงสวย
- [ ] Loading State ทำงาน

### **TOP 10 Ads**

- [ ] ตารางมี Horizontal Scroll
- [ ] รูปภาพแสดงถูกต้อง
- [ ] ปุ่ม Sort ทำงาน
- [ ] กดดูรายละเอียดได้
- [ ] Modal เปิดได้

### **Report Table**

- [ ] Horizontal Scroll ทำงาน
- [ ] ข้อมูลแสดงครบ
- [ ] Filter ทำงาน
- [ ] View Mode Tabs ทำงาน

### **Video Modal**

- [ ] Modal เปิดได้
- [ ] วิดีโอเล่นได้
- [ ] ปิด Modal ได้
- [ ] Facebook Embed ทำงาน
- [ ] Local Video ทำงาน

---

## ⚡ Performance Benchmarks

### **Loading Time**

- [ ] First Paint < 1s
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Time to Interactive < 3s

### **Interaction**

- [ ] Touch Response < 100ms
- [ ] Scroll FPS > 55
- [ ] Animation FPS > 55
- [ ] No Jank/Stutter

### **Network**

- [ ] API Response < 1s
- [ ] Image Load < 2s
- [ ] Video Start < 2s
- [ ] Total Page Size < 5MB

---

## 🐛 Known Issues & Fixes

### **Issue 1: Buttons too small on iPhone SE**

**Fix:** Added min-height: 44px to all buttons

### **Issue 2: Table overflows on small screens**

**Fix:** Added overflow-x-auto with touch scrolling

### **Issue 3: Date picker too big on mobile**

**Fix:** Added max-width and padding adjustments

### **Issue 4: Video modal not responsive**

**Fix:** Added mobile-specific modal styles

---

## 📝 Testing Tools

### **Online Tools**

- Chrome DevTools Device Emulation
- Firefox Responsive Design Mode
- BrowserStack (Real Device Testing)
- LambdaTest (Cross-browser Testing)

### **Mobile Testing Apps**

- Safari Technology Preview (iOS)
- Chrome DevTools Remote Debugging (Android)
- Xcode Simulator (iOS)
- Android Studio Emulator (Android)

### **Performance Tools**

- Google PageSpeed Insights
- Lighthouse Mobile
- WebPageTest (Mobile)
- GTmetrix Mobile

---

## ✅ Final Checklist

- [ ] All devices tested
- [ ] All browsers tested
- [ ] All features working
- [ ] Performance optimized
- [ ] No console errors
- [ ] Accessibility checked
- [ ] SEO optimized
- [ ] Analytics working

---

## 🚀 Deployment Steps

1. [ ] Run final tests on staging
2. [ ] Check all devices one more time
3. [ ] Verify analytics tracking
4. [ ] Test on real devices
5. [ ] Deploy to production
6. [ ] Monitor error logs
7. [ ] Check performance metrics
8. [ ] Get user feedback

---

**Testing Date:** ******\_\_\_\_******  
**Tester Name:** ******\_\_\_\_******  
**Build Version:** ******\_\_\_\_******  
**Status:** ⬜ Pass | ⬜ Fail | ⬜ Needs Review
