import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonButtons, 
  IonIcon,
  IonButton,
  IonProgressBar,
  LoadingController,
  AlertController
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { settingsOutline, arrowBackOutline } from 'ionicons/icons';

// Services
import { StorageService } from '../../services/storage';
import { PdfService } from '../../services/pdf';
import { OcrService } from '../../services/ocr';
import { TextToSpeechService } from '../../services/text-to-speech';

@Component({
  selector: 'app-convert',
  templateUrl: './convert.page.html',
  styleUrls: ['./convert.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonButtons, 
    IonIcon,
    IonButton,
    IonProgressBar,
    CommonModule, 
    FormsModule
  ]
})
export class ConvertPage implements OnInit {
  selectedFile: File | null = null;
  fileName: string = '';
  conversionType: 'pdf' | 'ocr' | 'tts' | null = null;
  isProcessing: boolean = false;
  progress: number = 0;

  constructor(
    private router: Router,
    private pdfService: PdfService,
    private ocrService: OcrService,
    private ttsService: TextToSpeechService,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private storageService: StorageService
  ) {
    addIcons({ settingsOutline, arrowBackOutline });
  }

  ngOnInit() {
    this.loadData();
  }

  ionViewWillEnter() {
    // Atualiza toda vez que a página for exibida novamente
    this.loadData();
  }

  /**
   * Carregar dados da navegação
   */
  private loadData() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.selectedFile = navigation.extras.state['file'];
      this.fileName = navigation.extras.state['fileName'] || 'arquivo';
      this.conversionType = navigation.extras.state['conversionType'];

      console.log('📂 Arquivo recebido:', this.fileName);
      console.log('🔄 Tipo de conversão:', this.conversionType);
    } else {
      console.warn('⚠️ Nenhum arquivo recebido, voltando para home');
      // Só volta pra home se não tiver arquivo algum
      // this.router.navigate(['/home']);
    }
  }

 /**
 * Iniciar conversão
 */
async startConversion() {
  if (!this.selectedFile || !this.conversionType) {
    await this.showAlert('Erro', 'Dados de conversão não encontrados');
    return;
  }

  this.isProcessing = true;
  this.progress = 0;

  const loading = await this.loadingController.create({
    message: 'Convertendo...',
    spinner: 'crescent'
  });
  await loading.present();

  try {
    let result;

    switch (this.conversionType) {
      case 'pdf':
        result = await this.convertToPDF();
        break;
      case 'ocr':
        result = await this.convertWithOCR();
        break;
      case 'tts':
        result = await this.convertToSpeech();
        break;
      default:
        throw new Error('Tipo de conversão inválido');
    }

    await loading.dismiss();

    if (result.success && result.fileBlob) {
      // SALVAR ARQUIVO NO LOCALSTORAGE
      const historyItems = await this.storageService.getHistory();
      const lastItem = historyItems[0]; // Último item adicionado

      if (lastItem) {
        const saved = await this.storageService.saveFile(lastItem.id, result.fileBlob);
        
        if (saved) {
          console.log('💾 Arquivo salvo no localStorage para re-download');
        } else {
          console.warn('⚠️ Arquivo não foi salvo (muito grande ou erro)');
        }
      }

      // Navegar para tela de resultado
      this.router.navigate(['/result'], {
        state: {
          fileName: result.fileName,
          fileType: result.fileType,
          fileSize: result.fileSize,
          fileBlob: result.fileBlob,
          fileId: lastItem?.id, // Enviar ID para a tela de resultado
          success: true
        }
      });
    } else {
      throw new Error(result.error || 'Erro desconhecido');
    }

  } catch (error: any) {
    await loading.dismiss();
    console.error('❌ Erro na conversão:', error);
    await this.showAlert('Erro na Conversão', error.message || 'Não foi possível converter o arquivo');
    this.isProcessing = false;
  }
}

  private async convertToPDF() {
    console.log('📄 Iniciando conversão para PDF...');
    this.updateProgress(30);

    const result = await this.pdfService.fileToPdf(this.selectedFile!);
    this.updateProgress(100);
    return result;
  }

  private async convertWithOCR() {
    console.log('📷 Iniciando OCR...');
    this.updateProgress(20);

    const result = await this.ocrService.extractTextFromImage(this.selectedFile!);
    this.updateProgress(100);
    return result;
  }

  private async convertToSpeech() {
    console.log('🎤 Iniciando Text-to-Speech...');
    this.updateProgress(30);

    const text = await this.readFileAsText(this.selectedFile!);
    this.updateProgress(60);

    const fileName = this.selectedFile!.name.replace(/\.[^/.]+$/, '');
    const result = await this.ttsService.textToSpeech(text, fileName);
    this.updateProgress(100);
    return result;
  }

  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsText(file);
    });
  }

  private updateProgress(value: number) {
    this.progress = value / 100;
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  goToSettings() {
    this.router.navigate(['/settings']);
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  getConversionTypeName(): string {
    switch (this.conversionType) {
      case 'pdf': return 'PDF';
      case 'ocr': return 'OCR (Texto)';
      case 'tts': return 'Áudio (MP3)';
      default: return 'Desconhecido';
    }
  }

  getConversionIcon(): string {
    switch (this.conversionType) {
      case 'pdf': return 'document-text-outline';
      case 'ocr': return 'image-outline';
      case 'tts': return 'mic-outline';
      default: return 'help-outline';
    }
  }

  getConversionColor(): string {
    switch (this.conversionType) {
      case 'pdf': return 'pdf';
      case 'ocr': return 'txt';
      case 'tts': return 'mp3';
      default: return '';
    }
  }
}
