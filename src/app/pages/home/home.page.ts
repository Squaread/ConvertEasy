import { Component, ViewChild, ElementRef } from '@angular/core';
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
  AlertController,
  LoadingController
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { addOutline, settingsOutline, documentTextOutline, imageOutline, micOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonButtons,
    IonIcon,
    IonButton,
    CommonModule, 
    FormsModule
  ]
})
export class HomePage {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  selectedFile: File | null = null;
  fileName: string = '';
  selectedConversionType: 'pdf' | 'ocr' | 'tts' | null = null;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {
    addIcons({ addOutline, settingsOutline, documentTextOutline, imageOutline, micOutline  });
  }

  /**
   * Abrir seletor de arquivo
   */
  selectFile() {
    this.fileInput.nativeElement.click();
  }

  /**
   * Quando arquivo for selecionado
   */
  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tamanho (10MB)
    const maxSize = 10 * 1024 * 1024;
    
    if (file.size > maxSize) {
      await this.showAlert('Arquivo muito grande', 'O arquivo deve ter no máximo 10MB.');
      return;
    }

    this.selectedFile = file;
    this.fileName = file.name;
    
    console.log('📁 Arquivo selecionado:', this.fileName);
    console.log('📊 Tamanho:', (file.size / 1024).toFixed(2) + ' KB');
    console.log('📄 Tipo:', file.type);
  }

  /**
   * Selecionar tipo de conversão
   */
  selectConversionType(type: 'pdf' | 'ocr' | 'tts') {
    this.selectedConversionType = type;
    console.log('✅ Tipo selecionado:', type);
  }

  /**
   * Ir para tela de conversão
   */
  async goToConvert() {
    // Validar se arquivo foi selecionado
    if (!this.selectedFile) {
      await this.showAlert('Arquivo não selecionado', 'Por favor, selecione um arquivo primeiro.');
      return;
    }

    // Validar se tipo de conversão foi selecionado
    if (!this.selectedConversionType) {
      await this.showAlert('Tipo não selecionado', 'Por favor, escolha o tipo de conversão (PDF, Texto ou MP3).');
      return;
    }

    // Validar compatibilidade do arquivo com o tipo de conversão
    const validation = this.validateFileForConversion(this.selectedFile, this.selectedConversionType);
    if (!validation.valid) {
      await this.showAlert('Arquivo incompatível', validation.message!);
      return;
    }

    // Navegar para tela de conversão
    this.router.navigate(['/convert'], {
      state: { 
        file: this.selectedFile,
        fileName: this.fileName,
        conversionType: this.selectedConversionType
      }
    });
  }

  /**
   * Validar se o arquivo é compatível com o tipo de conversão
   */
  private validateFileForConversion(file: File, type: 'pdf' | 'ocr' | 'tts'): { valid: boolean; message?: string } {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    switch (type) {
      case 'pdf':
        // PDF aceita texto
        if (fileType.includes('text') || fileName.endsWith('.txt')) {
          return { valid: true };
        }
        return { 
          valid: false, 
          message: 'Para converter em PDF, selecione um arquivo de texto (.txt)' 
        };

      case 'ocr':
        // OCR aceita imagens
        if (fileType.startsWith('image/')) {
          return { valid: true };
        }
        return { 
          valid: false, 
          message: 'Para OCR, selecione uma imagem (JPG, PNG, etc.)' 
        };

      case 'tts':
        // TTS aceita texto
        if (fileType.includes('text') || fileName.endsWith('.txt')) {
          return { valid: true };
        }
        return { 
          valid: false, 
          message: 'Para Text-to-Speech, selecione um arquivo de texto (.txt)' 
        };

      default:
        return { valid: false, message: 'Tipo de conversão inválido' };
    }
  }

  /**
   * Ir para configurações
   */
  goToSettings() {
    this.router.navigate(['/settings']);
  }

  /**
   * Ir para histórico
   */
  goToHistory() {
    this.router.navigate(['/history']);
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

  /**
   * Resetar seleção
   */
  reset() {
    this.selectedFile = null;
    this.fileName = '';
    this.selectedConversionType = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }
}