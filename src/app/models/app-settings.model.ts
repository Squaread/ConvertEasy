export interface AppSettings {
  // Text-to-Speech
  ttsVoice: 'male' | 'female';
  ttsSpeed: number; // 0.8, 1.0, 1.2, 1.5
  
  // OCR
  ocrLanguage: 'por' | 'eng' | 'spa' | 'fra';
  ocrHighPrecision: boolean;
  
  // PDF
  pdfPageSize: 'A4' | 'Letter' | 'A3';
  pdfOrientation: 'portrait' | 'landscape';
  pdfMargins: number; // em mm
  pdfFontSize: number;
  
  // Geral
  saveHistory: boolean;
}