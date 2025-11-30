"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize2,
    Copy,
    Check,
    Share2,
    ArrowLeft,
    Download,
    MessageCircle,
} from "lucide-react";

interface VideoInfo {
    id: string;
    name: string;
    originalUrl: string;
    lineVideoUrl: string;
    thumbnailUrl: string;
    width: number;
    height: number;
    duration?: number;
    mimeType: string;
    folder: string;
    size: number;
}

interface VideoShareClientProps {
    video: VideoInfo;
    shareUrl: string;
    lineShareUrl: string;
}

export default function VideoShareClient({
    video,
    shareUrl,
    lineShareUrl,
}: VideoShareClientProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [copied, setCopied] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const toggleFullscreen = () => {
        if (videoRef.current) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                videoRef.current.requestFullscreen();
            }
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("Failed to copy:", error);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const currentProgress =
                (videoRef.current.currentTime / videoRef.current.duration) * 100;
            setProgress(currentProgress);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (videoRef.current) {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            videoRef.current.currentTime = pos * videoRef.current.duration;
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="fixed inset-0 z-[99999] min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-y-auto">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-[100000] bg-black/50 backdrop-blur-lg border-b border-white/10">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <Link
                        href="/all-files-gallery"
                        className="flex items-center gap-2 text-white hover:text-purple-400 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="hidden sm:inline">Back to Gallery</span>
                    </Link>

                    <h1 className="text-white font-semibold truncate max-w-[200px] sm:max-w-md">
                        {video.name}
                    </h1>

                    <div className="flex items-center gap-2">
                        <a
                            href={video.originalUrl}
                            download
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                            title="Download"
                        >
                            <Download className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-20 pb-32 px-4">
                <div className="container mx-auto max-w-4xl">
                    {/* Video Player */}
                    <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
                        <video
                            ref={videoRef}
                            src={video.originalUrl}
                            poster={video.thumbnailUrl}
                            className="w-full aspect-video object-contain"
                            onTimeUpdate={handleTimeUpdate}
                            onLoadedMetadata={handleLoadedMetadata}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onEnded={() => setIsPlaying(false)}
                            playsInline
                            webkit-playsinline="true"
                        />

                        {/* Play/Pause Overlay */}
                        <div
                            className="absolute inset-0 flex items-center justify-center cursor-pointer group"
                            onClick={togglePlay}
                        >
                            {!isPlaying && (
                                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center transform transition-transform group-hover:scale-110">
                                    <Play className="w-10 h-10 text-white ml-1" fill="white" />
                                </div>
                            )}
                        </div>

                        {/* Video Controls */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                            {/* Progress Bar */}
                            <div
                                className="w-full h-1 bg-white/30 rounded-full cursor-pointer mb-3"
                                onClick={handleSeek}
                            >
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>

                            {/* Controls Row */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={togglePlay}
                                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                                    >
                                        {isPlaying ? (
                                            <Pause className="w-5 h-5" />
                                        ) : (
                                            <Play className="w-5 h-5" />
                                        )}
                                    </button>

                                    <button
                                        onClick={toggleMute}
                                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                                    >
                                        {isMuted ? (
                                            <VolumeX className="w-5 h-5" />
                                        ) : (
                                            <Volume2 className="w-5 h-5" />
                                        )}
                                    </button>

                                    <span className="text-white/80 text-sm">
                                        {formatTime(videoRef.current?.currentTime || 0)} /{" "}
                                        {formatTime(duration)}
                                    </span>
                                </div>

                                <button
                                    onClick={toggleFullscreen}
                                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                                >
                                    <Maximize2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Video Info */}
                    <div className="mt-6 p-6 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10">
                        <h2 className="text-xl font-bold text-white mb-2">{video.name}</h2>
                        <div className="flex flex-wrap gap-4 text-white/60 text-sm">
                            <span>📁 {video.folder}</span>
                            <span>💾 {formatFileSize(video.size)}</span>
                            {duration > 0 && <span>⏱️ {formatTime(duration)}</span>}
                        </div>
                    </div>

                    {/* Share Section */}
                    <div className="mt-6 p-6 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Share2 className="w-5 h-5" />
                            Share Video
                        </h3>

                        {/* Share URL */}
                        <div className="flex items-center gap-2 mb-4">
                            <input
                                type="text"
                                value={shareUrl}
                                readOnly
                                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm"
                            />
                            <button
                                onClick={handleCopyLink}
                                className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${copied
                                    ? "bg-green-500 text-white"
                                    : "bg-white/10 hover:bg-white/20 text-white"
                                    }`}
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4" />
                                        Copy
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Share Buttons */}
                        <div className="flex flex-wrap gap-3">
                            <a
                                href={lineShareUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-6 py-3 bg-[#00B900] hover:bg-[#00a000] text-white font-medium rounded-xl transition-colors"
                            >
                                <MessageCircle className="w-5 h-5" />
                                Share on LINE
                            </a>

                            <a
                                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-6 py-3 bg-[#1877F2] hover:bg-[#166fe5] text-white font-medium rounded-xl transition-colors"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                Share
                            </a>

                            <a
                                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(video.name)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-6 py-3 bg-black hover:bg-gray-900 text-white font-medium rounded-xl transition-colors"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                                Tweet
                            </a>
                        </div>
                    </div>

                    {/* LINE Share Instructions */}
                    <div className="mt-6 p-6 bg-gradient-to-r from-[#00B900]/20 to-[#00B900]/10 backdrop-blur-lg rounded-2xl border border-[#00B900]/30">
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-[#00B900]" />
                            LINE Sharing Tips
                        </h3>
                        <ul className="text-white/80 text-sm space-y-2">
                            <li>• Copy the link above and paste it directly into LINE chat</li>
                            <li>• LINE will automatically generate a video preview</li>
                            <li>• Recipients can play the video inline without leaving LINE</li>
                            <li>• Or use the "Share on LINE" button for quick sharing</li>
                        </ul>
                    </div>
                </div>
            </main>

            {/* Fixed Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg border-t border-white/10 py-4 px-4">
                <div className="container mx-auto max-w-4xl flex items-center justify-between">
                    <div className="text-white/60 text-sm">
                        BJH Bangkok • Video Sharing
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleCopyLink}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm"
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copied ? "Copied!" : "Copy Link"}
                        </button>
                        <a
                            href={lineShareUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-[#00B900] hover:bg-[#00a000] text-white rounded-lg transition-colors text-sm"
                        >
                            <MessageCircle className="w-4 h-4" />
                            LINE
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
