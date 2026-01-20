// Fornecedores Component - Supplier Management
import { dbOperations, syncQueue } from '../lib/db.js';
import { generateId, showToast, confirm } from '../utils/helpers.js';
import { t } from '../lib/i18n.js';

export async function initFornecedores(container) {
  try {
    const fornecedores = await dbOperations.getAll('fornecedores');
    
    container.innerHTML = `
      <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">${t('fornecedores')}</h2>
          <div class="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              id="busca-fornecedor" 
              placeholder="${t('search_placeholder')}" 
              class="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            >
            <button id="btn-novo-fornecedor" class="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              ${t('new_supplier')}
            </button>
          </div>
        </div>

        <!-- Fornecedores Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="fornecedores-grid">
          ${renderFornecedores(fornecedores)}
        </div>
      </div>

      <!-- Modal Novo Fornecedor -->
      <div id="modal-fornecedor" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6">${t('new_supplier')}</h3>
            <form id="form-fornecedor" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${t('name')} *</label>
                  <input type="text" name="nome" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${t('phone')}</label>
                  <input type="tel" name="telefone" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${t('email_label')}</label>
                  <input type="email" name="email" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${t('address')}</label>
                  <textarea name="endereco" rows="2" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"></textarea>
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${t('observations_label')}</label>
                  <textarea name="observacoes" rows="2" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"></textarea>
                </div>
              </div>
              <div class="flex gap-3 justify-end pt-4">
                <button type="button" id="btn-cancelar-fornecedor" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 transition">
                  ${t('cancel')}
                </button>
                <button type="submit" class="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition">
                  ${t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    // Event listeners
    document.getElementById('btn-novo-fornecedor').addEventListener('click', () => {
      document.getElementById('modal-fornecedor').classList.remove('hidden');
    });

    document.getElementById('btn-cancelar-fornecedor').addEventListener('click', () => {
      const form = document.getElementById('form-fornecedor');
      form.reset();
      delete form.dataset.editingId;
      document.querySelector('#modal-fornecedor h3').textContent = 'Novo Fornecedor';
      document.getElementById('modal-fornecedor').classList.add('hidden');
    });

    document.getElementById('form-fornecedor').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const editingId = e.target.dataset.editingId;
      

      const data = {
        id: editingId || generateId(),
        nome: formData.get('nome'),
        telefone: formData.get('telefone') || null,
        email: formData.get('email') || null,
        endereco: formData.get('endereco') || null,
        observacoes: formData.get('observacoes') || null,
        updated_at: new Date().toISOString()
      };

      if (!editingId) {
        data.created_at = new Date().toISOString();
      }

      try {
        if (editingId) {
          await dbOperations.put('fornecedores', data);
          await syncQueue.add('update', 'fornecedores', data);
          showToast('Fornecedor atualizado com sucesso!', 'success');
        } else {
          await dbOperations.add('fornecedores', data);
          await syncQueue.add('insert', 'fornecedores', data);
          showToast('Fornecedor cadastrado com sucesso!', 'success');
        }
        
        document.getElementById('modal-fornecedor').classList.add('hidden');
        e.target.reset();
        delete e.target.dataset.editingId;
        document.querySelector('#modal-fornecedor h3').textContent = 'Novo Fornecedor';
        initFornecedores(container);
      } catch (error) {
        console.error('Error saving fornecedor:', error);
        showToast(editingId ? 'Erro ao atualizar fornecedor' : 'Erro ao cadastrar fornecedor', 'error');
      }
    });

    // Search functionality
    const searchInput = document.getElementById('busca-fornecedor');
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase().trim();
      const filtered = fornecedores.filter(f => 
        f.nome.toLowerCase().includes(term) || 
        (f.email && f.email.toLowerCase().includes(term)) ||
        (f.telefone && f.telefone.toLowerCase().includes(term))
      );
      document.getElementById('fornecedores-grid').innerHTML = renderFornecedores(filtered);
      setupEditDeleteHandlers(container, fornecedores); // Re-attach handlers to new elements
    });

    // Setup edit and delete handlers
    setupEditDeleteHandlers(container, fornecedores);

  } catch (error) {
    console.error('Fornecedores error:', error);
    container.innerHTML = '<p class="text-red-500">Erro ao carregar fornecedores</p>';
  }
}

function setupEditDeleteHandlers(container, fornecedores) {
  // Edit handlers
  document.querySelectorAll('[data-edit-fornecedor]').forEach(btn => {
    btn.addEventListener('click', () => {
      const fornId = btn.dataset.editFornecedor;
      const forn = fornecedores.find(f => f.id === fornId);
      if (!forn) return;

      // Populate form
      const form = document.getElementById('form-fornecedor');
      form.querySelector('[name="nome"]').value = forn.nome;
      form.querySelector('[name="telefone"]').value = forn.telefone || '';
      form.querySelector('[name="email"]').value = forn.email || '';
      form.querySelector('[name="endereco"]').value = forn.endereco || '';
      form.querySelector('[name="observacoes"]').value = forn.observacoes || '';

      // Change modal title
      document.querySelector('#modal-fornecedor h3').textContent = 'Editar Fornecedor';

      // Store ID for update
      form.dataset.editingId = fornId;

      // Show modal
      document.getElementById('modal-fornecedor').classList.remove('hidden');
    });
  });

  // Delete handlers
  document.querySelectorAll('[data-delete-fornecedor]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const fornId = btn.dataset.deleteFornecedor;
      const forn = fornecedores.find(f => f.id === fornId);
      if (!forn) return;

      if (!await confirm(`Tem certeza que deseja excluir o fornecedor "${forn.nome}"?`)) {
        return;
      }

      try {
        await dbOperations.delete('fornecedores', fornId);
        await syncQueue.add('delete', 'fornecedores', { id: fornId });
        showToast('Fornecedor excluído com sucesso!', 'success');
        initFornecedores(container);
      } catch (error) {
        console.error('Error deleting fornecedor:', error);
        showToast('Erro ao excluir fornecedor', 'error');
      }
    });
  });
}

function renderFornecedores(fornecedores) {
  if (fornecedores.length === 0) {
    return `
      <div class="col-span-full text-center py-12">
        <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
        </svg>
        <p class="text-gray-500 dark:text-gray-400">${t('no_records')}</p>
      </div>
    `;
  }

  return fornecedores.map(f => `
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition">
      <div class="flex items-start justify-between mb-4">
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${f.nome}</h3>
        </div>
        <div class="flex gap-2">
          <button class="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition" title="${t('edit')}" data-edit-fornecedor="${f.id}">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
          </button>
          <button class="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition" title="${t('delete')}" data-delete-fornecedor="${f.id}">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>
      </div>
      <div class="space-y-2 text-sm">
        ${f.telefone ? `
          <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
            </svg>
            ${f.telefone}
          </div>
        ` : ''}
        ${f.email ? `
          <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            ${f.email}
          </div>
        ` : ''}
        ${f.endereco ? `
          <div class="flex items-start gap-2 text-gray-600 dark:text-gray-400">
            <svg class="w-4 h-4 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            ${f.endereco}
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');
}
