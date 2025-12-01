"use client";
import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileProgressAnimation,
    type FileProgressItem,
} from "./FileProgressAnimation";
import { Upload, Download, X, Minimize2, Maximize2, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface FileProgressContainerProps {
    items: FileProgressItem[];
    onCancel?: (id: string) => void;
    onRetry?: (id: string) => void;
    onDismiss?: (id: string) => void;
    onClearAll?: () => void;
    position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
    autoDismissDelay?: number; // Auto dismiss after all complete (ms), default 2000
}

export const FileProgressContainer: React.FC<FileProgressContainerProps> = ({
    items,
    onCancel,
    onRetry,
    onDismiss,
    onClearAll,
    position = "bottom-right",
    autoDismissDelay = 2000,
}) => {
    const [isMinimized, setIsMinimized] = React.useState(false);
    const autoDismissTimerRef = useRef<NodeJS.Timeout | null>(null);

    const uploadItems = items.filter((i) => i.type === "upload");
    const downloadItems = items.filter((i) => i.type === "download");
    const activeCount = items.filter(
        (i) => i.status === "uploading" || i.status === "downloading"
    ).length;
    const completedCount = items.filter((i) => i.status === "success").length;
    const errorCount = items.filter((i) => i.status === "error").length;

    // Auto dismiss when all items are complete (success only, not errors)
    useEffect(() => {
        // Clear any existing timer
        if (autoDismissTimerRef.current) {
            clearTimeout(autoDismissTimerRef.current);
            autoDismissTimerRef.current = null;
        }

        // Check if all items are complete with no errors and no active transfers
        const allSuccess = items.length > 0 &&
            activeCount === 0 &&
            errorCount === 0 &&
            completedCount === items.length;

        if (allSuccess && onClearAll && autoDismissDelay > 0) {
            autoDismissTimerRef.current = setTimeout(() => {
                onClearAll();
            }, autoDismissDelay);
        }

        return () => {
            if (autoDismissTimerRef.current) {
                clearTimeout(autoDismissTimerRef.current);
            }
        };
    }, [items.length, activeCount, errorCount, completedCount, onClearAll, autoDismissDelay]);

    // Calculate overall progress
    const overallProgress = items.length > 0
        ? Math.round(items.reduce((acc, i) => acc + i.progress, 0) / items.length)
        : 0;

    const positionClasses = {
        "bottom-right": "bottom-4 right-4",
        "bottom-left": "bottom-4 left-4",
        "top-right": "top-4 right-4",
        "top-left": "top-4 left-4",
    };

    if (items.length === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`fixed ${positionClasses[position]} z-50 w-96 max-w-[calc(100vw-2rem)]`}
            >
                {/* Header */}
                <motion.div
                    layout
                    className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-t-2xl 
                       border border-white/10 border-b-0 px-4 py-3 flex items-center justify-between
                       shadow-lg shadow-black/20"
                >
                    <div className="flex items-center gap-3">
                        {/* Animated status icon */}
                        <div className="relative">
                            {activeCount > 0 ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                >
                                    <Loader2 className="w-5 h-5 text-purple-400" />
                                </motion.div>
                            ) : completedCount > 0 && errorCount === 0 ? (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 500 }}
                                >
                                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                                </motion.div>
                            ) : errorCount > 0 ? (
                                <motion.div
                                    animate={{ x: [-1, 1, -1] }}
                                    transition={{ duration: 0.2, repeat: 3 }}
                                >
                                    <AlertCircle className="w-5 h-5 text-red-400" />
                                </motion.div>
                            ) : null}
                        </div>

                        {/* Status indicators */}
                        <div className="flex items-center gap-2">
                            {uploadItems.length > 0 && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-purple-500/20"
                                >
                                    <Upload className="w-3.5 h-3.5 text-purple-400" />
                                    <span className="text-xs font-medium text-purple-300">{uploadItems.length}</span>
                                </motion.div>
                            )}
                            {downloadItems.length > 0 && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-500/20"
                                >
                                    <Download className="w-3.5 h-3.5 text-blue-400" />
                                    <span className="text-xs font-medium text-blue-300">{downloadItems.length}</span>
                                </motion.div>
                            )}
                        </div>

                        {/* Progress summary */}
                        {activeCount > 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-xs text-white/50"
                            >
                                {overallProgress}%
                            </motion.div>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsMinimized(!isMinimized)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                        >
                            {isMinimized ? (
                                <Maximize2 className="w-4 h-4" />
                            ) : (
                                <Minimize2 className="w-4 h-4" />
                            )}
                        </motion.button>
                        {onClearAll && items.every((i) => i.status === "success" || i.status === "error") && (
                            <motion.button
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onClearAll}
                                className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </motion.button>
                        )}
                    </div>
                </motion.div>

                {/* Content */}
                <AnimatePresence>
                    {!isMinimized && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="bg-slate-900/95 backdrop-blur-xl rounded-b-2xl border border-white/10 
                           border-t-0 overflow-hidden shadow-2xl shadow-black/30"
                        >
                            <div className="max-h-80 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                                <AnimatePresence mode="popLayout">
                                    {items.map((item, index) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 50 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <FileProgressAnimation
                                                item={item}
                                                onCancel={onCancel}
                                                onRetry={onRetry}
                                                onDismiss={onDismiss}
                                            />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {/* Summary footer */}
                            {items.length > 1 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="px-4 py-2 border-t border-white/5 bg-slate-900/50"
                                >
                                    <div className="flex items-center justify-between text-xs text-white/40">
                                        <span>รวม {items.length} รายการ</span>
                                        <div className="flex items-center gap-3">
                                            {completedCount > 0 && (
                                                <span className="text-green-400">✓ {completedCount} สำเร็จ</span>
                                            )}
                                            {errorCount > 0 && (
                                                <span className="text-red-400">✕ {errorCount} ล้มเหลว</span>
                                            )}
                                            {activeCount > 0 && (
                                                <span className="text-purple-400">◎ {activeCount} กำลังดำเนินการ</span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Minimized progress bar */}
                {isMinimized && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-slate-900/95 backdrop-blur-xl rounded-b-2xl border border-white/10 border-t-0 p-3"
                    >
                        {activeCount > 0 ? (
                            <>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 relative"
                                        style={{ backgroundSize: "200% 100%" }}
                                        animate={{
                                            width: `${overallProgress}%`,
                                            backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"],
                                        }}
                                        transition={{
                                            width: { duration: 0.3 },
                                            backgroundPosition: { duration: 2, repeat: Infinity, ease: "linear" },
                                        }}
                                    >
                                        {/* Shimmer */}
                                        <motion.div
                                            className="absolute inset-0"
                                            style={{
                                                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                                            }}
                                            animate={{ x: ["-100%", "200%"] }}
                                            transition={{ duration: 1, repeat: Infinity }}
                                        />
                                    </motion.div>
                                </div>
                                <p className="text-xs text-white/40 mt-1.5 text-center">
                                    {activeCount} รายการ • {overallProgress}%
                                </p>
                            </>
                        ) : (
                            <div className="flex items-center justify-center gap-2 text-xs">
                                {completedCount > 0 && (
                                    <span className="text-green-400">✓ {completedCount} สำเร็จ</span>
                                )}
                                {errorCount > 0 && (
                                    <span className="text-red-400">✕ {errorCount} ล้มเหลว</span>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>
    );
};

export default FileProgressContainer;
