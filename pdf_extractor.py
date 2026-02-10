#!/usr/bin/env python3
"""
PDF Content Extractor - Script reutilizável para extrair texto e imagens de PDFs
Otimizado para análise em ambientes como Google Colab, Jupyter, ou scripts Python.

Uso:
    python pdf_extractor.py arquivo.pdf [--output-dir saida] [--extract-images] [--extract-text]
    
Ou importar como módulo:
    from pdf_extractor import PDFExtractor
    extractor = PDFExtractor("arquivo.pdf")
    text = extractor.extract_text()
    images = extractor.extract_images()
"""

import os
import sys
import argparse
from pathlib import Path
from typing import List, Dict, Tuple, Optional
import json

# Bibliotecas para extração de PDF
try:
    import pdfplumber
    import fitz  # PyMuPDF
    from PIL import Image
    import io
except ImportError as e:
    print(f"⚠️  Erro ao importar bibliotecas: {e}")
    print("📦 Instale as dependências:")
    print("   pip install pdfplumber PyMuPDF Pillow --break-system-packages")
    sys.exit(1)


class PDFExtractor:
    """Extrator de conteúdo de PDFs com suporte a texto e imagens."""
    
    def __init__(self, pdf_path: str):
        """
        Inicializa o extrator com um arquivo PDF.
        
        Args:
            pdf_path: Caminho para o arquivo PDF
        """
        self.pdf_path = Path(pdf_path)
        if not self.pdf_path.exists():
            raise FileNotFoundError(f"PDF não encontrado: {pdf_path}")
        
        self.pdf_doc = None
        self.pdfplumber_pdf = None
        
    def __enter__(self):
        """Context manager entry."""
        self.pdf_doc = fitz.open(self.pdf_path)
        self.pdfplumber_pdf = pdfplumber.open(self.pdf_path)
        return self
        
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        if self.pdf_doc:
            self.pdf_doc.close()
        if self.pdfplumber_pdf:
            self.pdfplumber_pdf.close()
    
    def get_metadata(self) -> Dict:
        """
        Extrai metadados do PDF.
        
        Returns:
            Dicionário com metadados (título, autor, páginas, etc.)
        """
        if not self.pdf_doc:
            self.pdf_doc = fitz.open(self.pdf_path)
        
        metadata = self.pdf_doc.metadata or {}
        
        return {
            'filename': self.pdf_path.name,
            'pages': len(self.pdf_doc),
            'title': metadata.get('title', ''),
            'author': metadata.get('author', ''),
            'subject': metadata.get('subject', ''),
            'creator': metadata.get('creator', ''),
            'producer': metadata.get('producer', ''),
            'creation_date': metadata.get('creationDate', ''),
            'modification_date': metadata.get('modDate', ''),
        }
    
    def extract_text(self, pages: Optional[List[int]] = None) -> Dict[int, str]:
        """
        Extrai texto do PDF usando pdfplumber (melhor para layout e tabelas).
        
        Args:
            pages: Lista de números de páginas (1-indexed) ou None para todas
            
        Returns:
            Dicionário {número_da_página: texto}
        """
        if not self.pdfplumber_pdf:
            self.pdfplumber_pdf = pdfplumber.open(self.pdf_path)
        
        text_by_page = {}
        total_pages = len(self.pdfplumber_pdf.pages)
        
        if pages is None:
            pages = range(1, total_pages + 1)
        
        for page_num in pages:
            if page_num < 1 or page_num > total_pages:
                continue
            
            page = self.pdfplumber_pdf.pages[page_num - 1]
            text = page.extract_text() or ""
            text_by_page[page_num] = text
        
        return text_by_page
    
    def extract_text_simple(self) -> str:
        """
        Extrai todo o texto do PDF em uma única string.
        
        Returns:
            Texto completo do PDF
        """
        text_dict = self.extract_text()
        return "\n\n--- Página {} ---\n\n".join(
            f"{page_num}\n{text}" for page_num, text in sorted(text_dict.items())
        )
    
    def extract_tables(self, pages: Optional[List[int]] = None) -> Dict[int, List]:
        """
        Extrai tabelas do PDF.
        
        Args:
            pages: Lista de números de páginas (1-indexed) ou None para todas
            
        Returns:
            Dicionário {número_da_página: [tabelas]}
        """
        if not self.pdfplumber_pdf:
            self.pdfplumber_pdf = pdfplumber.open(self.pdf_path)
        
        tables_by_page = {}
        total_pages = len(self.pdfplumber_pdf.pages)
        
        if pages is None:
            pages = range(1, total_pages + 1)
        
        for page_num in pages:
            if page_num < 1 or page_num > total_pages:
                continue
            
            page = self.pdfplumber_pdf.pages[page_num - 1]
            tables = page.extract_tables()
            if tables:
                tables_by_page[page_num] = tables
        
        return tables_by_page
    
    def extract_images(
        self, 
        output_dir: Optional[Path] = None,
        min_width: int = 100,
        min_height: int = 100
    ) -> List[Dict]:
        """
        Extrai imagens do PDF usando PyMuPDF.
        
        Args:
            output_dir: Diretório para salvar imagens (None = não salva)
            min_width: Largura mínima da imagem em pixels
            min_height: Altura mínima da imagem em pixels
            
        Returns:
            Lista de dicionários com info das imagens extraídas
        """
        if not self.pdf_doc:
            self.pdf_doc = fitz.open(self.pdf_path)
        
        if output_dir:
            output_dir = Path(output_dir)
            output_dir.mkdir(parents=True, exist_ok=True)
        
        images_info = []
        
        for page_num in range(len(self.pdf_doc)):
            page = self.pdf_doc[page_num]
            image_list = page.get_images(full=True)
            
            for img_index, img_info in enumerate(image_list):
                xref = img_info[0]
                
                # Extrai a imagem
                base_image = self.pdf_doc.extract_image(xref)
                image_bytes = base_image["image"]
                image_ext = base_image["ext"]
                
                # Abre a imagem para verificar dimensões
                img = Image.open(io.BytesIO(image_bytes))
                width, height = img.size
                
                # Filtra imagens muito pequenas (provavelmente logos/ícones)
                if width < min_width or height < min_height:
                    continue
                
                # Prepara informações da imagem
                img_filename = f"page_{page_num + 1}_img_{img_index + 1}.{image_ext}"
                
                img_data = {
                    'page': page_num + 1,
                    'index': img_index + 1,
                    'width': width,
                    'height': height,
                    'format': image_ext,
                    'filename': img_filename,
                    'xref': xref
                }
                
                # Salva se output_dir foi especificado
                if output_dir:
                    img_path = output_dir / img_filename
                    with open(img_path, "wb") as img_file:
                        img_file.write(image_bytes)
                    img_data['path'] = str(img_path)
                else:
                    # Mantém os bytes em memória
                    img_data['bytes'] = image_bytes
                
                images_info.append(img_data)
        
        return images_info
    
    def extract_all(
        self, 
        output_dir: Optional[Path] = None,
        extract_images: bool = True,
        extract_text: bool = True,
        extract_tables: bool = True
    ) -> Dict:
        """
        Extrai todo o conteúdo do PDF.
        
        Args:
            output_dir: Diretório para salvar resultados
            extract_images: Se deve extrair imagens
            extract_text: Se deve extrair texto
            extract_tables: Se deve extrair tabelas
            
        Returns:
            Dicionário com todo o conteúdo extraído
        """
        result = {
            'metadata': self.get_metadata(),
        }
        
        if extract_text:
            result['text'] = self.extract_text()
            
        if extract_tables:
            result['tables'] = self.extract_tables()
        
        if extract_images:
            result['images'] = self.extract_images(output_dir=output_dir)
        
        # Salva JSON com metadados
        if output_dir:
            output_dir = Path(output_dir)
            output_dir.mkdir(parents=True, exist_ok=True)
            
            # Salva texto completo
            if extract_text:
                text_file = output_dir / "extracted_text.txt"
                with open(text_file, 'w', encoding='utf-8') as f:
                    for page_num, text in sorted(result['text'].items()):
                        f.write(f"\n\n{'='*80}\n")
                        f.write(f"PÁGINA {page_num}\n")
                        f.write(f"{'='*80}\n\n")
                        f.write(text)
            
            # Salva informações em JSON (sem os bytes das imagens)
            metadata_file = output_dir / "extraction_info.json"
            json_result = {
                'metadata': result['metadata'],
                'text_pages': list(result.get('text', {}).keys()) if extract_text else [],
                'tables_pages': list(result.get('tables', {}).keys()) if extract_tables else [],
                'images_count': len(result.get('images', [])) if extract_images else 0,
                'images': [
                    {k: v for k, v in img.items() if k != 'bytes'} 
                    for img in result.get('images', [])
                ] if extract_images else []
            }
            
            with open(metadata_file, 'w', encoding='utf-8') as f:
                json.dump(json_result, f, indent=2, ensure_ascii=False)
        
        return result


def main():
    """Função principal para uso via linha de comando."""
    parser = argparse.ArgumentParser(
        description="Extrai texto e imagens de arquivos PDF",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos de uso:
  # Extrai tudo para um diretório
  python pdf_extractor.py documento.pdf --output-dir saida
  
  # Extrai apenas texto
  python pdf_extractor.py documento.pdf --extract-text --no-extract-images
  
  # Extrai apenas imagens
  python pdf_extractor.py documento.pdf --extract-images --no-extract-text --output-dir imagens
        """
    )
    
    parser.add_argument(
        'pdf_file',
        help='Arquivo PDF para processar'
    )
    
    parser.add_argument(
        '-o', '--output-dir',
        default='pdf_extracted',
        help='Diretório de saída (padrão: pdf_extracted)'
    )
    
    parser.add_argument(
        '--extract-text',
        action='store_true',
        default=True,
        help='Extrair texto (padrão: sim)'
    )
    
    parser.add_argument(
        '--no-extract-text',
        action='store_false',
        dest='extract_text',
        help='Não extrair texto'
    )
    
    parser.add_argument(
        '--extract-images',
        action='store_true',
        default=True,
        help='Extrair imagens (padrão: sim)'
    )
    
    parser.add_argument(
        '--no-extract-images',
        action='store_false',
        dest='extract_images',
        help='Não extrair imagens'
    )
    
    parser.add_argument(
        '--extract-tables',
        action='store_true',
        default=True,
        help='Extrair tabelas (padrão: sim)'
    )
    
    parser.add_argument(
        '--min-width',
        type=int,
        default=100,
        help='Largura mínima de imagem em pixels (padrão: 100)'
    )
    
    parser.add_argument(
        '--min-height',
        type=int,
        default=100,
        help='Altura mínima de imagem em pixels (padrão: 100)'
    )
    
    args = parser.parse_args()
    
    # Verifica se o arquivo existe
    if not os.path.exists(args.pdf_file):
        print(f"❌ Erro: Arquivo não encontrado: {args.pdf_file}")
        sys.exit(1)
    
    print(f"📄 Processando: {args.pdf_file}")
    print(f"📁 Diretório de saída: {args.output_dir}")
    print()
    
    # Extrai conteúdo
    try:
        with PDFExtractor(args.pdf_file) as extractor:
            result = extractor.extract_all(
                output_dir=Path(args.output_dir),
                extract_images=args.extract_images,
                extract_text=args.extract_text,
                extract_tables=args.extract_tables
            )
        
        # Mostra resumo
        print("✅ Extração concluída!")
        print()
        print("📊 Resumo:")
        print(f"   • Título: {result['metadata']['title'] or 'N/A'}")
        print(f"   • Páginas: {result['metadata']['pages']}")
        
        if args.extract_text:
            print(f"   • Páginas com texto: {len(result['text'])}")
        
        if args.extract_tables:
            tables_count = sum(len(tables) for tables in result.get('tables', {}).values())
            print(f"   • Tabelas encontradas: {tables_count}")
        
        if args.extract_images:
            print(f"   • Imagens extraídas: {len(result['images'])}")
        
        print()
        print(f"📁 Arquivos salvos em: {args.output_dir}/")
        
        if args.extract_text:
            print(f"   • extracted_text.txt - Texto completo")
        
        print(f"   • extraction_info.json - Metadados e informações")
        
        if args.extract_images and result['images']:
            print(f"   • {len(result['images'])} arquivos de imagem")
            
    except Exception as e:
        print(f"❌ Erro ao processar PDF: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
