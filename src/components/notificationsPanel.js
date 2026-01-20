// Notifications Panel Component
import { 
  getAllNotifications, 
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
  clearAllNotifications,
  deleteNotification,
  toggleNotificationSounds,
  areNotificationSoundsEnabled,
  updateNotificationBadge
} from '../lib/notifications.js';
import { t } from '../lib/i18n.js';

let isOpen = false;

export function initNotificationsPanel() {
  // Add notification bell icon to header
  addNotificationBell();
  
  // Create notification panel
  createNotificationPanel();
  
  // Update badge
  updateNotificationBadge();
}

function addNotificationBell() {
  const header = document.querySelector('header');
  if (!header) return;
  
  // Find the right place to insert (before logout button)
  const logoutBtn = document.getElementById('logout-btn');
  if (!logoutBtn) return;
  
  const bellContainer = document.createElement('div');
  bellContainer.className = 'relative';
  bellContainer.innerHTML = `
    <button 
      id="notification-bell" 
      class="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
      title="${t('notifications') || 'Notificações'}"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
      </svg>
      <span 
        id="notification-badge" 
        class="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full hidden"
      >
        0
      </span>
    </button>
  `;
  
  logoutBtn.parentElement.insertBefore(bellContainer, logoutBtn);
  
  // Add click event
  document.getElementById('notification-bell').addEventListener('click', toggleNotificationPanel);
}

function createNotificationPanel() {
  const panel = document.createElement('div');
  panel.id = 'notification-panel';
  panel.className = 'fixed top-16 right-4 w-96 max-w-full bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-40 hidden';
  panel.innerHTML = `
    <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        ${t('notifications') || 'Notificações'}
      </h3>
      <div class="flex items-center gap-2">
        <button 
          id="toggle-notification-sounds" 
          class="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          title="${t('toggle_sounds') || 'Ativar/Desativar sons'}"
        >
          <svg id="sound-icon-on" class="w-5 h-5 ${areNotificationSoundsEnabled() ? '' : 'hidden'}" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clip-rule="evenodd"></path>
          </svg>
          <svg id="sound-icon-off" class="w-5 h-5 ${areNotificationSoundsEnabled() ? 'hidden' : ''}" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
        <button 
          id="mark-all-read" 
          class="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          title="${t('mark_all_read') || 'Marcar todas como lidas'}"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
            <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
        </button>
        <button 
          id="clear-all-notifications" 
          class="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          title="${t('clear_all') || 'Limpar todas'}"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>
    </div>
    <div id="notifications-list" class="max-h-96 overflow-y-auto">
      <!-- Notifications will be inserted here -->
    </div>
  `;
  
  document.body.appendChild(panel);
  
  // Add event listeners
  document.getElementById('toggle-notification-sounds').addEventListener('click', handleToggleSounds);
  document.getElementById('mark-all-read').addEventListener('click', handleMarkAllRead);
  document.getElementById('clear-all-notifications').addEventListener('click', handleClearAll);
  
  // Close panel when clicking outside
  document.addEventListener('click', (e) => {
    const panel = document.getElementById('notification-panel');
    const bell = document.getElementById('notification-bell');
    if (isOpen && !panel.contains(e.target) && !bell.contains(e.target)) {
      toggleNotificationPanel();
    }
  });
}

function toggleNotificationPanel() {
  const panel = document.getElementById('notification-panel');
  isOpen = !isOpen;
  
  if (isOpen) {
    panel.classList.remove('hidden');
    renderNotifications();
  } else {
    panel.classList.add('hidden');
  }
}

function renderNotifications() {
  const list = document.getElementById('notifications-list');
  const notifications = getAllNotifications();
  
  if (notifications.length === 0) {
    list.innerHTML = `
      <div class="flex flex-col items-center justify-center p-8 text-gray-500 dark:text-gray-400">
        <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
        </svg>
        <p class="text-sm">${t('no_notifications') || 'Nenhuma notificação'}</p>
      </div>
    `;
    return;
  }
  
  list.innerHTML = notifications.map(notification => `
    <div class="notification-item p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition ${notification.read ? 'opacity-60' : ''}" data-id="${notification.id}">
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0 mt-1">
          ${getNotificationIcon(notification.type)}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm text-gray-900 dark:text-white ${notification.read ? '' : 'font-semibold'}">
            ${notification.message}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            ${formatNotificationTime(notification.timestamp)}
          </p>
        </div>
        <div class="flex-shrink-0 flex gap-1">
          ${!notification.read ? `
            <button onclick="window.markNotificationAsRead('${notification.id}')" class="p-1 text-gray-400 hover:text-blue-600 transition" title="${t('mark_as_read') || 'Marcar como lida'}">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
            </button>
          ` : ''}
          <button onclick="window.deleteNotificationItem('${notification.id}')" class="p-1 text-gray-400 hover:text-red-600 transition" title="${t('delete') || 'Deletar'}">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function getNotificationIcon(type) {
  const icons = {
    info: '🔵',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };
  return icons[type] || '📢';
}

function formatNotificationTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return t('just_now') || 'Agora mesmo';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min atrás`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h atrás`;
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

function handleToggleSounds() {
  const enabled = toggleNotificationSounds();
  document.getElementById('sound-icon-on').classList.toggle('hidden', !enabled);
  document.getElementById('sound-icon-off').classList.toggle('hidden', enabled);
}

function handleMarkAllRead() {
  markAllAsRead();
  renderNotifications();
}

function handleClearAll() {
  if (confirm(t('confirm_clear_all') || 'Tem certeza que deseja limpar todas as notificações?')) {
    clearAllNotifications();
    renderNotifications();
  }
}

// Global functions for inline onclick handlers
window.markNotificationAsRead = (id) => {
  markAsRead(id);
  renderNotifications();
};

window.deleteNotificationItem = (id) => {
  deleteNotification(id);
  renderNotifications();
};
