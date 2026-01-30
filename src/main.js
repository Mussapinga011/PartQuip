// Main Application Entry Point
import './style.css';
import { supabaseHelpers } from './lib/supabase.js';
import { initDB, dbOperations, syncQueue } from './lib/db.js';
import { initSync, stopSync, forceFullSync } from './lib/sync.js';
import { showToast, confirm, showAlert, formatCurrency } from './utils/helpers.js';
import { generatePDF } from './utils/pdfHelper.js';
import { t, setLanguage, getCurrentLang } from './lib/i18n.js';
import { initNotifications } from './lib/notifications.js';
import { initNotificationsPanel } from './components/notificationsPanel.js';
import { initRealtime } from './lib/realtime.js';
import { setCurrency, getCurrentCurrency } from './lib/currency.js';
import { initOnboardingStyles, shouldShowOnboarding, startOnboarding } from './lib/onboarding.js';

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

    // Initialize onboarding styles
    initOnboardingStyles();

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
    updateSyncUI();
  }
}

// Sync UI Update
async function updateSyncUI() {
  const statusEl = document.getElementById('sync-status');
  if (!statusEl) return;
  
  try {
    const queue = await syncQueue.getAll();
    const pending = queue.filter(i => !i.synced).length;
    
    if (pending > 0) {
      statusEl.innerHTML = `
        <svg class="w-4 h-4 text-orange-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
        <span class="text-xs text-orange-600 dark:text-orange-300 font-medium">Sincronizando (${pending})</span>
      `;
    } else {
      statusEl.innerHTML = `
        <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
        <span class="text-xs text-gray-600 dark:text-gray-300">Sincronizado</span>
      `;
    }
  } catch (err) {
    console.error('Sync UI error:', err);
  }
}

// Global listener for sync updates
window.addEventListener('triggerSync', () => { setTimeout(updateSyncUI, 500); });
window.addEventListener('dataChanged', updateSyncUI);
setInterval(updateSyncUI, 10000); // Poll every 10s as backup


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

// Currency Switcher Logic
const currencySelector = document.getElementById('currency-selector');
if (currencySelector) {
  currencySelector.value = getCurrentCurrency();
  currencySelector.addEventListener('change', (e) => {
    setCurrency(e.target.value);
    loadPage(currentPage); 
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

// Handle manual sync
document.getElementById('manual-sync-btn')?.addEventListener('click', async () => {
  const btn = document.getElementById('manual-sync-btn');
  if (!btn) return;
  
  // Disable button and show loading state
  btn.disabled = true;
  btn.classList.add('opacity-50', 'cursor-not-allowed');
  const icon = btn.querySelector('svg');
  if (icon) icon.classList.add('animate-spin');
  
  try {
    const result = await forceFullSync();
    
    if (result.success) {
      showToast(result.message, 'success');
    } else {
      showToast(result.message, 'warning');
    }
  } catch (error) {
    console.error('Manual sync error:', error);
    showToast('Erro ao sincronizar. Tente novamente.', 'error');
  } finally {
    // Re-enable button
    btn.disabled = false;
    btn.classList.remove('opacity-50', 'cursor-not-allowed');
    if (icon) icon.classList.remove('animate-spin');
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

// Backup & Restore
document.getElementById('btn-backup-export')?.addEventListener('click', async () => {
    try {
        const backup = await dbOperations.backupDB();
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `partquit-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Backup exportado com sucesso!', 'success');
    } catch (err) {
        console.error('Backup error:', err);
        showToast('Erro ao exportar backup', 'error');
    }
});

document.getElementById('btn-backup-import')?.addEventListener('click', () => {
    document.getElementById('file-backup-import').click();
});

document.getElementById('file-backup-import')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!await confirm('Isso irá mesclar/sobrescrever os dados atuais. Tem certeza que deseja restaurar? Recomendamos exportar o backup atual antes.')) {
        e.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const backup = JSON.parse(e.target.result);
            await dbOperations.restoreDB(backup);
            showToast('Dados restaurados com sucesso! Recarregando...', 'success');
            setTimeout(() => location.reload(), 1500);
        } catch (err) {
            console.error('Restore error:', err);
            showToast('Erro ao restaurar backup: Arquivo inválido', 'error');
        }
    };
    reader.readAsText(file);
});

// PDF Backup Logic
document.getElementById('btn-backup-pdf')?.addEventListener('click', async () => {
    try {
        const btn = document.getElementById('btn-backup-pdf');
        const originalText = btn.innerHTML;
        btn.innerHTML = 'Gerando...';
        btn.disabled = true;

        const pecas = await dbOperations.getAll('pecas');
        const vendas = await dbOperations.getAll('vendas');
        
        // Calculate Totals
        const totalPecas = pecas.length;
        const totalEstoqueValor = pecas.reduce((sum, p) => sum + (p.stock_atual * p.preco_custo), 0);
        const totalEstoqueVenda = pecas.reduce((sum, p) => sum + (p.stock_atual * p.preco_venda), 0);
        
        const vendasMes = vendas.filter(v => {
            const date = new Date(v.created_at);
            const now = new Date();
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        });
        const totalVendasMes = vendasMes.reduce((sum, v) => sum + v.total, 0);

        // Generate HTML for PDF
        const element = document.createElement('div');
        element.style.padding = '20px';
        element.style.fontFamily = 'Arial, sans-serif';
        element.style.color = '#000';
        element.style.background = '#fff';

        element.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">Relatório Geral do Sistema</h1>
                <p style="font-size: 14px; color: #666;">PartQuit - Gestão de Peças</p>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
                <div style="border: 1px solid #ddd; padding: 15px; border-radius: 8px;">
                    <h3 style="margin: 0 0 10px 0; font-size: 16px;">Resumo de Estoque</h3>
                    <p>Total de Itens: <strong>${totalPecas}</strong></p>
                    <p>Valor Custo Total: <strong>${formatCurrency(totalEstoqueValor)}</strong></p>
                    <p>Valor Venda Potencial: <strong>${formatCurrency(totalEstoqueVenda)}</strong></p>
                </div>
                <div style="border: 1px solid #ddd; padding: 15px; border-radius: 8px;">
                    <h3 style="margin: 0 0 10px 0; font-size: 16px;">Vendas do Mês</h3>
                    <p>Quantidade: <strong>${vendasMes.length}</strong></p>
                    <p>Total Faturado: <strong>${formatCurrency(totalVendasMes)}</strong></p>
                </div>
            </div>

            <h3 style="font-size: 18px; margin-bottom: 10px;">Top 20 Produtos em Estoque</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                    <tr style="background: #f3f4f6;">
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Código</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Produto</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Qtd</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Preço Venda</th>
                    </tr>
                </thead>
                <tbody>
                    ${pecas.sort((a,b) => b.stock_atual - a.stock_atual).slice(0, 20).map(p => `
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 8px;">${p.codigo}</td>
                            <td style="border: 1px solid #ddd; padding: 8px;">${p.nome}</td>
                            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${p.stock_atual}</td>
                            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(p.preco_venda)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div style="margin-top: 20px; font-size: 10px; color: #999; text-align: center;">
                Gerado em ${new Date().toLocaleString()}
            </div>
        `;

        await generatePDF(element, `Relatorio_Geral_${new Date().toISOString().split('T')[0]}`, 'Relatório Geral do Sistema');
        
        btn.innerHTML = originalText;
        btn.disabled = false;
    } catch (err) {
        console.error('PDF error:', err);
        showToast('Erro ao gerar PDF', 'error');
        document.getElementById('btn-backup-pdf').disabled = false;
        document.getElementById('btn-backup-pdf').textContent = 'Tentar Novamente';
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
      <div class="flex items-center justify-center h-64 animate-fade-in-up">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    `;
  }
  
  // Remove animation class to reset it
  mainContent.classList.remove('page-enter');
  
  // Trigger reflow to restart animation
  void mainContent.offsetWidth;
  
  // Add animation class
  mainContent.classList.add('page-enter');
  
  // Remove class after animation to prevent fixed positioning issues (stacking context)
  mainContent.addEventListener('animationend', () => {
    mainContent.classList.remove('page-enter');
  }, { once: true });

  try {
    // Dynamic imports - only load the component when needed
    switch(page) {
      case 'dashboard': {
        const { initDashboard } = await import('./components/dashboard.js');
        await initDashboard(mainContent);
        // Show onboarding on first visit
        if (shouldShowOnboarding()) {
          setTimeout(() => startOnboarding(), 500);
        }
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
      case 'ajuda': {
        const { initAjuda } = await import('./components/ajuda.js');
        await initAjuda(mainContent);
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
