# 🖼️ MFIC — Multi-Format Image Converter

[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Privacy: 100% Client--Side](https://img.shields.io/badge/Privacy-100%25_Client--Side-emerald?style=flat-square)](#-privacidade-e-seguran%C3%A7a)

> **Ferramenta web *client-side* de alto desempenho projetada para converter e redimensionar imagens simultaneamente para múltiplos formatos e dimensões.**
>
> 🔒 **100% Privado:** Nenhum dado sai do seu navegador (zero upload para servidores).  
> ⚡ **Ultra Rápido:** Processamento acelerado via Canvas API nativa e fila streaming.  
> 📦 **Batch Export:** Download individual ou empacotamento completo em arquivo `.zip` único (JSZip).

---

## 📋 Sumário

- [Visão Geral](#-visão-geral)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Matriz de Conversão](#-matriz-de-conversão)
- [Grade de Redimensionamento](#-grade-de-redimensionamento)
- [Lógica Matemática do "Square Mode" (Letterboxing)](#-lógica-matemática-do-square-mode-letterboxing)
- [Arquitetura de Software (Modular)](#-arquitetura-de-software-modular)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Como Executar Localmente](#-como-executar-localmente)
- [Deploy no GitHub Pages](#-deploy-no-github-pages)
- [Privacidade e Gestão de Memória](#-privacidade-e-gestão-de-memória)
- [Licença](#-licença)

---

## 🌟 Visão Geral

O **MFIC (Multi-Format Image Converter)** resolve a necessidade frequente de desenvolvedores, designers e criadores de conteúdo: converter um logo ou imagem para múltiplos formatos (`.png`, `.ico`, `.jpg`, `.webp`, `.svg`) e dezenas de resoluções de ícones e tiles simultaneamente em segundos, sem pagar por APIs ou expor imagens confidenciais a serviços terceiros.

---

## 🚀 Funcionalidades Principais

- **Segurança de Lote de 90MB:** Validador em tempo real (`FileService`) que calcula e bloqueia uploads que ultrapassem 90MB no total, garantindo estabilidade de memória na aba do navegador.
- **Grade com as 11 Dimensões Padrão:** Pré-configurado com as 11 resoluções solicitadas pela especificação técnica para tiles, favicons e ícones de aplicativos (`32×32` até `310×310`), além de permitir adicionar dimensões personalizadas dinamicamente.
- **Square Mode (Letterboxing):** Centraliza imagens não quadradas sem distorcer o aspecto original, aplicando preenchimento transparente ou cor sólida customizável.
- **Codificador ICO Binário Nativo:** Geração real de arquivos `.ico` compatíveis com Windows e navegadores modernos, construindo a estrutura binária `ICONDIR` + `ICONDIRENTRY` sem bibliotecas pesadas externas.
- **Exportação Única em `.ZIP`:** Criação instantânea de pacotes comprimidos (DEFLATE nível 6) contendo todos os arquivos gerados e um `manifest.json` com metadados do lote.
- **Fila Streaming (Queue):** Processamento sequencial que não bloqueia a interface de usuário (UI) e previne estouro de RAM/GPU.
- **Alternância de Tema (Light / Dark):** Suporte completo aos modos claro e escuro com persistência no `localStorage`.

---

## 🔄 Matriz de Conversão

| Formato de Entrada (Input) | Formato de Saída (Output) | Descrição do Processamento |
| :--- | :--- | :--- |
| **PNG** | **PNG** | Exportação raster lossless com preservação total de transparência. |
| **SVG** | **SVG (Wrapper)** | Preserva coordenadas vetoriais do viewBox ou envelopa raster limpo. |
| **JPEG / JPG** | **JPEG / JPG** | Compressão ajustável (slider de 50% a 100%) com fundo sólido selecionável. |
| **ICO** | **ICO** | Container de ícone padrão Windows com payload PNG de 32-bit (RGBA). |
| **WEBP** | **WEBP** | Alta taxa de compressão para aplicações web modernas. |

---

## 📐 Grade de Redimensionamento

A ferramenta vem pré-configurada para gerar simultaneamente as 11 dimensões do PRD com um único clique:

| Dimensão (Pixels) | Categoria Padrão | Uso Recomendado |
| :---: | :---: | :--- |
| `30 × 30` | Windows | App Tile Small / Windows 10 |
| `32 × 32` | Web & Favicon | Favicon padrão para navegadores desktop |
| `44 × 44` | Windows | App List Icon / Start Menu |
| `71 × 71` | Windows | Small Tile |
| `89 × 89` | Windows | Windows Store Logo Small |
| `107 × 107` | Windows | Medium Tile / Alta Densidade |
| `128 × 128` | Web & Chrome | Chrome Web Store / PWA Icon |
| `142 × 142` | Windows | High-DPI Windows Tile |
| `150 × 150` | Windows | Windows Medium Tile |
| `284 × 284` | Windows | Windows Wide / Large Tile |
| `310 × 310` | Windows | Windows Large Tile |
| `Custom (W × H)` | Customizável | Qualquer dimensão definida pelo usuário (até 4096px) |

---

## 🧮 Lógica Matemática do "Square Mode" (Letterboxing)

O **Square Mode** garante que qualquer imagem de proporção arbitrária $(W_{\text{src}}, H_{\text{src}})$ seja adaptada para uma área quadrada ou retangular de destino $(W_{\text{target}}, H_{\text{target}})$ **sem distorção de aspecto** e **sem cortar conteúdo**.

### 1. Fator de Escala Uniforme
$$\text{scale} = \min\left(\frac{W_{\text{target}}}{W_{\text{src}}}, \frac{H_{\text{target}}}{H_{\text{src}}}\right)$$

### 2. Dimensões Finais Desenhas no Canvas
$$\text{drawWidth} = \text{round}(W_{\text{src}} \times \text{scale})$$
$$\text{drawHeight} = \text{round}(H_{\text{src}} \times \text{scale})$$

### 3. Offsets de Centralização (Padding de Letterbox)
$$\text{offsetX} = \text{round}\left(\frac{W_{\text{target}} - \text{drawWidth}}{2}\right)$$
$$\text{offsetY} = \text{round}\left(\frac{H_{\text{target}} - \text{drawHeight}}{2}\right)$$

### Exemplo Prático:
Redimensionar uma imagem horizontal de `800 × 400 px` para um tile de `150 × 150 px`:
1. $\text{scale} = \min(150 / 800, 150 / 400) = \min(0.1875, 0.375) = 0.1875$
2. $\text{drawWidth} = 800 \times 0.1875 = 150\text{ px}$
3. $\text{drawHeight} = 400 \times 0.1875 = 75\text{ px}$
4. $\text{offsetX} = (150 - 150) / 2 = 0\text{ px}$
5. $\text{offsetY} = (150 - 75) / 2 = 37.5 \approx 38\text{ px}$
*Resultado:* Imagem perfeitamente centralizada com margens simétricas de $38\text{px}$ acima e abaixo (transparentes ou na cor escolhida).

---

## 🏛️ Arquitetura de Software (Modular)

O projeto adota o **Strategy Pattern** e desacoplamento rigoroso entre a camada matemática, orquestração e interface gráfica:

```
[UI / Drag & Drop] 
        │
        ▼
[FileService] ──► Validação de Lote (Tamanho total ≤ 90MB, MIME Types e Extensões)
        │
        ▼
[CoreEngine]  ──► Fila Streaming Assíncrona (Queue)
        │
        ├──► [ResizerService] (Cálculos puros de Letterbox, Contain, Cover, Stretch)
        │
        ├──► Strategy Pattern:
        │       ├── [CanvasStrategy] (OffscreenCanvas para PNG, JPEG, WEBP)
        │       ├── [IcoStrategy]    (Header binário ICONDIR + Directory Entry)
        │       └── [SvgStrategy]    (SVG Wrapper vetorial)
        │
        ▼
[ExportService] ──► Downloads individuais ou Arquivo .ZIP unificado (JSZip + Manifest)
```

---

## 📁 Estrutura do Projeto

```text
├── .github/
│   └── workflows/
│       └── deploy.yml          # Workflow de Deploy no GitHub Pages
├── src/
│   ├── components/             # Componentes React modulares
│   │   ├── ArchitectureModal.tsx # Documentação e fórmulas embutidas na UI
│   │   ├── ConfigPanel.tsx     # Seletores de grade, formatos e square mode
│   │   ├── ConversionProgress.tsx # Barra de progresso streaming
│   │   ├── FileList.tsx        # Tabela e thumbnails dos arquivos carregados
│   │   ├── Header.tsx          # Topbar com alternância de tema e ações
│   │   ├── ResultsGallery.tsx  # Grid de resultados, inspeção e download
│   │   └── UploadZone.tsx      # Dropzone com barra de consumo de 90MB
│   ├── constants/
│   │   └── presets.ts          # Definições das 11 dimensões do PRD
│   ├── context/
│   │   └── ThemeContext.tsx    # Provedor do tema (Dark / Light / System)
│   ├── services/               # Lógica de negócio pura
│   │   ├── strategies/
│   │   │   ├── CanvasStrategy.ts
│   │   │   ├── ConversionStrategy.ts
│   │   │   ├── IcoStrategy.ts
│   │   │   └── SvgStrategy.ts
│   │   ├── CoreEngine.ts       # Orquestrador da fila de conversão
│   │   ├── ExportService.ts    # Compactação com JSZip e downloads
│   │   ├── FileService.ts      # Validador de 90MB e formato
│   │   ├── FileService.test.ts # Testes unitários do FileService
│   │   ├── ResizerService.ts   # Matemática do Square Mode
│   │   └── ResizerService.test.ts # Testes unitários de geometria
│   ├── types/
│   │   └── mfic.ts             # Interfaces TypeScript
│   ├── utils/
│   │   └── sampleImages.ts     # Gerador de imagens de teste in-browser
│   ├── App.tsx                 # Ponto de entrada da aplicação
│   ├── index.css               # Tailwind CSS v4 e variantes de tema
│   └── main.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts              # Configuração Vite com base: './'
└── README.md
```

---

## 💻 Como Executar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) versão 20 ou superior.
- Gerenciador de pacotes `npm`.

### 1. Clonar o repositório
```bash
git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
cd SEU_REPOSITORIO
```

### 2. Instalar as dependências
```bash
npm install
```

### 3. Rodar os testes unitários (Node Test Runner)
```bash
npm test
```
*Executa 11 testes automatizados cobrindo cálculos geométricos, letterbox e validação estrita do limitador de 90MB.*

### 4. Iniciar o servidor de desenvolvimento
```bash
npm run dev
```
Acesse `http://localhost:3000` no seu navegador.

### 5. Compilar para produção
```bash
npm run build
```
Os arquivos otimizados serão gerados na pasta `dist/`.

---

## 🚀 Deploy no GitHub Pages

O projeto já está configurado para deploy automático no **GitHub Pages**:

1. No arquivo `vite.config.ts`, a base relativa já está definida:
   ```typescript
   export default defineConfig({
     base: './',
     // ...
   });
   ```
2. O workflow do GitHub Actions (`.github/workflows/deploy.yml`) realiza o build e publica na branch `gh-pages` a cada push na branch `main`.
3. No seu repositório no GitHub:
   - Acesse **Settings** > **Pages**.
   - Em **Build and deployment**, selecione a branch `gh-pages` (ou **GitHub Actions**).
   - Sua aplicação estará acessível publicamente com custo zero de infraestrutura!

---

## 🛡️ Privacidade e Gestão de Memória

- **Sem Backend:** O processamento ocorre 100% no cliente utilizando `OffscreenCanvas` ou `HTMLCanvasElement`.
- **Prevenção de Memory Leak:** Todas as URLs temporárias de objetos geradas com `URL.createObjectURL()` são sistematicamente revogadas com `URL.revokeObjectURL()` após conclusão ou limpeza.
- **Barreira de 90MB:** O `FileService` rejeita lotes cuja soma em bytes exceda `94.371.840 bytes`, impedindo travamento de abas em dispositivos com baixa memória RAM.

---

## 📄 Licença

Este projeto está sob a licença [MIT](LICENSE). Sinta-se livre para usar, estudar e modificar.
