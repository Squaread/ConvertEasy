# 📱 ConvertEasy

<div align="center">
  <img src="https://img.shields.io/badge/Ionic-8.0.0-3880FF?style=for-the-badge&logo=ionic&logoColor=white" />
  <img src="https://img.shields.io/badge/Angular-18.0.0-DD0031?style=for-the-badge&logo=angular&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.4.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />
</div>

<br />

<p align="center">
  Aplicativo multiplataforma que unifica conversões de texto, documentos e áudios em uma única solução gratuita e acessível.
</p>

---

## 🎯 **Sobre o Projeto**

O **ConvertEasy** é um aplicativo mobile desenvolvido com **Ionic + Angular** que oferece três funcionalidades principais:

- 📄 **Texto → PDF**: Converta textos em documentos PDF de alta qualidade
- 📷 **Imagem → Texto (OCR)**: Extraia texto de imagens usando reconhecimento óptico
- 🎤 **Texto → Áudio (TTS)**: Ouça seus textos narrados em voz alta

### **Problema Resolvido**

Atualmente, usuários precisam de múltiplos aplicativos para realizar conversões simples. O ConvertEasy **centraliza todas essas funcionalidades** em um único app gratuito.

---

## ✨ **Funcionalidades**

### **1. Conversão de Texto para PDF**
- ✅ Geração instantânea de PDF
- ✅ Customização de tamanho de página (A4, Letter, A3)
- ✅ Configuração de margens e orientação
- ✅ Download e compartilhamento

### **2. OCR (Optical Character Recognition)**
- ✅ Extração de texto de imagens (JPG, PNG, WebP)
- ✅ Suporte a múltiplos idiomas (PT-BR, EN, ES, FR)
- ✅ Modo de alta precisão
- ✅ Preview do texto extraído

### **3. Text-to-Speech**
- ✅ Narração de textos em português
- ✅ Vozes masculinas e femininas
- ✅ Controle de velocidade de fala
- ✅ Reprodução instantânea

### **4. Histórico de Conversões**
- ✅ Registro automático de todas conversões
- ✅ Filtros por tipo (PDF, TXT, MP3)
- ✅ Re-download de arquivos salvos
- ✅ Reprodução de áudios novamente

### **5. Armazenamento Local**
- ✅ Arquivos salvos no localStorage (até 5MB)
- ✅ Funciona offline após primeiro uso
- ✅ Dados armazenados localmente

---

## 🛠️ **Tecnologias Utilizadas**

### **Framework e Linguagens**
- **Ionic 8.0** - Framework híbrido
- **Angular 18** - Framework frontend
- **TypeScript 5.4** - Linguagem de programação
- **Capacitor 6** - Acesso a APIs nativas

### **Bibliotecas e APIs**

| Funcionalidade | Biblioteca | Versão | Licença |
|----------------|-----------|--------|---------|
| Geração de PDF | jsPDF | 2.5.2 | MIT |
| OCR | Tesseract.js | 5.1.1 | Apache 2.0 |
| Text-to-Speech | Web Speech API | Nativa | W3C |
| Armazenamento | Ionic Storage | 4.0.0 | MIT |
| Câmera | Capacitor Camera | 6.0.0 | MIT |
| Filesystem | Capacitor Filesystem | 6.0.0 | MIT |

---

## 📦 **Instalação**

### **Pré-requisitos**

- Node.js 20.x ou superior
- npm 10.x ou superior
- Ionic CLI 7.x ou superior

### **Passo a Passo**
```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/converteasy.git

# 2. Entre na pasta do projeto
cd converteasy

# 3. Instale as dependências
npm install

# 4. Execute o projeto
ionic serve
```

O app abrirá automaticamente em `http://localhost:8100`

---

## 📱 **Build para Produção**

### **Web (PWA)**
```bash
ionic build --prod
```

### **Android**
```bash
# Adicionar plataforma Android
ionic capacitor add android

# Build
ionic build

# Sincronizar
npx cap sync

# Abrir no Android Studio
npx cap open android
```

### **iOS (apenas macOS)**
```bash
# Adicionar plataforma iOS
ionic capacitor add ios

# Build
ionic build

# Sincronizar
npx cap sync

# Abrir no Xcode
npx cap open ios
```

---

## 📂 **Estrutura do Projeto**
```
converteasy/
├── src/
│   ├── app/
│   │   ├── pages/              # Páginas do app
│   │   │   ├── home/
│   │   │   ├── convert/
│   │   │   ├── result/
│   │   │   └── history/
│   │   ├── services/           # Serviços (lógica)
│   │   │   ├── pdf.ts
│   │   │   ├── ocr.ts
│   │   │   ├── text-to-speech.ts
│   │   │   └── storage.ts
│   │   ├── models/             # Interfaces TypeScript
│   │   └── components/         # Componentes reutilizáveis
│   ├── assets/                 # Imagens e ícones
│   ├── global.scss             # Estilos globais
│   └── index.html              # HTML principal
├── README.md
├── package.json
└── .gitignore
```

---


## 🚀 **Roadmap**

### **v1.0.0 (Atual)**
- ✅ Conversão Texto → PDF
- ✅ OCR (Imagem → Texto)
- ✅ Text-to-Speech
- ✅ Histórico de conversões
- ✅ Armazenamento local

### **v2.0.0 (Futuro)**
- ⏳ Geração real de arquivos MP3
- ⏳ Integração com Google Cloud TTS
- ⏳ Sincronização em nuvem
- ⏳ Conversão batch (múltiplos arquivos)
- ⏳ Modo escuro (Dark Mode)
- ⏳ Exportar para Google Drive / Dropbox

---

## ⚠️ **Limitações Conhecidas**

### **Text-to-Speech**
- **Web Speech API** reproduz áudio mas não gera arquivo MP3 downloadável
- Para gerar MP3 real seria necessário integrar com API paga (Google Cloud TTS, AWS Polly)
- Atualmente salva o texto original para permitir reprodução posterior

### **Armazenamento Local**
- Limite de ~5MB por arquivo (localStorage)
- Arquivos maiores não são salvos automaticamente
- Para uso profissional, recomenda-se implementar backend com storage em nuvem

---

---

## 👨‍💻 **Autores**

**Gabriel Carvalho, Arthur Justino, Thierry Rodrigues e Matheus Souza**

**Arthur Justino**
- GitHub: [@Squaread](https://github.com/Squaread) 
**Gabriel Carvalho**
- Instagram: [@carvalhoo_gb](https://www.instagram.com/carvalhoo_gb/)
- GitHub: [@carvalhoo-gb](https://github.com/carvalhoo-gb) 
 **Thierry Rodrigues**
 Instagram: [@r0drigues_thierry] (https://www.instagram.com/r0drigues_thierry/)
 **Matheus Souza**
  Instagram: [@matheuusmd] (https://www.instagram.com/matheuusmd/)



---

## 🙏 **Agradecimentos**

- [Ionic Framework](https://ionicframework.com/)
- [Angular](https://angular.io/)
- [jsPDF](https://github.com/parallax/jsPDF)
- [Tesseract.js](https://tesseract.projectnaptha.com/)
- Comunidade Open Source

---

<div align="center">
  <p>Feito com ❤️ e ☕</p>
  <p>Se este projeto foi útil, deixe uma ⭐!</p>
</div>
```

---

## **4️⃣ CRIAR LICENSE**

### **Crie o arquivo:** `LICENSE`
```
MIT License

Copyright (c) 2025 Seu Nome

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.