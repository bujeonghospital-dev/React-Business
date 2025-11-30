import Link from "next/link";
import { FileVideo, ArrowLeft, Search } from "lucide-react";

export default function VideoNotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
                {/* Icon */}
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
                    <FileVideo className="w-12 h-12 text-white/50" />
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-white mb-3">Video Not Found</h1>

                {/* Description */}
                <p className="text-white/60 mb-8">
                    The video you&apos;re looking for doesn&apos;t exist or may have been
                    removed.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/all-files-gallery"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
                    >
                        <Search className="w-5 h-5" />
                        Browse Gallery
                    </Link>

                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Go Home
                    </Link>
                </div>

                {/* Help Text */}
                <p className="mt-8 text-white/40 text-sm">
                    If you believe this is an error, please contact support.
                </p>
            </div>
        </div>
    );
}
