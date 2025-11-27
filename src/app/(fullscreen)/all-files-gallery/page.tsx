"use client";
import React, { useState, useEffect, useMemo } from "react";
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
`;

// Mock data สำหรับตัวอย่าง
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

const mockFiles: FileItem[] = [
  {
    id: 1,
    name: "Before-After-001.jpg",
    type: "image",
    url: "/images/sample1.jpg",
    thumbnail: "https://picsum.photos/seed/1/400/300",
    size: "2.4 MB",
    date: "2025-11-25",
    tags: ["Before/After", "Face"],
    favorite: true,
    views: 1250,
    category: "Before/After",
  },
  {
    id: 2,
    name: "Surgery-Video-001.mp4",
    type: "video",
    url: "/videos/sample1.mp4",
    thumbnail: "https://picsum.photos/seed/2/400/300",
    size: "45.8 MB",
    date: "2025-11-24",
    tags: ["Surgery", "Training"],
    favorite: false,
    views: 890,
    duration: "12:45",
    category: "Surgery Videos",
  },
  {
    id: 3,
    name: "Promo-Clip-001.mp4",
    type: "clip",
    url: "/clips/sample1.mp4",
    thumbnail: "https://picsum.photos/seed/3/400/300",
    size: "15.2 MB",
    date: "2025-11-23",
    tags: ["Promotion", "Social"],
    favorite: true,
    views: 2340,
    duration: "00:45",
    category: "Promo Clips",
  },
  {
    id: 4,
    name: "Patient-Photo-002.jpg",
    type: "image",
    url: "/images/sample2.jpg",
    thumbnail: "https://picsum.photos/seed/4/400/300",
    size: "1.8 MB",
    date: "2025-11-22",
    tags: ["Patient", "Consultation"],
    favorite: false,
    views: 560,
    category: "Consultations",
  },
  {
    id: 5,
    name: "Training-Video-002.mp4",
    type: "video",
    url: "/videos/sample2.mp4",
    thumbnail: "https://picsum.photos/seed/5/400/300",
    size: "89.4 MB",
    date: "2025-11-21",
    tags: ["Training", "Medical"],
    favorite: true,
    views: 1890,
    duration: "28:30",
    category: "Training",
  },
  {
    id: 6,
    name: "Social-Clip-002.mp4",
    type: "clip",
    url: "/clips/sample2.mp4",
    thumbnail: "https://picsum.photos/seed/6/400/300",
    size: "8.5 MB",
    date: "2025-11-20",
    tags: ["Social", "TikTok"],
    favorite: false,
    views: 4560,
    duration: "00:30",
    category: "Social Media",
  },
  {
    id: 7,
    name: "Before-After-003.jpg",
    type: "image",
    url: "/images/sample3.jpg",
    thumbnail: "https://picsum.photos/seed/7/400/300",
    size: "3.1 MB",
    date: "2025-11-19",
    tags: ["Before/After", "Body"],
    favorite: true,
    views: 980,
    category: "Before/After",
  },
  {
    id: 8,
    name: "Clinic-Tour.mp4",
    type: "video",
    url: "/videos/sample3.mp4",
    thumbnail: "https://picsum.photos/seed/8/400/300",
    size: "156.7 MB",
    date: "2025-11-18",
    tags: ["Tour", "Marketing"],
    favorite: false,
    views: 3200,
    duration: "05:20",
    category: "Marketing",
  },
  {
    id: 9,
    name: "Testimonial-001.mp4",
    type: "clip",
    url: "/clips/sample3.mp4",
    thumbnail: "https://picsum.photos/seed/9/400/300",
    size: "22.3 MB",
    date: "2025-11-17",
    tags: ["Testimonial", "Review"],
    favorite: true,
    views: 1560,
    duration: "01:15",
    category: "Testimonials",
  },
  {
    id: 10,
    name: "Product-Photo-001.jpg",
    type: "image",
    url: "/images/sample4.jpg",
    thumbnail: "https://picsum.photos/seed/10/400/300",
    size: "4.2 MB",
    date: "2025-11-16",
    tags: ["Product", "Catalog"],
    favorite: false,
    views: 670,
    category: "Products",
  },
  {
    id: 11,
    name: "Event-Highlight.mp4",
    type: "video",
    url: "/videos/sample4.mp4",
    thumbnail: "https://picsum.photos/seed/11/400/300",
    size: "234.5 MB",
    date: "2025-11-15",
    tags: ["Event", "Highlight"],
    favorite: true,
    views: 5670,
    duration: "15:00",
    category: "Events",
  },
  {
    id: 12,
    name: "Instagram-Reel-001.mp4",
    type: "clip",
    url: "/clips/sample4.mp4",
    thumbnail: "https://picsum.photos/seed/12/400/300",
    size: "12.8 MB",
    date: "2025-11-14",
    tags: ["Instagram", "Reel"],
    favorite: false,
    views: 8900,
    duration: "00:60",
    category: "Social Media",
  },
];

interface SubFolder {
  id: string;
  name: string;
  fileIds: number[];
}

interface MediaFolder {
  id: string;
  name: string;
  description: string;
  gradient: string;
  icon: LucideIcon;
  subFolders: SubFolder[];
}

type MediaFolderTemplate = Omit<MediaFolder, "subFolders">;

const folderTemplates: MediaFolderTemplate[] = [
  {
    id: "ad-content",
    name: "Ad Content",
    description: "Campaign-ready media assets",
    gradient: "from-fuchsia-500 to-rose-500",
    icon: Megaphone,
  },
  {
    id: "customer-reviews",
    name: "Customer Reviews",
    description: "Testimonials & consultation highlights",
    gradient: "from-amber-500 to-pink-500",
    icon: MessageSquareQuote,
  },
  {
    id: "branding",
    name: "Branding",
    description: "Before/After & product visuals",
    gradient: "from-emerald-500 to-lime-500",
    icon: Sparkles,
  },
  {
    id: "presentations",
    name: "Presentations",
    description: "Slides, events & keynote clips",
    gradient: "from-sky-500 to-indigo-500",
    icon: Presentation,
  },
  {
    id: "all-footages",
    name: "All Footages",
    description: "Training & raw recordings",
    gradient: "from-purple-500 to-blue-500",
    icon: Film,
  },
  {
    id: "other-files",
    name: "Other Files",
    description: "Miscellaneous resources",
    gradient: "from-slate-500 to-gray-600",
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

const createInitialFolders = (mediaFiles: FileItem[]): MediaFolder[] => {
  const templateMap = new Map<string, MediaFolder>();
  folderTemplates.forEach((template) => {
    templateMap.set(template.id, { ...template, subFolders: [] });
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
      };
      folder.subFolders.push(subFolder);
    }

    if (!subFolder.fileIds.includes(file.id)) {
      subFolder.fileIds.push(file.id);
    }
  });

  return folderTemplates.map((template) => templateMap.get(template.id)!);
};
const AllFilesGalleryPage = () => {
  const router = useRouter();
  const [files, setFiles] = useState<FileItem[]>(mockFiles);
  const [isLoading, setIsLoading] = useState(false);
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
    createInitialFolders(mockFiles)
  );
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [activeSubFolderId, setActiveSubFolderId] = useState<string | null>(
    null
  );
  const [isCreatingSubFolder, setIsCreatingSubFolder] = useState(false);
  const [subFolderDraftName, setSubFolderDraftName] = useState("");
  const [editingSubFolderId, setEditingSubFolderId] = useState<string | null>(
    null
  );
  const [editingSubFolderValue, setEditingSubFolderValue] = useState("");

  // Categories สำหรับ filter
  const categories = useMemo(() => {
    const cats = new Set(files.map((f) => f.category));
    return ["all", ...Array.from(cats)];
  }, [files]);

  const activeFolder = useMemo(() => {
    if (!activeFolderId) return null;
    return folders.find((folder) => folder.id === activeFolderId) || null;
  }, [activeFolderId, folders]);

  const visibleFileIdSet = useMemo(() => {
    if (!activeFolder) {
      return new Set(files.map((file) => file.id));
    }

    if (activeSubFolderId) {
      const target = activeFolder.subFolders.find(
        (sub) => sub.id === activeSubFolderId
      );
      return new Set(target ? target.fileIds : []);
    }

    const allIds = activeFolder.subFolders.flatMap((sub) => sub.fileIds);
    return new Set(allIds);
  }, [activeFolder, activeSubFolderId, files]);

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
      setActiveSubFolderId(null);
    } else {
      setActiveFolderId(folderId);
      setActiveSubFolderId(null);
    }

    setIsCreatingSubFolder(false);
    setSubFolderDraftName("");
    setEditingSubFolderId(null);
    setEditingSubFolderValue("");
    setSelectedCategory("all");
  };

  const handleSubFolderSelect = (subFolderId: string) => {
    setActiveSubFolderId((prev) => (prev === subFolderId ? null : subFolderId));
  };

  const handleCreateSubFolder = () => {
    if (!activeFolderId) return;
    const trimmedName = subFolderDraftName.trim();
    if (!trimmedName) return;

    const folder = folders.find((item) => item.id === activeFolderId);
    if (!folder) return;

    const hasDuplicate = folder.subFolders.some(
      (sub) => sub.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (hasDuplicate) {
      alert("This sub folder name is already in use.");
      return;
    }

    const newSubFolder: SubFolder = {
      id: `${folder.id}-${slugify(trimmedName)}-${Date.now()}`,
      name: trimmedName,
      fileIds: [],
    };

    setFolders((prev) =>
      prev.map((item) =>
        item.id === folder.id
          ? { ...item, subFolders: [...item.subFolders, newSubFolder] }
          : item
      )
    );

    setSubFolderDraftName("");
    setIsCreatingSubFolder(false);
  };

  const handleDeleteSubFolder = (subFolderId: string) => {
    if (!activeFolderId) return;
    const folder = folders.find((item) => item.id === activeFolderId);
    if (!folder) return;

    const target = folder.subFolders.find((sub) => sub.id === subFolderId);
    if (!target) return;

    if (target.fileIds.length > 0) {
      alert("Remove or reassign files before deleting this sub folder.");
      return;
    }

    setFolders((prev) =>
      prev.map((item) =>
        item.id === activeFolderId
          ? {
              ...item,
              subFolders: item.subFolders.filter((sub) => sub.id !== subFolderId),
            }
          : item
      )
    );

    if (activeSubFolderId === subFolderId) {
      setActiveSubFolderId(null);
    }
  };

  const handleStartEditSubFolder = (subFolder: SubFolder) => {
    setEditingSubFolderId(subFolder.id);
    setEditingSubFolderValue(subFolder.name);
  };

  const handleCancelEditSubFolder = () => {
    setEditingSubFolderId(null);
    setEditingSubFolderValue("");
  };

  const handleSaveSubFolderName = (subFolderId: string) => {
    if (!activeFolderId) return;
    const trimmedValue = editingSubFolderValue.trim();
    if (!trimmedValue) return;

    const folder = folders.find((item) => item.id === activeFolderId);
    if (!folder) return;

    const hasDuplicate = folder.subFolders.some(
      (sub) =>
        sub.id !== subFolderId &&
        sub.name.toLowerCase() === trimmedValue.toLowerCase()
    );

    if (hasDuplicate) {
      alert("This sub folder name is already in use.");
      return;
    }

    setFolders((prev) =>
      prev.map((item) => {
        if (item.id !== activeFolderId) {
          return item;
        }

        return {
          ...item,
          subFolders: item.subFolders.map((sub) =>
            sub.id === subFolderId ? { ...sub, name: trimmedValue } : sub
          ),
        };
      })
    );

    setEditingSubFolderId(null);
    setEditingSubFolderValue("");
  };

  const getFolderFileCount = (folder: MediaFolder) =>
    folder.subFolders.reduce((acc, sub) => acc + sub.fileIds.length, 0);

  const toggleFavorite = (id: number) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, favorite: !f.favorite } : f))
    );
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

  return (
    <>
      <style>{customScrollbarStyle}</style>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
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
                background: `linear-gradient(135deg, ${
                  ["#8b5cf6", "#ec4899", "#f97316", "#06b6d4"][i % 4]
                }, transparent)`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 p-6">
          {/* Header Section */}
          <div className="mb-8">
            {/* Back Button */}
            <button
              onClick={() => router.push("/home")}
              className="group flex items-center gap-3 px-5 py-2.5 mb-6 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">กลับไปหน้าหลัก</span>
            </button>

            {/* Title Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/50 animate-pulse-glow">
                    <FolderOpen className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 animate-gradient-shift">
                      รวม File ทั้งหมด
                    </h1>
                    <p className="text-lg text-purple-200/80 mt-1">
                      📸 Clip รูป • วิดีโอ • ไฟล์มีเดียทั้งหมด
                    </p>
                  </div>
                </div>
              </div>
              <UserMenu />
            </div>
          </div>

          {/* Folder Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {folders.map((folder) => {
              const Icon = folder.icon;
              const isActive = activeFolderId === folder.id;
              const fileCount = getFolderFileCount(folder);
              const subFolderCount = folder.subFolders.length;

              return (
                <button
                  key={folder.id}
                  onClick={() => handleFolderSelect(folder.id)}
                  className={`glass-card rounded-2xl p-4 text-left transition-all duration-300 hover:scale-105 border ${
                    isActive
                      ? "border-purple-400/70 shadow-purple-500/40"
                      : "border-white/10 hover:border-purple-300/40"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${folder.gradient} flex items-center justify-center mb-4 shadow-lg`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-xl font-semibold text-white">
                    {folder.name}
                  </div>
                  <p className="text-sm text-purple-200/70 mt-1">
                    {folder.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-purple-100/70 mt-4">
                    <span>{subFolderCount} sub folders</span>
                    <span>{fileCount} files</span>
                  </div>
                </button>
              );
            })}
          </div>

          {activeFolder ? (
            <div className="glass-card rounded-2xl p-5 mb-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {activeFolder.name} Sub Folders
                  </h3>
                  <p className="text-sm text-purple-200/70">
                    Select a sub folder to filter files or create a new one to
                    organize upcoming assets.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setActiveSubFolderId(null)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      activeSubFolderId
                        ? "bg-white/10 text-purple-100 hover:bg-white/20"
                        : "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                    }`}
                  >
                    View All Files
                  </button>
                  <button
                    onClick={() => {
                      setIsCreatingSubFolder((prev) => !prev);
                      setSubFolderDraftName("");
                      setEditingSubFolderId(null);
                      setEditingSubFolderValue("");
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                    {isCreatingSubFolder ? "ยกเลิก" : "สร้างโฟลเดอร์ย่อย"}
                  </button>
                </div>
              </div>

              {isCreatingSubFolder && (
                <div className="mt-4 flex flex-col md:flex-row gap-3">
                  <input
                    type="text"
                    value={subFolderDraftName}
                    onChange={(e) => setSubFolderDraftName(e.target.value)}
                    placeholder="ตั้งชื่อโฟลเดอร์ย่อย"
                    className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={handleCreateSubFolder}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-400 hover:to-emerald-500 shadow-lg"
                  >
                    สร้าง
                  </button>
                </div>
              )}

              <div className="mt-5 flex flex-col gap-3">
                {activeFolder.subFolders.length === 0 ? (
                  <p className="text-sm text-purple-200/70">
                    ยังไม่มีโฟลเดอร์ย่อยสำหรับหมวดนี้
                  </p>
                ) : (
                  activeFolder.subFolders.map((subFolder) => {
                    const isSelected = activeSubFolderId === subFolder.id;
                    const isEditing = editingSubFolderId === subFolder.id;

                    return (
                      <div
                        key={subFolder.id}
                        className={`flex flex-col md:flex-row md:items-center gap-3 p-3 rounded-2xl border transition-all ${
                          isSelected
                            ? "border-purple-400 bg-white/15"
                            : "border-white/10 bg-white/5"
                        }`}
                      >
                        {isEditing ? (
                          <div className="flex-1 flex flex-col md:flex-row gap-3">
                            <input
                              type="text"
                              value={editingSubFolderValue}
                              onChange={(e) =>
                                setEditingSubFolderValue(e.target.value)
                              }
                              className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSaveSubFolderName(subFolder.id)}
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm"
                              >
                                บันทึก
                              </button>
                              <button
                                onClick={handleCancelEditSubFolder}
                                className="px-4 py-2 rounded-xl bg-white/10 text-purple-100 text-sm"
                              >
                                ยกเลิก
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 flex items-center gap-3">
                            <button
                              onClick={() => handleSubFolderSelect(subFolder.id)}
                              className="flex-1 text-left"
                            >
                              <div className="text-white font-semibold">
                                {subFolder.name}
                              </div>
                              <div className="text-xs text-purple-200/70">
                                {subFolder.fileIds.length} ไฟล์
                              </div>
                            </button>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleStartEditSubFolder(subFolder)}
                                className="p-2 rounded-lg bg-white/10 text-purple-100 hover:bg-white/20"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteSubFolder(subFolder.id)}
                                className="p-2 rounded-lg bg-white/10 text-red-200 hover:bg-red-500/20"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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
            <div className="glass-card rounded-2xl p-5 mb-8 text-purple-200/80 text-sm">
              เลือกโฟลเดอร์ด้านบนเพื่อจัดการโฟลเดอร์ย่อยและแสดงไฟล์เฉพาะหมวดนั้น
            </div>
          )}

          {/* Control Bar */}
          <div className="glass-card rounded-2xl p-4 mb-6">
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
                    className={`p-2.5 rounded-lg transition-all ${
                      viewMode === mode
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
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                          filterType === value
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
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                  showFavoritesOnly
                    ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-pink-500/30"
                    : "bg-white/10 text-purple-300 hover:bg-white/20"
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${
                    showFavoritesOnly ? "fill-current" : ""
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

              <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl transition-all shadow-lg">
                <Upload className="w-4 h-4" />
                <span className="font-medium">อัพโหลด</span>
              </button>
            </div>

            {/* Results Info */}
            <div className="mt-4 flex items-center justify-between text-sm text-purple-200/60">
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
            <div className="glass-card rounded-2xl overflow-hidden">
              <table className="w-full">
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
                      className="border-b border-purple-500/10 hover:bg-white/5 transition-colors group file-item"
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
                            className={`p-2 rounded-lg transition-colors ${
                              file.favorite
                                ? "bg-pink-500/20 text-pink-400"
                                : "bg-white/10 text-purple-300 hover:bg-white/20"
                            }`}
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                file.favorite ? "fill-current" : ""
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
              className={`grid gap-6 ${
                viewMode === "masonry"
                  ? "columns-2 md:columns-3 lg:columns-4 xl:columns-5"
                  : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
              }`}
            >
              {filteredFiles.map((file, index) => (
                <div
                  key={file.id}
                  className={`image-card glass-card rounded-2xl overflow-hidden group file-item animate-bounce-in ${
                    viewMode === "masonry" ? "break-inside-avoid mb-6" : ""
                  }`}
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
                      className={`absolute top-3 left-3 transition-opacity ${
                        selectedFiles.includes(file.id)
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(file.id);
                      }}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                          selectedFiles.includes(file.id)
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
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(file.id);
                        }}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
                          file.favorite
                            ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white"
                            : "bg-white/10 text-purple-300 hover:bg-white/20"
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            file.favorite ? "fill-current" : ""
                          }`}
                        />
                        <span className="text-xs font-medium">
                          {file.favorite ? "Saved" : "Save"}
                        </span>
                      </button>
                      <button className="p-2 rounded-xl bg-white/10 text-purple-300 hover:bg-white/20 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-xl bg-white/10 text-purple-300 hover:bg-white/20 transition-colors">
                        <Share2 className="w-4 h-4" />
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
        </div>
      </div>
    </>
  );
};

export default AllFilesGalleryPage;
