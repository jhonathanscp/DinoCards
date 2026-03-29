# DinoCards 🦖

Um aplicativo completo de Flashcards focado no aprendizado eficiente através da técnica de **Repetição Espaçada** (Spaced Repetition). Desenvolvido para funcionar em múltiplos ambientes, ele permite que você estude offline e sincronize seu progresso com a nuvem quando estiver conectado.

## 🚀 Principais Funcionalidades

- **Estudo Offline-First:** Estude seus decks (Subjects) e cartões (Flashcards) mesmo sem conexão à internet. O app salva o progresso localmente (IndexedDB via LocalForage).
- **Sincronização com a Nuvem:** Sincronize seus dados (Criações, Edições, Exclusões e Logs de Revisão) com o servidor assim que estiver online.
- **Repetição Espaçada:** O algoritmo integrado (baseado em Fator de Facilidade, Intervalos e Repetições) otimiza suas sessões de estudo para retenção máxima a longo prazo.
- **Multiplataforma:**
  - **Web / PWA:** Acesse diretamente do navegador ou instale como um Progressive Web App.
  - **Desktop (Electron):** Empacotado com Electron para uma experiência nativa no Windows, Mac e Linux.
- **Interface Moderna:** Desenvolvida em React com TailwindCSS, oferecendo uma experiência fluida (Single Page Application via React Router) e suporte a Tema Claro/Escuro.
- **Estatísticas e Relatórios:** Acompanhe seu progresso de aprendizado com métricas detalhadas de revisões.

## 🛠️ Tecnologias Utilizadas

### Backend (API)
- **PHP 8.2+ & Laravel 12:** Framework robusto para a construção da API REST.
- **Laravel Sanctum:** Para autenticação segura via tokens.
- **PostgreSQL / MySQL / SQLite:** Suporte flexível a banco de dados.

### Frontend
- **React 18:** Biblioteca para construção da interface de usuário.
- **Vite:** Ferramenta de build rápida e otimizada.
- **TailwindCSS:** Framework CSS utilitário para estilização rápida e responsiva.
- **Axios:** Para requisições HTTP e integração com a API.
- **LocalForage:** Wrapper para IndexedDB que gerencia o armazenamento de dados local.

### Desktop & PWA
- **Electron:** Para distribuição do aplicativo como um programa Desktop.
- **Vite PWA Plugin:** Para transformar a aplicação web em um PWA instalável.

## 📦 Estrutura do Projeto

O projeto é um monorepo onde o backend Laravel e o frontend React convivem.
- `app/`, `routes/`, `database/`: Lógica de Backend, API, Modelos (`Flashcard`, `Subject`, `ReviewLog`, `User`).
- `resources/js/`: Código fonte do Frontend em React (Páginas, Componentes, Serviços como `syncService.js` e `localDb.js`).
- `electron/` e `electron-main.cjs`: Configurações e scripts de inicialização do aplicativo Desktop com Electron.

## ⚙️ Como Executar o Projeto

### Pré-requisitos
- PHP >= 8.2
- Composer
- Node.js (v18+) e NPM/Yarn
- Banco de Dados (SQLite por padrão para ambiente de desenvolvimento)

### Instalação

1. **Clone e prepare o backend:**
   ```bash
   composer install
   cp .env.example .env
   php artisan key:generate
   php artisan migrate
   ```

2. **Prepare o frontend:**
   ```bash
   npm install
   ```

3. **Inicie o ambiente de desenvolvimento:**

   Para rodar a API (Laravel) e o Frontend (Vite) no navegador:
   ```bash
   composer run dev
   # Isso executará simultaneamente o artisan serve, a fila e o npm run dev
   ```
   Acesse a aplicação em `http://localhost:8000`.

### Executando o App Desktop (Electron)

Se você deseja testar a versão para Desktop:

1. Inicie o processo do Vite para o Electron:
   ```bash
   npm run electron:dev
   ```

### Fazendo o Build para Produção

- **Para Web / PWA:**
  ```bash
  npm run build
  ```

- **Para Desktop (Electron):**
  ```bash
  npm run electron:build
  ```
  Os instaladores gerados estarão disponíveis no diretório `release/`.

## 🔄 Sincronização

A lógica de sincronização (encontrada em `resources/js/services/syncService.js`) implementa um fluxo onde o cliente:
1. Faz o *Push* das alterações feitas offline (novos cartões, revisões feitas, etc).
2. Faz o *Pull* das atualizações mais recentes do servidor, garantindo que múltiplos dispositivos do mesmo usuário permaneçam perfeitamente atualizados.

---
Desenvolvido com ❤️ para ajudar você a aprender de forma mais eficiente!
