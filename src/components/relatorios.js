// Relatórios Component - Reports and Analytics
import { dbOperations } from '../lib/db.js';
import { formatCurrency, formatDate, showToast } from '../utils/helpers.js';
import { t } from '../lib/i18n.js';

export async function initRelatorios(container) {
  try {
    const pecas = await dbOperations.getAll('pecas');
    const vendas = await dbOperations.getAll('vendas');
    const categorias = await dbOperations.getAll('categorias');
    
    container.innerHTML = `
      <div class="space-y-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">${t('reports')}</h2>

        <!-- Report Type Selection -->
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">${t('select_report_type')}</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              class="report-type-btn p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary hover:bg-blue-50 dark:hover:bg-blue-900/10 transition text-left"
              data-report="vendas-periodo"
            >
              <div class="flex items-center gap-3">
                <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">${t('sales_by_period')}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">${t('sales_analysis_date')}</p>
                </div>
              </div>
            </button>

            <button 
              class="report-type-btn p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary hover:bg-blue-50 dark:hover:bg-blue-900/10 transition text-left"
              data-report="ranking-pecas"
            >
              <div class="flex items-center gap-3">
                <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">${t('parts_ranking')}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">${t('top_selling_subtitle')}</p>
                </div>
              </div>
            </button>

            <button 
              class="report-type-btn p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary hover:bg-blue-50 dark:hover:bg-blue-900/10 transition text-left"
              data-report="stock-baixo"
            >
              <div class="flex items-center gap-3">
                <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">${t('low_stock_report')}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">${t('parts_with_min_stock')}</p>
                </div>
              </div>
            </button>

            <button 
              class="report-type-btn p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary hover:bg-blue-50 dark:hover:bg-blue-900/10 transition text-left"
              data-report="vendas-categoria"
            >
              <div class="flex items-center gap-3">
                <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
                </svg>
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">${t('sales_by_category')}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">${t('category_analysis')}</p>
                </div>
              </div>
            </button>

            <button 
              class="report-type-btn p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary hover:bg-blue-50 dark:hover:bg-blue-900/10 transition text-left"
              data-report="margem-lucro"
            >
              <div class="flex items-center gap-3">
                <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">${t('profit_margin')}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">${t('profitability_analysis')}</p>
                </div>
              </div>
            </button>

            <button 
              class="report-type-btn p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary hover:bg-blue-50 dark:hover:bg-blue-900/10 transition text-left"
              data-report="inventario"
            >
              <div class="flex items-center gap-3">
                <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                </svg>
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">${t('full_inventory')}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">${t('all_parts_listing')}</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- Report Content -->
        <div id="report-content" class="hidden bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 id="report-title" class="text-lg font-semibold text-gray-900 dark:text-white"></h3>
            <div class="flex gap-2">
              <button id="btn-export-pdf" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 transition flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
                </svg>
                ${t('export_pdf')}
              </button>
              <button id="btn-close-report" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 transition">
                ${t('close')}
              </button>
            </div>
          </div>
          <div id="report-data"></div>
        </div>
      </div>
    `;

    // Report handlers
    document.querySelectorAll('.report-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const reportType = btn.dataset.report;
        generateReport(reportType, pecas, vendas, categorias);
      });
    });

    document.getElementById('btn-close-report')?.addEventListener('click', () => {
      document.getElementById('report-content').classList.add('hidden');
    });

    document.getElementById('btn-export-pdf')?.addEventListener('click', async () => {
      const { jsPDF } = window.jspdf;
      const html2canvas = window.html2canvas;
      const reportContainer = document.getElementById('report-data');
      const title = document.getElementById('report-title').textContent;

      if (!reportContainer || !html2canvas || !jsPDF) {
        showToast('Biblioteca de PDF não carregada', 'error');
        return;
      }

      try {
        const canvas = await html2canvas(reportContainer, {
          scale: 2,
          logging: false,
          useCORS: true
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.setFontSize(18);
        pdf.text(title, 15, 15);
        pdf.setFontSize(10);
        pdf.text(`Gerado em: ${formatDate(new Date(), 'dd/MM/yyyy HH:mm')}`, 15, 22);
        
        pdf.addImage(imgData, 'PNG', 0, 30, pdfWidth, pdfHeight);
        pdf.save(`Relatorio_${title.replace(/\s+/g, '_')}.pdf`);
        
        showToast('PDF gerado com sucesso!', 'success');
      } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        showToast('Erro ao gerar PDF', 'error');
      }
    });

    function generateReport(type, pecas, vendas, categorias) {
      const reportContent = document.getElementById('report-content');
      const reportTitle = document.getElementById('report-title');
      const reportData = document.getElementById('report-data');

      reportContent.classList.remove('hidden');

      switch (type) {
        case 'vendas-periodo':
          reportTitle.textContent = t('sales_by_period');
          reportData.innerHTML = renderVendasPeriodo(vendas, pecas);
          break;
        case 'ranking-pecas':
          reportTitle.textContent = t('parts_ranking');
          reportData.innerHTML = renderRankingPecas(vendas, pecas);
          break;
        case 'stock-baixo':
          reportTitle.textContent = t('low_stock_report');
          reportData.innerHTML = renderStockBaixo(pecas, categorias);
          break;
        case 'vendas-categoria':
          reportTitle.textContent = t('sales_by_category');
          reportData.innerHTML = renderVendasCategoria(vendas, pecas, categorias);
          break;
        case 'margem-lucro':
          reportTitle.textContent = t('profit_margin');
          reportData.innerHTML = renderMargemLucro(vendas, pecas);
          break;
        case 'inventario':
          reportTitle.textContent = t('full_inventory');
          reportData.innerHTML = renderInventario(pecas, categorias);
          break;
      }
    }

    function renderVendasPeriodo(vendas, pecas) {
      if (vendas.length === 0) {
        return `<p class="text-gray-400 text-center py-8">${t('no_records')}</p>`;
      }

      const hoje = new Date().toISOString().split('T')[0];
      const mesAtual = hoje.substring(0, 7);

      const vendasHoje = vendas.filter(v => v.created_at.startsWith(hoje));
      const vendasMes = vendas.filter(v => v.created_at.startsWith(mesAtual));

      const totalHoje = vendasHoje.reduce((sum, v) => sum + v.total, 0);
      const totalMes = vendasMes.reduce((sum, v) => sum + v.total, 0);

      return `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">${t('sales_today')}</p>
            <p class="text-3xl font-bold text-primary">${formatCurrency(totalHoje)}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">${vendasHoje.length} ${t('vendas').toLowerCase()}</p>
          </div>
          <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">${t('sales_by_period')}</p>
            <p class="text-3xl font-bold text-green-600 dark:text-green-400">${formatCurrency(totalMes)}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">${vendasMes.length} ${t('vendas').toLowerCase()}</p>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">${t('sale_date')}</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Nº Venda</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">${t('name')}</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">${t('quantity')}</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">${t('total')}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              ${vendas.slice(0, 50).map(v => {
                const peca = pecas.find(p => p.id === v.peca_id);
                return `
                  <tr>
                    <td class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">${formatDate(v.created_at, 'dd/MM/yyyy HH:mm')}</td>
                    <td class="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">${v.numero_venda || '-'}</td>
                    <td class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">${peca?.nome || 'Desconhecida'}</td>
                    <td class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">${v.quantity || v.quantidade}</td>
                    <td class="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">${formatCurrency(v.total)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    function renderRankingPecas(vendas, pecas) {
      const counts = {};
      vendas.forEach(v => {
        counts[v.peca_id] = (counts[v.peca_id] || 0) + (v.quantity || v.quantidade);
      });

      const ranking = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([id, qty]) => {
          const peca = pecas.find(p => p.id === id);
          return { peca, quantidade: qty };
        });

      if (ranking.length === 0) {
        return `<p class="text-gray-400 text-center py-8">${t('no_records')}</p>`;
      }

      return `
        <div class="space-y-3">
          ${ranking.map((item, index) => `
            <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg">
              <div class="flex items-center gap-4">
                <span class="flex items-center justify-center w-8 h-8 rounded-full ${index < 3 ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} text-sm font-bold">
                  ${index + 1}
                </span>
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">${item.peca?.codigo || '-'} - ${item.peca?.nome || 'Desconhecida'}</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">${t('stock')}: ${item.peca?.stock_atual || 0} un</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-lg font-bold text-primary">${item.quantidade} un</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">${t('sold')}</p>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    function renderStockBaixo(pecas, categorias) {
      const stockBaixo = pecas.filter(p => p.stock_atual < p.stock_minimo);

      if (stockBaixo.length === 0) {
        return `<p class="text-gray-400 text-center py-8">${t('no_records')}</p>`;
      }

      return `
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">${t('code')}</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">${t('name')}</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">${t('category')}</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">${t('current_stock')}</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">${t('min_stock')}</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">${t('difference')}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              ${stockBaixo.map(p => {
                const categoria = categorias.find(c => c.id === p.categoria_id);
                const diferenca = p.stock_minimo - p.stock_atual;
                return `
                  <tr>
                    <td class="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">${p.codigo}</td>
                    <td class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">${p.nome}</td>
                    <td class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">${categoria?.nome || '-'}</td>
                    <td class="px-4 py-2 text-sm">
                      <span class="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-xs font-medium">
                        ${p.stock_atual} un
                      </span>
                    </td>
                    <td class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">${p.stock_minimo} un</td>
                    <td class="px-4 py-2 text-sm text-red-600 dark:text-red-400 font-medium">-${diferenca} un</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    function renderVendasCategoria(vendas, pecas, categorias) {
      const porCategoria = {};
      
      vendas.forEach(v => {
        const peca = pecas.find(p => p.id === v.peca_id);
        const catId = peca?.categoria_id || 'sem-categoria';
        if (!porCategoria[catId]) {
          porCategoria[catId] = { quantidade: 0, total: 0 };
        }
        porCategoria[catId].quantidade += (v.quantity || v.quantidade);
        porCategoria[catId].total += v.total;
      });

      const dados = Object.entries(porCategoria).map(([catId, data]) => {
        const categoria = categorias.find(c => c.id === catId);
        return {
          nome: categoria?.nome || t('no_records'),
          ...data
        };
      }).sort((a, b) => b.total - a.total);

      if (dados.length === 0) {
        return `<p class="text-gray-400 text-center py-8">${t('no_records')}</p>`;
      }

      return `
        <div class="space-y-4">
          ${dados.map(cat => `
            <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div class="flex items-center justify-between mb-2">
                <h4 class="font-medium text-gray-900 dark:text-white">${cat.nome}</h4>
                <span class="text-lg font-bold text-primary">${formatCurrency(cat.total)}</span>
              </div>
              <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>${cat.quantidade} ${t('units_sold')}</span>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    function renderMargemLucro(vendas, pecas) {
      let totalCusto = 0;
      let totalVenda = 0;

      vendas.forEach(v => {
        const peca = pecas.find(p => p.id === v.peca_id);
        if (peca) {
          totalCusto += peca.preco_custo * (v.quantity || v.quantidade);
          totalVenda += v.total;
        }
      });

      const lucro = totalVenda - totalCusto;
      const margemValue = totalVenda > 0 ? ((lucro / totalVenda) * 100).toFixed(2) : 0;

      return `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">${t('total_cost')}</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">${formatCurrency(totalCusto)}</p>
          </div>
          <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">${t('total_revenue')}</p>
            <p class="text-2xl font-bold text-green-600 dark:text-green-400">${formatCurrency(totalVenda)}</p>
          </div>
          <div class="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">${t('net_profit')}</p>
            <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">${formatCurrency(lucro)}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">${t('margin')}: ${margemValue}%</p>
          </div>
        </div>
      `;
    }

    function renderInventario(pecas, categorias) {
      if (pecas.length === 0) {
        return `<p class="text-gray-400 text-center py-8">${t('no_records')}</p>`;
      }

      const totalValor = pecas.reduce((sum, p) => sum + (p.preco_venda * p.stock_atual), 0);

      return `
        <div class="mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">${t('stock_value_total')}</p>
          <p class="text-3xl font-bold text-primary">${formatCurrency(totalValor)}</p>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">${pecas.length} ${t('pecas').toLowerCase()} ${t('confirmed').toLowerCase()}</p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">${t('code')}</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">${t('name')}</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">${t('category')}</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">${t('stock')}</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">${t('price')}</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">${t('subtotal')}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              ${pecas.map(p => {
                const categoria = categorias.find(c => c.id === p.categoria_id);
                const valorTotal = p.preco_venda * p.stock_atual;
                return `
                  <tr>
                    <td class="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">${p.codigo}</td>
                    <td class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">${p.nome}</td>
                    <td class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">${categoria?.nome || '-'}</td>
                    <td class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">${p.stock_atual} un</td>
                    <td class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">${formatCurrency(p.preco_venda)}</td>
                    <td class="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">${formatCurrency(valorTotal)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

  } catch (error) {
    console.error('Relatórios error:', error);
    container.innerHTML = '<p class="text-red-500">Erro ao carregar relatórios</p>';
  }
}
