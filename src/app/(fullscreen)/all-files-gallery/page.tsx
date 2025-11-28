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
} from "lucide-react";
import UserMenu from "@/components/UserMenu";

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
    from { transform: translateY(30px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
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
  .animate-slide-up { animation: slide-up 0.6s ease-out forwards; }

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
`;

// File interface - files will be stored in /public/marketing/
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
}

// Initial empty files - users will upload files to /public/marketing/
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
    id: "customer-reviews",
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
  "Before/After": "branding",
  Products: "branding",
  Testimonials: "customer-reviews",
  Consultations: "customer-reviews",
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
  const [files, setFiles] = useState<FileItem[]>(initialFiles);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const isMountedRef = useRef(true);

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

  // Check if we can upload files (only at leaf folders)
  const canUploadFiles = useMemo((): boolean => {
    if (!currentNestedFolder) return false;
    return isLeafFolder(currentNestedFolder);
  }, [currentNestedFolder]);

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
    if (!activeFolder) {
      return new Set(files.map((file) => file.id));
    }

    // If we're at a nested folder, show only its files (if it's a leaf)
    if (currentNestedFolder && isLeafFolder(currentNestedFolder)) {
      return new Set(currentNestedFolder.fileIds);
    }

    // If no folder selected or at a non-leaf folder, show no files
    if (folderPath.length > 0) {
      return new Set<number>();
    }

    // At root of main folder, show all files (including root-level files)
    const allIds = [
      ...activeFolder.rootFileIds,
      ...activeFolder.subFolders.flatMap((sub) => getAllFileIds(sub)),
    ];
    return new Set(allIds);
  }, [activeFolder, currentNestedFolder, folderPath, files]);

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
      alert("Remove all files and sub folders before deleting this folder.");
      return;
    }

    if (!confirm(`Are you sure you want to delete "${folderToDelete.name}"?`)) return;

    const targetPath = folderToDelete.relativePath;
    if (!targetPath) {
      alert("ไม่สามารถลบโฟลเดอร์นี้ได้ในขณะนี้");
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
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("เกิดข้อผิดพลาดขณะลบโฟลเดอร์");
      }
    }
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
      alert("Remove or reassign all files before deleting this folder.");
      return;
    }

    if (!confirm(`Are you sure you want to delete "${folder.name}"?`)) return;

    setFolders((prev) => prev.filter((f) => f.id !== folderId));

    if (activeFolderId === folderId) {
      setActiveFolderId(null);
      setFolderPath([]);
    }
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

  // Delete file handler with confirmation
  const handleDeleteFile = async (fileId: number) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    if (!confirm(`คุณต้องการลบไฟล์ "${file.name}" หรือไม่?\n\nการลบไม่สามารถกู้คืนได้`)) return;

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
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("เกิดข้อผิดพลาดขณะลบไฟล์");
      }
    }
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
      await processUploadedFiles(uploadedFiles, targetPath);
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

  // Share to LINE handler
  const shareToLine = (fileId: number) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    // LINE share URL format
    const shareText = encodeURIComponent(`Check out this file: ${file.name}`);
    const shareUrl = encodeURIComponent(window.location.href);

    // Open LINE share
    if (isMobile) {
      // Mobile LINE app deep link
      window.location.href = `line://msg/text/${shareText}%0A${shareUrl}`;
    } else {
      // Desktop LINE share
      window.open(`https://social-plugins.line.me/lineit/share?url=${shareUrl}&text=${shareText}`, '_blank', 'width=500,height=500');
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
        shareToLine(fileId);
        break;
      case 'copy':
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
        break;
      case 'native':
        if (navigator.share) {
          try {
            await navigator.share({
              title: file.name,
              text: `Check out this file: ${file.name}`,
              url: window.location.href,
            });
          } catch (err) {
            console.log('Share cancelled');
          }
        }
        break;
    }
    setShowShareModal(false);
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
            <div className="px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-700 to-blue-500 text-white text-lg font-semibold pointer-events-none">
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

          {/* Floating Particles */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: `linear-gradient(135deg, ${["#8b5cf6", "#ec4899", "#f97316", "#06b6d4"][i % 4]
                  }, transparent)`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 p-3 md:p-6">
          {/* Header Section */}
          <div className="mb-4 md:mb-8">
            {/* Back Button */}
            <button
              onClick={() => router.push("/home")}
              className="group flex items-center gap-2 md:gap-3 px-3 md:px-5 py-2 md:py-2.5 mb-4 md:mb-6 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 text-sm md:text-base"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">กลับหน้าหลัก</span>
            </button>

            {/* Title Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 md:gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="p-2.5 md:p-4 rounded-xl md:rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/50 animate-pulse-glow">
                    <FolderOpen className="w-6 h-6 md:w-10 md:h-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 animate-gradient-shift">
                      รวม File ทั้งหมด
                    </h1>
                    <p className="text-sm md:text-lg text-purple-200/80 mt-1">
                      📸 รูป • วิดีโอ • ไฟล์มีเดีย
                    </p>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <UserMenu />
              </div>
            </div>
          </div>

          {/* Folder Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-5 mb-6 md:mb-8">
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
                  className={`group relative glass-card rounded-2xl p-5 text-left transition-all duration-300 hover:scale-[1.03] border overflow-hidden animate-slide-up ${isActive
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
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${folder.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 ${isActive ? 'scale-110 shadow-xl' : ''}`}
                      >
                        <Icon className="w-7 h-7 text-white drop-shadow-md" />
                      </div>
                      <h3 className="text-lg font-bold text-white group-hover:text-purple-100 transition-colors">
                        {folder.name}
                      </h3>
                      <p className="text-sm text-purple-200/60 mt-1 line-clamp-2">
                        {folder.description}
                      </p>
                      <div className="flex items-center justify-between text-xs mt-4 pt-3 border-t border-white/10">
                        <span className="flex items-center gap-1.5 text-purple-200/70">
                          <FolderOpen className="w-3.5 h-3.5" />
                          {subFolderCount}
                        </span>
                        <span className="flex items-center gap-1.5 text-purple-200/70">
                          <FileVideo className="w-3.5 h-3.5" />
                          {fileCount}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Edit & Delete buttons - show on hover */}
                  {!isEditing && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEditFolder(folder);
                        }}
                        className="p-1.5 rounded-lg bg-white/20 text-purple-100 hover:bg-white/30 hover:text-white transition-all"
                        title="แก้ไขชื่อ"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFolder(folder.id);
                        }}
                        className="p-1.5 rounded-lg bg-white/20 text-red-300 hover:bg-red-500/30 hover:text-red-200 transition-all"
                        title="ลบโฟลเดอร์"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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

          {activeFolder ? (
            <div className="mb-8 space-y-5">
              {/* Breadcrumb Navigation */}
              <div className="glass-card rounded-2xl p-4 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    {breadcrumbItems.map((item, index) => (
                      <div key={item.id} className="flex items-center gap-2">
                        {index > 0 && (
                          <ChevronRight className="w-4 h-4 text-purple-300/50" />
                        )}
                        <button
                          onClick={() => handleBreadcrumbClick(index)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${index === breadcrumbItems.length - 1
                            ? "bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white font-semibold"
                            : "text-purple-200/70 hover:text-white hover:bg-white/10"
                            }`}
                        >
                          {item.isRoot && (
                            <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${activeFolder.gradient} flex items-center justify-center`}>
                              {(() => {
                                const Icon = activeFolder.icon;
                                return <Icon className="w-3.5 h-3.5 text-white" />;
                              })()}
                            </div>
                          )}
                          <span className="text-sm">{item.name}</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Folder info */}
                  <div className="flex items-center gap-4 text-sm text-purple-200/60">
                    <span className="flex items-center gap-1.5">
                      <FolderOpen className="w-4 h-4" />
                      {displayFolders.length} โฟลเดอร์
                    </span>
                    {canUploadFiles && currentNestedFolder && (
                      <span className="flex items-center gap-1.5">
                        <FileVideo className="w-4 h-4" />
                        {currentNestedFolder.fileIds.length} ไฟล์
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Create Folder Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setIsCreatingSubFolder((prev) => !prev);
                    setSubFolderDraftName("");
                    setEditingSubFolderId(null);
                    setEditingSubFolderValue("");
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  {isCreatingSubFolder ? "ยกเลิก" : "สร้างโฟลเดอร์"}
                </button>
              </div>

              {/* Create Folder Form */}
              {isCreatingSubFolder && (
                <div className="glass-card rounded-2xl p-5 border border-white/10 shadow-lg">
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

              {/* Nested Folders Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
                {displayFolders.length === 0 ? (
                  <div className="glass-card rounded-2xl p-8 border-2 border-dashed border-purple-400/30 text-center col-span-full">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                      <FolderOpen className="w-8 h-8 text-purple-300/70" />
                    </div>
                    {canUploadFiles ? (
                      <>
                        <p className="text-purple-200/70 text-sm">นี่คือโฟลเดอร์ปลายทาง</p>
                        <p className="text-emerald-300/70 text-xs mt-1">✓ สามารถอัพโหลดไฟล์ได้ที่นี่</p>
                      </>
                    ) : (
                      <>
                        <p className="text-purple-200/70 text-sm">ยังไม่มีโฟลเดอร์ย่อย</p>
                        <p className="text-purple-300/50 text-xs mt-1">คลิก "สร้างโฟลเดอร์" เพื่อเริ่มต้น</p>
                      </>
                    )}
                  </div>
                ) : (
                  displayFolders.map((subFolder, index) => {
                    const isEditing = editingSubFolderId === subFolder.id;
                    const hasChildren = subFolder.children.length > 0;
                    const isLeaf = isLeafFolder(subFolder);

                    return (
                      <div
                        key={subFolder.id}
                        onClick={() => {
                          if (!isEditing) {
                            handleNestedFolderSelect(subFolder.id);
                          }
                        }}
                        className={`group relative glass-card rounded-2xl p-5 border text-left transition-all duration-300 hover:scale-[1.03] cursor-pointer overflow-hidden animate-slide-up border-white/10 hover:border-purple-300/50 hover:shadow-lg hover:shadow-purple-500/20`}
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        {/* Background glow */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${activeFolder.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                        {isEditing ? (
                          <div className="relative z-10 flex flex-col gap-3 h-full">
                            <input
                              type="text"
                              value={editingSubFolderValue}
                              onChange={(e) =>
                                setEditingSubFolderValue(e.target.value)
                              }
                              className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleSaveSubFolderName(subFolder.id);
                                }}
                                className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-medium shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all"
                              >
                                บันทึก
                              </button>
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleCancelEditSubFolder();
                                }}
                                className="flex-1 px-4 py-2 rounded-xl bg-white/10 text-purple-100 text-sm font-medium hover:bg-white/20 transition-all"
                              >
                                ยกเลิก
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-start gap-3 flex-1">
                              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${activeFolder.gradient} flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300`}>
                                <FolderOpen className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-white font-semibold truncate group-hover:text-purple-100 transition-colors">
                                  {subFolder.name}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-purple-200/60 mt-1">
                                  {hasChildren && (
                                    <span className="flex items-center gap-1">
                                      <FolderOpen className="w-3 h-3" />
                                      {subFolder.children.length}
                                    </span>
                                  )}
                                  {isLeaf && (
                                    <span className="flex items-center gap-1">
                                      <FileVideo className="w-3 h-3" />
                                      {subFolder.fileIds.length} ไฟล์
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/10">
                              <div className="flex items-center gap-1">
                                {isLeaf ? (
                                  <span className="text-xs text-emerald-300/70 flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    อัพโหลดได้
                                  </span>
                                ) : (
                                  <span className="text-xs text-purple-200/50 flex items-center gap-1">
                                    <ChevronRight className="w-3 h-3" />
                                    คลิกเพื่อเข้า
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleStartEditSubFolder(subFolder);
                                  }}
                                  className="p-2 rounded-lg bg-white/10 text-purple-100 hover:bg-white/20 hover:text-white transition-all"
                                  title="แก้ไขชื่อ"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleDeleteSubFolder(subFolder.id);
                                  }}
                                  className="p-2 rounded-lg bg-white/10 text-red-300 hover:bg-red-500/30 hover:text-red-200 transition-all"
                                  title="ลบโฟลเดอร์"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-8 mb-8 text-center border border-white/10">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <FolderOpen className="w-10 h-10 text-purple-300/70" />
              </div>
              <p className="text-purple-200/80 text-base font-medium">เลือกโฟลเดอร์ด้านบน</p>
              <p className="text-purple-300/50 text-sm mt-1">เพื่อจัดการโฟลเดอร์ย่อยและแสดงไฟล์เฉพาะหมวดนั้น</p>
            </div>
          )}

          {/* AI Video Production Drop Zone */}
          {showAIDropZone && (
            <div
              onDragOver={handleAIDragOver}
              onDragLeave={handleAIDragLeave}
              onDrop={handleAIDrop}
              className={`glass-card rounded-2xl p-4 mb-6 border-2 border-dashed transition-all duration-300 ${aiDragOver
                ? 'ai-drop-zone-active border-emerald-400'
                : 'ai-drop-zone border-purple-400/50'
                }`}
            >
              <div className="flex items-center justify-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${aiDragOver
                  ? 'bg-gradient-to-br from-emerald-500 to-green-600'
                  : 'bg-gradient-to-br from-purple-500 to-pink-500'
                  }`}>
                  <Wand2 className="w-6 h-6 text-white" />
                </div>
                <div className="text-center md:text-left">
                  <p className={`font-semibold transition-colors ${aiDragOver ? 'text-emerald-300' : 'text-white'}`}>
                    {aiDragOver ? '📥 วางไฟล์ที่นี่!' : '🎬 AI Video Production'}
                  </p>
                  <p className="text-sm text-purple-200/60">
                    {aiDragOver ? 'ปล่อยเพื่อเริ่มสร้างวิดีโอ' : 'ลากไฟล์มาที่นี่เพื่อสร้างวิดีโอด้วย AI'}
                  </p>
                </div>
                {aiProcessingFiles.length > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-xl">
                    <RefreshCw className="w-4 h-4 text-purple-300 animate-spin" />
                    <span className="text-sm text-purple-200">กำลังประมวลผล {aiProcessingFiles.length} ไฟล์...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Control Bar */}
          <div className="glass-card rounded-2xl p-3 md:p-4 mb-6 relative z-30">
            {/* Mobile Menu Toggle */}
            <div className="flex items-center gap-3 md:hidden mb-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-300" />
                <input
                  type="text"
                  placeholder="ค้นหาไฟล์..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2.5 bg-white/10 rounded-xl text-purple-300 mobile-touch-target"
              >
                <Menu className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="p-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white mobile-touch-target"
              >
                <Upload className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {showMobileMenu && (
              <div className="md:hidden mb-3 p-3 bg-white/5 rounded-xl space-y-3">
                {/* View Mode */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-purple-200">มุมมอง:</span>
                  <div className="flex items-center gap-1 p-1 bg-white/10 rounded-lg">
                    {[
                      { mode: "grid" as const, icon: Grid },
                      { mode: "masonry" as const, icon: LayoutGrid },
                      { mode: "list" as const, icon: List },
                    ].map(({ mode, icon: Icon }) => (
                      <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        className={`p-2 rounded-lg transition-all ${viewMode === mode
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                          : "text-purple-300"
                          }`}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Type Filter */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-purple-200">ประเภท:</span>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                  >
                    <option value="all" className="bg-slate-800">ทุกประเภท</option>
                    <option value="image" className="bg-slate-800">รูปภาพ</option>
                    <option value="video" className="bg-slate-800">วิดีโอ</option>
                    <option value="clip" className="bg-slate-800">คลิป</option>
                  </select>
                </div>

                {/* Sort */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-purple-200">เรียงตาม:</span>
                  <select
                    value={`${sortBy}-${sortDirection}`}
                    onChange={(e) => {
                      const [sort, dir] = e.target.value.split("-");
                      setSortBy(sort as any);
                      setSortDirection(dir as any);
                    }}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                  >
                    <option value="date-desc" className="bg-slate-800">ล่าสุด</option>
                    <option value="date-asc" className="bg-slate-800">เก่าสุด</option>
                    <option value="name-asc" className="bg-slate-800">A-Z</option>
                    <option value="views-desc" className="bg-slate-800">ยอดวิว</option>
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm ${showFavoritesOnly
                      ? "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                      : "bg-white/10 text-purple-300"
                      }`}
                  >
                    <Heart className={`w-4 h-4 ${showFavoritesOnly ? "fill-current" : ""}`} />
                    โปรด
                  </button>
                  <button
                    onClick={selectAll}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/10 text-purple-300 rounded-lg text-sm"
                  >
                    <Check className="w-4 h-4" />
                    {selectedFiles.length > 0 ? 'ยกเลิก' : 'เลือก'}
                  </button>
                  <button
                    onClick={distributeFilesRandomly}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    สุ่ม
                  </button>
                </div>
              </div>
            )}

            {/* Desktop Controls */}
            <div className="hidden md:flex flex-wrap items-center gap-4">
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

              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl transition-all shadow-lg">
                <Upload className="w-4 h-4" />
                <span className="font-medium">อัพโหลด</span>
              </button>

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

            {/* Results Info */}
            <div className="mt-3 md:mt-4 flex items-center justify-between text-xs md:text-sm text-purple-200/60">
              <span>
                แสดง {filteredFiles.length} จาก {files.length} ไฟล์
              </span>
              {selectedFiles.length > 0 && (
                <span className="text-purple-300">
                  เลือกแล้ว {selectedFiles.length} ไฟล์
                </span>
              )}
            </div>
          </div>

          {/* Mobile Upload Modal */}
          {showUploadModal && (
            <div className="fixed inset-0 z-50 bg-black/80 flex items-end md:items-center justify-center p-4">
              <div className="w-full max-w-md bg-slate-900 rounded-t-3xl md:rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">อัพโหลดไฟล์</h3>
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Hidden file inputs */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*,video/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Upload options */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:border-purple-400/50 transition-all"
                  >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <FolderOpen className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="text-white font-semibold">เลือกไฟล์</p>
                      <p className="text-xs text-purple-200/60">จากอุปกรณ์</p>
                    </div>
                  </button>

                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 hover:border-cyan-400/50 transition-all"
                  >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                      <Camera className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="text-white font-semibold">ถ่ายรูป/วิดีโอ</p>
                      <p className="text-xs text-purple-200/60">จากกล้อง</p>
                    </div>
                  </button>
                </div>

                <p className="text-center text-sm text-purple-200/50 pt-2">
                  รองรับไฟล์: รูปภาพ และ วิดีโอ
                </p>
              </div>
            </div>
          )}

          {/* Share Modal */}
          {showShareModal && shareFileId && (
            <div className="fixed inset-0 z-50 bg-black/80 flex items-end md:items-center justify-center p-4">
              <div className="w-full max-w-md bg-slate-900 rounded-t-3xl md:rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">แชร์ไฟล์</h3>
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

                <div className="grid grid-cols-3 gap-4">
                  {/* LINE Share */}
                  <button
                    onClick={() => shareFile(shareFileId, 'line')}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl line-share-btn transition-all"
                  >
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                      <Send className="w-6 h-6 text-green-500" />
                    </div>
                    <span className="text-white text-sm font-medium">LINE</span>
                  </button>

                  {/* Copy Link */}
                  <button
                    onClick={() => shareFile(shareFileId, 'copy')}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
                  >
                    <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
                      <Copy className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-white text-sm font-medium">คัดลอก</span>
                  </button>

                  {/* Native Share */}
                  {'share' in navigator && (
                    <button
                      onClick={() => shareFile(shareFileId, 'native')}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
                    >
                      <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                        <Share2 className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-white text-sm font-medium">อื่นๆ</span>
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
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <div className="p-6 rounded-full bg-purple-500/20 mb-4">
                <FolderOpen className="w-16 h-16 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">ไม่พบไฟล์</h3>
              <p className="text-purple-200/60">
                ลองเปลี่ยนตัวกรองหรือคำค้นหาใหม่
              </p>
            </div>
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
                          className="w-16 h-12 rounded-lg overflow-hidden cursor-pointer hover:scale-110 transition-transform"
                          onClick={() => openLightbox(index)}
                        >
                          <img
                            src={file.thumbnail}
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
                          <button className="p-2 rounded-lg bg-white/10 text-purple-300 hover:bg-white/20 transition-colors">
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
            // Grid / Masonry View
            <div
              className={`grid gap-3 md:gap-6 ${viewMode === "masonry"
                ? "columns-2 md:columns-3 lg:columns-4 xl:columns-5"
                : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                }`}
            >
              {filteredFiles.map((file, index) => (
                <div
                  key={file.id}
                  draggable={!isMobile}
                  onDragStart={(e) => !isMobile && handleDragStart(e, file.id)}
                  onDragEnd={!isMobile ? handleDragEnd : undefined}
                  onTouchStart={() => handleTouchSelect(file.id)}
                  className={`image-card glass-card rounded-xl md:rounded-2xl overflow-hidden group file-item animate-bounce-in ${!isMobile ? 'cursor-grab active:cursor-grabbing' : ''} ${viewMode === "masonry" ? "break-inside-avoid mb-3 md:mb-6" : ""} ${draggingFileId === file.id ? "opacity-50 scale-95" : ""} ${selectedFiles.includes(file.id) && isMobile ? 'ring-2 ring-purple-400' : ''}`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Image/Video Container */}
                  <div
                    className="relative aspect-[4/3] overflow-hidden cursor-pointer"
                    onClick={() => openLightbox(index)}
                  >
                    <img
                      src={file.thumbnail}
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

                    {/* Selection Checkbox */}
                    <div
                      className={`absolute top-3 left-3 transition-opacity ${selectedFiles.includes(file.id)
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                        }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(file.id);
                      }}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors cursor-pointer ${selectedFiles.includes(file.id)
                          ? "bg-purple-500 text-white"
                          : "bg-black/50 border-2 border-white/50 text-transparent hover:border-purple-400"
                          }`}
                      >
                        <Check className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="p-4 space-y-3">
                    {/* File Name */}
                    <h3 className="font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                      {file.name}
                    </h3>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {file.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-full hover:bg-purple-500/30 cursor-pointer transition-colors"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-xs text-purple-200/60">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          {formatNumber(file.views)}
                        </span>
                        <span className="flex items-center gap-1">
                          <HardDrive className="w-3.5 h-3.5" />
                          {file.size}
                        </span>
                      </div>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {file.date}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2 file-actions">
                      {/* Share Button (was Save) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShareFileId(file.id);
                          setShowShareModal(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all mobile-touch-target bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-400 hover:to-emerald-400"
                      >
                        <Share2 className="w-4 h-4" />
                        <span className="text-xs font-medium hidden sm:inline">
                          Share
                        </span>
                      </button>
                      {/* Download Button */}
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-xl bg-white/10 text-purple-300 hover:bg-white/20 transition-colors mobile-touch-target"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {/* Delete Button (was Share/LINE) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFile(file.id);
                        }}
                        className="p-2 rounded-xl bg-white/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors mobile-touch-target"
                        title="ลบไฟล์"
                      >
                        <Trash2 className="w-4 h-4" />
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
                  <img
                    src={filteredFiles[lightboxIndex].thumbnail}
                    alt={filteredFiles[lightboxIndex].name}
                    className="max-w-full max-h-[85vh] object-contain"
                  />
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

          {/* Mobile Floating Action Button */}
          {isMobile && (
            <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
              {/* Selected files actions */}
              {selectedFiles.length > 0 && (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      // Share all selected files
                      if (selectedFiles.length === 1) {
                        setShareFileId(selectedFiles[0]);
                        setShowShareModal(true);
                      } else {
                        shareToLine(selectedFiles[0]);
                      }
                    }}
                    className="w-14 h-14 rounded-full line-share-btn text-white shadow-lg flex items-center justify-center"
                  >
                    <Send className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => {
                      selectedFiles.forEach(id => {
                        setAIProcessingFiles(prev => [...prev, id]);
                      });
                      setTimeout(() => {
                        alert(`🎬 AI Video Production started for ${selectedFiles.length} files!`);
                        setAIProcessingFiles([]);
                        setSelectedFiles([]);
                      }, 2000);
                    }}
                    className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg flex items-center justify-center"
                  >
                    <Wand2 className="w-6 h-6" />
                  </button>
                </div>
              )}

              {/* Main upload FAB */}
              <button
                onClick={() => setShowUploadModal(true)}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 flex items-center justify-center"
              >
                <Plus className="w-8 h-8" />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AllFilesGalleryPage;
