import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { ConversionResult } from '../models/conversion-result.model';
import { StorageService } from './storage';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor(private storage: StorageService) {}

  /**
   * Converter texto para PDF
   */
  async textToPdf(text: string, fileName: string = 'documento'): Promise<ConversionResult> {
    try {
      console.log('📄 Iniciando conversão para PDF...');

      // Recuperar configurações
      const settings = this.storage.getSettings();
      
      // Criar novo documento PDF
      const doc = new jsPDF({
        orientation: settings?.pdfOrientation || 'portrait',
        unit: 'mm',
        format: this.getPageFormat(settings?.pdfPageSize || 'A4')
      });

      // Configurações da página
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = settings?.pdfMargins || 20;
      const fontSize = settings?.pdfFontSize || 12;
      const lineHeight = fontSize * 0.4;
      const maxWidth = pageWidth - (margin * 2);

      // Configurar fonte
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', 'normal');

      // Dividir texto em linhas respeitando a largura
      const lines = doc.splitTextToSize(text, maxWidth);

      let y = margin;
      
      // Adicionar texto ao PDF (com quebra de página automática)
      for (let i = 0; i < lines.length; i++) {
        // Verificar se precisa de nova página
        if (y + lineHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }

        doc.text(lines[i], margin, y);
        y += lineHeight;
      }

      // Gerar blob do PDF
      const pdfBlob = doc.output('blob');
      const pdfSize = pdfBlob.size;

      // Salvar no histórico
      this.storage.addToHistory({
        fileName: `${fileName}.pdf`,
        originalFileName: fileName,
        fileType: 'pdf',
        fileSize: pdfSize,
        status: 'success'
      });

      console.log('✅ PDF gerado com sucesso!');
      console.log('📊 Tamanho:', this.storage.formatFileSize(pdfSize));

      return {
        success: true,
        fileName: `${fileName}.pdf`,
        fileType: 'pdf',
        fileSize: pdfSize,
        fileBlob: pdfBlob
      };

    } catch (error: any) {
      console.error('❌ Erro ao gerar PDF:', error);
      
      return {
        success: false,
        fileName: `${fileName}.pdf`,
        fileType: 'pdf',
        fileSize: 0,
        error: error.message || 'Erro desconhecido ao gerar PDF'
      };
    }
  }

  /**
   * Converter arquivo de texto para PDF
   */
  async fileToPdf(file: File): Promise<ConversionResult> {
    try {
      console.log('📄 Convertendo arquivo para PDF...');

      // Ler conteúdo do arquivo
      const text = await this.readFileAsText(file);
      
      // Usar nome original do arquivo (sem extensão)
      const fileName = file.name.replace(/\.[^/.]+$/, '');

      // Converter para PDF
      return await this.textToPdf(text, fileName);

    } catch (error: any) {
      console.error('❌ Erro ao converter arquivo:', error);
      
      return {
        success: false,
        fileName: file.name,
        fileType: 'pdf',
        fileSize: 0,
        error: error.message || 'Erro ao ler arquivo'
      };
    }
  }

  /**
   * Fazer download do PDF
   */
  downloadPdf(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    
    // Limpar URL após download
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    console.log('⬇️ Download iniciado:', fileName);
  }

  /**
   * Visualizar PDF em nova aba
   */
  viewPdf(blob: Blob): void {
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    console.log('👁️ PDF aberto em nova aba');
  }

  // ==========================================
  // UTILITÁRIOS PRIVADOS
  // ==========================================

  /**
   * Ler arquivo como texto
   */
  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      
      reader.onerror = (e) => {
        reject(new Error('Erro ao ler arquivo'));
      };
      
      reader.readAsText(file);
    });
  }

  /**
   * Converter nome da página para formato jsPDF
   */
  private getPageFormat(size: string): [number, number] | string {
    const formats: { [key: string]: [number, number] | string } = {
      'A4': 'a4',
      'A3': 'a3',
      'Letter': 'letter'
    };
    
    return formats[size] || 'a4';
  }

  /**
   * Criar PDF com múltiplas colunas (recurso extra)
   */
  async createMultiColumnPdf(text: string, columns: number = 2): Promise<ConversionResult> {
    // Implementação futura para layout mais avançado
    return await this.textToPdf(text);
  }
}