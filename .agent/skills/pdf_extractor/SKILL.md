---
name: pdf-extractor
description: Extrai texto, imagens e tabelas de arquivos PDF para análise em ambientes Python como Google Colab, Jupyter notebooks, ou scripts. Use quando o usuário quiser analisar o conteúdo de um PDF, extrair dados para processamento, ou preparar PDFs para análise com IA. Complementa a skill 'pdf' focando em extração de conteúdo ao invés de manipulação de documentos.
---

# PDF Content Extractor - Skill para Análise de PDFs

## Visão Geral

Esta skill especializa-se em **extrair conteúdo** de arquivos PDF (texto, imagens, tabelas) para posterior análise, processamento ou uso em ambientes Python como Google Colab, Jupyter notebooks, ou scripts standalone.

**Diferença da skill 'pdf':**
- A skill `pdf` foca em **manipulação** (merge, split, rotate, forms, watermarks)
- Esta skill foca em **extração de conteúdo** para análise e processamento

## Quando Usar Esta Skill

Use `pdf-extractor` quando o usuário quiser:

✅ Extrair texto de um PDF para análise
✅ Extrair imagens de um PDF
✅ Extrair tabelas de um PDF para processar em Python/Excel
✅ Preparar conteúdo de PDF para análise com IA
✅ Analisar o conteúdo de um PDF programaticamente
✅ Processar múltiplos PDFs em batch
✅ Usar PDFs em notebooks Jupyter ou Google Colab

**NÃO use** esta skill para:
❌ Criar novos PDFs (use skill `pdf`)
❌ Merge, split, rotate PDFs (use skill `pdf`)
❌ Preencher formulários PDF (use skill `pdf`)
❌ Adicionar marcas d'água (use skill `pdf`)

## Script Reutilizável

O core desta skill é o script `pdf_extractor.py`, um módulo Python autônomo que pode ser:

1. **Usado via linha de comando** para extração rápida
2. **Importado como módulo** em notebooks/scripts Python
3. **Copiado para Google Colab** para uso em análises

### Localização do Script

O script está sempre disponível em `/home/claude/pdf_extractor.py` e deve ser copiado para o diretório de trabalho ou outputs quando necessário.

## Uso Básico

### 1. Via Linha de Comando

```bash
# Extrai tudo (texto + imagens) para um diretório
python pdf_extractor.py documento.pdf --output-dir saida

# Extrai apenas texto
python pdf_extractor.py documento.pdf --extract-text --no-extract-images

# Extrai apenas imagens
python pdf_extractor.py documento.pdf --extract-images --no-extract-text -o imagens

# Controla tamanho mínimo de imagens (evita ícones pequenos)
python pdf_extractor.py documento.pdf --min-width 200 --min-height 200
```

### 2. Como Módulo Python

```python
from pdf_extractor import PDFExtractor

# Context manager (recomendado)
with PDFExtractor("documento.pdf") as extractor:
    # Extrai metadados
    metadata = extractor.get_metadata()
    print(f"Páginas: {metadata['pages']}")
    
    # Extrai todo o texto
    text = extractor.extract_text_simple()
    print(text[:500])  # Primeiros 500 caracteres
    
    # Extrai texto por página
    text_by_page = extractor.extract_text()
    print(f"Página 1: {text_by_page[1][:200]}")
    
    # Extrai tabelas
    tables = extractor.extract_tables()
    for page, page_tables in tables.items():
        print(f"Página {page} tem {len(page_tables)} tabela(s)")
    
    # Extrai imagens
    images = extractor.extract_images(output_dir="imagens")
    print(f"Extraídas {len(images)} imagens")
    
    # Extrai tudo de uma vez
    result = extractor.extract_all(
        output_dir="resultado",
        extract_images=True,
        extract_text=True,
        extract_tables=True
    )
```

### 3. Para Google Colab

```python
# 1. Instalar dependências
!pip install pdfplumber PyMuPDF Pillow -q

# 2. Fazer upload do script pdf_extractor.py
from google.colab import files
uploaded = files.upload()  # Upload pdf_extractor.py

# 3. Fazer upload do PDF
uploaded_pdf = files.upload()  # Upload seu arquivo.pdf

# 4. Usar o extrator
from pdf_extractor import PDFExtractor

with PDFExtractor("seu_arquivo.pdf") as extractor:
    # Extrai texto
    text = extractor.extract_text_simple()
    
    # Extrai imagens
    images = extractor.extract_images(output_dir="imagens_extraidas")
    
    # Mostra primeira imagem
    from PIL import Image
    if images:
        img = Image.open(images[0]['path'])
        display(img)
```

## Dependências

O script requer as seguintes bibliotecas Python:

```bash
pip install pdfplumber PyMuPDF Pillow --break-system-packages
```

- **pdfplumber**: Extração de texto e tabelas com preservação de layout
- **PyMuPDF (fitz)**: Extração de imagens e metadados
- **Pillow**: Manipulação de imagens

## Workflow de Extração

Quando o usuário pede para analisar um PDF, siga este workflow:

### Etapa 1: Verificar Localização do PDF

```python
# PDFs do usuário estão em /mnt/user-data/uploads
import os
pdf_path = "/mnt/user-data/uploads/nome_do_arquivo.pdf"
```

### Etapa 2: Copiar Script para Diretório de Trabalho

```bash
cp /home/claude/pdf_extractor.py .
```

### Etapa 3: Instalar Dependências (se necessário)

```bash
pip install pdfplumber PyMuPDF Pillow --break-system-packages
```

### Etapa 4: Executar Extração

```bash
# Via linha de comando
python pdf_extractor.py /mnt/user-data/uploads/documento.pdf --output-dir extracted_content

# Ou via Python
python -c "
from pdf_extractor import PDFExtractor
with PDFExtractor('/mnt/user-data/uploads/documento.pdf') as ext:
    result = ext.extract_all(output_dir='extracted_content')
    print(f'Extraído: {len(result[\"text\"])} páginas')
"
```

### Etapa 5: Analisar Conteúdo Extraído

```python
# Ler o texto extraído
with open('extracted_content/extracted_text.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# Processar conforme necessário
# - Análise de sentimento
# - Extração de entidades
# - Resumo automático
# - Busca de padrões
# etc.
```

### Etapa 6: Mover Resultados para Outputs (se necessário)

```bash
# Mover para que o usuário possa acessar
cp -r extracted_content /mnt/user-data/outputs/
```

## Estrutura de Saída

Quando `extract_all()` é executado com um diretório de saída, cria:

```
output_dir/
├── extracted_text.txt           # Todo o texto extraído, organizado por página
├── extraction_info.json         # Metadados e informações da extração
├── page_1_img_1.png            # Imagens extraídas
├── page_1_img_2.jpg
├── page_2_img_1.png
└── ...
```

**extraction_info.json** contém:
```json
{
  "metadata": {
    "filename": "documento.pdf",
    "pages": 10,
    "title": "Título do Documento",
    "author": "Autor"
  },
  "text_pages": [1, 2, 3, ...],
  "tables_pages": [3, 5],
  "images_count": 5,
  "images": [
    {
      "page": 1,
      "index": 1,
      "width": 800,
      "height": 600,
      "format": "png",
      "filename": "page_1_img_1.png",
      "path": "output_dir/page_1_img_1.png"
    }
  ]
}
```

## Casos de Uso Comuns

### Caso 1: Análise de Texto com IA

```python
from pdf_extractor import PDFExtractor

# Extrair texto
with PDFExtractor("artigo.pdf") as ext:
    text = ext.extract_text_simple()

# Analisar com IA (usar API ou modelo local)
print(f"Texto extraído ({len(text)} caracteres)")
# Processar com modelo de linguagem...
```

### Caso 2: Extrair Tabelas para CSV

```python
import csv
from pdf_extractor import PDFExtractor

with PDFExtractor("relatorio.pdf") as ext:
    tables = ext.extract_tables()
    
    for page_num, page_tables in tables.items():
        for table_idx, table in enumerate(page_tables):
            filename = f"table_page{page_num}_n{table_idx}.csv"
            with open(filename, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerows(table)
            print(f"Salva: {filename}")
```

### Caso 3: Processar Imagens com OCR ou Visão Computacional

```python
from pdf_extractor import PDFExtractor
from PIL import Image

with PDFExtractor("documento.pdf") as ext:
    images = ext.extract_images(output_dir="imagens")
    
    for img_info in images:
        img = Image.open(img_info['path'])
        
        # Processar com OCR
        # import pytesseract
        # text = pytesseract.image_to_string(img)
        
        # Ou análise com IA de visão
        # analyze_image_with_ai(img)
        
        print(f"Processada: {img_info['filename']} ({img.size})")
```

### Caso 4: Batch Processing de Múltiplos PDFs

```python
from pdf_extractor import PDFExtractor
from pathlib import Path

pdf_files = list(Path("/mnt/user-data/uploads").glob("*.pdf"))

for pdf_file in pdf_files:
    print(f"Processando: {pdf_file.name}")
    
    with PDFExtractor(pdf_file) as ext:
        result = ext.extract_all(
            output_dir=f"extracted/{pdf_file.stem}",
            extract_images=True,
            extract_text=True
        )
        
        print(f"  ✓ {result['metadata']['pages']} páginas")
        print(f"  ✓ {len(result.get('images', []))} imagens")
```

## Tratamento de Erros

O script tem tratamento robusto de erros:

```python
from pdf_extractor import PDFExtractor

try:
    with PDFExtractor("documento.pdf") as ext:
        result = ext.extract_all(output_dir="output")
except FileNotFoundError:
    print("PDF não encontrado")
except Exception as e:
    print(f"Erro ao processar: {e}")
```

## Otimizações e Dicas

### Filtrar Imagens Pequenas

Muitos PDFs contêm pequenos ícones e logos. Use os parâmetros `min_width` e `min_height`:

```python
# Apenas imagens maiores que 200x200 pixels
images = extractor.extract_images(
    output_dir="imagens",
    min_width=200,
    min_height=200
)
```

### Extrair Apenas Páginas Específicas

```python
# Apenas páginas 1, 2 e 5
text = extractor.extract_text(pages=[1, 2, 5])
images = extractor.extract_images()  # Todas as páginas
```

### Processar PDFs Grandes

Para PDFs muito grandes, processe em partes:

```python
with PDFExtractor("grande.pdf") as ext:
    metadata = ext.get_metadata()
    total_pages = metadata['pages']
    
    # Processar em lotes de 10 páginas
    for start in range(1, total_pages + 1, 10):
        end = min(start + 9, total_pages)
        pages = list(range(start, end + 1))
        
        text = ext.extract_text(pages=pages)
        print(f"Processadas páginas {start}-{end}")
```

## Integração com Outras Ferramentas

### Enviar Texto Extraído para Análise de IA

```python
from pdf_extractor import PDFExtractor

with PDFExtractor("documento.pdf") as ext:
    text = ext.extract_text_simple()

# Agora use a API Anthropic para analisar
# (exemplo conceitual)
# response = claude.messages.create(
#     model="claude-sonnet-4-5-20250929",
#     messages=[{
#         "role": "user", 
#         "content": f"Analise este documento:\n\n{text}"
#     }]
# )
```

### Criar Dataset de Treinamento

```python
import json
from pdf_extractor import PDFExtractor
from pathlib import Path

dataset = []

for pdf_path in Path("pdfs").glob("*.pdf"):
    with PDFExtractor(pdf_path) as ext:
        text = ext.extract_text_simple()
        metadata = ext.get_metadata()
        
        dataset.append({
            "filename": pdf_path.name,
            "text": text,
            "pages": metadata["pages"],
            "title": metadata.get("title", "")
        })

with open("dataset.json", "w", encoding="utf-8") as f:
    json.dump(dataset, f, ensure_ascii=False, indent=2)
```

## Template de Uso para Claude

Quando o usuário pedir para analisar um PDF, siga este template:

```python
# 1. Localizar o PDF
pdf_path = "/mnt/user-data/uploads/nome_arquivo.pdf"

# 2. Garantir dependências
!pip install pdfplumber PyMuPDF Pillow --break-system-packages

# 3. Copiar script se necessário
!cp /home/claude/pdf_extractor.py .

# 4. Extrair conteúdo
from pdf_extractor import PDFExtractor

with PDFExtractor(pdf_path) as extractor:
    # Metadados primeiro
    metadata = extractor.get_metadata()
    print(f"📄 {metadata['filename']}")
    print(f"📊 {metadata['pages']} páginas")
    
    # Extrair tudo
    result = extractor.extract_all(
        output_dir="extracted_content",
        extract_images=True,
        extract_text=True,
        extract_tables=True
    )
    
    # Informar resultados
    print(f"\n✅ Extração concluída!")
    print(f"   📝 Texto: {len(result['text'])} páginas")
    print(f"   🖼️  Imagens: {len(result.get('images', []))}")
    print(f"   📊 Tabelas: {sum(len(t) for t in result.get('tables', {}).values())}")

# 5. Processar/analisar conforme pedido do usuário
# ...

# 6. Mover para outputs se o usuário precisar acessar
!cp -r extracted_content /mnt/user-data/outputs/
```

## Resumo Rápido

**Para extrair conteúdo de PDF:**

1. ✅ Use `pdf_extractor.py` (em `/home/claude/`)
2. 📦 Instale: `pdfplumber`, `PyMuPDF`, `Pillow`
3. 🔧 Execute via CLI ou importe como módulo
4. 📁 Conteúdo extraído vai para diretório especificado
5. 📊 JSON + TXT + Imagens organizados e prontos para análise

**O script é autônomo e pode ser copiado para qualquer ambiente Python!**
