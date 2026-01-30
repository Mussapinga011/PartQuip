
import { formatMoney } from '../lib/currency.js';

// Helper Functions

// Format currency (MT)
export function formatCurrency(value) {
  return formatMoney(value);
}

// Format date
export function formatDate(date, format = 'dd/MM/yyyy') {
  if (!date) return '';
  const d = new Date(date);
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return format
    .replace('dd', day)
    .replace('MM', month)
    .replace('yyyy', year)
    .replace('HH', hours)
    .replace('mm', minutes);
}

// Generate unique ID
export function generateId() {
  return crypto.randomUUID();
}

// Generate sale number (V + YYYYMMDD + sequential)
export function generateSaleNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  
  return `V${year}${month}${day}${random}`;
}

// Debounce function
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Validate CNPJ
export function validateCNPJ(cnpj) {
  cnpj = cnpj.replace(/[^\d]+/g, '');

  if (cnpj.length !== 14) return false;

  // Eliminate known invalid CNPJs
  if (/^(\d)\1+$/.test(cnpj)) return false;

  // Validate verification digits
  let length = cnpj.length - 2;
  let numbers = cnpj.substring(0, length);
  const digits = cnpj.substring(length);
  let sum = 0;
  let pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += numbers.charAt(length - i) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result != digits.charAt(0)) return false;

  length = length + 1;
  numbers = cnpj.substring(0, length);
  sum = 0;
  pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += numbers.charAt(length - i) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result != digits.charAt(1)) return false;

  return true;
}

// Format CNPJ
export function formatCNPJ(cnpj) {
  cnpj = cnpj.replace(/[^\d]+/g, '');
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

// Sanitize input (prevent XSS)
export function sanitizeInput(input) {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

// Calculate percentage
export function calculatePercentage(value, total) {
  if (total === 0) return 0;
  return ((value / total) * 100).toFixed(2);
}

// Group array by key
export function groupBy(array, key) {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
}

// Sort array by key
export function sortBy(array, key, order = 'asc') {
  return [...array].sort((a, b) => {
    if (order === 'asc') {
      return a[key] > b[key] ? 1 : -1;
    } else {
      return a[key] < b[key] ? 1 : -1;
    }
  });
}

// Filter array by search term
export function filterBySearch(array, searchTerm, keys) {
  const term = searchTerm.toLowerCase();
  return array.filter(item => {
    return keys.some(key => {
      const value = String(item[key] || '').toLowerCase();
      return value.includes(term);
    });
  });
}

// Show toast notification
export function showToast(message, type = 'info') {
  // Remove existing toasts to prevent stacking issues if needed, or just let them stack
  const toast = document.createElement('div');
  toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white font-medium z-[150] transition-all duration-300 transform translate-y-0 opacity-100 flex items-center gap-2`;
  
  let icon = '';
  switch (type) {
    case 'success':
      toast.classList.add('bg-green-500');
      icon = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
      break;
    case 'error':
      toast.classList.add('bg-red-500');
      icon = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
      break;
    case 'warning':
      toast.classList.add('bg-yellow-500');
      icon = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>';
      break;
    default:
      toast.classList.add('bg-blue-500');
      icon = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
  }
  
  toast.innerHTML = `${icon}<span>${message}</span>`;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Custom Alert function (returns promise)
export function showAlert(message, title = 'Aviso', type = 'info') {
  return new Promise((resolve) => {
    const modal = document.getElementById('custom-modal');
    const titleEl = document.getElementById('modal-title');
    const msgEl = document.getElementById('modal-message');
    const confirmBtn = document.getElementById('modal-confirm-btn');
    const cancelBtn = document.getElementById('modal-cancel-btn');
    const iconContainer = document.getElementById('modal-icon-container');
    const iconPath = document.getElementById('modal-icon-path');

    titleEl.textContent = title;
    msgEl.textContent = message;
    cancelBtn.classList.add('hidden');
    confirmBtn.textContent = 'OK';
    
    // Set icon based on type
    iconContainer.className = 'w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4';
    if (type === 'error') {
      iconContainer.classList.add('bg-red-100', 'text-red-600');
      iconPath.setAttribute('d', 'M6 18L18 6M6 6l12 12');
    } else if (type === 'success') {
      iconContainer.classList.add('bg-green-100', 'text-green-600');
      iconPath.setAttribute('d', 'M5 13l4 4L19 7');
    } else {
      iconContainer.classList.add('bg-blue-100', 'text-blue-600');
      iconPath.setAttribute('d', 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z');
    }

    modal.classList.remove('hidden');

    const handleConfirm = () => {
      modal.classList.add('hidden');
      confirmBtn.removeEventListener('click', handleConfirm);
      resolve(true);
    };

    confirmBtn.addEventListener('click', handleConfirm);
  });
}

// Custom Confirm function (returns promise)
export function confirm(message, title = 'Confirmação') {
  return new Promise((resolve) => {
    const modal = document.getElementById('custom-modal');
    const titleEl = document.getElementById('modal-title');
    const msgEl = document.getElementById('modal-message');
    const confirmBtn = document.getElementById('modal-confirm-btn');
    const cancelBtn = document.getElementById('modal-cancel-btn');
    const iconContainer = document.getElementById('modal-icon-container');
    const iconPath = document.getElementById('modal-icon-path');

    // i18n support could be added here by importing t or passing translated strings
    // For now we use the passed title/message which should already be translated
    
    titleEl.textContent = title;
    msgEl.textContent = message;
    cancelBtn.classList.remove('hidden');
    confirmBtn.textContent = 'Confirmar';
    cancelBtn.textContent = 'Cancelar';

    iconContainer.className = 'w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-yellow-100 text-yellow-600';
    iconPath.setAttribute('d', 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z');

    modal.classList.remove('hidden');

    const onConfirm = () => {
      cleanup();
      resolve(true);
    };

    const onCancel = () => {
      cleanup();
      resolve(false);
    };

    const cleanup = () => {
      modal.classList.add('hidden');
      confirmBtn.removeEventListener('click', onConfirm);
      cancelBtn.removeEventListener('click', onCancel);
    };

    confirmBtn.addEventListener('click', onConfirm);
    cancelBtn.addEventListener('click', onCancel);
  });
}
