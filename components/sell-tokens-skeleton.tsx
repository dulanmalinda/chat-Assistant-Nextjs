"use client";

export function TokenSellSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl p-6 bg-gray-900 max-w-lg text-white animate-pulse">
      <h2 className="h-6 w-32 bg-gray-700 rounded"></h2>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="h-4 w-24 bg-gray-700 rounded"></div>
        <div className="h-4 w-32 bg-gray-700 rounded"></div>
        <div className="h-4 w-24 bg-gray-700 rounded"></div>
        <div className="h-4 w-32 bg-gray-700 rounded"></div>
        <div className="h-4 w-24 bg-gray-700 rounded"></div>
        <div className="h-4 w-32 bg-gray-700 rounded"></div>
        <div className="h-4 w-24 bg-gray-700 rounded"></div>
        <div className="h-4 w-32 bg-gray-700 rounded"></div>
      </div>

      <div className="h-4 w-20 bg-gray-700 rounded"></div>
      <div className="h-4 w-16 bg-gray-700 rounded"></div>

      <div className="flex gap-2 mt-4">
        <div className="h-10 w-full bg-green-500/40 rounded"></div>
        <div className="h-10 w-full bg-gray-500/40 rounded"></div>
      </div>
    </div>
  );
}
