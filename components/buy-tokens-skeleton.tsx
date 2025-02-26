"use client";

export function TokenBuySkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl p-4 bg-gray-900 max-w-lg text-white animate-pulse">
      <h2 className="h-5 w-24 bg-gray-700 rounded"></h2>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="h-4 w-24 bg-gray-700 rounded"></div>
        <div className="h-4 w-28 bg-gray-700 rounded"></div>
        <div className="h-4 w-24 bg-gray-700 rounded"></div>
        <div className="h-4 w-28 bg-gray-700 rounded"></div>
      </div>

      <div className="flex gap-2">
        <div className="h-10 w-full bg-blue-500/40 rounded"></div>
        <div className="h-10 w-full bg-red-500/40 rounded"></div>
      </div>
    </div>
  );
}
