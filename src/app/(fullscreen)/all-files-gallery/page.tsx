"use client";
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  type LucideIcon,
  Search,
  RefreshCw,
  Download,
  ArrowLeft,
  Image as ImageIcon,
  Film,
  FileVideo,
  Grid,
  List,
  LayoutGrid,
  Filter,
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Heart,
  Star,
  Trash2,
  Upload,
  FolderOpen,
  Eye,
  Copy,
  Share2,
  MoreHorizontal,
  MoreVertical,
  Calendar,
  Clock,
  HardDrive,
  Check,
  Plus,
  Pencil,
  Megaphone,
  MessageSquareQuote,
  Sparkles,
  Presentation,
  Archive,
  Camera,
  Smartphone,
  Send,
  Wand2,
  Menu,
  ChevronDown,
  AlertCircle,
  Info,
  FolderPlus,
} from "lucide-react";
import UserMenu from "@/components/UserMenu";
import {
  FileProgressContainer,
  useFileProgress,
  type FileProgressItem,
  setLoadingContextSuppressor,
} from "@/components/FileProgress";
import { useLoading } from "@/components/LoadingContext";

// Custom scrollbar styles
const customScrollbarStyle = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: linear-gradient(180deg, #1e1b4b 0%, #312e81 100%);
    border-radius: 12px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #8b5cf6 0%, #ec4899 50%, #f97316 100%);
    border-radius: 12px;
    border: 2px solid transparent;
    background-clip: padding-box;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #a78bfa 0%, #f472b6 50%, #fb923c 100%);
    border-radius: 12px;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(5deg); }
  }

  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.5), 0 0 40px rgba(236, 72, 153, 0.3); }
    50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.8), 0 0 80px rgba(236, 72, 153, 0.5); }
  }

  @keyframes gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  @keyframes bounce-in {
    0% { transform: scale(0); opacity: 0; }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; }
  }

  @keyframes slide-up {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes slide-down {
    from { transform: translateY(0); opacity: 1; }
    to { transform: translateY(100%); opacity: 0; }
  }

  @keyframes rotate-3d {
    from { transform: perspective(1000px) rotateY(0deg); }
    to { transform: perspective(1000px) rotateY(360deg); }
  }

  .animate-float { animation: float 6s ease-in-out infinite; }
  .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
  .animate-gradient-shift { 
    background-size: 200% 200%;
    animation: gradient-shift 5s ease infinite;
  }
  .animate-shimmer { animation: shimmer 2s infinite; }
  .animate-bounce-in { animation: bounce-in 0.5s ease-out forwards; }
  .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .animate-slide-down { animation: slide-down 0.3s ease-in forwards; }

  .glass-effect {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .glass-card {
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.18);
  }

  .neon-border {
    box-shadow: 0 0 5px theme('colors.purple.400'),
                0 0 20px theme('colors.purple.600'),
                inset 0 0 5px theme('colors.purple.400');
  }

  .image-card {
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .image-card:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 25px 50px -12px rgba(139, 92, 246, 0.4);
  }

  .file-item:hover .file-actions {
    opacity: 1;
    transform: translateY(0);
  }

  .file-actions {
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.3s ease;
  }

  /* Mobile responsive styles */
  @media (max-width: 768px) {
    .image-card:hover {
      transform: none;
    }
    
    .file-actions {
      opacity: 1;
      transform: translateY(0);
    }

    .mobile-touch-target {
      min-height: 44px;
      min-width: 44px;
    }
  }

  /* Touch-friendly interactions */
  @media (hover: none) {
    .image-card:active {
      transform: scale(0.98);
    }
    
    .file-actions {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* AI Drop Zone Animation */
  @keyframes ai-pulse {
    0%, 100% { 
      box-shadow: 0 0 20px rgba(168, 85, 247, 0.4), 0 0 40px rgba(236, 72, 153, 0.2);
      border-color: rgba(168, 85, 247, 0.5);
    }
    50% { 
      box-shadow: 0 0 30px rgba(168, 85, 247, 0.6), 0 0 60px rgba(236, 72, 153, 0.4);
      border-color: rgba(236, 72, 153, 0.7);
    }
  }

  .ai-drop-zone {
    animation: ai-pulse 2s ease-in-out infinite;
  }

  .ai-drop-zone-active {
    animation: none;
    box-shadow: 0 0 40px rgba(34, 197, 94, 0.6), 0 0 80px rgba(34, 197, 94, 0.3);
    border-color: rgba(34, 197, 94, 0.8);
    background: rgba(34, 197, 94, 0.1);
  }

  /* LINE Share Button */
  .line-share-btn {
    background: linear-gradient(135deg, #00B900 0%, #00C300 100%);
  }

  .line-share-btn:hover {
    background: linear-gradient(135deg, #00C300 0%, #00D400 100%);
  }

  /* Responsive Text Sizing */
  .text-responsive-xs {
    font-size: clamp(0.625rem, 2vw, 0.75rem);
  }

  .text-responsive-sm {
    font-size: clamp(0.75rem, 2.5vw, 0.875rem);
  }

  .text-responsive-base {
    font-size: clamp(0.875rem, 3vw, 1rem);
  }

  .text-responsive-lg {
    font-size: clamp(1rem, 3.5vw, 1.125rem);
  }

  .text-responsive-xl {
    font-size: clamp(1.125rem, 4vw, 1.25rem);
  }

  .text-responsive-2xl {
    font-size: clamp(1.25rem, 4.5vw, 1.5rem);
  }

  .text-responsive-3xl {
    font-size: clamp(1.5rem, 5vw, 1.875rem);
  }

  .text-responsive-4xl {
    font-size: clamp(1.75rem, 5.5vw, 2.25rem);
  }

  .text-responsive-5xl {
    font-size: clamp(2rem, 6vw, 3rem);
  }

  /* Folder card responsive text */
  .folder-title {
    font-size: clamp(0.875rem, 2.5vw + 0.25rem, 1.125rem);
    line-height: 1.3;
  }

  .folder-description {
    font-size: clamp(0.625rem, 2vw + 0.1rem, 0.875rem);
    line-height: 1.4;
  }

  .folder-meta {
    font-size: clamp(0.625rem, 1.5vw + 0.1rem, 0.75rem);
  }

  /* File card responsive text */
  .file-title {
    font-size: clamp(0.75rem, 2vw + 0.2rem, 1rem);
    line-height: 1.3;
  }

  .file-meta {
    font-size: clamp(0.625rem, 1.5vw + 0.1rem, 0.75rem);
  }

  .file-tag {
    font-size: clamp(0.5rem, 1.5vw, 0.75rem);
    padding: clamp(0.125rem, 0.5vw, 0.25rem) clamp(0.375rem, 1vw, 0.5rem);
  }

  /* Header responsive text */
  .page-title {
    font-size: clamp(1.5rem, 5vw + 0.5rem, 3rem);
    line-height: 1.2;
  }

  .page-subtitle {
    font-size: clamp(0.75rem, 2.5vw + 0.1rem, 1.125rem);
  }

  /* Button responsive text */
  .btn-text {
    font-size: clamp(0.75rem, 2vw + 0.1rem, 0.875rem);
  }

  /* Breadcrumb responsive text */
  .breadcrumb-text {
    font-size: clamp(0.625rem, 2vw, 0.875rem);
  }
`;

// File interface - files will be stored in /public/images/video/
interface FileItem {
  id: number;
  name: string;
  type: "image" | "video" | "clip";
  url: string;
  thumbnail: string;
  size: string;
  date: string;
  tags: string[];
  favorite: boolean;
  views: number;
  duration?: string;
  category: string;
  needsThumbnailGeneration?: boolean;
}

// Initial empty files - users will upload files to /public/images/video/
const initialFiles: FileItem[] = [];

// Recursive nested folder structure
interface NestedFolder {
  id: string;
  name: string;
  fileIds: number[];
  children: NestedFolder[];
  parentId: string | null;
  relativePath: string | null;
}

interface MediaFolder {
  id: string;
  name: string;
  description: string;
  gradient: string;
  icon: LucideIcon;
  subFolders: NestedFolder[];
  rootFileIds: number[];
  relativePath?: string;
}

type MediaFolderTemplate = Omit<MediaFolder, "subFolders" | "rootFileIds">;

const folderTemplates: MediaFolderTemplate[] = [
  {
    id: "ad-content",
    name: "Ad Content",
    description: "✨ ภาพผลลัพธ์ก่อน-หลังศัลยกรรม",
    gradient: "from-rose-500 to-pink-600",
    icon: Sparkles,
  },
  {
    id: "before-and-after",
    name: "Before and After",
    description: "💬 รีวิวและประสบการณ์คนไข้จริง",
    gradient: "from-amber-500 to-orange-500",
    icon: MessageSquareQuote,
  },
  {
    id: "branding",
    name: "Branding",
    description: "🎬 คลิปวีดีโอขั้นตอนหัตถการ",
    gradient: "from-emerald-500 to-teal-500",
    icon: Film,
  },
  {
    id: "presentations",
    name: "Presentations",
    description: "👨‍⚕️ โปรไฟล์ทีมแพทย์ผู้เชี่ยวชาญ",
    gradient: "from-sky-500 to-blue-600",
    icon: Presentation,
  },
  {
    id: "all-footages",
    name: "All Footages",
    description: "🏥 พาชมคลินิกและห้องผ่าตัด",
    gradient: "from-violet-500 to-purple-600",
    icon: Megaphone,
  },
  {
    id: "other-files",
    name: "Other Files",
    description: "🎁 โปรโมชั่นและส่วนลดพิเศษ",
    gradient: "from-fuchsia-500 to-pink-500",
    icon: Archive,
  },
];

const categoryFolderMap: Record<string, MediaFolderTemplate["id"]> = {
  "Promo Clips": "ad-content",
  "Social Media": "ad-content",
  Marketing: "ad-content",
  "Before/After": "before-and-after",
  Products: "branding",
  Testimonials: "before-and-after",
  Consultations: "before-and-after",
  Events: "presentations",
  "Surgery Videos": "all-footages",
  Training: "all-footages",
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const getPathSegments = (value: string) =>
  value
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);

const getIdFromPath = (value: string) =>
  getPathSegments(value).map((segment) => slugify(segment)).join("-");

type ApiFolderNode = {
  id: string;
  name: string;
  fileIds: number[];
  path: string;
  children: ApiFolderNode[];
};

type MarketingApiResponse = {
  folders: ApiFolderNode[];
  files: FileItem[];
};

// Helper functions for nested folder operations
const findFolderById = (folders: NestedFolder[], id: string): NestedFolder | null => {
  for (const folder of folders) {
    if (folder.id === id) return folder;
    const found = findFolderById(folder.children, id);
    if (found) return found;
  }
  return null;
};

const isLeafFolder = (folder: NestedFolder): boolean => {
  return folder.children.length === 0;
};

const countAllSubFolders = (folders: NestedFolder[]): number => {
  return folders.reduce((acc, folder) => {
    return acc + 1 + countAllSubFolders(folder.children);
  }, 0);
};

const getAllFileIds = (folder: NestedFolder): number[] => {
  const ids = [...folder.fileIds];
  folder.children.forEach(child => {
    ids.push(...getAllFileIds(child));
  });
  return ids;
};

const createInitialFolders = (mediaFiles: FileItem[]): MediaFolder[] => {
  const templateMap = new Map<string, MediaFolder>();
  folderTemplates.forEach((template) => {
    templateMap.set(template.id, { ...template, subFolders: [], rootFileIds: [], relativePath: template.name });
  });

  const fallbackId = "other-files";

  mediaFiles.forEach((file) => {
    const folderId = categoryFolderMap[file.category] || fallbackId;
    const folder = templateMap.get(folderId);
    if (!folder) return;

    const subFolderName = file.category;
    let subFolder = folder.subFolders.find((sub) => sub.name === subFolderName);

    if (!subFolder) {
      subFolder = {
        id: `${folder.id}-${slugify(subFolderName)}`,
        name: subFolderName,
        fileIds: [],
        children: [],
        parentId: null,
        relativePath: `${folder.name}/${subFolderName}`,
      };
      folder.subFolders.push(subFolder);
    }

    if (subFolder && !subFolder.fileIds.includes(file.id)) {
      subFolder.fileIds.push(file.id);
    }
  });

  return folderTemplates.map((template) => templateMap.get(template.id)!);
};

const mapApiNodeToNested = (node: ApiFolderNode, parentId: string | null): NestedFolder => ({
  id: node.id,
  name: node.name,
  fileIds: node.fileIds,
  parentId,
  relativePath: node.path,
  children: node.children.map((child) => mapApiNodeToNested(child, node.id)),
});

const buildFoldersFromApi = (nodes: ApiFolderNode[]): MediaFolder[] => {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  return folderTemplates.map((template) => {
    const serverNode = nodeMap.get(template.id);
    const relativePath = serverNode?.path ?? template.relativePath ?? template.name;
    return {
      ...template,
      relativePath,
      rootFileIds: serverNode?.fileIds ?? [],
      subFolders: serverNode
        ? serverNode.children.map((child) => mapApiNodeToNested(child, null))
        : [],
    };
  });
};
const AllFilesGalleryPage = () => {
  const router = useRouter();
  const { setSuppressLoading } = useLoading();
  const [files, setFiles] = useState<FileItem[]>(initialFiles);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Connect LoadingContext suppressor to FileProgress hook
  useEffect(() => {
    setLoadingContextSuppressor(setSuppressLoading);
    return () => {
      setLoadingContextSuppressor(() => { });
    };
  }, [setSuppressLoading]);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "masonry">("grid");
  const [filterType, setFilterType] = useState<
    "all" | "image" | "video" | "clip"
  >("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [sortBy, setSortBy] = useState<"date" | "name" | "size" | "views">(
    "date"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [folders, setFolders] = useState<MediaFolder[]>(() =>
    createInitialFolders(initialFiles)
  );
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  // Breadcrumb path: array of folder IDs representing the navigation path
  const [folderPath, setFolderPath] = useState<string[]>([]);
  const [isCreatingSubFolder, setIsCreatingSubFolder] = useState(false);
  const [subFolderDraftName, setSubFolderDraftName] = useState("");
  const [editingSubFolderId, setEditingSubFolderId] = useState<string | null>(
    null
  );
  const [editingSubFolderValue, setEditingSubFolderValue] = useState("");
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderValue, setEditingFolderValue] = useState("");

  // Drag and drop state
  const [draggingFileId, setDraggingFileId] = useState<number | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

  // Mobile and feature state
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAIDropZone, setShowAIDropZone] = useState(true);
  const [aiDragOver, setAIDragOver] = useState(false);
  const [aiProcessingFiles, setAIProcessingFiles] = useState<number[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareFileId, setShareFileId] = useState<number | null>(null);
  const [isGlobalDropActive, setIsGlobalDropActive] = useState(false);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [showHeaderSearch, setShowHeaderSearch] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'delete' | 'warning' | 'info';
    title: string;
    message: string;
    itemName?: string;
    onConfirm: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
  }>({
    isOpen: false,
    type: 'delete',
    title: '',
    message: '',
    onConfirm: () => { },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const isMountedRef = useRef(true);
  const thumbnailGenerationRef = useRef<Set<number>>(new Set());

  // File progress tracking for upload/download animations
  const {
    items: progressItems,
    uploadFile: trackUpload,
    downloadFile: trackDownload,
    cancelTransfer,
    dismissItem,
    clearCompleted,
    updateItem,
  } = useFileProgress({
    onUploadComplete: (id) => {
      console.log("Upload complete:", id);
      loadMarketingFolders();
    },
    onDownloadComplete: (id) => {
      console.log("Download complete:", id);
    },
    onError: (id, error) => {
      console.error("Transfer error:", id, error);
    },
  });

  // Generate video thumbnail using canvas
  const generateVideoThumbnail = useCallback(async (file: FileItem): Promise<string | null> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.preload = 'metadata';

      const cleanup = () => {
        video.removeEventListener('loadeddata', handleLoadedData);
        video.removeEventListener('error', handleError);
        video.removeEventListener('loadedmetadata', handleMetadata);
        video.src = '';
        video.load();
      };

      const handleError = () => {
        console.warn(`Failed to load video for thumbnail: ${file.name}`);
        cleanup();
        resolve(null);
      };

      const handleMetadata = () => {
        // Seek to 1 second or 10% of video duration for a better frame
        const seekTime = Math.min(1, video.duration * 0.1);
        video.currentTime = seekTime;
      };

      const handleLoadedData = () => {
        try {
          const canvas = document.createElement('canvas');
          // Use reasonable dimensions for thumbnail
          canvas.width = 640;
          canvas.height = 360;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            cleanup();
            resolve(null);
            return;
          }

          // Calculate aspect ratio to maintain proportions
          const videoAspect = video.videoWidth / video.videoHeight;
          const canvasAspect = canvas.width / canvas.height;

          let drawWidth = canvas.width;
          let drawHeight = canvas.height;
          let offsetX = 0;
          let offsetY = 0;

          if (videoAspect > canvasAspect) {
            drawHeight = canvas.width / videoAspect;
            offsetY = (canvas.height - drawHeight) / 2;
          } else {
            drawWidth = canvas.height * videoAspect;
            offsetX = (canvas.width - drawWidth) / 2;
          }

          // Fill background with dark color
          ctx.fillStyle = '#1e1b4b';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw video frame
          ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);

          // Convert to blob and upload
          canvas.toBlob(async (blob) => {
            if (!blob) {
              cleanup();
              resolve(null);
              return;
            }

            try {
              const formData = new FormData();
              formData.append('videoPath', file.url);
              formData.append('thumbnail', blob, 'thumbnail.jpg');

              const response = await fetch('/api/video-thumbnail', {
                method: 'POST',
                body: formData,
              });

              if (response.ok) {
                const data = await response.json();
                cleanup();
                resolve(data.thumbnailUrl);
              } else {
                cleanup();
                resolve(null);
              }
            } catch (error) {
              console.error('Failed to upload thumbnail:', error);
              cleanup();
              resolve(null);
            }
          }, 'image/jpeg', 0.85);
        } catch (error) {
          console.error('Failed to generate thumbnail:', error);
          cleanup();
          resolve(null);
        }
      };

      video.addEventListener('loadedmetadata', handleMetadata);
      video.addEventListener('loadeddata', handleLoadedData);
      video.addEventListener('error', handleError);

      // Set timeout to prevent hanging
      setTimeout(() => {
        if (!video.videoWidth) {
          cleanup();
          resolve(null);
        }
      }, 10000);

      video.src = file.url;
      video.load();
    });
  }, []);

  // Generate thumbnails for videos that need them
  useEffect(() => {
    const videosNeedingThumbnails = files.filter(
      (file) =>
        (file.type === 'video' || file.type === 'clip') &&
        file.needsThumbnailGeneration &&
        !thumbnailGenerationRef.current.has(file.id)
    );

    if (videosNeedingThumbnails.length === 0) return;

    const generateThumbnails = async () => {
      for (const file of videosNeedingThumbnails) {
        if (!isMountedRef.current) break;

        // Mark as being processed
        thumbnailGenerationRef.current.add(file.id);

        const thumbnailUrl = await generateVideoThumbnail(file);

        if (thumbnailUrl && isMountedRef.current) {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === file.id
                ? { ...f, thumbnail: thumbnailUrl, needsThumbnailGeneration: false }
                : f
            )
          );
        }
      }
    };

    // Start thumbnail generation with a small delay to not block initial render
    const timeoutId = setTimeout(generateThumbnails, 500);
    return () => clearTimeout(timeoutId);
  }, [files, generateVideoThumbnail]);

  const loadMarketingFolders = useCallback(async (signal?: AbortSignal) => {
    if (isMountedRef.current) {
      setIsLoading(true);
    }

    try {
      const response = await fetch("/api/marketing-folders", { signal });
      if (!response.ok) {
        throw new Error(`Failed to load marketing folders: ${response.status}`);
      }
      const data: MarketingApiResponse = await response.json();
      if (!isMountedRef.current) return;
      const folderData = Array.isArray(data.folders) ? data.folders : [];
      const fileData = Array.isArray(data.files) ? data.files : initialFiles;
      setFiles(fileData);
      setFolders(buildFoldersFromApi(folderData));
    } catch (error) {
      console.error("Unable to load marketing folders", error);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    const controller = new AbortController();
    loadMarketingFolders(controller.signal);
    return () => {
      controller.abort();
      isMountedRef.current = false;
    };
  }, [loadMarketingFolders]);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Categories สำหรับ filter
  const categories = useMemo(() => {
    const cats = new Set(files.map((f) => f.category));
    return ["all", ...Array.from(cats)];
  }, [files]);

  const activeFolder = useMemo(() => {
    if (!activeFolderId) return null;
    return folders.find((folder) => folder.id === activeFolderId) || null;
  }, [activeFolderId, folders]);

  // Get the current nested folder based on breadcrumb path
  const currentNestedFolder = useMemo((): NestedFolder | null => {
    if (!activeFolder || folderPath.length === 0) return null;

    let current: NestedFolder | null = null;
    let searchIn = activeFolder.subFolders;

    for (const folderId of folderPath) {
      current = searchIn.find(f => f.id === folderId) || null;
      if (!current) return null;
      searchIn = current.children;
    }

    return current;
  }, [activeFolder, folderPath]);

  // Get folders to display (either root sub folders or children of current nested folder)
  const displayFolders = useMemo((): NestedFolder[] => {
    if (!activeFolder) return [];
    if (folderPath.length === 0) return activeFolder.subFolders;
    if (currentNestedFolder) return currentNestedFolder.children;
    return [];
  }, [activeFolder, folderPath, currentNestedFolder]);

  // Check if we can upload files (at leaf folders OR at main folder root with no subfolders)
  const canUploadFiles = useMemo((): boolean => {
    // Case 1: We're inside a nested folder - check if it's a leaf
    if (currentNestedFolder) {
      return isLeafFolder(currentNestedFolder);
    }

    // Case 2: We're at the root of a main folder (no nested folder selected)
    // Allow upload if the main folder has no subfolders (it's essentially a leaf)
    if (activeFolder && folderPath.length === 0) {
      return activeFolder.subFolders.length === 0;
    }

    return false;
  }, [currentNestedFolder, activeFolder, folderPath]);

  // Build breadcrumb items for display
  const breadcrumbItems = useMemo(() => {
    if (!activeFolder) return [];

    const items: { id: string; name: string; isRoot?: boolean }[] = [
      { id: activeFolder.id, name: activeFolder.name, isRoot: true }
    ];

    let searchIn = activeFolder.subFolders;
    for (const folderId of folderPath) {
      const folder = searchIn.find(f => f.id === folderId);
      if (folder) {
        items.push({ id: folder.id, name: folder.name });
        searchIn = folder.children;
      }
    }

    return items;
  }, [activeFolder, folderPath]);

  const visibleFileIdSet = useMemo(() => {
    // No folder selected - show NO files (only show folder grid)
    if (!activeFolder) {
      return new Set<number>();
    }

    // If we're at a nested folder that is a leaf, show only its files
    if (currentNestedFolder && isLeafFolder(currentNestedFolder)) {
      return new Set(currentNestedFolder.fileIds);
    }

    // If we're inside a folder but it has subfolders, show no files (navigate deeper first)
    if (currentNestedFolder && !isLeafFolder(currentNestedFolder)) {
      return new Set<number>();
    }

    // At root of main folder - check if it has subfolders
    if (activeFolder.subFolders.length > 0) {
      // Has subfolders, don't show files - user needs to navigate deeper
      return new Set<number>();
    }

    // At root of main folder with no subfolders - show root files only
    return new Set(activeFolder.rootFileIds);
  }, [activeFolder, currentNestedFolder]);

  // Filtered และ Sorted files
  const filteredFiles = useMemo(() => {
    let result = files.filter((file) => visibleFileIdSet.has(file.id));

    // Filter by type
    if (filterType !== "all") {
      result = result.filter((f) => f.type === filterType);
    }

    // Filter by category
    if (selectedCategory !== "all") {
      result = result.filter((f) => f.category === selectedCategory);
    }

    // Filter favorites
    if (showFavoritesOnly) {
      result = result.filter((f) => f.favorite);
    }

    // Search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(search) ||
          f.tags.some((t) => t.toLowerCase().includes(search)) ||
          f.category.toLowerCase().includes(search)
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "date":
          comparison = new Date(b.date).getTime() - new Date(a.date).getTime();
          break;
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "size":
          comparison = parseFloat(a.size) - parseFloat(b.size);
          break;
        case "views":
          comparison = a.views - b.views;
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [
    files,
    filterType,
    selectedCategory,
    showFavoritesOnly,
    searchTerm,
    sortBy,
    sortDirection,
    visibleFileIdSet,
  ]);

  useEffect(() => {
    const checkAuth = () => {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        window.location.href = "/login";
        return;
      }
      const user = JSON.parse(userStr);
      setCurrentUser(user);
    };
    checkAuth();
  }, []);

  const handleFolderSelect = (folderId: string) => {
    setSelectedFiles([]);
    setShowLightbox(false);

    if (folderId === activeFolderId) {
      setActiveFolderId(null);
      setFolderPath([]);
    } else {
      setActiveFolderId(folderId);
      setFolderPath([]);
    }

    setIsCreatingSubFolder(false);
    setSubFolderDraftName("");
    setEditingSubFolderId(null);
    setEditingSubFolderValue("");
    setSelectedCategory("all");
  };

  // Navigate into a nested folder
  const handleNestedFolderSelect = (folderId: string) => {
    setFolderPath(prev => [...prev, folderId]);
    setIsCreatingSubFolder(false);
    setSubFolderDraftName("");
    setEditingSubFolderId(null);
  };

  // Navigate to a specific breadcrumb level
  const handleBreadcrumbClick = (index: number) => {
    if (index === 0) {
      // Clicking on root folder name
      setFolderPath([]);
    } else {
      // Clicking on a nested folder in breadcrumb
      setFolderPath(prev => prev.slice(0, index));
    }
    setIsCreatingSubFolder(false);
  };

  // Helper to recursively add a folder to nested structure
  const addFolderToNested = (
    folders: NestedFolder[],
    parentPath: string[],
    newFolder: NestedFolder
  ): NestedFolder[] => {
    if (parentPath.length === 0) {
      return [...folders, newFolder];
    }

    const [currentId, ...restPath] = parentPath;
    return folders.map(folder => {
      if (folder.id === currentId) {
        return {
          ...folder,
          children: addFolderToNested(folder.children, restPath, newFolder)
        };
      }
      return folder;
    });
  };

  // Helper to recursively delete a folder from nested structure
  const deleteFolderFromNested = (
    folders: NestedFolder[],
    targetId: string
  ): NestedFolder[] => {
    return folders
      .filter(folder => folder.id !== targetId)
      .map(folder => ({
        ...folder,
        children: deleteFolderFromNested(folder.children, targetId)
      }));
  };

  // Helper to recursively update a folder name in nested structure
  const updateFolderNameInNested = (
    folders: NestedFolder[],
    targetId: string,
    newName: string
  ): NestedFolder[] => {
    return folders.map(folder => {
      if (folder.id === targetId) {
        return { ...folder, name: newName };
      }
      return {
        ...folder,
        children: updateFolderNameInNested(folder.children, targetId, newName)
      };
    });
  };

  const getCurrentParentPath = (): string | null => {
    if (!activeFolder) return null;
    const segments = [activeFolder.name];
    let searchIn = activeFolder.subFolders;

    for (const folderId of folderPath) {
      const match = searchIn.find((item) => item.id === folderId);
      if (!match) break;
      segments.push(match.name);
      searchIn = match.children;
    }

    return segments.join("/");
  };

  const handleCreateSubFolder = async () => {
    if (!activeFolderId) return;
    const trimmedName = subFolderDraftName.trim();
    if (!trimmedName) return;

    const folder = folders.find((item) => item.id === activeFolderId);
    if (!folder) return;

    const currentLevelFolders = folderPath.length === 0
      ? folder.subFolders
      : (currentNestedFolder?.children || []);

    const hasDuplicate = currentLevelFolders.some(
      (sub) => sub.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (hasDuplicate) {
      alert("This folder name is already in use at this level.");
      return;
    }

    const parentPath = getCurrentParentPath();
    if (!parentPath) return;

    try {
      const response = await fetch("/api/marketing-folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentPath, folderName: trimmedName }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error || `ไม่สามารถสร้างโฟลเดอร์ได้ (รหัส ${response.status})`);
      }

      await loadMarketingFolders();
      setSubFolderDraftName("");
      setIsCreatingSubFolder(false);
    } catch (error) {
      console.error("Failed to create subfolder", error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("เกิดข้อผิดพลาดขณะสร้างโฟลเดอร์");
      }
    }
  };

  const handleDeleteSubFolder = async (subFolderId: string) => {
    if (!activeFolderId) return;

    const folderToDelete = displayFolders.find((f) => f.id === subFolderId);
    if (!folderToDelete) return;

    if (folderToDelete.fileIds.length > 0 || folderToDelete.children.length > 0) {
      showConfirmation({
        type: 'warning',
        title: 'ไม่สามารถลบได้',
        message: 'กรุณาลบไฟล์และโฟลเดอร์ย่อยทั้งหมดก่อนลบโฟลเดอร์นี้',
        confirmText: 'ตกลง',
        onConfirm: closeConfirmModal,
      });
      return;
    }

    showConfirmation({
      type: 'delete',
      title: 'ยืนยันการลบโฟลเดอร์',
      message: 'คุณต้องการลบโฟลเดอร์นี้หรือไม่?',
      itemName: folderToDelete.name,
      confirmText: 'ลบโฟลเดอร์',
      cancelText: 'ยกเลิก',
      onConfirm: async () => {
        closeConfirmModal();
        const targetPath = folderToDelete.relativePath;
        if (!targetPath) {
          showConfirmation({
            type: 'warning',
            title: 'เกิดข้อผิดพลาด',
            message: 'ไม่สามารถลบโฟลเดอร์นี้ได้ในขณะนี้',
            confirmText: 'ตกลง',
            onConfirm: closeConfirmModal,
          });
          return;
        }

        try {
          const response = await fetch("/api/marketing-folders", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: targetPath }),
          });

          if (!response.ok) {
            const errorBody = await response.json().catch(() => null);
            throw new Error(errorBody?.error || `ไม่สามารถลบโฟลเดอร์ได้ (รหัส ${response.status})`);
          }

          await loadMarketingFolders();
          setFolderPath((prev) => prev.filter((id) => id !== subFolderId));
        } catch (error) {
          console.error("Failed to delete subfolder", error);
          showConfirmation({
            type: 'warning',
            title: 'เกิดข้อผิดพลาด',
            message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดขณะลบโฟลเดอร์',
            confirmText: 'ตกลง',
            onConfirm: closeConfirmModal,
          });
        }
      },
    });
  };

  const handleStartEditSubFolder = (subFolder: NestedFolder) => {
    setEditingSubFolderId(subFolder.id);
    setEditingSubFolderValue(subFolder.name);
  };

  const handleCancelEditSubFolder = () => {
    setEditingSubFolderId(null);
    setEditingSubFolderValue("");
  };

  const handleSaveSubFolderName = async (subFolderId: string) => {
    if (!activeFolderId) return;
    const trimmedValue = editingSubFolderValue.trim();
    if (!trimmedValue) return;

    const folderToRename = displayFolders.find((sub) => sub.id === subFolderId);
    if (!folderToRename || !folderToRename.relativePath) {
      alert("ไม่สามารถเปลี่ยนชื่อโฟลเดอร์นี้ได้ในขณะนี้");
      return;
    }

    // Check for duplicates at the current level
    const hasDuplicate = displayFolders.some(
      (sub) =>
        sub.id !== subFolderId &&
        sub.name.toLowerCase() === trimmedValue.toLowerCase()
    );

    if (hasDuplicate) {
      alert("This folder name is already in use at this level.");
      return;
    }

    try {
      const response = await fetch("/api/marketing-folders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPath: folderToRename.relativePath,
          newName: trimmedValue,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error || `ไม่สามารถเปลี่ยนชื่อโฟลเดอร์ได้ (รหัส ${response.status})`);
      }

      const data = await response.json().catch(() => null);
      const parentSegments = getPathSegments(folderToRename.relativePath).slice(0, -1);
      const fallbackPath = parentSegments.length
        ? `${parentSegments.join("/")}/${trimmedValue}`
        : trimmedValue;
      const newPath = data?.path || fallbackPath;
      const newId = getIdFromPath(newPath);

      await loadMarketingFolders();
      setFolderPath((prev) => prev.map((id) => (id === subFolderId ? newId : id)));
      setEditingSubFolderId(null);
      setEditingSubFolderValue("");
    } catch (error) {
      console.error("Failed to rename folder", error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("เกิดข้อผิดพลาดขณะเปลี่ยนชื่อโฟลเดอร์");
      }
    }
  };

  // Folder edit/delete handlers
  const handleStartEditFolder = (folder: MediaFolder) => {
    setEditingFolderId(folder.id);
    setEditingFolderValue(folder.name);
  };

  const handleCancelEditFolder = () => {
    setEditingFolderId(null);
    setEditingFolderValue("");
  };

  const handleSaveFolderName = (folderId: string) => {
    const trimmedValue = editingFolderValue.trim();
    if (!trimmedValue) return;

    const hasDuplicate = folders.some(
      (f) => f.id !== folderId && f.name.toLowerCase() === trimmedValue.toLowerCase()
    );

    if (hasDuplicate) {
      alert("This folder name is already in use.");
      return;
    }

    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === folderId ? { ...folder, name: trimmedValue } : folder
      )
    );

    setEditingFolderId(null);
    setEditingFolderValue("");
  };

  const handleDeleteFolder = (folderId: string) => {
    const folder = folders.find((f) => f.id === folderId);
    if (!folder) return;

    const totalFiles =
      folder.rootFileIds.length +
      folder.subFolders.reduce((acc, sub) => acc + getAllFileIds(sub).length, 0);
    if (totalFiles > 0) {
      showConfirmation({
        type: 'warning',
        title: 'ไม่สามารถลบได้',
        message: 'กรุณาย้ายหรือลบไฟล์ทั้งหมดก่อนลบโฟลเดอร์นี้',
        confirmText: 'ตกลง',
        onConfirm: closeConfirmModal,
      });
      return;
    }

    showConfirmation({
      type: 'delete',
      title: 'ยืนยันการลบโฟลเดอร์',
      message: 'คุณต้องการลบโฟลเดอร์นี้หรือไม่?',
      itemName: folder.name,
      confirmText: 'ลบโฟลเดอร์',
      cancelText: 'ยกเลิก',
      onConfirm: () => {
        closeConfirmModal();
        setFolders((prev) => prev.filter((f) => f.id !== folderId));

        if (activeFolderId === folderId) {
          setActiveFolderId(null);
          setFolderPath([]);
        }
      },
    });
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, fileId: number) => {
    setDraggingFileId(fileId);
    e.dataTransfer.setData("text/plain", fileId.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggingFileId(null);
    setDragOverFolderId(null);
  };

  const handleDragOver = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverFolderId(folderId);
  };

  const handleDragLeave = () => {
    setDragOverFolderId(null);
  };

  const handleDropOnFolder = async (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files?.length) {
      const targetFolder = folders.find((folder) => folder.id === folderId);
      const targetPath = targetFolder?.relativePath ?? targetFolder?.name ?? null;
      setIsGlobalDropActive(false);
      setDraggingFileId(null);
      setDragOverFolderId(null);

      if (!targetPath) {
        alert("เลือกโฟลเดอร์ปลายทางก่อนอัปโหลดไฟล์");
        return;
      }

      try {
        await processUploadedFiles(e.dataTransfer.files, targetPath);
      } catch (error) {
        console.error("Failed to upload files via folder drop", error);
        if (error instanceof Error) {
          alert(error.message);
        } else {
          alert("เกิดข้อผิดพลาดขณะอัปโหลดไฟล์");
        }
      }
      return;
    }
    const fileId = parseInt(e.dataTransfer.getData("text/plain"));

    if (isNaN(fileId)) return;

    setFolders(prev => prev.map(folder => {
      const cleanedFolder = removeFileFromFolder(folder, fileId);

      if (folder.id !== folderId) {
        return cleanedFolder;
      }

      let updatedSubFolders = cleanedFolder.subFolders;

      if (updatedSubFolders.length === 0) {
        const newSubFolder: NestedFolder = {
          id: `${folder.id}-default`,
          name: "Unsorted",
          fileIds: [fileId],
          children: [],
          parentId: null,
          relativePath: null,
        };
        updatedSubFolders = [newSubFolder];
      } else {
        updatedSubFolders = addFileToFirstLeaf(updatedSubFolders, fileId);
      }

      return { ...cleanedFolder, subFolders: updatedSubFolders };
    }));

    setDraggingFileId(null);
    setDragOverFolderId(null);
  };

  // Helper function to remove file from nested folders
  const removeFileFromNestedFolders = (folders: NestedFolder[], fileId: number): NestedFolder[] => {
    return folders.map(folder => ({
      ...folder,
      fileIds: folder.fileIds.filter(id => id !== fileId),
      children: removeFileFromNestedFolders(folder.children, fileId)
    }));
  };

  const removeFileFromFolder = (folder: MediaFolder, fileId: number): MediaFolder => ({
    ...folder,
    rootFileIds: folder.rootFileIds.filter((id) => id !== fileId),
    subFolders: removeFileFromNestedFolders(folder.subFolders, fileId),
  });

  // Helper function to add file to first leaf folder
  const addFileToFirstLeaf = (folders: NestedFolder[], fileId: number): NestedFolder[] => {
    let added = false;
    const result = folders.map(folder => {
      if (added) return folder;

      if (isLeafFolder(folder)) {
        if (!folder.fileIds.includes(fileId)) {
          added = true;
          return { ...folder, fileIds: [...folder.fileIds, fileId] };
        }
        return folder;
      } else {
        const updatedChildren = addFileToFirstLeaf(folder.children, fileId);
        if (updatedChildren !== folder.children) {
          added = true;
          return { ...folder, children: updatedChildren };
        }
        return folder;
      }
    });
    return result;
  };

  // Distribute all files randomly into folders
  const distributeFilesRandomly = () => {
    const allFileIds = files.map(f => f.id);

    setFolders(prev => {
      // First, clear all files from folders
      const clearedFolders = prev.map(folder => ({
        ...folder,
        rootFileIds: [],
        subFolders: clearFilesFromNestedFolders(folder.subFolders)
      }));

      // Then distribute files randomly
      const shuffledFiles = [...allFileIds].sort(() => Math.random() - 0.5);

      return clearedFolders.map((folder, folderIndex) => {
        // Calculate how many files go to this folder
        const filesPerFolder = Math.ceil(shuffledFiles.length / clearedFolders.length);
        const startIdx = folderIndex * filesPerFolder;
        const endIdx = Math.min(startIdx + filesPerFolder, shuffledFiles.length);
        const folderFileIds = shuffledFiles.slice(startIdx, endIdx);

        if (folderFileIds.length === 0) return folder;

        // If no subfolders, create one
        if (folder.subFolders.length === 0) {
          const newSubFolder: NestedFolder = {
            id: `${folder.id}-default`,
            name: "Unsorted",
            fileIds: folderFileIds,
            children: [],
            parentId: null,
            relativePath: null,
          };
          return { ...folder, subFolders: [newSubFolder] };
        }

        // Distribute to existing subfolders
        const updatedSubFolders = distributeToSubFolders(folder.subFolders, folderFileIds);
        return { ...folder, subFolders: updatedSubFolders };
      });
    });
  };

  // Helper to clear files from nested folders
  const clearFilesFromNestedFolders = (folders: NestedFolder[]): NestedFolder[] => {
    return folders.map(folder => ({
      ...folder,
      fileIds: [],
      children: clearFilesFromNestedFolders(folder.children)
    }));
  };

  // Helper to distribute files to subfolders
  const distributeToSubFolders = (folders: NestedFolder[], fileIds: number[]): NestedFolder[] => {
    if (folders.length === 0 || fileIds.length === 0) return folders;

    // Find all leaf folders
    const leafFolders: NestedFolder[] = [];
    const findLeaves = (folderList: NestedFolder[]) => {
      folderList.forEach(f => {
        if (isLeafFolder(f)) leafFolders.push(f);
        else findLeaves(f.children);
      });
    };
    findLeaves(folders);

    if (leafFolders.length === 0) {
      // No leaf folders, add to first folder
      return folders.map((f, i) => i === 0 ? { ...f, fileIds: [...f.fileIds, ...fileIds] } : f);
    }

    // Distribute files among leaf folders
    const filesPerLeaf = Math.ceil(fileIds.length / leafFolders.length);
    const fileAssignments = new Map<string, number[]>();

    leafFolders.forEach((leaf, idx) => {
      const startIdx = idx * filesPerLeaf;
      const endIdx = Math.min(startIdx + filesPerLeaf, fileIds.length);
      fileAssignments.set(leaf.id, fileIds.slice(startIdx, endIdx));
    });

    // Apply assignments
    const applyAssignments = (folderList: NestedFolder[]): NestedFolder[] => {
      return folderList.map(f => {
        const assigned = fileAssignments.get(f.id);
        if (assigned) {
          return { ...f, fileIds: [...f.fileIds, ...assigned] };
        }
        return { ...f, children: applyAssignments(f.children) };
      });
    };

    return applyAssignments(folders);
  };

  const getFolderFileCount = (folder: MediaFolder) =>
    folder.rootFileIds.length +
    folder.subFolders.reduce((acc, sub) => acc + getAllFileIds(sub).length, 0);

  const toggleFavorite = (id: number) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, favorite: !f.favorite } : f))
    );
  };

  // Helper function to show confirmation modal
  const showConfirmation = (options: {
    type?: 'delete' | 'warning' | 'info';
    title: string;
    message: string;
    itemName?: string;
    onConfirm: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
  }) => {
    setConfirmModal({
      isOpen: true,
      type: options.type || 'delete',
      title: options.title,
      message: options.message,
      itemName: options.itemName,
      onConfirm: options.onConfirm,
      onCancel: options.onCancel,
      confirmText: options.confirmText,
      cancelText: options.cancelText,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  // Delete file handler with confirmation
  const handleDeleteFile = async (fileId: number) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    showConfirmation({
      type: 'delete',
      title: 'ยืนยันการลบไฟล์',
      message: 'คุณต้องการลบไฟล์นี้หรือไม่?',
      itemName: file.name,
      confirmText: 'ลบไฟล์',
      cancelText: 'ยกเลิก',
      onConfirm: async () => {
        closeConfirmModal();
        try {
          const response = await fetch("/api/marketing-files", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filePath: file.url }),
          });

          if (!response.ok) {
            const errorBody = await response.json().catch(() => null);
            throw new Error(
              errorBody?.error || `ไม่สามารถลบไฟล์ได้ (รหัส ${response.status})`
            );
          }

          await loadMarketingFolders();
          setSelectedFiles((prev) => prev.filter((id) => id !== fileId));
        } catch (error) {
          console.error("Failed to delete file", error);
          showConfirmation({
            type: 'warning',
            title: 'เกิดข้อผิดพลาด',
            message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดขณะลบไฟล์',
            confirmText: 'ตกลง',
            onConfirm: closeConfirmModal,
          });
        }
      },
    });
  };

  const toggleSelect = (id: number) => {
    setSelectedFiles((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedFiles.length === filteredFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredFiles.map((f) => f.id));
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setShowLightbox(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="w-5 h-5" />;
      case "video":
        return <FileVideo className="w-5 h-5" />;
      case "clip":
        return <Film className="w-5 h-5" />;
      default:
        return <FolderOpen className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "image":
        return "from-emerald-400 to-teal-500";
      case "video":
        return "from-purple-400 to-indigo-500";
      case "clip":
        return "from-pink-400 to-rose-500";
      default:
        return "from-gray-400 to-gray-500";
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  // Upload files with progress animation
  const processUploadedFilesWithProgress = async (uploadedFiles: FileList, targetFolderPath: string) => {
    if (!uploadedFiles.length) return;

    const filesArray = Array.from(uploadedFiles);

    // Upload each file with progress tracking
    for (const file of filesArray) {
      await trackUpload(file, {
        url: "/api/marketing-files",
        method: "POST",
        fieldName: "files",
        additionalData: {
          folderPath: targetFolderPath,
        },
      });
    }
  };

  // Legacy upload without progress (kept for compatibility)
  const processUploadedFiles = async (uploadedFiles: FileList, targetFolderPath: string) => {
    if (!uploadedFiles.length) return;

    const formData = new FormData();
    Array.from(uploadedFiles).forEach((file) => {
      formData.append("files", file);
    });
    formData.append("folderPath", targetFolderPath);

    const response = await fetch("/api/marketing-files", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      throw new Error(
        errorBody?.error || `ไม่สามารถอัปโหลดไฟล์ได้ (รหัส ${response.status})`
      );
    }

    await loadMarketingFolders();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles?.length) return;

    const targetPath =
      currentNestedFolder?.relativePath ?? activeFolder?.relativePath ?? null;
    if (!targetPath) {
      alert("กรุณาเปิดโฟลเดอร์ก่อนอัปโหลดไฟล์");
      event.target.value = "";
      return;
    }

    try {
      // Use progress tracking for upload
      await processUploadedFilesWithProgress(uploadedFiles, targetPath);
      setShowUploadModal(false);
    } catch (error) {
      console.error("Failed to upload files", error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("เกิดข้อผิดพลาดขณะอัปโหลดไฟล์");
      }
    } finally {
      event.target.value = "";
    }
  };

  const handleGlobalDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    const hasFiles = Array.from(e.dataTransfer.types || []).includes("Files");
    if (!hasFiles) return;
    e.preventDefault();
    e.stopPropagation();
    setIsGlobalDropActive(true);
    e.dataTransfer.dropEffect = "copy";
  };

  const handleGlobalDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.currentTarget !== e.target) return;
    e.preventDefault();
    e.stopPropagation();
    setIsGlobalDropActive(false);
  };

  const handleGlobalDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    if (!e.dataTransfer.files?.length) {
      setIsGlobalDropActive(false);
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    setIsGlobalDropActive(false);
    setDragOverFolderId(null);

    const targetPath =
      currentNestedFolder?.relativePath ?? activeFolder?.relativePath ?? null;
    if (!targetPath) {
      alert("กรุณาเปิดโฟลเดอร์ก่อนอัปโหลดไฟล์");
      return;
    }

    try {
      await processUploadedFiles(e.dataTransfer.files, targetPath);
    } catch (error) {
      console.error("Failed to upload files via drop", error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("เกิดข้อผิดพลาดขณะอัปโหลดไฟล์");
      }
    }
  };

  // Generate video share URL for LINE inline playback
  const generateVideoShareUrl = async (file: FileItem): Promise<{ shareUrl: string; needsTranscoding: boolean; fileSizeMB?: number }> => {
    // For videos, create a special share URL that includes proper meta tags
    if (file.type === 'video' || file.type === 'clip') {
      // Extract the path from the URL (remove domain if present)
      let videoPath = file.url;
      const baseUrl = window.location.origin;
      if (videoPath.startsWith(baseUrl)) {
        videoPath = videoPath.substring(baseUrl.length);
      }
      if (!videoPath.startsWith('/')) {
        videoPath = '/' + videoPath;
      }

      try {
        const response = await fetch('/api/share-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoPath }),
        });

        if (response.ok) {
          const data = await response.json();
          return {
            shareUrl: data.shareUrl,
            needsTranscoding: data.needsTranscoding || false,
            fileSizeMB: data.fileSizeMB
          };
        }
      } catch (error) {
        console.error('Error generating share URL:', error);
      }
    }
    // Fallback to current page URL
    return { shareUrl: window.location.href, needsTranscoding: false };
  };

  // Transcode video for LINE compatibility
  const transcodeForLine = async (file: FileItem): Promise<boolean> => {
    try {
      const response = await fetch('/api/transcode-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoPath: file.url }),
      });

      if (!response.ok) return false;

      const data = await response.json();

      if (data.status === 'completed') {
        return true;
      }

      // Poll for completion if processing
      if (data.status === 'processing') {
        const jobId = data.jobId;
        let attempts = 0;
        const maxAttempts = 60; // 5 minutes max

        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 5000)); // Check every 5 seconds

          const statusResponse = await fetch(`/api/transcode-video?jobId=${jobId}`);
          const statusData = await statusResponse.json();

          if (statusData.status === 'completed') {
            return true;
          }

          if (statusData.status === 'error') {
            console.error('Transcoding error:', statusData.error);
            return false;
          }

          attempts++;
        }
      }

      return false;
    } catch (error) {
      console.error('Transcode error:', error);
      return false;
    }
  };

  // Share to LINE handler with video support
  const shareToLine = async (fileId: number) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    // For videos, use special share URL for inline playback
    let shareUrl: string;
    if (file.type === 'video' || file.type === 'clip') {
      const result = await generateVideoShareUrl(file);
      shareUrl = result.shareUrl;

      // If file is large, trigger transcoding in background (don't wait)
      if (result.needsTranscoding) {
        console.log(`Video ${file.name} (${result.fileSizeMB}MB) may need transcoding for optimal LINE playback`);
        // Start transcoding in background - don't block sharing
        transcodeForLine(file).then(success => {
          if (success) {
            console.log('Transcoding completed for:', file.name);
          }
        });
      }
    } else {
      shareUrl = window.location.href;
    }

    const shareText = encodeURIComponent(`📹 ${file.name} - BJH Bangkok`);
    const encodedUrl = encodeURIComponent(shareUrl);

    // Open LINE share
    if (isMobile) {
      // Mobile LINE app deep link
      window.location.href = `line://msg/text/${shareText}%0A${encodedUrl}`;
    } else {
      // Desktop LINE share
      window.open(
        `https://social-plugins.line.me/lineit/share?url=${encodedUrl}&text=${shareText}`,
        '_blank',
        'width=500,height=500'
      );
    }

    setShowShareModal(false);
    setShareFileId(null);
  };

  // Share to other platforms
  const shareFile = async (fileId: number, platform: 'line' | 'copy' | 'native') => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    // Get proper share URL for videos
    const shareResult = (file.type === 'video' || file.type === 'clip')
      ? await generateVideoShareUrl(file)
      : { shareUrl: window.location.href, needsTranscoding: false };

    const shareUrl = shareResult.shareUrl;

    switch (platform) {
      case 'line':
        shareToLine(fileId);
        break;
      case 'copy':
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
        break;
      case 'native':
        if (navigator.share) {
          try {
            await navigator.share({
              title: file.name,
              text: `Check out this ${file.type}: ${file.name}`,
              url: shareUrl,
            });
          } catch (err) {
            console.log('Share cancelled');
          }
        }
        break;
    }
    setShowShareModal(false);
  };

  // Download file handler with progress animation
  const handleDownloadFile = async (fileId: number) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    try {
      // Parse file size string to number (e.g., "2.5 MB" -> 2621440)
      const parseSizeToBytes = (sizeStr: string): number => {
        const match = sizeStr.match(/([\d.]+)\s*(B|KB|MB|GB)/i);
        if (!match) return 0;
        const value = parseFloat(match[1]);
        const unit = match[2].toUpperCase();
        const multipliers: Record<string, number> = { B: 1, KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024 };
        return Math.round(value * (multipliers[unit] || 1));
      };

      // Use progress tracking for download
      await trackDownload(
        file.url,
        file.name,
        parseSizeToBytes(file.size),
        { saveAs: true }
      );
    } catch (error) {
      console.error('Download error:', error);
      // Fallback: open in new tab
      window.open(file.url, '_blank');
    }
  };

  // AI Video Production handlers
  const handleAIDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setAIDragOver(true);
  };

  const handleAIDragLeave = () => {
    setAIDragOver(false);
  };

  const handleAIDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const fileId = parseInt(e.dataTransfer.getData("text/plain"));

    if (!isNaN(fileId)) {
      // Add to AI processing queue
      setAIProcessingFiles(prev => [...prev, fileId]);

      // Simulate AI processing (in real app, this would call an API)
      setTimeout(() => {
        alert(`🎬 AI Video Production started for file ID: ${fileId}\n\nYour video will be ready soon!`);
        setAIProcessingFiles(prev => prev.filter(id => id !== fileId));
      }, 2000);
    }

    setAIDragOver(false);
  };

  // Touch-based file selection for mobile
  const handleTouchSelect = (fileId: number) => {
    if (isMobile) {
      toggleSelect(fileId);
    }
  };

  // Video placeholder fallback
  const VIDEO_PLACEHOLDER = "/images/video-placeholder.svg";

  // Thumbnail component with video poster extraction
  const ThumbnailImage = ({ file, className, alt }: { file: FileItem; className: string; alt: string }) => {
    const [imgSrc, setImgSrc] = useState(file.thumbnail);
    const [hasError, setHasError] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const isVideoType = file.type === 'video' || file.type === 'clip';

    useEffect(() => {
      setImgSrc(file.thumbnail);
      setHasError(false);
    }, [file.thumbnail]);

    const handleError = () => {
      setHasError(true);
      setImgSrc(VIDEO_PLACEHOLDER);
    };

    const handleVideoLoad = () => {
      // Seek to 1 second for better thumbnail
      if (videoRef.current) {
        videoRef.current.currentTime = 1;
      }
    };

    // สำหรับวิดีโอ - แสดง video element โดยตรงเพื่อดึงเฟรมแรก
    if (isVideoType) {
      return (
        <div className="relative w-full h-full bg-gradient-to-br from-slate-800 to-purple-900 overflow-hidden">
          <video
            ref={videoRef}
            src={file.url}
            muted
            playsInline
            preload="metadata"
            onLoadedData={handleVideoLoad}
            className={`${className} w-full h-full object-cover`}
            style={{ pointerEvents: 'none' }}
          />
          {/* Play icon overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="p-3 rounded-full bg-black/40 backdrop-blur-sm">
              <Play className="w-6 h-6 text-white fill-white" />
            </div>
          </div>
        </div>
      );
    }

    // สำหรับรูปภาพ - แสดงทันทีโดยไม่ต้องรอ loading
    return (
      <div className="relative w-full h-full bg-gradient-to-br from-slate-800/50 to-purple-900/50">
        <img
          src={imgSrc}
          alt={alt}
          className={className}
          onError={handleError}
          loading="eager"
        />
      </div>
    );
  };

  return (
    <>
      <style>{customScrollbarStyle}</style>
      <div
        className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden"
        onDragOver={handleGlobalDragOver}
        onDragEnter={handleGlobalDragOver}
        onDragLeave={handleGlobalDragLeave}
        onDrop={(e) => void handleGlobalDrop(e)}
      >
        {isGlobalDropActive && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 transition-opacity pointer-events-none">
            <div className="px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-600 via-purple-700 to-blue-500 text-white text-responsive-lg font-semibold pointer-events-none">
              วางไฟล์เพื่ออัพโหลดที่นี่
            </div>
          </div>
        )}
        {/* Animated Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Gradient Orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-500" />

          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />

          {/* Floating Particles - ใช้ค่าคงที่เพื่อหลีกเลี่ยง hydration mismatch */}
          {[
            { left: 5, top: 10, color: '#8b5cf6', delay: 0, duration: 6 },
            { left: 15, top: 80, color: '#ec4899', delay: 1, duration: 7 },
            { left: 25, top: 30, color: '#f97316', delay: 2, duration: 8 },
            { left: 35, top: 60, color: '#06b6d4', delay: 3, duration: 9 },
            { left: 45, top: 20, color: '#8b5cf6', delay: 4, duration: 6 },
            { left: 55, top: 90, color: '#ec4899', delay: 0.5, duration: 7 },
            { left: 65, top: 40, color: '#f97316', delay: 1.5, duration: 8 },
            { left: 75, top: 70, color: '#06b6d4', delay: 2.5, duration: 9 },
            { left: 85, top: 15, color: '#8b5cf6', delay: 3.5, duration: 6 },
            { left: 95, top: 55, color: '#ec4899', delay: 4.5, duration: 7 },
            { left: 10, top: 45, color: '#f97316', delay: 0.8, duration: 8 },
            { left: 20, top: 75, color: '#06b6d4', delay: 1.8, duration: 9 },
            { left: 30, top: 5, color: '#8b5cf6', delay: 2.8, duration: 6 },
            { left: 40, top: 85, color: '#ec4899', delay: 3.8, duration: 7 },
            { left: 50, top: 35, color: '#f97316', delay: 4.2, duration: 8 },
            { left: 60, top: 65, color: '#06b6d4', delay: 0.3, duration: 9 },
            { left: 70, top: 25, color: '#8b5cf6', delay: 1.3, duration: 6 },
            { left: 80, top: 95, color: '#ec4899', delay: 2.3, duration: 7 },
            { left: 90, top: 50, color: '#f97316', delay: 3.3, duration: 8 },
            { left: 98, top: 8, color: '#06b6d4', delay: 4.8, duration: 9 },
          ].map((particle, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-float"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                background: `linear-gradient(135deg, ${particle.color}, transparent)`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 p-3 md:p-6 pb-24">
          {/* Header Section - Samsung Gallery Style */}
          {isSelectionMode ? (
            /* Selection Mode Header */
            <div className="flex items-center justify-between mb-4 md:mb-6">
              {/* Left: Select All Checkbox */}
              <button
                onClick={selectAll}
                className="flex items-center gap-3"
              >
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${selectedFiles.length === filteredFiles.length && filteredFiles.length > 0 ? 'bg-white border-white' : 'border-white/70'}`}>
                  {selectedFiles.length === filteredFiles.length && filteredFiles.length > 0 && (
                    <Check className="w-5 h-5 text-black" />
                  )}
                </div>
                <span className="text-white/70 text-sm">ทั้งหมด</span>
              </button>

              {/* Center: Selection Count */}
              <h1 className="text-lg font-medium text-white">
                เลือก {selectedFiles.length} รายการแล้ว
              </h1>

              {/* Right: Cancel Button */}
              <button
                onClick={() => {
                  setIsSelectionMode(false);
                  setSelectedFiles([]);
                }}
                className="text-white font-medium px-2 py-1"
              >
                ยกเลิก
              </button>
            </div>
          ) : (
            /* Normal Mode Header */
            <div className="flex items-center justify-between mb-4 md:mb-6">
              {/* Left: Back Button */}
              <button
                onClick={() => {
                  if (activeFolder) {
                    // If in nested folder, go back one level
                    if (folderPath.length > 0) {
                      setFolderPath(prev => prev.slice(0, -1));
                    } else {
                      // Go back to main folder list
                      setActiveFolderId(null);
                      setFolderPath([]);
                    }
                  } else {
                    router.push("/home");
                  }
                }}
                className="p-2 md:p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
              >
                <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
              </button>

              {/* Center: Title (only when no folder selected) */}
              {!activeFolder && (
                <h1 className="hidden md:block text-lg font-semibold text-white/90">
                  อัลบั้มทั้งหมด
                </h1>
              )}

              {/* Right: Action Icons */}
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Upload/Add Button */}
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="p-2 md:p-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:scale-105"
                  title="อัพโหลดไฟล์"
                >
                  <Plus className="w-5 h-5 md:w-6 md:h-6" />
                </button>

                {/* Search Button */}
                <button
                  onClick={() => setShowHeaderSearch(!showHeaderSearch)}
                  className={`p-2 md:p-2.5 rounded-full transition-all ${showHeaderSearch ? 'bg-purple-500/30 text-purple-300' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                  title="ค้นหา"
                >
                  <Search className="w-5 h-5 md:w-6 md:h-6" />
                </button>

                {/* 3-Dot Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowHeaderMenu(!showHeaderMenu)}
                    className={`p-2 md:p-2.5 rounded-full transition-all ${showHeaderMenu ? 'bg-purple-500/30 text-purple-300' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                    title="เมนู"
                  >
                    <MoreVertical className="w-5 h-5 md:w-6 md:h-6" />
                  </button>

                  {/* Dropdown Menu */}
                  {showHeaderMenu && (
                    <>
                      {/* Backdrop to close menu */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowHeaderMenu(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 w-56 bg-slate-800/95 backdrop-blur-xl border border-purple-500/30 rounded-xl shadow-2xl overflow-hidden z-50 animate-slide-up">
                        {/* Create Folder Option */}
                        <button
                          onClick={() => {
                            setShowHeaderMenu(false);
                            if (activeFolder) {
                              setIsCreatingSubFolder(true);
                              setSubFolderDraftName("");
                            } else {
                              alert("กรุณาเลือกโฟลเดอร์หลักก่อนสร้างโฟลเดอร์ย่อย");
                            }
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left text-white/90 hover:bg-white/10 transition-colors"
                        >
                          <FolderPlus className="w-5 h-5 text-cyan-400" />
                          <span>สร้างโฟลเดอร์</span>
                        </button>

                        {/* Select All Option */}
                        <button
                          onClick={() => {
                            setShowHeaderMenu(false);
                            selectAll();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left text-white/90 hover:bg-white/10 transition-colors"
                        >
                          <Check className="w-5 h-5 text-purple-400" />
                          <span>{selectedFiles.length > 0 ? 'ยกเลิกการเลือก' : 'เลือกทั้งหมด'}</span>
                        </button>

                        {/* Distribute Files Randomly */}
                        <button
                          onClick={() => {
                            setShowHeaderMenu(false);
                            distributeFilesRandomly();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left text-white/90 hover:bg-white/10 transition-colors"
                        >
                          <RefreshCw className="w-5 h-5 text-amber-400" />
                          <span>สุ่มจัดเรียงไฟล์</span>
                        </button>

                        {/* Divider */}
                        <div className="border-t border-white/10 my-1" />

                        {/* View Mode Options */}
                        <div className="px-4 py-2">
                          <span className="text-xs text-purple-300/60 uppercase tracking-wider">มุมมอง</span>
                        </div>
                        <div className="flex items-center gap-1 px-4 pb-3">
                          {[
                            { mode: "grid" as const, icon: Grid, label: "Grid" },
                            { mode: "masonry" as const, icon: LayoutGrid, label: "Masonry" },
                            { mode: "list" as const, icon: List, label: "List" },
                          ].map(({ mode, icon: Icon, label }) => (
                            <button
                              key={mode}
                              onClick={() => {
                                setViewMode(mode);
                              }}
                              className={`flex-1 p-2 rounded-lg transition-all ${viewMode === mode
                                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                                : "bg-white/10 text-purple-300 hover:bg-white/20"
                                }`}
                              title={label}
                            >
                              <Icon className="w-4 h-4 mx-auto" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Desktop User Menu */}
                <div className="hidden md:block ml-2">
                  <UserMenu />
                </div>
              </div>
            </div>
          )}

          {/* Search Bar - Shows when search is active */}
          {showHeaderSearch && (
            <div className="mb-4 animate-slide-up space-y-3">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" />
                <input
                  type="text"
                  placeholder="ค้นหาไฟล์..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                  className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full bg-white/10 hover:bg-white/20 text-purple-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filter Pills Row */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {/* Type Filter Pills */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {[
                    { value: "all" as const, label: "ทั้งหมด", icon: FolderOpen },
                    { value: "image" as const, label: "รูป", icon: ImageIcon },
                    { value: "video" as const, label: "วิดีโอ", icon: FileVideo },
                    { value: "clip" as const, label: "คลิป", icon: Film },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setFilterType(value)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${filterType === value
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30"
                        : "bg-white/10 text-purple-300 hover:bg-white/20"
                        }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </button>
                  ))}
                </div>

                {/* Divider */}
                <div className="w-px h-6 bg-white/20 flex-shrink-0" />

                {/* Favorites Toggle */}
                <button
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${showFavoritesOnly
                    ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-pink-500/30"
                    : "bg-white/10 text-purple-300 hover:bg-white/20"
                    }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? "fill-current" : ""}`} />
                  โปรด
                </button>

                {/* Sort Dropdown */}
                <select
                  value={`${sortBy}-${sortDirection}`}
                  onChange={(e) => {
                    const [sort, dir] = e.target.value.split("-");
                    setSortBy(sort as any);
                    setSortDirection(dir as any);
                  }}
                  className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-purple-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer flex-shrink-0"
                >
                  <option value="date-desc" className="bg-slate-800">ล่าสุด</option>
                  <option value="date-asc" className="bg-slate-800">เก่าสุด</option>
                  <option value="name-asc" className="bg-slate-800">A-Z</option>
                  <option value="name-desc" className="bg-slate-800">Z-A</option>
                  <option value="views-desc" className="bg-slate-800">ยอดวิว</option>
                </select>
              </div>
            </div>
          )}

          {/* Folder Grid - Only show when no folder is selected */}
          {!activeFolder && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-5 mb-6 md:mb-8">
              {folders.map((folder, index) => {
                const Icon = folder.icon;
                const isActive = activeFolderId === folder.id;
                const fileCount = getFolderFileCount(folder);
                const subFolderCount = folder.subFolders.length;
                const isEditing = editingFolderId === folder.id;
                const isDragOver = dragOverFolderId === folder.id;

                return (
                  <div
                    key={folder.id}
                    onDragOver={(e) => handleDragOver(e, folder.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => void handleDropOnFolder(e, folder.id)}
                    className={`group relative glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 text-left transition-all duration-300 hover:scale-[1.03] border overflow-hidden animate-slide-up ${isActive
                      ? "border-purple-400/80 shadow-lg shadow-purple-500/30 ring-2 ring-purple-400/50"
                      : isDragOver
                        ? "border-emerald-400/80 shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400/50 scale-105"
                        : "border-white/10 hover:border-purple-300/50 hover:shadow-lg hover:shadow-purple-500/20"
                      }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Drop indicator overlay */}
                    {isDragOver && (
                      <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center z-30 rounded-2xl">
                        <div className="text-emerald-300 font-semibold text-sm flex items-center gap-2">
                          <Upload className="w-5 h-5" />
                          วางไฟล์ที่นี่
                        </div>
                      </div>
                    )}

                    {/* Glow effect on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${folder.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${isActive ? 'opacity-10' : ''}`} />

                    {isEditing ? (
                      <div className="relative z-10 flex flex-col gap-3 h-full">
                        <input
                          type="text"
                          value={editingFolderValue}
                          onChange={(e) => setEditingFolderValue(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveFolderName(folder.id)}
                            className="flex-1 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-medium shadow-lg hover:shadow-green-500/50 transition-all"
                          >
                            บันทึก
                          </button>
                          <button
                            onClick={handleCancelEditFolder}
                            className="flex-1 px-3 py-2 rounded-xl bg-white/10 text-purple-100 text-xs font-medium hover:bg-white/20 transition-all"
                          >
                            ยกเลิก
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="relative z-10 cursor-pointer"
                        onClick={() => handleFolderSelect(folder.id)}
                      >
                        <div
                          className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${folder.gradient} flex items-center justify-center mb-2 sm:mb-3 md:mb-4 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 ${isActive ? 'scale-110 shadow-xl' : ''}`}
                        >
                          <Icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white drop-shadow-md" />
                        </div>
                        <h3 className="folder-title font-bold text-white group-hover:text-purple-100 transition-colors text-sm sm:text-base">
                          {folder.name}
                        </h3>
                        <p className="folder-description text-purple-200/60 mt-0.5 sm:mt-1 line-clamp-2 text-xs sm:text-sm hidden sm:block">
                          {folder.description}
                        </p>
                        <div className="flex items-center justify-between folder-meta mt-2 sm:mt-3 md:mt-4 pt-2 sm:pt-3 border-t border-white/10 text-xs sm:text-sm">
                          <span className="flex items-center gap-1 sm:gap-1.5 text-purple-200/70">
                            <FolderOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            {subFolderCount}
                          </span>
                          <span className="flex items-center gap-1 sm:gap-1.5 text-purple-200/70">
                            <FileVideo className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            {fileCount}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Active indicator */}
                    {isActive && !isEditing && (
                      <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse shadow-lg shadow-purple-500/50" />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeFolder && (
            <div className="mb-6 md:mb-8 space-y-5">
              {/* Selected Folder Header Card */}
              <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-purple-400/50 shadow-lg shadow-purple-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* Back button */}
                    <button
                      onClick={() => {
                        setActiveFolderId(null);
                        setFolderPath([]);
                      }}
                      className="p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
                    >
                      <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>

                    {/* Folder icon and info */}
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${activeFolder.gradient} flex items-center justify-center shadow-lg`}>
                        {(() => {
                          const Icon = activeFolder.icon;
                          return <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />;
                        })()}
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold text-white">{activeFolder.name}</h2>
                        <p className="text-purple-200/60 text-sm hidden sm:block">{activeFolder.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Folder stats */}
                  <div className="flex items-center gap-3 sm:gap-4 text-sm text-purple-200/60">
                    <span className="flex items-center gap-1.5">
                      <FolderOpen className="w-4 h-4" />
                      {displayFolders.length}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FileVideo className="w-4 h-4" />
                      {currentNestedFolder?.fileIds.length || 0}
                    </span>
                  </div>
                </div>

                {/* Breadcrumb - show only if nested */}
                {breadcrumbItems.length > 1 && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10 flex-wrap">
                    {breadcrumbItems.map((item, index) => (
                      <div key={item.id} className="flex items-center gap-2">
                        {index > 0 && (
                          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-purple-300/50" />
                        )}
                        <button
                          onClick={() => handleBreadcrumbClick(index)}
                          className={`px-2 sm:px-3 py-1 rounded-lg text-sm transition-all ${index === breadcrumbItems.length - 1
                            ? "bg-purple-500/30 text-white font-medium"
                            : "text-purple-200/70 hover:text-white hover:bg-white/10"
                            }`}
                        >
                          {item.name}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons - Upload & Create Folder */}
              <div className="flex justify-end gap-2 sm:gap-3">
                {/* Upload Button */}
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl btn-text font-semibold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all duration-200"
                >
                  <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  อัพโหลด
                </button>

                {/* Create Folder Button */}
                <button
                  onClick={() => {
                    setIsCreatingSubFolder((prev) => !prev);
                    setSubFolderDraftName("");
                    setEditingSubFolderId(null);
                    setEditingSubFolderValue("");
                  }}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl btn-text font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-200"
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {isCreatingSubFolder ? "ยกเลิก" : "สร้างโฟลเดอร์"}
                </button>
              </div>

              {/* Create Folder Form */}
              {isCreatingSubFolder && (
                <div className="glass-card rounded-2xl p-5 border border-white/10 shadow-lg mb-4">
                  <div className="flex flex-col md:flex-row gap-3">
                    <input
                      type="text"
                      value={subFolderDraftName}
                      onChange={(e) => setSubFolderDraftName(e.target.value)}
                      placeholder="ตั้งชื่อโฟลเดอร์ใหม่"
                      className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    />
                    <button
                      onClick={handleCreateSubFolder}
                      className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-400 hover:to-emerald-500 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-200"
                    >
                      สร้าง
                    </button>
                  </div>
                </div>
              )}

              {/* Nested Folders Grid - 2 columns like screenshot */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-5">
                {displayFolders.map((subFolder, index) => {
                  const isEditing = editingSubFolderId === subFolder.id;
                  const hasChildren = subFolder.children.length > 0;
                  const isLeaf = isLeafFolder(subFolder);
                  const subFolderCount = subFolder.children.length;
                  const fileCount = subFolder.fileIds.length;

                  return (
                    <div
                      key={subFolder.id}
                      onClick={() => {
                        if (!isEditing) {
                          handleNestedFolderSelect(subFolder.id);
                        }
                      }}
                      className={`group relative glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 text-left transition-all duration-300 hover:scale-[1.03] border overflow-hidden animate-slide-up cursor-pointer border-white/10 hover:border-purple-300/50 hover:shadow-lg hover:shadow-purple-500/20`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {/* Glow effect on hover */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${activeFolder.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                      {isEditing ? (
                        <div className="relative z-10 flex flex-col gap-3 h-full">
                          <input
                            type="text"
                            value={editingSubFolderValue}
                            onChange={(e) => setEditingSubFolderValue(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                handleSaveSubFolderName(subFolder.id);
                              }}
                              className="flex-1 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-medium shadow-lg hover:shadow-green-500/50 transition-all"
                            >
                              บันทึก
                            </button>
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                handleCancelEditSubFolder();
                              }}
                              className="flex-1 px-3 py-2 rounded-xl bg-white/10 text-purple-100 text-xs font-medium hover:bg-white/20 transition-all"
                            >
                              ยกเลิก
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative z-10 cursor-pointer">
                          <div
                            className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${activeFolder.gradient} flex items-center justify-center mb-2 sm:mb-3 md:mb-4 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}
                          >
                            <FolderOpen className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white drop-shadow-md" />
                          </div>
                          <h3 className="folder-title font-bold text-white group-hover:text-purple-100 transition-colors text-sm sm:text-base">
                            {subFolder.name}
                          </h3>
                          <p className="folder-description text-purple-200/60 mt-0.5 sm:mt-1 line-clamp-2 text-xs sm:text-sm hidden sm:block">
                            {isLeaf ? `${fileCount} ไฟล์` : `${subFolderCount} โฟลเดอร์`}
                          </p>
                          <div className="flex items-center justify-between folder-meta mt-2 sm:mt-3 md:mt-4 pt-2 sm:pt-3 border-t border-white/10 text-xs sm:text-sm">
                            <span className="flex items-center gap-1 sm:gap-1.5 text-purple-200/70">
                              <FolderOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              {subFolderCount}
                            </span>
                            <span className="flex items-center gap-1 sm:gap-1.5 text-purple-200/70">
                              <FileVideo className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              {fileCount}
                            </span>
                          </div>
                          {/* Action buttons on hover */}
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                handleStartEditSubFolder(subFolder);
                              }}
                              className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-all"
                              title="แก้ไขชื่อ"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                handleDeleteSubFolder(subFolder.id);
                              }}
                              className="p-1.5 rounded-lg bg-white/20 text-red-300 hover:bg-red-500/30 transition-all"
                              title="ลบโฟลเดอร์"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Leaf indicator */}
                      {isLeaf && !isEditing && (
                        <div className="absolute bottom-2 right-2 w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gradient-to-r from-emerald-400 to-green-400 shadow-lg shadow-emerald-500/50" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Control Bar - Desktop Only */}
          <div className="hidden md:block glass-card rounded-2xl p-3 md:p-4 mb-6 relative z-30">
            {/* Desktop Controls */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="flex-1 min-w-[250px] relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" />
                <input
                  type="text"
                  placeholder="ค้นหาไฟล์, แท็ก, หมวดหมู่..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 p-1 bg-white/10 rounded-xl">
                {[
                  { mode: "grid" as const, icon: Grid, label: "Grid" },
                  {
                    mode: "masonry" as const,
                    icon: LayoutGrid,
                    label: "Masonry",
                  },
                  { mode: "list" as const, icon: List, label: "List" },
                ].map(({ mode, icon: Icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`p-2.5 rounded-lg transition-all ${viewMode === mode
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                      : "text-purple-300 hover:bg-white/10"
                      }`}
                    title={label}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                ))}
              </div>

              {/* Type Filter */}
              <div className="relative">
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-xl transition-all shadow-lg hover:shadow-purple-500/30"
                >
                  <Filter className="w-4 h-4" />
                  <span className="font-medium">
                    {filterType === "all"
                      ? "ทุกประเภท"
                      : filterType === "image"
                        ? "รูปภาพ"
                        : filterType === "video"
                          ? "วิดีโอ"
                          : "คลิป"}
                  </span>
                </button>
                {showFilterMenu && (
                  <div className="absolute top-full mt-2 right-0 w-48 bg-slate-800/95 backdrop-blur-xl border border-purple-500/30 rounded-xl shadow-2xl overflow-hidden z-50">
                    {[
                      {
                        value: "all" as const,
                        label: "ทุกประเภท",
                        icon: FolderOpen,
                      },
                      {
                        value: "image" as const,
                        label: "รูปภาพ",
                        icon: ImageIcon,
                      },
                      {
                        value: "video" as const,
                        label: "วิดีโอ",
                        icon: FileVideo,
                      },
                      { value: "clip" as const, label: "คลิป", icon: Film },
                    ].map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => {
                          setFilterType(value);
                          setShowFilterMenu(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${filterType === value
                          ? "bg-purple-500/30 text-purple-300"
                          : "text-white/80 hover:bg-white/10"
                          }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{label}</span>
                        {filterType === value && (
                          <Check className="w-4 h-4 ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                {categories.map((cat) => (
                  <option
                    key={cat}
                    value={cat}
                    className="bg-slate-800 text-white"
                  >
                    {cat === "all" ? "ทุกหมวดหมู่" : cat}
                  </option>
                ))}
              </select>

              {/* Favorites Toggle */}
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${showFavoritesOnly
                  ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-pink-500/30"
                  : "bg-white/10 text-purple-300 hover:bg-white/20"
                  }`}
              >
                <Heart
                  className={`w-4 h-4 ${showFavoritesOnly ? "fill-current" : ""
                    }`}
                />
                <span className="font-medium">รายการโปรด</span>
              </button>

              {/* Sort */}
              <select
                value={`${sortBy}-${sortDirection}`}
                onChange={(e) => {
                  const [sort, dir] = e.target.value.split("-");
                  setSortBy(sort as any);
                  setSortDirection(dir as any);
                }}
                className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                <option value="date-desc" className="bg-slate-800">
                  วันที่ล่าสุด
                </option>
                <option value="date-asc" className="bg-slate-800">
                  วันที่เก่าสุด
                </option>
                <option value="name-asc" className="bg-slate-800">
                  ชื่อ A-Z
                </option>
                <option value="name-desc" className="bg-slate-800">
                  ชื่อ Z-A
                </option>
                <option value="views-desc" className="bg-slate-800">
                  ยอดวิวมากสุด
                </option>
                <option value="views-asc" className="bg-slate-800">
                  ยอดวิวน้อยสุด
                </option>
              </select>

              {/* Action Buttons */}
              <button
                onClick={selectAll}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-purple-300 rounded-xl transition-all"
              >
                <Check className="w-4 h-4" />
                <span className="font-medium">
                  {selectedFiles.length === filteredFiles.length
                    ? "ยกเลิกทั้งหมด"
                    : "เลือกทั้งหมด"}
                </span>
              </button>

              {selectedFiles.length > 0 && (
                <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-xl transition-all shadow-lg">
                  <Download className="w-4 h-4" />
                  <span className="font-medium">
                    ดาวน์โหลด ({selectedFiles.length})
                  </span>
                </button>
              )}

              {/* Distribute Files Randomly Button */}
              <button
                onClick={distributeFilesRandomly}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white rounded-xl transition-all shadow-lg"
                title="กระจายไฟล์ไปยังโฟลเดอร์แบบสุ่ม"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="font-medium">สุ่มไฟล์</span>
              </button>
            </div>

          </div>

          {/* Mobile Upload Modal - Enhanced for Android & iPhone */}
          {showUploadModal && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center">
              <div
                className="w-full max-w-lg bg-gradient-to-b from-slate-800 to-slate-900 rounded-t-[2rem] sm:rounded-3xl overflow-hidden shadow-2xl animate-slide-up sm:animate-bounce-in sm:mx-4"
                style={{ maxHeight: '90vh' }}
              >
                {/* Header with gradient */}
                <div className="relative bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 p-5 sm:p-6">
                  {/* Close button */}
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 active:scale-95 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* Title */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white">อัพโหลดไฟล์</h3>
                      <p className="text-white/70 text-sm">เลือกวิธีการอัพโหลด</p>
                    </div>
                  </div>

                  {/* Drag indicator for mobile sheet */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-white/30 sm:hidden" />
                </div>

                {/* Hidden file inputs - Enhanced for mobile */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*,.jpg,.jpeg,.png,.gif,.webp,.mp4,.mov,.avi,.webm"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {/* Video capture input for mobile */}
                <input
                  id="videoCaptureInput"
                  type="file"
                  accept="video/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Upload options content */}
                <div className="p-4 sm:p-6 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>

                  {/* Upload options - Large touch targets */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {/* Gallery / Files */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="group flex flex-col items-center gap-3 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/20 hover:border-purple-400/50 hover:from-purple-500/20 hover:to-pink-500/20 active:scale-[0.98] transition-all duration-200"
                    >
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 group-hover:scale-105 transition-all">
                        <ImageIcon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                      </div>
                      <div className="text-center">
                        <p className="text-white font-semibold text-base sm:text-lg">แกลเลอรี่</p>
                        <p className="text-xs sm:text-sm text-purple-200/60 mt-0.5">เลือกรูป/วิดีโอ</p>
                      </div>
                    </button>

                    {/* Browse Files */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="group flex flex-col items-center gap-3 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-2 border-emerald-500/20 hover:border-emerald-400/50 hover:from-emerald-500/20 hover:to-teal-500/20 active:scale-[0.98] transition-all duration-200"
                    >
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/50 group-hover:scale-105 transition-all">
                        <FolderOpen className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                      </div>
                      <div className="text-center">
                        <p className="text-white font-semibold text-base sm:text-lg">ไฟล์อื่นๆ</p>
                        <p className="text-xs sm:text-sm text-emerald-200/60 mt-0.5">เลือกจากโฟลเดอร์</p>
                      </div>
                    </button>
                  </div>

                  {/* Drag & Drop area - Desktop only */}
                  <div className="hidden sm:block">
                    <div
                      className="relative p-6 border-2 border-dashed border-purple-500/30 rounded-2xl bg-purple-500/5 hover:border-purple-400/50 hover:bg-purple-500/10 transition-all cursor-pointer group"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="flex flex-col items-center gap-3 text-center">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Upload className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-purple-200 font-medium">ลากไฟล์มาวางที่นี่</p>
                          <p className="text-purple-300/50 text-sm mt-1">หรือคลิกเพื่อเลือกไฟล์</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Supported formats info */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <span className="text-purple-300/50 text-xs">รองรับ:</span>
                    <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs">JPG</span>
                    <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs">PNG</span>
                    <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs">GIF</span>
                    <span className="px-2 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs">MP4</span>
                    <span className="px-2 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs">MOV</span>
                  </div>

                  {/* Current folder indicator */}
                  {(currentNestedFolder || activeFolder) && (
                    <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <FolderOpen className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300 text-sm">
                        อัพโหลดไปที่: <span className="font-medium">{currentNestedFolder?.name || activeFolder?.name}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom safe area for mobile */}
                <div className="h-6 sm:h-4 bg-slate-900" />
              </div>
            </div>
          )}

          {/* Confirmation Modal */}
          {confirmModal.isOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={() => {
                  if (confirmModal.onCancel) {
                    confirmModal.onCancel();
                  }
                  closeConfirmModal();
                }}
              />

              {/* Modal Content */}
              <div className="relative w-full max-w-md transform transition-all animate-bounce-in">
                <div className="glass-card rounded-2xl sm:rounded-3xl overflow-hidden border border-white/20 shadow-2xl">
                  {/* Header with icon */}
                  <div className={`p-6 sm:p-8 text-center ${confirmModal.type === 'delete'
                    ? 'bg-gradient-to-br from-red-500/20 to-pink-500/20'
                    : confirmModal.type === 'warning'
                      ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20'
                      : 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20'
                    }`}>
                    {/* Icon */}
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${confirmModal.type === 'delete'
                      ? 'bg-gradient-to-br from-red-500 to-pink-600 shadow-lg shadow-red-500/40'
                      : confirmModal.type === 'warning'
                        ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/40'
                        : 'bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/40'
                      }`}>
                      {confirmModal.type === 'delete' ? (
                        <Trash2 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                      ) : confirmModal.type === 'warning' ? (
                        <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                      ) : (
                        <Info className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-responsive-xl sm:text-2xl font-bold text-white mb-2">
                      {confirmModal.title}
                    </h3>

                    {/* Message */}
                    <p className="text-responsive-sm sm:text-base text-purple-200/80">
                      {confirmModal.message}
                    </p>

                    {/* Item name if provided */}
                    {confirmModal.itemName && (
                      <div className="mt-4 px-4 py-3 bg-white/10 rounded-xl border border-white/10">
                        <p className="text-responsive-sm text-purple-300/60 mb-1">ชื่อไฟล์:</p>
                        <p className="text-responsive-base text-white font-medium truncate">
                          {confirmModal.itemName}
                        </p>
                      </div>
                    )}

                    {/* Warning note for delete */}
                    {confirmModal.type === 'delete' && (
                      <div className="mt-4 flex items-center justify-center gap-2 text-red-300/80">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-responsive-xs sm:text-sm">การดำเนินการนี้ไม่สามารถย้อนกลับได้</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4 sm:p-6 bg-slate-900/50 flex flex-col-reverse sm:flex-row gap-3">
                    {confirmModal.cancelText && (
                      <button
                        onClick={() => {
                          if (confirmModal.onCancel) {
                            confirmModal.onCancel();
                          }
                          closeConfirmModal();
                        }}
                        className="flex-1 px-6 py-3 sm:py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all duration-200 btn-text border border-white/10"
                      >
                        {confirmModal.cancelText}
                      </button>
                    )}
                    <button
                      onClick={() => confirmModal.onConfirm()}
                      className={`flex-1 px-6 py-3 sm:py-3.5 rounded-xl font-medium transition-all duration-200 btn-text shadow-lg ${confirmModal.type === 'delete'
                        ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-400 hover:to-pink-500 text-white shadow-red-500/30 hover:shadow-red-500/50'
                        : confirmModal.type === 'warning'
                          ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-amber-500/30 hover:shadow-amber-500/50'
                          : 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white shadow-blue-500/30 hover:shadow-blue-500/50'
                        }`}
                    >
                      {confirmModal.confirmText || 'ยืนยัน'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Share Modal */}
          {showShareModal && shareFileId && (
            <div className="fixed inset-0 z-50 bg-black/80 flex items-end md:items-center justify-center p-4">
              <div className="w-full max-w-md bg-slate-900 rounded-t-3xl md:rounded-3xl p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-responsive-xl font-bold text-white">แชร์ไฟล์</h3>
                  <button
                    onClick={() => {
                      setShowShareModal(false);
                      setShareFileId(null);
                    }}
                    className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  {/* LINE Share */}
                  <button
                    onClick={() => shareFile(shareFileId, 'line')}
                    className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl line-share-btn transition-all"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white flex items-center justify-center">
                      <Send className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                    </div>
                    <span className="text-white text-responsive-sm font-medium">LINE</span>
                  </button>

                  {/* Copy Link */}
                  <button
                    onClick={() => shareFile(shareFileId, 'copy')}
                    className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-500 flex items-center justify-center">
                      <Copy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <span className="text-white text-responsive-sm font-medium">คัดลอก</span>
                  </button>

                  {/* Native Share */}
                  {'share' in navigator && (
                    <button
                      onClick={() => shareFile(shareFileId, 'native')}
                      className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
                    >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-500 flex items-center justify-center">
                        <Share2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <span className="text-white text-responsive-sm font-medium">อื่นๆ</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Files Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent" />
            </div>
          ) : filteredFiles.length === 0 ? (
            null
          ) : viewMode === "list" ? (
            // List View
            <div className="glass-card rounded-2xl overflow-hidden overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-purple-500/20 border-b border-purple-500/30">
                    <th className="p-4 text-left text-purple-300 font-semibold">
                      <input
                        type="checkbox"
                        checked={
                          selectedFiles.length === filteredFiles.length &&
                          filteredFiles.length > 0
                        }
                        onChange={selectAll}
                        className="w-4 h-4 rounded cursor-pointer"
                      />
                    </th>
                    <th className="p-4 text-left text-purple-300 font-semibold">
                      Preview
                    </th>
                    <th className="p-4 text-left text-purple-300 font-semibold">
                      ชื่อไฟล์
                    </th>
                    <th className="p-4 text-left text-purple-300 font-semibold">
                      ประเภท
                    </th>
                    <th className="p-4 text-left text-purple-300 font-semibold">
                      หมวดหมู่
                    </th>
                    <th className="p-4 text-left text-purple-300 font-semibold">
                      ขนาด
                    </th>
                    <th className="p-4 text-left text-purple-300 font-semibold">
                      ยอดวิว
                    </th>
                    <th className="p-4 text-left text-purple-300 font-semibold">
                      วันที่
                    </th>
                    <th className="p-4 text-left text-purple-300 font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFiles.map((file, index) => (
                    <tr
                      key={file.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, file.id)}
                      onDragEnd={handleDragEnd}
                      className={`border-b border-purple-500/10 hover:bg-white/5 transition-colors group file-item cursor-grab active:cursor-grabbing ${draggingFileId === file.id ? "opacity-50" : ""}`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(file.id)}
                          onChange={() => toggleSelect(file.id)}
                          className="w-4 h-4 rounded cursor-pointer"
                        />
                      </td>
                      <td className="p-4">
                        <div
                          className="relative w-16 h-12 rounded-lg overflow-hidden cursor-pointer hover:scale-110 transition-transform"
                          onClick={() => openLightbox(index)}
                        >
                          <ThumbnailImage
                            file={file}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                          {(file.type === "video" || file.type === "clip") && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                              <Play className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-white">
                          {file.name}
                        </div>
                        <div className="flex gap-1 mt-1">
                          {file.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${getTypeColor(
                            file.type
                          )} text-white text-sm font-medium`}
                        >
                          {getTypeIcon(file.type)}
                          <span className="capitalize">{file.type}</span>
                        </div>
                      </td>
                      <td className="p-4 text-purple-200/80">
                        {file.category}
                      </td>
                      <td className="p-4 text-purple-200/80">{file.size}</td>
                      <td className="p-4 text-purple-200/80">
                        {formatNumber(file.views)}
                      </td>
                      <td className="p-4 text-purple-200/80">{file.date}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 file-actions">
                          <button
                            onClick={() => toggleFavorite(file.id)}
                            className={`p-2 rounded-lg transition-colors ${file.favorite
                              ? "bg-pink-500/20 text-pink-400"
                              : "bg-white/10 text-purple-300 hover:bg-white/20"
                              }`}
                          >
                            <Heart
                              className={`w-4 h-4 ${file.favorite ? "fill-current" : ""
                                }`}
                            />
                          </button>
                          <button
                            onClick={() => handleDownloadFile(file.id)}
                            className="p-2 rounded-lg bg-white/10 text-purple-300 hover:bg-white/20 transition-colors"
                            title="ดาวน์โหลด"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button className="p-2 rounded-lg bg-white/10 text-purple-300 hover:bg-white/20 transition-colors">
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // Grid View - Samsung Gallery Style (4 columns)
            <div className="grid grid-cols-4 gap-0.5">
              {filteredFiles.map((file, index) => (
                <div
                  key={file.id}
                  className={`relative aspect-square overflow-hidden cursor-pointer ${selectedFiles.includes(file.id) ? 'ring-2 ring-white ring-inset' : ''}`}
                  onClick={() => {
                    if (isSelectionMode) {
                      toggleSelect(file.id);
                    } else {
                      openLightbox(index);
                    }
                  }}
                  onTouchStart={() => {
                    longPressTimerRef.current = setTimeout(() => {
                      setIsSelectionMode(true);
                      if (!selectedFiles.includes(file.id)) {
                        toggleSelect(file.id);
                      }
                    }, 500);
                  }}
                  onTouchEnd={() => {
                    if (longPressTimerRef.current) {
                      clearTimeout(longPressTimerRef.current);
                      longPressTimerRef.current = null;
                    }
                  }}
                  onTouchMove={() => {
                    if (longPressTimerRef.current) {
                      clearTimeout(longPressTimerRef.current);
                      longPressTimerRef.current = null;
                    }
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setIsSelectionMode(true);
                    if (!selectedFiles.includes(file.id)) {
                      toggleSelect(file.id);
                    }
                  }}
                >
                  {/* Image */}
                  <img
                    src={file.thumbnail}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Image/Video Container */}
                  <div
                    className="relative aspect-[4/3] overflow-hidden cursor-pointer"
                    onClick={() => openLightbox(index)}
                  >
                    <ThumbnailImage
                      file={file}
                      alt={file.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Type Badge */}
                    <div
                      className={`absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r ${getTypeColor(
                        file.type
                      )} text-white text-xs font-semibold shadow-lg`}
                    >
                      {getTypeIcon(file.type)}
                      <span className="uppercase">{file.type}</span>
                    </div>

                    {/* Duration for videos/clips */}
                    {file.duration && (
                      <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 rounded-md text-white text-xs font-medium">
                        {file.duration}
                      </div>
                    )}

                    {/* Play Icon for videos */}
                    {(file.type === "video" || file.type === "clip") && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="p-4 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors">
                          <Play className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    )}

                    {/* Favorite Badge */}
                    {file.favorite && (
                      <div className="absolute top-3 right-3">
                        <Heart className="w-5 h-5 text-pink-500 fill-current drop-shadow-lg" />
                      </div>
                    )}

                    {/* Selection Checkbox - Only visible in selection mode */}
                    {isSelectionMode && (
                      <div className="absolute top-2 left-2">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedFiles.includes(file.id)
                            ? 'bg-white border-white'
                            : 'border-white/70 bg-black/30'
                            }`}
                        >
                          {selectedFiles.includes(file.id) && (
                            <Check className="w-4 h-4 text-black" />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Duration for videos */}
                    {file.duration && (
                      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 rounded text-white text-xs font-medium">
                        {file.duration}
                      </div>
                    )}

                    {/* Play Icon for videos */}
                    {(file.type === "video" || file.type === "clip") && !file.duration && (
                      <div className="absolute bottom-1 right-1">
                        <Play className="w-4 h-4 text-white drop-shadow-lg" fill="white" />
                      </div>
                    )}

                    {/* Share icon bottom right */}
                    {!isSelectionMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShareFileId(file.id);
                          setShowShareModal(true);
                        }}
                        className="absolute bottom-1 right-1 p-1 text-white/80 hover:text-white"
                      >
                        <Share2 className="w-4 h-4 drop-shadow-lg" />
                      </button>
                    )}
                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 sm:gap-2 pt-1.5 sm:pt-2 file-actions">
                      {/* Share Button (was Save) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShareFileId(file.id);
                          setShowShareModal(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all mobile-touch-target bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-400 hover:to-emerald-400"
                      >
                        <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="btn-text font-medium hidden sm:inline">
                          Share
                        </span>
                      </button>
                      {/* Download Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadFile(file.id);
                        }}
                        className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-400 hover:to-cyan-400 transition-colors mobile-touch-target"
                        title="ดาวน์โหลด"
                      >
                        <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      {/* Delete Button (was Share/LINE) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFile(file.id);
                        }}
                        className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-white/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors mobile-touch-target"
                        title="ลบไฟล์"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Lightbox Modal */}
          {showLightbox && filteredFiles[lightboxIndex] && (
            <div
              className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
              onClick={() => setShowLightbox(false)}
            >
              <div
                className="relative w-full h-full flex items-center justify-center p-4"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setShowLightbox(false)}
                  className="absolute top-4 right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-50"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Download Button in Lightbox */}
                <button
                  onClick={() => handleDownloadFile(filteredFiles[lightboxIndex].id)}
                  className="absolute top-4 right-20 p-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-400 hover:to-cyan-400 transition-colors z-50"
                  title="ดาวน์โหลด"
                >
                  <Download className="w-6 h-6" />
                </button>

                {/* Navigation */}
                <button
                  onClick={() =>
                    setLightboxIndex((prev) =>
                      prev > 0 ? prev - 1 : filteredFiles.length - 1
                    )
                  }
                  className="absolute left-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-50"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={() =>
                    setLightboxIndex((prev) =>
                      prev < filteredFiles.length - 1 ? prev + 1 : 0
                    )
                  }
                  className="absolute right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-50"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>

                {/* Main Content */}
                <div className="max-w-6xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl">
                  {(filteredFiles[lightboxIndex].type === 'video' || filteredFiles[lightboxIndex].type === 'clip') ? (
                    <video
                      src={filteredFiles[lightboxIndex].url}
                      poster={filteredFiles[lightboxIndex].thumbnail !== VIDEO_PLACEHOLDER ? filteredFiles[lightboxIndex].thumbnail : undefined}
                      controls
                      autoPlay
                      className="max-w-full max-h-[85vh] object-contain"
                    />
                  ) : (
                    <img
                      src={filteredFiles[lightboxIndex].thumbnail}
                      alt={filteredFiles[lightboxIndex].name}
                      className="max-w-full max-h-[85vh] object-contain"
                    />
                  )}
                </div>

                {/* Info Bar */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                  <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {filteredFiles[lightboxIndex].name}
                    </h2>
                    <div className="flex items-center gap-4 text-white/70">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {filteredFiles[lightboxIndex].date}
                      </span>
                      <span className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4" />
                        {filteredFiles[lightboxIndex].size}
                      </span>
                      <span className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        {formatNumber(filteredFiles[lightboxIndex].views)} views
                      </span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      {filteredFiles[lightboxIndex].tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-white/20 rounded-full text-white text-sm"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Counter */}
                <div className="absolute top-4 left-4 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white font-medium">
                  {lightboxIndex + 1} / {filteredFiles.length}
                </div>
              </div>
            </div>
          )}

          {/* Selection Mode Bottom Action Bar - Samsung Gallery Style */}
          {isSelectionMode && (
            <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 z-50">
              <div className="flex items-center justify-around py-3 px-4">
                {/* Create/Add */}
                <button
                  onClick={() => {
                    // Add to folder functionality
                    if (selectedFiles.length > 0) {
                      alert(`เพิ่ม ${selectedFiles.length} รายการไปยังอัลบั้ม`);
                    }
                  }}
                  className="flex flex-col items-center gap-1 px-4 py-2"
                >
                  <FolderPlus className="w-6 h-6 text-white" />
                  <span className="text-white text-xs">สร้าง</span>
                </button>

                {/* Share */}
                <button
                  onClick={() => {
                    if (selectedFiles.length > 0) {
                      setShareFileId(selectedFiles[0]);
                      setShowShareModal(true);
                    }
                  }}
                  className="flex flex-col items-center gap-1 px-4 py-2"
                >
                  <Share2 className="w-6 h-6 text-white" />
                  <span className="text-white text-xs">แชร์</span>
                </button>

                {/* Delete */}
                <button
                  onClick={() => {
                    if (selectedFiles.length > 0) {
                      setConfirmModal({
                        isOpen: true,
                        type: 'delete',
                        title: 'ลบไฟล์ที่เลือก',
                        message: `คุณต้องการลบ ${selectedFiles.length} ไฟล์ที่เลือกหรือไม่?`,
                        onConfirm: () => {
                          selectedFiles.forEach(id => handleDeleteFile(id));
                          setSelectedFiles([]);
                          setIsSelectionMode(false);
                          setConfirmModal(prev => ({ ...prev, isOpen: false }));
                        },
                        confirmText: 'ลบ',
                        cancelText: 'ยกเลิก',
                      });
                    }
                  }}
                  className="flex flex-col items-center gap-1 px-4 py-2"
                >
                  <Trash2 className="w-6 h-6 text-white" />
                  <span className="text-white text-xs">ลบ</span>
                </button>

                {/* More Options */}
                <button
                  onClick={() => {
                    // More options menu
                    setShowHeaderMenu(true);
                  }}
                  className="flex flex-col items-center gap-1 px-4 py-2"
                >
                  <MoreVertical className="w-6 h-6 text-white" />
                  <span className="text-white text-xs">เพิ่มเติม</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* File Progress Container - Upload/Download animations */}
        <FileProgressContainer
          items={progressItems}
          onCancel={cancelTransfer}
          onDismiss={dismissItem}
          onClearAll={clearCompleted}
          position="bottom-right"
        />
      </div>
    </>
  );
};

export default AllFilesGalleryPage;
