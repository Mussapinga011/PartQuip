// Vendas Component - Complete Sales Management
import { dbOperations, syncQueue } from '../lib/db.js';
import { generateId, formatCurrency, formatDate, showToast } from '../utils/helpers.js';

export async function initVendas(container) {
  try {
    const pecas = await dbOperations.getAll('pecas');
    const categorias = await dbOperations.getAll('categorias');
    
    container.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-900">Vendas</h2>
          <div class="flex gap-2">
            <button id="btn-nova-venda" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition hidden" title="Nova Venda">
              Nova Venda
            </button>
            <button id="btn-ver-historico" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Histórico
            </button>
          </div>
        </div>

        <!-- Nova Venda View -->
        <div id="nova-venda-view" class="bg-white rounded-lg border border-gray-200 p-6">
          <form id="form-venda" class="space-y-6">
            <!-- Busca de Peça -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Buscar Peça</label>
              <div class="relative">
                <input 
                  type="text" 
                  id="busca-peca-venda" 
                  placeholder="Digite o código ou nome da peça..." 
                  autocomplete="off"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                <div id="resultados-busca" class="hidden absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"></div>
              </div>
            </div>

            <!-- Itens da Venda -->
            <div>
              <h3 class="text-sm font-medium text-gray-700 mb-3">Itens da Venda</h3>
              <div class="border border-gray-200 rounded-lg overflow-hidden">
                <table class="w-full">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-700">Código</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-700">Nome</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-700">Preço Unit.</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-700">Qtd</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-700">Subtotal</th>
                      <th class="px-4 py-2 text-right text-xs font-medium text-gray-700">Ação</th>
                    </tr>
                  </thead>
                  <tbody id="itens-venda" class="divide-y divide-gray-200">
                    <tr>
                      <td colspan="6" class="px-4 py-8 text-center text-gray-400">Nenhum item adicionado</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Detalhes do Pagamento e Data -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Forma de Pagamento *</label>
                <select id="pagamento-venda" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="M-Pesa">M-Pesa</option>
                  <option value="E-mola">E-mola</option>
                  <option value="M-Kesh">M-Kesh</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Data da Venda *</label>
                <input 
                  type="datetime-local" 
                  id="data-venda" 
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                <p class="text-[10px] text-gray-500 mt-1">Útil para lançar vendas do caderninho</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Cliente / Veículo</label>
                <input 
                  type="text" 
                  id="cliente-venda" 
                  placeholder="Ex: Toyota Corolla 2015"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
              </div>
            </div>

            <!-- Observações -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Observações</label>
              <input 
                type="text" 
                id="obs-venda" 
                placeholder="Observações adicionais..."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
            </div>

            <!-- Total e Ações -->
            <div class="flex items-center justify-between pt-4 border-t border-gray-200">
              <div>
                <p class="text-sm text-gray-600">Total da Venda</p>
                <p id="total-venda" class="text-3xl font-bold text-primary">R$ 0,00</p>
              </div>
              <div class="flex gap-3">
                <button 
                  type="button" 
                  id="btn-limpar-venda" 
                  class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Limpar
                </button>
                <button 
                  type="submit" 
                  id="btn-finalizar-venda" 
                  class="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition flex items-center gap-2"
                  disabled
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Finalizar Venda
                </button>
              </div>
            </div>
          </form>
        </div>

        <!-- Historico View -->
        <div id="historico-venda-view" class="hidden bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div class="p-6 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Histórico de Vendas</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nº Venda</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peça</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pagamento</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ação</th>
                </tr>
              </thead>
              <tbody id="historico-tbody" class="bg-white divide-y divide-gray-200">
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
      document.getElementById('data-venda').value = now.toISOString().slice(0, 16);
    }, 100);

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

    // Busca de peças
    const buscaInput = document.getElementById('busca-peca-venda');
    const resultadosDiv = document.getElementById('resultados-busca');

    buscaInput.addEventListener('input', (e) => {
      const termo = e.target.value.toLowerCase().trim();
      
      if (termo.length < 2) {
        resultadosDiv.classList.add('hidden');
        return;
      }

      const resultados = pecas.filter(p => 
        p.codigo.toLowerCase().includes(termo) || 
        p.nome.toLowerCase().includes(termo)
      ).slice(0, 10);

      if (resultados.length === 0) {
        resultadosDiv.innerHTML = '<div class="p-3 text-sm text-gray-500">Nenhuma peça encontrada</div>';
      } else {
        resultadosDiv.innerHTML = resultados.map(p => {
          const categoria = categorias.find(c => c.id === p.categoria_id);
          const stockBaixo = p.stock_atual < p.stock_minimo;
          
          return `
            <div class="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0" data-peca-id="${p.id}">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-900">${p.codigo} - ${p.nome}</p>
                  <p class="text-xs text-gray-500">${categoria?.nome || 'Sem categoria'}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium text-gray-900">${formatCurrency(p.preco_venda)}</p>
                  <p class="text-xs ${stockBaixo ? 'text-red-600' : 'text-green-600'}">
                    Stock: ${p.stock_atual} un
                  </p>
                </div>
              </div>
            </div>
          `;
        }).join('');

        // Add click handlers
        resultadosDiv.querySelectorAll('[data-peca-id]').forEach(el => {
          el.addEventListener('click', () => {
            const pecaId = el.dataset.pecaId;
            const peca = pecas.find(p => p.id === pecaId);
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
          showToast('Stock insuficiente', 'error');
          return;
        }
        existente.quantidade++;
        existente.subtotal = existente.quantidade * existente.preco_unitario;
      } else {
        if (peca.stock_atual === 0) {
          showToast('Peça sem stock', 'error');
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
        tbody.innerHTML = '<tr><td colspan="6" class="px-4 py-8 text-center text-gray-400">Nenhum item adicionado</td></tr>';
        return;
      }

      tbody.innerHTML = itensVenda.map((item, index) => `
        <tr>
          <td class="px-4 py-2 text-sm font-medium text-gray-900">${item.codigo}</td>
          <td class="px-4 py-2 text-sm text-gray-700">${item.nome}</td>
          <td class="px-4 py-2 text-sm text-gray-900">${formatCurrency(item.preco_unitario)}</td>
          <td class="px-4 py-2">
            <div class="flex items-center gap-2">
              <button 
                type="button" 
                class="w-6 h-6 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
                onclick="window.vendaActions.decrementarQtd(${index})"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                </svg>
              </button>
              <span class="w-8 text-center text-sm font-medium">${item.quantidade}</span>
              <button 
                type="button" 
                class="w-6 h-6 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
                onclick="window.vendaActions.incrementarQtd(${index})"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
              </button>
            </div>
          </td>
          <td class="px-4 py-2 text-sm font-medium text-gray-900">${formatCurrency(item.subtotal)}</td>
          <td class="px-4 py-2 text-right">
            <button 
              type="button" 
              class="text-red-600 hover:text-red-800 text-sm"
              onclick="window.vendaActions.removerItem(${index})"
            >
              Remover
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
          showToast('Stock insuficiente', 'error');
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
        showToast('Adicione itens à venda', 'error');
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

        // Save each item as a sale
        for (const item of itensVenda) {
          const vendaData = {
            id: generateId(),
            numero_venda: numeroVenda,
            peca_id: item.peca_id,
            quantidade: item.quantidade,
            preco_unitario: item.preco_unitario,
            total: item.subtotal,
            cliente_veiculo: clienteVehiculo || null,
            forma_pagamento: formaPagamento,
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

        showToast(`Venda ${numeroVenda} finalizada com sucesso!`, 'success');
        
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
        showToast('Erro ao finalizar venda', 'error');
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

    // Render Historico
    async function renderHistorico() {
      const tbody = document.getElementById('historico-tbody');
      tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4">Carregando...</td></tr>'; // Updated colspan
      
      const allVendas = await dbOperations.getAll('vendas');
      // Sort by created_at desc
      allVendas.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      if (allVendas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="px-6 py-4 text-center text-gray-500">Nenhuma venda registrada</td></tr>'; // Updated colspan
        return;
      }

      tbody.innerHTML = allVendas.map(v => {
        const peca = pecas.find(p => p.id === v.peca_id);
        const isCancelled = v.status === 'cancelada';
        
        return `
          <tr class="${isCancelled ? 'bg-red-50' : 'hover:bg-gray-50'}">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(v.created_at, 'dd/MM/yyyy HH:mm')}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${v.numero_venda || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${peca ? peca.codigo : 'Item excluído'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${v.quantidade}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${formatCurrency(v.total)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${v.forma_pagamento || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isCancelled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}">
                ${isCancelled ? 'Cancelada' : 'Confirmada'}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              ${!isCancelled ? `
                <button class="text-red-600 hover:text-red-900 ml-3" onclick="window.vendaActions.cancelarVenda('${v.id}')">Cancelar</button>
              ` : '-'}
            </td>
          </tr>
        `;
      }).join('');
    }

    // Add Cancel Action to Global Scope
    window.vendaActions.cancelarVenda = async (id) => {
      if (!confirm('Tem certeza que deseja cancelar esta venda? O stock será restaurado.')) return;

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

        showToast('Venda cancelada e stock restaurado', 'success');
        renderHistorico();
        
      } catch (error) {
        console.error('Erro ao cancelar venda:', error);
        showToast('Erro ao cancelar venda', 'error');
      }
    };

  } catch (error) {
    console.error('Vendas error:', error);
    container.innerHTML = '<p class="text-red-500">Erro ao carregar vendas</p>';
  }
}
