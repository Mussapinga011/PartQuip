// Hierarquia Component - Category and Type Management
import { dbOperations, syncQueue } from '../lib/db.js';
import { generateId, showToast } from '../utils/helpers.js';

export async function initHierarquia(container) {
  try {
    const categorias = await dbOperations.getAll('categorias');
    const tipos = await dbOperations.getAll('tipos');
    
    container.innerHTML = `
      <div class="space-y-6">
        <h2 class="text-2xl font-bold text-gray-900">Categorias e Tipos</h2>

        <!-- Categorias Section -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Categorias</h3>
            <button id="btn-nova-categoria" class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Nova Categoria
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="categorias-grid">
            ${renderCategorias(categorias, tipos)}
          </div>
        </div>

        <!-- Tipos Section -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Tipos</h3>
            <button id="btn-novo-tipo" class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Novo Tipo
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-700">Código</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-700">Categoria</th>
                  <th class="px-4 py-2 text-right text-xs font-medium text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody id="tipos-tbody" class="divide-y divide-gray-200">
                ${renderTipos(tipos, categorias)}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Modal Nova Categoria -->
      <div id="modal-categoria" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg max-w-md w-full p-6">
          <h3 class="text-xl font-bold text-gray-900 mb-6">Nova Categoria</h3>
          <form id="form-categoria" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
              <input type="text" name="nome" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
            </div>
            <div class="flex gap-3 justify-end pt-4">
              <button type="button" id="btn-cancelar-categoria" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button type="submit" class="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition">
                Salvar
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal Novo Tipo -->
      <div id="modal-tipo" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg max-w-md w-full p-6">
          <h3 class="text-xl font-bold text-gray-900 mb-6">Novo Tipo</h3>
          <form id="form-tipo" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Código *</label>
              <input type="text" name="codigo" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Categoria *</label>
              <select name="categoria_id" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                <option value="">Selecione...</option>
                ${categorias.map(c => `<option value="${c.id}">${c.nome}</option>`).join('')}
              </select>
            </div>
            <div class="flex gap-3 justify-end pt-4">
              <button type="button" id="btn-cancelar-tipo" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button type="submit" class="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition">
                Salvar
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Event listeners - Categorias
    document.getElementById('btn-nova-categoria').addEventListener('click', () => {
      document.getElementById('modal-categoria').classList.remove('hidden');
    });

    document.getElementById('btn-cancelar-categoria').addEventListener('click', () => {
      const form = document.getElementById('form-categoria');
      form.reset();
      delete form.dataset.editingId;
      document.querySelector('#modal-categoria h3').textContent = 'Nova Categoria';
      document.getElementById('modal-categoria').classList.add('hidden');
    });

    document.getElementById('form-categoria').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const editingId = e.target.dataset.editingId;

      const data = {
        id: editingId || generateId(),
        nome: formData.get('nome'),
        updated_at: new Date().toISOString()
      };

      if (!editingId) {
        data.created_at = new Date().toISOString();
      }

      try {
        if (editingId) {
          await dbOperations.put('categorias', data);
          await syncQueue.add('update', 'categorias', data);
          showToast('Categoria atualizada com sucesso!', 'success');
        } else {
          await dbOperations.add('categorias', data);
          await syncQueue.add('insert', 'categorias', data);
          showToast('Categoria cadastrada com sucesso!', 'success');
        }
        
        document.getElementById('modal-categoria').classList.add('hidden');
        e.target.reset();
        delete e.target.dataset.editingId;
        document.querySelector('#modal-categoria h3').textContent = 'Nova Categoria';
        initHierarquia(container);
      } catch (error) {
        console.error('Error saving categoria:', error);
        showToast(editingId ? 'Erro ao atualizar categoria' : 'Erro ao cadastrar categoria', 'error');
      }
    });

    // Event listeners - Tipos
    document.getElementById('btn-novo-tipo').addEventListener('click', () => {
      document.getElementById('modal-tipo').classList.remove('hidden');
    });

    document.getElementById('btn-cancelar-tipo').addEventListener('click', () => {
      const form = document.getElementById('form-tipo');
      form.reset();
      delete form.dataset.editingId;
      document.querySelector('#modal-tipo h3').textContent = 'Novo Tipo';
      document.getElementById('modal-tipo').classList.add('hidden');
    });

    document.getElementById('form-tipo').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const editingId = e.target.dataset.editingId;

      const data = {
        id: editingId || generateId(),
        codigo: formData.get('codigo'),
        categoria_id: formData.get('categoria_id'),
        updated_at: new Date().toISOString()
      };

      if (!editingId) {
        data.created_at = new Date().toISOString();
      }

      try {
        if (editingId) {
          await dbOperations.put('tipos', data);
          await syncQueue.add('update', 'tipos', data);
          showToast('Tipo atualizado com sucesso!', 'success');
        } else {
          await dbOperations.add('tipos', data);
          await syncQueue.add('insert', 'tipos', data);
          showToast('Tipo cadastrado com sucesso!', 'success');
        }
        
        document.getElementById('modal-tipo').classList.add('hidden');
        e.target.reset();
        delete e.target.dataset.editingId;
        document.querySelector('#modal-tipo h3').textContent = 'Novo Tipo';
        initHierarquia(container);
      } catch (error) {
        console.error('Error saving tipo:', error);
        showToast(editingId ? 'Erro ao atualizar tipo' : 'Erro ao cadastrar tipo', 'error');
      }
    });

    // Setup edit/delete handlers
    setupEditDeleteHandlers(container, categorias, tipos);

  } catch (error) {
    console.error('Hierarquia error:', error);
    container.innerHTML = '<p class="text-red-500">Erro ao carregar hierarquia</p>';
  }
}

function renderCategorias(categorias, tipos) {
  if (categorias.length === 0) {
    return '<div class="col-span-full text-center py-8 text-gray-400">Nenhuma categoria cadastrada</div>';
  }

  return categorias.map(cat => {
    const tiposCount = tipos.filter(t => t.categoria_id === cat.id).length;
    return `
      <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
        <div class="flex items-start justify-between mb-2">
          <h4 class="font-medium text-gray-900">${cat.nome}</h4>
          <div class="flex gap-1">
            <button class="p-1 text-blue-600 hover:bg-blue-50 rounded" data-edit-categoria="${cat.id}" title="Editar">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </button>
            <button class="p-1 text-red-600 hover:bg-red-50 rounded" data-delete-categoria="${cat.id}" title="Excluir">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
        <p class="text-sm text-gray-600">${tiposCount} tipo(s)</p>
      </div>
    `;
  }).join('');
}

function renderTipos(tipos, categorias) {
  if (tipos.length === 0) {
    return '<tr><td colspan="3" class="px-4 py-8 text-center text-gray-400">Nenhum tipo cadastrado</td></tr>';
  }

  return tipos.map(tipo => {
    const categoria = categorias.find(c => c.id === tipo.categoria_id);
    return `
      <tr>
        <td class="px-4 py-2 text-sm font-medium">${tipo.codigo}</td>
        <td class="px-4 py-2 text-sm">${categoria?.nome || '-'}</td>
        <td class="px-4 py-2 text-sm text-right">
          <button class="text-blue-600 hover:text-blue-800 mr-2" data-edit-tipo="${tipo.id}">Editar</button>
          <button class="text-red-600 hover:text-red-800" data-delete-tipo="${tipo.id}">Excluir</button>
        </td>
      </tr>
    `;
  }).join('');
}

function setupEditDeleteHandlers(container, categorias, tipos) {
  // Edit categoria
  document.querySelectorAll('[data-edit-categoria]').forEach(btn => {
    btn.addEventListener('click', () => {
      const catId = btn.dataset.editCategoria;
      const cat = categorias.find(c => c.id === catId);
      if (!cat) return;

      const form = document.getElementById('form-categoria');
      form.querySelector('[name="nome"]').value = cat.nome;
      form.dataset.editingId = catId;
      document.querySelector('#modal-categoria h3').textContent = 'Editar Categoria';
      document.getElementById('modal-categoria').classList.remove('hidden');
    });
  });

  // Delete categoria
  document.querySelectorAll('[data-delete-categoria]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const catId = btn.dataset.deleteCategoria;
      const cat = categorias.find(c => c.id === catId);
      if (!cat) return;

      if (!confirm(`Tem certeza que deseja excluir a categoria "${cat.nome}"?`)) return;

      try {
        await dbOperations.delete('categorias', catId);
        await syncQueue.add('delete', 'categorias', { id: catId });
        showToast('Categoria excluída com sucesso!', 'success');
        initHierarquia(container);
      } catch (error) {
        console.error('Error deleting categoria:', error);
        showToast('Erro ao excluir categoria', 'error');
      }
    });
  });

  // Edit tipo
  document.querySelectorAll('[data-edit-tipo]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tipoId = btn.dataset.editTipo;
      const tipo = tipos.find(t => t.id === tipoId);
      if (!tipo) return;

      const form = document.getElementById('form-tipo');
      form.querySelector('[name="codigo"]').value = tipo.codigo;
      form.querySelector('[name="categoria_id"]').value = tipo.categoria_id;
      form.dataset.editingId = tipoId;
      document.querySelector('#modal-tipo h3').textContent = 'Editar Tipo';
      document.getElementById('modal-tipo').classList.remove('hidden');
    });
  });

  // Delete tipo
  document.querySelectorAll('[data-delete-tipo]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const tipoId = btn.dataset.deleteTipo;
      const tipo = tipos.find(t => t.id === tipoId);
      if (!tipo) return;

      if (!confirm(`Tem certeza que deseja excluir o tipo "${tipo.codigo}"?`)) return;

      try {
        await dbOperations.delete('tipos', tipoId);
        await syncQueue.add('delete', 'tipos', { id: tipoId });
        showToast('Tipo excluído com sucesso!', 'success');
        initHierarquia(container);
      } catch (error) {
        console.error('Error deleting tipo:', error);
        showToast('Erro ao excluir tipo', 'error');
      }
    });
  });
}
