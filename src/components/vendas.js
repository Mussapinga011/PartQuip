// Vendas Component - Complete Sales Management
import { dbOperations, syncQueue } from '../lib/db.js';
import { generateId, formatCurrency, formatDate, showToast, confirm } from '../utils/helpers.js';
import { t } from '../lib/i18n.js';
import { searchService } from '../lib/search.js';

export async function initVendas(container) {
  try {
    const pecas = await dbOperations.getAll('pecas');
    const categorias = await dbOperations.getAll('categorias');
    
    container.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">${t('vendas')}</h2>
          <div class="flex gap-2">
            <button id="btn-nova-venda" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition hidden" title="${t('new_sale')}">
              ${t('new_sale')}
            </button>
            <button id="btn-ver-historico" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              ${t('history')}
            </button>
          </div>
        </div>

        <!-- Nova Venda View -->
        <div id="nova-venda-view" class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <form id="form-venda" class="space-y-6">
            <!-- Busca de Peça -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${t('search')}</label>
              <div class="relative">
                <input 
                  type="text" 
                  id="busca-peca-venda" 
                  placeholder="${t('search')}..." 
                  autocomplete="off"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                <div id="resultados-busca" class="hidden absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"></div>
              </div>
            </div>

            <!-- Itens da Venda -->
            <div>
              <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">${t('recent_sales')}</h3>
              <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <table class="w-full">
                  <thead class="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">${t('code')}</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">${t('name')}</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">${t('price')}</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">${t('quantity')}</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">${t('subtotal')}</th>
                      <th class="px-4 py-2 text-right text-xs font-medium text-gray-700 dark:text-gray-300">${t('action')}</th>
                    </tr>
                  </thead>
                  <tbody id="itens-venda" class="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td colspan="6" class="px-4 py-8 text-center text-gray-400 dark:text-gray-500">${t('no_items_added') || 'Nenhum item adicionado'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Detalhes do Pagamento e Data -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${t('payment_method')} *</label>
                <select id="pagamento-venda" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                  <option value="Dinheiro">${t('cash') || 'Dinheiro'}</option>
                  <option value="M-Pesa">M-Pesa</option>
                  <option value="E-mola">E-mola</option>
                  <option value="M-Kesh">M-Kesh</option>
                  <option value="Cartão de Crédito">${t('credit_card') || 'Cartão de Crédito'}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${t('sale_date')} *</label>
                <input 
                  type="datetime-local" 
                  id="data-venda" 
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${t('client_vehicle')}</label>
                <input 
                  type="text" 
                  id="cliente-venda" 
                  placeholder="Ex: Toyota Corolla 2015"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
              </div>
            </div>

            <!-- Observações -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${t('observations')}</label>
              <input 
                type="text" 
                id="obs-venda" 
                placeholder="${t('observations')}..."
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
            </div>

            <!-- Total e Ações -->
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div class="text-center sm:text-left">
                <p class="text-sm text-gray-600 dark:text-gray-400">${t('total')}</p>
                <p id="total-venda" class="text-3xl font-bold text-primary">R$ 0,00</p>
              </div>
              <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button 
                  type="button" 
                  id="btn-limpar-venda" 
                  class="w-full sm:w-auto px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition"
                >
                  ${t('clear')}
                </button>
                <button 
                  type="submit" 
                  id="btn-finalizar-venda" 
                  class="w-full sm:w-auto px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition flex items-center justify-center gap-2"
                  disabled
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  ${t('finish_sale')}
                </button>
              </div>
            </div>
          </form>
        </div>

        <!-- Historico View -->
        <div id="historico-venda-view" class="hidden bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${t('history')}</h3>
              <div class="flex gap-2">
                <button id="btn-export-vendas-excel" class="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-green-600 transition" title="Exportar Ano (Excel)">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </button>
                <button id="btn-export-vendas-pdf" class="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-red-600 transition" title="Exportar Ano (PDF)">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path></svg>
                </button>
                <button id="btn-export-vendas-tudo" class="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-xs font-bold rounded-lg transition border border-gray-300 dark:border-gray-600 flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  Exportar Histórico Completo
                </button>
              </div>
            </div>
            <!-- Year Tabs -->
            <div id="historico-anos" class="flex flex-wrap gap-2">
              <!-- Tabs injected via JS -->
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">${t('sale_date')}</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nº Venda</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Peça</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">${t('quantity')}</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">${t('total')}</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">${t('payment_method')}</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vendedor</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">${t('action')}</th>
                </tr>
              </thead>
              <tbody id="historico-tbody" class="divide-y divide-gray-200 dark:divide-gray-700">
                <!-- Rows injected via JS -->
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // Set default date to now
    setTimeout(() => {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      const dataInput = document.getElementById('data-venda');
      if (dataInput) dataInput.value = now.toISOString().slice(0, 16);
    }, 100);

    // State
    let itensVenda = [];
    let totalVenda = 0;
    let currentYearFilter = new Date().getFullYear();

    // Check for pending items from vehicle search
    const pendingItems = JSON.parse(localStorage.getItem('temp_venda_items') || '[]');
    if (pendingItems.length > 0) {
      itensVenda = [...itensVenda, ...pendingItems];
      localStorage.removeItem('temp_venda_items');
      setTimeout(() => {
        renderItens();
        calcularTotal();
      }, 100);
    }

    // Busca de peças
    const buscaInput = document.getElementById('busca-peca-venda');
    const resultadosDiv = document.getElementById('resultados-busca');

    buscaInput.addEventListener('input', (e) => {
      const termo = e.target.value.toLowerCase().trim();
      
      if (termo.length < 2) {
        resultadosDiv.classList.add('hidden');
        return;
      }

      // Use searchService to find matches
      const resultados = pecas.filter(p => 
        p.codigo.toLowerCase().includes(termo) || 
        p.nome.toLowerCase().includes(termo) ||
        p.localizacao?.toLowerCase().includes(termo)
      ).slice(0, 10);

      if (resultados.length === 0) {
        resultadosDiv.innerHTML = `
          <div class="p-3 text-sm text-gray-500 dark:text-gray-400">
            ${t('no_records')}
          </div>
        `;
      } else {
        resultadosDiv.innerHTML = resultados.map(p => {
          const categoria = categorias.find(c => c.id === p.categoria_id);
          const stockBaixo = p.stock_atual < p.stock_minimo;
          
          return `
            <div class="p-3 hover:bg-gray-50 dark:hover:bg-gray-600/50 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-0" data-peca-id="${p.id}">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">${p.codigo} - ${p.nome}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">${categoria?.nome || t('no_category') || 'Sem categoria'}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">${formatCurrency(p.preco_venda)}</p>
                  <p class="text-xs ${stockBaixo ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}">
                    ${t('stock')}: ${p.stock_atual} un
                  </p>
                </div>
              </div>
            </div>
          `;
        }).join('');

        // Add history section if it exists
        const history = searchService.getHistory();
        if (history.length > 0) {
           const historyHtml = `
            <div class="bg-gray-50 dark:bg-gray-800 p-2 text-[10px] uppercase font-bold text-gray-400 border-t border-b border-gray-200 dark:border-gray-600">Buscas Recentes</div>
            <div class="flex flex-wrap gap-1 p-2">
              ${history.slice(0, 5).map(h => `
                <span class="px-2 py-1 bg-white dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 cursor-pointer hover:border-primary transition" data-history-term="${h}">${h}</span>
              `).join('')}
            </div>
           `;
           resultadosDiv.insertAdjacentHTML('afterbegin', historyHtml);
           
           resultadosDiv.querySelectorAll('[data-history-term]').forEach(el => {
             el.addEventListener('click', (e) => {
               e.stopPropagation();
               buscaInput.value = el.dataset.historyTerm;
               buscaInput.dispatchEvent(new Event('input'));
             });
           });
        }

        // Add click handlers
        resultadosDiv.querySelectorAll('[data-peca-id]').forEach(el => {
          el.addEventListener('click', () => {
            const pecaId = el.dataset.pecaId;
            const peca = pecas.find(p => p.id === pecaId);
            
            // Add to history when selected
            searchService.addToHistory(peca.nome);
            searchService.addToHistory(peca.codigo);
            
            adicionarItem(peca);
            buscaInput.value = '';
            resultadosDiv.classList.add('hidden');
          });
        });
      }

      resultadosDiv.classList.remove('hidden');
    });

    // Close results when clicking outside
    document.addEventListener('click', (e) => {
      if (!buscaInput.contains(e.target) && !resultadosDiv.contains(e.target)) {
        resultadosDiv.classList.add('hidden');
      }
    });

    // Adicionar item à venda
    function adicionarItem(peca) {
      // Check if already in cart
      const existente = itensVenda.find(i => i.peca_id === peca.id);
      
      if (existente) {
        if (existente.quantidade >= peca.stock_atual) {
          showToast(t('insufficient_stock') || 'Stock insuficiente', 'error');
          return;
        }
        existente.quantidade++;
        existente.subtotal = existente.quantidade * existente.preco_unitario;
      } else {
        if (peca.stock_atual === 0) {
          showToast(t('out_of_stock') || 'Peça sem stock', 'error');
          return;
        }
        
        itensVenda.push({
          peca_id: peca.id,
          codigo: peca.codigo,
          nome: peca.nome,
          preco_unitario: peca.preco_venda,
          quantidade: 1,
          subtotal: peca.preco_venda,
          stock_disponivel: peca.stock_atual
        });
      }

      renderItens();
      calcularTotal();
    }

    // Render itens
    function renderItens() {
      const tbody = document.getElementById('itens-venda');
      
      if (itensVenda.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="px-4 py-8 text-center text-gray-400 dark:text-gray-500">${t('no_items_added') || 'Nenhum item adicionado'}</td></tr>`;
        return;
      }

      tbody.innerHTML = itensVenda.map((item, index) => `
        <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
          <td class="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">${item.codigo}</td>
          <td class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">${item.nome}</td>
          <td class="px-4 py-2 text-sm text-gray-900 dark:text-white">${formatCurrency(item.preco_unitario)}</td>
          <td class="px-4 py-2">
            <div class="flex items-center gap-2">
              <button 
                type="button" 
                class="w-6 h-6 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition"
                onclick="window.vendaActions.decrementarQtd(${index})"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                </svg>
              </button>
              <span class="w-8 text-center text-sm font-medium text-gray-900 dark:text-white">${item.quantidade}</span>
              <button 
                type="button" 
                class="w-6 h-6 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition"
                onclick="window.vendaActions.incrementarQtd(${index})"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
              </button>
            </div>
          </td>
          <td class="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">${formatCurrency(item.subtotal)}</td>
          <td class="px-4 py-2 text-right">
            <button 
              type="button" 
              class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm transition"
              onclick="window.vendaActions.removerItem(${index})"
            >
              ${t('remove') || 'Remover'}
            </button>
          </td>
        </tr>
      `).join('');
    }

    // Calcular total
    function calcularTotal() {
      totalVenda = itensVenda.reduce((sum, item) => sum + item.subtotal, 0);
      document.getElementById('total-venda').textContent = formatCurrency(totalVenda);
      document.getElementById('btn-finalizar-venda').disabled = itensVenda.length === 0;
    }

    // Global actions
    window.vendaActions = {
      incrementarQtd(index) {
        const item = itensVenda[index];
        if (item.quantidade >= item.stock_disponivel) {
          showToast(t('insufficient_stock') || 'Stock insuficiente', 'error');
          return;
        }
        item.quantidade++;
        item.subtotal = item.quantidade * item.preco_unitario;
        renderItens();
        calcularTotal();
      },
      decrementarQtd(index) {
        const item = itensVenda[index];
        if (item.quantidade > 1) {
          item.quantidade--;
          item.subtotal = item.quantidade * item.preco_unitario;
          renderItens();
          calcularTotal();
        }
      },
      removerItem(index) {
        itensVenda.splice(index, 1);
        renderItens();
        calcularTotal();
      }
    };

    // Limpar venda
    document.getElementById('btn-limpar-venda').addEventListener('click', () => {
      itensVenda = [];
      renderItens();
      calcularTotal();
      document.getElementById('cliente-venda').value = '';
      document.getElementById('obs-venda').value = '';
      // Reset date to now
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      document.getElementById('data-venda').value = now.toISOString().slice(0, 16);
      document.getElementById('pagamento-venda').value = 'Dinheiro'; // Reset to default payment
    });

    // Finalizar venda
    document.getElementById('form-venda').addEventListener('submit', async (e) => {
      e.preventDefault();

      if (itensVenda.length === 0) {
        showToast(t('add_items_to_sale') || 'Adicione itens à venda', 'error');
        return;
      }

      const clienteVehiculo = document.getElementById('cliente-venda').value;
      const observacoes = document.getElementById('obs-venda').value;
      const formaPagamento = document.getElementById('pagamento-venda').value;
      const dataVenda = new Date(document.getElementById('data-venda').value).toISOString();

      try {
        // Generate sale number: V + YYYYMMDD + sequential
        const dataSelecionada = new Date(dataVenda);
        const dataStr = dataSelecionada.toISOString().split('T')[0].replace(/-/g, '');
        const vendasDB = await dbOperations.getAll('vendas');
        const vendasDaqueleDia = vendasDB.filter(v => v.numero_venda?.startsWith('V' + dataStr));
        const sequencial = (vendasDaqueleDia.length + 1).toString().padStart(3, '0');
        const numeroVenda = `V${dataStr}${sequencial}`;

        // Get current user for salesman name
        const user = await supabaseHelpers.getCurrentUser();
        const vendedorNome = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Sistema';

        // Save each item as a sale
        for (const item of itensVenda) {
          const vendaData = {
            id: generateId(),
            numero_venda: numeroVenda,
            peca_id: item.peca_id,
            peca_codigo: item.codigo,
            peca_nome: item.nome,
            quantidade: item.quantidade,
            preco_unitario: item.preco_unitario,
            total: item.subtotal,
            cliente_veiculo: clienteVehiculo || null,
            vendedor_nome: vendedorNome,
            forma_pagamento: formaPagamento,
            status: 'confirmada',
            observacoes: observacoes || null,
            created_at: dataVenda,
            updated_at: new Date().toISOString()
          };

          await dbOperations.add('vendas', vendaData);
          await syncQueue.add('insert', 'vendas', vendaData);

          // Update stock
          const peca = await dbOperations.getById('pecas', item.peca_id);
          if (peca) {
            peca.stock_atual -= item.quantidade;
            peca.updated_at = new Date().toISOString();
            await dbOperations.put('pecas', peca);
            await syncQueue.add('update', 'pecas', peca);
          }
        }

        showToast(t('sale_finish_success')?.replace('{number}', numeroVenda) || `Venda ${numeroVenda} finalizada com sucesso!`, 'success');
        
        // Reset form
        itensVenda = [];
        renderItens();
        calcularTotal();
        document.getElementById('cliente-venda').value = '';
        document.getElementById('obs-venda').value = '';
        // Reset date to now
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        document.getElementById('data-venda').value = now.toISOString().slice(0, 16);
        document.getElementById('pagamento-venda').value = 'Dinheiro'; // Reset to default payment

      } catch (error) {
        console.error('Error saving sale:', error);
        showToast(t('sale_finish_error') || 'Erro ao finalizar venda', 'error');
      }
    });

    // Event Listeners for switching views
    document.getElementById('btn-ver-historico').addEventListener('click', () => {
      document.getElementById('nova-venda-view').classList.add('hidden');
      document.getElementById('historico-venda-view').classList.remove('hidden');
      document.getElementById('btn-ver-historico').classList.add('hidden');
      document.getElementById('btn-nova-venda').classList.remove('hidden');
      renderHistorico();
    });

    document.getElementById('btn-nova-venda').addEventListener('click', () => {
      document.getElementById('historico-venda-view').classList.add('hidden');
      document.getElementById('nova-venda-view').classList.remove('hidden');
      document.getElementById('btn-nova-venda').classList.add('hidden');
      document.getElementById('btn-ver-historico').classList.remove('hidden');
    });

    // Render Historico with Year Tabs
    async function renderHistorico() {
      const tbody = document.getElementById('historico-tbody');
      const tabsContainer = document.getElementById('historico-anos');
      
      tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-gray-500 dark:text-gray-400">${t('loading') || 'Carregando...'}</td></tr>`;
      
      const allVendas = await dbOperations.getAll('vendas');
      
      // Calculate available years
      const years = [...new Set(allVendas.map(v => new Date(v.created_at).getFullYear()))].sort((a, b) => b - a);
      if (!years.includes(new Date().getFullYear())) {
        years.unshift(new Date().getFullYear());
      }

      // Render Tabs
      tabsContainer.innerHTML = years.map(year => `
        <button 
          class="year-tab px-4 py-1.5 rounded-full text-sm font-medium transition ${year === currentYearFilter ? 'bg-primary text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}"
          data-year="${year}"
        >
          ${year}
        </button>
      `).join('');

      // Add click handlers to tabs
      tabsContainer.querySelectorAll('.year-tab').forEach(btn => {
        btn.addEventListener('click', () => {
          currentYearFilter = parseInt(btn.dataset.year);
          renderHistorico(); // Re-render to update tabs and filtering
        });
      });

      // Filter by selected year
      const filteredVendas = allVendas.filter(v => new Date(v.created_at).getFullYear() === currentYearFilter);
      
      // Sort by created_at desc
      filteredVendas.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      if (filteredVendas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">${t('no_records_year') || 'Nenhum registro encontrado para este ano.'}</td></tr>`;
        return;
      }

      tbody.innerHTML = filteredVendas.map(v => {
        const peca = pecas.find(p => p.id === v.peca_id);
        const isCancelled = v.status === 'cancelada';
        
        return `
          <tr class="${isCancelled ? 'bg-red-50 dark:bg-red-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${formatDate(v.created_at, 'dd/MM/yyyy HH:mm')}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">${v.numero_venda || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
              ${v.peca_codigo || (peca ? peca.codigo : (t('item_deleted') || 'Item excluído'))} - 
              ${v.peca_nome || (peca ? peca.nome : '')}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">${v.quantidade}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">${formatCurrency(v.total)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${t(v.forma_pagamento?.toLowerCase()) || v.forma_pagamento || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${v.vendedor_nome || 'Admin'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isCancelled ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'}">
                ${isCancelled ? (t('cancelled') || 'Cancelada') : (t('confirmed') || 'Confirmada')}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              ${!isCancelled ? `
                <button class="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 ml-3 transition" onclick="window.vendaActions.cancelarVenda('${v.id}')">${t('cancel') || 'Cancelar'}</button>
              ` : '-'}
            </td>
          </tr>
        `;
      }).join('');

      // Add Export Handlers
      document.getElementById('btn-export-vendas-excel').onclick = () => {
        const table = document.querySelector('#historico-venda-view table');
        exportToCSV(table, `Historico_Vendas_${currentYearFilter}`);
      };

      document.getElementById('btn-export-vendas-pdf').onclick = async () => {
        const { jsPDF } = window.jspdf;
        const html2canvas = window.html2canvas;
        const historyTable = document.querySelector('#historico-venda-view .overflow-x-auto');
        
        if (!jsPDF || !html2canvas) {
           showToast('Biblioteca de PDF não carregada', 'error');
           return;
        }

        try {
          const canvas = await html2canvas(historyTable, { scale: 2 });
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const imgProps = pdf.getImageProperties(imgData);
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

          pdf.setFontSize(16);
          pdf.text(`${t('history')} - ${currentYearFilter}`, 15, 15);
          pdf.addImage(imgData, 'PNG', 0, 20, pdfWidth, pdfHeight);
          pdf.save(`Historico_Vendas_${currentYearFilter}.pdf`);
          showToast('PDF gerado com sucesso!', 'success');
        } catch (error) {
          console.error('Erro PDF:', error);
          showToast('Erro ao gerar PDF', 'error');
        }
      };

      document.getElementById('btn-export-vendas-tudo').onclick = async () => {
        const vendas = await dbOperations.getAll('vendas');
        if (vendas.length === 0) {
          showToast('Nenhum dado para exportar', 'error');
          return;
        }

        // CSV All
        const headers = ["Data", "Nº Venda", "Peça", "Qtd", "Total", "Pagamento", "Status"];
        const csvContent = [
          headers.join(','),
          ...vendas.map(v => [
            formatDate(v.created_at, 'dd/MM/yyyy HH:mm'),
            v.numero_venda || '-',
            `"${v.peca_codigo || ''} - ${v.peca_nome || ''}"`,
            v.quantidade,
            v.total,
            v.forma_pagamento,
            v.status
          ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'Historico_Vendas_Completo.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('Exportação completa (CSV) concluída!', 'success');
      };
    }

    function exportToCSV(table, filename) {
      const rows = Array.from(table.querySelectorAll('tr'));
      const csvContent = rows.map(row => {
        const cells = Array.from(row.querySelectorAll('th, td'));
        // Filter out actions column
        return cells.slice(0, -1).map(cell => `"${cell.textContent.trim().replace(/"/g, '""')}"`).join(',');
      }).filter(line => line.length > 0).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    // Add Cancel Action to Global Scope
    window.vendaActions.cancelarVenda = async (id) => {
      if (!await confirm(t('confirm_cancel_sale') || 'Tem certeza que deseja cancelar esta venda? O stock será restaurado.')) return;

      try {
        const venda = await dbOperations.getById('vendas', id);
        if (!venda) throw new Error('Venda não encontrada');
        
        // 1. Update venda status
        venda.status = 'cancelada';
        venda.updated_at = new Date().toISOString();
        await dbOperations.put('vendas', venda);
        await syncQueue.add('update', 'vendas', venda);

        // 2. Restore stock
        const peca = await dbOperations.getById('pecas', venda.peca_id);
        if (peca) {
          peca.stock_atual += venda.quantidade;
          peca.updated_at = new Date().toISOString();
          await dbOperations.put('pecas', peca);
          await syncQueue.add('update', 'pecas', peca);
        }

        showToast(t('sale_cancel_success') || 'Venda cancelada e stock restaurado', 'success');
        renderHistorico();
        
      } catch (error) {
        console.error('Erro ao cancelar venda:', error);
        showToast(t('sale_cancel_error') || 'Erro ao cancelar venda', 'error');
      }
    };

  } catch (error) {
    console.error('Vendas error:', error);
    container.innerHTML = '<p class="text-red-500">Erro ao carregar vendas</p>';
  }
}
