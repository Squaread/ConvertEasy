import { Injectable } from '@angular/core';
import { createWorker, Worker } from 'tesseract.js';
import { ConversionResult } from '../models/conversion-result.model';
import { StorageService } from './storage';

@Injectable({
  providedIn: 'root'
})
export class OcrService {
  private worker: Worker | null = null;
  private isInitialized: boolean = false;

  constructor(private storage: StorageService) {}

  /**
   * Inicializar o worker do Tesseract
   */
  private async initializeWorker(): Promise<void> {
    if (this.isInitialized && this.worker) {
      return;
    }

    console.log('🔧 Inicializando OCR...');

    try {
      const settings = this.storage.getSettings();
      const language = settings?.ocrLanguage || 'por';

      this.worker = await createWorker(language, 1, {
        logger: (m) => {
          // Log do progresso (opcional)
          if (m.status === 'recognizing text') {
            console.log(`OCR Progresso: ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      this.isInitialized = true;
      console.log('✅ OCR inicializado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao inicializar OCR:', error);
      throw error;
    }
  }

  /**
   * Extrair texto de imagem (File)
   */
  async extractTextFromImage(imageFile: File): Promise<ConversionResult> {
    try {
      console.log('📷 Iniciando OCR na imagem...');

      // Validar tipo de arquivo
      if (!imageFile.type.startsWith('image/')) {
        throw new Error('Arquivo não é uma imagem válida');
      }

      // Inicializar worker se necessário
      await this.initializeWorker();

      if (!this.worker) {
        throw new Error('Worker do OCR não inicializado');
      }

      // Converter imagem para URL
      const imageUrl = URL.createObjectURL(imageFile);

      // Executar OCR
      const { data } = await this.worker.recognize(imageUrl);
      
      // Limpar URL temporária
      URL.revokeObjectURL(imageUrl);

      const extractedText = data.text.trim();

      if (!extractedText) {
        throw new Error('Nenhum texto encontrado na imagem');
      }

      // Criar blob de texto
      const textBlob = new Blob([extractedText], { type: 'text/plain' });
      const textSize = textBlob.size;

      // Nome do arquivo sem extensão
      const originalName = imageFile.name.replace(/\.[^/.]+$/, '');
      const fileName = `${originalName}_ocr.txt`;

      // Salvar no histórico
      this.storage.addToHistory({
        fileName: fileName,
        originalFileName: imageFile.name,
        fileType: 'txt',
        fileSize: textSize,
        status: 'success'
      });

      console.log('✅ OCR concluído com sucesso!');
      console.log('📝 Texto extraído:', extractedText.substring(0, 100) + '...');
      console.log('📊 Tamanho:', this.storage.formatFileSize(textSize));

      return {
        success: true,
        fileName: fileName,
        fileType: 'txt',
        fileSize: textSize,
        fileBlob: textBlob
      };

    } catch (error: any) {
      console.error('❌ Erro no OCR:', error);

      return {
        success: false,
        fileName: imageFile.name,
        fileType: 'txt',
        fileSize: 0,
        error: error.message || 'Erro ao processar imagem'
      };
    }
  }

  /**
   * Extrair texto de URL de imagem
   */
  async extractTextFromUrl(imageUrl: string): Promise<string> {
    try {
      await this.initializeWorker();

      if (!this.worker) {
        throw new Error('Worker do OCR não inicializado');
      }

      const { data } = await this.worker.recognize(imageUrl);
      return data.text.trim();

    } catch (error: any) {
      console.error('❌ Erro ao processar URL:', error);
      throw error;
    }
  }

  /**
   * Extrair texto de base64
   */
  async extractTextFromBase64(base64Image: string): Promise<string> {
    try {
      await this.initializeWorker();

      if (!this.worker) {
        throw new Error('Worker do OCR não inicializado');
      }

      const { data } = await this.worker.recognize(base64Image);
      return data.text.trim();

    } catch (error: any) {
      console.error('❌ Erro ao processar base64:', error);
      throw error;
    }
  }

  /**
   * Obter idiomas suportados
   */
  getSupportedLanguages(): { code: string; name: string }[] {
    return [
      { code: 'por', name: 'Português (Brasil)' },
      { code: 'eng', name: 'Inglês' },
      { code: 'spa', name: 'Espanhol' },
      { code: 'fra', name: 'Francês' },
      { code: 'ita', name: 'Italiano' },
      { code: 'deu', name: 'Alemão' }
    ];
  }

  /**
   * Alterar idioma do OCR
   */
  async changeLanguage(languageCode: string): Promise<void> {
    console.log('🔄 Alterando idioma do OCR para:', languageCode);
    
    // Finalizar worker atual
    await this.terminate();
    
    // Atualizar configurações
    const settings = this.storage.getSettings();
    if (settings) {
      settings.ocrLanguage = languageCode as any;
      this.storage.saveSettings(settings);
    }
    
    // Reinicializar com novo idioma
    await this.initializeWorker();
  }

  /**
   * Fazer download do texto extraído
   */
  downloadText(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    
    setTimeout(() => URL.revokeObjectURL(url), 100);
    console.log('⬇️ Download do texto iniciado:', fileName);
  }

  /**
   * Obter confiança do OCR (precisão)
   */
  async getConfidence(imageFile: File): Promise<number> {
    try {
      await this.initializeWorker();

      if (!this.worker) {
        return 0;
      }

      const imageUrl = URL.createObjectURL(imageFile);
      const { data } = await this.worker.recognize(imageUrl);
      URL.revokeObjectURL(imageUrl);

      return data.confidence;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Finalizar worker (liberar memória)
   */
  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
      console.log('🛑 OCR worker finalizado');
    }
  }

  /**
   * Verificar se está processando
   */
  isProcessing(): boolean {
    return this.isInitialized && this.worker !== null;
  }
}