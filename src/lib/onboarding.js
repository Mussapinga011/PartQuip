// Onboarding System - Interactive Tour Guide
import { t } from './i18n.js';

const ONBOARDING_KEY = 'partquit_onboarding_completed';

// Tour steps configuration
const tourSteps = [
  {
    target: '#page-title',
    title: () => t('onboarding_welcome_title') || 'Bem-vindo ao PartQuit! 🎉',
    content: () => t('onboarding_welcome_desc') || 'Este é o seu sistema de gestão de peças automotivas. Vamos fazer um tour rápido pelas funcionalidades principais.',
    position: 'bottom'
  },
  {
    target: '[data-page="dashboard"]',
    title: () => t('dashboard'),
    content: () => t('onboarding_dashboard_desc') || 'Visualize o resumo do seu negócio: vendas, estoque, lucros e gráficos em tempo real.',
    position: 'bottom'
  },
  {
    target: '[data-page="pecas"]',
    title: () => t('pecas'),
    content: () => t('onboarding_pecas_desc') || 'Cadastre e gerencie todas as suas peças. Use filtros por categoria, fornecedor e estoque. Exporte listas em PDF.',
    position: 'bottom'
  },
  {
    target: '[data-page="vendas"]',
    title: () => t('vendas'),
    content: () => t('onboarding_vendas_desc') || 'Registre vendas rapidamente. Busque peças, adicione quantidades e finalize. O estoque é atualizado automaticamente.',
    position: 'bottom'
  },
  {
    target: '[data-page="abastecimento"]',
    title: () => t('abastecimento'),
    content: () => t('onboarding_abastecimento_desc') || 'Registre entradas de estoque. O sistema calcula automaticamente o custo médio ponderado das peças.',
    position: 'bottom'
  },
  {
    target: '[data-page="busca-veiculo"]',
    title: () => t('veiculos'),
    content: () => t('onboarding_veiculos_desc') || 'Busque peças compatíveis com veículos específicos. Cadastre compatibilidades por marca, modelo e ano.',
    position: 'bottom'
  },
  {
    target: '[data-page="fornecedores"]',
    title: () => t('fornecedores'),
    content: () => t('onboarding_fornecedores_desc') || 'Gerencie seus fornecedores. Mantenha contatos, endereços e histórico de compras organizados.',
    position: 'bottom'
  },
  {
    target: '[data-page="hierarquia"]',
    title: () => t('categorias'),
    content: () => t('onboarding_categorias_desc') || 'Organize suas peças em categorias e tipos. Facilita a busca e organização do estoque.',
    position: 'bottom'
  },
  {
    target: '[data-page="relatorios"]',
    title: () => t('relatorios'),
    content: () => t('onboarding_relatorios_desc') || 'Gere relatórios detalhados: vendas por período, peças mais vendidas, margem de lucro e muito mais.',
    position: 'bottom'
  },
  {
    target: '#manual-sync-btn',
    title: () => t('onboarding_sync_title') || 'Sincronização',
    content: () => t('onboarding_sync_desc') || 'Seus dados são sincronizados automaticamente com a nuvem. Clique aqui para forçar uma sincronização manual.',
    position: 'bottom'
  },
  {
    target: '#settings-btn',
    title: () => t('onboarding_settings_title') || 'Configurações',
    content: () => t('onboarding_settings_desc') || 'Acesse configurações, faça backup dos dados (JSON), exporte relatórios gerais em PDF e personalize o sistema.',
    position: 'left'
  }
];

let currentStep = 0;
let overlay = null;
let tooltip = null;

export function shouldShowOnboarding() {
  return !localStorage.getItem(ONBOARDING_KEY);
}

export function startOnboarding() {
  if (!shouldShowOnboarding()) return;
  
  currentStep = 0;
  createOverlay();
  showStep(currentStep);
}

export function skipOnboarding() {
  localStorage.setItem(ONBOARDING_KEY, 'true');
  endOnboarding();
}

function createOverlay() {
  // Create dark overlay with reduced opacity for better visibility
  overlay = document.createElement('div');
  overlay.id = 'onboarding-overlay';
  overlay.className = 'fixed inset-0 bg-black/30 z-[9998] transition-opacity duration-300';
  document.body.appendChild(overlay);
  
  // Create tooltip container
  tooltip = document.createElement('div');
  tooltip.id = 'onboarding-tooltip';
  tooltip.className = 'fixed z-[9999] max-w-sm';
  document.body.appendChild(tooltip);
}

function showStep(stepIndex) {
  if (stepIndex >= tourSteps.length) {
    completeOnboarding();
    return;
  }
  
  const step = tourSteps[stepIndex];
  const target = document.querySelector(step.target);
  
  if (!target) {
    // Skip to next if target not found
    showStep(stepIndex + 1);
    return;
  }
  
  // Highlight target element
  highlightElement(target);
  
  // Position and show tooltip
  positionTooltip(target, step);
}

function highlightElement(element) {
  // Remove previous highlights
  document.querySelectorAll('.onboarding-highlight').forEach(el => {
    el.classList.remove('onboarding-highlight');
  });
  
  // Add highlight to current element
  element.classList.add('onboarding-highlight');
  
  // Scroll element into view
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function positionTooltip(target, step) {
  const rect = target.getBoundingClientRect();
  const stepTitle = typeof step.title === 'function' ? step.title() : step.title;
  const stepContent = typeof step.content === 'function' ? step.content() : step.content;
  
  const tooltipContent = `
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 animate-fade-in-up">
      <div class="flex items-start justify-between mb-4">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">${stepTitle}</h3>
        <button onclick="window.skipOnboarding()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>
      <p class="text-sm text-gray-600 dark:text-gray-300 mb-6">${stepContent}</p>
      <div class="flex items-center justify-between">
        <span class="text-xs text-gray-500 dark:text-gray-400">${currentStep + 1} / ${tourSteps.length}</span>
        <div class="flex gap-2">
          ${currentStep > 0 ? `<button onclick="window.previousOnboardingStep()" class="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">${t('previous') || 'Anterior'}</button>` : ''}
          <button onclick="window.nextOnboardingStep()" class="px-4 py-2 text-sm bg-primary hover:bg-primary-dark text-white rounded-lg transition font-medium">
            ${currentStep === tourSteps.length - 1 ? (t('finish') || 'Concluir') : (t('next') || 'Próximo')}
          </button>
        </div>
      </div>
    </div>
  `;
  
  tooltip.innerHTML = tooltipContent;
  
  // Position based on step.position
  const tooltipRect = tooltip.getBoundingClientRect();
  let top, left;
  
  switch (step.position) {
    case 'bottom':
      top = rect.bottom + 10;
      left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
      break;
    case 'top':
      top = rect.top - tooltipRect.height - 10;
      left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
      break;
    case 'left':
      top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
      left = rect.left - tooltipRect.width - 10;
      break;
    case 'right':
      top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
      left = rect.right + 10;
      break;
    default:
      top = rect.bottom + 10;
      left = rect.left;
  }
  
  // Ensure tooltip stays within viewport
  top = Math.max(10, Math.min(top, window.innerHeight - tooltipRect.height - 10));
  left = Math.max(10, Math.min(left, window.innerWidth - tooltipRect.width - 10));
  
  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${left}px`;
}

function completeOnboarding() {
  localStorage.setItem(ONBOARDING_KEY, 'true');
  endOnboarding();
  
  // Show completion message
  const toast = document.createElement('div');
  toast.className = 'fixed top-4 right-4 z-[10000] bg-green-500 text-white px-6 py-4 rounded-lg shadow-xl animate-fade-in-up';
  toast.innerHTML = `
    <div class="flex items-center gap-3">
      <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
      </svg>
      <span class="font-medium">Tour concluído! Você está pronto para começar.</span>
    </div>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function endOnboarding() {
  if (overlay) overlay.remove();
  if (tooltip) tooltip.remove();
  document.querySelectorAll('.onboarding-highlight').forEach(el => {
    el.classList.remove('onboarding-highlight');
  });
}

// Global functions for button clicks
window.nextOnboardingStep = () => {
  currentStep++;
  showStep(currentStep);
};

window.previousOnboardingStep = () => {
  currentStep--;
  showStep(currentStep);
};

window.skipOnboarding = skipOnboarding;

// Add CSS for onboarding
export function initOnboardingStyles() {
  if (document.getElementById('onboarding-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'onboarding-styles';
  style.textContent = `
    .onboarding-highlight {
      position: relative;
      z-index: 9999 !important;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.5) !important;
      border-radius: 8px;
    }
  `;
  document.head.appendChild(style);
}
