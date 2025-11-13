export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-600 text-lg">กำลังโหลดข่าวสาร...</p>
      </div>
    </div>
  );
}
