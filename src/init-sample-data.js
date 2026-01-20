// Sample Data Initialization Script
// Run this in the browser console to populate the database with sample data

import { dbOperations } from './lib/db.js';
import { generateId } from './utils/helpers.js';

export async function initSampleData() {
  console.log('🚀 Inicializando dados de exemplo...');

  try {
    // Sample Categories
    const categoriasBase = [
      { id: generateId(), nome: 'Ball Joints' },
      { id: generateId(), nome: 'Tirod Ends' },
      { id: generateId(), nome: 'Fuel Pump' },
      { id: generateId(), nome: 'Shocks' },
      { id: generateId(), nome: 'Stabilizer' },
      { id: generateId(), nome: 'Wheel Bearing' },
      { id: generateId(), nome: 'Thrust Bearing' },
      { id: generateId(), nome: 'Gearbox Bearing' },
      { id: generateId(), nome: 'CV Joint' },
      { id: generateId(), nome: 'Master Cylinder' },
      { id: generateId(), nome: 'Idler Arms' },
      { id: generateId(), nome: 'Drop Arms' }
    ];

    const categorias = categoriasBase.map(cat => ({
      ...cat,
      descricao: cat.nome,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    for (const cat of categorias) {
      await dbOperations.add('categorias', cat);
    }
    console.log('✅ Categorias criadas');

    // Sample Types (Mapeamento de Códigos)
    const mapping = [
      { codigo: 'BJ', nome: 'Ball Joints' },
      { codigo: 'TR', nome: 'Tirod Ends' },
      { codigo: 'FP', nome: 'Fuel Pump' },
      { codigo: 'SX', nome: 'Shocks' },
      { codigo: 'PQ', nome: 'Wheel Bearing' },
      { codigo: 'RB', nome: 'Thrust Bearing' },
      { codigo: 'GB', nome: 'Gearbox Bearing' },
      { codigo: 'PJ', 'nome': 'CV Joint' },
      { codigo: 'AR', 'nome': 'Stabilizer' },
      { codigo: 'CM', 'nome': 'Master Cylinder' }
    ];

    const tipos = mapping.map(item => {
      const cat = categorias.find(c => c.nome === item.nome);
      return {
        id: generateId(),
        codigo: item.codigo,
        descricao: item.nome,
        categoria_id: cat ? cat.id : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    });

    for (const tipo of tipos) {
      await dbOperations.add('tipos', tipo);
    }
    console.log('✅ Tipos criados');

    // Sample Parts
    const pecas = [
      {
        id: generateId(),
        codigo: 'BJ-001',
        nome: 'Pivô de Suspensão',
        categoria_id: categorias.find(c => c.nome === 'Ball Joints')?.id,
        tipo_id: tipos.find(t => t.codigo === 'BJ')?.id,
        preco_custo: 150.00,
        preco_venda: 250.00,
        stock_atual: 10,
        stock_minimo: 2,
        localizacao: 'A1',
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
        modelo: 'Hilux',
        ano: 2015,
        codigos_compativeis: ['BJ-001'],
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
        nome: 'Distribuidora Global',
        telefone: '840000000',
        email: 'vendas@global.com',
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
    console.log(`   - ${tipos.length} tipos`);
    console.log(`   - ${pecas.length} peças`);
    console.log(`   - ${compatibilidades.length} compatibilidades`);
    console.log(`   - ${fornecedores.length} fornecedores`);

  } catch (error) {
    console.error('❌ Erro ao inicializar dados:', error);
  }
}

// Uncomment to run automatically
// initSampleData();
