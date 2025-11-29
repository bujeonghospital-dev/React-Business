"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, AlertCircle, Info, Download, Upload } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning" | "upload" | "download";

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
    progress?: number;
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

// Toast Item Component
const ToastItem: React.FC<{ toast: Toast; onClose: () => void }> = ({
    toast,
    onClose,
}) => {
    React.useEffect(() => {
        if (toast.duration && toast.duration > 0) {
            const timer = setTimeout(onClose, toast.duration);
            return () => clearTimeout(timer);
        }
    }, [toast.duration, onClose]);

    const icons = {
        success: <Check className="w-5 h-5" />,
        error: <X className="w-5 h-5" />,
        warning: <AlertCircle className="w-5 h-5" />,
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

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={`relative bg-gradient-to-r ${colors[toast.type]} 
                  backdrop-blur-xl rounded-2xl border p-4 shadow-2xl 
                  min-w-72 max-w-96 overflow-hidden`}
        >
            <div className="flex items-start gap-3">
                {/* Icon */}
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.1 }}
                    className={`p-2 rounded-xl ${iconColors[toast.type]}`}
                >
                    {toast.type === "upload" || toast.type === "download" ? (
                        <motion.div
                            animate={{ y: toast.type === "upload" ? [-2, 2, -2] : [2, -2, 2] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                        >
                            {icons[toast.type]}
                        </motion.div>
                    ) : (
                        icons[toast.type]
                    )}
                </motion.div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm">{toast.title}</p>
                    {toast.message && (
                        <p className="text-white/60 text-xs mt-0.5 line-clamp-2">
                            {toast.message}
                        </p>
                    )}

                    {/* Progress bar for upload/download */}
                    {(toast.type === "upload" || toast.type === "download") &&
                        toast.progress !== undefined && (
                            <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className={`h-full rounded-full ${toast.type === "upload"
                                            ? "bg-gradient-to-r from-purple-500 to-pink-500"
                                            : "bg-gradient-to-r from-blue-500 to-cyan-500"
                                        }`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${toast.progress}%` }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                />
                            </div>
                        )}
                </div>

                {/* Close button */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </motion.button>
            </div>

            {/* Auto-dismiss progress bar */}
            {toast.duration && toast.duration > 0 && (
                <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-white/30"
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: toast.duration / 1000, ease: "linear" }}
                />
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
