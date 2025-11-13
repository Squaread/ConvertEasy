import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonButton, 
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  AlertController
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { 
  downloadOutline, 
  homeOutline, 
  checkmarkCircle, 
  documentTextOutline,
  imageOutline,
  micOutline,
  shareOutline,
  eyeOutline
} from 'ionicons/icons';

// Services
import { PdfService } from '../../services/pdf';
import { OcrService } from '../../services/ocr';
import { StorageService } from '../../services/storage';

@Component({
  selector: 'app-result',
  templateUrl: './result.page.html',
  styleUrls: ['./result.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonButton, 
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    CommonModule, 
    FormsModule
  ]
})
export class ResultPage implements OnInit {
  fileName: string = 'documento';
  fileType: 'pdf' | 'txt' | 'mp3' = 'pdf';
  fileSize: number = 0;
  fileBlob: Blob | null = null;
  success: boolean = true;
  fileId: string = ''; // ID do arquivo no histórico
  extractedText: string = ''; // Para exibir preview do texto (OCR)

  constructor(
    private router: Router,
    private pdfService: PdfService,
    private ocrService: OcrService,
    private storageService: StorageService,
    private alertController: AlertController
  ) {
    addIcons({ 
      downloadOutline, 
      homeOutline, 
      checkmarkCircle,
      documentTextOutline,
      imageOutline,
      micOutline,
      shareOutline,
      eyeOutline
    });
  }

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.fileName = navigation.extras.state['fileName'] || 'documento';
      this.fileType = navigation.extras.state['fileType'] || 'pdf';
      this.fileSize = navigation.extras.state['fileSize'] || 0;
      this.fileBlob = navigation.extras.state['fileBlob'] || null;
      this.success = navigation.extras.state['success'] !== false;
      this.fileId = navigation.extras.state['fileId'] || '';

      console.log('✅ Resultado recebido:');
      console.log('   Nome:', this.fileName);
      console.log('   Tipo:', this.fileType);
      console.log('   Tamanho:', this.getFormattedSize());

      // Se for OCR, extrair texto do blob para preview
      if (this.fileType === 'txt' && this.fileBlob) {
        this.extractTextFromBlob();
      }
    } else {
      console.warn('⚠️ Nenhum resultado recebido, voltando para home');
      this.router.navigate(['/home']);
    }
  }

  /**
   * Extrair texto do blob para preview
   */
  private async extractTextFromBlob() {
    if (!this.fileBlob) return;

    try {
      const text = await this.fileBlob.text();
      this.extractedText = text;
      console.log('📝 Texto extraído para preview');
    } catch (error) {
      console.error('❌ Erro ao extrair texto:', error);
    }
  }

  /**
   * Fazer download do arquivo
   */
  downloadFile() {
    if (!this.fileBlob) {
      this.showAlert('Erro', 'Arquivo não disponível para download');
      return;
    }

    console.log('⬇️ Iniciando download:', this.fileName);

    if (this.fileType === 'pdf') {
      this.pdfService.downloadPdf(this.fileBlob, this.fileName);
    } else if (this.fileType === 'txt') {
      this.ocrService.downloadText(this.fileBlob, this.fileName);
    } else {
      // Para MP3 (caso implementado no futuro)
      this.genericDownload(this.fileBlob, this.fileName);
    }

    this.showAlert('Download Iniciado', `O arquivo ${this.fileName} está sendo baixado.`);
  }

  /**
   * Download genérico
   */
  private genericDownload(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  /**
   * Visualizar arquivo (abre em nova aba)
   */
  viewFile() {
    if (!this.fileBlob) {
      this.showAlert('Erro', 'Arquivo não disponível para visualização');
      return;
    }

    if (this.fileType === 'pdf') {
      this.pdfService.viewPdf(this.fileBlob);
    } else if (this.fileType === 'txt') {
      const url = URL.createObjectURL(this.fileBlob);
      window.open(url, '_blank');
    } else {
      this.showAlert('Aviso', 'Visualização não disponível para este tipo de arquivo');
    }
  }

  /**
   * Compartilhar arquivo (Web Share API)
   */
  async shareFile() {
    if (!this.fileBlob) {
      this.showAlert('Erro', 'Arquivo não disponível para compartilhamento');
      return;
    }

    // Verificar se o navegador suporta Web Share API
    if (!navigator.share) {
      this.showAlert('Não Suportado', 'Seu navegador não suporta compartilhamento');
      return;
    }

    try {
      const file = new File([this.fileBlob], this.fileName, { 
        type: this.fileBlob.type 
      });

      await navigator.share({
        title: 'ConvertEasy',
        text: `Arquivo convertido: ${this.fileName}`,
        files: [file]
      });

      console.log('✅ Arquivo compartilhado com sucesso');
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('❌ Erro ao compartilhar:', error);
        this.showAlert('Erro', 'Não foi possível compartilhar o arquivo');
      }
    }
  }

  /**
   * Converter outro arquivo
   */
  convertAnother() {
    this.router.navigate(['/home']);
  }

  /**
   * Ver histórico
   */
  goToHistory() {
    this.router.navigate(['/history']);
  }

  /**
   * Voltar para home
   */
  goHome() {
    this.router.navigate(['/home']);
  }

  /**
   * Obter tamanho formatado
   */
  getFormattedSize(): string {
    return this.storageService.formatFileSize(this.fileSize);
  }

  /**
   * Obter ícone do tipo de arquivo
   */
  getFileIcon(): string {
    switch (this.fileType) {
      case 'pdf': return 'document-text-outline';
      case 'txt': return 'document-outline';
      case 'mp3': return 'musical-notes-outline';
      default: return 'document-outline';
    }
  }

  /**
   * Obter cor do tipo
   */
  getFileColor(): string {
    switch (this.fileType) {
      case 'pdf': return 'pdf';
      case 'txt': return 'txt';
      case 'mp3': return 'mp3';
      default: return '';
    }
  }

  /**
   * Obter descrição do tipo
   */
  getFileTypeDescription(): string {
    switch (this.fileType) {
      case 'pdf': return 'Documento PDF';
      case 'txt': return 'Texto Extraído (OCR)';
      case 'mp3': return 'Áudio Narrado';
      default: return 'Arquivo';
    }
  }

  /**
   * Verificar se tem preview disponível
   */
  hasPreview(): boolean {
    return this.fileType === 'txt' && this.extractedText.length > 0;
  }

  /**
   * Obter preview do texto (primeiras linhas)
   */
  getTextPreview(): string {
    if (!this.extractedText) return '';
    const lines = this.extractedText.split('\n').slice(0, 10);
    return lines.join('\n') + (this.extractedText.split('\n').length > 10 ? '\n...' : '');
  }

  /**
   * Mostrar alerta
   */
  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}