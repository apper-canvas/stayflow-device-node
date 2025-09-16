import React from "react";

const Loading = ({ className = "" }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-8 w-64 bg-gray-200 rounded-lg shimmer"></div>
          <div className="h-10 w-32 bg-gray-200 rounded-md shimmer"></div>
        </div>

        {/* Stats grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 w-20 bg-gray-200 rounded shimmer mb-2"></div>
                  <div className="h-8 w-16 bg-gray-200 rounded shimmer"></div>
                </div>
                <div className="h-12 w-12 bg-gray-200 rounded-lg shimmer"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Content grid skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-card">
              <div className="h-6 w-48 bg-gray-200 rounded shimmer mb-4"></div>
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, itemIndex) => (
                  <div key={itemIndex} className="flex items-center justify-between">
                    <div className="h-4 w-32 bg-gray-200 rounded shimmer"></div>
                    <div className="h-4 w-16 bg-gray-200 rounded shimmer"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div className="bg-white rounded-lg shadow-card overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="h-6 w-40 bg-gray-200 rounded shimmer"></div>
          </div>
          <div className="p-0">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex items-center p-4 border-b border-gray-50 last:border-b-0">
                <div className="h-4 w-24 bg-gray-200 rounded shimmer mr-6"></div>
                <div className="h-4 w-32 bg-gray-200 rounded shimmer mr-6"></div>
                <div className="h-4 w-20 bg-gray-200 rounded shimmer mr-6"></div>
                <div className="h-4 w-16 bg-gray-200 rounded shimmer ml-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;