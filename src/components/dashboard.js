// Advanced Dashboard Component
import Chart from 'chart.js/auto';
import { dbOperations } from '../lib/db.js';
import { formatCurrency, formatDate } from '../utils/helpers.js';
import { t } from '../lib/i18n.js';
import { startOfDay, startOfWeek, startOfMonth, subDays, format, isWithinInterval, endOfDay } from 'date-fns';

let chartInstance = null;
let currentPeriod = 'month'; // 'day', 'week', 'month'

export async function initDashboard(container) {
  // Cleanup previous chart instance if it exists
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  renderTemplate(container);
  await refreshDashboard();
}

function renderTemplate(container) {
  container.innerHTML = `
    <div class="space-y-6 pb-12 print:p-0">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">${t('dashboard_advanced') || 'Dashboard Avançado'}</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">${t('dashboard_subtitle') || 'Acompanhamento em tempo real do seu negócio'}</p>
        </div>
        
        <div class="flex flex-wrap items-center gap-2">
          <!-- Período Filtro -->
          <div class="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
            <button data-period="day" class="period-btn px-3 py-1.5 text-xs font-medium rounded-md transition ${currentPeriod === 'day' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}">
              ${t('day') || 'Dia'}
            </button>
            <button data-period="week" class="period-btn px-3 py-1.5 text-xs font-medium rounded-md transition ${currentPeriod === 'week' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}">
              ${t('week') || 'Semana'}
            </button>
            <button data-period="month" class="period-btn px-3 py-1.5 text-xs font-medium rounded-md transition ${currentPeriod === 'month' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}">
              ${t('month') || 'Mês'}
            </button>
          </div>

          <button id="btn-export-pdf" class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
            </svg>
            ${t('export_pdf') || 'Exportar PDF'}
          </button>
        </div>
      </div>

      <div id="dashboard-content" class="space-y-6">
        <div class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    </div>
  `;

  // Filter events
  container.querySelectorAll('.period-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPeriod = btn.dataset.period;
      // Update UI state
      container.querySelectorAll('.period-btn').forEach(b => {
        b.classList.remove('bg-white', 'dark:bg-gray-700', 'text-primary', 'shadow-sm');
        b.classList.add('text-gray-500', 'dark:text-gray-400');
      });
      btn.classList.add('bg-white', 'dark:bg-gray-700', 'text-primary', 'shadow-sm');
      btn.classList.remove('text-gray-500', 'dark:text-gray-400');
      
      refreshDashboard();
    });
  });

  document.getElementById('btn-export-pdf').addEventListener('click', () => {
    window.print();
  });
}

async function refreshDashboard() {
  const content = document.getElementById('dashboard-content');
  if (!content) return;

  try {
    const pecas = await dbOperations.getAll('pecas');
    const vendas = await dbOperations.getAll('vendas');
    
    const kpis = calculateAdvancedKPIs(pecas, vendas, currentPeriod);
    
    content.innerHTML = `
      <!-- Row 1: KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        ${renderKPICard(t('sales_period') || 'Vendas no Período', formatCurrency(kpis.vendasPeriodo), 'text-blue-600 dark:text-blue-400', 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z', kpis.vendasTrend)}
        ${renderKPICard(t('gross_profit') || 'Lucro Bruto', formatCurrency(kpis.lucroBruto), 'text-green-600 dark:text-green-400', 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', kpis.lucroTrend)}
        ${renderKPICard(t('low_stock') || 'Estoque Baixo', kpis.stockBaixo, 'text-yellow-600 dark:text-yellow-400', 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', null, kpis.stockBaixo > 0)}
        ${renderKPICard(t('avg_ticket') || 'Ticket Médio', formatCurrency(kpis.ticketMedio), 'text-purple-600 dark:text-purple-400', 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z')}
      </div>

      <!-- Row 2: Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${t('sales_performance') || 'Desempenho de Vendas'}</h3>
          </div>
          <div class="h-80 relative w-full">
            <canvas id="vendas-performance-chart"></canvas>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${t('profit_analysis') || 'Análise de Lucratividade'}</h3>
          </div>
          <div class="h-80 relative w-full">
            <canvas id="lucro-analysis-chart"></canvas>
          </div>
        </div>
      </div>

      <!-- Row 3: Product Analysis -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Top Products -->
        <div class="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">${t('top_products') || 'Produtos Mais Vendidos'}</h3>
          <div class="space-y-4">
            ${renderProductRanking(kpis.topProdutos)}
          </div>
        </div>

        <!-- Slow-moving Products -->
        <div class="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">${t('slow_moving_products') || 'Produtos com Menor Giro'}</h3>
          <div class="space-y-4">
            ${renderProductRanking(kpis.slowProdutos, 'orange')}
          </div>
        </div>

        <!-- Meta & Ranking -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Meta Mensal -->
          <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">${t('monthly_goal') || 'Meta Mensal'}</h3>
            <div class="space-y-2">
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-500 dark:text-gray-400">${formatCurrency(kpis.vendasMes)} / ${formatCurrency(kpis.metaMensal)}</span>
                <span class="font-bold text-primary">${Math.round(kpis.metaProgresso)}%</span>
              </div>
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div class="bg-primary h-2.5 rounded-full transition-all duration-500" style="width: ${Math.min(100, kpis.metaProgresso)}%"></div>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                ${kpis.metaProgresso >= 100 ? '✅ Meta atingida! Parabéns!' : `Faltam ${formatCurrency(Math.max(0, kpis.metaMensal - kpis.vendasMes))} para atingir a meta.`}
              </p>
            </div>
          </div>

          <!-- Ranking Vendedores -->
          <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">${t('salesman_ranking') || 'Ranking de Vendedores'}</h3>
            <div class="space-y-3">
              ${renderSalesmanRanking(kpis.rankingVendedores)}
            </div>
          </div>
        </div>
      </div>
    `;

    // Initialize Charts
    initCharts(kpis.chartData);

  } catch (error) {
    console.error('Dashboard refresh error:', error);
    content.innerHTML = `
      <div class="text-center py-12">
        <p class="text-red-500">${t('loading_error') || 'Erro ao carregar dados'}</p>
      </div>
    `;
  }
}

function calculateAdvancedKPIs(pecas, vendas, period) {
  const now = new Date();
  const startAt = period === 'day' ? startOfDay(now) : 
                period === 'week' ? startOfWeek(now, { weekStartsOn: 1 }) : 
                startOfMonth(now);
  
  const endAt = endOfDay(now);
  
  // Previous period for trends
  const prevStartAt = period === 'day' ? startOfDay(subDays(now, 1)) :
                    period === 'week' ? startOfWeek(subDays(startAt, 7), { weekStartsOn: 1 }) :
                    startOfMonth(subDays(startAt, 30));
  const prevEndAt = subDays(startAt, 1);

  // Filter Sales
  const filteredSales = vendas.filter(v => 
    v.status !== 'cancelada' && 
    isWithinInterval(new Date(v.created_at), { start: startAt, end: endAt })
  );

  const prevSales = vendas.filter(v => 
    v.status !== 'cancelada' && 
    isWithinInterval(new Date(v.created_at), { start: prevStartAt, end: prevEndAt })
  );

  // Calculations
  const vendasPeriodo = filteredSales.reduce((sum, v) => sum + v.total, 0);
  const prevVendasTotal = prevSales.reduce((sum, v) => sum + v.total, 0);
  const vendasTrend = prevVendasTotal > 0 ? ((vendasPeriodo - prevVendasTotal) / prevVendasTotal) * 100 : null;

  // Profit Calculation
  let lucroBruto = 0;
  filteredSales.forEach(v => {
    const peca = pecas.find(p => p.id === v.peca_id);
    if (peca) {
      const custo = peca.preco_custo || 0;
      lucroBruto += (v.preco_unitario - custo) * v.quantidade;
    }
  });

  let prevLucro = 0;
  prevSales.forEach(v => {
    const peca = pecas.find(p => p.id === v.peca_id);
    if (peca) {
      const custo = peca.preco_custo || 0;
      prevLucro += (v.preco_unitario - custo) * v.quantidade;
    }
  });
  const lucroTrend = prevLucro > 0 ? ((lucroBruto - prevLucro) / prevLucro) * 100 : null;

  // Monthly Goal (Example: 50.000 MZN)
  const metaMensal = 50000;
  const vendasMes = vendas.filter(v => 
    v.status !== 'cancelada' && 
    isWithinInterval(new Date(v.created_at), { start: startOfMonth(now), end: endAt })
  ).reduce((sum, v) => sum + v.total, 0);
  const metaProgresso = (vendasMes / metaMensal) * 100;

  // Top Products
  const topProdutos = processProductStats(filteredSales, pecas).slice(0, 10);
  
  // Slow-moving (low sales in current month)
  const monthlySales = vendas.filter(v => 
    v.status !== 'cancelada' && 
    isWithinInterval(new Date(v.created_at), { start: startOfMonth(now), end: endAt })
  );
  const monthlyCounts = {};
  monthlySales.forEach(v => monthlyCounts[v.peca_id] = (monthlyCounts[v.peca_id] || 0) + v.quantidade);
  
  const slowProdutos = pecas
    .map(p => ({
      nome: p.nome,
      quantidade: monthlyCounts[p.id] || 0
    }))
    .sort((a, b) => a.quantidade - b.quantidade)
    .slice(0, 10);

  // Ranking Vendedores
  const rankingVendedores = processSalesmanRanking(filteredSales);

  // Chart Data (History of last 30 days)
  const chartData = processChartData(vendas, pecas);

  return {
    vendasPeriodo,
    vendasTrend,
    lucroBruto,
    lucroTrend,
    stockBaixo: pecas.filter(p => p.stock_atual < p.stock_minimo).length,
    ticketMedio: filteredSales.length > 0 ? vendasPeriodo / filteredSales.length : 0,
    metaMensal,
    vendasMes,
    metaProgresso,
    topProdutos,
    slowProdutos,
    rankingVendedores,
    chartData
  };
}

function processProductStats(vendas, pecas) {
  const counts = {};
  vendas.forEach(v => {
    counts[v.peca_id] = (counts[v.peca_id] || 0) + v.quantidade;
  });
  
  return Object.entries(counts)
    .map(([id, qty]) => {
      const peca = pecas.find(p => p.id === id);
      return { nome: peca?.nome || 'Desconhecida', quantidade: qty };
    })
    .sort((a, b) => b.quantidade - a.quantidade);
}

function processSalesmanRanking(vendas) {
  const rankings = {};
  vendas.forEach(v => {
    const userEmail = v.user_id || 'Anônimo'; // Ideally we'd map ID to Name/Email
    rankings[userEmail] = (rankings[userEmail] || 0) + v.total;
  });

  return Object.entries(rankings)
    .map(([email, total]) => ({ email, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
}

function processChartData(vendas, pecas) {
  const last30Days = [];
  for (let i = 29; i >= 0; i--) {
    const d = subDays(new Date(), i);
    last30Days.push({
      date: format(d, 'yyyy-MM-dd'),
      label: format(d, 'dd/MM'),
      sales: 0,
      profit: 0
    });
  }

  vendas.forEach(v => {
    if (v.status === 'cancelada') return;
    const vDate = v.created_at.split('T')[0];
    const chartPoint = last30Days.find(p => p.date === vDate);
    
    if (chartPoint) {
      chartPoint.sales += v.total;
      
      const peca = pecas.find(p => p.id === v.peca_id);
      if (peca) {
        chartPoint.profit += (v.preco_unitario - (peca.preco_custo || 0)) * v.quantidade;
      }
    }
  });

  return last30Days;
}

function initCharts(data) {
  const isDark = document.documentElement.classList.contains('dark');
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const textColor = isDark ? '#9ca3af' : '#4b5563';

  // 1. Sales Performance Chart
  const salesCtx = document.getElementById('vendas-performance-chart');
  if (salesCtx) {
    new Chart(salesCtx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.label),
        datasets: [{
          label: t('sales') || 'Vendas',
          data: data.map(d => d.sales),
          backgroundColor: '#3b82f6',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: textColor, maxTicksLimit: 10 } },
          y: { 
            grid: { color: gridColor }, 
            ticks: { 
              color: textColor,
              callback: val => formatCurrency(val).replace('MT', '')
            }
          }
        }
      }
    });
  }

  // 2. Profit Analysis Chart
  const profitCtx = document.getElementById('lucro-analysis-chart');
  if (profitCtx) {
    new Chart(profitCtx, {
      type: 'line',
      data: {
        labels: data.map(d => d.label),
        datasets: [{
          label: t('profit') || 'Lucro',
          data: data.map(d => d.profit),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: textColor, maxTicksLimit: 10 } },
          y: { 
            grid: { color: gridColor }, 
            ticks: { 
              color: textColor,
              callback: val => formatCurrency(val).replace('MT', '')
            }
          }
        }
      }
    });
  }
}

function renderKPICard(title, value, colorClass, iconPath, trend = null, alert = false) {
  let trendHtml = '';
  if (trend !== null) {
    const isUp = trend >= 0;
    trendHtml = `
      <div class="flex items-center gap-1 mt-1">
        <span class="${isUp ? 'text-green-500' : 'text-red-500'} text-xs font-bold">
          ${isUp ? '↑' : '↓'} ${Math.abs(trend).toFixed(1)}%
        </span>
        <span class="text-[10px] text-gray-400">vs prev</span>
      </div>
    `;
  }

  return `
    <div class="bg-white dark:bg-gray-800 rounded-lg border ${alert ? 'border-red-500 animate-pulse' : 'border-gray-200 dark:border-gray-700'} p-5 transition-all hover:shadow-md">
      <div class="flex items-start justify-between">
        <div>
          <p class="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1">${title}</p>
          <div class="flex flex-col">
            <p class="text-2xl font-bold ${colorClass}">${value}</p>
            ${trendHtml}
          </div>
        </div>
        <div class="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg ${colorClass}">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${iconPath}"></path>
          </svg>
        </div>
      </div>
    </div>
  `;
}

function renderProductRanking(items, color = 'blue') {
  if (items.length === 0) return `<p class="text-center text-sm text-gray-500 py-4">${t('no_data') || 'Sem dados'}</p>`;
  
  const colors = {
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
  };

  return items.map((item, i) => `
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3 overflow-hidden">
        <span class="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs font-bold">
          ${i + 1}
        </span>
        <span class="text-sm text-gray-700 dark:text-gray-300 truncate" title="${item.nome}">${item.nome}</span>
      </div>
      <span class="flex-shrink-0 px-2 py-0.5 rounded text-xs font-bold ${colors[color]} uppercase">
        ${item.quantidade} un
      </span>
    </div>
  `).join('');
}

function renderSalesmanRanking(rankings) {
  if (rankings.length === 0) return `<p class="text-center text-sm text-gray-500 py-4">${t('no_vendas') || 'Sem vendas'}</p>`;
  
  return rankings.map((r, i) => `
    <div class="flex items-center justify-between group">
      <div class="flex items-center gap-3">
        <div class="relative">
          <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white text-xs font-bold capitalize">
            ${r.email.charAt(0)}
          </div>
          ${i === 0 ? '<span class="absolute -top-1 -right-1 text-[10px]">👑</span>' : ''}
        </div>
        <div class="flex flex-col">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate w-32">${r.email}</span>
          <span class="text-[10px] text-gray-400">${i + 1}º Lugar</span>
        </div>
      </div>
      <span class="text-sm font-bold text-primary">${formatCurrency(r.total)}</span>
    </div>
  `).join('');
}
