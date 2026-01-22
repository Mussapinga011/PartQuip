import { showToast, formatDate } from './helpers.js';

export async function generatePDF(element, filename, title) {
    const { jsPDF } = window.jspdf;
    const html2canvas = window.html2canvas;
  
    if (!jsPDF || !html2canvas) {
        showToast('Bibliotecas PDF não carregadas.', 'error');
        return;
    }
  
    // 1. Criar um Iframe para isolamento TOTAL
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.width = '1000px'; // Largura fixa para o layout do PDF
    document.body.appendChild(iframe);
    
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    // O segredo: Não importamos o CSS do Tailwind aqui, apenas estilos básicos
    doc.write(`
        <html>
            <head>
                <style>
                    body { font-family: sans-serif; background: white; color: black; margin: 0; padding: 20px; }
                    * { 
                        box-shadow: none !important; 
                        ring: none !important; 
                        -webkit-print-color-adjust: exact; 
                    }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    .text-right { text-align: right; }
                    .font-bold { font-weight: bold; }
                </style>
            </head>
            <body></body>
        </html>
    `);
    doc.close();

    try {
        // 2. Clonar o elemento e converter cores OKLCH para RGB via ComputedStyle
        const clone = element.cloneNode(true);
        
        const sanitizeNode = (node) => {
            if (node.nodeType === 1) {
                const style = window.getComputedStyle(node);
                // O navegador converte automaticamente oklch para rgb no getComputedStyle
                node.style.color = style.color;
                node.style.backgroundColor = style.backgroundColor;
                node.style.borderColor = style.borderColor;
                node.style.boxShadow = 'none'; // Remove sombras (causa principal do erro)
                
                // Remove classes e atributos que referenciam o CSS original
                node.removeAttribute('class'); 
                
                for (let child of node.children) sanitizeNode(child);
            }
        };

        sanitizeNode(clone);
        doc.body.appendChild(doc.adoptNode(clone));

        // 3. Gerar o Canvas a partir do iframe (que não tem Tailwind)
        const canvas = await html2canvas(doc.body, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false
        });
  
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        if (title) {
            pdf.setFontSize(16);
            pdf.text(title, 15, 15);
            pdf.setFontSize(10);
            pdf.text(`Gerado em: ${formatDate(new Date(), 'dd/MM/yyyy HH:mm')}`, 15, 22);
            pdf.addImage(imgData, 'PNG', 0, 30, pdfWidth, pdfHeight);
        } else {
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        }

        pdf.save(`${filename || 'relatorio'}.pdf`);
        showToast('PDF gerado com sucesso!', 'success');
  
    } catch (error) {
        console.error('PDF Generation Error:', error);
        showToast('Erro: ' + error.message, 'error');
    } finally {
        document.body.removeChild(iframe);
    }
}