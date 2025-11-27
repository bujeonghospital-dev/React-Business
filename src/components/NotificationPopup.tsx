"use client";
import { useEffect, useState } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

interface NotificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  type: "success" | "error";
  title: string;
  message: string;
}

export const NotificationPopup = ({
  isOpen,
  onClose,
  type,
  title,
  message,
}: NotificationPopupProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 10);

      // Auto close after 3 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  if (!isVisible) return null;

  const isSuccess = type === "success";

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none">
      {/* Backdrop with blur effect */}
      <div
        className={`absolute inset-0 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
        onClick={handleClose}
      />

      {/* Notification Card */}
      <div
        className={`relative pointer-events-auto transform transition-all duration-300 ${
          isAnimating
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 -translate-y-4"
        }`}
      >
        <div
          className={`relative bg-white rounded-2xl shadow-2xl overflow-hidden w-96 ${
            isSuccess ? "border-4 border-green-400" : "border-4 border-red-400"
          }`}
        >
          {/* Animated Background Gradient */}
          <div
            className={`absolute inset-0 opacity-10 ${
              isSuccess
                ? "bg-gradient-to-br from-green-400 via-emerald-400 to-teal-400"
                : "bg-gradient-to-br from-red-400 via-rose-400 to-pink-400"
            } animate-gradient`}
          />

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors z-10"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          {/* Content */}
          <div className="relative p-8">
            {/* Icon with animation */}
            <div className="flex justify-center mb-6">
              <div
                className={`relative ${
                  isSuccess ? "animate-success-icon" : "animate-error-icon"
                }`}
              >
                {isSuccess ? (
                  <div className="relative">
                    {/* Pulsing circles */}
                    <div className="absolute inset-0 animate-ping-slow">
                      <div className="w-24 h-24 rounded-full bg-green-400 opacity-30" />
                    </div>
                    <div className="absolute inset-0 animate-pulse-slow">
                      <div className="w-24 h-24 rounded-full bg-green-300 opacity-20" />
                    </div>
                    {/* Main icon */}
                    <CheckCircle className="w-24 h-24 text-green-500 relative z-10 drop-shadow-lg" />
                    {/* Sparkles */}
                    <div className="absolute top-0 left-0 w-full h-full">
                      <div className="absolute top-2 right-2 w-3 h-3 bg-yellow-400 rounded-full animate-sparkle-1" />
                      <div className="absolute top-6 right-0 w-2 h-2 bg-yellow-300 rounded-full animate-sparkle-2" />
                      <div className="absolute top-0 right-6 w-2 h-2 bg-yellow-500 rounded-full animate-sparkle-3" />
                      <div className="absolute bottom-2 left-2 w-3 h-3 bg-green-300 rounded-full animate-sparkle-1" />
                      <div className="absolute bottom-6 left-0 w-2 h-2 bg-green-400 rounded-full animate-sparkle-2" />
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Pulsing circles */}
                    <div className="absolute inset-0 animate-ping-slow">
                      <div className="w-24 h-24 rounded-full bg-red-400 opacity-30" />
                    </div>
                    <div className="absolute inset-0 animate-pulse-slow">
                      <div className="w-24 h-24 rounded-full bg-red-300 opacity-20" />
                    </div>
                    {/* Main icon */}
                    <XCircle className="w-24 h-24 text-red-500 relative z-10 drop-shadow-lg animate-shake" />
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <h2
              className={`text-2xl font-bold text-center mb-3 ${
                isSuccess ? "text-green-600" : "text-red-600"
              }`}
            >
              {title}
            </h2>

            {/* Message */}
            <p className="text-gray-600 text-center text-base leading-relaxed">
              {message}
            </p>

            {/* Progress bar */}
            <div className="mt-6">
              <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    isSuccess ? "bg-green-500" : "bg-red-500"
                  } animate-progress`}
                />
              </div>
            </div>
          </div>

          {/* Bottom decoration */}
          <div
            className={`h-2 ${
              isSuccess
                ? "bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400"
                : "bg-gradient-to-r from-red-400 via-rose-400 to-pink-400"
            }`}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0%,
          100% {
            transform: scale(1) rotate(0deg);
          }
          50% {
            transform: scale(1.1) rotate(5deg);
          }
        }

        @keyframes ping-slow {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.15;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }

        @keyframes pulse-slow {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.3;
          }
        }

        @keyframes success-icon {
          0% {
            transform: scale(0) rotate(-180deg);
          }
          50% {
            transform: scale(1.2) rotate(10deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
          }
        }

        @keyframes error-icon {
          0% {
            transform: scale(0) rotate(0deg);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-3px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(3px);
          }
        }

        @keyframes sparkle-1 {
          0%,
          100% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            transform: scale(1) rotate(180deg);
            opacity: 1;
          }
        }

        @keyframes sparkle-2 {
          0%,
          100% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          60% {
            transform: scale(1) rotate(180deg);
            opacity: 1;
          }
        }

        @keyframes sparkle-3 {
          0%,
          100% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          40% {
            transform: scale(1) rotate(180deg);
            opacity: 1;
          }
        }

        @keyframes progress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }

        .animate-gradient {
          animation: gradient 3s ease-in-out infinite;
        }

        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-success-icon {
          animation: success-icon 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .animate-error-icon {
          animation: error-icon 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .animate-shake {
          animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) 0.6s;
        }

        .animate-sparkle-1 {
          animation: sparkle-1 1s ease-in-out 0.3s;
        }

        .animate-sparkle-2 {
          animation: sparkle-2 1s ease-in-out 0.4s;
        }

        .animate-sparkle-3 {
          animation: sparkle-3 1s ease-in-out 0.5s;
        }

        .animate-progress {
          animation: progress 3s linear;
        }
      `}</style>
    </div>
  );
};
