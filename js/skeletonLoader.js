export function showSkeletonLoader(container) {
  container.innerHTML = `
        <div class="bg-white p-4 rounded-lg border border-black animate-pulse">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-gray-300 rounded-full"></div>
            <div class="ml-4">
              <div class="h-4 w-32 bg-gray-300 rounded"></div>
              <div class="h-3 w-24 bg-gray-300 rounded mt-2"></div>
            </div>
          </div>
          <div class="h-6 bg-gray-300 rounded mb-2"></div>
          <div class="h-4 bg-gray-300 rounded mb-2"></div>
          <div class="h-4 bg-gray-300 rounded mb-2"></div>
          <div class="h-4 bg-gray-300 rounded"></div>
        </div>
      `;
}
