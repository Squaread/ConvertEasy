import { Injectable } from '@angular/core';
import { ConversionResult } from '../models/conversion-result.model';
import { StorageService } from './storage';

// Declaração global do ResponsiveVoice
declare var responsiveVoice: any;

@Injectable({
  providedIn: 'root'
})
export class TextToSpeechService {
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private isVoicesLoaded: boolean = false;

  constructor(private storage: StorageService) {
    this.synth = window.speechSynthesis;
    this.loadVoices();
  }

  /**
   * Carregar vozes disponíveis
   */
  private loadVoices(): void {
    this.voices = this.synth.getVoices();
    
    if (this.voices.length === 0) {
      this.synth.onvoiceschanged = () => {
        this.voices = this.synth.getVoices();
        this.isVoicesLoaded = true;
        console.log('🎤 Vozes carregadas:', this.voices.length);
      };
    } else {
      this.isVoicesLoaded = true;
      console.log('🎤 Vozes carregadas:', this.voices.length);
    }
  }

  /**
   * Converter texto para áudio (apenas reproduz por enquanto)
   * Nota: Para gerar MP3 real downloadável, seria necessário API paga
   */
  async textToSpeech(text: string, fileName: string = 'audio'): Promise<ConversionResult> {
    try {
      console.log('🎤 Iniciando conversão de texto para áudio...');

      if (!text || text.trim().length === 0) {
        throw new Error('Texto vazio');
      }

      // Aguardar vozes carregarem
      if (!this.isVoicesLoaded) {
        await this.waitForVoices();
      }

      // Recuperar configurações
      const settings = this.storage.getSettings();
      const voiceGender = settings?.ttsVoice || 'male';
      const speed = settings?.ttsSpeed || 1.0;

      // Selecionar voz
      const selectedVoice = this.selectVoice(voiceGender);

      // Criar utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = selectedVoice;
      utterance.rate = speed;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = 'pt-BR';

      // Reproduzir áudio
      await this.speakUtterance(utterance);

      // Criar um Blob "simulado" para demonstração
      // Nota: Este não é um arquivo MP3 real, apenas para fins de histórico
      const textBlob = new Blob([text], { type: 'text/plain' });
      const estimatedSize = text.length * 100;

      console.log('✅ Áudio reproduzido com sucesso!');
      console.log('⚠️ Nota: Arquivo MP3 não gerado (Web Speech API não permite download direto)');

      this.storage.addToHistory({
      fileName: `${fileName}.mp3`,
      originalFileName: fileName,
      fileType: 'mp3',
      fileSize: estimatedSize,
      status: 'success'
    });

      return {
    success: true,
    fileName: `${fileName}.mp3`,  // ← CORRIGIR PARA .mp3
    fileType: 'mp3',
    fileSize: estimatedSize,
    fileBlob: textBlob  // Salvando o texto (já que não temos áudio real)
};

    } catch (error: any) {
      console.error('❌ Erro ao converter texto para áudio:', error);

      return {
        success: false,
        fileName: `${fileName}.mp3`,
        fileType: 'mp3',
        fileSize: 0,
        error: error.message || 'Erro ao sintetizar áudio'
      };
    }
  }

  /**
   * Reproduzir texto imediatamente (preview)
   */
  speak(text: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (!text || text.trim().length === 0) {
        reject(new Error('Texto vazio'));
        return;
      }

      this.stop();

      if (!this.isVoicesLoaded) {
        await this.waitForVoices();
      }

      const settings = this.storage.getSettings();
      const voiceGender = settings?.ttsVoice || 'male';
      const speed = settings?.ttsSpeed || 1.0;

      const selectedVoice = this.selectVoice(voiceGender);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = selectedVoice;
      utterance.rate = speed;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = 'pt-BR';

      utterance.onend = () => {
        console.log('🎤 Reprodução finalizada');
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('❌ Erro na reprodução:', event);
        reject(event);
      };

      this.synth.speak(utterance);
      console.log('▶️ Reproduzindo áudio...');
    });
  }

  /**
   * Parar reprodução
   */
  stop(): void {
    if (this.synth.speaking) {
      this.synth.cancel();
      console.log('⏹️ Reprodução parada');
    }
  }

  /**
   * Pausar reprodução
   */
  pause(): void {
    if (this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
      console.log('⏸️ Reprodução pausada');
    }
  }

  /**
   * Retomar reprodução
   */
  resume(): void {
    if (this.synth.paused) {
      this.synth.resume();
      console.log('▶️ Reprodução retomada');
    }
  }

  /**
   * Verificar se está falando
   */
  isSpeaking(): boolean {
    return this.synth.speaking;
  }

  /**
   * Verificar se está pausado
   */
  isPaused(): boolean {
    return this.synth.paused;
  }

  // ==========================================
  // MÉTODOS PRIVADOS
  // ==========================================

  /**
   * Selecionar voz baseado no gênero
   */
  private selectVoice(gender: 'male' | 'female'): SpeechSynthesisVoice {
    const portugueseVoices = this.voices.filter(voice => 
      voice.lang.includes('pt-BR') || voice.lang.includes('pt')
    );

    if (portugueseVoices.length === 0) {
      console.warn('⚠️ Nenhuma voz em português encontrada');
      return this.voices[0] || null;
    }

    const genderKeywords = gender === 'female' 
      ? ['female', 'feminina', 'woman', 'luciana', 'fernanda']
      : ['male', 'masculino', 'man', 'felipe', 'ricardo'];

    let selectedVoice = portugueseVoices.find(voice =>
      genderKeywords.some(keyword => 
        voice.name.toLowerCase().includes(keyword)
      )
    );

    if (!selectedVoice) {
      selectedVoice = portugueseVoices[0];
    }

    console.log('🎤 Voz selecionada:', selectedVoice?.name);
    return selectedVoice;
  }

  /**
   * Executar utterance e aguardar finalização
   */
  private speakUtterance(utterance: SpeechSynthesisUtterance): Promise<void> {
    return new Promise((resolve, reject) => {
      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(event);
      
      this.synth.speak(utterance);
    });
  }

  /**
   * Aguardar vozes carregarem
   */
  private waitForVoices(): Promise<void> {
    return new Promise((resolve) => {
      if (this.isVoicesLoaded) {
        resolve();
        return;
      }

      const checkVoices = setInterval(() => {
        if (this.isVoicesLoaded) {
          clearInterval(checkVoices);
          resolve();
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkVoices);
        resolve();
      }, 5000);
    });
  }

  /**
   * Obter lista de vozes disponíveis
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  /**
   * Obter vozes em português
   */
  getPortugueseVoices(): SpeechSynthesisVoice[] {
    return this.voices.filter(voice =>
      voice.lang.includes('pt-BR') || voice.lang.includes('pt')
    );
  }

  /**
   * Obter informações sobre suporte do navegador
   */
  getBrowserSupport(): { supported: boolean; voiceCount: number } {
    return {
      supported: 'speechSynthesis' in window,
      voiceCount: this.voices.length
    };
  }
}