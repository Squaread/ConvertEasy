import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonCard,
  IonCardContent,
  IonItem,
  IonList,
  AlertController
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { 
  arrowBackOutline,
  trashOutline,
  downloadOutline,
  documentTextOutline,
  imageOutline,
  musicalNotesOutline,
  timeOutline,
  folderOpenOutline,
  playCircleOutline
} from 'ionicons/icons';

// Services
import { StorageService } from '../../services/storage';
import { ConversionHistory } from '../../models/conversion-history.model';
import { PdfService } from '../../services/pdf';
import { OcrService } from '../../services/ocr';
import { TextToSpeechService } from '../../services/text-to-speech';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonCard,
    IonCardContent,
    IonItem,
    IonList,
    CommonModule,
    FormsModule
  ]
})
export class HistoryPage implements OnInit {
  allHistory: ConversionHistory[] = [];
  filteredHistory: ConversionHistory[] = [];
  selectedFilter: 'all' | 'pdf' | 'txt' | 'mp3' = 'all';
  isEmpty: boolean = false;

  constructor(
    private router: Router,
    private storageService: StorageService,
    private alertController: AlertController,
    private pdfService: PdfService,      
    private ocrService: OcrService ,
    private ttsService: TextToSpeechService
  ) {
    addIcons({
      arrowBackOutline,
      trashOutline,
      downloadOutline,
      documentTextOutline,
      imageOutline,
      musicalNotesOutline,
      timeOutline,
      folderOpenOutline,
      playCircleOutline  
    });
  }

  ngOnInit() {
    this.loadHistory();
  }

  ionViewWillEnter() {
    // Recarregar histórico sempre que entrar na página
    this.loadHistory();
  }

  /**
   * Carregar histórico
   */
  async loadHistory() {
    this.allHistory = await this.storageService.getHistory();
    this.applyFilter(this.selectedFilter);
    this.isEmpty = this.allHistory.length === 0;
    
    console.log('📚 Histórico carregado:', this.allHistory.length, 'itens');
  }

  /**
   * Aplicar filtro
   */
  applyFilter(filter: 'all' | 'pdf' | 'txt' | 'mp3') {
    this.selectedFilter = filter;

    if (filter === 'all') {
      this.filteredHistory = [...this.allHistory];
    } else {
      this.filteredHistory = this.allHistory.filter(item => item.fileType === filter);
    }

    console.log(`🔍 Filtro aplicado: ${filter} - ${this.filteredHistory.length} resultados`);
  }

/**
 * Deletar item do histórico
 */
async deleteItem(item: ConversionHistory, event: Event) {
  event.stopPropagation();

  const alert = await this.alertController.create({
    header: 'Confirmar Exclusão',
    message: `Deseja realmente excluir "${item.fileName}"?`,
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel'
      },
      {
        text: 'Excluir',
        role: 'destructive',
        handler: async () => {
          // Deletar arquivo salvo também
          this.storageService.deleteFile(item.id);
          
          // Deletar do histórico
          await this.storageService.deleteHistoryItem(item.id);
          await this.loadHistory();
          console.log('🗑️ Item e arquivo excluídos:', item.fileName);
        }
      }
    ]
  });

  await alert.present();
}

  /**
   * Limpar todo o histórico
   */
  async clearAllHistory() {
    const alert = await this.alertController.create({
      header: 'Limpar Histórico',
      message: 'Deseja excluir TODOS os itens do histórico? Esta ação não pode ser desfeita.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Limpar Tudo',
          role: 'destructive',
          handler: async () => {
            await this.storageService.clearHistory();
            await this.loadHistory();
            console.log('🧹 Histórico limpo completamente');
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Abrir detalhes do item
   */
  openItem(item: ConversionHistory) {
    console.log('📂 Abrindo item:', item.fileName);
    // Aqui você pode implementar visualização ou re-download
    this.showItemDetails(item);
  }

  /**
   * Mostrar detalhes do item
   */
  private async showItemDetails(item: ConversionHistory) {
    const alert = await this.alertController.create({
      header: item.fileName,
      message: `
        <strong>Tipo:</strong> ${item.fileType.toUpperCase()}<br>
        <strong>Tamanho:</strong> ${this.storageService.formatFileSize(item.fileSize)}<br>
        <strong>Data:</strong> ${this.storageService.formatDate(item.date)}<br>
        <strong>Status:</strong> ${item.status === 'success' ? '✓ Sucesso' : '✗ Erro'}
      `,
      buttons: ['Fechar']
    });

    await alert.present();
  }

  /**
   * Voltar para home
   */
  goBack() {
    this.router.navigate(['/home']);
  }

  /**
   * Obter ícone do tipo de arquivo
   */
  getFileIcon(type: string): string {
    switch (type) {
      case 'pdf': return 'document-text-outline';
      case 'txt': return 'document-outline';
      case 'mp3': return 'musical-notes-outline';
      default: return 'document-outline';
    }
  }

  /**
   * Obter cor do tipo
   */
  getFileColor(type: string): string {
    switch (type) {
      case 'pdf': return 'pdf';
      case 'txt': return 'txt';
      case 'mp3': return 'mp3';
      default: return '';
    }
  }

  /**
   * Formatar data
   */
  formatDate(date: Date): string {
    return this.storageService.formatDate(date);
  }

  /**
   * Formatar tamanho
   */
  formatSize(bytes: number): string {
    return this.storageService.formatFileSize(bytes);
  }

  /**
   * Contar itens por tipo
   */
  getCountByType(type: 'pdf' | 'txt' | 'mp3'): number {
    return this.allHistory.filter(item => item.fileType === type).length;
  }
  /**
 * Re-baixar arquivo do histórico
 */
async reDownloadFile(item: ConversionHistory, event: Event) {
  event.stopPropagation(); // Evitar abrir detalhes

  console.log('⬇️ Tentando re-baixar:', item.fileName);

  // Verificar se arquivo existe no localStorage
  const fileExists = this.storageService.fileExists(item.id);

  if (!fileExists) {
    const alert = await this.alertController.create({
      header: 'Arquivo não disponível',
      message: 'Este arquivo não está mais salvo no dispositivo. Ele pode ter sido muito grande ou foi limpo do cache.',
      buttons: ['OK']
    });
    await alert.present();
    return;
  }

  // Recuperar arquivo
  const fileBlob = await this.storageService.getFile(item.id);

  if (!fileBlob) {
    const alert = await this.alertController.create({
      header: 'Erro',
      message: 'Não foi possível recuperar o arquivo.',
      buttons: ['OK']
    });
    await alert.present();
    return;
  }

  // Fazer download
  if (item.fileType === 'pdf') {
    this.pdfService.downloadPdf(fileBlob, item.fileName);
  } else if (item.fileType === 'txt') {
    this.ocrService.downloadText(fileBlob, item.fileName);
  } else if (item.fileType === 'mp3') {
    // Download genérico para MP3
    const url = URL.createObjectURL(fileBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = item.fileName;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  console.log('✅ Re-download iniciado:', item.fileName);

  const alert = await this.alertController.create({
    header: 'Download Iniciado',
    message: `O arquivo ${item.fileName} está sendo baixado novamente.`,
    buttons: ['OK']
  });
  await alert.present();
}

/**
 * Verificar se arquivo está salvo
 */
isFileSaved(item: ConversionHistory): boolean {
  return this.storageService.fileExists(item.id);
}

/**
 * Reproduzir áudio novamente
 */
async playAudio(item: ConversionHistory, event: Event) {
  event.stopPropagation(); // Evitar abrir detalhes

  console.log('🔊 Reproduzindo áudio:', item.fileName);

  // Verificar se arquivo existe no localStorage
  const fileExists = this.storageService.fileExists(item.id);

  if (!fileExists) {
    const alert = await this.alertController.create({
      header: 'Texto não disponível',
      message: 'O texto original não está mais salvo no dispositivo.',
      buttons: ['OK']
    });
    await alert.present();
    return;
  }

  // Recuperar arquivo (que contém o texto)
  const fileBlob = await this.storageService.getFile(item.id);

  if (!fileBlob) {
    const alert = await this.alertController.create({
      header: 'Erro',
      message: 'Não foi possível recuperar o texto.',
      buttons: ['OK']
    });
    await alert.present();
    return;
  }

  try {
    // Ler o texto do Blob
    const text = await fileBlob.text();

    // Mostrar loading
    const loading = await this.alertController.create({
      header: 'Reproduzindo...',
      message: 'O áudio está sendo reproduzido.',
      buttons: [
        {
          text: 'Parar',
          handler: () => {
            this.ttsService.stop();
          }
        }
      ]
    });
    await loading.present();

    // Reproduzir o áudio
    await this.ttsService.speak(text);

    // Fechar loading quando terminar
    await loading.dismiss();

    console.log('✅ Reprodução finalizada');

  } catch (error) {
    console.error('❌ Erro ao reproduzir:', error);
    
    const alert = await this.alertController.create({
      header: 'Erro na reprodução',
      message: 'Não foi possível reproduzir o áudio.',
      buttons: ['OK']
    });
    await alert.present();
  }
}

/**
 * Verificar se está reproduzindo
 */
isPlaying(): boolean {
  return this.ttsService.isSpeaking();
}
}