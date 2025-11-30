"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, AlertCircle, Info, Download, Upload, CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning" | "upload" | "download";

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
    progress?: number;
    showProgress?: boolean;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, "id">) => string;
    removeToast: (id: string) => void;
    updateToast: (id: string, updates: Partial<Toast>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};

// Enhanced Toast Item Component
const ToastItem: React.FC<{ toast: Toast; onClose: () => void }> = ({
    toast,
    onClose,
}) => {
    const [isHovered, setIsHovered] = React.useState(false);

    React.useEffect(() => {
        if (toast.duration && toast.duration > 0 && !isHovered) {
            const timer = setTimeout(onClose, toast.duration);
            return () => clearTimeout(timer);
        }
    }, [toast.duration, onClose, isHovered]);

    const icons = {
        success: <CheckCircle2 className="w-5 h-5" />,
        error: <XCircle className="w-5 h-5" />,
        warning: <AlertTriangle className="w-5 h-5" />,
        info: <Info className="w-5 h-5" />,
        upload: <Upload className="w-5 h-5" />,
        download: <Download className="w-5 h-5" />,
    };

    const colors = {
        success: "from-green-500/20 to-emerald-500/20 border-green-500/30",
        error: "from-red-500/20 to-rose-500/20 border-red-500/30",
        warning: "from-amber-500/20 to-orange-500/20 border-amber-500/30",
        info: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
        upload: "from-purple-500/20 to-pink-500/20 border-purple-500/30",
        download: "from-blue-500/20 to-indigo-500/20 border-blue-500/30",
    };

    const iconColors = {
        success: "text-green-400 bg-green-500/20",
        error: "text-red-400 bg-red-500/20",
        warning: "text-amber-400 bg-amber-500/20",
        info: "text-blue-400 bg-blue-500/20",
        upload: "text-purple-400 bg-purple-500/20",
        download: "text-blue-400 bg-blue-500/20",
    };

    const glowColors = {
        success: "shadow-green-500/20",
        error: "shadow-red-500/20",
        warning: "shadow-amber-500/20",
        info: "shadow-blue-500/20",
        upload: "shadow-purple-500/20",
        download: "shadow-blue-500/20",
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`relative bg-gradient-to-r ${colors[toast.type]} 
                  backdrop-blur-xl rounded-2xl border p-4 shadow-2xl ${glowColors[toast.type]}
                  min-w-72 max-w-96 overflow-hidden cursor-pointer`}
            onClick={onClose}
        >
            {/* Background glow effect */}
            <motion.div
                className="absolute inset-0 opacity-30"
                style={{
                    background: `radial-gradient(circle at 0% 50%, ${toast.type === "success" ? "#22c55e" :
                            toast.type === "error" ? "#ef4444" :
                                toast.type === "warning" ? "#f59e0b" :
                                    toast.type === "upload" ? "#8b5cf6" :
                                        toast.type === "download" ? "#3b82f6" :
                                            "#3b82f6"
                        }40, transparent 50%)`,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
            />

            <div className="relative flex items-start gap-3">
                {/* Animated Icon */}
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.1 }}
                    className={`p-2 rounded-xl ${iconColors[toast.type]} flex-shrink-0`}
                >
                    {toast.type === "upload" ? (
                        toast.progress !== undefined && toast.progress < 100 ? (
                            <motion.div
                                animate={{ y: [-2, 2, -2] }}
                                transition={{ duration: 0.6, repeat: Infinity }}
                            >
                                {icons[toast.type]}
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500 }}
                            >
                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                            </motion.div>
                        )
                    ) : toast.type === "download" ? (
                        toast.progress !== undefined && toast.progress < 100 ? (
                            <motion.div
                                animate={{ y: [2, -2, 2] }}
                                transition={{ duration: 0.6, repeat: Infinity }}
                            >
                                {icons[toast.type]}
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500 }}
                            >
                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                            </motion.div>
                        )
                    ) : toast.type === "success" ? (
                        <motion.div
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                        >
                            {icons[toast.type]}
                        </motion.div>
                    ) : toast.type === "error" ? (
                        <motion.div
                            animate={{ x: [-1, 1, -1, 1, 0] }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                        >
                            {icons[toast.type]}
                        </motion.div>
                    ) : (
                        icons[toast.type]
                    )}
                </motion.div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <motion.p
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="text-white font-medium text-sm"
                    >
                        {toast.title}
                    </motion.p>
                    {toast.message && (
                        <motion.p
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-white/60 text-xs mt-0.5 line-clamp-2"
                        >
                            {toast.message}
                        </motion.p>
                    )}

                    {/* Progress bar for upload/download */}
                    {(toast.type === "upload" || toast.type === "download") &&
                        toast.progress !== undefined && toast.showProgress && (
                            <motion.div
                                initial={{ opacity: 0, scaleX: 0 }}
                                animate={{ opacity: 1, scaleX: 1 }}
                                className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden origin-left"
                            >
                                <motion.div
                                    className={`h-full rounded-full ${toast.type === "upload"
                                            ? "bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"
                                            : "bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500"
                                        }`}
                                    style={{ backgroundSize: "200% 100%" }}
                                    initial={{ width: 0 }}
                                    animate={{
                                        width: `${toast.progress}%`,
                                        backgroundPosition: toast.progress < 100
                                            ? ["0% 0%", "100% 0%", "0% 0%"]
                                            : "0% 0%",
                                    }}
                                    transition={{
                                        width: { duration: 0.3, ease: "easeOut" },
                                        backgroundPosition: { duration: 1.5, repeat: Infinity, ease: "linear" },
                                    }}
                                />
                            </motion.div>
                        )}
                </div>

                {/* Close button */}
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ scale: 1.2, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                    className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors flex-shrink-0"
                >
                    <X className="w-4 h-4" />
                </motion.button>
            </div>

            {/* Auto-dismiss progress bar */}
            {toast.duration && toast.duration > 0 && !isHovered && (
                <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-white/30 origin-left"
                    initial={{ scaleX: 1 }}
                    animate={{ scaleX: 0 }}
                    transition={{ duration: toast.duration / 1000, ease: "linear" }}
                />
            )}

            {/* Particles on success */}
            {toast.type === "success" && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-green-400 rounded-full"
                            style={{
                                left: `${10 + i * 10}%`,
                                bottom: "30%",
                            }}
                            initial={{ y: 0, opacity: 1, scale: 1 }}
                            animate={{
                                y: -20 - Math.random() * 15,
                                x: (Math.random() - 0.5) * 30,
                                opacity: 0,
                                scale: 0,
                            }}
                            transition={{
                                duration: 0.8,
                                delay: 0.1 + i * 0.03,
                                ease: "easeOut",
                            }}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    );
};

// Toast Provider Component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((toast: Omit<Toast, "id">): string => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newToast: Toast = {
            ...toast,
            id,
            duration: toast.duration ?? 4000,
        };
        setToasts((prev) => [...prev, newToast]);
        return id;
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const updateToast = useCallback((id: string, updates: Partial<Toast>) => {
        setToasts((prev) =>
            prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
        );
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast, updateToast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
                <AnimatePresence mode="popLayout">
                    {toasts.map((toast) => (
                        <ToastItem
                            key={toast.id}
                            toast={toast}
                            onClose={() => removeToast(toast.id)}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

export default ToastProvider;
