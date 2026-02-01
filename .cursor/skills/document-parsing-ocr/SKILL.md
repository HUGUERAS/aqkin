---
name: document-parsing-ocr
description: Extrai dados de matrículas de imóveis usando OCR e parsing inteligente. Processa PDFs e imagens para extrair nome do proprietário, número de registro, confrontações e dados cadastrais. Use quando processar documentos de matrícula, automatizar preenchimento de formulários, ou extrair dados de documentos escaneados no projeto Ativo Real.
---

# Agente de Extração de Dados (Parsing de Documentos)

## Visão Geral

O Agente de Extração processa matrículas de imóveis (PDF ou foto) e extrai automaticamente:

- Nome do proprietário
- Número de matrícula/registro
- Confrontações antigas (Norte, Sul, Leste, Oeste)
- Área descrita no documento
- Dados cadastrais (CPF, CNPJ quando disponível)

## Bibliotecas Necessárias

### Python Backend

```python
# requirements.txt
pytesseract==0.3.10
pdf2image==1.16.3
Pillow==10.0.0
pypdf2==3.0.1
python-docx==0.8.11
regex==2023.6.3
```

### Instalação Tesseract OCR

```bash
# Windows (via Chocolatey)
choco install tesseract

# Linux (Ubuntu/Debian)
sudo apt-get install tesseract-ocr tesseract-ocr-por

# macOS
brew install tesseract
```

## Extração de Texto

### Processar PDF

```python
from pdf2image import convert_from_path
import pytesseract
from PIL import Image
from typing import Dict, List
import re

def extrair_texto_pdf(caminho_pdf: str) -> str:
    """
    Converte PDF em imagens e extrai texto usando OCR.
    """
    # Converter PDF em imagens
    imagens = convert_from_path(caminho_pdf, dpi=300)
    
    # Extrair texto de cada página
    textos = []
    for img in imagens:
        texto = pytesseract.image_to_string(img, lang='por')
        textos.append(texto)
    
    return '\n'.join(textos)
```

### Processar Imagem

```python
def extrair_texto_imagem(caminho_imagem: str) -> str:
    """
    Extrai texto de imagem (JPG, PNG) usando OCR.
    """
    img = Image.open(caminho_imagem)
    texto = pytesseract.image_to_string(img, lang='por')
    return texto
```

## Parsing Inteligente de Matrícula

### Estrutura de Dados

```python
from dataclasses import dataclass
from typing import Optional, List

@dataclass
class DadosMatricula:
    numero_matricula: Optional[str] = None
    nome_proprietario: Optional[str] = None
    cpf_cnpj: Optional[str] = None
    area_m2: Optional[float] = None
    confrontacoes: Dict[str, str] = None  # {'NORTE': '...', 'SUL': '...'}
    municipio: Optional[str] = None
    cartorio: Optional[str] = None
    data_registro: Optional[str] = None
```

### Extrair Número de Matrícula

```python
def extrair_numero_matricula(texto: str) -> Optional[str]:
    """
    Extrai número de matrícula usando regex.
    Padrões comuns: "Matrícula nº 12345", "Mat. 12345", etc.
    """
    padroes = [
        r'[Mm]atr[ií]cula\s*(?:n[º°]|N[º°]|n\.?\s*)?\s*(\d+)',
        r'[Mm]at\.?\s*(?:n[º°]|N[º°]|n\.?\s*)?\s*(\d+)',
        r'[Rr]egistro\s*(?:n[º°]|N[º°]|n\.?\s*)?\s*(\d+)',
        r'[Rr]eg\.?\s*(?:n[º°]|N[º°]|n\.?\s*)?\s*(\d+)',
    ]
    
    for padrao in padroes:
        match = re.search(padrao, texto, re.IGNORECASE)
        if match:
            return match.group(1)
    
    return None
```

### Extrair Nome do Proprietário

```python
def extrair_nome_proprietario(texto: str) -> Optional[str]:
    """
    Extrai nome do proprietário.
    Procura por padrões como "Proprietário:", "Titular:", etc.
    """
    padroes = [
        r'(?:[Pp]ropriet[áa]rio|Titular|[Cc]ondom[ií]nio):\s*([A-ZÁÊÔÇ][a-záêôç]+(?:\s+[A-ZÁÊÔÇ][a-záêôç]+)+)',
        r'[Nn]ome:\s*([A-ZÁÊÔÇ][a-záêôç]+(?:\s+[A-ZÁÊÔÇ][a-záêôç]+)+)',
    ]
    
    for padrao in padroes:
        match = re.search(padrao, texto, re.IGNORECASE)
        if match:
            nome = match.group(1).strip()
            # Validar se parece um nome (pelo menos 2 palavras)
            if len(nome.split()) >= 2:
                return nome
    
    return None
```

### Extrair CPF/CNPJ

```python
def extrair_cpf_cnpj(texto: str) -> Optional[str]:
    """
    Extrai CPF ou CNPJ do texto.
    """
    # CPF: 000.000.000-00 ou 00000000000
    cpf_pattern = r'\d{3}\.?\d{3}\.?\d{3}-?\d{2}'
    cpf_match = re.search(cpf_pattern, texto)
    if cpf_match:
        return cpf_match.group(0).replace('.', '').replace('-', '')
    
    # CNPJ: 00.000.000/0000-00 ou 00000000000000
    cnpj_pattern = r'\d{2}\.?\d{3}\.?\d{3}/?\d{4}-?\d{2}'
    cnpj_match = re.search(cnpj_pattern, texto)
    if cnpj_match:
        return cnpj_match.group(0).replace('.', '').replace('/', '').replace('-', '')
    
    return None
```

### Extrair Área

```python
def extrair_area(texto: str) -> Optional[float]:
    """
    Extrai área em metros quadrados ou hectares.
    """
    # Padrões: "500,00 m²", "5,00 ha", "500 m2", etc.
    padroes = [
        r'(\d+(?:[.,]\d+)?)\s*(?:m[²2]|metros?\s*quadrados?)',
        r'(\d+(?:[.,]\d+)?)\s*(?:ha|hectares?)',
    ]
    
    for padrao in padroes:
        match = re.search(padrao, texto, re.IGNORECASE)
        if match:
            area_str = match.group(1).replace(',', '.')
            area = float(area_str)
            
            # Se for hectares, converter para m²
            if 'ha' in match.group(0).lower() or 'hectare' in match.group(0).lower():
                area = area * 10000
            
            return area
    
    return None
```

### Extrair Confrontações

```python
def extrair_confrontacoes(texto: str) -> Dict[str, str]:
    """
    Extrai confrontações (Norte, Sul, Leste, Oeste).
    """
    confrontacoes = {}
    
    # Padrões para cada direção
    direcoes = {
        'NORTE': r'(?:[Nn]orte|N):\s*([^.\n]+(?:\.|$))',
        'SUL': r'(?:[Ss]ul|S):\s*([^.\n]+(?:\.|$))',
        'LESTE': r'(?:[Ll]este|L):\s*([^.\n]+(?:\.|$))',
        'OESTE': r'(?:[Oo]este|O):\s*([^.\n]+(?:\.|$))',
    }
    
    for direcao, padrao in direcoes.items():
        match = re.search(padrao, texto, re.IGNORECASE)
        if match:
            confrontacao = match.group(1).strip()
            # Limpar texto (remover espaços extras, pontuação final)
            confrontacao = re.sub(r'\s+', ' ', confrontacao).rstrip('.,;')
            if len(confrontacao) > 5:  # Validar tamanho mínimo
                confrontacoes[direcao] = confrontacao
    
    return confrontacoes
```

## Função Completa de Parsing

```python
def processar_matricula(caminho_arquivo: str) -> DadosMatricula:
    """
    Processa matrícula completa: extrai texto e parseia dados.
    """
    # Detectar tipo de arquivo
    if caminho_arquivo.lower().endswith('.pdf'):
        texto = extrair_texto_pdf(caminho_arquivo)
    else:
        texto = extrair_texto_imagem(caminho_arquivo)
    
    # Extrair dados
    dados = DadosMatricula()
    dados.numero_matricula = extrair_numero_matricula(texto)
    dados.nome_proprietario = extrair_nome_proprietario(texto)
    dados.cpf_cnpj = extrair_cpf_cnpj(texto)
    dados.area_m2 = extrair_area(texto)
    dados.confrontacoes = extrair_confrontacoes(texto)
    
    return dados
```

## Endpoint API

### FastAPI Route

```python
from fastapi import UploadFile, File
import tempfile
import os

@app.post("/api/documentos/processar-matricula")
async def processar_matricula_endpoint(
    arquivo: UploadFile = File(...)
):
    """
    Recebe PDF ou imagem de matrícula e retorna dados extraídos.
    """
    # Salvar arquivo temporário
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(arquivo.filename)[1]) as tmp:
        content = await arquivo.read()
        tmp.write(content)
        tmp_path = tmp.name
    
    try:
        # Processar
        dados = processar_matricula(tmp_path)
        
        return {
            'sucesso': True,
            'dados': {
                'numero_matricula': dados.numero_matricula,
                'nome_proprietario': dados.nome_proprietario,
                'cpf_cnpj': dados.cpf_cnpj,
                'area_m2': dados.area_m2,
                'confrontacoes': dados.confrontacoes
            }
        }
    except Exception as e:
        return {
            'sucesso': False,
            'erro': str(e)
        }
    finally:
        # Limpar arquivo temporário
        os.unlink(tmp_path)
```

## Frontend Integration

### Componente de Upload

```typescript
import { useState } from 'react';

interface DadosMatricula {
  numero_matricula?: string;
  nome_proprietario?: string;
  cpf_cnpj?: string;
  area_m2?: number;
  confrontacoes?: Record<string, string>;
}

function UploadMatricula({ onDadosExtraidos }: { 
  onDadosExtraidos: (dados: DadosMatricula) => void 
}) {
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setProcessando(true);
    setErro(null);
    
    const formData = new FormData();
    formData.append('arquivo', file);
    
    try {
      const response = await fetch('/api/documentos/processar-matricula', {
        method: 'POST',
        body: formData
      });
      
      const resultado = await response.json();
      
      if (resultado.sucesso) {
        onDadosExtraidos(resultado.dados);
      } else {
        setErro(resultado.erro || 'Erro ao processar documento');
      }
    } catch (err) {
      setErro('Erro ao enviar arquivo');
    } finally {
      setProcessando(false);
    }
  };
  
  return (
    <div>
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleUpload}
        disabled={processando}
      />
      
      {processando && <div>📄 Processando documento...</div>}
      {erro && <div style={{ color: 'red' }}>⚠️ {erro}</div>}
    </div>
  );
}
```

### Preenchimento Automático de Formulário

```typescript
function FormularioLote() {
  const [dados, setDados] = useState({
    nome_cliente: '',
    cpf_cnpj: '',
    matricula: '',
    confrontacoes: { NORTE: '', SUL: '', LESTE: '', OESTE: '' }
  });
  
  const handleDadosExtraidos = (dadosMatricula: DadosMatricula) => {
    // Preencher formulário automaticamente
    setDados({
      nome_cliente: dadosMatricula.nome_proprietario || '',
      cpf_cnpj: dadosMatricula.cpf_cnpj || '',
      matricula: dadosMatricula.numero_matricula || '',
      confrontacoes: dadosMatricula.confrontacoes || dados.confrontacoes
    });
    
    // Mostrar confirmação
    alert('✅ Dados extraídos! Revise e confirme.');
  };
  
  return (
    <div>
      <h2>Cadastro de Lote</h2>
      
      <UploadMatricula onDadosExtraidos={handleDadosExtraidos} />
      
      <form>
        <input
          value={dados.nome_cliente}
          onChange={e => setDados({...dados, nome_cliente: e.target.value})}
          placeholder="Nome do Proprietário"
        />
        {/* ... outros campos */}
      </form>
    </div>
  );
}
```

## Melhorias e Validações

### Validar CPF/CNPJ

```python
def validar_cpf(cpf: str) -> bool:
    """Valida CPF usando algoritmo de dígito verificador."""
    if len(cpf) != 11:
        return False
    
    # Calcular dígitos verificadores
    # ... implementação do algoritmo
    
    return True

def validar_cnpj(cnpj: str) -> bool:
    """Valida CNPJ usando algoritmo de dígito verificador."""
    if len(cnpj) != 14:
        return False
    
    # Calcular dígitos verificadores
    # ... implementação do algoritmo
    
    return True
```

### Melhorar Qualidade OCR

```python
from PIL import ImageEnhance, ImageFilter

def preprocessar_imagem_ocr(img: Image.Image) -> Image.Image:
    """
    Melhora qualidade da imagem antes do OCR.
    """
    # Converter para escala de cinza
    img = img.convert('L')
    
    # Aumentar contraste
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(2.0)
    
    # Aumentar nitidez
    img = img.filter(ImageFilter.SHARPEN)
    
    # Redimensionar se muito pequena (melhora OCR)
    if img.width < 1000:
        img = img.resize((img.width * 2, img.height * 2), Image.LANCZOS)
    
    return img
```

## Mensagens para o Usuário

- **Processando**: "📄 Processando documento... Isso pode levar alguns segundos."
- **Sucesso**: "✅ Dados extraídos com sucesso! Revise as informações abaixo."
- **Erro**: "⚠️ Não foi possível extrair dados. Verifique se o documento está legível."
- **Confirmação**: "Os dados foram preenchidos automaticamente. Confirme se estão corretos."

## Notas Importantes

1. **Qualidade do documento**: OCR funciona melhor com documentos escaneados em alta resolução (300 DPI+)
2. **Idioma**: Tesseract deve ter suporte para português instalado
3. **Validação**: Sempre permitir que usuário revise e corrija dados extraídos
4. **Privacidade**: Processar documentos de forma segura, não armazenar sem necessidade
