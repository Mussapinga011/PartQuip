// Main Application Entry Point
import './style.css';
import { supabaseHelpers } from './lib/supabase.js';
import { initDB } from './lib/db.js';
import { initSync, stopSync } from './lib/sync.js';
import { showToast } from './utils/helpers.js';
import { t, setLanguage, getCurrentLang } from './lib/i18n.js';

// Import components (will be created next)
import { initDashboard } from './components/dashboard.js';
import { initPecas } from './components/pecas.js';
import { initVendas } from './components/vendas.js';
import { initBuscaVeiculo } from './components/buscaVeiculo.js';
import { initFornecedores } from './components/fornecedores.js';
import { initRelatorios } from './components/relatorios.js';
import { initHierarquia } from './components/hierarquia.js';
import { initAbastecimento } from './components/abastecimento.js';
import { initImpressao } from './components/impressao.js';

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
      applyTranslations();
      loadPage('dashboard');
    } else {
      showLogin();
      applyTranslations();
    }
  } catch (error) {
    console.error('Initialization error:', error);
    showToast('Erro ao inicializar aplicação', 'error');
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
    const userName = currentUser.email.split('@')[0];
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
    showToast('Login realizado com sucesso!', 'success');
  } catch (error) {
    console.error('Login error:', error);
    errorEl.textContent = 'Email ou senha incorretos';
    errorEl.classList.remove('hidden');
  }
});

// Handle logout
document.getElementById('logout-btn').addEventListener('click', async () => {
  try {
    await supabaseHelpers.signOut();
    stopSync();
    currentUser = null;
    showLogin();
    showToast('Logout realizado com sucesso', 'success');
  } catch (error) {
    console.error('Logout error:', error);
    showToast('Erro ao fazer logout', 'error');
  }
});

// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    const page = item.dataset.page;
    loadPage(page);
  });
});

// Load page
async function loadPage(page) {
  currentPage = page;
  
  // Update active nav item
  document.querySelectorAll('.nav-item').forEach(item => {
    if (item.dataset.page === page) {
      item.className = 'nav-item active flex items-center gap-2 px-4 py-3 text-sm font-medium text-primary border-b-2 border-primary whitespace-nowrap';
    } else {
      item.className = 'nav-item flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-primary hover:bg-gray-50 whitespace-nowrap transition';
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

    switch(page) {
      case 'dashboard':
        await initDashboard(mainContent);
        break;
      case 'pecas':
        await initPecas(mainContent);
        break;
      case 'hierarquia':
        await initHierarquia(mainContent);
        break;
      case 'vendas':
        await initVendas(mainContent);
        break;
      case 'abastecimento':
        await initAbastecimento(mainContent);
        break;
      case 'busca-veiculo':
        await initBuscaVeiculo(mainContent);
        break;
      case 'fornecedores':
        await initFornecedores(mainContent);
        break;
      case 'relatorios':
        await initRelatorios(mainContent);
        break;
      case 'impressao':
        await initImpressao(mainContent);
        break;
      default:
        showToast('Página não encontrada', 'error');
        await initDashboard(mainContent);
    }
}

// Start app
init();
