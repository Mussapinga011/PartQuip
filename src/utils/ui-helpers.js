
// UI Helpers for visual consistency
import { t } from '../lib/i18n.js';

export function renderEmptyState(messageKey, subMessageKey = null, actionBtn = null) {
  const message = t(messageKey) || messageKey;
  const subMessage = subMessageKey ? (t(subMessageKey) || subMessageKey) : '';

  return `
    <div class="flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in-up">
      <div class="bg-gray-50 dark:bg-gray-800 rounded-full p-6 mb-4 shadow-inner">
        <svg class="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-1">${message}</h3>
      ${subMessage ? `<p class="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">${subMessage}</p>` : ''}
      ${actionBtn ? `
        <button 
          onclick="${actionBtn.onClick}" 
          class="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition shadow-sm hover:shadow-md"
        >
          ${actionBtn.icon ? `<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${actionBtn.icon}"></path></svg>` : ''}
          ${actionBtn.text}
        </button>
      ` : ''}
    </div>
  `;
}

// Render informative tooltip icon
export function renderTooltip(text, position = 'top') {
  const id = `tooltip-${Math.random().toString(36).substr(2, 9)}`;
  return `
    <div class="inline-block relative group">
      <svg class="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help transition" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"></path>
      </svg>
      <div class="hidden group-hover:block absolute ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} left-1/2 transform -translate-x-1/2 z-50">
        <div class="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 max-w-xs whitespace-normal shadow-xl">
          ${text}
          <div class="absolute ${position === 'top' ? 'top-full' : 'bottom-full'} left-1/2 transform -translate-x-1/2 border-4 border-transparent ${position === 'top' ? 'border-t-gray-900' : 'border-b-gray-900'}"></div>
        </div>
      </div>
    </div>
  `;
}

export function showLoadingSkeleton(count = 5) {
  return Array(count).fill(0).map(() => `
    <div class="animate-pulse flex space-x-4 p-4 border-b border-gray-100 dark:border-gray-700">
      <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
      <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
      <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
      <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
    </div>
  `).join('');
}
