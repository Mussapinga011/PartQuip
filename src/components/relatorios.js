// Relatórios Component - Reports and Analytics
import { dbOperations } from '../lib/db.js';
import { formatCurrency, formatDate } from '../utils/helpers.js';

export async function initRelatorios(container) {
  try {
    const pecas = await dbOperations.getAll('pecas');
    const vendas = await dbOperations.getAll('vendas');
    const categorias = await dbOperations.getAll('categorias');
    
    container.innerHTML = `
      <div class="space-y-6">
        <h2 class="text-2xl font-bold text-gray-900">Relatórios</h2>

        <!-- Report Type Selection -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Selecione o Tipo de Relatório</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              class="report-type-btn p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition text-left"
              data-report="vendas-periodo"
            >
              <div class="flex items-center gap-3">
                <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                <div>
                  <p class="font-medium text-gray-900">Vendas por Período</p>
                  <p class="text-sm text-gray-500">Análise de vendas por data</p>
                </div>
              </div>
            </button>

            <button 
              class="report-type-btn p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition text-left"
              data-report="ranking-pecas"
            >
              <div class="flex items-center gap-3">
                <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
                <div>
                  <p class="font-medium text-gray-900">Ranking de Peças</p>
                  <p class="text-sm text-gray-500">Peças mais vendidas</p>
                </div>
              </div>
            </button>

            <button 
              class="report-type-btn p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition text-left"
              data-report="stock-baixo"
            >
              <div class="flex items-center gap-3">
                <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <div>
                  <p class="font-medium text-gray-900">Stock Baixo</p>
                  <p class="text-sm text-gray-500">Peças com stock mínimo</p>
                </div>
              </div>
            </button>

            <button 
              class="report-type-btn p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition text-left"
              data-report="vendas-categoria"
            >
              <div class="flex items-center gap-3">
                <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
                </svg>
                <div>
                  <p class="font-medium text-gray-900">Vendas por Categoria</p>
                  <p class="text-sm text-gray-500">Análise por categoria</p>
                </div>
              </div>
            </button>

            <button 
              class="report-type-btn p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition text-left"
              data-report="margem-lucro"
            >
              <div class="flex items-center gap-3">
                <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                  <p class="font-medium text-gray-900">Margem de Lucro</p>
                  <p class="text-sm text-gray-500">Análise de rentabilidade</p>
                </div>
              </div>
            </button>

            <button 
              class="report-type-btn p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition text-left"
              data-report="inventario"
            >
              <div class="flex items-center gap-3">
                <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                </svg>
                <div>
                  <p class="font-medium text-gray-900">Inventário Completo</p>
                  <p class="text-sm text-gray-500">Listagem de todas as peças</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- Report Content -->
        <div id="report-content" class="hidden bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 id="report-title" class="text-lg font-semibold text-gray-900"></h3>
            <div class="flex gap-2">
              <button id="btn-export-pdf" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
                </svg>
                Exportar PDF
              </button>
              <button id="btn-close-report" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                Fechar
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
          reportTitle.textContent = 'Vendas por Período';
          reportData.innerHTML = renderVendasPeriodo(vendas, pecas);
          break;
        case 'ranking-pecas':
          reportTitle.textContent = 'Ranking de Peças Mais Vendidas';
          reportData.innerHTML = renderRankingPecas(vendas, pecas);
          break;
        case 'stock-baixo':
          reportTitle.textContent = 'Peças com Stock Baixo';
          reportData.innerHTML = renderStockBaixo(pecas, categorias);
          break;
        case 'vendas-categoria':
          reportTitle.textContent = 'Vendas por Categoria';
          reportData.innerHTML = renderVendasCategoria(vendas, pecas, categorias);
          break;
        case 'margem-lucro':
          reportTitle.textContent = 'Análise de Margem de Lucro';
          reportData.innerHTML = renderMargemLucro(vendas, pecas);
          break;
        case 'inventario':
          reportTitle.textContent = 'Inventário Completo';
          reportData.innerHTML = renderInventario(pecas, categorias);
          break;
      }
    }

    function renderVendasPeriodo(vendas, pecas) {
      if (vendas.length === 0) {
        return '<p class="text-gray-400 text-center py-8">Nenhuma venda registrada</p>';
      }

      const hoje = new Date().toISOString().split('T')[0];
      const mesAtual = hoje.substring(0, 7);

      const vendasHoje = vendas.filter(v => v.created_at.startsWith(hoje));
      const vendasMes = vendas.filter(v => v.created_at.startsWith(mesAtual));

      const totalHoje = vendasHoje.reduce((sum, v) => sum + v.total, 0);
      const totalMes = vendasMes.reduce((sum, v) => sum + v.total, 0);

      return `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div class="bg-blue-50 rounded-lg p-6">
            <p class="text-sm text-gray-600 mb-1">Vendas Hoje</p>
            <p class="text-3xl font-bold text-primary">${formatCurrency(totalHoje)}</p>
            <p class="text-sm text-gray-600 mt-2">${vendasHoje.length} vendas</p>
          </div>
          <div class="bg-green-50 rounded-lg p-6">
            <p class="text-sm text-gray-600 mb-1">Vendas Este Mês</p>
            <p class="text-3xl font-bold text-green-600">${formatCurrency(totalMes)}</p>
            <p class="text-sm text-gray-600 mt-2">${vendasMes.length} vendas</p>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-700">Data</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-700">Nº Venda</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-700">Peça</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-700">Quantidade</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-700">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              ${vendas.slice(0, 50).map(v => {
                const peca = pecas.find(p => p.id === v.peca_id);
                return `
                  <tr>
                    <td class="px-4 py-2 text-sm">${formatDate(v.created_at, 'dd/MM/yyyy HH:mm')}</td>
                    <td class="px-4 py-2 text-sm font-medium">${v.numero_venda || '-'}</td>
                    <td class="px-4 py-2 text-sm">${peca?.nome || 'Desconhecida'}</td>
                    <td class="px-4 py-2 text-sm">${v.quantidade}</td>
                    <td class="px-4 py-2 text-sm font-medium">${formatCurrency(v.total)}</td>
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
        counts[v.peca_id] = (counts[v.peca_id] || 0) + v.quantidade;
      });

      const ranking = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([id, qty]) => {
          const peca = pecas.find(p => p.id === id);
          return { peca, quantidade: qty };
        });

      if (ranking.length === 0) {
        return '<p class="text-gray-400 text-center py-8">Nenhuma venda registrada</p>';
      }

      return `
        <div class="space-y-3">
          ${ranking.map((item, index) => `
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center gap-4">
                <span class="flex items-center justify-center w-8 h-8 rounded-full ${index < 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'} text-sm font-bold">
                  ${index + 1}
                </span>
                <div>
                  <p class="font-medium text-gray-900">${item.peca?.codigo || '-'} - ${item.peca?.nome || 'Desconhecida'}</p>
                  <p class="text-sm text-gray-600">Stock atual: ${item.peca?.stock_atual || 0} un</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-lg font-bold text-primary">${item.quantidade} un</p>
                <p class="text-sm text-gray-600">vendidas</p>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    function renderStockBaixo(pecas, categorias) {
      const stockBaixo = pecas.filter(p => p.stock_atual < p.stock_minimo);

      if (stockBaixo.length === 0) {
        return '<p class="text-gray-400 text-center py-8">Nenhuma peça com stock baixo</p>';
      }

      return `
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-700">Código</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-700">Nome</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-700">Categoria</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-700">Stock Atual</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-700">Stock Mínimo</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-700">Diferença</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              ${stockBaixo.map(p => {
                const categoria = categorias.find(c => c.id === p.categoria_id);
                const diferenca = p.stock_minimo - p.stock_atual;
                return `
                  <tr>
                    <td class="px-4 py-2 text-sm font-medium">${p.codigo}</td>
                    <td class="px-4 py-2 text-sm">${p.nome}</td>
                    <td class="px-4 py-2 text-sm">${categoria?.nome || '-'}</td>
                    <td class="px-4 py-2 text-sm">
                      <span class="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                        ${p.stock_atual} un
                      </span>
                    </td>
                    <td class="px-4 py-2 text-sm">${p.stock_minimo} un</td>
                    <td class="px-4 py-2 text-sm text-red-600 font-medium">-${diferenca} un</td>
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
        porCategoria[catId].quantidade += v.quantidade;
        porCategoria[catId].total += v.total;
      });

      const dados = Object.entries(porCategoria).map(([catId, data]) => {
        const categoria = categorias.find(c => c.id === catId);
        return {
          nome: categoria?.nome || 'Sem Categoria',
          ...data
        };
      }).sort((a, b) => b.total - a.total);

      if (dados.length === 0) {
        return '<p class="text-gray-400 text-center py-8">Nenhuma venda registrada</p>';
      }

      return `
        <div class="space-y-4">
          ${dados.map(cat => `
            <div class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-center justify-between mb-2">
                <h4 class="font-medium text-gray-900">${cat.nome}</h4>
                <span class="text-lg font-bold text-primary">${formatCurrency(cat.total)}</span>
              </div>
              <div class="flex items-center justify-between text-sm text-gray-600">
                <span>${cat.quantidade} unidades vendidas</span>
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
          totalCusto += peca.preco_custo * v.quantidade;
          totalVenda += v.total;
        }
      });

      const lucro = totalVenda - totalCusto;
      const margem = totalVenda > 0 ? ((lucro / totalVenda) * 100).toFixed(2) : 0;

      return `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-blue-50 rounded-lg p-6">
            <p class="text-sm text-gray-600 mb-1">Custo Total</p>
            <p class="text-2xl font-bold text-gray-900">${formatCurrency(totalCusto)}</p>
          </div>
          <div class="bg-green-50 rounded-lg p-6">
            <p class="text-sm text-gray-600 mb-1">Receita Total</p>
            <p class="text-2xl font-bold text-green-600">${formatCurrency(totalVenda)}</p>
          </div>
          <div class="bg-purple-50 rounded-lg p-6">
            <p class="text-sm text-gray-600 mb-1">Lucro Líquido</p>
            <p class="text-2xl font-bold text-purple-600">${formatCurrency(lucro)}</p>
            <p class="text-sm text-gray-600 mt-2">Margem: ${margem}%</p>
          </div>
        </div>
      `;
    }

    function renderInventario(pecas, categorias) {
      if (pecas.length === 0) {
        return '<p class="text-gray-400 text-center py-8">Nenhuma peça cadastrada</p>';
      }

      const totalValor = pecas.reduce((sum, p) => sum + (p.preco_venda * p.stock_atual), 0);

      return `
        <div class="mb-6 bg-blue-50 rounded-lg p-6">
          <p class="text-sm text-gray-600 mb-1">Valor Total em Stock</p>
          <p class="text-3xl font-bold text-primary">${formatCurrency(totalValor)}</p>
          <p class="text-sm text-gray-600 mt-2">${pecas.length} peças cadastradas</p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-700">Código</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-700">Nome</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-700">Categoria</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-700">Stock</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-700">Preço</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-700">Valor Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              ${pecas.map(p => {
                const categoria = categorias.find(c => c.id === p.categoria_id);
                const valorTotal = p.preco_venda * p.stock_atual;
                return `
                  <tr>
                    <td class="px-4 py-2 text-sm font-medium">${p.codigo}</td>
                    <td class="px-4 py-2 text-sm">${p.nome}</td>
                    <td class="px-4 py-2 text-sm">${categoria?.nome || '-'}</td>
                    <td class="px-4 py-2 text-sm">${p.stock_atual} un</td>
                    <td class="px-4 py-2 text-sm">${formatCurrency(p.preco_venda)}</td>
                    <td class="px-4 py-2 text-sm font-medium">${formatCurrency(valorTotal)}</td>
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
