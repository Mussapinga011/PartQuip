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

            <!-- NOVOS RELATÓRIOS -->
            <button class="report-type-btn p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary hover:bg-blue-50 dark:hover:bg-blue-900/10 transition text-left" data-report="fluxo-caixa">
              <div class="flex items-center gap-3">
                <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                <div><p class="font-medium text-gray-900 dark:text-white">${t('cash_flow')}</p><p class="text-sm text-gray-500 dark:text-gray-400">Entradas por forma de pagamento</p></div>
              </div>
            </button>

            <button class="report-type-btn p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary hover:bg-blue-50 dark:hover:bg-blue-900/10 transition text-left" data-report="curva-abc">
              <div class="flex items-center gap-3">
                <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>
                <div><p class="font-medium text-gray-900 dark:text-white">${t('abc_curve')}</p><p class="text-sm text-gray-500 dark:text-gray-400">Classificação de produtos por receita</p></div>
              </div>
            </button>

            <button class="report-type-btn p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary hover:bg-blue-50 dark:hover:bg-blue-900/10 transition text-left" data-report="performance-vendedor">
              <div class="flex items-center gap-3">
                <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                <div><p class="font-medium text-gray-900 dark:text-white">${t('salesman_performance')}</p><p class="text-sm text-gray-500 dark:text-gray-400">Vendas por colaborador</p></div>
              </div>
            </button>

            <button class="report-type-btn p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary hover:bg-blue-50 dark:hover:bg-blue-900/10 transition text-left" data-report="giro-estoque">
              <div class="flex items-center gap-3">
                <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                <div><p class="font-medium text-gray-900 dark:text-white">${t('stock_turnover')}</p><p class="text-sm text-gray-500 dark:text-gray-400">Eficiência da renovação do estoque</p></div>
              </div>
            </button>

            <button class="report-type-btn p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary hover:bg-blue-50 dark:hover:bg-blue-900/10 transition text-left" data-report="sazonalidade">
              <div class="flex items-center gap-3">
                <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <div><p class="font-medium text-gray-900 dark:text-white">${t('seasonality')}</p><p class="text-sm text-gray-500 dark:text-gray-400">Vendas mês a mês (Ano Atual)</p></div>
              </div>
            </button>
          </div>
        </div>

        <!-- Report Content -->
        <div id="report-content" class="hidden bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 id="report-title" class="text-lg font-semibold text-gray-900 dark:text-white"></h3>
            <div class="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
              <button id="btn-export-excel" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 transition flex items-center justify-center gap-2 text-sm whitespace-nowrap">
                <svg class="w-4 h-4 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                <span class="hidden xs:inline truncate">${t('export_excel')}</span>
                <span class="xs:hidden">Excel</span>
              </button>
              <button id="btn-export-pdf" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 transition flex items-center justify-center gap-2 text-sm whitespace-nowrap">
                <svg class="w-4 h-4 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path></svg>
                <span class="hidden xs:inline truncate">${t('export_pdf')}</span>
                <span class="xs:hidden">PDF</span>
              </button>
              <button id="btn-share-report" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 transition flex items-center justify-center gap-2 text-sm whitespace-nowrap">
                <svg class="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                <span class="hidden xs:inline truncate">${t('share') || 'Partilhar'}</span>
                <span class="xs:hidden">${t('share') || 'Partilhar'}</span>
              </button>
              <button id="btn-close-report" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 transition text-sm flex items-center justify-center whitespace-nowrap">
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

    document.getElementById('btn-export-excel')?.addEventListener('click', () => {
      const table = document.querySelector('#report-data table');
      if (!table) {
        showToast('Nenhuma tabela encontrada para exportar', 'error');
        return;
      }
      exportToCSV(table, `Relatorio_${document.getElementById('report-title').textContent}`);
    });

    document.getElementById('btn-share-report')?.addEventListener('click', () => {
      const title = document.getElementById('report-title').textContent;
      const text = `Relatório PartQuip: ${title}\nData: ${new Date().toLocaleDateString()}\n\nConfira os detalhes no sistema.`;
      
      if (navigator.share) {
        navigator.share({ title, text }).catch(console.error);
      } else {
        const mailto = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text)}`;
        window.location.href = mailto;
      }
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
        case 'fluxo-caixa':
          reportTitle.textContent = t('cash_flow');
          reportData.innerHTML = renderFluxoCaixa(vendas);
          break;
        case 'curva-abc':
          reportTitle.textContent = t('abc_curve');
          reportData.innerHTML = renderCurvaABC(vendas, pecas);
          break;
        case 'performance-vendedor':
          reportTitle.textContent = t('salesman_performance');
          reportData.innerHTML = renderPerformanceVendedor(vendas);
          break;
        case 'giro-estoque':
          reportTitle.textContent = t('stock_turnover');
          reportData.innerHTML = renderGiroEstoque(vendas, pecas);
          break;
        case 'sazonalidade':
          reportTitle.textContent = t('seasonality');
          reportData.innerHTML = renderSazonalidade(vendas);
          break;
      }
    }

    function exportToCSV(table, filename) {
      const rows = Array.from(table.querySelectorAll('tr'));
      const csvContent = rows.map(row => {
        const cells = Array.from(row.querySelectorAll('th, td'));
        return cells.map(cell => `"${cell.textContent.replace(/"/g, '""')}"`).join(',');
      }).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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

    function renderFluxoCaixa(vendas) {
      const confirmadas = vendas.filter(v => v.status !== 'cancelada');
      const porMetodo = {};
      confirmadas.forEach(v => {
        const metodo = v.forma_pagamento || 'Outros';
        if (!porMetodo[metodo]) porMetodo[metodo] = 0;
        porMetodo[metodo] += v.total;
      });

      const totalGeral = confirmadas.reduce((sum, v) => sum + v.total, 0);

      return `
        <div class="mb-6 bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Entradas</p>
          <p class="text-3xl font-bold text-green-600 dark:text-green-400">${formatCurrency(totalGeral)}</p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-900/50">
              <tr><th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Forma de Pagamento</th><th class="px-4 py-2 text-right text-xs font-medium text-gray-700 dark:text-gray-300">Total</th><th class="px-4 py-2 text-right text-xs font-medium text-gray-700 dark:text-gray-300">%</th></tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              ${Object.entries(porMetodo).sort((a,b) => b[1] - a[1]).map(([metodo, valor]) => `
                <tr>
                  <td class="px-4 py-2 text-sm text-gray-900 dark:text-white">${metodo}</td>
                  <td class="px-4 py-2 text-sm text-right font-medium text-gray-900 dark:text-white">${formatCurrency(valor)}</td>
                  <td class="px-4 py-2 text-sm text-right text-gray-500">${((valor/totalGeral)*100).toFixed(1)}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    function renderCurvaABC(vendas, pecas) {
      const confirmadas = vendas.filter(v => v.status !== 'cancelada');
      const receitaPorPeca = {};
      confirmadas.forEach(v => {
        receitaPorPeca[v.peca_id] = (receitaPorPeca[v.peca_id] || 0) + v.total;
      });

      const totalReceita = confirmadas.reduce((sum, v) => sum + v.total, 0);
      const ranking = Object.entries(receitaPorPeca)
        .map(([id, receita]) => ({
          peca: pecas.find(p => p.id === id),
          receita,
          percentual: (receita / totalReceita) * 100
        }))
        .sort((a,b) => b.receita - a.receita);

      let acumulado = 0;
      const classificados = ranking.map(item => {
        acumulado += item.percentual;
        let classe = 'C';
        if (acumulado <= 80) classe = 'A';
        else if (acumulado <= 95) classe = 'B';
        return { ...item, classe };
      });

      return `
        <div class="mb-6 grid grid-cols-3 gap-4">
          <div class="bg-green-100 dark:bg-green-900/30 p-4 rounded-lg"><p class="text-xs font-bold text-green-700">Classe A (80%)</p><p class="text-xl font-bold">${classificados.filter(i => i.classe==='A').length} itens</p></div>
          <div class="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg"><p class="text-xs font-bold text-blue-700">Classe B (15%)</p><p class="text-xl font-bold">${classificados.filter(i => i.classe==='B').length} itens</p></div>
          <div class="bg-gray-100 dark:bg-gray-900/30 p-4 rounded-lg"><p class="text-xs font-bold text-gray-700">Classe C (5%)</p><p class="text-xl font-bold">${classificados.filter(i => i.classe==='C').length} itens</p></div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-900/50">
              <tr><th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Classe</th><th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Produto</th><th class="px-4 py-2 text-right text-xs font-medium text-gray-700 dark:text-gray-300">Receita</th><th class="px-4 py-2 text-right text-xs font-medium text-gray-700 dark:text-gray-300">% Acum.</th></tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              ${classificados.map((item, idx) => {
                let acumuladoAteAqui = classificados.slice(0, idx+1).reduce((s,i) => s + i.percentual, 0);
                return `
                  <tr>
                    <td class="px-4 py-2 text-sm"><span class="px-2 py-0.5 rounded-full font-bold ${item.classe==='A' ? 'bg-green-500 text-white' : item.classe==='B' ? 'bg-blue-500 text-white' : 'bg-gray-400 text-white'}">${item.classe}</span></td>
                    <td class="px-4 py-2 text-sm text-gray-900 dark:text-white">${item.peca?.nome || 'Desconhecido'}</td>
                    <td class="px-4 py-2 text-sm text-right font-medium text-gray-900 dark:text-white">${formatCurrency(item.receita)}</td>
                    <td class="px-4 py-2 text-sm text-right text-gray-500">${acumuladoAteAqui.toFixed(1)}%</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    function renderPerformanceVendedor(vendas) {
      const porVendedor = {};
      vendas.filter(v => v.status !== 'cancelada').forEach(v => {
        const vendedor = v.vendedor_nome || v.user_id || 'Administrador';
        if (!porVendedor[vendedor]) porVendedor[vendedor] = { total: 0, qtd: 0 };
        porVendedor[vendedor].total += v.total;
        porVendedor[vendedor].qtd += 1;
      });

      return `
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-900/50">
              <tr><th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Vendedor</th><th class="px-4 py-2 text-right text-xs font-medium text-gray-700 dark:text-gray-300">Vendas (Qtd)</th><th class="px-4 py-2 text-right text-xs font-medium text-gray-700 dark:text-gray-300">Volume Total</th></tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              ${Object.entries(porVendedor).sort((a,b) => b[1].total - a[1].total).map(([vend, dados]) => `
                <tr>
                  <td class="px-4 py-2 text-sm text-gray-900 dark:text-white font-medium">${vend}</td>
                  <td class="px-4 py-2 text-sm text-right text-gray-600 dark:text-gray-400">${dados.qtd}</td>
                  <td class="px-4 py-2 text-sm text-right font-bold text-primary">${formatCurrency(dados.total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
    function renderGiroEstoque(vendas, pecas) {
      const vendidos = {};
      vendas.forEach(v => {
        vendidos[v.peca_id] = (vendidos[v.peca_id] || 0) + (v.quantity || v.quantidade);
      });

      const items = pecas.map(p => {
        const totalVendido = vendidos[p.id] || 0;
        const giro = p.stock_atual > 0 ? (totalVendido / p.stock_atual).toFixed(2) : totalVendido;
        return { ...p, totalVendido, giro: parseFloat(giro) };
      }).sort((a,b) => b.giro - a.giro);

      return `
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-900/50">
              <tr><th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Produto</th><th class="px-4 py-2 text-right text-xs font-medium text-gray-700 dark:text-gray-300">Vendido</th><th class="px-4 py-2 text-right text-xs font-medium text-gray-700 dark:text-gray-300">Estoque</th><th class="px-4 py-2 text-right text-xs font-medium text-gray-700 dark:text-gray-300">Índice Giro</th></tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              ${items.slice(0, 50).map(item => `
                <tr>
                  <td class="px-4 py-2 text-sm text-gray-900 dark:text-white font-medium">${item.nome}</td>
                  <td class="px-4 py-2 text-sm text-right text-gray-600">${item.totalVendido} un</td>
                  <td class="px-4 py-2 text-sm text-right text-gray-600">${item.stock_atual} un</td>
                  <td class="px-4 py-2 text-sm text-right font-bold ${item.giro > 1 ? 'text-green-600' : 'text-orange-500'}">${item.giro}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    function renderSazonalidade(vendas) {
      const mesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const porMes = Array(12).fill(0);
      const anoAtual = new Date().getFullYear();

      vendas.filter(v => new Date(v.created_at).getFullYear() === anoAtual).forEach(v => {
        const mes = new Date(v.created_at).getMonth();
        porMes[mes] += v.total;
      });

      const max = Math.max(...porMes, 1);

      return `
        <div class="h-64 flex items-end gap-2 mb-8 px-4 border-b border-gray-200 dark:border-gray-700 pt-10">
          ${porMes.map((valor, idx) => `
            <div class="flex-1 flex flex-col items-center group">
              <div class="w-full bg-primary/20 group-hover:bg-primary/40 transition-all rounded-t relative" style="height: ${(valor/max)*100}%">
                <span class="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition whitespace-nowrap bg-white dark:bg-gray-800 p-1 rounded shadow border border-gray-100 dark:border-gray-700 z-10">${formatCurrency(valor)}</span>
              </div>
              <span class="text-xs text-gray-500 mt-2">${mesNomes[idx]}</span>
            </div>
          `).join('')}
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead><tr><th class="px-4 py-2 text-left text-xs font-medium text-gray-400">Mês</th><th class="px-4 py-2 text-right text-xs font-medium text-gray-400">Total Vendas</th></tr></thead>
            <tbody>
              ${porMes.map((valor, idx) => `
                <tr><td class="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 font-medium">${mesNomes[idx]}</td><td class="px-4 py-2 text-sm text-right text-gray-900 dark:text-white">${formatCurrency(valor)}</td></tr>
              `).join('')}
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

