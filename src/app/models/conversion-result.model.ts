export interface ConversionResult {
  success: boolean;
  fileName: string;
  fileType: 'pdf' | 'txt' | 'mp3';
  fileSize: number;
  fileBlob?: Blob;
  filePath?: string;
  error?: string;
}