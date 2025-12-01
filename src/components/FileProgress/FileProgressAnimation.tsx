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
    RotateCcw,
    Loader2,
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
    speed?: number; // bytes per second
    remainingTime?: number; // seconds
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

// Format time remaining
const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
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

// Circular Progress Component with enhanced animations
const CircularProgress: React.FC<{
    progress: number;
    size?: number;
    strokeWidth?: number;
    status: FileProgressStatus;
    type: "upload" | "download";
}> = ({ progress, size = 56, strokeWidth = 4, status, type }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    const getGradientId = () => `progress-gradient-${type}-${status}`;

    const getColors = () => {
        switch (status) {
            case "success":
                return { start: "#22c55e", end: "#10b981" };
            case "error":
                return { start: "#ef4444", end: "#dc2626" };
            case "uploading":
                return { start: "#8b5cf6", end: "#ec4899" };
            case "downloading":
                return { start: "#3b82f6", end: "#06b6d4" };
            default:
                return { start: "#6b7280", end: "#4b5563" };
        }
    };

    const colors = getColors();
    const isActive = status === "uploading" || status === "downloading";

    return (
        <svg width={size} height={size} className="transform -rotate-90">
            <defs>
                <linearGradient id={getGradientId()} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={colors.start} />
                    <stop offset="100%" stopColor={colors.end} />
                </linearGradient>
                {isActive && (
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                )}
            </defs>
            {/* Background circle */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={strokeWidth}
            />
            {/* Animated background glow for active state */}
            {isActive && (
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={`url(#${getGradientId()})`}
                    strokeWidth={strokeWidth + 4}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    opacity={0.3}
                    filter="url(#glow)"
                    animate={{ opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                />
            )}
            {/* Progress circle */}
            <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={`url(#${getGradientId()})`}
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

// Animated File Icon that fills based on progress
const FillingFileIcon: React.FC<{
    progress: number;
    type: "upload" | "download";
    status: FileProgressStatus;
    fileType: string;
}> = ({ progress, type, status, fileType }) => {
    const FileIcon = getFileIcon(fileType);
    const isActive = status === "uploading" || status === "downloading";
    const isComplete = status === "success";
    const isError = status === "error";

    return (
        <div className="relative w-6 h-6">
            {/* Background icon */}
            <FileIcon className="w-6 h-6 text-white/20 absolute inset-0" />
            {/* Filled portion */}
            <div
                className="absolute inset-0 overflow-hidden"
                style={{
                    clipPath: `inset(${100 - progress}% 0 0 0)`,
                }}
            >
                <FileIcon
                    className={`w-6 h-6 ${isComplete
                            ? "text-green-400"
                            : isError
                                ? "text-red-400"
                                : type === "upload"
                                    ? "text-purple-400"
                                    : "text-blue-400"
                        }`}
                />
            </div>
            {/* Arrow animation */}
            {isActive && (
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{ y: type === "upload" ? [-8, 0] : [0, 8] }}
                    transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
                >
                    {type === "upload" ? (
                        <div className="w-2 h-2 border-t-2 border-l-2 border-purple-400 transform -rotate-45 translate-y-1" />
                    ) : (
                        <div className="w-2 h-2 border-b-2 border-r-2 border-blue-400 transform -rotate-45 -translate-y-1" />
                    )}
                </motion.div>
            )}
        </div>
    );
};

// Success Checkmark Animation
const SuccessCheckmark: React.FC = () => (
    <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
        className="relative"
    >
        <motion.div
            className="absolute inset-0 bg-green-500/30 rounded-full"
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 0.5 }}
        />
        <motion.div
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
        >
            <Check className="w-6 h-6 text-green-400" />
        </motion.div>
    </motion.div>
);

// Error X Animation
const ErrorX: React.FC = () => (
    <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
    >
        <motion.div
            animate={{ x: [-2, 2, -2, 2, 0] }}
            transition={{ duration: 0.4, delay: 0.2 }}
        >
            <X className="w-6 h-6 text-red-400" />
        </motion.div>
    </motion.div>
);

// Spinning Loader
const SpinningLoader: React.FC<{ className?: string }> = ({ className }) => (
    <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
        <Loader2 className={className || "w-5 h-5 text-white/60"} />
    </motion.div>
);

// Main File Progress Animation Component
export const FileProgressAnimation: React.FC<FileProgressAnimationProps> = ({
    item,
    onCancel,
    onRetry,
    onDismiss,
}) => {
    const isActive = item.status === "uploading" || item.status === "downloading";
    const isComplete = item.status === "success";
    const isError = item.status === "error";
    const isPending = item.status === "pending";

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`relative bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-xl 
                 rounded-2xl border p-4 shadow-2xl overflow-hidden transition-all duration-300
                 ${isComplete ? "border-green-500/30" : isError ? "border-red-500/30" : "border-white/10"}
                 hover:border-white/20`}
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

            {/* Success pulse effect */}
            {isComplete && (
                <motion.div
                    className="absolute inset-0 bg-green-500/10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.3, 0] }}
                    transition={{ duration: 0.5 }}
                />
            )}

            <div className="relative flex items-center gap-4">
                {/* Progress Circle with Icon */}
                <div className="relative flex-shrink-0">
                    <CircularProgress
                        progress={item.progress}
                        size={56}
                        strokeWidth={3}
                        status={item.status}
                        type={item.type}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            {isComplete ? (
                                <motion.div key="success">
                                    <SuccessCheckmark />
                                </motion.div>
                            ) : isError ? (
                                <motion.div key="error">
                                    <ErrorX />
                                </motion.div>
                            ) : isPending ? (
                                <motion.div key="pending">
                                    <SpinningLoader />
                                </motion.div>
                            ) : isActive ? (
                                <motion.div
                                    key="active"
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                >
                                    <FillingFileIcon
                                        progress={item.progress}
                                        type={item.type}
                                        status={item.status}
                                        fileType={item.fileType}
                                    />
                                </motion.div>
                            ) : (
                                <motion.div key="idle">
                                    <FillingFileIcon
                                        progress={0}
                                        type={item.type}
                                        status={item.status}
                                        fileType={item.fileType}
                                    />
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
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/10"
                                style={{
                                    color: item.type === "upload" ? "#a78bfa" : "#60a5fa",
                                }}
                            >
                                {item.progress}%
                            </motion.span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-white/50 text-xs">
                            {formatFileSize(item.fileSize)}
                        </p>
                        {isActive && item.speed && (
                            <span className="text-white/40 text-xs">
                                • {formatFileSize(item.speed)}/s
                            </span>
                        )}
                        {isActive && item.remainingTime && (
                            <span className="text-white/40 text-xs">
                                • {formatTime(item.remainingTime)} left
                            </span>
                        )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className={`h-full rounded-full relative ${isComplete
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
                        >
                            {/* Shimmer effect on progress bar */}
                            {isActive && (
                                <motion.div
                                    className="absolute inset-0"
                                    style={{
                                        background:
                                            "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                                    }}
                                    animate={{ x: ["-100%", "200%"] }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                            )}
                        </motion.div>
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
                                    ? "✓ อัปโหลดสำเร็จ!"
                                    : "✓ ดาวน์โหลดสำเร็จ!"
                                : isError
                                    ? item.error || "เกิดข้อผิดพลาด"
                                    : isPending
                                        ? "กำลังรอ..."
                                        : isActive
                                            ? item.type === "upload"
                                                ? "กำลังอัปโหลด..."
                                                : "กำลังดาวน์โหลด..."
                                            : "พร้อม"}
                        </motion.p>
                    </AnimatePresence>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1">
                    {isActive && onCancel && (
                        <motion.button
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onCancel(item.id)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 
                       text-white/60 hover:text-red-400 transition-all duration-200"
                            title="ยกเลิก"
                        >
                            <X className="w-4 h-4" />
                        </motion.button>
                    )}
                    {isError && onRetry && (
                        <motion.button
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            whileHover={{ scale: 1.1, rotate: -180 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onRetry(item.id)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-purple-500/20 
                       text-white/60 hover:text-purple-400 transition-all duration-200"
                            title="ลองใหม่"
                        >
                            <RotateCcw className="w-4 h-4" />
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
                            title="ปิด"
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
                            "linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)",
                    }}
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
            )}

            {/* Particles effect on complete */}
            {isComplete && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-green-400 rounded-full"
                            style={{
                                left: `${20 + i * 12}%`,
                                bottom: "50%",
                            }}
                            initial={{ y: 0, opacity: 1, scale: 1 }}
                            animate={{
                                y: -30 - Math.random() * 20,
                                x: (Math.random() - 0.5) * 40,
                                opacity: 0,
                                scale: 0,
                            }}
                            transition={{
                                duration: 0.6,
                                delay: i * 0.05,
                                ease: "easeOut",
                            }}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default FileProgressAnimation;
