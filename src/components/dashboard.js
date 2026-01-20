// Dashboard Component
import Chart from 'chart.js/auto';
import { dbOperations } from '../lib/db.js';
import { formatCurrency } from '../utils/helpers.js';
import { t } from '../lib/i18n.js';

let chartInstance = null;

export async function initDashboard(container) {
  // Cleanup previous chart instance if it exists
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  try {
    // Fetch data
    const pecas = await dbOperations.getAll('pecas');
    const vendas = await dbOperations.getAll('vendas');
    
    // Calculate KPIs
    const kpis = calculateKPIs(pecas, vendas);
    
    // Render dashboard
    container.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">${t('dashboard')}</h2>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            ${new Date().toLocaleString()}
          </div>
        </div>

        <!-- KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          ${renderKPICard(t('total_parts'), kpis.totalPecas, 'text-blue-600 dark:text-blue-400', 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4')}
          ${renderKPICard(t('stock_value'), formatCurrency(kpis.valorStock), 'text-green-600 dark:text-green-400', 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z')}
          ${renderKPICard(t('low_stock'), kpis.stockBaixo, 'text-yellow-600 dark:text-yellow-400', 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z')}
          ${renderKPICard(t('sales_today'), formatCurrency(kpis.vendasHoje), 'text-purple-600 dark:text-purple-400', 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z')}
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Vendas do Mês -->
          <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">${t('monthly_sales') || 'Vendas do Mês'}</h3>
            <div class="h-64 relative w-full">
              <canvas id="vendas-chart"></canvas>
            </div>
          </div>

          <!-- Top Peças -->
          <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">${t('top_selling')}</h3>
            <div class="space-y-3">
              ${renderTopPecas(kpis.topPecas)}
            </div>
          </div>
        </div>

        <!-- Alerts -->
        ${kpis.stockBaixo > 0 ? `
          <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/30 rounded-lg p-4">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              <div>
                <h4 class="font-medium text-yellow-900 dark:text-yellow-100">${t('low_stock')}</h4>
                <p class="text-sm text-yellow-700 dark:text-yellow-300 mt-1">${kpis.stockBaixo} ${t('parts_below_min') || 'peça(s) com stock abaixo do mínimo.'}</p>
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    `;

    // Initialize Chart
    initChart(vendas);

  } catch (error) {
    console.error('Dashboard error:', error);
    container.innerHTML = `
      <div class="text-center py-12">
        <p class="text-red-500">${t('loading_error')}</p>
      </div>
    `;
  }
}

function initChart(vendas) {
  const ctx = document.getElementById('vendas-chart');
  if (!ctx) return;

  // Process data for the current month
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed
  
  // Get days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const labels = Array.from({length: daysInMonth}, (_, i) => i + 1);
  const data = new Array(daysInMonth).fill(0);

  // Filter and sum sales
  vendas.forEach(v => {
    const d = new Date(v.created_at);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      data[day - 1] += v.total;
    }
  });

  const isDark = document.documentElement.classList.contains('dark');
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const textColor = isDark ? '#9ca3af' : '#4b5563';

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: t('sales_value') || 'Valor em Vendas',
        data: data,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index',
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return formatCurrency(context.raw);
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false,
            drawBorder: false
          },
          ticks: {
            color: textColor,
            maxTicksLimit: 10
          }
        },
        y: {
          grid: {
            color: gridColor,
            drawBorder: false
          },
          ticks: {
            color: textColor,
            callback: function(value) {
              return value.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN', notation: 'compact' });
            }
          },
          beginAtZero: true
        }
      }
    }
  });
}

function calculateKPIs(pecas, vendas) {
  const today = new Date().toISOString().split('T')[0];
  
  return {
    totalPecas: pecas.length,
    valorStock: pecas.reduce((sum, p) => sum + (p.preco_venda * p.stock_atual), 0),
    stockBaixo: pecas.filter(p => p.stock_atual < p.stock_minimo).length,
    vendasHoje: vendas
      .filter(v => v.created_at.startsWith(today))
      .reduce((sum, v) => sum + v.total, 0),
    topPecas: getTopPecas(vendas, pecas)
  };
}

function getTopPecas(vendas, pecas) {
  const counts = {};
  vendas.forEach(v => {
    counts[v.peca_id] = (counts[v.peca_id] || 0) + (v.quantity || v.quantidade || 1); // Fallback quantity
  });
  
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, qty]) => {
      const peca = pecas.find(p => p.id === id);
      return { nome: peca?.nome || t('unknown') || 'Desconhecida', quantidade: qty };
    });
}

function renderKPICard(title, value, colorClass, iconPath) {
  return `
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">${title}</p>
          <p class="text-2xl font-bold ${colorClass}">${value}</p>
        </div>
        <div class="${colorClass} opacity-20">
          <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${iconPath}"></path>
          </svg>
        </div>
      </div>
    </div>
  `;
}

function renderTopPecas(topPecas) {
  if (topPecas.length === 0) {
    return `<p class="text-gray-400 dark:text-gray-500 text-center py-8">${t('no_records')}</p>`;
  }
  
  return topPecas.map((item, index) => `
    <div class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div class="flex items-center gap-3">
        <span class="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold">
          ${index + 1}
        </span>
        <span class="text-sm text-gray-700 dark:text-gray-300">${item.nome}</span>
      </div>
      <span class="text-sm font-medium text-gray-900 dark:text-white">${item.quantidade} un</span>
    </div>
  `).join('');
}
