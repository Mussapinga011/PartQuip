
const translations = {
  pt: {
    dashboard: "Dashboard",
    pecas: "Peças",
    vendas: "Vendas",
    abastecimento: "Abastecimento",
    veiculos: "Veículos",
    fornecedores: "Fornecedores",
    categorias: "Categorias",
    impressao: "Impressão",
    relatorios: "Relatórios",
    sair: "Sair",
    offline: "Offline",
    online: "Online",
    search: "Buscar...",
    add: "Adicionar",
    save: "Salvar",
    cancel: "Cancelar",
    delete: "Excluir",
    edit: "Editar",
    total_parts: "Total de Peças",
    stock_value: "Valor em Stock",
    low_stock: "Stock Baixo",
    sales_today: "Vendas Hoje",
    recent_sales: "Vendas Recentes",
    top_selling: "Mais Vendidas",
    loading: "Carregando...",
    login_title: "PartQuit",
    login_subtitle: "Sistema de Gestão de Peças Automotivas",
    email: "Email",
    password: "Senha",
    enter: "Entrar",
    login_error: "Email ou senha incorretos",
    new_sale: "Nova Venda",
    history: "Histórico",
    client_vehicle: "Cliente / Veículo",
    payment_method: "Forma de Pagamento",
    sale_date: "Data da Venda",
    observations: "Observações",
    total: "Total",
    finish_sale: "Finalizar Venda",
    clear: "Limpar",
    code: "Código",
    name: "Nome",
    price: "Preço",
    quantity: "Qtd",
    subtotal: "Subtotal",
    action: "Ação",
    confirmed: "Confirmada",
    cancelled: "Cancelada"
  },
  en: {
    dashboard: "Dashboard",
    pecas: "Parts",
    vendas: "Sales",
    abastecimento: "Supply",
    veiculos: "Vehicles",
    fornecedores: "Suppliers",
    categorias: "Categories",
    impressao: "Printing",
    relatorios: "Reports",
    sair: "Logout",
    offline: "Offline",
    online: "Online",
    search: "Search...",
    add: "Add",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    total_parts: "Total Parts",
    stock_value: "Stock Value",
    low_stock: "Low Stock",
    sales_today: "Sales Today",
    recent_sales: "Recent Sales",
    top_selling: "Top Selling",
    loading: "Loading...",
    login_title: "PartQuit",
    login_subtitle: "Automotive Parts Management System",
    email: "Email",
    password: "Password",
    enter: "Login",
    login_error: "Incorrect email or password",
    new_sale: "New Sale",
    history: "History",
    client_vehicle: "Client / Vehicle",
    payment_method: "Payment Method",
    sale_date: "Sale Date",
    observations: "Observations",
    total: "Total",
    finish_sale: "Finish Sale",
    clear: "Clear",
    code: "Code",
    name: "Name",
    price: "Price",
    quantity: "Qty",
    subtotal: "Subtotal",
    action: "Action",
    confirmed: "Confirmed",
    cancelled: "Cancelled"
  }
};

let currentLang = localStorage.getItem('partquit_lang') || 'pt';

export function getTranslation(key) {
  return translations[currentLang][key] || key;
}

export function setLanguage(lang) {
  if (translations[lang]) {
    currentLang = lang;
    localStorage.setItem('partquit_lang', lang);
    window.location.reload(); // Reload to apply changes across all components
  }
}

export function getCurrentLang() {
  return currentLang;
}

// Shortcut for getting translation
export const t = getTranslation;
