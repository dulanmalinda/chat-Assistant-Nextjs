"use client";

export function TokenSearchSkeleton() {
  return (
    <div className="flex flex-col gap-6 text-white animate-pulse">
      {/* Header */}
      <div className="h-6 w-48 bg-gray-700 rounded"></div>

      {/* Grid of token cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="bg-gray-900 rounded-xl p-4 flex flex-col gap-3 border border-gray-800"
          >
            {/* Token image and name */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-700"></div>
              <div className="flex-1">
                <div className="h-5 w-32 bg-gray-700 rounded"></div>
                <div className="h-3 w-40 bg-gray-800 rounded mt-1"></div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div className="h-4 w-20 bg-gray-700 rounded"></div>
              <div className="h-4 w-24 bg-gray-700 rounded"></div>
              <div className="h-4 w-20 bg-gray-700 rounded"></div>
              <div className="h-4 w-24 bg-gray-700 rounded"></div>
              <div className="h-4 w-20 bg-gray-700 rounded"></div>
              <div className="h-4 w-24 bg-gray-700 rounded"></div>
            </div>

            {/* Buy/Sell/Txns */}
            <div className="flex gap-4">
              <div className="h-3 w-12 bg-gray-700 rounded"></div>
              <div className="h-3 w-12 bg-gray-700 rounded"></div>
              <div className="h-3 w-12 bg-gray-700 rounded"></div>
            </div>

            {/* Market */}
            <div className="h-3 w-28 bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <div className="h-8 w-20 bg-gray-800 rounded-lg"></div>
        <div className="h-4 w-24 bg-gray-700 rounded"></div>
        <div className="h-8 w-20 bg-gray-800 rounded-lg"></div>
      </div>
    </div>
  );
}
