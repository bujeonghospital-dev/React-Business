"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Upload,
    Download,
    Check,
    X,
    File,
    Image,
    Film,
    FileText,
    Music,
    Archive,
} from "lucide-react";

// Types
export type FileProgressStatus =
    | "idle"
    | "pending"
    | "uploading"
    | "downloading"
    | "success"
    | "error";

export interface FileProgressItem {
    id: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    progress: number;
    status: FileProgressStatus;
    error?: string;
    type: "upload" | "download";
}

interface FileProgressAnimationProps {
    item: FileProgressItem;
    onCancel?: (id: string) => void;
    onRetry?: (id: string) => void;
    onDismiss?: (id: string) => void;
}

// Helper to format file size
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

// Get file icon based on type
const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return Image;
    if (fileType.startsWith("video/")) return Film;
    if (fileType.startsWith("audio/")) return Music;
    if (fileType.startsWith("text/")) return FileText;
    if (
        fileType.includes("zip") ||
        fileType.includes("rar") ||
        fileType.includes("tar")
    )
        return Archive;
    return File;
};

// Circular Progress Component
const CircularProgress: React.FC<{
    progress: number;
    size?: number;
    strokeWidth?: number;
    status: FileProgressStatus;
}> = ({ progress, size = 48, strokeWidth = 4, status }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    const getColor = () => {
        switch (status) {
            case "success":
                return "#22c55e";
            case "error":
                return "#ef4444";
            case "uploading":
                return "#8b5cf6";
            case "downloading":
                return "#3b82f6";
            default:
                return "#6b7280";
        }
    };

    return (
        <svg width={size} height={size} className="transform -rotate-90">
            {/* Background circle */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={strokeWidth}
            />
            {/* Progress circle */}
            <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={getColor()}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 0.3, ease: "easeOut" }}
            />
        </svg>
    );
};

// Main File Progress Animation Component
export const FileProgressAnimation: React.FC<FileProgressAnimationProps> = ({
    item,
    onCancel,
    onRetry,
    onDismiss,
}) => {
    const FileIcon = getFileIcon(item.fileType);
    const isActive = item.status === "uploading" || item.status === "downloading";
    const isComplete = item.status === "success";
    const isError = item.status === "error";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-xl 
                 rounded-2xl border border-white/10 p-4 shadow-2xl overflow-hidden
                 hover:border-white/20 transition-all duration-300"
        >
            {/* Animated background gradient */}
            {isActive && (
                <motion.div
                    className="absolute inset-0 opacity-20"
                    style={{
                        background:
                            item.type === "upload"
                                ? "linear-gradient(90deg, #8b5cf6, #ec4899, #8b5cf6)"
                                : "linear-gradient(90deg, #3b82f6, #06b6d4, #3b82f6)",
                        backgroundSize: "200% 100%",
                    }}
                    animate={{ backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
            )}

            <div className="relative flex items-center gap-4">
                {/* Progress Circle with Icon */}
                <div className="relative">
                    <CircularProgress
                        progress={item.progress}
                        size={56}
                        strokeWidth={3}
                        status={item.status}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            {isComplete ? (
                                <motion.div
                                    key="success"
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    exit={{ scale: 0 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                >
                                    <Check className="w-6 h-6 text-green-400" />
                                </motion.div>
                            ) : isError ? (
                                <motion.div
                                    key="error"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                >
                                    <X className="w-6 h-6 text-red-400" />
                                </motion.div>
                            ) : isActive ? (
                                <motion.div
                                    key="active"
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                >
                                    {item.type === "upload" ? (
                                        <motion.div
                                            animate={{ y: [-2, 2, -2] }}
                                            transition={{ duration: 0.8, repeat: Infinity }}
                                        >
                                            <Upload className="w-5 h-5 text-purple-400" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            animate={{ y: [2, -2, 2] }}
                                            transition={{ duration: 0.8, repeat: Infinity }}
                                        >
                                            <Download className="w-5 h-5 text-blue-400" />
                                        </motion.div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div key="idle">
                                    <FileIcon className="w-5 h-5 text-gray-400" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="text-white font-medium truncate text-sm">
                            {item.fileName}
                        </p>
                        {isActive && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-xs text-white/60"
                            >
                                {item.progress}%
                            </motion.span>
                        )}
                    </div>
                    <p className="text-white/50 text-xs mt-0.5">
                        {formatFileSize(item.fileSize)}
                    </p>

                    {/* Progress Bar */}
                    <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className={`h-full rounded-full ${isComplete
                                    ? "bg-gradient-to-r from-green-400 to-emerald-500"
                                    : isError
                                        ? "bg-gradient-to-r from-red-400 to-rose-500"
                                        : item.type === "upload"
                                            ? "bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"
                                            : "bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500"
                                }`}
                            style={{
                                backgroundSize: isActive ? "200% 100%" : "100% 100%",
                            }}
                            initial={{ width: 0 }}
                            animate={{
                                width: `${item.progress}%`,
                                backgroundPosition: isActive
                                    ? ["0% 0%", "100% 0%", "0% 0%"]
                                    : "0% 0%",
                            }}
                            transition={{
                                width: { duration: 0.3, ease: "easeOut" },
                                backgroundPosition: {
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "linear",
                                },
                            }}
                        />
                    </div>

                    {/* Status Text */}
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={item.status}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className={`text-xs mt-1.5 ${isComplete
                                    ? "text-green-400"
                                    : isError
                                        ? "text-red-400"
                                        : "text-white/40"
                                }`}
                        >
                            {isComplete
                                ? item.type === "upload"
                                    ? "Upload complete!"
                                    : "Download complete!"
                                : isError
                                    ? item.error || "An error occurred"
                                    : isActive
                                        ? item.type === "upload"
                                            ? "Uploading..."
                                            : "Downloading..."
                                        : "Waiting..."}
                        </motion.p>
                    </AnimatePresence>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                    {isActive && onCancel && (
                        <motion.button
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onCancel(item.id)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 
                       text-white/60 hover:text-red-400 transition-all duration-200"
                        >
                            <X className="w-4 h-4" />
                        </motion.button>
                    )}
                    {isError && onRetry && (
                        <motion.button
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onRetry(item.id)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-purple-500/20 
                       text-white/60 hover:text-purple-400 transition-all duration-200"
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                                ↻
                            </motion.div>
                        </motion.button>
                    )}
                    {(isComplete || isError) && onDismiss && (
                        <motion.button
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onDismiss(item.id)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 
                       text-white/60 hover:text-white transition-all duration-200"
                        >
                            <X className="w-4 h-4" />
                        </motion.button>
                    )}
                </div>
            </div>

            {/* Shimmer effect for active state */}
            {isActive && (
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background:
                            "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)",
                    }}
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
            )}
        </motion.div>
    );
};

export default FileProgressAnimation;
