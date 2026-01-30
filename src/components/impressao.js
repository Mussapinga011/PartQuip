// Impressao Component - Receipt Printing
import { dbOperations } from '../lib/db.js';
import { formatCurrency, formatDate } from '../utils/helpers.js';
import { t } from '../lib/i18n.js';

export async function initImpressao(container, vendaId = null) {
  // If vendaId is provided, we go straight to printing preview for that sale
  // Otherwise, we show a list of recent sales to select from
  
  if (vendaId) {
    await showPrintPreview(container, vendaId);
    return;
  }

  try {
    const vendas = await dbOperations.getAll('vendas');
    const pecas = await dbOperations.getAll('pecas');
    
    // Sort by date desc
    vendas.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    container.innerHTML = `
      <div class="space-y-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">${t('receipt_printing') || 'Impressão de Recibos'}</h2>
        
        <!-- Filters -->
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
               <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">${t('search')}</label>
               <input type="text" id="print-search" placeholder="${t('search_placeholder') || 'Buscar venda, cliente...'}" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent">
            </div>
             <div>
               <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">${t('start_date') || 'Data Inicio'}</label>
               <input type="date" id="print-date-start" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent">
            </div>
             <div>
               <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">${t('end_date') || 'Data Fim'}</label>
               <input type="date" id="print-date-end" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent">
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
           <div class="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${t('select_sale_print') || 'Selecione uma Venda para Imprimir'}</h3>
            <span id="result-count" class="text-sm text-gray-500 dark:text-gray-400">Showing 20 results</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
               <thead class="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">${t('sale_date')}</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">${t('sale_number') || 'Nº Venda'}</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">${t('client')}</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">${t('total')}</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">${t('actions')}</th>
                </tr>
              </thead>
              <tbody id="print-tbody" class="divide-y divide-gray-200 dark:divide-gray-700">
                <!-- Dynamic Content -->
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    function renderTable(data) {
      const tbody = document.getElementById('print-tbody');
      const countEl = document.getElementById('result-count');
      
      if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">${t('no_records') || 'Nenhum registro encontrado'}</td></tr>`;
        countEl.textContent = '0 results';
        return;
      }

      countEl.textContent = `Showing ${Math.min(data.length, 50)} of ${data.length} results`;

      tbody.innerHTML = data.slice(0, 50).map(v => `
        <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">${formatDate(v.created_at, 'dd/MM/yyyy HH:mm')}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">${v.numero_venda || '-'}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">${v.cliente_nome || v.cliente_veiculo || t('not_informed') || 'Não informado'}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">${formatCurrency(v.total)}</td>
          <td class="px-6 py-4 whitespace-nowrap text-right">
            <button class="btn-print text-primary hover:text-primary-dark font-medium transition" data-id="${v.id}">${t('print') || 'Imprimir'}</button>
          </td>
        </tr>
      `).join('');

      // Re-attach listeners
      document.querySelectorAll('.btn-print').forEach(btn => {
        btn.addEventListener('click', () => {
          showPrintPreview(container, btn.dataset.id);
        });
      });
    }

    // Initial Render
    renderTable(vendas);

    // Filter Logic
    function applyFilters() {
      const termo = document.getElementById('print-search').value.toLowerCase().trim();
      const dataInicio = document.getElementById('print-date-start').value;
      const dataFim = document.getElementById('print-date-end').value;

      const filtered = vendas.filter(v => {
         // Search Term
         const searchMatch = !termo || 
           (v.numero_venda && v.numero_venda.toLowerCase().includes(termo)) ||
           (v.cliente_nome && v.cliente_nome.toLowerCase().includes(termo)) ||
           (v.cliente_veiculo && v.cliente_veiculo.toLowerCase().includes(termo));

         if (!searchMatch) return false;

         // Date Range
         if (dataInicio && new Date(v.created_at) < new Date(dataInicio).setHours(0,0,0,0)) return false;
         if (dataFim && new Date(v.created_at) > new Date(dataFim).setHours(23,59,59,999)) return false;

         return true;
      });

      renderTable(filtered);
    }

    document.getElementById('print-search').addEventListener('input', applyFilters);
    document.getElementById('print-date-start').addEventListener('change', applyFilters);
    document.getElementById('print-date-end').addEventListener('change', applyFilters);

  } catch (error) {
    console.error('Impressao error:', error);
    container.innerHTML = '<p class="text-red-500">Erro ao carregar lista de vendas</p>';
  }
}

async function showPrintPreview(container, vendaId) {
  try {
    if (!vendaId) throw new Error('ID da venda não fornecido');
    const venda = await dbOperations.getById('vendas', vendaId);
    if (!venda) throw new Error(t('sale_not_found') || 'Venda não encontrada');
    
    let peca = null;
    if (venda.peca_id) {
      peca = await dbOperations.getById('pecas', venda.peca_id);
    }
    
    // Receipt Template
    const receiptHTML = `
      <div id="receipt-preview" class="bg-white dark:bg-gray-800 p-8 max-w-2xl mx-auto shadow-lg my-8 border border-gray-200 dark:border-gray-700">
        <div class="text-center mb-8">
          <img src="/logo_modo_escuro.svg" class="w-48 mx-auto mb-4" alt="ShingMotors">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">ShingMotors</h1>
          <p class="text-gray-600 dark:text-gray-400">N_55, 1st street</p>
          <p class="text-gray-600 dark:text-gray-400">Email: shingmotorspvt@gmail.com</p>
        </div>
        
        <div class="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
          <div class="flex justify-between mb-2">
            <span class="text-gray-600 dark:text-gray-400">${t('sale_date')}:</span>
            <span class="font-medium text-gray-900 dark:text-white">${formatDate(venda.created_at, 'dd/MM/yyyy HH:mm')}</span>
          </div>
          <div class="flex justify-between mb-2">
            <span class="text-gray-600 dark:text-gray-400">${t('sale_number')}:</span>
            <span class="font-medium text-gray-900 dark:text-white">${venda.numero_venda || '-'}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">${t('client')}:</span>
            <span class="font-medium text-gray-900 dark:text-white">${venda.cliente_nome || venda.cliente_veiculo || t('consumer_final') || 'Consumidor Final'}</span>
          </div>
        </div>
        
        <table class="w-full mb-8">
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700 text-left">
              <th class="py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">${t('item') || 'Item'}</th>
              <th class="py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 text-center">${t('quantity_short')}</th>
              <th class="py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 text-right">${t('sale_price')}</th>
              <th class="py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 text-right">${t('total')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="py-3 text-sm text-gray-800 dark:text-gray-200">
                ${peca ? peca.nome : (venda.peca_nome || t('item_deleted') || 'Item removido')} 
                <span class="text-xs text-gray-500 dark:text-gray-500">(${peca ? peca.codigo : (venda.peca_codigo || '?')})</span>
              </td>
              <td class="py-3 text-sm text-gray-800 dark:text-gray-200 text-center">${venda.quantidade}</td>
              <td class="py-3 text-sm text-gray-800 dark:text-gray-200 text-right">${formatCurrency(venda.preco_venda || (venda.total / venda.quantidade))}</td>
              <td class="py-3 text-sm text-gray-800 dark:text-gray-200 text-right font-medium">${formatCurrency(venda.total)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="border-t border-gray-200 dark:border-gray-700">
              <td colspan="3" class="py-4 text-right font-bold text-gray-900 dark:text-white uppercase">${t('total')}</td>
              <td class="py-4 text-right font-bold text-xl text-primary">${formatCurrency(venda.total)}</td>
            </tr>
          </tfoot>
        </table>
        
        <div class="text-center text-sm text-gray-500 dark:text-gray-400 mt-12">
          <p>${t('thanks_preference') || 'Obrigado pela preferência!'}</p>
          <p class="mt-1">${t('exchange_policy') || 'Trocas somente com este recibo em até 7 dias.'}</p>
        </div>
      </div>

       <div class="max-w-2xl mx-auto flex gap-4 mt-6 no-print">
        <button id="btn-print-confirm" class="flex-1 bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-bold shadow-lg transition flex justify-center items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2-4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
          </svg>
          ${t('print')}
        </button>
        <button id="btn-back-main" class="px-6 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition">
          ${t('back')}
        </button>
      </div>

      <style>
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-preview, #receipt-preview * {
            visibility: visible;
          }
          #receipt-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none;
            border: none;
          }
          .no-print {
            display: none !important;
          }
        }
      </style>
    `;

    container.innerHTML = receiptHTML;

    document.getElementById('btn-print-confirm').addEventListener('click', () => {
      window.print();
    });

    document.getElementById('btn-back-main').addEventListener('click', () => {
      initImpressao(container); // Go back to list
    });

  } catch (error) {
    console.error('Preview error:', error);
    container.innerHTML = '<p class="text-red-500">Erro ao gerar recibo</p>';
  }
}
