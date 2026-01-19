// Busca por Veículo Component - Search parts by vehicle compatibility
import { dbOperations, syncQueue } from '../lib/db.js';
import { formatCurrency, showToast } from '../utils/helpers.js';

export async function initBuscaVeiculo(container) {
  try {
    const compatibilidades = await dbOperations.getAll('compatibilidade_veiculos');
    const pecas = await dbOperations.getAll('pecas');
    const categorias = await dbOperations.getAll('categorias');

    // Get unique brands and models
    const marcas = [...new Set(compatibilidades.map(c => c.marca))].sort();
    
    container.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-900">Buscar por Veículo</h2>
          <button id="btn-cadastrar-compatibilidade" class="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Cadastrar Compatibilidade
          </button>
        </div>

        <!-- Search Form -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Marca</label>
              <select id="select-marca" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                <option value="">Selecione a marca...</option>
                ${marcas.map(m => `<option value="${m}">${m}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Modelo</label>
              <select id="select-modelo" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" disabled>
                <option value="">Selecione o modelo...</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Ano</label>
              <input 
                type="number" 
                id="input-ano" 
                placeholder="Ex: 2015" 
                min="1900" 
                max="2100"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled
              >
            </div>
          </div>
          <div class="mt-4">
            <button id="btn-buscar-veiculo" class="w-full md:w-auto px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition flex items-center justify-center gap-2" disabled>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              Buscar Peças
            </button>
          </div>
        </div>

        <!-- Results -->
        <div id="resultados-container" class="hidden">
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Peças Compatíveis</h3>
            <div id="resultados-lista" class="space-y-3"></div>
          </div>
        </div>

        <!-- Histórico de Buscas -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Últimas Buscas</h3>
          <div id="historico-buscas" class="space-y-2">
            <p class="text-gray-400 text-sm">Nenhuma busca realizada ainda</p>
          </div>
        </div>

        <!-- Gerenciar Compatibilidades -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Compatibilidades Cadastradas</h3>
            <div id="pagination-info" class="text-sm text-gray-500"></div>
          </div>
          <div id="lista-todas-compatibilidades" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <!-- List of all compatibilities will be rendered here -->
          </div>
        </div>
      </div>

      <!-- Modal Cadastrar/Editar Compatibilidade -->
      <div id="modal-compatibilidade" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6">
            <h3 class="text-xl font-bold text-gray-900 mb-6" id="modal-title-compat">Cadastrar Compatibilidade</h3>
            <form id="form-compatibilidade" class="space-y-4">
              <input type="hidden" name="editing_id">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Marca *</label>
                  <input type="text" name="marca" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Modelo *</label>
                  <input type="text" name="modelo" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Ano (Opcional)</label>
                  <input type="number" name="ano" min="1900" max="2100" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Códigos de Peças (separados por vírgula) *</label>
                <textarea name="codigos" required rows="3" placeholder="Ex: AR2018, AR2917, BR3045" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"></textarea>
                <p class="text-xs text-gray-500 mt-1">Dica: Você pode adicionar novos códigos a qualquer momento editando o veículo.</p>
              </div>
              <div class="flex gap-3 justify-end pt-4">
                <button type="button" id="btn-cancelar-compatibilidade" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                  Cancelar
                </button>
                <button type="submit" class="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    // State
    let historicoBuscas = JSON.parse(localStorage.getItem('historico_buscas') || '[]');
    renderHistorico();

    // Marca selection
    document.getElementById('select-marca').addEventListener('change', (e) => {
      const marca = e.target.value;
      const selectModelo = document.getElementById('select-modelo');
      const inputAno = document.getElementById('input-ano');
      
      if (!marca) {
        selectModelo.disabled = true;
        inputAno.disabled = true;
        selectModelo.innerHTML = '<option value="">Selecione o modelo...</option>';
        return;
      }

      const modelos = [...new Set(
        compatibilidades
          .filter(c => c.marca === marca)
          .map(c => c.modelo)
      )].sort();

      selectModelo.innerHTML = '<option value="">Selecione o modelo...</option>' +
        modelos.map(m => `<option value="${m}">${m}</option>`).join('');
      selectModelo.disabled = false;
      inputAno.disabled = false;
      updateBuscarButton();
    });

    // Modelo selection
    document.getElementById('select-modelo').addEventListener('change', updateBuscarButton);
    document.getElementById('input-ano').addEventListener('input', updateBuscarButton);

    function updateBuscarButton() {
      const marca = document.getElementById('select-marca').value;
      const modelo = document.getElementById('select-modelo').value;
      document.getElementById('btn-buscar-veiculo').disabled = !marca || !modelo;
    }

    // Buscar peças
    document.getElementById('btn-buscar-veiculo').addEventListener('click', () => {
      const marca = document.getElementById('select-marca').value;
      const modelo = document.getElementById('select-modelo').value;
      const ano = parseInt(document.getElementById('input-ano').value);

      // Find compatible parts
      const compativeis = compatibilidades.filter(c => {
        const matchesBrand = c.marca === marca;
        const matchesModel = c.modelo === modelo;
        const matchesYear = !ano || !c.ano || c.ano === ano;
        return matchesBrand && matchesModel && matchesYear;
      });

      if (compativeis.length === 0) {
        showToast('Nenhuma peça compatível encontrada', 'warning');
        document.getElementById('resultados-container').classList.add('hidden');
        return;
      }

      // Get all compatible part codes
      const codigosCompativeis = compativeis.flatMap(c => c.codigos_compativeis || []);
      const pecasCompativeis = pecas.filter(p => codigosCompativeis.includes(p.codigo));

      // Group by category
      const porCategoria = {};
      pecasCompativeis.forEach(p => {
        const catId = p.categoria_id || 'sem-categoria';
        if (!porCategoria[catId]) {
          porCategoria[catId] = [];
        }
        porCategoria[catId].push(p);
      });

      // Render results
      const resultadosDiv = document.getElementById('resultados-lista');
      resultadosDiv.innerHTML = Object.entries(porCategoria).map(([catId, pecasGrupo]) => {
        const categoria = categorias.find(c => c.id === catId);
        return `
          <div class="border border-gray-200 rounded-lg p-4">
            <h4 class="font-medium text-gray-900 mb-3">${categoria?.nome || 'Sem Categoria'}</h4>
            <div class="space-y-2">
              ${pecasGrupo.map(p => `
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p class="font-medium text-gray-900">${p.codigo} - ${p.nome}</p>
                    <p class="text-sm text-gray-600">Stock: ${p.stock_atual} un | ${formatCurrency(p.preco_venda)}</p>
                  </div>
                  <button 
                    class="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition text-sm"
                    onclick="alert('Funcionalidade de adicionar à venda será implementada')"
                  >
                    Adicionar à Venda
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }).join('');

      document.getElementById('resultados-container').classList.remove('hidden');

      // Add to history
      const busca = { marca, modelo, ano, timestamp: new Date().toISOString() };
      historicoBuscas.unshift(busca);
      historicoBuscas = historicoBuscas.slice(0, 10); // Keep last 10
      localStorage.setItem('historico_buscas', JSON.stringify(historicoBuscas));
      renderHistorico();
    });

    function renderHistorico() {
      const div = document.getElementById('historico-buscas');
      if (historicoBuscas.length === 0) {
        div.innerHTML = '<p class="text-gray-400 text-sm">Nenhuma busca realizada ainda</p>';
        return;
      }

      div.innerHTML = historicoBuscas.map(b => `
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p class="text-sm font-medium text-gray-900">${b.marca} ${b.modelo} ${b.ano}</p>
            <p class="text-xs text-gray-500">${new Date(b.timestamp).toLocaleString('pt-BR')}</p>
          </div>
          <button 
            class="text-sm text-primary hover:text-primary-dark"
            onclick="document.getElementById('select-marca').value='${b.marca}'; document.getElementById('select-marca').dispatchEvent(new Event('change')); setTimeout(() => { document.getElementById('select-modelo').value='${b.modelo}'; document.getElementById('input-ano').value='${b.ano || ''}'; document.getElementById('btn-buscar-veiculo').disabled = false; }, 100);"
          >
            Repetir
          </button>
        </div>
      `).join('');
    }

    // Render all compatibilities
    function renderTodasCompatibilidades() {
      const div = document.getElementById('lista-todas-compatibilidades');
      if (compatibilidades.length === 0) {
        div.innerHTML = `
          <div class="col-span-full text-center py-8">
            <p class="text-gray-400">Nenhuma compatibilidade cadastrada</p>
          </div>
        `;
        return;
      }

      div.innerHTML = compatibilidades.map(c => `
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-sm transition">
          <div class="flex items-start justify-between mb-2">
            <div>
              <p class="font-bold text-gray-900">${c.marca} ${c.modelo}</p>
              <p class="text-sm text-gray-600">Ano: ${c.ano || 'Universal'}</p>
            </div>
            <div class="flex gap-1">
              <button class="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition btn-edit-compat" data-id="${c.id}" title="Editar">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </button>
              <button class="p-1.5 text-red-600 hover:bg-red-100 rounded transition btn-delete-compat" data-id="${c.id}" title="Excluir">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
          <div class="mt-2">
            <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Peças Vinculadas:</p>
            <div class="flex flex-wrap gap-1">
              ${(c.codigos_compativeis || []).map(code => `
                <span class="px-2 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-medium text-gray-700">${code}</span>
              `).join('')}
            </div>
          </div>
        </div>
      `).join('');

      // Setup actions
      div.querySelectorAll('.btn-edit-compat').forEach(btn => {
        btn.addEventListener('click', () => abrirModalEdicao(btn.dataset.id));
      });

      div.querySelectorAll('.btn-delete-compat').forEach(btn => {
        btn.addEventListener('click', () => excluirCompatibilidade(btn.dataset.id));
      });
    }

    renderTodasCompatibilidades();

    // Modal helpers
    function abrirModalEdicao(id) {
      const comp = compatibilidades.find(c => c.id === id);
      if (!comp) return;

      const form = document.getElementById('form-compatibilidade');
      document.getElementById('modal-title-compat').textContent = 'Editar Veículo / Compatibilidade';
      form.elements['editing_id'].value = comp.id;
      form.elements['marca'].value = comp.marca;
      form.elements['modelo'].value = comp.modelo;
      form.elements['ano'].value = comp.ano || '';
      form.elements['codigos'].value = (comp.codigos_compativeis || []).join(', ');

      document.getElementById('modal-compatibilidade').classList.remove('hidden');
    }

    async function excluirCompatibilidade(id) {
      if (!confirm('Deseja realmente excluir esta compatibilidade?')) return;

      try {
        await dbOperations.delete('compatibilidade_veiculos', id);
        await syncQueue.add('delete', 'compatibilidade_veiculos', { id });
        showToast('Compatibilidade excluída!', 'success');
        initBuscaVeiculo(container); // Reload
      } catch (error) {
        console.error('Error deleting compatibility:', error);
        showToast('Erro ao excluir', 'error');
      }
    }

    // Modal handlers
    document.getElementById('btn-cadastrar-compatibilidade').addEventListener('click', () => {
      const form = document.getElementById('form-compatibilidade');
      form.reset();
      form.elements['editing_id'].value = '';
      document.getElementById('modal-title-compat').textContent = 'Cadastrar Compatibilidade';
      document.getElementById('modal-compatibilidade').classList.remove('hidden');
    });

    document.getElementById('btn-cancelar-compatibilidade').addEventListener('click', () => {
      document.getElementById('modal-compatibilidade').classList.add('hidden');
    });

    document.getElementById('form-compatibilidade').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const editingId = formData.get('editing_id');
      
      const codigos = formData.get('codigos').split(',').map(c => c.trim()).filter(c => c);
      
      const data = {
        id: editingId || crypto.randomUUID(),
        marca: formData.get('marca'),
        modelo: formData.get('modelo'),
        ano: formData.get('ano') ? parseInt(formData.get('ano')) : null,
        codigos_compativeis: codigos,
        updated_at: new Date().toISOString()
      };

      if (!editingId) {
        data.created_at = new Date().toISOString();
      }

      try {
        if (editingId) {
          await dbOperations.put('compatibilidade_veiculos', data);
          await syncQueue.add('update', 'compatibilidade_veiculos', data);
          showToast('Compatibilidade atualizada com sucesso!', 'success');
        } else {
          await dbOperations.add('compatibilidade_veiculos', data);
          await syncQueue.add('insert', 'compatibilidade_veiculos', data);
          showToast('Compatibilidade cadastrada com sucesso!', 'success');
        }
        
        document.getElementById('modal-compatibilidade').classList.add('hidden');
        initBuscaVeiculo(container); // Reload
      } catch (error) {
        console.error('Error saving compatibility:', error);
        showToast('Erro ao salvar compatibilidade', 'error');
      }
    });

  } catch (error) {
    console.error('Busca Veículo error:', error);
    container.innerHTML = '<p class="text-red-500">Erro ao carregar busca por veículo</p>';
  }
}
