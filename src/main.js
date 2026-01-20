// Main Application Entry Point
import './style.css';
import { supabaseHelpers } from './lib/supabase.js';
import { initDB } from './lib/db.js';
import { initSync, stopSync } from './lib/sync.js';
import { showToast, confirm, showAlert } from './utils/helpers.js';
import { t, setLanguage, getCurrentLang } from './lib/i18n.js';
import { initNotifications } from './lib/notifications.js';
import { initNotificationsPanel } from './components/notificationsPanel.js';
import { initRealtime } from './lib/realtime.js';

// Components will be loaded dynamically (Code Splitting)
// This improves initial load time significantly


// Global state
let currentUser = null;
let currentPage = 'dashboard';

// Apply translations to the UI
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const translation = t(key);
    
    if (el.tagName === 'INPUT' && el.type !== 'submit') {
      el.placeholder = translation;
    } else if (el.tagName === 'SPAN' || el.tagName === 'P' || el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3' || el.tagName === 'LABEL' || el.tagName === 'BUTTON') {
      const icon = el.querySelector('svg');
      if (icon) {
        const span = el.querySelector('span') || el;
        if (span !== el) span.textContent = translation;
      } else {
        el.textContent = translation;
      }
    } else {
      el.textContent = translation;
    }
  });
}

// Initialize app
async function init() {
  try {
    // Initialize IndexedDB
    await initDB();
    console.log('✅ IndexedDB initialized');

    // Check if user is logged in
    const user = await checkAuth();
    
    if (user) {
      currentUser = user;
      showApp();
      initSync();
      initNotifications();
      initNotificationsPanel();
      initRealtime((store, event, record) => {
        // Here we could trigger global UI refreshes if needed
        console.log(`Live Update: ${event} in ${store}`);
      });

      // Listen for data changes from realtime or sync to refresh UI
      window.addEventListener('dataChanged', (e) => {
        const { storeName } = e.detail;
        console.log(`Data changed in ${storeName}, refreshing current page: ${currentPage}`);
        
        // Refresh certain pages automatically
        const autoRefreshPages = ['dashboard', 'pecas', 'fornecedores', 'abastecimento', 'hierarquia'];
        if (autoRefreshPages.includes(currentPage)) {
          loadPage(currentPage, true); // Silent refresh
        }
      });
      applyTranslations();
      loadPage('dashboard');
    } else {
      showLogin();
      applyTranslations();
    }
  } catch (error) {
    console.error('Initialization error:', error);
    showToast(t('init_error') || 'Erro ao inicializar aplicação', 'error');
  } finally {
    hideLoading();
  }
}

// Theme Toggle Logic
document.getElementById('theme-toggle')?.addEventListener('click', () => {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('partquit_theme', isDark ? 'dark' : 'light');
  updateThemeIcons(isDark);
});

function updateThemeIcons(isDark) {
  const lightIcon = document.getElementById('theme-icon-light');
  const darkIcon = document.getElementById('theme-icon-dark');
  
  if (isDark) {
    lightIcon?.classList.remove('hidden');
    darkIcon?.classList.add('hidden');
  } else {
    lightIcon?.classList.add('hidden');
    darkIcon?.classList.remove('hidden');
  }
}

// Initial icon update
updateThemeIcons(document.documentElement.classList.contains('dark'));

// Language Switcher Logic
const langSelector = document.getElementById('lang-selector');
if (langSelector) {
  langSelector.value = getCurrentLang();
  langSelector.addEventListener('change', (e) => {
    setLanguage(e.target.value);
    applyTranslations();
    loadPage(currentPage); // Re-render current page with new language
  });
}

// Check authentication
async function checkAuth() {
  try {
    return await supabaseHelpers.getCurrentUser();
  } catch (error) {
    return null;
  }
}

// Show/hide screens
function hideLoading() {
  document.getElementById('loading-screen').classList.add('hidden');
}

function showLogin() {
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('app').classList.add('hidden');
}

function showApp() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  
  // Update user name
  if (currentUser) {
    const userName = currentUser.user_metadata?.full_name || currentUser.email.split('@')[0];
    document.getElementById('user-name').textContent = userName;
  }
}

// Handle login
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('login-error');
  
  try {
    const { user } = await supabaseHelpers.signIn(email, password);
    currentUser = user;
    
    showApp();
    initSync();
    loadPage('dashboard');
    showToast(t('login_success') || 'Login realizado com sucesso!', 'success');
  } catch (error) {
    console.error('Login error:', error);
    errorEl.textContent = t('login_error_msg') || 'Email ou senha incorretos';
    errorEl.classList.remove('hidden');
  }
});

// Handle logout
document.getElementById('logout-btn').addEventListener('click', async () => {
  if (!await confirm(t('confirm_logout') || 'Deseja realmente sair?')) return;
  try {
    await supabaseHelpers.signOut();
    stopSync();
    currentUser = null;
    showLogin();
    showToast(t('logout_success') || 'Logout realizado com sucesso', 'success');
  } catch (error) {
    console.error('Logout error:', error);
    showToast(t('logout_error') || 'Erro ao fazer logout', 'error');
  }
});

// Profile Management
const profileModal = document.getElementById('profile-modal');
const profileForm = document.getElementById('profile-form');

document.getElementById('settings-btn').addEventListener('click', () => {
  if (!currentUser) return;
  document.getElementById('profile-email').value = currentUser.email;
  document.getElementById('profile-name').value = currentUser.user_metadata?.full_name || '';
  profileModal.classList.remove('hidden');
});

document.getElementById('close-profile-btn').addEventListener('click', () => {
  profileModal.classList.add('hidden');
});

profileForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const newName = document.getElementById('profile-name').value;
  
  try {
    await supabaseHelpers.updateUserData({ full_name: newName });
    // Update local state
    currentUser.user_metadata = { ...currentUser.user_metadata, full_name: newName };
    showApp(); // Refresh header name
    profileModal.classList.add('hidden');
    showToast('Perfil atualizado com sucesso!', 'success');
  } catch (error) {
    console.error('Error updating profile:', error);
    showToast('Erro ao atualizar perfil', 'error');
  }
});

// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    const page = item.dataset.page;
    loadPage(page);
  });
});

// Load page with dynamic imports (Code Splitting)
async function loadPage(page, silent = false) {
  currentPage = page;
  
  // Update active nav item
  document.querySelectorAll('.nav-item').forEach(item => {
    if (item.dataset.page === page) {
      item.className = 'nav-item active flex items-center gap-2 px-4 py-3 text-sm font-medium text-primary border-b-2 border-primary whitespace-nowrap';
    } else {
      item.className = 'nav-item flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 border-b-2 border-transparent hover:text-primary dark:hover:text-primary-light hover:bg-gray-50 dark:hover:bg-gray-700/50 whitespace-nowrap transition';
    }
  });
  
  // Load page content
  const mainContent = document.getElementById('main-content');
  
  // Update header title/nav if needed, but components will handle their own inner contents
  // For now, let's just ensure labels in the navbar are translated
  document.querySelectorAll('.nav-item span').forEach(span => {
    const pageKey = span.parentElement.dataset.page;
    if (pageKey) {
      // Map page names to translation keys
      const keyMap = {
        'dashboard': 'dashboard',
        'pecas': 'pecas',
        'vendas': 'vendas',
        'abastecimento': 'abastecimento',
        'busca-veiculo': 'veiculos',
        'fornecedores': 'fornecedores',
        'hierarquia': 'categorias',
        'impressao': 'impressao',
        'relatorios': 'relatorios'
      };
      span.textContent = t(keyMap[pageKey] || pageKey);
    }
  });

  // Show loading indicator only if not silent
  if (!silent) {
    mainContent.innerHTML = `
      <div class="flex items-center justify-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    `;
  }

  try {
    // Dynamic imports - only load the component when needed
    switch(page) {
      case 'dashboard': {
        const { initDashboard } = await import('./components/dashboard.js');
        await initDashboard(mainContent);
        break;
      }
      case 'pecas': {
        const { initPecas } = await import('./components/pecas.js');
        await initPecas(mainContent);
        break;
      }
      case 'hierarquia': {
        const { initHierarquia } = await import('./components/hierarquia.js');
        await initHierarquia(mainContent);
        break;
      }
      case 'vendas': {
        const { initVendas } = await import('./components/vendas.js');
        await initVendas(mainContent);
        break;
      }
      case 'abastecimento': {
        const { initAbastecimento } = await import('./components/abastecimento.js');
        await initAbastecimento(mainContent);
        break;
      }
      case 'busca-veiculo': {
        const { initBuscaVeiculo } = await import('./components/buscaVeiculo.js');
        await initBuscaVeiculo(mainContent);
        break;
      }
      case 'fornecedores': {
        const { initFornecedores } = await import('./components/fornecedores.js');
        await initFornecedores(mainContent);
        break;
      }
      case 'relatorios': {
        const { initRelatorios } = await import('./components/relatorios.js');
        await initRelatorios(mainContent);
        break;
      }
      case 'impressao': {
        const { initImpressao } = await import('./components/impressao.js');
        await initImpressao(mainContent);
        break;
      }
      default: {
        showToast(t('page_not_found') || 'Página não encontrada', 'error');
        const { initDashboard } = await import('./components/dashboard.js');
        await initDashboard(mainContent);
      }
    }
  } catch (error) {
    console.error('Error loading page:', error);
    mainContent.innerHTML = `
      <div class="flex flex-col items-center justify-center h-64 gap-4">
        <svg class="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <p class="text-gray-600 dark:text-gray-400">${t('error_loading_page') || 'Erro ao carregar página'}</p>
        <button onclick="location.reload()" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
          ${t('reload') || 'Recarregar'}
        </button>
      </div>
    `;
    showToast(t('error_loading_page') || 'Erro ao carregar página', 'error');
  }
}


// Start app
init();
