// Abastecimento Component - Supply Management
import { dbOperations, syncQueue } from '../lib/db.js';
import { generateId, showToast, formatCurrency, formatDate } from '../utils/helpers.js';

export async function initAbastecimento(container) {
  try {
    const pecas = await dbOperations.getAll('pecas');
    const fornecedores = await dbOperations.getAll('fornecedores');
    const abastecimentos = await dbOperations.getAll('abastecimentos');
    
    // Sort abastecimentos by date desc
    abastecimentos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    container.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-900">Abastecimento (Entrada de Stock)</h2>
          <button id="btn-novo-abastecimento" class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Nova Entrada
          </button>
        </div>

        <!-- History Table -->
        <div class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <div class="p-6 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Histórico de Entradas</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peça</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fornecedor</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Custo Unit.</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${renderAbastecimentosRows(abastecimentos, pecas, fornecedores)}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Modal Novo Abastecimento -->
      <div id="modal-abastecimento" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg max-w-lg w-full p-6">
          <h3 class="text-xl font-bold text-gray-900 mb-6">Registrar Entrada</h3>
          <form id="form-abastecimento" class="space-y-4">
            
            <!-- Busca Peça -->
            <div class="relative">
              <label class="block text-sm font-medium text-gray-700 mb-2">Peça *</label>
              <input type="text" id="busca-peca-abastecimento" placeholder="Digite código ou nome..." class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
              <input type="hidden" name="peca_id" required>
              <div id="resultados-peca-abastecimento" class="hidden absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1"></div>
            </div>
            <div id="peca-selecionada" class="hidden p-3 bg-blue-50 rounded-lg text-sm text-blue-800"></div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Fornecedor *</label>
              <select name="fornecedor_id" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                <option value="">Selecione...</option>
                ${fornecedores.map(f => `<option value="${f.id}">${f.nome}</option>`).join('')}
              </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Quantidade *</label>
                <input type="number" name="quantidade" min="1" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Custo Unitário (R$) *</label>
                <input type="number" name="valor_unitario" step="0.01" min="0" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
              </div>
            </div>

            <div class="flex gap-3 justify-end pt-4">
              <button type="button" id="btn-cancelar-abastecimento" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button type="submit" class="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition">
                Confirmar Entrada
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    setupAbastecimentoHandlers(container, pecas);

  } catch (error) {
    console.error('Abastecimento error:', error);
    container.innerHTML = '<p class="text-red-500">Erro ao carregar abastecimento</p>';
  }
}

function renderAbastecimentosRows(abastecimentos, pecas, fornecedores) {
  if (abastecimentos.length === 0) {
    return '<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">Nenhum registro encontrado</td></tr>';
  }

  return abastecimentos.map(a => {
    const peca = pecas.find(p => p.id === a.peca_id);
    const fornecedor = fornecedores.find(f => f.id === a.fornecedor_id);
    
    return `
      <tr class="hover:bg-gray-50">
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(a.created_at, 'dd/MM/yyyy HH:mm')}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${peca ? `${peca.codigo} - ${peca.nome}` : 'Peça excluída'}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${fornecedor ? fornecedor.nome : '-'}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">+${a.quantidade}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatCurrency(a.valor_unitario)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${formatCurrency(a.quantidade * a.valor_unitario)}</td>
      </tr>
    `;
  }).join('');
}

function setupAbastecimentoHandlers(container, pecas) {
  const modal = document.getElementById('modal-abastecimento');
  const form = document.getElementById('form-abastecimento');
  const searchInput = document.getElementById('busca-peca-abastecimento');
  const resultsDiv = document.getElementById('resultados-peca-abastecimento');
  const pecaSelecionadaDiv = document.getElementById('peca-selecionada');
  const pecaIdInput = form.querySelector('[name="peca_id"]');

  document.getElementById('btn-novo-abastecimento').addEventListener('click', () => {
    modal.classList.remove('hidden');
  });

  document.getElementById('btn-cancelar-abastecimento').addEventListener('click', () => {
    modal.classList.add('hidden');
    form.reset();
    pecaSelecionadaDiv.classList.add('hidden');
    pecaIdInput.value = '';
  });

  // Search logic (similar to Vendas)
  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    if (term.length < 2) {
      resultsDiv.classList.add('hidden');
      return;
    }

    const filtered = pecas.filter(p => 
      p.codigo.toLowerCase().includes(term) || 
      p.nome.toLowerCase().includes(term)
    ).slice(0, 5);

    if (filtered.length > 0) {
      resultsDiv.innerHTML = filtered.map(p => `
        <div class="p-3 hover:bg-gray-100 cursor-pointer" data-id="${p.id}">
          <div class="font-medium text-sm text-gray-900">${p.codigo} - ${p.nome}</div>
          <div class="text-xs text-gray-500">Stock Atual: ${p.stock_atual} | Custo Atual: ${formatCurrency(p.preco_custo)}</div>
        </div>
      `).join('');
      resultsDiv.classList.remove('hidden');

      resultsDiv.querySelectorAll('div[data-id]').forEach(div => {
        div.addEventListener('click', () => {
          const id = div.dataset.id;
          const peca = pecas.find(p => p.id === id);
          
          pecaIdInput.value = id;
          searchInput.value = ''; // Clear search
          resultsDiv.classList.add('hidden');
          
          pecaSelecionadaDiv.innerHTML = `
            <strong>Peça Selecionada:</strong> ${peca.codigo} - ${peca.nome}<br>
            <span class="text-xs">Stock Atual: ${peca.stock_atual} un</span>
          `;
          pecaSelecionadaDiv.classList.remove('hidden');
          
          // Pre-fill cost if available
          form.querySelector('[name="valor_unitario"]').value = peca.preco_custo;
        });
      });
    } else {
      resultsDiv.innerHTML = '<div class="p-3 text-sm text-gray-500">Nenhuma peça encontrada</div>';
      resultsDiv.classList.remove('hidden');
    }
  });

  // Close search results when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !resultsDiv.contains(e.target)) {
      resultsDiv.classList.add('hidden');
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const pecaId = pecaIdInput.value;
    if (!pecaId) {
      showToast('Selecione uma peça', 'error');
      return;
    }

    const formData = new FormData(e.target);
    const quantidade = parseInt(formData.get('quantidade'));
    const valorUnitario = parseFloat(formData.get('valor_unitario'));
    
    const peca = pecas.find(p => p.id === pecaId);
    if (!peca) {
        showToast('Erro: Peça não encontrada', 'error');
        return;
    }

    // Calculate new average cost
    // New Avg = ((Old Stock * Old Cost) + (New Qty * New Cost)) / (Old Stock + New Qty)
    const oldTotalValue = peca.stock_atual * peca.preco_custo;
    const newEntryValue = quantidade * valorUnitario;
    const newTotalStock = peca.stock_atual + quantidade;
    const newAvgCost = newTotalStock > 0 ? (oldTotalValue + newEntryValue) / newTotalStock : valorUnitario;

    const abastecimentoData = {
      id: generateId(),
      peca_id: pecaId,
      fornecedor_id: formData.get('fornecedor_id'),
      quantidade: quantidade,
      valor_unitario: valorUnitario,
      created_at: new Date().toISOString()
    };

    try {
      // 1. Save abastecimento record
      await dbOperations.add('abastecimentos', abastecimentoData);
      await syncQueue.add('insert', 'abastecimentos', abastecimentoData);

      // 2. Update peca stock and cost
      const updatedPeca = { 
        ...peca, 
        stock_atual: newTotalStock,
        preco_custo: parseFloat(newAvgCost.toFixed(2)),
        updated_at: new Date().toISOString()
      };
      
      await dbOperations.put('pecas', updatedPeca);
      await syncQueue.add('update', 'pecas', updatedPeca);

      showToast('Abastecimento registrado com sucesso!', 'success');
      modal.classList.add('hidden');
      initAbastecimento(container); // Reload
    } catch (error) {
      console.error('Error saving abastecimento:', error);
      showToast('Erro ao registrar abastecimento', 'error');
    }
  });
}
