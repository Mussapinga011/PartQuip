import { showToast, formatDate } from './helpers.js';

export async function generatePDF(element, filename, title) {
    // Legacy support redirect to print
    printContent(element, title);
}

export function printContent(element, title) {
  let printArea = document.getElementById('print-area');
  
  // Create print area if not exists
  if (!printArea) {
    printArea = document.createElement('div');
    printArea.id = 'print-area';
    document.body.appendChild(printArea);
  }
  
  printArea.innerHTML = '';
  
  // Add Header
  const header = document.createElement('div');
  header.className = 'mb-8 text-center';
  header.innerHTML = `
    <h1 class="text-2xl font-bold text-gray-900">${title || 'Relatório'}</h1>
    <p class="text-sm text-gray-500">Gerado em ${new Date().toLocaleString()}</p>
    <div class="h-px bg-gray-200 w-full mt-4"></div>
  `;
  printArea.appendChild(header);

  // Clone content to avoid messing with live DOM
  const clone = element.cloneNode(true);
  
  // Handle Canvas/Charts (Convert to Image)
  // Essential for Dashboard
  const canvases = element.querySelectorAll('canvas');
  const clonedCanvases = clone.querySelectorAll('canvas');
  
  canvases.forEach((canvas, i) => {
      if (clonedCanvases[i]) {
          const img = document.createElement('img');
          img.src = canvas.toDataURL('image/png');
          img.style.width = '100%';
          img.style.maxHeight = '300px';
          img.style.objectFit = 'contain';
          clonedCanvases[i].parentNode.replaceChild(img, clonedCanvases[i]);
      }
  });

  // Handle Tables (Remove scrollbars, ensure full width)
  const tables = clone.querySelectorAll('table');
  tables.forEach(table => {
      const wrapper = table.closest('.overflow-x-auto');
      if (wrapper) {
          wrapper.classList.remove('overflow-x-auto');
          wrapper.style.overflow = 'visible';
      }
      table.style.width = '100%';
  });
  
  // Remove interactive elements from print
  clone.querySelectorAll('button, input, select').forEach(el => el.remove());

  printArea.appendChild(clone);
  
  // Trigger Print
  window.print();
  
  // Cleanup (Optional, but good for memory. 
  // keeping it visible for debug if print dialog is cancelled is tricky, 
  // but CSS hides it from screen anyway)
}
