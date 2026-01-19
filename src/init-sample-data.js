// Sample Data Initialization Script
// Run this in the browser console to populate the database with sample data

import { dbOperations } from './lib/db.js';
import { generateId } from './utils/helpers.js';

export async function initSampleData() {
  console.log('🚀 Inicializando dados de exemplo...');

  try {
    // Sample Categories
    const categorias = [
      { id: generateId(), nome: 'Filtros', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: generateId(), nome: 'Peças de Motor', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: generateId(), nome: 'Suspensão', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: generateId(), nome: 'Freios', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    ];

    for (const cat of categorias) {
      await dbOperations.add('categorias', cat);
    }
    console.log('✅ Categorias criadas');

    // Sample Parts
    const pecas = [
      {
        id: generateId(),
        codigo: 'AR2018',
        nome: 'Filtro de Ar',
        categoria_id: categorias[0].id,
        tipo_id: null,
        preco_custo: 50.00,
        preco_venda: 80.00,
        stock_atual: 15,
        stock_minimo: 5,
        localizacao: 'Prateleira A1',
        fornecedor_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: generateId(),
        codigo: 'AR2917',
        nome: 'Filtro de Óleo',
        categoria_id: categorias[0].id,
        tipo_id: null,
        preco_custo: 35.00,
        preco_venda: 60.00,
        stock_atual: 20,
        stock_minimo: 10,
        localizacao: 'Prateleira A2',
        fornecedor_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: generateId(),
        codigo: 'BR3045',
        nome: 'Pastilha de Freio Dianteira',
        categoria_id: categorias[3].id,
        tipo_id: null,
        preco_custo: 120.00,
        preco_venda: 200.00,
        stock_atual: 3,
        stock_minimo: 5,
        localizacao: 'Prateleira B1',
        fornecedor_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: generateId(),
        codigo: 'SU1234',
        nome: 'Amortecedor Traseiro',
        categoria_id: categorias[2].id,
        tipo_id: null,
        preco_custo: 250.00,
        preco_venda: 400.00,
        stock_atual: 8,
        stock_minimo: 3,
        localizacao: 'Prateleira C1',
        fornecedor_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    for (const peca of pecas) {
      await dbOperations.add('pecas', peca);
    }
    console.log('✅ Peças criadas');

    // Sample Vehicle Compatibility
    const compatibilidades = [
      {
        id: generateId(),
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2012,
        codigos_compativeis: ['AR2018', 'AR2917'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: generateId(),
        marca: 'Honda',
        modelo: 'Civic',
        ano: 2014,
        codigos_compativeis: ['AR2018', 'BR3045'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    for (const comp of compatibilidades) {
      await dbOperations.add('compatibilidade_veiculos', comp);
    }
    console.log('✅ Compatibilidades criadas');

    // Sample Suppliers
    const fornecedores = [
      {
        id: generateId(),
        nome: 'Auto Peças Ltda',
        telefone: '(11) 98765-4321',
        email: 'contato@autopecas.com',
        endereco: 'Rua das Peças, 123 - São Paulo, SP',
        observacoes: 'Fornecedor principal',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    for (const forn of fornecedores) {
      await dbOperations.add('fornecedores', forn);
    }
    console.log('✅ Fornecedores criados');

    console.log('🎉 Dados de exemplo inicializados com sucesso!');
    console.log('📊 Resumo:');
    console.log(`   - ${categorias.length} categorias`);
    console.log(`   - ${pecas.length} peças`);
    console.log(`   - ${compatibilidades.length} compatibilidades`);
    console.log(`   - ${fornecedores.length} fornecedores`);

  } catch (error) {
    console.error('❌ Erro ao inicializar dados:', error);
  }
}

// Uncomment to run automatically
// initSampleData();
