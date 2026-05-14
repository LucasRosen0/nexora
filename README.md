# Nexora

Plataforma corporativa de inteligência operacional para ativos de TI. Visibilidade unificada sobre dispositivos, escritórios, ciclo de vida, software e postura de risco.

## Stack

- React 19 + Vite + Tailwind CSS
- React Router 7, Recharts, Framer Motion, Lucide
- PapaParse para import/export CSV
- API local Express (Node.js) servindo dados sintéticos

## Pré-requisitos

- Node.js 18 ou superior

## Instalação

```bash
npm install
cd server && npm install && cd ..
```

## Execução em desenvolvimento

Em dois terminais:

```bash
# Terminal 1 — API local (porta 3000)
npm run server

# Terminal 2 — Vite (porta 5173, com proxy para 3000)
npm run dev
```

Acesse `http://localhost:5173`.

## Build de produção

```bash
npm run build
npm run server
```

O servidor Express servirá automaticamente o conteúdo de `dist/`.

## Acesso de demonstração

A autenticação local de exemplo está pré-configurada:

- **Email:** `admin@nexora.com`
- **Senha:** `123456`

A sessão é mantida por 8 horas em `localStorage`.

## Fonte de dados

A versão atual utiliza dados sintéticos em `data/mock-data.json` carregados pela API Express. Conexões com banco de dados externo estão previstas em versão futura — a opção aparece em **Configurações → Fonte de dados** apenas como referência visual.

## Estrutura

```
src/
├── components/   componentes de marca, layout, UI e assistente
├── pages/        Login, Overview, Devices, Locations, Analytics, Reports, Settings
├── store/        Auth, Theme, I18n, Devices, Notes (React Context)
├── i18n/         dicionários pt-BR e en
├── lib/          api, csv, ai, format
└── styles/       app.css com 5 temas corporativos

server/           API Express local (mock)
data/             mock-data.json
```
