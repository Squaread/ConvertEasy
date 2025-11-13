export interface ConversionHistory {
  id: string;
  fileName: string;
  originalFileName: string;
  fileType: 'pdf' | 'txt' | 'mp3';
  fileSize: number;
  date: Date;
  status: 'success' | 'error';
}