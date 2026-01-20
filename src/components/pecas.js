// Peças Component
import { dbOperations, syncQueue } from '../lib/db.js';
import { generateId, formatCurrency, showToast, confirm } from '../utils/helpers.js';
import { t } from '../lib/i18n.js';

export async function initPecas(container) {
  try {
    const pecas = await dbOperations.getAll('pecas');
    const categorias = await dbOperations.getAll('categorias');
    const tipos = await dbOperations.getAll('tipos');
    const fornecedores = await dbOperations.getAll('fornecedores');
    
    container.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">${t('parts_management')}</h2>
          <button id="btn-nova-peca" class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            ${t('new_part')}
          </button>
        </div>

        <!-- Search and Filters -->
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input 
              type="text" 
              id="search-pecas" 
              placeholder="${t('search_placeholder')}" 
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
            <select id="filter-categoria" class="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
              <option value="">${t('all_categories')}</option>
              ${categorias.map(c => `<option value="${c.id}">${c.nome}</option>`).join('')}
            </select>
            <select id="filter-stock" class="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
              <option value="">${t('all_stocks')}</option>
              <option value="baixo">${t('low_stock_filter')}</option>
              <option value="zero">${t('zero_stock_filter')}</option>
            </select>
            <button id="btn-limpar-filtros" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 transition">
              ${t('clear_filters')}
            </button>
          </div>
        </div>

        <!-- Peças Table -->
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">${t('code')}</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">${t('name')}</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">${t('category')}</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">${t('sale_price')}</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">${t('stock')}</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">${t('location')}</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">${t('actions')}</th>
                </tr>
              </thead>
              <tbody id="pecas-tbody" class="divide-y divide-gray-200 dark:divide-gray-700">
                ${renderPecasRows(pecas, categorias)}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Modal Nova Peça -->
      <div id="modal-peca" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6">${t('new_part')}</h3>
            <form id="form-peca" class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${t('code')} *</label>
                  <input type="text" name="codigo" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${t('name')} *</label>
                  <input type="text" name="nome" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${t('category')} *</label>
                  <select name="categoria_id" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option value="">${t('select')}</option>
                    ${categorias.map(c => `<option value="${c.id}">${c.nome}</option>`).join('')}
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${t('tipo') || 'Tipo'}</label>
                  <select name="tipo_id" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option value="">${t('select')}</option>
                    ${tipos.map(t => `<option value="${t.id}">${t.codigo}</option>`).join('')}
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${t('cost_price')} *</label>
                  <input type="number" name="preco_custo" step="0.01" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${t('sale_price')} *</label>
                  <input type="number" name="preco_venda" step="0.01" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${t('current_stock')} *</label>
                  <input type="number" name="stock_atual" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${t('min_stock')} *</label>
                  <input type="number" name="stock_minimo" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${t('location')}</label>
                  <input type="text" name="localizacao" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${t('supplier')}</label>
                  <select name="fornecedor_id" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option value="">${t('select')}</option>
                    ${fornecedores.map(f => `<option value="${f.id}">${f.nome}</option>`).join('')}
                  </select>
                </div>
              </div>
              <div class="flex gap-3 justify-end pt-4">
                <button type="button" id="btn-cancelar-peca" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 transition">
                  ${t('cancel')}
                </button>
                <button type="submit" class="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition">
                  ${t('save_part')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    // Event listeners
    document.getElementById('btn-nova-peca').addEventListener('click', () => {
      document.getElementById('modal-peca').classList.remove('hidden');
    });

    document.getElementById('btn-cancelar-peca').addEventListener('click', () => {
      const form = document.getElementById('form-peca');
      form.reset();
      delete form.dataset.editingId;
      document.querySelector('#modal-peca h3').textContent = t('new_part');
      document.getElementById('modal-peca').classList.add('hidden');
    });

    document.getElementById('form-peca').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const editingId = e.target.dataset.editingId;

      const data = {
        id: editingId || generateId(),
        codigo: formData.get('codigo'),
        nome: formData.get('nome'),
        categoria_id: formData.get('categoria_id') || null,
        tipo_id: formData.get('tipo_id') || null,
        preco_custo: parseFloat(formData.get('preco_custo')),
        preco_venda: parseFloat(formData.get('preco_venda')),
        stock_atual: parseInt(formData.get('stock_atual')),
        stock_minimo: parseInt(formData.get('stock_minimo')),
        localizacao: formData.get('localizacao') || null,
        fornecedor_id: formData.get('fornecedor_id') || null,
        updated_at: new Date().toISOString()
      };

      if (!editingId) {
        data.created_at = new Date().toISOString();
      }

      try {
        if (editingId) {
          await dbOperations.put('pecas', data);
          await syncQueue.add('update', 'pecas', data);
          showToast(t('update_success') || 'Peça atualizada com sucesso!', 'success');
        } else {
          await dbOperations.add('pecas', data);
          await syncQueue.add('insert', 'pecas', data);
          showToast(t('save_success') || 'Peça cadastrada com sucesso!', 'success');
        }
        
        document.getElementById('modal-peca').classList.add('hidden');
        e.target.reset();
        delete e.target.dataset.editingId;
        document.querySelector('#modal-peca h3').textContent = t('new_part');
        initPecas(container); // Reload
      } catch (error) {
        console.error('Error saving peça:', error);
        showToast(editingId ? (t('update_error') || 'Erro ao atualizar peça') : (t('save_error') || 'Erro ao cadastrar peça'), 'error');
      }
    });

    // Edit and Delete handlers
    setupEditDeleteHandlers(container, pecas, categorias, tipos, fornecedores);

  } catch (error) {
    console.error('Peças error:', error);
    container.innerHTML = '<p class="text-red-500">Erro ao carregar peças</p>';
  }
}

function setupEditDeleteHandlers(container, pecas, categorias, tipos, fornecedores) {
  // Edit handlers
  document.querySelectorAll('[data-edit-peca]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const pecaId = btn.dataset.editPeca;
      const peca = pecas.find(p => p.id === pecaId);
      if (!peca) return;

      // Populate form with existing data
      const form = document.getElementById('form-peca');
      form.querySelector('[name="codigo"]').value = peca.codigo;
      form.querySelector('[name="nome"]').value = peca.nome;
      form.querySelector('[name="categoria_id"]').value = peca.categoria_id || '';
      form.querySelector('[name="tipo_id"]').value = peca.tipo_id || '';
      form.querySelector('[name="preco_custo"]').value = peca.preco_custo;
      form.querySelector('[name="preco_venda"]').value = peca.preco_venda;
      form.querySelector('[name="stock_atual"]').value = peca.stock_atual;
      form.querySelector('[name="stock_minimo"]').value = peca.stock_minimo;
      form.querySelector('[name="localizacao"]').value = peca.localizacao || '';
      form.querySelector('[name="fornecedor_id"]').value = peca.fornecedor_id || '';

      // Change modal title
      document.querySelector('#modal-peca h3').textContent = 'Editar Peça';

      // Store peca ID for update
      form.dataset.editingId = pecaId;

      // Show modal
      document.getElementById('modal-peca').classList.remove('hidden');
    });
  });

  // Delete handlers
  document.querySelectorAll('[data-delete-peca]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const pecaId = btn.dataset.deletePeca;
      const peca = pecas.find(p => p.id === pecaId);
      if (!peca) return;

      if (!await confirm(t('confirm_delete_part')?.replace('{name}', `${peca.codigo} - ${peca.nome}`) || `Tem certeza que deseja excluir a peça "${peca.codigo} - ${peca.nome}"?`)) {
        return;
      }

      try {
        await dbOperations.delete('pecas', pecaId);
        await syncQueue.add('delete', 'pecas', { id: pecaId });
        showToast(t('delete_success') || 'Peça excluída com sucesso!', 'success');
        initPecas(container); // Reload
      } catch (error) {
        console.error('Error deleting peça:', error);
        showToast(t('delete_error') || 'Erro ao excluir peça', 'error');
      }
    });
  });
}

function renderPecasRows(pecas, categorias) {
  if (pecas.length === 0) {
    return `<tr><td colspan="7" class="px-4 py-8 text-center text-gray-400 dark:text-gray-500">${t('no_records')}</td></tr>`;
  }

  return pecas.map(peca => {
    const categoria = categorias.find(c => c.id === peca.categoria_id);
    const stockBaixo = peca.stock_atual < peca.stock_minimo;
    
    return `
      <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
        <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">${peca.codigo}</td>
        <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">${peca.nome}</td>
        <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">${categoria?.nome || '-'}</td>
        <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">${formatCurrency(peca.preco_venda)}</td>
        <td class="px-4 py-3 text-sm">
          <span class="px-2 py-1 rounded text-xs font-medium ${stockBaixo ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}">
            ${peca.stock_atual} un
          </span>
        </td>
        <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">${peca.localizacao || '-'}</td>
        <td class="px-4 py-3 text-sm text-right">
          <button class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-2" data-edit-peca="${peca.id}">${t('edit')}</button>
          <button class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300" data-delete-peca="${peca.id}">${t('delete')}</button>
        </td>
      </tr>
    `;
  }).join('');
}
