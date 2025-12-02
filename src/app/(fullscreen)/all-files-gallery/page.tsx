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
  ArrowRight,
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
  const [showLineSendModal, setShowLineSendModal] = useState(false);
  const [lineSendUserId, setLineSendUserId] = useState("");
  const [lineSendStatus, setLineSendStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [lineSendError, setLineSendError] = useState("");
  // LINE Groups management
  const [lineGroups, setLineGroups] = useState<Array<{ id: string; name: string }>>([]);
  const [showLineGroupModal, setShowLineGroupModal] = useState(false);
  const [newGroupId, setNewGroupId] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedLineGroup, setSelectedLineGroup] = useState<string | null>(null);
  const [isGlobalDropActive, setIsGlobalDropActive] = useState(false);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [showHeaderSearch, setShowHeaderSearch] = useState(false);
  const [folderActionSheet, setFolderActionSheet] = useState<{
    isOpen: boolean;
    folderId: string | null;
    folderName: string;
  }>({ isOpen: false, folderId: null, folderName: '' });
  const [fileActionSheet, setFileActionSheet] = useState<{
    isOpen: boolean;
    fileId: number | null;
    fileName: string;
    fileIndex: number;
  }>({ isOpen: false, fileId: null, fileName: '', fileIndex: -1 });
  const [isFileSelectionMode, setIsFileSelectionMode] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileLongPressRef = useRef<NodeJS.Timeout | null>(null);

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

  // Load LINE groups from localStorage on mount
  useEffect(() => {
    const savedGroups = localStorage.getItem('lineGroups');
    if (savedGroups) {
      try {
        const parsed = JSON.parse(savedGroups);
        setLineGroups(parsed);
        // Set first group as default if exists
        if (parsed.length > 0) {
          setSelectedLineGroup(parsed[0].id);
        }
      } catch (e) {
        console.error('Error parsing LINE groups:', e);
      }
    } else {
      // Add default group (กล่องแชท AI)
      const defaultGroups = [{ id: "C31a793e94485a393a7eb55cb36e6ecfd", name: "กล่องแชท AI" }];
      setLineGroups(defaultGroups);
      setSelectedLineGroup(defaultGroups[0].id);
      localStorage.setItem('lineGroups', JSON.stringify(defaultGroups));
    }
  }, []);

  // Save LINE groups to localStorage when changed
  const saveLineGroups = (groups: Array<{ id: string; name: string }>) => {
    setLineGroups(groups);
    localStorage.setItem('lineGroups', JSON.stringify(groups));
  };

  // Add new LINE group
  const addLineGroup = () => {
    if (!newGroupId.trim() || !newGroupName.trim()) return;
    const newGroups = [...lineGroups, { id: newGroupId.trim(), name: newGroupName.trim() }];
    saveLineGroups(newGroups);
    setNewGroupId("");
    setNewGroupName("");
    setSelectedLineGroup(newGroupId.trim());
  };

  // Remove LINE group
  const removeLineGroup = (groupId: string) => {
    const newGroups = lineGroups.filter(g => g.id !== groupId);
    saveLineGroups(newGroups);
    if (selectedLineGroup === groupId && newGroups.length > 0) {
      setSelectedLineGroup(newGroups[0].id);
    }
  };

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

  // Handle hardware back button (popstate) for mobile
  useEffect(() => {
    // Push initial state when entering a folder
    if (activeFolderId) {
      window.history.pushState({ folderId: activeFolderId, path: folderPath }, '');
    }

    const handlePopState = (event: PopStateEvent) => {
      // Close any open modals first
      if (showLightbox) {
        setShowLightbox(false);
        window.history.pushState({ folderId: activeFolderId, path: folderPath }, '');
        return;
      }
      if (showShareModal) {
        setShowShareModal(false);
        setShareFileId(null);
        window.history.pushState({ folderId: activeFolderId, path: folderPath }, '');
        return;
      }
      if (isFileSelectionMode) {
        setIsFileSelectionMode(false);
        setSelectedFiles([]);
        window.history.pushState({ folderId: activeFolderId, path: folderPath }, '');
        return;
      }

      // Navigate back through folders
      if (activeFolderId) {
        if (folderPath.length > 0) {
          // Go back one level in nested folders
          setFolderPath(prev => prev.slice(0, -1));
          window.history.pushState({ folderId: activeFolderId, path: folderPath.slice(0, -1) }, '');
        } else {
          // Go back to main folder list
          setActiveFolderId(null);
          setFolderPath([]);
        }
      } else {
        // At root level, go back to home
        router.push('/home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeFolderId, folderPath, showLightbox, showShareModal, isFileSelectionMode, router]);

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

  const downloadShareBlob = async (url: string) => {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to download file for sharing");
    }
    return await response.blob();
  };

  const getAbsoluteMediaUrl = (file: FileItem) => {
    if (file.url.startsWith("http")) {
      return file.url;
    }
    if (typeof window === "undefined") {
      return file.url;
    }
    return `${window.location.origin}${file.url}`;
  };

  const guessShareMimeType = (url: string, type: FileItem['type']) => {
    const extension = url
      .split("?")[0]
      .split("/")
      .pop()
      ?.split(".")
      .pop()
      ?.toLowerCase();
    const map: Record<string, string> = {
      mp4: "video/mp4",
      mov: "video/quicktime",
      webm: "video/webm",
      mkv: "video/x-matroska",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      bmp: "image/bmp",
      heic: "image/heic",
      heif: "image/heif",
    };

    if (extension && map[extension]) {
      return map[extension];
    }

    if (type === "image") return "image/jpeg";
    if (type === "video" || type === "clip") return "video/mp4";
    return "application/octet-stream";
  };

  const resolveShareFileName = (file: FileItem, url: string) => {
    if (file.name.includes(".")) {
      return file.name;
    }
    const extension = url
      .split("?")[0]
      .split("/")
      .pop()
      ?.split(".")
      .pop();
    return extension ? `${file.name}.${extension}` : file.name;
  };

  // Share to LINE handler with video support
  const shareToLine = async (file: FileItem) => {
    if (typeof window === "undefined") return;

    let shareUrl: string;
    if (file.type === 'video' || file.type === 'clip') {
      const result = await generateVideoShareUrl(file);
      shareUrl = result.shareUrl;

      if (result.needsTranscoding) {
        console.log(`Video ${file.name} (${result.fileSizeMB}MB) may need transcoding for optimal LINE playback`);
        transcodeForLine(file).then(success => {
          if (success) {
            console.log('Transcoding completed for:', file.name);
          }
        });
      }
    } else {
      shareUrl = window.location.href;
    }

    const shareMessage = `📹 ${file.name} - BJH Bangkok`;
    const encodedShareText = encodeURIComponent(shareMessage);
    const encodedUrl = encodeURIComponent(shareUrl);

    let sharedViaWebShare = false;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        const absoluteUrl = getAbsoluteMediaUrl(file);
        const blob = await downloadShareBlob(absoluteUrl);
        const shareFile = new File([blob], resolveShareFileName(file, absoluteUrl), {
          type: guessShareMimeType(absoluteUrl, file.type),
        });
        const canShareFiles =
          !('canShare' in navigator) || navigator.canShare({ files: [shareFile] });

        if (canShareFiles) {
          await navigator.share({
            title: file.name,
            files: [shareFile],
          });
          sharedViaWebShare = true;
        }
      } catch (error) {
        console.warn('Web Share failed, falling back to LINE deep link', error);
      }
    }

    if (!sharedViaWebShare) {
      if (isMobile) {
        window.location.href = `line://msg/text/${encodedShareText}%0A${encodedUrl}`;
      } else {
        window.open(`https://social-plugins.line.me/lineit/share?url=${encodedUrl}&text=${encodedShareText}`, '_blank', 'width=500,height=500');
      }
    }

    setShowShareModal(false);
    setShareFileId(null);
  };

  // Share to other platforms
  const shareFile = async (fileId: number, platform: 'line' | 'copy' | 'native') => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    switch (platform) {
      case 'line':
        await shareToLine(file);
        break;
      case 'copy': {
        const shareResult = (file.type === 'video' || file.type === 'clip')
          ? await generateVideoShareUrl(file)
          : { shareUrl: window.location.href };
        await navigator.clipboard.writeText(shareResult.shareUrl);
        alert('Link copied to clipboard!');
        setShowShareModal(false);
        setShareFileId(null);
        break;
      }
      case 'native':
        if (navigator.share) {
          try {
            const shareResult = (file.type === 'video' || file.type === 'clip')
              ? await generateVideoShareUrl(file)
              : { shareUrl: window.location.href };
            await navigator.share({
              title: file.name,
              text: `Check out this ${file.type}: ${file.name}`,
              url: shareResult.shareUrl,
            });
          } catch (err) {
            console.log('Share cancelled');
          }
        }
        setShowShareModal(false);
        setShareFileId(null);
        break;
    }
  };

  // Send video directly to LINE user via Messaging API (plays inline in LINE app)
  const sendVideoToLineUser = async (fileId: number) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    if (!lineSendUserId.trim()) {
      setLineSendError("กรุณาใส่ LINE User ID");
      return;
    }

    setLineSendStatus("sending");
    setLineSendError("");

    try {
      const response = await fetch('/api/line-send-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoPath: file.url,
          lineUserId: lineSendUserId.trim(),
          videoName: file.name,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setLineSendStatus("success");
        // Reset after 2 seconds
        setTimeout(() => {
          setShowLineSendModal(false);
          setLineSendUserId("");
          setLineSendStatus("idle");
          setShareFileId(null);
        }, 2000);
      } else {
        setLineSendStatus("error");
        setLineSendError(data.error || "ไม่สามารถส่งวิดีโอได้");
      }
    } catch (error) {
      setLineSendStatus("error");
      setLineSendError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  // Send video directly to LINE Group
  const sendVideoToLineGroup = async (fileId: number, groupId?: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    const targetGroupId = groupId || selectedLineGroup;
    if (!targetGroupId) {
      setLineSendError("กรุณาเลือกกลุ่ม LINE");
      return;
    }

    setLineSendStatus("sending");
    setLineSendError("");

    try {
      const response = await fetch('/api/line-send-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoPath: file.url,
          lineGroupId: targetGroupId,
          videoName: file.name,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setLineSendStatus("success");
        // Reset after 2 seconds
        setTimeout(() => {
          setShowShareModal(false);
          setShowLineGroupModal(false);
          setLineSendStatus("idle");
          setShareFileId(null);
        }, 2000);
      } else {
        setLineSendStatus("error");
        setLineSendError(data.error || "ไม่สามารถส่งวิดีโอได้");
        // Reset after 3 seconds on error
        setTimeout(() => {
          setLineSendStatus("idle");
          setLineSendError("");
        }, 3000);
      }
    } catch (error) {
      setLineSendStatus("error");
      setLineSendError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
      setTimeout(() => {
        setLineSendStatus("idle");
        setLineSendError("");
      }, 3000);
    }
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

        <div className="relative z-10 p-3 md:p-6 pb-20">
          {/* Header Section - Gallery Style */}
          {isFileSelectionMode ? (
            /* File Selection Mode Header */
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
              <span className="text-white/70 text-sm">
                เลือก {selectedFiles.length} รายการแล้ว
              </span>

              {/* Right: Cancel Button */}
              <button
                onClick={() => {
                  setIsFileSelectionMode(false);
                  setSelectedFiles([]);
                }}
                className="text-white/70 text-sm px-2 py-1"
              >
                ยกเลิก
              </button>
            </div>
          ) : (
            /* Normal Mode Header */
            <div className="flex items-center justify-between mb-4 md:mb-6">
              {/* Left: Back Button + Folder Name */}
              <div className="flex items-center gap-3">
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
                  className="p-2 md:p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all flex items-center justify-center"
                >
                  <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
                </button>

                {/* Folder Name - shown when inside a folder */}
                {activeFolder && (
                  <h1 className="folder-title font-bold text-white text-sm sm:text-base flex items-center">
                    {currentNestedFolder?.name || activeFolder.name}
                  </h1>
                )}

                {/* Title when no folder selected */}
                {!activeFolder && (
                  <h1 className="hidden md:block text-lg font-semibold text-white/90 flex items-center">
                    อัลบั้มทั้งหมด
                  </h1>
                )}
              </div>

              {/* Right: Action Icons */}
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Upload/Add Button */}
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="p-2 md:p-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:scale-105 flex items-center justify-center"
                  title="อัพโหลดไฟล์"
                >
                  <Plus className="w-5 h-5 md:w-6 md:h-6" />
                </button>

                {/* Search Button */}
                <button
                  onClick={() => setShowHeaderSearch(!showHeaderSearch)}
                  className={`p-2 md:p-2.5 rounded-full transition-all flex items-center justify-center ${showHeaderSearch ? 'bg-purple-500/30 text-purple-300' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                  title="ค้นหา"
                >
                  <Search className="w-5 h-5 md:w-6 md:h-6" />
                </button>

                {/* 3-Dot Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowHeaderMenu(!showHeaderMenu)}
                    className={`p-2 md:p-2.5 rounded-full transition-all flex items-center justify-center ${showHeaderMenu ? 'bg-purple-500/30 text-purple-300' : 'bg-white/10 hover:bg-white/20 text-white'}`}
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

                        {/* Divider */}
                        <div className="border-t border-white/10 my-1" />

                        {/* View Mode Options */}
                        <div className="px-4 py-2">
                          <span className="text-xs text-purple-300/60 uppercase tracking-wider">มุมมอง</span>
                        </div>
                        <div className="flex items-center gap-1 px-4 pb-3">
                          {[
                            { mode: "masonry" as const, icon: LayoutGrid, label: "Masonry" },
                            { mode: "list" as const, icon: List, label: "List" },
                          ].map(({ mode, icon: Icon, label }) => (
                            <button
                              key={mode}
                              onClick={() => {
                                setViewMode(mode);
                                setShowHeaderMenu(false);
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
                      onTouchStart={() => {
                        if (!isEditing) {
                          longPressTimerRef.current = setTimeout(() => {
                            setFolderActionSheet({
                              isOpen: true,
                              folderId: subFolder.id,
                              folderName: subFolder.name,
                            });
                          }, 500);
                        }
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
                        if (!isEditing) {
                          setFolderActionSheet({
                            isOpen: true,
                            folderId: subFolder.id,
                            folderName: subFolder.name,
                          });
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

          {/* Mobile Upload Modal - Slide up bottom sheet style */}
          {showUploadModal && (
            <div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center"
              onClick={() => setShowUploadModal(false)}
            >
              <div
                className="w-full max-w-lg bg-slate-900 rounded-t-3xl overflow-hidden animate-slide-up"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="p-5 border-b border-white/10">
                  <div className="w-12 h-1 bg-white/30 rounded-full mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white text-center">
                    อัพโหลดไฟล์
                  </h3>
                </div>

                {/* Hidden file inputs */}
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
                <input
                  id="videoCaptureInput"
                  type="file"
                  accept="video/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Content */}
                <div className="p-5 space-y-4">
                  {/* Upload options */}
                  <div className="space-y-2">
                    {/* Gallery / Files */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-purple-400" />
                      </div>
                      <div className="text-left">
                        <span className="text-white text-lg block">แกลเลอรี่</span>
                        <span className="text-purple-200/60 text-sm">เลือกรูป/วิดีโอ</span>
                      </div>
                    </button>

                    {/* Browse Files */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <FolderOpen className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div className="text-left">
                        <span className="text-white text-lg block">ไฟล์อื่นๆ</span>
                        <span className="text-emerald-200/60 text-sm">เลือกจากโฟลเดอร์</span>
                      </div>
                    </button>
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

                {/* Cancel Button */}
                <div className="p-5 pt-0">
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="w-full py-4 rounded-2xl bg-white/10 text-white font-medium text-lg hover:bg-white/20 transition-colors"
                  >
                    ยกเลิก
                  </button>
                </div>
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
            <div
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end justify-center"
              onClick={() => {
                setShowShareModal(false);
                setShareFileId(null);
              }}
            >
              <div
                className="w-full max-w-lg bg-slate-900 rounded-t-3xl overflow-hidden animate-slide-up"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="p-5 border-b border-white/10">
                  <div className="w-12 h-1 bg-white/30 rounded-full mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white text-center">แชร์ไฟล์</h3>
                </div>

                {/* Share Options */}
                <div className="p-5 space-y-2">
                  {/* LINE Share - Link Preview */}
                  <button
                    onClick={() => shareFile(shareFileId, 'line')}
                    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-green-500/10 hover:bg-green-500/20 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                      <Send className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <span className="text-white text-lg block">LINE (แชร์ลิงก์)</span>
                      <span className="text-white/50 text-sm">เปิดในเบราว์เซอร์ LINE</span>
                    </div>
                  </button>

                  {/* LINE Direct Send - Video plays inline */}
                  {(files.find(f => f.id === shareFileId)?.type === 'video' ||
                    files.find(f => f.id === shareFileId)?.type === 'clip') && (
                      <div className="space-y-2">
                        {/* Group selector */}
                        <div className="flex items-center gap-2 px-2">
                          <span className="text-white/60 text-sm">ส่งไปกลุ่ม:</span>
                          <select
                            value={selectedLineGroup || ""}
                            onChange={(e) => setSelectedLineGroup(e.target.value)}
                            className="flex-1 bg-slate-800 text-white text-sm rounded-lg px-3 py-2 border border-white/20 focus:border-green-500 focus:outline-none"
                          >
                            {lineGroups.map((group) => (
                              <option key={group.id} value={group.id}>
                                {group.name}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => setShowLineGroupModal(true)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white/60 hover:text-white transition-colors"
                            title="จัดการกลุ่ม"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Send button */}
                        <button
                          onClick={() => {
                            if (shareFileId && selectedLineGroup) {
                              sendVideoToLineGroup(shareFileId, selectedLineGroup);
                            }
                          }}
                          disabled={lineSendStatus === "sending" || !selectedLineGroup}
                          className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 transition-colors border border-green-500/30 disabled:opacity-50"
                        >
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                            {lineSendStatus === "sending" ? (
                              <RefreshCw className="w-6 h-6 text-white animate-spin" />
                            ) : lineSendStatus === "success" ? (
                              <Check className="w-6 h-6 text-white" />
                            ) : (
                              <Film className="w-6 h-6 text-white" />
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <span className="text-white text-lg block">
                              {lineSendStatus === "sending" ? "กำลังส่ง..." :
                                lineSendStatus === "success" ? "ส่งสำเร็จ! ✅" :
                                  "ส่งวิดีโอตรงไป LINE ⭐"}
                            </span>
                            <span className="text-green-300 text-sm">
                              {lineSendStatus === "sending" ? "รอสักครู่..." :
                                lineSendStatus === "success" ? "ดูได้ในแชทเลย" :
                                  lineGroups.find(g => g.id === selectedLineGroup)?.name || "เลือกกลุ่ม"}
                            </span>
                          </div>
                        </button>
                      </div>
                    )}

                  {/* WhatsApp Share - with direct video link */}
                  <button
                    onClick={() => {
                      const file = files.find(f => f.id === shareFileId);
                      if (file) {
                        // Use direct video URL for inline playback in WhatsApp/Telegram
                        const directVideoUrl = `https://app.bjhbangkok.com${file.url}`;
                        const text = encodeURIComponent(`🎬 ${file.name}\n\n${directVideoUrl}`);
                        window.open(`https://wa.me/?text=${text}`, '_blank');
                      }
                      setShowShareModal(false);
                      setShareFileId(null);
                    }}
                    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center">
                      <MessageSquareQuote className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <span className="text-white text-lg block">WhatsApp</span>
                      <span className="text-emerald-300 text-sm">เล่น inline ได้เลย</span>
                    </div>
                  </button>

                  {/* Telegram Share - with direct video link */}
                  <button
                    onClick={() => {
                      const file = files.find(f => f.id === shareFileId);
                      if (file) {
                        const directVideoUrl = `https://app.bjhbangkok.com${file.url}`;
                        const text = encodeURIComponent(`🎬 ${file.name}`);
                        const url = encodeURIComponent(directVideoUrl);
                        window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
                      }
                      setShowShareModal(false);
                      setShareFileId(null);
                    }}
                    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                      <Send className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <span className="text-white text-lg block">Telegram</span>
                      <span className="text-blue-300 text-sm">เล่น inline ได้เลย</span>
                    </div>
                  </button>

                  {/* Copy Link */}
                  <button
                    onClick={() => shareFile(shareFileId, 'copy')}
                    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
                      <Copy className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-white text-lg">คัดลอกลิงก์</span>
                  </button>

                  {/* Copy Direct Video URL */}
                  {(files.find(f => f.id === shareFileId)?.type === 'video' ||
                    files.find(f => f.id === shareFileId)?.type === 'clip') && (
                      <button
                        onClick={() => {
                          const file = files.find(f => f.id === shareFileId);
                          if (file) {
                            const directVideoUrl = `https://app.bjhbangkok.com${file.url}`;
                            navigator.clipboard.writeText(directVideoUrl);
                            // Show toast or feedback
                            alert('คัดลอก Video URL แล้ว! 📋');
                          }
                          setShowShareModal(false);
                          setShareFileId(null);
                        }}
                        className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-orange-500/10 hover:bg-orange-500/20 transition-colors"
                      >
                        <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
                          <Film className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 text-left">
                          <span className="text-white text-lg block">คัดลอก Video URL</span>
                          <span className="text-orange-300 text-sm">ลิงก์ .mp4 โดยตรง</span>
                        </div>
                      </button>
                    )}

                  {/* Other Apps Share */}
                  <button
                    onClick={() => shareFile(shareFileId, 'native')}
                    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                      <Share2 className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-white text-lg">แอปอื่นๆ</span>
                  </button>
                </div>

                {/* Cancel Button */}
                <div className="p-5 pt-0">
                  <button
                    onClick={() => {
                      setShowShareModal(false);
                      setShareFileId(null);
                    }}
                    className="w-full py-4 rounded-2xl bg-white/10 text-white font-medium text-lg hover:bg-white/20 transition-colors"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* LINE Send Video Modal */}
          {showLineSendModal && shareFileId && (
            <div
              className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => {
                if (lineSendStatus !== "sending") {
                  setShowLineSendModal(false);
                  setLineSendUserId("");
                  setLineSendStatus("idle");
                  setLineSendError("");
                }
              }}
            >
              <div
                className="w-full max-w-md bg-slate-900 rounded-3xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="p-5 border-b border-white/10 bg-gradient-to-r from-green-500/20 to-emerald-500/20">
                  <h3 className="text-xl font-bold text-white text-center flex items-center justify-center gap-2">
                    <Film className="w-6 h-6 text-green-400" />
                    ส่งวิดีโอตรงไป LINE
                  </h3>
                  <p className="text-green-300/80 text-sm text-center mt-1">เล่นได้เลยในแอป LINE!</p>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  {lineSendStatus === "success" ? (
                    <div className="text-center py-8">
                      <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                        <Check className="w-10 h-10 text-green-400" />
                      </div>
                      <p className="text-green-400 text-xl font-semibold">ส่งวิดีโอสำเร็จ!</p>
                      <p className="text-white/60 text-sm mt-2">วิดีโอถูกส่งไปยัง LINE แล้ว</p>
                    </div>
                  ) : (
                    <>
                      {/* Video Preview */}
                      <div className="bg-black/30 rounded-xl p-3 flex items-center gap-3">
                        <div className="w-16 h-16 rounded-lg bg-purple-500/20 flex items-center justify-center overflow-hidden">
                          {files.find(f => f.id === shareFileId)?.thumbnail ? (
                            <img
                              src={files.find(f => f.id === shareFileId)?.thumbnail}
                              alt="Video thumbnail"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Film className="w-8 h-8 text-purple-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">
                            {files.find(f => f.id === shareFileId)?.name}
                          </p>
                          <p className="text-white/50 text-sm">
                            {files.find(f => f.id === shareFileId)?.size}
                          </p>
                        </div>
                      </div>

                      {/* LINE User ID Input */}
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">
                          LINE User ID ของผู้รับ
                        </label>
                        <input
                          type="text"
                          value={lineSendUserId}
                          onChange={(e) => setLineSendUserId(e.target.value)}
                          placeholder="U1234567890abcdef..."
                          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                          disabled={lineSendStatus === "sending"}
                        />
                        <p className="text-white/40 text-xs mt-2">
                          💡 ผู้รับต้องเพิ่ม LINE Official Account ของคุณเป็นเพื่อนก่อน
                        </p>
                      </div>

                      {/* Error Message */}
                      {lineSendError && (
                        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                          <p className="text-red-300 text-sm">{lineSendError}</p>
                        </div>
                      )}

                      {/* Buttons */}
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => {
                            setShowLineSendModal(false);
                            setLineSendUserId("");
                            setLineSendStatus("idle");
                            setLineSendError("");
                          }}
                          disabled={lineSendStatus === "sending"}
                          className="flex-1 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors disabled:opacity-50"
                        >
                          ยกเลิก
                        </button>
                        <button
                          onClick={() => sendVideoToLineUser(shareFileId)}
                          disabled={lineSendStatus === "sending" || !lineSendUserId.trim()}
                          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium hover:from-green-600 hover:to-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {lineSendStatus === "sending" ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              กำลังส่ง...
                            </>
                          ) : (
                            <>
                              <Send className="w-5 h-5" />
                              ส่งวิดีโอ
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* LINE Group Management Modal */}
          {showLineGroupModal && (
            <div
              className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setShowLineGroupModal(false)}
            >
              <div
                className="w-full max-w-md bg-slate-900 rounded-3xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="p-5 border-b border-white/10 bg-gradient-to-r from-green-500/20 to-emerald-500/20">
                  <h3 className="text-xl font-bold text-white text-center flex items-center justify-center gap-2">
                    <Send className="w-6 h-6 text-green-400" />
                    จัดการกลุ่ม LINE
                  </h3>
                  <p className="text-green-300/80 text-sm text-center mt-1">เพิ่มหรือลบกลุ่มที่ต้องการส่งวิดีโอ</p>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                  {/* Existing Groups */}
                  <div className="space-y-2">
                    <label className="block text-white/80 text-sm font-medium">กลุ่มที่บันทึกไว้</label>
                    {lineGroups.length === 0 ? (
                      <p className="text-white/40 text-sm">ยังไม่มีกลุ่ม</p>
                    ) : (
                      lineGroups.map((group) => (
                        <div key={group.id} className="flex items-center gap-2 bg-white/5 rounded-xl p-3">
                          <div className="flex-1">
                            <p className="text-white font-medium">{group.name}</p>
                            <p className="text-white/40 text-xs truncate">{group.id}</p>
                          </div>
                          <button
                            onClick={() => removeLineGroup(group.id)}
                            className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                            title="ลบกลุ่ม"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* How to get Group ID */}
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 space-y-2">
                    <p className="text-green-400 font-medium flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      วิธีหา Group ID
                    </p>
                    <ol className="text-white/70 text-sm space-y-1 list-decimal list-inside">
                      <li>เปิดแอป LINE บนมือถือ</li>
                      <li>เชิญ Bot เข้ากลุ่มที่ต้องการ</li>
                      <li>พิมพ์ <code className="bg-white/10 px-1 rounded">!groupid</code> ในกลุ่ม</li>
                      <li>Bot จะตอบกลับ Group ID มาให้</li>
                      <li>คัดลอก ID มาใส่ด้านล่าง</li>
                    </ol>
                  </div>

                  {/* Add New Group */}
                  <div className="border-t border-white/10 pt-4 space-y-3">
                    <label className="block text-white/80 text-sm font-medium">เพิ่มกลุ่มใหม่</label>
                    <input
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="ชื่อกลุ่ม (เช่น ทีมการตลาด)"
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-green-500"
                    />
                    <input
                      type="text"
                      value={newGroupId}
                      onChange={(e) => setNewGroupId(e.target.value)}
                      placeholder="Group ID (เช่น C31a793e94485a393...)"
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-green-500"
                    />
                    <button
                      onClick={addLineGroup}
                      disabled={!newGroupName.trim() || !newGroupId.trim()}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-400 hover:to-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      เพิ่มกลุ่ม
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10">
                  <button
                    onClick={() => setShowLineGroupModal(false)}
                    className="w-full py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
                  >
                    ปิด
                  </button>
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
            // List View - Mobile friendly, no header
            <div className="glass-card rounded-2xl overflow-hidden">
              <table className="w-full">
                <tbody>
                  {filteredFiles.map((file, index) => (
                    <tr
                      key={file.id}
                      className={`border-b border-purple-500/10 hover:bg-white/5 transition-colors ${selectedFiles.includes(file.id) ? 'bg-purple-500/10' : ''}`}
                      onTouchStart={() => {
                        fileLongPressRef.current = setTimeout(() => {
                          setIsFileSelectionMode(true);
                          if (!selectedFiles.includes(file.id)) {
                            toggleSelect(file.id);
                          }
                        }, 500);
                      }}
                      onTouchEnd={() => {
                        if (fileLongPressRef.current) {
                          clearTimeout(fileLongPressRef.current);
                          fileLongPressRef.current = null;
                        }
                      }}
                      onTouchMove={() => {
                        if (fileLongPressRef.current) {
                          clearTimeout(fileLongPressRef.current);
                          fileLongPressRef.current = null;
                        }
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setIsFileSelectionMode(true);
                        if (!selectedFiles.includes(file.id)) {
                          toggleSelect(file.id);
                        }
                      }}
                    >
                      {/* Checkbox column - only show in selection mode */}
                      {isFileSelectionMode && (
                        <td className="p-1 sm:p-2 text-center">
                          <input
                            type="checkbox"
                            checked={selectedFiles.includes(file.id)}
                            onChange={() => toggleSelect(file.id)}
                            className="w-4 h-4 rounded cursor-pointer"
                          />
                        </td>
                      )}
                      <td className="p-1 sm:p-2">
                        <div
                          className="relative w-10 h-10 sm:w-12 sm:h-10 rounded-lg overflow-hidden cursor-pointer hover:scale-110 transition-transform mx-auto"
                          onClick={() => openLightbox(index)}
                        >
                          <ThumbnailImage
                            file={file}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                          {(file.type === "video" || file.type === "clip") && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                              <Play className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-1 sm:p-2">
                        <div className="font-medium text-white text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[180px]">
                          {file.name}
                        </div>
                        <div className="flex gap-0.5 mt-0.5 flex-wrap">
                          {file.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-1 py-0 bg-purple-500/20 text-purple-300 text-[10px] rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-1 sm:p-2">
                        <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                          <button
                            onClick={() => handleDownloadFile(file.id)}
                            className="p-1 sm:p-1.5 rounded-lg bg-white/10 text-purple-300 hover:bg-white/20 transition-colors flex items-center justify-center"
                            title="ดาวน์โหลด"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setShareFileId(file.id);
                              setShowShareModal(true);
                            }}
                            className="p-1 sm:p-1.5 rounded-lg bg-white/10 text-purple-300 hover:bg-white/20 transition-colors flex items-center justify-center"
                            title="แชร์"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteFile(file.id)}
                            className="p-1 sm:p-1.5 rounded-lg bg-white/10 text-red-400 hover:bg-red-500/20 transition-colors flex items-center justify-center"
                            title="ลบ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // Samsung Gallery Style - 4 columns grid
            <div className="grid grid-cols-4 gap-0.5">
              {filteredFiles.map((file, index) => (
                <div
                  key={file.id}
                  className={`relative aspect-square overflow-hidden cursor-pointer ${selectedFiles.includes(file.id) ? 'ring-2 ring-white ring-inset' : ''}`}
                  onClick={() => {
                    // In selection mode: toggle selection
                    // Not in selection mode: open lightbox to view
                    if (isFileSelectionMode) {
                      toggleSelect(file.id);
                    } else {
                      openLightbox(index);
                    }
                  }}
                  onTouchStart={() => {
                    // Long press to enter selection mode
                    fileLongPressRef.current = setTimeout(() => {
                      setIsFileSelectionMode(true);
                      if (!selectedFiles.includes(file.id)) {
                        toggleSelect(file.id);
                      }
                    }, 500);
                  }}
                  onTouchEnd={() => {
                    if (fileLongPressRef.current) {
                      clearTimeout(fileLongPressRef.current);
                      fileLongPressRef.current = null;
                    }
                  }}
                  onTouchMove={() => {
                    if (fileLongPressRef.current) {
                      clearTimeout(fileLongPressRef.current);
                      fileLongPressRef.current = null;
                    }
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setIsFileSelectionMode(true);
                    if (!selectedFiles.includes(file.id)) {
                      toggleSelect(file.id);
                    }
                  }}
                >
                  {/* Image */}
                  <ThumbnailImage
                    file={file}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Selection Checkbox - visible in selection mode or when selected */}
                  {(isFileSelectionMode || selectedFiles.includes(file.id)) && (
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

                  {/* Video duration badge */}
                  {file.duration && (
                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 rounded text-white text-xs font-medium">
                      {file.duration}
                    </div>
                  )}

                  {/* Play icon for videos */}
                  {(file.type === "video" || file.type === "clip") && !file.duration && (
                    <div className="absolute bottom-1 right-1">
                      <Play className="w-4 h-4 text-white drop-shadow-lg" fill="white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* File Selection Mode Bottom Action Bar - Slide up animation */}
          <div
            className={`fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 z-50 safe-area-bottom transform transition-transform duration-300 ease-out ${isFileSelectionMode && !showShareModal ? 'translate-y-0' : 'translate-y-full'
              }`}
          >
            <div className="flex items-center justify-around py-3 px-4">
              {/* Download */}
              <button
                onClick={() => {
                  if (selectedFiles.length > 0) {
                    selectedFiles.forEach(id => handleDownloadFile(id));
                  }
                }}
                className="flex flex-col items-center gap-1 px-4 py-2"
              >
                <Download className="w-6 h-6 text-white" />
                <span className="text-white text-xs">ดาวน์โหลด</span>
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
                        setIsFileSelectionMode(false);
                        closeConfirmModal();
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
            </div>
          </div>

          {/* Lightbox Modal */}
          {showLightbox && filteredFiles[lightboxIndex] && (
            <div
              className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
              onClick={() => setShowLightbox(false)}
            >
              <div
                className="relative w-full h-full flex items-center justify-center p-4"
                onClick={(e) => e.stopPropagation()}
                onTouchStart={(e) => {
                  const touch = e.touches[0];
                  (e.currentTarget as HTMLDivElement).dataset.touchStartX = String(touch.clientX);
                }}
                onTouchEnd={(e) => {
                  const touchStartX = parseFloat((e.currentTarget as HTMLDivElement).dataset.touchStartX || '0');
                  const touchEndX = e.changedTouches[0].clientX;
                  const diff = touchStartX - touchEndX;

                  if (Math.abs(diff) > 50) {
                    if (diff > 0) {
                      // Swipe left - next
                      setLightboxIndex((prev) => prev < filteredFiles.length - 1 ? prev + 1 : 0);
                    } else {
                      // Swipe right - previous
                      setLightboxIndex((prev) => prev > 0 ? prev - 1 : filteredFiles.length - 1);
                    }
                  }
                }}
              >
                {/* Top Right Action Buttons */}
                <div className="absolute top-4 right-4 flex items-center gap-2 z-50">
                  {/* Download Button */}
                  <button
                    onClick={() => handleDownloadFile(filteredFiles[lightboxIndex].id)}
                    className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-400 hover:to-cyan-400 transition-colors"
                    title="ดาวน์โหลด"
                  >
                    <Download className="w-6 h-6" />
                  </button>

                  {/* Share Button */}
                  <button
                    onClick={() => {
                      setShareFileId(filteredFiles[lightboxIndex].id);
                      setShowShareModal(true);
                    }}
                    className="p-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-400 hover:to-emerald-400 transition-colors"
                    title="แชร์"
                  >
                    <Share2 className="w-6 h-6" />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => {
                      if (confirm('คุณต้องการลบไฟล์นี้หรือไม่?')) {
                        handleDeleteFile(filteredFiles[lightboxIndex].id);
                        // Close lightbox if no more files or move to next
                        if (filteredFiles.length <= 1) {
                          setShowLightbox(false);
                        } else if (lightboxIndex >= filteredFiles.length - 1) {
                          setLightboxIndex(lightboxIndex - 1);
                        }
                      }
                    }}
                    className="p-3 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-400 hover:to-pink-400 transition-colors"
                    title="ลบ"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>

                  {/* Close Button */}
                  <button
                    onClick={() => setShowLightbox(false)}
                    className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

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

          {/* Folder Action Sheet - Samsung Gallery Style */}
          {folderActionSheet.isOpen && (
            <div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center"
              onClick={() => setFolderActionSheet({ isOpen: false, folderId: null, folderName: '' })}
            >
              <div
                className="w-full max-w-lg bg-slate-900 rounded-t-3xl overflow-hidden animate-slide-up"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="p-5 border-b border-white/10">
                  <div className="w-12 h-1 bg-white/30 rounded-full mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white text-center">
                    {folderActionSheet.folderName}
                  </h3>
                </div>

                {/* Actions */}
                <div className="p-4 space-y-2">
                  {/* Edit Name */}
                  <button
                    onClick={() => {
                      const folder = displayFolders.find(f => f.id === folderActionSheet.folderId);
                      if (folder) {
                        handleStartEditSubFolder(folder);
                      }
                      setFolderActionSheet({ isOpen: false, folderId: null, folderName: '' });
                    }}
                    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Pencil className="w-6 h-6 text-blue-400" />
                    </div>
                    <span className="text-white text-lg">แก้ไขชื่อ</span>
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => {
                      if (folderActionSheet.folderId) {
                        handleDeleteSubFolder(folderActionSheet.folderId);
                      }
                      setFolderActionSheet({ isOpen: false, folderId: null, folderName: '' });
                    }}
                    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/5 hover:bg-red-500/20 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                      <Trash2 className="w-6 h-6 text-red-400" />
                    </div>
                    <span className="text-red-400 text-lg">ลบโฟลเดอร์</span>
                  </button>
                </div>

                {/* Cancel Button */}
                <div className="p-4 pt-0">
                  <button
                    onClick={() => setFolderActionSheet({ isOpen: false, folderId: null, folderName: '' })}
                    className="w-full py-4 rounded-2xl bg-white/10 text-white font-medium text-lg hover:bg-white/20 transition-colors"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Create Folder Bottom Sheet */}
          {isCreatingSubFolder && (
            <div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center"
              onClick={() => setIsCreatingSubFolder(false)}
            >
              <div
                className="w-full max-w-lg bg-slate-900 rounded-t-3xl overflow-hidden animate-slide-up"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="p-5 border-b border-white/10">
                  <div className="w-12 h-1 bg-white/30 rounded-full mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white text-center">
                    สร้างโฟลเดอร์ใหม่
                  </h3>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  <input
                    type="text"
                    value={subFolderDraftName}
                    onChange={(e) => setSubFolderDraftName(e.target.value)}
                    placeholder="ตั้งชื่อโฟลเดอร์ใหม่"
                    className="w-full px-4 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-lg"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      handleCreateSubFolder();
                    }}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold text-lg hover:from-green-400 hover:to-emerald-500 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-200"
                  >
                    สร้าง
                  </button>
                </div>

                {/* Cancel Button */}
                <div className="p-5 pt-0">
                  <button
                    onClick={() => setIsCreatingSubFolder(false)}
                    className="w-full py-4 rounded-2xl bg-white/10 text-white font-medium text-lg hover:bg-white/20 transition-colors"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* File Action Sheet - Desktop Web Usage */}
          {fileActionSheet.isOpen && (
            <div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center"
              onClick={() => setFileActionSheet({ isOpen: false, fileId: null, fileName: '', fileIndex: -1 })}
            >
              <div
                className="w-full max-w-lg bg-slate-900 rounded-t-3xl md:rounded-3xl overflow-hidden animate-slide-up"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="p-5 border-b border-white/10">
                  <div className="w-12 h-1 bg-white/30 rounded-full mx-auto mb-4 md:hidden" />
                  <h3 className="text-lg font-semibold text-white text-center truncate px-4">
                    {fileActionSheet.fileName}
                  </h3>
                </div>

                {/* Actions */}
                <div className="p-4 space-y-2">
                  {/* View/Open */}
                  <button
                    onClick={() => {
                      if (fileActionSheet.fileIndex >= 0) {
                        openLightbox(fileActionSheet.fileIndex);
                      }
                      setFileActionSheet({ isOpen: false, fileId: null, fileName: '', fileIndex: -1 });
                    }}
                    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Eye className="w-6 h-6 text-purple-400" />
                    </div>
                    <span className="text-white text-lg">ดูไฟล์</span>
                  </button>

                  {/* Download */}
                  <button
                    onClick={() => {
                      if (fileActionSheet.fileId) {
                        handleDownloadFile(fileActionSheet.fileId);
                      }
                      setFileActionSheet({ isOpen: false, fileId: null, fileName: '', fileIndex: -1 });
                    }}
                    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Download className="w-6 h-6 text-blue-400" />
                    </div>
                    <span className="text-white text-lg">ดาวน์โหลด</span>
                  </button>

                  {/* Select */}
                  <button
                    onClick={() => {
                      if (fileActionSheet.fileId) {
                        setIsFileSelectionMode(true);
                        if (!selectedFiles.includes(fileActionSheet.fileId)) {
                          toggleSelect(fileActionSheet.fileId);
                        }
                      }
                      setFileActionSheet({ isOpen: false, fileId: null, fileName: '', fileIndex: -1 });
                    }}
                    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Check className="w-6 h-6 text-emerald-400" />
                    </div>
                    <span className="text-white text-lg">เลือก</span>
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => {
                      if (fileActionSheet.fileId) {
                        handleDeleteFile(fileActionSheet.fileId);
                      }
                      setFileActionSheet({ isOpen: false, fileId: null, fileName: '', fileIndex: -1 });
                    }}
                    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/5 hover:bg-red-500/20 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                      <Trash2 className="w-6 h-6 text-red-400" />
                    </div>
                    <span className="text-red-400 text-lg">ลบไฟล์</span>
                  </button>
                </div>

                {/* Cancel Button */}
                <div className="p-4 pt-0">
                  <button
                    onClick={() => setFileActionSheet({ isOpen: false, fileId: null, fileName: '', fileIndex: -1 })}
                    className="w-full py-4 rounded-2xl bg-white/10 text-white font-medium text-lg hover:bg-white/20 transition-colors"
                  >
                    ยกเลิก
                  </button>
                </div>
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
