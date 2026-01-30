// Help & FAQ Component
import { t } from '../lib/i18n.js';

export async function initAjuda(container) {
  const currentLang = localStorage.getItem('partquit_lang') || 'pt';
  
  const faqData = currentLang === 'pt' ? getFAQPortuguese() : getFAQEnglish();
  const keyboardShortcuts = currentLang === 'pt' ? [
    { key: 'Ctrl + K', action: 'Busca rápida (em desenvolvimento)' },
    { key: 'Ctrl + N', action: 'Nova venda/peça (dependendo da aba)' },
    { key: 'Esc', action: 'Fechar modais' }
  ] : [
    { key: 'Ctrl + K', action: 'Quick search (in development)' },
    { key: 'Ctrl + N', action: 'New sale/part (depending on tab)' },
    { key: 'Esc', action: 'Close modals' }
  ];

  container.innerHTML = `
    <div class="space-y-6 max-w-5xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">${currentLang === 'pt' ? 'Central de Ajuda' : 'Help Center'}</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">${currentLang === 'pt' ? 'Perguntas frequentes e guias rápidos' : 'Frequently asked questions and quick guides'}</p>
        </div>
        <button id="btn-restart-tour" class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition shadow-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          ${currentLang === 'pt' ? 'Refazer Tour' : 'Restart Tour'}
        </button>
      </div>

      <!-- FAQ Sections -->
      ${faqData.map((section, sectionIdx) => `
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-primary/10 rounded-lg">
                <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${section.icon}"></path>
                </svg>
              </div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">${section.category}</h3>
            </div>
          </div>
          <div class="divide-y divide-gray-100 dark:divide-gray-700">
            ${section.questions.map((item, idx) => `
              <details class="group">
                <summary class="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <span class="font-medium text-gray-900 dark:text-white">${item.q}</span>
                  <svg class="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </summary>
                <div class="px-6 py-4 bg-gray-50 dark:bg-gray-900/30">
                  <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">${item.a}</p>
                </div>
              </details>
            `).join('')}
          </div>
        </div>
      `).join('')}

      <!-- Keyboard Shortcuts -->
      <div class="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
          </svg>
          ${currentLang === 'pt' ? 'Atalhos de Teclado' : 'Keyboard Shortcuts'}
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          ${keyboardShortcuts.map(shortcut => `
            <div class="flex items-center justify-between bg-white dark:bg-gray-800 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <span class="text-sm text-gray-600 dark:text-gray-300">${shortcut.action}</span>
              <kbd class="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm">${shortcut.key}</kbd>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Contact Support -->
      <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div class="flex flex-col md:flex-row items-center gap-6">
          <div class="flex-shrink-0">
            <svg class="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
          </div>
          <div class="flex-1 text-center md:text-left">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">${currentLang === 'pt' ? 'Ainda precisa de ajuda?' : 'Still need help?'}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">${currentLang === 'pt' ? 'Entre em contato com o suporte técnico para assistência personalizada.' : 'Contact technical support for personalized assistance.'}</p>
            <div class="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <a href="mailto:joaomussapingajoaqui@gmail.com" class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                ${currentLang === 'pt' ? 'Enviar Email' : 'Send Email'}
              </a>
              <a href="https://wa.me/258861499025" target="_blank" class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Setup event listeners
  document.getElementById('btn-restart-tour')?.addEventListener('click', () => {
    localStorage.removeItem('partquit_onboarding_completed');
    window.location.reload();
  });
}

function getFAQPortuguese() {
  return [
    {
      category: 'Vendas',
      icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
      questions: [
        { q: 'Como fazer uma venda?', a: 'Vá para a aba "Vendas", clique em "Nova Venda", busque a peça pelo código ou nome, adicione à lista e finalize a venda. O estoque será atualizado automaticamente.' },
        { q: 'Como cancelar uma venda?', a: 'No histórico de vendas, clique no botão de cancelar (ícone vermelho) ao lado da venda desejada. O estoque será restaurado automaticamente.' },
        { q: 'Posso vender sem informar o cliente?', a: 'Sim! O campo de cliente é opcional. Se não informado, a venda será registrada como "Consumidor Final".' }
      ]
    },
    {
      category: 'Peças',
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      questions: [
        { q: 'Como cadastrar uma nova peça?', a: 'Na aba "Peças", clique em "Nova Peça", preencha os dados obrigatórios (código, nome, categoria, preços) e salve. Os campos com * são obrigatórios.' },
        { q: 'O que é Stock Mínimo?', a: 'É a quantidade mínima que você deseja manter em estoque. Quando o estoque atual ficar abaixo desse valor, a peça será destacada em vermelho/amarelo para alertá-lo.' },
        { q: 'Como funciona o cálculo de custo médio?', a: 'Ao registrar um abastecimento, o sistema calcula automaticamente o custo médio ponderado: (Estoque Antigo × Custo Antigo + Entrada × Custo Novo) / (Estoque Antigo + Entrada).' },
        { q: 'Como exportar a lista de peças?', a: 'Na tela de Peças, clique no botão "PDF" no canto superior direito. Isso abrirá a janela de impressão onde você pode salvar como PDF.' }
      ]
    },
    {
      category: 'Abastecimento',
      icon: 'M12 4v16m8-8H4',
      questions: [
        { q: 'Como registrar entrada de estoque?', a: 'Vá para "Abastecimento", clique em "Nova Entrada", busque a peça, informe a quantidade, custo unitário e fornecedor. O sistema atualizará o estoque e recalculará o custo médio.' },
        { q: 'Posso filtrar abastecimentos por data?', a: 'Sim! Use os filtros de "Data Início" e "Data Fim" na parte superior da tela para visualizar entradas de um período específico. Também é possível filtrar por fornecedor.' }
      ]
    },
    {
      category: 'Veículos',
      icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
      questions: [
        { q: 'Como buscar peças por veículo?', a: 'Na aba "Veículos", selecione a marca, modelo e ano do veículo. O sistema mostrará todas as peças compatíveis cadastradas.' },
        { q: 'Como cadastrar compatibilidade?', a: 'Clique em "Cadastrar Compatibilidade", selecione a peça, escolha marca/modelo/ano e salve. A peça aparecerá nas buscas futuras para esse veículo.' }
      ]
    },
    {
      category: 'Relatórios',
      icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      questions: [
        { q: 'Quais relatórios estão disponíveis?', a: 'Vendas por Período, Ranking de Peças, Stock Baixo, Vendas por Categoria, Margem de Lucro, Inventário Completo e Comparação entre Anos.' },
        { q: 'Como exportar relatórios?', a: 'Cada relatório tem um botão "Exportar PDF". Clique nele para gerar e baixar o relatório em formato PDF profissional.' }
      ]
    },
    {
      category: 'Sistema',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
      questions: [
        { q: 'Como fazer backup dos dados?', a: 'Clique no ícone de configurações (engrenagem) no canto superior direito, depois em "Exportar JSON". Guarde esse arquivo em local seguro. Para restaurar, use "Restaurar".' },
        { q: 'Como mudar o idioma?', a: 'No topo da tela, ao lado do tema, há um seletor de idioma (PT/EN). Selecione o idioma desejado e a página será recarregada.' },
        { q: 'Como mudar a moeda?', a: 'Use o seletor de moeda no cabeçalho (MT/USD). Isso afeta apenas a exibição dos valores, não os dados salvos.' },
        { q: 'O sistema funciona offline?', a: 'Sim! Todos os dados são salvos localmente no seu navegador. Quando houver internet, eles serão sincronizados automaticamente com a nuvem.' },
        { q: 'Como exportar relatórios em PDF?', a: 'Em cada tela (Dashboard, Peças, Vendas, Abastecimento), há um botão "PDF" que permite exportar os dados para impressão ou arquivo.' }
      ]
    }
  ];
}

function getFAQEnglish() {
  return [
    {
      category: 'Sales',
      icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
      questions: [
        { q: 'How to make a sale?', a: 'Go to the "Sales" tab, click "New Sale", search for the part by code or name, add it to the list and complete the sale. Stock will be updated automatically.' },
        { q: 'How to cancel a sale?', a: 'In the sales history, click the cancel button (red icon) next to the desired sale. Stock will be restored automatically.' },
        { q: 'Can I sell without informing the customer?', a: 'Yes! The customer field is optional. If not informed, the sale will be registered as "Final Consumer".' }
      ]
    },
    {
      category: 'Parts',
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      questions: [
        { q: 'How to register a new part?', a: 'In the "Parts" tab, click "New Part", fill in the required data (code, name, category, prices) and save. Fields with * are required.' },
        { q: 'What is Minimum Stock?', a: 'It is the minimum quantity you want to keep in stock. When the current stock falls below this value, the part will be highlighted in red/yellow to alert you.' },
        { q: 'How does average cost calculation work?', a: 'When registering a supply, the system automatically calculates the weighted average cost: (Old Stock × Old Cost + Entry × New Cost) / (Old Stock + Entry).' },
        { q: 'How to export the parts list?', a: 'On the Parts screen, click the "PDF" button in the upper right corner. This will open the print window where you can save as PDF.' }
      ]
    },
    {
      category: 'Supply',
      icon: 'M12 4v16m8-8H4',
      questions: [
        { q: 'How to register stock entry?', a: 'Go to "Supply", click "New Entry", search for the part, enter quantity, unit cost and supplier. The system will update stock and recalculate average cost.' },
        { q: 'Can I filter supplies by date?', a: 'Yes! Use the "Start Date" and "End Date" filters at the top of the screen to view entries for a specific period. You can also filter by supplier.' }
      ]
    },
    {
      category: 'Vehicles',
      icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
      questions: [
        { q: 'How to search parts by vehicle?', a: 'In the "Vehicles" tab, select the brand, model and year of the vehicle. The system will show all registered compatible parts.' },
        { q: 'How to register compatibility?', a: 'Click "Register Compatibility", select the part, choose brand/model/year and save. The part will appear in future searches for that vehicle.' }
      ]
    },
    {
      category: 'Reports',
      icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      questions: [
        { q: 'What reports are available?', a: 'Sales by Period, Parts Ranking, Low Stock, Sales by Category, Profit Margin, Complete Inventory and Year-over-Year Comparison.' },
        { q: 'How to export reports?', a: 'Each report has an "Export PDF" button. Click it to generate and download the report in professional PDF format.' }
      ]
    },
    {
      category: 'System',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
      questions: [
        { q: 'How to backup data?', a: 'Click the settings icon (gear) in the upper right corner, then "Export JSON". Keep this file in a safe place. To restore, use "Restore".' },
        { q: 'How to change language?', a: 'At the top of the screen, next to the theme, there is a language selector (PT/EN). Select the desired language and the page will reload.' },
        { q: 'How to change currency?', a: 'Use the currency selector in the header (MT/USD). This only affects the display of values, not the saved data.' },
        { q: 'Does the system work offline?', a: 'Yes! All data is saved locally in your browser. When there is internet, it will be automatically synchronized with the cloud.' },
        { q: 'How to export reports to PDF?', a: 'On each screen (Dashboard, Parts, Sales, Supply), there is a "PDF" button that allows you to export data for printing or file.' }
      ]
    }
  ];
}
