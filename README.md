# Agência Sites — Dashboard de Operação

Dashboard para gerenciar o fluxo de prospecção e criação de sites da agência. Integrado com o agente Kairo (WhatsApp) via Supabase.

## Stack

- **Next.js 14** com App Router
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (banco de dados + realtime)

## Fluxo

```
Kairo (WhatsApp) → coleta dados → POST no Supabase
                                         ↓
                              Dashboard atualiza em tempo real
                                         ↓
                              Badge "⚡ Preview pendente" aparece no card
                                         ↓
                              Notificação automática via WhatsApp
                                         ↓
                              Operador cria preview e envia pro lead
```

## Setup Local

### 1. Clone e instale dependências

```bash
git clone <repo>
cd agencia-sites
npm install
```

### 2. Configure as variáveis de ambiente

Copie o arquivo de exemplo:

```bash
cp .env.local.example .env.local
```

Edite `.env.local` com seus dados do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
WHATSAPP_NOTIFY_NUMBER=5511999999999
```

> `WHATSAPP_NOTIFY_NUMBER` — número no formato internacional sem `+` (ex: `5511999990000`)

### 3. Configure o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **SQL Editor** e execute o arquivo `supabase/schema.sql`
3. Copie a **URL** e a **anon key** do projeto para o `.env.local`

### 4. Rode o projeto

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## Estrutura do Projeto

```
src/
├── app/
│   ├── page.tsx              # Dashboard (Kanban)
│   ├── leads/[id]/page.tsx   # Detalhe do lead
│   └── api/notify/route.ts   # Endpoint de notificação WhatsApp
├── components/
│   ├── Header.tsx            # Cabeçalho com data e botões
│   ├── StatsRow.tsx          # 4 métricas do topo
│   ├── KanbanBoard.tsx       # Board com realtime + drag & drop
│   ├── KanbanColumn.tsx      # Coluna individual
│   └── LeadCard.tsx          # Card do lead
├── lib/
│   └── supabase.ts           # Cliente Supabase
└── types/
    └── index.ts              # Tipos TypeScript
```

---

## Integração com o Kairo

O Kairo deve fazer um `POST` diretamente na tabela `leads` do Supabase usando a **REST API** ou a **Supabase SDK**.

### Via REST API do Supabase

```bash
curl -X POST 'https://SEU_PROJECT.supabase.co/rest/v1/leads' \
  -H "apikey: SUA_ANON_KEY" \
  -H "Authorization: Bearer SUA_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Maria Silva",
    "nome_negocio": "Salão da Maria",
    "servico_principal": "Corte e coloração",
    "cor_marca": "#FF69B4",
    "site_atual": "https://salao.exemplo.com",
    "telefone": "11999990000",
    "cidade": "São Paulo",
    "nicho": "Beleza",
    "status": "aguardando_preview"
  }'
```

> Quando `status = "aguardando_preview"`, o dashboard exibe a badge **⚡ Preview pendente** no card e envia notificação automática via WhatsApp.

---

## Deploy na Vercel

### 1. Faça push para o GitHub

```bash
git init
git add .
git commit -m "feat: initial dashboard setup"
git remote add origin https://github.com/SEU_USER/agencia-sites.git
git push -u origin main
```

### 2. Importe na Vercel

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Importe o repositório do GitHub
3. Em **Environment Variables**, adicione:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `WHATSAPP_NOTIFY_NUMBER`
4. Clique em **Deploy**

### 3. Domínio personalizado (opcional)

Em **Settings → Domains** na Vercel, adicione seu domínio.

---

## Kanban — Colunas e Status

| Coluna         | Status no banco                     | Cor    |
|----------------|-------------------------------------|--------|
| Novo lead      | `novo`, `aguardando_preview`        | Azul   |
| Em negociação  | `negociacao`                        | Amarelo|
| Fechado        | `fechado`                           | Verde  |
| Entregue       | `entregue`                          | Cinza  |

Arraste os cards entre colunas para atualizar o status automaticamente.

---

## Notificação WhatsApp

Quando um lead com `status = "aguardando_preview"` é criado via Supabase Realtime:

1. O dashboard chama `POST /api/notify` com os dados do lead
2. O servidor monta a URL `https://wa.me/NUMERO?text=MENSAGEM`
3. O navegador abre o WhatsApp com a mensagem pré-preenchida para o operador

> A notificação só funciona enquanto o dashboard estiver aberto no navegador.
> Para notificações em background, use um Supabase Webhook apontando para um serviço externo (ex: n8n, Make, ou WhatsApp Business API).
