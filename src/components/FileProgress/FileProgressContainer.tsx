"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileProgressAnimation,
    type FileProgressItem,
} from "./FileProgressAnimation";
import { Upload, Download, X, Minimize2, Maximize2 } from "lucide-react";

interface FileProgressContainerProps {
    items: FileProgressItem[];
    onCancel?: (id: string) => void;
    onRetry?: (id: string) => void;
    onDismiss?: (id: string) => void;
    onClearAll?: () => void;
    position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
}

export const FileProgressContainer: React.FC<FileProgressContainerProps> = ({
    items,
    onCancel,
    onRetry,
    onDismiss,
    onClearAll,
    position = "bottom-right",
}) => {
    const [isMinimized, setIsMinimized] = React.useState(false);

    const uploadItems = items.filter((i) => i.type === "upload");
    const downloadItems = items.filter((i) => i.type === "download");
    const activeCount = items.filter(
        (i) => i.status === "uploading" || i.status === "downloading"
    ).length;
    const completedCount = items.filter((i) => i.status === "success").length;
    const errorCount = items.filter((i) => i.status === "error").length;

    const positionClasses = {
        "bottom-right": "bottom-4 right-4",
        "bottom-left": "bottom-4 left-4",
        "top-right": "top-4 right-4",
        "top-left": "top-4 left-4",
    };

    if (items.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className={`fixed ${positionClasses[position]} z-50 w-96 max-w-[calc(100vw-2rem)]`}
        >
            {/* Header */}
            <motion.div
                layout
                className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-t-2xl border border-white/10 
                   border-b-0 px-4 py-3 flex items-center justify-between"
            >
                <div className="flex items-center gap-3">
                    {/* Status indicators */}
                    <div className="flex items-center gap-2">
                        {uploadItems.length > 0 && (
                            <div className="flex items-center gap-1.5 text-purple-400">
                                <Upload className="w-4 h-4" />
                                <span className="text-xs font-medium">{uploadItems.length}</span>
                            </div>
                        )}
                        {downloadItems.length > 0 && (
                            <div className="flex items-center gap-1.5 text-blue-400">
                                <Download className="w-4 h-4" />
                                <span className="text-xs font-medium">{downloadItems.length}</span>
                            </div>
                        )}
                    </div>

                    {/* Progress summary */}
                    <div className="text-xs text-white/50">
                        {activeCount > 0 && (
                            <span className="text-white/70">{activeCount} active</span>
                        )}
                        {completedCount > 0 && (
                            <span className="text-green-400 ml-2">✓ {completedCount}</span>
                        )}
                        {errorCount > 0 && (
                            <span className="text-red-400 ml-2">✕ {errorCount}</span>
                        )}
                    </div>
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
                        transition={{ duration: 0.2 }}
                        className="bg-slate-900/95 backdrop-blur-xl rounded-b-2xl border border-white/10 
                       border-t-0 overflow-hidden"
                    >
                        <div className="max-h-80 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                            <AnimatePresence mode="popLayout">
                                {items.map((item) => (
                                    <FileProgressAnimation
                                        key={item.id}
                                        item={item}
                                        onCancel={onCancel}
                                        onRetry={onRetry}
                                        onDismiss={onDismiss}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Minimized progress bar */}
            {isMinimized && activeCount > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-slate-900/95 rounded-b-2xl border border-white/10 border-t-0 p-3"
                >
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"
                            style={{ backgroundSize: "200% 100%" }}
                            animate={{
                                width: `${(items.reduce((acc, i) => acc + i.progress, 0) / items.length).toFixed(0)}%`,
                                backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"],
                            }}
                            transition={{
                                width: { duration: 0.3 },
                                backgroundPosition: { duration: 2, repeat: Infinity, ease: "linear" },
                            }}
                        />
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default FileProgressContainer;
