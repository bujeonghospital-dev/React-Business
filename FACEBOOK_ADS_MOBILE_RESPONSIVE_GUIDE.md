# 📱 Facebook Ads Manager - Mobile Responsive Guide

## 🎯 Overview

เว็บไซต์ Facebook Ads Manager ได้รับการปรับปรุงให้รองรับการแสดงผลบนอุปกรณ์มือถือทุกรุ่น โดยใช้เทคโนโลยี **ScaledCanvas** และ **Responsive Web Design**

---

## ✨ Features

### 1. **Responsive ScaledCanvas**

- ปรับขนาดหน้าจออัตโนมัติตามความกว้างของอุปกรณ์
- รองรับ Desktop (1920px+), Tablet (769-1024px), และ Mobile (≤768px)
- Scale ระหว่าง 0.3x ถึง 2x สำหรับความยืดหยุ่นสูงสุด

### 2. **Mobile Optimization**

- โหมดมือถือพิเศษ: ไม่ใช้ Scale แต่ใช้ Native Responsive
- Navigation แบบ Dropdown บนมือถือ
- ตารางแบบ Horizontal Scroll
- ปุ่มขนาดใหญ่ขึ้น (Touch-friendly: 44x44px minimum)

### 3. **Device Detection**

- ตรวจจับอุปกรณ์แบบ Real-time
- รองรับการหมุนหน้าจอ (Orientation Change)
- ตรวจสอบ Touch Support

### 4. **Adaptive UI**

- Typography ปรับขนาดตามหน้าจอ
- Grid Layout ปรับแบบอัตโนมัติ
- Spacing และ Padding ที่เหมาะสม

---

## 🏗️ Architecture

### **1. ResponsiveScaledCanvas Component**

```tsx
<ResponsiveScaledCanvas
  designWidth={1920}
  minScale={0.3}
  maxScale={2}
  enableMobileOptimization={true}
>
  {children}
</ResponsiveScaledCanvas>
```

**Props:**

- `designWidth`: ความกว้างมาตรฐานของการออกแบบ (default: 1920px)
- `minScale`: Scale ต่ำสุด (default: 0.3)
- `maxScale`: Scale สูงสุด (default: 2)
- `enableMobileOptimization`: เปิดโหมดมือถือพิเศษ (default: true)

### **2. useDeviceDetection Hook**

```tsx
const deviceInfo = useDeviceDetection();

// Returns:
{
  isMobile: boolean,
  isTablet: boolean,
  isDesktop: boolean,
  screenWidth: number,
  screenHeight: number,
  orientation: "portrait" | "landscape",
  touchSupport: boolean
}
```

### **3. Viewport Meta Tags**

```tsx
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};
```

---

## 📱 Responsive Breakpoints

### **Mobile** (≤768px)

- Navigation: Dropdown Select
- Grid: Single Column
- Typography: Reduced size
- Tables: Horizontal Scroll
- Touch-optimized buttons (min 44x44px)

### **Tablet** (769-1024px)

- Navigation: Horizontal Tabs (Compact)
- Grid: 2-Column Layout
- Typography: Medium size
- Tables: Responsive with scroll

### **Desktop** (>1024px)

- Navigation: Full Horizontal Tabs
- Grid: Full 12-Column Layout
- Typography: Full size
- Tables: Full width with all columns

---

## 🎨 CSS Features

### **1. Mobile-Specific Styles**

```css
@media (max-width: 768px) {
  .mobile-hide {
    display: none !important;
  }
  .mobile-show {
    display: block !important;
  }
}
```

### **2. Touch-Friendly Interactions**

```css
@media (hover: none) and (pointer: coarse) {
  button {
    min-height: 44px;
    min-width: 44px;
  }
}
```

### **3. Landscape Mode Support**

```css
@media (max-width: 768px) and (orientation: landscape) {
  .modal-overlay {
    padding: 0.25rem !important;
  }
}
```

### **4. High DPI Support**

```css
@media (-webkit-min-device-pixel-ratio: 2) {
  img {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
}
```

---

## 🚀 Performance Optimizations

### **1. Auto-Refresh**

- Background refresh ทุก 1 นาที
- ไม่แสดง Loading state เมื่อ refresh
- ไม่รบกวนการใช้งาน

### **2. Lazy Loading**

- Images load on-demand
- Modal content loads when opened
- Optimized API calls

### **3. Touch Scrolling**

```css
.overflow-x-auto {
  -webkit-overflow-scrolling: touch !important;
}
```

---

## 🧪 Testing Devices

### **รองรับอุปกรณ์**

✅ iPhone (SE, 6/7/8, X/XS, 11, 12, 13, 14, 15)  
✅ iPad (Mini, Air, Pro)  
✅ Samsung Galaxy (S, Note, A Series)  
✅ Google Pixel  
✅ OnePlus  
✅ Xiaomi  
✅ Huawei

### **รองรับเบราว์เซอร์**

✅ Safari iOS  
✅ Chrome Mobile  
✅ Firefox Mobile  
✅ Edge Mobile  
✅ Samsung Internet

---

## 📝 Usage Examples

### **1. Conditional Rendering**

```tsx
{
  deviceInfo.isMobile ? <MobileView /> : <DesktopView />;
}
```

### **2. Dynamic Classes**

```tsx
<div className={`card ${deviceInfo.isMobile ? "mobile-card" : "desktop-card"}`}>
  Content
</div>
```

### **3. Responsive Navigation**

```tsx
{
  deviceInfo.isMobile ? (
    <select>{options}</select>
  ) : (
    <div className="tabs">{tabs}</div>
  );
}
```

---

## 🔧 Configuration

### **Customize ScaledCanvas**

```tsx
<ResponsiveScaledCanvas
  designWidth={1440}        // เปลี่ยนความกว้างมาตรฐาน
  minScale={0.5}            // เพิ่ม minimum scale
  maxScale={1.5}            // จำกัด maximum scale
  enableMobileOptimization={false}  // ปิดโหมดมือถือพิเศษ
>
```

### **Customize Breakpoints**

แก้ไขใน `facebook-ads-responsive.css`:

```css
/* Custom Mobile Breakpoint */
@media (max-width: 480px) {
  /* Your styles */
}

/* Custom Tablet Breakpoint */
@media (min-width: 600px) and (max-width: 900px) {
  /* Your styles */
}
```

---

## 🐛 Troubleshooting

### **ปัญหา: Scale ไม่ทำงานบนมือถือ**

✅ ตรวจสอบ `enableMobileOptimization` ว่าตั้งเป็น `true` หรือไม่  
✅ ตรวจสอบ Viewport Meta Tags ใน layout.tsx

### **ปัญหา: ปุ่มเล็กเกินไปบนมือถือ**

✅ ตรวจสอบ CSS Touch-friendly rules  
✅ ตรวจสอบ min-height และ min-width ของปุ่ม

### **ปัญหา: ตารางล้นหน้าจอ**

✅ ตรวจสอบ `overflow-x-auto` class  
✅ ตรวจสอบ `-webkit-overflow-scrolling: touch`

### **ปัญหา: Font เล็กเกินไปอ่านยาก**

✅ ตรวจสอบ Media Query สำหรับ Typography  
✅ ตรวจสอบ Root font-size

---

## 📊 Performance Metrics

### **Target Metrics**

- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Total Blocking Time (TBT)**: < 300ms
- **Cumulative Layout Shift (CLS)**: < 0.1

### **Mobile Score Goals**

- Google PageSpeed Insights: 90+
- Lighthouse Mobile: 90+
- Core Web Vitals: All "Good"

---

## 🎓 Best Practices

### **1. Always Test on Real Devices**

- ใช้ Chrome DevTools Device Emulation
- ทดสอบบน Physical Devices
- ตรวจสอบ Landscape & Portrait Mode

### **2. Optimize Images**

- ใช้ WebP format เมื่อเป็นไปได้
- ใช้ Lazy Loading
- ปรับขนาดภาพให้เหมาะสม

### **3. Touch Target Size**

- ปุ่มขนาดขั้นต่ำ 44x44px
- เว้นระยะห่างระหว่างปุ่มอย่างน้อย 8px
- ใช้ padding ที่เหมาะสม

### **4. Avoid Horizontal Scrolling**

- ใช้ `overflow-x: hidden` บน body
- ใช้ Flex/Grid ที่ responsive
- ตรวจสอบ fixed width elements

---

## 📚 Resources

- [MDN: Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Google: Mobile-Friendly Websites](https://developers.google.com/search/mobile-sites)
- [Apple: iOS Design Guidelines](https://developer.apple.com/design/human-interface-guidelines/ios)
- [Material Design: Responsive Layout](https://material.io/design/layout/responsive-layout-grid.html)

---

## 🎉 Summary

เว็บไซต์ Facebook Ads Manager ตอนนี้:
✅ รองรับมือถือทุกรุ่น  
✅ ใช้งานง่ายด้วย Touch Interface  
✅ โหลดเร็วด้วย Performance Optimization  
✅ ปรับตัวอัตโนมัติตามขนาดหน้าจอ  
✅ รองรับทั้ง Portrait และ Landscape Mode  
✅ เบราว์เซอร์ทั้งหมดบน iOS และ Android

---

**Last Updated:** November 20, 2025  
**Version:** 2.0.0  
**Maintained by:** React-Business Team
