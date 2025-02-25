"use client";

export function TokenDetailsSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl p-4 bg-gray-900 max-w-lg text-white animate-pulse">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-gray-700"></div>
        <div>
          <div className="h-4 w-24 bg-gray-700 rounded"></div>
          <div className="h-3 w-32 bg-gray-800 rounded mt-1"></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="h-4 w-20 bg-gray-700 rounded"></div>
        <div className="h-4 w-24 bg-gray-700 rounded"></div>
        <div className="h-4 w-20 bg-gray-700 rounded"></div>
        <div className="h-4 w-24 bg-gray-700 rounded"></div>
        <div className="h-4 w-20 bg-gray-700 rounded"></div>
      </div>

      <div className="grid grid-cols-4 gap-2 text-xs">
        <div className="h-3 w-10 bg-gray-700 rounded"></div>
        <div className="h-3 w-10 bg-gray-700 rounded"></div>
        <div className="h-3 w-10 bg-gray-700 rounded"></div>
      </div>

      <div className="flex gap-4 text-sm">
        <div className="h-4 w-16 bg-gray-700 rounded"></div>
        <div className="h-4 w-16 bg-gray-700 rounded"></div>
      </div>

      <div className="h-4 w-32 bg-yellow-500/40 rounded"></div>
    </div>
  );
}
