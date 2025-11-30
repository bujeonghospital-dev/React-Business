"use client";

interface CopyButtonProps {
    url: string;
}

export default function CopyButton({ url }: CopyButtonProps) {
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            alert("Link copied to clipboard!");
        } catch (error) {
            // Fallback for older browsers
            const textArea = document.createElement("textarea");
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            alert("Link copied to clipboard!");
        }
    };

    return (
        <button
            onClick={handleCopy}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
        >
            Copy Link
        </button>
    );
}
