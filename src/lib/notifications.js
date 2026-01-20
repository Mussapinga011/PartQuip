// Notifications System - Activity Alerts
// Sistema de notificações para alertar sobre mudanças importantes

import { t } from './i18n.js';

// Store notifications in memory and localStorage
let notifications = [];
const MAX_NOTIFICATIONS = 50;

// Load notifications from localStorage
function loadNotifications() {
  try {
    const stored = localStorage.getItem('partquit_notifications');
    if (stored) {
      notifications = JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error loading notifications:', e);
    notifications = [];
  }
}

// Save notifications to localStorage
function saveNotifications() {
  try {
    // Keep only last MAX_NOTIFICATIONS
    const toSave = notifications.slice(-MAX_NOTIFICATIONS);
    localStorage.setItem('partquit_notifications', JSON.stringify(toSave));
  } catch (e) {
    console.error('Error saving notifications:', e);
  }
}

// Add a new notification
export function addNotification(type, message, data = {}) {
  const notification = {
    id: Date.now() + Math.random(),
    type, // 'info', 'success', 'warning', 'error'
    message,
    data,
    timestamp: new Date().toISOString(),
    read: false
  };

  notifications.push(notification);
  saveNotifications();
  
  // Show toast
  showNotificationToast(notification);
  
  // Update UI
  updateNotificationBadge();
  
  // Play sound (optional)
  playNotificationSound();
  
  return notification;
}

// Show notification as toast
function showNotificationToast(notification) {
  const container = getOrCreateToastContainer();
  
  const toast = document.createElement('div');
  toast.className = `notification-toast notification-${notification.type} animate-slide-in`;
  toast.innerHTML = `
    <div class="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border-l-4 ${getBorderColor(notification.type)}">
      <div class="flex-shrink-0">
        ${getIcon(notification.type)}
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-gray-900 dark:text-white">
          ${notification.message}
        </p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          ${formatTimestamp(notification.timestamp)}
        </p>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" class="flex-shrink-0 text-gray-400 hover:text-gray-600">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
        </svg>
      </button>
    </div>
  `;
  
  container.appendChild(toast);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    toast.classList.add('animate-slide-out');
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

// Get or create toast container
function getOrCreateToastContainer() {
  let container = document.getElementById('notification-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-toast-container';
    container.className = 'fixed top-4 right-4 z-50 space-y-2 max-w-sm';
    document.body.appendChild(container);
  }
  return container;
}

// Get icon based on type
function getIcon(type) {
  const icons = {
    info: `<svg class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
    </svg>`,
    success: `<svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
    </svg>`,
    warning: `<svg class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
    </svg>`,
    error: `<svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
    </svg>`
  };
  return icons[type] || icons.info;
}

// Get border color based on type
function getBorderColor(type) {
  const colors = {
    info: 'border-blue-500',
    success: 'border-green-500',
    warning: 'border-yellow-500',
    error: 'border-red-500'
  };
  return colors[type] || colors.info;
}

// Format timestamp
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  // Less than 1 minute
  if (diff < 60000) {
    return t('just_now') || 'Agora mesmo';
  }
  
  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} ${t('minutes_ago') || 'min atrás'}`;
  }
  
  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} ${t('hours_ago') || 'h atrás'}`;
  }
  
  // More than 24 hours
  return date.toLocaleDateString();
}

// Play notification sound
function playNotificationSound() {
  // Check if sounds are enabled
  const soundsEnabled = localStorage.getItem('partquit_notification_sounds') !== 'false';
  if (!soundsEnabled) return;
  
  try {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (e) {
    // Silently fail if audio is not supported
  }
}

// Update notification badge
export function updateNotificationBadge() {
  const badge = document.getElementById('notification-badge');
  if (!badge) return;
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  if (unreadCount > 0) {
    badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

// Get all notifications
export function getAllNotifications() {
  return [...notifications].reverse(); // Most recent first
}

// Get unread notifications
export function getUnreadNotifications() {
  return notifications.filter(n => !n.read).reverse();
}

// Mark notification as read
export function markAsRead(notificationId) {
  const notification = notifications.find(n => n.id === notificationId);
  if (notification) {
    notification.read = true;
    saveNotifications();
    updateNotificationBadge();
  }
}

// Mark all as read
export function markAllAsRead() {
  notifications.forEach(n => n.read = true);
  saveNotifications();
  updateNotificationBadge();
}

// Clear all notifications
export function clearAllNotifications() {
  notifications = [];
  saveNotifications();
  updateNotificationBadge();
}

// Delete specific notification
export function deleteNotification(notificationId) {
  notifications = notifications.filter(n => n.id !== notificationId);
  saveNotifications();
  updateNotificationBadge();
}

// Toggle notification sounds
export function toggleNotificationSounds() {
  const current = localStorage.getItem('partquit_notification_sounds') !== 'false';
  localStorage.setItem('partquit_notification_sounds', (!current).toString());
  return !current;
}

// Get notification sounds status
export function areNotificationSoundsEnabled() {
  return localStorage.getItem('partquit_notification_sounds') !== 'false';
}

// Activity tracking helpers
export function notifyPecaCreated(userName, pecaNome) {
  addNotification(
    'success',
    `${userName} ${t('created_part') || 'criou a peça'} "${pecaNome}"`,
    { type: 'peca_created', userName, pecaNome }
  );
}

export function notifyPecaUpdated(userName, pecaNome) {
  addNotification(
    'info',
    `${userName} ${t('updated_part') || 'editou a peça'} "${pecaNome}"`,
    { type: 'peca_updated', userName, pecaNome }
  );
}

export function notifyPecaDeleted(userName, pecaNome) {
  addNotification(
    'warning',
    `${userName} ${t('deleted_part') || 'deletou a peça'} "${pecaNome}"`,
    { type: 'peca_deleted', userName, pecaNome }
  );
}

export function notifyVendaCreated(userName, quantidade, pecaNome) {
  addNotification(
    'success',
    `${userName} ${t('sold') || 'vendeu'} ${quantidade}x ${pecaNome}`,
    { type: 'venda_created', userName, quantidade, pecaNome }
  );
}

export function notifyFornecedorCreated(userName, fornecedorNome) {
  addNotification(
    'success',
    `${userName} ${t('added_supplier') || 'adicionou o fornecedor'} "${fornecedorNome}"`,
    { type: 'fornecedor_created', userName, fornecedorNome }
  );
}

export function notifyEstoqueBaixo(pecaNome, estoque) {
  addNotification(
    'warning',
    `⚠️ ${t('low_stock') || 'Estoque baixo'}: ${pecaNome} (${estoque} ${t('units') || 'unidades'})`,
    { type: 'low_stock', pecaNome, estoque }
  );
}

export function notifySyncCompleted() {
  addNotification(
    'success',
    `✅ ${t('sync_completed') || 'Sincronização concluída com sucesso'}`,
    { type: 'sync_completed' }
  );
}

export function notifySyncError(error) {
  addNotification(
    'error',
    `❌ ${t('sync_error') || 'Erro na sincronização'}: ${error}`,
    { type: 'sync_error', error }
  );
}

// Initialize notifications system
export function initNotifications() {
  loadNotifications();
  updateNotificationBadge();
  
  // Add CSS for animations
  addNotificationStyles();
  
  console.log('✅ Notifications system initialized');
}

// Add notification styles
function addNotificationStyles() {
  if (document.getElementById('notification-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'notification-styles';
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
    
    .animate-slide-in {
      animation: slideIn 0.3s ease-out;
    }
    
    .animate-slide-out {
      animation: slideOut 0.3s ease-in;
    }
  `;
  
  document.head.appendChild(style);
}
