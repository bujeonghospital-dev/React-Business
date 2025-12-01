# LINE Video Link Preview Implementation Guide

This guide documents how video clips on the BJH Bangkok website can be shared to LINE messenger with inline video playback support.

## 📋 Overview

When a video URL from your website is shared on LINE, the platform reads Open Graph meta tags to generate a rich preview. For video content to play inline within LINE, the implementation includes:

1. **Open Graph Video Meta Tags** - Proper metadata for LINE's crawler
2. **H.264/AAC Video Format** - Compatible video encoding for LINE playback
3. **Video Serving API** - Optimized video delivery with range request support
4. **Dynamic Share Page** - Server-side rendered pages with proper OG tags

---

## 🏗️ Architecture

### File Structure

```
src/app/
├── (fullscreen)/all-files-gallery/
│   ├── page.tsx                    # Main gallery page with share functionality
│   ├── [videoId]/
│   │   ├── page.tsx                # Dynamic route with OG metadata generation
│   │   └── VideoShareClient.tsx    # Client-side video player component
│   └── video/[id]/                 # Alternative video route
├── share/video/[id]/
│   ├── page.tsx                    # Public share page with full OG tags
│   └── CopyButton.tsx              # Copy URL client component
└── api/
    ├── share-video/route.ts        # Generate share URLs and metadata
    ├── line-video/[id]/route.ts    # Serve LINE-optimized video streams
    └── transcode-video/route.ts    # Convert videos to H.264 for compatibility
```

---

## 📜 HTML Meta Tag Structure

The implementation uses Next.js Metadata API to generate proper Open Graph tags. Here's the structure:

### Required Open Graph Tags for LINE Video Preview

```tsx
// From: src/app/(fullscreen)/all-files-gallery/[videoId]/page.tsx

export async function generateMetadata({ params }): Promise<Metadata> {
  const video = await getVideoInfo(videoId);
  const pageUrl = `${BASE_URL}/all-files-gallery/${videoId}`;

  return {
    title: `${video.name} - BJH Bangkok`,
    description: `Watch ${video.name} from BJH Bangkok`,

    // Open Graph for video - Critical for LINE inline playback
    openGraph: {
      title: video.name,
      description: `Watch ${video.name} from BJH Bangkok`,
      url: pageUrl,
      siteName: "BJH Bangkok",
      type: "video.other",
      images: [
        {
          url: video.thumbnailUrl,
          width: 1280,
          height: 720,
          alt: video.name,
        },
      ],
      videos: [
        {
          url: video.lineVideoUrl, // H.264 compatible URL
          secureUrl: video.lineVideoUrl,
          type: "video/mp4",
          width: 1280,
          height: 720,
        },
      ],
    },

    // Twitter Card for video (also helps LINE)
    twitter: {
      card: "player",
      title: video.name,
      description: `Watch ${video.name} from BJH Bangkok`,
      images: [video.thumbnailUrl],
    },

    // Additional meta tags for broader compatibility
    other: {
      "line:title": video.name,
      "line:description": `Watch ${video.name}`,
      "og:video": video.lineVideoUrl,
      "og:video:secure_url": video.lineVideoUrl,
      "og:video:type": "video/mp4",
      "og:video:width": "1280",
      "og:video:height": "720",
    },
  };
}
```

### Rendered HTML Output

When LINE's crawler visits the share URL, it receives:

```html
<!-- Open Graph Basic -->
<meta property="og:title" content="video_name.mp4 - BJH Bangkok" />
<meta
  property="og:description"
  content="Watch video_name.mp4 from BJH Bangkok"
/>
<meta
  property="og:url"
  content="https://app.bjhbangkok.com/all-files-gallery/video_id"
/>
<meta property="og:site_name" content="BJH Bangkok" />
<meta property="og:type" content="video.other" />

<!-- Open Graph Image (Thumbnail) -->
<meta
  property="og:image"
  content="https://app.bjhbangkok.com/images/video/thumb.jpg"
/>
<meta property="og:image:width" content="1280" />
<meta property="og:image:height" content="720" />

<!-- Open Graph Video - CRITICAL for inline playback -->
<meta
  property="og:video"
  content="https://app.bjhbangkok.com/api/line-video/VIDEO_ID"
/>
<meta
  property="og:video:secure_url"
  content="https://app.bjhbangkok.com/api/line-video/VIDEO_ID"
/>
<meta property="og:video:type" content="video/mp4" />
<meta property="og:video:width" content="1280" />
<meta property="og:video:height" content="720" />

<!-- LINE Specific -->
<meta name="line:title" content="video_name.mp4" />
<meta name="line:description" content="Watch video_name.mp4" />

<!-- Twitter Player Card -->
<meta name="twitter:card" content="player" />
<meta name="twitter:title" content="video_name.mp4" />
```

---

## 🎥 Video Serving API

### `/api/line-video/[id]/route.ts`

This endpoint serves LINE-optimized videos with proper headers for streaming:

```typescript
export async function GET(request: NextRequest, { params }) {
  const videoPath = Buffer.from(id, "base64url").toString("utf-8");

  // Check for transcoded (LINE-optimized) version first
  const cachePath = path.join(CACHE_DIR, getCacheFileName(videoPath));
  const filePath = fs.existsSync(cachePath) ? cachePath : originalPath;

  // Essential headers for LINE playback
  const headers = {
    "Content-Type": "video/mp4",
    "Accept-Ranges": "bytes", // Required for seeking
    "Cache-Control": "public, max-age=31536000",
    "Access-Control-Allow-Origin": "*", // CORS for cross-origin playback
    "Content-Disposition": `inline; filename="${fileName}"`,
  };

  // Handle range requests (partial content for streaming)
  const range = request.headers.get("range");
  if (range) {
    // Return 206 Partial Content for byte-range requests
    return new NextResponse(chunk, {
      status: 206,
      headers: {
        ...headers,
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      },
    });
  }

  return new NextResponse(file, { status: 200, headers });
}
```

### Key Requirements for LINE Video Playback

1. **CORS Headers**: `Access-Control-Allow-Origin: *`
2. **Range Request Support**: `Accept-Ranges: bytes` + 206 responses
3. **Content-Type**: `video/mp4`
4. **HTTPS**: Video URL must use HTTPS

---

## 🔄 Video Transcoding

### `/api/transcode-video/route.ts`

Videos that aren't H.264/AAC encoded need transcoding for LINE compatibility:

```typescript
// Transcode to LINE-compatible format
const ffmpeg = spawn("ffmpeg", [
  "-i",
  inputPath,
  "-y",
  "-c:v",
  "libx264", // H.264 video codec
  "-preset",
  "fast",
  "-crf",
  "28", // Quality (lower = better, larger file)
  "-profile:v",
  "baseline", // Maximum compatibility
  "-level",
  "3.0",
  "-pix_fmt",
  "yuv420p",
  "-c:a",
  "aac", // AAC audio codec
  "-b:a",
  "128k",
  "-ar",
  "44100",
  "-ac",
  "2",
  "-movflags",
  "+faststart", // Enable streaming (moov atom at start)
  outputPath,
]);
```

### File Size Recommendations

| File Size | LINE Behavior              |
| --------- | -------------------------- |
| < 25 MB   | ✅ Optimal inline playback |
| 25-50 MB  | ⚠️ May load slowly         |
| > 50 MB   | ❌ May not preview inline  |

---

## 📤 Share URL Generation

### `/api/share-video/route.ts`

Generates proper share URLs and metadata:

```typescript
export async function POST(request: NextRequest) {
  const { videoPath } = await request.json();

  // Generate human-readable video ID
  const videoId = path.basename(videoPath, ext);

  // Share URL (with OG meta tags)
  const shareUrl = `${BASE_URL}/all-files-gallery/${videoId}`;

  // LINE video URL (direct streaming)
  const lineVideoId = Buffer.from(normalizedPath).toString("base64url");
  const lineVideoUrl = `${BASE_URL}/api/line-video/${lineVideoId}`;

  return NextResponse.json({
    shareUrl,
    lineShareUrl: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
      shareUrl
    )}`,
    lineVideoUrl,
    needsTranscoding: fileSizeMB > 25,
  });
}
```

---

## 🔗 Sharing Flow

### From Gallery Page

1. User clicks **Share** button on a video
2. `generateVideoShareUrl()` creates the share URL
3. Share modal opens with options:
   - **LINE Share**: Opens LINE share dialog
   - **Copy Link**: Copies shareable URL
   - **Native Share**: Uses Web Share API

### Code Flow

```typescript
// From page.tsx - shareToLine function
const shareToLine = async (fileId: number) => {
  const file = files.find((f) => f.id === fileId);

  // Get share URL with proper OG tags
  const result = await generateVideoShareUrl(file);

  // Trigger background transcoding if needed
  if (result.needsTranscoding) {
    transcodeForLine(file);
  }

  // Open LINE share
  if (isMobile) {
    window.location.href = `line://msg/text/${shareText}%0A${encodedUrl}`;
  } else {
    window.open(
      `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`,
      "_blank"
    );
  }
};
```

---

## ✅ Testing & Validation

### 1. Check OG Tags with LINE's Tool

Visit: https://poker.line.naver.jp/

Enter your share URL and verify:

- `og:type` = `video.other`
- `og:video` = valid HTTPS URL to MP4
- `og:video:type` = `video/mp4`
- `og:image` = thumbnail URL

### 2. Test Video Endpoint

```bash
# Check video headers
curl -I "https://app.bjhbangkok.com/api/line-video/YOUR_VIDEO_ID"

# Verify response includes:
# Content-Type: video/mp4
# Accept-Ranges: bytes
# Access-Control-Allow-Origin: *
```

### 3. Test Range Requests

```bash
# Request first 1MB of video
curl -H "Range: bytes=0-1048575" \
     "https://app.bjhbangkok.com/api/line-video/YOUR_VIDEO_ID" \
     -o test_chunk.mp4

# Should return 206 Partial Content
```

### 4. Test in LINE

1. Share URL to a LINE chat
2. Wait for preview to generate (may take a few seconds)
3. Verify:
   - Thumbnail appears
   - Video plays inline when tapped
   - No "open in browser" required

### 5. PowerShell Test Script

```powershell
# Test share URL generation
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/share-video" `
    -Method POST `
    -ContentType "application/json" `
    -Body '{"videoPath": "/images/video/test.mp4"}'

Write-Host "Share URL: $($response.shareUrl)"
Write-Host "LINE Video URL: $($response.lineVideoUrl)"
Write-Host "Needs Transcoding: $($response.needsTranscoding)"
```

---

## 🔧 Troubleshooting

### Video Not Playing Inline

| Issue                           | Solution                              |
| ------------------------------- | ------------------------------------- |
| "Open in browser" prompt        | Check CORS headers on video endpoint  |
| No preview at all               | Verify OG tags with LINE Poker tool   |
| Thumbnail shows but video fails | Check video codec (must be H.264/AAC) |
| Slow loading                    | Video too large, trigger transcoding  |

### Common Fixes

1. **Clear LINE cache**: Long press chat → Settings → Clear cache
2. **Re-share URL**: LINE caches previews; share a fresh URL
3. **Check HTTPS**: All video URLs must use HTTPS
4. **Verify encoding**: Use `ffprobe video.mp4` to check codec

---

## 📁 Environment Variables

Ensure these are set in `.env.local`:

```env
# Base URL for share links (must be HTTPS in production)
NEXT_PUBLIC_BASE_URL=https://app.bjhbangkok.com
```

---

## 🚀 Quick Start

### To share a video with LINE preview:

1. Navigate to **All Files Gallery** (`/all-files-gallery`)
2. Open a video folder and select a video
3. Click the **Share** button (Share2 icon)
4. Select **LINE** from the share modal
5. Video will be shared with rich preview

### Direct share URL format:

```
https://app.bjhbangkok.com/all-files-gallery/{video-filename-without-extension}
```

Example:

```
https://app.bjhbangkok.com/all-files-gallery/my-surgery-video
```

---

## 📊 Summary

| Component   | Purpose                 | Location              |
| ----------- | ----------------------- | --------------------- |
| OG Metadata | LINE preview generation | `[videoId]/page.tsx`  |
| Video API   | Streaming with CORS     | `api/line-video/[id]` |
| Transcoding | H.264 conversion        | `api/transcode-video` |
| Share Logic | URL generation          | `api/share-video`     |
| UI          | Share modal & buttons   | `page.tsx`            |

The implementation follows LINE's requirements for inline video playback:

- ✅ Open Graph video meta tags
- ✅ H.264/AAC video format (with transcoding)
- ✅ HTTPS video URLs
- ✅ Range request support for streaming
- ✅ CORS headers for cross-origin playback
