---
name: technical-documents-generator
description: Gera peças técnicas oficiais (ART, Memorial Descritivo, Requerimentos) preenchendo templates com dados do banco. Segue padrões de prefeitura e INCRA. Use quando precisar gerar documentos oficiais, criar templates de documentos, ou automatizar geração de peças técnicas no projeto Ativo Real.
---

# Orquestrador de Peças Técnicas (Template Engine)

## Visão Geral

O Orquestrador gera documentos oficiais automaticamente:

- **ART** (Anotação de Responsabilidade Técnica)
- **Memorial Descritivo**
- **Requerimento de Desmembramento/Loteamento**
- **Croqui de Localização**

Todos seguem padrões oficiais e são preenchidos com dados do banco de dados.

## Bibliotecas Necessárias

### Python Backend

```python
# requirements.txt
jinja2==3.1.2
reportlab==4.0.4
python-docx==0.8.11
weasyprint==59.0  # Para HTML → PDF
```

## Estrutura de Templates

```
templates/
├── memorial-descritivo.html
├── art.html
├── requerimento.html
└── croqui.html
```

## Template: Memorial Descritivo

### HTML Template (memorial-descritivo.html)

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 2cm; }
        h1 { text-align: center; font-size: 16pt; }
        h2 { font-size: 14pt; margin-top: 1em; }
        p { text-align: justify; line-height: 1.6; }
        table { width: 100%; border-collapse: collapse; margin: 1em 0; }
        td { padding: 0.5em; border: 1px solid #000; }
        .assinatura { margin-top: 3cm; text-align: center; }
    </style>
</head>
<body>
    <h1>MEMORIAL DESCRITIVO</h1>
    
    <p><strong>Imóvel:</strong> {{ lote.numero_matricula }}</p>
    <p><strong>Proprietário:</strong> {{ lote.nome_cliente }}</p>
    <p><strong>CPF/CNPJ:</strong> {{ lote.cpf_cnpj_cliente }}</p>
    <p><strong>Área:</strong> {{ "%.2f"|format(lote.area_ha) }} ha ({{ "%.2f"|format(lote.area_ha * 10000) }} m²)</p>
    <p><strong>Perímetro:</strong> {{ "%.2f"|format(lote.perimetro_m) }} m</p>
    
    <h2>CONFRONTAÇÕES:</h2>
    <table>
        <tr>
            <td><strong>NORTE:</strong></td>
            <td>{{ confrontacoes.NORTE or 'Não informado' }}</td>
        </tr>
        <tr>
            <td><strong>SUL:</strong></td>
            <td>{{ confrontacoes.SUL or 'Não informado' }}</td>
        </tr>
        <tr>
            <td><strong>LESTE:</strong></td>
            <td>{{ confrontacoes.LESTE or 'Não informado' }}</td>
        </tr>
        <tr>
            <td><strong>OESTE:</strong></td>
            <td>{{ confrontacoes.OESTE or 'Não informado' }}</td>
        </tr>
    </table>
    
    <h2>LOCALIZAÇÃO:</h2>
    <p>{{ endereco.endereco_completo }}</p>
    <p>{{ endereco.municipio }} - {{ endereco.estado }}</p>
    
    <h2>COORDENADAS:</h2>
    <p>SRID 4674 (SIRGAS 2000)</p>
    <p>Centroide: {{ "%.6f"|format(coordenadas.lat) }}, {{ "%.6f"|format(coordenadas.lon) }}</p>
    
    <div class="assinatura">
        <p>_________________________________</p>
        <p>{{ topografo.nome }}</p>
        <p>CREA {{ topografo.crea }}</p>
    </div>
    
    <p style="margin-top: 2em; text-align: center;">
        {{ data_geracao }}
    </p>
</body>
</html>
```

## Gerador de Documentos

### Função Principal

```python
from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML
from typing import Dict
import os
from datetime import datetime

def gerar_memorial_descritivo(
    lote_id: int,
    supabase: Client,
    topografo: Dict
) -> bytes:
    """
    Gera Memorial Descritivo em PDF.
    Retorna bytes do PDF.
    """
    # Buscar dados do lote
    lote = buscar_dados_lote(supabase, lote_id)
    
    # Buscar confrontações
    confrontacoes = buscar_confrontacoes(supabase, lote_id)
    
    # Buscar endereço (geocodificação reversa)
    endereco = enriquecer_lote_com_endereco(supabase, lote_id)
    
    # Buscar coordenadas
    coordenadas = buscar_coordenadas_centroide(supabase, lote_id)
    
    # Preparar contexto
    contexto = {
        'lote': lote,
        'confrontacoes': confrontacoes,
        'endereco': endereco.get('endereco', {}),
        'coordenadas': coordenadas,
        'topografo': topografo,
        'data_geracao': datetime.now().strftime('%d/%m/%Y')
    }
    
    # Renderizar template
    env = Environment(loader=FileSystemLoader('templates'))
    template = env.get_template('memorial-descritivo.html')
    html = template.render(**contexto)
    
    # Converter HTML para PDF
    pdf_bytes = HTML(string=html).write_pdf()
    
    return pdf_bytes
```

### Funções Auxiliares

```python
def buscar_dados_lote(supabase: Client, lote_id: int) -> Dict:
    """Busca dados completos do lote."""
    response = supabase.table('lotes').select('*').eq('id', lote_id).execute()
    return response.data[0] if response.data else {}

def buscar_confrontacoes(supabase: Client, lote_id: int) -> Dict[str, str]:
    """Busca confrontações do lote."""
    response = supabase.table('vizinhos').select('*').eq('lote_id', lote_id).execute()
    
    confrontacoes = {}
    for vizinho in response.data:
        lado = vizinho['lado']
        confrontacoes[lado] = vizinho['nome_vizinho']
    
    return confrontacoes

def buscar_coordenadas_centroide(supabase: Client, lote_id: int) -> Dict:
    """Busca coordenadas do centroide."""
    query = f"""
    SELECT 
      ST_X(ST_Centroid(geom)) AS lon,
      ST_Y(ST_Centroid(geom)) AS lat
    FROM lotes
    WHERE id = {lote_id}
    """
    result = supabase.rpc('exec_sql', {'query': query}).execute()
    return result.data[0] if result.data else {'lat': 0, 'lon': 0}
```

## Template: ART (Anotação de Responsabilidade Técnica)

### HTML Template (art.html)

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 2cm; }
        h1 { text-align: center; font-size: 14pt; }
        table { width: 100%; border-collapse: collapse; margin: 1em 0; }
        td { padding: 0.5em; border: 1px solid #000; }
    </style>
</head>
<body>
    <h1>ANOTAÇÃO DE RESPONSABILIDADE TÉCNICA - ART</h1>
    
    <table>
        <tr>
            <td><strong>Número da ART:</strong></td>
            <td>{{ art.numero }}</td>
        </tr>
        <tr>
            <td><strong>Data:</strong></td>
            <td>{{ art.data }}</td>
        </tr>
        <tr>
            <td><strong>Tipo de Serviço:</strong></td>
            <td>{{ art.tipo_servico }}</td>
        </tr>
    </table>
    
    <h2>DADOS DO PROFISSIONAL:</h2>
    <p><strong>Nome:</strong> {{ topografo.nome }}</p>
    <p><strong>CREA:</strong> {{ topografo.crea }}</p>
    <p><strong>CPF:</strong> {{ topografo.cpf }}</p>
    
    <h2>DADOS DO SERVIÇO:</h2>
    <p><strong>Proprietário:</strong> {{ lote.nome_cliente }}</p>
    <p><strong>Imóvel:</strong> {{ lote.numero_matricula }}</p>
    <p><strong>Localização:</strong> {{ endereco.endereco_completo }}</p>
    <p><strong>Área:</strong> {{ "%.2f"|format(lote.area_ha) }} ha</p>
    
    <div class="assinatura">
        <p>_________________________________</p>
        <p>{{ topografo.nome }}</p>
        <p>CREA {{ topografo.crea }}</p>
    </div>
</body>
</html>
```

## Template: Requerimento

### HTML Template (requerimento.html)

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 2cm; }
        h1 { text-align: center; }
        p { text-align: justify; line-height: 1.6; }
    </style>
</head>
<body>
    <h1>REQUERIMENTO DE {{ requerimento.tipo }}</h1>
    
    <p>
        {{ requerimento.orgao }},<br><br>
        
        {{ lote.nome_cliente }}, CPF/CNPJ {{ lote.cpf_cnpj_cliente }},
        vem por meio desta requerer {{ requerimento.tipo|lower }} do imóvel
        situado em {{ endereco.endereco_completo }}, {{ endereco.municipio }} - {{ endereco.estado }},
        conforme matrícula {{ lote.numero_matricula }}.
    </p>
    
    <h2>DADOS DO IMÓVEL:</h2>
    <p><strong>Área:</strong> {{ "%.2f"|format(lote.area_ha) }} ha</p>
    <p><strong>Perímetro:</strong> {{ "%.2f"|format(lote.perimetro_m) }} m</p>
    
    <p>
        Para tanto, anexa-se os seguintes documentos:<br>
        - Memorial Descritivo<br>
        - Croqui de Localização<br>
        - ART<br>
        - Matrícula atualizada
    </p>
    
    <div class="assinatura">
        <p>{{ endereco.municipio }}, {{ data_geracao }}</p>
        <p>_________________________________</p>
        <p>{{ lote.nome_cliente }}</p>
    </div>
</body>
</html>
```

## Endpoint API

### FastAPI Routes

```python
@app.get("/api/lotes/{lote_id}/gerar-memorial")
def gerar_memorial_endpoint(
    lote_id: int,
    topografo_nome: str,
    topografo_crea: str
):
    """Gera Memorial Descritivo em PDF."""
    topografo = {
        'nome': topografo_nome,
        'crea': topografo_crea
    }
    
    pdf_bytes = gerar_memorial_descritivo(lote_id, supabase, topografo)
    
    return Response(
        content=pdf_bytes,
        media_type='application/pdf',
        headers={'Content-Disposition': f'attachment; filename=memorial_{lote_id}.pdf'}
    )

@app.get("/api/lotes/{lote_id}/gerar-art")
def gerar_art_endpoint(
    lote_id: int,
    art_numero: str,
    topografo: dict
):
    """Gera ART em PDF."""
    # Implementação similar...
    pass

@app.get("/api/lotes/{lote_id}/gerar-requerimento")
def gerar_requerimento_endpoint(
    lote_id: int,
    tipo: str,  # DESMEMBRAMENTO, LOTEAMENTO, etc.
    orgao: str   # Prefeitura, INCRA, etc.
):
    """Gera Requerimento em PDF."""
    # Implementação similar...
    pass
```

## Frontend Integration

### Componente de Geração

```typescript
function GerarPecas({ loteId }: { loteId: number }) {
  const [gerando, setGerando] = useState(false);
  
  const gerarDocumento = async (tipo: 'memorial' | 'art' | 'requerimento') => {
    setGerando(true);
    
    try {
      const response = await fetch(`/api/lotes/${loteId}/gerar-${tipo}`, {
        method: 'GET'
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${tipo}_${loteId}.pdf`;
        a.click();
      }
    } catch (error) {
      alert('Erro ao gerar documento');
    } finally {
      setGerando(false);
    }
  };
  
  return (
    <div>
      <h2>📄 Gerar Peças Técnicas</h2>
      
      <button 
        onClick={() => gerarDocumento('memorial')}
        disabled={gerando}
      >
        📋 Gerar Memorial Descritivo
      </button>
      
      <button 
        onClick={() => gerarDocumento('art')}
        disabled={gerando}
      >
        📝 Gerar ART
      </button>
      
      <button 
        onClick={() => gerarDocumento('requerimento')}
        disabled={gerando}
      >
        📨 Gerar Requerimento
      </button>
      
      {gerando && <div>Gerando documento...</div>}
    </div>
  );
}
```

## Personalização por Município

### Configuração de Templates

```python
# config/templates_config.json
{
  "municipios": {
    "Brasília": {
      "memorial": "templates/memorial-df.html",
      "art": "templates/art-df.html"
    },
    "São Paulo": {
      "memorial": "templates/memorial-sp.html",
      "art": "templates/art-sp.html"
    }
  }
}
```

### Seleção Automática de Template

```python
def selecionar_template(municipio: str, tipo_documento: str) -> str:
    """Seleciona template baseado no município."""
    config = carregar_config()
    
    if municipio in config['municipios']:
        return config['municipios'][municipio].get(tipo_documento)
    
    # Template padrão
    return f"templates/{tipo_documento}.html"
```

## Mensagens para o Usuário

- **Gerando**: "📄 Gerando documento... Isso pode levar alguns segundos."
- **Sucesso**: "✅ Documento gerado com sucesso!"
- **Erro**: "⚠️ Erro ao gerar documento. Verifique se todos os dados estão preenchidos."

## Notas Importantes

1. **Templates customizáveis**: Cada município pode ter seu próprio template
2. **Validação**: Verificar se todos os dados necessários estão disponíveis antes de gerar
3. **Assinatura digital**: Considerar integração com assinatura digital para documentos oficiais
4. **Versionamento**: Manter histórico de documentos gerados
