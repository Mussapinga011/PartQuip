import { dbOperations, syncQueue } from '../lib/db.js';
import { formatCurrency, showToast, confirm } from '../utils/helpers.js';
import { t, getCurrentLang } from '../lib/i18n.js';

export async function initBuscaVeiculo(container) {
  try {
    const compatibilidades = await dbOperations.getAll('compatibilidade_veiculos');
    const pecas = await dbOperations.getAll('pecas');
    const categorias = await dbOperations.getAll('categorias');
    const tipos = await dbOperations.getAll('tipos');

    // Get unique brands and models
    const marcas = [...new Set(compatibilidades.map(c => c.marca))].sort();
    
    container.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">${t('search_by_vehicle')}</h2>
          <button id="btn-cadastrar-compatibilidade" class="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            ${t('register_compatibility')}
          </button>
        </div>

        <!-- Search Form -->
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${t('brand')}</label>
              <select id="select-marca" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                <option value="">${t('select_brand')}</option>
                ${marcas.map(m => `<option value="${m}">${m}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${t('model')}</label>
              <select id="select-modelo" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" disabled>
                <option value="">${t('select_model')}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${t('years')}</label>
              <input 
                type="number" 
                id="input-ano" 
                placeholder="Ex: 2015" 
                min="1900" 
                max="2100"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled
              >
            </div>
          </div>
          <div class="mt-4">
            <button id="btn-buscar-veiculo" class="w-full md:w-auto px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition flex items-center justify-center gap-2" disabled>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              ${t('search_parts')}
            </button>
            <button id="btn-limpar-busca" class="w-full md:w-auto px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition">
              ${t('clear') || 'Limpar'}
            </button>
          </div>
        </div>

        <!-- Results -->
        <div id="resultados-container" class="hidden">
          <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">${t('compatible_parts')}</h3>
            <div id="resultados-lista" class="space-y-3"></div>
          </div>
        </div>

        <!-- Gerenciar Compatibilidades -->
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${t('registered_compatibilities')}</h3>
            <div class="relative w-full sm:w-64">
              <input 
                type="text" 
                id="filter-compatibilidades" 
                placeholder="Filtrar veículos..." 
                class="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
              <svg class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
          </div>
          <div id="lista-todas-compatibilidades" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <!-- List of all compatibilities will be rendered here -->
          </div>
        </div>

        <!-- Histórico de Buscas -->
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">${t('recent_searches')}</h3>
          <div id="historico-buscas" class="space-y-2">
            <p class="text-gray-400 text-sm">${t('no_records')}</p>
          </div>
        </div>
      </div>

      <!-- Modal Cadastrar/Editar Compatibilidade -->
      <div id="modal-compatibilidade" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6" id="modal-title-compat">${t('register_compatibility')}</h3>
            <form id="form-compatibilidade" class="space-y-4">
              <input type="hidden" name="editing_id">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${t('brand')} *</label>
                  <input type="text" name="marca" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${t('model')} *</label>
                  <input type="text" name="modelo" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${t('years')} (${t('optional')})</label>
                  <input type="number" name="ano" min="1900" max="2100" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                </div>
                <div>
                   <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${t('category')} *</label>
                   <select name="categoria_id" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                     <option value="">${t('select_category')}</option>
                     ${categorias.map(c => `<option value="${c.id}">${c.nome}</option>`).join('')}
                   </select>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${t('parts_codes')} (${t('separation_comma')}) *</label>
                <textarea name="codigos" required rows="3" placeholder="Ex: AR2018, AR2917, BR3045" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"></textarea>
              </div>
              <div class="flex flex-col sm:flex-row gap-3 justify-end pt-4">
                <button type="button" id="btn-cancelar-compatibilidade" class="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 transition">
                  ${t('cancel')}
                </button>
                <button type="submit" class="w-full sm:w-auto px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition">
                  ${t('save')}
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

    // Limpar busca
    document.getElementById('btn-limpar-busca').addEventListener('click', () => {
      document.getElementById('select-marca').value = '';
      document.getElementById('select-modelo').value = '';
      document.getElementById('select-modelo').disabled = true;
      document.getElementById('input-ano').value = '';
      document.getElementById('input-ano').disabled = true;
      document.getElementById('resultados-container').classList.add('hidden');
      updateBuscarButton();
    });

    // Modelo selection
    document.getElementById('select-modelo').addEventListener('change', () => {
      updateBuscarButton();
      if (document.getElementById('select-modelo').value) {
        document.getElementById('btn-buscar-veiculo').click(); // Auto-search
      }
    });
    
    document.getElementById('input-ano').addEventListener('input', updateBuscarButton);

    function updateBuscarButton() {
      const marca = document.getElementById('select-marca').value;
      const modelo = document.getElementById('select-modelo').value;
      document.getElementById('btn-buscar-veiculo').disabled = !marca || !modelo;
    }

    // Buscar peças
    document.getElementById('btn-buscar-veiculo').addEventListener('click', () => {
      const resultadosDiv = document.getElementById('resultados-lista');
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

      if (pecasCompativeis.length === 0) {
        showToast(t('no_parts_in_system') || 'Códigos encontrados, mas as peças não estão cadastradas no sistema', 'warning');
        document.getElementById('resultados-container').classList.add('hidden');
        return;
      }

      // Group by category
      const porCategoria = {};
      pecasCompativeis.forEach(p => {
        const catId = p.categoria_id || 'sem-categoria';
        if (!porCategoria[catId]) {
          porCategoria[catId] = [];
        }
        porCategoria[catId].push(p);
      });

      resultadosDiv.innerHTML = Object.entries(porCategoria).map(([catId, pecasGrupo]) => {
        const categoria = categorias.find(c => c.id === catId);
        return `
          <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 class="font-medium text-gray-900 dark:text-white mb-3">${categoria?.nome || t('no_category')}</h4>
            <div class="space-y-2">
              ${pecasGrupo.map(p => `
                <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg">
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">
                      [${tipos.find(t => t.id === p.tipo_id)?.codigo || t('no_type') || 'S/T'}] 
                      ${p.codigo} - ${p.nome}
                    </p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">${t('stock')}: ${p.stock_atual} un | ${formatCurrency(p.preco_venda)}</p>
                  </div>
                  <button 
                    class="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition text-sm"
                    onclick="window.veiculoActions.adicionarAoCarrinho('${p.id}')"
                  >
                    ${t('add_to_sale') || 'Adicionar à Venda'}
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }).join('');

      document.getElementById('resultados-container').classList.remove('hidden');
      document.getElementById('resultados-container').scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Add to history (avoid duplicates)
      const novaBusca = { marca, modelo, ano: ano || null };
      historicoBuscas = historicoBuscas.filter(h => 
        h.marca !== novaBusca.marca || 
        h.modelo !== novaBusca.modelo || 
        h.ano !== novaBusca.ano
      );
      
      historicoBuscas.unshift({ ...novaBusca, timestamp: new Date().toISOString() });
      historicoBuscas = historicoBuscas.slice(0, 5); // Strict limit of 5
      localStorage.setItem('historico_buscas', JSON.stringify(historicoBuscas));
      renderHistorico();
    });

    function renderHistorico() {
      const div = document.getElementById('historico-buscas');
      if (historicoBuscas.length === 0) {
        div.innerHTML = `<p class="text-gray-400 text-sm">${t('no_records')}</p>`;
        return;
      }

      div.innerHTML = historicoBuscas.map(b => `
        <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg">
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">${b.marca} ${b.modelo} ${b.ano || ''}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">${new Date(b.timestamp).toLocaleString(getCurrentLang() === 'pt' ? 'pt-BR' : 'en-US')}</p>
          </div>
          <button 
            class="text-sm text-primary hover:text-primary-dark"
            onclick="window.veiculoActions.repetirBusca('${b.marca}', '${b.modelo}', '${b.ano || ''}')"
          >
            ${t('repeat')}
          </button>
        </div>
      `).join('');
    }

    // List Filtering
    document.getElementById('filter-compatibilidades').addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      renderTodasCompatibilidades(term);
    });

    // Render all compatibilities grouped by vehicle
    function renderTodasCompatibilidades(filter = '') {
      const div = document.getElementById('lista-todas-compatibilidades');
      
      const filteredCompat = compatibilidades.filter(c => {
        const text = `${c.marca} ${c.modelo} ${c.ano || ''} ${(c.codigos_compativeis || []).join(' ')}`.toLowerCase();
        return text.includes(filter);
      });

      if (filteredCompat.length === 0) {
        div.innerHTML = `
          <div class="col-span-full text-center py-8">
            <p class="text-gray-400 dark:text-gray-500">${t('no_records')}</p>
          </div>
        `;
        return;
      }

      // Grouping logic: "Brand Model Year" -> [Records]
      const agrupado = {};
      filteredCompat.forEach(c => {
        const key = `${c.marca}|${c.modelo}|${c.ano || 'univ'}`;
        if (!agrupado[key]) agrupado[key] = { 
          marca: c.marca, 
          modelo: c.modelo, 
          ano: c.ano, 
          items: [] 
        };
        agrupado[key].items.push(c);
      });

      div.innerHTML = Object.values(agrupado).map(veiculo => `
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div class="bg-gray-50 dark:bg-gray-900/50 p-4 border-b border-gray-200 dark:border-gray-700">
            <h4 class="font-bold text-gray-900 dark:text-white">${veiculo.marca} ${veiculo.modelo}</h4>
            <p class="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
              ${t('year')}: ${veiculo.ano || t('year_universal')}
            </p>
          </div>
          <div class="p-4 flex-1 space-y-4">
            ${veiculo.items.map(item => {
              const categoria = categorias.find(cat => cat.id === item.categoria_id);
              return `
                <div class="group relative bg-gray-50/50 dark:bg-gray-900/30 rounded-lg p-3 border border-gray-100 dark:border-gray-800">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-bold text-primary uppercase">${categoria?.nome || t('no_category')}</span>
                    <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button class="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded btn-edit-compat" data-id="${item.id}">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                      </button>
                      <button class="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded btn-delete-compat" data-id="${item.id}">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div class="flex flex-wrap gap-1">
                    ${(item.codigos_compativeis || []).map(code => `
                      <span class="px-2 py-0.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-[10px] font-medium text-gray-700 dark:text-gray-300">
                        ${code}
                      </span>
                    `).join('')}
                  </div>
                </div>
              `;
            }).join('')}
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
      form.elements['categoria_id'].value = comp.categoria_id || '';
      form.elements['codigos'].value = (comp.codigos_compativeis || []).join(', ');

      document.getElementById('modal-compatibilidade').classList.remove('hidden');
    }

    async function excluirCompatibilidade(id) {
      if (!await confirm(t('confirm_delete_compatibility') || 'Deseja realmente excluir esta compatibilidade?')) return;

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
        categoria_id: formData.get('categoria_id'),
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
    
    // Global actions
    window.veiculoActions = {
      adicionarAoCarrinho: (id) => {
        const item = pecas.find(p => p.id === id);
        if (!item) return;

        // Store in temporary cart for Vendas component to pick up
        let cart = JSON.parse(localStorage.getItem('temp_venda_items') || '[]');
        const exists = cart.find(i => i.peca_id === id);
        
        if (!exists) {
          cart.push({
            peca_id: item.id,
            codigo: item.codigo,
            nome: item.nome,
            quantidade: 1,
            preco_unitario: item.preco_venda,
            subtotal: item.preco_venda,
            stock_disponivel: item.stock_atual
          });
          localStorage.setItem('temp_venda_items', JSON.stringify(cart));
          showToast(`${item.nome} adicionado à venda!`, 'success');
        } else {
          showToast('Item já está na lista de venda', 'info');
        }

        // Redirect to sales page
        document.querySelector('[data-page="vendas"]')?.click();
      },
      repetirBusca: (marca, modelo, ano) => {
        document.getElementById('select-marca').value = marca;
        document.getElementById('select-marca').dispatchEvent(new Event('change'));
        
        setTimeout(() => {
          document.getElementById('select-modelo').value = modelo;
          document.getElementById('input-ano').value = ano;
          document.getElementById('btn-buscar-veiculo').disabled = false;
          document.getElementById('btn-buscar-veiculo').click(); // Auto execute
        }, 150);
      }
    };

  } catch (error) {
    console.error('Busca Veículo error:', error);
    container.innerHTML = '<p class="text-red-500">Erro ao carregar busca por veículo</p>';
  }
}
