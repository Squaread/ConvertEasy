import { Injectable } from '@angular/core';
import { ConversionHistory } from '../models/conversion-history.model';
import { AppSettings } from '../models/app-settings.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly HISTORY_KEY = 'conversion_history';
  private readonly SETTINGS_KEY = 'app_settings';

  // Configurações padrão
  private defaultSettings: AppSettings = {
    ttsVoice: 'male',
    ttsSpeed: 1.0,
    ocrLanguage: 'por',
    ocrHighPrecision: true,
    pdfPageSize: 'A4',
    pdfOrientation: 'portrait',
    pdfMargins: 20,
    pdfFontSize: 12,
    saveHistory: true
  };

  constructor() {
    this.initSettings();
  }

  // ==========================================
  // INICIALIZAÇÃO
  // ==========================================

  private initSettings() {
    const settings = this.getSettings();
    if (!settings) {
      this.saveSettings(this.defaultSettings);
    }
  }

  // ==========================================
  // CONFIGURAÇÕES (SETTINGS)
  // ==========================================

  /**
   * Salvar configurações
   */
  saveSettings(settings: AppSettings): void {
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    console.log('✅ Configurações salvas:', settings);
  }

  /**
   * Recuperar configurações
   */
  getSettings(): AppSettings | null {
    const data = localStorage.getItem(this.SETTINGS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return this.defaultSettings;
  }

  /**
   * Resetar configurações
   */
  resetSettings(): void {
    this.saveSettings(this.defaultSettings);
    console.log('🔄 Configurações resetadas');
  }

  // ==========================================
  // HISTÓRICO DE CONVERSÕES
  // ==========================================

  /**
   * Adicionar item ao histórico
   */
  addToHistory(item: Omit<ConversionHistory, 'id' | 'date'>): void {
    const settings = this.getSettings();
    
    if (!settings?.saveHistory) {
      console.log('⚠️ Histórico desativado');
      return;
    }

    const history = this.getHistory();
    
    const newItem: ConversionHistory = {
      ...item,
      id: this.generateId(),
      date: new Date()
    };

    history.unshift(newItem); // Adiciona no início (mais recente primeiro)
    
    // Limitar histórico a 100 itens
    if (history.length > 100) {
      history.pop();
    }

    localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
    console.log('✅ Item adicionado ao histórico:', newItem.fileName);
  }

  /**
   * Recuperar histórico completo
   */
  getHistory(): ConversionHistory[] {
    const data = localStorage.getItem(this.HISTORY_KEY);
    if (data) {
      const history = JSON.parse(data);
      // Converter strings de data em objetos Date
      return history.map((item: any) => ({
        ...item,
        date: new Date(item.date)
      }));
    }
    return [];
  }

  /**
   * Recuperar histórico filtrado por tipo
   */
  getHistoryByType(type: 'pdf' | 'txt' | 'mp3'): ConversionHistory[] {
    const history = this.getHistory();
    return history.filter(item => item.fileType === type);
  }

  /**
   * Deletar item do histórico
   */
  deleteHistoryItem(id: string): void {
    const history = this.getHistory();
    const filtered = history.filter(item => item.id !== id);
    
    localStorage.setItem(this.HISTORY_KEY, JSON.stringify(filtered));
    console.log('🗑️ Item deletado do histórico:', id);
  }

  /**
   * Limpar todo o histórico
   */
  clearHistory(): void {
    localStorage.setItem(this.HISTORY_KEY, JSON.stringify([]));
    console.log('🧹 Histórico limpo');
  }

  /**
   * Contar itens no histórico
   */
  getHistoryCount(): number {
    return this.getHistory().length;
  }

  // ==========================================
  // UTILITÁRIOS
  // ==========================================

  /**
   * Gerar ID único
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Formatar tamanho de arquivo
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Formatar data para exibição
   */
  formatDate(date: Date): string {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const itemDate = new Date(date);
    const itemDateOnly = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());

    const time = itemDate.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    if (itemDateOnly.getTime() === today.getTime()) {
      return `Hoje, ${time}`;
    } else if (itemDateOnly.getTime() === yesterday.getTime()) {
      return `Ontem, ${time}`;
    } else {
      return itemDate.toLocaleDateString('pt-BR');
    }
  }

  /**
   * Limpar TUDO (usar com cuidado!)
   */
  clearAll(): void {
    localStorage.removeItem(this.HISTORY_KEY);
    localStorage.removeItem(this.SETTINGS_KEY);
    this.initSettings();
    console.log('⚠️ Storage completamente limpo');
  }
  // ==========================================
  // ARMAZENAMENTO DE ARQUIVOS (BLOBS)
  // ==========================================

  /**
   * Salvar arquivo (Blob) como Base64
   */
  async saveFile(id: string, blob: Blob): Promise<boolean> {
    try {
      // Verificar tamanho (máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (blob.size > maxSize) {
        console.warn('⚠️ Arquivo muito grande para salvar (máx 5MB)');
        return false;
      }

      // Converter Blob para Base64
      const base64 = await this.blobToBase64(blob);
      
      // Salvar no localStorage
      const fileKey = `file_${id}`;
      localStorage.setItem(fileKey, base64);
      
      console.log('💾 Arquivo salvo:', id, this.formatFileSize(blob.size));
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar arquivo:', error);
      return false;
    }
  }

  /**
   * Recuperar arquivo (Blob) do Base64
   */
  async getFile(id: string): Promise<Blob | null> {
    try {
      const fileKey = `file_${id}`;
      const base64 = localStorage.getItem(fileKey);
      
      if (!base64) {
        console.warn('⚠️ Arquivo não encontrado:', id);
        return null;
      }

      // Converter Base64 para Blob
      const blob = await this.base64ToBlob(base64);
      console.log('📂 Arquivo recuperado:', id);
      return blob;
    } catch (error) {
      console.error('❌ Erro ao recuperar arquivo:', error);
      return null;
    }
  }

  /**
   * Deletar arquivo salvo
   */
  deleteFile(id: string): void {
    const fileKey = `file_${id}`;
    localStorage.removeItem(fileKey);
    console.log('🗑️ Arquivo deletado:', id);
  }

  /**
   * Verificar se arquivo existe
   */
  fileExists(id: string): boolean {
    const fileKey = `file_${id}`;
    return localStorage.getItem(fileKey) !== null;
  }

  /**
   * Converter Blob para Base64
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Converter Base64 para Blob
   */
  private base64ToBlob(base64: string): Promise<Blob> {
    return new Promise((resolve) => {
      fetch(base64)
        .then(res => res.blob())
        .then(blob => resolve(blob));
    });
  }

  /**
   * Obter tamanho total usado no localStorage
   */
  getStorageSize(): string {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return this.formatFileSize(total);
  }
}