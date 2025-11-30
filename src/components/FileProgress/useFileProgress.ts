"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import type {
  FileProgressItem,
  FileProgressStatus,
} from "./FileProgressAnimation";

// Import loading context to suppress loading overlay during file transfers
let setSuppressLoading: ((suppress: boolean) => void) | null = null;

// Hook to connect with LoadingContext
export const setLoadingContextSuppressor = (fn: (suppress: boolean) => void) => {
  setSuppressLoading = fn;
};

interface UseFileProgressOptions {
  onUploadComplete?: (id: string, response?: unknown) => void;
  onDownloadComplete?: (id: string, blob?: Blob) => void;
  onError?: (id: string, error: Error) => void;
  maxConcurrent?: number;
}

interface UploadOptions {
  url: string;
  method?: "POST" | "PUT";
  headers?: Record<string, string>;
  fieldName?: string;
  additionalData?: Record<string, string>;
}

interface DownloadOptions {
  saveAs?: boolean;
}

export const useFileProgress = (options: UseFileProgressOptions = {}) => {
  const [items, setItems] = useState<FileProgressItem[]>([]);
  const abortControllers = useRef<Map<string, AbortController>>(new Map());

  // Suppress loading overlay when there are active transfers
  useEffect(() => {
    const hasActiveTransfers = items.some(
      (item) => item.status === "uploading" || item.status === "downloading"
    );
    if (setSuppressLoading) {
      setSuppressLoading(hasActiveTransfers);
    }
  }, [items]);

  // Generate unique ID
  const generateId = () =>
    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Update item status
  const updateItem = useCallback(
    (id: string, updates: Partial<FileProgressItem>) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
    },
    []
  );

  // Add new item to queue
  const addItem = useCallback(
    (
      file: File,
      type: "upload" | "download",
      initialStatus: FileProgressStatus = "pending"
    ): string => {
      const id = generateId();
      const newItem: FileProgressItem = {
        id,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || "application/octet-stream",
        progress: 0,
        status: initialStatus,
        type,
      };
      setItems((prev) => [...prev, newItem]);
      return id;
    },
    []
  );

  // Upload file with progress tracking
  const uploadFile = useCallback(
    async (file: File, uploadOptions: UploadOptions): Promise<string> => {
      const id = addItem(file, "upload", "uploading");
      const controller = new AbortController();
      abortControllers.current.set(id, controller);

      try {
        const formData = new FormData();
        formData.append(uploadOptions.fieldName || "file", file);

        // Add additional data if provided
        if (uploadOptions.additionalData) {
          Object.entries(uploadOptions.additionalData).forEach(
            ([key, value]) => {
              formData.append(key, value);
            }
          );
        }

        // Use XMLHttpRequest for progress tracking
        const response = await new Promise<unknown>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100);
              updateItem(id, { progress });
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                resolve(JSON.parse(xhr.responseText));
              } catch {
                resolve(xhr.responseText);
              }
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          });

          xhr.addEventListener("error", () => {
            reject(new Error("Upload failed"));
          });

          xhr.addEventListener("abort", () => {
            reject(new Error("Upload cancelled"));
          });

          xhr.open(uploadOptions.method || "POST", uploadOptions.url);

          // Set headers
          if (uploadOptions.headers) {
            Object.entries(uploadOptions.headers).forEach(([key, value]) => {
              xhr.setRequestHeader(key, value);
            });
          }

          // Handle abort signal
          controller.signal.addEventListener("abort", () => xhr.abort());

          xhr.send(formData);
        });

        updateItem(id, { status: "success", progress: 100 });
        options.onUploadComplete?.(id, response);

        return id;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";
        updateItem(id, { status: "error", error: errorMessage });
        options.onError?.(
          id,
          error instanceof Error ? error : new Error(errorMessage)
        );
        return id;
      } finally {
        abortControllers.current.delete(id);
      }
    },
    [addItem, updateItem, options]
  );

  // Download file with progress tracking
  const downloadFile = useCallback(
    async (
      url: string,
      fileName: string,
      fileSize: number = 0,
      downloadOptions: DownloadOptions = {}
    ): Promise<string> => {
      const id = generateId();
      const controller = new AbortController();
      abortControllers.current.set(id, controller);

      // Create item manually since we don't have a File object
      const newItem: FileProgressItem = {
        id,
        fileName,
        fileSize,
        fileType: "application/octet-stream",
        progress: 0,
        status: "downloading",
        type: "download",
      };
      setItems((prev) => [...prev, newItem]);

      try {
        const response = await fetch(url, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Download failed with status ${response.status}`);
        }

        const contentLength = response.headers.get("Content-Length");
        const total = contentLength ? parseInt(contentLength, 10) : fileSize;

        if (total > 0) {
          updateItem(id, { fileSize: total });
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("Failed to get response reader");
        }

        const chunks: ArrayBuffer[] = [];
        let received = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          chunks.push(value.buffer as ArrayBuffer);
          received += value.length;

          if (total > 0) {
            const progress = Math.round((received / total) * 100);
            updateItem(id, { progress: Math.min(progress, 99) });
          }
        }

        const blob = new Blob(chunks);
        updateItem(id, {
          status: "success",
          progress: 100,
          fileSize: blob.size,
        });

        // Auto-download if saveAs is true
        if (downloadOptions.saveAs !== false) {
          const downloadUrl = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = downloadUrl;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(downloadUrl);
        }

        options.onDownloadComplete?.(id, blob);
        return id;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Download failed";
        updateItem(id, { status: "error", error: errorMessage });
        options.onError?.(
          id,
          error instanceof Error ? error : new Error(errorMessage)
        );
        return id;
      } finally {
        abortControllers.current.delete(id);
      }
    },
    [updateItem, options]
  );

  // Cancel a transfer
  const cancelTransfer = useCallback(
    (id: string) => {
      const controller = abortControllers.current.get(id);
      if (controller) {
        controller.abort();
        abortControllers.current.delete(id);
      }
      updateItem(id, { status: "error", error: "Cancelled by user" });
    },
    [updateItem]
  );

  // Retry a failed transfer
  const retryTransfer = useCallback(
    async (id: string, uploadOptions?: UploadOptions) => {
      const item = items.find((i) => i.id === id);
      if (!item || item.status !== "error") return;

      // For uploads, we need the original file which we don't have stored
      // This would need to be handled by the component using this hook
      updateItem(id, { status: "pending", progress: 0, error: undefined });
    },
    [items, updateItem]
  );

  // Dismiss an item
  const dismissItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Clear all completed/errored items
  const clearCompleted = useCallback(() => {
    setItems((prev) =>
      prev.filter(
        (item) => item.status === "uploading" || item.status === "downloading"
      )
    );
  }, []);

  // Clear all items
  const clearAll = useCallback(() => {
    // Abort all active transfers
    abortControllers.current.forEach((controller) => controller.abort());
    abortControllers.current.clear();
    setItems([]);
  }, []);

  return {
    items,
    uploadFile,
    downloadFile,
    cancelTransfer,
    retryTransfer,
    dismissItem,
    clearCompleted,
    clearAll,
    updateItem,
  };
};

export default useFileProgress;
