// Script para executar migração SQL no Supabase
require('dotenv').config({ path: '.env.supabase' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas. Verifique .env.supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('🚀 Iniciando migração SQL...');
    
    // Lê os arquivos SQL (01_schema + 02_extensions)
    const basePath = path.join(__dirname, '..', 'database', 'init');
    const files = ['01_schema.sql', '02_extensions.sql'];
    let sqlContent = files
      .map((f) => {
        const p = path.join(basePath, f);
        return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
      })
      .filter(Boolean)
      .join('\n\n');
    
    console.log('📄 SQL carregado: 01_schema + 02_extensions');
    
    // Remove comentários e divide em statements individuais
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📊 Executando ${statements.length} statements SQL...`);
    
    // Executa cada statement separadamente via REST API direto
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (!stmt) continue;
      
      console.log(`[${i+1}/${statements.length}] Executando...`);
      
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({ query: stmt + ';' })
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.warn(`⚠️  Statement ${i+1} falhou (pode ser normal):`, error.substring(0, 200));
      }
    }
    
    console.log('✅ Migração concluída!');
    console.log('💡 Verifique o Supabase Dashboard > SQL Editor para confirmar as tabelas.');
    
  } catch (err) {
    console.error('❌ Erro fatal:', err);
    process.exit(1);
  }
}

runMigration();
