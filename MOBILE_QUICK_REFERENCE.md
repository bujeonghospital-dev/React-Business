# 📱 Mobile Responsive Quick Reference

## 🎯 Breakpoints

```
Mobile:  ≤768px  (1 column)
Tablet:  769-1024px (2 columns)
Desktop: >1024px (12 columns)
```

## 🔧 Key Components

### ResponsiveScaledCanvas

```tsx
import ResponsiveScaledCanvas from "@/components/ResponsiveScaledCanvas";

<ResponsiveScaledCanvas
  designWidth={1920}
  minScale={0.3}
  maxScale={2}
  enableMobileOptimization={true}
>
  {children}
</ResponsiveScaledCanvas>;
```

### useDeviceDetection Hook

```tsx
import { useDeviceDetection } from "@/hooks/useDeviceDetection";

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

## 📐 CSS Classes

### Show/Hide

```css
.mobile-hide  /* Hide on mobile */
/* Hide on mobile */
.mobile-show  /* Show only on mobile */
.desktop-only; /* Show only on desktop */
```

### Responsive Utilities

```css
/* Auto-adjust on mobile */
.px-6,
.py-6 → 0.75rem .text-4xl → 1.5rem .grid-cols-12 → 1 column;
```

## 🎨 Conditional Rendering

### Basic

```tsx
{
  deviceInfo.isMobile ? <MobileView /> : <DesktopView />;
}
```

### Dynamic Classes

```tsx
<div className={deviceInfo.isMobile ? "mobile-style" : "desktop-style"}>
  Content
</div>
```

### Multiple Conditions

```tsx
{
  deviceInfo.isMobile && <MobileOnlyComponent />;
}

{
  deviceInfo.isDesktop && <DesktopOnlyComponent />;
}
```

## 📱 Touch Optimization

### Button Sizes

```css
/* Minimum touch target */
min-height: 44px;
min-width: 44px;
```

### Spacing

```css
/* Between touch targets */
gap: 8px;
margin: 8px;
```

### Scrolling

```css
overflow-x: auto;
-webkit-overflow-scrolling: touch;
```

## 🧪 Testing Commands

### Start Dev Server

```bash
npm run dev
```

### Mobile Testing

```powershell
.\test-mobile.ps1
```

### Chrome DevTools

```
F12 → Ctrl+Shift+M → Select Device
```

## 🌐 Test URLs

### Local

```
http://localhost:3000/facebook-ads-manager
```

### Network (Mobile)

```
http://[YOUR_IP]:3000/facebook-ads-manager
```

Find IP:

```powershell
ipconfig | findstr IPv4
```

## 📊 Performance Targets

```
FCP:  < 1.5s
LCP:  < 2.5s
TBT:  < 300ms
CLS:  < 0.1
FPS:  > 55
```

## 🔍 Common Patterns

### Navigation

```tsx
{
  !deviceInfo.isMobile ? <HorizontalTabs /> : <DropdownSelect />;
}
```

### Grid Layout

```tsx
<div className={`grid ${deviceInfo.isMobile ? "grid-cols-1" : "grid-cols-12"}`}>
  {items}
</div>
```

### Modal

```tsx
<div
  className={`modal ${deviceInfo.isMobile ? "mobile-modal" : "desktop-modal"}`}
>
  {content}
</div>
```

## 📝 Testing Checklist

Quick checks:

- [ ] Navigation works
- [ ] Tables scroll horizontally
- [ ] Buttons are tappable (44x44px)
- [ ] Modals open/close
- [ ] Portrait/Landscape rotation
- [ ] Touch scrolling is smooth

## 🚀 Quick Deploy

```bash
# 1. Test locally
npm run dev

# 2. Build
npm run build

# 3. Deploy
vercel deploy --prod
```

## 📚 Documentation

- Full Guide: `FACEBOOK_ADS_MOBILE_RESPONSIVE_GUIDE.md`
- Checklist: `MOBILE_TESTING_CHECKLIST.md`
- Summary: `MOBILE_RESPONSIVE_UPDATE_SUMMARY.md`

## 🐛 Troubleshooting

### Issue: Scale not working

```tsx
// Check enableMobileOptimization
<ResponsiveScaledCanvas enableMobileOptimization={true}>
```

### Issue: Buttons too small

```css
/* Add minimum size */
button {
  min-height: 44px;
  min-width: 44px;
}
```

### Issue: Table overflow

```tsx
<div className="overflow-x-auto">
  <table style={{ minWidth: '800px' }}>
</div>
```

## 💡 Pro Tips

1. **Always test on real devices**
2. **Use Chrome DevTools first**
3. **Check both orientations**
4. **Verify touch interactions**
5. **Monitor performance metrics**

---

**Quick Help:** Press `Ctrl+F` to search this document!
