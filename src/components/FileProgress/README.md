# File Progress Animation Components

## Overview

The FileProgress components provide beautiful, animated progress indicators for file uploads and downloads in the React Business application.

## Components

### 1. FileProgressAnimation

Individual file progress item with:

- Circular progress indicator
- Animated file icon (upload/download arrows)
- Progress bar with gradient colors
- Success/error state animations
- Cancel, retry, and dismiss actions

### 2. FileProgressContainer

Container for multiple progress items with:

- Header showing upload/download counts
- Minimize/maximize functionality
- Clear all button for completed items
- Scrollable list for many items

### 3. useFileProgress Hook

React hook for managing file transfers:

- `uploadFile(file, options)` - Upload with progress tracking
- `downloadFile(url, fileName, fileSize, options)` - Download with progress
- `cancelTransfer(id)` - Cancel active transfer
- `dismissItem(id)` - Remove item from list
- `clearCompleted()` - Clear all completed/errored items

### 4. ToastProvider & useToast

Toast notification system:

- Success, error, warning, info types
- Upload/download specific toasts with progress
- Auto-dismiss with countdown
- Smooth enter/exit animations

## Usage Example

```tsx
import {
  FileProgressContainer,
  useFileProgress,
  ToastProvider,
  useToast,
} from "@/components/FileProgress";

function MyComponent() {
  const {
    items,
    uploadFile,
    downloadFile,
    cancelTransfer,
    dismissItem,
    clearCompleted,
  } = useFileProgress({
    onUploadComplete: (id) => console.log("Upload done:", id),
    onDownloadComplete: (id) => console.log("Download done:", id),
    onError: (id, error) => console.error("Error:", id, error),
  });

  const handleUpload = async (file: File) => {
    await uploadFile(file, {
      url: "/api/upload",
      method: "POST",
      fieldName: "file",
    });
  };

  const handleDownload = async () => {
    await downloadFile(
      "https://example.com/file.pdf",
      "document.pdf",
      1024 * 1024, // 1MB
      { saveAs: true }
    );
  };

  return (
    <>
      <button onClick={() => handleUpload(selectedFile)}>Upload</button>
      <button onClick={handleDownload}>Download</button>

      <FileProgressContainer
        items={items}
        onCancel={cancelTransfer}
        onDismiss={dismissItem}
        onClearAll={clearCompleted}
        position="bottom-right"
      />
    </>
  );
}
```

## Animation Features

### Upload Animation

- Purple/pink gradient progress bar
- Upward bouncing arrow icon
- Shimmer effect during transfer
- Green checkmark on success
- Red X on error

### Download Animation

- Blue/cyan gradient progress bar
- Downward bouncing arrow icon
- Shimmer effect during transfer
- Auto-triggers file save dialog
- Success notification

### Visual States

- **Pending**: Gray icon, waiting state
- **Active**: Animated icon, gradient progress bar with shimmer
- **Success**: Green checkmark with spring animation
- **Error**: Red X with shake effect

## Customization

### Position Options

```tsx
position = "bottom-right"; // Default
position = "bottom-left";
position = "top-right";
position = "top-left";
```

### Toast Types

```tsx
const { addToast } = useToast();

addToast({
  type: "success", // success, error, warning, info, upload, download
  title: "Upload Complete",
  message: "Your file has been uploaded successfully",
  duration: 4000, // Auto-dismiss after 4 seconds
});
```

## Integration with Existing Code

The components are already integrated with the all-files-gallery page:

- Uploads use `processUploadedFilesWithProgress()`
- Downloads use `handleDownloadFile()` with `trackDownload()`
- Progress container appears at bottom-right

## File Structure

```
src/components/FileProgress/
├── index.ts                    # Exports
├── FileProgressAnimation.tsx   # Individual item component
├── FileProgressContainer.tsx   # Container component
├── useFileProgress.ts          # Progress tracking hook
└── ToastProvider.tsx           # Toast notification system
```
